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
import {
  getAvailableTargets,
  getAvailableEffects,
  NO_NUMBER_EFFECTS,
} from '../utils/customAbilityFormHelpers';
import { Ability4PillarWizard } from './Ability4PillarWizard';

interface Props {
  onAddConsumable: (ability: ConsumableAbility) => void;
  onAddPermanent: (ability: PermanentAbility) => void;
  onUpdateConsumable?: (ability: ConsumableAbility) => void;
  onUpdatePermanent?: (ability: PermanentAbility) => void;
  onDeleteAbility?: (abilityId: string, kind: 'consumable' | 'permanent') => void;
  editingAbility?:
    | ((ConsumableAbility & { kind: 'consumable' }) | (PermanentAbility & { kind: 'permanent' }))
    | null;
  onClose: () => void;
}

export const AddCustomAbilityForm: React.FC<Props> = ({
  onAddConsumable,
  onAddPermanent,
  onUpdateConsumable,
  onUpdatePermanent,
  onDeleteAbility,
  editingAbility,
  onClose,
}) => {
  const isEditing = Boolean(editingAbility);

  const [type, setType] = useState<'consumable' | 'permanent'>(
    editingAbility ? editingAbility.kind : 'consumable'
  );
  const [name, setName] = useState(editingAbility?.name || '');
  const [description, setDescription] = useState(editingAbility?.description || '');
  const [cost, setCost] = useState(editingAbility?.cost ?? 50);
  const [quantity, setQuantity] = useState(editingAbility?.quantity ?? 2);
  const [icon] = useState(editingAbility?.icon || 'zap');

  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>(
    editingAbility?.triggerCondition || 'when_opponent_property'
  );
  const [targetScope, setTargetScope] = useState<AbilityTargetScope>(
    editingAbility?.targetScope || 'self'
  );
  const [effectType, setEffectType] = useState<string>(
    editingAbility?.effectType || 'free_rent'
  );
  const [effectValue, setEffectValue] = useState<number>(
    editingAbility?.effectValue || editingAbility?.value || 100
  );

  const availableTargets = getAvailableTargets(triggerCondition);
  const availableEffects = getAvailableEffects(triggerCondition, targetScope);

  const handleTriggerChange = (newTrig: TriggerCondition) => {
    setTriggerCondition(newTrig);
    const newTargets = getAvailableTargets(newTrig);
    const validTarget = newTargets.find(t => t.value === targetScope)
      ? targetScope
      : newTargets[0]?.value || 'self';
    setTargetScope(validTarget);
    const newEffects = getAvailableEffects(newTrig, validTarget);
    setEffectType(newEffects[0]?.value || 'gain_cash_amount');
  };

  const handleTargetChange = (newTarget: AbilityTargetScope) => {
    setTargetScope(newTarget);
    const newEffects = getAvailableEffects(triggerCondition, newTarget);
    setEffectType(newEffects[0]?.value || 'gain_cash_amount');
  };

  const requiresNumber = !NO_NUMBER_EFFECTS.includes(effectType);
  const selectedEffectObj = availableEffects.find(e => e.value === effectType);
  const unitLabel = selectedEffectObj?.unit || (effectType.includes('percent') ? '%' : 'đ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const val = requiresNumber ? Number(effectValue) || 0 : 0;
    const finalId =
      editingAbility?.id ||
      (type === 'consumable' ? `custom-consumable-${Date.now()}` : `custom-perm-${Date.now()}`);

    if (type === 'consumable') {
      const ability: ConsumableAbility = {
        id: finalId,
        name: name.trim(),
        description: description.trim() || 'Kỹ năng sử dụng một lần',
        cost: Math.max(0, Number(cost)),
        icon,
        triggerCondition,
        targetScope,
        effectType: effectType as any,
        effectValue: val,
        value: val,
        quantity: Math.max(0, Number(quantity) || 1),
      };

      if (isEditing && editingAbility && editingAbility.kind !== 'consumable') {
        if (onDeleteAbility) onDeleteAbility(editingAbility.id, 'permanent');
        onAddConsumable(ability);
      } else if (isEditing && onUpdateConsumable) {
        onUpdateConsumable(ability);
      } else {
        onAddConsumable(ability);
      }
    } else {
      const ability: PermanentAbility = {
        id: finalId,
        name: name.trim(),
        description: description.trim() || 'Năng lực vĩnh viễn độc quyền',
        cost: Math.max(0, Number(cost)),
        icon,
        triggerCondition,
        targetScope,
        effectType: effectType as any,
        effectValue: val,
        value: val,
        quantity: Math.max(0, Number(quantity) || 1),
      };

      if (isEditing && editingAbility && editingAbility.kind !== 'permanent') {
        if (onDeleteAbility) onDeleteAbility(editingAbility.id, 'consumable');
        onAddPermanent(ability);
      } else if (isEditing && onUpdatePermanent) {
        onUpdatePermanent(ability);
      } else {
        onAddPermanent(ability);
      }
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl shadow-xl flex flex-col gap-3 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between pb-2 border-b border-emerald-200 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{isEditing ? '✏️' : '✨'}</span>
          <div className="min-w-0">
            <h3 className="font-display font-black text-xs sm:text-sm text-emerald-950 uppercase tracking-wide truncate">
              {isEditing
                ? `Chỉnh Sửa Năng Lực: ${editingAbility?.name}`
                : 'Thiết Kế Năng Lực Mới (Quy Trình 4 Bước)'}
            </h3>
            <span className="text-[10px] text-emerald-700 block truncate">
              Lựa chọn tuần tự từng bước để kích hoạt các tùy chọn tương thích.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md text-xs transition-all flex items-center gap-1.5 border border-emerald-400 cursor-pointer"
          >
            <span>💾</span>
            <span>{isEditing ? 'Lưu Cập Nhật Năng Lực' : 'Tạo Năng Lực'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-6">
          <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Tên kỹ năng:</label>
          <input
            type="text"
            required
            placeholder="VD: Kim Bài Miễn Thuế, Trục Xuất Về Khởi Hành..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-1.5 border border-slate-300 rounded-lg font-bold bg-white text-xs shadow-2xs"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Giá mua (đ):</label>
          <input
            type="number"
            min="0"
            value={cost}
            onChange={e => setCost(Number(e.target.value))}
            className="w-full p-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-xs shadow-2xs"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="font-bold text-slate-800 block text-[11px] mb-0.5">SL trong kho:</label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-full p-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-xs shadow-2xs"
          />
        </div>
      </div>

      <Ability4PillarWizard
        type={type}
        setType={setType}
        triggerCondition={triggerCondition}
        onTriggerChange={handleTriggerChange}
        targetScope={targetScope}
        onTargetChange={handleTargetChange}
        availableTargets={availableTargets}
        effectType={effectType}
        setEffectType={setEffectType}
        availableEffects={availableEffects}
        effectValue={effectValue}
        setEffectValue={setEffectValue}
        requiresNumber={requiresNumber}
        unitLabel={unitLabel}
      />

      <div>
        <label className="font-bold text-slate-800 block text-[11px] mb-0.5">
          Mô tả chi tiết tác dụng:
        </label>
        <input
          type="text"
          placeholder="Mô tả công năng để người chơi dễ hiểu..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-xs shadow-2xs"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
        >
          Hủy Bỏ
        </button>
        <button
          type="submit"
          className="flex-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md text-xs transition-colors"
        >
          {isEditing ? '💾 Lưu Cập Nhật Năng Lực' : '✨ Tạo Năng Lực & Đưa Vào Cửa Hàng'}
        </button>
      </div>
    </form>
  );
};
