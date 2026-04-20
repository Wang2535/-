import type { TypedEventBus, TowerEventType } from '../EventBus';
import { BattleIntegration } from './battleIntegration';
import type {
  IBattlePlayerState,
  BattleSetup,
  BattleResult,
  GameOverCheck,
} from './battleIntegration';
import type { GameCell } from '../types';

export type BattlePhase =
  | 'idle'
  | 'prepared'
  | 'resolved';

export interface BattleOrchestratorState {
  phase: BattlePhase;
  currentSetup: BattleSetup | null;
  lastResult: BattleResult | null;
  currentCellId: string | null;
}

export class BattleOrchestrator {
  private eventBus: TypedEventBus<TowerEventType>;
  private battleIntegration: BattleIntegration;
  private state: BattleOrchestratorState;

  constructor(eventBus: TypedEventBus<TowerEventType>, battleIntegration?: BattleIntegration) {
    this.eventBus = eventBus;
    this.battleIntegration = battleIntegration ?? new BattleIntegration();
    this.state = {
      phase: 'idle',
      currentSetup: null,
      lastResult: null,
      currentCellId: null,
    };
  }

  prepareBattle(cell: GameCell, playerState: IBattlePlayerState): BattleSetup {
    const setup = this.battleIntegration.setupBattle(cell, playerState);

    this.state = {
      ...this.state,
      phase: 'prepared',
      currentSetup: setup,
      currentCellId: cell.id,
    };

    this.eventBus.emit('battle:prepared' as any, {
      cellId: cell.id,
      isBossBattle: setup.isBossBattle,
      levelId: setup.levelEntry.levelId,
    } as any);

    return setup;
  }

  resolveBattle(
    result: BattleResult,
    cell: GameCell,
    playerState: IBattlePlayerState,
  ): { updatedPlayerState: IBattlePlayerState; gameOverCheck: GameOverCheck } {
    const updatedPlayerState = this.battleIntegration.processBattleResult(
      result, cell, playerState,
    );

    this.state = {
      ...this.state,
      phase: 'resolved',
      lastResult: result,
    };

    this.eventBus.emit('battle:resolved' as any, {
      cellId: cell.id,
      victory: result.victory,
      technicalValueChange: result.technicalValueChange,
    } as any);

    const gameOverCheck: GameOverCheck = { gameOver: false };
    if (!result.victory) {
      const resources = updatedPlayerState.coreResources;
      if (resources.hp <= 0) {
        gameOverCheck.gameOver = true;
        gameOverCheck.reason = '生命值耗尽';
      }
    }

    return { updatedPlayerState, gameOverCheck };
  }

  retreatBattle(
    cell: GameCell,
    playerState: IBattlePlayerState,
  ): IBattlePlayerState {
    const updated = { ...playerState };
    const currentCount = updated.failureHistory[cell.id] ?? 0;
    updated.failureHistory = { ...updated.failureHistory, [cell.id]: currentCount + 1 };

    this.state = {
      ...this.state,
      phase: 'resolved',
    };

    this.eventBus.emit('battle:retreated' as any, {
      cellId: cell.id,
    } as any);

    return updated;
  }

  getBattleState(): BattleOrchestratorState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      phase: 'idle',
      currentSetup: null,
      lastResult: null,
      currentCellId: null,
    };
  }
}
