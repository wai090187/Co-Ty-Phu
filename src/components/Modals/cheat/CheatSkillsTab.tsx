/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, ConsumableAbility, PermanentAbility } from '../../../types/game';

interface Props {
  selectedPlayer: Player;
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  selectedConsumableToAdd: string;
  setSelectedConsumableToAdd: (id: string) => void;
  selectedPermanentToAdd: string;
  setSelectedPermanentToAdd: (id: string) => void;
  onSetGetOutOfJailCards: (playerId: number, count: number) => void;
  onAddConsumable: (playerId: number, abilityId: string) => void;
  onRemoveConsumable: (playerId: number, index: number) => void;
  onAddPermanent: (playerId: number, abilityId: string) => void;
  onRemovePermanent: (playerId: number, abilityId: string) => void;
}

export const CheatSkillsTab: React.FC<Props> = ({
  selectedPlayer,
  consumableShop,
  permanentShop,
  selectedConsumableToAdd,
  setSelectedConsumableToAdd,
  selectedPermanentToAdd,
  setSelectedPermanentToAdd,
  onSetGetOutOfJailCards,
  onAddConsumable,
  onRemoveConsumable,
  onAddPermanent,
  onRemovePermanent,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Get out of jail cards */}
      <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-200 text-sm block">Thẻ Ra Tù Miễn Phí</span>
          <p className="text-slate-400 text-[11px]">
            Số lượng thẻ đang sở hữu:{' '}
            <b className="text-indigo-400 font-mono text-sm">{selectedPlayer.getOutOfJailCards || 0}</b>
          </p>
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
  );
};
