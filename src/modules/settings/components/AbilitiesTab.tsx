/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConsumableAbility, PermanentAbility } from '../../../types/game';
import { AddCustomAbilityForm } from './AddCustomAbilityForm';
import { AbilityCardItem, UnifiedAbilityItem } from './AbilityCardItem';

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
  onResetAbilitiesToDefault?: () => void;
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
  onResetAbilitiesToDefault,
}) => {
  const [abilityFilter, setAbilityFilter] = useState<'all' | 'consumable' | 'permanent'>('all');
  const [abilitySearch, setAbilitySearch] = useState('');
  const [showAddAbilityForm, setShowAddAbilityForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingAbility, setEditingAbility] = useState<UnifiedAbilityItem | null>(null);

  const allAbilities: UnifiedAbilityItem[] = [
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

  const handleStartEdit = (ab: UnifiedAbilityItem) => {
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

      {/* Database Storage Status Banner & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-base">💾</span>
          <div>
            <div className="font-bold text-emerald-950 text-[11.5px] flex items-center gap-1.5">
              <span>Đồng Bộ Cơ Sở Dữ Liệu Tự Động (Database / LocalStorage)</span>
              <span className="text-[9.5px] px-1.5 py-0.2 bg-emerald-200/80 text-emerald-900 rounded font-mono font-bold">
                Đã Lưu
              </span>
            </div>
            <div className="text-[10px] text-emerald-800 mt-0.5">
              Mọi chỉnh sửa, thêm mới và số lượng kho đều được lưu ngược vào Database, tồn tại vĩnh viễn qua các lần tải lại.
            </div>
          </div>
        </div>

        {onResetAbilitiesToDefault && (
          <div className="flex items-center gap-1.5">
            {showResetConfirm ? (
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-red-300 shadow-xs">
                <span className="text-[10px] text-red-700 font-bold px-1">Xác nhận đặt lại?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetAbilitiesToDefault();
                    setShowResetConfirm(false);
                  }}
                  className="px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px] hover:bg-red-700"
                >
                  Có, Đặt Lại
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[10px] hover:bg-slate-300"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10.5px] font-bold shadow-2xs transition-colors flex items-center gap-1"
                title="Khôi phục danh sách kỹ năng về mặc định ban đầu của game"
              >
                <span>🔄</span>
                <span>Khôi Phục Năng Lực Gốc</span>
              </button>
            )}
          </div>
        )}
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
          filteredAbilities.map(ab => (
            <AbilityCardItem
              key={ab.id}
              ab={ab}
              onStartEdit={handleStartEdit}
              onDeleteAbility={onDeleteAbility}
              onUpdateConsumableQuantity={onUpdateConsumableQuantity}
              onUpdatePermanentQuantity={onUpdatePermanentQuantity}
            />
          ))
        )}
      </div>
    </div>
  );
};
