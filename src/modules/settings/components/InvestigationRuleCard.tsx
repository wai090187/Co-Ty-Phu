import React from 'react';
import { GameSettings } from '../../../types/game';

interface Props {
  settings: GameSettings;
  onChange: (newSettings: GameSettings) => void;
}

export const InvestigationRuleCard: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl border-2 border-indigo-500/80 shadow-md flex flex-col gap-2.5">
      <h4 className="font-display font-black text-xs text-amber-300 uppercase tracking-wide flex items-center gap-2">
        <span>🚨</span> Quy Chế Tố Tụng: Vào Tù Hoặc Bị Công An Điều Tra
      </h4>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <label
          className={`p-2.5 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
            settings.jailMode === 'prison'
              ? 'bg-white/20 border-amber-400 ring-2 ring-amber-400'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="jailMode"
              checked={settings.jailMode === 'prison'}
              onChange={() => onChange({ ...settings, jailMode: 'prison' })}
              className="text-amber-500"
            />
            <span className="font-bold text-xs text-amber-300">🏢 Ở Tù Truyền Thống</span>
          </div>
          <span className="text-[10px] text-slate-300 leading-tight">
            Bị nhốt giam, không được di chuyển cho đến khi đổ đôi hoặc nộp bảo lãnh.
          </span>
        </label>

        <label
          className={`p-2.5 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
            settings.jailMode === 'investigation'
              ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-400'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="jailMode"
              checked={settings.jailMode === 'investigation'}
              onChange={() => onChange({ ...settings, jailMode: 'investigation' })}
              className="text-indigo-400"
            />
            <span className="font-bold text-xs text-indigo-300">🕵️ Bị Công An Điều Tra</span>
          </div>
          <span className="text-[10px] text-slate-300 leading-tight">
            Bị điều tra vì buôn bán trái phép: Vẫn được di chuyển, bị phạt thu nhập & tăng phí!
          </span>
        </label>
      </div>

      {settings.jailMode === 'investigation' && (
        <div className="p-2.5 bg-black/40 border border-indigo-400/50 rounded-lg grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-bold text-indigo-200">
              📉 % Giảm Tiền Thu Nhập Nhận Được:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.investigationIncomePenaltyPercent}
                onChange={e =>
                  onChange({
                    ...settings,
                    investigationIncomePenaltyPercent: Number(e.target.value),
                  })
                }
                className="w-20 p-1 border border-indigo-400 rounded font-mono font-bold bg-slate-900 text-white text-xs"
              />
              <span className="font-bold text-indigo-300">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10.5px] font-bold text-indigo-200">
              📈 % Tăng Tiền Phạt / Thuế / Thuê Phải Nộp:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.investigationFeePenaltyPercent}
                onChange={e =>
                  onChange({
                    ...settings,
                    investigationFeePenaltyPercent: Number(e.target.value),
                  })
                }
                className="w-20 p-1 border border-indigo-400 rounded font-mono font-bold bg-slate-900 text-white text-xs"
              />
              <span className="font-bold text-indigo-300">%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
