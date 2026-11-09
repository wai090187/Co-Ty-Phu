/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Tile, ConsumableAbility } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { calculatePropertyRent } from '../../property/utils/rentCalculator';

export interface PropertyLandingContext {
  tile: Tile;
  player: Player;
  prevPlayers: Player[];
  tiles: Tile[];
  settings: any;
  investigator?: import('../../../types/game').SpecialInvestigatorState;
  consumableShop: ConsumableAbility[];
  pendingDestroyHousePlayerId?: number | null;
  setPendingDestroyHousePlayerId?: (id: number | null) => void;
  pendingDestroyHouseNext?: boolean;
  setPendingDestroyHouseNext?: (v: boolean) => void;
  setActivePropertyModalTile: (t: Tile | null) => void;
  setIsLandingPropertyAction: (v: boolean) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  addLog: (msg: string, type?: any) => void;
  handleBankrupt: (bankruptPlayer: Player, creditor?: Player) => void;
}

export function handlePropertyLanding(ctx: PropertyLandingContext): void {
  const {
    tile,
    player,
    prevPlayers,
    tiles,
    settings,
    investigator,
    consumableShop,
    pendingDestroyHousePlayerId,
    setPendingDestroyHousePlayerId,
    pendingDestroyHouseNext,
    setPendingDestroyHouseNext,
    setActivePropertyModalTile,
    setIsLandingPropertyAction,
    triggerCashTransfer,
    addLog,
    handleBankrupt,
  } = ctx;

  const owner = prevPlayers.find(p => p.propertiesOwned.includes(tile.id));

  if (!owner) {
    setActivePropertyModalTile(tile);
    setIsLandingPropertyAction(true);
    return;
  }

  if (owner.id === player.id) {
    // Check if player has auto free house upgrade on own property
    const freeUpgradeAbilityId = player.consumableAbilities.find(abId => {
      const ab = consumableShop.find(x => x.id === abId);
      return (
        ab?.effectType === 'free_upgrade_own_house' ||
        (ab?.triggerCondition === 'when_own_property' && ab?.effectType === 'upgrade_house')
      );
    });
    const curHouses = player.houses[tile.id] || 0;
    if (freeUpgradeAbilityId && curHouses < 5) {
      player.consumableAbilities = player.consumableAbilities.filter(id => id !== freeUpgradeAbilityId);
      player.houses[tile.id] = curHouses + 1;
      sounds.buildHouse();
      const ab = consumableShop.find(x => x.id === freeUpgradeAbilityId);
      addLog(
        `🔨 [${ab?.name || 'Nâng Cấp Nhà Miễn Phí'}] ${player.name} dừng tại ô đất của mình [${tile.name}], tự động nâng cấp thêm 1 cấp nhà hoàn toàn miễn phí (${curHouses + 1} nhà)!`,
        'ability'
      );
    } else {
      setActivePropertyModalTile(tile);
      setIsLandingPropertyAction(true);
    }
    return;
  }

  // Owned by opponent
  const isDestroyActive = pendingDestroyHousePlayerId
    ? pendingDestroyHousePlayerId === player.id
    : !!pendingDestroyHouseNext;

  if (isDestroyActive) {
    if (setPendingDestroyHousePlayerId) {
      setPendingDestroyHousePlayerId(null);
    } else if (setPendingDestroyHouseNext) {
      setPendingDestroyHouseNext(false);
    }
    const curHouses = owner.houses[tile.id] || 0;
    if (curHouses > 0) {
      owner.houses[tile.id] = curHouses - 1;
      sounds.buildHouse();
      addLog(
        `💣 [Lệnh Phá Sập] ${player.name} đã đánh sập 1 cấp nhà trên [${tile.name}] của ${owner.name}!`,
        'ability'
      );
    }
  }

  if (!owner.mortgaged[tile.id]) {
    // Check auto free rent ability on opponent property
    const freeRentAbilityId = player.consumableAbilities.find(abId => {
      const ab = consumableShop.find(x => x.id === abId);
      return ab?.effectType === 'free_rent' || ab?.triggerCondition === 'when_opponent_property';
    });

    if (freeRentAbilityId) {
      player.consumableAbilities = player.consumableAbilities.filter(id => id !== freeRentAbilityId);
      sounds.ability();
      const ab = consumableShop.find(x => x.id === freeRentAbilityId);
      addLog(
        `🛡️ [${ab?.name || 'Miễn Phí Thuê Đất'}] ${player.name} tự động kích hoạt kỹ năng: Miễn 100% tiền thuê đất tại [${tile.name}] của ${owner.name}!`,
        'ability'
      );
      return;
    }

    let rent = calculatePropertyRent(tile, owner, tiles, settings, investigator);
    if (investigator?.active) {
      if (investigator.currentAbilityId === 'inv_double_rent_round') {
        addLog(`📈 [Thị Trường Sôi Động] Giá thuê đất được nhân đôi (x2) theo sắc lệnh Điều Tra Viên!`, 'ability');
      } else if (investigator.currentAbilityId === 'inv_half_rent_round') {
        addLog(`📉 [Trợ Giá Khủng Hoảng] Giá thuê đất được giảm còn ½ theo sắc lệnh Điều Tra Viên!`, 'ability');
      }
    }
    if (player.hasHalfRentDiscountNextTurn) {
      rent = Math.ceil(rent * 0.5);
      player.hasHalfRentDiscountNextTurn = false;
      addLog(`⚡ [Phiếu Giảm Giá 50%] Tiền thuê đất giảm còn ${rent}đ!`, 'ability');
    }

    if (settings.jailMode === 'investigation') {
      if (player.inJail) {
        const feeInc = Math.round(rent * (settings.investigationFeePenaltyPercent / 100));
        rent += feeInc;
        addLog(`📈 [Đang Bị Điều Tra] ${player.name} nộp phạt thêm tiền thuê (+${feeInc}đ)!`, 'jail');
      }
    }

    let receivedRent = rent;
    if (settings.jailMode === 'investigation' && owner.inJail) {
      const incRed = Math.round(rent * (settings.investigationIncomePenaltyPercent / 100));
      receivedRent = Math.max(0, rent - incRed);
      addLog(`📉 [Đang Bị Điều Tra] Chủ đất ${owner.name} bị trừ tiền thuê thu được (-${incRed}đ)!`, 'jail');
    }

    if (player.cash >= rent) {
      sounds.cash();
      player.cash -= rent;
      owner.cash += receivedRent;
      triggerCashTransfer(player.id, [owner.id], rent, `Tiền thuê đất [${tile.name}]`);
      addLog(`💸 ${player.name} trả tiền thuê đất ${rent}đ cho ${owner.name} tại [${tile.name}]`, 'money');
    } else {
      handleBankrupt(player, owner);
    }
  }
}
