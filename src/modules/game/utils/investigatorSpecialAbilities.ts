/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestigatorAbilityExecutionContext } from './investigatorAbilityTypes';
import { handleInvestigatorEconomicAbilities } from './investigatorEconomicAbilities';

export function handleInvestigatorSpecialAbilities(
  ctx: InvestigatorAbilityExecutionContext
): boolean {
  const {
    activeAbility,
    landedTile,
    activeSurvivors,
    tiles,
    chanceDeck,
    chestDeck,
    settings,
    triggerCashTransfer,
    addLog,
    setActiveDrawnCard,
    sounds,
  } = ctx;

  switch (activeAbility.id) {
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
          addLog(
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
          addLog(
            `🕊️ [Đại Xá Tù Nhân] Điều Tra Viên ghé thăm tù, ký lệnh phóng thích toàn bộ tù nhân (${jailedPlayers
              .map(p => p.name)
              .join(', ')}) được tự do ngay lập tức!`,
            'jail'
          );
        } else {
          addLog(`🕵️‍♂️ Hiện không có ai trong tù để phóng thích.`, 'info');
        }
      } else {
        addLog(`🕵️‍♂️ Ô [${landedTile.name}] không phải ô Bị Bắt hay ô Thăm Tù.`, 'info');
      }
      return true;
    }

    // 10. Biến cố khí vận toàn dân
    case 'inv_draw_cards_all': {
      if (landedTile.type === 'chance' || landedTile.type === 'chest') {
        const deck = landedTile.type === 'chance' ? chanceDeck : chestDeck;
        const available = deck.filter(c => (c.quantity ?? 1) > 0);
        const pool = available.length > 0 ? available : deck;

        activeSurvivors.forEach(p => {
          const drawn = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
          if (!drawn) return;

          addLog(
            `🃏 [Biến Cố Khí Vận] ${p.name} bốc được lá [${drawn.title}: ${drawn.description}] từ lệnh kiểm toán của Điều Tra Viên!`,
            'ability'
          );

          switch (drawn.actionType) {
            case 'cash_bonus': {
              const val = drawn.value || 100;
              p.cash += val;
              triggerCashTransfer(0, [p.id], val, drawn.title);
              break;
            }
            case 'cash_penalty': {
              const penalty = Math.min(p.cash, drawn.value || 100);
              p.cash -= penalty;
              triggerCashTransfer(p.id, [], penalty, drawn.title);
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
                  triggerCashTransfer(other.id, [p.id], actual, `Mừng sinh nhật ${p.name}`);
                }
              });
              p.cash += totalGift;
              addLog(`🎂 ${p.name} nhận quà sinh nhật tổng cộng ${totalGift}đ!`, 'money');
              break;
            }
            case 'get_out_of_jail': {
              p.getOutOfJailCards = (p.getOutOfJailCards || 0) + 1;
              addLog(`🕊️ ${p.name} nhận được 1 Thẻ Ra Tù Miễn Phí!`, 'info');
              break;
            }
            case 'go_to_jail': {
              if ((p.getOutOfJailCards || 0) > 0) {
                p.getOutOfJailCards = (p.getOutOfJailCards || 0) - 1;
                p.position = 10;
                p.inJail = false;
                p.jailTurns = 0;
                addLog(
                  `🕊️ [Thẻ Ra Tù Miễn Phí] ${p.name} tự động dùng thẻ hóa giải lệnh bắt vào tù!`,
                  'ability'
                );
              } else {
                p.position = 10;
                p.inJail = true;
                p.jailTurns = 0;
                sounds.jail();
                addLog(`🚨 ${p.name} bị tống giam vào tù theo lệnh bài!`, 'jail');
              }
              break;
            }
            case 'move_to': {
              const targetPos = drawn.targetTileId ?? 0;
              p.position = targetPos;
              sounds.step();
              addLog(`🚶 ${p.name} dịch chuyển đến [${tiles[targetPos]?.name || targetPos}]!`, 'info');
              if (targetPos === 0) {
                const bonus = settings.goExactBonus || 400;
                p.cash += bonus;
                triggerCashTransfer(0, [p.id], bonus, 'Trúng ô Khởi Hành');
                addLog(`🎯 ${p.name} về đúng Trạm Khởi Hành nhận ${bonus}đ!`, 'money');
              }
              break;
            }
            case 'move_relative': {
              const steps = drawn.value || 0;
              const newPos = (p.position + steps + 40) % 40;
              p.position = newPos;
              sounds.step();
              addLog(
                `🚶 ${p.name} ${steps > 0 ? `tiến ${steps}` : `lùi ${Math.abs(steps)}`} bước đến [${tiles[newPos]?.name || newPos}]!`,
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
                triggerCashTransfer(p.id, [], actualCost, 'Sửa chữa nhà cửa');
                addLog(`🔨 ${p.name} thanh toán ${actualCost}đ chi phí tu sửa nhà cửa!`, 'property');
              }
              break;
            }
          }

          if (!p.isAI && setActiveDrawnCard) {
            setActiveDrawnCard(drawn);
          }
        });
        sounds.ability();
      } else {
        addLog(`🕵️‍♂️ Ô [${landedTile.name}] không phải ô Cơ Hội hay Khí Vận.`, 'info');
      }
      return true;
    }

    default:
      return handleInvestigatorEconomicAbilities(ctx);
  }
}
