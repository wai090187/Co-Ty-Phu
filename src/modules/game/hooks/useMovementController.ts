import { useCallback } from 'react';
import { Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { getBaseBailFee } from '../../property/utils/rentCalculator';

interface MovementContext {
  activePlayer: Player | null;
  canRoll: boolean;
  isRolling: boolean;
  isMovingStepByStep: boolean;
  pendingDiceBoost: number;
  consecutiveDoubles: number;
  currentRound: number;
  settings: any;
  moveTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  remainingStepsRef: React.MutableRefObject<number>;
  movingPlayerIdRef: React.MutableRefObject<number | null>;
  setDice: (d: [number, number]) => void;
  setIsRolling: (v: boolean) => void;
  setCanRoll: (v: boolean) => void;
  setPendingDiceBoost: (v: number) => void;
  setConsecutiveDoubles: (v: number) => void;
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

        ctx.setPlayers(prev => {
          return prev.map(p => {
            if (p.id !== playerId) return p;
            const oldPos = p.position;
            const newPos = (oldPos + 1) % 40;
            sounds.step();

            if (newPos === 0) {
              let exactBonus = ctx.settings.goExactBonus ?? 400;
              if (ctx.settings.jailMode === 'investigation' && p.inJail) {
                const red = Math.round(exactBonus * (ctx.settings.investigationIncomePenaltyPercent / 100));
                exactBonus = Math.max(0, exactBonus - red);
                ctx.addLog(`📉 [Đang Bị Điều Tra] ${p.name} bị trừ tiền thưởng dừng Trạm Khởi Hành (-${red}đ)`, 'jail');
              }
              p.cash += exactBonus;
              ctx.triggerCashTransfer(0, [p.id], exactBonus, 'Thưởng dừng trúng ô Khởi Hành');
              ctx.addLog(`🎉 ${p.name} dừng TRÚNG Ô [Trạm khởi hành] nhận thưởng ${exactBonus}đ!`, 'money');
            } else if (oldPos > newPos) {
              let passBonus = ctx.settings.goPassBonus ?? 200;
              if (ctx.settings.jailMode === 'investigation' && p.inJail) {
                const red = Math.round(passBonus * (ctx.settings.investigationIncomePenaltyPercent / 100));
                passBonus = Math.max(0, passBonus - red);
                ctx.addLog(`📉 [Đang Bị Điều Tra] ${p.name} bị trừ tiền thưởng đi qua Trạm Khởi Hành (-${red}đ)`, 'jail');
              }
              p.cash += passBonus;
              ctx.triggerCashTransfer(0, [p.id], passBonus, 'Thưởng đi qua ô Khởi Hành');
              ctx.addLog(`🎁 ${p.name} đi QUA [Trạm khởi hành] nhận thưởng ${passBonus}đ`, 'money');
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

        if (passedGo) {
          let passBonus = ctx.settings.goPassBonus ?? 200;
          if (ctx.settings.jailMode === 'investigation' && p.inJail) {
            const red = Math.round(passBonus * (ctx.settings.investigationIncomePenaltyPercent / 100));
            passBonus = Math.max(0, passBonus - red);
          }
          p.cash += passBonus;
          ctx.triggerCashTransfer(0, [p.id], passBonus, 'Thưởng đi qua ô Khởi Hành');
          ctx.addLog(`🎁 ${p.name} đi qua [Trạm khởi hành] (+${passBonus}đ)`, 'money');
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
    if (!ctx.activePlayer || !ctx.canRoll || ctx.isRolling || ctx.isMovingStepByStep || ctx.activePlayer.bankrupt)
      return;

    ctx.setIsRolling(true);
    ctx.setCanRoll(false);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const isDouble = d1 === d2;
    let total = d1 + d2;

    if (ctx.pendingDiceBoost !== 0) {
      total = Math.max(1, total + ctx.pendingDiceBoost);
      ctx.addLog(`⚡ Gia tốc xúc xắc tác dụng: ${ctx.pendingDiceBoost > 0 ? '+' : ''}${ctx.pendingDiceBoost} bước!`, 'ability');
      ctx.setPendingDiceBoost(0);
    }

    ctx.setDice([d1, d2]);
    ctx.activePlayer.lastDiceRoll = [d1, d2];

    setTimeout(() => {
      const player = ctx.activePlayer;
      if (!player) return;

      ctx.setIsRolling(false);
      ctx.addLog(`🎲 ${player.name} tung được [${d1}][${d2}] (Tổng: ${total})${isDouble ? ' - LƯỢT ĐÔI!' : ''}`);

      if (player.inJail) {
        const isInvestigation = ctx.settings.jailMode === 'investigation';
        if (isDouble) {
          sounds.ability();
          player.inJail = false;
          player.jailTurns = 0;
          ctx.addLog(`✨ ${player.name} đổ được đôi và được tự do!`, 'jail');
          movePlayerSteps(player.id, total);
          return;
        } else {
          player.jailTurns += 1;
          if (player.jailTurns >= 3) {
            const baseFee = getBaseBailFee(ctx.currentRound, ctx.settings);
            if (player.cash >= baseFee) {
              player.cash -= baseFee;
              player.inJail = false;
              player.jailTurns = 0;
              sounds.cash();
              ctx.triggerCashTransfer(player.id, [], baseFee, isInvestigation ? 'Phí nộp phạt khắc phục xóa án' : 'Phí bảo lãnh ra tù');
              movePlayerSteps(player.id, total);
              return;
            } else {
              ctx.handleBankrupt(player);
              return;
            }
          }

          if (isInvestigation) {
            movePlayerSteps(player.id, total);
            return;
          } else {
            ctx.addLog(`🔒 ${player.name} không tung được đôi (${player.jailTurns}/3)`, 'jail');
            return;
          }
        }
      }

      if (isDouble) {
        const nextDoubles = ctx.consecutiveDoubles + 1;
        ctx.setConsecutiveDoubles(nextDoubles);
        if (nextDoubles >= 3) {
          sounds.jail();
          player.position = 10;
          player.inJail = true;
          player.jailTurns = 0;
          ctx.setConsecutiveDoubles(0);
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
        }
      } else {
        ctx.setConsecutiveDoubles(0);
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
