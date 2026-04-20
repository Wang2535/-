import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MovementController, createMovementSystem } from '../movementController';
import { TypedEventBus } from '../../EventBus';
import type { TowerEventType } from '../../EventBus';
import type { GourdCoordinate } from '../types/gourdCoordinate.types';
import type { GourdMapTopology } from '../types/grid.types';
import { GourdRegion } from '../types/gourdCoordinate.types';

function createMockEventBus(): TypedEventBus<TowerEventType> {
  return new TypedEventBus<TowerEventType>();
}

function createMockTopology(): GourdMapTopology {
  return {
    layer: 1,
    connections: [],
    upperCircle: {
      center: { x: 300, y: 200 },
      radius: 150,
      cellIds: [],
    },
    lowerCircle: {
      center: { x: 300, y: 500 },
      radius: 120,
      cellIds: [],
      quadrants: {
        1: 'W' as any,
        2: 'N' as any,
        3: 'I' as any,
        4: 'P' as any,
      },
    },
    connector: {
      width: 60,
      cellIds: [],
    },
    stats: {
      totalCells: 10,
      cellsByType: {},
      avgPathLength: 100,
      loopPaths: 0,
    },
  };
}

function createMockCoord(region: GourdRegion, theta: number, radiusRatio: number): GourdCoordinate {
  return {
    region,
    theta,
    radiusRatio,
    cartesian: { x: 300 + Math.cos(theta) * 100 * radiusRatio, y: 500 + Math.sin(theta) * 100 * radiusRatio },
  };
}

describe('MovementController', () => {
  let controller: MovementController;
  let eventBus: TypedEventBus<TowerEventType>;

  beforeEach(() => {
    eventBus = createMockEventBus();
    controller = new MovementController(eventBus);
  });

  describe('setTopology', () => {
    it('设置拓扑后可发起移动', async () => {
      controller.setTopology(createMockTopology());
      const from = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI, 0.5);
      const to = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI / 2, 0.7);
      const result = await controller.requestMove(from, to, []);
      expect(result).toBe(true);
    });
  });

  describe('requestMove', () => {
    it('未设置拓扑时返回false', async () => {
      const from = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI, 0.5);
      const to = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI / 2, 0.7);
      const result = await controller.requestMove(from, to, []);
      expect(result).toBe(false);
    });

    it('成功发起移动后isMoving=true', async () => {
      controller.setTopology(createMockTopology());
      const from = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI, 0.5);
      const to = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI / 2, 0.7);
      await controller.requestMove(from, to, []);
      expect(controller.getPieceState().isMoving).toBe(true);
    });

    it('移动中拒绝重复请�?, async () => {
      controller.setTopology(createMockTopology());
      const from = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI, 0.5);
      const to = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI / 2, 0.7);
      await controller.requestMove(from, to, []);
      const result2 = await controller.requestMove(from, to, []);
      expect(result2).toBe(false);
    });
  });

  describe('getPieceState', () => {
    it('返回PlayerPieceState', () => {
      const state = controller.getPieceState();
      expect(state).toHaveProperty('isMoving');
      expect(state).toHaveProperty('position');
      expect(state).toHaveProperty('justArrived');
      expect(state).toHaveProperty('currentZone');
    });
  });

  describe('onPieceStateChange', () => {
    it('返回取消订阅函数', () => {
      const unsub = controller.onPieceStateChange(() => {});
      expect(typeof unsub).toBe('function');
    });
  });

  describe('setCurrentZone', () => {
    it('代理到PlayerPieceManager', () => {
      controller.setCurrentZone('W');
      expect(controller.getPieceState().currentZone).toBe('W');
    });
  });

  describe('emergencyStop', () => {
    it('调用不报�?, () => {
      expect(() => controller.emergencyStop()).not.toThrow();
    });
  });

  describe('createMovementSystem', () => {
    it('创建MovementController实例', () => {
      const sys = createMovementSystem(eventBus);
      expect(sys).toBeInstanceOf(MovementController);
    });
  });

  describe('detectZone', () => {
    it('W区域(π~1.5π)正确检�?, async () => {
      controller.setTopology(createMockTopology());
      const from = createMockCoord(GourdRegion.LOWER_CIRCLE, 0, 0.5);
      const to = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI * 1.25, 0.7);
      await controller.requestMove(from, to, []);
      expect(controller.getPieceState().currentZone).toBe('W');
    });

    it('N区域(0~0.5π)正确检�?, async () => {
      controller.setTopology(createMockTopology());
      const from = createMockCoord(GourdRegion.LOWER_CIRCLE, 0, 0.5);
      const to = createMockCoord(GourdRegion.LOWER_CIRCLE, Math.PI * 0.25, 0.7);
      await controller.requestMove(from, to, []);
      expect(controller.getPieceState().currentZone).toBe('N');
    });

    it('upperCircle区域返回null', async () => {
      controller.setTopology(createMockTopology());
      const from = createMockCoord(GourdRegion.UPPER_CIRCLE, 0, 0.5);
      const to = createMockCoord(GourdRegion.UPPER_CIRCLE, Math.PI, 0.7);
      await controller.requestMove(from, to, []);
      expect(controller.getPieceState().currentZone).toBeNull();
    });
  });
});
