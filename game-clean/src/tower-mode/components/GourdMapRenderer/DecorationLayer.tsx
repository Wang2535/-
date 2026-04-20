import type { DecorationConfig } from './types';

interface DecorationLayerProps {
  decorations: DecorationConfig[] | undefined;
  layerNumber?: number;
}

const PER_LAYER_DECOR_STYLES: Record<number, { renderType: string; primaryColor: string; secondaryColor: string }> = {
  1: { renderType: 'standard', primaryColor: '#4488ff', secondaryColor: '#88bbff' },
  2: { renderType: 'network', primaryColor: '#00d4ff', secondaryColor: '#0088cc' },
  3: { renderType: 'golden-ring', primaryColor: '#ffd700', secondaryColor: '#ffaa00' },
  4: { renderType: 'cityscape', primaryColor: '#ff6b9d', secondaryColor: '#ff4488' },
  5: { renderType: 'factory', primaryColor: '#50c878', secondaryColor: '#38a85e' },
  6: { renderType: 'signal-tower', primaryColor: '#f7931e', secondaryColor: '#d4761a' },
  7: { renderType: 'storm-cloud', primaryColor: '#b388ff', secondaryColor: '#9966dd' },
  8: { renderType: 'quantum-crack', primaryColor: '#00d4ff', secondaryColor: '#0088aa' },
  9: { renderType: 'throne-energy', primaryColor: '#ffd700', secondaryColor: '#ff8800' },
};

export function DecorationLayer({ decorations, layerNumber = 1 }: DecorationLayerProps) {
  const decStyle = PER_LAYER_DECOR_STYLES[layerNumber] ?? PER_LAYER_DECOR_STYLES[1];
  if (!decorations?.length && layerNumber <= 1) return null;

  const defaultDecorations = generateDefaultDecorations(layerNumber, decStyle);
  const allDecorations = decorations?.length ? decorations : defaultDecorations;

  return (
    <g opacity="0.35" className={`gm-dec-layer-${layerNumber}`}>
      {allDecorations.map((dec, i) => {
        const x = (dec.position?.x ?? 0.5) * 100;
        const y = (dec.position?.y ?? 0.5) * 100;
        const s = (dec.size ?? 0.05) * 100;
        const effectiveType = dec.type ?? decStyle.renderType;

        switch (effectiveType) {
          case 'planet':
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s / 8})`} className="gm-decor-float">
                <defs><radialGradient id={`planet-grad-${layerNumber}-${i}`}>
                  <stop offset="0%" stopColor={dec.color ?? decStyle.primaryColor} stopOpacity="0.9" />
                  <stop offset="70%" stopColor={dec.color ?? decStyle.primaryColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={dec.color ?? decStyle.primaryColor} stopOpacity="0" />
                </radialGradient></defs>
                <circle r="8" fill={`url(#planet-grad-${layerNumber}-${i})`} />
                <circle r="10" fill="none" stroke={dec.color ?? decStyle.primaryColor} strokeWidth="0.5" opacity="0.5" />
                <circle r="12" fill="none" stroke={dec.color ?? decStyle.primaryColor} strokeWidth="0.2" opacity="0.3" />
              </g>
            );
          case 'cloud':
            return (
              <ellipse key={i} cx={x} cy={y} rx={s * 0.8} ry={s * 0.4}
                         fill="rgba(255,255,255,0.12)" className="gm-decor-float" />
            );
          case 'crystal':
            return (
              <polygon key={i}
                       points={`${x},${y - s * 0.5} ${x + s * 0.3},${y} ${x},${y + s * 0.5} ${x - s * 0.3},${y}`}
                       fill={dec.color ?? decStyle.primaryColor} opacity={dec.opacity ?? 0.3}
                       className="gm-decor-float" />
            );
          case 'network-node':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <circle r={s * 0.15} fill={decStyle.primaryColor} opacity="0.6">
                  <animate attributeName="r" values={`${s * 0.15};${s * 0.25};${s * 0.15}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r={s * 0.04} fill="#ffffff" opacity="0.8" />
              </g>
            );
          case 'cable-line':
            return (
              <line key={i} x1={x - s * 0.5} y1={y} x2={x + s * 0.5} y2={y}
                    stroke={decStyle.primaryColor} strokeWidth="0.3" opacity="0.3" strokeDasharray="1 2">
                <animate attributeName="stroke-dashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
              </line>
            );
          case 'golden-ring':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <circle r={s * 0.3} fill="none" stroke={decStyle.primaryColor} strokeWidth="0.5" opacity="0.4">
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle r={s * 0.2} fill="none" stroke={decStyle.secondaryColor} strokeWidth="0.3" opacity="0.3">
                  <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="6s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          case 'lock-icon':
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s / 12})`}>
                <rect x="-4" y="-3" width="8" height="7" rx="1" fill="none" stroke={decStyle.primaryColor} strokeWidth="0.6" opacity="0.5" />
                <path d="M-1.5,-3 L-1.5,-5 A1.5,1.5 0 0,1 1.5,-5 L1.5,-3" fill="none" stroke={decStyle.primaryColor} strokeWidth="0.5" opacity="0.5" />
                <circle cx="0" cy="-0.5" r="0.8" fill={decStyle.primaryColor} opacity="0.5" />
              </g>
            );
          case 'building-silhouette':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <rect x={-s * 0.2} y={-s * 0.35} width={s * 0.4} height={s * 0.35}
                      fill="#222233" stroke={decStyle.primaryColor} strokeWidth="0.2" opacity="0.4" />
                {[0.3, 0.5, 0.7].map(wx => (
                  <rect key={`win-${wx}`}
                        x={(-0.18 + wx * 0.08) * s} y={-s * 0.3}
                        width={s * 0.06} height={s * 0.12}
                        fill={decStyle.primaryColor} opacity="0.3" />
                ))}
              </g>
            );
          case 'neon-sign':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <rect x={-s * 0.25} y={-s * 0.08} width={s * 0.5} height={s * 0.16} rx="1"
                      fill="none" stroke={decStyle.primaryColor} strokeWidth="0.3" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite" />
                </rect>
                <text x="0" y="0.3" textAnchor="middle" fontSize={s * 0.1}
                      fill={decStyle.primaryColor} fontWeight="bold" opacity="0.5">OPEN</text>
              </g>
            );
          case 'conveyor-belt':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <rect x={-s * 0.4} y={-s * 0.06} width={s * 0.8} height={s * 0.12} rx="2"
                      fill="none" stroke={decStyle.primaryColor} strokeWidth="0.3" opacity="0.3" />
                <line x1={-s * 0.35} y1={0} x2={s * 0.35} y2={0}
                      stroke={decStyle.secondaryColor} strokeWidth="0.2" strokeDasharray="2 3" opacity="0.4">
                  <animate attributeName="stroke-dashoffset" values="10;0" dur="0.5s" repeatCount="indefinite" />
                </line>
              </g>
            );
          case 'gear':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
                  {[0, 72, 144, 216, 288].map(angle => (
                    <rect key={`gt-${angle}`}
                          x={-1} y={-s * 0.18} width="2" height={s * 0.1} rx="0.5"
                          fill={decStyle.primaryColor} opacity="0.35"
                          transform={`rotate(${angle})`} />
                  ))}
                  <circle r={s * 0.1} fill="none" stroke={decStyle.primaryColor} strokeWidth="0.3" opacity="0.3" />
                </g>
              </g>
            );
          case 'signal-tower':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <polygon points="0,${-s * 0.3} ${-s * 0.15},${s * 0.15} ${s * 0.15},${s * 0.15}"
                         fill="none" stroke={decStyle.primaryColor} strokeWidth="0.4" opacity="0.4" />
                <circle r="0" fill="none" stroke={decStyle.primaryColor} strokeWidth="0.3" opacity="0.3">
                  <animate attributeName="r" values="0;${s * 0.35};0" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          case 'lost-mark':
            return (
              <g key={i} transform={`translate(${x},${y})`} className="gm-decor-float">
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central"
                      fontSize={s * 0.15} fill={decStyle.primaryColor} opacity="0.5" fontWeight="bold">?</text>
              </g>
            );
          case 'storm-cloud':
            return (
              <g key={i} transform={`translate(${x},${y})`} className="gm-decor-float">
                <ellipse rx={s * 0.5} ry={s * 0.25} fill={decStyle.primaryColor} opacity="0.15" />
                <path d={`M${-s * 0.2},${s * 0.1} Q0,${-s * 0.15} ${s * 0.2},${s * 0.1}`}
                      fill="none" stroke="#ffffff" strokeWidth="0.3" opacity="0.3" />
              </g>
            );
          case 'lightning-bolt':
            return (
              <polyline key={i}
                       points={`${x},${y - s * 0.2} ${x + s * 0.05},${y} ${x - s * 0.03},${y + s * 0.1} ${x + s * 0.08},${y + s * 0.2}`}
                       fill="none" stroke={decStyle.primaryColor} strokeWidth="0.5" opacity="0.4"
                       strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="opacity" values="0.4;0;0.4" dur="0.5s" repeatCount="indefinite" />
              </polyline>
            );
          case 'quantum-particle':
            return (
              <circle key={i} cx={x} cy={y} r={s * 0.03}
                      fill={decStyle.primaryColor} opacity="0">
                <animate attributeName="opacity" values="0;0.6;0" dur={`${1 + Math.random()}s`}
                           begin={`${Math.random()}s`} repeatCount="indefinite" />
                <animate attributeName="r" values={`${s * 0.02};${s * 0.05};${s * 0.02}`}
                           dur={`${1.5 + Math.random()}s`} repeatCount="indefinite" />
              </circle>
            );
          case 'crack-line':
            return (
              <polyline key={i}
                       points={`${x - s * 0.2},${y + s * 0.15} ${x - s * 0.05},${y} ${x + s * 0.08},${y - s * 0.1} ${x + s * 0.2},${y + s * 0.05}`}
                       fill="none" stroke={decStyle.primaryColor} strokeWidth="0.3" opacity="0.25"
                       strokeLinecap="round" strokeLinejoin="round" />
            );
          case 'throne-pillar':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <rect x={-s * 0.06} y={-s * 0.4} width={s * 0.12} height={s * 0.8}
                      fill="url(#throne-grad)" opacity="0.4" />
                <rect x={-s * 0.04} y={-s * 0.35} width={s * 0.08} height={s * 0.7}
                      fill={decStyle.primaryColor} opacity="0.15">
                  <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" />
                </rect>
              </g>
            );
          case 'energy-core':
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <circle r={s * 0.2} fill={decStyle.primaryColor} opacity="0.15">
                  <animate attributeName="r" values={`${s * 0.2};${s * 0.3};${s * 0.2}`} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.4;0.15" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle r={s * 0.1} fill="#ffffff" opacity="0.3" />
                {[0, 60, 120, 180, 240, 300].map(angle => (
                  <line key={`ec-ray-${angle}`}
                        x1="0" y1="0"
                        x2={Math.cos(angle * Math.PI / 180) * s * 0.25}
                        y2={Math.sin(angle * Math.PI / 180) * s * 0.25}
                        stroke={decStyle.primaryColor} strokeWidth="0.2" opacity="0.2">
                    <animate attributeName="opacity" values="0.2;0;0.2" dur="1s" begin={`${angle / 60}s`} repeatCount="indefinite" />
                  </line>
                ))}
              </g>
            );
          default:
            return <circle key={i} cx={x} cy={y} r={s / 2} fill={dec.color ?? '#888888'} opacity={dec.opacity ?? 0.2} />;
        }
      })}
    </g>
  );
}

function generateDefaultDecorations(layer: number, style: { renderType: string; primaryColor: string; secondaryColor: string }): DecorationConfig[] {
  const configs: Record<number, Array<{ type: string; position: { x: number; y: number }; size: number; color?: string }>> = {
    1: [
      { type: 'planet', position: { x: 0.15, y: 0.2 }, size: 0.07 },
      { type: 'planet', position: { x: 0.82, y: 0.15 }, size: 0.05 },
      { type: 'crystal', position: { x: 0.75, y: 0.78 }, size: 0.04 },
    ],
    2: [
      { type: 'network-node', position: { x: 0.12, y: 0.25 }, size: 0.06, color: style.primaryColor },
      { type: 'network-node', position: { x: 0.35, y: 0.18 }, size: 0.05, color: style.primaryColor },
      { type: 'network-node', position: { x: 0.68, y: 0.22 }, size: 0.055, color: style.primaryColor },
      { type: 'network-node', position: { x: 0.85, y: 0.3 }, size: 0.045, color: style.primaryColor },
      { type: 'cable-line', position: { x: 0.235, y: 0.215 }, size: 0.3 },
      { type: 'cable-line', position: { x: 0.515, y: 0.2 }, size: 0.25 },
      { type: 'cable-line', position: { x: 0.765, y: 0.26 }, size: 0.22 },
    ],
    3: [
      { type: 'golden-ring', position: { x: 0.2, y: 0.25 }, size: 0.08 },
      { type: 'golden-ring', position: { x: 0.78, y: 0.2 }, size: 0.06 },
      { type: 'lock-icon', position: { x: 0.5, y: 0.75 }, size: 0.05 },
    ],
    4: [
      { type: 'building-silhouette', position: { x: 0.15, y: 0.7 }, size: 0.09 },
      { type: 'building-silhouette', position: { x: 0.35, y: 0.72 }, size: 0.07 },
      { type: 'building-silhouette', position: { x: 0.7, y: 0.68 }, size: 0.1 },
      { type: 'neon-sign', position: { x: 0.52, y: 0.73 }, size: 0.06 },
    ],
    5: [
      { type: 'conveyor-belt', position: { x: 0.5, y: 0.5 }, size: 0.12 },
      { type: 'gear', position: { x: 0.25, y: 0.35 }, size: 0.05 },
      { type: 'gear', position: { x: 0.75, y: 0.4 }, size: 0.045 },
    ],
    6: [
      { type: 'signal-tower', position: { x: 0.2, y: 0.22 }, size: 0.07 },
      { type: 'signal-tower', position: { x: 0.8, y: 0.18 }, size: 0.06 },
      { type: 'lost-mark', position: { x: 0.5, y: 0.78 }, size: 0.04 },
    ],
    7: [
      { type: 'storm-cloud', position: { x: 0.18, y: 0.2 }, size: 0.1 },
      { type: 'storm-cloud', position: { x: 0.75, y: 0.15 }, size: 0.08 },
      { type: 'lightning-bolt', position: { x: 0.3, y: 0.25 }, size: 0.06 },
      { type: 'lightning-bolt', position: { x: 0.65, y: 0.22 }, size: 0.05 },
    ],
    8: [
      ...Array.from({ length: 8 }, (_, i) => ({
        type: 'quantum-particle',
        position: { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8 },
        size: 0.03,
      })),
      { type: 'crack-line', position: { x: 0.4, y: 0.7 }, size: 0.08 },
      { type: 'crack-line', position: { x: 0.65, y: 0.75 }, size: 0.06 },
    ],
    9: [
      { type: 'throne-pillar', position: { x: 0.3, y: 0.62 }, size: 0.1 },
      { type: 'throne-pillar', position: { x: 0.45, y: 0.6 }, size: 0.11 },
      { type: 'throne-pillar', position: { x: 0.6, y: 0.61 }, size: 0.105 },
      { type: 'throne-pillar', position: { x: 0.75, y: 0.63 }, size: 0.095 },
      { type: 'energy-core', position: { x: 0.52, y: 0.62 }, size: 0.12 },
    ],
  };

  return (configs[layer] ?? []).map(c => ({ ...c }));
}
