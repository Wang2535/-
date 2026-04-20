# E组第十一轮 — L9终极Boss视觉与色彩系统

## 背景

L9 Boss需要远超其他层的视觉冲击力，同时9层地图需要有各自的主题色系统来区分。

## 🎯 本轮目标

**完成L9终极Boss渲染(星形+王座+三层光环)，建立9层色彩和谐系统，完善格子交互视觉反馈。**

---

## 任务详情

### Task E1: ★★★ P1 — UltimateBossRenderer L9终极Boss

**新建文件**: `src/tower-mode/components/GourdMapRenderer/UltimateBossRenderer.tsx`

```tsx
/**
 * UltimateBossRenderer — L9终极Boss专属渲染
 * 
 * 视觉元素:
 * 1. 星形格子(6角星,非圆形,size×3.0)
 * 2. 王座底座(4根柱子+4颗宝石)
 * 3. 三层能量光环(金/橙/红)同步脉动
 * 4. 粒子喷射效果(激活时)
 */

import React from 'react';

interface UltimateBossRendererProps {
  position: { x: number; y: number };
  isActive?: boolean;
  healthPercent?: number;
}

export function UltimateBossRenderer({ position, isActive, healthPercent = 100 }: UltimateBossRendererProps) {
  const size = 30;

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {/* ===== 三层能量光环 ===== */}
      {[
        { r: size + 22, color: '#ff000022', dash: '2 6', dur: '2s' },
        { r: size + 16, color: '#ff660033', dash: '4 4', dur: '1.5s' },
        { r: size + 12, color: '#FFD70044', dash: '', dur: '1.2s' },
      ].map((aura, i) => (
        <circle key={i} r={aura.r} fill="none" stroke={aura.color} strokeWidth={3 - i}
                strokeDasharray={aura.dash}>
          <animate attributeName="r" values={`${aura.r - 2};${aura.r + 2};${aura.r - 2}`}
                   dur={aura.dur} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3"
                   dur={aura.dur} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ===== 王座底座 ===== */}
      <rect x={-size * 0.6} y={size * 0.85} width={size * 1.2} height={size * 0.2}
            rx="2" fill="#333" stroke="#FFD700" strokeWidth="1" opacity="0.7" />

      {/* 四柱+宝石 */}
      {[-0.5, -0.17, 0.17, 0.5].map((xOff, i) => (
        <g key={`p-${i}`}>
          <rect x={size * xOff - 2} y={size * 0.85 - size * 0.6}
                width="4" height={size * 0.6}
                fill="#555" stroke="#FFD700" strokeWidth="0.8" opacity="0.6" />
          <circle cx={size * xOff} cy={size * 0.85 - size * 0.6} r="3"
                  fill={['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][i]} opacity="0.8">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s"
                     begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* ===== 星形主体 ===== */}
      <polygon
        points={generateStar(0, 0, size * 0.5, size * 0.9, 6)}
        fill="#1a0a2e"
        stroke={isActive ? '#fff' : '#FFD700'}
        strokeWidth={isActive ? 5 : 4}>
        {isActive && (
          <animate attributeName="stroke-width" values="4;6;4" dur="0.8s" repeatCount="indefinite" />
        )}
      </polygon>

      {/* Boss图标 */}
      <text y="5" textAnchor="middle" fontSize={size * 0.5} fill="#FFD700">💀</text>

      {/* 血量条 */}
      {healthPercent < 100 && (
        <g transform={`translate(0, ${size + 35})`}>
          <rect x={-20} y="-3" width="40" height="6" rx="3" fill="#333" />
          <rect x={-20} y="-3" width={40 * (healthPercent / 100)} height="6" rx="3"
                fill={healthPercent > 50 ? '#ff4444' : '#ff0000'} />
        </g>
      )}

      {/* 粒子(激活时) */}
      {isActive && <BossParticles count={12} color="#FFD700" radius={size} />}
    </g>
  );
}

function generateStar(cx: number, cy: number, innerR: number, outerR: number, points: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function BossParticles({ count, color, radius }: { count: number; color: string; radius: number }) {
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

### Task E2: ★★☆ P1 — LayerColorTheme 九层色彩系统

**新建文件**: `src/tower-mode/theme/layerColors.ts`

```typescript
/**
 * LayerColorTheme — 9层地图的主题色定义
 */

export interface LayerColorTheme {
  primary: string;       // 主题色(路径/边框)
  secondary: string;     // 次要色
  background: string;    // 背景色
  accent: string;        // 强调色(高亮)
  danger: string;        // 危险色
  success: string;       // 成功色
}

export const LAYER_COLORS: Record<number, LayerColorTheme> = {
  1: { primary: '#ff8800', secondary: '#cc6600', background: '#0a0a1e', accent: '#ffaa44', danger: '#ff4444', success: '#44ff88' },
  2: { primary: '#4488ff', secondary: '#2266dd', background: '#0a0a2e', accent: '#00ffff', danger: '#ff4444', success: '#44ff88' },
  3: { primary: '#ffd700', secondary: '#ccaa00', background: '#0a0a14', accent: '#ffee44', danger: '#ff4444', success: '#44ff88' },
  4: { primary: '#ff6b9d', secondary: '#dd4488', background: '#0a0a1e', accent: '#ff88bb', danger: '#ff4444', success: '#44ff88' },
  5: { primary: '#50c878', secondary: '#38a85e', background: '#0a1a0a', accent: '#7fff7f', danger: '#ff4444', success: '#44ff88' },
  6: { primary: '#f7931e', secondary: '#d4761a', background: '#0a0a1e', accent: '#ffff00', danger: '#ff4444', success: '#44ff88' },
  7: { primary: '#9b59b6', secondary: '#7d3c98', background: '#0a0a1e', accent: '#d4a5e8', danger: '#ff4444', success: '#44ff88' },
  8: { primary: '#00d4ff', secondary: '#0097a7', background: '#0a0a14', accent: '#00ffff', danger: '#ff4444', success: '#44ff88' },
  9: { primary: '#ffd700', secondary: '#ccaa00', background: '#0a0a0a', accent: '#ffffff', danger: '#ff4444', success: '#44ff88' },
};

export function getLayerColors(layerNumber: number): LayerColorTheme {
  return LAYER_COLORS[layerNumber] ?? LAYER_COLORS[1];
}
```

### Task E3: ★★☆ P1 — CellHoverFeedback 格子交互反馈

**新建文件**: `src/tower-mode/components/GourdMapRenderer/CellHoverFeedback.tsx`

```tsx
/**
 * CellHoverFeedback — 格子交互视觉反馈
 * 
 * 状态: hover(发光), selected(金边框+旋转), arrived(绿色扩散), blocked(红色X)
 */

import React, { useState, useCallback } from 'react';

interface CellHoverFeedbackProps {
  position: { x: number; y: number };
  size?: number;
  state: 'default' | 'hover' | 'selected' | 'arrived' | 'blocked';
  onClick?: () => void;
  children: React.ReactNode;
}

export function CellHoverFeedback({ position, size = 10, state, onClick, children }: CellHoverFeedbackProps) {
  const [hovered, setHovered] = useState(false);
  const effectiveState = hovered ? 'hover' : state;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ cursor: effectiveState === 'blocked' ? 'not-allowed' : 'pointer' }}
    >
      {/* hover: 发光 */}
      {effectiveState === 'hover' && (
        <circle r={size + 4} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="r" values={`${size+3};${size+6};${size+3}`} dur="0.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* selected: 金色边框+旋转虚线 */}
      {effectiveState === 'selected' && (
        <>
          <circle r={size + 3} fill="none" stroke="#ffd700" strokeWidth="2">
            <animate attributeName="r" values={`${size+2};${size+5};${size+2}`} dur="0.8s" repeatCount="indefinite" />
          </circle>
          <circle r={size + 6} fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.3" strokeDasharray="3 3">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* arrived: 绿色扩散 */}
      {effectiveState === 'arrived' && (
        <circle r={size + 5} fill="none" stroke="#44ff88" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values={`${size+3};${size+10};${size+3}`} dur="1s" repeatCount="1" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="1" />
        </circle>
      )}

      {/* blocked: 红色X */}
      {effectiveState === 'blocked' && (
        <>
          <line x1={-size} y1={-size} x2={size} y2={size} stroke="#ff3344" strokeWidth="3" strokeLinecap="round" />
          <line x1={size} y1={-size} x2={-size} y2={size} stroke="#ff3344" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {children}
    </g>
  );
}
```

---

## 验收标准

- [ ] L9 Boss显示为6角星形
- [ ] L9 Boss有王座底座(4根柱子+4颗宝石)
- [ ] 三层光环(金/橙/红)同步脉动
- [ ] 激活时有粒子喷射
- [ ] 悬停格子有发光
- [ ] 选中格子有金色旋转边框
- [ ] 到达格子有绿色扩散动画
- [ ] 阻塞格子有红色X
- [ ] 9层各有不同主题色(primary不同)
