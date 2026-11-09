/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ConsumableAbility, PermanentAbility, Player, Tile } from '../../types/game';
import { CharacterIllustration2D5 } from '../Common/CharacterIllustration2D5';
import { InventoryFreeJailSection } from './inventory/InventoryFreeJailSection';
import { InventoryPropertiesSection } from './inventory/InventoryPropertiesSection';

interface Props {
  player: Player;
  allConsumables: ConsumableAbility[];
  allPermanents: PermanentAbility[];
  tiles: Tile[];
  onUseAbility: (ability: ConsumableAbility) => void;
  onUseGetOutOfJailCard?: () => void;
  onClose: () => void;
  isCurrentTurn: boolean;
  canUseDiceModifiers?: boolean;
}

export const InventoryModal: React.FC<Props> = ({
  player,
  allConsumables,
  allPermanents,
  tiles,
  onUseAbility,
  onUseGetOutOfJailCard,
  onClose,
  isCurrentTurn,
  canUseDiceModifiers = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const ownedConsumables = player.consumableAbilities
    .map(id => allConsumables.find(a => a.id === id))
    .filter((a): a is ConsumableAbility => !!a);

  const ownedPermanents = player.permanentAbilities
    .map(id => allPermanents.find(a => a.id === id))
    .filter((a): a is PermanentAbility => !!a);

  const ownedProperties = player.propertiesOwned
    .map(id => tiles.find(t => t.id === id))
    .filter((t): t is Tile => !!t);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape' || e.key === 'Control') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (ownedConsumables.length > 0) {
          setSelectedIndex((prev: number) => (prev + 1) % ownedConsumables.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (ownedConsumables.length > 0) {
          setSelectedIndex(
            (prev: number) => (prev - 1 + ownedConsumables.length) % ownedConsumables.length
          );
        }
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (ownedConsumables.length > 0) {
          const selected = ownedConsumables[selectedIndex];
          if (selected) {
            const canUseNow = isCurrentTurn;
            if (canUseNow) {
              onUseAbility(selected);
              onClose();
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ownedConsumables, selectedIndex, isCurrentTurn, canUseDiceModifiers, onUseAbility, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF8F5] border-2 border-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 shrink-0 flex items-center justify-center">
              <CharacterIllustration2D5
                characterId={player.characterId}
                isAI={player.isAI}
                aiNumber={player.id}
                aiLevel={player.aiLevel}
                emotion="action"
                size="sm"
                showPedestal={false}
              />
            </div>
            <div>
              <h2 className="font-display text-lg font-black tracking-wide uppercase">
                Túi Đồ & Năng Lực Của Bạn
              </h2>
              <span className="text-xs text-slate-300">
                {player.name} · Tiền mặt:{' '}
                <b className="text-emerald-400 font-mono">{player.cash} đ</b>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          <InventoryFreeJailSection
            player={player}
            isCurrentTurn={isCurrentTurn}
            onUseGetOutOfJailCard={onUseGetOutOfJailCard}
          />

          {/* Consumable Abilities */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">
                ⚡ Năng Lực Dùng 1 Lần ({ownedConsumables.length}/3)
              </span>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                Dùng phím [↑ / ↓] chọn, [Space] dùng
              </span>
            </div>

            {ownedConsumables.length === 0 ? (
              <p className="text-slate-400 italic py-2">
                Chưa có thẻ nào. Hãy ghé các Bến Xe trên bàn cờ để mua thẻ năng lực bí mật!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {ownedConsumables.map((ab, idx) => {
                  const canUseNow = isCurrentTurn;
                  const isSelected = selectedIndex === idx;

                  return (
                    <div
                      key={`${ab.id}-${idx}`}
                      onClick={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/60 scale-[1.01]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ab.name}</span>
                          {isSelected && (
                            <span className="text-[9.5px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded border border-amber-400 flex items-center gap-1">
                              <span>👉</span> Đang chọn (↑ / ↓)
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5">{ab.description}</p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (canUseNow) {
                            onUseAbility(ab);
                            onClose();
                          }
                        }}
                        disabled={!canUseNow}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5 ${
                          canUseNow
                            ? isSelected
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md ring-2 ring-amber-300'
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>{canUseNow ? 'Kích Hoạt' : 'Chưa Thể Dùng'}</span>
                        {canUseNow && isSelected && (
                          <kbd className="px-1.5 py-0.2 text-[9px] bg-white/20 rounded font-mono">
                            Space
                          </kbd>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <InventoryPropertiesSection
            player={player}
            ownedPermanents={ownedPermanents}
            ownedProperties={ownedProperties}
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
            <span className="text-amber-800 font-bold">⌨️ Phím tắt:</span>
            <span>[↑ / ↓] Chọn thẻ</span>
            <span>•</span>
            <span>[Space] Dùng</span>
            <span>•</span>
            <span>[Esc / Ctrl] Đóng</span>
          </div>

          <div className="flex justify-end w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow flex items-center gap-1.5"
            >
              <span>Đóng</span>
              <kbd className="px-1.5 py-0.2 text-[10px] bg-slate-700 text-slate-200 rounded border border-slate-600 font-mono">
                Esc
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
