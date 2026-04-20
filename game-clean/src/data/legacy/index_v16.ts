/**
 * 《道高一丈：数字博弈》v16.0 数据层索引
 * 统一导出所有v16.0重构后的数据
 */

// ==================== 卡牌数据 ====================
export * from './cards_v16';

// ==================== 科技树配置 ====================
export * from './techTree';

// ==================== 版本信息 ====================
export const DATA_VERSION = '16.0.0';
export const DATA_VERSION_DATE = '2026-01-31';

// ==================== 数据验证 ====================

import { Card } from '../types/card_v16';
import { ATTACK_CARDS, DEFENSE_CARDS, CARD_LIBRARY } from './cards_v16';

/**
 * 验证卡牌数据完整性
 */
export function validateCardData(): {
  valid: boolean;
  errors: string[];
  stats: {
    totalCards: number;
    attackCards: number;
    defenseCards: number;
    byTechLevel: Record<number, number>;
    byRarity: Record<string, number>;
  };
} {
  const errors: string[] = [];
  const allCards = [...ATTACK_CARDS, ...DEFENSE_CARDS];
  
  // 检查卡牌代码唯一性
  const cardCodes = new Set<string>();
  for (const card of allCards) {
    if (cardCodes.has(card.card_code)) {
      errors.push(`重复的卡牌代码: ${card.card_code}`);
    }
    cardCodes.add(card.card_code);
  }
  
  // 检查必填字段
  for (const card of allCards) {
    if (!card.card_code) errors.push(`卡牌缺少代码`);
    if (!card.name) errors.push(`${card.card_code} 缺少名称`);
    if (!card.faction) errors.push(`${card.card_code} 缺少阵营`);
    if (!card.techLevel) errors.push(`${card.card_code} 缺少科技等级`);
    if (!card.rarity) errors.push(`${card.card_code} 缺少品质`);
    if (card.difficulty < 1 || card.difficulty > 6) {
      errors.push(`${card.card_code} 判定难度应在1-6之间`);
    }
  }
  
  // 统计
  const byTechLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const byRarity: Record<string, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
  
  for (const card of allCards) {
    byTechLevel[card.techLevel] = (byTechLevel[card.techLevel] || 0) + 1;
    byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    stats: {
      totalCards: allCards.length,
      attackCards: ATTACK_CARDS.length,
      defenseCards: DEFENSE_CARDS.length,
      byTechLevel,
      byRarity
    }
  };
}

/**
 * 获取卡牌数据报告
 */
export function getCardDataReport(): string {
  const validation = validateCardData();
  
  let report = `=== 卡牌数据报告 v${DATA_VERSION} ===\n\n`;
  
  report += `总卡牌数: ${validation.stats.totalCards}\n`;
  report += `攻击方: ${validation.stats.attackCards}\n`;
  report += `防御方: ${validation.stats.defenseCards}\n\n`;
  
  report += `按科技等级分布:\n`;
  for (let i = 1; i <= 5; i++) {
    report += `  T${i}: ${validation.stats.byTechLevel[i]}张\n`;
  }
  
  report += `\n按品质分布:\n`;
  for (const [rarity, count] of Object.entries(validation.stats.byRarity)) {
    report += `  ${rarity}: ${count}张\n`;
  }
  
  if (!validation.valid) {
    report += `\n错误 (${validation.errors.length}个):\n`;
    validation.errors.forEach(err => {
      report += `  - ${err}\n`;
    });
  } else {
    report += `\n✓ 数据验证通过\n`;
  }
  
  return report;
}

// ==================== 导出默认 ====================
export default {
  DATA_VERSION,
  DATA_VERSION_DATE,
  validateCardData,
  getCardDataReport
};
