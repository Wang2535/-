/**
 * 游戏主循环系统
 * 连接所有引擎系统，实现完整的7阶段回合流程
 * 
 * 规则依据: 完善的游戏规则.md R4.2
 */

import type { GameState, Player, TurnPhase } from '@/types/gameRules';
import { TurnPhaseSystem } from './TurnPhaseSystem';
import { AIPlayer } from './aiPlayer';
import { GameStateManager } from './GameStateManager_v2';
import { checkVictoryConditions, type VictoryResult } from './VictoryConditionSystem';
import { PendingJudgmentSystem } from './PendingJudgmentSystem';
import { ResponseSystem } from './ResponseSystem';
import { getHandLimitByRound } from '@/types/gameConstants';

export interface GameLoopConfig {
  gameStateManager: GameStateManager;
  onStateChange: (state: GameState) => void;
  onPhaseChange: (phase: TurnPhase) => void;
  onTimerUpdate: (remaining: number, total: number) => void;
  onVictory: (result: VictoryResult) => void;
  onError: (error: string) => void;
}

export class GameLoop {
  private config: GameLoopConfig;
  private isRunning: boolean = false;
  private currentTimer: ReturnType<typeof setInterval> | null = null;
  private aiInstance: AIPlayer | null = null;
  private cardsPlayedThisPhase: number = 0;

  constructor(config: GameLoopConfig) {
    this.config = config;
  }

  /**
   * 开始游戏循环
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.processCurrentPhase();
  }

  /**
   * 停止游戏循环
   */
  stop(): void {
    this.isRunning = false;
    this.clearTimer();
  }

  /**
   * 处理当前阶段
   */
  private async processCurrentPhase(): Promise<void> {
    if (!this.isRunning) return;

    const gameState = this.config.gameStateManager.getGameState();
    if (!gameState) {
      this.config.onError('游戏状态不存在');
      return;
    }

    // 检查胜利条件
    const victoryResult = checkVictoryConditions(gameState);
    if (victoryResult.isGameOver) {
      this.config.onVictory(victoryResult);
      this.stop();
      return;
    }

    const currentPhase = gameState.currentPhase;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    this.config.onPhaseChange(currentPhase);
    this.cardsPlayedThisPhase = 0;

    // 根据阶段类型处理
    switch (currentPhase) {
      case 'judgment':
        await this.processJudgmentPhase(gameState, currentPlayer);
        break;
      case 'recovery':
        await this.processRecoveryPhase(gameState, currentPlayer);
        break;
      case 'draw':
        await this.processDrawPhase(gameState, currentPlayer);
        break;
      case 'action':
        await this.processActionPhase(gameState, currentPlayer);
        break;
      case 'response':
        await this.processResponsePhase(gameState, currentPlayer);
        break;
      case 'discard':
        await this.processDiscardPhase(gameState, currentPlayer);
        break;
      case 'end':
        await this.processEndPhase(gameState, currentPlayer);
        break;
    }
  }

  /**
   * 判定阶段 - 自动执行
   */
  private async processJudgmentPhase(gameState: GameState, player: Player): Promise<void> {
    // 执行待处理的判定
    const result = await TurnPhaseSystem.executePhase('judgment', gameState, player.id);
    
    if (result.success) {
      this.updateGameState(result.modifiedGameState);
    }

    // 自动进入下一阶段
    await this.delay(1000);
    this.advancePhase();
  }

  /**
   * 恢复阶段 - 自动执行
   */
  private async processRecoveryPhase(gameState: GameState, player: Player): Promise<void> {
    // 恢复资源和行动点
    const result = await TurnPhaseSystem.executePhase('recovery', gameState, player.id);
    
    if (result.success) {
      this.updateGameState(result.modifiedGameState);
    }

    // 自动进入下一阶段
    await this.delay(1000);
    this.advancePhase();
  }

  /**
   * 摸牌阶段 - 自动执行
   */
  private async processDrawPhase(gameState: GameState, player: Player): Promise<void> {
    // 抽4张牌（根据R4.3）
    const result = await TurnPhaseSystem.executePhase('draw', gameState, player.id);
    
    if (result.success) {
      this.updateGameState(result.modifiedGameState);
    }

    // 自动进入下一阶段
    await this.delay(1000);
    this.advancePhase();
  }

  /**
   * 行动阶段 - 45秒基础 + 10秒/牌
   */
  private async processActionPhase(gameState: GameState, player: Player): Promise<void> {
    const isAI = player.isAI;
    
    if (isAI) {
      // AI行动
      await this.processAIActionPhase(gameState, player);
    } else {
      // 玩家行动 - 启动计时器
      this.startActionPhaseTimer(gameState, player);
    }
  }

  /**
   * AI行动阶段
   */
  private async processAIActionPhase(gameState: GameState, player: Player): Promise<void> {
    if (!this.aiInstance) {
      this.aiInstance = new AIPlayer(player.id, player.aiDifficulty || 'medium');
    }

    // AI执行回合
    await this.aiInstance.executeTurn(
      player,
      gameState,
      (cardIndex) => {
        // AI出牌回调
        const success = this.config.gameStateManager.playCard(player.id, cardIndex);
        if (success) {
          this.cardsPlayedThisPhase++;
          // 延长计时器
          this.extendActionTimer();
        }
        return success;
      },
      () => {
        // AI结束回合回调
        this.advancePhase();
      }
    );
  }

  /**
   * 启动行动阶段计时器
   * R4.2: 行动阶段时间 = 45秒 + (出牌数 × 10秒)
   */
  private startActionPhaseTimer(_gameState: GameState, _player: Player): void {
    const baseTime = 45; // 基础45秒
    const extraTimePerCard = 10; // 每出一张牌增加10秒
    const totalCardsPlayed = this.cardsPlayedThisPhase;
    const totalTime = baseTime + (totalCardsPlayed * extraTimePerCard);
    
    let remainingTime = totalTime;

    this.config.onTimerUpdate(remainingTime, totalTime);

    this.currentTimer = setInterval(() => {
      remainingTime--;
      this.config.onTimerUpdate(remainingTime, totalTime);

      if (remainingTime <= 0) {
        this.clearTimer();
        this.advancePhase();
      }
    }, 1000);
  }

  /**
   * 延长行动阶段计时器
   * 当玩家出牌时调用，增加10秒
   */
  private extendActionTimer(): void {
    // 出牌时已经增加了cardsPlayedThisPhase计数
    // 计时器会在下一次检查时自动延长
    // 这里发送事件通知UI更新时间显示
  }

  /**
   * 响应阶段 - 10秒
   * R4.2: 处理即时判定和响应事件
   */
  private async processResponsePhase(gameState: GameState, player: Player): Promise<void> {
    // 检查是否有可响应的事件
    const hasResponseEvent = this.checkResponseEvents(gameState);
    
    if (!hasResponseEvent) {
      // 无响应事件，直接跳过
      await this.delay(500);
      this.advancePhase();
      return;
    }

    // 调用 TurnPhaseSystem 执行响应阶段逻辑（包括即时判定处理）
    const result = await TurnPhaseSystem.executePhase('response', gameState, player.id);
    
    if (result.success && result.gameState) {
      // 更新游戏状态
      this.config.gameStateManager.updateGameState(result.gameState);
      
      // 输出日志
      if (result.logs && result.logs.length > 0) {
        result.logs.forEach(log => {
          console.log(`[GameLoop] ${log}`);
        });
      }
    }

    // 启动10秒响应计时器（给其他玩家响应的时间）
    let remainingTime = 10;
    this.config.onTimerUpdate(remainingTime, 10);

    this.currentTimer = setInterval(() => {
      remainingTime--;
      this.config.onTimerUpdate(remainingTime, 10);

      if (remainingTime <= 0) {
        this.clearTimer();
        this.advancePhase();
      }
    }, 1000);
  }

  /**
   * 检查是否有响应事件
   * R4.2: 响应阶段只处理需要判定/响应的卡牌效果
   * 如果没有需要判定的事件，立即跳过响应阶段
   */
  private checkResponseEvents(gameState: GameState): boolean {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // 检查是否有即时判定需要处理（当前玩家发起的）
    const immediateJudgments = ResponseSystem.getResponseEvents(currentPlayer.id)
      .filter(e => e.type === 'immediate_judgment' && !e.responded);
    if (immediateJudgments.length > 0) {
      return true; // 有即时判定，需要响应阶段
    }
    
    // 检查是否有待处理的延迟判定（对方放置的判定类卡牌）
    const opponent = gameState.players.find(p => p.id !== currentPlayer.id);
    if (opponent) {
      const pendingCount = PendingJudgmentSystem.getUnresolvedCount(opponent.id);
      if (pendingCount > 0) {
        return true; // 有待处理的判定，需要响应阶段
      }
    }
    
    // 如果没有需要判定的事件，返回false立即跳过响应阶段
    return false;
  }

  /**
   * 弃牌阶段 - 15秒
   */
  private async processDiscardPhase(gameState: GameState, player: Player): Promise<void> {
    // R4.3: 根据轮次数获取手牌上限（24轮次制）
    // 1-4轮次：1张，5-8轮次：3张，9-16轮次：4张，17-24轮次：5张
    // 使用 getHandLimitByRound 函数计算手牌上限（考虑修正值）
    const handLimit = getHandLimitByRound(
      gameState.round,
      player.individualModifiers.handLimitOffset,
      player.individualModifiers.handLimitTempOffset
    );
    const excessCards = player.hand.length - handLimit;

    if (excessCards <= 0) {
      // 无需弃牌，直接跳过
      await this.delay(500);
      this.advancePhase();
      return;
    }

    if (player.isAI) {
      // AI自动弃牌
      await this.processAIDiscard(gameState, player, excessCards);
    } else {
      // 玩家弃牌 - 启动15秒计时器
      this.startDiscardTimer(gameState, player, excessCards);
    }
  }

  /**
   * AI弃牌
   */
  private async processAIDiscard(
    _gameState: GameState, 
    player: Player, 
    excessCards: number
  ): Promise<void> {
    // AI随机弃牌
    // 注意：每次弃牌后需要重新获取最新的游戏状态，因为discardCard会修改状态
    let currentPlayerId = player.id;
    
    for (let i = 0; i < excessCards; i++) {
      // 每次循环重新获取最新游戏状态
      const currentState = this.config.gameStateManager.getGameState();
      if (!currentState) break;
      
      const currentPlayer = currentState.players.find(p => p.id === currentPlayerId);
      if (!currentPlayer || currentPlayer.hand.length === 0) break;
      
      // 总是弃第一张牌（索引0），因为每次弃牌后数组会重新排列
      const success = this.config.gameStateManager.discardCard(currentPlayerId, 0);
      if (!success) {
        console.error(`[GameLoop] AI弃牌失败，尝试弃置索引0`);
        break;
      }
      
      // 添加小延迟，避免状态更新冲突
      await this.delay(100);
    }
    await this.delay(500);
    this.advancePhase();
  }

  /**
   * 启动弃牌计时器
   */
  private startDiscardTimer(
    _gameState: GameState, 
    player: Player, 
    excessCards: number
  ): void {
    let remainingTime = 15;
    this.config.onTimerUpdate(remainingTime, 15);

    this.currentTimer = setInterval(() => {
      remainingTime--;
      this.config.onTimerUpdate(remainingTime, 15);

      if (remainingTime <= 0) {
        this.clearTimer();
        // 超时自动弃牌
        this.autoDiscard(player.id, excessCards);
        this.advancePhase();
      }
    }, 1000);
  }

  /**
   * 自动弃牌
   */
  private autoDiscard(playerId: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.config.gameStateManager.discardCard(playerId, 0);
    }
  }

  /**
   * 结束阶段 - 自动执行
   */
  private async processEndPhase(gameState: GameState, player: Player): Promise<void> {
    // 结算持续效果
    const result = await TurnPhaseSystem.executePhase('end', gameState, player.id);
    
    if (result.success) {
      this.updateGameState(result.modifiedGameState);
    }

    // 自动进入下一阶段（新回合的判定阶段）
    await this.delay(1000);
    this.advancePhase();
  }

  /**
   * 更新游戏状态
   */
  private updateGameState(newState: GameState): void {
    this.config.onStateChange(newState);
  }

  /**
   * 清除计时器
   */
  private clearTimer(): void {
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
      this.currentTimer = null;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 玩家主动结束阶段
   */
  playerEndPhase(): void {
    if (this.isRunning) {
      this.advancePhase();
    }
  }

  /**
   * 通知出牌成功（用于延长计时器）
   */
  notifyCardPlayed(): void {
    this.cardsPlayedThisPhase++;
    this.extendActionTimer();
  }

  /**
   * 手动推进到下一阶段（供UI调用）
   */
  advancePhase(): void {
    this.clearTimer();
    
    const gameState = this.config.gameStateManager.getGameState();
    if (!gameState) return;

    const nextPhase = TurnPhaseSystem.getNextPhase(gameState.currentPhase);
    
    if (nextPhase) {
      // 同回合内推进
      this.config.gameStateManager.setPhase(nextPhase);
    } else {
      // 进入下一回合
      this.config.gameStateManager.nextTurn();
    }

    // 继续处理新阶段
    this.processCurrentPhase();
  }

  /**
   * 玩家出牌
   */
  playerPlayCard(cardIndex: number): boolean {
    const gameState = this.config.gameStateManager.getGameState();
    if (!gameState) return false;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return false;

    const success = this.config.gameStateManager.playCard(currentPlayer.id, cardIndex);
    if (success) {
      this.cardsPlayedThisPhase++;
      this.extendActionTimer();
    }
    return success;
  }

  /**
   * 玩家弃牌
   */
  playerDiscardCard(cardIndex: number): void {
    const gameState = this.config.gameStateManager.getGameState();
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) return;

    this.config.gameStateManager.discardCard(currentPlayer.id, cardIndex);
  }
}
