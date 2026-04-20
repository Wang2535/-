import type { Coordinate2D, GameCell } from '../types';

/** 曼哈顿距离 */
export function manhattanDistance(a: Coordinate2D, b: Coordinate2D): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/** 判断两坐标是否相邻（含对角） */
export function isAdjacent(a: Coordinate2D, b: Coordinate2D): boolean {
  return manhattanDistance(a, b) <= 1 && !(a[0] === b[0] && a[1] === b[1]);
}

/** 坐标转ID */
export function coordToId(row: number, col: number): string {
  return `R${row}C${col}`;
}

/** ID转坐标 */
export function idToCoord(id: string): Coordinate2D {
  const match = id.match(/R(\d+)C(\d+)/);
  if (!match) throw new Error(`Invalid cell ID: ${id}`);
  return [parseInt(match[1]), parseInt(match[2])];
}

/** 获取相邻格子 */
export function getNeighbors(coord: Coordinate2D, grid: GameCell[][]): GameCell[] {
  const [row, col] = coord;
  const neighbors: GameCell[] = [];
  const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  for (const [dr, dc] of directions) {
    const nr = row + dr, nc = col + dc;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[nr].length) {
      neighbors.push(grid[nr][nc]);
    }
  }
  return neighbors;
}
