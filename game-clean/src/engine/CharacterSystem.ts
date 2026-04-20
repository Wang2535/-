/**
 * 角色系统 - 完整实现18个角色的技能逻辑
 * 规则依据: 完善的角色规则.md + 完善的角色规则2.md
 */

import type { GameState, Player } from '@/types/gameRules';

// 角色系统内部使用的Resources类型 - 与gameRules.ts中的Resources保持一致
interface CharacterResources {
  compute: number;
  funds: number;
  information: number;
  permission: number;
}

// ============================================
// 角色类型定义
// ============================================

export type CharacterType = 'rps' | 'dice' | 'special';
export type CharacterFaction = 'attacker' | 'defender';

export interface CharacterSkill {
  id: string;
  name: string;
  type: 'passive' | 'active' | 'ultimate';
  description: string;
  triggerCondition: string;
  effect: (context: SkillContext) => SkillEffectResult;
  cooldown?: number;
  maxUses?: number;
  cost?: Partial<CharacterResources>;
}

export interface Character {
  id: string;
  name: string;
  faction: CharacterFaction;
  type: CharacterType;
  difficulty: 1 | 2 | 3 | 4;
  description: string;
  baseStats: {
    infiltrationLevel?: number;
    safetyLevel?: number;
    resources: CharacterResources;
    maxPermissions?: number;
  };
  skills: [CharacterSkill, CharacterSkill, CharacterSkill];
}

export interface SkillContext {
  gameState: GameState;
  player: Player;
  targetPlayer?: Player;
  phase?: string;
  judgmentType?: 'rps' | 'dice';
  judgmentResult?: 'win' | 'lose' | 'draw';
  cardPlayed?: string;
  resourcesConsumed?: Partial<CharacterResources>;
}

export interface SkillEffectResult {
  success: boolean;
  message: string;
  resourceChanges?: Partial<CharacterResources>;
  levelChanges?: {
    infiltration?: number;
    safety?: number;
  };
  drawCards?: number;
  specialEffects?: string[];
  cooldownApplied?: number;
}

// ============================================
// 进攻方角色 - 猜拳系 (AR)
// ============================================

const AR01_Gambler: Character = {
  id: 'AR01',
  name: '博弈大师·赛博赌徒',
  faction: 'attacker',
  type: 'rps',
  difficulty: 3,
  description: '精通博弈论与心理战术，在石头剪刀布的对决中从未败北',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 3, funds: 7, information: 2, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AR01_S1',
      name: '赌徒直觉',
      type: 'passive',
      description: '每回合第一次猜拳判定时，可查看对方1张手牌',
      triggerCondition: '每回合第一次猜拳判定',
      effect: () => ({
        success: true,
        message: '查看对方1张手牌',
        specialEffects: ['view_opponent_hand_1'],
      }),
    },
    {
      id: 'AR01_S2',
      name: '双倍下注',
      type: 'active',
      description: '支付2点资源，猜拳胜利时效果翻倍',
      triggerCondition: '猜拳判定前',
      cooldown: 2,
      cost: { compute: 2 },
      effect: (ctx) => {
        const resources = ctx.resourcesConsumed || {};
        const totalCost = (resources.compute || 0) + (resources.funds || 0) + (resources.information || 0);
        if (totalCost >= 2) {
          return {
            success: true,
            message: '双倍下注激活！胜利效果×2',
            specialEffects: ['double_bet_active'],
          };
        }
        return {
          success: false,
          message: '资源不足，无法激活双倍下注',
        };
      },
    },
    {
      id: 'AR01_S3',
      name: '心理操控',
      type: 'ultimate',
      description: '消耗3点权限，指定对方猜拳选择',
      triggerCondition: '渗透等级≥30，猜拳判定阶段',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '指定对方猜拳选择，必定胜利',
        resourceChanges: { permission: -3 },
        specialEffects: ['force_opponent_rps_choice', 'guaranteed_win'],
      }),
    },
  ],
};

const AR02_MindReader: Character = {
  id: 'AR02',
  name: '心理分析师·读心者',
  faction: 'attacker',
  type: 'rps',
  difficulty: 4,
  description: '通过分析行为模式预测对手下一步行动',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 3, funds: 5, information: 4, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AR02_S1',
      name: '行为分析',
      type: 'passive',
      description: '记录对方行为模式，预测其下一步选择',
      triggerCondition: '对方进行猜拳判定后',
      effect: () => ({
        success: true,
        message: '记录对方行为模式',
        specialEffects: ['record_behavior_pattern'],
      }),
    },
    {
      id: 'AR02_S2',
      name: '预判反制',
      type: 'active',
      description: '预测对方选择，正确时获得+2渗透',
      triggerCondition: '猜拳判定前',
      cooldown: 1,
      effect: (ctx) => {
        if (ctx.judgmentResult === 'win') {
          return {
            success: true,
            message: '预判正确！渗透+2',
            levelChanges: { infiltration: 2 },
          };
        }
        return {
          success: false,
          message: '预判失败',
        };
      },
    },
    {
      id: 'AR02_S3',
      name: '思维读取',
      type: 'ultimate',
      description: '消耗3点权限，查看对方所有手牌和意图',
      triggerCondition: '渗透等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '读取对方思维，查看所有手牌',
        resourceChanges: { permission: -3 },
        specialEffects: ['view_all_opponent_cards', 'predict_next_move'],
      }),
    },
  ],
};

const AR03_Deceiver: Character = {
  id: 'AR03',
  name: '欺诈专家·千面客',
  faction: 'attacker',
  type: 'rps',
  difficulty: 3,
  description: '擅长设置虚假信号欺骗对手',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 4, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AR03_S1',
      name: '虚假信号',
      type: 'passive',
      description: '设置虚假信号误导对方判断',
      triggerCondition: '每回合开始时',
      effect: () => ({
        success: true,
        message: '设置虚假信号',
        specialEffects: ['set_false_signal'],
      }),
    },
    {
      id: 'AR03_S2',
      name: '身份切换',
      type: 'active',
      description: '重置行为记录，让对方无法预测',
      triggerCondition: '任意阶段',
      cooldown: 3,
      effect: () => ({
        success: true,
        message: '身份切换！行为记录已重置',
        specialEffects: ['reset_behavior_record', 'immune_prediction_1_turn'],
      }),
    },
    {
      id: 'AR03_S3',
      name: '完美欺骗',
      type: 'ultimate',
      description: '消耗3点权限，本次猜拳对方无法使用技能',
      triggerCondition: '渗透等级≥30，猜拳判定阶段',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '完美欺骗！对方技能被封印',
        resourceChanges: { permission: -3 },
        specialEffects: ['silence_opponent_skills'],
      }),
    },
  ],
};

// ============================================
// 进攻方角色 - 骰子系 (AC)
// ============================================

const AC01_Probability: Character = {
  id: 'AC01',
  name: '命运编织者·概率使',
  faction: 'attacker',
  type: 'dice',
  difficulty: 2,
  description: '能够操控概率，让骰子按照自己的意愿滚动',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 4, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AC01_S1',
      name: '概率云',
      type: 'passive',
      description: '预览骰子判定结果（查看概率分布）',
      triggerCondition: '骰子判定前',
      effect: () => ({
        success: true,
        message: '预览判定概率',
        specialEffects: ['preview_dice_probability'],
      }),
    },
    {
      id: 'AC01_S2',
      name: '量子叠加',
      type: 'active',
      description: '掷两次骰子，选择有利结果',
      triggerCondition: '骰子判定前',
      cooldown: 2,
      cost: { compute: 2 },
      effect: () => ({
        success: true,
        message: '量子叠加！可选择有利结果',
        specialEffects: ['roll_twice_choose_one'],
      }),
    },
    {
      id: 'AC01_S3',
      name: '命运改写',
      type: 'ultimate',
      description: '消耗3点权限，直接指定骰子结果（1-6）',
      triggerCondition: '渗透等级≥30，骰子判定阶段',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '命运改写！指定骰子结果',
        resourceChanges: { permission: -3 },
        specialEffects: ['choose_dice_result'],
      }),
    },
  ],
};

const AC02_LuckyGoddess: Character = {
  id: 'AC02',
  name: '幸运女神·骰子姬',
  faction: 'attacker',
  type: 'dice',
  difficulty: 2,
  description: '被幸运女神眷顾，骰子总是偏向她',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 3, funds: 6, information: 2, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AC02_S1',
      name: '幸运光环',
      type: 'passive',
      description: '骰子判定+1（不超过6）',
      triggerCondition: '每次骰子判定',
      effect: () => ({
        success: true,
        message: '幸运光环！判定+1',
        specialEffects: ['dice_bonus_1'],
      }),
    },
    {
      id: 'AC02_S2',
      name: '命运眷顾',
      type: 'active',
      description: '大成功阈值-1（5-6视为大成功）',
      triggerCondition: '骰子判定前',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '命运眷顾！大成功阈值降低',
        specialEffects: ['critical_success_threshold_5'],
      }),
    },
    {
      id: 'AC02_S3',
      name: '幸运风暴',
      type: 'ultimate',
      description: '消耗3点权限，接下来3次判定自动成功',
      triggerCondition: '渗透等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '幸运风暴！接下来3次判定自动成功',
        resourceChanges: { permission: -3 },
        specialEffects: ['auto_success_3_times'],
      }),
    },
  ],
};

const AC03_RiskInvestor: Character = {
  id: 'AC03',
  name: '风险投资人·博弈者',
  faction: 'attacker',
  type: 'dice',
  difficulty: 3,
  description: '高风险高回报，敢于押注一切',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 3, funds: 8, information: 2, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AC03_S1',
      name: '风险评估',
      type: 'passive',
      description: '根据风险等级获得不同加成',
      triggerCondition: '每次骰子判定',
      effect: () => {
        const riskLevel = Math.floor(Math.random() * 3) + 1;
        const bonus = riskLevel * 0.5;
        return {
          success: true,
          message: `风险评估完成，当前风险等级${riskLevel}，加成+${bonus}`,
          specialEffects: [`risk_level_${riskLevel}`],
        };
      },
    },
    {
      id: 'AC03_S2',
      name: '杠杆效应',
      type: 'active',
      description: '支付3点资金，成功时效果×3，失败时损失×2',
      triggerCondition: '骰子判定前',
      cooldown: 2,
      cost: { funds: 3 },
      effect: () => ({
        success: true,
        message: '杠杆效应激活！高风险高回报',
        specialEffects: ['leverage_effect_3x'],
      }),
    },
    {
      id: 'AC03_S3',
      name: '孤注一掷',
      type: 'ultimate',
      description: '消耗3点权限，将所有资源转化为判定加成',
      triggerCondition: '渗透等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: (ctx) => {
        const player = ctx.player;
        const totalResources = player.resources.compute + player.resources.funds + player.resources.information;
        const bonus = Math.floor(totalResources / 2);
        return {
          success: true,
          message: `孤注一掷！消耗所有资源，判定+${bonus}`,
          resourceChanges: {
            compute: -player.resources.compute,
            funds: -player.resources.funds,
            information: -player.resources.information,
            permission: -3,
          },
          specialEffects: [`dice_bonus_${bonus}`],
        };
      },
    },
  ],
};

// ============================================
// 进攻方角色 - 专属系 (AS)
// ============================================

const AS01_DeckBuilder: Character = {
  id: 'AS01',
  name: '卡组构筑师·牌库掌控者',
  faction: 'attacker',
  type: 'special',
  difficulty: 4,
  description: '能够精准检索牌库，构筑完美手牌',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 3, funds: 5, information: 4, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AS01_S1',
      name: '精准检索',
      type: 'passive',
      description: '抽卡时可以从牌库顶部3张中选择1张',
      triggerCondition: '每次抽卡',
      effect: () => ({
        success: true,
        message: '精准检索！从顶部3张中选择',
        specialEffects: ['choose_from_top_3'],
      }),
    },
    {
      id: 'AS01_S2',
      name: '卡组优化',
      type: 'active',
      description: '弃置任意张手牌，抽取等量卡牌',
      triggerCondition: '摸牌阶段',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '卡组优化！可替换手牌',
        specialEffects: ['mulligan_hand'],
      }),
    },
    {
      id: 'AS01_S3',
      name: '完美构筑',
      type: 'ultimate',
      description: '消耗3点权限，从牌库中检索任意1张卡牌加入手牌',
      triggerCondition: '渗透等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '完美构筑！检索任意卡牌',
        resourceChanges: { permission: -3 },
        specialEffects: ['search_any_card'],
      }),
    },
  ],
};

const AS02_ResourceManager: Character = {
  id: 'AS02',
  name: '资源调配师·能量核心',
  faction: 'attacker',
  type: 'special',
  difficulty: 3,
  description: '精通资源转换与调配，永不匮乏',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 5, funds: 7, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AS02_S1',
      name: '资源转换',
      type: 'passive',
      description: '可以将任意2点资源转换为1点其他资源',
      triggerCondition: '任意阶段',
      effect: () => ({
        success: true,
        message: '资源转换可用（2:1比例）',
        specialEffects: ['resource_conversion_2to1'],
      }),
    },
    {
      id: 'AS02_S2',
      name: '能量共鸣',
      type: 'active',
      description: '恢复阶段额外恢复2点所有资源',
      triggerCondition: '恢复阶段',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '能量共鸣！额外恢复资源',
        resourceChanges: { compute: 2, funds: 2, information: 2 },
      }),
    },
    {
      id: 'AS02_S3',
      name: '资源洪流',
      type: 'ultimate',
      description: '消耗3点权限，所有资源恢复至上限',
      triggerCondition: '渗透等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '资源洪流！所有资源恢复至上限',
        resourceChanges: { permission: -3 },
        specialEffects: ['restore_all_resources_to_max'],
      }),
    },
  ],
};

const AS03_TacticalCommander: Character = {
  id: 'AS03',
  name: '战术指挥官·战场统帅',
  faction: 'attacker',
  type: 'special',
  difficulty: 4,
  description: '精通区域控制与战术部署',
  baseStats: {
    infiltrationLevel: 0,
    resources: { compute: 4, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'AS03_S1',
      name: '战术部署',
      type: 'passive',
      description: '控制区域时，该区域效果+1',
      triggerCondition: '控制任意区域时',
      effect: () => ({
        success: true,
        message: '战术部署！区域效果增强',
        specialEffects: ['area_effect_plus_1'],
      }),
    },
    {
      id: 'AS03_S2',
      name: '兵力调度',
      type: 'active',
      description: '移动区域内标记到其他区域',
      triggerCondition: '行动阶段',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '兵力调度！可移动区域标记',
        specialEffects: ['move_area_tokens'],
      }),
    },
    {
      id: 'AS03_S3',
      name: '全面进攻',
      type: 'ultimate',
      description: '消耗3点权限，所有区域威胁标记翻倍',
      triggerCondition: '渗透等级≥30，控制≥2区域',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '全面进攻！所有威胁标记翻倍',
        resourceChanges: { permission: -3 },
        specialEffects: ['double_all_threat_tokens'],
      }),
    },
  ],
};

// ============================================
// 防御方角色 - 猜拳系 (DR)
// ============================================

const DR01_ShieldMaster: Character = {
  id: 'DR01',
  name: '防御大师·盾卫者',
  faction: 'defender',
  type: 'rps',
  difficulty: 3,
  description: '网络安全领域最坚固的盾牌',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 3, funds: 5, information: 2, permission: 1 },
    maxPermissions: 6,
  },
  skills: [
    {
      id: 'DR01_S1',
      name: '坚盾直觉',
      type: 'passive',
      description: '每回合第一次猜拳判定时，可查看对方1张手牌',
      triggerCondition: '每回合第一次猜拳判定',
      effect: () => ({
        success: true,
        message: '查看对方1张手牌',
        specialEffects: ['view_opponent_hand_1'],
      }),
    },
    {
      id: 'DR01_S2',
      name: '防御姿态',
      type: 'active',
      description: '支付2点资源，猜拳失败时损失减半',
      triggerCondition: '猜拳判定前',
      cooldown: 2,
      cost: { compute: 2 },
      effect: () => ({
        success: true,
        message: '防御姿态激活！失败损失减半',
        specialEffects: ['half_damage_taken'],
      }),
    },
    {
      id: 'DR01_S3',
      name: '绝对防御',
      type: 'ultimate',
      description: '消耗3点权限，本次猜拳平局或胜利',
      triggerCondition: '安全等级≥30，猜拳判定阶段',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '绝对防御！本次判定不会失败',
        resourceChanges: { permission: -3 },
        specialEffects: ['no_lose_guaranteed'],
      }),
    },
  ],
};

const DR02_MirrorMaster: Character = {
  id: 'DR02',
  name: '反击专家·镜像者',
  faction: 'defender',
  type: 'rps',
  difficulty: 4,
  description: '能够将对方的攻击原封不动地反弹回去',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 3, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DR02_S1',
      name: '镜像反射',
      type: 'passive',
      description: '猜拳胜利时，反弹对方50%效果',
      triggerCondition: '猜拳判定胜利时',
      effect: () => ({
        success: true,
        message: '镜像反射！反弹50%效果',
        specialEffects: ['reflect_50_percent'],
      }),
    },
    {
      id: 'DR02_S2',
      name: '攻击记录',
      type: 'active',
      description: '记录对方攻击模式，下次判定+1',
      triggerCondition: '猜拳判定后',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '攻击模式已记录',
        specialEffects: ['record_attack_pattern', 'next_judgment_plus_1'],
      }),
    },
    {
      id: 'DR02_S3',
      name: '完美镜像',
      type: 'ultimate',
      description: '消耗3点权限，反弹100%效果',
      triggerCondition: '安全等级≥30，猜拳判定胜利时',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '完美镜像！反弹100%效果',
        resourceChanges: { permission: -3 },
        specialEffects: ['reflect_100_percent'],
      }),
    },
  ],
};

const DR03_Prophet: Character = {
  id: 'DR03',
  name: '预言家·先知',
  faction: 'defender',
  type: 'rps',
  difficulty: 3,
  description: '能够预见未来的攻击并提前布防',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 4, funds: 4, information: 4, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DR03_S1',
      name: '危险预感',
      type: 'passive',
      description: '对方渗透等级提升时，获得预警',
      triggerCondition: '对方渗透等级提升时',
      effect: () => ({
        success: true,
        message: '危险预感！检测到渗透威胁',
        specialEffects: ['infiltration_warning'],
      }),
    },
    {
      id: 'DR03_S2',
      name: '提前布防',
      type: 'active',
      description: '下回合受到的第一次伤害-3',
      triggerCondition: '任意阶段',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '提前布防！下回合首次伤害-3',
        specialEffects: ['next_damage_minus_3'],
      }),
    },
    {
      id: 'DR03_S3',
      name: '命运预知',
      type: 'ultimate',
      description: '消耗3点权限，查看对方下3回合行动',
      triggerCondition: '安全等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '命运预知！查看对方下3回合行动',
        resourceChanges: { permission: -3 },
        specialEffects: ['view_next_3_turns'],
      }),
    },
  ],
};

// ============================================
// 防御方角色 - 骰子系 (DC)
// ============================================

const DC01_Stabilizer: Character = {
  id: 'DC01',
  name: '稳定器·概率锚',
  faction: 'defender',
  type: 'dice',
  difficulty: 2,
  description: '能够稳定概率波动，确保骰子结果可控',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 4, funds: 4, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DC01_S1',
      name: '概率锚定',
      type: 'passive',
      description: '骰子判定结果不会低于2',
      triggerCondition: '每次骰子判定',
      effect: () => ({
        success: true,
        message: '概率锚定！结果不会低于2',
        specialEffects: ['dice_min_2'],
      }),
    },
    {
      id: 'DC01_S2',
      name: '稳定检查',
      type: 'active',
      description: '重新掷一次骰子（取较高值）',
      triggerCondition: '骰子判定后',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '稳定检查！重新掷骰取高值',
        specialEffects: ['reroll_dice_take_higher'],
      }),
    },
    {
      id: 'DC01_S3',
      name: '绝对稳定',
      type: 'ultimate',
      description: '消耗3点权限，接下来3次判定结果锁定为4',
      triggerCondition: '安全等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '绝对稳定！接下来3次判定锁定为4',
        resourceChanges: { permission: -3 },
        specialEffects: ['lock_dice_at_4_for_3_turns'],
      }),
    },
  ],
};

const DC02_GuardianGoddess: Character = {
  id: 'DC02',
  name: '守护女神·骰子守护者',
  faction: 'defender',
  type: 'dice',
  difficulty: 2,
  description: '被守护女神眷顾，骰子总是保护她',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 3, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DC02_S1',
      name: '守护光环',
      type: 'passive',
      description: '骰子判定失败时，损失-1',
      triggerCondition: '骰子判定失败时',
      effect: () => ({
        success: true,
        message: '守护光环！损失减少',
        specialEffects: ['reduce_failure_loss_by_1'],
      }),
    },
    {
      id: 'DC02_S2',
      name: '命运守护',
      type: 'active',
      description: '大失败阈值+1（仅1视为大失败）',
      triggerCondition: '骰子判定前',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '命运守护！大失败阈值提高',
        specialEffects: ['critical_failure_threshold_1'],
      }),
    },
    {
      id: 'DC02_S3',
      name: '绝对守护',
      type: 'ultimate',
      description: '消耗3点权限，免疫下一次大失败',
      triggerCondition: '安全等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '绝对守护！免疫下一次大失败',
        resourceChanges: { permission: -3 },
        specialEffects: ['immune_next_critical_failure'],
      }),
    },
  ],
};

const DC03_RiskController: Character = {
  id: 'DC03',
  name: '风险控制师·稳定专家',
  faction: 'defender',
  type: 'dice',
  difficulty: 3,
  description: '精通风险管理，能够控制损失上限',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 4, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DC03_S1',
      name: '风险上限',
      type: 'passive',
      description: '每回合受到的最大损失不超过5',
      triggerCondition: '每次受到伤害时',
      effect: () => ({
        success: true,
        message: '风险上限！损失不超过5',
        specialEffects: ['max_loss_per_turn_5'],
      }),
    },
    {
      id: 'DC03_S2',
      name: '损失对冲',
      type: 'active',
      description: '支付2点资源，将50%损失转化为资源',
      triggerCondition: '受到伤害后',
      cooldown: 2,
      cost: { compute: 2 },
      effect: () => ({
        success: true,
        message: '损失对冲！50%损失转化为资源',
        specialEffects: ['convert_50_percent_loss_to_resources'],
      }),
    },
    {
      id: 'DC03_S3',
      name: '全面控制',
      type: 'ultimate',
      description: '消耗3点权限，下回合免疫所有损失',
      triggerCondition: '安全等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '全面控制！下回合免疫所有损失',
        resourceChanges: { permission: -3 },
        specialEffects: ['immune_all_loss_next_turn'],
      }),
    },
  ],
};

// ============================================
// 防御方角色 - 专属系 (DS)
// ============================================

const DS01_FortressBuilder: Character = {
  id: 'DS01',
  name: '堡垒构筑师·防御核心',
  faction: 'defender',
  type: 'special',
  difficulty: 4,
  description: '能够构筑坚不可摧的防御体系',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 3, funds: 6, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DS01_S1',
      name: '防御检索',
      type: 'passive',
      description: '抽卡时可以从牌库顶部3张中选择1张防御卡',
      triggerCondition: '每次抽卡',
      effect: () => ({
        success: true,
        message: '防御检索！从顶部3张中选择防御卡',
        specialEffects: ['choose_defense_from_top_3'],
      }),
    },
    {
      id: 'DS01_S2',
      name: '堡垒构筑',
      type: 'active',
      description: '弃置任意张手牌，抽取等量防御卡',
      triggerCondition: '摸牌阶段',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '堡垒构筑！可替换为防御卡',
        specialEffects: ['mulligan_to_defense_cards'],
      }),
    },
    {
      id: 'DS01_S3',
      name: '完美堡垒',
      type: 'ultimate',
      description: '消耗3点权限，从牌库中检索任意1张防御卡加入手牌',
      triggerCondition: '安全等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '完美堡垒！检索任意防御卡',
        resourceChanges: { permission: -3 },
        specialEffects: ['search_any_defense_card'],
      }),
    },
  ],
};

const DS02_EnergyShield: Character = {
  id: 'DS02',
  name: '资源守护者·能量护盾',
  faction: 'defender',
  type: 'special',
  difficulty: 3,
  description: '能够将资源转化为护盾，保护安全等级',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 5, funds: 6, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DS02_S1',
      name: '资源护盾',
      type: 'passive',
      description: '可以将资源转化为护盾值（1资源=2护盾）',
      triggerCondition: '任意阶段',
      effect: () => ({
        success: true,
        message: '资源护盾可用（1资源=2护盾）',
        specialEffects: ['resource_to_shield_1to2'],
      }),
    },
    {
      id: 'DS02_S2',
      name: '护盾共鸣',
      type: 'active',
      description: '恢复阶段获得护盾值=当前资源总量',
      triggerCondition: '恢复阶段',
      cooldown: 2,
      effect: (ctx) => {
        const totalResources = ctx.player.resources.compute + ctx.player.resources.funds + ctx.player.resources.information;
        return {
          success: true,
          message: `护盾共鸣！获得${totalResources}点护盾`,
          specialEffects: [`gain_shield_${totalResources}`],
        };
      },
    },
    {
      id: 'DS02_S3',
      name: '护盾爆发',
      type: 'ultimate',
      description: '消耗3点权限，将所有护盾转化为安全等级',
      triggerCondition: '安全等级≥30',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '护盾爆发！护盾转化为安全等级',
        resourceChanges: { permission: -3 },
        specialEffects: ['convert_shield_to_safety'],
      }),
    },
  ],
};

const DS03_AreaDefender: Character = {
  id: 'DS03',
  name: '区域防御者·阵地统帅',
  faction: 'defender',
  type: 'special',
  difficulty: 4,
  description: '精通区域防御与阵地控制',
  baseStats: {
    safetyLevel: 0,
    resources: { compute: 4, funds: 5, information: 3, permission: 0 },
    maxPermissions: 5,
  },
  skills: [
    {
      id: 'DS03_S1',
      name: '防御部署',
      type: 'passive',
      description: '控制区域时，该区域防御效果+1',
      triggerCondition: '控制任意区域时',
      effect: () => ({
        success: true,
        message: '防御部署！区域防御效果增强',
        specialEffects: ['area_defense_plus_1'],
      }),
    },
    {
      id: 'DS03_S2',
      name: '兵力调度',
      type: 'active',
      description: '移动区域内防御标记到其他区域',
      triggerCondition: '行动阶段',
      cooldown: 2,
      effect: () => ({
        success: true,
        message: '兵力调度！可移动防御标记',
        specialEffects: ['move_defense_tokens'],
      }),
    },
    {
      id: 'DS03_S3',
      name: '全面防御',
      type: 'ultimate',
      description: '消耗3点权限，所有区域防御标记翻倍',
      triggerCondition: '安全等级≥30，控制≥2区域',
      maxUses: 2,
      cost: { permission: 3 },
      effect: () => ({
        success: true,
        message: '全面防御！所有防御标记翻倍',
        resourceChanges: { permission: -3 },
        specialEffects: ['double_all_defense_tokens'],
      }),
    },
  ],
};

// ============================================
// 角色数据库
// ============================================

export const ALL_CHARACTERS: Character[] = [
  AR01_Gambler, AR02_MindReader, AR03_Deceiver,
  AC01_Probability, AC02_LuckyGoddess, AC03_RiskInvestor,
  AS01_DeckBuilder, AS02_ResourceManager, AS03_TacticalCommander,
  DR01_ShieldMaster, DR02_MirrorMaster, DR03_Prophet,
  DC01_Stabilizer, DC02_GuardianGoddess, DC03_RiskController,
  DS01_FortressBuilder, DS02_EnergyShield, DS03_AreaDefender,
];

// ============================================
// 角色系统类
// ============================================

export class CharacterSystem {
  private characters: Map<string, Character> = new Map();

  constructor() {
    ALL_CHARACTERS.forEach(char => {
      this.characters.set(char.id, char);
    });
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  getCharactersByFaction(faction: CharacterFaction): Character[] {
    return this.getAllCharacters().filter(c => c.faction === faction);
  }

  getCharactersByType(type: CharacterType): Character[] {
    return this.getAllCharacters().filter(c => c.type === type);
  }

  executeSkill(
    characterId: string,
    skillIndex: number,
    context: SkillContext
  ): SkillEffectResult {
    const character = this.getCharacter(characterId);
    if (!character) {
      return { success: false, message: `角色 ${characterId} 不存在` };
    }

    const skill = character.skills[skillIndex];
    if (!skill) {
      return { success: false, message: `技能索引 ${skillIndex} 无效` };
    }

    if (skill.cost) {
      const player = context.player;
      for (const [resource, cost] of Object.entries(skill.cost)) {
        const current = ((player.resources as unknown) as Record<string, number>)[resource] || 0;
        if (current < (cost || 0)) {
          return {
            success: false,
            message: `资源不足：${resource} 需要 ${cost}，当前 ${current}`,
          };
        }
      }
    }

    const result = skill.effect(context);
    
    if (result.success && skill.cost) {
      result.resourceChanges = {
        ...result.resourceChanges,
        ...Object.fromEntries(
          Object.entries(skill.cost).map(([k, v]) => [k, -(v || 0)])
        ),
      };
    }

    return result;
  }

  getCharacterBaseStats(characterId: string): Character['baseStats'] | null {
    const character = this.getCharacter(characterId);
    return character ? character.baseStats : null;
  }
}

export const characterSystem = new CharacterSystem();
export default characterSystem;
