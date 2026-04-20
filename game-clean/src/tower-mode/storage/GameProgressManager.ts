/**
 * GameProgressManager — 管理爬塔模式的进度保存和加载
 */

export interface TowerGameSave {
  currentLayer: number;
  currentCellId: string;
  turnNumber: number;
  techValue: number;
  gold: number;
  inventory: {
    books: string[];
    skills: string[];
    dataPackets: string[];
  };
  mechanicState: Record<string, unknown>;
  timestamp: number;
}

export class GameProgressManager {
  private static SAVE_KEY = 'tower-climb-save';

  static save(state: TowerGameSave): void {
    localStorage.setItem(this.SAVE_KEY, JSON.stringify({
      ...state,
      timestamp: Date.now(),
    }));
  }

  static load(): TowerGameSave | null {
    const data = localStorage.getItem(this.SAVE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as TowerGameSave;
    } catch {
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
