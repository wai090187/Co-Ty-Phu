/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ConsumableAbility,
  PermanentAbility,
  TriggerCondition,
  AbilityTargetScope,
} from '../../../types/game';
import { AddCustomAbilityForm } from './AddCustomAbilityForm';

interface Props {
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  onUpdateConsumableQuantity: (abilityId: string, quantity: number) => void;
  onUpdatePermanentQuantity: (abilityId: string, quantity: number) => void;
  onAddCustomConsumable: (ability: ConsumableAbility) => void;
  onAddCustomPermanent: (ability: PermanentAbility) => void;
  onUpdateConsumable?: (ability: ConsumableAbility) => void;
  onUpdatePermanent?: (ability: PermanentAbility) => void;
  onDeleteAbility?: (abilityId: string, kind: 'consumable' | 'permanent') => void;
}

export const AbilitiesTab: React.FC<Props> = ({
  consumableShop,
  permanentShop,
  onUpdateConsumableQuantity,
  onUpdatePermanentQuantity,
  onAddCustomConsumable,
  onAddCustomPermanent,
  onUpdateConsumable,
  onUpdatePermanent,
  onDeleteAbility,
}) => {
  const [abilityFilter, setAbilityFilter] = useState<'all' | 'consumable' | 'permanent'>('all');
  const [abilitySearch, setAbilitySearch] = useState('');
  const [showAddAbilityForm, setShowAddAbilityForm] = useState(false);
  const [editingAbility, setEditingAbility] = useState<
    ((ConsumableAbility & { kind: 'consumable' }) | (PermanentAbility & { kind: 'permanent' })) | null
  >(null);

  const allAbilities = [
    ...consumableShop.map(a => ({ ...a, kind: 'consumable' as const })),
    ...permanentShop.map(a => ({ ...a, kind: 'permanent' as const })),
  ];

  const filteredAbilities = allAbilities.filter(a => {
    if (abilityFilter !== 'all' && a.kind !== abilityFilter) return false;
    if (abilitySearch.trim()) {
      const q = abilitySearch.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  const getTriggerLabel = (trig: TriggerCondition) => {
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

  const getTargetLabel = (target?: AbilityTargetScope) => {
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

  const handleStartEdit = (ab: (ConsumableAbility & { kind: 'consumable' }) | (PermanentAbility & { kind: 'permanent' })) => {
    setEditingAbility(ab);
    setShowAddAbilityForm(true);
  };

  const handleOpenCreate = () => {
    setEditingAbility(null);
    setShowAddAbilityForm(true);
  };

  const handleCloseForm = () => {
    setShowAddAbilityForm(false);
    setEditingAbility(null);
  };

  return (
    <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setAbilityFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
              abilityFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({allAbilities.length})
          </button>
          <button
            onClick={() => setAbilityFilter('consumable')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
              abilityFilter === 'consumable'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ⚡ Dùng 1 Lần / Bến Xe ({consumableShop.length})
          </button>
          <button
            onClick={() => setAbilityFilter('permanent')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
              abilityFilter === 'permanent'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            👑 Vĩnh Viễn / Điện Nước ({permanentShop.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm kỹ năng..."
            value={abilitySearch}
            onChange={e => setAbilitySearch(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-[11px] w-36 sm:w-44 bg-white shadow-2xs"
          />
          <button
            onClick={() => {
              if (showAddAbilityForm) {
                handleCloseForm();
              } else {
                handleOpenCreate();
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              showAddAbilityForm
                ? 'bg-slate-300 text-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <span>{showAddAbilityForm ? '✕ Đóng Form' : '+ Thiết Kế Năng Lực'}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Ability Form Modal / Accordion */}
      {showAddAbilityForm && (
        <AddCustomAbilityForm
          onAddConsumable={onAddCustomConsumable}
          onAddPermanent={onAddCustomPermanent}
          onUpdateConsumable={onUpdateConsumable}
          onUpdatePermanent={onUpdatePermanent}
          onDeleteAbility={onDeleteAbility}
          editingAbility={editingAbility}
          onClose={handleCloseForm}
        />
      )}

      {/* Abilities List Header */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
        <span>Danh sách năng lực (SL = 0 sẽ không xuất hiện trong shop; có thể chỉnh sửa mọi kỹ năng):</span>
        <span>Tổng: {filteredAbilities.length} năng lực</span>
      </div>

      {/* Abilities Cards List */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredAbilities.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            Không tìm thấy năng lực nào phù hợp với bộ lọc!
          </div>
        ) : (
          filteredAbilities.map(ab => {
            const qty = ab.quantity ?? 1;
            const isZero = qty === 0;

            return (
              <div
                key={ab.id}
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

                {/* Right Controls: Edit, Delete & Quantity Stepper */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(ab)}
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

                  {/* Quantity Stepper */}
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
          })
        )}
      </div>
    </div>
  );
};
