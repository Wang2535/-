/**
 * 游戏状态持久化系统 - 支持保存/加载/断线重连
 * 
 * 功能：
 * 1. 游戏状态序列化和反序列化
 * 2. 本地存储备份
 * 3. 自动保存机制
 * 4. 断线重连支持
 * 5. 游戏状态校验
 */

import type { GameState } from '@/types/gameRules';

// 存储键名
const STORAGE_KEYS = {
  GAME_STATE: 'daogaoyizhang_game_state',
  GAME_HISTORY: 'daogaoyizhang_game_history',
  AUTO_SAVE: 'daogaoyizhang_auto_save',
  LAST_SAVE_TIME: 'daogaoyizhang_last_save_time',
  PLAYER_PREFERENCES: 'daogaoyizhang_player_preferences'
} as const;

// 序列化游戏状态
export interface SerializedGameState {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

// 游戏历史记录
export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  gameId: string;
  players: string[];
  winner: string | null;
  victoryType: string | null;
  turns: number;
  duration: number;
}

// 自动保存配置
export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  maxSaves: number;
}

// 默认配置
const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 30000, // 30秒
  maxSaves: 5
};

/**
 * 游戏状态持久化系统
 */
export class GameStatePersistence {
  private static autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private static currentConfig: AutoSaveConfig = { ...DEFAULT_AUTO_SAVE_CONFIG };

  /**
   * 序列化游戏状态
   */
  static serializeGameState(gameState: GameState): string {
    const serialized: SerializedGameState = {
      version: '16.2.0',
      timestamp: Date.now(),
      gameState: { ...gameState },
      checksum: this.calculateChecksum(gameState)
    };

    return JSON.stringify(serialized);
  }

  /**
   * 反序列化游戏状态
   */
  static deserializeGameState(serialized: string): GameState | null {
    try {
      const parsed: SerializedGameState = JSON.parse(serialized);

      // 验证版本
      if (!this.validateVersion(parsed.version)) {
        console.warn(`[GameStatePersistence] 不兼容的游戏版本: ${parsed.version}`);
        return null;
      }

      // 验证校验和
      if (!this.verifyChecksum(parsed.gameState, parsed.checksum)) {
        console.warn('[GameStatePersistence] 游戏状态校验失败，数据可能已损坏');
        return null;
      }

      return parsed.gameState;
    } catch (error) {
      console.error('[GameStatePersistence] 反序列化失败:', error);
      return null;
    }
  }

  /**
   * 计算校验和
   */
  private static calculateChecksum(gameState: GameState): string {
    // 简化校验和：基于关键字段的哈希
    const keyData = {
      id: gameState.id,
      turn: gameState.turn,
      players: gameState.players.map(p => ({
        id: p.id,
        faction: p.faction,
        infiltrationLevel: p.infiltrationLevel,
        safetyLevel: p.safetyLevel
      })),
      winner: gameState.winner,
      isActive: gameState.isActive
    };

    // 简单的字符串哈希
    const str = JSON.stringify(keyData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * 验证校验和
   */
  private static verifyChecksum(gameState: GameState, checksum: string): boolean {
    return this.calculateChecksum(gameState) === checksum;
  }

  /**
   * 验证版本兼容性
   */
  private static validateVersion(version: string): boolean {
    // 支持16.x.x版本
    return version.startsWith('16.');
  }

  /**
   * 保存游戏状态到本地存储
   */
  static saveToLocalStorage(gameState: GameState, key?: string): boolean {
    try {
      const serialized = this.serializeGameState(gameState);
      const storageKey = key || STORAGE_KEYS.GAME_STATE;
      localStorage.setItem(storageKey, serialized);
      localStorage.setItem(STORAGE_KEYS.LAST_SAVE_TIME, Date.now().toString());
      console.log(`[GameStatePersistence] 游戏状态已保存: ${gameState.id}`);
      return true;
    } catch (error) {
      console.error('[GameStatePersistence] 保存失败:', error);
      return false;
    }
  }

  /**
   * 从本地存储加载游戏状态
   */
  static loadFromLocalStorage(key?: string): GameState | null {
    try {
      const storageKey = key || STORAGE_KEYS.GAME_STATE;
      const serialized = localStorage.getItem(storageKey);

      if (!serialized) {
        console.log('[GameStatePersistence] 没有找到保存的游戏状态');
        return null;
      }

      return this.deserializeGameState(serialized);
    } catch (error) {
      console.error('[GameStatePersistence] 加载失败:', error);
      return null;
    }
  }

  /**
   * 删除本地存储的游戏状态
   */
  static removeFromLocalStorage(key?: string): boolean {
    try {
      const storageKey = key || STORAGE_KEYS.GAME_STATE;
      localStorage.removeItem(storageKey);
      console.log('[GameStatePersistence] 游戏状态已删除');
      return true;
    } catch (error) {
      console.error('[GameStatePersistence] 删除失败:', error);
      return false;
    }
  }

  /**
   * 检查是否有保存的游戏状态
   */
  static hasSavedGame(key?: string): boolean {
    const storageKey = key || STORAGE_KEYS.GAME_STATE;
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * 获取最后保存时间
   */
  static getLastSaveTime(): number | null {
    const timeStr = localStorage.getItem(STORAGE_KEYS.LAST_SAVE_TIME);
    return timeStr ? parseInt(timeStr) : null;
  }

  /**
   * 自动保存游戏状态
   */
  static autoSave(gameState: GameState): boolean {
    if (!this.currentConfig.enabled) {
      return false;
    }

    // 保存到自动保存槽位
    const autoSaveKey = `${STORAGE_KEYS.AUTO_SAVE}_${Date.now()}`;
    const success = this.saveToLocalStorage(gameState, autoSaveKey);

    if (success) {
      // 清理旧的自动保存
      this.cleanupOldAutoSaves();
    }

    return success;
  }

  /**
   * 清理旧的自动保存
   */
  private static cleanupOldAutoSaves(): void {
    const saves: { key: string; time: number }[] = [];

    // 收集所有自动保存
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.AUTO_SAVE)) {
        const time = parseInt(key.split('_').pop() || '0');
        saves.push({ key, time });
      }
    }

    // 按时间排序，删除旧的
    saves.sort((a, b) => b.time - a.time);
    const savesToDelete = saves.slice(this.currentConfig.maxSaves);

    for (const save of savesToDelete) {
      localStorage.removeItem(save.key);
    }
  }

  /**
   * 启动自动保存定时器
   */
  static startAutoSave(gameStateGetter: () => GameState | null): void {
    this.stopAutoSave();

    if (!this.currentConfig.enabled) {
      return;
    }

    this.autoSaveTimer = setInterval(() => {
      const gameState = gameStateGetter();
      if (gameState && gameState.isActive) {
        this.autoSave(gameState);
      }
    }, this.currentConfig.intervalMs);

    console.log('[GameStatePersistence] 自动保存已启动');
  }

  /**
   * 停止自动保存定时器
   */
  static stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('[GameStatePersistence] 自动保存已停止');
    }
  }

  /**
   * 配置自动保存
   */
  static configureAutoSave(config: Partial<AutoSaveConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
    console.log('[GameStatePersistence] 自动保存配置已更新:', this.currentConfig);
  }

  /**
   * 获取自动保存配置
   */
  static getAutoSaveConfig(): AutoSaveConfig {
    return { ...this.currentConfig };
  }

  /**
   * 加载最新的自动保存
   */
  static loadLatestAutoSave(): GameState | null {
    const saves: { key: string; time: number }[] = [];

    // 收集所有自动保存
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.AUTO_SAVE)) {
        const time = parseInt(key.split('_').pop() || '0');
        saves.push({ key, time });
      }
    }

    if (saves.length === 0) {
      return null;
    }

    // 按时间排序，获取最新的
    saves.sort((a, b) => b.time - a.time);
    return this.loadFromLocalStorage(saves[0].key);
  }

  /**
   * 导出游戏状态为文件
   */
  static exportToFile(gameState: GameState, filename?: string): void {
    const serialized = this.serializeGameState(gameState);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `daogaoyizhang_save_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[GameStatePersistence] 游戏状态已导出');
  }

  /**
   * 从文件导入游戏状态
   */
  static async importFromFile(file: File): Promise<GameState | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const serialized = event.target?.result as string;
          const gameState = this.deserializeGameState(serialized);
          resolve(gameState);
        } catch (error) {
          console.error('[GameStatePersistence] 导入失败:', error);
          resolve(null);
        }
      };

      reader.onerror = () => {
        console.error('[GameStatePersistence] 文件读取失败');
        resolve(null);
      };

      reader.readAsText(file);
    });
  }

  /**
   * 添加到游戏历史
   */
  static addToHistory(gameState: GameState, duration: number): void {
    try {
      const history = this.getGameHistory();
      const entry: GameHistoryEntry = {
        id: `history_${Date.now()}`,
        timestamp: Date.now(),
        gameId: gameState.id,
        players: gameState.players.map(p => p.name),
        winner: gameState.winner,
        victoryType: gameState.victoryType,
        turns: gameState.turn,
        duration
      };

      history.unshift(entry);

      // 只保留最近50条记录
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(trimmedHistory));

      console.log('[GameStatePersistence] 已添加到游戏历史');
    } catch (error) {
      console.error('[GameStatePersistence] 添加历史记录失败:', error);
    }
  }

  /**
   * 获取游戏历史
   */
  static getGameHistory(): GameHistoryEntry[] {
    try {
      const historyStr = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
      console.error('[GameStatePersistence] 获取历史记录失败:', error);
      return [];
    }
  }

  /**
   * 清空游戏历史
   */
  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    console.log('[GameStatePersistence] 游戏历史已清空');
  }

  /**
   * 准备断线重连数据
   */
  static prepareReconnectData(gameState: GameState): {
    gameId: string;
    playerId: string;
    timestamp: number;
    snapshot: string;
  } {
    return {
      gameId: gameState.id,
      playerId: gameState.players[gameState.currentPlayerIndex]?.id || '',
      timestamp: Date.now(),
      snapshot: this.serializeGameState(gameState)
    };
  }

  /**
   * 恢复断线重连
   */
  static restoreFromReconnect(snapshot: string): GameState | null {
    return this.deserializeGameState(snapshot);
  }

  /**
   * 验证游戏状态完整性
   */
  static validateGameState(gameState: GameState): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查必需字段
    if (!gameState.id) errors.push('缺少游戏ID');
    if (!gameState.players || gameState.players.length === 0) errors.push('没有玩家');
    if (!gameState.areas) errors.push('缺少区域数据');
    if (typeof gameState.turn !== 'number') errors.push('回合数无效');

    // 检查玩家数据
    gameState.players.forEach((player, index) => {
      if (!player.id) errors.push(`玩家${index}缺少ID`);
      if (!player.name) errors.push(`玩家${index}缺少名称`);
      if (!player.faction) errors.push(`玩家${index}缺少阵营`);
      if (typeof player.infiltrationLevel !== 'number') errors.push(`玩家${index}渗透等级无效`);
      if (typeof player.safetyLevel !== 'number') errors.push(`玩家${index}安全等级无效`);
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 清理所有存储数据
   */
  static clearAllStorage(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      // 清理主键
      localStorage.removeItem(key);

      // 清理自动保存
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(key)) {
          localStorage.removeItem(storageKey);
        }
      }
    });

    console.log('[GameStatePersistence] 所有存储数据已清理');
  }
}

export default GameStatePersistence;
