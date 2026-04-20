/**
 * 《道高一丈：数字博弈》卡牌规则类型定义
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-01
 * 
 * 本文件严格依据"完善的游戏规则.md"中的卡牌数据库规范定义
 * 严禁修改文档内容，所有实现必须与源文档保持一致
 */

import type { TechLevel, ZoneType, EffectType, SpecialEffectType } from './gameRules';

// ============================================
// 卡牌基础类型定义
// ============================================

/**
 * 卡牌归属
 */
export type CardFaction = "attacker" | "defender" | "common";

/**
 * 卡牌稀有度
 */
export type CardRarity = "common" | "rare" | "epic" | "legendary";

/**
 * 进攻方卡牌类型
 */
export type AttackerCardType = 
  | "基础侦查" 
  | "漏洞利用" 
  | "权限提升" 
  | "高级攻击" 
  | "完全控制";

/**
 * 防御方卡牌类型
 */
export type DefenderCardType = 
  | "基础防御" 
  | "入侵检测" 
  | "主动防御" 
  | "纵深防御" 
  | "绝对安全";

/**
 * 通用卡牌类型
 */
export type CommonCardType = "通用";

/**
 * 所有卡牌类型
 */
export type CardType = AttackerCardType | DefenderCardType | CommonCardType;

// ============================================
// 卡牌字段定义（严格遵循字段定义表）
// ============================================

/**
 * 卡牌编号格式: [归属首字母][类型缩写][3位序号]
 * A=进攻方, D=防御方, C=通用
 * ATK=攻击, DEF=防御, SPE=特殊
 * 示例: ATK001, DEF001, SPE001
 */
export type CardId = string;

/**
 * 卡牌名称格式: 中文（英文）
 * 括号内英文保留
 * 示例: 端口扫描（Port Scan）
 */
export interface CardName {
  chinese: string;
  english: string;
}

/**
 * 资源消耗格式: 算力X,信息Y,资金Z,权限W
 * 缺失写0
 */
export interface ResourceCost {
  compute?: number;  // 算力
  information?: number; // 信息
  funds?: number;      // 资金
  permission?: number; // 权限
}

/**
 * 卡牌效果严格模板
 * 消耗：[资源]；效果：[描述]；触发：[时机]
 * 分号分隔，关键词加粗
 */
export interface CardEffect {
  /** 消耗描述 */
  cost: string;
  /** 效果描述 */
  effect: string;
  /** 触发时机 */
  trigger: string;
  /** 额外效果（连击、大成功等） */
  extra?: string;
}

// ============================================
// 卡牌数量规范（R2.4）
// ============================================

/**
 * R2.4.1 数量标准表
 */
export const CARD_QUANTITY_RULES: Record<TechLevel, Record<CardRarity, number>> = {
  T0: { common: 5, rare: 5, epic: 0, legendary: 0 },
  T1: { common: 4, rare: 4, epic: 0, legendary: 0 },
  T2: { common: 0, rare: 3, epic: 3, legendary: 0 },
  T3: { common: 0, rare: 2, epic: 2, legendary: 2 },
  T4: { common: 0, rare: 0, epic: 1, legendary: 1 },
  T5: { common: 0, rare: 0, epic: 0, legendary: 0 }
};

/**
 * R2.4.3 牌库总量控制
 */
export const DECK_SIZE_TARGETS = {
  attacker: { techLevels: "T0-T4", cardTypes: "约40种", totalCards: "约135张" },
  defender: { techLevels: "T0-T4", cardTypes: "约40种", totalCards: "约135张" },
  common: { techLevels: "T0-T3", cardTypes: "约15种", totalCards: "约70张" },
  total: "约95种卡牌，总计约340张"
};

// ============================================
// 卡牌定义接口
// ============================================

/**
 * 完整卡牌定义
 */
export interface CardDefinition {
  /** 卡牌编号 */
  id: CardId;
  /** 卡牌名称 */
  name: CardName;
  /** 卡牌类型 */
  cardType: CardType;
  /** 卡牌归属 */
  faction: CardFaction;
  /** 卡牌稀有度 */
  rarity: CardRarity;
  /** 科技树解锁等级 */
  techLevel: TechLevel;
  /** 卡牌效果 */
  effect: CardEffect;
  /** 卡牌数量（根据稀有度和科技树等级） */
  quantity: number;
  /** 特殊效果标签 */
  specialEffects?: SpecialEffectType[];
  /** 连击条件（如果有） */
  comboCondition?: string;
  /** 亡语效果（如果有） */
  deathrattle?: string;
  /** 光环效果（如果有） */
  aura?: string;
  /** 持续效果（如果有） */
  sustain?: {
    duration: number;
    effect: string;
  };
}

// ============================================
// 进攻方卡牌库类型
// ============================================

/**
 * T0 基础侦查（8张）
 */
export type T0AttackerCardId = 
  | "ATK001" | "ATK002" | "ATK003" | "ATK004" 
  | "ATK005" | "ATK006" | "ATK007" | "ATK008";

/**
 * T1 漏洞利用（8张）
 */
export type T1AttackerCardId = 
  | "ATK009" | "ATK010" | "ATK011" | "ATK012" 
  | "ATK013" | "ATK014" | "ATK015" | "ATK016";

/**
 * T2 权限提升（8张）
 */
export type T2AttackerCardId = 
  | "ATK017" | "ATK018" | "ATK019" | "ATK020" 
  | "ATK021" | "ATK022" | "ATK023" | "ATK024";

/**
 * T3 高级攻击（8张）
 */
export type T3AttackerCardId = 
  | "ATK025" | "ATK026" | "ATK027" | "ATK028" 
  | "ATK029" | "ATK030" | "ATK031" | "ATK032";

/**
 * T4 完全控制（8张）
 */
export type T4AttackerCardId = 
  | "ATK033" | "ATK034" | "ATK035" | "ATK036" 
  | "ATK037" | "ATK038" | "ATK039" | "ATK040";

/**
 * 所有进攻方卡牌ID
 */
export type AttackerCardId = T0AttackerCardId | T1AttackerCardId | T2AttackerCardId | T3AttackerCardId | T4AttackerCardId;

// ============================================
// 防御方卡牌库类型
// ============================================

/**
 * T0 基础防御（8张）
 */
export type T0DefenderCardId = 
  | "DEF001" | "DEF002" | "DEF003" | "DEF004" 
  | "DEF005" | "DEF006" | "DEF007" | "DEF008";

/**
 * T1 入侵检测（8张）
 */
export type T1DefenderCardId = 
  | "DEF009" | "DEF010" | "DEF011" | "DEF012" 
  | "DEF013" | "DEF014" | "DEF015" | "DEF016";

/**
 * T2 主动防御（8张）
 */
export type T2DefenderCardId = 
  | "DEF017" | "DEF018" | "DEF019" | "DEF020" 
  | "DEF021" | "DEF022" | "DEF023" | "DEF024";

/**
 * T3 纵深防御（8张）
 */
export type T3DefenderCardId = 
  | "DEF025" | "DEF026" | "DEF027" | "DEF028" 
  | "DEF029" | "DEF030" | "DEF031" | "DEF032";

/**
 * T4 绝对安全（8张）
 */
export type T4DefenderCardId = 
  | "DEF033" | "DEF034" | "DEF035" | "DEF036" 
  | "DEF037" | "DEF038" | "DEF039" | "DEF040";

/**
 * 所有防御方卡牌ID
 */
export type DefenderCardId = T0DefenderCardId | T1DefenderCardId | T2DefenderCardId | T3DefenderCardId | T4DefenderCardId;

// ============================================
// 通用卡牌库类型
// ============================================

/**
 * 通用卡牌ID（约15种）
 */
export type CommonCardId = 
  | "COM001" | "COM002" | "COM003" | "COM004" | "COM005"
  | "COM006" | "COM007" | "COM008" | "COM009" | "COM010"
  | "COM011" | "COM012" | "COM013" | "COM014" | "COM015";

// ============================================
// 完整卡牌库类型
// ============================================

/**
 * 所有卡牌ID
 */
export type AllCardId = AttackerCardId | DefenderCardId | CommonCardId;

/**
 * 卡牌库定义
 */
export interface CardLibrary {
  attacker: Record<AttackerCardId, CardDefinition>;
  defender: Record<DefenderCardId, CardDefinition>;
  common: Record<CommonCardId, CardDefinition>;
}

// ============================================
// 卡牌效果解析类型
// ============================================

/**
 * 解析后的卡牌效果
 */
export interface ParsedCardEffect {
  /** 资源消耗 */
  resourceCost: ResourceCost;
  /** 主要效果 */
  primaryEffect: {
    type: EffectType;
    target: string;
    value: number;
  };
  /** 判定要求（如果有） */
  judgmentRequirement?: {
    difficulty: number;
    successEffect: string;
    failureEffect: string;
  };
  /** 触发时机 */
  trigger: "出牌时" | "响应时" | "回合开始时" | "回合结束时" | string;
  /** 特殊效果 */
  specialEffects: Array<{
    type: SpecialEffectType;
    condition?: string;
    effect: string;
  }>;
}

// ============================================
// 卡牌实例类型（运行时）
// ============================================

/**
 * 卡牌实例（游戏中的具体卡牌）
 */
export interface CardInstance {
  /** 实例唯一ID */
  instanceId: string;
  /** 卡牌定义ID */
  cardId: AllCardId;
  /** 所有者ID */
  ownerId: string;
  /** 是否正面朝上 */
  isFaceUp: boolean;
  /** 是否横置 */
  isTapped: boolean;
  /** 持续效果剩余回合 */
  sustainTurnsRemaining: number;
  /** 是否在本回合使用过 */
  usedThisTurn: boolean;
  /** 放置区域（如果是光环卡） */
  placedZone?: ZoneType;
}

// ============================================
// 抽卡相关类型
// ============================================

/**
 * 抽卡结果
 */
export interface DrawResult {
  /** 抽到的卡牌 */
  cards: CardInstance[];
  /** 是否触发保底机制 */
  pityTriggered: boolean;
  /** 是否触发天选之人 */
  chosenOneTriggered: boolean;
}

/**
 * 卡池状态
 */
export interface CardPoolState {
  /** 当前科技等级 */
  currentTechLevel: TechLevel;
  /** 各稀有度剩余卡牌数量 */
  remainingCards: Record<CardRarity, number>;
  /** 连续未出史诗/传说次数 */
  pityCounter: number;
  /** 是否已触发天选之人 */
  chosenOneUsed: boolean;
}
