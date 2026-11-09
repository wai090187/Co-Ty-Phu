/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SaveGameData } from '../../types/saveGame';
import { SaveSlotItem } from './saveload/SaveSlotItem';
import { SaveConfirmDialog, ConfirmActionData } from './saveload/SaveConfirmDialog';

interface Props {
  slots: (SaveGameData | null)[];
  quickSaveSlot?: SaveGameData | null;
  isPlaying: boolean;
  onSaveToSlot: (slotId: number) => void;
  onQuickSave?: () => void;
  onLoadFromSlot: (data: SaveGameData) => void;
  onDeleteSlot: (slotId: number) => void;
  onClose: () => void;
}

export const SaveLoadModal: React.FC<Props> = ({
  slots,
  quickSaveSlot,
  isPlaying,
  onSaveToSlot,
  onQuickSave,
  onLoadFromSlot,
  onDeleteSlot,
  onClose,
}) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmActionData | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (confirmAction) {
          setConfirmAction(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmAction, onClose]);

  const handleConfirm = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'overwrite') {
      onSaveToSlot(confirmAction.slotId);
    } else if (confirmAction.type === 'delete') {
      onDeleteSlot(confirmAction.slotId);
    } else if (confirmAction.type === 'load' && confirmAction.data) {
      onLoadFromSlot(confirmAction.data);
      onClose();
    }
    setConfirmAction(null);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })} · ${d.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💾</span>
            <div>
              <h2 className="font-display font-black text-lg text-amber-400 uppercase tracking-wide">
                Lưu & Tải Trận Đấu
              </h2>
              <span className="text-[11px] text-slate-400">
                Tối đa 3 ô lưu · Lưu trữ an toàn trên thiết bị của bạn
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Slot List */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {/* Quick Save Slot */}
          <div className="p-3 rounded-xl border bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/50 shadow-md">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-900/40">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-black text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span>⚡</span> Ô LƯU NHANH
                </span>
                {quickSaveSlot ? (
                  <span className="text-[11px] text-emerald-300/80 font-medium">
                    {formatDate(quickSaveSlot.savedAt)}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Chưa có bản lưu nhanh</span>
                )}
              </div>
              {quickSaveSlot && (
                <button
                  onClick={() => onDeleteSlot(99)}
                  className="px-2 py-0.5 rounded text-[11px] text-rose-400 hover:text-white"
                >
                  🗑️ Xoá
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-300 truncate">
                {quickSaveSlot ? quickSaveSlot.title : 'Luôn ghi đè ngay lập tức, không cần xác nhận'}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {quickSaveSlot && (
                  <button
                    onClick={() => {
                      onLoadFromSlot(quickSaveSlot);
                      onClose();
                    }}
                    className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    ▶️ Tải
                  </button>
                )}
                {isPlaying && onQuickSave && (
                  <button
                    onClick={onQuickSave}
                    className="py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    <span>⚡</span> Lưu Nhanh
                  </button>
                )}
              </div>
            </div>
          </div>

          {[1, 2, 3].map(slotNum => (
            <SaveSlotItem
              key={slotNum}
              slotNum={slotNum}
              save={slots[slotNum - 1]}
              isPlaying={isPlaying}
              formatDate={formatDate}
              setConfirmAction={setConfirmAction}
              onLoadFromSlot={onLoadFromSlot}
              onSaveToSlot={onSaveToSlot}
              onClose={onClose}
            />
          ))}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            {isPlaying ? '⚡ Bạn đang trong trận đấu.' : '🕹️ Chưa bắt đầu trận đấu.'}
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Đóng Lại
          </button>
        </div>

        {/* Warning Confirmation Modal */}
        {confirmAction && (
          <SaveConfirmDialog
            confirmAction={confirmAction}
            onCancel={() => setConfirmAction(null)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
};
