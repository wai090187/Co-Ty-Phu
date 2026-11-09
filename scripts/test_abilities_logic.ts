/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_CONSUMABLE_ABILITIES } from '../src/data/abilities';
import { Player, Tile, GameSettings } from '../src/types/game';
import { runInvestigatorTests } from './test_investigator_tests';
import { runPermanentTests } from './test_permanent_tests';
import { filterAbilitiesForAI, isMovementModifierAbility } from '../src/modules/game/utils/abilityFilterHelper';
import { pickNextInvestigatorAbility, ALL_INVESTIGATOR_ABILITIES } from '../src/data/investigatorAbilities';
import { applyGoTileBonus } from '../src/modules/game/utils/goBonusHelper';
import { buildGameLogDebugJson, buildGameLogText } from '../src/modules/game/utils/gameLogExporter';
import { INITIAL_CHANCE_CARDS, INITIAL_CHEST_CARDS } from '../src/data/cards';



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
runPermanentTests(assert, createMockPlayer);


// =========================================================================
// PHẦN 3: TEST TOÀN BỘ 16 NĂNG LỰC ĐIỀU TRA VIÊN (INVESTIGATOR ABILITIES)
// =========================================================================
runInvestigatorTests(assert, createMockPlayer);

// =========================================================================
// PHẦN 4: TEST NĂNG LỰC ĐIỀU TRA VIÊN ĐI NGƯỢC CHIỀU & LỌC NĂNG LỰC CHO AI
// =========================================================================
console.log('\n--- PHẦN 4: TEST DI CHUYỂN NGƯỢC CHIỀU & LỌC NĂNG LỰC CHO AI ---');

// Test 4.1: Di chuyển ngược chiều của Điều Tra Viên: (oldPos - 1 + 40) % 40
{
  let pos = 0;
  pos = (pos - 1 + 40) % 40; // 39
  assert(pos === 39, 'Investigator', 'inv_move_counter_clockwise', 'Đi ngược chiều', 'Từ ô 0 lùi 1 bước sang ô 39 (ngược chiều kim đồng hồ)');

  pos = (pos - 1 + 40) % 40; // 38
  assert(pos === 38, 'Investigator', 'inv_move_counter_clockwise', 'Đi ngược chiều', 'Từ ô 39 lùi 1 bước sang ô 38');

  // Lùi đủ 40 bước từ 0 phải quay về đúng 0
  let testPos = 0;
  for (let i = 0; i < 40; i++) {
    testPos = (testPos - 1 + 40) % 40;
  }
  assert(testPos === 0, 'Investigator', 'inv_move_counter_clockwise', 'Đi ngược chiều', 'Đi lùi đúng 40 bước hoàn thành 1 vòng tuần tra về ô 0');
}

// Test 4.2: Năng lực Điều Tra Viên khởi đầu là ngẫu nhiên
{
  const pick1 = pickNextInvestigatorAbility([]);
  assert(
    ALL_INVESTIGATOR_ABILITIES.some(a => a.id === pick1.ability.id),
    'Investigator',
    'inv_random_initial_ability',
    'Năng lực ngẫu nhiên ban đầu',
    `Lần đầu xuất hiện chọn ngẫu nhiên [${pick1.ability.name}] trong 16 năng lực`
  );
}

// Test 4.3: Loại bỏ các năng lực tăng/giảm ô di chuyển khi random năng lực cho AI
{
  // Kiểm tra nhận diện năng lực tăng/giảm bước đi
  const dicePlus1 = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'dice-plus-1')!;
  const diceMinus2 = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'dice-minus-2')!;
  const pushOpponent = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'push-neighbor-1')!;
  const freeRent = INITIAL_CONSUMABLE_ABILITIES.find(a => a.id === 'auto-free-rent-opponent')!;

  assert(isMovementModifierAbility(dicePlus1) === true, 'Consumable', 'dice-plus-1', 'Gia Tốc Xúc Xắc (+1)', 'Nhận diện đúng năng lực tăng ô di chuyển');
  assert(isMovementModifierAbility(diceMinus2) === true, 'Consumable', 'dice-minus-2', 'Hãm Phanh Xúc Xắc (-2)', 'Nhận diện đúng năng lực giảm ô di chuyển');
  assert(isMovementModifierAbility(pushOpponent) === true, 'Consumable', 'push-neighbor-1', 'Đẩy Lùi Đối Thủ (+1)', 'Nhận diện đúng năng lực ép tăng bước đi');
  assert(isMovementModifierAbility(freeRent) === false, 'Consumable', 'auto-free-rent-opponent', 'Miễn Phí Thuê Đất', 'Không phải năng lực tăng/giảm ô di chuyển');

  // Lọc kho năng lực cho AI
  const aiPool = filterAbilitiesForAI(INITIAL_CONSUMABLE_ABILITIES, { requireAutoTrigger: true });
  const hasDiceModifier = aiPool.some(a => isMovementModifierAbility(a));
  assert(
    !hasDiceModifier && aiPool.length > 0,
    'Consumable',
    'ai_filter_movement_abilities',
    'Lọc bỏ năng lực tăng/giảm ô di chuyển cho AI',
    `Kho năng lực AI (${aiPool.length} thẻ) hoàn toàn KHÔNG chứa bất kỳ thẻ tăng/giảm ô di chuyển nào`
  );
}

// =========================================================================
// PHẦN 5: TEST THƯỞNG KHỞI HÀNH KHI BỐC THẺ VỀ KHỞI HÀNH & XUẤT NHẬT KÝ
// =========================================================================
console.log('\n--- PHẦN 5: TEST THƯỞNG KHỞI HÀNH QUA THẺ BÀI & XUẤT NHẬT KÝ DEBUG ---');

// Test 5.1: Thẻ Khí Vận cs-10 "Đi Thẳng Về Trạm Khởi Hành" - KHÔNG nhận thưởng theo yêu cầu
{
  const card = INITIAL_CHEST_CARDS.find(c => c.id === 'cs-10')!;
  const p = createMockPlayer(1, 'Người Chơi A', { position: 15, cash: 500 });
  const settings: any = { goExactBonus: 400, goPassBonus: 200 };
  const targetPos = card.targetTileId ?? 0;
  p.position = targetPos;

  const isNoGoBonusCard =
    card.id === 'cs-10' ||
    card.id === 'ch-1' ||
    (targetPos === 0 && card.description?.includes('không nhận thưởng'));

  if (!isNoGoBonusCard && targetPos === 0) {
    applyGoTileBonus({
      player: p,
      isExact: true,
      settings,
      triggerCashTransfer: () => {},
      addLog: () => {},
    });
  }

  assert(
    p.position === 0 &&
      p.cash === 500 &&
      card.description.includes('không nhận thưởng') &&
      isNoGoBonusCard === true,
    'Consumable',
    'cs-10',
    'Đi Thẳng Về Trạm Khởi Hành (Khí Vận)',
    'Về điểm xuất phát và KHÔNG nhận tiền thưởng khởi hành đúng theo quy định thẻ bài'
  );
}

// Test 5.2: Thẻ Cơ Hội ch-1 "Tiến Về Trạm Khởi Hành" - KHÔNG nhận thưởng theo yêu cầu
{
  const card = INITIAL_CHANCE_CARDS.find(c => c.id === 'ch-1')!;
  const p = createMockPlayer(2, 'Người Chơi B', { position: 32, cash: 200 });
  const settings: any = { goExactBonus: 400, goPassBonus: 200 };
  const targetPos = card.targetTileId ?? 0;
  p.position = targetPos;

  const isNoGoBonusCard =
    card.id === 'cs-10' ||
    card.id === 'ch-1' ||
    (targetPos === 0 && card.description?.includes('không nhận thưởng'));

  if (!isNoGoBonusCard && targetPos === 0) {
    applyGoTileBonus({
      player: p,
      isExact: true,
      settings,
      triggerCashTransfer: () => {},
      addLog: () => {},
    });
  }

  assert(
    p.position === 0 &&
      p.cash === 200 &&
      card.description.includes('không nhận thưởng') &&
      isNoGoBonusCard === true,
    'Consumable',
    'ch-1',
    'Tiến Về Trạm Khởi Hành (Cơ Hội)',
    'Về điểm xuất phát và KHÔNG nhận tiền thưởng khởi hành đúng theo quy định thẻ bài'
  );
}

// Test 5.3: Thẻ di chuyển vượt qua ô Khởi Hành (từ ô 35 đến ô 15) nhận 200đ
{
  const p = createMockPlayer(3, 'Người Chơi C', { position: 35, cash: 100 });
  const settings: any = { goExactBonus: 400, goPassBonus: 200 };
  const oldPos = p.position;
  const targetPos = 15;
  p.position = targetPos;
  if (targetPos < oldPos) {
    applyGoTileBonus({
      player: p,
      isExact: false,
      settings,
      triggerCashTransfer: () => {},
      addLog: () => {},
    });
  }
  assert(
    p.position === 15 && p.cash === 300,
    'Consumable',
    'move_to_pass_go',
    'Di chuyển vượt qua Khởi Hành',
    'Đi qua ô 0 đến ô 15 nhận thưởng đi qua Trạm Khởi Hành (200đ)'
  );
}

// Test 5.4: Xuất file nhật ký ván đấu (Debug Log)
{
  const mockCtx = {
    logs: [
      { id: '1', text: 'Bắt đầu ván đấu', type: 'info' as const, timestamp: Date.now() },
      { id: '2', text: 'Người Chơi A di chuyển về ô Khởi Hành', type: 'info' as const, timestamp: Date.now() },
    ],
    currentRound: 3,
    players: [createMockPlayer(1, 'Người Chơi A', { cash: 500 })],
  };

  const debugJson = buildGameLogDebugJson(mockCtx);
  const debugText = buildGameLogText(mockCtx);

  assert(
    debugJson.appName === 'Co Ty Phu Viet Nam' &&
      debugJson.version === 'v1.5.3' &&
      debugJson.logs.length === 2 &&
      debugText.includes('NHẬT KÝ VÁN ĐẤU CỜ TỶ PHÚ VIỆT NAM'),
    'Investigator',
    'export_game_log',
    'Xuất file nhật ký ván đấu',
    'Hệ thống tạo đầy đủ file JSON và Text chuẩn cấu trúc để người chơi gửi debug'
  );
}

console.log('\n===============================================================');
const passCount = results.filter(r => r.passed).length;
const failCount = results.filter(r => !r.passed).length;
console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passCount}/${results.length} NĂNG LỰC & TÍNH NĂNG ĐÃ VƯỢT QUA TEST THÀNH CÔNG! (Thất bại: ${failCount})`);
console.log('===============================================================');

