import type { GameCell, ZoneType, Coordinate2D, TowerLayerData, DiceRollResult, MoveOption, MovementResult } from '../types';
import type { ZoneEffectManager } from './ZoneEffectManager';

export class MovementEngine {
  private layerData: TowerLayerData | null = null;
  private currentPositionCellId: string = '';
  private lastDiceResult: DiceRollResult | null = null;
  private canMoveFlag: boolean = true;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private zoneEffectManager: ZoneEffectManager | null = null;

  constructor(zoneEffectManager?: ZoneEffectManager) {
    this.zoneEffectManager = zoneEffectManager ?? null;
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  loadLayerData(data: TowerLayerData): void {
    this.layerData = data;
  }

  setStartPosition(cellId: string): void {
    this.currentPositionCellId = cellId;
  }

  resetForNewTurn(): void {
    this.lastDiceResult = null;
    this.canMoveFlag = true;
  }

  canMove(): boolean {
    return this.canMoveFlag;
  }

  rollDice(): DiceRollResult {
    const rawValue = Math.floor(Math.random() * 6) + 1;
    const modifiers: { source: string; delta: number; description: string }[] = [];

    if (this.zoneEffectManager && this.layerData) {
      const currentCell = this.layerData.cellIndex[this.currentPositionCellId];
      if (currentCell?.coordinate) {
        const modifier = this.zoneEffectManager.getDiceModifier(currentCell.coordinate, this.layerData);
        if (modifier !== 0) {
          modifiers.push({
            source: 'zone_effect',
            delta: modifier,
            description: `区域效果 ${modifier > 0 ? '+' : ''}${modifier}`
          });
        }
      }
    }

    const modifiedValue = Math.max(1, Math.min(6, rawValue + modifiers.reduce((sum, m) => sum + m.delta, 0)));

    const result: DiceRollResult = {
      rawValue,
      modifiedValue,
      modifiers
    };

    this.lastDiceResult = result;
    this.emit('dice_rolled', result);
    return result;
  }

  getLastDiceResult(): DiceRollResult | null {
    return this.lastDiceResult;
  }

  getMoveOptions(diceValue: number): MoveOption[] {
    if (!this.layerData) return [];
    if (!this.currentPositionCellId) return [];

    const options: MoveOption[] = [];
    const visited = new Map<string, number>(); // 使用 Map 记录访问距离
    const queue: Array<{ cellId: string; path: GameCell[]; distance: number }> = [
      { cellId: this.currentPositionCellId, path: [], distance: 0 }
    ];
    visited.set(this.currentPositionCellId, 0);

    while (queue.length > 0) {
      const { cellId, path, distance } = queue.shift()!;
      const cell = this.layerData.cellIndex[cellId];

      if (!cell) continue;

      if (distance > 0 && distance <= diceValue) {
        const zoneWarnings: ZoneType[] = [];
        if (cell.zone) {
          zoneWarnings.push(cell.zone);
        }

        options.push({
          targetCell: cell,
          path: path.map(c => c.coordinate),
          distance,
          zoneWarnings,
          recommended: cell.type !== 'boss' || distance === diceValue,
          riskScore: cell.type === 'boss' ? 10 : cell.type === 'battle' ? 5 : 1,
        });
      }

      if (distance < diceValue) {
        const neighbors = this.layerData.adjacencyList[cellId] ?? [];
        for (const neighborId of neighbors) {
          const neighborCell = this.layerData.cellIndex[neighborId];
          if (neighborCell) {
            const currentDistance = visited.get(neighborId);
            // 只有当这个邻居还没有被访问过，或者通过当前路径可以到达的距离更短时，才继续处理
            if (currentDistance === undefined || distance + 1 < currentDistance) {
              visited.set(neighborId, distance + 1);
              queue.push({
                cellId: neighborId,
                path: [...path, cell],
                distance: distance + 1
              });
            }
          }
        }
      }
    }

    return options;
  }

  async executeMove(targetCellId: string, animationConfig?: unknown): Promise<MovementResult> {
    if (!this.layerData) {
      throw new Error('No layer data loaded');
    }

    const fromCell = this.layerData.cellIndex[this.currentPositionCellId];
    const toCell = this.layerData.cellIndex[targetCellId];

    if (!fromCell || !toCell) {
      throw new Error('Cell not found');
    }

    const zonesTriggered: Array<{ zoneId: string; zoneType: ZoneType; effectApplied: boolean; effectDetail: string }> = [];

    if (toCell.zone) {
      const zone = this.layerData.zones.find(z => z.cellIds.includes(targetCellId));
      if (zone) {
        zonesTriggered.push({
          zoneId: zone.id,
          zoneType: zone.type,
          effectApplied: true,
          effectDetail: zone.description
        });
      }
    }

    this.currentPositionCellId = targetCellId;
    this.canMoveFlag = false;

    const result: MovementResult = {
      success: true,
      fromCell,
      toCell,
      diceRoll: this.lastDiceResult ?? { rawValue: 1, modifiedValue: 1, modifiers: [] },
      pathTaken: [fromCell, toCell],
      zonesTriggered,
      distance: 1,
      timeMs: 100,
    };

    this.emit('move_completed', result);
    return result;
  }

  getCurrentPosition(): { cell: GameCell; coord: Coordinate2D } {
    if (!this.layerData) {
      return {
        cell: {
          id: '',
          coordinate: [0, 0],
          type: 'battle',
          state: 'locked',
          levelId: '',
          difficulty: 1,
          isCompleted: false
        } as GameCell,
        coord: [0, 0]
      };
    }

    const cell = this.layerData.cellIndex[this.currentPositionCellId];
    return {
      cell: cell ?? {
        id: this.currentPositionCellId,
        coordinate: [0, 0],
        type: 'battle',
        state: 'locked',
        levelId: '',
        difficulty: 1,
        isCompleted: false
      } as GameCell,
      coord: cell?.coordinate ?? [0, 0]
    };
  }
}
