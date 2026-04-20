import { describe, it, expect, beforeEach } from 'vitest';
import { BattleOrchestrator } from '../battleOrchestrator';
import type { IBattlePlayerState, BattleResult } from '../battleIntegration';
import { TypedEventBus } from '../../EventBus';
import type { TowerEventType } from '../../EventBus';
import type { GameCell, BattleCell, BossCell } from '../types';

function createMockEventBus(): { bus: TypedEventBus<TowerEventType>; emitted: Array<{ type: string; data: any }> } {
  const bus = new TypedEventBus<TowerEventType>();
  const emitted: Array<{ type: string; data: any }> = [];
  const orig = bus.emit.bind(bus);
  (bus as any).emit = (type: string, data: any) => { emitted.push({ type, data }); };
  return { bus, emitted };
}

function createMockPlayerState(): IBattlePlayerState {
  return {
    technicalValue: 50,
    coreResources: { hp: 80, maxHp: 100, energy: 40, maxEnergy: 50, shield: 10 },
    gold: 200,
    cards: ['card_1'],
    skills: [],
    equipmentBonus: { attackBonus: 5, defenseBonus: 3, speedBonus: 2 },
    clearedLevels: [],
    failureHistory: {},
  };
}

function createMockBattleCell(): BattleCell {
  return {
    id: 'cell_battle_1',
    coordinate: [1, 0],
    type: 'battle',
    state: 'current',
    levelId: 'lv_battle_1',
    difficulty: 3,
    isCompleted: false,
  };
}

function createMockBossCell(): BossCell {
  return {
    id: 'cell_boss_1',
    coordinate: [5, 5],
    type: 'boss',
    state: 'current',
    bossLevelId: 'boss_lv_1',
    isDefeated: false,
    enhancementLevel: 2,
    dataPacketPoolIds: ['dp_1'],
    layerNumber: 1,
  };
}

describe('BattleOrchestrator', () => {
  let orchestrator: BattleOrchestrator;
  let mockBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    mockBus = createMockEventBus();
    orchestrator = new BattleOrchestrator(mockBus.bus);
  });

  describe('prepareBattle', () => {
    it('准备战斗返回BattleSetup', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      const setup = orchestrator.prepareBattle(cell, playerState);
      expect(setup.isBossBattle).toBe(false);
      expect(setup.levelEntry.levelId).toBe('lv_battle_1');
    });

    it('发射battle:prepared事件', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      expect(mockBus.emitted.some(e => e.type === 'battle:prepared')).toBe(true);
    });

    it('Boss战斗准备', () => {
      const cell = createMockBossCell();
      const playerState = createMockPlayerState();
      const setup = orchestrator.prepareBattle(cell, playerState);
      expect(setup.isBossBattle).toBe(true);
    });

    it('状态变为prepared', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      expect(orchestrator.getBattleState().phase).toBe('prepared');
    });
  });

  describe('resolveBattle', () => {
    it('胜利时更新playerState', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      const result: BattleResult = {
        victory: true,
        turnsUsed: 5,
        rewards: { technicalValueGain: 15, goldGain: 100, items: [], milestoneProgress: 0 },
        technicalValueChange: 15,
      };
      const { updatedPlayerState, gameOverCheck } = orchestrator.resolveBattle(result, cell, playerState);
      expect(updatedPlayerState.technicalValue).toBe(65);
      expect(gameOverCheck.gameOver).toBe(false);
    });

    it('胜利时发射battle:resolved事件含victory=true', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      const result: BattleResult = {
        victory: true,
        turnsUsed: 3,
        rewards: { technicalValueGain: 10, goldGain: 50, items: [], milestoneProgress: 0 },
        technicalValueChange: 10,
      };
      orchestrator.resolveBattle(result, cell, playerState);
      const resolvedEvent = mockBus.emitted.find(e => e.type === 'battle:resolved');
      expect(resolvedEvent?.data.victory).toBe(true);
    });

    it('失败时记录失败历�?, () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      const result: BattleResult = {
        victory: false,
        turnsUsed: 8,
        rewards: { technicalValueGain: 0, goldGain: 0, items: [], milestoneProgress: 0 },
        technicalValueChange: 0,
      };
      const { updatedPlayerState } = orchestrator.resolveBattle(result, cell, playerState);
      expect(updatedPlayerState.failureHistory['cell_battle_1']).toBe(1);
    });

    it('失败时发射battle:resolved事件含victory=false', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      const result: BattleResult = {
        victory: false,
        turnsUsed: 8,
        rewards: { technicalValueGain: 0, goldGain: 0, items: [], milestoneProgress: 0 },
        technicalValueChange: 0,
      };
      orchestrator.resolveBattle(result, cell, playerState);
      const resolvedEvent = mockBus.emitted.find(e => e.type === 'battle:resolved');
      expect(resolvedEvent?.data.victory).toBe(false);
    });

    it('状态变为resolved', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      const result: BattleResult = {
        victory: true,
        turnsUsed: 3,
        rewards: { technicalValueGain: 10, goldGain: 50, items: [], milestoneProgress: 0 },
        technicalValueChange: 10,
      };
      orchestrator.resolveBattle(result, cell, playerState);
      expect(orchestrator.getBattleState().phase).toBe('resolved');
    });
  });

  describe('retreatBattle', () => {
    it('撤退记录失败历史', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      const updated = orchestrator.retreatBattle(cell, playerState);
      expect(updated.failureHistory['cell_battle_1']).toBe(1);
    });

    it('发射battle:retreated事件', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.retreatBattle(cell, playerState);
      expect(mockBus.emitted.some(e => e.type === 'battle:retreated')).toBe(true);
    });
  });

  describe('getBattleState', () => {
    it('初始状态为idle', () => {
      expect(orchestrator.getBattleState().phase).toBe('idle');
    });
  });

  describe('reset', () => {
    it('重置状�?, () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      orchestrator.prepareBattle(cell, playerState);
      orchestrator.reset();
      expect(orchestrator.getBattleState().phase).toBe('idle');
      expect(orchestrator.getBattleState().currentSetup).toBeNull();
    });
  });
});
