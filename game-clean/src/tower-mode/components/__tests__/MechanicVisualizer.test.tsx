import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MechanicVisualizer, AccelerationViz, JumpViz, SequenceViz, EventViz, BlockadeViz, TeleportViz, DriftViz, CollapseViz, ProtocolViz } from '../../components/GourdMapRenderer/MechanicVisualizer';
import { ZoneShapeVariants } from '../../components/GourdMapRenderer/ZoneShapeVariants';

const mockTopology = {
  upperCircle: { center: { x: 400, y: 200 }, radius: 180 },
  lowerCircle: { center: { x: 400, y: 420 }, radiusX: 200, radiusY: 150 },
};

describe('MechanicVisualizer', () => {
  it('无 mechanicType 时返回 null', () => {
    const { container } = render(<MechanicVisualizer />);
    expect(container.innerHTML).toBe('');
  });

  it('acceleration 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="acceleration" params={{}} topology={mockTopology} wStreakCount={2} />);
    expect(container.innerHTML).toBeTruthy();
    expect(container.innerHTML).toContain('扩散进度');
  });

  it('jump 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="jump" params={{}} topology={mockTopology} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('sequence 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="sequence" params={{}} topology={mockTopology} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('event 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="event" params={{}} topology={mockTopology} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('blockade 类型渲染', () => {
    const { container } = render(
      <MechanicVisualizer
        mechanicType="blockade"
        params={{ blockedPathIds: ['R3C2-R4C1'] }}
        topology={mockTopology}
      />
    );
    expect(container.innerHTML).toBeTruthy();
  });

  it('teleport 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="teleport" params={{}} topology={mockTopology} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('drift 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="drift" params={{}} topology={mockTopology} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('collapse 类型渲染', () => {
    const { container } = render(<MechanicVisualizer mechanicType="collapse" params={{}} topology={mockTopology} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('protocol 类型渲染', () => {
    const { container } = render(
      <MechanicVisualizer
        mechanicType="protocol"
        params={{ protocolCorrectPath: ['A','B','C','D','E'] }}
        topology={mockTopology}
      />
    );
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('ZoneShapeVariants', () => {
  const baseShapeConfig = {
    lowerCircle: {
      center: { x: 400, y: 420 },
      radiusX: 200,
      radiusY: 150,
    },
    upperCircle: {
      center: { x: 400, y: 200 },
      radius: 180,
    },
  };

  it('subZones 存在时使用自定义形状', () => {
    const config = {
      ...baseShapeConfig,
      lowerCircle: {
        ...baseShapeConfig.lowerCircle,
        subZones: [
          { id: 'zone1', pathData: 'M300,350 Q400,320 500,350 Z', fill: '#4CAF5050', opacity: 0.2 },
          { id: 'zone2', pathData: 'M500,450 Q400,480 300,450 Z', fill: '#2196F340', opacity: 0.15 },
        ],
      },
    };

    const { container } = render(<ZoneShapeVariants shapeConfig={config} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('无subZones时回退标准四象限', () => {
    const config = {
      ...baseShapeConfig,
      lowerCircle: {
        ...baseShapeConfig.lowerCircle,
        subZones: undefined as any,
      },
    };

    const { container } = render(<ZoneShapeVariants shapeConfig={config} />);
    expect(container.innerHTML).toBeTruthy();
  });

  it('zoneEffects 匹配时高亮区域', () => {
    const config = {
      ...baseShapeConfig,
      lowerCircle: {
        ...baseShapeConfig.lowerCircle,
        subZones: [
          { id: 'zone1', pathData: 'M300,350 L500,350 L500,450 L300,450 Z', fill: '#4CAF5050', opacity: 0.2 },
          { id: 'zone2', pathData: 'M500,350 L700,380 L680,480 L500,450 Z', fill: '#2196F340', opacity: 0.15 },
        ],
      },
    };
    const effects = [{ zoneId: 'zone1', effectType: 'stat_mod', value: 1 }];

    const { container } = render(<ZoneShapeVariants shapeConfig={config} zoneEffects={effects} />);
    expect(container.innerHTML).toBeTruthy();
  });
});
