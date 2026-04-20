import type {
  TowerLayerData,
  GameCell,
  Coordinate2D,
  PathConnection,
  ZoneType,
} from '../types';

export interface IMobilityConfig {
  shiftProbability: number;
  shiftRange: number;
  shiftDirection: 'random' | 'outward' | 'inward';
  affectedCellTypes: string[];
}

export interface IBoundaryFlexConfig {
  flexMode: 'expand' | 'contract' | 'breathe';
  flexAmount: number;
  flexInterval: number;
  currentPhase: number;
}

export interface IProbabilityConfig {
  probabilityStrength: number;
  collapseThreshold: number;
  observerRadius: number;
  unstableConnections: string[];
}

export interface IEnrichedTopology extends TowerLayerData {
  mobility?: IMobilityConfig;
  boundaryFlex?: IBoundaryFlexConfig;
  probabilityConfig?: IProbabilityConfig;
}

export class DynamicMechanicsEngine {
  private shiftHistory: Map<string, Coordinate2D[]>;
  private collapsedConnections: Set<string>;
  private observerFixedConnections: Set<string>;
  private boundaryPhase: number;

  constructor() {
    this.shiftHistory = new Map();
    this.collapsedConnections = new Set();
    this.observerFixedConnections = new Set();
    this.boundaryPhase = 0;
  }

  executeDynamicShifts(
    topology: IEnrichedTopology,
    rng?: () => number,
  ): {
    shiftedCells: string[];
    newPositions: Map<string, Coordinate2D>;
    affectedConnections: PathConnection[];
  } {
    if (!topology.mobility) {
      return { shiftedCells: [], newPositions: new Map(), affectedConnections: [] };
    }

    const randomFn = rng ?? Math.random;
    const mobility = topology.mobility;
    const shiftedCells: string[] = [];
    const newPositions = new Map<string, Coordinate2D>();
    const affectedConnections: PathConnection[] = [];

    const centerX = topology.gridSize.cols / 2;
    const centerY = topology.gridSize.rows / 2;

    for (const cell of topology.cells) {
      if (!mobility.affectedCellTypes.includes(cell.type)) continue;
      if (randomFn() >= mobility.shiftProbability) continue;

      let dx = 0;
      let dy = 0;

      if (mobility.shiftDirection === 'random') {
        dx = Math.floor(randomFn() * (2 * mobility.shiftRange + 1)) - mobility.shiftRange;
        dy = Math.floor(randomFn() * (2 * mobility.shiftRange + 1)) - mobility.shiftRange;
      } else if (mobility.shiftDirection === 'outward') {
        const dirX = cell.coordinate[0] >= centerX ? 1 : -1;
        const dirY = cell.coordinate[1] >= centerY ? 1 : -1;
        dx = dirX * Math.ceil(randomFn() * mobility.shiftRange);
        dy = dirY * Math.ceil(randomFn() * mobility.shiftRange);
      } else if (mobility.shiftDirection === 'inward') {
        const dirX = cell.coordinate[0] >= centerX ? -1 : 1;
        const dirY = cell.coordinate[1] >= centerY ? -1 : 1;
        dx = dirX * Math.ceil(randomFn() * mobility.shiftRange);
        dy = dirY * Math.ceil(randomFn() * mobility.shiftRange);
      }

      const newX = Math.max(0, cell.coordinate[0] + dx);
      const newY = Math.max(0, cell.coordinate[1] + dy);
      const newCoord: Coordinate2D = [newX, newY];

      shiftedCells.push(cell.id);
      newPositions.set(cell.id, newCoord);

      const history = this.shiftHistory.get(cell.id) ?? [];
      history.push(newCoord);
      this.shiftHistory.set(cell.id, history);

      cell.coordinate = newCoord;
    }

    for (const path of topology.paths) {
      if (shiftedCells.includes(path.from) || shiftedCells.includes(path.to)) {
        affectedConnections.push(path);
      }
    }

    return { shiftedCells, newPositions, affectedConnections };
  }

  executeBoundaryFlex(topology: IEnrichedTopology): {
    expanded: boolean;
    newBoundary: Coordinate2D[];
  } {
    if (!topology.boundaryFlex) {
      return { expanded: false, newBoundary: [] };
    }

    const flex = topology.boundaryFlex;
    const cols = topology.gridSize.cols;
    const rows = topology.gridSize.rows;
    const amount = flex.flexAmount;

    let mode: 'expand' | 'contract';
    if (flex.flexMode === 'breathe') {
      mode = this.boundaryPhase % 2 === 0 ? 'expand' : 'contract';
    } else {
      mode = flex.flexMode;
    }

    this.boundaryPhase++;

    let boundary: Coordinate2D[];
    if (mode === 'expand') {
      boundary = [
        [-amount, -amount],
        [cols + amount, -amount],
        [cols + amount, rows + amount],
        [-amount, rows + amount],
      ];
    } else {
      boundary = [
        [amount, amount],
        [cols - amount, amount],
        [cols - amount, rows - amount],
        [amount, rows - amount],
      ];
    }

    return { expanded: mode === 'expand', newBoundary: boundary };
  }

  executeQuantumCollapse(
    topology: IEnrichedTopology,
    observerCellId?: string,
  ): {
    collapsedConnections: string[];
    activatedConnections: string[];
    deactivatedConnections: string[];
  } {
    if (!topology.probabilityConfig) {
      return { collapsedConnections: [], activatedConnections: [], deactivatedConnections: [] };
    }

    const config = topology.probabilityConfig;
    const collapsed: string[] = [];
    const activated: string[] = [];
    const deactivated: string[] = [];

    if (observerCellId) {
      this.applyObserverEffect(topology, observerCellId);
    }

    for (const path of topology.paths) {
      if (!config.unstableConnections.includes(path.id)) continue;

      const isFixed = this.observerFixedConnections.has(path.id);
      const roll = Math.random();
      const activationChance = config.probabilityStrength * (1 - config.collapseThreshold);

      if (roll < activationChance) {
        activated.push(path.id);
        this.collapsedConnections.delete(path.id);
      } else {
        if (!isFixed) {
          deactivated.push(path.id);
          this.collapsedConnections.add(path.id);
        } else {
          activated.push(path.id);
        }
      }
      collapsed.push(path.id);
    }

    return { collapsedConnections: collapsed, activatedConnections: activated, deactivatedConnections: deactivated };
  }

  applyObserverEffect(
    topology: IEnrichedTopology,
    observerCellId: string,
  ): PathConnection[] {
    if (!topology.probabilityConfig) {
      return [];
    }

    const radius = topology.probabilityConfig.observerRadius;
    const affectedPaths: PathConnection[] = [];

    const nearbyCellIds = new Set<string>();
    nearbyCellIds.add(observerCellId);

    let frontier = [observerCellId];
    for (let step = 0; step < radius; step++) {
      const nextFrontier: string[] = [];
      for (const cellId of frontier) {
        const neighbors = topology.adjacencyList[cellId] ?? [];
        for (const neighborId of neighbors) {
          if (!nearbyCellIds.has(neighborId)) {
            nearbyCellIds.add(neighborId);
            nextFrontier.push(neighborId);
          }
        }
      }
      frontier = nextFrontier;
    }

    for (const path of topology.paths) {
      if (nearbyCellIds.has(path.from) || nearbyCellIds.has(path.to)) {
        this.observerFixedConnections.add(path.id);
        affectedPaths.push(path);
      }
    }

    return affectedPaths;
  }

  getShiftHistory(cellId: string): Coordinate2D[] | undefined {
    return this.shiftHistory.get(cellId);
  }

  isConnectionCollapsed(connectionId: string): boolean {
    return this.collapsedConnections.has(connectionId);
  }

  isConnectionFixedByObserver(connectionId: string): boolean {
    return this.observerFixedConnections.has(connectionId);
  }

  reset(): void {
    this.shiftHistory.clear();
    this.collapsedConnections.clear();
    this.observerFixedConnections.clear();
    this.boundaryPhase = 0;
  }
}
