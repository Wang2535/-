import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapFlipEngine } from '../mapFlipEngine';
import type { TowerLayerData, GameCell, ZoneType } from '../types';

function createMockTopology(overrides?: Partial<TowerLayerData>): TowerLayerData {
  const cells: GameCell[] = [
    { id: 'start', coordinate: [0, 0], type: 'start', state: 'unlocked' },
    { id: 'battle_1', coordinate: [0, 1], type: 'battle', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false },
    { id: 'chance_1', coordinate: [0, 2], type: 'chance', state: 'unlocked', eventPoolIds: ['pool1'], currentVisitCount: 0 },
    { id: 'bookstore_1', coordinate: [0, 3], type: 'bookstore', state: 'unlocked', bookPoolTheme: 'virus', bookCountPerVisit: 2 },
    { id: 'skill_1', coordinate: [0, 4], type: 'skill', state: 'unlocked', tierProbabilityTable: { common: 0.5, good: 0.3, rare: 0.15, epic: 0.04, legendary: 0.01 }, maxSkillSlots: 3 },
    { id: 'boss_1', coordinate: [0, 5], type: 'boss', state: 'locked', bossLevelId: 'boss_lv1', isDefeated: false, enhancementLevel: 1, dataPacketPoolIds: ['dp1'], layerNumber: 1 },
    { id: 'end_1', coordinate: [0, 6], type: 'end', state: 'locked', destinationLayer: 2 },
    { id: 'chance_2', coordinate: [1, 0], type: 'chance', state: 'unlocked', eventPoolIds: ['pool2'], currentVisitCount: 0, zone: 'I' as ZoneType },
    { id: 'bookstore_2', coordinate: [1, 1], type: 'bookstore', state: 'unlocked', bookPoolTheme: 'network', bookCountPerVisit: 2 },
    { id: 'skill_2', coordinate: [1, 2], type: 'skill', state: 'unlocked', tierProbabilityTable: { common: 0.5, good: 0.3, rare: 0.15, epic: 0.04, legendary: 0.01 }, maxSkillSlots: 3 },
  ];

  const cellIndex: Record<string, GameCell> = {};
  for (const cell of cells) cellIndex[cell.id] = cell;

  return {
    layerNumber: 1,
    themeId: 'virus',
    shapeType: 'linear',
    shapeDescription: 'test',
    gridSize: { rows: 2, cols: 7 },
    totalCells: cells.length,
    cells,
    cellIndex,
    paths: [],
    adjacencyList: { start: ['battle_1'], battle_1: ['start', 'chance_1'], chance_1: ['battle_1', 'bookstore_1'], bookstore_1: ['chance_1', 'skill_1'], skill_1: ['bookstore_1', 'boss_1'], boss_1: ['skill_1', 'end_1'], end_1: ['boss_1'] },
    zones: [],
    zoneIndex: {} as any,
    startCellId: 'start',
    bossCellId: 'boss_1',
    endCellId: 'end_1',
    colorScheme: { primary: '#000', secondary: '#111', accent: '#222', background: '#333', pathColor: '#444', zoneColors: { W: '#fff', N: '#fff', I: '#fff', P: '#fff', S: '#fff', D: '#fff' } },
    ambientConfig: { lighting: 'normal', atmosphere: 'normal', particleEffects: [] },
    ...overrides,
  };
}

describe('MapFlipEngine', () => {
  let engine: MapFlipEngine;

  beforeEach(() => {
    engine = new MapFlipEngine();
  });

  describe('shouldTriggerFlip', () => {
    it('通关�?=3且翻转次�?3时返回true', () => {
      const topology = createMockTopology();
      expect(engine.shouldTriggerFlip(topology, 3)).toBe(true);
      expect(engine.shouldTriggerFlip(topology, 5)).toBe(true);
    });

    it('通关�?3时返回false', () => {
      const topology = createMockTopology();
      expect(engine.shouldTriggerFlip(topology, 0)).toBe(false);
      expect(engine.shouldTriggerFlip(topology, 2)).toBe(false);
    });

    it('翻转次数达到3次上限时返回false', () => {
      const topology = createMockTopology();
      engine.executeFlip(topology);
      engine.executeFlip(topology);
      engine.executeFlip(topology);
      expect(engine.getFlipCount()).toBe(3);
      expect(engine.shouldTriggerFlip(topology, 5)).toBe(false);
    });
  });

  describe('selectCellsToConvert', () => {
    it('排除battle/boss/start/end类型的格�?, () => {
      const topology = createMockTopology();
      const selected = engine.selectCellsToConvert(topology, { min: 2, max: 5 }, () => 0.5);
      for (const cell of selected) {
        expect(['battle', 'boss', 'start', 'end']).not.toContain(cell.type);
      }
    });

    it('排除locked状态的格子', () => {
      const topology = createMockTopology();
      const selected = engine.selectCellsToConvert(topology, { min: 2, max: 5 }, () => 0.5);
      for (const cell of selected) {
        expect(cell.state).not.toBe('locked');
      }
    });

    it('排除I区格�?, () => {
      const topology = createMockTopology();
      const selected = engine.selectCellsToConvert(topology, { min: 2, max: 5 }, () => 0.5);
      for (const cell of selected) {
        expect(cell.zone).not.toBe('I');
      }
    });

    it('使用rng参数确保确定�?, () => {
      const topology = createMockTopology();
      const result1 = engine.selectCellsToConvert(topology, { min: 2, max: 5 }, () => 0.3);
      const result2 = engine.selectCellsToConvert(topology, { min: 2, max: 5 }, () => 0.3);
      expect(result1.map(c => c.id)).toEqual(result2.map(c => c.id));
    });
  });

  describe('executeFlip', () => {
    it('成功执行翻转并返回FlipResult', () => {
      const topology = createMockTopology();
      const result = engine.executeFlip(topology);
      expect(result.flipped).toBe(true);
      expect(result.flipCount).toBe(1);
      expect(result.maxFlipsReached).toBe(false);
      expect(result.convertedCells.length).toBeGreaterThanOrEqual(0);
      expect(result.message).toContain('地图翻转完成');
    });

    it('翻转达到3次上限后不再翻转', () => {
      const topology = createMockTopology();
      engine.executeFlip(topology);
      engine.executeFlip(topology);
      engine.executeFlip(topology);
      const result = engine.executeFlip(topology);
      expect(result.flipped).toBe(false);
      expect(result.maxFlipsReached).toBe(true);
    });

    it('翻转后新拓扑中转换的格子变为battle类型', () => {
      const topology = createMockTopology();
      const result = engine.executeFlip(topology);
      if (result.convertedCells.length > 0) {
        for (const cell of result.convertedCells) {
          expect(cell.type).toBe('battle');
        }
      }
    });

    it('翻转后新拓扑的cellIndex已更�?, () => {
      const topology = createMockTopology();
      const result = engine.executeFlip(topology);
      for (const cell of result.convertedCells) {
        expect(result.newTopology.cellIndex[cell.id].type).toBe('battle');
      }
    });
  });

  describe('checkTeleportUnlock', () => {
    it('通关�?=6时解锁瞬�?, () => {
      expect(engine.checkTeleportUnlock(6)).toBe(true);
      expect(engine.isTeleportUnlocked()).toBe(true);
    });

    it('通关�?6时不解锁', () => {
      expect(engine.checkTeleportUnlock(5)).toBe(false);
      expect(engine.isTeleportUnlocked()).toBe(false);
    });

    it('通关�?0时不解锁', () => {
      expect(engine.checkTeleportUnlock(0)).toBe(false);
    });
  });

  describe('reset', () => {
    it('重置翻转计数和瞬移状�?, () => {
      const topology = createMockTopology();
      engine.executeFlip(topology);
      engine.checkTeleportUnlock(6);
      engine.reset();
      expect(engine.getFlipCount()).toBe(0);
      expect(engine.isTeleportUnlocked()).toBe(false);
    });
  });
});
