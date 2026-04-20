# F组 Prompt：最终集成开发（M12）

## 任务概述

你负责开发**安全实践爬塔模式**的最终集成层，这是整个系统的入口和协调中心。你需要将所有子模块组装在一起，管理游戏生命周期，提供统一的对外API，并实现完整的React应用组件。

## 必读文档

**核心规格文档**：
- [M09-M12_集成层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M09-M12_集成层规格.md)
  - M12 层级集成器：第806-1030行

**所有前置模块规格**（必须了解各模块接口）：
- [M01-M04_基础层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M01-M04_基础层规格.md) - M01/M02/M03/M04
- [M05-M08_核心引擎规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M05-M08_核心引擎规格.md) - M05/M06/M07/M08
- [M09-M12_集成层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M09-M12_集成层规格.md) - M09/M10/M11

**架构总览**：
- [M00_模块化架构总览.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M00_模块化架构总览.md)

---

## 开发内容

### M12: 层级集成器

创建以下文件：

```
tower-mode/
├── TowerModeApp.tsx                    # React主组件（对外唯一出口）
├── TowerModeController.ts              # 纯逻辑控制器
├── EventBus.ts                         # 类型化事件总线
├── components/                         # UI组件
│   ├── TowerMapView/                   # 地图视图
│   ├── TowerHUD/                       # 顶部信息栏
│   ├── MovementControl/                # 移动控制面板
│   ├── BattleEntranceModal/            # 战斗入口弹窗
│   ├── ChanceEventModal/               # 机会事件弹窗
│   ├── BookstoreModal/                 # 书店弹窗
│   ├── SkillPanel/                     # Skill面板
│   ├── DataPacketSelector/             # 数据包选择器
│   ├── LayerTransition/                # 层间过渡
│   ├── GameCompleteScreen/             # 游戏完成画面
│   └── NotificationContainer/          # 通知容器
└── index.ts                            # 统一导出
```

### 1. TowerModeController（逻辑控制器）

```typescript
// tower-mode/TowerModeController.ts

export class TowerModeController {
  private state: IntegratorState;
  private eventBus: TypedEventBus<TowerEventType>;
  private modules: ModuleInstances;

  constructor();

  // ====== 生命周期 ======
  async initialize(config?: TowerInitConfig): Promise<void>;
  async startNewGame(seed?: number): Promise<void>;
  async continueFromSave(slotId: string): Promise<void>;
  pause(): void;
  resume(): void;
  async dispose(): Promise<void>;

  // ====== 游戏操作 ======
  rollDice(): DiceRollResult;
  moveToCell(cellId: string): Promise<MovementResult>;
  getAvailableMoves(): MoveOption[];
  interactWithCurrentCell(action: string, payload?: unknown): Promise<void>;
  quickSave(): Promise<void>;
  openMenu(menuType: 'save' | 'load' | 'settings'): void;

  // ====== 状态查询 ======
  getPhase(): GamePhase;
  getRenderState(): TowerRenderState;
  canAct(): boolean;

  // ====== 事件订阅 ======
  onPhaseChange(callback: (phase: GamePhase) => void): void;
  onStateChange(callback: (state: TowerRenderState) => void): void;
  onError(callback: (error: TowerError) => void): void;
}

interface ModuleInstances {
  levelEngine: LevelAssignmentEngine;
  cellStateMachine: CellStateMachine;
  zoneManager: ZoneEffectManager;
  movementEngine: MovementEngine;
  actionExecutor: CellActionExecutor;
  rewardSystem: RewardSystem;
  progressManager: ProgressManager;
}
```

### 2. 初始化流程实现

```typescript
async initialize(config?: TowerInitConfig): Promise<void> {
  // 1. 阶段: initializing
  this.setPhase('initializing');

  // 2. 初始化基础层（A组模块）
  // M01 types, M02 constants, M03 utils 已静态导入

  // 3. 加载地图数据（B组模块）
  const layerData = getAllLayers(); // 从M04加载9层数据

  // 4. 初始化核心引擎（C组 + D组模块）
  this.modules.levelEngine = new LevelAssignmentEngine(config?.seed);
  this.modules.levelEngine.initializePools(levelDatabase);

  this.modules.zoneManager = new ZoneEffectManager(
    layerData.flatMap(l => l.zones),
    ZONE_EFFECT_CONFIG
  );

  this.modules.movementEngine = new MovementEngine(this.modules.zoneManager);

  this.modules.cellStateMachine = new CellStateMachine(
    layerData.flatMap(l => l.cells)
  );

  // 5. 初始化集成层（E组模块）
  this.modules.rewardSystem = new RewardSystem();
  this.modules.actionExecutor = new CellActionExecutor(this.modules.rewardSystem);
  this.modules.progressManager = new ProgressManager();

  // 6. 组装事件总线
  this.wireEventBus();

  // 7. 完成初始化
  this.setPhase('idle');
}

private wireEventBus(): void {
  // M08 移动完成 → M06 格子触发
  this.eventBus.on('MOVE_COMPLETE', (data) => {
    const results = this.modules.cellStateMachine.handlePlayerEnter(
      data.toCellId,
      { /* context */ }
    );
    // 处理结果...
  });

  // M06 格子触发 → M09 执行
  this.eventBus.on('CELL_TRIGGER', (data) => {
    const cell = this.getCell(data.cellId);
    this.modules.actionExecutor.execute(cell, { /* context */ });
  });

  // M09 执行完成 → M10 奖励 / M11 进度
  this.eventBus.on('BATTLE_END', (data) => {
    if (data.victory) {
      this.modules.rewardSystem.grantBattleReward(data.levelId, true);
      this.modules.progressManager.recordBattle(data);
    }
  });

  // M09 BOSS击败 → M10 数据包 / M11 层完成
  this.eventBus.on('BOSS_DEFEATED', (data) => {
    this.modules.progressManager.recordBossDefeat(data.layerNumber, data.packets);
    if (data.layerNumber < 9) {
      this.transitionToLayer(data.layerNumber + 1);
    } else {
      this.setPhase('game_complete');
    }
  });

  // ... 更多事件绑定
}
```

### 3. TowerModeApp（React主组件）

```tsx
// tower-mode/TowerModeApp.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TowerModeController } from './TowerModeController';
import { TowerMapView } from './components/TowerMapView';
import { TowerHUD } from './components/TowerHUD';
import { MovementControl } from './components/MovementControl';
import { BattleEntranceModal } from './components/BattleEntranceModal';
import { ChanceEventModal } from './components/ChanceEventModal';
import { BookstoreModal } from './components/BookstoreModal';
import { SkillPanel } from './components/SkillPanel';
import { DataPacketSelector } from './components/DataPacketSelector';
import { LayerTransition } from './components/LayerTransition';
import { GameCompleteScreen } from './components/GameCompleteScreen';
import { NotificationContainer } from './components/NotificationContainer';

interface Props {
  onSaveExit?: () => void;
  initialSeed?: number;
}

export function TowerModeApp({ onSaveExit, initialSeed }: Props) {
  const controller = useRef<TowerModeController | null>(null);
  const [renderState, setRenderState] = useState<TowerRenderState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化控制器
  useEffect(() => {
    controller.current = new TowerModeController();
    
    controller.current.initialize({ seed: initialSeed }).then(() => {
      // 订阅状态变化
      controller.current!.onStateChange(setRenderState);
      controller.current!.onPhaseChange(setPhase);
      setIsLoading(false);
    });

    return () => {
      controller.current?.dispose();
    };
  }, [initialSeed]);

  // 游戏操作回调
  const handleStartNewGame = useCallback(() => {
    controller.current?.startNewGame();
  }, []);

  const handleLoadGame = useCallback((slotId: string) => {
    controller.current?.continueFromSave(slotId);
  }, []);

  const handleRollDice = useCallback(() => {
    return controller.current?.rollDice();
  }, []);

  const handleMoveTo = useCallback(async (cellId: string) => {
    return controller.current?.moveToCell(cellId);
  }, []);

  const handleCellInteraction = useCallback(async (action: string, payload?: unknown) => {
    return controller.current?.interactWithCurrentCell(action, payload);
  }, []);

  // 加载中显示
  if (isLoading) {
    return <div className="tower-mode-loading">加载中...</div>;
  }

  // 空闲状态：显示开始菜单
  if (phase === 'idle') {
    return (
      <TowerStartScreen
        onStart={handleStartNewGame}
        onLoad={handleLoadGame}
        onExit={onSaveExit}
      />
    );
  }

  // 游戏完成
  if (phase === 'game_complete') {
    return (
      <GameCompleteScreen
        stats={renderState?.playerStats}
        onRestart={handleStartNewGame}
        onExit={onSaveExit}
      />
    );
  }

  // 主游戏界面
  return (
    <div className="tower-mode-container">
      {/* 顶部信息栏 */}
      <TowerHUD
        layer={renderState?.playerStats.layer}
        hp={renderState?.playerStats.hp}
        activeSkills={renderState?.playerStats.activeSkills}
        packetCount={renderState?.playerStats.packetCount}
        bookCount={renderState?.playerStats.bookCount}
        moveCount={renderState?.playerStats.moveCount}
        phase={phase}
        onMenuClick={() => controller.current?.openMenu('settings')}
      />

      {/* 地图视图 */}
      <TowerMapView
        layerData={renderState?.layerData}
        cells={renderState?.cells}
        currentPosition={renderState?.currentPosition}
        onCellClick={handleMoveTo}
        highlightedCells={renderState?.uiState.highlightedCells}
      />

      {/* 移动控制区 */}
      <MovementControl
        diceResult={renderState?.diceResult}
        moveOptions={renderState?.moveOptions}
        onRollDice={handleRollDice}
        onMove={handleMoveTo}
        disabled={!controller.current?.canAct()}
        isMoving={phase === 'transitioning'}
      />

      {/* 弹窗层 - 条件渲染 */}
      {renderState?.uiState.activeModal === 'battle_entrance' && (
        <BattleEntranceModal
          {...renderState.uiState.modalData as ExecutionUIContract['battleEntrance']}
        />
      )}

      {renderState?.uiState.activeModal === 'chance_event' && (
        <ChanceEventModal
          {...renderState.uiState.modalData as ExecutionUIContract['chanceEvent']}
        />
      )}

      {renderState?.uiState.activeModal === 'bookstore' && (
        <BookstoreModal
          {...renderState.uiState.modalData as ExecutionUIContract['bookstoreDisplay']}
        />
      )}

      {renderState?.uiState.activeModal === 'skill_offer' && (
        <SkillPanel
          {...renderState.uiState.modalData as ExecutionUIContract['skillOffer']}
        />
      )}

      {renderState?.uiState.activeModal === 'boss_reward' && (
        <DataPacketSelector
          {...renderState.uiState.modalData as ExecutionUIContract['bossReward']}
        />
      )}

      {renderState?.uiState.activeModal === 'layer_transition' && (
        <LayerTransition
          {...renderState.uiState.modalData as ExecutionUIContract['layerTransition']}
        />
      )}

      {/* 通知系统 */}
      <NotificationContainer
        notifications={renderState?.uiState.notifications}
      />

      {/* 暂停遮罩 */}
      {phase === 'paused' && (
        <PauseOverlay
          onResume={() => controller.current?.resume()}
          onSave={() => controller.current?.quickSave()}
          onExit={onSaveExit}
        />
      )}
    </div>
  );
}
```

### 4. 事件总线实现

```typescript
// tower-mode/EventBus.ts

type TowerEventType =
  | { type: 'CELL_ENTER'; cellId: string; playerPos: [number, number] }
  | { type: 'CELL_TRIGGER'; cellId: string; cellType: CellType }
  | { type: 'ZONE_ENTERED'; zoneType: ZoneType; effectApplied: boolean }
  | { type: 'MOVE_COMPLETE'; from: string; to: string; diceResult: number }
  | { type: 'BATTLE_START'; levelId: string; cellId: string }
  | { type: 'BATTLE_END'; victory: boolean; rewards: Reward[] }
  | { type: 'BOSS_DEFEATED'; layerNumber: number; dataPackets: DataPacket[] }
  | { type: 'SKILL_ACQUIRED'; skill: Skill; replacedSkill?: Skill }
  | { type: 'BOOK_READ'; book: Book; effectApplied: boolean }
  | { type: 'CHANCE_EVENT'; event: ChanceEvent; result: EventResult }
  | { type: 'DATA_PACKET_SELECTED'; packet: DataPacket }
  | { type: 'LAYER_COMPLETE'; layerNumber: number }
  | { type: 'GAME_COMPLETE'; finalStats: GameStats };

export class TypedEventBus<T extends { type: string }> {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  on<K extends T['type']>(
    eventType: K,
    listener: (data: Extract<T, { type: K }>) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  emit<K extends T['type']>(eventType: K, data: Omit<Extract<T, { type: K }>, 'type'>): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener({ type: eventType, ...data }));
    }
  }

  off<K extends T['type']>(eventType: K, listener: (data: any) => void): void {
    this.listeners.get(eventType)?.delete(listener);
  }
}

export const eventBus = new TypedEventBus<TowerEventType>();
```

### 5. UI组件清单

需要实现的React组件：

| 组件 | 职责 | 关键props |
|------|------|----------|
| **TowerMapView** | 渲染9层地图、格子、路径、区域覆盖 | layerData, cells, currentPosition, onCellClick |
| **TowerHUD** | 显示层数、HP、技能、数据包数量 | layer, hp, activeSkills, packetCount... |
| **MovementControl** | 骰子按钮、移动选项列表 | diceResult, moveOptions, onRollDice, onMove |
| **BattleEntranceModal** | 战斗确认弹窗 | levelId, enemyPreview, difficulty, onConfirm, onRetreat |
| **ChanceEventModal** | 机会事件展示和选择 | event, outcomeOptions, onSelectOption |
| **BookstoreModal** | 书籍展示和选择 | books, playerGold, onSelectBook, onLeave |
| **SkillPanel** | Skill展示和槽位管理 | offeredSkills, currentActiveSkills, maxSlots, onSelectSkill |
| **DataPacketSelector** | BOSS战后三选一 | dataPackets, onSelectPacket |
| **LayerTransition** | 层间过渡动画 | fromLayer, toLayer, nextLayerPreview, onProceed |
| **GameCompleteScreen** | 游戏完成结算 | stats, onRestart, onExit |
| **NotificationContainer** | 通知消息队列 | notifications |
| **TowerStartScreen** | 开始菜单（新游戏/继续） | onStart, onLoad, onExit |
| **PauseOverlay** | 暂停菜单 | onResume, onSave, onExit |

---

## 验收标准

### TowerModeController
- [ ] 完整生命周期管理（initialize/start/pause/resume/dispose）
- [ ] 所有子模块正确组装和依赖注入
- [ ] 事件总线正确wiring所有模块间通信
- [ ] 状态查询接口正确返回渲染状态
- [ ] 错误处理机制完善

### TowerModeApp
- [ ] React组件正确渲染所有UI元素
- [ ] 状态变化正确触发重新渲染
- [ ] 用户操作正确调用控制器方法
- [ ] 弹窗条件渲染正确
- [ ] 生命周期管理正确（useEffect cleanup）

### 事件总线
- [ ] 类型安全的事件定义
- [ ] 订阅/发布机制正确
- [ ] 内存泄漏防护（取消订阅）

### 端到端测试
- [ ] 新游戏流程：初始化→投骰→移动→触发格子→完成
- [ ] BOSS战后数据包选择流程
- [ ] 层间过渡流程
- [ ] 游戏完成流程
- [ ] 存档/读档流程

---

## 依赖关系

**F组依赖所有其他组**：
- A组 (M01/M02/M03): 类型定义、常量、工具函数
- B组 (M04): 9层地图数据
- C组 (M05): 关卡分配引擎
- D组 (M06/M07/M08): 格子状态机、区域系统、移动系统
- E组 (M09/M10/M11): 功能格执行、奖励系统、进度管理

**必须在所有前置模块完成后才能开始F组开发。**

---

## 输出位置

代码文件存放于：
```
D:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\
├── TowerModeApp.tsx
├── TowerModeController.ts
├── EventBus.ts
├── components/
│   ├── TowerMapView/
│   │   └── index.tsx
│   ├── TowerHUD/
│   │   └── index.tsx
│   ├── MovementControl/
│   │   └── index.tsx
│   ├── BattleEntranceModal/
│   │   └── index.tsx
│   ├── ChanceEventModal/
│   │   └── index.tsx
│   ├── BookstoreModal/
│   │   └── index.tsx
│   ├── SkillPanel/
│   │   └── index.tsx
│   ├── DataPacketSelector/
│   │   └── index.tsx
│   ├── LayerTransition/
│   │   └── index.tsx
│   ├── GameCompleteScreen/
│   │   └── index.tsx
│   ├── NotificationContainer/
│   │   └── index.tsx
│   ├── TowerStartScreen/
│   │   └── index.tsx
│   └── PauseOverlay/
│       └── index.tsx
└── index.ts
```

---

## 最终交付物

完成M12后，整个爬塔模式应能：

1. ✅ 独立运行（`npm run dev` 启动）
2. ✅ 新游戏 → 打完9层 → 游戏完成
3. ✅ 随时存档/读档
4. ✅ 所有功能格正常触发
5. ✅ BOSS战后三选一数据包
6. ✅ 层间正常过渡
7. ✅ 统计数据正确计算

---

**开始开发前，请确认A/B/C/D/E组全部完成，并完整阅读所有规格文档。**
