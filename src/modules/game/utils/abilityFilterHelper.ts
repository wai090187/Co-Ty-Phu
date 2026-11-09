/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility } from '../../../types/game';

/**
 * Checks if a consumable ability modifies movement, steps or dice roll
 * (e.g., dice-plus-1/2/3, dice-minus-1/2/3, push-neighbor-1/2/3).
 */
export function isMovementModifierAbility(ability: {
  id: string;
  effectType?: string;
}): boolean {
  if (!ability) return false;

  const effectType = ability.effectType || '';
  const id = ability.id || '';

  return (
    effectType === 'dice_boost' ||
    effectType === 'dice_reduce' ||
    effectType === 'push_neighbor' ||
    id.startsWith('dice-plus-') ||
    id.startsWith('dice-minus-') ||
    id.startsWith('dice-') ||
    id.startsWith('push-neighbor-')
  );
}

/**
 * Filters consumable abilities suitable for AI:
 * - Excludes all abilities modifying movement steps/dice roll (tăng/giảm ô di chuyển).
 * - Prepares a pool of automated/triggered abilities for AI bots.
 */
export function filterAbilitiesForAI(
  abilities: ConsumableAbility[],
  options?: { requireAutoTrigger?: boolean }
): ConsumableAbility[] {
  const requireAuto = options?.requireAutoTrigger ?? true;

  // 1. Strictly remove all movement increase/decrease abilities
  const nonMovementAbilities = abilities.filter(
    a => (a.quantity ?? 1) > 0 && !isMovementModifierAbility(a)
  );

  if (requireAuto) {
    const autoTriggerAbilities = nonMovementAbilities.filter(
      a => a.triggerCondition !== 'manual_anytime'
    );
    if (autoTriggerAbilities.length > 0) {
      return autoTriggerAbilities;
    }
  }

  return nonMovementAbilities;
}
