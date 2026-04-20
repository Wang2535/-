/**
 * 2v2模式角色技能适配器
 * 实现完善的2v2规则.md中2.3.1和2.3.2的角色技能调整
 * 
 * 文档版本: v1.0.0
 * 最后更新: 2026-02-06
 */

import type { Player } from '@/types/gameRules';
import type { SkillContext, SkillEffectResult } from './CharacterSystem';

// 2v2模式下的技能调整类型
export type SkillAdjustmentType = 
  | 'view_team_hand'           // 查看队友手牌
  | 'team_bonus'               // 团队加成
  | 'resource_transfer'        // 资源转移
  | 'effect_share'             // 效果共享
  | 'team_ultimate'            // 团队终极技能
  | 'synergy_trigger';         // 协同触发

// 2v2技能调整定义
export interface Skill2v2Adjustment {
  originalSkillId: string;
  adjustmentType: SkillAdjustmentType;
  description: string;
  apply: (context: SkillContext, teammate?: Player) => SkillEffectResult;
}

// ============================================
// 进攻方角色2v2技能调整 (AR系列)
// ============================================

/**
 * AR01 博弈大师·赛博赌徒 - 2v2调整
 */
const AR01_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AR01_S1',
    adjustmentType: 'view_team_hand',
    description: '【赌徒直觉】：可以查看对方队伍任意1名玩家的手牌',
    apply: () => ({
      success: true,
      message: '2v2模式：可查看对方队伍任意1名玩家的手牌',
      specialEffects: ['view_opponent_team_hand'],
    }),
  },
  {
    originalSkillId: 'AR01_S2',
    adjustmentType: 'team_bonus',
    description: '【双倍下注】：胜利时，队友本回合下次猜拳判定效果+1',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合下次猜拳判定效果+1',
      specialEffects: ['team_next_rps_bonus_plus_1'],
    }),
  },
];

/**
 * AR02 心理分析师·读心者 - 2v2调整
 */
const AR02_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AR02_S1',
    adjustmentType: 'view_team_hand',
    description: '【行为分析】：记录对方2名玩家的行为模式',
    apply: () => ({
      success: true,
      message: '2v2模式：记录对方2名玩家的行为模式',
      specialEffects: ['track_opponent_team_behavior'],
    }),
  },
  {
    originalSkillId: 'AR02_S2',
    adjustmentType: 'team_bonus',
    description: '【预判反制】：预测正确时，队友获得1点信息',
    apply: () => ({
      success: true,
      message: '2v2模式：队友获得1点信息',
      resourceChanges: { compute: 0, funds: 0, information: 1, permission: 0 },
      specialEffects: ['teammate_gain_information'],
    }),
  },
];

/**
 * AR03 欺诈专家·千面客 - 2v2调整
 */
const AR03_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AR03_S1',
    adjustmentType: 'effect_share',
    description: '【虚假信号】：设置的虚假信号对对方2名玩家都有效',
    apply: () => ({
      success: true,
      message: '2v2模式：虚假信号对对方2名玩家都有效',
      specialEffects: ['false_signal_affects_team'],
    }),
  },
  {
    originalSkillId: 'AR03_S2',
    adjustmentType: 'effect_share',
    description: '【身份切换】：重置记录时，队友的记录也一并重置',
    apply: () => ({
      success: true,
      message: '2v2模式：队友的记录也一并重置',
      specialEffects: ['reset_teammate_records'],
    }),
  },
];

/**
 * AC01 命运编织者·概率使 - 2v2调整
 */
const AC01_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AC01_S1',
    adjustmentType: 'effect_share',
    description: '【概率云】：预览结果可以与队友共享',
    apply: () => ({
      success: true,
      message: '2v2模式：预览结果与队友共享',
      specialEffects: ['share_preview_with_teammate'],
    }),
  },
  {
    originalSkillId: 'AC01_S2',
    adjustmentType: 'team_bonus',
    description: '【量子叠加】：队友本回合判定难度-1',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合判定难度-1',
      specialEffects: ['teammate_difficulty_minus_1'],
    }),
  },
];

/**
 * AC02 幸运女神·骰子姬 - 2v2调整
 */
const AC02_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AC02_S1',
    adjustmentType: 'synergy_trigger',
    description: '【幸运光环】：队友触发大成功时，你获得1点幸运标记',
    apply: () => ({
      success: true,
      message: '2v2模式：队友大成功时你获得幸运标记',
      specialEffects: ['gain_lucky_mark_on_teammate_critical'],
    }),
  },
  {
    originalSkillId: 'AC02_S2',
    adjustmentType: 'team_bonus',
    description: '【命运眷顾】：使用后，队友下回合判定自动+1点数',
    apply: () => ({
      success: true,
      message: '2v2模式：队友下回合判定自动+1点数',
      specialEffects: ['teammate_next_roll_plus_1'],
    }),
  },
];

/**
 * AC03 风险投资人·博弈者 - 2v2调整
 */
const AC03_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AC03_S1',
    adjustmentType: 'effect_share',
    description: '【风险评估】：队友可以选择继承你的风险等级',
    apply: () => ({
      success: true,
      message: '2v2模式：队友可继承你的风险等级',
      specialEffects: ['teammate_inherit_risk_level'],
    }),
  },
  {
    originalSkillId: 'AC03_S2',
    adjustmentType: 'team_bonus',
    description: '【杠杆效应】：成功后，队友获得2点资金',
    apply: () => ({
      success: true,
      message: '2v2模式：队友获得2点资金',
      resourceChanges: { compute: 0, funds: 2, information: 0, permission: 0 },
      specialEffects: ['teammate_gain_funds'],
    }),
  },
];

/**
 * AS01 卡组构筑师·牌库掌控者 - 2v2调整
 */
const AS01_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AS01_S1',
    adjustmentType: 'view_team_hand',
    description: '【精准检索】：可以检索队友牌库中的卡牌',
    apply: () => ({
      success: true,
      message: '2v2模式：可检索队友牌库中的卡牌',
      specialEffects: ['search_teammate_deck'],
    }),
  },
  {
    originalSkillId: 'AS01_S2',
    adjustmentType: 'team_bonus',
    description: '【完美构筑】：队友本回合可以额外使用1张卡牌',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合可额外使用1张卡牌',
      specialEffects: ['teammate_extra_card_play'],
    }),
  },
];

/**
 * AS02 资源调配师·能量核心 - 2v2调整
 */
const AS02_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AS02_S1',
    adjustmentType: 'resource_transfer',
    description: '【资源转换】：可以将资源转移给队友（1:1比例）',
    apply: () => ({
      success: true,
      message: '2v2模式：可将资源转移给队友（1:1）',
      specialEffects: ['transfer_resource_to_teammate'],
    }),
  },
  {
    originalSkillId: 'AS02_S2',
    adjustmentType: 'team_bonus',
    description: '【能量共鸣】：触发时，队友也获得1点各类型资源',
    apply: () => ({
      success: true,
      message: '2v2模式：队友也获得1点各类型资源',
      resourceChanges: { compute: 1, funds: 1, information: 1, permission: 0 },
      specialEffects: ['teammate_gain_all_resources'],
    }),
  },
];

/**
 * AS03 战术指挥官·战场统帅 - 2v2调整
 */
const AS03_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'AS03_S1',
    adjustmentType: 'effect_share',
    description: '【战术部署】：重点部署区对队友也生效',
    apply: () => ({
      success: true,
      message: '2v2模式：重点部署区对队友也生效',
      specialEffects: ['area_effect_applies_to_teammate'],
    }),
  },
  {
    originalSkillId: 'AS03_S2',
    adjustmentType: 'effect_share',
    description: '【兵力调度】：可以调度队友的标记',
    apply: () => ({
      success: true,
      message: '2v2模式：可以调度队友的标记',
      specialEffects: ['move_teammate_markers'],
    }),
  },
  {
    originalSkillId: 'AS03_S3',
    adjustmentType: 'team_bonus',
    description: '【全面进攻】：队友控制区域也计入条件',
    apply: () => ({
      success: true,
      message: '2v2模式：队友控制区域也计入条件',
      specialEffects: ['teammate_areas_count_for_ultimate'],
    }),
  },
];

// ============================================
// 防御方角色2v2技能调整 (DR系列)
// ============================================

/**
 * DR01 防御大师·盾卫者 - 2v2调整
 */
const DR01_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DR01_S1',
    adjustmentType: 'view_team_hand',
    description: '【坚盾直觉】：可以查看对方队伍任意1名玩家的手牌',
    apply: () => ({
      success: true,
      message: '2v2模式：可查看对方队伍任意1名玩家的手牌',
      specialEffects: ['view_opponent_team_hand'],
    }),
  },
  {
    originalSkillId: 'DR01_S2',
    adjustmentType: 'team_bonus',
    description: '【防御姿态】：队友本回合受到的伤害-1',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合受到的伤害-1',
      specialEffects: ['teammate_damage_reduction_1'],
    }),
  },
];

/**
 * DR02 反击专家·镜像者 - 2v2调整
 */
const DR02_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DR02_S1',
    adjustmentType: 'view_team_hand',
    description: '【镜像反射】：记录对方2名玩家的攻击模式',
    apply: () => ({
      success: true,
      message: '2v2模式：记录对方2名玩家的攻击模式',
      specialEffects: ['track_opponent_team_attacks'],
    }),
  },
  {
    originalSkillId: 'DR02_S2',
    adjustmentType: 'team_bonus',
    description: '【终极反击】：反弹的伤害由对方2名玩家分担',
    apply: () => ({
      success: true,
      message: '2v2模式：反弹伤害由对方2名玩家分担',
      specialEffects: ['damage_shared_by_opponent_team'],
    }),
  },
];

/**
 * DR03 预判大师·先知 - 2v2调整
 */
const DR03_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DR03_S1',
    adjustmentType: 'team_bonus',
    description: '【未来视】：预测正确时，队友本回合免疫1次负面效果',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合免疫1次负面效果',
      specialEffects: ['teammate_immune_negative_effect'],
    }),
  },
  {
    originalSkillId: 'DR03_S2',
    adjustmentType: 'effect_share',
    description: '【时间锁定】：锁定效果对对方2名玩家都有效',
    apply: () => ({
      success: true,
      message: '2v2模式：锁定效果对对方2名玩家都有效',
      specialEffects: ['time_lock_affects_team'],
    }),
  },
];

/**
 * DC01 概率守护者·稳定者 - 2v2调整
 */
const DC01_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DC01_S1',
    adjustmentType: 'effect_share',
    description: '【概率锚定】：预览结果可以与队友共享',
    apply: () => ({
      success: true,
      message: '2v2模式：预览结果与队友共享',
      specialEffects: ['share_preview_with_teammate'],
    }),
  },
  {
    originalSkillId: 'DC01_S2',
    adjustmentType: 'team_bonus',
    description: '【稳定场】：队友本回合判定大失败阈值+1',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合判定大失败阈值+1',
      specialEffects: ['teammate_critical_failure_threshold_plus_1'],
    }),
  },
];

/**
 * DC02 幸运防御者·守护女神 - 2v2调整
 */
const DC02_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DC02_S1',
    adjustmentType: 'synergy_trigger',
    description: '【守护光环】：队友触发大成功时，你获得1点守护标记',
    apply: () => ({
      success: true,
      message: '2v2模式：队友大成功时你获得守护标记',
      specialEffects: ['gain_guard_mark_on_teammate_critical'],
    }),
  },
  {
    originalSkillId: 'DC02_S2',
    adjustmentType: 'team_bonus',
    description: '【绝对守护】：使用后，队友获得2点护盾值',
    apply: () => ({
      success: true,
      message: '2v2模式：队友获得2点护盾值',
      specialEffects: ['teammate_gain_shield_2'],
    }),
  },
];

/**
 * DC03 风险控制师·保险专家 - 2v2调整
 */
const DC03_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DC03_S1',
    adjustmentType: 'effect_share',
    description: '【风险评估】：队友可以选择继承你的保守等级',
    apply: () => ({
      success: true,
      message: '2v2模式：队友可继承你的保守等级',
      specialEffects: ['teammate_inherit_conservative_level'],
    }),
  },
  {
    originalSkillId: 'DC03_S2',
    adjustmentType: 'team_bonus',
    description: '【风险对冲】：成功后，队友获得2点资金',
    apply: () => ({
      success: true,
      message: '2v2模式：队友获得2点资金',
      resourceChanges: { compute: 0, funds: 2, information: 0, permission: 0 },
      specialEffects: ['teammate_gain_funds'],
    }),
  },
];

/**
 * DS01 防御构筑师·堡垒掌控者 - 2v2调整
 */
const DS01_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DS01_S1',
    adjustmentType: 'view_team_hand',
    description: '【防御检索】：可以检索队友牌库中的防御卡牌',
    apply: () => ({
      success: true,
      message: '2v2模式：可检索队友牌库中的防御卡牌',
      specialEffects: ['search_teammate_defense_cards'],
    }),
  },
  {
    originalSkillId: 'DS01_S2',
    adjustmentType: 'team_bonus',
    description: '【完美堡垒】：队友本回合防御效果+1',
    apply: () => ({
      success: true,
      message: '2v2模式：队友本回合防御效果+1',
      specialEffects: ['teammate_defense_plus_1'],
    }),
  },
];

/**
 * DS02 资源守护者·能量护盾 - 2v2调整
 */
const DS02_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DS02_S1',
    adjustmentType: 'resource_transfer',
    description: '【资源护盾】：可以将护盾值转移给队友',
    apply: () => ({
      success: true,
      message: '2v2模式：可将护盾值转移给队友',
      specialEffects: ['transfer_shield_to_teammate'],
    }),
  },
  {
    originalSkillId: 'DS02_S2',
    adjustmentType: 'team_bonus',
    description: '【能量共鸣】：触发时，队友也获得2点护盾值',
    apply: () => ({
      success: true,
      message: '2v2模式：队友也获得2点护盾值',
      specialEffects: ['teammate_gain_shield_2'],
    }),
  },
];

/**
 * DS03 区域防御者·阵地统帅 - 2v2调整
 */
const DS03_2v2_Adjustments: Skill2v2Adjustment[] = [
  {
    originalSkillId: 'DS03_S1',
    adjustmentType: 'effect_share',
    description: '【防御部署】：重点防御区对队友也生效',
    apply: () => ({
      success: true,
      message: '2v2模式：重点防御区对队友也生效',
      specialEffects: ['defense_area_applies_to_teammate'],
    }),
  },
  {
    originalSkillId: 'DS03_S2',
    adjustmentType: 'effect_share',
    description: '【兵力调度】：可以调度队友的防御标记',
    apply: () => ({
      success: true,
      message: '2v2模式：可以调度队友的防御标记',
      specialEffects: ['move_teammate_defense_markers'],
    }),
  },
  {
    originalSkillId: 'DS03_S3',
    adjustmentType: 'team_bonus',
    description: '【全面防御】：队友控制区域也计入条件',
    apply: () => ({
      success: true,
      message: '2v2模式：队友控制区域也计入条件',
      specialEffects: ['teammate_areas_count_for_ultimate'],
    }),
  },
];

// ============================================
// 2v2技能调整映射表
// ============================================

const Character2v2AdjustmentMap: Map<string, Skill2v2Adjustment[]> = new Map([
  // 进攻方
  ['AR01', AR01_2v2_Adjustments],
  ['AR02', AR02_2v2_Adjustments],
  ['AR03', AR03_2v2_Adjustments],
  ['AC01', AC01_2v2_Adjustments],
  ['AC02', AC02_2v2_Adjustments],
  ['AC03', AC03_2v2_Adjustments],
  ['AS01', AS01_2v2_Adjustments],
  ['AS02', AS02_2v2_Adjustments],
  ['AS03', AS03_2v2_Adjustments],
  // 防御方
  ['DR01', DR01_2v2_Adjustments],
  ['DR02', DR02_2v2_Adjustments],
  ['DR03', DR03_2v2_Adjustments],
  ['DC01', DC01_2v2_Adjustments],
  ['DC02', DC02_2v2_Adjustments],
  ['DC03', DC03_2v2_Adjustments],
  ['DS01', DS01_2v2_Adjustments],
  ['DS02', DS02_2v2_Adjustments],
  ['DS03', DS03_2v2_Adjustments],
]);

// ============================================
// 2v2角色技能适配器主类
// ============================================

export class Character2v2Adapter {
  /**
   * 获取角色的2v2技能调整
   */
  static get2v2Adjustments(characterId: string): Skill2v2Adjustment[] {
    return Character2v2AdjustmentMap.get(characterId) || [];
  }

  /**
   * 检查角色是否有2v2技能调整
   */
  static has2v2Adjustments(characterId: string): boolean {
    return Character2v2AdjustmentMap.has(characterId);
  }

  /**
   * 应用2v2技能调整
   */
  static apply2v2Adjustment(
    characterId: string,
    skillId: string,
    context: SkillContext,
    teammate?: Player
  ): SkillEffectResult | null {
    const adjustments = this.get2v2Adjustments(characterId);
    const adjustment = adjustments.find(a => a.originalSkillId === skillId);
    
    if (!adjustment) return null;
    
    return adjustment.apply(context, teammate);
  }

  /**
   * 获取所有支持2v2模式的角色ID列表
   */
  static getSupportedCharacters(): string[] {
    return Array.from(Character2v2AdjustmentMap.keys());
  }

  /**
   * 获取2v2调整描述
   */
  static get2v2AdjustmentDescription(characterId: string, skillId: string): string | null {
    const adjustments = this.get2v2Adjustments(characterId);
    const adjustment = adjustments.find(a => a.originalSkillId === skillId);
    return adjustment?.description || null;
  }
}

export default Character2v2Adapter;
