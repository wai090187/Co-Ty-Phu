import React, { useEffect } from 'react';
import { Card } from '../../types/game';

interface Props {
  card: Card;
  onExecute: () => void;
  isActionable?: boolean;
  onClose?: () => void;
}

export const CardModal: React.FC<Props> = ({
  card,
  onExecute,
  isActionable = true,
  onClose,
}) => {
  const isChance = card.deck === 'chance';

  // Keyboard shortcut listener for Space (confirm/execute) and Escape (close/dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) {
          onClose();
        } else if (isActionable) {
          onExecute();
        }
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (isActionable) {
          onExecute();
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActionable, onExecute, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150">
      <div
        className={`w-full max-w-sm border-4 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-center relative ${
          isChance
            ? 'bg-[#FDF2F8] border-rose-600 text-rose-950'
            : 'bg-[#FEFCE8] border-amber-600 text-amber-950'
        }`}
      >
        {/* Vintage Top Badge */}
        <div className="flex justify-center mb-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${
              isChance ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {isChance ? 'THẺ CƠ HỘI' : 'THẺ KHÍ VẬN'}
          </span>
        </div>

        {/* Card Icon */}
        <div className="w-16 h-16 mx-auto my-3 rounded-full flex items-center justify-center border-2 shadow-inner bg-white/70">
          {isChance ? (
            <span className="font-display text-4xl font-black text-rose-600">?</span>
          ) : (
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-amber-700">
              <rect x="2" y="7" width="20" height="13" rx="2" fill="#D97706" />
              <path d="M2 10 Q12 5 22 10 Z" fill="#F59E0B" />
              <circle cx="12" cy="13" r="2" fill="#FEF08A" />
            </svg>
          )}
        </div>

        {/* Card Title & Content */}
        <h3 className="font-display text-xl font-black tracking-tight mb-2 uppercase">
          {card.title}
        </h3>
        <p className="text-sm font-medium leading-relaxed mb-6 opacity-90">
          {card.description}
        </p>

        {/* Action Button */}
        {isActionable ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onExecute}
              className={`w-full py-3 rounded-xl font-display font-bold text-base tracking-wider uppercase text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                isChance
                  ? 'bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-500 hover:to-yellow-600'
              }`}
            >
              <span>Chấp Nhận Thực Hiện</span>
              <kbd className="px-2 py-0.5 text-xs bg-white/25 rounded border border-white/40 font-mono">Space</kbd>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center justify-center gap-1"
              >
                <span>Bỏ qua / Đóng</span>
                <kbd className="px-1.5 py-0.2 text-[10px] bg-slate-200 rounded border border-slate-300 font-mono">Esc</kbd>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <span>Đóng Lại</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-300 rounded border border-slate-400 font-mono">Esc / Space</kbd>
          </button>
        )}
      </div>
    </div>
  );
};
