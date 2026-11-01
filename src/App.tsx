import React, { useState } from 'react';
import { useMonopolyGame, SetupPlayerConfig } from './hooks/useMonopolyGame';
import { CHARACTERS } from './data/characters';
import { GameHeader } from './modules/game/components/GameHeader';
import { GameSetupScreen } from './modules/game/components/GameSetupScreen';
import { GamePlayScreen } from './modules/game/components/GamePlayScreen';
import { GameModalsContainer } from './modules/game/components/GameModalsContainer';
import { CharacterEventStage } from './components/Effects/CharacterEventStage';
import { DEFAULT_PLAYER_COLORS, INITIAL_PLAYER_CONFIGS } from './modules/game/constants/defaultSetup';
import { AIDifficulty, Character, Player } from './types/game';

export default function App() {
  const game = useMonopolyGame();
  const [playerConfigs, setPlayerConfigs] = useState<SetupPlayerConfig[]>(INITIAL_PLAYER_CONFIGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showInventoryPlayerId, setShowInventoryPlayerId] = useState<number | null>(null);
  const [pickingCharacterPlayerIdx, setPickingCharacterPlayerIdx] = useState<number | null>(null);

  const handlePlayerCountChange = (count: number) => {
    if (count < 2 || count > 6) return;
    const updated = [...playerConfigs];
    while (updated.length < count) {
      const idx = updated.length;
      const defaultAiLevel: AIDifficulty = idx % 3 === 0 ? 'hard' : idx % 2 === 0 ? 'medium' : 'easy';
      updated.push({
        name: `AI ${idx + 1} (${defaultAiLevel === 'easy' ? 'Dễ' : defaultAiLevel === 'medium' ? 'TB' : 'Khó'})`,
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
          next[index].name = `AI ${index + 1} (${lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'TB' : 'Khó'})`;
        }
      }
      return next;
    });
  };

  const getAvailableTargets = () => {
    if (!game.activeTargetAbility || !game.activePlayer) return [];
    if (game.activeTargetAbility.effectType === 'direct_jail_target') {
      return game.players.filter(p => p.id !== game.activePlayer!.id && !p.bankrupt && !p.inJail);
    }
    if (
      game.activeTargetAbility.effectType === 'push_neighbor' ||
      game.activeTargetAbility.effectType === 'send_to_jail_neighbor'
    ) {
      return game.players.filter(p => {
        if (p.id === game.activePlayer!.id || p.bankrupt) return false;
        const dist = Math.abs(p.position - game.activePlayer!.position);
        return dist === 0 || dist === 1 || dist === 39;
      });
    }
    return [];
  };

  const activePropertyOwner = game.activePropertyModalTile
    ? game.players.find(p => p.propertiesOwned.includes(game.activePropertyModalTile!.id))
    : undefined;

  const currentRent =
    game.activePropertyModalTile && activePropertyOwner
      ? game.calculateRent(game.activePropertyModalTile, activePropertyOwner)
      : 0;

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-slate-900 flex flex-col font-sans select-none antialiased">
      <GameHeader
        isPlaying={game.isPlaying}
        currentRound={game.currentRound}
        onOpenSettings={() => setShowSettings(true)}
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
          onSelectTile={tile => {
            game.setActivePropertyModalTile(tile);
            game.setIsLandingPropertyAction(false);
          }}
          onRollDice={game.rollDice}
          onSkipMovement={game.skipMovement}
          onEndTurn={game.endTurn}
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
        showInventoryPlayerId={showInventoryPlayerId}
        onUseConsumableAbility={game.useConsumableAbility}
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
        availableTargets={getAvailableTargets()}
        onSelectTargetPlayer={target => game.useConsumableAbility(game.activeTargetAbility!, target)}
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
    </div>
  );
}
