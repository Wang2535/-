/**
 * 引擎性能基准测试
 * 使用 vitest 测试框架，验证核心引擎在最大规模数据下的响应时�? */
import { describe, it, expect } from 'vitest';
import { CellStateMachine } from '../../engine/CellStateMachine';
import { ZoneEffectManager, ZONE_EFFECT_CONFIG, ZONE_PRIORITY_ORDER } from '../../engine/ZoneEffectManager';
import { findReachableCells, MOVEMENT_CONFIG } from '../../engine/MovementEngine';
import type { CellState, Coordinate2D, ZoneType, GameCell, TowerLayerData } from '../types';

describe('引擎性能基准', () => {
  it('BFS寻路�?7格地图上的耗时 < 10ms', () => {
    // 构建17格线性地图（模拟最大规模）
    const cells: any[] = [];
    const adjacencyList: Record<string, string[]> = {};

    for (let i = 0; i < 17; i++) {
      const id = `cell-${i}`;
      cells.push({
        id,
        coordinate: [0, i] as Coordinate2D,
        type: i === 0 ? 'start' : i === 16 ? 'boss' : 'battle',
        state: i < 3 ? 'unlocked' as CellState : 'locked' as CellState,
        levelId: `level-${i}`,
        difficulty: 1,
        isCompleted: false,
      });

      if (i > 0) {
        adjacencyList[`cell-${i-1}`] = [...(adjacencyList[`cell-${i-1}`] || []), id];
      }
    }
    adjacencyList['cell-16'] = [];

    const cellIndex: Record<string, any> = Object.fromEntries(cells.map(c => [c.id, c]));
    const cellStates = new Map<string, CellState>(
      cells.map(c => [c.id, c.state])
    );

    const layerData: TowerLayerData = {
      layerNumber: 1,
      cells: cells as any,
      cellIndex,
      adjacencyList,
      zones: [],
      startCellId: 'cell-0',
      bossCellId: 'cell-16',
    };

    // 多次执行取平�?    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      findReachableCells('cell-0', 10, layerData, cellStates);
    }

    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;

    console.log(`[PERF] BFS 17�?× ${iterations}�? 总耗时 ${elapsed.toFixed(2)}ms, 平均 ${avgMs.toFixed(4)}ms/次`);

    expect(avgMs).toBeLessThan(10);
  });

  it('区域效果计算�?区叠加情况下 < 5ms', () => {
    // 创建6种区域全部覆盖同一位置
    const allZones = (['W', 'N', 'I', 'P', 'S', 'D'] as ZoneType[]).map(type => ({
      id: `zone-${type}`,
      type,
      name: `${type}-test`,
      cellIds: ['target-cell'],
      effect: ZONE_EFFECT_CONFIG[type],
      currentTriggerCount: 0,
    }));

    const manager = new ZoneEffectManager(allZones);

    const context = {
      playerId: 'player',
      currentHp: 100,
      maxHp: 100,
      cardCount: 5,
      goldCount: 50,
      hasImmunity: false,
      skillResistances: new Set<ZoneType>(),
    };

    const layerData = {
      layerNumber: 1,
      cells: [{
        id: 'target-cell',
        coordinate: [5, 5],
        type: 'battle',
        state: 'unlocked',
        zone: undefined,
      }],
      cellIndex: { 'target-cell': { id: 'target-cell', coordinate: [5, 5], zone: undefined } },
      zones: allZones,
    } as any;

    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      manager.applyEffectsOnEnter([5, 5], layerData, i + 1, context);
    }

    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;

    console.log(`[PERF] 6区叠�?× ${iterations}�? 总耗时 ${elapsed.toFixed(2)}ms, 平均 ${avgMs.toFixed(4)}ms/次`);

    expect(avgMs).toBeLessThan(5);
  });

  it('状态转换日�?000条后内存占用稳定', () => {
    // 创建大量格子
    const cellCount = 1100; // 超过 MAX_LOG_ENTRIES=1000
    const cells = Array.from({ length: cellCount }, (_, i) => ({
      id: `perf-cell-${i}`,
      coordinate: [Math.floor(i / 30), i % 30] as Coordinate2D,
      type: 'battle' as const,
      state: 'locked' as CellState, // 初始�?locked 状�?      levelId: `perf-level-${i}`,
      difficulty: 1,
      isCompleted: false,
    }));

    const sm = new CellStateMachine(cells as any);

    // 执行超过1000次转换（�?locked �?unlocked�?    const start = performance.now();

    for (let i = 0; i < cellCount; i++) {
      sm.requestTransition({
        cellId: `perf-cell-${i}`,
        targetState: 'unlocked' as CellState, // 转换到不同状�?        reason: 'layer_start' as any,
      });
    }

    const elapsed = performance.now() - start;

    // 验证日志被截�?    const history = sm.getTransitionHistory();
    console.log(`[PERF] ${cellCount}次转�? 耗时 ${elapsed.toFixed(2)}ms, 日志长度 ${history.length}`);

    expect(history.length).toBe(CellStateMachine.MAX_LOG_ENTRIES); // 应为1000

    // 验证 getTransitionHistory(limit) 正常工作
    const recent10 = sm.getTransitionHistory(10);
    expect(recent10.length).toBe(10);

    // 验证最新记录是最后执行的
    expect(recent10[9].cellId).toBe(`perf-cell-${cellCount - 1}`);
  });
});
