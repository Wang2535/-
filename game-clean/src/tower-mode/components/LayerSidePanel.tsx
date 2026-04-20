import React from 'react';
import type { LayerMetadata, LayerState } from '../types/layerMetadata.types';

interface LayerSidePanelProps {
  layerMetadata: Record<number, LayerMetadata>;
  layerStates: Record<number, LayerState>;
  currentLayer?: number;
  onSelectLayer: (layerNumber: number) => void;
  onClose?: () => void;
}

export const LayerSidePanel: React.FC<LayerSidePanelProps> = ({
  layerMetadata, layerStates, currentLayer, onSelectLayer, onClose
}) => {
  const layers = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '280px', height: '100%',
      backgroundColor: 'rgba(10, 10, 30, 0.95)', borderRight: '1px solid rgba(100,100,150,0.3)',
      padding: '20px', overflowY: 'auto', zIndex: 50, boxShadow: '2px 0 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(100,100,150,0.3)' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>🏰 层级导航</h2>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {layers.map(layerNum => {
          const metadata = layerMetadata[layerNum];
          const state = layerStates[layerNum];
          const isCurrent = currentLayer === layerNum;
          return (
            <div key={layerNum} onClick={() => state.unlocked && onSelectLayer(layerNum)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
              backgroundColor: isCurrent ? `${metadata.color}30` : state.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(100,100,100,0.1)',
              borderRadius: '8px', cursor: state.unlocked ? 'pointer' : 'not-allowed',
              border: `1px solid ${isCurrent ? metadata.color : 'transparent'}`,
              opacity: state.unlocked ? 1 : 0.5, transition: 'all 0.2s ease'
            }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: metadata.color, boxShadow: `0 0 8px ${metadata.color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{metadata.name}</div>
                <div style={{ color: '#888', fontSize: '0.75rem' }}>{metadata.theme}</div>
              </div>
              {!state.unlocked && <span>🔒</span>}
              {state.completed && <span style={{ color: '#FFD700' }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
