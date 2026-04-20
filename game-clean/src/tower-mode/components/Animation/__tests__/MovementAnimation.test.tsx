/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { MovementAnimation } from '../MovementAnimation';

describe('MovementAnimation', () => {
  const mockCellPositions: Record<string, { x: number; y: number }> = {
    'cell-1': { x: 100, y: 100 },
    'cell-2': { x: 200, y: 100 },
    'cell-3': { x: 300, y: 200 },
    'cell-4': { x: 400, y: 300 },
  };

  const mockPath = ['cell-1', 'cell-2', 'cell-3', 'cell-4'];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('空路径处理', () => {
    it('空路径时返回 null', () => {
      const { container } = render(
        <MovementAnimation
          pathCellIds={[]}
          cellPositions={mockCellPositions}
          speedPerCell={100}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('路径动画组件渲染', () => {
    it('渲染路径动画组件（SVG）', () => {
      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={500}
        />
      );

      const svg = document.querySelector('svg.movement-animation-svg');
      expect(svg).toBeInTheDocument();
    });

    it('显示当前棋子位置（第一个格子）', () => {
      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={500}
        />
      );

      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);

      // The inner solid blue circle should be at the first cell position
      const blueCircle = Array.from(circles).find(
        (c) => c.getAttribute('fill') === '#3b82f6'
      );
      expect(blueCircle).toBeDefined();
      expect(blueCircle?.getAttribute('cx')).toBe('100');
      expect(blueCircle?.getAttribute('cy')).toBe('100');
    });
  });

  describe('已走路径 polyline 渲染', () => {
    it('初始状态只有当前位置，polyline 不存在', () => {
      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={500}
        />
      );

      // At index 0, only one position, so no polyline
      const polyline = document.querySelector('polyline');
      expect(polyline).toBeNull();
    });

    it('移动一步后 polyline 用已走过的路径渲染', async () => {
      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={100}
        />
      );

      // Advance one step
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const polyline = document.querySelector('polyline');
      expect(polyline).toBeInTheDocument();

      // Verify polyline attributes
      expect(polyline?.getAttribute('stroke')).toBe('#ffd700');
      // In jsdom, strokeWidth may be reflected as stroke-width
      const sw =
        polyline?.getAttribute('stroke-width') ||
        polyline?.getAttribute('strokeWidth');
      expect(sw).toBe('3');
      expect(polyline?.getAttribute('stroke-dasharray') || polyline?.getAttribute('strokeDasharray')).toBe('4 4');

      // Verify polyline has 2 points (cell-1 and cell-2)
      const points = polyline?.getAttribute('points') || '';
      const pointCount = points.split(' ').filter(Boolean).length;
      expect(pointCount).toBe(2);
      expect(points).toContain('100,100');
      expect(points).toContain('200,100');
    });

    it('移动多步后 polyline 包含所有已走过的点', async () => {
      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={100}
        />
      );

      // Advance three steps (to cell-4, index 3)
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const polyline = document.querySelector('polyline');
      expect(polyline).toBeInTheDocument();

      const points = polyline?.getAttribute('points') || '';
      const pointCount = points.split(' ').filter(Boolean).length;
      expect(pointCount).toBe(4);
      expect(points).toContain('100,100'); // cell-1
      expect(points).toContain('200,100'); // cell-2
      expect(points).toContain('300,200'); // cell-3
      expect(points).toContain('400,300'); // cell-4
    });
  });

  describe('移动完成后调用 onComplete 回调', () => {
    it('到达最后一个格子时调用 onComplete', async () => {
      const onComplete = vi.fn();

      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={100}
          onComplete={onComplete}
        />
      );

      // Need to advance 4 times to complete the path (4 cells = 4 intervals)
      // index 0->1 (100ms), 1->2 (200ms), 2->3 (300ms), 3->4 (400ms) triggers complete
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('路径只有1个格子时立即完成', async () => {
      const onComplete = vi.fn();

      render(
        <MovementAnimation
          pathCellIds={['cell-1']}
          cellPositions={mockCellPositions}
          speedPerCell={100}
          onComplete={onComplete}
        />
      );

      // Single cell: advance once to trigger completion
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('onComplete 是可选的，未提供时不报错', async () => {
      const { container } = render(
        <MovementAnimation
          pathCellIds={['cell-1']}
          cellPositions={mockCellPositions}
          speedPerCell={100}
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // No error should be thrown
      expect(container.firstChild).toBeNull();
    });
  });

  describe('isComplete 后返回 null（自动清理）', () => {
    it('移动完成后组件返回 null', async () => {
      const { container } = render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={100}
        />
      );

      // Initially rendered
      expect(container.firstChild).not.toBeNull();

      // Advance to completion
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      // After completion, the component should return null
      expect(container.firstChild).toBeNull();
    });
  });

  describe('speedPerCell 参数控制速度', () => {
    it('默认 speedPerCell 为 300ms', async () => {
      const onComplete = vi.fn();

      render(
        <MovementAnimation
          pathCellIds={['cell-1', 'cell-2']}
          cellPositions={mockCellPositions}
          onComplete={onComplete}
        />
      );

      // At 299ms, first interval hasn't fired yet
      await act(async () => {
        vi.advanceTimersByTime(299);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // At 300ms, first interval fires (idx 0->1), but not complete yet (1 < 2)
      await act(async () => {
        vi.advanceTimersByTime(1);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // At 600ms, second interval fires (idx 1->2), completion triggers
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('自定义 speedPerCell 控制移动间隔', async () => {
      const onComplete = vi.fn();

      render(
        <MovementAnimation
          pathCellIds={['cell-1', 'cell-2']}
          cellPositions={mockCellPositions}
          speedPerCell={500}
          onComplete={onComplete}
        />
      );

      // At 499ms, first interval hasn't fired yet
      await act(async () => {
        vi.advanceTimersByTime(499);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // At 500ms, first interval fires (idx 0->1), but not complete yet (1 < 2)
      await act(async () => {
        vi.advanceTimersByTime(1);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // At 1000ms, second interval fires (idx 1->2), completion triggers
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('快速 speedPerCell 加速移动', async () => {
      const onComplete = vi.fn();

      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={50}
          onComplete={onComplete}
        />
      );

      // 4 cells * 50ms = 200ms to complete
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(onComplete).toHaveBeenCalledOnce();
    });
  });

  describe('路径变化时重置状态', () => {
    it('pathCellIds 变化时重置 currentIndex 和 isComplete', () => {
      const { rerender } = render(
        <MovementAnimation
          pathCellIds={['cell-1', 'cell-2']}
          cellPositions={mockCellPositions}
          speedPerCell={50}
        />
      );

      // Advance to completion
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Re-render with new path - this triggers the useEffect reset
      rerender(
        <MovementAnimation
          pathCellIds={['cell-3', 'cell-4']}
          cellPositions={mockCellPositions}
          speedPerCell={50}
        />
      );

      // Should show SVG again (not null), meaning state was reset
      const svg = document.querySelector('svg.movement-animation-svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('SVG 动画标签', () => {
    it('棋子包含 SVG animate 标签实现脉动效果', () => {
      render(
        <MovementAnimation
          pathCellIds={mockPath}
          cellPositions={mockCellPositions}
          speedPerCell={500}
        />
      );

      const animateElements = document.querySelectorAll('animate');
      expect(animateElements.length).toBe(2);

      // First animate: radius pulsing (r: 10->14->10)
      const radiusAnimate = Array.from(animateElements).find(
        (a) => a.getAttribute('attributeName') === 'r'
      );
      expect(radiusAnimate).toBeDefined();
      expect(radiusAnimate?.getAttribute('values')).toBe('10;14;10');
      expect(radiusAnimate?.getAttribute('dur')).toBe('1s');
      expect(radiusAnimate?.getAttribute('repeatCount')).toBe('indefinite');

      // Second animate: opacity pulsing (0.2->0.4->0.2)
      const opacityAnimate = Array.from(animateElements).find(
        (a) => a.getAttribute('attributeName') === 'opacity'
      );
      expect(opacityAnimate).toBeDefined();
      expect(opacityAnimate?.getAttribute('values')).toBe('0.2;0.4;0.2');
      expect(opacityAnimate?.getAttribute('dur')).toBe('1s');
      expect(opacityAnimate?.getAttribute('repeatCount')).toBe('indefinite');
    });
  });
});
