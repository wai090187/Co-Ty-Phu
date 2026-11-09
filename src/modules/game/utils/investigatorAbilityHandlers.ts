/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestigatorAbilityExecutionContext } from './investigatorAbilityTypes';
import { handleInvestigatorBasicAbilities } from './investigatorBasicAbilities';
import { handleInvestigatorSpecialAbilities } from './investigatorSpecialAbilities';

export type { InvestigatorAbilityExecutionContext };

export function executeInvestigatorAbility(ctx: InvestigatorAbilityExecutionContext): void {
  // Try basic abilities (1 to 8)
  const handled = handleInvestigatorBasicAbilities(ctx);
  if (!handled) {
    // Try special abilities (9 to 16)
    handleInvestigatorSpecialAbilities(ctx);
  }
}
