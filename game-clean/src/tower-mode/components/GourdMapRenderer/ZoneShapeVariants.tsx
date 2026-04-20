import React, { useState, useMemo } from 'react';

interface SubZoneDef {
  id: string;
  pathData: string;
  fill: string;
  opacity: number;
}

interface ShapeConfig {
  lowerCircle?: {
    subZones?: SubZoneDef[];
    center: { x: number; y: number };
    radiusX: number;
    radiusY: number;
  };
  upperCircle?: {
    subZones?: SubZoneDef[];
    center: { x: number; y: number };
    radius: number;
  };
}

interface ZoneEffectDef {
  zoneId: string;
  effectType: string;
  value: number;
}

interface ZoneShapeVariantsProps {
  shapeConfig: ShapeConfig;
  zoneEffects?: ZoneEffectDef[];
}

interface SubZoneLayerProps {
  subZones: SubZoneDef[];
  zoneEffects?: ZoneEffectDef[];
}

const SubZoneLayer = React.memo<SubZoneLayerProps>(({ subZones, zoneEffects }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const effectMap = useMemo(() => {
    const map = new Map<string, ZoneEffectDef>();
    if (zoneEffects) {
      for (const eff of zoneEffects) {
        map.set(eff.zoneId, eff);
      }
    }
    return map;
  }, [zoneEffects]);

  return (
    <g>
      {subZones.map((sz) => {
        const hasEffect = effectMap.has(sz.id);
        const isHovered = hoveredId === sz.id;

        return (
          <path
            key={sz.id}
            d={sz.pathData}
            fill={sz.fill}
            opacity={isHovered ? Math.min(sz.opacity + 0.2, 1) : sz.opacity}
            stroke={hasEffect ? '#ffcc00' : 'none'}
            strokeWidth={hasEffect ? 1.5 : 0}
            style={{
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
              pointerEvents: 'all',
            }}
            onMouseEnter={() => setHoveredId(sz.id)}
            onMouseLeave={() => setHoveredId(null)}
          />
        );
      })}
    </g>
  );
});

SubZoneLayer.displayName = 'SubZoneLayer';

const QUADRANT_COLORS: Record<string, string> = {
  W: 'rgba(255,136,0,0.15)',
  N: 'rgba(255,204,0,0.15)',
  I: 'rgba(255,204,0,0.15)',
  P: 'rgba(255,136,0,0.15)',
};

const QUADRANT_POSITIONS: Record<string, { cx: number; cy: number; r: number }> = {
  W: { cx: 200, cy: 210, r: 168 },
  N: { cx: 600, cy: 210, r: 168 },
  I: { cx: 200, cy: 450, r: 168 },
  P: { cx: 600, cy: 450, r: 168 },
};

function createQuadrantPath(key: string): string {
  const pos = QUADRANT_POSITIONS[key];
  if (!pos) return '';
  return `M${pos.cx},${pos.cy - pos.r} A${pos.r},${pos.r} 0 0,1 ${pos.cx + pos.r},${pos.cy} A${pos.r},${pos.r} 0 0,1 ${pos.cx},${pos.cy + pos.r} A${pos.r},${pos.r} 0 0,1 ${pos.cx - pos.r},${pos.cy} A${pos.r},${pos.r} 0 0,1 ${pos.cx},${pos.cy - pos.r} Z`;
}

const StandardFallback = React.memo(() => {
  const quadrants = ['W', 'N', 'I', 'P'] as const;

  return (
    <g>
      {quadrants.map((q) => (
        <path
          key={q}
          d={createQuadrantPath(q)}
          fill={QUADRANT_COLORS[q]}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
        />
      ))}
      <line x1="400" y1="42" x2="400" y2="558" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
      <line x1="42" y1="330" x2="758" y2="330" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
    </g>
  );
});

StandardFallback.displayName = 'StandardFallback';

export const ZoneShapeVariants = React.memo<ZoneShapeVariantsProps>(({ shapeConfig, zoneEffects }) => {
  const subZones = shapeConfig.lowerCircle?.subZones;
  const useCustomShapes = subZones && subZones.length > 0;

  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      {useCustomShapes ? (
        <SubZoneLayer subZones={subZones} zoneEffects={zoneEffects} />
      ) : (
        <StandardFallback />
      )}
    </svg>
  );
});

ZoneShapeVariants.displayName = 'ZoneShapeVariants';

export type { ZoneShapeVariantsProps, SubZoneDef, ShapeConfig, ZoneEffectDef };
