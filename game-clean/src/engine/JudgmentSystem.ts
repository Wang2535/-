/**
 * 判定系统管理器
 * 
 * 功能：
 * 1. 统一管理骰子判定和RPS判定
 * 2. 提供判定触发接口
 * 3. 处理判定结果应用
 * 4. 支持延迟判定和即时判定
 */

import type { GameState } from '@/types/gameRules';
import type { Card } from '@/types/legacy/game';
import { gameLogger } from './GameLogger';
import { PendingJudgmentSystem, type PendingJudgment, type JudgmentType } from './PendingJudgmentSystem';
import { ResponseSystem } from './ResponseSystem';

// ============================================
// 类型定义
// ============================================

/** 判定配置 */
export interface JudgmentConfig {
  /** 判定类型 */
  type: JudgmentType;
  /** 判定标题 */
  title: string;
  /** 判定描述 */
  description: string;
  /** 难度值（骰子判定用） */
  difficulty?: number;
  /** 修正值（骰子判定用） */
  modifier?: number;
  /** 发起者ID */
  initiatorId: string;
  /** 目标ID */
  targetId: string;
  /** 成功效果 */
  onSuccess: JudgmentOutcome;
  /** 失败效果 */
  onFailure: JudgmentOutcome;
}

/** 判定结果效果 */
export interface JudgmentOutcome {
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
  /** 描述 */
  description: string;
}

/** 判定结果 */
export interface JudgmentResult {
  /** 判定ID */
  id: string;
  /** 是否成功 */
  success: boolean;
  /** 详细结果 */
  detail: string;
  /** 骰子点数（骰子判定用） */
  roll?: number;
  /** RPS选择（RPS判定用） */
  rpsChoices?: {
    initiator: 'rock' | 'paper' | 'scissors';
    target: 'rock' | 'paper' | 'scissors';
  };
  /** 应用的效果 */
  appliedEffects: JudgmentOutcome;
}

/** 判定回调函数 */
export type JudgmentCallback = (result: JudgmentResult) => void;

// ============================================
// 判定系统管理器
// ============================================

export class JudgmentSystem {
  private static instance: JudgmentSystem;
  private activeJudgments: Map<string, JudgmentConfig> = new Map();
  private judgmentCallbacks: Map<string, JudgmentCallback> = new Map();

  private constructor() {}

  static getInstance(): JudgmentSystem {
    if (!JudgmentSystem.instance) {
      JudgmentSystem.instance = new JudgmentSystem();
    }
    return JudgmentSystem.instance;
  }

  // ============================================
  // 延迟判定（在判定阶段执行）
  // ============================================

  /**
   * 创建延迟判定（在判定阶段执行）
   * 用于"延迟类判定卡牌"，如"岩石"等
   */
  static createDelayedJudgment(
    targetPlayerId: string,
    config: JudgmentConfig
  ): string {
    const judgmentId = `delayed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 添加到待处理判定队列
    PendingJudgmentSystem.addPendingJudgment(targetPlayerId, {
      type: config.type,
      targetPlayerId,
      source: {
        playerId: config.initiatorId,
        description: config.description,
      },
      difficulty: config.difficulty || 3,
      effects: {
        success: {
          description: config.onSuccess.description,
          infiltrationChange: config.onSuccess.infiltrationChange,
          safetyChange: config.onSuccess.safetyChange,
          resourceChanges: config.onSuccess.resourceChanges,
          drawCards: config.onSuccess.drawCards,
        },
        failure: {
          description: config.onFailure.description,
          infiltrationChange: config.onFailure.infiltrationChange,
          safetyChange: config.onFailure.safetyChange,
          resourceChanges: config.onFailure.resourceChanges,
          drawCards: config.onFailure.drawCards,
        },
      },
    });

    gameLogger.info('dice_check', `创建延迟判定: ${judgmentId}`, {
      extra: {
        judgmentId,
        targetPlayerId,
        type: config.type,
        description: config.description,
      }
    });

    return judgmentId;
  }

  /**
   * 执行所有待处理的延迟判定
   * 在判定阶段调用
   */
  static executeDelayedJudgments(
    gameState: GameState,
    playerId: string
  ): JudgmentResult[] {
    const resolutions = PendingJudgmentSystem.resolveAllPendingJudgments(gameState, playerId);
    
    return resolutions.map(resolution => ({
      id: resolution.judgmentId,
      success: resolution.success,
      detail: resolution.result.detail,
      appliedEffects: resolution.result.appliedEffects,
    }));
  }

  // ============================================
  // 即时判定（在响应阶段执行）
  // ============================================

  /**
   * 创建即时判定（在响应阶段执行）
   * 用于"即时判定类卡牌"，在出牌后立即触发
   */
  static createImmediateJudgment(
    targetPlayerId: string,
    config: JudgmentConfig
  ): string {
    const judgmentId = `immediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 添加到响应系统
    ResponseSystem.addResponseEvent(targetPlayerId, {
      type: 'immediate_judgment',
      sourcePlayerId: config.initiatorId,
      targetPlayerId,
      description: config.description,
      judgmentType: config.type,
      difficulty: config.difficulty,
      effects: {
        success: {
          description: config.onSuccess.description,
          infiltrationChange: config.onSuccess.infiltrationChange,
          safetyChange: config.onSuccess.safetyChange,
        },
        failure: {
          description: config.onFailure.description,
          infiltrationChange: config.onFailure.infiltrationChange,
          safetyChange: config.onFailure.safetyChange,
        },
      },
    });

    gameLogger.info('dice_check', `创建即时判定: ${judgmentId}`, {
      extra: {
        judgmentId,
        targetPlayerId,
        type: config.type,
        description: config.description,
      }
    });

    return judgmentId;
  }

  // ============================================
  // 判定执行
  // ============================================

  /**
   * 执行骰子判定
   */
  static executeDiceJudgment(
    difficulty: number = 3,
    modifier: number = 0
  ): { roll: number; success: boolean; isCriticalSuccess: boolean; isCriticalFailure: boolean } {
    const roll = Math.floor(Math.random() * 6) + 1;
    const modifiedRoll = roll + modifier;
    const success = modifiedRoll > difficulty;
    
    // 大成功：掷出6且难度≤3
    const isCriticalSuccess = roll === 6 && difficulty <= 3;
    // 大失败：掷出1且难度≥4
    const isCriticalFailure = roll === 1 && difficulty >= 4;

    gameLogger.info('dice_check', `骰子判定`, {
      extra: {
        roll,
        difficulty,
        modifier,
        success: success || isCriticalSuccess,
        isCriticalSuccess,
        isCriticalFailure,
      }
    });

    return {
      roll,
      success: success || isCriticalSuccess,
      isCriticalSuccess,
      isCriticalFailure,
    };
  }

  /**
   * 执行RPS判定
   */
  static executeRPSJudgment(
    initiatorChoice: 'rock' | 'paper' | 'scissors',
    targetChoice: 'rock' | 'paper' | 'scissors'
  ): { winner: 'initiator' | 'target' | 'draw'; detail: string } {
    if (initiatorChoice === targetChoice) {
      return {
        winner: 'draw',
        detail: '双方选择相同，判定平局',
      };
    }

    const winConditions: Record<string, string> = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };

    const initiatorWins = winConditions[initiatorChoice] === targetChoice;

    gameLogger.info('dice_check', `RPS判定`, {
      extra: {
        initiatorChoice,
        targetChoice,
        winner: initiatorWins ? 'initiator' : 'target',
      }
    });

    return {
      winner: initiatorWins ? 'initiator' : 'target',
      detail: initiatorWins ? '发起方获胜' : '目标方获胜',
    };
  }

  // ============================================
  // 判定效果应用
  // ============================================

  /**
   * 应用判定效果到游戏状态
   */
  static applyJudgmentEffects(
    gameState: GameState,
    playerId: string,
    effects: JudgmentOutcome
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
        if (change !== undefined) {
          const currentValue = player.resources[resource as keyof typeof player.resources];
          const newValue = Math.max(0, currentValue + change);
          // 使用类型断言安全地赋值
          const resources = player.resources as unknown as Record<string, number>;
          resources[resource] = newValue;
        }
      }
    }

    modifiedGameState.players[playerIndex] = player;

    gameLogger.info('dice_check', `应用判定效果`, {
      extra: {
        playerId,
        infiltrationChange: effects.infiltrationChange,
        safetyChange: effects.safetyChange,
        resourceChanges: effects.resourceChanges,
      }
    });

    return modifiedGameState;
  }

  // ============================================
  // 卡牌判定创建
  // ============================================

  /**
   * 根据卡牌效果创建判定
   */
  static createCardJudgment(
    card: Card,
    initiatorId: string,
    targetId: string,
    isDelayed: boolean = false
  ): string | null {
    // 解析卡牌效果，判断是否是判定类卡牌
    // 从effect_text或effects中获取描述
    const cardDescription = card.effect_text || 
      (card.effects && card.effects.length > 0 ? card.effects.map(e => e.detail).join(' ') : '');
    const cardName = card.name || '';
    
    // 检查是否是判定类卡牌
    const isJudgmentCard = 
      cardDescription.includes('判定') ||
      cardDescription.includes('骰子') ||
      cardDescription.includes('猜拳') ||
      cardDescription.includes('石头剪刀布');

    if (!isJudgmentCard) return null;

    // 判断判定类型
    let judgmentType: JudgmentType = 'dice';
    if (cardDescription.includes('猜拳') || cardDescription.includes('石头剪刀布')) {
      judgmentType = 'rps';
    }

    // 解析难度
    let difficulty = 3;
    const difficultyMatch = cardDescription.match(/难度\s*(\d+)/);
    if (difficultyMatch) {
      difficulty = parseInt(difficultyMatch[1], 10);
    }

    // 创建判定配置
    const config: JudgmentConfig = {
      type: judgmentType,
      title: `${cardName}的判定`,
      description: cardDescription,
      difficulty,
      initiatorId,
      targetId,
      onSuccess: {
        description: `${cardName}判定成功`,
        infiltrationChange: 1,
      },
      onFailure: {
        description: `${cardName}判定失败`,
        infiltrationChange: -1,
      },
    };

    // 根据是否是延迟判定，选择创建方式
    if (isDelayed) {
      return this.createDelayedJudgment(targetId, config);
    } else {
      return this.createImmediateJudgment(targetId, config);
    }
  }

  // ============================================
  // 查询方法
  // ============================================

  /**
   * 检查玩家是否有待处理的判定
   */
  static hasPendingJudgments(playerId: string): boolean {
    return PendingJudgmentSystem.hasPendingJudgments(playerId);
  }

  /**
   * 获取玩家待处理判定数量
   */
  static getPendingJudgmentCount(playerId: string): number {
    return PendingJudgmentSystem.getUnresolvedCount(playerId);
  }

  /**
   * 获取玩家待处理判定列表
   */
  static getPendingJudgments(playerId: string): PendingJudgment[] {
    return PendingJudgmentSystem.getPendingJudgments(playerId);
  }

  /**
   * 检查玩家是否有未响应的即时判定
   */
  static hasImmediateJudgments(playerId: string): boolean {
    return ResponseSystem.hasUnresolvedEvents(playerId);
  }

  // ============================================
  // 清理方法
  // ============================================

  /**
   * 清理所有判定（游戏结束时调用）
   */
  static clearAllJudgments(): void {
    PendingJudgmentSystem.clearAllJudgments();
    ResponseSystem.clearAllEvents();
    
    const instance = JudgmentSystem.getInstance();
    instance.activeJudgments.clear();
    instance.judgmentCallbacks.clear();

    gameLogger.info('dice_check', '清理所有判定');
  }
}

// 便捷导出
export const judgmentSystem = JudgmentSystem.getInstance();
export default JudgmentSystem;
