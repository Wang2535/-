import { useState, useEffect } from 'react';
import type { PlayerPieceState } from './types';
import { gameEventBus } from '../../EventBus';

interface AnimationLayerProps {
  pieceState: PlayerPieceState | null;
  topology: any;
  bossDangerActive?: boolean;
  layerTheme?: { accentColor: string; particleStyle: string };
}

export function AnimationLayer({ pieceState, topology, bossDangerActive, layerTheme }: AnimationLayerProps) {
  const accentColor = layerTheme?.accentColor ?? '#44ff88';
  return (
    <g pointerEvents="none">
      {bossDangerActive && pieceState?.position && <BossDangerRingInline position={pieceState.position} />}
      <TrailDots trail={pieceState?.trailHistory ?? []} accentColor={accentColor} />
      {pieceState?.position && <PlayerPieceSVG x={pieceState.position.x} y={pieceState.position.y} isMoving={false} currentZone={null} accentColor={accentColor} />}
      {pieceState?.justArrived && pieceState.targetPosition && <ArrivalRipple x={pieceState.targetPosition.x} y={pieceState.targetPosition.y} color={accentColor} />}
      <ZoneEffectLayer topology={topology} />
    </g>
  );
}

function PlayerPieceSVG({ x, y, isMoving, currentZone, accentColor }: { x: number; y: number; isMoving: boolean; currentZone: string | null; accentColor: string }) {
  const zoneColors: Record<string, string> = { W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', P: '#F39C12', S: '#E74C3C', D: '#3498DB' };
  const zoneGlow = currentZone ? zoneColors[currentZone] : accentColor;
  return (
    <g transform={`translate(${x},${y})`} className="gm-piece-breathe" style={{ transformOrigin: `${x}px ${y}px` }}>
      <circle r="6" fill="none" stroke={zoneGlow} strokeWidth="0.4" opacity="0.35">
        <animate attributeName="r" values="6;7.5;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.15;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r="4" fill={accentColor} opacity="0.85" stroke={isMoving ? '#ffffff' : 'rgba(255,255,255,0.6)'} strokeWidth={isMoving ? '0.8' : '0.4'} />
      <circle r="2" fill="#ffffff" opacity="0.9" />
      <g transform="translate(-2.5,-2) scale(0.22)">
        <path d="M6 2a2 2 0 00-2 2v3a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 1h4a1 1 0 011 1v3a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#1a1a2e" opacity="0.9" />
        <circle cx="7" cy="5.5" r="0.7" fill="#1a1a2e" />
        <circle cx="9" cy="5.5" r="0.7" fill="#1a1a2e" />
        <path d="M7.5 4.5 L8.5 4.5 L8 5.5 Z" fill="#1a1a2e" />
      </g>
      {currentZone && <text x="3.5" y="3.5" fontSize="2.5" fontWeight="bold" fill={zoneGlow} stroke="#000" strokeWidth="0.3" paintOrder="stroke fill">{currentZone}</text>}
    </g>
  );
}

function TrailDots({ trail, accentColor }: { trail: Array<{ x: number; y: number; timestamp?: number; opacity: number }>; accentColor: string }) {
  const visibleTrail = trail.slice(-6);
  return (
    <>{visibleTrail.map((pt, i) => {
      const progress = (i + 1) / visibleTrail.length;
      const radius = 0.8 + progress * 1.2;
      const alpha = pt.opacity * progress * 0.65;
      return <circle key={`trail-${i}-${pt.timestamp ?? i}`} cx={pt.x} cy={pt.y} r={radius} fill={accentColor} opacity={alpha} className="gm-trail-fade">
        <animate attributeName="opacity" values={`${alpha};${alpha * 0.3};0`} dur="1.2s" begin={`${i * 0.08}s`} fill="remove" />
        <animate attributeName="r" values={`${radius};${radius * 1.3};0`} dur="1.2s" begin={`${i * 0.08}s`} fill="remove" />
      </circle>;
    })}</>
  );
}

function ArrivalRipple({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <>
      <circle cx={x} cy={y} r="1" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" className="gm-arrival-ripple">
        <animate attributeName="r" values="1;18" dur="0.8s" fill="remove" />
        <animate attributeName="opacity" values="0.8;0" dur="0.8s" fill="remove" />
        <animate attributeName="strokeWidth" values="1.5;0.3" dur="0.8s" fill="remove" />
      </circle>
      <circle cx={x} cy={y} r="0.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5">
        <animate attributeName="r" values="0.5;12" dur="0.7s" begin="0.15s" fill="remove" />
        <animate attributeName="opacity" values="0.5;0" dur="0.7s" begin="0.15s" fill="remove" />
      </circle>
      <circle cx={x} cy={y} r="2" fill={color} opacity="0.6">
        <animate attributeName="r" values="2;3.5;2" dur="0.3s" fill="remove" />
        <animate attributeName="opacity" values="0.6;0.9;0.3" dur="0.3s" fill="remove" />
      </circle>
    </>
  );
}

function BossDangerRingInline({ position }: { position: { x: number; y: number } }) {
  return (
    <g transform={`translate(${position.x},${position.y})`}>
      <circle r="10" fill="none" stroke="#ff3333" strokeWidth="0.8" opacity="0.6" className="gm-boss-pulse">
        <animate attributeName="r" values="10;16;10" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle r="13" fill="none" stroke="#ff8800" strokeWidth="0.4" opacity="0.35">
        <animate attributeName="r" values="13;19;13" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.08;0.35" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle r="17" fill="none" stroke="#ff3333" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.25">
        <animate attributeName="r" values="17;22;17" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="stroke-dashoffset" values="0;-25" dur="2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
      </circle>
      <text x="0" y="-11" textAnchor="middle" fontSize="2.5" fill="#ff4444" fontWeight="bold" opacity="0.7" className="gm-boss-pulse">
        ⚠ DANGER
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
      </text>
    </g>
  );
}

function ZoneEffectLayer({ topology }: { topology: any }) {
  const [activeEffect, setActiveEffect] = useState<{ type: string; cellId: string; at: number } | null>(null);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const handleZoneEffect = (data: any) => {
        setActiveEffect({ type: data.zoneType, cellId: data.cellId, at: Date.now() });
        setTimeout(() => setActiveEffect(null), 2500);
      };
      if (gameEventBus?.on) { unsubscribe = gameEventBus.on('ZONE_ENTERED' as any, handleZoneEffect as any); }
    } catch { /* eventBus不可用时静默跳过 */ }
    return () => { unsubscribe?.(); };
  }, [topology]);

  if (!activeEffect) return null;
  const zoneBg = topology?.visualConfig?.zoneBackgrounds?.[activeEffect.type];
  const center = zoneBg?.centerPosition ?? { x: 50, y: 62 };
  const configs: Record<string, { color: string; animClass: string }> = {
    W: { color: '#FF6B6B', animClass: 'gm-zone-w-enter' },
    N: { color: '#4ECDC4', animClass: 'gm-zone-n-enter' },
    I: { color: '#9B59B6', animClass: 'gm-zone-i-enter' },
    P: { color: '#F39C12', animClass: 'gm-zone-p-enter' },
    S: { color: '#E74C3C', animClass: 'gm-zone-s-enter' },
    D: { color: '#3498DB', animClass: 'gm-zone-d-enter' },
  };
  const cfg = configs[activeEffect.type] ?? configs.W;
  const animClass = zoneBg?.enterAnimClass ?? cfg.animClass;

  if (activeEffect.type === 'W') {
    return (<g transform={`translate(${center.x},${center.y})`}>{[0, 1, 2].map(i => (
      <circle key={i} r="0" fill="none" stroke={cfg.color} strokeWidth={1.5 - i * 0.3} opacity={0.5 - i * 0.12} className={animClass}>
        <animate attributeName="r" from="0" to={`${28 + i * 8}`} dur={`${1 + i * 0.3}s`} begin={`${i * 0.15}s`} fill="remove" />
        <animate attributeName="opacity" from={`${0.5 - i * 0.12}`} to="0" dur={`${1 + i * 0.3}s`} begin={`${i * 0.15}s`} fill="remove" />
      </circle>))}</g>);
  }
  if (activeEffect.type === 'S') {
    return (<g transform={`translate(${center.x},${center.y})`}>
      <circle r="0" fill="none" stroke={cfg.color} strokeWidth="2" opacity="0.7" strokeDasharray="4 2" className={animClass}>
        <animate attributeName="r" values="0;25;0" dur="0.6s" repeatCount="3" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="0.6s" repeatCount="3" />
      </circle></g>);
  }
  if (activeEffect.type === 'D') {
    return (<g transform={`translate(${center.x},${center.y})`}>{[0, 1, 2, 3, 4].map(i => (
      <line key={i} x1={(i - 2) * 8} y1="15" x2={(i - 2) * 8} y2="-15" stroke={cfg.color} strokeWidth="0.4" opacity="0.4" strokeDasharray="2 3">
        <animate attributeName="stroke-dashoffset" values="10;0" dur="0.8s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
      </line>))}</g>);
  }
  return (<g transform={`translate(${center.x},${center.y})`}>
    <circle r="0" fill="none" stroke={cfg.color} strokeWidth="1.2" opacity="0.5" className={animClass}>
      <animate attributeName="r" from="0" to="32" dur="1s" fill="remove" />
      <animate attributeName="opacity" from="0.5" to="0" dur="1s" fill="remove" />
    </circle></g>);
}
