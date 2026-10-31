import React from 'react';
import { CharacterEmotion } from './AiRobotIllustration';

interface Props {
  characterId: string;
  emotion?: CharacterEmotion;
}

export const GenericHeroIllustration: React.FC<Props> = ({
  characterId,
  emotion = 'neutral',
}) => {
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
};
