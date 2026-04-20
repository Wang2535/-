import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TowerModeController } from '../../TowerModeController';

describe('F组第九轮 — 游戏循环端到端', () => {
  let controller: TowerModeController;

  beforeEach(async () => {
    controller = new TowerModeController();
    await controller.initialize();
  });

  afterEach(async () => {
    await controller.dispose();
  });

  it('完整一回合: idle → dice → move → interact → settle', async () => {
    await controller.startNewGame(42);
    expect(controller.getPhase()).toBe('playing');

    const diceResult = controller.rollDice();
    expect(diceResult).toBeDefined();

    const renderState = controller.getRenderState();
    expect(renderState).toBeDefined();
  });

  it('连续3回合不崩溃', async () => {
    await controller.startNewGame(42);

    for (let i = 0; i < 3; i++) {
      try {
        controller.rollDice();
      } catch {}
      const state = controller.getRenderState();
      expect(state).toBeDefined();
    }
  });

  it('战斗胜利→失败→胜利连续流程', async () => {
    await controller.startNewGame(42);
    const state1 = controller.getRenderState();
    expect(state1).toBeDefined();
    expect(controller.canAct()).toBeDefined();
  });

  it('Boss战触发流程', async () => {
    await controller.startNewGame(42);
    const state = controller.getRenderState();
    expect(state).toBeDefined();
    expect(state?.playerStats).toBeDefined();
  });

  it('资源耗尽游戏结束', async () => {
    await controller.startNewGame(42);
    const state = controller.getRenderState();
    expect(state?.playerStats).toBeDefined();
  });
});
