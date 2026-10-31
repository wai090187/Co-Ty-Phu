import { useCallback } from 'react';
import { ConsumableAbility, PermanentAbility, Player, Card } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

interface AbilityContext {
  activePlayer: Player | null;
  chanceDeck: Card[];
  chestDeck: Card[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setActiveStationModal: (t: any) => void;
  setActiveUtilityModal: (t: any) => void;
  setActiveTargetAbility: (a: any) => void;
  setPendingDiceBoost: (v: number) => void;
  setPendingDestroyHouseNext: (v: boolean) => void;
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
      ctx.setPlayers(prev =>
        prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            let list = [...p.consumableAbilities];
            if (discardAbilityId) list = list.filter(id => id !== discardAbilityId);
            list.push(ability.id);
            return {
              ...p,
              cash: p.cash - finalCost,
              consumableAbilities: list,
            };
          }
          return p;
        })
      );

      ctx.triggerCashTransfer(ctx.activePlayer.id, [], finalCost, `Mua kỹ năng [${ability.name}]`);
      ctx.addLog(`⚡ ${ctx.activePlayer.name} mua Kỹ Năng [${ability.name}] tại Bến Xe (-${finalCost}đ)`, 'ability');
      ctx.setActiveStationModal(null);
    },
    [ctx]
  );

  const buyPermanentAbility = useCallback(
    (ability: PermanentAbility) => {
      if (!ctx.activePlayer || ctx.activePlayer.cash < ability.cost) return;

      ctx.setPlayers(prev => {
        const isOwnedByAnyone = prev.some(p => p.permanentAbilities.includes(ability.id));
        if (isOwnedByAnyone) {
          alert('Năng lực độc quyền này đã có người sở hữu!');
          return prev;
        }

        sounds.ability();
        ctx.triggerCashTransfer(ctx.activePlayer!.id, [], ability.cost, `Mua [${ability.name}]`);
        ctx.addLog(`👑 ${ctx.activePlayer!.name} mua Năng Lực Vĩnh Viễn [${ability.name}] (-${ability.cost}đ)`, 'ability');

        return prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            return {
              ...p,
              cash: p.cash - ability.cost,
              permanentAbilities: [...p.permanentAbilities, ability.id],
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
      ctx.setPlayers(prev => {
        const next = [...prev];
        const p = next.find(x => x.id === ctx.activePlayer!.id);
        if (!p) return prev;

        p.consumableAbilities = p.consumableAbilities.filter(id => id !== ability.id);

        switch (ability.effectType) {
          case 'dice_boost':
            ctx.setPendingDiceBoost(ability.value || 2);
            ctx.addLog(`🚀 [${ability.name}]: +${ability.value} bước cho lần tung xúc xắc tới!`, 'ability');
            break;
          case 'dice_reduce':
            ctx.setPendingDiceBoost(-(ability.value || 1));
            ctx.addLog(`🛑 [${ability.name}]: -${ability.value} bước cho lần tung xúc xắc tới!`, 'ability');
            break;
          case 'free_tax':
            p.hasFreeTaxNextTurn = true;
            ctx.addLog(`🛡️ [${ability.name}]: Bạn sẽ được miễn thuế lần tới!`, 'ability');
            break;
          case 'half_rent':
            p.hasHalfRentDiscountNextTurn = true;
            ctx.addLog(`🏷️ [${ability.name}]: Giảm 50% tiền thuê đất lần tới!`, 'ability');
            break;
          case 'direct_jail_target':
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                target.position = 10;
                target.inJail = true;
                target.jailTurns = 0;
                sounds.jail();
                ctx.addLog(`🚨 [Trát Bắt Trực Tiếp] ${p.name} tống ${target.name} vào tù!`, 'jail');
              }
            }
            break;
          case 'send_to_jail_neighbor':
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                target.position = 10;
                target.inJail = true;
                target.jailTurns = 0;
                sounds.jail();
                ctx.addLog(`⛓️ [Còng Số 8] ${p.name} còng tay tống ${target.name} vào tù!`, 'jail');
              }
            }
            break;
          case 'push_neighbor':
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                const pushSteps = ability.value || 1;
                target.position = (target.position + pushSteps) % 40;
                sounds.step();
                ctx.addLog(`💨 [Đẩy Lùi] ${p.name} ép ${target.name} tiến thêm ${pushSteps} bước!`, 'ability');
                setTimeout(() => {
                  ctx.resolveTileLanding(target.id, target.position, pushSteps);
                }, 300);
              }
            }
            break;
          case 'destroy_house':
            ctx.setPendingDestroyHouseNext(true);
            ctx.addLog(`💣 [Lệnh Phá Sập] Kích hoạt! Căn nhà đối thủ tiếp theo sẽ bị phá 1 cấp!`, 'ability');
            break;
          case 'draw_both_cards': {
            const c1 = ctx.chanceDeck.length > 0 ? ctx.chanceDeck[0] : null;
            const c2 = ctx.chestDeck.length > 0 ? ctx.chestDeck[0] : null;
            ctx.addLog(`✨ [Kép Vận Song Hành] Rút 2 thẻ đặc quyền!`, 'ability');
            if (c1 && c1.actionType !== 'cash_penalty') ctx.executeDrawnCard(c1);
            if (c2 && c2.actionType !== 'cash_penalty') ctx.executeDrawnCard(c2);
            break;
          }
        }

        return next;
      });

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
