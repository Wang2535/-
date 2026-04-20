# C组 第三轮操作，核心主题：关卡分配与地图数据对接验证

## 📊 当前开发状态

**完成度：92% ✅ 引擎完整，需验证与M04数据的对接**

### 已有成果
- ✅ `LevelAssignmentEngine.ts` 完整实现
- ✅ `ENHANCEMENT_TABLE` 5级强化表配置完成
- ✅ `BOSS_SKILL_POOL` / `BOSS_CARD_POOL` / `DATA_PACKET_POOL` 各9组
- ✅ `themeLevelMapping.ts` 9主题关卡映射完成
- ✅ 压力测试文件 `LevelAssignmentEngine.stress.test.ts` 和 `validation.test.ts` 已创建
- ✅ 导入路径已修正为 `../types/levelAssignment.types`

### 🔴 仍存在的问题

#### 问题1：`assignLayer()` 的 `battleCellIds` 需要从M04实际数据获取
当前测试可能使用硬编码的cellId列表，需确认与M04地图数据中的实际战斗格数量匹配。

#### 问题2：T8(ai-emerging) 只有14关的边界处理
`themeLevelMapping.ts` 中T8的关卡数量可能不足，需确认：
- 第8层需要多少个战斗格？（约10个）
- T8有14关，分配10个后剩余4个进备用池
- 是否正确处理？

#### 问题3：BOSS改造后的 `dataPacketPoolIds` 是否正确
需验证每层BOSS的奖励数据包池是否包含恰好9个该层数据包ID。

---

## 🎯 本轮任务

### 任务1：从M04提取每层实际战斗格数量

读取9层地图数据，统计每层的战斗格和BOSS格：
```typescript
// 伪代码
for (const layer of getAllLayers()) {
  const battleCells = layer.cells.filter(c => c.type === 'battle');
  const bossCells = layer.cells.filter(c => c.type === 'boss');
  console.log(`Layer ${layer.layerNumber}: ${battleCells.length} battle + ${bossCells.length} boss`);
}
```

### 任务2：验证 `assignAllLayers()` 与实际地图数据匹配

使用M04的真实数据调用 `assignAllLayers()`：
```typescript
const engine = new LevelAssignmentEngine(42);
engine.initializePools(levelDatabase);

const configs = getAllLayers().map(layer => ({
  layerNumber: layer.layerNumber,
  battleCellIds: layer.cells.filter(c => c.type === 'battle').map(c => c.id),
  bossCellId: layer.cells.find(c => c.type === 'boss')!.id,
}));

const result = engine.assignAllLayers(configs);
console.log('Validation:', result.validationPassed);
console.log('Total assigned:', result.totalAssigned);
console.log('Total spare:', result.totalSpare);
```

### 任务3：运行已有的压力测试

```bash
cd game-temp && npx vitest run src/tower-mode/engine/__tests__/LevelAssignmentEngine.stress.test.ts
cd game-temp && npx vitest run src/tower-mode/engine/__tests__/LevelAssignmentEngine.validation.test.ts
```

修复任何失败的测试用例。

### 任务4：输出分配验证报告

```
=== 关卡分配引擎验证报告 ===

种子: 42
总关卡: 142 | 已分配: 90 | 备用: 52

Layer 1 (virus):         8 battle + 1 boss → ✅
Layer 2 (network):      11 battle + 1 boss → ✅
Layer 3 (data-security): 7 battle + 1 boss → ✅
...
Layer 8 (ai-emerging):  10 battle + 1 boss → ✅ (14-10=4 spare)
Layer 9 (security-mgmt): 8 battle + 1 boss → ✅

BOSS改造验证:
  Layer 1: enhancement=1, HP×1.5, +0skill +1card → ✅
  Layer 5: enhancement=3, HP×2.5, +1skill +2card → ✅
  Layer 9: enhancement=5, HP×3.5, +2skill +3card → ✅

种子可复现性: ✅ (seed=42 两次结果一致)
```

---

## ✅ 完成标准

- [ ] 与M04真实数据对接成功
- [ ] 压力测试全部通过
- [ ] T8边界情况正确处理
- [ ] BOSS改造参数符合规格
- [ ] 种子可复现性验证通过
- [ ] 输出完整验证报告
