/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TriggerCondition, AbilityTargetScope } from '../../../types/game';

interface Props {
  type: 'consumable' | 'permanent';
  setType: (t: 'consumable' | 'permanent') => void;
  triggerCondition: TriggerCondition;
  onTriggerChange: (trig: TriggerCondition) => void;
  targetScope: AbilityTargetScope;
  onTargetChange: (target: AbilityTargetScope) => void;
  availableTargets: { value: AbilityTargetScope; label: string }[];
  effectType: string;
  setEffectType: (ef: string) => void;
  availableEffects: { value: string; label: string; unit?: string }[];
  effectValue: number;
  setEffectValue: (v: number) => void;
  requiresNumber: boolean;
  unitLabel: string;
}

export const Ability4PillarWizard: React.FC<Props> = ({
  type,
  setType,
  triggerCondition,
  onTriggerChange,
  targetScope,
  onTargetChange,
  availableTargets,
  effectType,
  setEffectType,
  availableEffects,
  effectValue,
  setEffectValue,
  requiresNumber,
  unitLabel,
}) => {
  return (
    <div className="p-3 bg-white border border-emerald-300/80 rounded-xl flex flex-col gap-2.5 shadow-2xs">
      <div className="text-[11px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
        <span>⚙️</span> Thiết Lập Quan Hệ 4 Thuộc Tính (Tuần Tự)
      </div>

      {/* Step 1: Type Selection */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
            1
          </span>
          Loại Năng Lực:
        </span>
        <div className="flex items-center gap-2">
          <label
            className={`px-2.5 py-1 rounded-md cursor-pointer border text-xs font-bold transition-all ${
              type === 'consumable'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <input
              type="radio"
              name="abilityKind"
              value="consumable"
              checked={type === 'consumable'}
              onChange={() => setType('consumable')}
              className="hidden"
            />
            ⚡ Dùng 1 Lần (Bán tại 4 Bến Xe)
          </label>
          <label
            className={`px-2.5 py-1 rounded-md cursor-pointer border text-xs font-bold transition-all ${
              type === 'permanent'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <input
              type="radio"
              name="abilityKind"
              value="permanent"
              checked={type === 'permanent'}
              onChange={() => setType('permanent')}
              className="hidden"
            />
            👑 Vĩnh Viễn (Bán tại Điện & Nước)
          </label>
        </div>
      </div>

      {/* Step 2: Trigger Condition */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
            2
          </span>
          Điều Kiện Kích Hoạt:
        </span>
        <select
          value={triggerCondition}
          onChange={e => onTriggerChange(e.target.value as TriggerCondition)}
          className="p-1.5 border border-slate-300 rounded-lg font-bold bg-white text-xs max-w-full sm:max-w-xs"
        >
          <option value="instant_on_buy">⚡ Tự động kích hoạt ngay sau khi mua</option>
          <option value="when_opponent_property">⚔️ Khi đứng tại ô đất của đối thủ</option>
          <option value="when_same_tile">👥 Khi đứng cùng ô với đối thủ</option>
          <option value="when_own_property">🏰 Khi đứng tại ô đất của chính mình</option>
          <option value="when_visit_station">✈️ Khi đến ô Sân bay / Bến xe</option>
          <option value="when_neighbor">🚶 Khi đứng cạnh đối thủ (trước/sau 1 ô)</option>
          <option value="when_roll_dice">🎲 Sau khi tung xúc xắc</option>
          <option value="when_land_corner">🏁 Dừng chân tại 4 ô góc</option>
          <option value="when_pay_tax">🏛️ Khi phải nộp thuế nhà nước</option>
          <option value="when_pay_rent">🏠 Khi phải trả tiền thuê đất</option>
          <option value="manual_anytime">🎒 Chủ động bấm dùng trong túi đồ</option>
        </select>
      </div>

      {/* Step 3: Target Scope */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
            3
          </span>
          Tác Động Đến Ai:
        </span>
        <select
          value={targetScope}
          onChange={e => onTargetChange(e.target.value as AbilityTargetScope)}
          className="p-1.5 border border-slate-300 rounded-lg font-bold bg-white text-xs max-w-full sm:max-w-xs"
        >
          {availableTargets.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Step 4: Effect Type & Numerical Value */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        <div className="sm:col-span-8 flex flex-col gap-1">
          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
              4
            </span>
            Hiệu Ứng Năng Lực:
          </span>
          <select
            value={effectType}
            onChange={e => setEffectType(e.target.value)}
            className="w-full p-1.5 border border-slate-300 rounded-lg font-bold bg-white text-xs"
          >
            {availableEffects.map(ef => (
              <option key={ef.value} value={ef.value}>
                {ef.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4 flex flex-col gap-1">
          <span className="font-bold text-slate-800 text-[11px]">Con số hiệu ứng:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              disabled={!requiresNumber}
              required={requiresNumber}
              value={requiresNumber ? effectValue : ''}
              onChange={e => setEffectValue(Number(e.target.value))}
              placeholder={requiresNumber ? 'Nhập số...' : 'Không cần số'}
              className={`w-full p-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs ${
                !requiresNumber
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed italic'
                  : 'bg-white'
              }`}
            />
            {requiresNumber && (
              <span className="font-black text-xs text-emerald-800 shrink-0">{unitLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
