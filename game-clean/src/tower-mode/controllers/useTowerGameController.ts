import { useState, useEffect, useCallback, useRef } from 'react';
import { TypedEventBus } from '../EventBus';
import type { TowerEventType } from '../EventBus';
import { TowerGameEngine } from '../engine/TowerGameEngine';
import type { DiceResult } from '../types/gameMechanics.types';
import type { PathOption } from '../types/gameMechanics.types';

export interface UseTowerGameControllerReturn {
  // UI状态
  phase: string;
  diceResult: DiceResult | null;
  isRolling: boolean;
  techValue: number;
  gold: number;
  turnNumber: number;
  cellInfoData: any | null;
  bossDangerActive: boolean;

  // 操作方法
  rollDice: () => DiceResult | null;
  selectPath: (pathIndex: number) => boolean;
  enterCell: (cellId: string) => void;
  skipCell: (cellId: string) => void;
  closePanel: () => void;
  startNewGame: () => void;

  // 引用
  engineRef: React.RefObject<TowerGameEngine | null>;
  eventBus: TypedEventBus<TowerEventType>;
}

/**
 * useTowerGameController - TowerGameEngine与React UI之间的桥梁Hook
 *
 * 职责：
 * 1. 持久化引擎和事件总线实例
 * 2. 管理UI展示所需的状态
 * 3. 订阅引擎事件并更新React state
 * 4. 提供封装了状态守卫的操作方法
 */
export function useTowerGameController(): UseTowerGameControllerReturn {
  // ==================== 引擎初始化（持久化引用）====================
  const eventBusRef = useRef<TypedEventBus<TowerEventType>>(
    new TypedEventBus<TowerEventType>()
  );
  const engineRef = useRef<TowerGameEngine | null>(null);

  // 懒初始化引擎：仅在首次渲染时创建
  if (!engineRef.current) {
    engineRef.current = new TowerGameEngine(eventBusRef.current);
  }

  // ==================== UI状态 ====================
  const [phase, setPhase] = useState<string>('idle');
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [techValue, setTechValue] = useState<number>(100);
  const [gold, setGold] = useState<number>(0);
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [cellInfoData, setCellInfoData] = useState<any | null>(null);
  const [bossDangerActive, setBossDangerActive] = useState<boolean>(false);

  // ==================== 事件订阅 ====================
  useEffect(() => {
    const bus = eventBusRef.current;

    // phase:change → 更新阶段状态
    // 注意：TypedEventBus.on的回调参数是完整event对象（包含type字段）
    const unsubPhaseChange = bus.on('phase:change' as any, (event) => {
      // event是 { type: 'phase:change', ...data } 的形式
      // 对于phase:change事件，data就是phase字符串本身
      const phaseValue = (event as any).to ?? (event as any).phase ?? String(event);
      setPhase(phaseValue);
    });

    // dice:start → 开始掷骰子动画
    const unsubDiceStart = bus.on('dice:start' as any, () => {
      setIsRolling(true);
    });

    // dice:result → 掷骰子完成，更新结果
    const unsubDiceResult = bus.on('dice:result' as any, (event) => {
      setIsRolling(false);
      // event是完整的DiceResult对象（可能包含type字段包装）
      const result = (event as any).result ?? event as unknown as DiceResult;
      setDiceResult(result);
    });

    // resource:change → 资源变更更新
    const unsubResourceChange = bus.on('resource:change' as any, (event) => {
      const resourceEvent = event as { type?: string; resourceType?: string; type?: string; newValue: number };
      const type = resourceEvent.type ?? resourceEvent.resourceType;
      const newValue = resourceEvent.newValue;

      if (type === 'tech') {
        setTechValue(newValue);
      } else if (type === 'gold') {
        setGold(newValue);
      }
    });

    // turn:end → 回合结束，递增回合数
    const unsubTurnEnd = bus.on('turn:end' as any, () => {
      setTurnNumber(prev => prev + 1);
    });

    // cell:info:show → 显示格子信息面板
    const unsubCellInfoShow = bus.on('cell:info:show' as any, (event) => {
      setCellInfoData(event);
    });

    // battle:trigger → 战斗触发，显示Boss危险提示
    const unsubBattleTrigger = bus.on('battle:trigger' as any, () => {
      setBossDangerActive(true);
    });

    // Cleanup：移除所有事件监听器
    return () => {
      bus.removeAllListeners();
    };
  }, []); // 空依赖数组：仅在挂载/卸载时执行一次

  // ==================== 操作方法 ====================

  /**
   * 掷骰子
   * 仅在idle状态下可执行
   */
  const rollDice = useCallback((): DiceResult | null => {
    const engine = engineRef.current;
    if (!engine) return null;

    // 状态守卫：仅允许在idle阶段投骰
    if (phase !== 'idle') {
      return null;
    }

    const result = engine.rollDice();
    return result;
  }, [phase]);

  /**
   * 选择路径
   * 仅在dice_result状态下可执行
   */
  const selectPath = useCallback((pathIndex: number): boolean => {
    const engine = engineRef.current;
    if (!engine) return false;

    // 状态守卫：仅允许在dice_result阶段选择路径
    if (phase !== 'dice_result') {
      return false;
    }

    return engine.selectPath(pathIndex);
  }, [phase]);

  /**
   * 进入格子
   * 触发格子交互逻辑，之后清空cellInfoData
   */
  const enterCell = useCallback((cellId: string): void => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.enterCell(cellId);

    // 进入格子后清空信息面板数据（由UI决定是否重新显示）
    setCellInfoData(null);
  }, []);

  /**
   * 跳过格子
   * 触发跳过逻辑，之后清空cellInfoData
   */
  const skipCell = useCallback((cellId: string): void => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.skipCell(cellId);

    // 跳过后清空信息面板数据
    setCellInfoData(null);
  }, []);

  /**
   * 关闭信息面板
   * 仅清空UI状态，不触发引擎逻辑
   */
  const closePanel = useCallback((): void => {
    setCellInfoData(null);
  }, []);

  /**
   * 开始新游戏
   * 重置所有状态到初始值
   */
  const startNewGame = useCallback((): void => {
    const engine = engineRef.current;
    if (!engine) return;

    // 调用引擎的重置方法
    engine.startNewGame();

    // 重置所有UI状态到初始值
    setPhase('idle');
    setDiceResult(null);
    setIsRolling(false);
    setTechValue(100);
    setGold(0);
    setTurnNumber(1);
    setCellInfoData(null);
    setBossDangerActive(false);
  }, []);

  // ==================== 返回值 ====================
  return {
    // UI状态
    phase,
    diceResult,
    isRolling,
    techValue,
    gold,
    turnNumber,
    cellInfoData,
    bossDangerActive,

    // 操作方法
    rollDice,
    selectPath,
    enterCell,
    skipCell,
    closePanel,
    startNewGame,

    // 引用（供高级用法直接访问）
    engineRef,
    eventBus: eventBusRef.current,
  };
}
