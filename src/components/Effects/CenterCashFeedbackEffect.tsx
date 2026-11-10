/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { CashTransferEvent, Player } from '../../types/game';
import { sounds } from '../../utils/soundEngine';

interface Props {
  cashTransferEvent: CashTransferEvent | null;
  activePlayer: Player | null;
}

interface DisplayData {
  id: string;
  isGain: boolean;
  amount: number;
  reason: string;
  playerName: string;
}

export const CenterCashFeedbackEffect: React.FC<Props> = ({
  cashTransferEvent,
  activePlayer,
}) => {
  const [display, setDisplay] = useState<DisplayData | null>(null);
  const lastProcessedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cashTransferEvent || !activePlayer) return;
    if (lastProcessedIdRef.current === cashTransferEvent.id) return;
    lastProcessedIdRef.current = cashTransferEvent.id;

    const isLoss = cashTransferEvent.payerId === activePlayer.id && cashTransferEvent.amount > 0;
    const isGain = Boolean(
      cashTransferEvent.receiverIds &&
      cashTransferEvent.receiverIds.includes(activePlayer.id) &&
      cashTransferEvent.amount > 0
    );

    // Strictly trigger for the current roller / active player only
    if (!isLoss && !isGain) {
      return;
    }

    const share =
      isGain && cashTransferEvent.receiverIds.length > 0
        ? Math.round(cashTransferEvent.amount / cashTransferEvent.receiverIds.length)
        : cashTransferEvent.amount;

    if (isGain) {
      sounds.cashGain();
    } else {
      sounds.cashLoss();
    }

    setDisplay({
      id: cashTransferEvent.id,
      isGain,
      amount: share,
      reason: cashTransferEvent.reason || (isGain ? 'Nhận tiền thưởng' : 'Thanh toán tiền'),
      playerName: activePlayer.name,
    });

    const timer = setTimeout(() => {
      setDisplay(null);
    }, 1800);

    return () => clearTimeout(timer);
  }, [cashTransferEvent, activePlayer]);

  if (!display) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <div
        className={`px-6 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-4 max-w-sm backdrop-blur-md transform transition-all select-none ${
          display.isGain
            ? 'bg-gradient-to-r from-emerald-900/90 via-emerald-800/90 to-teal-900/90 border-emerald-400 text-emerald-100 shadow-emerald-950/60 ring-4 ring-emerald-500/30'
            : 'bg-gradient-to-r from-rose-950/90 via-red-900/90 to-rose-900/90 border-rose-400 text-rose-100 shadow-rose-950/60 ring-4 ring-rose-500/30'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 shadow-inner ${
            display.isGain
              ? 'bg-emerald-600/60 text-amber-300 border border-emerald-300/40'
              : 'bg-rose-700/60 text-rose-200 border border-rose-300/40'
          }`}
        >
          {display.isGain ? '💰' : '💸'}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black font-display tracking-tight drop-shadow-md ${
                display.isGain ? 'text-amber-300' : 'text-rose-200'
              }`}
            >
              {display.isGain ? `+${display.amount}đ` : `-${display.amount}đ`}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 truncate">
              {display.playerName}
            </span>
          </div>

          <div className="text-xs font-semibold opacity-90 truncate mt-0.5 max-w-[220px]">
            {display.reason}
          </div>
        </div>
      </div>
    </div>
  );
};
