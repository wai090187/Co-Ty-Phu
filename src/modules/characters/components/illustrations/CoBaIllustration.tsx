import React from 'react';
import { CharacterEmotion } from './AiRobotIllustration';

interface Props {
  emotion?: CharacterEmotion;
}

export const CoBaIllustration: React.FC<Props> = ({ emotion = 'neutral' }) => {
  return (
    <g transform={`translate(0, ${emotion === 'happy' ? -4 : emotion === 'sad' ? 4 : 0})`}>
      {/* Elegant Pink Silk Áo Dài with flowing flaps */}
      <rect x="66" y="130" width="12" height="38" fill="#FFFBEB" rx="3" />
      <rect x="82" y="130" width="12" height="38" fill="#FFFBEB" rx="3" />
      <ellipse cx="70" cy="168" rx="8" ry="4" fill="#DB2777" />
      <ellipse cx="90" cy="168" rx="8" ry="4" fill="#DB2777" />

      <path d="M54 78 Q80 74 106 78 L102 144 Q80 152 58 144 Z" fill="#DB2777" />
      <path d="M60 78 Q80 74 100 78 L96 148 Q80 156 64 148 Z" fill="#BE185D" opacity="0.4" />
      <circle cx="80" cy="110" r="8" fill="#FDE047" opacity="0.8" />
      <circle cx="80" cy="110" r="5" fill="#F59E0B" />

      <circle cx="74" cy="74" r="2.5" fill="#FFFBEB" />
      <circle cx="80" cy="76" r="3" fill="#FFFBEB" />
      <circle cx="86" cy="74" r="2.5" fill="#FFFBEB" />

      {emotion === 'happy' ? (
        <g>
          <path d="M56 82 Q40 68 46 50" stroke="#DB2777" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M104 82 Q120 68 114 50" stroke="#DB2777" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M110 50 L126 36 A16 16 0 0 1 134 46 Z" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
        </g>
      ) : emotion === 'sad' ? (
        <g>
          <path d="M56 82 Q44 108 50 128" stroke="#BE185D" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M104 82 Q116 108 110 128" stroke="#BE185D" strokeWidth="10" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g>
          <path d="M56 82 Q44 102 52 118" stroke="#DB2777" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M104 82 Q118 96 112 114" stroke="#DB2777" strokeWidth="10" strokeLinecap="round" fill="none" />
          <ellipse cx="112" cy="116" rx="6" ry="8" fill="#047857" />
        </g>
      )}

      <ellipse cx="80" cy="52" rx="15" ry="16" fill="#FED7AA" />
      <circle cx="80" cy="32" r="15" fill="#171717" />
      <path d="M64 42 C64 28 96 28 96 42 Z" fill="#171717" />
      <line x1="88" y1="28" x2="108" y2="20" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <circle cx="108" cy="20" r="3.5" fill="#F43F5E" />

      {emotion === 'happy' ? (
        <g stroke="#171717" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M72 52 Q76 46 80 52" />
          <path d="M84 52 Q88 46 92 52" />
          <ellipse cx="68" cy="57" rx="3" ry="1.5" fill="#F43F5E" opacity="0.7" />
          <ellipse cx="92" cy="57" rx="3" ry="1.5" fill="#F43F5E" opacity="0.7" />
        </g>
      ) : emotion === 'sad' ? (
        <g>
          <line x1="72" y1="48" x2="79" y2="52" stroke="#171717" strokeWidth="2" />
          <line x1="89" y1="48" x2="82" y2="52" stroke="#171717" strokeWidth="2" />
        </g>
      ) : (
        <g fill="#171717">
          <ellipse cx="74" cy="51" rx="2" ry="3" />
          <ellipse cx="86" cy="51" rx="2" ry="3" />
        </g>
      )}
      <path d="M76 63 Q80 66 84 63 Z" fill="#E11D48" />
    </g>
  );
};
