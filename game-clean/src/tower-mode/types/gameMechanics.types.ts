export interface DiceResult {
  baseValue: number;
  finalValue: number;
  modifiers: DiceModifier[];
  isCritSuccess: boolean;
  isCritFail: boolean;
}

export interface DiceModifier {
  type: 'zone_w' | 'zone_s' | 'skill' | 'event' | 'layer_mechanic';
  source: string;
  delta: number;
  description?: string;
}

export type GamePhase =
  | 'idle'
  | 'dice_ready'
  | 'dice_rolling'
  | 'dice_result'
  | 'path_selecting'
  | 'moving'
  | 'cell_arrived'
  | 'cell_interacting'
  | 'battle_preparing'
  | 'battle_active'
  | 'battle_settling'
  | 'turn_ending'
  | 'layer_transitioning';

export interface TurnContext {
  turnNumber: number;
  currentLayer: number;
  diceResult: DiceResult | null;
  phase: GamePhase;
  playerPosition: string | null;
  visitedCellsThisTurn: string[];
  pendingCellId: string | null;
  availablePaths: PathOption[];
}

export interface PathOption {
  pathCells: string[];
  targetCellId: string;
  totalSteps: number;
  direction: 'forward' | 'branch_left' | 'branch_right';
}

export type CellMapState =
  | 'locked'
  | 'pending'
  | 'current'
  | 'arrived'
  | 'interacting'
  | 'waiting'
  | 'cleared'
  | 'failed'
  | 'skipped';

export interface CellInfoPanelData {
  cellId: string;
  cellType: 'battle' | 'bookstore' | 'skill' | 'exchange'
           | 'opportunity' | 'chance' | 'special' | 'transition' | 'boss';
  name: string;
  difficultyStars: 1 | 2 | 3 | 4 | 5;
  enemyPreview?: { name: string; type: string; powerEstimate: number };
  rewardPreview?: { cardNames: string[]; techValueGain: number; goldGain: number };
  resourceReward?: { compute: number; fund: number; info: number };
  canEnter: boolean;
  canSkip: boolean;
  skipPenalty?: string;
}

export interface ZoneEffectInstance {
  zoneType: 'W' | 'N' | 'I' | 'P' | 'S' | 'D';
  effectType: 'stat_mod' | 'dice_mod' | 'special_trigger' | 'visual_only';
  value: number;
  duration: number;
  description: string;
  triggerCondition?: string;
}

export interface LayerSpecialMechanic {
  layer: number;
  name: string;
  description: string;
  type: 'acceleration' | 'jump' | 'sequence' | 'event' | 'blockade'
       | 'teleport' | 'drift' | 'collapse' | 'protocol';
  triggerCondition: string;
  effect: string;
  visualHint?: string;
}

export interface TowerBattleParams {
  cellId: string;
  layerNumber: number;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  bonuses: TowerBonus[];
}

export interface TowerBonus {
  source: 'book' | 'skill' | 'datapack' | 'milestone' | 'resource_threshold';
  description: string;
  statEffect: { stat: string; value: number }[];
}
