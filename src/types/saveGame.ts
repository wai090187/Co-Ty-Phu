/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Card,
  ConsumableAbility,
  GameSettings,
  PermanentAbility,
  Player,
  Tile,
} from './game';
import { SetupPlayerConfig } from '../hooks/useMonopolyGame';

export interface SaveGameData {
  slotId: number; // 1, 2, or 3
  savedAt: number; // timestamp
  title: string;
  currentRound: number;
  turnIndex: number;
  players: Player[];
  settings: GameSettings;
  tiles: Tile[];
  chanceDeck: Card[];
  chestDeck: Card[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  hasMovedThisTurn: boolean;
  upgradesThisTurn: number;
  canRoll: boolean;
  playerConfigs: SetupPlayerConfig[];
}
