export type TileType = 
  | 'property'
  | 'station'
  | 'utility'
  | 'tax'
  | 'chance'
  | 'chest'
  | 'corner';

export type CornerType = 'go' | 'jail' | 'parking' | 'gotojail';

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  colorGroup?: string;
  colorHex?: string;
  price?: number;
  rentBase?: number;
  houseCost?: number;
  rents?: [number, number, number, number, number, number]; // [Base, 1 House, 2 Houses, 3 Houses, 4 Houses, Hotel]
  cornerType?: CornerType;
  icon?: string;
  taxAmount?: number;
  subText?: string;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Character {
  id: string;
  name: string;
  title: string;
  style: 'retro' | 'anime' | 'gothic' | 'steampunk' | 'chibi' | 'cyberpunk' | 'royal';
  description: string;
  quote: string;
  themeColor: string;
  avatarSvg: string;
}

export interface Player {
  id: number;
  name: string;
  isAI: boolean;
  aiLevel?: AIDifficulty;
  characterId: string;
  color: string;
  cash: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  bankrupt: boolean;
  consumableAbilities: string[]; // Ability IDs (max 3)
  permanentAbilities: string[];  // Ability IDs
  propertiesOwned: number[];     // Tile IDs
  houses: Record<number, number>; // tileId -> 0..5 (5 is hotel)
  mortgaged: Record<number, boolean>;
  hasFreeTaxNextTurn?: boolean;
  hasHalfRentDiscountNextTurn?: boolean;
  lastDiceRoll?: [number, number];
  emotion?: 'happy' | 'sad' | 'neutral' | 'action';
  emotionMessage?: string;
  emotionTimestamp?: number;
}

export type TriggerCondition = 
  | 'when_roll_dice'
  | 'when_neighbor'
  | 'when_land_corner'
  | 'when_pay_tax'
  | 'when_pay_rent'
  | 'when_visit_station'
  | 'manual_anytime';

export interface ConsumableAbility {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  triggerCondition: TriggerCondition;
  effectType: 
    | 'dice_boost' 
    | 'dice_reduce' 
    | 'free_tax' 
    | 'half_rent' 
    | 'send_to_jail_neighbor' 
    | 'push_neighbor' 
    | 'destroy_house' 
    | 'draw_both_cards' 
    | 'direct_jail_target'
    | 'custom';
  effectValue: number; // Con số tương ứng riêng biệt
  value?: number;
  quantity: number; // Số lượng thẻ có sẵn (nếu = 0 thì không xuất hiện)
}

export interface PermanentAbility {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  triggerCondition: TriggerCondition;
  effectType: 
    | 'steal_neighbor_cash' 
    | 'permanent_free_tax' 
    | 'corner_bonus' 
    | 'station_discount'
    | 'custom';
  effectValue: number; // Con số tương ứng riêng biệt
  value?: number;
  quantity: number; // Số lượng có sẵn trong shop (nếu = 0 thì không xuất hiện)
}

export interface Card {
  id: string;
  deck: 'chance' | 'chest';
  title: string;
  description: string;
  actionType: 
    | 'cash_bonus' 
    | 'cash_penalty' 
    | 'move_to' 
    | 'move_relative' 
    | 'go_to_jail' 
    | 'get_out_of_jail' 
    | 'house_repair' 
    | 'birthday';
  value?: number;
  targetTileId?: number;
  quantity: number; // Số lượng thẻ trong bộ bài (nếu = 0 thì không xuất hiện)
}

export interface GameSettings {
  startingCash: number;
  goExactBonus: number;
  goPassBonus: number;
  bailFeeBase: number;
  bailFeeRound10: number;
  bailFeeRound20: number;
  sameColorRentBoostPercent: number; // +10% per same color owned
  jailRentPercent: number;           // 50%
  maxConsumableAbilities: number;    // 3
  soundEnabled: boolean;
  moveSpeed: 'slow' | 'normal' | 'fast'; // Chậm (hồi hộp), Vừa, Nhanh

  // Custom rules:
  jailVisitReward: number;           // Số tiền thăm tù (mặc định 100đ)
  bailMultiplierTurn1: number;       // Hệ số nhân tiền bảo lãnh lượt 1 (0 = không được, >0 = nhân)
  bailMultiplierTurn2: number;       // Hệ số nhân tiền bảo lãnh lượt 2 (mặc định 2 = x2)
  bailMultiplierTurn3: number;       // Hệ số nhân tiền bảo lãnh lượt 3 (mặc định 1 = x1)
  vacantLandRentPercent: number;     // % Số tiền thuế cho đất trống theo giá đất (mặc định 10%)

  // New Investigation (Bị công an điều tra) mode settings:
  jailMode: 'prison' | 'investigation'; // 'prison': Vào tù nhốt | 'investigation': Bị công an điều tra vì buôn bán nhà ở trái phép
  investigationIncomePenaltyPercent: number; // Giảm % tiền nhận được khi đang bị điều tra (mặc định 50%)
  investigationFeePenaltyPercent: number;    // Tăng % tiền phạt/thuế/tiền thuê phải trả khi đang bị điều tra (mặc định 50%)
}

export interface CashTransferEvent {
  id: string;
  payerId?: number;      // undefined = Ngân Hàng
  receiverIds: number[];  // rỗng = Ngân Hàng
  amount: number;
  reason: string;
  timestamp: number;
}

export interface CharacterEvent {
  id: string;
  type: 
    | 'money_transfer' 
    | 'buy_property' 
    | 'upgrade_house' 
    | 'use_ability' 
    | 'open_inventory' 
    | 'investigation_jailed' 
    | 'cleared_investigation';
  playerId: number;
  emotion: 'happy' | 'sad' | 'neutral' | 'action';
  title: string;
  message: string;
  subMessage?: string;
  amount?: number;
  relatedPlayerId?: number;
  timestamp: number;
}

export interface AbilityNotification {
  id: string;
  title: string;
  description: string;
  icon?: string;
  action: () => void;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'money' | 'jail' | 'action' | 'ability' | 'property';
  timestamp: number;
}
