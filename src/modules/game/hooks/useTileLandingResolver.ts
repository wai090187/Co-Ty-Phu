import { useCallback } from 'react';
import { Player, Tile, Card, PermanentAbility, ConsumableAbility } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { calculatePropertyRent } from '../../property/utils/rentCalculator';
import { INITIAL_CHANCE_CARDS, INITIAL_CHEST_CARDS } from '../../../data/cards';
import { drawRandomCardWithReset } from '../utils/cardDeckHelper';

interface LandingContext {
  tiles: Tile[];
  settings: any;
  chanceDeck: Card[];
  chestDeck: Card[];
  setChanceDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  setChestDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  permanentShop: PermanentAbility[];
  consumableShop: ConsumableAbility[];
  pendingDestroyHousePlayerId?: number | null;
  setPendingDestroyHousePlayerId?: (id: number | null) => void;
  pendingDestroyHouseNext?: boolean;
  setPendingDestroyHouseNext?: (v: boolean) => void;
  setHasMovedThisTurn: (v: boolean) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string, cashDelta?: number) => void;
  setWinner: (p: Player | null) => void;
  setActivePropertyModalTile: (t: Tile | null) => void;
  setIsLandingPropertyAction: (v: boolean) => void;
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
}

export const useTileLandingResolver = (ctx: LandingContext) => {
  const checkGameOver = useCallback(
    (currentPlayers: Player[]) => {
      const activeSurvivors = currentPlayers.filter(p => !p.bankrupt);
      if (activeSurvivors.length === 1) {
        ctx.setWinner(activeSurvivors[0]);
        ctx.addLog(
          `🏆 ${activeSurvivors[0].name} đã đánh bại tất cả đối thủ và giành chiến thắng chung cuộc!`,
          'money'
        );
        return true;
      }
      return false;
    },
    [ctx]
  );

  const handleBankrupt = useCallback(
    (bankruptPlayer: Player, creditor?: Player) => {
      sounds.jail();
      ctx.addLog(`💀 ${bankruptPlayer.name} đã khánh kiệt tài chính và chính thức Phá Sản!`, 'jail');

      ctx.setPlayers(prev => {
        const next = prev.map(p => {
          if (p.id === bankruptPlayer.id) {
            return {
              ...p,
              bankrupt: true,
              cash: 0,
              propertiesOwned: [],
              houses: {},
              mortgaged: {},
            };
          }
          if (creditor && p.id === creditor.id) {
            return {
              ...p,
              cash: p.cash + bankruptPlayer.cash,
              propertiesOwned: [...p.propertiesOwned, ...bankruptPlayer.propertiesOwned],
              houses: { ...p.houses, ...bankruptPlayer.houses },
            };
          }
          return p;
        });

        checkGameOver(next);
        return next;
      });
    },
    [ctx, checkGameOver]
  );

  const resolveTileLanding = useCallback(
    (playerId: number, landedTileId: number, diceTotal: number) => {
      ctx.setHasMovedThisTurn(true);

      ctx.setPlayers(prevPlayers => {
        const pIndex = prevPlayers.findIndex(p => p.id === playerId);
        if (pIndex === -1) return prevPlayers;
        const player = prevPlayers[pIndex];
        const tile = ctx.tiles[landedTileId];

        ctx.addLog(`${player.name} dừng chân tại [${tile.name}]`, 'info');

        // Check "when_same_tile" ability (e.g. bắt đối thủ cùng ô quay về khởi hành)
        const sameTileOpponent = prevPlayers.find(
          p => p.id !== player.id && !p.bankrupt && p.position === landedTileId
        );
        if (sameTileOpponent) {
          const sameTileAbilityId = player.consumableAbilities.find(abId => {
            const ab = ctx.consumableShop.find(x => x.id === abId);
            return ab?.triggerCondition === 'when_same_tile' || ab?.effectType === 'send_to_go';
          });
          if (sameTileAbilityId) {
            player.consumableAbilities = player.consumableAbilities.filter(id => id !== sameTileAbilityId);
            sameTileOpponent.position = 0;
            sounds.step();
            const ab = ctx.consumableShop.find(x => x.id === sameTileAbilityId);
            ctx.addLog(
              `🌀 [${ab?.name || 'Trục Xuất Về Khởi Hành'}] ${player.name} đứng cùng ô với ${sameTileOpponent.name}, tự động bắt ${sameTileOpponent.name} quay về Trạm Khởi Hành (ô số 0)!`,
              'ability'
            );
          }
        }

        // Jail visit reward
        if (tile.id === 10) {
          prevPlayers.forEach(other => {
            if (other.id !== player.id && other.inJail && !other.bankrupt) {
              sounds.cash();
              const visitReward = ctx.settings.jailVisitReward ?? 100;
              other.cash += visitReward;
              ctx.addLog(
                `🎁 [Thăm Nuôi] ${other.name} đang ở tù nhận được ${visitReward}đ khi có ${player.name} đến thăm tù!`,
                'money'
              );
            }
          });
        }

        // Corner fortune ability
        if (tile.type === 'corner' && player.permanentAbilities.includes('perm-corner-fortune')) {
          ctx.setActiveAbilityNotification({
            id: 'corner-bonus',
            title: 'Đại Gia Tứ Góc (Vĩnh Viễn)',
            description: `${player.name} vừa dừng chân tại ô góc [${tile.name}]. Bạn được nhận thêm 100đ từ Ngân Hàng!`,
            action: () => {
              sounds.cash();
              ctx.setPlayers(curr =>
                curr.map(cp => (cp.id === player.id ? { ...cp, cash: cp.cash + 100 } : cp))
              );
              ctx.addLog(`👑 [Đại Gia Tứ Góc] ${player.name} nhận thêm 100đ từ Ngân Hàng!`, 'money');
            },
          });
        }

        // 1. Property Tile
        if (tile.type === 'property') {
          const owner = prevPlayers.find(p => p.propertiesOwned.includes(tile.id));

          if (!owner) {
            ctx.setActivePropertyModalTile(tile);
            ctx.setIsLandingPropertyAction(true);
          } else if (owner.id === player.id) {
            // Check if player has auto free house upgrade on own property
            const freeUpgradeAbilityId = player.consumableAbilities.find(abId => {
              const ab = ctx.consumableShop.find(x => x.id === abId);
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
              const ab = ctx.consumableShop.find(x => x.id === freeUpgradeAbilityId);
              ctx.addLog(
                `🔨 [${ab?.name || 'Nâng Cấp Nhà Miễn Phí'}] ${player.name} dừng tại ô đất của mình [${tile.name}], tự động nâng cấp thêm 1 cấp nhà hoàn toàn miễn phí (${curHouses + 1} nhà)!`,
                'ability'
              );
            } else {
              ctx.setActivePropertyModalTile(tile);
              ctx.setIsLandingPropertyAction(true);
            }
          } else {
            const isDestroyActive = ctx.pendingDestroyHousePlayerId
              ? ctx.pendingDestroyHousePlayerId === player.id
              : !!ctx.pendingDestroyHouseNext;

            if (isDestroyActive) {
              if (ctx.setPendingDestroyHousePlayerId) {
                ctx.setPendingDestroyHousePlayerId(null);
              } else if (ctx.setPendingDestroyHouseNext) {
                ctx.setPendingDestroyHouseNext(false);
              }
              const curHouses = owner.houses[tile.id] || 0;
              if (curHouses > 0) {
                owner.houses[tile.id] = curHouses - 1;
                sounds.buildHouse();
                ctx.addLog(
                  `💣 [Lệnh Phá Sập] ${player.name} đã đánh sập 1 cấp nhà trên [${tile.name}] của ${owner.name}!`,
                  'ability'
                );
              }
            }

            if (!owner.mortgaged[tile.id]) {
              // Check auto free rent ability on opponent property
              const freeRentAbilityId = player.consumableAbilities.find(abId => {
                const ab = ctx.consumableShop.find(x => x.id === abId);
                return ab?.effectType === 'free_rent' || ab?.triggerCondition === 'when_opponent_property';
              });

              if (freeRentAbilityId) {
                player.consumableAbilities = player.consumableAbilities.filter(id => id !== freeRentAbilityId);
                sounds.ability();
                const ab = ctx.consumableShop.find(x => x.id === freeRentAbilityId);
                ctx.addLog(
                  `🛡️ [${ab?.name || 'Miễn Phí Thuê Đất'}] ${player.name} tự động kích hoạt kỹ năng: Miễn 100% tiền thuê đất tại [${tile.name}] của ${owner.name}!`,
                  'ability'
                );
              } else {
                let rent = calculatePropertyRent(tile, owner, ctx.tiles, ctx.settings);
                if (player.hasHalfRentDiscountNextTurn) {
                  rent = Math.ceil(rent * 0.5);
                  player.hasHalfRentDiscountNextTurn = false;
                  ctx.addLog(`⚡ [Phiếu Giảm Giá 50%] Tiền thuê đất giảm còn ${rent}đ!`, 'ability');
                }

                if (ctx.settings.jailMode === 'investigation') {
                  if (player.inJail) {
                    const feeInc = Math.round(rent * (ctx.settings.investigationFeePenaltyPercent / 100));
                    rent += feeInc;
                    ctx.addLog(`📈 [Đang Bị Điều Tra] ${player.name} nộp phạt thêm tiền thuê (+${feeInc}đ)!`, 'jail');
                  }
                }

                let receivedRent = rent;
                if (ctx.settings.jailMode === 'investigation' && owner.inJail) {
                  const incRed = Math.round(rent * (ctx.settings.investigationIncomePenaltyPercent / 100));
                  receivedRent = Math.max(0, rent - incRed);
                  ctx.addLog(`📉 [Đang Bị Điều Tra] Chủ đất ${owner.name} bị trừ tiền thuê thu được (-${incRed}đ)!`, 'jail');
                }

                if (player.cash >= rent) {
                  sounds.cash();
                  player.cash -= rent;
                  owner.cash += receivedRent;
                  ctx.triggerCashTransfer(player.id, [owner.id], rent, `Tiền thuê đất [${tile.name}]`);
                  ctx.addLog(`💸 ${player.name} trả tiền thuê đất ${rent}đ cho ${owner.name} tại [${tile.name}]`, 'money');
                } else {
                  handleBankrupt(player, owner);
                }
              }
            }
          }
        }
        // 2. Station Tile
        else if (tile.type === 'station') {
          // Check if player has "when_visit_station" ability (e.g. airport tourist toll from richest)
          const stationTollAbilityId = player.consumableAbilities.find(abId => {
            const ab = ctx.consumableShop.find(x => x.id === abId);
            return ab?.triggerCondition === 'when_visit_station' || ab?.id === 'station-tourist-toll-richest';
          });
          if (stationTollAbilityId) {
            const ab = ctx.consumableShop.find(x => x.id === stationTollAbilityId);
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
              ctx.triggerCashTransfer(richestOpponent.id, [player.id], actual, 'Tài trợ du lịch Sân Bay');
              ctx.addLog(
                `✈️ [${ab?.name || 'Tài Trợ Du Lịch Sân Bay'}] ${player.name} đến Bến Xe / Sân Bay: Người giàu nhất ${richestOpponent.name} phải trả ${actual}đ tiền du lịch cho ${player.name}!`,
                'ability'
              );
            }
          }

          sounds.purchase();
          const unowned = ctx.consumableShop.filter(a => (a.quantity ?? 1) > 0);
          // If player is AI, ONLY offer automatic abilities (không chọn kỹ năng thủ công)
          const pool = player.isAI
            ? unowned.filter(a => a.triggerCondition !== 'manual_anytime')
            : unowned;
          const candidatePool = pool.length > 0 ? pool : unowned;
          const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
          ctx.setOfferedStationAbilities(shuffled.slice(0, 2));
          ctx.setActiveStationModal(tile);
        }
        // 3. Utility Tile
        else if (tile.type === 'utility') {
          sounds.purchase();
          const unowned = ctx.permanentShop.filter(
            a => (a.quantity ?? 1) > 0 && !prevPlayers.some(p => p.permanentAbilities.includes(a.id))
          );
          const shuffled = [...unowned].sort(() => 0.5 - Math.random());
          ctx.setOfferedUtilityAbilities(shuffled.slice(0, 2));
          ctx.setActiveUtilityModal(tile);
        }
        // 4. Tax Tile
        else if (tile.type === 'tax') {
          const isTaxFree = player.hasFreeTaxNextTurn || player.permanentAbilities.includes('perm-tax-immunity');
          if (isTaxFree) {
            if (player.hasFreeTaxNextTurn) player.hasFreeTaxNextTurn = false;
            sounds.ability();
            ctx.addLog(`🛡️ ${player.name} được MIỄN PHÍ khoản thuế ${tile.taxAmount}đ!`, 'ability');
          } else {
            let tax = tile.taxAmount || 100;
            if (ctx.settings.jailMode === 'investigation' && player.inJail) {
              const feeInc = Math.round(tax * (ctx.settings.investigationFeePenaltyPercent / 100));
              tax += feeInc;
            }
            if (player.cash >= tax) {
              sounds.cash();
              player.cash -= tax;
              ctx.triggerCashTransfer(player.id, [], tax, `Đóng thuế [${tile.name}]`);
              ctx.addLog(`🏛️ ${player.name} đóng thuế ${tax}đ cho Ngân Hàng`, 'money');
            } else {
              handleBankrupt(player);
            }
          }
        }
        // 5. Chance Tile
        else if (tile.type === 'chance') {
          sounds.cardDraw();
          let drawn: Card | null = null;
          if (ctx.cheatNextChanceCardId) {
            const found =
              ctx.chanceDeck.find(c => c.id === ctx.cheatNextChanceCardId) ||
              INITIAL_CHANCE_CARDS.find(c => c.id === ctx.cheatNextChanceCardId);
            if (found) {
              drawn = found;
              ctx.addLog(`🛠️ [Cheat Test] Áp dụng thẻ Cơ Hội chỉ định: ${found.title}`, 'ability');
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
              ctx.addLog
            );
          }
          if (drawn) ctx.setActiveDrawnCard(drawn);
        }
        // 6. Chest Tile
        else if (tile.type === 'chest') {
          sounds.cardDraw();
          let drawn: Card | null = null;
          if (ctx.cheatNextChestCardId) {
            const found =
              ctx.chestDeck.find(c => c.id === ctx.cheatNextChestCardId) ||
              INITIAL_CHEST_CARDS.find(c => c.id === ctx.cheatNextChestCardId);
            if (found) {
              drawn = found;
              ctx.addLog(`🛠️ [Cheat Test] Áp dụng thẻ Khí Vận chỉ định: ${found.title}`, 'ability');
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
              ctx.addLog
            );
          }
          if (drawn) ctx.setActiveDrawnCard(drawn);
        }
        // 7. Go to Jail / Investigation
        else if (tile.type === 'corner' && tile.cornerType === 'gotojail') {
          if ((player.getOutOfJailCards || 0) > 0) {
            player.getOutOfJailCards = (player.getOutOfJailCards || 0) - 1;
            player.position = 10;
            player.inJail = false;
            player.jailTurns = 0;
            sounds.ability();
            ctx.addLog(
              `🕊️ [Thẻ Ra Tù Miễn Phí] ${player.name} bước vào ô Bị Bắt nhưng Thẻ Ra Tù Miễn Phí đã tự động kích hoạt để thoát tù ngay lập tức!`,
              'ability'
            );
            ctx.triggerCharacterEvent(
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
            const isInv = ctx.settings.jailMode === 'investigation';
            const msg = isInv
              ? `🚨 ${player.name}: Đang bị công an điều tra vì buôn bán nhà ở trái phép!`
              : `🚨 ${player.name} vào ô Bị Bắt: Phải vào tù ngay lập tức!`;
            ctx.addLog(msg, 'jail');
            ctx.triggerCharacterEvent(
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

        return [...prevPlayers];
      });
    },
    [ctx, handleBankrupt]
  );

  return {
    resolveTileLanding,
    handleBankrupt,
    checkGameOver,
  };
};
