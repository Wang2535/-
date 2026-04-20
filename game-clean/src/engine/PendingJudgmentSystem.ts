/**
 * 待处理判定系统
 * 实现规则文档中关于"待处理的判定"的机制
 * 
 * 规则依据: 完善的游戏规则.md R4.2, R6.0, R7.0
 * 
 * 功能:
 * 1. 管理待处理的判定队列
 * 2. 在判定阶段自动结算队列中的判定
 * 3. 支持判定类卡牌的延迟结算
 */

import type { GameState } from '@/types/gameRules';
import type { Card } from '@/types/legacy/game';
import { gameLogger } from './GameLogger';
import { JudgmentEventBus } from './JudgmentEventBus';

// ============================================
// 类型定义
// ============================================

/** 判定类型 */
export type JudgmentType = 'rps' | 'dice';

/** 判定来源 */
export interface JudgmentSource {
  /** 来源玩家ID */
  playerId: string;
  /** 来源卡牌ID（如果有） */
  cardId?: string;
  /** 来源描述 */
  description: string;
}

/** 待处理判定项 */
export interface PendingJudgment {
  /** 唯一ID */
  id: string;
  /** 判定类型 */
  type: JudgmentType;
  /** 目标玩家ID（需要进行判定的玩家） */
  targetPlayerId: string;
  /** 判定来源 */
  source: JudgmentSource;
  /** 判定难度（骰子判定用） */
  difficulty?: number;
  /** 判定效果（成功/失败时的效果） */
  effects: {
    success: JudgmentEffect;
    failure: JudgmentEffect;
  };
  /** 创建时间 */
  createdAt: number;
  /** 是否已结算 */
  resolved: boolean;
  /** 结算结果 */
  result?: JudgmentResult;
}

/** 判定效果 */
export interface JudgmentEffect {
  /** 渗透等级变化 */
  infiltrationChange?: number;
  /** 安全等级变化 */
  safetyChange?: number;
  /** 资源变化 */
  resourceChanges?: {
    compute?: number;
    funds?: number;
    information?: number;
    permission?: number;
  };
  /** 抽牌数量 */
  drawCards?: number;
  /** 特殊效果 */
  specialEffects?: string[];
  /** 描述 */
  description: string;
}

/** 判定结果 */
export interface JudgmentResult {
  /** 是否成功 */
  success: boolean;
  /** 详细结果 */
  detail: string;
  /** 实际效果 */
  appliedEffects: JudgmentEffect;
}

/** 判定结算结果 */
export interface JudgmentResolution {
  /** 判定ID */
  judgmentId: string;
  /** 是否成功结算 */
  success: boolean;
  /** 结果 */
  result: JudgmentResult;
  /** 修改后的游戏状态 */
  modifiedGameState: GameState;
  /** 日志 */
  logs: string[];
}

// ============================================
// 待处理判定系统
// ============================================

export class PendingJudgmentSystem {
  private static pendingJudgments: Map<string, PendingJudgment[]> = new Map();

  /**
   * 初始化玩家的待处理判定队列
   */
  static initPlayerQueue(playerId: string): void {
    this.pendingJudgments.set(playerId, []);
  }

  /**
   * 添加待处理判定
   */
  static addPendingJudgment(
    targetPlayerId: string,
    judgment: Omit<PendingJudgment, 'id' | 'createdAt' | 'resolved'>
  ): PendingJudgment {
    const queue = this.pendingJudgments.get(targetPlayerId) || [];
    
    const newJudgment: PendingJudgment = {
      ...judgment,
      id: `judgment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      resolved: false,
    };

    queue.push(newJudgment);
    this.pendingJudgments.set(targetPlayerId, queue);
    
    console.log(`[PendingJudgmentSystem] 添加延迟判定: ${newJudgment.id} 给玩家 ${targetPlayerId}`);
    console.log(`[PendingJudgmentSystem] 当前队列长度: ${queue.length}`);

    gameLogger.info('dice_check', `添加待处理判定: ${newJudgment.id}`, {
      extra: {
        judgmentId: newJudgment.id,
        targetPlayerId,
        type: newJudgment.type,
        source: newJudgment.source.description,
      }
    });

    return newJudgment;
  }

  /**
   * 获取玩家的待处理判定队列
   */
  static getPendingJudgments(playerId: string): PendingJudgment[] {
    return this.pendingJudgments.get(playerId) || [];
  }

  /**
   * 获取玩家未结算的判定数量
   */
  static getUnresolvedCount(playerId: string): number {
    const queue = this.pendingJudgments.get(playerId) || [];
    const count = queue.filter(j => !j.resolved).length;
    console.log(`[PendingJudgmentSystem] 玩家 ${playerId} 未结算判定数: ${count}`);
    return count;
  }

  /**
   * 检查玩家是否有待处理的判定
   */
  static hasPendingJudgments(playerId: string): boolean {
    return this.getUnresolvedCount(playerId) > 0;
  }

  /**
   * 结算所有待处理判定（在判定阶段调用）
   * 现在会触发UI显示判定过程
   */
  static resolveAllPendingJudgments(
    gameState: GameState,
    playerId: string
  ): JudgmentResolution[] {
    console.log(`[PendingJudgmentSystem] 开始结算玩家 ${playerId} 的判定`);
    const queue = this.pendingJudgments.get(playerId) || [];
    console.log(`[PendingJudgmentSystem] 队列中的判定数: ${queue.length}`);
    const unresolvedJudgments = queue.filter(j => !j.resolved);
    console.log(`[PendingJudgmentSystem] 未结算判定数: ${unresolvedJudgments.length}`);
    
    const resolutions: JudgmentResolution[] = [];
    let currentGameState = { ...gameState };

    for (const judgment of unresolvedJudgments) {
      // 触发判定UI显示（延迟判定在判定阶段展示）
      const sourcePlayer = currentGameState.players.find(p => p.id === judgment.source.playerId);
      const targetPlayer = currentGameState.players.find(p => p.id === judgment.targetPlayerId);
      
      if (sourcePlayer && targetPlayer) {
        JudgmentEventBus.emitJudgmentStart({
          id: judgment.id,
          type: judgment.type,
          phase: 'judgment',
          title: `${judgment.source.description}的判定`,
          description: `在判定阶段结算${judgment.source.description}`,
          initiatorId: judgment.source.playerId,
          initiatorName: sourcePlayer.name,
          targetId: judgment.targetPlayerId,
          targetName: targetPlayer.name,
          difficulty: judgment.difficulty,
          onSuccess: judgment.effects.success,
          onFailure: judgment.effects.failure,
        });
      }

      const resolution = this.resolveJudgment(currentGameState, judgment);
      resolutions.push(resolution);
      currentGameState = resolution.modifiedGameState;
      
      // 标记为已结算
      judgment.resolved = true;
      judgment.result = resolution.result;

      // 通知UI判定结束
      JudgmentEventBus.emitJudgmentEnd({
        id: judgment.id,
        success: resolution.success,
        resultType: resolution.success ? 'success' : 'failure',
        detail: resolution.result.detail,
        appliedEffects: resolution.result.appliedEffects,
      });
    }

    // 清理已结算的判定
    const remainingQueue = queue.filter(j => !j.resolved);
    this.pendingJudgments.set(playerId, remainingQueue);

    return resolutions;
  }

  /**
   * 结算单个判定
   */
  private static resolveJudgment(
    gameState: GameState,
    judgment: PendingJudgment
  ): JudgmentResolution {
    const logs: string[] = [];
    logs.push(`🎲 结算判定: ${judgment.source.description}`);

    let result: JudgmentResult;

    if (judgment.type === 'dice') {
      result = this.resolveDiceJudgment(judgment);
    } else {
      result = this.resolveRPSJudgment(judgment);
    }

    logs.push(result.detail);

    // 应用效果
    const modifiedGameState = this.applyJudgmentEffects(gameState, judgment.targetPlayerId, result.appliedEffects);

    gameLogger.info('dice_check', `判定结算完成: ${judgment.id}`, {
      extra: {
        judgmentId: judgment.id,
        success: result.success,
        type: judgment.type,
      }
    });

    return {
      judgmentId: judgment.id,
      success: result.success,
      result,
      modifiedGameState,
      logs,
    };
  }

  /**
   * 结算骰子判定
   */
  private static resolveDiceJudgment(judgment: PendingJudgment): JudgmentResult {
    const difficulty = judgment.difficulty || 3;
    const roll = Math.floor(Math.random() * 6) + 1; // 1-6
    const success = roll > difficulty;

    // R6.1: 大成功/大失败判定
    const isCriticalSuccess = roll === 6 && difficulty <= 3;
    const isCriticalFailure = roll === 1 && difficulty >= 4;

    let detail: string;
    let appliedEffects: JudgmentEffect;

    if (isCriticalSuccess) {
      detail = `🌟 大成功！掷出 ${roll} > ${difficulty}`;
      appliedEffects = {
        ...judgment.effects.success,
        description: judgment.effects.success.description + ' (大成功额外+2)',
      };
      // 大成功额外效果
      if (appliedEffects.infiltrationChange) appliedEffects.infiltrationChange += 2;
      if (appliedEffects.safetyChange) appliedEffects.safetyChange += 2;
    } else if (isCriticalFailure) {
      detail = `💥 大失败！掷出 ${roll} ≤ ${difficulty}`;
      appliedEffects = {
        ...judgment.effects.failure,
        description: judgment.effects.failure.description + ' (大失败效果-1)',
      };
      // 大失败减益
      if (appliedEffects.infiltrationChange) appliedEffects.infiltrationChange -= 1;
      if (appliedEffects.safetyChange) appliedEffects.safetyChange -= 1;
    } else if (success) {
      detail = `✅ 成功！掷出 ${roll} > ${difficulty}`;
      appliedEffects = judgment.effects.success;
    } else {
      detail = `❌ 失败！掷出 ${roll} ≤ ${difficulty}`;
      appliedEffects = judgment.effects.failure;
    }

    return {
      success: success || isCriticalSuccess,
      detail,
      appliedEffects,
    };
  }

  /**
   * 结算猜拳判定（简化版）
   */
  private static resolveRPSJudgment(judgment: PendingJudgment): JudgmentResult {
    // 猜拳判定需要玩家交互，这里简化处理
    // 实际游戏中应该由玩家选择石头/剪刀/布
    
    // 简化：50%成功率
    const success = Math.random() > 0.5;
    
    const detail = success 
      ? `✅ 猜拳胜利！${judgment.source.description}`
      : `❌ 猜拳失败！${judgment.source.description}`;

    return {
      success,
      detail,
      appliedEffects: success ? judgment.effects.success : judgment.effects.failure,
    };
  }

  /**
   * 应用判定效果到游戏状态
   */
  private static applyJudgmentEffects(
    gameState: GameState,
    playerId: string,
    effects: JudgmentEffect
  ): GameState {
    const modifiedGameState = { ...gameState };
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) return modifiedGameState;

    const player = { ...modifiedGameState.players[playerIndex] };

    // 应用渗透/安全等级变化
    if (effects.infiltrationChange) {
      player.infiltrationLevel = Math.max(0, Math.min(75, 
        player.infiltrationLevel + effects.infiltrationChange
      ));
    }

    if (effects.safetyChange) {
      player.safetyLevel = Math.max(0, Math.min(75, 
        player.safetyLevel + effects.safetyChange
      ));
    }

    // 应用资源变化
    if (effects.resourceChanges) {
      player.resources = { ...player.resources };
      for (const [resource, change] of Object.entries(effects.resourceChanges)) {
        if (change && player.resources[resource as keyof typeof player.resources] !== undefined) {
          const currentValue = player.resources[resource as keyof typeof player.resources];
          const newValue = Math.max(0, currentValue + change);
          // 使用类型安全的赋值方式
          if (resource === 'compute') player.resources.compute = newValue;
          else if (resource === 'funds') player.resources.funds = newValue;
          else if (resource === 'information') player.resources.information = newValue;
          else if (resource === 'permission') player.resources.permission = newValue;
        }
      }
    }

    // 应用抽牌
    if (effects.drawCards && effects.drawCards > 0) {
      // 抽牌逻辑由抽卡系统处理
      // 这里只是标记需要抽牌
    }

    modifiedGameState.players[playerIndex] = player;
    return modifiedGameState;
  }

  /**
   * 创建判定类卡牌的效果（供卡牌系统调用）
   */
  static createCardJudgment(
    card: Card,
    targetPlayerId: string,
    sourcePlayerId: string
  ): PendingJudgment | null {
    // 根据卡牌效果创建判定
    // 这里简化处理，实际应该解析卡牌效果
    
    if (!card.effects || card.effects.length === 0) return null;

    const effect = card.effects[0];
    
    // 检查是否是判定类效果
    if (effect.mechanic.includes('判定') || effect.detail.includes('判定')) {
      return this.addPendingJudgment(targetPlayerId, {
        type: 'dice',
        targetPlayerId,
        source: {
          playerId: sourcePlayerId,
          cardId: card.card_code,
          description: `${card.name}的判定效果`,
        },
        difficulty: 3, // 默认难度3
        effects: {
          success: {
            description: '判定成功',
            infiltrationChange: 1,
          },
          failure: {
            description: '判定失败',
            infiltrationChange: -1,
          },
        },
      });
    }

    return null;
  }

  /**
   * 清理所有待处理判定（游戏结束时调用）
   */
  static clearAllJudgments(): void {
    this.pendingJudgments.clear();
  }
}

// 便捷导出
export const pendingJudgmentSystem = PendingJudgmentSystem;
export default PendingJudgmentSystem;
