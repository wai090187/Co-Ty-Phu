import React, { useState } from 'react';
import { sounds } from '../../utils/soundEngine';

interface Props {
  dice: [number, number];
  onRoll: () => void;
  disabled?: boolean;
  isRolling?: boolean;
}

export const DiceRoller: React.FC<Props> = ({
  dice,
  onRoll,
  disabled = false,
  isRolling = false,
}) => {
  const [animating, setAnimating] = useState(false);

  const handleRollClick = () => {
    if (disabled || isRolling || animating) return;
    setAnimating(true);
    sounds.rollDice();
    setTimeout(() => {
      setAnimating(false);
      onRoll();
    }, 450);
  };

  const renderPipGrid = (val: number) => {
    const pips: Record<number, number[]> = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const activePips = pips[val] || [4];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-10 h-10 p-1.5 gap-1 bg-white border-2 border-slate-900 rounded-lg shadow-md">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activePips.includes(i) && (
              <div
                className={`w-2 h-2 rounded-full shadow-inner ${
                  val === 1 ? 'bg-red-600 scale-125' : 'bg-slate-900'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center gap-3 ${animating || isRolling ? 'animate-bounce' : ''}`}>
        {renderPipGrid(dice[0])}
        {renderPipGrid(dice[1])}
      </div>

      <button
        onClick={handleRollClick}
        disabled={disabled || isRolling || animating}
        className={`px-5 py-2.5 rounded-xl font-display font-bold text-base tracking-wider uppercase shadow-lg transition-all transform active:scale-95 ${
          disabled || isRolling
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 hover:shadow-red-500/30'
        }`}
      >
        {animating || isRolling ? 'Đang Lắc...' : 'Tung Xúc Xắc'}
      </button>
    </div>
  );
};
