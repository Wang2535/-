# F组 第二轮操作：核心主题——组件交互逻辑填充、端到端联调与TowerModeApp闭环验证

## 📊 当前状态评估

**完成度：75% ⚠️ 壳子完成，深度不足**

| 子模块 | 文件数 | Checklist状态 |
|--------|--------|-------------|
| M12 控制器 | TowerModeController.ts ✅ | 大部分 [x] |
| 主组件 | TowerModeApp.tsx ✅ | 大部分 [x] |
| 事件总线 | EventBus.ts ✅ | 全部 [x] |
| UI组件 | 13个组件 ✅ | 基础 [x]，**深度待确认** |

### 已有成果
- 13个UI组件全部创建（骨架）
- TowerModeController 生命周期完整
- TowerModeApp 组件结构完整
- EventBus 类型安全

### 关键问题
**UI组件可能只是"壳子"**——有基本结构但缺少：
1. 实际的交互逻辑（点击按钮后的处理函数体是否为空？）
2. 数据绑定（props是否正确传递到内部元素？）
3. 样式实现（是否有CSS/className？）
4. 状态管理（内部state是否正确使用？）

---

## 🔍 本轮发现的问题

### 问题1：组件深度未知

需要逐一检查13个组件的实际实现质量：

| 组件 | 预期功能 | 需验证 |
|------|---------|--------|
| **BattleEntranceModal** | 显示关卡信息+确认/撤退按钮 | 按钮onClick是否绑定回调？ |
| **ChanceEventModal** | 显示事件描述+选项按钮 | 选项渲染是否动态？ |
| **BookstoreModal** | 展示3本书+购买逻辑 | 金币判断是否工作？ |
| **SkillPanel** | 技能展示+槽位替换 | 替换逻辑是否实现？ |
| **DataPacketSelector** | BOSS战后三选一 | 选择后是否调用奖励系统？ |
| **LayerTransition** | 层间过渡动画 | "继续"按钮是否触发下一层？ |
| **GameCompleteScreen** | 最终结算画面 | 统计数据是否正确传入？ |
| **MovementControl** | 骰子+移动选项 | rollDice/moveTo 是否连接控制器？ |
| **TowerMapView** | 地图渲染 | 格子数据是否正确显示？ |
| **TowerHUD** | 顶部信息栏 | HP/技能/数据包数量是否实时更新？ |

### 问题2：端到端流程未打通

需要验证的完整链路：
```
用户点击"投骰" → MovementControl.rollDice()
  → Controller.rollDice() → Engine.rollDice() + ZoneManager.getDiceModifier()
  → 返回 DiceRollResult → 更新UI显示骰子点数

用户点击目标格子 → MovementControl.moveToCell(id)
  → Controller.moveToCell(id) → Engine.executeMove(id)
    → BFS寻路 → 逐步移动动画
    → 到达 → CellStateMachine.handlePlayerEnter()
    → CellActionExecutor.execute(cell)
      → 根据类型分发 → 显示对应弹窗
        → 用户操作 → 奖励发放 → 状态更新 → UI刷新
```

### 问题3：TowerIntegration.test.ts 集成测试

已存在集成测试文件，但需运行并确保通过。

---

## 🎯 本轮任务清单

### 任务1：逐一审查13个UI组件的实现深度

对每个组件执行以下检查：

```typescript
// 检查模板（以 BattleEntranceModal 为例）
// 1. 是否接收正确的 props？
interface Props {
  data: ExecutionUIContract['battleEntrance'];  // 必须有
  onConfirm: () => void;                          // 必须有
  onRetreat: () => void;                           // 必须有
}

// 2. 渲染内容是否完整？
// - 关卡名称/难度/预览信息
// - 确认按钮 (onConfirm)
// - 撤退按钮 (onRetreat)
// - 关闭按钮

// 3. 样式是否合理？
// - 有 className 或 CSS module
// - 弹窗布局正确（居全屏/模态）

// 4. 边界情况？
// - data 为空时不崩溃
// - 快速连续点击不重复触发
```

**输出**: 每个组件的质量评级（A/B/C/D）和修复建议

### 任务2：填充缺失的交互逻辑

对于评级为 C/D 的组件，补充实际功能：

**优先级排序**（按对游戏可玩性的影响）：
1. `MovementControl` — 无它无法移动
2. `TowerMapView` — 无它看不到地图
3. `BattleEntranceModal` — 无法进入战斗
4. `DataPacketSelector` — BOSS奖励无法领取
5. `LayerTransition` — 无法进入下一层

### 任务3：端到端集成测试

编写或修复 `src/__tests__/tower/tower/TowerIntegration.test.ts`：

```typescript
describe('TowerMode 端到端集成', () => {
  it('完整流程: 新游戏→投骰→移动→战斗格进入→撤退', async () => {});
  it('BOSS战流程: 击败BOSS→选择数据包→进入下一层', async () => {});
  it('存档循环: 保存→读取→恢复状态一致', async () => {});
  it('9层通关流程: 从第1层打到第9层完成', async () => {});
  it('区域效果: 踩中W区骰子-1, 踩中S区额外投掷', async () => {});
});
```

### 任务4：运行全部测试并修复

```bash
# E组测试（依赖E组先通过）
npx vitest run src/tower-mode/__tests__/CellActionExecutor.test.ts
npx vitest run src/tower-mode/__tests__/RewardSystem.test.ts
npx vitest run src/tower-mode/__tests__/ProgressManager.test.ts

# D组测试
npx vitest run src/tower-mode/__tests__/CellStateMachine.test.ts
npx vitest run src/tower-mode/__tests__/ZoneEffectManager.test.ts
npx vitest run src/tower-mode/__tests__/MovementEngine.test.ts

# F组集成测试
npx vitest run src/__tests__/tower/tower/TowerIntegration.test.ts
```

### 任务5：生成组件质量报告 + 修复追踪表

输出格式：
```
┌─────────────────────┬──────────┬──────────┬──────────────┐
│ 组件                 │ 评级     │ 主要问题  │ 修复状态    │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ MovementControl     │ B→A      │ 缺少禁用 │ ✅ 已修复   │
│ TowerMapView        │ C→B      │ 格子无样式 │ 🔧 进行中  │
│ BattleEntranceModal │ A        │ 无       │ ✅         │
│ ...                 │          │          │            │
└─────────────────────┴──────────┴──────────┴──────────────┘
```

---

## 📁 工作范围

**只读参考**：
- [M09-M12_集成层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M09-M12_集成层规格.md) （第12节 M12, 第806-1030行）
- [.trae/specs/F组-M12层级集成器开发/checklist.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/.trae/specs/F组-M12层级集成器开发/checklist.md)

**需审查和修改的文件**：
```
TowerModeApp.tsx                    — 主组件审查
TowerModeController.ts               — 控制器审查
EventBus.ts                         — 事件总线审查
components/TowerMapView/index.tsx    — 地图视图
components/TowerHUD/index.tsx       — 信息栏
components/MovementControl/index.tsx — 移动控制
components/BattleEntranceModal/index.tsx
components/ChanceEventModal/index.tsx
components/BookstoreModal/index.tsx
components/SkillPanel/index.tsx
components/DataPacketSelector/index.tsx
components/LayerTransition/index.tsx
components/GameCompleteScreen/index.tsx
components/TowerStartScreen/index.tsx
components/PauseOverlay/index.tsx
components/NotificationContainer/index.tsx
hooks/useMovement.ts                — Hook审查
```

---

## ⚠️ 特别注意

F组是**面向用户的最后一道防线**。即使底层引擎(E/D组)完美无缺，如果F组的组件只是空壳，用户仍然无法正常游戏。

**本轮的核心目标是：让整个塔模式从"代码存在"变为"可以实际游玩的最小可用版本(MVP)"。**

---

## ✅ 完成标准

- [ ] 13个UI组件至少10个达到 B 级以上（有实际功能）
- [ ] 核心组件（MovementControl/TowerMapView/BattleEntranceModal/DataPacketSelector/LayerTransition）达到 A 级
- [ ] 端到端集成测试至少3个场景通过
- [ ] TypeScript 编译零错误
- [ ] 所有测试文件100%通过
- [ ] 输出完整的组件质量报告

---

> **文档版本**: v2.0 (第二轮)
> **依赖**: A/B/C/D/E 组全部完成后执行（F组是最终集成，依赖所有前置组）
> **建议**: 可在E组达到80%时提前开始F组的组件审查（并行推进）
