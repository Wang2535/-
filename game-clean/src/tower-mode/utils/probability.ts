import type { SkillQuality, TierProbabilityRow } from '../types';

/**
 * 加权随机抽取
 * @param items 候选项数组
 * @param weights 对应权重数组（需与items同长）
 * @param rng 随机数生成器（可选，默认Math.random）
 * @returns 选中的项
 */
export function weightedRandom<T>(items: T[], weights: number[], rng?: () => number): T {
  if (items.length !== weights.length) throw new Error('Length mismatch');
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = (rng ?? Math.random)() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * 概率判定
 * @param probability 0-100 的概率值
 * @param rng 随机数生成器（可选）
 * @returns 是否命中
 */
export function rollChance(probability: number, rng?: () => number): boolean {
  const roll = (rng ?? Math.random)() * 100;
  return roll < probability;
}

/**
 * 根据层级和概率表获取技能品质
 * @param tier 层级
 * @param probTable 概率表
 * @param rng 随机数生成器（可选）
 * @returns 技能品质
 */
export function rollSkillQuality(tier: number, probTable: Record<number, TierProbabilityRow>, rng?: () => number): SkillQuality {
  const row = probTable[tier] ?? probTable[9];
  const qualities: SkillQuality[] = ['common', 'good', 'rare', 'epic', 'legendary'];
  const weights = [row.common, row.good, row.rare, row.epic, row.legendary];
  return weightedRandom(qualities, weights, rng);
}

/**
 * 从数组中随机抽取N个不重复元素
 * @param array 源数组
 * @param n 抽取数量
 * @param rng 随机数生成器（可选）
 * @returns 抽取结果数组
 */
export function pickN<T>(array: T[], n: number, rng?: () => number): T[] {
  const shuffled = shuffle([...array], rng);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

import { shuffle } from './array';
