import { useState, useCallback, useRef } from 'react';
import {
  Tile,
  Player,
  Card,
  ConsumableAbility,
  PermanentAbility,
  GameSettings,
  LogEntry,
  AIDifficulty,
  AbilityNotification,
  CashTransferEvent,
  CharacterEvent,
  SpecialInvestigatorState,
} from '../../../types/game';
import { TILES } from '../../board/data/tiles';
import {
  loadConsumablesDb,
  saveConsumablesDb,
  loadPermanentsDb,
  savePermanentsDb,
  loadChanceDeckDb,
  saveChanceDeckDb,
  loadChestDeckDb,
  saveChestDeckDb,
  resetAbilitiesDbToDefault,
} from '../../storage/abilitiesDb';

export interface SetupPlayerConfig {
  name: string;
  isAI: boolean;
  aiLevel?: AIDifficulty;
  characterId: string;
  color: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
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
  moveSpeed: 'normal',
  jailVisitReward: 100,
  bailMultiplierTurn1: 0,
  bailMultiplierTurn2: 2,
  bailMultiplierTurn3: 1,
  vacantLandRentPercent: 20,
  jailMode: 'investigation',
  investigationIncomePenaltyPercent: 50,
  investigationFeePenaltyPercent: 50,
  aiTurnDelay: 2.0,
  dramaticDiceRoll: true,
  alwaysShowSidePanels: true,
  enableSpecialInvestigator: true,
  investigatorStartRound: 2,
  investigatorAbilityChangeRounds: 1,
};

const SETTINGS_STORAGE_KEY = 'co_ty_phu_settings_cache_v3';

const loadCachedSettings = (): GameSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    const userDefRaw = localStorage.getItem('co_ty_phu_user_default_settings_v3');
    if (userDefRaw) {
      const userDef = JSON.parse(userDefRaw);
      return { ...DEFAULT_SETTINGS, ...userDef };
    }
  } catch (e) {
    console.error('Failed to load cached settings', e);
  }
  return DEFAULT_SETTINGS;
};

export const useGameState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);

  const [settings, setSettingsInternal] = useState<GameSettings>(loadCachedSettings);

  const setSettings = useCallback((newSettings: GameSettings | ((prev: GameSettings) => GameSettings)) => {
    setSettingsInternal(prev => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to cache settings', e);
      }
      return next;
    });
  }, []);

  const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);
  const [upgradesThisTurn, setUpgradesThisTurn] = useState(0);

  const [tiles, setTiles] = useState<Tile[]>(TILES);

  // Persistent Database-backed Decks & Ability Shops
  const [chanceDeck, setChanceDeckInternal] = useState<Card[]>(loadChanceDeckDb);
  const setChanceDeck = useCallback((newCards: Card[] | ((prev: Card[]) => Card[])) => {
    setChanceDeckInternal(prev => {
      const next = typeof newCards === 'function' ? newCards(prev) : newCards;
      saveChanceDeckDb(next);
      return next;
    });
  }, []);

  const [chestDeck, setChestDeckInternal] = useState<Card[]>(loadChestDeckDb);
  const setChestDeck = useCallback((newCards: Card[] | ((prev: Card[]) => Card[])) => {
    setChestDeckInternal(prev => {
      const next = typeof newCards === 'function' ? newCards(prev) : newCards;
      saveChestDeckDb(next);
      return next;
    });
  }, []);

  const [consumableShop, setConsumableShopInternal] = useState<ConsumableAbility[]>(loadConsumablesDb);
  const setConsumableShop = useCallback(
    (newAbilities: ConsumableAbility[] | ((prev: ConsumableAbility[]) => ConsumableAbility[])) => {
      setConsumableShopInternal(prev => {
        const next = typeof newAbilities === 'function' ? newAbilities(prev) : newAbilities;
        saveConsumablesDb(next);
        return next;
      });
    },
    []
  );

  const [permanentShop, setPermanentShopInternal] = useState<PermanentAbility[]>(loadPermanentsDb);
  const setPermanentShop = useCallback(
    (newAbilities: PermanentAbility[] | ((prev: PermanentAbility[]) => PermanentAbility[])) => {
      setPermanentShopInternal(prev => {
        const next = typeof newAbilities === 'function' ? newAbilities(prev) : newAbilities;
        savePermanentsDb(next);
        return next;
      });
    },
    []
  );

  const resetAbilitiesToDefault = useCallback(() => {
    const def = resetAbilitiesDbToDefault();
    setConsumableShopInternal(def.consumables);
    setPermanentShopInternal(def.permanents);
    setChanceDeckInternal(def.chance);
    setChestDeckInternal(def.chest);
  }, []);

  // Special Investigator State (Người chơi ẩn: Điều Tra Viên)
  const [investigator, setInvestigator] = useState<SpecialInvestigatorState>({
    enabled: true,
    active: false,
    position: 0,
    lapsCompleted: 0,
    currentAbilityId: 'inv_compensate_neighbor',
    usedAbilityIds: ['inv_compensate_neighbor'],
  });
  const [isInvestigatorMoving, setIsInvestigatorMoving] = useState(false);
  const [isInvestigatorTurn, setIsInvestigatorTurn] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [consecutiveDoubles, setConsecutiveDoubles] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);

  const [isMovingStepByStep, setIsMovingStepByStep] = useState(false);
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingStepsRef = useRef<number>(0);
  const movingPlayerIdRef = useRef<number | null>(null);

  const [activePropertyModalTile, setActivePropertyModalTile] = useState<Tile | null>(null);
  const [isLandingPropertyAction, setIsLandingPropertyAction] = useState(false);
  const [activeStationModal, setActiveStationModal] = useState<Tile | null>(null);
  const [activeUtilityModal, setActiveUtilityModal] = useState<Tile | null>(null);
  const [offeredStationAbilities, setOfferedStationAbilities] = useState<ConsumableAbility[]>([]);
  const [offeredUtilityAbilities, setOfferedUtilityAbilities] = useState<PermanentAbility[]>([]);
  const [cashTransferEvent, setCashTransferEvent] = useState<CashTransferEvent | null>(null);
  const [characterEvent, setCharacterEvent] = useState<CharacterEvent | null>(null);
  const [activeDrawnCard, setActiveDrawnCard] = useState<Card | null>(null);
  const [activeTargetAbility, setActiveTargetAbility] = useState<ConsumableAbility | null>(null);
  const [activeAbilityNotification, setActiveAbilityNotification] =
    useState<AbilityNotification | null>(null);
  const [aiActionModalInfo, setAiActionModalInfo] = useState<{
    aiPlayer: Player;
    title: string;
    message: string;
    type: 'card' | 'skill' | 'jail';
  } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const [pendingDiceBoost, setPendingDiceBoost] = useState<number>(0);
  const [pendingDestroyHousePlayerId, setPendingDestroyHousePlayerId] = useState<number | null>(null);
  const [hasPendingExtraRoll, setHasPendingExtraRoll] = useState<boolean>(false);

  // Cheat Mode State
  const [isCheatModalOpen, setIsCheatModalOpen] = useState<boolean>(false);
  const [cheatSelectedPlayerId, setCheatSelectedPlayerId] = useState<number>(1);
  const [cheatNextDice, setCheatNextDice] = useState<[number, number] | null>(null);
  const [cheatNextChanceCardId, setCheatNextChanceCardId] = useState<string | null>(null);
  const [cheatNextChestCardId, setCheatNextChestCardId] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        text,
        type,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return {
    isPlaying,
    setIsPlaying,
    currentRound,
    setCurrentRound,
    turnIndex,
    setTurnIndex,
    settings,
    setSettings,
    hasMovedThisTurn,
    setHasMovedThisTurn,
    upgradesThisTurn,
    setUpgradesThisTurn,
    tiles,
    setTiles,
    chanceDeck,
    setChanceDeck,
    chestDeck,
    setChestDeck,
    consumableShop,
    setConsumableShop,
    permanentShop,
    setPermanentShop,
    players,
    setPlayers,
    dice,
    setDice,
    consecutiveDoubles,
    setConsecutiveDoubles,
    isRolling,
    setIsRolling,
    canRoll,
    setCanRoll,
    isMovingStepByStep,
    setIsMovingStepByStep,
    moveTimerRef,
    remainingStepsRef,
    movingPlayerIdRef,
    activePropertyModalTile,
    setActivePropertyModalTile,
    isLandingPropertyAction,
    setIsLandingPropertyAction,
    activeStationModal,
    setActiveStationModal,
    activeUtilityModal,
    setActiveUtilityModal,
    offeredStationAbilities,
    setOfferedStationAbilities,
    offeredUtilityAbilities,
    setOfferedUtilityAbilities,
    cashTransferEvent,
    setCashTransferEvent,
    characterEvent,
    setCharacterEvent,
    activeDrawnCard,
    setActiveDrawnCard,
    activeTargetAbility,
    setActiveTargetAbility,
    activeAbilityNotification,
    setActiveAbilityNotification,
    aiActionModalInfo,
    setAiActionModalInfo,
    winner,
    setWinner,
    pendingDiceBoost,
    setPendingDiceBoost,
    pendingDestroyHousePlayerId,
    setPendingDestroyHousePlayerId,
    hasPendingExtraRoll,
    setHasPendingExtraRoll,
    isCheatModalOpen,
    setIsCheatModalOpen,
    cheatSelectedPlayerId,
    setCheatSelectedPlayerId,
    cheatNextDice,
    setCheatNextDice,
    cheatNextChanceCardId,
    setCheatNextChanceCardId,
    cheatNextChestCardId,
    setCheatNextChestCardId,
    logs,
    setLogs,
    addLog,
    investigator,
    setInvestigator,
    isInvestigatorMoving,
    setIsInvestigatorMoving,
    isInvestigatorTurn,
    setIsInvestigatorTurn,
    resetAbilitiesToDefault,
  };
};
