import type { TowerGameEngine } from './TowerGameEngine';

export type MechanicEffectResult =
  | { type: 'none' }
  | { type: 'bonus_steps'; amount: number }
  | { type: 'blockade_penalty'; amount: number }
  | { type: 'teleport_triggered'; to: string }
  | { type: 'protocol_violation'; returnToCell: string }
  | { type: 'sequence_violation'; returnToCell: string };

export interface MechanicState {
  currentLayer: number;
  pendingSteps: number;
  wStreakCount: number;
}

export class MechanicEffectEngine {
  private engine: TowerGameEngine;

  constructor(engine: TowerGameEngine) {
    this.engine = engine;
  }

  onCellArrived(_cellId: string, _layer: number): MechanicEffectResult {
    return { type: 'none' };
  }

  onTurnStart(_layer: number): MechanicEffectResult {
    return { type: 'none' };
  }

  getState(): MechanicState {
    return {
      currentLayer: this.engine.getCurrentLayer(),
      pendingSteps: 0,
      wStreakCount: 0,
    };
  }
}
