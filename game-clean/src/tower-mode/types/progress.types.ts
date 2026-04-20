import type { Coordinate2D, CellState } from './cell.types';
import type { ZoneType } from './zone.types';
import type { DataPacket } from './reward.types';
import type { Skill } from './skill.types';
import type { Book } from './book.types';
import type { PathConnection, LayerColorScheme, AmbientConfig } from './map.types';

export interface TowerProgressState {
  gameId: string;
  seed: number;
  startTime: number;
  currentLayer: number;
  layersCompleted: number[];
  layerEntryTimes: Record<number, number>;
  currentPosition: Coordinate2D;
  currentCellId: string;
  visitedCells: Set<string>;
  cellsByState: Record<CellState, string[]>;
  battlesWon: number;
  battlesLost: number;
  defeatedBosses: Set<string>;
  acquiredDataPackets: DataPacket[];
  ownedSkills: Skill[];
  activeSkillIds: string[];
  readBooks: Book[];
  totalMoves: number;
  diceRolls: number;
  zonesTriggered: Record<ZoneType, number>;
  totalPlayTimeSeconds: number;
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
  progress: TowerProgressState;
  layerSnapshots: Record<number, LayerSnapshot>;
  configChecksum: string;
}
