import type { GourdMapTopology, GridPathConnection, GridPathCondition } from '../types/grid.types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalCells: number;
    reachableCells: number;
    unreachableCells: number;
    connectivityRate: number;
    pathCount: number;
    conditionalPaths: number;
    quadrantCoverage: Record<string, number>;
  };
}

export function validateMapConnectivity(topology: GourdMapTopology): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allCellIds = [
    ...topology.upperCircle.cellIds,
    ...topology.connector.cellIds,
    ...topology.lowerCircle.cellIds,
  ];

  const cellIdSet = new Set(allCellIds);

  const adjacency = new Map<string, Set<string>>();
  for (const id of allCellIds) {
    adjacency.set(id, new Set());
  }

  for (const conn of topology.connections) {
    const fromNeighbors = adjacency.get(conn.fromCellId);
    const toNeighbors = adjacency.get(conn.toCellId);
    if (fromNeighbors) {
      fromNeighbors.add(conn.toCellId);
    }
    if (conn.bidirectional && toNeighbors) {
      toNeighbors.add(conn.fromCellId);
    }
  }

  const startCell = topology.upperCircle.cellIds[0];
  const visited = new Set<string>();

  if (startCell !== undefined) {
    const queue: string[] = [startCell];
    visited.add(startCell);
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacency.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }

  for (const id of allCellIds) {
    if (!visited.has(id)) {
      errors.push(`Cell ${id} is unreachable from start`);
    }
  }

  let conditionalPaths = 0;

  for (const conn of topology.connections) {
    if (conn.condition) {
      conditionalPaths++;
      if (conn.condition.type === 'clearAll') {
        if (!cellIdSet.has(conn.fromCellId)) {
          errors.push(`Conditional path ${conn.id} references non-existent fromCellId: ${conn.fromCellId}`);
        }
      } else if (conn.condition.type === 'clearSpecific') {
        if (conn.condition.requiredCellIds) {
          for (const reqId of conn.condition.requiredCellIds) {
            if (!cellIdSet.has(reqId)) {
              errors.push(`Conditional path ${conn.id} requires non-existent cell: ${reqId}`);
            }
          }
        }
      } else if (conn.condition.type === 'unlockItem') {
        warnings.push(`Conditional path ${conn.id} uses unlockItem condition which cannot be statically verified`);
      } else if (conn.condition.type === 'random') {
        warnings.push(`Conditional path ${conn.id} uses random condition which cannot be statically verified`);
      }
    }
  }

  const quadrants = topology.lowerCircle.quadrants;
  const quadrantKeys = Object.keys(quadrants).map(Number).sort((a, b) => a - b);

  if (quadrantKeys.length !== 4 || quadrantKeys[0] !== 1 || quadrantKeys[1] !== 2 || quadrantKeys[2] !== 3 || quadrantKeys[3] !== 4) {
    errors.push(`lowerCircle.quadrants must have exactly 4 quadrants (1-4), found: ${quadrantKeys.join(',')}`);
  }

  const quadrantCoverage: Record<string, number> = {};
  for (const key of quadrantKeys) {
    quadrantCoverage[String(key)] = 0;
  }

  const totalCells = allCellIds.length;
  const reachableCells = visited.size;
  const unreachableCells = totalCells - reachableCells;
  const connectivityRate = totalCells > 0 ? reachableCells / totalCells : 0;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalCells,
      reachableCells,
      unreachableCells,
      connectivityRate,
      pathCount: topology.connections.length,
      conditionalPaths,
      quadrantCoverage,
    },
  };
}
