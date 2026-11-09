/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings, Card, ConsumableAbility, PermanentAbility } from '../../../types/game';
import { BailAndRentRulesCard } from './BailAndRentRulesCard';
import { InvestigationRuleCard } from './InvestigationRuleCard';
import { DisplaySettingsCard } from './DisplaySettingsCard';
import { InvestigatorSettingsCard } from './InvestigatorSettingsCard';
import { DefaultSettingsManagerCard } from './DefaultSettingsManagerCard';

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

export const RulesTab: React.FC<Props> = ({
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
  return (
    <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3.5 text-xs">
      {/* 1. Base Bail, Capital & Land Rent Multipliers */}
      <BailAndRentRulesCard settings={settings} onChange={onChange} />

      {/* 2. Special Investigation Law Setting */}
      <InvestigationRuleCard settings={settings} onChange={onChange} />

      {/* 3. Special Investigator Autonomous Hidden Player */}
      <InvestigatorSettingsCard settings={settings} onChange={onChange} />

      {/* 4. Display, AI Delay & Layout Settings */}
      <DisplaySettingsCard settings={settings} onChange={onChange} />

      {/* 5. Speed & Audio Controls */}
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

      {/* 6. Machine Default Settings & JSON Package Manager */}
      <DefaultSettingsManagerCard
        settings={settings}
        onChange={onChange}
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
    </div>
  );
};
