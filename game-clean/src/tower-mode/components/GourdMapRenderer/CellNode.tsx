import { useState, useMemo } from 'react';
import type { CellVisualStyleConfig, CellStateOverride, ShapeType } from './types';
import { renderCellIcon } from './CellIcons';

// 完整设想中要求的格子类型
export type CellType = 
  | 'start' 
  | 'level' 
  | 'elite' 
  | 'boss' 
  | 'bookstore' 
  | 'skill' 
  | 'chance' 
  | 'exchange' 
  | 'empty';

// 完整设想中要求的格子状态
export type CellVisualState = 'locked' | 'pending' | 'current' | 'cleared' | 'default' | 'failed';

interface CellNodeProps {
  cell: any;
  config: any;
  position: { x: number; y: number };
  isCurrent: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  visualStyle?: CellVisualStyleConfig;
  stateOverride?: CellStateOverride;
  bossDangerActive?: boolean;
  cellState?: CellVisualState;
  difficulty?: number;
}

// 格子类型对应的emoji图标
const CELL_TYPE_ICONS: Record<CellType, string> = {
  start: '🚩',
  level: '⚔️',
  elite: '💀',
  boss: '👹',
  bookstore: '📚',
  skill: '✨',
  chance: '❓',
  exchange: '🏪',
  empty: '➖',
};

// 格子类型对应的颜色
const CELL_TYPE_COLORS: Record<CellType, { fill: string; stroke: string }> = {
  start: { fill: '#1a4a1a', stroke: '#4CAF50' },
  level: { fill: '#2a2a4a', stroke: '#666688' },
  elite: { fill: '#4a1a1a', stroke: '#ff4444' },
  boss: { fill: '#4a0a2a', stroke: '#ff2222' },
  bookstore: { fill: '#3a2a1a', stroke: '#ffc107' },
  skill: { fill: '#1a2a4a', stroke: '#2196F3' },
  chance: { fill: '#2a1a4a', stroke: '#9C27B0' },
  exchange: { fill: '#1a3a3a', stroke: '#00BCD4' },
  empty: { fill: '#1a1a2a', stroke: '#444455' },
};

// 状态对应的边框颜色
const CELL_STATE_STROKE: Record<CellVisualState, string> = {
  locked: '#444455',
  pending: '#ff9500',
  current: '#44ff88',
  cleared: '#ffc107',
  default: '#666688',
  failed: '#ff4444',
};

// 难度星级对应的颜色
const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#808080',
  2: '#cccc66',
  3: '#ffaa00',
  4: '#ff5522',
  5: '#ff4444',
};

export function CellNode({
  cell, position, isCurrent, isHighlighted,
  onClick, visualStyle, stateOverride, bossDangerActive,
  cellState, difficulty,
}: CellNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 确定格子类型
  const cellType: CellType = useMemo(() => {
    const type = cell?.type || 'level';
    if (type === 'boss') return 'boss';
    if (type === 'skill') return 'skill';
    if (type === 'bookstore') return 'bookstore';
    if (type === 'chance' || type === 'event') return 'chance';
    if (type === 'shop' || type === 'exchange') return 'exchange';
    if (cell?.isElite) return 'elite';
    if (type === 'start') return 'start';
    if (type === 'empty') return 'empty';
    return 'level';
  }, [cell]);
  
  // 确定状态
  const effectiveState: CellVisualState = useMemo(() => {
    if (cellState) return cellState;
    if (isCurrent) return 'current';
    if (cell?.state === 'locked') return 'locked';
    if (cell?.state === 'cleared') return 'cleared';
    if (cell?.state === 'failed') return 'failed';
    return 'default';
  }, [cellState, isCurrent, cell?.state]);
  
  // 计算大小 - 更大的节点，更清晰！
  const baseSize = cellType === 'boss' ? 12 : 7; // Boss格更大，普通格适中
  const scale = isCurrent ? 1.2 : (isHovered ? 1.1 : 1);
  const nodeSize = baseSize * scale;
  
  const colors = CELL_TYPE_COLORS[cellType];
  const strokeColor = isHighlighted ? '#ffffff' : 
                      isCurrent ? CELL_STATE_STROKE.current : 
                      CELL_STATE_STROKE[effectiveState];
  const strokeWidth = isCurrent ? 2.5 : (isHighlighted ? 2 : 1.5);
  
  const icon = CELL_TYPE_ICONS[cellType];
  
  return (
    <g 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      cursor="pointer"
    >
      {/* 主节点 */}
      <circle 
        cx={position.x} 
        cy={position.y} 
        r={nodeSize / 2} 
        fill={colors.fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={effectiveState === 'locked' ? 0.6 : 1}
      />
      
      {/* 当前位置的动态光圈 */}
      {isCurrent && (
        <circle 
          cx={position.x} 
          cy={position.y} 
          r={nodeSize / 2 + 2}
          fill="none"
          stroke="#44ff88"
          strokeWidth="1.5"
          opacity="0.8"
        >
          <animate 
            attributeName="r" 
            values={`${nodeSize / 2 + 1};${nodeSize / 2 + 3};${nodeSize / 2 + 1}`}
            dur="2s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="opacity" 
            values="0.8;0.3;0.8" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      )}
      
      {/* 已通关的对勾标记 */}
      {effectiveState === 'cleared' && (
        <g transform={`translate(${position.x}, ${position.y})`}>
          <circle r={nodeSize / 3} fill="rgba(76, 175, 80, 0.3)" />
          <path 
            d={`M ${-nodeSize / 6} 0 L 0 ${nodeSize / 6} L ${nodeSize / 5} ${-nodeSize / 8}`}
            stroke="#4CAF50"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      
      {/* 失败的叉号标记 */}
      {effectiveState === 'failed' && (
        <g transform={`translate(${position.x}, ${position.y})`}>
          <circle r={nodeSize / 3} fill="rgba(244, 67, 54, 0.3)" />
          <path 
            d={`M ${-nodeSize / 6} ${-nodeSize / 6} L ${nodeSize / 6} ${nodeSize / 6} M ${nodeSize / 6} ${-nodeSize / 6} L ${-nodeSize / 6} ${nodeSize / 6}`}
            stroke="#f44336"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      
      {/* 节点图标 */}
      <text 
        x={position.x} 
        y={position.y + 0.8}
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={cellType === 'boss' ? nodeSize * 0.45 : nodeSize * 0.5}
        fill="#ffffff"
        opacity={effectiveState === 'locked' ? 0.5 : 1}
      >
        {icon}
      </text>
      
      {/* 难度星级 */}
      {difficulty && difficulty > 0 && (
        <g transform={`translate(${position.x + nodeSize / 3}, ${position.y - nodeSize / 3})`}>
          {Array.from({ length: Math.min(difficulty, 5) }).map((_, i) => (
            <text 
              key={i}
              x={i * nodeSize * 0.18} 
              y="0"
              fontSize={nodeSize * 0.22}
              fill={DIFFICULTY_COLORS[difficulty] || '#ffc107'}
              style={{ textShadow: `0 0 ${nodeSize * 0.05}px rgba(0,0,0,0.5)` }}
            >
              ★
            </text>
          ))}
        </g>
      )}
      
      {/* 悬停提示框 */}
      {isHovered && (
        <g transform={`translate(${position.x + nodeSize}, ${position.y - nodeSize / 2})`}>
          <rect 
            x="0" 
            y="-15" 
            width="100" 
            height="30" 
            rx="4" 
            fill="rgba(0,0,0,0.9)" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="0.5"
          />
          <text 
            x="50" 
            y="2" 
            textAnchor="middle" 
            fontSize="8" 
            fill="#ffffff"
            fontWeight="bold"
          >
            {cell?.name || getCellTypeName(cellType)}
          </text>
          {cell?.description && (
            <text 
              x="50" 
              y="13" 
              textAnchor="middle" 
              fontSize="6" 
              fill="#aaaaaa"
            >
              {cell.description}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

// 辅助函数：获取格子类型名称
function getCellTypeName(type: CellType): string {
  const names: Record<CellType, string> = {
    start: '起点',
    level: '关卡',
    elite: '精英关卡',
    boss: 'Boss',
    bookstore: '书店',
    skill: '技能',
    chance: '机会',
    exchange: '交流会',
    empty: '空格',
  };
  return names[type] || '格子';
}
