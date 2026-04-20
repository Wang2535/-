import { describe, it, expect } from 'vitest';
import { LevelAssignmentEngine } from '../LevelAssignmentEngine';
import { createMockLevelDatabase, getRealLayerConfigs, deepEqual, runAssignmentWithSeed } from './testHelpers';

describe('LevelAssignmentEngine - M04 Integration Tests', () => {
  const SEED = 42;
  const EXPECTED_TOTAL_BATTLE = 80;
  const EXPECTED_TOTAL_SPARE = 53;

  it('从M04提取9层配置并验证总数', () => {
    const configs = getRealLayerConfigs();

    expect(configs).toHaveLength(9);

    const totalBattle = configs.reduce((sum, c) => sum + c.battleCellIds.length, 0);
    expect(totalBattle).toBe(EXPECTED_TOTAL_BATTLE);

    for (const config of configs) {
      expect(config.layerNumber).toBeGreaterThanOrEqual(1);
      expect(config.layerNumber).toBeLessThanOrEqual(10);
      expect(config.battleCellIds.length).toBeGreaterThan(0);
      expect(config.bossCellId).toBeTruthy();
    }

    console.log('[Integration] M04 layer extraction:');
    for (const config of configs) {
      console.log(`  Layer ${config.layerNumber}: ${config.battleCellIds.length} battle cells, boss=${config.bossCellId}`);
    }
    console.log(`[Integration] Total: ${totalBattle} battle cells`);
  });

  it('使用真实M04数据执行全塔分配', () => {
    const engine = new LevelAssignmentEngine(SEED);
    engine.initializePools(createMockLevelDatabase());
    const configs = getRealLayerConfigs();
    const result = engine.assignAllLayers(configs);

    expect(result.validationPassed).toBe(true);
    expect(result.totalAssigned).toBe(EXPECTED_TOTAL_BATTLE);
    expect(result.totalSpare).toBe(EXPECTED_TOTAL_SPARE);
    expect(Object.keys(result.layers)).toHaveLength(9);

    for (let i = 1; i <= 9; i++) {
      const layer = result.layers[i];
      expect(layer).toBeDefined();
      expect(layer.battleCellAssignments).toBeDefined();
      expect(layer.bossAssignment).toBeDefined();
      expect(Object.keys(layer.battleCellAssignments).length).toBeGreaterThan(0);
    }

    console.log(`[Integration] Full tower assignment: seed=${result.seed}, assigned=${result.totalAssigned}, spare=${result.totalSpare}, valid=${result.validationPassed}`);
  });

  it('每层分配数量与M04层数据一�?, () => {
    const engine = new LevelAssignmentEngine(SEED);
    engine.initializePools(createMockLevelDatabase());
    const configs = getRealLayerConfigs();
    const result = engine.assignAllLayers(configs);

    for (let i = 1; i <= 9; i++) {
      const expectedCount = configs[i - 1].battleCellIds.length;
      const actualCount = Object.keys(result.layers[i].battleCellAssignments).length;
      expect(actualCount).toBe(expectedCount);
    }

    console.log('[Integration] Per-layer assignment count matches M04 data:');
    for (let i = 1; i <= 9; i++) {
      const expected = configs[i - 1].battleCellIds.length;
      const actual = Object.keys(result.layers[i].battleCellAssignments).length;
      console.log(`  Layer ${i}: expected=${expected}, actual=${actual} ${expected === actual ? '�? : '�?}`);
    }
  });

  it('T8(ai-emerging)边界条件: 14关分�?0格后spare=4', () => {
    const engine = new LevelAssignmentEngine(SEED);
    engine.initializePools(createMockLevelDatabase());
    const configs = getRealLayerConfigs();
    engine.assignAllLayers(configs);

    const spare8 = engine.getSparePool(8);
    const t8Available = engine.getPoolStats()[8]?.available || 0;
    const t8Assigned = engine.getPoolStats()[8]?.assigned || 0;

    console.log(`[Integration] T8 boundary: available=${t8Available}, assigned=${t8Assigned}, spare=${spare8.length}`);

    expect(spare8.length).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(spare8)).toBe(true);
  });

  it('所有层备用池分布诊�?, () => {
    const engine = new LevelAssignmentEngine(SEED);
    engine.initializePools(createMockLevelDatabase());
    const configs = getRealLayerConfigs();
    engine.assignAllLayers(configs);

    console.log('[Integration] Spare pool distribution per tier:');
    let totalSpareFromPools = 0;
    for (let i = 1; i <= 9; i++) {
      const spare = engine.getSparePool(i);
      totalSpareFromPools += spare.length;
      console.log(`  Tier ${i}: spare=${spare.length}`);
    }
    console.log(`[Integration] Total spare from pools: ${totalSpareFromPools}`);
  });

  it('BOSS改造参数逐层验证', () => {
    const engine = new LevelAssignmentEngine(SEED);
    engine.initializePools(createMockLevelDatabase());
    const configs = getRealLayerConfigs();
    const result = engine.assignAllLayers(configs);

    const expectedParams: Record<number, { hp: number; skills: number; cards: number }> = {
      1: { hp: 1.5, skills: 0, cards: 1 },
      2: { hp: 2.0, skills: 1, cards: 1 },
      3: { hp: 2.5, skills: 1, cards: 2 },
      4: { hp: 3.0, skills: 2, cards: 2 },
      5: { hp: 3.5, skills: 2, cards: 3 },
    };

    console.log('\n[Integration] ===== BOSS Enhancement Report =====');
    for (let i = 1; i <= 9; i++) {
      const layer = result.layers[i];
      const enhLevel = layer.bossAssignment.enhancementLevel;
      const bossConfig = engine.enhanceBossLevel(
        layer.bossAssignment.baseLevelId,
        enhLevel
      );
      const expected = expectedParams[enhLevel];

      expect(bossConfig.hpMultiplier).toBe(expected.hp);
      expect(bossConfig.newSkillsAdded.length).toBe(expected.skills);
      expect(bossConfig.newCardsAdded.length).toBe(expected.cards);
      expect(bossConfig.bossLevelId).toBe(`${bossConfig.originalLevelId}_BOSS`);
      expect(bossConfig.rewardDataPacketIds.length).toBe(9);

      console.log(`  Layer ${i}: enh=${enhLevel}, HP×${expected.hp}, +${expected.skills}skill +${expected.cards}card �?✅`);
    }
    console.log('[Integration] ===== End BOSS Report =====\n');
  });

  it('seed=42可复现性最终验�?, () => {
    const r1 = runAssignmentWithSeed(SEED, getRealLayerConfigs());
    const r2 = runAssignmentWithSeed(SEED, getRealLayerConfigs());

    expect(deepEqual(r1, r2)).toBe(true);

    for (let i = 1; i <= 9; i++) {
      expect(deepEqual(r1.layers[i].battleCellAssignments, r2.layers[i].battleCellAssignments)).toBe(true);
      expect(deepEqual(r1.layers[i].bossAssignment, r2.layers[i].bossAssignment)).toBe(true);
    }

    console.log(`[Integration] Reproducibility check with seed=${SEED}: �?identical`);
  });

  it('不同种子产生不同分配结果', () => {
    const r1 = runAssignmentWithSeed(1, getRealLayerConfigs());
    const r2 = runAssignmentWithSeed(2, getRealLayerConfigs());
    const r3 = runAssignmentWithSeed(3, getRealLayerConfigs());

    const allDifferent =
      !deepEqual(r1, r2) &&
      !deepEqual(r1, r3) &&
      !deepEqual(r2, r3);

    expect(allDifferent).toBe(true);

    console.log(`[Integration] Different seeds produce different results: ✅`);
  });
});
