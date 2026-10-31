import React, { useState } from 'react';
import {
  GameSettings,
  Card,
  ConsumableAbility,
  PermanentAbility,
  TriggerCondition,
} from '../../types/game';

interface Props {
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
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
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
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'card_creator' | 'ability_creator'>('rules');
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });

  // Filters & Search
  const [cardFilter, setCardFilter] = useState<'all' | 'chance' | 'chest'>('all');
  const [cardSearch, setCardSearch] = useState('');
  const [abilityFilter, setAbilityFilter] = useState<'all' | 'consumable' | 'permanent'>('all');
  const [abilitySearch, setAbilitySearch] = useState('');

  // Form toggles
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showAddAbilityForm, setShowAddAbilityForm] = useState(false);

  // Custom Card state
  const [newCard, setNewCard] = useState<{
    deck: 'chance' | 'chest';
    title: string;
    description: string;
    actionType: 'cash_bonus' | 'cash_penalty' | 'move_to' | 'go_to_jail';
    value: number;
    targetTileId: number;
    quantity: number;
  }>({
    deck: 'chance',
    title: '',
    description: '',
    actionType: 'cash_bonus',
    value: 100,
    targetTileId: 0,
    quantity: 1,
  });

  // Custom Ability state with triggerCondition & separate effectValue
  const [newAbility, setNewAbility] = useState<{
    type: 'consumable' | 'permanent';
    name: string;
    description: string;
    cost: number;
    triggerCondition: TriggerCondition;
    effectType: string;
    effectValue: number;
    quantity: number;
  }>({
    type: 'consumable',
    name: '',
    description: '',
    cost: 100,
    triggerCondition: 'manual_anytime',
    effectType: 'dice_boost',
    effectValue: 2,
    quantity: 3,
  });

  const handleSaveRules = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.title.trim()) return;

    const card: Card = {
      id: `custom-card-${Date.now()}`,
      deck: newCard.deck,
      title: newCard.title,
      description: newCard.description || newCard.title,
      actionType: newCard.actionType,
      value: newCard.value,
      targetTileId: newCard.targetTileId,
      quantity: Math.max(1, Number(newCard.quantity) || 1),
    };

    onAddCustomCard(card);
    setNewCard({
      deck: 'chance',
      title: '',
      description: '',
      actionType: 'cash_bonus',
      value: 100,
      targetTileId: 0,
      quantity: 1,
    });
    setShowAddCardForm(false);
  };

  const handleCreateAbility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAbility.name.trim()) return;

    if (newAbility.type === 'consumable') {
      const ability: ConsumableAbility = {
        id: `custom-cons-${Date.now()}`,
        name: newAbility.name,
        description: newAbility.description,
        cost: Number(newAbility.cost),
        icon: 'sparkles',
        triggerCondition: newAbility.triggerCondition,
        effectType: newAbility.effectType as any,
        effectValue: Number(newAbility.effectValue),
        value: Number(newAbility.effectValue),
        quantity: Math.max(0, Number(newAbility.quantity) || 1),
      };
      onAddCustomConsumable(ability);
    } else {
      const ability: PermanentAbility = {
        id: `custom-perm-${Date.now()}`,
        name: newAbility.name,
        description: newAbility.description,
        cost: Number(newAbility.cost),
        icon: 'award',
        triggerCondition: newAbility.triggerCondition,
        effectType: newAbility.effectType as any,
        effectValue: Number(newAbility.effectValue),
        value: Number(newAbility.effectValue),
        quantity: Math.max(0, Number(newAbility.quantity) || 1),
      };
      onAddCustomPermanent(ability);
    }

    setNewAbility({
      type: 'consumable',
      name: '',
      description: '',
      cost: 100,
      triggerCondition: 'manual_anytime',
      effectType: 'dice_boost',
      effectValue: 2,
      quantity: 3,
    });
    setShowAddAbilityForm(false);
  };

  // Filtered Cards
  const allCards = [...chanceDeck, ...chestDeck];
  const filteredCards = allCards.filter(c => {
    if (cardFilter !== 'all' && c.deck !== cardFilter) return false;
    if (cardSearch.trim()) {
      const q = cardSearch.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Abilities
  const allAbilities = [
    ...consumableShop.map(a => ({ ...a, kind: 'consumable' as const })),
    ...permanentShop.map(a => ({ ...a, kind: 'permanent' as const })),
  ];
  const filteredAbilities = allAbilities.filter(a => {
    if (abilityFilter !== 'all' && a.kind !== abilityFilter) return false;
    if (abilitySearch.trim()) {
      const q = abilitySearch.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  const getTriggerLabel = (trig: TriggerCondition) => {
    switch (trig) {
      case 'when_roll_dice':
        return '🎲 Khi tung xúc xắc';
      case 'when_neighbor':
        return '👥 Đứng cạnh/trùng ô đối thủ';
      case 'when_land_corner':
        return '🏁 Dừng tại 4 ô góc';
      case 'when_pay_tax':
        return '🏛️ Khi phải nộp thuế';
      case 'when_pay_rent':
        return '🏠 Khi trả tiền thuê đất';
      case 'when_visit_station':
        return '🚌 Khi ghé Bến xe';
      case 'manual_anytime':
      default:
        return '⚡ Chủ động kích hoạt';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black tracking-wide uppercase">
                Cài Đặt & Tuỳ Biến Luật Chơi
              </h2>
              <p className="text-[11px] text-slate-300">
                Tuỳ chỉnh tiền tệ, quản lý số lượng thẻ và thiết kế năng lực mới
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'rules'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Luật & Tiền Tệ
          </button>
          <button
            onClick={() => setActiveTab('card_creator')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'card_creator'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Thẻ Cơ Hội / Khí Vận ({allCards.length})
          </button>
          <button
            onClick={() => setActiveTab('ability_creator')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'ability_creator'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Thiết Kế Năng Lực ({allAbilities.length})
          </button>
        </div>

        {/* Tab 1: Game Rules Settings */}
        {activeTab === 'rules' && (
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3.5 text-xs">
            {/* Row 1: Capital & Visit Jail Reward */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
                <label className="font-bold text-slate-900">Tiền Vốn Khởi Đầu (đ):</label>
                <input
                  type="number"
                  value={localSettings.startingCash}
                  onChange={e =>
                    setLocalSettings({ ...localSettings, startingCash: Number(e.target.value) })
                  }
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
                  value={localSettings.jailVisitReward}
                  onChange={e =>
                    setLocalSettings({ ...localSettings, jailVisitReward: Number(e.target.value) })
                  }
                  className="p-1.5 border border-amber-300 rounded font-mono font-bold bg-white text-amber-900"
                />
                <span className="text-[10px] text-amber-800">
                  Tù nhân nhận được khi có người khác dừng tại ô Thăm Tù (Mặc định: 100đ)
                </span>
              </div>
            </div>

            {/* Row 2: Jail Bail Multipliers */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>⚖️</span> Hệ Số Tiền Bảo Lãnh Ra Tù Theo Lượt Tung Xúc Xắc:
                </span>
                <span className="text-[10px] text-slate-500">
                  (Tiền = Phí cơ bản × Hệ số)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-700 block">Lượt 1:</span>
                  <input
                    type="number"
                    min="0"
                    value={localSettings.bailMultiplierTurn1}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        bailMultiplierTurn1: Number(e.target.value),
                      })
                    }
                    className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-center"
                  />
                  <span className="text-[9.5px] text-slate-500 block mt-1">
                    0 = Bắt buộc ở tù ít nhất 1 lượt (không cho bảo lãnh)
                  </span>
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-700 block">Lượt 2:</span>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.bailMultiplierTurn2}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        bailMultiplierTurn2: Number(e.target.value),
                      })
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
                    value={localSettings.bailMultiplierTurn3}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        bailMultiplierTurn3: Number(e.target.value),
                      })
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
                    value={localSettings.vacantLandRentPercent}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        vacantLandRentPercent: Number(e.target.value),
                      })
                    }
                    className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Tiền thuê đất khi chưa xây nhà = Max(tiền thẻ, % giá đất). Mặc định: 10%
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
                    value={localSettings.sameColorRentBoostPercent}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        sameColorRentBoostPercent: Number(e.target.value),
                      })
                    }
                    className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Cứ mỗi căn cùng màu sở hữu thêm thì tăng thuế lên +10% (làm tròn lên)
                </span>
              </div>
            </div>

            {/* Row 4: Base Bail Fee by round */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1.5">
              <span className="font-bold text-slate-900">
                Phí Bảo Lãnh Cơ Bản Theo Vòng Chơi (đ):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Vòng 1 - 9</span>
                  <input
                    type="number"
                    value={localSettings.bailFeeBase}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, bailFeeBase: Number(e.target.value) })
                    }
                    className="w-full p-1 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sau Vòng 10</span>
                  <input
                    type="number"
                    value={localSettings.bailFeeRound10}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, bailFeeRound10: Number(e.target.value) })
                    }
                    className="w-full p-1 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sau Vòng 20</span>
                  <input
                    type="number"
                    value={localSettings.bailFeeRound20}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, bailFeeRound20: Number(e.target.value) })
                    }
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
                      value={localSettings.goPassBonus}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, goPassBonus: Number(e.target.value) })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9.5px] text-slate-500 block">Dừng trúng ô:</span>
                    <input
                      type="number"
                      value={localSettings.goExactBonus}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, goExactBonus: Number(e.target.value) })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl">
                <label className="font-bold text-slate-900">
                  Thu tiền thuê khi đang ở tù (%):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.jailRentPercent}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        jailRentPercent: Number(e.target.value),
                      })
                    }
                    className="w-24 p-1.5 border border-slate-300 rounded font-mono font-bold bg-white"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
                <span className="text-[10px] text-slate-500">Mặc định: 50% tiền thuê</span>
              </div>
            </div>

            {/* Special Investigation Law Setting (Đổi luật Vào tù thành Bị Điều Tra) */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl border-2 border-indigo-500/80 shadow-md flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  <div>
                    <h4 className="font-display font-black text-xs text-amber-300 uppercase tracking-wide">
                      Quy Chế Tố Tụng: Vào Tù Hoặc Bị Công An Điều Tra
                    </h4>
                    <span className="text-[10px] text-slate-300">
                      Chọn luật giam giữ truyền thống hoặc đổi thành đang bị điều tra vì buôn bán nhà ở trái phép
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <label
                  className={`p-2.5 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                    localSettings.jailMode === 'prison'
                      ? 'bg-white/20 border-amber-400 ring-2 ring-amber-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="jailMode"
                      checked={localSettings.jailMode === 'prison'}
                      onChange={() => setLocalSettings({ ...localSettings, jailMode: 'prison' })}
                      className="text-amber-500"
                    />
                    <span className="font-bold text-xs text-amber-300">🏢 Ở Tù Truyền Thống</span>
                  </div>
                  <span className="text-[10px] text-slate-300 leading-tight">
                    Bị nhốt giam, không được di chuyển trên bàn cờ cho đến khi đổ được đôi hoặc nộp bảo lãnh.
                  </span>
                </label>

                <label
                  className={`p-2.5 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                    localSettings.jailMode === 'investigation'
                      ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="jailMode"
                      checked={localSettings.jailMode === 'investigation'}
                      onChange={() => setLocalSettings({ ...localSettings, jailMode: 'investigation' })}
                      className="text-indigo-400"
                    />
                    <span className="font-bold text-xs text-indigo-300">🕵️ Bị Công An Điều Tra</span>
                  </div>
                  <span className="text-[10px] text-slate-300 leading-tight">
                    Bị điều tra vì buôn bán nhà ở trái phép: <b>Vẫn được di chuyển</b>, nhưng bị trừ thu nhập và tăng tiền phạt!
                  </span>
                </label>
              </div>

              {/* Penalties under Investigation Mode */}
              {localSettings.jailMode === 'investigation' && (
                <div className="p-2.5 bg-black/40 border border-indigo-400/50 rounded-lg grid grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-indigo-200">
                      📉 % Giảm Tiền Thu Nhập Nhận Được:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={localSettings.investigationIncomePenaltyPercent}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            investigationIncomePenaltyPercent: Number(e.target.value),
                          })
                        }
                        className="w-20 p-1 border border-indigo-400 rounded font-mono font-bold bg-slate-900 text-white text-xs"
                      />
                      <span className="font-bold text-indigo-300">%</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400">
                      Mặc định: Giảm 50% tiền qua trạm khởi hành, tiền thuê đất thu được, tiền thẻ
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] font-bold text-indigo-200">
                      📈 % Tăng Tiền Phạt / Thuế / Tiền Thuê Phải Nộp:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={localSettings.investigationFeePenaltyPercent}
                        onChange={e =>
                          setLocalSettings({
                            ...localSettings,
                            investigationFeePenaltyPercent: Number(e.target.value),
                          })
                        }
                        className="w-20 p-1 border border-indigo-400 rounded font-mono font-bold bg-slate-900 text-white text-xs"
                      />
                      <span className="font-bold text-indigo-300">%</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400">
                      Mặc định: Tăng 50% tiền thuế nhà nước, phạt thẻ, và tiền thuê đất phải trả
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Speed & Audio */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Tốc độ di chuyển con cờ:</span>
                <select
                  value={localSettings.moveSpeed}
                  onChange={e =>
                    setLocalSettings({
                      ...localSettings,
                      moveSpeed: e.target.value as any,
                    })
                  }
                  className="p-1 border border-slate-300 rounded font-bold bg-white"
                >
                  <option value="slow">Chậm (Hồi hộp: 400ms/bước)</option>
                  <option value="normal">Vừa phải (240ms/bước)</option>
                  <option value="fast">Nhanh (120ms/bước)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={e =>
                    setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-amber-600"
                />
                Âm Thanh Game
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Thẻ Cơ Hội / Khí Vận */}
        {activeTab === 'card_creator' && (
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
            {/* Top Controls: Filter & Search & Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCardFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                    cardFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({allCards.length})
                </button>
                <button
                  onClick={() => setCardFilter('chance')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                    cardFilter === 'chance'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Cơ Hội ({chanceDeck.length})
                </button>
                <button
                  onClick={() => setCardFilter('chest')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                    cardFilter === 'chest'
                      ? 'bg-sky-600 text-white'
                      : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                  }`}
                >
                  Khí Vận ({chestDeck.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm thẻ..."
                  value={cardSearch}
                  onChange={e => setCardSearch(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-md text-[11px] w-36 sm:w-44 bg-white"
                />
                <button
                  onClick={() => setShowAddCardForm(!showAddCardForm)}
                  className={`px-3 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors ${
                    showAddCardForm
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                  }`}
                >
                  <span>{showAddCardForm ? '✕ Đóng Form' : '+ Tạo Thẻ Mới'}</span>
                </button>
              </div>
            </div>

            {/* Optional Add Card Form */}
            {showAddCardForm && (
              <form
                onSubmit={handleCreateCard}
                className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs uppercase tracking-wide">
                    ➕ Soạn Thảo Thẻ Cơ Hội / Khí Vận Mới
                  </span>
                  <span className="text-[10px] text-amber-800">
                    Thẻ sẽ được gộp vào bộ bài của ván chơi
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">Thuộc bộ thẻ:</label>
                    <select
                      value={newCard.deck}
                      onChange={e => setNewCard({ ...newCard, deck: e.target.value as any })}
                      className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
                    >
                      <option value="chance">❓ Thẻ Cơ Hội (Màu Đỏ Cam)</option>
                      <option value="chest">📦 Thẻ Khí Vận (Màu Xanh Biển)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">Loại hiệu ứng:</label>
                    <select
                      value={newCard.actionType}
                      onChange={e => setNewCard({ ...newCard, actionType: e.target.value as any })}
                      className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
                    >
                      <option value="cash_bonus">Thưởng Tiền (+đ)</option>
                      <option value="cash_penalty">Phạt Tiền (-đ)</option>
                      <option value="move_to">Bay đến ô cụ thể</option>
                      <option value="go_to_jail">Bị bắt vào tù</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-[11px]">Tiêu đề thẻ:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nhận Lương Thưởng Tết, Đi Công Tác..."
                    value={newCard.title}
                    onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-[11px]">Nội dung mô tả:</label>
                  <input
                    type="text"
                    placeholder="Mô tả lý do hoặc câu chuyện vui nhộn trên thẻ..."
                    value={newCard.description}
                    onChange={e => setNewCard({ ...newCard, description: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">
                      {newCard.actionType === 'move_to' ? 'Mã Ô Đến (0-39):' : 'Số Tiền Hiệu Ứng (đ):'}
                    </label>
                    <input
                      type="number"
                      value={newCard.actionType === 'move_to' ? newCard.targetTileId : newCard.value}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (newCard.actionType === 'move_to') {
                          setNewCard({ ...newCard, targetTileId: val });
                        } else {
                          setNewCard({ ...newCard, value: val });
                        }
                      }}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">
                      Số Lượng Thẻ Trong Bộ Bài:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newCard.quantity}
                      onChange={e =>
                        setNewCard({ ...newCard, quantity: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm text-xs"
                >
                  Thêm Thẻ Vào Bộ Bài
                </button>
              </form>
            )}

            {/* List of Existing Cards with Quantity Controls */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Danh sách thẻ đang có (Nếu số lượng = 0 thì <b>không xuất hiện</b> khi rút):
              </span>
              <span>Tổng: {filteredCards.length} thẻ</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredCards.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  Không tìm thấy thẻ nào phù hợp với bộ lọc!
                </div>
              ) : (
                filteredCards.map(card => {
                  const qty = card.quantity ?? 1;
                  const isZero = qty === 0;

                  return (
                    <div
                      key={card.id}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                        isZero
                          ? 'bg-slate-100 border-slate-300 opacity-60'
                          : card.deck === 'chance'
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                          : 'bg-sky-50/40 border-sky-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              card.deck === 'chance'
                                ? 'bg-rose-600 text-white'
                                : 'bg-sky-600 text-white'
                            }`}
                          >
                            {card.deck === 'chance' ? 'Cơ Hội' : 'Khí Vận'}
                          </span>

                          <span className="font-bold text-slate-900 text-xs truncate">
                            {card.title}
                          </span>

                          {isZero ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              🚫 Không xuất hiện (SL: 0)
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded">
                              {card.actionType === 'cash_bonus' && `+${card.value}đ`}
                              {card.actionType === 'cash_penalty' && `-${card.value}đ`}
                              {card.actionType === 'move_to' && `Đến ô #${card.targetTileId}`}
                              {card.actionType === 'go_to_jail' && 'Vào tù'}
                              {!['cash_bonus', 'cash_penalty', 'move_to', 'go_to_jail'].includes(
                                card.actionType
                              ) && card.actionType}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {card.description}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-bold px-1">SL:</span>
                        <button
                          type="button"
                          onClick={() => onUpdateCardQuantity(card.id, Math.max(0, qty - 1))}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          title="Giảm số lượng"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={e =>
                            onUpdateCardQuantity(card.id, Math.max(0, Number(e.target.value) || 0))
                          }
                          className="w-10 text-center font-mono font-bold text-xs p-0.5 border border-slate-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateCardQuantity(card.id, qty + 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          title="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Thiết Kế Năng Lực Mới & Quản Lý Số Lượng */}
        {activeTab === 'ability_creator' && (
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
            {/* Top Controls: Filter & Add Ability Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAbilityFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                    abilityFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({allAbilities.length})
                </button>
                <button
                  onClick={() => setAbilityFilter('consumable')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                    abilityFilter === 'consumable'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Dùng 1 Lần / Bến Xe ({consumableShop.length})
                </button>
                <button
                  onClick={() => setAbilityFilter('permanent')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                    abilityFilter === 'permanent'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Vĩnh Viễn / Điện Nước ({permanentShop.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm kỹ năng..."
                  value={abilitySearch}
                  onChange={e => setAbilitySearch(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-md text-[11px] w-36 sm:w-44 bg-white"
                />
                <button
                  onClick={() => setShowAddAbilityForm(!showAddAbilityForm)}
                  className={`px-3 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors ${
                    showAddAbilityForm
                      ? 'bg-slate-300 text-slate-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <span>{showAddAbilityForm ? '✕ Đóng Form' : '+ Thiết Kế Năng Lực'}</span>
                </button>
              </div>
            </div>

            {/* Form Thiết Kế Năng Lực Mới: Điều kiện kích hoạt, Hiệu ứng, Con số tương ứng */}
            {showAddAbilityForm && (
              <form
                onSubmit={handleCreateAbility}
                className="p-3.5 bg-emerald-50/70 border-2 border-emerald-400 rounded-xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <span>✨</span> Thiết Kế Năng Lực Mới Cho Cửa Hàng
                  </span>
                  <span className="text-[10px] text-emerald-800">
                    Bao gồm 3 yếu tố: Điều kiện kích hoạt, Hiệu ứng, Con số tương ứng
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">Phân loại năng lực:</label>
                    <select
                      value={newAbility.type}
                      onChange={e =>
                        setNewAbility({ ...newAbility, type: e.target.value as any })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
                    >
                      <option value="consumable">Dùng 1 lần (Bán tại 4 Bến Xe)</option>
                      <option value="permanent">Vĩnh viễn (Bán tại Điện Lực & Nước)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">Tên kỹ năng:</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Cú Hích Vận Mệnh, Khiên Thuế..."
                      value={newAbility.name}
                      onChange={e => setNewAbility({ ...newAbility, name: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded font-bold bg-white text-xs"
                    />
                  </div>
                </div>

                {/* 3 Core Fields Requirement: 1. Trigger Condition, 2. Effect, 3. Effect Value */}
                <div className="p-3 bg-white border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Field 1: Điều Kiện Kích Hoạt */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                      <span>1️⃣</span> Điều Kiện Kích Hoạt:
                    </label>
                    <select
                      value={newAbility.triggerCondition}
                      onChange={e =>
                        setNewAbility({
                          ...newAbility,
                          triggerCondition: e.target.value as TriggerCondition,
                        })
                      }
                      className="p-1.5 border border-slate-300 rounded font-medium bg-white text-[11px]"
                    >
                      <option value="manual_anytime">Chủ động bấm dùng trong lượt</option>
                      <option value="when_roll_dice">Sau khi tung xúc xắc</option>
                      <option value="when_neighbor">Đứng cạnh hoặc trùng ô đối thủ</option>
                      <option value="when_land_corner">Dừng chân tại 4 ô góc</option>
                      <option value="when_pay_tax">Khi phải đóng thuế nhà nước</option>
                      <option value="when_pay_rent">Khi phải trả tiền thuê đất</option>
                      <option value="when_visit_station">Khi ghé vào Bến xe</option>
                    </select>
                  </div>

                  {/* Field 2: Hiệu Ứng */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                      <span>2️⃣</span> Hiệu Ứng Năng Lực:
                    </label>
                    <select
                      value={newAbility.effectType}
                      onChange={e =>
                        setNewAbility({ ...newAbility, effectType: e.target.value })
                      }
                      className="p-1.5 border border-slate-300 rounded font-medium bg-white text-[11px]"
                    >
                      <option value="dice_boost">Tăng bước xúc xắc (+)</option>
                      <option value="dice_reduce">Giảm bước xúc xắc (-)</option>
                      <option value="free_tax">Miễn thuế nhà nước</option>
                      <option value="half_rent">Giảm 50% tiền thuê đất</option>
                      <option value="send_to_jail_neighbor">Còng tay tống đối thủ vào tù</option>
                      <option value="push_neighbor">Bắt đối thủ tiến thêm bước</option>
                      <option value="destroy_house">Phá sập 1 cấp nhà đối thủ</option>
                      <option value="draw_both_cards">Rút cả Cơ Hội & Khí Vận</option>
                      <option value="steal_neighbor_cash">Thu phí người chơi lân cận</option>
                      <option value="corner_bonus">Thưởng tiền mặt 4 ô góc</option>
                    </select>
                  </div>

                  {/* Field 3: Con Số Tương Ứng (Tách riêng biệt) */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                      <span>3️⃣</span> Con Số Hiệu Ứng:
                    </label>
                    <input
                      type="number"
                      required
                      value={newAbility.effectValue}
                      onChange={e =>
                        setNewAbility({ ...newAbility, effectValue: Number(e.target.value) })
                      }
                      placeholder="VD: 1, 2, 3 hoặc 100đ"
                      className="p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-[11px]">Mô tả công năng:</label>
                  <input
                    type="text"
                    placeholder="Mô tả chi tiết tác dụng để người chơi đọc..."
                    value={newAbility.description}
                    onChange={e => setNewAbility({ ...newAbility, description: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">Giá mua (đ):</label>
                    <input
                      type="number"
                      value={newAbility.cost}
                      onChange={e => setNewAbility({ ...newAbility, cost: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block text-[11px]">
                      Số lượng trong kho ban đầu:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newAbility.quantity}
                      onChange={e =>
                        setNewAbility({
                          ...newAbility,
                          quantity: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs"
                >
                  Tạo Năng Lực & Đưa Vào Cửa Hàng
                </button>
              </form>
            )}

            {/* List of Existing Abilities with Quantity Controls */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Danh sách năng lực (Nếu số lượng = 0 thì <b>không xuất hiện</b> trong shop):
              </span>
              <span>Tổng: {filteredAbilities.length} năng lực</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredAbilities.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  Không tìm thấy năng lực nào phù hợp với bộ lọc!
                </div>
              ) : (
                filteredAbilities.map(ab => {
                  const qty = ab.quantity ?? 1;
                  const isZero = qty === 0;

                  return (
                    <div
                      key={ab.id}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                        isZero
                          ? 'bg-slate-100 border-slate-300 opacity-60'
                          : ab.kind === 'consumable'
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                          : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ab.kind === 'consumable'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {ab.kind === 'consumable' ? 'Dùng 1 lần' : 'Vĩnh viễn'}
                          </span>

                          <span className="font-bold text-slate-900 text-xs">{ab.name}</span>

                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                            {getTriggerLabel(ab.triggerCondition)}
                          </span>

                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {ab.cost}đ
                          </span>

                          {ab.effectValue !== undefined && ab.effectValue !== null && (
                            <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">
                              Trị số: {ab.effectValue}
                            </span>
                          )}

                          {isZero && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              🚫 Hết hàng / Ẩn (SL: 0)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {ab.description}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-bold px-1">Kho:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (ab.kind === 'consumable') {
                              onUpdateConsumableQuantity(ab.id, Math.max(0, qty - 1));
                            } else {
                              onUpdatePermanentQuantity(ab.id, Math.max(0, qty - 1));
                            }
                          }}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          title="Giảm số lượng tồn kho"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={e => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            if (ab.kind === 'consumable') {
                              onUpdateConsumableQuantity(ab.id, val);
                            } else {
                              onUpdatePermanentQuantity(ab.id, val);
                            }
                          }}
                          className="w-10 text-center font-mono font-bold text-xs p-0.5 border border-slate-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (ab.kind === 'consumable') {
                              onUpdateConsumableQuantity(ab.id, qty + 1);
                            } else {
                              onUpdatePermanentQuantity(ab.id, qty + 1);
                            }
                          }}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          title="Tăng số lượng tồn kho"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {activeTab === 'rules'
              ? 'Nhấn Áp Dụng để lưu cấu hình luật chơi mới'
              : 'Các thay đổi số lượng và thẻ mới được áp dụng ngay lập tức'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs transition-colors"
            >
              Đóng
            </button>
            {activeTab === 'rules' && (
              <button
                onClick={handleSaveRules}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
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
