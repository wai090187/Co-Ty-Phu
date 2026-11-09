/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ConsumableAbility, PermanentAbility, TriggerCondition, AbilityTargetScope } from '../../../types/game';

export type UnifiedAbilityItem =
  | (ConsumableAbility & { kind: 'consumable' })
  | (PermanentAbility & { kind: 'permanent' });

interface Props {
  ab: UnifiedAbilityItem;
  onStartEdit: (ab: UnifiedAbilityItem) => void;
  onDeleteAbility?: (id: string, kind: 'consumable' | 'permanent') => void;
  onUpdateConsumableQuantity: (abilityId: string, quantity: number) => void;
  onUpdatePermanentQuantity: (abilityId: string, quantity: number) => void;
}

export const getTriggerLabel = (trig: TriggerCondition) => {
  switch (trig) {
    case 'instant_on_buy':
      return '⚡ Ngay sau khi mua';
    case 'when_roll_dice':
      return '🎲 Khi tung xúc xắc';
    case 'when_neighbor':
      return '🚶 Cạnh đối thủ (1 ô)';
    case 'when_same_tile':
      return '👥 Đứng cùng ô đối thủ';
    case 'when_own_property':
      return '🏰 Đứng tại đất của mình';
    case 'when_opponent_property':
      return '⚔️ Đứng tại đất đối thủ';
    case 'when_land_corner':
      return '🏁 Dừng tại 4 ô góc';
    case 'when_pay_tax':
      return '🏛️ Khi phải nộp thuế';
    case 'when_pay_rent':
      return '🏠 Khi trả tiền thuê đất';
    case 'when_visit_station':
      return '✈️ Ghé Sân bay / Bến xe';
    case 'manual_anytime':
    default:
      return '🎒 Bấm dùng trong túi đồ';
  }
};

export const getTargetLabel = (target?: AbilityTargetScope) => {
  switch (target) {
    case 'self':
      return 'Bản thân';
    case 'target_opponent':
      return 'Đối thủ tương tác';
    case 'target_richest':
      return 'Người giàu nhất';
    case 'target_poorest':
      return 'Người nghèo nhất';
    case 'target_adjacent_turns':
      return 'Lượt trước & sau';
    case 'target_all_players':
      return 'Tất cả người chơi';
    case 'target_choose_1':
      return '1 người chỉ định';
    case 'target_bank':
      return 'Ngân hàng';
    default:
      return 'Bản thân';
  }
};

export const AbilityCardItem: React.FC<Props> = ({
  ab,
  onStartEdit,
  onDeleteAbility,
  onUpdateConsumableQuantity,
  onUpdatePermanentQuantity,
}) => {
  const qty = ab.quantity ?? 1;
  const isZero = qty === 0;

  return (
    <div
      className={`p-3 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
        isZero
          ? 'bg-slate-100 border-slate-300 opacity-60'
          : ab.kind === 'consumable'
          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
          : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              ab.kind === 'consumable' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {ab.kind === 'consumable' ? 'Dùng 1 lần' : 'Vĩnh viễn'}
          </span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{ab.name}</span>
          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            {getTriggerLabel(ab.triggerCondition)}
          </span>
          {ab.targetScope && (
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
              🎯 {getTargetLabel(ab.targetScope)}
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
            {ab.cost}đ
          </span>
          {ab.effectValue !== undefined && ab.effectValue !== null && ab.effectValue > 0 && (
            <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200">
              Trị số: {ab.effectValue}
            </span>
          )}
          {isZero && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              🚫 Hết hàng / Ẩn (SL: 0)
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{ab.description}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onStartEdit(ab)}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1 transition-all active:scale-95"
          title="Chỉnh sửa chi tiết năng lực này"
        >
          <span>✏️</span>
          <span>Sửa</span>
        </button>

        {onDeleteAbility && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa vĩnh viễn năng lực "${ab.name}" khỏi cửa hàng không?`)) {
                onDeleteAbility(ab.id, ab.kind);
              }
            }}
            className="p-1 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-lg text-xs shadow-2xs transition-all"
            title="Xóa kỹ năng này"
          >
            🗑️
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold px-1">Kho:</span>
          <button
            type="button"
            onClick={() => {
              if (ab.kind === 'consumable') {
                onUpdateConsumableQuantity(ab.id, Math.max(0, qty - 1));
              } else {
                onUpdatePermanentQuantity(ab.id, Math.max(0, qty - 1));
              }
            }}
            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={e => {
              const val = Math.max(0, Number(e.target.value) || 0);
              if (ab.kind === 'consumable') {
                onUpdateConsumableQuantity(ab.id, val);
              } else {
                onUpdatePermanentQuantity(ab.id, val);
              }
            }}
            className="w-9 text-center font-mono font-bold text-xs p-0.5 border border-slate-200 rounded"
          />
          <button
            type="button"
            onClick={() => {
              if (ab.kind === 'consumable') {
                onUpdateConsumableQuantity(ab.id, qty + 1);
              } else {
                onUpdatePermanentQuantity(ab.id, qty + 1);
              }
            }}
            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
