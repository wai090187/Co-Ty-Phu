/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings } from '../../../types/game';

export const SYSTEM_DEFAULT_SETTINGS: GameSettings = {
  startingCash: 2000,
  goExactBonus: 400,
  goPassBonus: 200,
  bailFeeBase: 100,
  bailFeeRound10: 100,
  bailFeeRound20: 200,
  sameColorRentBoostPercent: 20,
  jailRentPercent: 50,
  maxConsumableAbilities: 3,
  soundEnabled: true,
  moveSpeed: 'normal' as const,
  jailVisitReward: 100,
  bailMultiplierTurn1: 0,
  bailMultiplierTurn2: 2,
  bailMultiplierTurn3: 1,
  vacantLandRentPercent: 100,
  jailMode: 'investigation' as const,
  investigationIncomePenaltyPercent: 50,
  investigationFeePenaltyPercent: 50,
  aiTurnDelay: 2.0,
  dramaticDiceRoll: true,
  alwaysShowSidePanels: true,
  enableSpecialInvestigator: true,
  investigatorStartRound: 2,
  investigatorAbilityChangeRounds: 1,
};
