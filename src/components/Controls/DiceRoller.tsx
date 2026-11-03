/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/soundEngine';

interface Props {
  dice: [number, number];
  onRoll: () => void;
  disabled?: boolean;
  isRolling?: boolean;
  dramaticRoll?: boolean;
}

export const DiceRoller: React.FC<Props> = ({
  dice,
  onRoll,
  disabled = false,
  isRolling = false,
  dramaticRoll = true,
}) => {
  const [animating, setAnimating] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>(dice);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [showDoubleEffect, setShowDoubleEffect] = useState(false);
  const animIntervalRef = useRef<any>(null);

  // Sync displayDice with actual dice prop when not rolling
  useEffect(() => {
    if (!animating && !isRolling) {
      setDisplayDice(dice);
      if (dice[0] === dice[1] && dice[0] > 0) {
        setShowDoubleEffect(true);
        const t = setTimeout(() => setShowDoubleEffect(false), 2000);
        return () => clearTimeout(t);
      }
    }
  }, [dice, animating, isRolling]);

  const handleRollClick = () => {
    if (disabled || isRolling || animating) return;

    setAnimating(true);
    setShowDoubleEffect(false);
    sounds.rollDice();

    if (dramaticRoll) {
      // Dramatic Roll: 1100ms with fast random face shuffling & rotational tumble
      const startTime = Date.now();
      const duration = 1100;

      animIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          setDisplayDice([
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
          ]);
          setRotation([
            Math.floor(Math.random() * 30) - 15,
            Math.floor(Math.random() * 30) - 15,
          ]);
        } else {
          clearInterval(animIntervalRef.current);
          setRotation([0, 0]);
          setAnimating(false);
          onRoll();
        }
      }, 70);
    } else {
      // Standard quick roll
      setTimeout(() => {
        setAnimating(false);
        onRoll();
      }, 400);
    }
  };

  const isDouble = displayDice[0] === displayDice[1];

  const renderPipGrid = (val: number, rot: number) => {
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
      <div
        style={{
          transform: `rotate(${rot}deg)`,
          transition: animating ? 'transform 0.07s ease-out' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`grid grid-cols-3 grid-rows-3 w-11 h-11 p-1.5 gap-1 bg-[#FFFDF9] border-2 border-slate-900 rounded-xl shadow-lg relative ${
          animating
            ? 'scale-110 shadow-amber-500/40 ring-2 ring-amber-400'
            : isDouble && showDoubleEffect
            ? 'ring-4 ring-emerald-400 animate-pulse'
            : ''
        }`}
      >
        {/* Subtle 3D dice specular highlight */}
        <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/70 rounded-t-lg pointer-events-none" />

        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activePips.includes(i) && (
              <div
                className={`w-2.5 h-2.5 rounded-full shadow-inner ${
                  val === 1
                    ? 'bg-rose-600 scale-125 ring-1 ring-rose-700'
                    : val === 4
                    ? 'bg-rose-600'
                    : 'bg-slate-900'
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
      <div className="relative flex items-center justify-center gap-3 py-1">
        {renderPipGrid(displayDice[0], rotation[0])}
        {renderPipGrid(displayDice[1], rotation[1])}

        {/* Double Celebration Banner */}
        {showDoubleEffect && isDouble && !animating && !isRolling && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-black text-[10px] rounded-full shadow-md animate-bounce">
            🎉 ĐÔI! +1 LƯỢT ĐI
          </div>
        )}
      </div>

      <button
        onClick={handleRollClick}
        disabled={disabled || isRolling || animating}
        className={`px-4 py-2 sm:py-2.5 rounded-xl font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
          disabled || isRolling
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 hover:shadow-red-500/30'
        }`}
      >
        <span>{animating || isRolling ? 'Đang Lắc Xúc Xắc...' : 'Tung Xúc Xắc'}</span>
        {!disabled && !isRolling && !animating && (
          <kbd className="px-1.5 py-0.5 text-[9.5px] bg-white/25 text-white rounded border border-white/40 font-mono shadow-xs">
            Space
          </kbd>
        )}
      </button>
    </div>
  );
};
