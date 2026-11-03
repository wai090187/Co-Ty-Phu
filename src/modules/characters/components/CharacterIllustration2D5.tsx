import React from 'react';
import { AIDifficulty } from '../../../types/game';
import {
  AiRobotIllustration,
  CharacterEmotion,
} from './illustrations/AiRobotIllustration';
import { CongTuIllustration } from './illustrations/CongTuIllustration';
import { CoBaIllustration } from './illustrations/CoBaIllustration';
import { GenericHeroIllustration } from './illustrations/GenericHeroIllustration';
import { IllustrationEffects } from './illustrations/IllustrationEffects';

export type { CharacterEmotion };

export interface CharacterIllustration2D5Props {
  characterId?: string;
  isAI?: boolean;
  aiNumber?: number;
  aiLevel?: AIDifficulty;
  emotion?: CharacterEmotion;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showPedestal?: boolean;
  className?: string;
}

export const CharacterIllustration2D5: React.FC<CharacterIllustration2D5Props> = ({
  characterId = 'cong-tu',
  isAI = false,
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

  if (isAI) {
    return (
      <div className={`relative flex items-center justify-center ${sizeStyles} ${className}`}>
        <AiRobotIllustration aiLevel={aiLevel} emotion={emotion} showPedestal={showPedestal} />
      </div>
    );
  }

  const renderCharacterBody = () => {
    switch (characterId) {
      case 'cong-tu':
        return <CongTuIllustration emotion={emotion} />;
      case 'co-ba':
        return <CoBaIllustration emotion={emotion} />;
      case 'linh-ho':
        return (
          <g transform={`translate(0, ${emotion === 'happy' ? -6 : emotion === 'sad' ? 6 : 0})`}>
            <image
              href="/assets/characters/linh-ho.png"
              x="16"
              y="12"
              width="128"
              height="150"
              preserveAspectRatio="xMidYMid meet"
            />
            <circle cx="34" cy="70" r="5" fill="#38BDF8" opacity="0.8" />
            <circle cx="126" cy="65" r="4" fill="#67E8F9" opacity="0.8" />
          </g>
        );
      case 'ahri':
        return (
          <g transform={`translate(0, ${emotion === 'happy' ? -6 : emotion === 'sad' ? 6 : 0})`}>
            <clipPath id="ahri-2d5-clip">
              <rect x="22" y="10" width="116" height="152" rx="18" />
            </clipPath>
            <image
              href="/assets/characters/ahri.jpg"
              x="20"
              y="10"
              width="120"
              height="152"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#ahri-2d5-clip)"
            />
            <circle cx="48" cy="94" r="14" fill="#38BDF8" opacity="0.4" />
            <circle cx="48" cy="94" r="8" fill="#E0F2FE" />
            <circle cx="48" cy="94" r="4.5" fill="#0284C7" />
          </g>
        );
      default:
        return <GenericHeroIllustration characterId={characterId} emotion={emotion} />;
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
        <IllustrationEffects emotion={emotion} />
      </svg>
    </div>
  );
};
