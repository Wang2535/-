import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TowerModeController } from '../TowerModeController';

describe('Boundary Conditions - Controller Safety', () => {
  let controller: TowerModeController;

  beforeEach(() => {
    controller = new TowerModeController();
  });

  afterEach(async () => {
    try { await controller.dispose(); } catch {}
  });

  describe('未初始化操作防御', () => {
    it('rollDice before initialize should throw or return safe value', () => {
      expect(() => controller.rollDice()).toThrow();
    });

    it('moveToCell before initialize should throw', async () => {
      await expect(controller.moveToCell('any')).rejects.toThrow();
    });

    it('getRenderState before initialize returns valid structure', () => {
      const state = controller.getRenderState();
      expect(state).toBeDefined();
      expect(state.phase).toBe('idle');
      expect(state.playerStats).toBeDefined();
      expect(Array.isArray(state.cells)).toBe(true);
    });

    it('getPhase before initialize returns idle', () => {
      expect(controller.getPhase()).toBe('idle');
    });

    it('canAct before initialize returns false', () => {
      expect(controller.canAct()).toBe(false);
    });
  });

  describe('多次dispose安全性', () => {
    it('multiple dispose calls do not throw', async () => {
      await controller.initialize();
      await controller.dispose();
      await controller.dispose();
      await controller.dispose();
      expect(controller.getPhase()).toBe('idle');
    });
  });

  describe('空数据处理', () => {
    it('addNotification with empty message works', async () => {
      await controller.initialize();
      controller.addNotification('info', '');
      const state = controller.getRenderState();
      expect(state.uiState.notifications.length).toBeGreaterThanOrEqual(1);
    });

    it('openModal with null data works', async () => {
      await controller.initialize();
      controller.openModal('battle_entrance', null);
      expect(controller.getPhase()).toBe('ui_interaction');
    });

    it('closeModal when no modal open does not crash', async () => {
      await controller.initialize();
      controller.closeModal();
      expect(controller.getPhase()).toBe('idle');
    });
  });

  describe('pause/resume边界', () => {
    it('resume when not paused does nothing', async () => {
      await controller.initialize();
      await controller.startNewGame(999);
      controller.resume();
      expect(controller.getPhase()).toBe('playing');
    });

    it('pause when idle does nothing', async () => {
      await controller.initialize();
      controller.pause();
      expect(controller.getPhase()).not.toBe('paused');
    });
  });
});
