/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, PermanentAbility } from '../types/game';
import { STANDARD_CONSUMABLE_ABILITIES } from './consumables/standardConsumables';
import { AUTOMATED_CONSUMABLE_ABILITIES } from './consumables/automatedConsumables';
import { INITIAL_PERMANENT_ABILITIES } from './permanentAbilities';

export const INITIAL_CONSUMABLE_ABILITIES: ConsumableAbility[] = [
  ...STANDARD_CONSUMABLE_ABILITIES,
  ...AUTOMATED_CONSUMABLE_ABILITIES,
];

export { INITIAL_PERMANENT_ABILITIES };
export type { ConsumableAbility, PermanentAbility };
