import React, { useState, useEffect } from 'react';
import { PermanentAbility, Player, Tile } from '../../types/game';

interface Props {
  tile: Tile;
  player: Player;
  abilities: PermanentAbility[]; // The 2 randomly offered unowned abilities
  allPermanents: PermanentAbility[];
  onBuyAbility: (ability: PermanentAbility, replaceAbilityId?: string) => void;
  onSellAbility: (ability: PermanentAbility) => void;
  onClose: () => void;
}

export const UtilityAbilityModal: React.FC<Props> = ({
  tile,
  player,
  abilities,
  allPermanents,
  onBuyAbility,
  onSellAbility,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmTradeIn, setConfirmTradeIn] = useState<{
    newAbility: PermanentAbility;
    oldAbility: PermanentAbility;
    refund: number;
    netCost: number;
  } | null>(null);

  const ownedAbilities = allPermanents.filter(a => player.permanentAbilities.includes(a.id));
  const selectedAbility = abilities[selectedIndex] || null;

  const handleAttemptBuy = (ability: PermanentAbility) => {
    if (ownedAbilities.length > 0) {
      // Must trade-in 1st ability
      const old = ownedAbilities[0];
      const refund = Math.round(old.cost * 0.5);
      const netCost = ability.cost - refund;
      setConfirmTradeIn({
        newAbility: ability,
        oldAbility: old,
        refund,
        netCost,
      });
    } else {
      onBuyAbility(ability);
      onClose();
    }
  };

  // Keyboard navigation: ArrowUp/ArrowDown to select, Space to buy, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (confirmTradeIn) {
          setConfirmTradeIn(null);
        } else {
          onClose();
        }
      } else if (confirmTradeIn) {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (player.cash >= confirmTradeIn.netCost) {
            onBuyAbility(confirmTradeIn.newAbility, confirmTradeIn.oldAbility.id);
            onClose();
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (abilities.length > 0) {
          setSelectedIndex(prev => (prev + 1) % abilities.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (abilities.length > 0) {
          setSelectedIndex(prev => (prev - 1 + abilities.length) % abilities.length);
        }
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (selectedAbility) {
          if (ownedAbilities.length > 0) {
            const old = ownedAbilities[0];
            const refund = Math.round(old.cost * 0.5);
            const netCost = selectedAbility.cost - refund;
            if (player.cash >= netCost) {
              setConfirmTradeIn({
                newAbility: selectedAbility,
                oldAbility: old,
                refund,
                netCost,
              });
            }
          } else if (player.cash >= selectedAbility.cost) {
            onBuyAbility(selectedAbility);
            onClose();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abilities, selectedIndex, selectedAbility, player.cash, ownedAbilities, confirmTradeIn, onBuyAbility, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF8F5] border-2 border-amber-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 border border-amber-400 flex items-center justify-center">
              ⚡
            </div>
            <div>
              <h2 className="font-display text-lg font-black tracking-wide uppercase">
                {tile.name}
              </h2>
              <span className="text-xs text-amber-200">
                Thị Trường Năng Lực Độc Quyền (Mỗi loại chỉ thuộc về 1 người)
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

        {/* Exclusive Rule Notice */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex justify-between items-center">
          <div className="flex items-center gap-1.5 font-bold">
            <span>👑</span>
            <span>Xuất hiện ngẫu nhiên 2 năng lực chưa có chủ sở hữu</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Sở hữu: <b>{ownedAbilities.length}</b>
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Section 1: 2 Random Offered Abilities for Purchase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1">
                <span>🎁</span> Mở Bán Độc Quyền Lượt Này ({abilities.length}/2):
              </span>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                Chưa có ai sở hữu
              </span>
            </div>

            {abilities.length === 0 ? (
              <div className="text-center py-6 bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                Hiện tại tất cả năng lực đặc biệt đã có người khác sở hữu độc quyền hoặc hết hàng!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {abilities.map((ab, idx) => {
                  const tradeInRefund = ownedAbilities.length > 0 ? Math.round(ownedAbilities[0].cost * 0.5) : 0;
                  const netRequired = ownedAbilities.length > 0 ? ab.cost - tradeInRefund : ab.cost;
                  const canAfford = player.cash >= netRequired;
                  const isSelected = selectedIndex === idx;

                  return (
                    <div
                      key={ab.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs relative ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/90 ring-3 ring-amber-400 scale-[1.01]'
                          : 'border-amber-300 bg-amber-50/50 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{ab.name}</span>
                          <span className="text-xs font-mono font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                            {ab.cost} đ
                          </span>
                          {ownedAbilities.length > 0 && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              Đổi bù: {netRequired >= 0 ? `${netRequired}đ` : `+${Math.abs(netRequired)}đ`}
                            </span>
                          )}
                          <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                            Chưa có chủ
                          </span>
                          {isSelected && (
                            <span className="text-[9.5px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded border border-amber-400 flex items-center gap-1">
                              <span>👉</span> Đang chọn (↑ / ↓)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 mt-1">{ab.description}</p>
                      </div>

                      <button
                        onClick={() => handleAttemptBuy(ab)}
                        disabled={!canAfford}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                          canAfford
                            ? isSelected
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md ring-2 ring-amber-300'
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>{canAfford ? (ownedAbilities.length > 0 ? 'Đổi Mới' : 'Mua Ngay') : 'Hết Tiền'}</span>
                        {canAfford && isSelected && (
                          <kbd className="px-1.5 py-0.2 text-[9px] bg-white/25 rounded border border-white/40 font-mono">Space</kbd>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Abilities Already Owned by Current Player (Option to sell) */}
          {ownedAbilities.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide block mb-2">
                🏷️ Năng Lực Bạn Đang Sở Hữu (Bán lại nhận 50% giá):
              </span>
              <div className="flex flex-col gap-2">
                {ownedAbilities.map(ab => {
                  const refund = Math.round(ab.cost * 0.5);
                  return (
                    <div
                      key={ab.id}
                      className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{ab.name}</span>
                          <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            Đang hiệu lực
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{ab.description}</p>
                      </div>

                      <button
                        onClick={() => onSellAbility(ab)}
                        className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-colors shrink-0"
                      >
                        Bán lại (+{refund}đ)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Keyboard Navigation Hint */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
            <span className="text-amber-800 font-bold">⌨️ Phím tắt:</span>
            <span>[↑ / ↓] Chọn</span>
            <span>•</span>
            <span>[Space] Mua / Đổi</span>
            <span>•</span>
            <span>[Esc] Đóng</span>
          </div>

          <div className="flex justify-end w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5"
            >
              <span>Đóng Lại</span>
              <kbd className="px-1.5 py-0.2 text-[10px] bg-slate-300 rounded border border-slate-400 font-mono">Esc</kbd>
            </button>
          </div>
        </div>

        {/* Confirmation Dialog for Replacing 1st Permanent Ability */}
        {confirmTradeIn && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-amber-600 shadow-2xl p-5 flex flex-col gap-3.5 text-slate-800">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-display font-black text-sm uppercase">Xác Nhận Đổi Năng Lực Vĩnh Viễn</h3>
              </div>
              <p className="text-xs text-slate-600">
                Mỗi người chỉ có thể giữ <b>1 Năng Lực Vĩnh Viễn</b>. Bạn có muốn bán năng lực cũ để lấy năng lực mới không?
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Năng lực cũ:</span>
                  <span className="font-bold text-rose-700 line-through">{confirmTradeIn.oldAbility.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Giá hoàn lại (50%):</span>
                  <span className="font-bold text-emerald-700">+{confirmTradeIn.refund}đ</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                  <span className="text-slate-500">Năng lực mới:</span>
                  <span className="font-bold text-amber-900">{confirmTradeIn.newAbility.name} ({confirmTradeIn.newAbility.cost}đ)</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-amber-200">
                  <span>{confirmTradeIn.netCost >= 0 ? 'Cần bù thêm:' : 'Được thối lại:'}</span>
                  <span className={confirmTradeIn.netCost >= 0 ? 'text-amber-700 font-mono' : 'text-emerald-700 font-mono'}>
                    {confirmTradeIn.netCost >= 0 ? `${confirmTradeIn.netCost}đ` : `+${Math.abs(confirmTradeIn.netCost)}đ`}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Tiền mặt hiện tại: <b className="text-slate-800 font-mono">{player.cash}đ</b>
                {confirmTradeIn.netCost > player.cash && (
                  <span className="text-rose-600 font-bold block mt-0.5">⚠️ Bạn không đủ tiền mặt để bù chênh lệch!</span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setConfirmTradeIn(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Hủy Bỏ (Esc)
                </button>
                <button
                  disabled={confirmTradeIn.netCost > player.cash}
                  onClick={() => {
                    onBuyAbility(confirmTradeIn.newAbility, confirmTradeIn.oldAbility.id);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <span>Xác Nhận Đổi</span>
                  <kbd className="px-1 py-0.2 bg-white/20 text-[9px] rounded font-mono">Space</kbd>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
