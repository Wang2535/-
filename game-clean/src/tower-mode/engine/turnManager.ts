import type { TypedEventBus, TowerEventType } from '../EventBus';
import type { DiceRollResult, MoveOption } from '../types/movement.types';
import type { GameCell, ZoneType } from '../types';

export type TurnPhase =
  | 'idle'
  | 'dice_rolled'
  | 'path_selected'
  | 'moving'
  | 'cell_action'
  | 'completed';

export interface TurnContext {
  turnNumber: number;
  phase: TurnPhase;
  turnActive: boolean;
  diceResult: DiceRollResult | null;
  selectedPath: MoveOption | null;
  currentCell: GameCell | null;
  zonesTriggered: ZoneType[];
  cellActionTriggered: boolean;
}

export interface TurnManagerOptions {
  diceMin?: number;
  diceMax?: number;
}

const VALID_TRANSITIONS: Record<TurnPhase, TurnPhase[]> = {
  idle: ['dice_rolled'],
  dice_rolled: ['path_selected', 'idle'],
  path_selected: ['moving', 'idle'],
  moving: ['cell_action', 'completed', 'idle'],
  cell_action: ['completed', 'idle'],
  completed: ['idle'],
};

export class TurnManager {
  private eventBus: TypedEventBus<TowerEventType>;
  private options: Required<TurnManagerOptions>;
  private context: TurnContext;

  constructor(eventBus: TypedEventBus<TowerEventType>, options?: TurnManagerOptions) {
    this.eventBus = eventBus;
    this.options = {
      diceMin: options?.diceMin ?? 1,
      diceMax: options?.diceMax ?? 6,
    };
    this.context = this.createInitialContext();
  }

  private createInitialContext(): TurnContext {
    return {
      turnNumber: 0,
      phase: 'idle',
      turnActive: false,
      diceResult: null,
      selectedPath: null,
      currentCell: null,
      zonesTriggered: [],
      cellActionTriggered: false,
    };
  }

  startTurn(): void {
    if (this.context.turnActive) {
      throw new Error(`Cannot start turn while turn is active`);
    }

    this.context = {
      ...this.context,
      turnNumber: this.context.turnNumber + 1,
      turnActive: true,
      phase: 'idle',
      diceResult: null,
      selectedPath: null,
      zonesTriggered: [],
      cellActionTriggered: false,
    };

    this.eventBus.emit('turn:start' as any, {
      turnNumber: this.context.turnNumber,
    } as any);
  }

  rollDice(): DiceRollResult {
    if (this.context.phase !== 'idle' && this.context.phase !== 'dice_rolled') {
      throw new Error(`Cannot roll dice in phase: ${this.context.phase}`);
    }

    const rawValue = Math.floor(Math.random() * (this.options.diceMax - this.options.diceMin + 1)) + this.options.diceMin;
    const result: DiceRollResult = {
      rawValue,
      modifiedValue: rawValue,
      modifiers: [],
    };

    this.context = {
      ...this.context,
      phase: 'dice_rolled',
      diceResult: result,
    };

    this.eventBus.emit('dice:rolled' as any, {
      turnNumber: this.context.turnNumber,
      result,
    } as any);

    return result;
  }

  selectPath(option: MoveOption): void {
    if (this.context.phase !== 'dice_rolled') {
      throw new Error(`Cannot select path in phase: ${this.context.phase}`);
    }

    this.context = {
      ...this.context,
      phase: 'path_selected',
      selectedPath: option,
    };

    this.eventBus.emit('path:selected' as any, {
      turnNumber: this.context.turnNumber,
      targetCellId: option.targetCell.id,
      distance: option.distance,
    } as any);
  }

  executeMove(): void {
    if (this.context.phase !== 'path_selected') {
      throw new Error(`Cannot execute move in phase: ${this.context.phase}`);
    }

    const path = this.context.selectedPath;
    if (path) {
      this.context.zonesTriggered = [...path.zoneWarnings];
      this.context.currentCell = path.targetCell;
    }

    this.context = {
      ...this.context,
      phase: 'moving',
    };

    this.eventBus.emit('move:completed' as any, {
      turnNumber: this.context.turnNumber,
      currentCellId: this.context.currentCell?.id ?? '',
      zonesTriggered: this.context.zonesTriggered,
    } as any);

    this.context = {
      ...this.context,
      phase: 'cell_action',
    };
  }

  triggerCellAction(): void {
    if (this.context.phase !== 'cell_action') {
      throw new Error(`Cannot trigger cell action in phase: ${this.context.phase}`);
    }

    this.context = {
      ...this.context,
      cellActionTriggered: true,
      phase: 'completed',
    };

    this.eventBus.emit('cell:action:trigger' as any, {
      turnNumber: this.context.turnNumber,
      cellId: this.context.currentCell?.id ?? '',
      cellType: this.context.currentCell?.type ?? '',
    } as any);
  }

  endTurn(): void {
    if (this.context.phase !== 'completed') {
      throw new Error(`Cannot end turn in phase: ${this.context.phase}`);
    }

    this.eventBus.emit('turn:end' as any, {
      turnNumber: this.context.turnNumber,
    } as any);

    this.context = {
      ...this.context,
      phase: 'idle',
      turnActive: false,
    };
  }

  getTurnState(): TurnContext {
    return { ...this.context };
  }

  reset(): void {
    this.context = this.createInitialContext();
  }
}
