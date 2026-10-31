import React from 'react';
import { Player } from '../../../types/game';
import { CharacterAvatar } from '../../characters/components/CharacterAvatar';

interface Props {
  playersOnTile: Player[];
  edge: 'bottom' | 'left' | 'top' | 'right' | 'corner';
  tileId: number;
}

export const TilePlayerBadges: React.FC<Props> = ({ playersOnTile, edge, tileId }) => {
  if (playersOnTile.length === 0) return null;

  const getAvatarPositionClass = () => {
    switch (edge) {
      case 'top':
        return '-top-9 left-1/2 -translate-x-1/2 flex-row';
      case 'bottom':
        return '-bottom-9 left-1/2 -translate-x-1/2 flex-row';
      case 'left':
        return '-left-9 top-1/2 -translate-y-1/2 flex-col';
      case 'right':
        return '-right-9 top-1/2 -translate-y-1/2 flex-col';
      case 'corner':
        if (tileId === 0) return '-bottom-8 -right-8 flex-row';
        if (tileId === 10) return '-bottom-8 -left-8 flex-row';
        if (tileId === 20) return '-top-8 -left-8 flex-row';
        if (tileId === 30) return '-top-8 -right-8 flex-row';
        return '-top-8 left-1/2 -translate-x-1/2 flex-row';
    }
  };

  return (
    <div
      className={`absolute ${getAvatarPositionClass()} flex items-center justify-center -space-x-2 -space-y-1 pointer-events-none z-40 animate-bounce`}
    >
      {playersOnTile.map(p => (
        <div
          key={p.id}
          className="relative rounded-full ring-3 ring-white shadow-xl bg-white shrink-0"
          style={{ borderColor: p.color }}
        >
          <CharacterAvatar
            characterId={p.characterId}
            isAI={p.isAI}
            aiNumber={p.id}
            aiLevel={p.aiLevel}
            size="sm"
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8.5px] font-black text-white flex items-center justify-center border border-white"
            style={{ backgroundColor: p.color }}
          >
            {p.id}
          </span>
        </div>
      ))}
    </div>
  );
};
