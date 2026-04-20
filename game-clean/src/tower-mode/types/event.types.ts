import type { RarityLevel } from './reward.types';
import type { ZoneType } from './zone.types';
import type { Coordinate2D } from './cell.types';
import type { GameCell } from './cell.types';
import type { DataPacket } from './reward.types';
import type { Book } from './book.types';
import type { Skill } from './skill.types';

export type ChanceEventType = 'positive' | 'negative' | 'choice' | 'neutral';

export interface ChanceEvent {
  id: string;
  name: string;
  description: string;
  eventType: ChanceEventType;
  rarity: RarityLevel;
  tierRange: [number, number];
  outcomeOptions?: EventOutcomeOption[];
}

export interface EventOutcomeOption {
  id: string;
  label: string;
  description: string;
  rewards?: Reward[];
  penalties?: Penalty[];
}

export interface Reward {
  type: 'data_packet' | 'book' | 'skill' | 'resource';
  item?: DataPacket | Book | Skill;
  amount?: number;
  description: string;
}

export interface Penalty {
  type: 'resource' | 'hp' | 'debuff';
  amount?: number;
  description: string;
}

export interface EventResult {
  eventId: string;
  optionSelected?: string;
  rewards: Reward[];
  penalties: Penalty[];
  message: string;
}

export interface ActionResultBase {
  success: boolean;
  cellId: string;
  executionTimeMs: number;
  nextState?: import('./cell.types').CellState;
}

export interface BattleActionResult extends ActionResultBase {
  type: 'battle';
  victory: boolean;
  rewards: Reward[];
  newCardsUnlocked?: string[];
  experienceGained: number;
}

export interface ChanceActionResult extends ActionResultBase {
  type: 'chance';
  eventId: string;
  result: EventResult;
}

export interface BookstoreActionResult extends ActionResultBase {
  type: 'bookstore';
  selectedBook: Book;
  effectApplied: boolean;
}

export interface SkillActionResult extends ActionResultBase {
  type: 'skill';
  acquiredSkill: Skill;
  replacedSkill?: Skill;
  slotChanged: boolean;
}

export interface BossActionResult extends ActionResultBase {
  type: 'boss';
  victory: boolean;
  dataPacketsOffered: DataPacket[];
  selectedPacket?: DataPacket;
  nextLayerUnlocked: boolean;
}

export type CellActionResult =
  | BattleActionResult
  | ChanceActionResult
  | BookstoreActionResult
  | SkillActionResult
  | BossActionResult;
