/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface Props {
  cheatNextDice: [number, number] | null;
  onSetCheatNextDice: (dice: [number, number] | null) => void;
}

export const CheatDiceTab: React.FC<Props> = ({ cheatNextDice, onSetCheatNextDice }) => {
  const [diceD1, setDiceD1] = useState<number>(cheatNextDice ? cheatNextDice[0] : 6);
  const [diceD2, setDiceD2] = useState<number>(cheatNextDice ? cheatNextDice[1] : 6);

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
        <span className="font-bold text-rose-300 text-sm block mb-1">
          Chỉ Định Giá Trị Xúc Xắc Tiếp Theo
        </span>
        <p className="text-slate-400 text-xs">
          Khi người chơi tung xúc xắc trong lượt tới, hệ thống sẽ sử dụng chính xác kết quả bạn thiết lập dưới đây thay vì ngẫu nhiên.
        </p>
      </div>

      <div className="p-3 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-[11px] block">Trạng thái hiện tại:</span>
          {cheatNextDice ? (
            <span className="font-bold text-emerald-400 text-sm font-mono">
              🎯 Đã ghim: [{cheatNextDice[0]}] và [{cheatNextDice[1]}] (Tổng: {cheatNextDice[0] + cheatNextDice[1]})
            </span>
          ) : (
            <span className="text-slate-400 italic">🎲 Ngẫu nhiên bình thường (chưa ghim)</span>
          )}
        </div>
        {cheatNextDice && (
          <button
            onClick={() => onSetCheatNextDice(null)}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded-lg font-bold text-xs"
          >
            Hủy Ghim
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="font-bold text-slate-200 block mb-2">Xúc Xắc 1 (1 - 6):</span>
          <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(val => (
              <button
                key={val}
                onClick={() => setDiceD1(val)}
                className={`py-2 rounded-lg font-mono font-bold text-sm border transition-all ${
                  diceD1 === val
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="font-bold text-slate-200 block mb-2">Xúc Xắc 2 (1 - 6):</span>
          <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(val => (
              <button
                key={val}
                onClick={() => setDiceD2(val)}
                className={`py-2 rounded-lg font-mono font-bold text-sm border transition-all ${
                  diceD2 === val
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 mr-1">Phím nhanh:</span>
        <button
          onClick={() => {
            setDiceD1(1);
            setDiceD2(1);
          }}
          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
        >
          Đôi 1-1 (Ra tù)
        </button>
        <button
          onClick={() => {
            setDiceD1(6);
            setDiceD2(6);
          }}
          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
        >
          Đôi 6-6 (Max 12)
        </button>
        <button
          onClick={() => {
            setDiceD1(3);
            setDiceD2(4);
          }}
          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
        >
          Tổng 7 (Lucky 7)
        </button>
        <button
          onClick={() => {
            setDiceD1(1);
            setDiceD2(2);
          }}
          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
        >
          Tổng 3 (Ngắn)
        </button>
      </div>

      <button
        onClick={() => onSetCheatNextDice([diceD1, diceD2])}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
      >
        Khóa Giá Trị: [{diceD1}] và [{diceD2}] (Tổng: {diceD1 + diceD2} bước)
      </button>
    </div>
  );
};
