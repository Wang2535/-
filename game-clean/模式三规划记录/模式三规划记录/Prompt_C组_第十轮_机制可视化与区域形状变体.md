# C组第十轮 — 机制可视化器 + 区域形状变体

## 背景

A组解决了"形状不同"，B组解决了"格子布局不同"。但还有一个关键差距：

> **Gap-P0-3: 层级特殊机制仅存在于数据层面，视觉未体现**
> - layerMechanic.type='teleport' 存在，但玩家看不到传送门
> - layerMechanic.type='blockade' 存在，但看不到被阻塞的路径
> - layerMechanic.type='collapse' 存在，但看不到坍缩裂纹

本组目标：**让每层的特殊机制在地图上"看得见"**。

## 具体任务

### Task C1: ★★★ P0 — MechanicVisualizer 机制可视化器

**新建文件**: `src/tower-mode/components/GourdMapRenderer/MechanicVisualizer.tsx`

```tsx
/**
 * MechanicVisualizer — 层级特殊机制可视化
 * 
 * 根据当前层 layerMechanic.type，在地图上渲染对应的视觉提示：
 * 
 * | 机制类型 | 视觉效果 |
 * |---------|---------|
 * | acceleration | W区连击进度条(3段填充) |
 * | jump | 可跳跃目标高亮圈(虚线脉冲环) |
 * | sequence | 三环访问顺序指示(①②③标记) |
 * | event | 街区事件气泡(随机漂浮?图标) |
 * | blockade | 被阻塞路径红色X动画 |
 * | teleport | 迷路雾效+传送门光柱 |
 * | drift | 方向偏移箭头场(背景流动箭头) |
 * | collapse | 坍缩裂纹线+危险区域闪烁 |
 * | protocol | 正确踩格顺序指引线(金色虚线路径) |
 */

import { useMemo } from 'react';
import type { LayerSpecialMechanicData } from '../../types/gameMechanics.types';

interface MechanicVisualizerProps {
  mechanicType: string;
  mechanicData?: LayerSpecialMechanicData;
  cellPositions: Record<string, { x: number; y: number }>;
  connections: Array<{ id: string; from: string; to: string; type: string }>;
  playerPosition?: string;
  wStreakCount?: number;
  blockedPathIds?: Set<string>;
  activeSequenceStep?: number;
  protocolCorrectPath?: string[];
}

export function MechanicVisualizer({
  mechanicType, mechanicData, cellPositions, connections,
  playerPosition, wStreakCount = 0, blockedPathIds,
  activeSequenceStep, protocolCorrectPath,
}: MechanicVisualizerProps) {

  const renderMechanic = () => {
    switch (mechanicType) {
      case 'acceleration': return <AccelerationViz wStreak={wStreakCount} maxProgress={3} />;
      case 'jump': return <JumpViz cellPositions={cellPositions} />;
      case 'sequence': return <SequenceViz currentStep={activeSequenceStep ?? 0} totalSteps={3} />;
      case 'event': return <EventViz />;
      case 'blockade': return <BlockadeViz blockedPaths={blockedPathIds} connections={connections} />;
      case 'teleport': return <TeleportViz cellPositions={cellPositions} />;
      case 'drift': return <DriftViz />;
      case 'collapse': return <CollapseViz />;
      case 'protocol': return <ProtocolViz correctPath={protocolCorrectPath ?? []} cellPositions={cellPositions} />;
      default: return null;
    }
  };

  return (
    <g className="mechanic-visualizer" pointerEvents="none">
      {renderMechanic()}
    </g>
  );
}

// ========== 各机制可视化子组件 ==========

/** L1 加速: W区连击进度条 */
function AccelerationViz({ wStreak, maxProgress }: { wStreak: number; maxProgress: number }) {
  const progress = Math.min(wStreak, maxProgress);
  const filled = Array.from({ length: progress }, (_, i) => i);
  
  return (
    <g transform="translate(25, 45)">
      {/* 进度条背景 */}
      <rect x="0" y="0" width="50" height="6" rx="3" fill="rgba(255,107,107,0.15)" stroke="#FF6B6B" strokeWidth="0.3" />
      {/* 已填充段 */}
      {filled.map(i => (
        <rect key={i} x={2 + i * 15.5} y="1.5" width="14" height="3" rx="1.5"
              fill="#FF6B6B" opacity="0.8">
          {i === progress - 1 && (
            <animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" />
          )}
        </rect>
      ))}
      {/* 标签 */}
      <text x="25" y="-3" textAnchor="middle" fontSize="2.2%" fill="#FF6B6B" fontWeight="700">
        扩散加速 {progress}/{maxProgress}
      </text>
    </g>
  );
}

/** L2 跳跃: 可跳跃目标高亮 */
function JumpViz({ cellPositions }: { cellPositions: Record<string, {x:number;y:number}> }) {
  // 找出距离当前位置较远的格子作为可跳跃目标
  const jumpTargets = Object.entries(cellPositions)
    .filter(([id]) => id.startsWith('M') && parseInt(id.slice(1)) % 4 === 0)
    .slice(0, 3);

  return (
    <>
      {jumpTargets.map(([id, pos]) => (
        <g key={`jump-${id}`} transform={`translate(${pos.x}, ${pos.y})`}>
          {/* 虚线脉冲跳转圈 */}
          <circle r="5%" fill="none" stroke="#00FFFF" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.5">
            <animate attributeName="r" values="5%;7%;5%" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* ↑ 跳跃箭头 */}
          <text y="-6%" textAnchor="middle" fontSize="2.5%" fill="#00FFFF" fontWeight="900">↑JUMP</text>
        </g>
      ))}
    </>
  );
}

/** L3 顺序: 三环访问顺序 ①②③ */
function SequenceViz({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const ringLabels = ['OUTER', 'MID', 'CORE'];
  const ringPositions = [
    { x: 50, y: 48 },   // 外环
    { x: 50, y: 56 },   // 中环
    { x: 50, y: 64 },   // 内核
  ];

  return (
    <>
      {ringLabels.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <g key={`seq-${i}`}>
            <circle cx={ringPositions[i].x} cy={ringPositions[i].y} r="3%"
                    fill={isCompleted ? '#FFD70033' : 'none'}
                    stroke={isCurrent ? '#FFD700' : '#888'} strokeWidth={isCurrent ? 1 : 0.3}>
              {isCurrent && (
                <animate attributeName="r" values="3%;4%;3%" dur="1s" repeatCount="indefinite" />
              )}
            </circle>
            <text x={ringPositions[i].x} y={ringPositions[i].y + 1}
                  textAnchor="middle" fontSize="3%"
                  fill={isCompleted ? '#FFD700' : isCurrent ? '#FFF' : '#666'}
                  fontWeight="900">
              {isCompleted ? '✓' : `${i + 1}`}
            </text>
          </g>
        );
      })}
    </>
  );
}

/** L5 阻塞: 被阻塞路径红色X标记 */
function BlockadeViz({ blockedPaths, connections }: {
  blockedPaths?: Set<string>;
  connections: Array<{ id: string; from: string; to: string; type: string }>;
}) {
  if (!blockedPaths || blockedPaths.size === 0) return null;

  const blockedConns = connections.filter(c => blockedPaths.has(c.id));

  return (
    <>
      {blockedConns.map(conn => {
        const fromPos = { x: 50, y: 50 }; // 简化：实际应从cellPositions获取
        const midX = 50; // 连接中点
        const midY = 60;
        
        return (
          <g key={`block-${conn.id}`}>
            {/* 红色X标记 */}
            <line x1={midX - 3} y1={midY - 3} x2={midX + 3} y2={midY + 3}
                  stroke="#FF0000" strokeWidth="1.5" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1={midX + 3} y1={midY - 3} x2={midX - 3} y2={midY + 3}
                  stroke="#FF0000" strokeWidth="1.5" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="0.8s repeatCount="indefinite" />
            </line>
            {/* "阻塞"文字 */}
            <text x={midX} y={midY - 6} textAnchor="middle" fontSize="2%"
                  fill="#FF4444" fontWeight="900">BLOCKED</text>
          </g>
        );
      })}
    </>
  );
}

/** L6 迷路传送: 迷雾+传送门光柱 */
function TeleportViz({ cellPositions }: { cellPositions: Record<string, {x:number;y:number}> }) {
  // 渲染迷雾效果(半透明覆盖层)
  return (
    <g className="teleport-viz">
      {/* 全局迷雾效果 */}
      <rect x="20" y="35" width="60" height="50" rx="5"
            fill="url(#fog-gradient)" opacity="0.08" pointerEvents="none">
        <animate attributeName="opacity" values="0.08;0.12;0.08" dur="4s" repeatCount="indefinite" />
      </rect>
      
      {/* 定义迷雾渐变 */}
      <defs>
        <radialGradient id="fog-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E040FB" stopOpacity="0" />
          <stop offset="70%" stopColor="#E040FB" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E040FB" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* 传送门光柱（在特定位置）*/}
      {[cellPositions['X3'], cellPositions['X15'], cellPositions['X22']].filter(Boolean).map((pos, i) =>
        pos ? (
          <g key={`portal-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
            <ellipse rx="2.5%" ry="6%" fill="none" stroke="#E040FB" strokeWidth="0.6" opacity="0.5">
              <animate attributeName="ry" values="6%;9%;6%" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <text y="-8%" textAnchor="middle" fontSize="2%" fill="#E040FB" fontWeight="900">🌀</text>
          </g>
        ) : null
      )}
    </g>
  );
}

/** L7 漂移: 方向偏移箭头场 */
function DriftViz() {
  // 背景中缓慢移动的方向箭头暗示漂移方向
  const arrows = Array.from({ length: 8 }, (_, i) => ({
    x: 20 + (i % 4) * 20,
    y: 42 + Math.floor(i / 4) * 18,
    angle: 15 + (i * 23) % 60 - 30,  // 随机偏移角度
  }));

  return (
    <>
      {arrows.map((arr, i) => (
        <g key={`drift-${i}`}>
          <line x1={arr.x} y1={arr.y} x2={arr.x + 4} y2={arr.y + 2}
                stroke="rgba(155,89,182,0.15)" strokeWidth="0.4" markerEnd="url(#drift-arrow)"
                transform={`rotate(${arr.angle}, ${arr.x}, ${arr.y})`}>
            <animateTransform attributeName="transform" type="translate"
                              from={`0,0`} to={`${3 + (i%2)*2},${1+(i%3)}`}
                              dur={`${3 + i * 0.5}s`} repeatCount="indefinite"
                              additive="sum" />
          </line>
        </g>
      ))}
      <defs>
        <marker id="drift-arrow" markerWidth="4" markerHeight="4" refX="3" refY="1.5" orient="auto">
          <path d="M0,0 L4,1.5 L0,3 Z" fill="rgba(155,89,182,0.2)" />
        </marker>
      </defs>
    </>
  );
}

/** L8 坍缩: 裂纹线+危险区域闪烁 */
function CollapseViz() {
  // 在地图边缘和内部渲染动态裂纹
  const cracks = [
    { d: 'M 22,45 Q 30,55 28,70', delay: 0 },
    { d: 'M 78,42 Q 72,58 76,72', delay: 0.5 },
    { d: 'M 35,82 Q 50,78 65,82', delay: 1 },
    { d: 'M 50,38 Q 52,50 48,62', delay: 1.5 },
    { d: 'M 18,60 Q 25,58 30,65', delay: 2 },
    { d: 'M 82,58 Q 75,56 70,63', delay: 2.5 },
  ];

  return (
    <g className="collapse-viz">
      {cracks.map((crack, i) => (
        <path key={`crack-${i}`} d={crack.d}
              fill="none" stroke="#FF4444" strokeWidth="0.4" 
              strokeDasharray="3 4" opacity="0.3"
              style={{ animationDelay: `${crack.delay}s` }}>
          <animate attributeName="stroke-dashoffset" values="14;0" dur="3s" begin={`${crack.delay}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.2;0.4" dur="4s" begin={`${crack.delay}s`} repeatCount="indefinite" />
        </path>
      ))}
      
      {/* 危险区域闪烁提示 */}
      <text x="80" y="44" textAnchor="end" fontSize="2.2%" fill="#FF4444" fontWeight="900" opacity="0.4">
        ⚠ COLLAPSING ZONE
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
      </text>
    </g>
  );
}

/** L9 礼仪: 正确踩格顺序指引线（金色虚线）*/
function ProtocolViz({ correctPath, cellPositions }: {
  correctPath: string[];
  cellPositions: Record<string, {x:number;y:number}>;
}) {
  if (correctPath.length < 2) return null;

  const pathPoints = correctPath
    .map(id => cellPositions[id])
    .filter(Boolean);

  if (pathPoints.length < 2) return null;

  const pathD = pathPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
  ).join(' ');

  return (
    <g className="protocol-viz">
      {/* 金色指引路径 */}
      <path d={pathD} fill="none" stroke="#FFD700" strokeWidth="1.2"
            strokeDasharray="6 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
      </path>
      
      {/* 顺序编号 */}
      {correctPath.map((id, i) => {
        const pos = cellPositions[id];
        if (!pos) return null;
        return (
          <circle key={`proto-${i}`} cx={pos.x} cy={pos.y} r="2.5%"
                  fill="#FFD70033" stroke="#FFD700" strokeWidth="0.5">
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" fontSize="2.2%"
                  fill="#FFD700" fontWeight="900">{i + 1}</text>
          </circle>
        );
      })}
    </g>
  );
}
```

### Task C2: ★★☆ P1 — ZoneShapeVariants 区域形状变体渲染

扩展第九轮的 zoneBackgrounds 渲染，支持非标准形状：

```typescript
// 在 GourdMapRenderer 的区域背景渲染部分增加:

// 当 shapeConfig.lowerCircle.subZones 存在使用 SubZoneLayer
// 否则回退到标准四象限圆形区域(W/N/I/P)

const renderZoneBackgrounds = () => {
  if (shapeConfig?.lowerCircle?.subZones) {
    return <SubZoneLayer subZones={shapeConfig.lowerCircle.subZones} activeZoneId={currentZone} />;
  }
  // 标准 W/N/I/P 圆形扇形区域(保持第九轮逻辑)
  return <StandardQuadrantZones topology={topology} />;
};
```

## 第十轮C组改动总览

| 任务 | 对应Gap | 改动内容 |
|------|---------|---------|
| **C1** | **Gap-P0-3核心** | MechanicVisualizer + 9种机制可视化组件(acceleration/jump/sequence/event/blockade/teleport/drift/collapse/protocol) |
| **C2** | Gap-P1-1 | ZoneShapeVariants 支持sector/rect/polygon/circle/irregular 5种区域形状 |

## 验收标准

1. ✅ L1地图显示"W区连击进度条"(当wStreakCount>0时)
2. ✅ L2地图显示"↑JUMP"高亮圈在可跳跃目标格子上
3. ✅ L3地图显示三环顺序指示器(①②③/✓)
4. ✅ L5地图在被阻塞路径中点显示红色"X BLOCKED"动画
5. ✅ L6地图显示紫色迷雾效果和传送门光柱
6. ✅ L7地图显示方向漂移箭头场(缓慢移动)
7. ✅ L8地图显示裂纹线和"COLLAPSING ZONE"警告
8. ✅ L9地图显示金色虚线正确踩格顺序指引
