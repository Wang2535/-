import { TypedEventBus, eventBus, gameEventBus } from './EventBus';
import type { TowerEventType } from './EventBus';
import { classifyError, getErrorRule, type ModuleError } from './errorHandling/errorPropagation';
import { LevelAssignmentEngine } from './engine/LevelAssignmentEngine';
import { CellStateMachine } from './engine/CellStateMachine';
import { ZoneEffectManager, ZONE_EFFECT_CONFIG } from './engine/ZoneEffectManager';
import { MovementEngine } from './engine/MovementEngine';
import { CellActionExecutor } from './engine/CellActionExecutor';
import { RewardSystem } from './engine/RewardSystem';
import { ProgressManager } from './engine/ProgressManager';
import { getLayerData } from './data/layerRegistry';
import { THEME_LEVELS, BOSS_LEVELS, TIER_THEME_MAP } from './data/themeLevelMapping';
import { TechnicalValueManager } from './core/TechnicalValueManager';
import { CoreResourcesManager } from './core/CoreResourcesManager';
import { SkillManager } from './core/SkillManager';
import { CardManager } from './core/CardManager';

import type {
  GamePhase,
  ActiveModalType,
  Notification,
  TowerUIState,
  ModuleInstances,
  PlayerStatsDisplay,
  RenderCellData,
  TowerRenderState,
  TowerInitConfig,
  TowerError,
  IntegratorState,
  TowerLayerData,
  GameCell,
  CellState,
  Coordinate2D,
  DiceRollResult,
  MoveOption,
  MovementResult,
  DataPacket,
  InventorySnapshot,
  RewardSource,
  TowerProgressState,
  GameSession,
  SaveMeta,
  GameStatistics,
  Milestone,
  ZoneType,
  BattleActionResult,
} from './types';

import { layerStateManager } from './engine/LayerStateManager';
import type { LayerState } from './types';

type StateChangeCallback = (state: TowerRenderState) => void;
type PhaseChangeCallback = (phase: GamePhase) => void;
type ErrorCallback = (error: TowerError) => void;

export class TowerModeController {
  private state: IntegratorState;
  private eventBus: TypedEventBus<TowerEventType>;
  private modules: ModuleInstances;
  private stateChangeCallbacks: Set<StateChangeCallback> = new Set();
  private phaseChangeCallbacks: Set<PhaseChangeCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private unsubscribeFns: (() => void)[] = [];

  private realLevelEngine: LevelAssignmentEngine | null = null;
  private realRewardSystem: RewardSystem | null = null;
  private realActionExecutor: CellActionExecutor | null = null;
  private realProgressManager: ProgressManager | null = null;
  private realCellStateMachine: CellStateMachine | null = null;
  private realZoneManager: ZoneEffectManager | null = null;
  private realMovementEngine: MovementEngine | null = null;
  private realTechnicalValueManager: TechnicalValueManager | null = null;
  private realCoreResourcesManager: CoreResourcesManager | null = null;
  private realSkillManager: SkillManager | null = null;
  private realCardManager: CardManager | null = null;

  constructor() {
    this.state = {
      phase: 'idle',
      isInitialized: false,
      isPaused: false,
      currentLayer: 1,
      currentLayerData: null,
      uiState: {
        activeModal: null,
        modalData: null,
        notifications: [],
        highlightedCells: [],
        animationQueue: [],
      },
    };

    this.eventBus = eventBus;

    this.modules = {
      levelEngine: null as never,
      cellStateMachine: null as never,
      zoneManager: null as never,
      movementEngine: null as never,
      actionExecutor: null as never,
      rewardSystem: null as never,
      progressManager: null as never,
    };
  }

  async initialize(config?: TowerInitConfig): Promise<void> {
    console.log('[TowerModeController] initialize() called');
    this.setPhase('initializing');

    try {
      console.log('[TowerModeController] Creating ProgressManager...');
      this.realProgressManager = new ProgressManager(config?.saveSlotId);
      console.log('[TowerModeController] Creating RewardSystem...');
      this.realRewardSystem = new RewardSystem();
      console.log('[TowerModeController] Creating TechnicalValueManager...');
      this.realTechnicalValueManager = new TechnicalValueManager();
      console.log('[TowerModeController] Creating CoreResourcesManager...');
      this.realCoreResourcesManager = new CoreResourcesManager();
      console.log('[TowerModeController] Creating SkillManager...');
      this.realSkillManager = new SkillManager();
      console.log('[TowerModeController] Creating CardManager...');
      this.realCardManager = new CardManager();

      console.log('[TowerModeController] Creating CellActionExecutor...');
      this.realActionExecutor = new CellActionExecutor(this.realRewardSystem);

      console.log('[TowerModeController] Creating ZoneEffectManager...');
      this.realZoneManager = new ZoneEffectManager([], ZONE_EFFECT_CONFIG);
      console.log('[TowerModeController] Creating MovementEngine...');
      this.realMovementEngine = new MovementEngine(this.realZoneManager);

      console.log('[TowerModeController] Creating CellStateMachine...');
      this.realCellStateMachine = new CellStateMachine([]);

      console.log('[TowerModeController] Creating LevelAssignmentEngine...');
      this.realLevelEngine = new LevelAssignmentEngine();
      // 初始化关卡池
      console.log('[TowerModeController] Creating level database...');
      const levelDatabase = this.createLevelDatabase();
      console.log('[TowerModeController] Initializing pools with', levelDatabase.length, 'levels');
      this.realLevelEngine.initializePools(levelDatabase);

      this.modules.levelEngine = this.realLevelEngine;
      this.modules.cellStateMachine = this.realCellStateMachine;
      this.modules.zoneManager = this.realZoneManager;
      this.modules.movementEngine = this.realMovementEngine;
      this.modules.actionExecutor = this.realActionExecutor;
      this.modules.rewardSystem = this.realRewardSystem;
      this.modules.progressManager = this.realProgressManager;
      // 添加新模块到modules对象（动态添加）
      (this.modules as any).technicalValueManager = this.realTechnicalValueManager;
      (this.modules as any).coreResourcesManager = this.realCoreResourcesManager;
      (this.modules as any).skillManager = this.realSkillManager;
      (this.modules as any).cardManager = this.realCardManager;

      console.log('[TowerModeController] Wiring event bus...');
      this.wireEventBus();
      console.log('[TowerModeController] Wiring UI bridge...');
      this.wireUIBridge();

      this.state.isInitialized = true;
      console.log('[TowerModeController] Setting phase to idle');
      this.setPhase('idle');
      console.log('[TowerModeController] initialize() completed successfully');
    } catch (error) {
      console.error('[TowerModeController] initialize() failed:', error);
      this.handleError({
        code: 'INIT_FAILED',
        message: error instanceof Error ? error.message : 'Initialization failed',
        module: 'TowerModeController',
        recoverable: false,
      });
      throw error;
    }
  }

  async startNewGame(seed?: number): Promise<void> {
    if (!this.state.isInitialized) {
      throw new Error('Controller not initialized');
    }

    const gameSeed = seed ?? Date.now();
    this.realProgressManager!.newGame(gameSeed);
    this.state.currentLayer = 1;

    this.loadLayerData(1);

    this.setPhase('playing');
    this.addNotification('info', '新游戏开始！祝你好运！');
  }

  async continueFromSave(slotId: string): Promise<void> {
    if (!this.state.isInitialized) {
      throw new Error('Controller not initialized');
    }

    const progress = this.realProgressManager!.loadSave(slotId);
    this.state.currentLayer = progress.currentLayer;

    this.loadLayerData(progress.currentLayer);

    this.setPhase('playing');
    this.addNotification('info', '存档加载成功！');
  }

  pause(): void {
    if (this.state.phase === 'playing') {
      this.state.isPaused = true;
      this.setPhase('paused');
    }
  }

  resume(): void {
    if (this.state.phase === 'paused') {
      this.state.isPaused = false;
      this.setPhase('playing');
    }
  }

  async dispose(): Promise<void> {
    this.setPhase('disposing');

    this.unsubscribeFns.forEach(fn => fn());
    this.unsubscribeFns = [];

    this.stateChangeCallbacks.clear();
    this.phaseChangeCallbacks.clear();
    this.errorCallbacks.clear();

    this.eventBus.removeAllListeners();

    this.realLevelEngine = null;
    this.realRewardSystem = null;
    this.realActionExecutor = null;
    this.realProgressManager = null;
    this.realCellStateMachine = null;
    this.realZoneManager = null;
    this.realMovementEngine = null;

    this.modules = {
      levelEngine: null as never,
      cellStateMachine: null as never,
      zoneManager: null as never,
      movementEngine: null as never,
      actionExecutor: null as never,
      rewardSystem: null as never,
      progressManager: null as never,
    };

    this.state.isInitialized = false;
    this.state.currentLayerData = null;
    this.state.currentLayer = 1;
    this.state.isPaused = false;
    this.state.uiState = {
      activeModal: null,
      modalData: null,
      notifications: [],
      highlightedCells: [],
      animationQueue: [],
    };
    this.state.phase = 'idle';
  }

  rollDice(): DiceRollResult {
    if (!this.canAct()) {
      throw new Error('Cannot roll dice in current phase');
    }

    const result = this.realMovementEngine!.rollDice();
    this.emitStateChange();
    return result;
  }

  async moveToCell(cellId: string): Promise<MovementResult> {
    if (!this.canAct()) {
      throw new Error('Cannot move in current phase');
    }

    const result = await this.realMovementEngine!.executeMove(cellId);

    this.realProgressManager!.updatePosition(
      cellId,
      result.toCell?.coordinate ?? [0, 0] as Coordinate2D
    );

    this.eventBus.emit('MOVE_COMPLETE', {
      from: result.fromCell?.id ?? '',
      to: cellId,
      diceResult: result.diceRoll?.modifiedValue ?? 0,
    });

    this.emitStateChange();
    return result;
  }

  getAvailableMoves(): MoveOption[] {
    if (!this.realMovementEngine) return [];
    try {
      const diceResult = this.realMovementEngine.getLastDiceResult();
      const diceValue = diceResult?.modifiedValue ?? diceResult?.rawValue ?? 0;
      if (diceValue === 0) return [];
      return this.realMovementEngine.getMoveOptions(diceValue);
    } catch (e) {
      console.error('[TowerModeController] getAvailableMoves error:', e);
      return [];
    }
  }

  async interactWithCurrentCell(action: string, payload?: unknown): Promise<void> {
    // 允许在 playing 或 ui_interaction 阶段进行交互
    const canInteract = (this.state.phase === 'playing' || this.state.phase === 'ui_interaction') && !this.state.isPaused;
    if (!canInteract) {
      throw new Error('Cannot interact in current phase');
    }

    const uiBridge = this.realActionExecutor!.getUIBridge();

    switch (action) {
      case 'confirm':
        uiBridge.resolveUI({ action: 'confirm' });
        break;
      case 'retreat':
        uiBridge.resolveUI({ action: 'retreat' });
        this.closeModal();
        break;
      case 'select_option':
        uiBridge.resolveUI({ action: 'select', optionId: (payload as { optionId: string }).optionId });
        break;
      case 'select_book':
        uiBridge.resolveUI({ action: 'select', bookId: (payload as { bookId: string }).bookId });
        break;
      case 'select_skill':
        uiBridge.resolveUI({ action: 'select', skillId: (payload as { skillId: string }).skillId, replaceSlot: (payload as { replaceSlot?: number }).replaceSlot });
        break;
      case 'select_packet':
        uiBridge.resolveUI({ action: 'select', packetId: (payload as { packetId: string }).packetId });
        break;
      case 'proceed':
        uiBridge.resolveUI({ action: 'proceed' });
        break;
      default:
        uiBridge.resolveUI({ action, ...payload as object });
    }

    this.emitStateChange();
  }

  quickSave(): Promise<void> {
    return this.realProgressManager!.saveGame('quicksave', '快速存档');
  }

  openMenu(menuType: 'save' | 'load' | 'settings'): void {
    this.state.uiState.activeModal = menuType === 'save' || menuType === 'load' ? 'save_load' : 'settings';
    this.emitStateChange();
  }

  getPhase(): GamePhase {
    return this.state.phase;
  }

  getRenderState(): TowerRenderState {
    let coord: Coordinate2D = [0, 0];
    try {
      const pos = this.realMovementEngine?.getCurrentPosition();
      if (pos?.coord) {
        coord = pos.coord;
      }
    } catch (e) {
      console.error('[TowerModeController] getCurrentPosition error:', e);
      coord = [0, 0];
    }
    const inventory = this.realRewardSystem?.getInventory();
    const progress = this.realProgressManager?.getCurrentProgress();
    const diceResult = this.realMovementEngine?.getLastDiceResult() ?? null;
    const coreResources = this.realCoreResourcesManager?.getResources();
    const technicalValue = this.realTechnicalValueManager?.getValue();
    const maxTechnicalValue = this.realTechnicalValueManager?.getMaxValue();

    return {
      phase: this.state.phase,
      layerData: this.state.currentLayerData,
      cells: this.buildRenderCells(),
      currentPosition: coord,
      diceResult,
      moveOptions: this.getAvailableMoves(),
      playerStats: {
        layer: this.state.currentLayer,
        hp: { current: inventory?.hp ?? 100, max: inventory?.maxHp ?? 100 },
        activeSkills: (inventory?.activeSkillIds ?? []).map(id => ({
          id,
          name: id,
          quality: 'common',
        })),
        packetCount: inventory?.dataPackets?.length ?? 0,
        bookCount: inventory?.readBooks?.length ?? 0,
        moveCount: progress?.totalMoves ?? 0,
        technicalValue: {
          current: technicalValue ?? 50,
          max: maxTechnicalValue ?? 810,
        },
        coreResources: coreResources ? {
          coreComputing: coreResources.coreComputing,
          coreFunds: coreResources.coreFunds,
          coreInformation: coreResources.coreInformation,
          corePrivilege: coreResources.corePrivilege,
        } : {
          coreComputing: 10,
          coreFunds: 15,
          coreInformation: 5,
          corePrivilege: 0,
        },
      },
      uiState: { ...this.state.uiState },
    };
  }

  canAct(): boolean {
    return this.state.phase === 'playing' && !this.state.isPaused;
  }

  getLayerState(layerNumber: number): LayerState {
    return layerStateManager.getLayerState(layerNumber);
  }

  getAllLayerStates(): Record<number, LayerState> {
    return layerStateManager.getAllLayerStates();
  }

  completeCurrentLayer(): void {
    const currentLayer = this.state.currentLayer;
    if (currentLayer > 0) {
      const wasCompleted = layerStateManager.completeLayer(currentLayer);
      if (wasCompleted) {
        this.eventBus.emit('layerUnlocked', {
          unlockedLayer: currentLayer + 1,
          completedLayer: currentLayer
        });
        this.addNotification('success', `第${currentLayer}层完成！第${currentLayer + 1}层已解锁`);
      }
    }
  }

  onPhaseChange(callback: PhaseChangeCallback): void {
    this.phaseChangeCallbacks.add(callback);
  }

  onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.add(callback);
  }

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.add(callback);
  }

  openModal(modalType: ActiveModalType, data?: unknown): void {
    this.state.uiState.activeModal = modalType;
    this.state.uiState.modalData = data;
    this.setPhase('ui_interaction');
    this.emitStateChange();
  }

  closeModal(): void {
    this.state.uiState.activeModal = null;
    this.state.uiState.modalData = null;
    if (this.state.phase === 'ui_interaction') {
      this.setPhase('playing');
    }
    this.emitStateChange();
  }

  addNotification(type: Notification['type'], message: string, duration?: number): void {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      duration: duration ?? 3000,
      timestamp: Date.now(),
    };
    this.state.uiState.notifications.push(notification);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.state.uiState.notifications = this.state.uiState.notifications.filter(
          n => n.id !== notification.id
        );
        this.emitStateChange();
      }, notification.duration);
    }

    this.emitStateChange();
  }

  removeNotification(id: string): void {
    this.state.uiState.notifications = this.state.uiState.notifications.filter(n => n.id !== id);
    this.emitStateChange();
  }

  private setPhase(phase: GamePhase): void {
    const oldPhase = this.state.phase;
    this.state.phase = phase;
    this.phaseChangeCallbacks.forEach(cb => cb(phase));
    this.eventBus.emit('PHASE_CHANGE', { from: oldPhase, to: phase });
    this.emitStateChange();
  }

  private emitStateChange(): void {
    const renderState = this.getRenderState();
    const layerStates = this.getAllLayerStates();
    const enrichedState = { ...renderState, layerStates };
    this.stateChangeCallbacks.forEach(cb => cb(enrichedState as any));
    this.eventBus.emit('STATE_CHANGE', { state: enrichedState });
  }

  private handleError(error: TowerError | ModuleError | Error): void {
    let moduleError: ModuleError;

    if ('source' in error && 'code' in error) {
      moduleError = error as ModuleError;
    } else if (error instanceof Error) {
      moduleError = classifyError(error);
    } else {
      moduleError = classifyError((error as TowerError).message);
    }

    const rule = getErrorRule(moduleError.code);

    // Emit to error callbacks
    this.errorCallbacks.forEach(cb => cb({
      code: moduleError.code,
      message: moduleError.message,
      module: `Group${moduleError.source}`,
      recoverable: moduleError.recoverable,
    }));

    // Emit to event bus
    this.eventBus.emit('ERROR', { error: moduleError });

    // Execute recovery action
    if (!rule.recoverable) {
      this.setPhase('idle');
    }
  }

  private wireEventBus(): void {
    const unsub1 = this.eventBus.on('MOVE_COMPLETE', (data) => {
      const results = this.realCellStateMachine!.handlePlayerEnter(
        (data as { to: string }).to,
        {}
      );
      if (results && results.length > 0) {
        this.eventBus.emit('CELL_TRIGGER', {
          cellId: (data as { to: string }).to,
          cellType: 'battle',
        });
      }
    });

    const unsub2 = this.eventBus.on('CELL_TRIGGER', (data) => {
      const cellId = this.realMovementEngine!.getCurrentPosition();
      if (cellId) {
        this.realActionExecutor!.execute(cellId, {}).catch((err) => {
          this.handleError({
            code: 'CELL_EXECUTION_FAILED',
            message: err instanceof Error ? err.message : 'Cell execution failed',
            module: 'CellActionExecutor',
            recoverable: true,
          });
        });
      }
    });

    const unsub3 = this.eventBus.on('BATTLE_END', (data) => {
      const battleData = data as { victory: boolean; difficulty?: number; isBoss?: boolean };
      if (battleData.victory) {
        // 战斗胜利 - 增加技术值和核心资源
        const difficulty = battleData.difficulty ?? 1;
        const techValueAdd = [3, 5, 9, 12, 15][Math.min(difficulty - 1, 4)] ?? 3;
        const { newMilestones } = this.realTechnicalValueManager!.addValue(techValueAdd);
        
        // 增加核心资源
        this.realCoreResourcesManager!.addResource('coreComputing', difficulty + 1);
        this.realCoreResourcesManager!.addResource('coreFunds', difficulty + 2);
        this.realCoreResourcesManager!.addResource('coreInformation', difficulty);
        if (difficulty >= 4) {
          this.realCoreResourcesManager!.addResource('corePrivilege', 1);
        }
        
        this.realRewardSystem!.grantBattleReward('', true);
        this.realProgressManager!.recordBattle({} as BattleActionResult);
        
        if (newMilestones.length > 0) {
          this.addNotification('success', `达成里程碑！获得新奖励`);
          // TODO: 触发里程碑奖励选择界面
        } else {
          this.addNotification('success', `战斗胜利！获得 ${techValueAdd} 技术值`);
        }
      } else {
        // 战斗失败 - 扣除技术值
        const layer = this.state.currentLayer;
        // BOSS 战失败时扣除更多
        const baseDeduction = battleData.isBoss ? 50 : 30;
        const deduction = baseDeduction + baseDeduction * layer;
        const { newValue, died } = this.realTechnicalValueManager!.spendValue(deduction);
        
        if (died) {
          this.addNotification('error', '游戏结束！技术值耗尽');
          this.setPhase('game_over');
        } else {
          this.addNotification('warning', `${battleData.isBoss ? 'BOSS' : '战斗'}失败，扣除 ${deduction} 技术值，剩余 ${newValue}`);
        }
      }
      this.closeModal();
    });

    const unsub4 = this.eventBus.on('BOSS_DEFEATED', (data) => {
      const bossData = data as { layerNumber: number; [key: string]: unknown };
      this.realProgressManager!.recordBossDefeat(bossData.layerNumber, []);
      
      // BOSS胜利后获得更多奖励
      const techAdd = 20 + 10 * bossData.layerNumber;
      this.realTechnicalValueManager!.addValue(techAdd);
      this.realCoreResourcesManager!.addResource('coreComputing', 10 + 5 * bossData.layerNumber);
      this.realCoreResourcesManager!.addResource('coreFunds', 15 + 5 * bossData.layerNumber);
      this.realCoreResourcesManager!.addResource('coreInformation', 5 + 3 * bossData.layerNumber);
      this.realCoreResourcesManager!.addResource('corePrivilege', 3 + bossData.layerNumber);
      
      if (bossData.layerNumber < 9) {
        this.addNotification('success', `第${bossData.layerNumber}层BOSS已击败！获得大量奖励`);
        this.openModal('boss_reward', { dataPackets: [] });
      } else {
        this.realProgressManager!.recordLayerComplete(9);
        this.eventBus.emit('GAME_COMPLETE', { finalStats: this.realProgressManager!.getStatistics() });
        this.setPhase('game_complete');
      }
    });

    const unsub5 = this.eventBus.on('LAYER_COMPLETE', (data) => {
      const layerData = data as { layerNumber: number };
      this.openModal('layer_transition', {
        fromLayer: layerData.layerNumber,
        toLayer: layerData.layerNumber + 1,
      });
    });

    const unsub6 = this.eventBus.on('GAME_COMPLETE', () => {
      this.setPhase('game_complete');
    });

    this.unsubscribeFns = [unsub1, unsub2, unsub3, unsub4, unsub5, unsub6];

    // F组 Round 6 - 桥接旧事件到新游戏事件
    this.wireGameEvents();
  }

  private wireGameEvents(): void {
    // Bridge old events to new game events
    this.eventBus.on('BATTLE_END', (data) => {
      gameEventBus.emit('battle:end', {
        result: { victory: (data as { victory: boolean }).victory, rewards: (data as { rewards: unknown[] }).rewards ?? [] },
        cellId: '',
      });
    });

    this.eventBus.on('MOVE_COMPLETE', (data) => {
      gameEventBus.emit('position:change', {
        fromCellId: (data as { from: string }).from,
        toCellId: (data as { to: string }).to,
      });
    });

    this.eventBus.on('LAYER_COMPLETE', (data) => {
      gameEventBus.emit('layer:transition', {
        fromLayer: (data as { layerNumber: number }).layerNumber,
        toLayer: (data as { layerNumber: number }).layerNumber + 1,
      });
    });

    this.eventBus.on('GAME_COMPLETE', () => {
      gameEventBus.emit('game:over', { reason: 'victory' });
    });

    this.eventBus.on('STATE_CHANGE', (data) => {
      gameEventBus.emit('state:change', { state: (data as { state: unknown }).state });
    });
  }

  private createLevelDatabase(): Array<{ id: string; theme: string; difficulty: number; title: string; description: string; isBoss?: boolean }> {
    const database: Array<{ id: string; theme: string; difficulty: number; title: string; description: string; isBoss?: boolean }> = [];

    for (let tier = 1; tier <= 9; tier++) {
      const theme = TIER_THEME_MAP[tier];
      const levels = THEME_LEVELS[theme] || [];

      for (const levelId of levels) {
        database.push({
          id: levelId,
          theme,
          difficulty: Math.ceil(tier / 3),
          title: `关卡 ${levelId}`,
          description: `第 ${tier} 层 ${theme} 主题关卡`,
        });
      }

      // 添加BOSS关卡
      const bossId = BOSS_LEVELS[theme];
      if (bossId) {
        database.push({
          id: bossId,
          theme,
          difficulty: Math.ceil(tier / 3) + 1,
          title: `BOSS 关卡 ${bossId}`,
          description: `第 ${tier} 层 BOSS 战`,
          isBoss: true,
        });
      }
    }

    return database;
  }

  private wireUIBridge(): void {
    const uiBridge = this.realActionExecutor!.getUIBridge();

    uiBridge.onUIRequest((request) => {
      const { contractKey, data } = request;

      // 映射 UI 请求到模态框类型
      const modalTypeMap: Record<string, ActiveModalType> = {
        'battleEntrance': 'battle_entrance',
        'chanceEvent': 'chance_event',
        'bookstoreDisplay': 'bookstore',
        'skillOffer': 'skill_offer',
        'bossReward': 'boss_reward',
        'layerTransition': 'layer_transition',
      };

      const modalType = modalTypeMap[contractKey];
      if (modalType) {
        this.openModal(modalType, data);
      }
    });

    uiBridge.onUIDismiss(() => {
      this.closeModal();
    });
  }

  private loadLayerData(layerNumber: number): void {
    this.state.currentLayer = layerNumber;

    // 从 layerRegistry 加载层数据
    try {
      const layerData = getLayerData(layerNumber);
      this.state.currentLayerData = layerData;

      // 使用 LevelAssignmentEngine 分配关卡到战斗格子
      if (this.realLevelEngine) {
        const battleCellIds = layerData.cells
          .filter(cell => cell.type === 'battle' || cell.type === 'boss')
          .map(cell => cell.id);
        const bossCellId = layerData.cells.find(cell => cell.type === 'boss')?.id || '';

        if (battleCellIds.length > 0) {
          try {
            const assignment = this.realLevelEngine.assignLayer(layerNumber, battleCellIds, bossCellId);
            // 将关卡分配信息存储到 layerData 中
            (layerData as any).levelAssignment = assignment;
          } catch (e) {
            console.warn('Level assignment failed:', e);
          }
        }
      }

      // 更新各模块的层数据
      if (this.realCellStateMachine) {
        this.realCellStateMachine.setInitialState(layerData.cells);
        // 解锁起始单元格的相邻单元格
        if (layerData.startCellId) {
          this.realCellStateMachine.unlockNeighbors(layerData.startCellId, layerData);
        }
        // 同步 CellStateMachine 的状态到 layerData
        for (const cell of layerData.cells) {
          const currentState = this.realCellStateMachine.getState(cell.id);
          cell.state = currentState;
        }
      }
      if (this.realZoneManager) {
        // 重新创建 ZoneEffectManager 以使用新的 zones
        this.realZoneManager = new ZoneEffectManager(layerData.zones, ZONE_EFFECT_CONFIG);
        // 更新 MovementEngine 中的 zoneManager 引用
        if (this.realMovementEngine) {
          (this.realMovementEngine as any).zoneManager = this.realZoneManager;
        }
      }
      if (this.realMovementEngine) {
        this.realMovementEngine.loadLayerData(layerData);
        this.realMovementEngine.resetForNewTurn();
        // 设置起始位置
        if (layerData.startCellId) {
          this.realMovementEngine.setStartPosition(layerData.startCellId);
        }
      }

      this.emitStateChange();
    } catch (error) {
      this.handleError({
        code: 'LAYER_LOAD_FAILED',
        message: error instanceof Error ? error.message : `Failed to load layer ${layerNumber}`,
        module: 'TowerModeController',
        recoverable: false,
      });
    }
  }

  private transitionToLayer(layerNumber: number): void {
    this.state.currentLayer = layerNumber;
    this.loadLayerData(layerNumber);
    this.realProgressManager!.recordLayerComplete(layerNumber - 1);
    this.addNotification('info', `进入第${layerNumber}层`);
    this.setPhase('playing');
  }

  private buildRenderCells(): RenderCellData[] {
    if (!this.state.currentLayerData) return [];

    const cells = this.state.currentLayerData.cells ?? [];
    const pos = this.realMovementEngine?.getCurrentPosition();

    return Object.values(cells).map((cell: GameCell) => ({
      cell,
      screenPosition: { x: cell.coordinate[0] * 80, y: cell.coordinate[1] * 80 },
      isReachable: this.realCellStateMachine?.canTrigger(cell.id) ?? false,
      isHighlighted: this.state.uiState.highlightedCells.includes(cell.id),
    }));
  }
}
