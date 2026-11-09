/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PermanentAbility, Player } from '../../../types/game';

interface Props {
  abilities: PermanentAbility[];
  ownedAbilities: PermanentAbility[];
  player: Player;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  onAttemptBuy: (ability: PermanentAbility) => void;
}

export const UtilityOfferedAbilitiesSection: React.FC<Props> = ({
  abilities,
  ownedAbilities,
  player,
  selectedIndex,
  setSelectedIndex,
  onAttemptBuy,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1">
          <span>🎁</span> Mở Bán Độc Quyền Lượt Này ({abilities.length}/2):
        </span>
        <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
          Chưa có ai sở hữu
        </span>
      </div>

      {abilities.length === 0 ? (
        <div className="text-center py-6 bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
          Hiện tại tất cả năng lực đặc biệt đã có người khác sở hữu độc quyền hoặc hết hàng!
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {abilities.map((ab, idx) => {
            const tradeInRefund =
              ownedAbilities.length > 0 ? Math.round(ownedAbilities[0].cost * 0.5) : 0;
            const netRequired = ownedAbilities.length > 0 ? ab.cost - tradeInRefund : ab.cost;
            const canAfford = player.cash >= netRequired;
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={ab.id}
                onClick={() => setSelectedIndex(idx)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs relative ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/90 ring-3 ring-amber-400 scale-[1.01]'
                    : 'border-amber-300 bg-amber-50/50 hover:border-amber-400'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{ab.name}</span>
                    <span className="text-xs font-mono font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                      {ab.cost} đ
                    </span>
                    {ownedAbilities.length > 0 && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                        Đổi bù: {netRequired >= 0 ? `${netRequired}đ` : `+${Math.abs(netRequired)}đ`}
                      </span>
                    )}
                    <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                      Chưa có chủ
                    </span>
                    {isSelected && (
                      <span className="text-[9.5px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded border border-amber-400 flex items-center gap-1">
                        <span>👉</span> Đang chọn (↑ / ↓)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-1">{ab.description}</p>
                </div>

                <button
                  onClick={() => onAttemptBuy(ab)}
                  disabled={!canAfford}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                    canAfford
                      ? isSelected
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md ring-2 ring-amber-300'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>
                    {canAfford
                      ? ownedAbilities.length > 0
                        ? 'Đổi Mới'
                        : 'Mua Ngay'
                      : 'Hết Tiền'}
                  </span>
                  {canAfford && isSelected && (
                    <kbd className="px-1.5 py-0.2 text-[9px] bg-white/25 rounded border border-white/40 font-mono">
                      Space
                    </kbd>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
