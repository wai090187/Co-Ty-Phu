/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { SetupPlayerConfig } from './useGameState';
import { applyLoadedGameState, extractCurrentSaveState } from '../utils/saveStateHelper';

interface Props {
  state: any;
}

export const useGamePersistenceActions = ({ state }: Props) => {
  const updateCardQuantity = useCallback((cardId: string, quantity: number) => {
    state.setChanceDeck((prev: any[]) => prev.map(c => (c.id === cardId ? { ...c, quantity } : c)));
    state.setChestDeck((prev: any[]) => prev.map(c => (c.id === cardId ? { ...c, quantity } : c)));
  }, [state]);

  const updateConsumableQuantity = useCallback((abilityId: string, quantity: number) => {
    state.setConsumableShop((prev: any[]) =>
      prev.map(a => (a.id === abilityId ? { ...a, quantity } : a))
    );
  }, [state]);

  const updatePermanentQuantity = useCallback((abilityId: string, quantity: number) => {
    state.setPermanentShop((prev: any[]) =>
      prev.map(a => (a.id === abilityId ? { ...a, quantity } : a))
    );
  }, [state]);

  const loadSavedGame = useCallback(
    (save: any) => {
      applyLoadedGameState(state, save);
    },
    [state]
  );

  const getCurrentSaveState = useCallback(
    (configs: SetupPlayerConfig[]) => {
      return extractCurrentSaveState(state, configs);
    },
    [state]
  );

  return {
    updateCardQuantity,
    updateConsumableQuantity,
    updatePermanentQuantity,
    loadSavedGame,
    getCurrentSaveState,
  };
};
