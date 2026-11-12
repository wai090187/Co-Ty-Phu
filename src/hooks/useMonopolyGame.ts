/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useCallback } from 'react';
import { Player, Tile } from '../types/game';
import { sounds } from '../utils/soundEngine';
import { TILES } from '../data/tiles';
import { getBaseBailFee, canPlayerPayBailCheck, calculatePropertyRent } from '../modules/property/utils/rentCalculator';
import { useGameState, SetupPlayerConfig } from '../modules/game/hooks/useGameState';
import { useGameEvents } from '../modules/game/hooks/useGameEvents';
import { useTurnManager } from '../modules/game/hooks/useTurnManager';
import { useTileLandingResolver } from '../modules/game/hooks/useTileLandingResolver';
import { useMovementController } from '../modules/game/hooks/useMovementController';
import { usePropertyActions } from '../modules/game/hooks/usePropertyActions';
import { useAbilityShopActions } from '../modules/game/hooks/useAbilityShopActions';
import { useCardActions } from '../modules/game/hooks/useCardActions';
import { useCheatActions } from '../modules/game/hooks/useCheatActions';
import { useGameAutonomousLoops } from '../modules/game/hooks/useGameAutonomousLoops';
import { useGamePersistenceActions } from '../modules/game/hooks/useGamePersistenceActions';
import { useOutOfJailAction } from '../modules/game/hooks/useOutOfJailAction';

export type { SetupPlayerConfig };

export const useMonopolyGame = () => {
  const state = useGameState();
  const activePlayer = state.players[state.turnIndex] || null;

  // Sound sync
  useEffect(() => {
    sounds.setEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // Events
  const { triggerCashTransfer, triggerCharacterEvent } = useGameEvents({
    setCashTransferEvent: state.setCashTransferEvent,
    setCharacterEvent: state.setCharacterEvent,
    setPlayers: state.setPlayers,
    addLog: state.addLog,
  });

  // Bail & Rent Calculations
  const getBailFee = useCallback(
    () => getBaseBailFee(state.currentRound, state.settings),
    [state.currentRound, state.settings]
  );

  const canPlayerPayBail = useCallback(
    (player: Player) => canPlayerPayBailCheck(player, state.currentRound, state.settings),
    [state.currentRound, state.settings]
  );

  const calculateRent = useCallback(
    (tile: Tile, owner: Player) =>
      calculatePropertyRent(tile, owner, state.tiles, state.settings, state.investigator),
    [state.tiles, state.settings, state.investigator]
  );

  // Hook 1: Tile landing resolver
  const { resolveTileLanding, handleBankrupt } = useTileLandingResolver({
    tiles: state.tiles,
    settings: state.settings,
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    setChanceDeck: state.setChanceDeck,
    setChestDeck: state.setChestDeck,
    permanentShop: state.permanentShop,
    consumableShop: state.consumableShop,
    pendingDestroyHousePlayerId: state.pendingDestroyHousePlayerId,
    setPendingDestroyHousePlayerId: state.setPendingDestroyHousePlayerId,
    setHasMovedThisTurn: state.setHasMovedThisTurn,
    setPlayers: state.setPlayers,
    addLog: state.addLog,
    triggerCashTransfer,
    triggerCharacterEvent,
    setWinner: state.setWinner,
    setActivePropertyModalTile: state.setActivePropertyModalTile,
    setIsLandingPropertyAction: state.setIsLandingPropertyAction,
    setActiveStationModal: state.setActiveStationModal,
    setOfferedStationAbilities: state.setOfferedStationAbilities,
    setActiveUtilityModal: state.setActiveUtilityModal,
    setOfferedUtilityAbilities: state.setOfferedUtilityAbilities,
    setActiveAbilityNotification: state.setActiveAbilityNotification,
    setActiveDrawnCard: state.setActiveDrawnCard,
    cheatNextChanceCardId: state.cheatNextChanceCardId,
    setCheatNextChanceCardId: state.setCheatNextChanceCardId,
    cheatNextChestCardId: state.cheatNextChestCardId,
    setCheatNextChestCardId: state.setCheatNextChestCardId,
    investigator: state.investigator,
  });

  // Hook 2: Movement controller
  const { skipMovement, rollDice, movePlayerSteps } = useMovementController({
    activePlayer,
    canRoll: state.canRoll,
    isRolling: state.isRolling,
    isMovingStepByStep: state.isMovingStepByStep,
    pendingDiceBoost: state.pendingDiceBoost,
    consecutiveDoubles: state.consecutiveDoubles,
    currentRound: state.currentRound,
    settings: state.settings,
    cheatNextDice: state.cheatNextDice,
    setCheatNextDice: state.setCheatNextDice,
    moveTimerRef: state.moveTimerRef,
    remainingStepsRef: state.remainingStepsRef,
    movingPlayerIdRef: state.movingPlayerIdRef,
    setDice: state.setDice,
    setIsRolling: state.setIsRolling,
    setCanRoll: state.setCanRoll,
    setPendingDiceBoost: state.setPendingDiceBoost,
    setConsecutiveDoubles: state.setConsecutiveDoubles,
    setHasPendingExtraRoll: state.setHasPendingExtraRoll,
    setIsMovingStepByStep: state.setIsMovingStepByStep,
    setPlayers: state.setPlayers,
    addLog: state.addLog,
    triggerCashTransfer,
    triggerCharacterEvent,
    resolveTileLanding,
    handleBankrupt,
  });

  // Hook 3: Property operations
  const { buyProperty, buildHouse, mortgageProperty, unmortgageProperty, payBail } =
    usePropertyActions({
      activePlayer,
      hasMovedThisTurn: state.hasMovedThisTurn,
      upgradesThisTurn: state.upgradesThisTurn,
      currentRound: state.currentRound,
      settings: state.settings,
      setPlayers: state.setPlayers,
      setUpgradesThisTurn: state.setUpgradesThisTurn,
      setConsumableShop: state.setConsumableShop,
      setActivePropertyModalTile: state.setActivePropertyModalTile,
      setIsLandingPropertyAction: state.setIsLandingPropertyAction,
      addLog: state.addLog,
      triggerCashTransfer,
      triggerCharacterEvent,
    });

  // Hook 4: Card operations
  const { executeDrawnCard, skipDrawnCard } = useCardActions({
    activePlayer,
    settings: state.settings,
    setPlayers: state.setPlayers,
    setActiveDrawnCard: state.setActiveDrawnCard,
    addLog: state.addLog,
    triggerCashTransfer,
    triggerCharacterEvent,
    resolveTileLanding,
    handleBankrupt,
  });

  // Hook 5: Ability operations
  const {
    buyConsumableAbility,
    buyPermanentAbility,
    sellPermanentAbility,
    useConsumableAbility,
  } = useAbilityShopActions({
    activePlayer,
    tiles: state.tiles,
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    canRoll: state.canRoll,
    hasMovedThisTurn: state.hasMovedThisTurn,
    movePlayerSteps,
    setUpgradesThisTurn: state.setUpgradesThisTurn,
    setHasMovedThisTurn: state.setHasMovedThisTurn,
    setPlayers: state.setPlayers,
    setConsumableShop: state.setConsumableShop,
    permanentShop: state.permanentShop,
    setPermanentShop: state.setPermanentShop,
    setChanceDeck: state.setChanceDeck,
    setChestDeck: state.setChestDeck,
    setActiveStationModal: state.setActiveStationModal,
    setActiveUtilityModal: state.setActiveUtilityModal,
    setActiveTargetAbility: state.setActiveTargetAbility,
    setPendingDiceBoost: state.setPendingDiceBoost,
    setPendingDestroyHousePlayerId: state.setPendingDestroyHousePlayerId,
    addLog: state.addLog,
    triggerCashTransfer,
    triggerCharacterEvent,
    resolveTileLanding,
    executeDrawnCard,
  });

  // Turn management (start & end)
  const closeAllModals = useCallback(() => {
    state.setActivePropertyModalTile(null);
    state.setIsLandingPropertyAction(false);
    state.setActiveStationModal(null);
    state.setActiveUtilityModal(null);
    state.setActiveDrawnCard(null);
    state.setActiveAbilityNotification(null);
    state.setAiActionModalInfo(null);
  }, [state]);

  const { startNewGame, endTurn, returnToMainMenu: returnToMainMenuInternal } = useTurnManager({
    turnIndex: state.turnIndex,
    currentRound: state.currentRound,
    startingCash: state.settings.startingCash,
    activePlayer,
    settings: state.settings,
    setInvestigator: state.setInvestigator,
    setIsInvestigatorTurn: state.setIsInvestigatorTurn,
    setPlayers: state.setPlayers,
    setCurrentRound: state.setCurrentRound,
    setTurnIndex: state.setTurnIndex,
    setCanRoll: state.setCanRoll,
    setHasMovedThisTurn: state.setHasMovedThisTurn,
    setUpgradesThisTurn: state.setUpgradesThisTurn,
    setWinner: state.setWinner,
    setIsPlaying: state.setIsPlaying,
    setLogs: state.setLogs,
    addLog: state.addLog,
    setConsecutiveDoubles: state.setConsecutiveDoubles,
    setHasPendingExtraRoll: state.setHasPendingExtraRoll,
    closeAllModals,
  });

  const returnToMainMenu = useCallback(() => {
    if (state.moveTimerRef.current) {
      clearInterval(state.moveTimerRef.current);
      state.moveTimerRef.current = null;
    }
    state.setIsMovingStepByStep(false);
    state.setTiles(TILES.map(t => ({ ...t, owner: undefined, houses: 0, mortgaged: false })));
    state.setOfferedStationAbilities([]);
    state.setOfferedUtilityAbilities([]);
    state.setCashTransferEvent(null);
    state.setCharacterEvent(null);
    state.setPendingDiceBoost(0);
    state.setPendingDestroyHousePlayerId(null);
    returnToMainMenuInternal();
  }, [state, returnToMainMenuInternal]);

  // Background AI & Investigator loops
  useGameAutonomousLoops({
    state,
    activePlayer,
    canPlayerPayBail,
    payBail,
    rollDice,
    buyProperty,
    buildHouse,
    buyConsumableAbility,
    buyPermanentAbility,
    useConsumableAbility,
    endTurn,
    triggerCashTransfer,
  });

  const persistence = useGamePersistenceActions({ state });
  const { useGetOutOfJailCard } = useOutOfJailAction({ state, activePlayer, triggerCharacterEvent });

  const cheatActions = useCheatActions({
    setPlayers: state.setPlayers,
    tiles: state.tiles,
    consumableShop: state.consumableShop,
    permanentShop: state.permanentShop,
    addLog: state.addLog,
    resolveTileLanding,
  });

  return {
    ...state,
    activePlayer,
    startNewGame,
    returnToMainMenu,
    rollDice,
    skipMovement,
    endTurn,
    buyProperty,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
    canPlayerPayBail,
    useGetOutOfJailCard,
    buyConsumableAbility,
    buyPermanentAbility,
    sellPermanentAbility,
    useConsumableAbility,
    executeDrawnCard,
    skipDrawnCard,
    getBaseBailFee: getBailFee,
    calculateRent,
    ...persistence,
    triggerCashTransfer,
    triggerCharacterEvent,
    ...cheatActions,
  };
};
