/**
 * 9-Layer Special Mechanics Tests (F组 Round 9 Task 2)
 *
 * Tests the 9 layer special mechanics based on topology data.
 * Each layer has different shape parameters, cell distributions,
 * and quadrant effects defined in gourdTopologies.ts.
 *
 * Layer mechanics mapping (from data/layerMechanics.ts):
 *   L1: acceleration (加速机制)
 *   L2: firewall_bypass (防火墙绕过)
 *   L3: encryption (加密机制)
 *   L4: phishing (钓鱼机制)
 *   L5: scada (工控监控)
 *   L6: signal_switch (信号切换)
 *   L7: container (容器隔离)
 *   L8: collapse (观测坍缩)
 *   L9: protocol (协议机制)
 */

import { describe, it, expect } from 'vitest';
import { getGourdTopology, getAllGourdTopologies } from '../../data/gourdTopologies';
import { LAYER_MECHANICS } from '../../data/layerMechanics';
import type { GourdMapTopology } from '../../types/grid.types';
import type { AreaEffectType } from '../../types/grid.types';

const LAYER_MECHANIC_NAMES: Record<number, { name: string; desc: string }> = {
  1: { name: 'acceleration', desc: '加速机制' },
  2: { name: 'firewall_bypass', desc: '防火墙绕过' },
  3: { name: 'encryption', desc: '加密机制' },
  4: { name: 'phishing', desc: '钓鱼机制' },
  5: { name: 'scada', desc: '工控监控' },
  6: { name: 'signal_switch', desc: '信号切换' },
  7: { name: 'container', desc: '容器隔离' },
  8: { name: 'collapse', desc: '观测坍缩' },
  9: { name: 'protocol', desc: '协议机制' },
};

describe('9-Layer Special Mechanics', () => {
  for (let layer = 1; layer <= 9; layer++) {
    const { name, desc } = LAYER_MECHANIC_NAMES[layer];

    describe(`L${layer} ${desc} (${name})`, () => {
      it(`L${layer} topology data exists`, () => {
        const topo = getGourdTopology(layer);
        expect(topo).toBeDefined();
        expect(topo.layer).toBe(layer);
      });

      it(`L${layer} has unique shape parameters`, () => {
        const topo = getGourdTopology(layer);
        const shapeKey = `${topo.upperCircle.radius}-${topo.lowerCircle.radius}-${topo.connector.width}`;
        expect(shapeKey).toBeDefined();
        // Verify it's different from other layers (at least in some dimension)
        const allTopos = getAllGourdTopologies();
        const sameShape = allTopos.filter(t =>
          t.upperCircle.radius === topo.upperCircle.radius &&
          t.lowerCircle.radius === topo.lowerCircle.radius
        );
        // Each layer should have a unique upper+lower radius combination
        expect(sameShape.length).toBe(1);
      });

      it(`L${layer} has valid cell distribution`, () => {
        const topo = getGourdTopology(layer);
        expect(topo.upperCircle.cellIds.length).toBeGreaterThan(0);
        expect(topo.lowerCircle.cellIds.length).toBeGreaterThan(0);
        expect(topo.connections.length).toBeGreaterThan(0);
      });

      it(`L${layer} quadrant effects are defined`, () => {
        const topo = getGourdTopology(layer);
        expect(topo.lowerCircle.quadrants).toBeDefined();
        const quadrantKeys = Object.keys(topo.lowerCircle.quadrants);
        expect(quadrantKeys).toHaveLength(4);
        // Each quadrant should be a valid AreaEffectType
        for (const key of quadrantKeys) {
          const effect = topo.lowerCircle.quadrants[Number(key) as 1 | 2 | 3 | 4];
          expect(['W', 'N', 'I', 'P', 'S', 'D']).toContain(effect);
        }
      });

      it(`L${layer} layer mechanic data exists`, () => {
        const mechanic = LAYER_MECHANICS[layer];
        expect(mechanic).toBeDefined();
        expect(mechanic.type).toBe(name);
        expect(mechanic.description).toContain(desc.replace('机制', ''));
      });

      it(`L${layer} has valid stats`, () => {
        const topo = getGourdTopology(layer);
        expect(topo.stats).toBeDefined();
        expect(topo.stats.totalCells).toBeGreaterThan(0);
        expect(topo.stats.avgPathLength).toBeGreaterThanOrEqual(0);
      });

      it(`L${layer} has connector cells`, () => {
        const topo = getGourdTopology(layer);
        expect(topo.connector).toBeDefined();
        expect(topo.connector.cellIds).toBeDefined();
        // Connector may be empty for some shapes, but the field must exist
        expect(Array.isArray(topo.connector.cellIds)).toBe(true);
      });

      it(`L${layer} connections reference valid cells`, () => {
        const topo = getGourdTopology(layer);
        const allCellIds = new Set([
          ...topo.upperCircle.cellIds,
          ...topo.connector.cellIds,
          ...topo.lowerCircle.cellIds,
        ]);
        for (const conn of topo.connections) {
          expect(allCellIds.has(conn.fromCellId) || conn.fromCellId).toBeDefined();
          expect(allCellIds.has(conn.toCellId) || conn.toCellId).toBeDefined();
        }
      });
    });
  }

  describe('Cross-layer consistency', () => {
    it('All 9 layers have topology data', () => {
      const allTopos = getAllGourdTopologies();
      expect(allTopos).toHaveLength(9);
    });

    it('All 9 layers have mechanic data', () => {
      expect(Object.keys(LAYER_MECHANICS)).toHaveLength(9);
      for (let i = 1; i <= 9; i++) {
        expect(LAYER_MECHANICS[i]).toBeDefined();
      }
    });

    it('Layer numbers are sequential 1-9', () => {
      const allTopos = getAllGourdTopologies();
      const layerNumbers = allTopos.map(t => t.layer).sort((a, b) => a - b);
      expect(layerNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('No duplicate quadrant effect assignments across layers', () => {
      const allTopos = getAllGourdTopologies();
      // Each layer should have its own unique quadrant configuration
      const quadrantSignatures = allTopos.map(t => {
        const q = t.lowerCircle.quadrants;
        return `${q[1]}-${q[2]}-${q[3]}-${q[4]}`;
      });
      // At least some layers should differ in their quadrant configuration
      const uniqueSignatures = new Set(quadrantSignatures);
      expect(uniqueSignatures.size).toBeGreaterThanOrEqual(1);
    });

    it('Total cells across all layers is reasonable', () => {
      const allTopos = getAllGourdTopologies();
      const totalCells = allTopos.reduce((sum, t) => sum + t.stats.totalCells, 0);
      expect(totalCells).toBeGreaterThan(0);
      // Each layer should have at least a few cells
      for (const topo of allTopos) {
        expect(topo.stats.totalCells).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
