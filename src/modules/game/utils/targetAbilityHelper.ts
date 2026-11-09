/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, Player } from '../../../types/game';

export function getAvailableTargetPlayers(
  ability: ConsumableAbility | null,
  activePlayer: Player | null,
  players: Player[]
): Player[] {
  if (!ability || !activePlayer) return [];
  if (ability.effectType === 'direct_jail_target') {
    return players.filter(p => p.id !== activePlayer.id && !p.bankrupt && !p.inJail);
  }
  if (
    ability.effectType === 'push_neighbor' ||
    ability.effectType === 'send_to_jail_neighbor'
  ) {
    return players.filter(p => {
      if (p.id === activePlayer.id || p.bankrupt) return false;
      const dist = Math.abs(p.position - activePlayer.position);
      return dist === 0 || dist === 1 || dist === 39;
    });
  }
  return [];
}
