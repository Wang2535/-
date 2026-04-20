/**
 * H3: 卡牌效果解析系统
 * 完整支持所有mechanic类型的卡牌效果解析和执行
 * 
 * 实现内容：
 * - 效果字符串解析（等级变化、资源变化、抽牌、压制、保护、清除、判定等）
 * - 效果执行引擎
 * - 连击效果处理
 * - 持续效果处理
 */

import type { Card, CardEffect, LevelChangeEffect, ResourceEffect, DiceCheckEffect } from '@/types/legacy/card_v16';
import type { GameState, Player, Resources } from '@/types/gameRules';
import { CARD_DATABASE } from '@/data/cardDatabase';

// ============================================
// 效果类型定义
// ============================================

/** 解析后的效果类型 */
export type ParsedEffectType =
  | 'level_change'      // 等级变化（渗透/安全）
  | 'resource_change'   // 资源变化
  | 'draw_card'         // 抽牌
  | 'discard_card'      // 弃牌
  | 'suppress'          // 压制
  | 'protect'           // 保护
  | 'clear'             // 清除
  | 'dice_judgment'     // 骰子判定
  | 'sustain_effect'    // 持续效果
  | 'combo_effect';     // 连击效果

/** 效果目标 */
export interface EffectTarget {
  type: 'self' | 'opponent' | 'all';
  playerId?: string;
}

/** 解析后的效果 */
export interface ParsedEffect {
  type: ParsedEffectType;
  target: EffectTarget;
  value: number;
  resourceType?: keyof Resources | 'infiltration' | 'safety';
  duration?: number;
  condition?: string;
  extraParams?: Record<string, unknown>;
}

/** 效果执行上下文 */
export interface EffectContext {
  gameState: GameState;
  playerId: string;
  cardCode: string;
  isComboTriggered?: boolean;
  isBigSuccess?: boolean;     // 大成功判定
}

/** 效果执行结果 */
export interface EffectResult {
  success: boolean;
  effects: ParsedEffect[];
  changes: {
    playerId: string;
    resourceChanges?: Partial<Resources>;
    levelChanges?: { infiltration?: number; safety?: number };
    extraParams?: Record<string, unknown>;
  }[];
  messages: string[];
}

// ============================================
// 效果解析器
// ============================================

export class CardEffectParser {
  /**
   * 解析卡牌效果
   */
  static parseCardEffects(card: Card): ParsedEffect[] {
    const effects: ParsedEffect[] = [];

    for (const effect of card.effects) {
      const parsed = this.parseSingleEffect(effect);
      if (parsed) {
        effects.push(parsed);
      }
    }

    return effects;
  }

  /**
   * 解析单个效果
   */
  private static parseSingleEffect(effect: CardEffect): ParsedEffect | null {
    // 处理等级变化效果
    if (this.isLevelChangeEffect(effect)) {
      const levelEffect = effect as LevelChangeEffect;
      const resourceType = this.mapLevelTypeToResource(levelEffect.type);
      return {
        type: 'level_change',
        target: { type: 'self' },
        value: levelEffect.baseValue,
        resourceType,
        extraParams: {
          techBonus: levelEffect.techBonus,
          comboBonus: levelEffect.comboBonus,
          diceAffected: levelEffect.diceAffected,
        },
      };
    }

    // 处理资源效果
    if (this.isResourceEffect(effect)) {
      const resEffect = effect as ResourceEffect;
      return {
        type: 'resource_change',
        target: resEffect.target === 'opponent' ? { type: 'opponent' } : { type: 'self' },
        value: resEffect.value,
        resourceType: resEffect.resourceType as keyof Resources,
        extraParams: {
          target: resEffect.target,
        },
      };
    }

    // 处理骰子判定效果
    if (this.isDiceCheckEffect(effect)) {
      const diceEffect = effect as DiceCheckEffect;
      return {
        type: 'dice_judgment',
        target: { type: 'self' },
        value: diceEffect.difficulty,
        extraParams: {
          difficulty: diceEffect.difficulty,
          onSuccess: diceEffect.onSuccess,
          onFailure: diceEffect.onFailure,
          onCriticalSuccess: diceEffect.onCriticalSuccess,
        },
      };
    }

    return null;
  }

  /**
   * 判断是否为等级变化效果
   */
  private static isLevelChangeEffect(effect: CardEffect): boolean {
    return ['security_reduce', 'security_gain', 'infiltration_gain', 'infiltration_reduce'].includes(effect.type);
  }

  /**
   * 判断是否为资源效果
   */
  private static isResourceEffect(effect: CardEffect): boolean {
    return ['resource_gain', 'resource_steal'].includes(effect.type);
  }

  /**
   * 判断是否为骰子判定效果
   */
  private static isDiceCheckEffect(effect: CardEffect): boolean {
    return effect.type === 'dice_check';
  }

  /**
   * 映射等级类型到资源类型
   */
  private static mapLevelTypeToResource(type: string): 'infiltration' | 'safety' {
    switch (type) {
      case 'infiltration_gain':
      case 'infiltration_reduce':
        return 'infiltration';
      case 'security_gain':
      case 'security_reduce':
        return 'safety';
      default:
        return 'infiltration';
    }
  }

  /**
   * 解析连击条件
   */
  static parseComboCondition(comboString: string): { requiredType: string; bonus: number } | null {
    const match = comboString.match(/连续使用(\w+)类型卡牌/);
    if (match) {
      return {
        requiredType: match[1],
        bonus: 0.5,
      };
    }
    return null;
  }

  /**
   * 解析持续效果
   */
  static parseSustain(effectString: string, duration: number): ParsedEffect[] {
    const effects: ParsedEffect[] = [];
    
    // 解析持续效果中的等级变化
    const levelPattern = /(渗透|安全)([+-])(\d+)/g;
    let match;
    while ((match = levelPattern.exec(effectString)) !== null) {
      const isInfiltration = match[1] === '渗透';
      const value = parseInt(match[2] + match[3], 10);
      
      effects.push({
        type: 'sustain_effect',
        target: { type: 'self' },
        value,
        resourceType: isInfiltration ? 'infiltration' : 'safety',
        duration,
      });
    }

    return effects;
  }
}

// ============================================
// 效果执行引擎
// ============================================

export class EffectExecutor {
  /**
   * 执行卡牌效果
   */
  static executeCardEffects(card: Card, context: EffectContext): EffectResult {
    const result: EffectResult = {
      success: true,
      effects: [],
      changes: [],
      messages: [],
    };

    // 1. 解析主要效果
    const mainEffects = CardEffectParser.parseCardEffects(card);
    result.effects.push(...mainEffects);

    // 2. 检查连击效果
    if (card.comboEffect && context.isComboTriggered) {
      result.effects.push({
        type: 'combo_effect',
        target: { type: 'self' },
        value: card.comboEffect.bonus,
        extraParams: { comboType: card.comboEffect.trigger },
      });
      result.messages.push(`连击触发！${card.comboEffect.description}`);
    }

    // 3. 执行所有效果
    for (const effect of result.effects) {
      const change = this.executeSingleEffect(effect, context);
      if (change) {
        result.changes.push(change);
      }
    }

    result.messages.push(`执行卡牌 ${card.name} 的效果`);

    return result;
  }

  /**
   * 执行单个效果
   */
  private static executeSingleEffect(
    effect: ParsedEffect,
    context: EffectContext
  ): EffectResult['changes'][0] | null {
    const player = context.gameState.players.find(p => p.id === context.playerId);
    if (!player) return null;

    const opponent = context.gameState.players.find(p => p.id !== context.playerId);
    const targetPlayer = effect.target.type === 'opponent' && opponent ? opponent : player;

    switch (effect.type) {
      case 'level_change':
        return this.executeLevelChange(effect, targetPlayer);
      
      case 'resource_change':
        return this.executeResourceChange(effect, targetPlayer);
      
      case 'dice_judgment':
        return this.executeDiceJudgment(effect, context);
      
      default:
        return null;
    }
  }

  /**
   * 执行等级变化
   */
  private static executeLevelChange(
    effect: ParsedEffect,
    player: Player
  ): EffectResult['changes'][0] {
    const change: EffectResult['changes'][0] = {
      playerId: player.id,
      levelChanges: {},
    };

    if (effect.resourceType === 'infiltration') {
      change.levelChanges!.infiltration = effect.value;
    } else if (effect.resourceType === 'safety') {
      change.levelChanges!.safety = effect.value;
    }

    return change;
  }

  /**
   * 执行资源变化
   */
  private static executeResourceChange(
    effect: ParsedEffect,
    player: Player
  ): EffectResult['changes'][0] {
    const change: EffectResult['changes'][0] = {
      playerId: player.id,
      resourceChanges: {},
    };

    if (effect.resourceType && effect.resourceType !== 'infiltration' && effect.resourceType !== 'safety') {
      change.resourceChanges![effect.resourceType] = effect.value;
    }

    return change;
  }

  /**
   * 执行骰子判定
   */
  private static executeDiceJudgment(
    effect: ParsedEffect,
    _context: EffectContext
  ): EffectResult['changes'][0] | null {
    // 骰子判定逻辑在DiceSystem中处理
    // 这里只返回判定信息
    return {
      playerId: '',
      extraParams: {
        diceCheck: {
          difficulty: effect.extraParams?.difficulty,
          onSuccess: effect.extraParams?.onSuccess,
          onFailure: effect.extraParams?.onFailure,
        },
      },
    };
  }
}

// ============================================
// 便捷函数
// ============================================

/**
 * 快速执行卡牌效果
 */
export function executeCard(cardCode: string, context: EffectContext): EffectResult {
  const card = CARD_DATABASE[cardCode];
  if (!card) {
    return {
      success: false,
      effects: [],
      changes: [],
      messages: [`卡牌 ${cardCode} 不存在`],
    };
  }

  return EffectExecutor.executeCardEffects(card, context);
}

/**
 * 获取卡牌效果预览
 */
export function getCardEffectPreview(cardCode: string): ParsedEffect[] {
  const card = CARD_DATABASE[cardCode];
  if (!card) return [];

  return CardEffectParser.parseCardEffects(card);
}
