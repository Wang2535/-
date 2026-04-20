import type { LevelDatabaseEntry, ThemeCategory } from '../types/levelAssignment.types';
import { THEME_LEVELS, BOSS_LEVELS } from '../../data/themeLevelMapping';
import * as L1 from '../../data/layers/layer1-virus-lab';
import * as L2 from '../../data/layers/layer2-cyberspace';
import * as L3 from '../../data/layers/layer3-data-vault';
import * as L4 from '../../data/layers/layer4-grid-city';
import * as L5 from '../../data/layers/layer5-smart-factory';
import * as L6 from '../../data/layers/layer6-mobile-terminal';
import * as L7 from '../../data/layers/layer7-cloud-platform';
import * as L8 from '../../data/layers/layer8-future-lab';
import * as L9 from '../../data/layers/layer9-command-center';
import { LevelAssignmentEngine } from '../LevelAssignmentEngine';

const ALL_LAYERS = [
  L1.LAYER_01_DATA,
  L2.LAYER_02_DATA,
  L3.LAYER_03_DATA,
  L4.LAYER_04_DATA,
  L5.LAYER_05_DATA,
  L6.LAYER_06_DATA,
  L7.LAYER_07_DATA,
  L8.LAYER_08_DATA,
  L9.LAYER_09_DATA,
];

export function createMockLevelDatabase(): LevelDatabaseEntry[] {
  const entries: LevelDatabaseEntry[] = [];

  for (const [theme, levelIds] of Object.entries(THEME_LEVELS)) {
    for (const levelId of levelIds) {
      const difficulty = parseInt(levelId.replace('LV', '')) % 5 + 1;
      entries.push({
        id: levelId,
        theme: theme as ThemeCategory,
        difficulty,
        title: `Level ${levelId}`,
        description: `Test level for ${theme}`,
        isBoss: false,
      });
    }
  }

  for (const [theme, bossId] of Object.entries(BOSS_LEVELS)) {
    entries.push({
      id: bossId,
      theme: theme as ThemeCategory,
      difficulty: 5,
      title: `Boss Level ${bossId}`,
      description: `Boss level for ${theme}`,
      isBoss: true,
    });
  }

  return entries;
}

export interface LayerConfig {
  layerNumber: number;
  battleCellIds: string[];
  bossCellId: string;
}

export function getRealLayerConfigs(): LayerConfig[] {
  const configs: LayerConfig[] = [];

  for (let i = 0; i < ALL_LAYERS.length; i++) {
    const layerData = ALL_LAYERS[i];
    const battleCellIds = layerData.cells
      .filter(cell => cell.type === 'battle')
      .map(cell => cell.id);

    const bossCell = layerData.cells.find(cell => cell.type === 'boss');
    const bossCellId = bossCell ? bossCell.id : '';

    configs.push({
      layerNumber: i + 1,
      battleCellIds,
      bossCellId,
    });
  }

  return configs;
}

export function deepEqual<T>(a: T, b: T): boolean {
  function stripTimestamp(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(stripTimestamp);
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'timestamp' || key === 'assignmentSeed') continue;
      result[key] = stripTimestamp(value);
    }
    return result;
  }
  return JSON.stringify(stripTimestamp(a)) === JSON.stringify(stripTimestamp(b));
}

export function runAssignmentWithSeed(seed: number, configs: LayerConfig[]) {
  const engine = new LevelAssignmentEngine(seed);
  engine.initializePools(createMockLevelDatabase());

  return engine.assignAllLayers(configs);
}
