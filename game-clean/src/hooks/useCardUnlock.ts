/**
 * 卡牌解锁Hook
 * 用于处理关卡完成后的卡牌解锁逻辑
 */

import { useCallback } from 'react';
import type { LevelId } from '@/types/levelTypes';
import { unlockCards } from '@/utils/playerCardProgressManager';
import { getLevelById } from '@/data/levelDatabase';

/**
 * 使用卡牌解锁功能
 * @returns 解锁相关函数
 */
export function useCardUnlock() {
  /**
   * 解锁关卡奖励卡牌
   * @param levelId 关卡ID
   * @returns 成功解锁的卡牌数量
   */
  const unlockLevelCards = useCallback((levelId: LevelId): number => {
    const level = getLevelById(levelId);
    if (!level) {
      console.warn(`关卡${levelId}不存在`);
      return 0;
    }

    const cardsToUnlock = level.rewards?.unlockedCards ?? [];
    if (cardsToUnlock.length === 0) {
      return 0;
    }

    const unlockedCount = unlockCards(cardsToUnlock, levelId);
    
    if (unlockedCount > 0) {
      console.log(`关卡${levelId}解锁了${unlockedCount}张新卡牌`);
    }
    
    return unlockedCount;
  }, []);

  /**
   * 获取关卡可解锁的卡牌列表
   * @param levelId 关卡ID
   * @returns 卡牌编码列表
   */
  const getLevelUnlockableCards = useCallback((levelId: LevelId): string[] => {
    const level = getLevelById(levelId);
    return level?.rewards?.unlockedCards ?? [];
  }, []);

  return {
    unlockLevelCards,
    getLevelUnlockableCards,
  };
}
