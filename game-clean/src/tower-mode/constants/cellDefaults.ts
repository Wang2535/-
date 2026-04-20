import type { CellState } from '../types';

export const CELL_CONFIG = {
  DEFAULT_STATE: 'locked' as CellState,
  BOSS_HP_MULTIPLIER: 3,
  BOSS_NEW_SKILL_COUNT: 1,
  BATTLE_REWARD_CARD_COUNT: 1,
  CHANCE_VISIT_LIMIT: 0,
  BOOKSTORE_VISIT_LIMIT: 0,
  SKILL_GRANT_COUNT: 1,
} as const;
