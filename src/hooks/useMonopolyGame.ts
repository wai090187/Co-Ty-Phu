import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tile,
  Player,
  Card,
  ConsumableAbility,
  PermanentAbility,
  GameSettings,
  LogEntry,
  AIDifficulty,
  AbilityNotification,
  CashTransferEvent,
  CharacterEvent,
} from '../types/game';
import { TILES } from '../data/tiles';
import { INITIAL_CHANCE_CARDS, INITIAL_CHEST_CARDS } from '../data/cards';
import {
  INITIAL_CONSUMABLE_ABILITIES,
  INITIAL_PERMANENT_ABILITIES,
} from '../data/abilities';
import { sounds } from '../utils/soundEngine';

export interface SetupPlayerConfig {
  name: string;
  isAI: boolean;
  aiLevel?: AIDifficulty;
  characterId: string;
  color: string;
}

const PLAYER_COLORS = [
  '#DC2626', // Red
  '#2563EB', // Blue
  '#16A34A', // Green
  '#D97706', // Amber/Yellow
  '#9333EA', // Purple
  '#0891B2', // Cyan
];

export const useMonopolyGame = () => {
  // Game Setup & Status
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    startingCash: 2000,
    goExactBonus: 400,
    goPassBonus: 200,
    bailFeeBase: 100,
    bailFeeRound10: 100,
    bailFeeRound20: 200,
    sameColorRentBoostPercent: 10,
    jailRentPercent: 50,
    maxConsumableAbilities: 3,
    soundEnabled: true,
    moveSpeed: 'normal',
    jailVisitReward: 100,
    bailMultiplierTurn1: 0,
    bailMultiplierTurn2: 2,
    bailMultiplierTurn3: 1,
    vacantLandRentPercent: 10,
    jailMode: 'prison',
    investigationIncomePenaltyPercent: 50,
    investigationFeePenaltyPercent: 50,
  });

  // Turn rules tracking:
  // "Người chơi chỉ được nâng cấp nhà sau khi đổ xúc xắc hoặc dùng thẻ (miễn là phải di chuyển xong thì mới nâng cấp được), mỗi lượt chỉ nâng cấp được một lần"
  const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);
  const [upgradesThisTurn, setUpgradesThisTurn] = useState(0);

  // Database of Tiles, Cards & Abilities
  const [tiles, setTiles] = useState<Tile[]>(TILES);
  const [chanceDeck, setChanceDeck] = useState<Card[]>(INITIAL_CHANCE_CARDS);
  const [chestDeck, setChestDeck] = useState<Card[]>(INITIAL_CHEST_CARDS);
  const [consumableShop, setConsumableShop] = useState<ConsumableAbility[]>(
    INITIAL_CONSUMABLE_ABILITIES
  );
  const [permanentShop, setPermanentShop] = useState<PermanentAbility[]>(
    INITIAL_PERMANENT_ABILITIES
  );

  // Players
  const [players, setPlayers] = useState<Player[]>([]);

  // Dice State
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [consecutiveDoubles, setConsecutiveDoubles] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);

  // Step-by-step movement animation state
  const [isMovingStepByStep, setIsMovingStepByStep] = useState(false);
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingStepsRef = useRef<number>(0);
  const movingPlayerIdRef = useRef<number | null>(null);

  // Modals & Active Tile Actions
  const [activePropertyModalTile, setActivePropertyModalTile] = useState<Tile | null>(null);
  const [isLandingPropertyAction, setIsLandingPropertyAction] = useState(false);
  const [activeStationModal, setActiveStationModal] = useState<Tile | null>(null);
  const [activeUtilityModal, setActiveUtilityModal] = useState<Tile | null>(null);
  const [offeredStationAbilities, setOfferedStationAbilities] = useState<ConsumableAbility[]>([]);
  const [offeredUtilityAbilities, setOfferedUtilityAbilities] = useState<PermanentAbility[]>([]);
  const [cashTransferEvent, setCashTransferEvent] = useState<CashTransferEvent | null>(null);
  const [characterEvent, setCharacterEvent] = useState<CharacterEvent | null>(null);
  const [activeDrawnCard, setActiveDrawnCard] = useState<Card | null>(null);
  const [activeTargetAbility, setActiveTargetAbility] = useState<ConsumableAbility | null>(null);
  const [activeAbilityNotification, setActiveAbilityNotification] = useState<AbilityNotification | null>(null);
  const [aiActionModalInfo, setAiActionModalInfo] = useState<{
    aiPlayer: Player;
    title: string;
    message: string;
    type: 'card' | 'skill' | 'jail';
  } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // Pending modifiers
  const [pendingDiceBoost, setPendingDiceBoost] = useState<number>(0);
  const [pendingDestroyHouseNext, setPendingDestroyHouseNext] = useState<boolean>(false);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        text,
        type,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const triggerCashTransfer = useCallback(
    (
      payerId: number | undefined,
      receiverIds: number[],
      amount: number,
      reason: string
    ) => {
      setCashTransferEvent({
        id: `transfer-${Date.now()}-${Math.random()}`,
        payerId,
        receiverIds,
        amount,
        reason,
        timestamp: Date.now(),
      });

      setPlayers(prev =>
        prev.map(p => {
          if (payerId !== undefined && p.id === payerId) {
            return {
              ...p,
              emotion: 'sad',
              emotionMessage: `-${amount}đ`,
              emotionTimestamp: Date.now(),
            };
          }
          if (receiverIds.includes(p.id)) {
            const share = Math.round(amount / receiverIds.length);
            return {
              ...p,
              emotion: 'happy',
              emotionMessage: `+${share}đ`,
              emotionTimestamp: Date.now(),
            };
          }
          return p;
        })
      );
    },
    []
  );

  const triggerCharacterEvent = useCallback(
    (
      playerId: number,
      type: CharacterEvent['type'],
      emotion: CharacterEvent['emotion'],
      title: string,
      message: string,
      amount?: number,
      subMessage?: string
    ) => {
      setCharacterEvent({
        id: `char-evt-${Date.now()}-${Math.random()}`,
        playerId,
        type,
        emotion,
        title,
        message,
        subMessage,
        amount,
        timestamp: Date.now(),
      });

      setPlayers(prev =>
        prev.map(p =>
          p.id === playerId
            ? { ...p, emotion, emotionMessage: message, emotionTimestamp: Date.now() }
            : p
        )
      );
    },
    []
  );

  // Update sound setting
  useEffect(() => {
    sounds.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Current Active Player
  const activePlayer = players[turnIndex] || null;

  // Initialize Match
  const startNewGame = useCallback(
    (configs: SetupPlayerConfig[]) => {
      const initializedPlayers: Player[] = configs.map((cfg, idx) => ({
        id: idx + 1,
        name: cfg.isAI
          ? `AI ${idx + 1} (${cfg.aiLevel === 'easy' ? 'Dễ' : cfg.aiLevel === 'medium' ? 'TB' : 'Khó'})`
          : cfg.name,
        isAI: cfg.isAI,
        aiLevel: cfg.aiLevel,
        characterId: cfg.characterId,
        color: cfg.color || PLAYER_COLORS[idx % PLAYER_COLORS.length],
        cash: settings.startingCash,
        position: 0,
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        bankrupt: false,
        consumableAbilities: [],
        permanentAbilities: [],
        propertiesOwned: [],
        houses: {},
        mortgaged: {},
      }));

      setPlayers(initializedPlayers);
      setCurrentRound(1);
      setTurnIndex(0);
      setCanRoll(true);
      setHasMovedThisTurn(false);
      setUpgradesThisTurn(0);
      setWinner(null);
      setIsPlaying(true);
      setLogs([
        {
          id: 'init-1',
          text: `Ván cờ bắt đầu với ${initializedPlayers.length} người chơi. Mỗi người nhận ${settings.startingCash}đ!`,
          type: 'info',
          timestamp: Date.now(),
        },
      ]);
    },
    [settings.startingCash]
  );

  // Base bail fee by round
  const getBaseBailFee = useCallback(() => {
    if (currentRound >= 20) return settings.bailFeeRound20;
    if (currentRound >= 10) return settings.bailFeeRound10;
    return settings.bailFeeBase;
  }, [currentRound, settings]);

  // Specific bail rule:
  // "chỉ được bảo lãnh sau khi tung xúc xắc để ra tù thất bại 1 lần (ít nhất phải bị ở tù 1 lượt). Nếu sau lần 2 muốn bảo lãnh thì tiền x2, lần 3 thì tiền bảo lãnh x1"
  const canPlayerPayBail = useCallback(
    (player: Player): { canPay: boolean; cost: number; reason?: string } => {
      if (!player.inJail) return { canPay: false, cost: 0 };
      const baseFee = getBaseBailFee();

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
    },
    [getBaseBailFee, settings]
  );

  // Calculate rent on a property
  const calculateRent = useCallback(
    (tile: Tile, owner: Player) => {
      if (!tile.rents || tile.type !== 'property') return 0;
      const houses = owner.houses[tile.id] || 0;
      let rent = tile.rents[houses] || tile.rentBase || 0;

      // Unimproved vacant land custom percent setting:
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

      // Jail rent penalty: "chỉ được thu 50% số tiền khi ngồi tù"
      if (owner.inJail) {
        rent = Math.ceil(rent * (settings.jailRentPercent / 100));
      }

      return rent;
    },
    [tiles, settings]
  );

  // Check Game Over condition
  const checkGameOver = useCallback(
    (currentPlayers: Player[]) => {
      const activeSurvivors = currentPlayers.filter(p => !p.bankrupt);
      if (activeSurvivors.length === 1) {
        setWinner(activeSurvivors[0]);
        addLog(
          `🏆 ${activeSurvivors[0].name} đã đánh bại tất cả đối thủ và giành chiến thắng chung cuộc!`,
          'money'
        );
        return true;
      }
      return false;
    },
    [addLog]
  );

  // Handle Bankruptcy
  const handleBankrupt = useCallback(
    (bankruptPlayer: Player, creditor?: Player) => {
      sounds.jail();
      addLog(`💀 ${bankruptPlayer.name} đã khánh kiệt tài chính và chính thức Phá Sản!`, 'jail');

      setPlayers(prev => {
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
    [addLog, checkGameOver]
  );

  // End Current Turn
  const endTurn = useCallback(() => {
    if (!activePlayer) return;

    setActivePropertyModalTile(null);
    setIsLandingPropertyAction(false);
    setActiveStationModal(null);
    setActiveUtilityModal(null);
    setActiveDrawnCard(null);
    setActiveAbilityNotification(null);
    setAiActionModalInfo(null);

    setPlayers(prev => {
      let nextIndex = (turnIndex + 1) % prev.length;
      let loopCount = 0;
      while (prev[nextIndex].bankrupt && loopCount < prev.length) {
        nextIndex = (nextIndex + 1) % prev.length;
        loopCount++;
      }

      if (nextIndex <= turnIndex) {
        setCurrentRound(r => r + 1);
        addLog(`--- Bắt đầu Vòng ${currentRound + 1} ---`, 'info');
      }

      setTurnIndex(nextIndex);
      setCanRoll(true);
      setHasMovedThisTurn(false);
      setUpgradesThisTurn(0);
      setConsecutiveDoubles(0);

      return prev;
    });
  }, [activePlayer, turnIndex, currentRound, addLog]);

  // Resolve Landing Action
  const resolveTileLanding = useCallback(
    (playerId: number, landedTileId: number, diceTotal: number) => {
      setHasMovedThisTurn(true);

      setPlayers(prevPlayers => {
        const pIndex = prevPlayers.findIndex(p => p.id === playerId);
        if (pIndex === -1) return prevPlayers;
        const player = prevPlayers[pIndex];
        const tile = tiles[landedTileId];

        addLog(`${player.name} dừng chân tại [${tile.name}]`, 'info');

        // New Rule: "Thêm luật đang ở tù, mà có người vào thăm thì nhận [jailVisitReward]đ"
        if (tile.id === 10) {
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

        // Permanent Ability: "Đại gia 4 góc" (+100đ if landing on 4 corners)
        if (tile.type === 'corner' && player.permanentAbilities.includes('perm-corner-fortune')) {
          setActiveAbilityNotification({
            id: 'corner-bonus',
            title: 'Đại Gia Tứ Góc (Vĩnh Viễn)',
            description: `${player.name} vừa dừng chân tại ô góc [${tile.name}]. Bạn được nhận thêm 100đ từ Ngân Hàng!`,
            action: () => {
              sounds.cash();
              setPlayers(curr =>
                curr.map(cp => (cp.id === player.id ? { ...cp, cash: cp.cash + 100 } : cp))
              );
              addLog(`👑 [Đại Gia Tứ Góc] ${player.name} nhận thêm 100đ từ Ngân Hàng!`, 'money');
            },
          });
        }

        // Permanent Ability: "Thu phí lân cận" (steal 50đ if standing on same or adjacent tile with opponent)
        prevPlayers.forEach(other => {
          if (other.id !== player.id && !other.bankrupt) {
            const distance = Math.abs(other.position - player.position);
            const isNeighbor = distance === 0 || distance === 1 || distance === 39;
            if (isNeighbor) {
              if (player.permanentAbilities.includes('perm-neighbor-toll')) {
                setActiveAbilityNotification({
                  id: 'neighbor-toll-self',
                  title: 'Thu Phí Lân Cận (Vĩnh Viễn)',
                  description: `${player.name} đang đứng cạnh ${other.name}. Bạn tự động thu phí 50đ từ họ!`,
                  action: () => {
                    sounds.cash();
                    setPlayers(curr =>
                      curr.map(cp => {
                        if (cp.id === player.id) return { ...cp, cash: cp.cash + 50 };
                        if (cp.id === other.id) return { ...cp, cash: Math.max(0, cp.cash - 50) };
                        return cp;
                      })
                    );
                    addLog(`👑 [Thu Phí Lân Cận] ${player.name} thu 50đ từ ${other.name}!`, 'money');
                  },
                });
              }
              if (other.permanentAbilities.includes('perm-neighbor-toll')) {
                setActiveAbilityNotification({
                  id: 'neighbor-toll-other',
                  title: 'Thu Phí Lân Cận (Đối Thủ)',
                  description: `${other.name} sở hữu năng lực Thu Phí Lân Cận! Họ thu 50đ từ ${player.name}.`,
                  action: () => {
                    sounds.cash();
                    setPlayers(curr =>
                      curr.map(cp => {
                        if (cp.id === other.id) return { ...cp, cash: cp.cash + 50 };
                        if (cp.id === player.id) return { ...cp, cash: Math.max(0, cp.cash - 50) };
                        return cp;
                      })
                    );
                    addLog(`👑 [Thu Phí Lân Cận] ${other.name} thu 50đ từ ${player.name}!`, 'money');
                  },
                });
              }
            }
          }
        });

        // 1. Property Tile
        if (tile.type === 'property') {
          const owner = prevPlayers.find(op => op.propertiesOwned.includes(tile.id));
          if (!owner) {
            setActivePropertyModalTile(tile);
            setIsLandingPropertyAction(true);
          } else if (owner.id === player.id) {
            // Own property -> Open deed modal (can upgrade house if has not upgraded yet)
            setActivePropertyModalTile(tile);
            setIsLandingPropertyAction(true);
          } else {
            // Opponent's property
            if (pendingDestroyHouseNext) {
              setPendingDestroyHouseNext(false);
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
              let rent = calculateRent(tile, owner);
              if (player.hasHalfRentDiscountNextTurn) {
                rent = Math.ceil(rent * 0.5);
                player.hasHalfRentDiscountNextTurn = false;
                addLog(`⚡ [Phiếu Giảm Giá 50%] Tiền thuê đất được giảm còn ${rent}đ!`, 'ability');
              }

              // Investigation Mode Rent Modifiers
              if (settings.jailMode === 'investigation') {
                if (player.inJail) {
                  const feeIncrease = Math.round(
                    rent * (settings.investigationFeePenaltyPercent / 100)
                  );
                  rent += feeIncrease;
                  addLog(
                    `📈 [Đang Bị Điều Tra] ${player.name} nộp phạt thêm ${settings.investigationFeePenaltyPercent}% tiền thuê (+${feeIncrease}đ)!`,
                    'jail'
                  );
                }
              }

              let receivedRent = rent;
              if (settings.jailMode === 'investigation' && owner.inJail) {
                const incomeReduction = Math.round(
                  rent * (settings.investigationIncomePenaltyPercent / 100)
                );
                receivedRent = Math.max(0, rent - incomeReduction);
                addLog(
                  `📉 [Đang Bị Điều Tra] Chủ đất ${owner.name} bị trừ ${settings.investigationIncomePenaltyPercent}% tiền thuê thu được (-${incomeReduction}đ)!`,
                  'jail'
                );
              }

              if (player.cash >= rent) {
                sounds.cash();
                player.cash -= rent;
                owner.cash += receivedRent;
                triggerCashTransfer(player.id, [owner.id], rent, `Tiền thuê đất [${tile.name}]`);
                addLog(
                  `💸 ${player.name} trả tiền thuê đất ${rent}đ cho ${owner.name} tại [${tile.name}]`,
                  'property'
                );
                setActivePropertyModalTile(tile);
                setIsLandingPropertyAction(false);
              } else {
                addLog(`⚠️ ${player.name} không đủ tiền trả ${rent}đ cho ${owner.name}!`, 'jail');
                handleBankrupt(player, owner);
              }
            }
          }
        }

        // 2. Station Tile (Bus Station: Consumable Abilities Shop - Random 2)
        else if (tile.type === 'station') {
          sounds.purchase();
          const avail = consumableShop.filter(a => (a.quantity ?? 1) > 0);
          const shuffled = [...avail].sort(() => 0.5 - Math.random());
          const offered = shuffled.slice(0, 2);
          setOfferedStationAbilities(offered);
          addLog(
            `🚌 ${player.name} ghé [${tile.name}]. Xuất hiện ngẫu nhiên 2 Kỹ Năng Dùng 1 Lần!`,
            'ability'
          );
          setActiveStationModal(tile);
        }

        // 3. Utility Tile (Electric / Water: Permanent Abilities Shop - Random 2 Unowned)
        else if (tile.type === 'utility') {
          sounds.purchase();
          const unowned = permanentShop.filter(
            a =>
              (a.quantity ?? 1) > 0 &&
              !prevPlayers.some(p => p.permanentAbilities.includes(a.id))
          );
          const shuffled = [...unowned].sort(() => 0.5 - Math.random());
          const offered = shuffled.slice(0, 2);
          setOfferedUtilityAbilities(offered);
          addLog(
            `⚡ ${player.name} ghé [${tile.name}]. Mở bán độc quyền 2 Năng Lực Vĩnh Viễn chưa có chủ sở hữu!`,
            'ability'
          );
          setActiveUtilityModal(tile);
        }

        // 4. Tax Tile
        else if (tile.type === 'tax') {
          const isTaxFree =
            player.hasFreeTaxNextTurn ||
            player.permanentAbilities.includes('perm-tax-immunity');

          if (isTaxFree) {
            if (player.hasFreeTaxNextTurn) player.hasFreeTaxNextTurn = false;
            setActiveAbilityNotification({
              id: 'tax-waived',
              title: 'Đặc Quyền Miễn Thuế',
              description: `${player.name} được miễn phí hoàn toàn khoản thuế ${tile.taxAmount}đ!`,
              action: () => {
                sounds.ability();
                addLog(`🛡️ ${player.name} được MIỄN PHÍ khoản thuế ${tile.taxAmount}đ!`, 'ability');
              },
            });
          } else {
            let tax = tile.taxAmount || 100;
            if (settings.jailMode === 'investigation' && player.inJail) {
              const feeIncrease = Math.round(
                tax * (settings.investigationFeePenaltyPercent / 100)
              );
              tax += feeIncrease;
              addLog(
                `📈 [Đang Bị Điều Tra] ${player.name} bị phạt thêm ${settings.investigationFeePenaltyPercent}% tiền thuế (+${feeIncrease}đ)!`,
                'jail'
              );
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

        // 5. Chance Tile
        else if (tile.type === 'chance') {
          const availableChance = chanceDeck.filter(c => (c.quantity ?? 1) > 0);
          if (availableChance.length > 0) {
            sounds.cardDraw();
            const drawn = availableChance[Math.floor(Math.random() * availableChance.length)];
            setActiveDrawnCard(drawn);
            addLog(`❓ ${player.name} rút thẻ CƠ HỘI: "${drawn.title}"`, 'action');
          } else {
            addLog(`❓ ${player.name} ghé ô CƠ HỘI nhưng tất cả thẻ hiện đang bị ẩn (SL = 0)!`, 'info');
          }
        }

        // 6. Community Chest Tile
        else if (tile.type === 'chest') {
          const availableChest = chestDeck.filter(c => (c.quantity ?? 1) > 0);
          if (availableChest.length > 0) {
            sounds.cardDraw();
            const drawn = availableChest[Math.floor(Math.random() * availableChest.length)];
            setActiveDrawnCard(drawn);
            addLog(`📦 ${player.name} rút thẻ KHÍ VẬN: "${drawn.title}"`, 'action');
          } else {
            addLog(`📦 ${player.name} ghé ô KHÍ VẬN nhưng tất cả thẻ hiện đang bị ẩn (SL = 0)!`, 'info');
          }
        }

        // 7. Corner: Vào tù / Khởi tố điều tra
        else if (tile.type === 'corner' && tile.cornerType === 'gotojail') {
          sounds.jail();
          player.position = 10;
          player.inJail = true;
          player.jailTurns = 0;
          if (settings.jailMode === 'investigation') {
            addLog(
              `🚨 ${player.name} đang bị công an điều tra vì hành vi buôn bán nhà ở trái phép!`,
              'jail'
            );
            triggerCharacterEvent(
              player.id,
              'investigation_jailed',
              'sad',
              'Bị Khởi Tố Điều Tra',
              `${player.name} đang bị công an điều tra vì buôn bán nhà ở trái phép! Tiền nhận giảm ${settings.investigationIncomePenaltyPercent}%, tiền nộp phạt tăng ${settings.investigationFeePenaltyPercent}%.`
            );
          } else {
            addLog(`🚨 ${player.name} bị cảnh sát bắt vào tù!`, 'jail');
            triggerCharacterEvent(
              player.id,
              'investigation_jailed',
              'sad',
              'Vào Tù Thụ Án',
              `${player.name} đã bị cảnh sát áp giải vào tù!`
            );
          }
        }

        return [...prevPlayers];
      });
    },
    [
      tiles,
      chanceDeck,
      chestDeck,
      consumableShop,
      permanentShop,
      settings,
      calculateRent,
      pendingDestroyHouseNext,
      addLog,
      handleBankrupt,
      triggerCashTransfer,
      triggerCharacterEvent,
    ]
  );

  // Step-by-Step Movement Loop with Configurable Speed & Skip
  const movePlayerSteps = useCallback(
    (playerId: number, steps: number) => {
      if (steps <= 0) return;

      setIsMovingStepByStep(true);
      remainingStepsRef.current = steps;
      movingPlayerIdRef.current = playerId;

      const delayMap = {
        slow: 420,
        normal: 240,
        fast: 90,
      };
      const stepDelay = delayMap[settings.moveSpeed] || 240;

      const doSingleStep = () => {
        if (remainingStepsRef.current <= 0) {
          setIsMovingStepByStep(false);
          movingPlayerIdRef.current = null;
          // Resolve landing
          setPlayers(curr => {
            const p = curr.find(x => x.id === playerId);
            if (p) {
              resolveTileLanding(playerId, p.position, steps);
            }
            return curr;
          });
          return;
        }

        remainingStepsRef.current -= 1;

        setPlayers(prev => {
          const next = [...prev];
          const p = next.find(x => x.id === playerId);
          if (!p) return prev;

          const oldPos = p.position;
          const newPos = (oldPos + 1) % 40;

          // Check passing or landing on GO (Tile 0)
          if (newPos === 0) {
            let bonus =
              remainingStepsRef.current === 0
                ? settings.goExactBonus
                : settings.goPassBonus;

            if (settings.jailMode === 'investigation' && p.inJail) {
              const incomeCut = Math.round(
                bonus * (settings.investigationIncomePenaltyPercent / 100)
              );
              bonus = Math.max(0, bonus - incomeCut);
              addLog(
                `📉 [Đang Bị Điều Tra] ${p.name} bị khấu trừ ${settings.investigationIncomePenaltyPercent}% tiền Trạm Khởi Hành (-${incomeCut}đ)!`,
                'jail'
              );
            }

            sounds.cash();
            p.cash += bonus;
            triggerCashTransfer(
              undefined,
              [p.id],
              bonus,
              remainingStepsRef.current === 0
                ? 'Dừng trúng Trạm Khởi Hành'
                : 'Đi qua Trạm Khởi Hành'
            );

            if (remainingStepsRef.current === 0) {
              addLog(
                `🌟 ${p.name} dừng trúng ngay Trạm Khởi Hành! Thưởng ${bonus}đ!`,
                'money'
              );
            } else {
              addLog(
                `🎉 ${p.name} đi qua Trạm Khởi Hành, nhận ${bonus}đ!`,
                'money'
              );
            }
          }

          p.position = newPos;
          sounds.step();
          return next;
        });

        moveTimerRef.current = setTimeout(doSingleStep, stepDelay);
      };

      moveTimerRef.current = setTimeout(doSingleStep, stepDelay);
    },
    [settings, addLog, resolveTileLanding, triggerCashTransfer]
  );

  // Skip movement animation immediately
  const skipMovement = useCallback(() => {
    if (!isMovingStepByStep || remainingStepsRef.current <= 0 || !movingPlayerIdRef.current) return;

    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current);
    }

    const stepsLeft = remainingStepsRef.current;
    const pId = movingPlayerIdRef.current;
    remainingStepsRef.current = 0;
    setIsMovingStepByStep(false);
    movingPlayerIdRef.current = null;

    setPlayers(prev => {
      const next = [...prev];
      const p = next.find(x => x.id === pId);
      if (!p) return prev;

      const oldPos = p.position;
      const newPos = (oldPos + stepsLeft) % 40;

      // Check passing GO
      if (newPos < oldPos) {
        let bonus = newPos === 0 ? settings.goExactBonus : settings.goPassBonus;
        if (settings.jailMode === 'investigation' && p.inJail) {
          const incomeCut = Math.round(
            bonus * (settings.investigationIncomePenaltyPercent / 100)
          );
          bonus = Math.max(0, bonus - incomeCut);
        }
        sounds.cash();
        p.cash += bonus;
        triggerCashTransfer(
          undefined,
          [p.id],
          bonus,
          newPos === 0 ? 'Dừng trúng Trạm Khởi Hành' : 'Đi qua Trạm Khởi Hành'
        );
      }

      p.position = newPos;
      sounds.step();

      setTimeout(() => {
        resolveTileLanding(pId, newPos, 0);
      }, 100);

      return next;
    });
  }, [isMovingStepByStep, settings, resolveTileLanding]);

  // Roll Dice Action
  const rollDice = useCallback(() => {
    if (!activePlayer || !canRoll || isRolling || isMovingStepByStep || activePlayer.bankrupt)
      return;

    setIsRolling(true);
    setCanRoll(false);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const isDouble = d1 === d2;
    let total = d1 + d2;

    if (pendingDiceBoost !== 0) {
      total = Math.max(1, total + pendingDiceBoost);
      addLog(
        `⚡ Gia tốc xúc xắc tác dụng: ${pendingDiceBoost > 0 ? '+' : ''}${pendingDiceBoost} bước!`,
        'ability'
      );
      setPendingDiceBoost(0);
    }

    setDice([d1, d2]);
    activePlayer.lastDiceRoll = [d1, d2];

    setTimeout(() => {
      setIsRolling(false);
      addLog(
        `🎲 ${activePlayer.name} tung được [${d1}][${d2}] (Tổng: ${total})${
          isDouble ? ' - LƯỢT ĐÔI!' : ''
        }`,
        'info'
      );

      // 1. If currently in Jail / Under Investigation:
      if (activePlayer.inJail) {
        const isInvestigation = settings.jailMode === 'investigation';

        if (isDouble) {
          sounds.ability();
          activePlayer.inJail = false;
          activePlayer.jailTurns = 0;
          if (isInvestigation) {
            addLog(
              `✨ [Xóa Án Thành Công] ${activePlayer.name} tung được xúc xắc đôi và chính thức được xóa án điều tra!`,
              'jail'
            );
            triggerCharacterEvent(
              activePlayer.id,
              'cleared_investigation',
              'happy',
              'Đình Chỉ Điều Tra',
              `Xúc xắc đôi đã giúp bạn xóa án điều tra thành công!`
            );
          } else {
            addLog(`✨ ${activePlayer.name} đổ được đôi và được ra tù ngay lập tức!`, 'jail');
          }
          movePlayerSteps(activePlayer.id, total);
          return;
        } else {
          activePlayer.jailTurns += 1;

          if (activePlayer.jailTurns >= 3) {
            const baseFee = getBaseBailFee();
            if (activePlayer.cash >= baseFee) {
              activePlayer.cash -= baseFee;
              activePlayer.inJail = false;
              activePlayer.jailTurns = 0;
              sounds.cash();
              triggerCashTransfer(
                activePlayer.id,
                [],
                baseFee,
                isInvestigation ? 'Khắc phục hậu quả xóa án' : 'Phí bảo lãnh ra tù'
              );
              addLog(
                isInvestigation
                  ? `🏛️ Hết 3 lượt điều tra, ${activePlayer.name} nộp khắc phục ${baseFee}đ và được xóa án điều tra!`
                  : `🏛️ Hết 3 lượt ở tù, ${activePlayer.name} nộp phạt ${baseFee}đ và được tự do di chuyển!`,
                'jail'
              );
              movePlayerSteps(activePlayer.id, total);
              return;
            } else {
              handleBankrupt(activePlayer);
              return;
            }
          }

          if (isInvestigation) {
            addLog(
              `🕵️ [Đang Bị Điều Tra] ${activePlayer.name} chưa tung được đôi (${activePlayer.jailTurns}/3), vẫn được di chuyển nhưng bị trừ thu nhập / tăng nộp phạt!`,
              'jail'
            );
            movePlayerSteps(activePlayer.id, total);
            return;
          } else {
            addLog(
              `🔒 ${activePlayer.name} không tung được đôi, phải ở tù lượt này (${activePlayer.jailTurns}/3)`,
              'jail'
            );
            return;
          }
        }
      }

      // 2. 3 consecutive doubles rule -> Go to Jail
      if (isDouble) {
        const nextDoubles = consecutiveDoubles + 1;
        setConsecutiveDoubles(nextDoubles);
        if (nextDoubles >= 3) {
          sounds.jail();
          activePlayer.position = 10;
          activePlayer.inJail = true;
          activePlayer.jailTurns = 0;
          setConsecutiveDoubles(0);
          addLog(`🚨 ${activePlayer.name} tung đôi 3 lần liên tiếp: Bị bắt vào tù!`, 'jail');
          return;
        }
      } else {
        setConsecutiveDoubles(0);
      }

      // 3. Normal Movement step-by-step
      movePlayerSteps(activePlayer.id, total);
    }, 450);
  }, [
    activePlayer,
    canRoll,
    isRolling,
    isMovingStepByStep,
    pendingDiceBoost,
    consecutiveDoubles,
    getBaseBailFee,
    addLog,
    movePlayerSteps,
    handleBankrupt,
  ]);

  // Pay Bail to get out of jail or clear investigation
  const payBail = useCallback(() => {
    if (!activePlayer || !activePlayer.inJail) return;
    const bailCheck = canPlayerPayBail(activePlayer);
    if (!bailCheck.canPay) {
      alert(bailCheck.reason || 'Chưa thể bảo lãnh / nộp khắc phục!');
      return;
    }

    const isInvestigation = settings.jailMode === 'investigation';
    sounds.cash();
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === activePlayer.id) {
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

    triggerCashTransfer(
      activePlayer.id,
      [],
      bailCheck.cost,
      isInvestigation ? 'Khắc phục hậu quả xóa án điều tra' : 'Tiền bảo lãnh ra tù'
    );
    triggerCharacterEvent(
      activePlayer.id,
      'cleared_investigation',
      'happy',
      isInvestigation ? 'Xóa Án Điều Tra' : 'Ra Tù Tự Do',
      isInvestigation
        ? `${activePlayer.name} đã nộp phạt khắc phục hậu quả (-${bailCheck.cost}đ), chính thức xóa án điều tra!`
        : `${activePlayer.name} đã nộp bảo lãnh (-${bailCheck.cost}đ) và được tự do!`,
      -bailCheck.cost
    );

    addLog(
      isInvestigation
        ? `🕊️ ${activePlayer.name} nộp ${bailCheck.cost}đ khắc phục hậu quả và được xóa án điều tra!`
        : `🏛️ ${activePlayer.name} nộp ${bailCheck.cost}đ tiền bảo lãnh và được ra tù tự do!`,
      'jail'
    );
  }, [activePlayer, canPlayerPayBail, settings, addLog, triggerCashTransfer, triggerCharacterEvent]);

  // Execute Drawn Card
  const executeDrawnCard = useCallback(
    (card: Card) => {
      if (!activePlayer) return;
      setActiveDrawnCard(null);

      setPlayers(prev => {
        const next = [...prev];
        const p = next.find(x => x.id === activePlayer.id);
        if (!p) return prev;

        switch (card.actionType) {
          case 'cash_bonus':
            sounds.cash();
            p.cash += card.value || 0;
            addLog(`💰 ${p.name} nhận được ${card.value}đ: "${card.title}"`, 'money');
            break;

          case 'cash_penalty':
            const pen = card.value || 0;
            if (p.cash >= pen) {
              sounds.cash();
              p.cash -= pen;
              addLog(`💸 ${p.name} nộp phạt ${pen}đ: "${card.title}"`, 'money');
            } else {
              handleBankrupt(p);
            }
            break;

          case 'birthday':
            const perPlayer = card.value || 10;
            let totalGift = 0;
            next.forEach(op => {
              if (op.id !== p.id && !op.bankrupt) {
                const pay = Math.min(op.cash, perPlayer);
                op.cash -= pay;
                totalGift += pay;
              }
            });
            sounds.cash();
            p.cash += totalGift;
            addLog(`🎂 ${p.name} được mừng sinh nhật tổng cộng ${totalGift}đ!`, 'money');
            break;

          case 'move_to':
            if (card.targetTileId !== undefined) {
              const target = card.targetTileId;
              if (target < p.position) {
                p.cash += settings.goPassBonus;
                addLog(`🎉 ${p.name} đi qua Trạm Khởi Hành nhận ${settings.goPassBonus}đ!`, 'money');
              }
              p.position = target;
              sounds.step();
              setTimeout(() => {
                resolveTileLanding(p.id, target, 0);
              }, 250);
            }
            break;

          case 'move_relative':
            const steps = card.value || 0;
            p.position = (p.position + steps + 40) % 40;
            sounds.step();
            setTimeout(() => {
              resolveTileLanding(p.id, p.position, 0);
            }, 250);
            break;

          case 'go_to_jail':
            sounds.jail();
            p.position = 10;
            p.inJail = true;
            p.jailTurns = 0;
            addLog(`🚨 ${p.name} bị tống thẳng vào tù: "${card.title}"`, 'jail');
            break;

          case 'get_out_of_jail':
            sounds.ability();
            p.getOutOfJailCards += 1;
            addLog(`📜 ${p.name} nhận được 1 Thẻ Ra Tù Miễn Phí!`, 'ability');
            break;

          case 'house_repair':
            let totalRepair = 0;
            p.propertiesOwned.forEach(tid => {
              const h = p.houses[tid] || 0;
              if (h === 5) totalRepair += 100;
              else if (h > 0) totalRepair += h * 25;
            });
            if (p.cash >= totalRepair) {
              sounds.cash();
              p.cash -= totalRepair;
              addLog(`🔨 ${p.name} đóng ${totalRepair}đ phí trùng tu nhà cửa`, 'money');
            } else {
              handleBankrupt(p);
            }
            break;
        }

        return next;
      });
    },
    [activePlayer, settings, addLog, handleBankrupt, resolveTileLanding]
  );

  // Buy Property
  const buyProperty = useCallback(
    (tile: Tile) => {
      if (!activePlayer || activePlayer.cash < (tile.price || 0)) return;

      sounds.purchase();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            return {
              ...p,
              cash: p.cash - (tile.price || 0),
              propertiesOwned: [...p.propertiesOwned, tile.id],
            };
          }
          return p;
        })
      );

      addLog(`🎉 ${activePlayer.name} đã mua ô đất [${tile.name}] với giá ${tile.price}đ`, 'property');
      setActivePropertyModalTile(null);
      setIsLandingPropertyAction(false);
    },
    [activePlayer, addLog]
  );

  // Upgrade House Rule:
  // "Người chơi chỉ được nâng cấp nhà sau khi đổ xúc xắc hoặc dùng thẻ (miễn là phải di chuyển xong thì mới nâng cấp được), mỗi lượt chỉ nâng cấp được một lần"
  const buildHouse = useCallback(
    (tile: Tile): { success: boolean; message?: string } => {
      if (!activePlayer) return { success: false };

      if (!hasMovedThisTurn) {
        return {
          success: false,
          message: 'Bạn chỉ được nâng cấp nhà sau khi đã đổ xúc xắc và di chuyển xong trong lượt!',
        };
      }

      if (upgradesThisTurn >= 1) {
        return {
          success: false,
          message: 'Mỗi lượt chỉ được phép nâng cấp tối đa 1 lần!',
        };
      }

      const cost = tile.houseCost || 50;
      if (activePlayer.cash < cost) {
        return { success: false, message: 'Bạn không đủ tiền để nâng cấp!' };
      }

      sounds.buildHouse();
      setUpgradesThisTurn(prev => prev + 1);

      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            const current = p.houses[tile.id] || 0;
            if (current >= 5) return p;
            const updated = current + 1;
            addLog(
              `🔨 ${p.name} đã nâng cấp [${tile.name}] lên ${
                updated === 5 ? 'Khách Sạn Hạng Sang' : `${updated} Nhà`
              } (-${cost}đ)`,
              'property'
            );
            return {
              ...p,
              cash: p.cash - cost,
              houses: {
                ...p.houses,
                [tile.id]: updated,
              },
            };
          }
          return p;
        })
      );

      return { success: true };
    },
    [activePlayer, hasMovedThisTurn, upgradesThisTurn, addLog]
  );

  // Mortgage Property
  const mortgageProperty = useCallback(
    (tile: Tile) => {
      if (!activePlayer) return;
      const loan = (tile.price || 0) / 2;

      sounds.cash();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            return {
              ...p,
              cash: p.cash + loan,
              mortgaged: {
                ...p.mortgaged,
                [tile.id]: true,
              },
            };
          }
          return p;
        })
      );

      addLog(`⚠️ ${activePlayer.name} thế chấp [${tile.name}] nhận +${loan}đ`, 'property');
    },
    [activePlayer, addLog]
  );

  // Unmortgage Property
  const unmortgageProperty = useCallback(
    (tile: Tile) => {
      if (!activePlayer) return;
      const buybackCost = Math.round(((tile.price || 0) / 2) * 1.1);
      if (activePlayer.cash < buybackCost) return;

      sounds.cash();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            return {
              ...p,
              cash: p.cash - buybackCost,
              mortgaged: {
                ...p.mortgaged,
                [tile.id]: false,
              },
            };
          }
          return p;
        })
      );

      addLog(`✨ ${activePlayer.name} chuộc lại [${tile.name}] (-${buybackCost}đ)`, 'property');
    },
    [activePlayer, addLog]
  );

  // Buy Consumable Ability at Station
  const buyConsumableAbility = useCallback(
    (ability: ConsumableAbility, discardAbilityId?: string) => {
      if (!activePlayer) return;

      const hasVip = activePlayer.permanentAbilities.includes('perm-station-vip');
      const finalCost = hasVip ? Math.round(ability.cost * 0.5) : ability.cost;
      if (activePlayer.cash < finalCost) return;

      sounds.ability();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            let list = [...p.consumableAbilities];
            if (discardAbilityId) {
              list = list.filter(id => id !== discardAbilityId);
            }
            list.push(ability.id);
            return {
              ...p,
              cash: p.cash - finalCost,
              consumableAbilities: list,
            };
          }
          return p;
        })
      );

      triggerCashTransfer(
        activePlayer.id,
        [],
        finalCost,
        `Mua kỹ năng [${ability.name}] tại Bến xe`
      );
      triggerCharacterEvent(
        activePlayer.id,
        'use_ability',
        'happy',
        'Mua Kỹ Năng Mới',
        `${activePlayer.name} vừa mua kỹ năng [${ability.name}]!`,
        -finalCost
      );

      addLog(
        `⚡ ${activePlayer.name} đã mua Kỹ Năng [${ability.name}] tại Bến Xe (-${finalCost}đ)`,
        'ability'
      );
      setActiveStationModal(null);
    },
    [activePlayer, addLog, triggerCashTransfer, triggerCharacterEvent]
  );

  // Buy Permanent Ability at Utility (Exclusive 1 per player)
  const buyPermanentAbility = useCallback(
    (ability: PermanentAbility) => {
      if (!activePlayer || activePlayer.cash < ability.cost) return;

      // Rule: "1 loại chỉ thuộc về một người, người này mua rồi thì người khác không được mua nữa"
      const isOwnedByOthers = players.some(
        p => p.id !== activePlayer.id && p.permanentAbilities.includes(ability.id)
      );
      if (isOwnedByOthers) {
        addLog(`❌ Năng lực [${ability.name}] đã có người khác sở hữu độc quyền!`, 'info');
        return;
      }

      sounds.ability();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            return {
              ...p,
              cash: p.cash - ability.cost,
              permanentAbilities: [...p.permanentAbilities, ability.id],
            };
          }
          return p;
        })
      );

      triggerCashTransfer(
        activePlayer.id,
        [],
        ability.cost,
        `Mua độc quyền [${ability.name}]`
      );
      triggerCharacterEvent(
        activePlayer.id,
        'use_ability',
        'happy',
        'Sở Hữu Độc Quyền',
        `${activePlayer.name} vừa mua độc quyền vĩnh viễn [${ability.name}]!`,
        -ability.cost
      );

      addLog(
        `👑 ${activePlayer.name} đã mua độc quyền vĩnh viễn [${ability.name}] (-${ability.cost}đ)!`,
        'ability'
      );
      setActiveUtilityModal(null);
    },
    [activePlayer, players, addLog, triggerCashTransfer, triggerCharacterEvent]
  );

  // Sell Permanent Ability back for 1/2 price
  const sellPermanentAbility = useCallback(
    (ability: PermanentAbility) => {
      if (!activePlayer) return;
      const refund = Math.round(ability.cost * 0.5);

      sounds.cash();
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === activePlayer.id) {
            return {
              ...p,
              cash: p.cash + refund,
              permanentAbilities: p.permanentAbilities.filter(id => id !== ability.id),
            };
          }
          return p;
        })
      );

      addLog(`🔄 ${activePlayer.name} bán lại [${ability.name}] nhận +${refund}đ`, 'money');
    },
    [activePlayer, addLog]
  );

  // Use Consumable Ability
  const useConsumableAbility = useCallback(
    (ability: ConsumableAbility, targetPlayer?: Player) => {
      if (!activePlayer) return;

      sounds.ability();

      if (
        (ability.effectType === 'direct_jail_target' ||
          ability.effectType === 'push_neighbor' ||
          ability.effectType === 'send_to_jail_neighbor') &&
        !targetPlayer
      ) {
        setActiveTargetAbility(ability);
        return;
      }

      setPlayers(prev => {
        const next = [...prev];
        const p = next.find(x => x.id === activePlayer.id);
        if (!p) return prev;

        p.consumableAbilities = p.consumableAbilities.filter(id => id !== ability.id);

        switch (ability.effectType) {
          case 'dice_boost':
            setPendingDiceBoost(ability.value || 1);
            addLog(`🚀 [${ability.name}]: +${ability.value} bước cho lần tung xúc xắc tới!`, 'ability');
            break;

          case 'dice_reduce':
            setPendingDiceBoost(-(ability.value || 1));
            addLog(`🛑 [${ability.name}]: -${ability.value} bước cho lần tung xúc xắc tới!`, 'ability');
            break;

          case 'free_tax':
            p.hasFreeTaxNextTurn = true;
            addLog(`🛡️ [${ability.name}]: Bạn sẽ được miễn thuế lần tới!`, 'ability');
            break;

          case 'half_rent':
            p.hasHalfRentDiscountNextTurn = true;
            addLog(`🏷️ [${ability.name}]: Giảm 50% tiền thuê đất lần tới!`, 'ability');
            break;

          case 'direct_jail_target':
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                target.position = 10;
                target.inJail = true;
                target.jailTurns = 0;
                sounds.jail();
                addLog(`🚨 [Trát Bắt Trực Tiếp] ${p.name} tống ${target.name} vào tù!`, 'jail');
              }
            }
            break;

          case 'send_to_jail_neighbor':
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                target.position = 10;
                target.inJail = true;
                target.jailTurns = 0;
                sounds.jail();
                addLog(`⛓️ [Còng Số 8] ${p.name} còng tay tống ${target.name} vào tù!`, 'jail');
              }
            }
            break;

          case 'push_neighbor':
            if (targetPlayer) {
              const target = next.find(x => x.id === targetPlayer.id);
              if (target) {
                const pushSteps = ability.value || 1;
                target.position = (target.position + pushSteps) % 40;
                sounds.step();
                addLog(`💨 [Đẩy Lùi] ${p.name} ép ${target.name} tiến thêm ${pushSteps} bước!`, 'ability');
                setTimeout(() => {
                  resolveTileLanding(target.id, target.position, pushSteps);
                }, 300);
              }
            }
            break;

          case 'destroy_house':
            setPendingDestroyHouseNext(true);
            addLog(`💣 [Lệnh Phá Sập] Kích hoạt! Căn nhà đối thủ tiếp theo sẽ bị phá 1 cấp!`, 'ability');
            break;

          case 'draw_both_cards': {
            const availChance = chanceDeck.filter(c => (c.quantity ?? 1) > 0);
            const availChest = chestDeck.filter(c => (c.quantity ?? 1) > 0);
            const c1 = availChance.length > 0 ? availChance[Math.floor(Math.random() * availChance.length)] : null;
            const c2 = availChest.length > 0 ? availChest[Math.floor(Math.random() * availChest.length)] : null;
            addLog(`✨ [Kép Vận Song Hành] Rút 2 thẻ đặc quyền!`, 'ability');
            if (c1 && c1.actionType !== 'cash_penalty') executeDrawnCard(c1);
            if (c2 && c2.actionType !== 'cash_penalty') executeDrawnCard(c2);
            break;
          }
        }

        return next;
      });

      setActiveTargetAbility(null);
    },
    [activePlayer, chanceDeck, chestDeck, addLog, resolveTileLanding, executeDrawnCard]
  );

  // AI Turn Execution with Pause for Reading Actions
  useEffect(() => {
    if (
      !isPlaying ||
      !activePlayer ||
      !activePlayer.isAI ||
      winner ||
      isMovingStepByStep ||
      activeAbilityNotification ||
      aiActionModalInfo
    )
      return;

    const timer = setTimeout(() => {
      // 1. If in jail: check bail rule
      if (activePlayer.inJail) {
        const bailCheck = canPlayerPayBail(activePlayer);
        if (bailCheck.canPay && activePlayer.aiLevel !== 'easy') {
          payBail();
        }
      }

      // 2. Roll dice
      if (canRoll) {
        rollDice();
      }

      // 3. AI Landing Decision on Property
      else if (activePropertyModalTile && isLandingPropertyAction) {
        const tile = activePropertyModalTile;
        const owner = players.find(p => p.propertiesOwned.includes(tile.id));

        if (!owner) {
          const shouldBuy =
            activePlayer.aiLevel === 'hard'
              ? activePlayer.cash >= (tile.price || 0) + 150
              : activePlayer.aiLevel === 'medium'
              ? activePlayer.cash >= (tile.price || 0) + 250
              : Math.random() > 0.4 && activePlayer.cash >= (tile.price || 0);

          if (shouldBuy) {
            buyProperty(tile);
          } else {
            setActivePropertyModalTile(null);
            setIsLandingPropertyAction(false);
          }
        } else if (owner.id === activePlayer.id) {
          const cost = tile.houseCost || 50;
          const currentH = activePlayer.houses[tile.id] || 0;
          if (currentH < 5 && activePlayer.cash >= cost + 300) {
            buildHouse(tile);
          }
          setActivePropertyModalTile(null);
          setIsLandingPropertyAction(false);
        }
      }

      // 4. AI Station Ability Purchase (pause to show what was bought)
      else if (activeStationModal) {
        if (activePlayer.consumableAbilities.length < 3) {
          const affordable = consumableShop.filter(a => activePlayer.cash >= a.cost + 200);
          if (affordable.length > 0) {
            const chosen = affordable[Math.floor(Math.random() * affordable.length)];
            buyConsumableAbility(chosen);
            setAiActionModalInfo({
              aiPlayer: activePlayer,
              title: 'Đã Mua Kỹ Năng Tại Bến Xe',
              message: `${activePlayer.name} vừa mua kỹ năng [${chosen.name}]: ${chosen.description}`,
              type: 'skill',
            });
          } else {
            setActiveStationModal(null);
          }
        } else {
          setActiveStationModal(null);
        }
      }

      // 5. AI Utility Permanent Purchase
      else if (activeUtilityModal) {
        const unownedAffordable = permanentShop.filter(
          a => !activePlayer.permanentAbilities.includes(a.id) && activePlayer.cash >= a.cost + 400
        );
        if (unownedAffordable.length > 0 && activePlayer.aiLevel !== 'easy') {
          const chosen = unownedAffordable[0];
          buyPermanentAbility(chosen);
          setAiActionModalInfo({
            aiPlayer: activePlayer,
            title: 'Đã Mua Năng Lực Vĩnh Viễn',
            message: `${activePlayer.name} vừa mua vĩnh viễn [${chosen.name}]: ${chosen.description}`,
            type: 'skill',
          });
        }
        setActiveUtilityModal(null);
      }

      // 6. AI Card Drawn (pause to show card content)
      else if (activeDrawnCard) {
        setAiActionModalInfo({
          aiPlayer: activePlayer,
          title: `Rút Thẻ ${activeDrawnCard.deck === 'chance' ? 'CƠ HỘI' : 'KHÍ VẬN'}`,
          message: `"${activeDrawnCard.title}" — ${activeDrawnCard.description}`,
          type: 'card',
        });
        executeDrawnCard(activeDrawnCard);
      }

      // 7. Finish turn
      else if (
        !canRoll &&
        !isRolling &&
        !activePropertyModalTile &&
        !activeDrawnCard &&
        !activeStationModal &&
        !activeUtilityModal
      ) {
        endTurn();
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    activePlayer,
    canRoll,
    isRolling,
    isMovingStepByStep,
    activePropertyModalTile,
    isLandingPropertyAction,
    activeStationModal,
    activeUtilityModal,
    activeDrawnCard,
    activeAbilityNotification,
    aiActionModalInfo,
    winner,
    consumableShop,
    permanentShop,
    players,
    canPlayerPayBail,
    payBail,
    rollDice,
    buyProperty,
    buildHouse,
    buyConsumableAbility,
    buyPermanentAbility,
    executeDrawnCard,
    endTurn,
  ]);

  const updateCardQuantity = useCallback((cardId: string, quantity: number) => {
    const validQty = Math.max(0, quantity);
    setChanceDeck(prev => prev.map(c => (c.id === cardId ? { ...c, quantity: validQty } : c)));
    setChestDeck(prev => prev.map(c => (c.id === cardId ? { ...c, quantity: validQty } : c)));
  }, []);

  const updateConsumableQuantity = useCallback((abilityId: string, quantity: number) => {
    const validQty = Math.max(0, quantity);
    setConsumableShop(prev => prev.map(a => (a.id === abilityId ? { ...a, quantity: validQty } : a)));
  }, []);

  const updatePermanentQuantity = useCallback((abilityId: string, quantity: number) => {
    const validQty = Math.max(0, quantity);
    setPermanentShop(prev => prev.map(a => (a.id === abilityId ? { ...a, quantity: validQty } : a)));
  }, []);

  return {
    isPlaying,
    currentRound,
    turnIndex,
    settings,
    setSettings,
    tiles,
    players,
    activePlayer,
    dice,
    isRolling,
    canRoll,
    hasMovedThisTurn,
    upgradesThisTurn,
    isMovingStepByStep,
    logs,
    winner,
    chanceDeck,
    chestDeck,
    consumableShop,
    permanentShop,
    activePropertyModalTile,
    isLandingPropertyAction,
    activeStationModal,
    activeUtilityModal,
    activeDrawnCard,
    activeTargetAbility,
    activeAbilityNotification,
    aiActionModalInfo,
    setActiveAbilityNotification,
    setAiActionModalInfo,
    setActiveTargetAbility,
    setActivePropertyModalTile,
    setIsLandingPropertyAction,
    setActiveStationModal,
    setActiveUtilityModal,
    setActiveDrawnCard,
    startNewGame,
    rollDice,
    skipMovement,
    endTurn,
    buyProperty,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
    canPlayerPayBail,
    buyConsumableAbility,
    buyPermanentAbility,
    sellPermanentAbility,
    useConsumableAbility,
    executeDrawnCard,
    getBaseBailFee,
    calculateRent,
    setChanceDeck,
    setChestDeck,
    setConsumableShop,
    setPermanentShop,
    updateCardQuantity,
    updateConsumableQuantity,
    updatePermanentQuantity,
    offeredStationAbilities,
    offeredUtilityAbilities,
    cashTransferEvent,
    setCashTransferEvent,
    characterEvent,
    setCharacterEvent,
    triggerCashTransfer,
    triggerCharacterEvent,
  };
};
