/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmExitModal: React.FC<Props> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF8F5] border-2 border-rose-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h2 className="font-display text-base font-black tracking-wide uppercase">
              Xác Nhận Rời Ván Đấu
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-slate-800 text-sm space-y-3">
          <p className="font-semibold text-slate-900 leading-relaxed">
            Bạn có chắc chắn muốn kết thúc ván đấu hiện tại và trở về <span className="text-rose-700 font-bold">Menu Chính</span> không?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 leading-relaxed">
            💡 <b>Lưu ý:</b> Tiến trình ván cờ hiện tại sẽ bị xóa hoàn toàn. Nếu muốn tiếp tục sau này, bạn nên dùng tính năng <b>Lưu Nhanh</b> trước khi thoát.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Tiếp Tục Chơi
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>🏠</span>
            <span>Về Menu Chính (Xóa Ván)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
