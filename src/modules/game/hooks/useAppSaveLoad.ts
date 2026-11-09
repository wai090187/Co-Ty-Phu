/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PlayerConfig } from '../../../types/saveGame';
import { useSaveGame } from './useSaveGame';

interface UseAppSaveLoadProps {
  game: {
    getCurrentSaveState: (playerConfigs: PlayerConfig[]) => any;
    addLog: (msg: string, type?: any) => void;
    loadSavedGame: (data: any) => void;
  };
  playerConfigs: PlayerConfig[];
  setPlayerConfigs: (configs: PlayerConfig[]) => void;
}


export const useAppSaveLoad = ({
  game,
  playerConfigs,
  setPlayerConfigs,
}: UseAppSaveLoadProps) => {
  const saveGame = useSaveGame();
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [quickSaveToast, setQuickSaveToast] = useState<string | null>(null);

  const handleSaveToSlot = (slotId: number) => {
    const stateToSave = game.getCurrentSaveState(playerConfigs);
    saveGame.saveGameToSlot(slotId, stateToSave);
    game.addLog(`💾 Đã lưu trận đấu vào Ô lưu ${slotId}!`, 'info');
  };

  const handleQuickSave = () => {
    const stateToSave = game.getCurrentSaveState(playerConfigs);
    saveGame.saveQuickSave(stateToSave);
    game.addLog('⚡ Đã lưu nhanh trận đấu thành công (tự động ghi đè)!', 'info');
    setQuickSaveToast('Đã lưu nhanh game thành công!');
    setTimeout(() => {
      setQuickSaveToast(null);
    }, 2600);
  };

  const handleLoadFromSlot = (saveData: any) => {
    game.loadSavedGame(saveData);
    if (saveData.playerConfigs) {
      setPlayerConfigs(saveData.playerConfigs);
    }
  };

  return {
    saveGame,
    showSaveLoadModal,
    setShowSaveLoadModal,
    quickSaveToast,
    handleSaveToSlot,
    handleQuickSave,
    handleLoadFromSlot,
  };
};
