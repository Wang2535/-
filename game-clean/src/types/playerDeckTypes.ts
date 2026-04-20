/**
 * 玩家卡组系统类型定义
 * 用于关卡模式玩家卡牌库配置功能
 */

import type { CardRarity } from './legacy/card_v16';

/**
 * 卡组中的单张卡牌
 */
export interface DeckCard {
  /** 卡牌唯一编码 */
  cardCode: string;
  /** 卡牌数量 */
  count: number;
}

/**
 * 玩家卡组配置
 */
export interface PlayerDeckConfig {
  /** 卡组中的卡牌列表 */
  cards: DeckCard[];
  /** 卡牌总数 */
  totalCount: number;
  /** 最后修改时间戳 */
  lastModified: number;
}

/**
 * 卡牌解锁状态
 */
export interface CardUnlockStatus {
  /** 卡牌编码 */
  cardCode: string;
  /** 是否已解锁 */
  isUnlocked: boolean;
  /** 解锁时间戳 */
  unlockedAt: number;
  /** 解锁来源关卡ID */
  unlockedByLevel: string;
}

/**
 * 玩家卡牌进度
 */
export interface PlayerCardProgress {
  /** 已解锁卡牌列表 */
  unlockedCards: CardUnlockStatus[];
  /** 卡牌总数 */
  totalCards: number;
  /** 玩家统一卡组配置（所有关卡共用） */
  playerDeck: PlayerDeckConfig | null;
  /** 各关卡卡组配置（向后兼容，已弃用） */
  deckConfigs: Record<string, PlayerDeckConfig>;
  /** 数据版本号（用于迁移） */
  version: number;
}

/**
 * 卡组验证结果
 */
export interface DeckValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误原因（验证失败时） */
  reason?: string;
  /** 详细错误信息 */
  details?: {
    /** 卡牌编码 */
    cardCode: string;
    /** 卡牌名称 */
    cardName: string;
    /** 当前数量 */
    currentCount: number;
    /** 最大允许数量 */
    maxCount: number;
  }[];
}

/**
 * 卡组统计信息
 */
export interface DeckStatistics {
  /** 卡牌总数 */
  totalCount: number;
  /** 各稀有度卡牌数量分布 */
  rarityDistribution: Record<CardRarity, number>;
  /** 各类型卡牌数量分布 */
  typeDistribution: Record<string, number>;
  /** 资源消耗统计 */
  resourceCost: {
    compute: number;
    funds: number;
    information: number;
    permission: number;
  };
}

/**
 * 卡牌库配置界面状态
 */
export interface DeckBuilderState {
  /** 当前卡组配置 */
  currentDeck: PlayerDeckConfig;
  /** 可用卡牌列表（已解锁） */
  availableCards: string[];
  /** 是否已修改（未保存） */
  isModified: boolean;
  /** 验证结果 */
  validationResult: DeckValidationResult;
  /** 选中的卡牌编码（用于详情展示） */
  selectedCardCode: string | null;
}

/**
 * 卡牌稀有度配置
 */
export interface RarityConfig {
  /** 稀有度等级 */
  rarity: CardRarity;
  /** 最大可携带数量 */
  maxCount: number;
  /** 显示名称 */
  displayName: string;
  /** 颜色主题 */
  color: string;
}

/**
 * 本地存储键名常量
 */
export const STORAGE_KEYS = {
  /** 玩家卡牌进度 */
  CARD_PROGRESS: 'dadong_game_card_progress',
  /** 卡组配置（带关卡ID占位符） */
  DECK_CONFIG: (levelId: string) => `dadong_game_deck_config_${levelId}`,
} as const;

/**
 * 数据版本号（用于迁移）
 */
export const DATA_VERSION = 1;

/**
 * 卡组最小容量
 */
export const MIN_DECK_SIZE = 15;

/**
 * 稀有度数量限制映射
 * legendary=1, epic=2, rare=3, uncommon=4, common=5
 */
export const RARITY_MAX_COUNT: Record<CardRarity, number> = {
  legendary: 1,
  epic: 2,
  rare: 3,
  uncommon: 4,
  common: 5,
};

/**
 * 稀有度显示名称映射
 */
export const RARITY_DISPLAY_NAMES: Record<CardRarity, string> = {
  legendary: '传说',
  epic: '史诗',
  rare: '稀有',
  uncommon: '优秀',
  common: '普通',
};

/**
 * 稀有度颜色映射
 */
export const RARITY_COLORS: Record<CardRarity, string> = {
  legendary: '#FFD700', // 金色
  epic: '#A855F7',      // 紫色
  rare: '#3B82F6',      // 蓝色
  uncommon: '#22C55E',  // 绿色
  common: '#9CA3AF',    // 灰色
};
