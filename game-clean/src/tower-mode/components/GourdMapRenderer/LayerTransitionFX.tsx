import { useEffect } from 'react';

interface LayerTransitionFXProps {
  fromLayer: number;
  toLayer: number;
  isActive: boolean;
  onComplete?: () => void;
}

export function LayerTransitionFX({ fromLayer, toLayer, isActive, onComplete }: LayerTransitionFXProps) {
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const transitionKey = `${fromLayer}->${toLayer}`;

  switch (transitionKey) {
    case '1->2': return <DataFlowTransition />;
    case '2->3': return <GoldenGateTransition />;
    case '3->4': return <SkylineRiseTransition />;
    case '4->5': return <GearSpinTransition />;
    case '5->6': return <SignalGlitchTransition />;
    case '6->7': return <CloudSweepTransition />;
    case '7->8': return <QuantumTunnelTransition />;
    case '8->9': return <EnergyBurstTransition />;
    default: return <DefaultTransition fromLayer={fromLayer} toLayer={toLayer} />;
  }
}

function DataFlowTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={`df-${i}`}
                  cx={Math.random() * 80 + 10} cy="-5"
                  r={1 + Math.random() * 1.5}
                  fill="#4488ff" opacity="0.8">
            <animate attributeName="cy" values="-5;105" dur={`${0.6 + Math.random() * 0.8}s`}
                     begin={`${i * 0.08}s`} fill="remove" />
            <animate attributeName="opacity" values="0.8;0" dur={`${0.6 + Math.random() * 0.8}s`}
                     begin={`${i * 0.08}s`} fill="remove" />
          </circle>
        ))}
        <rect x="40" y="45" width="20" height="10" rx="2" fill="#4488ff" opacity="0.3">
          <animate attributeName="y" values="45;55;45" dur="1s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

function GoldenGateTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#ffd700" strokeWidth="3" opacity="0">
          <animate attributeName="r" values="0;45" dur="1s" fill="remove" />
          <animate attributeName="opacity" values="0;0.8;0" dur="1s" fill="remove" />
        </circle>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#ffaa00" strokeWidth="2" opacity="0">
          <animate attributeName="r" values="0;32" dur="1s" begin="0.15s" fill="remove" />
          <animate attributeName="opacity" values="0;0.6;0" dur="1s" begin="0.15s" fill="remove" />
        </circle>
        <g transform="translate(50,50)">
          <rect x="-3" y="-20" width="6" height="40" rx="1" fill="#ffd700" opacity="0">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.2s" fill="remove" />
            <animate attributeName="opacity" values="0;0.9;0" dur="1.2s" fill="remove" />
          </rect>
        </g>
        <text x="50" y="53" textAnchor="middle" fontSize="6" fill="#ffd700" fontWeight="bold" opacity="0">
          GATE
          <animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.3s" fill="remove" />
        </text>
      </svg>
    </div>
  );
}

function SkylineRiseTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a3e" />
            <stop offset="100%" stopColor="#ff6b9d" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sky-grad)" />
        {[
          { x: 5, w: 12, h: 55 }, { x: 20, w: 8, h: 70 }, { x: 31, w: 15, h: 45 },
          { x: 49, w: 10, h: 80 }, { x: 62, w: 13, h: 50 }, { x: 78, w: 9, h: 65 }, { x: 90, w: 7, h: 40 },
        ].map((b, i) => (
          <rect key={`bld-${i}`}
                x={b.x} y={110} width={b.w} height={b.h}
                fill="#222233" stroke="#ff6b9d" strokeWidth="0.3" opacity="0">
            <animate attributeName="y" values={`110;${100 - b.h}`} dur="1s" begin={`${i * 0.06}s`} fill="remove" />
            <animate attributeName="opacity" values="0;0.7" dur="0.5s" begin={`${i * 0.06 + 0.5}s`} fill="remove" />
          </rect>
        ))}
      </svg>
    </div>
  );
}

function GearSpinTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <g key={`gear-${i}`} transform={`translate(50,50)`}>
            <g>
              <animateTransform attributeName="transform" type="rotate"
                                from={`${angle}`} to={`${angle + 360}`} dur="1.5s" fill="remove" />
              <rect x="-2" y="-18" width="4" height="10" rx="1" fill="#50c878" opacity="0.7" />
              <circle cx="0" cy="0" r="16" fill="none" stroke="#50c878" strokeWidth="2" strokeDasharray="3 4" opacity="0.5" />
            </g>
          </g>
        ))}
        <circle cx="50" cy="50" r="8" fill="#50c878" opacity="0">
          <animate attributeName="r" values="0;12" dur="1s" fill="remove" />
          <animate attributeName="opacity" values="0;0.8;0" dur="1s" fill="remove" />
        </circle>
      </svg>
    </div>
  );
}

function SignalGlitchTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active" style={{ background: '#111' }}>
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        {[...Array(12)].map((_, i) => (
          <rect key={`scan-${i}`} x="0" y={i * 8.5} width="100" height="2"
                fill="#f7931e" opacity="0">
            <animate attributeName="opacity"
                     values="0;0.4+Math.random()*0.4;0"
                     dur="0.08s" begin={`${i * 0.04}s`} repeatCount="8" fill="remove" />
            <animate attributeName="x"
                     values={`${Math.random()*-5};${Math.random()*5};0`}
                     dur="0.06s" begin={`${i * 0.03}s`} repeatCount="10" fill="remove" />
          </rect>
        ))}
        <text x="50" y="52" textAnchor="middle" fontSize="8" fill="#f7931e" fontWeight="bold" fontFamily="monospace" opacity="0">
          SIGNAL LOST
          <animate attributeName="opacity" values="0;1;0;1;0" dur="0.8s" repeatCount="2" fill="remove" />
        </text>
      </svg>
    </div>
  );
}

function CloudSweepTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        {[-10, 20, 50, 80].map((x, i) => (
          <ellipse key={`cloud-${i}`}
                   cx={x} cy={50 + (i % 2) * 20}
                   rx={18 + i * 3} ry={8 + i}
                   fill="#ddddee" opacity="0.5">
            <animate attributeName="cx" values={`${x};${x + 120}`} dur={`${2 + i * 0.3}s`} fill="remove" />
          </ellipse>
        ))}
      </svg>
    </div>
  );
}

function QuantumTunnelTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        {[0, 1, 2, 3, 4].map(i => (
          <ellipse key={`qt-${i}`}
                   cx="50" cy="50"
                   rx={5 + i * 8} ry={3 + i * 5}
                   fill="none" stroke="#00d4ff"
                   strokeWidth={1.5 - i * 0.2}
                   opacity={0.6 - i * 0.1}
                   strokeDasharray="3 3">
            <animate attributeName="rx" values={`${5+i*8};${15+i*8};${5+i*8}`} dur="0.8s" repeatCount="3" />
            <animate attributeName="ry" values={`${3+i*5};${8+i*5};${3+i*5}`} dur="0.8s" repeatCount="3" />
            <animateTransform attributeName="transform" type="rotate"
                              from="0" to={`${i % 2 === 0 ? 180 : -180}`} dur="1.5s" repeatCount="indefinite" />
          </ellipse>
        ))}
        <circle cx="50" cy="50" r="3" fill="#00d4ff" opacity="0">
          <animate attributeName="r" values="0;8;0" dur="1.5s" fill="remove" />
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" fill="remove" />
        </circle>
      </svg>
    </div>
  );
}

function EnergyBurstTransition() {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        <circle cx="50" cy="50" r="0" fill="none" stroke="#ffd700" strokeWidth="3" opacity="0.8">
          <animate attributeName="r" values="0;45" dur="1.2s" fill="remove" />
          <animate attributeName="opacity" values="0.8;0" dur="1.2s" fill="remove" />
        </circle>
        <circle cx="50" cy="50" r="0" fill="none" stroke="#ff8800" strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values="0;35" dur="1s" begin="0.1s" fill="remove" />
          <animate attributeName="opacity" values="0.6;0" dur="1s" begin="0.1s" fill="remove" />
        </circle>
        <circle cx="50" cy="50" r="0" fill="none" stroke="#ff3333" strokeWidth="1.5" opacity="0.4">
          <animate attributeName="r" values="0;28" dur="0.8s" begin="0.2s" fill="remove" />
          <animate attributeName="opacity" values="0.4;0" dur="0.8s" begin="0.2s" fill="remove" />
        </circle>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          return (
            <line key={`ray-${i}`}
                  x1="50" y1="50"
                  x2={50 + Math.cos(angle) * 60}
                  y2={50 + Math.sin(angle) * 60}
                  stroke="#ffd700" strokeWidth="1.2" opacity="0"
                  strokeLinecap="round">
              <animate attributeName="x2"
                       values={`50;${50 + Math.cos(angle) * 60}`}
                       dur="0.6s" begin={`${i * 0.04}s`} fill="remove" />
              <animate attributeName="opacity" values="0;0.9;0" dur="0.6s" begin={`${i * 0.04}s`} fill="remove" />
            </line>
          );
        })}
        <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0">
          <animate attributeName="r" values="0;8;3" dur="1s" fill="remove" />
          <animate attributeName="opacity" values="0;1;0.8" dur="1s" fill="remove" />
        </circle>
      </svg>
    </div>
  );
}

function DefaultTransition({ fromLayer, toLayer }: { fromLayer: number; toLayer: number }) {
  return (
    <div className="gm-lt-overlay gm-lt-active">
      <svg viewBox="0 0 100 100" className="gm-lt-svg">
        <rect width="100" height="100" fill="#000" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="2" />
        </rect>
        <text x="50" y="48" textAnchor="middle" fontSize="6" fill="#aaa" fontFamily="sans-serif" opacity="0">
          L{fromLayer} → L{toLayer}
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="2" />
        </text>
        <circle cx="50" cy="58" r="3" fill="none" stroke="#888" strokeWidth="0.8" opacity="0">
          <animate attributeName="r" values="3;12;3" dur="1s" repeatCount="2" />
          <animate attributeName="opacity" values="0;0.6;0" dur="1s" repeatCount="2" />
        </circle>
      </svg>
    </div>
  );
}
