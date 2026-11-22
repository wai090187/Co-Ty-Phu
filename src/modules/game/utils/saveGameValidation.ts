import type { SaveGameData } from '../../../types/saveGame';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every(isFiniteNumber);

const isPlayer = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  return (
    Number.isInteger(value.id) &&
    typeof value.name === 'string' &&
    typeof value.isAI === 'boolean' &&
    typeof value.characterId === 'string' &&
    typeof value.color === 'string' &&
    isFiniteNumber(value.cash) &&
    Number.isInteger(value.position) &&
    (value.position as number) >= 0 &&
    (value.position as number) < 40 &&
    typeof value.inJail === 'boolean' &&
    Number.isInteger(value.jailTurns) &&
    Number.isInteger(value.getOutOfJailCards) &&
    typeof value.bankrupt === 'boolean' &&
    isStringArray(value.consumableAbilities) &&
    isStringArray(value.permanentAbilities) &&
    isNumberArray(value.propertiesOwned) &&
    isRecord(value.houses) &&
    Object.values(value.houses).every(n => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 5) &&
    isRecord(value.mortgaged) &&
    Object.values(value.mortgaged).every(flag => typeof flag === 'boolean')
  );
};

const isTile = (value: unknown): boolean =>
  isRecord(value) &&
  Number.isInteger(value.id) &&
  typeof value.name === 'string' &&
  ['property', 'station', 'utility', 'tax', 'chance', 'chest', 'corner'].includes(String(value.type));

const isCard = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  (value.deck === 'chance' || value.deck === 'chest') &&
  typeof value.title === 'string' &&
  typeof value.description === 'string' &&
  typeof value.actionType === 'string' &&
  Number.isInteger(value.quantity);

const isAbility = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  isFiniteNumber(value.cost) &&
  Number.isInteger(value.quantity);

const isPlayerConfig = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  typeof value.isAI === 'boolean' &&
  typeof value.characterId === 'string' &&
  typeof value.color === 'string';

/** Validate persisted data before it is allowed to enter the live game state. */
export const isValidSaveGameData = (value: unknown): value is SaveGameData => {
  if (!isRecord(value)) return false;
  const players = value.players;
  const settings = value.settings;

  if (
    ![1, 2, 3, 99].includes(Number(value.slotId)) ||
    !isFiniteNumber(value.savedAt) ||
    typeof value.title !== 'string' ||
    !Number.isInteger(value.currentRound) ||
    (value.currentRound as number) < 1 ||
    !Array.isArray(players) ||
    players.length < 2 ||
    !players.every(isPlayer) ||
    new Set(players.map(player => (player as Record<string, unknown>).id)).size !== players.length ||
    !Number.isInteger(value.turnIndex) ||
    (value.turnIndex as number) < 0 ||
    (value.turnIndex as number) >= players.length ||
    !isRecord(settings) ||
    !isFiniteNumber(settings.startingCash) ||
    !isFiniteNumber(settings.goExactBonus) ||
    !isFiniteNumber(settings.goPassBonus) ||
    !['prison', 'investigation'].includes(String(settings.jailMode)) ||
    !['slow', 'normal', 'fast'].includes(String(settings.moveSpeed)) ||
    !Array.isArray(value.tiles) ||
    value.tiles.length !== 40 ||
    !value.tiles.every(isTile) ||
    !Array.isArray(value.chanceDeck) ||
    !value.chanceDeck.every(isCard) ||
    !Array.isArray(value.chestDeck) ||
    !value.chestDeck.every(isCard) ||
    !Array.isArray(value.consumableShop) ||
    !value.consumableShop.every(isAbility) ||
    !Array.isArray(value.permanentShop) ||
    !value.permanentShop.every(isAbility) ||
    typeof value.hasMovedThisTurn !== 'boolean' ||
    !Number.isInteger(value.upgradesThisTurn) ||
    (value.upgradesThisTurn as number) < 0 ||
    typeof value.canRoll !== 'boolean' ||
    !Array.isArray(value.playerConfigs) ||
    value.playerConfigs.length !== players.length ||
    !value.playerConfigs.every(isPlayerConfig)
  ) {
    return false;
  }

  return value.schemaVersion === undefined || value.schemaVersion === 1;
};

export const normalizeSaveGameData = (value: unknown): SaveGameData | null => {
  if (!isValidSaveGameData(value)) return null;
  return { ...value, schemaVersion: 1 };
};
