import type { GameEventMap } from './eventBus/gameEvents';

export type TowerEventType =
  | { type: 'CELL_ENTER'; cellId: string; playerPos: [number, number] }
  | { type: 'CELL_TRIGGER'; cellId: string; cellType: string }
  | { type: 'ZONE_ENTERED'; zoneType: string; effectApplied: boolean }
  | { type: 'MOVE_COMPLETE'; from: string; to: string; diceResult: number }
  | { type: 'BATTLE_START'; levelId: string; cellId: string }
  | { type: 'BATTLE_END'; victory: boolean; rewards: unknown[] }
  | { type: 'BOSS_DEFEATED'; layerNumber: number; dataPackets: unknown[] }
  | { type: 'SKILL_ACQUIRED'; skill: unknown; replacedSkill?: unknown }
  | { type: 'BOOK_READ'; book: unknown; effectApplied: boolean }
  | { type: 'CHANCE_EVENT'; event: unknown; result: unknown }
  | { type: 'DATA_PACKET_SELECTED'; packet: unknown }
  | { type: 'LAYER_COMPLETE'; layerNumber: number }
  | { type: 'GAME_COMPLETE'; finalStats: unknown }
  | { type: 'PHASE_CHANGE'; from: string; to: string }
  | { type: 'STATE_CHANGE'; state: unknown }
  | { type: 'ERROR'; error: unknown };

export class TypedEventBus<T extends { type: string }> {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  on<K extends T['type']>(
    eventType: K,
    listener: (data: Extract<T, { type: K }>) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  emit<K extends T['type']>(eventType: K, data: Omit<Extract<T, { type: K }>, 'type'>): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener({ type: eventType, ...data } as any));
    }
  }

  off<K extends T['type']>(eventType: K, listener: (data: any) => void): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}

export const eventBus = new TypedEventBus<TowerEventType>();

// F组 Round 6 - GameEventBus: 基于键值对的事件总线（非联合判别式）
// 与现有 TypedEventBus 并行运行，保持向后兼容
export class GameEventBus {
  private listeners: Map<keyof GameEventMap, Set<(data: any) => void>> = new Map();

  on<K extends keyof GameEventMap>(
    event: K,
    handler: (data: GameEventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof GameEventMap>(
    event: K,
    data: GameEventMap[K]
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(handler => handler(data));
    }
  }

  off<K extends keyof GameEventMap>(
    event: K,
    handler: (data: GameEventMap[K]) => void
  ): void {
    this.listeners.get(event)?.delete(handler);
  }

  removeAllListeners(event?: keyof GameEventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const gameEventBus = new GameEventBus();
