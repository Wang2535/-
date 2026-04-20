# A组第十一轮 — 渲染管线重构 + 数据源统一

## 背景

第十轮完成了两大核心基础设施:
- **GourdShapeFactory** — 9种形状变体工厂
- **PerLayerTopologyGenerator** — 9层差异化拓扑生成

但**GourdMapRenderer仍使用第九轮的visualData**,第十轮生成的数据完全未被渲染。

## 本轮目标

**将第十轮数据源完全接入渲染管线**,让ShapeFactory和TopologyGenerator成为唯一的地图数据来源。

---

## 具体任务

### Task A1: ★★★ P0 — ShapeDrivenMapAdapter 形状驱动渲染适配器

**新建文件**: `src/tower-mode/adapters/ShapeDrivenMapAdapter.ts`

这个适配器负责将`GourdShapeFactory` + `PerLayerTopologyGenerator`的输出转换为`GourdMapRenderer`期望的格式:

```typescript
import { GourdShapeFactory } from '../geometry/GourdShapeFactory';
import { PerLayerTopologyGenerator } from '../geometry/PerLayerTopologyGenerator';
import type { LayerShapeConfig } from '../types/gourdShapeVariants.types';
import type { GeneratedTopology } from '../geometry/PerLayerTopologyGenerator';
import type { GourdMapTopology } from '../types/grid.types';

/**
 * ShapeDrivenMapAdapter — 将形状工厂+拓扑生成器的输出
 * 转换为GourdMapRenderer可消费的GourdMapTopology格式
 */
export class ShapeDrivenMapAdapter {
  
  /**
   * 为指定层生成完整的渲染拓扑
   */
  static buildRenderTopology(layerNumber: number): GourdMapTopology {
    // 1. 从ShapeFactory获取形状配置
    const shapeConfig = GourdShapeFactory.generate({
      layerNumber,
      mechanicType: this.getMechanicType(layerNumber),
      themeName: this.getThemeName(layerNumber),
      difficulty: layerNumber,
    });

    // 2. 从TopologyGenerator获取拓扑数据
    const topology = PerLayerTopologyGenerator.generate(layerNumber, shapeConfig);

    // 3. 转换为GourdMapTopology格式
    return this.toGourdMapTopology(layerNumber, shapeConfig, topology);
  }

  /**
   * 获取层对应的机制类型(用于MechanicVisualizer)
   */
  static getMechanicType(layerNumber: number): string {
    const map: Record<number, string> = {
      1: 'acceleration',
      2: 'jump',
      3: 'sequence',
      4: 'event',
      5: 'blockade',
      6: 'teleport',
      7: 'drift',
      8: 'collapse',
      9: 'protocol',
    };
    return map[layerNumber] ?? 'acceleration';
  }

  /**
   * 获取层对应的主题名称
   */
  static getThemeName(layerNumber: number): string {
    const names: Record<number, string> = {
      1: '病毒实验室',
      2: '赛博空间',
      3: '数据金库',
      4: '城市街区',
      5: '智能工厂',
      6: '移动终端',
      7: '云端平台',
      8: '未来实验室',
      9: '指挥中心',
    };
    return names[layerNumber] ?? '未知';
  }

  /**
   * 核心转换逻辑: GeneratedTopology → GourdMapTopology
   */
  private static toGourdMapTopology(
    layerNumber: number,
    shapeConfig: LayerShapeConfig,
    topology: GeneratedTopology,
  ): GourdMapTopology {
    const uc = shapeConfig.upperCircle;
    const lc = shapeConfig.lowerCircle;

    // 转换格子数据
    const cellIds: string[] = topology.cells.map(c => c.id);
    const cellPositions: Record<string, { x: number; y: number }> = {};
    const cellTypes: Record<string, string> = {};
    const cellZones: Record<string, string> = {};

    for (const cell of topology.cells) {
      cellPositions[cell.id] = cell.position;
      cellTypes[cell.id] = cell.type;
      cellZones[cell.id] = cell.zoneId ?? '';
    }

    // 转换连接数据
    const connections: Array<{ from: string; to: string; type: string }> = 
      topology.connections.map(c => ({ from: c.from, to: c.to, type: c.type }));

    // 构建区域信息
    const upperCircle = {
      cellIds: topology.cells
        .filter(c => c.region === 'UPPER_CIRCLE')
        .map(c => c.id),
      center: { x: uc.center.x, y: uc.center.y },
      radius: uc.radius,
    };

    const connector = {
      cellIds: topology.cells
        .filter(c => c.region === 'CONNECTOR')
        .map(c => c.id),
      width: shapeConfig.connector.width,
    };

    const lowerCircle = {
      cellIds: topology.cells
        .filter(c => c.region === 'LOWER_CIRCLE')
        .map(c => c.id),
      center: { x: lc.center.x, y: lc.center.y },
      radiusX: lc.radiusX,
      radiusY: lc.radiusY,
    };

    return {
      id: `layer-${layerNumber}`,
      layerNumber,
      mechanicType: this.getMechanicType(layerNumber),
      themeName: this.getThemeName(layerNumber),
      cellIds,
      cellPositions,
      cellTypes,
      cellZones,
      connections,
      upperCircle,
      connector,
      lowerCircle,
      shapeConfig,  // 保留原始形状配置供渲染器使用
      startCellId: topology.startCellId,
      bossCellId: topology.bossCellId,
    };
  }

  /**
   * 批量生成所有层的渲染拓扑
   */
  static buildAllLayers(): Record<number, GourdMapTopology> {
    const result: Record<number, GourdMapTopology> = {};
    for (let i = 1; i <= 9; i++) {
      result[i] = this.buildRenderTopology(i);
    }
    return result;
  }
}
```

### Task A2: ★★☆ P0 — GourdMapRenderer 数据源切换

**修改文件**: `src/tower-mode/components/GourdMapRenderer/index.tsx`

将渲染器从依赖外部传入的visualData切换为使用ShapeDrivenMapAdapter生成的拓扑:

```typescript
// 修改前(topology prop来自外部):
// export function GourdMapRenderer({ topology, ... }) {

// 修改后(内部使用ShapeDrivenMapAdapter):
import { ShapeDrivenMapAdapter } from '../../adapters/ShapeDrivenMapAdapter';

interface ShapeDrivenGourdMapRendererProps {
  layerNumber: number;
  // ... 其他props保留
  topology?: never;  // 禁用外部topology prop
}

export function ShapeDrivenGourdMapRenderer({ 
  layerNumber, 
  ...rest 
}: ShapeDrivenGourdMapRendererProps) {
  // 从ShapeFactory+TopologyGenerator获取数据
  const topology = useMemo(
    () => ShapeDrivenMapAdapter.buildRenderTopology(layerNumber),
    [layerNumber]
  );

  // 获取形状配置(用于边框/背景等渲染)
  const shapeConfig = useMemo(
    () => GourdShapeFactory.generate({
      layerNumber,
      mechanicType: ShapeDrivenMapAdapter.getMechanicType(layerNumber),
      themeName: ShapeDrivenMapAdapter.getThemeName(layerNumber),
      difficulty: layerNumber,
    }),
    [layerNumber]
  );

  // 使用原有渲染逻辑,但数据来自shape-driven拓扑
  return <GourdMapRendererBase topology={topology} shapeConfig={shapeConfig} {...rest} />;
}
```

### Task A3: ★★☆ P1 — 视觉修饰符渲染

**修改文件**: `src/tower-mode/components/GourdMapRenderer/index.tsx` 的边框/背景层

使用`LayerShapeConfig.visualModifiers`控制渲染:

```typescript
// 边框渲染(使用outlineStyle):
const outlineStyle = shapeConfig.visualModifiers.outlineStyle;

// outlineStyle映射:
// 'solid' → 实线边框
// 'dashed' → 虚线边框
// 'dotted' → 点线边框
// 'glow' → 发光效果(多层stroke)
// 'crack' → 裂纹效果(不规则折线)

// 内网格渲染(使用innerGrid):
const grid = shapeConfig.visualModifiers.innerGrid;
if (grid.type !== 'none' && grid.opacity > 0) {
  // grid.type: 'hex' | 'square' | 'triangular' | 'radial'
  // 在背景层绘制对应的内网格图案
}

// 背景纹理(使用bgTexture):
const texture = shapeConfig.visualModifiers.bgTexture;
// 'none' | 'circuit' | 'grid' | 'cloud' | 'quantum' | 'dataflow'
```

### Task A4: ★☆☆ P2 — 删除第九轮遗留visualData(可选)

**文件**: 确认以下文件不再被引用后可删除:
- `src/tower-mode/data/layers/L1_visualData.ts` ~ `L9_visualData.ts`
- `src/tower-mode/data/layers/gourdShapes.ts`

或者保留但标记为deprecated,仅作为参考数据。

---

## 第十一轮A组改动总览

| 任务 | 优先级 | 改动内容 | 预期效果 |
|------|--------|---------|---------|
| **A1** | P0 | ShapeDrivenMapAdapter适配器 | 统一数据源,连接工厂和渲染器 |
| **A2** | P0 | GourdMapRenderer数据源切换 | 渲染器使用第十轮数据 |
| **A3** | P1 | 视觉修饰符渲染 | 边框/网格/纹理根据层不同 |
| **A4** | P2 | 清理遗留数据(可选) | 减少维护负担 |

## 验收标准

1. ✅ 切换L1-L9时,每层的**形状明显不同**(不是换皮)
2. ✅ L2显示为"宽底"葫芦(下圆扩展)
3. ✅ L6显示为"扁平"葫芦(极度压扁)
4. ✅ L8显示为"不对称"葫芦(上下圆心错位)
5. ✅ L9显示为"最大"葫芦(globalScale=1.08)
6. ✅ 每层的格子数量和布局与`PerLayerTopologyGenerator.getCellCount()`一致
7. ✅ 边框样式根据层不同(solid/dashed/dotted/glow/crack)
8. ✅ 内网格可见(hex/square/triangular/radial)
9. ✅ 无TypeScript编译错误
10. ✅ 所有相关测试通过
