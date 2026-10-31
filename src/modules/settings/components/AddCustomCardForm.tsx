import React, { useState } from 'react';
import { Card } from '../../../types/game';

interface Props {
  onAddCard: (card: Card) => void;
  onClose: () => void;
}

export const AddCustomCardForm: React.FC<Props> = ({ onAddCard, onClose }) => {
  const [newCard, setNewCard] = useState<{
    deck: 'chance' | 'chest';
    title: string;
    description: string;
    actionType: 'cash_bonus' | 'cash_penalty' | 'move_to' | 'go_to_jail';
    value: number;
    targetTileId: number;
    quantity: number;
  }>({
    deck: 'chance',
    title: '',
    description: '',
    actionType: 'cash_bonus',
    value: 100,
    targetTileId: 0,
    quantity: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.title.trim()) return;

    const card: Card = {
      id: `custom-card-${Date.now()}`,
      deck: newCard.deck,
      title: newCard.title.trim(),
      description: newCard.description.trim() || 'Thẻ bài tự tạo',
      actionType: newCard.actionType,
      value: newCard.value,
      targetTileId: newCard.actionType === 'move_to' ? newCard.targetTileId : undefined,
      quantity: Math.max(0, Number(newCard.quantity) || 1),
    };

    onAddCard(card);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-amber-950 text-xs uppercase tracking-wide">
          ➕ Soạn Thảo Thẻ Cơ Hội / Khí Vận Mới
        </span>
        <span className="text-[10px] text-amber-800">
          Thẻ sẽ được gộp vào bộ bài của ván chơi
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold text-slate-800 block text-[11px]">Thuộc bộ thẻ:</label>
          <select
            value={newCard.deck}
            onChange={e => setNewCard({ ...newCard, deck: e.target.value as any })}
            className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
          >
            <option value="chance">❓ Thẻ Cơ Hội (Màu Đỏ Cam)</option>
            <option value="chest">📦 Thẻ Khí Vận (Màu Xanh Biển)</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-800 block text-[11px]">Loại hiệu ứng:</label>
          <select
            value={newCard.actionType}
            onChange={e => setNewCard({ ...newCard, actionType: e.target.value as any })}
            className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
          >
            <option value="cash_bonus">Thưởng Tiền (+đ)</option>
            <option value="cash_penalty">Phạt Tiền (-đ)</option>
            <option value="move_to">Bay đến ô cụ thể</option>
            <option value="go_to_jail">Bị bắt vào tù</option>
          </select>
        </div>
      </div>

      <div>
        <label className="font-bold text-slate-800 block text-[11px]">Tiêu đề thẻ:</label>
        <input
          type="text"
          required
          placeholder="VD: Nhận Lương Thưởng Tết, Đi Công Tác..."
          value={newCard.title}
          onChange={e => setNewCard({ ...newCard, title: e.target.value })}
          className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
        />
      </div>

      <div>
        <label className="font-bold text-slate-800 block text-[11px]">Nội dung mô tả:</label>
        <input
          type="text"
          placeholder="Mô tả lý do hoặc câu chuyện vui nhộn trên thẻ..."
          value={newCard.description}
          onChange={e => setNewCard({ ...newCard, description: e.target.value })}
          className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold text-slate-800 block text-[11px]">
            {newCard.actionType === 'move_to' ? 'Mã Ô Đến (0-39):' : 'Số Tiền Hiệu Ứng (đ):'}
          </label>
          <input
            type="number"
            value={newCard.actionType === 'move_to' ? newCard.targetTileId : newCard.value}
            onChange={e => {
              const val = Number(e.target.value);
              if (newCard.actionType === 'move_to') {
                setNewCard({ ...newCard, targetTileId: val });
              } else {
                setNewCard({ ...newCard, value: val });
              }
            }}
            className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
          />
        </div>

        <div>
          <label className="font-bold text-slate-800 block text-[11px]">
            Số Lượng Thẻ Trong Bộ Bài:
          </label>
          <input
            type="number"
            min="1"
            value={newCard.quantity}
            onChange={e =>
              setNewCard({ ...newCard, quantity: Math.max(1, Number(e.target.value)) })
            }
            className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm text-xs"
      >
        Thêm Thẻ Vào Bộ Bài
      </button>
    </form>
  );
};
