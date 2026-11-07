/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvestigatorAbility {
  id: string;
  name: string;
  description: string;
  icon: string;
  shortDesc: string;
}

export const ALL_INVESTIGATOR_ABILITIES: InvestigatorAbility[] = [
  {
    id: 'inv_compensate_neighbor',
    name: 'Bồi Thường Oan Sai (+100đ)',
    icon: 'gift',
    shortDesc: 'Tặng 100đ cho người chơi cùng ô hoặc cạnh 1 ô',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô hoặc bên cạnh người chơi khác (khoảng cách 1 ô), Điều Tra Viên sẽ bồi thường tặng họ 100đ vì kết tội sai quy trình.',
  },
  {
    id: 'inv_extort_bribe',
    name: 'Thu Tiền Hối Lộ (-100đ)',
    icon: 'briefcase',
    shortDesc: 'Thu 100đ hối lộ từ người chơi cùng ô hoặc cạnh 1 ô',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô hoặc bên cạnh người chơi khác (khoảng cách 1 ô), Điều Tra Viên sẽ thu của mỗi người chơi đó 100đ tiền hối lộ để bỏ qua vi phạm.',
  },
  {
    id: 'inv_jail_same_tile',
    name: 'Bắt Giữ Khẩn Cấp (Tống Vào Tù)',
    icon: 'shield-alert',
    shortDesc: 'Tống giam người chơi đứng cùng ô vào tù',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô với bất kỳ người chơi nào, Điều Tra Viên lập tức phát lệnh bắt giữ và tống họ vào tù.',
  },
  {
    id: 'inv_robin_hood',
    name: 'Lấy Của Giàu Chia Cho Nghèo',
    icon: 'scale',
    shortDesc: 'Thu 200đ từ người giàu nhất chia lại cho người nghèo nhất',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô với người chơi giàu nhất hoặc nghèo nhất, Điều Tra Viên sẽ tịch thu 200đ từ người giàu nhất và chia lại cho người chơi nghèo nhất.',
  },
  {
    id: 'inv_demolish_houses',
    name: 'Cưỡng Chế Phá Dỡ Sai Phạm (>2 Căn)',
    icon: 'hammer',
    shortDesc: 'Phá sập 1 cấp nhà trên ô đất có > 2 căn',
    description:
      'Sau khi di chuyển, nếu đứng vào ô đất đang có nhiều hơn 2 căn nhà (>2 căn), Điều Tra Viên sẽ cưỡng chế phá sập 1 cấp nhà do vi phạm trật tự xây dựng.',
  },
  {
    id: 'inv_audit_reward',
    name: 'Thanh Tra Khen Thưởng (+50đ)',
    icon: 'award',
    shortDesc: 'Chủ sở hữu ô đất dừng chân nhận được 50đ',
    description:
      'Sau khi di chuyển, nếu đứng vào ô đất của người nào thì chủ sở hữu ô đất đó sẽ được nhận 50đ tiền khen thưởng quy hoạch chuẩn mực.',
  },
  {
    id: 'inv_audit_fine',
    name: 'Thanh Tra Xử Phạt (-50đ)',
    icon: 'file-warning',
    shortDesc: 'Chủ sở hữu ô đất dừng chân bị phạt trừ 50đ',
    description:
      'Sau khi di chuyển, nếu đứng vào ô đất của người nào thì chủ sở hữu ô đất đó bị xử phạt 50đ vì để xảy ra sai phạm trật tự đô thị.',
  },
  {
    id: 'inv_tax_or_corner',
    name: 'Thu Thuế Toàn Dân & Phúc Lợi Tứ Góc',
    icon: 'landmark',
    shortDesc: 'Ô thuế: Thu thuế tất cả; 4 ô góc: Cho mỗi người 50đ',
    description:
      'Sau khi di chuyển, nếu đứng vào ô Thuế thì sẽ truy thu thuế tất cả người chơi; nếu đứng vào 4 ô góc bàn cờ thì sẽ phát thưởng 50đ cho tất cả người chơi.',
  },
  {
    id: 'inv_jail_master',
    name: 'Đại Án Tư Pháp (Bắt Người Giàu / Thả Tù Nhân)',
    icon: 'unlock',
    shortDesc: 'Ô Bị Bắt: Bắt người giàu nhất; Ô Thăm Tù: Thả tự do tất cả tù nhân',
    description:
      'Sau khi di chuyển, nếu vào ô Bị Bắt (ô 30) thì người giàu nhất bị bắt vào tù; nếu vào ô Thăm Tù (ô 10) thì tất cả người đang trong tù được phóng thích tự do.',
  },
  {
    id: 'inv_draw_cards_all',
    name: 'Biến Cố Khí Vận Toàn Dân',
    icon: 'sparkles',
    shortDesc: 'Ô Cơ Hội / Khí Vận: Tất cả người chơi lần lượt bốc 1 lá',
    description:
      'Sau khi di chuyển, nếu trúng ô Cơ Hội hoặc Khí Vận thì lần lượt tất cả người chơi trên bàn cờ đều phải bốc 1 lá bài Cơ Hội / Khí Vận tương ứng.',
  },
  {
    id: 'inv_allow_house_upgrade',
    name: 'Cấp Phép Quy Hoạch: Nâng Cấp Nhà Tự Do',
    icon: 'home',
    shortDesc: 'Đứng cùng ô người chơi: Cho phép nâng cấp 1 nhà bất kỳ (trả tiền đủ)',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô với người chơi, Điều Tra Viên cấp giấy phép đặc biệt cho phép họ nâng cấp 1 căn nhà bất kỳ trên các lô đất sở hữu (người chơi vẫn phải trả tiền xây theo giá gốc).',
  },
  {
    id: 'inv_redistribute_land_poorest',
    name: 'Tái Điều Tiết Đất Đai (Chống Độc Quyền)',
    icon: 'scale',
    shortDesc: 'Đứng cùng ô người nhiều/ít đất: Cho người ít đất mua lô đất rẻ nhất của người nhiều đất',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô với người chơi có nhiều đất nhất hoặc ít đất nhất, cho phép người chơi ít đất mua lại lô đất có giá gốc thấp nhất của người nhiều đất (sau khi mua thì toàn bộ nhà bị phá dỡ về đất trống).',
  },
  {
    id: 'inv_buy_vacant_or_double_sell',
    name: 'Đặc Quyền Giao Dịch: Mua Đất Trống Hoặc Bán Giá Gấp Đôi',
    icon: 'trending-up',
    shortDesc: 'Đứng cùng ô người chơi: Cho phép mua đất trống bất kỳ hoặc bán đất giá x2',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô với người chơi, cho phép họ được mua 1 lô đất còn trống bất kỳ trên bàn cờ (trả đủ tiền) hoặc bán lại 1 lô đất đang sở hữu cho ngân hàng với giá gấp đôi (tổng tiền đất + nhà x2).',
  },
  {
    id: 'inv_grant_or_swap_permanent',
    name: 'Đặc Xá & Trao Quyền VIP (Năng Lực Vĩnh Viễn)',
    icon: 'crown',
    shortDesc: 'Đứng cùng ô/cạnh 1 ô: Miễn phí nhận 1 năng lực VIP hoặc đổi sang cái khác',
    description:
      'Sau khi di chuyển, nếu đứng cùng ô hoặc bên cạnh người chơi khác (khoảng cách 1 ô), người chơi được phép nhận miễn phí 1 năng lực vĩnh viễn (nếu chưa có) hoặc đổi sang 1 năng lực vĩnh viễn khác (nếu đã có). Mỗi người chơi tối đa chỉ được sở hữu 1 năng lực vĩnh viễn.',
  },
  {
    id: 'inv_double_rent_round',
    name: 'Thị Trường Sôi Động (Giá Thuê Đất x2)',
    icon: 'trending-up',
    shortDesc: 'Vòng này toàn bộ đất trên bàn cờ tăng gấp đôi tiền thuê (x2)',
    description:
      'Trong suốt vòng chơi này (cho đến khi Điều Tra Viên tuần tra vòng tiếp theo), tất cả các ô đất trên toàn bàn cờ sẽ tăng gấp đôi tiền thuê đất (x2 giá thuê)!',
  },
  {
    id: 'inv_half_rent_round',
    name: 'Trợ Giá Khủng Hoảng (Giá Thuê Đất ½)',
    icon: 'trending-down',
    shortDesc: 'Vòng này toàn bộ đất trên bàn cờ giảm 50% tiền thuê (còn ½)',
    description:
      'Trong suốt vòng chơi này (cho đến khi Điều Tra Viên tuần tra vòng tiếp theo), tất cả các ô đất trên toàn bàn cờ sẽ được giảm 50% tiền thuê đất (giảm còn ½ giá thuê)!',
  },
];

/**
 * Bốc ngẫu nhiên 1 năng lực từ kho không hoàn lại (draw without replacement).
 * Khi đã dùng hết thì tự động reset lại pool.
 */
export const pickNextInvestigatorAbility = (
  usedIds: string[]
): { ability: InvestigatorAbility; nextUsedIds: string[] } => {
  let pool = ALL_INVESTIGATOR_ABILITIES.filter(a => !usedIds.includes(a.id));
  let currentUsed = [...usedIds];

  if (pool.length === 0) {
    // Reset pool
    pool = [...ALL_INVESTIGATOR_ABILITIES];
    currentUsed = [];
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return {
    ability: selected,
    nextUsedIds: [...currentUsed, selected.id],
  };
};
