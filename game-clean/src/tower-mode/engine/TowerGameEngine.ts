import type { TypedEventBus, TowerEventType } from '../EventBus';
import type {
  DiceResult,
  DiceModifier,
  GamePhase,
  TurnContext,
  PathOption,
  CellInfoPanelData,
  ZoneEffectInstance,
  LayerSpecialMechanic,
  TowerBattleParams,
  TowerBonus,
} from '../types/gameMechanics.types';
import type { RenderableEnrichedTopologyV3 } from '../types/renderableEnrichedTopology.types';
import type { IBattlePlayerState } from './battleIntegration';
import { TurnManager } from './turnManager';
import { BattleOrchestrator } from './battleOrchestrator';
import { PlayerPieceManager } from './playerPiece';
import { CurvedPathEngine } from './curvedPathEngine';
import { ZoneEffectResolver, type ZoneEffectResult } from './ZoneEffectResolver';
import { MechanicEffectEngine, type MechanicEffectResult } from './MechanicEffectEngine';

function tryCb(fn: () => void): void {
  try { fn(); } catch {}
}

export class TowerGameEngine {
  private eventBus: TypedEventBus<TowerEventType>;
  private topology: RenderableEnrichedTopologyV3 | null = null;
  private pieceManager: PlayerPieceManager;
  private pathEngine: CurvedPathEngine;
  private turnManager: TurnManager;
  private battleOrchestrator: BattleOrchestrator;

  private phase: GamePhase = 'idle';
  private currentLayer: number = 1;

  private techValue: number = 100;
  private gold: number = 0;
  private coreResources: { compute: number; fund: number; info: number };

  private wStreakCount: number = 0;
  private currentCircle: string = 'outer';
  private sameBranchTurns: number = 0;
  private visitedCellsThisTurn: string[] = [];
  private protocolProgress: number = 0;

  private zoneResolver!: ZoneEffectResolver;
  private mechanicEngine!: MechanicEffectEngine;
  private pendingDiceModifier: number = 0;
  private skipNextTurn: boolean = false;

  private onPhaseChangeCallbacks: Array<(phase: GamePhase) => void> = [];
  private onDiceResultCallbacks: Array<(result: DiceResult) => void> = [];
  private onCellArrivedCallbacks: Array<(cellId: string) => void> = [];
  private onBattleTriggeredCallbacks: Array<(params: TowerBattleParams) => void> = [];
  private onResourceChangeCallbacks: Array<(type: string, delta: number) => void> = [];

  private availablePaths: PathOption[] = [];
  private turnContext: TurnContext;

  constructor(eventBus: TypedEventBus<TowerEventType>) {
    this.eventBus = eventBus;
    this.pieceManager = new PlayerPieceManager(eventBus);
    this.pathEngine = new CurvedPathEngine();
    this.turnManager = new TurnManager(eventBus);
    this.battleOrchestrator = new BattleOrchestrator(eventBus);

    this.coreResources = { compute: 50, fund: 30, info: 20 };
    this.turnContext = this.createInitialTurnContext();
    this.zoneResolver = new ZoneEffectResolver(this);
    this.mechanicEngine = new MechanicEffectEngine(this);
  }

  setTopology(topology: RenderableEnrichedTopologyV3): void {
    this.topology = topology;
  }

  startNewGame(): void {
    this.techValue = 100;
    this.gold = 0;
    this.coreResources = { compute: 50, fund: 30, info: 20 };
    this.currentLayer = 1;
    this.wStreakCount = 0;
    this.currentCircle = 'outer';
    this.sameBranchTurns = 0;
    this.visitedCellsThisTurn = [];
    this.phase = 'idle';
    this.availablePaths = [];
    this.pendingDiceModifier = 0;
    this.skipNextTurn = false;
    this.turnContext = this.createInitialTurnContext();
    this.turnManager.reset();
    this.battleOrchestrator.reset();
    this.eventBus.emit('game:new' as any, {} as any);
  }

  rollDice(): DiceResult {
    if (this.phase !== 'idle' && this.phase !== 'turn_ending') {
      return this.createDummyResult();
    }

    if (this.skipNextTurn) {
      this.skipNextTurn = false;
      this.eventBus.emit('zone:effect' as any, {
        zoneType: 'P', effect: 'turn_skipped', message: '跳过区域效果：本回合跳过',
      } as any);
      this.endTurn();
      return this.createDummyResult();
    }

    const mechanicTurnResult = this.mechanicEngine.onTurnStart(this.currentLayer);
    this.applyMechanicEffectResult(mechanicTurnResult);

    this.turnManager.startTurn();
    this.setPhase('dice_ready');
    this.eventBus.emit('dice:start' as any, {} as any);

    const baseValue = Math.floor(Math.random() * 6) + 1;

    const modifiers: DiceModifier[] = [];

    if (this.pendingDiceModifier !== 0) {
      const modType = this.pendingDiceModifier > 0 ? 'zone_s' : 'zone_w';
      const modSource = this.pendingDiceModifier > 0 ? 'S区域效果(加�?' : 'W区域效果(虚弱)';
      modifiers.push({ type: modType, source: modSource, delta: this.pendingDiceModifier });
      this.pendingDiceModifier = 0;
    } else {
      if (this.hasActiveZoneEffect('W', 'dice_mod')) {
        const wMod = this.getZoneEffectValue('W');
        if (wMod < 0) {
          modifiers.push({ type: 'zone_w', source: 'W区域效果', delta: wMod });
        }
      }

      if (this.hasActiveZoneEffect('S', 'dice_mod')) {
        const sMod = this.getZoneEffectValue('S');
        if (sMod > 0) {
          modifiers.push({ type: 'zone_s', source: 'S区域效果', delta: sMod });
        }
      }
    }

    const mechanicModifier = this.applyLayerMechanicDiceMod(
      baseValue + modifiers.reduce((s, m) => s + m.delta, 0), modifiers,
    );
    if (mechanicModifier) {
      modifiers.push(mechanicModifier);
    }

    let finalValue = baseValue;
    for (const m of modifiers) {
      finalValue += m.delta;
    }
    finalValue = Math.max(1, finalValue);

    const isCritSuccess = (baseValue === 6 && modifiers.every(m => m.delta >= 0));
    const isCritFail = (baseValue === 1 && modifiers.some(m => m.type === 'zone_w' && m.delta < 0));

    const result: DiceResult = {
      baseValue, finalValue, modifiers, isCritSuccess, isCritFail,
    };

    this.turnContext.diceResult = result;
    this.setPhase('dice_result');

    this.eventBus.emit('dice:result' as any, result as any);
    this.onDiceResultCallbacks.forEach(cb => tryCb(() => cb(result)));

    return result;
  }

  calculateAvailablePaths(diceValue: number): PathOption[] {
    if (!this.topology || !this.turnContext.playerPosition) return [];

    const paths = this.inferAvailablePaths(diceValue);
    this.availablePaths = paths;
    this.turnContext.availablePaths = paths;

    if (paths.length > 1) {
      this.setPhase('path_selecting');
    } else if (paths.length === 1) {
      this.selectPath(0);
    }

    return paths;
  }

  selectPath(pathIndex: number): boolean {
    const path = this.availablePaths[pathIndex];
    if (!path) return false;

    this.setPhase('moving');
    this.eventBus.emit('path:selected' as any, { pathIndex, targetCellId: path.targetCellId } as any);

    this.turnManager.selectPath({
      targetCell: { id: path.targetCellId } as any,
      path: [],
      distance: path.totalSteps,
      zoneWarnings: [],
      recommended: true,
      riskScore: 0,
    });

    return true;
  }

  onMoveComplete(arrivedCellId: string): void {
    this.visitedCellsThisTurn.push(arrivedCellId);
    this.turnContext.playerPosition = arrivedCellId;
    this.setPhase('cell_arrived');

    this.eventBus.emit('cell:arrived' as any, { cellId: arrivedCellId } as any);

    this.checkZoneEntry(arrivedCellId);

    const mechanicResult = this.mechanicEngine.onCellArrived(arrivedCellId, this.currentLayer);
    this.applyMechanicEffectResult(mechanicResult);

    this.checkLayerMechanic(arrivedCellId);
  }

  enterCell(cellId: string): void {
    this.setPhase('cell_interacting');

    const cellInfo = this.topology?.cellInfoMap.get(cellId);
    if (!cellInfo) {
      this.settleCell(cellId);
      return;
    }

    this.eventBus.emit('cell:info:show' as any, cellInfo as any);
    this.onCellArrivedCallbacks.forEach(cb => tryCb(() => cb(cellId)));

    switch (cellInfo.cellType) {
      case 'battle':
        this.triggerBattle(cellId);
        break;
      case 'boss':
        this.triggerBoss(cellId);
        break;
      case 'bookstore':
        this.triggerBookstore(cellId);
        break;
      case 'skill':
        this.triggerSkill(cellId);
        break;
      case 'exchange':
        this.triggerExchange(cellId);
        break;
      case 'opportunity':
      case 'chance':
        this.triggerEvent(cellId);
        break;
      default:
        this.settleCell(cellId);
    }
  }

  skipCell(cellId: string): void {
    this.turnContext.pendingCellId = cellId;
    this.eventBus.emit('cell:skip' as any, { cellId } as any);
    this.setPhase('idle');
  }

  settleCell(cellId: string): void {
    this.eventBus.emit('cell:settled' as any, { cellId, state: 'cleared' } as any);
    this.checkAllCleared();
    this.endTurn();
  }

  onBattleResult(victory: boolean, rewards?: { techValueGain?: number; goldGain?: number }): void {
    if (victory) {
      const techGain = rewards?.techValueGain ?? (this.currentLayer * 3 + 2);
      this.modifyTechValue(techGain);
      this.modifyGold(rewards?.goldGain ?? this.currentLayer * 5);

      this.eventBus.emit('cell:cleared' as any, {
        cellId: this.turnContext.playerPosition, isBoss: false,
      } as any);
    } else {
      const penalty = 60 + 30 * this.currentLayer;
      this.modifyTechValue(-penalty);

      this.eventBus.emit('cell:failed' as any, {
        cellId: this.turnContext.playerPosition,
      } as any);
    }

    this.setPhase('battle_settling');
    this.endTurn();
  }

  modifyTechValue(delta: number): void {
    this.techValue = Math.max(0, this.techValue + delta);
    this.eventBus.emit('resource:change' as any, { type: 'tech', delta, newValue: this.techValue } as any);
    this.onResourceChangeCallbacks.forEach(cb => tryCb(() => cb('tech', delta)));

    if (this.techValue <= 0) {
      this.eventBus.emit('game:over' as any, { reason: 'tech_depleted' } as any);
    }
  }

  modifyGold(delta: number): void {
    this.gold += delta;
    this.eventBus.emit('resource:change' as any, { type: 'gold', delta, newValue: this.gold } as any);
    this.onResourceChangeCallbacks.forEach(cb => tryCb(() => cb('gold', delta)));
  }

  getPhase(): GamePhase { return this.phase; }
  getTurnContext(): TurnContext { return { ...this.turnContext }; }
  getTechValue(): number { return this.techValue; }
  getGold(): number { return this.gold; }
  getCurrentLayer(): number { return this.currentLayer; }
  getPieceState() { return this.pieceManager.getState(); }
  getAvailablePaths(): PathOption[] { return [...this.availablePaths]; }

  subscribeToPhaseChange(cb: (p: GamePhase) => void): () => void {
    this.onPhaseChangeCallbacks.push(cb);
    return () => {
      const idx = this.onPhaseChangeCallbacks.indexOf(cb);
      if (idx >= 0) this.onPhaseChangeCallbacks.splice(idx, 1);
    };
  }

  subscribeToDiceResult(cb: (r: DiceResult) => void): () => void {
    this.onDiceResultCallbacks.push(cb);
    return () => {
      const idx = this.onDiceResultCallbacks.indexOf(cb);
      if (idx >= 0) this.onDiceResultCallbacks.splice(idx, 1);
    };
  }

  subscribeToResourceChange(cb: (type: string, delta: number) => void): () => void {
    this.onResourceChangeCallbacks.push(cb);
    return () => {
      const idx = this.onResourceChangeCallbacks.indexOf(cb);
      if (idx >= 0) this.onResourceChangeCallbacks.splice(idx, 1);
    };
  }

  private setPhase(phase: GamePhase): void {
    this.phase = phase;
    this.turnContext.phase = phase;
    this.eventBus.emit('phase:change' as any, phase as any);
    this.onPhaseChangeCallbacks.forEach(cb => tryCb(() => cb(phase)));
  }

  private endTurn(): void {
    if (this.turnContext.pendingCellId === 'P_SKIP') {
      this.turnContext.pendingCellId = null;
      this.setPhase('idle');
      this.eventBus.emit('zone:special' as any, { zoneType: 'P', effect: 'skipped' } as any);
      return;
    }

    this.setPhase('turn_ending');
    this.turnContext.turnNumber++;
    this.visitedCellsThisTurn = [];
    this.sameBranchTurns++;
    this.turnContext.diceResult = null;
    this.turnContext.availablePaths = [];
    this.turnContext.pendingCellId = null;

    this.checkLayerTransition();

    this.turnManager.reset();

    this.eventBus.emit('turn:end' as any, { turnNumber: this.turnContext.turnNumber } as any);
    this.phase = 'idle';
  }

  private createInitialTurnContext(): TurnContext {
    return {
      turnNumber: 1,
      currentLayer: 1,
      diceResult: null,
      phase: 'idle',
      playerPosition: null,
      visitedCellsThisTurn: [],
      pendingCellId: null,
      availablePaths: [],
    };
  }

  private createDummyResult(): DiceResult {
    return { baseValue: 1, finalValue: 1, modifiers: [], isCritSuccess: false, isCritFail: false };
  }

  private triggerBattle(cellId: string): void {
    this.setPhase('battle_preparing');

    const cellInfo = this.topology?.cellInfoMap.get(cellId);
    const battleParams: TowerBattleParams = {
      cellId,
      layerNumber: this.currentLayer,
      difficultyLevel: cellInfo?.difficultyStars ?? 1,
      bonuses: this.buildBonuses(),
    };

    this.eventBus.emit('battle:trigger' as any, battleParams as any);
    this.onBattleTriggeredCallbacks.forEach(cb => tryCb(() => cb(battleParams)));
  }

  private triggerBoss(cellId: string): void {
    this.triggerBattle(cellId);
  }

  private triggerBookstore(cellId: string): void {
    this.eventBus.emit('bookstore:open' as any, { cellId } as any);
  }

  private triggerSkill(cellId: string): void {
    this.eventBus.emit('skill:learn' as any, { cellId } as any);
  }

  private triggerExchange(cellId: string): void {
    this.eventBus.emit('exchange:open' as any, { cellId } as any);
  }

  private triggerEvent(cellId: string): void {
    this.eventBus.emit('event:trigger' as any, { cellId } as any);
  }

  private checkZoneEntry(cellId: string): void {
    const zoneType = this.detectZoneForCell(cellId);
    if (!zoneType) return;

    this.pieceManager.setCurrentZone(zoneType);

    const zoneResult = this.zoneResolver.resolveZoneEffect(cellId, zoneType);
    this.applyZoneEffectResult(zoneResult, zoneType);

    if (zoneType === 'W') {
      this.wStreakCount++;
      const mechanic = this.topology?.layerMechanic;
      if (mechanic?.type === 'acceleration'
          && this.wStreakCount >= 3) {
        this.pendingDiceModifier += 1;
        this.eventBus.emit('mechanic:triggered' as any, {
          type: 'acceleration', detail: '扩散加速！下次骰子+1',
        } as any);
        this.wStreakCount = 0;
      }
    } else if (zoneType !== 'W') {
      this.wStreakCount = 0;
    }
  }

  private applyZoneEffectResult(result: ZoneEffectResult, zoneType: string): void {
    this.eventBus.emit('zone:effect' as any, { zoneType, result } as any);

    switch (result.type) {
      case 'dice_penalty':
        this.pendingDiceModifier += result.amount;
        break;
      case 'dice_bonus':
        this.pendingDiceModifier += result.amount;
        break;
      case 'resource_loss':
        this.modifyTechValue(-result.amount);
        break;
      case 'book_acquired':
        this.coreResources.compute += result.computeBonus;
        this.eventBus.emit('resource:change' as any, {
          type: 'compute', delta: result.computeBonus,
          newValue: this.coreResources.compute,
        } as any);
        break;
      case 'skip_next_turn':
        this.skipNextTurn = true;
        break;
      case 'map_inverted':
        this.eventBus.emit('zone:special' as any, {
          zoneType: 'I', effect: 'flip_map',
        } as any);
        break;
    }
  }

  private applyMechanicEffectResult(result: MechanicEffectResult): void {
    if (result.type === 'none') return;

    this.eventBus.emit('mechanic:effect' as any, result as any);

    switch (result.type) {
      case 'bonus_steps':
        this.pendingDiceModifier += result.amount;
        break;
      case 'blockade_penalty':
        this.modifyTechValue(-result.amount);
        break;
      case 'teleport_triggered':
        this.turnContext.playerPosition = result.to;
        this.pieceManager.setCurrentCellId(result.to);
        break;
      case 'protocol_violation':
      case 'sequence_violation':
        this.turnContext.playerPosition = result.returnToCell;
        this.pieceManager.setCurrentCellId(result.returnToCell);
        break;
    }
  }

  private executeZoneEffect(effect: ZoneEffectInstance): void {
    this.eventBus.emit('zone:effect:execute' as any, effect as any);

    switch (effect.effectType) {
      case 'stat_mod':
        if (effect.value < 0) {
          this.modifyTechValue(effect.value);
        } else if (effect.value > 0) {
          this.modifyTechValue(effect.value);
        }
        break;
      case 'dice_mod':
        this.eventBus.emit('zone:modifier' as any, {
          zoneType: effect.zoneType,
          value: effect.value,
        } as any);
        break;
      case 'special_trigger':
        if (effect.zoneType === 'N') {
          this.modifyTechValue(2);
          this.eventBus.emit('zone:special' as any, { zoneType: 'N', effect: 'tech+2' } as any);
        }
        if (effect.zoneType === 'P') {
          this.turnContext.pendingCellId = 'P_SKIP';
          this.eventBus.emit('zone:special' as any, { zoneType: 'P', effect: 'skip_next' } as any);
        }
        if (effect.zoneType === 'I') {
          this.eventBus.emit('zone:special' as any, { zoneType: 'I', effect: 'flip_map' } as any);
        }
        break;
    }
  }

  private checkLayerMechanic(cellId: string): void {
    const mechanic = this.topology?.layerMechanic;
    if (!mechanic) return;

    switch (mechanic.type) {
      case 'acceleration': break;
      case 'jump': this.handleJumpMechanic(cellId, mechanic); break;
      case 'sequence': this.handleSequenceMechanic(cellId, mechanic); break;
      case 'event': this.handleEventMechanic(cellId, mechanic); break;
      case 'blockade': this.handleBlockadeMechanic(cellId, mechanic); break;
      case 'teleport': this.handleTeleportMechanic(cellId, mechanic); break;
      case 'drift': this.handleDriftMechanic(mechanic); break;
      case 'collapse': this.handleCollapseMechanic(cellId, mechanic); break;
      case 'protocol': this.handleProtocolMechanic(cellId, mechanic); break;
    }
  }

  private handleJumpMechanic(cellId: string, _m: Record<string, any>): void {
    if (this.turnContext.diceResult && this.turnContext.diceResult.finalValue >= 4) {
      const innerRingCells = this.getInnerRingCellIds();
      if (innerRingCells.length > 0) {
        this.eventBus.emit('mechanic:triggered' as any, {
          type: 'jump', detail: '跨环跳跃可用！可选择跳至内环',
        } as any);
      }
    }
  }

  private handleSequenceMechanic(cellId: string, _m: Record<string, any>): void {
    const circle = this.detectCellCircle(cellId);
    if (circle === 'mid' && this.currentCircle !== 'mid') {
      const outerCleared = this.checkCircleCleared('outer');
      if (!outerCleared) {
        this.eventBus.emit('mechanic:triggered' as any, {
          type: 'sequence', detail: '顺序错误！请先清理外环！',
        } as any);
        const outerEntry = this.getOuterEntryCellId();
        this.turnContext.playerPosition = outerEntry;
        this.pieceManager.setCurrentCellId(outerEntry);
        return;
      }
    }
    if (circle === 'core' && this.currentCircle !== 'core') {
      const midCleared = this.checkCircleCleared('mid');
      if (!midCleared) {
        this.eventBus.emit('mechanic:triggered' as any, {
          type: 'sequence', detail: '顺序错误！请先清理中环！',
        } as any);
        const midEntry = this.getMidEntryCellId();
        this.turnContext.playerPosition = midEntry;
        this.pieceManager.setCurrentCellId(midEntry);
        return;
      }
    }
    this.currentCircle = circle;
  }

  private handleEventMechanic(_cellId: string, _m: Record<string, any>): void {}

  private handleBlockadeMechanic(cellId: string, _m: Record<string, any>): void {
    if (this.sameBranchTurns > 2) {
      this.eventBus.emit('mechanic:triggered' as any, {
        type: 'blockade', detail: '流水线阻塞！超时扣减10技术值',
      } as any);
      this.modifyTechValue(-10);
    }
    this.sameBranchTurns = (this.turnContext.pendingCellId === cellId)
      ? this.sameBranchTurns + 1
      : 1;
  }

  private handleTeleportMechanic(cellId: string, _m: Record<string, any>): void {
    const teleportChance = Math.random();
    if (teleportChance < 0.2) {
      const adjacentCells = this.getAdjacentCellIds(cellId);
      if (adjacentCells.length > 0) {
        const randomTarget = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
        this.eventBus.emit('mechanic:triggered' as any, {
          type: 'teleport', detail: `信号切换！被传送到 ${randomTarget}`,
        } as any);
        this.turnContext.playerPosition = randomTarget;
        this.pieceManager.setCurrentCellId(randomTarget);
      }
    }
  }

  private handleDriftMechanic(_m: Record<string, any>): void {}
  private handleCollapseMechanic(_cellId: string, _m: Record<string, any>): void {}

  private handleProtocolMechanic(cellId: string, _m: Record<string, any>): void {
    const requiredSequence = ['G0', 'W1', 'W2', 'N1', 'N2', 'I1', 'I2', 'P1', 'P2', 'CORE'];
    const currentIndex = requiredSequence.findIndex(p => p === cellId);
    const expectedIndex = this.getProtocolProgress();

    if (currentIndex > expectedIndex + 1) {
      this.eventBus.emit('mechanic:triggered' as any, {
        type: 'protocol', detail: '礼仪违规！遣返起点',
      } as any);
      this.turnContext.playerPosition = 'G0';
      this.pieceManager.setCurrentCellId('G0');
    } else if (currentIndex === expectedIndex + 1) {
      this.advanceProtocolProgress(currentIndex + 1);
    }
  }

  private checkLayerTransition(): void {}
  private checkAllCleared(): void {}

  private buildBonuses(): TowerBonus[] { return []; }

  private inferAvailablePaths(diceValue: number): PathOption[] {
    if (!this.topology) return [];
    const cells = this.topology.cells;
    if (!cells || cells.length === 0) return [];

    const currentPos = this.turnContext.playerPosition;
    const paths: PathOption[] = [];

    const reachable = cells
      .filter(c => c.id !== currentPos && c.state !== 'locked')
      .slice(0, diceValue);

    for (let i = 0; i < reachable.length; i++) {
      const cell = reachable[i];
      paths.push({
        pathCells: currentPos ? [currentPos, cell.id] : [cell.id],
        targetCellId: cell.id,
        totalSteps: i + 1,
        direction: i === 0 ? 'forward' : (i === 1 ? 'branch_left' : 'branch_right'),
      });
    }

    return paths;
  }

  private detectZoneForCell(cellId: string): string | null {
    if (!this.topology) return null;

    const cell = this.topology.cells?.find(c => c.id === cellId);
    if (cell?.zone) {
      return cell.zone;
    }

    const cellInfo = this.topology.cellInfoMap?.get(cellId);
    if (cellInfo) {
      const zoneInfo = this.topology.zones?.find(
        z => z.cellIds?.includes(cellId),
      );
      if (zoneInfo) {
        return zoneInfo.type;
      }
    }

    return null;
  }

  private hasActiveZoneEffect(zone: string, effectType: string): boolean {
    if (this.topology?.activeZoneEffects) {
      const activeEffects = this.topology.activeZoneEffects.filter(
        e => e.zoneType === zone && e.effectType === effectType && e.duration !== 0,
      );
      if (activeEffects.length > 0) return true;
    }

    const currentZone = this.pieceManager.getState().currentZone;
    if (currentZone !== zone) return false;

    if (effectType === 'dice_mod') {
      return zone === 'W' || zone === 'S';
    }

    return false;
  }

  private getZoneEffectValue(zone: string): number {
    if (this.topology?.activeZoneEffects) {
      const matchingEffects = this.topology.activeZoneEffects.filter(
        e => e.zoneType === zone && e.effectType === 'dice_mod' && e.duration !== 0,
      );
      if (matchingEffects.length > 0) {
        return matchingEffects[0].value;
      }
    }

    const zoneValueMap: Record<string, number> = { W: -1, S: 1 };
    return zoneValueMap[zone] ?? 0;
  }

  private inferZoneEffectType(zone: string): ZoneEffectInstance['effectType'] {
    const map: Record<string, ZoneEffectInstance['effectType']> = {
      W: 'dice_mod', N: 'special_trigger', I: 'special_trigger',
      P: 'special_trigger', S: 'dice_mod', D: 'stat_mod',
    };
    return map[zone] ?? 'visual_only';
  }
  private inferZoneEffectValue(zone: string): number {
    const map: Record<string, number> = { W: -1, S: 1, D: -10 };
    return map[zone] ?? 0;
  }

  private applyLayerMechanicDiceMod(
    _currentValue: number,
    _modifiers: DiceModifier[],
  ): DiceModifier | null { return null; }

  private detectCellCircle(cellId: string): string {
    const cell = this.topology?.cells?.find(c => c.id === cellId);
    if (!cell) return 'outer';
    const connector = this.topology?.connector?.cellIds || [];
    if (connector.includes(cellId)) return 'connector';
    if (cell.zone === 'CORE') return 'core';
    if (cell.zone?.startsWith('I') || cell.zone?.startsWith('P')) return 'mid';
    return 'outer';
  }

  private checkCircleCleared(circle: string): boolean {
    return this.visitedCellsThisTurn.length > 0;
  }

  private getOuterEntryCellId(): string {
    const cells = this.topology?.cells || [];
    const lowerIds = this.topology?.lowerCircle?.cellIds || [];
    const outerCells = cells.filter(c => lowerIds.includes(c.id));
    return outerCells[0]?.id || cells[0]?.id || 'L1';
  }

  private getMidEntryCellId(): string {
    const innerCells = this.getInnerRingCellIds();
    return innerCells[0] || 'M1';
  }

  private getAdjacentCellIds(cellId: string): string[] {
    const connections = this.topology?.connections || [];
    const adj: string[] = [];
    for (const conn of connections) {
      if (conn.fromCellId === cellId) adj.push(conn.toCellId);
      if (conn.toCellId === cellId) adj.push(conn.fromCellId);
    }
    return adj;
  }

  private getInnerRingCellIds(): string[] {
    const cells = this.topology?.cells || [];
    return cells.filter(c => c.type === 'core' || c.type === 'elite').map(c => c.id);
  }

  private getProtocolProgress(): number { return this.protocolProgress; }
  private advanceProtocolProgress(index: number): void { this.protocolProgress = index; }
}
