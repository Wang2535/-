/**
 * 卡组验证工具函数
 * 用于验证玩家卡组配置是否符合规则
 */

import type { Card, CardRarity } from '@/types/legacy/card_v16';
import type { 
  DeckCard, 
  PlayerDeckConfig, 
  DeckValidationResult,
  DeckStatistics 
} from '@/types/playerDeckTypes';
import { 
  MIN_DECK_SIZE, 
  RARITY_MAX_COUNT,
  RARITY_DISPLAY_NAMES 
} from '@/types/playerDeckTypes';
import { getCardByCode } from '@/data/cardDatabase';

/**
 * 根据卡牌稀有度获取最大可携带数量
 * @param rarity 卡牌稀有度
 * @returns 最大可携带数量
 */
export function getMaxCountByRarity(rarity: CardRarity): number {
  return RARITY_MAX_COUNT[rarity] ?? 5;
}

/**
 * 验证卡组配置是否有效
 * @param deck 卡组配置
 * @returns 验证结果
 */
export function validateDeck(deck: PlayerDeckConfig): DeckValidationResult {
  // 1. 检查总数量
  if (deck.totalCount < MIN_DECK_SIZE) {
    return {
      valid: false,
      reason: `卡组至少需要${MIN_DECK_SIZE}张卡牌，当前只有${deck.totalCount}张`,
    };
  }

  // 2. 检查每张卡牌的数量限制
  const violations: NonNullable<DeckValidationResult['details']> = [];
  
  for (const deckCard of deck.cards) {
    const card = getCardByCode(deckCard.cardCode);
    if (!card) {
      violations.push({
        cardCode: deckCard.cardCode,
        cardName: '未知卡牌',
        currentCount: deckCard.count,
        maxCount: 0,
      });
      continue;
    }

    const maxCount = getMaxCountByRarity(card.rarity);
    if (deckCard.count > maxCount) {
      violations.push({
        cardCode: deckCard.cardCode,
        cardName: card.name,
        currentCount: deckCard.count,
        maxCount,
      });
    }
  }

  if (violations.length > 0) {
    const firstViolation = violations[0];
    const rarityName = RARITY_DISPLAY_NAMES[
      getCardByCode(firstViolation.cardCode)?.rarity ?? 'common'
    ];
    
    return {
      valid: false,
      reason: `${firstViolation.cardName}(${rarityName})最多可携带${firstViolation.maxCount}张，当前有${firstViolation.currentCount}张`,
      details: violations,
    };
  }

  return { valid: true };
}

/**
 * 快速验证卡组（仅检查数量）
 * @param deck 卡组配置
 * @returns 是否有效
 */
export function isDeckValid(deck: PlayerDeckConfig): boolean {
  return validateDeck(deck).valid;
}

/**
 * 检查是否可以添加指定数量的卡牌
 * @param deck 当前卡组
 * @param cardCode 卡牌编码
 * @param count 要添加的数量
 * @returns 是否可以添加
 */
export function canAddCard(
  deck: PlayerDeckConfig, 
  cardCode: string, 
  count: number = 1
): boolean {
  const card = getCardByCode(cardCode);
  if (!card) return false;

  const existingCard = deck.cards.find(c => c.cardCode === cardCode);
  const currentCount = existingCard?.count ?? 0;
  const maxCount = getMaxCountByRarity(card.rarity);

  return currentCount + count <= maxCount;
}

/**
 * 获取卡组的统计信息
 * @param deck 卡组配置
 * @returns 统计信息
 */
export function getDeckStatistics(deck: PlayerDeckConfig): DeckStatistics {
  const stats: DeckStatistics = {
    totalCount: deck.totalCount,
    rarityDistribution: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
    typeDistribution: {},
    resourceCost: {
      compute: 0,
      funds: 0,
      information: 0,
      permission: 0,
    },
  };

  for (const deckCard of deck.cards) {
    const card = getCardByCode(deckCard.cardCode);
    if (!card) continue;

    // 统计稀有度分布
    stats.rarityDistribution[card.rarity] += deckCard.count;

    // 统计类型分布
    const type = card.type || '普通';
    stats.typeDistribution[type] = (stats.typeDistribution[type] ?? 0) + deckCard.count;

    // 统计资源消耗
    if (card.cost) {
      stats.resourceCost.compute += (card.cost.compute ?? 0) * deckCard.count;
      stats.resourceCost.funds += (card.cost.funds ?? 0) * deckCard.count;
      stats.resourceCost.information += (card.cost.information ?? 0) * deckCard.count;
      stats.resourceCost.permission += (card.cost.permission ?? 0) * deckCard.count;
    }
  }

  return stats;
}

/**
 * 创建空的卡组配置
 * @returns 空的卡组配置
 */
export function createEmptyDeck(): PlayerDeckConfig {
  return {
    cards: [],
    totalCount: 0,
    lastModified: Date.now(),
  };
}

/**
 * 向卡组中添加卡牌
 * @param deck 当前卡组
 * @param cardCode 卡牌编码
 * @param count 添加数量（默认为1）
 * @returns 新的卡组配置
 */
export function addCardToDeck(
  deck: PlayerDeckConfig, 
  cardCode: string, 
  count: number = 1
): PlayerDeckConfig {
  const card = getCardByCode(cardCode);
  if (!card) return deck;

  const maxCount = getMaxCountByRarity(card.rarity);
  const existingCardIndex = deck.cards.findIndex(c => c.cardCode === cardCode);
  
  const newCards = [...deck.cards];
  
  if (existingCardIndex >= 0) {
    // 已存在，增加数量
    const existingCard = newCards[existingCardIndex];
    const newCount = Math.min(existingCard.count + count, maxCount);
    newCards[existingCardIndex] = { ...existingCard, count: newCount };
  } else {
    // 不存在，添加新卡牌
    const newCount = Math.min(count, maxCount);
    newCards.push({ cardCode, count: newCount });
  }

  return {
    cards: newCards,
    totalCount: newCards.reduce((sum, c) => sum + c.count, 0),
    lastModified: Date.now(),
  };
}

/**
 * 从卡组中移除卡牌
 * @param deck 当前卡组
 * @param cardCode 卡牌编码
 * @param count 移除数量（默认为1，-1表示全部移除）
 * @returns 新的卡组配置
 */
export function removeCardFromDeck(
  deck: PlayerDeckConfig, 
  cardCode: string, 
  count: number = 1
): PlayerDeckConfig {
  const existingCardIndex = deck.cards.findIndex(c => c.cardCode === cardCode);
  if (existingCardIndex < 0) return deck;

  const newCards = [...deck.cards];
  const existingCard = newCards[existingCardIndex];
  
  if (count === -1 || existingCard.count <= count) {
    // 全部移除
    newCards.splice(existingCardIndex, 1);
  } else {
    // 减少数量
    newCards[existingCardIndex] = { 
      ...existingCard, 
      count: existingCard.count - count 
    };
  }

  return {
    cards: newCards,
    totalCount: newCards.reduce((sum, c) => sum + c.count, 0),
    lastModified: Date.now(),
  };
}

/**
 * 调整卡组中卡牌的数量
 * @param deck 当前卡组
 * @param cardCode 卡牌编码
 * @param newCount 新的数量
 * @returns 新的卡组配置
 */
export function setCardCount(
  deck: PlayerDeckConfig, 
  cardCode: string, 
  newCount: number
): PlayerDeckConfig {
  const card = getCardByCode(cardCode);
  if (!card) return deck;

  const maxCount = getMaxCountByRarity(card.rarity);
  const clampedCount = Math.max(0, Math.min(newCount, maxCount));
  
  const existingCardIndex = deck.cards.findIndex(c => c.cardCode === cardCode);
  const newCards = [...deck.cards];

  if (clampedCount === 0) {
    // 数量为0，移除卡牌
    if (existingCardIndex >= 0) {
      newCards.splice(existingCardIndex, 1);
    }
  } else if (existingCardIndex >= 0) {
    // 更新现有卡牌数量
    newCards[existingCardIndex] = { 
      ...newCards[existingCardIndex], 
      count: clampedCount 
    };
  } else {
    // 添加新卡牌
    newCards.push({ cardCode, count: clampedCount });
  }

  return {
    cards: newCards,
    totalCount: newCards.reduce((sum, c) => sum + c.count, 0),
    lastModified: Date.now(),
  };
}

/**
 * 重置卡组（清空所有卡牌）
 * @returns 空的卡组配置
 */
export function resetDeck(): PlayerDeckConfig {
  return createEmptyDeck();
}

/**
 * 获取卡组的验证状态文本
 * @param deck 卡组配置
 * @returns 状态文本
 */
export function getDeckStatusText(deck: PlayerDeckConfig): string {
  const remaining = MIN_DECK_SIZE - deck.totalCount;
  
  if (remaining > 0) {
    return `还需${remaining}张卡牌`;
  }
  
  const validation = validateDeck(deck);
  if (!validation.valid) {
    return validation.reason ?? '卡组配置无效';
  }
  
  return `卡组完整 (${deck.totalCount}张)`;
}

/**
 * 获取卡组完成进度百分比
 * @param deck 卡组配置
 * @returns 进度百分比（0-100）
 */
export function getDeckProgressPercent(deck: PlayerDeckConfig): number {
  return Math.min(100, (deck.totalCount / MIN_DECK_SIZE) * 100);
}
