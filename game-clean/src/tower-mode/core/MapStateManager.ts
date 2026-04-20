import type { GridCell } from '../types/grid.types';

// 格子状态
export type CellState = 'locked' | 'available' | 'current' | 'cleared' | 'failed' | 'pending';

// 地图状态管理
export class MapStateManager {
  private cellStates: Map<string, CellState> = new Map();
  private clearedCount: number = 0;
  private currentCellId: string | null = null;
  private flippedCount: number = 0;
  private bossUnlocked: boolean = false;

  constructor() {}

  // 初始化格子状态
  initializeMap(cells: GridCell[], startCellId: string, bossCellId: string): void {
    // 所有格子初始锁定
    cells.forEach(cell => {
      if (cell.id === startCellId) {
        this.cellStates.set(cell.id, 'current');
        this.currentCellId = cell.id;
      } else if (cell.id === bossCellId) {
        this.cellStates.set(cell.id, 'locked');
      } else {
        this.cellStates.set(cell.id, 'locked');
      }
    });
    
    // 解锁起始格子周围的格子
    this.unlockAdjacentCells(startCellId);
  }

  // 获取格子状态
  getCellState(cellId: string): CellState {
    return this.cellStates.get(cellId) || 'locked';
  }

  // 设置格子状态
  setCellState(cellId: string, state: CellState): void {
    const oldState = this.cellStates.get(cellId);
    
    if (oldState === 'cleared' && state !== 'cleared') {
      this.clearedCount--;
    }
    
    this.cellStates.set(cellId, state);
    
    if (state === 'cleared' && oldState !== 'cleared') {
      this.clearedCount++;
      this.checkBossUnlock();
    }
    
    if (state === 'current') {
      this.currentCellId = cellId;
    }
  }

  // 获取当前位置
  getCurrentCellId(): string | null {
    return this.currentCellId;
  }

  // 获取已通关格子数
  getClearedCount(): number {
    return this.clearedCount;
  }

  // 检查Boss是否解锁
  isBossUnlocked(): boolean {
    return this.bossUnlocked;
  }

  // 获取已翻转次数
  getFlipCount(): number {
    return this.flippedCount;
  }

  // 地图翻转
  flipMap(): boolean {
    if (this.flippedCount >= 3) return false;
    
    this.flippedCount++;
    
    if (this.flippedCount >= 3) {
      this.bossUnlocked = true;
    }
    
    return true;
  }

  // 解锁相邻格子
  unlockAdjacentCells(cellId: string): void {
    // 这里简化处理，实际需要知道地图连接关系
  }

  // 内部：检查是否解锁Boss
  private checkBossUnlock(): void {
    if (this.clearedCount >= 9 && !this.bossUnlocked) {
      this.bossUnlocked = true;
    }
  }

  // 获取所有格子状态
  getAllCellStates(): Map<string, CellState> {
    return new Map(this.cellStates);
  }

  // 重置
  reset(): void {
    this.cellStates.clear();
    this.clearedCount = 0;
    this.currentCellId = null;
    this.flippedCount = 0;
    this.bossUnlocked = false;
  }
}

// 默认导出实例
export const defaultMapStateManager = new MapStateManager();
