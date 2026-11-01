import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, Tile } from '../../types/game';
import { CharacterAvatar } from '../Common/CharacterAvatar';
import { sounds } from '../../utils/soundEngine';

interface Props {
  winner: Player;
  tiles: Tile[];
  onRestart: () => void;
}

export const GameOverModal: React.FC<Props> = ({ winner, tiles, onRestart }) => {
  useEffect(() => {
    sounds.victory();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const totalHouses = Object.values(winner.houses).reduce((sum, h) => sum + h, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] border-4 border-amber-500 rounded-3xl shadow-2xl p-6 text-center flex flex-col items-center">
        <span className="text-3xl mb-1">👑</span>
        <span className="text-xs font-black tracking-widest text-amber-800 uppercase">
          VÔ ĐỊCH BÀN CỜ
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase my-1">
          {winner.name} ĐÃ CHIẾN THẮNG!
        </h2>
        <span className="text-xs text-amber-900 font-bold mb-4">
          Trở thành Đại Tỷ Phú Sài Gòn Lẫy Lừng
        </span>

        {/* Winner Avatar */}
        <div className="relative my-2 ring-8 ring-amber-300 rounded-2xl shadow-xl">
          <CharacterAvatar
            characterId={winner.characterId}
            isAI={winner.isAI}
            aiNumber={winner.id}
            aiLevel={winner.aiLevel}
            size="xl"
          />
        </div>

        {/* Victory Stats */}
        <div className="w-full grid grid-cols-3 gap-2 my-4 text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 block">Tổng Tiền Mặt</span>
            <span className="font-mono font-black text-sm text-emerald-700">{winner.cash} đ</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 block">Bất Động Sản</span>
            <span className="font-black text-sm text-slate-800">{winner.propertiesOwned.length} Ô</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 block">Số Công Trình</span>
            <span className="font-black text-sm text-amber-800">{totalHouses} Nhà/KS</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-bold text-base tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 mt-2"
        >
          <span>Bắt Đầu Ván Mới</span>
          <kbd className="px-2 py-0.5 text-xs bg-white/25 rounded border border-white/40 font-mono">Space</kbd>
        </button>
      </div>
    </div>
  );
};
