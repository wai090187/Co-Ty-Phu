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
