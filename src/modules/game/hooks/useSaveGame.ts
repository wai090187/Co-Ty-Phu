/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { SaveGameData } from '../../../types/saveGame';
import { SetupPlayerConfig } from '../hooks/useGameState';

const STORAGE_KEY = 'co_ty_phu_saves_v1';

export const useSaveGame = () => {
  const [slots, setSlots] = useState<(SaveGameData | null)[]>([null, null, null]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setSlots(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading save slots from storage:', e);
    }
    setSlots([null, null, null]);
  }, []);

  const persistSlots = useCallback((newSlots: (SaveGameData | null)[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlots));
      setSlots(newSlots);
    } catch (e) {
      console.error('Error persisting save slots:', e);
    }
  }, []);

  const saveGameToSlot = useCallback(
    (slotId: number, currentGameState: Omit<SaveGameData, 'slotId' | 'savedAt' | 'title'>) => {
      const idx = slotId - 1;
      if (idx < 0 || idx > 2) return false;

      const title = `Vòng ${currentGameState.currentRound} · ${currentGameState.players.length} Người chơi · Lượt ${currentGameState.players[currentGameState.turnIndex]?.name || '?'}`;
      const newSave: SaveGameData = {
        ...currentGameState,
        slotId,
        savedAt: Date.now(),
        title,
      };

      const updated = [...slots];
      updated[idx] = newSave;
      persistSlots(updated);
      return true;
    },
    [slots, persistSlots]
  );

  const deleteSlot = useCallback(
    (slotId: number) => {
      const idx = slotId - 1;
      if (idx < 0 || idx > 2) return;

      const updated = [...slots];
      updated[idx] = null;
      persistSlots(updated);
    },
    [slots, persistSlots]
  );

  return {
    slots,
    saveGameToSlot,
    deleteSlot,
  };
};
