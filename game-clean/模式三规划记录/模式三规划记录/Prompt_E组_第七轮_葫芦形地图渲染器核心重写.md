# E组第七轮 — 葫芦形地图渲染器（核心重写）

## 背景

**这是第七轮工作量最大、最关键的组别。**

当前 `LayerMapRenderer`（[LayerMapRenderer/index.tsx](file:///d:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\components\LayerMapRenderer\index.tsx)）是一个**通用矩形网格渲染器**，存在以下致命问题：

1. ❌ 使用 `[row, col]` 矩形坐标 → 格子排成方阵，不是葫芦形
2. ❌ `cellWidth = 100/gridSize.cols` 均匀分布 → 无轮廓感
3. ❌ 背景是CSS细线网格 → 不是手绘风格
4. ❌ 线路是 `<line>` 直线 → 不沿葫芦轮廓
5. ❌ 格子全是相同大小的圆角矩形 → Boss格没有2.5倍大小
6. ❌ W/N/I/P 是10px小字 → 应该是大号粗体填充象限
7. ❌ 无棋盘格边框 → 参考图有醒目的橙黄白棋盘格

**E组需要创建全新的 `GourdMapRenderer` 组件，完全替代 LayerMapRenderer。**

## 参考图（海幸）必须实现的视觉效果

```
╔══════════════════════════════╗  ← 橙黄白棋盘格粗边框 (clip-path)
║  ┌──────────────┐             ║
║  │   ○ 星球      │  ╲          ║  ← 上小圆 + 中央装饰
║  └──────┬───────┘    ╲         ║
║    ═════╧═════       ╲        ║  ← 连接通道（腰部收窄）
║  ┌─────────────────────┐     ║
║  │  W ║█████████████╣ N │     ║  ← 下大圆 + 四象限 + 大号字母
║  ├────╫─────────────╫────┤     ║  ← 十字分割线
║  │  I ║█████████████╣ P │     ║
║  └─────────────────────┘ end→ ║
╚══════════════════════════════╝
```

## 任务目标

从零实现 `GourdMapRenderer` React组件，使其渲染效果接近海幸参考图。

> **边界说明**：
> - E组消费 C 组的 RenderableGourdMapTopology
> - E组使用 A 组的 GourdCoordinateCalculator 进行坐标转换
> - E组监听 D 组的移动事件来更新玩家棋子位置
> - E组只负责渲染，不包含游戏逻辑

## 具体任务

### Task E1: GourdMapRenderer 主组件

创建文件 `src/tower-mode/components/GourdMapRenderer/index.tsx`：

```typescript
interface GourdMapRendererProps {
  /** 完整的渲染拓扑数据（来自C组） */
  topology: RenderableGourdMapTopology;
  
  /** 当前玩家所在格子ID */
  currentCellId: string | null;
  
  /** 高亮的格子ID列表（可达路径） */
  highlightedCells: string[];
  
  /** 玩家棋子状态（来自D组事件） */
  pieceState: PlayerPieceState | null;
  
  /** 回调：点击格子 */
  onCellClick: (cellId: string) => void;
  
  /** 容器尺寸 */
  width?: number;
  height?: number;
}

export function GourdMapRenderer(props: GourdMapRendererProps): JSX.Element
```

**渲染层次（6层，从底到顶）**：

```
Layer 0: 背景层 — 主背景色 + 噪点纹理 + 装饰元素(星球/云朵/山脉)
Layer 1: 区域层 — 四个象限的半透明背景 + W/N/I/P 大号标识
Layer 2: 边框层 — 棋盘格裁剪边框（clip-path: gourd outline）
Layer 3: 线路层 — 曲线SVG路径（主路/分支/捷径/返回）
Layer 4: 格子层 — 每个格子的圆形/椭圆形节点（大小/样式因类型而异）
Layer 5: 动画层 — 玩家棋子 + 移动轨迹光痕 + 到达波纹 + 区域进入特效
```

### Task E2: 背景层实现

```typescript
/** BackgroundLayer 组件 */
function BackgroundLayer({ background }: { background: RenderableGourdMapTopology['background'] }): JSX.Element {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: background.primary,
      // 噪点纹理叠加（用 SVG filter 或 CSS noise）
    }}>
      {/* 装饰元素 */}
      {background.decorations?.map((dec, i) => (
        <DecorationElement key={i} {...dec} />
      ))}
    </div>
  );
}
```

### Task E3: 区域层与象限标识（W/N/I/P）

```typescript
/** ZoneLayer 组件 — 四象限区域背景 + 大号字母标识 */
function ZoneLayer({ topology }: { topology: RenderableGourdMapTopology }): JSX.Element {
  const { quadrantLabels, zoneBackgrounds, svgPaths } = topology;
  
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {/* 各象限半透明背景 */}
      {quadrantLabels.map(q => (
        <g key={q.quadrant}>
          {/* 象限背景填充 */}
          <path d={getQuadrantPath(q.quadrant, svgPaths)} 
                fill={zoneBackgrounds.get(q.quadrant)?.backgroundData}
                opacity={zoneBackgrounds.get(q.quadrant)?.opacity} />
          
          {/* 大号 W/N/I/P 标识 */}
          <text x={getQuadrantCenter(q.quadrant).x + '%'}
                y={getQuadrantCenter(q.quadrant).y + '%'}
                fill={q.color}
                fontSize={`${q.fontSizeRatio * 100}%`}
                fontWeight={q.fontWeight}
                textAnchor="middle"
                dominantBaseline="central">
            {q.label}
          </text>
        </g>
      ))}
      
      {/* 十字分割线 */}
      <path d={svgPaths.quadrantDividers.horizontal} stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
      <path d={svgPaths.quadrantDividers.vertical} stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}
```

**关键**: W/N/I/P 字体大小必须大！`fontSizeRatio: 0.18` 意味着占下圆直径的18%，非常醒目。

### Task E4: 棋盘格边框层

```typescript
/** BorderLayer 组件 — 橙黄白棋盘格裁剪边框 */
function BorderLayer({ border, outlinePath }: { border: CheckerboardBorder; outlinePath: string }): JSX.Element {
  if (!border.enabled) return null;
  
  return (
    <div style={{
      position: 'absolute',
      inset: -border.borderWidth,
      // 使用 SVG pattern 创建棋盘格
      backgroundImage: `
        repeating-conic-gradient(
          ${border.colors[0]} 0% 25%,
          ${border.colors[1]} 25% 50%,
          ${border.colors[0]} 50% 75%,
          ${border.colors[1]} 75% 100%
        )
      `,
      backgroundSize: `${border.tileSize * 2}px ${border.tileSize * 2}px`,
      borderRadius: border.borderRadius,
      padding: border.padding,
      // 用 clip-path 裁剪成葫芦形！
      clipPath: `path('${outlinePath}')`,
      // 外发光效果
      boxShadow: `0 0 ${border.borderWidth}px rgba(255,170,0,0.6), inset 0 0 ${border.borderWidth/2}px rgba(0,0,0,0.3)`,
      pointerEvents: 'none',
      zIndex: 2,
    }} />
  );
}
```

### Task E5: 曲线路径层

```typescript
/** PathLayer 组件 — 替代直线为曲线路径 */
function PathLayer({ topology }: { topology: RenderableGourdMapTopology }): JSX.Element {
  const { paths, pathVisualStyles, gourdCoordinates } = topology;
  
  return (
    <svg style={{ position: 'absolute', inset: 0 }}>
      {paths.map(path => {
        const fromCoord = gourdCoordinates.get(path.from);
        const toCoord = gourdCoordinates.get(path.to);
        if (!fromCoord || !toCoord) return null;
        
        const style = pathVisualStyles.get(path.pathType);
        
        // 使用贝塞尔曲线路径替代 <line>
        const curvePath = generateBezierPath(
          fromCoord.cartesian,
          toCoord.cartesian,
          style.curveTension
        );
        
        return (
          <g key={path.id}>
            {/* 道路底层（加粗显示） */}
            <path d={curvePath}
                  fill="none"
                  stroke={style.strokeColor}
                  strokeWidth={style.strokeWidth + 4}
                  opacity="0.15"
                  strokeLinecap="round" />
            {/* 道路面 */}
            <path d={curvePath}
                  fill="none"
                  stroke={style.strokeColor}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.dashed ? style.dashPattern : undefined}
                  opacity="0.7"
                  strokeLinecap="round" />
            {/* 单向箭头 */}
            {!path.isBidirectional && style.arrowHead && (
              <marker ... />  // 箭头标记
            )}
          </g>
        );
      })}
    </svg>
  );
}
```

### Task E6: 格子节点层（核心）

```typescript
/** CellNode 组件 — 单个格子节点 */
function CellNode({ 
  cell, 
  coord, 
  visualStyle, 
  stateOverride,
  isHighlighted,
  isCurrentPlayer,
  onClick 
}: {
  cell: GridCell;
  coord: GourdCoordinate;
  visualStyle: CellVisualStyle;
  stateOverride: CellStateVisualOverride;
  isHighlighted: boolean;
  isCurrentPlayer: boolean;
  onClick: () => void;
}): JSX.Element {
  
  const size = baseSize * visualStyle.sizeMultiplier;  // Boss格 2.5倍!
  
  return (
    <g
      transform={`translate(${coord.cartesian.x * 100}%, ${coord.cartesian.y * 100}%)`}
      onClick={onClick}
      style={{ cursor: cell.state === 'locked' ? 'not-allowed' : 'pointer' }}
    >
      {/* 格子主体 —— 根据 shape 渲染不同形状 */}
      {visualStyle.shape === 'circle' && (
        <ellipse
          rx={`${size/2}%`} ry={`${size/2}%`}
          fill={`url(#cell-grad-${cell.id})`}
          stroke={visualStyle.border.color}
          strokeWidth={visualStyle.border.width}
          strokeDasharray={visualStyle.border.style === 'dashed' ? '4,4' : undefined}
          opacity={stateOverride.opacity}
          filter={stateOverride.filter}
        />
      )}
      
      {/* 发光效果（当前所在格 / Boss格） */}
      {(isCurrentPlayer || visualStyle.glowEffect) && (
        <ellipse
          rx={`${size/2 + visualStyle.glowEffect.size/2}%`} 
          ry={`${size/2 + visualStyle.glowEffect.size/2}%`}
          fill="none"
          stroke={visualStyle.glowEffect.color}
          strokeWidth="2"
          className={visualStyle.glowEffect.pulse ? 'glow-pulse' : ''}
        />
      )}
      
      {/* 格子图标（SVG，非Emoji！） */}
      <foreignObject ... >
        {renderIcon(visualStyle.icon)}
      </foreignObject>
      
      {/* 难度星级 ★~★★★★ */}
      {cell.difficultyLevel > 0 && (
        <text y={`${size/2 + 8}%`} ...>
          {'★'.repeat(cell.difficultyLevel)}
        </text>
      )}
      
      {/* 精英格锯齿边框 */}
      {cell.isElite && (
        <ellipse
          rx={`${size/2 + 4}%`} ry={`${size/2 + 4}%`}
          fill="none"
          stroke="#FF0000"
          strokeWidth="2"
          strokeDasharray="3,3"
          className="elite-jagged"
        />
      )}
      
      {/* 状态覆盖图标 ✓/✗/🔒 */}
      {stateOverride.overlayIcon && (
        <text ...>{stateOverride.overlayIcon}</text>
      )}
      
      {/* 玩家棋子指示器 */}
      {isCurrentPlayer && (
        <circle r={`${Math.min(size)/4}%`} fill="#44ff88">
          <animate attributeName="r" values={`${Math.min(size)/4};${Math.min(size)/3};${Math.min(size)/4}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}
```

### Task E7: 玩家棋子与动画层

```typescript
/** AnimationLayer 组件 — 玩家棋子 + 移动轨迹 + 特效 */
function AnimationLayer({ pieceState, topology }: { 
  pieceState: PlayerPieceState; 
  topology: RenderableGourdMapTopology 
}): JSX.Element {
  
  return (
    <>
      {/* 移动轨迹光痕残留 */}
      {pieceState.trailHistory.map((point, i) => (
        <circle
          key={`trail-${i}`}
          cx={`${point.x * 100}%`}
          cy={`${point.y * 100}%`}
          r="3%"
          fill="#44ff88"
          opacity={point.opacity * 0.5}
        />
      ))}
      
      {/* 玩家棋子 */}
      {pieceState.position && (
        <g transform={`translate(${pieceState.position.x * 100}%, ${pieceState.position.y * 100}%)`}>
          {/* 棋子外圈 */}
          <circle r="6%" fill="#22cc66" stroke="#ffffff" strokeWidth="2" />
          {/* 棋子内圈 */}
          <circle r="4%" fill="#44ff88" />
          {/* 棋子图标 🎮 */}
          <text textAnchor="middle" dominantBaseline="central" fontSize="8px">🎮</text>
        </g>
      )}
      
      {/* 到达波纹（到达新格子时触发） */}
      {pieceState.justArrived && (
        <circle
          cx={`${pieceState.targetPosition.x * 100}%`}
          cy={`${pieceState.targetPosition.y * 100}%`}
          r="0%"
          fill="none"
          stroke="#44ff88"
          strokeWidth="2"
        >
          <animate attributeName="r" from="0%" to="20%" dur="0.6s" />
          <animate attributeName="opacity" from="1" to="0" dur="0.6s" />
        </circle>
      )}
    </>
  );
}
```

### Task E8: CSS动画定义

在 GourdMapRenderer 中嵌入关键CSS动画：

```css
/* Boss格脉动光环 */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 8px var(--glow-color)); }
  50% { opacity: 1; filter: drop-shadow(0 0 16px var(--glow-color)); }
}

/* 待处理状态橙色闪烁 */
@keyframes pulse-orange {
  0%, 100% { box-shadow: 0 0 8px #FF8800; }
  50% { box-shadow: 0 0 20px #FF8800; }
}

/* 精英格锯齿抖动 */
@keyframes elite-jagged {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.02) rotate(1deg); }
  75% { transform: scale(0.98) rotate(-1deg); }
}

/* 区域进入特效 */
@keyframes ripple-enter {
  0% { transform: scale(0.8); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}
@keyframes sparkle-enter { /* N区域星光 */ ... }
@keyframes flash-enter { /* I区域闪烁 */ ... }
@keyframes countdown-enter { /* P区域倒计时 */ ... }
@keyframes warning-enter { /* D区域警告 */ ... }

/* Boss登场动画 */
@keyframes boss-emerge {
  0% { transform: scale(0) translateY(20px); opacity: 0; }
  60% { transform: scale(1.1) translateY(-5px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
```

## 与其他组的接口约定

| 接口 | 来源 | 使用于 |
|------|------|--------|
| `RenderableGourdMapTopology` | C组 | 渲染数据源 |
| `GourdCoordinateCalculator` | A组 | 坐标验证 |
| `PlayerPieceState` | D组事件 | 棋子位置更新 |
| `GameEventMap` (move/update/end) | D组 | 动画驱动 |

## 验收标准

1. ✅ 地图外形为葫芦形（非矩形网格）
2. ✅ 棋盘格橙黄白边框清晰可见（clip-path裁剪）
3. ✅ W/N/I/P 为大号粗体字母（占下圆直径15%+）
4. ✅ 四象限有十字分割线和独立背景色
5. ✅ 格子沿葫芦轮廓分布（上圆密集、下圆分散）
6. ✅ Boss格比普通格大2.5倍，有红色脉动光环
7. ✅ 线路为曲线（非直线），主路更粗更亮
8. ✅ 玩家棋子可见（绿色圆+🎮图标）
9. ✅ 移动时有轨迹光痕残留
10. ✅ 到达时有弹性波纹扩散效果
11. ✅ 区域进入时有对应动画（波纹/星光/闪烁/倒计时/警告）
12. ✅ 完全替换旧的 LayerMapRenderer（不并存）
