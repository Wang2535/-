/**
 * AI玩家系统 - 简化版
 * 
 * 功能：
 * 1. AI决策逻辑
 * 2. 难度区分（简单/中等/困难）
 * 3. 行动执行
 */

import type { Player, GameState } from '@/types/gameRules';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { AI_CONFIG } from '@/types/gameConstants';

// 难度配置
const difficultyConfigs = {
  easy: { 
    delay: AI_CONFIG.EASY_DELAY, 
    randomFactor: AI_CONFIG.EASY_RANDOM_FACTOR 
  },
  medium: { 
    delay: AI_CONFIG.MEDIUM_DELAY, 
    randomFactor: AI_CONFIG.MEDIUM_RANDOM_FACTOR 
  },
  hard: { 
    delay: AI_CONFIG.HARD_DELAY, 
    randomFactor: AI_CONFIG.HARD_RANDOM_FACTOR 
  }
};

/**
 * AI决策结果
 */
export interface AIDecision {
  action: 'play_card' | 'skip' | 'end_turn';
  cardIndex?: number;
  targetId?: string;
  reason: string;
}

/**
 * AI玩家类
 */
export class AIPlayer {
  private playerId: string;
  private difficulty: 'easy' | 'medium' | 'hard';

  constructor(playerId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.playerId = playerId;
    this.difficulty = difficulty;
  }

  /**
   * 执行AI回合
   * 
   * 注意：player参数是初始状态，每次出牌后需要通过回调获取最新状态
   */
  async executeTurn(
    initialPlayer: Player,
    gameState: GameState,
    onPlayCard: (cardIndex: number, targetId?: string) => boolean,
    onEndTurn: () => void
  ): Promise<void> {
    try {
      const config = difficultyConfigs[this.difficulty];

      // 验证玩家数据
      if (!initialPlayer) {
        console.error('[AIPlayer] 玩家数据不存在');
        onEndTurn();
        return;
      }

      // 验证手牌数据
      if (!Array.isArray(initialPlayer.hand)) {
        console.error('[AIPlayer] 手牌数据格式错误');
        onEndTurn();
        return;
      }

      // 模拟思考延迟
      await this.delay(config.delay);

      // 简单AI逻辑：随机选择可执行的卡牌
      let actionsTaken = 0;
      const maxActions = initialPlayer.remainingActions ?? 0;
      let attempts = 0;
      const maxAttempts = AI_CONFIG.MAX_ATTEMPTS; // 防止无限循环

      // 使用闭包获取当前玩家状态
      const getCurrentPlayer = () => {
        return gameState.players.find(p => p.id === this.playerId);
      };

      while (actionsTaken < maxActions && attempts < maxAttempts) {
        attempts++;
        
        try {
          // 每次循环重新获取当前玩家状态（因为出牌后手牌会变化）
          const currentPlayer = getCurrentPlayer();
          if (!currentPlayer || currentPlayer.hand.length === 0) {
            console.log('[AIPlayer] 手牌为空或玩家不存在，结束行动');
            break;
          }
          
          // 随机选择一张手牌
          const cardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
          const cardId = currentPlayer.hand[cardIndex];
          
          if (!cardId) {
            console.warn(`[AIPlayer] 手牌索引${cardIndex}无效，当前手牌数:${currentPlayer.hand.length}`);
            continue;
          }

          const card = CARD_DATABASE[cardId];

          if (!card) {
            console.warn(`[AIPlayer] 卡牌 ${cardId} 不存在于数据库`);
            continue;
          }

          // 检查是否有足够资源（简化检查）
          const hasResources = this.checkResources(currentPlayer, {});

          if (hasResources) {
            console.log(`[AIPlayer] 尝试使用卡牌: ${card.name} (索引:${cardIndex})`);
            // 尝试使用卡牌
            const success = onPlayCard(cardIndex);
            if (success) {
              actionsTaken++;
              console.log(`[AIPlayer] 成功使用卡牌，已行动次数:${actionsTaken}/${maxActions}`);
              await this.delay(config.delay / 2);
            } else {
              console.log(`[AIPlayer] 出牌失败，可能是索引错误或资源不足`);
              break;
            }
          } else {
            console.log('[AIPlayer] 资源不足，结束行动');
            break;
          }
        } catch (cardError) {
          console.error('[AIPlayer] 处理单张卡牌时出错:', cardError);
          continue;
        }
      }

      if (attempts >= maxAttempts) {
        console.warn('[AIPlayer] 达到最大尝试次数，强制结束回合');
      }

      // 结束回合
      console.log('[AIPlayer] AI回合结束');
      onEndTurn();
    } catch (error) {
      console.error('[AIPlayer] 执行AI回合时发生错误:', error);
      // 安全回退：结束回合
      try {
        onEndTurn();
      } catch (endTurnError) {
        console.error('[AIPlayer] 结束回合也失败了:', endTurnError);
      }
    }
  }

  /**
   * 检查资源是否足够（简化版，总是返回true）
   */
  private checkResources(
    _player: Player,
    _cost: { compute?: number; funds?: number; information?: number }
  ): boolean {
    // 简化版本：假设AI总有足够资源
    return true;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取玩家ID
   */
  getPlayerId(): string {
    return this.playerId;
  }

  /**
   * 获取难度
   */
  getDifficulty(): 'easy' | 'medium' | 'hard' {
    return this.difficulty;
  }
}

export default AIPlayer;
