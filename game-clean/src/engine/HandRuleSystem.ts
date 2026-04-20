/**
 * 手牌规则系统 (R4.3)
 * 
 * 实现完善的游戏规则.md中R4.3手牌规则：
 * - 初始手牌：4张
 * - 手牌上限：3张（1-6回合为2张）
 * - 抽牌数：每回合4张
 * - 弃牌规则：回合结束时，手牌超过上限必须弃至上限
 * 
 * 文档版本: v1.0.0
 * 最后更新: 2026-02-06
 */

import type { Card } from '@/types/legacy/game';
import { gameLogger } from './GameLogger';

// ============================================
// 手牌规则配置
// ============================================

/** 手牌规则配置 */
export const HAND_RULE_CONFIG = {
  /** 初始手牌数量 */
  INITIAL_HAND_SIZE: 4,
  
  /** 手牌上限（7回合以后） */
  MAX_HAND_SIZE_NORMAL: 3,
  
  /** 手牌上限（1-6回合） */
  MAX_HAND_SIZE_EARLY: 2,
  
  /** 早期回合阈值 */
  EARLY_GAME_TURN_THRESHOLD: 6,
  
  /** 每回合抽牌数 */
  CARDS_PER_DRAW: 4,
  
  /** 最小手牌数（防止负数） */
  MIN_HAND_SIZE: 0,
} as const;

// ============================================
// 类型定义
// ============================================

/** 手牌状态 */
export interface HandState {
  /** 当前手牌 */
  cards: Card[];
  /** 当前手牌数量 */
  count: number;
  /** 当前手牌上限 */
  maxSize: number;
  /** 是否需要弃牌 */
  needsDiscard: boolean;
  /** 需要弃置的牌数 */
  discardCount: number;
}

/** 抽牌结果 */
export interface HandDrawResult {
  /** 是否成功 */
  success: boolean;
  /** 抽到的卡牌 */
  drawnCards: Card[];
  /** 抽牌后的手牌数量 */
  newHandSize: number;
  /** 消息 */
  message: string;
}

/** 弃牌结果 */
export interface DiscardResult {
  /** 是否成功 */
  success: boolean;
  /** 弃置的卡牌 */
  discardedCards: Card[];
  /** 弃牌后的手牌 */
  remainingHand: Card[];
  /** 消息 */
  message: string;
}

/** 手牌规则检查结果 */
export interface HandRuleCheckResult {
  /** 是否合法 */
  isValid: boolean;
  /** 当前手牌数 */
  currentCount: number;
  /** 手牌上限 */
  maxAllowed: number;
  /** 超出数量 */
  excessCount: number;
  /** 错误消息 */
  errorMessage?: string;
}

// ============================================
// 手牌规则系统
// ============================================

export class HandRuleSystem {
  /**
   * 获取当前回合的手牌上限
   * @param currentTurn 当前回合数
   */
  static getMaxHandSize(currentTurn: number): number {
    return currentTurn <= HAND_RULE_CONFIG.EARLY_GAME_TURN_THRESHOLD
      ? HAND_RULE_CONFIG.MAX_HAND_SIZE_EARLY
      : HAND_RULE_CONFIG.MAX_HAND_SIZE_NORMAL;
  }

  /**
   * 检查手牌是否超过上限
   * @param handSize 当前手牌数量
   * @param currentTurn 当前回合数
   */
  static checkHandSizeLimit(handSize: number, currentTurn: number): HandRuleCheckResult {
    const maxAllowed = this.getMaxHandSize(currentTurn);
    const excessCount = Math.max(0, handSize - maxAllowed);
    
    const result: HandRuleCheckResult = {
      isValid: handSize <= maxAllowed,
      currentCount: handSize,
      maxAllowed,
      excessCount,
    };

    if (!result.isValid) {
      result.errorMessage = `手牌超过上限！当前${handSize}张，上限${maxAllowed}张，需要弃置${excessCount}张`;
    }

    return result;
  }

  /**
   * 计算抽牌数量
   * @param currentHandSize 当前手牌数量
   * @param currentTurn 当前回合数
   * @param deckSize 牌库剩余数量
   */
  static calculateDrawCount(
    currentHandSize: number,
    currentTurn: number,
    deckSize: number
  ): number {
    const maxHandSize = this.getMaxHandSize(currentTurn);
    const availableSpace = maxHandSize - currentHandSize;
    
    // 如果手牌已满，不抽牌
    if (availableSpace <= 0) {
      return 0;
    }

    // 正常情况下抽4张，但不超过手牌上限和牌库数量
    const desiredDraw = HAND_RULE_CONFIG.CARDS_PER_DRAW;
    const actualDraw = Math.min(desiredDraw, availableSpace, deckSize);

    gameLogger.info('card_drawn', `计算抽牌数量: 期望${desiredDraw}张, 实际可抽${actualDraw}张`, {
      extra: {
        currentHandSize,
        maxHandSize,
        availableSpace,
        deckSize,
        desiredDraw,
        actualDraw,
      }
    });

    return actualDraw;
  }

  /**
   * 执行抽牌
   * @param currentHand 当前手牌
   * @param deck 牌库
   * @param currentTurn 当前回合数
   * @param count 指定抽牌数量（可选，默认按规则计算）
   */
  static drawCards(
    currentHand: Card[],
    deck: Card[],
    currentTurn: number,
    count?: number
  ): HandDrawResult {
    const drawCount = count ?? this.calculateDrawCount(
      currentHand.length,
      currentTurn,
      deck.length
    );

    if (drawCount === 0) {
      return {
        success: true,
        drawnCards: [],
        newHandSize: currentHand.length,
        message: '手牌已满，无需抽牌',
      };
    }

    if (deck.length < drawCount) {
      gameLogger.warn('card_drawn', `牌库不足！需要${drawCount}张，剩余${deck.length}张`);
      return {
        success: false,
        drawnCards: [],
        newHandSize: currentHand.length,
        message: `牌库不足！需要${drawCount}张，剩余${deck.length}张`,
      };
    }

    // 从牌库顶部抽取指定数量的牌
    const drawnCards = deck.slice(0, drawCount);
    const newHand = [...currentHand, ...drawnCards];

    gameLogger.info('card_drawn', `成功抽取${drawCount}张卡牌`, {
      extra: {
        drawnCount: drawCount,
        newHandSize: newHand.length,
        remainingDeck: deck.length - drawCount,
      }
    });

    return {
      success: true,
      drawnCards,
      newHandSize: newHand.length,
      message: `成功抽取${drawCount}张卡牌`,
    };
  }

  /**
   * 执行弃牌（自动弃置到上限）
   * @param hand 当前手牌
   * @param currentTurn 当前回合数
   * @param cardsToDiscard 指定要弃置的卡牌（可选，如不指定则自动弃置）
   */
  static discardCards(
    hand: Card[],
    currentTurn: number,
    cardsToDiscard?: Card[]
  ): DiscardResult {
    const checkResult = this.checkHandSizeLimit(hand.length, currentTurn);
    
    if (checkResult.isValid) {
      return {
        success: true,
        discardedCards: [],
        remainingHand: hand,
        message: '手牌未超过上限，无需弃牌',
      };
    }

    const discardCount = checkResult.excessCount;
    let actualDiscarded: Card[];
    let remainingHand: Card[];

    if (cardsToDiscard && cardsToDiscard.length > 0) {
      // 使用指定的弃牌
      if (cardsToDiscard.length !== discardCount) {
        return {
          success: false,
          discardedCards: [],
          remainingHand: hand,
          message: `弃牌数量不匹配！需要弃置${discardCount}张，指定了${cardsToDiscard.length}张`,
        };
      }
      actualDiscarded = cardsToDiscard;
      remainingHand = hand.filter(card => 
        !cardsToDiscard.some(dc => dc.card_code === card.card_code)
      );
    } else {
      // 自动弃牌（弃置最后抽到的牌）
      actualDiscarded = hand.slice(-discardCount);
      remainingHand = hand.slice(0, -discardCount);
    }

    gameLogger.info('card_discarded', `弃牌完成：弃置${actualDiscarded.length}张，剩余${remainingHand.length}张`, {
      extra: {
        discardedCount: actualDiscarded.length,
        remainingCount: remainingHand.length,
        maxHandSize: checkResult.maxAllowed,
      }
    });

    return {
      success: true,
      discardedCards: actualDiscarded,
      remainingHand,
      message: `弃牌完成：弃置${actualDiscarded.length}张，剩余${remainingHand.length}张`,
    };
  }

  /**
   * 获取手牌状态
   * @param hand 当前手牌
   * @param currentTurn 当前回合数
   */
  static getHandState(hand: Card[], currentTurn: number): HandState {
    const maxSize = this.getMaxHandSize(currentTurn);
    const needsDiscard = hand.length > maxSize;
    const discardCount = Math.max(0, hand.length - maxSize);

    return {
      cards: hand,
      count: hand.length,
      maxSize,
      needsDiscard,
      discardCount,
    };
  }

  /**
   * 初始化手牌
   * @param deck 牌库
   */
  static initializeHand(deck: Card[]): { hand: Card[]; remainingDeck: Card[] } {
    const initialCount = HAND_RULE_CONFIG.INITIAL_HAND_SIZE;
    
    if (deck.length < initialCount) {
      gameLogger.warn('card_drawn', `牌库卡牌不足！需要${initialCount}张，实际${deck.length}张`);
      return {
        hand: [...deck],
        remainingDeck: [],
      };
    }

    const hand = deck.slice(0, initialCount);
    const remainingDeck = deck.slice(initialCount);

    gameLogger.info('card_drawn', `初始化手牌：抽取${initialCount}张`, {
      extra: {
        initialHandSize: hand.length,
        remainingDeck: remainingDeck.length,
      }
    });

    return { hand, remainingDeck };
  }

  /**
   * 获取手牌规则描述
   */
  static getHandRuleDescription(): string {
    return `
【手牌规则 R4.3】
━━━━━━━━━━━━━━━━━━━━
📋 初始手牌：${HAND_RULE_CONFIG.INITIAL_HAND_SIZE}张
📊 手牌上限：
   • 1-6回合：${HAND_RULE_CONFIG.MAX_HAND_SIZE_EARLY}张
   • 7回合后：${HAND_RULE_CONFIG.MAX_HAND_SIZE_NORMAL}张
🎴 每回合抽牌：${HAND_RULE_CONFIG.CARDS_PER_DRAW}张
🗑️ 弃牌规则：回合结束时，手牌超过上限必须弃至上限
━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}

// ============================================
// 便捷导出
// ============================================

export const handRuleSystem = HandRuleSystem;
export default HandRuleSystem;
