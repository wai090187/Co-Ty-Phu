/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, Tile } from '../../../types/game';

interface Props {
  selectedPlayer: Player;
  tiles: Tile[];
  onSetCash: (playerId: number, amount: number) => void;
  onToggleJail: (playerId: number) => void;
  onTeleportPlayer: (playerId: number, targetTileId: number, triggerLanding: boolean) => void;
}

export const CheatQuickTab: React.FC<Props> = ({
  selectedPlayer,
  tiles,
  onSetCash,
  onToggleJail,
  onTeleportPlayer,
}) => {
  const [cashInput, setCashInput] = useState<string>('');
  const [targetTeleportTile, setTargetTeleportTile] = useState<number>(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Cash Controls */}
      <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 text-sm">💰 Điều Chỉnh Tiền Mặt</span>
          <span className="text-slate-400 text-xs font-mono">
            Số dư hiện tại: <b className="text-emerald-400 text-sm">{selectedPlayer.cash}đ</b>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-bold mr-1">Cộng nhanh:</span>
          {[+100, +500, +1000, +2000, +5000].map(amt => (
            <button
              key={amt}
              onClick={() => onSetCash(selectedPlayer.id, selectedPlayer.cash + amt)}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-emerald-300 font-mono font-bold text-xs"
            >
              +{amt}đ
            </button>
          ))}
          <span className="text-[11px] text-slate-400 font-bold ml-2 mr-1">Trừ nhanh:</span>
          {[-100, -500, -1000].map(amt => (
            <button
              key={amt}
              onClick={() => onSetCash(selectedPlayer.id, Math.max(0, selectedPlayer.cash + amt))}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-rose-300 font-mono font-bold text-xs"
            >
              {amt}đ
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
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
          className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition-colors cursor-pointer ${
            selectedPlayer.inJail
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-rose-700 hover:bg-rose-600 text-white'
          }`}
        >
          {selectedPlayer.inJail ? 'Thả Tự Do Ngay' : 'Đưa Vào Tù / Điều Tra'}
        </button>
      </div>

      {/* Teleportation */}
      <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-purple-400 text-sm">
            🌀 Dịch Chuyển Tức Thời Đến Bất Kỳ Ô Nào
          </span>
          <span className="text-slate-400 text-[11px]">
            Vị trí hiện tại: <b className="text-purple-300">Ô {selectedPlayer.position}</b> - [{tiles[selectedPlayer.position]?.name}]
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={targetTeleportTile}
            onChange={e => setTargetTeleportTile(parseInt(e.target.value, 10))}
            className="flex-1 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
          >
            {tiles.map(t => (
              <option key={t.id} value={t.id}>
                Ô {t.id}: {t.name} ({t.type === 'property' ? 'Đất' : t.type === 'station' ? 'Bến Xe' : t.type === 'utility' ? 'Điện/Nước' : t.type === 'tax' ? 'Thuế' : t.type === 'chance' ? 'Cơ Hội' : t.type === 'chest' ? 'Khí Vận' : 'Góc'})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTeleportPlayer(selectedPlayer.id, targetTeleportTile, false)}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs shrink-0 transition-colors cursor-pointer"
              title="Chỉ chuyển vị trí nhân vật, không kích hoạt sự kiện ô"
            >
              Dịch Chuyển Đến Ô
            </button>
            <button
              onClick={() => onTeleportPlayer(selectedPlayer.id, targetTeleportTile, true)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 shadow shadow-purple-600/30 transition-colors cursor-pointer"
              title="Chuyển vị trí và kích hoạt ngay hiệu ứng dừng chân ô này (mua đất, rút thẻ, vào tù, tính thuế,...)"
            >
              Dịch Chuyển & Kích Hoạt Ô
            </button>
          </div>
        </div>

        {/* Quick Tile Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold mr-1">Ô nhanh:</span>
          {[
            { id: 0, label: 'Ô 0: Khởi Hành' },
            { id: 10, label: 'Ô 10: Vào Tù' },
            { id: 20, label: 'Ô 20: Sân Bay' },
            { id: 30, label: 'Ô 30: Bị Bắt' },
            { id: 5, label: 'Ô 5: Bến Xe Lục Tỉnh' },
            { id: 12, label: 'Ô 12: Điện Lực' },
            { id: 28, label: 'Ô 28: Thủy Cục' },
            { id: 2, label: 'Ô 2: Cơ Hội' },
            { id: 17, label: 'Ô 17: Khí Vận' },
            { id: 4, label: 'Ô 4: Thuế' },
            { id: 39, label: 'Ô 39: Cố Đô Huế' },
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                setTargetTeleportTile(preset.id);
                onTeleportPlayer(selectedPlayer.id, preset.id, true);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-purple-900 hover:text-purple-200 text-slate-300 text-[10px] border border-slate-700 font-mono transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
