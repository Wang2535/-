/**
 * 关卡胜利条件检测系统
 * 实现方案A：三选二胜利条件
 * 
 * 方案A：防御反击型胜利条件
 * 玩家需要满足以下三个条件中的任意两个即可达成胜利：
 * 1. 成功遏制：至少2个区域的敌方标记总数降至0
 * 2. 知识普及：大东使用"安全知识讲解"技能至少3次
 * 3. 技术免疫：至少3个区域完成"签名接种"（vaccinated标记）
 */

import type { LevelGameState } from '@/types/levelTypes';

export interface LevelVictoryResult {
  victory: boolean;
  winner: 'human' | 'enemy' | null;
  reason: string;
  roundsPlayed: number;
}

/**
 * 检查关卡胜利条件（方案A：三选二）
 */
export function checkLevelVictoryConditions(gameState: LevelGameState): LevelVictoryResult {
  const { currentLevel, round, areaControl, dadongSkillUsageCount = 0 } = gameState;

  // ========== 胜利条件判定（三选二） ==========

  // 条件1：成功遏制 - 至少2个区域的敌方标记总数降至0
  const cleanAreas = Object.entries(areaControl).filter(([_, area]) => {
    const enemyMarkers = area.attackMarkers || 0;
    return enemyMarkers === 0;
  }).length;
  const condition1_SuccessfulContainment = cleanAreas >= 2;

  // 条件2：知识普及 - 大东使用"安全知识讲解"技能至少3次
  const condition2_KnowledgePopularization = dadongSkillUsageCount >= 3;

  // 条件3：技术免疫 - 至少3个区域完成"签名接种"
  const vaccinatedAreas = Object.entries(areaControl).filter(([_, area]) => {
    return area.specialEffects.includes('已接种') || area.specialEffects.includes('vaccinated');
  }).length;
  const condition3_TechnicalImmunity = vaccinatedAreas >= 3;

  // 检查是否满足任意两个条件
  const satisfiedConditions = [
    condition1_SuccessfulContainment,
    condition2_KnowledgePopularization,
    condition3_TechnicalImmunity
  ].filter(Boolean).length;

  if (satisfiedConditions >= 2) {
    let reason = '达成胜利条件（三选二）';
    const conditionsMet: string[] = [];
    
    if (condition1_SuccessfulContainment) conditionsMet.push('成功遏制（2+区域无敌人）');
    if (condition2_KnowledgePopularization) conditionsMet.push('知识普及（技能使用3+次）');
    if (condition3_TechnicalImmunity) conditionsMet.push('技术免疫（2+区域已接种）');
    
    reason = `胜利！${conditionsMet.join('、')}`;
    
    return {
      victory: true,
      winner: 'human',
      reason,
      roundsPlayed: round
    };
  }

  // ========== 失败条件判定 ==========

  // 失败条件1：全面感染 - 敌方标记总数达到20个
  const totalEnemyMarkers = Object.values(areaControl).reduce((sum, area) => {
    return sum + (area.attackMarkers || 0);
  }, 0);
  if (totalEnemyMarkers >= 20) {
    return {
      victory: false,
      winner: 'enemy',
      reason: '失败！全面感染：敌方标记总数达到20个',
      roundsPlayed: round
    };
  }

  // 失败条件2：系统崩溃 - 4个区域的防御标记同时降为0
  const emptyFriendlyAreas = Object.entries(areaControl).filter(([_, area]) => {
    return area.defenseMarkers === 0;
  }).length;
  if (emptyFriendlyAreas >= 4) {
    return {
      victory: false,
      winner: 'enemy',
      reason: '失败！系统崩溃：所有区域失去防御',
      roundsPlayed: round
    };
  }

  // 失败条件3：轮次超限
  const maxTurns = currentLevel.maxTurns || 10;
  if (round > maxTurns) {
    return {
      victory: false,
      winner: 'enemy',
      reason: `失败！轮次超限：超过${maxTurns}轮次未达成胜利条件`,
      roundsPlayed: round
    };
  }

  // 游戏继续
  return {
    victory: false,
    winner: null,
    reason: '游戏进行中',
    roundsPlayed: round
  };
}

/**
 * 获取胜利条件进度
 * 用于UI显示玩家距离胜利还有多远
 */
export function getLevelVictoryProgress(gameState: LevelGameState): {
  condition1: { current: number; target: number; percentage: number; met: boolean };
  condition2: { current: number; target: number; percentage: number; met: boolean };
  condition3: { current: number; target: number; percentage: number; met: boolean };
  totalConditionsMet: number;
} {
  const { areaControl, dadongSkillUsageCount = 0 } = gameState;

  // 条件1：成功遏制
  const cleanAreas = Object.entries(areaControl).filter(([_, area]) => {
    const enemyMarkers = area.attackMarkers || 0;
    return enemyMarkers === 0;
  }).length;
  const condition1_Met = cleanAreas >= 2;

  // 条件2：知识普及
  const condition2_Met = (dadongSkillUsageCount || 0) >= 3;

  // 条件3：技术免疫
  const vaccinatedAreas = Object.entries(areaControl).filter(([_, area]) => {
    return area.specialEffects.includes('已接种') || area.specialEffects.includes('vaccinated');
  }).length;
  const condition3_Met = vaccinatedAreas >= 2;

  return {
    condition1: {
      current: cleanAreas,
      target: 2,
      percentage: Math.min((cleanAreas / 2) * 100, 100),
      met: condition1_Met
    },
    condition2: {
      current: dadongSkillUsageCount || 0,
      target: 3,
      percentage: Math.min(((dadongSkillUsageCount || 0) / 3) * 100, 100),
      met: condition2_Met
    },
    condition3: {
      current: vaccinatedAreas,
      target: 2,
      percentage: Math.min((vaccinatedAreas / 2) * 100, 100),
      met: condition3_Met
    },
    totalConditionsMet: [condition1_Met, condition2_Met, condition3_Met].filter(Boolean).length
  };
}

/**
 * 获取胜利条件描述
 */
export function getLevelVictoryDescription(): string {
  return `胜利条件（三选二）：
1. 成功遏制：至少2个区域的敌方标记总数降至0
2. 知识普及：大东使用"安全知识讲解"技能至少3次
3. 技术免疫：至少2个区域完成"签名接种"

满足以上任意两个条件即可达成胜利！`;
}
