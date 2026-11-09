/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

interface KeyboardShortcutsParams {
  isPlaying: boolean;
  canRoll: boolean;
  isRolling: boolean;
  isMovingStepByStep: boolean;
  hasMovedThisTurn: boolean;
  activePlayerIsAI: boolean;
  isModalActive: boolean;
  onQuickSave: () => void;
  onToggleInventory: () => void;
  onRollDice: () => void;
  onEndTurn: () => void;
}

export const useGlobalKeyboardShortcuts = ({
  isPlaying,
  canRoll,
  isRolling,
  isMovingStepByStep,
  hasMovedThisTurn,
  activePlayerIsAI,
  isModalActive,
  onQuickSave,
  onToggleInventory,
  onRollDice,
  onEndTurn,
}: KeyboardShortcutsParams) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      // Quick save on Tab
      if (e.key === 'Tab') {
        if (!isPlaying) return;
        e.preventDefault();
        onQuickSave();
        return;
      }

      // Toggle inventory on Ctrl
      if (e.key === 'Control') {
        if (!isPlaying) return;
        e.preventDefault();
        onToggleInventory();
        return;
      }

      // Space or Enter to Roll dice or End turn
      if (
        e.code === 'Space' ||
        e.key === ' ' ||
        e.key === 'Enter' ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter'
      ) {
        if (!isPlaying || isModalActive || activePlayerIsAI) return;

        if (canRoll && !isRolling && !isMovingStepByStep) {
          e.preventDefault();
          onRollDice();
        } else if (!canRoll && !isRolling && !isMovingStepByStep && hasMovedThisTurn) {
          e.preventDefault();
          onEndTurn();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isPlaying,
    canRoll,
    isRolling,
    isMovingStepByStep,
    hasMovedThisTurn,
    activePlayerIsAI,
    isModalActive,
    onQuickSave,
    onToggleInventory,
    onRollDice,
    onEndTurn,
  ]);
};
