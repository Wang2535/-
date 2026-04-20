import type { TowerLayerData, GameCell, Coordinate2D } from '../types';

export interface ProgressState {
  currentLayer: number;
  clearedCells: Set<string>;
  totalCells: number;
  progressPercentage: number;
  totalMoves?: number;
}

export interface PlayerPosition {
  cellId: string;
  coordinate: Coordinate2D;
}

export interface SaveData {
  saveSlotId: string;
  currentLayer: number;
  clearedCells: Record<number, string[]>;
  timestamp: number;
}

export interface BattleActionResult {
  cellId: string;
  victory: boolean;
  rewards?: {
    techValue: number;
    cards: number;
  };
}

export interface GameStatistics {
  totalBattles: number;
  victories: number;
  defeats: number;
  bossesDefeated: number;
  layersCompleted: number;
  totalTechValue: number;
}

export class ProgressManager {
  private saveSlotId: string;
  private currentLayer: number = 1;
  private clearedCells: Map<number, Set<string>> = new Map();
  private totalCellsPerLayer: Map<number, number> = new Map();
  private gameSeed: number = 0;
  private statistics: GameStatistics = {
    totalBattles: 0,
    victories: 0,
    defeats: 0,
    bossesDefeated: 0,
    layersCompleted: 0,
    totalTechValue: 0,
  };
  private playerPosition: PlayerPosition = { cellId: '', coordinate: [0, 0] };
  private totalMoves: number = 0;

  constructor(saveSlotId: string = 'default') {
    this.saveSlotId = saveSlotId;
  }

  newGame(seed: number): void {
    this.gameSeed = seed;
    this.currentLayer = 1;
    this.clearedCells.clear();
    this.totalCellsPerLayer.clear();
    this.statistics = {
      totalBattles: 0,
      victories: 0,
      defeats: 0,
      bossesDefeated: 0,
      layersCompleted: 0,
      totalTechValue: 0,
    };
  }

  loadSave(slotId: string): ProgressState {
    this.saveSlotId = slotId;
    try {
      const stored = localStorage.getItem(`tower_save_${slotId}`);
      if (stored) {
        const data: SaveData = JSON.parse(stored);
        this.currentLayer = data.currentLayer;
        this.clearedCells.clear();
        for (const [layer, cells] of Object.entries(data.clearedCells)) {
          this.clearedCells.set(parseInt(layer), new Set(cells));
        }
      }
    } catch {
      // ignore
    }
    return this.getProgress();
  }

  initialize(layerData: TowerLayerData): void {
    this.currentLayer = layerData.layerNumber;
    if (!this.clearedCells.has(layerData.layerNumber)) {
      this.clearedCells.set(layerData.layerNumber, new Set());
    }
    this.totalCellsPerLayer.set(layerData.layerNumber, layerData.cells.length);
  }

  recordBattle(result: BattleActionResult): void {
    this.statistics.totalBattles++;
    if (result.victory) {
      this.statistics.victories++;
      if (result.rewards?.techValue) {
        this.statistics.totalTechValue += result.rewards.techValue;
      }
    } else {
      this.statistics.defeats++;
    }
  }

  recordBossDefeat(layerNumber: number, rewards: unknown[]): void {
    this.statistics.bossesDefeated++;
    this.markLayerComplete(layerNumber);
  }

  recordLayerComplete(layerNumber: number): void {
    this.statistics.layersCompleted++;
    this.currentLayer = layerNumber + 1;
  }

  markLayerComplete(layerNumber: number): void {
    this.statistics.layersCompleted++;
  }

  getStatistics(): GameStatistics {
    return { ...this.statistics };
  }

  markCellCleared(cellId: string, layerNumber?: number): void {
    const layer = layerNumber ?? this.currentLayer;
    const cleared = this.clearedCells.get(layer);
    if (cleared) {
      cleared.add(cellId);
    }
  }

  isCellCleared(cellId: string, layerNumber?: number): boolean {
    const layer = layerNumber ?? this.currentLayer;
    const cleared = this.clearedCells.get(layer);
    return cleared?.has(cellId) ?? false;
  }

  getProgress(layerNumber?: number): ProgressState {
    const layer = layerNumber ?? this.currentLayer;
    const cleared = this.clearedCells.get(layer) ?? new Set();
    const total = this.totalCellsPerLayer.get(layer) ?? 0;

    return {
      currentLayer: layer,
      clearedCells: cleared,
      totalCells: total,
      progressPercentage: total > 0 ? (cleared.size / total) * 100 : 0,
      totalMoves: this.totalMoves,
    };
  }

  canChallengeBoss(layerNumber?: number): boolean {
    const layer = layerNumber ?? this.currentLayer;
    const cleared = this.clearedCells.get(layer) ?? new Set();
    return cleared.size >= 9;
  }

  advanceToNextLayer(): number {
    this.currentLayer++;
    return this.currentLayer;
  }

  getCurrentLayer(): number {
    return this.currentLayer;
  }

  getSaveSlotId(): string {
    return this.saveSlotId;
  }

  getGameSeed(): number {
    return this.gameSeed;
  }

  reset(): void {
    this.clearedCells.clear();
    this.totalCellsPerLayer.clear();
    this.currentLayer = 1;
    this.gameSeed = 0;
    this.statistics = {
      totalBattles: 0,
      victories: 0,
      defeats: 0,
      bossesDefeated: 0,
      layersCompleted: 0,
      totalTechValue: 0,
    };
    this.playerPosition = { cellId: '', coordinate: [0, 0] };
    this.totalMoves = 0;
  }

  updatePosition(cellId: string, coordinate: Coordinate2D): void {
    this.playerPosition = { cellId, coordinate };
    this.totalMoves++;
  }

  getCurrentProgress(): ProgressState {
    return this.getProgress();
  }

  async saveGame(slotId?: string, description?: string): Promise<void> {
    const targetSlotId = slotId ?? this.saveSlotId;
    const data: SaveData = {
      saveSlotId: targetSlotId,
      currentLayer: this.currentLayer,
      clearedCells: {},
      timestamp: Date.now(),
    };
    for (const [layer, cells] of this.clearedCells) {
      data.clearedCells[layer] = Array.from(cells);
    }
    try {
      localStorage.setItem(`tower_save_${targetSlotId}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}
