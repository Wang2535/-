/**
 * 连击状态管理器
 * 
 * 功能：
 * 1. 跟踪当前回合内使用的卡牌
 * 2. 检测连击触发条件（支持同名卡牌和同类型卡牌）
 * 3. 管理连击视觉反馈状态
 * 4. 应用连击效果到游戏状态
 */

import type { Card as CardV16, CardType } from '@/types/legacy/card_v16';
import type { GameState } from '@/types/gameRules';
import { TeamLevelManager } from './TeamLevelManager';

// 使用CardV16类型
 type Card = CardV16;

export interface ComboActiveState {
  /** 连击是否激活 */
  isActive: boolean;
  /** 激活的连击类型 */
  comboType: 'same_name' | 'same_type' | 'previous' | 'sequence' | null;
  /** 要求的卡牌代码（同名连击） */
  requiredCardCode: string | null;
  /** 要求的卡牌类型（同类型连击） */
  requiredCardType: CardType | null;
  /** 连击加成值 */
  bonus: number;
  /** 连击描述 */
  description: string;
  /** 已触发的连击卡牌代码 */
  triggeredCardCodes: string[];
  /** 当前连击计数 */
  comboCount: number;
}

export interface ComboState {
  /** 当前回合已使用的卡牌 */
  cardsPlayedThisTurn: Card[];
  /** 上一张使用的卡牌 */
  lastPlayedCard: Card | null;
  /** 连续使用相同名称卡牌的次数 */
  sameNameConsecutiveCount: Record<string, number>;
  /** 连续使用相同类型卡牌的次数 */
  sameTypeConsecutiveCount: Record<string, number>;
  /** 当前连击数 */
  comboCount: number;
  /** 当前激活的连击状态 */
  activeCombo: ComboActiveState | null;
  /** 本回合是否已触发连击 */
  hasTriggeredComboThisTurn: boolean;
}

class ComboStateManagerClass {
  private playerStates: Map<string, ComboState> = new Map();
  private listeners: Set<(playerId: string, state: ComboState) => void> = new Set();

  /**
   * 获取玩家连击状态
   */
  getState(playerId: string): ComboState {
    if (!this.playerStates.has(playerId)) {
      this.playerStates.set(playerId, this.createInitialState());
    }
    return this.playerStates.get(playerId)!;
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): ComboState {
    return {
      cardsPlayedThisTurn: [],
      lastPlayedCard: null,
      sameNameConsecutiveCount: {},
      sameTypeConsecutiveCount: {},
      comboCount: 0,
      activeCombo: null,
      hasTriggeredComboThisTurn: false,
    };
  }

  /**
   * 重置玩家状态（回合结束时）
   */
  resetTurn(playerId: string): void {
    const state = this.getState(playerId);
    this.playerStates.set(playerId, {
      ...this.createInitialState(),
      comboCount: state.comboCount, // 保留跨回合的连击数
    });
    this.notifyListeners(playerId);
  }

  /**
   * 记录卡牌使用
   */
  recordCardPlay(playerId: string, card: Card): ComboState {
    const state = this.getState(playerId);
    
    // 更新同名卡牌计数
    const cardCode = card.card_code;
    state.sameNameConsecutiveCount[cardCode] = (state.sameNameConsecutiveCount[cardCode] || 0) + 1;
    
    // 更新同类型卡牌计数
    const cardType = card.type;
    state.sameTypeConsecutiveCount[cardType] = (state.sameTypeConsecutiveCount[cardType] || 0) + 1;

    // 更新状态
    state.cardsPlayedThisTurn.push(card);
    state.lastPlayedCard = card;

    // 检查连击触发
    this.checkComboTrigger(card, state);

    this.playerStates.set(playerId, state);
    this.notifyListeners(playerId);
    
    return state;
  }

  /**
   * 检查连击触发
   */
  private checkComboTrigger(playedCard: Card, state: ComboState): void {
    // 检查当前卡牌是否有连击效果
    if (playedCard.comboEffect) {
      const comboEffect = playedCard.comboEffect;
      
      // 同名连击检测（优先）
      if (this.isSameNameCombo(playedCard, state)) {
        const sameNameCount = state.sameNameConsecutiveCount[playedCard.card_code] || 0;
        
        if (sameNameCount >= 2) {
          // 同名连击已激活
          state.activeCombo = {
            isActive: true,
            comboType: 'same_name',
            requiredCardCode: playedCard.card_code,
            requiredCardType: null,
            bonus: comboEffect.bonus || 0.5,
            description: comboEffect.description || '同名连击效果激活',
            triggeredCardCodes: state.cardsPlayedThisTurn
              .filter(c => c.card_code === playedCard.card_code)
              .map(c => c.card_code),
            comboCount: sameNameCount,
          };
          state.hasTriggeredComboThisTurn = true;
          state.comboCount++;
          
          console.log(`[ComboStateManager] 同名连击触发！${playedCard.name} x${sameNameCount} - ${comboEffect.description}`);
          return;
        }
      }
      
      // 同类型连击检测
      if (comboEffect.type === 'same_type' && comboEffect.requiredCardType) {
        const sameTypeCount = state.sameTypeConsecutiveCount[comboEffect.requiredCardType] || 0;
        
        if (sameTypeCount >= 2) {
          // 同类型连击已激活
          state.activeCombo = {
            isActive: true,
            comboType: 'same_type',
            requiredCardCode: null,
            requiredCardType: comboEffect.requiredCardType,
            bonus: comboEffect.bonus || 0.5,
            description: comboEffect.description || '同类型连击效果激活',
            triggeredCardCodes: state.cardsPlayedThisTurn
              .filter(c => c.type === comboEffect.requiredCardType)
              .map(c => c.card_code),
            comboCount: sameTypeCount,
          };
          state.hasTriggeredComboThisTurn = true;
          state.comboCount++;
          
          console.log(`[ComboStateManager] 同类型连击触发！${playedCard.name} - ${comboEffect.description}`);
          return;
        }
      }
      
      // 配合前一张卡检测
      if (comboEffect.type === 'previous' && comboEffect.requiredCardType) {
        const previousCard = state.lastPlayedCard;
        if (previousCard && previousCard.type === comboEffect.requiredCardType) {
          // 配合连击已激活
          state.activeCombo = {
            isActive: true,
            comboType: 'previous',
            requiredCardCode: null,
            requiredCardType: comboEffect.requiredCardType,
            bonus: comboEffect.bonus || 0.5,
            description: comboEffect.description || '配合连击效果激活',
            triggeredCardCodes: [previousCard.card_code, playedCard.card_code],
            comboCount: 2,
          };
          state.hasTriggeredComboThisTurn = true;
          state.comboCount++;
          
          console.log(`[ComboStateManager] 配合连击触发！${playedCard.name} - ${comboEffect.description}`);
        }
      }
    }
  }

  /**
   * 检查是否是同名连击
   */
  private isSameNameCombo(card: Card, state: ComboState): boolean {
    // 如果本回合已使用过同名卡牌，则认为是同名连击
    const sameNameCards = state.cardsPlayedThisTurn.filter(c => c.card_code === card.card_code);
    return sameNameCards.length >= 1;
  }

  /**
   * 检查卡牌是否可以触发连击
   */
  canTriggerCombo(playerId: string, card: Card): boolean {
    const state = this.getState(playerId);
    
    if (!card.comboEffect) return false;
    
    // 如果已经有连击激活，检查是否是同名或同类型
    if (state.activeCombo) {
      // 同名连击
      if (state.activeCombo.comboType === 'same_name' && state.activeCombo.requiredCardCode === card.card_code) {
        return true;
      }
      // 同类型连击
      if (state.activeCombo.comboType === 'same_type' && state.activeCombo.requiredCardType === card.type) {
        return true;
      }
    }
    
    const comboEffect = card.comboEffect;
    
    // 检查是否可以触发新的同名连击
    const sameNameCount = state.sameNameConsecutiveCount[card.card_code] || 0;
    if (sameNameCount >= 1) {
      return true;
    }
    
    // 同类型连击
    if (comboEffect.type === 'same_type' && comboEffect.requiredCardType) {
      const sameTypeCount = state.sameTypeConsecutiveCount[comboEffect.requiredCardType] || 0;
      return sameTypeCount >= 1;
    }
    
    // 配合前一张卡
    if (comboEffect.type === 'previous' && comboEffect.requiredCardType) {
      const lastCard = state.lastPlayedCard;
      if (lastCard && lastCard.type === comboEffect.requiredCardType) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 获取当前激活的连击状态
   */
  getActiveCombo(playerId: string): ComboActiveState | null {
    return this.getState(playerId).activeCombo;
  }

  /**
   * 检查特定卡牌是否处于连击激活状态
   */
  isCardInActiveCombo(playerId: string, cardCode: string): boolean {
    const activeCombo = this.getActiveCombo(playerId);
    if (!activeCombo) return false;
    return activeCombo.triggeredCardCodes.includes(cardCode);
  }

  /**
   * 获取连击加成值
   */
  getComboBonus(playerId: string): number {
    const activeCombo = this.getActiveCombo(playerId);
    return activeCombo?.bonus || 0;
  }

  /**
   * 应用连击效果到游戏状态（使用队伍等级管理器）
   */
  applyComboEffect(
    gameState: GameState,
    playerId: string,
    card: Card
  ): { newGameState: GameState; bonusApplied: boolean; message: string } {
    const state = this.getState(playerId);
    
    if (!state.activeCombo || !card.comboEffect) {
      return { newGameState: gameState, bonusApplied: false, message: '' };
    }

    let newGameState = { ...gameState };
    const bonus = state.activeCombo.bonus;
    const comboEffect = card.comboEffect;
    
    let message = '';
    let levelResult;

    // 根据连击类型应用不同效果
    if (comboEffect.trigger?.includes('infiltration')) {
      // 使用队伍等级管理器增加渗透等级
      levelResult = TeamLevelManager.applyLevelChange(
        newGameState,
        playerId,
        'infiltration',
        bonus,
        false,
        '连击效果'
      );
      newGameState = levelResult.newGameState;
      message = `连击！${levelResult.result.message}`;
    } else if (comboEffect.trigger?.includes('security')) {
      // 使用队伍等级管理器增加安全等级
      levelResult = TeamLevelManager.applyLevelChange(
        newGameState,
        playerId,
        'safety',
        bonus,
        false,
        '连击效果'
      );
      newGameState = levelResult.newGameState;
      message = `连击！${levelResult.result.message}`;
    } else if (comboEffect.trigger?.includes('resource')) {
      // 资源效果（个体资源，不涉及队伍共享）
      const players = [...newGameState.players];
      const playerIndex = players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const player = { ...players[playerIndex] };
        player.resources = {
          ...player.resources,
          compute: Math.min(15, player.resources.compute + Math.floor(bonus)),
        };
        players[playerIndex] = player;
        newGameState.players = players;
        message = `连击！${player.name} 获得 ${Math.floor(bonus)} 算力`;
      }
    } else {
      // 默认增加渗透（使用队伍等级管理器）
      levelResult = TeamLevelManager.applyLevelChange(
        newGameState,
        playerId,
        'infiltration',
        bonus,
        false,
        '连击效果'
      );
      newGameState = levelResult.newGameState;
      message = `连击！${levelResult.result.message}`;
    }

    // 添加日志
    newGameState.log = [
      ...newGameState.log,
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        turn: newGameState.turn,
        round: newGameState.round,
        phase: newGameState.currentPhase,
        playerId,
        action: 'combo_effect',
        message: message,
        timestamp: Date.now(),
      },
    ];

    console.log(`[ComboStateManager] ${message}`);

    return { newGameState, bonusApplied: true, message };
  }

  /**
   * 检查手牌中哪些卡牌可以触发连击
   */
  getComboEligibleCards(playerId: string, handCards: Card[]): Card[] {
    const state = this.getState(playerId);
    
    if (state.cardsPlayedThisTurn.length === 0) return [];
    
    const eligibleCards: Card[] = [];
    
    for (const card of handCards) {
      if (this.canTriggerCombo(playerId, card)) {
        eligibleCards.push(card);
      }
    }
    
    return eligibleCards;
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: (playerId: string, state: ComboState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(playerId: string): void {
    const state = this.getState(playerId);
    this.listeners.forEach(callback => callback(playerId, state));
  }

  /**
   * 重置所有状态
   */
  resetAll(): void {
    this.playerStates.clear();
  }
}

// 导出单例
export const ComboStateManager = new ComboStateManagerClass();
export default ComboStateManager;
