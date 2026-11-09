/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Tile } from '../../../types/game';

interface Props {
  selectedPlayer: Player;
  players: Player[];
  purchasableTiles: Tile[];
  onTogglePropertyOwner: (playerId: number, tileId: number) => void;
  onSetPropertyHouses: (playerId: number, tileId: number, count: number) => void;
}

export const CheatPropertiesTab: React.FC<Props> = ({
  selectedPlayer,
  players,
  purchasableTiles,
  onTogglePropertyOwner,
  onSetPropertyHouses,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
        <span className="text-slate-300">
          Đang can thiệp tài sản của: <b className="text-rose-300">{selectedPlayer.name}</b>
        </span>
        <span className="text-slate-400 text-[11px]">
          Bấm gán đất hoặc tăng/giảm cấp nhà (0 = đất trống, 1-4 = nhà, 5 = khách sạn)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {purchasableTiles.map(tile => {
          const owner = players.find(p => p.propertiesOwned.includes(tile.id));
          const isOwnedBySelected = owner?.id === selectedPlayer.id;
          const houseCount = selectedPlayer.houses[tile.id] || 0;

          return (
            <div
              key={tile.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                isOwnedBySelected
                  ? 'bg-slate-800 border-rose-500/70 shadow-md ring-1 ring-rose-500/40'
                  : owner
                  ? 'bg-slate-900/90 border-slate-700 opacity-80'
                  : 'bg-slate-900/60 border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400">#{tile.id}</span>
                    <span className="font-bold text-slate-100">{tile.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                      {tile.price}đ
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Chủ sở hữu:{' '}
                    {owner ? (
                      <span className={owner.id === selectedPlayer.id ? 'text-rose-300 font-bold' : 'text-slate-300'}>
                        {owner.name}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Vô chủ (Ngân hàng)</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onTogglePropertyOwner(selectedPlayer.id, tile.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0 ${
                    isOwnedBySelected
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {isOwnedBySelected ? 'Bỏ Sở Hữu' : 'Gán Cho Người Này'}
                </button>
              </div>

              {/* House controls if property */}
              {tile.type === 'property' && isOwnedBySelected && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
                  <span className="text-slate-300">
                    Cấp nhà:{' '}
                    <b className="text-amber-400 font-mono">
                      {houseCount === 0
                        ? '0 (Đất trống)'
                        : houseCount === 5
                        ? '🏨 Khách sạn'
                        : `🏠 ${houseCount} nhà`}
                    </b>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSetPropertyHouses(selectedPlayer.id, tile.id, Math.max(0, houseCount - 1))}
                      disabled={houseCount <= 0}
                      className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onSetPropertyHouses(selectedPlayer.id, tile.id, Math.min(5, houseCount + 1))}
                      disabled={houseCount >= 5}
                      className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onSetPropertyHouses(selectedPlayer.id, tile.id, 5)}
                      className="px-2 h-6 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] ml-1"
                    >
                      Max 🏨
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
