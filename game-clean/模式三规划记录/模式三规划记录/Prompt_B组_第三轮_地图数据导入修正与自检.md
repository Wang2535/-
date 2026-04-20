# B组 第三轮操作，核心主题：地图数据导入路径修正与连通性自检脚本

## 📊 当前开发状态

**完成度：92% ✅ 数据基本完整，需修正导入路径**

### 已有成果
- ✅ 9层地图数据全部创建（layer1~layer9）
- ✅ `layerRegistry.ts` 注册表完成
- ✅ `themeLevelMapping.ts` 关卡映射完成
- ✅ `runFullValidation.ts` 验证脚本已创建
- ✅ 格子ID使用 `R{row}C{col}` 统一格式

### 🔴 仍存在的问题

#### 问题1：所有layer文件从 `../../types/cell.types` 直接导入（与A组关联）
```typescript
// ❌ layer3-data-vault.ts 第1-24行
import type { Coordinate2D, GridSize, ThemeCategory, CellType, ... } from '../../types/cell.types';

// ✅ 应改为
import type { Coordinate2D, GridSize, ThemeCategory, CellType, ... } from '../../types';
```
此问题将在A组第三轮中统一修复，B组需确认修复后数据层正常。

#### 问题2：`runFullValidation.ts` 是否真正可执行？
已创建验证脚本，但需确认：
- 是否能正确导入9层数据？
- BFS连通性检查逻辑是否完整？
- 输出报告格式是否清晰？

#### 问题3：layer6-layer9 数据质量未确认
前5层(layer1~layer5)在之前的审查中已确认，但layer6~layer9的数据完整性需要验证。

---

## 🎯 本轮任务

### 任务1：确认并运行 `runFullValidation.ts`

读取 `data/runFullValidation.ts`，检查其逻辑完整性：
1. 是否导入了全部9层 `LAYER_XX_DATA`？
2. BFS连通性检查是否正确实现？
3. 区域引用有效性检查是否包含？
4. 运行并输出验证报告

如果脚本不完整，补充以下检查逻辑：
```typescript
function validateLayerConnectivity(data: TowerLayerData): ValidationResult {
  const visited = new Set<string>();
  const queue = [data.startCellId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    
    const neighbors = data.adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  
  const unreachable = data.cells
    .map(c => c.id)
    .filter(id => !visited.has(id));
  
  const bossReachable = visited.has(data.bossCellId);
  
  return {
    layerNumber: data.layerNumber,
    totalCells: data.cells.length,
    reachableCount: visited.size,
    unreachableCells: unreachable,
    bossReachable,
    passed: unreachable.length === 0 && bossReachable,
  };
}
```

### 任务2：验证 layer6~layer9 数据完整性

对每层检查：
- `cells` 数组非空且包含必需类型（start/battle/boss）
- `paths` 和 `adjacencyList` 一致
- `zones` 中的 `cellIds` 全部指向存在的格子
- `startCellId` 和 `bossCellId` 存在于 `cells` 中

### 任务3：修正导入路径（配合A组）

将所有 `layer*.ts` 文件的导入从 `../../types/cell.types` 改为 `../../types`。

### 任务4：输出9层数据质量总报告

格式：
```
=== 爬塔模式 9层地图数据质量报告 ===

Layer 1 (virus-lab):     13格 | 连通 ✅ | BOSS可达 ✅ | 区域 4/6
Layer 2 (cyberspace):    17格 | 连通 ✅ | BOSS可达 ✅ | 区域 5/6
Layer 3 (data-vault):    13格 | 连通 ✅ | BOSS可达 ✅ | 区域 4/6
Layer 4 (grid-city):     11格 | 连通 ✅ | BOSS可达 ✅ | 区域 4/6
Layer 5 (smart-factory): 16格 | 连通 ✅ | BOSS可达 ✅ | 区域 5/6
Layer 6 (mobile-terminal): ??格 | 连通 ? | BOSS可达 ? | 区域 ?
Layer 7 (cloud-platform): ??格 | 连通 ? | BOSS可达 ? | 区域 ?
Layer 8 (future-lab):    ??格 | 连通 ? | BOSS可达 ? | 区域 ?
Layer 9 (command-center): ??格 | 连通 ? | BOSS可达 ? | 区域 ?

总格子数: ??? (目标 ~126)
总战斗格: ??? (目标 81)
总BOSS格: 9
```

---

## ✅ 完成标准

- [ ] `runFullValidation.ts` 可正确执行
- [ ] 9层地图连通性全部通过
- [ ] 所有区域 cellIds 有效
- [ ] 导入路径统一为 `../../types`
- [ ] 输出完整的数据质量报告
