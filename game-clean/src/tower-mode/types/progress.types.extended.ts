import type {
  Coordinate2D,
  CellState,
  ZoneType,
  DataPacket,
  Skill,
  Book,
  BattleActionResult,
  RewardSource,
  GrantedItem,
} from './cell.types';

export interface GameSession {
  sessionId: string;
  seed: number;
  startedAt: number;
  lastSavedAt: number;
  playTimeSeconds: number;
  version: string;
}

export interface SaveMeta {
  slotId: string;
  saveName: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  playTimeSeconds: number;
  currentLayer: number;
  completionPercent: number;
  tags: string[];
}

export interface LayerSnapshot {
  layerNumber: number;
  cellStates: Record<string, CellState>;
  bossDefeated: boolean;
  dataPacketsAcquired: string[];
  moveCount: number;
  enterTime: number;
  exitTime?: number;
}

export interface TowerSaveData {
  version: string;
  timestamp: number;
  progress: import('./cell.types').TowerProgressState;
  layerSnapshots: Record<number, LayerSnapshot>;
  configChecksum: string;
}

export interface ProgressManagerState {
  session: GameSession;
  progress: import('./cell.types').TowerProgressState;
  layerSnapshots: Record<number, LayerSnapshot>;
  saveMeta: SaveMeta;
}

export interface MovementRecord {
  fromCellId: string;
  toCellId: string;
  diceValue: number;
  timestamp: number;
  zonesTriggered: ZoneType[];
}

export interface GameStatistics {
  totalPlayTime: number;
  perLayerTime: Record<number, number>;
  totalBattles: number;
  battlesWon: number;
  battlesLost: number;
  winRate: number;
  perfectVictories: number;
  totalMoves: number;
  averageDiceRoll: number;
  zonesTriggered: Record<ZoneType, number>;
  packetsCollected: number;
  booksRead: number;
  skillsAcquired: number;
  legendaryItemsFound: number;
  mapInversionsTriggered: number;
  turnsSkipped: number;
  bossesDefeated: number;
  layersCompleted: number;
}

export type MilestoneCondition =
  | { type: 'layers_complete'; count: number }
  | { type: 'bosses_defeated'; count: number }
  | { type: 'packets_collected'; count: number }
  | { type: 'win_streak'; count: number }
  | { type: 'no_damage_layer'; layerNumber: number }
  | { type: 'all_books_theme'; theme: string };

export interface Milestone {
  id: string;
  name: string;
  description: string;
  condition: MilestoneCondition;
  reward?: string;
  achievedAt?: number;
  notified: boolean;
}

export interface ImportResult {
  success: boolean;
  versionCompatible: boolean;
  warnings: string[];
  importedSession: GameSession | null;
}
