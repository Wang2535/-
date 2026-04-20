/**
 * 《道高一丈：数字博弈》v16.0 游戏状态类型定义
 * 基于渗透等级/安全等级科技树系统重构
 */

import { 
  Card, 
  TechTreeState, 
  LevelChangeRecord, 
  SustainEffectState, 
  SuppressState,
  ComboState 
} from './card_v16';
import { 
  Player, 
  PlayerProtectionState,
  PlayerTurnState,
  Team,
  TeamSynergyState 
} from './player_v16';
import { TurnPhase } from './turnPhase';

// ==================== 游戏基础类型 ====================

/** 游戏模式 */
export type GameMode = '1v1' | '2v2';

/** 游戏状态 */
export type GameStatus = 
  | 'waiting'      // 等待玩家
  | 'starting'     // 开始中
  | 'playing'      // 进行中
  | 'paused'       // 暂停
  | 'ended'        // 已结束
  | 'aborted';     // 中止

/** 游戏阶段 */
export type GamePhase = 
  | 'setup'        // 设置阶段
  | 'judgment'     // 判定阶段
  | 'recovery'     // 恢复阶段
  | 'draw'         // 摸牌阶段
  | 'action'       // 行动阶段
  | 'response'     // 响应阶段
  | 'discard'      // 弃牌阶段
  | 'end'          // 结束阶段
  | 'victory_check'; // 胜利检查

// ==================== 游戏配置 ====================

/** 游戏配置 */
export interface GameConfig {
  // 基础配置
  mode: GameMode;
  maxRounds: number;
  turnTimeLimit: number;         // 回合时间限制（秒）
  
  // 玩家配置
  startingHandSize: number;      // 初始手牌数
  maxHandSize: number;           // 最大手牌数
  
  // 资源配置
  startingResources: {
    attack: { compute: number; funds: number; information: number; access: number };
    defense: { compute: number; funds: number; information: number; access: number };
  };
  resourceRecovery: {
    early: Partial<Record<keyof import('./card_v16').Resources, number>>;
    late: Partial<Record<keyof import('./card_v16').Resources, number>>;
  };
  
  // 等级配置
  startingLevels: {
    attack: { infiltration: number; security: number };
    defense: { infiltration: number; security: number };
  };
  
  // 回合配置
  earlyPhase: PhaseConfig;       // 前期配置（1-6回合）
  latePhase: PhaseConfig;        // 后期配置（7+回合）
  
  // AI配置
  aiEnabled: boolean;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  aiTimeout: number;             // AI超时时间（毫秒）
  
  // 特殊规则
  enableCombo: boolean;          // 启用连击系统
  enableTechTree: boolean;       // 启用科技树
  enableTeamSynergy: boolean;    // 启用团队协同（2v2）
}

/** 阶段配置 */
export interface PhaseConfig {
  maxRound: number;              // 最大回合数
  handLimit: number;             // 手牌上限
  drawCount: number;             // 抽牌数
  actionPoints: number;          // 行动点数
}

// ==================== 游戏核心状态 ====================

/** 游戏状态 - v16.0重构版 */
export interface GameState {
  // 基础信息
  id: string;                    // 游戏唯一ID
  createdAt: number;             // 创建时间
  updatedAt: number;             // 最后更新时间
  
  // 游戏配置
  config: GameConfig;
  
  // 游戏状态
  status: GameStatus;
  currentRound: number;          // 当前回合数
  currentPhase: GamePhase;       // 当前阶段
  currentPlayerIndex: number;    // 当前玩家索引
  
  // 玩家数据
  players: Player[];             // 玩家列表
  currentPlayerId: string;       // 当前玩家ID
  
  // 团队数据（2v2模式）
  teams?: Team[];
  teamSynergy?: TeamSynergyState[];
  
  // 卡牌数据
  cardLibrary: Map<string, Card>; // 卡牌库（代码->卡牌）
  
  // 科技树状态
  techTreeState: TechTreeState;
  
  // 效果状态
  sustainEffects: SustainEffectState[];  // 活跃持续效果
  suppressStates: SuppressState[];        // 活跃压制效果
  comboStates: ComboState[];              // 活跃连击状态
  
  // 保护状态
  protectionStates: PlayerProtectionState[];
  
  // 历史记录
  levelChangeHistory: LevelChangeRecord[]; // 等级变化历史
  turnHistory: PlayerTurnState[];          // 回合历史
  gameLog: GameLogEntry[];                 // 游戏日志
  
  // 临时状态
  pendingEffects: PendingEffect[];         // 待处理效果
  phaseStartTime: number;                  // 阶段开始时间
  turnStartTime: number;                   // 回合开始时间
  
  // 统计
  stats: GameStats;
}

/** 游戏日志条目 */
export interface GameLogEntry {
  id: string;
  timestamp: number;
  round: number;
  phase: GamePhase;
  playerId?: string;
  
  // 日志内容
  type: 
    | 'system' 
    | 'card_play' 
    | 'effect_trigger' 
    | 'level_change' 
    | 'resource_change'
    | 'dice_roll'
    | 'phase_change'
    | 'victory';
  
  message: string;
  details?: Record<string, unknown>;
  
  // 显示配置
  isPublic: boolean;             // 是否公开（false则仅相关玩家可见）
  priority: 'low' | 'normal' | 'high' | 'critical';
}

/** 待处理效果 */
export interface PendingEffect {
  id: string;
  sourceCard: string;
  sourcePlayer: string;
  targetPlayer?: string;
  effect: import('./card_v16').CardEffect;
  triggerTime: 'immediate' | 'phase_start' | 'phase_end' | 'turn_start' | 'turn_end';
  triggerPhase?: GamePhase;
  createdAt: number;
}

/** 游戏统计 */
export interface GameStats {
  // 时间统计
  totalDuration: number;         // 总时长（毫秒）
  averageTurnDuration: number;   // 平均回合时长
  
  // 卡牌统计
  totalCardsPlayed: number;
  totalCardsDrawn: number;
  cardsPerRound: number[];       // 每回合出牌数
  
  // 等级统计
  totalLevelChanges: number;
  maxSingleChange: number;       // 最大单次变化
  
  // 判定统计
  totalDiceChecks: number;
  diceSuccessRate: number;
  
  // 效果统计
  totalEffectsTriggered: number;
  sustainEffectsCount: number;
  counterEffectsCount: number;
}

// ==================== 游戏结果 ====================

/** 游戏结果 */
export interface GameResult {
  gameId: string;
  endedAt: number;
  totalRounds: number;
  totalDuration: number;
  
  // 胜利信息
  winner: {
    playerId: string;
    faction: 'attack' | 'defense';
    victoryType: VictoryType;
  };
  
  // 失败信息
  losers: {
    playerId: string;
    faction: 'attack' | 'defense';
    defeatType: DefeatType;
  }[];
  
  // 详细数据
  playerResults: PlayerResult[];
  
  // 回放数据
  replayData?: GameStateSnapshot[];
}

/** 胜利类型 */
export type VictoryType = 
  | 'infiltration_threshold'     // 渗透等级达到阈值
  | 'security_threshold'         // 安全等级达到阈值
  | 'opponent_elimination'       // 对手被消灭
  | 'opponent_surrender'         // 对手投降
  | 'timeout_advantage';         // 超时优势

/** 失败类型 */
export type DefeatType = 
  | 'infiltration_depleted'      // 渗透等级耗尽
  | 'security_depleted'          // 安全等级耗尽
  | 'elimination'                // 被消灭
  | 'surrender'                  // 投降
  | 'timeout_disadvantage';      // 超时劣势

/** 玩家结果 */
export interface PlayerResult {
  playerId: string;
  playerName: string;
  faction: 'attack' | 'defense';
  isWinner: boolean;
  
  // 最终状态
  finalLevelResources: { infiltrationLevel: number; securityLevel: number };
  finalResources: import('./card_v16').Resources;
  
  // 统计数据
  cardsPlayed: number;
  cardsDrawn: number;
  levelGained: number;
  levelReduced: number;
  diceChecksSuccess: number;
  diceChecksTotal: number;
  
  // 评分
  score: number;
  rating: 'S' | 'A' | 'B' | 'C' | 'D';
}

// ==================== 游戏状态快照 ====================

/** 游戏状态快照（用于保存/回放） */
export interface GameStateSnapshot {
  timestamp: number;
  round: number;
  phase: GamePhase;
  
  // 玩家状态
  players: Player[];
  
  // 效果状态
  sustainEffects: SustainEffectState[];
  suppressStates: SuppressState[];
  comboStates: ComboState[];
  
  // 其他状态
  techTreeState: TechTreeState;
  pendingEffects: PendingEffect[];
}

// ==================== 游戏事件 ====================

/** 游戏事件类型 */
export type GameEventType = 
  | 'game_started'
  | 'round_started'
  | 'phase_changed'
  | 'player_turn_started'
  | 'card_played'
  | 'effect_triggered'
  | 'level_changed'
  | 'resource_changed'
  | 'dice_rolled'
  | 'player_eliminated'
  | 'game_ended';

/** 游戏事件 */
export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  gameId: string;
  round: number;
  phase: GamePhase;
  
  // 事件数据
  data: unknown;
  
  // 事件源
  sourcePlayerId?: string;
  targetPlayerId?: string;
  sourceCard?: string;
}

/** 游戏事件处理器 */
export type GameEventHandler = (event: GameEvent) => void | Promise<void>;

// ==================== 游戏动作 ====================

/** 游戏动作类型 */
export type GameActionType = 
  | 'play_card'
  | 'use_skill'
  | 'end_turn'
  | 'surrender'
  | 'pause_game'
  | 'resume_game'
  | 'send_message';

/** 游戏动作 */
export interface GameAction {
  type: GameActionType;
  playerId: string;
  timestamp: number;
  
  // 动作数据
  data: {
    cardCode?: string;           // 卡牌代码（出牌时）
    targetPlayerId?: string;     // 目标玩家
    skillId?: string;            // 技能ID
    message?: string;            // 消息内容
  };
}

// ==================== 初始化函数 ====================

/** 创建默认游戏配置 */
export function createDefaultGameConfig(mode: GameMode = '1v1'): GameConfig {
  return {
    mode,
    maxRounds: 20,
    turnTimeLimit: 30,
    
    startingHandSize: 5,
    maxHandSize: 10,
    
    startingResources: {
      attack: { compute: 5, funds: 8, information: 4, access: 0 },
      defense: { compute: 6, funds: 10, information: 3, access: 0 }
    },
    
    resourceRecovery: {
      early: { compute: 2, funds: 3, information: 1 },
      late: { compute: 3, funds: 4, information: 2 }
    },
    
    startingLevels: {
      attack: { infiltration: 10, security: 0 },
      defense: { infiltration: 0, security: 10 }
    },
    
    earlyPhase: {
      maxRound: 6,
      handLimit: 5,
      drawCount: 3,
      actionPoints: 3
    },
    
    latePhase: {
      maxRound: 20,
      handLimit: 7,
      drawCount: 4,
      actionPoints: 4
    },
    
    aiEnabled: true,
    aiDifficulty: 'normal',
    aiTimeout: 10000,
    
    enableCombo: true,
    enableTechTree: true,
    enableTeamSynergy: mode === '2v2'
  };
}

/** 创建初始游戏状态 */
export function createInitialGameState(
  gameId: string,
  players: Player[],
  config: GameConfig
): GameState {
  const now = Date.now();
  
  return {
    id: gameId,
    createdAt: now,
    updatedAt: now,
    
    config,
    
    status: 'waiting',
    currentRound: 1,
    currentPhase: 'setup',
    currentPlayerIndex: 0,
    
    players,
    currentPlayerId: players[0]?.id || '',
    
    cardLibrary: new Map(),
    
    techTreeState: {
      attackTechLevel: 1,
      defenseTechLevel: 1,
      unlockedCards: new Set()
    },
    
    sustainEffects: [],
    suppressStates: [],
    comboStates: [],
    protectionStates: [],
    
    levelChangeHistory: [],
    turnHistory: [],
    gameLog: [{
      id: `log_${now}`,
      timestamp: now,
      round: 1,
      phase: 'setup',
      type: 'system',
      message: '游戏初始化完成',
      isPublic: true,
      priority: 'normal'
    }],
    
    pendingEffects: [],
    phaseStartTime: now,
    turnStartTime: now,
    
    stats: {
      totalDuration: 0,
      averageTurnDuration: 0,
      totalCardsPlayed: 0,
      totalCardsDrawn: 0,
      cardsPerRound: [],
      totalLevelChanges: 0,
      maxSingleChange: 0,
      totalDiceChecks: 0,
      diceSuccessRate: 0,
      totalEffectsTriggered: 0,
      sustainEffectsCount: 0,
      counterEffectsCount: 0
    }
  };
}

// ==================== 常量定义 ====================

/** 游戏阶段顺序 */
export const GAME_PHASE_ORDER: GamePhase[] = [
  'judgment',
  'recovery',
  'draw',
  'action',
  'response',
  'discard',
  'end',
  'victory_check'
];

/** 阶段显示名称 */
export const PHASE_DISPLAY_NAMES: Record<GamePhase, string> = {
  setup: '游戏设置',
  judgment: '判定阶段',
  recovery: '恢复阶段',
  draw: '摸牌阶段',
  action: '行动阶段',
  response: '响应阶段',
  discard: '弃牌阶段',
  end: '结束阶段',
  victory_check: '胜利检查'
};

/** 阶段描述 */
export const PHASE_DESCRIPTIONS: Record<GamePhase, string> = {
  setup: '初始化游戏状态',
  judgment: '触发延迟效果和判定',
  recovery: '恢复资源和等级',
  draw: '抽取新的卡牌',
  action: '打出卡牌和使用技能',
  response: '响应对方的行动',
  discard: '弃置多余的手牌',
  end: '结束回合，清理状态',
  victory_check: '检查胜利条件'
};
