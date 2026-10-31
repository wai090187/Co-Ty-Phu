import React from 'react';
import { AIDifficulty } from '../../types/game';

interface Props {
  characterId?: string;
  isAI?: boolean;
  aiNumber?: number;
  aiLevel?: AIDifficulty;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CharacterAvatar: React.FC<Props> = ({
  characterId = 'cong-tu',
  isAI = false,
  aiNumber = 1,
  aiLevel = 'medium',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
  }[size];

  if (isAI) {
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
          <circle cx="27" cy="29.5" r="2.5" fill={aiLevel === 'hard' ? '#EF4444' : aiLevel === 'medium' ? '#F59E0B' : '#10B981'} />
          <circle cx="37" cy="29.5" r="2.5" fill={aiLevel === 'hard' ? '#EF4444' : aiLevel === 'medium' ? '#F59E0B' : '#10B981'} />
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
  }

  // 10 Detailed SVG Characters for Human Players
  const renderAvatarGraphic = () => {
    switch (characterId) {
      case 'cong-tu': // Retro Nam Kỳ Gentleman
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-congtu" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-congtu)" />
            {/* White Suit Collar & Bowtie */}
            <path d="M12 64 C12 50 20 44 32 44 C44 44 52 50 52 64 Z" fill="#F8FAFC" />
            <polygon points="32,46 26,52 38,52" fill="#1E293B" />
            <polygon points="27,47 32,50 37,47 32,54" fill="#B91C1C" />
            {/* Head & Face */}
            <ellipse cx="32" cy="34" rx="11" ry="12" fill="#FFEDD5" />
            {/* Mustaches & Smile */}
            <path d="M26 38 Q32 37 38 38 Q32 41 26 38 Z" fill="#451A03" />
            <circle cx="28" cy="32" r="1.5" fill="#1E293B" />
            <circle cx="36" cy="32" r="1.5" fill="#1E293B" />
            {/* Fedora Hat */}
            <ellipse cx="32" cy="23" rx="17" ry="5" fill="#1E293B" />
            <path d="M22 23 C22 15 25 12 32 12 C39 12 42 15 42 23 Z" fill="#1E293B" />
            <rect x="23" y="20" width="18" height="3" fill="#B91C1C" />
            {/* Gold monocle */}
            <circle cx="36" cy="32" r="4" fill="none" stroke="#F59E0B" strokeWidth="1" />
            <line x1="40" y1="32" x2="43" y2="39" stroke="#F59E0B" strokeWidth="0.8" />
          </svg>
        );

      case 'co-ba': // Retro Áo Dài Beauty
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-coba" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-coba)" />
            {/* Pink Silk Áo Dài */}
            <path d="M14 64 C14 51 22 46 32 46 C42 46 50 51 50 64 Z" fill="#BE185D" />
            <path d="M28 46 L32 58 L36 46 Z" fill="#FDE047" />
            {/* Pearl Necklace */}
            <circle cx="28" cy="49" r="1.5" fill="#FFFBEB" />
            <circle cx="32" cy="50" r="1.5" fill="#FFFBEB" />
            <circle cx="36" cy="49" r="1.5" fill="#FFFBEB" />
            {/* Face */}
            <ellipse cx="32" cy="34" rx="10" ry="12" fill="#FED7AA" />
            {/* Graceful Hair Bun */}
            <circle cx="32" cy="20" r="10" fill="#171717" />
            <path d="M22 26 C22 18 42 18 42 26 C42 34 22 34 22 26 Z" fill="#171717" />
            {/* Jade Hairpin */}
            <line x1="38" y1="17" x2="48" y2="13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="48" cy="13" r="2" fill="#F43F5E" />
            {/* Eyes & Red Lips */}
            <path d="M26 33 Q29 32 30 34" stroke="#171717" strokeWidth="1" fill="none" />
            <path d="M34 34 Q35 32 38 33" stroke="#171717" strokeWidth="1" fill="none" />
            <path d="M30 40 Q32 42 34 40 Z" fill="#E11D48" />
          </svg>
        );

      case 'tieu-thu-gothic': // Gothic Lolita
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-gothic" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4C1D95" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-gothic)" />
            {/* Black Lace Dress */}
            <path d="M12 64 C12 50 20 45 32 45 C44 45 52 50 52 64 Z" fill="#09090B" />
            <path d="M26 47 L32 55 L38 47 Z" fill="#8B5CF6" />
            {/* Pale Face */}
            <ellipse cx="32" cy="34" rx="10" ry="12" fill="#F8FAFC" />
            {/* Twin Drills Violet Hair */}
            <path d="M20 22 C12 28 14 44 18 48 C16 40 18 32 24 28 Z" fill="#2E1065" />
            <path d="M44 22 C52 28 50 44 46 48 C48 40 46 32 40 28 Z" fill="#2E1065" />
            <path d="M22 28 C22 18 42 18 42 28 C38 22 26 22 22 28 Z" fill="#2E1065" />
            {/* Gothic Rose Headband */}
            <rect x="22" y="20" width="20" height="3" fill="#09090B" rx="1" />
            <circle cx="23" cy="21" r="3" fill="#DC2626" />
            <circle cx="41" cy="21" r="3" fill="#DC2626" />
            {/* Crimson Eyes */}
            <ellipse cx="28" cy="33" rx="2" ry="2.5" fill="#DC2626" />
            <ellipse cx="36" cy="33" rx="2" ry="2.5" fill="#DC2626" />
            <circle cx="27.5" cy="32" r="0.7" fill="#FFFFFF" />
            <circle cx="35.5" cy="32" r="0.7" fill="#FFFFFF" />
            {/* Dark Lip */}
            <path d="M30 40 Q32 41 34 40" stroke="#7F1D1D" strokeWidth="1" fill="none" />
          </svg>
        );

      case 'tham-tu-noir': // Noir Detective
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-noir" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-noir)" />
            {/* Trench Coat */}
            <path d="M12 64 L22 45 L42 45 L52 64 Z" fill="#475569" />
            <polygon points="32,47 28,64 36,64" fill="#0F172A" />
            {/* Face Shadowed */}
            <ellipse cx="32" cy="34" rx="10" ry="11" fill="#E2E8F0" />
            {/* Low brim fedora with shadow */}
            <ellipse cx="32" cy="24" rx="18" ry="5" fill="#1E293B" />
            <path d="M20 24 C20 16 26 13 32 13 C38 13 44 16 44 24 Z" fill="#0F172A" />
            {/* Shadow covering eyes */}
            <path d="M22 25 L42 25 L40 33 L24 33 Z" fill="rgba(15,23,42,0.85)" />
            {/* Glowing Cigarette / Pipe */}
            <line x1="34" y1="40" x2="44" y2="43" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="45" cy="43" r="1.5" fill="#EF4444" />
          </svg>
        );

      case 'kiem-si-anime': // Anime Swordsman Girl
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-anime" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-anime)" />
            {/* White/Red Kimono */}
            <path d="M14 64 C14 50 20 46 32 46 C44 46 50 50 50 64 Z" fill="#FFF1F2" />
            <path d="M26 46 L32 56 L38 46" stroke="#E11D48" strokeWidth="3" fill="none" />
            {/* Flowing Pink Anime Hair */}
            <path d="M16 26 C12 36 16 50 20 52 C18 40 22 32 26 26 Z" fill="#FB7185" />
            <path d="M48 26 C52 36 48 50 44 52 C46 40 42 32 38 26 Z" fill="#FB7185" />
            <circle cx="32" cy="28" r="14" fill="#FB7185" />
            {/* Face */}
            <polygon points="24,28 32,42 40,28" fill="#FFE4E6" />
            <circle cx="32" cy="32" r="9" fill="#FFE4E6" />
            {/* Anime Bangs */}
            <polygon points="26,24 29,32 32,25 35,32 38,24" fill="#FB7185" />
            {/* Big Expressive Anime Eyes */}
            <ellipse cx="28" cy="33" rx="2.5" ry="3.5" fill="#0284C7" />
            <ellipse cx="36" cy="33" rx="2.5" ry="3.5" fill="#0284C7" />
            <circle cx="27.5" cy="32" r="1" fill="#FFFFFF" />
            <circle cx="35.5" cy="32" r="1" fill="#FFFFFF" />
            {/* Red Hair Ribbon */}
            <polygon points="18,18 24,22 18,26" fill="#BE123C" />
            <polygon points="46,18 40,22 46,26" fill="#BE123C" />
          </svg>
        );

      case 'phap-su-anime': // Anime Mage
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-mage" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-mage)" />
            {/* Deep Blue Robe */}
            <path d="M12 64 C12 50 20 46 32 46 C44 46 52 50 52 64 Z" fill="#1E3A8A" />
            <circle cx="32" cy="49" r="3" fill="#FBBF24" />
            {/* Silver Hair */}
            <circle cx="32" cy="30" r="13" fill="#E2E8F0" />
            <ellipse cx="32" cy="34" rx="9" ry="10" fill="#FEF08A" />
            {/* Spiky silver bangs */}
            <polygon points="24,26 28,34 32,27 36,34 40,26" fill="#CBD5E1" />
            {/* Glasses */}
            <circle cx="28" cy="33" r="3" fill="none" stroke="#60A5FA" strokeWidth="1.2" />
            <circle cx="36" cy="33" r="3" fill="none" stroke="#60A5FA" strokeWidth="1.2" />
            <line x1="31" y1="33" x2="33" y2="33" stroke="#60A5FA" strokeWidth="1.2" />
            <circle cx="28" cy="33" r="1.5" fill="#1D4ED8" />
            <circle cx="36" cy="33" r="1.5" fill="#1D4ED8" />
            {/* Pointy Wizard Hat */}
            <path d="M16 24 Q32 18 48 24 L32 8 Z" fill="#1E40AF" />
            <circle cx="32" cy="8" r="2" fill="#FBBF24" />
          </svg>
        );

      case 'ky-su-steampunk': // Steampunk Engineer
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-steam" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-steam)" />
            {/* Leather Vest */}
            <path d="M14 64 C14 50 22 45 32 45 C42 45 50 50 50 64 Z" fill="#451A03" />
            <line x1="32" y1="45" x2="32" y2="64" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2 2" />
            {/* Face & Brown Beard */}
            <ellipse cx="32" cy="34" rx="10" ry="11" fill="#FED7AA" />
            <path d="M26 38 C26 46 38 46 38 38 Z" fill="#78350F" />
            {/* Top Hat with Brass Goggles */}
            <rect x="22" y="14" width="20" height="12" fill="#292524" rx="2" />
            <ellipse cx="32" cy="26" rx="16" ry="4" fill="#1C1917" />
            {/* Steampunk Goggles on Hat */}
            <circle cx="28" cy="22" r="4" fill="#0284C7" stroke="#D97706" strokeWidth="2" />
            <circle cx="36" cy="22" r="4" fill="#0284C7" stroke="#D97706" strokeWidth="2" />
            <line x1="32" y1="22" x2="32" y2="22" stroke="#78350F" strokeWidth="3" />
          </svg>
        );

      case 'cyber-runner': // Cyberpunk Runner
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-cyber" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#09090B" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-cyber)" />
            {/* Tech Hoodie */}
            <path d="M12 64 C12 48 20 44 32 44 C44 44 52 48 52 64 Z" fill="#18181B" />
            <path d="M24 45 L32 54 L40 45" stroke="#22D3EE" strokeWidth="2" fill="none" />
            {/* Neon Mask & Visor */}
            <ellipse cx="32" cy="33" rx="10" ry="11" fill="#E4E4E7" />
            {/* Cyber Visor */}
            <rect x="23" y="28" width="18" height="6" rx="2" fill="#06B6D4" />
            <line x1="24" y1="31" x2="40" y2="31" stroke="#EC4899" strokeWidth="1" />
            {/* Headphones */}
            <rect x="19" y="27" width="4" height="10" rx="2" fill="#F43F5E" />
            <rect x="41" y="27" width="4" height="10" rx="2" fill="#F43F5E" />
            <path d="M21 27 C21 17 43 17 43 27" stroke="#F43F5E" strokeWidth="2.5" fill="none" />
            {/* Cyber Hairstyle */}
            <path d="M24 24 Q32 18 40 24" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'nu-hoang-hoang-gia': // Royal Queen
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-royal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-royal)" />
            {/* Velvet Royal Robe */}
            <path d="M12 64 C12 48 20 44 32 44 C44 44 52 48 52 64 Z" fill="#991B1B" />
            {/* Ermine Fur Collar */}
            <path d="M22 45 Q32 52 42 45" stroke="#F8FAFC" strokeWidth="4" fill="none" />
            {/* Noble Face */}
            <ellipse cx="32" cy="34" rx="10" ry="11" fill="#FEF3C7" />
            {/* Golden Hair */}
            <circle cx="32" cy="28" r="12" fill="#F59E0B" />
            {/* Big Golden Crown */}
            <polygon points="20,24 24,14 28,20 32,12 36,20 40,14 44,24" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="32" cy="12" r="1.5" fill="#DC2626" />
            <circle cx="24" cy="14" r="1.2" fill="#2563EB" />
            <circle cx="40" cy="14" r="1.2" fill="#2563EB" />
            {/* Calm Royal Eyes */}
            <circle cx="28" cy="34" r="1.5" fill="#451A03" />
            <circle cx="36" cy="34" r="1.5" fill="#451A03" />
            <path d="M30 40 Q32 41 34 40" stroke="#B91C1C" strokeWidth="1.2" fill="none" />
          </svg>
        );

      case 'chibi-dung-si': // Chibi Knight Hero
      default:
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <linearGradient id="bg-chibi" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#bg-chibi)" />
            {/* Silver Plate Armor */}
            <path d="M16 64 C16 52 22 48 32 48 C42 48 48 52 48 64 Z" fill="#94A3B8" />
            <circle cx="32" cy="54" r="3" fill="#F59E0B" />
            {/* Cute Big Chibi Head */}
            <ellipse cx="32" cy="32" rx="13" ry="12" fill="#FED7AA" />
            {/* Knight Helmet with Wing Plumes */}
            <path d="M19 28 C19 16 45 16 45 28 L42 32 L22 32 Z" fill="#64748B" />
            <rect x="23" y="26" width="18" height="4" rx="2" fill="#0F172A" />
            {/* Blue Feathers */}
            <path d="M32 16 Q36 6 42 12 Q36 12 32 16" fill="#38BDF8" />
            {/* Big Shiny Chibi Eyes */}
            <ellipse cx="27" cy="34" rx="2.8" ry="3.5" fill="#1E293B" />
            <ellipse cx="37" cy="34" rx="2.8" ry="3.5" fill="#1E293B" />
            <circle cx="26" cy="32.5" r="1.2" fill="#FFFFFF" />
            <circle cx="36" cy="32.5" r="1.2" fill="#FFFFFF" />
            {/* Rosy Cheeks */}
            <ellipse cx="24" cy="37" rx="2" ry="1.2" fill="#F43F5E" opacity="0.6" />
            <ellipse cx="40" cy="37" rx="2" ry="1.2" fill="#F43F5E" opacity="0.6" />
            {/* Happy Smile */}
            <path d="M30 38 Q32 41 34 38" stroke="#1E293B" strokeWidth="1.2" fill="none" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative rounded-2xl shadow-sm overflow-hidden ${sizeClasses} ${className}`}>
      {renderAvatarGraphic()}
    </div>
  );
};
