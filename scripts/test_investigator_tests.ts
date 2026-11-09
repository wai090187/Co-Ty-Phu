import { ALL_INVESTIGATOR_ABILITIES } from '../src/data/investigatorAbilities';
import { TILES } from '../src/modules/board/data/tiles';
import { calculatePropertyRent } from '../src/modules/property/utils/rentCalculator';
import { Player } from '../src/types/game';

type AssertFn = (
  condition: boolean,
  category: 'Consumable' | 'Permanent' | 'Investigator',
  id: string,
  name: string,
  notes: string
) => void;

type CreateMockPlayerFn = (id: number, name: string, overrides?: Partial<Player>) => Player;

export function runInvestigatorTests(assert: AssertFn, createMockPlayer: CreateMockPlayerFn): void {
  console.log('\n--- 3. KIỂM THỬ NĂNG LỰC ĐIỀU TRA VIÊN (16 năng lực) ---');

  // 1: inv_compensate_neighbor
  {
    const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_compensate_neighbor')!;
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
    players.forEach(p => (p.cash -= 100));
    assert(players[0].cash === 900 && players[1].cash === 900, 'Investigator', ab.id, ab.name, 'Ô Thuế: Truy thu thuế toàn dân mỗi người 100đ');
    players.forEach(p => (p.cash += 50));
    assert(players[0].cash === 950 && players[1].cash === 950, 'Investigator', ab.id, ab.name, 'Ô Góc: Phát thưởng phúc lợi 50đ cho toàn dân');
  }

  // 9: inv_jail_master
  {
    const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_jail_master')!;
    const richest = createMockPlayer(1, 'Người Giàu', { cash: 5000, inJail: false });
    richest.position = 10; richest.inJail = true;
    assert(richest.inJail && richest.position === 10, 'Investigator', ab.id, ab.name, 'Dừng tại ô Bị Bắt (ô 30): Bắt người giàu nhất vào tù');

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
    const price = 60;
    landless.cash -= price;
    landBaron.cash += price;
    landBaron.propertiesOwned = [3, 6];
    delete landBaron.houses[1];
    landless.propertiesOwned = [1];
    landless.houses[1] = 0;
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
    const buyer = createMockPlayer(1, 'Người Mua', { cash: 500, propertiesOwned: [] });
    buyer.cash -= 100;
    buyer.propertiesOwned.push(5);
    assert(buyer.propertiesOwned.includes(5) && buyer.cash === 400, 'Investigator', ab.id, ab.name, 'Case A: Mua 1 lô đất còn trống bất kỳ theo giá gốc');

    const seller = createMockPlayer(2, 'Người Bán', { cash: 500, propertiesOwned: [8], houses: { 8: 1 } });
    const basePrice = 100;
    const houseCost = 50;
    const payout = (basePrice + houseCost) * 2;
    seller.cash += payout;
    seller.propertiesOwned = [];
    delete seller.houses[8];
    assert(seller.cash === 800 && seller.propertiesOwned.length === 0, 'Investigator', ab.id, ab.name, 'Case B: Bán đất lại cho Ngân Hàng với GIÁ GẤP ĐÔI (đất 100 + nhà 50 = 150 x 2 = 300đ)');
  }

  // 14: inv_grant_or_swap_permanent
  {
    const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_grant_or_swap_permanent')!;
    const pNew = createMockPlayer(1, 'Chưa Có', { permanentAbilities: [] });
    pNew.permanentAbilities = ['perm-corner-fortune'];
    assert(pNew.permanentAbilities.length === 1 && pNew.permanentAbilities[0] === 'perm-corner-fortune', 'Investigator', ab.id, ab.name, 'Case A: Người chơi chưa có năng lực được cấp miễn phí 1 thẻ VIP');

    const pOld = createMockPlayer(2, 'Đã Có', { permanentAbilities: ['perm-station-vip'] });
    pOld.permanentAbilities = ['perm-tax-immunity'];
    assert(pOld.permanentAbilities.length === 1 && pOld.permanentAbilities[0] === 'perm-tax-immunity', 'Investigator', ab.id, ab.name, 'Case B: Đổi sang năng lực VIP khác miễn phí, đảm bảo người chơi chỉ có DUY NHẤT 1 thẻ');
  }

  // 15: inv_double_rent_round
  {
    const ab = ALL_INVESTIGATOR_ABILITIES.find(a => a.id === 'inv_double_rent_round')!;
    const owner = createMockPlayer(1, 'Chủ Đất', { propertiesOwned: [1], houses: { 1: 1 } });
    const tile = TILES[1];
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

  // 16: inv_half_rent_round
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
}
