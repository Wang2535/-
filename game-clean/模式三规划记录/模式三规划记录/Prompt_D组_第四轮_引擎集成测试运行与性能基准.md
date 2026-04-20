# D组 第四轮操作，核心主题：引擎集成测试运行与性能基准

## 📊 当前开发状态

**完成度：97% ✅ 引擎功能完整，契约已定义**

### 第三轮已完成
- ✅ `engineContracts.ts` 引擎间调用契约已创建
- ✅ 类型导入已统一
- ✅ 140个单元测试全部通过

### 🔴 仍存在的问题

#### 问题1：跨引擎集成测试未实际运行
`engineIntegration.test.ts` 已创建，但需要：
- 确保测试能正确导入所有引擎
- 运行并验证3个集成场景

#### 问题2：性能基准未建立
需要记录：
- BFS寻路在最大地图(17格)上的耗时
- 区域效果计算在复杂叠加情况下的耗时
- 状态转换日志增长对内存的影响

---

## 🎯 本轮任务

### 任务1：运行跨引擎集成测试

```bash
cd game-temp && npx vitest run src/tower-mode/engine/__tests__/engineIntegration.test.ts
```

验证以下3个场景：

**场景1：移动→区域效果→状态变更**
```typescript
it('移动→区域效果→状态变更 完整链路', async () => {
  // 1. 创建引擎实例
  const zoneManager = new ZoneEffectManager(zones, ZONE_EFFECT_CONFIG);
  const cellStateMachine = new CellStateMachine(cells);
  const movementEngine = new MovementEngine(zoneManager);
  
  // 2. 加载地图
  movementEngine.loadLayerData(layerData);
  movementEngine.setStartPosition('R0C0');
  
  // 3. 投骰
  const diceResult = movementEngine.rollDice();
  expect(diceResult.modifiedValue).toBeGreaterThan(0);
  
  // 4. 获取可移动选项
  const options = movementEngine.getMoveOptions(diceResult.modifiedValue);
  expect(options.length).toBeGreaterThan(0);
  
  // 5. 移动到目标
  const moveResult = await movementEngine.executeMove(options[0].targetCell.id);
  expect(moveResult.success).toBe(true);
  
  // 6. 验证状态变更
  const newState = cellStateMachine.getState(options[0].targetCell.id);
  expect(['current', 'visited']).toContain(newState);
});
```

**场景2：W区效果减少骰子值**
```typescript
it('W区效果应减少骰子值', () => {
  // 设置玩家在W区
  // 投骰
  // 验证 modifiedValue < rawValue
});
```

**场景3：战斗完成→奖励发放→进度记录**
```typescript
it('战斗完成→奖励发放→进度记录 链路', async () => {
  // 模拟战斗胜利
  cellStateMachine.handleBattleComplete('R1C1', true);
  // 验证状态变为 completed
  // 验证奖励已发放
  // 验证进度已记录
});
```

### 任务2：建立性能基准

创建 `engine/__tests__/enginePerformance.test.ts`：

```typescript
describe('引擎性能基准', () => {
  it('BFS寻路在17格地图上的耗时 < 10ms', () => {
    const start = performance.now();
    // 在最大地图(17格)上运行BFS
    const end = performance.now();
    expect(end - start).toBeLessThan(10);
  });

  it('区域效果计算在6区叠加情况下 < 5ms', () => {
    const start = performance.now();
    // 计算6种区域同时触发的效果
    const end = performance.now();
    expect(end - start).toBeLessThan(5);
  });

  it('状态转换日志1000条后内存占用稳定', () => {
    // 执行1000次状态转换
    // 验证内存占用没有无限增长
  });
});
```

### 任务3：生成引擎健康报告

```
=== 引擎健康报告 ===

单元测试:
  CellStateMachine:  39/39 通过 ✅
  ZoneEffectManager: 50/50 通过 ✅
  MovementEngine:    51/51 通过 ✅
  总计: 140/140 通过 ✅

集成测试:
  移动→区域→状态: 通过 ✅
  W区效果: 通过 ✅
  战斗→奖励→进度: 通过 ✅

性能基准:
  BFS寻路(17格): X ms ✅ (<10ms)
  区域计算(6区): X ms ✅ (<5ms)
  日志内存: 稳定 ✅

契约验证:
  MovementEngine ↔ ZoneEffectManager: 已定义 ✅
  MovementEngine ↔ CellStateMachine: 已定义 ✅
  CellActionExecutor ↔ RewardSystem: 已定义 ✅
```

---

## ✅ 完成标准

- [ ] 跨引擎集成测试3个场景全部通过
- [ ] 性能基准测试建立并记录
- [ ] 所有测试(140单元+3集成+3性能)通过
- [ ] 输出引擎健康报告

---

> **文档版本**: v4.0 (第四轮)
> **本轮目标**: 引擎集成验证与性能确认
