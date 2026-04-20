/**
 * AI决策延迟管理器
 * 
 * 功能：
 * 1. 实现类人类决策延迟机制
 * 2. 根据决策重要性动态调整延迟时间
 * 3. 支持难度级别的延迟调整
 */

import type { AIDifficulty } from './BaseAI';
import type { LevelGameState } from '@/types/levelTypes';

// 决策重要性级别
export type DecisionImportance = 'standard' | 'important' | 'complex';

// 进度回调数据
export interface ProgressCallbackData {
  progress: number;        // 进度百分比 (0-100)
  remainingTime: number;   // 剩余时间 (毫秒)
  totalTime: number;       // 总时间 (毫秒)
  phase?: string;          // 当前阶段
  elapsedTime: number;     // 已用时间 (毫秒)
}

// 进度回调函数类型
export type ProgressCallback = (data: ProgressCallbackData) => void;

// 延迟配置接口
export interface DelayConfig {
  standardDelay: [number, number];      // 标准决策延迟范围 [min, max] ms
  importantDelay: [number, number];     // 重要决策延迟范围 [min, max] ms
  complexDelay: [number, number];       // 复杂局面延迟范围 [min, max] ms
  responseDelay: [number, number];      // 响应时间范围 [min, max] ms
  phaseTransitionDelay: number;         // 阶段转换延迟 ms
  minDelay: number;                     // 最小延迟（红线）
  maxDelay: number;                     // 最大延迟（红线）
  progressInterval?: number;            // 进度更新间隔 (毫秒)，默认100ms
  onProgress?: ProgressCallback;        // 进度回调函数
}

// 默认延迟配置
const DEFAULT_DELAY_CONFIG: DelayConfig = {
  standardDelay: [1500, 2500],      // 1.5-2.5秒
  importantDelay: [3000, 5000],     // 3-5秒
  complexDelay: [4000, 5000],       // 4-5秒
  responseDelay: [2500, 3500],      // 2.5-3.5秒
  phaseTransitionDelay: 1000,       // 1秒
  minDelay: 2000,                   // 最小2秒（红线）
  maxDelay: 5000,                   // 最大5秒（红线）
  progressInterval: 100             // 默认每100ms更新一次进度
};

// 难度延迟系数
const DIFFICULTY_DELAY_MULTIPLIERS: Record<AIDifficulty, number> = {
  easy: 1.2,      // 简单难度：思考更慢
  medium: 1.0,    // 中等难度：标准速度
  hard: 0.9       // 困难难度：思考更快
};

// 决策上下文
export interface DecisionContext {
  handSize: number;
  availableActions: number;
  isCriticalCard: boolean;
  isSkill: boolean;
  targetAreaThreat: number;
  playerSecurityRatio: number;
  remainingActionPoints: number;
}

export class AIDecisionDelayManager {
  private config: DelayConfig;
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'medium', config: Partial<DelayConfig> = {}) {
    this.difficulty = difficulty;
    this.config = { ...DEFAULT_DELAY_CONFIG, ...config };
  }

  /**
   * 设置难度
   */
  setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * 评估决策重要性
   */
  evaluateDecisionImportance(
    action: string,
    context: DecisionContext
  ): DecisionImportance {
    // 复杂局面判断：手牌多且有多个可行行动
    const isComplexSituation = 
      context.handSize >= 5 && 
      context.availableActions >= 3;

    // 重要决策判断：使用关键卡牌/技能、低安全等级、高威胁区域
    const isImportantDecision = 
      context.isCriticalCard ||
      context.isSkill ||
      context.playerSecurityRatio < 0.4 ||
      context.targetAreaThreat > 15 ||
      context.remainingActionPoints <= 1;

    if (isComplexSituation) {
      return 'complex';
    } else if (isImportantDecision) {
      return 'important';
    } else {
      return 'standard';
    }
  }

  /**
   * 计算决策延迟
   */
  calculateDelay(importance: DecisionImportance): number {
    let delayRange: [number, number];

    switch (importance) {
      case 'complex':
        delayRange = this.config.complexDelay;
        break;
      case 'important':
        delayRange = this.config.importantDelay;
        break;
      case 'standard':
      default:
        delayRange = this.config.standardDelay;
        break;
    }

    // 在范围内随机选择
    const baseDelay = this.randomInRange(delayRange[0], delayRange[1]);
    
    // 应用难度系数
    const adjustedDelay = Math.round(baseDelay * DIFFICULTY_DELAY_MULTIPLIERS[this.difficulty]);
    
    // 确保在红线范围内
    return Math.max(this.config.minDelay, Math.min(this.config.maxDelay, adjustedDelay));
  }

  /**
   * 计算响应延迟
   */
  calculateResponseDelay(): number {
    const baseDelay = this.randomInRange(
      this.config.responseDelay[0],
      this.config.responseDelay[1]
    );
    
    const adjustedDelay = Math.round(baseDelay * DIFFICULTY_DELAY_MULTIPLIERS[this.difficulty]);
    
    return Math.max(this.config.minDelay, Math.min(this.config.maxDelay, adjustedDelay));
  }

  /**
   * 获取阶段转换延迟
   */
  getPhaseTransitionDelay(): number {
    return this.config.phaseTransitionDelay;
  }

  /**
   * 执行延迟（异步）
   * 支持进度回调
   */
  async executeDelay(ms: number, phase?: string): Promise<void> {
    // 确保在红线范围内
    const safeDelay = Math.max(this.config.minDelay, Math.min(this.config.maxDelay, ms));
    const progressInterval = this.config.progressInterval ?? 100;
    const onProgress = this.config.onProgress;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const totalTime = safeDelay;

      // 如果没有进度回调，使用简单延迟
      if (!onProgress) {
        setTimeout(resolve, safeDelay);
        return;
      }

      // 立即发送初始进度 (0%)
      onProgress({
        progress: 0,
        remainingTime: totalTime,
        totalTime,
        phase,
        elapsedTime: 0
      });

      // 设置进度更新定时器
      const intervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, totalTime - elapsedTime);
        const progress = Math.min(100, Math.round((elapsedTime / totalTime) * 100));

        onProgress({
          progress,
          remainingTime,
          totalTime,
          phase,
          elapsedTime
        });

        // 如果已完成，清除定时器
        if (elapsedTime >= totalTime) {
          clearInterval(intervalId);
        }
      }, progressInterval);

      // 设置最终完成
      setTimeout(() => {
        clearInterval(intervalId);
        // 发送100%进度
        onProgress({
          progress: 100,
          remainingTime: 0,
          totalTime,
          phase,
          elapsedTime: totalTime
        });
        resolve();
      }, safeDelay);
    });
  }

  /**
   * 执行决策延迟（自动评估重要性）
   * 支持阶段信息传递
   */
  async executeDecisionDelay(
    action: string,
    context: DecisionContext,
    phase?: string
  ): Promise<{ delay: number; importance: DecisionImportance }> {
    const importance = this.evaluateDecisionImportance(action, context);
    const delay = this.calculateDelay(importance);
    
    await this.executeDelay(delay, phase);
    
    return { delay, importance };
  }

  /**
   * 执行标准化2秒延迟（用于普通行动）
   * 支持阶段信息传递
   */
  async executeStandardDelay(phase?: string): Promise<{ delay: number }> {
    const delay = 2000; // 固定2秒
    await this.executeDelay(delay, phase);
    return { delay };
  }

  /**
   * 生成决策延迟报告
   */
  generateDelayReport(
    action: string,
    context: DecisionContext
  ): {
    importance: DecisionImportance;
    calculatedDelay: number;
    finalDelay: number;
    difficulty: AIDifficulty;
    reason: string;
  } {
    const importance = this.evaluateDecisionImportance(action, context);
    const calculatedDelay = this.calculateDelay(importance);
    const finalDelay = Math.max(this.config.minDelay, Math.min(this.config.maxDelay, calculatedDelay));
    
    let reason = '';
    switch (importance) {
      case 'complex':
        reason = `复杂局面：手牌${context.handSize}张，${context.availableActions}个可行行动`;
        break;
      case 'important':
        if (context.isCriticalCard) reason = '使用关键卡牌';
        else if (context.isSkill) reason = '使用技能';
        else if (context.playerSecurityRatio < 0.4) reason = '玩家安全等级低';
        else if (context.targetAreaThreat > 15) reason = '高威胁区域';
        else if (context.remainingActionPoints <= 1) reason = '最后行动点';
        else reason = '重要决策';
        break;
      case 'standard':
        reason = '常规决策';
        break;
    }

    return {
      importance,
      calculatedDelay,
      finalDelay,
      difficulty: this.difficulty,
      reason
    };
  }

  /**
   * 随机数生成（范围内）
   */
  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 验证延迟是否在红线范围内
   */
  validateDelay(delay: number): { valid: boolean; adjustedDelay: number; violations: string[] } {
    const violations: string[] = [];
    let adjustedDelay = delay;

    if (delay < this.config.minDelay) {
      violations.push(`延迟${delay}ms小于最小限制${this.config.minDelay}ms`);
      adjustedDelay = this.config.minDelay;
    }

    if (delay > this.config.maxDelay) {
      violations.push(`延迟${delay}ms超过最大限制${this.config.maxDelay}ms`);
      adjustedDelay = this.config.maxDelay;
    }

    return {
      valid: violations.length === 0,
      adjustedDelay,
      violations
    };
  }
}

export default AIDecisionDelayManager;
