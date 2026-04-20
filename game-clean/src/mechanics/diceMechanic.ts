/**
 * 《道高一丈：数字博弈》v2.0 - 骰子判定机制
 * 
 * 严格遵循完善的游戏规则.md (v16.2.0) 实现
 * R6.2: 骰子判定机制
 * 
 * 使用1-10骰子系统
 * - 1-3: 失败
 * - 4-7: 普通成功
 * - 8-9: 优秀成功
 * - 10: 大成功
 */

import type {
  DiceRollResult,
  DiceMechanicConfig,
  DiceSuccessLevel
} from '@/types/gameRules';

// ==================== 常量定义 ====================

/**
 * 成功等级阈值
 */
export const DICE_SUCCESS_THRESHOLDS = {
  failure: { min: 1, max: 3 },      // 失败
  normal: { min: 4, max: 7 },       // 普通成功
  excellent: { min: 8, max: 9 },    // 优秀成功
  critical: { min: 10, max: 10 }    // 大成功
} as const;

/**
 * 成功等级名称
 */
export const SUCCESS_LEVEL_NAMES: Record<DiceSuccessLevel, string> = {
  failure: '失败',
  normal: '普通成功',
  excellent: '优秀成功',
  critical: '大成功'
};

/**
 * 成功等级英文名称
 */
export const SUCCESS_LEVEL_NAMES_EN: Record<DiceSuccessLevel, string> = {
  failure: 'Failure',
  normal: 'Normal Success',
  excellent: 'Excellent Success',
  critical: 'Critical Success'
};

// ==================== 核心类 ====================

/**
 * 骰子机制执行器
 * 纯函数实现，无副作用
 */
export class DiceMechanic {
  
  /**
   * 执行骰子判定
   * R6.2: 骰子判定机制
   * 
   * @param config 判定配置
   * @returns 判定结果
   */
  static roll(config: DiceMechanicConfig): DiceRollResult {
    // 基础骰子 (1-10)
    const baseRoll = Math.floor(Math.random() * 10) + 1;
    
    // 应用修正值
    const modifier = config.modifier || 0;
    const modifiedRoll = Math.max(1, Math.min(10, baseRoll + modifier));
    
    // 确定成功等级
    const successLevel = this.determineSuccessLevel(modifiedRoll);
    
    // 计算成功度
    const successDegree = this.calculateSuccessDegree(modifiedRoll, successLevel);
    
    // 判定是否成功（普通成功及以上）
    const isSuccess = successLevel !== 'failure';
    
    return {
      roll: baseRoll,
      modifiedRoll,
      modifier,
      successLevel,
      successDegree,
      isSuccess,
      isCriticalSuccess: successLevel === 'critical',
      isCriticalFailure: successLevel === 'failure' && baseRoll === 1
    };
  }

  /**
   * 确定成功等级
   */
  private static determineSuccessLevel(roll: number): DiceSuccessLevel {
    if (roll >= DICE_SUCCESS_THRESHOLDS.critical.min) return 'critical';
    if (roll >= DICE_SUCCESS_THRESHOLDS.excellent.min) return 'excellent';
    if (roll >= DICE_SUCCESS_THRESHOLDS.normal.min) return 'normal';
    return 'failure';
  }

  /**
   * 计算成功度
   * 用于比较多个骰子结果
   */
  private static calculateSuccessDegree(roll: number, level: DiceSuccessLevel): number {
    const levelBonus: Record<DiceSuccessLevel, number> = {
      failure: 0,
      normal: 10,
      excellent: 20,
      critical: 30
    };
    return levelBonus[level] + roll;
  }

  /**
   * 执行对抗判定
   * 双方各投骰子，比较成功度
   */
  static contestedRoll(
    initiatorConfig: DiceMechanicConfig,
    responderConfig: DiceMechanicConfig,
    initiatorId: string,
    responderId: string
  ): {
    initiatorResult: DiceRollResult;
    responderResult: DiceRollResult;
    winnerId: string | null;
    isDraw: boolean;
  } {
    const initiatorResult = this.roll(initiatorConfig);
    const responderResult = this.roll(responderConfig);
    
    // 如果一方失败，另一方成功，则成功方获胜
    if (initiatorResult.isSuccess && !responderResult.isSuccess) {
      return {
        initiatorResult,
        responderResult,
        winnerId: initiatorId,
        isDraw: false
      };
    }
    
    if (!initiatorResult.isSuccess && responderResult.isSuccess) {
      return {
        initiatorResult,
        responderResult,
        winnerId: responderId,
        isDraw: false
      };
    }
    
    // 如果双方都成功或都失败，比较成功度
    if (initiatorResult.successDegree > responderResult.successDegree) {
      return {
        initiatorResult,
        responderResult,
        winnerId: initiatorId,
        isDraw: false
      };
    }
    
    if (responderResult.successDegree > initiatorResult.successDegree) {
      return {
        initiatorResult,
        responderResult,
        winnerId: responderId,
        isDraw: false
      };
    }
    
    // 平局
    return {
      initiatorResult,
      responderResult,
      winnerId: null,
      isDraw: true
    };
  }

  /**
   * 执行带优势/劣势的判定
   * 优势：投2次取高
   * 劣势：投2次取低
   */
  static rollWithAdvantage(
    config: DiceMechanicConfig,
    mode: 'advantage' | 'disadvantage'
  ): DiceRollResult {
    const roll1 = this.roll(config);
    const roll2 = this.roll(config);
    
    if (mode === 'advantage') {
      // 优势：取成功度高的
      return roll1.successDegree >= roll2.successDegree ? roll1 : roll2;
    } else {
      // 劣势：取成功度低的
      return roll1.successDegree <= roll2.successDegree ? roll1 : roll2;
    }
  }

  /**
   * 执行多次骰子判定
   */
  static rollMultiple(
    config: DiceMechanicConfig,
    count: number
  ): DiceRollResult[] {
    const results: DiceRollResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.roll(config));
    }
    return results;
  }

  /**
   * 获取成功等级的概率
   */
  static getSuccessProbability(level: DiceSuccessLevel): number {
    const probabilities: Record<DiceSuccessLevel, number> = {
      failure: 30,      // 1-3: 30%
      normal: 40,       // 4-7: 40%
      excellent: 20,    // 8-9: 20%
      critical: 10      // 10: 10%
    };
    return probabilities[level];
  }

  /**
   * 获取成功等级的描述
   */
  static getSuccessLevelDescription(level: DiceSuccessLevel): string {
    const descriptions: Record<DiceSuccessLevel, string> = {
      failure: '判定失败，效果不触发或触发负面效果',
      normal: '判定成功，效果正常触发',
      excellent: '判定优秀成功，效果增强',
      critical: '判定大成功，效果大幅增强或触发额外效果'
    };
    return descriptions[level];
  }

  /**
   * 获取成功等级的名称
   */
  static getSuccessLevelName(level: DiceSuccessLevel): string {
    return SUCCESS_LEVEL_NAMES[level];
  }

  /**
   * 获取成功等级的英文名称
   */
  static getSuccessLevelNameEn(level: DiceSuccessLevel): string {
    return SUCCESS_LEVEL_NAMES_EN[level];
  }

  /**
   * 获取骰子结果的描述
   */
  static getRollDescription(result: DiceRollResult): string {
    const parts: string[] = [];
    
    parts.push(`骰子结果: ${result.roll}`);
    
    if (result.modifier !== 0) {
      const sign = result.modifier > 0 ? '+' : '';
      parts.push(`修正值: ${sign}${result.modifier}`);
      parts.push(`最终值: ${result.modifiedRoll}`);
    }
    
    parts.push(`成功等级: ${this.getSuccessLevelName(result.successLevel)}`);
    
    if (result.isCriticalSuccess) {
      parts.push('【大成功！】');
    }
    
    if (result.isCriticalFailure) {
      parts.push('【大失败！】');
    }
    
    return parts.join(' | ');
  }

  /**
   * 随机骰子（用于AI）
   */
  static randomRoll(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * 验证骰子值是否有效
   */
  static isValidRoll(roll: number): boolean {
    return roll >= 1 && roll <= 10 && Number.isInteger(roll);
  }
}

// ==================== 快捷函数 ====================

/**
 * 快捷骰子判定
 */
export const rollDice = (modifier?: number): DiceRollResult => {
  return DiceMechanic.roll({ modifier });
};

/**
 * 快捷判定是否成功
 */
export const isSuccess = (modifier?: number): boolean => {
  return DiceMechanic.roll({ modifier }).isSuccess;
};

/**
 * 快捷判定成功等级
 */
export const getSuccessLevel = (modifier?: number): DiceSuccessLevel => {
  return DiceMechanic.roll({ modifier }).successLevel;
};

// ==================== 导出 ====================

export default DiceMechanic;
