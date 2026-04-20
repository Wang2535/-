/**
 * 《道高一丈：数字博弈》v16.0 - 科技树抽卡概率系统
 * 
 * 实现规则文档 R5.3 科技树抽卡概率系统（金铲铲之战机制）
 * 
 * 核心功能：
 * 1. 根据科技树等级动态调整抽卡概率
 * 2. 卡池解锁规则（T0-T5对应不同卡池范围）
 * 3. 特殊抽卡机制（保底、天选之人、幸运加成）
 * 4. 抽卡历史追踪（用于保底机制）
 */

import type { 
  TechLevel, 
  CardRarity,
  Faction 
} from '@/types';
import { 
  DRAW_PROBABILITIES, 
  CARD_POOL_UNLOCK,
  SPECIAL_DRAW_MECHANICS 
} from '@/types/gameRules';
import { 
  ATTACKER_CARDS, 
  DEFENDER_CARDS, 
  type Card as DatabaseCard
} from './CardDatabase';

/**
 * 抽卡结果
 */
export interface DrawResult {
  cardId: string;
  rarity: CardRarity;
  techLevel: TechLevel;
  isPityTriggered: boolean;
  isFirstT3Legendary: boolean;
  card?: DatabaseCard;  // 完整的卡牌数据
}

/**
 * 玩家抽卡状态
 */
interface PlayerDrawState {
  consecutiveNormalDraws: number;  // 连续普通抽卡次数（用于保底）
  hasReceivedFirstT3Legendary: boolean;  // 是否已获得首次T3传说卡
  drawHistory: DrawResult[];  // 抽卡历史
  currentTechLevel: TechLevel | null;  // 当前科技等级（用于检测升级）
  pityGuaranteeActive: boolean;  // 保底机制是否已激活（下次必出史诗/传说）
  lastDrawTurn: number;  // 上次抽卡回合（用于卡池刷新）
}

/**
 * 保底系统统计
 */
export interface PitySystemStats {
  currentPityCount: number;      // 当前保底计数
  pityThreshold: number;         // 保底阈值
  nextPityIn: number;            // 距离下次保底还有几次
  pityGuaranteeActive: boolean;  // 保底是否已激活
  totalDraws: number;            // 总抽卡次数
  highRarityDraws: number;       // 高稀有度抽卡次数（史诗+传说）
}

/**
 * 科技树抽卡系统
 */
export class TechTreeDrawSystem {
  // 玩家抽卡状态映射
  private static playerDrawStates: Map<string, PlayerDrawState> = new Map();
  
  // 卡牌数据库（按阵营和稀有度分类）- 预留用于未来扩展
  // private static cardDatabase: Map<Faction, Map<CardRarity, CardDefinition[]>> = new Map();
  


  /**
   * 初始化玩家抽卡状态
   */
  static initPlayerDrawState(playerId: string): void {
    this.playerDrawStates.set(playerId, {
      consecutiveNormalDraws: 0,
      hasReceivedFirstT3Legendary: false,
      drawHistory: [],
      currentTechLevel: null,
      pityGuaranteeActive: false,
      lastDrawTurn: 0
    });
  }

  /**
   * 卡池刷新 - 每回合开始时调用（R5.3.5规则）
   * 根据当前科技等级重新计算概率
   * 
   * @param playerId 玩家ID
   * @param currentTurn 当前回合数
   * @param techLevel 当前科技等级
   * @returns 是否触发了科技等级升级（用于天选之人判定）
   */
  static refreshCardPool(
    playerId: string,
    currentTurn: number,
    techLevel: TechLevel
  ): { upgraded: boolean; previousLevel: TechLevel | null } {
    let playerState = this.playerDrawStates.get(playerId);
    if (!playerState) {
      this.initPlayerDrawState(playerId);
      playerState = this.playerDrawStates.get(playerId)!;
    }

    const previousLevel = playerState.currentTechLevel;
    const upgraded = previousLevel !== null && this.isTechLevelUpgraded(previousLevel, techLevel);

    // 更新科技等级和回合
    playerState.currentTechLevel = techLevel;
    playerState.lastDrawTurn = currentTurn;

    return { upgraded, previousLevel };
  }

  /**
   * 检查科技等级是否升级
   */
  private static isTechLevelUpgraded(previous: TechLevel, current: TechLevel): boolean {
    const levels: TechLevel[] = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];
    return levels.indexOf(current) > levels.indexOf(previous);
  }

  /**
   * 检查是否触发天选之人（首次达到T3时）
   */
  private static checkChosenOne(
    techLevel: TechLevel,
    previousLevel: TechLevel | null,
    playerState: PlayerDrawState
  ): boolean {
    // 必须是首次达到T3
    if (techLevel !== 'T3') return false;
    if (playerState.hasReceivedFirstT3Legendary) return false;
    
    // 检查是否是从T2升级上来的
    if (previousLevel === 'T2' || previousLevel === null) {
      return SPECIAL_DRAW_MECHANICS.firstT3Legendary;
    }
    
    return false;
  }

  /**
   * 获取玩家当前科技树等级
   */
  static getCurrentTechLevel(infiltrationLevel: number, safetyLevel: number, faction: Faction): TechLevel {
    const level = faction === 'attacker' ? infiltrationLevel : safetyLevel;
    
    if (level >= 75) return 'T5';
    if (level >= 60) return 'T4';
    if (level >= 45) return 'T3';
    if (level >= 30) return 'T2';
    if (level >= 15) return 'T1';
    return 'T0';
  }

  /**
   * 计算实际抽卡概率（考虑幸运加成）
   */
  private static calculateActualProbabilities(
    techLevel: TechLevel, 
    hasLuckyEffect: boolean
  ): Record<CardRarity, number> {
    const baseProbs = DRAW_PROBABILITIES[techLevel];
    const luckyBonus = hasLuckyEffect ? SPECIAL_DRAW_MECHANICS.luckyBonus : 0;
    
    // 传说卡概率增加，其他概率相应减少
    const legendaryProb = Math.min(baseProbs.legendary + luckyBonus, 0.5); // 最高50%
    const remainingProb = 1 - legendaryProb;
    
    // 按比例分配剩余概率
    const totalBaseRemaining = baseProbs.common + baseProbs.rare + baseProbs.epic;
    const scaleFactor = totalBaseRemaining > 0 ? remainingProb / totalBaseRemaining : 0;
    
    return {
      common: baseProbs.common * scaleFactor,
      rare: baseProbs.rare * scaleFactor,
      epic: baseProbs.epic * scaleFactor,
      legendary: legendaryProb
    };
  }

  /**
   * 检查是否触发保底机制
   */
  private static checkPityMechanism(playerState: PlayerDrawState): boolean {
    return playerState.consecutiveNormalDraws >= SPECIAL_DRAW_MECHANICS.pityThreshold;
  }

  /**
   * 根据概率抽取稀有度
   */
  private static drawRarity(probabilities: Record<CardRarity, number>): CardRarity {
    const random = Math.random();
    let cumulative = 0;
    
    const rarities: CardRarity[] = ['legendary', 'epic', 'rare', 'common'];
    
    for (const rarity of rarities) {
      cumulative += probabilities[rarity];
      if (random <= cumulative) {
        return rarity;
      }
    }
    
    return 'common'; // 默认返回普通
  }

  /**
   * 获取可抽取的卡池范围
   */
  private static getCardPoolRange(techLevel: TechLevel): { minTech: TechLevel; maxTech: TechLevel } {
    return CARD_POOL_UNLOCK[techLevel];
  }

  /**
   * 从卡牌ID推断科技等级
   */
  private static inferTechLevelFromId(cardId: string): TechLevel {
    // 从ID中提取数字部分 (如 ATK001 -> 1, DEF048 -> 48)
    const match = cardId.match(/\d+/);
    if (!match) return 'T0';
    
    const num = parseInt(match[0], 10);
    
    // 根据编号范围推断科技等级
    if (num >= 41) return 'T5';  // 041-048: T5
    if (num >= 33) return 'T4';  // 033-040: T4
    if (num >= 25) return 'T3';  // 025-032: T3
    if (num >= 17) return 'T2';  // 017-024: T2
    if (num >= 9) return 'T1';   // 009-016: T1
    return 'T0';                  // 001-008: T0
  }

  /**
   * 从卡池中随机抽取一张卡牌（使用真实卡牌数据库）
   */
  private static drawCardFromPool(
    faction: Faction,
    rarity: CardRarity,
    minTech: TechLevel,
    maxTech: TechLevel
  ): { cardId: string; techLevel: TechLevel; card: DatabaseCard } | null {
    // 获取对应阵营的卡牌数据库
    const cardDatabase = faction === 'attacker' ? ATTACKER_CARDS : DEFENDER_CARDS;
    
    // 获取指定科技等级范围内的所有卡牌
    const techLevels: TechLevel[] = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];
    const minIndex = techLevels.indexOf(minTech);
    const maxIndex = techLevels.indexOf(maxTech);
    
    const availableCards: { cardId: string; techLevel: TechLevel; rarity: CardRarity; card: DatabaseCard }[] = [];
    
    // 遍历所有卡牌，筛选符合条件的
    for (const card of cardDatabase) {
      const cardTechLevel = this.inferTechLevelFromId(card.id);
      const techIndex = techLevels.indexOf(cardTechLevel);
      
      // 检查科技等级是否在范围内
      if (techIndex >= minIndex && techIndex <= maxIndex) {
        // 检查稀有度是否匹配
        if (card.rarity === rarity) {
          availableCards.push({
            cardId: card.code,
            techLevel: cardTechLevel,
            rarity: card.rarity as CardRarity,
            card
          });
        }
      }
    }
    
    if (availableCards.length === 0) return null;
    
    // 随机选择一张
    const selected = availableCards[Math.floor(Math.random() * availableCards.length)];
    return { 
      cardId: selected.cardId, 
      techLevel: selected.techLevel,
      card: selected.card
    };
  }

  /**
   * 执行抽卡（增强版，支持完整保底机制）
   * 
   * @param playerId 玩家ID
   * @param faction 阵营
   * @param infiltrationLevel 渗透等级
   * @param safetyLevel 安全等级
   * @param hasLuckyEffect 是否有幸运加成
   * @param previousLevel 之前的科技等级（用于天选之人判定）
   * @returns 抽卡结果
   */
  static drawCard(
    playerId: string,
    faction: Faction,
    infiltrationLevel: number,
    safetyLevel: number,
    hasLuckyEffect: boolean = false,
    previousLevel: TechLevel | null = null
  ): DrawResult {
    // 获取或初始化玩家状态
    let playerState = this.playerDrawStates.get(playerId);
    if (!playerState) {
      this.initPlayerDrawState(playerId);
      playerState = this.playerDrawStates.get(playerId)!;
    }
    
    // 获取当前科技树等级
    const techLevel = this.getCurrentTechLevel(infiltrationLevel, safetyLevel, faction);
    
    // 检查天选之人（首次达到T3时）
    const isFirstT3Legendary = this.checkChosenOne(techLevel, previousLevel, playerState);
    
    // 检查保底机制（连续10次未出史诗/传说）
    const isPityTriggered = playerState.pityGuaranteeActive || 
                           this.checkPityMechanism(playerState);
    
    let rarity: CardRarity;
    
    if (isFirstT3Legendary) {
      // 天选之人必定传说
      rarity = 'legendary';
      playerState.hasReceivedFirstT3Legendary = true;
    } else if (isPityTriggered) {
      // 保底必定史诗或传说（50%概率传说）
      rarity = Math.random() < 0.5 ? 'legendary' : 'epic';
      playerState.consecutiveNormalDraws = 0;
      playerState.pityGuaranteeActive = false;  // 重置保底激活状态
    } else {
      // 正常抽卡
      const probabilities = this.calculateActualProbabilities(techLevel, hasLuckyEffect);
      rarity = this.drawRarity(probabilities);
      
      // 更新连续普通抽卡计数和保底状态
      if (rarity === 'common' || rarity === 'rare') {
        playerState.consecutiveNormalDraws++;
        // 检查是否达到保底阈值
        if (playerState.consecutiveNormalDraws >= SPECIAL_DRAW_MECHANICS.pityThreshold) {
          playerState.pityGuaranteeActive = true;
        }
      } else {
        // 抽到史诗或传说，重置计数
        playerState.consecutiveNormalDraws = 0;
        playerState.pityGuaranteeActive = false;
      }
    }
    
    // 获取卡池范围
    const { minTech, maxTech } = this.getCardPoolRange(techLevel);
    
    // 从卡池抽取
    const drawResult = this.drawCardFromPool(faction, rarity, minTech, maxTech);
    
    if (!drawResult) {
      // 如果指定稀有度没有卡牌，降级抽取
      const fallbackRarities: CardRarity[] = ['epic', 'rare', 'common'];
      for (const fallbackRarity of fallbackRarities) {
        const fallback = this.drawCardFromPool(faction, fallbackRarity, minTech, maxTech);
        if (fallback) {
          rarity = fallbackRarity;
          break;
        }
      }
    }
    
    const result: DrawResult = {
      cardId: drawResult?.cardId || `${faction === 'attacker' ? 'ATK' : 'DEF'}001`,
      rarity,
      techLevel: drawResult?.techLevel || techLevel,
      isPityTriggered,
      isFirstT3Legendary,
      card: drawResult?.card
    };
    
    // 记录抽卡历史
    playerState.drawHistory.push(result);
    
    return result;
  }

  /**
   * 获取保底系统统计信息
   */
  static getPitySystemStats(playerId: string): PitySystemStats | null {
    const playerState = this.playerDrawStates.get(playerId);
    if (!playerState) return null;

    const highRarityDraws = playerState.drawHistory.filter(
      d => d.rarity === 'epic' || d.rarity === 'legendary'
    ).length;

    return {
      currentPityCount: playerState.consecutiveNormalDraws,
      pityThreshold: SPECIAL_DRAW_MECHANICS.pityThreshold,
      nextPityIn: Math.max(0, SPECIAL_DRAW_MECHANICS.pityThreshold - playerState.consecutiveNormalDraws),
      pityGuaranteeActive: playerState.pityGuaranteeActive,
      totalDraws: playerState.drawHistory.length,
      highRarityDraws
    };
  }

  /**
   * 批量抽卡（支持完整保底机制）
   */
  static drawMultipleCards(
    playerId: string,
    faction: Faction,
    infiltrationLevel: number,
    safetyLevel: number,
    count: number,
    hasLuckyEffect: boolean = false,
    previousLevel: TechLevel | null = null
  ): DrawResult[] {
    const results: DrawResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const result = this.drawCard(
        playerId,
        faction,
        infiltrationLevel,
        safetyLevel,
        hasLuckyEffect,
        previousLevel
      );
      results.push(result);
      
      // 只有第一次抽卡需要考虑天选之人
      previousLevel = null;
    }
    
    return results;
  }

  /**
   * 获取抽卡统计信息
   */
  static getDrawStatistics(playerId: string): {
    totalDraws: number;
    rarityDistribution: Record<CardRarity, number>;
    pityCounter: number;
    nextPityIn: number;
  } | null {
    const playerState = this.playerDrawStates.get(playerId);
    if (!playerState) return null;
    
    const distribution: Record<CardRarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };
    
    for (const draw of playerState.drawHistory) {
      distribution[draw.rarity]++;
    }
    
    return {
      totalDraws: playerState.drawHistory.length,
      rarityDistribution: distribution,
      pityCounter: playerState.consecutiveNormalDraws,
      nextPityIn: Math.max(0, SPECIAL_DRAW_MECHANICS.pityThreshold - playerState.consecutiveNormalDraws)
    };
  }

  /**
   * 重置玩家抽卡状态
   */
  static resetPlayerDrawState(playerId: string): void {
    this.playerDrawStates.delete(playerId);
  }

  /**
   * 获取当前科技等级的抽卡概率（用于UI显示）
   */
  static getDrawProbabilitiesForDisplay(
    techLevel: TechLevel,
    hasLuckyEffect: boolean = false
  ): { rarity: CardRarity; probability: number; color: string }[] {
    const probs = this.calculateActualProbabilities(techLevel, hasLuckyEffect);
    
    return [
      { rarity: 'common', probability: Math.round(probs.common * 100), color: '#9CA3AF' },
      { rarity: 'rare', probability: Math.round(probs.rare * 100), color: '#3B82F6' },
      { rarity: 'epic', probability: Math.round(probs.epic * 100), color: '#A855F7' },
      { rarity: 'legendary', probability: Math.round(probs.legendary * 100), color: '#EAB308' }
    ];
  }
}

export default TechTreeDrawSystem;
