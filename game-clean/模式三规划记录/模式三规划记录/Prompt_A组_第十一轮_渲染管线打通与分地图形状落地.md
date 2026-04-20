# A组第十一轮 — 渲染管线打通与分地图形状落地

## 🔴 核心问题

**第十轮完成了GourdShapeFactory(9种形状变体)和PerLayerTopologyGenerator(9层差异化拓扑)，但GourdMapRenderer仍使用第九轮的旧数据，玩家看到的9层地图完全一样。**

这是当前**最严重的差距**——所有形状和拓扑设计都停留在数据层，未在游戏中呈现。

## 🎯 本轮目标

**将第十轮数据源接入GourdMapRenderer渲染管线**，让玩家切换到不同层时能明显看到形状、布局、格子数量的差异。

---

## 任务详情

### Task A1: ★★★ P0 — ShapeDrivenMapAdapter 数据适配器

**新建文件**: `src/tower-mode/adapters/ShapeDrivenMapAdapter.ts`

```typescript
/**
 * ShapeDrivenMapAdapter — 将ShapeFactory+TopologyGenerator输出转换为GourdMapRenderer拓扑
 * 
 * 职责:
 * 1. 调用GourdShapeFactory获取层形状配置
 * 2. 调用PerLayerTopologyGenerator生成格子+连接
 * 3. 转换为GourdMapRenderer期望的GourdMapTopology格式
 */

import { GourdShapeFactory } from '../geometry/GourdShapeFactory';
import { PerLayerTopologyGenerator } from '../geometry/PerLayerTopologyGenerator';
import type { LayerShapeConfig } from '../types/gourdShapeVariants.types';
import type { GeneratedTopology, GeneratedCell, GeneratedConnection } from '../geometry/PerLayerTopologyGenerator';
import type { GourdMapTopology } from '../types/grid.types';
import type { GourdRegion } from '../data/layers/gourdShapes';

export interface LayerRenderData {
  topology: GourdMapTopology;
  shapeConfig: LayerShapeConfig;
  mechanicType: string;
  layerName: string;
}

export class ShapeDrivenMapAdapter {

  /**
   * 为指定层生成完整的渲染数据
   */
  static buildLayerRenderData(layerNumber: number): LayerRenderData {
    // 1. 获取形状配置
    const shapeConfig = GourdShapeFactory.generate({
      layerNumber,
      mechanicType: this.getMechanicType(layerNumber),
      themeName: this.getLayerName(layerNumber),
      difficulty: layerNumber,
    });

    // 2. 生成拓扑
    const topology = PerLayerTopologyGenerator.generate(layerNumber, shapeConfig);

    // 3. 转换为GourdMapTopology
    const renderTopology = this.toGourdMapTopology(layerNumber, shapeConfig, topology);

    return {
      topology: renderTopology,
      shapeConfig,
      mechanicType: this.getMechanicType(layerNumber),
      layerName: this.getLayerName(layerNumber),
    };
  }

  /**
   * 核心转换: GeneratedTopology → GourdMapTopology
   */
  private static toGourdMapTopology(
    layerNumber: number,
    shapeConfig: LayerShapeConfig,
    genTopo: GeneratedTopology,
  ): GourdMapTopology {
    const uc = shapeConfig.upperCircle;
    const lc = shapeConfig.lowerCircle;

    // 格子数据
    const cellPositions: Record<string, { x: number; y: number }> = {};
    const cellTypes: Record<string, string> = {};
    const cellZones: Record<string, string> = {};
    const cellRegions: Record<string, GourdRegion> = {};

    for (const cell of genTopo.cells) {
      cellPositions[cell.id] = cell.position;
      cellTypes[cell.id] = cell.type;
      cellZones[cell.id] = cell.zoneId ?? '';
      cellRegions[cell.id] = cell.region;
    }

    // 按region分组
    const upperCellIds = genTopo.cells.filter(c => c.region === GourdRegion.UPPER_CIRCLE).map(c => c.id);
    const connectorCellIds = genTopo.cells.filter(c => c.region === GourdRegion.CONNECTOR).map(c => c.id);
    const lowerCellIds = genTopo.cells.filter(c => c.region === GourdRegion.LOWER_CIRCLE).map(c => c.id);

    // 连接数据
    const connections = genTopo.connections.map(c => ({
      id: c.id,
      from: c.from,
      to: c.to,
      type: c.type,
      visualStyle: c.visualStyle,
    }));

    // 区域信息
    const upperCircle = {
      cellIds: upperCellIds,
      center: { x: uc.center.x * 8, y: uc.center.y * 8 }, // 转换到800x600坐标系
      radius: uc.radius * 8,
      radiusX: uc.radius * 8,
      radiusY: uc.radius * (uc.scaleY / uc.scaleX) * 8,
    };

    const connector = {
      cellIds: connectorCellIds,
      width: shapeConfig.connector.width * 8,
      narrowPointY: (uc.center.y + 12) * 8,
      widthAtNarrowest: (shapeConfig.connector.width / 2) * 8,
    };

    const lowerCircle = {
      cellIds: lowerCellIds,
      center: { x: lc.center.x * 8, y: lc.center.y * 8 },
      radiusX: lc.radiusX * 8,
      radiusY: lc.radiusY * 8,
    };

    // 视觉配置(从shapeConfig.visualModifiers提取)
    const visualConfig = {
      outlineStyle: shapeConfig.visualModifiers.outlineStyle,
      innerGrid: shapeConfig.visualModifiers.innerGrid,
      bgTexture: shapeConfig.visualModifiers.bgTexture,
      cellVisualStyles: this.getCellStyles(shapeConfig),
      zoneBackgrounds: this.getZoneBackgrounds(layerNumber),
    };

    return {
      id: `layer-${layerNumber}`,
      layerNumber,
      layerTheme: this.getLayerName(layerNumber),
      mechanicType: this.getMechanicType(layerNumber),
      cellIds: genTopo.cells.map(c => c.id),
      cellPositions,
      cellTypes,
      cellZones,
      cellRegions,
      connections,
      upperCircle,
      connector,
      lowerCircle,
      visualConfig,
      shapeConfig,  // 保留原始配置供高级渲染使用
      startCellId: genTopo.startCellId,
      bossCellId: genTopo.bossCellId,
    };
  }

  private static getMechanicType(layerNumber: number): string {
    const map: Record<number, string> = {
      1: 'acceleration', 2: 'jump', 3: 'sequence', 4: 'event',
      5: 'blockade', 6: 'teleport', 7: 'drift', 8: 'collapse', 9: 'protocol',
    };
    return map[layerNumber] ?? '';
  }

  private static getLayerName(layerNumber: number): string {
    const names: Record<number, string> = {
      1: '病毒实验室', 2: '赛博空间', 3: '数据金库', 4: '城市街区',
      5: '智能工厂', 6: '移动终端', 7: '云端平台', 8: '未来实验室', 9: '指挥中心',
    };
    return names[layerNumber] ?? '未知';
  }

  private static getCellStyles(shapeConfig: LayerShapeConfig): Record<string, any> {
    // 根据shapeConfig返回格子样式配置
    return {
      borderStyle: shapeConfig.visualModifiers.outlineStyle,
      gridType: shapeConfig.visualModifiers.innerGrid?.type ?? 'none',
    };
  }

  private static getZoneBackgrounds(layerNumber: number): Record<string, any> {
    // 返回区域背景配置
    return {};
  }

  /**
   * 批量生成所有层
   */
  static buildAllLayers(): Record<number, LayerRenderData> {
    const result: Record<number, LayerRenderData> = {};
    for (let i = 1; i <= 9; i++) {
      result[i] = this.buildLayerRenderData(i);
    }
    return result;
  }

  /**
   * 获取层预期格子数(用于验证)
   */
  static getExpectedCellCount(layerNumber: number): number {
    return PerLayerTopologyGenerator.getCellCount(layerNumber);
  }
}
```

### Task A2: ★★☆ P0 — GourdMapRenderer 形状配置渲染

**修改文件**: `src/tower-mode/components/GourdMapRenderer/index.tsx`

**要求**: 在现有渲染管线中接入shapeConfig，实现差异化渲染：

```typescript
// 1. 边框渲染(根据outlineStyle):
const outlineStyle = topology.shapeConfig?.visualModifiers.outlineStyle ?? 'solid';

// 渲染逻辑:
// 'solid' → stroke-dasharray="none"
// 'dashed' → stroke-dasharray="8 4"
// 'dotted' → stroke-dasharray="2 4"
// 'glow' → 多层stroke(外发光效果)
// 'crack' → 使用不规则折线路径代替椭圆

// 2. 内网格渲染(根据innerGrid):
const innerGrid = topology.shapeConfig?.visualModifiers.innerGrid;
if (innerGrid && innerGrid.type !== 'none' && innerGrid.opacity > 0) {
  // 在背景层绘制:
  // 'hex' → 六角网格(L6)
  // 'square' → 方格(L2/L4/L5)
  // 'triangular' → 三角网格(L8)
  // 'radial' → 辐射同心圆(L3/L9)
}

// 3. 全局变形(根据globalTransform):
const transform = topology.shapeConfig?.globalTransform;
if (transform) {
  // 应用到整个地图SVG:
  // transform={`scale(${transform.scale}) skewX(${transform.skewX}deg) skewY(${transform.skewY}deg)`}
}
```

### Task A3: ★☆☆ P1 — 形状渲染验证

**新建文件**: `src/tower-mode/__tests__/adapters/ShapeDrivenMapAdapter.test.ts`

```typescript
import { ShapeDrivenMapAdapter } from '../../adapters/ShapeDrivenMapAdapter';

describe('ShapeDrivenMapAdapter', () => {
  describe('9层形状差异化', () => {
    it('L1应该是标准葫芦形', () => {
      const data = ShapeDrivenMapAdapter.buildLayerRenderData(1);
      expect(data.shapeConfig.variant).toBe('standard');
      expect(data.topology.cellIds.length).toBe(20);
    });

    it('L2应该是宽底葫芦(下圆扩展)', () => {
      const data = ShapeDrivenMapAdapter.buildLayerRenderData(2);
      expect(data.shapeConfig.variant).toBe('wide-lower');
      expect(data.topology.cellIds.length).toBe(34);
      expect(data.topology.lowerCircle.radiusX).toBeGreaterThan(data.topology.upperCircle.radius);
    });

    it('L6应该是扁平六角(极度压扁)', () => {
      const data = ShapeDrivenMapAdapter.buildLayerRenderData(6);
      expect(data.shapeConfig.variant).toBe('hex-flat');
      expect(data.topology.cellIds.length).toBe(37);
      expect(data.topology.lowerCircle.radiusY).toBeLessThan(data.topology.lowerCircle.radiusX * 0.6);
    });

    it('L8应该是不对称(上下圆心错位)', () => {
      const data = ShapeDrivenMapAdapter.buildLayerRenderData(8);
      expect(data.shapeConfig.variant).toBe('asymmetric');
      expect(data.topology.upperCircle.center.x).not.toBe(data.topology.lowerCircle.center.x);
    });

    it('L9应该是最大葫芦(scale=1.08)', () => {
      const data = ShapeDrivenMapAdapter.buildLayerRenderData(9);
      expect(data.shapeConfig.variant).toBe('expanded-palace');
      expect(data.shapeConfig.globalTransform.scale).toBeCloseTo(1.08, 1);
    });
  });

  describe('格子数量验证', () => {
    const expectedCounts: Record<number, number> = {
      1: 20, 2: 34, 3: 24, 4: 26, 5: 24, 6: 37, 7: 23, 8: 22, 9: 32,
    };

    for (const [layer, count] of Object.entries(expectedCounts)) {
      it(`L${layer}应该有${count}个格子`, () => {
        const data = ShapeDrivenMapAdapter.buildLayerRenderData(Number(layer));
        expect(data.topology.cellIds.length).toBe(count);
      });
    }
  });
});
```

---

## 验收标准

- [ ] L2显示为"宽底"葫芦(下圆明显大于上圆)
- [ ] L6显示为"扁平"葫芦(极度压扁,六角网格可见)
- [ ] L8显示为"不对称"葫芦(上下圆心不在同一垂直线)
- [ ] L9显示为"最大"葫芦(全局scale=1.08)
- [ ] 每层的格子数量正确(L1=20, L2=34, L6=37等)
- [ ] 边框样式根据层不同(solid/dashed/dotted/glow/crack)
- [ ] L6有六角内网格可见
- [ ] L3/L9有辐射网格可见
- [ ] ShapeDrivenMapAdapter测试全部通过
- [ ] 无TypeScript编译错误
