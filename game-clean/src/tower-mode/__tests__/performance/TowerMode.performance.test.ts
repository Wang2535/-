import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { assembleLayerTopology } from '../../utils/layerAssembler';
import { GourdMapRenderer } from '../../components/GourdMapRenderer';
import { TypedEventBus } from '../../EventBus';

describe('TowerMode 性能测试', () => {

  describe('渲染性能', () => {
    it('GourdMapRenderer L1 渲染 < 800ms', async () => {
      const assembled = assembleLayerTopology(1);
      const start = performance.now();
      const { container } = render(
        React.createElement(GourdMapRenderer, {
          topology: assembled.topology,
          cells: [],
          pieceState: null,
        })
      );
      await waitFor(() => expect(container.querySelector('svg')).toBeTruthy(), { timeout: 5000 });
      expect(performance.now() - start).toBeLessThan(800);
    }, 10000);

    it('GourdMapRenderer L6 渲染 < 800ms', async () => {
      const assembled = assembleLayerTopology(6);
      const start = performance.now();
      const { container } = render(
        React.createElement(GourdMapRenderer, {
          topology: assembled.topology,
          cells: [],
          pieceState: null,
        })
      );
      await waitFor(() => expect(container.querySelector('svg')).toBeTruthy(), { timeout: 5000 });
      expect(performance.now() - start).toBeLessThan(800);
    }, 10000);
  });

  describe('事件总线性能', () => {
    it('TypedEventBus 1000次 emit < 50ms', () => {
      const bus = new TypedEventBus();
      const callback = vi.fn();
      bus.on('test:high_freq' as any, callback);

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        bus.emit('test:high_freq' as any, { value: i });
      }
      const duration = performance.now() - start;

      expect(callback).toHaveBeenCalledTimes(1000);
      expect(duration).toBeLessThan(50);
    });
  });

  describe.skip('MechanicEffectEngine 性能（待交付）', () => {
    it('MechanicEffectEngine 不存在，待C组交付', () => {});
  });

  describe.skip('ShapeDrivenGourdMapRenderer 性能（待交付）', () => {
    it('ShapeDrivenGourdMapRenderer 不存在，待交付', () => {});
  });
});
