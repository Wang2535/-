import React from 'react';
import type { GamePhase } from '../../types/gameMechanics.types';

interface GameHUDProps {
  layerName: string;
  turnNumber: number;
  techValue: number;
  gold: number;
  phase: string;
  onRollDice: () => void;
  isRolling: boolean;
  canRoll: boolean;
}

const PHASE_LABELS: Record<string, string> = {
  idle: '⏳ 等待投掷',
  dice_ready: '🎲 准备投掷',
  dice_rolling: '🎲 投掷中...',
  dice_result: '📍 选择路径',
  path_selecting: '🔀 选择路径',
  moving: '🏃 移动中...',
  cell_arrived: '👀 到达新位置',
  cell_interacting: '⚡ 格子交互中',
  battle_preparing: '⚔️ 战斗准备',
  battle_active: '⚔️ 战斗进行中',
  battle_settling: '✅ 战斗结算',
  turn_ending: '🔄 回合结束',
  layer_transitioning: '🔄 层级过渡',
};

function getPhaseColor(phase: string): string {
  if (phase === 'idle' || phase === 'dice_result') return '#44ff88';
  if (phase === 'moving' || phase === 'path_selecting') return '#4488ff';
  if (phase.includes('battle')) return '#ff4444';
  return '#cccccc';
}

export function GameHUD({
  layerName,
  turnNumber,
  techValue,
  gold,
  phase,
  onRollDice,
  isRolling,
  canRoll,
}: GameHUDProps) {
  const phaseLabel = PHASE_LABELS[phase] || `未知阶段: ${phase}`;
  const phaseColor = getPhaseColor(phase);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      background: 'rgba(10, 10, 40, 0.9)',
      borderRadius: '8px',
      fontSize: '0.9rem',
    }}>
      {/* 左侧区域：层级名 + 回合数 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1.1rem' }}>
          {layerName}
        </span>
        <span style={{ color: '#aaaacc' }}>
          第 {turnNumber} 回合
        </span>
      </div>

      {/* 中间区域：Phase 标签 */}
      <div style={{
        padding: '0.4rem 1rem',
        borderRadius: '6px',
        background: `${phaseColor}22`,
        border: `1px solid ${phaseColor}44`,
        color: phaseColor,
        fontWeight: '600',
      }}>
        {phaseLabel}
      </div>

      {/* 右侧区域：技术值 + 金币 + 投掷按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>💡</span>
          <span style={{ fontWeight: 'bold', color: '#aaddff' }}>{techValue}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>💰</span>
          <span style={{ fontWeight: 'bold', color: '#ffd700' }}>{gold}</span>
        </div>

        <button
          className={isRolling ? 'rolling' : undefined}
          onClick={() => {
            if (!isRolling && canRoll) {
              onRollDice();
            }
          }}
          disabled={isRolling || !canRoll}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            border: '1px solid #5555aa',
            background: isRolling
              ? 'rgba(100, 100, 150, 0.4)'
              : canRoll
                ? 'rgba(80, 80, 160, 0.7)'
                : 'rgba(60, 60, 80, 0.5)',
            color: isRolling ? '#888899' : canRoll ? '#ffffff' : '#666677',
            cursor: (!isRolling && canRoll) ? 'pointer' : 'not-allowed',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          {isRolling ? '🎲 投掷中...' : '🎲 投掷骰子'}
        </button>
      </div>
    </div>
  );
}
