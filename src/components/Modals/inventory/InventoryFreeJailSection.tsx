/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../../../types/game';

interface Props {
  player: Player;
  isCurrentTurn: boolean;
  onUseGetOutOfJailCard?: () => void;
}

export const InventoryFreeJailSection: React.FC<Props> = ({
  player,
  isCurrentTurn,
  onUseGetOutOfJailCard,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
        <span className="font-bold text-sm text-slate-900">
          🎟️ Thẻ Thoát Tù Miễn Phí ({player.getOutOfJailCards || 0})
        </span>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
          Tự động kích hoạt khi bị bắt / vào tù
        </span>
      </div>

      {player.getOutOfJailCards > 0 ? (
        <div className="p-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-sm shrink-0">
              🎟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Thẻ Ra Tù Miễn Phí</span>
                <span className="px-2 py-0.5 bg-indigo-600 text-white font-mono font-bold text-[10px] rounded-full">
                  x{player.getOutOfJailCards}
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                Hệ thống tự động kích hoạt thẻ này để bạn không bị giam giữ khi dẫm vào ô Bị Bắt, bị
                áp giải bởi thẻ sự kiện, tung đôi 3 lần hoặc bắt đầu lượt.
              </p>
            </div>
          </div>

          {player.inJail && isCurrentTurn && onUseGetOutOfJailCard && (
            <button
              onClick={onUseGetOutOfJailCard}
              className="px-3.5 py-2 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors shrink-0 animate-pulse"
            >
              Dùng Ngay
            </button>
          )}
        </div>
      ) : (
        <p className="text-slate-400 italic py-1 text-[11px]">
          Chưa sở hữu thẻ này. Bạn có thể rút được từ ô Cơ Hội / Khí Vận hoặc cấp qua Bảng Cheat Test.
        </p>
      )}
    </div>
  );
};
