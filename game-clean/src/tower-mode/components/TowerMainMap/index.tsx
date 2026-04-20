import React, { useState } from 'react';
import { TowerMapView } from '../TowerMapView';
import { LayerSidePanel } from '../LayerSidePanel';
import type { LayerState } from '../../types/layerMetadata.types';
import type { LayerMetadata } from '../../types/layerMetadata.types';
import { getAllLayerMetadata } from '../../data/layerRegistry';

interface TowerMainMapProps {
  layerStates: Record<number, LayerState>;
  onSelectLayer: (layerNumber: number) => void;
  onReturn: () => void;
}

export const TowerMainMap: React.FC<TowerMainMapProps> = ({
  layerStates,
  onSelectLayer,
  onReturn,
}) => {
  const [showSidePanel, setShowSidePanel] = useState(true);
  const layerMetadata = getAllLayerMetadata();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#0a0a1a',
    }}>

      {/* Top Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'rgba(10, 10, 30, 0.92)',
        borderBottom: '1px solid rgba(100, 100, 150, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            style={{
              background: 'none',
              border: '1px solid rgba(100, 100, 150, 0.5)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ☰ 层级列表
          </button>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>
            🏰 安全实践爬塔模式
          </h1>
        </div>

        <button
          onClick={onReturn}
          style={{
            background: 'rgba(100, 100, 150, 0.3)',
            border: '1px solid rgba(100, 100, 150, 0.5)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          返回主菜单
        </button>
      </div>

      {/* Left Side Panel */}
      {showSidePanel && (
        <LayerSidePanel
          layerMetadata={layerMetadata}
          layerStates={layerStates}
          onSelectLayer={(layerNumber) => {
            onSelectLayer(layerNumber);
          }}
          onClose={() => setShowSidePanel(false)}
        />
      )}

      {/* Main Map View Area */}
      <div style={{
        marginLeft: showSidePanel ? '280px' : '0',
        marginTop: '60px',
        height: 'calc(100% - 60px)',
        position: 'relative',
        transition: 'margin-left 0.3s ease',
      }}>
        <TowerMapView layerStates={layerStates} onSelectLayer={onSelectLayer} />
      </div>
    </div>
  );
};
