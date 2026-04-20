import React from 'react';

interface UltimateBossRendererProps {
  position: { x: number; y: number };
  isActive?: boolean;
  healthPercent?: number;
}

const SIZE = 30;

function generateStarPoints(cx: number, cy: number, innerR: number, outerR: number, points: number): string {
  const vertices: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    vertices.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return vertices.join(' ');
}

function ParticleBurst({ cx, cy, radius }: { cx: number; cy: number; radius: number }) {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 12;
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r="1.5"
        fill="#FFD700"
        opacity="0"
      >
        <animate
          attributeName="cx"
          from={String(cx)}
          to={String(cx + Math.cos(angle) * radius * 1.5)}
          dur="1.5s"
          begin={`${i * 0.08}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          from={String(cy)}
          to={String(cy + Math.sin(angle) * radius * 1.5)}
          dur="1.5s"
          begin={`${i * 0.08}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;0.8;0"
          dur="1.5s"
          begin={`${i * 0.08}s`}
          repeatCount="indefinite"
        />
      </circle>
    );
  });
  return <>{particles}</>;
}

function UltimateBossRenderer({ position, isActive = false, healthPercent = 100 }: UltimateBossRendererProps) {
  const cx = 50;
  const cy = 48;
  const size = SIZE;
  const starOuterRadius = size;
  const starInnerRadius = size * 0.45;
  const showHealthBar = healthPercent < 100;

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {/* ===== 三层能量光环 ===== */}
      {/* 外层红色 */}
      <circle
        cx={cx}
        cy={cy}
        r={size + 22}
        fill="none"
        stroke="#ff000022"
        strokeWidth="1.5"
        strokeDasharray="2 6"
      >
        <animate
          attributeName="r"
          values={`${size + 20};${size + 26};${size + 20}`}
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.7;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 中层橙色 */}
      <circle
        cx={cx}
        cy={cy}
        r={size + 16}
        fill="none"
        stroke="#ff660033"
        strokeWidth="2"
        strokeDasharray="4 4"
      >
        <animate
          attributeName="r"
          values={`${size + 14};${size + 19};${size + 14}`}
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.4;0.85;0.4"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 内层金色 */}
      <circle
        cx={cx}
        cy={cy}
        r={size + 12}
        fill="none"
        stroke="#FFD70044"
        strokeWidth="3"
      >
        <animate
          attributeName="r"
          values={`${size + 10};${size + 15};${size + 10}`}
          dur="1.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* ===== 王座底座 ===== */}
      {/* 底座平台 */}
      <rect
        x={cx - 28}
        y={cy + size + 18}
        width="56"
        height="6"
        rx="2"
        fill="#2a1a4e"
        stroke="#FFD700"
        strokeWidth="1"
      />

      {/* 柱子1 - 左侧 */}
      <rect
        x={cx - 24}
        y={cy + size + 4}
        width="4"
        height="14"
        fill="#1a0a2e"
        stroke="#FFD70066"
        strokeWidth="0.5"
      />

      {/* 柱子2 - 左中 */}
      <rect
        x={cx - 9}
        y={cy + size + 2}
        width="4"
        height="16"
        fill="#1a0a2e"
        stroke="#FFD70066"
        strokeWidth="0.5"
      />

      {/* 柱子3 - 右中 */}
      <rect
        x={cx + 5}
        y={cy + size + 2}
        width="4"
        height="16"
        fill="#1a0a2e"
        stroke="#FFD70066"
        strokeWidth="0.5"
      />

      {/* 柱子4 - 右侧 */}
      <rect
        x={cx + 20}
        y={cy + size + 4}
        width="4"
        height="14"
        fill="#1a0a2e"
        stroke="#FFD70066"
        strokeWidth="0.5"
      />

      {/* 宝石 - 红色（柱子1顶部） */}
      <circle cx={cx - 22} cy={cy + size + 2} r="2.5" fill="#FF0000">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 宝石 - 绿色（柱子2顶部） */}
      <circle cx={cx - 7} cy={cy + size} r="2.5" fill="#00FF00">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1.2s"
          begin="0.25s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 宝石 - 蓝色（柱子3顶部） */}
      <circle cx={cx + 7} cy={cy + size} r="2.5" fill="#0000FF">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1.4s"
          begin="0.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 宝石 - 黄色（柱子4顶部） */}
      <circle cx={cx + 22} cy={cy + size + 2} r="2.5" fill="#FFFF00">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1.1s"
          begin="0.75s"
          repeatCount="indefinite"
        />
      </circle>

      {/* ===== 六角星形Boss主体 ===== */}
      <polygon
        points={generateStarPoints(cx, cy, starInnerRadius, starOuterRadius, 6)}
        fill="#1a0a2e"
        stroke="#FFD700"
        strokeWidth={isActive ? 4 : 3}
      >
        {isActive && (
          <>
            <animate
              attributeName="strokeWidth"
              values="4;6;4"
              dur="0.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke"
              values="#FFD700;#FFA500;#FFD700"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </>
        )}
      </polygon>

      {/* Boss内部文字 */}
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
      >
        💀
      </text>

      {/* ===== 粒子爆发效果（仅激活时显示）===== */}
      {isActive && <ParticleBurst cx={cx} cy={cy} radius={size} />}

      {/* ===== 血量条（仅healthPercent<100时显示）===== */}
      {showHealthBar && (
        <g>
          {/* 灰色背景条 */}
          <rect
            x={cx - 20}
            y={cy - size - 12}
            width="40"
            height="5"
            rx="2"
            fill="#333333"
            stroke="#555555"
            strokeWidth="0.5"
          />
          {/* 红色前景条 */}
          <rect
            x={cx - 20}
            y={cy - size - 12}
            width={40 * healthPercent / 100}
            height="5"
            rx="2"
            fill="#FF2222"
          >
            <animate
              attributeName="width"
              from="0"
              to={String(40 * healthPercent / 100)}
              dur="0.5s"
              fill="freeze"
            />
          </rect>
        </g>
      )}

      {/* ===== Boss名称标签 ===== */}
      <text
        x={cx}
        y={cy + size + 32}
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="#FFD700"
      >
        最终Boss
      </text>
    </g>
  );
}

export { UltimateBossRenderer, UltimateBossRendererProps };
export default UltimateBossRenderer;
