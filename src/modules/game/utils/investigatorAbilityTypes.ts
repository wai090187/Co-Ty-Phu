/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Tile, Card, GameSettings } from '../../../types/game';
import { InvestigatorAbility } from '../../../data/investigatorAbilities';

export interface InvestigatorAbilityExecutionContext {
  activeAbility: InvestigatorAbility;
  invPos: number;
  landedTile: Tile;
  nextPlayers: Player[];
  activeSurvivors: Player[];
  tiles: Tile[];
  chanceDeck: Card[];
  chestDeck: Card[];
  settings: GameSettings;
  triggerCashTransfer: (from: number, to: number[], amount: number, desc: string) => void;
  addLog: (text: string, type?: any) => void;
  setActiveDrawnCard?: (card: Card | null) => void;
  sounds: {
    cash: () => void;
    jail: () => void;
    buildHouse: () => void;
    ability: () => void;
    step: () => void;
    purchase: () => void;
  };
}
