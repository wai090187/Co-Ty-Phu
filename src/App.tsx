import React, { useState } from 'react';
import { useMonopolyGame, SetupPlayerConfig } from './hooks/useMonopolyGame';
import { CHARACTERS } from './data/characters';
import { CharacterAvatar } from './components/Common/CharacterAvatar';
import { BoardView } from './components/Board/BoardView';
import { DiceRoller } from './components/Controls/DiceRoller';
import { PlayerCard } from './components/HUD/PlayerCard';
import { GameLog } from './components/HUD/GameLog';
import { PropertyModal } from './components/Modals/PropertyModal';
import { StationAbilityModal } from './components/Modals/StationAbilityModal';
import { UtilityAbilityModal } from './components/Modals/UtilityAbilityModal';
import { CardModal } from './components/Modals/CardModal';
import { InventoryModal } from './components/Modals/InventoryModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { CharacterSelectModal } from './components/Modals/CharacterSelectModal';
import { TargetPlayerModal } from './components/Modals/TargetPlayerModal';
import { PermanentTriggerModal } from './components/Modals/PermanentTriggerModal';
import { AiActionModal } from './components/Modals/AiActionModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { AIDifficulty, Character, Player } from './types/game';

const DEFAULT_PLAYER_COLORS = [
  '#DC2626', // Red
  '#2563EB', // Blue
  '#16A34A', // Green
  '#D97706', // Amber/Yellow
  '#9333EA', // Purple
  '#0891B2', // Cyan
];

export default function App() {
  const {
    isPlaying,
    currentRound,
    turnIndex,
    settings,
    setSettings,
    tiles,
    players,
    activePlayer,
    dice,
    isRolling,
    canRoll,
    hasMovedThisTurn,
    upgradesThisTurn,
    isMovingStepByStep,
    logs,
    winner,
    chanceDeck,
    chestDeck,
    consumableShop,
    permanentShop,
    activePropertyModalTile,
    isLandingPropertyAction,
    setIsLandingPropertyAction,
    activeStationModal,
    activeUtilityModal,
    activeDrawnCard,
    activeTargetAbility,
    activeAbilityNotification,
    aiActionModalInfo,
    setActiveAbilityNotification,
    setAiActionModalInfo,
    setActiveTargetAbility,
    setActivePropertyModalTile,
    setActiveStationModal,
    setActiveUtilityModal,
    setActiveDrawnCard,
    startNewGame,
    rollDice,
    skipMovement,
    endTurn,
    buyProperty,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
    canPlayerPayBail,
    buyConsumableAbility,
    buyPermanentAbility,
    sellPermanentAbility,
    useConsumableAbility,
    executeDrawnCard,
    calculateRent,
    setChanceDeck,
    setChestDeck,
    setConsumableShop,
    setPermanentShop,
    updateCardQuantity,
    updateConsumableQuantity,
    updatePermanentQuantity,
  } = useMonopolyGame();

  // Setup State (2 to 6 players)
  const [playerConfigs, setPlayerConfigs] = useState<SetupPlayerConfig[]>([
    {
      name: 'Người Chơi 1',
      isAI: false,
      characterId: 'cong-tu',
      color: DEFAULT_PLAYER_COLORS[0],
    },
    {
      name: 'AI 2 (Trung Bình)',
      isAI: true,
      aiLevel: 'medium',
      characterId: 'co-ba',
      color: DEFAULT_PLAYER_COLORS[1],
    },
    {
      name: 'AI 3 (Khó)',
      isAI: true,
      aiLevel: 'hard',
      characterId: 'tieu-thu-gothic',
      color: DEFAULT_PLAYER_COLORS[2],
    },
    {
      name: 'AI 4 (Dễ)',
      isAI: true,
      aiLevel: 'easy',
      characterId: 'kiem-si-anime',
      color: DEFAULT_PLAYER_COLORS[3],
    },
  ]);

  // Modal open states
  const [showSettings, setShowSettings] = useState(false);
  const [showInventoryPlayerId, setShowInventoryPlayerId] = useState<number | null>(null);
  const [pickingCharacterPlayerIdx, setPickingCharacterPlayerIdx] = useState<number | null>(null);

  // Player count change (2 to 6 players)
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
    while (updated.length > count) {
      updated.pop();
    }
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

  // Target selection for offensive abilities
  const getAvailableTargets = () => {
    if (!activeTargetAbility || !activePlayer) return [];
    if (activeTargetAbility.effectType === 'direct_jail_target') {
      return players.filter(p => p.id !== activePlayer.id && !p.bankrupt && !p.inJail);
    }
    if (
      activeTargetAbility.effectType === 'push_neighbor' ||
      activeTargetAbility.effectType === 'send_to_jail_neighbor'
    ) {
      return players.filter(p => {
        if (p.id === activePlayer.id || p.bankrupt) return false;
        const dist = Math.abs(p.position - activePlayer.position);
        return dist === 0 || dist === 1 || dist === 39;
      });
    }
    return [];
  };

  // Rent info for landing property
  const activePropertyOwner = activePropertyModalTile
    ? players.find(p => p.propertiesOwned.includes(activePropertyModalTile.id))
    : undefined;

  const currentRent =
    activePropertyModalTile && activePropertyOwner
      ? calculateRent(activePropertyModalTile, activePropertyOwner)
      : 0;

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white border-b-2 border-amber-600 px-4 py-2.5 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-display font-black text-white text-lg shadow-sm border border-red-400">
            C
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-lg tracking-wider uppercase text-amber-400">
              Cờ Tỷ Phú Việt Nam
            </h1>
            <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
              Bản Sài Gòn Xưa · 40 Ô Kinh Điển
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
              <span className="text-slate-400">Vòng:</span>
              <span className="font-bold text-amber-400 font-mono">{currentRound}</span>
            </div>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Cài Đặt</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {!isPlaying ? (
        /* Title & Setup Screen */
        <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
          <div className="w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Hero Header */}
            <div className="text-center">
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-xs uppercase tracking-widest border border-red-200">
                Board Game Truyền Thống
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase mt-2 mb-1">
                CỜ TỶ PHÚ SÀI GÒN
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Bản đồ 40 ô chuẩn xác 100% từ Bến Chương Dương đến Cố Đô Huế. Sở hữu hệ thống năng lực
                đặc biệt tại 4 Bến Xe và 2 Công ty Điện/Nước!
              </p>
            </div>

            {/* Player Count Selector (2 to 6 players) */}
            <div className="flex flex-col items-center gap-2">
              <label className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Số Lượng Người Chơi (2 - 6 người)
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map(count => (
                  <button
                    key={count}
                    onClick={() => handlePlayerCountChange(count)}
                    className={`w-11 h-10 rounded-xl font-bold font-mono text-sm transition-all shadow-xs ${
                      playerConfigs.length === count
                        ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400 scale-105'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Players Roster Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {playerConfigs.map((cfg, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border-2 border-slate-200 rounded-2xl flex flex-col gap-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      Vị trí #{idx + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => updatePlayerConfig(idx, { isAI: false })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          !cfg.isAI
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Người
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePlayerConfig(idx, { isAI: true })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cfg.isAI
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Bot AI
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Avatar Button */}
                    <div
                      onClick={() => !cfg.isAI && setPickingCharacterPlayerIdx(idx)}
                      className={`cursor-pointer ${!cfg.isAI ? 'hover:scale-105' : ''} transition-transform`}
                      title={!cfg.isAI ? 'Nhấn để đổi nhân vật' : undefined}
                    >
                      <CharacterAvatar
                        characterId={cfg.characterId}
                        isAI={cfg.isAI}
                        aiNumber={idx + 1}
                        aiLevel={cfg.aiLevel}
                        size="md"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {!cfg.isAI ? (
                        <>
                          <input
                            type="text"
                            value={cfg.name}
                            onChange={e => updatePlayerConfig(idx, { name: e.target.value })}
                            className="p-1 px-2 border border-slate-300 rounded text-xs font-bold w-full"
                            placeholder="Tên người chơi"
                          />
                          <button
                            type="button"
                            onClick={() => setPickingCharacterPlayerIdx(idx)}
                            className="text-[10px] text-red-600 font-bold hover:underline text-left"
                          >
                            Đổi nhân vật 2D ❯
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-xs text-slate-800 truncate">
                            {cfg.name}
                          </span>
                          <div className="flex gap-1 mt-0.5">
                            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(lvl => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => updatePlayerConfig(idx, { aiLevel: lvl })}
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  cfg.aiLevel === lvl
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'TB' : 'Khó'}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Launch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startNewGame(playerConfigs)}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-black text-lg tracking-wider uppercase rounded-2xl shadow-xl transition-all transform active:scale-95"
              >
                VÀO BÀN CHƠI NGAY
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Playing Screen */
        <main className="flex-1 p-2 sm:p-4 flex flex-col lg:flex-row gap-4 max-w-[1440px] mx-auto w-full items-start justify-center">
          {/* Left Column: Player Cards HUD with Hover Tooltips */}
          <section className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
            <span className="font-display font-black text-xs text-slate-700 uppercase tracking-wider px-1">
              Bảng Người Chơi ({players.length})
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {players.map((p, idx) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isCurrentTurn={idx === turnIndex}
                  onOpenInventory={() => setShowInventoryPlayerId(p.id)}
                  onPayBail={payBail}
                  bailInfo={canPlayerPayBail(p)}
                  allTiles={tiles}
                  allConsumables={consumableShop}
                  allPermanents={permanentShop}
                />
              ))}
            </div>
          </section>

          {/* Center Column: The 40-Tile Board */}
          <section className="flex-1 w-full flex flex-col items-center">
            <BoardView
              tiles={tiles}
              players={players}
              activePlayer={activePlayer!}
              onSelectTile={tile => {
                setActivePropertyModalTile(tile);
                setIsLandingPropertyAction(false);
              }}
            />
          </section>

          {/* Right Column: Controls & Game Log */}
          <section className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
            {/* Active Turn Control Box */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-3">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Lượt Hiện Tại
                </span>
                <span className="font-display text-lg font-black text-slate-900 uppercase">
                  {activePlayer?.name}
                </span>
                {activePlayer?.isAI && (
                  <span className="text-[10px] text-amber-700 font-bold block">
                    (Máy tính đang suy nghĩ...)
                  </span>
                )}
              </div>

              {/* Dice Roller */}
              <DiceRoller
                dice={dice}
                onRoll={rollDice}
                disabled={!canRoll || isMovingStepByStep || activePlayer?.isAI || activePlayer?.bankrupt}
                isRolling={isRolling}
              />

              {/* Fast Forward / Skip Movement Button during step-by-step hopping */}
              {isMovingStepByStep && (
                <button
                  onClick={skipMovement}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors animate-pulse"
                >
                  Bỏ Qua Di Chuyển ⏩
                </button>
              )}

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowInventoryPlayerId(activePlayer?.id || null)}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>⚡</span>
                  <span>Túi Đồ & Kích Hoạt Năng Lực</span>
                </button>

                {!canRoll && !isMovingStepByStep && !activePlayer?.isAI && (
                  <button
                    onClick={endTurn}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition-colors"
                  >
                    Kết Thúc Lượt Của Bạn
                  </button>
                )}
              </div>
            </div>

            {/* Game Live Action Log */}
            <GameLog logs={logs} />
          </section>
        </main>
      )}

      {/* Modals */}
      {/* 1. Property Deed Modal (With upgrade limitation rule) */}
      {activePropertyModalTile && (
        <PropertyModal
          tile={activePropertyModalTile}
          owner={activePropertyOwner}
          activePlayer={activePlayer!}
          onBuy={() => buyProperty(activePropertyModalTile)}
          onBuildHouse={() => {
            const res = buildHouse(activePropertyModalTile);
            if (!res.success && res.message) {
              alert(res.message);
            }
          }}
          onMortgage={() => mortgageProperty(activePropertyModalTile)}
          onUnmortgage={() => unmortgageProperty(activePropertyModalTile)}
          onPayRent={() => {
            if (activePropertyOwner) {
              setActivePropertyModalTile(null);
              setIsLandingPropertyAction(false);
            }
          }}
          onClose={() => {
            setActivePropertyModalTile(null);
            setIsLandingPropertyAction(false);
          }}
          rentAmount={currentRent}
          isLandingAction={isLandingPropertyAction}
          hasMovedThisTurn={hasMovedThisTurn}
          upgradesThisTurn={upgradesThisTurn}
        />
      )}

      {/* 2. Station Ability Shop (Bến Xe - Consumable) */}
      {activeStationModal && (
        <StationAbilityModal
          tile={activeStationModal}
          player={activePlayer!}
          abilities={consumableShop}
          onBuyAbility={buyConsumableAbility}
          onClose={() => setActiveStationModal(null)}
          hasVipDiscount={activePlayer?.permanentAbilities.includes('perm-station-vip')}
        />
      )}

      {/* 3. Utility Ability Shop (Điện Lực / Thủy Cục - Permanent) */}
      {activeUtilityModal && (
        <UtilityAbilityModal
          tile={activeUtilityModal}
          player={activePlayer!}
          abilities={permanentShop}
          onBuyAbility={buyPermanentAbility}
          onSellAbility={sellPermanentAbility}
          onClose={() => setActiveUtilityModal(null)}
        />
      )}

      {/* 4. Drawn Card Modal (Chance / Chest) */}
      {activeDrawnCard && (
        <CardModal
          card={activeDrawnCard}
          onExecute={() => executeDrawnCard(activeDrawnCard)}
          onClose={() => setActiveDrawnCard(null)}
          isActionable={true}
        />
      )}

      {/* 5. Inventory Modal */}
      {showInventoryPlayerId && (
        <InventoryModal
          player={players.find(p => p.id === showInventoryPlayerId)!}
          allConsumables={consumableShop}
          allPermanents={permanentShop}
          tiles={tiles}
          onUseAbility={useConsumableAbility}
          onClose={() => setShowInventoryPlayerId(null)}
          isCurrentTurn={showInventoryPlayerId === activePlayer?.id}
          canUseDiceModifiers={canRoll}
        />
      )}

      {/* 6. Settings & Custom Creator Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          chanceDeck={chanceDeck}
          chestDeck={chestDeck}
          onUpdateCardQuantity={updateCardQuantity}
          onAddCustomCard={card => {
            if (card.deck === 'chance') setChanceDeck(prev => [...prev, card]);
            else setChestDeck(prev => [...prev, card]);
          }}
          consumableShop={consumableShop}
          permanentShop={permanentShop}
          onUpdateConsumableQuantity={updateConsumableQuantity}
          onUpdatePermanentQuantity={updatePermanentQuantity}
          onAddCustomConsumable={ab => setConsumableShop(prev => [...prev, ab])}
          onAddCustomPermanent={ab => setPermanentShop(prev => [...prev, ab])}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 7. Character Selection Modal */}
      {pickingCharacterPlayerIdx !== null && (
        <CharacterSelectModal
          selectedCharacterId={playerConfigs[pickingCharacterPlayerIdx].characterId}
          onSelect={(c: Character) => {
            updatePlayerConfig(pickingCharacterPlayerIdx, {
              characterId: c.id,
              name: c.name,
            });
          }}
          onClose={() => setPickingCharacterPlayerIdx(null)}
          playerName={`Vị trí #${pickingCharacterPlayerIdx + 1}`}
        />
      )}

      {/* 8. Target Player Selection Modal */}
      {activeTargetAbility && (
        <TargetPlayerModal
          ability={activeTargetAbility}
          activePlayer={activePlayer!}
          availableTargets={getAvailableTargets()}
          onSelectTarget={target => useConsumableAbility(activeTargetAbility, target)}
          onCancel={() => setActiveTargetAbility(null)}
        />
      )}

      {/* 9. Permanent Ability Auto-Activation Notification Modal */}
      {activeAbilityNotification && (
        <PermanentTriggerModal
          notification={activeAbilityNotification}
          onDismiss={() => setActiveAbilityNotification(null)}
        />
      )}

      {/* 10. AI Action Pause Modal (Player can read what AI did, click anywhere to dismiss) */}
      {aiActionModalInfo && (
        <AiActionModal
          aiPlayer={aiActionModalInfo.aiPlayer}
          title={aiActionModalInfo.title}
          message={aiActionModalInfo.message}
          type={aiActionModalInfo.type}
          onDismiss={() => setAiActionModalInfo(null)}
        />
      )}

      {/* 11. Game Over Victory Modal */}
      {winner && (
        <GameOverModal
          winner={winner}
          tiles={tiles}
          onRestart={() => startNewGame(playerConfigs)}
        />
      )}
    </div>
  );
}
