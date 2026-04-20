# E组 Prompt：集成层三件套开发（M09-M11）

## 任务概述

你负责开发**安全实践爬塔模式**的三个集成层模块：功能格执行引擎、奖励系统集成、层级进度管理。这三个模块可以并行开发，共同构成游戏的业务逻辑层。

## 必读文档

**核心规格文档**：
- [M09-M12_集成层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M09-M12_集成层规格.md)
  - M09 功能格执行引擎：第5-286行
  - M10 奖励系统集成：第289-538行
  - M11 层级进度管理：第541-803行

**依赖文档**：
- [M01-M04_基础层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M01-M04_基础层规格.md) - 类型定义
- [M05-M08_核心引擎规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M05-M08_核心引擎规格.md) - 核心引擎接口
- [02_功能格子系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/02_功能格子系统设计.md) - 5种功能格详细规则
- [04_数据包奖励系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/04_数据包奖励系统设计.md) - 81个数据包定义

**架构总览**：
- [M00_模块化架构总览.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M00_模块化架构总览.md)

---

## M09: 功能格执行引擎 (CellActionExecutor)

### 开发内容

创建文件：`tower-mode/engine/CellActionExecutor.ts`

```typescript
export class CellActionExecutor {
  private registry: ExecutorRegistry;
  private uiBridge: UIBridge;

  constructor(rewardSystem: RewardSystem);

  // 注册和执行
  registerExecutor<T extends GameCell>(type: T['type'], executor: CellExecutor<T>): void;
  async execute(cell: GameCell, context: TriggerContext): Promise<CellActionResult>;

  // 各类型执行方法
  async executeBattle(cell: BattleCell, ctx: TriggerContext): Promise<BattleActionResult>;
  async executeChance(cell: ChanceCell, ctx: TriggerContext): Promise<ChanceActionResult>;
  async executeBookstore(cell: BookstoreCell, ctx: TriggerContext): Promise<BookstoreActionResult>;
  async executeSkill(cell: SkillCell, ctx: TriggerContext): Promise<SkillActionResult>;
  async executeBoss(cell: BossCell, ctx: TriggerContext): Promise<BossActionResult>;
  async executeEnd(cell: EndCell, ctx: TriggerContext): Promise<ActionResultBase>;

  // 控制
  cancelExecution(): void;
  isExecuting(): boolean;
}

// UI桥接器
export class UIBridge {
  requestUI(contractKey: keyof ExecutionUIContract, data: unknown): Promise<unknown>;
  dismissUI(): void;
  onUserAction(action: string, handler: (data: unknown) => void): void;
}
```

### UI交互契约定义

```typescript
interface ExecutionUIContract {
  // 战斗格：战斗入口弹窗
  battleEntrance: {
    levelId: string;
    enemyPreview: EnemyPreviewData;
    difficulty: number;
    estimatedRewards: string[];
    onConfirm: () => void;
    onRetreat: () => void;
  };

  // 机会格：事件选择
  chanceEvent: {
    event: ChanceEvent;
    outcomeOptions: EventOutcomeOption[];
    onSelectOption: (optionId: string) => void;
    onReroll?: () => void;
  };

  // 书店格：书籍展示
  bookstoreDisplay: {
    books: Book[];
    playerGold: number;
    canAfford: boolean[];
    onSelectBook: (bookId: string) => void;
    onLeave: () => void;
  };

  // Skill格：技能抽取
  skillOffer: {
    offeredSkills: Skill[];
    currentActiveSkills: Skill[];
    maxSlots: number;
    onSelectSkill: (skillId: string, replaceSlot?: number) => void;
    onSkip: () => void;
  };

  // Boss格：数据包三选一
  bossReward: {
    dataPackets: DataPacket[];
    onSelectPacket: (packetId: string) => void;
  };

  // End格：层间过渡
  layerTransition: {
    fromLayer: number;
    toLayer: number;
    nextLayerPreview: LayerPreviewInfo;
    onProceed: () => void;
  };
}
```

### 各格子执行流程

#### 战斗格执行
```typescript
async executeBattle(cell: BattleCell, ctx: TriggerContext): Promise<BattleActionResult> {
  // 1. 前置检查
  if (cell.isCompleted) {
    return { success: true, type: 'battle', cellId: cell.id, victory: true, ... };
  }

  // 2. 显示战斗入口UI
  const uiResult = await this.uiBridge.requestUI('battleEntrance', {
    levelId: cell.levelId,
    enemyPreview: cell.enemyPreview,
    difficulty: cell.difficulty,
    onConfirm: () => { /* 回调 */ },
    onRetreat: () => { /* 回调 */ },
  });

  // 3. 等待战斗结果（外部战斗系统）
  const battleResult = await this.waitForBattleEnd(cell.levelId);

  // 4. 处理结果
  if (battleResult.victory) {
    // 发放奖励
    const rewards = await this.rewardSystem.grantBattleReward(cell.levelId, true);
    // 更新状态
    cell.isCompleted = true;
    return {
      success: true,
      type: 'battle',
      cellId: cell.id,
      victory: true,
      rewards,
      experienceGained: battleResult.exp,
    };
  } else {
    // 失败，允许重试
    return {
      success: false,
      type: 'battle',
      cellId: cell.id,
      victory: false,
      rewards: [],
    };
  }
}
```

#### BOSS格执行（重点）
```typescript
async executeBoss(cell: BossCell, ctx: TriggerContext): Promise<BossActionResult> {
  // 1. 检查是否已击败
  if (cell.isDefeated) {
    return { success: true, type: 'boss', victory: true, nextLayerUnlocked: true, ... };
  }

  // 2. 执行BOSS战（类似战斗格但更强）
  const battleResult = await this.executeBossBattle(cell);

  if (battleResult.victory) {
    // 3. BOSS战后：三选一数据包
    const packets = this.selectRandomPackets(cell.dataPacketPoolIds, 3);
    const selectedPacket = await this.uiBridge.requestUI('bossReward', {
      dataPackets: packets,
      onSelectPacket: (id) => { /* 回调 */ },
    });

    // 4. 发放选中的数据包
    await this.rewardSystem.grantDataPacket(selectedPacket, 'boss_defeat');

    // 5. 标记BOSS已击败
    cell.isDefeated = true;

    // 6. 如果不是第9层，生成End格
    const nextLayerUnlocked = cell.layerNumber < 9;

    return {
      success: true,
      type: 'boss',
      cellId: cell.id,
      victory: true,
      dataPacketsOffered: packets,
      selectedPacket,
      nextLayerUnlocked,
    };
  }

  return { success: false, type: 'boss', victory: false, ... };
}
```

### 关键要求

1. **异步执行**：所有执行方法都是 async，支持UI等待
2. **UI解耦**：通过 `UIBridge` 与React组件通信，不直接操作DOM
3. **结果标准化**：所有执行结果必须符合 `CellActionResult` 类型
4. **可取消**：支持 `cancelExecution()` 中断正在进行的交互

---

## M10: 奖励系统集成 (RewardSystem)

### 开发内容

创建文件：`tower-mode/engine/RewardSystem.ts`

```typescript
export class RewardSystem {
  private inventory: InventorySnapshot;
  private conflictRules: ConflictRule[];

  constructor(initialInventory?: InventorySnapshot);

  // 核心发放
  async processReward(request: RewardRequest): Promise<RewardResult>;
  grantDataPacket(packet: DataPacket, source: RewardSource): Promise<GrantResult<DataPacket>>;
  grantBook(book: Book, source: RewardSource): Promise<GrantResult<Book>>;
  grantSkill(skill: Skill, source: RewardSource, replaceSlotIndex?: number): Promise<GrantResult<Skill>>;
  grantBattleReward(levelId: string, victory: boolean): Promise<BattleRewardResult>;
  grantBossDataPacketSelection(options: DataPacket[], selectedId: string): Promise<GrantResult<DataPacket>>;

  // 查询
  getInventory(): InventorySnapshot;
  canGrant(item: { id: string; type: string }): CanGrantCheck;
  checkConflicts(itemId: string): ConflictInfo[];
  getRewardStatistics(): RewardStatistics;

  // 管理
  removeItem(itemId: string, reason: string): RemoveResult;
  replaceSkillSlot(slotIndex: number, newSkillId: string): ReplaceResult;
  resetInventory(): void;
  restoreFromSnapshot(snapshot: InventorySnapshot): void;
}
```

### 冲突检测规则

```typescript
// 数据包冲突规则
const DATA_PACKET_CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'exclusive_group',
    groups: [
      ['DP_T1_01', 'DP_T1_02'], // 互斥组示例
    ],
    resolution: 'player_choice',
  },
  {
    type: 'unique',
    check: (itemId, inventory) => inventory.dataPackets.some(p => p.id === itemId),
    resolution: 'reject',
  },
  {
    type: 'max_count',
    maxCount: REWARD_CONFIG.DATA_PACKET_MAX_OWNED,
    resolution: 'player_choice',
  },
];

// 技能冲突规则
const SKILL_CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'slot_limit',
    maxSlots: REWARD_CONFIG.SKILL_MAX_ACTIVE_SLOTS, // 3个
    resolution: 'replace_or_warehouse',
  },
  {
    type: 'unique_active',
    check: (skillId, inventory) => inventory.activeSkillIds.includes(skillId),
    resolution: 'warehouse',
  },
];

// 书籍冲突规则
const BOOK_CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'unique_read',
    check: (bookId, inventory) => inventory.readBooks.some(b => b.id === bookId),
    resolution: 'skip',
  },
];
```

### 奖励处理流程

```typescript
async processReward(request: RewardRequest): Promise<RewardResult> {
  const grantedItems: GrantedItem[] = [];
  const rejectedItems: RejectedItem[] = [];
  const conflictsResolved: ConflictResolution[] = [];

  for (const item of request.items) {
    // 1. 冲突预检
    const conflicts = this.checkConflicts(item.id);
    
    if (conflicts.length > 0) {
      // 2. 解决冲突
      const resolution = await this.resolveConflicts(item, conflicts);
      if (!resolution.success) {
        rejectedItems.push({ id: item.id, reason: resolution.reason });
        continue;
      }
      conflictsResolved.push(resolution);
    }

    // 3. 执行发放
    const granted = await this.grantItem(item, request.source);
    grantedItems.push(granted);
  }

  // 4. 更新快照
  this.updateInventorySnapshot();

  return {
    success: grantedItems.length > 0,
    grantedItems,
    rejectedItems,
    conflictsResolved,
    inventorySnapshot: this.getInventory(),
  };
}
```

### 关键要求

1. **冲突检测**：数据包互斥、技能槽位限制、书籍唯一性
2. **库存管理**：维护 `InventorySnapshot` 完整状态
3. **来源追踪**：所有奖励必须记录 `RewardSource`
4. **持久化**：库存状态需要可序列化，支持存档

---

## M11: 层级进度管理 (ProgressManager)

### 开发内容

创建文件：`tower-mode/engine/ProgressManager.ts`

```typescript
export class ProgressManager {
  private state: ProgressManagerState;
  private autoSaveTimer: NodeJS.Timer | null;
  private storage: SaveStorage;

  constructor(saveSlotId?: string);

  // 会话管理
  newGame(seed?: number): GameSession;
  loadSave(slotId: string): TowerProgressState;
  saveGame(slotId?: string, saveName?: string): Promise<SaveMeta>;
  enableAutoSave(intervalMs?: number): void;
  disableAutoSave(): void;

  // 进度更新（被其他模块调用）
  updatePosition(cellId: string, coord: Coordinate2D): void;
  recordMove(moveRecord: MovementRecord): void;
  recordBattle(result: BattleActionResult): void;
  recordBossDefeat(layerNumber: number, packets: DataPacket[]): void;
  recordLayerComplete(layerNumber: number): void;
  recordZoneTrigger(zoneType: ZoneType): void;
  recordRewardAcquired(source: RewardSource, item: GrantedItem): void;

  // 层级快照
  getLayerSnapshot(layerNumber: number): LayerSnapshot;
  createLayerCompletionSnapshot(layerNumber: number): LayerSnapshot;
  restoreToLayerSnapshot(layerNumber: number): void;

  // 查询
  getCurrentProgress(): TowerProgressState;
  getStatistics(): GameStatistics;
  getCompletionPercentage(): number;
  checkMilestones(): Milestone[];
  listSaves(): SaveMeta[];
  deleteSave(slotId: string): boolean;

  // 导入/导出
  exportProgress(): string;
  importProgress(jsonString: string): ImportResult;

  // 重置
  resetCurrentGame(): void;
  wipeAllData(): void;
}
```

### 存档存储实现

```typescript
class SaveStorage {
  private readonly STORAGE_PREFIX = 'tower_mode_save_';
  private readonly MAX_SAVES = 10;
  private readonly AUTO_SAVE_KEY = 'autosave';

  async save(slotId: string, data: TowerSaveData): Promise<void> {
    const serialized = JSON.stringify(data);
    
    // localStorage 存储
    localStorage.setItem(this.STORAGE_PREFIX + slotId, serialized);
    
    // IndexedDB 备份
    await this.writeToIndexedDB(slotId, data);
  }

  async load(slotId: string): Promise<TowerSaveData | null> {
    // 优先 localStorage
    const localData = localStorage.getItem(this.STORAGE_PREFIX + slotId);
    if (localData) {
      return JSON.parse(localData) as TowerSaveData;
    }
    // fallback 到 IndexedDB
    return this.readFromIndexedDB(slotId);
  }

  listSlots(): SaveMeta[] {
    const slots: SaveMeta[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX) && 
          key !== this.STORAGE_PREFIX + this.AUTO_SAVE_KEY) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw) as TowerSaveData;
          slots.push(data.saveMeta);
        }
      }
    }
    return slots.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
```

### 层间过渡流程

```typescript
recordLayerComplete(layerNumber: number): void {
  // 1. 创建层级快照
  const snapshot = this.createLayerCompletionSnapshot(layerNumber);
  this.state.layerSnapshots[layerNumber] = snapshot;

  // 2. 更新全局进度
  this.state.progress.layersCompleted.push(layerNumber);
  this.state.progress.currentLayer = layerNumber + 1;

  // 3. 检查里程碑
  const newMilestones = this.checkMilestones();
  if (newMilestones.length > 0) {
    // 通知UI显示成就
  }

  // 4. 判断后续操作
  if (layerNumber < 9) {
    // 触发 LAYER_COMPLETE 事件
    this.emit('LAYER_COMPLETE', { layerNumber, nextLayer: layerNumber + 1 });
  } else {
    // 游戏完成
    this.emit('GAME_COMPLETE', { finalStats: this.getStatistics() });
  }

  // 5. 自动保存
  this.saveGame('autosave', '自动保存');
}
```

### 关键要求

1. **持久化**：localStorage + IndexedDB 双保险
2. **自动保存**：支持定时自动保存
3. **快照系统**：每层完成时创建可还原的快照
4. **统计计算**：实时计算游戏统计数据

---

## 联合验收标准

### M09 功能格执行引擎
- [ ] 6种功能格执行方法全部实现
- [ ] UI桥接器正确与React组件通信
- [ ] BOSS战后三选一数据包流程正确
- [ ] 异步执行和取消机制正确
- [ ] 执行结果符合 `CellActionResult` 类型

### M10 奖励系统集成
- [ ] 数据包/书籍/Skill发放全部实现
- [ ] 冲突检测规则正确（互斥/槽位/唯一性）
- [ ] 库存快照正确维护
- [ ] BOSS三选一数据包逻辑正确
- [ ] 持久化支持（可序列化）

### M11 层级进度管理
- [ ] 存档/读档功能完整
- [ ] 自动保存定时器正确
- [ ] 层级快照创建/还原正确
- [ ] 统计计算准确
- [ ] 导入/导出功能完整

## 注意事项

1. **依赖A组**：需要M01的类型定义
2. **依赖D组**：M09需要M06的状态机回调，M10被M09调用
3. **三个模块可并行开发**：M09/M10/M11之间没有直接依赖
4. **M09和M10需要协调**：M09调用M10的发放方法
5. **完成后通知F组可以开始M12开发**

## 输出位置

代码文件存放于：
```
D:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\engine\
├── CellActionExecutor.ts
├── RewardSystem.ts
├── ProgressManager.ts
└── storage/
    └── SaveStorage.ts
```

---

**开始开发前，请确认A组已完成M01，D组已完成M06/M07/M08，并完整阅读 M09-M12_集成层规格.md 的M09/M10/M11部分。**
