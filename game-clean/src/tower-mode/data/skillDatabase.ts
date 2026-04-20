import type { Skill } from '../types/skill.types';
import { SKILL_QUALITY_COLORS } from '../constants/skillProbabilities';

// 完整设想中要求的技能数据库
export const SKILL_DATABASE: Skill[] = [
  // === 被动技能 (passive) ===
  
  // 普通品质
  {
    id: 'skill_tenacity_basic',
    name: '坚韧意志',
    description: '战斗开始时安全等级+1',
    quality: 'common',
    triggerType: 'passive',
    effect: (context: any) => ({ safetyLevelBonus: 1 }),
    effectDescription: '战斗开始时安全等级+1',
    icon: '🛡️',
    color: SKILL_QUALITY_COLORS.common,
  },
  
  {
    id: 'skill_basic_comprehension',
    name: '基础理解',
    description: '特定类型卡牌效果+10%',
    quality: 'common',
    triggerType: 'passive',
    effect: (context: any) => ({ cardEffectBonus: 0.10 }),
    effectDescription: '特定类型卡牌效果+10%',
    icon: '📚',
    color: SKILL_QUALITY_COLORS.common,
  },
  
  // 优秀品质
  {
    id: 'skill_tenacity_good',
    name: '坚韧之心',
    description: '战斗开始时安全等级+2，关卡失败时技术值扣除减少15%',
    quality: 'good',
    triggerType: 'passive',
    effect: (context: any) => ({ safetyLevelBonus: 2, defeatDamageReduction: 0.15 }),
    effectDescription: '战斗开始时安全等级+2，关卡失败时技术值扣除减少15%',
    icon: '💪',
    color: SKILL_QUALITY_COLORS.good,
  },
  
  {
    id: 'skill_combo_learner',
    name: '连击学徒',
    description: '连续出同类卡牌第3张效果+30%',
    quality: 'good',
    triggerType: 'card_played',
    effect: (context: any) => context.consecutive >= 3 ? { effectMultiplier: 1.30 } : {},
    effectDescription: '连续出同类卡牌第3张效果+30%',
    icon: '🎯',
    color: SKILL_QUALITY_COLORS.good,
  },
  
  // 稀有品质
  {
    id: 'skill_tenacity_rare',
    name: '钢铁意志',
    description: '战斗开始时安全等级+3，关卡失败时技术值扣除减少20%',
    quality: 'rare',
    triggerType: 'passive',
    effect: (context: any) => ({ safetyLevelBonus: 3, defeatDamageReduction: 0.20 }),
    effectDescription: '战斗开始时安全等级+3，关卡失败时技术值扣除减少20%',
    icon: '⚡',
    color: SKILL_QUALITY_COLORS.rare,
  },
  
  {
    id: 'skill_combo_master',
    name: '连击精通',
    description: '连续出同类卡牌第3张效果+50%',
    quality: 'rare',
    triggerType: 'card_played',
    effect: (context: any) => context.consecutive >= 3 ? { effectMultiplier: 1.50 } : {},
    effectDescription: '连续出同类卡牌第3张效果+50%',
    icon: '🔥',
    color: SKILL_QUALITY_COLORS.rare,
  },
  
  // 史诗品质
  {
    id: 'skill_tenacity_epic',
    name: '不屈之魂',
    description: '战斗开始时安全等级+5，关卡失败时技术值扣除减少30%',
    quality: 'epic',
    triggerType: 'passive',
    effect: (context: any) => ({ safetyLevelBonus: 5, defeatDamageReduction: 0.30 }),
    effectDescription: '战斗开始时安全等级+5，关卡失败时技术值扣除减少30%',
    icon: '🌟',
    color: SKILL_QUALITY_COLORS.epic,
  },
  
  {
    id: 'skill_card_synergy',
    name: '卡牌协同',
    description: '所有卡牌效果+20%',
    quality: 'epic',
    triggerType: 'passive',
    effect: (context: any) => ({ globalEffectBonus: 0.20 }),
    effectDescription: '所有卡牌效果+20%',
    icon: '🎴',
    color: SKILL_QUALITY_COLORS.epic,
  },
  
  // 传说品质
  {
    id: 'skill_tenacity_legendary',
    name: '不朽意志',
    description: '战斗开始时安全等级+8，关卡失败时技术值扣除减少50%，获得1次免死机会',
    quality: 'legendary',
    triggerType: 'passive',
    effect: (context: any) => ({ safetyLevelBonus: 8, defeatDamageReduction: 0.50, secondChance: 1 }),
    effectDescription: '战斗开始时安全等级+8，关卡失败时技术值扣除减少50%，获得1次免死机会',
    icon: '👑',
    color: SKILL_QUALITY_COLORS.legendary,
  },
  
  {
    id: 'skill_unlimited_potential',
    name: '无限潜能',
    description: '技能槽上限增加到4个，所有技能效果+25%',
    quality: 'legendary',
    triggerType: 'passive',
    effect: (context: any) => ({ maxSkills: 4, skillEffectBonus: 0.25 }),
    effectDescription: '技能槽上限增加到4个，所有技能效果+25%',
    icon: '✨',
    color: SKILL_QUALITY_COLORS.legendary,
  },
  
  // === 回合开始触发技能 (turn_start) ===
  
  {
    id: 'skill_regeneration',
    name: '再生能力',
    description: '每回合安全等级+1',
    quality: 'rare',
    triggerType: 'turn_start',
    effect: (context: any) => ({ safetyLevelPerTurn: 1 }),
    effectDescription: '每回合安全等级+1',
    icon: '💚',
    color: SKILL_QUALITY_COLORS.rare,
  },
  
  {
    id: 'skill_computing_boost',
    name: '算力涌动',
    description: '每回合额外获得1点战斗算力',
    quality: 'epic',
    triggerType: 'turn_start',
    effect: (context: any) => ({ extraComputing: 1 }),
    effectDescription: '每回合额外获得1点战斗算力',
    icon: '⚡',
    color: SKILL_QUALITY_COLORS.epic,
  },
  
  // === 主动释放技能 (active) ===
  
  {
    id: 'skill_time_stop',
    name: '时间停滞',
    description: '冻结敌人1回合，冷却5回合',
    quality: 'rare',
    triggerType: 'active',
    effect: (context: any) => ({ freezeEnemy: 1 }),
    effectDescription: '冻结敌人1回合',
    icon: '⏱️',
    color: SKILL_QUALITY_COLORS.rare,
    cooldown: 5,
  },
  
  {
    id: 'skill_power_surge',
    name: '能力爆发',
    description: '本回合所有卡牌效果翻倍，冷却8回合',
    quality: 'epic',
    triggerType: 'active',
    effect: (context: any) => ({ effectMultiplier: 2.0 }),
    effectDescription: '本回合所有卡牌效果翻倍',
    icon: '💥',
    color: SKILL_QUALITY_COLORS.epic,
    cooldown: 8,
  },
  
  // === 地图触发技能 (map_trigger) ===
  
  {
    id: 'skill_tactical_retreat',
    name: '战术撤退',
    description: '跳过当前关卡格回到上一格，冷却3层',
    quality: 'good',
    triggerType: 'map_trigger',
    effect: (context: any) => ({ skipCell: true, goBack: 1 }),
    effectDescription: '跳过当前关卡格回到上一格',
    icon: '🏃',
    color: SKILL_QUALITY_COLORS.good,
    cooldown: 3, // 冷却以层为单位
  },
  
  {
    id: 'skill_light_traveler',
    name: '轻装上阵',
    description: '骰子最低点数为2',
    quality: 'rare',
    triggerType: 'map_trigger',
    effect: (context: any) => ({ minimumDice: 2 }),
    effectDescription: '骰子最低点数为2',
    icon: '🎲',
    color: SKILL_QUALITY_COLORS.rare,
  },
  
  {
    id: 'skill_swap_position',
    name: '空间换位',
    description: '直接瞬移到Boss格（需要已通关9个关卡），冷却5层',
    quality: 'legendary',
    triggerType: 'map_trigger',
    effect: (context: any) => ({ teleportToBoss: true }),
    effectDescription: '直接瞬移到Boss格（需要已通关9个关卡）',
    icon: '🌀',
    color: SKILL_QUALITY_COLORS.legendary,
    cooldown: 5,
  },
  
  // === 关卡失败触发技能 (on_defeat) ===
  
  {
    id: 'skill_adversity_rebound',
    name: '逆境反弹',
    description: '关卡失败时技术值扣除减少15%',
    quality: 'good',
    triggerType: 'on_defeat',
    effect: (context: any) => ({ defeatDamageReduction: 0.15 }),
    effectDescription: '关卡失败时技术值扣除减少15%',
    icon: '💫',
    color: SKILL_QUALITY_COLORS.good,
  },
  
  {
    id: 'skill_second_wind',
    name: '二次呼吸',
    description: '关卡失败时恢复10点技术值（每局限1次）',
    quality: 'rare',
    triggerType: 'on_defeat',
    effect: (context: any) => ({ recoverOnDefeat: 10 }),
    effectDescription: '关卡失败时恢复10点技术值（每局限1次）',
    icon: '🔄',
    color: SKILL_QUALITY_COLORS.rare,
    maxUses: 1,
  },
];

// 根据层级获取随机技能
export function getRandomSkill(layer: number): Skill {
  const probability = SKILL_DATABASE[0] ? { quality: 'common' } : SKILL_DATABASE[0];
  const qualityOrder = ['common', 'good', 'rare', 'epic', 'legendary'];
  const rand = Math.random();
  let cumulative = 0;
  
  // 从数据库中随机选择一个符合层级概率的技能
  const filteredSkills = SKILL_DATABASE.filter(skill => {
    const qualityIndex = qualityOrder.indexOf(skill.quality);
    const minLayerForQuality = [1, 2, 3, 5, 7]; // 各品质出现的最小层级
    return layer >= minLayerForQuality[qualityIndex];
  });
  
  if (filteredSkills.length === 0) {
    return SKILL_DATABASE[0]; // 兜底
  }
  
  return filteredSkills[Math.floor(Math.random() * filteredSkills.length)];
}
