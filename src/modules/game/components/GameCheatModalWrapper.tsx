/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheatModal } from '../../../components/Modals/CheatModal';

interface Props {
  game: any;
}

export const GameCheatModalWrapper: React.FC<Props> = ({ game }) => {
  return (
    <CheatModal
      isOpen={game.isCheatModalOpen}
      onClose={() => game.setIsCheatModalOpen(false)}
      players={game.players}
      selectedPlayerId={game.cheatSelectedPlayerId}
      onSelectPlayer={game.setCheatSelectedPlayerId}
      tiles={game.tiles}
      consumableShop={game.consumableShop}
      permanentShop={game.permanentShop}
      chanceDeck={game.chanceDeck}
      chestDeck={game.chestDeck}
      cheatNextDice={game.cheatNextDice}
      onSetCheatNextDice={game.setCheatNextDice}
      cheatNextChanceCardId={game.cheatNextChanceCardId}
      onSetCheatNextChanceCardId={game.setCheatNextChanceCardId}
      cheatNextChestCardId={game.cheatNextChestCardId}
      onSetCheatNextChestCardId={game.setCheatNextChestCardId}
      onTogglePropertyOwner={game.cheatTogglePropertyOwner}
      onSetPropertyHouses={game.cheatSetPropertyHouses}
      onAddConsumable={game.cheatAddConsumable}
      onRemoveConsumable={game.cheatRemoveConsumable}
      onAddPermanent={game.cheatAddPermanent}
      onRemovePermanent={game.cheatRemovePermanent}
      onSetGetOutOfJailCards={game.cheatSetGetOutOfJailCards}
      onSetCash={game.cheatSetCash}
      onToggleJail={game.cheatToggleJail}
      onTeleportPlayer={game.cheatTeleportPlayer}
    />
  );
};
