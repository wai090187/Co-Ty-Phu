import React, { useState, useEffect } from 'react';
import { Player, ConsumableAbility } from '../../types/game';
import { CharacterAvatar } from '../Common/CharacterAvatar';

interface Props {
  ability: ConsumableAbility;
  activePlayer: Player;
  availableTargets: Player[];
  onSelectTarget: (targetPlayer: Player) => void;
  onCancel: () => void;
}

export const TargetPlayerModal: React.FC<Props> = ({
  ability,
  activePlayer,
  availableTargets,
  onSelectTarget,
  onCancel,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (availableTargets.length > 0) {
          setSelectedIndex(prev => (prev + 1) % availableTargets.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (availableTargets.length > 0) {
          setSelectedIndex(prev => (prev - 1 + availableTargets.length) % availableTargets.length);
        }
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (availableTargets[selectedIndex]) {
          onSelectTarget(availableTargets[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableTargets, selectedIndex, onSelectTarget, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#FAF8F5] border-2 border-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col p-4">
        <div className="text-center mb-3">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Chọn Mục Tiêu Kích Hoạt
          </span>
          <h3 className="font-display text-lg font-black text-slate-900 uppercase">
            {ability.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1">{ability.description}</p>
        </div>

        <div className="flex flex-col gap-2 my-2">
          {availableTargets.length === 0 ? (
            <p className="text-xs text-center text-slate-400 italic py-4">
              Không có đối thủ nào hợp lệ trong phạm vi tác dụng.
            </p>
          ) : (
            availableTargets.map((target, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={target.id}
                  onClick={() => onSelectTarget(target)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 border-2 rounded-xl flex items-center justify-between transition-all shadow-xs text-left ${
                    isSelected
                      ? 'bg-red-50 border-red-500 ring-2 ring-red-400 scale-[1.01]'
                      : 'bg-white border-slate-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CharacterAvatar
                      characterId={target.characterId}
                      isAI={target.isAI}
                      aiNumber={target.id}
                      aiLevel={target.aiLevel}
                      size="sm"
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{target.name}</span>
                        {isSelected && (
                          <span className="text-[9px] font-black text-red-700 bg-red-100 px-1 py-0.2 rounded">
                            👉 Đang chọn (↑ / ↓)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Tiền: {target.cash} đ · Ô số: {target.position}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-white font-bold text-[10px] rounded-lg shadow-xs flex items-center gap-1 ${
                    isSelected ? 'bg-red-700' : 'bg-red-600'
                  }`}>
                    <span>Chọn</span>
                    {isSelected && (
                      <kbd className="px-1 text-[9px] bg-white/25 rounded border border-white/40 font-mono">Space</kbd>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={onCancel}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
          >
            <span>Hủy Bỏ</span>
            <kbd className="px-1.5 py-0.2 text-[10px] bg-slate-300 rounded border border-slate-400 font-mono">Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
