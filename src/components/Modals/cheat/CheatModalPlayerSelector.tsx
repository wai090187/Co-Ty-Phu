/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../../../types/game';

interface Props {
  players: Player[];
  selectedPlayerId: number;
  onSelectPlayer: (id: number) => void;
}

export const CheatModalPlayerSelector: React.FC<Props> = ({
  players,
  selectedPlayerId,
  onSelectPlayer,
}) => {
  return (
    <div className="shrink-0 p-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
        Chọn người chơi:
      </span>
      <div className="flex items-center gap-2">
        {players.map(p => (
          <button
            key={p.id}
            onClick={() => onSelectPlayer(p.id)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              p.id === selectedPlayerId
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 ring-2 ring-rose-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/50"
              style={{ backgroundColor: p.color }}
            />
            <span>{p.name}</span>
            <span className="font-mono text-[11px] opacity-80">({p.cash}đ)</span>
            {p.inJail && (
              <span className="text-[10px] px-1 bg-red-950 text-red-300 rounded font-bold">
                Tù
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
