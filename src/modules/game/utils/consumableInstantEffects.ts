/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

export interface ConsumableInstantContext {
  ability: ConsumableAbility;
  buyer: Player;
  next: Player[];
  tiles?: any[];
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  addLog: (msg: string, type?: any) => void;
}

export function executeConsumableInstantEffect(ctx: ConsumableInstantContext): void {
  const { ability, buyer, next, tiles, triggerCashTransfer, addLog } = ctx;

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
        const tileName = tiles ? tiles[highestHouseTileId]?.name : `ô ${highestHouseTileId}`;
        addLog(
          `💣 [Triệt Hạ Bất Động Sản Đại Gia] ${buyer.name} kích hoạt: Phá sập 1 cấp nhà trên [${tileName}] của đại gia ${richestWithHouses.name}!`,
          'ability'
        );
      }
    } else {
      addLog(`💣 [Triệt Hạ Bất Động Sản Đại Gia] Không có đối thủ nào có nhà để phá sập!`, 'ability');
    }
  }
  // 2. Trợ Cấp Cứu Trợ Hộ Nghèo
  else if (ability.effectType === 'poorest_relief_bonus') {
    const minCash = Math.min(...next.filter(p => !p.bankrupt).map(p => p.cash));
    if (buyer.cash <= minCash) {
      const bonus = ability.effectValue || ability.value || 300;
      buyer.cash += bonus;
      sounds.cash();
      triggerCashTransfer(0, [buyer.id], bonus, 'Trợ cấp cứu trợ hộ nghèo');
      addLog(
        `🤝 [Trợ Cấp Cứu Trợ Hộ Nghèo] ${buyer.name} là người nghèo nhất (tiền mặt ít nhất), nhận được ${bonus}đ tiền cứu trợ!`,
        'money'
      );
    } else {
      addLog(
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
    addLog(
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
    addLog(
      `💰 [Thu Phí Lượt Trước & Sau] ${buyer.name} thu được tổng cộng ${totalStolen}đ từ ${prevP?.name} và ${nextP?.name}!`,
      'money'
    );
  }
  // 5. Miễn Thuế Lượt Kế Tiếp
  else if (ability.effectType === 'free_tax') {
    buyer.hasFreeTaxNextTurn = true;
    addLog(`🛡️ [${ability.name}] ${buyer.name} được cấp chứng nhận miễn thuế lần tiếp theo!`, 'ability');
  }
  // 6. Cộng Tiền Trực Tiếp
  else if (ability.effectType === 'gain_cash_amount') {
    const amount = ability.effectValue || ability.value || 100;
    buyer.cash += amount;
    sounds.cash();
    triggerCashTransfer(0, [buyer.id], amount, ability.name);
    addLog(`💰 [${ability.name}] ${buyer.name} nhận ngay ${amount}đ!`, 'money');
  }
  // 7. Thu Tiền Của Đối Thủ
  else if (ability.effectType === 'steal_cash_from_target') {
    const amount = ability.effectValue || ability.value || 100;
    let targets = next.filter(p => p.id !== buyer.id && !p.bankrupt);
    if (ability.targetScope === 'target_richest') {
      targets = targets.sort((a, b) => b.cash - a.cash).slice(0, 1);
    }
    let totalStolen = 0;
    targets.forEach(t => {
      const steal = Math.min(t.cash, amount);
      t.cash -= steal;
      totalStolen += steal;
      triggerCashTransfer(t.id, [buyer.id], steal, ability.name);
    });
    buyer.cash += totalStolen;
    sounds.cash();
    addLog(`💰 [${ability.name}] ${buyer.name} thu được tổng cộng ${totalStolen}đ!`, 'money');
  }
  // 8. Tống Giam Toàn Bộ Đối Thủ
  else if (ability.effectType === 'direct_jail_target' && ability.targetScope === 'all_opponents') {
    const opps = next.filter(p => p.id !== buyer.id && !p.bankrupt);
    opps.forEach(o => {
      o.position = 10;
      o.inJail = true;
      o.jailTurns = 0;
    });
    sounds.jail();
    addLog(`🚨 [${ability.name}] ${buyer.name} tống giam toàn bộ đối thủ vào tù!`, 'jail');
  }
}
