/**
 * 《道高一丈：数字博弈》v17.0 - 卡牌特殊效果系统
 * 
 * 功能：实现连击、延迟、亡语、持续效果
 * 规则依据：完善的游戏规则.md R7.2
 */

import { gameLogger } from './GameLogger';

/**
 * 特殊效果类型
 */
export type SpecialEffectType = 'combo' | 'delay' | 'deathrattle' | 'persistent' | 'aura';

/**
 * 连击效果
 */
export interface ComboEffect {
  type: 'combo';
  triggerCondition: 'same_type' | 'previous_card' | 'next_card';
  requiredCardType?: string;
  bonusEffect: {
    type: 'infiltration' | 'safety' | 'resource' | 'draw';
    value: number;
  };
  description: string;
}

/**
 * 延迟效果
 */
export interface DelayEffect {
  type: 'delay';
  delayTurns: number;
  effect: {
    type: 'infiltration' | 'safety' | 'resource' | 'damage';
    value: number;
    target: 'self' | 'opponent';
  };
  description: string;
}

/**
 * 亡语效果
 */
export interface DeathrattleEffect {
  type: 'deathrattle';
  trigger: 'discard' | 'destroy' | 'remove';
  effect: {
    type: 'infiltration' | 'safety' | 'resource' | 'damage' | 'draw' | 'place_marker';
    value: number;
    target?: 'self' | 'opponent' | 'random_area';
  };
  description: string;
}

/**
 * 持续效果
 */
export interface PersistentEffect {
  type: 'persistent';
  duration: number;
  effect: {
    type: 'infiltration_per_turn' | 'safety_per_turn' | 'resource_per_turn' | 'difficulty_modifier';
    value: number;
    resourceType?: 'computing' | 'funds' | 'information';
  };
  description: string;
}

/**
 * 效果容器
 */
export type CardSpecialEffect = ComboEffect | DelayEffect | DeathrattleEffect | PersistentEffect;

/**
 * 待处理的延迟效果
 */
interface PendingDelayEffect {
  id: string;
  cardId: string;
  playerId: string;
  effect: DelayEffect;
  triggerTurn: number;
}

/**
 * 激活的持续效果
 */
interface ActivePersistentEffect {
  id: string;
  cardId: string;
  playerId: string;
  effect: PersistentEffect;
  remainingTurns: number;
  startedAt: number;
}

/**
 * 卡牌效果系统
 */
export class CardEffectSystem {
  private static instance: CardEffectSystem;
  private pendingDelays: PendingDelayEffect[] = [];
  private activePersistent: ActivePersistentEffect[] = [];
  private lastPlayedCardType: Map<string, string> = new Map();
  private effectCounter: number = 0;

  private constructor() {}

  static getInstance(): CardEffectSystem {
    if (!CardEffectSystem.instance) {
      CardEffectSystem.instance = new CardEffectSystem();
    }
    return CardEffectSystem.instance;
  }

  /**
   * 检查连击条件
   */
  checkCombo(
    playerId: string,
    currentCardType: string,
    comboEffect: ComboEffect
  ): { triggered: boolean; bonus?: ComboEffect['bonusEffect'] } {
    const lastType = this.lastPlayedCardType.get(playerId);
    
    let triggered = false;

    switch (comboEffect.triggerCondition) {
      case 'same_type':
        triggered = lastType === currentCardType;
        break;
      case 'previous_card':
        triggered = lastType === comboEffect.requiredCardType;
        break;
      case 'next_card':
        triggered = false;
        break;
    }

    this.lastPlayedCardType.set(playerId, currentCardType);

    if (triggered) {
      gameLogger.info('EFFECT', `连击效果触发`, {
        playerId,
        currentCardType,
        condition: comboEffect.triggerCondition,
        bonus: comboEffect.bonusEffect,
      });
      return { triggered: true, bonus: comboEffect.bonusEffect };
    }

    return { triggered: false };
  }

  /**
   * 添加延迟效果
   */
  addDelayEffect(
    cardId: string,
    playerId: string,
    effect: DelayEffect,
    currentTurn: number
  ): string {
    const id = `delay_${++this.effectCounter}`;
    const pendingEffect: PendingDelayEffect = {
      id,
      cardId,
      playerId,
      effect,
      triggerTurn: currentTurn + effect.delayTurns,
    };

    this.pendingDelays.push(pendingEffect);

    gameLogger.info('EFFECT', `延迟效果已添加`, {
      id,
      cardId,
      playerId,
      delayTurns: effect.delayTurns,
      triggerTurn: pendingEffect.triggerTurn,
      effect: effect.effect,
    });

    return id;
  }

  /**
   * 处理延迟效果（在回合结束时调用）
   */
  processDelayEffects(currentTurn: number): PendingDelayEffect[] {
    const effectsToTrigger = this.pendingDelays.filter(
      e => e.triggerTurn <= currentTurn
    );

    this.pendingDelays = this.pendingDelays.filter(
      e => e.triggerTurn > currentTurn
    );

    effectsToTrigger.forEach(effect => {
      gameLogger.info('EFFECT', `延迟效果触发`, {
        id: effect.id,
        cardId: effect.cardId,
        playerId: effect.playerId,
        effect: effect.effect.effect,
      });
    });

    return effectsToTrigger;
  }

  /**
   * 添加持续效果
   */
  addPersistentEffect(
    cardId: string,
    playerId: string,
    effect: PersistentEffect,
    currentTurn: number
  ): string {
    const id = `persistent_${++this.effectCounter}`;
    const activeEffect: ActivePersistentEffect = {
      id,
      cardId,
      playerId,
      effect,
      remainingTurns: effect.duration,
      startedAt: currentTurn,
    };

    this.activePersistent.push(activeEffect);

    gameLogger.info('EFFECT', `持续效果已添加`, {
      id,
      cardId,
      playerId,
      duration: effect.duration,
      effect: effect.effect,
    });

    return id;
  }

  /**
   * 处理持续效果（每回合开始时调用）
   */
  processPersistentEffects(): ActivePersistentEffect[] {
    return this.activePersistent.filter(e => e.remainingTurns > 0);
  }

  /**
   * 减少持续效果剩余回合数（回合结束时调用）
   */
  decrementPersistentEffects(): void {
    this.activePersistent.forEach(effect => {
      effect.remainingTurns--;
    });

    const expiredEffects = this.activePersistent.filter(e => e.remainingTurns <= 0);
    this.activePersistent = this.activePersistent.filter(e => e.remainingTurns > 0);

    expiredEffects.forEach(effect => {
      gameLogger.info('EFFECT', `持续效果已过期`, {
        id: effect.id,
        cardId: effect.cardId,
        playerId: effect.playerId,
      });
    });
  }

  /**
   * 触发亡语效果
   */
  triggerDeathrattle(
    cardId: string,
    playerId: string,
    effect: DeathrattleEffect,
    triggerType: 'discard' | 'destroy' | 'remove'
  ): DeathrattleEffect['effect'] | null {
    if (effect.trigger !== triggerType && effect.trigger !== 'remove') {
      return null;
    }

    gameLogger.info('EFFECT', `亡语效果触发`, {
      cardId,
      playerId,
      trigger: triggerType,
      effect: effect.effect,
    });

    return effect.effect;
  }

  /**
   * 获取玩家的所有持续效果
   */
  getPlayerPersistentEffects(playerId: string): ActivePersistentEffect[] {
    return this.activePersistent.filter(e => e.playerId === playerId);
  }

  /**
   * 获取所有激活的持续效果
   */
  getAllPersistentEffects(): ActivePersistentEffect[] {
    return this.activePersistent;
  }

  /**
   * 获取待处理的延迟效果
   */
  getPendingDelayEffects(): PendingDelayEffect[] {
    return this.pendingDelays;
  }

  /**
   * 移除特定效果
   */
  removeEffect(effectId: string): boolean {
    const delayIndex = this.pendingDelays.findIndex(e => e.id === effectId);
    if (delayIndex !== -1) {
      this.pendingDelays.splice(delayIndex, 1);
      gameLogger.info('EFFECT', `延迟效果已移除`, { effectId });
      return true;
    }

    const persistentIndex = this.activePersistent.findIndex(e => e.id === effectId);
    if (persistentIndex !== -1) {
      this.activePersistent.splice(persistentIndex, 1);
      gameLogger.info('EFFECT', `持续效果已移除`, { effectId });
      return true;
    }

    return false;
  }

  /**
   * 清除玩家的所有效果
   */
  clearPlayerEffects(playerId: string): void {
    this.pendingDelays = this.pendingDelays.filter(e => e.playerId !== playerId);
    this.activePersistent = this.activePersistent.filter(e => e.playerId !== playerId);
    this.lastPlayedCardType.delete(playerId);

    gameLogger.info('EFFECT', `玩家所有效果已清除`, { playerId });
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.pendingDelays = [];
    this.activePersistent = [];
    this.lastPlayedCardType.clear();
    this.effectCounter = 0;
    gameLogger.info('EFFECT', '卡牌效果系统已重置');
  }

  /**
   * 获取效果统计
   */
  getEffectStats(): {
    pendingDelays: number;
    activePersistent: number;
  } {
    return {
      pendingDelays: this.pendingDelays.length,
      activePersistent: this.activePersistent.length,
    };
  }
}

export const cardEffectSystem = CardEffectSystem.getInstance();

export default CardEffectSystem;
