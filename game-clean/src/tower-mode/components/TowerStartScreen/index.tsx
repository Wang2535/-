import React, { useState, useEffect } from 'react';

interface TowerStartScreenProps {
  onStart: () => void;
  onLoad: (slotId: string) => void;
  onExit?: () => void;
}

export function TowerStartScreen({ onStart, onLoad, onExit }: TowerStartScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showSaves, setShowSaves] = useState(false);
  const [saves] = useState<Array<{ slotId: string; name: string; layer: number; time: string }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.8s ease',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏰</div>

      <h1 style={{
        fontSize: '2.5rem',
        color: '#ffd700',
        marginBottom: '0.5rem',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
      }}>
        安全实践之塔
      </h1>

      <p style={{ color: '#8888aa', marginBottom: '3rem', fontSize: '1rem' }}>
        攀登9层，征服网络安全挑战
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '220px' }}>
        <button
          onClick={onStart}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #4466aa 0%, #2244aa 100%)',
            border: '2px solid #6688cc',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
          }}
        >
          ⚔️ 新游戏
        </button>

        <button
          onClick={() => setShowSaves(!showSaves)}
          style={{
            padding: '0.8rem 2rem',
            background: 'rgba(60, 60, 100, 0.6)',
            border: '1px solid #5555aa',
            borderRadius: '10px',
            color: '#ccccee',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          📂 继续游戏
        </button>

        {showSaves && (
          <div style={{
            background: 'rgba(20, 20, 50, 0.8)',
            border: '1px solid #444477',
            borderRadius: '8px',
            padding: '0.8rem',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {saves.length > 0 ? (
              saves.map((save) => (
                <button
                  key={save.slotId}
                  onClick={() => onLoad(save.slotId)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(60, 60, 100, 0.4)',
                    border: '1px solid #444477',
                    borderRadius: '6px',
                    color: '#ccccee',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '0.3rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>{save.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8888aa' }}>
                    第{save.layer}层 · {save.time}
                  </div>
                </button>
              ))
            ) : (
              <div style={{ color: '#666688', padding: '0.5rem', fontSize: '0.85rem' }}>
                暂无存档
              </div>
            )}
          </div>
        )}

        {onExit && (
          <button
            onClick={onExit}
            style={{
              padding: '0.6rem 2rem',
              background: 'transparent',
              border: '1px solid #444466',
              borderRadius: '10px',
              color: '#666688',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            🚪 退出
          </button>
        )}
      </div>
    </div>
  );
}
