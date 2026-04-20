import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { getGourdTopology } from '../../data/gourdTopologies';
import { assembleLayerTopology } from '../../utils/layerAssembler';
import { GourdMapRenderer } from '../../components/GourdMapRenderer';

describe('F5 — 第十轮性能基准', () => {

  it('9层拓扑全量生成 < 50ms', () => {
    const start = performance.now();
    for (let i = 1; i <= 9; i++) {
      getGourdTopology(i);
    }
    expect(performance.now() - start).toBeLessThan(50);
  });

  it('assembleLayerTopology 9层全量组装 < 250ms', () => {
    const start = performance.now();
    for (let i = 1; i <= 9; i++) {
      assembleLayerTopology(i);
    }
    expect(performance.now() - start).toBeLessThan(250);
  });

  it('GourdMapRenderer 带topology渲染 < 700ms', async () => {
    const assembled = assembleLayerTopology(6);
    const start = performance.now();
    const { container } = render(
      React.createElement(GourdMapRenderer, {
        topology: assembled.topology,
        cells: [],
        pieceState: null,
      })
    );
    await waitFor(() => expect(container.querySelector('.gourd-map-wrapper')).toBeTruthy(), { timeout: 5000 });
    expect(performance.now() - start).toBeLessThan(700);
  }, 10000);

  it('SVG元素总数合理 (< 600)', async () => {
    const assembled = assembleLayerTopology(6);
    const { container } = render(
      React.createElement(GourdMapRenderer, {
        topology: assembled.topology,
        cells: [],
        pieceState: null,
      })
    );
    await waitFor(() => expect(container.querySelector('svg')).toBeTruthy(), { timeout: 5000 });
    const count = container.querySelectorAll('svg *').length;
    expect(count).toBeLessThan(600);
  }, 10000);
});
