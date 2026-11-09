/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../../types/game';

interface Props {
  chanceDeck: Card[];
  chestDeck: Card[];
  cheatNextChanceCardId: string | null;
  onSetCheatNextChanceCardId: (id: string | null) => void;
  cheatNextChestCardId: string | null;
  onSetCheatNextChestCardId: (id: string | null) => void;
}

export const CheatCardsTab: React.FC<Props> = ({
  chanceDeck,
  chestDeck,
  cheatNextChanceCardId,
  onSetCheatNextChanceCardId,
  cheatNextChestCardId,
  onSetCheatNextChestCardId,
}) => {
  const [selectedChanceId, setSelectedChanceId] = useState<string>('');
  const [selectedChestId, setSelectedChestId] = useState<string>('');

  useEffect(() => {
    if (chanceDeck.length > 0 && !selectedChanceId) {
      setSelectedChanceId(chanceDeck[0].id);
    }
  }, [chanceDeck, selectedChanceId]);

  useEffect(() => {
    if (chestDeck.length > 0 && !selectedChestId) {
      setSelectedChestId(chestDeck[0].id);
    }
  }, [chestDeck, selectedChestId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
        <span className="font-bold text-rose-300 text-sm block mb-1">
          Chỉ Định Thẻ Cơ Hội & Khí Vận Tiếp Theo
        </span>
        <p className="text-slate-400 text-xs">
          Khi người chơi đi vào ô Cơ Hội hoặc Khí Vận, lá bài bạn chọn ở đây sẽ được rút ra đầu tiên.
        </p>
      </div>

      {/* Chance Card Picker */}
      <div className="p-3.5 rounded-xl border border-amber-500/40 bg-slate-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-300 text-sm">
            ❓ Thẻ Cơ Hội (Chance) Tiếp Theo
          </span>
          {cheatNextChanceCardId ? (
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px]">
              ĐÃ GHIM
            </span>
          ) : (
            <span className="text-slate-400 italic text-[11px]">Ngẫu nhiên</span>
          )}
        </div>

        <select
          value={selectedChanceId}
          onChange={e => setSelectedChanceId(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
        >
          {chanceDeck.map(c => (
            <option key={c.id} value={c.id}>
              {c.title}: {c.description}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedChanceId) onSetCheatNextChanceCardId(selectedChanceId);
            }}
            className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow cursor-pointer"
          >
            Ghim Thẻ Cơ Hội Này
          </button>
          {cheatNextChanceCardId && (
            <button
              onClick={() => onSetCheatNextChanceCardId(null)}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* Chest Card Picker */}
      <div className="p-3.5 rounded-xl border border-sky-500/40 bg-slate-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sky-300 text-sm">
            💼 Thẻ Khí Vận (Community Chest) Tiếp Theo
          </span>
          {cheatNextChestCardId ? (
            <span className="px-2 py-0.5 rounded bg-sky-500 text-slate-900 font-bold text-[10px]">
              ĐÃ GHIM
            </span>
          ) : (
            <span className="text-slate-400 italic text-[11px]">Ngẫu nhiên</span>
          )}
        </div>

        <select
          value={selectedChestId}
          onChange={e => setSelectedChestId(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
        >
          {chestDeck.map(c => (
            <option key={c.id} value={c.id}>
              {c.title}: {c.description}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedChestId) onSetCheatNextChestCardId(selectedChestId);
            }}
            className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow cursor-pointer"
          >
            Ghim Thẻ Khí Vận Này
          </button>
          {cheatNextChestCardId && (
            <button
              onClick={() => onSetCheatNextChestCardId(null)}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
