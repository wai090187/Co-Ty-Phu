/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { Player, Tile, ConsumableAbility, PermanentAbility } from '../../../types/game';
import { useCheatPropertyActions } from './useCheatPropertyActions';

interface CheatActionsContext {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  tiles: Tile[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  addLog: (msg: string, type?: any) => void;
  resolveTileLanding: (playerId: number, landedTileId: number, diceTotal: number) => void;
}

export const useCheatActions = ({
  setPlayers,
  tiles,
  consumableShop,
  permanentShop,
  addLog,
  resolveTileLanding,
}: CheatActionsContext) => {
  const propertyCheats = useCheatPropertyActions({
    setPlayers,
    tiles,
    addLog,
  });

  const cheatAddConsumable = useCallback(
    (playerId: number, abilityId: string) => {
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            return {
              ...p,
              consumableAbilities: [...p.consumableAbilities, abilityId],
            };
          }
          return p;
        })
      );
      const ab = consumableShop.find(a => a.id === abilityId);
      addLog(
        `🛠️ [Cheat Test] Thêm thẻ năng lực [${ab?.name || abilityId}] cho ${
          targetPlayerName || 'người chơi'
        }`,
        'ability'
      );
    },
    [setPlayers, consumableShop, addLog]
  );

  const cheatRemoveConsumable = useCallback(
    (playerId: number, index: number) => {
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            const nextCards = [...p.consumableAbilities];
            nextCards.splice(index, 1);
            return { ...p, consumableAbilities: nextCards };
          }
          return p;
        })
      );
      addLog(
        `🛠️ [Cheat Test] Xóa 1 thẻ năng lực dùng 1 lần của ${targetPlayerName || 'người chơi'}`,
        'ability'
      );
    },
    [setPlayers, addLog]
  );

  const cheatAddPermanent = useCallback(
    (playerId: number, abilityId: string) => {
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            if (p.permanentAbilities.includes(abilityId)) return p;
            return {
              ...p,
              permanentAbilities: [...p.permanentAbilities, abilityId],
            };
          }
          return p;
        })
      );
      const ab = permanentShop.find(a => a.id === abilityId);
      addLog(
        `🛠️ [Cheat Test] Thêm năng lực VIP [${ab?.name || abilityId}] cho ${
          targetPlayerName || 'người chơi'
        }`,
        'ability'
      );
    },
    [setPlayers, permanentShop, addLog]
  );

  const cheatRemovePermanent = useCallback(
    (playerId: number, abilityId: string) => {
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            return {
              ...p,
              permanentAbilities: p.permanentAbilities.filter(id => id !== abilityId),
            };
          }
          return p;
        })
      );
      const ab = permanentShop.find(a => a.id === abilityId);
      addLog(
        `🛠️ [Cheat Test] Xóa năng lực VIP [${ab?.name || abilityId}] của ${
          targetPlayerName || 'người chơi'
        }`,
        'ability'
      );
    },
    [setPlayers, permanentShop, addLog]
  );

  const cheatSetGetOutOfJailCards = useCallback(
    (playerId: number, count: number) => {
      const safeCount = Math.max(0, count);
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            return { ...p, getOutOfJailCards: safeCount };
          }
          return p;
        })
      );
      addLog(
        `🛠️ [Cheat Test] Đặt số [Thẻ Ra Tù Miễn Phí] của ${
          targetPlayerName || 'người chơi'
        } thành ${safeCount}`,
        'jail'
      );
    },
    [setPlayers, addLog]
  );

  const cheatSetCash = useCallback(
    (playerId: number, amount: number) => {
      const safeCash = Math.max(0, amount);
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            return { ...p, cash: safeCash };
          }
          return p;
        })
      );
      addLog(
        `🛠️ [Cheat Test] Đặt số dư của ${targetPlayerName || 'người chơi'} thành ${safeCash}đ`,
        'money'
      );
    },
    [setPlayers, addLog]
  );

  const cheatToggleJail = useCallback(
    (playerId: number) => {
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            const willBeInJail = !p.inJail;
            return {
              ...p,
              inJail: willBeInJail,
              position: willBeInJail ? 10 : p.position,
              jailTurns: 0,
            };
          }
          return p;
        })
      );
      addLog(
        `🛠️ [Cheat Test] Đổi trạng thái tù/điều tra của ${targetPlayerName || 'người chơi'}`,
        'jail'
      );
    },
    [setPlayers, addLog]
  );

  const cheatTeleportPlayer = useCallback(
    (playerId: number, targetTileId: number, triggerAction = false) => {
      const normalizedPos = (targetTileId + 40) % 40;
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            return { ...p, position: normalizedPos };
          }
          return p;
        })
      );
      const tile = tiles[normalizedPos];
      addLog(
        `🛠️ [Cheat Test] Dịch chuyển ${targetPlayerName || 'người chơi'} đến ô [${
          tile?.name || normalizedPos
        }]${triggerAction ? ' và kích hoạt hành động ô' : ''}`,
        'info'
      );
      if (triggerAction) {
        setTimeout(() => {
          resolveTileLanding(playerId, normalizedPos, 0);
        }, 120);
      }
    },
    [setPlayers, tiles, addLog, resolveTileLanding]
  );

  return {
    ...propertyCheats,
    cheatAddConsumable,
    cheatRemoveConsumable,
    cheatAddPermanent,
    cheatRemovePermanent,
    cheatSetGetOutOfJailCards,
    cheatSetCash,
    cheatToggleJail,
    cheatTeleportPlayer,
  };
};
