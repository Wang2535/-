// 游戏核心类型定义

// 资源类型
export interface Resources {
  compute: number;    // 算力 ⚡
  funds: number;      // 资金 💰
  information: number; // 信息 👁️
  access: number;     // 权限 👑
}

// 资源上限
export const RESOURCE_LIMITS = {
  compute: { min: 0, max: 15, initial: 3 },
  funds: { min: 0, max: 20, initial: 5 },
  information: { min: 0, max: 10, initial: 2 },
  access: { min: 0, max: 5, initial: 0 },
};

// 阵营类型
export type Faction = 'attack' | 'defense' | '0day';

// 队伍类型 - 2v2模式
export type Team = 'teamA' | 'teamB';

// 卡牌类型
export type CardType = 
  | 'DDoS攻击类' 
  | '钓鱼攻击类' 
  | '漏洞利用类' 
  | '高级威胁类'
  | '基础防御类'
  | '入侵检测与响应类'
  | '主动与欺骗防御类'
  | '资源与应急管理类'
  | '0day漏洞';

// 区域类型
export type AreaType = 'Perimeter' | 'DMZ' | 'Internal' | 'ICS';

// 标记类型
export type TokenType = 
  | '权限标记' 
  | 'APT控制标记' 
  | 'CC攻击标记' 
  | '恶意载荷标记' 
  | '监听标记'
  | '恶意二维码标记'
  | '应用风险标记'
  | 'XSS载荷标记'
  | '水坑钓鱼标记'
  | '恶意脚本标记'
  | '潜伏威胁标记';

// 卡牌效果
export interface CardEffect {
  target: string;
  mechanic: string;
  detail: string;
}

// 【v8.0增强】卡牌定义
export interface Card {
  card_code: string;
  name: string;
  type: CardType;
  faction: Faction;
  cost: Partial<Resources>;
  trigger_condition: string;
  effects: CardEffect[];
  duration: number; // 0为瞬时，-1为永久
  source_event: string;
  rarity?: string;
  effect_text?: string;
  mechanics?: any;
  // 【v8.0新增】卡牌解锁条件
  unlockCondition?: CardUnlockCondition;
  // 【v8.0新增】卡牌分类标签
  tags?: CardTag[];
}

// 【v8.0新增】卡牌效果标签
export type CardTag = 
  | 'deathrattle'    // 亡语：卡牌被移除时触发
  | 'aura'           // 光环：在场时持续生效
  | 'trigger'        // 触发：满足条件时触发
  | 'delayed'        // 滞后：延迟至回合结束结算
  | 'combo'          // 连击：配合其他卡牌
  | 'burst'          // 爆发：高伤害高消耗
  | 'sustain';       // 持续：长期收益

// 【v8.0新增】卡牌分类
export interface CardClassification {
  category: 'attack' | 'defense' | 'special';
  subCategory: 'basic' | 'hybrid' | 'special';
  tags: CardTag[];
}

// 【v15.0重构】权限资源系统 - 核心血量系统
export interface PermissionResources {
  // 进攻方：渗透等级 (0-75)，达75触发完全渗透胜利
  infiltrationLevel: number;
  
  // 防御方：安全等级 (0-75)，达75触发绝对安全胜利
  securityLevel: number;
}

// 【v15.0更新】权限等级上限 - 范围扩大至0-75
export const PERMISSION_LIMITS = {
  infiltration: { 
    min: 0, 
    max: 75,           // v15.0: 从10扩大到75
    initial: 0,        // v15.0: 初始值改为0
    victoryThreshold: 75 // v15.0: 胜利阈值75
  },
  security: { 
    min: 0, 
    max: 75,           // v15.0: 从10扩大到75
    initial: 0,        // v15.0: 初始值改为0
    victoryThreshold: 75 // v15.0: 胜利阈值75
  }
};

// 【v8.0新增】卡牌解锁条件
export interface CardUnlockCondition {
  requiredLevel: number;      // 需要权限等级
  requiredFaction: Faction;   // 需要阵营
  requiredPermission: 'infiltration' | 'security'; // 需要哪种权限
}

// 【v8.0新增】区域控制状态
export interface AreaControl {
  controlledBy: string | null;  // 控制者玩家ID
  controlTurn: number;          // 控制开始回合
  infiltrationBonus: number;    // 渗透加成
  securityBonus: number;        // 安全加成
}

// 【v8.0新增】区域战略价值配置
export const AREA_STRATEGIC_VALUE: Record<AreaType, {
  name: string;
  description: string;
  controlBonus: { infiltration?: number; security?: number };
  attackAdvantage: boolean;     // 进攻方优势
  defenseAdvantage: boolean;    // 防御方优势
}> = {
  Perimeter: {
    name: '网络边界',
    description: '外部攻击第一道防线，进攻方主战场',
    controlBonus: { infiltration: 1 },
    attackAdvantage: true,
    defenseAdvantage: false
  },
  DMZ: {
    name: '隔离区',
    description: '缓冲带，双方可争夺',
    controlBonus: {},
    attackAdvantage: false,
    defenseAdvantage: false
  },
  Internal: {
    name: '内网',
    description: '防御方核心，失守后果严重',
    controlBonus: { security: 1 },
    attackAdvantage: false,
    defenseAdvantage: true
  },
  ICS: {
    name: '工控系统',
    description: '高价值目标，攻陷直接+3渗透',
    controlBonus: { infiltration: 3 },
    attackAdvantage: true,
    defenseAdvantage: false
  }
};

// 回合状态效果
export interface CurrentRoundState {
  stateId: string;
  name: string;
  effect: string;
  appliedAt: number;
  expiresAtRound: number;
}

// 玩家 - 2v2模式扩展
export interface Player {
  id: string;
  name: string;
  faction: Faction;
  team?: Team; // 所属队伍
  resources: Resources;
  permissions?: PermissionResources; // 权限资源
  hand: Card[];
  deck: Card[];
  discard: Card[];
  role?: Role;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
  isReady?: boolean; // 准备状态
  isHost?: boolean; // 房主标记
  isAlive?: boolean; // 是否存活（淘汰机制）
  remainingActions?: number; // 剩余行动点
  maxActions?: number; // 最大行动点
}

// 角色能力
export interface Role {
  name: string;
  faction: Faction;
  ability: string;
  trigger: string;
  effect: string;
}

// AI难度
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// 区域状态
export interface AreaState {
  type: AreaType;
  tokens: { type: TokenType; owner: string; duration: number; team?: Team }[];
  defenses: { card: Card; duration: number; playerId: string }[];
  // 区域控制信息
  controlledBy: string | null;  // 控制者玩家ID
  controlTeam: Team | null;      // 控制者队伍
  controlTurn: number;           // 控制开始回合
  controlStrength: number;       // 控制强度（正数为攻击方，负数为防御方）
}

// 游戏阶段
export type GamePhase = 
  | 'planning'      // 策略与规划阶段
  | 'action'        // 行动宣言与响应阶段
  | 'resolution'    // 对抗判定与结算阶段
  | 'cleanup'       // 状态更新与整理阶段
  | 'victory_check' // 胜利检查
  | 'ended';        // 游戏结束

// 游戏状态 - 2v2模式扩展
export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  turn: number;
  maxTurns: number;
  areas: Record<AreaType, AreaState>;
  attackChain: { playerId: string; cardType: CardType; turn: number; team?: Team }[];
  defenseCardsUsed: Record<string, CardType[]>;
  log: GameLogEntry[];
  winner: Faction | Team | 'draw' | null; // 支持队伍胜利
  victoryType: string | null;
  startTime: number;
  phaseTimeLeft: number;
  gameMode: '1v1' | '2v2'; // 游戏模式
  teamConfig?: TeamConfig; // 队伍配置
  currentRoundState?: CurrentRoundState; // 当前回合状态
}

// 队伍配置
export interface TeamConfig {
  teamA: { players: string[]; faction: Faction };
  teamB: { players: string[]; faction: Faction };
}

// 游戏日志
export interface GameLogEntry {
  timestamp: number;
  turn: number;
  phase: GamePhase;
  playerId?: string;
  team?: Team;
  action: string;
  details?: any;
}

// 房间信息 - 2v2模式扩展
export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'ready' | 'playing' | 'ended';
  gameState?: GameState;
  createdAt: number;
  gameMode: '1v1' | '2v2';
  teamConfig?: TeamConfig;
  // 房间设置
  settings: {
    allowAI: boolean;
    aiDifficulty: AIDifficulty;
    timeLimit: number; // 回合时间限制（秒）
  };
}

// 用户
export interface User {
  id: string;
  name: string;
  avatar?: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    winRate: number;
  };
}

// 胜利条件
export interface VictoryCondition {
  id: string;
  name: string;
  faction: Faction;
  description: string;
  check: (gameState: GameState) => boolean;
}

// 动画效果类型
export type AnimationType = 
  | 'card_play' 
  | 'resource_change' 
  | 'token_place' 
  | 'attack_hit'
  | 'defense_activate'
  | 'victory';

// 动画事件
export interface AnimationEvent {
  type: AnimationType;
  payload: any;
  duration: number;
}

// 网络同步消息类型
export type NetworkMessageType = 
  | 'player_join'
  | 'player_leave'
  | 'player_ready'
  | 'game_start'
  | 'play_card'
  | 'end_turn'
  | 'game_state_update'
  | 'chat_message';

export interface NetworkMessage {
  type: NetworkMessageType;
  roomId: string;
  playerId: string;
  payload: any;
  timestamp: number;
}
