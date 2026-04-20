import { describe, it, expect, beforeEach } from 'vitest';
import { TurnManager } from '../turnManager';
import type { TurnPhase, TurnContext } from '../turnManager';
import { TypedEventBus } from '../../EventBus';
import type { TowerEventType } from '../../EventBus';
import type { MoveOption, DiceRollResult } from '../types/movement.types';
import type { GameCell, ZoneType } from '../types';

function createMockEventBus(): { bus: TypedEventBus<TowerEventType>; emitted: Array<{ type: string; data: any }> } {
  const bus = new TypedEventBus<TowerEventType>();
  const emitted: Array<{ type: string; data: any }> = [];
  const orig = bus.emit.bind(bus);
  (bus as any).emit = (type: string, data: any) => { emitted.push({ type, data }); };
  return { bus, emitted };
}

function createMockMoveOption(targetId: string): MoveOption {
  return {
    targetCell: { id: targetId, coordinate: [1, 0], type: 'battle', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false } as any,
    path: [[0, 0] as any, [1, 0] as any],
    distance: 1,
    zoneWarnings: [] as ZoneType[],
    recommended: true,
    riskScore: 0,
  };
}

describe('TurnManager', () => {
  let manager: TurnManager;
  let mockBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    mockBus = createMockEventBus();
    manager = new TurnManager(mockBus.bus);
  });

  describe('startTurn', () => {
    it('开始新回合，turnNumber递增', () => {
      manager.startTurn();
      expect(manager.getTurnState().turnNumber).toBe(1);
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      manager.triggerCellAction();
      manager.endTurn();
      manager.startTurn();
      expect(manager.getTurnState().turnNumber).toBe(2);
    });

    it('发射turn:start事件', () => {
      manager.startTurn();
      expect(mockBus.emitted.some(e => e.type === 'turn:start')).toBe(true);
    });

    it('非idle状态调用startTurn抛错', () => {
      manager.startTurn();
      expect(() => manager.startTurn()).toThrow();
    });
  });

  describe('rollDice', () => {
    it('投骰子返回DiceRollResult', () => {
      manager.startTurn();
      const result = manager.rollDice();
      expect(result.rawValue).toBeGreaterThanOrEqual(1);
      expect(result.rawValue).toBeLessThanOrEqual(6);
      expect(result.modifiedValue).toBe(result.rawValue);
    });

    it('状态变为dice_rolled', () => {
      manager.startTurn();
      manager.rollDice();
      expect(manager.getTurnState().phase).toBe('dice_rolled');
    });

    it('发射dice:rolled事件', () => {
      manager.startTurn();
      manager.rollDice();
      expect(mockBus.emitted.some(e => e.type === 'dice:rolled')).toBe(true);
    });

    it('非idle/dice_rolled状态调用rollDice抛错', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      expect(() => manager.rollDice()).toThrow();
    });
  });

  describe('selectPath', () => {
    it('选择路径后状态变为path_selected', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      expect(manager.getTurnState().phase).toBe('path_selected');
    });

    it('发射path:selected事件', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      expect(mockBus.emitted.some(e => e.type === 'path:selected')).toBe(true);
    });

    it('非dice_rolled状态调用selectPath抛错', () => {
      expect(() => manager.selectPath(createMockMoveOption('cell_B'))).toThrow();
    });
  });

  describe('executeMove', () => {
    it('执行移动后状态变为cell_action', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      expect(manager.getTurnState().phase).toBe('cell_action');
    });

    it('发射move:completed事件', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      expect(mockBus.emitted.some(e => e.type === 'move:completed')).toBe(true);
    });

    it('非path_selected状态调用executeMove抛错', () => {
      expect(() => manager.executeMove()).toThrow();
    });
  });

  describe('triggerCellAction', () => {
    it('触发格子行动后状态变为completed', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      manager.triggerCellAction();
      expect(manager.getTurnState().phase).toBe('completed');
    });

    it('发射cell:action:trigger事件', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      manager.triggerCellAction();
      expect(mockBus.emitted.some(e => e.type === 'cell:action:trigger')).toBe(true);
    });

    it('非cell_action状态调用triggerCellAction抛错', () => {
      expect(() => manager.triggerCellAction()).toThrow();
    });
  });

  describe('endTurn', () => {
    it('结束回合后状态变为idle', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      manager.triggerCellAction();
      manager.endTurn();
      expect(manager.getTurnState().phase).toBe('idle');
    });

    it('发射turn:end事件', () => {
      manager.startTurn();
      manager.rollDice();
      manager.selectPath(createMockMoveOption('cell_B'));
      manager.executeMove();
      manager.triggerCellAction();
      manager.endTurn();
      expect(mockBus.emitted.some(e => e.type === 'turn:end')).toBe(true);
    });

    it('非completed状态调用endTurn抛错', () => {
      expect(() => manager.endTurn()).toThrow();
    });
  });

  describe('完整回合流程', () => {
    it('从idle到idle完整流程', () => {
      manager.startTurn();
      expect(manager.getTurnState().phase).toBe('idle');
      expect(manager.getTurnState().turnNumber).toBe(1);

      manager.rollDice();
      expect(manager.getTurnState().phase).toBe('dice_rolled');

      manager.selectPath(createMockMoveOption('cell_B'));
      expect(manager.getTurnState().phase).toBe('path_selected');

      manager.executeMove();
      expect(manager.getTurnState().phase).toBe('cell_action');

      manager.triggerCellAction();
      expect(manager.getTurnState().phase).toBe('completed');

      manager.endTurn();
      expect(manager.getTurnState().phase).toBe('idle');
    });
  });

  describe('getTurnState', () => {
    it('返回浅拷�?, () => {
      manager.startTurn();
      const state = manager.getTurnState();
      state.turnNumber = 999;
      expect(manager.getTurnState().turnNumber).not.toBe(999);
    });
  });

  describe('reset', () => {
    it('重置所有状�?, () => {
      manager.startTurn();
      manager.rollDice();
      manager.reset();
      expect(manager.getTurnState().phase).toBe('idle');
      expect(manager.getTurnState().turnNumber).toBe(0);
    });
  });
});
