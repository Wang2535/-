import { useMemo, useCallback } from 'react';
import type { GourdMapTopology, GridCell } from '../../types/grid.types';
import { CellNode } from './CellNode';
import { PathLayer } from './PathLayer';
import { DEFAULT_CELL_STYLES, DEFAULT_STATE_OVERRIDES } from './types';
import type { GourdMapRendererProps, CellRenderData } from './types';

export type { GourdMapRendererProps } from './types';
export type { PlayerPieceState } from './types';

// 层级主题颜色
const LAYER_THEMES: Record<number, { primary: string; secondary: string; accent: string }> = {
  1: { primary: '#0a1a0a', secondary: '#0d1a1d', accent: '#44ff88' },  // 病毒实验室 - 绿色
  2: { primary: '#0a0a1a', secondary: '#0d0d2d', accent: '#2196F3' },  // 网络空间 - 蓝色
  3: { primary: '#1a1a0a', secondary: '#1d1d0d', accent: '#ffc107' },  // 数据保险库 - 金色
  4: { primary: '#1a0f0a', secondary: '#1d120d', accent: '#ff9800' },  // 城市街区 - 橙色
  5: { primary: '#1a1a1a', secondary: '#1d1d1d', accent: '#795548' },  // 智能工厂 - 棕色
  6: { primary: '#0f0a1a', secondary: '#120d1d', accent: '#9C27B0' },  // 移动终端 - 紫色
  7: { primary: '#0a1a1a', secondary: '#0d1d1d', accent: '#00BCD4' },  // 云端平台 - 青色
  8: { primary: '#1a0a1a', secondary: '#1d0d1d', accent: '#E91E63' },  // 未来实验室 - 粉色
  9: { primary: '#1a1a0a', secondary: '#2d2d0d', accent: '#ffd700' },  // 指挥中心 - 金色
};

export function GourdMapRenderer({
  topology,
  cells,
  currentPosition,
  highlightedCells = [],
  onCellClick,
  layerNumber = 1,
}: GourdMapRendererProps) {
  const cellMap = useMemo(() => {
    const map = new Map<string, GridCell>();
    for (const cell of cells) map.set(cell.id, cell);
    return map;
  }, [cells]);

  const cellPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const uc = topology.upperCircle;
    const lc = topology.lowerCircle;

    uc.cellIds.forEach((cellId, i) => {
      const angle = (2 * Math.PI * i) / uc.cellIds.length - Math.PI / 2;
      positions[cellId] = {
        x: uc.center.x + uc.radius * 0.75 * Math.cos(angle),
        y: uc.center.y + uc.radius * 0.75 * Math.sin(angle),
      };
    });

    const connStartY = uc.center.y + uc.radius * 0.6;
    const connEndY = lc.center.y - lc.radius * 0.6;
    topology.connector.cellIds.forEach((cellId, i) => {
      const t = topology.connector.cellIds.length > 1 ? i / (topology.connector.cellIds.length - 1) : 0.5;
      positions[cellId] = { x: 50, y: connStartY + (connEndY - connStartY) * t };
    });

    lc.cellIds.forEach((cellId, i) => {
      const angle = (2 * Math.PI * i) / lc.cellIds.length - Math.PI / 2;
      positions[cellId] = {
        x: lc.center.x + lc.radius * 0.75 * Math.cos(angle),
        y: lc.center.y + lc.radius * 0.75 * Math.sin(angle),
      };
    });

    return positions;
  }, [topology]);

  const cellDefaults = useMemo(() => {
    const defaults: Record<string, string> = {};
    const uc = topology.upperCircle;
    const lc = topology.lowerCircle;
    if (uc.cellIds.length > 0) defaults[uc.cellIds[0]] = 'start';
    if (lc.cellIds.length > 0) defaults[lc.cellIds[lc.cellIds.length - 1]] = 'boss';
    return defaults;
  }, [topology]);

  const resolvedCells: CellRenderData[] = useMemo(() => {
    const allIds = [
      ...topology.upperCircle.cellIds,
      ...topology.connector.cellIds,
      ...topology.lowerCircle.cellIds,
    ];
    return allIds.map(id => {
      const cell = cellMap.get(id);
      const pos = cellPositions[id];
      const x = pos?.x ?? cell?.coordinate?.x ?? 50;
      const y = pos?.y ?? cell?.coordinate?.y ?? 50;
      const type = cell?.type ?? cellDefaults[id] ?? 'level';
      const state = cell?.state ?? 'locked';

      return { id, x, y, type, state, cell, visualStyle: DEFAULT_CELL_STYLES.get(type) as any, stateOverride: DEFAULT_STATE_OVERRIDES[state], isElite: cell?.eliteMarker?.isElite ?? false, difficulty: cell?.difficulty };
    });
  }, [topology, cellMap, cellPositions, cellDefaults]);

  const handleClick = useCallback((cellId: string) => {
    onCellClick?.(cellId);
  }, [onCellClick]);

  const theme = LAYER_THEMES[layerNumber] || LAYER_THEMES[1];

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
      borderRadius: '12px', overflow: 'hidden',
    }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        
        {/* 简洁的葫芦形状背景 */}
        <circle 
          cx={topology.upperCircle.center.x} 
          cy={topology.upperCircle.center.y} 
          r={topology.upperCircle.radius}
          fill="rgba(40,40,60,0.3)"
        />
        <circle 
          cx={topology.lowerCircle.center.x} 
          cy={topology.lowerCircle.center.y} 
          r={topology.lowerCircle.radius}
          fill="rgba(40,40,60,0.3)"
        />
        <path 
          d={`M ${50 - topology.connector.width / 2} ${topology.upperCircle.center.y + topology.upperCircle.radius * 0.7} 
              L ${50 - topology.connector.width / 3} ${(topology.upperCircle.center.y + topology.lowerCircle.center.y) / 2}
              L ${50 - topology.connector.width / 2} ${topology.lowerCircle.center.y - topology.lowerCircle.radius * 0.7}
              L ${50 + topology.connector.width / 2} ${topology.lowerCircle.center.y - topology.lowerCircle.radius * 0.7}
              L ${50 + topology.connector.width / 3} ${(topology.upperCircle.center.y + topology.lowerCircle.center.y) / 2}
              L ${50 + topology.connector.width / 2} ${topology.upperCircle.center.y + topology.upperCircle.radius * 0.7}
              Z`}
          fill="rgba(40,40,60,0.25)"
        />
        
        {/* 路径层 */}
        <PathLayer
          connections={topology.connections}
          cellPositions={cellPositions}
          highlightedCells={highlightedCells}
          layerTheme={{ accentColor: theme.accent }}
          layerNumber={layerNumber}
        />

        {/* 渲染所有节点 */}
        {resolvedCells.map(cell => (
          <CellNode
            key={cell.id}
            cell={cell.cell}
            config={{}}
            position={{ x: cell.x, y: cell.y }}
            isCurrent={currentPosition === cell.id}
            isHighlighted={highlightedCells.includes(cell.id)}
            onClick={() => handleClick(cell.id)}
            visualStyle={cell.visualStyle}
            stateOverride={cell.stateOverride}
            cellState={(cell.state === 'locked' ? 'locked' as const : cell.state === 'current' ? 'current' as const : cell.state === 'cleared' ? 'cleared' as const : 'default' as const)}
            difficulty={cell.difficulty}
          />
        ))}
      </svg>
    </div>
  );
}
