# B组第八轮 — 9层视觉数据全面重写（数据层彻底修正）

## 🔴 当前问题诊断

通过逐行阅读 `L1_visualData.ts`（以及其他8层数据文件），发现以下**致命数据缺陷**：

### 缺陷1：象限标识字段名和值全部错误

```typescript
// 当前错误写法 ❌
quadrantLabels: [
  { position: 'top-left',    text: 'W', fontSizeRatio: 0.15 },  // 字段名错!
  { position: 'top-right',   text: 'N', fontSizeRatio: 0.15 },  // 值太小!
  { position: 'bottom-left', text: 'I', fontSizeRatio: 0.15 },
  { position: 'bottom-right',text: 'P', fontSizeRatio: 0.15 },
]
```

**问题**：
- `position` 应为 `quadrant`（与 QuadrantLabelV2 类型匹配）
- `fontSizeRatio: 0.15` 太小！E组渲染时 `fontSize = radius * 2 * 0.15`，在100x100 viewbox中只有约 **4-5单位**——几乎不可见
- 缺少 `strokeColor`, `fontFamily`, `shadowColor`, `shadowBlur` 等全部新字段

### 缺陷2：边框缺少 mode 字段

```typescript
// 当前 ❌ — 没有 mode 字段！E组无法判断用哪种边框模式
border: {
  enabled: true,
  borderWidth: 8,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 16,
  borderRadius: 20,
}
```

### 缺陷3：图标是 Emoji/单字符而非 SVG 引用

```typescript
// 当前 ❌ — 直接硬编码了 emoji
cellVisualStyles: {
  start:     { icon: '▶' },
  battle:    { icon: '⚔' },
  chance:    { icon: '?' },
  bookstore:  { icon: '📖' },
  skill:     { icon: '⚡' },
  boss:      { icon: '💀' },
}
```

**应该改为**: `{ icon: { type: 'svg', data: '' } }` —— data留空由E组从GRID_ICONS获取

### 缺陷4：缺少 animationClass 字段

当前没有任何格子样式包含 `animationClass`，导致Boss无登场动画、精英格无抖动。

### 缺陷5：decorations 数据过于简陋

```typescript
// 当前 ❌ — 只有1个装饰元素且信息不全
decorations: [{ type: 'virus', position: { x: 0.2, y: 0.8 }, size: 0.05, opacity: 0.2 }]
```

---

## 任务目标

**B组第八轮的核心使命：将全部9层的 visualData 从"第七轮占位版本"升级为"第八轮生产版本"。每一个字段都必须使用 A 组定义的 V2 类型，每个数值都必须精确符合设想要求。**

> **边界说明**：
> - B组只负责**数据文件**（L1~L9_visualData.ts）
> - B组不修改类型定义（那是A组的事）
> - B组不修改渲染逻辑（那是E组的事）
> - B组的产出必须是**可直接被 C 组 assembleFullTopology 消费的数据**

## 具体任务

### Task B1：重写 L1_visualData.ts 为完整模板

**直接覆写** `src/tower-mode/data/layers/L1_visualData.ts`：

```typescript
import { GourdRegion } from './gourdShapes';
import type { GourdCoordinate } from './gourdShapes';
import { LAYER_GOURD_SHAPES } from './gourdShapes';

/**
 * 第一层：病毒实验室 — 葫芦形变体（培养皿扩散型）
 * 
 * 视觉主题：深绿+暗红生物感，上圆(起点)偏暗绿，下圆(Boss)偏暗红
 * 区域划分：上环N区域，下环左半W区域+右半S区域，核心D区域
 */

export const L1_VISUAL_DATA: Record<string, any> = {

  // ========== 1. 边框配置（必须含 mode 字段）==========
  border: {
    enabled: true,
    mode: 'checkerboard-fill',        // ★ 第八轮新增：方格填充模式
    borderWidth: 10,                    // 边框总宽度(px)
    colors: ['#FFAA00', '#FFFFFF'],    // 橙黄白交替
    tileSize: 12,                      // 单个方格大小(px)
    innerPadding: 2,                   // ★ 新增
    cornerRadius: 3,                   // ★ 新增：方格圆角
    opacity: 0.85,                     // ★ 新增：整体透明度
    glowColor: 'rgba(255,170,0,0.4)', // ★ 新增：外发光
  },

  // ========== 2. 象限标识 W/N/I/P（必须用 V2 全部字段）==========
  quadrantLabels: [
    // W — 虚弱区（左上，橙红色）
    {
      quadrant: 'W',                   // ★ 用 quadrant 不是 position
      label: 'W',
      fontSizeRatio: 0.22,             // ★ 从0.15提升到0.22（关键改动！）
      color: '#FF6B6B',               // 设想原文: "淡红色覆盖"
      fontWeight: '900',
      fontFamily: '"Arial Black", "Impact", sans-serif', // ★ 新增
      backgroundColor: 'transparent',  // 去掉背景色
      backgroundOpacity: 0,
      strokeColor: '#FFFFFF',          // ★ 新增：白色描边
      strokeWidth: 0.8,                // ★ 新增
      shadowColor: '#000000',          // ★ 新增
      shadowBlur: 3,                   // ★ 新增
      shadowOffsetX: 1,                // ★ 新增
      shadowOffsetY: 1,                // 新增
      enableShadow: true,              // ★ 新增
    },
    // N — 知识区（右上，青蓝色）
    {
      quadrant: 'N',
      label: 'N',
      fontSizeRatio: 0.22,
      color: '#4ECDC4',               // 设想原文: "淡蓝色覆盖"
      fontWeight: '900',
      fontFamily: '"Arial Black", "Impact", sans-serif',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      strokeColor: '#FFFFFF',
      strokeWidth: 0.8,
      shadowColor: '#000000',
      shadowBlur: 3,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      enableShadow: true,
    },
    // I — 反转区（左下，紫色调）— L1可能没有I区但保留模板
    {
      quadrant: 'I',
      label: 'I',
      fontSizeRatio: 0.22,
      color: '#9B59B6',               // 设想原文: "淡紫色覆盖"
      fontWeight: '900',
      fontFamily: '"Arial Black", "Impact", sans-serif',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      strokeColor: '#FFFFFF',
      strokeWidth: 0.8,
      shadowColor: '#000000',
      shadowBlur: 3,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      enableShadow: true,
    },
    // P — 跳过区（右下，金黄色）
    {
      quadrant: 'P',
      label: 'P',
      fontSizeRatio: 0.22,
      color: '#F39C12',              // 设想原文: "淡黄色覆盖"
      fontWeight: '900',
      fontFamily: '"Arial Black", "Impact", sans-serif',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      strokeColor: '#FFFFFF',
      strokeWidth: 0.8,
      shadowColor: '#000000',
      shadowBlur: 3,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      enableShadow: true,
    },
  ],

  // ========== 3. 格子视觉样式（必须含 animationClass + SVG图标引用）==========
  cellVisualStyles: {
    start: {
      shape: 'circle',
      sizeMultiplier: 1.2,
      fillColor: '#1a3a1a',
      strokeColor: '#44ff88',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },       // ★ 改为SVG类型，data留空
      glowEffect: { color: '#44ff88', size: 10, pulse: true },
      animationClass: undefined,
    },
    battle: {
      shape: 'hexagon',                       // ★ 设想要求："六角形格子"
      sizeMultiplier: 1.0,
      fillColor: '#3a1a1a',
      strokeColor: '#ff6644',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#ff6644', size: 6, pulse: false },
      animationClass: undefined,
    },
    chance: {
      shape: 'diamond',                       // ★ 设想要求："圆形格子" → diamond更独特
      sizeMultiplier: 0.95,
      fillColor: '#3a1a3a',
      strokeColor: '#cc66ff',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#cc66ff', size: 10, pulse: true },
      animationClass: 'gm-pulse-orange',      // ★ 新增：待处理脉动
    },
    opportunity: {
      shape: 'circle',
      sizeMultiplier: 0.95,
      fillColor: '#3a2a1a',
      strokeColor: '#ffcc44',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#ffcc44', size: 10, pulse: true },
      animationClass: 'gm-pulse-orange',
    },
    bookstore: {
      shape: 'roundedRect',                  // ★ 设想要求："方形格子"
      sizeMultiplier: 1.0,
      fillColor: '#1a2a4a',
      strokeColor: '#44aaff',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#44aaff', size: 8, pulse: false },
      animationClass: undefined,
    },
    skill: {
      shape: 'hexagon',                       // ★ 设想要求："菱形格子"
      sizeMultiplier: 1.0,
      fillColor: '#2a1a4a',
      strokeColor: '#aa44ff',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#aa44ff', size: 8, pulse: true },
      animationClass: undefined,
    },
    exchange: {
      shape: 'ellipse',
      sizeMultiplier: 1.0,
      fillColor: '#1a3a2a',
      strokeColor: '#44ffaa',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#44ffaa', size: 6, pulse: false },
      animationClass: undefined,
    },
    transition: {
      shape: 'circle',
      sizeMultiplier: 0.95,
      fillColor: '#1a2a3a',
      strokeColor: '#8888ff',
      strokeWidth: 1.5,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#8888ff', size: 5, pulse: true },
      animationClass: undefined,
    },
    special: {
      shape: 'star',
      sizeMultiplier: 1.0,
      fillColor: '#3a3a1a',
      strokeColor: '#ffdd44',
      strokeWidth: 2,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#ffdd44', size: 12, pulse: true },
      animationClass: undefined,
    },
    elite: {
      shape: 'circle',
      sizeMultiplier: 1.2,                   // ★ 精英比普通大20%
      fillColor: '#4a1a00',
      strokeColor: '#ff0000',
      strokeWidth: 3,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#ff3333', size: 10, pulse: false },
      animationClass: 'gm-elite-jagged',      // ★ 锯齿抖动动画
    },
    boss: {
      shape: 'circle',
      sizeMultiplier: 2.5,                   // ★ 必须=2.5！（设想原文明确要求）
      fillColor: '#4a0a0a',
      strokeColor: '#ff0000',
      strokeWidth: 4,
      icon: { type: 'svg', data: '' },
      glowEffect: { color: '#ff3333', size: 28, pulse: true },
      animationClass: 'gm-boss-emerge',      // ★ Boss登场动画
    },
    locked: {
      shape: 'circle',
      sizeMultiplier: 0.85,
      fillColor: '#1a1a1a',
      strokeColor: '#555555',
      strokeWidth: 1,
      icon: { type: 'svg', data: '' },
      glowEffect: undefined,
      animationClass: undefined,
    },
  },

  // ========== 4. 格子状态视觉覆盖 ==========
  stateVisualOverrides: {
    locked:   { opacity: 0.35, filter: 'grayscale(0.9)', strokeDashArray: '4,4', animationClass: undefined },
    pending:  { opacity: 0.75, filter: 'none',     strokeDashArray: 'none', animationClass: 'gm-pulse-orange' },
    current:  { opacity: 1.0,  filter: 'drop-shadow(0 0 10px rgba(68,255,136,0.8))', strokeDashArray: 'none', animationClass: 'gm-glow-current' },
    cleared:  { opacity: 0.65, filter: 'grayscale(0.4)', strokeDashArray: 'none', animationClass: 'gm-shimmer-gold' },
    failed:   { opacity: 0.5,  filter: 'grayscale(0.8) brightness(0.7) sepia(0.3)', strokeDashArray: '2,2', animationClass: undefined },
  },

  // ========== 5. 路径视觉样式 ==========
  pathVisualStyles: {
    main:     { strokeColor: '#FFAA00', strokeWidth: 2.5, curveTension: 0.45, dashArray: 'none',     animated: true  },
    branch:   { strokeColor: '#777777', strokeWidth: 1.5, curveTension: 0.35, dashArray: '6,3',     animated: false },
    shortcut: { strokeColor: '#00FF88', strokeWidth: 2.0, curveTension: 0.50, dashArray: '4,4',     animated: true  },
    return:   { strokeColor: '#FF6B6B', strokeWidth: 1.2, curveTension: 0.25, dashArray: '10,5',    animated: false },
    crossRing:{ strokeColor: '#888888', strokeWidth: 1.0, curveTension: 0.30, dashArray: '3,3',     animated: false },
    safeDoor: { strokeColor: '#44ff88', strokeWidth: 1.5, curveTension: 0.30, dashArray: 'none',    animated: true  },
    backflow: { strokeColor: '#FF4444', strokeWidth: 1.0, curveTension: 0.20, dashArray: '8,4',     animated: false },
  },

  // ========== 6. 区域背景配置（V2扩展版）==========
  zoneBackgrounds: {
    W: {
      fillColor: 'rgba(255,107,107,0.12)',
      pattern: 'stripes',
      patternColor: 'rgba(255,107,107,0.25)',
      enterAnimClass: 'gm-zone-w-enter',         // ★ 新增
      ambientAnimClass: undefined,
      centerPosition: { x: 0.35, y: 0.52 },      // ★ 新增：左上象限中心
      shape: 'quadrant',                         // ★ 新增
    },
    N: {
      fillColor: 'rgba(78,205,196,0.12)',
      pattern: 'dots',
      patternColor: 'rgba(78,205,196,0.25)',
      enterAnimClass: 'gm-zone-n-enter',
      ambientAnimClass: undefined,
      centerPosition: { x: 0.65, y: 0.52 },
      shape: 'quadrant',
    },
    I: {
      fillColor: 'rgba(155,89,182,0.12)',
      pattern: 'crosshatch',
      patternColor: 'rgba(155,89,182,0.25)',
      enterAnimClass: 'gm-zone-i-enter',
      ambientAnimClass: undefined,
      centerPosition: { x: 0.35, y: 0.72 },
      shape: 'quadrant',
    },
    P: {
      fillColor: 'rgba(243,156,18,0.12)',
      pattern: 'waves',
      patternColor: 'rgba(243,156,18,0.25)',
      enterAnimClass: 'gm-zone-p-enter',
      ambientAnimClass: undefined,
      centerPosition: { x: 0.65, y: 0.72 },
      shape: 'quadrant',
    },
    D: {
      fillColor: 'rgba(231,76,60,0.10)',
      pattern: 'zigzag',
      patternColor: 'rgba(231,76,60,0.22)',
      enterAnimClass: 'gm-zone-d-enter',
      ambientAnimClass: undefined,
      centerPosition: { x: 0.50, y: 0.62 },
      shape: 'quadrant',
    },
    S: {
      fillColor: 'rgba(46,204,113,0.10)',
      pattern: 'dots',
      patternColor: 'rgba(46,204,113,0.22)',
      enterAnimClass: 'gm-zone-s-enter',
      ambientAnimClass: undefined,
      centerPosition: { x: 0.50, y: 0.42 },
      shape: 'quadrant',
    },
  },

  // ========== 7. 背景配置 ==========
  background: {
    primary: '#0a1a0f',                     // 深绿黑色基调（病毒实验室主题）
    secondary: '#0d2015',
    texture: 'noise',
    gradientAngle: 180,

    // ★ 装饰元素大幅扩充
    decorations: [
      // 上圆中央 — 病毒星球
      {
        type: 'planet',
        position: { x: 0.50, y: 0.15 },    // 上圆圆心附近
        size: 0.08,
        rotation: 0,
        opacity: 0.35,
        color: '#44ff88',                   // 绿色发光病毒球
        animClass: 'gm-decor-float',
      },
      // 上圆周围 — 小型病毒粒子
      { type: 'crystal', position: { x: 0.38, y: 0.10 }, size: 0.02, opacity: 0.2, color: '#88ffaa', animClass: 'gm-decor-float' },
      { type: 'crystal', position: { x: 0.62, y: 0.12 }, size: 0.025, opacity: 0.18, color: '#88ffaa', animClass: 'gm-decor-float' },
      { type: 'crystal', position: { x: 0.42, y: 0.22 }, size: 0.018, opacity: 0.15, color: '#66dd88', animClass: 'gm-decor-float' },
      // 下圆边缘 — 数据流线条
      { type: 'data-stream', position: { x: 0.15, y: 0.60 }, size: 0.06, opacity: 0.12, color: '#4488ff' },
      { type: 'data-stream', position: { x: 0.85, y: 0.58 }, size: 0.05, opacity: 0.10, color: '#4488ff' },
      // 连接通道 — 微光粒子
      { type: 'crystal', position: { x: 0.48, y: 0.32 }, size: 0.015, opacity: 0.2, color: '#ffaa44' },
      { type: 'crystal', position: { x: 0.52, y: 0.34 }, size: 0.015, opacity: 0.2, color: '#ffaa44' },
    ],
  },

  // ========== 8. 葫芦坐标数据（保持不变）==========
  gourdCoordinates: {
    U0: { region: GourdRegion.UPPER_CIRCLE, theta: -1.5708, radiusRatio: 0.8, cartesian: { x: 0.5, y: 0.05 } },
    U1: { region: GourdRegion.UPPER_CIRCLE, theta: -0.5236, radiusRatio: 0.8, cartesian: { x: 0.6039, y: 0.1 } },
    U2: { region: GourdRegion.UPPER_CIRCLE, theta: 0.5236, radiusRatio: 0.8, cartesian: { x: 0.6039, y: 0.2 } },
    U3: { region: GourdRegion.UPPER_CIRCLE, theta: 1.5708, radiusRatio: 0.8, cartesian: { x: 0.5, y: 0.25 } },
    U4: { region: GourdRegion.UPPER_CIRCLE, theta: 2.618, radiusRatio: 0.8, cartesian: { x: 0.3961, y: 0.2 } },
    U5: { region: GourdRegion.UPPER_CIRCLE, theta: 3.6652, radiusRatio: 0.8, cartesian: { x: 0.3961, y: 0.1 } },
    C0: { region: GourdRegion.CONNECTOR, theta: -1.5708, radiusRatio: 0.5, cartesian: { x: 0.48, y: 0.32 } },
    C1: { region: GourdRegion.CONNECTOR, theta: 1.5708, radiusRatio: 0.5, cartesian: { x: 0.52, y: 0.32 } },
    L0:  { region: GourdRegion.LOWER_CIRCLE, theta: 0.6354, radiusRatio: 0.3, cartesian: { x: 0.3854, y: 0.503 } },
    L1:  { region: GourdRegion.LOWER_CIRCLE, theta: 0.9354, radiusRatio: 0.4, cartesian: { x: 0.3849, y: 0.515 } },
    L2:  { region: GourdRegion.LOWER_CIRCLE, theta: 1.2354, radiusRatio: 0.5, cartesian: { x: 0.3773, y: 0.5277 } },
    L3:  { region: GourdRegion.LOWER_CIRCLE, theta: 2.2062, radiusRatio: 0.3, cartesian: { x: 0.6213, y: 0.5083 } },
    L4:  { region: GourdRegion.LOWER_CIRCLE, theta: 2.5062, radiusRatio: 0.4, cartesian: { x: 0.6062, y: 0.5079 } },
    L6:  { region: GourdRegion.LOWER_CIRCLE, theta: 3.777, radiusRatio: 0.3, cartesian: { x: 0.3346, y: 0.697 } },
    L7:  { region: GourdRegion.LOWER_CIRCLE, theta: 4.077, radiusRatio: 0.4, cartesian: { x: 0.3351, y: 0.685 } },
    L9:  { region: GourdRegion.LOWER_CIRCLE, theta: 5.3478, radiusRatio: 0.3, cartesian: { x: 0.6587, y: 0.6917 } },
    L10: { region: GourdRegion.LOWER_CIRCLE, theta: 5.6478, radiusRatio: 0.4, cartesian: { x: 0.6738, y: 0.6921 } },
    L11: { region: GourdRegion.LOWER_CIRCLE, theta: 5.9478, radiusRatio: 0.5, cartesian: { x: 0.6896, y: 0.6982 } },
  } as Record<string, GourdCoordinate>,
};
```

### Task B2：L2~L9 数据修正要点清单

对 **每一层** 的 visualData 文件执行以下统一修改：

#### 必须修改的字段（每层都要改）

| # | 字段路径 | 当前典型值 | 目标值 | 说明 |
|---|---------|-----------|--------|------|
| 1 | `border.mode` | **不存在** | `'checkerboard-fill'` | 必须添加 |
| 2 | `border.innerPadding` | 不存在 | `2` | 必须添加 |
| 3 | `border.cornerRadius` | 存在但含义不同 | `3` | 重命名/确认 |
| 4 | `border.opacity` | 不存在 | `0.85` | 必须添加 |
| 5 | `border.glowColor` | 不存在 | `'rgba(255,170,0,0.4)'` | 必须添加 |
| 6 | `quadrantLabels[*].quadrant` | `position: 'top-left'` 等 | `quadrant: 'W'` 等 | **字段名修改** |
| 7 | `quadrantLabels[*].fontSizeRatio` | `0.15` | `0.22` | **关键数值修改** |
| 8 | `quadrantLabels[*].fontFamily` | 不存在 | `'"Arial Black"...'` | 必须添加 |
| 9 | `quadrantLabels[*].strokeColor` | 不存在 | `'#FFFFFF'` | 必须添加 |
| 10 | `quadrantLabels[*].strokeWidth` | 不存在 | `0.8` | 必须添加 |
| 11 | `quadrantLabels[*].shadow*` (4个) | 不存在 | 见L1模板 | 必须添加 |
| 12 | `cellVisualStyles.*.icon` | `'⚔'` / `'📖'` 等 | `{type:'svg',data:''}` | **格式完全改变** |
| 13 | `cellVisualStyles.boss.animationClass` | 不存在 | `'gm-boss-emerge'` | 必须添加 |
| 14 | `cellVisualStyles.boss.sizeMultiplier` | 应已有 | 确认=`2.5` | 验证 |
| 15 | `cellVisualStyles.elite.animationClass` | 不存在 | `'gm-elite-jagged'` | 必须添加 |
| 16 | `cellVisualStyles.chance.animationClass` | 不存在 | `'gm-pulse-orange'` | 必须添加 |
| 17 | `stateVisualOverrides.*.animationClass` | 不存在 | 对应 `gm-*` 类名 | 必须添加 |
| 18 | `zoneBackgrounds.*.enterAnimClass` | 不存在 | 对应 `gm-zone-*-enter` | 必须添加 |
| 19 | `zoneBackgrounds.*.centerPosition` | 不存在 | 各象限归一化坐标 | 必须添加 |
| 20 | `zoneBackgrounds.*.shape` | 不存在 | `'quadrant'` | 必须添加 |

#### 按层差异化的配置

| 层级 | 主题 | background.primary | 装饰元素主题 | quadrantLabels颜色微调 |
|------|------|-------------------|-------------|---------------------|
| L1 | 病毒实验室 | `#0a1a0f` | virus planet + crystal | W=#FF6B6B N=#4ECDC4 |
| L2 | 网络空间 | `#0a0f1a` | node cluster + data-stream | 外环S/W 内环N |
| L3 | 数据金库 | `#0f0a1a` | vault rings + shield | 外圈W 中圈N 内圈D |
| L4 | 城市街区 | `#0f0f0a` | building blocks + street grid | 四象限W/N/P/S |
| L5 | 智能工厂 | `#0a0f0a` | conveyor belt + gear | 左W 右S 汇合N 根P |
| L6 | 移动终端 | `#0a0f14` | hex signal towers | 上N 下D 中S |
| L7 | 云端平台 | `#0f0e1a` | cloud puffs + rain drops | 云顶N 云肩W/S |
| L8 | 未来实验室 | `#0e0a14` | quantum particles + wave | 左W 右S 干涉I |
| L9 | 指挥中心 | `#0f0e0a` | throne pillars + banners | 左W 右S 御前D 门厅P |

#### decorations 按层差异化示例

```typescript
// L2 网络空间 — 节点集群感
decorations: [
  { type: 'planet', position: { x: 0.50, y: 0.18 }, size: 0.06, color: '#4488ff', animClass: 'gm-decor-float' },
  { type: 'data-stream', position: { x: 0.25, y: 0.40 }, size: 0.05, opacity: 0.15, color: '#44aaff' },
  { type: 'data-stream', position: { x: 0.75, y: 0.40 }, size: 0.05, opacity: 0.15, color: '#44aaff' },
  { type: 'cloud', position: { x: 0.65, y: 0.65 }, size: 0.04, opacity: 0.1 },
  { type: 'cloud', position: { x: 0.30, y: 0.68 }, size: 0.035, opacity: 0.08 },
],

// L9 指挥中心 — 庄严殿堂感
decorations: [
  { type: 'planet', position: { x: 0.50, y: 0.12 }, size: 0.10, color: '#ffdd44', animClass: 'gm-decor-float' },
  { type: 'mountain', position: { x: 0.20, y: 0.55 }, size: 0.06, opacity: 0.12, color: '#888899' },
  { type: 'mountain', position: { x: 0.80, y: 0.55 }, size: 0.06, opacity: 0.12, color: '#888899' },
  { type: 'crystal', position: { x: 0.35, y: 0.78 }, size: 0.025, color: '#ffaa44', animClass: 'gm-decor-float' },
  { type: 'crystal', position: { x: 0.65, y: 0.78 }, size: 0.025, color: '#ffaa44', animClass: 'gm-decor-float' },
],
```

### Task B3：数据自检脚本

创建/更新 `src/tower-mode/data/layers/visualDataValidator.ts`：

```typescript
/**
 * 第八轮增强版视觉数据校验器
 * 
 * 使用方式: node -e "require('./visualDataValidator').validateAllLayers()"
 */
import { L1_VISUAL_DATA } from './L1_visualData';
// ... import all 9 layers

const REQUIRED_FIELDS = {
  border: ['enabled', 'mode', 'borderWidth', 'colors', 'tileSize', 'innerPadding', 'cornerRadius', 'opacity', 'glowColor'],
  quadrantLabels: ['quadrant', 'label', 'fontSizeRatio', 'color', 'fontWeight', 'fontFamily', 'strokeColor', 'strokeWidth'],
};

export function validateLayer(data: any, layerNum: number): { pass: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 边框必须有 mode
  if (!data.border?.mode) {
    errors.push(`L${layerNum}: border.mode 缺失`);
  } else if (!['checkerboard-fill', 'radial-lines'].includes(data.border.mode)) {
    errors.push(`L${layerNum}: border.mode="${data.border.mode}" 不合法`);
  }

  // 2. 象限标签检查
  if (!data.quadrantLabels || data.quadrantLabels.length !== 4) {
    errors.push(`L${layerNum}: quadrantLabels 需要4个元素，实际${data.quadrantLabels?.length ?? 0}个`);
  } else {
    for (const q of data.quadrantLabels) {
      if (!q.quadrant) errors.push(`L${layerNum}: 象限标签缺少 quadrant 字段(有position?)`);
      if ((q.fontSizeRatio ?? 0) < 0.20) warnings.push(`L${layerNum}: ${q.quadrant??'?'} fontSizeRatio=${q.fontSizeRatio} 偏小(建议≥0.22)`);
      if (!q.strokeColor) warnings.push(`L${layerNum}: ${q.quadrant??'?'} 缺少白色描边`);
      if (!q.fontFamily) warnings.push(`L${layerNum}: ${q.quadrant??'?'} 缺少粗体字体设置`);
    }
  }

  // 3. Boss 配置
  const bossStyle = data.cellVisualStyles?.boss;
  if (!bossStyle) {
    errors.push(`L${layerNum}: 缺少 boss 格子样式`);
  } else {
    if (Math.abs((bossStyle.sizeMultiplier ?? 1) - 2.5) > 0.1) {
      errors.push(`L${layerNum}: boss sizeMultiplier=${bossStyle.sizeMultiplier} (应为2.5)`);
    }
    if (!bossStyle.animationClass) warnings.push(`L${layerNum}: boss 缺少 animationClass`);
    if (bossStyle.icon?.type !== 'svg') warnings.push(`L${layerNum}: boss icon.type 不是 svg`);
  }

  // 4. 图标类型检查
  for (const [type, style] of Object.entries(data.cellVisualStyles ?? {})) {
    if (style.icon && style.icon.type !== 'svg') {
      warnings.push(`L${layerNum}: ${type} icon.type="${style.icon.type}" (建议改为svg)`);
    }
  }

  return { pass: errors.length === 0, errors, warnings };
}

export function validateAllLayers(): void {
  const layers = [L1_VISUAL_DATA /*, L2~L9 */];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (let i = 0; i < layers.length; i++) {
    const result = validateLayer(layers[i], i + 1);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    
    console.log(`\n=== L${i+1} ${result.pass ? '✅' : '❌'} ===`);
    if (result.errors.length) console.error('  ERRORS:', result.errors);
    if (result.warnings.length) console.warn('  WARNINGS:', result.warnings);
  }

  console.log(`\n总计: ${totalErrors} errors, ${totalWarnings} warnings`);
  if (totalErrors > 0) process.exit(1);
}
```

## 验收标准

1. ✅ 全部9层的 `border.mode === 'checkerboard-fill'`
2. ✅ 全部9层的 `quadrantLabels` 使用 `quadrant` 字段（非 `position`），且 `fontSizeRatio ≥ 0.22`
3. ✅ 全部9层的 `quadrantLabels` 包含完整的 V2 字段（fontFamily/strokeColor/shadow等共11个新增字段）
4. ✅ 全部9层的 `cellVisualStyles` 中所有图标的 `icon.type === 'svg'`
5. ✅ 全部9层的 `boss.sizeMultiplier === 2.5` 且 `animationClass === 'gm-boss-emerge'`
6. ✅ 全部9层的 `elite.animationClass === 'gm-elite-jagged'`
7. ✅ 全部9层的 `chance`/`opportunity` 有 `animationClass: 'gm-pulse-orange'`
8. ✅ 全部9层的 `stateVisualOverrides` 含 `animationClass` 字段
9. ✅ 全部9层的 `zoneBackgrounds` 含 `enterAnimClass` / `centerPosition` / `shape`
10. ✅ 全部9层的 `decorations` 数组长度 ≥ 5（丰富的装饰元素）
11. ✅ `visualDataValidator.validateAllLayers()` 通过（0 error）
12. ✅ TypeScript 编译无类型错误
