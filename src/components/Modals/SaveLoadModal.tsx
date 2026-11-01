/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SaveGameData } from '../../types/saveGame';
import { CharacterAvatar } from '../Common/CharacterAvatar';

interface Props {
  slots: (SaveGameData | null)[];
  isPlaying: boolean;
  onSaveToSlot: (slotId: number) => void;
  onLoadFromSlot: (data: SaveGameData) => void;
  onDeleteSlot: (slotId: number) => void;
  onClose: () => void;
}

export const SaveLoadModal: React.FC<Props> = ({
  slots,
  isPlaying,
  onSaveToSlot,
  onLoadFromSlot,
  onDeleteSlot,
  onClose,
}) => {
  const [confirmAction, setConfirmAction] = useState<{
    type: 'overwrite' | 'delete' | 'load';
    slotId: number;
    data?: SaveGameData;
  } | null>(null);

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
    return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · ${d.toLocaleDateString('vi-VN')}`;
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
          {[1, 2, 3].map(slotNum => {
            const save = slots[slotNum - 1];

            return (
              <div
                key={slotNum}
                className={`p-3.5 rounded-xl border transition-all ${
                  save
                    ? 'bg-slate-800/90 border-slate-700 shadow-md'
                    : 'bg-slate-950/40 border-dashed border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-black text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Ô LƯU {slotNum}
                    </span>
                    {save ? (
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDate(save.savedAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Ô lưu trống
                      </span>
                    )}
                  </div>

                  {save && (
                    <button
                      onClick={() => setConfirmAction({ type: 'delete', slotId: slotNum })}
                      className="px-2 py-1 rounded text-[11px] font-semibold text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors"
                      title="Xoá ô lưu này"
                    >
                      🗑️ Xoá
                    </button>
                  )}
                </div>

                {save ? (
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{save.title}</h4>
                      {/* Player Preview */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {save.players.map(p => (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px]"
                          >
                            <CharacterAvatar
                              characterId={p.characterId}
                              isAI={p.isAI}
                              aiNumber={p.id}
                              aiLevel={p.aiLevel}
                              size="sm"
                            />
                            <span className="font-bold text-slate-200">{p.name}:</span>
                            <span className="font-mono text-emerald-400 font-bold">{p.cash}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setConfirmAction({ type: 'load', slotId: slotNum, data: save });
                          } else {
                            onLoadFromSlot(save);
                            onClose();
                          }
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      >
                        <span>▶️</span> Tải Lại Trận Này
                      </button>

                      {isPlaying && (
                        <button
                          onClick={() => setConfirmAction({ type: 'overwrite', slotId: slotNum })}
                          className="py-2 px-3 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>🔄</span> Ghi Đè Trận Hiện Tại
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-500">
                      Chưa có dữ liệu nào được lưu trong ô này.
                    </span>
                    {isPlaying && (
                      <button
                        onClick={() => onSaveToSlot(slotNum)}
                        className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-colors"
                      >
                        💾 Lưu Trận Vào Đây
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-100">
            <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 text-2xl flex items-center justify-center mx-auto border border-rose-500/40">
                ⚠️
              </div>

              <h3 className="font-display font-black text-base text-rose-400 uppercase">
                {confirmAction.type === 'overwrite' && `Cảnh Báo Ghi Đè Ô ${confirmAction.slotId}`}
                {confirmAction.type === 'delete' && `Cảnh Báo Xoá Ô ${confirmAction.slotId}`}
                {confirmAction.type === 'load' && `Xác Nhận Tải Trận Đấu`}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmAction.type === 'overwrite' &&
                  `Ô lưu ${confirmAction.slotId} đang có dữ liệu trận đấu cũ. Nếu ghi đè, toàn bộ tiến trình cũ trong ô này sẽ bị thay thế bằng trận đấu hiện tại!`}
                {confirmAction.type === 'delete' &&
                  `Bạn có chắc chắn muốn xoá vĩnh viễn dữ liệu tại Ô lưu ${confirmAction.slotId}? Hành động này không thể hoàn tác.`}
                {confirmAction.type === 'load' &&
                  `Bạn đang trong một trận đấu. Nếu tải dữ liệu từ Ô lưu ${confirmAction.slotId}, tiến trình của trận đấu hiện tại chưa lưu sẽ bị mất!`}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs text-white shadow ${
                    confirmAction.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmAction.type === 'overwrite'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {confirmAction.type === 'delete' && 'Xác Nhận Xoá'}
                  {confirmAction.type === 'overwrite' && 'Xác Nhận Ghi Đè'}
                  {confirmAction.type === 'load' && 'Tiếp Tục Tải'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
