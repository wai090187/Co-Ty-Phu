/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PermanentAbility, Player } from '../../../types/game';

interface TradeInData {
  newAbility: PermanentAbility;
  oldAbility: PermanentAbility;
  refund: number;
  netCost: number;
}

interface Props {
  confirmTradeIn: TradeInData;
  player: Player;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UtilityTradeInDialog: React.FC<Props> = ({
  confirmTradeIn,
  player,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-amber-600 shadow-2xl p-5 flex flex-col gap-3.5 text-slate-800">
        <div className="flex items-center gap-2 text-amber-700">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-display font-black text-sm uppercase">Xác Nhận Đổi Năng Lực Vĩnh Viễn</h3>
        </div>
        <p className="text-xs text-slate-600">
          Mỗi người chỉ có thể giữ <b>1 Năng Lực Vĩnh Viễn</b>. Bạn có muốn bán năng lực cũ để lấy năng lực mới không?
        </p>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Năng lực cũ:</span>
            <span className="font-bold text-rose-700 line-through">
              {confirmTradeIn.oldAbility.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Giá hoàn lại (50%):</span>
            <span className="font-bold text-emerald-700">+{confirmTradeIn.refund}đ</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-amber-200">
            <span className="text-slate-500">Năng lực mới:</span>
            <span className="font-bold text-amber-900">
              {confirmTradeIn.newAbility.name} ({confirmTradeIn.newAbility.cost}đ)
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-amber-200">
            <span>{confirmTradeIn.netCost >= 0 ? 'Cần bù thêm:' : 'Được thối lại:'}</span>
            <span
              className={
                confirmTradeIn.netCost >= 0
                  ? 'text-amber-700 font-mono'
                  : 'text-emerald-700 font-mono'
              }
            >
              {confirmTradeIn.netCost >= 0
                ? `${confirmTradeIn.netCost}đ`
                : `+${Math.abs(confirmTradeIn.netCost)}đ`}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Tiền mặt hiện tại: <b className="text-slate-800 font-mono">{player.cash}đ</b>
          {confirmTradeIn.netCost > player.cash && (
            <span className="text-rose-600 font-bold block mt-0.5">
              ⚠️ Bạn không đủ tiền mặt để bù chênh lệch!
            </span>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
          >
            Hủy Bỏ (Esc)
          </button>
          <button
            disabled={confirmTradeIn.netCost > player.cash}
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <span>Xác Nhận Đổi</span>
            <kbd className="px-1 py-0.2 bg-white/20 text-[9px] rounded font-mono">Space</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
