import { useEffect, useCallback } from 'react';
import { Player, Tile } from '../types/game';
import { sounds } from '../utils/soundEngine';
import {
  getBaseBailFee,
  canPlayerPayBailCheck,
  calculatePropertyRent,
} from '../modules/property/utils/rentCalculator';
import { useGameState, SetupPlayerConfig } from '../modules/game/hooks/useGameState';
import { useGameEvents } from '../modules/game/hooks/useGameEvents';
import { useTurnManager } from '../modules/game/hooks/useTurnManager';
import { useTileLandingResolver } from '../modules/game/hooks/useTileLandingResolver';
import { useMovementController } from '../modules/game/hooks/useMovementController';
import { usePropertyActions } from '../modules/game/hooks/usePropertyActions';
import { useAbilityShopActions } from '../modules/game/hooks/useAbilityShopActions';
import { useCardActions } from '../modules/game/hooks/useCardActions';
import { useAIBotTurn } from '../modules/game/hooks/useAIBotTurn';

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
      calculatePropertyRent(tile, owner, state.tiles, state.settings),
    [state.tiles, state.settings]
  );

  // Hook 1: Tile landing resolver
  const { resolveTileLanding, handleBankrupt } = useTileLandingResolver({
    tiles: state.tiles,
    settings: state.settings,
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    permanentShop: state.permanentShop,
    consumableShop: state.consumableShop,
    pendingDestroyHouseNext: state.pendingDestroyHouseNext,
    setPendingDestroyHouseNext: state.setPendingDestroyHouseNext,
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
  });

  // Hook 2: Movement controller
  const { skipMovement, rollDice } = useMovementController({
    activePlayer,
    canRoll: state.canRoll,
    isRolling: state.isRolling,
    isMovingStepByStep: state.isMovingStepByStep,
    pendingDiceBoost: state.pendingDiceBoost,
    consecutiveDoubles: state.consecutiveDoubles,
    currentRound: state.currentRound,
    settings: state.settings,
    moveTimerRef: state.moveTimerRef,
    remainingStepsRef: state.remainingStepsRef,
    movingPlayerIdRef: state.movingPlayerIdRef,
    setDice: state.setDice,
    setIsRolling: state.setIsRolling,
    setCanRoll: state.setCanRoll,
    setPendingDiceBoost: state.setPendingDiceBoost,
    setConsecutiveDoubles: state.setConsecutiveDoubles,
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
      setActivePropertyModalTile: state.setActivePropertyModalTile,
      setIsLandingPropertyAction: state.setIsLandingPropertyAction,
      addLog: state.addLog,
      triggerCashTransfer,
      triggerCharacterEvent,
    });

  // Hook 4: Card operations
  const { executeDrawnCard } = useCardActions({
    activePlayer,
    setPlayers: state.setPlayers,
    setActiveDrawnCard: state.setActiveDrawnCard,
    addLog: state.addLog,
    triggerCashTransfer,
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
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    setPlayers: state.setPlayers,
    setActiveStationModal: state.setActiveStationModal,
    setActiveUtilityModal: state.setActiveUtilityModal,
    setActiveTargetAbility: state.setActiveTargetAbility,
    setPendingDiceBoost: state.setPendingDiceBoost,
    setPendingDestroyHouseNext: state.setPendingDestroyHouseNext,
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

  const { startNewGame, endTurn } = useTurnManager({
    turnIndex: state.turnIndex,
    currentRound: state.currentRound,
    startingCash: state.settings.startingCash,
    activePlayer,
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
    closeAllModals,
  });

  // Hook 6: AI Bot Loop
  useAIBotTurn({
    isPlaying: state.isPlaying,
    activePlayer,
    winner: state.winner,
    isMovingStepByStep: state.isMovingStepByStep,
    activeAbilityNotification: state.activeAbilityNotification,
    aiActionModalInfo: state.aiActionModalInfo,
    canRoll: state.canRoll,
    activePropertyModalTile: state.activePropertyModalTile,
    isLandingPropertyAction: state.isLandingPropertyAction,
    activeStationModal: state.activeStationModal,
    activeUtilityModal: state.activeUtilityModal,
    activeDrawnCard: state.activeDrawnCard,
    players: state.players,
    consumableShop: state.consumableShop,
    permanentShop: state.permanentShop,
    canPlayerPayBail,
    payBail,
    rollDice,
    buyProperty,
    buildHouse,
    setActivePropertyModalTile: state.setActivePropertyModalTile,
    setIsLandingPropertyAction: state.setIsLandingPropertyAction,
    buyConsumableAbility,
    buyPermanentAbility,
    setActiveStationModal: state.setActiveStationModal,
    setActiveUtilityModal: state.setActiveUtilityModal,
    setAiActionModalInfo: state.setAiActionModalInfo,
    endTurn,
  });

  const updateCardQuantity = (cardId: string, quantity: number) => {
    state.setChanceDeck(prev => prev.map(c => (c.id === cardId ? { ...c, quantity } : c)));
    state.setChestDeck(prev => prev.map(c => (c.id === cardId ? { ...c, quantity } : c)));
  };

  const updateConsumableQuantity = (abilityId: string, quantity: number) => {
    state.setConsumableShop(prev => prev.map(a => (a.id === abilityId ? { ...a, quantity } : a)));
  };

  const updatePermanentQuantity = (abilityId: string, quantity: number) => {
    state.setPermanentShop(prev => prev.map(a => (a.id === abilityId ? { ...a, quantity } : a)));
  };

  return {
    ...state,
    activePlayer,
    startNewGame,
    rollDice,
    skipMovement,
    endTurn,
    buyProperty,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
    canPlayerPayBail,
    buyConsumableAbility,
    buyPermanentAbility,
    sellPermanentAbility,
    useConsumableAbility,
    executeDrawnCard,
    getBaseBailFee: getBailFee,
    calculateRent,
    updateCardQuantity,
    updateConsumableQuantity,
    updatePermanentQuantity,
    triggerCashTransfer,
    triggerCharacterEvent,
  };
};
