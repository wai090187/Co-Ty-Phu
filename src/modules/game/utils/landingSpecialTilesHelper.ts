/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Tile, Card, PermanentAbility, ConsumableAbility } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { INITIAL_CHANCE_CARDS, INITIAL_CHEST_CARDS } from '../../../data/cards';
import { drawRandomCardWithReset } from './cardDeckHelper';
import { filterAbilitiesForAI } from './abilityFilterHelper';
import { getOfferedStationAbilities, getOfferedUtilityAbilities } from './offeredAbilitiesHelper';

export { handleSameTileAndNeighborToll } from './landingNeighborTollHelper';


export interface SpecialTilesContext {
  tile: Tile;
  player: Player;
  prevPlayers: Player[];
  settings: any;
  chanceDeck: Card[];
  chestDeck: Card[];
  setChanceDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  setChestDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  permanentShop: PermanentAbility[];
  consumableShop: ConsumableAbility[];
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string, cashDelta?: number) => void;
  setActiveStationModal: (t: Tile | null) => void;
  setOfferedStationAbilities: (a: ConsumableAbility[]) => void;
  setActiveUtilityModal: (t: Tile | null) => void;
  setOfferedUtilityAbilities: (a: PermanentAbility[]) => void;
  setActiveAbilityNotification: (n: any) => void;
  setActiveDrawnCard: (c: Card | null) => void;
  cheatNextChanceCardId?: string | null;
  setCheatNextChanceCardId?: (id: string | null) => void;
  cheatNextChestCardId?: string | null;
  setCheatNextChestCardId?: (id: string | null) => void;
  addLog: (msg: string, type?: any) => void;
  handleBankrupt: (bankruptPlayer: Player) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export function handleCornerAndSpecialTiles(ctx: SpecialTilesContext) {
  const {
    tile,
    player,
    prevPlayers,
    consumableShop,
    permanentShop,
    settings,
    addLog,
    triggerCashTransfer,
    triggerCharacterEvent,
    setActiveStationModal,
    setOfferedStationAbilities,
    setActiveUtilityModal,
    setOfferedUtilityAbilities,
    setActiveAbilityNotification,
    setPlayers,
    handleBankrupt,
  } = ctx;

  // Corner fortune ability
  if (tile.type === 'corner' && player.permanentAbilities.includes('perm-corner-fortune')) {
    if (player.isAI) {
      sounds.cash();
      player.cash += 100;
      triggerCashTransfer(0, [player.id], 100, 'Đại Gia Tứ Góc (Vĩnh Viễn)');
      addLog(`👑 [Đại Gia Tứ Góc] ${player.name} nhận thêm 100đ từ Ngân Hàng!`, 'money');
    } else {
      setActiveAbilityNotification({
        id: 'corner-bonus',
        title: 'Đại Gia Tứ Góc (Vĩnh Viễn)',
        description: `${player.name} vừa dừng chân tại ô góc [${tile.name}]. Bạn được nhận thêm 100đ từ Ngân Hàng!`,
        action: () => {
          sounds.cash();
          setPlayers(curr =>
            curr.map(cp => (cp.id === player.id ? { ...cp, cash: cp.cash + 100 } : cp))
          );
          triggerCashTransfer(0, [player.id], 100, 'Đại Gia Tứ Góc (Vĩnh Viễn)');
          addLog(`👑 [Đại Gia Tứ Góc] ${player.name} nhận thêm 100đ từ Ngân Hàng!`, 'money');
        },
      });
    }
  }

  // Station Tile
  if (tile.type === 'station') {
    const stationTollAbilityId = player.consumableAbilities.find(abId => {
      const ab = consumableShop.find(x => x.id === abId);
      return ab?.triggerCondition === 'when_visit_station' || ab?.id === 'station-tourist-toll-richest';
    });
    if (stationTollAbilityId) {
      const ab = consumableShop.find(x => x.id === stationTollAbilityId);
      const amount = ab?.effectValue || ab?.value || 200;
      const richestOpponent = prevPlayers
        .filter(p => p.id !== player.id && !p.bankrupt)
        .sort((a, b) => b.cash - a.cash)[0];
      if (richestOpponent && richestOpponent.cash > 0) {
        player.consumableAbilities = player.consumableAbilities.filter(id => id !== stationTollAbilityId);
        const actual = Math.min(richestOpponent.cash, amount);
        richestOpponent.cash -= actual;
        player.cash += actual;
        sounds.cash();
        triggerCashTransfer(richestOpponent.id, [player.id], actual, 'Tài trợ du lịch Sân Bay');
        addLog(
          `✈️ [${ab?.name || 'Tài Trợ Du Lịch Sân Bay'}] ${player.name} đến Bến Xe / Sân Bay: Người giàu nhất ${richestOpponent.name} phải trả ${actual}đ tiền du lịch cho ${player.name}!`,
          'ability'
        );
      }
    }

    sounds.purchase();
    const offeredStation = getOfferedStationAbilities(consumableShop, player.isAI);
    setOfferedStationAbilities(offeredStation);
    setActiveStationModal(tile);
  }
  // Utility Tile
  else if (tile.type === 'utility') {
    sounds.purchase();
    const offeredUtility = getOfferedUtilityAbilities(permanentShop, prevPlayers, player.id);
    setOfferedUtilityAbilities(offeredUtility);
    setActiveUtilityModal(tile);
  }

  // Tax Tile
  else if (tile.type === 'tax') {
    const isTaxFree = player.hasFreeTaxNextTurn || player.permanentAbilities.includes('perm-tax-immunity');
    if (isTaxFree) {
      if (player.hasFreeTaxNextTurn) player.hasFreeTaxNextTurn = false;
      sounds.ability();
      addLog(`🛡️ ${player.name} được MIỄN PHÍ khoản thuế ${tile.taxAmount}đ!`, 'ability');
    } else {
      let tax = tile.taxAmount || 100;
      if (settings.jailMode === 'investigation' && player.inJail) {
        const feeInc = Math.round(tax * (settings.investigationFeePenaltyPercent / 100));
        tax += feeInc;
      }
      if (player.cash >= tax) {
        sounds.cash();
        player.cash -= tax;
        triggerCashTransfer(player.id, [], tax, `Đóng thuế [${tile.name}]`);
        addLog(`🏛️ ${player.name} đóng thuế ${tax}đ cho Ngân Hàng`, 'money');
      } else {
        handleBankrupt(player);
      }
    }
  }
  // Chance Tile
  else if (tile.type === 'chance') {
    sounds.cardDraw();
    let drawn: Card | null = null;
    if (ctx.cheatNextChanceCardId) {
      const found =
        ctx.chanceDeck.find(c => c.id === ctx.cheatNextChanceCardId) ||
        INITIAL_CHANCE_CARDS.find(c => c.id === ctx.cheatNextChanceCardId);
      if (found) {
        drawn = found;
        addLog(`🛠️ [Cheat Test] Áp dụng thẻ Cơ Hội chỉ định: ${found.title}`, 'ability');
      }
      if (ctx.setCheatNextChanceCardId) {
        ctx.setCheatNextChanceCardId(null);
      }
    }
    if (!drawn) {
      drawn = drawRandomCardWithReset(
        ctx.chanceDeck,
        'chance',
        INITIAL_CHANCE_CARDS,
        ctx.setChanceDeck,
        addLog
      );
    }
    if (drawn) ctx.setActiveDrawnCard(drawn);
  }
  // Chest Tile
  else if (tile.type === 'chest') {
    sounds.cardDraw();
    let drawn: Card | null = null;
    if (ctx.cheatNextChestCardId) {
      const found =
        ctx.chestDeck.find(c => c.id === ctx.cheatNextChestCardId) ||
        INITIAL_CHEST_CARDS.find(c => c.id === ctx.cheatNextChestCardId);
      if (found) {
        drawn = found;
        addLog(`🛠️ [Cheat Test] Áp dụng thẻ Khí Vận chỉ định: ${found.title}`, 'ability');
      }
      if (ctx.setCheatNextChestCardId) {
        ctx.setCheatNextChestCardId(null);
      }
    }
    if (!drawn) {
      drawn = drawRandomCardWithReset(
        ctx.chestDeck,
        'chest',
        INITIAL_CHEST_CARDS,
        ctx.setChestDeck,
        addLog
      );
    }
    if (drawn) ctx.setActiveDrawnCard(drawn);
  }
  // Go to Jail / Investigation
  else if (tile.type === 'corner' && tile.cornerType === 'gotojail') {
    if ((player.getOutOfJailCards || 0) > 0) {
      player.getOutOfJailCards = (player.getOutOfJailCards || 0) - 1;
      player.position = 10;
      player.inJail = false;
      player.jailTurns = 0;
      sounds.ability();
      addLog(
        `🕊️ [Thẻ Ra Tù Miễn Phí] ${player.name} bước vào ô Bị Bắt nhưng Thẻ Ra Tù Miễn Phí đã tự động kích hoạt để thoát tù ngay lập tức!`,
        'ability'
      );
      triggerCharacterEvent(
        player.id,
        'escape_jail',
        'happy',
        'Thoát Tù Tự Động',
        `${player.name} vừa tự động kích hoạt Thẻ Ra Tù Miễn Phí để bảo vệ sự tự do!`
      );
    } else {
      sounds.jail();
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      const isInv = settings.jailMode === 'investigation';
      const msg = isInv
        ? `🚨 ${player.name}: Đang bị công an điều tra vì buôn bán nhà ở trái phép!`
        : `🚨 ${player.name} vào ô Bị Bắt: Phải vào tù ngay lập tức!`;
      addLog(msg, 'jail');
      triggerCharacterEvent(
        player.id,
        'investigation_jailed',
        'sad',
        isInv ? 'Bị Công An Điều Tra' : 'Bị Bắt Vào Tù',
        isInv
          ? `${player.name} đang bị công an điều tra vì buôn bán nhà ở trái phép!`
          : `${player.name} bị áp giải vào tù!`
      );
    }
  }
}
