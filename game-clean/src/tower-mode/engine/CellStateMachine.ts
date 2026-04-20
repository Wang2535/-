import type {
  GameCell,
  CellState,
  TowerLayerData,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
} from '../types';

export const CELL_STATE_TRANSITIONS: Record<CellState, CellState[]> = {
  locked: ['unlocked', 'pending'],
  pending: ['unlocked'],
  unlocked: ['current'],
  current: ['visited'],
  visited: ['completed', 'unlocked'],
  completed: [],
};

export interface StateTransitionResult {
  success: boolean;
  cellId: string;
  previousState: CellState;
  newState: CellState;
  reason: string;
  sideEffects: SideEffect[];
  errorMessage?: string;
}

export interface SideEffect {
  type: 'zone_trigger' | 'resource_change' | 'event_emit' | 'state_cascade';
  data?: Record<string, unknown>;
}

export interface CellTriggerContext {
  cell: GameCell;
  playerPosition: [number, number];
  turnNumber: number;
  diceValue?: number;
}

export interface PreActionInfo {
  actionType: CellType;
  canExecute: boolean;
  requiredInputs: Record<string, unknown>;
  expectedOutputs: string[];
  estimatedDurationMs: number;
}

type CellType = 'battle' | 'chance' | 'bookstore' | 'skill' | 'boss' | 'end';

export class CellStateMachine {
  static MAX_LOG_ENTRIES = 1000;

  private cellStates: Map<string, CellState> = new Map();
  private transitionLog: StateTransitionResult[] = [];

  constructor(cells: GameCell[] = []) {
    this.setInitialState(cells);
  }

  setInitialState(cells: GameCell[]): void {
    this.cellStates.clear();
    for (const cell of cells) {
      this.cellStates.set(cell.id, cell.state);
    }
  }

  getState(cellId: string): CellState {
    return this.cellStates.get(cellId) ?? 'locked';
  }

  requestTransition(params: {
    cellId: string;
    targetState: CellState;
    reason: string;
    force?: boolean;
  }): StateTransitionResult {
    const { cellId, targetState, reason, force = false } = params;
    const previousState = this.getState(cellId);

    const allowedTransitions = CELL_STATE_TRANSITIONS[previousState];
    const isValidTransition = allowedTransitions.includes(targetState);

    if (!isValidTransition && !force) {
      return {
        success: false,
        cellId,
        previousState,
        newState: previousState,
        reason,
        sideEffects: [],
        errorMessage: `非法转换: ${previousState} -> ${targetState}`,
      };
    }

    this.cellStates.set(cellId, targetState);

    const result: StateTransitionResult = {
      success: true,
      cellId,
      previousState,
      newState: targetState,
      reason,
      sideEffects: [],
    };

    this.logTransition(result);
    return result;
  }

  handlePlayerEnter(cellId: string, context?: Partial<CellTriggerContext>): StateTransitionResult[] {
    const currentState = this.getState(cellId);

    if (currentState !== 'unlocked') {
      return [{
        success: false,
        cellId,
        previousState: currentState,
        newState: currentState,
        reason: 'player_enter',
        sideEffects: [],
        errorMessage: `格子 ${cellId} 不是 unlocked 状态，无法进入`,
      }];
    }

    const result = this.requestTransition({
      cellId,
      targetState: 'current',
      reason: 'player_enter',
    });

    return [result];
  }

  handlePlayerExit(cellId: string): StateTransitionResult {
    const currentState = this.getState(cellId);

    if (currentState !== 'current') {
      return {
        success: false,
        cellId,
        previousState: currentState,
        newState: currentState,
        reason: 'player_exit',
        sideEffects: [],
        errorMessage: `格子 ${cellId} 不是 current 状态`,
      };
    }

    return this.requestTransition({
      cellId,
      targetState: 'visited',
      reason: 'player_exit',
    });
  }

  handleBattleComplete(cellId: string, victory: boolean): StateTransitionResult {
    const currentState = this.getState(cellId);

    if (currentState !== 'visited') {
      return {
        success: false,
        cellId,
        previousState: currentState,
        newState: currentState,
        reason: victory ? 'battle_victory' : 'battle_defeat',
        sideEffects: [],
        errorMessage: `格子 ${cellId} 不是 visited 状态`,
      };
    }

    return this.requestTransition({
      cellId,
      targetState: victory ? 'completed' : 'unlocked',
      reason: victory ? 'battle_victory' : 'battle_defeat',
    });
  }

  handleFunctionComplete(cellId: string): StateTransitionResult {
    const currentState = this.getState(cellId);

    if (currentState !== 'visited') {
      return {
        success: false,
        cellId,
        previousState: currentState,
        newState: currentState,
        reason: 'function_complete',
        sideEffects: [],
        errorMessage: `格子 ${cellId} 不是 visited 状态`,
      };
    }

    return this.requestTransition({
      cellId,
      targetState: 'completed',
      reason: 'function_complete',
    });
  }

  unlockNeighbors(cellId: string, layerData: TowerLayerData): StateTransitionResult[] {
    const results: StateTransitionResult[] = [];
    const neighbors = layerData.adjacencyList[cellId] ?? [];

    for (const neighborId of neighbors) {
      const neighborState = this.getState(neighborId);
      if (neighborState === 'locked') {
        const result = this.requestTransition({
          cellId: neighborId,
          targetState: 'unlocked',
          reason: 'neighbor_unlocked',
        });
        results.push(result);
      }
    }

    return results;
  }

  canTrigger(cellId: string): boolean {
    const state = this.getState(cellId);
    return state === 'unlocked' || state === 'current';
  }

  getCellsByState(state: CellState): string[] {
    const result: string[] = [];
    for (const [cellId, cellState] of this.cellStates) {
      if (cellState === state) {
        result.push(cellId);
      }
    }
    return result;
  }

  resetCell(cellId: string, targetState: CellState): StateTransitionResult {
    return this.requestTransition({
      cellId,
      targetState,
      reason: 'admin_force',
      force: true,
    });
  }

  private logTransition(result: StateTransitionResult): void {
    this.transitionLog.push(result);
    if (this.transitionLog.length > CellStateMachine.MAX_LOG_ENTRIES) {
      this.transitionLog = this.transitionLog.slice(-CellStateMachine.MAX_LOG_ENTRIES);
    }
  }

  getTransitionHistory(limit?: number): StateTransitionResult[] {
    const log = [...this.transitionLog];
    if (limit !== undefined && limit > 0) {
      return log.slice(-limit);
    }
    return log;
  }
}

export class CellTypeDispatcher {
  dispatch(cell: GameCell, context: CellTriggerContext): PreActionInfo | null {
    const cellType = cell.type as CellType;

    switch (cellType) {
      case 'battle':
        return this.dispatchBattle(cell as BattleCell, context);
      case 'chance':
        return this.dispatchChance(cell as ChanceCell, context);
      case 'bookstore':
        return this.dispatchBookstore(cell as BookstoreCell, context);
      case 'skill':
        return this.dispatchSkill(cell as SkillCell, context);
      case 'boss':
        return this.dispatchBoss(cell as BossCell, context);
      case 'end':
        return this.dispatchEnd(cell as EndCell, context);
      default:
        return null;
    }
  }

  private dispatchBattle(cell: BattleCell, _context: CellTriggerContext): PreActionInfo {
    return {
      actionType: 'battle',
      canExecute: !cell.isCompleted,
      requiredInputs: {
        levelId: cell.levelId,
        difficulty: cell.difficulty,
      },
      expectedOutputs: ['victory', 'defeat'],
      estimatedDurationMs: 30000,
    };
  }

  private dispatchChance(cell: ChanceCell, _context: CellTriggerContext): PreActionInfo {
    return {
      actionType: 'chance',
      canExecute: true,
      requiredInputs: {
        eventPoolIds: cell.eventPoolIds,
      },
      expectedOutputs: ['event_result'],
      estimatedDurationMs: 5000,
    };
  }

  private dispatchBookstore(cell: BookstoreCell, _context: CellTriggerContext): PreActionInfo {
    return {
      actionType: 'bookstore',
      canExecute: true,
      requiredInputs: {
        theme: cell.bookPoolTheme,
        bookCount: cell.bookCountPerVisit,
      },
      expectedOutputs: ['books_acquired'],
      estimatedDurationMs: 8000,
    };
  }

  private dispatchSkill(cell: SkillCell, _context: CellTriggerContext): PreActionInfo {
    return {
      actionType: 'skill',
      canExecute: true,
      requiredInputs: {
        tierProbabilityTable: cell.tierProbabilityTable,
        maxSlots: cell.maxSkillSlots,
      },
      expectedOutputs: ['skill_acquired'],
      estimatedDurationMs: 6000,
    };
  }

  private dispatchBoss(cell: BossCell, _context: CellTriggerContext): PreActionInfo {
    return {
      actionType: 'boss',
      canExecute: !cell.isDefeated,
      requiredInputs: {
        bossLevelId: cell.bossLevelId,
        enhancementLevel: cell.enhancementLevel,
      },
      expectedOutputs: ['victory', 'defeat'],
      estimatedDurationMs: 60000,
    };
  }

  private dispatchEnd(cell: EndCell, _context: CellTriggerContext): PreActionInfo {
    return {
      actionType: 'end',
      canExecute: true,
      requiredInputs: {
        destinationLayer: cell.destinationLayer,
      },
      expectedOutputs: ['layer_transition'],
      estimatedDurationMs: 3000,
    };
  }
}

export type {
  GameCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
  CellState,
  CellType,
};
