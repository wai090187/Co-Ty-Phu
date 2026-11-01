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
import { applyLoadedGameState, extractCurrentSaveState } from '../modules/game/utils/saveStateHelper';

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
    setChanceDeck: state.setChanceDeck,
    setChestDeck: state.setChestDeck,
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
    cheatNextChanceCardId: state.cheatNextChanceCardId,
    setCheatNextChanceCardId: state.setCheatNextChanceCardId,
    cheatNextChestCardId: state.cheatNextChestCardId,
    setCheatNextChestCardId: state.setCheatNextChestCardId,
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
  const { executeDrawnCard } = useCardActions({
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
    chanceDeck: state.chanceDeck,
    chestDeck: state.chestDeck,
    setPlayers: state.setPlayers,
    setConsumableShop: state.setConsumableShop,
    setPermanentShop: state.setPermanentShop,
    setChanceDeck: state.setChanceDeck,
    setChestDeck: state.setChestDeck,
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

  const loadSavedGame = useCallback((save: any) => {
    applyLoadedGameState(state, save);
  }, [state]);

  const getCurrentSaveState = useCallback((configs: SetupPlayerConfig[]) => {
    return extractCurrentSaveState(state, configs);
  }, [state]);

  // Use Free Jail Card
  const useGetOutOfJailCard = useCallback((playerId?: number) => {
    const targetId = playerId ?? activePlayer?.id;
    if (!targetId) return;

    sounds.ability();
    state.setPlayers(prev =>
      prev.map(p => {
        if (p.id === targetId && p.getOutOfJailCards > 0 && p.inJail) {
          return {
            ...p,
            inJail: false,
            jailTurns: 0,
            getOutOfJailCards: p.getOutOfJailCards - 1,
          };
        }
        return p;
      })
    );

    const p = state.players.find(x => x.id === targetId);
    if (p) {
      const isInv = state.settings.jailMode === 'investigation';
      const msg = isInv
        ? `🎟️ ${p.name} sử dụng [Thẻ Ra Tù Miễn Phí] để xóa bỏ tình trạng điều tra!`
        : `🎟️ ${p.name} sử dụng [Thẻ Ra Tù Miễn Phí] để thoát khỏi nhà tù ngay lập tức!`;
      state.addLog(msg, 'jail');
      triggerCharacterEvent(
        p.id,
        'cleared_investigation',
        'happy',
        'Dùng Thẻ Ra Tù',
        msg
      );
    }
  }, [activePlayer, state, triggerCharacterEvent]);

  // Cheat Mode Methods
  const cheatTogglePropertyOwner = useCallback(
    (playerId: number, tileId: number) => {
      state.setPlayers(prev => {
        const targetP = prev.find(p => p.id === playerId);
        if (!targetP) return prev;
        const isOwnedByTarget = targetP.propertiesOwned.includes(tileId);

        const next = prev.map(p => {
          const hasIt = p.propertiesOwned.includes(tileId);
          if (p.id === playerId) {
            if (isOwnedByTarget) {
              const newProps = p.propertiesOwned.filter(id => id !== tileId);
              const newHouses = { ...p.houses };
              delete newHouses[tileId];
              const newMortgaged = { ...p.mortgaged };
              delete newMortgaged[tileId];
              return { ...p, propertiesOwned: newProps, houses: newHouses, mortgaged: newMortgaged };
            } else {
              return {
                ...p,
                propertiesOwned: [...p.propertiesOwned, tileId],
                houses: { ...p.houses, [tileId]: 0 },
              };
            }
          } else if (hasIt) {
            const newProps = p.propertiesOwned.filter(id => id !== tileId);
            const newHouses = { ...p.houses };
            delete newHouses[tileId];
            const newMortgaged = { ...p.mortgaged };
            delete newMortgaged[tileId];
            return { ...p, propertiesOwned: newProps, houses: newHouses, mortgaged: newMortgaged };
          }
          return p;
        });

        const tile = state.tiles[tileId];
        if (isOwnedByTarget) {
          state.addLog(
            `🛠️ [Cheat Test] Thu hồi ô [${tile?.name || tileId}] từ ${targetP.name} về Ngân Hàng`,
            'property'
          );
        } else {
          state.addLog(
            `🛠️ [Cheat Test] Gán ô đất [${tile?.name || tileId}] cho ${targetP.name}`,
            'property'
          );
        }
        return next;
      });
    },
    [state]
  );

  const cheatSetPropertyHouses = useCallback(
    (playerId: number, tileId: number, count: number) => {
      const clamped = Math.max(0, Math.min(5, count));
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            const owned = p.propertiesOwned.includes(tileId)
              ? p.propertiesOwned
              : [...p.propertiesOwned, tileId];
            return {
              ...p,
              propertiesOwned: owned,
              houses: { ...p.houses, [tileId]: clamped },
            };
          }
          return p;
        })
      );
      const tile = state.tiles[tileId];
      const p = state.players.find(x => x.id === playerId);
      state.addLog(
        `🛠️ [Cheat Test] Đổi cấp nhà của ${p?.name} tại [${tile?.name}] thành ${
          clamped === 5 ? 'Khách Sạn' : `${clamped} nhà`
        }`,
        'property'
      );
    },
    [state]
  );

  const cheatAddConsumable = useCallback(
    (playerId: number, abilityId: string) => {
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              consumableAbilities: [...p.consumableAbilities, abilityId],
            };
          }
          return p;
        })
      );
      const ab = state.consumableShop.find(a => a.id === abilityId);
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Thêm thẻ năng lực [${ab?.name || abilityId}] cho ${p?.name}`, 'ability');
    },
    [state]
  );

  const cheatRemoveConsumable = useCallback(
    (playerId: number, index: number) => {
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            const nextCards = [...p.consumableAbilities];
            nextCards.splice(index, 1);
            return { ...p, consumableAbilities: nextCards };
          }
          return p;
        })
      );
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Xóa 1 thẻ năng lực dùng 1 lần của ${p?.name}`, 'ability');
    },
    [state]
  );

  const cheatAddPermanent = useCallback(
    (playerId: number, abilityId: string) => {
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            if (p.permanentAbilities.includes(abilityId)) return p;
            return {
              ...p,
              permanentAbilities: [...p.permanentAbilities, abilityId],
            };
          }
          return p;
        })
      );
      const ab = state.permanentShop.find(a => a.id === abilityId);
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Thêm năng lực VIP [${ab?.name || abilityId}] cho ${p?.name}`, 'ability');
    },
    [state]
  );

  const cheatRemovePermanent = useCallback(
    (playerId: number, abilityId: string) => {
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              permanentAbilities: p.permanentAbilities.filter(id => id !== abilityId),
            };
          }
          return p;
        })
      );
      const ab = state.permanentShop.find(a => a.id === abilityId);
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Xóa năng lực VIP [${ab?.name || abilityId}] của ${p?.name}`, 'ability');
    },
    [state]
  );

  const cheatSetGetOutOfJailCards = useCallback(
    (playerId: number, count: number) => {
      const safeCount = Math.max(0, count);
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return { ...p, getOutOfJailCards: safeCount };
          }
          return p;
        })
      );
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Đặt số [Thẻ Ra Tù Miễn Phí] của ${p?.name} thành ${safeCount}`, 'jail');
    },
    [state]
  );

  const cheatSetCash = useCallback(
    (playerId: number, amount: number) => {
      const safeCash = Math.max(0, amount);
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return { ...p, cash: safeCash };
          }
          return p;
        })
      );
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Đặt số dư của ${p?.name} thành ${safeCash}đ`, 'money');
    },
    [state]
  );

  const cheatToggleJail = useCallback(
    (playerId: number) => {
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            const willBeInJail = !p.inJail;
            return {
              ...p,
              inJail: willBeInJail,
              position: willBeInJail ? 10 : p.position,
              jailTurns: 0,
            };
          }
          return p;
        })
      );
      const p = state.players.find(x => x.id === playerId);
      state.addLog(`🛠️ [Cheat Test] Đổi trạng thái tù/điều tra của ${p?.name}`, 'jail');
    },
    [state]
  );

  const cheatTeleportPlayer = useCallback(
    (playerId: number, targetTileId: number) => {
      state.setPlayers(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            return { ...p, position: (targetTileId + 40) % 40 };
          }
          return p;
        })
      );
      const p = state.players.find(x => x.id === playerId);
      const tile = state.tiles[targetTileId];
      state.addLog(`🛠️ [Cheat Test] Dịch chuyển ${p?.name} đến ô [${tile?.name || targetTileId}]`, 'info');
    },
    [state]
  );

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
    useGetOutOfJailCard,
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
    loadSavedGame,
    getCurrentSaveState,
    // Cheat Actions
    cheatTogglePropertyOwner,
    cheatSetPropertyHouses,
    cheatAddConsumable,
    cheatRemoveConsumable,
    cheatAddPermanent,
    cheatRemovePermanent,
    cheatSetGetOutOfJailCards,
    cheatSetCash,
    cheatToggleJail,
    cheatTeleportPlayer,
  };
};
