# E组第八轮 — GourdMapRenderer 视觉表现层全面升级（核心重点）

## 背景

第七轮E组创建了GourdMapRenderer并成功集成到TowerModeApp，实现了葫芦形坐标分布、曲线路径、基本轮廓等"骨架"。但实际渲染效果与海幸参考图仍有巨大差距（第七轮报告评估渲染层完成度仅60%）。

**第八轮E组的唯一目标：让已有的数据和引擎在屏幕上真正呈现出接近参考图的视觉效果。**

## 当前实现 vs 目标效果对照

| # | 当前(第七轮) | 目标(海幸参考) | 第八轮任务 |
|---|-------------|---------------|-----------|
| 1 | W/N/I/P: fontSize=5, opacity=0.5 | 大号粗体字母填充象限，醒目 | **P0: 象限标识放大** |
| 2 | 边框: 36段径向橙黄白细线 | 棋盘格实心方格交替填充的粗边框 | **P0: 边框改为方格填充模式** |
| 3 | 所有格子统一大小(~40px) | Boss格是普通格2.5倍大 | **P0: Boss格差异化尺寸** |
| 4 | 格子图标: Emoji (⚔️📚⚡) | SVG精美图标/插图 | **P1: SVG图标替换Emoji** |
| 5 | 无玩家棋子可见 | 绿色圆+🎮图标棋子 | **P0: 玩家棋子渲染** |
| 6 | 无移动轨迹光痕 | 移动时留下渐隐绿色光点 | **P1: 移动轨迹渲染** |
| 7 | 无到达波纹 | 到达新格时有环形波纹扩散 | **P1: 到达波纹动画** |
| 8 | 无CSS动画 | Boss脉动/区域进入/精英抖动等 | **P1: CSS动画接入** |
| 9 | 无背景装饰元素 | 星球/云朵/山脉等地形装饰 | **P2: 背景装饰层** |
| 10 | 格子全圆形 | circle/ellipse/hexagon按类型区分 | **P2: 格子形状差异化** |

## 任务目标

对 GourdMapRenderer 进行全面的视觉升级，使其渲染结果达到参考图的 **80%+ 相似度**。

> **边界说明**：
> - E组消费 A 组的 GRID_ICONS（SVG图标库）、DEFAULT_CELL_VISUAL_STYLES、gourdAnimations.css
> - E组消费 B 组修正后的 visualData（大号W/N/I/P、方格边框、Boss 2.5x）
> - E组消费 D 组的 PlayerPieceState 和移动事件
> - E组**不修改**任何数据层的代码，只负责渲染

## 具体任务

### Task E0: 导入A组资源

```typescript
// 在 GourdMapRenderer 顶部添加:
import { GRID_ICONS } from '../../assets/gridIcons';
import { DEFAULT_CELL_VISUAL_STYLES } from '../../types/visualAssets.types';
import '../../styles/gourdAnimations.css';  // 引入全部CSS动画
```

### Task E1: P0 — W/N/I/P 象限标识大幅放大（重写 quadrantElements）

```typescript
// 替换第七版的 quadrantElements（fontSize=5, opacity=0.5）
// 第八版:
const quadrantElements = useMemo(() => {
  const lc = topology.lowerCircle;
  const cx = lc.center.x;
  const cy = lc.center.y;
  const r = lc.radius * 0.85;
  
  // 从B组visualData获取配置（优先使用，否则用默认）
  const labels = topology.visualConfig?.quadrantLabels ?? [
    { quadrant:'W', label:'W', fontSizeRatio:0.22, color:'#FF8800', fontWeight:'900' },
    { quadrant:'N', label:'N', fontSizeRatio:0.22, color:'#FFCC00', fontWeight:'900' },
    { quadrant:'I', label:'I', fontSizeRatio:0.22, color:'#FFCC00', fontWeight:'900' },
    { quadrant:'P', label:'P', fontSizeRatio:0.22, color:'#FF8800', fontWeight:'900' },
  ];
  
  // 计算字体大小：基于下圆直径的百分比 → 转换为viewBox单位
  const baseFontSize = r * 2 * (labels[0]?.fontSizeRatio ?? 0.22);
  
  return (
    <g>
      {/* 十字分割线 —— 加粗 */}
      <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />
      <line x1={cx} y1={cy-r} x2={cx} y2={cy+r} stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />
      
      {/* 四个大号字母 */}
      {labels.map((q, i) => {
        const offsets = [
          { x: -r*0.38, y: -r*0.38 },  // W: 左上
          { x: r*0.38,  y: -r*0.38 },   // N: 右上
          { x: -r*0.38, y: r*0.38 },   // I: 左下
          { x: r*0.38,  y: r*0.38 },    // P: 右下
        ];
        const off = offsets[i];
        return (
          <text key={q.quadrant}
            x={(cx + off.x) + '%'}
            y={(cy + off.y) + '%'}
            fill={q.color}
            fontSize={`${baseFontSize}%`}
            fontWeight={q.fontWeight ?? '900'}
            fontFamily='"Arial Black", "Impact", sans-serif'
            textAnchor="middle"
            dominantBaseline="central"
            opacity="0.9"
            stroke="#FFFFFF"
            strokeWidth="0.5"
            paintOrder="stroke fill"
            style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.7))' }}
          >
            {q.label}
          </text>
        );
      })}
    </g>
  );
}, [topology]);
```

**关键变化**: `fontSize` 从固定值5 → 动态计算为下圆直径的22%（约14~18个viewBox单位），opacity从0.5→0.9，增加描边和阴影。

### Task E2: P0 — 棋盘格边框改为方格填充模式

```typescript
// 替换第七版的 borderElements（径向36段细线）
// 第八版: 使用 CSS repeating-conic-gradient 或 SVG pattern
const borderLayer = useMemo(() => {
  const borderConfig = topology.visualConfig?.border;
  if (!borderConfig?.enabled || borderConfig.mode !== 'checkerboard-fill') {
    // 回退到旧版径向线段
    return <g>{/* 第七版 borderElements */}</g>;
  }
  
  const [uc, lc] = [topology.upperCircle, topology.lowerCircle];
  
  return (
    <defs>
      {/* 定义棋盘格 pattern */}
      <pattern id="checker-pattern" 
              width={borderConfig.tileSize} height={borderConfig.tileSize}
              patternUnits="userSpaceOnUse">
        <rect width={borderConfig.tileSize/2} height={borderConfig.tileSize/2}
              fill={borderConfig.colors[0]} rx={borderConfig.cornerRadius}/>
        <rect width={borderConfig.tileSize/2} height={borderConfig.tileSize/2}
              fill={borderConfig.colors[1]} rx={borderConfig.cornerRadius}
              x={borderConfig.tileSize/2} y={borderConfig.tileSize/2}/>
        <rect width={borderConfig.tileSize/2} height={borderConfig.tileSize/2}
              fill={borderConfig.colors[1]} rx={borderConfig.cornerRadius}
              x={0} y={borderConfig.tileSize/2}/>
        <rect width={borderConfig.tileSize/2} height={borderConfig.tileSize/2}
              fill={borderConfig.colors[0]} rx={borderConfig.cornerRadius}
              x={borderConfig.tileSize/2} y={0}/>
      </pattern>
      
      {/* 外发光 filter */}
      <filter id="border-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
      </filter>
    </defs>
    
    <g filter="url(#border-glow)">
      {/* 上圆棋盘格裁剪区域 */}
      <ellipse cx={uc.center.x + '%'} cy={uc.center.y + '%'} 
               rx={(uc.radius + borderConfig.borderWidth/2) + '%'} 
               ry={(uc.radius * 0.85 + borderConfig.borderWidth/2) + '%'}
               fill="url(#checker-pattern)" 
               stroke={borderConfig.colors[0]} strokeWidth="1" opacity={borderConfig.opacity}/>
      
      {/* 下圆棋盘格裁剪区域 */}
      <ellipse cx={lc.center.x + '%'} cy={lc.center.y + '%'} 
               rx={(lc.radius + borderConfig.borderWidth/2) + '%'} 
               ry={(lc.radius * 0.85 + borderConfig.borderWidth/2) + '%'}
               fill="url(#checker-pattern)"
               stroke={borderConfig.colors[0]} strokeWidth="1" opacity={borderConfig.opacity}/>
    </g>
  );
}, [topology]);
```

### Task E3: P0 — Boss格2.5倍大小 + 精英格锯齿

```typescript
// 在 CellNode 渲染中读取 sizeMultiplier:
const cellStyle = cell.type === 'boss' 
  ? (topology.visualConfig?.cellVisualStyles?.get('boss') ?? DEFAULT_CELL_VISUAL_STYLES.get('boss'))
  : (topology.visualConfig?.cellVisualStyles?.get(cell.type) ?? DEFAULT_CELL_VISUAL_STYLES.get(cell.type));

const nodeSize = baseNodeSize * cellStyle.sizeMultiplier;  // Boss = 2.5x!

// 精英格额外处理:
if (cell.isElite) {
  return (
    <g className="elite-jagged">  {/* 接入A组CSS动画 */}
      <ellipse .../>  {/* 正常格子 */}
      <ellipse rx={nodeSize*0.55 + '%'} ry={nodeSize*0.55 + '%'}
               fill="none" stroke="#FF0000" strokeWidth="1.5"
               strokeDasharray="2,2" />  {/* 锯齿边框 */}
      {/* 骷髅小图标 */}
      <text fontSize={nodeSize*0.25 + '%'}>💀</text>
    </g>
  );
}
```

### Task E4: P0 — 玩家棋子渲染层

```tsx
{/* AnimationLayer 组件 —— 新增到 GourdMapRenderer */}
function AnimationLayer({ pieceState }: { pieceState: PlayerPieceState | null }) {
  if (!pieceState?.position) return null;
  
  return (
    <>
      {/* 轨迹光痕残留 */}
      {pieceState.trailHistory.map((pt, i) => (
        <circle key={`trail-${i}`}
          cx={`${pt.x * 100}%`} cy={`${pt.y * 100}%`}
          r="2%"
          fill="#44ff88"
          opacity={pt.opacity * 0.6}>
          <animate attributeName="opacity" from={pt.opacity * 0.6} to="0" dur="1s" fill="freeze" />
        </circle>
      ))}
      
      {/* 玩家棋子主体 */}
      <g transform={`translate(${pieceState.position.x * 100}%, ${pieceState.position.y * 100}%)`}
         className="piece-breathe">  {/* 呼吸动画 */}
        {/* 外圈光晕 */}
        <circle r="5%" fill="#22cc66" opacity="0.3">
          <animate attributeName="r" values="5%;7%;5%" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* 中圈 */}
        <circle r="3.5%" fill="#44ff88" stroke="#ffffff" strokeWidth="0.8" />
        {/* 内核 */}
        <circle r="2%" fill="#88ffaa" />
        {/* 图标 🎮 */}
        <text x="0" y="0.5%" textAnchor="middle" dominantBaseline="central" fontSize="5%">🎮</text>
      </g>
      
      {/* 到达波纹（justArrived 时触发） */}
      {pieceState.justArrived && (
        <circle cx={`${pieceState.targetPosition.x * 100}%`} 
                cy={`${pieceState.targetPosition.y * 100}%`}
                r="0%" fill="none" stroke="#44ff88" strokeWidth="1.5"
                className="arrival-ripple">
          <animate attributeName="r" from="0%" to="25%" dur="0.6s" />
          <animate attributeName="opacity" from="0.8" to="0" dur="0.6s" />
        </circle>
      )}
    </>
  );
}
```

### Task E5: P1 — SVG图标替换Emoji

```tsx
// 在 CellNode 中:
{cellStyle.icon.type === 'svg' ? (
  <foreignObject x={`${-nodeSize/2}%`} y={`${-nodeSize/2}%`}
                  width={`${nodeSize}%`} height={`${nodeSize}%`}>
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d={GRID_ICONS[cell.type] ?? GRID_ICONS['level']} 
            fill={cellStyle.icon.color || '#ffffff'} />
    </svg>
  </foreignObject>
) : (
  // fallback to emoji if no SVG icon
  <text textAnchor="middle" dominantBaseline="central" 
        fontSize={`${nodeSize * 0.4}%`}>
    {cellStyle.icon.data}
  </text>
)}
```

### Task E6: P1 — 区域进入特效

当玩家进入某象限时触发对应动画：

```tsx
{/* 在 GourdMapRenderer 中监听 zone:effect:trigger 事件 */}
useEffect(() => {
  const handleZoneEffect = (data: { zoneType: string; cellId: string }) => {
    setActiveZoneEffect({ type: data.zoneType, cellId: data.cellId, at: Date.now() });
    // 3秒后清除
    setTimeout(() => setActiveZoneEffect(null), 3000);
  };
  eventBus.on('zone:effect:trigger', handleZoneEffect);
  return () => eventBus.off('zone:effect:trigger', handleZoneEffect);
}, []);

// 渲染区域特效:
{activeZoneEffect && (
  <g>
    <circle cx={getQuadrantCenter(activeZoneEffect.type).x + '%'} 
            cy={getQuadrantCenter(activeZoneEffect.type).y + '%'}
            r="0%" fill="none" 
            className={`${activeZoneEffect.type.toLowerCase()}-enter`}>
      <animate attributeName="r" from="0%" to="35%" dur="0.8s" />
      <animate attributeName="opacity" from="0.6" to="0" dur="0.8s" />
    </circle>
  </g>
)}
```

### Task E7: P2 — 背景装饰元素层

```tsx
function DecorationLayer({ decorations }: { decorations: RenderableGourdMapTopology['background']['decorations'] }) {
  if (!decorations?.length) return null;
  
  return (
    <g opacity="0.4">
      {decorations.map((dec, i) => {
        if (dec.type === 'planet') {
          return <g key={i} transform={`translate(${dec.position.x*100}%,${dec.position.y*100}%) scale(${dec.size})`}>
            <circle r="10%" fill="url(#planet-gradient)" />
            <circle r="12%" fill="none" stroke="#4488ff" strokeWidth="0.5" opacity="0.5" />
          </g>;
        }
        if (dec.type === 'cloud') {
          return <ellipse key={i} cx={`${dec.position.x*100}%`} cy={`${dec.position.y*100}%`}
                         rx={`${dec.size*0.8}%`} ry={`${dec.size*0.4}%`}
                         fill="rgba(255,255,255,0.15)" />;
        }
        // ... mountain / river / tree
      })}
    </g>
  );
}
```

## 渲染层次更新（第八版）

```
Layer -2: CSS动画定义 (<style>导入)
Layer -1: SVG defs (patterns/filters/gradients)
Layer  0: 背景层 — 主色渐变 + 噪点纹理 + 装饰元素(星球/云朵)
Layer  1: 区域层 — 四象限半透明背景 + W/N/I/P **大号标识**(fontSize≥14) + 十字线
Layer  2: 边框层 — **棋盘格实心方格填充**(非径向线) + 外发光
Layer  3: 线路层 — 贝塞尔曲线路径（保持第七版不变）
Layer  4: 格子层 — **差异化大小**(Boss 2.5x) + **SVG图标**(非Emoji) + 状态覆盖
Layer  5: 动画层 — **玩家棋子**(绿圆+🎮) + **轨迹光痕** + **到达波纹** + 区域进入特效
```

## 与其他组的接口约定

| 接口 | 来源 | 使用于 |
|------|------|--------|
| `GRID_ICONS` | A组 assets | 格子图标SVG |
| `DEFAULT_CELL_VISUAL_STYLES` | A组 types | 默认样式回退 |
| `gourdAnimations.css` | A组 styles | CSS动画类名 |
| `visualConfig` (修正后) | B组 | W/N/I/P参数、边框mode、Boss配置 |
| `PlayerPieceState` | D组事件 | 棋子位置和轨迹 |
| `GameEventMap` (move/zone) | D组 | 动画驱动事件 |

## 验收标准

1. ✅ W/N/I/P 标识 fontSize ≥ 14（viewBox单位），opacity ≥ 0.85
2. ✅ 边框呈现为橙黄白方格交替填充（非径向线段）
3. ✅ Boss格视觉大小约为普通格的2.5倍
4. ✅ 格子图标使用SVG path（非Emoji），至少start/boss/battle/bookstore/skill有独特图标
5. ✅ 玩家棋子可见（绿色圆+🎮+呼吸动画）
6. ✅ 移动时显示轨迹光痕（最少3个渐隐点）
7. ✅ 到达新格子时有波纹扩散动画
8. ✅ 进入W/N/I/P区域时有对应动画（ripple/sparkle/flash/countdown）
9. ✅ Boss格有 pulse 光环动画
10. ✅ 精英格有 jagged 抖动动画
11. ✅ 上圆中央有星球装饰元素
12. ✅ 全部12种CSS动画正常工作
