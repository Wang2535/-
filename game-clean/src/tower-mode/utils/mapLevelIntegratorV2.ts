import type {
  TowerLayerData,
  AssignmentResult,
  RenderableEnrichedTopology,
  RenderableEnrichedTopologyV3,
  LayerVisualData,
  LayerBorderConfig,
  QuadrantLabelV2,
  CellVisualStyleV2,
  ZoneBackgroundV2,
  DecorationItem,
} from '../types';
import type { GourdShapeParams, GourdCoordinate } from '../types/gourdCoordinate.types';
import { LAYER_GOURD_SHAPES } from '../data/layers/gourdShapes';
import { LayerSvgPathGenerator } from '../data/layers/svgPathGenerator';
import { MAP_VISUAL_CONFIGS } from '../data/mapVisualConfig';
import type { MapVisualConfig } from '../data/mapVisualConfig';
import type { SvgPathData } from '../types/grid.types';
import { MapLevelIntegrator } from './mapLevelIntegration';
import { LevelAssignmentAlgorithm } from '../algorithms/levelAssignment';
import { LEVEL_POOL_BY_LAYER } from '../data/levelPool';
import { LAYER_01_DATA, LAYER_02_DATA, LAYER_03_DATA, LAYER_04_DATA, LAYER_05_DATA, LAYER_06_DATA, LAYER_07_DATA, LAYER_08_DATA, LAYER_09_DATA } from '../data';
import { LAYER_MECHANICS } from '../data/layerMechanics';
import { LAYER_THEMES } from '../data/layerThemes';
import type { CellInfoPanelData, ZoneEffectInstance, LayerSpecialMechanicData } from '../types';

const DEFAULT_BORDER_CONFIG: LayerBorderConfig = {
  enabled: true,
  mode: 'checkerboard-fill',
  borderWidth: 10,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 12,
  innerPadding: 2,
  cornerRadius: 3,
  opacity: 0.85,
  glowColor: 'rgba(255,170,0,0.5)',
};

const DEFAULT_QUADRANT_LABELS: QuadrantLabelV2[] = [
  { quadrant: 'W', label: 'W', fontSizeRatio: 0.22, color: '#FF8800', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3, backgroundColor: 'rgba(255,136,0,0.3)', backgroundOpacity: 0.3 },
  { quadrant: 'N', label: 'N', fontSizeRatio: 0.22, color: '#FFCC00', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3, backgroundColor: 'rgba(255,204,0,0.3)', backgroundOpacity: 0.3 },
  { quadrant: 'I', label: 'I', fontSizeRatio: 0.22, color: '#FFCC00', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3, backgroundColor: 'rgba(255,204,0,0.3)', backgroundOpacity: 0.3 },
  { quadrant: 'P', label: 'P', fontSizeRatio: 0.22, color: '#FF8800', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3, backgroundColor: 'rgba(255,136,0,0.3)', backgroundOpacity: 0.3 },
];

const DEFAULT_CELL_STYLES: Map<string, CellVisualStyleV2> = new Map([
  ['start', { sizeMultiplier: 1.2, shape: 'circle', backgroundGradient: { from: '#00ff88', to: '#00aa55', angle: 180 }, border: { width: 2, color: '#00ff88', style: 'solid' }, icon: { type: 'svg', data: 'M10 2 L18 18 L2 18 Z' } }],
  ['level', { sizeMultiplier: 1.0, shape: 'circle', backgroundGradient: { from: '#334455', to: '#223344', angle: 180 }, border: { width: 1, color: '#556677', style: 'solid' }, icon: { type: 'svg', data: '' } }],
  ['opportunity', { sizeMultiplier: 1.0, shape: 'roundedRect', backgroundGradient: { from: '#f39c12', to: '#d68910', angle: 180 }, border: { width: 1, color: '#f39c12', style: 'dashed' }, icon: { type: 'svg', data: '' } }],
  ['bookstore', { sizeMultiplier: 1.0, shape: 'roundedRect', backgroundGradient: { from: '#2ecc71', to: '#27ae60', angle: 180 }, border: { width: 1, color: '#2ecc71', style: 'solid' }, icon: { type: 'svg', data: '' } }],
  ['skill', { sizeMultiplier: 1.0, shape: 'hexagon', backgroundGradient: { from: '#9b59b6', to: '#8e44ad', angle: 180 }, border: { width: 1, color: '#9b59b6', style: 'solid' }, icon: { type: 'svg', data: '' } }],
  ['boss', { sizeMultiplier: 2.5, shape: 'circle', backgroundGradient: { from: '#e74c3c', to: '#c0392b', angle: 180 }, border: { width: 3, color: '#e74c3c', style: 'double' }, icon: { type: 'svg', data: '' }, glowEffect: { color: '#e74c3c', size: 8, pulse: true }, animationClass: 'gm-boss-emerge' }],
  ['elite', { sizeMultiplier: 1.3, shape: 'circle', backgroundGradient: { from: '#ff6b6b', to: '#ee5a24', angle: 180 }, border: { width: 2, color: '#ff6b6b', style: 'double' }, icon: { type: 'svg', data: '' }, animationClass: 'gm-elite-jagged' }],
]);

export class MapLevelIntegratorV2 {
  private v1Integrator = new MapLevelIntegrator();

  assembleFullTopology(
    baseTopology: TowerLayerData,
    assignment: AssignmentResult,
    visualData: LayerVisualData,
    shapeParams?: GourdShapeParams,
  ): RenderableEnrichedTopology {
    const enrichedVisualData = this.enrichVisualData(visualData);

    const enriched = this.v1Integrator.integrateLevelsToTopology(baseTopology, assignment);

    const layer = baseTopology.layerNumber;
    const gourdShape = shapeParams ?? LAYER_GOURD_SHAPES[layer];

    const svgGenResult = LayerSvgPathGenerator.generateAllPaths(layer);
    const svgPaths: SvgPathData = {
      outline: svgGenResult.outlinePath,
      regions: Object.entries(svgGenResult.regionPaths).map(([id, path]) => ({
        id,
        path,
        fill: '',
      })),
      connections: svgGenResult.curvedConnections.map(c => ({
        fromId: c.fromId,
        toId: c.toId,
        path: c.pathData,
      })),
    };

    const visualConfig: MapVisualConfig = MAP_VISUAL_CONFIGS[layer];

    return {
      ...enriched,
      gourdShape,
      svgPaths,
      visualConfig,
      border: enrichedVisualData.border,
      quadrantLabels: enrichedVisualData.quadrantLabels,
      cellVisualStyles: enrichedVisualData.cellVisualStyles,
      stateVisualOverrides: enrichedVisualData.stateVisualOverrides,
      pathVisualStyles: enrichedVisualData.pathVisualStyles,
      zoneBackgrounds: enrichedVisualData.zoneBackgrounds,
      background: enrichedVisualData.background,
      gourdCoordinates: enrichedVisualData.gourdCoordinates,
      decorations: enrichedVisualData.decorations,
    };
  }

  validateVisualData(visualData: LayerVisualData): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!visualData.quadrantLabels || visualData.quadrantLabels.length !== 4) {
      errors.push('quadrantLabels 必须包含恰好4个象限标识');
    } else {
      for (const label of visualData.quadrantLabels) {
        if ((label.fontSizeRatio ?? 0) < 0.20) {
          errors.push(`${label.quadrant}象限 fontSizeRatio=${label.fontSizeRatio}，要求 ≥ 0.20`);
        }
        if (!label.strokeColor) {
          warnings.push(`${label.quadrant}象限缺少 strokeColor`);
        }
      }
    }

    if (!visualData.border?.mode) {
      errors.push('border 缺少 mode 字段');
    } else if (!['checkerboard-fill', 'radial-lines'].includes(visualData.border.mode)) {
      errors.push(`border.mode="${visualData.border.mode}" 不合法`);
    }

    const bossStyle = visualData.cellVisualStyles?.get('boss');
    if (!bossStyle) {
      errors.push('cellVisualStyles 中缺少 boss 条目');
    } else if (Math.abs((bossStyle.sizeMultiplier ?? 1) - 2.5) > 0.1) {
      errors.push(`boss sizeMultiplier=${bossStyle.sizeMultiplier}，要求 ≈ 2.5`);
    }
    if (bossStyle && !bossStyle.animationClass) {
      warnings.push('boss 缺少 animationClass');
    }

    for (const [type, style] of (visualData.cellVisualStyles ?? new Map())) {
      if (style.icon?.type !== 'svg') {
        warnings.push(`格子类型 "${type}" 的 icon.type 不是 "svg"`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private enrichVisualData(vd: LayerVisualData): LayerVisualData {
    return {
      ...vd,
      border: this.resolveBorderConfig(vd.border),
      quadrantLabels: this.resolveQuadrantLabels(vd.quadrantLabels),
      cellVisualStyles: this.resolveCellStyles(vd.cellVisualStyles),
      zoneBackgrounds: this.resolveZoneBackgrounds(vd.zoneBackgrounds),
      decorations: vd.decorations?.length > 0 ? vd.decorations : this.getDefaultDecorations(),
      stateVisualOverrides: vd.stateVisualOverrides ?? {},
    };
  }

  resolveBorderConfig(input: Partial<LayerBorderConfig> | undefined): LayerBorderConfig {
    if (input?.mode) return { ...DEFAULT_BORDER_CONFIG, ...input } as LayerBorderConfig;
    return { ...DEFAULT_BORDER_CONFIG, ...input };
  }

  resolveQuadrantLabels(input: QuadrantLabelV2[] | undefined): QuadrantLabelV2[] {
    if (input && input.length === 4 && input.every(q => q.quadrant)) return input;
    const defaults = DEFAULT_QUADRANT_LABELS.map(d => ({ ...d }));
    if (input) {
      for (const incoming of input) {
        const idx = defaults.findIndex(d => d.quadrant === incoming.quadrant);
        if (idx >= 0) {
          defaults[idx] = { ...defaults[idx], ...incoming };
        }
      }
    }
    return defaults;
  }

  resolveCellStyles(input: Map<string, CellVisualStyleV2> | undefined): Map<string, CellVisualStyleV2> {
    const merged = new Map<string, CellVisualStyleV2>();
    for (const [key, val] of DEFAULT_CELL_STYLES) {
      merged.set(key, { ...val });
    }
    if (input) {
      for (const [key, val] of input) {
        const existing = merged.get(key);
        merged.set(key, existing ? { ...existing, ...val } : val);
      }
    }
    this.postProcessCellStyles(merged);
    return merged;
  }

  resolveZoneBackgrounds(input: Record<string, any> | undefined): Record<string, ZoneBackgroundV2> {
    const result: Record<string, ZoneBackgroundV2> = {};
    const defaultZones = ['W', 'N', 'I', 'P', 'S', 'D'];
    for (const z of defaultZones) {
      const existing = input?.[z] ?? {};
      result[z] = {
        zoneType: existing.zoneType ?? z,
        backgroundType: existing.backgroundType ?? 'solid',
        backgroundData: existing.backgroundData ?? '',
        opacity: existing.opacity ?? 0.15,
        enterAnimation: existing.enterAnimation ?? 'ripple',
        centerPosition: existing.centerPosition ?? this.getDefaultZoneCenter(z),
        shape: existing.shape ?? 'quadrant',
        enterAnimClass: existing.enterAnimClass ?? `gm-zone-${z.toLowerCase()}-enter`,
      };
    }
    return result;
  }

  private postProcessCellStyles(styles: Map<string, CellVisualStyleV2>): void {
    const boss = styles.get('boss');
    if (boss && !boss.animationClass) {
      boss.animationClass = 'gm-boss-emerge';
    }

    const elite = styles.get('elite');
    if (elite && !elite.animationClass) {
      elite.animationClass = 'gm-elite-jagged';
    }

    for (const [, style] of styles) {
      if (style.icon && style.icon.type !== 'svg') {
        style.icon = { type: 'svg', data: '' };
      }
    }
  }

  private getDefaultZoneCenter(zone: string): { x: number; y: number } {
    const cx = 0.50, cy = 0.62, r = 0.30;
    switch (zone) {
      case 'W': return { x: cx - r * 0.5, y: cy - r * 0.5 };
      case 'N': return { x: cx + r * 0.5, y: cy - r * 0.5 };
      case 'I': return { x: cx - r * 0.5, y: cy + r * 0.5 };
      case 'P': return { x: cx + r * 0.5, y: cy + r * 0.5 };
      case 'S': return { x: cx, y: cy - r * 0.8 };
      case 'D': return { x: cx, y: cy };
      default: return { x: cx, y: cy };
    }
  }

  private getDefaultDecorations(): DecorationItem[] {
    return [
      { type: 'particle', position: { x: 0.3, y: 0.2 }, config: { count: 5, speed: 0.5 } },
      { type: 'glow', position: { x: 0.7, y: 0.3 }, config: { radius: 20, color: '#FFAA00' } },
      { type: 'symbol', position: { x: 0.5, y: 0.8 }, config: { symbol: 'shield', size: 12 } },
      { type: 'line', position: { x: 0.2, y: 0.5 }, config: { length: 30, angle: 45 } },
      { type: 'particle', position: { x: 0.8, y: 0.7 }, config: { count: 3, speed: 0.3 } },
    ];
  }

  createDefaultVisualData(layer: number): LayerVisualData {
    const gourdShape = LAYER_GOURD_SHAPES[layer];
    const visualConfig = MAP_VISUAL_CONFIGS[layer];
    const themeColors = visualConfig.themeColors;
    const gourdCoordinates = this.generateDefaultGourdCoordinates(layer, gourdShape);

    return {
      border: {
        ...DEFAULT_BORDER_CONFIG,
        colors: [themeColors.primary, themeColors.secondary],
        glowColor: `${themeColors.primary}80`,
      },
      quadrantLabels: DEFAULT_QUADRANT_LABELS.map(q => ({
        ...q,
        color: themeColors.accent,
        strokeColor: themeColors.primary,
      })),
      cellVisualStyles: new Map(DEFAULT_CELL_STYLES),
      stateVisualOverrides: {
        locked: { opacity: 0.4, filter: 'grayscale(1)' },
        pending: { opacity: 0.8, filter: 'brightness(1.1)' },
        current: { opacity: 1.0, filter: 'brightness(1.3)' },
        cleared: { opacity: 0.7, filter: 'saturate(0.5)' },
        failed: { opacity: 0.6, filter: 'hue-rotate(330deg)' },
      },
      pathVisualStyles: {
        main: { color: themeColors.primary, width: 3, dashArray: [], animated: true },
        branch: { color: themeColors.secondary, width: 2, dashArray: [8, 4], animated: false },
        shortcut: { color: themeColors.accent, width: 2, dashArray: [4, 4], animated: true },
      },
      zoneBackgrounds: this.resolveZoneBackgrounds(undefined),
      background: {
        primary: themeColors.background,
        secondary: themeColors.secondary,
        gradient: `linear-gradient(180deg, ${themeColors.background} 0%, ${themeColors.secondary} 100%)`,
      },
      gourdCoordinates,
      decorations: this.getDefaultDecorations(),
    };
  }

  private generateDefaultGourdCoordinates(
    layer: number,
    shapeParams: GourdShapeParams,
  ): Record<string, GourdCoordinate> {
    const coords: Record<string, GourdCoordinate> = {};
    const uc = shapeParams.upperCircle;
    const lc = shapeParams.lowerCircle;

    coords[`L${layer}_boss`] = {
      region: 2 as any,
      theta: Math.PI / 2,
      radiusRatio: 0.8,
      cartesian: { x: lc.centerX, y: lc.centerY + lc.radiusY * 0.5 },
    };

    coords[`L${layer}_start`] = {
      region: 0 as any,
      theta: -Math.PI / 2,
      radiusRatio: 0.5,
      cartesian: { x: uc.centerX, y: uc.centerY - uc.radiusY * 0.5 },
    };

    return coords;
  }

  assembleFullTopologyV3(
    baseTopology: TowerLayerData,
    assignment: AssignmentResult,
    visualData: LayerVisualData,
    shapeParams?: GourdShapeParams,
  ): RenderableEnrichedTopologyV3 {
    const v2Result = this.assembleFullTopology(baseTopology, assignment, visualData, shapeParams);
    const layer = baseTopology.layerNumber;

    const layerTheme = LAYER_THEMES[layer];
    const layerMechanic = LAYER_MECHANICS[layer];
    const cellInfoMap = this.buildCellInfoMap(baseTopology, assignment);
    const activeZoneEffects = this.buildZoneEffects(baseTopology);

    const result: RenderableEnrichedTopologyV3 = {
      ...v2Result,
      layerTheme,
      layerMechanic,
      cellInfoMap,
      activeZoneEffects,
    };

    if (layerMechanic.hiddenPaths) {
      result.hiddenPaths = layerMechanic.hiddenPaths;
    }

    if (layer === 6) {
      result.hexAdjacency = this.buildHexAdjacency(baseTopology);
    }

    if (layerMechanic.correctSequence) {
      result.protocolSequence = layerMechanic.correctSequence;
    }

    return result;
  }

  private buildCellInfoMap(
    topology: TowerLayerData,
    assignment: AssignmentResult,
  ): Map<string, CellInfoPanelData> {
    const infoMap = new Map<string, CellInfoPanelData>();

    for (const cell of topology.cells) {
      const assignedLevel = assignment.assignedLevels.get(cell.id);
      const info: CellInfoPanelData = {
        cellId: cell.id,
        cellType: cell.type,
        name: this.getDefaultName(cell.type, cell.id),
        difficultyStars: assignedLevel?.difficulty ?? this.inferDifficulty(cell.type),
        canEnter: cell.type !== 'boss',
        canSkip: cell.id === topology.startCellId ? false : cell.type !== 'boss',
      };
      infoMap.set(cell.id, info);
    }

    return infoMap;
  }

  private buildZoneEffects(topology: TowerLayerData): ZoneEffectInstance[] {
    const effects: ZoneEffectInstance[] = [];
    if (topology.zones) {
      for (const zone of topology.zones) {
        effects.push({
          zoneId: zone.id,
          effectType: 'ambient',
          params: { zoneType: zone.type ?? 'default' },
        });
      }
    }
    return effects;
  }

  private buildHexAdjacency(topology: TowerLayerData): Map<string, string[]> {
    const hexAdj = new Map<string, string[]>();
    for (const [cellId, neighbors] of Object.entries(topology.adjacencyList ?? {})) {
      hexAdj.set(cellId, [...neighbors]);
    }
    return hexAdj;
  }

  private getDefaultName(cellType: string, cellId: string): string {
    const nameMap: Record<string, string> = {
      start: '起点',
      battle: `战斗格 ${cellId}`,
      chance: '机遇格',
      bookstore: '书店格',
      skill: '技能格',
      boss: 'BOSS',
      end: '终点',
    };
    return nameMap[cellType] ?? `格子 ${cellId}`;
  }

  private inferDifficulty(cellType: string): number {
    const diffMap: Record<string, number> = {
      start: 0,
      battle: 2,
      chance: 1,
      bookstore: 1,
      skill: 2,
      boss: 5,
      end: 0,
    };
    return diffMap[cellType] ?? 1;
  }
}

const LAYER_DATA_MAP: Record<number, TowerLayerData> = {
  1: LAYER_01_DATA,
  2: LAYER_02_DATA,
  3: LAYER_03_DATA,
  4: LAYER_04_DATA,
  5: LAYER_05_DATA,
  6: LAYER_06_DATA,
  7: LAYER_07_DATA,
  8: LAYER_08_DATA,
  9: LAYER_09_DATA,
};

export function preassembleAllLayers(): Map<number, RenderableEnrichedTopology> {
  const integrator = new MapLevelIntegratorV2();
  const algorithm = new LevelAssignmentAlgorithm();
  const cache = new Map<number, RenderableEnrichedTopology>();

  for (let layer = 1; layer <= 9; layer++) {
    try {
      const baseTopology = LAYER_DATA_MAP[layer];
      if (!baseTopology) continue;

      const pool = LEVEL_POOL_BY_LAYER[layer];
      const assignment = algorithm.assignLevelsToLayer(baseTopology, pool);
      const visualData = integrator.createDefaultVisualData(layer);
      const shapeParams = LAYER_GOURD_SHAPES[layer];

      const topology = integrator.assembleFullTopology(baseTopology, assignment, visualData, shapeParams);
      cache.set(layer, topology);
    } catch (err) {
      console.error(`[C组] L${layer} 组装失败:`, err);
    }
  }

  return cache;
}

export function getLayerTopology(
  layer: number,
  cache?: Map<number, RenderableEnrichedTopology>,
): RenderableEnrichedTopology | undefined {
  if (cache?.has(layer)) return cache.get(layer);

  const integrator = new MapLevelIntegratorV2();
  const algorithm = new LevelAssignmentAlgorithm();
  const baseTopology = LAYER_DATA_MAP[layer];
  if (!baseTopology) return undefined;

  const pool = LEVEL_POOL_BY_LAYER[layer];
  const assignment = algorithm.assignLevelsToLayer(baseTopology, pool);
  const visualData = integrator.createDefaultVisualData(layer);
  const shapeParams = LAYER_GOURD_SHAPES[layer];

  return integrator.assembleFullTopology(baseTopology, assignment, visualData, shapeParams);
}

export function preassembleAllLayersV3(): Map<number, RenderableEnrichedTopologyV3> {
  const integrator = new MapLevelIntegratorV2();
  const algorithm = new LevelAssignmentAlgorithm();
  const cache = new Map<number, RenderableEnrichedTopologyV3>();

  for (let layer = 1; layer <= 9; layer++) {
    try {
      const baseTopology = LAYER_DATA_MAP[layer];
      if (!baseTopology) continue;

      const pool = LEVEL_POOL_BY_LAYER[layer];
      const assignment = algorithm.assignLevelsToLayer(baseTopology, pool);
      const visualData = integrator.createDefaultVisualData(layer);
      const shapeParams = LAYER_GOURD_SHAPES[layer];

      const topology = integrator.assembleFullTopologyV3(baseTopology, assignment, visualData, shapeParams);
      cache.set(layer, topology);
    } catch (err) {
      console.error(`[C组] L${layer} V3组装失败:`, err);
    }
  }

  return cache;
}
