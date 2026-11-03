import React from 'react';
import { CharacterEmotion } from './AiRobotIllustration';

interface Props {
  emotion?: CharacterEmotion;
}

export const CongTuIllustration: React.FC<Props> = ({ emotion = 'neutral' }) => {
  return (
    <g transform={`translate(0, ${emotion === 'happy' ? -4 : emotion === 'sad' ? 4 : 0})`}>
      {/* Legs & polished oxford shoes */}
      <rect x="62" y="126" width="14" height="42" fill="#E2E8F0" rx="3" />
      <rect x="84" y="126" width="14" height="42" fill="#CBD5E1" rx="3" />
      <ellipse cx="68" cy="168" rx="10" ry="5" fill="#451A03" />
      <ellipse cx="92" cy="168" rx="10" ry="5" fill="#451A03" />

      {/* Suit Body with red necktie & golden chain */}
      <path d="M50 82 C50 68 110 68 110 82 L106 130 C106 136 54 136 54 130 Z" fill="#F8FAFC" />
      <path d="M72 82 L80 120 L88 82 Z" fill="#B91C1C" />
      <line x1="72" y1="104" x2="88" y2="108" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="80" cy="120" r="3" fill="#F59E0B" />

      {/* Arms: Holding golden cane / cash */}
      {emotion === 'happy' ? (
        <g>
          <path d="M50 86 Q30 65 38 45" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="42" r="7" fill="#FFEDD5" />
          <rect x="24" y="28" width="16" height="10" rx="2" fill="#10B981" />
          <text x="27" y="36" fontSize="8" fill="#FFF" fontWeight="bold">đ</text>
          <path d="M110 86 Q122 105 118 126" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" fill="none" />
          <line x1="120" y1="90" x2="124" y2="170" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
          <circle cx="120" cy="88" r="6" fill="#F59E0B" />
        </g>
      ) : emotion === 'sad' ? (
        <g>
          <path d="M50 86 Q38 108 42 130" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M110 86 Q122 108 118 130" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" fill="none" />
          <line x1="120" y1="110" x2="124" y2="170" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M50 86 Q36 102 46 122" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M110 86 Q124 102 118 122" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" fill="none" />
          <line x1="120" y1="96" x2="124" y2="170" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
          <circle cx="120" cy="94" r="6" fill="#F59E0B" />
        </g>
      )}

      {/* Head & Elegant Face */}
      <ellipse cx="80" cy="54" rx="16" ry="17" fill="#FFEDD5" />

      {/* Eyes & Monocle */}
      {emotion === 'happy' ? (
        <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M70 54 Q74 48 78 54" />
          <path d="M82 54 Q86 48 90 54" />
        </g>
      ) : emotion === 'sad' ? (
        <g>
          <line x1="71" y1="50" x2="78" y2="54" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="89" y1="50" x2="82" y2="54" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g fill="#1E293B">
          <circle cx="74" cy="52" r="2.5" />
          <circle cx="86" cy="52" r="2.5" />
        </g>
      )}
      <circle cx="86" cy="52" r="6" fill="none" stroke="#F59E0B" strokeWidth="1.8" />
      <line x1="92" y1="54" x2="96" y2="66" stroke="#F59E0B" strokeWidth="1" />

      {/* Mustache & Mouth */}
      <path d="M72 61 Q80 59 88 61 Q80 65 72 61 Z" fill="#451A03" />
      {emotion === 'happy' ? (
        <path d="M76 65 Q80 72 84 65 Z" fill="#DC2626" />
      ) : emotion === 'sad' ? (
        <path d="M76 68 Q80 64 84 68" stroke="#1E293B" strokeWidth="2" fill="none" />
      ) : (
        <path d="M76 64 Q80 66 84 64" stroke="#1E293B" strokeWidth="1.5" fill="none" />
      )}

      {/* Fedora Hat */}
      <ellipse cx="80" cy="40" rx="28" ry="8" fill="#1E293B" />
      <path d="M62 40 C62 25 66 18 80 18 C94 18 98 25 98 40 Z" fill="#1E293B" />
      <rect x="64" y="34" width="32" height="5" fill="#B91C1C" />
    </g>
  );
};
