import React, { useState } from 'react';
import { Card } from '../../../types/game';
import { AddCustomCardForm } from './AddCustomCardForm';

interface Props {
  chanceDeck: Card[];
  chestDeck: Card[];
  onUpdateCardQuantity: (cardId: string, quantity: number) => void;
  onAddCustomCard: (card: Card) => void;
}

export const CardsTab: React.FC<Props> = ({
  chanceDeck,
  chestDeck,
  onUpdateCardQuantity,
  onAddCustomCard,
}) => {
  const [cardFilter, setCardFilter] = useState<'all' | 'chance' | 'chest'>('all');
  const [cardSearch, setCardSearch] = useState('');
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  const allCards = [...chanceDeck, ...chestDeck];
  const filteredCards = allCards.filter(c => {
    if (cardFilter !== 'all' && c.deck !== cardFilter) return false;
    if (cardSearch.trim()) {
      const q = cardSearch.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCardFilter('all')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              cardFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({allCards.length})
          </button>
          <button
            onClick={() => setCardFilter('chance')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              cardFilter === 'chance'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Cơ Hội ({chanceDeck.length})
          </button>
          <button
            onClick={() => setCardFilter('chest')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
              cardFilter === 'chest'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            Khí Vận ({chestDeck.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm thẻ..."
            value={cardSearch}
            onChange={e => setCardSearch(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-md text-[11px] w-36 sm:w-44 bg-white"
          />
          <button
            onClick={() => setShowAddCardForm(!showAddCardForm)}
            className={`px-3 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors ${
              showAddCardForm
                ? 'bg-slate-300 text-slate-800'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
            }`}
          >
            <span>{showAddCardForm ? '✕ Đóng Form' : '+ Tạo Thẻ Mới'}</span>
          </button>
        </div>
      </div>

      {/* Add Card Form */}
      {showAddCardForm && (
        <AddCustomCardForm
          onAddCard={onAddCustomCard}
          onClose={() => setShowAddCardForm(false)}
        />
      )}

      {/* Cards List */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Danh sách thẻ đang có (SL = 0 sẽ không xuất hiện khi rút):</span>
        <span>Tổng: {filteredCards.length} thẻ</span>
      </div>

      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
        {filteredCards.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            Không tìm thấy thẻ nào phù hợp với bộ lọc!
          </div>
        ) : (
          filteredCards.map(card => {
            const qty = card.quantity ?? 1;
            const isZero = qty === 0;

            return (
              <div
                key={card.id}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isZero
                    ? 'bg-slate-100 border-slate-300 opacity-60'
                    : card.deck === 'chance'
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : 'bg-sky-50/40 border-sky-200 hover:border-sky-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        card.deck === 'chance' ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'
                      }`}
                    >
                      {card.deck === 'chance' ? 'Cơ Hội' : 'Khí Vận'}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate">{card.title}</span>
                    {isZero ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        🚫 Không xuất hiện (SL: 0)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded">
                        {card.actionType === 'cash_bonus' && `+${card.value}đ`}
                        {card.actionType === 'cash_penalty' && `-${card.value}đ`}
                        {card.actionType === 'move_to' && `Đến ô #${card.targetTileId}`}
                        {card.actionType === 'go_to_jail' && 'Vào tù'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{card.description}</p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold px-1">SL:</span>
                  <button
                    type="button"
                    onClick={() => onUpdateCardQuantity(card.id, Math.max(0, qty - 1))}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={e =>
                      onUpdateCardQuantity(card.id, Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-10 text-center font-mono font-bold text-xs p-0.5 border border-slate-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateCardQuantity(card.id, qty + 1)}
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
