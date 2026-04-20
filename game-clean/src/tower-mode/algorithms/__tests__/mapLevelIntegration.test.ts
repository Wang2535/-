import { describe, it, expect } from 'vitest';
import { MapLevelIntegrator } from '../../utils/mapLevelIntegration';
import { LevelAssignmentAlgorithm } from '../levelAssignment';
import { LEVEL_POOL_BY_LAYER } from '../../data/levelPool';
import { LAYER_01_DATA, LAYER_09_DATA } from '../../data';
import type { EnrichedTopology } from '../../types';

describe('MapLevelIntegrator', () => {
  const integrator = new MapLevelIntegrator();
  const algorithm = new LevelAssignmentAlgorithm();

  it('integrateLevelsToTopology 应返回 EnrichedTopology', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const enriched = integrator.integrateLevelsToTopology(LAYER_01_DATA, assignment);

    expect(enriched.assignedLevels).toBeInstanceOf(Map);
    expect(enriched.assignedLevels.size).toBeGreaterThan(0);
    expect(enriched.bossConfig).toBeDefined();
    expect(enriched.bossConfig.bossCellId).toBe(LAYER_01_DATA.bossCellId);
    expect(enriched.difficultyGradient).toBeDefined();
    expect(enriched.assignmentMeta).toBeDefined();
    expect(enriched.assignmentMeta.algorithm).toBe('LevelAssignmentAlgorithm');
  });

  it('EnrichedTopology 应保留原始拓扑数据', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const enriched = integrator.integrateLevelsToTopology(LAYER_01_DATA, assignment);

    expect(enriched.layerNumber).toBe(LAYER_01_DATA.layerNumber);
    expect(enriched.cells.length).toBe(LAYER_01_DATA.cells.length);
    expect(enriched.startCellId).toBe(LAYER_01_DATA.startCellId);
    expect(enriched.bossCellId).toBe(LAYER_01_DATA.bossCellId);
  });

  it('不修改原始裸拓扑', () => {
    const originalCells = [...LAYER_01_DATA.cells];
    const originalPaths = [...LAYER_01_DATA.paths];

    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    integrator.integrateLevelsToTopology(LAYER_01_DATA, assignment);

    expect(LAYER_01_DATA.cells.length).toBe(originalCells.length);
    expect(LAYER_01_DATA.paths.length).toBe(originalPaths.length);
  });

  it('validateAssignment 对合法分配返回 valid=true', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const result = integrator.validateAssignment(assignment);

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('validateAssignment 对非法分配返回 issues', () => {
    const result = integrator.validateAssignment({
      layer: 0,
      assignedLevels: new Map(),
      bossCandidatePool: [],
      selectedBossPrototype: null as any,
      generatedBoss: null as any,
      difficultyGradient: { mainPath: [], branchPaths: [], eliteCellIds: [] },
    });

    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('bossConfig.unlockCondition.requiredClearedCount 等于战斗格数', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const enriched = integrator.integrateLevelsToTopology(LAYER_01_DATA, assignment);

    const battleCellCount = LAYER_01_DATA.cells.filter(c => c.type === 'battle').length;
    expect(enriched.bossConfig.unlockCondition.requiredClearedCount).toBe(battleCellCount);
    expect(enriched.bossConfig.unlockCondition.currentClearedCount).toBe(0);
  });

  it('第9层也能正确对接', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_09_DATA, LEVEL_POOL_BY_LAYER[9]);
    const enriched = integrator.integrateLevelsToTopology(LAYER_09_DATA, assignment);
    const validation = integrator.validateAssignment(assignment);

    expect(enriched.layerNumber).toBe(9);
    expect(enriched.assignedLevels.size).toBeGreaterThan(0);
    expect(validation.valid).toBe(true);
  });
});
