// 完整设想中要求的各层级技能获取概率表
import type { TierProbabilityRow } from '../types/skill.types';

export const SKILL_PROBABILITIES: Record<number, TierProbabilityRow> = {
  1: { common: 0.50, good: 0.30, rare: 0.15, epic: 0.04, legendary: 0.01 }, // 第1-2层
  2: { common: 0.50, good: 0.30, rare: 0.15, epic: 0.04, legendary: 0.01 },
  3: { common: 0.40, good: 0.30, rare: 0.20, epic: 0.08, legendary: 0.02 }, // 第3-4层
  4: { common: 0.40, good: 0.30, rare: 0.20, epic: 0.08, legendary: 0.02 },
  5: { common: 0.30, good: 0.25, rare: 0.25, epic: 0.15, legendary: 0.05 }, // 第5-6层
  6: { common: 0.30, good: 0.25, rare: 0.25, epic: 0.15, legendary: 0.05 },
  7: { common: 0.20, good: 0.25, rare: 0.30, epic: 0.18, legendary: 0.07 }, // 第7-8层
  8: { common: 0.20, good: 0.25, rare: 0.30, epic: 0.18, legendary: 0.07 },
  9: { common: 0.10, good: 0.20, rare: 0.35, epic: 0.25, legendary: 0.10 }, // 第9层
};

export const SKILL_QUALITY_COLORS: Record<string, string> = {
  common: '#808080',
  good: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FFC107',
};

export const SKILL_QUALITY_NAMES: Record<string, string> = {
  common: '普通',
  good: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const DEFAULT_SKILL_CONFIG = {
  maxActiveSkills: 3,
  enableSkillStorage: true,
};
