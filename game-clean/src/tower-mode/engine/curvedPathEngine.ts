import type { GridCoordinate, GourdMapTopology, GridPathConnection } from '../types/grid.types';

export interface PathPoint {
  x: number;
  y: number;
  progress: number;
}

export class CurvedPathEngine {
  private static readonly INTERPOLATION_STEPS = 20;

  calculateAnimatedPath(
    fromCoord: GridCoordinate,
    toCoord: GridCoordinate,
    waypoints: GridCoordinate[],
    topology: GourdMapTopology,
  ): PathPoint[] {
    const controlPoints: Array<{ x: number; y: number }> = [
      { x: fromCoord.x, y: fromCoord.y },
      ...waypoints.map(wp => ({ x: wp.x, y: wp.y })),
      { x: toCoord.x, y: toCoord.y },
    ];

    if (controlPoints.length < 2) {
      return [];
    }

    const pathPoints: PathPoint[] = [];
    const totalSegments = controlPoints.length - 1;
    const stepsPerSegment = CurvedPathEngine.INTERPOLATION_STEPS;
    const totalSteps = totalSegments * stepsPerSegment;

    for (let seg = 0; seg < totalSegments; seg++) {
      const p0 = controlPoints[Math.max(0, seg - 1)];
      const p1 = controlPoints[seg];
      const p2 = controlPoints[Math.min(controlPoints.length - 1, seg + 1)];
      const p3 = controlPoints[Math.min(controlPoints.length - 1, seg + 2)];

      for (let i = 0; i < stepsPerSegment; i++) {
        const t = i / stepsPerSegment;
        const point = this.catmullRomInterpolate(p0, p1, p2, p3, t);
        const globalIndex = seg * stepsPerSegment + i;
        pathPoints.push({
          x: point.x,
          y: point.y,
          progress: globalIndex / totalSteps,
        });
      }
    }

    const lastPoint = controlPoints[controlPoints.length - 1];
    pathPoints.push({
      x: lastPoint.x,
      y: lastPoint.y,
      progress: 1.0,
    });

    return pathPoints;
  }

  calculatePathLength(pathPoints: Array<{ x: number; y: number }>): number {
    if (pathPoints.length < 2) {
      return 0;
    }

    let totalLength = 0;
    for (let i = 1; i < pathPoints.length; i++) {
      const dx = pathPoints[i].x - pathPoints[i - 1].x;
      const dy = pathPoints[i].y - pathPoints[i - 1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    return totalLength;
  }

  getPositionAtProgress(
    pathPoints: Array<{ x: number; y: number }>,
    progress: number,
  ): { x: number; y: number } {
    if (pathPoints.length === 0) {
      return { x: 0, y: 0 };
    }

    if (pathPoints.length === 1) {
      return { x: pathPoints[0].x, y: pathPoints[0].y };
    }

    const clampedProgress = Math.max(0, Math.min(1, progress));

    const totalLength = this.calculatePathLength(pathPoints);
    if (totalLength === 0) {
      return { x: pathPoints[0].x, y: pathPoints[0].y };
    }

    const targetLength = clampedProgress * totalLength;
    let accumulatedLength = 0;

    for (let i = 1; i < pathPoints.length; i++) {
      const dx = pathPoints[i].x - pathPoints[i - 1].x;
      const dy = pathPoints[i].y - pathPoints[i - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (accumulatedLength + segmentLength >= targetLength) {
        const remainingLength = targetLength - accumulatedLength;
        const segmentProgress = segmentLength > 0 ? remainingLength / segmentLength : 0;
        return {
          x: pathPoints[i - 1].x + dx * segmentProgress,
          y: pathPoints[i - 1].y + dy * segmentProgress,
        };
      }

      accumulatedLength += segmentLength;
    }

    const last = pathPoints[pathPoints.length - 1];
    return { x: last.x, y: last.y };
  }

  private catmullRomInterpolate(
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    t: number,
  ): { x: number; y: number } {
    const t2 = t * t;
    const t3 = t2 * t;

    const x = 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    );

    const y = 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    );

    return { x, y };
  }
}
