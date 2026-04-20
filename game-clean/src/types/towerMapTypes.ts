/**
 * 大地图系统（爬塔模式）类型定义
 * 文档版本: v1.0.0
 * 最后更新: 2026-03-14
 *
 * 本文件定义大地图系统的所有类型接口
 * 用于实现类似《杀戮尖塔》的爬塔地图系统
 */

// ============================================
// 节点类型定义
// ============================================

/**
 * 地图节点类型
 * 定义地图上可能出现的各种节点类型
 */
export type NodeType =
  | "combat"   // 普通战斗关 - 标准战斗节点
  | "elite"    // 精英关 - 高难度战斗，奖励更丰厚
  | "boss"     // Boss关 - 每幕最终战斗
  | "reward"   // 奖励关 - 直接获得奖励，无需战斗
  | "shop"     // 商店 - 购买卡牌、道具
  | "event"    // 随机事件 - 触发随机事件
  | "rest";    // 休息点 - 恢复资源或升级卡牌

/**
 * 节点类型显示名称
 */
export const NODE_TYPE_NAMES: Record<NodeType, string> = {
  combat: "战斗",
  elite: "精英",
  boss: "Boss",
  reward: "奖励",
  shop: "商店",
  event: "事件",
  rest: "休息"
};

/**
 * 节点类型图标（用于UI显示）
 */
export const NODE_TYPE_ICONS: Record<NodeType, string> = {
  combat: "⚔️",
  elite: "👹",
  boss: "👑",
  reward: "🎁",
  shop: "🛒",
  event: "❓",
  rest: "🏕️"
};

// ============================================
// 地图节点定义
// ============================================

/**
 * 节点位置坐标
 */
export interface NodePosition {
  /** X坐标（水平位置） */
  x: number;
  /** Y坐标（垂直位置，通常对应层级） */
  y: number;
}

/**
 * 节点奖励
 */
export interface NodeReward {
  /** 奖励类型 */
  type: "card" | "gold" | "relic" | "resource" | "tech";
  /** 奖励ID或数值 */
  value: string | number;
  /** 奖励数量 */
  amount?: number;
  /** 是否已领取 */
  claimed?: boolean;
}

/**
 * 地图节点接口
 * 定义单个节点的完整信息
 */
export interface TowerMapNode {
  /** 节点唯一标识符 */
  id: string;
  /** 节点类型 */
  type: NodeType;
  /** 关联的关卡ID（仅战斗节点有效） */
  levelId?: string;
  /** 节点在地图上的位置坐标 */
  position: NodePosition;
  /** 连接的下一层节点ID数组 */
  connections: string[];
  /** 是否已完成 */
  isCompleted: boolean;
  /** 是否可进入 */
  isAvailable: boolean;
  /** 难度系数（1.0为基准，用于精英关等） */
  difficulty?: number;
  /** 节点奖励列表 */
  rewards?: NodeReward[];
  /** 节点名称（可选，用于特殊节点） */
  name?: string;
  /** 节点描述（可选） */
  description?: string;
  /** 节点图标覆盖（可选） */
  iconOverride?: string;
}

// ============================================
// 地图层级定义
// ============================================

/**
 * 地图层级接口
 * 定义单层的所有节点
 */
export interface TowerMapFloor {
  /** 层数（从1开始） */
  floorNumber: number;
  /** 该层的所有节点 */
  nodes: TowerMapNode[];
  /** 是否是Boss层 */
  isBossFloor: boolean;
  /** 层名称（可选） */
  name?: string;
  /** 层主题描述（可选） */
  theme?: string;
}

// ============================================
// 地图幕定义
// ============================================

/**
 * 幕主题色调
 */
export type ActTheme =
  | "cyber"      // 赛博朋克 - 蓝紫色调
  | "industrial" // 工业风 - 橙黄色调
  | "corporate"  // 企业风 - 青绿色调
  | "military"   // 军事风 - 军绿色调
  | "chaos";     // 混沌 - 红黑色调

/**
 * 地图幕接口
 * 定义单个幕的完整信息
 */
export interface TowerMapAct {
  /** 幕数（1/2/3） */
  actNumber: 1 | 2 | 3;
  /** 幕名称 */
  name: string;
  /** 主题色调 */
  theme: ActTheme;
  /** 该幕的所有层 */
  floors: TowerMapFloor[];
  /** Boss关卡ID */
  bossLevelId: string;
  /** 幕描述 */
  description?: string;
  /** 解锁条件（如需要完成前一幕） */
  unlockCondition?: string;
}

/**
 * 幕信息常量
 */
export const ACT_DEFINITIONS: Record<number, { name: string; theme: ActTheme; description: string }> = {
  1: {
    name: "外围渗透",
    theme: "cyber",
    description: "攻击方开始渗透网络外围，防御方建立初步防线"
  },
  2: {
    name: "内部突破",
    theme: "industrial",
    description: "战斗进入内部网络，双方投入更多资源"
  },
  3: {
    name: "核心决战",
    theme: "military",
    description: "最终决战，决定网络安全的归属"
  }
};

// ============================================
// 完整地图定义
// ============================================

/**
 * 玩家位置
 */
export interface PlayerMapPosition {
  /** 当前幕 */
  act: number;
  /** 当前层 */
  floor: number;
  /** 当前节点ID */
  nodeId: string;
}

/**
 * 完整地图接口
 * 定义整个爬塔地图的完整状态
 */
export interface TowerMap {
  /** 所有幕 */
  acts: TowerMapAct[];
  /** 当前幕 */
  currentAct: number;
  /** 当前层 */
  currentFloor: number;
  /** 当前节点ID */
  currentNodeId: string;
  /** 已完成节点集合（节点ID数组） */
  completedNodes: string[];
  /** 玩家位置 */
  playerPosition: PlayerMapPosition;
  /** 地图生成种子（用于可复现的随机地图） */
  seed?: string;
  /** 地图创建时间 */
  createdAt?: number;
  /** 最后更新时间 */
  updatedAt?: number;
}

// ============================================
// 爬塔进度定义
// ============================================

/**
 * 肉鸽奖励类型
 */
export type RogueRewardType =
  | "card_upgrade"    // 卡牌升级
  | "starting_bonus"  // 开局奖励
  | "shop_discount"   // 商店折扣
  | "extra_reward"    // 额外奖励
  | "special_rule";   // 特殊规则

/**
 * 肉鸽奖励
 */
export interface RogueReward {
  /** 奖励ID */
  id: string;
  /** 奖励类型 */
  type: RogueRewardType;
  /** 奖励名称 */
  name: string;
  /** 奖励描述 */
  description: string;
  /** 奖励效果参数 */
  effect: Record<string, any>;
  /** 获得时间 */
  acquiredAt: number;
}

/**
 * 爬塔统计数据
 */
export interface TowerStats {
  /** 战斗次数 */
  combatCount: number;
  /** 胜利次数 */
  winCount: number;
  /** 失败次数 */
  lossCount: number;
  /** 精英战斗次数 */
  eliteCount: number;
  /** Boss战斗次数 */
  bossCount: number;
  /** 事件触发次数 */
  eventCount: number;
  /** 商店访问次数 */
  shopCount: number;
  /** 休息点使用次数 */
  restCount: number;
  /** 总游戏时长（秒） */
  totalPlayTime: number;
  /** 获得卡牌数量 */
  cardsAcquired: number;
  /** 获得金币数量 */
  goldAcquired: number;
  /** 使用金币数量 */
  goldSpent: number;
}

/**
 * 爬塔进度接口
 * 记录单次爬塔运行的完整进度
 */
export interface TowerProgress {
  /** 本次爬塔唯一ID */
  runId: string;
  /** 开始时间 */
  startTime: number;
  /** 当前幕 */
  currentAct: number;
  /** 已解锁卡牌ID列表 */
  unlockedCards: string[];
  /** 已获得的肉鸽奖励 */
  rogueRewards: RogueReward[];
  /** 当前科技等级 */
  techLevel: number;
  /** 统计数据 */
  stats: TowerStats;
  /** 是否已完成 */
  isCompleted?: boolean;
  /** 完成时间 */
  completedAt?: number;
  /** 胜利阵营（如果有） */
  victoryFaction?: "attacker" | "defender" | null;
  /** 当前金币 */
  gold?: number;
  /** 最大生命值 */
  maxHealth?: number;
  /** 当前生命值 */
  currentHealth?: number;
}

// ============================================
// 地图生成配置
// ============================================

/**
 * 地图生成配置
 */
export interface MapGenerationConfig {
  /** 每幕层数 */
  floorsPerAct: number;
  /** 每层节点数范围 */
  nodesPerFloor: { min: number; max: number };
  /** 精英节点出现概率 */
  eliteChance: number;
  /** 商店节点出现概率 */
  shopChance: number;
  /** 事件节点出现概率 */
  eventChance: number;
  /** 休息节点出现概率 */
  restChance: number;
  /** 奖励节点出现概率 */
  rewardChance: number;
  /** 最大连接数 */
  maxConnections: number;
  /** 最小连接数 */
  minConnections: number;
}

/**
 * 默认地图生成配置
 */
export const DEFAULT_MAP_CONFIG: MapGenerationConfig = {
  floorsPerAct: 15,
  nodesPerFloor: { min: 2, max: 4 },
  eliteChance: 0.15,
  shopChance: 0.15,
  eventChance: 0.2,
  restChance: 0.1,
  rewardChance: 0.1,
  maxConnections: 3,
  minConnections: 1
};

// ============================================
// 导出
// ============================================

export default {
  NODE_TYPE_NAMES,
  NODE_TYPE_ICONS,
  ACT_DEFINITIONS,
  DEFAULT_MAP_CONFIG
};
