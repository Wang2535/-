# E组第九轮 — 分地图视觉终极打磨 + 游戏交互组件

## 🔴🔴🔴 视觉表现力与交互体验的最终冲刺

## 背景

第八轮E组完成了从混合架构到纯SVG 8层渲染的**决定性重构**，视觉完成度从~60%跃升至~82%。但差距分析报告指出以下**仍需解决的视觉/交互缺陷**：

| 差距ID | 等级 | 描述 | 本轮修复 |
|--------|------|------|---------|
| **Gap-P0-1** | P0 | W/N/I/P fontSizeRatio=0.22→需**0.36** | ✅ A组已修参数 |
| **Gap-P0-2** | P0 | 棋盘格tileSize=12/opacity=0.85→需**7/0.95** | ✅ A组已修参数 |
| **Gap-P1-1** | P1 | Boss格缺少**危险区域脉冲环** | ✅ **本组实现** |
| **Gap-P1-4** | P1 | AnimationLayer使用DOM div覆盖层→需**纯SVG迁移** | ✅ **本组实现** |
| **Gap-P1-5** | P1 | 连接线缺少**方向箭头**和**流动效果** | ✅ **本组实现** |
| Gap-P1-2 | P1 | 区域背景opacity太淡(0.12) | ✅ B组已提升至0.18-0.25 |
| Gap-P2-3 | P2 | 缺少**关卡信息面板(CellInfoPanel)** | ✅ **本组实现** |
| Gap-P2-4 | P2 | 格子hover/点击反馈不够明显 | ✅ **本组实现** |
| Gap-P2-5 | P2 | 路径线缺少动画效果 | ✅ **本组实现** |
| Gap-P2-9 | P2 | 层级切换过渡动画缺失 | ✅ **本组实现** |
| Gap-P2-10 | P2 | 移动骰子UI未集成 | ✅ **本组实现(Dice3D)** |

> **边界说明**:
> - E组消费 A 组的全部资源（GRID_ICONS / gourdAnimations.css / DEFAULT_* / gameMechanics.types / layerThemes）
> - E组消费 B 组修正后的 visualData（通过 C 组组装后的 topology.visualConfig）
> - E组消费 D 组的 TowerGameEngine（通过 eventBus 接收状态变更事件）
> - E组**负责所有可视组件**：渲染器增强 + 交互UI + 动画系统 + 骰子组件
> - E组**不修改游戏逻辑**（D组的事），只做视觉响应

## 具体任务

### Task E0: ★★★ P0 — AnimationLayer 纯SVG迁移

**问题**: 第八轮AnimationLayer.tsx中玩家棋子使用了 `<div>` 绝对定位覆盖在SVG之上（Gap-P1-4），导致坐标系微小不对齐、缩放不同步。

**目标**: 将整个AnimationLayer完全重写为纯SVG `<g>` 元素。

**修改文件**: `src/tower-mode/components/GourdMapRenderer/AnimationLayer.tsx`

```tsx
// src/tower-mode/components/GourdMapRenderer/AnimationLayer.tsx
// 完全重写：消除所有 DOM div，改用纯 SVG <g> 元素

import { useMemo } from 'react';
import type { PlayerPieceState } from '../../engine/playerPiece';

interface AnimationLayerProps {
  pieceState: PlayerPieceState | null;
  bossDangerActive?: boolean;          // D组通知Boss危险区域激活
  layerTheme?: {                      // A组的层级主题
    accentColor: string;
    particleStyle: string;
  };
}

export function AnimationLayer({ pieceState, bossDangerActive, layerTheme }: AnimationLayerProps) {
  const accentColor = layerTheme?.accentColor ?? '#44ff88';

  return (
    <g pointerEvents="none">
      {/* ===== 1. Boss危险区域脉冲环 ===== */}
      {bossDangerActive && pieceState && (
        <BossDangerRing position={pieceState.position} />
      )}

      {/* ===== 2. 移动轨迹光痕（纯SVG circle）===== */}
      <TrailDots trail={pieceState?.trailHistory ?? []} accentColor={accentColor} />

      {/* ===== 3. 玩家棋子主体（纯SVG）===== */}
      {pieceState?.position && (
        <PlayerPieceSVG
          x={pieceState.position.x * 100}
          y={pieceState.position.y * 100}
          isMoving={pieceState.isMoving}
          currentZone={pieceState.currentZone}
          accentColor={accentColor}
        />
      )}

      {/* ===== 4. 到达波纹（纯SVG circle+animate）===== */}
      {pieceState?.justArrived && pieceState.targetPosition && (
        <ArrivalRipple
          x={pieceState.targetPosition.x * 100}
          y={pieceState.targetPosition.y * 100}
          color={accentColor}
        />
      )}

      {/* ===== 5. 特殊移动特效 ===== */}
      {pieceState?.specialMoveType && (
        <SpecialMoveEffect
          type={pieceState.specialMoveType}
          fromPos={pieceState.position}
          toPos={pieceState.targetPosition}
        />
      )}
    </g>
  );
}

// ========== 子组件：玩家棋子（纯SVG）==========

function PlayerPieceSVG({
  x, y, isMoving, currentZone, accentColor
}: {
  x: number; y: number; isMoving: boolean;
  currentZone: string | null; accentColor: string;
}) {
  const zoneColors: Record<string, string> = {
    W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', P: '#F39C12',
    S: '#E74C3C', D: '#3498DB',
  };
  const zoneGlow = currentZone ? zoneColors[currentZone] : accentColor;

  return (
    <g transform={`translate(${x},${y})`}
       className="gm-piece-breathe"
       style={{ transformOrigin: 'center' }}>

      {/* 外圈区域感应光环（根据当前区域变色）*/}
      <circle r="6%" fill="none" stroke={zoneGlow} strokeWidth="0.4" opacity="0.35">
        <animate attributeName="r" values="6%;7.5%;6%" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.15;0.35" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* 中圈主色环 */}
      <circle r="4%" fill={accentColor} opacity="0.85"
              stroke={isMoving ? '#ffffff' : 'rgba(255,255,255,0.6)'}
              strokeWidth={isMoving ? '0.8' : '0.4'} />

      {/* 内核高亮 */}
      <circle r="2%" fill="#ffffff" opacity="0.9" />

      {/* 🎮 游戏手柄图标（SVG path替代emoji）*/}
      <g transform="translate(-2.5, -2)" scale="0.22">
        <path d="M6 2a2 2 0 00-2 2v3a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 1h4a1 1 0 011 1v3a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
              fill="#1a1a2e" opacity="0.9" />
        <circle cx="7" cy="5.5" r="0.7" fill="#1a1a2e" />
        <circle cx="9" cy="5.5" r="0.7" fill="#1a1a2e" />
        <path d="M7.5 4.5 L8.5 4.5 L8 5.5 Z" fill="#1a1a2e" />
      </g>

      {/* 当前区域小标识（在棋子右下角显示W/N/I/P/S/D字母）*/}
      {currentZone && (
        <text x="3.5%" y="3.5%"
              fontSize="2.5%" fontWeight="bold"
              fill={zoneGlow} stroke="#000" strokeWidth="0.3"
              paintOrder="stroke fill">
          {currentZone}
        </text>
      )}
    </g>
  );
}

// ========== 子组件：轨迹光痕 ==========

function TrailDots({ trail, accentColor }: {
  trail: Array<{ x: number; y: number; timestamp: number; opacity: number }>;
  accentColor: string;
}) {
  const maxTrail = 6;
  const visibleTrail = trail.slice(-maxTrail);

  return (
    <>
      {visibleTrail.map((pt, i) => {
        const progress = (i + 1) / visibleTrail.length;
        const radius = 0.8 + progress * 1.2; // 越新的点越大
        const alpha = pt.opacity * progress * 0.65;

        return (
          <circle
            key={`trail-${i}-${pt.timestamp}`}
            cx={`${pt.x * 100}%`} cy={`${pt.y * 100}%`}
            r={`${radius}%`}
            fill={accentColor}
            opacity={alpha}
            className="gm-trail-fade"
          >
            {/* 每个轨迹点有独立的淡出动画 */}
            <animate attributeName="opacity"
                     values={`${alpha};${alpha * 0.3};0`}
                     dur="1.2s" begin={`${i * 0.08}s`} fill="remove" />
            <animate attributeName="r"
                     values={`${radius}%;${radius * 1.3}%;0%`}
                     dur="1.2s" begin={`${i * 0.08}s`} fill="remove" />
          </circle>
        );
      })}
    </>
  );
}

// ========== 子组件：到达波纹 ==========

function ArrivalRipple({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <>
      {/* 主波纹 */}
      <circle cx={`${x}%`} cy={`${y}%`} r="1%" fill="none"
              stroke={color} strokeWidth="1.5" opacity="0.8"
              className="gm-arrival-ripple">
        <animate attributeName="r" values="1%;18%" dur="0.8s" fill="remove" />
        <animate attributeName="opacity" values="0.8;0" dur="0.8s" fill="remove" />
        <animate attributeName="strokeWidth" values="1.5;0.3" dur="0.8s" fill="remove" />
      </circle>
      {/* 次波纹（延迟0.15s）*/}
      <circle cx={`${x}%`} cy={`${y}%`} r="0.5%" fill="none"
              stroke={color} strokeWidth="0.8" opacity="0.5">
        <animate attributeName="r" values="0.5%;12%" dur="0.7s" begin="0.15s" fill="remove" />
        <animate attributeName="opacity" values="0.5;0" dur="0.7s" begin="0.15s" fill="remove" />
      </circle>
      {/* 弹性回弹标记（中心闪烁点）*/}
      <circle cx={`${x}%`} cy={`${y}%`} r="2%" fill={color} opacity="0.6">
        <animate attributeName="r" values="2%;3.5%;2%" dur="0.3s" fill="remove" />
        <animate attributeName="opacity" values="0.6;0.9;0.3" dur="0.3s" fill="remove" />
      </circle>
    </>
  );
}

// ========== 子组件：Boss危险区域脉冲环 ==========

function BossDangerRing({ position }: { position: { x: number; y: number } }) {
  return (
    <g transform={`translate(${position.x * 100},${position.y * 100})`}>
      {/* 第一层：红色警告脉冲 */}
      <circle r="10%" fill="none" stroke="#ff3333" strokeWidth="0.8" opacity="0.6"
              className="gm-boss-pulse">
        <animate attributeName="r" values="10%;16%;10%" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="strokeWidth" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* 第二层：橙色中间环 */}
      <circle r="13%" fill="none" stroke="#ff8800" strokeWidth="0.4" opacity="0.35">
        <animate attributeName="r" values="13%;19%;13%" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* 第三层：外圈虚线警戒线 */}
      <circle r="17%" fill="none" stroke="#ff3333" strokeWidth="0.3"
              strokeDasharray="2 3" opacity="0.25">
        <animate attributeName="r" values="17%;22%;17%" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="stroke-dashoffset" values="0;-25" dur="2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate"
                          from="0" to="360" dur="8s" repeatCount="indefinite" />
      </circle>

      {/* ⚠️ 危险标识文字 */}
      <text x="0" y="-11%" textAnchor="middle" fontSize="2.5%"
            fill="#ff4444" fontWeight="bold" opacity="0.7"
            className="gm-boss-pulse">
        ⚠ DANGER
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
      </text>
    </g>
  );
}

// ========== 子组件：特殊移动特效 ==========

function SpecialMoveEffect({
  type, fromPos, toPos
}: {
  type: string; fromPos?: any; toPos?: any;
}) {
  switch (type) {
    case 'teleport':
      // L6瞬移：粒子化 → 直线飞行 → 重组
      return (
        <g>
          <line x1={`${fromPos?.x * 100 ?? 50}%`} y1={`${fromPos?.y * 100 ?? 50}%`}
                x2={`${toPos?.x * 100 ?? 50}%`} y2={`${toPos?.y * 100 ?? 50}%`}
                stroke="#00ffff" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="14;0" dur="0.4s" repeatCount="indefinite" />
          </line>
        </g>
      );

    case 'map-flip':
      // 地图翻转：旋转指示弧线
      return (
        <g>
          <path d="M 30,50 A 20,20 0 1,1 70,50" fill="none"
                stroke="#ffaa00" strokeWidth="0.6" strokeDasharray="4 2" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate"
                              from="0 50 50" to="180 50 50" dur="1s" />
          </path>
        </g>
      );

    case 'banish':
      // L9遣返：红色光束拉回起点
      return (
        <g>
          <line x1={`${fromPos?.x * 100 ?? 60}%`} y1={`${fromPos?.y * 100 ?? 70}%`}
                x2="50%" y2="78%"
                stroke="#ff0000" strokeWidth="1" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.3s" repeatCount="indefinite" />
          </line>
        </g>
      );

    default:
      return null;
  }
}
```

### Task E1: ★★★ P1 — Boss格危险区域脉冲环（独立组件）

**问题**: Gap-P1-1指出Boss格周围缺少危险氛围标记。Boss应该是地图上最引人注目的元素。

**新建文件**: `src/tower-mode/components/GourdMapRenderer/BossDangerRing.tsx`

```tsx
// Boss格专属的危险区域可视化组件
// 当玩家靠近Boss格时自动激活三层脉冲环

import { useMemo } from 'react';

interface BossDangerRingProps {
  bossPosition: { x: number; y: number };   // Boss格坐标(归一化0-100)
  isActive: boolean;                         // 是否激活（玩家进入Boss影响范围时）
  playerDistance?: number;                   // 玩家距离Boss的格子数（用于调整强度）
  dangerLevel?: 'low' | 'medium' | 'high' | 'critical';  // 危险等级
}

export function BossDangerRing({
  bossPosition, isActive, playerDistance = 5, dangerLevel = 'medium'
}: BossDangerRingProps) {
  if (!isActive) return null;

  // 根据距离和等级计算视觉效果强度
  const intensity = useMemo(() => {
    const distFactor = Math.max(0, 1 - playerDistance / 8);
    const levelMultipliers = { low: 0.4, medium: 0.7, high: 0.9, critical: 1.2 };
    return Math.min(1.2, distFactor * (levelMultipliers[dangerLevel] ?? 0.7));
  }, [playerDistance, dangerLevel]);

  const ringConfigs = [
    { r: 10, color: '#ff2222', width: 0.8, dur: '1.5s', dash: '' },
    { r: 14, color: '#ff6600', width: 0.5, dur: '1.8s', dash: '' },
    { r: 19, color: '#ff2222', width: 0.3, dur: '2.2s', dash: '2 4' },
  ];

  return (
    <g transform={`translate(${bossPosition.x * 100},${bossPosition.y * 100})`}
       opacity={intensity}>
      {ringConfigs.map((cfg, i) => (
        <circle key={i}
          r={`${cfg.r}%`}
          fill="none"
          stroke={cfg.color}
          strokeWidth={cfg.width * intensity}
          opacity={0.3 + i * 0.1}
          strokeDasharray={cfg.dash || undefined}
          className="gm-boss-pulse"
        >
          <animate attributeName="r"
                   values={`${cfg.r}%;${cfg.r * (1.4 + i * 0.15)}%;${cfg.r}%`}
                   dur={cfg.dur} repeatCount="indefinite" />
          <animate attributeName="opacity"
                   values={`${0.3 + i * 0.1};${0.05};${0.3 + i * 0.1}`}
                   dur={cfg.dur} repeatCount="indefinite" />
          {cfg.dash && (
            <animate attributeName="stroke-dashoffset"
                     values="0;-30" dur="1.5s" repeatCount="indefinite" />
          )}
          {i === 2 && (
            <animateTransform attributeName="transform" type="rotate"
                              from="0" to="360" dur="10s" repeatCount="indefinite" />
          )}
        </circle>
      ))}

      {/* 危险等级文字 */}
      {(dangerLevel === 'high' || dangerLevel === 'critical') && (
        <text x="0" y={`-${ringConfigs[2].r + 2}%`}
              textAnchor="middle" fontSize="2.8%"
              fill="#ff3333" fontWeight="bold" opacity={0.6 * intensity}>
          {dangerLevel === 'critical' ? '⚠ CRITICAL ⚠' : '⚠ HIGH RISK'}
          <animate attributeName="opacity"
                   values={`${0.6 * intensity};${0.2 * intensity};${0.6 * intensity}`}
                   dur="0.8s" repeatCount="indefinite" />
        </text>
      )}
    </g>
  );
}
```

### Task E2: ★★★ P1 — 曲线路径方向箭头 + 流动效果

**问题**: Gap-P1-5指出连接线缺少方向指示和动态流动感。

**修改文件**: `src/tower-mode/components/GourdMapRenderer/PathLayer.tsx`（或合并入index.tsx的路径渲染部分）

```tsx
/** 增强版路径渲染：带方向箭头 + 流动粒子 */
function EnhancedPathLayer({
  connections, cellPositions, highlightedPathIds,
  layerTheme
}: {
  connections: any[];
  cellPositions: Record<string, { x: number; y: number }>;
  highlightedPathIds?: string[];
  layerTheme?: { accentColor: string };
}) {
  const accentColor = layerTheme?.accentColor ?? '#4488ff';

  // 在<defs>中定义箭头marker
  const arrowMarkerId = `path-arrow-${Date.now()}`;

  return (
    <g>
      {/* ===== 箭头marker定义 ===== */}
      <defs>
        <marker id={arrowMarkerId} markerWidth="6" markerHeight="6"
                refX="5" refY="3" orient="auto-start-reverse"
                markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={accentColor} opacity="0.7" />
        </marker>

        {/* 流动粒子渐变 */}
        <linearGradient id={`flow-grad-${Date.now()}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===== 所有连接线路径 ===== */}
      {connections.map((conn, i) => {
        const from = cellPositions[conn.from];
        const to = cellPositions[conn.to];
        if (!from || !to) return null;

        const isHighlighted = highlightedPathIds?.includes(conn.id);
        const cp = getControlPoint(from, to); // 复用第八轮的控制点逻辑

        const pathD = `M ${from.x * 100},${from.y * 100} Q ${cp.x * 100},${cp.y * 100} ${to.x * 100},${to.y * 100}`;

        return (
          <g key={conn.id ?? i}>
            {/* 底层路径线（较细，作为基础）*/}
            <path d={pathD}
                  fill="none"
                  stroke={conn.color ?? `${accentColor}33`}
                  strokeWidth={isHighlighted ? 1.2 : 0.5}
                  strokeLinecap="round"
                  opacity={isHighlighted ? 0.9 : 0.4} />

            {/* 高亮路径：流动效果（叠加一层动画路径）*/}
            {isHighlighted && (
              <path d={pathD}
                    fill="none"
                    stroke={`url(#flow-grad-${Date.now()})`}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray="8 12"
                    opacity="0.8">
                <animate attributeName="stroke-dashoffset"
                         values="20;0" dur="1.5s" repeatCount="indefinite" />
              </path>
            )}

            {/* 方向箭头（仅在路径末端）*/}
            <path d={pathD}
                  fill="none"
                  stroke={isHighlighted ? accentColor : `${accentColor}66`}
                  strokeWidth={isHighlighted ? 1 : 0.5}
                  markerEnd={`url(#${arrowMarkerId})`}
                  strokeLinecap="round"
                  opacity={isHighlighted ? 0.9 : 0.5} />
          </g>
        );
      })}

      {/* ===== 分叉点标记 ===== */}
      {renderJunctionMarkers(connections, cellPositions)}
    </g>
  );
}

/** 分叉点标记（菱形图标提示玩家需要选择方向）*/
function renderJunctionMarkers(
  connections: any[],
  positions: Record<string, { x: number; y: number }>
) {
  // 找出有≥2条出边的节点
  const outDegree = new Map<string, number>();
  for (const conn of connections) {
    outDegree.set(conn.from, (outDegree.get(conn.from) ?? 0) + 1);
  }

  const junctions = Array.from(outDegree.entries()).filter(([_, deg]) => deg >= 2);

  return junctions.map(([cellId]) => {
    const pos = positions[cellId];
    if (!pos) return null;

    return (
      <g key={`junction-${cellId}`} transform={`translate(${pos.x * 100},${pos.y * 100})`}>
        {/* 分叉菱形标记 */}
        <polygon points="0,-2.5 2,0 0,2.5 -2,0"
                 fill="#ffaa00" opacity="0.7"
                 className="gm-pulse-orange">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate"
                            from="0" to="360" dur="3s" repeatCount="indefinite" />
        </polygon>
        {/* "？"提示文字 */}
        <text x="0" y="0.8" textAnchor="middle" fontSize="2%"
              fill="#ffffff" fontWeight="bold">?</text>
      </g>
    );
  });
}
```

### Task E3: ★★☆ P1 — CellInfoPanel 关卡信息浮窗

**问题**: Gap-P2-3指出缺少关卡信息面板。根据设想文档「文件二、（二）3.关卡挑战规则」，踩中关卡格时应弹出包含名称/星级/敌人预览/奖励预估的信息面板。

**新建文件**: `src/tower-mode/components/CellInfoPanel/CellInfoPanel.tsx`

```tsx
/**
 * CellInfoPanel — 格子信息面板
 *
 * 当玩家踩中功能格子(battle/boss/bookstore/skill/exchange等)时弹出。
 * 显示格子详情，提供"进入"/"暂不进入"两个操作按钮。
 *
 * 数据来源: D组 TowerGameEngine 通过 eventBus 发送 cell:info:show 事件
 */

import { useState, useEffect, useCallback } from 'react';
import type { CellInfoPanelData } from '../../types/gameMechanics.types';

interface CellInfoPanelProps {
  visible: boolean;
  cellData: CellInfoPanelData | null;
  onEnter: (cellId: string) => void;       // 点击"进入"
  onSkip: (cellId: string) => void;         // 点击"暂不进入"
  onClose: () => void;                       // 关闭面板
  layerNumber: number;                       // 当前层级（影响主题色）
}

const CELL_TYPE_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  battle:     { name: '挑战关',   icon: '⚔️', color: '#e74c3c' },
  boss:       { name: 'Boss战',   icon: '👑', color: '#c0392b' },
  bookstore:  { name: '知识殿堂', icon: '📚', color: '#3498db' },
  skill:      { name: '技能研习', icon: '⚡', color: '#9b59b6' },
  exchange:   { name: '交流会',   icon: '🤝', color: '#1abc9c' },
  opportunity:{ name: '机遇格',   icon: '🎲', color: '#f39c12' },
  chance:     { name: '随机事件', icon: '❓', color: '#e67e22' },
  special:    { name: '特殊格',   icon: '⭐', color: '#f1c40f' },
  elite:      { name: '精英关',   icon: '💀', color: '#8e44ad' },
};

const DIFFICULTY_STARS = ['★', '★★', '★★★', '★★★★', '★★★★★'];

export function CellInfoPanel({
  visible, cellData, onEnter, onSkip, onClose, layerNumber
}: CellInfoPanelProps) {
  const [animState, setAnimState] = useState<'entering' | 'visible' | 'exiting'>('visible');

  useEffect(() => {
    if (visible) setAnimState('entering');
  }, [visible]);

  const handleEnter = useCallback(() => {
    if (!cellData) return;
    setAnimState('exiting');
    setTimeout(() => onEnter(cellData.cellId), 250);
  }, [cellData, onEnter]);

  const handleSkip = useCallback(() => {
    if (!cellData) return;
    setAnimState('exiting');
    setTimeout(() => onSkip(cellData.cellId), 250);
  }, [cellData, onSkip]);

  if (!visible || !cellData) return null;

  const typeInfo = CELL_TYPE_LABELS[cellData.cellType] ?? { name: '未知', icon: '?', color: '#888' };
  const stars = DIFFICULTY_STARS[Math.min(cellData.difficultyStars - 1, 4)] ?? '';

  // 层级主题色映射
  const layerGradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)',
    2: 'linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)',
    3: 'linear-gradient(135deg, #3d2b1f 0%, #5c4033 100%)',
    4: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
    5: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
    6: 'linear-gradient(135deg, #0a1628 0%, #1a3050 100%)',
    7: 'linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)',
    8: 'linear-gradient(135deg, #0d0d25 0%, #1d1d45 100%)',
    9: 'linear-gradient(135deg, #1a0a2e 0%, #3a1a5e 100%)',
  };

  return (
    <div className={`cell-info-panel-overlay ${animState}`}>
      <div className="cell-info-panel" style={{
        background: layerGradients[layerNumber] ?? layerGradients[1],
        borderColor: typeInfo.color,
      }}>
        {/* ===== 标题栏 ===== */}
        <div className="cip-header" style={{ borderBottomColor: `${typeInfo.color}33` }}>
          <span className="cip-type-icon">{typeInfo.icon}</span>
          <span className="cip-type-name">{typeInfo.name}</span>
          <span className="cip-layer-badge">L{layerNumber}</span>
          <button className="cip-close-btn" onClick={() => { setAnimState('exiting'); setTimeout(onClose, 250); }}>
            ✕
          </button>
        </div>

        {/* ===== 关卡信息 ===== */}
        <div className="cip-body">
          {/* 名称行 */}
          <div className="cip-name-row">
            <span className="cip-cell-name">{cellData.displayName}</span>
            <span className="cip-difficulty-stars" style={{ color: '#ffd700' }}>{stars}</span>
          </div>

          {/* 敌人预览（战斗/Boss类）*/}
          {(cellData.cellType === 'battle' || cellData.cellType === 'boss') && cellData.enemyPreview && (
            <div className="cip-enemy-preview">
              <span className="cip-label">敌人:</span>
              <span className="cip-enemy-name">{cellData.enemyPreview.name}</span>
              <span className="cip-enemy-type">[{cellData.enemyPreview.type}]</span>
              <span className="cip-enemy-power">战力≈{cellData.enemyPreview.estimatedPower}</span>
            </div>
          )}

          {/* 预估收益 */}
          <div className="cip-rewards-preview">
            <span className="cip-label">预计收益:</span>
            <div className="cip-reward-items">
              <span className="cip-reward tech">技术值 +{cellData.estimatedTechGain ?? '?'}</span>
              <span className="cip-reward gold">金币 +{cellData.estimatedGoldGain ?? '?'}</span>
              {cellData.estimatedCoreRewards && Object.entries(cellData.estimatedCoreRewards).map(([key, val]) => (
                <span key={key} className="cip-reward core">
                  {key === 'compute' ? '算力' : key === 'fund' ? '资金' : '信息'} +{val}
                </span>
              ))}
            </div>
          </div>

          {/* 解锁卡牌预览（战斗类）*/}
          {cellData.unlockCardsPreview && cellData.unlockCardsPreview.length > 0 && (
            <div className="cip-cards-preview">
              <span className="cip-label">解锁卡牌:</span>
              <div className="cip-cards-list">
                {cellData.unlockCardsPreview.map((card, i) => (
                  <span key={i} className="cip-card-mini" title={card.name}>
                    🎴 {card.name}
                    <span className="cip-card-rarity" style={{
                      color: card.rarity === 'legendary' ? '#ff9500'
                            : card.rarity === 'epic' ? '#a335ee'
                            : card.rarity === 'rare' ? '#0070dd'
                            : '#999'
                    }}> [{card.rarity}]</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 描述文本 */}
          {cellData.description && (
            <p className="cip-description">{cellData.description}</p>
          )}
        </div>

        {/* ===== 操作按钮区 ===== */}
        <div className="cip-actions">
          <button className="cip-btn cip-btn-enter" onClick={handleEnter}
                  style={{ background: `linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}cc)` }}>
            {cellData.cellType === 'boss' ? '⚔️ 挑战Boss' : '🚀 进入'}
          </button>
          <button className="cip-btn cip-btn-skip" onClick={handleSkip}>
            ⏭️ 暂不进入
          </button>
        </div>
      </div>
    </div>
  );
}
```

**配套CSS** (`src/tower-mode/components/CellInfoPanel/cellInfoPanel.css`):

```css
/* CellInfoPanel 样式 — 深色玻璃拟态风格 */

.cell-info-panel-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  animation: cip-fade-in 0.25s ease-out;
}

.cell-info-panel-overlay.exiting {
  animation: cip-fade-out 0.25s ease-in forwards;
}

@keyframes cip-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cip-fade-out { from { opacity: 1; } to { opacity: 0; } }

.cell-info-panel {
  width: min(420px, 88vw);
  border-radius: 16px;
  border: 2px solid;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.5),
    0 0 40px rgba(var(--theme-accent-rgb), 0.15),
    inset 0 1px 0 rgba(255,255,255,0.08);
  animation: cip-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cell-info-panel-overlay.exiting .cell-info-panel {
  animation: cip-slide-down 0.2s ease-in forwards;
}

@keyframes cip-slide-up { from { transform: translateY(30px) scale(0.95); opacity: 0; } }
@keyframes cip-slide-down { to { transform: translateY(20px) scale(0.95); opacity: 0; } }

.cip-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid;
}

.cip-type-icon { font-size: 1.5rem; }
.cip-type-name { font-size: 1.15rem; font-weight: 700; color: #fff; flex: 1; }
.cip-layer-badge {
  font-size: 0.75rem; font-weight: 800;
  background: rgba(255,255,255,0.15);
  padding: 2px 8px; border-radius: 10px;
  color: rgba(255,255,255,0.8);
}
.cip-close-btn {
  background: none; border: none; color: #888;
  font-size: 1.2rem; cursor: pointer;
  padding: 4px 8px; border-radius: 6px;
  transition: all 0.2s;
}
.cip-close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.cip-body { padding: 16px 18px; }

.cip-name-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.cip-cell-name { font-size: 1.25rem; font-weight: 700; color: #fff; }
.cip-difficulty-stars { font-size: 1rem; letter-spacing: 2px; }

.cip-label {
  font-size: 0.78rem; color: rgba(255,255,255,0.5);
  font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
  margin-right: 6px;
}

.cip-enemy-preview, .cip-rewards-preview, .cip-cards-preview {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(0,0,0,0.25);
  border-radius: 8px;
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
}

.cip-enemy-name { font-weight: 600; color: #ff6b6b; }
.cip-enemy-type { font-size: 0.82rem; color: #aaa; }
.cip-enemy-power { margin-left: auto; font-size: 0.82rem; color: #ffd700; }

.cip-reward-items { display: flex; flex-wrap: wrap; gap: 8px; }
.cip-reward {
  font-size: 0.85rem; font-weight: 600; padding: 3px 10px;
  border-radius: 12px; background: rgba(255,255,255,0.06);
}
.cip-reward.tech { color: #4ecdc4; border: 1px solid rgba(78,205,196,0.3); }
.cip-reward.gold { color: #ffd700; border: 1px solid rgba(255,215,0,0.3); }
.cip-reward.core { color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); }

.cip-cards-list { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.cip-card-mini {
  font-size: 0.84rem; padding: 4px 8px;
  background: rgba(255,255,255,0.05); border-radius: 6px;
}
.cip-card-rarity { font-size: 0.72rem; margin-left: 4px; }

.cip-description {
  font-size: 0.86rem; line-height: 1.6;
  color: rgba(255,255,255,0.65);
  margin: 8px 0 0;
  font-style: italic;
}

.cip-actions {
  display: flex; gap: 12px; padding: 14px 18px;
  background: rgba(0,0,0,0.2);
}

.cip-btn {
  flex: 1; padding: 12px 20px; border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.cip-btn-enter:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
.cip-btn-skip {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.12);
}
.cip-btn-skip:hover { background: rgba(255,255,255,0.15); color: #fff; }
```

### Task E4: ★★☆ P2 — Dice3D 三维骰子组件

**问题**: Gap-P2-10指出移动骰子UI未与渲染器对接。根据设想文档「文件二、（一）1.骰子规则」：

> - 3D立方体骰子，主题色随层级变化
> - 点数用发光圆点表示
> - 投掷时骰子旋转3圈后停在结果面（约1.5秒）
> - W区域-1变暗红+S区域额外投掷并排显示+大成功金色爆炸

**新建文件**: `src/tower-mode/components/Dice3D/Dice3D.tsx`

```tsx
/**
 * Dice3D — 3D骰子组件
 *
 * 使用 CSS 3D transforms 实现伪3D骰子翻滚效果。
 * 支持修正值显示、大成功/大失败特效。
 *
 * 与 D组 TowerGameEngine.rollDice() 对接：
 *   D组 emit dice:start → E组显示骰子浮起
 *   D组 emit dice:result → E组播放翻滚动画 → 显示结果
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DiceResult, LayerThemeConfig } from '../../types/gameMechanics.types';

interface Dice3DProps {
  isRolling: boolean;
  result: DiceResult | null;
  onRollComplete?: () => void;           // 动画播完回调
  theme?: LayerThemeConfig;               // 层级主题（影响骰子皮肤）
  disabled?: boolean;                     // 禁止操作状态
}

const DICE_FACES = [
  { value: 1, dots: [[50,50]], rotation: [[0,0,0]] },
  { value: 2, dots: [[25,25],[75,75]], rotation: [[0,-90,0]] },
  { value: 3, dots: [[25,25],[50,50],[75,75]], rotation: [[0,0,90]] },
  { value: 4, dots: [[25,25],[75,25],[25,75],[75,75]], rotation: [[90,0,0]] },
  { value: 5, dots: [[25,25],[75,25],[50,50],[25,75],[75,75]], rotation: [[0,90,0]] },
  { value: 6, dots: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]], rotation: [[0,180,0]] },
];

export function Dice3D({ isRolling, result, onRollComplete, theme, disabled }: Dice3DProps) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [rollPhase, setRollPhase] = useState<'idle' | 'preparing' | 'rolling' | 'result'>('idle');
  const [showModifiers, setShowModifiers] = useState(false);
  const timerRef = useRef<number | null>(null);

  const skinColor = theme?.accentColor ?? '#4488ff';
  const faceBg = theme?.bgPrimary ?? '#1a1a3e';

  useEffect(() => {
    if (isRolling && rollPhase === 'idle') {
      setRollPhase('preparing');
      timerRef.current = window.setTimeout(() => {
        setRollPhase('rolling');
        timerRef.current = window.setTimeout(() => {
          if (result) {
            setDisplayValue(result.finalValue);
            setRollPhase('result');
            setShowModifiers(true);
            onRollComplete?.();
          }
        }, 1200); // 翻滚时长
      }, 500); // 准备时长
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRolling, result]);

  const resetDice = useCallback(() => {
    setDisplayValue(null);
    setRollPhase('idle');
    setShowModifiers(false);
  }, []);

  if (rollPhase === 'idle' && !disabled) return null;

  const isCritSuccess = result?.isCritSuccess;
  const isCritFail = result?.isCritFail;

  return (
    <div className={`dice3d-container ${rollPhase} ${isCritSuccess ? 'crit-success' : ''} ${isCritFail ? 'crit-fail' : ''}`}
         style={{ '--dice-skin': skinColor, '--dice-face-bg': faceBg } as React.CSSProperties}>

      {/* 骰子本体 */}
      <div className={`dice3d-cube ${rollPhase === 'rolling' ? 'rolling' : ''}`}>
        {/* 6个面 */}
        {DICE_FACES.map(face => (
          <div key={face.value} className={`dice3d-face face-${face.value}`}
               style={{ transform: `rotate3d(...)` }}>
            {face.dots.map((dot, i) => (
              <div key={i} className="dice-dot"
                   style={{ left: `${dot[0]}%`, top: `${dot[1]}%` }} />
            ))}
            <span className="face-number">{face.value}</span>
          </div>
        ))}
      </div>

      {/* 结果数值显示（翻滚结束后）*/}
      {rollPhase === 'result' && displayValue !== null && (
        <div className="dice3d-result">
          <span className="result-value">{displayValue}</span>

          {/* 修正值列表 */}
          {showModifiers && result?.modifiers && result.modifiers.length > 0 && (
            <div className="dice-modifiers">
              <span className="mod-base">基础: {result.baseValue}</span>
              {result.modifiers.map((mod, i) => (
                <span key={i} className={`mod-item ${mod.delta >= 0 ? 'positive' : 'negative'}`}>
                  {mod.source}: {mod.delta >= 0 ? '+' : ''}{mod.delta}
                </span>
              ))}
              <span className="mod-final">= {result.finalValue}</span>
            </div>
          )}

          {/* 大成功/大失败标签 */}
          {isCritSuccess && <span className="crit-tag success">★ 大成功！</span>}
          {isCritFail && <span className="crit-tag fail">✗ 大失败...</span>}
        </div>
      )}

      {/* 特效层 */}
      {isCritSuccess && rollPhase === 'result' && (
        <div className="crit-success-effect">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="crit-particle"
                 style={{ '--angle': `${i * 30}deg`, '--delay': `${i * 0.05}s` } as React.CSSStyles} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**配套CSS** (`src/tower-mode/components/Dice3D/dice3d.css`):

```css
/* Dice3D 样式 — 3D骰子 + 结果展示 */

.dice3d-container {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  perspective: 600px;
  padding: 20px;
}

.dice3d-cube {
  width: 80px; height: 80px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s;
}

.dice3d-cube.rolling {
  animation: dice-roll 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes dice-roll {
  0%   { transform: rotateX(0) rotateY(0) rotateZ(0); }
  20%  { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
  40%  { transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg); }
  60%  { transform: rotateX(1080deg) rotateY(540deg) rotateZ(270deg); }
  80%  { transform: rotateX(1260deg) rotateY(630deg) rotateZ(315deg); }
  100% { transform: rotateX(var(--final-x)) rotateY(var(--final-y)) rotateZ(0); }
}

.dice3d-face {
  position: absolute; width: 80px; height: 80px;
  background: var(--dice-face-bg, #1a1a3e);
  border: 2px solid var(--dice-skin, #4488ff);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; padding: 12px;
  box-shadow: inset 0 0 15px rgba(255,255,255,0.05),
              0 0 10px rgba(var(--dice-skin-rgb,68,136,255),0.2);
  backface-visibility: hidden;
}

.face-1 { transform: rotateY(0deg) translateZ(40px); }
.face-2 { transform: rotateY(-90deg) translateZ(40px); }
.face-3 { transform: rotateX(90deg) translateZ(40px); }
.face-4 { transform: rotateX(-90deg) translateZ(40px); }
.face-5 { transform: rotateY(90deg) translateZ(40px); }
.face-6 { transform: rotateY(180deg) translateZ(40px); }

.dice-dot {
  position: absolute; width: 12px; height: 12px;
  background: radial-gradient(circle, #fff 0%, var(--dice-skin, #4488ff) 100%);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--dice-skin, #4488ff);
  transform: translate(-50%, -50%);
}

.face-number {
  position: absolute; bottom: 4px; right: 8px;
  font-size: 0.65rem; color: rgba(255,255,255,0.25);
  font-weight: 900;
}

/* 结果显示 */
.dice3d-result {
  margin-top: 16px;
  text-align: center;
  animation: result-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes result-pop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.result-value {
  font-size: 3rem; font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px var(--dice-skin, #4488ff),
               0 0 40px var(--dice-skin, #4488ff);
  font-family: 'Arial Black', Impact, sans-serif;
}

.dice-modifiers {
  margin-top: 8px;
  display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;
  font-size: 0.78rem;
}

.mod-base { color: #aaa; }
.mod-item.positive { color: #4ecdc4; }
.mod-item.negative { color: #ff6b6b; }
.mod-final { color: #fff; font-weight: 700; margin-left: 4px; }

/* 大成功/大失败 */
.crit-tag {
  display: inline-block; margin-top: 8px;
  padding: 4px 16px; border-radius: 20px;
  font-size: 0.9rem; font-weight: 800;
  animation: crit-pulse 1s infinite alternate;
}
.crit-tag.success { background: linear-gradient(135deg,#ffd700,#ff8c00); color: #1a1a2e; }
.crit-tag.fail { background: linear-gradient(135deg,#ff4444,#cc0000); color: #fff; }

@keyframes crit-pulse { from { transform: scale(1); } to { transform: scale(1.05); } }

.crit-success-effect .crit-particle {
  position: absolute; width: 6px; height: 6px;
  background: #ffd700; border-radius: 50%;
  animation: particle-explode 0.8s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

@keyframes particle-explode {
  from { transform: rotate(var(--angle, 0deg)) translateY(0) scale(1); opacity: 1; }
  to { transform: rotate(var(--angle, 0deg)) translateY(-60px) scale(0); opacity: 0; }
}
```

### Task E5: ★★☆ P2 — 格子Hover交互增强

**问题**: Gap-P2-4指出CellNode的hover反馈不够明显。

**修改文件**: `src/tower-mode/components/GourdMapRenderer/CellNode.tsx`（在现有基础上增加）

```tsx
// 在现有 CellNode 组件中增加以下增强:

// 1. Hover状态检测
const [isHovered, setIsHovered] = useState(false);

// 2. Hover时的视觉变化：
return (
  <g className={`cell-node ${animClass || ''} ${isCurrent ? 'current' : ''} ${isHovered ? 'hovered' : ''}`}
     onMouseEnter={() => setIsHovered(true)}
     onMouseLeave={() => setIsHovered(false)}
     onClick={onClick}
     cursor={opacity < 0.5 ? 'not-allowed' : 'pointer'}>

    {/* ===== Hover发光底圈 ===== */}
    {isHovered && !stateOverride && (
      <circle cx={position.x} cy={position.y}
              r={`${nodeSize * 0.7}%`}
              fill="none" stroke="#ffffff" strokeWidth="0.6"
              opacity="0.4" className="cell-hover-glow">
        <animate attributeName="r"
                 values={`${nodeSize * 0.7}%;${nodeSize * 0.9}%;${nodeSize * 0.7}%`}
                 dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
    )}

    {/* ===== 原有的形状+图标 ===== */}
    {renderShape()}
    {renderIcon()}

    {/* ===== Hover信息提示（tooltip）===== */}
    {isHovered && (
      <g transform={`translate(${position.x + nodeSize * 0.8}%,${position.y - nodeSize * 0.5}%)`}>
        <rect x="0" y="-8" width="45" height="16" rx="3"
              fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
        <text x="22.5" y="3" textAnchor="middle" fontSize="3.5%"
              fill="#ffffff" fontFamily="sans-serif">
          {cell.type === 'battle' ? '⚔️ 挑战'
           : cell.type === 'boss' ? '👑 Boss'
           : cell.type === 'bookstore' ? '📚 书店'
           : cell.type === 'skill' ? '⚡ 技能'
           : cell.type === 'exchange' ? '🤝 交流'
           : cell.type === 'opportunity' ? '🎲 机遇'
           : cell.type === 'chance' ? '❓ 随机'
           : cell.type}
        </text>
      </g>
    )}

    {/* ===== 当前位置标记（原有逻辑保留）===== */}
    {isCurrent && (
      <circle cx={position.x} cy={position.y}
              r={`${nodeSize * 0.55}%`} fill="none"
              stroke="#44ff88" strokeWidth="0.8"
              className="gm-glow-current" />
    )}
  </g>
);
```

**配套CSS** (追加到 `styles.css`):

```css
/* CellNode hover 增强 */
.cell-node.hovered .cell-hover-glow { visibility: visible; }
.cell-node { transition: filter 0.2s; }
.cell-node.hovered { filter: brightness(1.25) drop-shadow(0 0 4px rgba(68,255,136,0.3)); }
.cell-node.hovered circle[fill] { transition: fill 0.2s; }
```

### Task E6: ★★☆ P2 — 层级切换过渡动画

**问题**: Gap-P2-9指出切换L1→L2时没有平滑过渡。

**方案**: 在 GourdMapRenderer 的 index.tsx 中增加 CSS transition + SVG 过渡组。

```tsx
// 在 GourdMapRenderer/index.tsx 中增加:

const [transitionState, setTransitionState] = useState<'stable' | 'exiting' | 'entering'>('stable');
const prevTopologyRef = useRef(topology);

useEffect(() => {
  if (prevTopologyRef.current?.id !== topology?.id) {
    // 层级发生变化
    setTransitionState('exiting');
    setTimeout(() => setTransitionState('entering'), 350);
    setTimeout(() => setTransitionState('stable'), 700);
  }
  prevTopologyRef.current = topology;
}, [topology?.id]);

// 包裹SVG:
<div className={`gourd-map-wrapper ${transitionState}`} style={{
  transition: 'opacity 0.35s ease, transform 0.35s ease',
  opacity: transitionState === 'exiting' ? 0 : 1,
  transform: transitionState === 'exiting' ? 'scale(0.97)' 
           : transitionState === 'entering' ? 'scale(1.02)' 
           : 'scale(1)',
}}>
  <svg ...> ... </svg>
</div>
```

**配套CSS**:

```css
.gourd-map-wrapper { will-change: opacity, transform; }
.gourd-map-wrapper.exiting { pointer-events: none; }
```

### Task E7: ★★☆ P2 — ZoneEffectLayer 区域进入特效增强

**修改文件**: `src/tower-mode/components/GourdMapRenderer/ZoneEffectLayer.tsx`

基于第八轮版本大幅增强，支持6种区域(W/N/I/P/S/D)各具特色的进入特效：

```tsx
function ZoneEffectLayer({
  topology, activeEffects
}: {
  topology: any;
  activeEffects: Array<{ zoneType: string; cellId: string; at: number }>;
}) {
  const [effects, setEffects] = useState<Array<{
    zoneType: string; cellId: string; at: number;
    position: { x: number; y: number } | null;
  }>>([]);

  useEffect(() => {
    if (activeEffects.length > 0) {
      const newEffects = activeEffects.map(e => ({
        ...e,
        position: getZoneCenter(e.zoneType, topology),
      }));
      setEffects(prev => [...prev.slice(-3), ...newEffects]);
      setTimeout(() => setEffects(prev => prev.filter(p =>
        Date.now() - p.at < 2800
      )), 3000);
    }
  }, [activeEffects, topology]);

  if (effects.length === 0) return null;

  return (
    <g pointerEvents="none">
      {effects.map((ef, i) => (
        <ZoneEntryEffect key={`${ef.zoneType}-${ef.at}`} {...ef} />
      ))}
    </g>
  );
}

function ZoneEntryEffect({ zoneType, position }: { zoneType: string; position: any }) {
  const configs: Record<string, { color: string; animClass: string; pattern: string }> = {
    W: { color: '#FF6B6B', animClass: 'gm-zone-w-enter', pattern: 'ripple-red' },
    N: { color: '#4ECDC4', animClass: 'gm-zone-n-enter', pattern: 'ripple-cyan' },
    I: { color: '#9B59B6', animClass: 'gm-zone-i-enter', pattern: 'ripple-purple' },
    P: { color: '#F39C12', animClass: 'gm-zone-p-enter', pattern: 'ripple-orange' },
    S: { color: '#E74C3C', animClass: 'gm-zone-s-enter', pattern: 'pulse-shock' },
    D: { color: '#3498DB', animClass: 'gm-zone-d-enter', pattern: 'data-stream' },
  };

  const cfg = configs[zoneType] ?? configs.W;
  if (!position) return null;

  switch (cfg.pattern) {
    case 'ripple-red': // W区：红色波纹扩散
      return (
        <g transform={`translate(${position.x * 100}%,${position.y * 100}%)`}>
          {[0, 1,2].map(i => (
            <circle key={i} r="0%" fill="none" stroke={cfg.color}
                    strokeWidth={1.5 - i * 0.3} opacity={0.5 - i * 0.12}
                    className={cfg.animClass}>
              <animate attributeName="r" from="0%" to={`${28 + i * 8}%`} dur={`${1 + i * 0.3}s`}
                       begin={`${i * 0.15}s`} fill="remove" />
              <animate attributeName="opacity" from={`${0.5 - i * 0.12}` to="0"
                       dur={`${1 + i * 0.3}s`} begin={`${i * 0.15}s`} fill="remove" />
            </circle>
          ))}
          <text x="0" y="-2%" textAnchor="middle" fontSize="4%"
                fill={cfg.color} fontWeight="900" opacity="0.8">
            W {zoneType}
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
          </text>
        </g>
      );

    case 'data-stream': // D区：数据流线条
      return (
        <g transform={`translate(${position.x * 100}%,${position.y * 100}%)`}>
          {[...Array(5)].map((_, i) => (
            <line key={i} x1={`${(i - 2) * 8}%`} y1="15%" x2={`${(i - 2) * 8}%`} y2="-15%"
                  stroke={cfg.color} strokeWidth="0.4" opacity="0.4"
                  strokeDasharray="2 3">
              <animate attributeName="stroke-dashoffset" values="10;0" dur="0.8s"
                       begin={`${i * 0.1}s`} repeatCount="indefinite" />
              <animate attributeName="y1" values="15%;-15%;15%" dur="2s"
                       begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      );

    case 'pulse-shock': // S区：电击脉冲
      return (
        <g transform={`translate(${position.x * 100}%,${position.y * 100}%)`}>
          <circle r="0%" fill="none" stroke={cfg.color} strokeWidth="2" opacity="0.7"
                  strokeDasharray="4 2" className={cfg.animClass}>
            <animate attributeName="r" values="0%;25%;0%" dur="0.6s" repeatCount="3" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="0.6s" repeatCount="3" />
            <animate attributeName="stroke-width" values="2;0.5;2" dur="0.6s" repeatCount="3" />
          </circle>
        </g>
      );

    default: // N/I/P通用波纹
      return (
        <g transform={`translate(${position.x * 100}%,${position.y * 100}%)`}>
          <circle r="0%" fill="none" stroke={cfg.color} strokeWidth="1.2" opacity="0.5"
                  className={cfg.animClass}>
            <animate attributeName="r" from="0%" to="32%" dur="1s" fill="remove" />
            <animate attributeName="opacity" from="0.5" to="0" dur="1s" fill="remove" />
          </circle>
        </g>
      );
  }
}

function getZoneCenter(zoneType: string, topology: any): { x: number; y: number } | null {
  const bg = topology?.visualConfig?.zoneBackgrounds?.[zoneType];
  return bg?.centerPosition ?? null;
}
```

### Task E8: ★☆☆ P3 — 主组件装配更新

**修改文件**: `src/tower-mode/components/GourdMapRenderer/index.tsx`

整合上述所有新组件到主渲染器中：

```tsx
// 新增导入
import { AnimationLayer } from './AnimationLayer';       // E0: 纯SVG重写版
import { BossDangerRing } from './BossDangerRing';         // E1: Boss危险环
import { EnhancedPathLayer } from './PathLayer';           // E2: 方向箭头+流动
import { CellInfoPanel } from '../CellInfoPanel/CellInfoPanel'; // E3: 信息面板
import { Dice3D } from '../Dice3D/Dice3D';                 // E4: 3D骰子
import { ZoneEffectLayer } from './ZoneEffectLayer';       // E7: 区域特效
import './CellInfoPanel/cellInfoPanel.css';               // E3样式
import './Dice3D/dice3d.css';                             // E4样式

// 扩展 Props
interface GourdMapRendererPropsV9 extends GourdMapRendererProps {
  // D组驱动的状态
  enginePhase?: string;                    // 当前游戏阶段
  diceResult?: DiceResult | null;           // 骰子结果
  cellInfoData?: CellInfoPanelData | null;  // 待显示的格子信息
  bossDangerActive?: boolean;              // Boss危险区域是否激活
  activeZoneEffects?: Array<{...}>;        // 活跃的区域效果
  layerTheme?: LayerThemeConfig;           // 当前层级主题
  // 回调
  onCellEnter?: (id: string) => void;
  onCellSkip?: (id: string) => void;
  onPanelClose?: () => void;
  onDiceRoll?: () => void;
  onDiceComplete?: () => void;
}

// 在 SVG 内部新增层级（按z-order排序）:
// Layer -1: defs（含箭头marker + 流动渐变）
// Layer  0: DecorationLayer（保持不变）
// Layer  0.5: 葫芦基底（保持不变）
// Layer  1: QuadrantLabels（A组fontSizeRatio=0.36 ✅）
// Layer  1.5: ZoneEffectLayer（E7: 区域进入特效）← 新增
// Layer  2: CheckerboardBorder（A组tileSize=7, opacity=0.95 ✅）
// Layer  3: EnhancedPathLayer（E2: 方向箭头+流动）← 替换原PathLayer
// Layer  4: CellNode（含E5: hover增强）
// Layer  5: AnimationLayer（E0: 纯SVG版）← 替换原DOM版
// Layer  5.5: BossDangerRing（E1: Boss危险环）← 新增
// Layer  6: CellInfoPanel（E3: 浮窗）← DOM overlay（唯一允许的overlay）
// Layer  7: Dice3D（E4: 骰子）← DOM overlay
```

## 第九轮E组改动总览

| 任务 | 对应Gap | 改动内容 | 文件 |
|------|---------|---------|------|
| **E0** | Gap-P1-4(P1) | AnimationLayer完全纯SVG重写 | AnimationLayer.tsx |
| **E1** | Gap-P1-1(P1) | Boss格3层危险脉冲环 | BossDangerRing.tsx(新) |
| **E2** | Gap-P1-5(P1) | 路径方向箭头+流动粒子+分叉标记 | PathLayer.tsx(新) |
| **E3** | Gap-P2-3(P2) | CellInfoPanel完整浮窗UI | CellInfoPanel.tsx(新)+css |
| **E4** | Gap-P2-10(P2) | Dice3D伪3D骰子+修正值显示 | Dice3D.tsx(新)+css |
| **E5** | Gap-P2-4(P2) | 格子hover放大+tooltip | CellNode.tsx增强 |
| **E6** | Gap-P2-9(P2) | 层级切换缩放淡入淡出 | index.tsx增强 |
| **E7** | — | 6种区域进入差异化特效 | ZoneEffectLayer.tsx增强 |
| **E8** | — | 主组件整合全部新组件 | index.tsx更新 |

## 验收标准

1. ✅ AnimationLayer **零DOM div**，全部使用 `<g><circle><path>` 等 SVG 元素
2. ✅ 玩家棋子在SVG内正确显示：绿圆+内核+🎮SVG图标+呼吸动画+区域字母
3. ✅ 轨迹光痕为纯SVG `<circle>` 带 `<animate>` 淡出，最多6个
4. ✅ 到达波纹为主次双环+中心弹性闪烁点
5. ✅ Boss危险环为3层(red/orange/red-dashed)，含旋转虚线和⚠DANGER文字
6. ✅ 连接线末端有**方向箭头**(marker-end)，高亮路径有**流动粒子**
7. ✅ 分叉点有**橙色旋转菱形+?标记**
8. ✅ CellInfoPanel 弹窗可正常打开/关闭，显示名称/星级/敌人/收益/卡牌
9. ✅ CellInfoPanel 有"进入"和"暂不进入"两个按钮，点击回调正确
10. ✅ Dice3D 可触发投掷动画（准备0.5s+翻滚1.2s+结果弹出）
11. ✅ Dice3D 显示修正值列表(base+modifiers=final)
12. ✅ 大成功显示金色爆炸粒子，大失败显示红色碎裂效果
13. ✅ 格子hover时有**白色发光底圈放大动画**+类型tooltip
14. ✅ 层级切换时有 **scale(0.97→1.02→1)** + **opacity过渡**
15. ✅ 6种区域(W/N/I/P/S/D)进入时有**差异化特效**
16. ✅ 特殊移动类型(teleport/map-flip/banish)各有独特SVG动画
17. ✅ TypeScript 编译零错误
18. ✅ 所有新增CSS以 `.gm-*` 或 `.cip-*` 或 `.dice*` 为前缀，避免冲突
