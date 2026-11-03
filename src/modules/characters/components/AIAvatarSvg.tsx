import React from 'react';
import { AIDifficulty } from '../../../types/game';

interface Props {
  aiLevel?: AIDifficulty;
  aiNumber?: number;
  sizeClasses: string;
  className?: string;
}

export const AIAvatarSvg: React.FC<Props> = ({
  aiLevel = 'medium',
  aiNumber = 1,
  sizeClasses,
  className = '',
}) => {
  const aiColors = {
    easy: 'from-emerald-600 to-teal-800 border-emerald-400',
    medium: 'from-amber-600 to-orange-800 border-amber-400',
    hard: 'from-rose-600 to-purple-900 border-rose-400',
  }[aiLevel];

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${aiColors} border-2 shadow-md overflow-hidden ${sizeClasses} ${className}`}
      title={`AI ${aiNumber} (${aiLevel === 'easy' ? 'Dễ' : aiLevel === 'medium' ? 'Trung bình' : 'Khó'})`}
    >
      <svg viewBox="0 0 64 64" className="w-4/5 h-4/5 fill-white/90 drop-shadow">
        {/* Robot Head */}
        <rect x="18" y="20" width="28" height="26" rx="6" fill="#F1F5F9" />
        <rect x="22" y="25" width="20" height="9" rx="3" fill="#0F172A" />
        {/* Eyes */}
        <circle
          cx="27"
          cy="29.5"
          r="2.5"
          fill={aiLevel === 'hard' ? '#EF4444' : aiLevel === 'medium' ? '#F59E0B' : '#10B981'}
        />
        <circle
          cx="37"
          cy="29.5"
          r="2.5"
          fill={aiLevel === 'hard' ? '#EF4444' : aiLevel === 'medium' ? '#F59E0B' : '#10B981'}
        />
        {/* Antenna */}
        <line x1="32" y1="20" x2="32" y2="12" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="10" r="3.5" fill="#EF4444" />
        {/* Mouth grid */}
        <rect x="25" y="38" width="14" height="4" rx="1.5" fill="#64748B" />
        <line x1="28" y1="38" x2="28" y2="42" stroke="#0F172A" strokeWidth="1" />
        <line x1="32" y1="38" x2="32" y2="42" stroke="#0F172A" strokeWidth="1" />
        <line x1="36" y1="38" x2="36" y2="42" stroke="#0F172A" strokeWidth="1" />
        {/* Ears */}
        <rect x="14" y="27" width="4" height="10" rx="2" fill="#94A3B8" />
        <rect x="46" y="27" width="4" height="10" rx="2" fill="#94A3B8" />
      </svg>
      <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-black/70 text-[9px] font-bold text-white rounded-tl-md">
        {aiLevel === 'easy' ? 'D' : aiLevel === 'medium' ? 'TB' : 'K'}
      </span>
    </div>
  );
};
