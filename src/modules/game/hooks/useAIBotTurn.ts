import { useEffect } from 'react';
import { Player, Tile, ConsumableAbility, PermanentAbility } from '../../../types/game';

interface AIContext {
  isPlaying: boolean;
  activePlayer: Player | null;
  winner: Player | null;
  isMovingStepByStep: boolean;
  activeAbilityNotification: any;
  aiActionModalInfo: any;
  canRoll: boolean;
  activePropertyModalTile: Tile | null;
  isLandingPropertyAction: boolean;
  activeStationModal: Tile | null;
  activeUtilityModal: Tile | null;
  activeDrawnCard: any;
  players: Player[];
  consumableShop: ConsumableAbility[];
  permanentShop: PermanentAbility[];
  canPlayerPayBail: (p: Player) => { canPay: boolean };
  payBail: () => void;
  rollDice: () => void;
  buyProperty: (t: Tile) => void;
  buildHouse: (t: Tile) => void;
  setActivePropertyModalTile: (t: Tile | null) => void;
  setIsLandingPropertyAction: (v: boolean) => void;
  buyConsumableAbility: (a: ConsumableAbility) => void;
  buyPermanentAbility: (a: PermanentAbility) => void;
  setActiveStationModal: (t: Tile | null) => void;
  setActiveUtilityModal: (t: Tile | null) => void;
  setAiActionModalInfo: (info: any) => void;
  endTurn: () => void;
}

export const useAIBotTurn = (ctx: AIContext) => {
  useEffect(() => {
    if (
      !ctx.isPlaying ||
      !ctx.activePlayer ||
      !ctx.activePlayer.isAI ||
      ctx.winner ||
      ctx.isMovingStepByStep ||
      ctx.activeAbilityNotification ||
      ctx.aiActionModalInfo
    )
      return;

    const timer = setTimeout(() => {
      const bot = ctx.activePlayer;
      if (!bot) return;

      // 1. Jail check
      if (bot.inJail) {
        const bailCheck = ctx.canPlayerPayBail(bot);
        if (bailCheck.canPay && bot.aiLevel !== 'easy') {
          ctx.payBail();
        }
      }

      // 2. Roll dice
      if (ctx.canRoll) {
        ctx.rollDice();
      }
      // 3. Property decisions
      else if (ctx.activePropertyModalTile && ctx.isLandingPropertyAction) {
        const tile = ctx.activePropertyModalTile;
        const owner = ctx.players.find(p => p.propertiesOwned.includes(tile.id));

        if (!owner) {
          const shouldBuy =
            bot.aiLevel === 'hard'
              ? bot.cash >= (tile.price || 0) + 150
              : bot.aiLevel === 'medium'
              ? bot.cash >= (tile.price || 0) + 250
              : Math.random() > 0.4 && bot.cash >= (tile.price || 0);

          if (shouldBuy) {
            ctx.buyProperty(tile);
          } else {
            ctx.setActivePropertyModalTile(null);
            ctx.setIsLandingPropertyAction(false);
          }
        } else if (owner.id === bot.id) {
          const cost = tile.houseCost || 50;
          const currentH = bot.houses[tile.id] || 0;
          if (currentH < 5 && bot.cash >= cost + 300) {
            ctx.buildHouse(tile);
          }
          ctx.setActivePropertyModalTile(null);
          ctx.setIsLandingPropertyAction(false);
        }
      }
      // 4. Station Ability
      else if (ctx.activeStationModal) {
        if (bot.consumableAbilities.length < 3) {
          const affordable = ctx.consumableShop.filter(a => bot.cash >= a.cost + 200);
          if (affordable.length > 0) {
            const chosen = affordable[Math.floor(Math.random() * affordable.length)];
            ctx.buyConsumableAbility(chosen);
            ctx.setAiActionModalInfo({
              aiPlayer: bot,
              title: 'Đã Mua Kỹ Năng Tại Bến Xe',
              message: `${bot.name} vừa mua kỹ năng [${chosen.name}]: ${chosen.description}`,
              type: 'skill',
            });
            return;
          }
        }
        ctx.setActiveStationModal(null);
      }
      // 5. Utility Ability
      else if (ctx.activeUtilityModal) {
        const unowned = ctx.permanentShop.filter(
          a => !ctx.players.some(p => p.permanentAbilities.includes(a.id))
        );
        const affordable = unowned.filter(a => bot.cash >= a.cost + 350);
        if (affordable.length > 0) {
          const chosen = affordable[Math.floor(Math.random() * affordable.length)];
          ctx.buyPermanentAbility(chosen);
          ctx.setAiActionModalInfo({
            aiPlayer: bot,
            title: 'Đã Mua Năng Lực Vĩnh Viễn',
            message: `${bot.name} vừa mua độc quyền năng lực [${chosen.name}]: ${chosen.description}`,
            type: 'skill',
          });
          return;
        }
        ctx.setActiveUtilityModal(null);
      }
      // 6. End turn
      else if (!ctx.canRoll && !ctx.activeDrawnCard) {
        ctx.endTurn();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [ctx]);
};
