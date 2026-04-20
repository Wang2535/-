# C组第七轮 — EnrichedTopology视觉数据组装适配

## 背景

第六轮C组的 `EnrichedTopology` 扩展了B组裸拓扑，添加了关卡分配和Boss配置。第七轮中，A组新增了 `RenderableGourdMapTopology`（含视觉字段），B组产出了新的视觉数据文件。C组需要：

1. 适配新的 `RenderableGourdMapTopology` 类型
2. 将B组的视觉数据与已有的关卡分配数据**组装**在一起
3. 确保输出给D/E/F组的拓扑包含完整的视觉+游戏数据

## 任务目标

作为数据组装层，将B组第七轮的视觉数据无缝整合到EnrichedTopology中。

> **边界说明**：
> - C组不创建任何视觉数据，只做**组装**
> - 消费A组的 RenderableGourdMapTopology 类型定义
> - 消费B组的 LAYER_GOURD_SHAPES + L1~L9_VISUAL_DATA
> - 输出完整的 RenderableGourdMapTopology 给 D/E/F 组

## 具体任务

### Task C1: 更新 MapLevelIntegrator 以支持 RenderableGourdMapTopology

修改 `src/tower-mode/utils/mapLevelIntegration.ts`：

```typescript
/**
 * 第七版更新：整合视觉数据到 EnrichedTopology
 */
export class MapLevelIntegratorV2 {
  
  /**
   * 完整组装流程:
   * 1. 取 B组裸拓扑 (TowerLayerData/GourdMapTopology)
   * 2. 取 C组关卡分配结果 (AssignmentResult)
   * 3. 取 Boss生成结果 (GeneratedBoss)
   * 4. 取 B组视觉数据 (L{N}_VISUAL_DATA)
   * 5. 取 A组形状参数 (LAYER_GOURD_SHAPES[layer])
   * 6. 使用 GourdCoordinateCalculator 计算 SVG 路径
   * 7. 输出 RenderableGourdMapTopology
   */
  assembleFullTopology(
    baseTopology: GourdMapTopology,
    assignment: AssignmentResult,
    bossConfig: GeneratedBoss,
    visualData: LayerVisualData,        // 第七轮新增
    shapeParams: GourdShapeParams       // 第七轮新增
  ): RenderableGourdMapTopology
}
```

### Task C2: 数据兼容性适配

确保第六轮的关卡分配逻辑在新的类型体系下正常工作：

- `assignedLevels: Map<string, LevelPoolEntry>` — 不变
- `bossConfig` — 不变，但需确认 bossCellId 的坐标已转换为 GourdCoordinate
- 新增字段全部从 B 组 visualData 直接复制

## 验收标准

1. ✅ assembleFullTopology 返回 RenderableGourdMapTopology
2. ✅ 输出的 topology 包含 gourdShape / gourdCoordinates / svgPaths / border / quadrantLabels 等所有新字段
3. ✅ 关卡分配和Boss配置数据完整保留
4. ✅ 与第六轮的单元测试兼容（可回退到旧版本）
