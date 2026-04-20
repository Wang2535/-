/**
 * 大东AI行为策略系统
 * 
 * 功能：
 * 1. 三级响应阈值系统（紧急保护/平衡保护/协同进攻）
 * 2. 资源平衡管理
 * 3. 战术配合原则
 * 4. 智能卡牌评估
 */

import type { Card } from '@/types/legacy/card_v16';
import type { LevelGameState, AreaType, DadongAIState } from '@/types/levelTypes';
import type { AIDifficulty, AIDecision, PlayerIntent, ThreatAssessment } from './BaseAI';

// 安全等级阈值
export interface SafetyThresholds {
  emergency: number;    // <40%：紧急保护模式
  balanced: number;     // 40%-70%：平衡保护模式
  cooperative: number;  // >70%：协同进攻模式
}

export const DEFAULT_SAFETY_THRESHOLDS: SafetyThresholds = {
  emergency: 0.4,
  balanced: 0.7,
  cooperative: 0.7
};

// 大东AI模式类型
export type DadongMode = 'emergency' | 'balanced' | 'cooperative';

// 卡牌优先级配置
export interface CardPriority {
  type: string;
  priority: number;
  reason: string;
  condition?: (state: LevelGameState, playerIntent: PlayerIntent) => boolean;
}

// 紧急保护模式优先级
const EMERGENCY_PRIORITIES: CardPriority[] = [
  { type: 'security_gain', priority: 15, reason: '紧急：优先提升玩家安全等级' },
  { type: 'infiltration_reduce', priority: 14, reason: '紧急：优先清除渗透威胁' },
  { type: 'defense_marker', priority: 12, reason: '紧急：部署防御标记' },
  { type: 'damage_reduction', priority: 11, reason: '紧急：减少伤害' },
  { type: 'healing', priority: 10, reason: '紧急：治疗效果' }
];

// 平衡保护模式优先级
const BALANCED_PRIORITIES: CardPriority[] = [
  { 
    type: 'clear_same_area', 
    priority: 12, 
    reason: '配合玩家：清除同一区域敌方标记',
    condition: (state, intent) => intent.targetArea !== undefined
  },
  { type: 'infiltration_reduce', priority: 10, reason: '清除敌方标记' },
  { type: 'security_gain', priority: 8, reason: '提升安全等级' },
  { type: 'area_control', priority: 7, reason: '协助区域控制' },
  { type: 'resource_gain', priority: 6, reason: '补充资源' }
];

// 协同进攻模式优先级
const COOPERATIVE_PRIORITIES: CardPriority[] = [
  { type: 'attack_support', priority: 11, reason: '支援玩家进攻' },
  { type: 'area_control', priority: 9, reason: '协助区域控制' },
  { type: 'resource_balance', priority: 7, reason: '维持资源平衡' },
  { type: 'security_gain', priority: 6, reason: '保持安全等级' },
  { type: 'infiltration_reduce', priority: 5, reason: '清除威胁' }
];

// 资源类型
export type ResourceType = 'computing' | 'funds' | 'information';

// 资源平衡规则
export interface ResourceBalanceRule {
  minReserve: number;       // 最低保留量
  targetRatio: number;      // 目标资源比例
  emergencyThreshold: number; // 紧急补充阈值
  priority: number;         // 补充优先级
}

export const DADONG_RESOURCE_RULES: Record<ResourceType, ResourceBalanceRule> = {
  computing: { 
    minReserve: 3, 
    targetRatio: 0.33, 
    emergencyThreshold: 2,
    priority: 8
  },
  funds: { 
    minReserve: 3, 
    targetRatio: 0.33, 
    emergencyThreshold: 2,
    priority: 7
  },
  information: { 
    minReserve: 2, 
    targetRatio: 0.33, 
    emergencyThreshold: 1,
    priority: 6
  }
};

// 难度行为配置
interface DifficultyBehaviorConfig {
  decisionQualityMultiplier: number;
  mistakeProbability: number;
  resourceEfficiency: number;
  cooperationAccuracy: number;
  reserveStrategy: 'aggressive' | 'balanced' | 'conservative';
}

const DIFFICULTY_BEHAVIOR: Record<AIDifficulty, DifficultyBehaviorConfig> = {
  easy: {
    decisionQualityMultiplier: 0.7,
    mistakeProbability: 0.3,
    resourceEfficiency: 0.8,
    cooperationAccuracy: 0.6,
    reserveStrategy: 'aggressive'
  },
  medium: {
    decisionQualityMultiplier: 1.0,
    mistakeProbability: 0.15,
    resourceEfficiency: 1.0,
    cooperationAccuracy: 0.8,
    reserveStrategy: 'balanced'
  },
  hard: {
    decisionQualityMultiplier: 1.2,
    mistakeProbability: 0.05,
    resourceEfficiency: 1.15,
    cooperationAccuracy: 0.95,
    reserveStrategy: 'conservative'
  }
};

export class DadongAIStrategy {
  private state: LevelGameState | null = null;
  private difficulty: AIDifficulty;
  private thresholds: SafetyThresholds;

  constructor(difficulty: AIDifficulty = 'medium', thresholds: Partial<SafetyThresholds> = {}) {
    this.difficulty = difficulty;
    this.thresholds = { ...DEFAULT_SAFETY_THRESHOLDS, ...thresholds };
  }

  /**
   * 设置游戏状态
   */
  setState(state: LevelGameState): void {
    this.state = state;
  }

  /**
   * 设置难度
   */
  setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * 确定当前AI模式
   */
  determineMode(playerIntent: PlayerIntent): DadongMode {
    const securityRatio = playerIntent.securityRatio;

    if (securityRatio < this.thresholds.emergency) {
      return 'emergency';
    } else if (securityRatio > this.thresholds.cooperative) {
      return 'cooperative';
    } else {
      return 'balanced';
    }
  }

  /**
   * 获取当前模式的优先级列表
   */
  getModePriorities(mode: DadongMode): CardPriority[] {
    switch (mode) {
      case 'emergency':
        return EMERGENCY_PRIORITIES;
      case 'balanced':
        return BALANCED_PRIORITIES;
      case 'cooperative':
        return COOPERATIVE_PRIORITIES;
      default:
        return BALANCED_PRIORITIES;
    }
  }

  /**
   * 评估卡牌价值
   */
  evaluateCard(
    card: Card,
    playerIntent: PlayerIntent,
    threatAssessment: ThreatAssessment
  ): AIDecision | null {
    if (!this.state) return null;

    const dadong = this.state.dadongAIState;
    const mode = this.determineMode(playerIntent);
    const priorities = this.getModePriorities(mode);

    // 检查资源是否充足
    if (!this.hasSufficientResources(card, dadong)) {
      return null;
    }

    // 获取卡牌效果类型
    const effectType = this.getCardEffectType(card);
    
    // 查找对应的优先级配置
    let priorityConfig = priorities.find(p => p.type === effectType);
    
    // 如果没有直接匹配，尝试其他匹配逻辑
    if (!priorityConfig) {
      priorityConfig = this.findAlternativePriority(card, priorities, playerIntent);
    }

    if (!priorityConfig) {
      return null;
    }

    // 检查条件
    if (priorityConfig.condition && !priorityConfig.condition(this.state, playerIntent)) {
      return null;
    }

    // 计算最终优先级
    let finalPriority = priorityConfig.priority;
    
    // 应用难度系数
    const behaviorConfig = DIFFICULTY_BEHAVIOR[this.difficulty];
    finalPriority *= behaviorConfig.decisionQualityMultiplier;

    // 应用随机因素（模拟人类不完美的决策）
    if (Math.random() < behaviorConfig.mistakeProbability) {
      finalPriority *= 0.8;
    }

    // 确定目标区域
    const targetArea = this.determineTargetArea(card, playerIntent, threatAssessment);

    return {
      action: 'play_card',
      card,
      targetArea,
      reason: priorityConfig.reason,
      priority: Math.round(finalPriority)
    };
  }

  /**
   * 检查资源是否充足
   */
  private hasSufficientResources(card: Card, dadong: DadongAIState): boolean {
    const cost = card.cost || {};
    
    // 检查行动点
    if (dadong.actionPoints <= 0) {
      return false;
    }

    // 检查资源
    if (cost.compute && dadong.resources.computing < cost.compute) {
      return false;
    }
    if (cost.funds && dadong.resources.funds < cost.funds) {
      return false;
    }
    if (cost.information && dadong.resources.information < cost.information) {
      return false;
    }

    // 检查资源保留策略
    return this.checkResourceReserveStrategy(card, dadong);
  }

  /**
   * 检查资源保留策略
   */
  private checkResourceReserveStrategy(card: Card, dadong: DadongAIState): boolean {
    const behaviorConfig = DIFFICULTY_BEHAVIOR[this.difficulty];
    const cost = card.cost || {};

    // 根据策略调整保留量
    let reserveMultiplier = 1;
    switch (behaviorConfig.reserveStrategy) {
      case 'aggressive':
        reserveMultiplier = 0.5;
        break;
      case 'conservative':
        reserveMultiplier = 1.5;
        break;
      case 'balanced':
      default:
        reserveMultiplier = 1;
        break;
    }

    // 检查每种资源
    for (const [resource, rule] of Object.entries(DADONG_RESOURCE_RULES)) {
      const currentAmount = dadong.resources[resource as ResourceType];
      const costAmount = cost[resource as keyof typeof cost] || 0;
      const minReserve = Math.ceil(rule.minReserve * reserveMultiplier);

      if (currentAmount - costAmount < minReserve) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取卡牌效果类型
   */
  private getCardEffectType(card: Card): string {
    const effect = card.effects?.[0];
    if (!effect) return 'unknown';

    // 根据效果类型映射
    switch (effect.type) {
      case 'security_gain':
      case 'defense':
        return 'security_gain';
      case 'infiltration_reduce':
      case 'attack':
        return 'infiltration_reduce';
      case 'resource_gain':
        return 'resource_gain';
      case 'marker':
        return 'defense_marker';
      default:
        return effect.type;
    }
  }

  /**
   * 查找替代优先级
   */
  private findAlternativePriority(
    card: Card,
    priorities: CardPriority[],
    playerIntent: PlayerIntent
  ): CardPriority | null {
    const effect = card.effects?.[0];
    if (!effect) return null;

    // 根据效果描述匹配
    const effectDesc = effect.description?.toLowerCase() || '';

    if (effectDesc.includes('安全') || effectDesc.includes('防御')) {
      return priorities.find(p => p.type === 'security_gain') || null;
    }
    if (effectDesc.includes('清除') || effectDesc.includes('标记')) {
      return priorities.find(p => p.type === 'infiltration_reduce') || null;
    }
    if (effectDesc.includes('资源')) {
      return priorities.find(p => p.type === 'resource_gain') || null;
    }

    return null;
  }

  /**
   * 确定目标区域
   */
  private determineTargetArea(
    card: Card,
    playerIntent: PlayerIntent,
    threatAssessment: ThreatAssessment
  ): AreaType {
    // 协同策略：优先配合玩家的目标区域
    if (playerIntent.targetArea && this.shouldUsePlayerTargetArea(card, playerIntent)) {
      return playerIntent.targetArea;
    }

    // 选择威胁最高的区域
    if (threatAssessment.criticalTargets.length > 0) {
      return threatAssessment.criticalTargets[0];
    }

    // 选择威胁值最高的区域
    let maxThreat = -1;
    let bestArea: AreaType = 'internal';
    
    for (const [area, threat] of Object.entries(threatAssessment.areaThreats)) {
      if (threat > maxThreat) {
        maxThreat = threat;
        bestArea = area as AreaType;
      }
    }

    return bestArea;
  }

  /**
   * 是否应该使用玩家的目标区域
   */
  private shouldUsePlayerTargetArea(card: Card, playerIntent: PlayerIntent): boolean {
    if (!playerIntent.targetArea) return false;

    const behaviorConfig = DIFFICULTY_BEHAVIOR[this.difficulty];
    
    // 根据协同准确度决定是否配合
    return Math.random() < behaviorConfig.cooperationAccuracy;
  }

  /**
   * 评估资源需求
   */
  evaluateResourceNeeds(dadong: DadongAIState): ResourceType[] {
    const needs: ResourceType[] = [];

    for (const [resource, rule] of Object.entries(DADONG_RESOURCE_RULES)) {
      const currentAmount = dadong.resources[resource as ResourceType];
      
      if (currentAmount <= rule.emergencyThreshold) {
        needs.push(resource as ResourceType);
      }
    }

    // 按优先级排序
    needs.sort((a, b) => DADONG_RESOURCE_RULES[b].priority - DADONG_RESOURCE_RULES[a].priority);

    return needs;
  }

  /**
   * 生成决策依据
   */
  generateDecisionBasis(
    decision: AIDecision,
    mode: DadongMode,
    playerIntent: PlayerIntent
  ): {
    strategicConsideration: string;
    tacticalReasoning: string;
    alternativeOptions: string[];
    riskAssessment: string;
  } {
    const strategicConsideration = this.getStrategicConsideration(mode, playerIntent);
    const tacticalReasoning = decision.reason;
    
    const alternativeOptions = this.getAlternativeOptions(mode);
    
    const riskAssessment = this.assessRisk(decision, playerIntent);

    return {
      strategicConsideration,
      tacticalReasoning,
      alternativeOptions,
      riskAssessment
    };
  }

  /**
   * 获取战略考量
   */
  private getStrategicConsideration(mode: DadongMode, playerIntent: PlayerIntent): string {
    switch (mode) {
      case 'emergency':
        return `玩家安全等级${Math.round(playerIntent.securityRatio * 100)}%处于危险状态，优先执行保护策略`;
      case 'balanced':
        return `玩家安全等级${Math.round(playerIntent.securityRatio * 100)}%处于平衡状态，兼顾保护与进攻`;
      case 'cooperative':
        return `玩家安全等级${Math.round(playerIntent.securityRatio * 100)}%良好，执行协同进攻策略`;
      default:
        return '执行标准策略';
    }
  }

  /**
   * 获取备选方案
   */
  private getAlternativeOptions(mode: DadongMode): string[] {
    const priorities = this.getModePriorities(mode);
    return priorities.slice(1, 4).map(p => p.reason);
  }

  /**
   * 风险评估
   */
  private assessRisk(decision: AIDecision, playerIntent: PlayerIntent): string {
    if (playerIntent.securityRatio < 0.3) {
      return '高风险：玩家安全等级极低，任何失误都可能导致失败';
    } else if (playerIntent.securityRatio < 0.5) {
      return '中风险：玩家安全等级偏低，需要谨慎行动';
    } else {
      return '低风险：玩家安全等级良好，可以适度冒险';
    }
  }

  /**
   * 获取模式描述
   */
  getModeDescription(mode: DadongMode): { name: string; description: string } {
    switch (mode) {
      case 'emergency':
        return {
          name: '紧急保护模式',
          description: '玩家安全等级低于40%，优先执行保护措施'
        };
      case 'balanced':
        return {
          name: '平衡保护模式',
          description: '玩家安全等级40%-70%，兼顾保护与协同'
        };
      case 'cooperative':
        return {
          name: '协同进攻模式',
          description: '玩家安全等级高于70%，全力配合玩家进攻'
        };
    }
  }
}

export default DadongAIStrategy;
