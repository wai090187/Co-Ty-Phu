import { SetupPlayerConfig } from '../../../types/game';

export const DEFAULT_PLAYER_COLORS = [
  '#DC2626', // Red
  '#2563EB', // Blue
  '#16A34A', // Green
  '#D97706', // Amber/Yellow
  '#9333EA', // Purple
  '#0891B2', // Cyan
];

export const INITIAL_PLAYER_CONFIGS: SetupPlayerConfig[] = [
  {
    name: 'Người Chơi 1',
    isAI: false,
    characterId: 'cong-tu',
    color: DEFAULT_PLAYER_COLORS[0],
  },
  {
    name: 'AI 2 (Trung Bình)',
    isAI: true,
    aiLevel: 'medium',
    characterId: 'co-ba',
    color: DEFAULT_PLAYER_COLORS[1],
  },
  {
    name: 'AI 3 (Khó)',
    isAI: true,
    aiLevel: 'hard',
    characterId: 'tieu-thu-gothic',
    color: DEFAULT_PLAYER_COLORS[2],
  },
  {
    name: 'AI 4 (Dễ)',
    isAI: true,
    aiLevel: 'easy',
    characterId: 'kiem-si-anime',
    color: DEFAULT_PLAYER_COLORS[3],
  },
];
