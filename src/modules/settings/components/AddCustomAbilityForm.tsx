import React, { useState } from 'react';
import { ConsumableAbility, PermanentAbility, TriggerCondition } from '../../../types/game';

interface Props {
  onAddConsumable: (ability: ConsumableAbility) => void;
  onAddPermanent: (ability: PermanentAbility) => void;
  onClose: () => void;
}

export const AddCustomAbilityForm: React.FC<Props> = ({
  onAddConsumable,
  onAddPermanent,
  onClose,
}) => {
  const [newAbility, setNewAbility] = useState<{
    type: 'consumable' | 'permanent';
    name: string;
    description: string;
    cost: number;
    triggerCondition: TriggerCondition;
    effectType: string;
    effectValue: number;
    quantity: number;
  }>({
    type: 'consumable',
    name: '',
    description: '',
    cost: 100,
    triggerCondition: 'manual_anytime',
    effectType: 'dice_boost',
    effectValue: 2,
    quantity: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAbility.name.trim()) return;

    if (newAbility.type === 'consumable') {
      const ability: ConsumableAbility = {
        id: `custom-consumable-${Date.now()}`,
        name: newAbility.name.trim(),
        description: newAbility.description.trim() || 'Kỹ năng sử dụng một lần',
        cost: Number(newAbility.cost),
        icon: 'zap',
        triggerCondition: newAbility.triggerCondition,
        effectType: newAbility.effectType as any,
        effectValue: Number(newAbility.effectValue),
        quantity: Math.max(0, Number(newAbility.quantity) || 1),
      };
      onAddConsumable(ability);
    } else {
      const ability: PermanentAbility = {
        id: `custom-perm-${Date.now()}`,
        name: newAbility.name.trim(),
        description: newAbility.description.trim() || 'Năng lực vĩnh viễn độc quyền',
        cost: Number(newAbility.cost),
        icon: 'award',
        triggerCondition: newAbility.triggerCondition,
        effectType: newAbility.effectType as any,
        effectValue: Number(newAbility.effectValue),
        value: Number(newAbility.effectValue),
        quantity: Math.max(0, Number(newAbility.quantity) || 1),
      };
      onAddPermanent(ability);
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 bg-emerald-50/70 border-2 border-emerald-400 rounded-xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-emerald-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
          <span>✨</span> Thiết Kế Năng Lực Mới Cho Cửa Hàng
        </span>
        <span className="text-[10px] text-emerald-800">
          Bao gồm 3 yếu tố: Điều kiện kích hoạt, Hiệu ứng, Con số tương ứng
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold text-slate-800 block text-[11px]">Phân loại năng lực:</label>
          <select
            value={newAbility.type}
            onChange={e => setNewAbility({ ...newAbility, type: e.target.value as any })}
            className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
          >
            <option value="consumable">Dùng 1 lần (Bán tại 4 Bến Xe)</option>
            <option value="permanent">Vĩnh viễn (Bán tại Điện Lực & Nước)</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-800 block text-[11px]">Tên kỹ năng:</label>
          <input
            type="text"
            required
            placeholder="VD: Cú Hích Vận Mệnh, Khiên Thuế..."
            value={newAbility.name}
            onChange={e => setNewAbility({ ...newAbility, name: e.target.value })}
            className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
          />
        </div>
      </div>

      <div className="p-3 bg-white border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
            <span>1️⃣</span> Điều Kiện Kích Hoạt:
          </label>
          <select
            value={newAbility.triggerCondition}
            onChange={e =>
              setNewAbility({ ...newAbility, triggerCondition: e.target.value as TriggerCondition })
            }
            className="p-1.5 border border-slate-300 rounded font-medium bg-white text-[11px]"
          >
            <option value="manual_anytime">Chủ động bấm dùng trong lượt</option>
            <option value="when_roll_dice">Sau khi tung xúc xắc</option>
            <option value="when_neighbor">Đứng cạnh hoặc trùng ô đối thủ</option>
            <option value="when_land_corner">Dừng chân tại 4 ô góc</option>
            <option value="when_pay_tax">Khi phải đóng thuế nhà nước</option>
            <option value="when_pay_rent">Khi phải trả tiền thuê đất</option>
            <option value="when_visit_station">Khi ghé vào Bến xe</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
            <span>2️⃣</span> Hiệu Ứng Năng Lực:
          </label>
          <select
            value={newAbility.effectType}
            onChange={e => setNewAbility({ ...newAbility, effectType: e.target.value })}
            className="p-1.5 border border-slate-300 rounded font-medium bg-white text-[11px]"
          >
            <option value="dice_boost">Tăng bước xúc xắc (+)</option>
            <option value="dice_reduce">Giảm bước xúc xắc (-)</option>
            <option value="free_tax">Miễn thuế nhà nước</option>
            <option value="half_rent">Giảm 50% tiền thuê đất</option>
            <option value="send_to_jail_neighbor">Còng tay tống đối thủ vào tù</option>
            <option value="push_neighbor">Bắt đối thủ tiến thêm bước</option>
            <option value="destroy_house">Phá sập 1 cấp nhà đối thủ</option>
            <option value="draw_both_cards">Rút cả Cơ Hội & Khí Vận</option>
            <option value="steal_neighbor_cash">Thu phí người chơi lân cận</option>
            <option value="corner_bonus">Thưởng tiền mặt 4 ô góc</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
            <span>3️⃣</span> Con Số Hiệu Ứng:
          </label>
          <input
            type="number"
            required
            value={newAbility.effectValue}
            onChange={e => setNewAbility({ ...newAbility, effectValue: Number(e.target.value) })}
            placeholder="VD: 1, 2, 3 hoặc 100đ"
            className="p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-[11px]"
          />
        </div>
      </div>

      <div>
        <label className="font-bold text-slate-800 block text-[11px]">Mô tả công năng:</label>
        <input
          type="text"
          placeholder="Mô tả chi tiết tác dụng để người chơi đọc..."
          value={newAbility.description}
          onChange={e => setNewAbility({ ...newAbility, description: e.target.value })}
          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold text-slate-800 block text-[11px]">Giá mua (đ):</label>
          <input
            type="number"
            value={newAbility.cost}
            onChange={e => setNewAbility({ ...newAbility, cost: Number(e.target.value) })}
            className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
          />
        </div>

        <div>
          <label className="font-bold text-slate-800 block text-[11px]">
            Số lượng trong kho ban đầu:
          </label>
          <input
            type="number"
            min="1"
            value={newAbility.quantity}
            onChange={e =>
              setNewAbility({ ...newAbility, quantity: Math.max(1, Number(e.target.value)) })
            }
            className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs"
      >
        Tạo Năng Lực & Đưa Vào Cửa Hàng
      </button>
    </form>
  );
};
