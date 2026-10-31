import React, { useState } from 'react';
import { ConsumableAbility, Player, Tile } from '../../types/game';

interface Props {
  tile: Tile;
  player: Player;
  abilities: ConsumableAbility[];
  onBuyAbility: (ability: ConsumableAbility, discardAbilityId?: string) => void;
  onClose: () => void;
  hasVipDiscount?: boolean;
}

export const StationAbilityModal: React.FC<Props> = ({
  tile,
  player,
  abilities,
  onBuyAbility,
  onClose,
  hasVipDiscount = false,
}) => {
  const [selectedAbility, setSelectedAbility] = useState<ConsumableAbility | null>(null);
  const [discardTargetId, setDiscardTargetId] = useState<string | undefined>();
  const isInventoryFull = player.consumableAbilities.length >= 3;

  const getPrice = (ability: ConsumableAbility) => {
    return hasVipDiscount ? Math.round(ability.cost * 0.5) : ability.cost;
  };

  const handleConfirmPurchase = () => {
    if (!selectedAbility) return;
    onBuyAbility(selectedAbility, discardTargetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF8F5] border-2 border-emerald-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 border border-emerald-500 flex items-center justify-center">
              🚌
            </div>
            <div>
              <h2 className="font-display text-lg font-black tracking-wide uppercase">
                {tile.name}
              </h2>
              <span className="text-xs text-emerald-200">
                Cửa Hàng Năng Lực Dùng 1 Lần (Bí Mật)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Inventory Notice */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-bold">
            <span>🎲</span>
            <span>Xuất hiện ngẫu nhiên 2 kỹ năng lượt này</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Túi đồ: </span>
            <span className="font-bold font-mono">
              {player.consumableAbilities.length}/3 thẻ
            </span>
          </div>
        </div>

        {/* Abilities List */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {abilities.filter(a => (a.quantity ?? 1) > 0).length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Hiện tại tất cả năng lực tại trạm này đã hết hàng hoặc bị ẩn (SL = 0).
            </div>
          ) : (
            abilities
              .filter(a => (a.quantity ?? 1) > 0)
              .map(ab => {
                const price = getPrice(ab);
                const canAfford = player.cash >= price;
                const isSelected = selectedAbility?.id === ab.id;

                return (
                  <div
                    key={ab.id}
                    onClick={() => setSelectedAbility(ab)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{ab.name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {price} đ
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          Kho: {ab.quantity ?? 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{ab.description}</p>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                        canAfford
                          ? isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? (isSelected ? 'Đã Chọn' : 'Chọn') : 'Hết Tiền'}
                    </button>
                  </div>
                );
              })
          )}
        </div>

        {/* Full Inventory Replacement Selector */}
        {selectedAbility && isInventoryFull && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs">
            <span className="font-bold text-amber-900 block mb-1">
              ⚠️ Túi đồ đã đầy (3/3). Hãy chọn 1 thẻ cũ để bỏ:
            </span>
            <div className="flex gap-2">
              {player.consumableAbilities.map(aid => {
                const existing = abilities.find(a => a.id === aid);
                const isDiscard = discardTargetId === aid;
                return (
                  <button
                    key={aid}
                    type="button"
                    onClick={() => setDiscardTargetId(aid)}
                    className={`flex-1 p-1.5 rounded border text-[11px] font-medium truncate ${
                      isDiscard
                        ? 'bg-red-600 text-white border-red-700 font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
                    }`}
                  >
                    Bỏ: {existing?.name || aid}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs"
          >
            Đóng Lại
          </button>
          <button
            onClick={handleConfirmPurchase}
            disabled={
              !selectedAbility ||
              player.cash < getPrice(selectedAbility) ||
              (isInventoryFull && !discardTargetId)
            }
            className={`px-5 py-2 rounded-lg font-bold text-xs shadow transition-colors ${
              selectedAbility &&
              player.cash >= getPrice(selectedAbility) &&
              (!isInventoryFull || discardTargetId)
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Xác Nhận Mua {selectedAbility ? `(${getPrice(selectedAbility)} đ)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
