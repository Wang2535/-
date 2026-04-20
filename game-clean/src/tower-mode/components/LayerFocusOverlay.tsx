import React from 'react';
import type { LayerMetadata, LayerState } from '../types/layerMetadata.types';

interface LayerFocusOverlayProps {
  layerNumber: number;
  metadata: LayerMetadata;
  state: LayerState;
  onEnter: () => void;
  onClose: () => void;
}

export const LayerFocusOverlay: React.FC<LayerFocusOverlayProps> = ({
  layerNumber, metadata, state, onEnter, onClose
}) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'rgba(20,20,40,0.95)', borderRadius: '16px',
        padding: '40px', maxWidth: '500px', width: '90%',
        border: `2px solid ${metadata.color}`, boxShadow: `0 0 40px ${metadata.color}40`
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: metadata.color, textShadow: `0 0 20px ${metadata.color}` }}>L{layerNumber}</div>
          <h2 style={{ color: 'white', margin: '10px 0', fontSize: '1.8rem' }}>{metadata.name}</h2>
          <p style={{ color: '#aaa', fontSize: '1rem' }}>{metadata.theme}</p>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>✨ 特色功能</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metadata.features.map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                <span style={{ color: '#ddd', fontSize: '0.9rem' }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={onEnter} style={{
            flex: 1, padding: '15px', backgroundColor: metadata.color, color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
          }}>进入本层</button>
          <button onClick={onClose} style={{
            flex: 1, padding: '15px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer'
          }}>返回</button>
        </div>
      </div>
    </div>
  );
};
