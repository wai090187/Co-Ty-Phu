/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SaveLoadModal } from '../../../components/Modals/SaveLoadModal';
import { SaveGameData } from '../../../types/saveGame';

interface GameSaveLoadModalWrapperProps {
  isOpen: boolean;
  slots: (SaveGameData | null)[];
  quickSaveSlot: SaveGameData | null;

  isPlaying: boolean;
  onSaveToSlot: (slotId: number) => void;
  onQuickSave: () => void;
  onLoadFromSlot: (data: any) => void;
  onDeleteSlot: (slotId: number) => void;
  onClose: () => void;
}

export const GameSaveLoadModalWrapper: React.FC<GameSaveLoadModalWrapperProps> = ({
  isOpen,
  slots,
  quickSaveSlot,
  isPlaying,
  onSaveToSlot,
  onQuickSave,
  onLoadFromSlot,
  onDeleteSlot,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <SaveLoadModal
      slots={slots}
      quickSaveSlot={quickSaveSlot}
      isPlaying={isPlaying}
      onSaveToSlot={onSaveToSlot}
      onQuickSave={onQuickSave}
      onLoadFromSlot={onLoadFromSlot}
      onDeleteSlot={onDeleteSlot}
      onClose={onClose}
    />
  );
};
