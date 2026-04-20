import { useMemo } from 'react';
import type { LayerShapeConfig } from '../../types/gourdShapeVariants.types';

interface GourdShapeOutlineProps {
  shapeConfig: LayerShapeConfig;
  outlineColor?: string;
  outlineWidth?: number;
}

interface OutlinePaths {
  upperD: string;
  lowerD: string;
  connD: string;
  extraCrackPaths?: string[];
}

function generateEllipsePath(
  cx: number, cy: number,
  rx: number, ry: number,
  rotation: number = 0,
): string {
  const cosR = Math.cos((rotation * Math.PI) / 180);
  const sinR = Math.sin((rotation * Math.PI) / 180);
  const basePoints: Array<[number, number]> = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);
    const rotatedX = x * cosR - y * sinR + cx;
    const rotatedY = x * sinR + y * cosR + cy;
    basePoints.push([rotatedX, rotatedY]);
  }
  return pointsToPath(basePoints);
}

function generateArcPath(
  cx: number, cy: number,
  rx: number, ry: number,
  startAngle: number,
  endAngle: number,
  rotation: number = 0,
): string {
  const cosR = Math.cos((rotation * Math.PI) / 180);
  const sinR = Math.sin((rotation * Math.PI) / 180);
  const start = (startAngle * Math.PI) / 180;
  const end = (endAngle * Math.PI) / 180;
  const basePoints: Array<[number, number]> = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const angle = start + ((end - start) * i) / steps;
    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);
    const rotatedX = x * cosR - y * sinR + cx;
    const rotatedY = x * sinR + y * cosR + cy;
    basePoints.push([rotatedX, rotatedY]);
  }
  return pointsToPath(basePoints);
}

function pointsToPath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L${points[i][0].toFixed(1)},${points[i][1].toFixed(1)}`;
  }
  return d;
}

function generateConnectorPath(
  uc: LayerShapeConfig['upperCircle'],
  lc: LayerShapeConfig['lowerCircle'],
  conn: LayerShapeConfig['connector'],
): string {
  const ucBottom = uc.center.y + uc.radius * uc.scaleY;
  const lcTop = lc.center.y - lc.radiusY * lc.scaleY;
  const halfW = conn.width / 2;

  const connCenterX = (uc.center.x + lc.center.x) / 2;
  const connTopLeftX = uc.center.x - halfW;
  const connTopRightX = uc.center.x + halfW;
  const connBotLeftX = lc.center.x - halfW;
  const connBotRightX = lc.center.x + halfW;

  switch (conn.shape) {
    case 'zigzag': {
      const zigzags = 3;
      const segH = (lcTop - ucBottom) / zigzags;
      let d = `M${connTopLeftX},${ucBottom}`;
      for (let i = 0; i < zigzags; i++) {
        const y1 = ucBottom + segH * i + segH * 0.5;
        const y2 = ucBottom + segH * (i + 1);
        const offsetX = i % 2 === 0 ? halfW * 0.6 : -halfW * 0.6;
        d += ` L${connCenterX + offsetX},${y1}`;
        d += ` L${connCenterX - offsetX},${y2}`;
      }
      d += ` L${connBotRightX},${lcTop}`;
      d += ` L${connBotLeftX},${lcTop}`;
      let d2 = `M${connTopRightX},${ucBottom}`;
      for (let i = 0; i < zigzags; i++) {
        const y1 = ucBottom + segH * i + segH * 0.5;
        const y2 = ucBottom + segH * (i + 1);
        const offsetX = i % 2 === 0 ? halfW * 0.6 : -halfW * 0.6;
        d2 += ` L${connCenterX - offsetX},${y1}`;
        d2 += ` L${connCenterX + offsetX},${y2}`;
      }
      d2 += ` L${connBotLeftX},${lcTop}`;
      d += ' ' + d2 + ' Z';
      return d;
    }
    case 'curved': {
      const curvature = conn.curvature ?? 0.15;
      const cpOffset = (lc.center.x - uc.center.x) * curvature;
      return [
        `M${connTopLeftX},${ucBottom}`,
        `C${connTopLeftX + cpOffset},${(ucBottom + lcTop) / 2} ${connBotLeftX - cpOffset},${lcTop} ${connBotLeftX},${lcTop}`,
        `L${connBotRightX},${lcTop}`,
        `C${connBotRightX - cpOffset},${lcTop} ${connTopRightX + cpOffset},${(ucBottom + lcTop) / 2} ${connTopRightX},${ucBottom}`,
        'Z',
      ].join(' ');
    }
    case 'spiral': {
      return [
        `M${connTopLeftX},${ucBottom}`,
        `Q${connCenterX - halfW * 2},${(ucBottom + lcTop) / 2} ${connBotLeftX},${lcTop}`,
        `L${connBotRightX},${lcTop}`,
        `Q${connCenterX + halfW * 2},${(ucBottom + lcTop) / 2} ${connTopRightX},${ucBottom}`,
        'Z',
      ].join(' ');
    }
    default: {
      return [
        `M${connTopLeftX},${ucBottom}`,
        `L${connBotLeftX},${lcTop}`,
        `L${connBotRightX},${lcTop}`,
        `L${connTopRightX},${ucBottom}`,
        'Z',
      ].join(' ');
    }
  }
}

function generateCrackPaths(
  uc: LayerShapeConfig['upperCircle'],
  lc: LayerShapeConfig['lowerCircle'],
): string[] {
  const cracks: string[] = [];
  const rng = (seed: number) => {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  };
  const random = rng(42);

  for (let i = 0; i < 8; i++) {
    const pts: Array<[number, number]> = [];
    const startX = uc.center.x + (random() - 0.5) * uc.radius * 2;
    const startY = uc.center.y + (random() - 0.5) * uc.radius * 2;
    pts.push([startX, startY]);

    const numSegments = 3 + Math.floor(random() * 4);
    let cx = startX;
    let cy = startY;
    for (let j = 0; j < numSegments; j++) {
      cx += (random() - 0.5) * 12;
      cy += random() * 6 + 2;
      pts.push([cx, cy]);
    }
    cracks.push(pointsToPath(pts));
  }

  for (let i = 0; i < 5; i++) {
    const pts: Array<[number, number]> = [];
    const startX = lc.center.x + (random() - 0.5) * lc.radiusX * 2;
    const startY = lc.center.y + (random() - 0.5) * lc.radiusY * 2;
    pts.push([startX, startY]);

    const numSegments = 4 + Math.floor(random() * 3);
    let cx = startX;
    let cy = startY;
    for (let j = 0; j < numSegments; j++) {
      cx += (random() - 0.5) * 15;
      cy += (random() - 0.5) * 15;
      pts.push([cx, cy]);
    }
    cracks.push(pointsToPath(pts));
  }

  return cracks;
}

export function GourdShapeOutline({
  shapeConfig,
  outlineColor = '#44ff88',
  outlineWidth = 1.2,
}: GourdShapeOutlineProps) {
  const paths = useMemo((): OutlinePaths => {
    const uc = shapeConfig.upperCircle;
    const lc = shapeConfig.lowerCircle;
    const conn = shapeConfig.connector;

    let upperD: string;
    if (uc.arcStartAngle !== undefined && uc.arcEndAngle !== undefined) {
      upperD = generateArcPath(
        uc.center.x, uc.center.y,
        uc.radius * uc.scaleX, uc.radius * uc.scaleY,
        uc.arcStartAngle, uc.arcEndAngle, uc.rotation,
      );
    } else {
      upperD = generateEllipsePath(
        uc.center.x, uc.center.y,
        uc.radius * uc.scaleX, uc.radius * uc.scaleY,
        uc.rotation,
      );
    }

    const lowerD = generateEllipsePath(
      lc.center.x, lc.center.y,
      lc.radiusX * lc.scaleX, lc.radiusY * lc.scaleY,
      lc.rotation,
    );

    const connD = generateConnectorPath(uc, lc, conn);

    const extraCrackPaths = shapeConfig.visualModifiers.outlineStyle === 'crack'
      ? generateCrackPaths(uc, lc)
      : undefined;

    return { upperD, lowerD, connD, extraCrackPaths };
  }, [shapeConfig]);

  const { outlineStyle } = shapeConfig.visualModifiers;

  const strokeDashArray = useMemo(() => {
    switch (outlineStyle) {
      case 'dashed': return '4 3';
      case 'dotted': return '1.5 2';
      case 'crack': return '2 1';
      default: return undefined;
    }
  }, [outlineStyle]);

  return (
    <>
      {outlineStyle === 'glow' ? (
        <>
          <path d={paths.upperD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth + 2} opacity={0.2} />
          <path d={paths.lowerD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth + 2} opacity={0.2} />
          <path d={paths.connD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth + 2} opacity={0.2} />
          <path d={paths.upperD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth + 0.5} opacity={0.5} />
          <path d={paths.lowerD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth + 0.5} opacity={0.5} />
          <path d={paths.connD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth + 0.5} opacity={0.5} />
          <path d={paths.upperD} fill="none" stroke="#ffffff" strokeWidth={outlineWidth * 0.6} opacity={0.8} />
          <path d={paths.lowerD} fill="none" stroke="#ffffff" strokeWidth={outlineWidth * 0.6} opacity={0.8} />
          <path d={paths.connD} fill="none" stroke="#ffffff" strokeWidth={outlineWidth * 0.6} opacity={0.8} />
        </>
      ) : (
        <>
          <path d={paths.upperD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth} strokeDasharray={strokeDashArray} />
          <path d={paths.lowerD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth} strokeDasharray={strokeDashArray} />
          <path d={paths.connD} fill="none" stroke={outlineColor} strokeWidth={outlineWidth} strokeDasharray={strokeDashArray} />
        </>
      )}

      {paths.extraCrackPaths?.map((d, i) => (
        <path key={`crack-${i}`} d={d} fill="none" stroke="#ff4444" strokeWidth={0.6} strokeDasharray="1 2" opacity={0.7} />
      ))}
    </>
  );
}
