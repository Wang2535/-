# C组第八轮 — 视觉数据组装验证与完整性保障

## 背景

第七轮C组实现了 `MapLevelIntegratorV2.assembleFullTopology()`，将B组视觉数据与关卡分配/Boss配置组装为 `RenderableGourdMapTopology`。但第八轮中B组对visualData做了关键修正：

1. **W/N/I/P** — fontSizeRatio 从 0.18 → 0.22，新增 strokeColor/shadow 等字段
2. **边框** — 新增 `mode: 'checkerboard-fill'` 字段，E组据此切换渲染模式
3. **Boss格** — sizeMultiplier 必须确认 = 2.5，新增 animationClass 字段
4. **图标引用** — 从 Emoji 改为 A 组 GRID_ICONS 的 SVG path

C组第八轮的核心职责：**确保这些修正后的数据完整、无误地传递到 E 组渲染器手中。**

## 任务目标

作为数据组装层的"守门员"，验证并确保从 B 组流入的视觉数据在组装过程中不丢失、不被截断、类型正确。

> **边界说明**：
> - C组 **不创建**任何视觉数据（那是B组的事）
> - C组 **不渲染**任何内容（那是E组的事）
> - C组的唯一工作：**校验 → 组装 → 输出**
> - 消费 A 组的 RenderableGourdMapTopology 类型定义
> - 消费 B 组的 LAYER_GOURD_SHAPES + L1~L9_VISUAL_DATA（第八轮修正版）
> - 消费 C 组自身的 AssignmentResult + GeneratedBoss
> - 输出完整的 RenderableGourdMapTopology 给 D/E/F 组

## 具体任务

### Task C1: assembleFullTopology 增加数据完整性校验

修改 `src/tower-mode/utils/mapLevelIntegratorV2.ts`：

```typescript
/**
 * 第八轮更新：增加视觉数据完整性校验
 */
export class MapLevelIntegratorV2 {

  /**
   * 组装完整拓扑（含校验）
   */
  assembleFullTopology(
    baseTopology: GourdMapTopology,
    assignment: AssignmentResult,
    bossConfig: GeneratedBoss,
    visualData: LayerVisualData,
    shapeParams: GourdShapeParams
  ): RenderableGourdMapTopology {
    
    // === 第八轮新增：组装前校验 ===
    this.validateVisualData(visualData);
    this.validateBossConfig(bossConfig, visualData);
    
    // === 原有组装逻辑保持不变 ===
    const coordinates = this.calculateCoordinates(shapeParams, baseTopology.cells);
    const svgPaths = this.generateSvgPaths(coordinates, shapeParams, baseTopology.paths);
    
    return {
      // 第六轮字段（保留）
      ...baseTopology,
      assignedLevels: assignment.assignedLevels,
      bossConfig: this.enrichBossConfig(bossConfig, coordinates),
      
      // 第七轮+第八轮视觉字段
      gourdShape: shapeParams,
      gourdCoordinates: coordinates,
      svgPaths,
      visualConfig: {
        quadrantLabels: visualData.quadrantLabels,       // 第八轮修正版
        border: visualData.border,                        // 含 mode:'checkerboard-fill'
        cellVisualStyles: visualData.cellVisualStyles,    // Boss=2.5x
        pathVisualStyles: visualData.pathVisualStyles,
        background: visualData.background,
        decorations: visualData.decorations ?? [],
      },
    };
  }

  /**
   * 校验 B 组传入的视觉数据完整性
   * 
   * 关键检查项（对应第八轮B组修正）：
   * 1. quadrantLabels 必须4个全齐，fontSizeRatio ≥ 0.20
   * 2. border.mode 必须存在且值为 'checkerboard-fill' 或 'radial-lines'
   * 3. cellVisualStyles 中必须包含 'boss' 条目且 sizeMultiplier ≈ 2.5
   * 4. 所有格子类型的 icon.type 应为 'svg'
   */
  private validateVisualData(visualData: LayerVisualData): void {
    const errors: string[] = [];

    // 检查 W/N/I/P 标识
    if (!visualData.quadrantLabels || visualData.quadrantLabels.length !== 4) {
      errors.push('quadrantLabels 必须包含恰好4个象限标识');
    } else {
      for (const label of visualData.quadrantLabels) {
        if ((label.fontSizeRatio ?? 0) < 0.20) {
          errors.push(`${label.quadrant}象限 fontSizeRatio=${label.fontSizeRatio}，要求 ≥ 0.20`);
        }
        if (!label.strokeColor) {
          warnings.push(`${label.quadrant}象限缺少 strokeColor（建议添加白色描边）`);
        }
      }
    }

    // 检查边框模式
    if (!visualData.border?.mode) {
      errors.push('border 缺少 mode 字段（应为 checkerboard-fill 或 radial-lines）');
    } else if (!['checkerboard-fill', 'radial-lines'].includes(visualData.border.mode)) {
      errors.push(`border.mode="${visualData.border.mode}" 不合法`);
    }

    // 检查 Boss 配置
    const bossStyle = visualData.cellVisualStyles?.get('boss');
    if (!bossStyle) {
      errors.push('cellVisualStyles 中缺少 boss 条目');
    } else if (Math.abs((bossStyle.sizeMultiplier ?? 1) - 2.5) > 0.1) {
      errors.push(`boss sizeMultiplier=${bossStyle.sizeMultiplier}，要求 ≈ 2.5`);
    }
    if (bossStyle && !bossStyle.animationClass) {
      warnings.push('boss 缺少 animationClass（建议 "boss-emerge"）');
    }

    // 检查图标引用
    for (const [type, style] of (visualData.cellVisualStyles ?? new Map())) {
      if (style.icon?.type !== 'svg') {
        warnings.push(`格子类型 "${type}" 的 icon.type 不是 "svg"，将回退到Emoji`);
      }
    }

    // 报告结果
    if (errors.length > 0) {
      console.error('[C组] 视觉数据校验失败:', errors);
      throw new Error(`视觉数据不完整: ${errors.join('; ')}`);
    }
    if (warnings.length > 0) {
      console.warn('[C组] 视觉数据警告:', warnings);
    }
  }

  /**
   * 校验 Boss 配置与视觉数据的一致性
   */
  private validateBossConfig(bossConfig: GeneratedBoss, visualData: LayerVisualData): void {
    if (!bossConfig.bossCellId) return;
    
    // 确保 bossCellId 对应的格子坐标存在
    const bossCoord = this.findCoordinateById(bossConfig.bossCellId);
    if (!bossCoord) {
      throw new Error(`Boss格 ${bossConfig.bossCellId} 未在坐标列表中找到`);
    }
  }
}
```

### Task C2: 增加 fallback 兜底逻辑

当 B 组某层的数据缺失或不完整时，C 组应提供合理的默认值而非直接报错：

```typescript
/**
 * 安全获取象限标识（带默认值兜底）
 */
private resolveQuadrantLabels(input: QuadrantLabel[] | undefined): QuadrantLabel[] {
  if (input && input.length === 4) return input;
  
  console.warn('[C组] quadrantLabels 不完整，使用默认值');
  return [
    { quadrant: 'W', label: 'W', fontSizeRatio: 0.22, color: '#FF8800', fontWeight: '900',
      strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3 },
    { quadrant: 'N', label: 'N', fontSizeRatio: 0.22, color: '#FFCC00', fontWeight: '900',
      strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3 },
    { quadrant: 'I', label: 'I', fontSizeRatio: 0.22, color: '#FFCC00', fontWeight: '900',
      strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3 },
    { quadrant: 'P', label: 'P', fontSizeRatio: 0.22, color: '#FF8800', fontWeight: '900',
      strokeColor: '#FFFFFF', strokeWidth: 0.8, shadowColor: '#000000', shadowBlur: 3 },
  ];
}

/**
 * 安全获取边框配置（带默认值兜底）
 */
private resolveBorderConfig(input: CheckerboardBorder | undefined): CheckerboardBorder {
  if (input?.mode) return input;
  
  console.warn('[C组] border 缺少 mode，使用默认 checkerboard-fill');
  return {
    enabled: true,
    mode: 'checkerboard-fill',
    borderWidth: 10,
    colors: ['#FFAA00', '#FFFFFF'],
    tileSize: 12,
    innerPadding: 2,
    cornerRadius: 3,
    opacity: 0.85,
    glowColor: 'rgba(255,170,0,0.5)',
  };
}

/**
 * 安全获取格子样式映射（合并默认值）
 */
private resolveCellStyles(
  input: Map<string, CellVisualStyle> | undefined
): Map<string, CellVisualStyle> {
  const merged = new Map(DEFAULT_CELL_VISUAL_STYLES); // A组默认值
  if (input) {
    for (const [key, val] of input) {
      merged.set(key, { ...merged.get(key), ...val }); // B组覆盖A组默认值
    }
  }
  return merged;
}
```

### Task C3: 9层数据批量组装与缓存

```typescript
/**
 * 预组装全部9层拓扑（启动时一次性完成）
 * 
 * 返回 Map<layerId, RenderableGourdMapTopology>
 * 供 TowerModeApp 在层级切换时直接使用
 */
export function preassembleAllLayers(): Map<number, RenderableGourdMapTopology> {
  const result = new Map<number, RenderableGourdMapTopology>();
  const integrator = new MapLevelIntegratorV2();
  
  for (let layer = 1; layer <= 9; layer++) {
    const baseTopology = getBaseTopology(layer);     // B组裸拓扑
    const assignment = generateAssignment(layer);     // C组自身
    const bossConfig = generateBoss(layer);           // C组自身
    const visualData = getLayerVisualData(layer);     // B组第八轮修正版
    const shapeParams = LAYER_GOURD_SHAPES[layer];   // A组
    
    try {
      const topology = integrator.assembleFullTopology(
        baseTopology, assignment, bossConfig, visualData, shapeParams
      );
      result.set(layer, topology);
      console.log(`[C组] 第${layer}层拓扑组装成功 ✅`);
    } catch (err) {
      console.error(`[C组] 第${layer}层拓扑组装失败 ❌`, err);
      // 不中断其他层，记录错误继续
    }
  }
  
  console.log(`[C组] 全部9层组装完成: ${result.size}/9 成功`);
  return result;
}
```

### Task C4: 单元测试 — 数据完整性断言

创建/更新 `src/tower-mode/__tests__/integration/topologyAssembly.test.ts`：

```typescript
describe('C组第八轮 — 视觉数据组装完整性测试', () => {

  test('L1拓扑的 quadrantLabels 包含4个且 fontSizeRatio ≥ 0.20', () => {
    const topology = assembleL1Topology();
    expect(topology.visualConfig.quadrantLabels).toHaveLength(4);
    for (const label of topology.visualConfig.quadrantLabels) {
      expect(label.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
    }
  });

  test('L1拓扑的 border.mode 为 checkerboard-fill', () => {
    const topology = assembleL1Topology();
    expect(topology.visualConfig.border.mode).toBe('checkerboard-fill');
  });

  test('L1-L9 全部9层的 Boss sizeMultiplier = 2.5', () => {
    for (let layer = 1; layer <= 9; layer++) {
      const topology = assembleTopology(layer);
      const bossStyle = topology.visualConfig.cellVisualStyles.get('boss');
      expect(bossStyle?.sizeMultiplier).toBeCloseTo(2.5, 1);
    }
  });

  test('缺少 quadrantLabels 时使用默认值兜底', () => {
    const incompleteData = { ...validVisualData, quadrantLabels: [] };
    const result = resolver.resolveQuadrantLabels(incompleteData.quadrantLabels);
    expect(result).toHaveLength(4);
    expect(result[0].fontSizeRatio).toBe(0.22);
  });

  test('缺少 border.mode 时默认为 checkerboard-fill', () => {
    const noModeBorder = { enabled: true, borderWidth: 8 };
    const result = resolver.resolveBorderConfig(noModeBorder);
    expect(result.mode).toBe('checkerboard-fill');
  });

  test('cellVisualStyles 合并时 B组覆盖 A组默认值', () => {
    const bGroupOverride = new Map([['boss', { sizeMultiplier: 3.0 }]]);
    const merged = resolver.resolveCellStyles(bGroupOverride);
    expect(merged.get('boss').sizeMultiplier).toBe(3.0);
    // 其他类型仍用默认值
    expect(merged.get('battle').sizeMultiplier).toBe(1.0);
  });

  test('preassembleAllLayers 返回9个有效条目', () => {
    const allLayers = preassembleAllLayers();
    expect(allLayers.size).toBe(9);
    for (let i = 1; i <= 9; i++) {
      expect(allLayers.has(i)).toBe(true);
    }
  });

  test('无效数据抛出明确错误信息', () => {
    const badData: LayerVisualData = {
      quadrantLabels: [{ quadrant: 'W', label: 'W', fontSizeRatio: 0.1 }],
      border: { enabled: true, mode: 'invalid-mode' },
      cellVisualStyles: new Map(),
    };
    expect(() => integrator.validateVisualData(badData)).toThrow();
  });
});
```

## 数据流图（第八轮）

```
┌─────────────────────────────────────────────────────┐
│                    A组（类型定义）                     │
│  RenderableGourdMapTopology                         │
│  DEFAULT_CELL_VISUAL_STYLES（默认值兜底）             │
│  GourdShapeParams / GourdCoordinate                 │
└──────────────┬──────────────────────────────────────┘
               │ 类型消费
               ▼
┌─────────────────────────────────────────────────────┐
│                    B组（数据源）                      │
│  L1~L9_VISUAL_DATA（第八轮修正版）                    │
│  ├─ quadrantLabels: fontSizeRatio≥0.22 + 描边/阴影   │
│  ├─ border: mode='checkerboard-fill'                │
│  ├─ cellVisualStyles: boss.sizeMultiplier=2.5       │
│  └─ icons: 引用 A组 GRID_ICONS                      │
└──────────────┬──────────────────────────────────────┘
               │ 数据输入
               ▼
┌─────────────────────────────────────────────────────┐
│              C组（组装 + 校验） ← 你在这里            │
│  MapLevelIntegratorV2                               │
│  ├─ validateVisualData()  ─── 完整性校验              │
│  ├─ resolveQuadrantLabels() ─ 默认值兜底              │
│  ├─ resolveBorderConfig()  ── 默认值兜底              │
│  ├─ resolveCellStyles() ──── A+B合并                │
│  └─ preassembleAllLayers() ─ 9层批量组装+缓存         │
└──────────────┬──────────────────────────────────────┘
               │ 输出：RenderableGourdMapTopology
               ▼
┌─────────────────────────────────────────────────────┐
│              D/E/F组（消费者）                        │
│  D组: CurvedPathEngine / PlayerPieceManager          │
│  E组: GourdMapRenderer（读取 visualConfig 渲染）       │
│  F组: 集成测试 / 手动验证                             │
└─────────────────────────────────────────────────────┘
```

## 与其他组的接口约定

| 接口 | 方向 | 来源 | 说明 |
|------|------|------|------|
| `RenderableGourdMapTopology` 类型 | 消费 | A组 | 输出的类型定义 |
| `DEFAULT_CELL_VISUAL_STYLES` | 消费 | A组 | fallback 默认值 |
| `LayerVisualData` (L1~L9) | 消费 | B组 | 第八轮修正后的原始数据 |
| `LAYER_GOURD_SHAPES` | 消费 | A组 | 形状参数 |
| `RenderableGourdMapTopology` | 输出 | → D/E/F | 完整可渲染拓扑 |

## 验收标准

1. ✅ `assembleFullTopology` 在 B 组数据缺失关键字段时抛出明确错误
2. ✅ `resolveQuadrantLabels` 在输入不足4个时返回完整的默认4象限配置
3. ✅ `resolveBorderConfig` 在无 mode 时默认返回 `'checkerboard-fill'`
4. ✅ `resolveCellStyles` 正确合并 A 组默认值和 B 组覆盖值
5. ✅ `preassembleAllLayers` 成功产出 9 层完整拓扑（容错模式下不因单层失败而中断）
6. ✅ 单元测试覆盖：校验通过/失败/fallback/合并 四种场景
7. ✅ Boss sizeMultiplier 在所有 9 层输出中确认 = 2.5
8. ✅ border.mode 在所有 9 层输出中确认 = `'checkerboard-fill'`
