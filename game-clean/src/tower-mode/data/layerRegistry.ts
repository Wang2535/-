import { SRAYLAND_LAYER_DATA } from './layers/srayland-layer';

import type {
  ZoneType,
  EffectTarget,
  ZoneEffectConfig,
  ZoneVisualConfig,
  ZoneDefinition,
  TierProbabilityRow,
  Coordinate2D,
  GridSize,
  ThemeCategory,
  CellType,
  CellState,
  BaseCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  GameCell,
  PathConnection,
  LayerColorScheme,
  AmbientConfig,
  TowerLayerData,
} from '../types';

export interface ValidationError {
  field: string;
  message: string;
  cellId?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  cellId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export const LAYER_REGISTRY: Record<number, TowerLayerData> = {
  1: SRAYLAND_LAYER_DATA,
  2: SRAYLAND_LAYER_DATA,
  3: SRAYLAND_LAYER_DATA,
  4: SRAYLAND_LAYER_DATA,
  5: SRAYLAND_LAYER_DATA,
  6: SRAYLAND_LAYER_DATA,
  7: SRAYLAND_LAYER_DATA,
  8: SRAYLAND_LAYER_DATA,
  9: SRAYLAND_LAYER_DATA,
};

export function getLayerData(layerNumber: number): TowerLayerData {
  const data = LAYER_REGISTRY[layerNumber];
  if (!data) {
    throw new Error(`Invalid layer number: ${layerNumber}. Must be 1-9.`);
  }
  return data;
}

export function getAllLayers(): TowerLayerData[] {
  return Object.values(LAYER_REGISTRY).sort((a, b) => a.layerNumber - b.layerNumber);
}

export function validateLayerData(data: TowerLayerData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!data.startCellId) {
    errors.push({ field: 'startCellId', message: 'startCellId is required' });
  }

  if (!data.bossCellId) {
    errors.push({ field: 'bossCellId', message: 'bossCellId is required' });
  }

  if (!data.cells || data.cells.length === 0) {
    errors.push({ field: 'cells', message: 'cells array is empty' });
    return { isValid: false, errors, warnings };
  }

  if (data.totalCells !== data.cells.length) {
    errors.push({ field: 'totalCells', message: `totalCells (${data.totalCells}) does not match cells.length (${data.cells.length})` });
  }

  const cellIds = new Set(data.cells.map(c => c.id));
  // 支持 SRayLand 地图的 cell ID 格式
  const cellIdPattern = /^(R\d+C\d+|u\d+|l\d+|c\d+|s\d+)$/;

  for (const cell of data.cells) {
    if (!cellIdPattern.test(cell.id)) {
      errors.push({ field: 'cells', message: `Cell ID "${cell.id}" does not match expected format`, cellId: cell.id });
    }
  }

  const hasBattle = data.cells.some(c => c.type === 'battle');
  if (!hasBattle) {
    errors.push({ field: 'cells', message: 'Must contain at least one battle cell' });
  }

  const hasBoss = data.cells.some(c => c.type === 'boss');
  if (!hasBoss) {
    errors.push({ field: 'cells', message: 'Must contain at least one boss cell' });
  }

  if (data.startCellId && !cellIds.has(data.startCellId)) {
    errors.push({ field: 'startCellId', message: `startCellId "${data.startCellId}" not found in cells` });
  }

  if (data.bossCellId && !cellIds.has(data.bossCellId)) {
    errors.push({ field: 'bossCellId', message: `bossCellId "${data.bossCellId}" not found in cells` });
  }

  if (data.paths && data.paths.length > 0) {
    for (const path of data.paths) {
      if (!cellIds.has(path.from)) {
        errors.push({ field: 'paths', message: `Path from "${path.from}" not found in cells`, cellId: path.from });
      }
      if (!cellIds.has(path.to)) {
        errors.push({ field: 'paths', message: `Path to "${path.to}" not found in cells`, cellId: path.to });
      }
    }
  }

  if (data.startCellId && cellIds.has(data.startCellId)) {
    const visited = new Set<string>();
    const queue = [data.startCellId];
    visited.add(data.startCellId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = data.adjacencyList[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && cellIds.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    const unreachable = data.cells.filter(c => !visited.has(c.id));
    if (unreachable.length > 0) {
      errors.push({
        field: 'connectivity',
        message: `${unreachable.length} cells unreachable from start: ${unreachable.map(c => c.id).join(', ')}`,
      });
    }
  }

  if (data.zones && data.zones.length > 0) {
    for (const zone of data.zones) {
      for (const zoneCellId of zone.cellIds) {
        if (!cellIds.has(zoneCellId)) {
          warnings.push({ field: 'zones', message: `Zone "${zone.id}" references cell "${zoneCellId}" not found in cells`, cellId: zoneCellId });
        }
      }
    }
  }

  const battleCount = data.cells.filter(c => c.type === 'battle').length;
  if (battleCount < 6) {
    warnings.push({ field: 'cells', message: `Only ${battleCount} battle cells, recommended minimum is 6` });
  }

  const skillCount = data.cells.filter(c => c.type === 'skill').length;
  if (skillCount < 1) {
    warnings.push({ field: 'cells', message: 'No skill cell found, recommended at least 1' });
  }

  const bookstoreCount = data.cells.filter(c => c.type === 'bookstore').length;
  if (bookstoreCount < 1) {
    warnings.push({ field: 'cells', message: 'No bookstore cell found, recommended at least 1' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

import type { LayerMetadata, HotspotConfig, LayerState } from '../types';
import { TIER_DATA, HOTSPOT_CONFIG } from './layerMetadata';

export interface LegacyLayerMeta {
  layerNumber: number;
  themeName: string;
  shapeDescription: string;
  difficultyRange: [number, number];
  themeCategory: string;
  iconEmoji: string;
}

export const LAYER_METADATA: Record<number, LegacyLayerMeta> = {
  1: { layerNumber: 1, themeName: '病毒实验室', shapeDescription: '葫芦形培养皿', difficultyRange: [1, 3], themeCategory: 'virus', iconEmoji: '🧪' },
  2: { layerNumber: 2, themeName: '网络空间', shapeDescription: '双环形拓扑', difficultyRange: [1, 3], themeCategory: 'network', iconEmoji: '🌐' },
  3: { layerNumber: 3, themeName: '数据保险库', shapeDescription: '同心堡垒', difficultyRange: [2, 4], themeCategory: 'data-security', iconEmoji: '🔐' },
  4: { layerNumber: 4, themeName: '城市街区', shapeDescription: '网格城市街区', difficultyRange: [2, 4], themeCategory: 'social-engineer', iconEmoji: '🏙️' },
  5: { layerNumber: 5, themeName: '智能工厂', shapeDescription: '生产树', difficultyRange: [3, 5], themeCategory: 'industrial-iot', iconEmoji: '🏭' },
  6: { layerNumber: 6, themeName: '移动终端', shapeDescription: '六边形蜂窝', difficultyRange: [3, 5], themeCategory: 'mobile-terminal', iconEmoji: '📱' },
  7: { layerNumber: 7, themeName: '云端平台', shapeDescription: '不规则云', difficultyRange: [4, 5], themeCategory: 'cloud-virtual', iconEmoji: '☁️' },
  8: { layerNumber: 8, themeName: '未来实验室', shapeDescription: '量子云', difficultyRange: [4, 5], themeCategory: 'ai-emerging', iconEmoji: '🔬' },
  9: { layerNumber: 9, themeName: '指挥中心', shapeDescription: '对称王座厅', difficultyRange: [5, 5], themeCategory: 'security-mgmt', iconEmoji: '👑' },
};

export function getAllLayerMetadata(): Record<number, LayerMetadata> {
  return TIER_DATA;
}

export function getLayerMetadata(layerNumber: number): LegacyLayerMeta {
  const meta = LAYER_METADATA[layerNumber];
  if (!meta) throw new Error(`No metadata for layer ${layerNumber}`);
  return meta;
}

export function getDefaultLayerStates(): Record<number, LayerState> {
  const states: Record<number, LayerState> = {};
  for (let i = 1; i <= 9; i++) {
    states[i] = { unlocked: i === 1, completed: false, progress: 0 };
  }
  return states;
}

export function getHotspotConfig(layerNumber: number): HotspotConfig {
  const config = HOTSPOT_CONFIG[layerNumber];
  if (!config) {
    throw new Error(`No hotspot config for layer ${layerNumber}`);
  }
  return config;
}

export function getTierData(layerNumber: number): LayerMetadata {
  const data = TIER_DATA[layerNumber];
  if (!data) {
    throw new Error(`No tier data for layer ${layerNumber}`);
  }
  return data;
}

export function getAllTierData(): LayerMetadata[] {
  return Object.values(TIER_DATA);
}

export type {
  TowerLayerData,
  GameCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  PathConnection,
  ZoneDefinition,
  ZoneType,
  LayerColorScheme,
  AmbientConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  LayerMetadata,
  LayerState,
  HotspotConfig,
  LegacyLayerMeta,
};
