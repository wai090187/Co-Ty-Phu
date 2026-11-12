/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { CashTransferEvent, Player } from '../../types/game';
import { sounds } from '../../utils/soundEngine';

interface Props {
  cashTransferEvent: CashTransferEvent | null;
  activePlayer: Player | null;
}

export const CenterCashFeedbackEffect: React.FC<Props> = ({
  cashTransferEvent,
  activePlayer,
}) => {
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

    if (isGain) {
      sounds.cashGain();
    } else {
      sounds.cashLoss();
    }
  }, [cashTransferEvent, activePlayer]);

  return null;
};
