/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SaveGameData } from '../../../types/saveGame';

export interface ConfirmActionData {
  type: 'overwrite' | 'delete' | 'load';
  slotId: number;
  data?: SaveGameData;
}

interface Props {
  confirmAction: ConfirmActionData;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SaveConfirmDialog: React.FC<Props> = ({
  confirmAction,
  onCancel,
  onConfirm,
}) => {
  return (
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
            onClick={onCancel}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={onConfirm}
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
  );
};
