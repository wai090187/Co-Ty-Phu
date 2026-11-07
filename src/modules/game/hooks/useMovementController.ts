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
              if (isFinalStep) {
                let exactBonus = ctx.settings.goExactBonus ?? 400;
                if (ctx.settings.jailMode === 'investigation' && p.inJail) {
                  const red = Math.round(exactBonus * (ctx.settings.investigationIncomePenaltyPercent / 100));
                  exactBonus = Math.max(0, exactBonus - red);
                  ctx.addLog(`📉 [Đang Bị Điều Tra] ${p.name} bị trừ tiền thưởng dừng Trạm Khởi Hành (-${red}đ)`, 'jail');
                }
                p.cash += exactBonus;
                ctx.triggerCashTransfer(0, [p.id], exactBonus, 'Thưởng dừng trúng ô Khởi Hành');
                ctx.addLog(`🎉 ${p.name} dừng TRÚNG Ô [Trạm khởi hành] nhận thưởng ${exactBonus}đ!`, 'money');
              } else {
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
          let exactBonus = ctx.settings.goExactBonus ?? 400;
          if (ctx.settings.jailMode === 'investigation' && p.inJail) {
            const red = Math.round(exactBonus * (ctx.settings.investigationIncomePenaltyPercent / 100));
            exactBonus = Math.max(0, exactBonus - red);
          }
          p.cash += exactBonus;
          ctx.triggerCashTransfer(0, [p.id], exactBonus, 'Thưởng dừng trúng ô Khởi Hành');
          ctx.addLog(`🎉 ${p.name} dừng TRÚNG Ô [Trạm khởi hành] (+${exactBonus}đ)`, 'money');
        } else if (passedGo) {
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

        // 1. Thẻ ra tù miễn phí
        if ((player.getOutOfJailCards || 0) > 0) {
          player.getOutOfJailCards = (player.getOutOfJailCards || 0) - 1;
          player.inJail = false;
          player.jailTurns = 0;
          sounds.ability();
          const remainingCards = player.getOutOfJailCards;
          ctx.addLog(
            isInvestigation
              ? `🕊️ [Dùng Thẻ Ra Tù] ${player.name} đã sử dụng Thẻ Ra Tù Miễn Phí để thoát khỏi diện điều tra thành công! (Không mất tiền, còn lại: ${remainingCards} thẻ)`
              : `🕊️ [Dùng Thẻ Ra Tù] ${player.name} đã sử dụng Thẻ Ra Tù Miễn Phí để ra tù thành công! (Không mất tiền, còn lại: ${remainingCards} thẻ)`,
            'jail'
          );
          movePlayerSteps(player.id, total);
          return;
        }

        // 2. Tung ra số đôi
        if (isDouble) {
          sounds.ability();
          player.inJail = false;
          player.jailTurns = 0;
          ctx.addLog(
            isInvestigation
              ? `✨ [Ra Tù Thành Công] ${player.name} tung được số đôi [${d1}][${d2}] - Thoát khỏi diện điều tra thành công miễn phí (không mất tiền)!`
              : `✨ [Ra Tù Thành Công] ${player.name} tung được số đôi [${d1}][${d2}] - Ra tù thành công miễn phí (không mất tiền)!`,
            'jail'
          );
          movePlayerSteps(player.id, total);
          return;
        } else {
          // 3. Không tung được đôi -> thất bại
          player.jailTurns += 1;

          // Sau 3 lượt tung xúc xắc thất bại:
          if (player.jailTurns >= 3) {
            if (isInvestigation) {
              // Chế độ công an điều tra: Thả tự do sau 3 lượt tung thất bại (không cho phép bảo lãnh, không mất tiền)
              player.inJail = false;
              player.jailTurns = 0;
              sounds.ability();
              ctx.addLog(
                `🏛️ [Thả Tự Do Thành Công] ${player.name} sau 3 lượt tung xúc xắc thất bại đã chấp hành đủ thời gian điều tra và chính thức được cơ quan điều tra thả tự do! (Không mất tiền)`,
                'jail'
              );
              movePlayerSteps(player.id, total);
              return;
            } else {
              // Chế độ tù thường (Prison): Nộp bảo lãnh để ra tù hoặc phá sản
              const baseFee = getBaseBailFee(ctx.currentRound, ctx.settings);
              if (player.cash >= baseFee) {
                player.cash -= baseFee;
                player.inJail = false;
                player.jailTurns = 0;
                sounds.cash();
                ctx.triggerCashTransfer(player.id, [], baseFee, 'Phí bảo lãnh ra tù sau 3 lượt');
                ctx.addLog(
                  `🏛️ [Bảo Lãnh Ra Tù Thành Công] ${player.name} sau 3 lượt ở tù đã chi trả ${baseFee}đ tiền bảo lãnh để ra tù thành công!`,
                  'jail'
                );
                movePlayerSteps(player.id, total);
                return;
              } else {
                ctx.addLog(
                  `❌ [Ra Tù Thất Bại] ${player.name} sau 3 lượt ở tù không đủ ${baseFee}đ nộp tiền bảo lãnh và bị tuyên bố phá sản!`,
                  'jail'
                );
                ctx.handleBankrupt(player);
                return;
              }
            }
          }

          // Lượt 1 hoặc 2 thất bại (chưa đủ 3 lượt): Người chơi KHÔNG được di chuyển, bị giữ lại!
          ctx.addLog(
            isInvestigation
              ? `🔒 [Ra Tù Thất Bại] ${player.name} tung [${d1}][${d2}] (không phải số đôi) - Thoát điều tra thất bại! (Đã điều tra: ${player.jailTurns}/3 lượt)`
              : `🔒 [Ra Tù Thất Bại] ${player.name} tung [${d1}][${d2}] (không phải số đôi) - Ra tù thất bại! (Lượt ở tù: ${player.jailTurns}/3)`,
            'jail'
          );
          return;
        }
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
