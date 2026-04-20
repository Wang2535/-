import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BattleIntegration } from '../battleIntegration';
import type { IBattlePlayerState, BattleResult, ICoreResources } from '../battleIntegration';
import type { GameCell, BattleCell, BossCell, Skill } from '../types';

function createMockPlayerState(overrides?: Partial<IBattlePlayerState>): IBattlePlayerState {
  return {
    technicalValue: 50,
    coreResources: { hp: 80, maxHp: 100, energy: 40, maxEnergy: 50, shield: 10 },
    gold: 200,
    cards: ['card_1', 'card_2'],
    skills: [{ id: 'skill_1', name: 'Test Skill', quality: 'common', triggerTiming: 'battle_start', effectType: 'damage_boost', effectDescription: 'test', iconDescription: 'test' }],
    equipmentBonus: { attackBonus: 5, defenseBonus: 3, speedBonus: 2 },
    clearedLevels: ['cell_battle_1'],
    failureHistory: {},
    ...overrides,
  };
}

function createMockBattleCell(): BattleCell {
  return {
    id: 'cell_battle_2',
    coordinate: [1, 0] as [number, number],
    type: 'battle',
    state: 'current',
    levelId: 'lv_battle_2',
    difficulty: 3,
    isCompleted: false,
  };
}

function createMockBossCell(): BossCell {
  return {
    id: 'cell_boss_1',
    coordinate: [5, 5] as [number, number],
    type: 'boss',
    state: 'current',
    bossLevelId: 'boss_lv_1',
    isDefeated: false,
    enhancementLevel: 2,
    dataPacketPoolIds: ['dp_1', 'dp_2'],
    layerNumber: 1,
  };
}

function createMockChanceCell(): GameCell {
  return {
    id: 'cell_chance_1',
    coordinate: [2, 0] as [number, number],
    type: 'chance',
    state: 'unlocked',
    eventPoolIds: ['pool_1'],
    currentVisitCount: 0,
  };
}

describe('BattleIntegration', () => {
  let battle: BattleIntegration;

  beforeEach(() => {
    battle = new BattleIntegration();
  });

  describe('setupBattle', () => {
    it('对BattleCell正确构建BattleSetup', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      const setup = battle.setupBattle(cell, playerState);
      expect(setup.isBossBattle).toBe(false);
      expect(setup.levelEntry.levelId).toBe('lv_battle_2');
      expect(setup.levelEntry.difficulty).toBe(3);
      expect(setup.bossConfig).toBeUndefined();
      expect(setup.playerResources.availableCards).toEqual(['card_1', 'card_2']);
      expect(setup.playerResources.currentTechnicalValue).toBe(50);
    });

    it('对BossCell正确构建BattleSetup含bossConfig', () => {
      const cell = createMockBossCell();
      const playerState = createMockPlayerState();
      const setup = battle.setupBattle(cell, playerState);
      expect(setup.isBossBattle).toBe(true);
      expect(setup.bossConfig).toBeDefined();
      expect(setup.bossConfig!.enhancementLevel).toBe(2);
      expect(setup.bossConfig!.hpMultiplier).toBe(2);
      expect(setup.bossConfig!.rewardDataPacketIds).toEqual(['dp_1', 'dp_2']);
      expect(setup.levelEntry.levelId).toBe('boss_lv_1');
    });

    it('对非战斗格子抛出错误', () => {
      const cell = createMockChanceCell();
      const playerState = createMockPlayerState();
      expect(() => battle.setupBattle(cell, playerState)).toThrow('非战斗格子无法准备战�?);
    });
  });

  describe('processBattleResult', () => {
    it('胜利时更新技术值和金币', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      const result: BattleResult = {
        victory: true,
        turnsUsed: 5,
        rewards: { technicalValueGain: 15, goldGain: 100, items: [], milestoneProgress: 0.1 },
        technicalValueChange: 15,
      };
      const updated = battle.processBattleResult(result, cell, playerState);
      expect(updated.technicalValue).toBe(65);
      expect(updated.gold).toBe(300);
      expect(updated.clearedLevels).toContain('cell_battle_2');
    });

    it('胜利时清除该格子的失败记�?, () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState({ failureHistory: { 'cell_battle_2': 2 } });
      const result: BattleResult = {
        victory: true,
        turnsUsed: 3,
        rewards: { technicalValueGain: 10, goldGain: 50, items: [], milestoneProgress: 0 },
        technicalValueChange: 10,
      };
      const updated = battle.processBattleResult(result, cell, playerState);
      expect(updated.failureHistory['cell_battle_2']).toBeUndefined();
    });

    it('失败时记录失败次�?, () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      const result: BattleResult = {
        victory: false,
        turnsUsed: 8,
        rewards: { technicalValueGain: 0, goldGain: 0, items: [], milestoneProgress: 0 },
        technicalValueChange: 0,
      };
      const updated = battle.processBattleResult(result, cell, playerState);
      expect(updated.failureHistory['cell_battle_2']).toBe(1);
      expect(updated.technicalValue).toBe(50);
      expect(updated.gold).toBe(200);
    });

    it('失败时累加失败次�?, () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState({ failureHistory: { 'cell_battle_2': 2 } });
      const result: BattleResult = {
        victory: false,
        turnsUsed: 6,
        rewards: { technicalValueGain: 0, goldGain: 0, items: [], milestoneProgress: 0 },
        technicalValueChange: 0,
      };
      const updated = battle.processBattleResult(result, cell, playerState);
      expect(updated.failureHistory['cell_battle_2']).toBe(3);
    });

    it('不修改原始playerState', () => {
      const cell = createMockBattleCell();
      const playerState = createMockPlayerState();
      const result: BattleResult = {
        victory: true,
        turnsUsed: 4,
        rewards: { technicalValueGain: 10, goldGain: 50, items: [], milestoneProgress: 0 },
        technicalValueChange: 10,
      };
      battle.processBattleResult(result, cell, playerState);
      expect(playerState.technicalValue).toBe(50);
      expect(playerState.gold).toBe(200);
    });
  });

  describe('calculateTechnicalValueChange', () => {
    it('失败时返�?', () => {
      const result: BattleResult = { victory: false, turnsUsed: 5, rewards: { technicalValueGain: 0, goldGain: 0, items: [], milestoneProgress: 0 }, technicalValueChange: 0 };
      expect(battle.calculateTechnicalValueChange(result, 1, false, false)).toBe(0);
    });

    it('普通战斗胜利L1返回基础�?0', () => {
      const result: BattleResult = { victory: true, turnsUsed: 3, rewards: { technicalValueGain: 10, goldGain: 50, items: [], milestoneProgress: 0 }, technicalValueChange: 10 };
      expect(battle.calculateTechnicalValueChange(result, 1, false, false)).toBe(10);
    });

    it('精英格战斗胜利L3含精英倍率', () => {
      const result: BattleResult = { victory: true, turnsUsed: 4, rewards: { technicalValueGain: 22, goldGain: 75, items: [], milestoneProgress: 0 }, technicalValueChange: 22 };
      const value = battle.calculateTechnicalValueChange(result, 3, false, true);
      expect(value).toBe(Math.floor(10 * 1.5 * 1.5));
    });

    it('Boss战斗胜利L5含Boss倍率', () => {
      const result: BattleResult = { victory: true, turnsUsed: 6, rewards: { technicalValueGain: 40, goldGain: 150, items: [], milestoneProgress: 0 }, technicalValueChange: 40 };
      const value = battle.calculateTechnicalValueChange(result, 5, true, false);
      expect(value).toBe(Math.floor(10 * 2.0 * 2.0));
    });

    it('L9最高层级系�?.0', () => {
      const result: BattleResult = { victory: true, turnsUsed: 5, rewards: { technicalValueGain: 30, goldGain: 100, items: [], milestoneProgress: 0 }, technicalValueChange: 30 };
      expect(battle.calculateTechnicalValueChange(result, 9, false, false)).toBe(30);
    });
  });
});
