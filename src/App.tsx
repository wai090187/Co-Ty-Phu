import React, { useState, useEffect } from 'react';
import { useMonopolyGame, SetupPlayerConfig } from './hooks/useMonopolyGame';
import { CHARACTERS } from './data/characters';
import { GameHeader } from './modules/game/components/GameHeader';
import { GameSetupScreen } from './modules/game/components/GameSetupScreen';
import { GamePlayScreen } from './modules/game/components/GamePlayScreen';
import { GameModalsContainer } from './modules/game/components/GameModalsContainer';
import { CharacterEventStage } from './components/Effects/CharacterEventStage';
import { SaveLoadModal } from './components/Modals/SaveLoadModal';
import { CheatModal } from './components/Modals/CheatModal';
import { useSaveGame } from './modules/game/hooks/useSaveGame';
import { DEFAULT_PLAYER_COLORS, INITIAL_PLAYER_CONFIGS } from './modules/game/constants/defaultSetup';
import { AIDifficulty, Character, Player } from './types/game';

export default function App() {
  const game = useMonopolyGame();
  const saveGame = useSaveGame();
  const [playerConfigs, setPlayerConfigs] = useState<SetupPlayerConfig[]>(INITIAL_PLAYER_CONFIGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [showInventoryPlayerId, setShowInventoryPlayerId] = useState<number | null>(null);
  const [pickingCharacterPlayerIdx, setPickingCharacterPlayerIdx] = useState<number | null>(null);
  const [quickSaveToast, setQuickSaveToast] = useState<string | null>(null);

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

  const activePropertyOwner = game.activePropertyModalTile
    ? game.players.find(p => p.propertiesOwned.includes(game.activePropertyModalTile!.id))
    : undefined;

  const currentRent =
    game.activePropertyModalTile && activePropertyOwner
      ? game.calculateRent(game.activePropertyModalTile, activePropertyOwner)
      : 0;

  // Global Keyboard Shortcuts
  // - Tab: Quick Save (saves without confirmation)
  // - Space: Roll dice (when canRoll) or End turn (when finished movement)
  // - Ctrl: Open/close active player's inventory
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      // Quick save on Tab
      if (e.key === 'Tab') {
        if (!game.isPlaying) return;
        e.preventDefault();
        handleQuickSave();
        return;
      }

      // Toggle inventory on Ctrl
      if (e.key === 'Control') {
        if (!game.isPlaying) return;
        e.preventDefault();
        setShowInventoryPlayerId(prev => (prev !== null ? null : (game.activePlayer?.id || 1)));
        return;
      }

      // Space to Roll dice or End turn
      if (e.code === 'Space' || e.key === ' ') {
        if (!game.isPlaying) return;

        // Check if any modal is currently blocking
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

        if (isModalActive) return;
        if (!game.activePlayer || game.activePlayer.isAI) return;

        if (game.canRoll && !game.isRolling && !game.isMovingStepByStep) {
          e.preventDefault();
          game.rollDice();
        } else if (!game.canRoll && !game.isRolling && !game.isMovingStepByStep && game.hasMovedThisTurn) {
          e.preventDefault();
          game.endTurn();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    game,
    showInventoryPlayerId,
    showSettings,
    showSaveLoadModal,
    pickingCharacterPlayerIdx,
  ]);

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
        onUpdateConsumable={ab => game.setConsumableShop(prev => prev.map(item => (item.id === ab.id ? ab : item)))}
        onUpdatePermanent={ab => game.setPermanentShop(prev => prev.map(item => (item.id === ab.id ? ab : item)))}
        onDeleteAbility={(id, kind) => {
          if (kind === 'consumable') {
            game.setConsumableShop(prev => prev.filter(item => item.id !== id));
          } else {
            game.setPermanentShop(prev => prev.filter(item => item.id !== id));
          }
        }}
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

      {showSaveLoadModal && (
        <SaveLoadModal
          slots={saveGame.slots}
          quickSaveSlot={saveGame.quickSaveSlot}
          isPlaying={game.isPlaying}
          onSaveToSlot={handleSaveToSlot}
          onQuickSave={handleQuickSave}
          onLoadFromSlot={handleLoadFromSlot}
          onDeleteSlot={saveGame.deleteSlot}
          onClose={() => setShowSaveLoadModal(false)}
        />
      )}

      {/* Cheat & Test Mode Modal */}
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

      {/* Quick Save Success Toast Notification */}
      {quickSaveToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="px-4 py-2 bg-slate-900/95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xl border-2 border-emerald-400 flex items-center gap-2.5 backdrop-blur-md">
            <span className="text-lg text-emerald-400">⚡</span>
            <span className="text-emerald-100">{quickSaveToast}</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/40 font-mono">
              Tab
            </span>
          </div>
        </aside>
      )}
    </div>
  );
}
