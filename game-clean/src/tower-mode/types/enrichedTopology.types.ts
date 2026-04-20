import type { TowerLayerData } from './map.types';
import type { DifficultyStar } from './grid.types';

export type MechanismType =
  | 'summon'
  | 'control'
  | 'recover'
  | 'interfere'
  | 'evolve'
  | 'timed'
  | 'clone'
  | 'psychological';

export interface BossMechanism {
  type: MechanismType;
  name: string;
  description: string;
  triggerInterval: number;
  params: Record<string, unknown>;
}

export interface BossBaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface BossVisualConfig {
  primaryColor: string;
  secondaryColor: string;
  auraEffect: string;
  size: 'normal' | 'large' | 'epic';
}

export interface GeneratedBoss {
  prototypeId: string;
  name: string;
  baseStats: BossBaseStats;
  mechanisms: BossMechanism[];
  stageThresholds: number[];
  visualConfig: BossVisualConfig;
}

export interface LevelPoolEntry {
  id: string;
  layer: number;
  theme: string;
  difficulty: DifficultyStar;
  tags: string[];
  name: string;
  description: string;
}

export interface AssignmentResult {
  layer: number;
  assignedLevels: Map<string, LevelPoolEntry>;
  bossCandidatePool: LevelPoolEntry[];
  selectedBossPrototype: LevelPoolEntry;
  generatedBoss: GeneratedBoss;
  difficultyGradient: {
    mainPath: string[];
    branchPaths: string[][];
    eliteCellIds: string[];
  };
}

export interface EnrichedTopology extends TowerLayerData {
  assignedLevels: Map<string, LevelPoolEntry>;
  bossConfig: {
    prototype: LevelPoolEntry;
    generatedBoss: GeneratedBoss;
    bossCellId: string;
    unlockCondition: {
      requiredClearedCount: number;
      currentClearedCount: number;
    };
  };
  difficultyGradient: {
    mainPath: string[];
    branchPaths: string[][];
    eliteCellIds: string[];
  };
  assignmentMeta: {
    assignedAt: number;
    algorithm: string;
    seed: number;
  };
}
