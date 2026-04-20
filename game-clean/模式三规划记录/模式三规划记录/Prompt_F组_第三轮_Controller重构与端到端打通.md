# F组 第三轮操作，核心主题：Controller模块加载机制重构与端到端流程打通

## 📊 当前开发状态

**完成度：85% ✅ 组件已实现，Controller需重构**

### 已有成果
- ✅ `TowerModeApp.tsx` — 完整的React主组件，条件渲染13个弹窗
- ✅ 13个UI组件全部有实质实现（含内联样式、事件绑定）
- ✅ `EventBus.ts` — 类型安全事件总线
- ✅ `TowerModeController.ts` — 生命周期管理完整
- ✅ `TowerIntegration.test.ts` — 集成测试文件已创建

### 🔴 核心问题：Controller使用 `require()` 动态加载引擎模块

```typescript
// ❌ TowerModeController.ts 第24-31行
let LevelAssignmentEngine: any;
let RewardSystem: any;
let CellActionExecutor: any;
let ProgressManager: any;
let CellStateMachine: any;
let ZoneEffectManager: any;
let MovementEngine: any;
let ZONE_EFFECT_CONFIG: any;

try {
  const levelModule = require('./engine/LevelAssignmentEngine');
  LevelAssignmentEngine = levelModule.LevelAssignmentEngine || levelModule.default;
} catch (e) {
  console.warn('[TowerModeController] Failed to import LevelAssignmentEngine, using fallback', e);
  LevelAssignmentEngine = class FallbackLevelEngine { ... };
}
// ... 同样模式重复7次
```

**问题分析**：
1. **`require()` 在ES Module项目中不适用** — 如果项目使用ESM，`require` 会报错
2. **所有类型都是 `any`** — 完全丧失类型安全
3. **Fallback类占大量代码** — Controller文件臃肿
4. **`./engine/LevelAssignmentEngine` 路径错误** — 应该是 `./engine/LevelAssignmentEngine`（当前文件已在tower-mode根目录，路径正确但需确认）

### 其他问题

#### 问题2：组件导入路径从具体类型文件导入
```typescript
// ❌ TowerModeController.ts
import type { GamePhase, ... } from './types/integrator.types';
import type { TowerLayerData, ... } from './types/map.types';
import type { GameCell, ... } from './types/cell.types';

// ✅ 应统一为
import type { GamePhase, TowerLayerData, GameCell, ... } from './types';
```

#### 问题3：TowerModeApp 的 `currentPosition` 类型不匹配
```typescript
// TowerModeApp.tsx 第142行
currentPosition={renderState?.currentPosition ?? { x: 0, y: 0 }}
// 但 Coordinate2D 是 [number, number] 元组类型，不是 {x, y} 对象
```

#### 问题4：DataPacketSelector 本地定义了 DataPacket 接口
```typescript
// ❌ DataPacketSelector/index.tsx 第3-9行
interface DataPacket {
  id: string;
  name: string;
  description?: string;
  quality?: string;
  effectDescription?: string;
}
// 应该从 types 导入
```

---

## 🎯 本轮任务

### 任务1：重构 Controller 的模块加载机制（最高优先级）

将 `require()` + fallback 模式替换为标准的 ES Module 导入：

```typescript
// ✅ 新的 TowerModeController.ts 顶部
import { LevelAssignmentEngine } from './engine/LevelAssignmentEngine';
import { CellStateMachine } from './engine/CellStateMachine';
import { ZoneEffectManager } from './engine/ZoneEffectManager';
import { MovementEngine } from './engine/MovementEngine';
import { CellActionExecutor } from './engine/CellActionExecutor';
import { RewardSystem } from './engine/RewardSystem';
import { ProgressManager } from './engine/ProgressManager';
import { ZONE_EFFECT_CONFIG } from './constants';

import type {
  GamePhase, ActiveModalType, Notification, TowerUIState,
  ModuleInstances, PlayerStatsDisplay, RenderCellData,
  TowerRenderState, TowerInitConfig, TowerError, IntegratorState,
  TowerLayerData, GameCell, CellState, Coordinate2D,
  DiceRollResult, MoveOption, MovementResult,
  DataPacket, InventorySnapshot, RewardSource,
  TowerProgressState, GameSession, SaveMeta, GameStatistics, Milestone,
  ZoneType, BattleActionResult,
} from './types';
```

删除所有 `try { require(...) } catch` 块和 Fallback 类（约100行代码）。

在 `initialize()` 方法中直接实例化：
```typescript
async initialize(config?: TowerInitConfig): Promise<void> {
  this.setPhase('initializing');

  // 直接实例化（不再需要 try/catch）
  this.modules = {
    levelEngine: new LevelAssignmentEngine(config?.seed),
    cellStateMachine: new CellStateMachine([]),
    zoneManager: new ZoneEffectManager([], ZONE_EFFECT_CONFIG),
    movementEngine: new MovementEngine(null), // 稍后注入zoneManager
    actionExecutor: new CellActionExecutor(null), // 稍后注入rewardSystem
    rewardSystem: new RewardSystem(),
    progressManager: new ProgressManager(),
  };

  // 交叉注入
  this.modules.movementEngine.setZoneManager(this.modules.zoneManager);
  this.modules.actionExecutor.setRewardSystem(this.modules.rewardSystem);

  // 加载地图数据
  const { getAllLayers } = await import('./data');
  const layers = getAllLayers();
  // ...

  this.setPhase('idle');
}
```

### 任务2：统一 Controller 和组件的导入路径

将所有 `from './types/xxx.types'` 改为 `from './types'`。

涉及文件：
```
TowerModeController.ts
TowerModeApp.tsx
components/MovementControl/index.tsx
components/TowerMapView/index.tsx
```

### 任务3：修复 TowerModeApp 的类型错误

```typescript
// 修复 currentPosition 类型
// ❌ 当前
currentPosition={renderState?.currentPosition ?? { x: 0, y: 0 }}

// ✅ 修正（Coordinate2D 是 [number, number]）
currentPosition={renderState?.currentPosition ?? [0, 0] as Coordinate2D}
```

### 任务4：修复 DataPacketSelector 的本地类型定义

```typescript
// ❌ 删除本地定义
interface DataPacket { ... }

// ✅ 改为导入
import type { DataPacket } from '../../types';
```

### 任务5：运行集成测试

```bash
cd game-temp && npx vitest run src/tower-mode/__tests__/TowerIntegration.test.ts
```

修复任何失败的测试。

### 任务6：验证端到端流程

确认以下最小可玩流程可以走通：
1. `new TowerModeController()` → `initialize()` → `startNewGame()`
2. `rollDice()` → 返回 DiceRollResult
3. `getAvailableMoves()` → 返回 MoveOption[]
4. `moveToCell(id)` → 触发格子
5. `interactWithCurrentCell('confirm')` → 进入战斗/选择

---

## ✅ 完成标准

- [ ] Controller 使用标准 ES Module 导入（删除所有 require/fallback）
- [ ] Controller 文件从 ~300行 减少到 ~150行
- [ ] 所有类型从 `./types` 统一导入
- [ ] TowerModeApp 的 currentPosition 类型正确
- [ ] DataPacketSelector 使用导入的 DataPacket 类型
- [ ] 集成测试通过
- [ ] TypeScript 编译零错误
