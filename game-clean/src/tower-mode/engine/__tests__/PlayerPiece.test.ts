import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlayerPieceManager } from '../playerPiece';
import type { PlayerPieceState, TrailPoint } from '../playerPiece';
import { TypedEventBus } from '../../EventBus';
import type { TowerEventType } from '../../EventBus';

function createMockEventBus(): {
  bus: TypedEventBus<TowerEventType>;
  emittedEvents: Array<{ type: string; data: any }>;
} {
  const bus = new TypedEventBus<TowerEventType>();
  const emittedEvents: Array<{ type: string; data: any }> = [];

  const originalEmit = bus.emit.bind(bus);
  (bus as any).emit = (type: string, data: any) => {
    emittedEvents.push({ type, data });
  };

  return { bus, emittedEvents };
}

function createShortPathPoints(): Array<{ x: number; y: number }> {
  return [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
    { x: 100, y: 100 },
  ];
}

function createLongPathPoints(): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 20; i++) {
    points.push({ x: i * 15, y: i * 15 });
  }
  return points;
}

describe('PlayerPieceManager', () => {
  let manager: PlayerPieceManager;
  let mockBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    mockBus = createMockEventBus();
    manager = new PlayerPieceManager(mockBus.bus);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('startMove', () => {
    it('开始移动设置isMoving=true', () => {
      manager.startMove('cell_B', createShortPathPoints());
      const state = manager.getState();
      expect(state.isMoving).toBe(true);
      expect(state.targetPosition).toEqual({ x: 100, y: 100 });
    });

    it('发射piece:move:start事件', () => {
      manager.startMove('cell_B', createShortPathPoints(), 'W');
      expect(mockBus.emittedEvents.some(e => e.type === 'piece:move:start')).toBe(true);
      const startEvent = mockBus.emittedEvents.find(e => e.type === 'piece:move:start');
      expect(startEvent?.data.toCellId).toBe('cell_B');
    });

    it('移动期间再次startMove被忽�?, () => {
      manager.startMove('cell_B', createShortPathPoints());
      mockBus.emittedEvents.length = 0;
      manager.startMove('cell_C', createShortPathPoints());
      expect(mockBus.emittedEvents.some(e => e.type === 'piece:move:start')).toBe(false);
    });

    it('空路径不开始移�?, () => {
      manager.startMove('cell_B', []);
      expect(manager.getState().isMoving).toBe(false);
    });

    it('移动时长使用Math.min(300 + pathPoints.length * 10, 600)', () => {
      manager.startMove('cell_B', createShortPathPoints());
      expect(manager.getState().moveDuration).toBe(Math.min(300 + 3 * 10, 600));
    });
  });

  describe('update', () => {
    it('移动中update返回更新后的状�?, () => {
      manager.startMove('cell_B', createShortPathPoints());
      vi.advanceTimersByTime(50);
      const state = manager.update(16);
      expect(state.isMoving).toBe(true);
    });

    it('发射piece:move:update事件（节�?0ms�?, () => {
      manager.startMove('cell_B', createShortPathPoints());
      vi.advanceTimersByTime(60);
      manager.update(16);
      expect(mockBus.emittedEvents.some(e => e.type === 'piece:move:update')).toBe(true);
    });

    it('移动完成时isMoving=false且justArrived=true', () => {
      manager.startMove('cell_B', createShortPathPoints());
      (manager as any).state.moveDuration = 1;
      vi.advanceTimersByTime(100);
      manager.update(16);
      const state = manager.getState();
      expect(state.isMoving).toBe(false);
      expect(state.justArrived).toBe(true);
    });

    it('移动完成时发射piece:move:end事件', () => {
      manager.startMove('cell_B', createShortPathPoints());
      (manager as any).state.moveDuration = 1;
      vi.advanceTimersByTime(100);
      manager.update(16);
      expect(mockBus.emittedEvents.some(e => e.type === 'piece:move:end')).toBe(true);
    });

    it('justArrived标记300ms后自动清�?, () => {
      manager.startMove('cell_B', createShortPathPoints());
      (manager as any).state.moveDuration = 1;
      vi.advanceTimersByTime(100);
      manager.update(16);
      expect(manager.getState().justArrived).toBe(true);
      vi.advanceTimersByTime(350);
      expect(manager.getState().justArrived).toBe(false);
    });

    it('未移动时update返回当前状�?, () => {
      const state = manager.update(16);
      expect(state.isMoving).toBe(false);
    });
  });

  describe('setCurrentZone', () => {
    it('区域变化时发射zone:effect:trigger事件', () => {
      manager.setCurrentZone('W');
      expect(mockBus.emittedEvents.some(e => e.type === 'zone:effect:trigger')).toBe(true);
      const zoneEvent = mockBus.emittedEvents.find(e => e.type === 'zone:effect:trigger');
      expect(zoneEvent?.data.zoneType).toBe('W');
    });

    it('区域未变化时不发射事�?, () => {
      manager.setCurrentZone('W');
      mockBus.emittedEvents.length = 0;
      manager.setCurrentZone('W');
      expect(mockBus.emittedEvents.some(e => e.type === 'zone:effect:trigger')).toBe(false);
    });

    it('设置null不发射事�?, () => {
      manager.setCurrentZone(null);
      expect(mockBus.emittedEvents.some(e => e.type === 'zone:effect:trigger')).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('subscribe回调正常工作', () => {
      const states: PlayerPieceState[] = [];
      manager.subscribe(s => states.push(s));
      manager.startMove('cell_B', createShortPathPoints());
      vi.advanceTimersByTime(50);
      manager.update(16);
      expect(states.length).toBeGreaterThan(0);
      expect(states[states.length - 1].isMoving).toBe(true);
    });

    it('取消订阅后不再收到回�?, () => {
      const states: PlayerPieceState[] = [];
      const unsub = manager.subscribe(s => states.push(s));
      unsub();
      manager.startMove('cell_B', createShortPathPoints());
      vi.advanceTimersByTime(50);
      manager.update(16);
      expect(states.length).toBe(0);
    });
  });

  describe('轨迹残留', () => {
    it('轨迹最多保�?个点', () => {
      manager.startMove('cell_B', createLongPathPoints());
      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(30);
        manager.update(16);
      }
      const state = manager.getState();
      expect(state.trailHistory.length).toBeLessThanOrEqual(5);
    });
  });

  describe('clearTrail', () => {
    it('清除trailHistory', () => {
      manager.startMove('cell_B', createShortPathPoints());
      vi.advanceTimersByTime(100);
      manager.update(16);
      manager.clearTrail();
      expect(manager.getState().trailHistory).toEqual([]);
    });
  });

  describe('getState', () => {
    it('返回深拷贝不影响内部状�?, () => {
      manager.startMove('cell_B', createShortPathPoints());
      const state = manager.getState();
      if (state.position) {
        state.position.x = 9999;
      }
      const innerState = manager.getState();
      expect(innerState.position?.x).not.toBe(9999);
    });
  });

  describe('reset', () => {
    it('重置所有状�?, () => {
      manager.startMove('cell_B', createShortPathPoints());
      vi.advanceTimersByTime(100);
      manager.update(16);
      manager.reset();
      const state = manager.getState();
      expect(state.isMoving).toBe(false);
      expect(state.position).toBeNull();
      expect(state.trailHistory).toEqual([]);
      expect(state.justArrived).toBe(false);
      expect(state.currentZone).toBeNull();
    });
  });
});
