import React, { useEffect, useState } from 'react';

interface LayerTransitionProps {
  data: {
    fromLayer?: number;
    toLayer?: number;
    nextLayerPreview?: {
      themeName?: string;
      shapeDescription?: string;
      estimatedDifficulty?: string;
    };
  } | null;
  onProceed: () => void;
}

export function LayerTransition({ data, onProceed }: LayerTransitionProps) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fromLayer = data?.fromLayer ?? 0;
  const toLayer = data?.toLayer ?? 1;
  const preview = data?.nextLayerPreview;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.85)',
      zIndex: 100,
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      <div style={{
        textAlign: 'center',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'scale(1)' : 'scale(0.5)',
          transition: 'all 0.6s ease 0.2s',
        }}>
          🏰
        </div>

        <div style={{
          fontSize: '1.5rem',
          color: '#ffcc44',
          marginBottom: '0.5rem',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease 0.4s',
        }}>
          第 {fromLayer} 层 完成！
        </div>

        <div style={{
          fontSize: '1.2rem',
          color: '#88ddff',
          marginBottom: '1.5rem',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease 0.6s',
        }}>
          即将进入 第 {toLayer} 层
        </div>

        {preview && (
          <div style={{
            background: 'rgba(68, 170, 255, 0.1)',
            border: '1px solid rgba(68, 170, 255, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            maxWidth: '300px',
            margin: '0 auto 1.5rem',
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.5s ease 0.8s',
          }}>
            {preview.themeName && (
              <div style={{ marginBottom: '0.3rem' }}>
                <span style={{ color: '#88ddff' }}>主题：</span>
                {preview.themeName}
              </div>
            )}
            {preview.estimatedDifficulty && (
              <div>
                <span style={{ color: '#ff8866' }}>预计难度：</span>
                {preview.estimatedDifficulty}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onProceed}
          style={{
            padding: '0.8rem 2rem',
            background: 'linear-gradient(135deg, #4466aa 0%, #2244aa 100%)',
            border: '2px solid #6688cc',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.5s ease 1s',
          }}
        >
          进入下一层
        </button>
      </div>
    </div>
  );
}
