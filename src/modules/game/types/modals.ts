import {
  AbilityNotification,
  Card,
  Character,
  ConsumableAbility,
  GameSettings,
  PermanentAbility,
  Player,
  Tile,
} from '../../../types/game';

export interface GameModalsProps {
  // Modals state
  activePropertyModalTile: Tile | null;
  activePropertyOwner?: Player;
  currentRent: number;
  isLandingPropertyAction: boolean;
  hasMovedThisTurn: boolean;
  upgradesThisTurn: number;
  activePlayer?: Player;
  players: Player[];
  tiles: Tile[];
  onBuyProperty: (tile: Tile) => void;
  onBuildHouse: (tile: Tile, useAbilityId?: string) => { success: boolean; message?: string };
  onMortgageProperty: (tile: Tile) => void;
  onUnmortgageProperty: (tile: Tile) => void;
  onClosePropertyModal: () => void;

  activeStationModal: Tile | null;
  offeredStationAbilities: ConsumableAbility[];
  consumableShop: ConsumableAbility[];
  onBuyConsumableAbility: (ability: ConsumableAbility, discardId?: string) => void;
  onCloseStationModal: () => void;

  activeUtilityModal: Tile | null;
  offeredUtilityAbilities: PermanentAbility[];
  permanentShop: PermanentAbility[];
  onBuyPermanentAbility: (ability: PermanentAbility) => void;
  onSellPermanentAbility: (ability: PermanentAbility) => void;
  onCloseUtilityModal: () => void;

  activeDrawnCard: Card | null;
  onExecuteDrawnCard: (card: Card) => void;
  onCloseDrawnCard: () => void;

  showInventoryPlayerId: number | null;
  onUseConsumableAbility: (ability: ConsumableAbility, target?: Player) => void;
  onCloseInventory: () => void;
  canRoll: boolean;

  showSettings: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  chanceDeck: Card[];
  chestDeck: Card[];
  onUpdateCardQuantity: (cardId: string, quantity: number) => void;
  onAddCustomCard: (card: Card) => void;
  onUpdateConsumableQuantity: (abilityId: string, quantity: number) => void;
  onUpdatePermanentQuantity: (abilityId: string, quantity: number) => void;
  onAddCustomConsumable: (ability: ConsumableAbility) => void;
  onAddCustomPermanent: (ability: PermanentAbility) => void;
  onCloseSettings: () => void;

  pickingCharacterPlayerIdx: number | null;
  selectedCharacterId?: string;
  onSelectCharacter: (c: Character) => void;
  onCloseCharacterPicker: () => void;

  activeTargetAbility: ConsumableAbility | null;
  availableTargets: Player[];
  onSelectTargetPlayer: (target: Player) => void;
  onCancelTargetSelection: () => void;

  activeAbilityNotification: AbilityNotification | null;
  onDismissAbilityNotification: () => void;

  aiActionModalInfo: {
    aiPlayer: Player;
    title: string;
    message: string;
    type: 'card' | 'skill' | 'jail';
  } | null;
  onDismissAiActionModal: () => void;

  winner: Player | null;
  onRestartGame: () => void;
}
