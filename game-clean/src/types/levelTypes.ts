import type { Card, CardType, TechLevel } from './legacy/card_v16';

export type LevelId = `LV${string}`;

export interface LevelDefinition {
  id: LevelId;
  name: string;
  subtitle: string;
  articleTitle: string;
  articleContent: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tutorialFocus: TutorialFocus;
  objectives: LevelObjective[];
  unlockCondition: {
    previousLevel?: LevelId;
  };
  rewards: LevelReward;
  specialCards: LevelSpecialCard[];
  enemyConfig: EnemyConfig;
  initialSetup: InitialSetup;
  hints: string[];
  estimatedTurns: number;
  maxTurns?: number; // 最大回合数（失败条件）
  enemyIds?: string[]; // 引用levelEnemies.ts中的敌人ID
  areaDistribution?: Record<AreaType, AreaDistribution>; // 详细的区域分布配置
  playerConfig?: PlayerConfig; // 玩家初始配置
  dadongConfig?: DadongConfig; // 大东AI配置
  failureConditions?: string[]; // 失败条件描述
}

export interface PlayerConfig {
  actionPoints: number; // 每回合行动点
  handSize: number; // 手牌数
  specialResources?: string[]; // 特殊资源
}

export interface DadongConfig {
  actionPoints: number; // 每回合行动点
  handSize: number; // 手牌数
  specialAbility: string; // 特殊能力描述
}

export interface AreaDistribution {
  name: string; // 区域名称
  friendlyMarkers: number; // 初始友方标记数
  enemyMarkers: number; // 初始敌方标记数
  trait: string; // 区域特性描述
  traitType?: string; // 区域特性类型（用于代码识别）
}

export type TutorialFocus =
  | 'basic_defense'
  | 'virus_basics'
  | 'worm_mechanics'
  | 'software_security'
  | 'bug_prevention'
  | 'industrial_control'
  | 'privacy_protection'
  | 'cryptography'
  | 'account_security'
  // 第30-40关新增
  | 'bundle_defense'
  | 'worm_defense'
  | 'botnet_defense'
  | 'blockchain_security'
  | 'bios_protection'
  | 'worm_propagation'
  | 'boot_virus'
  | 'macro_virus'
  | 'password_security'
  | 'sybil_defense'
  | 'rootkit_defense';

export interface LevelObjective {
  id: string;
  description: string;
  type: 'survive' | 'maintain_security' | 'protect_areas' | 'defeat_enemy' | 'collect_info' | 'use_defense_cards';
  target: number;
  current?: number;
  completed: boolean;
}

export interface LevelReward {
  unlockedCards: string[];
  achievement?: string;
  experiencePoints: number;
}

export interface LevelSpecialCard {
  cardId: string;
  name: string;
  description: string;
  type: CardType;
  techLevel: TechLevel;
  effects: LevelCardEffect[];
  isUnlocked: boolean;
  unlockCondition?: string;
}

export interface LevelCardEffect {
  type: string;
  value: number;
  description: string;
}

export interface EnemyConfig {
  name: string;
  type: 'virus' | 'worm' | 'apt' | 'malware' | 'hacker' | 'bug' | 'insider' | 'ai';
  baseDifficulty: number;
  attackPattern: AttackPattern[];
  specialAbilities: EnemyAbility[];
  resourceBonus: number;
}

export interface AttackPattern {
  turn: number | 'all';
  action: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface EnemyAbility {
  name: string;
  description: string;
  trigger: string;
  effect: string;
  cooldown?: number;
}

export interface InitialSetup {
  playerResources: {
    computing: number;
    funds: number;
    information: number;
  };
  securityLevel: number;
  controlledAreas: AreaType[];
  areaMarkers: Record<AreaType, number>;
  handCards: string[];
}

export type AreaType = 'internal' | 'industrial' | 'dmz' | 'external';

export interface LevelProgress {
  levelId: LevelId;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';
  bestScore?: number;
  completedObjectives: string[];
  attempts: number;
  completedAt?: Date;
}

export type TurnActor = 'player' | 'dadong' | 'enemy' | 'enemy2';

export interface LevelGameState {
  currentLevel: LevelDefinition;
  progress: LevelProgress;
  objectives: LevelObjective[];
  // 轮次、回合、阶段定义（参考对战模式）
  // 轮次(Round): 所有玩家完成一轮行动
  // 回合(Turn): 单个玩家的完整行动（包含7个阶段）
  // 阶段(Phase): 每个回合内的7个步骤
  round: number;           // 当前轮次（所有玩家完成一轮）
  currentTurn: number;     // 当前回合计数（总回合数）
  currentPhase: LevelTurnPhase;  // 当前阶段
  currentActor: TurnActor; // 当前行动者（player/dadong/enemy）
  playerState: LevelPlayerState;
  dadongAIState: DadongAIState;
  enemyState: EnemyState;      // 敌人1状态
  enemy2State?: EnemyState;    // 敌人2状态（可选，用于双敌人关卡）
  areaControl: AreaControlState;
  unlockedCards: string[];
  isTutorialMode: boolean;
  tutorialStep?: number;
  phaseLogs: string[];
  pendingJudgments: LevelPendingJudgment[];
  responseEvents: LevelResponseEvent[];
  teamSharedLevels: LevelTeamSharedLevels;
  // 回合阶段追踪
  dadongPhase?: LevelTurnPhase;
  enemyPhase?: LevelTurnPhase;
  enemy2Phase?: LevelTurnPhase;
  isDadongTurn?: boolean;
  isEnemyTurn?: boolean;
  isEnemy2Turn?: boolean;
  // AI操作日志
  aiOperationLogs?: AIOperationLog[];
  // 活跃效果
  activeEffects?: LevelActiveEffect[];
  // 大东技能使用计数（用于胜利条件）
  dadongSkillUsageCount?: number;
}

// AI操作日志类型
export interface AIOperationLog {
  timestamp: number;
  actor: 'dadong' | 'enemy' | 'enemy2';
  phase: LevelTurnPhase;
  action: string;
  description: string;
  result?: string;
}

// 活跃效果类型
export interface LevelActiveEffect {
  id: string;
  type: string;
  targetArea: AreaType;
  remainingTurns: number;
  source: string;
  description: string;
}

export interface LevelPendingJudgment {
  id: string;
  type: 'dice' | 'rps';
  sourcePlayerId: string;
  targetPlayerId: string;
  description: string;
  difficulty: number;
  effects: {
    success: { description: string; infiltrationChange?: number; safetyChange?: number };
    failure: { description: string; infiltrationChange?: number; safetyChange?: number };
  };
  resolved: boolean;
  cardId?: string;
  cardName?: string;
  onSuccess?: Record<string, unknown>;
  onFailure?: Record<string, unknown>;
  onCriticalSuccess?: Record<string, unknown>;
  onCriticalFailure?: Record<string, unknown>;
  targetArea?: string;
  timestamp?: number;
  isImmediate?: boolean;
}

export interface LevelResponseEvent {
  id: string;
  type: 'immediate_judgment' | 'card_response' | 'ability_response';
  sourcePlayerId: string;
  targetPlayerId: string;
  description: string;
  responded: boolean;
  judgmentType?: 'dice' | 'rps';
  difficulty?: number;
  effects?: {
    success: { description: string };
    failure: { description: string };
  };
}

export interface LevelTeamSharedLevels {
  player: { infiltrationLevel: number; safetyLevel: number };
  enemy: { infiltrationLevel: number; safetyLevel: number };
}

export interface LevelPlayerState {
  characterId: 'XIAOBAI';
  resources: {
    computing: number;
    funds: number;
    information: number;
    permission: number;
  };
  resourceRecovery: {
    computing: number;
    funds: number;
    information: number;
  };
  actionPoints: number;
  maxActionPoints: number;
  hand: Card[];
  deck: Card[];
  defenseCardsUsed: number;
  discardPile: Card[];
  securityLevel: number;
  maxSecurityLevel: number;
}

export interface DadongAIState {
  isActive: boolean;
  hand: Card[];
  deck: Card[];
  lastPlayedCard?: Card;
  cooperationBonus: number;
  resources: {
    computing: number;
    funds: number;
    information: number;
  };
  actionPoints: number;
  maxActionPoints: number;
  skillCooldowns?: Record<string, number>;
  securityLevel?: number;
}

export interface EnemyState {
  name: string;
  type: EnemyConfig['type'];
  infiltrationLevel: number;
  resources: {
    computing: number;
    funds: number;
    information: number;
  };
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  attackCooldown: number;
  specialAbilityActive: boolean;
  skillCooldowns?: Record<string, number>;
  markerCountByArea?: Record<AreaType, number>;
  infectedAreas?: AreaType[];
  activeEnemyIds?: string[];
  totalMarkersPlaced?: number; // 累计放置的标记数量（用于第50次启动技能）
}

export interface AreaControlState {
  internal: AreaStatus;
  industrial: AreaStatus;
  dmz: AreaStatus;
  external: AreaStatus;
}

export interface LatentMarker {
  remainingTurns: number; // 剩余回合数，2回合后转为攻击标记
}

export interface AreaStatus {
  controller: 'player' | 'enemy' | 'neutral';
  defenseMarkers: number;
  attackMarkers: number;
  latentMarkers: LatentMarker[]; // 潜伏标记列表，每个标记有自己的剩余回合
  specialEffects: string[];
}

export interface XiaobaiCharacter {
  id: 'XIAOBAI';
  name: string;
  title: string;
  description: string;
  avatarUrl?: string;
  skills: XiaobaiSkill[];
  baseStats: {
    computingRecovery: number;
    fundsRecovery: number;
    informationRecovery: number;
    actionPoints: number;
  };
}

export interface XiaobaiSkill {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  effect: string;
}

export interface DadongSkill {
  id: string;
  name: string;
  type: 'active' | 'passive' | 'special';
  description: string;
  cooldown: number;
  maxCooldown: number;
}

export interface DadongAI {
  id: 'DADONG';
  name: string;
  title: string;
  description: string;
  behavior: DadongBehavior;
  skills?: DadongSkill[];
  level1Config?: {
    actionPoints: number;
    handSize: number;
    specialAbility: string;
  };
}

export interface DadongBehavior {
  cardsPerTurn: number;
  cardsToPlay: number;
  ignoreResourceCost: boolean;
  cooperationBonus: number;
}

export interface LevelCompletionResult {
  levelId: LevelId;
  success: boolean;
  score: number;
  completedObjectives: string[];
  turnsTaken: number;
  rewards: LevelReward;
  articleContent: string;
  nextLevel?: LevelId;
}

export const LEVEL_AREAS: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];

export const AREA_NAMES: Record<AreaType, string> = {
  internal: '内网',
  industrial: '工控系统',
  dmz: 'DMZ区',
  external: '外网'
};

export const TUTORIAL_FOCUS_NAMES: Record<TutorialFocus, string> = {
  basic_defense: '基础防御',
  virus_basics: '病毒基础',
  worm_mechanics: '蠕虫机制',
  software_security: '软件安全',
  bug_prevention: '漏洞防护',
  industrial_control: '工控安全',
  privacy_protection: '隐私保护',
  cryptography: '密码学入门',
  account_security: '账号安全',
  // 第30-40关新增
  bundle_defense: '捆绑防御',
  worm_defense: '蠕虫防御',
  botnet_defense: '僵尸网络防御',
  blockchain_security: '区块链安全',
  bios_protection: 'BIOS保护',
  worm_propagation: '蠕虫传播',
  boot_virus: '引导病毒',
  macro_virus: '宏病毒',
  password_security: '密码安全',
  sybil_defense: '女巫攻击防御',
  rootkit_defense: 'Rootkit防御'
};

export type LevelTurnPhase = 
  | 'judgment'
  | 'recovery'
  | 'draw'
  | 'action'
  | 'response'
  | 'discard'
  | 'end';

export const LEVEL_TURN_PHASES: LevelTurnPhase[] = [
  'judgment',
  'recovery',
  'draw',
  'action',
  'response',
  'discard',
  'end'
];

export const LEVEL_PHASE_NAMES: Record<LevelTurnPhase, string> = {
  judgment: '判定阶段',
  recovery: '恢复阶段',
  draw: '摸牌阶段',
  action: '行动阶段',
  response: '响应阶段',
  discard: '弃牌阶段',
  end: '结束阶段'
};

export interface LevelPhaseResult {
  success: boolean;
  logs: string[];
  canProceed: boolean;
  phaseData?: Record<string, unknown>;
}

export interface LevelHandLimit {
  minRound: number;
  maxRound: number;
  limit: number;
}

export const LEVEL_HAND_LIMITS: LevelHandLimit[] = [
  { minRound: 1, maxRound: 4, limit: 3 },
  { minRound: 5, maxRound: 8, limit: 4 },
  { minRound: 9, maxRound: 16, limit: 5 },
  { minRound: 17, maxRound: 24, limit: 6 }
];

export function getLevelHandLimit(round: number): number {
  for (const limit of LEVEL_HAND_LIMITS) {
    if (round >= limit.minRound && round <= limit.maxRound) {
      return limit.limit;
    }
  }
  return 6;
}

export interface LevelDrawConfig {
  minRound: number;
  maxRound: number;
  drawCount: number;
}

export const LEVEL_DRAW_CONFIGS: LevelDrawConfig[] = [
  { minRound: 1, maxRound: 4, drawCount: 2 },
  { minRound: 5, maxRound: 8, drawCount: 3 },
  { minRound: 9, maxRound: 16, drawCount: 4 },
  { minRound: 17, maxRound: 24, drawCount: 5 }
];

export function getLevelDrawCount(round: number): number {
  for (const config of LEVEL_DRAW_CONFIGS) {
    if (round >= config.minRound && round <= config.maxRound) {
      return config.drawCount;
    }
  }
  return 5;
}
