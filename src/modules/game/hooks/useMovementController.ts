/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { handleJailRollResolution } from '../utils/jailRollHelper';
import { applyGoTileBonus } from '../utils/goBonusHelper';

interface MovementContext {
  activePlayer: Player | null;
  canRoll: boolean;
  isRolling: boolean;
  isMovingStepByStep: boolean;
  pendingDiceBoost: number;
  consecutiveDoubles: number;
  currentRound: number;
  settings: any;
  cheatNextDice?: [number, number] | null;
  setCheatNextDice?: (d: [number, number] | null) => void;
  moveTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  remainingStepsRef: React.MutableRefObject<number>;
  movingPlayerIdRef: React.MutableRefObject<number | null>;
  setDice: (d: [number, number]) => void;
  setIsRolling: (v: boolean) => void;
  setCanRoll: (v: boolean) => void;
  setPendingDiceBoost: (v: number) => void;
  setConsecutiveDoubles: (v: number) => void;
  setHasPendingExtraRoll?: (v: boolean) => void;
  setIsMovingStepByStep: (v: boolean) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string) => void;
  resolveTileLanding: (pId: number, pos: number, steps: number) => void;
  handleBankrupt: (p: Player) => void;
}

export const useMovementController = (ctx: MovementContext) => {
  const movePlayerSteps = useCallback(
    (playerId: number, stepsRemaining: number) => {
      ctx.remainingStepsRef.current = stepsRemaining;
      ctx.movingPlayerIdRef.current = playerId;
      ctx.setIsMovingStepByStep(true);

      const speedMap = { slow: 400, normal: 240, fast: 120 };
      const stepInterval = speedMap[ctx.settings.moveSpeed as 'slow' | 'normal' | 'fast'] || 240;

      const takeStep = () => {
        if (ctx.remainingStepsRef.current <= 0) {
          ctx.setIsMovingStepByStep(false);
          ctx.movingPlayerIdRef.current = null;
          ctx.setPlayers(prev => {
            const currentP = prev.find(p => p.id === playerId);
            if (currentP) {
              setTimeout(() => {
                ctx.resolveTileLanding(playerId, currentP.position, 0);
              }, 100);
            }
            return prev;
          });
          return;
        }

        ctx.remainingStepsRef.current -= 1;
        const isFinalStep = ctx.remainingStepsRef.current === 0;

        ctx.setPlayers(prev => {
          return prev.map(p => {
            if (p.id !== playerId) return p;
            const oldPos = p.position;
            const newPos = (oldPos + 1) % 40;
            sounds.step();

            if (newPos === 0) {
              applyGoTileBonus({
                player: p,
                isExact: isFinalStep,
                settings: ctx.settings,
                triggerCashTransfer: ctx.triggerCashTransfer,
                addLog: ctx.addLog,
              });
            }

            return { ...p, position: newPos };
          });
        });

        ctx.moveTimerRef.current = setTimeout(takeStep, stepInterval);
      };

      ctx.moveTimerRef.current = setTimeout(takeStep, stepInterval);
    },
    [ctx]
  );

  const skipMovement = useCallback(() => {
    if (!ctx.isMovingStepByStep || ctx.remainingStepsRef.current <= 0) return;
    if (ctx.moveTimerRef.current) clearTimeout(ctx.moveTimerRef.current);

    const stepsToJump = ctx.remainingStepsRef.current;
    const pId = ctx.movingPlayerIdRef.current;
    if (!pId) return;

    ctx.remainingStepsRef.current = 0;
    ctx.setIsMovingStepByStep(false);
    ctx.movingPlayerIdRef.current = null;

    ctx.setPlayers(prev => {
      const next = prev.map(p => {
        if (p.id !== pId) return p;
        const oldPos = p.position;
        const newPos = (oldPos + stepsToJump) % 40;
        const passedGo = oldPos + stepsToJump >= 40;

        if (newPos === 0) {
          applyGoTileBonus({
            player: p,
            isExact: true,
            settings: ctx.settings,
            triggerCashTransfer: ctx.triggerCashTransfer,
            addLog: ctx.addLog,
          });
        } else if (passedGo) {
          applyGoTileBonus({
            player: p,
            isExact: false,
            settings: ctx.settings,
            triggerCashTransfer: ctx.triggerCashTransfer,
            addLog: ctx.addLog,
          });
        }
        return { ...p, position: newPos };
      });

      const movedPlayer = next.find(p => p.id === pId);
      const newPos = movedPlayer ? movedPlayer.position : 0;
      setTimeout(() => {
        ctx.resolveTileLanding(pId, newPos, 0);
      }, 100);

      return next;
    });
  }, [ctx]);

  const rollDice = useCallback(() => {
    if (
      !ctx.activePlayer ||
      !ctx.canRoll ||
      ctx.isRolling ||
      ctx.isMovingStepByStep ||
      ctx.activePlayer.bankrupt
    )
      return;

    ctx.setIsRolling(true);
    ctx.setCanRoll(false);

    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;

    if (ctx.cheatNextDice) {
      d1 = ctx.cheatNextDice[0];
      d2 = ctx.cheatNextDice[1];
      ctx.addLog(`🛠️ [Cheat Test] Áp dụng xúc xắc chỉ định: [${d1}][${d2}]`, 'ability');
      if (ctx.setCheatNextDice) {
        ctx.setCheatNextDice(null);
      }
    }

    const isDouble = d1 === d2;
    let total = d1 + d2;

    if (ctx.pendingDiceBoost !== 0) {
      total = Math.max(1, total + ctx.pendingDiceBoost);
      ctx.addLog(
        `⚡ Gia tốc xúc xắc tác dụng: ${ctx.pendingDiceBoost > 0 ? '+' : ''}${
          ctx.pendingDiceBoost
        } bước!`,
        'ability'
      );
      ctx.setPendingDiceBoost(0);
    }

    ctx.setDice([d1, d2]);
    ctx.activePlayer.lastDiceRoll = [d1, d2];

    setTimeout(() => {
      const player = ctx.activePlayer;
      if (!player) return;

      ctx.setIsRolling(false);
      ctx.addLog(
        `🎲 ${player.name} tung được [${d1}][${d2}] (Tổng: ${total})${
          isDouble ? ' - LƯỢT ĐÔI!' : ''
        }`
      );

      if (player.inJail) {
        handleJailRollResolution({
          player,
          isDouble,
          d1,
          d2,
          total,
          settings: ctx.settings,
          currentRound: ctx.currentRound,
          addLog: ctx.addLog,
          triggerCashTransfer: ctx.triggerCashTransfer,
          handleBankrupt: ctx.handleBankrupt,
          movePlayerSteps,
        });
        return;
      }

      if (isDouble) {
        const nextDoubles = ctx.consecutiveDoubles + 1;
        ctx.setConsecutiveDoubles(nextDoubles);
        if (nextDoubles >= 3) {
          ctx.setConsecutiveDoubles(0);
          ctx.setHasPendingExtraRoll?.(false);
          if ((player.getOutOfJailCards || 0) > 0) {
            player.getOutOfJailCards = (player.getOutOfJailCards || 0) - 1;
            player.position = 10;
            player.inJail = false;
            player.jailTurns = 0;
            sounds.ability();
            ctx.addLog(
              `🕊️ [Thẻ Ra Tù Miễn Phí] ${player.name} tung 3 lần đôi liên tiếp nhưng Thẻ Ra Tù Miễn Phí đã tự động kích hoạt bảo vệ!`,
              'ability'
            );
            return;
          }
          sounds.jail();
          player.position = 10;
          player.inJail = true;
          player.jailTurns = 0;
          const isInv = ctx.settings.jailMode === 'investigation';
          ctx.addLog(
            isInv
              ? `🚨 ${player.name} tung đôi 3 lần liên tiếp: Đang bị công an điều tra vì buôn bán nhà ở trái phép!`
              : `🚨 ${player.name} tung đôi 3 lần liên tiếp: Bị bắt vào tù!`,
            'jail'
          );
          ctx.triggerCharacterEvent(
            player.id,
            'investigation_jailed',
            'sad',
            isInv ? 'Bị Công An Điều Tra' : 'Bị Bắt Vào Tù',
            isInv
              ? `${player.name} tung đôi 3 lần liên tiếp và đang bị công an điều tra vì buôn bán nhà ở trái phép!`
              : `${player.name} tung đôi 3 lần liên tiếp: Bị bắt vào tù!`
          );
          return;
        } else {
          ctx.setHasPendingExtraRoll?.(true);
          ctx.addLog(
            `🎲✨ [Xúc Xắc Đôi] ${player.name} tung được cặp số đôi [${d1}][${d2}], được quyền tung tiếp thêm 1 lượt sau khi hoàn tất di chuyển!`,
            'ability'
          );
        }
      } else {
        ctx.setConsecutiveDoubles(0);
        ctx.setHasPendingExtraRoll?.(false);
      }

      movePlayerSteps(player.id, total);
    }, 450);
  }, [ctx, movePlayerSteps]);

  return {
    movePlayerSteps,
    skipMovement,
    rollDice,
  };
};
