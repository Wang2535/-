/**
 * 判定效果应用系统
 *
 * 功能：
 * 1. 应用判定结果到游戏状态（使用队伍等级管理器）
 * 2. 处理成功/失败/大成功/大失败的不同效果
 * 3. 支持渗透等级、安全等级、资源变化
 * 4. 记录效果应用日志
 */

import type { GameState, Resources } from '@/types/gameRules';
import type { JudgmentResultData } from './JudgmentEventBus';
import { gameLogger } from './GameLogger';
import { TeamLevelManager } from './TeamLevelManager';

/**
 * 效果应用结果
 */
export interface EffectApplyResult {
  success: boolean;
  changes: {
    infiltrationChange?: number;
    safetyChange?: number;
    resourceChanges?: Record<string, number>;
  };
  message: string;
}

/**
 * 判定效果应用器
 */
export class JudgmentEffectApplier {
  /**
   * 应用判定结果到游戏状态
   */
  static applyJudgmentResult(
    gameState: GameState,
    result: JudgmentResultData,
    initiatorId: string,
    targetId: string
  ): GameState {
    console.log('[JudgmentEffectApplier] 应用判定结果:', {
      resultType: result.resultType,
      initiatorId,
      targetId,
      effects: result.appliedEffects,
    });

    let newGameState = { ...gameState };

    // 应用效果
    const effects = result.appliedEffects;

    // 1. 应用渗透等级变化（使用队伍等级管理器）
    if (effects.infiltrationChange !== undefined && effects.infiltrationChange !== 0) {
      if (effects.infiltrationChange > 0) {
        // 增加发起者的渗透等级（队伍共享）
        const levelResult = TeamLevelManager.applyLevelChange(
          newGameState,
          initiatorId,
          'infiltration',
          effects.infiltrationChange,
          false,
          '判定成功效果'
        );
        newGameState = levelResult.newGameState;
        console.log(`[JudgmentEffectApplier] ${levelResult.result.message}`);
      } else {
        // 减少目标的渗透等级（队伍共享）
        const levelResult = TeamLevelManager.applyLevelChange(
          newGameState,
          targetId,
          'infiltration',
          effects.infiltrationChange, // 负值
          false,
          '判定失败效果'
        );
        newGameState = levelResult.newGameState;
        console.log(`[JudgmentEffectApplier] ${levelResult.result.message}`);
      }
    }

    // 2. 应用安全等级变化（使用队伍等级管理器）
    if (effects.safetyChange !== undefined && effects.safetyChange !== 0) {
      if (effects.safetyChange > 0) {
        // 增加目标的安全等级（队伍共享）
        const levelResult = TeamLevelManager.applyLevelChange(
          newGameState,
          targetId,
          'safety',
          effects.safetyChange,
          false,
          '判定成功效果'
        );
        newGameState = levelResult.newGameState;
        console.log(`[JudgmentEffectApplier] ${levelResult.result.message}`);
      } else {
        // 减少发起者的安全等级（队伍共享）
        const levelResult = TeamLevelManager.applyLevelChange(
          newGameState,
          initiatorId,
          'safety',
          effects.safetyChange, // 负值
          false,
          '判定失败效果'
        );
        newGameState = levelResult.newGameState;
        console.log(`[JudgmentEffectApplier] ${levelResult.result.message}`);
      }
    }

    // 3. 应用资源变化
    if (effects.resourceChanges && Object.keys(effects.resourceChanges).length > 0) {
      const players = [...newGameState.players];
      const initiatorIndex = players.findIndex(p => p.id === initiatorId);
      
      if (initiatorIndex !== -1) {
        const initiator = { ...players[initiatorIndex] };
        
        Object.entries(effects.resourceChanges).forEach(([resource, change]) => {
          if (change > 0) {
            // 增加发起者的资源
            const resourceKey = resource as keyof Resources;
            const maxValues: Record<keyof Resources, number> = {
              compute: 15,
              funds: 20,
              information: 10,
              permission: 5
            };
            const currentValue = initiator.resources[resourceKey] || 0;
            initiator.resources = {
              ...initiator.resources,
              [resourceKey]: Math.min(maxValues[resourceKey], currentValue + change),
            };
            console.log(`[JudgmentEffectApplier] ${initiator.name} ${resource} +${change}`);
          }
        });
        
        players[initiatorIndex] = initiator;
        newGameState.players = players;
      }
    }

    // 4. 处理大成功/大失败额外效果
    if (result.resultType === 'critical_success') {
      console.log('[JudgmentEffectApplier] 大成功！效果翻倍');
      gameLogger.info('card_played', `🎉 判定大成功！效果翻倍！`, {
        playerId: initiatorId,
        extra: { result: 'critical_success' },
      });
    } else if (result.resultType === 'critical_failure') {
      console.log('[JudgmentEffectApplier] 大失败！效果失效');
      gameLogger.info('card_played', `💥 判定大失败！效果失效！`, {
        playerId: initiatorId,
        extra: { result: 'critical_failure' },
      });
    }

    // 添加日志
    const initiator = newGameState.players.find(p => p.id === initiatorId);
    const target = newGameState.players.find(p => p.id === targetId);
    const logMessage = this.createEffectLogMessage(
      result,
      initiator?.name || '未知',
      target?.name || '未知'
    );
    
    newGameState.log = [
      ...newGameState.log,
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        turn: newGameState.turn,
        round: newGameState.round,
        phase: newGameState.currentPhase,
        playerId: initiatorId,
        action: 'judgment_result',
        message: logMessage,
        timestamp: Date.now(),
      },
    ];

    return newGameState;
  }

  /**
   * 创建效果日志消息
   */
  private static createEffectLogMessage(
    result: JudgmentResultData,
    initiatorName: string,
    _targetName: string,
  ): string {
    const effects = result.appliedEffects;
    let message = `${initiatorName} 判定${result.success ? '成功' : '失败'}`;

    if (effects.description) {
      message += ` - ${effects.description}`;
    }

    if (effects.infiltrationChange !== undefined && effects.infiltrationChange !== 0) {
      message += `，渗透${effects.infiltrationChange > 0 ? '+' : ''}${effects.infiltrationChange}`;
    }

    if (effects.safetyChange !== undefined && effects.safetyChange !== 0) {
      message += `，安全${effects.safetyChange > 0 ? '+' : ''}${effects.safetyChange}`;
    }

    return message;
  }

  /**
   * 检查是否触发大成功/大失败
   */
  static checkCriticalResult(roll: number, difficulty: number): {
    isCriticalSuccess: boolean;
    isCriticalFailure: boolean;
  } {
    // 大成功：掷出6且难度≤3
    const isCriticalSuccess = roll === 6 && difficulty <= 3;
    // 大失败：掷出1且难度≥4
    const isCriticalFailure = roll === 1 && difficulty >= 4;

    return { isCriticalSuccess, isCriticalFailure };
  }
}

export default JudgmentEffectApplier;
