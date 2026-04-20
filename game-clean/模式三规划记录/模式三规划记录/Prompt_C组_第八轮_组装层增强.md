# C组第八轮 — 组装层增强：V2字段透传与容错保障

## 背景

A组新增了V2扩展类型（CheckerboardBorderV2/QuadrantLabelV2等），B组的visualData已全面改用新字段格式。C组的 `MapLevelIntegratorV2.assembleFullTopology()` 必须确保这些**新字段在组装过程中完整传递到输出拓扑中，不丢失、不截断、不降级为旧格式**。

## 当前问题

1. **assembleFullTopology 可能只复制了旧字段** —— 新增的 mode/fontFamily/strokeColor/animationClass 等字段可能被静默丢弃
2. **无 fallback 机制** —— 如果B组某层漏填了某个新字段，C组直接报错导致整层无法组装
3. **无批量预组装** —— 每次切换层级都要重新调用 assembleFullTopology，没有缓存

## 任务目标

增强 MapLevelIntegratorV2 为**生产级数据组装引擎**。

> **边界说明**：
> - C组是纯数据处理层，不涉及任何DOM/SVG/React
> - 输入：A组类型 + B组9层数据 + 自身关卡分配逻辑
> - 输出：完整的 RenderableGourdMapTopology（含全部V2字段）

## 具体任务

### Task C1: 增强 assembleFullTopology 的字段映射

修改 `src/tower-mode/utils/mapLevelIntegratorV2.ts`：

```typescript
export class MapLevelIntegratorV2 {

  /**
   * 完整组装（第八轮增强版）
   * 
   * 关键保证：
   * 1. B组的所有 V2 字段（mode, fontFamily, animationClass 等）原样透传
   * 2. 缺失字段用 A 组 DEFAULT_* 常量补全
   * 3. 类型安全：输出符合 RenderableGourdMapTopology
   */
  assembleFullTopology(
    baseTopology: GourdMapTopology,
    assignment: AssignmentResult,
    bossConfig: GeneratedBoss,
    visualData: LayerVisualData,
    shapeParams: GourdShapeParams
  ): RenderableGourdMapTopology {

    // === 第八轮新增：字段完整性预处理 ===
    const enrichedVisualData = this.enrichVisualData(visualData);

    // === 原有组装逻辑 ===
    const coordinates = this.calculateCoordinates(shapeParams, baseTopology.cells);
    const svgPaths = this.generateSvgPaths(coordinates, shapeParams, baseTopology.paths);

    return {
      ...baseTopology,
      assignedLevels: assignment.assignedLevels,
      bossConfig: this.enrichBossConfig(bossConfig, coordinates),
      gourdShape: shapeParams,
      gourdCoordinates: coordinates,
      svgPaths,
      
      // ★ 核心变化：使用 enrichedVisualData（含fallback）替代原始 visualData
      visualConfig: {
        border: enrichedVisualData.border,
        quadrantLabels: enrichedVisualData.quadrantLabels,
        cellVisualStyles: enrichedVisualData.cellVisualStyles,
        pathVisualStyles: enrichedVisualData.pathVisualStyles ?? {},
        zoneBackgrounds: enrichedVisualData.zoneBackgrounds ?? {},
        background: enrichedVisualData.background,
        decorations: enrichedVisualData.decorations ?? [],
        stateVisualOverrides: enrichedVisualData.stateVisualOverrides ?? {},
      },
    };
  }

  /**
   * 视觉数据富化 —— 对每个缺失的V2字段进行fallback填充
   */
  private enrichVisualData(vd: LayerVisualData): any {
    return {
      ...vd,

      // --- 边框 fallback ---
      border: {
        ...DEFAULT_BORDER_CONFIG,       // A组默认值作为底
        ...(vd.border ?? {}),            // B组数据覆盖
        // 强制确保关键字段存在
        mode: vd.border?.mode ?? 'checkerboard-fill',
        innerPadding: vd.border?.innerPadding ?? DEFAULT_BORDER_CONFIG.innerPadding,
        cornerRadius: vd.border?.cornerRadius ?? DEFAULT_BORDER_CONFIG.cornerRadius,
        opacity: vd.border?.opacity ?? DEFAULT_BORDER_CONFIG.opacity,
        glowColor: vd.border?.glowColor ?? DEFAULT_BORDER_CONFIG.glowColor,
      },

      // --- 象限标签 fallback ---
      quadrantLabels: this.resolveQuadrantLabels(vd.quadrantLabels),

      // --- 格子样式 fallback ---
      cellVisualStyles: this.resolveCellStyles(vd.cellVisualStyles),

      // --- 区域背景 fallback ---
      zoneBackgrounds: this.resolveZoneBackgrounds(vd.zoneBackgrounds),

      // --- 装饰元素 fallback ---
      decorations: vd.decorations?.length > 0 ? vd.decorations : [],

      // --- 状态覆盖 fallback ---
      stateVisualOverrides: vd.stateVisualOverrides ?? {},
    };
  }

  /** 象限标签解析：确保4个全齐且每个含完整V2字段 */
  private resolveQuadrantLabels(input: any[] | undefined): any[] {
    if (input?.length === 4 && input.every(q => q.quadrant)) return input;
    
    console.warn('[C组] quadrantLabels 不完整或格式错误，使用默认值');
    
    // 用 A 组 DEFAULT_QUADRANT_LABELS 作为模板
    // 如果 input 中某个象限有自定义颜色则保留覆盖
    const defaults = [...DEFAULT_QUADRANT_LABELS];
    if (input) {
      for (const incoming of input) {
        const idx = defaults.findIndex(d => d.quadrant === incoming.quadrant);
        if (idx >= 0) {
          defaults[idx] = { ...defaults[idx], ...incoming }; // 输入覆盖默认
        }
      }
    }
    return defaults;
  }

  /** 格子样式合并：A组默认 + B组覆盖 */
  private resolveCellStyles(input: Map<string, any> | undefined): Map<string, any> {
    const merged = new Map<string, any>();
    
    // 先写入所有 A 组默认值
    for (const [key, val] of DEFAULT_CELL_STYLES) {
      merged.set(key, { ...val });
    }
    
    // B组覆盖
    if (input) {
      for (const [key, val] of input) {
        const existing = merged.get(key);
        merged.set(key, existing ? { ...existing, ...val } : val);
      }
    }

    // ★ 后处理：确保关键样式规则
    this.postProcessCellStyles(merged);
    return merged;
  }

  /** 格子样式后处理：强制执行不可违反的规则 */
  private postProcessCellStyles(styles: Map<string, any>): void {
    // Boss 必须有 emerge 动画
    const boss = styles.get('boss');
    if (boss && !boss.animationClass) {
      boss.animationClass = 'gm-boss-emerge';
    }
    
    // 精英必须有 jagged 动画
    const elite = styles.get('elite');
    if (elite && !elite.animationClass) {
      elite.animationClass = 'gm-elite-jagged';
    }

    // 所有图标必须是 SVG 类型
    for (const [, style] of styles) {
      if (style.icon && style.icon.type !== 'svg') {
        style.icon = { type: 'svg', data: '' };
      }
    }
  }

  /** 区域背景解析 */
  private resolveZoneBackgrounds(input: Record<string, any> | undefined): Record<string, any> {
    const result: Record<string, any> = {};
    const defaultZones = ['W','N','I','P','S','D'];
    
    for (const z of defaultZones) {
      result[z] = {
        ...(input?.[z] ?? {}),
        enterAnimClass: input?.[z]?.enterAnimClass ?? `gm-zone-${z.toLowerCase()}-enter`,
        centerPosition: input?.[z]?.centerPosition ?? this.getDefaultZoneCenter(z),
        shape: input?.[z]?.shape ?? 'quadrant',
      };
    }
    return result;
  }

  private getDefaultZoneCenter(zone: string): { x: number; y: number } {
    // 下圆中心约 (0.50, 0.60)，半径约 0.35
    const cx = 0.50, cy = 0.62, r = 0.30;
    switch(zone) {
      case 'W': return { x: cx - r*0.5, y: cy - r*0.5 };
      case 'N': return { x: cx + r*0.5, y: cy - r*0.5 };
      case 'I': return { x: cx - r*0.5, y: cy + r*0.5 };
      case 'P': return { x: cx + r*0.5, y: cy + r*0.5 };
      case 'S': return { x: cx, y: cy - r*0.8 };
      case 'D': return { x: cx, y: cy };
      default: return { x: cx, y: cy };
    }
  }
}
```

### Task C2: 批量预组装 + 缓存

```typescript
/**
 * 预组装全部9层（启动时一次性完成，缓存结果）
 */
export function preassembleAllLayers(): Map<number, RenderableGourdMapTopology> {
  const integrator = new MapLevelIntegratorV2();
  const cache = new Map<number, RenderableGourdMapTopology>();
  
  for (let layer = 1; layer <= 9; layer++) {
    try {
      const topology = buildLayerTopology(layer, integrator);
      cache.set(layer, topology);
      console.log(`[C组] L${layer} ✅`);
    } catch (err) {
      console.error(`[C组] L${layer} ❌`, err);
      // 单层失败不影响其他层
    }
  }
  
  console.log(`[C组] 预组装完成: ${cache.size}/9`);
  return cache;
}

/** 获取某层拓扑（优先从缓存读取） */
export function getLayerTopology(layer: number, cache?: Map<number, RenderableGourdMapTopology>): RenderableGourdMapTopology {
  if (cache?.has(layer)) return cache.get(layer)!;
  
  // 缓存未命中时实时组装
  const integrator = new MapLevelIntegratorV2();
  return buildLayerTopology(layer, integrator);
}
```

### Task C3: 关键断言测试

```typescript
describe('C组第八轮 — V2字段透传验证', () => {

  test('L1输出的 border 包含 mode 字段', () => {
    const t = assembleL1();
    expect(t.visualConfig.border.mode).toBe('checkerboard-fill');
    expect(t.visualConfig.border.glowColor).toBeDefined();
  });

  test('L1输出的 quadrantLabels 含 fontFamily 和 strokeColor', () => {
    const t = assembleL1();
    for (const q of t.visualConfig.quadrantLabels) {
      expect(q.fontFamily).toContain('Arial');
      expect(q.strokeColor).toBe('#FFFFFF');
      expect(q.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
    }
  });

  test('Boss格含 animationClass 且 sizeMultiplier=2.5', () => {
    const t = assembleL1();
    const boss = t.visualConfig.cellVisualStyles.get('boss');
    expect(boss?.animationClass).toBe('gm-boss-emerge');
    expect(boss?.sizeMultiplier).toBeCloseTo(2.5, 1);
  });

  test('精英格含 elite-jagged 动画', () => {
    const t = assembleL1();
    expect(t.visualConfig.cellVisualStyles.get('elite')?.animationClass)
      .toBe('gm-elite-jagged');
  });

  test('zoneBackgrounds 含 enterAnimClass 和 centerPosition', () => {
    const t = assembleL1();
    for (const z of ['W','N','I','P']) {
      const zb = t.visualConfig.zoneBackgrounds[z];
      expect(zb.enterAnimClass).toContain('gm-zone-');
      expect(zb.centerPosition).toBeDefined();
      expect(zb.shape).toBe('quadrant');
    }
  });

  test('decorations 数组非空', () => {
    const t = assembleL1();
    expect(t.visualConfig.decorations.length).toBeGreaterThanOrEqual(5);
  });

  test('preassembleAllLayers 返回9层且每层border.mode正确', () => {
    const all = preassembleAllLayers();
    expect(all.size).toBe(9);
    for (let i = 1; i <= 9; i++) {
      expect(all.get(i)?.visualConfig.border.mode).toBe('checkerboard-fill');
    }
  });
});
```

## 验收标准

1. ✅ assembleFullTopology 输出的 topology.visualConfig.border 包含 mode/opacity/glowColor 等9个字段
2. ✅ 每个 quadrantLabel 包含 fontFamily/strokeColor/strokeWidth/shadow* 共11个V2字段
3. ✅ Boss 有 animationClass='gm-boss-emerge' 且 sizeMultiplier=2.5
4. ✅ 精英有 animationClass='gm-elite-jagged'
5. ✅ 所有图标 type='svg'
6. ✅ zoneBackgrounds 含 enterAnimClass/centerPosition/shape
7. ✅ decorations ≥ 5 个元素
8. ✅ preassembleAllLayers 成功产出 9 层（单层失败不阻断其他层）
9. ✅ 单元测试覆盖上述8项
