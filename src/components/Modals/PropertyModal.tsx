/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Tile, Player } from '../../types/game';
import { PropertyDeedRates } from './property/PropertyDeedRates';
import { PropertyUpgradeActions } from './property/PropertyUpgradeActions';

interface Props {
  tile: Tile;
  owner?: Player;
  activePlayer: Player;
  onBuy?: () => void;
  onBuildHouse?: () => void;
  onBuildHouseWithAbility?: (abilityId: string) => void;
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
  onBuildHouseWithAbility,
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (isLandingAction && !isOwner && owner && !isMortgaged && onPayRent) {
          onPayRent();
        } else if (isLandingAction && isUnowned && onBuy && canAffordBuy) {
          onBuy();
        } else if (
          isOwner &&
          activePlayer.position === tile.id &&
          canAffordHouse &&
          hasMovedThisTurn &&
          upgradesThisTurn === 0 &&
          onBuildHouse
        ) {
          onBuildHouse();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isLandingAction,
    isOwner,
    owner,
    isMortgaged,
    onPayRent,
    isUnowned,
    onBuy,
    canAffordBuy,
    activePlayer.position,
    tile.id,
    canAffordHouse,
    hasMovedThisTurn,
    upgradesThisTurn,
    onBuildHouse,
    onClose,
  ]);

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
        <PropertyDeedRates
          tile={tile}
          owner={owner}
          currentHouses={currentHouses}
          isMortgaged={isMortgaged}
          houseCost={houseCost}
          isLandingAction={isLandingAction}
          isOwner={isOwner}
          rentAmount={rentAmount}
          rentBreakdown={rentBreakdown}
        />

        {/* Action Buttons */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col gap-2">
          {isLandingAction && !isOwner && owner && !isMortgaged && onPayRent && (
            <button
              onClick={onPayRent}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow flex items-center justify-center gap-2 transition-colors"
            >
              <span>Nộp Tiền Thuê ({rentAmount} đ)</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white/25 rounded border border-white/40 font-mono">
                Space
              </kbd>
            </button>
          )}

          {isLandingAction && isUnowned && onBuy && (
            <div className="flex gap-2">
              <button
                onClick={onBuy}
                disabled={!canAffordBuy}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm shadow flex items-center justify-center gap-2 transition-colors ${
                  canAffordBuy
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Mua Đất ({tile.price} đ)</span>
                {canAffordBuy && (
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/25 rounded border border-white/40 font-mono">
                    Space
                  </kbd>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Bỏ Qua</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-300 text-slate-700 rounded border border-slate-400 font-mono">
                  Esc
                </kbd>
              </button>
            </div>
          )}

          {isOwner && currentHouses < 5 && (
            <PropertyUpgradeActions
              tile={tile}
              activePlayer={activePlayer}
              currentHouses={currentHouses}
              houseCost={houseCost}
              canAffordHouse={canAffordHouse}
              hasMovedThisTurn={hasMovedThisTurn}
              upgradesThisTurn={upgradesThisTurn}
              onBuildHouse={onBuildHouse}
              onBuildHouseWithAbility={onBuildHouseWithAbility}
            />
          )}

          {/* Mortgage / Unmortgage */}
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

          {!isLandingAction && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Đóng Lại</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-300 text-slate-700 rounded border border-slate-400 font-mono">
                Esc
              </kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
