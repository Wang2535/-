import type { GameState, Resources } from '@/types/gameRules';
import roundStateLibrary from '@/data/RoundStateLibrary.json';
import { RoundStateEffectSystem } from './RoundStateEffectSystem';

// 回合状态定义
export interface RoundState {
  id: string;
  name: string;
  effect: string;
  weight: number;
}

// 回合状态分类
export interface RoundStateCategory {
  minRound: number;
  maxRound: number;
  description: string;
  variants: RoundState[];
}

// 当前激活的状态效果
export interface ActiveStateEffect {
  stateId: string;
  name: string;
  effect: string;
  appliedAt: number;
  expiresAtRound: number;
}

// 全局修改器
export interface GlobalModifiers {
  cardCostMultiplier: number;
  damageMultiplier: number;
  defenseMultiplier: number;
  resourceGainBonus: Partial<Resources>;
  specialRestrictions: string[];
  specialBonuses: string[];
}

// 默认修改器
const defaultModifiers: GlobalModifiers = {
  cardCostMultiplier: 1,
  damageMultiplier: 1,
  defenseMultiplier: 1,
  resourceGainBonus: {},
  specialRestrictions: [],
  specialBonuses: []
};

// 当前激活的修改器
let currentModifiers: GlobalModifiers = { ...defaultModifiers };

// 当前回合状态
let currentRoundState: ActiveStateEffect | null = null;

/**
 * 回合状态系统 - 动态局势管理
 * 
 * 核心功能：
 * 1. 根据回合数从对应分类中随机抽取状态
 * 2. 应用状态效果到全局修改器
 * 3. 提供状态查询和重置功能
 */
export class RoundStateSystem {
  
  /**
   * 根据回合数获取对应的状态分类
   */
  static getCategoryByRound(round: number): RoundStateCategory | null {
    const categories = roundStateLibrary.roundStates;
    
    for (const [, category] of Object.entries(categories)) {
      if (round >= category.minRound && round <= category.maxRound) {
        return category as RoundStateCategory;
      }
    }
    
    return null;
  }
  
  /**
   * 从指定分类中根据权重随机抽取一个状态
   */
  static drawRandomState(category: RoundStateCategory): RoundState | null {
    if (!category.variants || category.variants.length === 0) {
      return null;
    }
    
    // 计算总权重
    const totalWeight = category.variants.reduce((sum, v) => sum + v.weight, 0);
    
    // 随机数
    let random = Math.random() * totalWeight;
    
    // 根据权重选择
    for (const variant of category.variants) {
      random -= variant.weight;
      if (random <= 0) {
        return variant;
      }
    }
    
    // 兜底返回最后一个
    return category.variants[category.variants.length - 1];
  }
  
  /**
   * 解析效果字符串为结构化数据
   */
  static parseEffect(effect: string): {
    type: string;
    target: string;
    value: number;
    condition?: string;
  }[] {
    const effects: { type: string; target: string; value: number; condition?: string }[] = [];
    
    // 解析"所有卡牌算力消耗-1"格式
    const costPattern = /(.+?)消耗([+-]\d+|减半)/;
    const costMatch = effect.match(costPattern);
    if (costMatch) {
      const target = costMatch[1].trim();
      const valueStr = costMatch[2];
      const value = valueStr === '减半' ? -0.5 : parseInt(valueStr);
      effects.push({ type: 'cost', target, value });
    }
    
    // 解析"防御方资金+2"格式
    const gainPattern = /(.+?)(资金|算力|信息|权限)([+-]\d+)/g;
    let gainMatch;
    while ((gainMatch = gainPattern.exec(effect)) !== null) {
      const resource = gainMatch[2];
      const value = parseInt(gainMatch[3]);
      effects.push({ type: 'resource', target: resource, value });
    }
    
    // 解析"伤害+1"或"防御+2"格式
    const modifierPattern = /(伤害|防御|攻击|效果)([+-]\d+|翻倍|减半)/;
    const modifierMatch = effect.match(modifierPattern);
    if (modifierMatch) {
      const type = modifierMatch[1];
      const valueStr = modifierMatch[2];
      let value = 0;
      if (valueStr === '翻倍') value = 2;
      else if (valueStr === '减半') value = -0.5;
      else value = parseInt(valueStr);
      effects.push({ type: 'modifier', target: type, value });
    }
    
    // 解析"抽1张牌"格式
    const drawPattern = /抽(\d+)张牌/;
    const drawMatch = effect.match(drawPattern);
    if (drawMatch) {
      effects.push({ type: 'draw', target: 'all', value: parseInt(drawMatch[1]) });
    }
    
    return effects;
  }
  
  /**
   * 应用状态效果
   */
  static applyStateEffect(state: RoundState, currentRound: number): void {
    // 重置修改器
    currentModifiers = { ...defaultModifiers };
    
    // 解析效果
    const parsedEffects = this.parseEffect(state.effect);
    
    // 应用解析后的效果
    for (const effect of parsedEffects) {
      switch (effect.type) {
        case 'cost':
          if (effect.value < 0) {
            currentModifiers.cardCostMultiplier = 1 + effect.value; // 减消耗
          }
          break;
        case 'resource':
          const resourceKey = effect.target as keyof Resources;
          currentModifiers.resourceGainBonus[resourceKey] = effect.value;
          break;
        case 'modifier':
          if (effect.target === '伤害') {
            currentModifiers.damageMultiplier = effect.value > 0 ? 1 + effect.value : 0.5;
          } else if (effect.target === '防御') {
            currentModifiers.defenseMultiplier = effect.value > 0 ? 1 + effect.value : 0.5;
          }
          break;
      }
    }
    
    // 处理特殊效果（无法简单解析的）
    const effect = state.effect;
    
    // 特殊限制
    if (effect.includes('无法') || effect.includes('不能') || effect.includes('禁止')) {
      currentModifiers.specialRestrictions.push(effect);
    }
    
    // 特殊增益
    if (effect.includes('可') || effect.includes('获得') || effect.includes('立即')) {
      currentModifiers.specialBonuses.push(effect);
    }
    
    // 记录当前状态
    currentRoundState = {
      stateId: state.id,
      name: state.name,
      effect: state.effect,
      appliedAt: Date.now(),
      expiresAtRound: currentRound + 1
    };
  }
  
  /**
   * 开始新回合 - 抽取并应用状态
   * 
   * 注意：回合状态应该基于轮次（round）而不是回合（turn）
   * 每轮次（所有玩家完成一轮）触发一次回合状态
   */
  static startNewRound(gameState: GameState): GameState {
    // 使用 round（轮次）而不是 turn（回合）
    const currentRound = gameState.round;

    // 1. 获取分类
    const category = this.getCategoryByRound(currentRound);

    if (!category) {
      console.warn(`[RoundStateSystem] 未找到回合 ${currentRound} 对应的状态分类`);
      return gameState;
    }

    // 2. 随机抽取状态
    const selectedState = this.drawRandomState(category);

    if (!selectedState) {
      console.warn(`[RoundStateSystem] 分类 ${category.description} 中没有可用状态`);
      return gameState;
    }

    // 3. 应用基础效果（修改器）
    this.applyStateEffect(selectedState, currentRound);

    // 4. 使用新的效果系统执行完整效果
    const effectResult = RoundStateEffectSystem.executeStateEffect(gameState, selectedState);

    // 5. 创建日志条目
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      turn: gameState.turn,
      round: gameState.round,
      phase: gameState.currentPhase,
      action: 'round_state_applied',
      message: `应用轮次状态: ${selectedState.name}`,
      details: {
        roundState: {
          id: selectedState.id,
          name: selectedState.name,
          effect: selectedState.effect,
          category: category.description
        },
        effectLogs: effectResult.logs
      }
    };

    // 6. 将状态信息存储到游戏状态中
    let newState = {
      ...effectResult.gameState,
      log: [...effectResult.gameState.log, logEntry],
      currentRoundState: currentRoundState
    };

    // 7. 添加效果执行日志
    for (const log of effectResult.logs) {
      newState.log.push({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        turn: gameState.turn,
        round: gameState.round,
        phase: gameState.currentPhase,
        action: 'round_state_effect',
        message: log,
        details: { roundState: currentRoundState }
      });
    }

    return newState;
  }
  
  /**
   * 获取当前修改器
   */
  static getCurrentModifiers(): GlobalModifiers {
    return { ...currentModifiers };
  }
  
  /**
   * 获取当前回合状态
   */
  static getCurrentRoundState(): ActiveStateEffect | null {
    return currentRoundState;
  }
  
  /**
   * 重置系统
   */
  static reset(): void {
    currentModifiers = { ...defaultModifiers };
    currentRoundState = null;
  }
  
  /**
   * 计算卡牌实际消耗（考虑修改器）
   */
  static calculateCardCost(baseCost: Partial<Resources>): Partial<Resources> {
    const result: Partial<Resources> = {};
    
    for (const [resource, amount] of Object.entries(baseCost)) {
      if (amount) {
        result[resource as keyof Resources] = Math.max(1, Math.floor(amount * currentModifiers.cardCostMultiplier));
      }
    }
    
    return result;
  }
  
  /**
   * 计算实际伤害（考虑修改器）
   */
  static calculateDamage(baseDamage: number): number {
    return Math.floor(baseDamage * currentModifiers.damageMultiplier);
  }
  
  /**
   * 计算实际防御（考虑修改器）
   */
  static calculateDefense(baseDefense: number): number {
    return Math.floor(baseDefense * currentModifiers.defenseMultiplier);
  }
  
  /**
   * 获取资源增益（考虑修改器）
   */
  static getResourceGainBonus(): Partial<Resources> {
    return { ...currentModifiers.resourceGainBonus };
  }
  
  /**
   * 检查是否有特殊限制
   */
  static hasRestriction(restriction: string): boolean {
    return currentModifiers.specialRestrictions.some(r => r.includes(restriction));
  }
  
  /**
   * 检查是否有特殊增益
   */
  static hasBonus(bonus: string): boolean {
    return currentModifiers.specialBonuses.some(b => b.includes(bonus));
  }
  
  /**
   * 应用资源增益到玩家
   */
  static applyResourceGain(playerResources: Resources): Resources {
    const bonus = currentModifiers.resourceGainBonus;
    return {
      compute: playerResources.compute + (bonus.compute || 0),
      funds: playerResources.funds + (bonus.funds || 0),
      information: playerResources.information + (bonus.information || 0),
      permission: playerResources.permission + (bonus.permission || 0)
    };
  }
}

export default RoundStateSystem;
