import React, { useEffect } from 'react';
import { ConsumableAbility, PermanentAbility, Player, Tile } from '../../types/game';
import { CharacterIllustration2D5 } from '../Common/CharacterIllustration2D5';

interface Props {
  player: Player;
  allConsumables: ConsumableAbility[];
  allPermanents: PermanentAbility[];
  tiles: Tile[];
  onUseAbility: (ability: ConsumableAbility) => void;
  onUseGetOutOfJailCard?: () => void;
  onClose: () => void;
  isCurrentTurn: boolean;
  canUseDiceModifiers?: boolean;
}

export const InventoryModal: React.FC<Props> = ({
  player,
  allConsumables,
  allPermanents,
  tiles,
  onUseAbility,
  onUseGetOutOfJailCard,
  onClose,
  isCurrentTurn,
  canUseDiceModifiers = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const ownedConsumables = player.consumableAbilities
    .map(id => allConsumables.find(a => a.id === id))
    .filter((a): a is ConsumableAbility => !!a);

  const ownedPermanents = player.permanentAbilities
    .map(id => allPermanents.find(a => a.id === id))
    .filter((a): a is PermanentAbility => !!a);

  const ownedProperties = player.propertiesOwned
    .map(id => tiles.find(t => t.id === id))
    .filter((t): t is Tile => !!t);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF8F5] border-2 border-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 shrink-0 flex items-center justify-center">
              <CharacterIllustration2D5
                characterId={player.characterId}
                isAI={player.isAI}
                aiNumber={player.id}
                aiLevel={player.aiLevel}
                emotion="action"
                size="sm"
                showPedestal={false}
              />
            </div>
            <div>
              <h2 className="font-display text-lg font-black tracking-wide uppercase">
                Túi Đồ & Năng Lực Của Bạn
              </h2>
              <span className="text-xs text-slate-300">
                {player.name} · Tiền mặt: <b className="text-emerald-400 font-mono">{player.cash} đ</b>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          {/* Section: Thẻ Ra Tù Miễn Phí */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">
                🎟️ Thẻ Thoát Tù Miễn Phí ({player.getOutOfJailCards || 0})
              </span>
              {player.inJail && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                  Đang bị tạm giữ / điều tra
                </span>
              )}
            </div>

            {player.getOutOfJailCards > 0 ? (
              <div className="p-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-sm shrink-0">
                    🎟️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Thẻ Ra Tù Miễn Phí</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white font-mono font-bold text-[10px] rounded-full">
                        x{player.getOutOfJailCards}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 text-[11px]">
                      Dùng khi ở tù hoặc đang bị công an điều tra để được trả tự do lập tức mà không mất tiền bảo lãnh.
                    </p>
                  </div>
                </div>

                {player.inJail && isCurrentTurn && onUseGetOutOfJailCard && (
                  <button
                    onClick={onUseGetOutOfJailCard}
                    className="px-3.5 py-2 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors shrink-0 animate-pulse"
                  >
                    Dùng Ngay
                  </button>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic py-1 text-[11px]">
                Chưa sở hữu thẻ này. Bạn có thể rút được từ ô Cơ Hội / Khí Vận hoặc cấp qua Bảng Cheat Test.
              </p>
            )}
          </div>

          {/* Section 1: Consumable Abilities */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">
                ⚡ Năng Lực Dùng 1 Lần ({ownedConsumables.length}/3)
              </span>
              <span className="text-[10px] text-slate-500 italic">
                (Bí mật với đối thủ)
              </span>
            </div>

            {ownedConsumables.length === 0 ? (
              <p className="text-slate-400 italic py-2">
                Chưa có thẻ nào. Hãy ghé các Bến Xe trên bàn cờ để mua thẻ năng lực bí mật!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {ownedConsumables.map(ab => {
                  const isDiceMod = ab.effectType === 'dice_boost' || ab.effectType === 'dice_reduce';
                  const canUseNow =
                    isCurrentTurn &&
                    (!isDiceMod || canUseDiceModifiers);

                  return (
                    <div
                      key={ab.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{ab.name}</span>
                        <p className="text-slate-600 mt-0.5">{ab.description}</p>
                      </div>
                      <button
                        onClick={() => onUseAbility(ab)}
                        disabled={!canUseNow}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors ${
                          canUseNow
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canUseNow ? 'Kích Hoạt' : 'Chưa Thể Dùng'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Permanent Abilities */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">
                👑 Năng Lực Vĩnh Viễn ({ownedPermanents.length})
              </span>
            </div>

            {ownedPermanents.length === 0 ? (
              <p className="text-slate-400 italic py-2">
                Chưa sở hữu. Ghé Công ty Điện Lực hoặc Thủy Cục để mua năng lực vĩnh viễn!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {ownedPermanents.map(ab => (
                  <div
                    key={ab.id}
                    className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{ab.name}</span>
                      <p className="text-slate-600 mt-0.5">{ab.description}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] shrink-0">
                      Tự động kích hoạt
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Properties Owned */}
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">
                🏢 Bất Động Sản Nắm Giữ ({ownedProperties.length})
              </span>
            </div>

            {ownedProperties.length === 0 ? (
              <p className="text-slate-400 italic py-2">Chưa sở hữu ô đất nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {ownedProperties.map(tile => {
                  const houses = player.houses[tile.id] || 0;
                  const isMortgaged = player.mortgaged[tile.id] || false;
                  return (
                    <div
                      key={tile.id}
                      className="p-2 rounded-lg border border-slate-200 bg-white flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tile.colorHex }}
                        />
                        <span className="font-bold text-slate-800 truncate">{tile.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                        <span>
                          {houses === 5
                            ? 'Khách sạn'
                            : houses > 0
                            ? `${houses} Nhà`
                            : 'Đất trống'}
                        </span>
                        {isMortgaged ? (
                          <span className="text-red-600 font-bold">Cầm cố</span>
                        ) : (
                          <span className="text-emerald-700 font-bold font-mono">
                            {tile.rents?.[houses] || 0} đ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow flex items-center gap-1.5"
          >
            <span>Đóng</span>
            <kbd className="px-1.5 py-0.2 text-[10px] bg-slate-700 text-slate-200 rounded border border-slate-600 font-mono">Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
