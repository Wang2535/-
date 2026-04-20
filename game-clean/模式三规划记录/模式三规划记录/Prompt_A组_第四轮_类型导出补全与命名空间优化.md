# A组 第四轮操作，核心主题：类型导出补全与命名空间优化

## 📊 当前开发状态

**完成度：98% ✅ 导入路径已统一**

### 第三轮已完成
- ✅ `types/index.ts` 已包含大部分类型导出
- ✅ E组/F组已改为 `import { ... } from '../types'`
- ✅ TypeScript编译基本通过

### 🔴 仍存在的问题

#### 问题1：`types/index.ts` 缺少部分导出
当前 `types/index.ts` 末尾的导出列表不完整，缺少：
- `reward.types.extended.ts` 中的类型
- `progress.types.extended.ts` 中的类型
- `execution.types.ts` 中的类型

#### 问题2：类型命名冲突风险
`CellActionResult` 在 `execution.types.ts` 中定义为联合类型，但在其他文件中被当作接口使用，可能导致类型不兼容。

#### 问题3：部分类型守卫函数可能未导出
需要确认 `isBattleCell` 等6个守卫函数是否在 `index.ts` 中导出。

---

## 🎯 本轮任务

### 任务1：补全 `types/index.ts` 的所有类型导出

在 `types/index.ts` 末尾添加缺失的导出：

```typescript
// 从 execution.types.ts 导出
export type {
  CellExecutor,
  ExecutorRegistry,
  ExecutionUIContract,
  ExecutionUIContractKey,
  LayerPreviewInfo,
  ExecutionContext,
  TriggerContext,
  PreActionInfo,
} from './execution.types';

// 从 reward.types.extended.ts 导出
export type {
  RewardType,
  RewardItem,
  RewardContext,
  RewardRequest,
  RewardResult,
  GrantedItem,
  RejectedItem,
  ConflictResolution,
  ConflictRule,
  ConflictInfo,
  ConflictResolutionOption,
  InventorySnapshot,
  GrantResult,
  BattleRewardResult,
  CanGrantCheck,
  RemoveResult,
  ReplaceResult,
  RewardStatistics,
  RejectReason,
  RewardSource,
} from './reward.types.extended';

// 从 progress.types.extended.ts 导出
export type {
  ProgressManagerState,
  GameSession,
  SaveMeta,
  LayerSnapshot,
  TowerSaveData,
  GameStatistics,
  Milestone,
  MilestoneCondition,
  MovementRecord,
  ImportResult,
} from './progress.types.extended';
```

### 任务2：验证类型守卫函数导出

确认 `types/cell.types.ts` 中的守卫函数已导出，并在 `index.ts` 中重新导出：

```typescript
// 在 types/index.ts 中添加
export {
  isBattleCell,
  isChanceCell,
  isBookstoreCell,
  isSkillCell,
  isBossCell,
  isEndCell,
} from './cell.types';
```

### 任务3：运行最终类型检查

```bash
cd game-temp && npx tsc --noEmit
```

确保零错误。

### 任务4：生成类型导出清单

输出一份完整的类型导出清单，供其他组参考：

```
=== tower-mode/types 导出清单 ===

基础类型 (cell.types.ts):
  - GameCell, BattleCell, ChanceCell, BookstoreCell, SkillCell, BossCell, EndCell
  - CellType, CellState, ZoneType, ThemeCategory
  - Coordinate2D, GridSize, PathConnection
  - isBattleCell, isChanceCell, ... (6个守卫函数)

区域类型 (zone.types.ts):
  - ZoneDefinition, ZoneEffectConfig, ZoneEffectType
  - ZoneApplicationResult, ZoneEffectContext

移动类型 (movement.types.ts):
  - DiceRollResult, MoveOption, MovementResult
  - MovementRecord, MovementEngineState

奖励类型 (reward.types.ts + reward.types.extended.ts):
  - DataPacket, Book, Skill, RarityLevel
  - RewardRequest, RewardResult, InventorySnapshot

执行类型 (execution.types.ts):
  - CellExecutor, ExecutionUIContract, ExecutionContext

进度类型 (progress.types.ts + progress.types.extended.ts):
  - TowerProgressState, LayerSnapshot, GameStatistics

集成器类型 (integrator.types.ts):
  - GamePhase, TowerRenderState, ModuleInstances

总计: XX 个类型, YY 个守卫函数
```

---

## ✅ 完成标准

- [ ] `types/index.ts` 包含所有类型的完整导出
- [ ] 6个类型守卫函数正确导出
- [ ] TypeScript 编译零错误
- [ ] 输出完整的类型导出清单

---

> **文档版本**: v4.0 (第四轮)
> **本轮目标**: 类型系统最终完善
