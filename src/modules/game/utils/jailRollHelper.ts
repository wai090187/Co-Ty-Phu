/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { getBaseBailFee } from '../../property/utils/rentCalculator';

interface JailRollParams {
  player: Player;
  isDouble: boolean;
  d1: number;
  d2: number;
  total: number;
  settings: any;
  currentRound: number;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  handleBankrupt: (p: Player) => void;
  movePlayerSteps: (playerId: number, steps: number) => void;
}

export function handleJailRollResolution({
  player,
  isDouble,
  d1,
  d2,
  total,
  settings,
  currentRound,
  addLog,
  triggerCashTransfer,
  handleBankrupt,
  movePlayerSteps,
}: JailRollParams): void {
  const isInvestigation = settings.jailMode === 'investigation';

  // 1. Thẻ ra tù miễn phí
  if ((player.getOutOfJailCards || 0) > 0) {
    player.getOutOfJailCards = (player.getOutOfJailCards || 0) - 1;
    player.inJail = false;
    player.jailTurns = 0;
    sounds.ability();
    const remainingCards = player.getOutOfJailCards;
    addLog(
      isInvestigation
        ? `🕊️ [Dùng Thẻ Ra Tù] ${player.name} đã sử dụng Thẻ Ra Tù Miễn Phí để thoát khỏi diện điều tra thành công! (Không mất tiền, còn lại: ${remainingCards} thẻ)`
        : `🕊️ [Dùng Thẻ Ra Tù] ${player.name} đã sử dụng Thẻ Ra Tù Miễn Phí để ra tù thành công! (Không mất tiền, còn lại: ${remainingCards} thẻ)`,
      'jail'
    );
    movePlayerSteps(player.id, total);
    return;
  }

  // 2. Tung ra số đôi
  if (isDouble) {
    sounds.ability();
    player.inJail = false;
    player.jailTurns = 0;
    addLog(
      isInvestigation
        ? `✨ [Ra Tù Thành Công] ${player.name} tung được số đôi [${d1}][${d2}] - Thoát khỏi diện điều tra thành công miễn phí (không mất tiền)!`
        : `✨ [Ra Tù Thành Công] ${player.name} tung được số đôi [${d1}][${d2}] - Ra tù thành công miễn phí (không mất tiền)!`,
      'jail'
    );
    movePlayerSteps(player.id, total);
    return;
  }

  // 3. Không tung được đôi -> thất bại
  player.jailTurns += 1;

  // Sau 3 lượt tung xúc xắc thất bại:
  if (player.jailTurns >= 3) {
    if (isInvestigation) {
      player.inJail = false;
      player.jailTurns = 0;
      sounds.ability();
      addLog(
        `🏛️ [Thả Tự Do Thành Công] ${player.name} sau 3 lượt tung xúc xắc thất bại đã chấp hành đủ thời gian điều tra và chính thức được cơ quan điều tra thả tự do! (Không mất tiền)`,
        'jail'
      );
      movePlayerSteps(player.id, total);
      return;
    } else {
      const baseFee = getBaseBailFee(currentRound, settings);
      if (player.cash >= baseFee) {
        player.cash -= baseFee;
        player.inJail = false;
        player.jailTurns = 0;
        sounds.cash();
        triggerCashTransfer(player.id, [], baseFee, 'Phí bảo lãnh ra tù sau 3 lượt');
        addLog(
          `🏛️ [Bảo Lãnh Ra Tù Thành Công] ${player.name} sau 3 lượt ở tù đã chi trả ${baseFee}đ tiền bảo lãnh để ra tù thành công!`,
          'jail'
        );
        movePlayerSteps(player.id, total);
        return;
      } else {
        addLog(
          `❌ [Ra Tù Thất Bại] ${player.name} sau 3 lượt ở tù không đủ ${baseFee}đ nộp tiền bảo lãnh và bị tuyên bố phá sản!`,
          'jail'
        );
        handleBankrupt(player);
        return;
      }
    }
  }

  // Lượt 1 hoặc 2 thất bại:
  if (isInvestigation) {
    addLog(
      `🚨 [Đang Bị Điều Tra] ${player.name} tung [${d1}][${d2}] (không phải số đôi) - Vẫn được di chuyển ${total} bước nhưng tiếp tục chịu hình phạt điều tra (giảm 50% thu nhập, tăng 50% chi phí)! (Lượt điều tra: ${player.jailTurns}/3)`,
      'jail'
    );
    movePlayerSteps(player.id, total);
  } else {
    addLog(
      `🔒 [Ra Tù Thất Bại] ${player.name} tung [${d1}][${d2}] (không phải số đôi) - Ra tù thất bại! (Lượt ở tù: ${player.jailTurns}/3)`,
      'jail'
    );
  }
}
