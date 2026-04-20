/**
 * 《道高一丈：数字博弈》连击效果系统
 * 实现规则文档 R7.2 连击机制
 * 
 * 连击效果：配合其他卡牌触发的效果
 * 触发条件：上一张卡或下一张卡符合连击卡要求卡牌类
 * 视觉效果：触发时卡面出现金光渐变闪烁，1秒1闪
 */

import type { Card, CardType } from '@/types/legacy/card_v16';
import { gameLogger } from './GameLogger';

// ============================================
// 连击效果类型定义
// ============================================

export interface GameComboEffect {
  /** 连击类型 */
  type: 'previous' | 'next' | 'same_type' | 'same_faction';
  /** 要求的卡牌类型 */
  requiredCardType?: CardType;
  /** 要求的阵营 */
  requiredFaction?: 'attack' | 'defense';
  /** 额外效果值 */
  bonusValue: number;
  /** 效果描述 */
  description: string;
  /** 是否触发 */
  triggered: boolean;
}

export interface ComboState {
  /** 当前连击数 */
  comboCount: number;
  /** 上一张使用的卡牌 */
  lastPlayedCard: Card | null;
  /** 上一张卡牌的回合 */
  lastPlayedRound: number;
  /** 连续使用相同类型卡牌的次数 */
  sameTypeConsecutiveCount: number;
  /** 当前回合已使用的卡牌 */
  cardsPlayedThisRound: Card[];
}

export interface ComboTriggerResult {
  /** 是否触发连击 */
  triggered: boolean;
  /** 连击效果列表 */
  effects: GameComboEffect[];
  /** 新的连击数 */
  newComboCount: number;
  /** 视觉效果触发 */
  visualEffect: boolean;
  /** 日志信息 */
  logs: string[];
}

// ============================================
// 连击状态管理
// ============================================

const playerComboStates: Map<string, ComboState> = new Map();

/**
 * 初始化玩家连击状态
 */
export function initComboState(playerId: string): ComboState {
  const state: ComboState = {
    comboCount: 0,
    lastPlayedCard: null,
    lastPlayedRound: 0,
    sameTypeConsecutiveCount: 0,
    cardsPlayedThisRound: [],
  };
  playerComboStates.set(playerId, state);
  return state;
}

/**
 * 获取玩家连击状态
 */
export function getComboState(playerId: string): ComboState {
  return playerComboStates.get(playerId) || initComboState(playerId);
}

/**
 * 重置玩家连击状态（回合结束时）
 */
export function resetComboState(playerId: string): void {
  const state = getComboState(playerId);
  state.cardsPlayedThisRound = [];
  // 注意：comboCount和sameTypeConsecutiveCount跨回合保留
}

// ============================================
// 连击判定逻辑
// ============================================

/**
 * 检查卡牌是否有连击效果
 */
export function hasComboEffect(card: Card): boolean {
  return !!card.comboEffect;
}

/**
 * 解析连击效果
 */
export function parseComboEffect(card: Card): GameComboEffect | null {
  if (!card.comboEffect) return null;
  
  // 从卡牌效果的描述中解析连击配置
  const effect = card.comboEffect;
  return {
    type: 'same_type', // 默认类型
    bonusValue: effect.bonus || 0,
    description: effect.description || '',
    triggered: false,
  };
}

/**
 * 检查连击条件是否满足
 */
export function checkComboCondition(
  currentCard: Card,
  previousCard: Card | null,
  comboEffect: GameComboEffect
): boolean {
  if (!previousCard) return false;
  
  switch (comboEffect.type) {
    case 'previous':
      // 检查上一张卡是否符合要求
      if (comboEffect.requiredCardType && previousCard.type !== comboEffect.requiredCardType) {
        return false;
      }
      if (comboEffect.requiredFaction && previousCard.faction !== comboEffect.requiredFaction) {
        return false;
      }
      return true;
      
    case 'same_type':
      // 连续使用相同类型的卡牌
      return currentCard.type === previousCard.type;
      
    case 'same_faction':
      // 连续使用相同阵营的卡牌
      return currentCard.faction === previousCard.faction;
      
    default:
      return false;
  }
}

/**
 * 执行连击判定
 * 
 * @param playerId 玩家ID
 * @param playedCard 当前打出的卡牌
 * @param currentRound 当前回合数
 * @returns 连击触发结果
 */
export function executeComboCheck(
  playerId: string,
  playedCard: Card,
  currentRound: number
): ComboTriggerResult {
  const state = getComboState(playerId);
  const logs: string[] = [];
  const effects: GameComboEffect[] = [];
  let triggered = false;
  let visualEffect = false;
  
  // 检查是否是新回合
  if (state.lastPlayedRound !== currentRound) {
    state.cardsPlayedThisRound = [];
  }
  
  // 检查当前卡牌是否有连击效果
  const comboEffect = parseComboEffect(playedCard);
  
  if (comboEffect) {
    // 检查连击条件
    const conditionMet = checkComboCondition(playedCard, state.lastPlayedCard, comboEffect);
    
    if (conditionMet) {
      triggered = true;
      visualEffect = true;
      comboEffect.triggered = true;
      effects.push(comboEffect);
      
      // 增加连击数
      state.comboCount++;
      
      logs.push(`连击触发！${playedCard.name}的连击效果激活：${comboEffect.description}`);
      logs.push(`当前连击数：${state.comboCount}`);
      
      gameLogger.info('combo_triggered', '连击效果触发', {
        extra: {
          playerId,
          cardName: playedCard.name,
          comboCount: state.comboCount,
          effect: comboEffect.description,
        },
      });
    }
  }
  
  // 检查连续使用相同类型卡牌
  if (state.lastPlayedCard && state.lastPlayedCard.type === playedCard.type) {
    state.sameTypeConsecutiveCount++;
    
    // 每连续2次相同类型，第3次获得额外加成
    if (state.sameTypeConsecutiveCount >= 2) {
      const bonusEffect: GameComboEffect = {
        type: 'same_type',
        bonusValue: 0.5,
        description: `连续使用${state.sameTypeConsecutiveCount + 1}张${playedCard.type}类型卡牌，效果+0.5`,
        triggered: true,
      };
      effects.push(bonusEffect);
      logs.push(bonusEffect.description);
      
      // 重置计数
      state.sameTypeConsecutiveCount = 0;
    }
  } else {
    state.sameTypeConsecutiveCount = 0;
  }
  
  // 更新状态
  state.lastPlayedCard = playedCard;
  state.lastPlayedRound = currentRound;
  state.cardsPlayedThisRound.push(playedCard);
  
  return {
    triggered,
    effects,
    newComboCount: state.comboCount,
    visualEffect,
    logs,
  };
}

/**
 * 计算连击加成后的效果值
 */
export function calculateGameComboBonus(
  baseValue: number,
  comboEffects: GameComboEffect[]
): { finalValue: number; bonusBreakdown: string[] } {
  let finalValue = baseValue;
  const bonusBreakdown: string[] = [`基础值：${baseValue}`];
  
  for (const effect of comboEffects) {
    if (effect.triggered) {
      const bonus = effect.bonusValue;
      finalValue += bonus;
      bonusBreakdown.push(`连击加成：+${bonus} (${effect.description})`);
    }
  }
  
  bonusBreakdown.push(`最终值：${finalValue}`);
  
  return { finalValue, bonusBreakdown };
}

/**
 * 获取连击视觉效果的CSS类名
 */
export function getComboVisualEffectClass(triggered: boolean): string {
  if (!triggered) return '';
  
  // 返回金光渐变闪烁效果的CSS类
  return 'combo-glow-effect';
}

/**
 * 预判下一张卡的连击可能性
 * 用于AI决策辅助
 */
export function predictNextCombo(
  playerId: string,
  handCards: Card[]
): Array<{ card: Card; canTriggerCombo: boolean; expectedBonus: number }> {
  const state = getComboState(playerId);
  const predictions = [];
  
  for (const card of handCards) {
    const comboEffect = parseComboEffect(card);
    let canTriggerCombo = false;
    let expectedBonus = 0;
    
    if (comboEffect && state.lastPlayedCard) {
      canTriggerCombo = checkComboCondition(card, state.lastPlayedCard, comboEffect);
      expectedBonus = canTriggerCombo ? comboEffect.bonusValue : 0;
    }
    
    predictions.push({
      card,
      canTriggerCombo,
      expectedBonus,
    });
  }
  
  return predictions;
}

/**
 * 获取当前连击链信息
 */
export function getComboChainInfo(playerId: string): {
  comboCount: number;
  lastCardType: string | null;
  sameTypeStreak: number;
  canTriggerNextCombo: boolean;
} {
  const state = getComboState(playerId);
  
  return {
    comboCount: state.comboCount,
    lastCardType: state.lastPlayedCard?.type || null,
    sameTypeStreak: state.sameTypeConsecutiveCount,
    canTriggerNextCombo: state.comboCount > 0,
  };
}

export default {
  initComboState,
  getComboState,
  resetComboState,
  hasComboEffect,
  parseComboEffect,
  checkComboCondition,
  executeComboCheck,
  calculateGameComboBonus,
  getComboVisualEffectClass,
  predictNextCombo,
  getComboChainInfo,
};
