import type { ZoneType } from './zone.types';
import type { GameCell } from './cell.types';
import type { Coordinate2D } from './cell.types';

export type DiceModifierSource =
  | 'zone_S'
  | 'zone_W'
  | 'skill'
  | 'buff'
  | 'item';

export interface DiceModifierApplied {
  source: DiceModifierSource;
  zoneType?: ZoneType;
  delta: number;
  description: string;
}

export interface DiceRollResult {
  rawValue: number;
  modifiedValue: number;
  modifiers: DiceModifierApplied[];
}

export interface ZoneTriggerResult {
  zoneId: string;
  zoneType: ZoneType;
  effectApplied: boolean;
  effectDetail: string;
}

export interface MovementResult {
  success: boolean;
  fromCell: GameCell;
  toCell: GameCell;
  diceRoll: DiceRollResult;
  pathTaken: GameCell[];
  zonesTriggered: ZoneTriggerResult[];
  distance: number;
  timeMs: number;
}

export interface ReachableCell {
  cell: GameCell;
  distance: number;
  path: Coordinate2D[];
  isOptimal: boolean;
  zoneWarnings: ZoneType[];
}

export interface MoveOption {
  targetCell: GameCell;
  path: Coordinate2D[];
  distance: number;
  zoneWarnings: ZoneType[];
  recommended: boolean;
  riskScore: number;
}

export type ForceMoveReason =
  | 'event_effect'
  | 'skill_effect'
  | 'zone_teleport'
  | 'admin_command';

/** 移动事件类型 */
export type MovementEventType =
  | 'dice_rolled'
  | 'move_started'
  | 'move_step'
  | 'move_completed'
  | 'move_cancelled'
  | 'zone_entered'
  | 'position_changed'
  | 'turn_skipped';

/** 移动事件处理器类型 */
export type MovementEventHandler = (data: unknown) => void;
