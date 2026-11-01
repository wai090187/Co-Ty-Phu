import { useCallback } from 'react';
import { Card, GameSettings, Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

interface CardActionContext {
  activePlayer: Player | null;
  settings?: GameSettings;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setActiveDrawnCard: (c: Card | null) => void;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent?: (id: number, type: any, emotion: any, title: string, msg: string, amount?: number) => void;
  resolveTileLanding: (pId: number, pos: number, steps: number) => void;
  handleBankrupt: (p: Player) => void;
}

export const useCardActions = (ctx: CardActionContext) => {
  const executeDrawnCard = useCallback(
    (card: Card) => {
      if (!ctx.activePlayer) return;

      sounds.cardDraw();
      ctx.setPlayers(prev => {
        const next = [...prev];
        const p = next.find(x => x.id === ctx.activePlayer!.id);
        if (!p) return prev;

        ctx.addLog(
          `🃏 [${card.deck === 'chance' ? 'Cơ Hội' : 'Khí Vận'}] ${p.name}: ${card.title} - ${card.description}`,
          'info'
        );

        const isInv = ctx.settings?.jailMode === 'investigation' && p.inJail;

        switch (card.actionType) {
          case 'cash_bonus': {
            let bonus = card.value || 100;
            if (isInv && ctx.settings) {
              const red = Math.round(bonus * (ctx.settings.investigationIncomePenaltyPercent / 100));
              bonus = Math.max(0, bonus - red);
              ctx.addLog(`📉 [Đang Bị Điều Tra] ${p.name} bị trừ tiền thưởng thẻ bài (-${red}đ)`, 'jail');
            }
            p.cash += bonus;
            sounds.cash();
            ctx.triggerCashTransfer(0, [p.id], bonus, card.title);
            break;
          }
          case 'cash_penalty': {
            let penalty = card.value || 100;
            if (isInv && ctx.settings) {
              const inc = Math.round(penalty * (ctx.settings.investigationFeePenaltyPercent / 100));
              penalty += inc;
              ctx.addLog(`📈 [Đang Bị Điều Tra] ${p.name} tăng tiền phạt thẻ bài (+${inc}đ)`, 'jail');
            }
            if (p.cash >= penalty) {
              p.cash -= penalty;
              sounds.cash();
              ctx.triggerCashTransfer(p.id, [], penalty, card.title);
            } else {
              ctx.handleBankrupt(p);
            }
            break;
          }
          case 'birthday': {
            const gift = card.value || 10;
            let totalGift = 0;
            const payerIds: number[] = [];
            next.forEach(other => {
              if (other.id !== p.id && !other.bankrupt) {
                const actual = Math.min(other.cash, gift);
                other.cash -= actual;
                totalGift += actual;
                payerIds.push(other.id);
                ctx.triggerCashTransfer(other.id, [p.id], actual, `Quà mừng sinh nhật cho ${p.name}`);
              }
            });
            p.cash += totalGift;
            sounds.cash();
            ctx.addLog(`🎂 ${p.name} nhận quà sinh nhật tổng cộng ${totalGift}đ từ các bạn chơi!`, 'money');
            break;
          }
          case 'move_to': {
            const targetPos = card.targetTileId ?? 0;
            p.position = targetPos;
            sounds.step();
            setTimeout(() => {
              ctx.resolveTileLanding(p.id, targetPos, 0);
            }, 300);
            break;
          }
          case 'move_relative': {
            const steps = card.value || 0;
            const newPos = (p.position + steps + 40) % 40;
            p.position = newPos;
            sounds.step();
            ctx.addLog(
              `🚶 [${card.title}] ${p.name} ${steps < 0 ? `lùi lại ${Math.abs(steps)} ô` : `tiến lên ${steps} ô`} đến ô số ${newPos}!`,
              'info'
            );
            setTimeout(() => {
              ctx.resolveTileLanding(p.id, newPos, steps);
            }, 300);
            break;
          }
          case 'get_out_of_jail': {
            p.getOutOfJailCards = (p.getOutOfJailCards || 0) + 1;
            sounds.ability();
            ctx.addLog(`🕊️ [${card.title}] ${p.name} nhận được 1 Thẻ Tha Bổng Ra Tù / Miễn Điều Tra!`, 'info');
            break;
          }
          case 'house_repair': {
            let totalHouses = 0;
            let totalHotels = 0;
            Object.values(p.houses || {}).forEach(h => {
              if (h === 5) totalHotels++;
              else if (h > 0) totalHouses += h;
            });
            const totalRepair = totalHouses * 25 + totalHotels * 100;
            if (totalRepair > 0) {
              if (p.cash >= totalRepair) {
                p.cash -= totalRepair;
                sounds.cash();
                ctx.triggerCashTransfer(p.id, [], totalRepair, 'Chi phí sửa chữa nhà cửa');
                ctx.addLog(
                  `🔨 [Sửa Chữa Nhà] ${p.name} trả ${totalRepair}đ bảo trì (${totalHouses} nhà, ${totalHotels} khách sạn)`,
                  'property'
                );
              } else {
                ctx.handleBankrupt(p);
              }
            } else {
              ctx.addLog(`🔨 [Sửa Chữa Nhà] ${p.name} không có bất động sản nào cần tu sửa!`, 'property');
            }
            break;
          }
          case 'go_to_jail': {
            p.position = 10;
            p.inJail = true;
            p.jailTurns = 0;
            sounds.jail();
            const isInvestigationMode = ctx.settings?.jailMode === 'investigation';
            const msg = isInvestigationMode
              ? `🚨 ${p.name}: Đang bị công an điều tra vì buôn bán nhà ở trái phép!`
              : `🚨 ${p.name} bị áp giải vào tù theo lệnh của thẻ bài!`;
            ctx.addLog(msg, 'jail');
            if (ctx.triggerCharacterEvent) {
              ctx.triggerCharacterEvent(
                p.id,
                'investigation_jailed',
                'sad',
                isInvestigationMode ? 'Bị Công An Điều Tra' : 'Bị Bắt Vào Tù',
                isInvestigationMode
                  ? `${p.name} đang bị công an điều tra vì buôn bán nhà ở trái phép!`
                  : `${p.name} bị tống giam vào tù!`
              );
            }
            break;
          }
        }

        return next;
      });

      ctx.setActiveDrawnCard(null);
    },
    [ctx]
  );

  return { executeDrawnCard };
};
