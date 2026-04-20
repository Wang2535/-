import { describe, it, expect } from 'vitest';
import { LevelAssignmentAlgorithm } from '../levelAssignment';
import { LEVEL_POOL_BY_LAYER } from '../../data/levelPool';
import { LAYER_01_DATA, LAYER_09_DATA } from '../../data';
import type { BattleCell } from '../../types';

describe('LevelAssignmentAlgorithm', () => {
  const algorithm = new LevelAssignmentAlgorithm();

  it('为第1层分配关卡应成功', () => {
    const pool = LEVEL_POOL_BY_LAYER[1];
    const result = algorithm.assignLevelsToLayer(LAYER_01_DATA, pool);

    expect(result).toBeDefined();
    expect(result.layer).toBe(1);
    expect(result.assignedLevels.size).toBeGreaterThan(0);
    expect(result.selectedBossPrototype).toBeDefined();
    expect(result.generatedBoss).toBeDefined();
    expect(result.difficultyGradient.mainPath.length).toBeGreaterThan(0);
  });

  it('为第9层分配关卡应成功', () => {
    const pool = LEVEL_POOL_BY_LAYER[9];
    const result = algorithm.assignLevelsToLayer(LAYER_09_DATA, pool);

    expect(result).toBeDefined();
    expect(result.layer).toBe(9);
    expect(result.assignedLevels.size).toBeGreaterThan(0);
    expect(result.selectedBossPrototype).toBeDefined();
    expect(result.generatedBoss).toBeDefined();
  });

  it('主路径难度递增', () => {
    const pool = LEVEL_POOL_BY_LAYER[1];
    const result = algorithm.assignLevelsToLayer(LAYER_01_DATA, pool);

    const mainPathIds = result.difficultyGradient.mainPath;
    const battleCellsOnPath = mainPathIds
      .map(id => LAYER_01_DATA.cellIndex[id])
      .filter((cell): cell is BattleCell => cell.type === 'battle');

    for (let i = 1; i < battleCellsOnPath.length; i++) {
      expect(battleCellsOnPath[i].difficulty).toBeGreaterThanOrEqual(
        battleCellsOnPath[i - 1].difficulty,
      );
    }
  });

  it('精英格正确标记', () => {
    const pool = LEVEL_POOL_BY_LAYER[1];
    algorithm.assignLevelsToLayer(LAYER_01_DATA, pool);

    const battleCells = LAYER_01_DATA.cells.filter(
      (cell): cell is BattleCell => cell.type === 'battle',
    );

    for (const cell of battleCells) {
      if (cell.difficulty >= 4) {
        expect(cell.metadata?.isElite).toBe(true);
      }
    }

    const eliteIds = battleCells
      .filter(cell => cell.metadata?.isElite === true)
      .map(cell => cell.id);

    expect(eliteIds.length).toBeGreaterThan(0);

    for (const id of eliteIds) {
      const cell = LAYER_01_DATA.cellIndex[id] as BattleCell;
      expect(cell.difficulty).toBeGreaterThanOrEqual(4);
    }
  });

  it('selectBossPrototype 三种策略都能工作', () => {
    const pool = LEVEL_POOL_BY_LAYER[1];

    const highest = algorithm.selectBossPrototype(pool, 'highestPower');
    expect(highest).toBeDefined();
    expect(highest.difficulty).toBe(Math.max(...pool.map(e => e.difficulty)));

    const thematic = algorithm.selectBossPrototype(pool, 'mostThematic');
    expect(thematic).toBeDefined();
    expect(thematic.tags.length).toBeGreaterThan(0);

    const random = algorithm.selectBossPrototype(pool, 'randomWeighted');
    expect(random).toBeDefined();
    expect(pool).toContain(random);
  });

  it('不同层级的关卡池互不干扰', () => {
    const pool1 = LEVEL_POOL_BY_LAYER[1];
    const pool9 = LEVEL_POOL_BY_LAYER[9];

    const result1 = algorithm.assignLevelsToLayer(LAYER_01_DATA, pool1);
    const result9 = algorithm.assignLevelsToLayer(LAYER_09_DATA, pool9);

    for (const entry of result1.assignedLevels.values()) {
      expect(entry.layer).toBe(1);
    }

    for (const entry of result9.assignedLevels.values()) {
      expect(entry.layer).toBe(9);
    }
  });
});
