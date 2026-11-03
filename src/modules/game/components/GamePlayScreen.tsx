/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ConsumableAbility,
  LogEntry,
  PermanentAbility,
  Player,
  Tile,
  GameSettings,
} from '../../../types/game';
import { PlayerCard } from '../../../components/HUD/PlayerCard';
import { BoardView } from '../../../components/Board/BoardView';
import { GameLog } from '../../../components/HUD/GameLog';
import { GameDrawer } from '../../../components/Common/GameDrawer';

interface Props {
  players: Player[];
  activePlayer: Player;
  turnIndex: number;
  tiles: Tile[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  dice: [number, number];
  canRoll: boolean;
  isRolling: boolean;
  isMovingStepByStep: boolean;
  logs: LogEntry[];
  onOpenInventory: (playerId: number) => void;
  onPayBail: () => void;
  canPlayerPayBail: (player: Player) => { canPay: boolean; cost: number; reason?: string };
  onSelectTile: (tile: Tile) => void;
  onRollDice: () => void;
  onSkipMovement: () => void;
  onEndTurn: () => void;
  onOpenCheat?: () => void;
  hasActiveCheat?: boolean;
  settings?: GameSettings;
  onUseGetOutOfJailCard?: () => void;
}

export const GamePlayScreen: React.FC<Props> = ({
  players,
  activePlayer,
  turnIndex,
  tiles,
  consumableShop,
  permanentShop,
  dice,
  canRoll,
  isRolling,
  isMovingStepByStep,
  logs,
  onOpenInventory,
  onPayBail,
  canPlayerPayBail,
  onSelectTile,
  onRollDice,
  onSkipMovement,
  onEndTurn,
  onOpenCheat,
  hasActiveCheat = false,
  settings,
  onUseGetOutOfJailCard,
}) => {
  const [isPlayersDrawerOpen, setIsPlayersDrawerOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  const showDockedSides = Boolean(settings?.alwaysShowSidePanels);

  return (
    <main className="flex-1 w-full flex items-center justify-center xl:justify-center gap-2.5 p-1 sm:p-2 overflow-hidden select-none relative">
      {/* Optional Docked Left Panel: Players HUD */}
      {showDockedSides && (
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 max-h-[calc(100vh-60px)] shrink-0 overflow-y-auto pr-0.5 animate-in fade-in duration-200">
          <div className="p-2.5 bg-slate-900/95 border border-slate-800 rounded-2xl flex flex-col gap-2 shadow-lg text-white">
            <span className="font-display font-black text-xs text-amber-400 uppercase tracking-wider px-1">
              Bảng Người Chơi ({players.length})
            </span>
            <div className="flex flex-col gap-2">
              {players.map((p, idx) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isCurrentTurn={idx === turnIndex}
                  onOpenInventory={() => onOpenInventory(p.id)}
                  onPayBail={onPayBail}
                  bailInfo={canPlayerPayBail(p)}
                  allTiles={tiles}
                  allConsumables={consumableShop}
                  allPermanents={permanentShop}
                />
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Central Viewport-Maximized Board */}
      <section className="flex items-center justify-center min-w-0 shrink-0">
        <BoardView
          tiles={tiles}
          players={players}
          activePlayer={activePlayer}
          onSelectTile={onSelectTile}
          dice={dice}
          canRoll={canRoll}
          isRolling={isRolling}
          isMovingStepByStep={isMovingStepByStep}
          onRollDice={onRollDice}
          onSkipMovement={onSkipMovement}
          onEndTurn={onEndTurn}
          onOpenInventory={onOpenInventory}
          onTogglePlayersDrawer={() => setIsPlayersDrawerOpen(prev => !prev)}
          onToggleLogDrawer={() => setIsLogDrawerOpen(prev => !prev)}
          onOpenCheat={onOpenCheat}
          hasActiveCheat={hasActiveCheat}
          dramaticDiceRoll={settings?.dramaticDiceRoll ?? true}
          onUseGetOutOfJailCard={onUseGetOutOfJailCard}
          onPayBail={onPayBail}
          bailInfo={canPlayerPayBail(activePlayer)}
        />
      </section>

      {/* Optional Docked Right Panel: Game Live Log */}
      {showDockedSides && (
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 max-h-[calc(100vh-60px)] shrink-0 animate-in fade-in duration-200">
          <GameLog logs={logs} />
        </aside>
      )}

      {/* Slide-out Drawer: Players List (for mobile/tablet or when docked sides is off) */}
      <GameDrawer
        isOpen={isPlayersDrawerOpen}
        onClose={() => setIsPlayersDrawerOpen(false)}
        position="left"
        title={`Bảng Người Chơi (${players.length})`}
        icon="👥"
        widthClass="w-80 sm:w-96"
      >
        <div className="flex flex-col gap-2">
          {players.map((p, idx) => (
            <PlayerCard
              key={p.id}
              player={p}
              isCurrentTurn={idx === turnIndex}
              onOpenInventory={() => onOpenInventory(p.id)}
              onPayBail={onPayBail}
              bailInfo={canPlayerPayBail(p)}
              allTiles={tiles}
              allConsumables={consumableShop}
              allPermanents={permanentShop}
            />
          ))}
        </div>
      </GameDrawer>

      {/* Slide-out Drawer: Game Live Logs (for mobile/tablet or when docked sides is off) */}
      <GameDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        position="right"
        title="Nhật Ký Trận Đấu"
        icon="📜"
        widthClass="w-80 sm:w-96"
      >
        <GameLog logs={logs} />
      </GameDrawer>
    </main>
  );
};
