import React from 'react';
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
            availableTargets.map(target => (
              <button
                key={target.id}
                onClick={() => onSelectTarget(target)}
                className="p-3 bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-400 rounded-xl flex items-center justify-between transition-colors shadow-xs"
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
                    <span className="font-bold text-xs text-slate-900 block">{target.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Tiền: {target.cash} đ · Ô số: {target.position}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-red-600 text-white font-bold text-[10px] rounded-lg shadow-xs">
                  Chọn
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-2 flex justify-end">
          <button
            onClick={onCancel}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg"
          >
            Hủy Bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
