/**
 * 《道高一丈：数字博弈》v16.0 玩家类型定义
 * 基于渗透等级/安全等级科技树系统重构
 */

import { Resources, TechLevel, ComboState, SustainEffectState, SuppressState } from './card_v16';

// ==================== 玩家基础类型 ====================

/** 玩家阵营 */
export type PlayerFaction = 'attack' | 'defense';

/** 玩家类型（人类/AI） */
export type PlayerType = 'human' | 'ai';

/** AI难度 */
export type AIDifficulty = 'easy' | 'normal' | 'hard';

/** 玩家状态 */
export type PlayerStatus = 
  | 'waiting'      // 等待中
  | 'playing'      // 行动中
  | 'ready'        // 已就绪
  | 'disconnected'; // 断开连接

// ==================== 等级资源系统 ====================

/** 等级资源 - v16.0核心系统 */
export interface LevelResources {
  infiltrationLevel: number;  // 渗透等级 (0-75)
  securityLevel: number;      // 安全等级 (0-75)
}

/** 等级变化限制 */
export interface LevelLimits {
  min: number;  // 最小值（通常为0）
  max: number;  // 最大值（通常为75）
  victoryThreshold: number;  // 胜利阈值
}

// ==================== 玩家核心定义 ====================

/** 玩家定义 */
export interface Player {
  id: string;                    // 唯一ID
  name: string;                  // 玩家名称
  faction: PlayerFaction;        // 阵营
  type: PlayerType;              // 玩家类型
  
  // AI相关
  aiDifficulty?: AIDifficulty;   // AI难度（仅AI玩家）
  aiPersonality?: string;        // AI性格（策略倾向）
  
  // 资源系统
  resources: Resources;          // 当前资源
  resourceLimits: Resources;     // 资源上限
  
  // 等级系统 - v16.0核心
  levelResources: LevelResources; // 等级资源
  techLevel: TechLevel;           // 当前科技等级
  
  // 卡牌系统
  hand: string[];                // 手牌（卡牌代码列表）
  deck: string[];                // 牌库
  discardPile: string[];         // 弃牌堆
  
  // 游戏状态
  status: PlayerStatus;
  isReady: boolean;              // 是否就绪
  isAlive: boolean;              // 是否存活
  
  // 回合状态
  actionPoints: number;          // 当前行动点
  maxActionPoints: number;       // 最大行动点
  cardsPlayedThisTurn: number;   // 本回合已出牌数
  
  // 连击系统
  comboState: ComboState | null; // 当前连击状态
  
  // 统计数据
  stats: PlayerStats;
}

/** 玩家统计数据 */
export interface PlayerStats {
  // 游戏统计
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  
  // 本局统计
  cardsPlayed: number;           // 出牌总数
  cardsDrawn: number;            // 抽牌总数
  resourcesGained: Resources;    // 获得资源统计
  resourcesSpent: Resources;     // 消耗资源统计
  
  // 等级变化统计
  infiltrationGained: number;    // 渗透等级提升总量
  infiltrationReduced: number;   // 渗透等级降低总量（被攻击）
  securityGained: number;        // 安全等级提升总量
  securityReduced: number;       // 安全等级降低总量（被攻击）
  
  // 判定统计
  diceChecksTotal: number;       // 判定总次数
  diceChecksSuccess: number;     // 判定成功次数
  diceChecksCritical: number;    // 大成功次数
  
  // 效果统计
  sustainEffectsApplied: number; // 施加持续效果次数
  sustainEffectsReceived: number; // 受到持续效果次数
  counterEffectsTriggered: number; // 反击效果触发次数
}

// ==================== 玩家状态追踪 ====================

/** 玩家回合状态 */
export interface PlayerTurnState {
  playerId: string;
  round: number;
  
  // 回合资源
  startingResources: Resources;  // 回合开始资源
  endingResources: Resources;    // 回合结束资源
  
  // 回合行动
  cardsPlayed: string[];         // 本回合打出的卡牌
  cardsDrawn: string[];          // 本回合抽的卡牌
  
  // 回合效果
  effectsApplied: string[];      // 本回合施加的效果
  effectsReceived: string[];     // 本回合受到的效果
  
  // 等级变化
  levelChanges: {
    infiltrationChange: number;
    securityChange: number;
  };
  
  // 时间
  startTime: number;
  endTime: number;
  duration: number;              // 回合持续时间（毫秒）
}

/** 玩家保护状态 */
export interface PlayerProtectionState {
  playerId: string;
  
  // 免疫效果
  immunities: {
    type: string;                // 免疫类型
    source: string;              // 来源卡牌
    remainingRounds: number;     // 剩余回合
  }[];
  
  // 减伤效果
  damageReduction: {
    percentage: number;          // 减伤百分比
    source: string;
    remainingRounds: number;
  }[];
  
  // 资源保护
  resourceProtection: {
    resourceType: keyof Resources;
    protectionType: 'immune' | 'reduction';
    value: number;
    remainingRounds: number;
  }[];
}

// ==================== 玩家状态管理 ====================

/** 玩家状态快照（用于保存/恢复） */
export interface PlayerStateSnapshot {
  timestamp: number;
  player: Player;
  sustainEffects: SustainEffectState[];
  suppressStates: SuppressState[];
  protectionState: PlayerProtectionState;
}

/** 玩家状态变更记录 */
export interface PlayerStateChange {
  timestamp: number;
  playerId: string;
  changeType: 
    | 'resource_change' 
    | 'level_change' 
    | 'card_draw' 
    | 'card_play' 
    | 'effect_apply' 
    | 'status_change';
  oldValue: unknown;
  newValue: unknown;
  source: string;                // 变化来源
}

// ==================== AI玩家类型 ====================

/** AI决策权重 */
export interface AIDecisionWeights {
  // 进攻权重
  aggression: number;            // 攻击性 (0-1)
  defense: number;               // 防御性 (0-1)
  
  // 资源权重
  resourceEfficiency: number;    // 资源效率 (0-1)
  cardAdvantage: number;         // 卡牌优势 (0-1)
  
  // 等级权重
  levelPriority: number;         // 等级优先 (0-1)
  techPriority: number;          // 科技优先 (0-1)
  
  // 风险权重
  riskTolerance: number;         // 风险承受 (0-1)
  consistency: number;           // 稳定性 (0-1)
}

/** AI策略配置 */
export interface AIStrategy {
  difficulty: AIDifficulty;
  weights: AIDecisionWeights;
  preferredCardTypes: string[];  // 偏好卡牌类型
  avoidCardTypes: string[];      // 避免卡牌类型
  comboPreference: boolean;      // 是否偏好连击
  techRush: boolean;             // 是否科技 rush
}

/** AI决策结果 */
export interface AIDecision {
  action: 'play_card' | 'use_skill' | 'end_turn';
  targetCard?: string;           // 目标卡牌
  targetPlayer?: string;         // 目标玩家
  reason: string;                // 决策原因
  confidence: number;            // 置信度 (0-1)
  alternatives: {                // 备选方案
    action: string;
    score: number;
  }[];
}

// ==================== 团队系统（2v2） ====================

/** 团队定义 */
export interface Team {
  id: string;
  name: string;
  faction: PlayerFaction;
  players: string[];             // 玩家ID列表
  
  // 团队资源
  sharedResources?: Partial<Resources>; // 共享资源
  
  // 团队效果
  teamEffects: {
    type: string;
    value: number;
    source: string;
  }[];
}

/** 团队协同状态 */
export interface TeamSynergyState {
  teamId: string;
  
  // 协同计数
  consecutiveTurns: number;      // 连续行动回合
  cardsPlayedTogether: number;   // 协同出牌数
  
  // 协同效果
  synergyBonus: {
    type: string;
    value: number;
  }[];
}

// ==================== 玩家工具类型 ====================

/** 玩家筛选条件 */
export interface PlayerFilter {
  faction?: PlayerFaction;
  type?: PlayerType;
  status?: PlayerStatus;
  isAlive?: boolean;
}

/** 玩家排序选项 */
export type PlayerSortOption = 
  | 'name' 
  | 'faction' 
  | 'resources_total' 
  | 'level_total' 
  | 'cards_in_hand';

// ==================== 初始化函数 ====================

/** 创建默认玩家 */
export function createDefaultPlayer(
  id: string, 
  name: string, 
  faction: PlayerFaction,
  type: PlayerType = 'human'
): Player {
  return {
    id,
    name,
    faction,
    type,
    
    resources: {
      compute: faction === 'attack' ? 5 : 6,
      funds: faction === 'attack' ? 8 : 10,
      information: faction === 'attack' ? 4 : 3,
      access: 0
    },
    
    resourceLimits: {
      compute: 15,
      funds: 20,
      information: 10,
      access: 5
    },
    
    levelResources: {
      infiltrationLevel: faction === 'attack' ? 10 : 0,
      securityLevel: faction === 'defense' ? 10 : 0
    },
    
    techLevel: 1,
    
    hand: [],
    deck: [],
    discardPile: [],
    
    status: 'waiting',
    isReady: false,
    isAlive: true,
    
    actionPoints: 3,
    maxActionPoints: 3,
    cardsPlayedThisTurn: 0,
    
    comboState: null,
    
    stats: createDefaultStats()
  };
}

/** 创建默认统计 */
export function createDefaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    
    cardsPlayed: 0,
    cardsDrawn: 0,
    resourcesGained: { compute: 0, funds: 0, information: 0, access: 0 },
    resourcesSpent: { compute: 0, funds: 0, information: 0, access: 0 },
    
    infiltrationGained: 0,
    infiltrationReduced: 0,
    securityGained: 0,
    securityReduced: 0,
    
    diceChecksTotal: 0,
    diceChecksSuccess: 0,
    diceChecksCritical: 0,
    
    sustainEffectsApplied: 0,
    sustainEffectsReceived: 0,
    counterEffectsTriggered: 0
  };
}

// ==================== 常量定义 ====================

/** 等级限制常量 */
export const LEVEL_LIMITS: Record<'infiltration' | 'security', LevelLimits> = {
  infiltration: {
    min: 0,
    max: 75,
    victoryThreshold: 75
  },
  security: {
    min: 0,
    max: 75,
    victoryThreshold: 75
  }
};

/** 科技等级阈值 */
export const TECH_LEVEL_THRESHOLDS: Record<TechLevel, { infiltration: number; security: number }> = {
  1: { infiltration: 0, security: 0 },
  2: { infiltration: 15, security: 15 },
  3: { infiltration: 30, security: 30 },
  4: { infiltration: 45, security: 45 },
  5: { infiltration: 60, security: 60 }
};

/** 默认AI策略 */
export const DEFAULT_AI_STRATEGIES: Record<AIDifficulty, AIStrategy> = {
  easy: {
    difficulty: 'easy',
    weights: {
      aggression: 0.3,
      defense: 0.7,
      resourceEfficiency: 0.5,
      cardAdvantage: 0.4,
      levelPriority: 0.5,
      techPriority: 0.3,
      riskTolerance: 0.2,
      consistency: 0.8
    },
    preferredCardTypes: [],
    avoidCardTypes: [],
    comboPreference: false,
    techRush: false
  },
  normal: {
    difficulty: 'normal',
    weights: {
      aggression: 0.5,
      defense: 0.5,
      resourceEfficiency: 0.6,
      cardAdvantage: 0.6,
      levelPriority: 0.7,
      techPriority: 0.5,
      riskTolerance: 0.5,
      consistency: 0.6
    },
    preferredCardTypes: [],
    avoidCardTypes: [],
    comboPreference: true,
    techRush: false
  },
  hard: {
    difficulty: 'hard',
    weights: {
      aggression: 0.7,
      defense: 0.5,
      resourceEfficiency: 0.8,
      cardAdvantage: 0.7,
      levelPriority: 0.8,
      techPriority: 0.7,
      riskTolerance: 0.7,
      consistency: 0.5
    },
    preferredCardTypes: [],
    avoidCardTypes: [],
    comboPreference: true,
    techRush: true
  }
};
