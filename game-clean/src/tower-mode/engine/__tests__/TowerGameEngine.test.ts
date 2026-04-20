import { describe, it, expect, beforeEach } from 'vitest';
import { TowerGameEngine } from '../TowerGameEngine';
import { TypedEventBus } from '../../EventBus';
import type { TowerEventType } from '../../EventBus';
import type { DiceResult } from '../types/gameMechanics.types';
import type { RenderableEnrichedTopologyV3 } from '../types/renderableEnrichedTopology.types';

function createMockEventBus(): { bus: TypedEventBus<TowerEventType>; emitted: Array<{ type: string; data: any }> } {
  const bus = new TypedEventBus<TowerEventType>();
  const emitted: Array<{ type: string; data: any }> = [];
  const orig = bus.emit.bind(bus);
  (bus as any).emit = (type: string, data: any) => { emitted.push({ type, data }); };
  return { bus, emitted };
}

function createMockTopology(): RenderableEnrichedTopologyV3 {
  return {
    cells: [
      { id: 'cell_1', coordinate: [0, 0], type: 'battle', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false } as any,
      { id: 'cell_2', coordinate: [1, 0], type: 'chance', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false } as any,
      { id: 'cell_3', coordinate: [2, 0], type: 'bookstore', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false } as any,
    ],
    connections: [],
    cellInfoMap: new Map([
      ['cell_1', {
        cellId: 'cell_1', cellType: 'battle', name: '病毒实验�?,
        difficultyStars: 2, canEnter: true, canSkip: true,
      }],
      ['cell_2', {
        cellId: 'cell_2', cellType: 'chance', name: '随机事件',
        difficultyStars: 1, canEnter: true, canSkip: true,
      }],
      ['cell_3', {
        cellId: 'cell_3', cellType: 'bookstore', name: '数据书店',
        difficultyStars: 1, canEnter: true, canSkip: true,
      }],
    ]),
    layerMechanic: { type: 'acceleration', name: '扩散加�?, triggerCondition: '�?回合', effect: '加�?, visualHint: '脉冲' },
    activeZoneEffects: [],
    layerTheme: { name: '病毒实验�?, bgPrimary: '#0a1a0f', bgSecondary: '#0d2015', accentColor: '#44ff88', dangerColor: '#ff3333', diceSkin: { faceColor: '#1a3a1a', dotColor: '#44ff88', glowColor: '#22aa44' }, zoneColors: {}, particleStyle: 'virus', ambientAnim: 'pulse', specialMechanic: 'acceleration' },
    gourdShape: { neckRadius: 0.3, bodyRadius: 0.7, neckPosition: 0.5 } as any,
    svgPaths: {} as any,
    visualConfig: { zoneBackgrounds: {} } as any,
    border: {} as any,
    quadrantLabels: [],
    cellVisualStyles: new Map(),
    stateVisualOverrides: {},
    pathVisualStyles: {},
    zoneBackgrounds: {},
    background: { primary: '', secondary: '', gradient: '' },
    gourdCoordinates: {},
    decorations: [],
  } as any as RenderableEnrichedTopologyV3;
}

describe('TowerGameEngine', () => {
  let engine: TowerGameEngine;
  let mockBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    mockBus = createMockEventBus();
    engine = new TowerGameEngine(mockBus.bus);
  });

  describe('构造函数与初始�?, () => {
    it('初始状态正�?, () => {
      expect(engine.getPhase()).toBe('idle');
      expect(engine.getTechValue()).toBe(100);
      expect(engine.getGold()).toBe(0);
      expect(engine.getCurrentLayer()).toBe(1);
    });

    it('初始回合上下文正�?, () => {
      const ctx = engine.getTurnContext();
      expect(ctx.turnNumber).toBe(1);
      expect(ctx.phase).toBe('idle');
      expect(ctx.playerPosition).toBeNull();
    });
  });

  describe('setTopology', () => {
    it('设置拓扑后引擎可正常工作', () => {
      engine.setTopology(createMockTopology());
      expect(engine.rollDice()).toBeDefined();
    });
  });

  describe('startNewGame', () => {
    it('重置所有状�?, () => {
      engine.modifyTechValue(-50);
      engine.modifyGold(100);
      engine.startNewGame();
      expect(engine.getTechValue()).toBe(100);
      expect(engine.getGold()).toBe(0);
      expect(engine.getCurrentLayer()).toBe(1);
      expect(engine.getPhase()).toBe('idle');
    });

    it('发射game:new事件', () => {
      engine.startNewGame();
      expect(mockBus.emitted.some(e => e.type === 'game:new')).toBe(true);
    });
  });

  describe('rollDice', () => {
    it('返回有效DiceResult', () => {
      engine.setTopology(createMockTopology());
      for (let i = 0; i < 20; i++) {
        const result = engine.rollDice();
        expect(result.baseValue).toBeGreaterThanOrEqual(1);
        expect(result.baseValue).toBeLessThanOrEqual(6);
        expect(result.finalValue).toBeGreaterThanOrEqual(1);
        expect(result.modifiers).toBeDefined();
        expect(typeof result.isCritSuccess).toBe('boolean');
        expect(typeof result.isCritFail).toBe('boolean');
      }
    });

    it('投骰后phase变为dice_result', () => {
      engine.rollDice();
      expect(engine.getPhase()).toBe('dice_result');
    });

    it('发射dice:result事件', () => {
      engine.rollDice();
      expect(mockBus.emitted.some(e => e.type === 'dice:result')).toBe(true);
    });

    it('非idle状态投骰返回dummy结果', () => {
      engine.rollDice();
      const result = engine.rollDice();
      expect(result.baseValue).toBe(1);
      expect(result.finalValue).toBe(1);
    });
  });

  describe('资源管理', () => {
    it('modifyTechValue正确增减', () => {
      engine.modifyTechValue(15);
      expect(engine.getTechValue()).toBe(115);
      engine.modifyTechValue(-20);
      expect(engine.getTechValue()).toBe(95);
    });

    it('技术值不低于0', () => {
      engine.modifyTechValue(-200);
      expect(engine.getTechValue()).toBe(0);
    });

    it('技术值归零时发射game:over事件', () => {
      engine.modifyTechValue(-100);
      expect(mockBus.emitted.some(e => e.type === 'game:over')).toBe(true);
    });

    it('modifyGold正确增减', () => {
      engine.modifyGold(50);
      expect(engine.getGold()).toBe(50);
      engine.modifyGold(-20);
      expect(engine.getGold()).toBe(30);
    });

    it('资源变更时发射resource:change事件', () => {
      engine.modifyTechValue(10);
      expect(mockBus.emitted.some(e => e.type === 'resource:change')).toBe(true);
    });

    it('subscribeToResourceChange回调触发', () => {
      let receivedType = '';
      let receivedDelta = 0;
      engine.subscribeToResourceChange((type, delta) => {
        receivedType = type;
        receivedDelta = delta;
      });
      engine.modifyTechValue(25);
      expect(receivedType).toBe('tech');
      expect(receivedDelta).toBe(25);
    });
  });

  describe('格子交互', () => {
    it('enterCell对battle类型触发战斗', () => {
      engine.setTopology(createMockTopology());
      engine.enterCell('cell_1');
      expect(mockBus.emitted.some(e => e.type === 'battle:trigger')).toBe(true);
    });

    it('enterCell对bookstore类型触发书店', () => {
      engine.setTopology(createMockTopology());
      engine.enterCell('cell_3');
      expect(mockBus.emitted.some(e => e.type === 'bookstore:open')).toBe(true);
    });

    it('enterCell对chance类型触发事件', () => {
      engine.setTopology(createMockTopology());
      engine.enterCell('cell_2');
      expect(mockBus.emitted.some(e => e.type === 'event:trigger')).toBe(true);
    });

    it('skipCell发射cell:skip事件', () => {
      engine.skipCell('cell_1');
      expect(mockBus.emitted.some(e => e.type === 'cell:skip')).toBe(true);
    });

    it('settleCell发射cell:settled事件', () => {
      engine.settleCell('cell_1');
      expect(mockBus.emitted.some(e => e.type === 'cell:settled')).toBe(true);
    });
  });

  describe('战斗结果', () => {
    it('胜利时增加技术值和金币', () => {
      engine.onBattleResult(true);
      expect(engine.getTechValue()).toBeGreaterThan(100);
      expect(engine.getGold()).toBeGreaterThan(0);
    });

    it('失败时扣除技术�?, () => {
      const before = engine.getTechValue();
      engine.onBattleResult(false);
      expect(engine.getTechValue()).toBeLessThan(before);
    });

    it('胜利时发射cell:cleared事件', () => {
      engine.onBattleResult(true);
      expect(mockBus.emitted.some(e => e.type === 'cell:cleared')).toBe(true);
    });

    it('失败时发射cell:failed事件', () => {
      engine.onBattleResult(false);
      expect(mockBus.emitted.some(e => e.type === 'cell:failed')).toBe(true);
    });
  });

  describe('订阅机制', () => {
    it('subscribeToPhaseChange回调触发', () => {
      let receivedPhase: string = '';
      engine.subscribeToPhaseChange(p => { receivedPhase = p; });
      engine.rollDice();
      expect(receivedPhase).toBe('dice_result');
    });

    it('subscribeToDiceResult回调触发', () => {
      let received: DiceResult | null = null;
      engine.subscribeToDiceResult(r => { received = r; });
      engine.rollDice();
      expect(received).not.toBeNull();
      expect(received!.baseValue).toBeGreaterThanOrEqual(1);
    });

    it('取消订阅后不再触�?, () => {
      let count = 0;
      const unsub = engine.subscribeToPhaseChange(() => { count++; });
      engine.rollDice();
      const countAfterFirst = count;
      unsub();
      engine.startNewGame();
      engine.rollDice();
      expect(count).toBe(countAfterFirst);
    });
  });

  describe('getAvailablePaths', () => {
    it('无拓扑时返回空数�?, () => {
      expect(engine.getAvailablePaths()).toEqual([]);
    });
  });

  describe('selectPath', () => {
    it('无效路径索引返回false', () => {
      expect(engine.selectPath(99)).toBe(false);
    });
  });

  describe('getPieceState', () => {
    it('返回棋子状�?, () => {
      const state = engine.getPieceState();
      expect(state).toBeDefined();
      expect(state.isMoving).toBe(false);
    });
  });
});
