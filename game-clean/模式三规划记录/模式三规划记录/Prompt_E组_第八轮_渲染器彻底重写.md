# E组第八轮 — GourdMapRenderer 彻底重写（视觉表现层核心）

## 🔴🔴🔴 当前渲染器致命问题诊断

通过逐行阅读 `src/tower-mode/components/GourdMapRenderer/index.tsx`（371行），发现以下**架构级缺陷**：

### 缺陷1：SVG + DIV 混合架构（最大问题）

```
当前结构:
┌─────────────────────────────────┐
│ <div> (外层容器)                │
│  ├─ <svg viewBox="0 0 100 100"> │  ← SVG层：轮廓/路径/标签/边框
│  │   ├─ 葫芦形填充              │
│  │   ├─ 葫芦形描边              │
│  │   ├─ 连接线(贝塞尔曲线)       │
│  │   ├─ W/N/I/P文字(fontSize=5!)│  ← 几乎不可见!
│  │   └─ 边框(72段径向线)        │  ← 不是棋盘格!
│  </svg>                          │
│  ├─ <div>(绝对定位,覆盖在SVG上) │  ← DIV层：格子!!!
│  │   ├─ 格子1 (left: x%, top: y%)│  ← 用百分比定位的div
│  │   ├─ 格子2                    │     完全脱离SVG坐标系
│  │   └─ ...                      │
│  └─ <style> (2个内联动画)         │
└─────────────────────────────────┘
```

**问题**：
- SVG 用的是 0-100 坐标系，DIV 用的是 % 百分比定位，两套坐标系**无法精确对齐**
- W/N/I/P 在 SVG 内用 `fontSize="5"`（viewBox单位），但下圆半径约35单位 → 字体只有半径的 **1/7** 大小！
- 边框是72段 `<line>` 径向线段，不是填充图案
- 格子是 DOM div 元素，无法使用 SVG 的 pattern/filter/gradient 等高级特性

### 缺陷2：所有具体数值硬编码

```typescript
// 第209行：W/N/I/P 的 fontSize 硬编码为 "5"
<text ... fontSize="5" fontWeight="bold" opacity="0.5">{q[1]}</text>

// 第288行：Boss大小硬编码为 7.5%
const size = isBoss ? 7.5 : 3; // 没有从 visualConfig 读取！

// 第12-25行：图标全部是 emoji
start: { icon: '🚪' }, boss: { icon: '👑' }, battle: { icon: '⚔️' }
// ...
```

**没有任何一行代码从 topology.visualConfig 中读取数据！**

### 缺陷3：缺少关键渲染层级

| 应有层级 | 当前状态 |
|---------|---------|
| CSS动画定义 | ❌ 只有2个内联@keyframes |
| SVG defs（pattern/filter） | ❌ 不存在 |
| 背景装饰层 | ❌ 不存在 |
| 区域背景(W/N/I/P半透明) | ❌ 十字线只有，无区域填充 |
| 棋盘格边框 | ⚠️ 是径向线不是方格填充 |
| 玩家棋子 | ❌ 只有一个🎮emoji覆盖在当前格子上 |
| 移动轨迹 | ❌ 不存在 |
| 到达波纹 | ❌ 不存在 |

---

## 任务目标

**彻底重写 GourdMapRenderer**：从当前的 SVG+DIV 混合架构迁移到 **纯 SVG 渲染架构**，所有视觉参数从 topology.visualConfig 动态读取，实现接近海幸参考图的 **85%+ 视觉相似度**。

> **边界说明**：
> - E组消费 A 组的全部资源（GRID_ICONS / gourdAnimations.css / DEFAULT_*）
> - E组消费 B 组修正后的 visualData（通过 C 组组装后的 topology.visualConfig）
> - E组消费 D 组的 PlayerPieceState（通过 props 或 eventBus）
> - E组**只负责渲染**，不修改任何数据

## 架构设计：纯SVG 8层渲染

```
新的 GourdMapRenderer 结构:

<GourdMapRenderer>
│
├─ <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
│  │
│  ├─ 【Layer -1】<defs> — 全局定义
│  │   ├─ <pattern id="checker-pattern">    ← 棋盘格图案
│  │   ├─ <filter id="border-glow">          ← 边框发光
│  │   ├─ <filter id="text-shadow">           ← 文字阴影
│  │   ├─ <linearGradient id="bg-gradient">   ← 背景渐变
│  │   ├─ <radialGradient id="planet-grad">   ← 星球渐变
│  │   └─ <radialGradient id="boss-glow">     ← Boss光晕
│  │
│  ├─ 【Layer 0】BackgroundLayer — 背景+装饰
│  │   ├─ <rect> 整体背景渐变
│  │   ├─ 装饰元素（星球/云朵/水晶/数据流）
│  │   └─ 噪点纹理叠加
│  │
│  ├─ 【Layer 1】ZoneLayer — 四象限区域背景
│  │   ├─ W区半透明填充
│  │   ├─ N区半透明填充
│  │   ├─ I区半透明填充
│  │   ├─ P区半透明填充
│  │   ├─ 十字分割线（加粗版）
│  │   └─ W/N/I/P ★大号标识★（fontSize~16!）
│  │
│  ├─ 【Layer 2】BorderLayer — 棋盘格边框
│  │   ├─ 上圆棋盘格填充区域（引用 #checker-pattern）
│  │   └─ 下圆棋盘格填充区域（引用 #checker-pattern）
│  │
│  ├─ 【Layer 3】PathLayer — 曲线路径
│  │   └─ 所有连接线的贝塞尔曲线 <path d="M...Q...">
│  │
│  ├─ 【Layer 4】CellLayer — 功能格子（纯SVG实现！）
│  │   ├─ 普通格子（圆形/六角形/菱形等）
│  │   ├─ Boss格（2.5倍大 + 光晕动画）
│  │   ├─ 精英格（锯齿边框 + 抖动）
│  │   ├─ SVG图标（foreignObject 或 path）
│  │   └─ 状态覆盖（锁定灰化/待处理闪烁/已通关金光）
│  │
│  └─ 【Layer 5】AnimationLayer — 动画效果
│      ├─ 玩家棋子（绿圆+🎮+呼吸动画）
│      ├─ 移动轨迹光痕（渐隐绿点）
│      ├─ 到达波纹（扩散环）
│      └─ 区域进入特效（ripple/sparkle/...）
│
└─ import gourdAnimations.css （14种动画类名可用）
```

## 具体任务

### Task E0: 文件头与导入

```tsx
// src/tower-mode/components/GourdMapRenderer/index.tsx
import { useMemo, useEffect, useState, useCallback } from 'react';
import { GRID_ICONS } from '../../assets/gridIcons';
import { DEFAULT_CELL_STYLES, DEFAULT_QUADRANT_LABELS } from '../../constants/defaultVisualStyles';
import '../../styles/gourdAnimations.css'; // ★ 导入14种CSS动画

import type { GourdMapTopology, GridCell } from '../../types/grid.types';
import type { PlayerPieceState } from '../../engine/playerPieceManager';

interface GourdMapRendererProps {
  topology: GourdMapTopology;
  cells: GridCell[];
  currentPosition?: string | null;
  highlightedCells?: string[];
  pieceState?: PlayerPieceState | null;       // ★ 新增：D组驱动的棋子状态
  onCellClick?: (cellId: string) => void;
}
```

### Task E1: ★★★ P0 — W/N/I/P 象限标识大幅放大

这是**视觉效果提升最大的单项改动**。将 fontSize 从 5 提升到 ~16（viewBox单位），并添加完整的样式：

```tsx
/** 象限标识层组件 */
function QuadrantLabels({ topology }: { topology: any }) {
  const lc = topology.lowerCircle;
  if (!lc) return null;

  const cx = lc.center.x;
  const cy = lc.center.y;
  const r = lc.radius * 0.82; // 标识分布半径

  // 从 visualConfig 获取配置（优先），否则用默认值
  const labels = topology.visualConfig?.quadrantLabels ?? DEFAULT_QUADRANT_LABELS;

  // 计算字体大小：基于下圆直径 × fontSizeRatio
  // 下圆直径 ≈ r * 2, fontSizeRatio=0.22 → fontSize ≈ r * 0.44
  // 在 viewbox 100x100 中，r≈35 → fontSize ≈ 15.4
  const baseFontSize = Math.max(r * 2 * (labels[0]?.fontSizeRatio ?? 0.22), 12);

  // 四象限偏移位置（相对于中心点的百分比）
  const offsets = [
    { dx: -0.38, dy: -0.38 },  // W: 左上
    { dx: 0.38,  dy: -0.38 },  // N: 右上
    { dx: -0.38, dy: 0.38 },   // I: 左下
    { dx: 0.38,  dy: 0.38 },   // P: 右下
  ];

  return (
    <g>
      {/* 十字分割线 —— 加粗加清晰 */}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
            stroke="#FFFFFF" strokeWidth="0.8" opacity="0.45" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r}
            stroke="#FFFFFF" strokeWidth="0.8" opacity="0.45" />

      {/* 四个大号字母 */}
      {labels.map((q: any, i: number) => {
        const off = offsets[i];
        return (
          <text key={q.quadrant ?? i}
            x={cx + r * off.dx}
            y={cy + r * off.dy}
            fill={q.color ?? '#FFFFFF'}
            fontSize={baseFontSize}
            fontWeight={q.fontWeight ?? '900'}
            fontFamily={q.fontFamily ?? '"Arial Black", Impact, sans-serif'}
            textAnchor="middle"
            dominantBaseline="central"
            opacity="0.92"
            stroke={q.strokeColor ?? '#FFFFFF'}
            strokeWidth={q.strokeWidth ?? 0.7}
            paintOrder="stroke fill"
            style={{
              filter: q.enableShadow !== false
                ? `drop-shadow(${q.shadowOffsetX ?? 1}px ${(q.shadowOffsetY ?? 1)}px ${(q.shadowBlur ?? 3)}px ${q.shadowColor ?? '#000000'})`
                : 'none',
            }}
          >
            {q.label ?? q.quadrant}
          </text>
        );
      })}
    </g>
  );
}
```

### Task E2: ★★★ P0 — 棋盘格边框改为方格填充模式

替换原来的72段径向 `<line>` 为 SVG `<pattern>` + `<ellipse fill="url(#checker-pattern)">`：

```tsx
/** 棋盘格边框层 */
function CheckerboardBorder({ topology }: { topology: any }) {
  const borderCfg = topology?.visualConfig?.border;
  
  // 如果没有 border 配置或 mode 不是 checkerboard-fill，不渲染
  if (!borderCfg?.enabled || borderCfg.mode !== 'checkerboard-fill') return null;

  const uc = topology.upperCircle;
  const lc = topology.lowerCircle;
  if (!uc || !lc) return null;

  const tileSize = borderCfg.tileSize ?? 12;
  const colors = borderCfg.colors ?? ['#FFAA00', '#FFFFFF'];
  const radius = borderCfg.cornerRadius ?? 3;
  const opacity = borderCfg.opacity ?? 0.85;

  return (
    <>
      <defs>
        {/* 棋盘格图案定义 */}
        <pattern id={`cbp-${topology.id ?? 'default'}`}
                width={tileSize} height={tileSize}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(15)">
          {/* 2×2 方格棋盘 */}
          <rect width={tileSize/2} height={tileSize/2}
                fill={colors[0]} rx={radius} ry={radius} />
          <rect width={tileSize/2} height={tileSize/2}
                fill={colors[1]} rx={radius} ry={radius}
                x={tileSize/2} y={tileSize/2} />
          <rect width={tileSize/2} height={tileSize/2}
                fill={colors[1]} rx={radius} ry={radius}
                x={0} y={tileSize/2} />
          <rect width={tileSize/2} height={tileSize/2}
                fill={colors[0]} rx={radius} ry={radius}
                x={tileSize/2} y={0} />
        </pattern>

        {/* 边框外发光 */}
        <filter id={`bgf-${topology.id ?? 'default'}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#bgf-${topology.id ?? 'default'})`} opacity={opacity}>
        {/* 上圆棋盘格区域 */}
        <ellipse
          cx={uc.center.x + '%'} cy={uc.center.y + '%'}
          rx={(uc.radius + (borderCfg.borderWidth ?? 10) / 2) + '%'}
          ry={(uc.radius * 0.85 + (borderCfg.borderWidth ?? 10) / 2) + '%'}
          fill={`url(#cbp-${topology.id ?? 'default'})`}
          stroke={colors[0]} strokeWidth="0.6"
        />
        {/* 下圆棋盘格区域 */}
        <ellipse
          cx={lc.center.x + '%'} cy={lc.center.y + '%'}
          rx={(lc.radius + (borderCfg.borderWidth ?? 10) / 2) + '%'}
          ry={(lc.radius * 0.85 + (borderCfg.borderWidth ?? 10) / 2) + '%'}
          fill={`url(#cbp-${topology.id ?? 'default'})`}
          stroke={colors[0]} strokeWidth="0.6"
        />
      </g>
    </>
  );
}
```

### Task E3: ★★★ P0 — 格子系统纯SVG重写

**这是最大的改动——将所有格子从 DOM DIV 改为 SVG 元素**：

```tsx
/** 单个格子节点（纯SVG实现） */
function CellNode({
  cell, config, position, isCurrent, isHighlighted,
  onClick, visualStyle, stateOverride
}: {
  cell: any; config: any; position: {x:number;y:number};
  isCurrent: boolean; isHighlighted: boolean;
  onClick: () => void; visualStyle: any; stateOverride?: any;
}) {
  const sizeMultiplier = visualStyle?.sizeMultiplier ?? 1.0;
  const baseSize = 3.2; // 基础格子大小(viewBox单位)
  const nodeSize = baseSize * sizeMultiplier; // Boss = 8.0!

  const shape = visualStyle?.shape ?? 'circle';
  const animClass = visualStyle?.animationClass;

  // 状态覆盖
  let opacity = 1, filterStr = 'none', stateAnimClass: string | undefined;
  if (stateOverride) {
    opacity = stateOverride.opacity ?? 1;
    filterStr = stateOverride.filter ?? 'none';
    stateAnimClass = stateOverride.animationClass;
  }

  // 根据 shape 渲染不同形状
  const renderShape = () => {
    const commonProps = {
      cx: position.x, cy: position.y,
      fill: visualStyle?.fillColor ?? '#1a1a3e',
      stroke: isHighlighted ? '#ffffff' : (visualStyle?.strokeColor ?? config?.color),
      strokeWidth: (visualStyle?.strokeWidth ?? 1.5) / sizeMultiplier,
      opacity,
      style: { filter: filterStr },
    };

    switch (shape) {
      case 'circle':
        return <circle r={nodeSize / 2 + '%'} {...commonProps} />;
      case 'ellipse':
        return <ellipse rx={nodeSize / 2 + '%'} ry={nodeSize / 2.5 + '%'} {...commonProps} />;
      case 'hexagon':
        return <polygon points={hexagonPoints(position.x, position.y, nodeSize)} {...commonProps} />;
      case 'roundedRect':
        return <rect
          x={position.x - nodeSize/2 + '%'} y={position.y - nodeSize/2 + '%'}
          width={nodeSize + '%'} height={nodeSize * 0.85 + '%'}
          rx={nodeSize * 0.15 + '%'} ry={nodeSize * 0.15 + '%'}
          {...commonProps} />;
      case 'diamond':
        return <polygon points={diamondPoints(position.x, position.y, nodeSize)} {...commonProps} />;
      case 'star':
        return <polygon points={starPoints(position.x, position.y, nodeSize)} {...commonProps} />;
      default:
        return <circle r={nodeSize / 2 + '%'} {...commonProps} />;
    }
  };

  // SVG 图标渲染
  const renderIcon = () => {
    const iconType = visualStyle?.icon?.type;
    const iconData = visualStyle?.icon?.data;
    
    if (iconType === 'svg') {
      const pathD = GRID_ICONS[cell.type] ?? GRID_ICONS['chance'] ?? '';
      const iconSize = nodeSize * 0.5;
      return (
        <g transform={`translate(${position.x},${position.y})`}>
          <svg x={-iconSize/2 + '%'} y={-iconSize/2 + '%'}
               width={iconSize + '%'} height={iconSize + '%'}
               viewBox="0 0 24 24">
            <path d={pathD}
                  fill={isHighlighted ? '#ffffff' : '#dddddd'}
                  stroke="none" />
          </svg>
        </g>
      );
    }
    // fallback: 显示类型首字母
    return (
      <text x={position.x + '%'} y={position.y + '%'}
            textAnchor="middle" dominantBaseline="central"
            fontSize={`${nodeSize * 0.35}%`}
            fill="#ffffff" opacity="0.9">
        {(cell.type ?? '?')[0].toUpperCase()}
      </text>
    );
  };

  return (
    <g className={animClass || stateAnimClass || undefined}
       onClick={onClick}
       cursor={opacity < 0.5 ? 'not-allowed' : 'pointer'}>
      {/* 格子形状 */}
      {renderShape()}
      
      {/* 图标 */}
      {renderIcon()}

      {/* 难度星级（关卡格专属） */}
      {cell.difficultyStar && (
        <g transform={`translate(${position.x + nodeSize*0.2}%,$${position.y - nodeSize*0.3}%)`}>
          {Array.from({length: cell.difficultyStar}, (_, i) => (
            <text key={i} x={i * nodeSize * 0.18 + '%'} y="0%"
                  fontSize={`${nodeSize * 0.2}%`} fill="#FFD700">★</text>
          ))}
        </g>
      )}

      {/* 当前位置标记 */}
      {isCurrent && (
        <circle cx={position.x + '%'} cy={position.y + '%'}
                r={nodeSize * 0.55 + '%'} fill="none"
                stroke="#44ff88" strokeWidth="0.8"
                className="gm-glow-current" />
      )}
    </g>
  );
}

// 辅助函数：生成各形状的点坐标
function hexagonPoints(cx: number, cy: number, size: number): string {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${cx + size/2 * Math.cos(angle)},${cy + size/2 * Math.sin(angle)}`);
  }
  return pts.join(' ');
}
function diamondPoints(cx: number, cy: number, size: number): string {
  return `${cx},${cy-size/2} ${cx+size/2},${cy} ${cx},${cy+size/2} ${cx-size/2},${cy}`;
}
function starPoints(cx: number, cy: number, size: number): string {
  const outer = size / 2, inner = outer * 0.4;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}
```

### Task E4: ★★★ P0 — 玩家棋子 + 轨迹 + 波纹

```tsx
/** 动画层组件 */
function AnimationLayer({ pieceState }: { pieceState: PlayerPieceState | null }) {
  if (!pieceState) return null;

  return (
    <g>
      {/* ===== 轨迹光痕 ===== */}
      {pieceState.trailHistory?.map((pt, i) => (
        <circle key={`trail-${i}-${pt.timestamp}`}
          cx={`${pt.x * 100}%`} cy={`${pt.y * 100}%`}
          r="1.8%" fill="#44ff88" opacity={pt.opacity * 0.7}
          className="gm-trail-fade"
        />
      ))}

      {/* ===== 玩家棋子主体 ===== */}
      {pieceState.position && (
        <g transform={`translate(${pieceState.position.x * 100}%,${pieceState.position.y * 100}%)`}
           className="gm-piece-breathe">
          {/* 外圈光晕 */}
          <circle r="5%" fill="#22cc66" opacity="0.25">
            <animate attributeName="r" values="5%;7%;5%" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0.4;0.25" dur="2.5s" repeatCount="indefinite" />
          </circle>
          {/* 中圈 */}
          <circle r="3.2%" fill="#44ff88" stroke="#aaffcc" strokeWidth="0.6" />
          {/* 内核高亮 */}
          <circle r="1.8%" fill="#88ffbb" />
          {/* 🎮 图标 */}
          <text x="0" y="0.3%" textAnchor="middle" dominantBaseline="central" fontSize="4.5%">
            🎮
          </text>
        </g>
      )}

      {/* ===== 到达波纹 ===== */}
      {pieceState.justArrived && pieceState.targetPosition && (
        <circle
          cx={`${pieceState.targetPosition.x * 100}%`}
          cy={`${pieceState.targetPosition.y * 100}%`}
          r="2%" fill="none" stroke="#44ff88" strokeWidth="1.2"
          className="gm-arrival-ripple"
        />
      )}
    </g>
  );
}
```

### Task E5: P1 — 区域进入特效监听

```tsx
function ZoneEffectLayer({ topology }: { topology: any }) {
  const [activeEffect, setActiveEffect] = useState<{
    type: string; cellId: string; at: number;
  } | null>(null);

  useEffect(() => {
    // 监听区域效果事件（由D组emit）
    const handleZoneEffect = (data: any) => {
      setActiveEffect({ type: data.zoneType, cellId: data.cellId, at: Date.now() });
      setTimeout(() => setActiveEffect(null), 2500);
    };
    
    // 尝试获取eventBus（如果全局可用的话）
    try {
      const EventBus = require('../../EventBus').default;
      const bus = EventBus.getInstance?.() ?? window.__GAME_EVENT_BUS__;
      if (bus?.on) bus.on('zone:effect:trigger' as any, handleZoneEffect);
      return () => { if (bus?.off) bus.off('zone:effect:trigger' as any, handleZoneEffect); };
    } catch {
      // eventBus不可用时静默跳过
      return undefined;
    }
  }, [topology]);

  if (!activeEffect) return null;

  const zoneBg = topology?.visualConfig?.zoneBackgrounds?.[activeEffect.type];
  const center = zoneBg?.centerPosition ?? { x: 50, y: 62 };

  return (
    <g>
      <circle
        cx={`${center.x}%`} cy={`${center.y}%`}
        r="0%"
        fill="none"
        className={zoneBg?.enterAnimClass ?? `gm-zone-${activeEffect.type.toLowerCase()}-enter`}
      >
        <animate attributeName="r" from="0%" to="35%" dur="0.8s" />
        <animate attributeName="opacity" from="0.5" to="0" dur="0.8s" />
      </circle>
    </g>
  );
}
```

### Task E6: P2 — 背景装饰层

```tsx
function DecorationLayer({ decorations }: { decorations: any[] }) {
  if (!decorations?.length) return null;

  return (
    <g opacity="0.35">
      {decations.map((dec, i) => {
        const x = (dec.position?.x ?? 0.5) * 100;
        const y = (dec.position?.y ?? 0.5) * 100;
        const s = (dec.size ?? 0.05) * 100;
        
        switch (dec.type) {
          case 'planet':
            return (
              <g key={i} transform={`translate(${x}%,${y}%) scale(${s/8})`}
                 className={dec.animClass ?? 'gm-decor-float'}>
                <circle r="8" fill={`url(#planet-grad-${i})`} />
                <circle r="10" fill="none" stroke={dec.color ?? '#4488ff'} strokeWidth="0.5" opacity="0.5" />
                <circle r="12" fill="none" stroke={dec.color ?? '#4488ff'} strokeWidth="0.2" opacity="0.3" />
                <defs>
                  <radialGradient id={`planet-grad-${i}`}>
                    <stop offset="0%" stopColor={dec.color ?? '#4488ff'} stopOpacity="0.9" />
                    <stop offset="70%" stopColor={dec.color ?? '#4488ff'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={dec.color ?? '#4488ff'} stopOpacity="0" />
                  </radialGradient>
                </defs>
              </g>
            );
          case 'cloud':
            return (
              <ellipse key={i} cx={`${x}%`} cy={`${y}%`}
                         rx={`${s * 0.8}%`} ry={`${s * 0.4}%`}
                         fill="rgba(255,255,255,0.12)"
                         className={dec.animClass ?? 'gm-decor-float'} />
            );
          case 'crystal':
            return (
              <polygon key={i}
                       points={`${x},${y-s*0.5} ${x+s*0.3},${y} ${x},${y+s*0.5} ${x-s*0.3},${y}`}
                       fill={dec.color ?? '#44ffaa'} opacity={dec.opacity ?? 0.3}
                       className={dec.animClass ?? 'gm-decor-float'} />
            );
          default:
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={`${s/2}%`}
                           fill={dec.color ?? '#888888'} opacity={dec.opacity ?? 0.2} />;
        }
      })}
    </g>
  );
}
```

### Task E7: 主组件装配

```tsx
export function GourdMapRenderer({
  topology, cells, currentPosition, highlightedCells = [], pieceState, onCellClick,
}: GourdMapRendererProps) {

  // === 计算所有格子位置（保持原有逻辑，但输出归一化坐标供SVG使用）===
  const cellPositions = useMemo(() => {
    // ... 保持原有的 cellPositions 计算逻辑不变 ...
    // 返回格式: Record<string, {x: number, y: number}> 其中 x,y 为 0-100 范围
  }, [topology]);

  const cellMap = useMemo(() => {
    const map = new Map<string, GridCell>();
    for (const c of cells) map.set(c.id, c);
    return map;
  }, [cells]);

  const resolvedCells = useMemo(() => {
    // 合并拓扑位置 + cells 数据 + 视觉样式
    const allIds = [...topology.upperCircle.cellIds, ...topology.connector.cellIds, ...topology.lowerCircle.cellIds];
    return allIds.map(id => {
      const cell = cellMap.get(id);
      const pos = cellPositions[id] ?? { x: 50, y: 50 };
      const type = cell?.type ?? 'level';
      
      // ★ 从 visualConfig 获取该类型的视觉样式
      const vc = topology.visualConfig?.cellVisualStyles?.get(type)
             ?? topology.visualConfig?.cellVisualStyles?.get('level')
             ?? DEFAULT_CELL_STYLES.get('level');
      
      // ★ 从 visualConfig 获取该状态的覆盖样式
      const state = cell?.state ?? 'locked';
      const so = topology.visualConfig?.stateVisualOverrides?.[state];

      return { id, x: pos.x, y: pos.y, type, state, cell, visualStyle: vc, stateOverride: so };
    });
  }, [topology, cellMap, cellPositions]);

  // === 贝塞尔曲线路径（保持原有逻辑）===
  const connectionElements = useMemo(() => {
    // ... 保持原有 getControlPoint + Q曲线逻辑 ...
  }, [topology.connections, cellPositions]);

  // === 葫芦形轮廓路径（保持原有逻辑）===
  const gourdOutline = useMemo(() => {
    // ... 保持原有 upperD/lowerD/connD 计算逻辑 ...
  }, [topology]);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: topology?.visualConfig?.background?.primary 
        ? `linear-gradient(180deg, ${topology.visualConfig.background.primary}, ${topology.visualConfig.background.secondary ?? '#0d0d35'})`
        : 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)',
      borderRadius: '12px', overflow: 'hidden',
    }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>

        {/* Layer -1: SVG Definitions */}
        <defs>
          {/* 在这里定义所有渐变和滤镜... */}
        </defs>

        {/* Layer 0: 背景装饰 */}
        <DecorationLayer decorations={topology?.visualConfig?.decorations} />

        {/* Layer 0.5: 葫芦形基底填充 */}
        <path d={gourdOutline.upperD} fill="rgba(30,60,30,0.2)" />
        <path d={gourdOutline.lowerD} fill="rgba(30,30,60,0.2)" />
        <path d={gourdOutline.connD} fill="rgba(30,45,45,0.2)" />

        {/* Layer 1: 区域背景 + W/N/I/P 标识 ★★★ */}
        <QuadrantLabels topology={topology} />

        {/* Layer 2: 棋盘格边框 ★★★ */}
        <CheckerboardBorder topology={topology} />

        {/* Layer 3: 连接线路径 */}
        <g>{connectionElements}</g>

        {/* Layer 4: 功能格子 ★★★（纯SVG！）*/}
        {resolvedCells.map(cell => {
          const vs = cell.visualStyle ?? {};
          return (
            <CellNode
              key={cell.id}
              cell={{...cell.cell, id: cell.id, type: cell.type}}
              config={{}} // 兼容旧接口
              position={{ x: cell.x, y: cell.y }}
              isCurrent={currentPosition === cell.id}
              isHighlighted={highlightedCells.includes(cell.id)}
              onClick={() => onCellClick?.(cell.id)}
              visualStyle={vs}
              stateOverride={cell.stateOverride}
            />
          );
        })}

        {/* Layer 5: 动画效果层 ★★★ */}
        <AnimationLayer pieceState={pieceState} />
        <ZoneEffectLayer topology={topology} />

      </svg>
    </div>
  );
}
```

## 关键改动对照表

| 改动项 | 第七轮(当前) | 第八轮(目标) | 影响 |
|--------|------------|------------|------|
| W/N/I/P fontSize | `5` (固定) | `r * 2 * 0.22` ≈ **15-17** | 从几乎不可见 → **醒目大字** |
| W/N/I/P opacity | `0.5` | `0.92` | 更清晰 |
| 边框模式 | 72段径向`<line>` | SVG `<pattern>` + `<ellipse fill="url()">` | 从细线 → **实心方格填充** |
| 格子渲染 | DOM `<div>` 绝对定位 | 纯 SVG `<circle>/<polygon>` | **统一坐标系** |
| Boss尺寸 | `size = isBoss ? 7.5 : 3` | `baseSize * sizeMultiplier(2.5)` ≈ **8.0** | 从visualConfig读取 |
| 图标 | Emoji `⚔️📚⚡` | SVG `<path d={GRID_ICONS[type]}>` | **矢量精美图标** |
| 玩家棋子 | 🎮覆盖在当前格div上 | 独立SVG `<g>` + 呼吸动画 + 轨迹 + 波纹 | **完整动画系统** |
| CSS动画 | 2种内联@keyframes | 14种外部CSS `.gm-*` 类名 | **丰富动效** |
| 数据来源 | 全部硬编码 | 从 `topology.visualConfig.*` 读取 | **数据驱动渲染** |

## 验收标准

1. ✅ W/N/I/P fontSize ≥ 14（viewBox单位），肉眼清晰可见粗体字母
2. ✅ 边框呈现橙黄白**方格交替填充**图案（非径向线段）
3. ✅ Boss格视觉面积约为普通格的 **2.5倍**
4. ✅ 所有格子使用 **SVG形状**（非DOM div），坐标完全对齐
5. ✅ 格子图标为 **SVG path**（非Emoji），至少 start/boss/battle/bookstore/skill 有独特图形
6. ✅ 玩家棋子可见：绿色圆形 + 内核 + 🎮 + **呼吸动画**
7. ✅ 移动时显示 **≥3个渐隐轨迹光点**
8. ✅ 到达新格时有 **扩散波纹动画**
9. ✅ Boss格有 **boss-emerge 弹性登场动画** + **pulse 光环**
10. ✅ 精英格有 **elite-jagged 锯齿抖动**
11. ✅ 上圆中央有 **星球装饰** + 发光效果
12. ✅ 全部14种CSS动画可正常触发
13. ✅ **零硬编码数值**：所有视觉参数从 topology.visualConfig 读取
14. ✅ TypeScript 编译无错误
