# E组 - 第五轮：集成与入口开发 Prompt

## 任务目标
更新TowerModeApp状态机、创建主地图容器组件、更新TowerStartScreen。

## 具体任务

### Task E1: 更新 TowerModeApp 状态机

修改 `src/tower-mode/TowerModeApp.tsx`：

```typescript
// 添加新的游戏阶段类型
type GamePhase = 'idle' | 'map_overview' | 'playing' | 'paused' | 'completed' | 'failed';

// 修改状态管理
const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

// 处理进入主地图
const handleEnterMapOverview = () => {
  setGamePhase('map_overview');
};

// 处理选择层级
const handleSelectLayer = (layerNumber: number) => {
  setSelectedLayer(layerNumber);
  setGamePhase('playing');
  controller.startNewGame(layerNumber);
};

// 处理返回主地图
const handleReturnToMap = () => {
  setGamePhase('map_overview');
  setSelectedLayer(null);
};

// 渲染逻辑
if (gamePhase === 'idle') {
  return (
    <TowerStartScreen
      onNewGame={handleEnterMapOverview}
      onContinue={handleContinueGame}
    />
  );
}

if (gamePhase === 'map_overview') {
  return (
    <TowerMainMap
      layerStates={controller.getAllLayerStates()}
      onSelectLayer={handleSelectLayer}
      onReturn={handleReturnToStart}
    />
  );
}
```

### Task E2: 创建主地图容器组件

创建文件 `src/tower-mode/components/TowerMainMap.tsx`：

```typescript
import React, { useState } from 'react';
import { DynamicBackground, defaultBackgroundSettings } from './DynamicBackground';
import { TowerMapView } from './TowerMapView';
import { LayerSidePanel } from './LayerSidePanel';
import type { LayerState } from '../types/layerMetadata.types';
import { getAllLayerMetadata } from '../data/layerRegistry';

interface TowerMainMapProps {
  layerStates: Record<number, LayerState>;
  onSelectLayer: (layerNumber: number) => void;
  onReturn: () => void;
}

export const TowerMainMap: React.FC<TowerMainMapProps> = ({
  layerStates, onSelectLayer, onReturn
}) => {
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [backgroundSettings, setBackgroundSettings] = useState(defaultBackgroundSettings);
  const layerMetadata = getAllLayerMetadata();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <DynamicBackground settings={backgroundSettings} onSettingsChange={setBackgroundSettings} />
      
      {/* 顶部导航栏 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        backgroundColor: 'rgba(10,10,30,0.9)', borderBottom: '1px solid rgba(100,100,150,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setShowSidePanel(!showSidePanel)} style={{
            background: 'none', border: '1px solid rgba(100,100,150,0.5)',
            color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer'
          }}>☰ 层级列表</button>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>🏰 安全实践爬塔模式</h1>
        </div>
        <button onClick={onReturn} style={{
          background: 'rgba(100,100,150,0.3)', border: '1px solid rgba(100,100,150,0.5)',
          color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
        }}>返回主菜单</button>
      </div>

      {/* 左侧面板 */}
      {showSidePanel && (
        <LayerSidePanel
          layerMetadata={layerMetadata}
          layerStates={layerStates}
          onSelectLayer={onSelectLayer}
          onClose={() => setShowSidePanel(false)}
        />
      )}

      {/* 主地图视图 */}
      <div style={{
        marginLeft: showSidePanel ? '280px' : '0',
        marginTop: '60px', height: 'calc(100% - 60px)', position: 'relative'
      }}>
        <TowerMapView layerStates={layerStates} onSelectLayer={onSelectLayer} />
      </div>
    </div>
  );
};
```

### Task E3: 更新 TowerStartScreen

修改 `src/tower-mode/components/TowerStartScreen/index.tsx`：

```typescript
interface TowerStartScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
}

export const TowerStartScreen: React.FC<TowerStartScreenProps> = ({ onNewGame, onContinue }) => {
  const hasSaveData = checkSaveData();

  return (
    <div className="tower-start-screen">
      <h1>🏰 安全实践爬塔模式</h1>
      <div className="button-group">
        <button onClick={onNewGame} className="primary-button">⚔️ 新游戏</button>
        {hasSaveData && <button onClick={onContinue} className="secondary-button">📂 继续游戏</button>}
      </div>
    </div>
  );
};
```

## 验收标准
- [ ] TowerModeApp支持'map_overview'阶段
- [ ] 主地图容器组件整合所有功能
- [ ] 左侧面板可显示/隐藏
- [ ] 点击层级进入对应层
- [ ] 支持返回主地图
- [ ] TypeScript编译无错误
