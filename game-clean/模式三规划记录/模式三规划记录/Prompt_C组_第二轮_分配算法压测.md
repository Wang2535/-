# C组 第二轮操作：核心主题——关卡分配算法压力测试与BOSS改造完整性验证

## 📊 当前状态评估

**完成度：90% ✅ 基本完成**

| 子模块 | 文件 | 状态 |
|--------|------|------|
| M05 关卡分配引擎 | LevelAssignmentEngine.ts | ✅ 骨架完成 |
| 配套数据 | themeLevelMapping.ts | ✅ 完成 |

### 已有成果
- `LevelAssignmentEngine` 类完整实现
- ENHANCEMENT_TABLE (5级强化表) 已配置
- BOSS_SKILL_POOL / BOSS_CARD_POOL / DATA_PACKET_POOL (各9组) 已配置
- `assignLayer()` / `assignAllLayers()` / `enhanceBossLevel()` 方法已实现

---

## 🔍 本轮发现的问题

### 问题1：分配算法边界条件未充分测试
- 142关分配到90个战斗格时，是否有足够的关卡？
- 备用池(52关)的计算是否正确？
- 当某主题关卡不足9个时（如T8只有14关），如何处理？

### 问题2：BOSS改造与数据包的关联性
- BOSS的 `dataPacketPoolIds` 是否正确指向该层的9个数据包？
- BOSS战后三选一的数据包是否从正确的池中抽取？

### 问题3：种子可复现性未验证
- 相同种子是否总是产生相同的结果？
- 不同种子是否产生不同结果？

### 问题4：与M04地图数据的对接验证
- `assignLayer()` 的 `battleCellIds` 参数是否与M04中实际战斗格数量匹配？
- 每层实际需要多少个战斗格？(8-11不等)

---

## 🎯 本轮任务清单

### 任务1：编写并运行分配算法压力测试

```typescript
describe('LevelAssignmentEngine - 压力测试', () => {
  it('应正确处理完整9层分配（90个战斗格 + 9个BOSS格）', async () => {
    const engine = new LevelAssignmentEngine(12345);
    engine.initializePools(levelDatabase);
    
    const configs = generateLayerConfigsFromMapData(); // 从M04获取
    const result = engine.assignAllLayers(configs);
    
    expect(result.validationPassed).toBe(true);
    expect(result.totalAssigned).toBe(90);
    expect(result.totalSpare).toBe(52); // 142 - 90
  });

  it('连续100次不同种子的分配均应成功', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const engine = new LevelAssignmentEngine(seed);
      // ... 验证每次都成功且无重复
    }
  });

  it('相同种子应产生完全相同的结果', () => {
    const r1 = runWithSeed(42);
    const r2 = runWithSeed(42);
    expect(deepEqual(r1, r2)).toBe(true);
  });
});
```

### 任务2：验证每层的战斗格数量匹配

从M04的9层数据中提取每层的实际战斗格数量：
```
Layer 1: N个 battle cells → assignLayer 需要 N 个 levelId
Layer 2: M个 battle cells → ...
...
```
确认 `LevelAssignmentEngine.assignLayer()` 能正确处理不同的数量需求。

### 任务3：验证BOSS改造完整性

对每个层级检查：
1. `getEnhancementLevel(layer)` 返回值在 1-5 范围内
2. BOSS的 HP倍率符合预期（1.5x ~ 3.5x）
3. 新增技能/卡牌数量符合 enhancementTable
4. 数据包池包含恰好9个该层数据包ID
5. BOSS改造后的 ID 格式为 `{baseId}_BOSS`

### 任务4：验证备用池计算

```typescript
// 期望: 142总关 - 90已分配 = 52备用
// 按主题分布:
//   T1: 15关 - 分配数 = 剩余
//   T2: 15关 - 分配数 = 剩余
//   ...
//   T8: 14关 - 分配数 = 剩余 (注意T8只有14关!)
//   T9: 15关 - 分配数 = 剩余
```
特别关注 **T8(ai-emerging) 只有14关** 的边界情况。

### 任务5：生成分配质量报告

输出报告包含：
- 100次随机分配的成功率统计
- 每层平均分配时间（性能基准）
- 备用池大小分布
- 种子可复现性验证结果
- 发现的任何边界条件问题

---

## 📁 工作范围

**只读参考**：
- [09_配套数据结构设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/09_配套数据结构设计.md)
- [M05-M08_核心引擎规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M05-M08_核心引擎规格.md) （第5-10节）

**需读取的代码文件**：
```
engine/LevelAssignmentEngine.ts
data/themeLevelMapping.ts
data/layers/layer*.ts (读取每层的battleCellIds数量)
utils/random.ts
utils/probability.ts
```

**可能需要新建**：
- `engine/__tests__/LevelAssignmentEngine.stress.test.ts` — 压力测试文件

---

## ✅ 完成标准

- [ ] 100次随机分配全部成功，成功率100%
- [ ] 相同种子结果完全一致（可复现性验证通过）
- [ ] 9层BOSS改造参数全部符合规格
- [ ] 备用池总数=52，按主题分布合理
- [ ] T8(14关)边界情况处理正确
- [ ] 输出完整的分配质量报告

---

> **文档版本**: v2.0 (第二轮)
> **依赖**: A组(类型修复) + B组(地图数据验证) 完成后执行
