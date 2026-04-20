/**
 * 《道高一丈：数字博弈》肉鸽选择系统
 * 实现科技树升级时的30选3机制
 * 
 * 规则参考: R5.1.1 科技树与肉鸽选择库
 */

import type { Faction } from '@/types/gameRules';
import { gameLogger } from './GameLogger';

// ============================================
// 类型定义
// ============================================

/**
 * 肉鸽选项稀有度
 */
export type RogueRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * 肉鸽选项效果类型
 */
export type RogueEffectType = 
  | 'resource_gain'      // 资源获得
  | 'resource_convert'   // 资源转换
  | 'draw_card'          // 抽卡
  | 'infiltration_boost' // 渗透提升
  | 'safety_boost'       // 安全提升
  | 'difficulty_modify'  // 难度修改
  | 'hand_limit'         // 手牌上限
  | 'action_point'       // 行动点
  | 'continuous'         // 持续效果
  | 'threat_mark'        // 威胁标记
  | 'defense_mark'       // 防御标记
  | 'card_effect'        // 卡牌效果增强
  | 'special';           // 特殊效果

/**
 * 肉鸽选项定义
 */
export interface RogueOption {
  id: string;
  name: string;
  description: string;
  rarity: RogueRarity;
  faction: Faction;
  techLevel: 1 | 2 | 3 | 4; // T1-T4
  effectType: RogueEffectType;
  effect: RogueEffect;
  duration: 'immediate' | 'turn' | 'round' | 'game';
}

/**
 * 肉鸽效果
 */
export interface RogueEffect {
  // 资源变化
  resourceChange?: Partial<Record<'computing' | 'funds' | 'information' | 'permission' | 'any', number>>;
  // 渗透/安全变化
  infiltrationChange?: number;
  safetyChange?: number;
  // 抽卡
  drawCount?: number;
  keepCount?: number;
  // 难度修改
  difficultyModifier?: number;
  // 手牌上限
  handLimitChange?: number;
  // 行动点
  actionPointChange?: number;
  // 特殊参数
  specialParams?: Record<string, any>;
}

/**
 * 肉鸽选择结果
 */
export interface RogueSelectionResult {
  selectedOption: RogueOption;
  applied: boolean;
  message: string;
  sideEffects?: string[];
}

/**
 * 肉鸽选择会话
 */
export interface RogueSelectionSession {
  playerId: string;
  faction: Faction;
  techLevel: 1 | 2 | 3 | 4;
  options: RogueOption[];
  selectedOptionId?: string;
  timestamp: number;
}

// ============================================
// 进攻方T1肉鸽选项库 (30个)
// ============================================

const ATTACKER_T1_OPTIONS: Omit<RogueOption, 'faction' | 'techLevel'>[] = [
  {
    id: 'ATK-R1-01',
    name: '算力爆发',
    description: '本回合算力+3',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { computing: 3 } },
    duration: 'turn',
  },
  {
    id: 'ATK-R1-02',
    name: '快速抽卡',
    description: '抽3张卡，保留2张',
    rarity: 'common',
    effectType: 'draw_card',
    effect: { drawCount: 3, keepCount: 2 },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-03',
    name: '零消耗史诗',
    description: '1张史诗卡本回合零消耗',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { freeEpicCard: 1 } },
    duration: 'turn',
  },
  {
    id: 'ATK-R1-04',
    name: '渗透加速',
    description: '本回合渗透+2',
    rarity: 'common',
    effectType: 'infiltration_boost',
    effect: { infiltrationChange: 2 },
    duration: 'turn',
  },
  {
    id: 'ATK-R1-05',
    name: '信息获取',
    description: '信息+2，查看对方1张手牌',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { information: 2 }, specialParams: { viewOpponentHand: 1 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-06',
    name: '资金补充',
    description: '资金+3',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { funds: 3 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-07',
    name: '判定优势',
    description: '本回合判定难度-1',
    rarity: 'common',
    effectType: 'difficulty_modify',
    effect: { difficultyModifier: -1 },
    duration: 'turn',
  },
  {
    id: 'ATK-R1-08',
    name: '连击启动',
    description: '下1张卡连击效果+1',
    rarity: 'common',
    effectType: 'card_effect',
    effect: { specialParams: { comboBonus: 1 } },
    duration: 'round',
  },
  {
    id: 'ATK-R1-09',
    name: '威胁标记',
    description: '在Perimeter区域放置1个威胁标记',
    rarity: 'common',
    effectType: 'threat_mark',
    effect: { specialParams: { region: 'perimeter', markCount: 1 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-10',
    name: '资源转换',
    description: '将2点算力转化为3点信息',
    rarity: 'common',
    effectType: 'resource_convert',
    effect: { resourceChange: { computing: -2, information: 3 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-11',
    name: '手牌扩充',
    description: '手牌上限+1，抽1张卡',
    rarity: 'rare',
    effectType: 'hand_limit',
    effect: { handLimitChange: 1, drawCount: 1 },
    duration: 'game',
  },
  {
    id: 'ATK-R1-12',
    name: '权限窃取',
    description: '尝试窃取对方1点权限（50%概率）',
    rarity: 'rare',
    effectType: 'resource_gain',
    effect: { specialParams: { stealPermissionChance: 0.5 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-13',
    name: '安全削弱',
    description: '对方安全-1',
    rarity: 'common',
    effectType: 'safety_boost',
    effect: { safetyChange: -1 },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-14',
    name: '行动延长',
    description: '本回合行动点+1',
    rarity: 'rare',
    effectType: 'action_point',
    effect: { actionPointChange: 1 },
    duration: 'turn',
  },
  {
    id: 'ATK-R1-15',
    name: '卡牌复制',
    description: '复制手牌中1张普通卡',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { copyCardRarity: 'common' } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-16',
    name: '区域渗透',
    description: 'DMZ区域渗透效果+1',
    rarity: 'common',
    effectType: 'continuous',
    effect: { specialParams: { regionBonus: { dmz: 1 } } },
    duration: 'game',
  },
  {
    id: 'ATK-R1-17',
    name: '恢复增强',
    description: '下回合算力恢复+1',
    rarity: 'common',
    effectType: 'continuous',
    effect: { specialParams: { nextTurnComputingRecovery: 1 } },
    duration: 'round',
  },
  {
    id: 'ATK-R1-18',
    name: '防御穿透',
    description: '下1张攻击卡无视1层防御',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { pierceDefense: 1 } },
    duration: 'round',
  },
  {
    id: 'ATK-R1-19',
    name: '资源储备',
    description: '下回合开始时资金+2',
    rarity: 'common',
    effectType: 'continuous',
    effect: { specialParams: { nextTurnFunds: 2 } },
    duration: 'round',
  },
  {
    id: 'ATK-R1-20',
    name: '信息战',
    description: '对方信息-1，己方信息+1',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { information: 1 }, specialParams: { opponentInfoMinus: 1 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-21',
    name: '快速部署',
    description: '本回合出牌消耗-1（最少为1）',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { costReduction: 1, minCost: 1 } },
    duration: 'turn',
  },
  {
    id: 'ATK-R1-22',
    name: '威胁扩散',
    description: '在所有区域各放置1个威胁标记（共4个）',
    rarity: 'epic',
    effectType: 'threat_mark',
    effect: { specialParams: { allRegions: true, markCount: 1 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-23',
    name: '算力透支',
    description: '立即获得算力+4，下回合算力恢复-1',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { computing: 4 }, specialParams: { nextTurnComputingRecovery: -1 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-24',
    name: '情报网络',
    description: '查看对方牌库顶2张卡',
    rarity: 'common',
    effectType: 'special',
    effect: { specialParams: { viewDeckTop: 2 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-25',
    name: '渗透基础',
    description: '渗透+1，抽1张卡',
    rarity: 'common',
    effectType: 'infiltration_boost',
    effect: { infiltrationChange: 1, drawCount: 1 },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-26',
    name: '攻击准备',
    description: '下1张攻击卡效果+1',
    rarity: 'common',
    effectType: 'card_effect',
    effect: { specialParams: { nextAttackBonus: 1 } },
    duration: 'round',
  },
  {
    id: 'ATK-R1-27',
    name: '资源调配',
    description: '将任意2点资源转化为2点其他资源',
    rarity: 'common',
    effectType: 'resource_convert',
    effect: { specialParams: { convertAny: 2, targetAmount: 2 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-28',
    name: '紧急补给',
    description: '获得算力+1,信息+1,资金+1',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { computing: 1, information: 1, funds: 1 } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-29',
    name: '战术调整',
    description: '弃2张手牌，抽3张卡',
    rarity: 'common',
    effectType: 'draw_card',
    effect: { specialParams: { discardCount: 2 }, drawCount: 3 },
    duration: 'immediate',
  },
  {
    id: 'ATK-R1-30',
    name: '初露锋芒',
    description: '若本回合渗透≥5，则额外渗透+2',
    rarity: 'rare',
    effectType: 'infiltration_boost',
    effect: { specialParams: { condition: { infiltrationThisTurn: 5 }, bonus: 2 } },
    duration: 'turn',
  },
];

// ============================================
// 进攻方T2肉鸽选项库 (30个)
// ============================================

const ATTACKER_T2_OPTIONS: Omit<RogueOption, 'faction' | 'techLevel'>[] = [
  {
    id: 'ATK-R2-01',
    name: '区域控制强化',
    description: '区域控制效果持续时间+1回合',
    rarity: 'rare',
    effectType: 'continuous',
    effect: { specialParams: { regionControlDuration: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-02',
    name: '行动点扩充',
    description: '下回合行动点+1',
    rarity: 'rare',
    effectType: 'action_point',
    effect: { actionPointChange: 1 },
    duration: 'round',
  },
  {
    id: 'ATK-R2-03',
    name: '手牌复制',
    description: '复制1张手牌（任意稀有度）',
    rarity: 'epic',
    effectType: 'card_effect',
    effect: { specialParams: { copyAnyCard: true } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R2-04',
    name: '渗透强化',
    description: '每回合渗透+1（持续效果）',
    rarity: 'rare',
    effectType: 'infiltration_boost',
    effect: { infiltrationChange: 1 },
    duration: 'game',
  },
  {
    id: 'ATK-R2-05',
    name: '算力恢复增强',
    description: '每回合算力恢复+1',
    rarity: 'rare',
    effectType: 'continuous',
    effect: { specialParams: { computingRecoveryBonus: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-06',
    name: '判定优势持续',
    description: '判定难度-1（本局持续）',
    rarity: 'epic',
    effectType: 'difficulty_modify',
    effect: { difficultyModifier: -1 },
    duration: 'game',
  },
  {
    id: 'ATK-R2-07',
    name: '连击大师',
    description: '连击加成上限提升至+2',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { comboMaxBonus: 2 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-08',
    name: '威胁增殖',
    description: '每回合在Perimeter区域放置1个威胁标记',
    rarity: 'epic',
    effectType: 'threat_mark',
    effect: { specialParams: { autoThreatPerimeter: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-09',
    name: '资源获取',
    description: '每回合资金+1',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { funds: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-10',
    name: '信息优势',
    description: '每回合信息+1',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { resourceChange: { information: 1 } },
    duration: 'game',
  },
  // ... 继续添加T2剩余20个选项
  {
    id: 'ATK-R2-11',
    name: '高级抽卡',
    description: '抽2张卡，其中至少1张稀有或更高',
    rarity: 'rare',
    effectType: 'draw_card',
    effect: { drawCount: 2, specialParams: { minRarity: 'rare' } },
    duration: 'immediate',
  },
  {
    id: 'ATK-R2-12',
    name: '权限积累',
    description: '权限上限+1，当前权限+1',
    rarity: 'rare',
    effectType: 'resource_gain',
    effect: { resourceChange: { permission: 1 }, specialParams: { permissionLimitBonus: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-13',
    name: '安全压制',
    description: '对方每回合安全-1',
    rarity: 'epic',
    effectType: 'safety_boost',
    effect: { safetyChange: -1 },
    duration: 'game',
  },
  {
    id: 'ATK-R2-14',
    name: '史诗折扣',
    description: '史诗卡消耗-1（最少为1）',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { epicCostReduction: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-15',
    name: '渗透爆发',
    description: '渗透等级≥30时，每回合额外渗透+1',
    rarity: 'epic',
    effectType: 'infiltration_boost',
    effect: { specialParams: { threshold: 30, bonus: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-16',
    name: '区域优势',
    description: 'ICS区域控制时，渗透+2',
    rarity: 'rare',
    effectType: 'continuous',
    effect: { specialParams: { icsControlBonus: 2 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-17',
    name: '亡语增强',
    description: '你的亡语卡效果+1',
    rarity: 'rare',
    effectType: 'card_effect',
    effect: { specialParams: { deathrattleBonus: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-18',
    name: '光环扩展',
    description: '光环卡效果范围扩展至相邻区域',
    rarity: 'epic',
    effectType: 'card_effect',
    effect: { specialParams: { auraRangeExtend: true } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-19',
    name: '资源循环',
    description: '使用卡牌后50%概率返还1点资源',
    rarity: 'rare',
    effectType: 'resource_gain',
    effect: { specialParams: { resourceRefundChance: 0.5 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-20',
    name: '判定保险',
    description: '判定失败时50%概率不重投',
    rarity: 'rare',
    effectType: 'difficulty_modify',
    effect: { specialParams: { failRerollChance: 0.5 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-21',
    name: '手牌保护',
    description: '手牌上限+2',
    rarity: 'rare',
    effectType: 'hand_limit',
    effect: { handLimitChange: 2 },
    duration: 'game',
  },
  {
    id: 'ATK-R2-22',
    name: '威胁强化',
    description: '威胁标记效果+1',
    rarity: 'rare',
    effectType: 'threat_mark',
    effect: { specialParams: { threatMarkBonus: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-23',
    name: '快速渗透',
    description: '使用消耗≥3的卡牌后，渗透+1',
    rarity: 'common',
    effectType: 'infiltration_boost',
    effect: { specialParams: { highCostBonus: { threshold: 3, infiltration: 1 } } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-24',
    name: '信息窃取',
    description: '每回合有30%概率窃取对方1信息',
    rarity: 'rare',
    effectType: 'resource_gain',
    effect: { specialParams: { stealInfoChance: 0.3 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-25',
    name: '资金流转',
    description: '每有5点资金，算力+1',
    rarity: 'common',
    effectType: 'resource_gain',
    effect: { specialParams: { fundsToComputing: { ratio: 5 } } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-26',
    name: '传说之路',
    description: '传说卡出现概率+5%',
    rarity: 'epic',
    effectType: 'card_effect',
    effect: { specialParams: { legendaryChanceBonus: 0.05 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-27',
    name: '防御瓦解',
    description: '对方防御标记效果-1',
    rarity: 'rare',
    effectType: 'defense_mark',
    effect: { specialParams: { defenseMarkReduction: 1 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-28',
    name: '连击连锁',
    description: '连击触发时，有30%概率再次触发',
    rarity: 'epic',
    effectType: 'card_effect',
    effect: { specialParams: { comboChainChance: 0.3 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-29',
    name: '紧急权限',
    description: '权限为0时，有50%概率获得1点',
    rarity: 'rare',
    effectType: 'resource_gain',
    effect: { specialParams: { emergencyPermissionChance: 0.5 } },
    duration: 'game',
  },
  {
    id: 'ATK-R2-30',
    name: '终极准备',
    description: 'T4卡消耗-1',
    rarity: 'epic',
    effectType: 'card_effect',
    effect: { specialParams: { t4CostReduction: 1 } },
    duration: 'game',
  },
];

// ============================================
// 肉鸽选择系统类
// ============================================

export class RogueSelectionSystem {
  private activeSessions: Map<string, RogueSelectionSession> = new Map();
  private selectedOptions: Map<string, RogueOption[]> = new Map(); // playerId -> 已选择的选项

  /**
   * 生成肉鸽选项
   * @param faction 阵营
   * @param techLevel 科技等级 (1-4)
   * @returns 随机抽取的3个选项
   */
  generateOptions(faction: Faction, techLevel: 1 | 2 | 3 | 4): RogueOption[] {
    const sourceOptions = this.getSourceOptions(faction, techLevel);
    
    // 随机抽取3个不同的选项
    const shuffled = [...sourceOptions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    
    // 添加完整信息
    return selected.map(opt => ({
      ...opt,
      faction,
      techLevel,
    }));
  }

  /**
   * 获取源选项库
   */
  private getSourceOptions(faction: Faction, techLevel: 1 | 2 | 3 | 4): Omit<RogueOption, 'faction' | 'techLevel'>[] {
    if (faction === 'attacker') {
      switch (techLevel) {
        case 1: return ATTACKER_T1_OPTIONS;
        case 2: return ATTACKER_T2_OPTIONS;
        // TODO: 添加T3和T4选项
        default: return ATTACKER_T1_OPTIONS;
      }
    } else {
      // TODO: 添加防御方选项
      return ATTACKER_T1_OPTIONS; // 临时使用进攻方选项
    }
  }

  /**
   * 创建选择会话
   */
  createSession(playerId: string, faction: Faction, techLevel: 1 | 2 | 3 | 4): RogueSelectionSession {
    const options = this.generateOptions(faction, techLevel);
    
    const session: RogueSelectionSession = {
      playerId,
      faction,
      techLevel,
      options,
      timestamp: Date.now(),
    };
    
    this.activeSessions.set(playerId, session);
    
    gameLogger.info(
      'ai_action',
      `创建肉鸽选择会话`,
      {
        extra: { playerId, techLevel, options: options.map(o => o.id) },
      }
    );
    
    return session;
  }

  /**
   * 选择选项
   */
  selectOption(playerId: string, optionId: string): RogueSelectionResult | null {
    const session = this.activeSessions.get(playerId);
    if (!session) {
      gameLogger.warn(
        'ai_action',
        `未找到活跃会话`,
        { extra: { playerId } }
      );
      return null;
    }

    const option = session.options.find(o => o.id === optionId);
    if (!option) {
      gameLogger.warn(
        'ai_action',
        `无效选项ID`,
        { extra: { playerId, optionId } }
      );
      return null;
    }

    // 记录选择
    session.selectedOptionId = optionId;
    
    const playerSelections = this.selectedOptions.get(playerId) || [];
    playerSelections.push(option);
    this.selectedOptions.set(playerId, playerSelections);
    
    // 清理会话
    this.activeSessions.delete(playerId);

    gameLogger.info(
      'ai_action',
      `玩家选择肉鸽选项`,
      {
        extra: { playerId, optionId: option.id, optionName: option.name },
      }
    );

    return {
      selectedOption: option,
      applied: true,
      message: `已选择: ${option.name}`,
    };
  }

  /**
   * 获取玩家已选择的所有选项
   */
  getPlayerSelections(playerId: string): RogueOption[] {
    return this.selectedOptions.get(playerId) || [];
  }

  /**
   * 获取持续生效的效果
   */
  getContinuousEffects(playerId: string): RogueEffect[] {
    const selections = this.getPlayerSelections(playerId);
    return selections
      .filter(opt => opt.duration === 'game')
      .map(opt => opt.effect);
  }

  /**
   * 清理玩家数据
   */
  clearPlayerData(playerId: string): void {
    this.activeSessions.delete(playerId);
    this.selectedOptions.delete(playerId);
  }

  /**
   * 清理所有数据
   */
  clearAll(): void {
    this.activeSessions.clear();
    this.selectedOptions.clear();
  }
}

// 导出单例实例
export const rogueSelectionSystem = new RogueSelectionSystem();
