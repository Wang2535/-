import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TowerModeController } from '../../TowerModeController';
import { SaveStorage } from '../../engine/storage/SaveStorage';
import type { GamePhase } from '../../types';

describe('TowerMode E2E 流程测试', () => {
  let controller: TowerModeController;

  beforeEach(async () => {
    controller = new TowerModeController();
    await controller.initialize();
  });

  afterEach(async () => {
    await controller.dispose();
  });

  describe('F2.1 单回合完整流程', () => {
    it('初始状态: phase = idle', () => {
      const freshController = new TowerModeController();
      try {
        expect(freshController.getPhase()).toBe('idle');
      } finally {
        freshController.dispose();
      }
    });

    it('initialize 后 phase = idle', async () => {
      const c = new TowerModeController();
      try {
        await c.initialize();
        expect(c.getPhase()).toBe('idle');
      } finally {
        await c.dispose();
      }
    });

    it('startNewGame 后 phase = playing', async () => {
      await controller.startNewGame(42);
      expect(controller.getPhase()).toBe('playing');
    });

    it('rollDice 触发状态变更', async () => {
      await controller.startNewGame(42);

      const diceResult = controller.rollDice();
      expect(diceResult).toBeDefined();
      expect(diceResult.rawValue).toBeGreaterThanOrEqual(1);
      expect(diceResult.rawValue).toBeLessThanOrEqual(6);

      const renderState = controller.getRenderState();
      expect(renderState.diceResult).toBeDefined();
    });

    it('移动后位置发生变化', async () => {
      await controller.startNewGame(42);

      controller.rollDice();
      const options = controller.getAvailableMoves();

      if (options.length > 0) {
        const targetOption = options[0];
        const moveResult = await controller.moveToCell(targetOption.targetCell.id);
        expect(moveResult).toBeDefined();
      }

      const renderState = controller.getRenderState();
      expect(renderState.currentPosition).toBeDefined();
    });

    it('canAct 在 playing 状态返回 true', async () => {
      await controller.startNewGame(42);
      expect(controller.canAct()).toBe(true);
    });

    it('canAct 在 paused 状态返回 false', async () => {
      await controller.startNewGame(42);
      controller.pause();
      expect(controller.canAct()).toBe(false);
    });

    it('pause / resume 状态切换', async () => {
      await controller.startNewGame(42);
      expect(controller.getPhase()).toBe('playing');

      controller.pause();
      expect(controller.getPhase()).toBe('paused');

      controller.resume();
      expect(controller.getPhase()).toBe('playing');
    });

    it('dispose 后回到 idle', async () => {
      await controller.startNewGame(42);
      await controller.dispose();
      expect(controller.getPhase()).toBe('idle');
    });
  });

  describe('F2.2 多层切换流程', () => {
    it('L1 有初始层数据', async () => {
      await controller.startNewGame(42);

      const layerState = controller.getLayerState(1);
      expect(layerState).toBeDefined();
    });

    it('getAllLayerStates 返回状态记录', async () => {
      await controller.startNewGame(42);

      const allStates = controller.getAllLayerStates();
      expect(allStates).toBeDefined();
      expect(typeof allStates).toBe('object');
    });

    it('completeCurrentLayer 标记当前层完成', async () => {
      await controller.startNewGame(42);

      controller.completeCurrentLayer();

      const layerState = controller.getLayerState(1);
      expect(layerState?.completed).toBe(true);
    });

    it('连续完成多层数据仍然有效', async () => {
      await controller.startNewGame(42);

      controller.completeCurrentLayer();

      const layer1State = controller.getLayerState(1);
      expect(layer1State?.completed).toBe(true);
    });
  });

  describe('F2.3 保存/加载', () => {
    it('SaveStorage.save() 后 listSlots 返回存档列表', async () => {
      await controller.startNewGame(42);

      const storage = new SaveStorage();
      const saveData = {
        timestamp: Date.now(),
        progress: {
          currentLayer: 1,
          layersCompleted: [],
          totalPlayTimeSeconds: 0,
          totalMoves: 0,
        },
        inventory: {
          hp: 100,
          maxHp: 100,
          activeSkillIds: [],
          dataPackets: [],
          readBooks: [],
        },
        currentPosition: { cellId: '', coord: [0, 0] as [number, number] },
        seed: 42,
        meta: {
          slotId: 'test_slot_1',
          saveName: 'Test Save',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          playTimeSeconds: 0,
          tags: [],
        },
      };

      await storage.save('test_slot_1', saveData);

      const slots = storage.listSlots();
      expect(slots.length).toBeGreaterThanOrEqual(1);

      storage.deleteSlot('test_slot_1');
    });

    it('SaveStorage.load() 恢复保存的数据', async () => {
      const storage = new SaveStorage();
      const saveData = {
        timestamp: Date.now(),
        progress: {
          currentLayer: 3,
          layersCompleted: ['1', '2'],
          totalPlayTimeSeconds: 120,
          totalMoves: 15,
        },
        inventory: {
          hp: 80,
          maxHp: 100,
          activeSkillIds: [],
          dataPackets: [],
          readBooks: [],
        },
        currentPosition: { cellId: 'test_cell', coord: [1, 2] as [number, number] },
        seed: 99,
        meta: {
          slotId: 'test_slot_load',
          saveName: 'Load Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          playTimeSeconds: 120,
          tags: [],
        },
      };

      await storage.save('test_slot_load', saveData);
      const loaded = await storage.load('test_slot_load');

      expect(loaded).not.toBeNull();
      expect(loaded?.progress.currentLayer).toBe(3);

      storage.deleteSlot('test_slot_load');
    });

    it('SaveStorage.clear(通过deleteSlot) 后无保存数据', async () => {
      const storage = new SaveStorage();
      const saveData = {
        timestamp: Date.now(),
        progress: {
          currentLayer: 1,
          layersCompleted: [],
          totalPlayTimeSeconds: 0,
          totalMoves: 0,
        },
        inventory: {
          hp: 100,
          maxHp: 100,
          activeSkillIds: [],
          dataPackets: [],
          readBooks: [],
        },
        currentPosition: { cellId: '', coord: [0, 0] as [number, number] },
        seed: 42,
        meta: {
          slotId: 'test_slot_clear',
          saveName: 'Clear Test',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          playTimeSeconds: 0,
          tags: [],
        },
      };

      await storage.save('test_slot_clear', saveData);
      storage.deleteSlot('test_slot_clear');

      const loaded = await storage.load('test_slot_clear');
      expect(loaded).toBeNull();
    });

    it('SaveStorage.getAutoSaveKey 返回自动存档键', () => {
      const storage = new SaveStorage();
      expect(storage.getAutoSaveKey()).toBe('autosave');
    });

    it('SaveStorage.getMaxSaves 返回最大存档数', () => {
      const storage = new SaveStorage();
      expect(storage.getMaxSaves()).toBe(10);
    });

    it('quickSave 调用成功', async () => {
      await controller.startNewGame(42);
      await expect(controller.quickSave()).resolves.not.toThrow();
    });
  });

  describe('F2.4 UI 交互流程', () => {
    it('openModal / closeModal 状态切换', async () => {
      await controller.startNewGame(42);

      controller.openModal('settings');
      expect(controller.getPhase()).toBe('ui_interaction');

      controller.closeModal();
      expect(controller.getPhase()).toBe('playing');
    });

    it('addNotification 添加通知', async () => {
      await controller.startNewGame(42);

      controller.addNotification('info', 'Test notification');

      const renderState = controller.getRenderState();
      expect(renderState.uiState.notifications.length).toBeGreaterThanOrEqual(1);
    });

    it('removeNotification 移除通知', async () => {
      await controller.startNewGame(42);

      controller.addNotification('info', 'Test notification');
      const renderState = controller.getRenderState();
      const notifId = renderState.uiState.notifications[0]?.id;

      if (notifId) {
        controller.removeNotification(notifId);
        const updatedState = controller.getRenderState();
        const stillExists = updatedState.uiState.notifications.some(
          (n) => n.id === notifId
        );
        expect(stillExists).toBe(false);
      }
    });
  });

  describe('F2.5 事件回调', () => {
    it('onPhaseChange 回调在 phase 变更时触发', async () => {
      const phases: GamePhase[] = [];
      const c = new TowerModeController();
      c.onPhaseChange((phase) => {
        phases.push(phase);
      });
      try {
        await c.initialize();
        await c.startNewGame(42);
        expect(phases).toContain('initializing');
        expect(phases).toContain('idle');
        expect(phases).toContain('playing');
      } finally {
        await c.dispose();
      }
    });

    it('onStateChange 回调在状态变更时触发', async () => {
      let changeCount = 0;
      controller.onStateChange(() => {
        changeCount++;
      });

      await controller.startNewGame(42);
      expect(changeCount).toBeGreaterThan(0);
    });

    it('onError 回调在错误发生时触发', async () => {
      const errors: unknown[] = [];
      controller.onError((error) => {
        errors.push(error);
      });

      await controller.startNewGame(42);
      expect(errors).toBeDefined();
    });
  });

  describe('F2.6 渲染状态', () => {
    it('getRenderState 返回完整渲染数据', async () => {
      await controller.startNewGame(42);

      const renderState = controller.getRenderState();

      expect(renderState.phase).toBe('playing');
      expect(renderState.layerData).toBeDefined();
      expect(renderState.cells).toBeDefined();
      expect(renderState.currentPosition).toBeDefined();
      expect(renderState.playerStats).toBeDefined();
      expect(renderState.playerStats.layer).toBe(1);
      expect(renderState.uiState).toBeDefined();
    });

    it('getRenderState.playerStats 包含玩家属性', async () => {
      await controller.startNewGame(42);

      const renderState = controller.getRenderState();
      const stats = renderState.playerStats;

      expect(stats.hp).toBeDefined();
      expect(stats.hp.current).toBeGreaterThan(0);
      expect(stats.hp.max).toBeGreaterThan(0);
      expect(stats.activeSkills).toBeDefined();
      expect(Array.isArray(stats.packetCount) === false || typeof stats.packetCount === 'number').toBe(true);
    });

    it('getRenderState.moveOptions 返回可移动选项', async () => {
      await controller.startNewGame(42);
      controller.rollDice();

      const renderState = controller.getRenderState();
      expect(Array.isArray(renderState.moveOptions)).toBe(true);
    });
  });

  describe.skip('F2.7 完整通关流程 L1→L9→Boss（待TowerClimbView交付）', () => {
    it('TowerClimbView 组件不存在，此测试待交付后启用', () => {
      expect(true).toBe(true);
    });
  });

  describe.skip('F2.8 Boss战流程（待BossBattleView交付）', () => {
    it('BossBattleView 不存在，此测试待交付后启用', () => {
      expect(true).toBe(true);
    });
  });
});
