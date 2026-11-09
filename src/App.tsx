/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMonopolyGame } from './hooks/useMonopolyGame';
import { GameHeader } from './modules/game/components/GameHeader';
import { GameSetupScreen } from './modules/game/components/GameSetupScreen';
import { GamePlayScreen } from './modules/game/components/GamePlayScreen';
import { GameModalsContainer } from './modules/game/components/GameModalsContainer';
import { CharacterEventStage } from './components/Effects/CharacterEventStage';
import { GameSaveLoadModalWrapper } from './modules/game/components/GameSaveLoadModalWrapper';
import { GameCheatModalWrapper } from './modules/game/components/GameCheatModalWrapper';

import { Character } from './types/game';
import { GameQuickSaveToast } from './modules/game/components/GameQuickSaveToast';
import { useAppSaveLoad } from './modules/game/hooks/useAppSaveLoad';
import { useGameSetupState } from './modules/game/hooks/useGameSetupState';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { getAvailableTargetPlayers } from './modules/game/utils/targetAbilityHelper';

export default function App() {

  const game = useMonopolyGame();
  const {
    playerConfigs,
    setPlayerConfigs,
    pickingCharacterPlayerIdx,
    setPickingCharacterPlayerIdx,
    handlePlayerCountChange,
    updatePlayerConfig,
  } = useGameSetupState();

  const [showSettings, setShowSettings] = useState(false);
  const [showInventoryPlayerId, setShowInventoryPlayerId] = useState<number | null>(null);

  const {
    saveGame,
    showSaveLoadModal,
    setShowSaveLoadModal,
    quickSaveToast,
    handleSaveToSlot,
    handleQuickSave,
    handleLoadFromSlot,
  } = useAppSaveLoad({ game, playerConfigs, setPlayerConfigs });


  const activePropertyOwner = game.activePropertyModalTile
    ? game.players.find(p => p.propertiesOwned.includes(game.activePropertyModalTile!.id))
    : undefined;

  const currentRent =
    game.activePropertyModalTile && activePropertyOwner
      ? game.calculateRent(game.activePropertyModalTile, activePropertyOwner)
      : 0;

  const isModalActive =
    !!game.activePropertyModalTile ||
    !!game.activeStationModal ||
    !!game.activeUtilityModal ||
    !!game.activeDrawnCard ||
    showInventoryPlayerId !== null ||
    showSettings ||
    showSaveLoadModal ||
    game.isCheatModalOpen ||
    pickingCharacterPlayerIdx !== null ||
    !!game.activeTargetAbility ||
    !!game.activeAbilityNotification ||
    !!game.aiActionModalInfo ||
    !!game.winner;

  useGlobalKeyboardShortcuts({
    isPlaying: game.isPlaying,
    canRoll: game.canRoll,
    isRolling: game.isRolling,
    isMovingStepByStep: game.isMovingStepByStep,
    hasMovedThisTurn: game.hasMovedThisTurn,
    activePlayerIsAI: !!game.activePlayer?.isAI,
    isModalActive,
    onQuickSave: handleQuickSave,
    onToggleInventory: () =>
      setShowInventoryPlayerId(prev => (prev !== null ? null : game.activePlayer?.id || 1)),
    onRollDice: game.rollDice,
    onEndTurn: game.endTurn,
  });

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-slate-900 flex flex-col font-sans select-none antialiased">
      <GameHeader
        isPlaying={game.isPlaying}
        currentRound={game.currentRound}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSaveLoad={() => setShowSaveLoadModal(true)}
        onQuickSave={handleQuickSave}
        onOpenCheat={() => game.setIsCheatModalOpen(true)}
        hasActiveCheat={
          !!(game.cheatNextDice || game.cheatNextChanceCardId || game.cheatNextChestCardId)
        }
      />

      {!game.isPlaying ? (
        <GameSetupScreen
          playerConfigs={playerConfigs}
          onPlayerCountChange={handlePlayerCountChange}
          onUpdatePlayerConfig={updatePlayerConfig}
          onOpenCharacterPicker={idx => setPickingCharacterPlayerIdx(idx)}
          onStartGame={() => game.startNewGame(playerConfigs)}
        />
      ) : (
        <GamePlayScreen
          players={game.players}
          activePlayer={game.activePlayer!}
          turnIndex={game.turnIndex}
          tiles={game.tiles}
          settings={game.settings}
          consumableShop={game.consumableShop}
          permanentShop={game.permanentShop}
          dice={game.dice}
          canRoll={game.canRoll}
          isRolling={game.isRolling}
          isMovingStepByStep={game.isMovingStepByStep}
          logs={game.logs}
          onOpenInventory={id => {
            setShowInventoryPlayerId(id);
            const p = game.players.find(x => x.id === id);
            if (p) {
              game.triggerCharacterEvent(
                p.id,
                'open_inventory',
                'action',
                'Mở Túi Đồ',
                `${p.name} đang kiểm tra kho trang bị & kỹ năng`
              );
            }
          }}
          onPayBail={game.payBail}
          canPlayerPayBail={game.canPlayerPayBail}
          onUseGetOutOfJailCard={game.useGetOutOfJailCard}
          onSelectTile={tile => {
            game.setActivePropertyModalTile(tile);
            game.setIsLandingPropertyAction(false);
          }}
          onRollDice={game.rollDice}
          onSkipMovement={game.skipMovement}
          onEndTurn={game.endTurn}
          onOpenCheat={() => game.setIsCheatModalOpen(true)}
          hasActiveCheat={
            !!(game.cheatNextDice || game.cheatNextChanceCardId || game.cheatNextChestCardId)
          }
          investigator={game.investigator}
        />
      )}

      <GameModalsContainer
        activePropertyModalTile={game.activePropertyModalTile}
        activePropertyOwner={activePropertyOwner}
        currentRent={currentRent}
        isLandingPropertyAction={game.isLandingPropertyAction}
        hasMovedThisTurn={game.hasMovedThisTurn}
        upgradesThisTurn={game.upgradesThisTurn}
        activePlayer={game.activePlayer}
        players={game.players}
        tiles={game.tiles}
        onBuyProperty={game.buyProperty}
        onBuildHouse={game.buildHouse}
        onMortgageProperty={game.mortgageProperty}
        onUnmortgageProperty={game.unmortgageProperty}
        onClosePropertyModal={() => {
          game.setActivePropertyModalTile(null);
          game.setIsLandingPropertyAction(false);
        }}
        activeStationModal={game.activeStationModal}
        offeredStationAbilities={game.offeredStationAbilities}
        consumableShop={game.consumableShop}
        onBuyConsumableAbility={game.buyConsumableAbility}
        onCloseStationModal={() => game.setActiveStationModal(null)}
        activeUtilityModal={game.activeUtilityModal}
        offeredUtilityAbilities={game.offeredUtilityAbilities}
        permanentShop={game.permanentShop}
        onBuyPermanentAbility={game.buyPermanentAbility}
        onSellPermanentAbility={game.sellPermanentAbility}
        onCloseUtilityModal={() => game.setActiveUtilityModal(null)}
        activeDrawnCard={game.activeDrawnCard}
        onExecuteDrawnCard={game.executeDrawnCard}
        onCloseDrawnCard={() => game.setActiveDrawnCard(null)}
        onSkipDrawnCard={game.skipDrawnCard}
        showInventoryPlayerId={showInventoryPlayerId}
        onUseConsumableAbility={game.useConsumableAbility}
        onUseGetOutOfJailCard={game.useGetOutOfJailCard}
        onCloseInventory={() => setShowInventoryPlayerId(null)}
        canRoll={game.canRoll}
        showSettings={showSettings}
        settings={game.settings}
        onUpdateSettings={game.setSettings}
        chanceDeck={game.chanceDeck}
        chestDeck={game.chestDeck}
        onUpdateCardQuantity={game.updateCardQuantity}
        onAddCustomCard={card => {
          if (card.deck === 'chance') game.setChanceDeck(prev => [...prev, card]);
          else game.setChestDeck(prev => [...prev, card]);
        }}
        onUpdateConsumableQuantity={game.updateConsumableQuantity}
        onUpdatePermanentQuantity={game.updatePermanentQuantity}
        onAddCustomConsumable={ab => game.setConsumableShop(prev => [...prev, ab])}
        onAddCustomPermanent={ab => game.setPermanentShop(prev => [...prev, ab])}
        onUpdateConsumable={ab =>
          game.setConsumableShop(prev => prev.map(item => (item.id === ab.id ? ab : item)))
        }
        onUpdatePermanent={ab =>
          game.setPermanentShop(prev => prev.map(item => (item.id === ab.id ? ab : item)))
        }
        onDeleteAbility={(id, kind) => {
          if (kind === 'consumable') {
            game.setConsumableShop(prev => prev.filter(item => item.id !== id));
          } else {
            game.setPermanentShop(prev => prev.filter(item => item.id !== id));
          }
        }}
        onResetAbilitiesToDefault={game.resetAbilitiesToDefault}
        onSetChanceDeck={game.setChanceDeck}
        onSetChestDeck={game.setChestDeck}
        onSetConsumableShop={game.setConsumableShop}
        onSetPermanentShop={game.setPermanentShop}
        onCloseSettings={() => setShowSettings(false)}
        pickingCharacterPlayerIdx={pickingCharacterPlayerIdx}
        selectedCharacterId={
          pickingCharacterPlayerIdx !== null
            ? playerConfigs[pickingCharacterPlayerIdx].characterId
            : undefined
        }
        onSelectCharacter={(c: Character) => {
          if (pickingCharacterPlayerIdx !== null) {
            updatePlayerConfig(pickingCharacterPlayerIdx, {
              characterId: c.id,
              name: c.name,
            });
          }
        }}
        onCloseCharacterPicker={() => setPickingCharacterPlayerIdx(null)}
        activeTargetAbility={game.activeTargetAbility}
        availableTargets={getAvailableTargetPlayers(
          game.activeTargetAbility,
          game.activePlayer,
          game.players
        )}
        onSelectTargetPlayer={target =>
          game.useConsumableAbility(game.activeTargetAbility!, target)
        }
        onCancelTargetSelection={() => game.setActiveTargetAbility(null)}
        activeAbilityNotification={game.activeAbilityNotification}
        onDismissAbilityNotification={() => game.setActiveAbilityNotification(null)}
        aiActionModalInfo={game.aiActionModalInfo}
        onDismissAiActionModal={() => game.setAiActionModalInfo(null)}
        winner={game.winner}
        onRestartGame={() => game.startNewGame(playerConfigs)}
      />

      {game.characterEvent && (
        <CharacterEventStage
          event={game.characterEvent}
          player={game.players.find(p => p.id === game.characterEvent!.playerId)!}
          onDismiss={() => game.setCharacterEvent(null)}
        />
      )}

      <GameSaveLoadModalWrapper
        isOpen={showSaveLoadModal}
        slots={saveGame.slots}
        quickSaveSlot={saveGame.quickSaveSlot}
        isPlaying={game.isPlaying}
        onSaveToSlot={handleSaveToSlot}
        onQuickSave={handleQuickSave}
        onLoadFromSlot={handleLoadFromSlot}
        onDeleteSlot={saveGame.deleteSlot}
        onClose={() => setShowSaveLoadModal(false)}
      />


      <GameCheatModalWrapper game={game} />
      <GameQuickSaveToast message={quickSaveToast} />
    </div>
  );
}

