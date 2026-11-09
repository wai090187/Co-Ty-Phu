/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../../../types/game';

interface GoBonusParams {
  player: Player;
  isExact: boolean;
  settings: any;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  addLog: (msg: string, type?: any) => void;
}

export function applyGoTileBonus({
  player,
  isExact,
  settings,
  triggerCashTransfer,
  addLog,
}: GoBonusParams): void {
  if (isExact) {
    let exactBonus = settings.goExactBonus ?? 400;
    if (settings.jailMode === 'investigation' && player.inJail) {
      const red = Math.round(exactBonus * (settings.investigationIncomePenaltyPercent / 100));
      exactBonus = Math.max(0, exactBonus - red);
      addLog(`📉 [Đang Bị Điều Tra] ${player.name} bị trừ tiền thưởng dừng Trạm Khởi Hành (-${red}đ)`, 'jail');
    }
    player.cash += exactBonus;
    triggerCashTransfer(0, [player.id], exactBonus, 'Thưởng dừng trúng ô Khởi Hành');
    addLog(`🎉 ${player.name} dừng TRÚNG Ô [Trạm khởi hành] nhận thưởng ${exactBonus}đ!`, 'money');
  } else {
    let passBonus = settings.goPassBonus ?? 200;
    if (settings.jailMode === 'investigation' && player.inJail) {
      const red = Math.round(passBonus * (settings.investigationIncomePenaltyPercent / 100));
      passBonus = Math.max(0, passBonus - red);
      addLog(`📉 [Đang Bị Điều Tra] ${player.name} bị trừ tiền thưởng đi qua Trạm Khởi Hành (-${red}đ)`, 'jail');
    }
    player.cash += passBonus;
    triggerCashTransfer(0, [player.id], passBonus, 'Thưởng đi qua ô Khởi Hành');
    addLog(`🎁 ${player.name} đi QUA [Trạm khởi hành] nhận thưởng ${passBonus}đ`, 'money');
  }
}
