/**
 * 《道高一丈：数字博弈》v2.0 - 游戏状态管理器
 * 
 * 严格遵循完善的游戏规则.md (v16.2.0) 实现
 * 基于新版类型系统的游戏状态管理
 */

import type {
  GameState,
  Player,
  Faction,
  GameLogEntry,
  TurnPhase,
  AreaType,
  AreaState,
  Resources
} from '@/types/gameRules';

import {
  TURN_PHASES
} from '@/types/gameRules';

import { 
  HAND_LIMITS, 
  getHandLimitByRound, 
  getDrawCountByRound,
  getActionPointsByRound 
} from '@/types/gameConstants';

import { 
  calculateTotalAreaBonus 
} from './AreaControlSystem';

import {
  calculateTechLevel,
  getTechLevelName
} from './TechTreeSystem';

import type { CharacterId } from '@/types/characterRules';
import type { CardId } from '@/types/cardRules';
import { COMPLETE_CARD_DATABASE, getCardsByFaction } from '@/data/completeCardDatabase';
import { PendingJudgmentSystem, type JudgmentType } from './PendingJudgmentSystem';
import { ResponseSystem } from './ResponseSystem';
import { JudgmentEventBus } from './JudgmentEventBus';
import { ComboStateManager } from './ComboStateManager';
import { TeamLevelManager } from './TeamLevelManager';
import { TurnPhaseSystem } from './TurnPhaseSystem';

// ==================== 游戏状态管理器类 ====================

export class GameStateManager {
  private gameState: GameState | null = null;
  private onStateChange: ((state: GameState) => void) | null = null;
  private onGameEnd: ((winner: Faction | null, victoryType: string | null) => void) | null = null;
  
  // 处理锁
  private phaseLock: boolean = false;
  private aiActing: boolean = false;  // AI是否正在行动
  
  // AI相关
  private aiTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly AI_TIMEOUT_MS = 15000;
  
  // ==================== 初始化 ====================
  
  /**
   * 初始化游戏
   */
  initGame(config: {
    gameId: string;
    players: Array<{
      id: string;
      name: string;
      faction: Faction;
      characterId: CharacterId;
      isAI?: boolean;
      aiDifficulty?: 'easy' | 'medium' | 'hard';
    }>;
  }): GameState {
    this.clearState();
    
    this.gameState = createGame(config.gameId, config.players);
    
    // 广播初始状态
    this.broadcastStateUpdate();
    
    return this.gameState;
  }
  
  /**
   * 设置状态变更回调
   */
  setOnStateChange(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }
  
  /**
   * 设置游戏结束回调
   */
  setOnGameEnd(callback: (winner: Faction | null, victoryType: string | null) => void): void {
    this.onGameEnd = callback;
  }
  
  // ==================== 状态查询 ====================
  
  /**
   * 获取当前游戏状态
   */
  getGameState(): GameState | null {
    return this.gameState;
  }
  
  /**
   * 获取当前玩家
   */
  getCurrentPlayer(): Player | undefined {
    if (!this.gameState) return undefined;
    return getCurrentPlayer(this.gameState);
  }
  
  /**
   * 检查是否为指定玩家的回合
   */
  isPlayerTurn(playerId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    return currentPlayer?.id === playerId;
  }
  
  /**
   * 检查玩家是否有剩余行动点
   */
  hasRemainingActions(playerId: string): boolean {
    if (!this.gameState) return false;
    const player = this.gameState.players.find(p => p.id === playerId);
    return (player?.remainingActions ?? 0) > 0;
  }
  
  /**
   * 获取指定玩家
   */
  getPlayer(playerId: string): Player | undefined {
    if (!this.gameState) return undefined;
    return this.gameState.players.find(p => p.id === playerId);
  }
  
  /**
   * 获取指定阵营的所有玩家
   */
  getPlayersByFaction(faction: Faction): Player[] {
    if (!this.gameState) return [];
    return this.gameState.players.filter(p => p.faction === faction);
  }

  /**
   * 检查AI是否正在行动
   */
  isAIActing(): boolean {
    return this.aiActing;
  }

  /**
   * 设置AI行动状态
   */
  setAIActing(acting: boolean): void {
    this.aiActing = acting;
  }
  
  // ==================== 回合管理 ====================
  
  /**
   * 推进到下一阶段
   */
  advancePhase(): boolean {
    if (!this.gameState || this.phaseLock) return false;
    
    this.phaseLock = true;
    
    try {
      this.gameState = advancePhase(this.gameState);
      this.broadcastStateUpdate();
      
      // 检查游戏是否结束
      if (!this.gameState.isActive && this.onGameEnd) {
        this.onGameEnd(this.gameState.winner, this.gameState.victoryType);
      }
      
      return true;
    } finally {
      this.phaseLock = false;
    }
  }

  /**
   * 设置当前阶段（供GameLoop调用）
   */
  setPhase(phase: TurnPhase): boolean {
    if (!this.gameState || this.phaseLock) return false;

    this.phaseLock = true;
    try {
      this.gameState.currentPhase = phase;
      this.gameState.updatedAt = Date.now();
      this.addLog(`进入${phase}阶段`, { action: 'phase_change', phase });
      this.broadcastStateUpdate();
      return true;
    } finally {
      this.phaseLock = false;
    }
  }

  /**
   * 进入下一回合（供GameLoop调用）
   * 
   * 回合与轮次逻辑：
   * - 回合：单个玩家的7个阶段（判定→恢复→摸牌→行动→响应→弃牌→结束）
   * - 轮次：所有玩家各完成一个回合
   * - 当从结束阶段进入判定阶段时，表示当前玩家回合结束，切换到下一个玩家
   * - 当回到第一个玩家时，表示一轮次完成，轮次数+1
   */
  nextTurn(): boolean {
    if (!this.gameState || this.phaseLock) return false;

    this.phaseLock = true;
    try {
      // 切换到下一个玩家
      const nextPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
      this.gameState.currentPlayerIndex = nextPlayerIndex;
      const nextPlayer = this.gameState.players[nextPlayerIndex];
      
      // 回合计数+1（每玩家完成一个回合）
      this.gameState.turn += 1;
      
      // 如果回到第一个玩家，表示一轮次完成
      if (nextPlayerIndex === 0) {
        this.gameState.round += 1;
        console.log(`[Round] 第${this.gameState.round}轮次开始`);
        this.addLog(`第${this.gameState.round}轮次开始`, { action: 'round_start', round: this.gameState.round });
      }
      
      this.gameState.currentPhase = 'judgment';
      this.gameState.updatedAt = Date.now();
      
      // 重置新当前玩家的行动点（基于轮次数）
      // R2.3: 1-4轮次3点，5-8轮次4点，9-12轮次5点
      const actionPoints = getActionPointsByRound(this.gameState.round);
      this.gameState.players = this.gameState.players.map((player, index) => ({
        ...player,
        remainingActions: index === nextPlayerIndex ? actionPoints : player.remainingActions
      }));
      
      console.log(`[Turn] ${nextPlayer.name}的回合开始 (轮次:${this.gameState.round}, 回合:${this.gameState.turn})`);
      this.addLog(`${nextPlayer.name}的回合开始`, { action: 'turn_start', playerId: nextPlayer.id });
      this.broadcastStateUpdate();
      return true;
    } finally {
      this.phaseLock = false;
    }
  }

  /**
   * 弃置卡牌（供GameLoop调用）
   */
  discardCard(playerId: string, cardIndex: number): boolean {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      console.error('[GameStateManager] 玩家不存在');
      return false;
    }

    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      console.error('[GameStateManager] 卡牌索引无效');
      return false;
    }

    const discardedCard = player.hand[cardIndex];
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    
    // 从手牌中移除
    const newHand = [...player.hand];
    newHand.splice(cardIndex, 1);
    
    // 添加到弃牌堆
    const newDiscard = [...(player.discard || []), discardedCard];
    
    this.gameState.players[playerIndex] = {
      ...player,
      hand: newHand,
      discard: newDiscard
    };
    
    this.addLog(`${player.name} 弃置卡牌`, { action: 'card_discard', cardId: discardedCard });
    this.broadcastStateUpdate();
    
    return true;
  }
  
  /**
   * 结束当前玩家的行动阶段
   */
  endPlayerTurn(playerId: string): boolean {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }

    if (!this.isPlayerTurn(playerId)) {
      console.error('[GameStateManager] 不是当前玩家的回合');
      return false;
    }

    if (this.gameState.currentPhase !== 'action') {
      console.error('[GameStateManager] 当前不是行动阶段');
      return false;
    }

    // 清空当前玩家行动点
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex >= 0) {
      this.gameState.players[playerIndex] = {
        ...this.gameState.players[playerIndex],
        remainingActions: 0
      };
    }

    // 推进到响应阶段
    return this.advancePhase();
  }

  /**
   * 结束当前回合（用于UI调用）
   */
  endCurrentTurn(): boolean {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.error('[GameStateManager] 没有当前玩家');
      return false;
    }

    return this.endPlayerTurn(currentPlayer.id);
  }
  
  // ==================== 玩家操作 ====================
  
  /**
   * 玩家使用卡牌
   */
  playCard(
    playerId: string,
    cardIndex: number,
    target?: {
      area?: 'perimeter' | 'dmz' | 'internal' | 'ics';
      playerId?: string;
      cardId?: string;
    }
  ): boolean {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }

    // 检查AI是否正在行动
    if (this.aiActing) {
      console.error('[GameStateManager] AI正在行动中，请稍后再试');
      return false;
    }

    // 检查阶段锁
    if (this.phaseLock) {
      console.error('[GameStateManager] 游戏状态正在更新中，请稍后再试');
      return false;
    }
    
    if (!this.isPlayerTurn(playerId)) {
      console.error('[GameStateManager] 不是当前玩家的回合');
      return false;
    }
    
    if (this.gameState.currentPhase !== 'action') {
      console.error('[GameStateManager] 当前不是行动阶段');
      return false;
    }
    
    if (!this.hasRemainingActions(playerId)) {
      console.error('[GameStateManager] 行动点不足');
      return false;
    }
    
    const player = this.getPlayer(playerId);
    if (!player) {
      console.error('[GameStateManager] 玩家不存在');
      return false;
    }
    
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      console.error('[GameStateManager] 卡牌索引无效');
      return false;
    }
    
    // 获取要打出的卡牌
    const cardId = player.hand[cardIndex];
    const card = COMPLETE_CARD_DATABASE[cardId];
    
    if (!card) {
      console.error(`[GameStateManager] 卡牌不存在: ${cardId}`);
      return false;
    }
    
    // 检查资源是否足够
    const cardCost = card.cost || {};
    const costCompute = (cardCost as Record<string, number>).compute || 0;
    const costFunds = (cardCost as Record<string, number>).funds || 0;
    const costInformation = (cardCost as Record<string, number>).information || 0;
    const costPermission = (cardCost as Record<string, number>).permission || 0;
    
    const hasEnoughResources = 
      costCompute <= player.resources.compute &&
      costFunds <= player.resources.funds &&
      costInformation <= player.resources.information &&
      costPermission <= player.resources.permission;
    
    if (!hasEnoughResources) {
      console.error('[GameStateManager] 资源不足');
      // 触发资源不足事件
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('resourceInsufficient', {
          detail: {
            playerId,
            required: {
              compute: costCompute,
              funds: costFunds,
              information: costInformation,
              permission: costPermission
            },
            available: {
              compute: player.resources.compute,
              funds: player.resources.funds,
              information: player.resources.information,
              permission: player.resources.permission
            }
          }
        }));
      }
      return false;
    }
    
    // 从手牌中移除卡牌
    const newHand = [...player.hand];
    newHand.splice(cardIndex, 1);
    
    // 将卡牌放入弃牌堆
    const newDiscard = [...player.discard, cardId];
    
    // 扣除资源
    let newResources: Resources = {
      compute: player.resources.compute - costCompute,
      funds: player.resources.funds - costFunds,
      information: player.resources.information - costInformation,
      permission: player.resources.permission - costPermission,
    };
    
    // 执行卡牌效果（使用队伍等级管理器）
    let effectDescription = '';
    const effectDescriptions: string[] = [];
    
    // 遍历所有效果并执行
    if (card.effects && card.effects.length > 0) {
      for (const effect of card.effects) {
        let singleEffectDescription = '';
        
        if (effect.type === 'infiltration_gain') {
          // 使用队伍等级管理器修改队伍共享渗透等级
          const result = TeamLevelManager.applyLevelChange(
            this.gameState,
            playerId,
            'infiltration',
            effect.baseValue || 1,
            false, // 常规效果，不是个体效果
            card.name
          );
          this.gameState = result.newGameState;
          singleEffectDescription = result.result.message;
        } else if (effect.type === 'security_reduce') {
          // 对敌方队伍生效（减少安全等级）
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            const result = TeamLevelManager.applyLevelChange(
              this.gameState,
              opponent.id,
              'safety',
              -(effect.baseValue || 1),
              false,
              card.name
            );
            this.gameState = result.newGameState;
            singleEffectDescription = result.result.message;
          }
        } else if (effect.type === 'security_gain') {
          // 使用队伍等级管理器修改队伍共享安全等级
          const result = TeamLevelManager.applyLevelChange(
            this.gameState,
            playerId,
            'safety',
            effect.baseValue || 1,
            false,
            card.name
          );
          this.gameState = result.newGameState;
          singleEffectDescription = result.result.message;
        } else if (effect.type === 'infiltration_reduce') {
          // 对敌方队伍生效（减少渗透等级）
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            const result = TeamLevelManager.applyLevelChange(
              this.gameState,
              opponent.id,
              'infiltration',
              -(effect.baseValue || 1),
              false,
              card.name
            );
            this.gameState = result.newGameState;
            singleEffectDescription = result.result.message;
          }
        } else if (effect.type === 'ultimate_protocol') {
          // 终极协议特殊效果
          const effectRecord = effect as unknown as Record<string, unknown>;
          const baseValue = (effectRecord.baseValue as number) || 5;
          const opponentDifficultyIncrease = (effectRecord.opponentDifficultyIncrease as number) || 1;
          const duration = (effectRecord.duration as number) || 1;
          
          // 1. 消耗所有资源
          const resourcesBefore = { ...newResources };
          newResources = { compute: 0, funds: 0, information: 0, permission: 0 };
          
          // 2. 根据阵营增加安全或渗透等级
          const isAttacker = player.faction === 'attacker';
          const levelType = isAttacker ? 'infiltration' : 'safety';
          const levelResult = TeamLevelManager.applyLevelChange(
            this.gameState,
            playerId,
            levelType,
            baseValue,
            false,
            card.name
          );
          this.gameState = levelResult.newGameState;
          
          // 3. 给对方添加判定难度增加的debuff
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            // 添加临时修改器到对手
            if (!this.gameState.players.find(p => p.id === opponent.id)?.individualModifiers) {
              const opponentIndex = this.gameState.players.findIndex(p => p.id === opponent.id);
              if (opponentIndex !== -1) {
                this.gameState.players[opponentIndex].individualModifiers = {
                  infiltrationGainModifier: 1.0,
                  safetyGainModifier: 1.0,
                  judgmentDifficultyModifier: opponentDifficultyIncrease
                };
              }
            } else {
              const opponentIndex = this.gameState.players.findIndex(p => p.id === opponent.id);
              if (opponentIndex !== -1) {
                this.gameState.players[opponentIndex].individualModifiers.judgmentDifficultyModifier = 
                  (this.gameState.players[opponentIndex].individualModifiers.judgmentDifficultyModifier || 0) + opponentDifficultyIncrease;
              }
            }
          }
          
          singleEffectDescription = `消耗所有资源，${isAttacker ? '渗透' : '安全'}+${baseValue}，对方下回合判定难度+${opponentDifficultyIncrease}`;
          
          // 添加日志记录
          this.addLog(`${player.name} 使用[${card.name}]：消耗所有资源(${resourcesBefore.compute}算力/${resourcesBefore.funds}资金/${resourcesBefore.information}信息/${resourcesBefore.permission}权限)，${isAttacker ? '渗透' : '安全'}+${baseValue}，对方判定难度+${opponentDifficultyIncrease}`, {
            playerId,
            cardId,
            cardName: card.name,
            action: 'ultimate_protocol',
            resourcesConsumed: resourcesBefore,
            levelType,
            levelGain: baseValue,
            opponentDifficultyIncrease,
            duration
          });
        } else if (effect.type === 'resource_gain') {
          const resourceType = (effect.resourceType || 'compute') as keyof Resources;
          const maxValues: Record<keyof Resources, number> = {
            compute: 15,
            funds: 20,
            information: 10,
            permission: 5
          };
          const currentValue = newResources[resourceType];
          const gainValue = ((effect as unknown) as Record<string, number>).value || 1;
          (newResources as Record<keyof Resources, number>)[resourceType] = Math.min(
            maxValues[resourceType],
            currentValue + gainValue
          );
          singleEffectDescription = `${String(resourceType)}+${gainValue}`;
        } else if (effect.type === 'dice_check') {
        // 判定类卡牌 - 根据规则决定是延迟判定还是即时判定
        const effectRecord = effect as unknown as Record<string, unknown>;
        const difficulty = (effectRecord.difficulty as number) || 3;
        
        console.log(`[GameStateManager] 判定类卡牌: ${card.name}, 难度: ${difficulty}`);
        console.log(`[GameStateManager] 卡牌描述: ${card.description}`);
        
        // 标记行动阶段使用了判定类卡牌
        TurnPhaseSystem.markJudgmentCardPlayed();
        
        // 检查是否是延迟类判定（卡牌描述中包含"延迟"、"持续"、"下回合"、"准备"等关键词）
        const isDelayed = card.description.includes('延迟') || 
                         card.description.includes('持续') ||
                         card.description.includes('每回合') ||
                         card.description.includes('下回合') ||
                         card.description.includes('准备') ||
                         card.type === 'delayed_judgment' ||
                         card.name.includes('准备') ||
                         card.name.includes('定时');
        
        console.log(`[GameStateManager] 是否延迟判定: ${isDelayed}`);
        
        // 解析判定效果
        const successEffect = {
          description: String((effectRecord.onSuccess as Record<string, unknown>)?.description || '判定成功'),
          infiltrationChange: ((effectRecord.onSuccess as Record<string, unknown>)?.baseValue as number),
          safetyChange: ((effectRecord.onSuccess as Record<string, unknown>)?.safetyChange as number),
          resourceChanges: ((effectRecord.onSuccess as Record<string, unknown>)?.resourceChanges as Record<string, number>),
        };
        const failureEffect = {
          description: String((effectRecord.onFailure as Record<string, unknown>)?.description || '判定失败'),
          infiltrationChange: ((effectRecord.onFailure as Record<string, unknown>)?.baseValue as number),
          safetyChange: ((effectRecord.onFailure as Record<string, unknown>)?.safetyChange as number),
          resourceChanges: ((effectRecord.onFailure as Record<string, unknown>)?.resourceChanges as Record<string, number>),
        };
        
        if (isDelayed) {
          // 延迟判定：添加到待处理判定队列，在下个判定阶段执行
          // 延迟判定的目标：如果是攻击方卡牌，通常对防御方生效；反之亦然
          const targetPlayer = this.gameState.players.find(p => p.id !== playerId);
          if (targetPlayer) {
            const judgmentId = PendingJudgmentSystem.addPendingJudgment(targetPlayer.id, {
              type: 'dice' as JudgmentType,
              targetPlayerId: targetPlayer.id,
              source: {
                playerId: player.id,
                cardId: card.card_code,
                description: `${card.name}`,
              },
              difficulty: difficulty,
              effects: {
                success: successEffect,
                failure: failureEffect,
              },
            });
            singleEffectDescription = `对${targetPlayer.name}设置延迟判定（难度${difficulty}），将在下个判定阶段结算`;
            
            // 添加日志记录
            this.addLog(`${player.name} 使用[${card.name}]设置了延迟判定，目标：${targetPlayer.name}，难度：${difficulty}`, {
              playerId,
              cardId,
              cardName: card.name,
              action: 'delayed_judgment_set',
              targetPlayerId: targetPlayer.id,
              difficulty,
              judgmentId,
            });
          }
        } else {
          // 即时判定：在响应阶段触发并完成判定
          // 根据规则：即时判定类卡牌在当前玩家的响应阶段立即触发并完成判定
          // 重要：将判定事件添加到发起者（当前玩家）的队列中，以便在本回合的响应阶段处理
          const targetPlayer = this.gameState.players.find(p => p.id !== playerId);
          if (targetPlayer) {
            // 添加到发起者（当前玩家）的响应系统，在当前玩家回合的响应阶段处理
            // 注意：不在此处触发JudgmentEventBus，判定UI将在响应阶段由TurnPhaseSystem触发
            ResponseSystem.addResponseEvent(player.id, {
              type: 'immediate_judgment',
              sourcePlayerId: player.id,
              targetPlayerId: targetPlayer.id,
              description: `${card.name}的即时判定`,
              judgmentType: 'dice' as JudgmentType,
              difficulty: difficulty,
              effects: {
                success: successEffect,
                failure: failureEffect,
              },
            });

            // 不立即触发判定UI，只记录日志
            singleEffectDescription = `对${targetPlayer.name}发起即时判定（难度${difficulty}），将在响应阶段结算`;
            
            // 添加日志记录
            this.addLog(`${player.name} 使用[${card.name}]发起即时判定，目标：${targetPlayer.name}，难度：${difficulty}，将在响应阶段结算`, {
              playerId,
              cardId,
              cardName: card.name,
              action: 'immediate_judgment_triggered',
              targetPlayerId: targetPlayer.id,
              difficulty,
            });
          }
        }
        } else if (effect.type === 'infiltration_suppress') {
          // 渗透压制：压制对方渗透等级提升
          const effectRecord = effect as unknown as Record<string, unknown>;
          const duration = (effectRecord.duration as number) || 1;
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            // 添加渗透压制状态到对手
            const opponentIndex = this.gameState.players.findIndex(p => p.id === opponent.id);
            if (opponentIndex !== -1) {
              if (!this.gameState.players[opponentIndex].statusEffects) {
                this.gameState.players[opponentIndex].statusEffects = [];
              }
              this.gameState.players[opponentIndex].statusEffects.push({
                type: 'infiltration_suppress',
                duration: duration,
                source: card.name,
              });
              singleEffectDescription = `压制${opponent.name}的渗透等级提升（${duration}回合）`;
              
              this.addLog(`${player.name} 使用[${card.name}]压制了${opponent.name}的渗透等级提升`, {
                playerId,
                cardId,
                cardName: card.name,
                action: 'infiltration_suppress',
                targetPlayerId: opponent.id,
                duration,
              });
            }
          }
        } else if (effect.type === 'security_suppress') {
          // 安全压制：压制对方安全等级提升
          const effectRecord = effect as unknown as Record<string, unknown>;
          const duration = (effectRecord.duration as number) || 1;
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            // 添加安全压制状态到对手
            const opponentIndex = this.gameState.players.findIndex(p => p.id === opponent.id);
            if (opponentIndex !== -1) {
              if (!this.gameState.players[opponentIndex].statusEffects) {
                this.gameState.players[opponentIndex].statusEffects = [];
              }
              this.gameState.players[opponentIndex].statusEffects.push({
                type: 'security_suppress',
                duration: duration,
                source: card.name,
              });
              singleEffectDescription = `压制${opponent.name}的安全等级提升（${duration}回合）`;
              
              this.addLog(`${player.name} 使用[${card.name}]压制了${opponent.name}的安全等级提升`, {
                playerId,
                cardId,
                cardName: card.name,
                action: 'security_suppress',
                targetPlayerId: opponent.id,
                duration,
              });
            }
          }
        } else if (effect.type === 'resource_steal') {
          // 资源窃取：从对方窃取资源
          const effectRecord = effect as unknown as Record<string, unknown>;
          const resourceType = (effectRecord.resourceType || 'compute') as keyof Resources;
          const stealValue = (effectRecord.value as number) || 1;
          
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            const opponentIndex = this.gameState.players.findIndex(p => p.id === opponent.id);
            if (opponentIndex !== -1) {
              // 减少对方资源
              const opponentResources = { ...this.gameState.players[opponentIndex].resources };
              const actualSteal = Math.min(opponentResources[resourceType], stealValue);
              opponentResources[resourceType] = Math.max(0, opponentResources[resourceType] - actualSteal);
              this.gameState.players[opponentIndex].resources = opponentResources;
              
              // 增加己方资源
              const maxValues: Record<keyof Resources, number> = {
                compute: 15,
                funds: 20,
                information: 10,
                permission: 5
              };
              newResources[resourceType] = Math.min(maxValues[resourceType], newResources[resourceType] + actualSteal);
              
              singleEffectDescription = `从${opponent.name}窃取${actualSteal}${String(resourceType)}`;
              
              this.addLog(`${player.name} 使用[${card.name}]从${opponent.name}窃取了${actualSteal}${String(resourceType)}`, {
                playerId,
                cardId,
                cardName: card.name,
                action: 'resource_steal',
                targetPlayerId: opponent.id,
                resourceType,
                stealAmount: actualSteal,
              });
            }
          }
        } else if (effect.type === 'draw') {
          // 抽牌效果
          const effectRecord = effect as unknown as Record<string, unknown>;
          const drawCount = (effectRecord.count as number) || 1;
          
          // 使用 TechTreeDrawSystem 抽卡
          const drawResults = TechTreeDrawSystem.drawMultipleCards(
            playerId,
            player.faction,
            player.infiltrationLevel,
            player.safetyLevel,
            drawCount
          );
          
          const drawnCardIds = drawResults.map(r => r.cardId);
          newHand.push(...drawnCardIds);
          
          singleEffectDescription = `抽取${drawCount}张卡牌`;
          
          this.addLog(`${player.name} 使用[${card.name}]抽取了${drawCount}张卡牌`, {
            playerId,
            cardId,
            cardName: card.name,
            action: 'draw_cards',
            drawCount,
            drawnCardIds,
          });
        } else if (effect.type === 'discard') {
          // 弃牌效果：让对方弃牌
          const effectRecord = effect as unknown as Record<string, unknown>;
          const discardCount = (effectRecord.count as number) || 1;
          
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            const opponentIndex = this.gameState.players.findIndex(p => p.id === opponent.id);
            if (opponentIndex !== -1) {
              const opponentHand = [...this.gameState.players[opponentIndex].hand];
              const actualDiscard = Math.min(opponentHand.length, discardCount);
              const discardedCards = opponentHand.splice(0, actualDiscard);
              
              this.gameState.players[opponentIndex].hand = opponentHand;
              this.gameState.players[opponentIndex].discard.push(...discardedCards);
              
              singleEffectDescription = `让${opponent.name}弃置${actualDiscard}张手牌`;
              
              this.addLog(`${player.name} 使用[${card.name}]让${opponent.name}弃置了${actualDiscard}张手牌`, {
                playerId,
                cardId,
                cardName: card.name,
                action: 'discard',
                targetPlayerId: opponent.id,
                discardCount: actualDiscard,
                discardedCards,
              });
            }
          }
        } else if (effect.type === 'protection') {
          // 保护效果：防止等级下降
          const effectRecord = effect as unknown as Record<string, unknown>;
          const duration = (effectRecord.duration as number) || 1;
          const protectType = (effectRecord.protectType as string) || 'both'; // 'infiltration', 'safety', or 'both'
          
          const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
          if (playerIndex !== -1) {
            if (!this.gameState.players[playerIndex].statusEffects) {
              this.gameState.players[playerIndex].statusEffects = [];
            }
            this.gameState.players[playerIndex].statusEffects.push({
              type: 'protection',
              duration: duration,
              protectType: protectType,
              source: card.name,
            });
            
            const protectTypeText = protectType === 'both' ? '渗透和安全' : 
                                   protectType === 'infiltration' ? '渗透' : '安全';
            singleEffectDescription = `获得${protectTypeText}等级保护（${duration}回合）`;
            
            this.addLog(`${player.name} 使用[${card.name}]获得了${protectTypeText}等级保护`, {
              playerId,
              cardId,
              cardName: card.name,
              action: 'protection',
              protectType,
              duration,
            });
          }
        } else if (effect.type === 'clear_effect') {
          // 清除效果：清除自身的负面状态
          const effectRecord = effect as unknown as Record<string, unknown>;
          const clearType = (effectRecord.clearType as string) || 'all'; // 'all', 'debuff', or specific type
          
          const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
          if (playerIndex !== -1) {
            const beforeEffects = this.gameState.players[playerIndex].statusEffects || [];
            let afterEffects = beforeEffects;
            
            if (clearType === 'all') {
              afterEffects = [];
            } else if (clearType === 'debuff') {
              afterEffects = beforeEffects.filter(e => 
                e.type !== 'infiltration_suppress' && 
                e.type !== 'security_suppress'
              );
            } else {
              afterEffects = beforeEffects.filter(e => e.type !== clearType);
            }
            
            const clearedCount = beforeEffects.length - afterEffects.length;
            this.gameState.players[playerIndex].statusEffects = afterEffects;
            
            singleEffectDescription = `清除了${clearedCount}个状态效果`;
            
            this.addLog(`${player.name} 使用[${card.name}]清除了${clearedCount}个状态效果`, {
              playerId,
              cardId,
              cardName: card.name,
              action: 'clear_effect',
              clearType,
              clearedCount,
            });
          }
        } else if (effect.type === 'rps_check') {
          // RPS（剪刀石头布）判定
          const effectRecord = effect as unknown as Record<string, unknown>;
          const isDelayed = (effectRecord.isDelayed as boolean) || false;
          
          // 标记行动阶段使用了判定类卡牌
          TurnPhaseSystem.markJudgmentCardPlayed();
          
          console.log(`[GameStateManager] RPS判定类卡牌: ${card.name}, 是否延迟: ${isDelayed}`);
          
          const winEffect = {
            description: String((effectRecord.onWin as Record<string, unknown>)?.description || 'RPS胜利'),
            infiltrationChange: ((effectRecord.onWin as Record<string, unknown>)?.baseValue as number) || 1,
          };
          const loseEffect = {
            description: String((effectRecord.onLose as Record<string, unknown>)?.description || 'RPS失败'),
            infiltrationChange: -(((effectRecord.onLose as Record<string, unknown>)?.baseValue as number) || 1),
          };
          // 平局效果（可选）
          // const drawEffect = effectRecord.onDraw ? {
          //   description: String((effectRecord.onDraw as Record<string, unknown>)?.description || 'RPS平局'),
          //   infiltrationChange: ((effectRecord.onDraw as Record<string, unknown>)?.baseValue as number) || 0,
          // } : undefined;
          
          const opponent = this.gameState.players.find(p => p.id !== playerId);
          if (opponent) {
            if (isDelayed) {
              // 延迟RPS判定：在判定阶段执行
              PendingJudgmentSystem.addPendingJudgment(opponent.id, {
                type: 'rps',
                targetPlayerId: opponent.id,
                source: {
                  playerId: player.id,
                  cardId: card.card_code,
                  description: `${card.name}的延迟RPS判定`,
                },
                effects: {
                  success: winEffect,
                  failure: loseEffect,
                },
              });
              singleEffectDescription = `对${opponent.name}设置延迟RPS判定`;
            } else {
              // 即时RPS判定：在响应阶段执行
              ResponseSystem.addResponseEvent(opponent.id, {
                type: 'immediate_judgment',
                sourcePlayerId: player.id,
                targetPlayerId: opponent.id,
                description: `${card.name}的即时RPS判定`,
                judgmentType: 'rps',
                effects: {
                  success: winEffect,
                  failure: loseEffect,
                },
              });

              // 触发RPS判定UI显示
              JudgmentEventBus.emitJudgmentStart({
                id: `rps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'rps',
                phase: 'response',
                title: `${card.name}的RPS判定`,
                description: `${card.name}的剪刀石头布对决`,
                initiatorId: player.id,
                initiatorName: player.name,
                targetId: opponent.id,
                targetName: opponent.name,
                onSuccess: winEffect,
                onFailure: loseEffect,
                cardName: card.name,
              });

              singleEffectDescription = `对${opponent.name}发起即时RPS判定`;
            }
          }
        }
        
        // 收集效果描述
        if (singleEffectDescription) {
          effectDescriptions.push(singleEffectDescription);
        }
      }
      
      // 合并所有效果描述
      effectDescription = effectDescriptions.join('；');
    }
    
    // ===== 连击系统处理 =====
    // 1. 记录卡牌使用到连击系统
    ComboStateManager.recordCardPlay(playerId, card as import('@/types/legacy/card_v16').Card);
    
    // 2. 应用连击效果（如果有）
    const comboResult = ComboStateManager.applyComboEffect(this.gameState, playerId, card as import('@/types/legacy/card_v16').Card);
    if (comboResult.bonusApplied) {
      // 更新游戏状态（连击效果已应用）
      this.gameState = comboResult.newGameState;
      effectDescription += effectDescription ? ` [${comboResult.message}]` : `[${comboResult.message}]`;
      
      // 更新玩家引用（因为游戏状态已更新）
      const updatedPlayer = this.gameState.players.find(p => p.id === playerId);
      if (updatedPlayer) {
        player.infiltrationLevel = updatedPlayer.infiltrationLevel;
        player.safetyLevel = updatedPlayer.safetyLevel;
        player.resources = updatedPlayer.resources;
      }
    }
    
    // 消耗行动点并更新玩家状态
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    this.gameState.players[playerIndex] = {
      ...player,
      hand: newHand,
      discard: newDiscard,
      resources: newResources,
      remainingActions: player.remainingActions - 1,
      infiltrationLevel: player.infiltrationLevel,
      safetyLevel: player.safetyLevel,
    };
    
    // 添加日志
    this.addLog(`${player.name} 使用[${card.name}]${effectDescription ? ' - ' + effectDescription : ''}`, {
      playerId,
      cardId,
      cardName: card.name,
      cardIndex,
      target,
      remainingActions: player.remainingActions - 1,
      effect: effectDescription,
    });
    
    this.broadcastStateUpdate();
    
    return true;
  }

  /**
   * 在区域放置标记
   * 用于标志相关卡牌的效果执行
   * 
   * @param playerId 玩家ID
   * @param area 目标区域
   * @param markerType 标记类型
   * @param strength 标记强度（默认1）
   * @returns 是否成功放置
   */
  placeMarkerInArea(
    playerId: string,
    area: AreaType,
    markerType: 'threat' | 'defense' | 'aura' = 'threat',
    strength: number = 1
  ): boolean {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      console.error('[GameStateManager] 玩家不存在');
      return false;
    }

    // 获取当前区域状态
    const currentArea = this.gameState.areas[area];
    if (!currentArea) {
      console.error(`[GameStateManager] 区域不存在: ${area}`);
      return false;
    }

    // 创建新的标记
    const newToken = {
      type: markerType === 'threat' ? 'threat' : markerType === 'defense' ? 'defense' : 'aura',
      owner: playerId,
      strength: strength,
    };

    // 更新区域状态
    this.gameState.areas = {
      ...this.gameState.areas,
      [area]: {
        ...currentArea,
        tokens: [...currentArea.tokens, newToken],
      },
    };

    // 重新计算区域控制
    this.recalculateAreaControl();

    // 添加日志
    const areaNames: Record<AreaType, string> = {
      perimeter: '网络边界',
      dmz: '隔离区',
      internal: '内网',
      ics: '工控系统',
    };
    const markerTypeNames: Record<string, string> = {
      threat: '威胁标记',
      defense: '防御标记',
      aura: '光环标记',
    };
    this.addLog(`${player.name} 在[${areaNames[area]}]放置了${markerTypeNames[markerType]}`, {
      playerId,
      area,
      markerType,
      strength,
    });

    this.broadcastStateUpdate();
    console.log(`[GameStateManager] ${player.name} 在${areaNames[area]}放置了${markerTypeNames[markerType]}`);
    
    return true;
  }

  /**
   * 重新计算所有区域的控制状态
   * 解决"进攻标志数量多于防御标志但区域仍无法归于进攻方"的问题
   */
  private recalculateAreaControl(): void {
    if (!this.gameState) return;

    const updatedAreas = { ...this.gameState.areas };

    (Object.keys(updatedAreas) as AreaType[]).forEach((areaType) => {
      const area = updatedAreas[areaType];
      
      // 统计各方标记数
      const attackerTokens = area.tokens.filter((t) => {
        const owner = this.gameState!.players.find((p) => p.id === t.owner);
        return owner?.faction === 'attacker';
      }).length;
      
      const defenderTokens = area.tokens.filter((t) => {
        const owner = this.gameState!.players.find((p) => p.id === t.owner);
        return owner?.faction === 'defender';
      }).length;

      // 控制判定：己方标记数 > 对方标记数
      let newController: Faction | null = null;
      if (attackerTokens > defenderTokens) {
        newController = 'attacker';
      } else if (defenderTokens > attackerTokens) {
        newController = 'defender';
      }

      // 只有当控制者发生变化时才记录日志
      if (area.controlledBy !== newController) {
        const areaNames: Record<AreaType, string> = {
          perimeter: '网络边界',
          dmz: '隔离区',
          internal: '内网',
          ics: '工控系统',
        };
        
        if (newController) {
          const factionName = newController === 'attacker' ? '进攻方' : '防御方';
          this.addLog(`[${areaNames[areaType]}] 被${factionName}控制 (${attackerTokens}:${defenderTokens})`, {
            area: areaType,
            controller: newController,
            attackerTokens,
            defenderTokens,
          });
          console.log(`[AreaControl] ${areaNames[areaType]} 控制权变更: ${factionName} (${attackerTokens}:${defenderTokens})`);
        } else {
          this.addLog(`[${areaNames[areaType]}] 变为无人控制 (${attackerTokens}:${defenderTokens})`, {
            area: areaType,
            controller: null,
            attackerTokens,
            defenderTokens,
          });
        }
      }

      updatedAreas[areaType] = {
        ...area,
        controlledBy: newController,
        controlStrength: Math.abs(attackerTokens - defenderTokens),
      };
    });

    this.gameState.areas = updatedAreas;
  }
  
  /**
   * 玩家执行判定（猜拳或骰子）
   */
  executeJudgment(
    playerId: string,
    _judgmentType: 'rps' | 'dice',
    _choice?: 'probe' | 'harden' | 'counter',
    _diceModifier?: number
  ): boolean {
    if (!this.gameState) return false;

    if (!this.isPlayerTurn(playerId)) {
      console.error('[GameStateManager] 不是当前玩家的回合');
      return false;
    }

    // TODO: 实现判定逻辑
    // 这里需要调用rpsMechanic或diceMechanic

    return true;
  }
  
  /**
   * 玩家跳过行动
   */
  skipAction(playerId: string): boolean {
    if (!this.gameState) return false;
    
    if (!this.isPlayerTurn(playerId)) {
      console.error('[GameStateManager] 不是当前玩家的回合');
      return false;
    }
    
    if (this.gameState.currentPhase !== 'action') {
      console.error('[GameStateManager] 当前不是行动阶段');
      return false;
    }
    
    const player = this.getPlayer(playerId);
    if (!player) return false;
    
    // 清空行动点并结束回合
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    this.gameState.players[playerIndex] = {
      ...player,
      remainingActions: 0
    };
    
    this.addLog(`${player.name} 跳过行动`);
    this.broadcastStateUpdate();
    
    return this.advancePhase();
  }
  
  // ==================== AI 管理 ====================

  /**
   * AI行动（供外部调用）
   */
  async aiAction(playerId: string): Promise<boolean> {
    if (!this.gameState) {
      console.error('[GameStateManager] 游戏未初始化');
      return false;
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      console.error('[GameStateManager] 玩家不存在');
      return false;
    }

    if (!player.isAI) {
      console.error('[GameStateManager] 不是AI玩家');
      return false;
    }

    if (!this.isPlayerTurn(playerId)) {
      console.error('[GameStateManager] 不是该AI的回合');
      return false;
    }

    // 触发AI行动
    await this.triggerAIAction();
    return true;
  }

  /**
   * 触发AI行动
   */
  async triggerAIAction(): Promise<void> {
    if (!this.gameState) return;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.isAI) return;

    // 设置AI超时
    this.aiTimeoutId = setTimeout(() => {
      console.warn(`[GameStateManager] AI ${currentPlayer.name} 超时，强制结束回合`);
      this.endPlayerTurn(currentPlayer.id);
    }, this.AI_TIMEOUT_MS);

    try {
      // TODO: 实现AI行动逻辑
      // 这里需要调用AI引擎来决定AI的行动

      // 模拟AI行动延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AI行动完成后结束回合
      this.endPlayerTurn(currentPlayer.id);
    } catch (error) {
      console.error('[GameStateManager] AI行动失败:', error);
      this.endPlayerTurn(currentPlayer.id);
    } finally {
      this.clearAITimeout();
    }
  }
  
  // ==================== 日志管理 ====================
  
  /**
   * 添加日志
   * 
   * 日志内容规范：
   * - 玩家卡牌操作记录：卡牌ID、名称、玩家ID、昵称、时间戳、使用场景
   * - 游戏流程记录：回合开始/结束、阶段切换、玩家、阶段名称、时间戳
   * - 资源变动记录：资源类型、变动前后数值、变动原因、触发条件
   * - 卡牌效果判定记录：成功/失败状态、判定依据、对游戏状态的影响
   */
  private addLog(message: string, details?: Record<string, any>): void {
    if (!this.gameState) return;
    
    const currentPlayer = this.getCurrentPlayer();
    
    // 从details中提取action，如果没有则默认为'event'
    const action = details?.action || 'event';
    
    // 构建完整的日志详情
    const enhancedDetails: Record<string, any> = {
      ...details,
      // 时间戳（格式：YYYY-MM-DD HH:MM:SS）
      formattedTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      // 游戏上下文
      gameContext: {
        round: this.gameState.round,
        turn: this.gameState.turn,
        phase: this.gameState.currentPhase,
      },
    };
    
    // 如果是玩家操作，添加玩家信息
    if (currentPlayer) {
      enhancedDetails.playerInfo = {
        id: currentPlayer.id,
        name: currentPlayer.name,
        faction: currentPlayer.faction,
      };
    }
    
    const entry: GameLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      turn: this.gameState.turn,
      round: this.gameState.round,
      phase: this.gameState.currentPhase,
      playerId: currentPlayer?.id,
      action,
      message,
      details: enhancedDetails,
    };
    
    this.gameState.log.push(entry);
    this.gameState.updatedAt = Date.now();
    
    console.log(`[GameLog] ${message}`, enhancedDetails);
  }
  
  /**
   * 添加资源变动日志
   * 
   * @param playerId 玩家ID
   * @param resourceType 资源类型
   * @param beforeValue 变动前数值
   * @param afterValue 变动后数值
   * @param reason 变动原因
   * @param trigger 触发条件
   */
  private addResourceChangeLog(
    playerId: string,
    resourceType: string,
    beforeValue: number,
    afterValue: number,
    reason: string,
    trigger: string
  ): void {
    const change = afterValue - beforeValue;
    const player = this.getPlayer(playerId);
    if (!player) return;
    
    this.addLog(
      `${player.name} 的${resourceType} ${change > 0 ? '增加' : '减少'} ${Math.abs(change)} (${beforeValue} → ${afterValue})`,
      {
        action: 'resource_change',
        playerId,
        resourceType,
        beforeValue,
        afterValue,
        change,
        reason,
        trigger,
      }
    );
  }
  
  /**
   * 添加卡牌判定日志
   * 
   * @param cardId 卡牌ID
   * @param cardName 卡牌名称
   * @param judgmentType 判定类型（dice/rps）
   * @param result 判定结果（success/failure）
   * @param details 判定详情
   */
  private addJudgmentLog(
    cardId: string,
    cardName: string,
    judgmentType: 'dice' | 'rps',
    result: 'success' | 'failure',
    details: {
      roll?: number;
      difficulty?: number;
      playerChoice?: string;
      opponentChoice?: string;
      effect: string;
    }
  ): void {
    const resultText = result === 'success' ? '成功' : '失败';
    
    this.addLog(
      `[${cardName}] 判定${resultText}${details.effect ? ' - ' + details.effect : ''}`,
      {
        action: 'judgment_result',
        cardId,
        cardName,
        judgmentType,
        result,
        ...details,
      }
    );
  }
  
  /**
   * 清空日志
   * 仅在游戏结束时调用
   */
  clearLogs(): void {
    if (!this.gameState) return;
    
    this.gameState.log = [];
    this.gameState.updatedAt = Date.now();
    
    console.log('[GameStateManager] 日志已清空');
    this.addLog('游戏日志已重置', { action: 'system', event: 'logs_cleared' });
    this.broadcastStateUpdate();
  }
  
  // ==================== 状态广播 ====================
  
  /**
   * 广播状态更新
   */
  private broadcastStateUpdate(): void {
    if (this.onStateChange && this.gameState) {
      this.onStateChange({ ...this.gameState });
    }
  }
  
  // ==================== 清理 ====================
  
  /**
   * 清理AI超时
   */
  private clearAITimeout(): void {
    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
  }
  
  /**
   * 清理状态
   */
  private clearState(): void {
    this.clearAITimeout();
    this.gameState = null;
    this.phaseLock = false;
  }
  
  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearState();
    this.onStateChange = null;
    this.onGameEnd = null;
  }
}

// ==================== 辅助函数 ====================

/**
 * 创建初始区域状态
 */
function createInitialAreas(): Record<AreaType, AreaState> {
  return {
    perimeter: {
      type: 'perimeter',
      tokens: [],
      defenses: [],
      controlStrength: 0,
      controlledBy: null,
      strategicValue: 1
    },
    dmz: {
      type: 'dmz',
      tokens: [],
      defenses: [],
      controlStrength: 0,
      controlledBy: null,
      strategicValue: 2
    },
    internal: {
      type: 'internal',
      tokens: [],
      defenses: [],
      controlStrength: 0,
      controlledBy: null,
      strategicValue: 3
    },
    ics: {
      type: 'ics',
      tokens: [],
      defenses: [],
      controlStrength: 0,
      controlledBy: null,
      strategicValue: 4
    }
  };
}

/**
 * 创建初始牌库
 * R4.3: 初始牌库应该包含多样化的卡牌
 */
function createInitialDeck(faction: Faction): CardId[] {
  const deck: CardId[] = [];

  // 从完整卡牌数据库获取阵营卡牌
  const factionCards = getCardsByFaction(faction === 'attacker' ? 'attack' : 'defense');
  const neutralCards = getCardsByFaction('neutral');

  // 按科技等级筛选T1卡牌（初始可用）
  const t1Cards = factionCards.filter(card => card.techLevel === 1);
  const t2Cards = factionCards.filter(card => card.techLevel === 2);
  
  // 随机打乱T1卡牌顺序，确保多样性
  const shuffledT1 = shuffleDeck([...t1Cards.map(c => c.card_code as CardId)]);
  const shuffledT2 = shuffleDeck([...t2Cards.map(c => c.card_code as CardId)]);
  const shuffledNeutral = shuffleDeck([...neutralCards.map(c => c.card_code as CardId)]);
  
  // 添加多样化的T1卡牌（随机选择8种，每种2张）
  const selectedT1 = shuffledT1.slice(0, 8);
  selectedT1.forEach(cardId => {
    deck.push(cardId);
    deck.push(cardId);
  });
  
  // 添加少量T2卡牌（随机选择4种，每种1张）
  const selectedT2 = shuffledT2.slice(0, 4);
  selectedT2.forEach(cardId => {
    deck.push(cardId);
  });
  
  // 添加通用卡牌（随机选择4种，每种2张）
  const selectedNeutral = shuffledNeutral.slice(0, 4);
  selectedNeutral.forEach(cardId => {
    deck.push(cardId);
    deck.push(cardId);
  });

  // 最终洗牌
  return shuffleDeck(deck);
}

/**
 * 洗牌函数
 */
function shuffleDeck(deck: CardId[]): CardId[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 创建新游戏
 */
export function createGame(
  gameId: string,
  playerConfigs: Array<{
    id: string;
    name: string;
    faction: Faction;
    characterId: CharacterId;
    isAI?: boolean;
    aiDifficulty?: 'easy' | 'medium' | 'hard';
  }>
): GameState {
  const now = Date.now();

  // 创建玩家
  const players: Player[] = playerConfigs.map((config) => {
    const deck = createInitialDeck(config.faction);
    
    // 初始抽牌4张（R4.3 初始手牌规则）
    const initialHandSize = HAND_LIMITS.INITIAL;
    const hand = deck.slice(0, initialHandSize);
    const remainingDeck = deck.slice(initialHandSize);

    // 计算初始行动点（第1轮次，使用早期游戏配置）
    const initialActionPoints = getActionPointsByRound(1);

    // 2v2模式阵营特定等级初始化
    // 进攻方：渗透等级=0（共享），安全等级=0（不共享）
    // 防守方：渗透等级=0（不共享），安全等级=1（共享，初始值为1避免第7轮次立即判定失败）
    const initialInfiltrationLevel = config.faction === 'attacker' ? 0 : 0;
    const initialSafetyLevel = config.faction === 'defender' ? 1 : 0;

    return {
      id: config.id,
      name: config.name,
      faction: config.faction,
      characterId: config.characterId,
      isAI: config.isAI ?? false,
      aiDifficulty: config.aiDifficulty,
      team: config.faction === 'attacker' ? 'A' : 'B', // 根据阵营分配队伍：进攻方=A，防守方=B
      resources: {
        compute: 3,  // R2.4: 算力初始值3
        funds: 5,    // R2.4: 资金初始值5
        information: 2,  // R2.4: 信息初始值2
        permission: 0    // R2.4: 权限初始值0
      },
      hand: hand,
      deck: remainingDeck,
      discard: [],
      techLevel: 'T0' as const,
      infiltrationLevel: initialInfiltrationLevel,
      safetyLevel: initialSafetyLevel,
      individualModifiers: TeamLevelManager.initializeIndividualModifiers(),
      remainingActions: initialActionPoints,
      maxActions: initialActionPoints,
      controlledAreas: [],
      isAlive: true
    };
  });

  return {
    id: gameId,
    players,
    currentPlayerIndex: 0,
    currentPhase: 'judgment' as TurnPhase,
    round: 1,
    maxRounds: 24,
    turn: 1,
    areas: createInitialAreas(),
    isActive: true,
    winner: null,
    victoryType: null,
    effectStack: [],
    pendingEffects: [],
    log: [],
    teamSharedLevels: TeamLevelManager.initializeTeamSharedLevels(),
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 推进到下一阶段
 * 
 * 回合与轮次逻辑：
 * - 回合：单个玩家的7个阶段（判定→恢复→摸牌→行动→响应→弃牌→结束）
 * - 轮次：所有玩家各完成一个回合
 * - 当从结束阶段进入判定阶段时，表示当前玩家回合结束，切换到下一个玩家
 * - 当回到第一个玩家时，表示一轮次完成，轮次数+1
 */
export function advancePhase(gameState: GameState): GameState {
  const currentPhaseIndex = TURN_PHASES.indexOf(gameState.currentPhase);
  const nextPhaseIndex = (currentPhaseIndex + 1) % TURN_PHASES.length;
  const nextPhase = TURN_PHASES[nextPhaseIndex];

  let newState = { ...gameState };

  // 如果从结束阶段进入判定阶段，表示当前玩家回合结束
  if (gameState.currentPhase === 'end' && nextPhase === 'judgment') {
    const previousPlayer = newState.players[newState.currentPlayerIndex];
    
    // 记录回合结束日志
    console.log(`[Turn] ${previousPlayer.name}的回合结束`);
    newState.log = [...newState.log, {
      id: `log-${Date.now()}-turn-end`,
      timestamp: Date.now(),
      turn: newState.turn,
      round: newState.round,
      phase: 'end',
      playerId: previousPlayer.id,
      action: 'turn_end',
      message: `[Turn] ${previousPlayer.name}的回合结束`,
      details: {}
    }];
    
    // 切换到下一个玩家
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    newState.currentPlayerIndex = nextPlayerIndex;
    
    // 增加回合计数
    newState.turn += 1;
    
    // 如果回到第一个玩家，表示一轮次完成
    if (nextPlayerIndex === 0) {
      newState.round += 1;
      console.log(`[Round] 第${newState.round}轮次开始`);
      
      // 轮次开始时的处理（资源恢复、区域加成等）
      newState = processRoundStart(newState);
    }

    // 玩家回合开始时的处理
    newState = processTurnStart(newState, nextPlayerIndex);
  }

  // 进入摸牌阶段时执行抽牌（R4.3 抽牌数：每回合4张）
  if (nextPhase === 'draw') {
    const currentPlayerIndex = newState.currentPlayerIndex;
    const currentRound = newState.round;
    
    // 根据轮次数获取手牌上限（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
    const handLimit = getHandLimitByRound(currentRound);
    
    // 记录实际抽牌数量
    let totalDrawn = 0;
    
    newState.players = newState.players.map((player, index) => {
      if (index !== currentPlayerIndex) return player;
      
      // 计算手牌上限（考虑修正值）
      const handLimitWithOffset = getHandLimitByRound(
        currentRound,
        player.individualModifiers.handLimitOffset,
        player.individualModifiers.handLimitTempOffset
      );
      
      // 计算摸牌数（考虑修正值）
      const drawCountWithOffset = getDrawCountByRound(
        currentRound,
        player.individualModifiers.drawCountOffset,
        player.individualModifiers.drawCountTempOffset
      );
      
      const currentHandSize = player.hand.length;
      const actualDrawCount = Math.min(drawCountWithOffset, handLimitWithOffset - currentHandSize);
      
      if (actualDrawCount <= 0) return player;
      
      totalDrawn = actualDrawCount;
      
      // 从牌库抽牌
      const newCards: string[] = player.deck.slice(0, actualDrawCount);
      const remainingDeck = player.deck.slice(actualDrawCount);
      
      // 如果牌库不足，洗牌堆重新组成牌库
      if (newCards.length < actualDrawCount && player.discard.length > 0) {
        const shuffledDiscard = shuffleArray([...player.discard]);
        const additionalCards = shuffledDiscard.slice(0, actualDrawCount - newCards.length);
        newCards.push(...additionalCards);
        const newDiscard = shuffledDiscard.slice(actualDrawCount - newCards.length);
        
        return {
          ...player,
          hand: [...player.hand, ...newCards],
          deck: [...remainingDeck, ...shuffledDiscard.slice(actualDrawCount - newCards.length)],
          discard: newDiscard
        };
      }
      
      return {
        ...player,
        hand: [...player.hand, ...newCards],
        deck: remainingDeck
      };
    });
    
    // 添加抽牌日志
    const currentPlayer = newState.players[currentPlayerIndex];
    const finalHandLimit = getHandLimitByRound(
      currentRound,
      currentPlayer.individualModifiers.handLimitOffset,
      currentPlayer.individualModifiers.handLimitTempOffset
    );
    const finalDrawCount = getDrawCountByRound(
      currentRound,
      currentPlayer.individualModifiers.drawCountOffset,
      currentPlayer.individualModifiers.drawCountTempOffset
    );
    
    // 构建修正值信息
    const handLimitMods = [];
    if (currentPlayer.individualModifiers.handLimitOffset !== 0) {
      handLimitMods.push(`永久${currentPlayer.individualModifiers.handLimitOffset > 0 ? '+' : ''}${currentPlayer.individualModifiers.handLimitOffset}`);
    }
    if (currentPlayer.individualModifiers.handLimitTempOffset !== 0) {
      handLimitMods.push(`临时${currentPlayer.individualModifiers.handLimitTempOffset > 0 ? '+' : ''}${currentPlayer.individualModifiers.handLimitTempOffset}`);
    }
    
    const drawCountMods = [];
    if (currentPlayer.individualModifiers.drawCountOffset !== 0) {
      drawCountMods.push(`永久${currentPlayer.individualModifiers.drawCountOffset > 0 ? '+' : ''}${currentPlayer.individualModifiers.drawCountOffset}`);
    }
    if (currentPlayer.individualModifiers.drawCountTempOffset !== 0) {
      drawCountMods.push(`临时${currentPlayer.individualModifiers.drawCountTempOffset > 0 ? '+' : ''}${currentPlayer.individualModifiers.drawCountTempOffset}`);
    }
    
    const handLimitInfo = handLimitMods.length > 0 ? `(${handLimitMods.join(', ')})` : '';
    const drawCountInfo = drawCountMods.length > 0 ? `(${drawCountMods.join(', ')})` : '';
    
    newState.log = [...newState.log, {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      turn: newState.turn,
      round: newState.round,
      phase: 'draw',
      playerId: currentPlayer.id,
      action: 'draw_cards',
      message: `[${currentPlayer.name}] 摸牌阶段（第${currentRound}轮）：抽了${totalDrawn}张牌，手牌上限${finalHandLimit}张${handLimitInfo}，应抽${finalDrawCount}张${drawCountInfo}`,
      details: {
        count: totalDrawn,
        handLimit: finalHandLimit,
        drawCount: finalDrawCount,
        round: currentRound,
        handLimitOffset: currentPlayer.individualModifiers.handLimitOffset,
        handLimitTempOffset: currentPlayer.individualModifiers.handLimitTempOffset,
        drawCountOffset: currentPlayer.individualModifiers.drawCountOffset,
        drawCountTempOffset: currentPlayer.individualModifiers.drawCountTempOffset
      }
    }];
  }

  newState.currentPhase = nextPhase;
  newState.updatedAt = Date.now();

  return newState;
}

/**
 * 轮次开始时的处理
 * - 资源恢复（每轮次恢复）
 * - 区域控制加成（每轮次结算）
 * - 重置连击状态（每轮次重置）
 * - 重置个体修正值（每轮次重置）
 */
function processRoundStart(gameState: GameState): GameState {
  let newState = { ...gameState };
  const currentRound = newState.round;
  
  console.log(`[Round] 第${currentRound}轮次开始处理`);
  
  // 重置所有玩家的连击状态和个体修正值（每轮次重置）
  newState.players.forEach(p => {
    ComboStateManager.resetTurn(p.id);
    const resetResult = TeamLevelManager.resetIndividualModifiers(newState, p.id);
    newState = resetResult.newGameState;
  });
  
  // 计算区域控制加成（R3.1）
  const attackerBonus = calculateTotalAreaBonus('attacker', newState.areas);
  const defenderBonus = calculateTotalAreaBonus('defender', newState.areas);
  
  // 应用区域渗透/安全加成（R3.1）并更新科技树等级（R5.1）
  newState.players = newState.players.map(p => {
    let updatedPlayer = { ...p };
    
    // 应用区域加成
    if (p.faction === 'attacker') {
      updatedPlayer.infiltrationLevel = Math.min(75, p.infiltrationLevel + attackerBonus.infiltrationBonus);
    } else {
      updatedPlayer.safetyLevel = Math.min(75, p.safetyLevel + defenderBonus.safetyBonus);
    }
    
    // 更新科技树等级（R5.1）
    const relevantLevel = p.faction === 'attacker' ? updatedPlayer.infiltrationLevel : updatedPlayer.safetyLevel;
    const newTechLevel = calculateTechLevel(relevantLevel);
    const oldTechLevel = parseInt(p.techLevel.replace('T', ''));
    
    if (newTechLevel !== oldTechLevel) {
      updatedPlayer.techLevel = `T${newTechLevel}` as `T${0 | 1 | 2 | 3 | 4 | 5}`;
      
      // 添加科技升级日志
      newState.log = [...newState.log, {
        id: `log-${Date.now()}-tech-${p.id}`,
        timestamp: Date.now(),
        turn: newState.turn,
        round: newState.round,
        phase: 'judgment',
        playerId: p.id,
        action: 'tech_level_up',
        message: `[${p.name}] 科技树升级！${getTechLevelName(oldTechLevel as 0 | 1 | 2 | 3 | 4 | 5)} → ${getTechLevelName(newTechLevel)}`,
        details: {
          oldLevel: oldTechLevel,
          newLevel: newTechLevel,
          level: relevantLevel
        }
      }];
    }
    
    return updatedPlayer;
  });
  
  // 添加轮次开始日志
  newState.log = [...newState.log, {
    id: `log-${Date.now()}-round-start`,
    timestamp: Date.now(),
    turn: newState.turn,
    round: currentRound,
    phase: 'judgment',
    playerId: '',
    action: 'round_start',
    message: `[Round] 第${currentRound}轮次开始`,
    details: {
      round: currentRound
    }
  }];
  
  // 添加区域加成日志
  if (attackerBonus.infiltrationBonus > 0 || attackerBonus.actionPointBonus > 0) {
    newState.log = [...newState.log, {
      id: `log-${Date.now()}-atk`,
      timestamp: Date.now(),
      turn: newState.turn,
      round: newState.round,
      phase: 'judgment',
      action: 'area_bonus',
      message: `[进攻方] 区域控制加成：渗透+${attackerBonus.infiltrationBonus}，行动点+${attackerBonus.actionPointBonus}`,
      details: {
        faction: 'attacker',
        infiltrationBonus: attackerBonus.infiltrationBonus,
        actionPointBonus: attackerBonus.actionPointBonus
      }
    }];
  }
  
  if (defenderBonus.safetyBonus > 0 || defenderBonus.actionPointBonus > 0) {
    newState.log = [...newState.log, {
      id: `log-${Date.now()}-def`,
      timestamp: Date.now(),
      turn: newState.turn,
      round: newState.round,
      phase: 'judgment',
      action: 'area_bonus',
      message: `[防御方] 区域控制加成：安全+${defenderBonus.safetyBonus}，行动点+${defenderBonus.actionPointBonus}`,
      details: {
        faction: 'defender',
        safetyBonus: defenderBonus.safetyBonus,
        actionPointBonus: defenderBonus.actionPointBonus
      }
    }];
  }
  
  return newState;
}

/**
 * 玩家回合开始时的处理
 * - 重置行动点
 * - 应用区域行动点加成
 * - 记录回合开始日志
 */
function processTurnStart(gameState: GameState, playerIndex: number): GameState {
  let newState = { ...gameState };
  const currentPlayer = newState.players[playerIndex];
  const currentRound = newState.round;
  
  // 根据轮次数计算行动点上限（R2.3）
  const baseActionPoints = getActionPointsByRound(currentRound);
  
  // 计算区域控制加成（R3.1）
  const attackerBonus = calculateTotalAreaBonus('attacker', newState.areas);
  const defenderBonus = calculateTotalAreaBonus('defender', newState.areas);
  
  // 重置行动点并更新上限（包含区域加成）
  const areaBonus = currentPlayer.faction === 'attacker' 
    ? attackerBonus.actionPointBonus 
    : defenderBonus.actionPointBonus;
  const totalActionPoints = baseActionPoints + areaBonus;
  
  newState.players = newState.players.map((p, index) => {
    if (index === playerIndex) {
      return {
        ...p,
        remainingActions: totalActionPoints,
        maxActions: totalActionPoints
      };
    }
    return p;
  });
  
  console.log(`[Turn] ${currentPlayer.name}的回合开始（第${currentRound}轮次）`);
  
  // 添加回合开始日志
  newState.log = [...newState.log, {
    id: `log-${Date.now()}-turn-start`,
    timestamp: Date.now(),
    turn: newState.turn,
    round: currentRound,
    phase: 'judgment',
    playerId: currentPlayer.id,
    action: 'turn_start',
    message: `[Turn] ${currentPlayer.name}的回合开始（第${currentRound}轮次，第${newState.turn}回合）`,
    details: {
      actionPoints: totalActionPoints,
      baseActionPoints: baseActionPoints,
      areaBonus: areaBonus
    }
  }];
  
  return newState;
}

/**
 * 洗牌函数
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 获取当前玩家
 */
export function getCurrentPlayer(gameState: GameState): Player | undefined {
  return gameState.players[gameState.currentPlayerIndex];
}

// ==================== 单例导出 ====================

export const gameStateManager = new GameStateManager();

export default GameStateManager;
