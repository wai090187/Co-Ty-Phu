/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import {
  Player,
  Tile,
  GameSettings,
  SpecialInvestigatorState,
  Card,
} from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import {
  ALL_INVESTIGATOR_ABILITIES,
  pickNextInvestigatorAbility,
} from '../../../data/investigatorAbilities';

interface InvestigatorContext {
  settings: GameSettings;
  currentRound: number;
  tiles: Tile[];
  players: Player[];
  chanceDeck: Card[];
  chestDeck: Card[];
  investigator: SpecialInvestigatorState;
  setInvestigator: React.Dispatch<React.SetStateAction<SpecialInvestigatorState>>;
  isInvestigatorTurn: boolean;
  setIsInvestigatorTurn: (v: boolean) => void;
  isInvestigatorMoving: boolean;
  setIsInvestigatorMoving: (v: boolean) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  setAiActionModalInfo: (info: any) => void;
  setDice: (d: [number, number]) => void;
  onInvestigatorTurnComplete: () => void;
}

export const useInvestigatorTurn = (ctx: InvestigatorContext) => {
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (!ctx.isInvestigatorTurn || isExecutingRef.current) return;
    if (!ctx.settings.enableSpecialInvestigator) {
      ctx.setIsInvestigatorTurn(false);
      ctx.onInvestigatorTurnComplete();
      return;
    }

    isExecutingRef.current = true;

    // 1. Roll dice
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const totalSteps = d1 + d2;
    ctx.setDice([d1, d2]);
    sounds.rollDice();

    ctx.addLog(
      `🕵️‍♂️ [ĐIỀU TRA VIÊN] Bắt đầu lượt tuần tra, tung được [${d1}][${d2}] (Tổng: ${totalSteps} bước)`,
      'ability'
    );

    // 2. Step-by-step movement
    let remainingSteps = totalSteps;
    ctx.setIsInvestigatorMoving(true);

    const speedMap = { slow: 360, normal: 200, fast: 100 };
    const stepInterval = speedMap[ctx.settings.moveSpeed as 'slow' | 'normal' | 'fast'] || 200;

    const moveTimer = setInterval(() => {
      remainingSteps -= 1;

      ctx.setInvestigator(prev => {
        const oldPos = prev.position;
        const newPos = (oldPos + 1) % 40;
        sounds.step();

        let laps = prev.lapsCompleted;
        let currentAbilityId = prev.currentAbilityId;
        let usedAbilityIds = [...prev.usedAbilityIds];

        // Đi qua hoặc dừng trúng Trạm Khởi Hành (ô 0)
        if (newPos === 0) {
          laps += 1;
          const cycleRounds = Math.max(1, ctx.settings.investigatorAbilityChangeRounds || 1);
          if (laps % cycleRounds === 0) {
            const next = pickNextInvestigatorAbility(usedAbilityIds);
            currentAbilityId = next.ability.id;
            usedAbilityIds = next.nextUsedIds;

            sounds.ability();
            ctx.addLog(
              `✨ [ĐIỀU TRA VIÊN - ĐỔI NĂNG LỰC] Đã đi qua Khởi Hành (${laps} vòng)! Kích hoạt năng lực ngẫu nhiên mới: [${next.ability.name}] - ${next.ability.shortDesc}`,
              'ability'
            );
          }
        }

        return {
          ...prev,
          position: newPos,
          lapsCompleted: laps,
          currentAbilityId,
          usedAbilityIds,
          lastDiceRoll: [d1, d2],
        };
      });

      if (remainingSteps <= 0) {
        clearInterval(moveTimer);
        ctx.setIsInvestigatorMoving(false);

        // 3. Resolve landing ability
        setTimeout(() => {
          ctx.setInvestigator(currentInv => {
            const landedTile = ctx.tiles[currentInv.position];
            const activeAbility =
              ALL_INVESTIGATOR_ABILITIES.find(a => a.id === currentInv.currentAbilityId) ||
              ALL_INVESTIGATOR_ABILITIES[0];

            ctx.addLog(
              `🕵️‍♂️ [ĐIỀU TRA VIÊN] Dừng chân tại [${landedTile.name}]. Thi triển năng lực: [${activeAbility.name}]`,
              'ability'
            );

            // Execute ability on players and tile
            ctx.setPlayers(prevPlayers => {
              const nextPlayers = prevPlayers.map(p => ({ ...p }));
              const activeSurvivors = nextPlayers.filter(p => !p.bankrupt);
              const invPos = currentInv.position;

              switch (activeAbility.id) {
                // 1. Bồi thường oan sai (+100đ)
                case 'inv_compensate_neighbor': {
                  const targetPlayers = activeSurvivors.filter(
                    p =>
                      p.position === invPos ||
                      (p.position + 1) % 40 === invPos ||
                      (p.position - 1 + 40) % 40 === invPos
                  );
                  if (targetPlayers.length === 0) {
                    ctx.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để nhận bồi thường oan sai.`,
                      'info'
                    );
                  } else {
                    targetPlayers.forEach(tp => {
                      tp.cash += 100;
                      ctx.triggerCashTransfer(0, [tp.id], 100, 'Bồi thường oan sai (+100đ)');
                      ctx.addLog(
                        `🎁 [Bồi Thường Oan Sai] Điều Tra Viên bồi thường tặng ${tp.name} 100đ vì kết tội sai quy trình!`,
                        'money'
                      );
                    });
                    sounds.cash();
                  }
                  break;
                }

                // 2. Thu tiền hối lộ (-100đ)
                case 'inv_extort_bribe': {
                  const targetPlayers = activeSurvivors.filter(
                    p =>
                      p.position === invPos ||
                      (p.position + 1) % 40 === invPos ||
                      (p.position - 1 + 40) % 40 === invPos
                  );
                  if (targetPlayers.length === 0) {
                    ctx.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để thu tiền hối lộ.`,
                      'info'
                    );
                  } else {
                    targetPlayers.forEach(tp => {
                      const bribe = Math.min(tp.cash, 100);
                      tp.cash -= bribe;
                      ctx.triggerCashTransfer(tp.id, [], bribe, 'Thu tiền hối lộ (-100đ)');
                      ctx.addLog(
                        `💼 [Thu Tiền Hối Lộ] Điều Tra Viên thu của ${tp.name} ${bribe}đ tiền hối lộ để bỏ qua vi phạm!`,
                        'money'
                      );
                    });
                    sounds.cash();
                  }
                  break;
                }

                // 3. Bắt giữ khẩn cấp (vào tù)
                case 'inv_jail_same_tile': {
                  const playersOnTile = activeSurvivors.filter(p => p.position === invPos && !p.inJail);
                  if (playersOnTile.length === 0) {
                    ctx.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô với Điều Tra Viên để bắt giữ.`,
                      'info'
                    );
                  } else {
                    playersOnTile.forEach(p => {
                      p.position = 10;
                      p.inJail = true;
                      p.jailTurns = 0;
                      ctx.addLog(
                        `🚨 [Bắt Giữ Khẩn Cấp] Điều Tra Viên bắt quả tang ${p.name} tại ô [${landedTile.name}], áp giải tống giam vào tù ngay lập tức!`,
                        'jail'
                      );
                    });
                    sounds.jail();
                  }
                  break;
                }

                // 4. Lấy của giàu chia cho nghèo (200đ)
                case 'inv_robin_hood': {
                  const sortedRichest = [...activeSurvivors].sort((a, b) => b.cash - a.cash);
                  const richest = sortedRichest[0];
                  const poorest = [...activeSurvivors].sort((a, b) => a.cash - b.cash)[0];

                  if (
                    richest &&
                    poorest &&
                    richest.id !== poorest.id &&
                    (invPos === richest.position || invPos === poorest.position)
                  ) {
                    const transferAmt = Math.min(richest.cash, 200);
                    richest.cash -= transferAmt;
                    poorest.cash += transferAmt;
                    ctx.triggerCashTransfer(
                      richest.id,
                      [poorest.id],
                      transferAmt,
                      'Lấy của giàu chia cho người nghèo (200đ)'
                    );
                    ctx.addLog(
                      `⚖️ [Lấy Của Giàu Chia Cho Nghèo] Điều Tra Viên đứng cùng ô với ${
                        invPos === richest.position ? richest.name : poorest.name
                      }, thu 200đ từ người giàu nhất (${richest.name}) chia lại cho người nghèo nhất (${poorest.name})!`,
                      'money'
                    );
                    sounds.cash();
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người giàu nhất (${richest?.name}) hay người nghèo nhất (${poorest?.name}).`,
                      'info'
                    );
                  }
                  break;
                }

                // 5. Cưỡng chế phá dỡ sai phạm (>2 căn)
                case 'inv_demolish_houses': {
                  if (landedTile.type === 'property') {
                    const owner = nextPlayers.find(p => p.propertiesOwned.includes(landedTile.id));
                    const houses = owner?.houses[landedTile.id] || 0;
                    if (owner && houses > 2) {
                      owner.houses[landedTile.id] = houses - 1;
                      sounds.buildHouse();
                      ctx.addLog(
                        `🔨 [Cưỡng Chế Phá Dỡ] Điều Tra Viên phát hiện ô đất [${landedTile.name}] của ${owner.name} xây dựng vượt phép (${houses} căn), tiến hành cưỡng chế phá sập 1 cấp nhà (còn ${houses - 1} căn)!`,
                        'property'
                      );
                    } else {
                      ctx.addLog(
                        `🕵️‍♂️ Ô đất [${landedTile.name}] có ${houses} căn nhà (không lớn hơn 2 căn), không bị cưỡng chế phá dỡ.`,
                        'info'
                      );
                    }
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Ô [${landedTile.name}] không phải là ô đất bất động sản.`,
                      'info'
                    );
                  }
                  break;
                }

                // 6. Thanh tra khen thưởng (+50đ)
                case 'inv_audit_reward': {
                  if (landedTile.type === 'property') {
                    const owner = nextPlayers.find(p => p.propertiesOwned.includes(landedTile.id));
                    if (owner) {
                      owner.cash += 50;
                      ctx.triggerCashTransfer(0, [owner.id], 50, 'Thanh tra khen thưởng (+50đ)');
                      ctx.addLog(
                        `⭐ [Thanh Tra Khen Thưởng] Điều Tra Viên kiểm toán ô [${landedTile.name}], khen thưởng chủ sở hữu ${owner.name} +50đ!`,
                        'money'
                      );
                      sounds.cash();
                    } else {
                      ctx.addLog(
                        `🕵️‍♂️ Ô đất [${landedTile.name}] chưa có chủ sở hữu, không ai nhận thưởng.`,
                        'info'
                      );
                    }
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Ô [${landedTile.name}] không phải ô đất bất động sản.`,
                      'info'
                    );
                  }
                  break;
                }

                // 7. Thanh tra xử phạt (-50đ)
                case 'inv_audit_fine': {
                  if (landedTile.type === 'property') {
                    const owner = nextPlayers.find(p => p.propertiesOwned.includes(landedTile.id));
                    if (owner) {
                      const fine = Math.min(owner.cash, 50);
                      owner.cash -= fine;
                      ctx.triggerCashTransfer(owner.id, [], fine, 'Thanh tra xử phạt (-50đ)');
                      ctx.addLog(
                        `📋 [Thanh Tra Xử Phạt] Điều Tra Viên phát hiện vi phạm trật tự tại [${landedTile.name}], xử phạt chủ đất ${owner.name} -${fine}đ!`,
                        'money'
                      );
                      sounds.cash();
                    } else {
                      ctx.addLog(
                        `🕵️‍♂️ Ô đất [${landedTile.name}] chưa có chủ sở hữu, không xử phạt ai.`,
                        'info'
                      );
                    }
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Ô [${landedTile.name}] không phải ô đất bất động sản.`,
                      'info'
                    );
                  }
                  break;
                }

                // 8. Thu thuế toàn dân & Phúc lợi tứ góc
                case 'inv_tax_or_corner': {
                  if (landedTile.type === 'tax') {
                    const taxAmt = landedTile.taxAmount || 100;
                    activeSurvivors.forEach(p => {
                      const actual = Math.min(p.cash, taxAmt);
                      p.cash -= actual;
                      ctx.triggerCashTransfer(p.id, [], actual, 'Truy thu thuế toàn dân');
                    });
                    ctx.addLog(
                      `🏛️ [Truy Thu Thuế Toàn Dân] Điều Tra Viên dừng tại ô [${landedTile.name}], truy thu thuế ${taxAmt}đ từ tất cả người chơi!`,
                      'money'
                    );
                    sounds.cash();
                  } else if ([0, 10, 20, 30].includes(landedTile.id)) {
                    activeSurvivors.forEach(p => {
                      p.cash += 50;
                      ctx.triggerCashTransfer(0, [p.id], 50, 'Phúc lợi tứ góc (+50đ)');
                    });
                    ctx.addLog(
                      `🎉 [Phúc Lợi Tứ Góc] Điều Tra Viên dừng tại ô góc [${landedTile.name}], phát trợ cấp 50đ cho tất cả người chơi!`,
                      'money'
                    );
                    sounds.cash();
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Ô [${landedTile.name}] không phải ô Thuế hay ô Góc, không thu thuế/phát trợ cấp.`,
                      'info'
                    );
                  }
                  break;
                }

                // 9. Đại án tư pháp (Bắt người giàu / Thả tù nhân)
                case 'inv_jail_master': {
                  if (landedTile.id === 30) {
                    const richest = [...activeSurvivors]
                      .filter(p => !p.inJail)
                      .sort((a, b) => b.cash - a.cash)[0];
                    if (richest) {
                      richest.position = 10;
                      richest.inJail = true;
                      richest.jailTurns = 0;
                      sounds.jail();
                      ctx.addLog(
                        `🚨 [Đại Án Tham Nhũng] Điều Tra Viên dừng chân tại ô Bị Bắt, phát lệnh bắt giam người giàu nhất phòng (${richest.name}) vào tù!`,
                        'jail'
                      );
                    }
                  } else if (landedTile.id === 10) {
                    const jailedPlayers = activeSurvivors.filter(p => p.inJail);
                    if (jailedPlayers.length > 0) {
                      jailedPlayers.forEach(p => {
                        p.inJail = false;
                        p.jailTurns = 0;
                      });
                      sounds.ability();
                      ctx.addLog(
                        `🕊️ [Đại Xá Tù Nhân] Điều Tra Viên ghé thăm tù, ký lệnh phóng thích toàn bộ tù nhân (${jailedPlayers.map(p => p.name).join(', ')}) được tự do ngay lập tức!`,
                        'jail'
                      );
                    } else {
                      ctx.addLog(`🕵️‍♂️ Hiện không có ai trong tù để phóng thích.`, 'info');
                    }
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Ô [${landedTile.name}] không phải ô Bị Bắt hay ô Thăm Tù.`,
                      'info'
                    );
                  }
                  break;
                }

                // 10. Biến cố khí vận toàn dân
                case 'inv_draw_cards_all': {
                  if (landedTile.type === 'chance' || landedTile.type === 'chest') {
                    const deckType = landedTile.type;
                    const deck = deckType === 'chance' ? ctx.chanceDeck : ctx.chestDeck;
                    const available = deck.filter(c => (c.quantity ?? 1) > 0);
                    const pool = available.length > 0 ? available : deck;

                    activeSurvivors.forEach(p => {
                      const drawn =
                        pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
                      if (drawn) {
                        ctx.addLog(
                          `🃏 [Biến Cố Khí Vận] ${p.name} bốc được lá [${drawn.title}: ${drawn.description}] từ lệnh kiểm toán của Điều Tra Viên!`,
                          'ability'
                        );
                        // Apply immediate monetary action if simple
                        if (drawn.actionType === 'cash_bonus' && drawn.value) {
                          p.cash += drawn.value;
                          ctx.triggerCashTransfer(0, [p.id], drawn.value, drawn.title);
                        } else if (drawn.actionType === 'cash_penalty' && drawn.value) {
                          const penalty = Math.min(p.cash, drawn.value);
                          p.cash -= penalty;
                          ctx.triggerCashTransfer(p.id, [], penalty, drawn.title);
                        }
                      }
                    });
                    sounds.ability();
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Ô [${landedTile.name}] không phải ô Cơ Hội hay Khí Vận.`,
                      'info'
                    );
                  }
                  break;
                }

                // 11. Cấp phép quy hoạch: Nâng cấp nhà tự do
                case 'inv_allow_house_upgrade': {
                  const sameTilePlayers = activeSurvivors.filter(p => p.position === landedTile.id);
                  if (sameTilePlayers.length > 0) {
                    sameTilePlayers.forEach(p => {
                      const upgradableTiles = p.propertiesOwned
                        .map(tId => ctx.tiles[tId])
                        .filter(t => t && t.type === 'property' && (p.houses[t.id] || 0) < 5);

                      const affordable = upgradableTiles.filter(
                        t => p.cash >= (t.houseCost || 50)
                      );

                      if (affordable.length > 0) {
                        // Pick property with fewest houses or highest cost
                        const targetTile = [...affordable].sort(
                          (a, b) => (p.houses[a.id] || 0) - (p.houses[b.id] || 0)
                        )[0];
                        const cost = targetTile.houseCost || 50;
                        p.cash -= cost;
                        p.houses[targetTile.id] = (p.houses[targetTile.id] || 0) + 1;
                        sounds.buildHouse();
                        ctx.triggerCashTransfer(
                          p.id,
                          [],
                          cost,
                          `Nâng cấp nhà [${targetTile.name}] theo lệnh Điều Tra Viên`
                        );
                        ctx.addLog(
                          `🏗️ [Cấp Phép Quy Hoạch] Điều Tra Viên đứng cùng ô với ${p.name}, cho phép ${p.name} nâng cấp 1 căn nhà trên [${targetTile.name}] với giá ${cost}đ (Hiện có ${p.houses[targetTile.id]} nhà)!`,
                          'ability'
                        );
                      } else {
                        ctx.addLog(
                          `🕵️‍♂️ ${p.name} đứng cùng ô với Điều Tra Viên nhưng không có ô đất hợp lệ hoặc không đủ tiền nâng cấp nhà.`,
                          'info'
                        );
                      }
                    });
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người chơi nào để cấp phép nâng cấp nhà.`,
                      'info'
                    );
                  }
                  break;
                }

                // 12. Tái điều tiết đất đai (chống độc quyền)
                case 'inv_redistribute_land_poorest': {
                  const playersWithLand = activeSurvivors.filter(
                    p => (p.propertiesOwned?.length || 0) > 0
                  );
                  const mostLandPlayer = [...playersWithLand].sort(
                    (a, b) =>
                      b.propertiesOwned.length - a.propertiesOwned.length || b.cash - a.cash
                  )[0];
                  const leastLandPlayer = [...activeSurvivors].sort(
                    (a, b) =>
                      a.propertiesOwned.length - b.propertiesOwned.length || a.cash - b.cash
                  )[0];

                  const onSameTile =
                    (mostLandPlayer && mostLandPlayer.position === landedTile.id) ||
                    (leastLandPlayer && leastLandPlayer.position === landedTile.id);

                  if (
                    onSameTile &&
                    mostLandPlayer &&
                    leastLandPlayer &&
                    mostLandPlayer.id !== leastLandPlayer.id &&
                    mostLandPlayer.propertiesOwned.length > leastLandPlayer.propertiesOwned.length
                  ) {
                    // Find property of mostLandPlayer with lowest base price
                    const cheapestTile = mostLandPlayer.propertiesOwned
                      .map(tId => ctx.tiles[tId])
                      .filter(Boolean)
                      .sort((a, b) => (a.price || 0) - (b.price || 0))[0];

                    if (cheapestTile) {
                      const cost = cheapestTile.price || 100;
                      if (leastLandPlayer.cash >= cost) {
                        leastLandPlayer.cash -= cost;
                        mostLandPlayer.cash += cost;
                        ctx.triggerCashTransfer(
                          leastLandPlayer.id,
                          [mostLandPlayer.id],
                          cost,
                          `Tái điều tiết đất đai [${cheapestTile.name}]`
                        );

                        // Transfer ownership and demolish all houses to vacant
                        mostLandPlayer.propertiesOwned = mostLandPlayer.propertiesOwned.filter(
                          id => id !== cheapestTile.id
                        );
                        delete mostLandPlayer.houses[cheapestTile.id];
                        delete mostLandPlayer.mortgaged[cheapestTile.id];

                        leastLandPlayer.propertiesOwned.push(cheapestTile.id);
                        leastLandPlayer.houses[cheapestTile.id] = 0; // Đất bị phá hết nhà, chỉ còn đất trống

                        sounds.ability();
                        ctx.addLog(
                          `🏛️ [Tái Điều Tiết Đất Đai] Điều Tra Viên đứng cùng ô người sở hữu đất! Người ít đất nhất (${leastLandPlayer.name}) mua lại ô đất [${cheapestTile.name}] từ đại gia đất ${mostLandPlayer.name} với giá gốc ${cost}đ (toàn bộ nhà bị cưỡng chế phá sập về đất trống)!`,
                          'ability'
                        );
                      } else {
                        ctx.addLog(
                          `🏛️ [Tái Điều Tiết Đất Đai] ${leastLandPlayer.name} không đủ ${cost}đ để mua lại [${cheapestTile.name}] từ ${mostLandPlayer.name}.`,
                          'info'
                        );
                      }
                    }
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Điều Tra Viên không đứng cùng ô người có nhiều đất nhất hoặc ít đất nhất, hoặc không có sự chênh lệch đất đai.`,
                      'info'
                    );
                  }
                  break;
                }

                // 13. Đặc quyền giao dịch: Mua đất trống hoặc bán giá gấp đôi
                case 'inv_buy_vacant_or_double_sell': {
                  const sameTilePlayers = activeSurvivors.filter(p => p.position === landedTile.id);
                  if (sameTilePlayers.length > 0) {
                    const allOwned = new Set(
                      activeSurvivors.flatMap(p => p.propertiesOwned || [])
                    );
                    const vacantProperties = ctx.tiles.filter(
                      t => t.type === 'property' && !allOwned.has(t.id)
                    );

                    sameTilePlayers.forEach(p => {
                      const affordableVacant = vacantProperties.filter(
                        t => p.cash >= (t.price || 0)
                      );
                      const ownedTiles = p.propertiesOwned
                        .map(tId => ctx.tiles[tId])
                        .filter(Boolean);

                      // If affordable vacant exists and player has decent cash -> Buy vacant land!
                      if (affordableVacant.length > 0 && p.cash >= 350) {
                        const targetVacant = affordableVacant[0];
                        p.cash -= targetVacant.price || 0;
                        p.propertiesOwned.push(targetVacant.id);
                        sounds.purchase();
                        ctx.addLog(
                          `🏙️ [Đặc Quyền Giao Dịch] ${p.name} đứng cùng ô với Điều Tra Viên, được phê chuẩn mua lô đất trống [${targetVacant.name}] với giá gốc ${targetVacant.price}đ!`,
                          'ability'
                        );
                      }
                      // Else if player owns properties -> Sell 1 property to bank at 2x price!
                      else if (ownedTiles.length > 0) {
                        const sellTile = ownedTiles[0];
                        const basePrice = sellTile.price || 0;
                        const houseCost =
                          (p.houses[sellTile.id] || 0) * (sellTile.houseCost || 50);
                        const totalInvested = basePrice + houseCost;
                        const payout = totalInvested * 2;

                        p.cash += payout;
                        p.propertiesOwned = p.propertiesOwned.filter(id => id !== sellTile.id);
                        delete p.houses[sellTile.id];
                        delete p.mortgaged[sellTile.id];

                        sounds.cash();
                        ctx.triggerCashTransfer(
                          0,
                          [p.id],
                          payout,
                          `Nhà Nước thu hồi đất [${sellTile.name}] giá gấp đôi`
                        );
                        ctx.addLog(
                          `💰 [Đặc Quyền Giao Dịch] ${p.name} đứng cùng ô với Điều Tra Viên, bán lại lô đất [${sellTile.name}] cho Nhà Nước với GIÁ GẤP ĐÔI (${payout}đ)! (Tiền gốc mua đất ${basePrice}đ + nhà ${houseCost}đ = ${totalInvested}đ × 2)`,
                          'money'
                        );
                      } else {
                        ctx.addLog(
                          `🕵️‍♂️ ${p.name} đứng cùng ô với Điều Tra Viên nhưng không có tiền mua đất trống và cũng không có đất để bán.`,
                          'info'
                        );
                      }
                    });
                  } else {
                    ctx.addLog(
                      `🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người chơi nào để thực hiện giao dịch đặc quyền.`,
                      'info'
                    );
                  }
                  break;
                }
              }

              return nextPlayers;
            });

            // Show announcement modal
            ctx.setAiActionModalInfo({
              aiPlayer: {
                id: 99,
                name: 'Điều Tra Viên Đặc Biệt',
                characterId: 'cong-tu',
                color: '#1e293b',
              } as any,
              title: `🕵️‍♂️ Tuần Tra: ${activeAbility.name}`,
              message: `Điều Tra Viên vừa dừng tại [${landedTile.name}]. ${activeAbility.description}`,
              type: 'skill',
            });

            // 4. Conclude turn
            setTimeout(() => {
              isExecutingRef.current = false;
              ctx.setIsInvestigatorTurn(false);
              ctx.onInvestigatorTurnComplete();
            }, 1200);

            return currentInv;
          });
        }, 300);
      }
    }, stepInterval);

    return () => {
      clearInterval(moveTimer);
    };
  }, [ctx]);
};
