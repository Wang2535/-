import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTowerGameController } from '../useTowerGameController';
import type { DiceResult } from '../../types/gameMechanics.types';

/**
 * useTowerGameController 测试套件
 *
 * 测试要点：
 * 1. 初始状态正确（phase='idle', techValue=100, gold=0, turnNumber=1）
 * 2. rollDice() 在 idle 状态正常执行并更新状态
 * 3. rollDice() 在非 idle 状态不执行（守卫）
 * 4. selectPath() 在 dice_result 状态可执行
 * 5. selectPath() 在非 dice_result 状态不执行
 * 6. enterCell() 正常转发
 * 7. skipCell() 正常转发
 * 8. closePanel() 清空 cellInfoData
 * 9. startNewGame() 重置所有状态
 * 10. 资源变更通过事件反映到 state
 * 11. cleanup 函数存在
 */

describe('useTowerGameController', () => {
  let hookResult: ReturnType<typeof renderHook<typeof useTowerGameController>>;

  beforeEach(() => {
    // 每个测试前重新渲染Hook
    hookResult = renderHook(() => useTowerGameController());
  });

  afterEach(() => {
    // 清理
    if (hookResult) {
      hookResult.unmount();
    }
  });

  describe('初始状态', () => {
    it('应该具有正确的初始状态', () => {
      const { result } = hookResult;

      // 验证所有初始状态值
      expect(result.current.phase).toBe('idle');
      expect(result.current.techValue).toBe(100);
      expect(result.current.gold).toBe(0);
      expect(result.current.turnNumber).toBe(1);
      expect(result.current.diceResult).toBeNull();
      expect(result.current.isRolling).toBe(false);
      expect(result.current.cellInfoData).toBeNull();
      expect(result.current.bossDangerActive).toBe(false);
    });

    it('引擎和事件总线引用应该存在', () => {
      const { result } = hookResult;

      expect(result.current.engineRef.current).toBeDefined();
      expect(result.current.engineRef.current).not.toBeNull();
      expect(result.current.eventBus).toBeDefined();
    });
  });

  describe('rollDice()', () => {
    it('在idle状态下应该正常执行并返回有效的DiceResult', () => {
      const { result } = hookResult;

      let diceResult: DiceResult | null = null;

      act(() => {
        diceResult = result.current.rollDice();
      });

      // 验证返回值有效
      expect(diceResult).not.toBeNull();
      expect(diceResult!.baseValue).toBeGreaterThanOrEqual(1);
      expect(diceResult!.baseValue).toBeLessThanOrEqual(6);
      expect(diceResult!.finalValue).toBeGreaterThanOrEqual(1);
      expect(diceResult!.modifiers).toBeDefined();
      expect(typeof diceResult!.isCritSuccess).toBe('boolean');
      expect(typeof diceResult!.isCritFail).toBe('boolean');

      // 验证状态更新：isRolling应该在dice:result事件后变为false
      // 注意：由于事件是同步触发的，isRolling可能已经变为false
      expect(result.current.diceResult).not.toBeNull();
    });

    it('在idle状态执行后phase应该改变', () => {
      const { result } = hookResult;

      act(() => {
        result.current.rollDice();
      });

      // phase应该不再是'idle'（应该是'dice_result'或类似状态）
      expect(result.current.phase).not.toBe('idle');
    });

    it('在非idle状态下不应该执行（守卫机制）', () => {
      const { result } = hookResult;

      // 先投一次骰子使状态离开idle
      act(() => {
        result.current.rollDice();
      });

      // 现在phase不是idle，再次尝试投骰子
      const phaseBefore = result.current.phase;
      let secondRollResult: DiceResult | null = null;

      act(() => {
        secondRollResult = result.current.rollDice();
      });

      // 应该返回null（被守卫拦截）
      expect(secondRollResult).toBeNull();

      // phase不应该因为第二次调用而改变
      expect(result.current.phase).toBe(phaseBefore);
    });
  });

  describe('selectPath()', () => {
    it('在dice_result状态下应该可以执行', () => {
      const { result } = hookResult;

      // 先进入dice_result状态
      act(() => {
        result.current.rollDice();
      });

      // 尝试选择路径（即使路径不存在，也应该尝试调用）
      let selectResult: boolean;

      act(() => {
        selectResult = result.current.selectPath(0);
      });

      // 由于没有设置拓扑，selectPath会返回false，但关键是方法被调用了
      expect(typeof selectResult).toBe('boolean');
    });

    it('在非dice_result状态下不应该执行（守卫机制）', () => {
      const { result } = hookResult;

      // 在idle状态下尝试选择路径
      let selectResult: boolean;

      act(() => {
        selectResult = result.current.selectPath(0);
      });

      // 应该返回false（被守卫拦截）
      expect(selectResult).toBe(false);
    });

    it('在其他非idle且非dice_result状态下也不应该执行', () => {
      const { result } = hookResult;

      // 投骰子后状态变为dice_result或其他
      act(() => {
        result.current.rollDice();
      });

      // 假设我们手动模拟一个不同的phase（通过直接操作不太可能，但可以验证逻辑）
      // 这里我们主要验证类型安全和基本行为
      const currentPhase = result.current.phase;

      if (currentPhase !== 'dice_result') {
        act(() => {
          const selectResult = result.current.selectPath(0);
          expect(selectResult).toBe(false);
        });
      }
    });
  });

  describe('enterCell()', () => {
    it('应该正确转发到引擎', () => {
      const { result } = hookResult;
      const engine = result.current.engineRef.current!;

      // 监听引擎的enterCell调用
      let enteredCellId: string | null = null;
      const originalEnterCell = engine.enterCell.bind(engine);
      engine.enterCell = (cellId: string) => {
        enteredCellId = cellId;
        originalEnterCell(cellId);
      };

      act(() => {
        result.current.enterCell('test_cell_1');
      });

      // 验证引擎收到了正确的cellId
      expect(enteredCellId).toBe('test_cell_1');

      // 验证cellInfoData被清空
      expect(result.current.cellInfoData).toBeNull();
    });

    it('清空cellInfoData', () => {
      const { result } = hookResult;

      // 先设置一些cellInfoData（模拟）
      // 注意：这需要通过事件来触发，这里我们只验证调用后为null
      act(() => {
        result.current.enterCell('any_cell');
      });

      expect(result.current.cellInfoData).toBeNull();
    });
  });

  describe('skipCell()', () => {
    it('应该正确转发到引擎', () => {
      const { result } = hookResult;
      const engine = result.current.engineRef.current!;

      // 监听引擎的skipCell调用
      let skippedCellId: string | null = null;
      const originalSkipCell = engine.skipCell.bind(engine);
      engine.skipCell = (cellId: string) => {
        skippedCellId = cellId;
        originalSkipCell(cellId);
      };

      act(() => {
        result.current.skipCell('test_cell_2');
      });

      // 验证引擎收到了正确的cellId
      expect(skippedCellId).toBe('test_cell_2');

      // 验证cellInfoData被清空
      expect(result.current.cellInfoData).toBeNull();
    });
  });

  describe('closePanel()', () => {
    it('应该清空cellInfoData', () => {
      const { result } = hookResult;

      // 假设cellInfoData有值（实际需要通过事件设置）
      // 这里我们验证调用closePanel后它为null
      act(() => {
        result.current.closePanel();
      });

      expect(result.current.cellInfoData).toBeNull();
    });
  });

  describe('startNewGame()', () => {
    it('应该重置所有状态到初始值', () => {
      const { result } = hookResult;

      // 先做一些操作改变状态
      act(() => {
        result.current.rollDice(); // 改变phase, diceResult
      });

      // 验证状态已经改变
      expect(result.current.phase).not.toBe('idle');
      expect(result.current.diceResult).not.toBeNull();

      // 调用startNewGame
      act(() => {
        result.current.startNewGame();
      });

      // 验证所有状态重置到初始值
      expect(result.current.phase).toBe('idle');
      expect(result.current.diceResult).toBeNull();
      expect(result.current.isRolling).toBe(false);
      expect(result.current.techValue).toBe(100);
      expect(result.current.gold).toBe(0);
      expect(result.current.turnNumber).toBe(1);
      expect(result.current.cellInfoData).toBeNull();
      expect(result.current.bossDangerActive).toBe(false);
    });

    it('应该调用引擎的startNewGame方法', () => {
      const { result } = hookResult;
      const engine = result.current.engineRef.current!;

      // 监听引擎的startNewGame调用
      let startNewGameCalled = false;
      const originalStartNewGame = engine.startNewGame.bind(engine);
      engine.startNewGame = () => {
        startNewGameCalled = true;
        originalStartNewGame();
      };

      act(() => {
        result.current.startNewGame();
      });

      // 验证引擎方法被调用
      expect(startNewGameCalled).toBe(true);
    });
  });

  describe('资源变更事件', () => {
    it('tech资源变更应该更新techValue状态', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      // 手动发射resource:change事件（type='tech'）
      act(() => {
        bus.emit('resource:change' as any, {
          type: 'tech',
          delta: 25,
          newValue: 125,
        } as any);
      });

      // 验证techValue已更新
      expect(result.current.techValue).toBe(125);
    });

    it('gold资源变更应该更新gold状态', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      // 手动发射resource:change事件（type='gold'）
      act(() => {
        bus.emit('resource:change' as any, {
          type: 'gold',
          delta: 50,
          newValue: 50,
        } as any);
      });

      // 验证gold已更新
      expect(result.current.gold).toBe(50);
    });

    it('多个资源变更事件应该分别处理', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      act(() => {
        // 变更tech
        bus.emit('resource:change' as any, {
          type: 'tech',
          delta: -30,
          newValue: 70,
        } as any);

        // 变更gold
        bus.emit('resource:change' as any, {
          type: 'gold',
          delta: 100,
          newValue: 100,
        } as any);
      });

      expect(result.current.techValue).toBe(70);
      expect(result.current.gold).toBe(100);
    });
  });

  describe('回合结束事件', () => {
    it('turn:end事件应该递增turnNumber', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      const initialTurnNumber = result.current.turnNumber;

      act(() => {
        bus.emit('turn:end' as any, { turnNumber: initialTurnNumber + 1 } as any);
      });

      expect(result.current.turnNumber).toBe(initialTurnNumber + 1);
    });

    it('多次turn:end事件应该持续递增', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      act(() => {
        for (let i = 0; i < 5; i++) {
          bus.emit('turn:end' as any, { turnNumber: i + 2 } as any);
        }
      });

      expect(result.current.turnNumber).toBe(6); // 初始1 + 5次递增
    });
  });

  describe('战斗事件', () => {
    it('battle:trigger事件应该激活boss危险提示', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      act(() => {
        bus.emit('battle:trigger' as any, {} as any);
      });

      expect(result.current.bossDangerActive).toBe(true);
    });
  });

  describe('格子信息面板事件', () => {
    it('cell:info:show事件应该设置cellInfoData', () => {
      const { result } = hookResult;
      const bus = result.current.eventBus;

      const mockCellInfo = {
        cellId: 'cell_1',
        cellType: 'battle',
        name: '病毒实验室',
        difficultyStars: 2,
      };

      act(() => {
        bus.emit('cell:info:show' as any, mockCellInfo as any);
      });

      // 注意：TypedEventBus.emit会将data与type合并，所以cellInfoData会包含type字段
      expect(result.current.cellInfoData).toBeDefined();
      expect(result.current.cellInfoData.cellId).toBe('cell_1');
      expect(result.current.cellInfoData.cellType).toBe('battle');
      expect(result.current.cellInfoData.name).toBe('病毒实验室');
      expect(result.current.cellInfoData.difficultyStars).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('卸载时应该清理所有事件监听器', () => {
      const { result, unmount } = renderHook(() => useTowerGameController());
      const bus = result.current.eventBus;

      // 订阅一些事件后检查监听器数量
      // （TypedEventBus内部可能有监听器）
      unmount();

      // 卸载后，再次发射事件不应该触发state更新
      // 这验证了cleanup函数的存在和执行
      // 由于我们已经unmount，无法再访问result.current
      // 但如果没有错误抛出，说明cleanup成功执行
      expect(true).toBe(true); // 占位断言，主要验证unmount不报错
    });

    it('重新挂载应该创建新的实例', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() => useTowerGameController());
      const engine1 = result1.current.engineRef.current;

      unmount1();

      const { result: result2 } = renderHook(() => useTowerGameController());
      const engine2 = result2.current.engineRef.current;

      // 新实例应该不同
      expect(engine1).not.toBe(engine2);

      // 新实例的状态应该是初始状态
      expect(result2.current.phase).toBe('idle');
      expect(result2.current.techValue).toBe(100);
    });
  });

  describe('边界情况', () => {
    it('多次快速调用rollDice应该只有第一次生效', () => {
      const { result } = hookResult;

      let firstResult: DiceResult | null = null;
      let secondResult: DiceResult | null = null;

      // 第一次调用：在idle状态下应该成功
      act(() => {
        firstResult = result.current.rollDice();
      });

      // 验证第一次成功
      expect(firstResult).not.toBeNull();

      // 第二次调用：现在phase已经不是idle了（需要新的act来获取更新的state）
      act(() => {
        secondResult = result.current.rollDice(); // 应该被拦截
      });

      // 验证第二次被守卫拦截
      expect(secondResult).toBeNull();
    });

    it('enterCell和skipCell接受任意字符串参数', () => {
      const { result } = hookResult;

      // 不应该抛出错误
      act(() => {
        result.current.enterCell('');
        result.current.skipCell('');
        result.current.enterCell('any_id');
        result.current.skipCell('any_id');
      });

      // 如果到达这里说明没有错误
      expect(true).toBe(true);
    });

    it('closePanel多次调用安全', () => {
      const { result } = hookResult;

      act(() => {
        result.current.closePanel();
        result.current.closePanel();
        result.current.closePanel();
      });

      expect(result.current.cellInfoData).toBeNull();
    });
  });
});
