/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, ConsumableAbility } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';

export interface NeighborTollContext {
  player: Player;
  prevPlayers: Player[];
  consumableShop: ConsumableAbility[];
  settings: any;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  tile?: any;
  handleBankrupt?: (bankruptPlayer: Player, creditor?: Player) => void;
}



export function handleSameTileAndNeighborToll(ctx: NeighborTollContext, landedTileId: number) {
  const { player, prevPlayers, consumableShop, settings, addLog, triggerCashTransfer } = ctx;

  // Check "when_same_tile" ability (e.g. bắt đối thủ cùng ô quay về khởi hành)
  const sameTileOpponent = prevPlayers.find(
    p => p.id !== player.id && !p.bankrupt && p.position === landedTileId
  );
  if (sameTileOpponent) {
    const sameTileAbilityId = player.consumableAbilities.find(abId => {
      const ab = consumableShop.find(x => x.id === abId);
      return ab?.triggerCondition === 'when_same_tile' || ab?.effectType === 'send_to_go';
    });
    if (sameTileAbilityId) {
      player.consumableAbilities = player.consumableAbilities.filter(id => id !== sameTileAbilityId);
      sameTileOpponent.position = 0;
      sounds.step();
      const ab = consumableShop.find(x => x.id === sameTileAbilityId);
      addLog(
        `🌀 [${ab?.name || 'Trục Xuất Về Khởi Hành'}] ${player.name} đứng cùng ô với ${sameTileOpponent.name}, tự động bắt ${sameTileOpponent.name} quay về Trạm Khởi Hành (ô số 0)!`,
        'ability'
      );
    }
  }

  // Jail visit reward
  if (landedTileId === 10) {
    prevPlayers.forEach(other => {
      if (other.id !== player.id && other.inJail && !other.bankrupt) {
        sounds.cash();
        const visitReward = settings.jailVisitReward ?? 100;
        other.cash += visitReward;
        addLog(
          `🎁 [Thăm Nuôi] ${other.name} đang ở tù nhận được ${visitReward}đ khi có ${player.name} đến thăm tù!`,
          'money'
        );
      }
    });
  }

  // Thu Phí Lân Cận (Vĩnh Viễn) - perm-neighbor-toll
  if (player.permanentAbilities.includes('perm-neighbor-toll')) {
    const neighbors = prevPlayers.filter(
      p =>
        p.id !== player.id &&
        !p.bankrupt &&
        (p.position === landedTileId ||
          (p.position + 1) % 40 === landedTileId ||
          (p.position - 1 + 40) % 40 === landedTileId)
    );
    if (neighbors.length > 0) {
      let totalToll = 0;
      neighbors.forEach(n => {
        const toll = Math.min(n.cash, 50);
        if (toll > 0) {
          n.cash -= toll;
          totalToll += toll;
          triggerCashTransfer(n.id, [player.id], toll, 'Thu Phí Lân Cận (Vĩnh Viễn)');
          addLog(
            `👑 [Thu Phí Lân Cận] ${player.name} thu ${toll}đ từ ${n.name} do đứng cùng ô/lân cận 1 ô!`,
            'money'
          );
        }
      });
      if (totalToll > 0) {
        player.cash += totalToll;
        sounds.cash();
      }
    }
  }

  prevPlayers.forEach(other => {
    if (
      other.id !== player.id &&
      !other.bankrupt &&
      other.permanentAbilities.includes('perm-neighbor-toll') &&
      (other.position === landedTileId ||
        (other.position + 1) % 40 === landedTileId ||
        (other.position - 1 + 40) % 40 === landedTileId)
    ) {
      const toll = Math.min(player.cash, 50);
      if (toll > 0) {
        player.cash -= toll;
        other.cash += toll;
        sounds.cash();
        triggerCashTransfer(player.id, [other.id], toll, 'Thu Phí Lân Cận (Vĩnh Viễn)');
        addLog(
          `👑 [Thu Phí Lân Cận] ${other.name} thu ${toll}đ từ ${player.name} vừa dừng chân cạnh bên/cùng ô!`,
          'money'
        );
      }
    }
  });
}
