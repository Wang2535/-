import { describe, it, expect } from 'vitest';
import { MapLevelIntegratorV2 } from '../mapLevelIntegratorV2';
import { MapLevelIntegrator } from '../mapLevelIntegration';
import { LevelAssignmentAlgorithm } from '../../algorithms/levelAssignment';
import { LEVEL_POOL_BY_LAYER } from '../../data/levelPool';
import { LAYER_01_DATA, LAYER_09_DATA } from '../../data';
import type { LayerVisualData } from '../../types';

describe('MapLevelIntegratorV2', () => {
  const v2 = new MapLevelIntegratorV2();
  const algorithm = new LevelAssignmentAlgorithm();

  it('assembleFullTopology 应返回 RenderableEnrichedTopology', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const visualData = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, visualData);

    expect(result.gourdShape).toBeDefined();
    expect(result.svgPaths).toBeDefined();
    expect(result.visualConfig).toBeDefined();
    expect(result.border).toBeDefined();
    expect(result.quadrantLabels).toBeDefined();
    expect(result.cellVisualStyles).toBeDefined();
    expect(result.stateVisualOverrides).toBeDefined();
    expect(result.pathVisualStyles).toBeDefined();
    expect(result.zoneBackgrounds).toBeDefined();
    expect(result.background).toBeDefined();
    expect(result.gourdCoordinates).toBeDefined();
  });

  it('关卡分配和Boss配置数据完整保留', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const visualData = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, visualData);

    expect(result.assignedLevels).toBeInstanceOf(Map);
    expect(result.assignedLevels.size).toBeGreaterThan(0);
    expect(result.bossConfig).toBeDefined();
    expect(result.bossConfig.bossCellId).toBe(LAYER_01_DATA.bossCellId);
    expect(result.bossConfig.generatedBoss).toBeDefined();
    expect(result.difficultyGradient).toBeDefined();
    expect(result.assignmentMeta).toBeDefined();
  });

  it('视觉数据正确复制', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const visualData = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, visualData);

    expect(result.border).toEqual(visualData.border);
    expect(result.quadrantLabels).toEqual(visualData.quadrantLabels);
    expect(result.background).toEqual(visualData.background);
    expect(result.gourdCoordinates).toEqual(visualData.gourdCoordinates);
  });

  it('SVG路径已生成', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const visualData = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, visualData);

    expect(result.svgPaths.outline).toBeTruthy();
    expect(typeof result.svgPaths.outline).toBe('string');
    expect(result.svgPaths.outline).toContain('M');
    expect(result.svgPaths.regions.length).toBeGreaterThan(0);
  });

  it('不修改原始裸拓扑', () => {
    const originalCells = [...LAYER_01_DATA.cells];
    const originalPaths = [...LAYER_01_DATA.paths];

    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const visualData = v2.createDefaultVisualData(1);
    v2.assembleFullTopology(LAYER_01_DATA, assignment, visualData);

    expect(LAYER_01_DATA.cells.length).toBe(originalCells.length);
    expect(LAYER_01_DATA.paths.length).toBe(originalPaths.length);
  });

  it('V1 MapLevelIntegrator 向后兼容', () => {
    const v1 = new MapLevelIntegrator();
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const result = v1.integrateLevelsToTopology(LAYER_01_DATA, assignment);

    expect(result.assignedLevels).toBeInstanceOf(Map);
    expect(result.bossConfig).toBeDefined();
    expect(result.assignmentMeta).toBeDefined();
  });

  it('第9层也能正确组装', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_09_DATA, LEVEL_POOL_BY_LAYER[9]);
    const visualData = v2.createDefaultVisualData(9);
    const result = v2.assembleFullTopology(LAYER_09_DATA, assignment, visualData);

    expect(result.layerNumber).toBe(9);
    expect(result.gourdShape).toBeDefined();
    expect(result.visualConfig).toBeDefined();
    expect(result.assignedLevels.size).toBeGreaterThan(0);
  });

  it('createDefaultVisualData 生成合法视觉数据', () => {
    const visualData = v2.createDefaultVisualData(1);

    expect(visualData.border.enabled).toBe(true);
    expect(visualData.border.borderWidth).toBeGreaterThan(0);
    expect(visualData.quadrantLabels.length).toBe(4);
    expect(visualData.cellVisualStyles.get('boss')).toBeDefined();
    expect(visualData.cellVisualStyles.get('boss')!.sizeMultiplier).toBeGreaterThanOrEqual(2.0);
    expect(visualData.background.primary).toBeTruthy();
    expect(visualData.gourdCoordinates).toBeDefined();
  });
});
