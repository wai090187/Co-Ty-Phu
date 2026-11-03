import { useCallback } from 'react';
import { Player, CashTransferEvent, CharacterEvent } from '../../../types/game';

interface GameEventsContext {
  setCashTransferEvent: (e: CashTransferEvent | null) => void;
  setCharacterEvent: (e: CharacterEvent | null) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addLog?: (msg: string, type?: any) => void;
}

export const useGameEvents = (ctx: GameEventsContext) => {
  const triggerCharacterEvent = useCallback(
    (
      playerId: number,
      type: any,
      emotion: any,
      title: string,
      message: string,
      cashDelta?: number
    ) => {
      ctx.setCharacterEvent({
        id: `char-evt-${Date.now()}-${Math.random()}`,
        playerId,
        type,
        emotion,
        title,
        message,
        amount: cashDelta,
        timestamp: Date.now(),
      });
      ctx.setPlayers(prev =>
        prev.map(p =>
          p.id === playerId
            ? { ...p, emotion, emotionMessage: message, emotionTimestamp: Date.now() }
            : p
        )
      );
    },
    [ctx]
  );

  const triggerCashTransfer = useCallback(
    (payerId: number | undefined, receiverIds: number[], amount: number, reason: string) => {
      let payerName = '';
      let payerBefore: number | undefined;
      let payerAfter: number | undefined;
      const recBefore: Record<number, number> = {};
      const recAfter: Record<number, number> = {};
      const recNames: Record<number, string> = {};
      const share = receiverIds.length > 0 ? Math.round(amount / receiverIds.length) : amount;

      ctx.setPlayers(prev => {
        if (payerId !== undefined) {
          const p = prev.find(x => x.id === payerId);
          if (p) {
            payerName = p.name;
            payerAfter = p.cash;
            payerBefore = p.cash + amount;
          }
        }
        receiverIds.forEach(rid => {
          const r = prev.find(x => x.id === rid);
          if (r) {
            recNames[rid] = r.name;
            recAfter[rid] = r.cash;
            recBefore[rid] = Math.max(0, r.cash - share);
          }
        });

        // Set cash transfer event with exact before & after
        ctx.setCashTransferEvent({
          id: `transfer-${Date.now()}-${Math.random()}`,
          payerId,
          receiverIds,
          amount,
          reason,
          timestamp: Date.now(),
          payerCashBefore: payerBefore,
          payerCashAfter: payerAfter,
          receiverCashBefore: recBefore,
          receiverCashAfter: recAfter,
        });

        // Log cash before & after for testing
        if (payerId !== undefined && payerName && payerBefore !== undefined && payerAfter !== undefined) {
          ctx.addLog?.(
            `💸 [Giao dịch] ${payerName}: -${amount}đ (${reason}) [Số dư: ${payerBefore}đ ➔ ${payerAfter}đ]`,
            'money'
          );
        }
        receiverIds.forEach(rid => {
          const name = recNames[rid];
          const b = recBefore[rid];
          const a = recAfter[rid];
          if (name && b !== undefined && a !== undefined) {
            ctx.addLog?.(
              `💰 [Giao dịch] ${name}: +${share}đ (${reason}) [Số dư: ${b}đ ➔ ${a}đ]`,
              'money'
            );
          }
        });

        return prev.map(p => {
          if (payerId !== undefined && p.id === payerId) {
            return { ...p, emotion: 'sad', emotionMessage: `-${amount}đ`, emotionTimestamp: Date.now() };
          }
          if (receiverIds.includes(p.id)) {
            return { ...p, emotion: 'happy', emotionMessage: `+${amount}đ`, emotionTimestamp: Date.now() };
          }
          return p;
        });
      });

      // Bottom-right toast trigger
      if (payerId !== undefined && payerId > 0) {
        triggerCharacterEvent(
          payerId,
          'money_transfer',
          'sad',
          'Giao Dịch Chuyển Tiền',
          `${reason} ${payerAfter !== undefined ? `(Số dư: ${payerAfter}đ)` : ''}`,
          -amount
        );
      } else if (receiverIds.length > 0 && receiverIds[0] > 0) {
        triggerCharacterEvent(
          receiverIds[0],
          'money_transfer',
          'happy',
          'Nhận Tiền Thưởng',
          `${reason} ${recAfter[receiverIds[0]] !== undefined ? `(Số dư: ${recAfter[receiverIds[0]]}đ)` : ''}`,
          amount
        );
      }
    },
    [ctx, triggerCharacterEvent]
  );

  return {
    triggerCashTransfer,
    triggerCharacterEvent,
  };
};
