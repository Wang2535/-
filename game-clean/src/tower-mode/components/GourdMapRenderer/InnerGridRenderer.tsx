import { useMemo } from 'react';
import type { LayerShapeConfig } from '../../types/gourdShapeVariants.types';

interface InnerGridRendererProps {
  shapeConfig: LayerShapeConfig;
}

export function InnerGridRenderer({ shapeConfig }: InnerGridRendererProps) {
  const grid = shapeConfig.visualModifiers.innerGrid;
  if (!grid || grid.type === 'none' || grid.opacity <= 0) return null;

  const lc = shapeConfig.lowerCircle;
  const bounds = {
    cx: lc.center.x,
    cy: lc.center.y,
    rx: lc.radiusX * lc.scaleX,
    ry: lc.radiusY * lc.scaleY,
  };

  switch (grid.type) {
    case 'hex':
      return <HexGrid bounds={bounds} spacing={grid.spacing} color={grid.color} opacity={grid.opacity} />;
    case 'square':
      return <SquareGrid bounds={bounds} spacing={grid.spacing} color={grid.color} opacity={grid.opacity} />;
    case 'triangular':
      return <TriangularGrid bounds={bounds} spacing={grid.spacing} color={grid.color} opacity={grid.opacity} />;
    case 'radial':
      return <RadialGrid bounds={bounds} spacing={grid.spacing} color={grid.color} opacity={grid.opacity} />;
    default:
      return null;
  }
}

function HexGrid({ bounds, spacing, color, opacity }: { bounds: { cx: number; cy: number; rx: number; ry: number }; spacing: number; color: string; opacity: number }) {
  const lines = useMemo(() => {
    const result: string[] = [];
    const halfW = spacing * Math.sqrt(3);
    const startX = bounds.cx - bounds.rx - spacing * 2;
    const endX = bounds.cx + bounds.rx + spacing * 2;
    const startY = bounds.cy - bounds.ry - spacing * 2;
    const endY = bounds.cy + bounds.ry + spacing * 2;

    for (let row = 0; ; row++) {
      const baseY = startY + row * spacing * 1.5;
      if (baseY > endY) break;
      const offsetX = (row % 2) * halfW / 2;
      let d = `M${startX + offsetX},${baseY}`;
      for (let x = startX + offsetX; x < endX; x += halfW) {
        d += ` L${x},${baseY}`;
      }
      result.push(d);
    }

    for (let col = 0; ; col++) {
      const baseX = startX + col * halfW;
      if (baseX > endX) break;
      let d = `M${baseX},${startY}`;
      for (let y = startY; y < endY; y += spacing * 1.5) {
        const nextY = y + spacing * 1.5;
        d += ` L${baseX + halfW / 2},${nextY}`;
      }
      result.push(d);
    }

    for (let col = 0; ; col++) {
      const baseX = startX + col * halfW;
      if (baseX > endX) break;
      let d = `M${baseX},${startY}`;
      for (let y = startY; y < endY; y += spacing * 1.5) {
        const nextY = y + spacing * 1.5;
        d += ` L${baseX - halfW / 2},${nextY}`;
      }
      result.push(d);
    }

    return result;
  }, [bounds, spacing]);

  return (
    <g className="inner-grid-hex" opacity={opacity}>
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={0.2} />
      ))}
    </g>
  );
}

function SquareGrid({ bounds, spacing, color, opacity }: { bounds: { cx: number; cy: number; rx: number; ry: number }; spacing: number; color: string; opacity: number }) {
  const lines = useMemo(() => {
    const result: string[] = [];
    const startX = bounds.cx - bounds.rx - spacing;
    const endX = bounds.cx + bounds.rx + spacing;
    const startY = bounds.cy - bounds.ry - spacing;
    const endY = bounds.cy + bounds.ry + spacing;

    for (let y = startY; y <= endY; y += spacing) {
      result.push(`M${startX},${y} L${endX},${y}`);
    }
    for (let x = startX; x <= endX; x += spacing) {
      result.push(`M${x},${startY} L${x},${endY}`);
    }

    return result;
  }, [bounds, spacing]);

  return (
    <g className="inner-grid-square" opacity={opacity}>
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={0.15} />
      ))}
    </g>
  );
}

function TriangularGrid({ bounds, spacing, color, opacity }: { bounds: { cx: number; cy: number; rx: number; ry: number }; spacing: number; color: string; opacity: number }) {
  const lines = useMemo(() => {
    const result: string[] = [];
    const halfH = spacing * Math.sqrt(3) / 2;
    const startX = bounds.cx - bounds.rx - spacing;
    const endX = bounds.cx + bounds.rx + spacing;
    const startY = bounds.cy - bounds.ry - spacing;
    const endY = bounds.cy + bounds.ry + spacing;

    for (let row = 0; ; row++) {
      const y = startY + row * halfH;
      if (y > endY) break;
      result.push(`M${startX},${y} L${endX},${y}`);
    }

    for (let col = 0; ; col++) {
      const x = startX + col * spacing;
      if (x > endX) break;
      result.push(`M${x},${startY} L${x - (endY - startY) * 0.5},${endY}`);
    }

    for (let col = 0; ; col++) {
      const x = startX + col * spacing;
      if (x > endX) break;
      result.push(`M${x},${startY} L${x + (endY - startY) * 0.5},${endY}`);
    }

    return result;
  }, [bounds, spacing]);

  return (
    <g className="inner-grid-triangular" opacity={opacity}>
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={0.15} />
      ))}
    </g>
  );
}

function RadialGrid({ bounds, spacing, color, opacity }: { bounds: { cx: number; cy: number; rx: number; ry: number }; spacing: number; color: string; opacity: number }) {
  const circles = useMemo(() => {
    const result: string[] = [];
    const maxR = Math.max(bounds.rx, bounds.ry) + spacing;
    for (let r = spacing; r < maxR; r += spacing) {
      result.push(
        `M${bounds.cx - r},${bounds.cy} A${r},${r} 0 1,0 ${bounds.cx + r},${bounds.cy} A${r},${r} 0 1,0 ${bounds.cx - r},${bounds.cy}`,
      );
    }
    return result;
  }, [bounds, spacing]);

  const spokes = useMemo(() => {
    const result: string[] = [];
    const numSpokes = 12;
    const maxR = Math.max(bounds.rx, bounds.ry) + spacing;
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i / numSpokes) * Math.PI * 2;
      const x = bounds.cx + maxR * Math.cos(angle);
      const y = bounds.cy + maxR * Math.sin(angle);
      result.push(`M${bounds.cx},${bounds.cy} L${x},${y}`);
    }
    return result;
  }, [bounds, spacing]);

  return (
    <g className="inner-grid-radial" opacity={opacity}>
      {circles.map((d, i) => (
        <path key={`circle-${i}`} d={d} fill="none" stroke={color} strokeWidth={0.15} />
      ))}
      {spokes.map((d, i) => (
        <path key={`spoke-${i}`} d={d} fill="none" stroke={color} strokeWidth={0.15} />
      ))}
    </g>
  );
}
