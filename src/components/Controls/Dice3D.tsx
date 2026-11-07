/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Dice3DProps {
  value: number; // 1 - 6
  isRolling: boolean;
  size?: number; // default 52
  tiltOffset?: { x: number; y: number; z: number };
}

// 3D rotation angles required to bring a given face to the front view
const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  size = 52,
  tiltOffset = { x: 0, y: 0, z: 0 },
}) => {
  const halfSize = size / 2;
  const targetRotation = FACE_ROTATIONS[value] || FACE_ROTATIONS[1];

  // Render authentic pips with recessed 3D indent
  const renderPips = (faceNum: number) => {
    const pipPositions: Record<number, number[]> = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const active = pipPositions[faceNum] || [4];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1.5 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {active.includes(i) && (
              <div
                className={`rounded-full shadow-inner transition-transform ${
                  faceNum === 1
                    ? 'w-3.5 h-3.5 bg-red-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] scale-110'
                    : 'w-2.5 h-2.5 bg-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const faceStyleBase: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.1)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: `${size + 14}px`,
        height: `${size + 24}px`,
        perspective: '600px',
      }}
    >
      {/* Dynamic Drop Shadow on the surface below */}
      <div
        className={`absolute bottom-0 w-10 h-3 rounded-full bg-slate-900/25 blur-xs transition-all duration-300 ${
          isRolling
            ? 'scale-125 opacity-30 animate-pulse'
            : 'scale-100 opacity-60'
        }`}
      />

      {/* The 3D Cube Container */}
      <div
        className={`relative transition-transform duration-500 ease-out ${
          isRolling ? 'animate-[diceTumble_0.6s_infinite_linear]' : ''
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transformStyle: 'preserve-3d',
          transform: isRolling
            ? `translateY(-14px) rotateX(${tiltOffset.x + 360}deg) rotateY(${tiltOffset.y + 720}deg) rotateZ(${tiltOffset.z + 180}deg)`
            : `translateY(0px) rotateX(${targetRotation.x}deg) rotateY(${targetRotation.y}deg) rotateZ(${tiltOffset.z}deg)`,
          transition: isRolling ? 'none' : 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Face 1: Front */}
        <div
          style={{
            ...faceStyleBase,
            transform: `translateZ(${halfSize}px)`,
          }}
        >
          {renderPips(1)}
        </div>

        {/* Face 6: Back */}
        <div
          style={{
            ...faceStyleBase,
            transform: `rotateY(180deg) translateZ(${halfSize}px)`,
          }}
        >
          {renderPips(6)}
        </div>

        {/* Face 3: Right */}
        <div
          style={{
            ...faceStyleBase,
            transform: `rotateY(90deg) translateZ(${halfSize}px)`,
          }}
        >
          {renderPips(3)}
        </div>

        {/* Face 4: Left */}
        <div
          style={{
            ...faceStyleBase,
            transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
          }}
        >
          {renderPips(4)}
        </div>

        {/* Face 2: Top */}
        <div
          style={{
            ...faceStyleBase,
            transform: `rotateX(90deg) translateZ(${halfSize}px)`,
          }}
        >
          {renderPips(2)}
        </div>

        {/* Face 5: Bottom */}
        <div
          style={{
            ...faceStyleBase,
            transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
          }}
        >
          {renderPips(5)}
        </div>
      </div>
    </div>
  );
};
