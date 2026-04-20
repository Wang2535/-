/**
 * 严格类型定义 (L4修复)
 * 收紧类型定义，使用字面量类型替代宽泛的string
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

// ============================================
// 阵营和玩家类型
// ============================================

/** 阵营类型 - 严格的字面量联合类型 */
export type Faction = 'attacker' | 'defender';

/** 玩家类型 - 严格的字面量联合类型 */
export type PlayerType = 'human' | 'ai';

/** AI难度 - 严格的字面量联合类型 */
export type AIDifficulty = 'easy' | 'medium' | 'hard';

/** 玩家状态 - 严格的字面量联合类型 */
export type PlayerStatus = 'active' | 'inactive' | 'disconnected' | 'eliminated';

// ============================================
// 游戏阶段和回合
// ============================================

/** 回合阶段 - 严格的7阶段定义 */
export type TurnPhase = 
  | 'judgment'      // 判定阶段
  | 'recovery'      // 恢复阶段
  | 'draw'          // 摸牌阶段
  | 'action'        // 行动阶段
  | 'response'      // 响应阶段
  | 'discard'       // 弃牌阶段
  | 'end';          // 结束阶段

/** 阶段名称映射 */
export const PHASE_NAMES: Record<TurnPhase, string> = {
  judgment: '判定',
  recovery: '恢复',
  draw: '摸牌',
  action: '行动',
  response: '响应',
  discard: '弃牌',
  end: '结束',
};

/** 游戏状态 - 严格的字面量联合类型 */
export type GameState = 
  | 'waiting'       // 等待中
  | 'setup'         // 设置中
  | 'playing'       // 进行中
  | 'paused'        // 暂停
  | 'finished'      // 已结束
  | 'abandoned';    // 已放弃

// ============================================
// 资源系统
// ============================================

/** 资源类型 - 严格的字面量联合类型 */
export type ResourceType = 'compute' | 'funds' | 'information' | 'permission';

/** 资源类型显示名称 */
export const RESOURCE_TYPE_NAMES: Record<ResourceType, string> = {
  compute: '算力',
  funds: '资金',
  information: '信息',
  permission: '权限',
};

/** 资源类型图标 */
export const RESOURCE_TYPE_ICONS: Record<ResourceType, string> = {
  compute: '💻',
  funds: '💰',
  information: '📊',
  permission: '🔑',
};

// ============================================
// 区域系统
// ============================================

/** 区域类型 - 严格的字面量联合类型 */
export type AreaType = 'perimeter' | 'dmz' | 'internal' | 'ics';

/** 区域显示名称 */
export const AREA_TYPE_NAMES: Record<AreaType, string> = {
  perimeter: '网络边界',
  dmz: '隔离区',
  internal: '内网',
  ics: '工控系统',
};

/** 区域控制状态 */
export type AreaControlStatus = 'uncontrolled' | 'attacker' | 'defender' | 'contested';

// ============================================
// 卡牌系统
// ============================================

/** 卡牌类型 - 严格的字面量联合类型 */
export type CardType = 
  | 'attack'        // 攻击卡
  | 'defense'       // 防御卡
  | 'resource'      // 资源卡
  | 'special'       // 特殊卡
  | 'rps'           // 猜拳卡
  | 'aura';         // 光环卡

/** 卡牌稀有度 - 严格的字面量联合类型 */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 卡牌状态 - 严格的字面量联合类型 */
export type CardStatus = 'inDeck' | 'inHand' | 'inPlay' | 'inDiscard' | 'exiled';

/** 卡牌位置 - 严格的字面量联合类型 */
export type CardLocation = 
  | 'deck'          // 牌库
  | 'hand'          // 手牌
  | 'play'          // 战场
  | 'discard'       // 弃牌堆
  | 'exile'         // 放逐区
  | 'aura_zone';    // 光环区

// ============================================
// 科技树系统
// ============================================

/** 科技树等级 - 严格的字面量联合类型 */
export type TechLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** 科技树等级字符串表示 */
export type TechLevelString = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/** 科技树等级显示名称 */
export const TECH_LEVEL_NAMES: Record<TechLevel, string> = {
  0: 'T0: 初始等级',
  1: 'T1: 初级',
  2: 'T2: 中级',
  3: 'T3: 高级',
  4: 'T4: 专家',
  5: 'T5: 大师',
};

// ============================================
// 骰子系统
// ============================================

/** 骰子结果类型 - 严格的字面量联合类型 */
export type DiceResultType = 'critical_success' | 'success' | 'failure' | 'critical_failure';

/** 难度等级 - 严格的字面量联合类型 */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** 骰子结果显示名称 */
export const DICE_RESULT_NAMES: Record<DiceResultType, string> = {
  critical_success: '大成功',
  success: '成功',
  failure: '失败',
  critical_failure: '大失败',
};

// ============================================
// 猜拳系统
// ============================================

/** 猜拳选择 - 严格的字面量联合类型 */
export type RPSChoice = 'rock' | 'paper' | 'scissors';

/** 猜拳结果显示 */
export const RPS_CHOICE_NAMES: Record<RPSChoice, string> = {
  rock: '石头',
  paper: '布',
  scissors: '剪刀',
};

/** 猜拳结果 - 严格的字面量联合类型 */
export type RPSResult = 'win' | 'lose' | 'draw';

// ============================================
// 日志系统
// ============================================

/** 日志级别 - 严格的字面量联合类型 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志类型 - 严格的字面量联合类型 */
export type LogType = 
  | 'game_start'
  | 'game_end'
  | 'turn_start'
  | 'turn_end'
  | 'phase_start'
  | 'phase_end'
  | 'card_played'
  | 'card_drawn'
  | 'card_discarded'
  | 'resource_changed'
  | 'level_changed'
  | 'tech_level_up'
  | 'area_control_changed'
  | 'dice_check'
  | 'effect_triggered'
  | 'combat_result'
  | 'victory_check'
  | 'ai_action'
  | 'error';

// ============================================
// 胜利条件
// ============================================

/** 胜利类型 - 严格的字面量联合类型 */
export type VictoryType = 
  | 'full_infiltration'     // 完全渗透
  | 'security_collapse'     // 安全瓦解
  | 'blitz_victory'         // 速攻胜利
  | 'endurance_victory'     // 持久胜利
  | 'absolute_security'     // 绝对安全
  | 'threat_elimination'    // 威胁清除
  | 'rapid_defense'         // 速防胜利
  | 'draw';                 // 平局

/** 胜利类型显示名称 */
export const VICTORY_TYPE_NAMES: Record<VictoryType, string> = {
  full_infiltration: '完全渗透',
  security_collapse: '安全瓦解',
  blitz_victory: '速攻胜利',
  endurance_victory: '持久胜利',
  absolute_security: '绝对安全',
  threat_elimination: '威胁清除',
  rapid_defense: '速防胜利',
  draw: '平局',
};

// ============================================
// 效果系统
// ============================================

/** 效果触发时机 - 严格的字面量联合类型 */
export type EffectTrigger = 
  | 'onPlay'              // 打出时
  | 'onDraw'              // 抽到时
  | 'onDiscard'           // 弃置时
  | 'onTurnStart'         // 回合开始时
  | 'onTurnEnd'           // 回合结束时
  | 'onPhaseStart'        // 阶段开始时
  | 'onPhaseEnd'          // 阶段结束时
  | 'onDamage'            // 受到伤害时
  | 'onHeal'              // 恢复时
  | 'onDeath'             // 被消灭时
  | 'continuous';         // 持续效果

/** 效果目标 - 严格的字面量联合类型 */
export type EffectTarget = 
  | 'self'                // 自己
  | 'opponent'            // 对手
  | 'all'                 // 所有玩家
  | 'allAttackers'        // 所有进攻方
  | 'allDefenders'        // 所有防御方
  | 'area';               // 区域

/** 效果类型 - 严格的字面量联合类型 */
export type EffectType = 
  | 'damage'              // 伤害
  | 'heal'                // 治疗
  | 'draw'                // 抽牌
  | 'discard'             // 弃牌
  | 'resource'            // 资源
  | 'level'               // 等级
  | 'tech'                // 科技
  | 'area'                // 区域
  | 'special';            // 特殊

// ============================================
// 工具函数
// ============================================

/**
 * 验证阵营类型
 */
export function isValidFaction(value: unknown): value is Faction {
  return value === 'attacker' || value === 'defender';
}

/**
 * 验证玩家类型
 */
export function isValidPlayerType(value: unknown): value is PlayerType {
  return value === 'human' || value === 'ai';
}

/**
 * 验证回合阶段
 */
export function isValidTurnPhase(value: unknown): value is TurnPhase {
  const phases: TurnPhase[] = ['judgment', 'recovery', 'draw', 'action', 'response', 'discard', 'end'];
  return typeof value === 'string' && phases.includes(value as TurnPhase);
}

/**
 * 验证资源类型
 */
export function isValidResourceType(value: unknown): value is ResourceType {
  const types: ResourceType[] = ['compute', 'funds', 'information', 'permission'];
  return typeof value === 'string' && types.includes(value as ResourceType);
}

/**
 * 验证科技等级
 */
export function isValidTechLevel(value: unknown): value is TechLevel {
  return typeof value === 'number' && value >= 0 && value <= 5 && Number.isInteger(value);
}

/**
 * 验证猜拳选择
 */
export function isValidRPSChoice(value: unknown): value is RPSChoice {
  const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
  return typeof value === 'string' && choices.includes(value as RPSChoice);
}

/**
 * 将科技等级数字转换为字符串
 */
export function techLevelToString(level: TechLevel): TechLevelString {
  return `T${level}` as TechLevelString;
}

/**
 * 将科技等级字符串转换为数字
 */
export function techLevelFromString(levelStr: TechLevelString): TechLevel {
  return parseInt(levelStr.replace('T', ''), 10) as TechLevel;
}
