import React, { useState } from 'react';
import { Character } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { CharacterAvatar } from '../Common/CharacterAvatar';
import { CharacterIllustration2D5 } from '../Common/CharacterIllustration2D5';

interface Props {
  selectedCharacterId: string;
  onSelect: (character: Character) => void;
  onClose: () => void;
  playerName: string;
}

export const CharacterSelectModal: React.FC<Props> = ({
  selectedCharacterId,
  onSelect,
  onClose,
  playerName,
}) => {
  const [activeChar, setActiveChar] = useState<Character>(
    CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0]
  );

  const styleLabels: Record<string, { label: string; color: string }> = {
    retro: { label: 'Sài Gòn Retro', color: 'bg-amber-100 text-amber-800' },
    anime: { label: 'Anime Manga', color: 'bg-rose-100 text-rose-800' },
    gothic: { label: 'Gothic Noir', color: 'bg-purple-100 text-purple-800' },
    steampunk: { label: 'Steampunk', color: 'bg-orange-100 text-orange-800' },
    cyberpunk: { label: 'Cyberpunk', color: 'bg-cyan-100 text-cyan-800' },
    royal: { label: 'Hoàng Gia', color: 'bg-yellow-100 text-yellow-800' },
    chibi: { label: 'Chibi Dễ Thương', color: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-black tracking-wide uppercase">
              Chọn Nhân Vật 2.5D Cho {playerName}
            </h2>
            <span className="text-xs text-slate-300">
              12 Danh Tướng & Linh Thú Đa Phong Cách: Hồ Ly, Anime, Retro, Chibi...
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Character Detail Showcase & Grid */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col md:flex-row gap-4">
          {/* Left: Active Character Card with 2.5D Illustration */}
          <div className="w-full md:w-60 bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col items-center text-center shadow-sm shrink-0">
            <div className="h-44 w-full flex items-center justify-center mb-1">
              <CharacterIllustration2D5 characterId={activeChar.id} size="lg" emotion="happy" showPedestal={true} />
            </div>
            <h3 className="font-display text-lg font-black text-slate-900 uppercase">
              {activeChar.name}
            </h3>
            <span className="text-xs font-bold text-slate-500 mb-1">{activeChar.title}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 ${
                styleLabels[activeChar.style]?.color || 'bg-slate-100'
              }`}
            >
              {styleLabels[activeChar.style]?.label || activeChar.style}
            </span>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{activeChar.description}</p>
            <div className="mt-auto p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 italic">
              "{activeChar.quote}"
            </div>
          </div>

          {/* Right: Grid of 10 Characters */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CHARACTERS.map(c => {
              const isSelected = activeChar.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveChar(c)}
                  className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 ${
                    isSelected
                      ? 'border-red-600 bg-red-50/70 shadow-md ring-2 ring-red-400'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <CharacterAvatar characterId={c.id} size="md" />
                  <span className="font-bold text-xs text-slate-900 truncate w-full">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate w-full">
                    {styleLabels[c.style]?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onSelect(activeChar);
              onClose();
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow"
          >
            Chọn {activeChar.name}
          </button>
        </div>
      </div>
    </div>
  );
};
