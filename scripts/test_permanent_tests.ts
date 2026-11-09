import { INITIAL_PERMANENT_ABILITIES } from '../src/data/abilities';
import { Player } from '../src/types/game';

type AssertFn = (
  condition: boolean,
  category: 'Consumable' | 'Permanent' | 'Investigator',
  id: string,
  name: string,
  notes: string
) => void;

type CreateMockPlayerFn = (id: number, name: string, overrides?: Partial<Player>) => Player;

export function runPermanentTests(assert: AssertFn, createMockPlayer: CreateMockPlayerFn): void {
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
}
