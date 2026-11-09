/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Tile } from '../../../types/game';

interface Props {
  tile: Tile;
  activePlayer: Player;
  currentHouses: number;
  houseCost: number;
  canAffordHouse: boolean;
  hasMovedThisTurn: boolean;
  upgradesThisTurn: number;
  onBuildHouse?: () => void;
  onBuildHouseWithAbility?: (abilityId: string) => void;
}

export const PropertyUpgradeActions: React.FC<Props> = ({
  tile,
  activePlayer,
  currentHouses,
  houseCost,
  canAffordHouse,
  hasMovedThisTurn,
  upgradesThisTurn,
  onBuildHouse,
  onBuildHouseWithAbility,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {activePlayer.position === tile.id ? (
        <div className="flex flex-col gap-1">
          {!hasMovedThisTurn ? (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium text-center">
              ⚠️ Bạn chỉ có thể nâng cấp sau khi đã tung xúc xắc và di chuyển xong trong lượt!
            </div>
          ) : upgradesThisTurn >= 1 ? (
            <div className="p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 text-[11px] font-medium text-center">
              ✅ Bạn đã nâng cấp 1 lần trong lượt này (Mỗi lượt chỉ được nâng cấp 1 lần).
            </div>
          ) : null}

          {onBuildHouse && (
            <button
              onClick={onBuildHouse}
              disabled={!canAffordHouse || !hasMovedThisTurn || upgradesThisTurn >= 1}
              className={`w-full py-2 px-4 rounded-lg font-bold text-sm shadow flex items-center justify-center gap-2 transition-colors ${
                canAffordHouse && hasMovedThisTurn && upgradesThisTurn === 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>
                {currentHouses === 4
                  ? `Nâng Lên Khách Sạn (${houseCost} đ)`
                  : `Xây Thêm 1 Nhà (${houseCost} đ)`}
              </span>
              {canAffordHouse && hasMovedThisTurn && upgradesThisTurn === 0 && (
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/25 rounded border border-white/40 font-mono">
                  Space
                </kbd>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-[11px] text-center">
          📍 <span className="font-semibold">Luật chơi:</span> Cần dừng chân trên ô đất này sau khi
          di chuyển để nâng cấp nhà.
        </div>
      )}

      {/* Consumable Ability Option: Giấy Phép Xây Dựng Đặc Cách */}
      {activePlayer.consumableAbilities.includes('instant-upgrade-permit') &&
        onBuildHouseWithAbility && (
          <button
            onClick={() => onBuildHouseWithAbility('instant-upgrade-permit')}
            disabled={!canAffordHouse}
            className={`w-full py-2 px-3 rounded-lg font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-colors ${
              canAffordHouse
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>⚡📜</span> Dùng [Giấy Phép Đặc Cách] Nâng Cấp ({houseCost} đ)
          </button>
        )}
    </div>
  );
};
