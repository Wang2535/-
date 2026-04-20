import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { MechanicVisualizer } from '../../components/GourdMapRenderer/MechanicVisualizer';

const mockTopology = {
  upperCircle: { center: { x: 400, y: 150 }, radius: 100 },
  lowerCircle: { center: { x: 400, y: 420 }, radiusX: 140, radiusY: 105 },
};

describe('F3 — MechanicVisualizer 9种机制渲染测试', () => {

  it('acceleration机制显示进度条', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'acceleration',
        wStreakCount: 2,
        topology: mockTopology,
      })
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.innerHTML).toContain('扩散进度');
    expect(container.innerHTML).toContain('2/3');
  });

  it('jump机制显示JUMP标记', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'jump',
        topology: mockTopology,
      })
    );
    expect(container.innerHTML).toContain('JUMP');
  });

  it('sequence机制显示顺序指示', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'sequence',
        params: { completed: 2 },
        topology: mockTopology,
      })
    );
    expect(container.innerHTML).toContain('OUTER');
    expect(container.innerHTML).toContain('MID');
    expect(container.innerHTML).toContain('CORE');
  });

  it('event机制显示事件图标', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'event',
        topology: mockTopology,
      })
    );
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it('blockade机制在有blockedPathIds时显示BLOCKED', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'blockade',
        blockedPathIds: ['path-1', 'path-2'],
        topology: mockTopology,
      })
    );
    expect(container.innerHTML).toContain('BLOCKED');
  });

  it('blockade机制无blockedPathIds时不渲染', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'blockade',
        blockedPathIds: [],
        topology: mockTopology,
      })
    );
    const svgChildren = container.querySelectorAll('svg > g');
    expect(svgChildren.length).toBe(0);
  });

  it('teleport机制显示传送门效果', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'teleport',
        topology: mockTopology,
      })
    );
    expect(container.innerHTML).toContain('radialGradient');
    expect(container.innerHTML).toContain('tp-glow');
  });

  it('drift机制显示漂移箭头', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'drift',
        topology: mockTopology,
      })
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(6);
  });

  it('collapse机制显示COLLAPSING警告', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'collapse',
        topology: mockTopology,
      })
    );
    expect(container.innerHTML).toContain('COLLAPSING');
  });

  it('protocol机制显示指引线', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'protocol',
        params: { currentStep: 2 },
        protocolCorrectPath: ['n1', 'n2', 'n3'],
        topology: mockTopology,
      })
    );
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('未知mechanicType返回null不渲染内容', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {
        mechanicType: 'unknown_type',
        topology: mockTopology,
      })
    );
    const svg = container.querySelector('svg');
    if (svg) {
      expect(svg.children.length).toBe(0);
    }
  });

  it('无mechanicType时返回null', () => {
    const { container } = render(
      React.createElement(MechanicVisualizer, {})
    );
    expect(container.querySelector('svg')).toBeFalsy();
  });
});
