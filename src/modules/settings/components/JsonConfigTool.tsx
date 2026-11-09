/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameSettings, Card, ConsumableAbility, PermanentAbility } from '../../../types/game';

interface Props {
  settings: GameSettings;
  chanceDeck: Card[];
  chestDeck: Card[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  onChange: (newSettings: GameSettings) => void;
  onSetChanceDeck?: (cards: Card[]) => void;
  onSetChestDeck?: (cards: Card[]) => void;
  onSetConsumableShop?: (abilities: ConsumableAbility[]) => void;
  onSetPermanentShop?: (abilities: PermanentAbility[]) => void;
  setStatusNotice: (msg: string | null) => void;
}

export const JsonConfigTool: React.FC<Props> = ({
  settings,
  chanceDeck,
  chestDeck,
  consumableShop,
  permanentShop,
  onChange,
  onSetChanceDeck,
  onSetChestDeck,
  onSetConsumableShop,
  onSetPermanentShop,
  setStatusNotice,
}) => {
  const [jsonMode, setJsonMode] = useState<'full' | 'settings'>('full');
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(
      {
        version: '1.5.0',
        savedAt: new Date().toISOString(),
        settings,
        chanceDeck,
        chestDeck,
        consumableShop,
        permanentShop,
      },
      null,
      2
    )
  );
  const [copiedToast, setCopiedToast] = useState(false);

  const handleModeChange = (mode: 'full' | 'settings') => {
    setJsonMode(mode);
    if (mode === 'full') {
      setJsonText(
        JSON.stringify(
          {
            version: '1.5.0',
            savedAt: new Date().toISOString(),
            settings,
            chanceDeck,
            chestDeck,
            consumableShop,

            permanentShop,
          },
          null,
          2
        )
      );
    } else {
      setJsonText(JSON.stringify(settings, null, 2));
    }
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && typeof parsed === 'object') {
        if (parsed.settings) {
          onChange(parsed.settings);
          if (Array.isArray(parsed.chanceDeck) && onSetChanceDeck) {
            onSetChanceDeck(parsed.chanceDeck);
          }
          if (Array.isArray(parsed.chestDeck) && onSetChestDeck) {
            onSetChestDeck(parsed.chestDeck);
          }
          if (Array.isArray(parsed.consumableShop) && onSetConsumableShop) {
            onSetConsumableShop(parsed.consumableShop);
          }
          if (Array.isArray(parsed.permanentShop) && onSetPermanentShop) {
            onSetPermanentShop(parsed.permanentShop);
          }
          setStatusNotice('✅ Đã nạp thành công TOÀN BỘ gói cấu hình (Luật + Thẻ + Năng lực) từ JSON!');
        } else if (parsed.startingCash !== undefined) {
          onChange(parsed);
          setStatusNotice('✅ Đã nạp thành công cấu hình luật chơi từ JSON!');
        } else {
          alert('Mã JSON không đúng định dạng cấu hình game!');
          return;
        }
        setTimeout(() => setStatusNotice(null), 3500);
      }
    } catch {
      alert('Mã JSON không hợp lệ! Vui lòng kiểm tra lại cú pháp.');
    }
  };

  return (
    <div className="mt-1 pt-2.5 border-t border-slate-200 flex flex-col gap-2 animate-in fade-in duration-150">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-700">Chế độ xuất/nhập:</span>
          <button
            type="button"
            onClick={() => handleModeChange('full')}
            className={`px-2 py-0.5 rounded font-bold text-[10px] transition-colors cursor-pointer ${
              jsonMode === 'full'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            📦 Toàn Bộ Game (Luật + Thẻ + Năng Lực)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('settings')}
            className={`px-2 py-0.5 rounded font-bold text-[10px] transition-colors cursor-pointer ${
              jsonMode === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            ⚙️ Chỉ Luật & Tiền Tệ
          </button>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(jsonText);
              setCopiedToast(true);
              setTimeout(() => setCopiedToast(false), 2000);
            }}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-slate-50 text-[10px] cursor-pointer"
          >
            {copiedToast ? '✅ Đã Chép' : '📋 Sao Chép JSON'}
          </button>
          <button
            type="button"
            onClick={handleApplyJson}
            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[10px] hover:bg-emerald-700 cursor-pointer shadow-2xs"
          >
            Áp Dụng JSON Này
          </button>
        </div>
      </div>

      <textarea
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
        rows={7}
        className="w-full font-mono text-[10px] p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
        placeholder="Dán mã JSON cấu hình vào đây và nhấn Áp Dụng JSON Này..."
      />
    </div>
  );
};
