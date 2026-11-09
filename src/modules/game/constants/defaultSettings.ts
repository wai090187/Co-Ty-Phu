/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings } from '../../../types/game';
import { loadUserDefaultSettings } from '../../storage/abilitiesDb';
import { SYSTEM_DEFAULT_SETTINGS } from '../../settings/constants/systemDefaults';

export const DEFAULT_SETTINGS: GameSettings = SYSTEM_DEFAULT_SETTINGS;

export const SETTINGS_STORAGE_KEY = 'co_ty_phu_settings_cache_v3';

export const loadCachedSettings = (): GameSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.vacantLandRentPercent === 20) {
        parsed.vacantLandRentPercent = 100;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    const userDef = loadUserDefaultSettings();
    if (userDef) {
      if (userDef.vacantLandRentPercent === 20) {
        userDef.vacantLandRentPercent = 100;
      }
      return { ...DEFAULT_SETTINGS, ...userDef };
    }
  } catch (e) {
    console.error('Failed to load cached settings', e);
  }
  return DEFAULT_SETTINGS;
};
