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
  SpecialInvestigatorState,
} from '../../../types/game';
import { ALL_INVESTIGATOR_ABILITIES } from '../../../data/investigatorAbilities';
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
  currentRound?: number;
  settings?: GameSettings;
  onUseGetOutOfJailCard?: () => void;
  investigator?: SpecialInvestigatorState;
}

export const GamePlayScreen: React.FC<Props> = ({
  players,
  activePlayer,
  turnIndex,
  currentRound,
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
  investigator,
}) => {
  const [isPlayersDrawerOpen, setIsPlayersDrawerOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  const exportContext = {
    currentRound,
    players,
    activePlayer,
    investigator,
    settings,
  };

  const showDockedSides = Boolean(settings?.alwaysShowSidePanels);

  const invAbility = investigator?.currentAbilityId
    ? ALL_INVESTIGATOR_ABILITIES.find(a => a.id === investigator.currentAbilityId)
    : null;

  const renderInvestigatorCard = () => {
    if (!investigator?.active) return null;
    return (
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 border-2 border-amber-400 text-white shadow-xl flex flex-col gap-1.5 animate-in fade-in">
        <div className="flex items-center justify-between pb-1 border-b border-amber-400/30">
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
            <span className="text-base">🕵️‍♂️</span>
            <span>ĐIỀU TRA VIÊN</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1 py-0.2 rounded border border-amber-400/30 font-medium">
              ↺ Ngược chiều
            </span>
          </div>
          <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold border border-amber-400/40">
            Vòng {investigator.lapsCompleted}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 flex items-center justify-between">
          <span>Vị trí:</span>
          <b className="text-amber-200">
            [{tiles[investigator.position]?.name || `Ô ${investigator.position}`}]
          </b>
        </div>
        <div className="text-[10px] bg-black/40 p-1.5 rounded-lg border border-amber-400/20">
          <div className="font-bold text-amber-300 flex items-center gap-1">
            <span>⚡</span>
            <span>{invAbility?.name || 'Tuần Tra'}</span>
          </div>
          <p className="text-[9.5px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
            {invAbility?.shortDesc || invAbility?.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 w-full flex items-center justify-center xl:justify-center gap-2.5 p-1 sm:p-2 overflow-hidden select-none relative">
      {/* Optional Docked Left Panel: Players HUD */}
      {showDockedSides && (
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 max-h-[calc(100vh-60px)] shrink-0 overflow-y-auto pr-0.5 animate-in fade-in duration-200">
          <div className="p-2.5 bg-slate-900/95 border border-slate-800 rounded-2xl flex flex-col gap-2 shadow-lg text-white">
            <span className="font-display font-black text-xs text-amber-400 uppercase tracking-wider px-1">
              Bảng Người Chơi ({players.length})
            </span>
            {renderInvestigatorCard()}
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
          investigator={investigator}
        />
      </section>

      {/* Optional Docked Right Panel: Game Live Log (Anchored to top to avoid notification overlap) */}
      {showDockedSides && (
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 self-start pt-1.5 max-h-[calc(100vh-70px)] shrink-0 animate-in fade-in duration-200">
          <GameLog logs={logs} exportContext={exportContext} className="h-[320px] xl:h-[360px] shadow-lg" />
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
          {renderInvestigatorCard()}
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
        <GameLog
          logs={logs}
          exportContext={exportContext}
          className="h-full flex-1 border-0 shadow-none rounded-none"
        />
      </GameDrawer>
    </main>
  );
};
