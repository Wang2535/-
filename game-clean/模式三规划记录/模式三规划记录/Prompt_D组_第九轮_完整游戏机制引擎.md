# D组第九轮 — 完整游戏机制引擎实现

## 🔴🔴🔴 这是第九轮最核心的组！

## 背景

第八轮D组实现了 PlayerPiece（事件发射+状态查询）和 CurvedPathEngine（曲线路径计算）。但这些只是**基础设施**。第九轮D组需要在此基础上构建**完整的游戏循环引擎**：

1. **回合制游戏循环**: idle → dice_ready → rolling → result → path_select → moving → arrived → interacting → settled
2. **骰子系统**: 3D骰子投掷 + 修正计算(W/S/技能/事件) + 大成功/大失败判定
3. **路径计算**: 从当前位置沿连接图计算所有可达路径 + 分叉处理
4. **格子交互**: 到达格子后弹出信息面板 → 玩家选择进入/跳过 → 执行对应效果
5. **区域效果执行**: W/N/I/P/S/D 区域进入时的效果触发
6. **层级特殊机制**: L1加速/L2跳跃/L3顺序/L4街区/L5阻塞/L6迷路/L7漂移/L8坍缩/L9礼仪
7. **战斗集成**: 构造 TowerBattleParams → 通知E组切换到战斗视图
8. **资源管理**: 技术值/金币/核心资源的增减

> **边界说明**:
> - D组是**纯逻辑层**，不操作DOM/SVG
> - D组消费 A 组的全部类型（DiceResult/TurnContext/CellInfoPanel 等）
> - D组消费 B 组的 layerMechanics 数据
> - D组消费 C 组组装后的 RenderableGourdMapTopologyV3
> - D组通过 eventBus 向 E组推送所有状态变更
> - D组提供完整的 API 供 TowerModeApp 调度

## 具体任务

### Task D1: TowerGameEngine — 游戏主引擎

**新建文件**: `src/tower-mode/engine/TowerGameEngine.ts`

这是整个爬塔模式的**大脑**，管理所有游戏状态和流程。

```typescript
import type { EventBus } from '../EventBus';
import type { RenderableGourdMapTopologyV3 } from '../types/visualAssets.types';
import type { GamePhase, TurnContext, DiceResult, DiceModifier,
         PathOption, CellInfoPanelData, CellMapState,
         ZoneEffectInstance, TowerBattleParams, LayerSpecialMechanicData
} from '../types/gameMechanics.types';
import { PlayerPieceManager } from './playerPiece';
import { CurvedPathEngine } from './curvedPathEngine';

export class TowerGameEngine {
  private eventBus: EventBus;
  private topology: RenderableGourdMapTopologyV3 | null = null;
  private pieceManager: PlayerPieceManager;
  private pathEngine: CurvedPathEngine;
  
  // ===== 游戏状态 =====
  private turnContext: TurnContext;
  private phase: GamePhase = 'idle';
  private currentLayer: number = 1;
  
  // ===== 资源系统 =====
  private techValue: number = 100;      // 技术值（生命值）
  private gold: number = 0;            // 金币
  private coreResources: { compute: number; fund: number; info: number };
  
  // ===== 机制追踪 =====
  private wStreakCount: number = 0;   // W区连击计数(L1)
  private currentCircle: string = 'outer'; // 当前所在圈层(L3)
  private sameBranchTurns: number = 0; // 同分支停留回合数(L5)
  private visitedCellsThisTurn: string[] = [];
  
  // ===== 回调订阅 =====
  private onPhaseChange: Array<(phase: GamePhase) => void> = [];
  private onDiceResult: Array<(result: DiceResult) => void> = [];
  private onCellArrived: Array<(cellId: string) => void> = [];
  private onBattleTriggered: Array<(params: TowerBattleParams) => void> = [];
  private onResourceChange: Array<(type: string, delta: number) => void> = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.pieceManager = new PlayerPieceManager(eventBus);
    this.pathEngine = new CurvedPathEngine();
    
    this.turnContext = this.createInitialTurnContext();
    this.coreResources = { compute: 50, fund: 30, info: 20 };
  }

  // ========== 初始化 ==========

  setTopology(topology: RenderableGourdMapTopologyV3): void {
    this.topology = topology;
  }

  /** 开始新游戏 */
  startNewGame(): void {
    this.techValue = 100;
    this.gold = 0;
    this.coreResources = { compute: 50, fund: 30, info: 20 };
    this.currentLayer = 1;
    this.wStreakCount = 0;
    this.currentCircle = 'outer';
    this.sameBranchTurns = 0;
    this.phase = 'idle';
    this.turnContext = this.createInitialTurnContext();
    this.eventBus.emit('game:new' as any, {});
  }

  // ========== 回合循环：投掷骰子 ==========

  /** 开始投掷骰子（每回合第一步）*/
  rollDice(): DiceResult {
    if (this.phase !== 'idle' && this.phase !== 'turn_ending') {
      console.warn('[D组] 非法时机投掷骰子，当前phase:', this.phase);
      return this.createDummyResult();
    }

    this.setPhase('dice_ready');
    this.eventBus.emit('dice:start' as any, {});

    // 1. 基础点数 (1-6)
    const baseValue = Math.floor(Math.random() * 6) + 1;

    // 2. 收集修正
    const modifiers: DiceModifier[] = [];

    // W区域修正
    if (this.hasActiveZoneEffect('W', 'dice_mod')) {
      const wMod = this.getZoneEffectValue('W');
      if (wMod < 0) {
        modifiers.push({ type: 'zone_w', source: 'W区域效果', delta: wMod });
      }
    }

    // S区域修正（额外投掷）
    if (this.hasActiveZoneEffect('S', 'dice_mod')) {
      const extraRoll = Math.floor(Math.random() * 6) + 1;
      modifiers.push({ type: 'zone_s', source: 'S区域额外投掷', delta: extraRoll });
    }

    // 层级特殊机制修正
    const mechanicModifier = this.applyLayerMechanicDiceMod(baseValue + modifiers.reduce((s,m)=>s+m.delta, 0), modifiers);

    if (mechanicModifier) {
      modifiers.push(mechanicModifier);
    }

    // 3. 计算最终值
    let finalValue = baseValue;
    for (const m of modifiers) {
      finalValue += m.delta;
    }
    finalValue = Math.max(1, finalValue); // 最小为1

    // 4. 判定大成功/大失败
    const isCritSuccess = (baseValue === 6 && modifiers.every(m => m.delta >= 0));
    const isCritFail = (baseValue === 1 && modifiers.some(m => m.type === 'zone_w' && m.delta < 0));

    const result: DiceResult = {
      baseValue, finalValue, modifiers, isCritSuccess, isCritFail,
    };

    this.turnContext.diceResult = result;
    this.setPhase('dice_result');

    this.eventBus.emit('dice:result' as any, result);
    this.onDiceResult.forEach(cb => tryCb(() => cb(result)));

    return result;
  }

  // ========== 回合循环：路径选择 ==========

  /** 计算可达路径 */
  calculateAvailablePaths(diceValue: number): PathOption[] {
    if (!this.topology || !this.turnContext.playerPosition) return [];

    const paths = this.pathEngine.calculateAvailablePaths(
      this.turnContext.playerPosition,
      diceValue,
      this.topology.connections,
      this.topology.cells.map(c => c.id),
      this.getLockedCellIds(),
    );

    this.turnContext.availablePaths = paths;
    
    if (paths.length > 1) {
      this.setPhase('path_selecting');
    } else if (paths.length === 1) {
      // 只有一个方向，自动选择
      this.selectPath(0);
    }
    
    return paths;
  }

  /** 玩家选择某条路径 */
  selectPath(pathIndex: number): boolean {
    const path = this.turnContext.availablePaths[pathIndex];
    if (!path) return false;

    this.setPhase('moving');
    this.eventBus.emit('path:selected' as any, { pathIndex, targetCellId: path.targetCellId });

    // 启动移动动画
    const waypoints = path.pathCells.slice(1, -1).map(id => this.getCellCoord(id));
    const fromCoord = this.getCellCoord(this.turnContext.playerPosition!);
    const toCoord = this.getCellCoord(path.targetCellId);

    this.pieceManager.startMove(path.targetCellId, this.buildPathPoints(fromCoord, toCoord, waypoints));

    // 启动动画循环
    this.startAnimationLoop();

    return true;
  }

  // ========== 回合循环：到达格子处理 ==========

  /** 移动完成回调（由 rAF 循环触发）*/
  onMoveComplete(arrivedCellId: string): void {
    this.visitedCellsThisTurn.push(arrivedCellId);
    this.turnContext.playerPosition = arrivedCellId;
    this.setPhase('cell_arrived');

    this.eventBus.emit('cell:arrived' as any, { cellId: arrivedCellId });

    // 检测区域进入
    this.checkZoneEntry(arrivedCellId);

    // 检测层级特殊机制
    this.checkLayerMechanic(arrivedCellId);

    // 延迟后进入交互阶段
    setTimeout(() => this.enterCellInteraction(arrivedCellId), 500);
  }

  /** 进入格子交互 */
  enterCellInteraction(cellId: string): void {
    this.setPhase('cell_interacting');

    const cellInfo = this.topology?.cellInfoMap.get(cellId);
    if (!cellInfo) {
      // 无信息面板数据（如过渡格），直接结算
      this.settleCell(cellId);
      return;
    }

    this.eventBus.emit('cell:info:show' as any, cellInfo);
    this.onCellArrived.forEach(cb => tryCb(() => cb(cellId)));
  }

  /** 玩家选择"进入"格子 */
  enterCell(cellId: string): void {
    const cellInfo = this.topology?.cellInfoMap.get(cellId);
    if (!cellInfo) return;

    switch (cellInfo.cellType) {
      case 'battle':
        this.triggerBattle(cellId);
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
      case 'boss':
        this.triggerBoss(cellId);
        break;
      default:
        this.settleCell(cellId);
    }
  }

  /** 玩家选择"暂不进入" */
  skipCell(cellId: string): void {
    this.turnContext.pendingCellId = cellId;
    // 标记该格为 waiting 状态
    this.eventBus.emit('cell:skip' as any, { cellId });
    this.setPhase('idle'); // 回合不结束，等待下次必须处理
  }

  /** 结算格子效果 */
  settleCell(cellId: string): void {
    // 更新格子状态
    this.eventBus.emit('cell:settled' as any, { cellId, state: 'cleared' });
    
    // 检查是否通关全部9关
    this.checkAllCleared();

    this.endTurn();
  }

  // ========== 战斗集成 ==========

  private triggerBattle(cellId: string): void {
    this.setPhase('battle_preparing');

    const cellInfo = this.topology?.cellInfoMap.get(cellId);
    const battleParams: TowerBattleParams = {
      cellId,
      layerNumber: this.currentLayer,
      difficultyLevel: cellInfo?.difficultyStars ?? 1,
      bonuses: this.buildBonuses(),
    };

    this.eventBus.emit('battle:trigger' as any, battleParams);
    this.onBattleTriggered.forEach(cb => tryCb(() => cb(battleParams)));
  }

  private triggerBoss(cellId: string): void {
    // Boss战与普通战斗类似但难度更高
    this.triggerBattle(cellId);
  }

  /** 战斗结果处理（由外部调用）*/
  onBattleResult(victory: boolean, rewards?: any): void {
    if (victory) {
      // 胜利奖励
      const techGain = (this.currentLayer * 3 + 2); // 简化计算
      this.modifyTechValue(techGain);
      this.modifyGold(this.currentLayer * 5);
      
      // 标记Boss/关卡格为已通关
      this.eventBus.emit('cell:cleared' as any, { 
        cellId: this.turnContext.playerPosition, isBoss: true 
      });
    } else {
      // 失败惩罚
      const penalty = 60 + 30 * this.currentLayer;
      this.modifyTechValue(-penalty);
      
      this.eventBus.emit('cell:failed' as any, {
        cellId: this.turnContext.playerPosition,
      });
    }

    this.setPhase('battle_settling');
    setTimeout(() => this.endTurn(), 1500);
  }

  // ========== 书店/技能/交流会/事件 ==========

  private triggerBookstore(cellId: string): void {
    this.eventBus.emit('bookstore:open' as any, { cellId });
    // 书店效果在 bookstore 组件内部处理
    setTimeout(() => this.settleCell(cellId), 100);
  }

  private triggerSkill(cellId: string): void {
    this.eventBus.emit('skill:learn' as any, { cellId });
    setTimeout(() => this.settleCell(cellId), 100);
  }

  private triggerExchange(cellId: string): void {
    this.eventBus.emit('exchange:open' as any, { cellId });
    setTimeout(() => this.settleCell(cellId), 100);
  }

  private triggerEvent(cellId: string): void {
    this.eventBus.emit('event:trigger' as any, { cellId });
    // 事件效果随机
    const outcomes = ['获得金币+10', '技术值+5', '恢复3点生命', '什么都没发生'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    console.log(`[D组] 事件结果: ${outcome}`);
    setTimeout(() => this.settleCell(cellId), 800);
  }

  // ========== 区域效果 ==========

  private checkZoneEntry(cellId: string): void {
    const zoneType = this.detectZoneForCell(cellId);
    if (!zoneType) return;

    // 更新玩家当前区域
    this.pieceManager.setCurrentZone(zoneType);

    // 触发区域效果
    const zoneBg = this.topology?.visualConfig.zoneBackgrounds[zoneType];
    if (zoneBg) {
      const effect: ZoneEffectInstance = {
        zoneType,
        effectType: this.inferZoneEffectType(zoneType),
        value: this.inferZoneEffectValue(zoneType),
        duration: -1,
        description: `${zoneType}区域效果`,
      };

      // 执行具体效果
      this.executeZoneEffect(effect);

      // 追踪W区连击（L1机制）
      if (zoneType === 'W') {
        this.wStreakCount++;
        if (this.topology?.layerMechanic.type === 'acceleration'
            && this.wStreakCount >= (this.topology.layerMechanic.visualHint.maxProgress ?? 3)) {
          this.eventBus.emit('mechanic:triggered' as any, {
            type: 'acceleration', detail: '扩散加速！下次骰子+1',
          });
          this.wStreakCount = 0; // 重置
        }
      } else if (zoneType !== 'W') {
        this.wStreakCount = 0; // 离开W区重置
      }
    }
  }

  private executeZoneEffect(effect: ZoneEffectInstance): void {
    this.eventBus.emit('zone:effect:execute' as any, effect);
    
    switch (effect.effectType) {
      case 'dice_mod':
        // 已在rollDice中处理
        break;
      case 'stat_mod':
        if (effect.value < 0) {
          this.modifyTechValue(effect.value);
        }
        break;
      case 'special_trigger':
        // 特殊机制在 checkLayerMechanic 中处理
        break;
    }
  }

  // ========== 层级特殊机制 ==========

  private checkLayerMechanic(cellId: string): void {
    const mechanic = this.topology?.layerMechanic;
    if (!mechanic) return;

    switch (mechanic.type) {
      case 'jump': this.handleJumpMechanic(cellId, mechanic); break;
      case 'sequence': this.handleSequenceMechanic(cellId, mechanic); break;
      case 'event': this.handleEventMechanic(cellId, mechanic); break;
      case 'blockade': this.handleBlockadeMechanic(cellId, mechanic); break;
      case 'teleport': this.handleTeleportMechanic(cellId, mechanic); break;
      case 'drift': this.handleDriftMechanic(mechanic); break;
      case 'collapse': this.handleCollapseMechanic(cellId, mechanic); break;
      case 'protocol': this.handleProtocolMechanic(cellId, mechanic); break;
      case 'acceleration': /* 已在checkZoneEntry中处理 */ break;
    }
  }

  // 各机制的实现方法...
  private handleJumpMechanic(cellId: string, m: any): void { /* L2 */ }
  private handleSequenceMechanic(cellId: string, m: any): void { /* L3 */ }
  private handleEventMechanic(cellId: string, m: any): void { /* L4 */ }
  private handleBlockadeMechanic(cellId: string, m: any): void { /* L5 */ }
  private handleTeleportMechanic(cellId: string, m: any): void { /* L6 */ }
  private handleDriftMechanic(m: any): void { /* L7 */ }
  private handleCollapseMechanic(cellId: string, m: any): void { /* L8 */ }
  private handleProtocolMechanic(cellId: string, m: any): void { /* L9 */ }

  // ========== 回合结束 ==========

  private endTurn(): void {
    this.setPhase('turn_ending');
    this.turnContext.turnNumber++;
    this.visitedCellsThisTurn = [];
    this.sameBranchTurns++;
    this.turnContext.diceResult = null;
    this.turnContext.availablePaths = [];
    this.turnContext.pendingCellId = null;

    // 检查是否需要升级层级
    this.checkLayerTransition();

    this.eventBus.emit('turn:end' as any, { turnNumber: this.turnContext.turnNumber });
    setTimeout(() => { this.phase = 'idle'; }, 300);
  }

  private checkLayerTransition(): void {
    // 检查是否通关当前层所有必要格子
    // （简化版：检查已通关格子数）
    // 如果通关 → currentLayer++ → 加载新拓扑
  }

  private checkAllCleared(): void {
    // 检查9关全通条件
  }

  // ========== 资源管理 ==========

  modifyTechValue(delta: number): void {
    this.techValue = Math.max(0, this.techValue + delta);
    this.eventBus.emit('resource:change' as any, { type: 'tech', delta, newValue: this.techValue });
    this.onResourceChange.forEach(cb => tryCb(() => cb('tech', delta)));
    
    if (this.techValue <= 0) {
      this.eventBus.emit('game:over' as any, { reason: 'tech_depleted' });
    }
  }

  modifyGold(delta: number): void {
    this.gold += delta;
    this.eventBus.emit('resource:change' as any, { type: 'gold', delta, newValue: this.gold });
  }

  // ========== 公共API ==========

  getTurnContext(): TurnContext { return { ...this.turnContext }; }
  getPhase(): GamePhase { return this.phase; }
  getPieceState() { return this.pieceManager.getState(); }
  getTechValue(): number { return this.techValue; }
  getGold(): number { return this.gold; }
  getCurrentLayer(): number { return this.currentLayer; }

  subscribeToPhaseChange(cb: (p: GamePhase) => void): () => { /* ... */ }
  subscribeToDiceResult(cb: (r: DiceResult) => void): () => { /* ... */ }

  // ========== 内部工具 ==========

  private setPhase(phase: GamePhase): void {
    this.phase = phase;
    this.turnContext.phase = phase;
    this.eventBus.emit('phase:change' as any, phase);
    this.onPhaseChange.forEach(cb => tryCb(() => cb(phase)));
  }

  private createInitialTurnContext(): TurnContext {
    return {
      turnNumber: 1, currentLayer: 1, diceResult: null, phase: 'idle',
      playerPosition: null, visitedCellsThisTurn: [],
      pendingCellId: null, availablePaths: [],
    };
  }

  private createDummyResult(): DiceResult {
    return { baseValue: 1, finalValue: 1, modifiers: [], isCritSuccess: false, isCritFail: false };
  }

  private buildBonuses(): any[] { return []; } // TODO: 从书籍/技能等收集加成

  private getLockedCellIds(): string[] {
    return []; // TODO: 从topology.cells中筛选state=locked
  }

  private getCellCoord(cellId: string): any { return { x: 0.5, y: 0.5 }; } // TODO
  private buildPathPoints(from: any, to: any, mid: any[]): any[] { return []; } // TODO

  private detectZoneForCell(cellId: string): string | null { return null; } // TODO
  private hasActiveZoneEffect(zone: string, effectType: string): boolean { return false; }
  private getZoneEffectValue(zone: string): number { return 0; }
  private inferZoneEffectType(zone: string): string { return 'visual_only'; }
  private inferZoneEffectValue(zone: string): number { return 0; }
  private mapToInfoType(type: string): any { return 'battle'; }
  private getDefaultName(type: string, layer: number): string { return ''; }
  private inferDifficulty(type: string, layer: number): number { return 1; }

  private startAnimationLoop(): void { /* 复用第八轮逻辑 */ }
}

function tryCb(fn: () => void): void { try { fn(); } catch {} }
```

### Task D2: 测试

```typescript
describe('D组第九轮 — 游戏引擎测试', () => {

  test('rollDice 返回有效 DiceResult', () => {
    const engine = new TowerGameEngine(mockBus());
    engine.setTopology(mockTopologyV3());
    for (let i = 0; i < 20; i++) {
      const result = engine.rollDice();
      expect(result.baseValue).toBeGreaterThanOrEqual(1);
      expect(result.baseValue).toBeLessThanOrEqual(6);
      expect(result.finalValue).toBeGreaterThanOrEqual(1);
      expect(result.modifiers).toBeDefined();
    }
  });

  test('rollDice 后 phase 变为 dice_result', () => {
    const engine = new TowerGameEngine(mockBus());
    engine.rollDice();
    expect(engine.getPhase()).toBe('dice_result');
  });

  test('startNewGame 重置所有状态', () => {
    const engine = new TowerGameEngine(mockBus());
    engine.setTopology(mockTopologyV3());
    engine.modifyTechValue(-100); // 扣光
    engine.startNewGame();
    expect(engine.getTechValue()).toBe(100);
    expect(engine.getGold()).toBe(0);
    expect(engine.getCurrentLayer()).toBe(1);
    expect(engine.getPhase()).toBe('idle');
  });

  test('modifyTechValue 正确增减并触发事件', () => {
    const engine = new TowerGameEngine(mockBus());
    let receivedDelta = 0;
    engine.subscribeToResourceChange((type, delta) => { if (type==='tech') receivedDelta = delta; });
    engine.modifyTechValue(15);
    expect(receivedDelta).toBe(15);
    expect(engine.getTechValue()).toBe(115);
  });

  test('setTopology 后可正常工作', () => {
    const engine = new TowerGameEngine(mockBus());
    engine.setTopology(mockTopologyV3());
    expect(engine.rollDice()).toBeDefined();
  });
});
```

## 验收标准

1. ✅ `TowerGameEngine` 类完整实现，包含 **20+ 个公开方法**
2. ✅ 完整的游戏循环: idle → dice → path → move → arrive → interact → settle → end
3. ✅ 骰子系统: 基础值 + 修正 + 最终值 + 大成功/大失败
4. ✅ 路径计算: 可达路径列表 + 分叉选择
5. ✅ 格子交互: 进入战斗/书店/技能/交流会/事件/Boss 的分支处理
6. ✅ 区域效果: W/N/I/P/S/D 效果检测和执行
7. ✅ 9种层级特殊机制: 各有独立处理方法
8. ✅ 资源系统: 技术值/金币/核心资源的增减
9. ✅ 战斗集成: TowerBattleParams 构建和事件发射
10. ✅ 单元测试覆盖: 骰子/资源/状态重置/拓扑设置
