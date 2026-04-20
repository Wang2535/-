/**
 * 《道高一丈：数字博弈》v17.0 - 延迟效果系统
 * 
 * 实现规则文档 R8.5 延迟机制
 * 
 * 核心功能：
 * 1. 延迟效果注册与队列管理
 * 2. 回合结束时触发延迟效果
 * 3. 延迟效果可视化
 */

import type { Card } from '@/types/legacy/card_v16';
import { gameLogger } from './GameLogger';

/**
 * 延迟效果类型
 */
export type DelayedEffectType =
  | 'damage'           // 延迟伤害
  | 'heal'             // 延迟恢复
  | 'draw'             // 延迟抽卡
  | 'resource'         // 延迟资源
  | 'buff'             // 延迟增益
  | 'debuff'           // 延迟减益
  | 'infiltration'     // 延迟渗透
  | 'safety'           // 延迟安全
  | 'special';         // 特殊效果

/**
 * 延迟效果定义
 */
export interface DelayedEffect {
  id: string;
  type: DelayedEffectType;
  value: number;
  description: string;
  target: 'self' | 'opponent' | 'all' | 'area';
  delayTurns: number;      // 延迟回合数
  remainingTurns: number;  // 剩余回合数
  sourceCardId?: string;   // 来源卡牌
  ownerId: string;         // 效果拥有者
  area?: string;           // 目标区域
  isRecurring?: boolean;   // 是否周期性触发
}

/**
 * 延迟效果实例
 */
export interface DelayedEffectInstance extends DelayedEffect {
  instanceId: string;
  createdAt: number;       // 创建回合
}

/**
 * 延迟效果触发结果
 */
export interface DelayedEffectTriggerResult {
  triggered: boolean;
  effects: DelayedEffectInstance[];
  logs: string[];
  visualEffects: boolean;
}

/**
 * 延迟效果系统状态
 */
interface DelayedEffectState {
  effects: Map<string, DelayedEffectInstance>;  // instanceId -> effect
  effectCounter: number;
}

// 全局状态
const state: DelayedEffectState = {
  effects: new Map(),
  effectCounter: 0,
};

/**
 * 延迟效果系统
 */
export class DelayedEffectSystem {
  /**
   * 注册延迟效果
   */
  static registerEffect(
    effect: Omit<DelayedEffect, 'remainingTurns'>,
    currentTurn: number
  ): DelayedEffectInstance {
    const instanceId = `delayed_${++state.effectCounter}`;
    
    const instance: DelayedEffectInstance = {
      ...effect,
      instanceId,
      remainingTurns: effect.delayTurns,
      createdAt: currentTurn,
    };

    state.effects.set(instanceId, instance);

    gameLogger.info('effect_triggered', `注册延迟效果`, {
      extra: {
        instanceId,
        type: effect.type,
        delayTurns: effect.delayTurns,
        ownerId: effect.ownerId,
        sourceCardId: effect.sourceCardId,
      }
    });

    return instance;
  }

  /**
   * 从卡牌创建延迟效果
   */
  static createEffectFromCard(
    card: Card,
    ownerId: string,
    currentTurn: number,
    delayTurns: number = 1
  ): DelayedEffectInstance | null {
    // 解析卡牌的延迟效果
    const effectType = this.parseDelayedEffectType(card);
    if (!effectType) return null;

    const value = this.extractEffectValue(card) || 1;
    const cardCode = card.card_code || 'unknown';
    
    return this.registerEffect({
      id: `${cardCode}_delayed`,
      type: effectType,
      value,
      description: `延迟效果: ${card.name}将在${delayTurns}回合后发动`,
      target: 'self',
      delayTurns,
      sourceCardId: cardCode,
      ownerId,
    }, currentTurn);
  }

  /**
   * 解析延迟效果类型
   */
  private static parseDelayedEffectType(card: Card): DelayedEffectType | null {
    const desc = card.description || '';
    
    if (desc.includes('延迟') || desc.includes('下回合') || desc.includes('X回合后')) {
      if (desc.includes('渗透')) return 'infiltration';
      if (desc.includes('安全')) return 'safety';
      if (desc.includes('抽卡') || desc.includes('抽')) return 'draw';
      if (desc.includes('资源') || desc.includes('资金') || desc.includes('算力')) return 'resource';
      if (desc.includes('伤害')) return 'damage';
      if (desc.includes('恢复') || desc.includes('治疗')) return 'heal';
      return 'special';
    }
    
    return null;
  }

  /**
   * 提取效果数值
   */
  private static extractEffectValue(card: Card): number | null {
    const desc = card.description || '';
    const match = desc.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * 回合结束时处理延迟效果
   */
  static processEndOfTurn(currentTurn: number): DelayedEffectTriggerResult {
    const triggeredEffects: DelayedEffectInstance[] = [];
    const logs: string[] = [];
    const effectsToRemove: string[] = [];
    const effectsToUpdate: DelayedEffectInstance[] = [];

    logs.push(`【延迟效果结算】回合 ${currentTurn} 结束`);

    state.effects.forEach((effect, instanceId) => {
      // 减少剩余回合数
      effect.remainingTurns--;

      if (effect.remainingTurns <= 0) {
        // 效果触发
        triggeredEffects.push(effect);
        logs.push(`  → ${effect.description} 触发！`);
        
        // 如果是周期性效果，重置回合数
        if (effect.isRecurring) {
          effect.remainingTurns = effect.delayTurns;
          effectsToUpdate.push(effect);
        } else {
          effectsToRemove.push(instanceId);
        }

        gameLogger.info('effect_triggered', `延迟效果触发`, {
          extra: {
            instanceId,
            type: effect.type,
            value: effect.value,
            ownerId: effect.ownerId,
          }
        });
      } else {
        logs.push(`  → ${effect.description} 还剩 ${effect.remainingTurns} 回合`);
      }
    });

    // 移除已触发的一次性效果
    effectsToRemove.forEach(id => state.effects.delete(id));

    return {
      triggered: triggeredEffects.length > 0,
      effects: triggeredEffects,
      logs,
      visualEffects: triggeredEffects.length > 0,
    };
  }

  /**
   * 立即触发指定延迟效果
   */
  static triggerEffectImmediately(instanceId: string): DelayedEffectInstance | null {
    const effect = state.effects.get(instanceId);
    if (!effect) return null;

    // 移除效果
    state.effects.delete(instanceId);

    gameLogger.info('effect_triggered', `延迟效果被立即触发`, {
      extra: {
        instanceId,
        type: effect.type,
        ownerId: effect.ownerId,
      }
    });

    return effect;
  }

  /**
   * 取消延迟效果
   */
  static cancelEffect(instanceId: string): boolean {
    const effect = state.effects.get(instanceId);
    if (!effect) return false;

    state.effects.delete(instanceId);

    gameLogger.info('effect_triggered', `延迟效果被取消`, {
      extra: {
        instanceId,
        type: effect.type,
        ownerId: effect.ownerId,
      }
    });

    return true;
  }

  /**
   * 取消指定玩家的所有延迟效果
   */
  static cancelPlayerEffects(playerId: string): number {
    let count = 0;
    const toRemove: string[] = [];

    state.effects.forEach((effect, instanceId) => {
      if (effect.ownerId === playerId) {
        toRemove.push(instanceId);
        count++;
      }
    });

    toRemove.forEach(id => state.effects.delete(id));

    gameLogger.info('effect_triggered', `取消玩家所有延迟效果`, {
      extra: {
        playerId,
        cancelledCount: count,
      }
    });

    return count;
  }

  /**
   * 获取所有待触发的延迟效果
   */
  static getPendingEffects(): DelayedEffectInstance[] {
    return Array.from(state.effects.values()).sort((a, b) => 
      a.remainingTurns - b.remainingTurns
    );
  }

  /**
   * 获取指定玩家的延迟效果
   */
  static getPlayerEffects(playerId: string): DelayedEffectInstance[] {
    return Array.from(state.effects.values())
      .filter(effect => effect.ownerId === playerId)
      .sort((a, b) => a.remainingTurns - b.remainingTurns);
  }

  /**
   * 获取指定区域的延迟效果
   */
  static getAreaEffects(area: string): DelayedEffectInstance[] {
    return Array.from(state.effects.values())
      .filter(effect => effect.area === area)
      .sort((a, b) => a.remainingTurns - b.remainingTurns);
  }

  /**
   * 延长延迟效果
   */
  static extendEffect(instanceId: string, additionalTurns: number): boolean {
    const effect = state.effects.get(instanceId);
    if (!effect) return false;

    effect.remainingTurns += additionalTurns;

    gameLogger.info('effect_triggered', `延迟效果被延长`, {
      extra: {
        instanceId,
        additionalTurns,
        newRemaining: effect.remainingTurns,
      }
    });

    return true;
  }

  /**
   * 缩短延迟效果
   */
  static shortenEffect(instanceId: string, reduceTurns: number): boolean {
    const effect = state.effects.get(instanceId);
    if (!effect) return false;

    effect.remainingTurns = Math.max(0, effect.remainingTurns - reduceTurns);

    gameLogger.info('effect_triggered', `延迟效果被缩短`, {
      extra: {
        instanceId,
        reduceTurns,
        newRemaining: effect.remainingTurns,
      }
    });

    return true;
  }

  /**
   * 获取延迟效果统计
   */
  static getStats(): {
    totalEffects: number;
    byType: Record<DelayedEffectType, number>;
    byPlayer: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byPlayer: Record<string, number> = {};

    state.effects.forEach(effect => {
      byType[effect.type] = (byType[effect.type] || 0) + 1;
      byPlayer[effect.ownerId] = (byPlayer[effect.ownerId] || 0) + 1;
    });

    return {
      totalEffects: state.effects.size,
      byType: byType as Record<DelayedEffectType, number>,
      byPlayer,
    };
  }

  /**
   * 清空所有延迟效果
   */
  static reset(): void {
    state.effects.clear();
    state.effectCounter = 0;

    gameLogger.info('effect_triggered', '延迟效果系统已重置');
  }
}

// 便捷导出
export default DelayedEffectSystem;
