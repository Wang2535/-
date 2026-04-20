import type { LevelPoolEntry, AssignmentResult, TowerLayerData, GameCell, BattleCell, PathConnection } from '../types';
import { LEVEL_POOL_BY_LAYER } from '../data/levelPool';
import { BossGenerator } from './bossGenerator';

type SelectionCriteria = 'highestPower' | 'mostThematic' | 'randomWeighted';

export class LevelAssignmentAlgorithm {
  private bossGenerator = new BossGenerator();

  assignLevelsToLayer(topology: TowerLayerData, pool: LevelPoolEntry[]): AssignmentResult {
    const effectivePool = pool.length > 0 ? pool : (LEVEL_POOL_BY_LAYER[topology.layerNumber] || []);
    const nonBossPool = effectivePool.filter(entry => !entry.tags.includes('boss'));

    const battleCells = topology.cells.filter(
      (cell): cell is BattleCell => cell.type === 'battle',
    );

    const mainPathIds = this.findMainPath(topology);
    const mainPathCells = mainPathIds
      .map(id => topology.cellIndex[id])
      .filter((cell): cell is BattleCell => cell.type === 'battle');

    this.distributeDifficultyGradient(battleCells, mainPathCells);
    this.markEliteGrids(battleCells);

    const sortedBattleCells = [...battleCells].sort((a, b) => a.difficulty - b.difficulty);
    const sortedPool = [...nonBossPool].sort((a, b) => a.difficulty - b.difficulty);

    const assignedLevels = new Map<string, LevelPoolEntry>();
    const assignedEntryIds = new Set<string>();

    for (let i = 0; i < sortedBattleCells.length && i < sortedPool.length; i++) {
      const cell = sortedBattleCells[i];
      const entry = sortedPool[i];
      cell.levelId = entry.id;
      assignedLevels.set(cell.id, entry);
      assignedEntryIds.add(entry.id);
    }

    const bossTagged = effectivePool.filter(entry => entry.tags.includes('boss'));
    const remaining = nonBossPool.filter(entry => !assignedEntryIds.has(entry.id));
    const bossCandidatePool = [...bossTagged, ...remaining];

    const selectedBossPrototype = this.selectBossPrototype(
      bossCandidatePool.length > 0 ? bossCandidatePool : effectivePool,
      'highestPower',
    );

    const generatedBoss = this.bossGenerator.generateFromPrototype(
      selectedBossPrototype,
      topology.layerNumber,
    );

    const branchPaths = this.findBranchPaths(topology, new Set(mainPathIds), battleCells);
    const eliteCellIds = battleCells
      .filter(cell => cell.metadata?.isElite === true)
      .map(cell => cell.id);

    return {
      layer: topology.layerNumber,
      assignedLevels,
      bossCandidatePool,
      selectedBossPrototype,
      generatedBoss,
      difficultyGradient: {
        mainPath: mainPathIds,
        branchPaths,
        eliteCellIds,
      },
    };
  }

  selectBossPrototype(candidates: LevelPoolEntry[], criteria: SelectionCriteria): LevelPoolEntry {
    if (candidates.length === 0) {
      throw new Error('No boss candidates available');
    }

    if (candidates.length === 1) return candidates[0];

    switch (criteria) {
      case 'highestPower':
        return candidates.reduce((best, curr) =>
          curr.difficulty > best.difficulty ? curr : best,
        );

      case 'mostThematic':
        return candidates.reduce((best, curr) => {
          const currScore = curr.tags.filter(t => t !== 'boss').length;
          const bestScore = best.tags.filter(t => t !== 'boss').length;
          return currScore > bestScore ? curr : best;
        });

      case 'randomWeighted': {
        const totalWeight = candidates.reduce((sum, c) => sum + c.difficulty, 0);
        let random = Math.random() * totalWeight;
        for (const candidate of candidates) {
          random -= candidate.difficulty;
          if (random <= 0) return candidate;
        }
        return candidates[candidates.length - 1];
      }
    }
  }

  distributeDifficultyGradient(cells: GameCell[], mainPath: GameCell[]): void {
    const mainPathIds = new Set(mainPath.map(c => c.id));

    const mainBattleCells = mainPath.filter(
      (c): c is BattleCell => c.type === 'battle',
    );

    const branchBattleCells = cells.filter(
      (c): c is BattleCell => c.type === 'battle' && !mainPathIds.has(c.id),
    );

    for (let i = 0; i < mainBattleCells.length; i++) {
      const progress = mainBattleCells.length > 1
        ? i / (mainBattleCells.length - 1)
        : 0;
      mainBattleCells[i].difficulty = Math.round(1 + progress * 4);
    }

    for (const branchCell of branchBattleCells) {
      const nearestIdx = this.findNearestMainPathIndex(branchCell, mainBattleCells);
      if (nearestIdx >= 0 && mainBattleCells.length > 0) {
        branchCell.difficulty = Math.max(1, mainBattleCells[nearestIdx].difficulty - 1);
      } else {
        branchCell.difficulty = 1;
      }
    }
  }

  markEliteGrids(cells: GameCell[]): void {
    for (const cell of cells) {
      if (cell.type === 'battle' && cell.difficulty >= 4) {
        if (!cell.metadata) cell.metadata = {};
        cell.metadata.isElite = true;
      }
    }
  }

  private findMainPath(topology: TowerLayerData): string[] {
    const { startCellId, bossCellId, adjacencyList, cellIndex } = topology;

    const visited = new Set<string>();
    const queue: { cellId: string; path: string[] }[] = [
      { cellId: startCellId, path: [startCellId] },
    ];
    visited.add(startCellId);

    while (queue.length > 0) {
      const { cellId, path } = queue.shift()!;

      if (cellId === bossCellId) {
        return path;
      }

      const neighbors = adjacencyList[cellId] || [];
      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;

        const neighborCell = cellIndex[neighborId];
        if (!neighborCell) continue;

        if (neighborCell.type === 'battle' || neighborCell.type === 'boss') {
          visited.add(neighborId);
          queue.push({ cellId: neighborId, path: [...path, neighborId] });
        }
      }
    }

    return [];
  }

  private findBranchPaths(
    topology: TowerLayerData,
    mainPathSet: Set<string>,
    battleCells: BattleCell[],
  ): string[][] {
    const branchCellIds = new Set(
      battleCells.filter(c => !mainPathSet.has(c.id)).map(c => c.id),
    );

    if (branchCellIds.size === 0) return [];

    const visited = new Set<string>();
    const groups: string[][] = [];

    for (const cellId of branchCellIds) {
      if (visited.has(cellId)) continue;

      const group: string[] = [];
      const stack = [cellId];

      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId)) continue;
        if (!branchCellIds.has(currentId)) continue;

        visited.add(currentId);
        group.push(currentId);

        const neighbors = topology.adjacencyList[currentId] || [];
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId) && branchCellIds.has(neighborId)) {
            stack.push(neighborId);
          }
        }
      }

      if (group.length > 0) {
        groups.push(group);
      }
    }

    return groups;
  }

  private findNearestMainPathIndex(cell: BattleCell, mainPathCells: BattleCell[]): number {
    let minDist = Infinity;
    let nearestIndex = -1;

    for (let i = 0; i < mainPathCells.length; i++) {
      const dx = cell.coordinate[0] - mainPathCells[i].coordinate[0];
      const dy = cell.coordinate[1] - mainPathCells[i].coordinate[1];
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }
}
