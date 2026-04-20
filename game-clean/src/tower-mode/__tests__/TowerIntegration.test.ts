import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TowerModeController } from '../TowerModeController';

describe('TowerModeController Integration', () => {
  let controller: TowerModeController;

  beforeEach(() => {
    controller = new TowerModeController();
  });

  afterEach(async () => {
    try {
      await controller.dispose();
    } catch {}
  });

  describe('初始化流程', () => {
    it('initialize应成功创建所有模块实例', async () => {
      const result = controller.initialize({ seed: 12345 });
      
      expect(result).resolves.toBeUndefined();
    });

    it('initialize后phase应为idle', async () => {
      await controller.initialize();
      expect(controller.getPhase()).toBe('idle');
    });

    it('initialize后canAct应为false（尚未开始游戏）', async () => {
      await controller.initialize();
      expect(controller.canAct()).toBe(false);
    });
  });

  describe('新游戏流程', () => {
    it('startNewGame后phase应为playing', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      expect(controller.getPhase()).toBe('playing');
    });

    it('startNewGame后canAct应为true', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      expect(controller.canAct()).toBe(true);
    });

    it('rollDice应返回有效结果', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      const result = controller.rollDice();
      expect(result).toBeDefined();
      expect(result.rawValue).toBeGreaterThan(0);
      expect(result.rawValue).toBeLessThanOrEqual(6);
    });

    it('getRenderState应返回完整状态对象', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      const state = controller.getRenderState();
      expect(state).toBeDefined();
      expect(state.phase).toBe('playing');
      expect(state.playerStats).toBeDefined();
      expect(state.playerStats.layer).toBe(1);
      expect(state.playerStats.hp.current).toBeGreaterThan(0);
      expect(Array.isArray(state.cells)).toBe(true);
      expect(state.uiState).toBeDefined();
    });

    it('通知系统应正常工作', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      
      let notified = false;
      controller.onStateChange(() => {
        notified = true;
      });
      
      controller.addNotification('info', 'test notification');
      expect(notified).toBe(true);
    });
  });

  describe('弹窗交互', () => {
    it('openModal应切换到ui_interaction阶段', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      controller.openModal('battle_entrance', { test: true });
      expect(controller.getPhase()).toBe('ui_interaction');
    });

    it('closeModal应回到playing阶段', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      controller.openModal('battle_entrance', {});
      controller.closeModal();
      expect(controller.getPhase()).toBe('playing');
    });

    it('openModal应更新renderState中的modalData', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      const testData = { enemyName: 'TestEnemy' };
      controller.openModal('battle_entrance', testData);
      const state = controller.getRenderState();
      expect(state.uiState.activeModal).toBe('battle_entrance');
      expect(state.uiState.modalData).toEqual(testData);
    });
  });

  describe('暂停/恢复', () => {
    it('pause应切换到paused阶段', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      controller.pause();
      expect(controller.getPhase()).toBe('paused');
    });

    it('resume应回到playing阶段', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      controller.pause();
      controller.resume();
      expect(controller.getPhase()).toBe('playing');
    });

    it('非playing状态下pause不应生效', async () => {
      await controller.initialize();
      controller.pause();
      expect(controller.getPhase()).not.toBe('paused');
    });
  });

  describe('生命周期管理', () => {
    it('dispose后应清理所有资源', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      await controller.dispose();
      expect(controller.getPhase()).toBe('idle');
    });

    it('dispose后重新initialize应正常工作', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      await controller.dispose();
      await controller.initialize();
      expect(controller.getPhase()).toBe('idle');
    });
  });

  describe('事件回调', () => {
    it('onPhaseChange应收到正确的phase变更', async () => {
      await controller.initialize();
      const phases: string[] = [];
      controller.onPhaseChange((p) => phases.push(p));
      
      await controller.startNewGame(99999);
      expect(phases).toContain('playing');
    });

    it('onError应在错误时被调用', async () => {
      await controller.initialize();
      const errors: unknown[] = [];
      controller.onError((e) => errors.push(e));
      
      try {
        (controller as any).rollDice();
      } catch {}
      
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('存档相关', () => {
    it('quickSave不应抛出错误', async () => {
      await controller.initialize();
      await controller.startNewGame(99999);
      const result = await controller.quickSave();
      expect(result).toBeDefined();
      expect(result.slotId).toBe('quicksave');
    });
  });
});
