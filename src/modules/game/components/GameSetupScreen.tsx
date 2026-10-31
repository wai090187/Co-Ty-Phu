import React from 'react';
import { AIDifficulty, SetupPlayerConfig } from '../../../types/game';
import { CharacterAvatar } from '../../characters/components/CharacterAvatar';

interface Props {
  playerConfigs: SetupPlayerConfig[];
  onPlayerCountChange: (count: number) => void;
  onUpdatePlayerConfig: (index: number, updates: Partial<SetupPlayerConfig>) => void;
  onOpenCharacterPicker: (index: number) => void;
  onStartGame: () => void;
}

export const GameSetupScreen: React.FC<Props> = ({
  playerConfigs,
  onPlayerCountChange,
  onUpdatePlayerConfig,
  onOpenCharacterPicker,
  onStartGame,
}) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
      <div className="w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Hero Header */}
        <div className="text-center">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-xs uppercase tracking-widest border border-red-200">
            Board Game Truyền Thống
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase mt-2 mb-1">
            CỜ TỶ PHÚ SÀI GÒN
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Bản đồ 40 ô chuẩn xác 100% từ Bến Chương Dương đến Cố Đô Huế. Sở hữu hệ thống năng lực
            đặc biệt tại 4 Bến Xe và 2 Công ty Điện/Nước!
          </p>
        </div>

        {/* Player Count Selector (2 to 6 players) */}
        <div className="flex flex-col items-center gap-2">
          <label className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            Số Lượng Người Chơi (2 - 6 người)
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map(count => (
              <button
                key={count}
                onClick={() => onPlayerCountChange(count)}
                className={`w-11 h-10 rounded-xl font-bold font-mono text-sm transition-all shadow-xs ${
                  playerConfigs.length === count
                    ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400 scale-105'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Players Roster Setup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playerConfigs.map((cfg, idx) => (
            <div
              key={idx}
              className="p-3 bg-white border-2 border-slate-200 rounded-2xl flex flex-col gap-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Vị trí #{idx + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdatePlayerConfig(idx, { isAI: false })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      !cfg.isAI
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Người
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePlayerConfig(idx, { isAI: true })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cfg.isAI
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bot AI
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Avatar Button */}
                <div
                  onClick={() => !cfg.isAI && onOpenCharacterPicker(idx)}
                  className={`cursor-pointer ${!cfg.isAI ? 'hover:scale-105' : ''} transition-transform`}
                  title={!cfg.isAI ? 'Nhấn để đổi nhân vật' : undefined}
                >
                  <CharacterAvatar
                    characterId={cfg.characterId}
                    isAI={cfg.isAI}
                    aiNumber={idx + 1}
                    aiLevel={cfg.aiLevel}
                    size="md"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {!cfg.isAI ? (
                    <>
                      <input
                        type="text"
                        value={cfg.name}
                        onChange={e => onUpdatePlayerConfig(idx, { name: e.target.value })}
                        className="p-1 px-2 border border-slate-300 rounded text-xs font-bold w-full"
                        placeholder="Tên người chơi"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenCharacterPicker(idx)}
                        className="text-[10px] text-red-600 font-bold hover:underline text-left"
                      >
                        Đổi nhân vật 2D ❯
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-xs text-slate-800 truncate">
                        {cfg.name}
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => onUpdatePlayerConfig(idx, { aiLevel: lvl })}
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              cfg.aiLevel === lvl
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'TB' : 'Khó'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Launch Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-black text-lg tracking-wider uppercase rounded-2xl shadow-xl transition-all transform active:scale-95"
          >
            VÀO BÀN CHƠI NGAY
          </button>
        </div>
      </div>
    </main>
  );
};
