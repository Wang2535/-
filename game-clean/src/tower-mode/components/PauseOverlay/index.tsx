import React from 'react';

interface PauseOverlayProps {
  onResume: () => void;
  onSave: () => void;
  onExit?: () => void;
}

export function PauseOverlay({ onResume, onSave, onExit }: PauseOverlayProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 150,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)',
        border: '2px solid #5555aa',
        borderRadius: '12px',
        padding: '2rem',
        minWidth: '280px',
        textAlign: 'center',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{
          color: '#88ddff',
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
        }}>
          ⏸️ 游戏暂停
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <button
            onClick={onResume}
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
            ▶️ 继续游戏
          </button>

          <button
            onClick={onSave}
            style={{
              padding: '0.7rem 2rem',
              background: 'rgba(68, 170, 255, 0.15)',
              border: '1px solid #4488ff',
              borderRadius: '10px',
              color: '#88ddff',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            💾 快速保存
          </button>

          {onExit && (
            <button
              onClick={onExit}
              style={{
                padding: '0.6rem 2rem',
                background: 'rgba(60, 60, 100, 0.4)',
                border: '1px solid #5555aa',
                borderRadius: '10px',
                color: '#ccccee',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              🚪 保存并退出
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
