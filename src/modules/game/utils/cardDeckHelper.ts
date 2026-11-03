/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card } from '../../../types/game';

export const drawRandomCardWithReset = (
  deck: Card[],
  deckType: 'chance' | 'chest',
  initialDeck: Card[],
  setDeck: React.Dispatch<React.SetStateAction<Card[]>>,
  addLog: (msg: string, type?: any) => void
): Card | null => {
  let pool = deck.filter(c => (c.quantity ?? 1) > 0);

  if (pool.length === 0) {
    const deckName = deckType === 'chance' ? 'Cơ Hội' : 'Khí Vận';
    addLog(`🔄 [Bộ Thẻ ${deckName}] Đã rút hết! Reset và xáo lại toàn bộ thẻ vào bộ bài.`, 'info');
    pool = deck.map(c => ({
      ...c,
      quantity: initialDeck.find(ic => ic.id === c.id)?.quantity ?? 1,
    }));
    setDeck(pool);
  }

  if (pool.length === 0) return null;

  const drawn = pool[Math.floor(Math.random() * pool.length)];

  // Deduct 1 count from drawn card
  setDeck(prev =>
    prev.map(c =>
      c.id === drawn.id ? { ...c, quantity: Math.max(0, (c.quantity ?? 1) - 1) } : c
    )
  );

  return drawn;
};
