# C组 - 第六轮：关卡分配与Boss生成开发 Prompt

## 任务目标

基于B组生成的9层葫芦形地图数据（裸拓扑），实现关卡分配算法和Boss动态生成系统，产出**EnrichedTopology（富集拓扑）**供D/E/F组消费。

> **边界说明**：
> - C组的输入是B组产出的**裸拓扑** GourdMapTopology（仅含格子+线路+区域效果，不含关卡分配）
> - C组的输出是**EnrichedTopology**，在裸拓扑基础上扩展了关卡分配和Boss配置
> - D/E/F组应从C组获取EnrichedTopology，不应直接修改B组的原始拓扑
> - C组不负责地图渲染或引擎逻辑，仅负责"把关卡数据填入地图格子"

## 核心设计文档参考

- 142关分类方案（每层16/15关）
- 每层关卡抽取规则（9个作为关卡格，剩余作为Boss候选池）
- Boss机制动态生成规则（根据特性标签生成）

## 具体任务

### Task C1: 实现关卡池管理

```typescript
// src/tower-mode/data/levelPool.ts

interface LevelPoolEntry {
  id: string;
  layer: number;           // 所属层级 1-9
  theme: string;           // 主题
  difficulty: DifficultyStar;
  tags: string[];          // 特性标签
  name: string;
  description: string;
}

// 142关完整数据
export const LEVEL_POOL: LevelPoolEntry[];
// 按层级分组
export const LEVEL_POOL_BY_LAYER: Record<number, LevelPoolEntry[]>;
```

### Task C2: 实现关卡分配算法

```typescript
// src/tower-mode/algorithms/levelAssignment.ts

interface AssignmentResult {
  layer: number;
  assignedLevels: Map<string, LevelPoolEntry>; // gridCellId → LevelEntry
  bossCandidatePool: LevelPoolEntry[];
  selectedBossPrototype: LevelPoolEntry;
}

export class LevelAssignmentEngine {
  
  /**
   * 为指定层分配关卡到地图格子
   */
  assignLevelsToLayer(
    topology: GourdMapTopology,
    pool: LevelPoolEntry[]
  ): AssignmentResult
  
  /**
   * 从候选池选择Boss原型
   */
  selectBossPrototype(
    candidates: LevelPoolEntry[],
    selectionCriteria: 'highestPower' | 'mostThematic' | 'randomWeighted'
  ): LevelPoolEntry
  
  /**
   * 难度梯度分配：沿主路径难度递增
   */
  distributeDifficultyGradient(
    cells: GridCell[],
    mainPath: GridCell[]
  ): void
  
  /**
   * 精英格标记（★★★★及以上）
   */
  markEliteGrids(cells: GridCell[]): void
}
```

### Task C3: 实现Boss动态生成

```typescript
// src/tower-mode/algorithms/bossGenerator.ts

interface BossMechanism {
  type: MechanismType;
  name: string;
  description: string;
  triggerInterval: number;    // 触发间隔（回合）
  params: Record<string, any>;
}

type MechanismType = 
  | 'summon'      // 召唤型
  | 'control'     // 控制型
  | 'recover'     // 恢复型
  | 'interfere'   // 干扰型
  | 'evolve'      // 进化型
  | 'timed'       // 时限型
  | 'clone'       // 分身型
  | 'psychological'; // 心理型

interface GeneratedBoss {
  prototypeId: string;
  name: string;
  baseStats: BossBaseStats;
  mechanisms: BossMechanism[];
  stageThresholds: number[]; // [25, 50]
  visualConfig: BossVisualConfig;
}

export class BossGenerator {
  
  /**
   * 根据关卡原型生成Boss
   */
  generateFromPrototype(
    prototype: LevelPoolEntry,
    layer: number
  ): GeneratedBoss
  
  /**
   * 根据标签匹配机制模板
   */
  matchMechanismsByTags(tags: string[]): BossMechanism[]
  
  /**
   * 根据层级调整机制强度
   */
  scaleMechanismIntensity(
    mechanism: BossMechanism,
    layer: number
  ): BossMechanism
}
```

### Task C4: 定义EnrichedTopology（富集拓扑）中间产物

> **边界说明**：EnrichedTopology 是C组的核心输出，是D/E/F组的**唯一数据来源**。它扩展了B组的裸拓扑，添加了关卡分配和Boss配置数据。

```typescript
// src/tower-mode/types/enrichedTopology.types.ts

interface EnrichedTopology extends GourdMapTopology {
  // 关卡分配映射：格子ID → 关卡条目
  assignedLevels: Map<string, LevelPoolEntry>;
  
  // Boss配置
  bossConfig: {
    prototype: LevelPoolEntry;
    generatedBoss: GeneratedBoss;
    bossCellId: string;
    unlockCondition: {
      requiredClearedCount: number;
      currentClearedCount: number;
    };
  };
  
  // 难度梯度信息
  difficultyGradient: {
    mainPath: string[];
    branchPaths: string[][];
    eliteCellIds: string[];
  };
  
  // 分配元数据
  assignmentMeta: {
    assignedAt: number;
    algorithm: string;
    seed: number;
  };
}
```

### Task C5: 实现地图-关卡对接验证

```typescript
// src/tower-mode/utils/mapLevelIntegration.ts

export class MapLevelIntegrator {
  
  /**
   * 将分配结果写入裸拓扑，产出EnrichedTopology
   * 
   * ⚠️ 不修改原始GourdMapTopology，而是创建新的EnrichedTopology
   */
  integrateLevelsToTopology(
    topology: GourdMapTopology,
    assignment: AssignmentResult
  ): EnrichedTopology
  
  /**
   * 验证分配合法性
   */
  validateAssignment(assignment: AssignmentResult): {
    valid: boolean;
    issues: string[];
  }
}
```

## 验收标准

1. ✅ 142关完整录入，按层级正确分组
2. ✅ 每层抽取9个关卡格+选1个Boss原型
3. ✅ 难度沿主路径递增
4. ✅ 精英格正确标记（★★★★及以上，约10%）
5. ✅ Boss根据特性标签动态生成机制
6. ✅ 机制强度随层级调整
7. ✅ EnrichedTopology 正确定义，包含关卡分配+Boss配置+难度梯度
8. ✅ integrateLevelsToTopology 返回 EnrichedTopology（不修改原始裸拓扑）
9. ✅ 分配结果可正确写入EnrichedTopology供D/E/F组消费

## 数据所有权流转

```
B组产出                    C组产出                       消费方
┌─────────────────┐      ┌──────────────────────┐     ┌───────────────┐
│ GourdMapTopology │ ───→ │ EnrichedTopology      │ ──→ │ D组: 引擎计算  │
│ (裸拓扑)         │      │ (裸拓扑 + 关卡分配 +  │     │ E组: UI渲染    │
│                  │      │  Boss配置 + 难度梯度)  │     │ F组: 集成测试  │
└─────────────────┘      └──────────────────────┘     └───────────────┘
    只读基础                    C组唯一产出               不应回写修改
```
