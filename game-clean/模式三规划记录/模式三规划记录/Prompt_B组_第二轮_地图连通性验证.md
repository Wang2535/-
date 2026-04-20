# B组 第二轮操作：核心主题——地图数据连通性验证与9层完整性审查

## 📊 当前状态评估

**完成度：90% ✅ 基本完成**

| 子模块 | 文件数 | 状态 |
|--------|--------|------|
| M04 地图数据 | 12个文件 | ✅ 骨架完成 |

### 已有成果
- `data/layers/` 下9层地图全部创建 (layer1~layer9)
- `data/layerRegistry.ts` 注册表已创建
- `data/themeLevelMapping.ts` 主题-关卡映射已创建
- `data/index.ts` 统一导出已创建

---

## 🔍 本轮发现的问题

### 问题1：layer1 存在类型重复定义（与A组问题关联）
**文件**: `data/layers/layer1-virus-lab.ts`
```typescript
// 第1行开始就本地定义了 ZoneType, EffectTarget, ZoneEffectConfig 等类型
// 这些应该从 types/ 导入
```
**注意**：此问题将由A组第二轮修复，但B组需确认修复后数据层仍正常工作。

### 问题2：9层地图连通性未验证
每层地图的 `adjacencyList` 和 `paths` 是否保证：
- 从 `startCellId` 可以到达所有格子？
- 不存在孤立格子（无法到达的格子）？
- BOSS格是否在可达路径上？

### 问题3：区域覆盖完整性未知
- 每层是否都包含 W/N/I/P/S/D 区域中的至少部分？
- 区域的 cellIds 是否指向实际存在的格子？
- 区域之间是否有不合理的重叠或遗漏？

### 问题4：格子ID命名规范一致性
需确认所有9层使用统一的 `R{row}C{col}` 格式。

---

## 🎯 本轮任务清单

### 任务1：运行地图连通性验证

对9层逐一执行 BFS/DFS 连通性检查：

```typescript
// 验证函数（需要在 utils/validation.ts 中实现或直接运行）
function validateLayerConnectivity(data: TowerLayerData): {
  reachable: string[];
  unreachable: string[];
  startToBossPathExists: boolean;
  totalCells: number;
} {
  // 1. 从 startCellId 开始 BFS
  // 2. 收集所有可达格子的 ID
  // 3. 对比 cells 数量，找出不可达的格子
  // 4. 检查 bossCellId 是否可达
}
```

**输出要求**：为每层生成报告：
```
Layer 1 (virus-lab):
  总格子: 13 | 可达: 13 | 不可达: 0 ✅
  起点到BOSS路径: 存在 ✅
  
Layer 2 (cyberspace):
  总格子: 17 | 可达: 17 | 不可达: 0 ✅
  ...
```

### 任务2：验证区域数据完整性

对每层检查：
1. 每个 zone 的 `cellIds` 中的每个ID都在 `cellIndex` 中存在
2. 区域覆盖范围合理（W区靠近战斗格，N区靠近书店格等）
3. I区（反转）不超过全局上限配置
4. 区域视觉配置（颜色、图标）无冲突

### 任务3：统一格子ID格式检查

扫描所有9层，确认：
- 所有 cell.id 符合 `R{数字}C{数字}` 格式
- 无重复ID
- coordinate 字段与 ID 中的行列号一致

### 任务4：验证 layerRegistry 完整性

检查 `layerRegistry.ts`:
- 包含 LAYER_01 到 LAYER_09 全部9个条目
- `getLayerData(1~9)` 均返回非null
- `getAllLayers()` 返回长度为9的数组

### 任务5：验证 themeLevelMapping 数据

检查 `themeLevelMapping.ts`:
- THEME_LEVELS 包含9个主题，每个主题有15-16个关卡ID
- BOSS_LEVELS 包含9个BOSS关卡
- 总关卡数 = 142（135普通 + 7额外 + 补充）
- 所有 levelId 格式一致（LVxxx）

### 任务6：输出完整的数据质量报告

生成一份综合报告，包含：
- 连通性矩阵（9层 × 通过/失败）
- 区域分布统计表
- 格子总数统计（目标约 81+9=90 个战斗/功能格）
- 发现的所有问题及修复建议

---

## 📁 工作范围

**只读参考**：
- [01_地图造型设计规范.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/01_地图造型设计规范.md)
- [02_功能格子系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/02_功能格子系统设计.md)
- [03_特殊区域系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/03_特殊区域系统设计.md)

**需读取的代码文件**：
```
data/layers/layer1-virus-lab.ts ~ layer9-command-center.ts
data/layerRegistry.ts
data/themeLevelMapping.ts
data/index.ts
utils/validation.ts (可能需要增强)
```

**可修改的文件**（仅限修复数据错误）：
- 如发现 `cellIds` 指向不存在的格子 → 修正 zone 定义
- 如发现 `adjacencyList` 缺少连接 → 补充缺失的路径
- **不允许修改地图造型和功能格数量**

---

## ✅ 完成标准

- [ ] 9层地图连通性100%通过（从起点可达所有格子）
- [ ] 所有BOSS格均在可达路径上
- [ ] 所有区域的 cellIds 有效且无悬空引用
- [ ] 格子ID命名规范统一且无重复
- [ ] layerRegistry 和 themeLevelMapping 数据完整准确
- [ ] 输出完整的数据质量报告

---

> **文档版本**: v2.0 (第二轮)
> **依赖**: A组第二轮完成后执行（需先修复类型导入问题）
