/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, PermanentAbility, Player } from '../../../types/game';
import { filterAbilitiesForAI } from './abilityFilterHelper';

/**
 * Lựa chọn ngẫu nhiên tối đa 2 năng lực vĩnh viễn chưa có ai sở hữu cho ô Điện Lực / Cấp Nước
 */
export function getOfferedUtilityAbilities(
  permanentShop: PermanentAbility[],
  players: Player[] = [],
  activePlayerId?: number
): PermanentAbility[] {
  // Lọc các năng lực vĩnh viễn còn trong kho và chưa bị người chơi nào sở hữu độc quyền
  const candidates = permanentShop.filter(a => {
    if ((a.quantity ?? 1) <= 0) return false;
    const isOwnedByAnyone = players.some(
      p => p.permanentAbilities && p.permanentAbilities.includes(a.id)
    );
    return !isOwnedByAnyone;
  });

  // Xáo trộn ngẫu nhiên bằng thuật toán Fisher-Yates
  const pool = [...candidates];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Luôn trả về tối đa 2 năng lực ngẫu nhiên
  return pool.slice(0, 2);
}

/**
 * Lựa chọn ngẫu nhiên tối đa 2 kỹ năng dùng 1 lần cho ô Bến Xe / Sân Bay
 */
export function getOfferedStationAbilities(
  consumableShop: ConsumableAbility[],
  isAI: boolean = false
): ConsumableAbility[] {
  const unowned = consumableShop.filter(a => (a.quantity ?? 1) > 0);
  const candidates = isAI
    ? filterAbilitiesForAI(unowned, { requireAutoTrigger: true })
    : unowned;

  const pool = [...candidates];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 2);
}
