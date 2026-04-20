/**
 * 《道高一丈：数字博弈》v16.0 - 游戏引擎模块导出
 * 
 * 集中导出所有游戏引擎模块，便于统一管理和使用
 */

// 核心游戏引擎
// export { GameEngine } from './gameEngine';

// 资源管理
export { ResourceController } from './ResourceController';

// AI系统
export { default as AIPlayer } from './aiPlayer';

// 关卡模式AI系统
export {
  LevelAIController,
  type AIOperationLog,
  type AIDecision,
  type VisualizationUpdateData
} from './LevelAIController';

export {
  AIDecisionDelayManager,
  type DecisionImportance,
  type DelayConfig,
  type DecisionContext
} from './AIDecisionDelayManager';

export {
  DadongAIStrategy,
  type DadongMode,
  type SafetyThresholds,
  type CardPriority,
  type ResourceType,
  type ResourceBalanceRule,
  DEFAULT_SAFETY_THRESHOLDS,
  DADONG_RESOURCE_RULES
} from './DadongAIStrategy';

export {
  EnemyAIStrategy,
  type EnemyStrategy,
  type StrategyCondition,
  type EnhancedThreatAssessment,
  type UpcomingThreat,
  type WeakPoint,
  type ActionEvaluation
} from './EnemyAIStrategy';

export {
  AIDecisionFormatter,
  type StandardizedDecisionResult,
  type TurnExecutionReport,
  type PhaseLog,
  type DecisionStatistics
} from './AIDecisionFormatter';

export {
  BaseAI,
  type AIDifficulty,
  type AIOperationLog as BaseAIOperationLog,
  type ThreatAssessment,
  type PlayerIntent
} from './BaseAI';

// 回合状态系统
export { RoundStateSystem } from './RoundStateSystem';
export { 
  RoundStateEffectSystem,
  type StructuredEffect,
  type RoundStateEffectType,
  type EffectExecutionResult 
} from './RoundStateEffectSystem';

// 科技树系统 (R5.0, R5.1, R5.2)
export {
  TECH_LEVEL_CONFIGS,
  calculateTechLevel,
  getTechLevelConfig,
  calculateCheckModifier,
  calculateLevelBonus,
  calculateComboBonus,
  calculateFinalLevelChange,
  isTechLevelUnlocked,
  getNextTechLevelInfo,
  applyTechBonus,
  getTechLevelName,
  type TechLevel,
  type TechLevelConfig,
  type TechBonusApplication
} from './TechTreeSystem';

// 科技树抽卡系统 (R5.3)
export { 
  TechTreeDrawSystem,
  type DrawResult 
} from './TechTreeDrawSystem';

// 猜拳机制系统 (R6.1)
export { 
  RPSMechanicSystem,
  rpsSystem,
  type RPSChoice,
  type RPSOutcome,
  type RPSResult,
  type RPSOptions,
  type RPSSkillEffect
} from './RPSMechanicSystem';

// 光环类卡牌系统 (R7.3)
export { 
  AuraCardSystem,
  type AuraCardInstance,
  type AuraApplicationResult 
} from './AuraCardSystem';

// 区域控制加成系统 (R3.1)
export {
  AREA_BONUSES,
  INITIAL_AREA_CONTROL,
  calculateAreaController,
  updateAllAreaControls,
  calculateTotalAreaBonus,
  applyAreaControlBonus,
  getAreaName,
  isAdvantageousArea,
  type AreaControlBonus
} from './AreaControlSystem';

// 区域标记系统 (R3.0, R7.3)
export {
  AreaMarkerSystem,
  areaMarkerSystem,
  type AreaType,
  type MarkerType,
  type Faction,
  type AreaMarker,
  type AreaState,
  type AreaControlEffect
} from './AreaMarkerSystem';

// 阶段时间限制系统 (R4.2)
export {
  PHASE_TIME_CONFIGS,
  calculatePhaseTime,
  createTimerState,
  PhaseTimer,
  getPhaseTimeDescription,
  isTimedPhase,
  GamePhaseTimerManager,
  phaseTimerManager,
  type PhaseTimeConfig,
  type PhaseTimerState,
  type TimerCallback
} from './PhaseTimerSystem';

// 7阶段回合流程系统 (R4.2)
export { 
  TurnPhaseSystem,
  type PhaseResult 
} from './TurnPhaseSystem';

// 游戏状态持久化系统 (H4)
export {
  GameStatePersistence,
  type SerializedGameState,
  type GameHistoryEntry,
  type AutoSaveConfig
} from './GameStatePersistence';

// 卡牌效果解析系统 (H3)
export {
  CardEffectParser,
  EffectExecutor,
  executeCard,
  getCardEffectPreview,
  type ParsedEffect,
  type ParsedEffectType,
  type EffectTarget,
  type EffectContext,
  type EffectResult
} from './CardEffectParser';

// 卡牌特殊效果系统 (R7.2)
export {
  CardEffectSystem,
  cardEffectSystem,
  type SpecialEffectType,
  type ComboEffect,
  type DelayEffect,
  type DeathrattleEffect,
  type PersistentEffect,
  type CardSpecialEffect
} from './CardEffectSystem';

// 游戏日志系统 (L3修复)
export {
  GameLogger,
  gameLogger,
  type LogLevel,
  type LogType,
  type StructuredLogEntry,
  type LogDetails,
  type LoggerConfig
} from './GameLogger';

// 肉鸽选择系统 (R5.1.1)
export {
  RogueSelectionSystem,
  rogueSelectionSystem,
  type RogueOption,
  type RogueEffect,
  type RogueRarity,
  type RogueEffectType,
  type RogueSelectionResult,
  type RogueSelectionSession
} from './RogueSelectionSystem';

// 角色系统
export {
  CharacterSystem,
  characterSystem,
  ALL_CHARACTERS,
  type Character,
  type CharacterSkill,
  type SkillContext,
  type SkillEffectResult,
  type CharacterType,
  type CharacterFaction
} from './CharacterSystem';

// 角色专属卡牌系统
export {
  CharacterCardSystem,
  CHARACTER_CARD_DATABASE,
  ALL_CHARACTER_CARDS,
  CHARACTER_CARD_MAP,
  type CharacterId,
  type CharacterCard
} from './CharacterCardSystem';

// 2v2团队对战系统
export {
  TeamBattleSystem,
  teamBattleSystem,
  TeamResourceManager,
  TeamActionManager,
  SynergySkillSystem,
  TeamVictorySystem,
  TEAM_RESOURCE_LIMITS,
  TEAM_RESOURCE_INITIAL,
  TEAM_RESOURCE_RECOVERY,
  type TeamId,
  type TeamPlayer,
  type Team,
  type TeamResources,
  type TeamTurnState,
  type SynergyType,
  type SynergySkill,
  type TeamCard,
  type TeamVictoryConditions
} from './TeamBattleSystem';

// 2v2角色技能适配器
export {
  Character2v2Adapter,
  type Skill2v2Adjustment,
  type SkillAdjustmentType
} from './Character2v2Adapter';

// 角色技能执行器
export {
  executeCharacterSkill,
  initCharacterState,
  getCharacterState,
  executeAR01_GamblerIntuition,
  executeAR01_DoubleDown,
  executeAR02_BehaviorAnalysis,
  executeAR02_PredictiveCounter,
  executeAR03_FalseSignal,
  executeAR03_IdentitySwitch,
  executeAC01_ProbabilityCloud,
  executeAC01_QuantumSuperposition,
  executeDR01_ShieldIntuition,
  executeDR01_DefensiveStance,
  executeDR02_MirrorReflection,
  executeDR02_PerfectMirror,
  executeDC01_ProbabilityAnchor,
  executeDC01_StableCheck,
  type SkillExecutionResult,
  type SkillEffect
} from './CharacterSkillExecutor';

// 连击效果系统 (R7.2)
export {
  initComboState,
  getComboState,
  resetComboState,
  hasComboEffect,
  parseComboEffect,
  checkComboCondition,
  executeComboCheck,
  calculateGameComboBonus,
  getComboVisualEffectClass,
  predictNextCombo,
  getComboChainInfo,
  type GameComboEffect,
  type ComboState,
  type ComboTriggerResult
} from './ComboEffectSystem';

// 游戏主循环系统 (R4.2完整实现)
export {
  GameLoop,
  type GameLoopConfig
} from './GameLoop';

// 胜利条件检测系统 (R1.1, R1.2, R1.3)
export {
  checkVictoryConditions,
  getVictoryProgress,
  checkImminentVictory,
  type VictoryResult
} from './VictoryConditionSystem';

// 完整卡牌数据库 (R8.0 - 95种卡牌)
export {
  ATTACKER_CARDS,
  DEFENDER_CARDS,
  ALL_CARDS,
  CARD_DATABASE,
  getCardById,
  getCardByCode,
  getCardsByFactionAndRarity,
  getCardsByTechLevel,
} from './CardDatabase';

// 亡语效果系统 (R8.4)
export {
  DeathrattleSystem,
  type DeathrattleType,
  type DeathrattleCard,
  type DeathrattleTriggerResult,
} from './DeathrattleSystem';

// 延迟效果系统 (R8.5)
export {
  DelayedEffectSystem,
  type DelayedEffectType,
  type DelayedEffect,
  type DelayedEffectInstance,
  type DelayedEffectTriggerResult,
} from './DelayedEffectSystem';

// 骰子判定系统 (R6.1)
export {
  performDiceCheck,
  DICE_CONFIG,
  type DiceCheckResult,
  type DiceResultType,
} from './DiceSystem';

// 效果结算系统 (R7.4)
export {
  EffectExecutionSystem,
  executeCardEffect,
  type EffectPhase,
  type CardEffectExecutionResult,
  type EffectExecutionContext,
} from './EffectExecutionSystem';

// 手牌规则系统 (R4.3)
export {
  HandRuleSystem,
  handRuleSystem,
  HAND_RULE_CONFIG,
  type HandState,
  type HandDrawResult,
  type DiscardResult,
  type HandRuleCheckResult,
} from './HandRuleSystem';

// 判定修正系统 (R6.3)
export {
  CheckModifierSystem,
  checkModifierSystem,
  DEFAULT_MODIFIER_CONFIG,
  TECH_LEVEL_VALUES,
  AREA_ADVANTAGE,
  type GameArea,
  type ModifierType,
  type CheckModifier,
  type CheckModifierResult,
  type ModifierConfig,
} from './CheckModifierSystem';

// 待处理判定系统
export {
  PendingJudgmentSystem,
  pendingJudgmentSystem,
  type JudgmentType,
  type JudgmentSource,
  type PendingJudgment,
  type JudgmentEffect,
  type JudgmentResult,
  type JudgmentResolution,
} from './PendingJudgmentSystem';

// 响应系统
export {
  ResponseSystem,
  responseSystem,
  type ResponseEventType,
  type ResponseEvent,
  type ResponseResult,
  type ResponseSystemState,
} from './ResponseSystem';

// 默认导出
export { default } from './GameStateManager_v2';
