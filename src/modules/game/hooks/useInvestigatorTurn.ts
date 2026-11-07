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
import { INITIAL_PERMANENT_ABILITIES } from '../../../data/abilities';

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
  setActiveDrawnCard?: (c: Card | null) => void;
  setDice: (d: [number, number]) => void;
  onInvestigatorTurnComplete: () => void;
}

export const useInvestigatorTurn = (ctx: InvestigatorContext) => {
  const isExecutingRef = useRef(false);
  const moveTimerRef = useRef<any>(null);
  const safetyTimerRef = useRef<any>(null);
  const ctxRef = useRef<InvestigatorContext>(ctx);

  // Keep latest context reference without triggering effect re-execution
  ctxRef.current = ctx;

  useEffect(() => {
    if (!ctx.isInvestigatorTurn) {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      isExecutingRef.current = false;
      return;
    }

    if (isExecutingRef.current) return;

    if (!ctxRef.current.settings.enableSpecialInvestigator) {
      isExecutingRef.current = false;
      ctxRef.current.setIsInvestigatorTurn(false);
      ctxRef.current.onInvestigatorTurnComplete();
      return;
    }

    isExecutingRef.current = true;

    // Safety fallback timer: If anything hangs for over 15 seconds, force unblock
    safetyTimerRef.current = setTimeout(() => {
      if (isExecutingRef.current) {
        console.warn('⚠️ [Điều Tra Viên] Kích hoạt cơ chế an toàn giải phóng lượt');
        if (moveTimerRef.current) clearInterval(moveTimerRef.current);
        isExecutingRef.current = false;
        ctxRef.current.setIsInvestigatorMoving(false);
        ctxRef.current.setIsInvestigatorTurn(false);
        ctxRef.current.onInvestigatorTurnComplete();
      }
    }, 15000);

    // 1. Roll dice
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const totalSteps = d1 + d2;
    ctxRef.current.setDice([d1, d2]);
    sounds.rollDice();

    ctxRef.current.addLog(
      `🕵️‍♂️ [ĐIỀU TRA VIÊN] Bắt đầu lượt tuần tra, tung được [${d1}][${d2}] (Tổng: ${totalSteps} bước)`,
      'ability'
    );

    // 2. Step-by-step movement
    let remainingSteps = totalSteps;
    ctxRef.current.setIsInvestigatorMoving(true);

    const speedMap = { slow: 360, normal: 200, fast: 100 };
    const stepInterval =
      speedMap[ctxRef.current.settings.moveSpeed as 'slow' | 'normal' | 'fast'] || 200;

    moveTimerRef.current = setInterval(() => {
      remainingSteps -= 1;

      ctxRef.current.setInvestigator(prev => {
        const oldPos = prev.position;
        const newPos = (oldPos + 1) % 40;
        sounds.step();

        let laps = prev.lapsCompleted;
        let currentAbilityId = prev.currentAbilityId;
        let usedAbilityIds = [...prev.usedAbilityIds];

        // Đi qua hoặc dừng trúng Trạm Khởi Hành (ô 0)
        if (newPos === 0) {
          laps += 1;
          const cycleRounds = Math.max(
            1,
            ctxRef.current.settings.investigatorAbilityChangeRounds || 1
          );
          if (laps % cycleRounds === 0) {
            const next = pickNextInvestigatorAbility(usedAbilityIds);
            currentAbilityId = next.ability.id;
            usedAbilityIds = next.nextUsedIds;

            sounds.ability();
            ctxRef.current.addLog(
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
        clearInterval(moveTimerRef.current);
        ctxRef.current.setIsInvestigatorMoving(false);

        // 3. Resolve landing ability
        setTimeout(() => {
          ctxRef.current.setInvestigator(currentInv => {
            const landedTile = ctxRef.current.tiles[currentInv.position];
            const activeAbility =
              ALL_INVESTIGATOR_ABILITIES.find(a => a.id === currentInv.currentAbilityId) ||
              ALL_INVESTIGATOR_ABILITIES[0];

            ctxRef.current.addLog(
              `🕵️‍♂️ [ĐIỀU TRA VIÊN] Dừng chân tại [${landedTile.name}]. Thi triển năng lực: [${activeAbility.name}]`,
              'ability'
            );

            // Execute ability on players and tile
            ctxRef.current.setPlayers(prevPlayers => {
              const nextPlayers = prevPlayers.map(p => ({
                ...p,
                propertiesOwned: [...(p.propertiesOwned || [])],
                permanentAbilities: [...(p.permanentAbilities || [])],
                consumableAbilities: [...(p.consumableAbilities || [])],
                houses: { ...(p.houses || {}) },
                mortgaged: { ...(p.mortgaged || {}) },
              }));
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
                    ctxRef.current.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để nhận bồi thường oan sai.`,
                      'info'
                    );
                  } else {
                    targetPlayers.forEach(tp => {
                      tp.cash += 100;
                      ctxRef.current.triggerCashTransfer(
                        0,
                        [tp.id],
                        100,
                        'Bồi thường oan sai (+100đ)'
                      );
                      ctxRef.current.addLog(
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
                    ctxRef.current.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để thu tiền hối lộ.`,
                      'info'
                    );
                  } else {
                    targetPlayers.forEach(tp => {
                      const bribe = Math.min(tp.cash, 100);
                      tp.cash -= bribe;
                      ctxRef.current.triggerCashTransfer(
                        tp.id,
                        [],
                        bribe,
                        'Thu tiền hối lộ (-100đ)'
                      );
                      ctxRef.current.addLog(
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
                  const playersOnTile = activeSurvivors.filter(
                    p => p.position === invPos && !p.inJail
                  );
                  if (playersOnTile.length === 0) {
                    ctxRef.current.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô với Điều Tra Viên để bắt giữ.`,
                      'info'
                    );
                  } else {
                    playersOnTile.forEach(p => {
                      p.position = 10;
                      p.inJail = true;
                      p.jailTurns = 0;
                      ctxRef.current.addLog(
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
                    ctxRef.current.triggerCashTransfer(
                      richest.id,
                      [poorest.id],
                      transferAmt,
                      'Lấy của giàu chia cho người nghèo (200đ)'
                    );
                    ctxRef.current.addLog(
                      `⚖️ [Lấy Của Giàu Chia Cho Nghèo] Điều Tra Viên đứng cùng ô với ${
                        invPos === richest.position ? richest.name : poorest.name
                      }, thu 200đ từ người giàu nhất (${richest.name}) chia lại cho người nghèo nhất (${poorest.name})!`,
                      'money'
                    );
                    sounds.cash();
                  } else {
                    ctxRef.current.addLog(
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
                      ctxRef.current.addLog(
                        `🔨 [Cưỡng Chế Phá Dỡ] Điều Tra Viên phát hiện ô đất [${landedTile.name}] của ${owner.name} xây dựng vượt phép (${houses} căn), tiến hành cưỡng chế phá sập 1 cấp nhà (còn ${houses - 1} căn)!`,
                        'property'
                      );
                    } else {
                      ctxRef.current.addLog(
                        `🕵️‍♂️ Ô đất [${landedTile.name}] có ${houses} căn nhà (không lớn hơn 2 căn), không bị cưỡng chế phá dỡ.`,
                        'info'
                      );
                    }
                  } else {
                    ctxRef.current.addLog(
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
                      ctxRef.current.triggerCashTransfer(
                        0,
                        [owner.id],
                        50,
                        'Thanh tra khen thưởng (+50đ)'
                      );
                      ctxRef.current.addLog(
                        `⭐ [Thanh Tra Khen Thưởng] Điều Tra Viên kiểm toán ô [${landedTile.name}], khen thưởng chủ sở hữu ${owner.name} +50đ!`,
                        'money'
                      );
                      sounds.cash();
                    } else {
                      ctxRef.current.addLog(
                        `🕵️‍♂️ Ô đất [${landedTile.name}] chưa có chủ sở hữu, không ai nhận thưởng.`,
                        'info'
                      );
                    }
                  } else {
                    ctxRef.current.addLog(
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
                      ctxRef.current.triggerCashTransfer(
                        owner.id,
                        [],
                        fine,
                        'Thanh tra xử phạt (-50đ)'
                      );
                      ctxRef.current.addLog(
                        `📋 [Thanh Tra Xử Phạt] Điều Tra Viên phát hiện vi phạm trật tự tại [${landedTile.name}], xử phạt chủ đất ${owner.name} -${fine}đ!`,
                        'money'
                      );
                      sounds.cash();
                    } else {
                      ctxRef.current.addLog(
                        `🕵️‍♂️ Ô đất [${landedTile.name}] chưa có chủ sở hữu, không xử phạt ai.`,
                        'info'
                      );
                    }
                  } else {
                    ctxRef.current.addLog(
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
                      ctxRef.current.triggerCashTransfer(p.id, [], actual, 'Truy thu thuế toàn dân');
                    });
                    ctxRef.current.addLog(
                      `🏛️ [Truy Thu Thuế Toàn Dân] Điều Tra Viên dừng tại ô [${landedTile.name}], truy thu thuế ${taxAmt}đ từ tất cả người chơi!`,
                      'money'
                    );
                    sounds.cash();
                  } else if ([0, 10, 20, 30].includes(landedTile.id)) {
                    activeSurvivors.forEach(p => {
                      p.cash += 50;
                      ctxRef.current.triggerCashTransfer(0, [p.id], 50, 'Phúc lợi tứ góc (+50đ)');
                    });
                    ctxRef.current.addLog(
                      `🎉 [Phúc Lợi Tứ Góc] Điều Tra Viên dừng tại ô góc [${landedTile.name}], phát trợ cấp 50đ cho tất cả người chơi!`,
                      'money'
                    );
                    sounds.cash();
                  } else {
                    ctxRef.current.addLog(
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
                      ctxRef.current.addLog(
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
                      ctxRef.current.addLog(
                        `🕊️ [Đại Xá Tù Nhân] Điều Tra Viên ghé thăm tù, ký lệnh phóng thích toàn bộ tù nhân (${jailedPlayers
                          .map(p => p.name)
                          .join(', ')}) được tự do ngay lập tức!`,
                        'jail'
                      );
                    } else {
                      ctxRef.current.addLog(`🕵️‍♂️ Hiện không có ai trong tù để phóng thích.`, 'info');
                    }
                  } else {
                    ctxRef.current.addLog(
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
                    const deck =
                      deckType === 'chance'
                        ? ctxRef.current.chanceDeck
                        : ctxRef.current.chestDeck;
                    const available = deck.filter(c => (c.quantity ?? 1) > 0);
                    const pool = available.length > 0 ? available : deck;

                    activeSurvivors.forEach(p => {
                      const drawn =
                        pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
                      if (!drawn) return;

                      ctxRef.current.addLog(
                        `🃏 [Biến Cố Khí Vận] ${p.name} bốc được lá [${drawn.title}: ${drawn.description}] từ lệnh kiểm toán của Điều Tra Viên!`,
                        'ability'
                      );

                      // Kích hoạt đầy đủ các loại hiệu ứng của thẻ bài
                      switch (drawn.actionType) {
                        case 'cash_bonus': {
                          const val = drawn.value || 100;
                          p.cash += val;
                          ctxRef.current.triggerCashTransfer(0, [p.id], val, drawn.title);
                          break;
                        }
                        case 'cash_penalty': {
                          const penalty = Math.min(p.cash, drawn.value || 100);
                          p.cash -= penalty;
                          ctxRef.current.triggerCashTransfer(p.id, [], penalty, drawn.title);
                          break;
                        }
                        case 'birthday': {
                          const gift = drawn.value || 20;
                          let totalGift = 0;
                          activeSurvivors.forEach(other => {
                            if (other.id !== p.id && !other.bankrupt) {
                              const actual = Math.min(other.cash, gift);
                              other.cash -= actual;
                              totalGift += actual;
                              ctxRef.current.triggerCashTransfer(other.id, [p.id], actual, `Mừng sinh nhật ${p.name}`);
                            }
                          });
                          p.cash += totalGift;
                          ctxRef.current.addLog(`🎂 ${p.name} nhận quà sinh nhật tổng cộng ${totalGift}đ!`, 'money');
                          break;
                        }
                        case 'get_out_of_jail': {
                          p.getOutOfJailCards = (p.getOutOfJailCards || 0) + 1;
                          ctxRef.current.addLog(`🕊️ ${p.name} nhận được 1 Thẻ Ra Tù Miễn Phí!`, 'info');
                          break;
                        }
                        case 'go_to_jail': {
                          if ((p.getOutOfJailCards || 0) > 0) {
                            p.getOutOfJailCards = (p.getOutOfJailCards || 0) - 1;
                            p.position = 10;
                            p.inJail = false;
                            p.jailTurns = 0;
                            ctxRef.current.addLog(
                              `🕊️ [Thẻ Ra Tù Miễn Phí] ${p.name} tự động dùng thẻ hóa giải lệnh bắt vào tù!`,
                              'ability'
                            );
                          } else {
                            p.position = 10;
                            p.inJail = true;
                            p.jailTurns = 0;
                            sounds.jail();
                            ctxRef.current.addLog(`🚨 ${p.name} bị tống giam vào tù theo lệnh bài!`, 'jail');
                          }
                          break;
                        }
                        case 'move_to': {
                          const targetPos = drawn.targetTileId ?? 0;
                          p.position = targetPos;
                          sounds.step();
                          ctxRef.current.addLog(
                            `🚶 ${p.name} dịch chuyển đến [${ctxRef.current.tiles[targetPos]?.name || targetPos}]!`,
                            'info'
                          );
                          if (targetPos === 0) {
                            const bonus = ctxRef.current.settings.goExactBonus || 400;
                            p.cash += bonus;
                            ctxRef.current.triggerCashTransfer(0, [p.id], bonus, 'Trúng ô Khởi Hành');
                            ctxRef.current.addLog(`🎯 ${p.name} về đúng Trạm Khởi Hành nhận ${bonus}đ!`, 'money');
                          }
                          break;
                        }
                        case 'move_relative': {
                          const steps = drawn.value || 0;
                          const newPos = (p.position + steps + 40) % 40;
                          p.position = newPos;
                          sounds.step();
                          ctxRef.current.addLog(
                            `🚶 ${p.name} ${steps > 0 ? `tiến ${steps}` : `lùi ${Math.abs(steps)}`} bước đến [${ctxRef.current.tiles[newPos]?.name || newPos}]!`,
                            'info'
                          );
                          break;
                        }
                        case 'house_repair': {
                          let houses = 0;
                          let hotels = 0;
                          Object.values(p.houses || {}).forEach(h => {
                            if (h === 5) hotels++;
                            else if (h > 0) houses += h;
                          });
                          const cost = houses * 25 + hotels * 100;
                          if (cost > 0) {
                            const actualCost = Math.min(p.cash, cost);
                            p.cash -= actualCost;
                            ctxRef.current.triggerCashTransfer(p.id, [], actualCost, 'Sửa chữa nhà cửa');
                            ctxRef.current.addLog(`🔨 ${p.name} thanh toán ${actualCost}đ chi phí tu sửa nhà cửa!`, 'property');
                          }
                          break;
                        }
                      }

                      // Nếu là người chơi thực (không phải bot), hiển thị popup thẻ bài lên màn hình
                      if (!p.isAI && ctxRef.current.setActiveDrawnCard) {
                        ctxRef.current.setActiveDrawnCard(drawn);
                      }
                    });
                    sounds.ability();
                  } else {
                    ctxRef.current.addLog(
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
                        .map(tId => ctxRef.current.tiles[tId])
                        .filter(t => t && t.type === 'property' && (p.houses[t.id] || 0) < 5);

                      const affordable = upgradableTiles.filter(
                        t => p.cash >= (t.houseCost || 50)
                      );

                      if (affordable.length > 0) {
                        const targetTile = [...affordable].sort(
                          (a, b) => (p.houses[a.id] || 0) - (p.houses[b.id] || 0)
                        )[0];
                        const cost = targetTile.houseCost || 50;
                        p.cash -= cost;
                        p.houses[targetTile.id] = (p.houses[targetTile.id] || 0) + 1;
                        sounds.buildHouse();
                        ctxRef.current.triggerCashTransfer(
                          p.id,
                          [],
                          cost,
                          `Nâng cấp nhà [${targetTile.name}] theo lệnh Điều Tra Viên`
                        );
                        ctxRef.current.addLog(
                          `🏗️ [Cấp Phép Quy Hoạch] Điều Tra Viên đứng cùng ô với ${p.name}, cho phép ${p.name} nâng cấp 1 căn nhà trên [${targetTile.name}] với giá ${cost}đ (Hiện có ${p.houses[targetTile.id]} nhà)!`,
                          'ability'
                        );
                      } else {
                        ctxRef.current.addLog(
                          `🕵️‍♂️ ${p.name} đứng cùng ô với Điều Tra Viên nhưng không có ô đất hợp lệ hoặc không đủ tiền nâng cấp nhà.`,
                          'info'
                        );
                      }
                    });
                  } else {
                    ctxRef.current.addLog(
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
                    const cheapestTile = mostLandPlayer.propertiesOwned
                      .map(tId => ctxRef.current.tiles[tId])
                      .filter(Boolean)
                      .sort((a, b) => (a.price || 0) - (b.price || 0))[0];

                    if (cheapestTile) {
                      const cost = cheapestTile.price || 100;
                      if (leastLandPlayer.cash >= cost) {
                        leastLandPlayer.cash -= cost;
                        mostLandPlayer.cash += cost;
                        ctxRef.current.triggerCashTransfer(
                          leastLandPlayer.id,
                          [mostLandPlayer.id],
                          cost,
                          `Tái điều tiết đất đai [${cheapestTile.name}]`
                        );

                        mostLandPlayer.propertiesOwned = mostLandPlayer.propertiesOwned.filter(
                          id => id !== cheapestTile.id
                        );
                        delete mostLandPlayer.houses[cheapestTile.id];
                        delete mostLandPlayer.mortgaged[cheapestTile.id];

                        leastLandPlayer.propertiesOwned.push(cheapestTile.id);
                        leastLandPlayer.houses[cheapestTile.id] = 0;

                        sounds.ability();
                        ctxRef.current.addLog(
                          `🏛️ [Tái Điều Tiết Đất Đai] Điều Tra Viên đứng cùng ô người sở hữu đất! Người ít đất nhất (${leastLandPlayer.name}) mua lại ô đất [${cheapestTile.name}] từ đại gia đất ${mostLandPlayer.name} với giá gốc ${cost}đ (toàn bộ nhà bị cưỡng chế phá sập về đất trống)!`,
                          'ability'
                        );
                      } else {
                        ctxRef.current.addLog(
                          `🏛️ [Tái Điều Tiết Đất Đai] ${leastLandPlayer.name} không đủ ${cost}đ để mua lại [${cheapestTile.name}] từ ${mostLandPlayer.name}.`,
                          'info'
                        );
                      }
                    }
                  } else {
                    ctxRef.current.addLog(
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
                    const vacantProperties = ctxRef.current.tiles.filter(
                      t => t.type === 'property' && !allOwned.has(t.id)
                    );

                    sameTilePlayers.forEach(p => {
                      const affordableVacant = vacantProperties.filter(
                        t => p.cash >= (t.price || 0)
                      );
                      const ownedTiles = p.propertiesOwned
                        .map(tId => ctxRef.current.tiles[tId])
                        .filter(Boolean);

                      if (affordableVacant.length > 0 && p.cash >= 350) {
                        const targetVacant = affordableVacant[0];
                        p.cash -= targetVacant.price || 0;
                        p.propertiesOwned.push(targetVacant.id);
                        sounds.purchase();
                        ctxRef.current.addLog(
                          `🏙️ [Đặc Quyền Giao Dịch] ${p.name} đứng cùng ô với Điều Tra Viên, được phê chuẩn mua lô đất trống [${targetVacant.name}] với giá gốc ${targetVacant.price}đ!`,
                          'ability'
                        );
                      } else if (ownedTiles.length > 0) {
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
                        ctxRef.current.triggerCashTransfer(
                          0,
                          [p.id],
                          payout,
                          `Nhà Nước thu hồi đất [${sellTile.name}] giá gấp đôi`
                        );
                        ctxRef.current.addLog(
                          `💰 [Đặc Quyền Giao Dịch] ${p.name} đứng cùng ô với Điều Tra Viên, bán lại lô đất [${sellTile.name}] cho Nhà Nước với GIÁ GẤP ĐÔI (${payout}đ)! (Tiền gốc mua đất ${basePrice}đ + nhà ${houseCost}đ = ${totalInvested}đ × 2)`,
                          'money'
                        );
                      } else {
                        ctxRef.current.addLog(
                          `🕵️‍♂️ ${p.name} đứng cùng ô với Điều Tra Viên nhưng không có tiền mua đất trống và cũng không có đất để bán.`,
                          'info'
                        );
                      }
                    });
                  } else {
                    ctxRef.current.addLog(
                      `🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người chơi nào để thực hiện giao dịch đặc quyền.`,
                      'info'
                    );
                  }
                  break;
                }

                // 14. Đặc Xá & Trao Quyền VIP (Năng Lực Vĩnh Viễn)
                // Đứng cùng ô hoặc lân cận 1 ô: Cho phép nhận 1 năng lực vĩnh viễn miễn phí (nếu chưa có)
                // hoặc đổi sang năng lực vĩnh viễn khác miễn phí (nếu đã có). Tối đa đúng 1 năng lực vĩnh viễn!
                case 'inv_grant_or_swap_permanent': {
                  const targetPlayers = activeSurvivors.filter(
                    p =>
                      p.position === invPos ||
                      (p.position + 1) % 40 === invPos ||
                      (p.position - 1 + 40) % 40 === invPos
                  );

                  if (targetPlayers.length === 0) {
                    ctxRef.current.addLog(
                      `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để nhận/đổi năng lực VIP miễn phí.`,
                      'info'
                    );
                  } else {
                    // Track global owned set across players to avoid duplicate exclusive abilities
                    const ownedSet = new Set(
                      nextPlayers.flatMap(p => p.permanentAbilities || [])
                    );

                    targetPlayers.forEach(target => {
                      const hasAny = (target.permanentAbilities || []).length > 0;

                      if (!hasAny) {
                        // Người chơi chưa có năng lực vĩnh viễn -> Tặng miễn phí 1 thẻ trống
                        const available = INITIAL_PERMANENT_ABILITIES.filter(
                          a => !ownedSet.has(a.id)
                        );
                        if (available.length > 0) {
                          const chosen =
                            available[Math.floor(Math.random() * available.length)];
                          target.permanentAbilities = [chosen.id];
                          ownedSet.add(chosen.id);
                          sounds.ability();
                          ctxRef.current.addLog(
                            `👑 [Đặc Xá VIP] Điều Tra Viên đứng cùng ô / lân cận ${target.name}, trao tặng MIỄN PHÍ Năng Lực Vĩnh Viễn [${chosen.name}] (${chosen.description})!`,
                            'ability'
                          );
                        } else {
                          ctxRef.current.addLog(
                            `👑 [Đặc Xá VIP] Kho Năng Lực Vĩnh Viễn đã hết thẻ trống, không thể cấp thêm cho ${target.name}.`,
                            'info'
                          );
                        }
                      } else {
                        // Người chơi đã có năng lực vĩnh viễn -> Đổi sang năng lực khác miễn phí (chỉ giữ tối đa 1)
                        const currentId = target.permanentAbilities[0];
                        const oldAbility = INITIAL_PERMANENT_ABILITIES.find(
                          a => a.id === currentId
                        );

                        // Tìm thẻ khác chưa ai sở hữu
                        const availableToSwap = INITIAL_PERMANENT_ABILITIES.filter(
                          a => a.id !== currentId && !ownedSet.has(a.id)
                        );

                        if (availableToSwap.length > 0) {
                          const newChosen =
                            availableToSwap[Math.floor(Math.random() * availableToSwap.length)];
                          // Xoá cái cũ, gán đúng 1 cái mới (đảm bảo không bao giờ có 2 năng lực)
                          target.permanentAbilities = [newChosen.id];
                          ownedSet.delete(currentId);
                          ownedSet.add(newChosen.id);
                          sounds.ability();
                          ctxRef.current.addLog(
                            `🔄 [Đổi Năng Lực VIP] Điều Tra Viên cho phép ${target.name} ĐỔI MIỄN PHÍ năng lực [${oldAbility?.name || currentId}] sang [${newChosen.name}] (${newChosen.description}) (người chơi chỉ giữ duy nhất 1 năng lực vĩnh viễn)!`,
                            'ability'
                          );
                        } else {
                          ctxRef.current.addLog(
                            `👑 ${target.name} đang sở hữu [${oldAbility?.name || currentId}] nhưng không còn thẻ VIP trống nào khác để đổi.`,
                            'info'
                          );
                        }
                      }
                    });
                  }
                  break;
                }

                // 15. Thị Trường Sôi Động (Giá Thuê Đất x2)
                case 'inv_double_rent_round': {
                  sounds.ability();
                  ctxRef.current.addLog(
                    `🔥 [Thị Trường Sôi Động] Điều Tra Viên ban bố sắc lệnh: Trong suốt vòng chơi này, TẤT CẢ GIÁ THUÊ ĐẤT TRÊN TOÀN BÀN CỜ ĐƯỢC NHÂN ĐÔI (x2)!`,
                    'ability'
                  );
                  break;
                }

                // 16. Trợ Giá Khủng Hoảng (Giá Thuê Đất ½)
                case 'inv_half_rent_round': {
                  sounds.ability();
                  ctxRef.current.addLog(
                    `📉 [Trợ Giá Khủng Hoảng] Điều Tra Viên ban bố gói cứu trợ: Trong suốt vòng chơi này, TẤT CẢ GIÁ THUÊ ĐẤT TRÊN TOÀN BÀN CỜ ĐƯỢC GIẢM CÒN ½ (giảm 50%)!`,
                    'ability'
                  );
                  break;
                }
              }

              return nextPlayers;
            });

            // Show announcement modal
            ctxRef.current.setAiActionModalInfo({
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
              if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
              isExecutingRef.current = false;
              ctxRef.current.setIsInvestigatorTurn(false);
              ctxRef.current.onInvestigatorTurnComplete();
            }, 1200);

            return currentInv;
          });
        }, 350);
      }
    }, stepInterval);

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [ctx.isInvestigatorTurn]);
};
