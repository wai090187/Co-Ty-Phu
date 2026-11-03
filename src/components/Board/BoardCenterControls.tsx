/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../../types/game';
import { DiceRoller } from '../Controls/DiceRoller';

interface Props {
  activePlayer: Player;
  dice: [number, number];
  canRoll: boolean;
  isRolling: boolean;
  isMovingStepByStep: boolean;
  onRollDice: () => void;
  onSkipMovement: () => void;
  onEndTurn: () => void;
  onOpenInventory: (playerId: number) => void;
  onTogglePlayersDrawer: () => void;
  onToggleLogDrawer: () => void;
  onOpenCheat?: () => void;
  hasActiveCheat?: boolean;
  playersCount: number;
  dramaticDiceRoll?: boolean;
  onUseGetOutOfJailCard?: () => void;
  onPayBail?: () => void;
  bailInfo?: { canPay: boolean; cost: number; reason?: string };
}

export const BoardCenterControls: React.FC<Props> = ({
  activePlayer,
  dice,
  canRoll,
  isRolling,
  isMovingStepByStep,
  onRollDice,
  onSkipMovement,
  onEndTurn,
  onOpenInventory,
  onTogglePlayersDrawer,
  onToggleLogDrawer,
  onOpenCheat,
  hasActiveCheat = false,
  playersCount,
  dramaticDiceRoll = true,
  onUseGetOutOfJailCard,
  onPayBail,
  bailInfo,
}) => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-2 sm:p-3.5">
      {/* Top Corner Utility Buttons */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <button
          onClick={onTogglePlayersDrawer}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md border border-amber-500/40 transition-all hover:scale-105 active:scale-95"
          title="Mở danh sách người chơi"
        >
          <span>👥</span>
          <span className="font-mono text-amber-300">{playersCount}</span>
          <span className="hidden sm:inline">Người Chơi</span>
        </button>

        <button
          onClick={onToggleLogDrawer}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md border border-amber-500/40 transition-all hover:scale-105 active:scale-95"
          title="Mở nhật ký trận đấu"
        >
          <span>📜</span>
          <span className="hidden sm:inline">Nhật Ký</span>
        </button>
      </div>

      {/* Main Center Control Pod */}
      <div className="my-auto mx-auto pointer-events-auto max-w-[270px] sm:max-w-[310px] w-full bg-white/95 backdrop-blur-md border-2 border-amber-900/30 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col items-center gap-2">
        {/* Turn Indicator */}
        <div className="text-center w-full pb-1 border-b border-slate-200/80">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
              style={{ backgroundColor: activePlayer?.color || '#3B82F6' }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Lượt Đi
            </span>
          </div>
          <div className="font-display text-sm sm:text-base font-black text-slate-900 uppercase truncate">
            {activePlayer?.name}
          </div>
          {activePlayer?.isAI && (
            <span className="text-[10px] text-amber-700 font-bold block -mt-0.5 animate-pulse">
              (Máy tính đang suy nghĩ...)
            </span>
          )}
        </div>

        {/* Dice Roller */}
        <DiceRoller
          dice={dice}
          onRoll={onRollDice}
          disabled={!canRoll || isMovingStepByStep || activePlayer?.isAI || activePlayer?.bankrupt}
          isRolling={isRolling}
          dramaticRoll={dramaticDiceRoll}
        />

        {/* Fast Forward button */}
        {isMovingStepByStep && (
          <button
            onClick={onSkipMovement}
            className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors animate-pulse"
          >
            Bỏ Qua Di Chuyển ⏩
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-1.5 pt-1 border-t border-slate-200/60">
          {/* In Jail / Under Investigation status banner & quick actions */}
          {activePlayer.inJail && !activePlayer.bankrupt && (
            <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-center flex flex-col gap-1">
              <span className="text-[10.5px] font-bold">
                {bailInfo?.reason?.includes('điều tra')
                  ? `🚨 Đang Bị Điều Tra (${activePlayer.jailTurns}/3)`
                  : `🔒 Đang Ở Tù (${activePlayer.jailTurns}/3)`}
              </span>

              {/* Free Jail Card button */}
              {activePlayer.getOutOfJailCards > 0 && !activePlayer.isAI && onUseGetOutOfJailCard && (
                <button
                  onClick={onUseGetOutOfJailCard}
                  className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow flex items-center justify-center gap-1 transition-colors"
                >
                  <span>🕊️</span>
                  <span>Dùng Thẻ Ra Tù ({activePlayer.getOutOfJailCards})</span>
                </button>
              )}

              {/* Bail button (only available if allowed in prison mode) */}
              {bailInfo?.canPay && !activePlayer.isAI && onPayBail && (
                <button
                  onClick={onPayBail}
                  className="w-full py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow flex items-center justify-center gap-1 transition-colors"
                >
                  <span>🏛️</span>
                  <span>Bảo Lãnh Ra Tù ({bailInfo.cost}đ)</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => onOpenInventory(activePlayer.id)}
            className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300/60"
          >
            <span>⚡</span>
            <span>Túi Đồ</span>
            <kbd className="px-1.5 py-0.2 text-[9px] bg-slate-200 text-slate-600 rounded border border-slate-300 font-mono">
              Ctrl
            </kbd>
          </button>

          {!canRoll && !isMovingStepByStep && !activePlayer?.isAI && (
            <button
              onClick={onEndTurn}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Xong Lượt</span>
              <kbd className="px-1.5 py-0.2 text-[9px] bg-white/20 text-white rounded border border-white/30 font-mono">
                Space
              </kbd>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Cheat Button in the Inner Corner */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {onOpenCheat ? (
          <button
            onClick={onOpenCheat}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all shadow-md border ${
              hasActiveCheat
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-900 text-rose-300 border-rose-500/40 hover:scale-105 active:scale-95'
            }`}
            title="Mở Bảng Cheat & Kiểm Thử"
          >
            <span>🛠️</span>
            <span>Cheat</span>
            {hasActiveCheat && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
          </button>
        ) : (
          <div />
        )}

        <div className="text-[10px] text-slate-500 font-bold bg-white/70 px-2 py-0.5 rounded-md border border-slate-300/40 select-none">
          Phím Space: Tung Xúc Xắc / Xong Lượt
        </div>
      </div>
    </div>
  );
};
