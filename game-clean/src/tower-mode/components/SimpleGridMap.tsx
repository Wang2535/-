import { useMemo, useCallback } from 'react';
import type { GameCell, TowerLayerData, MoveOption, Coordinate2D } from '../types';

interface SimpleGridMapProps {
  layerData: TowerLayerData;
  currentPosition?: string;
  moveOptions?: MoveOption[];
  onCellClick?: (cellId: string) => void;
  highlightedCells?: string[];
}

const CELL_SIZE = 70;
const CELL_SPACING = 10;
const GRID_PADDING = 40;

const CELL_TYPE_COLORS: Record<string, string> = {
  start: '#22C55E',
  battle: '#3B82F6',
  chance: '#F59E0B',
  bookstore: '#EC4899',
  skill: '#8B5CF6',
  boss: '#EF4444',
  end: '#6B7280',
};

const CELL_TYPE_ICONS: Record<string, string> = {
  start: '🚪',
  battle: '⚔️',
  chance: '❓',
  bookstore: '📚',
  skill: '✨',
  boss: '👾',
  end: '🏁',
};

const ZONE_COLORS: Record<string, string> = {
  W: '#FECACA',
  N: '#DBEAFE',
  I: '#F3E8FF',
  P: '#FEF3C7',
  S: '#D1FAE5',
  D: '#FEE2E2',
};

export function SimpleGridMap({ 
  layerData, 
  currentPosition,
  moveOptions = [],
  onCellClick,
  highlightedCells = [],
}: SimpleGridMapProps) {
  const reachableCellIds = useMemo(() => 
    new Set(moveOptions.map(opt => opt.targetCell.id)),
    [moveOptions]
  );

  const gridDimensions = useMemo(() => {
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;
    
    for (const cell of layerData.cells) {
      const [row, col] = cell.coordinate;
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
    }
    
    return { minRow, maxRow, minCol, maxCol };
  }, [layerData.cells]);

  const cellPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const { minRow, minCol } = gridDimensions;
    
    for (const cell of layerData.cells) {
      const [row, col] = cell.coordinate;
      positions[cell.id] = {
        x: GRID_PADDING + (col - minCol) * (CELL_SIZE + CELL_SPACING),
        y: GRID_PADDING + (row - minRow) * (CELL_SIZE + CELL_SPACING),
      };
    }
    
    return positions;
  }, [layerData.cells, gridDimensions]);

  const gridWidth = useMemo(() => {
    const { minCol, maxCol } = gridDimensions;
    return GRID_PADDING * 2 + (maxCol - minCol + 1) * (CELL_SIZE + CELL_SPACING) - CELL_SPACING;
  }, [gridDimensions]);

  const gridHeight = useMemo(() => {
    const { minRow, maxRow } = gridDimensions;
    return GRID_PADDING * 2 + (maxRow - minRow + 1) * (CELL_SIZE + CELL_SPACING) - CELL_SPACING;
  }, [gridDimensions]);

  const renderCell = useCallback((cell: GameCell) => {
    const pos = cellPositions[cell.id];
    if (!pos) return null;

    const isCurrent = cell.id === currentPosition;
    const isReachable = reachableCellIds.has(cell.id);
    const isHighlighted = highlightedCells.includes(cell.id);
    
    const zoneColor = cell.zone ? ZONE_COLORS[cell.zone] : undefined;
    const cellColor = CELL_TYPE_COLORS[cell.type] || '#4B5563';
    const cellIcon = CELL_TYPE_ICONS[cell.type] || '❓';

    const isCompleted = (cell as any).isCompleted || (cell as any).isDefeated;
    const isUnlocked = cell.state === 'unlocked' || cell.state === 'current' || cell.state === 'completed';

    return (
      <g key={cell.id}>
        {zoneColor && (
          <rect
            x={pos.x - 4}
            y={pos.y - 4}
            width={CELL_SIZE + 8}
            height={CELL_SIZE + 8}
            rx={12}
            fill={zoneColor}
            stroke={zoneColor}
            strokeWidth={2}
            opacity={0.6}
          />
        )}
        
        <rect
          x={pos.x}
          y={pos.y}
          width={CELL_SIZE}
          height={CELL_SIZE}
          rx={10}
          fill={isUnlocked ? cellColor : '#374151'}
          stroke={
            isCurrent ? '#FFD700' :
            isReachable ? '#22C55E' :
            isHighlighted ? '#60A5FA' :
            '#4B5563'
          }
          strokeWidth={isCurrent ? 4 : isReachable ? 3 : 2}
          opacity={isUnlocked ? 1 : 0.5}
          style={{
            cursor: isReachable && onCellClick ? 'pointer' : 'default',
            transition: 'transform 0.2s ease, stroke 0.2s ease',
          }}
          onClick={() => isReachable && onCellClick?.(cell.id)}
          onMouseEnter={(e) => {
            if (isReachable) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
        
        <text
          x={pos.x + CELL_SIZE / 2}
          y={pos.y + CELL_SIZE / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="28"
          style={{
            pointerEvents: 'none',
            opacity: isUnlocked ? 1 : 0.5,
          }}
        >
          {cellIcon}
        </text>
        
        {isCompleted && (
          <text
            x={pos.x + CELL_SIZE - 12}
            y={pos.y + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            style={{ pointerEvents: 'none' }}
          >
            ✓
          </text>
        )}
        
        {cell.zone && (
          <text
            x={pos.x + 16}
            y={pos.y + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#1F2937"
            style={{ pointerEvents: 'none' }}
          >
            {cell.zone}
          </text>
        )}

        <text
          x={pos.x + CELL_SIZE / 2}
          y={pos.y + CELL_SIZE - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#E5E7EB"
          style={{ pointerEvents: 'none' }}
        >
          {(cell as any).metadata?.label || cell.id}
        </text>
      </g>
    );
  }, [cellPositions, currentPosition, reachableCellIds, highlightedCells, onCellClick]);

  const renderPaths = useMemo(() => {
    const paths: JSX.Element[] = [];
    
    for (const path of layerData.paths) {
      const fromPos = cellPositions[path.from];
      const toPos = cellPositions[path.to];
      
      if (fromPos && toPos) {
        paths.push(
          <line
            key={path.id}
            x1={fromPos.x + CELL_SIZE / 2}
            y1={fromPos.y + CELL_SIZE / 2}
            x2={toPos.x + CELL_SIZE / 2}
            y2={toPos.y + CELL_SIZE / 2}
            stroke="#4B5563"
            strokeWidth={path.pathType === 'shortcut' ? 3 : 4}
            strokeDasharray={path.pathType === 'shortcut' ? '5,5' : 'none'}
            opacity={0.6}
          />
        );
      }
    }
    
    return paths;
  }, [layerData.paths, cellPositions]);

  const renderZones = useMemo(() => {
    const zones: JSX.Element[] = [];
    
    for (const zone of layerData.zones) {
      if (zone.cellIds.length > 0) {
        const zoneColor = ZONE_COLORS[zone.type] || '#ccc';
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const cellId of zone.cellIds) {
          const pos = cellPositions[cellId];
          if (pos) {
            minX = Math.min(minX, pos.x - 8);
            minY = Math.min(minY, pos.y - 8);
            maxX = Math.max(maxX, pos.x + CELL_SIZE + 8);
            maxY = Math.max(maxY, pos.y + CELL_SIZE + 8);
          }
        }
        
        zones.push(
          <rect
            key={zone.id}
            x={minX}
            y={minY}
            width={maxX - minX}
            height={maxY - minY}
            rx={16}
            fill={zoneColor}
            opacity={0.15}
            stroke={zoneColor}
            strokeWidth={2}
            strokeDasharray="8,4"
          />
        );
      }
    }
    
    return zones;
  }, [layerData.zones, cellPositions]);

  return (
    <svg width={gridWidth} height={gridHeight} style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="gridBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
      </defs>
      
      <rect width={gridWidth} height={gridHeight} fill="url(#gridBg)" rx={20} />
      
      {renderZones}
      {renderPaths}
      {layerData.cells.map(renderCell)}
    </svg>
  );
}
