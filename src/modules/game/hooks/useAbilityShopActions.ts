/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { ConsumableAbility, PermanentAbility, Player, Card } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { executeConsumableInstantEffect } from '../utils/consumableInstantEffects';
import { executeConsumableUseEffect } from '../utils/consumableUseEffects';

interface AbilityContext {
  activePlayer: Player | null;
  tiles?: any[];
  chanceDeck: Card[];
  chestDeck: Card[];
  canRoll?: boolean;
  hasMovedThisTurn?: boolean;
  movePlayerSteps?: (playerId: number, stepsRemaining: number) => void;
  setUpgradesThisTurn?: React.Dispatch<React.SetStateAction<number>>;
  setHasMovedThisTurn?: (v: boolean) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setConsumableShop: React.Dispatch<React.SetStateAction<ConsumableAbility[]>>;
  permanentShop: PermanentAbility[];
  setPermanentShop: React.Dispatch<React.SetStateAction<PermanentAbility[]>>;
  setChanceDeck?: React.Dispatch<React.SetStateAction<Card[]>>;
  setChestDeck?: React.Dispatch<React.SetStateAction<Card[]>>;
  setActiveStationModal: (t: any) => void;
  setActiveUtilityModal: (t: any) => void;
  setActiveTargetAbility: (a: any) => void;
  setPendingDiceBoost: (v: number) => void;
  setPendingDestroyHousePlayerId?: (id: number | null) => void;
  setPendingDestroyHouseNext?: (v: boolean) => void;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string, cashDelta?: number) => void;
  resolveTileLanding: (pId: number, pos: number, steps: number) => void;
  executeDrawnCard: (c: Card) => void;
}

export const useAbilityShopActions = (ctx: AbilityContext) => {
  const buyConsumableAbility = useCallback(
    (ability: ConsumableAbility, discardAbilityId?: string) => {
      if (!ctx.activePlayer) return;

      const hasVip = ctx.activePlayer.permanentAbilities.includes('perm-station-vip');
      const finalCost = hasVip ? Math.round(ability.cost * 0.5) : ability.cost;
      if (ctx.activePlayer.cash < finalCost) return;

      sounds.ability();

      // Check if ability is instant_on_buy (kích hoạt ngay sau khi mua)
      if (ability.triggerCondition === 'instant_on_buy') {
        ctx.setPlayers(prev => {
          const next = prev.map(p => ({ ...p }));
          const buyer = next.find(p => p.id === ctx.activePlayer!.id);
          if (!buyer) return prev;

          buyer.cash -= finalCost;

          executeConsumableInstantEffect({
            ability,
            buyer,
            next,
            tiles: ctx.tiles,
            triggerCashTransfer: ctx.triggerCashTransfer,
            addLog: ctx.addLog,
          });

          return next;
        });

        ctx.triggerCashTransfer(ctx.activePlayer.id, [], finalCost, `Mua & Kích Hoạt [${ability.name}]`);
        ctx.setConsumableShop(shop =>
          shop.map(a =>
            a.id === ability.id ? { ...a, quantity: Math.max(0, (a.quantity ?? 1) - 1) } : a
          )
        );
        ctx.setActiveStationModal(null);
        return;
      }

      // Standard non-instant consumable purchase
      sounds.purchase();
      ctx.setConsumableShop(shop =>
        shop.map(a =>
          a.id === ability.id ? { ...a, quantity: Math.max(0, (a.quantity ?? 1) - 1) } : a
        )
      );

      ctx.setPlayers(prev => {
        return prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            let nextAbilities = [...p.consumableAbilities];
            if (discardAbilityId) {
              nextAbilities = nextAbilities.filter(id => id !== discardAbilityId);
              ctx.setConsumableShop(shop =>
                shop.map(a => (a.id === discardAbilityId ? { ...a, quantity: (a.quantity ?? 0) + 1 } : a))
              );
            }
            return {
              ...p,
              cash: p.cash - finalCost,
              consumableAbilities: [...nextAbilities, ability.id],
            };
          }
          return p;
        });
      });

      ctx.triggerCashTransfer(ctx.activePlayer.id, [], finalCost, `Mua thẻ [${ability.name}]`);
      ctx.addLog(
        `⚡ ${ctx.activePlayer.name} mua kỹ năng [${ability.name}] tại Bến Xe (-${finalCost}đ)`,
        'ability'
      );
      ctx.setActiveStationModal(null);
    },
    [ctx]
  );

  const buyPermanentAbility = useCallback(
    (ability: PermanentAbility, replaceAbilityId?: string) => {
      if (!ctx.activePlayer || ctx.activePlayer.cash < ability.cost) return;

      sounds.purchase();
      ctx.setPermanentShop(shop =>
        shop.map(a => {
          if (a.id === ability.id) {
            return { ...a, quantity: Math.max(0, (a.quantity ?? 1) - 1) };
          }
          if (replaceAbilityId && a.id === replaceAbilityId) {
            return { ...a, quantity: (a.quantity ?? 0) + 1 };
          }
          return a;
        })
      );

      ctx.setPlayers(prev => {
        return prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            const remainingAbilities = replaceAbilityId
              ? p.permanentAbilities.filter(id => id !== replaceAbilityId)
              : p.permanentAbilities;
            return {
              ...p,
              cash: p.cash - ability.cost,
              permanentAbilities: [...remainingAbilities, ability.id],
            };
          }
          return p;
        });
      });

      ctx.setActiveUtilityModal(null);
    },
    [ctx]
  );

  const sellPermanentAbility = useCallback(
    (ability: PermanentAbility) => {
      if (!ctx.activePlayer || !ctx.activePlayer.permanentAbilities.includes(ability.id)) return;
      const refund = Math.floor(ability.cost * 0.7);

      sounds.cash();
      ctx.setPermanentShop(shop =>
        shop.map(a => (a.id === ability.id ? { ...a, quantity: (a.quantity ?? 0) + 1 } : a))
      );
      ctx.setPlayers(prev =>
        prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            return {
              ...p,
              cash: p.cash + refund,
              permanentAbilities: p.permanentAbilities.filter(id => id !== ability.id),
            };
          }
          return p;
        })
      );

      ctx.triggerCashTransfer(0, [ctx.activePlayer.id], refund, `Bán lại [${ability.name}]`);
      ctx.addLog(`🪙 ${ctx.activePlayer.name} bán lại [${ability.name}] cho Ngân Hàng (+${refund}đ)`, 'ability');
    },
    [ctx]
  );

  const useConsumableAbility = useCallback(
    (ability: ConsumableAbility, targetPlayer?: Player) => {
      if (!ctx.activePlayer) return;

      const needsTarget =
        ability.effectType === 'direct_jail_target' ||
        ability.effectType === 'push_neighbor' ||
        ability.effectType === 'send_to_jail_neighbor';

      if (needsTarget && !targetPlayer) {
        ctx.setActiveTargetAbility(ability);
        return;
      }

      sounds.ability();
      ctx.triggerCharacterEvent(
        ctx.activePlayer.id,
        'use_ability',
        'action',
        'Kích Hoạt Kỹ Năng',
        `${ctx.activePlayer.name} vừa thi triển [${ability.name}]!`
      );

      let extraMoveInfo = { isExtraMovement: false, moveSteps: 0, movePlayerId: ctx.activePlayer.id };

      ctx.setPlayers(prev => {
        const next = [...prev];
        const p = next.find(x => x.id === ctx.activePlayer!.id);
        if (!p) return prev;

        if (ability.effectType === 'instant_upgrade_house') {
          ctx.addLog(
            `⚡ [Giấy Phép Xây Dựng Đặc Cách]: Bấm vào bất kỳ ô đất nào của bạn trên bàn cờ để sử dụng giấy phép và nâng cấp ngay lập tức!`,
            'ability'
          );
          return prev;
        }

        p.consumableAbilities = p.consumableAbilities.filter(id => id !== ability.id);

        ctx.setConsumableShop(shop =>
          shop.map(a => (a.id === ability.id ? { ...a, quantity: (a.quantity ?? 0) + 1 } : a))
        );

        extraMoveInfo = executeConsumableUseEffect({
          ability,
          p,
          next,
          targetPlayer,
          tiles: ctx.tiles,
          canRoll: ctx.canRoll,
          hasMovedThisTurn: ctx.hasMovedThisTurn,
          chanceDeck: ctx.chanceDeck,
          chestDeck: ctx.chestDeck,
          setUpgradesThisTurn: ctx.setUpgradesThisTurn,
          setHasMovedThisTurn: ctx.setHasMovedThisTurn,
          setPendingDiceBoost: ctx.setPendingDiceBoost,
          setPendingDestroyHousePlayerId: ctx.setPendingDestroyHousePlayerId,
          setPendingDestroyHouseNext: ctx.setPendingDestroyHouseNext,
          triggerCashTransfer: ctx.triggerCashTransfer,
          addLog: ctx.addLog,
          resolveTileLanding: ctx.resolveTileLanding,
          executeDrawnCard: ctx.executeDrawnCard,
        });

        return next;
      });

      if (extraMoveInfo.isExtraMovement && extraMoveInfo.moveSteps > 0) {
        sounds.step();
        if (ctx.movePlayerSteps) {
          ctx.movePlayerSteps(extraMoveInfo.movePlayerId, extraMoveInfo.moveSteps);
        } else {
          ctx.setPlayers(curr =>
            curr.map(cp => {
              if (cp.id !== extraMoveInfo.movePlayerId) return cp;
              const newPos = (cp.position + extraMoveInfo.moveSteps) % 40;
              return { ...cp, position: newPos };
            })
          );
          setTimeout(() => {
            const targetP = ctx.activePlayer;
            const newPos = targetP ? (targetP.position + extraMoveInfo.moveSteps) % 40 : 0;
            ctx.resolveTileLanding(extraMoveInfo.movePlayerId, newPos, extraMoveInfo.moveSteps);
          }, 150);
        }
      }

      ctx.setActiveTargetAbility(null);
    },
    [ctx]
  );

  return {
    buyConsumableAbility,
    buyPermanentAbility,
    sellPermanentAbility,
    useConsumableAbility,
  };
};
