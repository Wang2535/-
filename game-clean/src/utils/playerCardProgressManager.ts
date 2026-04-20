/**
 * 玩家卡牌进度管理器
 * 负责管理卡牌解锁状态和卡组配置的持久化
 */

import type { 
  PlayerCardProgress, 
  CardUnlockStatus, 
  PlayerDeckConfig 
} from '@/types/playerDeckTypes';
import { 
  STORAGE_KEYS, 
  DATA_VERSION
} from '@/types/playerDeckTypes';
import { createEmptyDeck } from '@/utils/deckValidation';
import { getCardByCode } from '@/data/cardDatabase';

/**
 * 初始解锁的卡牌列表（第一关开始前即可使用）
 * 这些卡牌来自levelDatabase.ts中的INITIAL_UNLOCKED_CARDS
 */
export const INITIAL_UNLOCKED_CARDS = [
  'NF0-1T1', // 防火墙部署
  'NI0-1T1', // 入侵检测
  'NF0-4T1', // 补丁管理
  'NF0-6T1', // 备份恢复
  'NI0-5T2', // 行为分析
  'NI0-2T1', // 日志监控
  'NE0-2T1', // 紧急补给
  'NE0-1T1', // 资源调配
  // 新增：防御/进攻标记类基础卡牌
  'NF0-7T1', // 加固防线
  'NF0-8T1', // 安全巡逻
  'NF0-9T1', // 应急响应
  'NF0-10T1', // 威胁清除
  'NF0-11T1', // 漏洞修补
  'NF0-12T1', // 系统净化
];

/**
 * 加载玩家卡牌进度
 * @returns 玩家卡牌进度，如果不存在则返回默认值
 */
export function loadCardProgress(): PlayerCardProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CARD_PROGRESS);
    if (!data) {
      return createDefaultProgress();
    }

    const progress: PlayerCardProgress = JSON.parse(data);
    
    // 数据版本检查和迁移
    if (progress.version !== DATA_VERSION) {
      return migrateProgress(progress);
    }

    // 即使版本相同，也检查并清理攻击型卡牌（确保LV90等关卡只解锁2张）
    const cleanedProgress = cleanAttackCards(progress);
    if (cleanedProgress.unlockedCards.length !== progress.unlockedCards.length) {
      saveCardProgress(cleanedProgress);
      return cleanedProgress;
    }

    return progress;
  } catch (error) {
    console.error('加载卡牌进度失败:', error);
    return createDefaultProgress();
  }
}

/**
 * 清理攻击型卡牌（确保玩家只拥有防御型卡牌）
 * @param progress 玩家卡牌进度
 * @returns 清理后的进度
 */
function cleanAttackCards(progress: PlayerCardProgress): PlayerCardProgress {
  const attackCardsToRemove = [
    // LV80-LV90
    'DEF080-1T5', 'DEF081-1T5', 'DEF082-1T5', 'DEF083-1T5', 'DEF084-1T5',
    'DEF085-1T5', 'DEF086-1T5', 'DEF087-1T5', 'DEF088-1T5', 'DEF089-1T5', 'DEF090-1T5',
    // LV91-LV110
    'DEF091-1T5', 'DEF092-1T5', 'DEF093-1T5', 'DEF094-1T5', 'DEF095-1T5',
    'DEF096-1T5', 'DEF097-1T5', 'DEF098-1T5', 'DEF099-1T5', 'DEF100-1T5',
    'DEF101-1T5', 'DEF102-1T5', 'DEF103-1T5', 'DEF104-1T5', 'DEF105-1T5',
    'DEF106-1T5', 'DEF107-1T5', 'DEF108-1T5', 'DEF109-1T5', 'DEF110-1T5',
  ];
  
  const cleaned: PlayerCardProgress = {
    ...progress,
    unlockedCards: progress.unlockedCards.filter(
      card => !attackCardsToRemove.includes(card.cardCode)
    ),
  };
  
  cleaned.totalCards = cleaned.unlockedCards.length;
  
  return cleaned;
}

/**
 * 保存玩家卡牌进度
 * @param progress 玩家卡牌进度
 */
export function saveCardProgress(progress: PlayerCardProgress): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CARD_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('保存卡牌进度失败:', error);
  }
}

/**
 * 创建默认的卡牌进度
 * @returns 默认进度
 */
function createDefaultProgress(): PlayerCardProgress {
  return {
    unlockedCards: [],
    totalCards: 0,
    playerDeck: null,
    deckConfigs: {}, // 保留向后兼容
    version: DATA_VERSION,
  };
}

/**
 * 迁移旧版本数据
 * @param oldProgress 旧版本进度
 * @returns 迁移后的进度
 */
function migrateProgress(oldProgress: PlayerCardProgress): PlayerCardProgress {
  // 迁移逻辑：将旧的deckConfigs迁移到新的playerDeck格式
  const migrated: PlayerCardProgress = {
    ...oldProgress,
    playerDeck: oldProgress.playerDeck ?? null,
    version: DATA_VERSION,
  };
  
  // 如果存在旧的deckConfigs但没有playerDeck，尝试迁移第一个配置
  if (!migrated.playerDeck && oldProgress.deckConfigs && Object.keys(oldProgress.deckConfigs).length > 0) {
    const firstConfig = Object.values(oldProgress.deckConfigs)[0];
    if (firstConfig) {
      migrated.playerDeck = firstConfig;
    }
  }
  
  // 迁移：移除LV80-LV90和LV91-LV110的-1T5攻击型卡牌（这些现在属于敌人）
  const attackCardsToRemove = [
    // LV80-LV90
    'DEF080-1T5', 'DEF081-1T5', 'DEF082-1T5', 'DEF083-1T5', 'DEF084-1T5',
    'DEF085-1T5', 'DEF086-1T5', 'DEF087-1T5', 'DEF088-1T5', 'DEF089-1T5', 'DEF090-1T5',
    // LV91-LV110
    'DEF091-1T5', 'DEF092-1T5', 'DEF093-1T5', 'DEF094-1T5', 'DEF095-1T5',
    'DEF096-1T5', 'DEF097-1T5', 'DEF098-1T5', 'DEF099-1T5', 'DEF100-1T5',
    'DEF101-1T5', 'DEF102-1T5', 'DEF103-1T5', 'DEF104-1T5', 'DEF105-1T5',
    'DEF106-1T5', 'DEF107-1T5', 'DEF108-1T5', 'DEF109-1T5', 'DEF110-1T5',
  ];
  
  const originalCount = migrated.unlockedCards.length;
  migrated.unlockedCards = migrated.unlockedCards.filter(
    card => !attackCardsToRemove.includes(card.cardCode)
  );
  const removedCount = originalCount - migrated.unlockedCards.length;
  
  if (removedCount > 0) {
    console.log(`[CardProgress] 数据迁移：移除了${removedCount}张攻击型卡牌（已转为敌人专属）`);
    migrated.totalCards = migrated.unlockedCards.length;
  }
  
  saveCardProgress(migrated);
  return migrated;
}

/**
 * 解锁指定卡牌
 * @param cardCode 卡牌编码
 * @param levelId 解锁来源关卡ID
 * @returns 是否成功解锁（如果已解锁则返回false）
 */
export function unlockCard(cardCode: string, levelId: string): boolean {
  const progress = loadCardProgress();
  
  // 检查是否已解锁
  const existingIndex = progress.unlockedCards.findIndex(
    c => c.cardCode === cardCode
  );
  
  if (existingIndex >= 0) {
    return false; // 已解锁
  }

  // 添加解锁记录
  progress.unlockedCards.push({
    cardCode,
    isUnlocked: true,
    unlockedAt: Date.now(),
    unlockedByLevel: levelId,
  });

  // 更新总数
  progress.totalCards = progress.unlockedCards.length;
  
  saveCardProgress(progress);
  return true;
}

/**
 * 批量解锁卡牌
 * @param cardCodes 卡牌编码列表
 * @param levelId 解锁来源关卡ID
 * @returns 成功解锁的卡牌数量
 */
export function unlockCards(cardCodes: string[], levelId: string): number {
  let unlockedCount = 0;
  
  for (const cardCode of cardCodes) {
    if (unlockCard(cardCode, levelId)) {
      unlockedCount++;
    }
  }
  
  return unlockedCount;
}

/**
 * 检查卡牌是否已解锁
 * @param cardCode 卡牌编码
 * @returns 是否已解锁
 */
export function isCardUnlocked(cardCode: string): boolean {
  const progress = loadCardProgress();
  return progress.unlockedCards.some(c => c.cardCode === cardCode);
}

/**
 * 获取已解锁的卡牌列表（过滤掉攻击型卡牌）
 * @returns 已解锁卡牌编码列表（仅防御型）
 */
export function getUnlockedCardCodes(): string[] {
  const progress = loadCardProgress();
  return progress.unlockedCards
    .map(c => c.cardCode)
    .filter(cardCode => {
      const card = getCardByCode(cardCode);
      // 只返回防御型卡牌（非攻击型）
      return card && card.faction !== 'attack';
    });
}

/**
 * 获取卡牌解锁状态
 * @param cardCode 卡牌编码
 * @returns 解锁状态，未解锁返回null
 */
export function getCardUnlockStatus(cardCode: string): CardUnlockStatus | null {
  const progress = loadCardProgress();
  return progress.unlockedCards.find(c => c.cardCode === cardCode) ?? null;
}

/**
 * 获取解锁统计信息
 * @returns 解锁统计
 */
export function getUnlockStatistics(): { unlocked: number; total: number } {
  const progress = loadCardProgress();
  return {
    unlocked: progress.unlockedCards.length,
    total: progress.totalCards,
  };
}

/**
 * 加载玩家的统一卡组配置
 * @returns 卡组配置，不存在返回null
 */
export function loadPlayerDeck(): PlayerDeckConfig | null {
  const progress = loadCardProgress();
  return progress.playerDeck ?? null;
}

/**
 * 保存玩家的统一卡组配置
 * @param deck 卡组配置
 */
export function savePlayerDeck(deck: PlayerDeckConfig): void {
  const progress = loadCardProgress();
  progress.playerDeck = deck;
  saveCardProgress(progress);
}

/**
 * 检查玩家是否已配置卡组
 * @returns 是否已配置
 */
export function hasPlayerDeck(): boolean {
  const progress = loadCardProgress();
  return progress.playerDeck !== null && progress.playerDeck !== undefined;
}

/**
 * 获取或创建默认卡组配置
 * @returns 卡组配置（如果不存在则返回空卡组）
 */
export function getOrCreatePlayerDeck(): PlayerDeckConfig {
  return loadPlayerDeck() ?? createEmptyDeck();
}

/**
 * 删除玩家的卡组配置
 */
export function deletePlayerDeck(): void {
  const progress = loadCardProgress();
  progress.playerDeck = null;
  saveCardProgress(progress);
}

/**
 * 初始化默认解锁卡牌（游戏开始时调用）
 * 确保 INITIAL_UNLOCKED_CARDS 中的所有卡牌都被解锁
 */
export function initializeDefaultCards(): void {
  const progress = loadCardProgress();
  
  let addedCount = 0;
  
  // 确保所有初始卡牌都被解锁
  for (const cardCode of INITIAL_UNLOCKED_CARDS) {
    const existingIndex = progress.unlockedCards.findIndex(
      c => c.cardCode === cardCode
    );
    
    if (existingIndex < 0) {
      // 卡牌未解锁，添加到解锁列表
      progress.unlockedCards.push({
        cardCode,
        isUnlocked: true,
        unlockedAt: Date.now(),
        unlockedByLevel: 'initial',
      });
      addedCount++;
    }
  }

  if (addedCount > 0) {
    progress.totalCards = progress.unlockedCards.length;
    saveCardProgress(progress);
    console.log(`[CardProgress] 已初始化默认解锁卡牌: ${addedCount}张`);
  } else {
    console.log(`[CardProgress] 所有初始卡牌已解锁，无需添加`);
  }
}

/**
 * 清除所有卡牌进度数据（重置功能）
 */
export function clearAllCardProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CARD_PROGRESS);
    console.log('[CardProgress] 已清除所有卡牌进度数据');
  } catch (error) {
    console.error('清除卡牌进度失败:', error);
  }
}

/**
 * 导出卡牌进度数据（用于备份）
 * @returns JSON字符串
 */
export function exportCardProgress(): string {
  const progress = loadCardProgress();
  return JSON.stringify(progress, null, 2);
}

/**
 * 导入卡牌进度数据（用于恢复）
 * @param data JSON字符串
 * @returns 是否成功
 */
export function importCardProgress(data: string): boolean {
  try {
    const progress: PlayerCardProgress = JSON.parse(data);
    
    // 验证数据结构
    if (!progress.unlockedCards || !Array.isArray(progress.unlockedCards)) {
      throw new Error('无效的数据格式');
    }
    
    // 更新版本号
    progress.version = DATA_VERSION;
    
    saveCardProgress(progress);
    return true;
  } catch (error) {
    console.error('导入卡牌进度失败:', error);
    return false;
  }
}

// ==================== 向后兼容的API ====================
// 以下API保留用于向后兼容，但内部实现已改为使用统一卡组配置

/**
 * @deprecated 使用 loadPlayerDeck 替代
 * 加载指定关卡的卡组配置
 */
export function loadDeckConfig(levelId: string): PlayerDeckConfig | null {
  // 返回统一的玩家卡组配置
  return loadPlayerDeck();
}

/**
 * @deprecated 使用 savePlayerDeck 替代
 * 保存指定关卡的卡组配置
 */
export function saveDeckConfig(levelId: string, deck: PlayerDeckConfig): void {
  // 保存到统一的玩家卡组配置
  savePlayerDeck(deck);
}

/**
 * @deprecated 使用 hasPlayerDeck 替代
 * 检查指定关卡是否已配置卡组
 */
export function hasDeckConfig(levelId: string): boolean {
  return hasPlayerDeck();
}

/**
 * @deprecated 使用 deletePlayerDeck 替代
 * 删除指定关卡的卡组配置
 */
export function deleteDeckConfig(levelId: string): void {
  deletePlayerDeck();
}
