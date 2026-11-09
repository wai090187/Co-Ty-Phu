/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameSettings, Card, ConsumableAbility, PermanentAbility } from '../../../types/game';
import {
  saveFullConfigAsUserDefault,
  loadFullConfigUserDefault,
  clearFullConfigUserDefault,
  loadUserDefaultSettings,
  hasUserDefaultConfig,
} from '../../storage/abilitiesDb';
import { SYSTEM_DEFAULT_SETTINGS } from '../constants/systemDefaults';
import { JsonConfigTool } from './JsonConfigTool';

interface Props {
  settings: GameSettings;
  onChange: (newSettings: GameSettings) => void;
  chanceDeck?: Card[];
  chestDeck?: Card[];
  consumableShop?: ConsumableAbility[];
  permanentShop?: PermanentAbility[];
  onSetChanceDeck?: (cards: Card[]) => void;
  onSetChestDeck?: (cards: Card[]) => void;
  onSetConsumableShop?: (abilities: ConsumableAbility[]) => void;
  onSetPermanentShop?: (abilities: PermanentAbility[]) => void;
  onResetAbilitiesToDefault?: () => void;
}

export const DefaultSettingsManagerCard: React.FC<Props> = ({
  settings,
  onChange,
  chanceDeck = [],
  chestDeck = [],
  consumableShop = [],
  permanentShop = [],
  onSetChanceDeck,
  onSetChestDeck,
  onSetConsumableShop,
  onSetPermanentShop,
  onResetAbilitiesToDefault,
}) => {
  const [hasUserDefault, setHasUserDefault] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [showJsonTool, setShowJsonTool] = useState(false);

  useEffect(() => {
    setHasUserDefault(hasUserDefaultConfig());
  }, []);

  const handleSaveAllAsDefault = () => {
    saveFullConfigAsUserDefault({
      settings,
      chanceDeck,
      chestDeck,
      consumableShop,
      permanentShop,
    });
    setHasUserDefault(true);
    setStatusNotice(
      `⭐ Đã lưu TOÀN BỘ CẤU HÌNH (Luật + ${chanceDeck.length} thẻ Cơ Hội + ${chestDeck.length} thẻ Khí Vận + ${consumableShop.length} kỹ năng 1 lần + ${permanentShop.length} năng lực vĩnh viễn) thành MẶC ĐỊNH trên máy này thành công!`
    );
    setTimeout(() => setStatusNotice(null), 6000);
  };

  const handleRestoreDefault = () => {
    const fullDef = loadFullConfigUserDefault();
    if (fullDef) {
      onChange(fullDef.settings);
      if (onSetChanceDeck && Array.isArray(fullDef.chanceDeck)) onSetChanceDeck(fullDef.chanceDeck);
      if (onSetChestDeck && Array.isArray(fullDef.chestDeck)) onSetChestDeck(fullDef.chestDeck);
      if (onSetConsumableShop && Array.isArray(fullDef.consumableShop)) onSetConsumableShop(fullDef.consumableShop);
      if (onSetPermanentShop && Array.isArray(fullDef.permanentShop)) onSetPermanentShop(fullDef.permanentShop);
      setStatusNotice('🔄 Đã khôi phục toàn bộ Cài đặt, Thẻ Cơ Hội/Khí Vận & Năng Lực mặc định của bạn trên máy này!');
    } else {
      const userDef = loadUserDefaultSettings();
      if (userDef) {
        onChange(userDef);
        setStatusNotice('🔄 Đã nạp lại thiết lập mặc định của bạn trên máy này!');
      } else {
        onChange(SYSTEM_DEFAULT_SETTINGS);
        if (onResetAbilitiesToDefault) onResetAbilitiesToDefault();
        setStatusNotice('🔄 Đã khôi phục về thiết lập mặc định gốc của trò chơi!');
      }
    }
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleFactoryReset = () => {
    clearFullConfigUserDefault();
    setHasUserDefault(false);
    onChange(SYSTEM_DEFAULT_SETTINGS);
    if (onResetAbilitiesToDefault) onResetAbilitiesToDefault();
    setStatusNotice('Đã xóa toàn bộ mặc định riêng và trở về mặc định gốc ban đầu của game!');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  return (
    <div className="p-3.5 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-emerald-50/30 border border-indigo-200/90 rounded-xl flex flex-col gap-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">💾</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">
                Thiết Lập Mặc Định Của Máy Này
              </span>
              {hasUserDefault ? (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9.5px] font-bold">
                  ⭐ Đã Lưu Mặc Định Riêng
                </span>
              ) : (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9.5px] font-bold">
                  Mặc Định Gốc
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Lưu toàn bộ: <strong>Luật chơi</strong> + <strong>Thẻ Cơ Hội/Khí Vận</strong> ({chanceDeck.length + chestDeck.length}) + <strong>Thiết Kế Năng Lực</strong> ({consumableShop.length + permanentShop.length}) làm Mặc Định của máy.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleSaveAllAsDefault}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-lg text-[11px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            title="Lưu toàn bộ Luật + Thẻ + Thiết kế năng lực thành Mặc Định của thiết bị này"
          >
            <span>⭐</span>
            <span>Đặt Toàn Bộ Làm Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreDefault}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-300 text-[11px] shadow-2xs transition-colors cursor-pointer"
            title="Khôi phục toàn bộ cài đặt, thẻ bài và năng lực về cấu hình mặc định đã lưu"
          >
            🔄 Khôi Phục Mặc Định
          </button>

          {hasUserDefault && (
            <button
              type="button"
              onClick={handleFactoryReset}
              className="px-2 py-1.5 bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
              title="Xóa mặc định tùy biến và trở về mặc định gốc ban đầu của game"
            >
              Gốc Hệ Thống
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowJsonTool(v => !v)}
            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10.5px] border border-slate-300 transition-colors cursor-pointer"
            title="Xem / Nhập / Xuất mã JSON cấu hình"
          >
            📋 {showJsonTool ? 'Ẩn JSON' : 'JSON Tool'}
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg font-bold text-[11px] animate-in fade-in duration-150">
          {statusNotice}
        </div>
      )}

      {showJsonTool && (
        <JsonConfigTool
          settings={settings}
          chanceDeck={chanceDeck}
          chestDeck={chestDeck}
          consumableShop={consumableShop}
          permanentShop={permanentShop}
          onChange={onChange}
          onSetChanceDeck={onSetChanceDeck}
          onSetChestDeck={onSetChestDeck}
          onSetConsumableShop={onSetConsumableShop}
          onSetPermanentShop={onSetPermanentShop}
          setStatusNotice={setStatusNotice}
        />
      )}
    </div>
  );
};
