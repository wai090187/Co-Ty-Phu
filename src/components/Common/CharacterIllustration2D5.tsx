import React from 'react';
import { AIDifficulty } from '../../types/game';

export type CharacterEmotion = 'happy' | 'sad' | 'neutral' | 'action';

interface Props {
  characterId?: string;
  isAI?: boolean;
  aiNumber?: number;
  aiLevel?: AIDifficulty;
  emotion?: CharacterEmotion;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showPedestal?: boolean;
  className?: string;
}

export const CharacterIllustration2D5: React.FC<Props> = ({
  characterId = 'cong-tu',
  isAI = false,
  aiNumber = 1,
  aiLevel = 'medium',
  emotion = 'neutral',
  size = 'md',
  showPedestal = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-36 h-48',
    xl: 'w-48 h-64',
    '2xl': 'w-64 h-80',
  }[size];

  // AI Robot in 2.5D
  if (isAI) {
    const aiTheme = {
      easy: { primary: '#10B981', secondary: '#047857', glow: '#6EE7B7' },
      medium: { primary: '#F59E0B', secondary: '#B45309', glow: '#FDE68A' },
      hard: { primary: '#EF4444', secondary: '#991B1B', glow: '#FCA5A5' },
    }[aiLevel];

    return (
      <div className={`relative flex items-center justify-center ${sizeStyles} ${className}`}>
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
              {/* 3D Base Thickness */}
              <path d="M24 30 C24 42 136 42 136 30 L136 44 C136 56 24 56 24 44 Z" fill={aiTheme.secondary} />
              <ellipse cx="80" cy="30" rx="56" ry="18" fill="url(#ai-pedestal)" />
              <ellipse cx="80" cy="30" rx="46" ry="14" fill="#0F172A" opacity="0.4" />
            </g>
          )}

          {/* Robot Torso & Limbs */}
          <g transform={`translate(0, ${emotion === 'happy' ? -6 : emotion === 'sad' ? 6 : 0})`}>
            {/* Shadow under feet */}
            <ellipse cx="80" cy="162" rx="30" ry="8" fill="rgba(0,0,0,0.25)" />

            {/* Legs */}
            <rect x="62" y="132" width="12" height="28" rx="4" fill="#475569" />
            <rect x="86" y="132" width="12" height="28" rx="4" fill="#475569" />
            <ellipse cx="68" cy="160" rx="8" ry="4" fill="#1E293B" />
            <ellipse cx="92" cy="160" rx="8" ry="4" fill="#1E293B" />

            {/* Body */}
            <rect x="52" y="86" width="56" height="50" rx="12" fill="url(#ai-body)" stroke="#CBD5E1" strokeWidth="2" />
            <rect x="62" y="96" width="36" height="24" rx="6" fill="#0F172A" />
            <circle cx="80" cy="108" r="8" fill={aiTheme.primary} opacity="0.8" />
            <circle cx="80" cy="108" r="5" fill="#FFFFFF" />

            {/* Arms */}
            {emotion === 'happy' ? (
              // Raised arms
              <g>
                <path d="M52 94 Q36 80 40 60" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M108 94 Q124 80 120 60" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <circle cx="40" cy="58" r="7" fill={aiTheme.primary} />
                <circle cx="120" cy="58" r="7" fill={aiTheme.primary} />
              </g>
            ) : emotion === 'sad' ? (
              // Drooping arms
              <g>
                <path d="M52 94 Q42 120 46 138" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M108 94 Q118 120 114 138" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <circle cx="46" cy="140" r="7" fill="#64748B" />
                <circle cx="114" cy="140" r="7" fill="#64748B" />
              </g>
            ) : (
              // Neutral / Action
              <g>
                <path d="M52 94 Q40 110 44 126" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M108 94 Q126 102 122 118" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <circle cx="44" cy="126" r="7" fill={aiTheme.primary} />
                <circle cx="122" cy="118" r="7" fill={aiTheme.primary} />
              </g>
            )}

            {/* Head */}
            <rect x="50" y="36" width="60" height="46" rx="14" fill="url(#ai-body)" stroke="#CBD5E1" strokeWidth="2" />
            <rect x="58" y="44" width="44" height="22" rx="6" fill="#0F172A" />

            {/* Eyes by Emotion */}
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

            {/* Antenna & Ears */}
            <line x1="80" y1="36" x2="80" y2="18" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <circle cx="80" cy="15" r="6" fill={emotion === 'happy' ? '#FBBF24' : emotion === 'sad' ? '#64748B' : aiTheme.primary} />
            <rect x="44" y="50" width="6" height="18" rx="3" fill="#64748B" />
            <rect x="110" y="50" width="6" height="18" rx="3" fill="#64748B" />
          </g>

          {/* Emotion Accents */}
          {emotion === 'happy' && (
            <g>
              <text x="30" y="40" fontSize="18" fill="#F59E0B">✨</text>
              <text x="120" y="40" fontSize="18" fill="#F59E0B">🎉</text>
              <circle cx="70" cy="15" r="3" fill="#FCD34D" />
              <circle cx="90" cy="18" r="2" fill="#FCD34D" />
            </g>
          )}
          {emotion === 'sad' && (
            <g>
              <text x="35" y="35" fontSize="16">💧</text>
              <text x="115" y="35" fontSize="16">💧</text>
              <path d="M60 20 Q80 15 100 20 Q80 25 60 20" fill="#64748B" opacity="0.6" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  // 10 Human 2.5D Characters
  const renderCharacterBody = () => {
    switch (characterId) {
      case 'cong-tu': // Công Tử Bạc Liêu
        return (
          <g transform={`translate(0, ${emotion === 'happy' ? -4 : emotion === 'sad' ? 4 : 0})`}>
            {/* White/Cream retro luxury 3-piece suit */}
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

            {/* Fedora Hat with red ribbon */}
            <ellipse cx="80" cy="40" rx="28" ry="8" fill="#1E293B" />
            <path d="M62 40 C62 25 66 18 80 18 C94 18 98 25 98 40 Z" fill="#1E293B" />
            <rect x="64" y="34" width="32" height="5" fill="#B91C1C" />
          </g>
        );

      case 'co-ba': // Cô Ba Sài Gòn
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

      case 'tieu-thu-gothic':
      case 'tham-tu-noir':
      case 'kiem-si-anime':
      case 'phap-su-anime':
      case 'ky-su-steampunk':
      case 'cyber-runner':
      case 'nu-hoang-hoang-gia':
      case 'chibi-dung-si':
      default:
        const colorPalette: Record<string, { main: string; dark: string; hair: string; acc: string }> = {
          'tieu-thu-gothic': { main: '#4C1D95', dark: '#1E1B4B', hair: '#2E1065', acc: '#DC2626' },
          'tham-tu-noir': { main: '#475569', dark: '#0F172A', hair: '#1E293B', acc: '#F59E0B' },
          'kiem-si-anime': { main: '#FDA4AF', dark: '#E11D48', hair: '#FB7185', acc: '#0284C7' },
          'phap-su-anime': { main: '#93C5FD', dark: '#1E40AF', hair: '#E2E8F0', acc: '#FBBF24' },
          'ky-su-steampunk': { main: '#D97706', dark: '#78350F', hair: '#451A03', acc: '#0284C7' },
          'cyber-runner': { main: '#06B6D4', dark: '#09090B', hair: '#A855F7', acc: '#F43F5E' },
          'nu-hoang-hoang-gia': { main: '#CA8A04', dark: '#991B1B', hair: '#F59E0B', acc: '#DC2626' },
          'chibi-dung-si': { main: '#10B981', dark: '#047857', hair: '#64748B', acc: '#38BDF8' },
        };
        const pal = colorPalette[characterId] || colorPalette['chibi-dung-si'];

        return (
          <g transform={`translate(0, ${emotion === 'happy' ? -4 : emotion === 'sad' ? 4 : 0})`}>
            <rect x="64" y="128" width="12" height="38" fill={pal.dark} rx="3" />
            <rect x="84" y="128" width="12" height="38" fill={pal.dark} rx="3" />
            <ellipse cx="68" cy="166" rx="8" ry="4" fill="#0F172A" />
            <ellipse cx="92" cy="166" rx="8" ry="4" fill="#0F172A" />

            <path d="M52 80 C52 68 108 68 108 80 L104 132 C104 136 56 136 56 132 Z" fill={pal.main} />
            <path d="M72 80 L80 126 L88 80 Z" fill={pal.dark} />
            <circle cx="80" cy="100" r="4" fill={pal.acc} />

            {emotion === 'happy' ? (
              <g>
                <path d="M52 84 Q34 65 42 46" stroke={pal.main} strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M108 84 Q126 65 118 46" stroke={pal.main} strokeWidth="12" strokeLinecap="round" fill="none" />
                <circle cx="42" cy="44" r="6" fill="#FED7AA" />
                <circle cx="118" cy="44" r="6" fill="#FED7AA" />
              </g>
            ) : emotion === 'sad' ? (
              <g>
                <path d="M52 84 Q40 110 46 130" stroke={pal.dark} strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M108 84 Q120 110 114 130" stroke={pal.dark} strokeWidth="12" strokeLinecap="round" fill="none" />
                <circle cx="46" cy="132" r="6" fill="#FED7AA" />
                <circle cx="114" cy="132" r="6" fill="#FED7AA" />
              </g>
            ) : (
              <g>
                <path d="M52 84 Q38 102 46 122" stroke={pal.main} strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M108 84 Q124 100 118 118" stroke={pal.main} strokeWidth="12" strokeLinecap="round" fill="none" />
                <circle cx="46" cy="122" r="6" fill="#FED7AA" />
                <circle cx="118" cy="118" r="6" fill="#FED7AA" />
              </g>
            )}

            <circle cx="80" cy="38" r="18" fill={pal.hair} />
            <ellipse cx="80" cy="52" rx="15" ry="16" fill="#FED7AA" />
            <path d="M64 44 Q80 32 96 44 L92 48 Q80 38 68 48 Z" fill={pal.hair} />

            {emotion === 'happy' ? (
              <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M70 52 Q74 46 78 52" />
                <path d="M82 52 Q86 46 90 52" />
                <ellipse cx="68" cy="57" rx="3" ry="1.5" fill="#F43F5E" opacity="0.6" />
                <ellipse cx="92" cy="57" rx="3" ry="1.5" fill="#F43F5E" opacity="0.6" />
              </g>
            ) : emotion === 'sad' ? (
              <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round">
                <line x1="71" y1="48" x2="78" y2="52" />
                <line x1="89" y1="48" x2="82" y2="52" />
              </g>
            ) : (
              <g fill="#1E293B">
                <circle cx="74" cy="50" r="2.8" />
                <circle cx="86" cy="50" r="2.8" />
              </g>
            )}

            {emotion === 'happy' ? (
              <path d="M74 60 Q80 67 86 60 Z" fill="#DC2626" />
            ) : emotion === 'sad' ? (
              <path d="M75 64 Q80 59 85 64" stroke="#1E293B" strokeWidth="2" fill="none" />
            ) : (
              <path d="M76 61 Q80 63 84 61" stroke="#1E293B" strokeWidth="1.5" fill="none" />
            )}
          </g>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeStyles} ${className}`}>
      <svg viewBox="0 0 160 220" className="w-full h-full drop-shadow-xl select-none overflow-visible">
        <defs>
          <radialGradient id={`char-shadow-${characterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id={`pedestal-grad-${characterId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {showPedestal && (
          <g transform="translate(0, 150)">
            <ellipse cx="80" cy="38" rx="60" ry="20" fill={`url(#char-shadow-${characterId})`} />
            <path d="M24 30 C24 42 136 42 136 30 L136 44 C136 56 24 56 24 44 Z" fill="#78350F" />
            <ellipse cx="80" cy="30" rx="56" ry="18" fill={`url(#pedestal-grad-${characterId})`} />
            <ellipse cx="80" cy="30" rx="48" ry="14" fill="#FEF3C7" opacity="0.3" />
          </g>
        )}

        {renderCharacterBody()}

        {emotion === 'happy' && (
          <g className="animate-bounce">
            <circle cx="36" cy="34" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <text x="33" y="38" fontSize="10" fill="#FFF" fontWeight="bold">đ</text>
            <circle cx="124" cy="38" r="7" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <text x="121" y="42" fontSize="9" fill="#FFF" fontWeight="bold">đ</text>
            <text x="24" y="60" fontSize="16" fill="#FBBF24">✨</text>
            <text x="120" y="70" fontSize="16" fill="#FBBF24">✨</text>
            <text x="72" y="16" fontSize="18" fill="#F59E0B">😄</text>
          </g>
        )}

        {emotion === 'sad' && (
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
            <text x="72" y="16" fontSize="18">😢</text>
          </g>
        )}

        {emotion === 'action' && (
          <g>
            <ellipse cx="80" cy="100" rx="60" ry="70" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
            <text x="120" y="45" fontSize="18">⚡</text>
            <text x="25" y="45" fontSize="18">🔥</text>
          </g>
        )}
      </svg>
    </div>
  );
};
