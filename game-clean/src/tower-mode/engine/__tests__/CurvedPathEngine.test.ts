import { describe, it, expect, beforeEach } from 'vitest';
import { CurvedPathEngine } from '../curvedPathEngine';
import type { PathPoint } from '../curvedPathEngine';
import type { GridCoordinate, GourdMapTopology, GridPathConnection } from '../types/grid.types';
import { AreaEffectType } from '../types/grid.types';

function createMockGourdTopology(): GourdMapTopology {
  return {
    layer: 1,
    connections: [],
    upperCircle: { center: { x: 300, y: 200 }, radius: 150, cellIds: [] },
    lowerCircle: {
      center: { x: 300, y: 500 },
      radius: 120,
      cellIds: [],
      quadrants: {
        1: AreaEffectType.WEAK,
        2: AreaEffectType.KNOWLEDGE,
        3: AreaEffectType.INVERT,
        4: AreaEffectType.SKIP,
      },
    },
    connector: { width: 60, cellIds: [] },
    stats: { totalCells: 0, cellsByType: {}, avgPathLength: 0, loopPaths: 0 },
  };
}

describe('CurvedPathEngine', () => {
  let engine: CurvedPathEngine;

  beforeEach(() => {
    engine = new CurvedPathEngine();
  });

  describe('calculateAnimatedPath', () => {
    it('生成从起点到终点的曲线路径点序列', () => {
      const from: GridCoordinate = { x: 100, y: 100, section: 'upper', ringIndex: 0 };
      const to: GridCoordinate = { x: 300, y: 300, section: 'lower', ringIndex: 0 };
      const topology = createMockGourdTopology();
      const path = engine.calculateAnimatedPath(from, to, [], topology);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0].progress).toBeCloseTo(0, 1);
      expect(path[path.length - 1].progress).toBeCloseTo(1, 1);
    });

    it('路径起终点坐标正�?, () => {
      const from: GridCoordinate = { x: 100, y: 100, section: 'upper', ringIndex: 0 };
      const to: GridCoordinate = { x: 300, y: 300, section: 'lower', ringIndex: 0 };
      const topology = createMockGourdTopology();
      const path = engine.calculateAnimatedPath(from, to, [], topology);
      expect(path[0].x).toBeCloseTo(100, 1);
      expect(path[0].y).toBeCloseTo(100, 1);
      expect(path[path.length - 1].x).toBeCloseTo(300, 1);
      expect(path[path.length - 1].y).toBeCloseTo(300, 1);
    });

    it('经过途经格时路径弯曲', () => {
      const from: GridCoordinate = { x: 0, y: 0, section: 'upper', ringIndex: 0 };
      const to: GridCoordinate = { x: 200, y: 0, section: 'lower', ringIndex: 0 };
      const waypoint: GridCoordinate = { x: 100, y: 100, section: 'connector', ringIndex: 0 };
      const topology = createMockGourdTopology();
      const path = engine.calculateAnimatedPath(from, to, [waypoint], topology);
      const midPoint = path[Math.floor(path.length / 2)];
      expect(midPoint.y).toBeGreaterThan(0);
    });

    it('progress�?递增�?', () => {
      const from: GridCoordinate = { x: 0, y: 0, section: 'upper', ringIndex: 0 };
      const to: GridCoordinate = { x: 200, y: 200, section: 'lower', ringIndex: 0 };
      const topology = createMockGourdTopology();
      const path = engine.calculateAnimatedPath(from, to, [], topology);
      for (let i = 1; i < path.length; i++) {
        expect(path[i].progress).toBeGreaterThanOrEqual(path[i - 1].progress);
      }
    });
  });

  describe('calculatePathLength', () => {
    it('空路径返�?', () => {
      expect(engine.calculatePathLength([])).toBe(0);
    });

    it('单点路径返回0', () => {
      expect(engine.calculatePathLength([{ x: 10, y: 10 }])).toBe(0);
    });

    it('两点路径返回欧几里得距离', () => {
      const points = [{ x: 0, y: 0 }, { x: 3, y: 4 }];
      expect(engine.calculatePathLength(points)).toBeCloseTo(5, 5);
    });

    it('多点路径返回总距�?, () => {
      const points = [{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 8 }];
      expect(engine.calculatePathLength(points)).toBeCloseTo(10, 5);
    });
  });

  describe('getPositionAtProgress', () => {
    it('空路径返回原�?, () => {
      const pos = engine.getPositionAtProgress([], 0.5);
      expect(pos).toEqual({ x: 0, y: 0 });
    });

    it('单点路径返回该点', () => {
      const pos = engine.getPositionAtProgress([{ x: 50, y: 50 }], 0.5);
      expect(pos).toEqual({ x: 50, y: 50 });
    });

    it('progress=0返回起点', () => {
      const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const pos = engine.getPositionAtProgress(points, 0);
      expect(pos.x).toBeCloseTo(0, 5);
      expect(pos.y).toBeCloseTo(0, 5);
    });

    it('progress=1返回终点', () => {
      const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const pos = engine.getPositionAtProgress(points, 1);
      expect(pos.x).toBeCloseTo(100, 5);
      expect(pos.y).toBeCloseTo(0, 5);
    });

    it('progress=0.5返回中点', () => {
      const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const pos = engine.getPositionAtProgress(points, 0.5);
      expect(pos.x).toBeCloseTo(50, 5);
      expect(pos.y).toBeCloseTo(0, 5);
    });

    it('progress超出范围被clamp', () => {
      const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
      const posNeg = engine.getPositionAtProgress(points, -1);
      expect(posNeg.x).toBeCloseTo(0, 5);
      const posOver = engine.getPositionAtProgress(points, 2);
      expect(posOver.x).toBeCloseTo(100, 5);
    });
  });
});
