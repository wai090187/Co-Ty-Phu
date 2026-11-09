/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Player } from '../../../types/game';
import { useAIBotTurn } from './useAIBotTurn';
import { useInvestigatorTurn } from './useInvestigatorTurn';

interface AutonomousLoopsContext {
  state: any;
  activePlayer: Player | null;
  canPlayerPayBail: (player: Player) => { canPay: boolean; cost?: number; reason?: string };
  payBail: () => void;
  rollDice: () => void;
  buyProperty: (t: any) => void;
  buildHouse: (t: any, useAbilityId?: string) => any;
  buyConsumableAbility: any;
  buyPermanentAbility: any;
  useConsumableAbility: any;
  endTurn: () => void;
  triggerCashTransfer: any;
  triggerCharacterEvent?: any;
}


export const useGameAutonomousLoops = ({
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
  triggerCharacterEvent,
}: AutonomousLoopsContext) => {

  // AI Bot Loop
  useAIBotTurn({
    isPlaying: state.isPlaying,
    settings: state.settings,
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
    useConsumableAbility,
    endTurn,
  });

  // Special Investigator Autonomous Loop
  useInvestigatorTurn({
    settings: state.settings,
    currentRound: state.currentRound,
    tiles: state.tiles,
    players: state.players,
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    investigator: state.investigator,
    setInvestigator: state.setInvestigator,
    isInvestigatorTurn: state.isInvestigatorTurn,
    setIsInvestigatorTurn: state.setIsInvestigatorTurn,
    isInvestigatorMoving: state.isInvestigatorMoving,
    setIsInvestigatorMoving: state.setIsInvestigatorMoving,
    setPlayers: state.setPlayers,
    addLog: state.addLog,
    triggerCashTransfer,
    triggerCharacterEvent: triggerCharacterEvent || (() => {}),
    setAiActionModalInfo: state.setAiActionModalInfo,
    setActiveDrawnCard: state.setActiveDrawnCard,
    onInvestigatorTurnComplete: () => {

      state.setCanRoll(true);
      state.setHasMovedThisTurn(false);
    },
  });

  // Double roll extra turn auto-grant effect
  useEffect(() => {
    if (
      state.hasPendingExtraRoll &&
      !state.isRolling &&
      !state.isMovingStepByStep &&
      !state.activePropertyModalTile &&
      !state.activeStationModal &&
      !state.activeUtilityModal &&
      !state.activeDrawnCard &&
      !state.activeAbilityNotification &&
      !state.aiActionModalInfo &&
      !state.isInvestigatorTurn &&
      !state.isInvestigatorMoving &&
      activePlayer &&
      !activePlayer.inJail &&
      !activePlayer.bankrupt
    ) {
      const timer = setTimeout(() => {
        state.setHasPendingExtraRoll(false);
        state.setCanRoll(true);
        state.setHasMovedThisTurn(false);
        state.addLog(
          `🎲✨ [Lượt Tung Tiếp] ${activePlayer.name} vừa tung được xúc xắc đôi, được tiếp tục tung xúc xắc!`,
          'ability'
        );
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [
    state.hasPendingExtraRoll,
    state.isRolling,
    state.isMovingStepByStep,
    state.activePropertyModalTile,
    state.activeStationModal,
    state.activeUtilityModal,
    state.activeDrawnCard,
    state.activeAbilityNotification,
    state.aiActionModalInfo,
    state.isInvestigatorTurn,
    state.isInvestigatorMoving,
    activePlayer,
    state,
  ]);
};
