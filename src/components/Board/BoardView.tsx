import React from 'react';
import { Tile, Player } from '../../types/game';
import { TileItem } from './TileItem';
import { BoardCenterControls } from './BoardCenterControls';

interface Props {
  tiles: Tile[];
  players: Player[];
  activePlayer: Player;
  onSelectTile: (tile: Tile) => void;
  dice?: [number, number];
  canRoll?: boolean;
  isRolling?: boolean;
  isMovingStepByStep?: boolean;
  onRollDice?: () => void;
  onSkipMovement?: () => void;
  onEndTurn?: () => void;
  onOpenInventory?: (playerId: number) => void;
  onTogglePlayersDrawer?: () => void;
  onToggleLogDrawer?: () => void;
  onOpenCheat?: () => void;
  hasActiveCheat?: boolean;
  dramaticDiceRoll?: boolean;
}

export const BoardView: React.FC<Props> = ({
  tiles,
  players,
  activePlayer,
  onSelectTile,
  dice = [1, 1],
  canRoll = false,
  isRolling = false,
  isMovingStepByStep = false,
  onRollDice,
  onSkipMovement,
  onEndTurn,
  onOpenInventory,
  onTogglePlayersDrawer,
  onToggleLogDrawer,
  onOpenCheat,
  hasActiveCheat = false,
  dramaticDiceRoll = true,
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
    <div className="relative w-full max-w-[min(98vw,calc(100vh-54px))] aspect-square mx-auto p-1 sm:p-2 select-none overflow-visible">
      {/* Outer Board Box */}
      <div className="relative w-full h-full bg-[#ECE8DF] border-4 border-black rounded-lg shadow-2xl p-1 sm:p-1.5 overflow-visible">
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
            className="relative w-full h-full bg-[#FAF8F5] border border-black flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
          >
            {/* Subtle vintage texture background */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d1c7b7_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Diagonal retro title "CỜ TỶ PHÚ" across center */}
            <div className="absolute transform -rotate-45 pointer-events-none select-none text-center z-0 opacity-20 sm:opacity-30">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-widest drop-shadow-[2px_2px_0px_rgba(255,255,255,0.9)] uppercase">
                CỜ TỶ PHÚ
              </h1>
              <div className="text-xs sm:text-sm font-extrabold text-amber-800 tracking-[0.3em] uppercase mt-1">
                Bản Sài Gòn Xưa
              </div>
            </div>

            {/* Top-Left Card Slot: CƠ HỘI */}
            <div className="absolute top-[18%] left-[22%] -translate-x-1/2 -translate-y-1/2 rotate-45 w-16 h-22 sm:w-22 sm:h-30 bg-[#FCE7F3]/70 border-2 border-rose-600/60 rounded-md shadow-xs flex flex-col items-center justify-between p-1.5 pointer-events-none z-0">
              <span className="text-[9px] font-black tracking-wider text-rose-800 uppercase text-center -rotate-45 block mt-1">
                CƠ HỘI
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-200/80 border border-rose-400 flex items-center justify-center my-auto -rotate-45">
                <span className="font-display text-base font-black text-rose-600">?</span>
              </div>
            </div>

            {/* Bottom-Right Card Slot: KHÍ VẬN */}
            <div className="absolute bottom-[18%] right-[22%] translate-x-1/2 translate-y-1/2 rotate-45 w-16 h-22 sm:w-22 sm:h-30 bg-[#FEF9C3]/70 border-2 border-amber-600/60 rounded-md shadow-xs flex flex-col items-center justify-between p-1.5 pointer-events-none z-0">
              <span className="text-[9px] font-black tracking-wider text-amber-900 uppercase text-center -rotate-45 block mt-1">
                KHÍ VẬN
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-200/80 border border-amber-400 flex items-center justify-center my-auto -rotate-45">
                <span className="font-display text-base font-black text-amber-700">★</span>
              </div>
            </div>

            {/* Central Interactive Control Pod */}
            {onRollDice && (
              <BoardCenterControls
                activePlayer={activePlayer}
                dice={dice}
                canRoll={canRoll}
                isRolling={isRolling}
                isMovingStepByStep={isMovingStepByStep}
                onRollDice={onRollDice}
                onSkipMovement={onSkipMovement || (() => {})}
                onEndTurn={onEndTurn || (() => {})}
                onOpenInventory={onOpenInventory || (() => {})}
                onTogglePlayersDrawer={onTogglePlayersDrawer || (() => {})}
                onToggleLogDrawer={onToggleLogDrawer || (() => {})}
                onOpenCheat={onOpenCheat}
                hasActiveCheat={hasActiveCheat}
                playersCount={players.length}
                dramaticDiceRoll={dramaticDiceRoll}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
