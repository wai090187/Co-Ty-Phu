/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, PermanentAbility, Card, GameSettings } from '../../types/game';
import {
  INITIAL_CONSUMABLE_ABILITIES,
  INITIAL_PERMANENT_ABILITIES,
} from '../../data/abilities';
import { INITIAL_CHANCE_CARDS, INITIAL_CHEST_CARDS } from '../../data/cards';
import {
  loadFullConfigUserDefault,
  SETTINGS_CACHE_KEY,
  USER_DEFAULT_SETTINGS_KEY,
  USER_DEFAULT_FULL_CONFIG_KEY,
  FullGameConfigPackage,
  loadUserDefaultSettings,
  clearUserDefaultSettings,
  saveFullConfigAsUserDefault,
  hasUserDefaultConfig,
  clearFullConfigUserDefault,
} from './userConfigDb';

export {
  SETTINGS_CACHE_KEY,
  USER_DEFAULT_SETTINGS_KEY,
  USER_DEFAULT_FULL_CONFIG_KEY,
  type FullGameConfigPackage,
  loadUserDefaultSettings,
  clearUserDefaultSettings,
  saveFullConfigAsUserDefault,
  loadFullConfigUserDefault,
  hasUserDefaultConfig,
  clearFullConfigUserDefault,
};

export const CONSUMABLES_DB_KEY = 'co_ty_phu_consumable_shop_db_v3';
export const PERMANENTS_DB_KEY = 'co_ty_phu_permanent_shop_db_v3';
export const CHANCE_DB_KEY = 'co_ty_phu_chance_deck_db_v3';
export const CHEST_DB_KEY = 'co_ty_phu_chest_deck_db_v3';


/**
 * Tải danh sách kỹ năng Dùng 1 Lần từ Database (localStorage).
 * Tự động hợp nhất (merge) các kỹ năng mặc định với các tùy chỉnh/kỹ năng mới do người chơi thiết kế.
 */
export const loadConsumablesDb = (): ConsumableAbility[] => {
  try {
    const raw = localStorage.getItem(CONSUMABLES_DB_KEY);
    if (raw) {
      const parsed: ConsumableAbility[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge: Giữ các kỹ năng người chơi đã sửa/thêm, đồng thời đảm bảo các kỹ năng mặc định mới vẫn xuất hiện nếu chưa có
        const existingIds = new Set(parsed.map(a => a.id));
        const newDefaults = INITIAL_CONSUMABLE_ABILITIES.filter(a => !existingIds.has(a.id));
        return [...parsed, ...newDefaults];
      }
    }
    // Fallback: Nếu chưa có key riêng, kiểm tra cấu hình mặc định toàn bộ của máy
    const fullDef = loadFullConfigUserDefault();
    if (fullDef && Array.isArray(fullDef.consumableShop) && fullDef.consumableShop.length > 0) {
      return fullDef.consumableShop;
    }
  } catch (err) {
    console.error('Failed to load consumables database:', err);
  }
  return INITIAL_CONSUMABLE_ABILITIES;
};

/**
 * Lưu danh sách kỹ năng Dùng 1 Lần vào Database (localStorage)
 */
export const saveConsumablesDb = (abilities: ConsumableAbility[]): void => {
  try {
    localStorage.setItem(CONSUMABLES_DB_KEY, JSON.stringify(abilities));
  } catch (err) {
    console.error('Failed to save consumables to database:', err);
  }
};

/**
 * Tải danh sách năng lực Vĩnh Viễn từ Database (localStorage)
 */
export const loadPermanentsDb = (): PermanentAbility[] => {
  try {
    const raw = localStorage.getItem(PERMANENTS_DB_KEY);
    if (raw) {
      const parsed: PermanentAbility[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map(a => a.id));
        const newDefaults = INITIAL_PERMANENT_ABILITIES.filter(a => !existingIds.has(a.id));
        return [...parsed, ...newDefaults];
      }
    }
    // Fallback: Kiểm tra cấu hình mặc định toàn bộ của máy
    const fullDef = loadFullConfigUserDefault();
    if (fullDef && Array.isArray(fullDef.permanentShop) && fullDef.permanentShop.length > 0) {
      return fullDef.permanentShop;
    }
  } catch (err) {
    console.error('Failed to load permanents database:', err);
  }
  return INITIAL_PERMANENT_ABILITIES;
};

/**
 * Lưu danh sách năng lực Vĩnh Viễn vào Database (localStorage)
 */
export const savePermanentsDb = (abilities: PermanentAbility[]): void => {
  try {
    localStorage.setItem(PERMANENTS_DB_KEY, JSON.stringify(abilities));
  } catch (err) {
    console.error('Failed to save permanents to database:', err);
  }
};

/**
 * Tải bộ thẻ Cơ Hội từ Database
 */
export const loadChanceDeckDb = (): Card[] => {
  try {
    const raw = localStorage.getItem(CHANCE_DB_KEY);
    if (raw) {
      const parsed: Card[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => {
          if (c.id === 'ch-1') {
            const def = INITIAL_CHANCE_CARDS.find(x => x.id === 'ch-1');
            return def ? { ...c, description: def.description, title: def.title } : c;
          }
          return c;
        });
      }
    }
    // Fallback: Kiểm tra cấu hình mặc định toàn bộ của máy
    const fullDef = loadFullConfigUserDefault();
    if (fullDef && Array.isArray(fullDef.chanceDeck) && fullDef.chanceDeck.length > 0) {
      return fullDef.chanceDeck;
    }
  } catch (err) {
    console.error('Failed to load chance deck database:', err);
  }
  return INITIAL_CHANCE_CARDS;
};

export const saveChanceDeckDb = (cards: Card[]): void => {
  try {
    localStorage.setItem(CHANCE_DB_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save chance deck to database:', err);
  }
};

/**
 * Tải bộ thẻ Khí Vận từ Database
 */
export const loadChestDeckDb = (): Card[] => {
  try {
    const raw = localStorage.getItem(CHEST_DB_KEY);
    if (raw) {
      const parsed: Card[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => {
          if (c.id === 'cs-10') {
            const def = INITIAL_CHEST_CARDS.find(x => x.id === 'cs-10');
            return def ? { ...c, description: def.description, title: def.title } : c;
          }
          return c;
        });
      }
    }
    // Fallback: Kiểm tra cấu hình mặc định toàn bộ của máy
    const fullDef = loadFullConfigUserDefault();
    if (fullDef && Array.isArray(fullDef.chestDeck) && fullDef.chestDeck.length > 0) {
      return fullDef.chestDeck;
    }
  } catch (err) {
    console.error('Failed to load chest deck database:', err);
  }
  return INITIAL_CHEST_CARDS;
};

export const saveChestDeckDb = (cards: Card[]): void => {
  try {
    localStorage.setItem(CHEST_DB_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save chest deck to database:', err);
  }
};

/**
 * Khôi phục toàn bộ năng lực và thẻ bài về mặc định ban đầu của trò chơi
 */
export const resetAbilitiesDbToDefault = (): {
  consumables: ConsumableAbility[];
  permanents: PermanentAbility[];
  chance: Card[];
  chest: Card[];
} => {
  try {
    localStorage.removeItem(CONSUMABLES_DB_KEY);
    localStorage.removeItem(PERMANENTS_DB_KEY);
    localStorage.removeItem(CHANCE_DB_KEY);
    localStorage.removeItem(CHEST_DB_KEY);
  } catch (err) {
    console.error('Failed to reset abilities database:', err);
  }
  return {
    consumables: INITIAL_CONSUMABLE_ABILITIES,
    permanents: INITIAL_PERMANENT_ABILITIES,
    chance: INITIAL_CHANCE_CARDS,
    chest: INITIAL_CHEST_CARDS,
  };
};

/**
 * Lưu cấu hình cài đặt hiện tại làm MẶC ĐỊNH của máy này
 */
export const saveSettingsAsUserDefault = (settings: GameSettings): void => {
  try {
    localStorage.setItem(USER_DEFAULT_SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save user default settings:', err);
  }
};

