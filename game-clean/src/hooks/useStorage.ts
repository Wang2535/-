/**
 * useStorage Hook
 * 提供基于当前路由自动识别模式的安全存储功能
 *
 * 功能：
 * - 根据当前路由自动识别游戏模式
 * - 提供模式安全的存储方法
 * - 监听存储变化
 * - 返回当前模式相关的存储操作函数
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  storageManager,
  sessionStorageManager,
  StorageManager,
  GameMode,
  StorageType,
  StorageItemMetadata,
  StorageError
} from '@/utils/storage/StorageManager';

// ==================== 类型定义 ====================

/**
 * useStorage 配置选项
 */
export interface UseStorageOptions {
  /** 指定存储类型，默认 'localStorage' */
  storageType?: StorageType;
  /** 是否自动检测模式，默认 true */
  autoDetectMode?: boolean;
  /** 手动指定模式（优先级高于自动检测） */
  mode?: GameMode;
  /** 是否监听存储变化，默认 true */
  watchStorage?: boolean;
  /** 存储变化回调 */
  onStorageChange?: (key: string, newValue: unknown, oldValue: unknown) => void;
}

/**
 * useStorage 返回值
 */
export interface UseStorageReturn {
  /** 当前检测到的模式 */
  currentMode: GameMode | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: StorageError | null;

  // 通用存储方法
  /** 存储数据 */
  setItem: <T>(key: string, value: T) => void;
  /** 获取数据 */
  getItem: <T>(key: string) => T | null;
  /** 删除数据 */
  removeItem: (key: string) => void;
  /** 清空当前模式数据 */
  clear: () => void;
  /** 获取所有键名 */
  getAllKeys: () => string[];
  /** 检查键是否存在 */
  hasItem: (key: string) => boolean;
  /** 获取元数据 */
  getMetadata: (key: string) => StorageItemMetadata | null;

  // 模式特定方法
  /** 存储关卡模式数据 */
  setLevelData: <T>(key: string, value: T) => void;
  /** 获取关卡模式数据 */
  getLevelData: <T>(key: string) => T | null;
  /** 存储安全实践模式数据 */
  setTowerData: <T>(key: string, value: T) => void;
  /** 获取安全实践模式数据 */
  getTowerData: <T>(key: string) => T | null;
  /** 存储共享数据 */
  setSharedData: <T>(key: string, value: T) => void;
  /** 获取共享数据 */
  getSharedData: <T>(key: string) => T | null;

  // 数据迁移和导入导出
  /** 导出当前模式数据 */
  exportData: () => string;
  /** 导入数据到当前模式 */
  importData: (json: string) => { success: number; failed: number; errors: string[] };
  /** 迁移数据 */
  migrateData: (fromMode: GameMode, toMode: GameMode) => { success: number; failed: number };

  // 统计信息
  /** 获取存储统计 */
  getStats: () => {
    totalKeys: number;
    levelKeys: number;
    towerKeys: number;
    sharedKeys: number;
    estimatedSize: number;
  };

  // 工具方法
  /** 清除错误 */
  clearError: () => void;
  /** 强制刷新模式检测 */
  refreshMode: () => void;
}

// ==================== 辅助函数 ====================

/**
 * 根据路径检测游戏模式
 */
function detectModeFromPath(path: string): GameMode | null {
  // 关卡模式路径模式
  const levelPatterns = ['/level', '/game', '/battle', '/match'];
  // 安全实践模式路径模式
  const towerPatterns = ['/tower', '/roguelike', '/adventure'];

  const lowerPath = path.toLowerCase();

  for (const pattern of levelPatterns) {
    if (lowerPath.includes(pattern)) return 'level';
  }

  for (const pattern of towerPatterns) {
    if (lowerPath.includes(pattern)) return 'tower';
  }

  return null;
}

/**
 * 创建包装函数，自动处理错误
 */
function createSafeFunction<T extends (...args: unknown[]) => unknown>(
  fn: T,
  setError: (error: StorageError | null) => void
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      setError(null);
      return fn(...args) as ReturnType<T>;
    } catch (error) {
      if (error instanceof StorageError) {
        setError(error);
      } else {
        setError(new StorageError(
          (error as Error).message,
          'UNKNOWN_ERROR',
          error as Error
        ));
      }
      console.error('[useStorage] Operation failed:', error);
      return undefined;
    }
  };
}

// ==================== Hook 实现 ====================

/**
 * useStorage Hook
 *
 * @param options - 配置选项
 * @returns UseStorageReturn
 *
 * @example
 * ```tsx
 * const { setItem, getItem, currentMode } = useStorage();
 *
 * // 存储数据（自动使用当前模式）
 * setItem('playerProgress', { level: 5, score: 1000 });
 *
 * // 获取数据
 * const progress = getItem<{ level: number; score: number }>('playerProgress');
 * ```
 */
export function useStorage(options: UseStorageOptions = {}): UseStorageReturn {
  const {
    storageType = 'localStorage',
    autoDetectMode = true,
    mode: manualMode,
    watchStorage = true,
    onStorageChange
  } = options;

  const location = useLocation();
  const managerRef = useRef<StorageManager>(
    storageType === 'sessionStorage' ? sessionStorageManager : storageManager
  );

  const [currentMode, setCurrentMode] = useState<GameMode | null>(manualMode || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<StorageError | null>(null);

  // 存储变化监听器引用
  const storageListenerRef = useRef<((event: StorageEvent) => void) | null>(null);
  const lastValuesRef = useRef<Map<string, unknown>>(new Map());

  // ==================== 模式检测 ====================

  /**
   * 刷新模式检测
   */
  const refreshMode = useCallback(() => {
    if (manualMode) {
      setCurrentMode(manualMode);
      managerRef.current.setCurrentMode(manualMode);
      return;
    }

    if (autoDetectMode) {
      const detectedMode = detectModeFromPath(location.pathname);
      setCurrentMode(detectedMode);
      managerRef.current.setCurrentMode(detectedMode);
    }
  }, [location.pathname, manualMode, autoDetectMode]);

  // 初始化模式检测
  useEffect(() => {
    refreshMode();
  }, [refreshMode]);

  // ==================== 存储变化监听 ====================

  /**
   * 设置存储监听器
   */
  useEffect(() => {
    if (!watchStorage) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key) return;

      // 只监听当前模式相关的键
      const mode = currentMode;
      if (!mode) return;

      const prefix = mode === 'level' ? 'level_' :
                     mode === 'tower' ? 'tower_' : 'shared_';

      if (!event.key.startsWith(prefix)) return;

      const shortKey = event.key.slice(prefix.length);
      const oldValue = lastValuesRef.current.get(shortKey);
      let newValue: unknown = null;

      try {
        if (event.newValue) {
          const parsed = JSON.parse(event.newValue);
          newValue = parsed.data ?? parsed;
        }
      } catch {
        newValue = event.newValue;
      }

      lastValuesRef.current.set(shortKey, newValue);

      if (onStorageChange) {
        onStorageChange(shortKey, newValue, oldValue);
      }
    };

    storageListenerRef.current = handleStorageChange;
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [watchStorage, currentMode, onStorageChange]);

  // ==================== 存储操作方法 ====================

  /**
   * 存储数据
   */
  const setItem = useCallback(<T,>(key: string, value: T): void => {
    const safeSet = createSafeFunction(
      (k: string, v: T) => managerRef.current.setItem(k, v),
      setError
    );
    safeSet(key, value);
  }, []);

  /**
   * 获取数据
   */
  const getItem = useCallback(<T,>(key: string): T | null => {
    const safeGet = createSafeFunction(
      (k: string) => managerRef.current.getItem<T>(k),
      setError
    );
    const result = safeGet(key);
    return result ?? null;
  }, []);

  /**
   * 删除数据
   */
  const removeItem = useCallback((key: string): void => {
    const safeRemove = createSafeFunction(
      (k: string) => managerRef.current.removeItem(k),
      setError
    );
    safeRemove(key);
  }, []);

  /**
   * 清空当前模式数据
   */
  const clear = useCallback((): void => {
    const safeClear = createSafeFunction(
      () => managerRef.current.clear(currentMode ?? undefined),
      setError
    );
    safeClear();
  }, [currentMode]);

  /**
   * 获取所有键名
   */
  const getAllKeys = useCallback((): string[] => {
    const safeGetKeys = createSafeFunction(
      () => managerRef.current.getAllKeys(currentMode ?? undefined),
      setError
    );
    return safeGetKeys() ?? [];
  }, [currentMode]);

  /**
   * 检查键是否存在
   */
  const hasItem = useCallback((key: string): boolean => {
    const safeHas = createSafeFunction(
      (k: string) => managerRef.current.hasItem(k, currentMode ?? undefined),
      setError
    );
    return safeHas(key) ?? false;
  }, [currentMode]);

  /**
   * 获取元数据
   */
  const getMetadata = useCallback((key: string): StorageItemMetadata | null => {
    const safeGetMeta = createSafeFunction(
      (k: string) => managerRef.current.getItemMetadata(k, currentMode ?? undefined),
      setError
    );
    return safeGetMeta(key) ?? null;
  }, [currentMode]);

  // ==================== 模式特定方法 ====================

  /**
   * 存储关卡模式数据
   */
  const setLevelData = useCallback(<T,>(key: string, value: T): void => {
    const safeSet = createSafeFunction(
      (k: string, v: T) => managerRef.current.setLevelData(k, v),
      setError
    );
    safeSet(key, value);
  }, []);

  /**
   * 获取关卡模式数据
   */
  const getLevelData = useCallback(<T,>(key: string): T | null => {
    const safeGet = createSafeFunction(
      (k: string) => managerRef.current.getLevelData<T>(k),
      setError
    );
    return safeGet(key) ?? null;
  }, []);

  /**
   * 存储安全实践模式数据
   */
  const setTowerData = useCallback(<T,>(key: string, value: T): void => {
    const safeSet = createSafeFunction(
      (k: string, v: T) => managerRef.current.setTowerData(k, v),
      setError
    );
    safeSet(key, value);
  }, []);

  /**
   * 获取安全实践模式数据
   */
  const getTowerData = useCallback(<T,>(key: string): T | null => {
    const safeGet = createSafeFunction(
      (k: string) => managerRef.current.getTowerData<T>(k),
      setError
    );
    return safeGet(key) ?? null;
  }, []);

  /**
   * 存储共享数据
   */
  const setSharedData = useCallback(<T,>(key: string, value: T): void => {
    const safeSet = createSafeFunction(
      (k: string, v: T) => managerRef.current.setSharedData(k, v),
      setError
    );
    safeSet(key, value);
  }, []);

  /**
   * 获取共享数据
   */
  const getSharedData = useCallback(<T,>(key: string): T | null => {
    const safeGet = createSafeFunction(
      (k: string) => managerRef.current.getSharedData<T>(k),
      setError
    );
    return safeGet(key) ?? null;
  }, []);

  // ==================== 数据迁移和导入导出 ====================

  /**
   * 导出当前模式数据
   */
  const exportData = useCallback((): string => {
    const safeExport = createSafeFunction(
      () => managerRef.current.exportData(currentMode ?? undefined),
      setError
    );
    return safeExport() ?? '{}';
  }, [currentMode]);

  /**
   * 导入数据到当前模式
   */
  const importData = useCallback((json: string): { success: number; failed: number; errors: string[] } => {
    const safeImport = createSafeFunction(
      (j: string) => managerRef.current.importData(j, currentMode ?? undefined),
      setError
    );
    return safeImport(json) ?? { success: 0, failed: 0, errors: ['Import failed'] };
  }, [currentMode]);

  /**
   * 迁移数据
   */
  const migrateData = useCallback(
    (fromMode: GameMode, toMode: GameMode): { success: number; failed: number } => {
      const safeMigrate = createSafeFunction(
        (from: GameMode, to: GameMode) => managerRef.current.migrateData(from, to),
        setError
      );
      return safeMigrate(fromMode, toMode) ?? { success: 0, failed: 0 };
    },
    []
  );

  /**
   * 获取存储统计
   */
  const getStats = useCallback(() => {
    const safeGetStats = createSafeFunction(
      () => managerRef.current.getStats(),
      setError
    );
    return safeGetStats() ?? {
      totalKeys: 0,
      levelKeys: 0,
      towerKeys: 0,
      sharedKeys: 0,
      estimatedSize: 0
    };
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== 返回值 ====================

  return {
    // 状态
    currentMode,
    isLoading,
    error,

    // 通用存储方法
    setItem,
    getItem,
    removeItem,
    clear,
    getAllKeys,
    hasItem,
    getMetadata,

    // 模式特定方法
    setLevelData,
    getLevelData,
    setTowerData,
    getTowerData,
    setSharedData,
    getSharedData,

    // 数据迁移和导入导出
    exportData,
    importData,
    migrateData,

    // 统计信息
    getStats,

    // 工具方法
    clearError,
    refreshMode
  };
}

// ==================== 便捷 Hooks ====================

/**
 * 关卡模式专用存储 Hook
 */
export function useLevelStorage(options: Omit<UseStorageOptions, 'mode'> = {}) {
  return useStorage({ ...options, mode: 'level' });
}

/**
 * 安全实践模式专用存储 Hook
 */
export function useTowerStorage(options: Omit<UseStorageOptions, 'mode'> = {}) {
  return useStorage({ ...options, mode: 'tower' });
}

/**
 * 共享数据存储 Hook
 */
export function useSharedStorage(options: Omit<UseStorageOptions, 'mode'> = {}) {
  return useStorage({ ...options, mode: 'shared' });
}

/**
 * 使用 sessionStorage 的 Hook
 */
export function useSessionStorage(options: UseStorageOptions = {}) {
  return useStorage({ ...options, storageType: 'sessionStorage' });
}

// ==================== 默认导出 ====================

export default useStorage;
