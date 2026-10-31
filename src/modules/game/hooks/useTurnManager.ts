import { useCallback } from 'react';
import { Player } from '../../../types/game';
import { SetupPlayerConfig } from './useGameState';
import { DEFAULT_PLAYER_COLORS } from '../constants/defaultSetup';

interface TurnManagerContext {
  turnIndex: number;
  currentRound: number;
  startingCash: number;
  activePlayer: Player | null;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setCurrentRound: React.Dispatch<React.SetStateAction<number>>;
  setTurnIndex: React.Dispatch<React.SetStateAction<number>>;
  setCanRoll: (val: boolean) => void;
  setHasMovedThisTurn: (val: boolean) => void;
  setUpgradesThisTurn: (val: number) => void;
  setWinner: (winner: Player | null) => void;
  setIsPlaying: (val: boolean) => void;
  setLogs: (logs: any) => void;
  addLog: (text: string, type?: any) => void;
  setConsecutiveDoubles: (val: number) => void;
  closeAllModals: () => void;
}

export const useTurnManager = (ctx: TurnManagerContext) => {
  const startNewGame = useCallback(
    (configs: SetupPlayerConfig[]) => {
      const initializedPlayers: Player[] = configs.map((cfg, idx) => ({
        id: idx + 1,
        name: cfg.isAI
          ? `AI ${idx + 1} (${cfg.aiLevel === 'easy' ? 'Dễ' : cfg.aiLevel === 'medium' ? 'TB' : 'Khó'})`
          : cfg.name,
        isAI: cfg.isAI,
        aiLevel: cfg.aiLevel,
        characterId: cfg.characterId,
        color: cfg.color || DEFAULT_PLAYER_COLORS[idx % DEFAULT_PLAYER_COLORS.length],
        cash: ctx.startingCash,
        position: 0,
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        bankrupt: false,
        consumableAbilities: [],
        permanentAbilities: [],
        propertiesOwned: [],
        houses: {},
        mortgaged: {},
      }));

      ctx.setPlayers(initializedPlayers);
      ctx.setCurrentRound(1);
      ctx.setTurnIndex(0);
      ctx.setCanRoll(true);
      ctx.setHasMovedThisTurn(false);
      ctx.setUpgradesThisTurn(0);
      ctx.setWinner(null);
      ctx.setIsPlaying(true);
      ctx.setLogs([
        {
          id: 'init-1',
          text: `Ván cờ bắt đầu với ${initializedPlayers.length} người chơi. Mỗi người nhận ${ctx.startingCash}đ!`,
          type: 'info',
          timestamp: Date.now(),
        },
      ]);
    },
    [ctx]
  );

  const endTurn = useCallback(() => {
    if (!ctx.activePlayer) return;
    ctx.closeAllModals();

    ctx.setPlayers(prev => {
      let nextIndex = (ctx.turnIndex + 1) % prev.length;
      let loopCount = 0;
      while (prev[nextIndex].bankrupt && loopCount < prev.length) {
        nextIndex = (nextIndex + 1) % prev.length;
        loopCount++;
      }
      if (nextIndex <= ctx.turnIndex) {
        ctx.setCurrentRound(r => r + 1);
        ctx.addLog(`--- Bắt đầu Vòng ${ctx.currentRound + 1} ---`, 'info');
      }
      ctx.setTurnIndex(nextIndex);
      ctx.setCanRoll(true);
      ctx.setHasMovedThisTurn(false);
      ctx.setUpgradesThisTurn(0);
      ctx.setConsecutiveDoubles(0);
      return prev;
    });
  }, [ctx]);

  return { startNewGame, endTurn };
};
