import { describe, it, expect, beforeEach } from 'vitest';
import { TowerGameStateManager } from '../towerGameState';
import type { TowerGameState } from '../towerGameState';
import type { TowerLayerData, GameCell, ZoneType } from '../types';

function createMockTopology(): TowerLayerData {
  const cells: GameCell[] = [
    { id: 'start', coordinate: [0, 0], type: 'start', state: 'unlocked' },
    { id: 'battle_1', coordinate: [0, 1], type: 'battle', state: 'unlocked', levelId: 'lv1', difficulty: 1, isCompleted: false },
    { id: 'chance_1', coordinate: [0, 2], type: 'chance', state: 'unlocked', eventPoolIds: ['pool1'], currentVisitCount: 0 },
    { id: 'bookstore_1', coordinate: [0, 3], type: 'bookstore', state: 'unlocked', bookPoolTheme: 'virus', bookCountPerVisit: 2 },
    { id: 'skill_1', coordinate: [0, 4], type: 'skill', state: 'unlocked', tierProbabilityTable: { common: 0.5, good: 0.3, rare: 0.15, epic: 0.04, legendary: 0.01 }, maxSkillSlots: 3 },
    { id: 'boss_1', coordinate: [0, 5], type: 'boss', state: 'locked', bossLevelId: 'boss_lv1', isDefeated: false, enhancementLevel: 1, dataPacketPoolIds: ['dp1'], layerNumber: 1 },
    { id: 'end_1', coordinate: [0, 6], type: 'end', state: 'locked', destinationLayer: 2 },
  ];
  const cellIndex: Record<string, GameCell> = {};
  for (const cell of cells) cellIndex[cell.id] = cell;

  return {
    layerNumber: 1,
    themeId: 'virus',
    shapeType: 'linear',
    shapeDescription: 'test',
    gridSize: { rows: 1, cols: 7 },
    totalCells: cells.length,
    cells,
    cellIndex,
    paths: [],
    adjacencyList: { start: ['battle_1'], battle_1: ['start', 'chance_1'], chance_1: ['battle_1', 'bookstore_1'], bookstore_1: ['chance_1', 'skill_1'], skill_1: ['bookstore_1', 'boss_1'], boss_1: ['skill_1', 'end_1'], end_1: ['boss_1'] },
    zones: [],
    zoneIndex: {} as any,
    startCellId: 'start',
    bossCellId: 'boss_1',
    endCellId: 'end_1',
    colorScheme: { primary: '#000', secondary: '#111', accent: '#222', background: '#333', pathColor: '#444', zoneColors: { W: '#fff', N: '#fff', I: '#fff', P: '#fff', S: '#fff', D: '#fff' } },
    ambientConfig: { lighting: 'normal', atmosphere: 'normal', particleEffects: [] },
  };
}

describe('TowerGameStateManager', () => {
  let manager: TowerGameStateManager;

  beforeEach(() => {
    manager = new TowerGameStateManager();
  });

  describe('initializeNewGame', () => {
    it('创建初始游戏状�?, () => {
      const state = manager.initializeNewGame();
      expect(state.currentLayer).toBe(1);
      expect(state.flipCount).toBe(0);
      expect(state.currentCellId).toBe('');
      expect(state.technicalValue).toBe(0);
      expect(state.gold).toBe(0);
      expect(state.cards).toEqual([]);
      expect(state.skills).toEqual([]);
      expect(state.dataPackets).toEqual([]);
      expect(state.booksRead).toEqual([]);
      expect(state.clearedLevels).toEqual([]);
      expect(state.failureHistory.size).toBe(0);
    });

    it('核心资源初始值正�?, () => {
      const state = manager.initializeNewGame();
      expect(state.coreResources.hp).toBe(100);
      expect(state.coreResources.maxHp).toBe(100);
      expect(state.coreResources.energy).toBe(50);
      expect(state.coreResources.maxEnergy).toBe(50);
      expect(state.coreResources.shield).toBe(0);
    });
  });

  describe('enterNewLayer', () => {
    it('更新当前层级', () => {
      manager.enterNewLayer(3);
      const state = manager.getState();
      expect(state.currentLayer).toBe(3);
    });

    it('重置翻转计数', () => {
      const topology = createMockTopology();
      manager.setMapTopology(topology);
      manager.handleLevelVictory('battle_1', 10);
      manager.handleLevelVictory('battle_2', 10);
      manager.handleLevelVictory('battle_3', 10);
      manager.enterNewLayer(2);
      const state = manager.getState();
      expect(state.flipCount).toBe(0);
    });

    it('传入topology时更新地图和起始位置', () => {
      const topology = createMockTopology();
      manager.enterNewLayer(2, topology);
      const state = manager.getState();
      expect(state.mapTopology).toBe(topology);
      expect(state.currentCellId).toBe('start');
    });
  });

  describe('updatePosition', () => {
    it('更新玩家位置', () => {
      manager.updatePosition('battle_1');
      expect(manager.getState().currentCellId).toBe('battle_1');
    });
  });

  describe('handleLevelVictory', () => {
    it('记录通关格子', () => {
      manager.handleLevelVictory('battle_1', 10);
      expect(manager.getState().clearedLevels).toContain('battle_1');
    });

    it('增加技术�?, () => {
      manager.handleLevelVictory('battle_1', 15);
      expect(manager.getState().technicalValue).toBe(15);
    });

    it('不重复记录已通关格子', () => {
      manager.handleLevelVictory('battle_1', 10);
      manager.handleLevelVictory('battle_1', 10);
      expect(manager.getState().clearedLevels.filter(id => id === 'battle_1').length).toBe(1);
    });

    it('通关数达�?且地图已设置时触发翻�?, () => {
      const topology = createMockTopology();
      manager.setMapTopology(topology);
      manager.handleLevelVictory('battle_1', 10);
      manager.handleLevelVictory('battle_2', 10);
      const flipResult = manager.handleLevelVictory('battle_3', 10);
      expect(flipResult).not.toBeNull();
      if (flipResult) {
        expect(flipResult.flipped).toBe(true);
      }
    });

    it('通关数未�?时不触发翻转', () => {
      const result = manager.handleLevelVictory('battle_1', 10);
      expect(result).toBeNull();
    });
  });

  describe('handleLevelFailure', () => {
    it('记录失败次数', () => {
      const check = manager.handleLevelFailure('battle_1');
      expect(manager.getState().failureHistory.get('battle_1')).toBe(1);
      expect(check.gameOver).toBe(false);
    });

    it('累加失败次数', () => {
      manager.handleLevelFailure('battle_1');
      manager.handleLevelFailure('battle_1');
      expect(manager.getState().failureHistory.get('battle_1')).toBe(2);
    });
  });

  describe('checkGameOver', () => {
    it('hp>0时游戏不结束', () => {
      expect(manager.checkGameOver().gameOver).toBe(false);
    });

    it('hp<=0时游戏结�?, () => {
      manager.updateCoreResources(r => ({ ...r, hp: 0 }));
      const check = manager.checkGameOver();
      expect(check.gameOver).toBe(true);
      expect(check.reason).toBe('生命值耗尽');
    });

    it('energy<=0且hp<30%时游戏结�?, () => {
      manager.updateCoreResources(r => ({ ...r, hp: 25, energy: 0 }));
      const check = manager.checkGameOver();
      expect(check.gameOver).toBe(true);
      expect(check.reason).toBe('核心资源耗尽');
    });

    it('energy<=0但hp>=30%时游戏不结束', () => {
      manager.updateCoreResources(r => ({ ...r, hp: 50, energy: 0 }));
      expect(manager.checkGameOver().gameOver).toBe(false);
    });
  });

  describe('资源操作方法', () => {
    it('addGold增加金币', () => {
      manager.addGold(100);
      expect(manager.getState().gold).toBe(100);
    });

    it('addCard添加卡牌（不重复�?, () => {
      manager.addCard('card_1');
      manager.addCard('card_1');
      manager.addCard('card_2');
      expect(manager.getState().cards).toEqual(['card_1', 'card_2']);
    });

    it('addSkill添加技�?, () => {
      const skill = { id: 'skill_1', name: 'Test', quality: 'common' as const, triggerTiming: 'battle_start' as const, effectType: 'damage_boost' as const, effectDescription: 'test', iconDescription: 'test' };
      manager.addSkill(skill);
      expect(manager.getState().skills.length).toBe(1);
    });
  });

  describe('getState返回深拷�?, () => {
    it('修改返回值不影响内部状�?, () => {
      const state = manager.getState();
      state.gold = 9999;
      expect(manager.getState().gold).toBe(0);
    });
  });
});
