/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { Player, Tile } from '../../../types/game';

interface Props {
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  tiles: Tile[];
  addLog: (msg: string, type?: any) => void;
}

export const useCheatPropertyActions = ({ setPlayers, tiles, addLog }: Props) => {
  const cheatTogglePropertyOwner = useCallback(
    (playerId: number, tileId: number) => {
      setPlayers(prev => {
        const targetP = prev.find(p => p.id === playerId);
        if (!targetP) return prev;
        const isOwnedByTarget = targetP.propertiesOwned.includes(tileId);

        const next = prev.map(p => {
          const hasIt = p.propertiesOwned.includes(tileId);
          if (p.id === playerId) {
            if (isOwnedByTarget) {
              const newProps = p.propertiesOwned.filter(id => id !== tileId);
              const newHouses = { ...p.houses };
              delete newHouses[tileId];
              const newMortgaged = { ...p.mortgaged };
              delete newMortgaged[tileId];
              return { ...p, propertiesOwned: newProps, houses: newHouses, mortgaged: newMortgaged };
            } else {
              return {
                ...p,
                propertiesOwned: [...p.propertiesOwned, tileId],
                houses: { ...p.houses, [tileId]: 0 },
              };
            }
          } else if (hasIt) {
            const newProps = p.propertiesOwned.filter(id => id !== tileId);
            const newHouses = { ...p.houses };
            delete newHouses[tileId];
            const newMortgaged = { ...p.mortgaged };
            delete newMortgaged[tileId];
            return { ...p, propertiesOwned: newProps, houses: newHouses, mortgaged: newMortgaged };
          }
          return p;
        });

        const tile = tiles[tileId];
        if (isOwnedByTarget) {
          addLog(
            `🛠️ [Cheat Test] Thu hồi ô [${tile?.name || tileId}] từ ${targetP.name} về Ngân Hàng`,
            'property'
          );
        } else {
          addLog(
            `🛠️ [Cheat Test] Gán ô đất [${tile?.name || tileId}] cho ${targetP.name}`,
            'property'
          );
        }
        return next;
      });
    },
    [setPlayers, tiles, addLog]
  );

  const cheatSetPropertyHouses = useCallback(
    (playerId: number, tileId: number, count: number) => {
      const clamped = Math.max(0, Math.min(5, count));
      let targetPlayerName = '';
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            targetPlayerName = p.name;
            const owned = p.propertiesOwned.includes(tileId)
              ? p.propertiesOwned
              : [...p.propertiesOwned, tileId];
            return {
              ...p,
              propertiesOwned: owned,
              houses: { ...p.houses, [tileId]: clamped },
            };
          }
          return p;
        })
      );
      const tile = tiles[tileId];
      addLog(
        `🛠️ [Cheat Test] Đổi cấp nhà của ${targetPlayerName || 'người chơi'} tại [${tile?.name}] thành ${
          clamped === 5 ? 'Khách Sạn' : `${clamped} nhà`
        }`,
        'property'
      );
    },
    [setPlayers, tiles, addLog]
  );

  return {
    cheatTogglePropertyOwner,
    cheatSetPropertyHouses,
  };
};
