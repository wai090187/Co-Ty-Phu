/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ConsumableAbility,
  PermanentAbility,
  TriggerCondition,
  AbilityTargetScope,
} from '../../../types/game';

interface Props {
  onAddConsumable: (ability: ConsumableAbility) => void;
  onAddPermanent: (ability: PermanentAbility) => void;
  onUpdateConsumable?: (ability: ConsumableAbility) => void;
  onUpdatePermanent?: (ability: PermanentAbility) => void;
  onDeleteAbility?: (abilityId: string, kind: 'consumable' | 'permanent') => void;
  editingAbility?: ((ConsumableAbility & { kind: 'consumable' }) | (PermanentAbility & { kind: 'permanent' })) | null;
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
  const [icon, setIcon] = useState(editingAbility?.icon || 'zap');

  // Progressive 4-pillar state
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

  // Helper: Get available target scopes based on triggerCondition
  const getAvailableTargets = (trig: TriggerCondition): { value: AbilityTargetScope; label: string }[] => {
    switch (trig) {
      case 'when_opponent_property':
        return [
          { value: 'self', label: '🛡️ Đến bản thân (miễn trả tiền, nhận thưởng...)' },
          { value: 'target_opponent', label: '⚔️ Đến đối thủ (chủ ô đất đối thủ)' },
          { value: 'target_bank', label: '🏛️ Đến ngân hàng' },
        ];
      case 'when_same_tile':
        return [
          { value: 'target_opponent', label: '🌀 Đến đối thủ (người đang đứng cùng ô)' },
          { value: 'self', label: '🛡️ Đến bản thân' },
          { value: 'target_all_players', label: '👥 Tất cả người chơi' },
        ];
      case 'when_own_property':
        return [
          { value: 'self', label: '🔨 Đến bản thân (nâng cấp nhà miễn phí...)' },
        ];
      case 'when_visit_station':
        return [
          { value: 'target_richest', label: '💰 Người chơi giàu nhất bàn cờ' },
          { value: 'self', label: '🛡️ Đến bản thân' },
          { value: 'target_all_players', label: '👥 Tất cả người chơi' },
          { value: 'target_bank', label: '🏛️ Đến ngân hàng' },
        ];
      case 'when_neighbor':
        return [
          { value: 'target_opponent', label: '🚶 Đến đối thủ lân cận (cùng ô hoặc cạnh bên)' },
          { value: 'self', label: '🛡️ Đến bản thân' },
        ];
      case 'instant_on_buy':
        return [
          { value: 'self', label: '🛡️ Đến bản thân (trợ cấp, miễn thuế...)' },
          { value: 'target_adjacent_turns', label: '👥 Người có lượt trước & sau bạn' },
          { value: 'target_richest', label: '💰 Người chơi giàu nhất' },
          { value: 'target_poorest', label: '🤝 Người chơi nghèo nhất' },
          { value: 'target_opponent', label: '⚔️ Đến đối thủ tương tác' },
          { value: 'target_all_players', label: '🌐 Tất cả người chơi' },
          { value: 'target_choose_1', label: '🎯 Lựa chọn 1 người chơi' },
        ];
      case 'manual_anytime':
        return [
          { value: 'self', label: '🛡️ Đến bản thân' },
          { value: 'target_choose_1', label: '🎯 Lựa chọn 1 người chơi' },
          { value: 'target_richest', label: '💰 Người chơi giàu nhất' },
          { value: 'target_poorest', label: '🤝 Người chơi nghèo nhất' },
          { value: 'target_all_players', label: '🌐 Tất cả người chơi' },
          { value: 'target_adjacent_turns', label: '👥 Người có lượt trước & sau' },
        ];
      case 'when_pay_tax':
        return [
          { value: 'self', label: '🛡️ Đến bản thân (miễn thuế)' },
          { value: 'target_bank', label: '🏛️ Đến ngân hàng' },
        ];
      case 'when_pay_rent':
        return [
          { value: 'self', label: '🛡️ Đến bản thân (giảm giá)' },
          { value: 'target_opponent', label: '⚔️ Đến đối thủ (chủ đất)' },
        ];
      case 'when_roll_dice':
      case 'when_land_corner':
      default:
        return [
          { value: 'self', label: '🛡️ Đến bản thân' },
        ];
    }
  };

  // Helper: Get available effect types based on triggerCondition & targetScope
  const getAvailableEffects = (trig: TriggerCondition, target: AbilityTargetScope): { value: string; label: string; unit?: string }[] => {
    if (trig === 'when_opponent_property') {
      if (target === 'self') {
        return [
          { value: 'free_rent', label: '🛡️ Miễn 100% tiền thuê đất (không cần số)' },
          { value: 'half_rent', label: '🏷️ Giảm 50% tiền thuê đất (không cần số)' },
          { value: 'gain_cash_amount', label: '💰 Hoàn lại tiền mặt', unit: 'đ' },
        ];
      }
      return [
        { value: 'pay_cash_amount', label: '💸 Bắt đối thủ bồi thường', unit: 'đ' },
        { value: 'destroy_house', label: '💣 Đánh sập 1 cấp nhà của đối thủ (không cần số)' },
      ];
    }

    if (trig === 'when_same_tile') {
      if (target === 'target_opponent') {
        return [
          { value: 'send_to_go', label: '🌀 Trục xuất đối thủ về Trạm Khởi Hành (ô số 0) (không cần số)' },
          { value: 'send_to_jail_neighbor', label: '🚨 Tống đối thủ cùng ô vào tù (không cần số)' },
          { value: 'push_neighbor', label: '💨 Bắt đối thủ tiến thêm bước', unit: 'bước' },
          { value: 'steal_neighbor_cash', label: '💰 Thu tiền từ đối thủ cùng ô', unit: 'đ' },
        ];
      }
      return [
        { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt', unit: 'đ' },
      ];
    }

    if (trig === 'when_own_property') {
      return [
        { value: 'free_upgrade_own_house', label: '🔨 Tự động nâng cấp nhà miễn phí (không tốn tiền) (không cần số)' },
        { value: 'gain_cash_amount', label: '💰 Nhận tiền thưởng khai thác đất', unit: 'đ' },
      ];
    }

    if (trig === 'when_visit_station') {
      if (target === 'target_richest') {
        return [
          { value: 'steal_cash_from_target', label: '✈️ Người giàu nhất phải trả tiền đi du lịch cho bạn', unit: 'đ' },
        ];
      }
      return [
        { value: 'gain_cash_amount', label: '💰 Nhận tiền hỗ trợ vé bến xe', unit: 'đ' },
        { value: 'station_discount', label: '🏷️ Giảm giá mua kỹ năng tại bến xe (%)', unit: '%' },
      ];
    }

    if (trig === 'instant_on_buy') {
      if (target === 'target_richest') {
        return [
          { value: 'destroy_richest_highest_house', label: '💣 Phá sập 1 căn nhà cấp cao nhất của người giàu nhất (không cần số)' },
          { value: 'steal_cash_from_target', label: '💰 Thu tiền từ người giàu nhất', unit: 'đ' },
        ];
      }
      if (target === 'target_adjacent_turns') {
        return [
          { value: 'send_adjacent_to_jail', label: '🚨 Bắt người có lượt trước & sau vào tù (không cần số)' },
          { value: 'steal_from_adjacent', label: '💰 Mỗi người lượt trước & sau nộp tiền cho bạn', unit: 'đ' },
        ];
      }
      if (target === 'self') {
        return [
          { value: 'poorest_relief_bonus', label: '🤝 Nếu bạn là người nghèo nhất: cộng tiền trợ cấp', unit: 'đ' },
          { value: 'free_tax_next_turn', label: '📜 Ngân hàng không thu thuế 1 lượt tiếp theo (không cần số)' },
          { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt ngay lập tức', unit: 'đ' },
        ];
      }
      return [
        { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt', unit: 'đ' },
        { value: 'destroy_house', label: '💣 Phá sập nhà đối thủ (không cần số)' },
      ];
    }

    if (trig === 'when_neighbor') {
      return [
        { value: 'send_to_jail_neighbor', label: '🚨 Tống đối thủ lân cận vào tù (không cần số)' },
        { value: 'push_neighbor', label: '💨 Đẩy đối thủ lân cận tiến thêm bước', unit: 'bước' },
        { value: 'steal_neighbor_cash', label: '💰 Thu tiền người chơi lân cận', unit: 'đ' },
      ];
    }

    if (trig === 'when_pay_tax') {
      return [
        { value: 'free_tax', label: '🛡️ Miễn thuế nhà nước (không cần số)' },
        { value: 'permanent_free_tax', label: '👑 Vĩnh viễn miễn thuế nhà nước (không cần số)' },
      ];
    }

    if (trig === 'when_pay_rent') {
      return [
        { value: 'free_rent', label: '🛡️ Miễn 100% tiền thuê đất (không cần số)' },
        { value: 'half_rent', label: '🏷️ Giảm 50% tiền thuê đất (không cần số)' },
      ];
    }

    if (trig === 'when_roll_dice') {
      return [
        { value: 'dice_boost', label: '🚀 Tăng bước xúc xắc (+)', unit: 'bước' },
        { value: 'dice_reduce', label: '🛑 Giảm bước xúc xắc (-)', unit: 'bước' },
      ];
    }

    if (trig === 'when_land_corner') {
      return [
        { value: 'corner_bonus', label: '👑 Thưởng tiền mặt dừng tại 4 ô góc', unit: 'đ' },
      ];
    }

    // manual_anytime
    return [
      { value: 'direct_jail_target', label: '🚨 Trát bắt: Tống 1 người chơi vào tù (không cần số)' },
      { value: 'instant_upgrade_house', label: '📜 Giấy phép nâng cấp nhà từ xa (không cần số)' },
      { value: 'destroy_house', label: '💣 Lệnh phá sập 1 cấp nhà đối thủ tiếp theo (không cần số)' },
      { value: 'draw_both_cards', label: '✨ Rút cùng lúc cả Cơ Hội & Khí Vận (không cần số)' },
      { value: 'dice_boost', label: '🚀 Tăng bước xúc xắc (+)', unit: 'bước' },
      { value: 'dice_reduce', label: '🛑 Giảm bước xúc xắc (-)', unit: 'bước' },
      { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt từ ngân hàng', unit: 'đ' },
      { value: 'pay_cash_amount', label: '💸 Trừ tiền mặt', unit: 'đ' },
    ];
  };

  const availableTargets = getAvailableTargets(triggerCondition);
  const availableEffects = getAvailableEffects(triggerCondition, targetScope);

  // Synchronize targetScope when triggerCondition changes
  const handleTriggerChange = (newTrig: TriggerCondition) => {
    setTriggerCondition(newTrig);
    const newTargets = getAvailableTargets(newTrig);
    const validTarget = newTargets.find(t => t.value === targetScope) ? targetScope : newTargets[0]?.value || 'self';
    setTargetScope(validTarget);
    const newEffects = getAvailableEffects(newTrig, validTarget);
    setEffectType(newEffects[0]?.value || 'gain_cash_amount');
  };

  // Synchronize effectType when targetScope changes
  const handleTargetChange = (newTarget: AbilityTargetScope) => {
    setTargetScope(newTarget);
    const newEffects = getAvailableEffects(triggerCondition, newTarget);
    setEffectType(newEffects[0]?.value || 'gain_cash_amount');
  };

  // Check if current effectType requires a numerical value
  const noNumberEffects = [
    'free_rent',
    'free_tax',
    'free_tax_next_turn',
    'permanent_free_tax',
    'half_rent',
    'free_upgrade_own_house',
    'instant_upgrade_house',
    'send_to_go',
    'send_to_jail_neighbor',
    'direct_jail_target',
    'send_adjacent_to_jail',
    'destroy_house',
    'destroy_richest_highest_house',
    'draw_both_cards',
  ];
  const requiresNumber = !noNumberEffects.includes(effectType);

  const selectedEffectObj = availableEffects.find(e => e.value === effectType);
  const unitLabel = selectedEffectObj?.unit || (effectType.includes('percent') ? '%' : 'đ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const val = requiresNumber ? Number(effectValue) || 0 : 0;
    const finalId = editingAbility?.id || (type === 'consumable' ? `custom-consumable-${Date.now()}` : `custom-perm-${Date.now()}`);

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
      {/* Header with Title and Mode */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isEditing ? '✏️' : '✨'}</span>
          <div>
            <h3 className="font-display font-black text-xs sm:text-sm text-emerald-950 uppercase tracking-wide">
              {isEditing ? `Chỉnh Sửa Năng Lực: ${editingAbility?.name}` : 'Thiết Kế Năng Lực Mới (Quy Trình 4 Bước)'}
            </h3>
            <span className="text-[10px] text-emerald-700 block">
              Lựa chọn tuần tự từng bước để kích hoạt các tùy chọn tương thích.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs"
        >
          ✕
        </button>
      </div>

      {/* Row 1: Name, Icon, Cost & Quantity */}
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

      {/* 4-Step Progressive Sequential Wizard Card */}
      <div className="p-3 bg-white border border-emerald-300/80 rounded-xl flex flex-col gap-2.5 shadow-2xs">
        <div className="text-[11px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
          <span>⚙️</span> Thiết Lập Quan Hệ 4 Thuộc Tính (Tuần Tự)
        </div>

        {/* Step 1: Type Selection */}
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">1</span>
            Loại Năng Lực:
          </span>
          <div className="flex items-center gap-2">
            <label className={`px-2.5 py-1 rounded-md cursor-pointer border text-xs font-bold transition-all ${
              type === 'consumable' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200'
            }`}>
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
            <label className={`px-2.5 py-1 rounded-md cursor-pointer border text-xs font-bold transition-all ${
              type === 'permanent' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200'
            }`}>
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
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">2</span>
            Điều Kiện Kích Hoạt:
          </span>
          <select
            value={triggerCondition}
            onChange={e => handleTriggerChange(e.target.value as TriggerCondition)}
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

        {/* Step 3: Target Scope (Filtered by Step 2) */}
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">3</span>
            Tác Động Đến Ai:
          </span>
          <select
            value={targetScope}
            onChange={e => handleTargetChange(e.target.value as AbilityTargetScope)}
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
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">4</span>
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
                  !requiresNumber ? 'bg-slate-200 text-slate-400 cursor-not-allowed italic' : 'bg-white'
                }`}
              />
              {requiresNumber && (
                <span className="font-black text-xs text-emerald-800 shrink-0">
                  {unitLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Mô tả chi tiết tác dụng:</label>
        <input
          type="text"
          placeholder="Mô tả công năng để người chơi dễ hiểu..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-xs shadow-2xs"
        />
      </div>

      {/* Submit / Cancel Buttons */}
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
