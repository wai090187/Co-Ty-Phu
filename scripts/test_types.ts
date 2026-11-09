import { Player } from '../src/types/game';

export interface TestResult {
  category: 'Consumable' | 'Permanent' | 'Investigator';
  id: string;
  name: string;
  description: string;
  passed: boolean;
  error?: string;
}

export type AssertFn = (
  condition: boolean,
  category: TestResult['category'],
  id: string,
  name: string,
  desc: string
) => void;

export function createMockPlayer(id: number, name: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name,
    color: '#ff0000',
    characterId: 'char-1',
    cash: 1500,
    position: 0,
    inJail: false,
    jailTurns: 0,
    getOutOfJailCards: 0,
    propertiesOwned: [],
    houses: {},
    mortgaged: {},
    consumableAbilities: [],
    permanentAbilities: [],
    isAI: false,
    aiLevel: 'medium',
    bankrupt: false,
    ...overrides,
  };
}

