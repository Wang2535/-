# C组第九轮 — 组装层增强：游戏状态集成 + 机制数据透传

## 背景

第八轮C组建立了完善的 fallback 和 V2 字段透传机制。第九轮C组需要：

1. **集成 A 组的新类型**: gameMechanics.types.ts 中的 TurnContext/CellInfoPanel 等
2. **集成 B 组的 layerMechanics 数据**: 将每层特殊机制数据组装到输出拓扑中
3. **新增游戏状态字段**: 在 RenderableGourdMapTopology 中增加游戏运行时需要的字段

> **边界说明**:
> - C组是纯数据处理层
> - 消费 A 组全部类型
> - 消费 B 组9层数据 + layerMechanics
> - 输出包含完整视觉配置 + 游戏机制配置的"超级拓扑"

## 具体任务

### Task C1: 扩展 RenderableGourdMapTopology

在 `src/tower-mode/types/visualAssets.types.ts` 中追加：

```typescript
/**
 * 第九轮扩展：渲染用拓扑（含游戏机制数据）
 * 
 * 这是 C组 assembleFullTopology 的最终输出类型，
 * E组渲染器和 D组引擎都从此类型读取数据。
 */
export interface RenderableGourdMapTopologyV3 {
  // ===== 第六轮字段（保留）=====
  id: string;
  name: string;
  cells: GridCell[];
  paths: ConnectionPath[];
  connections: CellConnection[];
  
  // ===== 第七轮字段（保留）=====
  assignedLevels: Map<string, number>;
  bossConfig: GeneratedBoss;
  gourdShape: GourdShapeParams;
  gourdCoordinates: Record<string, GourdCoordinate>;
  svgPaths: SvgPathData[];
  
  // ===== 第八轮字段（保留）=====
  visualConfig: {
    border: CheckerboardBorderV2;
    quadrantLabels: QuadrantLabelV2[];
    cellVisualStyles: Map<string, CellVisualStyleV2>;
    pathVisualStyles: Record<string, PathLineStyle>;
    zoneBackgrounds: Record<string, ZoneBackgroundConfigV2>;
    background: BackgroundConfig;
    decorations: DecorationElement[];
    stateVisualOverrides: Record<string, StateVisualOverride>;
  };
  
  // ===== 第九轮新增：游戏机制数据 ======
  
  /** 该层的主题配置 */
  layerTheme: LayerThemeConfig;
  
  /** 该层的特殊机制 */
  layerMechanic: LayerSpecialMechanicData;
  
  /** 格子→信息面板数据的预计算映射 */
  cellInfoMap: Map<string, CellInfoPanelData>;
  
  /** 区域效果实例列表 */
  activeZoneEffects: ZoneEffectInstance[];
  
  /** 隐藏路径数据（L8观测坍缩用） */
  hiddenPaths?: Array<{ from: string; to: string; locked: boolean }>;
  
  /** 蜂窝迷路相邻关系表（L6信号切换用） */
  hexAdjacency?: Map<string, string[]>;
  
  /** 殿堂礼仪正确顺序（L9用） */
  protocolSequence?: string[];
}
```

### Task C2: 增强 assembleFullTopology

修改 `mapLevelIntegratorV2.ts`：

```typescript
assembleFullTopologyV3(
  baseTopology: GourdMapTopology,
  assignment: AssignmentResult,
  bossConfig: GeneratedBoss,
  visualData: LayerVisualData,
  shapeParams: GourdShapeParams,
  layerNumber: number,
): RenderableGourdMapTopologyV3 {
  
  // === 第八步（原有）：基础组装 ===
  const base = this.assembleFullTopology(baseTopology, assignment, bossConfig, visualData, shapeParams);
  
  // === 第九步（新增）：游戏机制数据集成 ===
  
  const theme = getLayerTheme(layerNumber);           // A组 LAYER_THEMES
  const mechanic = LAYER_MECHANICS[layerNumber];       // B组 layerMechanics
  
  // 预计算 cellInfoMap
  const cellInfoMap = this.buildCellInfoMap(base.cells, visualData.cellVisualStyles, layerNumber);
  
  // 初始化区域效果列表（空，由D组运行时填充）
  const activeZoneEffects: ZoneEffectInstance[] = [];
  
  // 处理隐藏路径（L8专用）
  let hiddenPaths: undefined;
  if (mechanic.type === 'collapse' && mechanic.hiddenPaths) {
    hiddenPaths = mechanic.hiddenPaths;
  }
  
  // 处理蜂窝邻接表（L6专用）
  let hexAdjacency: undefined;
  if (layerNumber === 6) {
    hexAdjacency = this.buildHexAdjacency(base.cells);
  }
  
  // 处理殿堂顺序（L9专用）
  let protocolSequence: undefined;
  if (mechanic.type === 'protocol' && mechanic.correctSequence) {
    protocolSequence = mechanic.correctSequence;
  }
  
  return {
    ...base,
    layerTheme: theme,
    layerMechanic: mechanic,
    cellInfoMap,
    activeZoneEffects,
    hiddenPaths,
    hexAdjacency,
    protocolSequence,
  };
}

/** 构建格子信息面板映射 */
private buildCellInfoMap(
  cells: GridCell[],
  styles: Map<string, any>,
  layer: number
): Map<string, CellInfoPanelData> {
  const map = new Map();
  for (const cell of cells) {
    const type = cell.type ?? 'level';
    const style = styles.get(type) ?? DEFAULT_CELL_STYLES.get('level');
    
    map.set(cell.id, {
      cellId: cell.id,
      cellType: this.mapToInfoType(type),
      name: cell.name ?? this.getDefaultName(type, layer),
      difficultyStars: cell.difficulty ?? this.inferDifficulty(type, layer),
      canEnter: cell.state !== 'locked',
      canSkip: type !== 'boss' && type !== 'start',
    });
  }
  return map;
}
```

### Task C3: 新增 preassembleAllLayersV3

```typescript
/**
 * 预组装全部9层（含第九轮游戏机制数据）
 */
export function preassembleAllLayersV3(): Map<number, RenderableGourdMapTopologyV3> {
  const cache = new Map<number, RenderableGourdMapTopologyV3>();
  const integrator = new MapLevelIntegratorV2();
  
  for (let layer = 1; layer <= 9; layer++) {
    try {
      const topology = integrator.assembleFullTopologyV3(
        getBaseTopology(layer), getAssignment(layer),
        getBoss(layer), getLayerVisualData(layer),
        LAYER_GOURD_SHAPES[layer], layer
      );
      cache.set(layer, topology);
    } catch (err) { /* 容错 */ }
  }
  return cache;
}
```

### Task C4: 测试

```typescript
describe('C组第九轮 — 游戏状态集成测试', () => {

  test('L1 输出含 layerMechanic.type="acceleration"', () => {
    const t = assembleL1V3();
    expect(t.layerMechanic.type).toBe('acceleration');
  });

  test('L1 输出含 layerTheme.name="病毒实验室"', () => {
    const t = assembleL1V3();
    expect(t.layerTheme.name).toBe('病毒实验室');
  });

  test('L1 cellInfoMap 包含所有格子的基本信息', () => {
    const t = assembleL1V3();
    expect(t.cellInfoMap.size).toBeGreaterThan(10);
    t.cellInfoMap.forEach(info => {
      expect(info.cellId).toBeTruthy();
      expect(info.canEnter).toBeDefined();
    });
  });

  test('L6 输出含 hexAdjacency', () => {
    const t = assembleL6V3();
    expect(t.hexAdjacency).toBeDefined();
  });

  test('L8 输出含 hiddenPaths', () => {
    const t = assembleL8V3();
    expect(t.hiddenPaths).toBeDefined();
    expect(t.hiddenPaths.length).toBeGreaterThan(0);
  });

  test('L9 输出含 protocolSequence', () => {
    const t = assembleL9V3();
    expect(t.protocolSequence).toBeDefined();
    expect(t.protocolSequence).toContain('outer_cw');
  });

  test('preassembleAllLayersV3 返回9层且每层含 mechanic', () => {
    const all = preassembleAllLayersV3();
    expect(all.size).toBe(9);
    for (let i = 1; i <= 9; i++) {
      expect(all.get(i)?.layerMechanic).toBeDefined();
      expect(all.get(i)?.layerTheme).toBeDefined();
    }
  });
});
```

## 验收标准

1. ✅ `RenderableGourdMapTopologyV3` 类型定义完整（含9个第九轮新字段）
2. ✅ `assembleFullTopologyV3` 输出包含 layerTheme + layerMechanic + cellInfoMap
3. ✅ L1 的 layerMechanic.type === 'acceleration'
4. ✅ L6 输出含 hexAdjacency
5. ✅ L8 输出含 hiddenPaths
6. ✅ L9 输出含 protocolSequence
7. ✅ `preassembleAllLayersV3` 成功产出 9 层
