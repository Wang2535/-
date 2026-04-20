/**
 * 类型导出索引文件
 * 统一导出所有类型定义
 */

// 游戏规则类型
export type {
  Faction,
  Player,
  GameState,
  GameLogEntry,
  TurnPhase,
  Resources,
  ResourceType,
  AreaType,
  AreaState,
  Token,
  TokenType,
  Defense,
  TechLevel,
  TechLevelDefinition,
  EffectType,
  EffectTarget,
  EffectTrigger,
  CardEffect,
  SpecialEffectType,
  InfiltrationLevel,
  SafetyLevel,
  RPSChoice,
  RPSResult,
  RPSDuelResult,
  RPSEffect,
  RPSMechanicConfig,
  DiceSuccessLevel,
  DiceRollResult,
  DiceMechanicConfig,
  ZoneType
} from './gameRules';

// 卡牌规则类型
export type {
  CardFaction,
  CardType,
  CardRarity,
  CardDefinition,
  CardName,
  CardEffect as CardEffectDef,
  AttackerCardId,
  DefenderCardId,
  CommonCardId,
  CardId
} from './cardRules';

// 角色规则类型
export type {
  CharacterId,
  CharacterFaction,
  CharacterType,
  CharacterRole,
  DifficultyRating,
  SkillType,
  SkillDefinition,
  SpecialMechanic,
  CharacterBaseStats,
  CharacterDefinition,
  RPSCharacter,
  ChanceCharacter,
  SpecialCharacter
} from './characterRules';

// 常量导出
export {
  ATTACKER_VICTORY_CONDITIONS,
  DEFENDER_VICTORY_CONDITIONS,
  INITIAL_RESOURCES,
  RESOURCE_LIMITS,
  RESOURCE_RECOVERY_PER_TURN,
  TURN_PHASES,
  INITIAL_HAND_SIZE,
  DRAW_COUNT_PER_TURN,
  HAND_LIMIT,
  AREA_STRATEGIC_VALUE,
  ZONE_CONTROL_THRESHOLDS,
  TECH_LEVELS,
  KEYWORD_DEFINITIONS,
  EFFECT_RESOLUTION_ORDER
} from './gameRules';

// 严格类型定义 (L4修复)
export type {
  Faction as StrictFaction,
  PlayerType as StrictPlayerType,
  AIDifficulty as StrictAIDifficulty,
  PlayerStatus as StrictPlayerStatus,
  TurnPhase as StrictTurnPhase,
  GameState as StrictGameState,
  ResourceType as StrictResourceType,
  AreaType as StrictAreaType,
  AreaControlStatus as StrictAreaControlStatus,
  CardType as StrictCardType,
  CardRarity as StrictCardRarity,
  CardStatus as StrictCardStatus,
  CardLocation as StrictCardLocation,
  TechLevel as StrictTechLevel,
  TechLevelString as StrictTechLevelString,
  DiceResultType as StrictDiceResultType,
  DifficultyLevel as StrictDifficultyLevel,
  RPSChoice as StrictRPSChoice,
  RPSResult as StrictRPSResult,
  LogLevel as StrictLogLevel,
  LogType as StrictLogType,
  VictoryType as StrictVictoryType,
  EffectTrigger as StrictEffectTrigger,
  EffectTarget as StrictEffectTarget,
  EffectType as StrictEffectType,
} from './strictTypes';

export {
  PHASE_NAMES,
  RESOURCE_TYPE_NAMES,
  RESOURCE_TYPE_ICONS,
  AREA_TYPE_NAMES,
  TECH_LEVEL_NAMES,
  DICE_RESULT_NAMES,
  RPS_CHOICE_NAMES,
  VICTORY_TYPE_NAMES,
  isValidFaction,
  isValidPlayerType,
  isValidTurnPhase,
  isValidResourceType,
  isValidTechLevel,
  isValidRPSChoice,
  techLevelToString,
  techLevelFromString,
} from './strictTypes';
