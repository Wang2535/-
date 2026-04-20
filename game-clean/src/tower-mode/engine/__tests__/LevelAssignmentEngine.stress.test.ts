import { describe, it, expect, beforeEach } from 'vitest';
import { LevelAssignmentEngine } from '../LevelAssignmentEngine';
import { createMockLevelDatabase, getRealLayerConfigs, deepEqual, runAssignmentWithSeed } from './testHelpers';

describe('LevelAssignmentEngine - Stress Tests', () => {
  let engine: LevelAssignmentEngine;
  let mockDb: any[];
  let realConfigs: any[];

  beforeEach(() => {
    engine = new LevelAssignmentEngine(12345);
    mockDb = createMockLevelDatabase();
    realConfigs = getRealLayerConfigs();
  });

  function getTotalBattleCells(): number {
    return realConfigs.reduce((sum, c) => sum + c.battleCellIds.length, 0);
  }

  it('完整9层分配应成功且无重复', () => {
    const expectedTotal = getTotalBattleCells();

    engine.initializePools(mockDb);
    const result = engine.assignAllLayers(realConfigs);

    expect(result.validationPassed).toBe(true);
    expect(result.totalAssigned).toBe(expectedTotal);
    expect(result.layers[1].battleCellAssignments).toBeDefined();
    expect(result.layers[9].bossAssignment).toBeDefined();

    console.log(`[Stress] Total battle cells: ${expectedTotal}, assigned: ${result.totalAssigned}, spare: ${result.totalSpare}`);
  });

  it('连续20次随机分配均应成�?, () => {
    const expectedTotal = getTotalBattleCells();
    let successCount = 0;
    const totalTests = 20;

    for (let seed = 1; seed <= totalTests; seed++) {
      try {
        const testEngine = new LevelAssignmentEngine(seed);
        testEngine.initializePools(mockDb);
        const result = testEngine.assignAllLayers(realConfigs);

        if (result.validationPassed && result.totalAssigned === expectedTotal) {
          successCount++;
        }
      } catch (error) {
        console.error(`Seed ${seed} failed:`, error);
      }
    }

    const successRate = (successCount / totalTests) * 100;
    expect(successRate).toBe(100);

    console.log(`[Stress] ${totalTests}/${totalTests} assignments succeeded (100%), expectedTotal=${expectedTotal}`);
  });

  it('不同种子应产生不同结�?, () => {
    const result1 = runAssignmentWithSeed(1, realConfigs);
    const result2 = runAssignmentWithSeed(2, realConfigs);
    const result3 = runAssignmentWithSeed(3, realConfigs);

    let differentCount = 0;
    const totalComparisons = 3;

    if (!deepEqual(result1, result2)) differentCount++;
    if (!deepEqual(result1, result3)) differentCount++;
    if (!deepEqual(result2, result3)) differentCount++;

    const diffRate = (differentCount / totalComparisons) * 100;
    expect(diffRate).toBeGreaterThan(50);

    console.log(`[Stress] Different results rate: ${diffRate}% (${differentCount}/${totalComparisons})`);
  });

  it('每层战斗格分配数量诊�?, () => {
    console.log('[Stress] Per-layer battle cell count:');
    for (const config of realConfigs) {
      console.log(`  Layer ${config.layerNumber}: ${config.battleCellIds.length} battle cells`);
    }
    console.log(`[Stress] Total: ${getTotalBattleCells()} battle cells across 9 layers`);

    expect(getTotalBattleCells()).toBeGreaterThan(0);
  });
});
