# A组第八轮 — 类型体系扩展 + 视觉资源库创建（基础层彻底重建）

## 🔴 当前问题诊断（必须先理解再动手）

通过逐行阅读实际代码，发现以下**致命缺陷**：

### 缺陷1：类型定义字段缺失（visualAssets.types.ts）

当前类型**缺少第八轮必需的全部新字段**：

```typescript
// 当前 CheckerboardBorder —— 缺少 mode 字段！
export interface CheckerboardBorder {
  enabled: boolean;
  borderWidth: number;
  colors: [string, string];
  tileSize: number;
  borderRadius: number;    // 这个名字也有歧义
  padding: number;
  // ❌ 缺少: mode | innerPadding | cornerRadius | opacity | glowColor
}

// 当前 QuadrantLabel —— 缺少描边/阴影/字体！
export interface QuadrantLabel {
  quadrant: 'W' | 'N' | 'I' | 'P';
  label: string;
  fontSizeRatio: number;     // 当前值0.15，太小
  color: string;
  fontWeight: string;
  backgroundColor: string;  // 设想中不需要背景色
  backgroundOpacity: number;
  // ❌ 缺少: strokeColor | strokeWidth | fontFamily |
  //        shadowColor | shadowBlur | shadowOffsetX | shadowOffsetY
}

// 当前 CellVisualStyle —— 缺少动画类名！
export interface CellVisualStyle {
  // ... 现有字段 ...
  // ❌ 缺少: animationClass (如 'boss-emerge', 'elite-jagged')
}
```

### 缺陷2：关键资源文件不存在

| 应有文件 | 实际状态 |
|---------|---------|
| `src/tower-mode/assets/gridIcons.ts` | ❌ 不存在 |
| `src/tower-mode/styles/gourdAnimations.css` | ❌ 不存在 |
| `DEFAULT_CELL_VISUAL_STYLES` 常量 | ❌ 不存在 |
| `DecorationElement` 类型定义 | ❌ 不存在 |

### 缺陷3：L1_visualData 数据格式与类型不匹配

当前数据用了 `position: 'top-left'` 而类型定义用 `quadrant: 'W'`，图标是emoji字符而非SVG。

---

## 任务目标

**A组第八轮的核心使命：补齐所有缺失的类型字段、创建所有缺失的资源文件、建立完整的默认值体系。这是后续B~E组一切工作的地基。**

> **边界说明**：
> - A组只负责**类型定义 + 资源常量 + CSS规则**
> - A组不修改任何渲染逻辑（那是E组的事）
> - A组不填写具体层数据（那是B组的事）
> - A组的产出必须是**可直接import使用的成品**

## 具体任务

### Task A0：扩展 visualAssets.types.ts —— 添加全部缺失字段

**直接修改现有文件** `src/tower-mode/types/visualAssets.types.ts`：

```typescript
// ====== 保留原有所有接口不变，在末尾追加以下内容 ======

// --- CheckerboardBorder 扩展 ---
export interface CheckerboardBorderV2 extends CheckerboardBorder {
  /** 边框渲染模式 */
  mode: 'checkerboard-fill' | 'radial-lines' | 'solid' | 'glow';
  /** 内部留白(px) */
  innerPadding: number;
  /** 方格圆角半径(px) — 仅checkerboard-fill模式使用 */
  cornerRadius: number;
  /** 整体透明度 */
  opacity: number;
  /** 外发光颜色(带透明度) */
  glowColor: string;
}

// --- QuadrantLabel 扩展 ---
export interface QuadrantLabelV2 extends QuadrantLabel {
  /** 字体家族（粗黑无衬线） */
  fontFamily: string;
  /** 文字描边颜色 */
  strokeColor: string;
  /** 文字描边宽度(viewBox单位) */
  strokeWidth: number;
  /** 阴影颜色 */
  shadowColor: string;
  /** 阴影模糊半径 */
  shadowBlur: number;
  /** 阴影X偏移 */
  shadowOffsetX: number;
  /** 阴影Y偏移 */
  shadowOffsetY: number;
  /** 是否启用文字阴影滤镜 */
  enableShadow: boolean;
}

// --- CellVisualStyle 扩展 ---
export interface CellVisualStyleV2 extends CellVisualStyle {
  /** CSS动画类名（如 boss-emerge, elite-jagged, pulse-orange） */
  animationClass?: string;
  /** 难度星级显示（1-5） */
  difficultyStar?: number;
  /** 区域效果标记 */
  zoneMarker?: string;
}

// --- 新增：装饰元素类型 ---
export interface DecorationElement {
  type: 'planet' | 'cloud' | 'mountain' | 'river' | 'tree' | 'crystal' | 'data-stream';
  position: { x: number; y: number };  // 0-1 归一化坐标
  size: number;                        // 相对大小 0-1
  rotation?: number;                   // 旋转角度
  opacity?: number;                    // 透明度
  color?: string;                      // 主色调覆盖
  animClass?: string;                  // 动画类名
}

// --- 新增：区域背景配置扩展 ---
export interface ZoneBackgroundConfigV2 extends ZoneBackgroundConfig {
  /** 区域进入动画类名 */
  enterAnimClass: string;
  /** 区域持续动画类名 */
  ambientAnimClass?: string;
  /** 区域中心点（归一化坐标） */
  centerPosition: { x: number; y: number };
  /** 区域覆盖形状: 'quadrant' | 'sector' | 'custom' */
  shape: 'quadrant' | 'sector' | 'custom';
  /** 自定义路径数据(shape=custom时) */
  customPath?: string;
}
```

### Task A1：创建 SVG 图标库

**新建文件** `src/tower-mode/assets/gridIcons.ts`：

```typescript
/**
 * 格子类型 → 内置SVG图标 path data
 * 
 * 所有图标均为 24x24 viewBox 的精简 path data。
 * 使用方式：<svg viewBox="0 0 24 24"><path d={GRID_ICONS[type]} fill="color"/></svg>
 * 
 * 设计风格统一：线条粗细2px，圆角2px，现代扁平化
 */
export const GRID_ICONS: Readonly<Record<string, string>> = {
  // 起点：圆形入口门/传送门
  start: `M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z`,

  // Boss：王座/皇冠（三层结构感）
  boss: `M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z`,

  // 战斗：交叉剑盾
  battle: `M20.2 18.8l-2.1-2.1 2.05-2.05-1.4-1.4-2.05 2.05-2.1-2.1-1.4 1.4 2.1 2.1-2.05 2.05 1.4 1.4 2.05-2.05 2.1 2.1 1.4-1.4-2.1-2.1zM4 4l7 7h3l-3 3-1.5-1.5L4 18V4z`,

  // 书店：打开的书本
  bookstore: `M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z`,

  // 技能：闪电/能量
  skill: `M7 2v11h3v9l7-12h-4l4-8z`,

  // 交流会：对话气泡/商店帐篷
  exchange: `M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z`,

  // 机会/事件：礼物盒/问号
  opportunity: `M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z`,

  // 特殊：星星/宝箱
  special: `M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z`,

  // 随机：问号方块
  chance: `M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z`,

  // 精英：骷髅盾牌/危险标记
  elite: `M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 13H9v-2h2v2zm0-4H9V7h2v4zm4 4h-2v-2h2v2zm0-4h-2V7h2v4z`,

  // 锁定：挂锁
  locked: `M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z`,

  // 过渡/传送：传送门
  transition: `M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z`,

  // 终点：旗帜/奖杯
  end: `M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z`,
};

/** 获取格子图标（带fallback） */
export function getGridIcon(type: string): string {
  return GRID_ICONS[type] ?? GRID_ICONS.level ?? GRID_ICONS.chance;
}

/** 获取所有可用的格子图标类型列表 */
export function getAvailableIconTypes(): string[] {
  return Object.keys(GRID_ICONS);
}
```

### Task A2：创建 CSS 动画规则集

**新建文件** `src/tower-mode/styles/gourdAnimations.css`：

```css
/* ================================================================
   第八轮完整CSS动画规则集
   文件位置: src/tower-mode/styles/gourdAnimations.css
   使用方式: import '../../styles/gourdAnimations.css'
   
   共定义 14 种动画，分为5大类：
   ① 格子状态动画 (4种): pending/current/cleared/elite
   ② Boss特效动画 (2种): emerge/pulse  
   ③ 玩家棋子动画 (2种): breathe/trail-fade
   ④ 区域进入特效 (5种): ripple/sparkle/flash/countdown/warning
   ⑤ 装饰元素动画 (1种): float
   ================================================================ */

/* ====== ① 格子状态动画 ====== */

/* 待处理状态 — 橙色脉冲提示 */
.gm-pulse-orange {
  animation: gm-pulse-orange 1.2s ease-in-out infinite;
}
@keyframes gm-pulse-orange {
  0%, 100% { box-shadow: 0 0 6px rgba(255,136,0,0.4); }
  50%      { box-shadow: 0 0 18px rgba(255,136,0,0.8), 0 0 30px rgba(255,136,0,0.3); }
}

/* 当前所在 — 绿色动态光圈 */
.gm-glow-current {
  animation: gm-glow-current 1.8s ease-in-out infinite;
}
@keyframes gm-glow-current {
  0%, 100% { box-shadow: 0 0 8px rgba(68,255,136,0.5), 0 0 16px rgba(68,255,136,0.2); }
  50%      { box-shadow: 0 0 16px rgba(68,255,136,0.9), 0 0 32px rgba(68,255,136,0.4); }
}

/* 已通关 — 金色微光 */
.gm-shimmer-gold {
  animation: gm-shimmer-gold 3s ease-in-out infinite;
}
@keyframes gm-shimmer-gold {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255,215,0,0.3)); }
  50%      { filter: brightness(1.15) drop-shadow(0 0 8px rgba(255,215,0,0.6)); }
}

/* 精英格 — 锯齿抖动 */
.gm-elite-jagged {
  animation: gm-elite-jagged 0.7s ease-in-out infinite;
}
@keyframes gm-elite-jagged {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25%      { transform: scale(1.03) rotate(0.8deg); }
  50%      { transform: scale(0.98) rotate(-0.5deg); }
  75%      { transform: scale(1.02) rotate(0.3deg); }
}

/* ====== ② Boss 特效动画 ====== */

/* Boss光环脉动 */
.gm-boss-pulse {
  animation: gm-boss-pulse 2s ease-in-out infinite;
}
@keyframes gm-boss-pulse {
  0%, 100% { 
    filter: drop-shadow(0 0 8px rgba(255,51,51,0.5)); 
    opacity: 0.85; 
  }
  50% { 
    filter: drop-shadow(0 0 24px rgba(255,51,51,0.9)) drop-shadow(0 0 40px rgba(255,51,51,0.3)); 
    opacity: 1; 
  }
}

/* Boss登场 — 弹性放大出现 */
.gm-boss-emerge {
  animation: gm-boss-emerge 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes gm-boss-emerge {
  0%   { transform: scale(0) translateY(15px); opacity: 0; }
  60%  { transform: scale(1.1) translateY(-3px); opacity: 1; }
  80%  { transform: scale(0.96) translateY(1px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* ====== ③ 玩家棋子动画 ====== */

/* 棋子呼吸 — 缓慢缩放 */
.gm-piece-breathe {
  animation: gm-piece-breathe 2.5s ease-in-out infinite;
}
@keyframes gm-piece-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}

/* 轨迹光痕渐隐 */
.gm-trail-fade {
  animation: gm-trail-fade 1.2s ease-out forwards;
}
@keyframes gm-trail-fade {
  0%   { opacity: 0.9; r: 3%; }
  100% { opacity: 0;   r: 0.5%; }
}

/* 到达波纹 */
.gm-arrival-ripple {
  animation: gm-arrival-ripple 0.7s ease-out forwards;
}
@keyframes gm-arrival-ripple {
  0%   { r: 2%; opacity: 0.8; stroke-width: 2; }
  100% { r: 28%; opacity: 0; stroke-width: 0.5; }
}

/* ====== ④ 区域进入特效 ====== */

/* W虚弱区 — 红色波纹扩散 */
.gm-zone-w-enter { animation: gm-zone-w-enter 0.8s ease-out forwards; }
@keyframes gm-zone-w-enter {
  0%   { r: 0%; opacity: 0; fill: rgba(255,107,107,0); }
  40%  { opacity: 0.35; }
  100% { r: 38%; opacity: 0; fill: rgba(255,107,107,0); }
}

/* N知识区 — 蓝色星光闪烁 */
.gm-zone-n-enter { animation: gm-zone-n-enter 1s ease-out forwards; }
@keyframes gm-zone-n-enter {
  0%   { opacity: 0; filter: brightness(1) blur(2px); }
  30%  { opacity: 1; filter: brightness(2) blur(0px); }
  70%  { opacity: 0.7; filter: brightness(1.5); }
  100% { opacity: 0; filter: brightness(1); }
}

/* I反转区 — 紫色旋转闪光 */
.gm-zone-i-enter { animation: gm-zone-i-enter 1.2s ease-out forwards; }
@keyframes gm-zone-i-enter {
  0%   { transform: scale(0.3) rotate(0deg); opacity: 0; }
  50%  { transform: scale(1.1) rotate(180deg); opacity: 0.6; }
  100% { transform: scale(1) rotate(360deg); opacity: 0; }
}

/* P跳过区 — 黄色倒计时环 */
.gm-zone-p-enter { animation: gm-zone-p-enter 1.5s linear forwards; }
@keyframes gm-zone-p-enter {
  from { stroke-dasharray: 100; stroke-dashoffset: 100; }
  to   { stroke-dasharray: 100; stroke-dashoffset: 0; }
}

/* D危险区 — 红色警告闪烁 */
.gm-zone-d-enter { animation: gm-zone-d-enter 0.4s ease 5; }
@keyframes gm-zone-d-enter {
  0%, 100% { fill: rgba(231,76,60,0.08); }
  50%      { fill: rgba(231,76,60,0.35); }
}

/* S加速区 — 绿色闪电划过 */
.gm-zone-s-enter { animation: gm-zone-s-enter 0.6s ease-out forwards; }
@keyframes gm-zone-s-enter {
  0%   { transform: translateX(-20%); opacity: 0; }
  30%  { opacity: 1; }
  100% { transform: translateX(20%); opacity: 0; }
}

/* ====== ⑤ 装饰元素动画 ====== */

/* 星球/云朵漂浮 */
.gm-decor-float {
  animation: gm-decor-float 6s ease-in-out infinite;
}
@keyframes gm-decor-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3%); }
}
```

### Task A3：创建默认视觉样式常量

**新建文件** `src/tower-mode/constants/defaultVisualStyles.ts`：

```typescript
import type { CellVisualStyleV2 } from '../types/visualAssets.types';

/**
 * 默认格子视觉样式
 * 
 * 这是全局回退值。B组每层的 visualData 可以覆盖这里的任意字段。
 * E组渲染时优先读取 B组数据，缺失字段回退到此常量。
 */
export const DEFAULT_CELL_STYLES: Map<string, CellVisualStyleV2> = new Map([
  ['start', {
    cellType: 'start' as any,
    sizeMultiplier: 1.2,
    shape: 'circle',
    backgroundGradient: { from: '#1a3a1a', to: '#0d200d', angle: 135 },
    border: { width: 2, color: '#44ff88', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#44ff88', size: 10, pulse: true },
    animationClass: undefined,
  }],
  ['battle', {
    cellType: 'battle' as any,
    sizeMultiplier: 1.0,
    shape: 'hexagon',
    backgroundGradient: { from: '#3a1a1a', to: '#1a0a0a', angle: 135 },
    border: { width: 2, color: '#ff6644', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#ff6644', size: 6, pulse: false },
    animationClass: undefined,
  }],
  ['boss', {
    cellType: 'boss' as any,
    sizeMultiplier: 2.5,
    shape: 'circle',
    backgroundGradient: { from: '#4a0a0a', to: '#1a0000', angle: 135 },
    border: { width: 4, color: '#ff0000', style: 'double' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#ff3333', size: 28, pulse: true },
    animationClass: 'gm-boss-emerge',
  }],
  ['bookstore', {
    cellType: 'bookstore' as any,
    sizeMultiplier: 1.0,
    shape: 'roundedRect',
    backgroundGradient: { from: '#1a2a4a', to: '#0a1530', angle: 135 },
    border: { width: 2, color: '#44aaff', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#44aaff', size: 8, pulse: false },
    animationClass: undefined,
  }],
  ['skill', {
    cellType: 'skill' as any,
    sizeMultiplier: 1.0,
    shape: 'hexagon',
    backgroundGradient: { from: '#2a1a4a', to: '#120a28', angle: 135 },
    border: { width: 2, color: '#aa44ff', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#aa44ff', size: 8, pulse: true },
    animationClass: undefined,
  }],
  ['exchange', {
    cellType: 'exchange' as any,
    sizeMultiplier: 1.0,
    shape: 'ellipse',
    backgroundGradient: { from: '#1a3a3a', to: '#0d201d', angle: 135 },
    border: { width: 2, color: '#44ffaa', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#44ffaa', size: 6, pulse: false },
    animationClass: undefined,
  }],
  ['opportunity', {
    cellType: 'opportunity' as any,
    sizeMultiplier: 0.95,
    shape: 'diamond',
    backgroundGradient: { from: '#3a2a1a', to: '#1a0f0a', angle: 135 },
    border: { width: 2, color: '#ffcc44', style: 'dashed', dashPattern: '3,3' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#ffcc44', size: 10, pulse: true },
    animationClass: 'gm-pulse-orange',
  }],
  ['chance', {
    cellType: 'chance' as any,
    sizeMultiplier: 0.95,
    shape: 'diamond',
    backgroundGradient: { from: '#3a1a3a', to: #1a0f1a', angle: 135 },
    border: { width: 2, color: '#cc66ff', style: 'dashed', dashPattern: '3,3' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#cc66ff', size: 8, pulse: true },
    animationClass: 'gm-pulse-orange',
  }],
  ['special', {
    cellType: 'special' as any,
    sizeMultiplier: 1.0,
    shape: 'star',
    backgroundGradient: { from: '#3a3a1a', to: '#1a1a0a', angle: 135 },
    border: { width: 2, color: '#ffdd44', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#ffdd44', size: 12, pulse: true },
    animationClass: undefined,
  }],
  ['elite', {
    cellType: 'battle' as any,
    sizeMultiplier: 1.2,
    shape: 'circle',
    backgroundGradient: { from: '#4a1a00', to: '#2a0a00', angle: 135 },
    border: { width: 3, color: '#ff0000', style: 'dashed', dashPattern: '3,3' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#ff3333', size: 10, pulse: false },
    animationClass: 'gm-elite-jagged',
  }],
  ['transition', {
    cellType: 'transition' as any,
    sizeMultiplier: 1.0,
    shape: 'circle',
    backgroundGradient: { from: '#1a2a3a', to: '#0a1520', angle: 135 },
    border: { width: 2, color: '#8888ff', style: 'dashed', dashPattern: '4,4' },
    icon: { type: 'svg', data: '' },
    glowEffect: { color: '#8888ff', size: 8, pulse: true },
    animationClass: undefined,
  }],
  ['locked', {
    cellType: 'level' as any,
    sizeMultiplier: 0.85,
    shape: 'circle',
    backgroundGradient: { from: '#1a1a1a', to: '#0a0a0a', angle: 135 },
    border: { width: 1, color: '#555555', style: 'solid' },
    icon: { type: 'svg', data: '' },
    glowEffect: undefined,
    animationClass: undefined,
  }],
]);

/**
 * 默认象限标识配置（W/N/I/P 四象限）
 * 
 * 这些是大号字母的核心样式。
 * 关键参数：
 * - fontSizeRatio: 0.22 = 下圆直径的22%（在100x100 viewbox中约等于14-18单位）
 * - strokeColor: 白色描边确保在任何背景上都清晰可见
 * - fontWeight: 900 = 最粗黑体
 */
export const DEFAULT_QUADRANT_LABELS: Array<{
  quadrant: 'W' | 'N' | 'I' | 'P';
  label: string;
  fontSizeRatio: number;
  color: string;
  fontWeight: string;
  fontFamily: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  enableShadow: boolean;
}> = [
  {
    quadrant: 'W', label: 'W', fontSizeRatio: 0.22, color: '#FF8800',
    fontWeight: '900', fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif',
    strokeColor: '#FFFFFF', strokeWidth: 0.8,
    shadowColor: '#000000', shadowBlur: 3, shadowOffsetX: 1, shadowOffsetY: 1,
    enableShadow: true,
  },
  {
    quadrant: 'N', label: 'N', fontSizeRatio: 0.22, color: '#FFCC00',
    fontWeight: '900', fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif',
    strokeColor: '#FFFFFF', strokeWidth: 0.8,
    shadowColor: '#000000', shadowBlur: 3, shadowOffsetX: 1, shadowOffsetY: 1,
    enableShadow: true,
  },
  {
    quadrant: 'I', label: 'I', fontSizeRatio: 0.22, color: '#FFCC00',
    fontWeight: '900', fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif',
    strokeColor: '#FFFFFF', strokeWidth: 0.8,
    shadowColor: '#000000', shadowBlur: 3, shadowOffsetX: 1, shadowOffsetY: 1,
    enableShadow: true,
  },
  {
    quadrant: 'P', label: 'P', fontSizeRatio: 0.22, color: '#FF8800',
    fontWeight: '900', fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif',
    strokeColor: '#FFFFFF', strokeWidth: 0.8,
    shadowColor: '#000000', shadowBlur: 3, shadowOffsetX: 1, shadowOffsetY: 1,
    enableShadow: true,
  },
];

/**
 * 默认棋盘格边框配置
 */
export const DEFAULT_BORDER_CONFIG = {
  enabled: true,
  mode: 'checkerboard-fill' as const,
  borderWidth: 10,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 12,
  innerPadding: 2,
  cornerRadius: 3,
  opacity: 0.85,
  glowColor: 'rgba(255,170,0,0.4)',
};
```

### Task A4：更新 types/index.ts 导出

确保所有新增的类型和常量都可以从统一入口导入：

```typescript
// 在 src/tower-mode/types/index.ts 中添加:
export type { CheckerboardBorderV2, QuadrantLabelV2, CellVisualStyleV2 } from './visualAssets.types';
export type { DecorationElement, ZoneBackgroundConfigV2 } from './visualAssets.types';

// 在 src/tower-mode/constants/index.ts 中添加:
export { DEFAULT_CELL_STYLES, DEFAULT_QUADRANT_LABELS, DEFAULT_BORDER_CONFIG } from './defaultVisualStyles';
export { GRID_ICONS, getGridIcon, getAvailableIconTypes } from '../assets/gridIcons';
```

## 与其他组的接口约定

| 新产出 | 文件路径 | 消费者 |
|--------|---------|--------|
| `CheckerboardBorderV2` 类型 | types/visualAssets.types.ts | B组(数据)、E组(渲染) |
| `QuadrantLabelV2` 类型 | types/visualAssets.types.ts | B组(数据)、E组(渲染) |
| `CellVisualStyleV2` 类型 | types/visualAssets.types.ts | B组(数据)、E组(渲染) |
| `DecorationElement` 类型 | types/visualAssets.types.ts | B组(数据)、E组(渲染) |
| `ZoneBackgroundConfigV2` 类型 | types/visualAssets.types.ts | B组(数据)、E组(渲染) |
| `GRID_ICONS` 常量 | assets/gridIcons.ts | B组(引用)、E组(渲染) |
| `gourdAnimations.css` | styles/gourdAnimations.css | E组(import) |
| `DEFAULT_CELL_STYLES` | constants/defaultVisualStyles.ts | C组(fallback)、E组(fallback) |
| `DEFAULT_QUADRANT_LABELS` | constants/defaultVisualStyles.ts | C组(fallback)、E组(fallback) |
| `DEFAULT_BORDER_CONFIG` | constants/defaultVisualStyles.ts | C组(fallback)、E组(fallback) |

## 验收标准

1. ✅ `visualAssets.types.ts` 中新增 V2 扩展接口（4个），包含全部缺失字段
2. ✅ `gridIcons.ts` 存在且包含 14 种格子的 SVG path data（每个都是有效的 `<path d="...">`）
3. ✅ `gourdAnimations.css` 存在且包含 14 种 `@keyframes` 定义 + 对应 `.gm-*` 类名
4. ✅ `defaultVisualStyles.ts` 存在且导出 3 个常量（DEFAULT_CELL_STYLES / QUADRANT_LABELS / BORDER_CONFIG）
5. ✅ Boss 的 `sizeMultiplier === 2.5` 且 `animationClass === 'gm-boss-emerge'`
6. ✅ 精英格的 `animationClass === 'gm-elite-jagged'`
7. ✅ 所有新类型和常量均可从 `types/index.ts` 和 `constants/index.ts` 导入
8. ✅ TypeScript 编译无错误
