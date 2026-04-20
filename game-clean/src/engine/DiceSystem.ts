/**
 * 骰子判定系统 (R6.0)
 * 实现6面骰判定机制
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import { DICE_CONFIG, DIFFICULTY_LEVELS } from '@/types/gameConstants';

export { DICE_CONFIG, DIFFICULTY_LEVELS };

/** 判定结果类型 */
export type DiceResultType = 'critical_success' | 'success' | 'failure' | 'critical_failure';

/** 判定结果 */
export interface DiceCheckResult {
  /** 掷出的点数 */
  roll: number;
  /** 难度值 */
  difficulty: number;
  /** 是否成功 */
  success: boolean;
  /** 结果类型 */
  resultType: DiceResultType;
  /** 最终效果值（包含大成功/大失败修正） */
  finalValue: number;
  /** 结果描述 */
  description: string;
}

/**
 * 执行骰子判定 (R6.1)
 * @param difficulty 难度值 (1-6)
 * @param modifiers 修正值（科技修正、区域修正等）
 * @returns 判定结果
 */
export function performDiceCheck(
  difficulty: number,
  modifiers: number = 0
): DiceCheckResult {
  // 确保难度在有效范围内
  const clampedDifficulty = Math.max(
    DICE_CONFIG.MIN_ROLL, 
    Math.min(DICE_CONFIG.MAX_ROLL, difficulty)
  );
  
  // 掷6面骰
  const roll = Math.floor(Math.random() * DICE_CONFIG.FACES) + DICE_CONFIG.MIN_ROLL;
  
  // 应用修正值
  const modifiedRoll = roll + modifiers;
  
  // 判定是否成功：掷出值 > 难度值
  const success = modifiedRoll > clampedDifficulty;
  
  // 判定结果类型
  let resultType: DiceResultType;
  let finalValue = 1; // 基础效果值
  let description: string;
  
  // R6.1 大成功：掷出6且难度≤3 → 额外+2效果
  if (roll === DICE_CONFIG.CRITICAL_SUCCESS_ROLL && 
      clampedDifficulty <= DICE_CONFIG.CRITICAL_SUCCESS_MAX_DIFFICULTY) {
    resultType = 'critical_success';
    finalValue = 3; // 基础1 + 额外2
    description = `大成功！掷出${roll}点（难度${clampedDifficulty}），效果+2`;
  }
  // R6.1 大失败：掷出1且难度≥4 → 效果-1或失败
  else if (roll === DICE_CONFIG.CRITICAL_FAILURE_ROLL && 
           clampedDifficulty >= DICE_CONFIG.CRITICAL_FAILURE_MIN_DIFFICULTY) {
    resultType = 'critical_failure';
    finalValue = 0;
    description = `大失败！掷出${roll}点（难度${clampedDifficulty}），效果失效`;
  }
  // 普通成功
  else if (success) {
    resultType = 'success';
    finalValue = 1;
    description = `成功！掷出${roll}点（难度${clampedDifficulty}）`;
  }
  // 普通失败
  else {
    resultType = 'failure';
    finalValue = 0;
    description = `失败！掷出${roll}点（难度${clampedDifficulty}）`;
  }
  
  return {
    roll,
    difficulty: clampedDifficulty,
    success: resultType === 'success' || resultType === 'critical_success',
    resultType,
    finalValue,
    description
  };
}

/**
 * 批量骰子判定（用于需要多次判定的场景）
 * @param count 判定次数
 * @param difficulty 难度值
 * @param modifiers 修正值
 * @returns 判定结果数组
 */
export function performMultipleDiceChecks(
  count: number,
  difficulty: number,
  modifiers: number = 0
): DiceCheckResult[] {
  const results: DiceCheckResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push(performDiceCheck(difficulty, modifiers));
  }
  return results;
}

/**
 * 获取难度描述
 * @param difficulty 难度值
 * @returns 难度描述
 */
export function getDifficultyDescription(difficulty: number): string {
  const level = Object.values(DIFFICULTY_LEVELS).find(l => l.value === difficulty);
  return level?.name || '未知';
}

/**
 * 计算成功率
 * @param difficulty 难度值
 * @param modifiers 修正值
 * @returns 成功率百分比
 */
export function calculateSuccessRate(difficulty: number, modifiers: number = 0): number {
  const clampedDifficulty = Math.max(
    DICE_CONFIG.MIN_ROLL, 
    Math.min(DICE_CONFIG.MAX_ROLL, difficulty)
  );
  const modifiedDifficulty = clampedDifficulty - modifiers;
  
  // 成功率 = (6 - 难度) / 6 * 100%
  const successFaces = Math.max(0, DICE_CONFIG.FACES - modifiedDifficulty);
  return (successFaces / DICE_CONFIG.FACES) * 100;
}

/**
 * 科技树判定修正计算 (R6.3)
 * @param techLevel 科技树等级 (0-5)
 * @returns 判定修正值
 */
export function calculateTechModifier(techLevel: number): number {
  // R6.3: 科技修正 = 科技等级÷2（向下取整）
  return Math.floor(techLevel / 2);
}

/**
 * 区域判定修正计算 (R6.3)
 * @param isAdvantageous 是否为优势区域
 * @returns 判定修正值
 */
export function calculateAreaModifier(isAdvantageous: boolean): number {
  // R6.3: 优势区域+1，劣势区域-1
  return isAdvantageous ? 1 : -1;
}
