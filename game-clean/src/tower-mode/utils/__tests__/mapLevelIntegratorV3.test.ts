import { describe, it, expect } from 'vitest';
import { MapLevelIntegratorV2, preassembleAllLayersV3 } from '../mapLevelIntegratorV2';
import { LevelAssignmentAlgorithm } from '../../algorithms/levelAssignment';
import { LEVEL_POOL_BY_LAYER } from '../../data/levelPool';
import { LAYER_01_DATA, LAYER_06_DATA, LAYER_08_DATA, LAYER_09_DATA } from '../../data';

describe('MapLevelIntegratorV3', () => {
  const v2 = new MapLevelIntegratorV2();
  const algorithm = new LevelAssignmentAlgorithm();

  it('L1 输出含 layerMechanic.type=acceleration', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopologyV3(LAYER_01_DATA, assignment, vd);

    expect(result.layerMechanic).toBeDefined();
    expect(result.layerMechanic.type).toBe('acceleration');
  });

  it('L1 输出含 layerTheme.name=病毒实验室', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopologyV3(LAYER_01_DATA, assignment, vd);

    expect(result.layerTheme).toBeDefined();
    expect(result.layerTheme.name).toBe('病毒实验室');
    expect(result.layerTheme.theme).toBe('virus');
    expect(result.layerTheme.icon).toBe('🧪');
    expect(result.layerTheme.colorScheme).toBeDefined();
    expect(result.layerTheme.featureTags.length).toBeGreaterThan(0);
  });

  it('L1 cellInfoMap 包含所有格子', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopologyV3(LAYER_01_DATA, assignment, vd);

    expect(result.cellInfoMap.size).toBeGreaterThan(0);

    const startInfo = result.cellInfoMap.get(LAYER_01_DATA.startCellId);
    if (startInfo) {
      expect(startInfo.canSkip).toBe(false);
    }

    const bossInfo = result.cellInfoMap.get(LAYER_01_DATA.bossCellId);
    if (bossInfo) {
      expect(bossInfo.canEnter).toBe(false);
      expect(bossInfo.canSkip).toBe(false);
      expect(bossInfo.difficultyStars).toBe(5);
    }
  });

  it('L6 输出含 hexAdjacency', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_06_DATA, LEVEL_POOL_BY_LAYER[6]);
    const vd = v2.createDefaultVisualData(6);
    const result = v2.assembleFullTopologyV3(LAYER_06_DATA, assignment, vd);

    expect(result.hexAdjacency).toBeDefined();
    expect(result.hexAdjacency!.size).toBeGreaterThan(0);
  });

  it('L8 输出含 hiddenPaths', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_08_DATA, LEVEL_POOL_BY_LAYER[8]);
    const vd = v2.createDefaultVisualData(8);
    const result = v2.assembleFullTopologyV3(LAYER_08_DATA, assignment, vd);

    expect(result.hiddenPaths).toBeDefined();
    expect(result.hiddenPaths!.length).toBeGreaterThan(0);
    for (const hp of result.hiddenPaths!) {
      expect(hp.from).toBeTruthy();
      expect(hp.to).toBeTruthy();
      expect(typeof hp.locked).toBe('boolean');
    }
  });

  it('L9 输出含 protocolSequence', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_09_DATA, LEVEL_POOL_BY_LAYER[9]);
    const vd = v2.createDefaultVisualData(9);
    const result = v2.assembleFullTopologyV3(LAYER_09_DATA, assignment, vd);

    expect(result.protocolSequence).toBeDefined();
    expect(result.protocolSequence!.length).toBeGreaterThan(0);
  });

  it('preassembleAllLayersV3 返回9层', () => {
    const cache = preassembleAllLayersV3();
    expect(cache.size).toBe(9);

    for (let i = 1; i <= 9; i++) {
      expect(cache.has(i)).toBe(true);
      const topology = cache.get(i)!;
      expect(topology.layerTheme).toBeDefined();
      expect(topology.layerMechanic).toBeDefined();
      expect(topology.cellInfoMap.size).toBeGreaterThan(0);
    }
  });

  it('V3 包含 V2 的所有字段', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopologyV3(LAYER_01_DATA, assignment, vd);

    expect(result.gourdShape).toBeDefined();
    expect(result.svgPaths).toBeDefined();
    expect(result.visualConfig).toBeDefined();
    expect(result.border).toBeDefined();
    expect(result.quadrantLabels).toBeDefined();
    expect(result.cellVisualStyles).toBeDefined();
    expect(result.assignedLevels).toBeDefined();
    expect(result.bossConfig).toBeDefined();
    expect(result.difficultyGradient).toBeDefined();
    expect(result.decorations).toBeDefined();
  });
});
