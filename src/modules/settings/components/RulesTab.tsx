import React, { useState, useEffect } from 'react';
import { GameSettings } from '../../../types/game';
import { InvestigationRuleCard } from './InvestigationRuleCard';
import { DisplaySettingsCard } from './DisplaySettingsCard';
import { InvestigatorSettingsCard } from './InvestigatorSettingsCard';
import {
  saveSettingsAsUserDefault,
  loadUserDefaultSettings,
  clearUserDefaultSettings,
} from '../../storage/abilitiesDb';

interface Props {
  settings: GameSettings;
  onChange: (newSettings: GameSettings) => void;
}

export const RulesTab: React.FC<Props> = ({ settings, onChange }) => {
  const [hasUserDefault, setHasUserDefault] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [showJsonTool, setShowJsonTool] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    setHasUserDefault(!!loadUserDefaultSettings());
  }, []);
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

      {/* Special Investigator Autonomous Hidden Player */}
      <InvestigatorSettingsCard settings={settings} onChange={onChange} />

      {/* Display, AI Delay & Layout Settings */}
      <DisplaySettingsCard settings={settings} onChange={onChange} />

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

      {/* LocalStorage Cache & User Default Settings Control */}
      <div className="p-3.5 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-200/80 rounded-xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">💾</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  Thiết Lập Mặc Định Trên Máy Này
                </span>
                {hasUserDefault ? (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9.5px] font-bold">
                    ⭐ Đã có Mặc Định Riêng
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9.5px] font-bold">
                    Mặc Định Gốc
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Bạn có thể biến thiết lập hiện tại thành mặc định của máy, hoặc khôi phục bất kỳ lúc nào.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Make Current Setting as Default */}
            <button
              type="button"
              onClick={() => {
                saveSettingsAsUserDefault(settings);
                setHasUserDefault(true);
                setStatusNotice(
                  '⭐ Đã lưu thiết lập hiện tại thành MẶC ĐỊNH trên máy này thành công! Mọi ván chơi mới hoặc lần build sau sẽ tự động dùng thiết lập này.'
                );
                setTimeout(() => setStatusNotice(null), 5000);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-lg text-[11px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              title="Lưu toàn bộ các giá trị bạn đang cấu hình thành Mặc Định của trò chơi trên thiết bị này"
            >
              <span>⭐</span>
              <span>Đặt Làm Mặc Định</span>
            </button>

            {/* 2. Restore Default */}
            <button
              type="button"
              onClick={() => {
                const userDef = loadUserDefaultSettings();
                const systemDefaults = {
                  startingCash: 2000,
                  goExactBonus: 400,
                  goPassBonus: 200,
                  bailFeeBase: 100,
                  bailFeeRound10: 100,
                  bailFeeRound20: 200,
                  sameColorRentBoostPercent: 20,
                  jailRentPercent: 50,
                  maxConsumableAbilities: 3,
                  soundEnabled: true,
                  moveSpeed: 'normal' as const,
                  jailVisitReward: 100,
                  bailMultiplierTurn1: 0,
                  bailMultiplierTurn2: 2,
                  bailMultiplierTurn3: 1,
                  vacantLandRentPercent: 20,
                  jailMode: 'investigation' as const,
                  investigationIncomePenaltyPercent: 50,
                  investigationFeePenaltyPercent: 50,
                  aiTurnDelay: 2.0,
                  dramaticDiceRoll: true,
                  alwaysShowSidePanels: true,
                  enableSpecialInvestigator: true,
                  investigatorStartRound: 2,
                  investigatorAbilityChangeRounds: 1,
                };
                if (userDef) {
                  onChange(userDef);
                  setStatusNotice('🔄 Đã nạp lại thiết lập mặc định của bạn trên máy này!');
                } else {
                  onChange(systemDefaults);
                  setStatusNotice('🔄 Đã khôi phục về thiết lập mặc định của trò chơi!');
                }
                setTimeout(() => setStatusNotice(null), 3500);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-300 text-[11px] shadow-2xs transition-colors cursor-pointer"
            >
              🔄 Khôi Phục Mặc Định
            </button>

            {/* 3. System Factory Reset (if custom default exists) */}
            {hasUserDefault && (
              <button
                type="button"
                onClick={() => {
                  clearUserDefaultSettings();
                  setHasUserDefault(false);
                  const systemDefaults = {
                    startingCash: 2000,
                    goExactBonus: 400,
                    goPassBonus: 200,
                    bailFeeBase: 100,
                    bailFeeRound10: 100,
                    bailFeeRound20: 200,
                    sameColorRentBoostPercent: 20,
                    jailRentPercent: 50,
                    maxConsumableAbilities: 3,
                    soundEnabled: true,
                    moveSpeed: 'normal' as const,
                    jailVisitReward: 100,
                    bailMultiplierTurn1: 0,
                    bailMultiplierTurn2: 2,
                    bailMultiplierTurn3: 1,
                    vacantLandRentPercent: 20,
                    jailMode: 'investigation' as const,
                    investigationIncomePenaltyPercent: 50,
                    investigationFeePenaltyPercent: 50,
                    aiTurnDelay: 2.0,
                    dramaticDiceRoll: true,
                    alwaysShowSidePanels: true,
                    enableSpecialInvestigator: true,
                    investigatorStartRound: 2,
                    investigatorAbilityChangeRounds: 1,
                  };
                  onChange(systemDefaults);
                  setStatusNotice('Đã xóa mặc định riêng và trở về gốc hệ thống!');
                  setTimeout(() => setStatusNotice(null), 3000);
                }}
                className="px-2 py-1.5 bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                title="Xóa mặc định tùy biến và trở về mặc định gốc ban đầu của game"
              >
                Gốc Hệ Thống
              </button>
            )}

            {/* 4. JSON Tool Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowJsonTool(!showJsonTool);
                setJsonText(JSON.stringify(settings, null, 2));
              }}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10.5px] border border-slate-300 transition-colors cursor-pointer"
              title="Xem / Nhập / Xuất mã JSON cấu hình"
            >
              📋 {showJsonTool ? 'Ẩn JSON' : 'JSON'}
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusNotice && (
          <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg font-bold text-[11px] animate-in fade-in duration-150">
            {statusNotice}
          </div>
        )}

        {/* JSON Inspector / Import tool */}
        {showJsonTool && (
          <div className="mt-1 pt-2 border-t border-slate-200 flex flex-col gap-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">Mã JSON cấu hình hiện tại:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
                    setCopiedToast(true);
                    setTimeout(() => setCopiedToast(false), 2000);
                  }}
                  className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-slate-50 text-[10px] cursor-pointer"
                >
                  {copiedToast ? '✅ Đã Chép' : '📋 Sao Chép'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(jsonText);
                      onChange(parsed);
                      setStatusNotice('✅ Đã nạp thành công cấu hình từ JSON!');
                      setTimeout(() => setStatusNotice(null), 3000);
                    } catch {
                      alert('Mã JSON không hợp lệ!');
                    }
                  }}
                  className="px-2 py-0.5 bg-indigo-600 text-white rounded font-bold text-[10px] hover:bg-indigo-700 cursor-pointer"
                >
                  Áp Dụng JSON
                </button>
              </div>
            </div>
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={6}
              className="w-full font-mono text-[10.5px] p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        )}
      </div>
    </div>
  );
};
