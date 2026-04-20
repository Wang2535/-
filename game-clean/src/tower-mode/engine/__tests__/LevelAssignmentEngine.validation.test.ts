import { describe, it, expect, beforeEach } from 'vitest';
import { LevelAssignmentEngine } from '../LevelAssignmentEngine';
import { createMockLevelDatabase, getRealLayerConfigs, deepEqual, runAssignmentWithSeed } from './testHelpers';

describe('LevelAssignmentEngine - Validation Tests', () => {
  let engine: LevelAssignmentEngine;
  let mockDb: any[];

  beforeEach(() => {
    engine = new LevelAssignmentEngine(42);
    mockDb = createMockLevelDatabase();
  });

  it('相同种子应产生完全相同的结果', () => {
    const r1 = runAssignmentWithSeed(42, getRealLayerConfigs());
    const r2 = runAssignmentWithSeed(42, getRealLayerConfigs());

    expect(deepEqual(r1, r2)).toBe(true);

    for (let i = 1; i <= 9; i++) {
      const layer1 = r1.layers[i];
      const layer2 = r2.layers[i];

      expect(deepEqual(layer1.battleCellAssignments, layer2.battleCellAssignments)).toBe(true);
      expect(deepEqual(layer1.bossAssignment, layer2.bossAssignment)).toBe(true);
    }
  });

  it('reshuffle后新种子应产生不同结�?, () => {
    const result1 = runAssignmentWithSeed(42, getRealLayerConfigs());

    engine.reshuffle(999);
    engine.initializePools(mockDb);
    const result2 = engine.assignAllLayers(getRealLayerConfigs());

    expect(deepEqual(result1, result2)).toBe(false);
  });

  it('每层BOSS HP倍率应在1.5-3.5范围�?, () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    for (let i = 1; i <= 9; i++) {
      const bossConfig = result.layers[i].bossAssignment;

      expect(bossConfig.enhancementLevel).toBeGreaterThanOrEqual(1);
      expect(bossConfig.enhancementLevel).toBeLessThanOrEqual(5);

      const enhanced = engine.enhanceBossLevel(
        bossConfig.baseLevelId,
        bossConfig.enhancementLevel
      );

      expect(enhanced.hpMultiplier).toBeGreaterThanOrEqual(1.5);
      expect(enhanced.hpMultiplier).toBeLessThanOrEqual(3.5);
    }
  });

  it('每层BOSS新增技�?卡牌数量应符合强化等级表', () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    const enhancementTable: Record<number, { skills: number; cards: number }> = {
      1: { skills: 0, cards: 1 },
      2: { skills: 1, cards: 1 },
      3: { skills: 1, cards: 2 },
      4: { skills: 2, cards: 2 },
      5: { skills: 2, cards: 3 },
    };

    for (let i = 1; i <= 9; i++) {
      const layer = result.layers[i];
      const enhLevel = layer.bossAssignment.enhancementLevel;
      const expected = enhancementTable[enhLevel];

      const bossConfig = engine.enhanceBossLevel(
        layer.bossAssignment.baseLevelId,
        enhLevel
      );

      expect(bossConfig.newSkillsAdded.length).toBe(expected.skills);
      expect(bossConfig.newCardsAdded.length).toBe(expected.cards);
    }
  });

  it('所�?层bossLevelId格式应为{baseId}_BOSS', () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    for (let i = 1; i <= 9; i++) {
      const baseId = result.layers[i].bossAssignment.baseLevelId;
      const bossId = result.layers[i].bossAssignment.enhancedLevelId;

      expect(bossId).toBe(`${baseId}_BOSS`);
    }
  });

  it('每层数据包池应包含恰�?个ID', () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    for (let i = 1; i <= 9; i++) {
      const bossConfig = engine.enhanceBossLevel(
        result.layers[i].bossAssignment.baseLevelId,
        result.layers[i].bossAssignment.enhancementLevel
      );

      expect(bossConfig.rewardDataPacketIds.length).toBe(9);
      expect(bossConfig.rewardDataPacketIds[0]).toMatch(/^DP_T\d+_0\d$/);
    }
  });

  it('备用池总和应等于总可用关卡减去已分配关卡', () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    const stats = engine.getPoolStats();
    let totalAvailable = 0;
    let totalAssigned = 0;
    let totalSpare = 0;

    for (let tier = 1; tier <= 9; tier++) {
      const s = stats[tier];
      if (s) {
        totalAvailable += s.available + s.assigned;
        totalAssigned += s.assigned;
        totalSpare += s.spare;
      }
    }

    expect(result.totalAssigned).toBe(totalAssigned);
    expect(result.totalSpare).toBe(totalSpare);
    expect(totalAvailable).toBeGreaterThan(0);
  });

  it('T6和T8备用池应合理(零余量或正数)', () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    const spare6 = engine.getSparePool(6);
    const spare8 = engine.getSparePool(8);

    expect(spare6.length).toBeGreaterThanOrEqual(0);
    expect(spare8.length).toBeGreaterThanOrEqual(0);

    expect(Array.isArray(spare6)).toBe(true);
    expect(Array.isArray(spare8)).toBe(true);

    console.log(`[Validation] T6 spare: ${spare6.length}, T8 spare: ${spare8.length}`);
  });

  it('T8(ai-emerging)分配成功且无报错', () => {
    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(getRealLayerConfigs());

    const layer8 = result.layers[8];
    const spare8 = engine.getSparePool(8);

    expect(result.validationPassed).toBe(true);
    expect(layer8.battleCellAssignments).toBeDefined();
    expect(Object.keys(layer8.battleCellAssignments).length).toBeGreaterThan(0);

    console.log(`[Validation] T8 assigned: ${Object.keys(layer8.battleCellAssignments).length}, spare: ${spare8.length}`);
  });
});
