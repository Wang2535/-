import type { GourdShapeParams, GourdCoordinate, GourdRegion } from '../types/gourdCoordinate.types';

export class GourdCoordinateCalculator {

  static polarToCartesian(
    params: GourdShapeParams,
    coord: GourdCoordinate
  ): { x: number; y: number } {
    const { region, theta, radiusRatio } = coord;

    if (region === ('upperCircle' as GourdRegion)) {
      const { centerX, centerY, radiusX, radiusY } = params.upperCircle;
      return {
        x: centerX + radiusX * radiusRatio * Math.cos(theta),
        y: centerY + radiusY * radiusRatio * Math.sin(theta),
      };
    }

    if (region === ('lowerCircle' as GourdRegion)) {
      const { centerX, centerY, radiusX, radiusY } = params.lowerCircle;
      return {
        x: centerX + radiusX * radiusRatio * Math.cos(theta),
        y: centerY + radiusY * radiusRatio * Math.sin(theta),
      };
    }

    const narrowY = params.connector.narrowPointY;
    const halfWidth = params.connector.widthAtNarrowest / 2;
    const upperY = params.upperCircle.centerY + params.upperCircle.radiusY;
    const lowerY = params.lowerCircle.centerY - params.lowerCircle.radiusY;
    const t = (Math.sin(theta) + 1) / 2;
    const y = upperY + (lowerY - upperY) * t;
    const widthAtY = halfWidth * (1 - Math.abs(y - narrowY) / Math.max(Math.abs(upperY - narrowY), Math.abs(lowerY - narrowY)));
    const x = params.upperCircle.centerX + widthAtY * radiusRatio * Math.cos(theta);
    return { x, y };
  }

  static generateOutlinePath(params: GourdShapeParams): string {
    const uc = params.upperCircle;
    const lc = params.lowerCircle;
    const conn = params.connector;

    const steps = 64;
    const upperPoints: string[] = [];
    const lowerPoints: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const theta = (2 * Math.PI * i) / steps;
      const ux = uc.centerX + uc.radiusX * Math.cos(theta);
      const uy = uc.centerY + uc.radiusY * Math.sin(theta);
      upperPoints.push(`${ux.toFixed(4)},${uy.toFixed(4)}`);

      const lx = lc.centerX + lc.radiusX * Math.cos(theta);
      const ly = lc.centerY + lc.radiusY * Math.sin(theta);
      lowerPoints.push(`${lx.toFixed(4)},${ly.toFixed(4)}`);
    }

    const upperPath = `M${upperPoints[0]} ` + upperPoints.slice(1).map(p => `L${p}`).join(' ') + ' Z';
    const lowerPath = `M${lowerPoints[0]} ` + lowerPoints.slice(1).map(p => `L${p}`).join(' ') + ' Z';

    const connLeftTop = `${(uc.centerX - conn.widthAtNarrowest / 2).toFixed(4)},${(uc.centerY + uc.radiusY).toFixed(4)}`;
    const connLeftBottom = `${(lc.centerX - lc.radiusX * 0.3).toFixed(4)},${(lc.centerY - lc.radiusY).toFixed(4)}`;
    const connRightBottom = `${(lc.centerX + lc.radiusX * 0.3).toFixed(4)},${(lc.centerY - lc.radiusY).toFixed(4)}`;
    const connRightTop = `${(uc.centerX + conn.widthAtNarrowest / 2).toFixed(4)},${(uc.centerY + uc.radiusY).toFixed(4)}`;

    const connectorPath = `M${connLeftTop} C${connLeftTop},${connLeftBottom},${connLeftBottom} L${connRightBottom} C${connRightBottom},${connRightTop},${connRightTop}`;

    return `${upperPath} ${connectorPath} ${lowerPath}`;
  }

  static generateCurvedPath(
    from: { x: number; y: number },
    to: { x: number; y: number },
    tension: number = 0.5
  ): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const cx1 = from.x + dx * tension;
    const cy1 = from.y;
    const cx2 = to.x - dx * tension;
    const cy2 = to.y;

    return `M${from.x.toFixed(4)},${from.y.toFixed(4)} C${cx1.toFixed(4)},${cy1.toFixed(4)} ${cx2.toFixed(4)},${cy2.toFixed(4)} ${to.x.toFixed(4)},${to.y.toFixed(4)}`;
  }

  static getQuadrant(
    point: { x: number; y: number },
    params: GourdShapeParams
  ): 'W' | 'N' | 'I' | 'P' | 'outside' {
    const lc = params.lowerCircle;
    const dx = (point.x - lc.centerX) / lc.radiusX;
    const dy = (point.y - lc.centerY) / lc.radiusY;
    const dist = dx * dx + dy * dy;

    if (dist > 1) return 'outside';

    if (dx < 0 && dy < 0) return 'W';
    if (dx >= 0 && dy < 0) return 'N';
    if (dx < 0 && dy >= 0) return 'I';
    return 'P';
  }

  static generateQuadrantDividers(params: GourdShapeParams): {
    horizontal: string;
    vertical: string;
  } {
    const lc = params.lowerCircle;

    const horizontal = `M${(lc.centerX - lc.radiusX).toFixed(4)},${lc.centerY.toFixed(4)} L${(lc.centerX + lc.radiusX).toFixed(4)},${lc.centerY.toFixed(4)}`;
    const vertical = `M${lc.centerX.toFixed(4)},${(lc.centerY - lc.radiusY).toFixed(4)} L${lc.centerX.toFixed(4)},${(lc.centerY + lc.radiusY).toFixed(4)}`;

    return { horizontal, vertical };
  }
}
