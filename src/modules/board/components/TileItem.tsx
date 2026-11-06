import React from 'react';
import { Tile, Player } from '../../../types/game';
import { TileIcon } from './TileIcons';
import { CornerTileContent } from './CornerTileContent';
import { TilePlayerBadges } from './TilePlayerBadges';

export interface TileItemProps {
  tile: Tile;
  playersOnTile: Player[];
  owner?: Player;
  housesCount: number; // 0..5 (5 is hotel)
  isMortgaged?: boolean;
  isCurrentTile?: boolean;
  jailMode?: 'prison' | 'investigation';
  isInvestigatorHere?: boolean;
  onClick?: () => void;
}

export const TileItem: React.FC<TileItemProps> = ({
  tile,
  playersOnTile,
  owner,
  housesCount = 0,
  isMortgaged = false,
  isCurrentTile = false,
  jailMode = 'prison',
  isInvestigatorHere = false,
  onClick,
}) => {
  const isCorner = tile.type === 'corner';
  const edge: 'bottom' | 'left' | 'top' | 'right' | 'corner' = isCorner
    ? 'corner'
    : tile.id > 0 && tile.id < 10
    ? 'bottom'
    : tile.id > 10 && tile.id < 20
    ? 'left'
    : tile.id > 20 && tile.id < 30
    ? 'top'
    : 'right';

  const isSideEdge = edge === 'left' || edge === 'right';

  // Corner Tiles
  if (isCorner) {
    return (
      <div
        onClick={onClick}
        className={`relative w-full h-full bg-[#FAF9F6] border border-black flex flex-col items-center justify-between p-1 cursor-pointer select-none transition-all ${
          isCurrentTile ? 'ring-3 ring-amber-400 z-20' : 'hover:bg-amber-50/50'
        }`}
      >
        <CornerTileContent tile={tile} jailMode={jailMode} />
        <TilePlayerBadges
          playersOnTile={playersOnTile}
          edge={edge}
          tileId={tile.id}
          isInvestigatorHere={isInvestigatorHere}
        />
      </div>
    );
  }

  // Extract main name and any bracketed subtitle if present
  const bracketMatch = tile.name.match(/^(.*?)\s*\((.*?)\)$/);
  const mainName = bracketMatch ? bracketMatch[1].trim() : tile.name;
  const bracketSub = bracketMatch ? bracketMatch[2].trim() : null;

  const bottomLabel =
    tile.type === 'station'
      ? (bracketSub || tile.subText || 'Kỹ Năng 1 Lần')
      : tile.type === 'utility'
      ? (bracketSub || tile.subText || 'Năng Lực VIP')
      : tile.subText || '';

  // Regular Tiles
  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full bg-[#FAF9F6] border border-black flex flex-col justify-between cursor-pointer select-none overflow-visible transition-all ${
        isCurrentTile ? 'ring-3 ring-amber-400 z-20 shadow-md bg-amber-50/70' : 'hover:bg-amber-50/50'
      }`}
    >
      {/* Property Color Bar */}
      {tile.type === 'property' && (
        <div
          className={`shrink-0 flex items-center justify-center gap-0.5 relative ${
            edge === 'bottom'
              ? 'order-first h-2.5 sm:h-3 border-b border-black'
              : edge === 'top'
              ? 'order-last h-2.5 sm:h-3 border-t border-black'
              : edge === 'left'
              ? 'order-last h-2 sm:h-2.5 border-t border-black'
              : 'order-first h-2 sm:h-2.5 border-b border-black'
          }`}
          style={{ backgroundColor: tile.colorHex }}
        >
          {housesCount > 0 && housesCount < 5 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: housesCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-emerald-600 border border-emerald-950 rounded-xs shadow-xs"
                  title={`${housesCount} nhà`}
                />
              ))}
            </div>
          )}
          {housesCount === 5 && (
            <div
              className="px-1 py-0.1 bg-rose-600 border border-rose-950 rounded-xs text-[7px] font-black text-white uppercase shadow-xs leading-none"
              title="Khách Sạn"
            >
              KS
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center justify-center text-center min-h-0 overflow-hidden ${
        isSideEdge ? 'px-0.5 py-0' : 'px-0.5 py-0.5'
      }`}>
        <span
          className={`font-bold leading-[1.1] line-clamp-2 text-slate-900 px-0.5 ${
            isSideEdge
              ? mainName.length > 16
                ? 'text-[7px] sm:text-[7.5px] lg:text-[8px]'
                : mainName.length > 11
                ? 'text-[7.5px] sm:text-[8px] lg:text-[8.5px]'
                : 'text-[8px] sm:text-[8.5px] lg:text-[9px]'
              : mainName.length > 20
              ? 'text-[8px] sm:text-[9px] lg:text-[10px]'
              : mainName.length > 14
              ? 'text-[8.5px] sm:text-[9.5px] lg:text-[10.5px]'
              : 'text-[9px] sm:text-[10px] lg:text-[11px]'
          }`}
          title={tile.name}
        >
          {mainName}
        </span>
        <TileIcon icon={tile.icon} />
      </div>

      {/* Price / Subtext Bar */}
      <div className={`shrink-0 px-0.5 text-center bg-black/5 border-t border-black/10 ${
        isSideEdge ? 'py-0' : 'py-0.5'
      }`}>
        {tile.type === 'station' ? (
          <span className={`font-bold text-emerald-800 tracking-tight truncate block ${
            isSideEdge ? 'text-[6.5px] sm:text-[7.5px] lg:text-[8px]' : 'text-[7.5px] sm:text-[8.5px] lg:text-[9.5px]'
          }`}>
            {bottomLabel}
          </span>
        ) : tile.type === 'utility' ? (
          <span className={`font-bold text-amber-800 tracking-tight truncate block ${
            isSideEdge ? 'text-[6.5px] sm:text-[7.5px] lg:text-[8px]' : 'text-[7.5px] sm:text-[8.5px] lg:text-[9.5px]'
          }`}>
            {bottomLabel}
          </span>
        ) : tile.price ? (
          <span className={`font-extrabold text-slate-800 tracking-tight ${
            isSideEdge ? 'text-[7px] sm:text-[8px] lg:text-[8.5px]' : 'text-[8px] sm:text-[9px] lg:text-[10px]'
          }`}>
            {tile.price} đ
          </span>
        ) : tile.taxAmount ? (
          <span className={`font-extrabold text-red-600 ${
            isSideEdge ? 'text-[7px] sm:text-[7.5px] lg:text-[8px]' : 'text-[7.5px] sm:text-[8.5px] lg:text-[9px]'
          }`}>
            {tile.taxAmount} đ
          </span>
        ) : (
          <span className={`font-semibold text-slate-600 truncate block ${
            isSideEdge ? 'text-[6.5px] sm:text-[7px] lg:text-[7.5px]' : 'text-[7px] sm:text-[8px] lg:text-[8.5px]'
          }`}>
            {bottomLabel}
          </span>
        )}
      </div>

      {/* Ownership tag */}
      {owner && (
        <div
          className="absolute top-0 right-0 w-2.5 h-2.5 border-l border-b border-black/40 shadow-xs"
          style={{ backgroundColor: owner.color }}
          title={`Chủ: ${owner.name}`}
        />
      )}

      {/* Mortgaged indicator */}
      {isMortgaged && (
        <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center text-white text-[7.5px] font-black uppercase rotate-[-20deg]">
          CẦM CỐ
        </div>
      )}

      {/* Large Avatar sitting OUTSIDE the tile */}
      <TilePlayerBadges
        playersOnTile={playersOnTile}
        edge={edge}
        tileId={tile.id}
        isInvestigatorHere={isInvestigatorHere}
      />
    </div>
  );
};
