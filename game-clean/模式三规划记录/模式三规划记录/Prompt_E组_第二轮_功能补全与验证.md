# E组 第二轮操作：核心主题——功能补全、Checklist逐项验证与测试全覆盖

## 📊 当前状态评估

**完成度：60% ⚠️ 骨架存在但未经验证**

| 子模块 | 文件 | 测试文件 | Checklist |
|--------|------|---------|----------|
| M09 功能格执行 | CellActionExecutor.ts ✅ | test.ts ✅ | **全部 [ ] 未验证** |
| M10 奖励系统 | RewardSystem.ts ✅ | test.ts ✅ | **全部 [ ] 未验证** |
| M11 进度管理 | ProgressManager.ts ✅ | test.ts ✅ | **全部 [ ] 未验证** |
| 存储层 | SaveStorage.ts ✅ | — | **包含在M11中** |
| 扩展类型 | 3个 .extended.ts ✅ | — | **需确认导出** |

### 关键发现
- **代码文件已全部创建**（这是好消息）
- **测试文件也已创建**（这也是好消息）
- **但Checklist中所有44项均为 [ ] 空白**
- 这意味着：代码可能只是骨架/占位实现，需要逐一验证实际功能完整性

---

## 🔍 本轮核心问题

### 问题1：CellActionExecutor 的6种execute方法是否真正实现了异步交互？

需要验证每个方法是否：
```typescript
// executeBattle() 是否真的：
// 1. 检查 cell.isCompleted → 跳过
// 2. 构造 battleEntrance UI合约
// 3. 通过 uiBridge.requestUI() 显示弹窗
// 4. 等待玩家确认/撤退
// 5. 调用 rewardSystem.grantBattleReward()
// 6. 返回 BattleActionResult
```

### 问题2：RewardSystem 的冲突检测规则是否真正工作？

需要验证：
- `DATA_PACKET_CONFLICT_RULES` 中的3条规则是否被 `processReward()` 实际调用
- `grantDataPacket()` 是否检查互斥/唯一性/上限
- 冲突解决策略（自动 vs 玩家选择）是否正确分支

### 问题3：ProgressManager 的存档系统是否可用？

需要验证：
- `SaveStorage` 是否正确使用 localStorage
- 自动保存定时器是否工作
- `exportProgress()` / `importProgress()` 往返是否数据完整

---

## 🎯 本轮任务清单（按优先级排序）

### 阶段一：逐项Checklist验证（最高优先级）

对照 `.trae/specs/E组-集成层三件套开发/checklist.md` 中的 **44个检查项**，逐一验证：

**M09 (22项)**：
- [ ] execution.types.ts 包含 ExecutionUIContract（6种UI契约）
- [ ] CellActionExecutor 构造函数接受 rewardSystem
- [ ] registerExecutor() / cancelExecution() / isExecuting()
- [ ] UIBridge 的 requestUI / dismissUI / onUserAction
- [ ] executeBattle() 完整流程（7个子项）
- [ ] executeChance() 完整流程（4个子项）
- [ ] executeBookstore() 完整流程（2个子项）
- [ ] executeSkill() 完整流程（2个子项）
- [ ] executeBoss() 完整流程（6个子项）
- [ ] executeEnd() 完整流程（2个子项）

**M10 (23项)**：
- [ ] RewardSystem 初始化 / processReward 主流程（4项）
- [ ] grantDataPacket() 3条冲突规则检测（3项）
- [ ] grantBook() unique_read 规则（2项）
- [ ] grantSkill() 槽位管理（3项）
- [ ] grantBattleReward() / grantBossDataPacketSelection()
- [ ] checkConflicts() / canGrant() / getInventory()
- [ ] removeItem() / replaceSkillSlot() / resetInventory()

**M11 (19项)**：
- [ ] SaveStorage 6个方法（save/load/autoSave/listSlots/deleteSlot）
- [ ] ProgressManager 生命周期（newGame/loadSave/saveGame/autoSave）
- [ ] 进度记录（updatePosition/recordMove/recordBattle/recordBossDefeat/recordLayerComplete/recordZoneTrigger/recordRewardAcquired）
- [ ] 快照管理（getLayerSnapshot/createLayerCompletionSnapshot/restoreToLayerSnapshot）
- [ ] 查询统计（getCurrentProgress/getStatistics/getCompletionPercentage/checkMilestones）
- [ ] 导入导出（exportProgress/importProgress/resetCurrentGame/wipeAllData）

### 阶段二：补充缺失的实现

对于验证中发现的不完整项，进行**功能补全**：

**优先补全列表**（按对游戏体验的影响排序）：
1. **executeBoss() 的数据包三选一逻辑** — 核心玩法闭环
2. **processReward() 的冲突解决流程** — 奖励系统可靠性
3. **ProgressManager.saveGame()/loadGame()** — 存档基本功能
4. **UIBridge 的异步等待机制** — 所有格子的交互基础

### 阶段三：运行并修复测试

```bash
# 运行E组的3个测试文件
cd game-temp && npx vitest run src/tower-mode/__tests__/CellActionExecutor.test.ts
cd game-temp && npx vitest run src/tower-mode/__tests__/RewardSystem.test.ts
cd game-temp && npx vitest run src/tower-mode/__tests__/ProgressManager.test.ts
```

对失败的测试用例进行分析和修复，直到全部通过。

### 阶段四：更新Checklist

将所有已验证通过的项目标记为 `[x]`，输出更新后的 checklist。

---

## 📁 工作范围

**必读参考**：
- [M09-M12_集成层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M09-M12_集成层规格.md) （第5-10节 M09, 第289-538行）
- [.trae/specs/E组-集成层三件套开发/checklist.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/.trae/specs/E组-集成层三件套开发/checklist.md) （原始checklist）

**需读取和修改的代码文件**：
```
engine/CellActionExecutor.ts      — 主要工作文件
engine/RewardSystem.ts            — 主要工作文件
engine/ProgressManager.ts         — 主要工作文件
engine/storage/SaveStorage.ts      — 可能需要修复
types/execution.types.ts          — 确认完整性
types/reward.types.extended.ts    — 确认完整性
types/progress.types.extended.ts  — 确认完整性
```

**测试文件**：
```
__tests__/CellActionExecutor.test.ts  — 运行+修复
__tests__/RewardSystem.test.ts        — 运行+修复
__tests__/ProgressManager.test.ts     — 运行+修复
```

---

## ⚠️ 特别注意

E组是当前**最薄弱的环节**。虽然代码骨架存在，但未经checklist验证意味着：
- 可能存在空方法体（只有签名没有实现）
- 可能存在 TODO/FIXME 占位符
- 异步流程可能未正确处理 Promise
- UIBridge 可能是空实现

**本轮的核心目标是：让E组从"骨架完成"提升到"功能可运行"。**

---

## ✅ 完成标准

- [ ] Checklist 44项中至少 40 项验证通过 (≥90%)
- [ ] 3个测试文件的全部测试用例通过
- [ ] executeBoss() 数据包三选一流程端到端可用
- [ ] processReward() 冲突检测真实生效
- [ ] ProgressManager 存档读写循环一致
- [ ] TypeScript 编译零错误
- [ ] 更新后的Checklist输出

---

> **文档版本**: v2.0 (第二轮)
> **依赖**: A组(类型) + D组(引擎) 完成后执行
> **重要**: E组是当前最大风险点，建议优先投入资源
