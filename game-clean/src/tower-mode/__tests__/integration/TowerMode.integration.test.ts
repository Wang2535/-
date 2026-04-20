import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TowerModeController } from '../../TowerModeController';
import { TowerModeGame } from '../../TowerModeGame';
import { GourdMapRenderer } from '../../components/GourdMapRenderer';
import { TypedEventBus, GameEventBus, eventBus, gameEventBus } from '../../EventBus';
import { assembleLayerTopology } from '../../utils/layerAssembler';
import { getGourdTopology } from '../../data/gourdTopologies';

describe('TowerMode 集成测试', () => {

  describe('F1.1 Controller-Renderer 协作', () => {
    it('创建 Controller 后能获取有效的 L1 topology', () => {
      const assembled = assembleLayerTopology(1);
      expect(assembled.topology).toBeDefined();
      expect(assembled.topology.layer).toBe(1);
      expect(assembled.topology.upperCircle.cellIds.length).toBeGreaterThan(0);
      expect(assembled.topology.lowerCircle.cellIds.length).toBeGreaterThan(0);
      expect(assembled.topology.connector.cellIds.length).toBeGreaterThan(0);
    });

    it('Controller 初始化后 phase 为 idle 或合理初始值', () => {
      const ctrl = new TowerModeController();
      expect(ctrl.getPhase()).toBe('idle');
    });

    it('GourdMapRenderer 能正确渲染 L1 topology', async () => {
      const assembled = assembleLayerTopology(1);
      render(
        React.createElement(GourdMapRenderer, {
          topology: assembled.topology,
          cells: [],
          pieceState: null,
        })
      );
      await waitFor(() => expect(document.querySelector('svg')).toBeTruthy(), { timeout: 5000 });
    }, 10000);
  });

  describe('F1.2 层级切换集成', () => {
    it('L1 和 L2 的 topology 结构不同', () => {
      const l1 = getGourdTopology(1);
      const l2 = getGourdTopology(2);
      expect(l1.layer).toBe(1);
      expect(l2.layer).toBe(2);
      expect(l1).not.toBe(l2);
      expect(l1.stats.cellsByType).toBeDefined();
      expect(l2.stats.cellsByType).toBeDefined();
    });

    it('dispose 后重建 Controller 正常工作', async () => {
      const ctrl1 = new TowerModeController();
      expect(ctrl1.getPhase()).toBe('idle');
      await ctrl1.initialize();
      expect(ctrl1.getPhase()).toBe('idle');
      await ctrl1.dispose();
      expect(ctrl1.getPhase()).toBe('idle');

      const ctrl2 = new TowerModeController();
      expect(ctrl2.getPhase()).toBe('idle');
      await ctrl2.initialize();
      expect(ctrl2.getPhase()).toBe('idle');
      const state = ctrl2.getRenderState();
      expect(state).toBeDefined();
      expect(state.phase).toBe('idle');
    });

    it.skip('loadLayer 方法不存在，层级切换通过 startNewGame 内部完成', () => {
      // TowerModeController 没有公开的 loadLayer/switchLayer 方法
      // loadLayerData 和 transitionToLayer 都是私有方法
      // 层级切换通过 startNewGame() 内部调用 loadLayerData(1) 完成
    });
  });

  describe('F1.3 事件总线集成', () => {
    it('TypedEventBus emit 事件后订阅者收到回调', () => {
      const bus = new TypedEventBus<any>();
      const callback = vi.fn();
      const unsub = bus.on('test:integration' as any, callback);
      bus.emit('test:integration' as any, { data: 'hello' });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'test:integration', data: 'hello' })
      );
      unsub();
    });

    it('GameEventBus 可以发布和订阅游戏事件', () => {
      const bus = new GameEventBus();
      const callback = vi.fn();
      const unsub = bus.on('state:change' as any, callback);
      bus.emit('state:change' as any, { state: { phase: 'playing' } });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ state: { phase: 'playing' } })
      );
      unsub();
    });

    it('全局 eventBus 单例可以跨组件通信', () => {
      const callback = vi.fn();
      const unsub = eventBus.on('STATE_CHANGE' as any, callback);
      eventBus.emit('STATE_CHANGE' as any, { state: { phase: 'playing' } });
      expect(callback).toHaveBeenCalled();
      unsub();
    });

    it('全局 gameEventBus 单例可以发布订阅', () => {
      const callback = vi.fn();
      const unsub = gameEventBus.on('position:change' as any, callback);
      gameEventBus.emit('position:change' as any, { fromCellId: 'U0', toCellId: 'U1' });
      expect(callback).toHaveBeenCalled();
      unsub();
    });

    it('removeAllListeners 清除所有订阅', () => {
      const bus = new TypedEventBus<any>();
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      bus.on('test:event' as any, cb1);
      bus.on('test:event' as any, cb2);
      bus.removeAllListeners();
      bus.emit('test:event' as any, {});
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).not.toHaveBeenCalled();
    });
  });

  describe('F1.4 Controller 完整生命周期', () => {
    it('initialize → startNewGame → getRenderState 链路', async () => {
      const ctrl = new TowerModeController();
      await ctrl.initialize();
      await ctrl.startNewGame(42);
      expect(ctrl.getPhase()).toBe('playing');
      const state = ctrl.getRenderState();
      expect(state).toBeDefined();
      expect(state.phase).toBe('playing');
      expect(state.playerStats.layer).toBe(1);
    });

    it('pause → resume 状态流转', async () => {
      const ctrl = new TowerModeController();
      await ctrl.initialize();
      await ctrl.startNewGame(42);
      expect(ctrl.getPhase()).toBe('playing');
      ctrl.pause();
      expect(ctrl.getPhase()).toBe('paused');
      ctrl.resume();
      expect(ctrl.getPhase()).toBe('playing');
    });

    it('openModal → closeModal 状态流转', async () => {
      const ctrl = new TowerModeController();
      await ctrl.initialize();
      await ctrl.startNewGame(42);
      ctrl.openModal('settings');
      expect(ctrl.getPhase()).toBe('ui_interaction');
      ctrl.closeModal();
      expect(ctrl.getPhase()).toBe('playing');
    });
  });

  describe.skip('F1.5 TowerClimbView 集成（待交付）', () => {
    it('TowerClimbView 不存在，此部分测试待A组交付后启用', () => {
      // it.skip
    });
  });

  describe.skip('F1.6 ShapeDrivenMapAdapter 集成（待交付）', () => {
    it('ShapeDrivenMapAdapter 不存在，此部分测试待交付后启用', () => {
      // it.skip
    });
  });
});
