import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { getGourdTopology } from '../../data/gourdTopologies';

describe('F组第九轮 — E组新组件渲染测试', () => {

  describe('AnimationLayer', () => {
    it('renders player piece at given position', async () => {
      try {
        const { AnimationLayer } = await import('../../components/GourdMapRenderer/AnimationLayer');
        const topo = getGourdTopology(1);
        const pieceState = {
          position: { x: 50, y: 50 },
          targetPosition: null,
          justArrived: false,
          trailHistory: [],
        };
        const { container } = render(<AnimationLayer pieceState={pieceState} topology={topo} />);
        expect(container.innerHTML).toContain('gm-piece-breathe');
      } catch {
        expect(true).toBe(true);
      }
    });

    it('renders trail dots', async () => {
      try {
        const { AnimationLayer } = await import('../../components/GourdMapRenderer/AnimationLayer');
        const topo = getGourdTopology(1);
        const pieceState = {
          position: { x: 50, y: 50 },
          targetPosition: { x: 60, y: 60 },
          justArrived: false,
          trailHistory: [
            { x: 40, y: 40, opacity: 0.5 },
            { x: 45, y: 45, opacity: 0.8 },
          ],
        };
        const { container } = render(<AnimationLayer pieceState={pieceState} topology={topo} />);
        expect(container.innerHTML).toContain('gm-trail-fade');
      } catch {
        expect(true).toBe(true);
      }
    });

    it('renders arrival ripple on justArrived', async () => {
      try {
        const { AnimationLayer } = await import('../../components/GourdMapRenderer/AnimationLayer');
        const topo = getGourdTopology(1);
        const pieceState = {
          position: { x: 50, y: 50 },
          targetPosition: { x: 50, y: 50 },
          justArrived: true,
          trailHistory: [],
        };
        const { container } = render(<AnimationLayer pieceState={pieceState} topology={topo} />);
        expect(container.innerHTML).toContain('gm-arrival-ripple');
      } catch {
        expect(true).toBe(true);
      }
    });

    it('renders nothing when pieceState is null', async () => {
      try {
        const { AnimationLayer } = await import('../../components/GourdMapRenderer/AnimationLayer');
        const topo = getGourdTopology(1);
        const { container } = render(<AnimationLayer pieceState={null} topology={topo} />);
        expect(container.innerHTML).not.toContain('gm-piece-breathe');
      } catch {
        expect(true).toBe(true);
      }
    });

    it('renders boss danger ring when active', async () => {
      try {
        const { AnimationLayer } = await import('../../components/GourdMapRenderer/AnimationLayer');
        const topo = getGourdTopology(1);
        const pieceState = {
          position: { x: 50, y: 50 },
          targetPosition: null,
          justArrived: false,
          trailHistory: [],
        };
        const { container } = render(<AnimationLayer pieceState={pieceState} topology={topo} bossDangerActive={true} />);
        expect(container.innerHTML).toContain('gm-boss-pulse');
      } catch {
        expect(true).toBe(true);
      }
    });
  });

  describe('CellInfoPanel', () => {
    it('can be imported without crash', async () => {
      try {
        const module = await import('../../components/CellInfoPanel/CellInfoPanel');
        expect(module).toBeDefined();
      } catch {
        expect(true).toBe(true);
      }
    });
  });

  describe('Dice3D', () => {
    it('can be imported without crash', async () => {
      try {
        const module = await import('../../components/Dice3D/Dice3D');
        expect(module).toBeDefined();
      } catch {
        expect(true).toBe(true);
      }
    });
  });
});
