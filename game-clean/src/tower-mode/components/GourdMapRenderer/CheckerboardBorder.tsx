import type { BorderConfig } from './types';

interface CheckerboardBorderProps {
  topology: any;
}

export function CheckerboardBorder({ topology }: CheckerboardBorderProps) {
  const borderCfg: BorderConfig | undefined = topology?.visualConfig?.border;

  const uc = topology.upperCircle;
  const lc = topology.lowerCircle;
  if (!uc || !lc) return null;

  if (!borderCfg?.enabled) {
    return <FallbackRadialBorder topology={topology} />;
  }

  if (borderCfg.mode !== 'checkerboard-fill') {
    return <FallbackRadialBorder topology={topology} />;
  }

  const tileSize = borderCfg.tileSize ?? 12;
  const colors = borderCfg.colors ?? ['#FFAA00', '#FFFFFF'];
  const radius = borderCfg.cornerRadius ?? 3;
  const opacity = borderCfg.opacity ?? 0.85;
  const borderWidth = borderCfg.borderWidth ?? 10;
  const instanceId = topology.id ?? 'default';

  return (
    <>
      <defs>
        <pattern id={`cbp-${instanceId}`}
                width={tileSize} height={tileSize}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(15)">
          <rect width={tileSize / 2} height={tileSize / 2}
                fill={colors[0]} rx={radius} ry={radius} />
          <rect width={tileSize / 2} height={tileSize / 2}
                fill={colors[1]} rx={radius} ry={radius}
                x={tileSize / 2} y={tileSize / 2} />
          <rect width={tileSize / 2} height={tileSize / 2}
                fill={colors[1]} rx={radius} ry={radius}
                x={0} y={tileSize / 2} />
          <rect width={tileSize / 2} height={tileSize / 2}
                fill={colors[0]} rx={radius} ry={radius}
                x={tileSize / 2} y={0} />
        </pattern>

        <filter id={`bgf-${instanceId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#bgf-${instanceId})`} opacity={opacity} className="gm-border-glow">
        <ellipse
          cx={uc.center.x} cy={uc.center.y}
          rx={uc.radius + borderWidth / 2}
          ry={uc.radius * 0.85 + borderWidth / 2}
          fill={`url(#cbp-${instanceId})`}
          stroke={colors[0]} strokeWidth="0.6"
        />
        <ellipse
          cx={lc.center.x} cy={lc.center.y}
          rx={lc.radius + borderWidth / 2}
          ry={lc.radius * 0.85 + borderWidth / 2}
          fill={`url(#cbp-${instanceId})`}
          stroke={colors[0]} strokeWidth="0.6"
        />
      </g>
    </>
  );
}

function FallbackRadialBorder({ topology }: { topology: any }) {
  const uc = topology.upperCircle;
  const lc = topology.lowerCircle;
  if (!uc || !lc) return null;

  const colors = ['#FFAA00', '#FFFFFF'];
  const n = 36;

  const upperSegs = Array.from({ length: n }, (_, i) => {
    const a1 = (2 * Math.PI * i) / n;
    const a2 = (2 * Math.PI * (i + 1)) / n;
    return (
      <line key={`ub${i}`}
        x1={uc.center.x + (uc.radius + 0.8) * Math.cos(a1)}
        y1={uc.center.y + (uc.radius * 0.85 + 0.8) * Math.sin(a1)}
        x2={uc.center.x + (uc.radius + 0.8) * Math.cos(a2)}
        y2={uc.center.y + (uc.radius * 0.85 + 0.8) * Math.sin(a2)}
        stroke={colors[i % 2]} strokeWidth="0.7"
      />
    );
  });

  const lowerSegs = Array.from({ length: n }, (_, i) => {
    const a1 = (2 * Math.PI * i) / n;
    const a2 = (2 * Math.PI * (i + 1)) / n;
    return (
      <line key={`lb${i}`}
        x1={lc.center.x + (lc.radius + 0.8) * Math.cos(a1)}
        y1={lc.center.y + (lc.radius * 0.85 + 0.8) * Math.sin(a1)}
        x2={lc.center.x + (lc.radius + 0.8) * Math.cos(a2)}
        y2={lc.center.y + (lc.radius * 0.85 + 0.8) * Math.sin(a2)}
        stroke={colors[i % 2]} strokeWidth="0.7"
      />
    );
  });

  return <g>{upperSegs}{lowerSegs}</g>;
}
