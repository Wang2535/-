import React from 'react';

export interface MechanicVisualizerProps {
  mechanicType?: string;
  params?: Record<string, unknown>;
  topology?: { upperCircle: { center: { x: number; y: number }; radius: number }; lowerCircle: { center: { x: number; y: number }; radiusX: number; radiusY: number } };
  activeCells?: string[];
  wStreakCount?: number;
  blockedPathIds?: string[];
  protocolCorrectPath?: string[];
}

const AccelerationViz = React.memo<MechanicVisualizerProps>(({ wStreakCount = 0 }) => {
  const filled = Math.min(3, Math.max(0, wStreakCount));
  const barWidth = 120;
  const segmentHeight = 14;
  const gap = 4;

  return (
    <g transform="translate(80, 60)">
      <rect x={-6} y={-6} width={barWidth + 12} height={(segmentHeight + gap) * 3 - gap + 12} rx="8"
        fill="rgba(0,0,0,0.55)" stroke="rgba(255,68,68,0.5)" strokeWidth="1.2" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="0" y={i * (segmentHeight + gap)} width={barWidth} height={segmentHeight} rx="3"
          fill={i < filled ? '#ff4444' : 'rgba(255,68,68,0.18)'}
          stroke="#cc3333" strokeWidth="0.8" />
      ))}
      <text x={barWidth / 2} y={(segmentHeight + gap) * 3 + 16} textAnchor="middle"
        fill="#ff6666" fontSize="13" fontWeight="700" fontFamily="sans-serif">
        扩散进度 {filled}/3
      </text>
    </g>
  );
});
AccelerationViz.displayName = 'AccelerationViz';

const JumpViz = React.memo<MechanicVisualizerProps>(({ topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;

  return (
    <g>
      <circle cx={cx} cy={cy} r="70" fill="none" stroke="#00e5ff" strokeWidth="2.5"
        strokeDasharray="10 7" opacity="0.85">
        <animate attributeName="r" values="50;90;50" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.25;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="45" fill="none" stroke="#00bcd4" strokeWidth="2"
        strokeDasharray="6 5" opacity="0.65">
        <animate attributeName="r" values="35;60;35" dur="2s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#00e5ff" fontSize="22"
        fontWeight="900" fontFamily="monospace">↑ JUMP</text>
    </g>
  );
});
JumpViz.displayName = 'JumpViz';

const SequenceViz = React.memo<MechanicVisualizerProps>(({ params, topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;
  const completedSteps = (params?.completed as number) ?? 1;

  const layers = [
    { label: 'OUTER', r: 75, color: '#3498db', bg: 'rgba(52,152,219,0.12)', step: 1 },
    { label: 'MID', r: 52, color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', step: 2 },
    { label: 'CORE', r: 30, color: '#f39c12', bg: 'rgba(243,156,18,0.18)', step: 3 },
  ];

  return (
    <g>
      {layers.map((l) => {
        const done = completedSteps >= l.step;
        return (
          <g key={l.label}>
            <circle cx={cx} cy={cy} r={l.r} fill={l.bg} stroke={l.color}
              strokeWidth={done ? 2.5 : 1.2} strokeDasharray={done ? 'none' : '5 4'}
              opacity={done ? 0.95 : 0.55}>
              {!done && (
                <>
                  <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0.75;0.45" dur="2s" repeatCount="indefinite" />
                </>
              )}
            </circle>
            <text x={cx} y={cy - l.r + (l.r > 50 ? 22 : 14)}
              textAnchor="middle" fill={l.color} fontSize={l.r > 50 ? 11 : 9}
              fontWeight="800" fontFamily="sans-serif" opacity="0.85">{l.label}</text>
            <text x={cx} y={cy + (l.r > 50 ? 8 : 5)}
              textAnchor="middle" fill={done ? '#ffffff' : l.color}
              fontSize={l.r > 50 ? 20 : 15} fontWeight="900" fontFamily="sans-serif">
              {done ? '\u2713' : l.step}
            </text>
          </g>
        );
      })}
    </g>
  );
});
SequenceViz.displayName = 'SequenceViz';

const EventViz = React.memo<MechanicVisualizerProps>(({ topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;
  const basePositions = [
    { dx: -100, dy: -80 }, { dx: 110, dy: -40 }, { dx: -20, dy: 95 },
  ];
  const icons = ['?', '!', '*'];

  return (
    <g>
      {basePositions.map((pos, i) => (
        <g key={i}>
          <ellipse cx={cx + pos.dx} cy={cy + pos.dy} rx="28" ry="20"
            fill="rgba(155,89,182,0.22)" stroke="#9B59B6" strokeWidth="1.2" opacity="0.8">
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; 0,${i % 2 === 0 ? -12 : 12}; 0,0`}
              dur={`${2.5 + i * 0.6}s`} repeatCount="indefinite" />
          </ellipse>
          <text x={cx + pos.dx} y={cy + pos.dy + 5} textAnchor="middle"
            fill="#d4a5e8" fontSize="18" fontWeight="900" fontFamily="serif">
            {icons[i]}
          </text>
        </g>
      ))}
    </g>
  );
});
EventViz.displayName = 'EventViz';

const BlockadeViz = React.memo<MechanicVisualizerProps>(({ blockedPathIds = [], topology }) => {
  const lc = topology?.lowerCircle;
  const cx = lc?.center?.x ?? 400;
  const cy = lc?.center?.y ?? 420;
  const r = typeof lc?.radius === 'number' ? lc.radius : 130;

  if (blockedPathIds.length === 0) return null;

  const midpoints = blockedPathIds.map((_, idx) => {
    const angle = (Math.PI * 2 * idx) / Math.max(blockedPathIds.length, 1);
    return { x: cx + r * 0.6 * Math.cos(angle), y: cy + r * 0.6 * Math.sin(angle) };
  });

  return (
    <g>
      {midpoints.map((pt, i) => (
        <g key={i}>
          <line x1={pt.x - 12} y1={pt.y - 12} x2={pt.x + 12} y2={pt.y + 12}
            stroke="#ff3344" strokeWidth="4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              values={`${pt.x},${pt.y}; ${pt.x},${pt.y} +360`}
              dur="2s" repeatCount="indefinite" />
          </line>
          <line x1={pt.x + 12} y1={pt.y - 12} x2={pt.x - 12} y2={pt.y + 12}
            stroke="#ff3344" strokeWidth="4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              values={`${pt.x},${pt.y}; ${pt.x},${pt.y} +360`}
              dur="2s" repeatCount="indefinite" />
          </line>
          <text x={pt.x} y={pt.y + 26} textAnchor="middle"
            fill="#ff4444" fontSize="10" fontWeight="800" fontFamily="sans-serif">
            BLOCKED
          </text>
        </g>
      ))}
    </g>
  );
});
BlockadeViz.displayName = 'BlockadeViz';

const TeleportViz = React.memo<MechanicVisualizerProps>(({ topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;
  const rx = (topology?.lowerCircle?.radiusX ?? 140);
  const ry = (topology?.lowerCircle?.radiusY ?? 105);

  return (
    <g>
      <defs>
        <radialGradient id="tp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(142,68,173,0.5)" />
          <stop offset="70%" stopColor="rgba(142,68,173,0.15)" />
          <stop offset="100%" stopColor="rgba(142,68,173,0)" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#tp-glow)" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.45} ry={ry * 0.35}
        fill="rgba(186,85,211,0.25)" stroke="#ba55d3" strokeWidth="1.5">
        <animate attributeName="rx" values={`${rx * 0.42};${rx * 0.5};${rx * 0.42}`}
          dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="ry" values={`${ry * 0.32};${ry * 0.38};${ry * 0.32}`}
          dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite" />
      </ellipse>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="36">{'🌀'}</text>
    </g>
  );
});
TeleportViz.displayName = 'TeleportViz';

const DriftViz = React.memo<MechanicVisualizerProps>(({ topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;
  const rx = (topology?.lowerCircle?.radiusX ?? 140);
  const ry = (topology?.lowerCircle?.radiusY ?? 105);

  const arrows = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return {
      x: cx + rx * 0.82 * Math.cos(angle),
      y: cy + ry * 0.82 * Math.sin(angle),
      angle: (angle * 180) / Math.PI,
    };
  });

  return (
    <g>
      {arrows.map((arr, i) => (
        <g key={i}>
          <path d={`M${arr.x - 10},${arr.y + 5} L${arr.x},${arr.y - 10} L${arr.x + 10},${arr.y + 5} Z`}
            fill="#9B59B6" opacity="0.78">
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; ${Math.cos(arr.angle * Math.PI / 180) * 8},${Math.sin(arr.angle * Math.PI / 180) * 8}; 0,0`}
              dur={`${2.2 + i * 0.35}s`} repeatCount="indefinite" />
          </path>
          <line x1={arr.x} y1={arr.y + 5} x2={arr.x} y2={arr.y + 16}
            stroke="#9B59B6" strokeWidth="2.5" strokeLinecap="round" opacity="0.78">
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; ${Math.cos(arr.angle * Math.PI / 180) * 8},${Math.sin(arr.angle * Math.PI / 180) * 8}; 0,0`}
              dur={`${2.2 + i * 0.35}s`} repeatCount="indefinite" />
          </line>
        </g>
      ))}
    </g>
  );
});
DriftViz.displayName = 'DriftViz';

const CollapseViz = React.memo<MechanicVisualizerProps>(({ topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;
  const rx = (topology?.lowerCircle?.radiusX ?? 140);
  const ry = (topology?.lowerCircle?.radiusY ?? 105);

  const cracks = [
    [[0, 0], [rx * 0.6, -ry * 0.45], [rx * 0.9, -ry * 0.15]],
    [[0, 0], [-rx * 0.5, ry * 0.5], [-rx * 0.85, ry * 0.3]],
    [[0, 0], [rx * 0.3, ry * 0.65], [rx * 0.55, ry * 0.88]],
  ];

  return (
    <g>
      {cracks.map((pts, ci) => (
        <polyline key={ci}
          points={pts.map(p => `${cx + p[0]},${cy + p[1]}`).join(' ')}
          fill="none" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="6 4" opacity="0.85">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
        </polyline>
      ))}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="30">⚠</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill="#ffcc00"
        fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
        COLLAPSING ZONE
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
      </text>
    </g>
  );
});
CollapseViz.displayName = 'CollapseViz';

const ProtocolViz = React.memo<MechanicVisualizerProps>(({ protocolCorrectPath = [], params, topology }) => {
  const cx = topology?.lowerCircle?.center?.x ?? 400;
  const cy = topology?.lowerCircle?.center?.y ?? 420;
  const currentStep = (params?.currentStep as number) ?? 1;

  const nodePositions = [
    { x: cx - 110, y: cy - 70 },
    { x: cx + 20, y: cy - 90 },
    { x: cx + 100, y: cy - 10 },
    { x: cx + 40, y: cy + 75 },
    { x: cx - 80, y: cy + 55 },
  ];

  return (
    <g>
      {nodePositions.slice(0, -1).map((from, i) => {
        const to = nodePositions[i + 1];
        const isPassed = currentStep > i + 1;
        return (
          <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="#FFD700" strokeWidth="2" strokeDasharray="8 5"
            opacity={isPassed ? 0.95 : 0.4}>
            {!isPassed && (
              <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="1.2s" repeatCount="indefinite" />
            )}
          </line>
        );
      })}
      {nodePositions.map((np, i) => {
        const isActive = currentStep === i + 1;
        const isDone = currentStep > i + 1;
        return (
          <g key={i}>
            <circle cx={np.x} cy={np.y} r="17"
              fill={isDone ? 'rgba(255,215,0,0.35)' : isActive ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.08)'}
              stroke="#FFD700" strokeWidth={isActive ? 3 : 1.5}
              strokeDasharray={isActive ? 'none' : '4 3'}>
              {isActive && (
                <animate attributeName="r" values="17;21;17" dur="1.3s" repeatCount="indefinite" />
              )}
            </circle>
            <text x={np.x} y={np.y + 5} textAnchor="middle"
              fill={isActive || isDone ? '#FFD700' : '#b8960f'}
              fontSize="14" fontWeight="900" fontFamily="sans-serif">
              {i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
});
ProtocolViz.displayName = 'ProtocolViz';

const MECHANIC_COMPONENTS: Record<string, React.ComponentType<MechanicVisualizerProps>> = {
  acceleration: AccelerationViz,
  jump: JumpViz,
  sequence: SequenceViz,
  event: EventViz,
  blockade: BlockadeViz,
  teleport: TeleportViz,
  drift: DriftViz,
  collapse: CollapseViz,
  protocol: ProtocolViz,
};

export function MechanicVisualizer({ mechanicType, ...rest }: MechanicVisualizerProps) {
  if (!mechanicType) return null;
  const Component = MECHANIC_COMPONENTS[mechanicType];
  if (!Component) return null;

  return (
    <svg viewBox="0 0 800 600"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      xmlns="http://www.w3.org/2000/svg">
      <Component {...rest} />
    </svg>
  );
}

export { AccelerationViz, JumpViz, SequenceViz, EventViz, BlockadeViz, TeleportViz, DriftViz, CollapseViz, ProtocolViz };
