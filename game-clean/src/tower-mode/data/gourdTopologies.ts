import { GourdLayoutGenerator } from '../utils/gourdLayout';
import { LAYER_MAP_TEMPLATES } from './mapTemplates';
import { GridType, GridState } from '../types/grid.types';
import type { GourdMapTopology, GridCell, AreaEffectType } from '../types/grid.types';

function generateLayerTopology(layerNum: number): GourdMapTopology {
  const template = LAYER_MAP_TEMPLATES[layerNum];
  const generator = new GourdLayoutGenerator();
  const coordinateMap = generator.generateGridCoordinates(template);

  const entries = Array.from(coordinateMap.entries());
  const upperEntries = entries.filter(([, coord]) => coord.section === 'upper');
  const connectorEntries = entries.filter(([, coord]) => coord.section === 'connector');
  const lowerEntries = entries.filter(([, coord]) => coord.section === 'lower');

  const cells: GridCell[] = entries.map(([cellId, coordinate]) => ({
    id: cellId,
    layer: layerNum,
    type: GridType.LEVEL,
    state: GridState.LOCKED,
    coordinate,
    difficulty: Math.min(5, Math.max(1, Math.ceil(layerNum / 2))) as 1 | 2 | 3 | 4 | 5,
    areaEffects: [],
    adjacentCells: [],
  }));

  if (upperEntries.length > 0) {
    const startCell = cells.find(c => c.id === upperEntries[0][0]);
    if (startCell) {
      startCell.type = GridType.START;
      startCell.state = GridState.CURRENT;
    }
  }

  if (lowerEntries.length > 0) {
    const bossCell = cells.find(c => c.id === lowerEntries[lowerEntries.length - 1][0]);
    if (bossCell) {
      bossCell.type = GridType.BOSS;
      bossCell.state = GridState.LOCKED;
    }
  }

  const assignableCells = cells.filter(
    c => c.type !== GridType.START && c.type !== GridType.BOSS
  );

  const levelCount = template.gridConfig.levelGrids;
  const opportunityCount = template.gridConfig.opportunityGrids;
  const bookstoreCount = 1;
  const skillCount = assignableCells.length - levelCount - opportunityCount - bookstoreCount;

  let assigned = 0;
  for (let i = 0; i < levelCount && assigned < assignableCells.length; i++, assigned++) {
    assignableCells[assigned].type = GridType.LEVEL;
  }
  for (let i = 0; i < opportunityCount && assigned < assignableCells.length; i++, assigned++) {
    assignableCells[assigned].type = GridType.OPPORTUNITY;
  }
  for (let i = 0; i < bookstoreCount && assigned < assignableCells.length; i++, assigned++) {
    assignableCells[assigned].type = GridType.BOOKSTORE;
  }
  for (let i = 0; i < skillCount && assigned < assignableCells.length; i++, assigned++) {
    assignableCells[assigned].type = GridType.SKILL;
  }

  for (const cell of cells) {
    if (cell.type !== GridType.START && cell.type !== GridType.BOSS) {
      if (Math.random() < template.gridConfig.eliteRatio) {
        cell.eliteMarker = {
          isElite: true,
          borderStyle: 'double',
          icon: 'skull',
          penaltyMultiplier: 1.5,
          rewardMultiplier: 2.0,
        };
      }
    }
  }

  generator.assignAreaEffects(cells, template);

  const connections = generator.generateConnections(cells, template);

  const adjacentMap = new Map<string, Set<string>>();
  for (const cell of cells) {
    adjacentMap.set(cell.id, new Set<string>());
  }
  for (const conn of connections) {
    adjacentMap.get(conn.fromCellId)?.add(conn.toCellId);
    if (conn.bidirectional) {
      adjacentMap.get(conn.toCellId)?.add(conn.fromCellId);
    }
  }
  for (const cell of cells) {
    cell.adjacentCells = Array.from(adjacentMap.get(cell.id) ?? []);
  }

  const upperCellIds = upperEntries.map(([id]) => id);
  const connectorCellIds = connectorEntries.map(([id]) => id);
  const lowerCellIds = lowerEntries.map(([id]) => id);

  const upperCenterX = upperEntries.length > 0
    ? upperEntries.reduce((sum, [, c]) => sum + c.x, 0) / upperEntries.length
    : 50;
  const upperCenterY = upperEntries.length > 0
    ? upperEntries.reduce((sum, [, c]) => sum + c.y, 0) / upperEntries.length
    : template.gourdParams.upperCenterY;

  const lowerCenterX = lowerEntries.length > 0
    ? lowerEntries.reduce((sum, [, c]) => sum + c.x, 0) / lowerEntries.length
    : 50;
  const lowerCenterY = lowerEntries.length > 0
    ? lowerEntries.reduce((sum, [, c]) => sum + c.y, 0) / lowerEntries.length
    : template.gourdParams.lowerCenterY;

  const cellsByType: Partial<Record<GridType, number>> = {};
  for (const cell of cells) {
    cellsByType[cell.type] = (cellsByType[cell.type] ?? 0) + 1;
  }

  const totalDistance = connections.reduce((sum, conn) => sum + conn.distance, 0);
  const avgPathLength = connections.length > 0 ? totalDistance / connections.length : 0;

  const visited = new Set<string>();
  let loopPaths = 0;
  for (const cell of cells) {
    if (!visited.has(cell.id)) {
      const hasLoop = detectLoop(cell.id, null, visited, new Set(), adjacentMap);
      if (hasLoop) loopPaths++;
    }
  }

  const quadrantEffects = template.areaConfig.lowerQuadrantEffects;

  return {
    layer: layerNum,
    cells,
    upperCircle: {
      center: { x: upperCenterX, y: upperCenterY },
      radius: template.gourdParams.upperRadius,
      cellIds: upperCellIds,
    },
    connector: {
      cellIds: connectorCellIds,
      width: template.gourdParams.connectorWidth,
    },
    lowerCircle: {
      center: { x: lowerCenterX, y: lowerCenterY },
      radius: template.gourdParams.lowerRadius,
      cellIds: lowerCellIds,
      quadrants: {
        1: quadrantEffects[0],
        2: quadrantEffects[1],
        3: quadrantEffects[2],
        4: quadrantEffects[3],
      },
    },
    connections,
    stats: {
      totalCells: cells.length,
      cellsByType,
      avgPathLength,
      loopPaths,
    },
  };
}

function detectLoop(
  currentId: string,
  parentId: string | null,
  globalVisited: Set<string>,
  pathVisited: Set<string>,
  adjacentMap: Map<string, Set<string>>
): boolean {
  globalVisited.add(currentId);
  pathVisited.add(currentId);

  const neighbors = adjacentMap.get(currentId);
  if (neighbors) {
    for (const neighborId of neighbors) {
      if (neighborId === parentId) continue;
      if (pathVisited.has(neighborId)) return true;
      if (!globalVisited.has(neighborId)) {
        if (detectLoop(neighborId, currentId, globalVisited, new Set(pathVisited), adjacentMap)) {
          return true;
        }
      }
    }
  }

  return false;
}

export const GOURD_TOPOLOGIES: Record<number, GourdMapTopology> = {};
for (let i = 1; i <= 9; i++) {
  GOURD_TOPOLOGIES[i] = generateLayerTopology(i);
}

export function getGourdTopology(layer: number): GourdMapTopology {
  return GOURD_TOPOLOGIES[layer];
}

export function getAllGourdTopologies(): GourdMapTopology[] {
  return Object.values(GOURD_TOPOLOGIES);
}
