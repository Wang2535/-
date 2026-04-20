import React, { useMemo } from 'react';
import type { GridCell } from '../../types/grid.types';

// Zone颜色配置
const ZONE_COLORS: Record<string, { fill: string; opacity: number; animationClass: string }> = {
  W: { fill: '#ff4444', opacity: 0.15, animationClass: 'zone-pulse-w' },
  N: { fill: '#4488ff', opacity: 0.15, animationClass: 'zone-glow-n' },
  I: { fill: '#9944ff', opacity: 0.15, animationClass: 'zone-invert' },
  P: { fill: '#ffcc00', opacity: 0.12, animationClass: 'zone-clock' },
  S: { fill: '#44ff88', opacity: 0.12, animationClass: 'zone-flash-s' },
  D: { fill: '#ff2222', opacity: 0.22, animationClass: 'zone-warning-d' },
};

interface ZoneBackgroundLayerProps {
  cellPositions: Record<string, { x: number; y: number }>;
  cells: GridCell[];
  upperCircle: { center: { x: number; y: number }; radius: number };
  lowerCircle: { center: { x: number; y: number }; radiusX: number; radiusY: number };
}

// 计算凸包的简化版本 - 使用圆形包围盒
function calculateZoneBounds(cellIds: string[], cellPositions: Record<string, { x: number; y: number }>): {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
} | null {
  if (cellIds.length === 0) return null;

  const positions = cellIds.map(id => cellPositions[id]).filter(Boolean);
  if (positions.length === 0) return null;

  // 计算中心点
  const sumX = positions.reduce((sum, p) => sum + p.x, 0);
  const sumY = positions.reduce((sum, p) => sum + p.y, 0);
  const centerX = sumX / positions.length;
  const centerY = sumY / positions.length;

  // 计算到最远点的距离作为半径
  let maxDistX = 0;
  let maxDistY = 0;
  for (const pos of positions) {
    const distX = Math.abs(pos.x - centerX);
    const distY = Math.abs(pos.y - centerY);
    if (distX > maxDistX) maxDistX = distX;
    if (distY > maxDistY) maxDistY = distY;
  }

  // 添加一些padding确保覆盖所有格子
  const padding = 8;
  return {
    centerX,
    centerY,
    radiusX: maxDistX + padding,
    radiusY: maxDistY + padding,
  };
}

// 创建椭圆path
function createEllipsePath(bounds: { centerX: number; centerY: number; radiusX: number; radiusY: number }): string {
  const { centerX, centerY, radiusX, radiusY } = bounds;
  return `M${centerX},${centerY - radiusY} A${radiusX},${radiusY} 0 1,0 ${centerX},${centerY + radiusY} A${radiusX},${radiusY} 0 1,0 ${centerX},${centerY - radiusY} Z`;
}

export const ZoneBackgroundLayer: React.FC<ZoneBackgroundLayerProps> = ({
  cellPositions,
  cells,
  upperCircle,
  lowerCircle,
}) => {
  // 将cells按zone分组
  const zoneGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};

    for (const cell of cells) {
      // 从areaEffects中提取zone类型
      if (cell.areaEffects && cell.areaEffects.length > 0) {
        for (const effect of cell.areaEffects) {
          const zoneId = effect.type;
          if (!groups[zoneId]) {
            groups[zoneId] = [];
          }
          groups[zoneId].push(cell.id);
        }
      }
    }

    return groups;
  }, [cells]);

  // 为每个zone计算形状
  const zoneShapes = useMemo(() => {
    const shapes: Array<{
      zoneId: string;
      pathData: string;
      color: typeof ZONE_COLORS[string];
    }> = [];

    for (const [zoneId, cellIds] of Object.entries(zoneGroups)) {
      const colorConfig = ZONE_COLORS[zoneId];
      if (!colorConfig) continue;

      const bounds = calculateZoneBounds(cellIds, cellPositions);
      if (!bounds) continue;

      const pathData = createEllipsePath(bounds);
      shapes.push({
        zoneId,
        pathData,
        color: colorConfig,
      });
    }

    return shapes;
  }, [zoneGroups, cellPositions]);

  if (zoneShapes.length === 0) {
    return null;
  }

  return (
    <g className="zone-backgrounds">
      {zoneShapes.map(({ zoneId, pathData, color }) => (
        <path
          key={zoneId}
          d={pathData}
          fill={color.fill}
          opacity={color.opacity}
          className={`zone-bg ${color.animationClass}`}
          style={{
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      ))}
    </g>
  );
};

ZoneBackgroundLayer.displayName = 'ZoneBackgroundLayer';
