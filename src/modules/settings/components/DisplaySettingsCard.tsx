/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../../../types/game';

interface Props {
  settings: GameSettings;
  onChange: (newSettings: GameSettings) => void;
}

export const DisplaySettingsCard: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="p-3.5 bg-gradient-to-r from-amber-50/70 to-slate-50 border border-amber-200/80 rounded-xl flex flex-col gap-3">
      <div className="flex items-center gap-1.5 pb-1.5 border-b border-amber-200/60 font-bold text-slate-900">
        <span className="text-base">🎮</span>
        <span>Cài Đặt Trải Nghiệm & Bố Cục Bàn Cờ</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. AI Turn Delay */}
        <div className="flex flex-col gap-1 p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <label className="font-bold text-slate-900 flex items-center justify-between">
            <span>⏱️ Chờ Lượt AI:</span>
            <span className="font-mono text-amber-600 font-black">
              {settings.aiTurnDelay ?? 2.0}s
            </span>
          </label>
          <select
            value={settings.aiTurnDelay ?? 2.0}
            onChange={e => onChange({ ...settings, aiTurnDelay: Number(e.target.value) })}
            className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
          >
            <option value={0.8}>0.8 giây (Rất Nhanh)</option>
            <option value={1.5}>1.5 giây (Nhanh)</option>
            <option value={2.0}>2.0 giây (Vừa Vặn - Khuyên Dùng)</option>
            <option value={3.0}>3.0 giây (Thư Thả)</option>
            <option value={4.0}>4.0 giây (Chậm Rãi)</option>
          </select>
          <span className="text-[10px] text-slate-500">
            Thời gian nghỉ giữa các lượt và thao tác của máy để kịp theo dõi.
          </span>
        </div>

        {/* 2. Dramatic Dice Roll */}
        <div className="flex flex-col justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div>
            <label className="flex items-center justify-between cursor-pointer font-bold text-slate-900">
              <span className="flex items-center gap-1">
                <span>🎲</span> Xúc Xắc Hồi Hộp
              </span>
              <input
                type="checkbox"
                checked={settings.dramaticDiceRoll ?? true}
                onChange={e => onChange({ ...settings, dramaticDiceRoll: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600"
              />
            </label>
            <span className="text-[10px] text-slate-500 block mt-1">
              {settings.dramaticDiceRoll ?? true
                ? 'Đang BẬT: Hiệu ứng lắc 3D kịch tính & flash đổ đôi.'
                : 'Đang TẮT: Hiển thị kết quả xúc xắc nhanh tức thì.'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Always Show Side Panels */}
      <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
        <label className="flex items-center justify-between cursor-pointer font-bold text-slate-900">
          <span className="flex items-center gap-1.5">
            <span>🖥️</span>
            <span>Luôn Hiển Thị Thông Tin Người Chơi & Nhật Ký</span>
          </span>
          <input
            type="checkbox"
            checked={settings.alwaysShowSidePanels ?? false}
            onChange={e => onChange({ ...settings, alwaysShowSidePanels: e.target.checked })}
            className="w-4 h-4 rounded text-amber-600"
          />
        </label>
        <span className="text-[10px] text-slate-500 block mt-1">
          Ghim cố định bảng người chơi bên trái & log bên phải trên màn hình rộng mà không làm giảm kích thước tối đa của bàn cờ.
        </span>
      </div>
    </div>
  );
};
