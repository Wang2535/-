import { CurvedPathEngine } from './curvedPathEngine';
import { PlayerPieceManager } from './playerPiece';
import type { PlayerPieceState } from './playerPiece';
import type { TypedEventBus, TowerEventType } from '../EventBus';
import type { GourdCoordinate } from '../types/gourdCoordinate.types';
import type { GourdMapTopology } from '../types/grid.types';

export class MovementController {
  private curvedPathEngine: CurvedPathEngine;
  private pieceManager: PlayerPieceManager;
  private eventBus: TypedEventBus<TowerEventType>;
  private topology: GourdMapTopology | null;
  private rafId: number | null;

  constructor(eventBus: TypedEventBus<TowerEventType>) {
    this.eventBus = eventBus;
    this.curvedPathEngine = new CurvedPathEngine();
    this.pieceManager = new PlayerPieceManager(eventBus);
    this.topology = null;
    this.rafId = null;
  }

  setTopology(topology: GourdMapTopology): void {
    this.topology = topology;
  }

  async requestMove(
    fromCoord: GourdCoordinate,
    toCoord: GourdCoordinate,
    waypoints: GourdCoordinate[],
  ): Promise<boolean> {
    if (!this.topology) {
      return false;
    }

    if (this.pieceManager.getState().isMoving) {
      return false;
    }

    let pathPoints: Array<{ x: number; y: number }>;
    try {
      const result = this.curvedPathEngine.calculateAnimatedPath(
        fromCoord, toCoord, waypoints, this.topology,
      );
      pathPoints = result;
    } catch {
      pathPoints = this.fallbackPath(fromCoord, toCoord);
    }

    if (pathPoints.length < 2) {
      pathPoints = this.fallbackPath(fromCoord, toCoord);
    }

    if (pathPoints.length < 2) {
      return false;
    }

    const targetZone = this.detectZone(toCoord);
    const targetCellId = this.coordToCellId(toCoord);
    this.pieceManager.startMove(targetCellId, pathPoints, targetZone ?? undefined);
    if (targetZone) {
      this.pieceManager.setCurrentZone(targetZone);
    }
    this.startAnimationLoop();

    return true;
  }

  getPieceState(): PlayerPieceState {
    return this.pieceManager.getState();
  }

  onPieceStateChange(callback: (state: PlayerPieceState) => void): () => void {
    return this.pieceManager.subscribe(callback);
  }

  setCurrentZone(zone: string | null): void {
    this.pieceManager.setCurrentZone(zone);
  }

  emergencyStop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private startAnimationLoop(): void {
    if (this.rafId !== null) return;

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      this.pieceManager.update(dt);

      if (this.pieceManager.getState().isMoving) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private detectZone(coord: GourdCoordinate): string | null {
    if (coord.region !== 'lowerCircle') return null;

    const theta = ((coord.theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (theta >= Math.PI && theta <= 1.5 * Math.PI) return 'W';
    if (theta >= 0 && theta <= 0.5 * Math.PI) return 'N';
    if (theta >= 1.5 * Math.PI && theta <= 2 * Math.PI) return 'I';
    if (theta >= 0.5 * Math.PI && theta <= Math.PI) return 'P';
    return null;
  }

  private fallbackPath(
    from: GourdCoordinate,
    to: GourdCoordinate,
  ): Array<{ x: number; y: number }> {
    return [
      { x: from.cartesian?.x ?? 0.5, y: from.cartesian?.y ?? 0.3 },
      { x: to.cartesian?.x ?? 0.5, y: to.cartesian?.y ?? 0.7 },
    ];
  }

  private coordToCellId(coord: GourdCoordinate): string {
    return `${coord.region}_${coord.theta?.toFixed(2)}_${coord.radiusRatio?.toFixed(2)}`;
  }
}

export function createMovementSystem(eventBus: TypedEventBus<TowerEventType>): MovementController {
  return new MovementController(eventBus);
}

export type { PlayerPieceState };
