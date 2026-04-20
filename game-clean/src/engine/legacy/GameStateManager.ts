import type { GameState, Player, Faction, Team } from '@/types/game';
import { createGame, playCard, addLog, getCurrentPlayer, checkVictory } from './gameEngine';
import { executeAITurn } from './aiPlayer';
import { ResourceController } from './ResourceController';
import { RoundStateSystem } from './RoundStateSystem';
import { DeckManager } from './DeckManager';

/**
 * 游戏状态管理器 - 核心状态机（修复版）
 * 
 * 修复内容：
 * 1. 回合结束立即切换玩家（轮流制）
 * 2. 玩家回合开始时重置行动点
 * 3. 12回合完整循环
 * 4. 【Trae优化】添加回合锁防止竞态条件
 */
export class GameStateManager {
  private gameState: GameState | null = null;
  private aiTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private timeSyncId: ReturnType<typeof setInterval> | null = null;
  private onStateChange: ((state: GameState) => void) | null = null;
  private onGameEnd: ((winner: Faction | Team | 'draw', victoryType: string | null) => void) | null = null;
  
  // 【Trae优化】回合处理锁，防止竞态条件
  private isProcessingTurn: boolean = false;
  private turnSequenceId: number = 0;
  
  // 【v8.1修复】AI行动状态追踪，防止重复触发
  private isAIActing: boolean = false;
  private currentAIPlayerId: string | null = null;
  
  // 【修复】AI出牌队列管理系统
  private aiTurnQueue: string[] = [];  // AI回合队列
  private isProcessingAIQueue: boolean = false;  // 是否正在处理AI队列
  private aiActionLock: boolean = false;  // AI行动锁，防止并行出牌
  
  // 常量配置
  private readonly AI_TIMEOUT_MS = 10000;
  private readonly MAX_ROUNDS = 12;
  private readonly ROUND_DURATION_MS = 30000;
  private readonly TIME_SYNC_INTERVAL_MS = 500;
  
  // 阶段配置
  private readonly PHASE_CONFIG = {
    early: { maxRound: 6, handLimit: 5, drawCount: 5, actionPoints: 3 },  // BUGFIX: 初始5张手牌
    late: { maxRound: 12, handLimit: 7, drawCount: 6, actionPoints: 4 }   // BUGFIX: 后期4点行动点
  };
  
  /**
   * 初始化游戏
   */
  initGame(players: Player[]): GameState {
    this.clearAITimeout();
    this.stopTimeSync();
    RoundStateSystem.reset();
    
    // BUGFIX: 确保所有玩家手牌数量一致（标准5张）
    this.gameState = createGame('game_' + Date.now(), players);
    
    // 给每个玩家抽标准5张初始手牌
    this.gameState.players = this.gameState.players.map(p => {
      const { player } = DeckManager.drawCards(p, this.PHASE_CONFIG.early.drawCount);
      // BUGFIX: 初始化行动点
      return {
        ...player,
        remainingActions: this.PHASE_CONFIG.early.actionPoints,
        maxActions: this.PHASE_CONFIG.early.actionPoints
      };
    });
    
    // 应用第一回合的状态
    this.gameState = RoundStateSystem.startNewRound(this.gameState);
    
    // 记录游戏开始日志
    this.gameState = addLog(this.gameState, '【系统】游戏开始！第1回合，行动点已重置为3点');
    
    // 启动时间同步
    this.startTimeSync();
    
    return this.gameState;
  }
  
  /**
   * 启动时间同步
   */
  private startTimeSync(): void {
    this.stopTimeSync();
    let roundStartTime = Date.now();
    
    this.timeSyncId = setInterval(() => {
      if (!this.gameState) return;
      
      const elapsed = Date.now() - roundStartTime;
      const remainingTime = Math.max(0, this.ROUND_DURATION_MS - elapsed);
      
      this.gameState = {
        ...this.gameState,
        phaseTimeLeft: Math.floor(remainingTime / 1000)
      };
      
      this.broadcastStateUpdate();
      
      // 【v8.2关键修复】时间到，自动结束回合（包括AI）
      if (remainingTime <= 0) {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        if (currentPlayer) {
          console.log(`[GameStateManager] 玩家 ${currentPlayer.name} 超时，强制结束回合`);
          // 【关键修复】AI超时时也要强制结束回合
          const ended = this.endCurrentTurn(currentPlayer.id);
          // 【关键修复】只有成功结束回合后才重置时间
          if (ended) {
            roundStartTime = Date.now();
            console.log(`[GameStateManager] 回合结束成功，重置倒计时`);
          } else {
            console.log(`[GameStateManager] 回合结束失败，不重置倒计时`);
          }
        }
      }
    }, this.TIME_SYNC_INTERVAL_MS);
  }
  
  private stopTimeSync(): void {
    if (this.timeSyncId) {
      clearInterval(this.timeSyncId);
      this.timeSyncId = null;
    }
  }
  
  /**
   * 获取当前回合的行动点上限
   */
  private getActionPointsForRound(round: number): number {
    return round >= 7 
      ? this.PHASE_CONFIG.late.actionPoints 
      : this.PHASE_CONFIG.early.actionPoints;
  }
  
  /**
   * 获取抽卡数量
   */
  private getDrawCountForRound(round: number): number {
    return round >= 7 
      ? this.PHASE_CONFIG.late.drawCount 
      : this.PHASE_CONFIG.early.drawCount;
  }
  
  /**
   * 获取手牌上限
   */
  private getHandLimitForRound(round: number): number {
    return round >= 7 
      ? this.PHASE_CONFIG.late.handLimit 
      : this.PHASE_CONFIG.early.handLimit;
  }
  
  setOnStateChange(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }
  
  setOnGameEnd(callback: (winner: Faction | Team | 'draw', victoryType: string | null) => void): void {
    this.onGameEnd = callback;
  }
  
  getGameState(): GameState | null {
    return this.gameState;
  }
  
  isPlayerTurn(playerId: string): boolean {
    if (!this.gameState) return false;
    const currentPlayer = getCurrentPlayer(this.gameState);
    return currentPlayer?.id === playerId;
  }
  
  hasRemainingActions(playerId: string): boolean {
    if (!this.gameState) return false;
    const player = this.gameState.players.find(p => p.id === playerId);
    return (player?.remainingActions ?? 0) > 0;
  }
  
  /**
   * 玩家出牌
   */
  playCard(playerId: string, cardIndex: number, target?: any): boolean {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }
    
    if (!this.isPlayerTurn(playerId)) {
      console.error('[GameStateManager] 不是当前玩家的回合');
      return false;
    }
    
    if (!this.hasRemainingActions(playerId)) {
      console.error('[GameStateManager] 行动点不足');
      return false;
    }
    
    const currentPlayer = getCurrentPlayer(this.gameState);
    if (!currentPlayer) return false;
    
    // 执行卡牌逻辑
    const result = playCard(this.gameState, playerId, cardIndex, target);
    if (!result.success) {
      console.error('[GameStateManager] 出牌失败:', result.message);
      return false;
    }
    
    let newState = result.gameState;
    
    // 消耗行动点
    const playerIdx = newState.players.findIndex(p => p.id === playerId);
    if (playerIdx >= 0) {
      newState.players[playerIdx] = {
        ...newState.players[playerIdx],
        remainingActions: (newState.players[playerIdx].remainingActions ?? 1) - 1
      };
    }
    
    this.gameState = newState;
    this.broadcastStateUpdate();
    
    return true;
  }
  
  /**
   * 【Trae优化】结束当前回合 - 带锁保护防止重复调用
   */
  endCurrentTurn(playerId: string): boolean {
    // 【Trae优化】检查回合锁
    if (this.isProcessingTurn) {
      console.log('[GameStateManager] 回合切换正在进行中，忽略重复调用');
      return false;
    }
    
    if (!this.gameState) return false;
    if (!this.isPlayerTurn(playerId)) return false;
    
    const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
    if (!currentPlayer) return false;
    
    // 【Trae优化】加锁
    this.isProcessingTurn = true;
    this.turnSequenceId++;
    const currentSequenceId = this.turnSequenceId;
    
    // 清空当前玩家行动点
    const playerIdx = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIdx >= 0) {
      this.gameState.players[playerIdx] = {
        ...this.gameState.players[playerIdx],
        remainingActions: 0
      };
    }
    
    // 记录日志
    this.gameState = addLog(this.gameState, `【系统】${currentPlayer.name} 结束回合`);
    
    // 【Trae优化】立即切换到下一个玩家（带序列号验证）
    this.proceedToNextPlayer(currentSequenceId);
    
    return true;
  }
  
  /**
   * 【Trae优化】推进到下一个玩家（带序列号验证）
   */
  private proceedToNextPlayer(expectedSequenceId?: number): void {
    if (!this.gameState) return;
    
    // 【Trae优化】验证序列号，防止过期调用
    if (expectedSequenceId !== undefined && expectedSequenceId !== this.turnSequenceId) {
      console.log(`[GameStateManager] 序列号不匹配，忽略过期调用 (${expectedSequenceId} vs ${this.turnSequenceId})`);
      return;
    }
    
    const playerCount = this.gameState.players.length;
    const currentIndex = this.gameState.currentPlayerIndex;
    const nextIndex = (currentIndex + 1) % playerCount;
    
    // 如果下一个玩家是第一个玩家，说明一轮结束，进入下一回合
    if (nextIndex === 0) {
      this.proceedToNextRound(expectedSequenceId);
      return;
    }
    
    const nextPlayer = this.gameState.players[nextIndex];
    
    // 【Trae优化】重置新玩家的行动点并记录详细日志
    const actionPoints = this.getActionPointsForRound(this.gameState.turn);
    const prevActions = this.gameState.players[nextIndex].remainingActions;
    this.gameState.players[nextIndex] = {
      ...nextPlayer,
      remainingActions: actionPoints,
      maxActions: actionPoints
    };
    
    console.log(`[GameStateManager] 行动点重置: ${nextPlayer.name} ${prevActions} → ${actionPoints}/${actionPoints}`);
    
    // 更新当前玩家索引
    this.gameState = {
      ...this.gameState,
      currentPlayerIndex: nextIndex
    };
    
    // 记录日志
    this.gameState = addLog(
      this.gameState, 
      `【系统】轮到 ${nextPlayer.name} 的回合，行动点 ${actionPoints}/${actionPoints}`
    );
    
    // 重置时间同步
    this.stopTimeSync();
    this.startTimeSync();
    
    // 【Trae优化】强制广播状态更新
    this.broadcastStateUpdate();
    
    // 【修复】AI行动状态检查，使用队列管理系统
    if (nextPlayer.isAI) {
      // 将AI加入出牌队列
      this.addAIToQueue(nextPlayer.id);
      // 尝试处理队列
      this.processAIQueue();
    } else {
      // 人类玩家回合才解锁
      this.isProcessingTurn = false;
    }
  }
  
  /**
   * 【Trae优化】推进到下一回合（带序列号验证）
   */
  private proceedToNextRound(expectedSequenceId?: number): void {
    if (!this.gameState) return;
    
    // 【Trae优化】验证序列号
    if (expectedSequenceId !== undefined && expectedSequenceId !== this.turnSequenceId) {
      console.log(`[GameStateManager] 回合切换序列号不匹配，忽略过期调用`);
      return;
    }
    
    // 强制终局保护
    if (this.gameState.turn >= this.MAX_ROUNDS) {
      console.log('[GameStateManager] 达到最大回合数，强制结束游戏');
      this.isProcessingTurn = false; // 【Trae优化】解锁
      this.triggerGameEnd();
      return;
    }
    
    this.stopTimeSync();
    
    // 执行资源恢复
    let newState = ResourceController.executeEndOfTurnRestore(this.gameState);
    
    // 【v8.0重构】执行弃牌清理 - 保留1张，余牌入弃牌堆
    newState.players = newState.players.map(p => {
      const handLimit = this.getHandLimitForRound(newState.turn);
      const cardsToKeep = 1; // 保留1张
      const cardsToDiscard = Math.max(0, p.hand.length - cardsToKeep);
      
      if (cardsToDiscard > 0) {
        // 保留1张，其余弃掉
        const keptCard = p.hand[0]; // 保留第一张
        const discardedCards = p.hand.slice(1);
        
        const newHand = [keptCard];
        const newDiscard = [...p.discard, ...discardedCards];
        
        console.log(`[GameStateManager] ${p.name} 回合结束弃牌: ${cardsToDiscard}张入弃牌堆，保留1张`);
        
        return {
          ...p,
          hand: newHand,
          discard: newDiscard
        };
      }
      
      return p;
    });
    
    // 推进回合
    const nextRound = newState.turn + 1;
    const actionPoints = this.getActionPointsForRound(nextRound);
    
    // 【Trae优化】给每个玩家抽牌并重置行动点，添加详细日志
    newState.players = newState.players.map(p => {
      const drawCount = this.getDrawCountForRound(nextRound);
      const { player } = DeckManager.drawCards(p, drawCount);
      const prevActions = p.remainingActions;
      console.log(`[GameStateManager] 新回合行动点重置: ${p.name} ${prevActions} → ${actionPoints}/${actionPoints}`);
      return {
        ...player,
        remainingActions: actionPoints,
        maxActions: actionPoints
      };
    });
    
    newState = {
      ...newState,
      turn: nextRound,
      currentPlayerIndex: 0,  // 回到第一个玩家
      phase: 'planning',
      phaseTimeLeft: Math.floor(this.ROUND_DURATION_MS / 1000)
    };
    
    // 阶段切换提示
    if (nextRound === 7) {
      newState = addLog(newState, '【系统】进入后期阶段！手牌上限7张，行动点提升至4点');
    }
    
    this.gameState = newState;
    
    // 应用新回合的状态
    this.gameState = RoundStateSystem.startNewRound(this.gameState);
    
    // 记录日志
    const firstPlayer = this.gameState.players[0];
    this.gameState = addLog(
      this.gameState,
      `【系统】第${nextRound}回合开始！轮到 ${firstPlayer.name}，行动点 ${actionPoints}/${actionPoints}`
    );
    
    // 检查胜利条件
    this.checkVictoryCondition();
    
    // 重新启动时间同步
    this.startTimeSync();
    
    // 【Trae优化】广播状态更新并解锁
    this.broadcastStateUpdate();
    this.isProcessingTurn = false;
    
    // 【修复】如果第一个玩家是AI，使用队列系统触发AI行动
    if (firstPlayer.isAI) {
      this.addAIToQueue(firstPlayer.id);
      setTimeout(() => {
        this.processAIQueue();
      }, 500);
    }
  }
  
  /**
   * 【修复】AI行动 - 带行动锁和出牌合法性检查
   */
  async aiAction(playerId: string): Promise<void> {
    // 【修复】检查行动锁，防止并行执行
    if (this.aiActionLock) {
      console.log(`[GameStateManager] AI行动被锁定，跳过重复调用: ${playerId}`);
      return;
    }
    
    if (!this.gameState) return;
    
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAI) return;
    
    // 【修复】验证是否为当前回合玩家
    if (!this.isPlayerTurn(playerId)) {
      console.log(`[GameStateManager] AI ${player.name} 不是当前回合玩家，取消行动`);
      return;
    }
    
    // 【修复】加锁
    this.aiActionLock = true;
    
    console.log(`[GameStateManager] AI ${player.name} 开始行动`);
    
    // 设置AI超时熔断
    this.aiTimeoutId = setTimeout(() => {
      console.warn(`[GameStateManager] AI ${player.name} 超时，强制跳过`);
      this.aiActionLock = false;
      this.endCurrentTurn(playerId);
    }, this.AI_TIMEOUT_MS);
    
    try {
      // AI持续行动直到行动点耗尽或选择跳过
      let actionCount = 0;
      const maxActions = player.remainingActions ?? 0;
      
      while (actionCount < maxActions) {
        // 【修复】每次行动前检查是否仍是当前回合玩家
        if (!this.isPlayerTurn(playerId)) {
          console.log(`[GameStateManager] AI ${player.name} 不再是当前回合玩家，停止行动`);
          break;
        }
        
        // 【修复】检查行动点
        const currentPlayer = this.gameState.players.find(p => p.id === playerId);
        if (!currentPlayer || (currentPlayer.remainingActions ?? 0) <= 0) {
          console.log(`[GameStateManager] AI ${player.name} 行动点耗尽，停止行动`);
          break;
        }
        
        const result = await executeAITurn(
          this.gameState!,
          playerId,
          player.aiDifficulty || 'medium'
        );
        
        // AI选择跳过或超时
        if (!result.success || result.decision.action === 'skip' || result.decision.action === 'timeout') {
          console.log(`[GameStateManager] AI ${player.name} 选择跳过或超时`);
          break;
        }
        
        // 更新游戏状态
        this.gameState = result.gameState;
        
        // 消耗行动点
        const playerIdx = this.gameState.players.findIndex(p => p.id === playerId);
        if (playerIdx >= 0) {
          this.gameState.players[playerIdx] = {
            ...this.gameState.players[playerIdx],
            remainingActions: (this.gameState.players[playerIdx].remainingActions ?? 1) - 1
          };
        }
        
        actionCount++;
        console.log(`[GameStateManager] AI ${player.name} 执行了第${actionCount}/${maxActions}个行动`);
        
        // 广播状态更新
        this.broadcastStateUpdate();
        
        // AI行动间隔
        await new Promise(r => setTimeout(r, 1000));
      }
      
      this.clearAITimeout();
      
      // 【修复】AI行动结束后重置状态并结束回合
      console.log(`[GameStateManager] AI ${player?.name} 行动完成，准备结束回合`);
      
      // 【关键修复】先解锁行动锁
      this.aiActionLock = false;
      
      // 重置AI行动状态
      this.isAIActing = false;
      this.currentAIPlayerId = null;
      
      // 【关键修复】解锁回合处理
      this.isProcessingTurn = false;
      
      // BUGFIX: AI行动结束后自动结束回合
      setTimeout(() => {
        console.log(`[GameStateManager] 执行AI回合结束: ${playerId}`);
        const ended = this.endCurrentTurn(playerId);
        console.log(`[GameStateManager] AI回合结束结果: ${ended}`);
      }, 500);
      
    } catch (error) {
      console.error('[GameStateManager] AI行动失败:', error);
      this.clearAITimeout();
      
      // 【修复】错误时也要解锁行动锁
      this.aiActionLock = false;
      
      // 【v8.2关键修复】错误时也要重置所有状态
      this.isAIActing = false;
      this.currentAIPlayerId = null;
      this.isProcessingTurn = false;
      
      console.log(`[GameStateManager] AI行动失败，强制结束回合: ${playerId}`);
      this.endCurrentTurn(playerId);
    }
  }
  
  /**
   * 广播状态更新
   */
  private broadcastStateUpdate(): void {
    if (this.onStateChange && this.gameState) {
      this.onStateChange(this.gameState);
    }
  }
  
  /**
   * 检查胜利条件
   */
  private checkVictoryCondition(): void {
    if (!this.gameState) return;
    
    const victory = checkVictory(this.gameState);
    
    if (victory.winner) {
      this.gameState = {
        ...this.gameState,
        winner: victory.winner,
        victoryType: victory.type,
        phase: 'ended'
      };
      
      if (this.onGameEnd) {
        this.onGameEnd(victory.winner, victory.type);
      }
      
      this.broadcastStateUpdate();
    }
  }
  
  /**
   * 触发游戏结束
   */
  private triggerGameEnd(): void {
    if (!this.gameState) return;
    
    const teamA = this.gameState.players.filter(p => p.team === 'teamA');
    const teamB = this.gameState.players.filter(p => p.team === 'teamB');
    
    const teamAResources = teamA.reduce((sum, p) => 
      sum + p.resources.compute + p.resources.funds, 0
    );
    const teamBResources = teamB.reduce((sum, p) => 
      sum + p.resources.compute + p.resources.funds, 0
    );
    
    const winner: Team = teamAResources >= teamBResources ? 'teamA' : 'teamB';
    
    this.gameState = {
      ...this.gameState,
      winner,
      victoryType: '回合耗尽 - 资源判定',
      phase: 'ended'
    };
    
    if (this.onGameEnd) {
      this.onGameEnd(winner, '回合耗尽 - 资源判定');
    }
    
    this.broadcastStateUpdate();
  }
  
  private clearAITimeout(): void {
    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
  }
  
  // ==================== AI队列管理系统 ====================
  
  /**
   * 【修复】将AI添加到出牌队列
   */
  private addAIToQueue(playerId: string): void {
    if (!this.aiTurnQueue.includes(playerId)) {
      this.aiTurnQueue.push(playerId);
      console.log(`[GameStateManager] AI ${playerId} 已加入出牌队列，当前队列: [${this.aiTurnQueue.join(', ')}]`);
    }
  }
  
  /**
   * 【修复】处理AI出牌队列 - 确保顺序执行
   */
  private async processAIQueue(): Promise<void> {
    // 如果正在处理队列或队列为空，直接返回
    if (this.isProcessingAIQueue || this.aiTurnQueue.length === 0) {
      return;
    }
    
    // 获取队列中的第一个AI
    const playerId = this.aiTurnQueue[0];
    
    // 验证该AI是否是当前回合玩家
    if (!this.gameState || !this.isPlayerTurn(playerId)) {
      console.log(`[GameStateManager] AI ${playerId} 不是当前回合玩家，从队列移除`);
      this.aiTurnQueue.shift();
      this.isProcessingTurn = false;
      return;
    }
    
    // 标记正在处理
    this.isProcessingAIQueue = true;
    this.isAIActing = true;
    this.currentAIPlayerId = playerId;
    
    console.log(`[GameStateManager] 开始处理AI队列，当前AI: ${playerId}`);
    
    try {
      // 执行AI行动
      await this.aiAction(playerId);
    } finally {
      // 从队列中移除已完成的AI
      this.aiTurnQueue.shift();
      this.isProcessingAIQueue = false;
      this.isAIActing = false;
      this.currentAIPlayerId = null;
      
      console.log(`[GameStateManager] AI ${playerId} 行动完成，剩余队列: [${this.aiTurnQueue.join(', ')}]`);
      
      // 如果队列中还有AI，继续处理
      if (this.aiTurnQueue.length > 0) {
        setTimeout(() => this.processAIQueue(), 500);
      }
    }
  }
  
  destroy(): void {
    this.clearAITimeout();
    this.stopTimeSync();
    this.gameState = null;
    this.onStateChange = null;
    this.onGameEnd = null;
  }
}

// 单例导出
export const gameStateManager = new GameStateManager();

export default GameStateManager;
