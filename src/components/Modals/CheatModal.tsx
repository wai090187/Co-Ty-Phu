/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, Tile, ConsumableAbility, PermanentAbility, Card } from '../../types/game';
import { CheatModalHeader } from './cheat/CheatModalHeader';
import { CheatModalPlayerSelector } from './cheat/CheatModalPlayerSelector';
import { CheatPropertiesTab } from './cheat/CheatPropertiesTab';
import { CheatSkillsTab } from './cheat/CheatSkillsTab';
import { CheatDiceTab } from './cheat/CheatDiceTab';
import { CheatCardsTab } from './cheat/CheatCardsTab';
import { CheatQuickTab } from './cheat/CheatQuickTab';

interface CheatModalProps {
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
  cheatNextDice: [number, number] | null;
  onSetCheatNextDice: (dice: [number, number] | null) => void;
  cheatNextChanceCardId: string | null;
  onSetCheatNextChanceCardId: (id: string | null) => void;
  cheatNextChestCardId: string | null;
  onSetCheatNextChestCardId: (id: string | null) => void;
  onTogglePropertyOwner: (playerId: number, tileId: number) => void;
  onSetPropertyHouses: (playerId: number, tileId: number, count: number) => void;
  onAddConsumable: (playerId: number, abilityId: string) => void;
  onRemoveConsumable: (playerId: number, index: number) => void;
  onAddPermanent: (playerId: number, abilityId: string) => void;
  onRemovePermanent: (playerId: number, abilityId: string) => void;
  onSetGetOutOfJailCards: (playerId: number, count: number) => void;
  onSetCash: (playerId: number, amount: number) => void;
  onToggleJail: (playerId: number) => void;
  onTeleportPlayer: (playerId: number, targetTileId: number, triggerLanding: boolean) => void;
}

type CheatTab = 'properties' | 'skills' | 'dice' | 'cards' | 'quick';

export const CheatModal: React.FC<CheatModalProps> = ({
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
  const purchasableTiles = tiles.filter(
    t => t.type === 'property' || t.type === 'station' || t.type === 'utility'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        <CheatModalHeader onClose={onClose} />

        <CheatModalPlayerSelector
          players={players}
          selectedPlayerId={selectedPlayerId}
          onSelectPlayer={onSelectPlayer}
        />

        {/* Navigation Tabs */}
        <div className="shrink-0 flex border-b border-slate-800 bg-slate-900/90 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
          {activeTab === 'properties' && (
            <CheatPropertiesTab
              selectedPlayer={selectedPlayer}
              players={players}
              purchasableTiles={purchasableTiles}
              onTogglePropertyOwner={onTogglePropertyOwner}
              onSetPropertyHouses={onSetPropertyHouses}
            />
          )}

          {activeTab === 'skills' && (
            <CheatSkillsTab
              selectedPlayer={selectedPlayer}
              consumableShop={consumableShop}
              permanentShop={permanentShop}
              selectedConsumableToAdd={selectedConsumableToAdd}
              setSelectedConsumableToAdd={setSelectedConsumableToAdd}
              selectedPermanentToAdd={selectedPermanentToAdd}
              setSelectedPermanentToAdd={setSelectedPermanentToAdd}
              onSetGetOutOfJailCards={onSetGetOutOfJailCards}
              onAddConsumable={onAddConsumable}
              onRemoveConsumable={onRemoveConsumable}
              onAddPermanent={onAddPermanent}
              onRemovePermanent={onRemovePermanent}
            />
          )}

          {activeTab === 'dice' && (
            <CheatDiceTab
              cheatNextDice={cheatNextDice}
              onSetCheatNextDice={onSetCheatNextDice}
            />
          )}

          {activeTab === 'cards' && (
            <CheatCardsTab
              chanceDeck={chanceDeck}
              chestDeck={chestDeck}
              cheatNextChanceCardId={cheatNextChanceCardId}
              onSetCheatNextChanceCardId={onSetCheatNextChanceCardId}
              cheatNextChestCardId={cheatNextChestCardId}
              onSetCheatNextChestCardId={onSetCheatNextChestCardId}
            />
          )}

          {activeTab === 'quick' && (
            <CheatQuickTab
              selectedPlayer={selectedPlayer}
              tiles={tiles}
              onSetCash={onSetCash}
              onToggleJail={onToggleJail}
              onTeleportPlayer={onTeleportPlayer}
            />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">Esc</kbd> để đóng bảng Cheat.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
          >
            Hoàn Tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
