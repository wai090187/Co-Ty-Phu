import React from 'react';

interface Props {
  isPlaying: boolean;
  currentRound: number;
  onOpenSettings: () => void;
  onOpenSaveLoad: () => void;
  onOpenCheat?: () => void;
  hasActiveCheat?: boolean;
}

export const GameHeader: React.FC<Props> = ({
  isPlaying,
  currentRound,
  onOpenSettings,
  onOpenSaveLoad,
  onOpenCheat,
  hasActiveCheat = false,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b-2 border-amber-600 px-4 py-2.5 flex items-center justify-between shadow-md z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-display font-black text-white text-lg shadow-sm border border-red-400">
          C
        </div>
        <div>
          <h1 className="font-display font-black text-base sm:text-lg tracking-wider uppercase text-amber-400">
            Cờ Tỷ Phú Việt Nam
          </h1>
          <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
            Bản Sài Gòn Xưa · 40 Ô Kinh Điển
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPlaying && (
          <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
            <span className="text-slate-400">Vòng:</span>
            <span className="font-bold text-amber-400 font-mono">{currentRound}</span>
          </div>
        )}

        <button
          onClick={onOpenSaveLoad}
          className="px-3 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-amber-500/50 shadow-xs"
          title="Lưu hoặc tải trận đấu"
        >
          <span>💾</span>
          <span className="hidden sm:inline">Lưu / Tải</span>
        </button>

        {isPlaying && onOpenCheat && (
          <button
            onClick={onOpenCheat}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border shadow-xs ${
              hasActiveCheat
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-rose-900/60'
            }`}
            title="Mở Bảng Cheat & Kiểm Thử"
          >
            <span>🛠️</span>
            <span className="hidden sm:inline">Cheat Test</span>
            {hasActiveCheat && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <span>⚙️</span>
          <span className="hidden sm:inline">Cài Đặt</span>
        </button>
      </div>
    </header>
  );
};
