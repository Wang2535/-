// 移动系统 React Hook 封装

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MovementEngine,
  DiceSystem,
  findReachableCells,
} from '../engine/MovementEngine';
import type {
  MoveOption,
  DiceRollResult,
  MovementResult,
  MovementEventType,
  MovementEventHandler,
  TowerLayerData,
  Coordinate2D,
} from '../types';
import { ZoneEffectManager } from '../engine/ZoneEffectManager';
import { CellStateMachine } from '../engine/CellStateMachine';

// Hook 返回接口
interface MovementHookReturn {
  diceResult: DiceRollResult | null;
  moveOptions: MoveOption[];
  isMoving: boolean;
  currentPos: Coordinate2D;
  rollDice: () => DiceRollResult;
  moveTo: (targetCellId: string) => Promise<MovementResult>;
  canMove: boolean;
  moveHistory: ReadonlyArray<{
    id: string;
    from: Coordinate2D;
    to: Coordinate2D;
    distance: number;
    timestamp: number;
    zonesTriggered: string[];
  }>;
  cancelMove: () => boolean;
  resetTurn: () => void;
}

/**
 * 移动系统 React Hook
 * 提供塔内移动的完整状态管理和操作接口
 */
export function useMovement(
  layerData: TowerLayerData | null,
  zoneManager: ZoneEffectManager | null,
  cellStateMachine: CellStateMachine | null
): MovementHookReturn {
  // 引擎实例（惰性初始化）
  const engineRef = useRef<MovementEngine | null>(null);

  // 状态管理
  const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);
  const [moveOptions, setMoveOptions] = useState<MoveOption[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [currentPos, setCurrentPos] = useState<Coordinate2D>([0, 0]);
  const [moveHistory, setMoveHistory] = useState<
    ReadonlyArray<{
      id: string;
      from: Coordinate2D;
      to: Coordinate2D;
      distance: number;
      timestamp: number;
      zonesTriggered: string[];
    }>
  >([]);

  // 初始化引擎
  useEffect(() => {
    if (zoneManager && !engineRef.current) {
      engineRef.current = new MovementEngine(zoneManager);
    }
  }, [zoneManager]);

  // 监听层数据变化并加载
  useEffect(() => {
    if (layerData && engineRef.current) {
      engineRef.current.loadLayerData(layerData);
      if (layerData.startCellId) {
        engineRef.current.setStartPosition(layerData.startCellId);
        const startPos = layerData.cellIndex[layerData.startCellId]?.coordinate ?? [0, 0];
        setCurrentPos(startPos);
      }

      // 注册事件监听器
      const handleMoveStarted: MovementEventHandler = () => {
        setIsMoving(true);
      };
      const handleMoveCompleted: MovementEventHandler = () => {
        setIsMoving(false);
        if (engineRef.current) {
          setMoveHistory(
            engineRef.current.getMoveHistory().map(record => ({
              id: record.id,
              from: record.from,
              to: record.to,
              distance: record.distance,
              timestamp: record.timestamp,
              zonesTriggered: record.zonesTriggered,
            }))
          );
        }
      };
      const handleMoveCancelled: MovementEventHandler = () => {
        setIsMoving(false);
      };
      const handlePositionChanged: MovementEventHandler = (data) => {
        if (data && typeof data === 'object' && 'position' in data) {
          setCurrentPos((data as { position: Coordinate2D }).position);
        }
      };

      engineRef.current.on('move_started', handleMoveStarted);
      engineRef.current.on('move_completed', handleMoveCompleted);
      engineRef.current.on('move_cancelled', handleMoveCancelled);
      engineRef.current.on('position_changed', handlePositionChanged);

      return () => {
        if (engineRef.current) {
          engineRef.current.off('move_started', handleMoveStarted);
          engineRef.current.off('move_completed', handleMoveCompleted);
          engineRef.current.off('move_cancelled', handleMoveCancelled);
          engineRef.current.off('position_changed', handlePositionChanged);
        }
      };
    }
  }, [layerData]);

  /**
   * 投掷骰子
   */
  const rollDice = useCallback((): DiceRollResult => {
    if (!engineRef.current || !layerData) {
      throw new Error('移动引擎未就绪');
    }

    const result = engineRef.current.rollDice();
    setDiceResult(result);

    // 获取区域修改量并应用
    const options = engineRef.current.getMoveOptions(result.modifiedValue);
    setMoveOptions(options);

    return result;
  }, [layerData]);

  /**
   * 执行移动到目标格子
   */
  const moveTo = useCallback(async (targetCellId: string): Promise<MovementResult> => {
    if (!engineRef.current) {
      throw new Error('移动引擎未就绪');
    }

    const result = await engineRef.current.executeMove(targetCellId);
    return result;
  }, []);

  /**
   * 取消当前移动
   */
  const cancelMove = useCallback((): boolean => {
    if (!engineRef.current) {
      return false;
    }
    return engineRef.current.cancelMove();
  }, []);

  /**
   * 重置回合状态
   */
  const resetTurn = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetForNewTurn();
      setDiceResult(null);
      setMoveOptions([]);
    }
  }, []);

  /**
   * 检查是否可以移动
   */
  const canMoveCheck = useCallback((): boolean => {
    if (!engineRef.current) {
      return false;
    }
    return engineRef.current.canMove();
  }, []);

  return {
    diceResult,
    moveOptions,
    isMoving,
    currentPos,
    rollDice,
    moveTo,
    canMove: canMoveCheck(),
    moveHistory,
    cancelMove,
    resetTurn,
  };
}
