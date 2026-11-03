import { useCallback } from 'react';
import { ConsumableAbility, PermanentAbility, Player, Card } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

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

      // Check if ability is instant_on_buy (kích hoạt ngay sau khi mua)
      if (ability.triggerCondition === 'instant_on_buy') {
        ctx.setPlayers(prev => {
          const next = prev.map(p => ({ ...p }));
          const buyer = next.find(p => p.id === ctx.activePlayer!.id);
          if (!buyer) return prev;

          buyer.cash -= finalCost;

          // 1. Triệt Hạ Bất Động Sản Đại Gia
          if (ability.effectType === 'destroy_richest_highest_house') {
            const richestWithHouses = next
              .filter(p => p.id !== buyer.id && !p.bankrupt && Object.values(p.houses || {}).some(h => h > 0))
              .sort((a, b) => b.cash - a.cash)[0];

            if (richestWithHouses) {
              let highestHouseTileId = -1;
              let maxHouseLvl = 0;
              Object.entries(richestWithHouses.houses).forEach(([tId, count]) => {
                if (count > maxHouseLvl) {
                  maxHouseLvl = count;
                  highestHouseTileId = Number(tId);
                }
              });

              if (highestHouseTileId !== -1) {
                richestWithHouses.houses[highestHouseTileId] = maxHouseLvl - 1;
                sounds.buildHouse();
                const tileName = ctx.tiles ? ctx.tiles[highestHouseTileId]?.name : `ô ${highestHouseTileId}`;
                ctx.addLog(
                  `💣 [Triệt Hạ Bất Động Sản Đại Gia] ${buyer.name} kích hoạt: Phá sập 1 cấp nhà trên [${tileName}] của đại gia ${richestWithHouses.name}!`,
                  'ability'
                );
              }
            } else {
              ctx.addLog(`💣 [Triệt Hạ Bất Động Sản Đại Gia] Không có đối thủ nào có nhà để phá sập!`, 'ability');
            }
          }
          // 2. Trợ Cấp Cứu Trợ Hộ Nghèo
          else if (ability.effectType === 'poorest_relief_bonus') {
            const minCash = Math.min(...next.filter(p => !p.bankrupt).map(p => p.cash));
            if (buyer.cash <= minCash) {
              const bonus = ability.effectValue || ability.value || 300;
              buyer.cash += bonus;
              sounds.cash();
              ctx.triggerCashTransfer(0, [buyer.id], bonus, 'Trợ cấp cứu trợ hộ nghèo');
              ctx.addLog(
                `🤝 [Trợ Cấp Cứu Trợ Hộ Nghèo] ${buyer.name} là người nghèo nhất (tiền mặt ít nhất), nhận được ${bonus}đ tiền cứu trợ!`,
                'money'
              );
            } else {
              ctx.addLog(
                `🤝 [Trợ Cấp Cứu Trợ Hộ Nghèo] ${buyer.name} không phải là người nghèo nhất nên không nhận được trợ cấp!`,
                'ability'
              );
            }
          }
          // 3. Lệnh Tống Giam Liền Kề
          else if (ability.effectType === 'send_adjacent_to_jail') {
            const activeIndex = next.findIndex(p => p.id === buyer.id);
            const prevIndex = (activeIndex - 1 + next.length) % next.length;
            const nextIndex = (activeIndex + 1) % next.length;
            const prevP = next[prevIndex];
            const nextP = next[nextIndex];

            if (prevP && !prevP.bankrupt) {
              prevP.position = 10;
              prevP.inJail = true;
              prevP.jailTurns = 0;
            }
            if (nextP && !nextP.bankrupt && nextP.id !== prevP?.id) {
              nextP.position = 10;
              nextP.inJail = true;
              nextP.jailTurns = 0;
            }
            sounds.jail();
            ctx.addLog(
              `🚨 [Lệnh Tống Giam Liền Kề] ${buyer.name} kích hoạt: Bắt buộc ${prevP?.name} và ${nextP?.name} (lượt trước & sau) phải vào tù ngay lập tức!`,
              'jail'
            );
          }
          // 4. Thu Phí Lượt Trước & Sau
          else if (ability.effectType === 'steal_from_adjacent') {
            const amount = ability.effectValue || ability.value || 50;
            const activeIndex = next.findIndex(p => p.id === buyer.id);
            const prevIndex = (activeIndex - 1 + next.length) % next.length;
            const nextIndex = (activeIndex + 1) % next.length;
            const prevP = next[prevIndex];
            const nextP = next[nextIndex];
            let totalStolen = 0;

            if (prevP && !prevP.bankrupt && prevP.id !== buyer.id) {
              const stealFromPrev = Math.min(prevP.cash, amount);
              prevP.cash -= stealFromPrev;
              totalStolen += stealFromPrev;
            }
            if (nextP && !nextP.bankrupt && nextP.id !== buyer.id && nextP.id !== prevP?.id) {
              const stealFromNext = Math.min(nextP.cash, amount);
              nextP.cash -= stealFromNext;
              totalStolen += stealFromNext;
            }
            buyer.cash += totalStolen;
            sounds.cash();
            ctx.addLog(
              `💰 [Thu Phí Lượt Trước & Sau] ${buyer.name} thu được tổng cộng ${totalStolen}đ từ ${prevP?.name} và ${nextP?.name}!`,
              'money'
            );
          }
          // 5. Miễn Thuế Lượt Tiếp Theo
          else if (ability.effectType === 'free_tax_next_turn') {
            buyer.hasFreeTaxNextTurn = true;
            sounds.ability();
            ctx.addLog(
              `📜 [Miễn Thuế Lượt Tiếp Theo] ${buyer.name} được ngân hàng cấp chứng nhận miễn thuế lần tiếp theo!`,
              'ability'
            );
          }

          return next;
        });

        // Decrement shop quantity
        ctx.setConsumableShop(shop =>
          shop.map(a => (a.id === ability.id ? { ...a, quantity: Math.max(0, (a.quantity ?? 1) - 1) } : a))
        );

        ctx.triggerCashTransfer(ctx.activePlayer.id, [], finalCost, `Mua & Kích hoạt [${ability.name}]`);
        ctx.addLog(`⚡ ${ctx.activePlayer.name} mua & KÍCH HOẠT NGAY Kỹ Năng [${ability.name}] (-${finalCost}đ)`, 'ability');
        ctx.setActiveStationModal(null);
        return;
      }

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

      ctx.setConsumableShop(shop =>
        shop.map(a => {
          if (a.id === ability.id) {
            return { ...a, quantity: Math.max(0, (a.quantity ?? 1) - 1) };
          }
          if (discardAbilityId && a.id === discardAbilityId) {
            return { ...a, quantity: (a.quantity ?? 0) + 1 };
          }
          return a;
        })
      );

      ctx.triggerCashTransfer(ctx.activePlayer.id, [], finalCost, `Mua kỹ năng [${ability.name}]`);
      ctx.addLog(`⚡ ${ctx.activePlayer.name} mua Kỹ Năng [${ability.name}] tại Bến Xe (-${finalCost}đ)`, 'ability');
      ctx.setActiveStationModal(null);
    },
    [ctx]
  );

  const buyPermanentAbility = useCallback(
    (ability: PermanentAbility, replaceAbilityId?: string) => {
      if (!ctx.activePlayer) return;

      const oldAbility = replaceAbilityId
        ? ctx.permanentShop.find(a => a.id === replaceAbilityId)
        : undefined;
      const refund = oldAbility ? Math.round(oldAbility.cost * 0.5) : 0;
      const netCost = ability.cost - refund;

      if (ctx.activePlayer.cash < netCost) return;

      ctx.setPlayers(prev => {
        const isOwnedByAnyone = prev.some(
          p => p.id !== ctx.activePlayer!.id && p.permanentAbilities.includes(ability.id)
        );
        if (isOwnedByAnyone) {
          alert('Năng lực độc quyền này đã có người sở hữu!');
          return prev;
        }

        sounds.ability();
        ctx.setPermanentShop(shop =>
          shop.map(a => {
            if (a.id === ability.id) return { ...a, quantity: 0 };
            if (replaceAbilityId && a.id === replaceAbilityId) return { ...a, quantity: (a.quantity ?? 0) + 1 };
            return a;
          })
        );

        if (netCost > 0) {
          ctx.triggerCashTransfer(
            ctx.activePlayer!.id,
            [],
            netCost,
            replaceAbilityId && oldAbility
              ? `Bù tiền đổi [${oldAbility.name}] sang [${ability.name}]`
              : `Mua [${ability.name}]`
          );
        } else if (netCost < 0) {
          ctx.triggerCashTransfer(
            0,
            [ctx.activePlayer!.id],
            Math.abs(netCost),
            `Tiền thối đổi năng lực sang [${ability.name}]`
          );
        }

        if (replaceAbilityId && oldAbility) {
          ctx.addLog(
            `👑 ${ctx.activePlayer!.name} đổi năng lực VIP: Bán [${oldAbility.name}] (+${refund}đ, 50% hoàn lại) và bù ${netCost}đ để sở hữu [${ability.name}]!`,
            'ability'
          );
        } else {
          ctx.addLog(
            `👑 ${ctx.activePlayer!.name} mua Năng Lực Vĩnh Viễn [${ability.name}] (-${ability.cost}đ)`,
            'ability'
          );
        }

        return prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            const remainingAbilities = replaceAbilityId
              ? p.permanentAbilities.filter(id => id !== replaceAbilityId)
              : p.permanentAbilities;
            return {
              ...p,
              cash: p.cash - netCost,
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
      let isExtraMovement = false;
      let moveSteps = 0;
      let movePlayerId = ctx.activePlayer.id;

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

        switch (ability.effectType) {
          case 'dice_boost': {
            const boostVal = ability.effectValue || ability.value || 1;
            // Nếu đã tung xúc xắc hoặc đã di chuyển: Coi như một lượt thêm của người chơi
            if (!ctx.canRoll || ctx.hasMovedThisTurn) {
              if (p.inJail) {
                ctx.addLog(
                  `🚨 [${ability.name}] ${p.name} đang trong diện giam giữ/điều tra nên không thể di chuyển!`,
                  'jail'
                );
                break;
              }
              isExtraMovement = true;
              moveSteps = boostVal;
              movePlayerId = p.id;
              if (ctx.setUpgradesThisTurn) ctx.setUpgradesThisTurn(0);
              if (ctx.setHasMovedThisTurn) ctx.setHasMovedThisTurn(true);
              ctx.addLog(
                `🚀 [${ability.name}] ${p.name} kích hoạt lượt di chuyển thêm: Đi tiếp +${boostVal} bước như một lượt mới!`,
                'ability'
              );
            } else {
              ctx.setPendingDiceBoost(boostVal);
              ctx.addLog(`🚀 [${ability.name}]: +${boostVal} bước cho lần tung xúc xắc tới!`, 'ability');
            }
            break;
          }
          case 'dice_reduce': {
            const reduceVal = ability.effectValue || ability.value || 1;
            if (!ctx.canRoll || ctx.hasMovedThisTurn) {
              if (p.inJail) {
                ctx.addLog(
                  `🚨 [${ability.name}] ${p.name} đang trong diện giam giữ/điều tra nên không thể di chuyển!`,
                  'jail'
                );
                break;
              }
              if (ctx.setUpgradesThisTurn) ctx.setUpgradesThisTurn(0);
              if (ctx.setHasMovedThisTurn) ctx.setHasMovedThisTurn(true);
              const newPos = (p.position - reduceVal + 40) % 40;
              p.position = newPos;
              sounds.step();
              ctx.addLog(
                `🛑 [${ability.name}] ${p.name} hãm phanh lùi lại ${reduceVal} bước về [${ctx.tiles?.[newPos]?.name || newPos}] như một lượt mới!`,
                'ability'
              );
              setTimeout(() => {
                ctx.resolveTileLanding(p.id, newPos, 0);
              }, 200);
            } else {
              ctx.setPendingDiceBoost(-reduceVal);
              ctx.addLog(`🛑 [${ability.name}]: -${reduceVal} bước cho lần tung xúc xắc tới!`, 'ability');
            }
            break;
          }
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
          case 'gain_cash_amount': {
            const val = ability.effectValue || ability.value || 100;
            p.cash += val;
            sounds.cash();
            ctx.triggerCashTransfer(0, [p.id], val, ability.name);
            ctx.addLog(`💰 [${ability.name}] ${p.name} nhận thêm ${val}đ từ Ngân Hàng!`, 'money');
            break;
          }
          case 'pay_cash_amount': {
            const val = ability.effectValue || ability.value || 100;
            p.cash = Math.max(0, p.cash - val);
            sounds.cash();
            ctx.addLog(`💸 [${ability.name}] ${p.name} thanh toán ${val}đ!`, 'money');
            break;
          }
          case 'steal_cash_from_target': {
            const val = ability.effectValue || ability.value || 100;
            let target = targetPlayer ? next.find(x => x.id === targetPlayer.id) : undefined;
            if (!target && ability.targetScope === 'target_richest') {
              target = next.filter(x => x.id !== p.id && !x.bankrupt).sort((a, b) => b.cash - a.cash)[0];
            }
            if (target && target.cash > 0) {
              const steal = Math.min(target.cash, val);
              target.cash -= steal;
              p.cash += steal;
              sounds.cash();
              ctx.triggerCashTransfer(target.id, [p.id], steal, ability.name);
              ctx.addLog(`💰 [${ability.name}] ${p.name} thu ${steal}đ từ ${target.name}!`, 'money');
            }
            break;
          }
          case 'send_to_go': {
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                target.position = 0;
                sounds.step();
                ctx.addLog(`🌀 [${ability.name}] ${p.name} bắt ${target.name} quay về Trạm Khởi Hành!`, 'ability');
              }
            }
            break;
          }
        }

        return next;
      });

      if (isExtraMovement && moveSteps > 0) {
        sounds.step();
        if (ctx.movePlayerSteps) {
          ctx.movePlayerSteps(movePlayerId, moveSteps);
        } else {
          ctx.setPlayers(curr =>
            curr.map(cp => {
              if (cp.id !== movePlayerId) return cp;
              const newPos = (cp.position + moveSteps) % 40;
              return { ...cp, position: newPos };
            })
          );
          setTimeout(() => {
            const targetP = ctx.activePlayer;
            const newPos = targetP ? (targetP.position + moveSteps) % 40 : 0;
            ctx.resolveTileLanding(movePlayerId, newPos, moveSteps);
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
