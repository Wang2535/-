# D组 第二轮操作：核心主题——引擎性能优化、并发安全加固与集成缺陷修复

## 📊 当前状态评估

**完成度：95% ✅ 基本完成（Checklist全通过）**

| 子模块 | 文件 | 测试 | 状态 |
|--------|------|------|------|
| M06 格子状态机 | CellStateMachine.ts | 39测试 ✅ | 完成 |
| M07 特殊区域 | ZoneEffectManager.ts | 50测试 ✅ | 完成 |
| M08 玩家移动 | MovementEngine.ts + useMovement.ts | 51测试 ✅ | 完成 |
| **合计** | | **140测试 100%通过** | ✅ |

### 已有成果
- 三大引擎完整实现并通过全部单元测试
- 6态转换规则、6种区域效果、BFS寻路均已验证
- useMovement Hook 封装完成

---

## 🔍 本轮发现的问题

### 问题1：CellStateMachine 存在本地类型定义（与A组关联）
`CellStateMachine.ts` 内部重新定义了 `Coordinate2D`, `CellType`, `CellState`, `ZoneType`, `ThemeCategory`, `BaseCell`, `BattleCell` 等类型。
**影响**：与 `types/` 中的定义可能产生微妙不一致。

### 问题2：MovementEngine 的 import 来源问题
```typescript
// 当前代码:
import { ZoneEffectManager, DiceModifierApplied, ZoneApplicationResult } from './ZoneEffectManager';
import { CellState, CellType, ... } from './CellStateMachine';
```
**问题**：引擎间直接相互导入而非从共享 types 导入，形成**隐式耦合链**。

### 问题3：缺少并发/重入保护
- `executeMove()` 在移动过程中如果被再次调用会怎样？
- 状态机的 `requestTransition()` 是否线程安全（虽然JS单线程，但异步操作可能有问题）？
- 区域效果的 `applyEffectsOnEnter()` 如果在动画过程中被多次触发？

### 问题4：性能基准缺失
- BFS寻路在大地图(17格)上的性能如何？
- 多次区域效果叠加时的计算复杂度？
- 状态转换日志无限增长的风险？

---

## 🎯 本轮任务清单

### 任务1：修复类型导入（配合A组）

将所有引擎文件中的：
```typescript
// ❌ 删除这些本地定义
type Coordinate2D = [number, number];
type CellType = ...;
interface BaseCell { ... }
```

替换为：
```typescript
// ✅ 统一从types导入
import type { Coordinate2D, CellType, CellState, GameCell, ... } from '../types';
```

**涉及文件**：
- `engine/CellStateMachine.ts`
- `engine/MovementEngine.ts`
- `engine/ZoneEffectManager.ts`
- `hooks/useMovement.ts`

### 任务2：解耦引擎间的直接依赖

当前依赖关系：
```
MovementEngine → imports from → CellStateMachine (类型)
MovementEngine → imports from → ZoneEffectManager (类型+实例)
```

优化目标：
```
MovementEngine → imports from → ../types (仅类型)
MovementEngine → receives → ZoneEffectManager (通过构造函数注入)
```

具体修改：
1. `MovementEngine` 不再 `import { ZoneEffectManager } from './ZoneEffectManager'`
2. 仅 import 类型：`import type { ZoneApplicationResult, DiceModifierApplied } from '../types'`
3. `ZoneEffectManager` 的实例通过构造函数或 setter 注入

### 任务3：添加操作守卫（防重入）

```typescript
class MovementEngine {
  private _isMoving: boolean = false;
  private _operationLock: Promise<void> = Promise.resolve();

  async executeMove(targetCellId: string): Promise<MovementResult> {
    if (this._isMoving) {
      throw new Error('Cannot move while already moving');
    }
    this._isMoving = true;
    try {
      // ... 原有逻辑
    } finally {
      this._isMoving = false;
    }
  }
}
```

同样为以下方法添加守卫：
- `CellStateMachine.requestTransition()`
- `ZoneEffectManager.applyEffectsOnEnter()`

### 任务4：日志截断与性能监控

```typescript
class CellStateMachine {
  private static MAX_LOG_ENTRIES = 1000;

  requestTransition(request): StateTransitionResult {
    // ... 原有逻辑
    
    // 新增: 日志截断
    if (this.transitionLog.length > CellStateMachine.MAX_LOG_ENTRIES) {
      this.transitionLog = this.transitionLog.slice(-CellStateMachine.MAX_LOG_ENTRIES);
    }
  }

  getTransitionHistory(limit?: number) {
    if (limit) {
      return this.transitionLog.slice(-limit);
    }
    return [...this.transitionLog];
  }
}
```

### 任务5：运行回归测试

修改完成后，运行现有的140个单元测试，确保：
- 全部仍然通过
- 无新的 TypeScript 编译错误
- 性能无退化

---

## 📁 工作范围

**只读参考**：
- [M05-M08_核心引擎规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M05-M08_核心引擎规格.md)

**需修改的文件**：
```
engine/CellStateMachine.ts       — 删除本地类型 + 添加日志截断
engine/ZoneEffectManager.ts       — 删除本地类型 + 添加操作守卫
engine/MovementEngine.ts          — 改为从types导入 + 解耦 + 守卫
hooks/useMovement.ts             — 同步更新导入来源
```

**需运行的测试**：
```
engine/__tests__/CellStateMachine.test.ts     — 回归验证
engine/__tests__/ZoneEffectManager.test.ts   — 回归验证
engine/__tests__/MovementEngine.test.ts     — 回归验证
```

---

## ✅ 完成标准

- [ ] 所有本地类型定义已清除，改为 import
- [ ] 引擎间解耦完成（不再直接相互 import 类）
- [ ] 操作守卫机制生效（防重入）
- [ ] 日志截断机制防止内存泄漏
- [ ] 140个现有单元测试100%通过
- [ ] TypeScript 编译零错误

---

> **文档版本**: v2.0 (第二轮)
> **依赖**: A组第二轮完成后优先执行（其他组依赖D组的类型修正）
