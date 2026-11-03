import React from 'react';
import { CharacterEmotion } from './AiRobotIllustration';

interface Props {
  emotion: CharacterEmotion;
}

export const IllustrationEffects: React.FC<Props> = ({ emotion }) => {
  if (emotion === 'happy') {
    return (
      <g className="animate-bounce">
        <circle cx="36" cy="34" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <text x="33" y="38" fontSize="10" fill="#FFF" fontWeight="bold">
          đ
        </text>
        <circle cx="124" cy="38" r="7" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <text x="121" y="42" fontSize="9" fill="#FFF" fontWeight="bold">
          đ
        </text>
        <text x="24" y="60" fontSize="16" fill="#FBBF24">
          ✨
        </text>
        <text x="120" y="70" fontSize="16" fill="#FBBF24">
          ✨
        </text>
        <text x="72" y="16" fontSize="18" fill="#F59E0B">
          😄
        </text>
      </g>
    );
  }

  if (emotion === 'sad') {
    return (
      <g>
        <path
          d="M48 20 Q54 10 68 14 Q80 8 92 14 Q106 10 112 20 Q116 30 102 32 Q80 34 58 32 Q44 30 48 20 Z"
          fill="#475569"
          opacity="0.85"
        />
        <ellipse cx="64" cy="62" rx="2.5" ry="4" fill="#38BDF8" className="animate-pulse" />
        <ellipse cx="96" cy="64" rx="2.5" ry="4" fill="#38BDF8" className="animate-pulse" />
        <ellipse cx="70" cy="40" rx="2" ry="3" fill="#38BDF8" />
        <ellipse cx="90" cy="42" rx="2" ry="3" fill="#38BDF8" />
        <text x="72" y="16" fontSize="18">
          😢
        </text>
      </g>
    );
  }

  if (emotion === 'action') {
    return (
      <g>
        <ellipse
          cx="80"
          cy="100"
          rx="60"
          ry="70"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />
        <text x="120" y="45" fontSize="18">
          ⚡
        </text>
        <text x="25" y="45" fontSize="18">
          🔥
        </text>
      </g>
    );
  }

  return null;
};
