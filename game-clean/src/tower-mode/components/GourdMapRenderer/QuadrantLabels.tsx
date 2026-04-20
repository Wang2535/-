import { DEFAULT_QUADRANT_LABELS } from './types';
import type { QuadrantLabelConfig } from './types';

interface QuadrantLabelsProps {
  topology: any;
}

const AREA_EFFECT_COLORS: Record<string, string> = {
  W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', P: '#F39C12', S: '#2ECC71', D: '#E74C3C',
};

export function QuadrantLabels({ topology }: QuadrantLabelsProps) {
  const lc = topology.lowerCircle;
  if (!lc) return null;

  const cx = lc.center.x;
  const cy = lc.center.y;
  const r = lc.radius * 0.82;

  const labels: QuadrantLabelConfig[] = topology.visualConfig?.quadrantLabels ?? DEFAULT_QUADRANT_LABELS;

  const baseFontSize = Math.max(r * 2 * (labels[0]?.fontSizeRatio ?? 0.22), 12);

  const offsets = [
    { dx: -0.38, dy: -0.38 },
    { dx: 0.38, dy: -0.38 },
    { dx: -0.38, dy: 0.38 },
    { dx: 0.38, dy: 0.38 },
  ];

  return (
    <g>
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
            stroke="#FFFFFF" strokeWidth="0.8" opacity="0.45" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r}
            stroke="#FFFFFF" strokeWidth="0.8" opacity="0.45" />

      {labels.map((q: QuadrantLabelConfig, i: number) => {
        const off = offsets[i];
        const qKey = q.quadrant ?? q.label ?? '';
        const fallbackColor = AREA_EFFECT_COLORS[qKey] ?? '#FFFFFF';
        return (
          <text key={qKey || i}
            x={cx + r * off.dx}
            y={cy + r * off.dy}
            fill={q.color ?? fallbackColor}
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
                ? `drop-shadow(${q.shadowOffsetX ?? 1}px ${q.shadowOffsetY ?? 1}px ${q.shadowBlur ?? 3}px ${q.shadowColor ?? '#000000'})`
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
