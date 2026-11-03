/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SaveGameData } from '../../../types/saveGame';
import { SetupPlayerConfig } from '../hooks/useGameState';
import { sounds } from '../../../utils/soundEngine';

export const applyLoadedGameState = (state: any, save: SaveGameData) => {
  state.setCurrentRound(save.currentRound);
  state.setTurnIndex(save.turnIndex);
  state.setPlayers(save.players);
  state.setSettings(save.settings);
  state.setTiles(save.tiles);
  state.setChanceDeck(save.chanceDeck);
  state.setChestDeck(save.chestDeck);
  state.setConsumableShop(save.consumableShop);
  state.setPermanentShop(save.permanentShop);
  state.setHasMovedThisTurn(save.hasMovedThisTurn);
  state.setUpgradesThisTurn(save.upgradesThisTurn);
  state.setCanRoll(save.canRoll);
  state.setIsPlaying(true);
  state.setWinner(null);
  sounds.purchase();
  state.addLog(
    `💾 Đã tải thành công trận đấu từ Ô Lưu ${save.slotId}! Tiếp tục Vòng ${save.currentRound}.`,
    'info'
  );
};

export const extractCurrentSaveState = (state: any, configs: SetupPlayerConfig[]) => {
  return {
    currentRound: state.currentRound,
    turnIndex: state.turnIndex,
    players: state.players,
    settings: state.settings,
    tiles: state.tiles,
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    consumableShop: state.consumableShop,
    permanentShop: state.permanentShop,
    hasMovedThisTurn: state.hasMovedThisTurn,
    upgradesThisTurn: state.upgradesThisTurn,
    canRoll: state.canRoll,
    playerConfigs: configs,
  };
};
