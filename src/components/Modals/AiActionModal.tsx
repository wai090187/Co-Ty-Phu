import React, { useEffect } from 'react';
import { Player } from '../../types/game';
import { CharacterAvatar } from '../Common/CharacterAvatar';

interface Props {
  aiPlayer: Player;
  title: string;
  message: string;
  type: 'card' | 'skill' | 'jail';
  onDismiss: () => void;
}

export const AiActionModal: React.FC<Props> = ({
  aiPlayer,
  title,
  message,
  type,
  onDismiss,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape' || e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);
  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FAF8F5] border-3 border-slate-900 rounded-2xl shadow-2xl p-5 text-center flex flex-col items-center"
      >
        <div className="flex items-center gap-2 mb-2">
          <CharacterAvatar
            characterId={aiPlayer.characterId}
            isAI={true}
            aiNumber={aiPlayer.id}
            aiLevel={aiPlayer.aiLevel}
            size="md"
          />
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              HÀNH ĐỘNG CỦA MÁY
            </span>
            <span className="font-bold text-sm text-slate-900">{aiPlayer.name}</span>
          </div>
        </div>

        <div className="w-full my-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <h4 className="font-display font-black text-base text-red-700 uppercase mb-1">
            {title}
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{message}</p>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>Tiếp Tục Ván Đấu</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded border border-white/30 font-mono">Space / Esc</kbd>
        </button>
      </div>
    </div>
  );
};
