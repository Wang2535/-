import React, { useMemo, useCallback } from 'react';
import type {
  TowerLayerData,
  GameCell,
  PathConnection,
  ZoneDefinition,
  Coordinate2D,
  CellType,
  CellState,
} from '../../types';

interface LayerMapRendererProps {
  layerData: TowerLayerData;
  currentPosition: Coordinate2D;
  highlightedCells: string[];
  onCellClick: (cellId: string) => void;
  playerPosition?: string | null;
}

const CELL_TYPE_CONFIG: Record<CellType, { icon: string; color: string; label: string }> = {
  battle: { icon: '⚔️', color: '#ff6644', label: '战斗' },
  chance: { icon: '❓', color: '#ffcc44', label: '事件' },
  bookstore: { icon: '📚', color: '#44aaff', label: '书店' },
  skill: { icon: '⚡', color: '#aa44ff', label: '技能' },
  boss: { icon: '👑', color: '#ff4444', label: 'BOSS' },
  end: { icon: '🏁', color: '#44ff88', label: '终点' },
  start: { icon: '🚪', color: '#44ff88', label: '起点' },
};

const CELL_STATE_STYLES: Record<CellState, { opacity: number; filter: string }> = {
  locked: { opacity: 0.4, filter: 'grayscale(0.8)' },
  unlocked: { opacity: 1, filter: 'none' },
  completed: { opacity: 0.7, filter: 'brightness(0.7)' },
  current: { opacity: 1, filter: 'none' },
};

const ZONE_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  W: { color: '#FECACA', label: '虚弱区' },
  N: { color: '#DBEAFE', label: '知识区' },
  I: { color: '#F3E8FF', label: '反转区' },
  P: { color: '#FEF3C7', label: '休整区' },
  S: { color: '#D1FAE5', label: '安全区' },
  D: { color: '#FEE2E2', label: '危险区' },
};

export function LayerMapRenderer({
  layerData,
  currentPosition,
  highlightedCells,
  onCellClick,
  playerPosition,
}: LayerMapRendererProps) {
  const { cells, paths, zones, gridSize, colorScheme } = layerData;

  // Calculate cell positions based on grid
  const cellPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; row: number; col: number }> = {};
    const cellWidth = 100 / gridSize.cols;
    const cellHeight = 100 / gridSize.rows;

    cells.forEach((cell) => {
      const [row, col] = cell.coordinate;
      positions[cell.id] = {
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2,
        row,
        col,
      };
    });

    return positions;
  }, [cells, gridSize]);

  // Calculate path SVG data
  const pathElements = useMemo(() => {
    return paths.map((path) => {
      const from = cellPositions[path.from];
      const to = cellPositions[path.to];

      if (!from || !to) return null;

      const isShortcut = path.pathType === 'shortcut';
      const strokeColor = isShortcut ? '#aa44ff' : colorScheme.pathColor;
      const strokeDasharray = isShortcut ? '5,5' : 'none';
      const strokeWidth = isShortcut ? 2 : 3;

      return (
        <line
          key={path.id}
          x1={`${from.x}%`}
          y1={`${from.y}%`}
          x2={`${to.x}%`}
          y2={`${to.y}%`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          opacity={0.6}
        />
      );
    });
  }, [paths, cellPositions, colorScheme.pathColor]);

  // Calculate zone overlay elements
  const zoneElements = useMemo(() => {
    return zones.map((zone) => {
      const zoneCells = zone.cellIds
        .map((id) => cellPositions[id])
        .filter(Boolean);

      if (zoneCells.length === 0) return null;

      const config = ZONE_TYPE_CONFIG[zone.type] || { color: zone.visualConfig?.overlayColor || '#888888', label: zone.name };

      return (
        <g key={zone.id}>
          {zoneCells.map((pos, idx) => (
            <rect
              key={`${zone.id}-${idx}`}
              x={`${pos.x - 45 / gridSize.cols}%`}
              y={`${pos.y - 45 / gridSize.rows}%`}
              width={`${90 / gridSize.cols}%`}
              height={`${90 / gridSize.rows}%`}
              fill={config.color}
              opacity={zone.visualConfig?.overlayOpacity || 0.2}
              rx={4}
            />
          ))}
          <text
            x={`${zoneCells[0]?.x}%`}
            y={`${zoneCells[0]?.y - 8}%`}
            fill={config.color}
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {zone.type}
          </text>
        </g>
      );
    });
  }, [zones, cellPositions, gridSize]);

  // Handle cell click
  const handleCellClick = useCallback((cellId: string) => {
    onCellClick(cellId);
  }, [onCellClick]);

  // Find current player cell
  const currentPlayerCell = useMemo(() => {
    if (playerPosition) {
      return cells.find((c) => c.id === playerPosition);
    }
    return cells.find((c) =>
      c.coordinate[0] === currentPosition[0] &&
      c.coordinate[1] === currentPosition[1]
    );
  }, [cells, currentPosition, playerPosition]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: colorScheme.background,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${colorScheme.primary}10 1px, transparent 1px),
            linear-gradient(to bottom, ${colorScheme.primary}10 1px, transparent 1px)
          `,
          backgroundSize: `${100 / gridSize.cols}% ${100 / gridSize.rows}%`,
        }}
      />

      {/* SVG Layer for paths and zones */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {pathElements}
        {zoneElements}
      </svg>

      {/* Cells Layer */}
      {cells.map((cell) => {
        const pos = cellPositions[cell.id];
        if (!pos) return null;

        const config = CELL_TYPE_CONFIG[cell.type];
        const isHighlighted = highlightedCells.includes(cell.id);
        const isCurrentPlayer = currentPlayerCell?.id === cell.id;
        const stateStyle = CELL_STATE_STYLES[cell.state];

        return (
          <div
            key={cell.id}
            onClick={() => handleCellClick(cell.id)}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${80 / gridSize.cols}%`,
              height: `${80 / gridSize.rows}%`,
              minWidth: '50px',
              minHeight: '50px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isHighlighted
                ? `linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%)`
                : `linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)`,
              border: `2px solid ${isHighlighted ? '#ffffff' : config.color}`,
              borderRadius: '8px',
              cursor: cell.state === 'locked' ? 'not-allowed' : 'pointer',
              opacity: stateStyle.opacity,
              filter: stateStyle.filter,
              boxShadow: isHighlighted
                ? `0 0 20px ${config.color}80`
                : `0 0 10px ${config.color}40`,
              transition: 'all 0.2s ease',
              zIndex: isCurrentPlayer ? 10 : 1,
            }}
          >
            {/* Cell Icon */}
            <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
              {config.icon}
            </span>

            {/* Cell Label */}
            <span
              style={{
                fontSize: '0.65rem',
                color: config.color,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {cell.metadata?.label || config.label}
            </span>

            {/* Cell ID (small) */}
            <span
              style={{
                fontSize: '0.5rem',
                color: '#666688',
                marginTop: '0.1rem',
              }}
            >
              {cell.id}
            </span>

            {/* Player Indicator */}
            {isCurrentPlayer && (
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '20px',
                  height: '20px',
                  background: '#44ff88',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  boxShadow: '0 0 10px #44ff88',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                🎮
              </div>
            )}

            {/* Highlight Indicator */}
            {isHighlighted && (
              <div
                style={{
                  position: 'absolute',
                  inset: -4,
                  border: `2px dashed ${config.color}`,
                  borderRadius: '12px',
                  animation: 'spin 3s linear infinite',
                }}
              />
            )}

            {/* Completed Marker */}
            {cell.state === 'completed' && (
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  fontSize: '0.8rem',
                }}
              >
                ✓
              </div>
            )}
          </div>
        );
      })}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
