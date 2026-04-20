/**
 * 《道高一丈：数字博弈》v16.0 - 7阶段回合流程系统
 * 
 * 实现规则文档 R4.2 完整的7阶段回合流程
 * 
 * 回合流程：
 * 1. 判定阶段 (Judgment Phase)
 * 2. 恢复阶段 (Recovery Phase)
 * 3. 摸牌阶段 (Draw Phase)
 * 4. 行动阶段 (Action Phase)
 * 5. 响应阶段 (Response Phase)
 * 6. 弃牌阶段 (Discard Phase)
 * 7. 结束阶段 (End Phase)
 */

import type { 
  TurnPhase,
  Player,
  GameState,
  Resources
} from '@/types/gameRules';
import { TechTreeDrawSystem } from './TechTreeDrawSystem';
import { AuraCardSystem } from './AuraCardSystem';
import { ResourceController } from './ResourceController';
import { PendingJudgmentSystem } from './PendingJudgmentSystem';
import { ResponseSystem } from './ResponseSystem';
import { JudgmentEventBus } from './JudgmentEventBus';
import { getDrawCountByRound, getHandLimitByRound } from '@/types/gameConstants';

/**
 * 阶段执行结果
 */
export interface PhaseResult {
  success: boolean;
  modifiedGameState: GameState;
  logs: string[];
  canProceed: boolean;
  phaseData?: Record<string, unknown>;
}

/**
 * 回合阶段系统
 */
export class TurnPhaseSystem {
  // 阶段顺序
  private static readonly PHASE_ORDER: TurnPhase[] = [
    'judgment',
    'recovery',
    'draw',
    'action',
    'response',
    'discard',
    'end'
  ];

  // 阶段名称映射
  private static readonly PHASE_NAMES: Record<TurnPhase, string> = {
    judgment: '判定阶段',
    recovery: '恢复阶段',
    draw: '摸牌阶段',
    action: '行动阶段',
    response: '响应阶段',
    discard: '弃牌阶段',
    end: '结束阶段'
  };

  /**
   * 获取下一个阶段
   */
  static getNextPhase(currentPhase: TurnPhase): TurnPhase | null {
    const currentIndex = this.PHASE_ORDER.indexOf(currentPhase);
    if (currentIndex === -1 || currentIndex >= this.PHASE_ORDER.length - 1) {
      return null;
    }
    return this.PHASE_ORDER[currentIndex + 1];
  }

  /**
   * 获取阶段名称
   */
  static getPhaseName(phase: TurnPhase): string {
    return this.PHASE_NAMES[phase];
  }

  /**
   * 执行阶段
   */
  static async executePhase(
    phase: TurnPhase,
    gameState: GameState,
    currentPlayerId: string
  ): Promise<PhaseResult> {
    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) {
      return {
        success: false,
        modifiedGameState: gameState,
        logs: ['错误：找不到当前玩家'],
        canProceed: false
      };
    }

    // 记录阶段开始日志
    console.log(`[Phase] ${currentPlayer.name} 进入${this.PHASE_NAMES[phase]}`);

    let result: PhaseResult;
    switch (phase) {
      case 'judgment':
        result = await this.executeJudgmentPhase(gameState, currentPlayer);
        break;
      case 'recovery':
        result = await this.executeRecoveryPhase(gameState, currentPlayer);
        break;
      case 'draw':
        result = await this.executeDrawPhase(gameState, currentPlayer);
        break;
      case 'action':
        result = await this.executeActionPhase(gameState, currentPlayer);
        break;
      case 'response':
        result = await this.executeResponsePhase(gameState, currentPlayer);
        break;
      case 'discard':
        result = await this.executeDiscardPhase(gameState, currentPlayer);
        break;
      case 'end':
        result = await this.executeEndPhase(gameState, currentPlayer);
        break;
      default:
        result = {
          success: false,
          modifiedGameState: gameState,
          logs: [`错误：未知阶段 ${phase}`],
          canProceed: false
        };
    }

    // 添加阶段执行日志
    if (result.success) {
      result.logs.unshift(`[Phase] 进入${this.PHASE_NAMES[phase]}`);
    }

    return result;
  }

  /**
   * 阶段1: 判定阶段 (R4.2)
   * - 结算待处理的判定（对方放置的判定类卡牌）
   * - 结算延迟效果
   * - 结算持续效果
   * - 触发光环效果
   */
  private static executeJudgmentPhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.judgment}】${currentPlayer.name}`];
    let modifiedGameState = { ...gameState };

    // 1. 结算待处理的判定（核心功能）
    const pendingCount = PendingJudgmentSystem.getUnresolvedCount(currentPlayer.id);
    if (pendingCount > 0) {
      logs.push(`⚖️ 有 ${pendingCount} 个待处理判定需要结算`);
      
      const resolutions = PendingJudgmentSystem.resolveAllPendingJudgments(
        modifiedGameState,
        currentPlayer.id
      );
      
      for (const resolution of resolutions) {
        modifiedGameState = resolution.modifiedGameState;
        logs.push(...resolution.logs);
      }
      
      logs.push(`✅ 所有待处理判定已结算`);
    } else {
      logs.push(`✓ 没有待处理的判定`);
    }

    // 2. 结算延迟效果（简化版本）
    // TODO: 实现延迟效果系统
    
    // 3. 结算持续效果（简化版本）
    let modifiedPlayer = { ...currentPlayer };

    // 更新玩家状态
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      modifiedGameState.players[playerIndex] = modifiedPlayer;
    }

    // 4. 触发光环效果（判定阶段触发）
    const auraResult = AuraCardSystem.applyAllAuras(modifiedGameState, {
      type: 'judgment_phase',
      playerId: currentPlayer.id
    });
    modifiedGameState = auraResult.modifiedGameState;
    logs.push(...auraResult.logs);

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true
    };
  }

  /**
   * 阶段2: 恢复阶段
   * - 恢复资源（算力、资金等）
   * - 应用区域控制加成
   * - 应用光环效果
   */
  private static executeRecoveryPhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.recovery}】${currentPlayer.name}`];
    let modifiedGameState = { ...gameState };

    // 1. 基础资源恢复
    const restoreResult = ResourceController.restorePlayerResources(
      currentPlayer,
      modifiedGameState
    );
    
    let modifiedPlayer = restoreResult.player;
    
    // 记录恢复的资源
    const restoredResources = Object.entries(restoreResult.restored)
      .filter(([, amount]) => typeof amount === 'number' && amount > 0)
      .map(([res, amount]) => `${res}: +${amount}`);
    
    if (restoredResources.length > 0) {
      logs.push(`💫 基础恢复: ${restoredResources.join(', ')}`);
    }

    if (restoreResult.isCrisisProtected) {
      logs.push('🛡️ 濒死保护触发！额外恢复资源');
    }

    // 2. 应用区域控制加成（简化版，实际加成在GameStateManager中处理）
    // 区域控制加成已在回合开始时应用
    logs.push('🏰 区域控制加成已应用');

    // 3. 应用资源恢复光环效果
    const auraResources: Resources = { compute: 0, funds: 0, information: 0, permission: 0 };
    for (const resource of Object.keys(auraResources) as (keyof Resources)[]) {
      auraResources[resource] = AuraCardSystem.getResourceRegenBonus(currentPlayer.id, resource);
    }
    
    const totalAuraBonus = Object.values(auraResources).reduce((a, b) => a + b, 0);
    if (totalAuraBonus > 0) {
      const modifiedResources = { ...modifiedPlayer.resources };
      for (const resource of Object.keys(auraResources) as (keyof Resources)[]) {
        if (auraResources[resource] > 0) {
          modifiedResources[resource] = Math.min(20, 
            modifiedResources[resource] + auraResources[resource]
          );
        }
      }
      modifiedPlayer.resources = modifiedResources;
      logs.push(`✨ 光环加成: 资源恢复 +${totalAuraBonus}`);
    }

    // 更新玩家状态
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      modifiedGameState.players[playerIndex] = modifiedPlayer;
    }

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true
    };
  }

  /**
   * 阶段3: 摸牌阶段
   * - 抽取基础数量的卡牌
   * - 应用区域控制加成
   * - 应用科技树抽卡概率
   */
  private static executeDrawPhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.draw}】${currentPlayer.name}`];
    let modifiedGameState = { ...gameState };

    // 1. 计算抽卡数量
    // 根据轮次获取基础抽牌数（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
    let drawCount = getDrawCountByRound(gameState.round);
    
    // 区域控制加成（简化版）
    const controlledAreas = currentPlayer.controlledAreas || [];
    drawCount += controlledAreas.length; // 每个控制区域额外抽1张

    // 2. 使用科技树抽卡系统抽卡
    const drawResults = TechTreeDrawSystem.drawMultipleCards(
      currentPlayer.id,
      currentPlayer.faction,
      currentPlayer.infiltrationLevel,
      currentPlayer.safetyLevel,
      drawCount
    );

    // 3. 将抽到的卡牌加入手牌
    const drawnCardIds = drawResults.map(r => r.cardId);
    const modifiedPlayer = { ...currentPlayer };
    modifiedPlayer.hand = [...modifiedPlayer.hand, ...drawnCardIds];

    // 记录抽卡结果
    const rarityCount: Record<string, number> = {};
    for (const result of drawResults) {
      rarityCount[result.rarity] = (rarityCount[result.rarity] || 0) + 1;
    }

    const rarityDisplay = Object.entries(rarityCount)
      .map(([rarity, count]) => {
        const rarityEmojis: Record<string, string> = {
          common: '⚪',
          rare: '🔵',
          epic: '🟣',
          legendary: '🟡'
        };
        return `${rarityEmojis[rarity] || ''}${count}`;
      })
      .join(' ');

    logs.push(`🎴 抽取 ${drawCount} 张卡牌: ${rarityDisplay}`);

    // 特殊抽卡提示
    const specialDraws = drawResults.filter(r => r.isPityTriggered || r.isFirstT3Legendary);
    for (const special of specialDraws) {
      if (special.isFirstT3Legendary) {
        logs.push(`🌟 天选之人！获得传说卡牌！`);
      } else if (special.isPityTriggered) {
        logs.push(`🎯 保底触发！获得高品质卡牌！`);
      }
    }

    // 更新玩家状态
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      modifiedGameState.players[playerIndex] = modifiedPlayer;
    }

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true,
      phaseData: { drawnCards: drawnCardIds, drawResults }
    };
  }

  // 追踪行动阶段是否使用了判定类卡牌
  private static hasPlayedJudgmentCardInActionPhase: boolean = false;

  /**
   * 标记行动阶段使用了判定类卡牌
   * 在GameStateManager_v2.ts中调用
   */
  static markJudgmentCardPlayed(): void {
    this.hasPlayedJudgmentCardInActionPhase = true;
  }

  /**
   * 重置判定类卡牌使用标记
   * 在每个玩家回合开始时调用
   */
  static resetJudgmentCardFlag(): void {
    this.hasPlayedJudgmentCardInActionPhase = false;
  }

  /**
   * 阶段4: 行动阶段
   * - 玩家可以打出卡牌
   * - 使用技能
   * - 发起攻击
   * - 重置判定类卡牌使用标记
   */
  private static executeActionPhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.action}】${currentPlayer.name}`];

    // 重置行动点
    let modifiedPlayer = { ...currentPlayer };
    modifiedPlayer.remainingActions = modifiedPlayer.maxActions || 3;

    // 重置判定类卡牌使用标记
    this.resetJudgmentCardFlag();

    // 应用费用减免
    const costReduction = AuraCardSystem.getCostReduction(currentPlayer.id);
    if (costReduction > 0) {
      logs.push(`💰 光环效果: 卡牌费用 -${costReduction}`);
    }

    // 更新玩家状态
    let modifiedGameState = { ...gameState };
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      modifiedGameState.players[playerIndex] = modifiedPlayer;
    }

    logs.push(`⚡ 获得 ${modifiedPlayer.remainingActions} 点行动点`);

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true,
      phaseData: { availableActions: modifiedPlayer.remainingActions }
    };
  }

  /**
   * 阶段5: 响应阶段 (R4.2)
   * - 其他玩家可以响应
   * - 处理连锁效果
   * - 结算响应栈
   * - 10秒响应时间限制
   * - 处理即时判定（即时类判定卡牌在此阶段触发并完成判定）
   * - 优化：如果行动阶段未使用判定类卡牌，自动跳过响应阶段
   */
  private static executeResponsePhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.response}】`];
    let modifiedGameState = { ...gameState };

    // 获取所有未处理的即时判定事件（当前玩家作为发起者）
    // 根据规则：即时判定卡牌由玩家A打出后，应在A的响应阶段立即触发
    // 事件添加到玩家A的队列中，targetPlayerId指向被判定目标
    const immediateJudgments = ResponseSystem.getResponseEvents(currentPlayer.id)
      .filter(e => e.type === 'immediate_judgment' && !e.responded);
    
    // 优化1: 如果行动阶段未使用判定类卡牌且没有即时判定，自动跳过响应阶段
    if (!this.hasPlayedJudgmentCardInActionPhase && immediateJudgments.length === 0) {
      logs.push('✓ 行动阶段未使用判定类卡牌，自动跳过响应阶段');
      return {
        success: true,
        modifiedGameState,
        logs,
        canProceed: true,
        phaseData: { skipped: true, reason: 'no_judgment_card_played' }
      };
    }
    
    // 处理即时判定
    if (immediateJudgments.length > 0) {
      logs.push(`⚖️ 有 ${immediateJudgments.length} 个即时判定需要结算`);
      
      for (const judgment of immediateJudgments) {
        // 在响应阶段触发判定UI显示
        if (judgment.judgmentType === 'dice') {
          JudgmentEventBus.emitJudgmentStart({
            id: judgment.id,
            type: 'dice',
            phase: 'response',
            title: judgment.description,
            description: `${judgment.description}，在响应阶段结算`,
            initiatorId: judgment.sourcePlayerId,
            initiatorName: modifiedGameState.players.find(p => p.id === judgment.sourcePlayerId)?.name || '未知',
            targetId: judgment.targetPlayerId,
            targetName: modifiedGameState.players.find(p => p.id === judgment.targetPlayerId)?.name || '未知',
            difficulty: judgment.difficulty,
            onSuccess: judgment.effects?.success || { description: '成功' },
            onFailure: judgment.effects?.failure || { description: '失败' },
          });
        } else if (judgment.judgmentType === 'rps') {
          JudgmentEventBus.emitJudgmentStart({
            id: judgment.id,
            type: 'rps',
            phase: 'response',
            title: judgment.description,
            description: `${judgment.description}，在响应阶段结算`,
            initiatorId: judgment.sourcePlayerId,
            initiatorName: modifiedGameState.players.find(p => p.id === judgment.sourcePlayerId)?.name || '未知',
            targetId: judgment.targetPlayerId,
            targetName: modifiedGameState.players.find(p => p.id === judgment.targetPlayerId)?.name || '未知',
            onSuccess: judgment.effects?.success || { description: '胜利' },
            onFailure: judgment.effects?.failure || { description: '失败' },
          });
        }

        // 执行即时判定
        const judgmentResult = this.executeImmediateJudgment(modifiedGameState, judgment);
        modifiedGameState = judgmentResult.modifiedGameState;
        logs.push(...judgmentResult.logs);
        
        // 标记为已响应
        ResponseSystem.markAsResponded(currentPlayer.id, judgment.id, {
          responded: true,
          responderId: currentPlayer.id,
          responseType: 'pass',
          effectDescription: judgmentResult.result.detail,
        });
      }
      
      logs.push(`✅ 所有即时判定已结算`);
    }

    // 检查其他玩家是否有需要响应的事件
    const otherPlayers = modifiedGameState.players.filter(p => p.id !== currentPlayer.id);
    let hasResponseEvents = false;

    for (const player of otherPlayers) {
      const responseCount = ResponseSystem.getUnresolvedCount(player.id);
      if (responseCount > 0) {
        hasResponseEvents = true;
        logs.push(`⏱️ ${player.name} 有 ${responseCount} 个事件需要响应（10秒）`);
      }
    }

    if (!hasResponseEvents && immediateJudgments.length === 0) {
      logs.push('✓ 没有需要响应的事件');
    }

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true
    };
  }

  /**
   * 执行即时判定
   * 用于响应阶段的即时判定类卡牌
   */
  private static executeImmediateJudgment(
    gameState: GameState,
    event: import('./ResponseSystem').ResponseEvent
  ): { modifiedGameState: GameState; result: { success: boolean; detail: string }; logs: string[] } {
    const logs: string[] = [];
    let modifiedGameState = { ...gameState };
    
    const difficulty = event.difficulty || 3;
    const roll = Math.floor(Math.random() * 6) + 1;
    const success = roll > difficulty;
    
    // 大成功/大失败判定
    const isCriticalSuccess = roll === 6 && difficulty <= 3;
    const isCriticalFailure = roll === 1 && difficulty >= 4;
    
    let detail: string;
    let appliedEffects = success || isCriticalSuccess 
      ? event.effects?.success 
      : event.effects?.failure;

    if (isCriticalSuccess) {
      detail = `🌟 大成功！掷出 ${roll} > ${difficulty}`;
      logs.push(`🎲 即时判定: ${event.description} - ${detail}`);
    } else if (isCriticalFailure) {
      detail = `💥 大失败！掷出 ${roll} ≤ ${difficulty}`;
      logs.push(`🎲 即时判定: ${event.description} - ${detail}`);
    } else if (success) {
      detail = `✅ 成功！掷出 ${roll} > ${difficulty}`;
      logs.push(`🎲 即时判定: ${event.description} - ${detail}`);
    } else {
      detail = `❌ 失败！掷出 ${roll} ≤ ${difficulty}`;
      logs.push(`🎲 即时判定: ${event.description} - ${detail}`);
    }

    // 应用效果
    if (appliedEffects) {
      const targetPlayerIndex = modifiedGameState.players.findIndex(p => p.id === event.targetPlayerId);
      if (targetPlayerIndex !== -1) {
        const player = { ...modifiedGameState.players[targetPlayerIndex] };
        
        if (appliedEffects.infiltrationChange) {
          player.infiltrationLevel = Math.max(0, Math.min(100, 
            player.infiltrationLevel + appliedEffects.infiltrationChange
          ));
          logs.push(`  📊 渗透等级: ${appliedEffects.infiltrationChange > 0 ? '+' : ''}${appliedEffects.infiltrationChange}`);
        }
        
        if (appliedEffects.safetyChange) {
          player.safetyLevel = Math.max(0, Math.min(100, 
            player.safetyLevel + appliedEffects.safetyChange
          ));
          logs.push(`  📊 安全等级: ${appliedEffects.safetyChange > 0 ? '+' : ''}${appliedEffects.safetyChange}`);
        }
        
        modifiedGameState.players[targetPlayerIndex] = player;
      }
    }

    return {
      modifiedGameState,
      result: { success: success || isCriticalSuccess, detail },
      logs,
    };
  }

  /**
   * 阶段6: 弃牌阶段
   * 手牌上限规则 (R4.3):
   * 1-4轮次为1张，5-8轮次为3张，9-16轮次为4张，17-24轮次为5张（24轮次制）
   */
  private static executeDiscardPhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.discard}】${currentPlayer.name}`];
    let modifiedPlayer = { ...currentPlayer };

    // R4.3: 手牌上限基于轮次（round）而非回合（turn）
    // 24轮次制：1-4轮次1张，5-8轮次3张，9-16轮次4张，17-24轮次5张
    const currentRound = gameState.round;
    const maxHandSize = getHandLimitByRound(
      currentRound,
      currentPlayer.individualModifiers.handLimitOffset,
      currentPlayer.individualModifiers.handLimitTempOffset
    );
    
    let handLimitRange: string;
    if (currentRound <= 4) {
      handLimitRange = '1-4轮次';
    } else if (currentRound <= 8) {
      handLimitRange = '5-8轮次';
    } else if (currentRound <= 16) {
      handLimitRange = '9-16轮次';
    } else {
      handLimitRange = '17-24轮次';
    }
    
    const currentHandSize = modifiedPlayer.hand.length;

    logs.push(`📋 手牌上限: ${maxHandSize}张 (${handLimitRange})`);
    logs.push(`🎴 当前手牌: ${currentHandSize}张`);

    if (currentHandSize > maxHandSize) {
      const discardCount = currentHandSize - maxHandSize;
      const discardedCards = modifiedPlayer.hand.slice(-discardCount);
      
      // 将弃置的卡牌移到弃牌堆
      modifiedPlayer.discard = [...modifiedPlayer.discard, ...discardedCards];
      modifiedPlayer.hand = modifiedPlayer.hand.slice(0, maxHandSize);

      logs.push(`🗑️ 弃置 ${discardCount} 张卡牌至弃牌堆`);
      logs.push(`✅ 保留 ${maxHandSize} 张手牌`);
    } else {
      logs.push(`✅ 手牌数量符合要求（${currentHandSize}/${maxHandSize}）`);
    }

    // 更新玩家状态
    let modifiedGameState = { ...gameState };
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      modifiedGameState.players[playerIndex] = modifiedPlayer;
    }

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true
    };
  }

  /**
   * 阶段7: 结束阶段
   * - 结算结束效果
   * - 更新光环持续时间
   * - 准备下一回合
   */
  private static executeEndPhase(
    gameState: GameState,
    currentPlayer: Player
  ): PhaseResult {
    const logs: string[] = [`【${this.PHASE_NAMES.end}】${currentPlayer.name}`];
    let modifiedGameState = { ...gameState };

    // 1. 触发光环效果（结束阶段触发）
    const auraResult = AuraCardSystem.applyAllAuras(modifiedGameState, {
      type: 'turn_end',
      playerId: currentPlayer.id
    });
    modifiedGameState = auraResult.modifiedGameState;
    logs.push(...auraResult.logs);

    // 2. 更新光环持续时间
    const auraDurationResult = AuraCardSystem.updateAuraDurations();
    logs.push(...auraDurationResult.logs);

    // 3. 清除临时效果
    let modifiedPlayer = { ...currentPlayer };
    
    // 清除本回合的临时状态
    modifiedPlayer.remainingActions = 0;

    // 更新玩家状态
    const playerIndex = modifiedGameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      modifiedGameState.players[playerIndex] = modifiedPlayer;
    }

    logs.push(`🏁 回合结束`);

    return {
      success: true,
      modifiedGameState,
      logs,
      canProceed: true
    };
  }

  /**
   * 执行完整回合
   */
  static async executeFullTurn(
    gameState: GameState,
    currentPlayerId: string
  ): Promise<{
    finalGameState: GameState;
    allLogs: string[];
    phaseResults: PhaseResult[];
  }> {
    let currentGameState = { ...gameState };
    const allLogs: string[] = [];
    const phaseResults: PhaseResult[] = [];

    for (const phase of this.PHASE_ORDER) {
      const result = await this.executePhase(phase, currentGameState, currentPlayerId);
      
      phaseResults.push(result);
      allLogs.push(...result.logs);
      currentGameState = result.modifiedGameState;

      if (!result.canProceed) {
        break;
      }
    }

    return {
      finalGameState: currentGameState,
      allLogs,
      phaseResults
    };
  }
}

export default TurnPhaseSystem;
