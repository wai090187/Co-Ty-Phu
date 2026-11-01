import React, { useState, useEffect } from 'react';
import { Player, Tile, ConsumableAbility, PermanentAbility, Card } from '../../types/game';
import { CharacterAvatar } from '../Common/CharacterAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  selectedPlayerId: number;
  onSelectPlayer: (id: number) => void;
  tiles: Tile[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  chanceDeck: Card[];
  chestDeck: Card[];
  // Cheat State
  cheatNextDice: [number, number] | null;
  onSetCheatNextDice: (dice: [number, number] | null) => void;
  cheatNextChanceCardId: string | null;
  onSetCheatNextChanceCardId: (id: string | null) => void;
  cheatNextChestCardId: string | null;
  onSetCheatNextChestCardId: (id: string | null) => void;
  // Cheat Actions
  onTogglePropertyOwner: (playerId: number, tileId: number) => void;
  onSetPropertyHouses: (playerId: number, tileId: number, count: number) => void;
  onAddConsumable: (playerId: number, abilityId: string) => void;
  onRemoveConsumable: (playerId: number, index: number) => void;
  onAddPermanent: (playerId: number, abilityId: string) => void;
  onRemovePermanent: (playerId: number, abilityId: string) => void;
  onSetGetOutOfJailCards: (playerId: number, count: number) => void;
  onSetCash: (playerId: number, amount: number) => void;
  onToggleJail: (playerId: number) => void;
  onTeleportPlayer: (playerId: number, tileId: number) => void;
}

type CheatTab = 'properties' | 'skills' | 'dice' | 'cards' | 'quick';

export const CheatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  players,
  selectedPlayerId,
  onSelectPlayer,
  tiles,
  consumableShop,
  permanentShop,
  chanceDeck,
  chestDeck,
  cheatNextDice,
  onSetCheatNextDice,
  cheatNextChanceCardId,
  onSetCheatNextChanceCardId,
  cheatNextChestCardId,
  onSetCheatNextChestCardId,
  onTogglePropertyOwner,
  onSetPropertyHouses,
  onAddConsumable,
  onRemoveConsumable,
  onAddPermanent,
  onRemovePermanent,
  onSetGetOutOfJailCards,
  onSetCash,
  onToggleJail,
  onTeleportPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<CheatTab>('properties');
  const [selectedConsumableToAdd, setSelectedConsumableToAdd] = useState<string>('');
  const [selectedPermanentToAdd, setSelectedPermanentToAdd] = useState<string>('');
  const [targetTeleportTile, setTargetTeleportTile] = useState<number>(0);
  const [cashInput, setCashInput] = useState<string>('');

  // Selected dice state
  const [diceD1, setDiceD1] = useState<number>(cheatNextDice ? cheatNextDice[0] : 6);
  const [diceD2, setDiceD2] = useState<number>(cheatNextDice ? cheatNextDice[1] : 6);

  // Selected card state
  const [selectedChanceId, setSelectedChanceId] = useState<string>('');
  const [selectedChestId, setSelectedChestId] = useState<string>('');

  useEffect(() => {
    if (consumableShop.length > 0 && !selectedConsumableToAdd) {
      setSelectedConsumableToAdd(consumableShop[0].id);
    }
  }, [consumableShop, selectedConsumableToAdd]);

  useEffect(() => {
    if (permanentShop.length > 0 && !selectedPermanentToAdd) {
      setSelectedPermanentToAdd(permanentShop[0].id);
    }
  }, [permanentShop, selectedPermanentToAdd]);

  useEffect(() => {
    if (chanceDeck.length > 0 && !selectedChanceId) {
      setSelectedChanceId(chanceDeck[0].id);
    }
  }, [chanceDeck, selectedChanceId]);

  useEffect(() => {
    if (chestDeck.length > 0 && !selectedChestId) {
      setSelectedChestId(chestDeck[0].id);
    }
  }, [chestDeck, selectedChestId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  // Filter purchasable tiles (properties, stations, utilities)
  const purchasableTiles = tiles.filter(
    t => t.type === 'property' || t.type === 'station' || t.type === 'utility'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Header */}
        <div className="shrink-0 p-3.5 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-500/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-rose-600/40">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-black tracking-wide uppercase text-rose-300">
                  Bảng Điều Khiển Cheat & Kiểm Thử
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-mono text-[10px] font-bold border border-rose-400/40">
                  TEST MODE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tự do can thiệp đất đai, nhà cửa, kỹ năng, xúc xắc và các thẻ sự kiện để test game.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm border border-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Player Selector Bar */}
        <div className="shrink-0 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Chọn Người Chơi:
          </span>
          {players.map(p => {
            const isSelected = p.id === selectedPlayerId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlayer(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30 scale-102'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                  <CharacterAvatar
                    characterId={p.characterId}
                    isAI={p.isAI}
                    aiNumber={p.id}
                    aiLevel={p.aiLevel}
                    size="sm"
                  />
                </div>
                <span>{p.name}</span>
                <span className="text-[10px] opacity-80 font-mono">({p.cash}đ)</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="shrink-0 px-4 bg-slate-800/90 border-b border-slate-700 flex gap-2 overflow-x-auto text-xs font-bold min-h-[44px]">
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'properties'
                ? 'border-rose-400 text-rose-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏢</span>
            <span>Đất Đai & Cấp Nhà ({selectedPlayer.propertiesOwned.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'skills'
                ? 'border-rose-400 text-rose-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡</span>
            <span>Kỹ Năng & Thẻ Ra Tù</span>
          </button>

          <button
            onClick={() => setActiveTab('dice')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dice'
                ? 'border-rose-400 text-rose-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎲</span>
            <span>Chỉ Định Xúc Xắc {cheatNextDice ? `[${cheatNextDice[0]}-${cheatNextDice[1]}]` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cards'
                ? 'border-rose-400 text-rose-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🃏</span>
            <span>Chỉ Định Cơ Hội / Khí Vận</span>
          </button>

          <button
            onClick={() => setActiveTab('quick')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'quick'
                ? 'border-rose-400 text-rose-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💰</span>
            <span>Tiền Tệ, Tù & Dịch Chuyển</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 text-xs">
          {/* TAB 1: PROPERTIES & HOUSES */}
          {activeTab === 'properties' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-300">
                  Đang can thiệp tài sản của: <b className="text-rose-300">{selectedPlayer.name}</b>
                </span>
                <span className="text-slate-400 text-[11px]">
                  Bấm gán đất hoặc tăng/giảm cấp nhà (0 = đất trống, 1-4 = nhà, 5 = khách sạn)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {purchasableTiles.map(tile => {
                  const owner = players.find(p => p.propertiesOwned.includes(tile.id));
                  const isOwnedBySelected = owner?.id === selectedPlayer.id;
                  const houseCount = selectedPlayer.houses[tile.id] || 0;

                  return (
                    <div
                      key={tile.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        isOwnedBySelected
                          ? 'bg-slate-800 border-rose-500/70 shadow-md ring-1 ring-rose-500/40'
                          : owner
                          ? 'bg-slate-900/90 border-slate-700 opacity-80'
                          : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                            style={{ backgroundColor: tile.colorHex || '#94a3b8' }}
                          />
                          <div>
                            <span className="font-bold text-slate-100 text-[13px]">{tile.name}</span>
                            <span className="text-slate-400 text-[10px] block">
                              {tile.type === 'property' ? 'Bất Động Sản' : tile.type === 'station' ? 'Bến Xe' : 'Dịch Vụ'} · {tile.price}đ
                            </span>
                          </div>
                        </div>

                        {owner ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOwnedBySelected
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isOwnedBySelected ? 'Của người này' : owner.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            Ngân Hàng
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 gap-2">
                        {isOwnedBySelected ? (
                          <>
                            <button
                              onClick={() => onTogglePropertyOwner(selectedPlayer.id, tile.id)}
                              className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[11px] font-bold transition-colors"
                            >
                              ✕ Thu hồi
                            </button>

                            {tile.type === 'property' && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[11px]">Cấp:</span>
                                <button
                                  onClick={() =>
                                    onSetPropertyHouses(selectedPlayer.id, tile.id, Math.max(0, houseCount - 1))
                                  }
                                  disabled={houseCount === 0}
                                  className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className="font-mono font-bold text-amber-300 px-1 text-xs">
                                  {houseCount === 5 ? '🏨 KS' : houseCount > 0 ? `🏠 ${houseCount}` : 'Đất'}
                                </span>
                                <button
                                  onClick={() =>
                                    onSetPropertyHouses(selectedPlayer.id, tile.id, Math.min(5, houseCount + 1))
                                  }
                                  disabled={houseCount === 5}
                                  className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => onTogglePropertyOwner(selectedPlayer.id, tile.id)}
                            className="w-full py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors"
                          >
                            + Gán Cho {selectedPlayer.name}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & JAIL FREE CARDS */}
          {activeTab === 'skills' && (
            <div className="flex flex-col gap-4">
              {/* Free Jail Cards Stepper */}
              <div className="p-3.5 rounded-xl border border-indigo-500/50 bg-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-sm shrink-0">
                    🎟️
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 text-sm">Thẻ Ra Tù Miễn Phí</span>
                    <p className="text-slate-400 text-[11px]">
                      Số lượng thẻ đang sở hữu:{' '}
                      <b className="text-indigo-400 font-mono text-sm">{selectedPlayer.getOutOfJailCards || 0}</b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onSetGetOutOfJailCards(
                        selectedPlayer.id,
                        Math.max(0, (selectedPlayer.getOutOfJailCards || 0) - 1)
                      )
                    }
                    disabled={(selectedPlayer.getOutOfJailCards || 0) <= 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 font-bold text-xs"
                  >
                    -1 Thẻ
                  </button>
                  <button
                    onClick={() =>
                      onSetGetOutOfJailCards(
                        selectedPlayer.id,
                        (selectedPlayer.getOutOfJailCards || 0) + 1
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
                  >
                    +1 Thẻ
                  </button>
                  <button
                    onClick={() =>
                      onSetGetOutOfJailCards(
                        selectedPlayer.id,
                        (selectedPlayer.getOutOfJailCards || 0) + 3
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs shadow"
                  >
                    +3 Thẻ
                  </button>
                </div>
              </div>

              {/* Consumable Abilities Section */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">
                    ⚡ Năng Lực Dùng 1 Lần ({selectedPlayer.consumableAbilities.length}/3)
                  </span>
                  <span className="text-slate-400 text-[11px]">Mua tại các Bến Xe</span>
                </div>

                {/* Current Consumables */}
                {selectedPlayer.consumableAbilities.length === 0 ? (
                  <p className="text-slate-500 italic py-1">Người chơi chưa có thẻ dùng 1 lần nào.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {selectedPlayer.consumableAbilities.map((abId, idx) => {
                      const ab = consumableShop.find(a => a.id === abId);
                      return (
                        <div
                          key={`${abId}-${idx}`}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-amber-300">{ab?.name || abId}</span>
                            <p className="text-slate-400 text-[10px]">{ab?.description}</p>
                          </div>
                          <button
                            onClick={() => onRemoveConsumable(selectedPlayer.id, idx)}
                            className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded font-bold text-[10px]"
                          >
                            Xóa
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Consumable Form */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                  <select
                    value={selectedConsumableToAdd}
                    onChange={e => setSelectedConsumableToAdd(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    {consumableShop.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.cost}đ)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedConsumableToAdd) {
                        onAddConsumable(selectedPlayer.id, selectedConsumableToAdd);
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 shadow"
                  >
                    + Thêm Thẻ
                  </button>
                </div>
              </div>

              {/* Permanent Abilities Section */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">
                    👑 Năng Lực Vĩnh Viễn ({selectedPlayer.permanentAbilities.length})
                  </span>
                  <span className="text-slate-400 text-[11px]">Mua tại Điện Lực / Thủy Cục</span>
                </div>

                {/* Current Permanents */}
                {selectedPlayer.permanentAbilities.length === 0 ? (
                  <p className="text-slate-500 italic py-1">Người chơi chưa sở hữu năng lực VIP nào.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {selectedPlayer.permanentAbilities.map(abId => {
                      const ab = permanentShop.find(a => a.id === abId);
                      return (
                        <div
                          key={abId}
                          className="p-2 rounded-lg bg-slate-900 border border-amber-900/50 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-amber-400">{ab?.name || abId}</span>
                            <p className="text-slate-400 text-[10px]">{ab?.description}</p>
                          </div>
                          <button
                            onClick={() => onRemovePermanent(selectedPlayer.id, abId)}
                            className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded font-bold text-[10px]"
                          >
                            Xóa
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Permanent Form */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                  <select
                    value={selectedPermanentToAdd}
                    onChange={e => setSelectedPermanentToAdd(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    {permanentShop.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.cost}đ)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedPermanentToAdd) {
                        onAddPermanent(selectedPlayer.id, selectedPermanentToAdd);
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 shadow"
                  >
                    + Thêm VIP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORCED DICE ROLL */}
          {activeTab === 'dice' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="font-bold text-rose-300 text-sm block mb-1">
                  Chỉ Định Giá Trị Xúc Xắc Tiếp Theo
                </span>
                <p className="text-slate-400 text-xs">
                  Khi người chơi tung xúc xắc trong lượt tới, hệ thống sẽ sử dụng chính xác kết quả bạn thiết lập dưới đây thay vì ngẫu nhiên.
                </p>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Trạng thái hiện tại:</span>
                  {cheatNextDice ? (
                    <span className="font-bold text-emerald-400 text-sm font-mono">
                      🎯 Đã ghim: [{cheatNextDice[0]}] và [{cheatNextDice[1]}] (Tổng: {cheatNextDice[0] + cheatNextDice[1]})
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">🎲 Ngẫu nhiên bình thường (chưa ghim)</span>
                  )}
                </div>
                {cheatNextDice && (
                  <button
                    onClick={() => onSetCheatNextDice(null)}
                    className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded-lg font-bold text-xs"
                  >
                    Hủy Ghim
                  </button>
                )}
              </div>

              {/* Dice Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="font-bold text-slate-200 block mb-2">Xúc Xắc 1 (1 - 6):</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(val => (
                      <button
                        key={val}
                        onClick={() => setDiceD1(val)}
                        className={`py-2 rounded-lg font-mono font-bold text-sm border transition-all ${
                          diceD1 === val
                            ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="font-bold text-slate-200 block mb-2">Xúc Xắc 2 (1 - 6):</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(val => (
                      <button
                        key={val}
                        onClick={() => setDiceD2(val)}
                        className={`py-2 rounded-lg font-mono font-bold text-sm border transition-all ${
                          diceD2 === val
                            ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fast Presets */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Phím nhanh:</span>
                <button
                  onClick={() => {
                    setDiceD1(1);
                    setDiceD2(1);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
                >
                  Đôi 1-1 (Ra tù)
                </button>
                <button
                  onClick={() => {
                    setDiceD1(6);
                    setDiceD2(6);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
                >
                  Đôi 6-6 (Max 12)
                </button>
                <button
                  onClick={() => {
                    setDiceD1(3);
                    setDiceD2(4);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
                >
                  Tổng 7 (Lucky 7)
                </button>
                <button
                  onClick={() => {
                    setDiceD1(1);
                    setDiceD2(2);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs"
                >
                  Tổng 3 (Ngắn)
                </button>
              </div>

              {/* Submit button */}
              <button
                onClick={() => onSetCheatNextDice([diceD1, diceD2])}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all"
              >
                Khóa Giá Trị: [{diceD1}] và [{diceD2}] (Tổng: {diceD1 + diceD2} bước)
              </button>
            </div>
          )}

          {/* TAB 4: FORCED CHANCE & CHEST CARDS */}
          {activeTab === 'cards' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="font-bold text-rose-300 text-sm block mb-1">
                  Chỉ Định Thẻ Cơ Hội & Khí Vận Tiếp Theo
                </span>
                <p className="text-slate-400 text-xs">
                  Khi người chơi đi vào ô Cơ Hội hoặc Khí Vận, lá bài bạn chọn ở đây sẽ được rút ra đầu tiên.
                </p>
              </div>

              {/* Chance Card Picker */}
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-slate-800/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">
                    ❓ Thẻ Cơ Hội (Chance) Tiếp Theo
                  </span>
                  {cheatNextChanceCardId ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px]">
                      ĐÃ GHIM
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Ngẫu nhiên</span>
                  )}
                </div>

                <select
                  value={selectedChanceId}
                  onChange={e => setSelectedChanceId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  {chanceDeck.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}: {c.description}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedChanceId) onSetCheatNextChanceCardId(selectedChanceId);
                    }}
                    className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
                  >
                    Ghim Thẻ Cơ Hội Này
                  </button>
                  {cheatNextChanceCardId && (
                    <button
                      onClick={() => onSetCheatNextChanceCardId(null)}
                      className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>

              {/* Chest Card Picker */}
              <div className="p-3.5 rounded-xl border border-sky-500/40 bg-slate-800/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 text-sm">
                    💼 Thẻ Khí Vận (Community Chest) Tiếp Theo
                  </span>
                  {cheatNextChestCardId ? (
                    <span className="px-2 py-0.5 rounded bg-sky-500 text-slate-900 font-bold text-[10px]">
                      ĐÃ GHIM
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Ngẫu nhiên</span>
                  )}
                </div>

                <select
                  value={selectedChestId}
                  onChange={e => setSelectedChestId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  {chestDeck.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}: {c.description}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedChestId) onSetCheatNextChestCardId(selectedChestId);
                    }}
                    className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow"
                  >
                    Ghim Thẻ Khí Vận Này
                  </button>
                  {cheatNextChestCardId && (
                    <button
                      onClick={() => onSetCheatNextChestCardId(null)}
                      className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: QUICK ACTIONS (CASH, JAIL, TELEPORT) */}
          {activeTab === 'quick' && (
            <div className="flex flex-col gap-4">
              {/* Cash Management */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col gap-2.5">
                <span className="font-bold text-emerald-400 text-sm">
                  💰 Tiền Mặt: {selectedPlayer.name} (Hiện tại: <b className="font-mono text-white">{selectedPlayer.cash}đ</b>)
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onSetCash(selectedPlayer.id, selectedPlayer.cash + 500)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-bold text-xs text-white"
                  >
                    +500đ
                  </button>
                  <button
                    onClick={() => onSetCash(selectedPlayer.id, selectedPlayer.cash + 1000)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-bold text-xs text-white"
                  >
                    +1,000đ
                  </button>
                  <button
                    onClick={() => onSetCash(selectedPlayer.id, selectedPlayer.cash + 5000)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-bold text-xs text-white"
                  >
                    +5,000đ
                  </button>
                  <button
                    onClick={() => onSetCash(selectedPlayer.id, Math.max(0, selectedPlayer.cash - 500))}
                    className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 font-bold text-xs text-white"
                  >
                    -500đ
                  </button>
                  <button
                    onClick={() => onSetCash(selectedPlayer.id, 0)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs text-rose-300"
                  >
                    Về 0đ
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="Nhập số tiền..."
                    value={cashInput}
                    onChange={e => setCashInput(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(cashInput, 10);
                      if (!isNaN(val)) {
                        onSetCash(selectedPlayer.id, Math.max(0, val));
                        setCashInput('');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                  >
                    Đặt Số Dư
                  </button>
                </div>
              </div>

              {/* Jail Status Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 text-sm block">Trạng Thái Tù / Điều Tra</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Hiện trạng: {selectedPlayer.inJail ? '🚨 Đang bị giam giữ / điều tra' : '✅ Tự do'}
                  </p>
                </div>

                <button
                  onClick={() => onToggleJail(selectedPlayer.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition-colors ${
                    selectedPlayer.inJail
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-700 hover:bg-rose-600 text-white'
                  }`}
                >
                  {selectedPlayer.inJail ? 'Thả Tự Do Ngay' : 'Đưa Vào Tù / Điều Tra'}
                </button>
              </div>

              {/* Teleportation */}
              <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col gap-2.5">
                <span className="font-bold text-purple-400 text-sm">
                  🌀 Dịch Chuyển Tức Thời Đến Bất Kỳ Ô Nào
                </span>
                <p className="text-slate-400 text-[11px]">
                  Vị trí hiện tại: Ô {selectedPlayer.position} - [{tiles[selectedPlayer.position]?.name}]
                </p>

                <div className="flex items-center gap-2">
                  <select
                    value={targetTeleportTile}
                    onChange={e => setTargetTeleportTile(parseInt(e.target.value, 10))}
                    className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  >
                    {tiles.map(t => (
                      <option key={t.id} value={t.id}>
                        Ô {t.id}: {t.name} ({t.type})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onTeleportPlayer(selectedPlayer.id, targetTeleportTile)}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 shadow"
                  >
                    Dịch Chuyển Ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">Esc</kbd> để đóng bảng Cheat.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow-md shadow-rose-600/30 transition-colors"
          >
            Hoàn Tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
