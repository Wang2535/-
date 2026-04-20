import React from 'react';
import type { LayerMetadata, LayerState } from '../../types/layerMetadata.types';

interface LayerSidePanelProps {
  layerMetadata: LayerMetadata[];
  layerStates: Record<number, LayerState>;
  onSelectLayer: (layerNumber: number) => void;
  onClose: () => void;
}

export const LayerSidePanel: React.FC<LayerSidePanelProps> = ({
  layerMetadata,
  layerStates,
  onSelectLayer,
  onClose,
}) => {
  const getStateLabel = (state: LayerState): string => {
    switch (state) {
      case 'locked': return '🔒 锁定';
      case 'unlocked': return '▶ 可进入';
      case 'completed': return '✅ 已完成';
      default: return '';
    }
  };

  const getStateColor = (state: LayerState): string => {
    switch (state) {
      case 'locked': return '#444466';
      case 'unlocked': return '#4466aa';
      case 'completed': return '#22aa55';
      default: return '#444466';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: 0,
      width: '280px',
      height: 'calc(100% - 60px)',
      backgroundColor: 'rgba(10, 10, 30, 0.95)',
      borderRight: '1px solid rgba(100, 100, 150, 0.3)',
      zIndex: 90,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      opacity: 0.7,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(100, 100, 150, 0.3)',
      }}>
        <h3 style={{ color: '#e0e0ff', margin: 0, fontSize: '1rem' }}>🗺️ 层级列表</h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '1.2rem' }}
        >✕</button>
      </div>

      <div style={{ padding: '8px' }}>
        {layerMetadata.map((meta) => {
          const state = layerStates[meta.layerNumber] ?? 'locked';
          const isAccessible = state === 'unlocked' || state === 'completed';

          return (
            <div
              key={meta.layerNumber}
              style={{
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: 'rgba(20, 20, 50, 0.8)',
                border: `1px solid ${getStateColor(state)}40`,
                opacity: state === 'locked' ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.5rem' }}>{meta.iconEmoji}</span>
                <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  第{meta.layerNumber}层 · {meta.themeName}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#8888aa', marginBottom: '4px' }}>
                {meta.shapeDescription} · 难度 {meta.difficultyRange[0]}-{meta.difficultyRange[1]}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: `${getStateColor(state)}30`,
                  color: getStateColor(state),
                  border: `1px solid ${getStateColor(state)}50`,
                }}>
                  {getStateLabel(state)}
                </span>

                {isAccessible && (
                  <button
                    onClick={() => onSelectLayer(meta.layerNumber)}
                    style={{
                      padding: '4px 12px',
                      background: state === 'completed'
                        ? 'linear-gradient(135deg, #22aa55, #118844)'
                        : 'linear-gradient(135deg, #4466aa, #2244aa)',
                      border: state === 'completed' ? '1px solid #33bb66' : '1px solid #6688cc',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {state === 'completed' ? '🔄 重玩' : '▶ 进入'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
