import { gameEventBus } from '../EventBus';
import type { TowerModeController } from '../TowerModeController';

export type FlowPhase = 'idle' | 'initializing' | 'playing' | 'battle' | 'event' | 'shopping' | 'skill_select' | 'layer_transition' | 'boss_battle' | 'reward_select' | 'game_over' | 'victory';

export interface TurnResult {
  success: boolean;
  phase: FlowPhase;
  message?: string;
}

export class FullGameFlowController {
  private controller: TowerModeController;
  private flowPhase: FlowPhase = 'idle';
  private currentLayer: number = 1;
  private battlesWon: number = 0;
  private battlesWonThisLayer: number = 0;
  private totalBattlesNeeded: number = 9;
  private flipCount: number = 0;
  private maxFlips: number = 3;
  private technicalValue: number = 50;
  private milestoneThresholds: number[] = [90, 180, 270];
  private reachedMilestones: Set<number> = new Set();

  constructor(controller: TowerModeController) {
    this.controller = controller;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    gameEventBus.on('battle:end', (data) => {
      if (data.result.victory) {
        this.handleBattleVictory(data);
      } else {
        this.handleBattleDefeat(data);
      }
    });

    gameEventBus.on('layer:transition', (data) => {
      this.handleLayerTransition(data);
    });

    gameEventBus.on('game:over', (data) => {
      this.flowPhase = data.reason === 'victory' ? 'victory' : 'game_over';
    });

    gameEventBus.on('technicalValue:change', (data) => {
      this.technicalValue = data.newValue;
      this.checkMilestones();
    });
  }

  async startNewGame(seed?: number): Promise<void> {
    this.flowPhase = 'initializing';
    this.currentLayer = 1;
    this.battlesWon = 0;
    this.battlesWonThisLayer = 0;
    this.flipCount = 0;
    this.technicalValue = 50;
    this.reachedMilestones.clear();

    await this.controller.startNewGame(seed);
    this.flowPhase = 'playing';
  }

  async executeTurn(): Promise<TurnResult> {
    if (this.flowPhase !== 'playing') {
      return { success: false, phase: this.flowPhase, message: 'Not in playing phase' };
    }

    const diceResult = this.controller.rollDice();
    return { success: true, phase: this.flowPhase };
  }

  async handleCellInteraction(cellId: string): Promise<TurnResult> {
    if (this.flowPhase !== 'playing') {
      return { success: false, phase: this.flowPhase };
    }

    try {
      await this.controller.moveToCell(cellId);
      return { success: true, phase: this.flowPhase };
    } catch (error) {
      return { success: false, phase: this.flowPhase, message: error instanceof Error ? error.message : 'Move failed' };
    }
  }

  async handleBattle(result: { victory: boolean; cellId: string }): Promise<void> {
    if (result.victory) {
      this.handleBattleVictory(result);
    } else {
      this.handleBattleDefeat(result);
    }
  }

  async handleLayerTransition(data: { fromLayer: number; toLayer: number }): Promise<void> {
    this.currentLayer = data.toLayer;
    this.battlesWonThisLayer = 0;
    this.flowPhase = 'layer_transition';
  }

  getFlowPhase(): FlowPhase {
    return this.flowPhase;
  }

  getCurrentLayer(): number {
    return this.currentLayer;
  }

  getBattlesWon(): number {
    return this.battlesWon;
  }

  getFlipCount(): number {
    return this.flipCount;
  }

  getTechnicalValue(): number {
    return this.technicalValue;
  }

  private handleBattleVictory(data: { result?: { victory: boolean; rewards: unknown[] }; cellId?: string }): void {
    this.battlesWon++;
    this.battlesWonThisLayer++;
    this.technicalValue += 3;
    this.flowPhase = 'playing';
    this.checkMilestones();
  }

  private handleBattleDefeat(data: { result?: { victory: boolean; rewards: unknown[] }; cellId?: string }): void {
    this.technicalValue = Math.max(0, this.technicalValue - 60);
    this.flowPhase = 'playing';

    if (this.technicalValue <= 0) {
      this.flowPhase = 'game_over';
      gameEventBus.emit('game:over', { reason: 'technical_value_depleted' });
    }
  }

  private checkMilestones(): void {
    for (const threshold of this.milestoneThresholds) {
      if (this.technicalValue >= threshold && !this.reachedMilestones.has(threshold)) {
        this.reachedMilestones.add(threshold);
        gameEventBus.emit('milestone:reached', { milestone: { threshold, type: 'technicalValue' } });
      }
    }
  }

  dispose(): void {
    this.flowPhase = 'idle';
  }
}
