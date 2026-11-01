import { useCallback } from 'react';
import { Player, Tile } from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import { canPlayerPayBailCheck } from '../../property/utils/rentCalculator';

interface PropertyOpsContext {
  activePlayer: Player | null;
  hasMovedThisTurn: boolean;
  upgradesThisTurn: number;
  currentRound: number;
  settings: any;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setUpgradesThisTurn: React.Dispatch<React.SetStateAction<number>>;
  setActivePropertyModalTile: (t: Tile | null) => void;
  setIsLandingPropertyAction: (v: boolean) => void;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, reason: string) => void;
  triggerCharacterEvent: (id: number, type: any, emotion: any, title: string, msg: string, cashDelta?: number) => void;
}

export const usePropertyActions = (ctx: PropertyOpsContext) => {
  const buyProperty = useCallback(
    (tile: Tile) => {
      if (!ctx.activePlayer || !tile.price || ctx.activePlayer.cash < tile.price) return;

      sounds.purchase();
      ctx.setPlayers(prev =>
        prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            return {
              ...p,
              cash: p.cash - tile.price!,
              propertiesOwned: [...p.propertiesOwned, tile.id],
            };
          }
          return p;
        })
      );

      ctx.triggerCashTransfer(ctx.activePlayer.id, [], tile.price, `Mua đất [${tile.name}]`);
      ctx.triggerCharacterEvent(
        ctx.activePlayer.id,
        'buy_property',
        'happy',
        'Sở Hữu Bất Động Sản',
        `${ctx.activePlayer.name} vừa mua thành công khu đất [${tile.name}]!`,
        -tile.price
      );
      ctx.addLog(`🏠 ${ctx.activePlayer.name} mua [${tile.name}] với giá ${tile.price}đ`, 'property');
      ctx.setActivePropertyModalTile(null);
      ctx.setIsLandingPropertyAction(false);
    },
    [ctx]
  );

  const buildHouse = useCallback(
    (tile: Tile): { success: boolean; message?: string } => {
      if (!ctx.activePlayer || !tile.houseCost) return { success: false };

      if (!ctx.hasMovedThisTurn) {
        return {
          success: false,
          message: 'Bạn phải di chuyển xong lượt của mình mới được nâng cấp nhà!',
        };
      }
      if (ctx.upgradesThisTurn >= 1) {
        return {
          success: false,
          message: 'Mỗi lượt bạn chỉ được phép nâng cấp nhà 1 lần!',
        };
      }

      const currentHouses = ctx.activePlayer.houses[tile.id] || 0;
      if (currentHouses >= 5) return { success: false, message: 'Đã đạt cấp tối đa (Khách sạn)!' };
      if (ctx.activePlayer.cash < tile.houseCost) {
        return { success: false, message: 'Không đủ tiền mặt để nâng cấp!' };
      }

      sounds.buildHouse();
      ctx.setUpgradesThisTurn(prev => prev + 1);

      ctx.setPlayers(prev =>
        prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            return {
              ...p,
              cash: p.cash - tile.houseCost!,
              houses: {
                ...p.houses,
                [tile.id]: currentHouses + 1,
              },
            };
          }
          return p;
        })
      );

      ctx.triggerCashTransfer(ctx.activePlayer.id, [], tile.houseCost, `Xây nhà trên [${tile.name}]`);
      ctx.triggerCharacterEvent(
        ctx.activePlayer.id,
        'upgrade_house',
        'happy',
        'Nâng Cấp Công Trình',
        `${ctx.activePlayer.name} vừa xây thêm nhà tại [${tile.name}]!`,
        -tile.houseCost
      );
      ctx.addLog(
        `🔨 ${ctx.activePlayer.name} xây thêm 1 cấp nhà trên [${tile.name}] (${currentHouses + 1} nhà)`,
        'property'
      );
      return { success: true };
    },
    [ctx]
  );

  const mortgageProperty = useCallback(
    (tile: Tile) => {
      if (!ctx.activePlayer || !tile.price) return;
      const mortgageValue = Math.floor(tile.price / 2);

      sounds.cash();
      ctx.setPlayers(prev =>
        prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            return {
              ...p,
              cash: p.cash + mortgageValue,
              mortgaged: { ...p.mortgaged, [tile.id]: true },
            };
          }
          return p;
        })
      );

      ctx.addLog(`📜 ${ctx.activePlayer.name} thế chấp [${tile.name}] (+${mortgageValue}đ)`, 'property');
    },
    [ctx]
  );

  const unmortgageProperty = useCallback(
    (tile: Tile) => {
      if (!ctx.activePlayer || !tile.price) return;
      const buybackCost = Math.ceil(tile.price * 0.55);
      if (ctx.activePlayer.cash < buybackCost) return;

      sounds.cash();
      ctx.setPlayers(prev =>
        prev.map(p => {
          if (p.id === ctx.activePlayer!.id) {
            return {
              ...p,
              cash: p.cash - buybackCost,
              mortgaged: { ...p.mortgaged, [tile.id]: false },
            };
          }
          return p;
        })
      );

      ctx.addLog(`✨ ${ctx.activePlayer.name} chuộc lại [${tile.name}] (-${buybackCost}đ)`, 'property');
    },
    [ctx]
  );

  const payBail = useCallback(() => {
    if (!ctx.activePlayer || !ctx.activePlayer.inJail) return;
    const bailCheck = canPlayerPayBailCheck(ctx.activePlayer, ctx.currentRound, ctx.settings);
    if (!bailCheck.canPay) {
      alert(bailCheck.reason || 'Chưa thể bảo lãnh / nộp khắc phục!');
      return;
    }

    sounds.cash();
    ctx.setPlayers(prev =>
      prev.map(p => {
        if (p.id === ctx.activePlayer!.id) {
          return {
            ...p,
            cash: p.cash - bailCheck.cost,
            inJail: false,
            jailTurns: 0,
          };
        }
        return p;
      })
    );

    const isInv = ctx.settings.jailMode === 'investigation';
    const actionTitle = isInv ? 'Khắc Phục Xóa Án' : 'Bảo Lãnh Tự Do';
    const actionDesc = isInv
      ? `🏛️ ${ctx.activePlayer.name} nộp khắc phục ${bailCheck.cost}đ và được xóa án điều tra!`
      : `🏛️ ${ctx.activePlayer.name} nộp bảo lãnh ${bailCheck.cost}đ và được tự do!`;

    ctx.triggerCashTransfer(ctx.activePlayer.id, [], bailCheck.cost, actionTitle);
    ctx.triggerCharacterEvent(
      ctx.activePlayer.id,
      'cleared_investigation',
      'happy',
      actionTitle,
      isInv
        ? `${ctx.activePlayer.name} đã hoàn tất nộp khắc phục, chính thức được xóa án điều tra!`
        : `${ctx.activePlayer.name} đã nộp bảo lãnh và được trả tự do!`,
      -bailCheck.cost
    );
    ctx.addLog(actionDesc, 'jail');
  }, [ctx]);

  return {
    buyProperty,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
  };
};
