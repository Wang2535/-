import type { GameCell, CellType, CellState, Coordinate2D, BattleCell, ChanceCell, BookstoreCell, SkillCell, BossCell, EndCell, RewardSource } from './cell.types';
import type { TowerLayerData } from './map.types';
import type { ZoneType, ZoneDefinition } from './zone.types';
import type { DataPacket } from './reward.types';
import type { Book } from './book.types';
import type { Skill } from './skill.types';
import type { ChanceEvent, EventResult, ActionResultBase, BattleActionResult, ChanceActionResult, BookstoreActionResult, SkillActionResult, BossActionResult } from './event.types';
import type { ExecutionUIContract } from './execution.types';
import type { InventorySnapshot, RewardResult } from './reward.types.extended';
import type { TowerProgressState } from './progress.types';
import type { GameSession, SaveMeta, GameStatistics, Milestone } from './progress.types.extended';
import type { DiceRollResult, MoveOption, MovementResult } from './movement.types';

export type GamePhase =
  | 'idle'
  | 'map_overview'
  | 'map_selecting'
  | 'initializing'
  | 'playing'
  | 'paused'
  | 'transitioning'
  | 'battle_active'
  | 'ui_interaction'
  | 'game_complete'
  | 'disposing';

export type ActiveModalType =
  | 'battle_entrance'
  | 'chance_event'
  | 'bookstore'
  | 'skill_offer'
  | 'boss_reward'
  | 'layer_transition'
  | 'game_complete'
  | 'save_load'
  | 'settings';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  duration?: number;
  timestamp: number;
}

export interface AnimationTask {
  id: string;
  type: 'move' | 'zone_trigger' | 'cell_unlock' | 'transition';
  target: string;
  config: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed';
}

export interface TowerUIState {
  activeModal: ActiveModalType | null;
  modalData: unknown;
  notifications: Notification[];
  highlightedCells: string[];
  animationQueue: AnimationTask[];
}

export interface ModuleInstances {
  levelEngine: ILevelAssignmentEngine;
  cellStateMachine: ICellStateMachine;
  zoneManager: IZoneEffectManager;
  movementEngine: IMovementEngine;
  actionExecutor: ICellActionExecutor;
  rewardSystem: IRewardSystem;
  progressManager: IProgressManager;
}

export interface PlayerStatsDisplay {
  layer: number;
  hp: { current: number; max: number };
  activeSkills: SkillSummary[];
  packetCount: number;
  bookCount: number;
  moveCount: number;
}

export interface SkillSummary {
  id: string;
  name: string;
  quality: string;
}

export interface RenderCellData {
  cell: GameCell;
  screenPosition: { x: number; y: number };
  isReachable: boolean;
  isHighlighted: boolean;
  zoneOverlay?: { color: string; opacity: number };
}

export interface TowerRenderState {
  phase: GamePhase;
  layerData: TowerLayerData | null;
  cells: RenderCellData[];
  currentPosition: Coordinate2D;
  diceResult: DiceRollResult | null;
  moveOptions: MoveOption[];
  playerStats: PlayerStatsDisplay;
  uiState: TowerUIState;
}

export interface TowerInitConfig {
  seed?: number;
  saveSlotId?: string;
  debugMode?: boolean;
  skipAnimations?: boolean;
}

export interface TowerError {
  code: string;
  message: string;
  module?: string;
  recoverable: boolean;
}

export interface IntegratorState {
  phase: GamePhase;
  isInitialized: boolean;
  isPaused: boolean;
  currentLayer: number;
  currentLayerData: TowerLayerData | null;
  uiState: TowerUIState;
}

export interface ILevelAssignmentEngine {
  initializePools(levelDatabase: unknown[]): void;
  assignLayer(layerNumber: number, config?: unknown): unknown;
}

export interface ICellStateMachine {
  handlePlayerEnter(cellId: string, context: unknown): unknown[];
  getState(cellId: string): CellState;
  setInitialState(cells: GameCell[]): void;
  handleBattleComplete(cellId: string, victory: boolean): unknown;
  handleFunctionComplete(cellId: string): unknown;
  unlockNeighbors(cellId: string, layerData: TowerLayerData): unknown[];
  canTrigger(cellId: string): boolean;
  getCellsByState(state: CellState): string[];
  resetCell(cellId: string, targetState: CellState): unknown;
}

export interface IZoneEffectManager {
  detectZonesAtPosition(position: Coordinate2D, layerData: TowerLayerData): ZoneDefinition[];
  applyEffectsOnEnter(position: Coordinate2D, layerData: TowerLayerData, turnNumber: number, context?: unknown): unknown;
  getDiceModifier(position: Coordinate2D, layerData: TowerLayerData): number;
  onTurnEnd(turnNumber: number): void;
  resetAll(): void;
}

export interface IMovementEngine {
  loadLayerData(data: TowerLayerData): void;
  setStartPosition(cellId: string): void;
  rollDice(): DiceRollResult;
  getMoveOptions(diceValue: number): MoveOption[];
  executeMove(targetCellId: string, animationConfig?: unknown): Promise<MovementResult>;
  getCurrentPosition(): { cell: GameCell; coord: Coordinate2D };
  canMove(): boolean;
  resetForNewTurn(): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
}

export interface ICellActionExecutor {
  execute(cell: GameCell, context: unknown): Promise<unknown>;
  cancelExecution(): void;
  isExecuting(): boolean;
}

export interface IRewardSystem {
  processReward(request: unknown): Promise<RewardResult>;
  grantDataPacket(packet: DataPacket, source: RewardSource): Promise<unknown>;
  grantBook(book: Book, source: RewardSource): Promise<unknown>;
  grantSkill(skill: Skill, source: RewardSource, replaceSlotIndex?: number): Promise<unknown>;
  grantBattleReward(levelId: string, victory: boolean): Promise<unknown>;
  getInventory(): InventorySnapshot;
  resetInventory(): void;
  restoreFromSnapshot(snapshot: InventorySnapshot): void;
}

export interface IProgressManager {
  newGame(seed?: number): GameSession;
  loadSave(slotId: string): TowerProgressState;
  saveGame(slotId?: string, saveName?: string): Promise<SaveMeta>;
  updatePosition(cellId: string, coord: Coordinate2D): void;
  recordBattle(result: BattleActionResult): void;
  recordBossDefeat(layerNumber: number, packets: DataPacket[]): void;
  recordLayerComplete(layerNumber: number): void;
  recordZoneTrigger(zoneType: ZoneType): void;
  getCurrentProgress(): TowerProgressState;
  getStatistics(): GameStatistics;
  checkMilestones(): Milestone[];
  getCompletionPercentage(): number;
  listSaves(): SaveMeta[];
  enableAutoSave(intervalMs?: number): void;
  disableAutoSave(): void;
  resetCurrentGame(): void;
}
