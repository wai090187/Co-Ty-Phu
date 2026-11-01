import React from 'react';
import {
  ConsumableAbility,
  LogEntry,
  PermanentAbility,
  Player,
  Tile,
} from '../../../types/game';
import { PlayerCard } from '../../../components/HUD/PlayerCard';
import { BoardView } from '../../../components/Board/BoardView';
import { DiceRoller } from '../../../components/Controls/DiceRoller';
import { GameLog } from '../../../components/HUD/GameLog';

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
}) => {
  return (
    <main className="flex-1 p-2 sm:p-3 flex flex-col lg:flex-row gap-2.5 sm:gap-3 max-w-[1680px] mx-auto w-full items-start justify-center">
      {/* Left Column: Player Cards HUD */}
      <section className="w-full lg:w-56 xl:w-60 flex flex-col gap-2 shrink-0">
        <span className="font-display font-black text-xs text-slate-700 uppercase tracking-wider px-1">
          Bảng Người Chơi ({players.length})
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
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
      </section>

      {/* Center Column: The 40-Tile Board */}
      <section className="flex-1 w-full flex flex-col items-center min-w-0">
        <BoardView
          tiles={tiles}
          players={players}
          activePlayer={activePlayer}
          onSelectTile={onSelectTile}
        />
      </section>

      {/* Right Column: Controls & Game Log */}
      <section className="w-full lg:w-64 xl:w-72 flex flex-col gap-3 shrink-0">
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-3">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              Lượt Hiện Tại
            </span>
            <span className="font-display text-lg font-black text-slate-900 uppercase">
              {activePlayer?.name}
            </span>
            {activePlayer?.isAI && (
              <span className="text-[10px] text-amber-700 font-bold block">
                (Máy tính đang suy nghĩ...)
              </span>
            )}
          </div>

          {/* Dice Roller */}
          <DiceRoller
            dice={dice}
            onRoll={onRollDice}
            disabled={
              !canRoll || isMovingStepByStep || activePlayer?.isAI || activePlayer?.bankrupt
            }
            isRolling={isRolling}
          />

          {/* Fast Forward / Skip Movement */}
          {isMovingStepByStep && (
            <button
              onClick={onSkipMovement}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors animate-pulse"
            >
              Bỏ Qua Di Chuyển ⏩
            </button>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onOpenInventory(activePlayer.id)}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>⚡</span>
              <span>Túi Đồ & Kích Hoạt Năng Lực</span>
            </button>

            {!canRoll && !isMovingStepByStep && !activePlayer?.isAI && (
              <button
                onClick={onEndTurn}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition-colors"
              >
                Kết Thúc Lượt Của Bạn
              </button>
            )}
          </div>
        </div>

        {/* Game Live Action Log */}
        <GameLog logs={logs} />
      </section>
    </main>
  );
};
