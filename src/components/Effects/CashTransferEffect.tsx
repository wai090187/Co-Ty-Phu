import React, { useEffect, useState } from 'react';
import { CashTransferEvent, Player } from '../../types/game';
import { CharacterIllustration2D5 } from '../Common/CharacterIllustration2D5';

interface Props {
  event: CashTransferEvent | null;
  players: Player[];
  onDismiss: () => void;
}

export const CashTransferEffect: React.FC<Props> = ({ event, players, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3200);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [event, onDismiss]);

  if (!event || !visible) return null;

  const payer = event.payerId ? players.find(p => p.id === event.payerId) : undefined;
  const receivers = event.receiverIds
    .map(rid => players.find(p => p.id === rid))
    .filter((p): p is Player => !!p);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="relative max-w-xl w-full bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center gap-4 text-white">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title & Reason */}
        <div className="text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <span>💸</span> Giao Dịch Chuyển Tiền
          </div>
          <h3 className="text-lg sm:text-xl font-display font-black text-amber-400 drop-shadow">
            {event.reason}
          </h3>
          <span className="text-xs text-slate-300">
            Tổng giá trị: <b className="text-emerald-400 font-mono text-sm">{event.amount}đ</b>
          </span>
        </div>

        {/* Transfer Stage: Payer -> Flying Coins -> Receiver(s) */}
        <div className="w-full flex items-center justify-around gap-2 my-2 z-10 flex-wrap sm:flex-nowrap">
          {/* Payer Side (Người Mất Tiền -> Buồn) */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            {payer ? (
              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <CharacterIllustration2D5
                    characterId={payer.characterId}
                    isAI={payer.isAI}
                    aiNumber={payer.id}
                    aiLevel={payer.aiLevel}
                    emotion="sad"
                    size="md"
                  />
                  {/* Floating Red Minus Badge */}
                  <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-rose-600 border border-rose-400 text-white font-mono font-black text-xs shadow-lg animate-bounce">
                    -{event.amount}đ 😢
                  </div>
                </div>
                <span className="font-bold text-xs mt-3 text-slate-200">{payer.name}</span>
                <span className="text-[10px] text-rose-300 font-semibold">(Mất tiền - Buồn)</span>
              </div>
            ) : (
              // Bank Payer
              <div className="flex flex-col items-center">
                <div className="w-20 h-24 rounded-2xl bg-gradient-to-b from-amber-600 to-amber-800 border-2 border-amber-400 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-3xl">🏛️</span>
                  <span className="text-[10px] font-bold text-amber-200 mt-1">Ngân Hàng</span>
                </div>
                <span className="font-bold text-xs mt-2 text-amber-300">Ngân Hàng Cấp</span>
              </div>
            )}
          </div>

          {/* Center: Dynamic Animated Flying Coins */}
          <div className="flex flex-col items-center justify-center px-4 py-2 relative">
            <div className="flex items-center gap-1">
              <span className="text-2xl animate-pulse">🪙</span>
              <span className="text-xl animate-bounce delay-75">💸</span>
              <span className="text-2xl animate-pulse delay-150">🪙</span>
            </div>
            <div className="w-28 sm:w-36 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full my-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/60 animate-ping" />
            </div>
            <span className="text-[11px] font-mono font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-600/50">
              {event.amount} đ
            </span>
          </div>

          {/* Receiver(s) Side (Người Nhận Tiền -> Vui) */}
          <div className="flex items-center justify-center gap-3 flex-wrap min-w-[120px]">
            {receivers.length > 0 ? (
              receivers.map(rec => {
                const share = Math.round(event.amount / receivers.length);
                return (
                  <div key={rec.id} className="relative flex flex-col items-center">
                    <div className="relative">
                      <CharacterIllustration2D5
                        characterId={rec.characterId}
                        isAI={rec.isAI}
                        aiNumber={rec.id}
                        aiLevel={rec.aiLevel}
                        emotion="happy"
                        size="md"
                      />
                      {/* Floating Green Plus Badge */}
                      <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-600 border border-emerald-400 text-white font-mono font-black text-xs shadow-lg animate-bounce">
                        +{share}đ 😄
                      </div>
                    </div>
                    <span className="font-bold text-xs mt-3 text-slate-200">{rec.name}</span>
                    <span className="text-[10px] text-emerald-300 font-semibold">
                      (Nhận tiền - Vui vẻ)
                    </span>
                  </div>
                );
              })
            ) : (
              // Bank Receiver
              <div className="flex flex-col items-center">
                <div className="w-20 h-24 rounded-2xl bg-gradient-to-b from-emerald-700 to-emerald-900 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-3xl">🏛️</span>
                  <span className="text-[10px] font-bold text-emerald-200 mt-1">Kho Bạc</span>
                </div>
                <span className="font-bold text-xs mt-2 text-emerald-300">Nộp Vào Ngân Hàng</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Click to Dismiss Hint */}
        <span className="text-[10px] text-slate-400 mt-1 italic">
          (Bấm vào bất kỳ đâu trên màn hình để bỏ qua hiệu ứng)
        </span>
      </div>
    </div>
  );
};
