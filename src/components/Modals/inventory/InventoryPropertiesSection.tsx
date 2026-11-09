/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Tile, PermanentAbility } from '../../../types/game';

interface Props {
  player: Player;
  ownedPermanents: PermanentAbility[];
  ownedProperties: Tile[];
}

export const InventoryPropertiesSection: React.FC<Props> = ({
  player,
  ownedPermanents,
  ownedProperties,
}) => {
  return (
    <>
      {/* Permanent Abilities */}
      <div>
        <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
          <span className="font-bold text-sm text-slate-900">
            👑 Năng Lực Vĩnh Viễn ({ownedPermanents.length})
          </span>
        </div>

        {ownedPermanents.length === 0 ? (
          <p className="text-slate-400 italic py-2">
            Chưa sở hữu. Ghé Công ty Điện Lực hoặc Thủy Cục để mua năng lực vĩnh viễn!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {ownedPermanents.map(ab => (
              <div
                key={ab.id}
                className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-900 text-sm">{ab.name}</span>
                  <p className="text-slate-600 mt-0.5">{ab.description}</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] shrink-0">
                  Tự động kích hoạt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Properties Owned */}
      <div>
        <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
          <span className="font-bold text-sm text-slate-900">
            🏢 Bất Động Sản Nắm Giữ ({ownedProperties.length})
          </span>
        </div>

        {ownedProperties.length === 0 ? (
          <p className="text-slate-400 italic py-2">Chưa sở hữu ô đất nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {ownedProperties.map(tile => {
              const houses = player.houses[tile.id] || 0;
              const isMortgaged = player.mortgaged[tile.id] || false;
              return (
                <div
                  key={tile.id}
                  className="p-2 rounded-lg border border-slate-200 bg-white flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tile.colorHex }}
                    />
                    <span className="font-bold text-slate-800 truncate">{tile.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>
                      {houses === 5 ? 'Khách sạn' : houses > 0 ? `${houses} Nhà` : 'Đất trống'}
                    </span>
                    {isMortgaged ? (
                      <span className="text-red-600 font-bold">Cầm cố</span>
                    ) : (
                      <span className="text-emerald-700 font-bold font-mono">
                        {tile.rents?.[houses] || 0} đ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
