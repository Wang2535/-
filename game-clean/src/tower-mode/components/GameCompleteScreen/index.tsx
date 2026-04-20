import React from 'react';
import type { PlayerStatsDisplay } from '../../types/integrator.types';

interface GameCompleteScreenProps {
  stats: PlayerStatsDisplay;
  onRestart: () => void;
  onExit?: () => void;
}

export function GameCompleteScreen({ stats, onRestart, onExit }: GameCompleteScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)',
      color: '#e0e0ff',
      fontFamily: 'monospace',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>

      <h1 style={{
        fontSize: '2.5rem',
        color: '#ffd700',
        marginBottom: '0.5rem',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
      }}>
        恭喜通关！
      </h1>

      <p style={{ color: '#aaaacc', marginBottom: '2rem', fontSize: '1.1rem' }}>
        你已成功征服了9层安全实践之塔！
      </p>

      <div style={{
        background: 'rgba(255, 215, 0, 0.08)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        minWidth: '300px',
        textAlign: 'left',
      }}>
        <h3 style={{ color: '#ffd700', marginBottom: '1rem', textAlign: 'center' }}>📊 最终统计</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <div>
            <span style={{ color: '#8888aa' }}>完成层数：</span>
            <span style={{ color: '#ffd700' }}>{stats.layer}</span>
          </div>
          <div>
            <span style={{ color: '#8888aa' }}>剩余HP：</span>
            <span style={{ color: stats.hp.current > stats.hp.max * 0.5 ? '#44ff88' : '#ff4444' }}>
              {stats.hp.current}/{stats.hp.max}
            </span>
          </div>
          <div>
            <span style={{ color: '#8888aa' }}>数据包：</span>
            <span style={{ color: '#88ddff' }}>{stats.packetCount}</span>
          </div>
          <div>
            <span style={{ color: '#8888aa' }}>已读书籍：</span>
            <span style={{ color: '#44aaff' }}>{stats.bookCount}</span>
          </div>
          <div>
            <span style={{ color: '#8888aa' }}>总移动：</span>
            <span>{stats.moveCount}</span>
          </div>
          <div>
            <span style={{ color: '#8888aa' }}>技能数：</span>
            <span style={{ color: '#aa44ff' }}>{stats.activeSkills.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onRestart}
          style={{
            padding: '0.8rem 2rem',
            background: 'linear-gradient(135deg, #4466aa 0%, #2244aa 100%)',
            border: '2px solid #6688cc',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          🔄 再来一次
        </button>
        {onExit && (
          <button
            onClick={onExit}
            style={{
              padding: '0.8rem 2rem',
              background: 'rgba(60, 60, 100, 0.6)',
              border: '1px solid #5555aa',
              borderRadius: '10px',
              color: '#ccccee',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            🚪 退出
          </button>
        )}
      </div>
    </div>
  );
}
