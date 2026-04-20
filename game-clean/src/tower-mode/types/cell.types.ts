export type Coordinate2D = [number, number];

export type GridSize = { rows: number; cols: number };

export type ThemeCategory =
  | 'virus'
  | 'network'
  | 'data-security'
  | 'social-engineer'
  | 'industrial-iot'
  | 'mobile-terminal'
  | 'cloud-virtual'
  | 'ai-emerging'
  | 'security-mgmt';

export type CellType =
  | 'start'
  | 'battle'
  | 'chance'
  | 'bookstore'
  | 'skill'
  | 'boss'
  | 'end';

export type CellState =
  | 'locked'
  | 'unlocked'
  | 'visited'
  | 'current'
  | 'pending'
  | 'completed';

export const CELL_STATE_TRANSITIONS: Record<CellState, CellState[]> = {
  locked: ['unlocked', 'pending'],
  unlocked: ['current'],
  current: ['visited'],
  visited: ['completed'],
  pending: ['unlocked'],
  completed: [],
};

export type ZoneType = 'W' | 'N' | 'I' | 'P' | 'S' | 'D';

export type EffectTarget = 'self' | 'enemy' | 'global';

export type RarityLevel = 'common' | 'uncommon' | 'rare';

export type PacketEffectType =
  | 'buff_combat'
  | 'buff_draw'
  | 'buff_resource'
  | 'passive_info'
  | 'special_ability'
  | 'healing'
  | 'resistance';

export type BookQuality = 'common' | 'uncommon' | 'rare';
export type BookEffectType =
  | 'buff_combat'
  | 'buff_draw'
  | 'buff_resource'
  | 'passive_info'
  | 'special_ability'
  | 'healing'
  | 'resistance';

export type SkillQuality = 'common' | 'good' | 'rare' | 'epic' | 'legendary';
export type SkillTriggerTiming =
  | 'battle_start'
  | 'turn_start'
  | 'card_played'
  | 'damage_taken'
  | 'enemy_defeated'
  | 'on_move'
  | 'passive';

export type SkillEffectType =
  | 'damage_boost'
  | 'draw_extra'
  | 'heal'
  | 'shield'
  | 'info_reveal'
  | 'copy'
  | 'immunity'
  | 'special';

export type ChanceEventType = 'positive' | 'negative' | 'choice' | 'neutral';

export type RewardSource =
  | 'battle_victory'
  | 'boss_defeat'
  | 'chance_event'
  | 'zone_effect'
  | 'bookstore_purchase'
  | 'skill_grant'
  | 'special';

export interface EnemyPreviewData {
  name: string;
  icon: string;
  threatLevel: string;
}

export interface PacketEffectDetail {
  triggerCondition?: string;
  effectValue: number | string;
  isPermanent: boolean;
  stackable: boolean;
  conflictsWith?: string[];
}

export interface DataPacket {
  id: string;
  name: string;
  description: string;
  iconDescription: string;
  tier: number;
  theme: ThemeCategory;
  rarity: RarityLevel;
  effectType: PacketEffectType;
  effect: PacketEffectDetail;
  flavorText: string;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  coverTheme: string;
  tier: number;
  theme: ThemeCategory;
  quality: BookQuality;
  effectType: BookEffectType;
  effectDescription: string;
  flavorText: string;
  isRead: boolean;
}

export interface Skill {
  id: string;
  name: string;
  quality: SkillQuality;
  triggerTiming: SkillTriggerTiming;
  effectType: SkillEffectType;
  effectDescription: string;
  iconDescription: string;
  cooldown?: number;
  maxUses?: number;
  currentUses?: number;
  currentCooldown?: number;
}

export interface TierProbabilityRow {
  common: number;
  good: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface ZoneEffectConfig {
  effectType: 'dice_modifier' | 'resource_change' | 'map_effect' | 'special_grant';
  target: EffectTarget;
  magnitude: number;
  duration?: number;
  stackable: boolean;
  priority: number;
}

export interface ZoneVisualConfig {
  overlayColor: string;
  overlayOpacity: number;
  iconLabel: string;
  borderStyle?: string;
  animationClass?: string;
  particleEffectId?: string;
}

export interface ZoneDefinition {
  id: string;
  type: ZoneType;
  name: string;
  description: string;
  cellIds: string[];
  effect: ZoneEffectConfig;
  visualConfig: ZoneVisualConfig;
  maxTriggers?: number;
  cooldownTurns?: number;
  currentTriggerCount: number;
  lastTriggerTurn?: number;
}

export interface PathConnection {
  id: string;
  from: string;
  to: string;
  direction: 'bidirectional' | 'one-way';
  pathType: 'main' | 'shortcut' | 'bridge';
  distance: number;
  visualStyle?: string;
}

export interface Reward {
  type: string;
  id: string;
  name: string;
  quantity?: number;
  description?: string;
}

export interface Penalty {
  type: string;
  value: number;
  description: string;
}

export interface EventOutcomeOption {
  id: string;
  label: string;
  description: string;
  rewards?: Reward[];
  penalties?: Penalty[];
}

export interface ChanceEvent {
  id: string;
  name: string;
  description: string;
  eventType: ChanceEventType;
  rarity: RarityLevel;
  tierRange: [number, number];
  outcomeOptions?: EventOutcomeOption[];
}

export interface EventResult {
  eventId: string;
  optionSelected?: string;
  rewards: Reward[];
  penalties: Penalty[];
  message: string;
}

export interface GrantedItem {
  id: string;
  type: string;
  name: string;
  grantedAt: number;
  source: RewardSource;
}

export interface BaseCell {
  id: string;
  coordinate: Coordinate2D;
  type: CellType;
  state: CellState;
  zone?: ZoneType;
  metadata?: Record<string, unknown>;
}

export interface BattleCell extends BaseCell {
  type: 'battle';
  levelId: string;
  difficulty: number;
  isCompleted: boolean;
  rewardCardId?: string;
  enemyPreview?: EnemyPreviewData;
}

export interface ChanceCell extends BaseCell {
  type: 'chance';
  eventPoolIds: string[];
  visitLimit?: number;
  currentVisitCount: number;
}

export interface BookstoreCell extends BaseCell {
  type: 'bookstore';
  bookPoolTheme: ThemeCategory;
  bookCountPerVisit: number;
}

export interface SkillCell extends BaseCell {
  type: 'skill';
  tierProbabilityTable: TierProbabilityRow;
  maxSkillSlots: number;
}

export interface BossCell extends BaseCell {
  type: 'boss';
  bossLevelId: string;
  isDefeated: boolean;
  enhancementLevel: number;
  dataPacketPoolIds: string[];
  layerNumber: number;
}

export interface EndCell extends BaseCell {
  type: 'end';
  destinationLayer: number;
}

export type GameCell = BattleCell | ChanceCell | BookstoreCell | SkillCell | BossCell | EndCell;

export interface TowerProgressState {
  gameId: string;
  seed: number;
  startTime: number;
  currentLayer: number;
  layersCompleted: number[];
  layerEntryTimes: Record<number, number>;
  currentPosition: Coordinate2D;
  currentCellId: string;
  visitedCells: string[];
  cellsByState: Record<CellState, string[]>;
  battlesWon: number;
  battlesLost: number;
  defeatedBosses: string[];
  acquiredDataPackets: DataPacket[];
  ownedSkills: Skill[];
  activeSkillIds: string[];
  readBooks: Book[];
  totalMoves: number;
  diceRolls: number;
  zonesTriggered: Record<ZoneType, number>;
  totalPlayTimeSeconds: number;
}

export interface TowerLayerData {
  layerNumber: number;
  themeId: ThemeCategory;
  shapeType: string;
  shapeDescription: string;
  gridSize: GridSize;
  totalCells: number;
  cells: GameCell[];
  cellIndex: Record<string, GameCell>;
  paths: PathConnection[];
  adjacencyList: Record<string, string[]>;
  zones: ZoneDefinition[];
  zoneIndex: Record<string, ZoneDefinition>;
  startCellId: string;
  bossCellId: string;
  endCellId: string | null;
  colorScheme: LayerColorScheme;
  ambientConfig: AmbientConfig;
}

export interface ExecutionContext {
  playerId: string;
  currentState: TowerProgressState;
  layerData: TowerLayerData;
  timestamp: number;
}

export interface TriggerContext extends ExecutionContext {
  triggerCell: GameCell;
  previousCell?: GameCell;
  diceValue?: number;
}

export interface ActionResultBase {
  success: boolean;
  cellId: string;
  executionTimeMs: number;
  nextState?: CellState;
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

export interface LayerColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  pathColor: string;
  zoneColors: Record<ZoneType, string>;
}

export interface AmbientConfig {
  lighting: string;
  atmosphere: string;
  particleEffects: string[];
}

export function isBattleCell(cell: GameCell): cell is BattleCell {
  return cell.type === 'battle';
}
export function isChanceCell(cell: GameCell): cell is ChanceCell {
  return cell.type === 'chance';
}
export function isBookstoreCell(cell: GameCell): cell is BookstoreCell {
  return cell.type === 'bookstore';
}
export function isSkillCell(cell: GameCell): cell is SkillCell {
  return cell.type === 'skill';
}
export function isBossCell(cell: GameCell): cell is BossCell {
  return cell.type === 'boss';
}
export function isEndCell(cell: GameCell): cell is EndCell {
  return cell.type === 'end';
}
