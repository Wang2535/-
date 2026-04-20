# D组 - 第六轮：核心引擎开发（移动/翻转/战斗） Prompt

## 任务目标

实现爬塔模式的核心游戏引擎，包括骰子移动、地图翻转、战斗系统、动态机制执行等。

> **边界说明**：
> - D组使用的 PlayerState / CoreResources / SaveData / MilestoneStatus 等共享类型**来自A组定义**（player.types.ts），D组不重新定义
> - D组消费C组产出的 **EnrichedTopology**（含关卡分配+Boss配置），不直接使用B组的裸拓扑
> - D组负责L7/L8**运行时动态机制**的执行（格子偏移、概率坍缩），B组仅提供数据配置
> - D组不负责UI渲染，引擎计算结果通过事件通知E组更新

## 具体任务

### Task D1: 移动引擎

```typescript
// src/tower-mode/engine/movementEngine.ts

interface MoveResult {
  success: boolean;
  fromCell: GridCell;
  toCell: GridCell;
  diceValue: number;
  modifiedDiceValue: number; // 经过修正后的值
  path: GridCell[];        // 经过的格子
  triggeredEffects: TriggeredEffect[];
}

interface TriggeredEffect {
  type: 'area' | 'grid' | 'special';
  effect: AreaEffect | GridType | string;
  applied: boolean;
}

export class MovementEngine {
  
  /**
   * 投掷骰子并执行移动
   */
  rollAndMove(
    playerState: PlayerState,
    mapTopology: GourdMapTopology
  ): MoveResult
  
  /**
   * 计算修正后的骰子值
   */
  calculateModifiedDice(
    baseValue: number,
    playerState: PlayerState
  ): number
  
  /**
   * 寻找从当前位置出发、给定步数的有效路径
   */
  findValidPath(
    fromCell: GridCell,
    steps: number,
    topology: GourdMapTopology
  ): GridCell[]
  
  /**
   * 处理分叉路口选择
   */
  handleBranchChoice(
    possiblePaths: GridCell[][],
    playerChoice?: number
  ): GridCell[]
}
```

### Task D2: 地图翻转引擎

```typescript
// src/tower-mode/engine/mapFlipEngine.ts

interface FlipResult {
  flipped: boolean;
  newTopology: GourdMapTopology;
  flipCount: number;       // 当前翻转次数
  maxFlipsReached: boolean; // 是否达到3次上限
  convertedCells: GridCell[]; // 被转换的格子
  message: string;
}

export class MapFlipEngine {
  
  private static readonly MAX_FLIPS = 3;
  
  /**
   * 检查是否需要触发翻转
   */
  shouldTriggerFlip(
    topology: GourdMapTopology,
    clearedLevelCount: number
  ): boolean
  
  /**
   * 执行地图翻转
   */
  executeFlip(topology: GourdMapTopology): FlipResult
  
  /**
   * 选择要转换的格子（2-5个非关卡格→关卡格）
   */
  selectCellsToConvert(
    topology: GourdMapTopology,
    count: { min: 2; max: 5 }
  ): GridCell[]
  
  /**
   * 检查是否解锁瞬移能力
   */
  checkTeleportUnlock(clearedCount: number): boolean
}
```

### Task D3: 战斗系统对接

```typescript
// src/tower-mode/engine/battleIntegration.ts

// 战斗资源（从PlayerState派生）
interface BattleResources {
  availableCards: Card[];          // 来自A组 player.types.ts
  availableSkills: Skill[];        // 来自A组 player.types.ts
  equipmentBonus: EquipmentBonus;  // 来自A组 player.types.ts
  currentTechnicalValue: number;
  currentCoreResources: CoreResources;
}

// 战斗奖励
interface BattleRewards {
  technicalValueGain: number;
  goldGain: number;
  items: ItemDrop[];               // 来自A组 player.types.ts
  milestoneProgress: number;       // 累计技术值进度
  newMilestoneReached?: MilestoneStatus; // 来自A组 player.types.ts
}

interface BattleSetup {
  levelEntry: LevelPoolEntry;
  isBossBattle: boolean;
  bossConfig?: GeneratedBoss;
  playerResources: BattleResources;
}

interface BattleResult {
  victory: boolean;
  turnsUsed: number;
  rewards: BattleRewards;
  technicalValueChange: number;
}

export class BattleIntegration {
  
  /**
   * 准备战斗
   */
  setupBattle(gridCell: GridCell, playerState: PlayerState): BattleSetup
  
  /**
   * 处理战斗结果
   */
  processBattleResult(
    result: BattleResult,
    gridCell: GridCell,
    playerState: PlayerState
  ): PlayerState
  
  /**
   * 计算技术值变化
   */
  calculateTechnicalValueChange(
    result: BattleResult,
    layer: number,
    isBoss: boolean,
    isElite: boolean
  ): number
}
```

### Task D4: 状态管理

```typescript
// src/tower-mode/engine/towerGameState.ts

interface TowerGameState {
  // 当前层级
  currentLayer: number;
  
  // 地图状态
  mapTopology: GourdMapTopology;
  flipCount: number;
  
  // 玩家位置
  currentCellId: string;
  
  // 资源状态
  technicalValue: number;
  coreResources: CoreResources;
  gold: number;
  
  // 收集状态
  cards: string[];          // 已获得的卡牌ID列表
  skills: Skill[];           // 已获得技能
  dataPacks: DataPack[];     // 已获得数据包
  booksRead: Book[];         // 已阅读书籍
  clearedLevels: number[];   // 已通关的关卡ID
  
  // 历史记录
  failureHistory: Map<string, number>; // 关卡格ID → 失败次数
}

export class TowerGameStateManager {
  
  private state: TowerGameState;
  
  /**
   * 初始化新游戏
   */
  initializeNewGame(): TowerGameState
  
  /**
   * 进入新层
   */
  enterNewLayer(layer: number): void
  
  /**
   * 更新玩家位置
   */
  updatePosition(cellId: string): void
  
  /**
   * 处理关卡胜利
   */
  handleLevelVictory(cellId: string): void
  
  /**
   * 处理关卡失败
   */
  handleLevelFailure(cellId: string): GameOverCheck
  
  /**
   * 检查游戏是否结束
   */
  checkGameOver(): { gameOver: boolean; reason?: string }
}
```

### Task D5: 动态机制执行引擎（L7/L8运行时）

> **边界说明**：B组在地图数据中定义了L7/L8的动态**配置**（mobility、probabilityStrength等），D组负责在运行时**执行**这些动态行为。

```typescript
// src/tower-mode/engine/dynamicMechanics.ts

export class DynamicMechanicsEngine {

  /**
   * L7 云端平台：执行格子偏移
   * 读取B组定义的 mobility 配置，每回合执行偏移
   */
  executeDynamicShifts(topology: EnrichedTopology): {
    shiftedCells: string[];
    newPositions: Map<string, GridCoordinate>;
    affectedConnections: PathConnection[];
  }

  /**
   * L7 云端平台：执行边界膨胀/收缩
   * 读取B组定义的 boundaryFlex 配置
   */
  executeBoundaryFlex(topology: EnrichedTopology): {
    expanded: boolean;
    newBoundary: { x: number; y: number }[];
  }

  /**
   * L8 未来实验室：执行量子坍缩
   * 读取B组定义的 probabilityStrength 配置，判断连接是否激活
   */
  executeQuantumCollapse(
    topology: EnrichedTopology,
    observerCellId?: string
  ): {
    collapsedConnections: string[];
    activatedConnections: string[];
    deactivatedConnections: string[];
  }

  /**
   * L8 未来实验室：观测格效果
   * 固定周围连接状态
   */
  applyObserverEffect(
    topology: EnrichedTopology,
    observerCellId: string
  ): PathConnection[]
}
```

## 验收标准

1. ✅ 骰子系统完整（投掷、修正、路径计算）
2. ✅ 地图翻转机制（最多3次，强制解锁）
3. ✅ 战斗系统集成（准备、执行、奖励）
4. ✅ BattleResources/BattleRewards 类型完整定义（引用A组基础类型）
5. ✅ 技术值计算正确（含精英格倍率）
6. ✅ 状态管理完整（所有资源可追踪，使用A组PlayerState定义）
7. ✅ 游戏结束判定正确
8. ✅ L7动态偏移/边界膨胀执行正确（读取B组配置）
9. ✅ L8量子坍缩/观测效果执行正确（读取B组配置）
10. ✅ 消费EnrichedTopology（非B组裸拓扑）

## 类型来源清单

| 类型 | 来源 | 文件 |
|------|------|------|
| PlayerState | A组 | player.types.ts |
| CoreResources | A组 | player.types.ts |
| SaveData | A组 | player.types.ts |
| MilestoneStatus | A组 | player.types.ts |
| Card/Skill/DataPack/Book | A组 | player.types.ts |
| EquipmentBonus | A组 | player.types.ts |
| ItemDrop | A组 | player.types.ts |
| BattleResources | **D组定义** | battleIntegration.ts |
| BattleRewards | **D组定义** | battleIntegration.ts |
| EnrichedTopology | C组 | enrichedTopology.types.ts |
| GeneratedBoss | C组 | bossGenerator.ts |
