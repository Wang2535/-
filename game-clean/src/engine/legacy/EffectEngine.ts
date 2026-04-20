/**
 * 《道高一丈：数字博弈》v16.0 效果引擎
 * 处理卡牌效果的执行和管理
 */

import { 
  CardEffect, 
  LevelChangeEffect, 
  ResourceEffect, 
  CardDrawEffect,
  SuppressEffect,
  ProtectionEffect,
  ClearEffect,
  DiceCheckEffect,
  SustainEffect,
  CounterEffect,
  ComboEffect,
  Card,
  TechLevel
} from '../types/card_v16';
import { Player } from '../types/player_v16';
import { GameState } from '../types/game_v16';
import { DiceResult } from '../types/diceMechanic';
import { executeLevelCalculation, applyLevelChange } from './LevelCalculator';

// ==================== 效果执行上下文 ====================

export interface EffectContext {
  gameState: GameState;
  sourcePlayer: Player;
  targetPlayer?: Player;
  sourceCard: Card;
  diceResult?: DiceResult;
  consecutiveUses: number;
}

export interface EffectResult {
  success: boolean;
  effectType: string;
  description: string;
  changes: {
    playerId: string;
    type: 'infiltration' | 'security' | 'resource' | 'card';
    oldValue: number;
    newValue: number;
    change: number;
  }[];
  messages: string[];
}

// ==================== 效果处理器 ====================

export type EffectHandler<T extends CardEffect> = (
  effect: T,
  context: EffectContext
) => EffectResult;

// ==================== 等级变化效果处理器 ====================

export const handleLevelChangeEffect: EffectHandler<LevelChangeEffect> = (
  effect,
  context
) => {
  const { sourcePlayer, targetPlayer, diceResult, consecutiveUses } = context;
  
  const isAttack = sourcePlayer.faction === 'attack';
  const isGain = effect.type === 'infiltration_gain' || effect.type === 'security_gain';
  
  // 确定目标玩家
  const affectedPlayer = isGain ? sourcePlayer : targetPlayer;
  if (!affectedPlayer) {
    return {
      success: false,
      effectType: effect.type,
      description: '无目标玩家',
      changes: [],
      messages: ['效果执行失败：无目标玩家']
    };
  }
  
  // 确定当前等级值
  const currentValue = effect.type === 'infiltration_gain' || effect.type === 'infiltration_reduce'
    ? affectedPlayer.levelResources.infiltrationLevel
    : affectedPlayer.levelResources.securityLevel;
  
  // 执行等级计算
  const calculation = executeLevelCalculation(
    currentValue,
    effect.baseValue,
    sourcePlayer.techLevel,
    consecutiveUses,
    isGain,
    diceResult
  );
  
  // 构建结果
  const result: EffectResult = {
    success: true,
    effectType: effect.type,
    description: effect.description,
    changes: [{
      playerId: affectedPlayer.id,
      type: effect.type.includes('infiltration') ? 'infiltration' : 'security',
      oldValue: calculation.result.oldValue,
      newValue: calculation.result.newValue,
      change: calculation.result.actualChange
    }],
    messages: [
      `${effect.description}`,
      `等级变化: ${calculation.result.oldValue} -> ${calculation.result.newValue}`,
      ...(calculation.techBonus > 0 ? [`科技加成: +${calculation.techBonus}`] : []),
      ...(calculation.comboBonus > 0 ? [`连击加成: +${calculation.comboBonus}`] : []),
      ...(calculation.diceModifier !== 0 ? [`判定修正: ${calculation.diceModifier > 0 ? '+' : ''}${calculation.diceModifier}`] : [])
    ]
  };
  
  return result;
};

// ==================== 资源效果处理器 ====================

export const handleResourceEffect: EffectHandler<ResourceEffect> = (
  effect,
  context
) => {
  const { sourcePlayer, targetPlayer } = context;
  
  // 确定目标
  let affectedPlayer: Player | undefined;
  switch (effect.target) {
    case 'self':
      affectedPlayer = sourcePlayer;
      break;
    case 'opponent':
      affectedPlayer = targetPlayer;
      break;
    case 'all':
      // 处理所有玩家的情况
      affectedPlayer = sourcePlayer;
      break;
    default:
      affectedPlayer = sourcePlayer;
  }
  
  if (!affectedPlayer) {
    return {
      success: false,
      effectType: effect.type,
      description: '无目标玩家',
      changes: [],
      messages: ['效果执行失败：无目标玩家']
    };
  }
  
  const isGain = effect.type === 'resource_gain';
  const currentValue = affectedPlayer.resources[effect.resourceType];
  const newValue = isGain 
    ? Math.min(currentValue + effect.value, affectedPlayer.resourceLimits[effect.resourceType])
    : Math.max(currentValue - effect.value, 0);
  
  return {
    success: true,
    effectType: effect.type,
    description: effect.description,
    changes: [{
      playerId: affectedPlayer.id,
      type: 'resource',
      oldValue: currentValue,
      newValue,
      change: Math.abs(newValue - currentValue)
    }],
    messages: [
      `${effect.description}`,
      `${effect.resourceType}: ${currentValue} -> ${newValue}`
    ]
  };
};

// ==================== 抽牌效果处理器 ====================

export const handleCardDrawEffect: EffectHandler<CardDrawEffect> = (
  effect,
  context
) => {
  const { sourcePlayer, targetPlayer, gameState } = context;
  
  const affectedPlayer = effect.target === 'opponent' ? targetPlayer : sourcePlayer;
  if (!affectedPlayer) {
    return {
      success: false,
      effectType: effect.type,
      description: '无目标玩家',
      changes: [],
      messages: ['效果执行失败：无目标玩家']
    };
  }
  
  const isDraw = effect.type === 'draw';
  const currentCards = affectedPlayer.hand.length;
  const maxHandSize = gameState.config.maxHandSize;
  
  // 计算实际抽牌/弃牌数量
  let actualChange: number;
  if (isDraw) {
    actualChange = Math.min(effect.value, maxHandSize - currentCards);
  } else {
    actualChange = Math.min(effect.value, currentCards);
  }
  
  const newCardCount = isDraw ? currentCards + actualChange : currentCards - actualChange;
  
  return {
    success: true,
    effectType: effect.type,
    description: effect.description,
    changes: [{
      playerId: affectedPlayer.id,
      type: 'card',
      oldValue: currentCards,
      newValue: newCardCount,
      change: actualChange
    }],
    messages: [
      `${effect.description}`,
      `手牌: ${currentCards} -> ${newCardCount}`
    ]
  };
};

// ==================== 压制效果处理器 ====================

export const handleSuppressEffect: EffectHandler<SuppressEffect> = (
  effect,
  context
) => {
  const { targetPlayer } = context;
  
  if (!targetPlayer) {
    return {
      success: false,
      effectType: effect.type,
      description: '无目标玩家',
      changes: [],
      messages: ['效果执行失败：无目标玩家']
    };
  }
  
  return {
    success: true,
    effectType: effect.type,
    description: effect.description,
    changes: [],  // 压制效果不直接改变数值
    messages: [
      `${effect.description}`,
      `持续 ${effect.duration} 回合`
    ]
  };
};

// ==================== 保护效果处理器 ====================

export const handleProtectionEffect: EffectHandler<ProtectionEffect> = (
  effect,
  context
) => {
  const { sourcePlayer } = context;
  
  return {
    success: true,
    effectType: effect.type,
    description: effect.description,
    changes: [],
    messages: [
      `${effect.description}`,
      ...(effect.duration ? [`持续 ${effect.duration} 回合`] : ['永久生效'])
    ]
  };
};

// ==================== 清除效果处理器 ====================

export const handleClearEffect: EffectHandler<ClearEffect> = (
  effect,
  context
) => {
  return {
    success: true,
    effectType: effect.type,
    description: effect.description,
    changes: [],
    messages: [effect.description]
  };
};

// ==================== 判定效果处理器 ====================

export const handleDiceCheckEffect: EffectHandler<DiceCheckEffect> = (
  effect,
  context
) => {
  const { diceResult } = context;
  
  if (!diceResult) {
    return {
      success: false,
      effectType: effect.type,
      description: '无判定结果',
      changes: [],
      messages: ['效果执行失败：需要先进行判定']
    };
  }
  
  // 根据判定结果选择要执行的效果
  let selectedEffect: CardEffect;
  let resultMessage: string;
  
  if (diceResult.isCriticalSuccess && effect.onCriticalSuccess) {
    selectedEffect = effect.onCriticalSuccess;
    resultMessage = '大成功！';
  } else if (diceResult.isCriticalFailure && effect.onCriticalFailure) {
    selectedEffect = effect.onCriticalFailure;
    resultMessage = '大失败！';
  } else if (diceResult.success) {
    selectedEffect = effect.onSuccess;
    resultMessage = '判定成功！';
  } else if (effect.onFailure) {
    selectedEffect = effect.onFailure;
    resultMessage = '判定失败';
  } else {
    return {
      success: false,
      effectType: effect.type,
      description: '判定失败且无失败效果',
      changes: [],
      messages: ['判定失败']
    };
  }
  
  // 执行选中的效果
  const subResult = executeEffect(selectedEffect, context);
  
  return {
    ...subResult,
    messages: [resultMessage, ...subResult.messages]
  };
};

// ==================== 效果分发器 ====================

/**
 * 执行单个效果
 */
export function executeEffect(
  effect: CardEffect,
  context: EffectContext
): EffectResult {
  // 根据效果类型分发到对应的处理器
  switch (effect.type) {
    case 'security_reduce':
    case 'security_gain':
    case 'infiltration_gain':
    case 'infiltration_reduce':
      return handleLevelChangeEffect(effect as LevelChangeEffect, context);
      
    case 'resource_gain':
    case 'resource_steal':
      return handleResourceEffect(effect as ResourceEffect, context);
      
    case 'draw':
    case 'discard':
      return handleCardDrawEffect(effect as CardDrawEffect, context);
      
    case 'security_suppress':
    case 'infiltration_suppress':
      return handleSuppressEffect(effect as SuppressEffect, context);
      
    case 'protection':
      return handleProtectionEffect(effect as ProtectionEffect, context);
      
    case 'clear_effect':
      return handleClearEffect(effect as ClearEffect, context);
      
    case 'dice_check':
      return handleDiceCheckEffect(effect as DiceCheckEffect, context);
      
    default:
      return {
        success: false,
        effectType: (effect as any).type || 'unknown',
        description: '未知效果类型',
        changes: [],
        messages: [`未知效果类型: ${(effect as any).type}`]
      };
  }
}

/**
 * 执行卡牌的所有效果
 */
export function executeCardEffects(
  card: Card,
  context: EffectContext
): EffectResult[] {
  const results: EffectResult[] = [];
  
  // 执行主要效果
  for (const effect of card.effects) {
    const result = executeEffect(effect, context);
    results.push(result);
  }
  
  return results;
}

// ==================== 连击效果处理 ====================

/**
 * 检查并应用连击效果
 */
export function checkComboEffect(
  card: Card,
  context: EffectContext
): { active: boolean; bonus: number; message: string } {
  if (!card.comboEffect) {
    return { active: false, bonus: 0, message: '' };
  }
  
  const { consecutiveUses } = context;
  const { maxStack, bonus, description } = card.comboEffect;
  
  if (consecutiveUses <= 0) {
    return { active: false, bonus: 0, message: '' };
  }
  
  const actualBonus = Math.min(consecutiveUses * bonus, maxStack * bonus);
  
  return {
    active: true,
    bonus: actualBonus,
    message: `连击x${consecutiveUses}！${description} (+${actualBonus})`
  };
}

// ==================== 持续效果管理 ====================

export interface SustainEffectManager {
  activeEffects: Map<string, SustainEffectState>;
  addEffect: (effect: SustainEffect, sourceCard: string, targetPlayer: string) => string;
  removeEffect: (effectId: string) => boolean;
  processTurnEnd: () => SustainEffectState[];
  getEffectsByPlayer: (playerId: string) => SustainEffectState[];
}

export interface SustainEffectState {
  id: string;
  sourceCard: string;
  targetPlayer: string;
  effect: SustainEffect;
  remainingRounds: number;
}

/**
 * 创建持续效果管理器
 */
export function createSustainEffectManager(): SustainEffectManager {
  const activeEffects = new Map<string, SustainEffectState>();
  let effectIdCounter = 0;
  
  return {
    activeEffects,
    
    addEffect(effect: SustainEffect, sourceCard: string, targetPlayer: string): string {
      const id = `sustain_${++effectIdCounter}`;
      activeEffects.set(id, {
        id,
        sourceCard,
        targetPlayer,
        effect,
        remainingRounds: effect.duration
      });
      return id;
    },
    
    removeEffect(effectId: string): boolean {
      return activeEffects.delete(effectId);
    },
    
    processTurnEnd(): SustainEffectState[] {
      const expiredEffects: SustainEffectState[] = [];
      
      for (const [id, state] of activeEffects) {
        state.remainingRounds--;
        if (state.remainingRounds <= 0) {
          expiredEffects.push(state);
          activeEffects.delete(id);
        }
      }
      
      return expiredEffects;
    },
    
    getEffectsByPlayer(playerId: string): SustainEffectState[] {
      return Array.from(activeEffects.values())
        .filter(e => e.targetPlayer === playerId);
    }
  };
}

// ==================== 反击效果处理 ====================

/**
 * 检查反击效果触发
 */
export function checkCounterEffect(
  trigger: string,
  card: Card,
  context: EffectContext
): EffectResult | null {
  if (!card.counterEffect) {
    return null;
  }
  
  if (card.counterEffect.trigger !== trigger) {
    return null;
  }
  
  // 执行反击效果
  return executeEffect(card.counterEffect.effect, context);
}

// ==================== 效果预览 ====================

/**
 * 预览卡牌效果（不实际执行）
 */
export function previewCardEffects(
  card: Card,
  context: Omit<EffectContext, 'diceResult'>
): { effect: CardEffect; preview: string }[] {
  const previews: { effect: CardEffect; preview: string }[] = [];
  
  for (const effect of card.effects) {
    let preview = '';
    
    switch (effect.type) {
      case 'security_reduce':
      case 'security_gain':
      case 'infiltration_gain':
      case 'infiltration_reduce':
        const levelEffect = effect as LevelChangeEffect;
        preview = `${levelEffect.description} (基础值: ${levelEffect.baseValue})`;
        break;
        
      case 'resource_gain':
      case 'resource_steal':
        const resourceEffect = effect as ResourceEffect;
        preview = `${resourceEffect.description} (${resourceEffect.resourceType}: ${resourceEffect.value > 0 ? '+' : ''}${resourceEffect.value})`;
        break;
        
      case 'draw':
      case 'discard':
        const cardEffect = effect as CardDrawEffect;
        preview = `${cardEffect.description} (${cardEffect.value}张)`;
        break;
        
      case 'dice_check':
        const diceEffect = effect as DiceCheckEffect;
        preview = `判定难度 ${diceEffect.difficulty}，成功时: ${diceEffect.onSuccess.description}`;
        break;
        
      default:
        preview = (effect as any).description || '未知效果';
    }
    
    previews.push({ effect, preview });
  }
  
  return previews;
}

// ==================== 导出 ====================

export default {
  executeEffect,
  executeCardEffects,
  checkComboEffect,
  createSustainEffectManager,
  checkCounterEffect,
  previewCardEffects,
  handleLevelChangeEffect,
  handleResourceEffect,
  handleCardDrawEffect,
  handleSuppressEffect,
  handleProtectionEffect,
  handleClearEffect,
  handleDiceCheckEffect
};
