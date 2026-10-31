import { GameSettings, Player, Tile } from '../../../types/game';

export const getBaseBailFee = (currentRound: number, settings: GameSettings): number => {
  if (currentRound >= 20) return settings.bailFeeRound20;
  if (currentRound >= 10) return settings.bailFeeRound10;
  return settings.bailFeeBase;
};

export const canPlayerPayBailCheck = (
  player: Player,
  currentRound: number,
  settings: GameSettings
): { canPay: boolean; cost: number; reason?: string } => {
  if (!player.inJail) return { canPay: false, cost: 0 };
  const baseFee = getBaseBailFee(currentRound, settings);
  const isInv = settings.jailMode === 'investigation';
  const actionName = isInv ? 'Khắc phục xóa án' : 'Bảo lãnh';

  if (player.jailTurns === 0) {
    if (settings.bailMultiplierTurn1 > 0) {
      const cost = baseFee * settings.bailMultiplierTurn1;
      return {
        canPay: player.cash >= cost,
        cost,
        reason: `${actionName} ở lượt 1: Tiền x${settings.bailMultiplierTurn1} (${cost}đ)`,
      };
    }
    return {
      canPay: false,
      cost: 0,
      reason: isInv
        ? 'Bạn phải chịu điều tra ít nhất 1 lượt và thử tung xúc xắc đôi trước khi được nộp phạt xóa án!'
        : 'Bạn phải ở tù ít nhất 1 lượt và thử tung xúc xắc trước khi được bảo lãnh!',
    };
  }
  if (player.jailTurns === 1) {
    const mult = settings.bailMultiplierTurn2;
    const cost = baseFee * mult;
    return {
      canPay: player.cash >= cost,
      cost,
      reason: `${actionName} ở lượt thứ 2: Tiền x${mult} (${cost}đ)`,
    };
  }
  const mult = settings.bailMultiplierTurn3;
  const cost = baseFee * mult;
  return {
    canPay: player.cash >= cost,
    cost,
    reason: `${actionName} ở lượt thứ 3: Tiền x${mult} (${cost}đ)`,
  };
};

export const calculatePropertyRent = (
  tile: Tile,
  owner: Player,
  tiles: Tile[],
  settings: GameSettings
): number => {
  if (!tile.rents || tile.type !== 'property') return 0;
  const houses = owner.houses[tile.id] || 0;
  let rent = tile.rents[houses] || tile.rentBase || 0;

  // Unimproved vacant land custom percent setting
  if (houses === 0 && tile.price) {
    const customVacantRent = Math.ceil(tile.price * (settings.vacantLandRentPercent / 100));
    rent = Math.max(customVacantRent, tile.rents[0] || 0);
  }

  // Color group boost rule: +10% per same color owned
  if (tile.colorGroup) {
    const sameColorOwnedCount = tiles.filter(
      t => t.colorGroup === tile.colorGroup && owner.propertiesOwned.includes(t.id)
    ).length;

    if (sameColorOwnedCount > 1) {
      const boostMultiplier =
        1 + (sameColorOwnedCount - 1) * (settings.sameColorRentBoostPercent / 100);
      rent = Math.ceil(rent * boostMultiplier);
    }
  }

  // Jail rent penalty: e.g. 50%
  if (owner.inJail) {
    rent = Math.ceil(rent * (settings.jailRentPercent / 100));
  }

  return rent;
};
