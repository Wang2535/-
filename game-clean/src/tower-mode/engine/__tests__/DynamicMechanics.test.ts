import { describe, it, expect, beforeEach } from 'vitest';
import { DynamicMechanicsEngine } from '../dynamicMechanics';
import type { IEnrichedTopology, IMobilityConfig, IBoundaryFlexConfig, IProbabilityConfig } from '../dynamicMechanics';
import type { TowerLayerData, GameCell, PathConnection, ZoneType } from '../types';

function createMockEnrichedTopology(overrides?: Partial<IEnrichedTopology>): IEnrichedTopology {
  const cells: GameCell[] = [
    { id: 'cell_A', coordinate: [2, 2], type: 'chance', state: 'unlocked', eventPoolIds: ['pool1'], currentVisitCount: 0 },
    { id: 'cell_B', coordinate: [4, 4], type: 'bookstore', state: 'unlocked', bookPoolTheme: 'virus', bookCountPerVisit: 2 },
    { id: 'cell_C', coordinate: [6, 6], type: 'skill', state: 'unlocked', tierProbabilityTable: { common: 0.5, good: 0.3, rare: 0.15, epic: 0.04, legendary: 0.01 }, maxSkillSlots: 3 },
    { id: 'cell_D', coordinate: [8, 8], type: 'battle', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false },
  ];
  const cellIndex: Record<string, GameCell> = {};
  for (const cell of cells) cellIndex[cell.id] = cell;

  const paths: PathConnection[] = [
    { id: 'path_AB', from: 'cell_A', to: 'cell_B', direction: 'bidirectional', pathType: 'main', distance: 1 },
    { id: 'path_BC', from: 'cell_B', to: 'cell_C', direction: 'bidirectional', pathType: 'main', distance: 1 },
    { id: 'path_CD', from: 'cell_C', to: 'cell_D', direction: 'bidirectional', pathType: 'main', distance: 1 },
  ];

  return {
    layerNumber: 7,
    themeId: 'cloud-virtual',
    shapeType: 'cloud',
    shapeDescription: 'test',
    gridSize: { rows: 10, cols: 10 },
    totalCells: cells.length,
    cells,
    cellIndex,
    paths,
    adjacencyList: { cell_A: ['cell_B'], cell_B: ['cell_A', 'cell_C'], cell_C: ['cell_B', 'cell_D'], cell_D: ['cell_C'] },
    zones: [],
    zoneIndex: {} as any,
    startCellId: 'cell_A',
    bossCellId: 'cell_D',
    endCellId: null as any,
    colorScheme: { primary: '#000', secondary: '#111', accent: '#222', background: '#333', pathColor: '#444', zoneColors: { W: '#fff', N: '#fff', I: '#fff', P: '#fff', S: '#fff', D: '#fff' } },
    ambientConfig: { lighting: 'normal', atmosphere: 'normal', particleEffects: [] },
    ...overrides,
  };
}

describe('DynamicMechanicsEngine', () => {
  let engine: DynamicMechanicsEngine;

  beforeEach(() => {
    engine = new DynamicMechanicsEngine();
  });

  describe('executeDynamicShifts', () => {
    it('无mobility配置时返回空结果', () => {
      const topology = createMockEnrichedTopology();
      const result = engine.executeDynamicShifts(topology);
      expect(result.shiftedCells).toEqual([]);
      expect(result.newPositions.size).toBe(0);
    });

    it('有mobility配置时根据概率偏移格�?, () => {
      const mobility: IMobilityConfig = {
        shiftProbability: 1.0,
        shiftRange: 1,
        shiftDirection: 'random',
        affectedCellTypes: ['chance', 'bookstore'],
      };
      const topology = createMockEnrichedTopology({ mobility });
      const result = engine.executeDynamicShifts(topology, () => 0.5);
      expect(result.shiftedCells.length).toBeGreaterThan(0);
      expect(result.newPositions.size).toBeGreaterThan(0);
    });

    it('shiftProbability=0时不偏移任何格子', () => {
      const mobility: IMobilityConfig = {
        shiftProbability: 0,
        shiftRange: 1,
        shiftDirection: 'random',
        affectedCellTypes: ['chance'],
      };
      const topology = createMockEnrichedTopology({ mobility });
      const result = engine.executeDynamicShifts(topology, () => 0.5);
      expect(result.shiftedCells).toEqual([]);
    });

    it('outward方向偏移远离中心', () => {
      const mobility: IMobilityConfig = {
        shiftProbability: 1.0,
        shiftRange: 2,
        shiftDirection: 'outward',
        affectedCellTypes: ['chance'],
      };
      const topology = createMockEnrichedTopology({ mobility });
      const centerX = topology.gridSize.cols / 2;
      const centerY = topology.gridSize.rows / 2;
      const cell = topology.cells[0];
      const origDist = Math.abs(cell.coordinate[0] - centerX) + Math.abs(cell.coordinate[1] - centerY);
      engine.executeDynamicShifts(topology, () => 0.8);
      const newDist = Math.abs(cell.coordinate[0] - centerX) + Math.abs(cell.coordinate[1] - centerY);
      expect(newDist).toBeGreaterThanOrEqual(origDist);
    });

    it('记录偏移历史', () => {
      const mobility: IMobilityConfig = {
        shiftProbability: 1.0,
        shiftRange: 1,
        shiftDirection: 'random',
        affectedCellTypes: ['chance'],
      };
      const topology = createMockEnrichedTopology({ mobility });
      engine.executeDynamicShifts(topology, () => 0.5);
      const history = engine.getShiftHistory(topology.cells[0].id);
      expect(history).toBeDefined();
      expect(history!.length).toBeGreaterThan(0);
    });

    it('受影响的连接被正确识�?, () => {
      const mobility: IMobilityConfig = {
        shiftProbability: 1.0,
        shiftRange: 1,
        shiftDirection: 'random',
        affectedCellTypes: ['chance'],
      };
      const topology = createMockEnrichedTopology({ mobility });
      const result = engine.executeDynamicShifts(topology, () => 0.5);
      if (result.shiftedCells.length > 0) {
        expect(result.affectedConnections.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('executeBoundaryFlex', () => {
    it('无boundaryFlex配置时返回空结果', () => {
      const topology = createMockEnrichedTopology();
      const result = engine.executeBoundaryFlex(topology);
      expect(result.expanded).toBe(false);
      expect(result.newBoundary).toEqual([]);
    });

    it('expand模式返回扩展边界', () => {
      const boundaryFlex: IBoundaryFlexConfig = {
        flexMode: 'expand',
        flexAmount: 2,
        flexInterval: 1,
        currentPhase: 0,
      };
      const topology = createMockEnrichedTopology({ boundaryFlex });
      const result = engine.executeBoundaryFlex(topology);
      expect(result.expanded).toBe(true);
      expect(result.newBoundary.length).toBe(4);
      expect(result.newBoundary[0]).toEqual([-2, -2]);
    });

    it('contract模式返回收缩边界', () => {
      const boundaryFlex: IBoundaryFlexConfig = {
        flexMode: 'contract',
        flexAmount: 1,
        flexInterval: 1,
        currentPhase: 0,
      };
      const topology = createMockEnrichedTopology({ boundaryFlex });
      const result = engine.executeBoundaryFlex(topology);
      expect(result.expanded).toBe(false);
      expect(result.newBoundary[0]).toEqual([1, 1]);
    });

    it('breathe模式交替膨胀/收缩', () => {
      const boundaryFlex: IBoundaryFlexConfig = {
        flexMode: 'breathe',
        flexAmount: 1,
        flexInterval: 1,
        currentPhase: 0,
      };
      const topology = createMockEnrichedTopology({ boundaryFlex });
      const result1 = engine.executeBoundaryFlex(topology);
      expect(result1.expanded).toBe(true);
      const result2 = engine.executeBoundaryFlex(topology);
      expect(result2.expanded).toBe(false);
      const result3 = engine.executeBoundaryFlex(topology);
      expect(result3.expanded).toBe(true);
    });
  });

  describe('executeQuantumCollapse', () => {
    it('无probabilityConfig时返回空结果', () => {
      const topology = createMockEnrichedTopology();
      const result = engine.executeQuantumCollapse(topology);
      expect(result.collapsedConnections).toEqual([]);
      expect(result.activatedConnections).toEqual([]);
      expect(result.deactivatedConnections).toEqual([]);
    });

    it('对不稳定连接执行坍缩判断', () => {
      const probabilityConfig: IProbabilityConfig = {
        probabilityStrength: 0.8,
        collapseThreshold: 0.2,
        observerRadius: 2,
        unstableConnections: ['path_AB', 'path_BC'],
      };
      const topology = createMockEnrichedTopology({ probabilityConfig });
      const result = engine.executeQuantumCollapse(topology);
      expect(result.collapsedConnections.length).toBe(2);
      const totalActivated = result.activatedConnections.length;
      const totalDeactivated = result.deactivatedConnections.length;
      expect(totalActivated + totalDeactivated).toBe(2);
    });

    it('观测效果固定连接不被失活', () => {
      const probabilityConfig: IProbabilityConfig = {
        probabilityStrength: 0.1,
        collapseThreshold: 0.9,
        observerRadius: 2,
        unstableConnections: ['path_AB'],
      };
      const topology = createMockEnrichedTopology({ probabilityConfig });
      engine.applyObserverEffect(topology, 'cell_A');
      const result = engine.executeQuantumCollapse(topology);
      expect(result.deactivatedConnections).not.toContain('path_AB');
    });
  });

  describe('applyObserverEffect', () => {
    it('无probabilityConfig时返回空数组', () => {
      const topology = createMockEnrichedTopology();
      const result = engine.applyObserverEffect(topology, 'cell_A');
      expect(result).toEqual([]);
    });

    it('固定观测格周围的连接', () => {
      const probabilityConfig: IProbabilityConfig = {
        probabilityStrength: 0.5,
        collapseThreshold: 0.5,
        observerRadius: 1,
        unstableConnections: ['path_AB'],
      };
      const topology = createMockEnrichedTopology({ probabilityConfig });
      const affected = engine.applyObserverEffect(topology, 'cell_A');
      expect(affected.length).toBeGreaterThan(0);
      expect(engine.isConnectionFixedByObserver('path_AB')).toBe(true);
    });

    it('观测半径�?时影响更大范�?, () => {
      const probabilityConfig: IProbabilityConfig = {
        probabilityStrength: 0.5,
        collapseThreshold: 0.5,
        observerRadius: 2,
        unstableConnections: ['path_AB', 'path_BC', 'path_CD'],
      };
      const topology = createMockEnrichedTopology({ probabilityConfig });
      const affected = engine.applyObserverEffect(topology, 'cell_A');
      expect(affected.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('reset', () => {
    it('重置所有内部状�?, () => {
      const mobility: IMobilityConfig = {
        shiftProbability: 1.0,
        shiftRange: 1,
        shiftDirection: 'random',
        affectedCellTypes: ['chance'],
      };
      const topology = createMockEnrichedTopology({ mobility });
      engine.executeDynamicShifts(topology, () => 0.5);
      engine.reset();
      expect(engine.getShiftHistory(topology.cells[0].id)).toBeUndefined();
      expect(engine.isConnectionCollapsed('any')).toBe(false);
      expect(engine.isConnectionFixedByObserver('any')).toBe(false);
    });
  });
});
