/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TriggerCondition, AbilityTargetScope } from '../../../types/game';

export const getAvailableTargets = (
  trig: TriggerCondition
): { value: AbilityTargetScope; label: string }[] => {
  switch (trig) {
    case 'when_opponent_property':
      return [
        { value: 'self', label: '🛡️ Đến bản thân (miễn trả tiền, nhận thưởng...)' },
        { value: 'target_opponent', label: '⚔️ Đến đối thủ (chủ ô đất đối thủ)' },
        { value: 'target_bank', label: '🏛️ Đến ngân hàng' },
      ];
    case 'when_same_tile':
      return [
        { value: 'target_opponent', label: '🌀 Đến đối thủ (người đang đứng cùng ô)' },
        { value: 'self', label: '🛡️ Đến bản thân' },
        { value: 'target_all_players', label: '👥 Tất cả người chơi' },
      ];
    case 'when_own_property':
      return [{ value: 'self', label: '🔨 Đến bản thân (nâng cấp nhà miễn phí...)' }];
    case 'when_visit_station':
      return [
        { value: 'target_richest', label: '💰 Người chơi giàu nhất bàn cờ' },
        { value: 'self', label: '🛡️ Đến bản thân' },
        { value: 'target_all_players', label: '👥 Tất cả người chơi' },
        { value: 'target_bank', label: '🏛️ Đến ngân hàng' },
      ];
    case 'when_neighbor':
      return [
        { value: 'target_opponent', label: '🚶 Đến đối thủ lân cận (cùng ô hoặc cạnh bên)' },
        { value: 'self', label: '🛡️ Đến bản thân' },
      ];
    case 'instant_on_buy':
      return [
        { value: 'self', label: '🛡️ Đến bản thân (trợ cấp, miễn thuế...)' },
        { value: 'target_adjacent_turns', label: '👥 Người có lượt trước & sau bạn' },
        { value: 'target_richest', label: '💰 Người chơi giàu nhất' },
        { value: 'target_poorest', label: '🤝 Người chơi nghèo nhất' },
        { value: 'target_opponent', label: '⚔️ Đến đối thủ tương tác' },
        { value: 'target_all_players', label: '🌐 Tất cả người chơi' },
        { value: 'target_choose_1', label: '🎯 Lựa chọn 1 người chơi' },
      ];
    case 'manual_anytime':
      return [
        { value: 'self', label: '🛡️ Đến bản thân' },
        { value: 'target_choose_1', label: '🎯 Lựa chọn 1 người chơi' },
        { value: 'target_richest', label: '💰 Người chơi giàu nhất' },
        { value: 'target_poorest', label: '🤝 Người chơi nghèo nhất' },
        { value: 'target_all_players', label: '🌐 Tất cả người chơi' },
        { value: 'target_adjacent_turns', label: '👥 Người có lượt trước & sau' },
      ];
    case 'when_pay_tax':
      return [
        { value: 'self', label: '🛡️ Đến bản thân (miễn thuế)' },
        { value: 'target_bank', label: '🏛️ Đến ngân hàng' },
      ];
    case 'when_pay_rent':
      return [
        { value: 'self', label: '🛡️ Đến bản thân (giảm giá)' },
        { value: 'target_opponent', label: '⚔️ Đến đối thủ (chủ đất)' },
      ];
    case 'when_roll_dice':
    case 'when_land_corner':
    default:
      return [{ value: 'self', label: '🛡️ Đến bản thân' }];
  }
};

export const getAvailableEffects = (
  trig: TriggerCondition,
  target: AbilityTargetScope
): { value: string; label: string; unit?: string }[] => {
  if (trig === 'when_opponent_property') {
    if (target === 'self') {
      return [
        { value: 'free_rent', label: '🛡️ Miễn 100% tiền thuê đất (không cần số)' },
        { value: 'half_rent', label: '🏷️ Giảm 50% tiền thuê đất (không cần số)' },
        { value: 'gain_cash_amount', label: '💰 Hoàn lại tiền mặt', unit: 'đ' },
      ];
    }
    return [
      { value: 'pay_cash_amount', label: '💸 Bắt đối thủ bồi thường', unit: 'đ' },
      { value: 'destroy_house', label: '💣 Đánh sập 1 cấp nhà của đối thủ (không cần số)' },
    ];
  }

  if (trig === 'when_same_tile') {
    if (target === 'target_opponent') {
      return [
        { value: 'send_to_go', label: '🌀 Trục xuất đối thủ về Trạm Khởi Hành (ô số 0) (không cần số)' },
        { value: 'send_to_jail_neighbor', label: '🚨 Tống đối thủ cùng ô vào tù (không cần số)' },
        { value: 'push_neighbor', label: '💨 Bắt đối thủ tiến thêm bước', unit: 'bước' },
        { value: 'steal_neighbor_cash', label: '💰 Thu tiền từ đối thủ cùng ô', unit: 'đ' },
      ];
    }
    return [{ value: 'gain_cash_amount', label: '💰 Nhận tiền mặt', unit: 'đ' }];
  }

  if (trig === 'when_own_property') {
    return [
      { value: 'free_upgrade_own_house', label: '🔨 Tự động nâng cấp nhà miễn phí (không tốn tiền) (không cần số)' },
      { value: 'gain_cash_amount', label: '💰 Nhận tiền thưởng khai thác đất', unit: 'đ' },
    ];
  }

  if (trig === 'when_visit_station') {
    if (target === 'target_richest') {
      return [
        { value: 'steal_cash_from_target', label: '✈️ Người giàu nhất phải trả tiền đi du lịch cho bạn', unit: 'đ' },
      ];
    }
    return [
      { value: 'gain_cash_amount', label: '💰 Nhận tiền hỗ trợ vé bến xe', unit: 'đ' },
      { value: 'station_discount', label: '🏷️ Giảm giá mua kỹ năng tại bến xe (%)', unit: '%' },
    ];
  }

  if (trig === 'instant_on_buy') {
    if (target === 'target_richest') {
      return [
        { value: 'destroy_richest_highest_house', label: '💣 Phá sập 1 căn nhà cấp cao nhất của người giàu nhất (không cần số)' },
        { value: 'steal_cash_from_target', label: '💰 Thu tiền từ người giàu nhất', unit: 'đ' },
      ];
    }
    if (target === 'target_adjacent_turns') {
      return [
        { value: 'send_adjacent_to_jail', label: '🚨 Bắt người có lượt trước & sau vào tù (không cần số)' },
        { value: 'steal_from_adjacent', label: '💰 Mỗi người lượt trước & sau nộp tiền cho bạn', unit: 'đ' },
      ];
    }
    if (target === 'self') {
      return [
        { value: 'poorest_relief_bonus', label: '🤝 Nếu bạn là người nghèo nhất: cộng tiền trợ cấp', unit: 'đ' },
        { value: 'free_tax_next_turn', label: '📜 Ngân hàng không thu thuế 1 lượt tiếp theo (không cần số)' },
        { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt ngay lập tức', unit: 'đ' },
      ];
    }
    return [
      { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt', unit: 'đ' },
      { value: 'destroy_house', label: '💣 Phá sập nhà đối thủ (không cần số)' },
    ];
  }

  if (trig === 'when_neighbor') {
    return [
      { value: 'send_to_jail_neighbor', label: '🚨 Tống đối thủ lân cận vào tù (không cần số)' },
      { value: 'push_neighbor', label: '💨 Đẩy đối thủ lân cận tiến thêm bước', unit: 'bước' },
      { value: 'steal_neighbor_cash', label: '💰 Thu tiền người chơi lân cận', unit: 'đ' },
    ];
  }

  if (trig === 'when_pay_tax') {
    return [
      { value: 'free_tax', label: '🛡️ Miễn thuế nhà nước (không cần số)' },
      { value: 'permanent_free_tax', label: '👑 Vĩnh viễn miễn thuế nhà nước (không cần số)' },
    ];
  }

  if (trig === 'when_pay_rent') {
    return [
      { value: 'free_rent', label: '🛡️ Miễn 100% tiền thuê đất (không cần số)' },
      { value: 'half_rent', label: '🏷️ Giảm 50% tiền thuê đất (không cần số)' },
    ];
  }

  if (trig === 'when_roll_dice') {
    return [
      { value: 'dice_boost', label: '🚀 Tăng bước xúc xắc (+)', unit: 'bước' },
      { value: 'dice_reduce', label: '🛑 Giảm bước xúc xắc (-)', unit: 'bước' },
    ];
  }

  if (trig === 'when_land_corner') {
    return [{ value: 'corner_bonus', label: '👑 Thưởng tiền mặt dừng tại 4 ô góc', unit: 'đ' }];
  }

  // manual_anytime
  return [
    { value: 'direct_jail_target', label: '🚨 Trát bắt: Tống 1 người chơi vào tù (không cần số)' },
    { value: 'instant_upgrade_house', label: '📜 Giấy phép nâng cấp nhà từ xa (không cần số)' },
    { value: 'destroy_house', label: '💣 Lệnh phá sập 1 cấp nhà đối thủ tiếp theo (không cần số)' },
    { value: 'draw_both_cards', label: '✨ Rút cùng lúc cả Cơ Hội & Khí Vận (không cần số)' },
    { value: 'dice_boost', label: '🚀 Tăng bước xúc xắc (+)', unit: 'bước' },
    { value: 'dice_reduce', label: '🛑 Giảm bước xúc xắc (-)', unit: 'bước' },
    { value: 'gain_cash_amount', label: '💰 Nhận tiền mặt từ ngân hàng', unit: 'đ' },
    { value: 'pay_cash_amount', label: '💸 Trừ tiền mặt', unit: 'đ' },
  ];
};

export const NO_NUMBER_EFFECTS = [
  'free_rent',
  'free_tax',
  'free_tax_next_turn',
  'permanent_free_tax',
  'half_rent',
  'free_upgrade_own_house',
  'instant_upgrade_house',
  'send_to_go',
  'send_to_jail_neighbor',
  'direct_jail_target',
  'send_adjacent_to_jail',
  'destroy_house',
  'destroy_richest_highest_house',
  'draw_both_cards',
];
