/**
 * 敌人AI动态策略系统
 * 
 * 功能：
 * 1. 动态策略选择机制（激进/控制/干扰/平衡）
 * 2. 增强威胁评估系统
 * 3. 预测性威胁分析
 * 4. 智能行动选择
 */

import type { LevelGameState, AreaType } from '@/types/levelTypes';
import type { AIDifficulty, PlayerIntent, ThreatAssessment } from './BaseAI';

// 敌人策略类型
export type EnemyStrategy = 'aggressive' | 'control' | 'disrupt' | 'balanced';

// 策略条件配置
export interface StrategyCondition {
  strategy: EnemyStrategy;
  name: string;
  description: string;
  conditions: {
    playerSecurityBelow?: number;           // 玩家安全等级低于
    neutralAreasAtLeast?: number;           // 中立区域至少
    infiltrationLevelAtLeast?: number;      // 渗透等级至少
    playerControlledAreasAtMost?: number;   // 玩家控制区域最多
    enemyControlledAreasAtLeast?: number;   // 敌方控制区域至少
    overallThreatAbove?: number;            // 总体威胁高于
  };
  priority: number;
  difficulty: AIDifficulty[];  // 适用难度
}

// 策略条件表（按优先级排序）
const STRATEGY_CONDITIONS: StrategyCondition[] = [
  {
    strategy: 'aggressive',
    name: '激进打击',
    description: '玩家防御弱，集中火力攻击',
    conditions: { playerSecurityBelow: 50 },
    priority: 10,
    difficulty: ['easy', 'medium', 'hard']
  },
  {
    strategy: 'aggressive',
    name: '乘胜追击',
    description: '玩家安全等级高但控制区域多，需要压制',
    conditions: { playerSecurityBelow: 70, playerControlledAreasAtMost: 2 },
    priority: 9,
    difficulty: ['hard']
  },
  {
    strategy: 'control',
    name: '区域扩张',
    description: '中立区域多，优先占领',
    conditions: { neutralAreasAtLeast: 2 },
    priority: 8,
    difficulty: ['easy', 'medium', 'hard']
  },
  {
    strategy: 'control',
    name: '巩固控制',
    description: '敌方控制区域少，需要扩张',
    conditions: { enemyControlledAreasAtLeast: 0, neutralAreasAtLeast: 1 },
    priority: 7,
    difficulty: ['medium', 'hard']
  },
  {
    strategy: 'disrupt',
    name: '深度干扰',
    description: '渗透等级高，使用干扰技能',
    conditions: { infiltrationLevelAtLeast: 3, playerSecurityBelow: 60 },
    priority: 7,
    difficulty: ['medium', 'hard']
  },
  {
    strategy: 'disrupt',
    name: '信息战',
    description: '高威胁态势，破坏玩家资源',
    conditions: { overallThreatAbove: 20 },
    priority: 6,
    difficulty: ['hard']
  },
  {
    strategy: 'balanced',
    name: '均衡发展',
    description: '标准平衡策略',
    conditions: {},
    priority: 5,
    difficulty: ['easy', 'medium', 'hard']
  }
];

// 增强威胁评估
export interface EnhancedThreatAssessment extends ThreatAssessment {
  playerVulnerability: number;           // 玩家脆弱度（0-100）
  resourceAdvantage: number;             // 资源优势比
  areaControlTrend: 'improving' | 'stable' | 'worsening';  // 控制趋势
  upcomingThreats: UpcomingThreat[];     // 预测威胁
  criticalAreas: AreaType[];             // 关键区域
  weakPoints: WeakPoint[];               // 玩家弱点
}

// 预测威胁
export interface UpcomingThreat {
  turn: number;
  threatType: 'attack' | 'skill' | 'marker' | 'infiltration';
  targetArea?: AreaType;
  estimatedDamage: number;
  probability: number;
}

// 玩家弱点
export interface WeakPoint {
  type: 'low_security' | 'uncontrolled_area' | 'low_resources' | 'exposed_area';
  area?: AreaType;
  severity: number;  // 1-10
  description: string;
}

// 行动评估结果
export interface ActionEvaluation {
  action: string;
  targetArea?: AreaType;
  priority: number;
  expectedDamage: number;
  risk: number;
  resourceCost: {
    computing?: number;
    funds?: number;
    information?: number;
  };
  reasoning: string;
}

// 难度行为配置
interface DifficultyBehaviorConfig {
  decisionQualityMultiplier: number;
  mistakeProbability: number;
  foresightDepth: number;        // 预见深度（回合数）
  adaptationSpeed: number;       // 策略调整速度
  aggressionLevel: number;       // 侵略性水平
}

const DIFFICULTY_BEHAVIOR: Record<AIDifficulty, DifficultyBehaviorConfig> = {
  easy: {
    decisionQualityMultiplier: 0.7,
    mistakeProbability: 0.3,
    foresightDepth: 1,
    adaptationSpeed: 0.5,
    aggressionLevel: 0.6
  },
  medium: {
    decisionQualityMultiplier: 1.0,
    mistakeProbability: 0.15,
    foresightDepth: 2,
    adaptationSpeed: 0.8,
    aggressionLevel: 0.8
  },
  hard: {
    decisionQualityMultiplier: 1.2,
    mistakeProbability: 0.05,
    foresightDepth: 3,
    adaptationSpeed: 1.0,
    aggressionLevel: 1.0
  }
};

export class EnemyAIStrategy {
  private state: LevelGameState | null = null;
  private difficulty: AIDifficulty;
  private currentStrategy: EnemyStrategy = 'balanced';
  private strategyHistory: { strategy: EnemyStrategy; turn: number }[] = [];

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
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
   * 分析战场并选择策略
   */
  analyzeBattlefieldAndChooseStrategy(): StrategyCondition {
    if (!this.state) {
      return STRATEGY_CONDITIONS.find(s => s.strategy === 'balanced')!;
    }

    const behaviorConfig = DIFFICULTY_BEHAVIOR[this.difficulty];
    
    // 统计战场情况
    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;

    let playerControlledAreas = 0;
    let enemyControlledAreas = 0;
    let neutralAreas = 0;

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const controller = this.state.areaControl[area].controller;
      if (controller === 'player') playerControlledAreas++;
      else if (controller === 'enemy') enemyControlledAreas++;
      else neutralAreas++;
    }

    const infiltrationLevel = this.state.enemyState.infiltrationLevel;
    const threatAssessment = this.calculateThreatAssessment();

    // 评估每个策略条件
    const validStrategies: { condition: StrategyCondition; score: number }[] = [];

    for (const condition of STRATEGY_CONDITIONS) {
      // 检查难度适用性
      if (!condition.difficulty.includes(this.difficulty)) continue;

      let matches = true;
      let score = condition.priority;

      // 检查各个条件
      if (condition.conditions.playerSecurityBelow !== undefined) {
        if (securityRatio * 100 > condition.conditions.playerSecurityBelow) {
          matches = false;
        }
      }

      if (condition.conditions.neutralAreasAtLeast !== undefined) {
        if (neutralAreas < condition.conditions.neutralAreasAtLeast) {
          matches = false;
        }
      }

      if (condition.conditions.infiltrationLevelAtLeast !== undefined) {
        if (infiltrationLevel < condition.conditions.infiltrationLevelAtLeast) {
          matches = false;
        }
      }

      if (condition.conditions.playerControlledAreasAtMost !== undefined) {
        if (playerControlledAreas > condition.conditions.playerControlledAreasAtMost) {
          matches = false;
        }
      }

      if (condition.conditions.enemyControlledAreasAtLeast !== undefined) {
        if (enemyControlledAreas < condition.conditions.enemyControlledAreasAtLeast) {
          matches = false;
        }
      }

      if (condition.conditions.overallThreatAbove !== undefined) {
        if (threatAssessment.overallThreat <= condition.conditions.overallThreatAbove) {
          matches = false;
        }
      }

      if (matches) {
        // 应用难度系数
        score *= behaviorConfig.decisionQualityMultiplier;
        
        // 应用侵略性调整
        if (condition.strategy === 'aggressive') {
          score *= behaviorConfig.aggressionLevel;
        }

        validStrategies.push({ condition, score });
      }
    }

    // 按分数排序，选择最高分的策略
    validStrategies.sort((a, b) => b.score - a.score);

    // 考虑策略连续性（避免频繁切换）
    const selectedStrategy = this.selectStrategyWithContinuity(validStrategies);

    // 记录策略历史
    this.strategyHistory.push({ 
      strategy: selectedStrategy.strategy, 
      turn: this.state.currentTurn 
    });
    
    // 只保留最近10个回合的历史
    if (this.strategyHistory.length > 10) {
      this.strategyHistory.shift();
    }

    this.currentStrategy = selectedStrategy.strategy;

    return selectedStrategy;
  }

  /**
   * 选择策略（考虑连续性）
   */
  private selectStrategyWithContinuity(
    validStrategies: { condition: StrategyCondition; score: number }[]
  ): StrategyCondition {
    if (validStrategies.length === 0) {
      return STRATEGY_CONDITIONS.find(s => s.strategy === 'balanced')!;
    }

    const behaviorConfig = DIFFICULTY_BEHAVIOR[this.difficulty];
    
    // 如果当前策略在有效列表中，有一定概率保持当前策略
    if (this.strategyHistory.length > 0) {
      const lastStrategy = this.strategyHistory[this.strategyHistory.length - 1].strategy;
      const currentInList = validStrategies.find(s => s.condition.strategy === lastStrategy);
      
      if (currentInList && Math.random() < behaviorConfig.adaptationSpeed * 0.7) {
        // 平滑过渡：如果当前策略仍然有效，保持它
        return currentInList.condition;
      }
    }

    // 随机因素（模拟不完美决策）
    if (Math.random() < behaviorConfig.mistakeProbability) {
      // 随机选择一个次优策略
      const randomIndex = Math.floor(Math.random() * Math.min(3, validStrategies.length));
      return validStrategies[randomIndex].condition;
    }

    return validStrategies[0].condition;
  }

  /**
   * 计算威胁评估
   */
  calculateThreatAssessment(): EnhancedThreatAssessment {
    if (!this.state) {
      return {
        overallThreat: 0,
        areaThreats: {} as Record<AreaType, number>,
        criticalTargets: [],
        playerVulnerability: 0,
        resourceAdvantage: 1,
        areaControlTrend: 'stable',
        upcomingThreats: [],
        criticalAreas: [],
        weakPoints: []
      };
    }

    const areaThreats: Record<AreaType, number> = {} as Record<AreaType, number>;
    const criticalTargets: AreaType[] = [];
    const criticalAreas: AreaType[] = [];
    let overallThreat = 0;

    // 区域重要性权重
    const areaImportance: Record<AreaType, number> = {
      internal: 10,
      industrial: 8,
      dmz: 5,
      external: 3
    };

    // 计算各区域威胁
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      let threat = 0;

      // 基础威胁：敌方标记数
      threat += areaState.attackMarkers * 2;
      
      // 区域重要性
      threat += areaImportance[area];

      // 区域状态加成
      if (areaState.controller === 'player') {
        threat += 5;  // 攻击玩家控制区域
      } else if (areaState.controller === 'neutral') {
        threat += 3;  // 容易占领
      }

      // 标记差距
      const markerGap = areaState.attackMarkers - areaState.defenseMarkers;
      if (markerGap > 0) {
        threat += markerGap * 1.5;
      }

      areaThreats[area] = threat;
      overallThreat += threat;

      // 标记关键目标
      if (threat > 15) {
        criticalTargets.push(area);
      }
      if (threat > 12) {
        criticalAreas.push(area);
      }
    }

    // 计算玩家脆弱度
    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;
    const playerVulnerability = Math.round((1 - securityRatio) * 100);

    // 计算资源优势比
    const enemyResources = this.state.enemyState.resources;
    const playerResources = this.state.playerState.resources;
    const enemyTotal = enemyResources.computing + enemyResources.funds + enemyResources.information;
    const playerTotal = playerResources.computing + playerResources.funds + playerResources.information;
    const resourceAdvantage = playerTotal > 0 ? enemyTotal / playerTotal : 1;

    // 计算控制趋势
    const areaControlTrend = this.calculateControlTrend();

    // 预测威胁
    const upcomingThreats = this.predictUpcomingThreats();

    // 识别弱点
    const weakPoints = this.identifyWeakPoints();

    return {
      overallThreat,
      areaThreats,
      criticalTargets,
      playerVulnerability,
      resourceAdvantage,
      areaControlTrend,
      upcomingThreats,
      criticalAreas,
      weakPoints
    };
  }

  /**
   * 计算控制趋势
   */
  private calculateControlTrend(): 'improving' | 'stable' | 'worsening' {
    if (this.strategyHistory.length < 3) return 'stable';

    // 分析最近3个回合的区域控制变化
    let improvingCount = 0;
    let worseningCount = 0;

    // 简化版：基于渗透等级变化判断
    const currentInfiltration = this.state?.enemyState.infiltrationLevel || 0;
    
    if (currentInfiltration > 5) return 'improving';
    if (currentInfiltration < 2) return 'worsening';
    
    return 'stable';
  }

  /**
   * 预测即将到来的威胁
   */
  private predictUpcomingThreats(): UpcomingThreat[] {
    if (!this.state) return [];

    const threats: UpcomingThreat[] = [];
    const behaviorConfig = DIFFICULTY_BEHAVIOR[this.difficulty];

    // 基于当前状态预测未来威胁
    for (let i = 1; i <= behaviorConfig.foresightDepth; i++) {
      // 预测攻击
      if (this.state.enemyState.infiltrationLevel > i * 2) {
        threats.push({
          turn: this.state.currentTurn + i,
          threatType: 'attack',
          estimatedDamage: 3 + i,
          probability: 0.6 + (i * 0.1)
        });
      }

      // 预测渗透
      if (this.state.enemyState.infiltrationLevel > 5) {
        threats.push({
          turn: this.state.currentTurn + i,
          threatType: 'infiltration',
          estimatedDamage: 2,
          probability: 0.5
        });
      }
    }

    return threats;
  }

  /**
   * 识别玩家弱点
   */
  private identifyWeakPoints(): WeakPoint[] {
    if (!this.state) return [];

    const weakPoints: WeakPoint[] = [];

    // 检查安全等级
    const securityRatio = this.state.playerState.securityLevel / this.state.playerState.maxSecurityLevel;
    if (securityRatio < 0.4) {
      weakPoints.push({
        type: 'low_security',
        severity: Math.round((1 - securityRatio) * 10),
        description: '玩家安全等级极低'
      });
    }

    // 检查未控制区域
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      if (areaState.controller !== 'player' && areaState.attackMarkers > 2) {
        weakPoints.push({
          type: 'uncontrolled_area',
          area,
          severity: Math.min(10, areaState.attackMarkers * 2),
          description: `${area}区域失控且有大量敌方标记`
        });
      }
    }

    // 检查资源
    const playerResources = this.state.playerState.resources;
    if (playerResources.computing < 3 || playerResources.funds < 3) {
      weakPoints.push({
        type: 'low_resources',
        severity: 5,
        description: '玩家资源不足'
      });
    }

    return weakPoints.sort((a, b) => b.severity - a.severity);
  }

  /**
   * 评估行动
   */
  evaluateActions(strategy: StrategyCondition): ActionEvaluation[] {
    if (!this.state) return [];

    const actions: ActionEvaluation[] = [];
    const threatAssessment = this.calculateThreatAssessment();

    // 根据策略生成候选行动
    switch (strategy.strategy) {
      case 'aggressive':
        actions.push(...this.generateAggressiveActions(threatAssessment));
        break;
      case 'control':
        actions.push(...this.generateControlActions(threatAssessment));
        break;
      case 'disrupt':
        actions.push(...this.generateDisruptActions(threatAssessment));
        break;
      case 'balanced':
      default:
        actions.push(...this.generateBalancedActions(threatAssessment));
        break;
    }

    // 按优先级排序
    actions.sort((a, b) => b.priority - a.priority);

    return actions;
  }

  /**
   * 生成激进策略行动
   */
  private generateAggressiveActions(threatAssessment: EnhancedThreatAssessment): ActionEvaluation[] {
    const actions: ActionEvaluation[] = [];

    // 攻击玩家安全等级
    actions.push({
      action: 'attack_security',
      priority: 10,
      expectedDamage: 5,
      risk: 3,
      resourceCost: { computing: 2 },
      reasoning: '激进策略：直接攻击玩家安全等级'
    });

    // 在关键区域放置标记
    for (const area of threatAssessment.criticalTargets) {
      actions.push({
        action: 'place_marker',
        targetArea: area,
        priority: 9,
        expectedDamage: 3,
        risk: 2,
        resourceCost: { funds: 1 },
        reasoning: `激进策略：在关键区域${area}放置攻击标记`
      });
    }

    return actions;
  }

  /**
   * 生成控制策略行动
   */
  private generateControlActions(threatAssessment: EnhancedThreatAssessment): ActionEvaluation[] {
    const actions: ActionEvaluation[] = [];

    if (!this.state) return actions;

    // 占领中立区域
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      if (areaState.controller === 'neutral') {
        actions.push({
          action: 'occupy_area',
          targetArea: area,
          priority: 8,
          expectedDamage: 2,
          risk: 1,
          resourceCost: { funds: 2 },
          reasoning: `控制策略：占领中立区域${area}`
        });
      }
    }

    // 巩固已有控制区域
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      if (areaState.controller === 'enemy') {
        actions.push({
          action: 'reinforce_area',
          targetArea: area,
          priority: 6,
          expectedDamage: 1,
          risk: 1,
          resourceCost: { funds: 1 },
          reasoning: `控制策略：巩固${area}区域控制`
        });
      }
    }

    return actions;
  }

  /**
   * 生成干扰策略行动
   */
  private generateDisruptActions(threatAssessment: EnhancedThreatAssessment): ActionEvaluation[] {
    const actions: ActionEvaluation[] = [];

    // 使用技能干扰
    actions.push({
      action: 'use_skill',
      priority: 8,
      expectedDamage: 4,
      risk: 2,
      resourceCost: { information: 2 },
      reasoning: '干扰策略：使用技能干扰玩家行动'
    });

    // 破坏资源
    actions.push({
      action: 'disrupt_resources',
      priority: 7,
      expectedDamage: 3,
      risk: 2,
      resourceCost: { computing: 2 },
      reasoning: '干扰策略：破坏玩家资源'
    });

    return actions;
  }

  /**
   * 生成平衡策略行动
   */
  private generateBalancedActions(threatAssessment: EnhancedThreatAssessment): ActionEvaluation[] {
    const actions: ActionEvaluation[] = [];

    // 均衡发展：混合行动
    actions.push({
      action: 'balanced_attack',
      priority: 6,
      expectedDamage: 3,
      risk: 2,
      resourceCost: { computing: 1, funds: 1 },
      reasoning: '平衡策略：均衡发展攻击与控制'
    });

    // 随机区域放置标记
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    actions.push({
      action: 'place_marker',
      targetArea: randomArea,
      priority: 5,
      expectedDamage: 2,
      risk: 1,
      resourceCost: { funds: 1 },
      reasoning: `平衡策略：在${randomArea}区域放置标记`
    });

    return actions;
  }

  /**
   * 获取当前策略
   */
  getCurrentStrategy(): EnemyStrategy {
    return this.currentStrategy;
  }

  /**
   * 获取策略历史
   */
  getStrategyHistory(): { strategy: EnemyStrategy; turn: number }[] {
    return [...this.strategyHistory];
  }

  /**
   * 生成策略报告
   */
  generateStrategyReport(strategy: StrategyCondition): {
    strategyName: string;
    description: string;
    reasoning: string;
    expectedActions: string[];
  } {
    const actionEvaluations = this.evaluateActions(strategy);
    const topActions = actionEvaluations.slice(0, 3);

    return {
      strategyName: strategy.name,
      description: strategy.description,
      reasoning: `基于当前战场态势选择${strategy.name}：${strategy.description}`,
      expectedActions: topActions.map(a => `${a.action} (${a.reasoning})`)
    };
  }
}

export default EnemyAIStrategy;
