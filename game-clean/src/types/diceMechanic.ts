/**
 * 《道高一丈：数字博弈》v11.0 - 骰子判定机制类型定义
 * 
 * 骰子判定机制是一个独立的底层系统，不预设任何应用场景。
 * 卡牌设计时通过引用该机制来定义具体效果。
 */

/**
 * 骰子判定难度等级
 * 难度1-5为可成功，难度6为必然失败
 */
export type DiceDifficulty = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 骰子判定结果
 */
export interface DiceRollResult {
  /** 掷出的点数 (1-6) */
  roll: number;
  /** 是否成功 */
  success: boolean;
  /** 大成功判定（点数6且难度≤3） */
  isCriticalSuccess: boolean;
  /** 大失败判定（点数1且难度≥4） */
  isCriticalFailure: boolean;
  /** 与难度的差值（正数表示超过难度） */
  margin: number;
}

/**
 * 骰子判定配置
 * 卡牌通过此配置引用骰子机制
 */
export interface DiceMechanicConfig {
  /** 基础难度 (1-6) */
  baseDifficulty: DiceDifficulty;
  /** 难度修正值（正数降低难度） */
  difficultyModifier?: number;
  /** 是否允许重掷 */
  allowReroll?: boolean;
  /** 重掷次数 */
  rerollCount?: number;
  /** 取最优结果 */
  takeBest?: boolean;
}

/**
 * 待处理判定
 */
export interface PendingJudgment {
  id: string;
  playerId: string;
  config: DiceMechanicConfig;
  source: string; // 判定来源（卡牌/技能）
  timestamp: number;
}

/**
 * 判定结果
 */
export interface JudgmentResult {
  judgmentId: string;
  result: DiceRollResult;
  resolved: boolean;
}
