# F组 - 第六轮：最终集成与端到端测试 Prompt

## 任务目标

整合A-E组的所有模块，实现完整的爬塔模式游戏流程，并进行全面的端到端测试。

> **边界说明**：
> - F组是最终集成层，依赖A-E组全部输出
> - F组不重新实现任何业务逻辑，仅负责组装和流程编排
> - 所有共享类型从A组导入，地图数据从C组EnrichedTopology获取
> - F组负责定义模块间的初始化顺序、事件通信和错误传播规则

## 具体任务

### Task F0: 模块对接协议（集成前置条件）

> **边界说明**：在开始集成之前，必须先定义模块间的初始化顺序、事件通信机制和错误传播规则，确保各组模块能正确对接。

#### 初始化顺序

```typescript
const BOOTSTRAP_SEQUENCE = [
  'A-types',      // 1. 加载所有类型定义（零依赖）
  'B-mapData',    // 2. 加载9层裸拓扑数据（依赖A类型）
  'B-visualConfig',// 3. 加载视觉配置（依赖A类型）
  'C-levelData',  // 4. 执行关卡分配，产出EnrichedTopology（依赖A+B）
  'D-engine',     // 5. 初始化引擎（依赖A类型+C的EnrichedTopology）
  'E-ui',         // 6. 渲染UI（依赖A类型+C的EnrichedTopology+B的visualConfig）
  'F-flow',       // 7. 启动游戏流程（依赖全部）
];
```

#### 事件总线

```typescript
// src/tower-mode/eventBus/gameEvents.ts

interface GameEventMap {
  // D组 → E组+F组
  'battle:end': { result: BattleResult; cellId: string };
  'battle:start': { setup: BattleSetup; cellId: string };
  'map:flip': { topology: EnrichedTopology; flipCount: number };
  'state:change': { state: TowerGameState };
  'position:change': { fromCellId: string; toCellId: string };
  'technicalValue:change': { oldValue: number; newValue: number };
  'milestone:reached': { milestone: MilestoneStatus };
  'game:over': { reason: string };
  'layer:transition': { fromLayer: number; toLayer: number };
  
  // E组 → D组
  'cell:click': { cellId: string };
  'path:select': { pathIndex: number };
  'dice:roll': {};
  
  // D组 → E组（L7/L8动态更新）
  'dynamic:shift': { shiftedCells: string[]; newPositions: Map<string, GridCoordinate> };
  'dynamic:collapse': { activated: string[]; deactivated: string[] };
}

type GameEventBus = {
  on<K extends keyof GameEventMap>(event: K, handler: (data: GameEventMap[K]) => void): void;
  emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void;
  off<K extends keyof GameEventMap>(event: K, handler: (data: GameEventMap[K]) => void): void;
};
```

#### 错误传播规则

```typescript
// src/tower-mode/errorHandling/errorPropagation.ts

interface ModuleError {
  source: 'A' | 'B' | 'C' | 'D' | 'E';
  code: string;
  message: string;
  recoverable: boolean;
  fallbackAction?: string;
}

const ERROR_HANDLING_RULES = {
  // A组类型错误：致命，无法恢复
  'A_TYPE_ERROR': { recoverable: false, action: 'HALT' },
  // B组地图数据错误：尝试使用备用地图
  'B_MAP_INVALID': { recoverable: true, action: 'FALLBACK_MAP' },
  // C组关卡分配错误：重新分配
  'C_ASSIGNMENT_FAILED': { recoverable: true, action: 'REASSIGN' },
  // D组引擎错误：回滚状态
  'D_ENGINE_ERROR': { recoverable: true, action: 'ROLLBACK_STATE' },
  // E组渲染错误：降级渲染
  'E_RENDER_ERROR': { recoverable: true, action: 'FALLBACK_RENDER' },
};
```

### Task F1: 模块集成

```typescript
// src/tower-mode/TowerModeGame.tsx

interface TowerModeGameProps {
  onGameOver: (result: GameOverResult) => void;
  onVictory: () => void;
  onSave: (saveData: SaveData) => void;
}

/**
 * 爬塔模式主入口组件
 * 
 * 整合层次：
 * TowerModeGame
 *   ├── GameInfoPanel (E5) — 数据源: A组PlayerState/CoreResources
 *   ├── GourdMapRenderer (E1) — 数据源: C组EnrichedTopology + B组MapVisualConfig
 *   │   ├── AreaEffectOverlay (E3)
 *   │   └── GridCellComponent × N (E2)
 *   ├── MovementControlPanel (E4) — 事件→D组引擎
 *   ├── BattleModal (D3) — 数据源: C组GeneratedBoss
 *   ├── RewardModal (数据包/书籍/技能选择)
 *   ├── StateManager (D4) — 数据源: A组PlayerState
 *   └── GameEventBus (F0) — 模块间事件通信
 */
export const TowerModeGame: React.FC<TowerModeGameProps>;
```

### Task F2: 完整游戏流程实现

```typescript
// src/tower-mode/gameFlow/fullGameFlow.ts

export class FullGameFlowController {
  
  /**
   * 完整游戏流程：
   * 
   * 1. 初始化游戏
   *    → 加载L1地图数据
   *    → 初始化玩家状态（技术值50，核心资源初始值）
   *    → 显示起始动画
   * 
   * 2. 回合循环
   *    a. 显示当前地图状态
   *    b. 玩家投掷骰子
   *    c. 计算修正后骰子值
   *    d. 显示可选路径
   *    e. 玩家选择路径（或自动最短路径）
   *    f. 执行移动动画
   *    g. 触发格子效果
   *       → 关卡格: 进入战斗
   *       → 机会格: 触发事件
   *       → 书店格: 选择书籍
   *       → 技能格: 获取技能
   *       → 交流会格: 商店界面
   *       → Boss格: 检查解锁条件
   *    h. 处理结果
   *       → 胜利: 更新状态，检查里程碑
   *       → 失败: 扣除技术值，检查游戏结束
   *    i. 检查是否到达终点/Boss格
   *       → 未通关9关: 触发翻转或强制解锁
   *       → 已通关9关: Boss战
   *    j. Boss战后处理
   *       → 胜利: 数据包奖励 → 层级过渡
   *       → 失败: 重试选项
   * 
   * 3. 层级过渡
   *    → 保存进度
   *    → 加载新层地图
   *    → 重置战斗资源
   *    → 保持跨层资源
   */
  
  async startNewGame(): Promise<void>
  async executeTurn(): Promise<TurnResult>
  async handleCellInteraction(cellId: string): Promise<void>
  async handleBattle(result: BattleResult): Promise<void>
  async handleLayerTransition(): Promise<void>
}
```

### Task F3: 端到端测试用例

```typescript
// src/tower-mode/__tests__/e2e/testCases.ts

const E2E_TEST_CASES = [
  {
    name: '完整L1流程',
    steps: [
      '初始化游戏 → 验证L1地图为葫芦形',
      '投骰子 → 移动到关卡格',
      '挑战★关卡 → 胜利 → 技术值+3',
      '继续移动 → 触发W区域效果',
      '挑战★★关卡 → 失败 → 技术值-60',
      '到达Boss格 → 未解锁(需9关)',
      '继续探索 → 通关足够关卡',
      '瞬移到Boss格 → Boss战',
      '胜利 → 数据包选择 → L2过渡'
    ]
  },
  {
    name: '地图翻转触发',
    steps: [
      '快速到达终点（仅通关3-5关）',
      '验证翻转触发条件满足',
      '执行翻转 → 起点/终点倒置',
      '验证新增关卡格数量正确',
      '验证翻转次数+1',
      '继续游戏直到翻转3次',
      '验证第3次后Boss格强制解锁'
    ]
  },
  {
    name: '技术值里程碑',
    steps: [
      '累计技术值达到90',
      '验证里程碑弹窗触发',
      '选择奖励选项①书店格效果',
      '验证书籍获得',
      '继续游戏达到180',
      '验证第二个里程碑'
    ]
  },
  // ... 更多测试用例
];
```

### Task F4: 性能基准测试

```typescript
// src/tower-mode/__tests__/performance/benchmarks.ts

interface PerformanceBenchmark {
  name: string;
  metric: string;
  target: number; // 目标值（ms）
}

const PERFORMANCE_TARGETS: PerformanceBenchmark[] = [
  { name: '地图渲染', metric: 'renderTime', target: 50 },     // < 50ms
  { name: '骰子投掷', metric: 'diceAnimation', target: 500 },  // < 500ms
  { name: '移动动画', metric: 'moveAnimation', target: 400 },  // < 400ms
  { name: '战斗初始化', metric: 'battleSetup', target: 200 }, // < 200ms
  { name: '状态更新', metric: 'stateUpdate', target: 16 },    // < 16ms (60fps)
];
```

## 验收标准

1. ✅ A-F组所有模块无编译错误
2. ✅ 模块初始化顺序正确（A→B→C→D→E→F）
3. ✅ 事件总线通信正常（D↔E双向事件）
4. ✅ 错误传播规则生效（可恢复错误有降级方案）
5. ✅ 完整游戏流程可运行（开始→L1→...→L9→通关）
6. ✅ 所有交互功能正常（点击、悬停、选择）
7. ✅ 地图渲染使用EnrichedTopology（非B组裸拓扑）
8. ✅ 动画流畅无明显卡顿
9. ✅ 端到端测试用例通过率 > 95%
10. ✅ 性能指标达标
11. ✅ 存档/读档功能正常（使用A组SaveData类型）

## 模块依赖与数据流总图

```
                    ┌─────────────────────────────────────────────┐
                    │              F组（集成/测试）                  │
                    │   GameEventBus + FullGameFlowController       │
                    └──────┬──────────┬──────────┬────────────────┘
                           │          │          │
              ┌────────────┘    ┌─────┴──┐  ┌───┴──────────┐
              ▼                 ▼        ▼  ▼               ▼
        ┌──────────┐     ┌──────────┐┌──────────┐   ┌──────────┐
        │ D组(引擎) │     │ C组(关卡)││ E组(UI)  │   │ B组(线路) │
        │ 消费:     │     │ 产出:    ││ 消费:     │   │ 产出:     │
        │ A类型     │←────│ Enriched ││ A类型     │   │ 裸拓扑    │
        │ C富集拓扑 │     │ Topology ││ C富集拓扑 │   │ 视觉配置  │
        │ 执行L7/L8│     │          ││ B视觉配置 │   │           │
        └────┬─────┘     └────┬─────┘└────┬─────┘   └─────┬────┘
             │                │           │                │
             └────────────────┼───────────┘                │
                              │                            │
                     ┌────────▼────────────────────────────┘
                     │        A组（数据结构 + 共享类型）       │
                     │  grid.types + player.types + 工具库   │
                     └─────────────────────────────────────┘
```
