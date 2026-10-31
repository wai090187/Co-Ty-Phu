import React from 'react';
import { GameSettings } from '../../../types/game';
import { InvestigationRuleCard } from './InvestigationRuleCard';

interface Props {
  settings: GameSettings;
  onChange: (newSettings: GameSettings) => void;
}

export const RulesTab: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3.5 text-xs">
      {/* Row 1: Capital & Visit Jail Reward */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
          <label className="font-bold text-slate-900">Tiền Vốn Khởi Đầu (đ):</label>
          <input
            type="number"
            value={settings.startingCash}
            onChange={e => onChange({ ...settings, startingCash: Number(e.target.value) })}
            className="p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
          />
          <span className="text-[10px] text-slate-500">Mặc định: 2000đ mỗi người chơi</span>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
          <label className="font-bold text-amber-950 flex items-center gap-1">
            <span>🎁</span> Tiền Thăm Tù Nhân (đ):
          </label>
          <input
            type="number"
            value={settings.jailVisitReward}
            onChange={e => onChange({ ...settings, jailVisitReward: Number(e.target.value) })}
            className="p-1.5 border border-amber-300 rounded font-mono font-bold bg-white text-amber-900"
          />
          <span className="text-[10px] text-amber-800">
            Tù nhân nhận được khi người khác dừng tại ô Thăm Tù (100đ)
          </span>
        </div>
      </div>

      {/* Row 2: Jail Bail Multipliers */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <span>⚖️</span> Hệ Số Tiền Bảo Lãnh Ra Tù Theo Lượt Tung Xúc Xắc:
          </span>
          <span className="text-[10px] text-slate-500">(Tiền = Phí cơ bản × Hệ số)</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-bold text-slate-700 block">Lượt 1:</span>
            <input
              type="number"
              min="0"
              value={settings.bailMultiplierTurn1}
              onChange={e =>
                onChange({ ...settings, bailMultiplierTurn1: Number(e.target.value) })
              }
              className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-center"
            />
            <span className="text-[9.5px] text-slate-500 block mt-1">
              0 = Bắt buộc ở tù ít nhất 1 lượt
            </span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-bold text-slate-700 block">Lượt 2:</span>
            <input
              type="number"
              min="1"
              value={settings.bailMultiplierTurn2}
              onChange={e =>
                onChange({ ...settings, bailMultiplierTurn2: Number(e.target.value) })
              }
              className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-center"
            />
            <span className="text-[9.5px] text-slate-500 block mt-1">
              Mặc định: x2 tiền bảo lãnh
            </span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-bold text-slate-700 block">Lượt 3:</span>
            <input
              type="number"
              min="1"
              value={settings.bailMultiplierTurn3}
              onChange={e =>
                onChange({ ...settings, bailMultiplierTurn3: Number(e.target.value) })
              }
              className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-center"
            />
            <span className="text-[9.5px] text-slate-500 block mt-1">
              Mặc định: x1 tiền bảo lãnh
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Vacant Land Tax & Same Color boost */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
          <label className="font-bold text-slate-900 flex items-center gap-1">
            <span>🏞️</span> % Tiền Thuế Đất Trống (% giá đất):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={settings.vacantLandRentPercent}
              onChange={e =>
                onChange({ ...settings, vacantLandRentPercent: Number(e.target.value) })
              }
              className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
            />
            <span className="font-bold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Tiền thuê đất khi chưa xây nhà = Max(tiền thẻ, % giá đất)
          </span>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
          <label className="font-bold text-slate-900 flex items-center gap-1">
            <span>🎨</span> % Tăng Thuế Theo Mỗi Căn Cùng Màu:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={settings.sameColorRentBoostPercent}
              onChange={e =>
                onChange({ ...settings, sameColorRentBoostPercent: Number(e.target.value) })
              }
              className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
            />
            <span className="font-bold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Mỗi căn cùng màu sở hữu thêm +10%</span>
        </div>
      </div>

      {/* Row 4: Base Bail Fee by round */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1.5">
        <span className="font-bold text-slate-900">Phí Bảo Lãnh Cơ Bản Theo Vòng Chơi (đ):</span>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block">Vòng 1 - 9</span>
            <input
              type="number"
              value={settings.bailFeeBase}
              onChange={e => onChange({ ...settings, bailFeeBase: Number(e.target.value) })}
              className="w-full p-1 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Sau Vòng 10</span>
            <input
              type="number"
              value={settings.bailFeeRound10}
              onChange={e => onChange({ ...settings, bailFeeRound10: Number(e.target.value) })}
              className="w-full p-1 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Sau Vòng 20</span>
            <input
              type="number"
              value={settings.bailFeeRound20}
              onChange={e => onChange({ ...settings, bailFeeRound20: Number(e.target.value) })}
              className="w-full p-1 border border-slate-300 rounded font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Row 5: Start & Jail Rent Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
          <label className="font-bold text-slate-900">Thưởng Trạm Khởi Hành (đ):</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-[9.5px] text-slate-500 block">Đi ngang qua:</span>
              <input
                type="number"
                value={settings.goPassBonus}
                onChange={e => onChange({ ...settings, goPassBonus: Number(e.target.value) })}
                className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
              />
            </div>
            <div className="flex-1">
              <span className="text-[9.5px] text-slate-500 block">Dừng trúng ô:</span>
              <input
                type="number"
                value={settings.goExactBonus}
                onChange={e => onChange({ ...settings, goExactBonus: Number(e.target.value) })}
                className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
          <label className="font-bold text-slate-900">Thu tiền thuê khi ở tù (%):</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={settings.jailRentPercent}
              onChange={e => onChange({ ...settings, jailRentPercent: Number(e.target.value) })}
              className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
            />
            <span className="font-bold text-slate-600">%</span>
          </div>
          <span className="text-[10px] text-slate-500">Mặc định: 50% tiền thuê</span>
        </div>
      </div>

      {/* Special Investigation Law Setting */}
      <InvestigationRuleCard settings={settings} onChange={onChange} />

      {/* Speed & Audio */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">Tốc độ di chuyển:</span>
          <select
            value={settings.moveSpeed}
            onChange={e => onChange({ ...settings, moveSpeed: e.target.value as any })}
            className="p-1 border border-slate-300 rounded font-bold bg-white"
          >
            <option value="slow">Chậm (400ms/bước)</option>
            <option value="normal">Vừa phải (240ms/bước)</option>
            <option value="fast">Nhanh (120ms/bước)</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={e => onChange({ ...settings, soundEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-amber-600"
          />
          Âm Thanh Game
        </label>
      </div>
    </div>
  );
};
