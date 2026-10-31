import React from 'react';
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
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform active:scale-95"
        >
          Tiếp Tục Ván Đấu (Nhấn màn hình để tắt)
        </button>
      </div>
    </div>
  );
};
