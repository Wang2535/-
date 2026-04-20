import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TowerModeController } from '../../TowerModeController';
import { FullGameFlowController } from '../../gameFlow/fullGameFlow';
import { runBootstrap, validateBootstrapOrder, BOOTSTRAP_SEQUENCE } from '../../gameFlow/bootstrapSequence';
import { classifyError, getErrorRule } from '../../errorHandling/errorPropagation';
import { gameEventBus, eventBus } from '../../EventBus';
import type { ModuleError, ErrorHandlingRule } from '../../errorHandling/errorPropagation';

describe('Integration E2E', () => {
  afterEach(() => {
    gameEventBus.removeAllListeners();
    eventBus.removeAllListeners();
  });

  describe('Bootstrap sequence validation', () => {
    it('runBootstrap should complete all steps successfully', () => {
      const result = runBootstrap();

      expect(result.success).toBe(true);
      expect(result.completedSteps).toHaveLength(BOOTSTRAP_SEQUENCE.length);
      expect(result.failedStep).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('validateBootstrapOrder should validate dependency order', () => {
      // A-types has no dependencies, so it can be first
      expect(validateBootstrapOrder([], 'A-types')).toBe(true);

      // B-mapData depends on A-types
      expect(validateBootstrapOrder([], 'B-mapData')).toBe(false);
      expect(validateBootstrapOrder(['A-types'], 'B-mapData')).toBe(true);

      // C-levelData depends on A-types and B-mapData
      expect(validateBootstrapOrder(['A-types'], 'C-levelData')).toBe(false);
      expect(validateBootstrapOrder(['A-types', 'B-mapData'], 'C-levelData')).toBe(true);

      // D-engine depends on A-types and C-levelData
      expect(validateBootstrapOrder(['A-types', 'B-mapData'], 'D-engine')).toBe(false);
      expect(validateBootstrapOrder(['A-types', 'C-levelData'], 'D-engine')).toBe(true);

      // E-ui depends on A-types, C-levelData, B-visualConfig
      expect(validateBootstrapOrder(['A-types', 'C-levelData'], 'E-ui')).toBe(false);
      expect(validateBootstrapOrder(['A-types', 'C-levelData', 'B-visualConfig'], 'E-ui')).toBe(true);

      // F-flow depends on all previous steps
      expect(validateBootstrapOrder(['A-types', 'B-mapData', 'C-levelData', 'D-engine'], 'F-flow')).toBe(false);
      expect(validateBootstrapOrder(['A-types', 'B-mapData', 'C-levelData', 'D-engine', 'E-ui'], 'F-flow')).toBe(true);
    });

    it('validateBootstrapOrder should reject unknown steps', () => {
      expect(validateBootstrapOrder([], 'unknown-step')).toBe(false);
    });

    it('bootstrap sequence steps have correct dependency chain', () => {
      // Verify the sequence is ordered correctly
      const completedInOrder: string[] = [];
      for (const step of BOOTSTRAP_SEQUENCE) {
        const depsMet = step.dependencies.every(dep => completedInOrder.includes(dep));
        expect(depsMet).toBe(true);
        completedInOrder.push(step.id);
      }
    });
  });

  describe('Error propagation and recovery', () => {
    it('classifyError should classify type errors as group A', () => {
      const error = classifyError(new Error('type mismatch error'));
      expect(error.source).toBe('A');
      expect(error.code).toBe('A_TYPE_ERROR');
      expect(error.recoverable).toBe(false);
    });

    it('classifyError should classify map errors as group B', () => {
      const error = classifyError(new Error('map topology invalid'));
      expect(error.source).toBe('B');
      expect(error.code).toBe('B_MAP_INVALID');
      expect(error.recoverable).toBe(true);
    });

    it('classifyError should classify assignment errors as group C', () => {
      const error = classifyError(new Error('level assignment failed'));
      expect(error.source).toBe('C');
      expect(error.code).toBe('C_ASSIGNMENT_FAILED');
      expect(error.recoverable).toBe(true);
    });

    it('classifyError should classify engine errors as group D', () => {
      const error = classifyError(new Error('engine movement error'));
      expect(error.source).toBe('D');
      expect(error.code).toBe('D_ENGINE_ERROR');
      expect(error.recoverable).toBe(true);
    });

    it('classifyError should classify render errors as group E', () => {
      const error = classifyError(new Error('render component failed'));
      expect(error.source).toBe('E');
      expect(error.code).toBe('E_RENDER_ERROR');
      expect(error.recoverable).toBe(true);
    });

    it('classifyError should classify unknown errors as group D with UNKNOWN_ERROR', () => {
      const error = classifyError(new Error('something unexpected happened'));
      expect(error.source).toBe('D');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.recoverable).toBe(true);
    });

    it('getErrorRule should return correct rules for known error codes', () => {
      const typeRule = getErrorRule('A_TYPE_ERROR');
      expect(typeRule.recoverable).toBe(false);
      expect(typeRule.action).toBe('HALT');

      const mapRule = getErrorRule('B_MAP_INVALID');
      expect(mapRule.recoverable).toBe(true);
      expect(mapRule.action).toBe('FALLBACK_MAP');
      expect(mapRule.maxRetries).toBe(1);

      const assignRule = getErrorRule('C_ASSIGNMENT_FAILED');
      expect(assignRule.recoverable).toBe(true);
      expect(assignRule.action).toBe('REASSIGN');
      expect(assignRule.maxRetries).toBe(3);

      const engineRule = getErrorRule('D_ENGINE_ERROR');
      expect(engineRule.recoverable).toBe(true);
      expect(engineRule.action).toBe('ROLLBACK_STATE');
      expect(engineRule.maxRetries).toBe(2);

      const renderRule = getErrorRule('E_RENDER_ERROR');
      expect(renderRule.recoverable).toBe(true);
      expect(renderRule.action).toBe('FALLBACK_RENDER');
      expect(renderRule.maxRetries).toBe(1);
    });

    it('getErrorRule should return default rule for unknown error codes', () => {
      const rule = getErrorRule('UNKNOWN_CODE');
      expect(rule.recoverable).toBe(true);
      expect(rule.action).toBe('RETRY');
      expect(rule.maxRetries).toBe(1);
    });

    it('error propagation through controller onError callback', async () => {
      const controller = new TowerModeController();
      await controller.initialize();

      const errors: unknown[] = [];
      controller.onError((e) => errors.push(e));

      // Trigger an error by attempting an invalid operation
      try {
        (controller as any).handleError({
          code: 'B_MAP_INVALID',
          message: 'Test map error',
          module: 'TestModule',
          recoverable: true,
        });
      } catch {}

      expect(errors.length).toBeGreaterThan(0);

      await controller.dispose();
    });
  });

  describe('Event bus bridging (old to new events)', () => {
    it('BATTLE_END old event should bridge to battle:end new event', async () => {
      const controller = new TowerModeController();
      await controller.initialize();
      await controller.startNewGame(42);

      const newEvents: unknown[] = [];
      gameEventBus.on('battle:end', (data) => {
        newEvents.push(data);
      });

      // Emit old-style BATTLE_END event
      eventBus.emit('BATTLE_END', { type: 'BATTLE_END', victory: true, rewards: [] });

      // The bridge in TowerModeController should forward to gameEventBus
      expect(newEvents.length).toBeGreaterThanOrEqual(1);

      await controller.dispose();
    });

    it('MOVE_COMPLETE old event should bridge to position:change new event', async () => {
      const controller = new TowerModeController();
      await controller.initialize();
      await controller.startNewGame(42);

      const newEvents: unknown[] = [];
      gameEventBus.on('position:change', (data) => {
        newEvents.push(data);
      });

      // Emit old-style MOVE_COMPLETE event
      eventBus.emit('MOVE_COMPLETE', { type: 'MOVE_COMPLETE', from: 'cell_1', to: 'cell_2', diceResult: 3 });

      expect(newEvents.length).toBeGreaterThanOrEqual(1);

      await controller.dispose();
    });

    it('LAYER_COMPLETE old event should bridge to layer:transition new event', async () => {
      const controller = new TowerModeController();
      await controller.initialize();
      await controller.startNewGame(42);

      const newEvents: unknown[] = [];
      gameEventBus.on('layer:transition', (data) => {
        newEvents.push(data);
      });

      // Emit old-style LAYER_COMPLETE event
      eventBus.emit('LAYER_COMPLETE', { type: 'LAYER_COMPLETE', layerNumber: 1 });

      expect(newEvents.length).toBeGreaterThanOrEqual(1);

      await controller.dispose();
    });

    it('GAME_COMPLETE old event should bridge to game:over new event', async () => {
      const controller = new TowerModeController();
      await controller.initialize();
      await controller.startNewGame(42);

      const newEvents: unknown[] = [];
      gameEventBus.on('game:over', (data) => {
        newEvents.push(data);
      });

      // Emit old-style GAME_COMPLETE event
      eventBus.emit('GAME_COMPLETE', { type: 'GAME_COMPLETE', finalStats: {} });

      expect(newEvents.length).toBeGreaterThanOrEqual(1);

      await controller.dispose();
    });

    it('STATE_CHANGE old event should bridge to state:change new event', async () => {
      const controller = new TowerModeController();
      await controller.initialize();
      await controller.startNewGame(42);

      const newEvents: unknown[] = [];
      gameEventBus.on('state:change', (data) => {
        newEvents.push(data);
      });

      // Emit old-style STATE_CHANGE event
      eventBus.emit('STATE_CHANGE', { type: 'STATE_CHANGE', state: { phase: 'playing' } });

      expect(newEvents.length).toBeGreaterThanOrEqual(1);

      await controller.dispose();
    });
  });

  describe('GameEventBus type-safe communication', () => {
    it('should subscribe and receive typed events', () => {
      const received: unknown[] = [];

      const unsub = gameEventBus.on('battle:end', (data) => {
        received.push(data);
      });

      gameEventBus.emit('battle:end', {
        result: { victory: true, rewards: [] },
        cellId: 'test_cell',
      });

      expect(received).toHaveLength(1);
      expect((received[0] as any).result.victory).toBe(true);
      expect((received[0] as any).cellId).toBe('test_cell');

      unsub();
    });

    it('should support multiple listeners for same event', () => {
      const received1: unknown[] = [];
      const received2: unknown[] = [];

      const unsub1 = gameEventBus.on('position:change', (data) => {
        received1.push(data);
      });
      const unsub2 = gameEventBus.on('position:change', (data) => {
        received2.push(data);
      });

      gameEventBus.emit('position:change', {
        fromCellId: 'cell_a',
        toCellId: 'cell_b',
      });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);

      unsub1();
      unsub2();
    });

    it('should support unsubscribe via returned function', () => {
      const received: unknown[] = [];

      const unsub = gameEventBus.on('game:over', (data) => {
        received.push(data);
      });

      gameEventBus.emit('game:over', { reason: 'victory' });
      expect(received).toHaveLength(1);

      unsub();

      gameEventBus.emit('game:over', { reason: 'defeat' });
      expect(received).toHaveLength(1); // Should still be 1 after unsubscribe
    });

    it('should support off method for unsubscribing', () => {
      const received: unknown[] = [];
      const handler = (data: unknown) => { received.push(data); };

      gameEventBus.on('layer:transition', handler);

      gameEventBus.emit('layer:transition', { fromLayer: 1, toLayer: 2 });
      expect(received).toHaveLength(1);

      gameEventBus.off('layer:transition', handler);

      gameEventBus.emit('layer:transition', { fromLayer: 2, toLayer: 3 });
      expect(received).toHaveLength(1);
    });

    it('should support removeAllListeners', () => {
      const received: unknown[] = [];

      gameEventBus.on('battle:end', (data) => { received.push(data); });
      gameEventBus.on('position:change', (data) => { received.push(data); });

      gameEventBus.emit('battle:end', { result: { victory: true, rewards: [] }, cellId: '' });
      gameEventBus.emit('position:change', { fromCellId: '', toCellId: '' });
      expect(received).toHaveLength(2);

      gameEventBus.removeAllListeners();

      gameEventBus.emit('battle:end', { result: { victory: true, rewards: [] }, cellId: '' });
      gameEventBus.emit('position:change', { fromCellId: '', toCellId: '' });
      expect(received).toHaveLength(2); // No new events after removeAllListeners
    });

    it('should support technicalValue:change event', () => {
      const received: unknown[] = [];

      const unsub = gameEventBus.on('technicalValue:change', (data) => {
        received.push(data);
      });

      gameEventBus.emit('technicalValue:change', { oldValue: 50, newValue: 53 });

      expect(received).toHaveLength(1);
      expect((received[0] as any).oldValue).toBe(50);
      expect((received[0] as any).newValue).toBe(53);

      unsub();
    });

    it('should support milestone:reached event', () => {
      const received: unknown[] = [];

      const unsub = gameEventBus.on('milestone:reached', (data) => {
        received.push(data);
      });

      gameEventBus.emit('milestone:reached', {
        milestone: { threshold: 90, type: 'technicalValue' },
      });

      expect(received).toHaveLength(1);

      unsub();
    });

    it('should not receive events for different event types', () => {
      const battleEvents: unknown[] = [];

      const unsub = gameEventBus.on('battle:end', (data) => {
        battleEvents.push(data);
      });

      gameEventBus.emit('position:change', { fromCellId: 'a', toCellId: 'b' });

      expect(battleEvents).toHaveLength(0);

      unsub();
    });
  });
});
