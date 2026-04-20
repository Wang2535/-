export type ThemeCategory =
  | 'virus'
  | 'network'
  | 'data-security'
  | 'social-engineer'
  | 'industrial-iot'
  | 'mobile-terminal'
  | 'cloud-virtual'
  | 'ai-emerging'
  | 'security-mgmt';

export interface LevelDatabaseEntry {
  id: string;
  theme: ThemeCategory;
  difficulty: number;
  title: string;
  description: string;
  isBoss?: boolean;
}

export interface LevelPool {
  tier: number;
  themeId: ThemeCategory;
  availableLevels: string[];
  assignedLevels: string[];
  sparePool: string[];
}

export interface EnhancementParams {
  hpMultiplier: number;
  newSkills: number;
  newCards: number;
}

export interface LayerAssignmentResult {
  layerNumber: number;
  battleCellAssignments: Record<string, string>;
  bossAssignment: {
    cellId: string;
    baseLevelId: string;
    enhancedLevelId: string;
    enhancementLevel: number;
  };
  assignmentSeed: number;
  timestamp: number;
}

export interface TowerAssignmentResult {
  seed: number;
  layers: Record<number, LayerAssignmentResult>;
  totalAssigned: number;
  totalSpare: number;
  validationPassed: boolean;
}

export interface EnhancedBossConfig {
  originalLevelId: string;
  bossLevelId: string;
  enhancementLevel: number;
  hpMultiplier: number;
  newSkillsAdded: string[];
  newCardsAdded: string[];
  rewardDataPacketIds: string[];
}

export interface AssignmentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  coverageStats: {
    totalSlots: number;
    filledSlots: number;
    duplicateCheck: boolean;
    themeMatchCheck: boolean;
  };
}

export interface LayerConfig {
  layerNumber: number;
  battleCellIds: string[];
  bossCellId: string;
}
