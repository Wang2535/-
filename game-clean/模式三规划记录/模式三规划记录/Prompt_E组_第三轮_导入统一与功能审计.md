# E组 第三轮操作，核心主题：导入路径统一、UIBridge异步闭环验证与核心方法功能审计

## 📊 当前开发状态

**完成度：80% ⚠️ 功能骨架存在，关键细节需验证**

### 已有成果
- ✅ `CellActionExecutor.ts` — 6种execute方法骨架 + UIBridge + SimpleEventEmitter
- ✅ `RewardSystem.ts` — 冲突规则(3组) + processReward主流程 + 库存管理
- ✅ `ProgressManager.ts` — 存档系统 + 里程碑 + 快照 + 自动保存
- ✅ `SaveStorage.ts` — localStorage存储层
- ✅ 测试文件已创建

### 🔴 仍存在的问题

#### 问题1：CellActionExecutor 从 `types/cell.types` 直接导入
```typescript
// ❌ 当前
import type { GameCell, BattleCell, ... } from '../types/cell.types';
import type { CellExecutor, ... } from '../types/execution.types';

// ✅ 应改为
import type { GameCell, BattleCell, CellExecutor, ... } from '../types';
```

#### 问题2：RewardSystem 从 `types/cell.types` + `types/reward.types.extended` 直接导入
```typescript
// ❌ 当前
import type { DataPacket, Book, Skill, ... } from '../types/cell.types';
import type { RewardType, RewardItem, ... } from '../types/reward.types.extended';

// ✅ 应改为
import type { DataPacket, Book, Skill, RewardType, RewardItem, ... } from '../types';
```

#### 问题3：ProgressManager 从 `types/cell.types` + `types/progress.types.extended` 直接导入
同样需要统一为 `../types`。

#### 问题4：UIBridge 的异步闭环是否真正工作？
`UIBridge.requestUI()` 返回 Promise，但 `resolveUI()` 是否被正确调用？
- CellActionExecutor 的 executeBattle() 调用 `uiBridge.requestUI('battleEntrance', ...)` 后
- TowerModeController 是否监听了 `ui_request` 事件？
- 用户点击确认后是否调用了 `uiBridge.resolveUI(result)`？
- 这个闭环是否完整？

#### 问题5：CellActionExecutor 的6种execute方法是否真正完整实现？
需要逐一审计每个方法的函数体，确认不是空壳。

---

## 🎯 本轮任务

### 任务1：统一导入路径

修改以下3个文件的导入路径：
```
engine/CellActionExecutor.ts  → import from '../types'
engine/RewardSystem.ts        → import from '../types'
engine/ProgressManager.ts     → import from '../types'
```

### 任务2：审计 CellActionExecutor 的6种execute方法

逐一读取每个方法的完整实现，确认：

| 方法 | 必须包含的逻辑 | 验证结果 |
|------|--------------|---------|
| `executeBattle()` | 前置检查 → UIBridge弹窗 → 等待战斗结果 → 奖励发放 → 状态更新 | ? |
| `executeChance()` | 事件抽取 → 选项展示 → 结果结算 | ? |
| `executeBookstore()` | 书籍抽取(3本) → 选择 → grantBook() | ? |
| `executeSkill()` | 品质抽取 → 技能展示 → 槽位管理 → grantSkill() | ? |
| `executeBoss()` | BOSS战 → 数据包三选一 → grantDataPacket() → End格生成 | ? |
| `executeEnd()` | 层间过渡 → LAYER_COMPLETE事件 → 下一层加载 | ? |

对每个方法，如果发现空壳或TODO，补充完整实现。

### 任务3：验证 UIBridge 异步闭环

检查以下调用链是否完整：
```
CellActionExecutor.executeBattle()
  → uiBridge.requestUI('battleEntrance', data)
  → 发出 'ui_request' 事件
  → TowerModeController 监听该事件
  → 设置 renderState.uiState.activeModal = 'battle_entrance'
  → React 渲染 BattleEntranceModal
  → 用户点击"进入战斗"
  → TowerModeController 调用 uiBridge.resolveUI({ action: 'confirm' })
  → requestUI() 的 Promise resolve
  → executeBattle() 继续执行后续逻辑
```

如果闭环不完整，在 `TowerModeController.ts` 中补充 UIBridge 的事件监听。

### 任务4：运行E组测试

```bash
cd game-temp && npx vitest run src/tower-mode/__tests__/CellActionExecutor.test.ts
cd game-temp && npx vitest run src/tower-mode/__tests__/RewardSystem.test.ts
cd game-temp && npx vitest run src/tower-mode/__tests__/ProgressManager.test.ts
```

修复任何失败的测试。

### 任务5：输出E组功能审计报告

```
=== E组功能审计报告 ===

CellActionExecutor:
  executeBattle():   [完整/部分/空壳] - 说明
  executeChance():   [完整/部分/空壳] - 说明
  executeBookstore(): [完整/部分/空壳] - 说明
  executeSkill():    [完整/部分/空壳] - 说明
  executeBoss():     [完整/部分/空壳] - 说明
  executeEnd():      [完整/部分/空壳] - 说明
  UIBridge闭环:      [完整/缺失] - 说明

RewardSystem:
  processReward():    [完整/部分/空壳]
  grantDataPacket():  [完整/部分/空壳]
  grantBook():        [完整/部分/空壳]
  grantSkill():       [完整/部分/空壳]
  冲突检测:           [工作/未工作]

ProgressManager:
  newGame/loadSave/saveGame: [完整/部分/空壳]
  自动保存:                  [工作/未工作]
  快照系统:                  [完整/部分/空壳]
  里程碑:                    [工作/未工作]

测试通过率: ???/???
```

---

## ✅ 完成标准

- [ ] 3个引擎文件导入路径统一为 `../types`
- [ ] 6种execute方法全部有实质实现（非空壳）
- [ ] UIBridge异步闭环完整
- [ ] 3个测试文件全部通过
- [ ] 输出完整功能审计报告
