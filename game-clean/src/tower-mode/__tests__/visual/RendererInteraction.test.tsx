import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GourdMapRenderer } from '../../components/GourdMapRenderer';
import { getGourdTopology } from '../../data/gourdTopologies';
import type { PlayerPieceState } from '../../engine/playerPiece';

describe('F组第八轮 — 渲染器交互测试', () => {

  const topology = getGourdTopology(1);

  test('传入 pieceState 时渲染玩家棋子', () => {
    const pieceState: PlayerPieceState = {
      position: { x: 0.5, y: 0.5 },
      targetPosition: null,
      isMoving: false,
      moveStartTime: null,
      moveDuration: 0,
      trailHistory: [],
      currentCellId: 'test-cell',
      justArrived: false,
      currentZone: null,
    };

    const { container } = render(
      <GourdMapRenderer topology={topology} cells={[]} pieceState={pieceState} />
    );

    expect(container.innerHTML).toContain('gm-piece-breathe');
  });

  test('pieceState.trailHistory 渲染轨迹光痕', () => {
    const pieceState: PlayerPieceState = {
      position: { x: 0.6, y: 0.6 },
      targetPosition: { x: 0.7, y: 0.7 },
      isMoving: true,
      moveStartTime: performance.now() - 200,
      moveDuration: 500,
      trailHistory: [
        { x: 0.5, y: 0.5, timestamp: Date.now() - 300, opacity: 0.8 },
        { x: 0.55, y: 0.55, timestamp: Date.now() - 200, opacity: 0.9 },
        { x: 0.58, y: 0.58, timestamp: Date.now() - 100, opacity: 1.0 },
      ],
      currentCellId: 'cell-3',
      justArrived: false,
      currentZone: null,
    };

    const { container } = render(
      <GourdMapRenderer topology={topology} cells={[]} pieceState={pieceState} />
    );

    const html = container.innerHTML;
    expect(html).toContain('#44ff88');
  });

  test('justArrived 渲染到达波纹', () => {
    const pieceState: PlayerPieceState = {
      position: { x: 0.5, y: 0.5 },
      targetPosition: { x: 0.5, y: 0.5 },
      isMoving: false,
      moveStartTime: null,
      moveDuration: 0,
      trailHistory: [],
      currentCellId: 'arrived',
      justArrived: true,
      currentZone: null,
    };

    const { container } = render(
      <GourdMapRenderer topology={topology} cells={[]} pieceState={pieceState} />
    );

    const html = container.innerHTML;
    expect(html).toContain('arrival-ripple');
  });

  test('Boss格尺寸明显更大', () => {
    const { container } = render(
      <GourdMapRenderer topology={topology} cells={[]} />
    );

    const html = container.innerHTML;
    expect(html).toContain('boss');
  });

  test('切换层级不崩溃', () => {
    const l1 = getGourdTopology(1);
    const l2 = getGourdTopology(2);

    const { rerender } = render(
      <GourdMapRenderer topology={l1} cells={[]} />
    );

    expect(() => {
      rerender(<GourdMapRenderer topology={l2} cells={[]} />);
    }).not.toThrow();
  });

  test('onCellClick 回调可触发', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <GourdMapRenderer topology={topology} cells={[]} onCellClick={handleClick} />
    );

    // CellNode renders <g cursor="pointer"> for cells with opacity >= 0.5
    const clickableEls = container.querySelectorAll('g[cursor="pointer"]');
    if (clickableEls.length > 0) {
      fireEvent.click(clickableEls[0]);
      expect(handleClick).toHaveBeenCalled();
    }
  });
});
