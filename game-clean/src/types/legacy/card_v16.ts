/**
 * 《道高一丈：数字博弈》v16.0 卡牌类型定义
 * 基于渗透等级/安全等级科技树系统重构
 */



// ==================== 基础枚举类型 ====================

/** 阵营类型 */
export type Faction = 'attack' | 'defense';

/** 科技等级 (1-5) */
export type TechLevel = 1 | 2 | 3 | 4 | 5;

/** 卡牌品质 */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 卡牌类型 */
export type CardType = 
  | 'basic_recon' | 'vuln_exploit' | 'privilege_escalation' | 'advanced_attack' | 'total_control'  // 攻击方
  | 'basic_defense' | 'intrusion_detection' | 'active_defense' | 'defense_in_depth' | 'absolute_security';  // 防御方

// ==================== 资源类型 ====================

/** 资源类型 */
export interface Resources {
  compute: number;      // 算力 ⚡
  funds: number;        // 资金 💰
  information: number;  // 信息 👁️
  access: number;       // 权限 👑
}

/** 资源类型键 */
export type ResourceType = keyof Resources;

// ==================== 效果类型定义 ====================

/** 效果触发时机 */
export type EffectTrigger = 
  | 'immediate'      // 立即触发
  | 'on_play'        // 出牌时
  | 'on_success'     // 判定成功时
  | 'on_failure'     // 判定失败时
  | 'on_critical'    // 大成功时
  | 'on_turn_start'  // 回合开始
  | 'on_turn_end'    // 回合结束
  | 'on_attack'      // 受到攻击时
  | 'on_defense'     // 对方防御时
  | 'consecutive'    // 连击时
  | 'sustain';       // 持续效果

/** 核心效果类型 - 围绕等级系统设计 */
export type CoreEffectType =
  | 'security_reduce'      // 降低对方安全等级（攻击方）
  | 'security_gain'        // 提升自身安全等级（防御方）
  | 'infiltration_gain'    // 提升自身渗透等级（攻击方）
  | 'infiltration_reduce'  // 降低对方渗透等级（防御方）
  | 'security_suppress'    // 压制对方安全等级提升
  | 'infiltration_suppress' // 压制对方渗透等级提升
  | 'resource_gain'        // 获得资源
  | 'resource_steal'       // 窃取资源
  | 'draw'                 // 抽牌
  | 'discard'              // 弃牌
  | 'protection'           // 保护效果
  | 'clear_effect';        // 清除效果

/** 等级变化效果配置 */
export interface LevelChangeEffect {
  type: 'security_reduce' | 'security_gain' | 'infiltration_gain' | 'infiltration_reduce';
  baseValue: number;           // 基础变化值
  techBonus?: boolean;         // 是否享受科技加成
  comboBonus?: boolean;        // 是否享受连击加成
  diceAffected?: boolean;      // 是否受判定结果影响
  description: string;         // 效果描述
}

/** 资源效果配置 */
export interface ResourceEffect {
  type: 'resource_gain' | 'resource_steal';
  resourceType: ResourceType;
  value: number;
  target?: 'self' | 'opponent' | 'all';
  description: string;
}

/** 抽牌/弃牌效果 */
export interface CardDrawEffect {
  type: 'draw' | 'discard';
  value: number;
  target?: 'self' | 'opponent';
  description: string;
}

/** 压制效果 */
export interface SuppressEffect {
  type: 'security_suppress' | 'infiltration_suppress';
  duration: number;  // 持续回合数
  description: string;
}

/** 保护效果 */
export interface ProtectionEffect {
  type: 'protection';
  protectionType: string;  // 保护类型（如：credential_protection, lateral_movement_block等）
  duration?: number;       // 持续回合数（undefined表示永久）
  description: string;
}

/** 清除效果 */
export interface ClearEffect {
  type: 'clear_effect';
  clearType: 'vulnerability' | 'sustain' | 'all' | string;
  description: string;
}

/** 连击效果配置 */
export interface ComboEffect {
  trigger?: string;           // 触发条件（如：consecutive_recon, consecutive_attack）
  type?: 'same_type' | 'previous' | 'next' | 'sequence';  // 连击类型
  requiredCardType?: CardType;  // 要求的卡牌类型
  bonus: number;             // 加成数值
  maxStack?: number;          // 最大叠加次数
  description: string;
}

/** 持续效果配置 */
export interface SustainEffect {
  duration: number;          // 持续回合数
  effect: LevelChangeEffect | ResourceEffect | SuppressEffect;
  clearDifficulty?: number;  // 清除难度（用于难以清除的效果）
  description: string;
}

/** 反击效果配置 */
export interface CounterEffect {
  trigger: string;           // 触发条件
  effect: LevelChangeEffect | ResourceEffect | CardDrawEffect;
  description: string;
}

/** 判定效果配置 */
export interface DiceCheckEffect {
  type: 'dice_check';
  difficulty: number;        // 判定难度 1-6
  isDelayed?: boolean;       // 是否为延迟判定（在判定阶段执行）
  onSuccess: LevelChangeEffect | ResourceEffect | CardDrawEffect;
  onFailure?: LevelChangeEffect | ResourceEffect;
  onCriticalSuccess?: LevelChangeEffect | ResourceEffect;
  onCriticalFailure?: LevelChangeEffect | ResourceEffect;
  description?: string;      // 效果描述
}

/** RPS（剪刀石头布）判定效果配置 */
export interface RPSCheckEffect {
  type: 'rps_check';
  isDelayed?: boolean;       // 是否为延迟判定（在判定阶段执行）
  onWin: LevelChangeEffect | ResourceEffect | CardDrawEffect;
  onLose: LevelChangeEffect | ResourceEffect;
  onDraw?: LevelChangeEffect | ResourceEffect;  // 平局效果（可选）
}

/** 卡牌效果联合类型 */
export type CardEffect = 
  | LevelChangeEffect 
  | ResourceEffect 
  | CardDrawEffect 
  | SuppressEffect 
  | ProtectionEffect 
  | ClearEffect
  | DiceCheckEffect
  | RPSCheckEffect;

// ==================== 卡牌定义 ====================

/** 卡牌基础定义 */
export interface Card {
  card_code: string;           // 卡牌唯一编码（如：ATTACK_T1_001）
  name: string;                // 卡牌名称
  faction: Faction;            // 阵营
  techLevel: TechLevel;        // 科技等级 1-5
  rarity: CardRarity;          // 品质
  type: CardType;              // 卡牌类型
  cost: Partial<Resources>;    // 资源消耗
  difficulty: number;          // 判定难度 1-6
  
  // 效果配置
  effects: CardEffect[];       // 主要效果列表
  comboEffect?: ComboEffect;   // 连击效果（可选）
  sustainEffect?: SustainEffect; // 持续效果（可选）
  counterEffect?: CounterEffect; // 反击效果（可选）
  protectionEffect?: ProtectionEffect; // 保护效果（可选）
  clearEffect?: ClearEffect;   // 清除效果（可选）
  
  // 特殊效果
  teamEffect?: {               // 团队效果（2v2）
    target: 'all_attack' | 'all_defense';
    effect: LevelChangeEffect;
  };
  
  // 胜利条件相关
  victoryCondition?: {         // 胜利条件（仅传说卡牌）
    type: string;
    threshold: number;
    description: string;
  };
  
  // 描述信息
  description: string;         // 卡牌描述
  flavorText?: string;         // 风味文本（可选）
}

// ==================== 科技树类型 ====================

/** 科技树解锁配置 */
export interface TechTreeUnlock {
  level: TechLevel;                    // 科技等级
  requiredInfiltration: number;        // 攻击方所需渗透等级
  requiredSecurity: number;            // 防御方所需安全等级
  unlockedCardTypes: CardType[];       // 解锁的卡牌类型
  effects: {                           // 科技等级效果
    attack?: {
      diceModifier?: number;           // 判定修正
      levelBonus?: number;             // 等级变化加成
    };
    defense?: {
      diceModifier?: number;
      levelBonus?: number;
    };
  };
}

/** 科技树状态 */
export interface TechTreeState {
  attackTechLevel: TechLevel;          // 攻击方科技等级
  defenseTechLevel: TechLevel;         // 防御方科技等级
  unlockedCards: Set<string>;          // 已解锁卡牌代码
}

// ==================== 等级系统类型 ====================

/** 等级变化历史记录 */
export interface LevelChangeRecord {
  round: number;               // 回合数
  playerId: string;            // 玩家ID
  type: 'infiltration' | 'security';
  oldValue: number;
  newValue: number;
  change: number;
  source: string;              // 变化来源（卡牌代码或效果）
  timestamp: number;
}

/** 连击状态 */
export interface ComboState {
  playerId: string;            // 玩家ID
  cardType: string;            // 卡牌类型
  consecutiveCount: number;    // 连续使用次数
  lastPlayedRound: number;     // 最后使用回合
}

/** 持续效果状态 */
export interface SustainEffectState {
  id: string;                  // 唯一ID
  sourceCard: string;          // 来源卡牌
  targetPlayer: string;        // 目标玩家
  effect: SustainEffect;
  remainingRounds: number;     // 剩余回合数
  createdAt: number;           // 创建时间
}

/** 压制效果状态 */
export interface SuppressState {
  type: 'security_suppress' | 'infiltration_suppress';
  targetPlayer: string;
  remainingRounds: number;
  sourceCard: string;
}

// ==================== 等级计算类型 ====================

/** 等级变化公式配置 */
export interface LevelChangeFormula {
  baseValue: number;
  techLevelBonus: (techLevel: TechLevel) => number;
  comboBonus: (consecutiveUses: number) => number;
  diceModifier: (diceRoll: number) => number;
}

/** 等级变化计算参数 */
export interface LevelChangeParams {
  baseValue: number;
  techLevel: TechLevel;
  consecutiveUses: number;
  diceRoll?: number;
  modifiers?: number[];        // 额外修正值
}

// ==================== 卡牌筛选和查询类型 ====================

/** 卡牌筛选条件 */
export interface CardFilter {
  faction?: Faction;
  techLevel?: TechLevel | TechLevel[];
  rarity?: CardRarity | CardRarity[];
  type?: CardType | CardType[];
  costRange?: { min?: number; max?: number };
  difficultyRange?: { min?: number; max?: number };
}

/** 卡牌排序选项 */
export type CardSortOption = 
  | 'techLevel' 
  | 'rarity' 
  | 'difficulty' 
  | 'cost' 
  | 'name';

// ==================== 导出兼容类型 ====================

// 为了向后兼容，保留一些旧类型别名
/** @deprecated 使用 Card 替代 */
export type CardV16 = Card;

/** @deprecated 使用 CardEffect 替代 */
export type CardEffectV16 = CardEffect;
