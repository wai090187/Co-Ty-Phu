/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import {
  Player,
  Tile,
  GameSettings,
  SpecialInvestigatorState,
  Card,
} from '../../../types/game';
import { sounds } from '../../../utils/soundEngine';
import {
  ALL_INVESTIGATOR_ABILITIES,
  pickNextInvestigatorAbility,
} from '../../../data/investigatorAbilities';
import { executeInvestigatorAbility } from '../utils/investigatorAbilityHandlers';

interface InvestigatorContext {
  settings: GameSettings;
  currentRound: number;
  tiles: Tile[];
  players: Player[];
  chanceDeck: Card[];
  chestDeck: Card[];
  investigator: SpecialInvestigatorState;
  setInvestigator: React.Dispatch<React.SetStateAction<SpecialInvestigatorState>>;
  isInvestigatorTurn: boolean;
  setIsInvestigatorTurn: (v: boolean) => void;
  isInvestigatorMoving: boolean;
  setIsInvestigatorMoving: (v: boolean) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addLog: (msg: string, type?: any) => void;
  triggerCashTransfer: (from: number, to: number[], amount: number, desc: string) => void;
  triggerCharacterEvent: (e: any) => void;
  setAiActionModalInfo: (info: any) => void;
  setActiveDrawnCard?: (card: Card | null) => void;
  onInvestigatorTurnComplete: () => void;
}

export const useInvestigatorTurn = (ctx: InvestigatorContext) => {
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ctx.isInvestigatorTurn) {
      isExecutingRef.current = false;
      return;
    }
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    // Safety timeout in case turn gets stuck
    safetyTimerRef.current = setTimeout(() => {
      if (isExecutingRef.current) {
        console.warn('Investigator turn safety timeout reached. Concluding turn.');
        if (moveTimerRef.current) clearInterval(moveTimerRef.current);
        isExecutingRef.current = false;
        ctxRef.current.setIsInvestigatorMoving(false);
        ctxRef.current.setIsInvestigatorTurn(false);
        ctxRef.current.onInvestigatorTurnComplete();
      }
    }, 15000);

    // 1. Roll dice for Investigator (2d6)
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const totalSteps = d1 + d2;

    sounds.rollDice();
    ctxRef.current.addLog(
      `🕵️‍♂️ [ĐIỀU TRA VIÊN] Bắt đầu lượt tuần tra, tung được [${d1}][${d2}] (Tổng: ${totalSteps} bước)`,
      'ability'
    );

    // 2. Step-by-step movement
    let remainingSteps = totalSteps;
    ctxRef.current.setIsInvestigatorMoving(true);

    const speedMap = { slow: 360, normal: 200, fast: 100 };
    const stepInterval =
      speedMap[ctxRef.current.settings.moveSpeed as 'slow' | 'normal' | 'fast'] || 200;

    moveTimerRef.current = setInterval(() => {
      remainingSteps -= 1;

      ctxRef.current.setInvestigator(prev => {
        const oldPos = prev.position;
        const newPos = (oldPos + 1) % 40;
        sounds.step();

        let laps = prev.lapsCompleted;
        let currentAbilityId = prev.currentAbilityId;
        let usedAbilityIds = [...prev.usedAbilityIds];

        // Đi qua hoặc dừng trúng Trạm Khởi Hành (ô 0)
        if (newPos === 0) {
          laps += 1;
          const cycleRounds = Math.max(
            1,
            ctxRef.current.settings.investigatorAbilityChangeRounds || 1
          );
          if (laps % cycleRounds === 0) {
            const next = pickNextInvestigatorAbility(usedAbilityIds);
            currentAbilityId = next.ability.id;
            usedAbilityIds = next.nextUsedIds;

            sounds.ability();
            ctxRef.current.addLog(
              `✨ [ĐIỀU TRA VIÊN - ĐỔI NĂNG LỰC] Đã đi qua Khởi Hành (${laps} vòng)! Kích hoạt năng lực ngẫu nhiên mới: [${next.ability.name}] - ${next.ability.shortDesc}`,
              'ability'
            );
          }
        }

        return {
          ...prev,
          position: newPos,
          lapsCompleted: laps,
          currentAbilityId,
          usedAbilityIds,
          lastDiceRoll: [d1, d2],
        };
      });

      if (remainingSteps <= 0) {
        if (moveTimerRef.current) clearInterval(moveTimerRef.current);
        ctxRef.current.setIsInvestigatorMoving(false);


        // 3. Resolve landing ability
        setTimeout(() => {
          ctxRef.current.setInvestigator(currentInv => {
            const landedTile = ctxRef.current.tiles[currentInv.position];
            const activeAbility =
              ALL_INVESTIGATOR_ABILITIES.find(a => a.id === currentInv.currentAbilityId) ||
              ALL_INVESTIGATOR_ABILITIES[0];

            ctxRef.current.addLog(
              `🕵️‍♂️ [ĐIỀU TRA VIÊN] Dừng chân tại [${landedTile.name}]. Thi triển năng lực: [${activeAbility.name}]`,
              'ability'
            );

            // Execute ability on players and tile
            ctxRef.current.setPlayers(prevPlayers => {
              const nextPlayers = prevPlayers.map(p => ({
                ...p,
                propertiesOwned: [...(p.propertiesOwned || [])],
                permanentAbilities: [...(p.permanentAbilities || [])],
                consumableAbilities: [...(p.consumableAbilities || [])],
                houses: { ...(p.houses || {}) },
                mortgaged: { ...(p.mortgaged || {}) },
              }));
              const activeSurvivors = nextPlayers.filter(p => !p.bankrupt);
              const invPos = currentInv.position;

              executeInvestigatorAbility({
                activeAbility,
                invPos,
                landedTile,
                nextPlayers,
                activeSurvivors,
                tiles: ctxRef.current.tiles,
                chanceDeck: ctxRef.current.chanceDeck,
                chestDeck: ctxRef.current.chestDeck,
                settings: ctxRef.current.settings,
                triggerCashTransfer: ctxRef.current.triggerCashTransfer,
                addLog: ctxRef.current.addLog,
                setActiveDrawnCard: ctxRef.current.setActiveDrawnCard,
                sounds,
              });

              return nextPlayers;
            });

            // Show announcement modal
            ctxRef.current.setAiActionModalInfo({
              aiPlayer: {
                id: 99,
                name: 'Điều Tra Viên Đặc Biệt',
                characterId: 'cong-tu',
                color: '#1e293b',
              } as any,
              title: `🕵️‍♂️ Tuần Tra: ${activeAbility.name}`,
              message: `Điều Tra Viên vừa dừng tại [${landedTile.name}]. ${activeAbility.description}`,
              type: 'skill',
            });

            // 4. Conclude turn
            setTimeout(() => {
              if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
              isExecutingRef.current = false;
              ctxRef.current.setIsInvestigatorTurn(false);
              ctxRef.current.onInvestigatorTurnComplete();
            }, 1200);

            return currentInv;
          });
        }, 350);
      }
    }, stepInterval);

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [ctx.isInvestigatorTurn]);
};
