import React from 'react';
import { AIDifficulty } from '../../../types/game';

interface Props {
  aiLevel?: AIDifficulty;
  aiNumber?: number;
  color?: string;
  sizeClasses: string;
  className?: string;
}

const getAIColorGradient = (color?: string) => {
  if (!color) return 'from-indigo-600 to-slate-900 border-indigo-400';
  const c = color.toLowerCase();
  if (c.includes('dc2626') || c.includes('ef4444') || c.includes('red')) {
    return 'from-red-600 to-rose-950 border-red-400';
  }
  if (c.includes('2563eb') || c.includes('3b82f6') || c.includes('blue')) {
    return 'from-blue-600 to-indigo-950 border-blue-400';
  }
  if (c.includes('16a34a') || c.includes('10b981') || c.includes('green')) {
    return 'from-emerald-600 to-teal-950 border-emerald-400';
  }
  if (c.includes('d97706') || c.includes('f59e0b') || c.includes('amber') || c.includes('yellow')) {
    return 'from-amber-600 to-orange-950 border-amber-400';
  }
  if (c.includes('9333ea') || c.includes('7c3aed') || c.includes('purple')) {
    return 'from-purple-600 to-violet-950 border-purple-400';
  }
  if (c.includes('0891b2') || c.includes('06b6d4') || c.includes('cyan')) {
    return 'from-cyan-600 to-teal-950 border-cyan-400';
  }
  if (c.includes('64748b') || c.includes('gray') || c.includes('slate') || c.includes('grey') || c.includes('xam') || c.includes('xám')) {
    return 'from-slate-600 to-slate-950 border-slate-400';
  }
  return 'from-indigo-600 to-slate-900 border-indigo-400';
};

export const AIAvatarSvg: React.FC<Props> = ({
  aiLevel = 'medium',
  aiNumber = 1,
  color,
  sizeClasses,
  className = '',
}) => {
  const gradientClass = getAIColorGradient(color);
  const eyeColor = color || '#38BDF8';

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} border-2 shadow-md overflow-hidden ${sizeClasses} ${className}`}
      title={`AI ${aiNumber} (${aiLevel === 'easy' ? 'Dễ' : aiLevel === 'medium' ? 'Trung bình' : 'Khó'})`}
    >
      <svg viewBox="0 0 64 64" className="w-4/5 h-4/5 fill-white/90 drop-shadow">
        {/* Robot Head */}
        <rect x="18" y="20" width="28" height="26" rx="6" fill="#F1F5F9" />
        <rect x="22" y="25" width="20" height="9" rx="3" fill="#0F172A" />
        {/* Eyes */}
        <circle cx="27" cy="29.5" r="2.5" fill={eyeColor} />
        <circle cx="37" cy="29.5" r="2.5" fill={eyeColor} />
        {/* Antenna */}
        <line x1="32" y1="20" x2="32" y2="12" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="10" r="3.5" fill={eyeColor} />
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
