/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { Player, Tile, Card, PermanentAbility, ConsumableAbility } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { handlePropertyLanding } from '../utils/landingPropertyHelper';
import { handleSameTileAndNeighborToll, handleCornerAndSpecialTiles } from '../utils/landingSpecialTilesHelper';

interface LandingContext {
  tiles: Tile[];
  settings: any;
  chanceDeck: Card[];
  chestDeck: Card[];
  setChanceDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  setChestDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  permanentShop: PermanentAbility[];
  consumableShop: ConsumableAbility[];
  pendingDestroyHousePlayerId?: number | null;
  setPendingDestroyHousePlayerId?: (id: number | null) => void;
  pendingDestroyHouseNext?: boolean;
  setPendingDestroyHouseNext?: (v: boolean) => void;
  setHasMovedThisTurn: (v: boolean) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string, cashDelta?: number) => void;
  setWinner: (p: Player | null) => void;
  setActivePropertyModalTile: (t: Tile | null) => void;
  setIsLandingPropertyAction: (v: boolean) => void;
  setActiveStationModal: (t: Tile | null) => void;
  setOfferedStationAbilities: (a: ConsumableAbility[]) => void;
  setActiveUtilityModal: (t: Tile | null) => void;
  setOfferedUtilityAbilities: (a: PermanentAbility[]) => void;
  setActiveAbilityNotification: (n: any) => void;
  setActiveDrawnCard: (c: Card | null) => void;
  cheatNextChanceCardId?: string | null;
  setCheatNextChanceCardId?: (id: string | null) => void;
  cheatNextChestCardId?: string | null;
  setCheatNextChestCardId?: (id: string | null) => void;
  investigator?: import('../../../types/game').SpecialInvestigatorState;
}

export const useTileLandingResolver = (ctx: LandingContext) => {
  const checkGameOver = useCallback(
    (currentPlayers: Player[]) => {
      const activeSurvivors = currentPlayers.filter(p => !p.bankrupt);
      if (activeSurvivors.length === 1) {
        ctx.setWinner(activeSurvivors[0]);
        ctx.addLog(
          `🏆 ${activeSurvivors[0].name} đã đánh bại tất cả đối thủ và giành chiến thắng chung cuộc!`,
          'money'
        );
        return true;
      }
      return false;
    },
    [ctx]
  );

  const handleBankrupt = useCallback(
    (bankruptPlayer: Player, creditor?: Player) => {
      sounds.jail();
      ctx.addLog(`💀 ${bankruptPlayer.name} đã khánh kiệt tài chính và chính thức Phá Sản!`, 'jail');

      ctx.setPlayers(prev => {
        const next = prev.map(p => {
          if (p.id === bankruptPlayer.id) {
            return {
              ...p,
              bankrupt: true,
              cash: 0,
              propertiesOwned: [],
              houses: {},
              mortgaged: {},
            };
          }
          if (creditor && p.id === creditor.id) {
            return {
              ...p,
              cash: p.cash + bankruptPlayer.cash,
              propertiesOwned: [...p.propertiesOwned, ...bankruptPlayer.propertiesOwned],
              houses: { ...p.houses, ...bankruptPlayer.houses },
            };
          }
          return p;
        });

        checkGameOver(next);
        return next;
      });
    },
    [ctx, checkGameOver]
  );

  const resolveTileLanding = useCallback(
    (playerId: number, landedTileId: number, _diceTotal: number) => {
      ctx.setHasMovedThisTurn(true);

      ctx.setPlayers(prevPlayers => {
        const pIndex = prevPlayers.findIndex(p => p.id === playerId);
        if (pIndex === -1) return prevPlayers;
        const player = prevPlayers[pIndex];
        const tile = ctx.tiles[landedTileId];

        ctx.addLog(`${player.name} dừng chân tại [${tile.name}]`, 'info');

        // Handle same-tile interaction, jail visiting bonus, and neighbor toll
        handleSameTileAndNeighborToll(
          {
            ...ctx,
            tile,
            player,
            prevPlayers,
            handleBankrupt,
          },
          landedTileId
        );

        // Handle property landing
        if (tile.type === 'property') {
          handlePropertyLanding({
            tile,
            player,
            prevPlayers,
            tiles: ctx.tiles,
            settings: ctx.settings,
            investigator: ctx.investigator,
            consumableShop: ctx.consumableShop,
            pendingDestroyHousePlayerId: ctx.pendingDestroyHousePlayerId,
            setPendingDestroyHousePlayerId: ctx.setPendingDestroyHousePlayerId,
            pendingDestroyHouseNext: ctx.pendingDestroyHouseNext,
            setPendingDestroyHouseNext: ctx.setPendingDestroyHouseNext,
            setActivePropertyModalTile: ctx.setActivePropertyModalTile,
            setIsLandingPropertyAction: ctx.setIsLandingPropertyAction,
            triggerCashTransfer: ctx.triggerCashTransfer,
            addLog: ctx.addLog,
            handleBankrupt,
          });
        } else {
          // Handle station, utility, tax, chance, chest, corner
          handleCornerAndSpecialTiles({
            ...ctx,
            tile,
            player,
            prevPlayers,
            handleBankrupt,
          });
        }

        return [...prevPlayers];
      });
    },
    [ctx, handleBankrupt]
  );

  return {
    resolveTileLanding,
    handleBankrupt,
    checkGameOver,
  };
};
