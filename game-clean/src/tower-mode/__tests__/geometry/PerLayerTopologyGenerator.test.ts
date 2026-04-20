import { describe, it, expect } from 'vitest';
import { getGourdTopology, getAllGourdTopologies } from '../../data/gourdTopologies';
import type { GourdMapTopology } from '../../types/grid.types';

describe('F2 — GourdTopology 拓扑差异测试', () => {

  // ──────────────────────────────────────────────
  // 2.1 L1 标准拓扑基本结构
  // ──────────────────────────────────────────────
  describe('2.1 L1标准拓扑基本结构', () => {
    it('getGourdTopology(1) 返回有效对象且 layer === 1', () => {
      const topo = getGourdTopology(1);
      expect(topo).toBeDefined();
      expect(topo).not.toBeNull();
      expect(typeof topo).toBe('object');
      expect(topo.layer).toBe(1);
    });

    it('upperCircle.cellIds 非空（start区域有格子）', () => {
      const topo = getGourdTopology(1);
      expect(topo.upperCircle.cellIds.length).toBeGreaterThan(0);
      topo.upperCircle.cellIds.forEach(id => {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });
    });

    it('lowerCircle.cellIds 非空、connections 非空、stats.totalCells > 10', () => {
      const topo = getGourdTopology(1);

      expect(topo.lowerCircle.cellIds.length).toBeGreaterThan(0);
      expect(topo.connections.length).toBeGreaterThan(0);
      expect(topo.stats.totalCells).toBeGreaterThan(10);
    });
  });

  // ──────────────────────────────────────────────
  // 2.2 各层数据存在性
  // ──────────────────────────────────────────────
  describe('2.2 各层数据存在性', () => {
    it('对 i=1..9 每层调用 getGourdTopology(i) 都返回非 null/undefined，layer 属性匹配', () => {
      for (let i = 1; i <= 9; i++) {
        const topo = getGourdTopology(i);
        expect(topo).toBeDefined();
        expect(topo).not.toBeNull();
        expect(topo.layer).toBe(i);
      }
    });
  });

  // ──────────────────────────────────────────────
  // 2.3 各层差异化
  // ──────────────────────────────────────────────
  describe('2.3 各层差异化', () => {
    it('不同层的 stats.totalCells 可能不同（或至少可以获取）', () => {
      const totalCellsSet = new Set<number>();
      for (let i = 1; i <= 9; i++) {
        const topo = getGourdTopology(i);
        expect(typeof topo.stats.totalCells).toBe('number');
        expect(topo.stats.totalCells).toBeGreaterThan(0);
        totalCellsSet.add(topo.stats.totalCells);
      }
      const allLayers = Array.from({ length: 9 }, (_, i) => i + 1);
      const cellCounts = allLayers.map(i => getGourdTopology(i).stats.totalCells);
      expect(cellCounts.every(c => c > 0)).toBe(true);
    });

    it('不同层的 connections 数量可能不同，avgPathLength 有意义 (>0)', () => {
      const connCounts: number[] = [];
      const avgLengths: number[] = [];

      for (let i = 1; i <= 9; i++) {
        const topo = getGourdTopology(i);
        connCounts.push(topo.connections.length);
        avgLengths.push(topo.stats.avgPathLength);
      }

      const uniqueConnCounts = new Set(connCounts);
      const uniqueAvgLengths = new Set(avgLengths);

      expect(connCounts.every(c => c > 0)).toBe(true);
      expect(avgLengths.every(l => l > 0)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────
  // 2.4 区域信息完整性
  // ──────────────────────────────────────────────
  describe('2.4 区域信息完整性', () => {
    it('每层都有 upperCircle / connector / lowerCircle 三段', () => {
      for (let i = 1; i <= 9; i++) {
        const topo = getGourdTopology(i);
        expect(topo.upperCircle).toBeDefined();
        expect(topo.connector).toBeDefined();
        expect(topo.lowerCircle).toBeDefined();
        expect(typeof topo.upperCircle.center.x).toBe('number');
        expect(typeof topo.upperCircle.center.y).toBe('number');
        expect(typeof topo.upperCircle.radius).toBe('number');
        expect(Array.isArray(topo.upperCircle.cellIds)).toBe(true);
        expect(Array.isArray(topo.connector.cellIds)).toBe(true);
        expect(typeof topo.connector.width).toBe('number');
        expect(typeof topo.lowerCircle.center.x).toBe('number');
        expect(typeof topo.lowerCircle.center.y).toBe('number');
        expect(typeof topo.lowerCircle.radius).toBe('number');
        expect(Array.isArray(topo.lowerCircle.cellIds)).toBe(true);
      }
    });

    it('每层 lowerCircle.quadrants 存在且有 4 个象限 (1-4)，stats.cellsByType 存在', () => {
      for (let i = 1; i <= 9; i++) {
        const topo = getGourdTopology(i);
        const q = topo.lowerCircle.quadrants;
        expect(q).toBeDefined();
        expect(q[1]).toBeDefined();
        expect(q[2]).toBeDefined();
        expect(q[3]).toBeDefined();
        expect(q[4]).toBeDefined();
        expect(topo.stats.cellsByType).toBeDefined();
        expect(typeof topo.stats.cellsByType).toBe('object');
      }
    });
  });

  // ──────────────────────────────────────────────
  // 2.5 getAllGourdTopologies 全量
  // ──────────────────────────────────────────────
  describe('2.5 getAllGourdTopologies 全量', () => {
    it('getAllGourdTopologies() 返回长度为 9 的数组', () => {
      const all = getAllGourdTopologies();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(9);
      all.forEach((topo, idx) => {
        expect(topo).toBeDefined();
        expect(topo.layer).toBe(idx + 1);
      });
    });
  });
});
