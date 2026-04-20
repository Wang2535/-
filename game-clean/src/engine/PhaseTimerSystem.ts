/**
 * 阶段时间限制系统 (R4.2)
 * 实现各阶段的时间限制和计时功能
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import type { TurnPhase } from '@/types/gameRules';
import { PHASE_TIMES } from '@/types/gameConstants';

/** 阶段时间配置 (R4.2) */
export interface PhaseTimeConfig {
  /** 阶段名称 */
  phase: TurnPhase;
  /** 基础时间（秒） */
  baseTime: number;
  /** 每行动额外时间（秒） */
  extraTimePerAction: number;
  /** 描述 */
  description: string;
}

/** 各阶段时间配置 */
export const PHASE_TIME_CONFIGS: Record<TurnPhase, PhaseTimeConfig> = {
  judgment: {
    phase: 'judgment',
    baseTime: 0,
    extraTimePerAction: 0,
    description: '判定阶段：自动执行，无时间限制'
  },
  recovery: {
    phase: 'recovery',
    baseTime: 0,
    extraTimePerAction: 0,
    description: '恢复阶段：自动执行，无时间限制'
  },
  draw: {
    phase: 'draw',
    baseTime: 0,
    extraTimePerAction: 0,
    description: '摸牌阶段：自动执行，无时间限制'
  },
  action: {
    phase: 'action',
    baseTime: PHASE_TIMES.ACTION_BASE,
    extraTimePerAction: PHASE_TIMES.ACTION_EXTRA_PER_CARD,
    description: `行动阶段：${PHASE_TIMES.ACTION_BASE}秒基础时间 + 每出一张牌${PHASE_TIMES.ACTION_EXTRA_PER_CARD}秒`
  },
  response: {
    phase: 'response',
    baseTime: PHASE_TIMES.RESPONSE,
    extraTimePerAction: 0,
    description: `响应阶段：${PHASE_TIMES.RESPONSE}秒响应时间`
  },
  discard: {
    phase: 'discard',
    baseTime: PHASE_TIMES.DISCARD,
    extraTimePerAction: 0,
    description: `弃牌阶段：${PHASE_TIMES.DISCARD}秒弃牌时间`
  },
  end: {
    phase: 'end',
    baseTime: 0,
    extraTimePerAction: 0,
    description: '结束阶段：自动执行，无时间限制'
  }
};

/** 计时器状态 */
export interface PhaseTimerState {
  /** 当前阶段 */
  currentPhase: TurnPhase;
  /** 剩余时间（秒） */
  remainingTime: number;
  /** 总时间（秒） */
  totalTime: number;
  /** 已出牌数（用于行动阶段计算） */
  cardsPlayed: number;
  /** 是否正在计时 */
  isRunning: boolean;
  /** 是否已超时 */
  isTimeout: boolean;
  /** 计时器ID */
  timerId: number | null;
}

/** 计时器回调函数 */
export type TimerCallback = (state: PhaseTimerState) => void;

/**
 * 计算阶段总时间
 * @param phase 阶段类型
 * @param cardsPlayed 已出牌数（仅行动阶段有效）
 * @returns 总时间（秒）
 */
export function calculatePhaseTime(phase: TurnPhase, cardsPlayed: number = 0): number {
  const config = PHASE_TIME_CONFIGS[phase];
  
  if (phase === 'action') {
    // 行动阶段：45秒 + 每出一张牌10秒
    return config.baseTime + (cardsPlayed * config.extraTimePerAction);
  }
  
  return config.baseTime;
}

/**
 * 创建初始计时器状态
 * @param phase 当前阶段
 * @returns 计时器状态
 */
export function createTimerState(phase: TurnPhase): PhaseTimerState {
  const totalTime = calculatePhaseTime(phase);
  
  return {
    currentPhase: phase,
    remainingTime: totalTime,
    totalTime,
    cardsPlayed: 0,
    isRunning: false,
    isTimeout: false,
    timerId: null
  };
}

/**
 * 阶段计时器类
 */
export class PhaseTimer {
  private state: PhaseTimerState;
  private onTick: TimerCallback | null = null;
  private onTimeout: (() => void) | null = null;
  private intervalId: number | null = null;

  constructor(phase: TurnPhase) {
    this.state = createTimerState(phase);
  }

  /**
   * 设置 tick 回调
   */
  setOnTick(callback: TimerCallback): void {
    this.onTick = callback;
  }

  /**
   * 设置超时回调
   */
  setOnTimeout(callback: () => void): void {
    this.onTimeout = callback;
  }

  /**
   * 开始计时
   */
  start(): void {
    if (this.state.isRunning || this.state.totalTime === 0) return;

    this.state.isRunning = true;
    this.state.isTimeout = false;

    // 使用 setInterval 每秒更新
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * 暂停计时
   */
  pause(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 恢复计时
   */
  resume(): void {
    if (this.state.isRunning || this.state.isTimeout) return;
    this.start();
  }

  /**
   * 停止计时
   */
  stop(): void {
    this.pause();
    this.state.remainingTime = this.state.totalTime;
    this.state.cardsPlayed = 0;
  }

  /**
   * 增加时间（用于行动阶段出牌后增加10秒）
   */
  addTime(seconds: number): void {
    if (this.state.isTimeout) return;
    
    this.state.cardsPlayed += 1;
    this.state.totalTime += seconds;
    this.state.remainingTime += seconds;
    
    console.log(`[PhaseTimer] Added ${seconds} seconds, remaining: ${this.state.remainingTime}`);
  }

  /**
   * 重置计时器（用于阶段切换）
   */
  reset(cardsPlayed: number): void {
    this.pause();
    this.state.cardsPlayed = cardsPlayed;
    this.state.totalTime = calculatePhaseTime(this.state.currentPhase, cardsPlayed);
    this.state.remainingTime = this.state.totalTime;
    this.state.isTimeout = false;
    
    // 如果有剩余时间，自动重新开始
    if (this.state.totalTime > 0) {
      this.start();
    }
  }

  /**
   * 切换阶段
   */
  switchPhase(newPhase: TurnPhase): void {
    this.stop();
    this.state.currentPhase = newPhase;
    this.state.totalTime = calculatePhaseTime(newPhase);
    this.state.remainingTime = this.state.totalTime;
    this.state.cardsPlayed = 0;
    this.state.isTimeout = false;
  }

  /**
   * 获取当前状态
   */
  getState(): PhaseTimerState {
    return { ...this.state };
  }

  /**
   * 获取剩余时间（格式化）
   */
  getFormattedTime(): string {
    const minutes = Math.floor(this.state.remainingTime / 60);
    const seconds = this.state.remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 获取进度百分比
   */
  getProgressPercent(): number {
    if (this.state.totalTime === 0) return 100;
    return (this.state.remainingTime / this.state.totalTime) * 100;
  }

  /**
   * 是否即将超时（剩余时间少于警告阈值）
   */
  isAboutToTimeout(): boolean {
    return this.state.remainingTime <= PHASE_TIMES.TIMEOUT_WARNING_THRESHOLD && 
           this.state.remainingTime > 0;
  }

  /**
   * tick 处理
   */
  private tick(): void {
    if (!this.state.isRunning) return;

    this.state.remainingTime--;

    // 触发 tick 回调
    if (this.onTick) {
      this.onTick({ ...this.state });
    }

    // 检查是否超时
    if (this.state.remainingTime <= 0) {
      this.handleTimeout();
    }
  }

  /**
   * 超时处理
   */
  private handleTimeout(): void {
    this.pause();
    this.state.isTimeout = true;
    this.state.remainingTime = 0;

    if (this.onTimeout) {
      this.onTimeout();
    }
  }
}

/**
 * 获取阶段时间描述
 * @param phase 阶段类型
 * @returns 时间描述
 */
export function getPhaseTimeDescription(phase: TurnPhase): string {
  const config = PHASE_TIME_CONFIGS[phase];
  
  if (config.baseTime === 0) {
    return '自动执行';
  }
  
  if (phase === 'action') {
    return `${config.baseTime}秒 + 每牌${config.extraTimePerAction}秒`;
  }
  
  return `${config.baseTime}秒`;
}

/**
 * 检查阶段是否需要计时
 * @param phase 阶段类型
 * @returns 是否需要计时
 */
export function isTimedPhase(phase: TurnPhase): boolean {
  return PHASE_TIME_CONFIGS[phase].baseTime > 0;
}

/**
 * 游戏计时器管理器
 * 管理整个游戏的阶段计时
 */
export class GamePhaseTimerManager {
  private timer: PhaseTimer | null = null;
  private currentPhase: TurnPhase = 'judgment';

  /**
   * 初始化计时器
   */
  initTimer(phase: TurnPhase): PhaseTimer {
    this.currentPhase = phase;
    this.timer = new PhaseTimer(phase);
    return this.timer;
  }

  /**
   * 切换阶段
   */
  switchPhase(newPhase: TurnPhase): void {
    this.currentPhase = newPhase;
    if (this.timer) {
      this.timer.switchPhase(newPhase);
      
      // 如果是需要计时的阶段，自动开始
      if (isTimedPhase(newPhase)) {
        this.timer.start();
      }
    }
  }

  /**
   * 记录出牌（用于行动阶段增加时间）
   */
  recordCardPlay(cardsPlayed: number): void {
    if (this.timer && this.currentPhase === 'action') {
      this.timer.reset(cardsPlayed);
    }
  }

  /**
   * 获取当前计时器
   */
  getTimer(): PhaseTimer | null {
    return this.timer;
  }

  /**
   * 清理计时器
   */
  cleanup(): void {
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }
  }
}

// 单例导出
export const phaseTimerManager = new GamePhaseTimerManager();
