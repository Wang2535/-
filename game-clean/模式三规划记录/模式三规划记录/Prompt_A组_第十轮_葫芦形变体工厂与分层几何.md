# A组第十轮 — 葫芦形变体工厂 + 分层几何参数体系

## 🔴🔴🔴 第十轮核心任务：让每层地图的**形状**真正不同

## 背景

第九轮建立了完整的九层数据体系和游戏引擎，但存在一个**根本性缺陷**：

> **所有9层使用完全相同的葫芦形几何参数**
> - upperCircle: center(50,22), radius=18
> - lowerCircle: center(50,62), radius=35
> - connector: width=8
> - 所有层的格子数量(20)、分布、连接方式完全一致

这导致玩家切换层级时感觉"只是换了个皮肤颜色"，缺乏每层应有的独特空间感受。

## 本轮目标

建立 **GourdShapeFactory（葫芦形变体工厂）**，为9层各自生成独特的地图几何形状。

## 具体任务

### Task A1: ★★★ P0 — GourdShapeVariants 类型定义

**新建文件**: `src/tower-mode/types/gourdShapeVariants.types.ts`

```typescript
/**
 * 葫芦形变体类型系统
 * 每层地图不再使用固定的葫芦参数，而是通过变体工厂生成独特形状
 */

/** 变体类型枚举 */
export enum GourdShapeVariant {
  STANDARD = 'standard',           // 标准葫芦(L1基准)
  WIDE_LOWER = 'wide-lower',       // 下圆扩展(L2网络-节点簇)
  TRIPLE_RING = 'triple-ring',     // 三环嵌套(L3数据金库)
  SCATTERED = 'scattered',          // 分散街区(L4城市)
  ELONGATED = 'elongated',         // 长条传送带(L5智能工厂)
  HEX_FLAT = 'hex-flat',           // 扁平六角(L6移动终端)
  IRREGULAR = 'irregular',         // 不规则云状(L7云端平台)
  ASYMMETRIC = 'asymmetric',       // 不对称坍缩(L8未来实验室)
  EXPANDED_PALACE = 'expanded-palace', // 扩展宫殿(L9指挥中心)
}

/** 单层完整的形状配置 */
export interface LayerShapeConfig {
  /** 变体类型 */
  variant: GourdShapeVariant;
  
  /** 上圆区域配置 */
  upperCircle: {
    center: { x: number; y: number };
    radius: number;
    /** 形状变形: 1.0=正圆, <1.0=横向压扁, >1.0=纵向拉伸 */
    scaleX: number;
    scaleY: number;
    /** 旋转角度(度) */
    rotation: number;
    /** 圆周上的"缺口"(用于非完整圆) */
    arcStartAngle?: number;
    arcEndAngle?: number;
    cellCount: number;      // 上圆格子数
  };
  
  /** 连接通道配置 */
  connector: {
    width: number;
    /** 连接通道形状: 'straight' | 'curved' | 'zigzag' | 'spiral' */
    shape: 'straight' | 'curved' | 'zigzag' | 'spiral';
    cellCount: number;
    /** 曲率(仅curved模式) */
    curvature?: number;
  };
  
  /** 下圆区域配置 */
  lowerCircle: {
    center: { x: number; y: number };
    radiusX: number;   // 水平半径(允许椭圆)
    radiusY: number;   // 垂直半径(允许椭圆)
    /** 形状变形 */
    scaleX: number;
    scaleY: number;
    rotation: number;
    cellCount: number;  // 下圆格子数
    /** 特殊子区域划分(替代标准四象限) */
    subZones?: Array<{
      id: string;
      label: string;
      shape: 'sector' | 'rect' | 'polygon' | 'irregular';
      points?: Array<{ x: number; y: number }>;  // 多边形顶点(归一化0-100)
      startAngle?: number;
      endAngle?: number;
      color: string;
    }>;
  };

  /** 整体变形参数 */
  globalTransform: {
    /** 整体缩放 */
    scale: number;
    /** 整体倾斜(度) */
    skewX: number;
    skewY: number;
  };

  /** 该形状特有的视觉修饰 */
  visualModifiers: {
    /** 是否显示轮廓线 */
    showOutline: boolean;
    /** 轮廓线样式 */
    outlineStyle: 'solid' | 'dashed' | 'dotted' | 'glow' | 'crack';
    /** 内部网格线(六角迷宫等) */
    innerGrid?: {
      type: 'none' | 'hex' | 'square' | 'triangular' | 'radial';
      spacing: number;
      opacity: number;
      color: string;
    };
    /** 背景纹理 */
    bgTexture?: 'none' | 'circuit' | 'grid' | 'cloud' | 'quantum' | 'dataflow';
  };
}

/** 变体工厂输入参数 */
export interface ShapeFactoryInput {
  layerNumber: number;
  mechanicType: string;
  themeName: string;
  difficulty: number;  // 1-9
}
```

### Task A2: ★★★ P0 — GourdShapeFactory 工厂实现

**新建文件**: `src/tower-mode/geometry/GourdShapeFactory.ts`

```typescript
/**
 * GourdShapeFactory — 葫芦形变体工厂
 * 
 * 根据层数和机制类型，生成该层独有的地图几何形状。
 * 这是解决"所有层看起来一样"的核心方案。
 */

import { 
  GourdShapeVariant, LayerShapeConfig, ShapeFactoryInput 
} from '../types/gourdShapeVariants.types';

/** 9层预设形状配置 */
const LAYER_SHAPE_PRESETS: Record<number, () => LayerShapeConfig> = {
  1: () => createStandardGourd(),       // L1: 标准葫芦(基准)
  2: () => createWideLowerGourd(),      // L2: 宽底网络节点簇
  3: () => createTripleRingGourd(),     // L3: 三环嵌套数据金库
  4: () => createScatteredGourd(),      // L4: 分散式城市街区
  5: () => createElongatedGourd(),      // L5: 长条智能工厂
  6: () => createHexFlatGourd(),        // L6: 扁平六角移动终端
  7: () => createIrregularGourd(),      // L7: 不规则云端平台
  8: () => createAsymmetricGourd(),     // L8: 不对称坍缩实验室
  9: () => createExpandedPalaceGourd(), // L9: 扩展指挥宫殿
};

// ========== 各层形状生成函数 ==========

/** L1: 标准葫芦形（作为基准，与第九轮保持兼容）*/
function createStandardGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.STANDARD,
    upperCircle: {
      center: { x: 50, y: 20 }, radius: 17,
      scaleX: 1.0, scaleY: 1.0, rotation: 0,
      cellCount: 6,
    },
    connector: {
      width: 7, shape: 'straight', cellCount: 2,
    },
    lowerCircle: {
      center: { x: 50, y: 62 },
      radiusX: 34, radiusY: 34,
      scaleX: 1.0, scaleY: 1.0, rotation: 0,
      cellCount: 14,
      subZones: undefined, // 使用标准W/N/I/P四象限
    },
    globalTransform: { scale: 1.0, skewX: 0, skewY: 0 },
    visualModifiers: {
      showOutline: true, outlineStyle: 'solid',
      innerGrid: { type: 'none', spacing: 0, opacity: 0, color: '' },
      bgTexture: 'none',
    },
  };
}

/** L2: 宽底网络空间 — 下圆横向扩展+更密集的节点分布 */
function createWideLowerGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.WIDE_LOWER,
    upperCircle: {
      center: { x: 50, y: 18 }, radius: 15,
      scaleX: 1.0, scaleY: 0.9, rotation: 0,
      cellCount: 8,  // 上圆更多入口节点
    },
    connector: {
      width: 10, shape: 'curved', cellCount: 3, curvature: 0.15,
    },
    lowerCircle: {
      center: { x: 50, y: 63 },
      radiusX: 42, radiusY: 32,  // 横向显著扩展！
      scaleX: 1.25, scaleY: 0.95, rotation: 0,
      cellCount: 24,  // 更多格子！
      subZones: undefined,
    },
    globalTransform: { scale: 1.0, skewX: 0, skewY: 0 },
    visualModifiers: {
      showOutline: true, outlineStyle: 'glow',  // 网络发光效果
      innerGrid: { type: 'square', spacing: 8, opacity: 0.08, color: '#4488ff' },
      bgTexture: 'circuit',  // 电路板纹理！
    },
  };
}

/** L3: 数据金库 — 三环嵌套结构（外/中/内三圈） */
function createTripleRingGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.TRIPLE_RING,
    upperCircle: {
      center: { x: 50, y: 16 }, radius: 14,
      scaleX: 1.0, scaleY: 1.0, rotation: 0,
      cellCount: 4,
    },
    connector: {
      width: 6, shape: 'straight', cellCount: 2,
    },
    lowerCircle: {
      center: { x: 50, y: 64 },
      radiusX: 36, radiusY: 36,
      scaleX: 1.0, scaleY: 1.0, rotation: 0,
      cellCount: 18,
      // 三环子区域：外环(数据区) / 中环(处理区) / 内核(金库核心)
      subZones: [
        { id: 'outer', label: 'OUTER', shape: 'sector', startAngle: 0, endAngle: 360, color: '#8B7500' },
        { id: 'mid', label: 'MID', shape: 'sector', startAngle: 0, endAngle: 360, color: '#DAA520' },
        { id: 'core', label: 'CORE', shape: 'circle', color: '#FFD700' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: 0, skewY: 0 },
    visualModifiers: {
      showOutline: true, outlineStyle: 'solid',
      innerGrid: { type: 'radial', spacing: 10, opacity: 0.12, color: '#FFD700' },
      bgTexture: 'grid',  // 金库网格
    },
  };
}

/** L4: 城市街区 — 分散式多区块布局 */
function createScatteredGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.SCATTERED,
    upperCircle: {
      center: { x: 50, y: 20 }, radius: 16,
      scaleX: 1.0, scaleY: 0.95, rotation: 0,
      cellCount: 5,
    },
    connector: {
      width: 8, shape: 'zigzag', cellCount: 3,  // Z字形街道连接！
    },
    lowerCircle: {
      center: { x: 50, y: 62 },
      radiusX: 32, radiusY: 30,
      scaleX: 1.0, scaleY: 1.0, rotation: 0,
      cellCount: 20,
      // 街区式多边形分区：不是标准四象限而是不规则街块
      subZones: [
        { id: 'district-nw', label: 'NW', shape: 'polygon', 
          points: [{x:30,y:40},{x:48,y:42},{x:46,y:55},{x:28,y:52}], color: '#FF6B6B88' },
        { id: 'district-ne', label: 'NE', shape: 'polygon',
          points: [{x:52,y:42},{x:72,y:40},{x:74,y:52},{x:54,y:55}], color: '#4ECDC488' },
        { id: 'district-sw', label: 'SW', shape: 'polygon',
          points: [{x:28,y:55},{x:46,y:58},{x:44,y:75},{x:26,y:72}], color: '#9B59B688' },
        { id: 'district-se', label: 'SE', shape: 'polygon',
          points: [{x:54,y:58},{x:74,y:55},{x:76,y:72},{x:56,y:75}], color: '#F39C1288' },
      ],
    },
    globalTransform: { scale: 1.02, skewX: -2, skewY: 0 },  // 微倾斜增加动感
    visualModifiers: {
      showOutline: true, outlineStyle: 'dashed',  // 街道虚线
      innerGrid: { type: 'square', spacing: 12, opacity: 0.06, color: '#FF9800' },
      bgTexture: 'none',
    },
  };
}

/** L5: 智能工厂 — 长条形传送带布局 */
function createElongatedGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.ELONGATED,
    upperCircle: {
      center: { x: 50, y: 15 }, radius: 13,
      scaleX: 0.85, scaleY: 1.0, rotation: 0,
      cellCount: 4,
    },
    connector: {
      width: 12, shape: 'straight', cellCount: 4,  // 加长传送带！
    },
    lowerCircle: {
      center: { x: 50, y: 66 },
      radiusX: 28, radiusY: 24,
      scaleX: 1.0, scaleY: 0.75, rotation: 0,  // 纵向压扁→长条形！
      cellCount: 16,
      subZones: [
        // 流水线四区：上料(W) → 加工(S) → 检测(N) → 出货(D)
        { id: 'loading', label: 'W', shape: 'rect', color: '#FF6B6B88' },
        { id: 'processing', label: 'S', shape: 'rect', color: '#64C86488' },
        { id: 'inspection', label: 'N', shape: 'rect', color: '#4ECDC488' },
        { id: 'shipping', label: 'D', shape: 'rect', color: '#E74C3C88' },
      ],
    },
    globalTransform: { scale: 1.05, skewX: 0, skewY: 0 },
    visualModifiers: {
      showOutline: true, outlineStyle: 'solid',
      innerGrid: { type: 'square', spacing: 6, opacity: 0.1, color: '#4CAF50' },
      bgTexture: 'dataflow',  // 数据流纹理暗示传送带
    },
  };
}

/** L6: 移动终端 — 扁平六角迷宫（最独特的形状！） */
function createHexFlatGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.HEX_FLAT,
    upperCircle: {
      center: { x: 50, y: 25 }, radius: 14,
      scaleX: 1.3, scaleY: 0.65, rotation: 0,  // 横向拉伸+纵向压扁=扁平！
      cellCount: 6,
    },
    connector: {
      width: 14, shape: 'curved', cellCount: 3, curvature: 0.25,
    },
    lowerCircle: {
      center: { x: 50, y: 64 },
      radiusX: 38, radiusY: 22,  // 显著扁平化！
      scaleX: 1.35, scaleY: 0.58, rotation: -3,  // 轻微旋转增加迷路感
      cellCount: 22,  // 更多格子=更复杂的迷宫
      subZones: [
        // 六角分区而非四象限
        { id: 'hex-1', label: 'H1', shape: 'polygon', color: '#FF6B6B66' },
        { id: 'hex-2', label: 'H2', shape: 'polygon', color: '#4ECDC466' },
        { id: 'hex-3', label: 'H3', shape: 'polygon', color: '#9B59B666' },
        { id: 'hex-4', label: 'H4', shape: 'polygon', color: '#F39C1266' },
        { id: 'hex-5', label: 'H5', shape: 'polygon', color: '#E74C3C66' },
        { id: 'hex-6', label: 'H6', shape: 'polygon', color: '#3498DB66' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: 3, skewY: 0 },  // 轻微斜切
    visualModifiers: {
      showOutline: true, outlineStyle: 'glow',
      innerGrid: { type: 'hex', spacing: 10, opacity: 0.15, color: '#00BCD4' },  // 六角网格！！
      bgTexture: 'none',
    },
  };
}

/** L7: 云端平台 — 不规则云状边缘 */
function createIrregularGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.IRREGULAR,
    upperCircle: {
      center: { x: 50, y: 22 }, radius: 16,
      scaleX: 1.0, scaleY: 0.85, rotation: 5,  // 轻微旋转=云朵飘浮感
      cellCount: 5,
      arcStartAngle: -30,  // 缺口=不完整圆
      arcEndAngle: 210,
    },
    connector: {
      width: 9, shape: 'curved', cellCount: 2, curvature: 0.2,
    },
    lowerCircle: {
      center: { x: 50, y: 63 },
      radiusX: 34, radiusY: 30,
      scaleX: 1.08, scaleY: 0.92, rotation: -2,
      cellCount: 16,
      subZones: [
        // 云朵状不规则区域
        { id: 'cloud-w', label: 'W', shape: 'irregular', color: '#FF6B6B55' },
        { id: 'cloud-n', label: 'N', shape: 'irregular', color: '#4ECDC455' },
        { id: 'cloud-i', label: 'I', shape: 'irregular', color: '#9B59B655' },
        { id: 'cloud-p', label: 'P', shape: 'irregular', color: '#F39C1255' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: -1, skewY: 2 },
    visualModifiers: {
      showOutline: true, outlineStyle: 'dotted',  // 云朵虚线边
      innerGrid: { type: 'none', spacing: 0, opacity: 0, color: '' },
      bgTexture: 'cloud',  // 云朵纹理！
    },
  };
}

/** L8: 未来实验室 — 不对称坍缩结构 */
function createAsymmetricGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.ASYMMETRIC,
    upperCircle: {
      center: { x: 48, y: 20 },  // 中心偏左！
      radius: 15,
      scaleX: 0.92, scaleY: 1.05, rotation: -4,
      cellCount: 5,
    },
    connector: {
      width: 7, shape: 'zigzag', cellCount: 2,  // 曲折连接=不稳定感
    },
    lowerCircle: {
      center: { x: 53, y: 64 },  // 中心偏右！(与上圆不对齐=不对称)
      radiusX: 30, radiusY: 36,  // 高>宽！纵向拉长
      scaleX: 0.88, scaleY: 1.12, rotation: 5,
      cellCount: 15,
      subZones: [
        { id: 'stable', label: 'STABLE', shape: 'sector', startAngle: 200, endAngle: 340, color: '#4ECDC488' },
        { id: 'collapse', label: 'COLLAPSE', shape: 'sector', startAngle: 340, endAngle: 200, color: '#FF444466' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: 4, skewY: -2 },  // 明显倾斜=坍缩感
    visualModifiers: {
      showOutline: true, outlineStyle: 'crack',  // 裂纹边框！！
      innerGrid: { type: 'triangular', spacing: 14, opacity: 0.08, color: '#9C27B0' },
      bgTexture: 'quantum',  // 量子粒子纹理
    },
  };
}

/** L9: 指挥中心 — 扩展宫殿式终极形态 */
function createExpandedPalaceGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.EXPANDED_PALACE,
    upperCircle: {
      center: { x: 50, y: 14 }, radius: 20,  // 更大的上圆=王座厅
      scaleX: 1.0, scaleY: 0.85, rotation: 0,
      cellCount: 8,
    },
    connector: {
      width: 14, shape: 'straight', cellCount: 4,  // 宽敞大道
    },
    lowerCircle: {
      center: { x: 50, y: 64 },
      radiusX: 40, radiusY: 38,  // 最大的下圆=主殿
      scaleX: 1.1, scaleY: 1.05, rotation: 0,
      cellCount: 20,
      subZones: [
        // 宫殿式分区
        { id: 'throne', label: 'THRONE', shape: 'sector', startAngle: 300, endAngle: 60, color: '#FFD70044' },
        { id: 'left-wing', label: 'L-WING', shape: 'sector', startAngle: 60, endAngle: 150, color: '#9B59B633' },
        { id: 'right-wing', label: 'R-WING', shape: 'sector', startAngle: 150, endAngle: 240, color: '#9B59B633' },
        { id: 'entrance', label: 'GATE', shape: 'sector', startAngle: 240, endAngle: 300, color: '#E74C3C33' },
      ],
    },
    globalTransform: { scale: 1.08, skewX: 0, skewY: 0 },  // 整体放大
    visualModifiers: {
      showOutline: true, outlineStyle: 'glow',  // 金色光晕
      innerGrid: { type: 'radial', spacing: 8, opacity: 0.06, color: '#FFD700' },
      bgTexture: 'none',
    },
  };
}

// ========== 工厂主体 ==========

export class GourdShapeFactory {

  static generate(input: ShapeFactoryInput): LayerShapeConfig {
    const presetFn = LAYER_SHAPE_PRESETS[input.layerNumber];
    if (!presetFn) {
      console.warn(`[GourdShapeFactory] No shape preset for layer ${input.layerNumber}, falling back to standard`);
      return createStandardGourd();
    }
    const config = presetFn();
    
    // 应用难度微调: 高难度层略微缩小(增加拥挤感)
    const difficultyScale = 1 - (input.difficulty - 1) * 0.015;
    config.globalTransform.scale *= difficultyScale;

    return config;
  }

  static getAllPresets(): Record<number, LayerShapeConfig> {
    const result: Record<number, LayerShapeConfig> = {};
    for (let i = 1; i <= 9; i++) {
      result[i] = this.generate({
        layerNumber: i,
        mechanicType: '',
        themeName: '',
        difficulty: i,
      });
    }
    return result;
  }

  static getVariantName(layerNumber: number): string {
    const names: Record<number, string> = {
      1: '标准葫芦', 2: '宽底网络', 3: '三环金库', 4: '分散街区',
      5: '长条工厂', 6: '扁平六角', 7: '不规则云端', 8: '不对称坍缩', 9: '扩展宫殿',
    };
    return names[layerNumber] ?? '未知';
  }
}
```

### Task A3: ★★☆ P1 — GourdOutlineRenderer 形状渲染器适配

**修改文件**: `src/tower-mode/components/GourdMapRenderer/index.tsx`

在现有的 `gourdOutline` 计算逻辑中，增加对 `LayerShapeConfig` 的支持：

```tsx
// 在 GourdMapRenderer 中新增 prop:
interface GourdMapRendererPropsV10 extends GourdMapRendererPropsV9 {
  shapeConfig?: LayerShapeConfig;  // A组的新形状配置
}

// 替换原有的 gourdOutline 计算逻辑:
const gourdOutline = useMemo(() => {
  if (shapeConfig) {
    // 使用变体形状配置生成outline
    return generateVariantOutline(shapeConfig);
  }
  // 回退到原有逻辑
  return generateStandardOutline(topology);
}, [topology, shapeConfig]);

// 新增变体outline生成函数:
function generateVariantOutline(config: LayerShapeConfig) {
  const uc = config.upperCircle;
  const lc = config.lowerCircle;
  const conn = config.connector;

  // 上圆路径（支持scaleX/scaleY变形和rotation）
  const upperPath = generateEllipsePath(
    uc.center.x, uc.center.y, uc.radius * uc.scaleX, uc.radius * uc.scaleY, uc.rotation
  );

  // 下圆路径（支持独立的radiusX/radiusY）
  const lowerPath = generateEllipsePath(
    lc.center.x, lc.center.y, lc.radiusX * lc.scaleX, lc.radiusY * lc.scaleY, lc.rotation
  );

  // 连接通道路径（支持不同shape）
  let connPath: string;
  switch (conn.shape) {
    case 'zigzag':
      connPath = generateZigzagConnector(uc, lc, conn.width);
      break;
    case 'curved':
      connPath = generateCurvedConnector(uc, lc, conn.width, conn.curvature ?? 0.1);
      break;
    case 'spiral':
      connPath = generateSpiralConnector(uc, lc, conn.width);
      break;
    default:
      connPath = generateStraightConnector(uc, lc, conn.width);
  }

  return { upperD: upperPath, lowerD: lowerPath, connD: connPath };
}
```

### Task A4: ★★☆ P1 — InnerGridRenderer 内部网格渲染器

**新建文件**: `src/tower-mode/components/GourdMapRenderer/InnerGridLayer.tsx`

为L6(六角)/L8(三角)/L2(方格)/L3(放射)等需要内部网格的层提供可视化：

```tsx
/**
 * InnerGridLayer — 地图内部网格渲染
 * 
 * 根据 LayerShapeConfig.visualModifiers.innerGrid 配置，
 * 渲染不同类型的内部辅助网格线：
 * - hex: 六角蜂窝网格（L6移动终端）
 * - square: 方格网格（L2网络/L5工厂）
 * - triangular: 三角网格（L8未来实验室）
 * - radial: 放射网格（L3数据金库）
 */

export function InnerGridLayer({ config }: { config: LayerShapeConfig }) {
  const grid = config.visualModifiers.innerGrid;
  if (!grid || grid.type === 'none') return null;

  return (
    <g className="inner-grid-layer" opacity={grid.opacity}>
      {grid.type === 'hex' && <HexGrid spacing={grid.spacing} color={grid.color} bounds={config.lowerCircle} />}
      {grid.type === 'square' && <SquareGrid spacing={grid.spacing} color={grid.color} bounds={config.lowerCircle} />}
      {grid.type === 'triangular' && <TriangularGrid spacing={grid.spacing} color={grid.color} bounds={config.lowerCircle} />}
      {grid.type === 'radial' && <RadialGrid spacing={grid.spacing} color={grid.color} center={config.lowerCircle.center} />}
    </g>
  );
}
```

## 第十轮A组改动总览

| 任务 | 对应Gap | 改动内容 | 文件 |
|------|---------|---------|------|
| **A1** | Gap-P0-1基础 | GourdShapeVariant枚举 + LayerShapeConfig接口 + 9种变体定义 | gourdShapeVariants.types.ts (新) |
| **A2** | **Gap-P0-1核心** | GourdShapeFactory工厂类 + 9个独立形状生成函数 | GourdShapeFactory.ts (新) |
| **A3** | Gap-P0-2 | GourdMapRenderer适配新形状配置 + 变体outline生成 | index.tsx (修改) |
| **A4** | Gap-P0-3 | InnerGridLayer内部网格渲染(六角/方格/三角/放射) | InnerGridLayer.tsx (新) |

## 验收标准

1. ✅ `GourdShapeFactory.generate({layerNumber:6})` 返回 `variant: 'hex-flat'` 的配置
2. ✅ L6的 lowerCircle scaleX=1.35, scaleY=0.58（明显扁平）
3. ✅ L8的 upperCircle.center.x ≠ lowerCircle.center.x（不对称）
4. ✅ L9的 lowerCircle radiusX=40, radiusY=38（最大）
5. ✅ L3包含3个子区域(outer/mid/core)而非标准W/N/I/P
6. ✅ L4包含4个polygon子区域(不规则街块)
7. ✅ L5的 connector.shape='zigzag'
8. ✅ L6的 innerGrid.type='hex'
9. ✅ L8的 outlineStyle='crack'(裂纹效果)
9. ✅ TypeScript 编译零错误
