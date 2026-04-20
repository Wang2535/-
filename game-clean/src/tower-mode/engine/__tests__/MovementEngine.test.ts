/**
 * MovementEngine 单元测试
 *
 * 测试覆盖:
 * - DiceSystem �? 骰子投掷、修改器应用、奖励投�? * - findReachableCells 函数: BFS 路径搜索
 * - MovementEngine �? 移动引擎核心功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MovementEngine,
  DiceSystem,
  findReachableCells,
  MOVEMENT_CONFIG,
} from '../../engine/MovementEngine';
import { ZoneEffectManager } from '../../engine/ZoneEffectManager';
import type {
  CellState,
  ZoneType,
  Coordinate2D,
  GameCell,
  TowerLayerData,
} from '../../engine/CellStateMachine';

// ============================================================
// 测试辅助工具
// ============================================================

/** 创建 Mock ZoneEffectManager */
function createMockZoneManager(diceModifier: number = 0): ZoneEffectManager {
  const mockManager = {
    getDiceModifier: vi.fn().mockReturnValue(diceModifier),
    detectZonesAtPosition: vi.fn().mockReturnValue([]),
    applyEffectsOnEnter: vi.fn().mockReturnValue({
      triggeredZones: [],
      diceModifier: 0,
      resourceChanges: [],
      specialEffects: [],
      globalEffectsApplied: [],
    }),
    isGlobalEffectActive: vi.fn().mockReturnValue(false),
    getActiveGlobalEffects: vi.fn().mockReturnValue([]),
    onTurnEnd: vi.fn(),
    forceTriggerZone: vi.fn(),
    resetAll: vi.fn(),
    getZoneStatistics: vi.fn(),
  } as unknown as ZoneEffectManager;

  return mockManager;
}

/** 创建测试用的塔层数据 (线�?A-B-C-D-E) */
function createMockLayerData(): TowerLayerData {
  const cells: GameCell[] = [
    {
      id: 'cell_A',
      coordinate: [0, 0],
      type: 'start',
      state: 'unlocked',
    },
    {
      id: 'cell_B',
      coordinate: [0, 1],
      type: 'battle',
      state: 'unlocked',
      zone: 'W' as ZoneType,
      levelId: 'battle_1',
      difficulty: 2,
      isCompleted: false,
    },
    {
      id: 'cell_C',
      coordinate: [0, 2],
      type: 'chance',
      state: 'unlocked',
      eventPoolIds: ['pool_1'],
      currentVisitCount: 0,
    },
    {
      id: 'cell_D',
      coordinate: [0, 3],
      type: 'bookstore',
      state: 'unlocked',
      zone: 'D' as ZoneType,
      bookPoolTheme: 'virus' as const,
      bookCountPerVisit: 1,
    },
    {
      id: 'cell_E',
      coordinate: [0, 4],
      type: 'skill',
      state: 'unlocked',
      tierProbabilityTable: {},
      maxSkillSlots: 3,
    },
    {
      id: 'cell_F',
      coordinate: [1, 0],
      type: 'battle',
      state: 'locked', // 锁定格子
      levelId: 'battle_2',
      difficulty: 3,
      isCompleted: false,
    },
  ];

  // cellIndex 同时支持 cellId 和坐标两�?key 格式
  const cellIndex: Record<string, GameCell> = {};
  cells.forEach(cell => {
    cellIndex[cell.id] = cell;
    cellIndex[`${cell.coordinate[0]},${cell.coordinate[1]}`] = cell;
  });

  const adjacencyList: Record<string, string[]> = {
    cell_A: ['cell_B'],
    cell_B: ['cell_A', 'cell_C'],
    cell_C: ['cell_B', 'cell_D'],
    cell_D: ['cell_C', 'cell_E'],
    cell_E: ['cell_D'],
    cell_F: ['cell_B'], // 锁定的分�?  };

  return {
    layerNumber: 1,
    cells,
    cellIndex,
    adjacencyList,
    zones: [],
    startCellId: 'cell_A',
    bossCellId: '',
  };
}

/** 创建带分支的塔层数据 */
function createBranchingLayerData(): TowerLayerData {
  const cells: GameCell[] = [
    {
      id: 'center',
      coordinate: [0, 0],
      type: 'start',
      state: 'unlocked',
    },
    {
      id: 'left',
      coordinate: [-1, 0],
      type: 'chance',
      state: 'unlocked',
      eventPoolIds: ['pool_1'],
      currentVisitCount: 0,
    },
    {
      id: 'right',
      coordinate: [1, 0],
      type: 'battle',
      state: 'unlocked',
      levelId: 'b1',
      difficulty: 2,
      isCompleted: false,
    },
    {
      id: 'far_left',
      coordinate: [-2, 0],
      type: 'skill',
      state: 'unlocked',
      tierProbabilityTable: {},
      maxSkillSlots: 2,
    },
    {
      id: 'far_right',
      coordinate: [2, 0],
      type: 'boss',
      state: 'unlocked',
      bossLevelId: 'boss_1',
      isDefeated: false,
      enhancementLevel: 0,
      dataPacketPoolIds: [],
    },
  ];

  // cellIndex 同时支持 cellId 和坐标两�?key 格式
  const cellIndex: Record<string, GameCell> = {};
  cells.forEach(cell => {
    cellIndex[cell.id] = cell;
    cellIndex[`${cell.coordinate[0]},${cell.coordinate[1]}`] = cell;
  });

  const adjacencyList: Record<string, string[]> = {
    center: ['left', 'right'],
    left: ['center', 'far_left'],
    right: ['center', 'far_right'],
    far_left: ['left'],
    far_right: ['right'],
  };

  return {
    layerNumber: 1,
    cells,
    cellIndex,
    adjacencyList,
    zones: [],
    startCellId: 'center',
    bossCellId: '',
  };
}

// ============================================================
// DiceSystem 测试
// ============================================================
describe('DiceSystem', () => {
  let diceSystem: DiceSystem;

  beforeEach(() => {
    diceSystem = new DiceSystem(6);
  });

  describe('roll()', () => {
    it('返回值在 [1, 6] 范围�?, () => {
      for (let i = 0; i < 100; i++) {
        const result = diceSystem.roll();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });

    it('使用自定�?rng 时返回确定�?, () => {
      const rng = vi.fn()
        .mockReturnValueOnce(0.0)   // 返回 1
        .mockReturnValueOnce(0.5)   // 返回 4
        .mockReturnValueOnce(0.99); // 返回 6

      expect(diceSystem.roll(rng)).toBe(1);
      expect(diceSystem.roll(rng)).toBe(4);
      expect(diceSystem.roll(rng)).toBe(6);
    });
  });

  describe('applyModifiers()', () => {
    it('正向修改器增�?modifiedValue', () => {
      const result = diceSystem.applyModifiers(3, [
        { source: 'test', delta: 2, description: '+2' },
      ]);

      expect(result.rawValue).toBe(3);
      expect(result.modifiedValue).toBe(5);
    });

    it('负向修改器减�?modifiedValue', () => {
      const result = diceSystem.applyModifiers(4, [
        { source: 'test', delta: -2, description: '-2' },
      ]);

      expect(result.rawValue).toBe(4);
      expect(result.modifiedValue).toBe(2);
    });

    it('结果不低�?MIN_DICE_VALUE(1)', () => {
      const result = diceSystem.applyModifiers(1, [
        { source: 'test', delta: -5, description: '-5' },
      ]);

      expect(result.modifiedValue).toBe(MOVEMENT_CONFIG.MIN_DICE_VALUE);
    });

    it('结果不高�?MAX_DICE_VALUE(6)', () => {
      const result = diceSystem.applyModifiers(6, [
        { source: 'test', delta: 5, description: '+5' },
      ]);

      expect(result.modifiedValue).toBe(MOVEMENT_CONFIG.MAX_DICE_VALUE);
    });
  });

  describe('rollWithBonus()', () => {
    it('返回两次投掷的较大�?, () => {
      const rng = vi.fn()
        .mockReturnValueOnce(0.0)   // 第一�?roll: 1
        .mockReturnValueOnce(0.5);  // 第二�?roll: 4

      const result = diceSystem.rollWithBonus(rng);

      expect(result.rawValue).toBe(4); // max(1, 4)
      expect(result.modifiedValue).toBe(4);
    });

    it('modifiers 标注 zone_S 来源', () => {
      const result = diceSystem.rollWithBonus(() => 0.5);

      expect(result.modifiers).toHaveLength(1);
      expect(result.modifiers[0].source).toBe('zone_S');
      expect(result.modifiers[0].description).toContain('额外投掷一次取最大�?);
    });
  });
});

// ============================================================
// findReachableCells 测试
// ============================================================
describe('findReachableCells', () => {
  let layerData: TowerLayerData;
  let cellStates: Map<string, CellState>;

  beforeEach(() => {
    layerData = createMockLayerData();
    cellStates = new Map<string, CellState>();
    layerData.cells.forEach(cell => {
      cellStates.set(cell.id, cell.state);
    });
  });

  it('maxDistance=0 时只有起点自身（但distance>0才入结果，所以应为空�?, () => {
    const results = findReachableCells('cell_A', 0, layerData, cellStates);

    expect(results).toHaveLength(0);
  });

  it('maxDistance=1 时返回距离为1的所有邻�?, () => {
    const results = findReachableCells('cell_A', 1, layerData, cellStates);

    expect(results).toHaveLength(1);
    expect(results[0].cell.id).toBe('cell_B');
    expect(results[0].distance).toBe(1);
  });

  it('正确跳过 locked 状态的格子', () => {
    const results = findReachableCells('cell_B', 1, layerData, cellStates);

    // cell_F �?locked 状态，不应该出现在结果�?    const lockedCell = results.find(r => r.cell.id === 'cell_F');
    expect(lockedCell).toBeUndefined();

    // �?cell_A �?cell_C 应该可达
    const reachableIds = results.map(r => r.cell.id);
    expect(reachableIds).toContain('cell_A');
    expect(reachableIds).toContain('cell_C');
  });

  it('遵循 adjacencyList 定义的连接关�?, () => {
    const results = findReachableCells('cell_A', 3, layerData, cellStates);

    const reachableIds = results.map(r => r.cell.id);

    // �?A 出发，按邻接表只能到�?B -> C -> D -> E
    expect(reachableIds).toContain('cell_B'); // distance 1
    expect(reachableIds).toContain('cell_C'); // distance 2
    expect(reachableIds).toContain('cell_D'); // distance 3
    expect(reachableIds).not.toContain('cell_E'); // distance 4 > 3
    expect(reachableIds).not.toContain('cell_F'); // locked 且不在主路径�?  });

  it('结果�?distance 升序排序', () => {
    const results = findReachableCells('cell_A', 4, layerData, cellStates);

    for (let i = 1; i < results.length; i++) {
      expect(results[i].distance).toBeGreaterThanOrEqual(results[i - 1].distance);
    }
  });

  it('path 包含正确的坐标序�?, () => {
    const results = findReachableCells('cell_A', 3, layerData, cellStates);

    // �?cell_C 的路径应该包含途经的坐�?    // BFS 路径: A -> B -> C, 所以到 C �?path �?[B坐标, C坐标]
    const cellCResult = results.find(r => r.cell.id === 'cell_C');
    expect(cellCResult).toBeDefined();
    // path 记录的是从起点到目标经过的所有中间格子的坐标（不包括起点�?    expect(cellCResult!.path.length).toBeGreaterThan(0);
    expect(cellCResult!.path[0]).toEqual([0, 1]); // cell_B 坐标
  });

  it('zoneWarnings 正确标记危险区域', () => {
    const results = findReachableCells('cell_A', 3, layerData, cellStates);

    // cell_B �?W 区，cell_D �?D �?    const cellBResult = results.find(r => r.cell.id === 'cell_B');
    expect(cellBResult!.zoneWarnings).toContain('W');

    const cellDResult = results.find(r => r.cell.id === 'cell_D');
    expect(cellDResult!.zoneWarnings).toContain('D');

    // cell_C 没有区域
    const cellCResult = results.find(r => r.cell.id === 'cell_C');
    expect(cellCResult!.zoneWarnings).toHaveLength(0);
  });
});

// ============================================================
// MovementEngine - 构造和初始�?测试
// ============================================================
describe('MovementEngine - 构造和初始�?, () => {
  it('constructor 接受 ZoneEffectManager', () => {
    const mockManager = createMockZoneManager();
    const engine = new MovementEngine(mockManager);

    expect(engine).toBeInstanceOf(MovementEngine);
  });

  it('loadLayerData 正确存储层数�?, () => {
    const engine = new MovementEngine(createMockZoneManager());
    const layerData = createMockLayerData();

    engine.loadLayerData(layerData);

    // 通过设置起始位置验证层数据已加载
    expect(() => engine.setStartPosition('cell_A')).not.toThrow();
  });

  it('setStartPosition 正确设置位置', () => {
    const engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());

    engine.setStartPosition('cell_A');

    const pos = engine.getCurrentPosition();
    expect(pos.coord).toEqual([0, 0]);
    expect(pos.cell.id).toBe('cell_A');
  });

  it('未加载层数据�?setStartPosition 抛错', () => {
    const engine = new MovementEngine(createMockZoneManager());

    expect(() => engine.setStartPosition('cell_A')).toThrow('未加载层数据');
  });
});

// ============================================================
// MovementEngine - rollDice 测试
// ============================================================
describe('MovementEngine - rollDice', () => {
  let engine: MovementEngine;
  let mockManager: ZoneEffectManager;

  beforeEach(() => {
    mockManager = createMockZoneManager(0);
    engine = new MovementEngine(mockManager);
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('返回 DiceRollResult 格式', () => {
    const result = engine.rollDice();

    expect(result).toHaveProperty('rawValue');
    expect(result).toHaveProperty('modifiedValue');
    expect(result).toHaveProperty('modifiers');
    expect(Array.isArray(result.modifiers)).toBe(true);
  });

  it('rawValue �?[1, 6] 范围', () => {
    for (let i = 0; i < 50; i++) {
      const result = engine.rollDice();
      expect(result.rawValue).toBeGreaterThanOrEqual(1);
      expect(result.rawValue).toBeLessThanOrEqual(6);
    }
  });

  it('触发 dice_rolled 事件', () => {
    const listener = vi.fn();
    engine.on('dice_rolled', listener);

    engine.rollDice();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        rawValue: expect.any(Number),
        modifiedValue: expect.any(Number),
      })
    );
  });

  it('extraRollAvailable=true 时使�?rollWithBonus', () => {
    // 设置 extraRollAvailable（通过反射或直接操作状态）
    (engine as any).state.extraRollAvailable = true;

    const result = engine.rollDice();

    // rollWithBonus 会添�?zone_S 修改�?    const hasBonusModifier = result.modifiers.some(m => m.source === 'zone_S');
    expect(hasBonusModifier).toBe(true);
  });
});

// ============================================================
// MovementEngine - getMoveOptions 测试
// ============================================================
describe('MovementEngine - getMoveOptions', () => {
  let engine: MovementEngine;

  beforeEach(() => {
    engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('返回正确�?MoveOption 数组', () => {
    const options = engine.getMoveOptions(2);

    // �?A 出发，距�?2 内可以到�?B(dist=1) �?C(dist=2)
    expect(options.length).toBeGreaterThan(0);

    const targetIds = options.map(opt => opt.targetCell.id);
    expect(targetIds).toContain('cell_B');
    expect(targetIds).toContain('cell_C');
  });

  it('每个 option 包含 targetCell/path/distance/zoneWarnings', () => {
    const options = engine.getMoveOptions(1);

    expect(options.length).toBeGreaterThan(0);

    for (const option of options) {
      expect(option).toHaveProperty('targetCell');
      expect(option).toHaveProperty('path');
      expect(option).toHaveProperty('distance');
      expect(option).toHaveProperty('zoneWarnings');
      expect(option).toHaveProperty('recommended');
      expect(option).toHaveProperty('riskScore');
    }
  });

  it('无层数据时返回空数组', () => {
    const emptyEngine = new MovementEngine(createMockZoneManager());
    // 不加载层数据

    const options = emptyEngine.getMoveOptions(3);

    expect(options).toHaveLength(0);
  });
});

// ============================================================
// MovementEngine - executeMove 测试
// ============================================================
describe('MovementEngine - executeMove', () => {
  let engine: MovementEngine;
  let mockManager: ZoneEffectManager;

  beforeEach(() => {
    mockManager = createMockZoneManager(0);
    engine = new MovementEngine(mockManager);
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('成功移动返回 success=true', async () => {
    const result = await engine.executeMove('cell_B');

    expect(result.success).toBe(true);
  });

  it('移动过程中依次触�?move_step 事件', async () => {
    const stepListener = vi.fn();
    engine.on('move_step', stepListener);

    await engine.executeMove('cell_B');

    // A -> B 应该�?1 步移�?    expect(stepListener).toHaveBeenCalledTimes(1);
    expect(stepListener).toHaveBeenCalledWith(
      expect.objectContaining({
        step: 1,
        coordinate: [0, 1], // cell_B 坐标
      })
    );
  });

  it('完成后触�?move_completed 事件', async () => {
    const completeListener = vi.fn();
    engine.on('move_completed', completeListener);

    const result = await engine.executeMove('cell_B');

    expect(completeListener).toHaveBeenCalledTimes(1);
    expect(completeListener).toHaveBeenCalledWith(result);
  });

  it('更新 currentPosition �?currentCellId', async () => {
    await engine.executeMove('cell_B');

    const pos = engine.getCurrentPosition();
    expect(pos.coord).toEqual([0, 1]);
    expect(pos.cell.id).toBe('cell_B');
  });

  it('记录�?moveHistory', async () => {
    expect(engine.getMoveHistory()).toHaveLength(0);

    await engine.executeMove('cell_B');

    expect(engine.getMoveHistory()).toHaveLength(1);
    const record = engine.getMoveHistory()[0];
    expect(record.from).toEqual([0, 0]); // cell_A
    expect(record.to).toEqual([0, 1]);   // cell_B
  });

  it('目标不存在时抛出错误', async () => {
    await expect(engine.executeMove('nonexistent_cell')).rejects.toThrow('不存�?);
  });

  it('正在移动中再次调用抛出错�?, async () => {
    // 直接设置 isMoving 状态模拟移动中（更可靠的方式）
    (engine as any).state.isMoving = true;

    // 尝试再次移动应抛错（executeMove �?async 函数，需�?rejects�?    await expect(engine.executeMove('cell_B')).rejects.toThrow('正在移动�?);

    // 清理状�?    (engine as any).state.isMoving = false;
  });

  it('skipNextTurn=true 时抛出错�?, async () => {
    // 设置 skipNextTurn
    (engine as any).state.skipNextTurn = true;

    await expect(engine.executeMove('cell_B')).rejects.toThrow('无法行动');
  });
});

// ============================================================
// MovementEngine - forceMove 测试
// ============================================================
describe('MovementEngine - forceMove', () => {
  let engine: MovementEngine;

  beforeEach(() => {
    engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('绕过骰子限制直接到达目标', async () => {
    const result = await engine.forceMove([0, 3], 'event_effect');

    expect(result.success).toBe(true);
    expect(result.toCell.coordinate).toEqual([0, 3]); // cell_D
  });

  it('返回 success=true', async () => {
    const result = await engine.forceMove([0, 2], 'skill_effect');

    expect(result.success).toBe(true);
  });

  it('diceRoll.rawValue �?0', async () => {
    const result = await engine.forceMove([0, 1], 'zone_teleport');

    expect(result.diceRoll.rawValue).toBe(0);
    expect(result.diceRoll.modifiedValue).toBe(0);
  });

  it('记录强制移动历史', async () => {
    expect(engine.getMoveHistory()).toHaveLength(0);

    await engine.forceMove([0, 2], 'admin_command');

    expect(engine.getMoveHistory()).toHaveLength(1);
    const record = engine.getMoveHistory()[0];
    expect(record.diceValue).toBe(0); // 强制移动骰子值为 0
    expect(record.from).toEqual([0, 0]);
    expect(record.to).toEqual([0, 2]);
  });
});

// ============================================================
// MovementEngine - cancelMove 测试
// ============================================================
describe('MovementEngine - cancelMove', () => {
  let engine: MovementEngine;

  beforeEach(() => {
    engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('移动中调用返�?true 并停止移�?, async () => {
    // 直接设置 isMoving 状态模拟移动中（更可靠的方式）
    (engine as any).state.isMoving = true;

    // 取消移动
    const cancelResult = engine.cancelMove();

    expect(cancelResult).toBe(true);

    // 验证 isMoving 已被重置
    expect((engine as any).state.isMoving).toBe(false);
  });

  it('非移动中调用返回 false', () => {
    const cancelResult = engine.cancelMove();

    expect(cancelResult).toBe(false);
  });

  it('触发 move_cancelled 事件', async () => {
    // 使用 fake timers 来控制时�?    vi.useFakeTimers();

    // Mock diceSystem.roll 确保返回足够的移动点数（executeMove 内部调用的是 diceSystem.roll 而非 rollDice�?    const mockRoll = vi.spyOn((engine as any).diceSystem, 'roll').mockReturnValue(3);

    try {
      const cancelListener = vi.fn();
      engine.on('move_cancelled', cancelListener);

      // 启动移动到较远格子（A->C 经过 B，会有动画延迟）
      const movePromise = engine.executeMove('cell_C', {
        duration: 10000,
        easing: 'linear',
      });

      // executeMove �?async 函数，调用后会立即执行到第一�?await
      // 此时 isMoving 已经被设置为 true
      // 取消移动
      engine.cancelMove();

      expect(cancelListener).toHaveBeenCalled();

      // 推进时间完成剩余的异步操�?      vi.advanceTimersByTime(10000);
      await movePromise.catch(() => {});
    } finally {
      mockRoll.mockRestore();
      vi.useRealTimers();
    }
  });
});

// ============================================================
// MovementEngine - canMove 测试
// ============================================================
describe('MovementEngine - canMove', () => {
  it('初始状态返�?true', () => {
    const engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');

    expect(engine.canMove()).toBe(true);
  });

  it('移动中返�?false', () => {
    const engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');

    // 直接设置 isMoving 状态模拟移动中（更可靠的方式）
    (engine as any).state.isMoving = true;

    expect(engine.canMove()).toBe(false);

    // 清理状�?    (engine as any).state.isMoving = false;
  });

  it('skipNextTurn 返回 false', () => {
    const engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');

    (engine as any).state.skipNextTurn = true;

    expect(engine.canMove()).toBe(false);
  });

  it('无层数据返回 false', () => {
    const engine = new MovementEngine(createMockZoneManager());
    // 不加载数�?
    expect(engine.canMove()).toBe(false);
  });
});

// ============================================================
// MovementEngine - 事件系统 测试
// ============================================================
describe('MovementEngine - 事件系统', () => {
  let engine: MovementEngine;

  beforeEach(() => {
    engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('on/off 正确注册和移除监听器', () => {
    const listener = vi.fn();

    engine.on('dice_rolled', listener);
    engine.rollDice();

    expect(listener).toHaveBeenCalledTimes(1);

    // 移除监听�?    engine.off('dice_rolled', listener);
    engine.rollDice();

    expect(listener).toHaveBeenCalledTimes(1); // 不应该再增加
  });

  it('同一事件可注册多个监听器', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    engine.on('dice_rolled', listener1);
    engine.on('dice_rolled', listener2);
    engine.rollDice();

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('emit 正确调用所有已注册处理�?, () => {
    const listeners = Array.from({ length: 5 }, () => vi.fn());

    listeners.forEach(listener => {
      engine.on('move_completed', listener);
    });

    // 手动触发一个完成事件（通过执行强制移动�?    engine.forceMove([0, 1], 'admin_command').then(() => {
      // 验证所有监听器都被调用
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });
});

// ============================================================
// MovementEngine - resetForNewTurn 测试
// ============================================================
describe('MovementEngine - resetForNewTurn', () => {
  let engine: MovementEngine;

  beforeEach(() => {
    engine = new MovementEngine(createMockZoneManager());
    engine.loadLayerData(createMockLayerData());
    engine.setStartPosition('cell_A');
  });

  it('重置 remainingMoves �?extraRollAvailable', () => {
    // 设置一些状�?    (engine as any).state.remainingMoves = 3;
    (engine as any).state.extraRollAvailable = true;

    engine.resetForNewTurn();

    expect((engine as any).state.remainingMoves).toBe(0);
    expect((engine as any).state.extraRollAvailable).toBe(false);
  });

  it('skipNextTurn=true 时触�?turn_skipped 事件', () => {
    const skipListener = vi.fn();
    engine.on('turn_skipped', skipListener);

    (engine as any).state.skipNextTurn = true;

    engine.resetForNewTurn();

    expect(skipListener).toHaveBeenCalledTimes(1);
    expect(skipListener).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'P区休整效�?,
      })
    );

    // skipNextTurn 应该被重置为 false
    expect((engine as any).state.skipNextTurn).toBe(false);
  });
});

// ============================================================
// MOVEMENT_CONFIG 常量测试
// ============================================================
describe('MOVEMENT_CONFIG', () => {
  it('包含正确的配置�?, () => {
    expect(MOVEMENT_CONFIG.DICE_SIDES).toBe(6);
    expect(MOVEMENT_CONFIG.MIN_DICE_VALUE).toBe(1);
    expect(MOVEMENT_CONFIG.MAX_DICE_VALUE).toBe(6);
    expect(MOVEMENT_CONFIG.MAX_REACHABLE_DISTANCE).toBe(10);
    expect(MOVEMENT_CONFIG.MOVE_ANIMATION_DURATION_MS).toBe(500);
    expect(MOVEMENT_CONFIG.DICE_ROLL_ANIMATION_MS).toBe(800);
  });
});

// ============================================================
// MovementEngine - 强化防重入守�?测试
// ============================================================
describe('强化防重入守�?, () => {
  let mockZoneManager: any;

  beforeEach(() => {
    mockZoneManager = {
      getDiceModifier: vi.fn().mockReturnValue(0),
      applyEffectsOnEnter: vi.fn().mockReturnValue({
        triggeredZones: [],
        diceModifier: 0,
        resourceChanges: [],
        specialEffects: [],
        globalEffectsApplied: [],
      }),
    };
  });

  it('executeMove 在移动中再次调用应抛出错�?, async () => {
    const layerData = createMockLayerData();
    const engine = new MovementEngine(mockZoneManager as any);
    engine.loadLayerData(layerData);
    engine.setStartPosition('cell_A');

    // 模拟长时间移动（通过 spy on executeMove 内部逻辑�?    // 直接设置 isMoving 状态模拟移动中
    (engine as any).state.isMoving = true;

    // 尝试再次移动应抛错（executeMove �?async 函数，需�?rejects�?    await expect(engine.executeMove('cell_C')).rejects.toThrow('正在移动�?);
  });

  it('forceMove 在移动中应抛出错�?, async () => {
    const layerData = createMockLayerData();
    const engine = new MovementEngine(mockZoneManager as any);
    engine.loadLayerData(layerData);
    engine.setStartPosition('cell_A');

    // 设置移动中状�?    (engine as any).state.isMoving = true;

    await expect(engine.forceMove([3, 0], 'event_effect')).rejects.toThrow('无法执行强制移动');
  });

  it('正常流程�?executeMove 完成�?isMoving 重置�?false', async () => {
    const layerData = createMockLayerData();
    const engine = new MovementEngine(mockZoneManager as any);
    engine.loadLayerData(layerData);
    engine.setStartPosition('cell_A');

    // 正常执行移动
    await engine.executeMove('cell_B');

    // 移动完成�?isMoving 应为 false
    expect((engine as any).state.isMoving).toBe(false);
  });
});
