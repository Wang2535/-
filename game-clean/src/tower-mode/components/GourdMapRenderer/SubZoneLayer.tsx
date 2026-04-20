import React from 'react';

interface SubZoneDef {
  id: string;
  label: string;
  shape: 'sector' | 'rect' | 'polygon' | 'circle' | 'irregular';
  color: string;
  startAngle?: number;
  endAngle?: number;
  points?: Array<{ x: number; y: number }>;
  rectX?: number;
  rectY?: number;
  rectWidth?: number;
  rectHeight?: number;
  circleCx?: number;
  circleCy?: number;
  circleR?: number;
}

interface SubZoneLayerProps {
  subZones: SubZoneDef[];
  activeZoneId?: string;
}

function describeSectorArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function getZoneLabelPos(zone: SubZoneDef): { x: number; y: number } {
  switch (zone.shape) {
    case 'sector':
      const midAngle = (((zone.startAngle ?? 0) + (zone.endAngle ?? 360)) / 2) * Math.PI / 180;
      return { x: 50 + 20 * Math.cos(midAngle), y: 64 + 20 * Math.sin(midAngle) };
    case 'rect': return { x: (zone.rectX ?? 26) + (zone.rectWidth ?? 48) / 2, y: (zone.rectY ?? 48) + 4 };
    case 'circle': return { x: zone.circleCx ?? 50, y: (zone.circleCy ?? 64) - (zone.circleR ?? 10) - 3 };
    case 'polygon':
      if (zone.points && zone.points.length > 0) {
        const sx = zone.points.reduce((s, p) => s + p.x, 0) / zone.points.length;
        const sy = zone.points.reduce((s, p) => s + p.y, 0) / zone.points.length;
        return { x: sx, y: sy - 4 };
      }
      return { x: 50, y: 60 };
    default: return { x: 50, y: 60 };
  }
}

export function SubZoneLayer({ subZones, activeZoneId }: SubZoneLayerProps) {
  if (!subZones || subZones.length === 0) return null;

  return (
    <g className="sub-zone-layer" pointerEvents="none">
      {subZones.map(zone => (
        <g key={zone.id} className={`sub-zone sub-zone-${zone.id} ${activeZoneId === zone.id ? 'active' : ''}`}>
          {zone.shape === 'sector' && (
            <path
              d={describeSectorArc(50, 64, 34, zone.startAngle ?? 0, zone.endAngle ?? 360)}
              fill={zone.color}
              opacity={activeZoneId === zone.id ? 0.25 : 0.12}
              stroke={zone.color}
              strokeWidth={activeZoneId === zone.id ? 1.2 : 0.4}
            />
          )}
          {zone.shape === 'rect' && (
            <rect
              x={zone.rectX ?? 26}
              y={zone.rectY ?? 48}
              width={zone.rectWidth ?? 48}
              height={zone.rectHeight ?? 12}
              rx={3}
              fill={zone.color}
              opacity={activeZoneId === zone.id ? 0.2 : 0.12}
              stroke={zone.color}
              strokeWidth={activeZoneId === zone.id ? 1.0 : 0.4}
            />
          )}
          {zone.shape === 'polygon' && zone.points && (
            <polygon
              points={zone.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill={zone.color}
              opacity={activeZoneId === zone.id ? 0.2 : 0.12}
              stroke={zone.color}
              strokeWidth={activeZoneId === zone.id ? 1.0 : 0.4}
            />
          )}
          {zone.shape === 'circle' && (
            <circle
              cx={zone.circleCx ?? 50}
              cy={zone.circleCy ?? 64}
              r={zone.circleR ?? 10}
              fill={zone.color}
              opacity={activeZoneId === zone.id ? 0.25 : 0.15}
              stroke={zone.color}
              strokeWidth={activeZoneId === zone.id ? 1.2 : 0.6}
            />
          )}
          {zone.shape === 'irregular' && zone.points && (
            <path
              d={`M ${zone.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`}
              fill={zone.color}
              opacity={activeZoneId === zone.id ? 0.2 : 0.1}
              stroke={zone.color}
              strokeWidth={activeZoneId === zone.id ? 0.8 : 0.3}
              strokeDasharray="3 2"
            />
          )}
          <text
            x={getZoneLabelPos(zone).x}
            y={getZoneLabelPos(zone).y}
            textAnchor="middle"
            fontSize="3%"
            fontWeight="900"
            fill={zone.color.replace(/[\d.]+\)$/, '0.7)')}
            opacity="0.5"
          >
            {zone.label}
          </text>
        </g>
      ))}
    </g>
  );
}

export default SubZoneLayer;