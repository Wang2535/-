/**
 * AI决策结果格式化器
 *
 * 功能：
 * 1. 标准化决策结果输出格式
 * 2. 生成完整的决策分析报告
 * 3. 支持大东AI和敌人AI的决策格式化
 */

import type { Card } from '@/types/legacy/card_v16';
import type { LevelGameState, AreaType, LevelTurnPhase } from '@/types/levelTypes';
import type { AIDifficulty, AIDecision } from './BaseAI';
import type { DadongMode } from './DadongAIStrategy';
import type { EnemyStrategy, StrategyCondition } from './EnemyAIStrategy';
import type { DecisionImportance } from './AIDecisionDelayManager';

// 标准化决策结果
export interface StandardizedDecisionResult {
  // 基础信息
  actionType: 'play_card' | 'use_skill' | 'place_marker' | 'skip' | 'end_turn';
  actor: 'dadong' | 'enemy';
  timestamp: number;
  phase: LevelTurnPhase;

  // 目标信息
  targetCard?: {
    id: string;
    name: string;
    type: string;
  };
  targetSkill?: {
    id: string;
    name: string;
  };
  targetArea?: AreaType;
  targetObject?: 'player' | 'dadong' | AreaType;

  // 决策分析
  decisionBasis: {
    strategicConsideration: string;
    tacticalReasoning: string;
    alternativeOptions: string[];
    riskAssessment: string;
  };

  // 量化评估
  priorityScore: number;
  confidenceLevel: number;

  // 资源消耗
  resourceConsumption: {
    computing?: number;
    funds?: number;
    information?: number;
    actionPoints: number;
  };

  // 预期效果
  expectedEffects: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };

  // 执行元数据
  executionMetadata: {
    decisionDelay: number;
    importance: DecisionImportance;
    difficulty: AIDifficulty;
    gameRound: number;
    gameTurn: number;
  };
}

// 回合执行报告
export interface TurnExecutionReport {
  actor: 'dadong' | 'enemy';
  turn: number;
  round: number;
  startTime: number;
  endTime: number;
  totalDuration: number;
  decisions: StandardizedDecisionResult[];
  phaseLogs: PhaseLog[];
  strategyInfo?: {
    currentStrategy: string;
    strategyDescription: string;
  };
  summary: {
    totalActions: number;
    cardsPlayed: number;
    skillsUsed: number;
    resourcesConsumed: {
      computing: number;
      funds: number;
      information: number;
    };
  };
}

// 阶段日志
export interface PhaseLog {
  phase: LevelTurnPhase;
  timestamp: number;
  duration: number;
  actions: string[];
  results: string[];
}

// 决策统计
export interface DecisionStatistics {
  totalDecisions: number;
  averagePriority: number;
  averageDelay: number;
  actionTypeDistribution: Record<string, number>;
  targetAreaDistribution: Record<string, number>;
  resourceConsumptionTotal: {
    computing: number;
    funds: number;
    information: number;
    actionPoints: number;
  };
}

export class AIDecisionFormatter {
  /**
   * 格式化大东AI决策结果
   */
  formatDadongDecision(
    decision: AIDecision,
    state: LevelGameState,
    mode: DadongMode,
    delayInfo: { delay: number; importance: DecisionImportance },
    decisionBasis: {
      strategicConsideration: string;
      tacticalReasoning: string;
      alternativeOptions: string[];
      riskAssessment: string;
    }
  ): StandardizedDecisionResult {
    const now = Date.now();

    return {
      actionType: decision.action,
      actor: 'dadong',
      timestamp: now,
      phase: 'action',

      targetCard: decision.card ? {
        id: decision.card.card_code || 'unknown',
        name: decision.card.name,
        type: decision.card.type || 'unknown'
      } : undefined,

      targetArea: decision.targetArea,
      targetObject: this.determineTargetObject(decision, state),

      decisionBasis: {
        strategicConsideration: decisionBasis.strategicConsideration,
        tacticalReasoning: decision.reason || decisionBasis.tacticalReasoning,
        alternativeOptions: decisionBasis.alternativeOptions,
        riskAssessment: decisionBasis.riskAssessment
      },

      priorityScore: decision.priority || 5,
      confidenceLevel: this.calculateConfidenceLevel(decision, mode),

      resourceConsumption: this.calculateResourceConsumption(decision),

      expectedEffects: this.generateExpectedEffects(decision, state, 'dadong'),

      executionMetadata: {
        decisionDelay: delayInfo.delay,
        importance: delayInfo.importance,
        difficulty: state.currentLevel.difficulty <= 2 ? 'easy' : state.currentLevel.difficulty >= 4 ? 'hard' : 'medium',
        gameRound: state.round,
        gameTurn: state.currentTurn
      }
    };
  }

  /**
   * 格式化敌人AI决策结果
   */
  formatEnemyDecision(
    decision: AIDecision,
    state: LevelGameState,
    strategy: StrategyCondition,
    delayInfo: { delay: number; importance: DecisionImportance },
    threatAssessment: {
      playerVulnerability: number;
      overallThreat: number;
    }
  ): StandardizedDecisionResult {
    const now = Date.now();

    return {
      actionType: decision.action,
      actor: 'enemy',
      timestamp: now,
      phase: 'action',

      targetCard: decision.card ? {
        id: decision.card.card_code || 'unknown',
        name: decision.card.name,
        type: decision.card.type || 'unknown'
      } : undefined,

      targetArea: decision.targetArea,
      targetObject: this.determineTargetObject(decision, state),

      decisionBasis: {
        strategicConsideration: `执行${strategy.name}：${strategy.description}`,
        tacticalReasoning: decision.reason || '基于当前战场态势选择最优行动',
        alternativeOptions: this.generateAlternativeOptions(strategy),
        riskAssessment: `玩家脆弱度${threatAssessment.playerVulnerability}%，总体威胁${threatAssessment.overallThreat}`
      },

      priorityScore: decision.priority || 5,
      confidenceLevel: this.calculateEnemyConfidenceLevel(decision, strategy),

      resourceConsumption: this.calculateResourceConsumption(decision),

      expectedEffects: this.generateExpectedEffects(decision, state, 'enemy'),

      executionMetadata: {
        decisionDelay: delayInfo.delay,
        importance: delayInfo.importance,
        difficulty: state.currentLevel.difficulty <= 2 ? 'easy' : state.currentLevel.difficulty >= 4 ? 'hard' : 'medium',
        gameRound: state.round,
        gameTurn: state.currentTurn
      }
    };
  }

  /**
   * 生成回合执行报告
   */
  generateTurnReport(
    actor: 'dadong' | 'enemy',
    state: LevelGameState,
    decisions: StandardizedDecisionResult[],
    phaseLogs: PhaseLog[],
    strategyInfo?: { currentStrategy: string; strategyDescription: string }
  ): TurnExecutionReport {
    const startTime = phaseLogs.length > 0 ? phaseLogs[0].timestamp : Date.now();
    const endTime = phaseLogs.length > 0 ? phaseLogs[phaseLogs.length - 1].timestamp + phaseLogs[phaseLogs.length - 1].duration : Date.now();

    return {
      actor,
      turn: state.currentTurn,
      round: state.round,
      startTime,
      endTime,
      totalDuration: endTime - startTime,
      decisions,
      phaseLogs,
      strategyInfo,
      summary: {
        totalActions: decisions.length,
        cardsPlayed: decisions.filter(d => d.actionType === 'play_card').length,
        skillsUsed: decisions.filter(d => d.actionType === 'use_skill').length,
        resourcesConsumed: this.calculateTotalResourceConsumption(decisions)
      }
    };
  }

  /**
   * 计算决策统计
   */
  calculateStatistics(decisions: StandardizedDecisionResult[]): DecisionStatistics {
    const totalDecisions = decisions.length;

    // 计算平均优先级
    const averagePriority = totalDecisions > 0
      ? decisions.reduce((sum, d) => sum + d.priorityScore, 0) / totalDecisions
      : 0;

    // 计算平均延迟
    const averageDelay = totalDecisions > 0
      ? decisions.reduce((sum, d) => sum + d.executionMetadata.decisionDelay, 0) / totalDecisions
      : 0;

    // 行动类型分布
    const actionTypeDistribution: Record<string, number> = {};
    decisions.forEach(d => {
      actionTypeDistribution[d.actionType] = (actionTypeDistribution[d.actionType] || 0) + 1;
    });

    // 目标区域分布
    const targetAreaDistribution: Record<string, number> = {};
    decisions.forEach(d => {
      if (d.targetArea) {
        targetAreaDistribution[d.targetArea] = (targetAreaDistribution[d.targetArea] || 0) + 1;
      }
    });

    // 总资源消耗
    const resourceConsumptionTotal = this.calculateTotalResourceConsumption(decisions);

    return {
      totalDecisions,
      averagePriority: Math.round(averagePriority * 10) / 10,
      averageDelay: Math.round(averageDelay),
      actionTypeDistribution,
      targetAreaDistribution,
      resourceConsumptionTotal
    };
  }

  /**
   * 生成决策摘要文本
   */
  generateDecisionSummary(result: StandardizedDecisionResult): string {
    const parts: string[] = [];

    parts.push(`[${result.actor.toUpperCase()}] ${this.formatActionType(result.actionType)}`);

    if (result.targetCard) {
      parts.push(`卡牌：${result.targetCard.name}`);
    }

    if (result.targetArea) {
      parts.push(`区域：${result.targetArea}`);
    }

    parts.push(`优先级：${result.priorityScore}/10`);
    parts.push(`延迟：${result.executionMetadata.decisionDelay}ms`);
    parts.push(`原因：${result.decisionBasis.tacticalReasoning}`);

    return parts.join(' | ');
  }

  /**
   * 格式化行动类型
   */
  private formatActionType(actionType: string): string {
    const typeMap: Record<string, string> = {
      'play_card': '出牌',
      'use_skill': '使用技能',
      'place_marker': '放置标记',
      'skip': '跳过',
      'end_turn': '结束回合'
    };
    return typeMap[actionType] || actionType;
  }

  /**
   * 确定目标对象
   */
  private determineTargetObject(decision: AIDecision, state: LevelGameState): 'player' | 'dadong' | AreaType | undefined {
    if (decision.targetEnemy) {
      return decision.targetEnemy as 'player' | 'dadong';
    }
    return decision.targetArea;
  }

  /**
   * 计算置信度
   */
  private calculateConfidenceLevel(decision: AIDecision, mode: DadongMode): number {
    let baseConfidence = 70;

    // 根据优先级调整
    baseConfidence += (decision.priority || 5) * 2;

    // 根据模式调整
    if (mode === 'emergency') {
      baseConfidence += 10; // 紧急情况下更确定
    }

    return Math.min(95, Math.max(50, baseConfidence));
  }

  /**
   * 计算敌人置信度
   */
  private calculateEnemyConfidenceLevel(decision: AIDecision, strategy: StrategyCondition): number {
    let baseConfidence = 65;

    // 根据优先级调整
    baseConfidence += (decision.priority || 5) * 2;

    // 根据策略侵略性调整
    if (strategy.strategy === 'aggressive') {
      baseConfidence += 5;
    }

    return Math.min(95, Math.max(50, baseConfidence));
  }

  /**
   * 计算资源消耗
   */
  private calculateResourceConsumption(decision: AIDecision): {
    computing?: number;
    funds?: number;
    information?: number;
    actionPoints: number;
  } {
    const consumption: {
      computing?: number;
      funds?: number;
      information?: number;
      actionPoints: number;
    } = {
      actionPoints: 1 // 每个行动消耗1行动点
    };

    if (decision.card?.cost) {
      const cost = decision.card.cost;
      if (cost.compute) consumption.computing = cost.compute;
      if (cost.funds) consumption.funds = cost.funds;
      if (cost.information) consumption.information = cost.information;
    }

    return consumption;
  }

  /**
   * 计算总资源消耗
   */
  private calculateTotalResourceConsumption(decisions: StandardizedDecisionResult[]): {
    computing: number;
    funds: number;
    information: number;
  } {
    return decisions.reduce((total, decision) => ({
      computing: total.computing + (decision.resourceConsumption.computing || 0),
      funds: total.funds + (decision.resourceConsumption.funds || 0),
      information: total.information + (decision.resourceConsumption.information || 0)
    }), { computing: 0, funds: 0, information: 0 });
  }

  /**
   * 生成预期效果
   */
  private generateExpectedEffects(
    decision: AIDecision,
    state: LevelGameState,
    actor: 'dadong' | 'enemy'
  ): {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  } {
    if (actor === 'dadong') {
      return {
        immediate: decision.targetArea ? `在${decision.targetArea}区域产生效果` : '直接生效',
        shortTerm: '提升玩家安全或清除威胁',
        longTerm: '建立区域控制优势，保护玩家安全'
      };
    } else {
      return {
        immediate: decision.targetArea ? `在${decision.targetArea}区域造成压力` : '直接伤害',
        shortTerm: '降低玩家安全等级或占领区域',
        longTerm: '建立攻击优势，逐步压制玩家'
      };
    }
  }

  /**
   * 生成备选方案
   */
  private generateAlternativeOptions(strategy: StrategyCondition): string[] {
    const options: string[] = [];

    switch (strategy.strategy) {
      case 'aggressive':
        options.push('攻击其他区域', '使用技能强化攻击');
        break;
      case 'control':
        options.push('巩固已有控制', '攻击玩家区域');
        break;
      case 'disrupt':
        options.push('破坏资源', '干扰行动');
        break;
      case 'balanced':
      default:
        options.push('均衡发展', '随机应变');
        break;
    }

    return options;
  }

  /**
   * 导出决策报告为JSON
   */
  exportToJSON(report: TurnExecutionReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * 生成人类可读的决策报告
   */
  generateHumanReadableReport(report: TurnExecutionReport): string {
    const lines: string[] = [];

    lines.push(`=== ${report.actor === 'dadong' ? '大东AI' : '敌人AI'} 回合报告 ===`);
    lines.push(`回合：${report.turn} | 轮次：${report.round}`);
    lines.push(`总耗时：${report.totalDuration}ms`);
    lines.push('');

    if (report.strategyInfo) {
      lines.push(`【策略】${report.strategyInfo.currentStrategy}`);
      lines.push(`说明：${report.strategyInfo.strategyDescription}`);
      lines.push('');
    }

    lines.push(`【执行摘要】`);
    lines.push(`总行动数：${report.summary.totalActions}`);
    lines.push(`出牌数：${report.summary.cardsPlayed}`);
    lines.push(`技能使用：${report.summary.skillsUsed}`);
    lines.push(`资源消耗：算力${report.summary.resourcesConsumed.computing} | 资金${report.summary.resourcesConsumed.funds} | 信息${report.summary.resourcesConsumed.information}`);
    lines.push('');

    lines.push(`【详细决策】`);
    report.decisions.forEach((decision, index) => {
      lines.push(`${index + 1}. ${this.generateDecisionSummary(decision)}`);
    });

    return lines.join('\n');
  }
}

export default AIDecisionFormatter;
