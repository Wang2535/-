/**
 * 科技树扩展系统 (T6-T10)
 * 实现高级科技等级解锁、专家级效果加成和传奇卡牌解锁
 * 
 * 文档版本: v17.0.0
 * 最后更新: 2026-03-14
 */

import type { Card, CardRarity, CardType, Faction } from '@/types/legacy/card_v16';

// ============================================
// 扩展科技等级类型定义
// ============================================

/** 扩展科技树等级 (T0-T10) */
export type ExtendedTechLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** 科技等级分类 */
export type TechLevelTier = 'basic' | 'advanced' | 'expert' | 'master' | 'legendary' | 'ultimate';

/** 科技效果类型 */
export type TechEffectType = 
  | 'check_modifier'      // 判定修正
  | 'level_bonus'         // 等级加成
  | 'resource_boost'      // 资源增益
  | 'defense_enhance'     // 防御强化
  | 'attack_enhance'      // 攻击强化
  | 'special_ability'     // 特殊能力
  | 'card_unlock';        // 卡牌解锁

/** 科技阵营类型 */
export type TechFaction = 'defense' | 'attack' | 'neutral';

// ============================================
// T6-T10 科技等级解锁阈值
// ============================================

/** 扩展科技树等级解锁阈值 (T6-T10) */
export const EXTENDED_TECH_UNLOCK_THRESHOLDS = {
  T0: 0,
  T1: 5,
  T2: 15,
  T3: 30,
  T4: 40,
  T5: 50,
  T6: 60,   // 高级防御/渗透
  T7: 75,   // 专家级
  T8: 90,   // 大师级
  T9: 110,  // 传奇级
  T10: 130  // 终极
} as const;

/** 科技等级名称映射 */
export const TECH_LEVEL_NAMES: Record<ExtendedTechLevel, { name: string; title: string; tier: TechLevelTier }> = {
  0: { name: 'T0 - 初始', title: '入门者', tier: 'basic' },
  1: { name: 'T1 - 初级', title: '学徒', tier: 'basic' },
  2: { name: 'T2 - 中级', title: '从业者', tier: 'basic' },
  3: { name: 'T3 - 高级', title: '专家', tier: 'advanced' },
  4: { name: 'T4 - 专家', title: '资深专家', tier: 'advanced' },
  5: { name: 'T5 - 大师', title: '大师', tier: 'expert' },
  6: { name: 'T6 - 高级防御/渗透', title: '高级大师', tier: 'expert' },
  7: { name: 'T7 - 专家级', title: '宗师', tier: 'master' },
  8: { name: 'T8 - 大师级', title: '大宗师', tier: 'master' },
  9: { name: 'T9 - 传奇级', title: '传奇', tier: 'legendary' },
  10: { name: 'T10 - 终极', title: '神话', tier: 'ultimate' }
};

// ============================================
// 科技等级配置接口
// ============================================

/** 科技效果定义 */
export interface TechEffect {
  /** 效果类型 */
  type: TechEffectType;
  /** 效果值 */
  value: number;
  /** 效果描述 */
  description: string;
  /** 适用阵营 */
  faction: TechFaction;
  /** 是否被动 */
  isPassive: boolean;
  /** 持续时间 (-1表示永久) */
  duration: number;
}

/** 扩展科技等级配置 */
export interface ExtendedTechLevelConfig {
  /** 等级 */
  level: ExtendedTechLevel;
  /** 解锁所需渗透/安全等级 */
  requiredLevel: number;
  /** 判定修正 */
  checkModifier: number;
  /** 等级加成 */
  levelBonus: number;
  /** 描述 */
  description: string;
  /** 科技效果列表 */
  effects: TechEffect[];
  /** 解锁的卡牌代码列表 */
  unlockedCards: string[];
  /** 特殊能力 */
  specialAbility?: {
    name: string;
    description: string;
    cooldown: number;
  };
}

// ============================================
// T6-T10 科技效果定义
// ============================================

/** T6 科技效果 - 高级防御/渗透 */
export const T6_TECH_EFFECTS: TechEffect[] = [
  {
    type: 'check_modifier',
    value: 3,
    description: '判定修正 +3',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'level_bonus',
    value: 3,
    description: '等级加成 +3',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'defense_enhance',
    value: 2,
    description: '防御方：高级入侵检测系统 - 所有防御判定难度-1',
    faction: 'defense',
    isPassive: true,
    duration: -1
  },
  {
    type: 'attack_enhance',
    value: 2,
    description: '进攻方：高级权限提升 - 渗透获取效率+20%',
    faction: 'attack',
    isPassive: true,
    duration: -1
  }
];

/** T7 科技效果 - 专家级 */
export const T7_TECH_EFFECTS: TechEffect[] = [
  {
    type: 'check_modifier',
    value: 4,
    description: '判定修正 +4',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'level_bonus',
    value: 4,
    description: '等级加成 +4',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'defense_enhance',
    value: 3,
    description: '防御方：主动威胁狩猎 - 每回合可扫描1个区域，发现威胁时获得2点信息',
    faction: 'defense',
    isPassive: true,
    duration: -1
  },
  {
    type: 'attack_enhance',
    value: 3,
    description: '进攻方：零日漏洞利用 - 首次使用漏洞类卡牌时判定自动成功',
    faction: 'attack',
    isPassive: false,
    duration: -1
  }
];

/** T8 科技效果 - 大师级 */
export const T8_TECH_EFFECTS: TechEffect[] = [
  {
    type: 'check_modifier',
    value: 5,
    description: '判定修正 +5',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'level_bonus',
    value: 5,
    description: '等级加成 +5',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'resource_boost',
    value: 2,
    description: '每回合额外获得2点资源（可任意分配）',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'defense_enhance',
    value: 4,
    description: '防御方：自适应安全架构 - 受到攻击时自动获得1层防护',
    faction: 'defense',
    isPassive: true,
    duration: -1
  },
  {
    type: 'attack_enhance',
    value: 4,
    description: '进攻方：供应链渗透 - 可无视区域限制直接攻击Internal区域',
    faction: 'attack',
    isPassive: true,
    duration: -1
  }
];

/** T9 科技效果 - 传奇级 */
export const T9_TECH_EFFECTS: TechEffect[] = [
  {
    type: 'check_modifier',
    value: 6,
    description: '判定修正 +6',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'level_bonus',
    value: 6,
    description: '等级加成 +6',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'resource_boost',
    value: 3,
    description: '每回合额外获得3点资源（可任意分配）',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'defense_enhance',
    value: 5,
    description: '防御方：AI驱动防御 - 预测下回合攻击类型，对应防御+50%',
    faction: 'defense',
    isPassive: true,
    duration: -1
  },
  {
    type: 'attack_enhance',
    value: 5,
    description: '进攻方：AI对抗攻击 - 可修改1张手牌的效果类型',
    faction: 'attack',
    isPassive: false,
    duration: -1
  },
  {
    type: 'special_ability',
    value: 1,
    description: '传奇光环 - 同阵营队友获得50%科技加成',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  }
];

/** T10 科技效果 - 终极 */
export const T10_TECH_EFFECTS: TechEffect[] = [
  {
    type: 'check_modifier',
    value: 8,
    description: '判定修正 +8',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'level_bonus',
    value: 8,
    description: '等级加成 +8',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'resource_boost',
    value: 5,
    description: '每回合额外获得5点资源（可任意分配）',
    faction: 'neutral',
    isPassive: true,
    duration: -1
  },
  {
    type: 'defense_enhance',
    value: 8,
    description: '防御方：量子安全防御 - 免疫所有T8以下攻击效果',
    faction: 'defense',
    isPassive: true,
    duration: -1
  },
  {
    type: 'attack_enhance',
    value: 8,
    description: '进攻方：量子计算破解 - 无视所有防御效果，直接进行判定',
    faction: 'attack',
    isPassive: true,
    duration: -1
  },
  {
    type: 'special_ability',
    value: 1,
    description: '终极协议 - 每3回合可发动一次终极技能，直接获得5点渗透/安全',
    faction: 'neutral',
    isPassive: false,
    duration: -1
  }
];

// ============================================
// T6-T10 科技等级完整配置
// ============================================

/** T6-T10 科技等级配置表 */
export const EXTENDED_TECH_LEVEL_CONFIGS: Record<ExtendedTechLevel, ExtendedTechLevelConfig> = {
  0: {
    level: 0,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T0,
    checkModifier: 0,
    levelBonus: 0,
    description: 'T0: 初始等级',
    effects: [],
    unlockedCards: []
  },
  1: {
    level: 1,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T1,
    checkModifier: 1,
    levelBonus: 0,
    description: `T1: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T1}，判定修正+1`,
    effects: [],
    unlockedCards: []
  },
  2: {
    level: 2,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T2,
    checkModifier: 1,
    levelBonus: 1,
    description: `T2: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T2}，判定修正+1，等级加成+1`,
    effects: [],
    unlockedCards: []
  },
  3: {
    level: 3,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T3,
    checkModifier: 2,
    levelBonus: 1,
    description: `T3: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T3}，判定修正+2，等级加成+1`,
    effects: [],
    unlockedCards: []
  },
  4: {
    level: 4,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T4,
    checkModifier: 2,
    levelBonus: 2,
    description: `T4: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T4}，判定修正+2，等级加成+2`,
    effects: [],
    unlockedCards: []
  },
  5: {
    level: 5,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T5,
    checkModifier: 3,
    levelBonus: 2,
    description: `T5: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T5}，判定修正+3，等级加成+2`,
    effects: [],
    unlockedCards: []
  },
  6: {
    level: 6,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T6,
    checkModifier: 3,
    levelBonus: 3,
    description: `T6: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T6}，判定修正+3，等级加成+3，解锁高级防御/渗透科技`,
    effects: T6_TECH_EFFECTS,
    unlockedCards: ['T6_DEF_001', 'T6_DEF_002', 'T6_ATK_001', 'T6_ATK_002', 'T6_NEU_001'],
    specialAbility: {
      name: '高级强化',
      description: '每2回合可发动一次，本回合判定修正额外+2',
      cooldown: 2
    }
  },
  7: {
    level: 7,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T7,
    checkModifier: 4,
    levelBonus: 4,
    description: `T7: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T7}，判定修正+4，等级加成+4，解锁专家级科技`,
    effects: T7_TECH_EFFECTS,
    unlockedCards: ['T7_DEF_001', 'T7_DEF_002', 'T7_DEF_003', 'T7_ATK_001', 'T7_ATK_002', 'T7_ATK_003'],
    specialAbility: {
      name: '专家洞察',
      description: '每3回合可查看对方1张手牌，并预测其下回合行动',
      cooldown: 3
    }
  },
  8: {
    level: 8,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T8,
    checkModifier: 5,
    levelBonus: 5,
    description: `T8: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T8}，判定修正+5，等级加成+5，解锁大师级科技`,
    effects: T8_TECH_EFFECTS,
    unlockedCards: ['T8_DEF_001', 'T8_DEF_002', 'T8_DEF_003', 'T8_ATK_001', 'T8_ATK_002', 'T8_ATK_003', 'T8_NEU_001'],
    specialAbility: {
      name: '大师掌控',
      description: '每4回合可重置1张已使用卡牌的冷却时间',
      cooldown: 4
    }
  },
  9: {
    level: 9,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T9,
    checkModifier: 6,
    levelBonus: 6,
    description: `T9: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T9}，判定修正+6，等级加成+6，解锁传奇级科技`,
    effects: T9_TECH_EFFECTS,
    unlockedCards: ['T9_DEF_001', 'T9_DEF_002', 'T9_ATK_001', 'T9_ATK_002', 'T9_NEU_001', 'T9_NEU_002'],
    specialAbility: {
      name: '传奇光环',
      description: '每5回合可为同阵营队友提供2回合的50%科技加成',
      cooldown: 5
    }
  },
  10: {
    level: 10,
    requiredLevel: EXTENDED_TECH_UNLOCK_THRESHOLDS.T10,
    checkModifier: 8,
    levelBonus: 8,
    description: `T10: 渗透/安全=${EXTENDED_TECH_UNLOCK_THRESHOLDS.T10}，判定修正+8，等级加成+8，解锁终极科技`,
    effects: T10_TECH_EFFECTS,
    unlockedCards: ['T10_DEF_001', 'T10_ATK_001', 'T10_NEU_001'],
    specialAbility: {
      name: '终极协议',
      description: '每3回合可发动一次，直接获得5点渗透/安全，并清除所有负面效果',
      cooldown: 3
    }
  }
};

// ============================================
// T6-T10 解锁卡牌定义
// ============================================

/** T6 防御方卡牌 */
export const T6_DEFENSE_CARDS: Card[] = [
  {
    card_code: 'T6_DEF_001',
    name: { chinese: '高级入侵检测系统', english: 'Advanced IDS' },
    description: { 
      chinese: '消耗：算力3，信息2；效果：判定难度4，成功则安全+4，且本回合所有攻击判定难度+1；触发：出牌时', 
      english: 'Cost: 3 Compute, 2 Information; Effect: Difficulty 4 check, on success Security +4, all attack difficulty +1 this turn; Trigger: On Play' 
    },
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 6 as any,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 4, description: { chinese: '安全+4', english: 'Security +4' } }],
    unlockCondition: { requiredLevel: 60, requiredFaction: 'defense', requiredPermission: 'security' }
  },
  {
    card_code: 'T6_DEF_002',
    name: { chinese: '智能流量分析', english: 'Smart Traffic Analysis' },
    description: { 
      chinese: '消耗：算力2，信息3；效果：判定难度3，成功则信息+4，并发现对方下1张攻击牌类型；触发：出牌时', 
      english: 'Cost: 2 Compute, 3 Information; Effect: Difficulty 3 check, on success Information +4, reveal next attack card type; Trigger: On Play' 
    },
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 6 as any,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: { chinese: '安全+2', english: 'Security +2' } }],
    unlockCondition: { requiredLevel: 60, requiredFaction: 'defense', requiredPermission: 'security' }
  }
];

/** T6 进攻方卡牌 */
export const T6_ATTACK_CARDS: Card[] = [
  {
    card_code: 'T6_ATK_001',
    name: { chinese: '高级权限提升', english: 'Advanced Privilege Escalation' },
    description: { 
      chinese: '消耗：算力3，信息2；效果：判定难度4，成功则渗透+5，且获得1个高级权限标记；触发：出牌时', 
      english: 'Cost: 3 Compute, 2 Information; Effect: Difficulty 4 check, on success Infiltration +5, gain 1 advanced access token; Trigger: On Play' 
    },
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 6 as any,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: { chinese: '渗透+5', english: 'Infiltration +5' } }],
    unlockCondition: { requiredLevel: 60, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  },
  {
    card_code: 'T6_ATK_002',
    name: { chinese: '深度渗透', english: 'Deep Infiltration' },
    description: { 
      chinese: '消耗：算力2，信息2，资金1；效果：判定难度4，成功则渗透+4，且可查看对方2张手牌；触发：出牌时', 
      english: 'Cost: 2 Compute, 2 Information, 1 Fund; Effect: Difficulty 4 check, on success Infiltration +4, view 2 opponent hand cards; Trigger: On Play' 
    },
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 6 as any,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: { chinese: '渗透+4', english: 'Infiltration +4' } }],
    unlockCondition: { requiredLevel: 60, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  }
];

/** T6 通用卡牌 */
export const T6_NEUTRAL_CARDS: Card[] = [
  {
    card_code: 'T6_NEU_001',
    name: { chinese: '科技共振', english: 'Tech Resonance' },
    description: { 
      chinese: '消耗：算力2，信息2；效果：根据当前科技等级获得额外收益（T6+2资源，T7+3，T8+4）；触发：出牌时', 
      english: 'Cost: 2 Compute, 2 Information; Effect: Gain bonus based on tech level (T6+2, T7+3, T8+4 resources); Trigger: On Play' 
    },
    type: 'basic_defense' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 6 as any,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 3, description: { chinese: '获得3点资源', english: 'Gain 3 Resources' } }],
    unlockCondition: { requiredLevel: 60, requiredFaction: 'neutral', requiredPermission: 'security' }
  }
];

/** T7 防御方卡牌 */
export const T7_DEFENSE_CARDS: Card[] = [
  {
    card_code: 'T7_DEF_001',
    name: { chinese: '主动威胁狩猎', english: 'Active Threat Hunting' },
    description: { 
      chinese: '消耗：算力3，信息3；效果：判定难度5，成功则安全+5，并清除所有威胁标记；触发：出牌时', 
      english: 'Cost: 3 Compute, 3 Information; Effect: Difficulty 5 check, on success Security +5, clear all threat tokens; Trigger: On Play' 
    },
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 7 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'security_gain', baseValue: 5, description: { chinese: '安全+5', english: 'Security +5' } }],
    unlockCondition: { requiredLevel: 75, requiredFaction: 'defense', requiredPermission: 'security' }
  },
  {
    card_code: 'T7_DEF_002',
    name: { chinese: '预测性防御', english: 'Predictive Defense' },
    description: { 
      chinese: '消耗：算力4，信息2；效果：判定难度4，成功则安全+4，下回合免疫首次攻击；触发：出牌时', 
      english: 'Cost: 4 Compute, 2 Information; Effect: Difficulty 4 check, on success Security +4, immune to first attack next turn; Trigger: On Play' 
    },
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 7 as any,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 4, description: { chinese: '安全+4', english: 'Security +4' } }],
    unlockCondition: { requiredLevel: 75, requiredFaction: 'defense', requiredPermission: 'security' }
  },
  {
    card_code: 'T7_DEF_003',
    name: { chinese: '威胁情报网络', english: 'Threat Intelligence Network' },
    description: { 
      chinese: '消耗：信息4；效果：判定难度4，成功则所有队友安全+2，信息+2；触发：出牌时', 
      english: 'Cost: 4 Information; Effect: Difficulty 4 check, on success all teammates Security +2, Information +2; Trigger: On Play' 
    },
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 7 as any,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 2, description: { chinese: '安全+2', english: 'Security +2' } }],
    unlockCondition: { requiredLevel: 75, requiredFaction: 'defense', requiredPermission: 'security' }
  }
];

/** T7 进攻方卡牌 */
export const T7_ATTACK_CARDS: Card[] = [
  {
    card_code: 'T7_ATK_001',
    name: { chinese: '零日漏洞利用', english: 'Zero-Day Exploitation' },
    description: { 
      chinese: '消耗：算力4，信息3；效果：无需判定，直接渗透+4，安全-2；触发：出牌时', 
      english: 'Cost: 4 Compute, 3 Information; Effect: No check required, Infiltration +4, Security -2; Trigger: On Play' 
    },
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 7 as any,
    cost: {},
    difficulty: 0,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: { chinese: '渗透+4', english: 'Infiltration +4' } }],
    unlockCondition: { requiredLevel: 75, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  },
  {
    card_code: 'T7_ATK_002',
    name: { chinese: '未知漏洞探测', english: 'Unknown Vulnerability Scan' },
    description: { 
      chinese: '消耗：算力3，信息3；效果：判定难度5，成功则渗透+5，且发现对方1个弱点；触发：出牌时', 
      english: 'Cost: 3 Compute, 3 Information; Effect: Difficulty 5 check, on success Infiltration +5, discover 1 weakness; Trigger: On Play' 
    },
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 7 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: { chinese: '渗透+5', english: 'Infiltration +5' } }],
    unlockCondition: { requiredLevel: 75, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  },
  {
    card_code: 'T7_ATK_003',
    name: { chinese: '漏洞武器库', english: 'Exploit Arsenal' },
    description: { 
      chinese: '消耗：信息4，资金2；效果：判定难度4，成功则获得2张随机漏洞类卡牌；触发：出牌时', 
      english: 'Cost: 4 Information, 2 Funds; Effect: Difficulty 4 check, on success gain 2 random exploit cards; Trigger: On Play' 
    },
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 7 as any,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: { chinese: '渗透+2', english: 'Infiltration +2' } }],
    unlockCondition: { requiredLevel: 75, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  }
];

/** T8 防御方卡牌 */
export const T8_DEFENSE_CARDS: Card[] = [
  {
    card_code: 'T8_DEF_001',
    name: { chinese: '自适应安全架构', english: 'Adaptive Security Architecture' },
    description: { 
      chinese: '消耗：算力4，资金3，信息2；效果：判定难度5，成功则安全+6，且根据上回合受攻击类型获得对应免疫；触发：出牌时', 
      english: 'Cost: 4 Compute, 3 Funds, 2 Information; Effect: Difficulty 5 check, on success Security +6, gain immunity based on last attack type; Trigger: On Play' 
    },
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'security_gain', baseValue: 6, description: { chinese: '安全+6', english: 'Security +6' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'defense', requiredPermission: 'security' }
  },
  {
    card_code: 'T8_DEF_002',
    name: { chinese: '动态防御重构', english: 'Dynamic Defense Reconstruction' },
    description: { 
      chinese: '消耗：算力5，信息3；效果：判定难度5，成功则安全+5，并重置所有防御卡牌冷却；触发：出牌时', 
      english: 'Cost: 5 Compute, 3 Information; Effect: Difficulty 5 check, on success Security +5, reset all defense card cooldowns; Trigger: On Play' 
    },
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'security_gain', baseValue: 5, description: { chinese: '安全+5', english: 'Security +5' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'defense', requiredPermission: 'security' }
  },
  {
    card_code: 'T8_DEF_003',
    name: { chinese: '安全生态闭环', english: 'Security Ecosystem Loop' },
    description: { 
      chinese: '消耗：算力3，资金4，信息3；效果：判定难度6，成功则安全+7，每回合自动恢复1点安全；触发：出牌时', 
      english: 'Cost: 3 Compute, 4 Funds, 3 Information; Effect: Difficulty 6 check, on success Security +7, auto recover 1 Security per turn; Trigger: On Play' 
    },
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 6,
    effects: [{ type: 'security_gain', baseValue: 7, description: { chinese: '安全+7', english: 'Security +7' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'defense', requiredPermission: 'security' }
  }
];

/** T8 进攻方卡牌 */
export const T8_ATTACK_CARDS: Card[] = [
  {
    card_code: 'T8_ATK_001',
    name: { chinese: '供应链渗透', english: 'Supply Chain Infiltration' },
    description: { 
      chinese: '消耗：算力3，信息4，资金2；效果：判定难度6，成功则渗透+6，且可攻击任意区域；触发：出牌时', 
      english: 'Cost: 3 Compute, 4 Information, 2 Funds; Effect: Difficulty 6 check, on success Infiltration +6, can attack any zone; Trigger: On Play' 
    },
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 6,
    effects: [{ type: 'infiltration_gain', baseValue: 6, description: { chinese: '渗透+6', english: 'Infiltration +6' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  },
  {
    card_code: 'T8_ATK_002',
    name: { chinese: '第三方入侵', english: 'Third-Party Compromise' },
    description: { 
      chinese: '消耗：信息5，资金3；效果：判定难度5，成功则渗透+5，且绕过所有边界防御；触发：出牌时', 
      english: 'Cost: 5 Information, 3 Funds; Effect: Difficulty 5 check, on success Infiltration +5, bypass all perimeter defense; Trigger: On Play' 
    },
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: { chinese: '渗透+5', english: 'Infiltration +5' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  },
  {
    card_code: 'T8_ATK_003',
    name: { chinese: '信任链攻击', english: 'Trust Chain Attack' },
    description: { 
      chinese: '消耗：算力4，信息4；效果：判定难度5，成功则渗透+5，且对方下回合无法使用防御卡牌；触发：出牌时', 
      english: 'Cost: 4 Compute, 4 Information; Effect: Difficulty 5 check, on success Infiltration +5, opponent cannot use defense cards next turn; Trigger: On Play' 
    },
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: { chinese: '渗透+5', english: 'Infiltration +5' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  }
];

/** T8 通用卡牌 */
export const T8_NEUTRAL_CARDS: Card[] = [
  {
    card_code: 'T8_NEU_001',
    name: { chinese: '大师级策略', english: 'Master Strategy' },
    description: { 
      chinese: '消耗：算力3，信息3，资金2；效果：判定难度5，成功则根据阵营获得安全/渗透+5，并抽2张牌；触发：出牌时', 
      english: 'Cost: 3 Compute, 3 Information, 2 Funds; Effect: Difficulty 5 check, on success Security/Infiltration +5 based on faction, draw 2 cards; Trigger: On Play' 
    },
    type: 'basic_defense' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 8 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 5, description: { chinese: '获得5点资源', english: 'Gain 5 Resources' } }],
    unlockCondition: { requiredLevel: 90, requiredFaction: 'neutral', requiredPermission: 'security' }
  }
];

/** T9 防御方卡牌 */
export const T9_DEFENSE_CARDS: Card[] = [
  {
    card_code: 'T9_DEF_001',
    name: { chinese: 'AI驱动防御', english: 'AI-Driven Defense' },
    description: { 
      chinese: '消耗：算力5，信息4；效果：判定难度6，成功则安全+7，AI预测下回合攻击类型，对应防御+100%；触发：出牌时', 
      english: 'Cost: 5 Compute, 4 Information; Effect: Difficulty 6 check, on success Security +7, AI predicts next attack type, corresponding defense +100%; Trigger: On Play' 
    },
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 9 as any,
    cost: {},
    difficulty: 6,
    effects: [{ type: 'security_gain', baseValue: 7, description: { chinese: '安全+7', english: 'Security +7' } }],
    unlockCondition: { requiredLevel: 110, requiredFaction: 'defense', requiredPermission: 'security' }
  },
  {
    card_code: 'T9_DEF_002',
    name: { chinese: '神经网络防护', english: 'Neural Network Protection' },
    description: { 
      chinese: '消耗：算力6，信息3，资金3；效果：判定难度6，成功则安全+8，自动识别并清除所有AI类攻击；触发：出牌时', 
      english: 'Cost: 6 Compute, 3 Information, 3 Funds; Effect: Difficulty 6 check, on success Security +8, auto detect and clear all AI attacks; Trigger: On Play' 
    },
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 9 as any,
    cost: {},
    difficulty: 6,
    effects: [{ type: 'security_gain', baseValue: 8, description: { chinese: '安全+8', english: 'Security +8' } }],
    unlockCondition: { requiredLevel: 110, requiredFaction: 'defense', requiredPermission: 'security' }
  }
];

/** T9 进攻方卡牌 */
export const T9_ATTACK_CARDS: Card[] = [
  {
    card_code: 'T9_ATK_001',
    name: { chinese: 'AI对抗攻击', english: 'AI Adversarial Attack' },
    description: { 
      chinese: '消耗：算力5，信息5；效果：判定难度6，成功则渗透+7，可修改1张手牌效果类型；触发：出牌时', 
      english: 'Cost: 5 Compute, 5 Information; Effect: Difficulty 6 check, on success Infiltration +7, can modify 1 hand card effect type; Trigger: On Play' 
    },
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 9 as any,
    cost: {},
    difficulty: 6,
    effects: [{ type: 'infiltration_gain', baseValue: 7, description: { chinese: '渗透+7', english: 'Infiltration +7' } }],
    unlockCondition: { requiredLevel: 110, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  },
  {
    card_code: 'T9_ATK_002',
    name: { chinese: '机器学习欺骗', english: 'ML Deception' },
    description: { 
      chinese: '消耗：算力6，信息4；效果：判定难度6，成功则渗透+6，对方AI防御系统失效2回合；触发：出牌时', 
      english: 'Cost: 6 Compute, 4 Information; Effect: Difficulty 6 check, on success Infiltration +6, opponent AI defense disabled for 2 turns; Trigger: On Play' 
    },
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 9 as any,
    cost: {},
    difficulty: 6,
    effects: [{ type: 'infiltration_gain', baseValue: 6, description: { chinese: '渗透+6', english: 'Infiltration +6' } }],
    unlockCondition: { requiredLevel: 110, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  }
];

/** T9 通用卡牌 */
export const T9_NEUTRAL_CARDS: Card[] = [
  {
    card_code: 'T9_NEU_001',
    name: { chinese: 'AI协同', english: 'AI Synergy' },
    description: { 
      chinese: '消耗：算力4，信息4；效果：判定难度5，成功则获得AI助手，持续3回合，每回合+2资源；触发：出牌时', 
      english: 'Cost: 4 Compute, 4 Information; Effect: Difficulty 5 check, on success gain AI assistant for 3 turns, +2 resources per turn; Trigger: On Play' 
    },
    type: 'basic_defense' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 9 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 6, description: { chinese: '获得6点资源', english: 'Gain 6 Resources' } }],
    unlockCondition: { requiredLevel: 110, requiredFaction: 'neutral', requiredPermission: 'security' }
  },
  {
    card_code: 'T9_NEU_002',
    name: { chinese: '智能进化', english: 'Intelligent Evolution' },
    description: { 
      chinese: '消耗：算力5，信息3；效果：判定难度5，成功则科技等级临时+1，持续2回合；触发：出牌时', 
      english: 'Cost: 5 Compute, 3 Information; Effect: Difficulty 5 check, on success Tech Level +1 for 2 turns; Trigger: On Play' 
    },
    type: 'basic_defense' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 9 as any,
    cost: {},
    difficulty: 5,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 4, description: { chinese: '获得4点资源', english: 'Gain 4 Resources' } }],
    unlockCondition: { requiredLevel: 110, requiredFaction: 'neutral', requiredPermission: 'security' }
  }
];

/** T10 防御方卡牌 */
export const T10_DEFENSE_CARDS: Card[] = [
  {
    card_code: 'T10_DEF_001',
    name: { chinese: '量子安全防御', english: 'Quantum Security Defense' },
    description: { 
      chinese: '消耗：算力6，信息5，资金4；效果：判定难度7，成功则安全+10，免疫所有T8以下攻击，持续3回合；触发：出牌时', 
      english: 'Cost: 6 Compute, 5 Information, 4 Funds; Effect: Difficulty 7 check, on success Security +10, immune to all T8- attacks for 3 turns; Trigger: On Play' 
    },
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 10 as any,
    cost: {},
    difficulty: 7,
    effects: [{ type: 'security_gain', baseValue: 10, description: { chinese: '安全+10', english: 'Security +10' } }],
    unlockCondition: { requiredLevel: 130, requiredFaction: 'defense', requiredPermission: 'security' }
  }
];

/** T10 进攻方卡牌 */
export const T10_ATTACK_CARDS: Card[] = [
  {
    card_code: 'T10_ATK_001',
    name: { chinese: '量子计算破解', english: 'Quantum Computing Crack' },
    description: { 
      chinese: '消耗：算力7，信息5，资金3；效果：判定难度7，成功则渗透+10，无视所有防御效果；触发：出牌时', 
      english: 'Cost: 7 Compute, 5 Information, 3 Funds; Effect: Difficulty 7 check, on success Infiltration +10, ignore all defense effects; Trigger: On Play' 
    },
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 10 as any,
    cost: {},
    difficulty: 7,
    effects: [{ type: 'infiltration_gain', baseValue: 10, description: { chinese: '渗透+10', english: 'Infiltration +10' } }],
    unlockCondition: { requiredLevel: 130, requiredFaction: 'attack', requiredPermission: 'infiltration' }
  }
];

/** T10 通用卡牌 */
export const T10_NEUTRAL_CARDS: Card[] = [
  {
    card_code: 'T10_NEU_001',
    name: { chinese: '终极协议', english: 'Ultimate Protocol' },
    description: { 
      chinese: '消耗：所有资源；效果：判定难度8，成功则根据阵营安全/渗透+15，清除所有负面效果，获得2回合无敌；触发：出牌时', 
      english: 'Cost: All Resources; Effect: Difficulty 8 check, on success Security/Infiltration +15 based on faction, clear all negative effects, invincible for 2 turns; Trigger: On Play' 
    },
    type: 'absolute_security' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 10 as any,
    cost: {},
    difficulty: 8,
    effects: [{ 
      type: 'ultimate_protocol', 
      baseValue: 15, 
      description: { 
        chinese: '消耗所有资源，安全/渗透+15，清除负面效果，2回合无敌', 
        english: 'Consume all resources, Security/Infiltration +15, clear negative effects, invincible for 2 turns' 
      },
      costAllResources: true,
      opponentDifficultyIncrease: 0,
      duration: 2
    }],
    unlockCondition: { requiredLevel: 130, requiredFaction: 'neutral', requiredPermission: 'security' }
  }
];

// ============================================
// 所有T6-T10卡牌汇总
// ============================================

/** T6-T10 所有解锁卡牌 */
export const EXTENDED_TECH_CARDS: Card[] = [
  ...T6_DEFENSE_CARDS,
  ...T6_ATTACK_CARDS,
  ...T6_NEUTRAL_CARDS,
  ...T7_DEFENSE_CARDS,
  ...T7_ATTACK_CARDS,
  ...T8_DEFENSE_CARDS,
  ...T8_ATTACK_CARDS,
  ...T8_NEUTRAL_CARDS,
  ...T9_DEFENSE_CARDS,
  ...T9_ATTACK_CARDS,
  ...T9_NEUTRAL_CARDS,
  ...T10_DEFENSE_CARDS,
  ...T10_ATTACK_CARDS,
  ...T10_NEUTRAL_CARDS
];

/** T6-T10 卡牌数据库 */
export const EXTENDED_CARD_DATABASE: Record<string, Card> = {};

// 注册所有扩展卡牌
EXTENDED_TECH_CARDS.forEach(card => {
  EXTENDED_CARD_DATABASE[card.card_code] = card;
});

// ============================================
// 辅助函数
// ============================================

/**
 * 根据渗透/安全等级计算扩展科技树等级 (T0-T10)
 * @param level 当前渗透或安全等级
 * @returns 科技树等级 (0-10)
 */
export function calculateExtendedTechLevel(level: number): ExtendedTechLevel {
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T10) return 10;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T9) return 9;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T8) return 8;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T7) return 7;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T6) return 6;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T5) return 5;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T4) return 4;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T3) return 3;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T2) return 2;
  if (level >= EXTENDED_TECH_UNLOCK_THRESHOLDS.T1) return 1;
  return 0;
}

/**
 * 获取扩展科技树等级配置
 * @param level 科技树等级
 * @returns 等级配置
 */
export function getExtendedTechLevelConfig(level: ExtendedTechLevel): ExtendedTechLevelConfig {
  return EXTENDED_TECH_LEVEL_CONFIGS[level];
}

/**
 * 检查是否解锁扩展科技等级
 * @param currentLevel 当前渗透或安全等级
 * @param targetTechLevel 目标科技等级
 * @returns 是否已解锁
 */
export function isExtendedTechLevelUnlocked(currentLevel: number, targetTechLevel: ExtendedTechLevel): boolean {
  const config = EXTENDED_TECH_LEVEL_CONFIGS[targetTechLevel];
  return currentLevel >= config.requiredLevel;
}

/**
 * 获取下一级扩展科技信息
 * @param currentLevel 当前渗透或安全等级
 * @returns 下一级信息，如果已满级返回null
 */
export function getNextExtendedTechLevelInfo(currentLevel: number): {
  nextLevel: ExtendedTechLevel;
  requiredLevel: number;
  progress: number;
} | null {
  const currentTechLevel = calculateExtendedTechLevel(currentLevel);
  
  if (currentTechLevel >= 10) {
    return null; // 已满级
  }
  
  const nextLevel = (currentTechLevel + 1) as ExtendedTechLevel;
  const config = EXTENDED_TECH_LEVEL_CONFIGS[nextLevel];
  const prevRequiredLevel = EXTENDED_TECH_LEVEL_CONFIGS[currentTechLevel].requiredLevel;
  const progress = ((currentLevel - prevRequiredLevel) / (config.requiredLevel - prevRequiredLevel)) * 100;
  
  return {
    nextLevel,
    requiredLevel: config.requiredLevel,
    progress: Math.min(100, Math.max(0, progress))
  };
}

/**
 * 获取指定科技等级解锁的卡牌
 * @param techLevel 科技等级
 * @returns 解锁的卡牌列表
 */
export function getUnlockedCardsByTechLevel(techLevel: ExtendedTechLevel): Card[] {
  const config = EXTENDED_TECH_LEVEL_CONFIGS[techLevel];
  return config.unlockedCards.map(cardCode => EXTENDED_CARD_DATABASE[cardCode]).filter(Boolean);
}

/**
 * 获取指定阵营在指定科技等级解锁的卡牌
 * @param techLevel 科技等级
 * @param faction 阵营
 * @returns 解锁的卡牌列表
 */
export function getUnlockedCardsByFaction(techLevel: ExtendedTechLevel, faction: Faction): Card[] {
  const allUnlocked = getUnlockedCardsByTechLevel(techLevel);
  return allUnlocked.filter(card => card.faction === faction || card.faction === 'neutral');
}

/**
 * 获取科技效果
 * @param techLevel 科技等级
 * @param faction 阵营 (可选，用于筛选特定阵营效果)
 * @returns 科技效果列表
 */
export function getTechEffects(techLevel: ExtendedTechLevel, faction?: TechFaction): TechEffect[] {
  const config = EXTENDED_TECH_LEVEL_CONFIGS[techLevel];
  if (!faction) return config.effects;
  return config.effects.filter(effect => effect.faction === faction || effect.faction === 'neutral');
}

/**
 * 计算扩展判定修正
 * @param techLevel 科技等级
 * @returns 判定修正值
 */
export function calculateExtendedCheckModifier(techLevel: ExtendedTechLevel): number {
  return EXTENDED_TECH_LEVEL_CONFIGS[techLevel].checkModifier;
}

/**
 * 计算扩展等级加成
 * @param techLevel 科技等级
 * @returns 等级加成值
 */
export function calculateExtendedLevelBonus(techLevel: ExtendedTechLevel): number {
  return EXTENDED_TECH_LEVEL_CONFIGS[techLevel].levelBonus;
}

/**
 * 获取科技等级称号
 * @param level 科技等级
 * @returns 等级称号
 */
export function getTechLevelTitle(level: ExtendedTechLevel): string {
  return TECH_LEVEL_NAMES[level].title;
}

/**
 * 获取科技等级分类
 * @param level 科技等级
 * @returns 等级分类
 */
export function getTechLevelTier(level: ExtendedTechLevel): TechLevelTier {
  return TECH_LEVEL_NAMES[level].tier;
}

/**
 * 检查是否为扩展科技等级 (T6-T10)
 * @param level 科技等级
 * @returns 是否为扩展等级
 */
export function isExtendedTechLevel(level: ExtendedTechLevel): boolean {
  return level >= 6;
}

/**
 * 获取升级到指定等级所需的经验值
 * @param targetLevel 目标科技等级
 * @returns 所需经验值
 */
export function getRequiredExpForTechLevel(targetLevel: ExtendedTechLevel): number {
  return EXTENDED_TECH_UNLOCK_THRESHOLDS[`T${targetLevel}` as keyof typeof EXTENDED_TECH_UNLOCK_THRESHOLDS];
}

/**
 * 计算当前经验值到下一级所需的经验差
 * @param currentExp 当前经验值
 * @returns 到下一级所需经验，如果已满级返回0
 */
export function getExpToNextLevel(currentExp: number): number {
  const nextLevelInfo = getNextExtendedTechLevelInfo(currentExp);
  if (!nextLevelInfo) return 0;
  return nextLevelInfo.requiredLevel - currentExp;
}

// 导出所有卡牌分组
export {
  T6_DEFENSE_CARDS,
  T6_ATTACK_CARDS,
  T6_NEUTRAL_CARDS,
  T7_DEFENSE_CARDS,
  T7_ATTACK_CARDS,
  T8_DEFENSE_CARDS,
  T8_ATTACK_CARDS,
  T8_NEUTRAL_CARDS,
  T9_DEFENSE_CARDS,
  T9_ATTACK_CARDS,
  T9_NEUTRAL_CARDS,
  T10_DEFENSE_CARDS,
  T10_ATTACK_CARDS,
  T10_NEUTRAL_CARDS
};
