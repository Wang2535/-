/**
 * 《道高一丈：数字博弈》v17.0 - 效果结算系统
 * 
 * 实现规则文档 R7.4 效果结算顺序
 * 
 * 结算顺序：
 * 1. 判定效果（如有）
 * 2. 主要效果
 * 3. 连击效果
 * 4. 持续效果（添加至持续效果列表）
 * 5. 亡语效果（如卡牌被移除）
 */

import type { 
  Card, 
  CardEffect,
  LevelChangeEffect,
  ResourceEffect,
  CardDrawEffect,
  DiceCheckEffect
} from '@/types/legacy/card_v16';
import type { GameState, Player, Resources } from '@/types/gameRules';
import { gameLogger } from './GameLogger';

// ============================================
// 效果类型定义
// ============================================

/** 效果阶段类型 */
export type EffectPhase = 
  | 'judgment'      // 判定效果
  | 'main'          // 主要效果
  | 'combo'         // 连击效果
  | 'sustain'       // 持续效果
  | 'deathrattle';  // 亡语效果

/** 卡牌效果结算结果 */
export interface CardEffectExecutionResult {
  success: boolean;
  phase: EffectPhase;
  changes: {
    playerId: string;
    resourceChanges?: Partial<Resources>;
    levelChanges?: { 
      infiltration?: number; 
      safety?: number;
    };
    markerChanges?: {
      area?: string;
      count?: number;
    };
  }[];
  messages: string[];
  nextPhases: EffectPhase[];
}

/** 效果结算上下文 */
export interface EffectExecutionContext {
  gameState: GameState;
  playerId: string;
  card: Card;
  isComboTriggered?: boolean;
  isBigSuccess?: boolean;
  isBigFailure?: boolean;
  previousCardType?: string;
  nextCardType?: string;
}

// ============================================
// 效果结算系统
// ============================================

export class EffectExecutionSystem {
  /**
   * 按照R7.4规则执行完整的卡牌效果结算
   */
  static executeCardEffect(context: EffectExecutionContext): Map<EffectPhase, CardEffectExecutionResult> {
    const results = new Map<EffectPhase, CardEffectExecutionResult>();
    const { card } = context;
    
    gameLogger.info('effect_triggered', `开始执行卡牌效果: ${card.name}`, {
      extra: {
        cardId: card.card_code,
        cardName: card.name,
        playerId: context.playerId,
        isComboTriggered: context.isComboTriggered,
        isBigSuccess: context.isBigSuccess,
      }
    });

    // 阶段1: 判定效果（如有）
    if (this.hasJudgmentEffect(card)) {
      const judgmentResult = this.executeJudgmentPhase(context);
      results.set('judgment', judgmentResult);
      
      if (!judgmentResult.success && !context.isBigSuccess) {
        gameLogger.info('effect_triggered', `判定失败，跳过后续效果`, {
          extra: { cardId: card.card_code, cardName: card.name }
        });
        return results;
      }
    }

    // 阶段2: 主要效果
    const mainResult = this.executeMainPhase(context);
    results.set('main', mainResult);

    // 阶段3: 连击效果
    if (context.isComboTriggered && card.comboEffect) {
      const comboResult = this.executeComboPhase(context);
      results.set('combo', comboResult);
    }

    // 阶段4: 持续效果
    if (card.sustainEffect) {
      const sustainResult = this.executeSustainPhase(context);
      results.set('sustain', sustainResult);
    }

    // 阶段5: 亡语效果（在卡牌被移除时触发，这里只是注册）
    if (this.hasDeathrattleEffect(card)) {
      const deathrattleResult = this.registerDeathrattlePhase(context);
      results.set('deathrattle', deathrattleResult);
    }

    return results;
  }

  /**
   * 检查卡牌是否有判定效果
   */
  private static hasJudgmentEffect(card: Card): boolean {
    return card.effects.some(effect => effect.type === 'dice_check');
  }

  /**
   * 检查卡牌是否有亡语效果
   */
  private static hasDeathrattleEffect(card: Card): boolean {
    return card.description.includes('亡语') || card.description.includes('被移除时');
  }

  /**
   * 执行判定阶段
   */
  private static executeJudgmentPhase(context: EffectExecutionContext): CardEffectExecutionResult {
    const { card, isBigSuccess, isBigFailure } = context;
    
    const judgmentEffect = card.effects.find(e => e.type === 'dice_check') as DiceCheckEffect | undefined;

    if (!judgmentEffect) {
      return {
        success: true,
        phase: 'judgment',
        changes: [],
        messages: ['无判定效果'],
        nextPhases: ['main'],
      };
    }

    // 简化处理：实际应该调用判定系统
    const success = isBigSuccess || (!isBigFailure && Math.random() > 0.5);
    
    const messages: string[] = [];
    if (isBigSuccess) {
      messages.push('大成功！判定自动通过且效果增强');
    } else if (isBigFailure) {
      messages.push('大失败！判定失败且受到额外惩罚');
    } else {
      messages.push(success ? '判定成功！' : '判定失败！');
    }

    gameLogger.info('effect_triggered', `判定阶段: ${success ? '成功' : '失败'}`, {
      extra: {
        cardId: card.card_code,
        isBigSuccess,
        isBigFailure,
        success,
      }
    });

    return {
      success,
      phase: 'judgment',
      changes: [],
      messages,
      nextPhases: success ? ['main'] : [],
    };
  }

  /**
   * 执行主要效果阶段
   */
  private static executeMainPhase(context: EffectExecutionContext): CardEffectExecutionResult {
    const { card, playerId, gameState, isBigSuccess } = context;
    const changes: CardEffectExecutionResult['changes'] = [];
    const messages: string[] = [];

    const player = gameState.players.find(p => p.id === playerId);
    const opponent = gameState.players.find(p => p.id !== playerId);

    if (!player) {
      return {
        success: false,
        phase: 'main',
        changes: [],
        messages: ['找不到玩家'],
        nextPhases: [],
      };
    }

    // 执行所有主要效果
    for (const effect of card.effects) {
      this.executeSingleEffect(effect, player, opponent, isBigSuccess, changes, messages);
    }

    gameLogger.info('effect_triggered', `主要效果阶段执行完成`, {
      extra: {
        cardId: card.card_code,
        cardName: card.name,
        effectCount: card.effects.length,
        changeCount: changes.length,
      }
    });

    return {
      success: true,
      phase: 'main',
      changes,
      messages,
      nextPhases: context.isComboTriggered ? ['combo'] : [],
    };
  }

  /**
   * 执行单个效果
   */
  private static executeSingleEffect(
    effect: CardEffect,
    player: Player,
    opponent: Player | undefined,
    isBigSuccess: boolean | undefined,
    changes: CardEffectExecutionResult['changes'],
    messages: string[]
  ): void {
    let value = isBigSuccess ? 2 : 0;

    switch (effect.type) {
      case 'infiltration_gain':
      case 'infiltration_reduce': {
        const levelEffect = effect as LevelChangeEffect;
        const finalValue = levelEffect.baseValue + value;
        const targetPlayer = effect.type === 'infiltration_reduce' && opponent ? opponent : player;
        
        changes.push({
          playerId: targetPlayer.id,
          levelChanges: { infiltration: finalValue },
        });
        messages.push(`${targetPlayer.name} 的渗透等级 ${finalValue > 0 ? '+' : ''}${finalValue}`);
        break;
      }

      case 'security_gain':
      case 'security_reduce': {
        const levelEffect = effect as LevelChangeEffect;
        const finalValue = levelEffect.baseValue + value;
        const targetPlayer = effect.type === 'security_reduce' && opponent ? opponent : player;
        
        changes.push({
          playerId: targetPlayer.id,
          levelChanges: { safety: finalValue },
        });
        messages.push(`${targetPlayer.name} 的安全等级 ${finalValue > 0 ? '+' : ''}${finalValue}`);
        break;
      }

      case 'resource_gain':
      case 'resource_steal': {
        const resourceEffect = effect as ResourceEffect;
        const targetPlayer = resourceEffect.target === 'opponent' && opponent ? opponent : player;
        
        const resourceChange: Partial<Resources> = {};
        // 使用类型断言来避免索引错误
        (resourceChange as Record<string, number>)[resourceEffect.resourceType] = resourceEffect.value;
        
        changes.push({
          playerId: targetPlayer.id,
          resourceChanges: resourceChange,
        });
        messages.push(`${targetPlayer.name} 获得 ${resourceEffect.resourceType} ${resourceEffect.value}`);
        break;
      }

      case 'draw':
      case 'discard': {
        const drawEffect = effect as CardDrawEffect;
        const targetPlayer = drawEffect.target === 'opponent' && opponent ? opponent : player;
        
        messages.push(`${targetPlayer.name} ${effect.type === 'draw' ? '抽取' : '弃置'} ${drawEffect.value} 张牌`);
        break;
      }

      default:
        break;
    }
  }

  /**
   * 执行连击效果阶段
   */
  private static executeComboPhase(context: EffectExecutionContext): CardEffectExecutionResult {
    const { card, playerId, gameState } = context;
    const changes: CardEffectExecutionResult['changes'] = [];
    const messages: string[] = [];

    if (!card.comboEffect) {
      return {
        success: true,
        phase: 'combo',
        changes: [],
        messages: ['无连击效果'],
        nextPhases: [],
      };
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return {
        success: false,
        phase: 'combo',
        changes: [],
        messages: ['找不到玩家'],
        nextPhases: [],
      };
    }

    const comboEffect = card.comboEffect;
    const bonus = comboEffect.bonus;
    
    // 根据连击触发条件应用不同效果
    if (comboEffect.trigger?.includes('infiltration')) {
      changes.push({
        playerId: player.id,
        levelChanges: { infiltration: bonus },
      });
      messages.push(`连击！渗透额外 +${bonus}`);
    } else if (comboEffect.trigger?.includes('security')) {
      changes.push({
        playerId: player.id,
        levelChanges: { safety: bonus },
      });
      messages.push(`连击！安全额外 +${bonus}`);
    } else if (comboEffect.trigger?.includes('resource')) {
      const resourceChange: Partial<Resources> = {};
      (resourceChange as Record<string, number>)['computing'] = bonus;
      changes.push({
        playerId: player.id,
        resourceChanges: resourceChange,
      });
      messages.push(`连击！获得 ${bonus} 算力`);
    } else {
      messages.push(`连击触发！${comboEffect.description}`);
    }

    gameLogger.info('effect_triggered', `连击效果阶段: ${comboEffect.description}`, {
      extra: {
        cardId: card.card_code,
        trigger: comboEffect.trigger,
        bonus,
      }
    });

    return {
      success: true,
      phase: 'combo',
      changes,
      messages,
      nextPhases: card.sustainEffect ? ['sustain'] : [],
    };
  }

  /**
   * 执行持续效果阶段
   */
  private static executeSustainPhase(context: EffectExecutionContext): CardEffectExecutionResult {
    const { card } = context;
    const messages: string[] = [];

    if (!card.sustainEffect) {
      return {
        success: true,
        phase: 'sustain',
        changes: [],
        messages: ['无持续效果'],
        nextPhases: [],
      };
    }

    const sustainEffect = card.sustainEffect;
    messages.push(`持续效果已激活：${sustainEffect.description}`);
    messages.push(`持续 ${sustainEffect.duration} 回合`);

    gameLogger.info('effect_triggered', `持续效果阶段: ${sustainEffect.description}`, {
      extra: {
        cardId: card.card_code,
        duration: sustainEffect.duration,
      }
    });

    return {
      success: true,
      phase: 'sustain',
      changes: [],
      messages,
      nextPhases: this.hasDeathrattleEffect(card) ? ['deathrattle'] : [],
    };
  }

  /**
   * 注册亡语效果阶段
   */
  private static registerDeathrattlePhase(context: EffectExecutionContext): CardEffectExecutionResult {
    const { card, playerId } = context;
    const messages: string[] = [];

    messages.push(`亡语效果已注册：卡牌被移除时触发`);

    gameLogger.info('effect_triggered', `亡语效果阶段: 已注册`, {
      extra: {
        cardId: card.card_code,
        cardName: card.name,
        playerId,
      }
    });

    return {
      success: true,
      phase: 'deathrattle',
      changes: [],
      messages,
      nextPhases: [],
    };
  }

  /**
   * 获取效果结算顺序描述
   */
  static getEffectOrderDescription(): string[] {
    return [
      '1. 判定效果（如有）- 骰子判定或RPS判定',
      '2. 主要效果 - 卡牌的核心效果',
      '3. 连击效果 - 满足连击条件时触发',
      '4. 持续效果 - 添加至持续效果列表，每回合触发',
      '5. 亡语效果 - 卡牌被移除时触发',
    ];
  }
}

// ============================================
// 便捷函数
// ============================================

export function executeCardEffect(
  card: Card,
  gameState: GameState,
  playerId: string,
  options?: {
    isComboTriggered?: boolean;
    isBigSuccess?: boolean;
    isBigFailure?: boolean;
    previousCardType?: string;
    nextCardType?: string;
  }
): Map<EffectPhase, CardEffectExecutionResult> {
  const context: EffectExecutionContext = {
    gameState,
    playerId,
    card,
    ...options,
  };

  return EffectExecutionSystem.executeCardEffect(context);
}

export default EffectExecutionSystem;
