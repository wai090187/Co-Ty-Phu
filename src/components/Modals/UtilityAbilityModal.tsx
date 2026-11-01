import React, { useState, useEffect } from 'react';
import { PermanentAbility, Player, Tile } from '../../types/game';

interface Props {
  tile: Tile;
  player: Player;
  abilities: PermanentAbility[]; // The 2 randomly offered unowned abilities
  allPermanents: PermanentAbility[];
  onBuyAbility: (ability: PermanentAbility) => void;
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
  const ownedAbilities = allPermanents.filter(a => player.permanentAbilities.includes(a.id));

  const selectedAbility = abilities[selectedIndex] || null;

  // Keyboard navigation: ArrowUp/ArrowDown to select, Space to buy, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
        if (selectedAbility && player.cash >= selectedAbility.cost) {
          onBuyAbility(selectedAbility);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abilities, selectedIndex, selectedAbility, player.cash, onBuyAbility, onClose]);

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
                  const canAfford = player.cash >= ab.cost;
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
                        onClick={() => {
                          onBuyAbility(ab);
                          onClose();
                        }}
                        disabled={!canAfford}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
                          canAfford
                            ? isSelected
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md ring-2 ring-amber-300'
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>{canAfford ? 'Mua Ngay' : 'Hết Tiền'}</span>
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
            <span>[Space] Mua</span>
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
      </div>
    </div>
  );
};
