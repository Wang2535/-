import { describe, it, expect, beforeEach } from 'vitest';
import {
  CellStateMachine,
  CellTypeDispatcher,
  CELL_STATE_TRANSITIONS,
} from '../../engine/CellStateMachine';
import type {
  GameCell,
  CellTriggerContext,
  TowerLayerData,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
  PreActionInfo,
} from '../../engine/CellStateMachine';

// ==================== 测试辅助数据 ====================

function createMockBattleCell(overrides?: Partial<BattleCell>): BattleCell {
  return {
    id: 'battle-1',
    coordinate: [0, 1],
    type: 'battle',
    state: 'locked',
    levelId: 'level-001',
    difficulty: 3,
    isCompleted: false,
    ...overrides,
  };
}

function createMockChanceCell(overrides?: Partial<ChanceCell>): ChanceCell {
  return {
    id: 'chance-1',
    coordinate: [1, 0],
    type: 'chance',
    state: 'locked',
    eventPoolIds: ['pool-1', 'pool-2'],
    currentVisitCount: 0,
    ...overrides,
  };
}

function createMockBookstoreCell(overrides?: Partial<BookstoreCell>): BookstoreCell {
  return {
    id: 'bookstore-1',
    coordinate: [2, 0],
    type: 'bookstore',
    state: 'locked',
    bookPoolTheme: 'virus',
    bookCountPerVisit: 3,
    ...overrides,
  };
}

function createMockSkillCell(overrides?: Partial<SkillCell>): SkillCell {
  return {
    id: 'skill-1',
    coordinate: [0, 2],
    type: 'skill',
    state: 'locked',
    tierProbabilityTable: { common: 60, rare: 30, epic: 10 },
    maxSkillSlots: 5,
    ...overrides,
  };
}

function createMockBossCell(overrides?: Partial<BossCell>): BossCell {
  return {
    id: 'boss-1',
    coordinate: [3, 3],
    type: 'boss',
    state: 'locked',
    bossLevelId: 'boss-level-001',
    isDefeated: false,
    enhancementLevel: 1,
    dataPacketPoolIds: ['dp-pool-1'],
    ...overrides,
  };
}

function createMockEndCell(overrides?: Partial<EndCell>): EndCell {
  return {
    id: 'end-1',
    coordinate: [4, 4],
    type: 'end',
    state: 'locked',
    destinationLayer: 2,
    ...overrides,
  };
}

function createMockContext(overrides?: Partial<CellTriggerContext>): CellTriggerContext {
  return {
    cell: createMockBattleCell(),
    playerPosition: [0, 0],
    turnNumber: 1,
    ...overrides,
  };
}

function createMockLayerData(cells: GameCell[], adjacencyList: Record<string, string[]>): TowerLayerData {
  const cellIndex: Record<string, GameCell> = {};
  for (const cell of cells) {
    cellIndex[cell.id] = cell;
  }
  return {
    layerNumber: 1,
    cells,
    cellIndex,
    adjacencyList,
    zones: [],
    startCellId: cells[0]?.id ?? '',
    bossCellId: '',
  };
}

// ==================== CellStateMachine 测试 ====================

describe('CellStateMachine', () => {
  let stateMachine: CellStateMachine;
  let testCells: GameCell[];

  beforeEach(() => {
    testCells = [
      createMockBattleCell({ id: 'cell-1', state: 'locked' }),
      createMockChanceCell({ id: 'cell-2', state: 'unlocked' }),
      createMockBookstoreCell({ id: 'cell-3', state: 'unlocked' }),
      createMockSkillCell({ id: 'cell-4', state: 'current' }),
      createMockBossCell({ id: 'cell-5', state: 'visited' }),
      createMockEndCell({ id: 'cell-6', state: 'completed' }),
    ];
    stateMachine = new CellStateMachine(testCells);
  });

  // ---------- 构造和初始�?----------
  describe('构造和初始�?, () => {
    it('应正确初始化格子状态映�?, () => {
      expect(stateMachine.getState('cell-1')).toBe('locked');
      expect(stateMachine.getState('cell-2')).toBe('unlocked');
      expect(stateMachine.getState('cell-3')).toBe('unlocked');
      expect(stateMachine.getState('cell-4')).toBe('current');
      expect(stateMachine.getState('cell-5')).toBe('visited');
      expect(stateMachine.getState('cell-6')).toBe('completed');
    });

    it('setInitialState 应清空并重新设置所有状�?, () => {
      const newCells = [
        createMockBattleCell({ id: 'new-cell-1', state: 'pending' }),
        createMockChanceCell({ id: 'new-cell-2', state: 'unlocked' }),
      ];
      stateMachine.setInitialState(newCells);

      // 原来的格子应该被清除
      expect(stateMachine.getState('cell-1')).toBe('locked'); // 默认�?      expect(stateMachine.getState('new-cell-1')).toBe('pending');
      expect(stateMachine.getState('new-cell-2')).toBe('unlocked');
    });
  });

  // ---------- getState ----------
  describe('getState', () => {
    it('返回已设置格子的正确状�?, () => {
      expect(stateMachine.getState('cell-1')).toBe('locked');
      expect(stateMachine.getState('cell-4')).toBe('current');
      expect(stateMachine.getState('cell-6')).toBe('completed');
    });

    it('对未注册格子返回 locked 默认�?, () => {
      expect(stateMachine.getState('non-existent-cell')).toBe('locked');
    });
  });

  // ---------- requestTransition - 核心转换测试 ----------
  describe('requestTransition', () => {
    it('locked �?unlocked (reason: neighbor_unlocked) 应成�?, () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-1',
        targetState: 'unlocked',
        reason: 'neighbor_unlocked',
      });

      expect(result.success).toBe(true);
      expect(result.previousState).toBe('locked');
      expect(result.newState).toBe('unlocked');
      expect(result.reason).toBe('neighbor_unlocked');
      expect(stateMachine.getState('cell-1')).toBe('unlocked');
    });

    it('unlocked �?current (reason: player_enter) 应成�?, () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-2',
        targetState: 'current',
        reason: 'player_enter',
      });

      expect(result.success).toBe(true);
      expect(result.previousState).toBe('unlocked');
      expect(result.newState).toBe('current');
      expect(stateMachine.getState('cell-2')).toBe('current');
    });

    it('current �?visited (reason: player_exit) 应成�?, () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-4',
        targetState: 'visited',
        reason: 'player_exit',
      });

      expect(result.success).toBe(true);
      expect(result.previousState).toBe('current');
      expect(result.newState).toBe('visited');
      expect(stateMachine.getState('cell-4')).toBe('visited');
    });

    it('visited �?completed (reason: battle_victory) 应成�?, () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-5',
        targetState: 'completed',
        reason: 'battle_victory',
      });

      expect(result.success).toBe(true);
      expect(result.previousState).toBe('visited');
      expect(result.newState).toBe('completed');
      expect(stateMachine.getState('cell-5')).toBe('completed');
    });

    it('visited �?unlocked (reason: battle_defeat) 应成功（重试机制�?, () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-5',
        targetState: 'unlocked',
        reason: 'battle_defeat',
      });

      expect(result.success).toBe(true);
      expect(result.previousState).toBe('visited');
      expect(result.newState).toBe('unlocked');
      expect(stateMachine.getState('cell-5')).toBe('unlocked');
    });

    it('completed �?任意状态应失败（终态）', () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-6',
        targetState: 'unlocked',
        reason: 'admin_force',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('非法转换');
      expect(stateMachine.getState('cell-6')).toBe('completed');
    });

    it('locked �?current 应失败（非法跳级�?, () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-1',
        targetState: 'current',
        reason: 'player_enter',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('非法转换');
      expect(stateMachine.getState('cell-1')).toBe('locked');
    });

    it('force=true 时应绕过规则校验', () => {
      const result = stateMachine.requestTransition({
        cellId: 'cell-6',
        targetState: 'locked',
        reason: 'admin_force',
        force: true,
      });

      expect(result.success).toBe(true);
      expect(result.newState).toBe('locked');
      expect(stateMachine.getState('cell-6')).toBe('locked');
    });
  });

  // ---------- handlePlayerEnter ----------
  describe('handlePlayerEnter', () => {
    it('unlocked 格子进入后变�?current', () => {
      const context = createMockContext({ cell: testCells[1] });
      const results = stateMachine.handlePlayerEnter('cell-2', context);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].newState).toBe('current');
      expect(stateMachine.getState('cell-2')).toBe('current');
    });

    it('�?unlocked 格子进入应返回错�?, () => {
      const context = createMockContext({ cell: testCells[0] }); // locked
      const results = stateMachine.handlePlayerEnter('cell-1', context);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].errorMessage).toContain('不是 unlocked');
    });

    it('转换结果应记录到日志', () => {
      const context = createMockContext({ cell: testCells[1] });
      stateMachine.handlePlayerEnter('cell-2', context);

      const history = stateMachine.getTransitionHistory();
      expect(history.length).toBeGreaterThanOrEqual(1);
      const lastEntry = history[history.length - 1];
      expect(lastEntry.cellId).toBe('cell-2');
      expect(lastEntry.newState).toBe('current');
    });
  });

  // ---------- handlePlayerExit ----------
  describe('handlePlayerExit', () => {
    it('current 格子离开后变�?visited', () => {
      const result = stateMachine.handlePlayerExit('cell-4');

      expect(result.success).toBe(true);
      expect(result.newState).toBe('visited');
      expect(stateMachine.getState('cell-4')).toBe('visited');
    });

    it('�?current 格子离开应返回错�?, () => {
      const result = stateMachine.handlePlayerExit('cell-2'); // unlocked

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('不是 current');
    });
  });

  // ---------- handleBattleComplete ----------
  describe('handleBattleComplete', () => {
    it('visited + victory=true �?completed', () => {
      const result = stateMachine.handleBattleComplete('cell-5', true);

      expect(result.success).toBe(true);
      expect(result.newState).toBe('completed');
      expect(stateMachine.getState('cell-5')).toBe('completed');
    });

    it('visited + victory=false �?unlocked（允许重试）', () => {
      const result = stateMachine.handleBattleComplete('cell-5', false);

      expect(result.success).toBe(true);
      expect(result.newState).toBe('unlocked');
      expect(stateMachine.getState('cell-5')).toBe('unlocked');
    });

    it('�?visited 状态应返回错误', () => {
      const result = stateMachine.handleBattleComplete('cell-1', true); // locked

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('不是 visited');
    });
  });

  // ---------- handleFunctionComplete ----------
  describe('handleFunctionComplete', () => {
    it('visited �?completed', () => {
      const result = stateMachine.handleFunctionComplete('cell-5');

      expect(result.success).toBe(true);
      expect(result.newState).toBe('completed');
      expect(stateMachine.getState('cell-5')).toBe('completed');
    });

    it('�?visited 状态应返回错误', () => {
      const result = stateMachine.handleFunctionComplete('cell-4'); // current

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('不是 visited');
    });
  });

  // ---------- unlockNeighbors ----------
  describe('unlockNeighbors', () => {
    it('正确解锁相邻�?locked 格子', () => {
      const neighborCell = createMockBattleCell({ id: 'neighbor-1', state: 'locked' });
      const cells = [
        createMockBattleCell({ id: 'source', state: 'current' }),
        neighborCell,
      ];
      const layerData = createMockLayerData(cells, {
        source: ['neighbor-1'],
      });

      const sm = new CellStateMachine(cells);
      const results = sm.unlockNeighbors('source', layerData);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].newState).toBe('unlocked');
      expect(sm.getState('neighbor-1')).toBe('unlocked');
    });

    it('已解锁的邻居不应重复操作', () => {
      const unlockedNeighbor = createMockChanceCell({ id: 'neighbor-2', state: 'unlocked' });
      const cells = [
        createMockBattleCell({ id: 'source', state: 'current' }),
        unlockedNeighbor,
      ];
      const layerData = createMockLayerData(cells, {
        source: ['neighbor-2'],
      });

      const sm = new CellStateMachine(cells);
      const results = sm.unlockNeighbors('source', layerData);

      // 已解锁的邻居不会被处�?      expect(results).toHaveLength(0);
    });

    it('无邻居时不报�?, () => {
      const cells = [createMockBattleCell({ id: 'source', state: 'current' })];
      const layerData = createMockLayerData(cells, {});

      const sm = new CellStateMachine(cells);
      const results = sm.unlockNeighbors('source', layerData);

      expect(results).toHaveLength(0);
    });
  });

  // ---------- canTrigger ----------
  describe('canTrigger', () => {
    it('unlocked �?current 状态返�?true', () => {
      expect(stateMachine.canTrigger('cell-2')).toBe(true); // unlocked
      expect(stateMachine.canTrigger('cell-4')).toBe(true); // current
    });

    it('其他状态返�?false', () => {
      expect(stateMachine.canTrigger('cell-1')).toBe(false); // locked
      expect(stateMachine.canTrigger('cell-5')).toBe(false); // visited
      expect(stateMachine.canTrigger('cell-6')).toBe(false); // completed
    });
  });

  // ---------- getCellsByState ----------
  describe('getCellsByState', () => {
    it('正确筛选指定状态的格子', () => {
      const unlockedCells = stateMachine.getCellsByState('unlocked');
      expect(unlockedCells).toEqual(['cell-2', 'cell-3']);

      const currentCells = stateMachine.getCellsByState('current');
      expect(currentCells).toEqual(['cell-4']);

      const visitedCells = stateMachine.getCellsByState('visited');
      expect(visitedCells).toEqual(['cell-5']);

      const completedCells = stateMachine.getCellsByState('completed');
      expect(completedCells).toEqual(['cell-6']);
    });
  });

  // ---------- resetCell ----------
  describe('resetCell', () => {
    it('admin_force 可将任意格子设为任意状�?, () => {
      // �?completed 重置�?locked
      const result = stateMachine.resetCell('cell-6', 'locked');

      expect(result.success).toBe(true);
      expect(result.reason).toBe('admin_force');
      expect(result.newState).toBe('locked');
      expect(stateMachine.getState('cell-6')).toBe('locked');

      // �?locked 设为 completed
      const result2 = stateMachine.resetCell('cell-1', 'completed');
      expect(result2.success).toBe(true);
      expect(result2.newState).toBe('completed');
      expect(stateMachine.getState('cell-1')).toBe('completed');
    });
  });

  // ---------- 转换日志 ----------
  describe('转换日志', () => {
    it('每次成功转换都记录到 transitionLog', () => {
      // 初始状态没有日�?      expect(stateMachine.getTransitionHistory()).toHaveLength(0);

      // 执行一次转�?      stateMachine.requestTransition({
        cellId: 'cell-1',
        targetState: 'unlocked',
        reason: 'neighbor_unlocked',
      });
      expect(stateMachine.getTransitionHistory()).toHaveLength(1);

      // 再执行一�?      stateMachine.requestTransition({
        cellId: 'cell-2',
        targetState: 'current',
        reason: 'player_enter',
      });
      expect(stateMachine.getTransitionHistory()).toHaveLength(2);
    });

    it('getTransitionHistory 返回不可变副�?, () => {
      stateMachine.requestTransition({
        cellId: 'cell-1',
        targetState: 'unlocked',
        reason: 'neighbor_unlocked',
      });

      const history = stateMachine.getTransitionHistory();
      const originalLength = history.length;

      // 尝试修改返回的数�?      (history as StateTransitionResult[]).push({} as StateTransitionResult);

      // 原始日志不应该被影响
      expect(stateMachine.getTransitionHistory().length).toBe(originalLength);
    });
  });
});

// ==================== CELL_STATE_TRANSITIONS 常量测试 ====================

describe('CELL_STATE_TRANSITIONS 状态转换规则矩�?, () => {
  it('应符合完整的状态转换规�?, () => {
    expect(CELL_STATE_TRANSITIONS.locked).toContain('unlocked');
    expect(CELL_STATE_TRANSITIONS.locked).toContain('pending');

    expect(CELL_STATE_TRANSITIONS.unlocked).toContain('current');

    expect(CELL_STATE_TRANSITIONS.current).toContain('visited');

    expect(CELL_STATE_TRANSITIONS.visited).toContain('completed');
    expect(CELL_STATE_TRANSITIONS.visited).toContain('unlocked');

    expect(CELL_STATE_TRANSITIONS.pending).toContain('unlocked');

    expect(CELL_STATE_TRANSITIONS.completed).toEqual([]);
  });
});

// ==================== CellTypeDispatcher 测试 ====================

describe('CellTypeDispatcher', () => {
  let dispatcher: CellTypeDispatcher;
  let context: CellTriggerContext;

  beforeEach(() => {
    dispatcher = new CellTypeDispatcher();
    context = createMockContext();
  });

  function verifyPreActionInfo(info: PreActionInfo | null, expected: {
    actionType: import('../../engine/CellStateMachine').CellType;
    canExecute: boolean;
    hasExpectedOutputs: boolean;
  }) {
    expect(info).not.toBeNull();
    if (!info) return;
    expect(info.actionType).toBe(expected.actionType);
    expect(info.canExecute).toBe(expected.canExecute);
    if (expected.hasExpectedOutputs) {
      expect(info.expectedOutputs.length).toBeGreaterThan(0);
    }
    expect(info.estimatedDurationMs).toBeGreaterThan(0);
    expect(typeof info.requiredInputs).toBe('object');
  }

  it('battle 类型返回正确�?PreActionInfo', () => {
    const battleCell = createMockBattleCell({ state: 'current', isCompleted: false });
    context.cell = battleCell;

    const result = dispatcher.dispatch(battleCell, context);
    verifyPreActionInfo(result, {
      actionType: 'battle',
      canExecute: true,
      hasExpectedOutputs: true,
    });

    expect(result!.requiredInputs.levelId).toBe(battleCell.levelId);
    expect(result!.requiredInputs.difficulty).toBe(battleCell.difficulty);
    expect(result!.expectedOutputs).toContain('victory');
    expect(result!.estimatedDurationMs).toBe(30000);
  });

  it('chance 类型返回正确�?PreActionInfo', () => {
    const chanceCell = createMockChanceCell({ state: 'current', visitLimit: 3, currentVisitCount: 1 });
    context.cell = chanceCell;

    const result = dispatcher.dispatch(chanceCell, context);
    verifyPreActionInfo(result, {
      actionType: 'chance',
      canExecute: true,
      hasExpectedOutputs: true,
    });

    expect(result!.requiredInputs.eventPoolIds).toEqual(chanceCell.eventPoolIds);
    expect(result!.expectedOutputs).toContain('event_result');
    expect(result!.estimatedDurationMs).toBe(5000);
  });

  it('bookstore 类型返回正确�?PreActionInfo', () => {
    const bookstoreCell = createMockBookstoreCell({ state: 'current' });
    context.cell = bookstoreCell;

    const result = dispatcher.dispatch(bookstoreCell, context);
    verifyPreActionInfo(result, {
      actionType: 'bookstore',
      canExecute: true,
      hasExpectedOutputs: true,
    });

    expect(result!.requiredInputs.theme).toBe(bookstoreCell.bookPoolTheme);
    expect(result!.requiredInputs.bookCount).toBe(bookstoreCell.bookCountPerVisit);
    expect(result!.expectedOutputs).toContain('books_acquired');
    expect(result!.estimatedDurationMs).toBe(8000);
  });

  it('skill 类型返回正确�?PreActionInfo', () => {
    const skillCell = createMockSkillCell({ state: 'current' });
    context.cell = skillCell;

    const result = dispatcher.dispatch(skillCell, context);
    verifyPreActionInfo(result, {
      actionType: 'skill',
      canExecute: true,
      hasExpectedOutputs: true,
    });

    expect(result!.requiredInputs.tierProbabilityTable).toEqual(skillCell.tierProbabilityTable);
    expect(result!.requiredInputs.maxSlots).toBe(skillCell.maxSkillSlots);
    expect(result!.expectedOutputs).toContain('skill_acquired');
    expect(result!.estimatedDurationMs).toBe(6000);
  });

  it('boss 类型返回正确�?PreActionInfo', () => {
    const bossCell = createMockBossCell({ state: 'current', isDefeated: false });
    context.cell = bossCell;

    const result = dispatcher.dispatch(bossCell, context);
    verifyPreActionInfo(result, {
      actionType: 'boss',
      canExecute: true,
      hasExpectedOutputs: true,
    });

    expect(result!.requiredInputs.bossLevelId).toBe(bossCell.bossLevelId);
    expect(result!.requiredInputs.enhancementLevel).toBe(bossCell.enhancementLevel);
    expect(result!.expectedOutputs).toContain('victory');
    expect(result!.estimatedDurationMs).toBe(60000);
  });

  it('end 类型返回正确�?PreActionInfo', () => {
    const endCell = createMockEndCell({ state: 'current' });
    context.cell = endCell;

    const result = dispatcher.dispatch(endCell, context);
    verifyPreActionInfo(result, {
      actionType: 'end',
      canExecute: true,
      hasExpectedOutputs: true,
    });

    expect(result!.requiredInputs.destinationLayer).toBe(endCell.destinationLayer);
    expect(result!.expectedOutputs).toContain('layer_transition');
    expect(result!.estimatedDurationMs).toBe(3000);
  });

  it('未知类型返回 null', () => {
    const unknownCell = { id: 'unknown', coordinate: [0, 0], type: 'start' as any, state: 'current' };
    context.cell = unknownCell as any;

    const result = dispatcher.dispatch(unknownCell as any, context);
    expect(result).toBeNull();
  });
});

// ==================== 日志截断机制测试 ====================

describe('日志截断机制', () => {
  it('日志超过 MAX_LOG_ENTRIES 时自动截�?, () => {
    // 创建一个有大量格子的状态机
    const cells = Array.from({ length: 1100 }, (_, i) => createMockBattleCell({ id: `cell-${i}` }));
    const sm = new CellStateMachine(cells);

    // 对每个格子执行一次转�?    cells.forEach(cell => {
      sm.requestTransition({
        cellId: cell.id,
        targetState: 'unlocked',
        reason: 'layer_start'
      });
    });

    // 日志不应超过 MAX_LOG_ENTRIES
    expect(sm.getTransitionHistory().length).toBeLessThanOrEqual(CellStateMachine.MAX_LOG_ENTRIES);
    // 应正好等�?MAX_LOG_ENTRIES (1000)
    expect(sm.getTransitionHistory().length).toBe(1000);
  });

  it('getTransitionHistory(limit) 返回指定数量的最近记�?, () => {
    const cells = [
      createMockBattleCell({ id: 'cell-a' }),
      createMockBattleCell({ id: 'cell-b' }),
      createMockBattleCell({ id: 'cell-c' }),
    ];
    const sm = new CellStateMachine(cells);

    sm.requestTransition({ cellId: 'cell-a', targetState: 'unlocked', reason: 'layer_start' });
    sm.requestTransition({ cellId: 'cell-b', targetState: 'unlocked', reason: 'layer_start' });
    sm.requestTransition({ cellId: 'cell-c', targetState: 'unlocked', reason: 'layer_start' });

    // 请求最�?�?    const recent = sm.getTransitionHistory(2);
    expect(recent.length).toBe(2);
    // 应该�?cell-b �?cell-c 的记�?    expect(recent[0].cellId).toBe('cell-b');
    expect(recent[1].cellId).toBe('cell-c');
  });

  it('getTransitionHistory() 不传 limit 返回全部', () => {
    const cells = [createMockBattleCell({ id: 'cell-1' })];
    const sm = new CellStateMachine(cells);
    sm.requestTransition({ cellId: 'cell-1', targetState: 'unlocked', reason: 'layer_start' });

    const all = sm.getTransitionHistory();
    expect(all.length).toBe(1);
  });
});
