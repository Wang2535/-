import React from 'react';
import type { HotspotConfig, LayerMetadata, LayerState } from '../types/layerMetadata.types';

interface LayerHotspotProps {
  layerNumber: number;
  config: HotspotConfig;
  metadata: LayerMetadata;
  state: LayerState;
  onClick: (layerNumber: number) => void;
  isFocused?: boolean;
}

export const LayerHotspot: React.FC<LayerHotspotProps> = ({
  layerNumber,
  config,
  metadata,
  state,
  onClick,
  isFocused = false
}) => {
  const handleClick = () => {
    onClick(layerNumber);
  };

  const getStateStyles = () => {
    if (state.completed) {
      return { borderColor: '#FFD700', boxShadow: `0 0 20px ${metadata.color}80`, opacity: 1 };
    }
    if (state.unlocked) {
      return { borderColor: metadata.color, boxShadow: `0 0 15px ${metadata.color}60`, opacity: 1 };
    }
    return { borderColor: '#666', boxShadow: 'none', opacity: 0.5 };
  };

  const stateStyles = getStateStyles();

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: `${config.bottom}%`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${config.width}%`,
        height: `${config.height}%`,
        backgroundColor: state.unlocked ? `${metadata.color}20` : 'rgba(100,100,100,0.2)',
        border: `2px solid ${stateStyles.borderColor}`,
        borderRadius: '8px',
        cursor: state.unlocked ? 'pointer' : 'not-allowed',
        opacity: stateStyles.opacity,
        boxShadow: stateStyles.boxShadow,
        transition: 'all 0.3s ease',
        zIndex: isFocused ? 100 : 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (state.unlocked) {
          e.currentTarget.style.transform = 'translateX(-50%) scale(1.02)';
          e.currentTarget.style.boxShadow = `0 0 30px ${metadata.color}80`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
        e.currentTarget.style.boxShadow = stateStyles.boxShadow;
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '5px 15px', backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '20px', border: `1px solid ${state.unlocked ? metadata.color : '#666'}`
      }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: metadata.color, boxShadow: `0 0 10px ${metadata.color}` }} />
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{metadata.name}</span>
        {!state.unlocked && <span style={{ color: '#888', fontSize: '0.8rem' }}>🔒</span>}
        {state.completed && <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>✓</span>}
      </div>
      {state.unlocked && (
        <div style={{ position: 'absolute', bottom: '5px', left: '10px', right: '10px', height: '3px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
          <div style={{ width: `${state.progress}%`, height: '100%', backgroundColor: metadata.color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
        </div>
      )}
    </div>
  );
};
