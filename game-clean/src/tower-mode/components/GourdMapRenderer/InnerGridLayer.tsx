import React from 'react';
import type { LayerShapeConfig } from '../../types/gourdShapeVariants.types';

interface InnerGridLayerProps {
  config: LayerShapeConfig;
}

function HexGrid({ spacing, color, bounds }: { spacing: number; color: string; bounds: LayerShapeConfig['lowerCircle'] }) {
  const { center, radiusX, radiusY } = bounds;
  const lines: React.ReactElement[] = [];
  const cols = Math.ceil(radiusX / spacing) * 2;
  const rows = Math.ceil(radiusY / (spacing * 0.866)) * 2;

  for (let r = -rows; r <= rows; r++) {
    for (let q = -cols; q <= cols; q++) {
      if (Math.abs(r + q) > Math.max(cols, rows)) continue;
      const x = center.x + q * spacing * 1.5;
      const y = center.y + r * spacing * 0.866 + (q % 2 === 1 ? spacing * 0.433 : 0);
      lines.push(
        <polygon
          key={`hex-${q}-${r}`}
          points={generateHexPoints(x, y, spacing * 0.95)}
          fill="none"
          stroke={color}
          strokeWidth={0.3}
        />
      );
    }
  }
  return <g>{lines}</g>;
}

function SquareGrid({ spacing, color, bounds }: { spacing: number; color: string; bounds: LayerShapeConfig['lowerCircle'] }) {
  const { center, radiusX, radiusY } = bounds;
  const lines: React.ReactElement[] = [];
  for (let x = center.x - radiusX; x <= center.x + radiusX; x += spacing) {
    lines.push(<line key={`v-${x}`} x1={x} y1={center.y - radiusY} x2={x} y2={center.y + radiusY} stroke={color} strokeWidth={0.4} />);
  }
  for (let y = center.y - radiusY; y <= center.y + radiusY; y += spacing) {
    lines.push(<line key={`h-${y}`} x1={center.x - radiusX} y1={y} x2={center.x + radiusX} y2={y} stroke={color} strokeWidth={0.4} />);
  }
  return <g>{lines}</g>;
}

function TriangularGrid({ spacing, color, bounds }: { spacing: number; color: string; bounds: LayerShapeConfig['lowerCircle'] }) {
  const { center, radiusX, radiusY } = bounds;
  const rMax = Math.max(radiusX, radiusY);
  const size = spacing * 1.732;
  const lines: React.ReactElement[] = [];

  for (let row = 0; row < Math.ceil((rMax * 2) / size); row++) {
    for (let col = 0; col <= row * 2; col++) {
      const cx = center.x + (col - row) * size / 2;
      const cy = center.y + row * size * 0.866 - rMax;
      lines.push(
        <polygon key={`tri-${row}-${col}`} points={generateTriPoints(cx, cy, size)} fill="none" stroke={color} strokeWidth={0.35} />
      );
    }
  }
  return <g>{lines}</g>;
}

function RadialGrid({ spacing, color, center }: { spacing: number; color: string; center: { x: number; y: number } }) {
  const lines: React.ReactElement[] = [];
  let r = spacing;
  while (r <= 40) {
    lines.push(<circle key={`radial-${r}`} cx={center.x} cy={center.y} r={r} fill="none" stroke={color} strokeWidth={0.25} />);
    r += spacing;
  }

  for (let a = 0; a < 360; a += 30) {
    const rad = (a * Math.PI) / 180;
    lines.push(<line key={`ray-${a}`} x1={center.x} y1={center.y} x2={center.x + Math.cos(rad) * 38} y2={center.y + Math.sin(rad) * 38} stroke={color} strokeWidth={0.2} opacity={0.6} />);
  }
  return <g>{lines}</g>;
}

export function InnerGridLayer({ config }: InnerGridLayerProps) {
  const grid = config.visualModifiers.innerGrid;
  if (!grid || grid.type === 'none') return null;

  return (
    <g className="inner-grid-layer" opacity={grid.opacity}>
      {grid.type === 'hex' && <HexGrid spacing={grid.spacing} color={grid.color} bounds={config.lowerCircle} />}
      {grid.type === 'square' && <SquareGrid spacing={grid.spacing} color={grid.color} bounds={config.lowerCircle} />}
      {grid.type === 'triangular' && <TriangularGrid spacing={grid.spacing} color={grid.color} bounds={config.lowerCircle} />}
      {grid.type === 'radial' && <RadialGrid spacing={grid.spacing} color={grid.color} center={config.lowerCircle.center} />}
    </g>
  );
}

function generateHexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * Math.PI / 180;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function generateTriPoints(cx: number, cy: number, s: number): string {
  const h = s * 0.866;
  return `${cx},${cy - s * 0.667} ${cx - s / 2},${cy + s * 0.333} ${cx + s / 2},${cy + s * 0.333}`;
}
