import { useCallback } from 'react';
import { Card, Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

interface CardActionContext {
  activePlayer: Player | null;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setActiveDrawnCard: (c: Card | null) => void;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
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

        ctx.addLog(`🃏 [${card.deck === 'chance' ? 'Cơ Hội' : 'Khí Vận'}] ${p.name}: ${card.title} - ${card.description}`, 'info');

        switch (card.actionType) {
          case 'cash_bonus': {
            const bonus = card.value || 100;
            p.cash += bonus;
            sounds.cash();
            ctx.triggerCashTransfer(0, [p.id], bonus, card.title);
            break;
          }
          case 'cash_penalty': {
            const penalty = card.value || 100;
            if (p.cash >= penalty) {
              p.cash -= penalty;
              sounds.cash();
              ctx.triggerCashTransfer(p.id, [], penalty, card.title);
            } else {
              ctx.handleBankrupt(p);
            }
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
            ctx.addLog(`🚨 ${p.name} bị áp giải vào tù theo lệnh của thẻ bài!`, 'jail');
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
