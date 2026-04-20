/**
 * 《道高一丈：数字博弈》角色规则类型定义
 * 文档版本: v17.0.0
 * 最后更新: 2026-02-01
 * 
 * 本文件严格依据"完善的角色规则.md"定义
 * 严禁修改文档内容，所有实现必须与源文档保持一致
 */

// ============================================
// 角色基础类型定义
// ============================================

/**
 * 角色编号规则: [阵营][类型][序号]
 * 阵营: A=进攻方(Attacker), D=防御方(Defender)
 * 类型: R=猜拳(RPS), C=骰子(Chance), S=专属(Special)
 * 示例: AR01 = 进攻方猜拳系角色01号
 */
export type CharacterId = 
  // 进攻方
  | "AR01" | "AR02" | "AR03"  // 猜拳系
  | "AC01" | "AC02" | "AC03"  // 骰子系
  | "AS01" | "AS02" | "AS03"  // 专属系
  // 防御方
  | "DR01" | "DR02" | "DR03"  // 猜拳系
  | "DC01" | "DC02" | "DC03"  // 骰子系
  | "DS01" | "DS02" | "DS03"; // 专属系

/**
 * 角色阵营
 */
export type CharacterFaction = "attacker" | "defender";

/**
 * 角色类型/机制分类
 */
export type CharacterType = "RPS" | "Chance" | "Special";

/**
 * 角色定位
 */
export type CharacterRole = 
  // 进攻方
  | "猜拳特化/资源博弈"
  | "信息掌控/预判强化"
  | "欺骗/伪装/反制"
  | "概率操控/骰子特化"
  | "幸运加成/大成功特化"
  | "风险博弈/资源投资"
  | "卡组优化/抽卡控制"
  | "资源转换/能量管理"
  | "区域控制/战术指挥"
  // 防御方
  | "防御特化/资源保护"
  | "反击特化/镜像复制"
  | "预判特化/提前防御"
  | "概率操控/骰子防御"
  | "幸运加成/大成功防御"
  | "风险对冲/资源防御"
  | "防御卡牌特化/牌库操控"
  | "防御资源特化/能量转换"
  | "防御区域控制/战术调度";

/**
 * 操作难度
 */
export type DifficultyRating = 1 | 2 | 3 | 4 | 5;

// ============================================
// 角色基础属性
// ============================================

/**
 * 角色基础属性定义
 */
export interface CharacterBaseStats {
  /** 渗透等级（进攻方）或安全等级（防御方） */
  level: {
    initial: 0;
    max: 75;
    specialNote?: string;
  };
  /** 算力 */
  computing: {
    initial: 3;
    max: 15;
    specialNote?: string;
  };
  /** 资金 */
  funds: {
    initial: 5;
    max: 20;
    specialNote?: string;
  };
  /** 信息 */
  information: {
    initial: 2;
    max: 10;
    specialNote?: string;
  };
  /** 权限 */
  permission: {
    initial: 0;
    max: 5;
    specialNote?: string;
  };
  /** 手牌上限（可选，部分角色有特殊加成） */
  handLimit?: {
    initial: number;
    max: number;
    specialNote?: string;
  };
}

// ============================================
// 技能系统定义
// ============================================

/**
 * 技能类型
 */
export type SkillType = "passive" | "active" | "ultimate";

/**
 * 技能触发条件
 */
export interface SkillTrigger {
  /** 触发时机描述 */
  description: string;
  /** 是否需要消耗资源 */
  requiresCost: boolean;
  /** 是否有冷却时间 */
  hasCooldown: boolean;
  /** 冷却时间（回合数） */
  cooldownTurns?: number;
  /** 整局游戏使用次数限制 */
  maxUsesPerGame?: number;
}

/**
 * 技能效果
 */
export interface SkillEffect {
  /** 效果描述 */
  description: string;
  /** 效果数值 */
  values?: Record<string, number>;
  /** 特殊机制 */
  specialMechanics?: string[];
  /** 与基础规则的交互说明 */
  ruleInteraction?: string;
}

/**
 * 技能定义
 */
export interface SkillDefinition {
  /** 技能编号 */
  id: string;
  /** 技能名称 */
  name: string;
  /** 技能类型 */
  type: SkillType;
  /** 触发条件 */
  trigger: SkillTrigger;
  /** 资源消耗（如果有） */
  resourceCost?: {
    computing?: number;
    information?: number;
    funds?: number;
    permission?: number;
    any?: number; // 任意资源
    luckyMark?: number; // 幸运标记（骰子系角色特有）
    special?: string; // 特殊资源消耗（如"守护标记1点"）
  };
  /** 技能效果 */
  effect: SkillEffect;
  /** 限制说明 */
  restrictions?: string[];
  /** 战略价值说明 */
  strategicValue?: string;
}

// ============================================
// 特殊机制定义
// ============================================

/**
 * 角色特殊机制
 */
export interface SpecialMechanic {
  /** 机制名称 */
  name: string;
  /** 机制描述 */
  description: string;
  /** 触发条件 */
  trigger: string;
  /** 效果 */
  effect: string;
  /** 层数/计数器（如果有） */
  counters?: {
    name: string;
    maxStacks?: number;
    effectsPerStack: Record<number, string>;
  };
}

/**
 * 专属卡牌（仅专属系角色有）
 */
export interface ExclusiveCard {
  /** 卡牌编号 */
  id: string;
  /** 卡牌名称 */
  name: string;
  /** 卡牌类型 */
  type: string;
  /** 效果 */
  effect: string;
}

// ============================================
// 完整角色定义
// ============================================

/**
 * 角色定义
 */
export interface CharacterDefinition {
  /** 角色编号 */
  id: CharacterId;
  /** 角色名称 */
  name: {
    chinese: string;
    english: string;
  };
  /** 阵营归属 */
  faction: CharacterFaction;
  /** 角色类型 */
  type: CharacterType;
  /** 角色定位 */
  role: CharacterRole;
  /** 操作难度 */
  difficulty: DifficultyRating;
  /** 背景故事 */
  backstory: string;
  /** 基础属性 */
  baseStats: CharacterBaseStats;
  /** 核心技能 */
  skills: {
    skill1: SkillDefinition; // 技能一（通常是被动）
    skill2: SkillDefinition; // 技能二（通常是主动）
    skill3: SkillDefinition; // 技能三（通常是终极）
  };
  /** 特殊机制（如果有） */
  specialMechanics?: SpecialMechanic[];
  /** 专属卡牌（仅专属系角色） */
  exclusiveCards?: ExclusiveCard[];
  /** 使用建议 */
  usageTips: {
    /** 优势对局 */
    advantageMatchups: string[];
    /** 劣势对局 */
    disadvantageMatchups: string[];
    /** 推荐策略 */
    recommendedStrategy: string[];
  };
}

// ============================================
// 角色分类定义
// ============================================

/**
 * 猜拳判定机制角色
 */
export interface RPSCharacter extends CharacterDefinition {
  type: "RPS";
  /** 猜拳系特有机制 */
  rpsMechanics: {
    /** 对猜拳判定的影响 */
    judgmentInfluence: string;
    /** 心理博弈能力 */
    mindGameAbility: string;
  };
}

/**
 * 骰子判定机制角色
 */
export interface ChanceCharacter extends CharacterDefinition {
  type: "Chance";
  /** 骰子系特有机制 */
  chanceMechanics: {
    /** 对骰子判定的影响 */
    diceInfluence: string;
    /** 概率操控能力 */
    probabilityControl: string;
  };
}

/**
 * 专属卡牌机制角色
 */
export interface SpecialCharacter extends CharacterDefinition {
  type: "Special";
  /** 必须有专属卡牌 */
  exclusiveCards: ExclusiveCard[];
}

/**
 * 所有角色类型联合
 */
export type AnyCharacter = RPSCharacter | ChanceCharacter | SpecialCharacter;

// ============================================
// 角色平衡性定义
// ============================================

/**
 * 角色平衡数据
 */
export interface CharacterBalanceData {
  /** 角色ID */
  characterId: CharacterId;
  /** 平均胜率 */
  averageWinRate: number;
  /** 胜率波动 */
  winRateVariance: number;
  /** 优势对局数 */
  advantageMatchups: number;
  /** 劣势对局数 */
  disadvantageMatchups: number;
}

/**
 * 克制关系
 */
export interface CharacterMatchup {
  /** 角色ID */
  characterId: CharacterId;
  /** 克制的角色 */
  counters: CharacterId[];
  /** 被克制的角色 */
  counteredBy: CharacterId[];
  /** 克制原因 */
  reason: string;
}

// ============================================
// 角色选择相关
// ============================================

/**
 * 角色选择信息
 */
export interface CharacterSelectionInfo {
  /** 角色ID */
  id: CharacterId;
  /** 角色名称 */
  name: string;
  /** 类型 */
  type: CharacterType;
  /** 难度 */
  difficulty: DifficultyRating;
  /** 一句话描述 */
  shortDescription: string;
  /** 适合玩家 */
  suitableFor: string;
}

/**
 * 角色选择快速指南
 */
export interface CharacterSelectionGuide {
  /** 按难度排序 */
  byDifficulty: CharacterSelectionInfo[];
  /** 按机制类型排序 */
  byMechanic: Record<CharacterType, CharacterSelectionInfo[]>;
  /** 推荐选择 */
  recommendations: {
    /** 喜欢心理博弈 */
    mindGames: CharacterId[];
    /** 喜欢计算概率 */
    probability: CharacterId[];
    /** 喜欢稳定收益 */
    stableIncome: CharacterId[];
    /** 喜欢策略构筑 */
    strategyBuilding: CharacterId[];
    /** 喜欢分析对手 */
    analysis: CharacterId[];
  };
}

// ============================================
// 角色实例（运行时）
// ============================================

/**
 * 角色实例（游戏中的角色状态）
 */
export interface CharacterInstance {
  /** 实例ID */
  instanceId: string;
  /** 角色定义ID */
  characterId: CharacterId;
  /** 玩家ID */
  playerId: string;
  /** 技能使用记录 */
  skillUsage: {
    /** 技能一使用次数 */
    skill1Uses: number;
    /** 技能二使用次数 */
    skill2Uses: number;
    /** 技能三使用次数 */
    skill3Uses: number;
    /** 技能二冷却剩余 */
    skill2Cooldown: number;
    /** 技能三冷却剩余 */
    skill3Cooldown: number;
  };
  /** 特殊机制计数器 */
  mechanicCounters: Record<string, number>;
  /** 行为记录（用于读心者等角色） */
  behaviorLog?: {
    opponentChoices: string[];
    predictionAvailable: boolean;
  };
  /** 幸运标记（用于骰子姬） */
  luckTokens?: number;
  /** 千面标记（用于千面客） */
  thousandFacesStacks?: number;
}

// ============================================
// 角色ID常量（便于使用）
// ============================================

/**
 * 猜拳系角色ID
 */
export const RPS_CHARACTER_IDS = ["AR01", "AR02", "AR03"] as const;

/**
 * 骰子系角色ID
 */
export const CHANCE_CHARACTER_IDS = ["AC01", "AC02", "AC03"] as const;

/**
 * 专属系角色ID
 */
export const SPECIAL_CHARACTER_IDS = ["AS01", "AS02", "AS03"] as const;

/**
 * 所有角色ID
 */
export const ALL_CHARACTER_IDS = [
  ...RPS_CHARACTER_IDS,
  ...CHANCE_CHARACTER_IDS,
  ...SPECIAL_CHARACTER_IDS
] as const;

/**
 * 角色类型映射
 */
export const CHARACTER_TYPE_MAP: Record<CharacterId, CharacterType> = {
  // 进攻方
  AR01: "RPS", AR02: "RPS", AR03: "RPS",
  AC01: "Chance", AC02: "Chance", AC03: "Chance",
  AS01: "Special", AS02: "Special", AS03: "Special",
  // 防御方
  DR01: "RPS", DR02: "RPS", DR03: "RPS",
  DC01: "Chance", DC02: "Chance", DC03: "Chance",
  DS01: "Special", DS02: "Special", DS03: "Special"
};

/**
 * 角色名称映射
 */
export const CHARACTER_NAME_MAP: Record<CharacterId, { chinese: string; english: string }> = {
  // 进攻方
  AR01: { chinese: "博弈大师·赛博赌徒", english: "Cyber Gambler" },
  AR02: { chinese: "心理分析师·读心者", english: "Mind Reader" },
  AR03: { chinese: "欺诈专家·千面客", english: "Master of Deception" },
  AC01: { chinese: "命运编织者·概率使", english: "Probability Weaver" },
  AC02: { chinese: "幸运女神·骰子姬", english: "Dice Goddess" },
  AC03: { chinese: "风险投资人·博弈者", english: "Risk Investor" },
  AS01: { chinese: "卡组构筑师·牌库掌控者", english: "Deck Builder" },
  AS02: { chinese: "资源调配师·能量核心", english: "Resource Manager" },
  AS03: { chinese: "战术指挥官·战场统帅", english: "Battle Commander" },
  // 防御方
  DR01: { chinese: "防御大师·壁垒守卫", english: "Defense Master" },
  DR02: { chinese: "反击专家·镜像守卫", english: "Counter Specialist" },
  DR03: { chinese: "预判大师·先知守卫", english: "Prediction Master" },
  DC01: { chinese: "概率防御者·骰子守卫", english: "Probability Defender" },
  DC02: { chinese: "幸运防御者·命运守卫", english: "Luck Defender" },
  DC03: { chinese: "风险防御者·稳健守卫", english: "Risk Defender" },
  DS01: { chinese: "卡组防御者·牌库守卫", english: "Deck Defender" },
  DS02: { chinese: "资源防御者·能量守卫", english: "Resource Defender" },
  DS03: { chinese: "战术防御者·战场守卫", english: "Tactical Defender" }
};
