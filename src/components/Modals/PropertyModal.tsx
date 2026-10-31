import React from 'react';
import { Tile, Player } from '../../types/game';

interface Props {
  tile: Tile;
  owner?: Player;
  activePlayer: Player;
  onBuy?: () => void;
  onBuildHouse?: () => void;
  onMortgage?: () => void;
  onUnmortgage?: () => void;
  onPayRent?: () => void;
  onClose: () => void;
  rentAmount?: number;
  rentBreakdown?: string;
  isLandingAction?: boolean;
  hasMovedThisTurn?: boolean;
  upgradesThisTurn?: number;
}

export const PropertyModal: React.FC<Props> = ({
  tile,
  owner,
  activePlayer,
  onBuy,
  onBuildHouse,
  onMortgage,
  onUnmortgage,
  onPayRent,
  onClose,
  rentAmount = 0,
  rentBreakdown,
  isLandingAction = false,
  hasMovedThisTurn = true,
  upgradesThisTurn = 0,
}) => {
  if (tile.type !== 'property') return null;

  const isOwner = owner?.id === activePlayer.id;
  const isUnowned = !owner;
  const currentHouses = owner?.houses[tile.id] || 0;
  const isMortgaged = owner?.mortgaged[tile.id] || false;
  const houseCost = tile.houseCost || 50;
  const canAffordHouse = activePlayer.cash >= houseCost;
  const canAffordBuy = activePlayer.cash >= (tile.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#FAF8F5] border-2 border-black rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Deed Card Header */}
        <div
          className="p-3 text-center border-b-2 border-black relative"
          style={{ backgroundColor: tile.colorHex }}
        >
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-white/90 block">
            GIẤY KHOÁN ĐẤT ĐAI
          </span>
          <h2 className="font-display text-xl font-black text-white drop-shadow-sm uppercase">
            {tile.name}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Deed Body */}
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

        {/* Action Buttons */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col gap-2">
          {/* Action 1: Pay rent when landing on someone's property */}
          {isLandingAction && !isOwner && owner && !isMortgaged && onPayRent && (
            <button
              onClick={onPayRent}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow transition-colors"
            >
              Nộp Tiền Thuê ({rentAmount} đ)
            </button>
          )}

          {/* Action 2: Buy property if unowned */}
          {isLandingAction && isUnowned && onBuy && (
            <div className="flex gap-2">
              <button
                onClick={onBuy}
                disabled={!canAffordBuy}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm shadow transition-colors ${
                  canAffordBuy
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Mua Đất ({tile.price} đ)
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
              >
                Bỏ Qua
              </button>
            </div>
          )}

          {/* Action 3: Upgrade House (Only after moving, max 1 upgrade per turn) */}
          {isOwner && onBuildHouse && currentHouses < 5 && (
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

              <button
                onClick={onBuildHouse}
                disabled={!canAffordHouse || !hasMovedThisTurn || upgradesThisTurn >= 1}
                className={`w-full py-2 px-4 rounded-lg font-bold text-sm shadow transition-colors ${
                  canAffordHouse && hasMovedThisTurn && upgradesThisTurn === 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {currentHouses === 4
                  ? `Nâng Lên Khách Sạn (${houseCost} đ)`
                  : `Xây Thêm 1 Nhà (${houseCost} đ)`}
              </button>
            </div>
          )}

          {/* Action 4: Mortgage / Unmortgage */}
          {isOwner && (
            <div className="flex gap-2">
              {!isMortgaged && onMortgage && currentHouses === 0 && (
                <button
                  onClick={onMortgage}
                  className="flex-1 py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold"
                >
                  Cầm Cố Nhận +{(tile.price || 0) / 2} đ
                </button>
              )}
              {isMortgaged && onUnmortgage && (
                <button
                  onClick={onUnmortgage}
                  className="flex-1 py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold"
                >
                  Chuộc Lại Đất (-{Math.round(((tile.price || 0) / 2) * 1.1)} đ)
                </button>
              )}
            </div>
          )}

          {/* Default Close button when not forced landing */}
          {!isLandingAction && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs"
            >
              Đóng Lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
