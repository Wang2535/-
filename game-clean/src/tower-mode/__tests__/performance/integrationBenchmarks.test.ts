import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TowerModeController } from '../../TowerModeController';

describe('Integration Performance Benchmarks', () => {
  let controller: TowerModeController;

  beforeEach(async () => {
    controller = new TowerModeController();
    await controller.initialize();
  });

  afterEach(async () => {
    await controller.dispose();
  });

  it('state update completes within 16ms (60fps target)', async () => {
    await controller.startNewGame(42);

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      controller.getRenderState();
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / 100;

    expect(avgMs).toBeLessThan(16);
  });

  it('dice roll completes within 1ms', async () => {
    await controller.startNewGame(42);

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      try { controller.rollDice(); } catch {}
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / 100;

    expect(avgMs).toBeLessThan(1);
  });

  it('controller initialization completes within 200ms', async () => {
    const ctrl = new TowerModeController();
    const start = performance.now();
    await ctrl.initialize();
    const elapsed = performance.now() - start;

    await ctrl.dispose();
    expect(elapsed).toBeLessThan(200);
  });

  it('layer data loading completes within 50ms', async () => {
    await controller.startNewGame(42);

    const start = performance.now();
    const state = controller.getRenderState();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
    expect(state.layerData).toBeDefined();
  });
});
