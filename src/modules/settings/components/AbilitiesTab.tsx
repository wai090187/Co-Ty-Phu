import React, { useState } from 'react';
import { ConsumableAbility, PermanentAbility, TriggerCondition } from '../../../types/game';
import { AddCustomAbilityForm } from './AddCustomAbilityForm';

interface Props {
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  onUpdateConsumableQuantity: (abilityId: string, quantity: number) => void;
  onUpdatePermanentQuantity: (abilityId: string, quantity: number) => void;
  onAddCustomConsumable: (ability: ConsumableAbility) => void;
  onAddCustomPermanent: (ability: PermanentAbility) => void;
}

export const AbilitiesTab: React.FC<Props> = ({
  consumableShop,
  permanentShop,
  onUpdateConsumableQuantity,
  onUpdatePermanentQuantity,
  onAddCustomConsumable,
  onAddCustomPermanent,
}) => {
  const [abilityFilter, setAbilityFilter] = useState<'all' | 'consumable' | 'permanent'>('all');
  const [abilitySearch, setAbilitySearch] = useState('');
  const [showAddAbilityForm, setShowAddAbilityForm] = useState(false);

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
      case 'when_roll_dice':
        return '🎲 Khi tung xúc xắc';
      case 'when_neighbor':
        return '👥 Đứng cạnh/trùng ô đối thủ';
      case 'when_land_corner':
        return '🏁 Dừng tại 4 ô góc';
      case 'when_pay_tax':
        return '🏛️ Khi phải nộp thuế';
      case 'when_pay_rent':
        return '🏠 Khi trả tiền thuê đất';
      case 'when_visit_station':
        return '🚌 Khi ghé Bến xe';
      case 'manual_anytime':
      default:
        return '⚡ Chủ động kích hoạt';
    }
  };

  return (
    <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAbilityFilter('all')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              abilityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({allAbilities.length})
          </button>
          <button
            onClick={() => setAbilityFilter('consumable')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              abilityFilter === 'consumable'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Dùng 1 Lần / Bến Xe ({consumableShop.length})
          </button>
          <button
            onClick={() => setAbilityFilter('permanent')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              abilityFilter === 'permanent'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Vĩnh Viễn / Điện Nước ({permanentShop.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm kỹ năng..."
            value={abilitySearch}
            onChange={e => setAbilitySearch(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-md text-[11px] w-36 sm:w-44 bg-white"
          />
          <button
            onClick={() => setShowAddAbilityForm(!showAddAbilityForm)}
            className={`px-3 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors ${
              showAddAbilityForm
                ? 'bg-slate-300 text-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            <span>{showAddAbilityForm ? '✕ Đóng Form' : '+ Thiết Kế Năng Lực'}</span>
          </button>
        </div>
      </div>

      {/* Add Ability Form */}
      {showAddAbilityForm && (
        <AddCustomAbilityForm
          onAddConsumable={onAddCustomConsumable}
          onAddPermanent={onAddCustomPermanent}
          onClose={() => setShowAddAbilityForm(false)}
        />
      )}

      {/* Abilities List */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Danh sách năng lực (SL = 0 sẽ không xuất hiện trong shop):</span>
        <span>Tổng: {filteredAbilities.length} năng lực</span>
      </div>

      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
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
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
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
                    <span className="font-bold text-slate-900 text-xs">{ab.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                      {getTriggerLabel(ab.triggerCondition)}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {ab.cost}đ
                    </span>
                    {ab.effectValue !== undefined && ab.effectValue !== null && (
                      <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">
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

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
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
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
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
                    className="w-10 text-center font-mono font-bold text-xs p-0.5 border border-slate-200 rounded"
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
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
