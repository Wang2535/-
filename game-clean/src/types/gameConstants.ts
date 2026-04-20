/**
 * 游戏常量定义
 * 集中管理所有游戏数值，避免魔法数字
 * 
 * 文档版本: v17.0.0
 * 最后更新: 2026-02-08
 */

// ============================================
// 游戏基础常量
// ============================================

/** 游戏基础配置 - 基于轮次（round）而非回合（turn） */
export const GAME_CONFIG = {
  /** 最大轮次数 (R1.1/R1.2 持久胜利判定轮次) - 12轮次制（原：24回合制） */
  MAX_ROUNDS: 12,
  /** 早期游戏轮次数（1-4轮次，原：1-8回合） */
  EARLY_GAME_ROUNDS: 4,
  /** 中期游戏轮次数（5-8轮次，原：9-16回合） */
  MID_GAME_ROUNDS: 8,
  /** 后期游戏轮次数（9-12轮次，原：17-24回合） */
  LATE_GAME_ROUNDS: 12,
  /** 胜利条件判定起始轮次（第5轮次起，原：第9回合起） */
  VICTORY_CHECK_START_ROUND: 5,
  /** 速攻胜利截止轮次（第4轮次前，原：第8回合前） */
  QUICK_VICTORY_MAX_ROUND: 4,
  /** 速攻胜利等级要求 */
  QUICK_VICTORY_LEVEL: 50,
  /** 完全渗透胜利等级 */
  FULL_INFILTRATION_LEVEL: 75,
  /** 绝对安全胜利等级 */
  ABSOLUTE_SAFETY_LEVEL: 75,
  /** 威胁清除/安全瓦解等级 */
  ELIMINATION_LEVEL: 0,
} as const;

// ============================================
// 手牌和牌库常量
// ============================================

/** 手牌限制 (R4.3) - 24轮次制
 * 新配置：
 * - 1-4轮次：手牌上限1张，每回合抽3张
 * - 5-8轮次：手牌上限3张，每回合抽3张
 * - 9-16轮次：手牌上限4张，每回合抽4张
 * - 17-24轮次：手牌上限5张，每回合抽5张
 */
export const HAND_LIMITS = {
  /** 初始手牌数量 */
  INITIAL: 4,
  /** 1-4轮次手牌上限 */
  EARLY_GAME_MAX: 1,
  /** 5-8轮次手牌上限 */
  MID_GAME_MAX: 3,
  /** 9-16轮次手牌上限 */
  LATE_GAME_MAX_1: 4,
  /** 17-24轮次手牌上限 */
  LATE_GAME_MAX_2: 5,
  /** 每轮次抽牌数 - 1-8轮次3张，9-16轮次4张，17-24轮次5张 */
  DRAW_PER_ROUND: {
    EARLY: 3,  // 1-8轮次抽3张
    MID: 4,    // 9-16轮次抽4张
    LATE: 5,   // 17-24轮次抽5张
  },
  /** 弃牌阶段保留数量（基础值） */
  DISCARD_KEEP: 7,
} as const;

/**
 * 根据轮次数获取手牌上限 - 24轮次制
 * @param round 当前轮次数
 * @param handLimitOffset 手牌上限永久偏移量（特殊效果）
 * @param handLimitTempOffset 手牌上限临时偏移量（当前轮次有效）
 * @returns 手牌上限
 */
export function getHandLimitByRound(
  round: number,
  handLimitOffset: number = 0,
  handLimitTempOffset: number = 0
): number {
  // 1-4轮次：1张，5-8轮次：3张，9-16轮次：4张，17-24轮次：5张
  let baseLimit: number;
  if (round <= 4) baseLimit = HAND_LIMITS.EARLY_GAME_MAX;
  else if (round <= 8) baseLimit = HAND_LIMITS.MID_GAME_MAX;
  else if (round <= 16) baseLimit = HAND_LIMITS.LATE_GAME_MAX_1;
  else baseLimit = HAND_LIMITS.LATE_GAME_MAX_2;

  // 应用偏移量（永久+临时）
  return Math.max(0, baseLimit + handLimitOffset + handLimitTempOffset);
}

// 保留旧函数名以兼容现有代码，但内部使用轮次
/** @deprecated 请使用 getHandLimitByRound */
export function getHandLimitByTurn(
  turn: number,
  handLimitOffset?: number,
  handLimitTempOffset?: number
): number {
  return getHandLimitByRound(turn, handLimitOffset, handLimitTempOffset);
}

/**
 * 根据轮次数获取抽牌数 - 24轮次制
 * @param round 当前轮次数
 * @param drawCountOffset 摸牌数永久偏移量（特殊效果）
 * @param drawCountTempOffset 摸牌数临时偏移量（当前轮次有效）
 * @returns 抽牌数
 */
export function getDrawCountByRound(
  round: number,
  drawCountOffset: number = 0,
  drawCountTempOffset: number = 0
): number {
  // 1-8轮次：3张，9-16轮次：4张，17-24轮次：5张
  let baseCount: number;
  if (round <= 8) baseCount = HAND_LIMITS.DRAW_PER_ROUND.EARLY;
  else if (round <= 16) baseCount = HAND_LIMITS.DRAW_PER_ROUND.MID;
  else baseCount = HAND_LIMITS.DRAW_PER_ROUND.LATE;

  // 应用偏移量（永久+临时）
  return Math.max(0, baseCount + drawCountOffset + drawCountTempOffset);
}

// 保留旧函数名以兼容现有代码
/** @deprecated 请使用 getDrawCountByRound */
export function getDrawCountByTurn(
  turn: number,
  drawCountOffset?: number,
  drawCountTempOffset?: number
): number {
  return getDrawCountByRound(turn, drawCountOffset, drawCountTempOffset);
}

// ============================================
// 玩家属性常量
// ============================================

/** 玩家属性限制 */
export const PLAYER_LIMITS = {
  /** 渗透/安全等级上限 */
  MAX_LEVEL: 75,
  /** 初始渗透/安全等级 */
  INITIAL_LEVEL: 0,
  /** 科技树等级解锁间隔 */
  TECH_UNLOCK_INTERVAL: 15,
} as const;

/** 行动点配置 (R2.3) - 12轮次制调整（原：24回合制） */
export const ACTION_POINTS = {
  /** 1-4轮次行动点（原：1-8回合） */
  EARLY_GAME: 3,
  /** 5-8轮次行动点（原：9-16回合） */
  MID_GAME: 4,
  /** 9-12轮次行动点（原：17-24回合） */
  LATE_GAME: 5,
} as const;

/**
 * 根据轮次数获取行动点上限 - 12轮次制（原：24回合制）
 * @param round 当前轮次数（原：回合数）
 * @returns 行动点上限
 */
export function getActionPointsByRound(round: number): number {
  // R2.3: 1-4轮次每回合3点，5-8轮次每回合4点，9-12轮次每回合5点（原：1-8/9-16/17-24）
  if (round <= 4) return ACTION_POINTS.EARLY_GAME;
  if (round <= 8) return ACTION_POINTS.MID_GAME;
  return ACTION_POINTS.LATE_GAME;
}

// 保留旧函数名以兼容现有代码
/** @deprecated 请使用 getActionPointsByRound */
export function getActionPointsByTurn(turn: number): number {
  return getActionPointsByRound(turn);
}

// ============================================
// 骰子常量 (R6.0)
// ============================================

/** 骰子配置 */
export const DICE_CONFIG = {
  /** 骰子面数 */
  FACES: 6,
  /** 最小点数 */
  MIN_ROLL: 1,
  /** 最大点数 */
  MAX_ROLL: 6,
  /** 大成功点数 */
  CRITICAL_SUCCESS_ROLL: 6,
  /** 大失败点数 */
  CRITICAL_FAILURE_ROLL: 1,
  /** 大成功最大难度 */
  CRITICAL_SUCCESS_MAX_DIFFICULTY: 3,
  /** 大失败最小难度 */
  CRITICAL_FAILURE_MIN_DIFFICULTY: 4,
} as const;

/** 难度等级配置 (R6.2) */
export const DIFFICULTY_LEVELS = {
  EASY: { value: 1, successRate: 83.3, name: '简单' },
  NORMAL: { value: 2, successRate: 66.7, name: '普通' },
  HARD: { value: 3, successRate: 50.0, name: '困难' },
  VERY_HARD: { value: 4, successRate: 33.3, name: '极难' },
  EXTREME: { value: 5, successRate: 16.7, name: '极限' },
  IMPOSSIBLE: { value: 6, successRate: 0.0, name: '不可能' },
} as const;

// ============================================
// 阶段时间常量 (R4.2) - 24回合制调整
// ============================================

/** 阶段时间配置（秒） */
export const PHASE_TIMES = {
  /** 行动阶段基础时间 */
  ACTION_BASE: 45,
  /** 行动阶段每牌额外时间 */
  ACTION_EXTRA_PER_CARD: 10,
  /** 响应阶段时间 */
  RESPONSE: 10,
  /** 弃牌阶段时间 */
  DISCARD: 15,
  /** 判定阶段时间（用于骰子/RPS判定） */
  JUDGMENT: 5,
  /** 即将超时警告阈值 */
  TIMEOUT_WARNING_THRESHOLD: 10,
} as const;

// ============================================
// 资源常量 - 24回合制调整
// ============================================

/** 资源限制 */
export const RESOURCE_LIMITS = {
  /** 算力上限 */
  COMPUTE_MAX: 15,
  /** 资金上限 */
  FUNDS_MAX: 15,
  /** 信息上限 */
  INFORMATION_MAX: 12,
  /** 权限上限 */
  PERMISSION_MAX: 8,
  /** 初始算力 */
  COMPUTE_INITIAL: 3,
  /** 初始资金 */
  FUNDS_INITIAL: 3,
  /** 初始信息 */
  INFORMATION_INITIAL: 0,
  /** 初始权限 */
  PERMISSION_INITIAL: 0,
} as const;

/** 资源恢复配置 - 24回合制调整 */
export const RESOURCE_RESTORE = {
  /** 基础算力恢复 - 早期 */
  BASE_COMPUTE_EARLY: 1,
  /** 基础算力恢复 - 中期 */
  BASE_COMPUTE_MID: 2,
  /** 基础算力恢复 - 后期 */
  BASE_COMPUTE_LATE: 3,
  /** 基础资金恢复 - 早期 */
  BASE_FUNDS_EARLY: 1,
  /** 基础资金恢复 - 中期 */
  BASE_FUNDS_MID: 2,
  /** 基础资金恢复 - 后期 */
  BASE_FUNDS_LATE: 3,
  /** 攻击方信息加成 */
  ATTACKER_INFORMATION_BONUS: 1,
  /** 防御方算力加成 */
  DEFENDER_COMPUTE_BONUS: 1,
} as const;

/**
 * 根据回合数获取资源恢复量 - 24回合制
 * @param turn 当前回合数
 * @returns 资源恢复配置
 */
export function getResourceRestoreByTurn(turn: number): { compute: number; funds: number } {
  if (turn <= 8) {
    return { compute: RESOURCE_RESTORE.BASE_COMPUTE_EARLY, funds: RESOURCE_RESTORE.BASE_FUNDS_EARLY };
  }
  if (turn <= 16) {
    return { compute: RESOURCE_RESTORE.BASE_COMPUTE_MID, funds: RESOURCE_RESTORE.BASE_FUNDS_MID };
  }
  return { compute: RESOURCE_RESTORE.BASE_COMPUTE_LATE, funds: RESOURCE_RESTORE.BASE_FUNDS_LATE };
}

// ============================================
// 区域控制常量
// ============================================

/** 区域类型 */
export const AREA_TYPES = {
  /** 网络边界 */
  PERIMETER: 'perimeter',
  /** 隔离区 */
  DMZ: 'dmz',
  /** 内网 */
  INTERNAL: 'internal',
  /** 工控系统 */
  ICS: 'ics',
} as const;

/** 区域战略价值 */
export const AREA_STRATEGIC_VALUES: Record<string, number> = {
  [AREA_TYPES.PERIMETER]: 1,
  [AREA_TYPES.DMZ]: 2,
  [AREA_TYPES.INTERNAL]: 3,
  [AREA_TYPES.ICS]: 4,
} as const;

// ============================================
// 科技树常量
// ============================================

/** 科技等级 */
export const TECH_LEVELS = {
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
  T3: 'T3',
  T4: 'T4',
  T5: 'T5',
} as const;

/** 科技等级解锁所需渗透/安全等级 - 更新版 */
export const TECH_UNLOCK_REQUIREMENTS: Record<string, number> = {
  [TECH_LEVELS.T0]: 0,
  [TECH_LEVELS.T1]: 5,   // 从15降低到5
  [TECH_LEVELS.T2]: 15,  // 从30降低到15
  [TECH_LEVELS.T3]: 30,  // 从45降低到30
  [TECH_LEVELS.T4]: 40,  // 从60降低到40
  [TECH_LEVELS.T5]: 50,  // 从75降低到50
} as const;

// ============================================
// AI配置常量
// ============================================

/** AI难度配置 */
export const AI_CONFIG = {
  /** 简单AI延迟(ms) */
  EASY_DELAY: 2000,
  /** 中等AI延迟(ms) */
  MEDIUM_DELAY: 1500,
  /** 困难AI延迟(ms) */
  HARD_DELAY: 1000,
  /** 简单AI随机因子 */
  EASY_RANDOM_FACTOR: 0.3,
  /** 中等AI随机因子 */
  MEDIUM_RANDOM_FACTOR: 0.15,
  /** 困难AI随机因子 */
  HARD_RANDOM_FACTOR: 0.05,
  /** AI超时时间(ms) */
  TIMEOUT_MS: 15000,
  /** AI最大尝试次数 */
  MAX_ATTEMPTS: 10,
} as const;

// ============================================
// 回合阶段常量
// ============================================

/** 回合阶段顺序 */
export const TURN_PHASES = [
  'judgment',   // 1. 判定阶段
  'recovery',   // 2. 恢复阶段
  'draw',       // 3. 摸牌阶段
  'action',     // 4. 行动阶段
  'response',   // 5. 响应阶段
  'discard',    // 6. 弃牌阶段
  'end',        // 7. 结束阶段
] as const;

/** 阶段超时时间(秒) - 24回合制调整 */
export const PHASE_TIMEOUTS: Record<string, number> = {
  judgment: 5,
  recovery: 3,
  draw: 5,
  action: 60,
  response: 10,
  discard: 15,
  end: 3,
} as const;

// ============================================
// 抽卡概率常量
// ============================================

/** 抽卡保底机制 */
export const DRAW_GUARANTEE = {
  /** 连续未出史诗/传说的次数阈值 */
  UNLUCKY_THRESHOLD: 10,
  /** 幸运加成 */
  LUCKY_BONUS: 0.05,
  /** 传说卡概率上限 */
  LEGENDARY_MAX_PROB: 0.5,
} as const;

// ============================================
// 效果计算常量
// ============================================

/** 连击加成 */
export const COMBO_BONUS = {
  /** 基础连击加成 */
  BASE: 0.5,
  /** 连击上限 */
  MAX: 3,
} as const;

/** 科技加成 */
export const TECH_BONUS = {
  /** 判定修正除数 */
  JUDGMENT_DIVISOR: 2,
  /** 等级加成除数 */
  LEVEL_DIVISOR: 2,
} as const;

// ============================================
// 判定机制常量 - 新增
// ============================================

/** RPS（剪刀石头布）判定配置 */
export const RPS_JUDGMENT_CONFIG = {
  /** 选择时间限制（秒） */
  CHOICE_TIME_LIMIT: 5,
  /** 资源投入选项 */
  RESOURCE_COMMIT_OPTIONS: [
    { value: 0, label: '不投入', description: '不投入资源，结果由双方选择决定' },
    { value: 1, label: '投入1点', description: '投入1点资源，获胜方获得优势' },
    { value: 2, label: '投入2点', description: '投入2点资源，获胜方获得更大优势' },
  ],
  /** 选择选项 */
  CHOICE_OPTIONS: [
    { value: 'rock', label: '石头', icon: '✊', beats: 'scissors' },
    { value: 'paper', label: '布', icon: '✋', beats: 'rock' },
    { value: 'scissors', label: '剪刀', icon: '✌️', beats: 'paper' },
  ],
} as const;

/** 骰子判定配置 */
export const DICE_JUDGMENT_CONFIG = {
  /** 骰子投掷动画时间（毫秒） */
  ROLL_ANIMATION_DURATION: 1500,
  /** 结果显示时间（毫秒） */
  RESULT_DISPLAY_DURATION: 2000,
  /** 骰子面数 */
  DICE_FACES: 6,
  /** 最小点数 */
  MIN_ROLL: 1,
  /** 最大点数 */
  MAX_ROLL: 6,
  /** 大成功判定：掷出6且难度≤3 */
  CRITICAL_SUCCESS_CONDITION: (roll: number, difficulty: number) => roll === 6 && difficulty <= 3,
  /** 大失败判定：掷出1且难度≥4 */
  CRITICAL_FAILURE_CONDITION: (roll: number, difficulty: number) => roll === 1 && difficulty >= 4,
} as const;

// ============================================
// 玩家名称验证常量
// ============================================

/** 玩家名称限制 */
export const PLAYER_NAME_RULES = {
  /** 最小长度 */
  MIN_LENGTH: 2,
  /** 最大长度 */
  MAX_LENGTH: 20,
  /** 允许的正则表达式 */
  ALLOWED_PATTERN: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
} as const;

// ============================================
// 日志常量
// ============================================

/** 日志类型 */
export const LOG_TYPES = {
  /** 系统日志 */
  SYSTEM: 'system',
  /** 玩家行动 */
  PLAYER_ACTION: 'player_action',
  /** 卡牌效果 */
  CARD_EFFECT: 'card_effect',
  /** 资源变化 */
  RESOURCE_CHANGE: 'resource_change',
  /** 等级变化 */
  LEVEL_CHANGE: 'level_change',
  /** 判定结果 */
  JUDGMENT: 'judgment',
  /** 游戏结束 */
  GAME_END: 'game_end',
} as const;

export default GAME_CONFIG;
