/**
 * 科技树系统 (R5.0, R5.1, R5.2)
 * 实现科技树等级解锁、判定修正和等级加成
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */



/** 科技树等级定义 */
export type TechLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** 科技树等级解锁阈值 (R5.1) - 更新版 */
export const TECH_UNLOCK_THRESHOLDS = {
  T0: 0,
  T1: 5,   // 从15降低到5
  T2: 15,  // 从30降低到15
  T3: 30,  // 从45降低到30
  T4: 40,  // 从60降低到40
  T5: 50,  // 从75降低到50
} as const;

/** 科技等级配置 (R5.1) */
export interface TechLevelConfig {
  /** 等级 */
  level: TechLevel;
  /** 解锁所需渗透/安全等级 */
  requiredLevel: number;
  /** 判定修正 (R5.1) */
  checkModifier: number;
  /** 等级加成 (R5.1) */
  levelBonus: number;
  /** 描述 */
  description: string;
}

/** 科技树等级配置表 (R5.1) */
export const TECH_LEVEL_CONFIGS: Record<TechLevel, TechLevelConfig> = {
  0: {
    level: 0,
    requiredLevel: TECH_UNLOCK_THRESHOLDS.T0,
    checkModifier: 0,
    levelBonus: 0,
    description: `T0: 初始等级`
  },
  1: {
    level: 1,
    requiredLevel: TECH_UNLOCK_THRESHOLDS.T1,
    checkModifier: 1,
    levelBonus: 0,
    description: `T1: 渗透/安全=${TECH_UNLOCK_THRESHOLDS.T1}，判定修正+1`
  },
  2: {
    level: 2,
    requiredLevel: TECH_UNLOCK_THRESHOLDS.T2,
    checkModifier: 1,
    levelBonus: 1,
    description: `T2: 渗透/安全=${TECH_UNLOCK_THRESHOLDS.T2}，判定修正+1，等级加成+1`
  },
  3: {
    level: 3,
    requiredLevel: TECH_UNLOCK_THRESHOLDS.T3,
    checkModifier: 2,
    levelBonus: 1,
    description: `T3: 渗透/安全=${TECH_UNLOCK_THRESHOLDS.T3}，判定修正+2，等级加成+1`
  },
  4: {
    level: 4,
    requiredLevel: TECH_UNLOCK_THRESHOLDS.T4,
    checkModifier: 2,
    levelBonus: 2,
    description: `T4: 渗透/安全=${TECH_UNLOCK_THRESHOLDS.T4}，判定修正+2，等级加成+2`
  },
  5: {
    level: 5,
    requiredLevel: TECH_UNLOCK_THRESHOLDS.T5,
    checkModifier: 3,
    levelBonus: 2,
    description: `T5: 渗透/安全=${TECH_UNLOCK_THRESHOLDS.T5}，判定修正+3，等级加成+2`
  }
};

/**
 * 根据渗透/安全等级计算科技树等级 (R5.1)
 * @param level 当前渗透或安全等级
 * @returns 科技树等级 (0-5)
 */
export function calculateTechLevel(level: number): TechLevel {
  if (level >= TECH_UNLOCK_THRESHOLDS.T5) return 5;
  if (level >= TECH_UNLOCK_THRESHOLDS.T4) return 4;
  if (level >= TECH_UNLOCK_THRESHOLDS.T3) return 3;
  if (level >= TECH_UNLOCK_THRESHOLDS.T2) return 2;
  if (level >= TECH_UNLOCK_THRESHOLDS.T1) return 1;
  return 0;
}

/**
 * 获取科技树等级配置
 * @param level 科技树等级
 * @returns 等级配置
 */
export function getTechLevelConfig(level: TechLevel): TechLevelConfig {
  return TECH_LEVEL_CONFIGS[level];
}

/**
 * 计算判定修正 (R5.2)
 * @param techLevel 科技树等级
 * @returns 判定修正值
 */
export function calculateCheckModifier(techLevel: TechLevel): number {
  // R5.2: 判定修正 = 科技等级÷2（向下取整）
  return Math.floor(techLevel / 2);
}

/**
 * 计算等级加成 (R5.2)
 * @param techLevel 科技树等级
 * @returns 等级加成值
 */
export function calculateLevelBonus(techLevel: TechLevel): number {
  // R5.2: 等级加成 = 科技等级÷2（向下取整）
  return Math.floor(techLevel / 2);
}

/**
 * 计算连击加成 (R5.2)
 * @param consecutiveUses 连续使用次数
 * @returns 连击加成值
 */
export function calculateComboBonus(consecutiveUses: number): number {
  // R5.2: 连击加成 = 连续使用次数×0.5（上限3）
  return Math.min(consecutiveUses * 0.5, 3);
}

/**
 * 计算最终等级变化 (R2.1, R2.2, R5.2)
 * @param baseValue 基础值
 * @param techLevel 科技树等级
 * @param comboCount 连击次数
 * @param checkModifier 判定修正
 * @returns 最终变化值
 */
export function calculateFinalLevelChange(
  baseValue: number,
  techLevel: TechLevel,
  comboCount: number = 0,
  checkModifier: number = 0
): number {
  // R2.1/R2.2 计算公式：最终变化 = 基础值 + 科技加成 + 连击加成 + 判定修正
  const techBonus = calculateLevelBonus(techLevel);
  const comboBonus = calculateComboBonus(comboCount);
  
  const finalValue = baseValue + techBonus + comboBonus + checkModifier;
  
  return Math.round(finalValue);
}

/**
 * 检查是否解锁科技等级
 * @param currentLevel 当前渗透或安全等级
 * @param targetTechLevel 目标科技等级
 * @returns 是否已解锁
 */
export function isTechLevelUnlocked(currentLevel: number, targetTechLevel: TechLevel): boolean {
  const config = TECH_LEVEL_CONFIGS[targetTechLevel];
  return currentLevel >= config.requiredLevel;
}

/**
 * 获取下一级科技信息
 * @param currentLevel 当前渗透或安全等级
 * @returns 下一级信息，如果已满级返回null
 */
export function getNextTechLevelInfo(currentLevel: number): {
  nextLevel: TechLevel;
  requiredLevel: number;
  progress: number;
} | null {
  const currentTechLevel = calculateTechLevel(currentLevel);
  
  if (currentTechLevel >= 5) {
    return null; // 已满级
  }
  
  const nextLevel = (currentTechLevel + 1) as TechLevel;
  const config = TECH_LEVEL_CONFIGS[nextLevel];
  const prevRequiredLevel = TECH_LEVEL_CONFIGS[currentTechLevel].requiredLevel;
  const progress = ((currentLevel - prevRequiredLevel) / (config.requiredLevel - prevRequiredLevel)) * 100;
  
  return {
    nextLevel,
    requiredLevel: config.requiredLevel,
    progress: Math.min(100, Math.max(0, progress))
  };
}

/**
 * 科技树加成应用结果
 */
export interface TechBonusApplication {
  /** 原始值 */
  originalValue: number;
  /** 科技加成 */
  techBonus: number;
  /** 连击加成 */
  comboBonus: number;
  /** 判定修正 */
  checkModifier: number;
  /** 最终值 */
  finalValue: number;
  /** 描述 */
  description: string;
}

/**
 * 应用科技树加成
 * @param baseValue 基础值
 * @param techLevel 科技树等级
 * @param comboCount 连击次数
 * @param checkModifier 判定修正
 * @returns 加成应用结果
 */
export function applyTechBonus(
  baseValue: number,
  techLevel: TechLevel,
  comboCount: number = 0,
  checkModifier: number = 0
): TechBonusApplication {
  const techBonus = calculateLevelBonus(techLevel);
  const comboBonus = calculateComboBonus(comboCount);
  const finalValue = calculateFinalLevelChange(baseValue, techLevel, comboCount, checkModifier);
  
  const bonuses: string[] = [];
  if (techBonus > 0) bonuses.push(`科技+${techBonus}`);
  if (comboBonus > 0) bonuses.push(`连击+${comboBonus}`);
  if (checkModifier > 0) bonuses.push(`判定+${checkModifier}`);
  
  const description = bonuses.length > 0 
    ? `${baseValue} → ${finalValue} (${bonuses.join(', ')})`
    : `${baseValue} (无加成)`;
  
  return {
    originalValue: baseValue,
    techBonus,
    comboBonus,
    checkModifier,
    finalValue,
    description
  };
}

/**
 * 获取科技树等级名称
 * @param level 科技树等级
 * @returns 等级名称
 */
export function getTechLevelName(level: TechLevel): string {
  const names: Record<TechLevel, string> = {
    0: 'T0 - 初始',
    1: 'T1 - 初级',
    2: 'T2 - 中级',
    3: 'T3 - 高级',
    4: 'T4 - 专家',
    5: 'T5 - 大师'
  };
  return names[level];
}
