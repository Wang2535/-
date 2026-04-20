import type {
  ThemeCategory,
  LevelDatabaseEntry,
  LevelPool,
  EnhancementParams,
  LayerAssignmentResult,
  TowerAssignmentResult,
  EnhancedBossConfig,
  AssignmentValidationResult,
  LayerConfig,
} from '../types';

import {
  THEME_LEVELS,
  BOSS_LEVELS,
  TIER_THEME_MAP,
  getThemeByTier,
  getBossLevelByTheme,
} from '../data/themeLevelMapping';

import { seededRNG } from '../utils/random';
import { pickN } from '../utils/probability';

const ENHANCEMENT_TABLE: Record<number, EnhancementParams> = {
  1: { hpMultiplier: 1.5, newSkills: 0, newCards: 1 },
  2: { hpMultiplier: 2.0, newSkills: 1, newCards: 1 },
  3: { hpMultiplier: 2.5, newSkills: 1, newCards: 2 },
  4: { hpMultiplier: 3.0, newSkills: 2, newCards: 2 },
  5: { hpMultiplier: 3.5, newSkills: 2, newCards: 3 },
};

const BOSS_SKILL_POOL: Record<number, string[]> = {
  1: ['BSK_T1_01', 'BSK_T1_02', 'BSK_T1_03'],
  2: ['BSK_T2_01', 'BSK_T2_02', 'BSK_T2_03'],
  3: ['BSK_T3_01', 'BSK_T3_02', 'BSK_T3_03'],
  4: ['BSK_T4_01', 'BSK_T4_02', 'BSK_T4_03'],
  5: ['BSK_T5_01', 'BSK_T5_02', 'BSK_T5_03'],
  6: ['BSK_T6_01', 'BSK_T6_02', 'BSK_T6_03'],
  7: ['BSK_T7_01', 'BSK_T7_02', 'BSK_T7_03'],
  8: ['BSK_T8_01', 'BSK_T8_02', 'BSK_T8_03'],
  9: ['BSK_T9_01', 'BSK_T9_02', 'BSK_T9_03'],
};

const BOSS_CARD_POOL: Record<number, string[]> = {
  1: ['BC_T1_01', 'BC_T1_02', 'BC_T1_03'],
  2: ['BC_T2_01', 'BC_T2_02', 'BC_T2_03'],
  3: ['BC_T3_01', 'BC_T3_02', 'BC_T3_03'],
  4: ['BC_T4_01', 'BC_T4_02', 'BC_T4_03'],
  5: ['BC_T5_01', 'BC_T5_02', 'BC_T5_03'],
  6: ['BC_T6_01', 'BC_T6_02', 'BC_T6_03'],
  7: ['BC_T7_01', 'BC_T7_02', 'BC_T7_03'],
  8: ['BC_T8_01', 'BC_T8_02', 'BC_T8_03'],
  9: ['BC_T9_01', 'BC_T9_02', 'BC_T9_03'],
};

const DATA_PACKET_POOL: Record<number, string[]> = {
  1: ['DP_T1_01', 'DP_T1_02', 'DP_T1_03', 'DP_T1_04', 'DP_T1_05', 'DP_T1_06', 'DP_T1_07', 'DP_T1_08', 'DP_T1_09'],
  2: ['DP_T2_01', 'DP_T2_02', 'DP_T2_03', 'DP_T2_04', 'DP_T2_05', 'DP_T2_06', 'DP_T2_07', 'DP_T2_08', 'DP_T2_09'],
  3: ['DP_T3_01', 'DP_T3_02', 'DP_T3_03', 'DP_T3_04', 'DP_T3_05', 'DP_T3_06', 'DP_T3_07', 'DP_T3_08', 'DP_T3_09'],
  4: ['DP_T4_01', 'DP_T4_02', 'DP_T4_03', 'DP_T4_04', 'DP_T4_05', 'DP_T4_06', 'DP_T4_07', 'DP_T4_08', 'DP_T4_09'],
  5: ['DP_T5_01', 'DP_T5_02', 'DP_T5_03', 'DP_T5_04', 'DP_T5_05', 'DP_T5_06', 'DP_T5_07', 'DP_T5_08', 'DP_T5_09'],
  6: ['DP_T6_01', 'DP_T6_02', 'DP_T6_03', 'DP_T6_04', 'DP_T6_05', 'DP_T6_06', 'DP_T6_07', 'DP_T6_08', 'DP_T6_09'],
  7: ['DP_T7_01', 'DP_T7_02', 'DP_T7_03', 'DP_T7_04', 'DP_T7_05', 'DP_T7_06', 'DP_T7_07', 'DP_T7_08', 'DP_T7_09'],
  8: ['DP_T8_01', 'DP_T8_02', 'DP_T8_03', 'DP_T8_04', 'DP_T8_05', 'DP_T8_06', 'DP_T8_07', 'DP_T8_08', 'DP_T8_09'],
  9: ['DP_T9_01', 'DP_T9_02', 'DP_T9_03', 'DP_T9_04', 'DP_T9_05', 'DP_T9_06', 'DP_T9_07', 'DP_T9_08', 'DP_T9_09'],
};

function getEnhancementLevel(layerNumber: number): number {
  if (layerNumber <= 2) return 1;
  if (layerNumber <= 4) return 2;
  if (layerNumber <= 6) return 3;
  if (layerNumber <= 8) return 4;
  return 5;
}

export class LevelAssignmentEngine {
  private levelPools: Map<number, LevelPool> = new Map();
  private rng: () => number;
  private seed: number;
  private initialized: boolean = false;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
    this.rng = seededRNG(this.seed);
  }

  initializePools(levelDatabase: LevelDatabaseEntry[]): void {
    this.levelPools.clear();
    this.initialized = true;

    const themeEntries: Record<string, LevelDatabaseEntry[]> = {};
    for (const entry of levelDatabase) {
      if (!themeEntries[entry.theme]) {
        themeEntries[entry.theme] = [];
      }
      if (!entry.isBoss) {
        themeEntries[entry.theme].push(entry);
      }
    }

    for (let tier = 1; tier <= 9; tier++) {
      const themeId = getThemeByTier(tier);
      const themeDbEntries = themeEntries[themeId] || [];
      const availableFromDb = themeDbEntries.map(e => e.id);
      const availableFromMapping = THEME_LEVELS[themeId] || [];
      const availableLevels = availableFromDb.length > 0
        ? availableFromDb
        : availableFromMapping;

      this.levelPools.set(tier, {
        tier,
        themeId,
        availableLevels: [...availableLevels],
        assignedLevels: [],
        sparePool: [],
      });
    }
  }

  assignLayer(
    layerNumber: number,
    battleCellIds: string[],
    bossCellId: string
  ): LayerAssignmentResult {
    if (!this.initialized) {
      throw new Error('LevelAssignmentEngine: pools not initialized. Call initializePools() first.');
    }
    if (layerNumber < 1 || layerNumber > 9) {
      throw new Error(`LevelAssignmentEngine: invalid layerNumber ${layerNumber}, must be 1-9.`);
    }

    const themeId = getThemeByTier(layerNumber);
    const pool = this.levelPools.get(layerNumber);
    if (!pool) {
      throw new Error(`LevelAssignmentEngine: no pool found for layer ${layerNumber}.`);
    }

    const neededCount = battleCellIds.length;
    if (pool.availableLevels.length < neededCount) {
      throw new Error(
        `LevelAssignmentEngine: layer ${layerNumber} needs ${neededCount} levels but pool only has ${pool.availableLevels.length} available.`
      );
    }

    const selectedLevels = pickN(pool.availableLevels, neededCount, this.rng);

    const battleCellAssignments: Record<string, string> = {};
    battleCellIds.forEach((cellId, index) => {
      battleCellAssignments[cellId] = selectedLevels[index];
    });

    const baseBossId = getBossLevelByTheme(themeId);
    const enhancementLevel = getEnhancementLevel(layerNumber);
    const bossConfig = this.enhanceBossLevel(baseBossId, enhancementLevel);

    pool.assignedLevels.push(...selectedLevels);
    pool.availableLevels = pool.availableLevels.filter(
      id => !selectedLevels.includes(id)
    );
    pool.sparePool = [...pool.availableLevels];

    return {
      layerNumber,
      battleCellAssignments,
      bossAssignment: {
        cellId: bossCellId,
        baseLevelId: baseBossId,
        enhancedLevelId: bossConfig.bossLevelId,
        enhancementLevel,
      },
      assignmentSeed: this.seed,
      timestamp: Date.now(),
    };
  }

  enhanceBossLevel(
    baseLevelId: string,
    enhancementLevel: number
  ): EnhancedBossConfig {
    const clampedLevel = Math.max(1, Math.min(5, enhancementLevel));
    const params = ENHANCEMENT_TABLE[clampedLevel];
    const bossLevelId = `${baseLevelId}_BOSS`;

    const newSkillsAdded = this.selectRandomSkills(clampedLevel, params.newSkills);
    const newCardsAdded = this.selectRandomCards(clampedLevel, params.newCards);
    const rewardDataPacketIds = DATA_PACKET_POOL[clampedLevel] || DATA_PACKET_POOL[1];

    return {
      originalLevelId: baseLevelId,
      bossLevelId,
      enhancementLevel: clampedLevel,
      hpMultiplier: params.hpMultiplier,
      newSkillsAdded,
      newCardsAdded,
      rewardDataPacketIds,
    };
  }

  assignAllLayers(layerConfigs: LayerConfig[]): TowerAssignmentResult {
    if (!this.initialized) {
      throw new Error('LevelAssignmentEngine: pools not initialized. Call initializePools() first.');
    }

    const layers: Record<number, LayerAssignmentResult> = {};

    for (const config of layerConfigs) {
      layers[config.layerNumber] = this.assignLayer(
        config.layerNumber,
        config.battleCellIds,
        config.bossCellId
      );
    }

    const totalAssigned = Object.values(layers).reduce(
      (sum, l) => sum + Object.keys(l.battleCellAssignments).length,
      0
    );

    const totalSpare = Array.from(this.levelPools.values()).reduce(
      (sum, pool) => sum + pool.sparePool.length,
      0
    );

    const result: TowerAssignmentResult = {
      seed: this.seed,
      layers,
      totalAssigned,
      totalSpare,
      validationPassed: false,
    };

    const validation = this.validateAssignment(result);
    result.validationPassed = validation.valid;

    return result;
  }

  validateAssignment(result: TowerAssignmentResult): AssignmentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const allAssignedLevels = new Set<string>();

    for (const [layerNum, layerResult] of Object.entries(result.layers)) {
      const levels = Object.values(layerResult.battleCellAssignments);

      for (const levelId of levels) {
        if (allAssignedLevels.has(levelId)) {
          errors.push(`Duplicate level ${levelId} found in layer ${layerNum}`);
        }
        allAssignedLevels.add(levelId);
      }

      if (levels.length === 0) {
        errors.push(`Layer ${layerNum} has no assigned levels`);
      }

      if (!layerResult.bossAssignment.baseLevelId) {
        errors.push(`Layer ${layerNum} missing boss assignment`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      coverageStats: {
        totalSlots: 90,
        filledSlots: allAssignedLevels.size,
        duplicateCheck: errors.filter(e => e.includes('Duplicate')).length === 0,
        themeMatchCheck: true,
      },
    };
  }

  getSparePool(layerNumber: number): string[] {
    const pool = this.levelPools.get(layerNumber);
    if (!pool) return [];
    return [...pool.sparePool];
  }

  reshuffle(newSeed?: number): void {
    this.seed = newSeed ?? Date.now();
    this.rng = seededRNG(this.seed);
    this.initialized = false;
    this.levelPools.clear();
  }

  getSeed(): number {
    return this.seed;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getPoolStats(): Record<number, { available: number; assigned: number; spare: number }> {
    const stats: Record<number, { available: number; assigned: number; spare: number }> = {};
    for (const [tier, pool] of this.levelPools.entries()) {
      stats[tier] = {
        available: pool.availableLevels.length,
        assigned: pool.assignedLevels.length,
        spare: pool.sparePool.length,
      };
    }
    return stats;
  }

  private selectRandomSkills(layerNumber: number, count: number): string[] {
    if (count === 0) return [];
    const pool = BOSS_SKILL_POOL[layerNumber] || BOSS_SKILL_POOL[1];
    return pickN(pool, count, this.rng);
  }

  private selectRandomCards(layerNumber: number, count: number): string[] {
    if (count === 0) return [];
    const pool = BOSS_CARD_POOL[layerNumber] || BOSS_CARD_POOL[1];
    return pickN(pool, count, this.rng);
  }
}
