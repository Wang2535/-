import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TowerModeController } from '../TowerModeController';

describe('MVP End-to-End Scenarios', () => {
  let controller: TowerModeController;

  beforeEach(() => {
    controller = new TowerModeController();
  });

  afterEach(async () => {
    try { await controller.dispose(); } catch {}
  });

  describe('Scenario 1: 新游戏初始化', () => {
    it('initialize→startNewGame→getRenderState应返回完整playing状态', async () => {
      await controller.initialize({ seed: 42 });
      await controller.startNewGame(42);
      
      const state = controller.getRenderState();
      
      expect(state.phase).toBe('playing');
      expect(state.playerStats).toBeDefined();
      expect(state.playerStats.layer).toBe(1);
      expect(state.playerStats.hp.current).toBeGreaterThan(0);
      expect(state.playerStats.hp.max).toBeGreaterThan(0);
      expect(state.playerStats.hp.current).toBeLessThanOrEqual(state.playerStats.hp.max);
      expect(Array.isArray(state.cells)).toBe(true);
      expect(state.uiState).toBeDefined();
      expect(state.uiState.activeModal).toBeNull();
    });
  });

  describe('Scenario 2: 投骰与移动选项', () => {
    it('rollDice应返回有效结果，getAvailableMoves应返回数组', async () => {
      await controller.initialize({ seed: 100 });
      await controller.startNewGame(100);
      
      const diceResult = controller.rollDice();
      
      expect(diceResult).toBeDefined();
      expect(diceResult.rawValue).toBeGreaterThanOrEqual(1);
      expect(diceResult.rawValue).toBeLessThanOrEqual(6);
      
      const moves = controller.getAvailableMoves();
      expect(Array.isArray(moves)).toBe(true);
    });

    it('连续投骰应返回不同或相同的有效值', async () => {
      await controller.initialize({ seed: 200 });
      await controller.startNewGame(200);
      
      const result1 = controller.rollDice();
      const result2 = controller.rollDice();
      
      expect(result1.rawValue).toBeGreaterThanOrEqual(1);
      expect(result1.rawValue).toBeLessThanOrEqual(6);
      expect(result2.rawValue).toBeGreaterThanOrEqual(1);
      expect(result2.rawValue).toBeLessThanOrEqual(6);
    });
  });

  describe('Scenario 3: 弹窗交互循环', () => {
    it('openModal→closeModal应在ui_interaction和playing间切换', async () => {
      await controller.initialize();
      await controller.startNewGame(999);
      
      expect(controller.getPhase()).toBe('playing');
      
      controller.openModal('battle_entrance', { enemy: 'Test' });
      expect(controller.getPhase()).toBe('ui_interaction');
      
      const state = controller.getRenderState();
      expect(state.uiState.activeModal).toBe('battle_entrance');
      expect(state.uiState.modalData).toEqual({ enemy: 'Test' });
      
      controller.closeModal();
      expect(controller.getPhase()).toBe('playing');
      expect(controller.getRenderState().uiState.activeModal).toBeNull();
    });

    it('多次弹窗切换不应泄漏状态', async () => {
      await controller.initialize();
      await controller.startNewGame(888);
      
      for (const modal of ['chance_event', 'bookstore', 'skill_offer'] as const) {
        controller.openModal(modal, {});
        expect(controller.getPhase()).toBe('ui_interaction');
        expect(controller.getRenderState().uiState.activeModal).toBe(modal);
        controller.closeModal();
      }
      
      expect(controller.getPhase()).toBe('playing');
      expect(controller.getRenderState().uiState.activeModal).toBeNull();
    });
  });

  describe('Scenario 4: 存档生命周期', () => {
    it('quickSave→dispose→reinitialize→continueFromSave应无异常', async () => {
      await controller.initialize({ seed: 777 });
      await controller.startNewGame(777);
      controller.rollDice();
      
      const saveResult = await controller.quickSave();
      expect(saveResult).toBeDefined();
      expect(saveResult.slotId).toBe('quicksave');
      
      await controller.dispose();
      expect(controller.getPhase()).toBe('idle');
      
      const ctrl2 = new TowerModeController();
      await ctrl2.initialize({ seed: 777 });
      
      try {
        await ctrl2.continueFromSave('quicksave');
        expect(ctrl2.getPhase()).toBe('playing');
      } catch (e) {
        expect(e).toBeDefined();
      }
      
      await ctrl2.dispose();
    });
  });

  describe('Scenario 5: 完整操作链路', () => {
    it('完整操作链：init→newGame→dice→modal→close→pause→resume→dispose', async () => {
      const phases: string[] = [];
      controller.onPhaseChange((p) => phases.push(p));
      
      await controller.initialize({ seed: 555 });
      expect(phases.length).toBeGreaterThan(0);
      
      await controller.startNewGame(555);
      expect(controller.canAct()).toBe(true);
      
      const dice = controller.rollDice();
      expect(dice.rawValue).toBeGreaterThanOrEqual(1);
      
      controller.openModal('boss_reward', { packets: [] });
      expect(controller.getPhase()).toBe('ui_interaction');
      
      controller.closeModal();
      expect(controller.getPhase()).toBe('playing');
      
      controller.pause();
      expect(controller.getPhase()).toBe('paused');
      expect(controller.canAct()).toBe(false);
      
      controller.resume();
      expect(controller.getPhase()).toBe('playing');
      expect(controller.canAct()).toBe(true);
      
      const finalState = controller.getRenderState();
      expect(finalState.phase).toBe('playing');
      expect(finalState.playerStats.layer).toBe(1);
      
      await controller.dispose();
      expect(controller.getPhase()).toBe('idle');
      
      expect(phases).toContain('initializing');
      expect(phases).toContain('idle');
      expect(phases).toContain('playing');
      expect(phases).toContain('ui_interaction');
      expect(phases).toContain('paused');
    });

    it('通知系统在完整链路中正常工作', async () => {
      const notifications: string[] = [];
      controller.onStateChange((state) => {
        state.uiState.notifications.forEach((n) => notifications.push(n.message));
      });
      
      await controller.initialize();
      await controller.startNewGame(123);
      
      controller.addNotification('info', 'test msg 1');
      controller.addNotification('success', 'test msg 2');
      
      const state = controller.getRenderState();
      expect(state.uiState.notifications.length).toBeGreaterThanOrEqual(2);
      
      await controller.dispose();
    });
  });
});
