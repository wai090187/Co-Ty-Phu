/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

interface Props {
  state: any;
  activePlayer: Player | null;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string) => void;
}

export const useOutOfJailAction = ({ state, activePlayer, triggerCharacterEvent }: Props) => {
  const useGetOutOfJailCard = useCallback(
    (playerId?: number) => {
      const targetId = playerId ?? activePlayer?.id;
      if (!targetId) return;

      sounds.ability();
      state.setPlayers((prev: Player[]) =>
        prev.map(p => {
          if (p.id === targetId && p.getOutOfJailCards > 0 && p.inJail) {
            return {
              ...p,
              inJail: false,
              jailTurns: 0,
              getOutOfJailCards: p.getOutOfJailCards - 1,
            };
          }
          return p;
        })
      );

      const p = state.players.find((x: Player) => x.id === targetId);
      if (p && p.getOutOfJailCards > 0 && p.inJail) {
        const remainingCards = p.getOutOfJailCards - 1;
        const isInv = state.settings.jailMode === 'investigation';
        const msg = isInv
          ? `🕊️ [Dùng Thẻ Ra Tù] ${p.name} đã sử dụng Thẻ Ra Tù Miễn Phí để thoát khỏi diện điều tra thành công! (Không mất tiền, còn lại: ${remainingCards} thẻ)`
          : `🕊️ [Dùng Thẻ Ra Tù] ${p.name} đã sử dụng Thẻ Ra Tù Miễn Phí để ra tù thành công! (Không mất tiền, còn lại: ${remainingCards} thẻ)`;
        state.addLog(msg, 'jail');
        triggerCharacterEvent(p.id, 'cleared_investigation', 'happy', 'Dùng Thẻ Ra Tù', msg);
      }
    },
    [activePlayer, state, triggerCharacterEvent]
  );

  return { useGetOutOfJailCard };
};
