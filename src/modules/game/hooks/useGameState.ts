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
} from '../../../types/game';
import { TILES } from '../../board/data/tiles';
import { INITIAL_CHANCE_CARDS, INITIAL_CHEST_CARDS } from '../../../data/cards';
import {
  INITIAL_CONSUMABLE_ABILITIES,
  INITIAL_PERMANENT_ABILITIES,
} from '../../../data/abilities';

export interface SetupPlayerConfig {
  name: string;
  isAI: boolean;
  aiLevel?: AIDifficulty;
  characterId: string;
  color: string;
}

export const useGameState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);

  const [settings, setSettings] = useState<GameSettings>({
    startingCash: 2000,
    goExactBonus: 400,
    goPassBonus: 200,
    bailFeeBase: 100,
    bailFeeRound10: 100,
    bailFeeRound20: 200,
    sameColorRentBoostPercent: 10,
    jailRentPercent: 50,
    maxConsumableAbilities: 3,
    soundEnabled: true,
    moveSpeed: 'normal',
    jailVisitReward: 100,
    bailMultiplierTurn1: 0,
    bailMultiplierTurn2: 2,
    bailMultiplierTurn3: 1,
    vacantLandRentPercent: 10,
    jailMode: 'prison',
    investigationIncomePenaltyPercent: 50,
    investigationFeePenaltyPercent: 50,
  });

  const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);
  const [upgradesThisTurn, setUpgradesThisTurn] = useState(0);

  const [tiles, setTiles] = useState<Tile[]>(TILES);
  const [chanceDeck, setChanceDeck] = useState<Card[]>(INITIAL_CHANCE_CARDS);
  const [chestDeck, setChestDeck] = useState<Card[]>(INITIAL_CHEST_CARDS);
  const [consumableShop, setConsumableShop] = useState<ConsumableAbility[]>(
    INITIAL_CONSUMABLE_ABILITIES
  );
  const [permanentShop, setPermanentShop] = useState<PermanentAbility[]>(
    INITIAL_PERMANENT_ABILITIES
  );

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
  const [pendingDestroyHouseNext, setPendingDestroyHouseNext] = useState<boolean>(false);

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
    pendingDestroyHouseNext,
    setPendingDestroyHouseNext,
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
  };
};
