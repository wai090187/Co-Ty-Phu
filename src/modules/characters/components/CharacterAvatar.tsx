import React from 'react';
import { AIDifficulty } from '../../../types/game';
import { AIAvatarSvg } from './AIAvatarSvg';
import {
  CongTuAvatarSvg,
  CoBaAvatarSvg,
  GothicAvatarSvg,
  NoirAvatarSvg,
  KiemSiAvatarSvg,
} from './ClassicAvatarSvgs';
import {
  PhapSuAvatarSvg,
  SteampunkAvatarSvg,
  CyberRunnerAvatarSvg,
  RoyalQueenAvatarSvg,
  ChibiHeroAvatarSvg,
} from './ModernAvatarSvgs';

export interface CharacterAvatarProps {
  characterId?: string;
  isAI?: boolean;
  aiNumber?: number;
  aiLevel?: AIDifficulty;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
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
    return (
      <AIAvatarSvg
        aiLevel={aiLevel}
        aiNumber={aiNumber}
        sizeClasses={sizeClasses}
        className={className}
      />
    );
  }

  const renderAvatarGraphic = () => {
    switch (characterId) {
      case 'cong-tu':
        return <CongTuAvatarSvg />;
      case 'co-ba':
        return <CoBaAvatarSvg />;
      case 'tieu-thu-gothic':
        return <GothicAvatarSvg />;
      case 'tham-tu-noir':
        return <NoirAvatarSvg />;
      case 'kiem-si-anime':
        return <KiemSiAvatarSvg />;
      case 'phap-su-anime':
        return <PhapSuAvatarSvg />;
      case 'ky-su-steampunk':
        return <SteampunkAvatarSvg />;
      case 'cyber-runner':
        return <CyberRunnerAvatarSvg />;
      case 'nu-hoang-hoang-gia':
        return <RoyalQueenAvatarSvg />;
      case 'chibi-dung-si':
      default:
        return <ChibiHeroAvatarSvg />;
    }
  };

  return (
    <div className={`relative rounded-2xl shadow-sm overflow-hidden ${sizeClasses} ${className}`}>
      {renderAvatarGraphic()}
    </div>
  );
};
