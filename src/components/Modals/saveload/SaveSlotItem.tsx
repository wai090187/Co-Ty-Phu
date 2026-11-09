/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SaveGameData } from '../../../types/saveGame';
import { CharacterAvatar } from '../../Common/CharacterAvatar';
import { ConfirmActionData } from './SaveConfirmDialog';

interface Props {
  slotNum: number;
  save: SaveGameData | null;
  isPlaying: boolean;
  formatDate: (timestamp: number) => string;
  setConfirmAction: (action: ConfirmActionData) => void;
  onLoadFromSlot: (data: SaveGameData) => void;
  onSaveToSlot: (slotId: number) => void;
  onClose: () => void;
}

export const SaveSlotItem: React.FC<Props> = ({
  slotNum,
  save,
  isPlaying,
  formatDate,
  setConfirmAction,
  onLoadFromSlot,
  onSaveToSlot,
  onClose,
}) => {
  return (
    <div
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
            <span className="text-xs text-slate-400 font-medium">{formatDate(save.savedAt)}</span>
          ) : (
            <span className="text-xs text-slate-500 italic">Ô lưu trống</span>
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
          <span className="text-xs text-slate-500">Chưa có dữ liệu nào được lưu trong ô này.</span>
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
};
