/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tile, Player } from '../../../types/game';

interface Props {
  tile: Tile;
  owner?: Player;
  currentHouses: number;
  isMortgaged: boolean;
  houseCost: number;
  isLandingAction: boolean;
  isOwner: boolean;
  rentAmount: number;
  rentBreakdown?: string;
}

export const PropertyDeedRates: React.FC<Props> = ({
  tile,
  owner,
  currentHouses,
  isMortgaged,
  houseCost,
  isLandingAction,
  isOwner,
  rentAmount,
  rentBreakdown,
}) => {
  return (
    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
      {/* Base Rent & House Rates */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-xs">
        <div className="flex justify-between font-bold text-slate-800 pb-1 border-b border-slate-100">
          <span>Tiền thuê đất trống:</span>
          <span className="font-mono text-emerald-700">{tile.rents?.[0] || 0} đ</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Với 1 Căn Nhà:</span>
          <span className="font-mono">{tile.rents?.[1]} đ</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Với 2 Căn Nhà:</span>
          <span className="font-mono">{tile.rents?.[2]} đ</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Với 3 Căn Nhà:</span>
          <span className="font-mono">{tile.rents?.[3]} đ</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Với 4 Căn Nhà:</span>
          <span className="font-mono">{tile.rents?.[4]} đ</span>
        </div>
        <div className="flex justify-between font-bold text-xs text-rose-700 pt-1 border-t border-slate-100">
          <span>Với KHÁCH SẠN:</span>
          <span className="font-mono">{tile.rents?.[5]} đ</span>
        </div>
      </div>

      {/* Construction & Mortgage Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
          <span className="text-slate-500 block">Giá xây mỗi nhà</span>
          <span className="font-bold text-slate-800">{houseCost} đ</span>
        </div>
        <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-center">
          <span className="text-slate-500 block">Giá thế chấp</span>
          <span className="font-bold text-slate-800">{(tile.price || 0) / 2} đ</span>
        </div>
      </div>

      {/* Status info */}
      <div className="text-xs text-slate-600 flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Chủ sở hữu:</span>
          <span className="font-bold text-slate-800">
            {owner ? `${owner.name} (${owner.id})` : 'Ngân hàng (Chưa có chủ)'}
          </span>
        </div>
        {owner && (
          <div className="flex justify-between">
            <span>Hiện trạng:</span>
            <span className="font-bold text-emerald-700">
              {currentHouses === 5
                ? 'Khách sạn hạng sang'
                : currentHouses > 0
                ? `${currentHouses} Nhà`
                : 'Đất trống'}
            </span>
          </div>
        )}
        {isMortgaged && (
          <span className="text-red-600 font-bold">
            ⚠️ Đất đang bị cầm cố cho Ngân Hàng (Không thu tiền thuê)
          </span>
        )}
      </div>

      {/* Landing Rent Notice */}
      {isLandingAction && !isOwner && owner && !isMortgaged && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
          <span className="text-xs text-red-600 block">Bạn cần trả tiền thuê:</span>
          <span className="text-xl font-black text-red-700 font-mono">{rentAmount} đ</span>
          {rentBreakdown && (
            <span className="text-[10px] text-slate-500 block mt-0.5">{rentBreakdown}</span>
          )}
        </div>
      )}
    </div>
  );
};
