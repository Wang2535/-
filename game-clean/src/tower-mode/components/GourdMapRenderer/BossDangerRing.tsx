import { useMemo } from 'react';

interface BossDangerRingProps {
  bossPosition: { x: number; y: number };
  isActive: boolean;
  playerDistance?: number;
  dangerLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export function BossDangerRing({
  bossPosition, isActive, playerDistance = 5, dangerLevel = 'medium'
}: BossDangerRingProps) {
  if (!isActive) return null;

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
    <g transform={`translate(${bossPosition.x},${bossPosition.y})`}
       opacity={intensity}>
      {ringConfigs.map((cfg, i) => (
        <circle key={i}
          r={cfg.r}
          fill="none"
          stroke={cfg.color}
          strokeWidth={cfg.width * intensity}
          opacity={0.3 + i * 0.1}
          strokeDasharray={cfg.dash || undefined}
          className="gm-boss-pulse"
        >
          <animate attributeName="r"
                   values={`${cfg.r};${cfg.r * (1.4 + i * 0.15)};${cfg.r}`}
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

      {(dangerLevel === 'high' || dangerLevel === 'critical') && (
        <text x="0" y={-(ringConfigs[2].r + 2)}
              textAnchor="middle" fontSize="2.8"
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
