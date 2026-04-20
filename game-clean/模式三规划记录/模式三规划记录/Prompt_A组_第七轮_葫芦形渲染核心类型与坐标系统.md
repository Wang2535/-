# A组第七轮 — 葫芦形渲染核心类型与坐标系统扩展

## 背景

第六轮A组定义了基础数据结构（GridCell/PathConnection/GourdMapTopology等），但当前LayerMapRenderer使用的是另一套矩形网格系统（TowerLayerData + gridSize.rows/cols），**完全未消费GourdMapTopology的葫芦形参数**。第七轮A组需要：

1. 定义葫芦形曲线坐标系（替代 `[row,col]` 矩形坐标）
2. 定义视觉资源类型（背景图、格子图标、边框样式）
3. 扩展GourdMapTopology以支持渲染所需的全部几何数据
4. 定义棋盘格边框、W/N/I/P象限标识等视觉元素的类型

## 任务目标

扩展第六轮A组的类型体系，使其能够完整描述海幸参考图中的葫芦形地图的所有视觉和几何特征。

> **边界说明**：
> - A组仅负责**类型定义 + 坐标计算工具函数**
> - 不负责任何UI渲染（那是E组的工作）
> - 不负责具体每层的SVG路径数据生成（那是B组的工作）
> - 新增的类型必须能被B组（数据填充）和E组（渲染消费）共同使用

## 具体任务

### Task A1: 葫芦形曲线坐标系统

创建文件 `src/tower-mode/types/gourdCoordinate.types.ts`：

```typescript
/**
 * 葫芦形曲线坐标系
 * 
 * 替代第六轮的 [row, col] 矩形坐标。
 * 所有格子在葫芦形地图中的位置用曲线坐标表示。
 */

/** 葫芦形三区域枚举 */
enum GourdRegion {
  UPPER_CIRCLE = 'upperCircle',    // 上小圆
  CONNECTOR = 'connector',          // 连接通道（腰部）
  LOWER_CIRCLE = 'lowerCircle',     // 下大圆
}

/** 曲线坐标 —— 格子在葫芦中的位置 */
interface GourdCoordinate {
  /** 所属区域 */
  region: GourdRegion;
  
  /** 极坐标角度 (0~2π)，0=正右，π/2=正下 */
  theta: number;
  
  /** 极坐标半径 (0~1)，相对于该区域最大半径的比例 */
  radiusRatio: number;
  
  /** 转换后的笛卡尔坐标 (0~1 归一化) */
  cartesian: { x: number; y: number };
}

/** 葫芦形轮廓参数 —— 每层可不同 */
interface GourdShapeParams {
  /** 整体画布尺寸比例 (width: height) */
  aspectRatio: number;
  
  /** 上圆参数 */
  upperCircle: {
    centerX: number;      // 归一化 x (0~1)
    centerY: number;      // 归一化 y (0~1)
    radiusX: number;      // 水平半径 (归一化)
    radiusY: number;      // 垂直半径 (归一化)
  };
  
  /** 下圆参数 */
  lowerCircle: {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
  };
  
  /** 连接通道参数 */
  connector: {
    widthAtNarrowest: number;  // 最窄处宽度 (归一化)
    narrowPointY: number;     // 收窄点的 y 坐标
  };
}
```

### Task A2: 视觉资源类型

创建文件 `src/tower-mode/types/visualAssets.types.ts`：

```typescript
/**
 * 地图视觉资源类型
 * 
 * 描述海幸参考图中各类视觉元素的数据结构。
 * 实际图片/SVG文件由B组提供，A组定义引用接口。
 */

/** 棋盘格边框样式 */
interface CheckerboardBorder {
  enabled: boolean;
  /** 边框宽度 (px) */
  borderWidth: number;
  /** 格子颜色交替 */
  colors: [string, string];       // 例如 ['#FFAA00', '#FFFFFF']
  /** 单格大小 (px) */
  tileSize: number;
  /** 圆角半径 */
  borderRadius: number;
  /** 内边距 */
  padding: number;
}

/** W/N/I/P 象限标识配置 */
interface QuadrantLabel {
  quadrant: 'W' | 'N' | 'I' | 'P';
  /** 标识字 */
  label: string;
  /** 字体大小 (相对下圆直径的比例) */
  fontSizeRatio: number;
  /** 字体颜色 */
  color: string;
  /** 字重 */
  fontWeight: string;
  /** 背景色（半透明） */
  backgroundColor: string;
  /** 背景透明度 */
  backgroundOpacity: number;
}

/** 格子视觉样式（按类型） */
interface CellVisualStyle {
  cellType: CellType;
  /** 默认尺寸倍率（普通格=1，Boss格=2.5） */
  sizeMultiplier: number;
  /** 形状: 'circle' | 'ellipse' | 'roundedRect' | 'hexagon' */
  shape: 'circle' | 'ellipse' | 'roundedRect' | 'hexagon';
  /** 背景渐变 */
  backgroundGradient: { from: string; to: string; angle: number };
  /** 边框样式 */
  border: { width: number; color: string; style: 'solid' | 'dashed' | 'double' };
  /** 图标: SVG path data 或 图片URL */
  icon: { type: 'svg' | 'image' | 'emoji'; data: string };
  /** 发光效果（当前所在格） */
  glowEffect?: { color: string; size: number; pulse: boolean };
}

/** 格子状态视觉覆盖 */
interface CellStateVisualOverride {
  state: CellState;
  /** 透明度 */
  opacity: number;
  /** 滤镜 */
  filter: string;
  /** 叠加图标（如 ✓ 或 ✗） */
  overlayIcon?: string;
  /** 叠加颜色 */
  overlayColor?: string;
  /** 特殊动画类名 */
  animationClass?: string;
}

/** 线路视觉样式 */
interface PathVisualStyle {
  pathType: PathType;
  /** 线宽 */
  strokeWidth: number;
  /** 线色 */
  strokeColor: string;
  /** 是否虚线 */
  dashed: boolean;
  dashPattern?: string;
  /** 曲线张力 (0=直线, 1=平滑曲线) */
  curveTension: number;
  /** 道路质感叠加 */
  roadTexture?: string;
  /** 箭头（单向路） */
  arrowHead?: { size: number; color: string };
}

/** 区域背景配置 */
interface ZoneBackgroundConfig {
  zoneType: string;
  /** 背景类型: 'solid' | 'gradient' | 'pattern' | 'image' */
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'image';
  /** 背景色/渐变/图案数据 */
  backgroundData: string;
  /** 透明度 */
  opacity: number;
  /** 进入时的动画效果 */
  enterAnimation: 'ripple' | 'sparkle' | 'flash' | 'countdown' | 'warning';
}
```

### Task A3: 扩展 GourdMapTopology 渲染字段

在 `enrichedTopology.types.ts` 中新增渲染专用字段：

```typescript
/**
 * 渲染版 GourdMapTopology
 * 
 * 在第六轮 EnrichedTopology 基础上，
 * 新增 E 组渲染器所需的全部视觉和几何字段。
 */
interface RenderableGourdMapTopology extends EnrichedTopology {
  // ===== 第七轮新增: 几何数据 =====
  
  /** 葫芦形状参数 */
  gourdShape: GourdShapeParams;
  
  /** 所有格子的曲线坐标（替代 coordinate: [row,col]） */
  gourdCoordinates: Map<string, GourdCoordinate>;
  
  /** SVG 路径数据 —— 由 B 组生成 */
  svgPaths: {
    /** 外轮廓路径 (用于边框裁剪) */
    outlinePath: string;
    /** 各区域的 SVG path */
    regionPaths: Record<GourdRegion, string>;
    /** 四象限分割路径 (下圆的十字线) */
    quadrantDividers: { horizontal: string; vertical: string };
  };
  
  // ===== 第七轮新增: 视觉配置 =====
  
  /** 棋盘格边框 */
  border: CheckerboardBorder;
  
  /** W/N/I/P 象限标识 */
  quadrantLabels: QuadrantLabel[];
  
  /** 格子视觉样式映射 */
  cellVisualStyles: Map<CellType, CellVisualStyle>;
  
  /** 格子状态视觉覆盖 */
  stateVisualOverrides: Map<CellState, CellStateVisualOverride>;
  
  /** 线路视觉样式映射 */
  pathVisualStyles: Map<PathType, PathVisualStyle>;
  
  /** 区域背景配置 */
  zoneBackgrounds: Map<string, ZoneBackgroundConfig>;
  
  /** 全局背景配置 */
  background: {
    /** 主背景色/图 */
    primary: string;
    /** 纹理叠加 */
    texture?: string;
    /** 装饰元素位置 */
    decorations?: Array<{
      type: 'planet' | 'cloud' | 'mountain' | 'river' | 'tree';
      position: { x: number; y: number };
      size: number;
      zIndex: number;
    }>;
  };
}
```

### Task A4: 曲线坐标计算工具

创建文件 `src/tower-mode/utils/gourdCoordinateCalculator.ts`：

```typescript
/**
 * 葫芦形曲线坐标计算工具
 * 
 * 将极坐标 (region, theta, radiusRatio) 转换为笛卡尔坐标 (x, y)。
 * E组渲染器调用此工具定位每个格子的屏幕位置。
 */
export class GourdCoordinateCalculator {
  
  /**
   * 根据 GourdShapeParams 和极坐标计算笛卡尔坐标
   */
  static polarToCartesian(
    params: GourdShapeParams,
    coord: GourdCoordinate
  ): { x: number; y: number }
  
  /**
   * 计算葫芦外轮廓的 SVG path d 属性
   * 用于绘制棋盘格边框的裁剪路径
   */
  static generateOutlinePath(params: GourdShapeParams): string
  
  /**
   * 计算两点之间的曲线路径（用于线路渲染）
   * 使用 Catmull-Rom 样条或贝塞尔曲线
   */
  static generateCurvedPath(
    from: { x: number; y: number },
    to: { x: number; y: number },
    tension: number = 0.5
  ): string
  
  /**
   * 判断一个点属于哪个象限（下圆四分区）
   */
  static getQuadrant(
    point: { x: number; y: number },
    params: GourdShapeParams
  ): 'W' | 'N' | 'I' | 'P' | 'outside'
  
  /**
   * 生成四象限分割线的 SVG paths
   */
  static generateQuadrantDividers(params: GourdShapeParams): {
    horizontal: string;
    vertical: string;
  }
}
```

### Task A5: 类型导出更新

更新 `types/index.ts`：

```typescript
export * from './grid.types';
export * from './player.types';
export * from './gourdCoordinate.types';   // 新增
export * from './visualAssets.types';        // 新增
```

## 与其他组的接口约定

| 接口 | 提供给 | 使用于 |
|------|--------|--------|
| `GourdCoordinate` | B+E | B组填充坐标，E组读取定位 |
| `GourdShapeParams` | B+E | B组定义每层形状，E组传入计算器 |
| `RenderableGourdMapTopology` | C→E | C组产出完整拓扑，E组消费渲染 |
| `CheckerboardBorder` | B→E | B组配置边框，E组渲染 |
| `QuadrantLabel` | B→E | B组配置W/N/I/P，E组渲染 |
| `CellVisualStyle` | B→E | B组配置格子外观，E组渲染 |
| `PathVisualStyle` | B→E | B组配置线路外观，E组渲染 |
| `GourdCoordinateCalculator` | E组 | E组调用进行坐标转换和SVG生成 |

## 验收标准

1. ✅ GourdCoordinate 类型完整（region/theta/radiusRatio/cartesian）
2. ✅ GourdShapeParams 可精确描述上圆+腰+下圆的葫芦外形
3. ✅ CheckerboardBorder 可描述橙黄白棋盘格边框
4. ✅ QuadrantLabel 可描述大号 W/N/I/P 象限标识
5. ✅ CellVisualStyle 支持 Boss 格 2.5 倍大小 + 三层光环
6. ✅ PathVisualStyle 支持曲线路径（curveTension 参数）
7. ✅ RenderableGourdMapTopology 包含所有渲染所需字段
8. ✅ GourdCoordinateCalculator 可执行坐标转换和SVG路径生成
9. ✅ 所有新类型从 types/index.ts 统一导出
