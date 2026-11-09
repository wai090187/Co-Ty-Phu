/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsumableAbility, PermanentAbility, Card, GameSettings } from '../../types/game';
import {
  saveSettingsAsUserDefault,
  saveChanceDeckDb,
  saveChestDeckDb,
  saveConsumablesDb,
  savePermanentsDb,
} from './abilitiesDb';

export const SETTINGS_CACHE_KEY = 'co_ty_phu_settings_cache_v3';
export const USER_DEFAULT_SETTINGS_KEY = 'co_ty_phu_user_default_settings_v3';
export const USER_DEFAULT_FULL_CONFIG_KEY = 'co_ty_phu_user_default_full_config_v3';

export interface FullGameConfigPackage {
  version: string;
  savedAt: string;
  settings: GameSettings;
  chanceDeck: Card[];
  chestDeck: Card[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
}

/**
 * Đọc cấu hình mặc định đã lưu của máy này (nếu có)
 */
export const loadUserDefaultSettings = (): GameSettings | null => {
  try {
    const raw = localStorage.getItem(USER_DEFAULT_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as GameSettings;
      }
    }
    const fullDef = loadFullConfigUserDefault();
    if (fullDef && fullDef.settings) {
      return fullDef.settings;
    }
  } catch (err) {
    console.error('Failed to load user default settings:', err);
  }
  return null;
};

/**
 * Xóa cấu hình mặc định đã lưu của máy này (khôi phục về mặc định gốc hệ thống)
 */
export const clearUserDefaultSettings = (): void => {
  try {
    localStorage.removeItem(USER_DEFAULT_SETTINGS_KEY);
  } catch (err) {
    console.error('Failed to clear user default settings:', err);
  }
};

/**
 * Lưu TOÀN BỘ CẤU HÌNH GAME (Cài Đặt + Thẻ Cơ Hội + Thẻ Khí Vận + Kỹ Năng 1 Lần + Năng Lực Vĩnh Viễn)
 * làm Mặc Định Riêng của máy này
 */
export const saveFullConfigAsUserDefault = (pkg: {
  settings: GameSettings;
  chanceDeck: Card[];
  chestDeck: Card[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
}): void => {
  try {
    const fullPackage: FullGameConfigPackage = {
      version: '1.5.0',
      savedAt: new Date().toISOString(),
      ...pkg,
    };
    localStorage.setItem(USER_DEFAULT_FULL_CONFIG_KEY, JSON.stringify(fullPackage));
    // Đồng bộ đồng thời vào các bảng lưu trữ độc lập
    saveSettingsAsUserDefault(pkg.settings);
    saveChanceDeckDb(pkg.chanceDeck);
    saveChestDeckDb(pkg.chestDeck);
    saveConsumablesDb(pkg.consumableShop);
    savePermanentsDb(pkg.permanentShop);
  } catch (err) {
    console.error('Failed to save full config as user default:', err);
  }
};

/**
 * Tải gói cấu hình mặc định toàn diện đã lưu của máy này (nếu có)
 */
export const loadFullConfigUserDefault = (): FullGameConfigPackage | null => {
  try {
    const raw = localStorage.getItem(USER_DEFAULT_FULL_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.settings) {
        return parsed as FullGameConfigPackage;
      }
    }
  } catch (err) {
    console.error('Failed to load full config user default:', err);
  }
  return null;
};

/**
 * Kiểm tra xem máy này đã từng lưu Mặc Định Riêng (toàn bộ hoặc cài đặt) chưa
 */
export const hasUserDefaultConfig = (): boolean => {
  return (
    !!localStorage.getItem(USER_DEFAULT_FULL_CONFIG_KEY) ||
    !!localStorage.getItem(USER_DEFAULT_SETTINGS_KEY)
  );
};

/**
 * Xóa gói cấu hình mặc định toàn diện của máy này
 */
export const clearFullConfigUserDefault = (): void => {
  try {
    localStorage.removeItem(USER_DEFAULT_FULL_CONFIG_KEY);
    clearUserDefaultSettings();
  } catch (err) {
    console.error('Failed to clear full config user default:', err);
  }
};
