import React from 'react';

export const PhapSuAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-mage" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-mage)" />
    <path d="M12 64 C12 50 20 46 32 46 C44 46 52 50 52 64 Z" fill="#1E3A8A" />
    <circle cx="32" cy="49" r="3" fill="#FBBF24" />
    <circle cx="32" cy="30" r="13" fill="#E2E8F0" />
    <ellipse cx="32" cy="34" rx="9" ry="10" fill="#FEF08A" />
    <polygon points="24,26 28,34 32,27 36,34 40,26" fill="#CBD5E1" />
    <circle cx="28" cy="33" r="3" fill="none" stroke="#60A5FA" strokeWidth="1.2" />
    <circle cx="36" cy="33" r="3" fill="none" stroke="#60A5FA" strokeWidth="1.2" />
    <line x1="31" y1="33" x2="33" y2="33" stroke="#60A5FA" strokeWidth="1.2" />
    <circle cx="28" cy="33" r="1.5" fill="#1D4ED8" />
    <circle cx="36" cy="33" r="1.5" fill="#1D4ED8" />
    <path d="M16 24 Q32 18 48 24 L32 8 Z" fill="#1E40AF" />
    <circle cx="32" cy="8" r="2" fill="#FBBF24" />
  </svg>
);

export const SteampunkAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-steam" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-steam)" />
    <path d="M14 64 C14 50 22 45 32 45 C42 45 50 50 50 64 Z" fill="#451A03" />
    <line x1="32" y1="45" x2="32" y2="64" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2 2" />
    <ellipse cx="32" cy="34" rx="10" ry="11" fill="#FED7AA" />
    <path d="M26 38 C26 46 38 46 38 38 Z" fill="#78350F" />
    <rect x="22" y="14" width="20" height="12" fill="#292524" rx="2" />
    <ellipse cx="32" cy="26" rx="16" ry="4" fill="#1C1917" />
    <circle cx="28" cy="22" r="4" fill="#0284C7" stroke="#D97706" strokeWidth="2" />
    <circle cx="36" cy="22" r="4" fill="#0284C7" stroke="#D97706" strokeWidth="2" />
    <line x1="32" y1="22" x2="32" y2="22" stroke="#78350F" strokeWidth="3" />
  </svg>
);

export const CyberRunnerAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-cyber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#09090B" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-cyber)" />
    <path d="M12 64 C12 48 20 44 32 44 C44 44 52 48 52 64 Z" fill="#18181B" />
    <path d="M24 45 L32 54 L40 45" stroke="#22D3EE" strokeWidth="2" fill="none" />
    <ellipse cx="32" cy="33" rx="10" ry="11" fill="#E4E4E7" />
    <rect x="23" y="28" width="18" height="6" rx="2" fill="#06B6D4" />
    <line x1="24" y1="31" x2="40" y2="31" stroke="#EC4899" strokeWidth="1" />
    <rect x="19" y="27" width="4" height="10" rx="2" fill="#F43F5E" />
    <rect x="41" y="27" width="4" height="10" rx="2" fill="#F43F5E" />
    <path d="M21 27 C21 17 43 17 43 27" stroke="#F43F5E" strokeWidth="2.5" fill="none" />
    <path d="M24 24 Q32 18 40 24" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const RoyalQueenAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-royal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-royal)" />
    <path d="M12 64 C12 48 20 44 32 44 C44 44 52 48 52 64 Z" fill="#991B1B" />
    <path d="M22 45 Q32 52 42 45" stroke="#F8FAFC" strokeWidth="4" fill="none" />
    <ellipse cx="32" cy="34" rx="10" ry="11" fill="#FEF3C7" />
    <circle cx="32" cy="28" r="12" fill="#F59E0B" />
    <polygon points="20,24 24,14 28,20 32,12 36,20 40,14 44,24" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
    <circle cx="32" cy="12" r="1.5" fill="#DC2626" />
    <circle cx="24" cy="14" r="1.2" fill="#2563EB" />
    <circle cx="40" cy="14" r="1.2" fill="#2563EB" />
    <circle cx="28" cy="34" r="1.5" fill="#451A03" />
    <circle cx="36" cy="34" r="1.5" fill="#451A03" />
    <path d="M30 40 Q32 41 34 40" stroke="#B91C1C" strokeWidth="1.2" fill="none" />
  </svg>
);

export const ChibiHeroAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-chibi" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-chibi)" />
    <path d="M16 64 C16 52 22 48 32 48 C42 48 48 52 48 64 Z" fill="#94A3B8" />
    <circle cx="32" cy="54" r="3" fill="#F59E0B" />
    <ellipse cx="32" cy="32" rx="13" ry="12" fill="#FED7AA" />
    <path d="M19 28 C19 16 45 16 45 28 L42 32 L22 32 Z" fill="#64748B" />
    <rect x="23" y="26" width="18" height="4" rx="2" fill="#0F172A" />
    <path d="M32 16 Q36 6 42 12 Q36 12 32 16" fill="#38BDF8" />
    <ellipse cx="27" cy="34" rx="2.8" ry="3.5" fill="#1E293B" />
    <ellipse cx="37" cy="34" rx="2.8" ry="3.5" fill="#1E293B" />
    <circle cx="26" cy="32.5" r="1.2" fill="#FFFFFF" />
    <circle cx="36" cy="32.5" r="1.2" fill="#FFFFFF" />
    <ellipse cx="24" cy="37" rx="2" ry="1.2" fill="#F43F5E" opacity="0.6" />
    <ellipse cx="40" cy="37" rx="2" ry="1.2" fill="#F43F5E" opacity="0.6" />
    <path d="M30 38 Q32 41 34 38" stroke="#1E293B" strokeWidth="1.2" fill="none" />
  </svg>
);
