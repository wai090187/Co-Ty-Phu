/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PermanentAbility } from '../types/game';

export const INITIAL_PERMANENT_ABILITIES: PermanentAbility[] = [
  {
    id: 'perm-neighbor-toll',
    name: 'Thu Phí Lân Cận (Vĩnh Viễn)',
    description:
      'Sau mỗi lượt di chuyển, nếu đứng cùng ô hoặc ô cạnh bên người khác sẽ tự động thu của họ 50đ.',
    cost: 250,
    icon: 'coins',
    triggerCondition: 'when_neighbor',
    effectType: 'steal_neighbor_cash',
    effectValue: 50,
    value: 50,
    quantity: 1,
  },
  {
    id: 'perm-tax-immunity',
    name: 'Đặc Quyền Miễn Thuế (Vĩnh Viễn)',
    description: 'Vĩnh viễn không bao giờ phải nộp Thuế Lợi Tức và Thuế Lương Bổng.',
    cost: 300,
    icon: 'award',
    triggerCondition: 'when_pay_tax',
    effectType: 'permanent_free_tax',
    effectValue: 100,
    quantity: 1,
  },
  {
    id: 'perm-corner-fortune',
    name: 'Đại Gia Tứ Góc (Vĩnh Viễn)',
    description:
      'Mỗi khi đứng tại bất kỳ ô nào trong 4 ô góc (Khởi Hành, Thăm Tù, Sân Bay, Vào Tù) đều nhận thêm 100đ.',
    cost: 280,
    icon: 'compass',
    triggerCondition: 'when_land_corner',
    effectType: 'corner_bonus',
    effectValue: 100,
    value: 100,
    quantity: 1,
  },
  {
    id: 'perm-station-vip',
    name: 'Thẻ VIP Bến Xe (Vĩnh Viễn)',
    description: 'Giảm giá 50% cho tất cả các năng lực dùng 1 lần mua tại mọi Bến Xe.',
    cost: 220,
    icon: 'tag',
    triggerCondition: 'when_visit_station',
    effectType: 'station_discount',
    effectValue: 50,
    value: 50,
    quantity: 1,
  },
];
