/**
 * 响应系统
 * 实现规则文档中关于"响应阶段"的机制
 * 
 * 规则依据: 完善的游戏规则.md R4.2
 * 
 * 功能:
 * 1. 管理响应事件队列
 * 2. 在响应阶段处理玩家的响应操作
 * 3. 支持10秒响应时间限制
 * 4. 处理响应卡牌的使用
 */

import type { Card } from '@/types/legacy/game';
import { gameLogger } from './GameLogger';
import { JudgmentEventBus } from './JudgmentEventBus';
// JudgmentEffect 类型已在文件内定义，无需重复导入

// ============================================
// 类型定义
// ============================================

/** 响应事件类型 */
export type ResponseEventType = 
  | 'card_played'      // 对方出牌
  | 'effect_triggered' // 效果触发
  | 'judgment_required' // 需要判定
  | 'resource_changed'  // 资源变化
  | 'level_changed'    // 等级变化
  | 'immediate_judgment'; // 即时判定（R4.2: 在响应阶段执行）

/** 判定效果 */
export interface JudgmentEffect {
  description: string;
  infiltrationChange?: number;
  safetyChange?: number;
}

/** 响应事件 */
export interface ResponseEvent {
  /** 唯一ID */
  id: string;
  /** 事件类型 */
  type: ResponseEventType;
  /** 源玩家ID（触发事件的玩家） */
  sourcePlayerId: string;
  /** 目标玩家ID（可以响应的玩家） */
  targetPlayerId: string;
  /** 事件描述 */
  description: string;
  /** 相关卡牌（如果有） */
  card?: Card;
  /** 创建时间 */
  createdAt: number;
  /** 是否已响应 */
  responded: boolean;
  /** 响应结果 */
  responseResult?: ResponseResult;
  /** 判定类型（即时判定用） */
  judgmentType?: 'rps' | 'dice';
  /** 判定难度（骰子判定用） */
  difficulty?: number;
  /** 判定效果（即时判定用） */
  effects?: {
    success: JudgmentEffect;
    failure: JudgmentEffect;
  };
}

/** 响应结果 */
export interface ResponseResult {
  /** 是否响应 */
  responded: boolean;
  /** 响应玩家ID */
  responderId: string;
  /** 响应方式 */
  responseType: 'card' | 'skill' | 'pass';
  /** 使用的卡牌（如果是卡牌响应） */
  cardUsed?: Card;
  /** 效果描述 */
  effectDescription: string;
}

/** 响应系统状态 */
export interface ResponseSystemState {
  /** 当前响应事件 */
  currentEvent: ResponseEvent | null;
  /** 剩余响应时间 */
  remainingTime: number;
  /** 总响应时间 */
  totalTime: number;
  /** 是否可以响应 */
  canRespond: boolean;
}

// ============================================
// 响应系统
// ============================================

export class ResponseSystem {
  private static responseEvents: Map<string, ResponseEvent[]> = new Map();
  private static currentEvent: ResponseEvent | null = null;
  private static responseTimer: ReturnType<typeof setInterval> | null = null;
  private static remainingTime: number = 0;
  private static readonly RESPONSE_TIME = 10; // R4.2: 响应阶段10秒

  /**
   * 初始化玩家的响应事件队列
   */
  static initPlayerQueue(playerId: string): void {
    this.responseEvents.set(playerId, []);
  }

  /**
   * 添加响应事件
   */
  static addResponseEvent(
    targetPlayerId: string,
    event: Omit<ResponseEvent, 'id' | 'createdAt' | 'responded'>
  ): ResponseEvent {
    const queue = this.responseEvents.get(targetPlayerId) || [];
    
    const newEvent: ResponseEvent = {
      ...event,
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      responded: false,
    };

    queue.push(newEvent);
    this.responseEvents.set(targetPlayerId, queue);

    gameLogger.info('card_played', `添加响应事件: ${newEvent.id}`, {
      extra: {
        eventId: newEvent.id,
        targetPlayerId,
        type: newEvent.type,
        description: newEvent.description,
      }
    });

    return newEvent;
  }

  /**
   * 获取玩家的响应事件队列
   */
  static getResponseEvents(playerId: string): ResponseEvent[] {
    return this.responseEvents.get(playerId) || [];
  }

  /**
   * 获取玩家未响应的事件数量
   */
  static getUnresolvedCount(playerId: string): number {
    const queue = this.responseEvents.get(playerId) || [];
    return queue.filter(e => !e.responded).length;
  }

  /**
   * 检查玩家是否有未响应的事件
   */
  static hasUnresolvedEvents(playerId: string): boolean {
    return this.getUnresolvedCount(playerId) > 0;
  }

  /**
   * 标记事件为已响应
   * 用于系统内部处理响应（如即时判定的自动结算）
   */
  static markAsResponded(
    playerId: string,
    eventId: string,
    result: ResponseResult
  ): boolean {
    const queue = this.responseEvents.get(playerId) || [];
    const eventIndex = queue.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return false;
    
    queue[eventIndex].responded = true;
    queue[eventIndex].responseResult = result;
    this.responseEvents.set(playerId, queue);
    
    gameLogger.info('card_played', `标记事件为已响应: ${eventId}`, {
      extra: {
        eventId,
        playerId,
        responseType: result.responseType,
      }
    });
    
    return true;
  }

  /**
   * 开始响应阶段
   */
  static startResponsePhase(
    playerId: string,
    onTimerUpdate: (remaining: number, total: number) => void,
    onResponseTimeout: () => void
  ): boolean {
    const queue = this.responseEvents.get(playerId) || [];
    const unresolvedEvents = queue.filter(e => !e.responded);

    if (unresolvedEvents.length === 0) {
      // 没有需要响应的事件
      return false;
    }

    // 取第一个未响应的事件
    this.currentEvent = unresolvedEvents[0];
    this.remainingTime = this.RESPONSE_TIME;

    gameLogger.info('card_played', `开始响应阶段: ${this.currentEvent.id}`, {
      extra: {
        eventId: this.currentEvent.id,
        playerId,
        timeLimit: this.RESPONSE_TIME,
      }
    });

    // 启动计时器
    this.responseTimer = setInterval(() => {
      this.remainingTime--;
      onTimerUpdate(this.remainingTime, this.RESPONSE_TIME);

      if (this.remainingTime <= 0) {
        this.clearTimer();
        // 标记为未响应
        if (this.currentEvent) {
          this.currentEvent.responded = true;
          this.currentEvent.responseResult = {
            responded: false,
            responderId: playerId,
            responseType: 'pass',
            effectDescription: '响应超时，未采取任何行动',
          };
        }
        onResponseTimeout();
      }
    }, 1000);

    return true;
  }

  /**
   * 玩家进行响应
   */
  static makeResponse(
    playerId: string,
    responseType: 'card' | 'skill' | 'pass',
    cardUsed?: Card
  ): ResponseResult | null {
    if (!this.currentEvent || this.currentEvent.targetPlayerId !== playerId) {
      return null;
    }

    // 停止计时器
    this.clearTimer();

    const result: ResponseResult = {
      responded: responseType !== 'pass',
      responderId: playerId,
      responseType,
      cardUsed,
      effectDescription: this.generateEffectDescription(responseType, cardUsed),
    };

    // 标记事件为已响应
    this.currentEvent.responded = true;
    this.currentEvent.responseResult = result;

    gameLogger.info('card_played', `玩家响应: ${playerId}`, {
      extra: {
        eventId: this.currentEvent.id,
        responseType,
        cardUsed: cardUsed?.card_code,
      }
    });

    return result;
  }

  /**
   * 生成效果描述
   */
  private static generateEffectDescription(
    responseType: 'card' | 'skill' | 'pass',
    cardUsed?: Card
  ): string {
    switch (responseType) {
      case 'card':
        return cardUsed ? `使用卡牌[${cardUsed.name}]进行响应` : '使用卡牌响应';
      case 'skill':
        return '使用技能进行响应';
      case 'pass':
        return '放弃响应';
      default:
        return '未知响应';
    }
  }

  /**
   * 结束响应阶段
   */
  static endResponsePhase(playerId: string): void {
    this.clearTimer();
    this.currentEvent = null;

    // 清理已响应的事件
    const queue = this.responseEvents.get(playerId) || [];
    const remainingQueue = queue.filter(e => !e.responded);
    this.responseEvents.set(playerId, remainingQueue);
  }

  /**
   * 清理计时器
   */
  private static clearTimer(): void {
    if (this.responseTimer) {
      clearInterval(this.responseTimer);
      this.responseTimer = null;
    }
  }

  /**
   * 获取当前响应状态
   */
  static getCurrentState(): ResponseSystemState {
    return {
      currentEvent: this.currentEvent,
      remainingTime: this.remainingTime,
      totalTime: this.RESPONSE_TIME,
      canRespond: this.currentEvent !== null && this.remainingTime > 0,
    };
  }

  /**
   * 创建卡牌打出事件（供卡牌系统调用）
   */
  static createCardPlayedEvent(
    card: Card,
    sourcePlayerId: string,
    targetPlayerId: string
  ): ResponseEvent {
    return this.addResponseEvent(targetPlayerId, {
      type: 'card_played',
      sourcePlayerId,
      targetPlayerId,
      description: `对方使用了[${card.name}]`,
      card,
    });
  }

  /**
   * 创建效果触发事件
   */
  static createEffectTriggeredEvent(
    effectName: string,
    sourcePlayerId: string,
    targetPlayerId: string
  ): ResponseEvent {
    return this.addResponseEvent(targetPlayerId, {
      type: 'effect_triggered',
      sourcePlayerId,
      targetPlayerId,
      description: `对方触发了[${effectName}]效果`,
    });
  }

  /**
   * 创建即时判定事件（在响应阶段执行判定）
   * 这会触发判定UI显示
   */
  static createImmediateJudgmentEvent(
    card: Card,
    sourcePlayerId: string,
    targetPlayerId: string,
    sourcePlayerName: string,
    targetPlayerName: string,
    judgmentType: 'rps' | 'dice',
    difficulty?: number,
    onSuccess?: JudgmentEffect,
    onFailure?: JudgmentEffect
  ): ResponseEvent {
    const event = this.addResponseEvent(targetPlayerId, {
      type: 'immediate_judgment',
      sourcePlayerId,
      targetPlayerId,
      description: `[${card.name}]的即时判定效果`,
      card,
      judgmentType,
      difficulty,
      effects: {
        success: onSuccess || { description: '判定成功', infiltrationChange: 1 },
        failure: onFailure || { description: '判定失败', infiltrationChange: -1 },
      },
    });

    // 触发判定UI显示
    JudgmentEventBus.emitJudgmentStart({
      id: event.id,
      type: judgmentType,
      phase: 'response',
      title: `${card.name}的判定`,
      description: event.description,
      initiatorId: sourcePlayerId,
      initiatorName: sourcePlayerName,
      targetId: targetPlayerId,
      targetName: targetPlayerName,
      difficulty,
      onSuccess: onSuccess || { description: '判定成功', infiltrationChange: 1 },
      onFailure: onFailure || { description: '判定失败', infiltrationChange: -1 },
      cardName: card.name,
    });

    gameLogger.info('card_played', `创建即时判定事件: ${event.id}`, {
      extra: {
        eventId: event.id,
        cardName: card.name,
        judgmentType,
        difficulty,
      }
    });

    return event;
  }

  /**
   * 清理所有响应事件（游戏结束时调用）
   */
  static clearAllEvents(): void {
    this.clearTimer();
    this.responseEvents.clear();
    this.currentEvent = null;
  }
}

// 便捷导出
export const responseSystem = ResponseSystem;
export default ResponseSystem;
