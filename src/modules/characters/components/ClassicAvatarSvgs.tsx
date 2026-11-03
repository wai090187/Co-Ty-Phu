import React from 'react';

export const CongTuAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-congtu" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-congtu)" />
    <path d="M12 64 C12 50 20 44 32 44 C44 44 52 50 52 64 Z" fill="#F8FAFC" />
    <polygon points="32,46 26,52 38,52" fill="#1E293B" />
    <polygon points="27,47 32,50 37,47 32,54" fill="#B91C1C" />
    <ellipse cx="32" cy="34" rx="11" ry="12" fill="#FFEDD5" />
    <path d="M26 38 Q32 37 38 38 Q32 41 26 38 Z" fill="#451A03" />
    <circle cx="28" cy="32" r="1.5" fill="#1E293B" />
    <circle cx="36" cy="32" r="1.5" fill="#1E293B" />
    <ellipse cx="32" cy="23" rx="17" ry="5" fill="#1E293B" />
    <path d="M22 23 C22 15 25 12 32 12 C39 12 42 15 42 23 Z" fill="#1E293B" />
    <rect x="23" y="20" width="18" height="3" fill="#B91C1C" />
    <circle cx="36" cy="32" r="4" fill="none" stroke="#F59E0B" strokeWidth="1" />
    <line x1="40" y1="32" x2="43" y2="39" stroke="#F59E0B" strokeWidth="0.8" />
  </svg>
);

export const CoBaAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-coba" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FCE7F3" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-coba)" />
    <path d="M14 64 C14 51 22 46 32 46 C42 46 50 51 50 64 Z" fill="#BE185D" />
    <path d="M28 46 L32 58 L36 46 Z" fill="#FDE047" />
    <circle cx="28" cy="49" r="1.5" fill="#FFFBEB" />
    <circle cx="32" cy="50" r="1.5" fill="#FFFBEB" />
    <circle cx="36" cy="49" r="1.5" fill="#FFFBEB" />
    <ellipse cx="32" cy="34" rx="10" ry="12" fill="#FED7AA" />
    <circle cx="32" cy="20" r="10" fill="#171717" />
    <path d="M22 26 C22 18 42 18 42 26 C42 34 22 34 22 26 Z" fill="#171717" />
    <line x1="38" y1="17" x2="48" y2="13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="48" cy="13" r="2" fill="#F43F5E" />
    <path d="M26 33 Q29 32 30 34" stroke="#171717" strokeWidth="1" fill="none" />
    <path d="M34 34 Q35 32 38 33" stroke="#171717" strokeWidth="1" fill="none" />
    <path d="M30 40 Q32 42 34 40 Z" fill="#E11D48" />
  </svg>
);

export const GothicAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-gothic" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4C1D95" />
        <stop offset="100%" stopColor="#1E1B4B" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-gothic)" />
    <path d="M12 64 C12 50 20 45 32 45 C44 45 52 50 52 64 Z" fill="#09090B" />
    <path d="M26 47 L32 55 L38 47 Z" fill="#8B5CF6" />
    <ellipse cx="32" cy="34" rx="10" ry="12" fill="#F8FAFC" />
    <path d="M20 22 C12 28 14 44 18 48 C16 40 18 32 24 28 Z" fill="#2E1065" />
    <path d="M44 22 C52 28 50 44 46 48 C48 40 46 32 40 28 Z" fill="#2E1065" />
    <path d="M22 28 C22 18 42 18 42 28 C38 22 26 22 22 28 Z" fill="#2E1065" />
    <rect x="22" y="20" width="20" height="3" fill="#09090B" rx="1" />
    <circle cx="23" cy="21" r="3" fill="#DC2626" />
    <circle cx="41" cy="21" r="3" fill="#DC2626" />
    <ellipse cx="28" cy="33" rx="2" ry="2.5" fill="#DC2626" />
    <ellipse cx="36" cy="33" rx="2" ry="2.5" fill="#DC2626" />
    <circle cx="27.5" cy="32" r="0.7" fill="#FFFFFF" />
    <circle cx="35.5" cy="32" r="0.7" fill="#FFFFFF" />
    <path d="M30 40 Q32 41 34 40" stroke="#7F1D1D" strokeWidth="1" fill="none" />
  </svg>
);

export const NoirAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-noir" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-noir)" />
    <path d="M12 64 L22 45 L42 45 L52 64 Z" fill="#475569" />
    <polygon points="32,47 28,64 36,64" fill="#0F172A" />
    <ellipse cx="32" cy="34" rx="10" ry="11" fill="#E2E8F0" />
    <ellipse cx="32" cy="24" rx="18" ry="5" fill="#1E293B" />
    <path d="M20 24 C20 16 26 13 32 13 C38 13 44 16 44 24 Z" fill="#0F172A" />
    <path d="M22 25 L42 25 L40 33 L24 33 Z" fill="rgba(15,23,42,0.85)" />
    <line x1="34" y1="40" x2="44" y2="43" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="45" cy="43" r="1.5" fill="#EF4444" />
  </svg>
);

export const KiemSiAvatarSvg: React.FC = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="bg-anime" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDA4AF" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg-anime)" />
    <path d="M14 64 C14 50 20 46 32 46 C44 46 50 50 50 64 Z" fill="#FFF1F2" />
    <path d="M26 46 L32 56 L38 46" stroke="#E11D48" strokeWidth="3" fill="none" />
    <path d="M16 26 C12 36 16 50 20 52 C18 40 22 32 26 26 Z" fill="#FB7185" />
    <path d="M48 26 C52 36 48 50 44 52 C46 40 42 32 38 26 Z" fill="#FB7185" />
    <circle cx="32" cy="28" r="14" fill="#FB7185" />
    <polygon points="24,28 32,42 40,28" fill="#FFE4E6" />
    <circle cx="32" cy="32" r="9" fill="#FFE4E6" />
    <polygon points="26,24 29,32 32,25 35,32 38,24" fill="#FB7185" />
    <ellipse cx="28" cy="33" rx="2.5" ry="3.5" fill="#0284C7" />
    <ellipse cx="36" cy="33" rx="2.5" ry="3.5" fill="#0284C7" />
    <circle cx="27.5" cy="32" r="1" fill="#FFFFFF" />
    <circle cx="35.5" cy="32" r="1" fill="#FFFFFF" />
    <polygon points="18,18 24,22 18,26" fill="#BE123C" />
    <polygon points="46,18 40,22 46,26" fill="#BE123C" />
  </svg>
);
