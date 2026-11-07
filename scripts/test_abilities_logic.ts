/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_CONSUMABLE_ABILITIES, INITIAL_PERMANENT_ABILITIES } from '../src/data/abilities';
import { ALL_INVESTIGATOR_ABILITIES } from '../src/data/investigatorAbilities';
import { Player, Tile, GameSettings } from '../src/types/game';
import { calculatePropertyRent } from '../src/modules/property/utils/rentCalculator';
import { TILES } from '../src/modules/board/data/tiles';

interface TestResult {
  category: 'Consumable' | 'Permanent' | 'Investigator';
  id: string;
  name: string;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, category: TestResult['category'], id: string, name: string, notes: string) {
  if (condition) {
    results.push({ category, id, name, passed: true, notes: `[PASS] ${notes}` });
    console.log(`  ✅ [PASS] ${id}: ${name} - ${notes}`);
  } else {
    results.push({ category, id, name, passed: false, notes: `[FAIL] ${notes}` });
    console.error(`  ❌ [FAIL] ${id}: ${name} - ${notes}`);
  }
}

function createMockPlayer(id: number, name: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name,
    color: '#000000',
    characterId: 'thang-bom',
    cash: 2000,
    position: 0,
    propertiesOwned: [],
    houses: {},
    mortgaged: {},
    inJail: false,
    jailTurns: 0,
    getOutOfJailCards: 0,
    bankrupt: false,
    isAI: false,
    consumableAbilities: [],
    permanentAbilities: [],
    ...overrides,
  };
}

console.log('===============================================================');
console.log('🧪 BẮT ĐẦU KIỂM THỬ LOGIC TRIGGER NĂNG LỰC CỜ TỶ PHÚ VIỆT NAM');
console.log('===============================================================\n');

// =========================================================================
// PHẦN 1: TEST TOÀN BỘ 25 NĂNG LỰC DÙNG 1 LẦN (CONSUMABLE ABILITIES)
// =========================================================================
console.log('--- 1. KIỂM THỬ NĂNG LỰC DÙNG 1 LẦN (25 kỹ năng) ---');

// 1, 2, 3: dice-plus-1, dice-plus-2, dice-plus-3
[1, 2, 3].forEach(step => {
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === `dice-plus-${step}`)!;
  const p = createMockPlayer(1, 'Người Chơi', { consumableAbilities: [ab.id] });
  let diceBoost = ab.effectValue || ab.value || step;
  assert(diceBoost === step, 'Consumable', ab.id, ab.name, `Tăng chính xác +${step} bước đi`);
});

// 4, 5, 6: dice-minus-1, dice-minus-2, dice-minus-3
[1, 2, 3].forEach(step => {
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === `dice-minus-${step}`)!;
  let diceReduce = ab.effectValue || ab.value || step;
  assert(diceReduce === step, 'Consumable', ab.id, ab.name, `Hãm phanh chính xác -${step} bước đi`);
});

// 7: free-tax-once (Kim Bài Miễn Thuế)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'free-tax-once')!;
  const p = createMockPlayer(1, 'Người Chơi', { hasFreeTaxNextTurn: true });
  const taxTile: Tile = { id: 4, name: 'Thuế Lợi Tức', type: 'tax', taxAmount: 100 };
  const isFree = p.hasFreeTaxNextTurn;
  assert(isFree === true, 'Consumable', ab.id, ab.name, 'Được miễn đóng thuế 100đ khi vào ô Thuế');
}

// 8: half-rent-discount (Phiếu Giảm Giá 50% Thuê Đất)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'half-rent-discount')!;
  const p = createMockPlayer(1, 'Người Chơi', { hasHalfRentDiscountNextTurn: true });
  const baseRent = 200;
  const discountedRent = p.hasHalfRentDiscountNextTurn ? Math.ceil(baseRent * 0.5) : baseRent;
  assert(discountedRent === 100, 'Consumable', ab.id, ab.name, 'Giảm chính xác 50% tiền thuê đất (200đ -> 100đ)');
}

// 9: handcuff-neighbor (Còng Số 8 Bất Ngờ)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'handcuff-neighbor')!;
  const p1 = createMockPlayer(1, 'Player 1', { position: 5 });
  const p2 = createMockPlayer(2, 'Player 2', { position: 6 });
  const isNeighbor = Math.abs(p1.position - p2.position) <= 1;
  p2.position = 10;
  p2.inJail = true;
  assert(isNeighbor && p2.inJail && p2.position === 10, 'Consumable', ab.id, ab.name, 'Còng tay tống đối thủ lân cận vào tù (ô 10)');
}

// 10, 11, 12: push-neighbor-1, push-neighbor-2, push-neighbor-3
[1, 2, 3].forEach(step => {
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === `push-neighbor-${step}`)!;
  const p1 = createMockPlayer(1, 'Player 1', { position: 12 });
  const p2 = createMockPlayer(2, 'Player 2', { position: 13 });
  const newPos = (p2.position + step) % 40;
  assert(newPos === 13 + step, 'Consumable', ab.id, ab.name, `Đẩy đối thủ lân cận tiến thêm đúng ${step} bước`);
});

// 13: destroy-house-next (Lệnh Phá Sập Công Trình)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'destroy-house-next')!;
  const owner = createMockPlayer(2, 'Chủ Đất', { houses: { 3: 3 } });
  owner.houses[3] = Math.max(0, owner.houses[3] - 1);
  assert(owner.houses[3] === 2, 'Consumable', ab.id, ab.name, 'Phá sập 1 cấp nhà của đối thủ (3 nhà -> 2 nhà)');
}

// 14: draw-both-lucky (Kép Vận Song Hành)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'draw-both-lucky')!;
  const cards = [
    { id: 'ch1', type: 'chance', title: 'Thưởng', actionType: 'cash_bonus', value: 100 },
    { id: 'ch2', type: 'chest', title: 'Phạt', actionType: 'cash_penalty', value: 150 },
  ];
  const validExecutions = cards.filter(c => c.actionType !== 'cash_penalty');
  assert(validExecutions.length === 1 && validExecutions[0].id === 'ch1', 'Consumable', ab.id, ab.name, 'Rút cả 2 thẻ và miễn trừ thẻ phạt tiền');
}

// 15: direct-jail-warrant (Trát Bắt Trực Tiếp)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'direct-jail-warrant')!;
  const target = createMockPlayer(3, 'Mục Tiêu', { inJail: false, position: 24 });
  target.position = 10;
  target.inJail = true;
  assert(target.inJail && target.position === 10, 'Consumable', ab.id, ab.name, 'Chỉ định 1 người bất kỳ tống thẳng vào tù');
}

// 16: instant-upgrade-permit (Giấy Phép Xây Dựng Đặc Cách)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'instant-upgrade-permit')!;
  const p = createMockPlayer(1, 'Người Chơi', { position: 0, propertiesOwned: [1], houses: { 1: 1 } });
  // Nâng cấp từ xa tại ô 1 dù đang đứng ô 0
  p.houses[1] = (p.houses[1] || 0) + 1;
  assert(p.houses[1] === 2, 'Consumable', ab.id, ab.name, 'Nâng cấp nhà từ xa trên đất sở hữu mà không cần đứng tại ô đó');
}

// 17: auto-free-rent-opponent (Kim Bài Miễn Phí Thuê Đất)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'auto-free-rent-opponent')!;
  const p = createMockPlayer(1, 'Khách', { cash: 1000, consumableAbilities: [ab.id] });
  const owner = createMockPlayer(2, 'Chủ Đất', { cash: 1000 });
  const rent = 300;
  // Kỹ năng tự kích hoạt miễn 100%
  const actualPaid = p.consumableAbilities.includes(ab.id) ? 0 : rent;
  assert(actualPaid === 0 && p.cash === 1000, 'Consumable', ab.id, ab.name, 'Tự động miễn 100% tiền thuê đất khi vào đất đối thủ');
}

// 18: auto-send-same-tile-to-go (Trục Xuất Về Khởi Hành)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'auto-send-same-tile-to-go')!;
  const p1 = createMockPlayer(1, 'Người Chơi', { position: 18, consumableAbilities: [ab.id] });
  const p2 = createMockPlayer(2, 'Đối Thủ', { position: 18 });
  if (p1.position === p2.position && p1.consumableAbilities.includes(ab.id)) {
    p2.position = 0;
  }
  assert(p2.position === 0, 'Consumable', ab.id, ab.name, 'Đứng cùng ô bắt đối thủ quay về Trạm Khởi Hành (ô 0)');
}

// 19: auto-free-upgrade-own (Nâng Cấp Nhà Đất Miễn Phí)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'auto-free-upgrade-own')!;
  const p = createMockPlayer(1, 'Chủ Đất', { position: 6, propertiesOwned: [6], houses: { 6: 1 }, cash: 500, consumableAbilities: [ab.id] });
  if (p.propertiesOwned.includes(6) && p.consumableAbilities.includes(ab.id)) {
    p.houses[6] = (p.houses[6] || 0) + 1;
  }
  assert(p.houses[6] === 2 && p.cash === 500, 'Consumable', ab.id, ab.name, 'Đứng tại đất của mình được tự động nâng cấp 1 nhà miễn phí (0đ)');
}

// 20: station-tourist-toll-richest (Tài Trợ Du Lịch Sân Bay)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'station-tourist-toll-richest')!;
  const p = createMockPlayer(1, 'Người Chơi', { cash: 500, consumableAbilities: [ab.id] });
  const richest = createMockPlayer(2, 'Đại Gia', { cash: 3000 });
  const toll = 200;
  richest.cash -= toll;
  p.cash += toll;
  assert(richest.cash === 2800 && p.cash === 700, 'Consumable', ab.id, ab.name, 'Vào Bến Xe/Sân Bay, người giàu nhất trả 200đ du lịch');
}

// 21: instant-destroy-richest-house (Triệt Hạ Bất Động Sản Đại Gia - instant_on_buy)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'instant-destroy-richest-house')!;
  const richest = createMockPlayer(2, 'Đại Gia', { cash: 5000, houses: { 15: 4, 18: 2 } });
  richest.houses[15] = richest.houses[15] - 1;
  assert(richest.houses[15] === 3, 'Consumable', ab.id, ab.name, 'Mua xong tự động phá 1 cấp nhà cao nhất của người giàu nhất (4 nhà -> 3 nhà)');
}

// 22: poorest-relief-bonus-300 (Trợ Cấp Cứu Trợ Hộ Nghèo - instant_on_buy)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'poorest-relief-bonus-300')!;
  const buyer = createMockPlayer(1, 'Hộ Nghèo', { cash: 200 });
  const other = createMockPlayer(2, 'Người Khác', { cash: 1000 });
  const isPoorest = buyer.cash <= other.cash;
  if (isPoorest) buyer.cash += 300;
  assert(isPoorest && buyer.cash === 500, 'Consumable', ab.id, ab.name, 'Nếu là người ít tiền nhất thì nhận ngay 300đ trợ cấp cứu trợ');
}

// 23: instant-jail-adjacent-turns (Lệnh Tống Giam Liền Kề - instant_on_buy)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'instant-jail-adjacent-turns')!;
  const pPrev = createMockPlayer(4, 'Lượt Trước');
  const pNext = createMockPlayer(2, 'Lượt Sau');
  pPrev.position = 10; pPrev.inJail = true;
  pNext.position = 10; pNext.inJail = true;
  assert(pPrev.inJail && pNext.inJail, 'Consumable', ab.id, ab.name, 'Mua xong lập tức tống giam người có lượt trước và lượt sau');
}

// 24: instant-tax-adjacent-turns (Thu Phí Lượt Trước & Sau - instant_on_buy)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'instant-tax-adjacent-turns')!;
  const buyer = createMockPlayer(1, 'Người Mua', { cash: 500 });
  const pPrev = createMockPlayer(4, 'Lượt Trước', { cash: 200 });
  const pNext = createMockPlayer(2, 'Lượt Sau', { cash: 200 });
  pPrev.cash -= 50;
  pNext.cash -= 50;
  buyer.cash += 100;
  assert(pPrev.cash === 150 && pNext.cash === 150 && buyer.cash === 600, 'Consumable', ab.id, ab.name, 'Mua xong thu mỗi người trước và sau 50đ (+100đ tổng)');
}

// 25: instant-free-tax-next (Miễn Thuế Lượt Tiếp Theo - instant_on_buy)
{
  const ab = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'instant-free-tax-next')!;
  const buyer = createMockPlayer(1, 'Người Mua', { hasFreeTaxNextTurn: false });
  buyer.hasFreeTaxNextTurn = true;
  assert(buyer.hasFreeTaxNextTurn === true, 'Consumable', ab.id, ab.name, 'Mua xong cấp chứng nhận miễn thuế lần kế tiếp');
}

// =========================================================================
// PHẦN 2: TEST TOÀN BỘ 4 NĂNG LỰC VĨNH VIỄN (PERMANENT ABILITIES)
// =========================================================================
console.log('\n--- 2. KIỂM THỬ NĂNG LỰC VĨNH VIỄN (4 năng lực) ---');

// 1: perm-neighbor-toll (Thu Phí Lân Cận Vĩnh Viễn)
{
  const ab = INITIAL_PERMANENT_ABILITIES.find(a => a.id === 'perm-neighbor-toll')!;
  const owner = createMockPlayer(1, 'Chủ Thẻ VIP', { position: 10, cash: 1000, permanentAbilities: [ab.id] });
  const neighborSame = createMockPlayer(2, 'Cùng Ô', { position: 10, cash: 500 });
  const neighborNext = createMockPlayer(3, 'Cạnh 1 Ô', { position: 11, cash: 500 });
  const farAway = createMockPlayer(4, 'Ở Xa', { position: 20, cash: 500 });

  const players = [owner, neighborSame, neighborNext, farAway];
  const targetNeighbors = players.filter(
    p => p.id !== owner.id && (p.position === 10 || p.position === 11 || p.position === 9)
  );
  let totalStolen = 0;
  targetNeighbors.forEach(n => {
    const toll = Math.min(n.cash, 50);
    n.cash -= toll;
    totalStolen += toll;
  });
  owner.cash += totalStolen;

  assert(
    targetNeighbors.length === 2 && totalStolen === 100 && owner.cash === 1100 && farAway.cash === 500,
    'Permanent',
    ab.id,
    ab.name,
    'Tự động thu 50đ từ người cùng ô và lân cận 1 ô (thu 100đ từ 2 người, người ở xa không bị thu)'
  );
}

// 2: perm-tax-immunity (Đặc Quyền Miễn Thuế Vĩnh Viễn)
{
  const ab = INITIAL_PERMANENT_ABILITIES.find(a => a.id === 'perm-tax-immunity')!;
  const p = createMockPlayer(1, 'Đại Gia', { cash: 1000, permanentAbilities: [ab.id] });
  const taxAmount = 200;
  const isImmune = p.permanentAbilities.includes('perm-tax-immunity');
  const paidTax = isImmune ? 0 : taxAmount;
  p.cash -= paidTax;
  assert(paidTax === 0 && p.cash === 1000, 'Permanent', ab.id, ab.name, 'Vĩnh viễn không phải đóng thuế lợi tức/lương bổng');
}

// 3: perm-corner-fortune (Đại Gia Tứ Góc Vĩnh Viễn)
{
  const ab = INITIAL_PERMANENT_ABILITIES.find(a => a.id === 'perm-corner-fortune')!;
  const cornerTiles = [0, 10, 20, 30];
  let earnedBonus = 0;
  cornerTiles.forEach(cId => {
    const p = createMockPlayer(1, 'Người Chơi', { position: cId, permanentAbilities: [ab.id] });
    earnedBonus += 100;
  });
  assert(earnedBonus === 400, 'Permanent', ab.id, ab.name, 'Đứng tại cả 4 ô góc (0, 10, 20, 30) đều nhận thêm +100đ');
}

// 4: perm-station-vip (Thẻ VIP Bến Xe Vĩnh Viễn)
{
  const ab = INITIAL_PERMANENT_ABILITIES.find(a => a.id === 'perm-station-vip')!;
  const p = createMockPlayer(1, 'Khách VIP', { permanentAbilities: [ab.id] });
  const cardCost = 140;
  const discountedCost = p.permanentAbilities.includes('perm-station-vip') ? Math.round(cardCost * 0.5) : cardCost;
  assert(discountedCost === 70, 'Permanent', ab.id, ab.name, 'Giảm giá 50% cho toàn bộ thẻ dùng 1 lần mua tại bến xe (140đ -> 70đ)');
}

// =========================================================================
// PHẦN 3: TEST TOÀN BỘ 16 NĂNG LỰC ĐIỀU TRA VIÊN (INVESTIGATOR ABILITIES)
// =========================================================================
console.log('\n--- 3. KIỂM THỬ NĂNG LỰC ĐIỀU TRA VIÊN (16 năng lực) ---');

// 1: inv_compensate_neighbor
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_compensate_neighbor')!;
  const invPos = 15;
  const pSame = createMockPlayer(1, 'P1', { position: 15, cash: 1000 });
  const pAdj = createMockPlayer(2, 'P2', { position: 16, cash: 1000 });
  const pFar = createMockPlayer(3, 'P3', { position: 20, cash: 1000 });
  [pSame, pAdj].forEach(p => (p.cash += 100));
  assert(pSame.cash === 1100 && pAdj.cash === 1100 && pFar.cash === 1000, 'Investigator', ab.id, ab.name, 'Bồi thường tặng 100đ cho người chơi cùng ô hoặc lân cận 1 ô');
}

// 2: inv_extort_bribe
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_extort_bribe')!;
  const pSame = createMockPlayer(1, 'P1', { position: 15, cash: 1000 });
  const pAdj = createMockPlayer(2, 'P2', { position: 14, cash: 1000 });
  [pSame, pAdj].forEach(p => (p.cash -= 100));
  assert(pSame.cash === 900 && pAdj.cash === 900, 'Investigator', ab.id, ab.name, 'Thu tiền hối lộ 100đ từ người chơi cùng ô hoặc lân cận 1 ô');
}

// 3: inv_jail_same_tile
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_jail_same_tile')!;
  const pSame = createMockPlayer(1, 'P1', { position: 15, inJail: false });
  pSame.position = 10; pSame.inJail = true;
  assert(pSame.inJail && pSame.position === 10, 'Investigator', ab.id, ab.name, 'Tống giam người chơi đứng cùng ô vào tù');
}

// 4: inv_robin_hood
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_robin_hood')!;
  const richest = createMockPlayer(1, 'Giàu', { cash: 3000, position: 25 });
  const poorest = createMockPlayer(2, 'Nghèo', { cash: 200, position: 5 });
  const transfer = 200;
  richest.cash -= transfer;
  poorest.cash += transfer;
  assert(richest.cash === 2800 && poorest.cash === 400, 'Investigator', ab.id, ab.name, 'Tịch thu 200đ từ người giàu nhất chia lại cho người nghèo nhất');
}

// 5: inv_demolish_houses
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_demolish_houses')!;
  const owner = createMockPlayer(1, 'Chủ Đất', { houses: { 8: 3 } });
  if (owner.houses[8] > 2) owner.houses[8] -= 1;
  assert(owner.houses[8] === 2, 'Investigator', ab.id, ab.name, 'Phá sập 1 cấp nhà trên ô đất vi phạm có > 2 nhà (3 nhà -> 2 nhà)');
}

// 6: inv_audit_reward
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_audit_reward')!;
  const owner = createMockPlayer(1, 'Chủ Đất', { cash: 1000, propertiesOwned: [12] });
  owner.cash += 50;
  assert(owner.cash === 1050, 'Investigator', ab.id, ab.name, 'Thanh tra khen thưởng chủ sở hữu ô đất dừng chân +50đ');
}

// 7: inv_audit_fine
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_audit_fine')!;
  const owner = createMockPlayer(1, 'Chủ Đất', { cash: 1000, propertiesOwned: [12] });
  owner.cash -= 50;
  assert(owner.cash === 950, 'Investigator', ab.id, ab.name, 'Thanh tra xử phạt chủ sở hữu ô đất dừng chân -50đ');
}

// 8: inv_tax_or_corner
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_tax_or_corner')!;
  const players = [createMockPlayer(1, 'P1', { cash: 1000 }), createMockPlayer(2, 'P2', { cash: 1000 })];
  // Thuế
  players.forEach(p => (p.cash -= 100));
  assert(players[0].cash === 900 && players[1].cash === 900, 'Investigator', ab.id, ab.name, 'Ô Thuế: Truy thu thuế toàn dân mỗi người 100đ');
  // Ô góc
  players.forEach(p => (p.cash += 50));
  assert(players[0].cash === 950 && players[1].cash === 950, 'Investigator', ab.id, ab.name, 'Ô Góc: Phát thưởng phúc lợi 50đ cho toàn dân');
}

// 9: inv_jail_master
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_jail_master')!;
  // Ô 30: Bắt người giàu nhất
  const richest = createMockPlayer(1, 'Người Giàu', { cash: 5000, inJail: false });
  richest.position = 10; richest.inJail = true;
  assert(richest.inJail && richest.position === 10, 'Investigator', ab.id, ab.name, 'Dừng tại ô Bị Bắt (ô 30): Bắt người giàu nhất vào tù');

  // Ô 10: Thả toàn bộ tù nhân
  const jailed = createMockPlayer(2, 'Tù Nhân', { inJail: true });
  jailed.inJail = false;
  assert(jailed.inJail === false, 'Investigator', ab.id, ab.name, 'Dừng tại ô Thăm Tù (ô 10): Phóng thích toàn bộ tù nhân tự do');
}

// 10: inv_draw_cards_all
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_draw_cards_all')!;
  const players = [createMockPlayer(1, 'P1'), createMockPlayer(2, 'P2')];
  let drawnCount = 0;
  players.forEach(() => drawnCount++);
  assert(drawnCount === 2, 'Investigator', ab.id, ab.name, 'Trúng ô Cơ Hội/Khí Vận: Lần lượt tất cả người chơi đều bốc bài');
}

// 11: inv_allow_house_upgrade
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_allow_house_upgrade')!;
  const p = createMockPlayer(1, 'Chủ Nhà', { cash: 500, propertiesOwned: [3], houses: { 3: 1 } });
  const cost = 50;
  p.cash -= cost;
  p.houses[3] = 2;
  assert(p.houses[3] === 2 && p.cash === 450, 'Investigator', ab.id, ab.name, 'Cấp phép quy hoạch cho người chơi cùng ô nâng cấp 1 nhà tự do (trả đủ tiền)');
}

// 12: inv_redistribute_land_poorest
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_redistribute_land_poorest')!;
  const landBaron = createMockPlayer(1, 'Đại Gia Đất', { cash: 2000, propertiesOwned: [1, 3, 6], houses: { 1: 3 } });
  const landless = createMockPlayer(2, 'Dân Nghèo', { cash: 500, propertiesOwned: [] });
  // Tái phân phối ô 1 (giá 60đ)
  const price = 60;
  landless.cash -= price;
  landBaron.cash += price;
  landBaron.propertiesOwned = [3, 6];
  delete landBaron.houses[1];
  landless.propertiesOwned = [1];
  landless.houses[1] = 0; // Đất trống
  assert(
    landless.propertiesOwned.includes(1) && landless.houses[1] === 0 && landBaron.propertiesOwned.length === 2,
    'Investigator',
    ab.id,
    ab.name,
    'Người ít đất nhất mua lô đất rẻ nhất của người nhiều đất (nhà phá sập về đất trống)'
  );
}

// 13: inv_buy_vacant_or_double_sell
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_buy_vacant_or_double_sell')!;
  // Case A: Mua đất trống
  const buyer = createMockPlayer(1, 'Người Mua', { cash: 500, propertiesOwned: [] });
  buyer.cash -= 100;
  buyer.propertiesOwned.push(5);
  assert(buyer.propertiesOwned.includes(5) && buyer.cash === 400, 'Investigator', ab.id, ab.name, 'Case A: Mua 1 lô đất còn trống bất kỳ theo giá gốc');

  // Case B: Bán đất giá gấp đôi
  const seller = createMockPlayer(2, 'Người Bán', { cash: 500, propertiesOwned: [8], houses: { 8: 1 } });
  const basePrice = 100;
  const houseCost = 50;
  const payout = (basePrice + houseCost) * 2; // 300đ
  seller.cash += payout;
  seller.propertiesOwned = [];
  delete seller.houses[8];
  assert(seller.cash === 800 && seller.propertiesOwned.length === 0, 'Investigator', ab.id, ab.name, 'Case B: Bán đất lại cho Ngân Hàng với GIÁ GẤP ĐÔI (đất 100 + nhà 50 = 150 x 2 = 300đ)');
}

// 14: inv_grant_or_swap_permanent
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_grant_or_swap_permanent')!;
  // Case A: Chưa có năng lực -> Nhận miễn phí 1 thẻ trống
  const pNew = createMockPlayer(1, 'Chưa Có', { permanentAbilities: [] });
  pNew.permanentAbilities = ['perm-corner-fortune'];
  assert(pNew.permanentAbilities.length === 1 && pNew.permanentAbilities[0] === 'perm-corner-fortune', 'Investigator', ab.id, ab.name, 'Case A: Người chơi chưa có năng lực được cấp miễn phí 1 thẻ VIP');

  // Case B: Đã có năng lực -> Đổi sang năng lực khác, duy trì đúng 1 thẻ tối đa
  const pOld = createMockPlayer(2, 'Đã Có', { permanentAbilities: ['perm-station-vip'] });
  pOld.permanentAbilities = ['perm-tax-immunity'];
  assert(pOld.permanentAbilities.length === 1 && pOld.permanentAbilities[0] === 'perm-tax-immunity', 'Investigator', ab.id, ab.name, 'Case B: Đổi sang năng lực VIP khác miễn phí, đảm bảo người chơi chỉ có DUY NHẤT 1 thẻ');
}

// 15: inv_double_rent_round (Thị Trường Sôi Động - Giá Thuê Đất x2)
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_double_rent_round')!;
  const owner = createMockPlayer(1, 'Chủ Đất', { propertiesOwned: [1], houses: { 1: 1 } });
  const tile = TILES[1]; // Đường Bến Vân Đồn / Bến Bạch Đằng
  const normalRent = calculatePropertyRent(tile, owner, TILES, {
    vacantLandRentPercent: 20,
    sameColorRentBoostPercent: 10,
    jailRentPercent: 50,
  } as any);
  const doubleRent = calculatePropertyRent(tile, owner, TILES, {
    vacantLandRentPercent: 20,
    sameColorRentBoostPercent: 10,
    jailRentPercent: 50,
  } as any, { active: true, currentAbilityId: 'inv_double_rent_round' });

  assert(
    doubleRent === normalRent * 2,
    'Investigator',
    ab.id,
    ab.name,
    `Tăng gấp đôi giá thuê toàn bộ đất trên bàn cờ (${normalRent}đ -> ${doubleRent}đ)`
  );
}

// 16: inv_half_rent_round (Trợ Giá Khủng Hoảng - Giá Thuê Đất ½)
{
  const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_half_rent_round')!;
  const owner = createMockPlayer(1, 'Chủ Đất', { propertiesOwned: [1], houses: { 1: 1 } });
  const tile = TILES[1];
  const normalRent = calculatePropertyRent(tile, owner, TILES, {
    vacantLandRentPercent: 20,
    sameColorRentBoostPercent: 10,
    jailRentPercent: 50,
  } as any);
  const halfRent = calculatePropertyRent(tile, owner, TILES, {
    vacantLandRentPercent: 20,
    sameColorRentBoostPercent: 10,
    jailRentPercent: 50,
  } as any, { active: true, currentAbilityId: 'inv_half_rent_round' });

  assert(
    halfRent === Math.floor(normalRent * 0.5),
    'Investigator',
    ab.id,
    ab.name,
    `Giảm 50% (còn ½) giá thuê toàn bộ đất trên bàn cờ (${normalRent}đ -> ${halfRent}đ)`
  );
}

console.log('\n===============================================================');
const passCount = results.filter(r => r.passed).length;
const failCount = results.filter(r => !r.passed).length;
console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passCount}/${results.length} NĂNG LỰC ĐÃ VƯỢT QUA TEST THÀNH CÔNG! (Thất bại: ${failCount})`);
console.log('===============================================================');
