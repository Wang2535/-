# C组 - 第五轮：主地图交互组件开发 Prompt

## 任务目标
实现9层塔主地图的交互组件，包括层级热区、左侧面板导航、聚焦覆盖层、锁定提示模态框，并重构主地图视图。

## 参考设计
参考文件：`tower_final_interactive.html` 中的交互设计

## 具体任务

### Task C1: 实现层级热区组件

创建文件 `src/tower-mode/components/LayerHotspot.tsx`：

```typescript
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
```

### Task C2: 实现左侧面板导航

创建文件 `src/tower-mode/components/LayerSidePanel.tsx`：

```typescript
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
```

### Task C3: 实现聚焦覆盖层

创建文件 `src/tower-mode/components/LayerFocusOverlay.tsx`：

```typescript
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
```

### Task C4: 实现锁定提示模态框

创建文件 `src/tower-mode/components/LayerLockedModal.tsx`：

```typescript
import React from 'react';

interface LayerLockedModalProps {
  layerNumber: number;
  onClose: () => void;
}

export const LayerLockedModal: React.FC<LayerLockedModalProps> = ({ layerNumber, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'rgba(40,40,40,0.95)', borderRadius: '16px',
        padding: '40px', maxWidth: '400px', textAlign: 'center',
        border: '2px solid #666'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: '#888', marginBottom: '15px' }}>层级锁定</h2>
        <p style={{ color: '#aaa', marginBottom: '25px' }}>第 {layerNumber} 层尚未解锁</p>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '25px' }}>需完成第 {layerNumber - 1} 层后解锁</p>
        <button onClick={onClose} style={{
          padding: '12px 30px', backgroundColor: 'rgba(100,100,100,0.3)',
          color: 'white', border: '1px solid #666', borderRadius: '8px', cursor: 'pointer'
        }}>关闭</button>
      </div>
    </div>
  );
};
```

### Task C5: 重构主地图视图组件

重构 `src/tower-mode/components/TowerMapView/index.tsx`：

```typescript
import React, { useState } from 'react';
import { DynamicBackground } from '../DynamicBackground';
import { LayerHotspot } from '../LayerHotspot';
import { LayerFocusOverlay } from '../LayerFocusOverlay';
import { LayerLockedModal } from '../LayerLockedModal';
import type { LayerState } from '../../types/layerMetadata.types';
import { getAllLayerMetadata, getHotspotConfig } from '../../data/layerRegistry';

interface TowerMapViewProps {
  layerStates: Record<number, LayerState>;
  onSelectLayer: (layerNumber: number) => void;
}

export const TowerMapView: React.FC<TowerMapViewProps> = ({ layerStates, onSelectLayer }) => {
  const [focusedLayer, setFocusedLayer] = useState<number | null>(null);
  const [showLockedModal, setShowLockedModal] = useState<number | null>(null);
  const layerMetadata = getAllLayerMetadata();

  const handleLayerClick = (layerNumber: number) => {
    const state = layerStates[layerNumber];
    if (state.unlocked) {
      setFocusedLayer(layerNumber);
    } else {
      setShowLockedModal(layerNumber);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <DynamicBackground />
      <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '600px', margin: '0 auto' }}>
        {Array.from({ length: 9 }, (_, i) => i + 1).map(layerNum => (
          <LayerHotspot
            key={layerNum}
            layerNumber={layerNum}
            config={getHotspotConfig(layerNum)}
            metadata={layerMetadata[layerNum]}
            state={layerStates[layerNum]}
            onClick={handleLayerClick}
            isFocused={focusedLayer === layerNum}
          />
        ))}
      </div>
      {focusedLayer && (
        <LayerFocusOverlay
          layerNumber={focusedLayer}
          metadata={layerMetadata[focusedLayer]}
          state={layerStates[focusedLayer]}
          onEnter={() => { onSelectLayer(focusedLayer); setFocusedLayer(null); }}
          onClose={() => setFocusedLayer(null)}
        />
      )}
      {showLockedModal && (
        <LayerLockedModal
          layerNumber={showLockedModal}
          onClose={() => setShowLockedModal(null)}
        />
      )}
    </div>
  );
};
```

## 验收标准
- [ ] 层级热区组件定位准确，点击事件正常
- [ ] 左侧面板导航显示完整，点击可聚焦对应层
- [ ] 聚焦覆盖层显示层级详情，进入/返回按钮可用
- [ ] 锁定提示模态框在点击锁定层时触发
- [ ] 主地图视图重构完成，整合所有组件
- [ ] TypeScript编译无错误
