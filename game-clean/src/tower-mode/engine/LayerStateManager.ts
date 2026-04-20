import type { LayerState } from '../types';

const STORAGE_KEY = 'tower_mode_layer_states';

function createDefaultLayerStates(): Record<number, LayerState> {
  const states: Record<number, LayerState> = {};
  for (let i = 1; i <= 9; i++) {
    states[i] = {
      unlocked: i === 1,
      completed: false,
      progress: 0,
    };
  }
  return states;
}

export class LayerStateManager {
  private layerStates: Record<number, LayerState>;

  constructor() {
    this.layerStates = this.loadFromStorage() ?? createDefaultLayerStates();
  }

  private loadFromStorage(): Record<number, LayerState> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.layerStates));
    } catch {
      // ignore
    }
  }

  isLayerUnlocked(layerNumber: number): boolean {
    return this.layerStates[layerNumber]?.unlocked ?? false;
  }

  isLayerCompleted(layerNumber: number): boolean {
    return this.layerStates[layerNumber]?.completed ?? false;
  }

  getLayerState(layerNumber: number): LayerState {
    return this.layerStates[layerNumber] ?? { unlocked: false, completed: false, progress: 0 };
  }

  getAllLayerStates(): Record<number, LayerState> {
    return { ...this.layerStates };
  }

  unlockLayer(layerNumber: number): boolean {
    if (layerNumber < 1 || layerNumber > 9) return false;
    if (this.layerStates[layerNumber]?.unlocked) return false;

    this.layerStates[layerNumber] = {
      ...this.layerStates[layerNumber],
      unlocked: true,
    };
    this.saveToStorage();
    return true;
  }

  completeLayer(layerNumber: number): boolean {
    if (layerNumber < 1 || layerNumber > 9) return false;
    if (this.layerStates[layerNumber]?.completed) return false;

    this.layerStates[layerNumber] = {
      unlocked: true,
      completed: true,
      progress: 100,
    };

    // Auto-unlock next layer
    if (layerNumber < 9) {
      this.layerStates[layerNumber + 1] = {
        ...this.layerStates[layerNumber + 1],
        unlocked: true,
      };
    }

    this.saveToStorage();
    return true;
  }

  setProgress(layerNumber: number, progress: number): void {
    if (layerNumber < 1 || layerNumber > 9) return;
    this.layerStates[layerNumber] = {
      ...this.layerStates[layerNumber],
      progress: Math.min(100, Math.max(0, progress)),
    };
    this.saveToStorage();
  }

  reset(): void {
    this.layerStates = createDefaultLayerStates();
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const layerStateManager = new LayerStateManager();
