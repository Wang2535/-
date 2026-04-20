/**
 * 《道高一丈：数字博弈》v17.0 - 手牌规则系统
 * 
 * 实现规则文档 R4.3 手牌规则
 * 
 * 核心功能：
 * 1. 初始手牌管理（4张）
 * 2. 手牌上限控制（3张，1-6回合为2张）
 * 3. 抽牌数管理（每回合4张）
 * 4. 弃牌规则执行
 */

import type { Card } from './CardDatabase';
import { gameLogger } from './GameLogger';

/**
 * 手牌状态
 */
export interface HandState {
  cards: Card[];           // 当前手牌
  maxCards: number;        // 当前手牌上限
  baseDrawCount: number;   // 基础抽牌数
  turnNumber: number;      // 当前回合数
}

/**
 * 抽牌结果
 */
export interface DrawCardsResult {
  drawnCards: Card[];      // 抽到的卡牌
  newHand: Card[];         // 新的手牌
  deckEmpty: boolean;      // 牌库是否抽空
  messages: string[];
}

/**
 * 弃牌结果
 */
export interface DiscardResult {
  discardedCards: Card[];  // 弃置的卡牌
  remainingCards: Card[];  // 剩余的手牌
  messages: string[];
}

/**
 * 手牌规则配置
 */
export const HAND_RULES = {
  INITIAL_HAND_SIZE: 4,        // 初始手牌数
  BASE_HAND_LIMIT: 3,          // 基础手牌上限
  EARLY_GAME_HAND_LIMIT: 2,    // 前期手牌上限（1-6回合）
  EARLY_GAME_TURNS: 6,         // 前期回合数
  BASE_DRAW_COUNT: 4,          // 基础抽牌数
} as const;

/**
 * 手牌规则系统
 */
export class HandCardSystem {
  /**
   * 初始化手牌状态
   */
  static initHandState(): HandState {
    return {
      cards: [],
      maxCards: HAND_RULES.EARLY_GAME_HAND_LIMIT,  // 前期为2张
      baseDrawCount: HAND_RULES.BASE_DRAW_COUNT,
      turnNumber: 1,
    };
  }

  /**
   * 获取当前手牌上限
   * 根据回合数计算：1-6回合为2张，7回合起为3张
   */
  static getHandLimit(turnNumber: number): number {
    if (turnNumber <= HAND_RULES.EARLY_GAME_TURNS) {
      return HAND_RULES.EARLY_GAME_HAND_LIMIT;
    }
    return HAND_RULES.BASE_HAND_LIMIT;
  }

  /**
   * 更新手牌上限（回合变化时调用）
   */
  static updateHandLimit(state: HandState, turnNumber: number): HandState {
    const newLimit = this.getHandLimit(turnNumber);
    const oldLimit = state.maxCards;
    
    if (newLimit !== oldLimit) {
      gameLogger.info('effect_triggered', `手牌上限变更: ${oldLimit} → ${newLimit}`, {
        extra: { turnNumber, oldLimit, newLimit }
      });
    }

    return {
      ...state,
      maxCards: newLimit,
      turnNumber,
    };
  }

  /**
   * 抽牌
   * @param state 当前手牌状态
   * @param deck 牌库
   * @param count 抽牌数量（默认为基础抽牌数）
   * @returns 抽牌结果
   */
  static drawCards(
    state: HandState,
    deck: Card[],
    count: number = HAND_RULES.BASE_DRAW_COUNT
  ): DrawCardsResult {
    const drawnCards: Card[] = [];
    const messages: string[] = [];
    let deckEmpty = false;

    // 从牌库顶部抽牌
    for (let i = 0; i < count; i++) {
      if (deck.length === 0) {
        deckEmpty = true;
        messages.push('牌库已空，无法继续抽牌');
        break;
      }
      const card = deck.shift()!;
      drawnCards.push(card);
    }

    // 添加到手牌
    const newHand = [...state.cards, ...drawnCards];

    messages.push(`抽取了 ${drawnCards.length} 张牌`);
    
    gameLogger.info('effect_triggered', `抽牌完成: ${drawnCards.length}张`, {
      extra: {
        drawnCount: drawnCards.length,
        handSize: newHand.length,
        deckEmpty,
      }
    });

    return {
      drawnCards,
      newHand,
      deckEmpty,
      messages,
    };
  }

  /**
   * 检查是否需要弃牌
   */
  static needsDiscard(state: HandState): boolean {
    return state.cards.length > state.maxCards;
  }

  /**
   * 获取需要弃牌的数量
   */
  static getDiscardCount(state: HandState): number {
    return Math.max(0, state.cards.length - state.maxCards);
  }

  /**
   * 执行弃牌
   * @param state 当前手牌状态
   * @param discardIndices 要弃置的卡牌索引
   * @returns 弃牌结果
   */
  static discardCards(
    state: HandState,
    discardIndices: number[]
  ): DiscardResult {
    const discardCount = this.getDiscardCount(state);
    const messages: string[] = [];

    // 验证弃牌数量
    if (discardIndices.length !== discardCount) {
      messages.push(`弃牌数量错误: 需要弃${discardCount}张，但选择了${discardIndices.length}张`);
      return {
        discardedCards: [],
        remainingCards: state.cards,
        messages,
      };
    }

    // 验证索引有效性
    const validIndices = discardIndices.every(idx => 
      idx >= 0 && idx < state.cards.length
    );
    
    if (!validIndices) {
      messages.push('弃牌索引无效');
      return {
        discardedCards: [],
        remainingCards: state.cards,
        messages,
      };
    }

    // 执行弃牌
    const discardedCards: Card[] = [];
    const remainingCards: Card[] = [];

    state.cards.forEach((card, index) => {
      if (discardIndices.includes(index)) {
        discardedCards.push(card);
      } else {
        remainingCards.push(card);
      }
    });

    messages.push(`弃置了 ${discardedCards.length} 张牌`);

    gameLogger.info('effect_triggered', `弃牌完成: ${discardedCards.length}张`, {
      extra: {
        discardCount: discardedCards.length,
        remainingCount: remainingCards.length,
      }
    });

    return {
      discardedCards,
      remainingCards,
      messages,
    };
  }

  /**
   * 自动弃牌（当玩家未在规定时间内弃牌时）
   * 策略：随机弃牌
   */
  static autoDiscard(state: HandState): DiscardResult {
    const discardCount = this.getDiscardCount(state);
    
    if (discardCount === 0) {
      return {
        discardedCards: [],
        remainingCards: state.cards,
        messages: ['无需弃牌'],
      };
    }

    // 随机选择要弃置的卡牌
    const indices = Array.from({ length: state.cards.length }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    const discardIndices = shuffled.slice(0, discardCount);

    gameLogger.info('effect_triggered', `自动弃牌: ${discardCount}张`, {
      extra: { discardIndices }
    });

    return this.discardCards(state, discardIndices);
  }

  /**
   * 添加卡牌到手牌（从其他效果获得）
   */
  static addCardToHand(state: HandState, card: Card): HandState {
    return {
      ...state,
      cards: [...state.cards, card],
    };
  }

  /**
   * 从手牌移除卡牌（打出或使用）
   */
  static removeCardFromHand(state: HandState, cardIndex: number): { card: Card | null; newState: HandState } {
    if (cardIndex < 0 || cardIndex >= state.cards.length) {
      return { card: null, newState: state };
    }

    const card = state.cards[cardIndex];
    const newCards = [...state.cards];
    newCards.splice(cardIndex, 1);

    return {
      card,
      newState: {
        ...state,
        cards: newCards,
      },
    };
  }

  /**
   * 获取手牌信息
   */
  static getHandInfo(state: HandState): {
    currentCount: number;
    maxCount: number;
    needsDiscard: boolean;
    discardCount: number;
  } {
    const needsDiscard = this.needsDiscard(state);
    const discardCount = this.getDiscardCount(state);

    return {
      currentCount: state.cards.length,
      maxCount: state.maxCards,
      needsDiscard,
      discardCount,
    };
  }
}

export default HandCardSystem;
