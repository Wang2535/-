/**
 * 《道高一丈：数字博弈》游戏规则类型定义
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-02
 * 
 * 本文件严格依据"完善的游戏规则.md"定义
 * 严禁修改文档内容，所有实现必须与源文档保持一致
 */

// ============================================
// R1.0 游戏目标
// ============================================

/**
 * R1.1 进攻方胜利条件
 */
export interface AttackerVictoryConditions {
  /** 完全渗透：渗透等级达到75并持续2个回合 */
  fullInfiltration: {
    requiredLevel: 75;
    sustainedTurns: 2;
    animation: "完全渗透";
  };
  /** 安全瓦解：防御方安全等级降至0（需第7回合后） */
  securityCollapse: {
    requiredSafetyLevel: 0;
    minTurn: 7;
  };
  /** 速攻胜利：第6回合前渗透等级≥50且防御方安全等级<50 */
  blitzVictory: {
    maxTurn: 6;
    minInfiltration: 50;
    maxDefenderSafety: 50;
  };
  /** 持久胜利：第24轮次结束后，渗透等级 > 防御方安全等级 */
  enduranceVictory: {
    endTurn: 12;
    condition: "infiltration > safety";
  };
}

/**
 * R1.2 防御方胜利条件
 */
export interface DefenderVictoryConditions {
  /** 绝对安全：安全等级达到75 */
  absoluteSecurity: {
    requiredLevel: 75;
    animation: "绝对安全";
  };
  /** 威胁清除：攻击方渗透等级降至0（需第7回合后） */
  threatElimination: {
    requiredInfiltrationLevel: 0;
    minTurn: 7;
  };
  /** 速防胜利：第6回合前安全等级≥50且攻击方渗透等级<50 */
  rapidDefense: {
    maxTurn: 6;
    minSafety: 50;
    maxAttackerInfiltration: 50;
  };
  /** 持久胜利：第24轮次结束后，安全等级 > 攻击方渗透等级 */
  enduranceVictory: {
    endTurn: 12;
    condition: "safety > infiltration";
  };
}

/** 进攻方胜利条件常量 */
export const ATTACKER_VICTORY_CONDITIONS: AttackerVictoryConditions = {
  fullInfiltration: { requiredLevel: 75, sustainedTurns: 2, animation: "完全渗透" },
  securityCollapse: { requiredSafetyLevel: 0, minTurn: 7 },
  blitzVictory: { maxTurn: 6, minInfiltration: 50, maxDefenderSafety: 50 },
  enduranceVictory: { endTurn: 12, condition: "infiltration > safety" }
};

/** 防御方胜利条件常量 */
export const DEFENDER_VICTORY_CONDITIONS: DefenderVictoryConditions = {
  absoluteSecurity: { requiredLevel: 75, animation: "绝对安全" },
  threatElimination: { requiredInfiltrationLevel: 0, minTurn: 7 },
  rapidDefense: { maxTurn: 6, minSafety: 50, maxAttackerInfiltration: 50 },
  enduranceVictory: { endTurn: 12, condition: "safety > infiltration" }
};

// ============================================
// R2.0 资源系统
// ============================================

/** R2.1 资源类型 */
export type ResourceType = "compute" | "funds" | "information" | "permission";

/** R2.2 资源数值 */
export interface Resources {
  /** 算力（Computing）- 用于执行技术性行动 */
  compute: number;
  /** 资金（Funds）- 用于购买资源、雇佣人员 */
  funds: number;
  /** 信息（Information）- 用于情报收集、分析 */
  information: number;
  /** 权限（Permission）- 用于特殊行动 */
  permission: number;
}

/** R2.3 初始资源 */
export const INITIAL_RESOURCES: Resources = {
  compute: 3,
  funds: 5,
  information: 2,
  permission: 0
};

/** R2.4 资源上限 */
export const RESOURCE_LIMITS: Record<ResourceType, { min: number; max: number }> = {
  compute: { min: 0, max: 20 },
  funds: { min: 0, max: 20 },
  information: { min: 0, max: 20 },
  permission: { min: 0, max: 10 }
};

/** R2.5 每回合资源恢复 */
export const RESOURCE_RECOVERY_PER_TURN: Resources = {
  compute: 2,
  funds: 2,
  information: 2,
  permission: 0
};

// ============================================
// R3.0 回合流程
// ============================================

/** R3.1-R3.7 回合阶段 */
export type TurnPhase = 
  | "judgment"      // 判定阶段
  | "recovery"      // 恢复阶段
  | "draw"          // 抽牌阶段
  | "action"        // 行动阶段
  | "response"      // 响应阶段
  | "discard"       // 弃牌阶段
  | "end";          // 结束阶段

/** 回合阶段顺序 */
export const TURN_PHASES: TurnPhase[] = [
  "judgment",
  "recovery",
  "draw",
  "action",
  "response",
  "discard",
  "end"
];

/** 初始手牌数 */
export const INITIAL_HAND_SIZE = 4;

/** 每回合抽牌数 */
export const DRAW_COUNT_PER_TURN = 4;

/** 手牌上限 */
export const HAND_LIMIT = 7;

// ============================================
// R4.0 区域控制系统
// ============================================

/** R4.1 区域类型 */
export type AreaType = "perimeter" | "dmz" | "internal" | "ics";

/** R4.2 区域战略价值 */
export const AREA_STRATEGIC_VALUE: Record<AreaType, number> = {
  perimeter: 1,
  dmz: 2,
  internal: 3,
  ics: 4
};

/** R4.3 区域控制阈值 */
export const ZONE_CONTROL_THRESHOLDS = {
  controlThreshold: 2,  // 控制所需的优势标记数
  dominanceThreshold: 4  // 完全控制阈值
};

/** R4.4 区域状态 */
export interface AreaState {
  type: AreaType;
  tokens: Token[];
  defenses: Defense[];
  controlledBy: string | null;
  controlStrength: number;
  strategicValue: number;
}

/** R4.5 区域控制加成 */
export interface AreaControlBonus {
  resourceRegen: Resources;
  drawBonus: number;
  actionBonus: number;
  infiltrationBonus: number;
  safetyBonus: number;
}

/** R4.6 区域控制加成常量 */
export const AREA_CONTROL_BONUS: Record<AreaType, AreaControlBonus> = {
  perimeter: {
    resourceRegen: { compute: 1, funds: 0, information: 0, permission: 0 },
    drawBonus: 0,
    actionBonus: 0,
    infiltrationBonus: 1,
    safetyBonus: 1
  },
  dmz: {
    resourceRegen: { compute: 1, funds: 1, information: 0, permission: 0 },
    drawBonus: 1,
    actionBonus: 1,
    infiltrationBonus: 2,
    safetyBonus: 2
  },
  internal: {
    resourceRegen: { compute: 2, funds: 1, information: 1, permission: 0 },
    drawBonus: 1,
    actionBonus: 1,
    infiltrationBonus: 3,
    safetyBonus: 3
  },
  ics: {
    resourceRegen: { compute: 2, funds: 2, information: 1, permission: 1 },
    drawBonus: 2,
    actionBonus: 2,
    infiltrationBonus: 4,
    safetyBonus: 4
  }
};

/** 标记类型 */
export type TokenType = "threat" | "defense" | "resource" | "generic" | "aura";

/** 标记定义 */
export interface Token {
  type: TokenType;
  owner: string;
  strength: number;
  duration?: number;
}

/** 防御设施 */
export interface Defense {
  type: string;
  strength: number;
  owner: string;
}

// ============================================
// R5.0 科技树系统
// ============================================

/** R5.1 科技等级 */
export type TechLevel = "T0" | "T1" | "T2" | "T3" | "T4" | "T5";

/** R5.2 科技等级定义 */
export interface TechLevelDefinition {
  level: TechLevel;
  unlockCondition: string;
  judgmentModifier: number;
  levelBonus: number;
}

/** R5.3 科技等级配置 */
export const TECH_LEVELS: Record<TechLevel, TechLevelDefinition> = {
  T0: { level: "T0", unlockCondition: "初始", judgmentModifier: 0, levelBonus: 0 },
  T1: { level: "T1", unlockCondition: "渗透/安全=15", judgmentModifier: 1, levelBonus: 0 },
  T2: { level: "T2", unlockCondition: "渗透/安全=30", judgmentModifier: 1, levelBonus: 1 },
  T3: { level: "T3", unlockCondition: "渗透/安全=45", judgmentModifier: 2, levelBonus: 1 },
  T4: { level: "T4", unlockCondition: "渗透/安全=60", judgmentModifier: 2, levelBonus: 2 },
  T5: { level: "T5", unlockCondition: "渗透/安全=75", judgmentModifier: 3, levelBonus: 2 }
};

/** R5.3 科技树抽卡概率系统（金铲铲之战机制） */
export interface DrawProbability {
  common: number;    // 普通
  rare: number;      // 稀有
  epic: number;      // 史诗
  legendary: number; // 传说
}

/** R5.3.2/R5.3.3 抽卡概率表 */
export const DRAW_PROBABILITIES: Record<TechLevel, DrawProbability> = {
  T0: { common: 0.70, rare: 0.30, epic: 0.00, legendary: 0.00 },
  T1: { common: 0.55, rare: 0.35, epic: 0.10, legendary: 0.00 },
  T2: { common: 0.40, rare: 0.35, epic: 0.20, legendary: 0.05 },
  T3: { common: 0.30, rare: 0.30, epic: 0.30, legendary: 0.10 },
  T4: { common: 0.00, rare: 0.40, epic: 0.40, legendary: 0.20 },
  T5: { common: 0.00, rare: 0.20, epic: 0.50, legendary: 0.30 }
};

/** R5.3.1 卡池解锁规则 */
export const CARD_POOL_UNLOCK: Record<TechLevel, { minTech: TechLevel; maxTech: TechLevel }> = {
  T0: { minTech: "T0", maxTech: "T0" },
  T1: { minTech: "T0", maxTech: "T1" },
  T2: { minTech: "T0", maxTech: "T2" },
  T3: { minTech: "T0", maxTech: "T3" },
  T4: { minTech: "T1", maxTech: "T4" },
  T5: { minTech: "T3", maxTech: "T5" }
};

/** R5.3.5 特殊抽卡机制 */
export interface SpecialDrawMechanics {
  /** 保底机制：连续10次未出史诗/传说，下次必定出 */
  pityThreshold: number;
  /** 天选之人：首次升级至T3时必定获得传说卡 */
  firstT3Legendary: boolean;
  /** 幸运加成：拥有"幸运"效果时传说卡概率+5% */
  luckyBonus: number;
}

export const SPECIAL_DRAW_MECHANICS: SpecialDrawMechanics = {
  pityThreshold: 10,
  firstT3Legendary: true,
  luckyBonus: 0.05
};

// ============================================
// R6.0 判定机制
// ============================================

/** R6.1 猜拳选择类型 */
export type RPSChoice = "rock" | "paper" | "scissors";

/** R6.1 猜拳结果类型 */
export type RPSResult = "win" | "lose" | "draw";

/** R6.1 猜拳对决结果 */
export interface RPSDuelResult {
  outcome: RPSResult;
  winnerId: string | null;
  loserId: string | null;
  initiatorChoice: RPSChoice;
  responderChoice: RPSChoice;
  initiatorId: string;
  responderId: string;
}

/** R6.1 猜拳效果 */
export interface RPSEffect {
  type: string;
  value: number;
  params?: Record<string, any>;
  target?: "winner" | "loser" | "both";
  targetPlayerId?: string;
}

/** R6.1 猜拳机制配置 */
export interface RPSMechanicConfig {
  winEffect?: { type: string; params: Record<string, any> };
  loseEffect?: { type: string; params: Record<string, any> };
  drawEffect?: { type: string; params: Record<string, any> };
}

/** R6.2 骰子成功等级 */
export type DiceSuccessLevel = "failure" | "normal" | "excellent" | "critical";

/** R6.2 骰子判定结果 */
export interface DiceRollResult {
  roll: number;
  modifiedRoll: number;
  modifier: number;
  successLevel: DiceSuccessLevel;
  successDegree: number;
  isSuccess: boolean;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
}

/** R6.2 骰子机制配置 */
export interface DiceMechanicConfig {
  modifier?: number;
  baseDifficulty?: number;
}

// ============================================
// R7.0 效果系统
// ============================================

/** R7.1 效果类型 */
export type EffectType =
  | "resource_gain"
  | "resource_loss"
  | "resource_transfer"
  | "infiltration_change"
  | "safety_change"
  | "place_token"
  | "remove_token"
  | "draw_card"
  | "discard_card"
  | "reveal_card"
  | "rps_judgment"
  | "dice_judgment"
  | "special_mechanic";

/** R7.2 效果目标 */
export type EffectTarget = "self" | "opponent" | "both" | "area";

/** R7.3 效果触发时机 */
export type EffectTrigger =
  | "on_play"
  | "on_draw"
  | "on_discard"
  | "on_judgment"
  | "on_response"
  | "on_turn_end"
  | "on_game_end";

/** R7.4 卡牌效果 */
export interface CardEffect {
  type: EffectType;
  params: Record<string, any>;
  trigger: EffectTrigger;
}

/** R7.5 特殊效果类型 */
export type SpecialEffectType =
  | "judgment"
  | "level_change"
  | "combo"
  | "sustain"
  | "deathrattle";

/** R7.6 关键词定义 */
export const KEYWORD_DEFINITIONS: Record<string, { type: string; description: string }> = {
  combo: {
    type: "combo",
    description: "配合其他卡牌触发的效果，触发效果为：上一张卡或下一张卡符合连击卡要求卡牌类。若连击卡效果可触发，则卡面需出现金光渐变闪烁，1秒1闪"
  },
  deathrattle: {
    type: "deathrattle",
    description: "卡牌被移除时触发的效果"
  },
  sustain: {
    type: "sustain",
    description: "持续多回合的效果"
  }
};

// ============================================
// 游戏状态类型
// ============================================

/** 渗透等级 (0-100) */
export type InfiltrationLevel = number;

/** 安全等级 (0-100) */
export type SafetyLevel = number;

/** 阵营 */
export type Faction = "attacker" | "defender";

/** 队伍ID */
export type TeamId = "A" | "B";

/** 队伍共享等级 */
export interface TeamSharedLevels {
  infiltrationLevel: InfiltrationLevel;
  safetyLevel: SafetyLevel;
}

/** 个体修正值（针对特定玩家的效果） */
export interface IndividualModifiers {
  /** 渗透等级偏移量（直接加减到显示等级） */
  infiltrationLevelOffset: number;
  /** 安全等级偏移量（直接加减到显示等级） */
  safetyLevelOffset: number;
  /** 渗透获取速度修正（乘数，1.0为正常） */
  infiltrationGainModifier: number;
  /** 安全获取速度修正（乘数，1.0为正常） */
  safetyGainModifier: number;
  /** 本回合无法提升渗透（优先级最高） */
  cannotGainInfiltration: boolean;
  /** 本回合无法提升安全（优先级最高） */
  cannotGainSafety: boolean;
  /** 效果来源记录（用于调试） */
  sourceEffects: string[];
  /** 手牌上限永久偏移量（特殊效果） */
  handLimitOffset: number;
  /** 手牌上限临时偏移量（当前轮次有效） */
  handLimitTempOffset: number;
  /** 摸牌数永久偏移量（特殊效果） */
  drawCountOffset: number;
  /** 摸牌数临时偏移量（当前轮次有效） */
  drawCountTempOffset: number;
}

/** 玩家 */
export interface Player {
  id: string;
  name: string;
  faction: Faction;
  characterId: string;
  isAI: boolean;
  aiDifficulty?: "easy" | "medium" | "hard";
  team?: TeamId; // 队伍分配（用于2v2模式）
  resources: Resources;
  /** 显示用的渗透等级（队伍共享等级 + 个体偏移） */
  infiltrationLevel: InfiltrationLevel;
  /** 显示用的安全等级（队伍共享等级 + 个体偏移） */
  safetyLevel: SafetyLevel;
  /** 个体修正值（针对该玩家的特殊效果） */
  individualModifiers: IndividualModifiers;
  hand: string[];
  deck: string[];
  discard: string[];
  techLevel: TechLevel;
  controlledAreas: AreaType[];
  isAlive: boolean;
  remainingActions: number;
  maxActions: number;
  /** 达到75级的轮次数（用于胜利判定，原：回合数） */
  maxLevelReachedRound?: number;
}

/** 游戏日志条目 */
export interface GameLogEntry {
  id: string;
  timestamp: number;
  /** 回合数（单个玩家的回合） */
  turn: number;
  /** 轮次数（所有玩家完成一轮） */
  round: number;
  phase: TurnPhase;
  playerId?: string;
  action: string;
  /** 日志消息内容 */
  message: string;
  details?: Record<string, any>;
}

/** 完整游戏状态 */
export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  currentPhase: TurnPhase;
  /** 当前轮次数（所有玩家完成一轮） */
  round: number;
  /** 最大轮次数 */
  maxRounds: number;
  /** 当前回合计数（用于日志追踪，每玩家回合+1） */
  turn: number;
  areas: Record<AreaType, AreaState>;
  isActive: boolean;
  winner: Faction | null;
  victoryType: string | null;
  effectStack: CardEffect[];
  pendingEffects: CardEffect[];
  log: GameLogEntry[];
  createdAt: number;
  updatedAt: number;
  /** 队伍共享等级（2v2模式） */
  teamSharedLevels: Record<TeamId, TeamSharedLevels>;
}

/** 区域类型（用于卡牌效果） */
export type ZoneType = "perimeter" | "dmz" | "internal" | "ics";

/** 特殊效果类型（用于效果结算顺序） */
export type SpecialEffectTypeForOrder =
  | "judgment"
  | "level_change"
  | "combo"
  | "sustain"
  | "deathrattle";

/** 效果结算顺序 */
export const EFFECT_RESOLUTION_ORDER: SpecialEffectTypeForOrder[] = [
  "judgment",
  "level_change",
  "combo",
  "sustain",
  "deathrattle"
];

// ============================================
// 导出
// ============================================

export default {
  ATTACKER_VICTORY_CONDITIONS,
  DEFENDER_VICTORY_CONDITIONS,
  INITIAL_RESOURCES,
  RESOURCE_LIMITS,
  RESOURCE_RECOVERY_PER_TURN,
  TURN_PHASES,
  INITIAL_HAND_SIZE,
  DRAW_COUNT_PER_TURN,
  HAND_LIMIT,
  AREA_STRATEGIC_VALUE,
  ZONE_CONTROL_THRESHOLDS,
  TECH_LEVELS,
  KEYWORD_DEFINITIONS,
  EFFECT_RESOLUTION_ORDER
};
