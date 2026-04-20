import React from 'react';
import type { GamePhase, SkillSummary } from '../../types/integrator.types';

interface TowerHUDProps {
  layer: number;
  hp: { current: number; max: number };
  activeSkills: SkillSummary[];
  packetCount: number;
  bookCount: number;
  moveCount: number;
  phase: GamePhase;
  onMenuClick: () => void;
  onReturnToMap?: () => void;
}

export function TowerHUD({
  layer,
  hp,
  activeSkills,
  packetCount,
  bookCount,
  moveCount,
  phase,
  onMenuClick,
  onReturnToMap,
}: TowerHUDProps) {
  const hpPercent = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
  const hpColor = hpPercent > 60 ? '#44ff88' : hpPercent > 30 ? '#ffaa44' : '#ff4444';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      background: 'rgba(10, 10, 40, 0.9)',
      borderBottom: '1px solid #333366',
      fontSize: '0.85rem',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🏰</span>
          <span style={{ color: '#ffd700', fontWeight: 'bold' }}>第 {layer} 层</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '1rem' }}>❤️</span>
          <div style={{
            width: '80px',
            height: '12px',
            background: 'rgba(60, 60, 80, 0.8)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: hpColor,
              borderRadius: '6px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ color: hpColor, fontSize: '0.75rem' }}>
            {hp.current}/{hp.max}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '1rem' }}>📦</span>
          <span>{packetCount}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '1rem' }}>📖</span>
          <span>{bookCount}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '1rem' }}>👣</span>
          <span>{moveCount}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {onReturnToMap && (
          <button
            onClick={onReturnToMap}
            style={{
              background: 'rgba(100, 100, 150, 0.6)',
              border: '1px solid #7777bb',
              borderRadius: '4px',
              color: '#ccddff',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            🗺️ 返回总地图
          </button>
        )}
        
        {activeSkills.length > 0 && (
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {activeSkills.map((skill) => (
              <span
                key={skill.id}
                style={{
                  padding: '0.15rem 0.4rem',
                  background: 'rgba(80, 80, 150, 0.6)',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  border: '1px solid #6666aa',
                }}
              >
                ⚡{skill.name}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onMenuClick}
          style={{
            background: 'rgba(60, 60, 100, 0.6)',
            border: '1px solid #5555aa',
            borderRadius: '4px',
            color: '#ccccee',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          ☰
        </button>
      </div>
    </div>
  );
}
