# E组第十一轮 — L9终极Boss + 视觉系统完善

## 背景

第十轮E组完成了基础的路径风格/转场特效/装饰物增强,但仍有一些关键视觉缺口:

- L9 Boss格的终极视觉(王座/四柱/三层光环)可能未完全实现
- 格子点击交互的视觉反馈(悬停/选中/到达)需要完善
- 粒子系统缺乏统一管理
- 暗色主题下的色彩协调需要进一步打磨

## 本轮目标

**终极视觉打磨** — 让Boss战和关键节点拥有震撼的视觉效果,同时确保整体色彩和谐。

---

## 具体任务

### Task E1: ★★★ P1 — UltimateBossRenderer L9终极Boss渲染

**新建文件**: `src/tower-mode/components/GourdMapRenderer/UltimateBossRenderer.tsx`

```tsx
/**
 * UltimateBossRenderer — L9终极Boss的专属渲染组件
 * 
 * 视觉元素:
 * 1. 星形格子(非圆形,size×3.0)
 * 2. 王座底座(4根柱子+宝石)
 * 3. 三层能量光环(金/橙/红)
 * 4. 粒子喷射效果
 * 5. 脉动动画(同步三层光环)
 */

import React from 'react';

interface UltimateBossRendererProps {
  /** Boss中心位置 */
  position: { x: number; y: number };
  /** 是否激活(被选中/交互中) */
  isActive?: boolean;
  /** Boss血量百分比(0-100) */
  healthPercent?: number;
}

export function UltimateBossRenderer({
  position,
  isActive = false,
  healthPercent = 100,
}: UltimateBossRendererProps) {
  const size = 30; // Boss格子基础尺寸(3倍于普通格子)

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {/* ==================== 三层能量光环 ==================== */}
      {/* 外层 - 红色 */}
      <circle r={size + 22} fill="none" stroke="#ff000022" strokeWidth="1.5"
              strokeDasharray="2 6">
        <animate attributeName="r" values={`${size+20};${size+24};${size+20}`} dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* 中层 - 橙色 */}
      <circle r={size + 16} fill="none" stroke="#ff660033" strokeWidth="2"
              strokeDasharray="4 4">
        <animate attributeName="r" values={`${size+14};${size+18};${size+14}`} dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* 内层 - 金色 */}
      <circle r={size + 12} fill="none" stroke="#FFD70044" strokeWidth="3">
        <animate attributeName="r" values={`${size+10};${size+14};${size+10}`} dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.2s" repeatCount="indefinite" />
      </circle>

      {/* ==================== 王座底座 ==================== */}
      {/* 底座平台 */}
      <rect x={-size * 0.6} y={size * 0.85} width={size * 1.2} height={size * 0.2}
            rx="2" fill="#333344" stroke="#FFD700" strokeWidth="1" opacity="0.7" />

      {/* 四根柱子 */}
      {[
        { x: -size * 0.5, h: size * 0.6 },
        { x: -size * 0.2, h: size * 0.7 },
        { x: size * 0.2, h: size * 0.7 },
        { x: size * 0.5, h: size * 0.6 },
      ].map((pillar, i) => (
        <g key={`pillar-${i}`}>
          <rect x={pillar.x - 2} y={size * 0.85 - pillar.h}
                width="4" height={pillar.h}
                fill="#555566" stroke="#FFD700" strokeWidth="0.8" opacity="0.6" />
          {/* 柱顶宝石 */}
          <circle cx={pillar.x} cy={size * 0.85 - pillar.h} r="3"
                  fill={['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][i]}
                  opacity="0.8">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s"
                     begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* ==================== 星形Boss格 ==================== */}
      {/* 星形主体 */}
      <polygon
        points={generateStarPoints(0, 0, size * 0.5, size * 0.9, 6)}
        fill="#1a0a2e"
        stroke="#FFD700"
        strokeWidth={isActive ? 4 : 3}
        className={isActive ? 'gm-boss-active' : ''}
      >
        {isActive && (
          <animate attributeName="stroke-width" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
        )}
      </polygon>

      {/* 内部骷髅/拳头图标 */}
      <text y="5" textAnchor="middle" fontSize={size * 0.5} fill="#FFD700">💀</text>

      {/* Boss名称 */}
      <text y={size + 30} textAnchor="middle" fontSize="11"
            fill="#FFD700" fontWeight="bold" fontFamily="sans-serif"
            letterSpacing="1">
        最终Boss
      </text>

      {/* 血量条(战斗时显示) */}
      {healthPercent < 100 && (
        <g transform={`translate(0, ${size + 40})`}>
          <rect x={-20} y="-3" width="40" height="6" rx="3" fill="#333" />
          <rect x={-20} y="-3" width={40 * (healthPercent / 100)} height="6" rx="3"
                fill={healthPercent > 50 ? '#ff4444' : '#ff0000'}>
            <animate attributeName="width" from="40" to={40 * (healthPercent / 100)}
                     dur="0.5s" fill="freeze" />
          </rect>
        </g>
      )}

      {/* ==================== 粒子喷射 ==================== */}
      {isActive && (
        <ParticleBurst count={12} color="#FFD700" radius={size} />
      )}
    </g>
  );
}

/**
 * 生成星形顶点
 */
function generateStarPoints(
  cx: number, cy: number,
  innerRadius: number, outerRadius: number,
  points: number
): string {
  const vertices: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    vertices.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return vertices.join(' ');
}

/**
 * 粒子喷射效果
 */
function ParticleBurst({ count, color, radius }: { count: number; color: string; radius: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count;
        return (
          <circle key={i} r="2" fill={color} opacity="0">
            <animate attributeName="cx" from="0" to={Math.cos(angle) * radius * 1.5}
                     dur="1s" begin={`${i * 0.08}s`} repeatCount="indefinite" fill="remove" />
            <animate attributeName="cy" from="0" to={Math.sin(angle) * radius * 1.5}
                     dur="1s" begin={`${i * 0.08}s`} repeatCount="indefinite" fill="remove" />
            <animate attributeName="opacity" values="0;0.8;0"
                     dur="1s" begin={`${i * 0.08}s`} repeatCount="indefinite" fill="remove" />
          </circle>
        );
      })}
    </>
  );
}
```

### Task E2: ★★☆ P1 — CellHoverFeedback 格子悬停反馈系统

**新建文件**: `src/tower-mode/components/GourdMapRenderer/CellHoverFeedback.tsx`

```tsx
/**
 * CellHoverFeedback — 格子交互视觉反馈
 * 
 * 状态:
 * 1. 默认: 基础样式
 * 2. Hover: 发光+放大
 * 3. Selected: 金色边框+脉动
 * 4. Arrived: 绿色闪光(刚刚到达)
 * 5. Blocked: 红色X(不可通行)
 */

import React, { useState, useCallback } from 'react';

interface CellHoverFeedbackProps {
  position: { x: number; y: number };
  size?: number;
  cellType: string;
  state: 'default' | 'hover' | 'selected' | 'arrived' | 'blocked';
  onClick?: () => void;
  children: React.ReactNode;
}

export function CellHoverFeedback({
  position,
  size = 10,
  cellType,
  state,
  onClick,
  children,
}: CellHoverFeedbackProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const effectiveState = isHovered ? 'hover' : state;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ cursor: effectiveState === 'blocked' ? 'not-allowed' : 'pointer' }}
    >
      {/* 状态特效层 */}
      {effectiveState === 'hover' && (
        <circle r={size + 4} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="r" values={`${size+3};${size+6};${size+3}`} dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}

      {effectiveState === 'selected' && (
        <>
          <circle r={size + 3} fill="none" stroke="#ffd700" strokeWidth="2">
            <animate attributeName="r" values={`${size+2};${size+5};${size+2}`} dur="0.8s" repeatCount="indefinite" />
          </circle>
          <circle r={size + 6} fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.3"
                  strokeDasharray="3 3">
            <animateTransform attributeName="transform" type="rotate"
                              from="0" to="360" dur="3s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {effectiveState === 'arrived' && (
        <circle r={size + 5} fill="none" stroke="#44ff88" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values={`${size+3};${size+10};${size+3}`} dur="1s" repeatCount="1" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="1" />
        </circle>
      )}

      {effectiveState === 'blocked' && (
        <>
          <line x1={-size} y1={-size} x2={size} y2={size}
                stroke="#ff3344" strokeWidth="3" strokeLinecap="round" />
          <line x1={size} y1={-size} x2={-size} y2={size}
                stroke="#ff3344" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* 格子主体 */}
      {children}
    </g>
  );
}
```

### Task E3: ★★☆ P1 — ColorHarmonySystem 色彩和谐系统

**新建文件**: `src/tower-mode/theme/colorHarmony.ts`

```typescript
/**
 * ColorHarmonySystem — 确保9层地图的色彩协调
 * 
 * 为每层定义主题色/背景色/强调色/危险色
 */

export interface LayerColorTheme {
  primary: string;       // 主题色
  secondary: string;     // 次要色
  background: string;    // 背景色
  backgroundGradient: string; // 渐变背景
  accent: string;        // 强调色(高亮)
  danger: string;        // 危险色(Boss/危险区域)
  success: string;       // 成功色(到达/完成)
  text: string;          // 文字色
  textSecondary: string; // 次要文字色
}

export const LAYER_COLOR_THEMES: Record<number, LayerColorTheme> = {
  1: {
    // L1 病毒实验室 — 橙红科技
    primary: '#ff8800',
    secondary: '#cc6600',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #1a0a0a 100%)',
    accent: '#ffaa44',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  2: {
    // L2 赛博空间 — 蓝青网络
    primary: '#4488ff',
    secondary: '#2266dd',
    background: '#0a0a2e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a2e 0%, #0a1a2e 100%)',
    accent: '#00ffff',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  3: {
    // L3 数据金库 — 金色堡垒
    primary: '#ffd700',
    secondary: '#ccaa00',
    background: '#0a0a14',
    backgroundGradient: 'linear-gradient(180deg, #0a0a14 0%, #1a140a 100%)',
    accent: '#ffee44',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  4: {
    // L4 城市街区 — 粉紫霓虹
    primary: '#ff6b9d',
    secondary: '#dd4488',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #1a0a14 100%)',
    accent: '#ff88bb',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  5: {
    // L5 智能工厂 — 绿色流水
    primary: '#50c878',
    secondary: '#38a85e',
    background: '#0a1a0a',
    backgroundGradient: 'linear-gradient(180deg, #0a1a0a 0%, #0a1a0a 100%)',
    accent: '#7fff7f',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  6: {
    // L6 移动终端 — 橙色电信
    primary: '#f7931e',
    secondary: '#d4761a',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #1a0a0a 100%)',
    accent: '#ffff00',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  7: {
    // L7 云端平台 — 紫云飘渺
    primary: '#9b59b6',
    secondary: '#7d3c98',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #140a1e 100%)',
    accent: '#d4a5e8',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  8: {
    // L8 未来实验室 — 紫色坍缩
    primary: '#00d4ff',
    secondary: '#0097a7',
    background: '#0a0a14',
    backgroundGradient: 'linear-gradient(180deg, #0a0a14 0%, #0a0a2e 100%)',
    accent: '#00ffff',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  9: {
    // L9 指挥中心 — 金色宫殿
    primary: '#ffd700',
    secondary: '#ccaa00',
    background: '#0a0a0a',
    backgroundGradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a00 100%)',
    accent: '#ffffff',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
};

export function getLayerTheme(layerNumber: number): LayerColorTheme {
  return LAYER_COLOR_THEMES[layerNumber] ?? LAYER_COLOR_THEMES[1];
}
```

### Task E4: ★☆☆ P2 — ParticleSystemManager 统一粒子系统

**新建文件**: `src/tower-mode/components/Effects/ParticleSystemManager.tsx`

```tsx
/**
 * ParticleSystemManager — 统一管理所有粒子效果
 * 
 * 支持的粒子类型:
 * 1. circuit — 电路数据流粒子(L2)
 * 2. conveyor — 传送带滚轮粒子(L5)
 * 3. lightning — 电信号粒子(L6)
 * 4. dataflow — 数据流粒子(L3/L9)
 * 5. boss — Boss战粒子
 */

import React, { useEffect, useState } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: string;
}

interface ParticleSystemManagerProps {
  type: 'circuit' | 'conveyor' | 'lightning' | 'dataflow' | 'boss';
  position?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right' | 'radial';
  count?: number;
  color?: string;
  active?: boolean;
}

export function ParticleSystemManager({
  type,
  position = { x: 400, y: 300 },
  direction = 'up',
  count = 20,
  color,
  active = true,
}: ParticleSystemManagerProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const defaultColors: Record<string, string> = {
      circuit: '#00ffff',
      conveyor: '#7fff7f',
      lightning: '#ffff00',
      dataflow: '#ffd700',
      boss: '#FFD700',
    };

    const particleColor = color ?? defaultColors[type] ?? '#ffffff';

    const interval = setInterval(() => {
      setParticles(prev => {
        // 更新现有粒子
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter(p => p.life > 0);

        // 生成新粒子
        if (updated.length < count) {
          const newParticles: Particle[] = [];
          for (let i = 0; i < 2; i++) {
            let vx = 0, vy = 0;
            switch (direction) {
              case 'up': vy = -1 - Math.random(); break;
              case 'down': vy = 1 + Math.random(); break;
              case 'left': vx = -1 - Math.random(); break;
              case 'right': vx = 1 + Math.random(); break;
              case 'radial':
                const angle = Math.random() * Math.PI * 2;
                vx = Math.cos(angle) * (1 + Math.random());
                vy = Math.sin(angle) * (1 + Math.random());
                break;
            }

            newParticles.push({
              id: `${type}-${Date.now()}-${i}`,
              x: position.x + (Math.random() - 0.5) * 40,
              y: position.y + (Math.random() - 0.5) * 40,
              vx, vy,
              life: 30 + Math.floor(Math.random() * 20),
              maxLife: 50,
              color: particleColor,
              size: 1 + Math.random() * 2,
              type,
            });
          }
          return [...updated, ...newParticles];
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [type, position, direction, count, color, active]);

  if (!active || particles.length === 0) return null;

  return (
    <g className={`particle-system particle-system-${type}`}>
      {particles.map(p => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={p.color}
          opacity={p.life / p.maxLife}
        />
      ))}
    </g>
  );
}
```

---

## 第十一轮E组改动总览

| 任务 | 优先级 | 改动内容 | 预期效果 |
|------|--------|---------|---------|
| **E1** | P1 | UltimateBossRenderer | L9 Boss拥有星形/王座/四柱/三层光环/粒子 |
| **E2** | P1 | CellHoverFeedback | 格子有hover/selected/arrived/blocked反馈 |
| **E3** | P1 | ColorHarmonySystem | 9层各有完整主题色定义 |
| **E4** | P2 | ParticleSystemManager | 统一的粒子效果管理 |

## 验收标准

1. ✅ L9 Boss显示为星形(非圆形)
2. ✅ L9 Boss有王座底座(4根柱子+4颗宝石)
3. ✅ L9 Boss有三层光环(金/橙/红)同步脉动
4. ✅ 悬停格子时有发光效果
5. ✅ 选中格子时有金色旋转边框
6. ✅ 到达格子时有绿色扩散动画
7. ✅ 9层各有不同的主题色(primary不同)
8. ✅ 粒子效果流畅不卡顿(60fps)
9. ✅ 所有颜色在暗色背景下协调
10. ✅ Boss战血量条正确更新
