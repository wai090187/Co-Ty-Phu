import React from 'react';

interface Props {
  icon?: string;
}

export const TileIcon: React.FC<Props> = ({ icon }) => {
  switch (icon) {
    case 'bus-green':
    case 'bus-blue':
    case 'bus-red': {
      const busColor =
        icon === 'bus-red' ? '#DC2626' : icon === 'bus-blue' ? '#2563EB' : '#16A34A';
      return (
        <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 mx-auto shrink-0 drop-shadow-xs">
          <rect x="5" y="8" width="22" height="15" rx="3" fill={busColor} />
          <rect x="7" y="10" width="8" height="5" rx="1" fill="#E2E8F0" />
          <rect x="17" y="10" width="8" height="5" rx="1" fill="#E2E8F0" />
          <circle cx="9" cy="23" r="3" fill="#1E293B" />
          <circle cx="23" cy="23" r="3" fill="#1E293B" />
        </svg>
      );
    }

    case 'bulb':
      return (
        <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 mx-auto shrink-0 drop-shadow-xs">
          <path
            d="M16 4 C11 4 8 8 8 13 C8 17 11 19 12 21 L20 21 C21 19 24 17 24 13 C24 8 21 4 16 4 Z"
            fill="#F59E0B"
          />
          <rect x="13" y="22" width="6" height="4" rx="1" fill="#64748B" />
        </svg>
      );

    case 'faucet':
      return (
        <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 mx-auto shrink-0 drop-shadow-xs">
          <path d="M8 12 L18 12 C21 12 23 14 23 17 L23 20 L19 20 L19 17 L8 17 Z" fill="#0284C7" />
          <rect x="14" y="6" width="4" height="6" fill="#38BDF8" rx="1" />
          <circle cx="21" cy="24" r="2" fill="#38BDF8" />
        </svg>
      );

    case 'question':
      return (
        <div className="font-display text-rose-600 font-extrabold text-base sm:text-lg leading-none text-center my-0.5 select-none">
          ?
        </div>
      );

    case 'chest':
    case 'chest-blue':
      return (
        <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 mx-auto shrink-0 drop-shadow-xs">
          <rect x="4" y="10" width="24" height="15" rx="2" fill="#D97706" />
          <path d="M4 14 Q16 8 28 14 Z" fill="#F59E0B" />
          <rect x="14" y="13" width="4" height="4" rx="1" fill="#FEF08A" />
        </svg>
      );

    case 'tax':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 my-0.5 text-slate-700 fill-slate-700 shrink-0">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'diamond':
      return (
        <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 mx-auto shrink-0 drop-shadow-xs">
          <polygon points="16,5 26,13 16,27 6,13" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
          <polygon points="16,5 21,13 16,27 11,13" fill="#BAE6FD" />
        </svg>
      );

    default:
      return null;
  }
};
