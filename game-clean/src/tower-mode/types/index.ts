export type { Coordinate2D, GridSize, ThemeCategory, CellType, CellState } from './cell.types';
export { CELL_STATE_TRANSITIONS } from './cell.types';
export type { BaseCell, EnemyPreviewData, BattleCell, ChanceCell, BookstoreCell, SkillCell, BossCell, EndCell, GameCell, ExecutionContext, TriggerContext } from './cell.types';
export { isBattleCell, isChanceCell, isBookstoreCell, isSkillCell, isBossCell, isEndCell } from './cell.types';

export type { ZoneType, EffectTarget, ZoneEffectConfig, ZoneVisualConfig, ZoneDefinition } from './zone.types';

export type { RarityLevel, PacketEffectType, PacketEffectDetail, DataPacket } from './reward.types';

export type { SkillQuality, SkillTriggerTiming, SkillEffectType, Skill, TierProbabilityRow } from './skill.types';

export type { BookQuality, BookEffectType, Book } from './book.types';

export type { ChanceEventType, ChanceEvent, EventOutcomeOption, Reward, Penalty, EventResult, ActionResultBase, BattleActionResult, ChanceActionResult, BookstoreActionResult, SkillActionResult, BossActionResult, CellActionResult } from './event.types';

export type { DiceModifierSource, DiceModifierApplied, DiceRollResult, ZoneTriggerResult, MovementResult, ReachableCell, MoveOption, ForceMoveReason, MovementEventType, MovementEventHandler } from './movement.types';

export type { TowerProgressState, LayerSnapshot, TowerSaveData } from './progress.types';

export type { PathConnection, LayerColorScheme, AmbientConfig, TowerLayerData } from './map.types';

export type { ThemeCategory, LevelDatabaseEntry, LevelPool, EnhancementParams, LayerAssignmentResult, TowerAssignmentResult, EnhancedBossConfig, AssignmentValidationResult, LayerConfig } from './levelAssignment.types';

export * from './integrator.types';
export type { HotspotConfig, LayerFeature, LayerMetadata, LayerState } from './layerMetadata.types';

export type {
  RewardType,
  RewardItem,
  RewardContext,
  RewardRequest,
  RewardResult,
  GrantedItem,
  RejectedItem,
  ConflictResolution,
  ConflictRule,
  ConflictInfo,
  ConflictResolutionOption,
  InventorySnapshot,
  GrantResult,
  BattleRewardResult,
  CanGrantCheck,
  RemoveResult,
  ReplaceResult,
  RewardStatistics,
  RejectReason,
  RewardSource,
} from './reward.types.extended';

export type {
  ProgressManagerState,
  GameSession,
  SaveMeta,
  LayerSnapshot,
  TowerSaveData,
  GameStatistics,
  Milestone,
  MilestoneCondition,
  MovementRecord,
  ImportResult,
} from './progress.types.extended';

export type {
  CellExecutor,
  ExecutorRegistry,
  ExecutionUIContract,
  ExecutionUIContractKey,
  LayerPreviewInfo,
} from './execution.types';

export type {
  DifficultyStar,
  LevelPoolEntry,
  MechanismType,
  BossMechanism,
  BossBaseStats,
  BossVisualConfig,
  GeneratedBoss,
  AssignmentResult,
  EnrichedTopology,
} from './enrichedTopology.types';

export { GourdRegion } from './gourdCoordinate.types';
export type { GourdCoordinate, GourdShapeParams } from './gourdCoordinate.types';

export { GourdShapeVariant } from './gourdShapeVariants.types';
export type { LayerShapeConfig, ShapeFactoryInput } from './gourdShapeVariants.types';

export type { PathType, CheckerboardBorder, QuadrantLabel, CellVisualStyle, CellStateVisualOverride, PathVisualStyle, ZoneBackgroundConfig } from './visualAssets.types';

export type {
  LayerBorderConfig,
  QuadrantLabelV2,
  CellVisualStyleV2,
  StateVisualOverride,
  PathVisualStyle,
  ZoneBackgroundV2,
  LayerBackground,
  DecorationItem,
  LayerVisualData,
  RenderableEnrichedTopology,
  RenderableEnrichedTopologyV3,
} from './renderableEnrichedTopology.types';

export type {
  DiceResult,
  DiceModifier,
  GamePhase,
  TurnContext,
  PathOption,
  CellMapState,
  CellInfoPanelData,
  ZoneEffectInstance,
  LayerSpecialMechanic,
  TowerBattleParams,
  TowerBonus,
  LayerThemeConfig,
  MechanicType,
  LayerSpecialMechanicData,
} from './gameMechanics.types';
