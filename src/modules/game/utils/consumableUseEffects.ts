/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, Player, Card } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

export interface ConsumableUseContext {
  ability: ConsumableAbility;
  p: Player;
  next: Player[];
  targetPlayer?: Player;
  tiles?: any[];
  canRoll?: boolean;
  hasMovedThisTurn?: boolean;
  chanceDeck: Card[];
  chestDeck: Card[];
  setUpgradesThisTurn?: React.Dispatch<React.SetStateAction<number>>;
  setHasMovedThisTurn?: (v: boolean) => void;
  setPendingDiceBoost: (v: number) => void;
  setPendingDestroyHousePlayerId?: (id: number | null) => void;
  setPendingDestroyHouseNext?: (v: boolean) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  addLog: (msg: string, type?: any) => void;
  resolveTileLanding: (pId: number, pos: number, steps: number) => void;
  executeDrawnCard: (c: Card) => void;
}

export interface ConsumableUseResult {
  isExtraMovement: boolean;
  moveSteps: number;
  movePlayerId: number;
}

export function executeConsumableUseEffect(ctx: ConsumableUseContext): ConsumableUseResult {
  const {
    ability,
    p,
    next,
    targetPlayer,
    tiles,
    canRoll,
    hasMovedThisTurn,
    chanceDeck,
    chestDeck,
    setUpgradesThisTurn,
    setHasMovedThisTurn,
    setPendingDiceBoost,
    setPendingDestroyHousePlayerId,
    setPendingDestroyHouseNext,
    triggerCashTransfer,
    addLog,
    resolveTileLanding,
    executeDrawnCard,
  } = ctx;

  let isExtraMovement = false;
  let moveSteps = 0;
  let movePlayerId = p.id;

  switch (ability.effectType) {
    case 'dice_boost': {
      const boostVal = ability.effectValue || ability.value || 1;
      if (p.inJail) {
        addLog(
          `🚨 [${ability.name}] ${p.name} đang trong diện giam giữ/điều tra nên không thể di chuyển!`,
          'jail'
        );
        break;
      }
      isExtraMovement = true;
      moveSteps = boostVal;
      movePlayerId = p.id;
      if (setUpgradesThisTurn) setUpgradesThisTurn(0);
      if (setHasMovedThisTurn) setHasMovedThisTurn(true);
      addLog(
        `🚀 [${ability.name}] ${p.name} kích hoạt: Lập tức di chuyển tiến +${boostVal} bước!`,
        'ability'
      );
      break;
    }
    case 'dice_reduce': {
      const reduceVal = ability.effectValue || ability.value || 1;
      if (p.inJail) {
        addLog(
          `🚨 [${ability.name}] ${p.name} đang trong diện giam giữ/điều tra nên không thể di chuyển!`,
          'jail'
        );
        break;
      }
      isExtraMovement = true;
      moveSteps = -reduceVal;
      movePlayerId = p.id;
      if (setUpgradesThisTurn) setUpgradesThisTurn(0);
      if (setHasMovedThisTurn) setHasMovedThisTurn(true);
      addLog(
        `🛑 [${ability.name}] ${p.name} kích hoạt: Lập tức lùi lại ${reduceVal} bước!`,
        'ability'
      );
      break;
    }
    case 'free_tax':
      p.hasFreeTaxNextTurn = true;
      addLog(`🛡️ [${ability.name}]: Bạn sẽ được miễn thuế lần tới!`, 'ability');
      break;
    case 'half_rent':
      p.hasHalfRentDiscountNextTurn = true;
      addLog(`🏷️ [${ability.name}]: Giảm 50% tiền thuê đất lần tới!`, 'ability');
      break;
    case 'direct_jail_target':
      if (targetPlayer) {
        const target = next.find(x => x.id === targetPlayer.id);
        if (target) {
          target.position = 10;
          target.inJail = true;
          target.jailTurns = 0;
          sounds.jail();
          addLog(`🚨 [Trát Bắt Trực Tiếp] ${p.name} tống ${target.name} vào tù!`, 'jail');
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
          addLog(`⛓️ [Còng Số 8] ${p.name} còng tay tống ${target.name} vào tù!`, 'jail');
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
          addLog(`💨 [Đẩy Lùi] ${p.name} ép ${target.name} tiến thêm ${pushSteps} bước!`, 'ability');
          setTimeout(() => {
            resolveTileLanding(target.id, target.position, pushSteps);
          }, 300);
        }
      }
      break;
    case 'destroy_house':
      if (setPendingDestroyHousePlayerId) {
        setPendingDestroyHousePlayerId(p.id);
      } else if (setPendingDestroyHouseNext) {
        setPendingDestroyHouseNext(true);
      }
      addLog(
        `💣 [Lệnh Phá Sập] ${p.name} kích hoạt! Căn nhà đối thủ tiếp theo mà ${p.name} dừng chân sẽ bị phá sập 1 cấp!`,
        'ability'
      );
      break;
    case 'draw_both_cards': {
      const c1 = chanceDeck.length > 0 ? chanceDeck[0] : null;
      const c2 = chestDeck.length > 0 ? chestDeck[0] : null;
      addLog(`✨ [Kép Vận Song Hành] Rút 2 thẻ đặc quyền!`, 'ability');
      if (c1 && c1.actionType !== 'cash_penalty') executeDrawnCard(c1);
      if (c2 && c2.actionType !== 'cash_penalty') executeDrawnCard(c2);
      break;
    }
    case 'gain_cash_amount': {
      const val = ability.effectValue || ability.value || 100;
      p.cash += val;
      sounds.cash();
      triggerCashTransfer(0, [p.id], val, ability.name);
      addLog(`💰 [${ability.name}] ${p.name} nhận thêm ${val}đ từ Ngân Hàng!`, 'money');
      break;
    }
    case 'pay_cash_amount': {
      const val = ability.effectValue || ability.value || 100;
      p.cash = Math.max(0, p.cash - val);
      sounds.cash();
      addLog(`💸 [${ability.name}] ${p.name} thanh toán ${val}đ!`, 'money');
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
        triggerCashTransfer(target.id, [p.id], steal, ability.name);
        addLog(`💰 [${ability.name}] ${p.name} thu ${steal}đ từ ${target.name}!`, 'money');
      }
      break;
    }
    case 'send_to_go': {
      if (targetPlayer) {
        const target = next.find(x => x.id === targetPlayer.id);
        if (target) {
          target.position = 0;
          sounds.step();
          addLog(`🌀 [${ability.name}] ${p.name} bắt ${target.name} quay về Trạm Khởi Hành!`, 'ability');
        }
      }
      break;
    }
  }

  return { isExtraMovement, moveSteps, movePlayerId };
}
