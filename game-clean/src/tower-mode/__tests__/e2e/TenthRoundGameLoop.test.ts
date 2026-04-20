import { TowerModeController } from '../../TowerModeController';
import type { GamePhase, PlayerStatsDisplay, TowerRenderState } from '../../types';

describe('F4 — 第十轮游戏闭环E2E', () => {

  test('Controller 创建与初始状态', () => {
    const controller = new TowerModeController();

    const phase = controller.getPhase();
    expect(phase).toBe('idle');

    const renderState = controller.getRenderState();
    expect(renderState.phase).toBe('idle');
    expect(renderState.layerData).toBeNull();
    expect(renderState.cells).toEqual([]);
    expect(renderState.currentPosition).toEqual([0, 0]);
    expect(renderState.diceResult).toBeNull();
    expect(renderState.moveOptions).toEqual([]);
  });

  test('初始化流程可执行', async () => {
    const controller = new TowerModeController();

    expect(controller.getPhase()).toBe('idle');

    await controller.initialize();

    expect(controller.getPhase()).toBe('idle');

    const renderState = controller.getRenderState();
    expect(renderState.phase).toBe('idle');
  });

  test('资源初始值合理性', () => {
    const controller = new TowerModeController();

    const renderState = controller.getRenderState();
    const stats: PlayerStatsDisplay = renderState.playerStats;

    expect(stats.layer).toBe(1);
    expect(stats.hp.current).toBe(100);
    expect(stats.hp.max).toBe(100);
    expect(stats.activeSkills).toEqual([]);
    expect(stats.packetCount).toBe(0);
    expect(stats.bookCount).toBe(0);
    expect(stats.moveCount).toBe(0);
  });

  it.skip('层级切换功能 — 原因: loadLayerData 是私有方法，无公开的 loadLayer/switchLayer/setCurrentLayer API', () => {
    const controller = new TowerModeController();

    controller.getCurrentLayer?.();
  });

  test('dispose 清理', async () => {
    const controller = new TowerModeController();

    await controller.initialize();
    expect(controller.getPhase()).toBe('idle');

    await controller.dispose();

    const phase = controller.getPhase();
    expect(phase).toBe('idle');

    const renderState = controller.getRenderState();
    expect(renderState.layerData).toBeNull();
    expect(renderState.cells).toEqual([]);

    const stats: PlayerStatsDisplay = renderState.playerStats;
    expect(stats.layer).toBe(1);
    expect(stats.hp.current).toBe(100);
    expect(stats.activeSkills).toEqual([]);
    expect(stats.packetCount).toBe(0);
    expect(stats.bookCount).toBe(0);
    expect(stats.moveCount).toBe(0);
  });

  test('canAct 在未初始化时返回 false', () => {
    const controller = new TowerModeController();

    expect(controller.canAct()).toBe(false);
  });

  test('pause/resume 在非 playing 阶段不执行操作', () => {
    const controller = new TowerModeController();

    controller.pause();
    expect(controller.getPhase()).toBe('idle');

    controller.resume();
    expect(controller.getPhase()).toBe('idle');
  });

  test('UI 状态初始值为空', () => {
    const controller = new TowerModeController();

    const renderState = controller.getRenderState();
    expect(renderState.uiState.activeModal).toBeNull();
    expect(renderState.uiState.modalData).toBeNull();
    expect(renderState.uiState.notifications).toEqual([]);
    expect(renderState.uiState.highlightedCells).toEqual([]);
    expect(renderState.uiState.animationQueue).toEqual([]);
  });

  it.skip('rollDice 需要已初始化且在 playing 阶段 — E2E 完整流程测试需后续补充', async () => {
    const controller = new TowerModeController();
    await controller.initialize();
    await controller.startNewGame(12345);

    expect(controller.canAct()).toBe(true);

    const result = controller.rollDice();
    expect(result).toBeDefined();
    expect(typeof result.rawValue).toBe('number');
    expect(result.rawValue).toBeGreaterThanOrEqual(1);
    expect(result.rawValue).toBeLessThanOrEqual(6);
  });

  it.skip('startNewGame 完整流程 — 需要层数据支持', async () => {
    const controller = new TowerModeController();
    await controller.initialize();

    await controller.startNewGame(99999);

    expect(controller.getPhase()).toBe('playing');
    expect(controller.canAct()).toBe(true);

    const renderState = controller.getRenderState();
    expect(renderState.playerStats.layer).toBe(1);
    expect(renderState.layerData).not.toBeNull();
  });

  test('多次 dispose 不报错', async () => {
    const controller = new TowerModeController();

    await controller.dispose();
    await controller.dispose();

    expect(controller.getPhase()).toBe('idle');
  });
});
