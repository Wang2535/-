import { describe, it, expect } from 'vitest';
import { MapLevelIntegratorV2, preassembleAllLayers, getLayerTopology } from '../mapLevelIntegratorV2';
import { LevelAssignmentAlgorithm } from '../../algorithms/levelAssignment';
import { LEVEL_POOL_BY_LAYER } from '../../data/levelPool';
import { LAYER_01_DATA } from '../../data';

describe('MapLevelIntegratorV2 Enhanced', () => {
  const v2 = new MapLevelIntegratorV2();
  const algorithm = new LevelAssignmentAlgorithm();

  it('border.mode 透传', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    vd.border.mode = 'radial-lines';
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);
    expect(result.border.mode).toBe('radial-lines');
  });

  it('border.mode fallback 默认 checkerboard-fill', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const resolved = v2.resolveBorderConfig({ enabled: true, borderWidth: 5 } as any);
    expect(resolved.mode).toBe('checkerboard-fill');
  });

  it('quadrantLabels V2 字段完整性', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);

    expect(result.quadrantLabels.length).toBe(4);
    for (const label of result.quadrantLabels) {
      expect(label.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
      expect(label.strokeColor).toBeTruthy();
      expect(label.fontWeight).toBeTruthy();
      expect(label.shadowColor).toBeTruthy();
      expect(label.shadowBlur).toBeGreaterThanOrEqual(0);
      expect(label.backgroundColor).toBeTruthy();
      expect(label.backgroundOpacity).toBeGreaterThanOrEqual(0);
    }
  });

  it('Boss animationClass 和 sizeMultiplier', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);

    const bossStyle = result.cellVisualStyles.get('boss');
    expect(bossStyle).toBeDefined();
    expect(bossStyle!.animationClass).toBe('gm-boss-emerge');
    expect(bossStyle!.sizeMultiplier).toBe(2.5);
  });

  it('elite animationClass', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);

    const eliteStyle = result.cellVisualStyles.get('elite');
    expect(eliteStyle).toBeDefined();
    expect(eliteStyle!.animationClass).toBe('gm-elite-jagged');
  });

  it('zoneBackgrounds 含 enterAnimClass 和 centerPosition', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);

    for (const [zone, bg] of Object.entries(result.zoneBackgrounds)) {
      expect(bg.enterAnimClass).toBeTruthy();
      expect(bg.centerPosition).toBeDefined();
      expect(typeof bg.centerPosition.x).toBe('number');
      expect(typeof bg.centerPosition.y).toBe('number');
      expect(bg.shape).toBeTruthy();
    }
  });

  it('decorations 默认值', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);

    expect(result.decorations.length).toBeGreaterThan(0);
    for (const d of result.decorations) {
      expect(['particle', 'glow', 'symbol', 'line']).toContain(d.type);
      expect(d.position).toBeDefined();
      expect(d.config).toBeDefined();
    }
  });

  it('preassembleAllLayers 9层成功', () => {
    const cache = preassembleAllLayers();
    expect(cache.size).toBe(9);
    for (let i = 1; i <= 9; i++) {
      expect(cache.has(i)).toBe(true);
      const topology = cache.get(i)!;
      expect(topology.gourdShape).toBeDefined();
      expect(topology.border.mode).toBeTruthy();
      expect(topology.cellVisualStyles.get('boss')).toBeDefined();
    }
  });

  it('validateVisualData 校验失败抛出错误', () => {
    const badVisualData = {
      border: { mode: 'invalid-mode' } as any,
      quadrantLabels: [],
      cellVisualStyles: new Map(),
      stateVisualOverrides: {},
      pathVisualStyles: {},
      zoneBackgrounds: {},
      background: { primary: '', secondary: '', gradient: '' },
      gourdCoordinates: {},
      decorations: [],
    };

    const result = v2.validateVisualData(badVisualData as any);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('resolveCellStyles A+B合并', () => {
    const partialStyles = new Map([
      ['level', { sizeMultiplier: 1.5, shape: 'hexagon' as const, backgroundGradient: { from: '#aaa', to: '#bbb', angle: 90 }, border: { width: 2, color: '#ccc', style: 'solid' as const }, icon: { type: 'svg' as const, data: 'test' } }],
    ]);

    const resolved = v2.resolveCellStyles(partialStyles);

    expect(resolved.get('level')!.sizeMultiplier).toBe(1.5);
    expect(resolved.get('boss')).toBeDefined();
    expect(resolved.get('boss')!.animationClass).toBe('gm-boss-emerge');
    expect(resolved.get('elite')!.animationClass).toBe('gm-elite-jagged');
  });

  it('所有图标 type=svg', () => {
    const assignment = algorithm.assignLevelsToLayer(LAYER_01_DATA, LEVEL_POOL_BY_LAYER[1]);
    const vd = v2.createDefaultVisualData(1);
    const result = v2.assembleFullTopology(LAYER_01_DATA, assignment, vd);

    for (const [type, style] of result.cellVisualStyles) {
      expect(style.icon.type).toBe('svg');
    }
  });

  it('getLayerTopology 单层获取', () => {
    const topology = getLayerTopology(1);
    expect(topology).toBeDefined();
    expect(topology!.layerNumber).toBe(1);
    expect(topology!.border.mode).toBeTruthy();
  });

  it('resolveQuadrantLabels fallback 返回4个默认象限', () => {
    const resolved = v2.resolveQuadrantLabels(undefined);
    expect(resolved.length).toBe(4);
    expect(resolved.map(q => q.quadrant)).toEqual(['W', 'N', 'I', 'P']);
  });
});
