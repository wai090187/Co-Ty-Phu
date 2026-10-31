import React from 'react';
import { Tile, Player } from '../../types/game';
import { CharacterAvatar } from '../Common/CharacterAvatar';

interface Props {
  tile: Tile;
  playersOnTile: Player[];
  owner?: Player;
  housesCount: number; // 0..5 (5 is hotel)
  isMortgaged?: boolean;
  isCurrentTile?: boolean;
  jailMode?: 'prison' | 'investigation';
  onClick?: () => void;
}

export const TileItem: React.FC<Props> = ({
  tile,
  playersOnTile,
  owner,
  housesCount = 0,
  isMortgaged = false,
  isCurrentTile = false,
  jailMode = 'prison',
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

  // Compact SVG icons so they never squeeze out text
  const renderIcon = () => {
    switch (tile.icon) {
      case 'bus-green':
      case 'bus-blue':
      case 'bus-red':
        const busColor =
          tile.icon === 'bus-red' ? '#DC2626' : tile.icon === 'bus-blue' ? '#2563EB' : '#16A34A';
        return (
          <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5 my-0.5 mx-auto shrink-0 drop-shadow-xs">
            <rect x="5" y="8" width="22" height="15" rx="3" fill={busColor} />
            <rect x="7" y="10" width="8" height="5" rx="1" fill="#E2E8F0" />
            <rect x="17" y="10" width="8" height="5" rx="1" fill="#E2E8F0" />
            <circle cx="9" cy="23" r="3" fill="#1E293B" />
            <circle cx="23" cy="23" r="3" fill="#1E293B" />
          </svg>
        );

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

  // Avatar position outside the tile
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
        if (tile.id === 0) return '-bottom-8 -right-8 flex-row';
        if (tile.id === 10) return '-bottom-8 -left-8 flex-row';
        if (tile.id === 20) return '-top-8 -left-8 flex-row';
        if (tile.id === 30) return '-top-8 -right-8 flex-row';
        return '-top-8 left-1/2 -translate-x-1/2 flex-row';
    }
  };

  // Render Corner Tiles
  if (isCorner) {
    return (
      <div
        onClick={onClick}
        className={`relative w-full h-full bg-[#FAF9F6] border border-black flex flex-col items-center justify-between p-1 cursor-pointer select-none transition-all ${
          isCurrentTile ? 'ring-3 ring-amber-400 z-20' : 'hover:bg-amber-50/50'
        }`}
      >
        {tile.cornerType === 'go' && (
          <div className="w-full h-full flex flex-col justify-between items-center text-center p-0.5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-tight text-red-600 block leading-tight">
                Trạm
              </span>
              <span className="text-xs sm:text-sm font-black uppercase text-red-600 tracking-wider block leading-tight">
                Khởi Hành
              </span>
            </div>
            <div className="relative w-10 h-5 overflow-hidden my-auto">
              <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-amber-400 border-r-emerald-500 absolute top-0" />
            </div>
            <div className="text-[7.5px] font-bold text-red-700 bg-red-50 rounded px-1 py-0.2 border border-red-200">
              Đi qua 200đ · Dừng 400đ
            </div>
          </div>
        )}

        {tile.cornerType === 'jail' && (
          <div className="w-full h-full flex flex-col justify-between p-0.5 text-center">
            <span className="text-[8px] font-bold text-slate-700 leading-tight">
              {jailMode === 'investigation' ? 'Khu Đ.Tra' : 'Thăm Tù'}
            </span>
            <div className={`w-8 h-8 mx-auto rounded-xs flex items-center justify-center relative overflow-hidden my-auto border-2 ${
              jailMode === 'investigation' ? 'bg-amber-100 border-amber-800' : 'bg-amber-900/10 border-slate-900'
            }`}>
              {jailMode === 'investigation' ? (
                <span className="text-sm">🔍</span>
              ) : (
                <>
                  <div className="absolute inset-0 flex justify-evenly">
                    <div className="w-[1.5px] h-full bg-slate-900" />
                    <div className="w-[1.5px] h-full bg-slate-900" />
                  </div>
                  <span className="text-[7.5px] font-black text-slate-900 bg-white/90 px-1 rounded z-10">
                    Ở TÙ
                  </span>
                </>
              )}
            </div>
            <span className="text-[7px] font-semibold text-slate-500">Thăm nhận 100đ</span>
          </div>
        )}

        {tile.cornerType === 'parking' && (
          <div className="w-full h-full flex flex-col justify-between items-center text-center p-0.5">
            <span className="text-[10px] font-extrabold text-slate-900 uppercase leading-tight">Sân Bay</span>
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-rose-600 drop-shadow-xs my-auto">
              <path d="M16 3 L19 12 L29 16 L29 19 L19 17 L19 25 L23 28 L23 30 L16 29 L9 30 L9 28 L13 25 L13 17 L3 19 L3 16 L13 12 Z" />
            </svg>
            <span className="text-[7.5px] font-medium text-slate-600">Nghỉ an toàn</span>
          </div>
        )}

        {tile.cornerType === 'gotojail' && (
          <div className="w-full h-full flex flex-col justify-between items-center text-center p-0.5">
            <span className="text-[10px] font-extrabold text-red-700 uppercase leading-tight">
              {jailMode === 'investigation' ? 'Khởi Tố' : 'Vào Tù'}
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center text-white my-auto shadow-inner border border-blue-950">
              {jailMode === 'investigation' ? (
                <span className="text-xs">🚨</span>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-amber-300">
                  <path d="M12 2 L4 5 L4 11 C4 16.55 7.42 21.74 12 23 C16.58 21.74 20 16.55 20 11 L20 5 L12 2 Z" />
                </svg>
              )}
            </div>
            <span className="text-[7px] font-semibold text-red-600 leading-tight">
              {jailMode === 'investigation' ? 'Bị điều tra' : 'Bị bắt'}
            </span>
          </div>
        )}

        {/* Outer Large Avatar Display for Corner */}
        {playersOnTile.length > 0 && (
          <div
            className={`absolute ${getAvatarPositionClass()} flex items-center justify-center -space-x-2 pointer-events-none z-40 animate-bounce`}
          >
            {playersOnTile.map(p => (
              <div
                key={p.id}
                className="relative rounded-full ring-3 ring-white shadow-xl bg-white"
                style={{ borderColor: p.color }}
              >
                <CharacterAvatar
                  characterId={p.characterId}
                  isAI={p.isAI}
                  aiNumber={p.id}
                  aiLevel={p.aiLevel}
                  size="sm"
                  className="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center border border-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Regular Tiles (No text cutoff!)
  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full bg-[#FAF9F6] border border-black flex flex-col justify-between cursor-pointer select-none overflow-visible transition-all ${
        isCurrentTile ? 'ring-3 ring-amber-400 z-20 shadow-md bg-amber-50/70' : 'hover:bg-amber-50/50'
      }`}
    >
      {/* Property Color Bar facing center */}
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
          {/* Houses / Hotel pips */}
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

      {/* Main Content Area: Street Name + Icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-0.5 py-0.5 text-center min-h-0 overflow-hidden">
        <span
          className={`font-bold leading-tight line-clamp-2 text-slate-900 px-0.5 ${
            tile.name.length > 18 ? 'text-[8px] sm:text-[8.5px]' : 'text-[8.5px] sm:text-[9.5px]'
          }`}
          title={tile.name}
        >
          {tile.name}
        </span>
        {renderIcon()}
      </div>

      {/* Price / Subtext Bar */}
      <div className="shrink-0 px-0.5 py-0.2 text-center bg-black/5 border-t border-black/10">
        {tile.price ? (
          <span className="text-[8px] sm:text-[9px] font-extrabold text-slate-800 tracking-tight">
            {tile.price} đ
          </span>
        ) : tile.taxAmount ? (
          <span className="text-[7.5px] sm:text-[8.5px] font-extrabold text-red-600">
            {tile.taxAmount} đ
          </span>
        ) : (
          <span className="text-[7px] sm:text-[7.5px] font-semibold text-slate-600 truncate block">
            {tile.type === 'station'
              ? 'Kỹ Năng'
              : tile.type === 'utility'
              ? 'Vĩnh Viễn'
              : tile.subText || ''}
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
      {playersOnTile.length > 0 && (
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
      )}
    </div>
  );
};
