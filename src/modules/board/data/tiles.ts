import { Tile } from '../../../types/game';
import { BOTTOM_TILES } from './bottomTiles';
import { LEFT_TILES } from './leftTiles';
import { TOP_TILES } from './topTiles';
import { RIGHT_TILES } from './rightTiles';

export const TILES: Tile[] = [
  ...BOTTOM_TILES,
  ...LEFT_TILES,
  ...TOP_TILES,
  ...RIGHT_TILES,
];

export { BOTTOM_TILES, LEFT_TILES, TOP_TILES, RIGHT_TILES };
