/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameSettings } from '../../../types/game';
import { ALL_INVESTIGATOR_ABILITIES } from '../../../data/investigatorAbilities';

interface Props {
  settings: GameSettings;
  onChange: (newSettings: GameSettings) => void;
}

export const InvestigatorSettingsCard: React.FC<Props> = ({ settings, onChange }) => {
  const [showAbilitiesList, setShowAbilitiesList] = useState(false);

  return (
    <div className="p-3.5 bg-gradient-to-br from-indigo-950/5 via-slate-900/5 to-purple-950/5 border-2 border-indigo-200/80 rounded-xl flex flex-col gap-3">
      {/* Header & Toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            🕵️‍♂️
          </div>
          <div>
            <h4 className="font-display font-black text-slate-900 text-xs sm:text-sm tracking-wide flex items-center gap-1.5">
              <span>Người Chơi Ẩn: Điều Tra Viên Đặc Biệt</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                AI Đặc Biệt
              </span>
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Di chuyển tự do trên bàn cờ, không mua bán hay bị phạt như người thường, nhưng kích hoạt 10 năng lực thanh tra thay đổi luân phiên theo vòng.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.enableSpecialInvestigator}
            onChange={e =>
              onChange({
                ...settings,
                enableSpecialInvestigator: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Settings Options (When Enabled) */}
      {settings.enableSpecialInvestigator && (
        <div className="pt-2 border-t border-indigo-100 flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Start Round */}
            <div className="p-2.5 bg-white border border-indigo-100 rounded-lg flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>🏁 Xuất Hiện Sau Vòng Số:</span>
                <span className="font-mono text-indigo-600 font-bold">
                  Vòng {settings.investigatorStartRound}
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.investigatorStartRound}
                onChange={e =>
                  onChange({
                    ...settings,
                    investigatorStartRound: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
              />
              <span className="text-[10px] text-slate-500">
                Mặc định: Vòng 2 (Điều tra viên sẽ xuất phát từ Trạm Khởi Hành ở cuối vòng này).
              </span>
            </div>

            {/* Rounds per Ability Change */}
            <div className="p-2.5 bg-white border border-indigo-100 rounded-lg flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>🔄 Đổi Năng Lực Sau Mỗi:</span>
                <span className="font-mono text-indigo-600 font-bold">
                  {settings.investigatorAbilityChangeRounds} Vòng
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.investigatorAbilityChangeRounds}
                onChange={e =>
                  onChange({
                    ...settings,
                    investigatorAbilityChangeRounds: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
              />
              <span className="text-[10px] text-slate-500">
                Mặc định: 1 vòng (Mỗi lần đi qua Trạm Khởi Hành sẽ tự động rút ngẫu nhiên 1 năng lực mới).
              </span>
            </div>
          </div>

          {/* Collapsible 10 Abilities List */}
          <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
            <button
              type="button"
              onClick={() => setShowAbilitiesList(!showAbilitiesList)}
              className="w-full flex items-center justify-between text-left font-bold text-indigo-900 text-xs"
            >
              <span className="flex items-center gap-1.5">
                <span>📜</span>
                <span>Xem 10 Năng Lực Đặc Biệt (Rút ngẫu nhiên không lặp lại)</span>
              </span>
              <span className="text-[11px] text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                {showAbilitiesList ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
              </span>
            </button>

            {showAbilitiesList && (
              <div className="mt-2.5 pt-2 border-t border-indigo-200/60 flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                <div className="text-[10px] text-indigo-700 bg-indigo-100/60 p-2 rounded border border-indigo-200">
                  ℹ️ <strong>Cơ chế rút:</strong> Năng lực đã kích hoạt sẽ bị loại khỏi lần random tiếp theo. Sau khi đã dùng hết toàn bộ 10 năng lực, danh sách sẽ tự động reset lại từ đầu.
                </div>
                {ALL_INVESTIGATOR_ABILITIES.map((ab, idx) => (
                  <div
                    key={ab.id}
                    className="p-2 bg-white rounded border border-indigo-100 flex items-start gap-2 text-[11px]"
                  >
                    <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{ab.name}</div>
                      <div className="text-[10.5px] text-slate-600 leading-snug mt-0.5">
                        {ab.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
