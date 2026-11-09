/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestigatorAbilityExecutionContext } from './investigatorAbilityTypes';
import { INITIAL_PERMANENT_ABILITIES } from '../../../data/abilities';

export function handleInvestigatorEconomicAbilities(
  ctx: InvestigatorAbilityExecutionContext
): boolean {
  const {
    activeAbility,
    invPos,
    landedTile,
    nextPlayers,
    activeSurvivors,
    tiles,
    triggerCashTransfer,
    addLog,
    sounds,
  } = ctx;

  switch (activeAbility.id) {
    // 11. Cấp phép quy hoạch: Nâng cấp nhà tự do
    case 'inv_allow_house_upgrade': {
      const sameTilePlayers = activeSurvivors.filter(p => p.position === landedTile.id);
      if (sameTilePlayers.length > 0) {
        sameTilePlayers.forEach(p => {
          const upgradableTiles = p.propertiesOwned
            .map(tId => tiles[tId])
            .filter(t => t && t.type === 'property' && (p.houses[t.id] || 0) < 5);

          const affordable = upgradableTiles.filter(t => p.cash >= (t.houseCost || 50));

          if (affordable.length > 0) {
            const targetTile = [...affordable].sort(
              (a, b) => (p.houses[a.id] || 0) - (p.houses[b.id] || 0)
            )[0];
            const cost = targetTile.houseCost || 50;
            p.cash -= cost;
            p.houses[targetTile.id] = (p.houses[targetTile.id] || 0) + 1;
            sounds.buildHouse();
            triggerCashTransfer(p.id, [], cost, `Nâng cấp nhà [${targetTile.name}] theo lệnh Điều Tra Viên`);
            addLog(
              `🏗️ [Cấp Phép Quy Hoạch] Điều Tra Viên đứng cùng ô với ${p.name}, cho phép ${p.name} nâng cấp 1 căn nhà trên [${targetTile.name}] với giá ${cost}đ (Hiện có ${p.houses[targetTile.id]} nhà)!`,
              'ability'
            );
          } else {
            addLog(
              `🕵️‍♂️ ${p.name} đứng cùng ô với Điều Tra Viên nhưng không có ô đất hợp lệ hoặc không đủ tiền nâng cấp nhà.`,
              'info'
            );
          }
        });
      } else {
        addLog(`🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người chơi nào để cấp phép nâng cấp nhà.`, 'info');
      }
      return true;
    }

    // 12. Tái điều tiết đất đai (chống độc quyền)
    case 'inv_redistribute_land_poorest': {
      const playersWithLand = activeSurvivors.filter(p => (p.propertiesOwned?.length || 0) > 0);
      const mostLandPlayer = [...playersWithLand].sort(
        (a, b) => b.propertiesOwned.length - a.propertiesOwned.length || b.cash - a.cash
      )[0];
      const leastLandPlayer = [...activeSurvivors].sort(
        (a, b) => a.propertiesOwned.length - b.propertiesOwned.length || a.cash - b.cash
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
          .map(tId => tiles[tId])
          .filter(Boolean)
          .sort((a, b) => (a.price || 0) - (b.price || 0))[0];

        if (cheapestTile) {
          const cost = cheapestTile.price || 100;
          if (leastLandPlayer.cash >= cost) {
            leastLandPlayer.cash -= cost;
            mostLandPlayer.cash += cost;
            triggerCashTransfer(
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
            addLog(
              `🏛️ [Tái Điều Tiết Đất Đai] Điều Tra Viên đứng cùng ô người sở hữu đất! Người ít đất nhất (${leastLandPlayer.name}) mua lại ô đất [${cheapestTile.name}] từ đại gia đất ${mostLandPlayer.name} với giá gốc ${cost}đ (toàn bộ nhà bị cưỡng chế phá sập về đất trống)!`,
              'ability'
            );
          } else {
            addLog(
              `🏛️ [Tái Điều Tiết Đất Đai] ${leastLandPlayer.name} không đủ ${cost}đ để mua lại [${cheapestTile.name}] từ ${mostLandPlayer.name}.`,
              'info'
            );
          }
        }
      } else {
        addLog(
          `🕵️‍♂️ Điều Tra Viên không đứng cùng ô người có nhiều đất nhất hoặc ít đất nhất, hoặc không có sự chênh lệch đất đai.`,
          'info'
        );
      }
      return true;
    }

    // 13. Đặc quyền giao dịch: Mua đất trống hoặc bán giá gấp đôi
    case 'inv_buy_vacant_or_double_sell': {
      const sameTilePlayers = activeSurvivors.filter(p => p.position === landedTile.id);
      if (sameTilePlayers.length > 0) {
        const allOwned = new Set(activeSurvivors.flatMap(p => p.propertiesOwned || []));
        const vacantProperties = tiles.filter(t => t.type === 'property' && !allOwned.has(t.id));

        sameTilePlayers.forEach(p => {
          const affordableVacant = vacantProperties.filter(t => p.cash >= (t.price || 0));
          const ownedTiles = p.propertiesOwned.map(tId => tiles[tId]).filter(Boolean);

          if (affordableVacant.length > 0 && p.cash >= 350) {
            const targetVacant = affordableVacant[0];
            p.cash -= targetVacant.price || 0;
            p.propertiesOwned.push(targetVacant.id);
            sounds.purchase();
            addLog(
              `🏙️ [Đặc Quyền Giao Dịch] ${p.name} đứng cùng ô với Điều Tra Viên, được phê chuẩn mua lô đất trống [${targetVacant.name}] với giá gốc ${targetVacant.price}đ!`,
              'ability'
            );
          } else if (ownedTiles.length > 0) {
            const sellTile = ownedTiles[0];
            const basePrice = sellTile.price || 0;
            const houseCost = (p.houses[sellTile.id] || 0) * (sellTile.houseCost || 50);
            const totalInvested = basePrice + houseCost;
            const payout = totalInvested * 2;

            p.cash += payout;
            p.propertiesOwned = p.propertiesOwned.filter(id => id !== sellTile.id);
            delete p.houses[sellTile.id];
            delete p.mortgaged[sellTile.id];

            sounds.cash();
            triggerCashTransfer(0, [p.id], payout, `Nhà Nước thu hồi đất [${sellTile.name}] giá gấp đôi`);
            addLog(
              `💰 [Đặc Quyền Giao Dịch] ${p.name} đứng cùng ô với Điều Tra Viên, bán lại lô đất [${sellTile.name}] cho Nhà Nước với GIÁ GẤP ĐÔI (${payout}đ)! (Tiền gốc mua đất ${basePrice}đ + nhà ${houseCost}đ = ${totalInvested}đ × 2)`,
              'money'
            );
          } else {
            addLog(
              `🕵️‍♂️ ${p.name} đứng cùng ô với Điều Tra Viên nhưng không có tiền mua đất trống và cũng không có đất để bán.`,
              'info'
            );
          }
        });
      } else {
        addLog(`🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người chơi nào để thực hiện giao dịch đặc quyền.`, 'info');
      }
      return true;
    }

    // 14. Đặc Xá & Trao Quyền VIP (Năng Lực Vĩnh Viễn)
    case 'inv_grant_or_swap_permanent': {
      const targetPlayers = activeSurvivors.filter(
        p =>
          p.position === invPos ||
          (p.position + 1) % 40 === invPos ||
          (p.position - 1 + 40) % 40 === invPos
      );

      if (targetPlayers.length === 0) {
        addLog(
          `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để nhận/đổi năng lực VIP miễn phí.`,
          'info'
        );
      } else {
        const ownedSet = new Set(nextPlayers.flatMap(p => p.permanentAbilities || []));

        targetPlayers.forEach(target => {
          const hasAny = (target.permanentAbilities || []).length > 0;

          if (!hasAny) {
            const available = INITIAL_PERMANENT_ABILITIES.filter(a => !ownedSet.has(a.id));
            if (available.length > 0) {
              const chosen = available[Math.floor(Math.random() * available.length)];
              target.permanentAbilities = [chosen.id];
              ownedSet.add(chosen.id);
              sounds.ability();
              addLog(
                `👑 [Đặc Xá VIP] Điều Tra Viên đứng cùng ô / lân cận ${target.name}, trao tặng MIỄN PHÍ Năng Lực Vĩnh Viễn [${chosen.name}] (${chosen.description})!`,
                'ability'
              );
            } else {
              addLog(`👑 [Đặc Xá VIP] Kho Năng Lực Vĩnh Viễn đã hết thẻ trống, không thể cấp thêm cho ${target.name}.`, 'info');
            }
          } else {
            const currentId = target.permanentAbilities[0];
            const oldAbility = INITIAL_PERMANENT_ABILITIES.find(a => a.id === currentId);
            const availableToSwap = INITIAL_PERMANENT_ABILITIES.filter(
              a => a.id !== currentId && !ownedSet.has(a.id)
            );

            if (availableToSwap.length > 0) {
              const newChosen = availableToSwap[Math.floor(Math.random() * availableToSwap.length)];
              target.permanentAbilities = [newChosen.id];
              ownedSet.delete(currentId);
              ownedSet.add(newChosen.id);
              sounds.ability();
              addLog(
                `🔄 [Đổi Năng Lực VIP] Điều Tra Viên cho phép ${target.name} ĐỔI MIỄN PHÍ năng lực [${oldAbility?.name || currentId}] sang [${newChosen.name}] (${newChosen.description}) (người chơi chỉ giữ duy nhất 1 năng lực vĩnh viễn)!`,
                'ability'
              );
            } else {
              addLog(`👑 ${target.name} đang sở hữu [${oldAbility?.name || currentId}] nhưng không còn thẻ VIP trống nào khác để đổi.`, 'info');
            }
          }
        });
      }
      return true;
    }

    // 15. Thị Trường Sôi Động (Giá Thuê Đất x2)
    case 'inv_double_rent_round': {
      sounds.ability();
      addLog(
        `🔥 [Thị Trường Sôi Động] Điều Tra Viên ban bố sắc lệnh: Trong suốt vòng chơi này, TẤT CẢ GIÁ THUÊ ĐẤT TRÊN TOÀN BÀN CỜ ĐƯỢC NHÂN ĐÔI (x2)!`,
        'ability'
      );
      return true;
    }

    // 16. Trợ Giá Khủng Hoảng (Giá Thuê Đất ½)
    case 'inv_half_rent_round': {
      sounds.ability();
      addLog(
        `📉 [Trợ Giá Khủng Hoảng] Điều Tra Viên ban bố gói cứu trợ: Trong suốt vòng chơi này, TẤT CẢ GIÁ THUÊ ĐẤT TRÊN TOÀN BÀN CỜ ĐƯỢC GIẢM CÒN ½ (giảm 50%)!`,
        'ability'
      );
      return true;
    }

    default:
      return false;
  }
}
