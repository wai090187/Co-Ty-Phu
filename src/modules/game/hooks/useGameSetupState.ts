/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { SetupPlayerConfig } from './useGameState';
import { CHARACTERS } from '../../../data/characters';
import {
  DEFAULT_PLAYER_COLORS,
  INITIAL_PLAYER_CONFIGS,
} from '../constants/defaultSetup';
import { AIDifficulty } from '../../../types/game';

export const useGameSetupState = () => {
  const [playerConfigs, setPlayerConfigs] = useState<SetupPlayerConfig[]>(INITIAL_PLAYER_CONFIGS);
  const [pickingCharacterPlayerIdx, setPickingCharacterPlayerIdx] = useState<number | null>(null);

  const handlePlayerCountChange = (count: number) => {
    if (count < 2 || count > 6) return;
    const updated = [...playerConfigs];
    while (updated.length < count) {
      const idx = updated.length;
      const defaultAiLevel: AIDifficulty =
        idx % 3 === 0 ? 'hard' : idx % 2 === 0 ? 'medium' : 'easy';
      updated.push({
        name: `AI ${idx + 1} (${
          defaultAiLevel === 'easy' ? 'Dễ' : defaultAiLevel === 'medium' ? 'TB' : 'Khó'
        })`,
        isAI: true,
        aiLevel: defaultAiLevel,
        characterId: CHARACTERS[idx % CHARACTERS.length].id,
        color: DEFAULT_PLAYER_COLORS[idx % DEFAULT_PLAYER_COLORS.length],
      });
    }
    while (updated.length > count) updated.pop();
    setPlayerConfigs(updated);
  };

  const updatePlayerConfig = (index: number, updates: Partial<SetupPlayerConfig>) => {
    setPlayerConfigs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      if (updates.isAI !== undefined || updates.aiLevel !== undefined) {
        if (next[index].isAI) {
          const lvl = next[index].aiLevel || 'medium';
          next[index].name = `AI ${index + 1} (${
            lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'TB' : 'Khó'
          })`;
        }
      }
      return next;
    });
  };

  return {
    playerConfigs,
    setPlayerConfigs,
    pickingCharacterPlayerIdx,
    setPickingCharacterPlayerIdx,
    handlePlayerCountChange,
    updatePlayerConfig,
  };
};
