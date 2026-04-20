/**
 * 《道高一丈：数字博弈》v17.0 - 亡语效果系统
 * 
 * 实现规则文档 R8.4 亡语机制
 * 
 * 核心功能：
 * 1. 卡牌被移除时触发亡语效果
 * 2. 亡语队列管理
 * 3. 亡语效果执行
 */

import type { Card } from '@/types/legacy/card_v16';
import { gameLogger } from './GameLogger';

/**
 * 亡语效果类型
 */
export type DeathrattleType = 
  | 'damage'           // 造成伤害
  | 'heal'             // 恢复/治疗
  | 'draw'             // 抽卡
  | 'resource'         // 资源获取
  | 'summon'           // 召唤/生成
  | 'buff'             // 增益效果
  | 'debuff'           // 减益效果
  | 'area_control'     // 区域控制
  | 'infiltration'     // 渗透值变化
  | 'safety';          // 安全值变化

/**
 * 亡语效果定义
 */
export interface DeathrattleEffect {
  id: string;
  type: DeathrattleType;
  value: number;
  description: string;
  target: 'self' | 'opponent' | 'all' | 'area';
  area?: string;  // 目标区域（如果是区域效果）
  condition?: string;  // 触发条件
}

/**
 * 亡语卡牌实例
 */
export interface DeathrattleCard {
  cardId: string;
  instanceId: string;
  ownerId: string;
  deathrattleEffects: DeathrattleEffect[];
  isActive: boolean;
}

/**
 * 亡语触发结果
 */
export interface DeathrattleTriggerResult {
  triggered: boolean;
  cardId: string;
  effects: DeathrattleEffect[];
  logs: string[];
  visualEffect: boolean;
}

/**
 * 亡语系统状态
 */
interface DeathrattleState {
  cards: Map<string, DeathrattleCard>;  // instanceId -> card
  triggerQueue: string[];  // 待触发的亡语队列
}

// 全局状态
const state: DeathrattleState = {
  cards: new Map(),
  triggerQueue: [],
};

/**
 * 亡语效果系统
 */
export class DeathrattleSystem {
  /**
   * 注册带有亡语的卡牌
   */
  static registerCard(
    card: Card,
    instanceId: string,
    ownerId: string
  ): DeathrattleCard | null {
    // 检查卡牌是否有亡语效果
    const deathrattleEffects = this.parseDeathrattleEffects(card);
    
    if (!deathrattleEffects || deathrattleEffects.length === 0) {
      return null;
    }

    const deathrattleCard: DeathrattleCard = {
      cardId: card.card_code,
      instanceId,
      ownerId,
      deathrattleEffects,
      isActive: true,
    };

    state.cards.set(instanceId, deathrattleCard);

    gameLogger.info('effect_triggered', `注册亡语卡牌`, {
      extra: {
        cardId: card.card_code,
        instanceId,
        ownerId,
        effectCount: deathrattleEffects.length,
      }
    });

    return deathrattleCard;
  }

  /**
   * 解析卡牌的亡语效果
   */
  private static parseDeathrattleEffects(card: Card): DeathrattleEffect[] | null {
    // 从卡牌描述中解析亡语效果
    // 格式: "亡语: [效果描述]"
    
    if (!card.description || !card.description.includes('亡语')) {
      return null;
    }

    const effects: DeathrattleEffect[] = [];
    const cardCode = card.card_code || 'unknown';
    
    // 解析亡语描述
    const deathrattleMatch = card.description.match(/亡语[:：]\s*(.+?)(?:\n|$)/);
    if (!deathrattleMatch) return null;

    const effectDesc = deathrattleMatch[1];

    // 根据描述创建对应的效果
    if (effectDesc.includes('渗透')) {
      const value = this.extractNumber(effectDesc) || 1;
      effects.push({
        id: `${cardCode}_dr_infiltration`,
        type: 'infiltration',
        value,
        description: `亡语: 渗透+${value}`,
        target: 'self',
      });
    }

    if (effectDesc.includes('安全')) {
      const value = this.extractNumber(effectDesc) || 1;
      effects.push({
        id: `${cardCode}_dr_safety`,
        type: 'safety',
        value,
        description: `亡语: 安全+${value}`,
        target: 'self',
      });
    }

    if (effectDesc.includes('抽卡') || effectDesc.includes('抽')) {
      const value = this.extractNumber(effectDesc) || 1;
      effects.push({
        id: `${cardCode}_dr_draw`,
        type: 'draw',
        value,
        description: `亡语: 抽${value}张卡`,
        target: 'self',
      });
    }

    if (effectDesc.includes('资源') || effectDesc.includes('资金') || effectDesc.includes('算力')) {
      const value = this.extractNumber(effectDesc) || 1;
      effects.push({
        id: `${cardCode}_dr_resource`,
        type: 'resource',
        value,
        description: `亡语: 获得${value}资源`,
        target: 'self',
      });
    }

    if (effectDesc.includes('伤害') || effectDesc.includes('对方')) {
      const value = this.extractNumber(effectDesc) || 1;
      effects.push({
        id: `${cardCode}_dr_damage`,
        type: 'damage',
        value,
        description: `亡语: 对敌方造成${value}伤害`,
        target: 'opponent',
      });
    }

    return effects.length > 0 ? effects : null;
  }

  /**
   * 从文本中提取数字
   */
  private static extractNumber(text: string): number | null {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * 触发亡语效果
   */
  static triggerDeathrattle(
    instanceId: string,
    triggerContext?: {
      destroyedBy?: string;
      area?: string;
      turn?: number;
    }
  ): DeathrattleTriggerResult {
    const card = state.cards.get(instanceId);
    
    if (!card || !card.isActive) {
      return {
        triggered: false,
        cardId: '',
        effects: [],
        logs: ['亡语未触发：卡牌不存在或已失效'],
        visualEffect: false,
      };
    }

    // 标记为已触发
    card.isActive = false;
    
    const logs: string[] = [];
    logs.push(`【亡语触发】${card.cardId} 的亡语效果发动！`);

    // 执行所有亡语效果
    card.deathrattleEffects.forEach(effect => {
      logs.push(`  → ${effect.description}`);
      
      // 这里可以添加实际的效果执行逻辑
      // 例如：修改游戏状态、发送事件等
    });

    // 从注册表中移除
    state.cards.delete(instanceId);

    gameLogger.info('effect_triggered', `亡语效果触发`, {
      extra: {
        cardId: card.cardId,
        instanceId,
        ownerId: card.ownerId,
        effectCount: card.deathrattleEffects.length,
        triggerContext,
      }
    });

    return {
      triggered: true,
      cardId: card.cardId,
      effects: card.deathrattleEffects,
      logs,
      visualEffect: true,
    };
  }

  /**
   * 批量触发亡语（用于区域清除等情况）
   */
  static triggerAreaDeathrattles(
    area: string,
    faction?: string
  ): DeathrattleTriggerResult[] {
    const results: DeathrattleTriggerResult[] = [];
    
    state.cards.forEach((card, instanceId) => {
      // 检查是否在指定区域
      const shouldTrigger = faction ? 
        this.isCardInArea(card, area) && this.isCardFaction(card, faction) :
        this.isCardInArea(card, area);

      if (shouldTrigger) {
        const result = this.triggerDeathrattle(instanceId, { area });
        if (result.triggered) {
          results.push(result);
        }
      }
    });

    return results;
  }

  /**
   * 检查卡牌是否在指定区域
   */
  private static isCardInArea(card: DeathrattleCard, area: string): boolean {
    // 这里需要根据实际的游戏状态来判断
    // 简化实现：假设instanceId包含区域信息
    return card.instanceId.includes(area);
  }

  /**
   * 检查卡牌是否属于指定阵营
   */
  private static isCardFaction(_card: DeathrattleCard, _faction: string): boolean {
    // 这里需要根据实际的游戏状态来判断
    // 简化实现：通过ownerId判断
    return true; // 简化实现
  }

  /**
   * 禁用亡语（沉默效果）
   */
  static silenceDeathrattle(instanceId: string): boolean {
    const card = state.cards.get(instanceId);
    if (!card) return false;

    card.isActive = false;
    
    gameLogger.info('effect_triggered', `亡语被沉默`, {
      extra: {
        cardId: card.cardId,
        instanceId,
      }
    });

    return true;
  }

  /**
   * 获取所有活跃的亡语卡牌
   */
  static getActiveDeathrattles(): DeathrattleCard[] {
    return Array.from(state.cards.values()).filter(card => card.isActive);
  }

  /**
   * 获取指定玩家的亡语卡牌
   */
  static getPlayerDeathrattles(playerId: string): DeathrattleCard[] {
    return Array.from(state.cards.values()).filter(
      card => card.ownerId === playerId && card.isActive
    );
  }

  /**
   * 清空所有亡语状态
   */
  static reset(): void {
    state.cards.clear();
    state.triggerQueue = [];
    
    gameLogger.info('effect_triggered', '亡语系统已重置');
  }
}

// 便捷导出
export default DeathrattleSystem;
