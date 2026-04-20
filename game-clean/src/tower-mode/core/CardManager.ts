import { CARD_DATABASE, INITIAL_DECK, getCardsByType, getCardsByQuality } from '../data/cardDatabase';
import type { Card } from '../types/player.types';

// 卡牌管理器
export class CardManager {
  private cardPool: Card[] = [];
  private currentDeck: Card[] = [];

  constructor() {
    // 初始卡牌池初始化为T0卡牌
    this.cardPool = [...INITIAL_DECK];
    this.currentDeck = this.generateDeck();
  }

  // 获取当前卡牌池
  getCardPool(): Card[] {
    return [...this.cardPool];
  }

  // 获取当前卡组
  getCurrentDeck(): Card[] {
    return [...this.currentDeck];
  }

  // 添加卡牌到卡牌池
  addCard(card: Card): void {
    this.cardPool.push(card);
  }

  // 从卡牌池中移除卡牌
  removeCard(cardId: string): boolean {
    const index = this.cardPool.findIndex(c => c.id === cardId);
    if (index !== -1) {
      this.cardPool.splice(index, 1);
      return true;
    }
    return false;
  }

  // 根据类型获取卡牌
  getCardsByType(type: Card['type']): Card[] {
    return getCardsByType(type);
  }

  // 根据品质获取卡牌
  getCardsByQuality(quality: Card['quality']): Card[] {
    return getCardsByQuality(quality);
  }

  // 生成卡组
  generateDeck(): Card[] {
    // 从卡牌池中随机选取，这里简化处理
    return this.cardPool.slice(0, 10); // 默认取前10张，实际游戏中根据策略
  }

  // 洗牌（重置当前卡牌池生成
  shuffleDeck(): Card[] {
    const deck = [...this.currentDeck];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.currentDeck = deck;
    return this.currentDeck;
  }

  // 强化卡牌
  upgradeCard(cardId: string): Card | null {
    const card = this.cardPool.find(c => c.id === cardId);
    if (card) {
      // 简单的强化逻辑
      return card;
    }
    return null;
  }

  // 从数据库获取全部卡牌
  getAllCards(): Card[] {
    return [...CARD_DATABASE];
  }
}

// 默认导出实例
export const defaultCardManager = new CardManager();
