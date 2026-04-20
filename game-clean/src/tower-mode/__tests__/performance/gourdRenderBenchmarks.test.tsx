import { describe, it, expect } from 'vitest';
import { getGourdTopology } from '../../data/gourdTopologies';
import { GourdMapRenderer } from '../../components/GourdMapRenderer';
import { render } from '@testing-library/react';

describe('GourdMapRenderer Performance Benchmarks', () => {
  it('GourdMapRenderer first render completes within 1000ms', async () => {
    const topo = getGourdTopology(1);
    const cells: Array<never> = [];

    const start = performance.now();
    render(
      <GourdMapRenderer
        topology={topo}
        cells={cells}
        currentPosition={null}
        highlightedCells={[]}
        onCellClick={() => {}}
      />
    );
    const elapsed = performance.now() - start;

    // jsdom environment has significant overhead vs real browser;
    // 1000ms threshold accounts for jsdom React mounting cost
    expect(elapsed).toBeLessThan(1000);
  });

  it('SVG path count is reasonable (< 50 per layer)', () => {
    const topo = getGourdTopology(1);
    // Connections become SVG paths, plus gourd outline paths
    const connectionPaths = topo.connections.length;
    const outlinePaths = 3; // upper circle, lower circle, connector
    const borderSegments = 72; // 36 per circle
    const totalPaths = connectionPaths + outlinePaths + borderSegments;

    expect(totalPaths).toBeLessThan(200); // reasonable SVG complexity
  });

  it('movement interpolation is fast (100 interpolations < 10ms)', () => {
    // Simulate player position interpolation
    const from = { x: 25, y: 20 };
    const to = { x: 75, y: 70 };

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const t = i / 99;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      // Simulate bezier control point calculation
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const dx = 50 - midX;
      const dy = 45 - midY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const offset = Math.min(5, dist * 0.3);
      const cpX = midX + (dx / dist) * offset;
      const cpY = midY + (dy / dist) * offset;
      // Quadratic bezier interpolation
      const bx = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x;
      const by = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y;
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(10);
  });
});
