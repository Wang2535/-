/**
 * 《道高一丈：数字博弈》v11.0 - 剪刀石头布机制类型定义
 * 
 * 剪刀石头布机制是一个独立的对抗系统，不预设任何效果。
 * 卡牌通过定义三种结果（平局/赢/输）的具体效果来使用该机制。
 */

/**
 * 剪刀石头布选择
 */
export type RPSChoice = 'scissors' | 'rock' | 'paper';

/**
 * 剪刀石头布结果
 */
export type RPSOutcome = 'win' | 'lose' | 'draw';

/**
 * 剪刀石头布对决结果
 */
export interface RPSDuelResult {
  /** 结果类型 */
  outcome: RPSOutcome;
  /** 获胜方玩家ID（平局时为undefined） */
  winnerId?: string;
  /** 失败方玩家ID（平局时为undefined） */
  loserId?: string;
  /** 双方选择 */
  choices: Record<string, RPSChoice>;
}

/**
 * RPS效果定义
 */
export interface RPSEffect {
  /** 效果目标 */
  target: 'winner' | 'loser' | 'both' | 'initiator' | 'responder';
  /** 效果类型 */
  type: 'damage' | 'heal' | 'resource_gain' | 'resource_loss' | 'draw' | 'discard' | 'none';
  /** 效果数值 */
  value: number;
  /** 效果描述（用于UI显示） */
  description: string;
}

/**
 * 剪刀石头布效果定义
 * 卡牌通过定义此接口来使用RPS机制
 */
export interface RPSMechanicConfig {
  /** 选择时间限制（秒） */
  timeLimit: number;
  /** 平局效果 */
  drawEffect: RPSEffect;
  /** 赢方效果 */
  winEffect: RPSEffect;
  /** 输方效果 */
  loseEffect: RPSEffect;
  /** 是否允许延迟响应（看到对方选择后决定） */
  allowDelayedResponse?: boolean;
  /** 延迟时间（秒） */
  delaySeconds?: number;
}

/**
 * RPS对决请求
 */
export interface RPSDuelRequest {
  id: string;
  initiatorId: string;
  responderId: string;
  config: RPSMechanicConfig;
  source: string; // 来源卡牌/技能
  timestamp: number;
  status: 'pending' | 'completed' | 'timeout';
}

/**
 * RPS玩家选择
 */
export interface RPSPlayerChoice {
  duelId: string;
  playerId: string;
  choice: RPSChoice;
  timestamp: number;
}
