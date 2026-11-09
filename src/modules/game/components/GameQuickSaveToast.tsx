import React from 'react';

interface GameQuickSaveToastProps {
  message: string | null;
}

export const GameQuickSaveToast: React.FC<GameQuickSaveToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="px-4 py-2 bg-slate-900/95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xl border-2 border-emerald-400 flex items-center gap-2.5 backdrop-blur-md">
        <span className="text-lg text-emerald-400">⚡</span>
        <span className="text-emerald-100">{message}</span>
        <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/40 font-mono">
          Tab
        </span>
      </div>
    </aside>
  );
};
