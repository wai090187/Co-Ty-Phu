import { useCallback } from 'react';
import { Player, CashTransferEvent, CharacterEvent } from '../../../types/game';

interface GameEventsContext {
  setCashTransferEvent: (e: CashTransferEvent | null) => void;
  setCharacterEvent: (e: CharacterEvent | null) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export const useGameEvents = (ctx: GameEventsContext) => {
  const triggerCashTransfer = useCallback(
    (payerId: number | undefined, receiverIds: number[], amount: number, reason: string) => {
      ctx.setCashTransferEvent({
        id: `transfer-${Date.now()}-${Math.random()}`,
        payerId,
        receiverIds,
        amount,
        reason,
        timestamp: Date.now(),
      });
      ctx.setPlayers(prev =>
        prev.map(p => {
          if (payerId !== undefined && p.id === payerId) {
            return { ...p, emotion: 'sad', emotionMessage: `-${amount}đ`, emotionTimestamp: Date.now() };
          }
          if (receiverIds.includes(p.id)) {
            return { ...p, emotion: 'happy', emotionMessage: `+${amount}đ`, emotionTimestamp: Date.now() };
          }
          return p;
        })
      );
    },
    [ctx]
  );

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

  return {
    triggerCashTransfer,
    triggerCharacterEvent,
  };
};
