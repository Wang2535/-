# D组 Prompt：核心引擎三件套开发（M06-M08）

## 任务概述

你负责开发**安全实践爬塔模式**的三个核心引擎模块：格子状态机、特殊区域系统、玩家移动系统。这三个模块可以并行开发，互不依赖，共同构成游戏的核心玩法逻辑。

## 必读文档

**核心规格文档**：
- [M05-M08_核心引擎规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M05-M08_核心引擎规格.md)
  - M06 格子状态机：第289-538行
  - M07 特殊区域系统：第541-803行
  - M08 玩家移动系统：第806-1030行

**依赖文档**：
- [M01-M04_基础层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M01-M04_基础层规格.md) - 类型定义和工具函数
- [03_特殊区域系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/03_特殊区域系统设计.md) - 6种区域详细规则

**架构总览**：
- [M00_模块化架构总览.md](file:///D:/X学习/学习文件合集中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M00_模块化架构总览.md)

---

## M06: 格子状态机 (CellStateMachine)

### 开发内容

创建文件：`tower-mode/engine/CellStateMachine.ts`

```typescript
export class CellStateMachine {
  // 状态管理
  private stateMap: Map<string, CellState>;
  private transitionLog: StateTransitionResult[];

  constructor(initialCells: GameCell[]);

  // 核心API
  getState(cellId: string): CellState;
  setInitialState(cells: GameCell[]): void;
  requestTransition(request: StateTransitionRequest): StateTransitionResult;
  
  // 玩家交互
  handlePlayerEnter(cellId: string, context: CellTriggerContext): StateTransitionResult[];
  handlePlayerExit(cellId: string): StateTransitionResult;
  handleBattleComplete(cellId: string, victory: boolean): StateTransitionResult;
  handleFunctionComplete(cellId: string): StateTransitionResult;
  
  // 辅助方法
  unlockNeighbors(cellId: string, layerData: TowerLayerData): StateTransitionResult[];
  canTrigger(cellId: string): boolean;
  getCellsByState(state: CellState): string[];
  getTransitionHistory(): ReadonlyArray<StateTransitionResult>;
  resetCell(cellId: string, targetState: CellState): StateTransitionResult;
}

// 类型分发器
export class CellTypeDispatcher {
  dispatch(cell: GameCell, context: CellTriggerContext): PreActionInfo;
  
  private handleBattle(cell: BattleCell, ctx: CellTriggerContext): PreActionInfo;
  private handleChance(cell: ChanceCell, ctx: CellTriggerContext): PreActionInfo;
  private handleBookstore(cell: BookstoreCell, ctx: CellTriggerContext): PreActionInfo;
  private handleSkill(cell: SkillCell, ctx: CellTriggerContext): PreActionInfo;
  private handleBoss(cell: BossCell, ctx: CellTriggerContext): PreActionInfo;
  private handleEnd(cell: EndCell, ctx: CellTriggerContext): PreActionInfo;
}
```

### 状态机规则实现

```typescript
// 状态转换规则矩阵
const CELL_STATE_TRANSITIONS: Record<CellState, CellState[]> = {
  locked: ['unlocked', 'pending'],
  unlocked: ['current'],
  current: ['visited'],
  visited: ['completed'],
  pending: ['unlocked'],
  completed: [], // 终态
};

// 转换条件检查
function canTransition(
  from: CellState, 
  to: CellState, 
  reason: TransitionReason
): boolean {
  // 1. 检查规则矩阵
  if (!CELL_STATE_TRANSITIONS[from].includes(to)) {
    return false;
  }
  
  // 2. 根据reason进行额外校验
  switch (reason) {
    case 'player_enter':
      return from === 'unlocked' && to === 'current';
    case 'player_exit':
      return from === 'current' && to === 'visited';
    case 'battle_victory':
      return from === 'visited' && to === 'completed';
    case 'battle_defeat':
      return from === 'visited' && to === 'unlocked'; // 允许重试
    // ... 其他条件
  }
  
  return true;
}
```

### 关键要求

1. **严格状态流转**：必须遵循6态规则（locked→unlocked→current→visited→completed）
2. **副作用处理**：状态转换可能触发邻居解锁等连锁反应
3. **日志记录**：所有转换必须记录到 `transitionLog`
4. **类型分发**：`CellTypeDispatcher` 负责将格子分发到对应的预处理器

---

## M07: 特殊区域系统 (ZoneEffectManager)

### 开发内容

创建文件：`tower-mode/engine/ZoneEffectManager.ts`

```typescript
export class ZoneEffectManager {
  private zoneStates: Map<string, ZoneRuntimeState>;
  private activeEffects: PendingEffect[];
  private globalEffectStack: GlobalEffectResult[];

  constructor(zones: ZoneDefinition[], config: typeof ZONE_EFFECT_CONFIG);

  // 核心API
  detectZonesAtPosition(position: Coordinate2D, layerData: TowerLayerData): ZoneDefinition[];
  applyEffectsOnEnter(
    position: Coordinate2D,
    layerData: TowerLayerData,
    turnNumber: number,
    context: ZoneEffectContext
  ): ZoneApplicationResult;
  
  // 查询方法
  getDiceModifier(position: Coordinate2D, layerData: TowerLayerData): number;
  isGlobalEffectActive(effectType: string): boolean;
  getActiveGlobalEffects(): GlobalEffectResult[];
  
  // 管理方法
  onTurnEnd(turnNumber: number): void;
  forceTriggerZone(zoneId: string, context: ZoneEffectContext): TriggeredZoneEffect;
  resetAll(): void;
  getZoneStatistics(): ZoneStatistics;
}
```

### 6种区域效果实现

```typescript
// 优先级顺序（从高到低）
const ZONE_PRIORITY_ORDER: ZoneType[] = ['I', 'D', 'P', 'W', 'S', 'N'];

// 各区域效果处理函数
class ZoneEffectHandlers {
  // W区：虚弱 - 骰子-1
  static handleWeakness(context: ZoneEffectContext): DiceModifierApplied {
    return {
      source: 'zone_W',
      delta: -1,
      description: '虚弱区效果：投掷点数-1',
    };
  }

  // N区：知识 - 获得书籍
  static async handleKnowledge(
    context: ZoneEffectContext,
    bookPool: Book[]
  ): Promise<SpecialEffectResult> {
    const book = pickN(bookPool, 1)[0];
    return {
      type: 'grant_book',
      value: book,
      description: `获得书籍《${book.name}》`,
    };
  }

  // I区：反转 - 地图倒置（全局效果，最多3次）
  static handleInversion(
    layerData: TowerLayerData,
    globalTriggerCount: number
  ): GlobalEffectResult | null {
    if (globalTriggerCount >= 3) {
      return null; // 已达上限
    }
    return {
      effectType: 'map_invert',
      affectedLayer: layerData.layerNumber,
      duration: Infinity,
    };
  }

  // P区：休整 - 跳过回合
  static handleRest(context: ZoneEffectContext): SpecialEffectResult {
    return {
      type: 'skip_turn',
      value: true,
      description: '休整区效果：本回合无法行动',
    };
  }

  // S区：加速 - 额外骰子
  static handleSpeed(context: ZoneEffectContext): DiceModifierApplied {
    return {
      source: 'zone_S',
      delta: 1, // 表示额外投掷
      description: '加速区效果：额外投掷一次',
    };
  }

  // D区：危险 - 资源损失
  static handleDanger(context: ZoneEffectContext): ResourceChange[] {
    const changes: ResourceChange[] = [];
    if (rollChance(50)) {
      const loss = Math.floor(context.currentHp * 0.1);
      changes.push({
        type: 'hp',
        delta: -loss,
        source: 'D',
        description: `危险区：损失${loss}点生命`,
      });
    } else {
      changes.push({
        type: 'card',
        delta: -1,
        source: 'D',
        description: '危险区：丢弃1张手牌',
      });
    }
    return changes;
  }
}
```

### 效果应用流程

```typescript
function applyEffectsOnEnter(
  position: Coordinate2D,
  layerData: TowerLayerData,
  turnNumber: number,
  context: ZoneEffectContext
): ZoneApplicationResult {
  
  // 1. 检测所在区域
  const zones = this.detectZonesAtPosition(position, layerData);
  
  // 2. 过滤（冷却、上限、免疫）
  const validZones = zones.filter(zone => {
    const state = this.zoneStates.get(zone.id)!;
    // 检查冷却
    if (state.lastTriggerTurn && turnNumber - state.lastTriggerTurn < (zone.cooldownTurns || 0)) {
      return false;
    }
    // 检查上限
    if (zone.maxTriggers && state.currentTriggers >= zone.maxTriggers) {
      return false;
    }
    // 检查免疫
    if (context.skillResistances.has(zone.type)) {
      return false;
    }
    return true;
  });
  
  // 3. 按优先级排序
  const sortedZones = validZones.sort((a, b) => {
    return ZONE_PRIORITY_ORDER.indexOf(a.type) - ZONE_PRIORITY_ORDER.indexOf(b.type);
  });
  
  // 4. 逐个应用效果
  const results: ZoneApplicationResult = {
    triggeredZones: [],
    diceModifier: 0,
    resourceChanges: [],
    specialEffects: [],
    globalEffectsApplied: [],
  };
  
  for (const zone of sortedZones) {
    const effect = this.applyZoneEffect(zone, context);
    // 累加结果...
  }
  
  return results;
}
```

### 关键要求

1. **优先级处理**：I>D>P>W>S>N 的顺序必须严格遵守
2. **叠加规则**：W和S的骰子修改量可叠加，D每次独立计算
3. **全局限制**：I区地图倒置全局最多触发3次
4. **冷却管理**：支持区域效果的回合冷却

---

## M08: 玩家移动系统 (MovementEngine)

### 开发内容

创建文件：`tower-mode/engine/MovementEngine.ts`

```typescript
export class MovementEngine {
  private state: MovementEngineState;
  private zoneManager: ZoneEffectManager;
  private layerData: TowerLayerData | null;

  constructor(zoneManager: ZoneEffectManager);

  // 生命周期
  loadLayerData(data: TowerLayerData): void;
  setStartPosition(cellId: string): void;

  // 核心移动
  rollDice(): DiceRollResult;
  getMoveOptions(diceValue: number): MoveOption[];
  executeMove(targetCellId: string, animationConfig?: MovementAnimationConfig): Promise<MovementResult>;
  forceMove(targetCoord: Coordinate2D, reason: ForceMoveReason): Promise<MovementResult>;
  cancelMove(): boolean;

  // 查询
  getCurrentPosition(): { cell: GameCell; coord: Coordinate2D };
  canMove(): boolean;
  getMoveHistory(): ReadonlyArray<MovementRecord>;

  // 事件订阅
  on(event: MovementEventType, callback: MovementEventHandler): void;
  off(event: MovementEventType, callback: MovementEventHandler): void;
}

// 骰子系统
export class DiceSystem {
  constructor(sides?: number);
  roll(rng?: () => number): number;
  applyModifiers(rawValue: number, modifiers: DiceModifierApplied[]): DiceRollResult;
  rollWithBonus(rng?: () => number): DiceRollResult; // S区效果
}
```

### BFS路径搜索实现

```typescript
function findReachableCells(
  startCellId: string,
  maxDistance: number,
  layerData: TowerLayerData,
  cellStates: Map<string, CellState>
): ReachableCell[] {
  
  const visited = new Set<string>();
  const queue: Array<{ cellId: string; distance: number; path: string[] }> = [
    { cellId: startCellId, distance: 0, path: [startCellId] }
  ];
  const results: ReachableCell[] = [];

  while (queue.length > 0) {
    const { cellId, distance, path } = queue.shift()!;

    if (visited.has(cellId)) continue;
    visited.add(cellId);

    // 跳过起点自身
    if (distance > 0) {
      const cell = layerData.cellIndex[cellId];
      results.push({
        cell,
        distance,
        path: path.map(id => layerData.cellIndex[id].coordinate),
        isOptimal: true,
        zoneWarnings: cell.zone ? [cell.zone] : [],
      });
    }

    // 距离已达上限则不再扩展
    if (distance >= maxDistance) continue;

    // 获取邻居（从adjacencyList）
    const neighbors = layerData.adjacencyList[cellId] || [];
    for (const neighborId of neighbors) {
      if (visited.has(neighborId)) continue;
      const neighborState = cellStates.get(neighborId);
      if (neighborState === 'locked') continue;

      queue.push({
        cellId: neighborId,
        distance: distance + 1,
        path: [...path, neighborId],
      });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}
```

### React Hook封装

```typescript
// tower-mode/hooks/useMovement.ts
export function useMovement(
  layerData: TowerLayerData | null,
  zoneManager: ZoneEffectManager | null,
  cellStateMachine: CellStateMachine | null
): MovementHookReturn {
  
  const [engine] = useState(() => new MovementEngine(zoneManager!));
  const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);
  const [moveOptions, setMoveOptions] = useState<MoveOption[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [currentPos, setCurrentPos] = useState<Coordinate2D>([0, 0]);

  useEffect(() => {
    if (layerData) engine.loadLayerData(layerData);
  }, [layerData]);

  const rollDice = useCallback(() => {
    // 获取区域修改
    const zoneModifiers = zoneManager?.getDiceModifier(currentPos, layerData!) || [];
    const result = engine.rollDice();
    result.modifiers.push(...zoneModifiers);
    
    setDiceResult(result);
    const options = engine.getMoveOptions(result.modifiedValue);
    setMoveOptions(options);
    return result;
  }, [engine, currentPos, layerData, zoneManager]);

  const moveTo = useCallback(async (targetCellId: string) => {
    setIsMoving(true);
    try {
      const result = await engine.executeMove(targetCellId);
      setCurrentPos(engine.getCurrentPosition().coord);
      return result;
    } finally {
      setIsMoving(false);
    }
  }, [engine]);

  return {
    diceResult,
    moveOptions,
    isMoving,
    currentPos,
    rollDice,
    moveTo,
    canMove: engine.canMove(),
    moveHistory: engine.getMoveHistory(),
    cancelMove: () => engine.cancelMove(),
  };
}
```

### 关键要求

1. **BFS寻路**：必须正确计算所有可达格子，考虑locked状态阻挡
2. **骰子修改**：W区(-1)和S区(+1/额外投掷)必须正确应用
3. **移动动画**：支持逐步移动动画和事件回调
4. **强制移动**：技能/事件触发的强制移动应绕过骰子限制

---

## 联合验收标准

### M06 格子状态机
- [ ] 6态状态机正确实现
- [ ] 状态转换规则严格校验
- [ ] 邻居解锁连锁正确触发
- [ ] 类型分发器正确分发6种格子类型
- [ ] 转换日志完整记录

### M07 特殊区域系统
- [ ] 6种区域效果正确实现
- [ ] 优先级顺序 I>D>P>W>S>N 严格遵守
- [ ] 叠加规则正确（W+S可叠加，D独立计算）
- [ ] I区全局上限3次正确限制
- [ ] 冷却和免疫机制正确

### M08 玩家移动系统
- [ ] BFS寻路正确计算可达格子
- [ ] 骰子系统支持修改器和额外投掷
- [ ] 移动执行流程正确（校验→路径→动画→触发）
- [ ] useMovement Hook正确封装
- [ ] 事件订阅/发布机制正确

## 注意事项

1. **依赖A组**：需要M01的类型定义和M03的工具函数
2. **M08依赖M07**：MovementEngine构造函数需要注入ZoneEffectManager
3. **三个模块可并行开发**：M06/M07/M07之间没有直接依赖
4. **完成后通知E组可以开始M09/M10/M11开发**

## 输出位置

代码文件存放于：
```
D:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\engine\
├── CellStateMachine.ts
├── ZoneEffectManager.ts
├── MovementEngine.ts
└── hooks/
    └── useMovement.ts
```

---

**开始开发前，请确认A组已完成M01/M03，并完整阅读 M05-M08_核心引擎规格.md 的M06/M07