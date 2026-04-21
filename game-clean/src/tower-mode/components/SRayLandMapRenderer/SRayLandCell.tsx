import { useState, useMemo } from 'react';
import type { SRayLandCell as SRayLandCellType } from './SRayLandMapRenderer';

// 扩展SRayLandCell类型以支持关卡信息
interface ExtendedSRayLandCell extends SRayLandCellType {
  metadata?: {
    levelId?: string;
    levelName?: string;
    difficulty?: number;
    isElite?: boolean;
  };
}

interface SRayLandCellProps {
  cell: ExtendedSRayLandCell;
  isCurrent: boolean;
  isAlternate: boolean;
  onClick: () => void;
}

// 格子类型对应的emoji图标
const CELL_TYPE_ICONS: Record<string, string> = {
  start: '🚩',
  battle: '⚔️',
  chance: '❓',
  bookstore: '📚',
  skill: '✨',
  special: '⭐',
  elite: '💀',
  boss: '👹',
  end: '🏁',
  default: '•',
};

// 格子类型对应的额外样式
const CELL_TYPE_STYLES: Record<string, { glow: string; extra: string }> = {
  start: { glow: '#4CAF50', extra: 'rgba(76, 175, 80, 0.3)' },
  battle: { glow: '#f44336', extra: 'rgba(244, 67, 54, 0.3)' },
  chance: { glow: '#9C27B0', extra: 'rgba(156, 39, 176, 0.3)' },
  bookstore: { glow: '#ffc107', extra: 'rgba(255, 193, 7, 0.3)' },
  skill: { glow: '#2196F3', extra: 'rgba(33, 150, 243, 0.3)' },
  special: { glow: '#FFD700', extra: 'rgba(255, 215, 0, 0.3)' },
  elite: { glow: '#ff4444', extra: 'rgba(255, 68, 68, 0.3)' },
  boss: { glow: '#ff2222', extra: 'rgba(255, 34, 34, 0.3)' },
  end: { glow: '#00BCD4', extra: 'rgba(0, 188, 212, 0.3)' },
  default: { glow: '#8B4513', extra: 'rgba(139, 69, 19, 0.1)' },
};

export function SRayLandCell({ cell, isCurrent, isAlternate, onClick }: SRayLandCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cellSize = 6;
  const scale = isCurrent ? 1.15 : (isHovered ? 1.1 : 1);
  const displaySize = cellSize * scale;

  // 格子填充色 - 橙、黄、白三色交替
  const colorIndex = parseInt(cell.id.replace(/[^0-9]/g, '')) - 1;
  const colors = ['#FFA500', '#FFD700', '#FFFFFF'];
  const fillColor = colors[colorIndex % colors.length];

  const typeStyle = CELL_TYPE_STYLES[cell.type] || CELL_TYPE_STYLES.default;
  const icon = CELL_TYPE_ICONS[cell.type] || CELL_TYPE_ICONS.default;

  // 状态透明度
  const opacity = cell.state === 'locked' ? 0.5 : 1;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      cursor="pointer"
      transform={`translate(${cell.position.x}, ${cell.position.y})`}
    >
      {/* 主格子 - 正方形 */}
      <rect
        x={-displaySize / 2}
        y={-displaySize / 2}
        width={displaySize}
        height={displaySize}
        fill={fillColor}
        stroke={isCurrent ? typeStyle.glow : '#000000'}
        strokeWidth={isCurrent ? 2 : 1.5}
        opacity={opacity}
      />

      {/* 当前位置的动态光圈 */}
      {isCurrent && (
        <rect
          x={-displaySize / 2 - 1}
          y={-displaySize / 2 - 1}
          width={displaySize + 2}
          height={displaySize + 2}
          fill="none"
          stroke={typeStyle.glow}
          strokeWidth="1"
          opacity="0.8"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.8;0.3;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </rect>
      )}

      {/* 已通关的对勾标记 */}
      {cell.state === 'cleared' && (
        <g>
          <circle r={displaySize / 3} fill="rgba(76, 175, 80, 0.3)" />
          <path
            d={`M ${-displaySize / 6} 0 L 0 ${displaySize / 6} L ${displaySize / 5} ${-displaySize / 8}`}
            stroke="#4CAF50"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* 失败的叉号标记 */}
      {cell.state === 'failed' && (
        <g>
          <circle r={displaySize / 3} fill="rgba(244, 67, 54, 0.3)" />
          <path
            d={`M ${-displaySize / 6} ${-displaySize / 6} L ${displaySize / 6} ${displaySize / 6} M ${displaySize / 6} ${-displaySize / 6} L ${-displaySize / 6} ${displaySize / 6}`}
            stroke="#f44336"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* 格子图标 */}
      <text
        x="0"
        y="0.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={displaySize * 0.5}
        opacity={opacity}
      >
        {icon}
      </text>

      {/* 难度星级 */}
      {cell.type === 'battle' && cell.metadata?.difficulty && (
        <text
          x={displaySize / 2 - 1}
          y={displaySize / 2 - 1}
          textAnchor="end"
          dominantBaseline="auto"
          fontSize="2"
          fill={getDifficultyColor(cell.metadata.difficulty)}
          fontWeight="bold"
        >
          {'★'.repeat(cell.metadata.difficulty)}
        </text>
      )}

      {/* 精英标记 */}
      {cell.type === 'battle' && cell.metadata?.isElite && (
        <text
          x={-displaySize / 2 + 1}
          y={displaySize / 2 - 1}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize="2"
          fill="#FFD700"
          fontWeight="bold"
        >
          精英
        </text>
      )}

      {/* 终点特殊标记 */}
      {cell.type === 'end' && (
        <text
          x="0"
          y={-displaySize / 2 - 2}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize="3"
          fill="#00BCD4"
          fontWeight="bold"
        >
          end
        </text>
      )}

      {/* 悬停提示框 */}
      {isHovered && (
        <g transform={`translate(${displaySize / 2 + 2}, ${-displaySize / 2})`}>
          <rect
            x="0"
            y="-12"
            width={cell.type === 'battle' && cell.metadata ? "120" : "70"}
            height={cell.type === 'battle' && cell.metadata ? "40" : "24"}
            rx="3"
            fill="rgba(0,0,0,0.9)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
          <text
            x={cell.type === 'battle' && cell.metadata ? "60" : "35"}
            y="-5"
            textAnchor="middle"
            fontSize="6"
            fill="#ffffff"
            fontWeight="bold"
          >
            {getCellTypeName(cell.type)}
          </text>
          {cell.type === 'battle' && cell.metadata && (
            <>
              <text
                x="60"
                y="3"
                textAnchor="middle"
                fontSize="5"
                fill="#ffffff"
              >
                {cell.metadata.levelName || '未知关卡'}
              </text>
              <text
                x="60"
                y="12"
                textAnchor="middle"
                fontSize="4"
                fill={getDifficultyColor(cell.metadata.difficulty || 1)}
              >
                难度: {'★'.repeat(cell.metadata.difficulty || 1)}
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
}

// 辅助函数：获取格子类型名称
function getCellTypeName(type: string): string {
  const names: Record<string, string> = {
    start: '起点',
    battle: '战斗',
    chance: '机会',
    bookstore: '书店',
    skill: '技能',
    special: '特殊',
    elite: '精英',
    boss: 'Boss',
    end: '终点',
    default: '格子',
  };
  return names[type] || '格子';
}

// 辅助函数：根据难度获取颜色
function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return '#4CAF50'; // 绿色 - 简单
    case 2:
      return '#2196F3'; // 蓝色 - 普通
    case 3:
      return '#FFC107'; // 黄色 - 困难
    case 4:
      return '#FF9800'; // 橙色 - 极难
    case 5:
      return '#F44336'; // 红色 - 地狱
    default:
      return '#9E9E9E'; // 灰色 - 未知
  }
}
