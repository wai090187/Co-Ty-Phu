import React from 'react';
import { Tile, Player } from '../../types/game';
import { TileItem } from './TileItem';

interface Props {
  tiles: Tile[];
  players: Player[];
  activePlayer: Player;
  onSelectTile: (tile: Tile) => void;
}

export const BoardView: React.FC<Props> = ({
  tiles,
  players,
  activePlayer,
  onSelectTile,
}) => {
  // Map tile id to grid row and column (1-indexed for CSS Grid)
  const getGridPosition = (id: number): { gridRow: number; gridColumn: number } => {
    if (id === 0) return { gridRow: 11, gridColumn: 11 };
    if (id >= 1 && id <= 9) return { gridRow: 11, gridColumn: 11 - id };
    if (id === 10) return { gridRow: 11, gridColumn: 1 };
    if (id >= 11 && id <= 19) return { gridRow: 11 - (id - 10), gridColumn: 1 };
    if (id === 20) return { gridRow: 1, gridColumn: 1 };
    if (id >= 21 && id <= 29) return { gridRow: 1, gridColumn: 1 + (id - 20) };
    if (id === 30) return { gridRow: 1, gridColumn: 11 };
    if (id >= 31 && id <= 39) return { gridRow: 1 + (id - 30), gridColumn: 11 };
    return { gridRow: 1, gridColumn: 1 };
  };

  return (
    <div className="relative w-full max-w-[850px] aspect-square mx-auto p-8 sm:p-10 select-none overflow-visible">
      {/* Outer Board Box */}
      <div className="relative w-full h-full bg-[#ECE8DF] border-4 border-black rounded-lg shadow-2xl p-1.5 overflow-visible">
        {/* 11x11 Grid Board */}
        <div
          className="w-full h-full grid overflow-visible"
          style={{
            gridTemplateColumns: '13% repeat(9, calc(74% / 9)) 13%',
            gridTemplateRows: '13% repeat(9, calc(74% / 9)) 13%',
          }}
        >
          {/* Render 40 tiles */}
          {tiles.map(tile => {
            const pos = getGridPosition(tile.id);
            const playersHere = players.filter(p => !p.bankrupt && p.position === tile.id);
            const owner = players.find(p => p.propertiesOwned.includes(tile.id));
            const housesCount = owner?.houses[tile.id] || 0;
            const isMortgaged = owner?.mortgaged[tile.id] || false;
            const isCurrent = activePlayer.position === tile.id;

            return (
              <div
                key={tile.id}
                style={{
                  gridRow: pos.gridRow,
                  gridColumn: pos.gridColumn,
                }}
                className="w-full h-full overflow-visible"
              >
                <TileItem
                  tile={tile}
                  playersOnTile={playersHere}
                  owner={owner}
                  housesCount={housesCount}
                  isMortgaged={isMortgaged}
                  isCurrentTile={isCurrent}
                  onClick={() => onSelectTile(tile)}
                />
              </div>
            );
          })}

          {/* Center Area: (rows 2 to 10, cols 2 to 10) */}
          <div
            style={{
              gridRow: '2 / 11',
              gridColumn: '2 / 11',
            }}
            className="relative w-full h-full bg-[#FAF8F5] border border-black flex flex-col items-center justify-center overflow-hidden pointer-events-none"
          >
            {/* Subtle vintage texture background */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d1c7b7_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Diagonal retro title "CỜ TỶ PHÚ" across center */}
            <div className="absolute transform -rotate-45 pointer-events-none select-none text-center z-10">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-widest drop-shadow-[2px_2px_0px_rgba(255,255,255,0.9)] uppercase">
                CỜ TỶ PHÚ
              </h1>
              <div className="text-[10px] sm:text-xs font-extrabold text-amber-800 tracking-[0.3em] uppercase mt-1">
                Bản Sài Gòn Xưa
              </div>
            </div>

            {/* Top-Left Card Slot: CƠ HỘI (Pink Diamond) - Visual slot only, no accidental clicking */}
            <div
              className="absolute top-[18%] left-[22%] -translate-x-1/2 -translate-y-1/2 rotate-45 w-20 h-28 sm:w-26 sm:h-34 bg-[#FCE7F3] border-2 border-rose-600 rounded-md shadow-md flex flex-col items-center justify-between p-2 pointer-events-none z-10"
            >
              <span className="text-[10px] font-black tracking-wider text-rose-800 uppercase text-center -rotate-45 block mt-2">
                CƠ HỘI
              </span>
              <div className="w-10 h-10 rounded-full bg-rose-200 border border-rose-400 flex items-center justify-center my-auto -rotate-45 shadow-inner">
                <span className="font-display text-xl font-black text-rose-600">?</span>
              </div>
              <span className="text-[7.5px] font-bold text-rose-700 -rotate-45 mb-1">Khay Thẻ</span>
            </div>

            {/* Bottom-Right Card Slot: KHÍ VẬN (Yellow Diamond) - Visual slot only */}
            <div
              className="absolute bottom-[18%] right-[22%] translate-x-1/2 translate-y-1/2 rotate-45 w-20 h-28 sm:w-26 sm:h-34 bg-[#FEF9C3] border-2 border-amber-600 rounded-md shadow-md flex flex-col items-center justify-between p-2 pointer-events-none z-10"
            >
              <span className="text-[10px] font-black tracking-wider text-amber-900 uppercase text-center -rotate-45 block mt-2">
                KHÍ VẬN
              </span>
              <div className="w-10 h-10 rounded-full bg-amber-200 border border-amber-400 flex items-center justify-center my-auto -rotate-45 shadow-inner">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-700">
                  <rect x="2" y="7" width="20" height="13" rx="2" fill="#D97706" />
                  <path d="M2 10 Q12 5 22 10 Z" fill="#F59E0B" />
                  <circle cx="12" cy="13" r="2" fill="#FEF08A" />
                </svg>
              </div>
              <span className="text-[7.5px] font-bold text-amber-800 -rotate-45 mb-1">Khay Thẻ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
