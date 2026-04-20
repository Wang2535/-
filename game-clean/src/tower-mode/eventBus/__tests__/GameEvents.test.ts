import { describe, it, expect } from 'vitest';
import type { GameEventMap, TrailPoint, PieceMoveEvents } from '../gameEvents';

describe('GameEvents - D组第七轮移动动画事件', () => {
  describe('PieceMoveEvents', () => {
    it('piece:move:start事件payload类型正确', () => {
      const payload: GameEventMap['piece:move:start'] = {
        fromCellId: 'cell_A',
        toCellId: 'cell_B',
        pathLength: 150,
      };
      expect(payload.fromCellId).toBe('cell_A');
      expect(payload.toCellId).toBe('cell_B');
      expect(payload.pathLength).toBe(150);
    });

    it('piece:move:update事件payload类型正确', () => {
      const trail: TrailPoint[] = [
        { x: 10, y: 20, timestamp: Date.now(), opacity: 1.0 },
      ];
      const payload: GameEventMap['piece:move:update'] = {
        position: { x: 50, y: 60 },
        progress: 0.5,
        trail,
      };
      expect(payload.position.x).toBe(50);
      expect(payload.progress).toBe(0.5);
      expect(payload.trail.length).toBe(1);
    });

    it('piece:move:end事件payload类型正确', () => {
      const trail: TrailPoint[] = [];
      const payload: GameEventMap['piece:move:end'] = {
        arrivedCellId: 'cell_B',
        trail,
      };
      expect(payload.arrivedCellId).toBe('cell_B');
    });

    it('cell:enter事件payload类型正确', () => {
      const payload: GameEventMap['cell:enter'] = {
        cellId: 'cell_B',
        zoneType: 'W',
      };
      expect(payload.cellId).toBe('cell_B');
      expect(payload.zoneType).toBe('W');
    });

    it('cell:enter事件zoneType可选', () => {
      const payload: GameEventMap['cell:enter'] = {
        cellId: 'cell_B',
      };
      expect(payload.zoneType).toBeUndefined();
    });

    it('zone:effect:trigger事件payload类型正确', () => {
      const payload: GameEventMap['zone:effect:trigger'] = {
        zoneType: 'I',
        cellId: 'cell_C',
      };
      expect(payload.zoneType).toBe('I');
      expect(payload.cellId).toBe('cell_C');
    });
  });

  describe('TrailPoint类型', () => {
    it('TrailPoint字段完整', () => {
      const point: TrailPoint = {
        x: 100,
        y: 200,
        timestamp: Date.now(),
        opacity: 0.8,
      };
      expect(point.x).toBe(100);
      expect(point.y).toBe(200);
      expect(typeof point.timestamp).toBe('number');
      expect(point.opacity).toBeGreaterThanOrEqual(0);
      expect(point.opacity).toBeLessThanOrEqual(1);
    });
  });

  describe('GameEventMap完整性', () => {
    it('包含所有移动动画事件键', () => {
      const requiredKeys: (keyof GameEventMap)[] = [
        'piece:move:start',
        'piece:move:update',
        'piece:move:end',
        'cell:enter',
        'zone:effect:trigger',
      ];
      for (const key of requiredKeys) {
        expect(key).toBeDefined();
      }
    });
  });
});
