# B组第七轮 — 9层葫芦形地图视觉数据生成（核心重点）

## 背景

第六轮B组产出了9层的 `TowerLayerData`（矩形网格数据），但 **E组的LayerMapRenderer 是一个通用矩形网格渲染器，完全无法呈现葫芦形效果**。第七轮B组的核心任务是：

1. **为每层生成真正的葫芦形几何数据**（GourdShapeParams + GourdCoordinate[]）
2. **生成SVG路径数据**（外轮廓、区域分割线、曲线路径）
3. **配置棋盘格边框、W/N/I/P象限标识、格子/线路视觉样式**
4. **使每层地图在视觉上接近海幸参考图**

> **这是第七轮最关键的组别。A组定义了"语法"，B组要填入"内容"，E组才能"显示"。**

## 参考图核心特征回顾

请反复对照用户提供的**海幸参考图**，确保以下特征在数据中体现：

```
┌─────────────────────────────────────┐
│  ╔══════════════════╗                │  ← 上小圆 (upperCircle)
│  ║   ★ 星球装饰    ║   ← 连接通道     │
│  ╠══════╦══════════╣   (connector)    │
│  ║  W   ║     N    ║                │
│  ╠══════╬══════════╣                │  ← 下大圆 (lowerCircle)
│  ║  I   ║     P    ║                │
│  ╚══════╩══════════╝  end→          │
│     ↑ 棋盘格橙黄白边框                 │
└─────────────────────────────────────┘
```

## 任务目标

基于A组第七轮新增的类型体系，为全部9层生成 `RenderableGourdMapTopology` 所需的**完整视觉和几何数据**。

> **边界说明**：
> - B组是**所有视觉数据的唯一产出方**
> - 使用A组的 GourdCoordinateCalculator 工具函数辅助计算
> - 产出的数据通过C组 EnrichedTopology 包装后交给E组渲染
> - B组不写任何React组件或CSS

## 具体任务

### Task B1: 定义9层葫芦形状参数

创建文件 `src/tower-mode/data/layers/gourdShapes.ts`：

```typescript
import type { GourdShapeParams, GourdRegion } from '../../types';

/**
 * 9层葫芦形状参数配置
 * 
 * 每层的葫芦外形略有不同：
 * - L1: 标准葫芦（上圆小+下圆大）
 * - L2: 上圆略大（双环感）
 * - L3: 下圆更宽（堡垒感）
 * - L4: 接近正圆（城市平面）
 * - L5: 上窄下宽（漏斗形/流水线）
 * - L6: 整体偏扁（蜂窝横展）
 * - L7: 不规则云朵形
 * - L8: 概率云散射形
 * - L9: 严格对称宫殿形
 */

export const LAYER_GOURD_SHAPES: Record<number, GourdShapeParams> = {
  1: {
    // L1 病毒实验室 — 标准葫芦
    aspectRatio: 0.65,
    upperCircle: { centerX: 0.50, centerY: 0.15, radiusX: 0.12, radiusY: 0.10 },
    lowerCircle: { centerX: 0.50, centerY: 0.60, radiusX: 0.35, radiusY: 0.28 },
    connector: { widthAtNarrowest: 0.10, narrowPointY: 0.32 },
  },
  2: {
    // L2 赛博空间 — 双环感，上圆更大
    aspectRatio: 0.62,
    upperCircle: { centerX: 0.50, centerY: 0.18, radiusX: 0.18, radiusY: 0.14 },
    lowerCircle: { centerX: 0.50, centerY: 0.62, radiusX: 0.32, radiusY: 0.26 },
    connector: { widthAtNarrowest: 0.14, narrowPointY: 0.35 },
  },
  // ... L3~L9 类似定义，每层参数不同
  9: {
    // L9 指挥中心 — 严格对称宫殿
    aspectRatio: 0.70,
    upperCircle: { centerX: 0.50, centerY: 0.12, radiusX: 0.15, radiusY: 0.11 },
    lowerCircle: { centerX: 0.50, centerY: 0.58, radiusX: 0.38, radiusY: 0.32 },
    connector: { widthAtNarrowest: 0.08, narrowPointY: 0.28 },
  },
};
```

### Task B2: 为L1生成完整的视觉数据（模板）

创建文件 `src/tower-mode/data/layers/L1_visualData.ts`：

```typescript
/**
 * L1 病毒实验室 — 完整视觉数据
 * 
 * 这是9层的模板。其他层参照此结构，修改参数即可。
 */
export const L1_VISUAL_DATA = {
  // ===== 棋盘格边框 =====
  border: {
    enabled: true,
    borderWidth: 8,
    colors: ['#FFAA00', '#FFFFFF'],  // 橙黄交替
    tileSize: 16,
    borderRadius: 20,
    padding: 4,
  } as const,

  // ===== W/N/I/P 象限标识 =====
  quadrantLabels: [
    { quadrant: 'W' as const, label: 'W', fontSizeRatio: 0.18, color: '#FF8800', fontWeight: '900', backgroundColor: '#FECACA', backgroundOpacity: 0.25 },
    { quadrant: 'N' as const, label: 'N', fontSizeRatio: 0.18, color: '#FFCC00', fontWeight: '900', backgroundColor: '#DBEAFE', backgroundOpacity: 0.25 },
    { quadrant: 'I' as const, label: 'I', fontSizeRatio: 0.18, color: '#FFCC00', fontWeight: '900', backgroundColor: '#F3E8FF', backgroundOpacity: 0.25 },
    { quadrant: 'P' as const, label: 'P', fontSizeRatio: 0.18, color: '#FF8800', fontWeight: '900', backgroundColor: '#FEF3C7', backgroundOpacity: 0.25 },
  ],

  // ===== 格子视觉样式 =====
  cellVisualStyles: new Map([
    ['start', { sizeMultiplier: 1.0, shape: 'roundedRect', backgroundGradient: { from: '#2d5a27', to: '#1a3a15' }, border: { width: 2, color: '#44ff88', style: 'solid' }, icon: { type: 'svg', data: '<svg>...</svg>' } }],
    ['battle', { sizeMultiplier: 1.0, shape: 'circle', backgroundGradient: { from: '#3a1a1a', to: '#2a0a0a' }, border: { width: 2, color: '#ff6644', style: 'solid' }, icon: { type: 'svg', data: '<svg>...</svg>' } }],
    // ... 其他格子类型
    ['boss', {
      // Boss格特殊：2.5倍大小！
      sizeMultiplier: 2.5,
      shape: 'circle',
      backgroundGradient: { from: '#4a0a0a', to: '#2a0000' },
      border: { width: 4, color: '#ff0000', style: 'double' },
      icon: { type: 'svg', data: '<svg>...</svg>' },
      glowEffect: { color: '#ff3333', size: 30, pulse: true },
    }],
  ]),

  // ===== 格子状态覆盖 =====
  stateVisualOverrides: new Map([
    ['locked', { opacity: 0.4, filter: 'grayscale(0.8) brightness(0.6)', overlayIcon: '🔒' }],
    ['pending', { opacity: 1.0, filter: 'none', overlayColor: '#FF8800', animationClass: 'pulse-orange' }],
    ['current', { opacity: 1.0, filter: 'none', glowEffect: { color: '#00FFFF', size: 20, pulse: true } }],
    ['cleared', { opacity: 0.85, filter: 'brightness(1.2)', overlayIcon: '✓', overlayColor: '#44ff88' }],
    ['failed', { opacity: 0.7, filter: 'grayscale(0.5)', overlayIcon: '✗', overlayColor: '#ff4444' }],
  ]),

  // ===== 线路视觉样式 =====
  pathVisualStyles: new Map([
    ['main', { strokeWidth: 5, strokeColor: '#FFDD66', dashed: false, curveTension: 0.4, roadTexture: 'solid' }],
    ['branch', { strokeWidth: 3, strokeColor: '#FFAA33', dashed: false, curveTension: 0.5, roadTexture: 'dashed' }],
    ['shortcut', { strokeWidth: 2.5, strokeColor: '#AA44FF', dashed: true, dashPattern: '6,4', curveTension: 0.6 }],
    ['return', { strokeWidth: 3, strokeColor: '#44AAFF', dashed: true, dashPattern: '8,4', arrowHead: { size: 10, color: '#44AAFF' } }],
  ]),

  // ===== 区域背景 =====
  zoneBackgrounds: new Map([
    ['W', { backgroundType: 'gradient', backgroundData: 'linear-gradient(135deg, #FECACA80, #FCA5A540)', opacity: 0.3, enterAnimation: 'ripple' }],
    ['N', { backgroundType: 'gradient', backgroundData: 'linear-gradient(135deg, #DBEAFE80, #BFDBFE40)', opacity: 0.3, enterAnimation: 'sparkle' }],
    ['I', { backgroundType: 'gradient', backgroundData: 'linear-gradient(135deg, #F3E8FF80, #E9D5FF40)', opacity: 0.3, enterAnimation: 'flash' }],
    ['P', { backgroundType: 'gradient', backgroundData: 'linear-gradient(135deg, #FEF3C780, #FDE68A40)', opacity: 0.3, enterAnimation: 'countdown' }],
    ['D', { backgroundType: 'gradient', backgroundData: 'linear-gradient(135deg, #FEE2E280, #FECACA40)', opacity: 0.35, enterAnimation: 'warning' }],
  ]),

  // ===== 全局背景 =====
  background: {
    primary: '#1a1a2e',
    texture: 'noise-pattern',  // 噪点纹理模拟手绘质感
    decorations: [
      { type: 'planet', position: { x: 0.50, y: 0.15 }, size: 0.06, zIndex: 1 },  // 上圆中央星球
      { type: 'cloud', position: { x: 0.20, y: 0.55 }, size: 0.08, zIndex: 0 },
      { type: 'cloud', position: { x: 0.78, y: 0.65 }, size: 0.07, zIndex: 0 },
    ],
  },

  // ===== L1特有：13个格子的曲线坐标 =====
  gourdCoordinates: {
    'start':  { region: 'upperCircle' as const, theta: Math.PI * 1.0,  radiusRatio: 0.6, cartesian: { x: 0.38, y: 0.12 } },
    'cell-1':  { region: 'upperCircle' as const, theta: Math.PI * 1.3,  radiusRatio: 0.75, cartesian: { x: 0.42, y: 0.17 } },
    'cell-2':  { region: 'connector' as const, theta: Math.PI * 0.5, radiusRatio: 0.5, cartesian: { x: 0.45, y: 0.30 } },
    // ... 所有13个格子的坐标
    'boss':   { region: 'lowerCircle' as const, theta: Math.PI * 0.0, radiusRatio: 0.0, cartesian: { x: 0.50, y: 0.60 } },
  },
};
```

### Task B3: L1~L9 全部视觉数据文件

为剩余8层各创建类似结构的视觉数据文件：

| 文件 | 层名 | 形状特点 | 边框色 | 特殊元素 |
|------|------|---------|--------|----------|
| `L2_visualData.ts` | 赛博空间 | 双环感 | 青蓝/白 | 内环嵌套 |
| `L3_visualData.ts` | 数据金库 | 同心圆堡垒 | 金/白 | 多圈防御环 |
| `L4_visualData.ts` | 城市街区 | 田字网格 | 橙/白 | 街区十字 |
| `L5_visualData.ts` | 智能工厂 | 流水线树形 | 绿/白 | 分支管道 |
| `L6_visualData.ts` | 移动终端 | 六边形蜂窝 | 紫/白 | 蜂窝网格 |
| `L7_visualData.ts` | 云端平台 | 不规则云朵 | 蓝/白 | 云朵边缘 |
| `L8_visualData.ts` | 未来实验室 | 概率散射 | 品红/白 | 量子光晕 |
| `L9_visualData.ts` | 指挥中心 | 对称宫殿 | 红/金 | 王座台阶 |

**每层必须包含**：
- gourdShapes 参数（与L1不同）
- border 配置（颜色可变）
- quadrantLabels（位置根据下圆中心调整）
- cellVisualStyles（Boss格始终2.5倍）
- zoneBackgrounds（按设想文档的区域分配）
- background.decorations（主题化装饰元素）

### Task B4: SVG路径预计算工具

创建文件 `src/tower-mode/data/layers/svgPathGenerator.ts`：

```typescript
/**
 * SVG路径预计算
 * 
 * 在构建时（非运行时）为每层预计算：
 * 1. 外轮廓 path（用于 CSS clip-path 实现棋盘格边框裁剪）
 * 2. 区域分割 paths（上圆/连接通道/下圆）
 * 3. 四象限分割 paths（十字线）
 * 4. 曲线路径 connections（替代直线）
 */
export class LayerSvgPathGenerator {
  
  /** 为指定层生成完整 SVG 路径集合 */
  static generateAllPaths(layerNumber: number): {
    outlinePath: string;
    regionPaths: Record<string, string>;
    quadrantDividers: { horizontal: string; vertical: string };
    curvedConnections: Array<{ fromId: string; toId: string; pathData: string }>;
  }
  
  /**
   * 生成葫芦外轮廓的 SVG path
   * 
   * 使用贝塞尔曲线拟合上圆+两侧腰+下圆的连续轮廓。
   * 返回的 path 可用作 clip-path 实现棋盘格边框效果。
   */
  static generateGourdOutline(params: GourdShapeParams): string
  
  /**
   * 生成两点间的曲线路径
   * 
   * 替代当前的 <line x1/y1 x2/y2>
   * 返回 <path d="M... C..." />
   */
  static generateCurvedConnection(
    from: { x: number; y: number },
    to: { x: number; y: number },
    tension: number = 0.4
  ): string
}
```

### Task B5: 视觉数据验证器

```typescript
/**
 * 验证视觉数据的完整性
 */
export class VisualDataValidator {
  
  /** 验证单层数据是否包含所有必需字段 */
  static validateLayerVisualData(data: typeof L1_VISUAL_DATA): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  }
  
  /** 验证所有格子坐标是否在葫芦轮廓内 */
  static validateCoordinatesInBounds(
    coords: Record<string, GourdCoordinate>,
    params: GourdShapeParams
  ): boolean[]
  
  /** 验证Boss格是否在下圆中心附近 */
  static validateBossPosition(
    bossCoord: GourdCoordinate,
    params: GourdShapeParams
  ): boolean
}
```

## 与其他组的接口约定

| 接口 | 提供给 | 使用于 |
|------|--------|--------|
| `LAYER_GOURD_SHAPES` | C+E | C组传入拓扑，E组传入坐标计算器 |
| `L1~L9_VISUAL_DATA` | C→E | C组包装后交E组渲染 |
| `LayerSvgPathGenerator` | E组构建时 | E组调用生成SVG路径 |
| `RenderableGourdMapTopology` | C组组装 | C组从B组数据组装后输出 |

## 验收标准

1. ✅ 9层 GourdShapeParams 各不相同且合理
2. ✅ 每层都有完整的 visualData（border/quadrantLabels/cellStyles/pathStyles/zones/background）
3. ✅ Boss格 sizeMultiplier = 2.5
4. ✅ 棋盘格边框 colors = ['#FFAA00', '#FFFFFF'] 或同系列
5. ✅ W/N/I/P 标识 fontSizeRatio ≥ 0.15（足够大）
6. ✅ 所有格子的 gourdCoordinates 在对应区域内
7. ✅ SVG 外轮廓路径可正确描述葫芦形状
8. ✅ 线路使用曲线路径（非直线），curveTension > 0
9. ✅ 9层视觉数据通过 VisualDataValidator 验证
