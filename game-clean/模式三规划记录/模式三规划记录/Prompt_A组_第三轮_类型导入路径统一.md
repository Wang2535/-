# A组 第三轮操作，核心主题：类型导入路径统一与缺失类型补全

## 📊 当前开发状态

**完成度：97% ✅ 第二轮修复基本完成**

### 已修复（第二轮成果）
- ✅ `CellStateMachine.ts` — 已改为 `import type { ... } from '../types'`
- ✅ `MovementEngine.ts` — 已改为 `import type { ... } from '../types'`
- ✅ `ZoneEffectManager.ts` — 已改为 `import type { ... } from '../types'`
- ✅ `LevelAssignmentEngine.ts` — 已改为 `import type { ... } from '../types/levelAssignment.types'`
- ✅ `types/index.ts` — 已包含所有类型导出

### 🔴 仍存在的问题

#### 问题1：E组模块从 `types/cell.types` 直接导入而非从 `types` 统一入口导入
```typescript
// ❌ CellActionExecutor.ts 第1-26行
import type { GameCell, BattleCell, ... } from '../types/cell.types';
import type { CellExecutor, ... } from '../types/execution.types';

// ✅ 应该统一为
import type { GameCell, BattleCell, CellExecutor, ... } from '../types';
```

#### 问题2：B组地图数据从 `types/cell.types` 直接导入
```typescript
// ❌ layer3-data-vault.ts 第1-24行
import type { Coordinate2D, GridSize, ... } from '../../types/cell.types';

// ✅ 应该统一为
import type { Coordinate2D, GridSize, ... } from '../../types';
```

#### 问题3：F组组件从具体类型文件导入
```typescript
// ❌ MovementControl/index.tsx
import type { DiceRollResult, MoveOption } from '../../types/movement.types';

// ❌ TowerMapView/index.tsx
import type { TowerLayerData } from '../../types/map.types';
import type { RenderCellData } from '../../types/integrator.types';
import type { Coordinate2D } from '../../types/cell.types';
```

#### 问题4：`types/index.ts` 缺少部分扩展类型的导出
当前 `types/index.ts` 未导出 `reward.types.extended.ts` 和 `progress.types.extended.ts` 中的类型。

---

## 🎯 本轮任务

### 任务1：补全 `types/index.ts` 的导出

在 `types/index.ts` 末尾添加：
```typescript
export type {
  RewardType, RewardItem, RewardContext, RewardRequest, RewardResult,
  GrantedItem, RejectedItem, ConflictResolution, ConflictRule,
  ConflictInfo, ConflictResolutionOption, InventorySnapshot,
  GrantResult, BattleRewardResult, CanGrantCheck, RemoveResult,
  ReplaceResult, RewardStatistics, RejectReason, RewardSource,
} from './reward.types.extended';

export type {
  ProgressManagerState, GameSession, SaveMeta, LayerSnapshot,
  TowerSaveData, GameStatistics, Milestone, MilestoneCondition,
  MovementRecord, ImportResult,
} from './progress.types.extended';

export type {
  CellExecutor, ExecutorRegistry, ExecutionUIContract,
  ExecutionUIContractKey, LayerPreviewInfo, ExecutionContext, TriggerContext,
} from './execution.types';

export type {
  GamePhase, ActiveModalType, Notification, TowerUIState,
  ModuleInstances, PlayerStatsDisplay, RenderCellData,
  TowerRenderState, TowerInitConfig, TowerError, IntegratorState,
} from './integrator.types';
```

### 任务2：统一所有文件的导入路径为 `../types` 或 `../../types`

**需修改的文件清单**（将 `from '../types/xxx.types'` 改为 `from '../types'`）：

```
engine/CellActionExecutor.ts     ← 从 types/cell.types + types/execution.types → types
engine/RewardSystem.ts           ← 从 types/cell.types + types/reward.types.extended → types
engine/ProgressManager.ts        ← 从 types/cell.types + types/progress.types.extended → types
data/layers/layer1-virus-lab.ts  ← 从 types/cell.types → types
data/layers/layer2-cyberspace.ts ← 同上
data/layers/layer3-data-vault.ts ← 同上
data/layers/layer4-grid-city.ts  ← 同上
data/layers/layer5-smart-factory.ts ← 同上
data/layers/layer6-mobile-terminal.ts ← 同上
data/layers/layer7-cloud-platform.ts ← 同上
data/layers/layer8-future-lab.ts ← 同上
data/layers/layer9-command-center.ts ← 同上
components/MovementControl/index.tsx ← 从 types/movement.types → types
components/TowerMapView/index.tsx ← 从 types/map.types + types/integrator.types + types/cell.types → types
TowerModeController.ts          ← 从 types/integrator.types + types/map.types + types/cell.types + ... → types
TowerModeApp.tsx                ← 从 types/integrator.types → types
```

### 任务3：验证编译

```bash
cd game-temp && npx tsc --noEmit
```

确保所有导入路径修改后零错误。

---

## ✅ 完成标准

- [ ] `types/index.ts` 包含所有类型的统一导出
- [ ] 所有文件统一从 `../types` 或 `../../types` 导入（不再直接引用子文件）
- [ ] TypeScript 编译零错误
- [ ] 无循环依赖警告
