import { describe, it, expect } from 'vitest';
import { TowerModeController } from '../../TowerModeController';
import { preassembleAllLayers } from '../../utils/layerAssembler';
import { CurvedPathEngine } from '../../engine/curvedPathEngine';
import { getGourdTopology } from '../../data/gourdTopologies';
import { GourdMapRenderer } from '../../components/GourdMapRenderer';
import React from 'react';
import { render } from '@testing-library/react';

describe('F组第九轮 — 性能基准', () => {

  it('引擎100次操作 < 50ms', async () => {
    const ctrl = new TowerModeController();
    await ctrl.initialize();
    await ctrl.startNewGame(42);

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      try { ctrl.rollDice(); } catch {}
      ctrl.getRenderState();
    }
    const elapsed = performance.now() - start;
    await ctrl.dispose();
    expect(elapsed).toBeLessThan(50);
  });

  it('9层组装 < 800ms', () => {
    const start = performance.now();
    const result = preassembleAllLayers();
    const elapsed = performance.now() - start;
    expect(result.size).toBe(9);
    expect(elapsed).toBeLessThan(800);
  });

  it('GourdMapRenderer 渲染 < 700ms', () => {
    const topo = getGourdTopology(1);
    const start = performance.now();
    render(React.createElement(GourdMapRenderer, { topology: topo, cells: [] }));
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(700);
  });

  it('SVG元素 < 600', () => {
    const topo = getGourdTopology(1);
    const { container } = render(
      React.createElement(GourdMapRenderer, { topology: topo, cells: [] })
    );
    const svgEls = container.querySelectorAll('svg *');
    expect(svgEls.length).toBeLessThan(600);
  });
});
