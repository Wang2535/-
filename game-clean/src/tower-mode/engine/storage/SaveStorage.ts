import type {
  TowerSaveData,
  SaveMeta,
} from '../types/progress.types.extended';

const STORAGE_PREFIX = 'tower_mode_save_';
const MAX_SAVES = 10;
const AUTO_SAVE_KEY = 'autosave';
const DB_NAME = 'TowerModeDB';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

export class SaveStorage {
  async save(slotId: string, data: TowerSaveData): Promise<void> {
    const serialized = JSON.stringify(data);

    try {
      localStorage.setItem(STORAGE_PREFIX + slotId, serialized);
    } catch {
      console.warn('localStorage save failed, falling back to IndexedDB only');
    }

    await this.writeToIndexedDB(slotId, data);
  }

  async load(slotId: string): Promise<TowerSaveData | null> {
    try {
      const localData = localStorage.getItem(STORAGE_PREFIX + slotId);
      if (localData) {
        return JSON.parse(localData) as TowerSaveData;
      }
    } catch {
      console.warn('localStorage load failed, trying IndexedDB');
    }

    return this.readFromIndexedDB(slotId);
  }

  async autoSave(data: TowerSaveData): Promise<void> {
    await this.save(AUTO_SAVE_KEY, data);
  }

  listSlots(): SaveMeta[] {
    const slots: SaveMeta[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key?.startsWith(STORAGE_PREFIX) &&
        key !== STORAGE_PREFIX + AUTO_SAVE_KEY
      ) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw) as TowerSaveData;
            slots.push({
              slotId: key.replace(STORAGE_PREFIX, ''),
              saveName: `Save ${key.replace(STORAGE_PREFIX, '')}`,
              createdAt: data.timestamp,
              updatedAt: data.timestamp,
              playTimeSeconds: data.progress?.totalPlayTimeSeconds ?? 0,
              currentLayer: data.progress?.currentLayer ?? 1,
              completionPercent: Math.round(
                ((data.progress?.layersCompleted?.length ?? 0) / 9) * 100
              ),
              tags: [],
            });
          }
        } catch {
          continue;
        }
      }
    }
    return slots.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  deleteSlot(slotId: string): boolean {
    try {
      localStorage.removeItem(STORAGE_PREFIX + slotId);
      this.deleteFromIndexedDB(slotId);
      return true;
    } catch {
      return false;
    }
  }

  getAutoSaveKey(): string {
    return AUTO_SAVE_KEY;
  }

  getMaxSaves(): number {
    return MAX_SAVES;
  }

  private async writeToIndexedDB(
    slotId: string,
    data: TowerSaveData
  ): Promise<void> {
    try {
      const db = await this.openDB();
      if (!db) return;

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ slotId, data });
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      console.warn('IndexedDB write failed');
    }
  }

  private async readFromIndexedDB(
    slotId: string
  ): Promise<TowerSaveData | null> {
    try {
      const db = await this.openDB();
      if (!db) return null;

      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(slotId);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result as { data: TowerSaveData } | undefined;
          resolve(result?.data ?? null);
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  private async deleteFromIndexedDB(slotId: string): Promise<void> {
    try {
      const db = await this.openDB();
      if (!db) return;

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(slotId);
    } catch {
      console.warn('IndexedDB delete failed');
    }
  }

  private openDB(): Promise<IDBDatabase | null> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'slotId' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
}
