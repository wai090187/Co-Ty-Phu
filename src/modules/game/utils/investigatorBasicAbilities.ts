/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestigatorAbilityExecutionContext } from './investigatorAbilityTypes';

export function handleInvestigatorBasicAbilities(
  ctx: InvestigatorAbilityExecutionContext
): boolean {
  const {
    activeAbility,
    invPos,
    landedTile,
    nextPlayers,
    activeSurvivors,
    triggerCashTransfer,
    addLog,
    sounds,
  } = ctx;

  switch (activeAbility.id) {
    // 1. Bồi thường oan sai (+100đ)
    case 'inv_compensate_neighbor': {
      const targetPlayers = activeSurvivors.filter(
        p =>
          p.position === invPos ||
          (p.position + 1) % 40 === invPos ||
          (p.position - 1 + 40) % 40 === invPos
      );
      if (targetPlayers.length === 0) {
        addLog(
          `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để nhận bồi thường oan sai.`,
          'info'
        );
      } else {
        targetPlayers.forEach(tp => {
          tp.cash += 100;
          triggerCashTransfer(0, [tp.id], 100, 'Bồi thường oan sai (+100đ)');
          addLog(
            `🎁 [Bồi Thường Oan Sai] Điều Tra Viên bồi thường tặng ${tp.name} 100đ vì kết tội sai quy trình!`,
            'money'
          );
        });
        sounds.cash();
      }
      return true;
    }

    // 2. Thu tiền hối lộ (-100đ)
    case 'inv_extort_bribe': {
      const targetPlayers = activeSurvivors.filter(
        p =>
          p.position === invPos ||
          (p.position + 1) % 40 === invPos ||
          (p.position - 1 + 40) % 40 === invPos
      );
      if (targetPlayers.length === 0) {
        addLog(
          `🕵️‍♂️ Không có người chơi nào đứng cùng ô hoặc lân cận để thu tiền hối lộ.`,
          'info'
        );
      } else {
        targetPlayers.forEach(tp => {
          const bribe = Math.min(tp.cash, 100);
          tp.cash -= bribe;
          triggerCashTransfer(tp.id, [], bribe, 'Thu tiền hối lộ (-100đ)');
          addLog(
            `💼 [Thu Tiền Hối Lộ] Điều Tra Viên thu của ${tp.name} ${bribe}đ tiền hối lộ để bỏ qua vi phạm!`,
            'money'
          );
        });
        sounds.cash();
      }
      return true;
    }

    // 3. Bắt giữ khẩn cấp (vào tù)
    case 'inv_jail_same_tile': {
      const playersOnTile = activeSurvivors.filter(p => p.position === invPos && !p.inJail);
      if (playersOnTile.length === 0) {
        addLog(
          `🕵️‍♂️ Không có người chơi nào đứng cùng ô với Điều Tra Viên để bắt giữ.`,
          'info'
        );
      } else {
        playersOnTile.forEach(p => {
          p.position = 10;
          p.inJail = true;
          p.jailTurns = 0;
          addLog(
            `🚨 [Bắt Giữ Khẩn Cấp] Điều Tra Viên bắt quả tang ${p.name} tại ô [${landedTile.name}], áp giải tống giam vào tù ngay lập tức!`,
            'jail'
          );
        });
        sounds.jail();
      }
      return true;
    }

    // 4. Lấy của giàu chia cho nghèo (200đ)
    case 'inv_robin_hood': {
      const sortedRichest = [...activeSurvivors].sort((a, b) => b.cash - a.cash);
      const richest = sortedRichest[0];
      const poorest = [...activeSurvivors].sort((a, b) => a.cash - b.cash)[0];

      if (
        richest &&
        poorest &&
        richest.id !== poorest.id &&
        (invPos === richest.position || invPos === poorest.position)
      ) {
        const transferAmt = Math.min(richest.cash, 200);
        richest.cash -= transferAmt;
        poorest.cash += transferAmt;
        triggerCashTransfer(
          richest.id,
          [poorest.id],
          transferAmt,
          'Lấy của giàu chia cho người nghèo (200đ)'
        );
        addLog(
          `⚖️ [Lấy Của Giàu Chia Cho Nghèo] Điều Tra Viên đứng cùng ô với ${
            invPos === richest.position ? richest.name : poorest.name
          }, thu 200đ từ người giàu nhất (${richest.name}) chia lại cho người nghèo nhất (${poorest.name})!`,
          'money'
        );
        sounds.cash();
      } else {
        addLog(
          `🕵️‍♂️ Điều Tra Viên không đứng cùng ô với người giàu nhất (${richest?.name}) hay người nghèo nhất (${poorest?.name}).`,
          'info'
        );
      }
      return true;
    }

    // 5. Cưỡng chế phá dỡ sai phạm (>2 căn)
    case 'inv_demolish_houses': {
      if (landedTile.type === 'property') {
        const owner = nextPlayers.find(p => p.propertiesOwned.includes(landedTile.id));
        const houses = owner?.houses[landedTile.id] || 0;
        if (owner && houses > 2) {
          owner.houses[landedTile.id] = houses - 1;
          sounds.buildHouse();
          addLog(
            `🔨 [Cưỡng Chế Phá Dỡ] Điều Tra Viên phát hiện ô đất [${landedTile.name}] của ${owner.name} xây dựng vượt phép (${houses} căn), tiến hành cưỡng chế phá sập 1 cấp nhà (còn ${houses - 1} căn)!`,
            'property'
          );
        } else {
          addLog(
            `🕵️‍♂️ Ô đất [${landedTile.name}] có ${houses} căn nhà (không lớn hơn 2 căn), không bị cưỡng chế phá dỡ.`,
            'info'
          );
        }
      } else {
        addLog(`🕵️‍♂️ Ô [${landedTile.name}] không phải là ô đất bất động sản.`, 'info');
      }
      return true;
    }

    // 6. Thanh tra khen thưởng (+50đ)
    case 'inv_audit_reward': {
      if (landedTile.type === 'property') {
        const owner = nextPlayers.find(p => p.propertiesOwned.includes(landedTile.id));
        if (owner) {
          owner.cash += 50;
          triggerCashTransfer(0, [owner.id], 50, 'Thanh tra khen thưởng (+50đ)');
          addLog(
            `⭐ [Thanh Tra Khen Thưởng] Điều Tra Viên kiểm toán ô [${landedTile.name}], khen thưởng chủ sở hữu ${owner.name} +50đ!`,
            'money'
          );
          sounds.cash();
        } else {
          addLog(
            `🕵️‍♂️ Ô đất [${landedTile.name}] chưa có chủ sở hữu, không ai nhận thưởng.`,
            'info'
          );
        }
      } else {
        addLog(`🕵️‍♂️ Ô [${landedTile.name}] không phải ô đất bất động sản.`, 'info');
      }
      return true;
    }

    // 7. Thanh tra xử phạt (-50đ)
    case 'inv_audit_fine': {
      if (landedTile.type === 'property') {
        const owner = nextPlayers.find(p => p.propertiesOwned.includes(landedTile.id));
        if (owner) {
          const fine = Math.min(owner.cash, 50);
          owner.cash -= fine;
          triggerCashTransfer(owner.id, [], fine, 'Thanh tra xử phạt (-50đ)');
          addLog(
            `📋 [Thanh Tra Xử Phạt] Điều Tra Viên phát hiện vi phạm trật tự tại [${landedTile.name}], xử phạt chủ đất ${owner.name} -${fine}đ!`,
            'money'
          );
          sounds.cash();
        } else {
          addLog(`🕵️‍♂️ Ô đất [${landedTile.name}] chưa có chủ sở hữu, không xử phạt ai.`, 'info');
        }
      } else {
        addLog(`🕵️‍♂️ Ô [${landedTile.name}] không phải ô đất bất động sản.`, 'info');
      }
      return true;
    }

    // 8. Thu thuế toàn dân & Phúc lợi tứ góc
    case 'inv_tax_or_corner': {
      if (landedTile.type === 'tax') {
        const taxAmt = landedTile.taxAmount || 100;
        activeSurvivors.forEach(p => {
          const actual = Math.min(p.cash, taxAmt);
          p.cash -= actual;
          triggerCashTransfer(p.id, [], actual, 'Truy thu thuế toàn dân');
        });
        addLog(
          `🏛️ [Truy Thu Thuế Toàn Dân] Điều Tra Viên dừng tại ô [${landedTile.name}], truy thu thuế ${taxAmt}đ từ tất cả người chơi!`,
          'money'
        );
        sounds.cash();
      } else if ([0, 10, 20, 30].includes(landedTile.id)) {
        activeSurvivors.forEach(p => {
          p.cash += 50;
          triggerCashTransfer(0, [p.id], 50, 'Phúc lợi tứ góc (+50đ)');
        });
        addLog(
          `🎉 [Phúc Lợi Tứ Góc] Điều Tra Viên dừng tại ô góc [${landedTile.name}], phát trợ cấp 50đ cho tất cả người chơi!`,
          'money'
        );
        sounds.cash();
      } else {
        addLog(
          `🕵️‍♂️ Ô [${landedTile.name}] không phải ô Thuế hay ô Góc, không thu thuế/phát trợ cấp.`,
          'info'
        );
      }
      return true;
    }

    default:
      return false;
  }
}
