/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/soundEngine';
import { Dice3D } from './Dice3D';

interface Props {
  dice: [number, number];
  onRoll: () => void;
  disabled?: boolean;
  isRolling?: boolean;
  dramaticRoll?: boolean;
  isExtraRoll?: boolean;
}

export const DiceRoller: React.FC<Props> = ({
  dice,
  onRoll,
  disabled = false,
  isRolling = false,
  dramaticRoll = true,
  isExtraRoll = false,
}) => {
  const [animating, setAnimating] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>(dice);
  const [showDoubleEffect, setShowDoubleEffect] = useState(false);
  const animIntervalRef = useRef<any>(null);

  // Sync displayDice with actual dice prop when not rolling
  useEffect(() => {
    if (!animating && !isRolling) {
      const d1 = dice[0] || 1;
      const d2 = dice[1] || 1;
      setDisplayDice([d1, d2]);
      if (d1 === d2 && d1 > 0) {
        setShowDoubleEffect(true);
        const t = setTimeout(() => setShowDoubleEffect(false), 2400);
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
      // Dramatic Roll: 1000ms with 3D tumble physics and dynamic face shifts
      const startTime = Date.now();
      const duration = 1000;

      animIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          setDisplayDice([
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
          ]);
        } else {
          clearInterval(animIntervalRef.current);
          setAnimating(false);
          onRoll();
        }
      }, 75);
    } else {
      setTimeout(() => {
        setAnimating(false);
        onRoll();
      }, 350);
    }
  };

  const rollingNow = animating || isRolling;
  const isDouble = displayDice[0] === displayDice[1];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 3D Dice Stage with shadow backdrop */}
      <div className="relative flex items-center justify-center gap-4 py-2 px-3 rounded-2xl bg-radial from-slate-900/5 to-transparent">
        <Dice3D
          value={displayDice[0] || 1}
          isRolling={rollingNow}
          size={50}
          tiltOffset={{ x: 12, y: 15, z: -8 }}
        />
        <Dice3D
          value={displayDice[1] || 1}
          isRolling={rollingNow}
          size={50}
          tiltOffset={{ x: -10, y: -18, z: 12 }}
        />

        {/* Double Celebration Banner */}
        {showDoubleEffect && isDouble && !rollingNow && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 text-white font-black text-[11px] rounded-full shadow-lg border border-white/40 animate-bounce tracking-wide z-10">
            🎲✨ ĐÔI! +1 LƯỢT ĐI
          </div>
        )}
      </div>

      <button
        onClick={handleRollClick}
        disabled={disabled || rollingNow}
        className={`px-4 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
          disabled || rollingNow
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:from-red-500 hover:to-rose-600 hover:shadow-red-500/30 ring-1 ring-red-400/40'
        }`}
      >
        <span>
          {rollingNow
            ? '🎲 Đang Lắc Xúc Xắc...'
            : isExtraRoll
            ? '🎲 Tung Tiếp (Đôi)'
            : 'Tung Xúc Xắc'}
        </span>
        {!disabled && !rollingNow && (
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[9px] bg-white/20 text-white rounded border border-white/30 font-mono">
              Space
            </kbd>
            <span className="text-[10px] text-white/60">/</span>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-white/20 text-white rounded border border-white/30 font-mono">
              Enter
            </kbd>
          </div>
        )}
      </button>
    </div>
  );
};
