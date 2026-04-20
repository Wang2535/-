# A组 第二轮操作：核心主题——类型系统一致性校验与跨模块接口对齐

## 📊 当前状态评估

**完成度：95% ✅ 基本完成**

| 子模块 | 文件数 | 状态 | Checklist |
|--------|--------|------|-----------|
| M01 类型定义 | 14个文件 | ✅ 完成 | 全部 [x] 通过 |
| M02 常量配置 | 7个文件 | ✅ 完成 | 全部 [x] 通过 |
| M03 工具函数 | 6个文件 | ✅ 完成 | 全部 [x] 通过 |
| **总计** | **27个文件** | **✅** | **TypeScript编译零错误** |

### 已有成果
- `types/` 下14个类型文件全部创建，含统一导出 `index.ts`
- `constants/` 下7个常量配置文件，含运行时验证
- `utils/` 下6个工具函数文件，含可播种RNG
- 所有Checklist项目已勾选通过

---

## 🔍 本轮发现的问题

经过代码审查，发现以下需要修复的问题：

### 问题1：类型重复定义（严重）
**现象**：`CellStateMachine.ts`、`layer1-virus-lab.ts` 等引擎/数据文件中存在**本地重新定义**的类型，而非从 `types/` 导入。
```typescript
// ❌ CellStateMachine.ts 中错误地本地定义了：
type Coordinate2D = [number, number];   // 应该 import
type CellType = 'start' | 'battle' | ...; // 应该 import
type ZoneType = 'W' | 'N' | ...;          // 应该 import

// ❌ layer1-virus-lab.ts 中也本地定义了：
interface BaseCell { ... }                  // 应该 import
interface BattleCell extends BaseCell { ... } // 应该 import
```
**影响范围**：可能导致类型不一致、编译器无法检测跨模块类型错误。

### 问题2：扩展类型文件未纳入主索引
**现象**：`reward.types.extended.ts` 和 `progress.types.extended.ts` 已创建但可能未被正确引用。
- E组(M09-M11)使用了这些扩展类型
- 但A组原始checklist不包含这些文件

### 问题3：部分守卫函数缺失实现
**现象**：`cell.types.ts` 导出了 `isBattleCell` 等6个守卫函数，需确认实际函数体是否完整。

---

## 🎯 本轮任务清单

### 任务1：消除类型重复定义（最高优先级）

检查并修复所有非 `types/` 目录下的类型定义，确保全部改为 `import`：

**需检查的文件列表**：
```
engine/CellStateMachine.ts        ← 发现本地类型定义
engine/MovementEngine.ts          ← 需确认
engine/ZoneEffectManager.ts      ← 需确认
engine/LevelAssignmentEngine.ts  ← 需确认
engine/CellActionExecutor.ts     ← 需确认
engine/RewardSystem.ts           ← 需确认
engine/ProgressManager.ts        ← 需确认
data/layers/layer*.ts (9个)      ← layer1已确认有问题
hooks/useMovement.ts             ← 需确认
TowerModeController.ts           ← 需确认
EventBus.ts                      ← 需确认
```

**修复规则**：
1. 删除所有文件顶部的本地 `type` / `interface` 定义
2. 改为从 `../types` 或 `../types/index` 导入
3. 如果某类型确实在原 types 中不存在，将其补充到对应的 types 文件中

### 任务2：补全扩展类型到主索引

确保 `types/index.ts` 正确导出：
```typescript
export * from './execution.types';
export * from './reward.types.extended';
export * from './progress.types.extended';
export * from './levelAssignment.types';
export * from './integrator.types';
export * from './map.types';
```

### 任务3：验证守卫函数完整性

检查 `cell.types.ts` 中的6个类型守卫函数：
```typescript
export function isBattleCell(cell: GameCell): cell is BattleCell { ... }
export function isChanceCell(cell: GameCell): cell is ChanceCell { ... }
export function isBookstoreCell(cell: GameCell): cell is BookstoreCell { ... }
export function isSkillCell(cell: GameCell): cell is SkillCell { ... }
export function isBossCell(cell: GameCell): cell is BossCell { ... }
export function isEndCell(cell: GameCell): cell is EndCell { ... }
```

每个函数必须：
- 使用 TypeScript 类型谓词 (`cell is XxxCell`)
- 检查 `cell.type === 'xxx'`

### 任务4：运行TypeScript编译验证

执行编译命令，确保修改后零错误：
```bash
cd game-temp && npx tsc --noEmit --project tsconfig.json
```

### 任务5：生成类型一致性报告

输出一份报告，列出：
- 所有类型定义的**唯一来源**（应在 `types/` 目录）
- 所有使用该类型的文件（应通过 import 引用）
- 任何残留的本地类型定义

---

## 📁 工作范围

**只读文件**（参考用）：
- `M00_模块化架构总览.md`
- `M01-M04_基础层规格.md`

**需修改的文件**（在 `game-temp/src/tower-mode/` 下）：
- `types/*.ts` — 可能需要补充缺失的类型
- `types/index.ts` — 补全导出
- `engine/*.ts` — 删除本地类型定义，改import
- `data/layers/*.ts` — 同上
- `hooks/*.ts` — 同上
- `TowerModeController.ts` — 同上
- `EventBus.ts` — 同上

**不允许修改**：
- 不修改任何业务逻辑
- 不修改常量数值
- 不修改函数签名（仅修正类型导入方式）

---

## ✅ 完成标准

- [ ] 所有非 `types/` 文件中的本地类型定义已清除
- [ ] 所有类型均通过 `import` 从 `types/` 获取
- [ ] `types/index.ts` 包含所有类型的导出
- [ ] 6个类型守卫函数完整且正确
- [ ] TypeScript 编译零错误
- [ ] 输出类型一致性报告

---

> **文档版本**: v2.0 (第二轮)
> **基于**: 第一轮A组Prompt的全部成果
