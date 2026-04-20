# C组 第四轮操作，核心主题：关卡分配最终对接与全流程测试

## 📊 当前开发状态

**完成度：95% ✅ 分配引擎完整，需与M04最终对接**

### 第三轮已完成
- ✅ `LevelAssignmentEngine.ts` 完整实现
- ✅ 压力测试文件已创建
- ✅ 与M04数据对接逻辑已准备
- ✅ 导入路径已统一

### 🔴 仍存在的问题

#### 问题1：需要与B组最终确认的战斗格数量对接
B组第四轮将输出每层的实际战斗格数量，C组需要据此运行最终分配测试。

#### 问题2：全流程测试未运行
需要验证：
- `assignAllLayers()` 使用真实地图数据
- 分配结果与地图数据匹配
- BOSS改造参数正确

---

## 🎯 本轮任务

### 任务1：从B组获取每层战斗格数量

等待B组第四轮完成后，获取数据：

```typescript
const layerBattleCellCounts = {
  1: 8,   // 来自B组报告
  2: 11,
  3: 7,
  4: 6,
  5: 10,
  6: ?,   // 待B组确认
  7: ?,
  8: ?,
  9: ?,
};
```

### 任务2：运行最终分配测试

使用真实地图数据运行分配：

```typescript
import { LevelAssignmentEngine } from '../engine/LevelAssignmentEngine';
import { getAllLayers } from '../data';

const engine = new LevelAssignmentEngine(42);
engine.initializePools(levelDatabase);

const layers = getAllLayers();
const configs = layers.map(layer => ({
  layerNumber: layer.layerNumber,
  battleCellIds: layer.cells
    .filter(c => c.type === 'battle')
    .map(c => c.id),
  bossCellId: layer.cells
    .find(c => c.type === 'boss')!.id,
}));

const result = engine.assignAllLayers(configs);

console.log('=== 最终分配结果 ===');
console.log('种子:', result.seed);
console.log('总分配:', result.totalAssigned, '/ 90');
console.log('备用池:', result.totalSpare, '/ 52');
console.log('验证通过:', result.validationPassed);

// 验证每层
for (let i = 1; i <= 9; i++) {
  const layer = result.layers[i];
  const battleCount = Object.keys(layer.battleCellAssignments).length;
  console.log(`Layer ${i}: ${battleCount} 战斗格 + 1 BOSS格`);
}
```

### 任务3：验证BOSS改造参数

检查每层BOSS的改造参数：

```typescript
for (let i = 1; i <= 9; i++) {
  const boss = result.layers[i].bossAssignment;
  console.log(`Layer ${i} BOSS:`);
  console.log(`  基础关卡: ${boss.baseLevelId}`);
  console.log(`  改造后ID: ${boss.enhancedLevelId}`);
  console.log(`  强化等级: ${boss.enhancementLevel}`);
  console.log(`  HP倍率: ${1 + boss.enhancementLevel * 0.5}x`);
}
```

### 任务4：运行压力测试

```bash
cd game-temp && npx vitest run src/tower-mode/engine/__tests__/LevelAssignmentEngine.stress.test.ts
```

确保：
- 100次随机分配全部成功
- 相同种子结果一致
- 无重复关卡分配

### 任务5：生成最终分配报告

```
=== 关卡分配引擎最终报告 ===

配置:
  种子: 42
  总关卡池: 142
  目标分配: 90 (81战斗 + 9BOSS)
  备用池: 52

分配结果:
  Layer 1 (virus):      8 battle + 1 boss → LV001-LV008 → ✅
  Layer 2 (network):   11 battle + 1 boss → LV017-LV027 → ✅
  Layer 3 (data):       7 battle + 1 boss → LV033-LV039 → ✅
  Layer 4 (grid):       6 battle + 1 boss → ...
  Layer 5 (factory):   10 battle + 1 boss → ...
  Layer 6 (mobile):     ? battle + 1 boss → ...
  Layer 7 (cloud):      ? battle + 1 boss → ...
  Layer 8 (ai):         ? battle + 1 boss → ... (注意T8只有14关)
  Layer 9 (mgmt):       ? battle + 1 boss → ...

BOSS改造:
  Layer 1: enhancement=1, HP×1.5
  Layer 5: enhancement=3, HP×2.5
  Layer 9: enhancement=5, HP×3.5

验证:
  重复检测: 通过 ✅
  主题匹配: 通过 ✅
  种子可复现: 通过 ✅
  压力测试: 100/100 通过 ✅
```

---

## ✅ 完成标准

- [ ] 与B组数据成功对接
- [ ] 使用真实地图数据运行分配成功
- [ ] 9层分配结果验证通过
- [ ] BOSS改造参数符合规格
- [ ] 压力测试100%通过
- [ ] 输出最终分配报告

---

> **文档版本**: v4.0 (第四轮)
> **本轮目标**: 关卡分配与地图数据最终对接
> **依赖**: B组第四轮完成
