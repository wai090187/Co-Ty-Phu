import React, { useState } from 'react';
import {
  GameSettings,
  Card,
  ConsumableAbility,
  PermanentAbility,
} from '../../../types/game';
import { RulesTab } from './RulesTab';
import { CardsTab } from './CardsTab';
import { AbilitiesTab } from './AbilitiesTab';
import { saveFullConfigAsUserDefault } from '../../storage/abilitiesDb';

export interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  chanceDeck: Card[];
  chestDeck: Card[];
  onUpdateCardQuantity: (cardId: string, quantity: number) => void;
  onAddCustomCard: (card: Card) => void;
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  onUpdateConsumableQuantity: (abilityId: string, quantity: number) => void;
  onUpdatePermanentQuantity: (abilityId: string, quantity: number) => void;
  onAddCustomConsumable: (ability: ConsumableAbility) => void;
  onAddCustomPermanent: (ability: PermanentAbility) => void;
  onUpdateConsumable?: (ability: ConsumableAbility) => void;
  onUpdatePermanent?: (ability: PermanentAbility) => void;
  onDeleteAbility?: (abilityId: string, kind: 'consumable' | 'permanent') => void;
  onResetAbilitiesToDefault?: () => void;
  onSetChanceDeck?: (cards: Card[]) => void;
  onSetChestDeck?: (cards: Card[]) => void;
  onSetConsumableShop?: (abilities: ConsumableAbility[]) => void;
  onSetPermanentShop?: (abilities: PermanentAbility[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  chanceDeck,
  chestDeck,
  onUpdateCardQuantity,
  onAddCustomCard,
  consumableShop,
  permanentShop,
  onUpdateConsumableQuantity,
  onUpdatePermanentQuantity,
  onAddCustomConsumable,
  onAddCustomPermanent,
  onUpdateConsumable,
  onUpdatePermanent,
  onDeleteAbility,
  onResetAbilitiesToDefault,
  onSetChanceDeck,
  onSetChestDeck,
  onSetConsumableShop,
  onSetPermanentShop,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'card_creator' | 'ability_creator'>('rules');
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const allCardsCount = chanceDeck.length + chestDeck.length;
  const allAbilitiesCount = consumableShop.length + permanentShop.length;

  const handleSaveRules = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleSaveAllAsDefault = () => {
    saveFullConfigAsUserDefault({
      settings: localSettings,
      chanceDeck,
      chestDeck,
      consumableShop,
      permanentShop,
    });
    setToastNotice(
      `⭐ Đã lưu TOÀN BỘ CẤU HÌNH (Luật + ${chanceDeck.length} thẻ Cơ Hội + ${chestDeck.length} thẻ Khí Vận + ${consumableShop.length} kỹ năng 1 lần + ${permanentShop.length} năng lực vĩnh viễn) thành MẶC ĐỊNH trên máy này!`
    );
    setTimeout(() => setToastNotice(null), 5000);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="shrink-0 p-3 sm:p-3.5 bg-slate-900 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">⚙️</span>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-black tracking-wide uppercase truncate">
                Cài Đặt & Tuỳ Biến Game
              </h2>
              <p className="text-[11px] text-slate-300 truncate">
                Luật chơi, thẻ Cơ hội / Khí vận và thiết kế năng lực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveAllAsDefault}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-lg text-[10.5px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              title="Lưu đồng thời Cài đặt, Thẻ bài và Toàn bộ Thiết kế năng lực vào Mặc Định của máy này"
            >
              <span>⭐</span>
              <span className="hidden sm:inline">Lưu Toàn Bộ Mặc Định</span>
              <span className="sm:hidden">Lưu Mặc Định</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {toastNotice && (
          <div className="shrink-0 px-3 py-2 bg-emerald-600 text-white font-bold text-xs flex items-center justify-between gap-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <span>✅</span>
              <span className="truncate">{toastNotice}</span>
            </div>
            <button
              onClick={() => setToastNotice(null)}
              className="text-white/80 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="shrink-0 flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Luật & Tiền Tệ
          </button>
          <button
            onClick={() => setActiveTab('card_creator')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'card_creator'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Thẻ Cơ Hội / Khí Vận ({allCardsCount})
          </button>
          <button
            onClick={() => setActiveTab('ability_creator')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ability_creator'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Thiết Kế Năng Lực ({allAbilitiesCount})
          </button>
        </div>

        {/* Tab 1: Rules */}
        {activeTab === 'rules' && (
          <RulesTab
            settings={localSettings}
            onChange={setLocalSettings}
            chanceDeck={chanceDeck}
            chestDeck={chestDeck}
            consumableShop={consumableShop}
            permanentShop={permanentShop}
            onSetChanceDeck={onSetChanceDeck}
            onSetChestDeck={onSetChestDeck}
            onSetConsumableShop={onSetConsumableShop}
            onSetPermanentShop={onSetPermanentShop}
            onResetAbilitiesToDefault={onResetAbilitiesToDefault}
          />
        )}

        {/* Tab 2: Cards */}
        {activeTab === 'card_creator' && (
          <CardsTab
            chanceDeck={chanceDeck}
            chestDeck={chestDeck}
            onUpdateCardQuantity={onUpdateCardQuantity}
            onAddCustomCard={onAddCustomCard}
          />
        )}

        {/* Tab 3: Abilities */}
        {activeTab === 'ability_creator' && (
          <AbilitiesTab
            consumableShop={consumableShop}
            permanentShop={permanentShop}
            onUpdateConsumableQuantity={onUpdateConsumableQuantity}
            onUpdatePermanentQuantity={onUpdatePermanentQuantity}
            onAddCustomConsumable={onAddCustomConsumable}
            onAddCustomPermanent={onAddCustomPermanent}
            onUpdateConsumable={onUpdateConsumable}
            onUpdatePermanent={onUpdatePermanent}
            onDeleteAbility={onDeleteAbility}
            onResetAbilitiesToDefault={onResetAbilitiesToDefault}
          />
        )}

        {/* Footer */}
        <div className="shrink-0 p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {activeTab === 'rules'
              ? 'Nhấn Áp Dụng để cập nhật luật chơi vào ván'
              : 'Mọi chỉnh sửa thẻ & năng lực được tự động lưu vào cơ sở dữ liệu'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {activeTab === 'rules' && (
              <button
                onClick={handleSaveRules}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Áp Dụng Luật Chơi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
