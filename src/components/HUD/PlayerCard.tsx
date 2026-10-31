import React, { useState } from 'react';
import { Player, Tile, ConsumableAbility, PermanentAbility } from '../../types/game';
import { CharacterAvatar } from '../Common/CharacterAvatar';

interface Props {
  player: Player;
  isCurrentTurn: boolean;
  onOpenInventory?: () => void;
  onPayBail?: () => void;
  bailInfo?: { canPay: boolean; cost: number; reason?: string };
  allTiles: Tile[];
  allConsumables: ConsumableAbility[];
  allPermanents: PermanentAbility[];
}

export const PlayerCard: React.FC<Props> = ({
  player,
  isCurrentTurn,
  onOpenInventory,
  onPayBail,
  bailInfo,
  allTiles,
  allConsumables,
  allPermanents,
}) => {
  const [hoveredMenu, setHoveredMenu] = useState<'properties' | 'consumables' | 'permanents' | null>(null);

  const ownedProperties = player.propertiesOwned
    .map(tid => allTiles.find(t => t.id === tid))
    .filter((t): t is Tile => !!t);

  const ownedConsumables = player.consumableAbilities
    .map(cid => allConsumables.find(c => c.id === cid))
    .filter((c): c is ConsumableAbility => !!c);

  const ownedPermanents = player.permanentAbilities
    .map(pid => allPermanents.find(p => p.id === pid))
    .filter((p): p is PermanentAbility => !!p);

  return (
    <div
      className={`relative p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between select-none ${
        player.bankrupt
          ? 'bg-slate-200 border-slate-300 opacity-60'
          : isCurrentTurn
          ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400'
          : 'bg-white/90 border-slate-200 shadow-xs'
      }`}
    >
      {/* Top Bar: Avatar, Name, Color Tag, Turn Badge */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <CharacterAvatar
            characterId={player.characterId}
            isAI={player.isAI}
            aiNumber={player.id}
            aiLevel={player.aiLevel}
            size="sm"
          />
          {player.emotion && (
            <span
              className={`absolute -bottom-1 -right-1 text-xs px-1 py-0.2 rounded-full border shadow-sm animate-bounce ${
                player.emotion === 'happy'
                  ? 'bg-emerald-500 border-white text-white'
                  : player.emotion === 'sad'
                  ? 'bg-rose-500 border-white text-white'
                  : 'bg-amber-500 border-white text-white'
              }`}
              title={player.emotionMessage || player.emotion}
            >
              {player.emotion === 'happy' ? '😄' : player.emotion === 'sad' ? '😢' : '⚡'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: player.color }}
            />
            <span className="font-bold text-xs text-slate-900 truncate">{player.name}</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-black text-sm text-emerald-700">
              {player.bankrupt ? 'PHÁ SẢN' : `${player.cash} đ`}
            </span>
            {isCurrentTurn && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white font-extrabold text-[9px] rounded uppercase animate-pulse">
                Lượt đi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Hoverable Stats Bar */}
      {!player.bankrupt && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-700 font-medium relative">
          {/* Properties with Quick Hover */}
          <div
            className="relative cursor-pointer hover:text-amber-800"
            onMouseEnter={() => setHoveredMenu('properties')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <span className="font-bold">🏢 {ownedProperties.length} Đất</span>

            {hoveredMenu === 'properties' && (
              <div className="absolute bottom-full left-0 mb-1 w-52 bg-slate-900 text-white p-2 rounded-xl shadow-2xl z-50 text-[10px] pointer-events-none">
                <span className="font-bold text-amber-400 block border-b border-slate-700 pb-1 mb-1">
                  Bất Động Sản ({ownedProperties.length}):
                </span>
                {ownedProperties.length === 0 ? (
                  <span className="text-slate-400 italic">Chưa sở hữu ô đất nào</span>
                ) : (
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {ownedProperties.map(p => {
                      const h = player.houses[p.id] || 0;
                      return (
                        <div key={p.id} className="flex justify-between items-center">
                          <span className="truncate pr-1">{p.name}</span>
                          <span className="text-amber-300 font-mono shrink-0">
                            {h === 5 ? 'KS' : h > 0 ? `${h} nhà` : 'Đất'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consumable Abilities with Quick Hover */}
          <div
            className="relative cursor-pointer hover:text-emerald-800"
            onMouseEnter={() => setHoveredMenu('consumables')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <span className="font-bold">⚡ {ownedConsumables.length}/3 Thẻ</span>

            {hoveredMenu === 'consumables' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 bg-slate-900 text-white p-2 rounded-xl shadow-2xl z-50 text-[10px] pointer-events-none">
                <span className="font-bold text-emerald-400 block border-b border-slate-700 pb-1 mb-1">
                  Kỹ Năng Dùng 1 Lần ({ownedConsumables.length}/3):
                </span>
                {ownedConsumables.length === 0 ? (
                  <span className="text-slate-400 italic">Chưa có thẻ năng lực nào</span>
                ) : (
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {ownedConsumables.map((c, i) => (
                      <div key={i} className="flex flex-col border-b border-slate-800 pb-0.5">
                        <span className="font-bold text-emerald-300">{c.name}</span>
                        <span className="text-[9px] text-slate-300">{c.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permanent Abilities with Quick Hover */}
          <div
            className="relative cursor-pointer hover:text-amber-800"
            onMouseEnter={() => setHoveredMenu('permanents')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <span className="font-bold">👑 {ownedPermanents.length} VIP</span>

            {hoveredMenu === 'permanents' && (
              <div className="absolute bottom-full right-0 mb-1 w-56 bg-slate-900 text-white p-2 rounded-xl shadow-2xl z-50 text-[10px] pointer-events-none">
                <span className="font-bold text-amber-400 block border-b border-slate-700 pb-1 mb-1">
                  Năng Lực Vĩnh Viễn ({ownedPermanents.length}):
                </span>
                {ownedPermanents.length === 0 ? (
                  <span className="text-slate-400 italic">Chưa sở hữu năng lực VIP</span>
                ) : (
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {ownedPermanents.map((p, i) => (
                      <div key={i} className="flex flex-col border-b border-slate-800 pb-0.5">
                        <span className="font-bold text-amber-300">{p.name}</span>
                        <span className="text-[9px] text-slate-300">{p.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {onOpenInventory && (
            <button
              onClick={onOpenInventory}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition-colors"
            >
              Túi đồ
            </button>
          )}
        </div>
      )}

      {/* Jail / Investigation Status & Action with Detailed Rule Breakdown */}
      {player.inJail && !player.bankrupt && (
        <div className={`mt-1.5 pt-1.5 border-t p-1.5 rounded-lg flex flex-col gap-1 ${
          bailInfo?.reason?.includes('điều tra') || bailInfo?.reason?.includes('khắc phục')
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-red-50 border-red-100 text-red-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold">
              {bailInfo?.reason?.includes('điều tra') || bailInfo?.reason?.includes('khắc phục')
                ? `🚨 Bị điều tra (${player.jailTurns}/3)`
                : `🔒 Ở tù (${player.jailTurns}/3)`}
            </span>
            {isCurrentTurn && onPayBail && bailInfo?.canPay && (
              <button
                onClick={onPayBail}
                className={`px-2 py-0.5 text-white rounded text-[9px] font-bold shadow-xs transition-colors ${
                  bailInfo?.reason?.includes('điều tra') || bailInfo?.reason?.includes('khắc phục')
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {bailInfo?.reason?.includes('điều tra') || bailInfo?.reason?.includes('khắc phục')
                  ? `Xóa án ${bailInfo.cost}đ`
                  : `Bảo lãnh ${bailInfo.cost}đ`}
              </button>
            )}
          </div>
          {bailInfo?.reason && (
            <span className={`text-[8.5px] leading-tight block ${
              bailInfo?.reason?.includes('điều tra') || bailInfo?.reason?.includes('khắc phục')
                ? 'text-amber-800'
                : 'text-red-700'
            }`}>
              {bailInfo.reason}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
