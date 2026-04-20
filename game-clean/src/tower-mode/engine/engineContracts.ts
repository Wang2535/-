/**
 * 引擎间调用契�? * 定义引擎模块之间交互时的接口约束，实现松耦合
 */

import type {
  Coordinate2D,
  TowerLayerData,
  CellState,
} from '../types';

// �?ZoneEffectManager 导入内部类型
import type {
  ZoneApplicationResult,
  ZoneEffectContext,
} from './ZoneEffectManager';

// ====== 以下�?contracts 层定义的最小接�?======
// 用于替代 types 中缺失的 StateTransitionResult �?CellTriggerContext

/** 状态转换结果（最小契约接口） */
export interface StateTransitionResult {
  success: boolean;
  cellId: string;
  previousState: CellState;
  newState: CellState;
  reason: string;
  sideEffects: SideEffect[];
  errorMessage?: string;
}

/** 状态转换副作用 */
export interface SideEffect {
  type: 'zone_trigger' | 'resource_change' | 'event_emit' | 'state_cascade';
  data?: Record<string, unknown>;
}

/** 格子触发上下文（最小契约接口） */
export interface CellTriggerContext {
  playerId: string;
  triggerType: 'enter' | 'exit' | 'battle_complete';
  turnNumber: number;
  diceValue?: number;
}

// ====== 契约接口定义 ======

/**
 * MovementEngine �?ZoneEffectManager 的交互契�? * MovementEngine 通过此接口调用区域效果管理器的功�? */
export interface IMovementZoneContract {
  /**
   * 获取指定位置的区域效果对骰子的修改量
   */
  getDiceModifier(position: Coordinate2D, layerData: TowerLayerData): number;

  /**
   * 应用玩家进入某位置时触发的所有区域效�?   */
  applyEffectsOnEnter(
    position: Coordinate2D,
    layerData: TowerLayerData,
    turnNumber: number,
    context?: Partial<ZoneEffectContext>
  ): ZoneApplicationResult;
}

/**
 * MovementEngine �?CellStateMachine 的交互契�? * MovementEngine 通过此接口触发格子状态转�? */
export interface IMovementCellContract {
  /**
   * 处理玩家进入格子（unlocked �?current �?visited�?   */
  handlePlayerEnter(cellId: string, context: CellTriggerContext): StateTransitionResult[];

  /**
   * 处理玩家离开格子（current �?visited�?   */
  handlePlayerExit(cellId: string): StateTransitionResult;

  /**
   * 获取格子当前状�?   */
  getState(cellId: string): CellState;
}
