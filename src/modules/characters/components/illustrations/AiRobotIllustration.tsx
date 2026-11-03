import React from 'react';
import { AIDifficulty } from '../../../../types/game';

export type CharacterEmotion = 'happy' | 'sad' | 'neutral' | 'action';

interface Props {
  aiLevel?: AIDifficulty;
  emotion?: CharacterEmotion;
  showPedestal?: boolean;
}

export const AiRobotIllustration: React.FC<Props> = ({
  aiLevel = 'medium',
  emotion = 'neutral',
  showPedestal = true,
}) => {
  const aiTheme = {
    easy: { primary: '#10B981', secondary: '#047857', glow: '#6EE7B7' },
    medium: { primary: '#F59E0B', secondary: '#B45309', glow: '#FDE68A' },
    hard: { primary: '#EF4444', secondary: '#991B1B', glow: '#FCA5A5' },
  }[aiLevel];

  return (
    <svg viewBox="0 0 160 220" className="w-full h-full drop-shadow-xl select-none">
      <defs>
        <radialGradient id="ai-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="ai-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="ai-pedestal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={aiTheme.primary} />
          <stop offset="100%" stopColor={aiTheme.secondary} />
        </linearGradient>
      </defs>

      {/* 2.5D Isometric Pedestal */}
      {showPedestal && (
        <g transform="translate(0, 150)">
          <ellipse cx="80" cy="38" rx="60" ry="20" fill="url(#ai-shadow)" />
          <path d="M24 30 C24 42 136 42 136 30 L136 44 C136 56 24 56 24 44 Z" fill={aiTheme.secondary} />
          <ellipse cx="80" cy="30" rx="56" ry="18" fill="url(#ai-pedestal)" />
          <ellipse cx="80" cy="30" rx="46" ry="14" fill="#0F172A" opacity="0.4" />
        </g>
      )}

      {/* Robot Torso & Limbs */}
      <g transform={`translate(0, ${emotion === 'happy' ? -6 : emotion === 'sad' ? 6 : 0})`}>
        <ellipse cx="80" cy="162" rx="30" ry="8" fill="rgba(0,0,0,0.25)" />
        <rect x="62" y="132" width="12" height="28" rx="4" fill="#475569" />
        <rect x="86" y="132" width="12" height="28" rx="4" fill="#475569" />
        <ellipse cx="68" cy="160" rx="8" ry="4" fill="#1E293B" />
        <ellipse cx="92" cy="160" rx="8" ry="4" fill="#1E293B" />

        <rect x="52" y="86" width="56" height="50" rx="12" fill="url(#ai-body)" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="62" y="96" width="36" height="24" rx="6" fill="#0F172A" />
        <circle cx="80" cy="108" r="8" fill={aiTheme.primary} opacity="0.8" />
        <circle cx="80" cy="108" r="5" fill="#FFFFFF" />

        {emotion === 'happy' ? (
          <g>
            <path d="M52 94 Q36 80 40 60" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M108 94 Q124 80 120 60" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="58" r="7" fill={aiTheme.primary} />
            <circle cx="120" cy="58" r="7" fill={aiTheme.primary} />
          </g>
        ) : emotion === 'sad' ? (
          <g>
            <path d="M52 94 Q42 120 46 138" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M108 94 Q118 120 114 138" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="46" cy="140" r="7" fill="#64748B" />
            <circle cx="114" cy="140" r="7" fill="#64748B" />
          </g>
        ) : (
          <g>
            <path d="M52 94 Q40 110 44 126" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M108 94 Q126 102 122 118" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="44" cy="126" r="7" fill={aiTheme.primary} />
            <circle cx="122" cy="118" r="7" fill={aiTheme.primary} />
          </g>
        )}

        <rect x="50" y="36" width="60" height="46" rx="14" fill="url(#ai-body)" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="58" y="44" width="44" height="22" rx="6" fill="#0F172A" />

        {emotion === 'happy' ? (
          <g stroke={aiTheme.primary} strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M66 58 Q72 50 78 58" />
            <path d="M82 58 Q88 50 94 58" />
          </g>
        ) : emotion === 'sad' ? (
          <g>
            <line x1="68" y1="52" x2="76" y2="58" stroke={aiTheme.primary} strokeWidth="3" strokeLinecap="round" />
            <line x1="92" y1="52" x2="84" y2="58" stroke={aiTheme.primary} strokeWidth="3" strokeLinecap="round" />
            <circle cx="70" cy="66" r="3" fill="#38BDF8" />
            <circle cx="90" cy="66" r="3" fill="#38BDF8" />
          </g>
        ) : (
          <g fill={aiTheme.primary}>
            <circle cx="71" cy="55" r="4.5" />
            <circle cx="89" cy="55" r="4.5" />
          </g>
        )}

        <line x1="80" y1="36" x2="80" y2="18" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="15" r="6" fill={emotion === 'happy' ? '#FBBF24' : emotion === 'sad' ? '#64748B' : aiTheme.primary} />
        <rect x="44" y="50" width="6" height="18" rx="3" fill="#64748B" />
        <rect x="110" y="50" width="6" height="18" rx="3" fill="#64748B" />
      </g>
    </svg>
  );
};
