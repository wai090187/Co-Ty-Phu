/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Props {
  onClose: () => void;
}

export const CheatModalHeader: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="shrink-0 p-3.5 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-500/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-rose-600/40">
          🛠️
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-black tracking-wide uppercase text-rose-300">
              Bảng Điều Khiển Cheat & Kiểm Thử
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-mono text-[10px] font-bold border border-rose-400/40">
              TEST MODE
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Tự do can thiệp đất đai, nhà cửa, kỹ năng, xúc xắc và các thẻ sự kiện để test game.
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};
