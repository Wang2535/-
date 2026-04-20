# C组第十一轮 — 组件整合与游戏主入口

## 🔴 核心问题

**GourdMapRenderer、GameHUD、PathSelector、MechanicVisualizer、LayerTransitionFX各自独立存在，未组装成完整游戏界面。玩家无法看到所有元素同时工作。**

## 🎯 本轮目标

**将所有组件组装为完整的可玩游戏界面**，包括主视图、布局管理、事件协调和游戏入口。

---

## 任务详情

### Task C1: ★★★ P0 — TowerClimbView 爬塔模式主视图

**新建文件**: `src/tower-mode/components/TowerClimbView/TowerClimbView.tsx`

```tsx
/**
 * TowerClimbView — 爬塔模式的主视图组件
 * 
 * 职责:
 * 1. 整合所有子组件
 * 2. 管理当前层状态和层级切换
 * 3. 协调useTowerGameController的事件流
 * 4. 使用ShapeDrivenMapAdapter获取第十轮数据
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTowerGameController } from '../../controllers/useTowerGameController';
import { ShapeDrivenMapAdapter } from '../../adapters/ShapeDrivenMapAdapter';
import { GourdMapRenderer } from '../GourdMapRenderer';
import { MechanicVisualizer } from '../GourdMapRenderer/MechanicVisualizer';
import { GameHUD } from '../GameHUD/GameHUD';
import { PathSelector } from '../PathSelector/PathSelector';
import { LayerTransitionFX } from '../GourdMapRenderer/LayerTransitionFX';
import { CellInfoPanel } from '../CellInfoPanel/CellInfoPanel';

interface TowerClimbViewProps {
  initialLayer?: number;
  onGameComplete?: (stats: GameStats) => void;
}

interface GameStats {
  totalTurns: number;
  finalLayer: number;
  techValue: number;
  gold: number;
}

export function TowerClimbView({ initialLayer = 1, onGameComplete }: TowerClimbViewProps) {
  // ==================== 游戏控制器 ====================
  const {
    phase, diceResult, isRolling, techValue, gold, turnNumber,
    cellInfoData, bossDangerActive, availablePaths,
    rollDice, selectPath, enterCell, skipCell, closePanel,
    startNewGame, engineRef, eventBus,
  } = useTowerGameController();

  // ==================== 当前层状态 ====================
  const [currentLayer, setCurrentLayer] = useState(initialLayer);
  const [previousLayer, setPreviousLayer] = useState(initialLayer);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ==================== 使用第十轮数据源 ====================
  const layerRenderData = useMemo(
    () => ShapeDrivenMapAdapter.buildLayerRenderData(currentLayer),
    [currentLayer]
  );

  // ==================== 事件订阅 ====================
  useEffect(() => {
    if (!eventBus) return;

    // 层级切换事件
    const unsubLayerChange = eventBus.on('layer:change' as any, (event: any) => {
      const newLayer = event.newLayer ?? event.to;
      if (newLayer && newLayer !== currentLayer) {
        setPreviousLayer(currentLayer);
        setCurrentLayer(newLayer);
        setIsTransitioning(true);
      }
    });

    // 通关事件
    const unsubVictory = eventBus.on('game:victory' as any, () => {
      onGameComplete?.({ totalTurns: turnNumber, finalLayer: currentLayer, techValue, gold });
    });

    return () => {
      unsubLayerChange();
      unsubVictory();
    };
  }, [eventBus, currentLayer, turnNumber, techValue, gold, onGameComplete]);

  // ==================== 回调函数 ====================
  const handlePathSelect = useCallback((index: number) => {
    selectPath(index);
  }, [selectPath]);

  const handleCellClick = useCallback((cellId: string) => {
    if (phase === 'cell_arrived' || phase === 'cell_interacting') {
      enterCell(cellId);
    }
  }, [phase, enterCell]);

  const handleRollDice = useCallback(() => {
    rollDice();
  }, [rollDice]);

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    engineRef.current?.resetMechanicState?.(currentLayer);
  }, [currentLayer, engineRef]);

  // ==================== 渲染 ====================
  return (
    <div className="tower-climb-view" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#0a0a2e', color: '#ffffff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ===== 顶部: GameHUD ===== */}
      <GameHUD
        layerName={layerRenderData.layerName}
        turnNumber={turnNumber}
        techValue={techValue}
        gold={gold}
        phase={phase}
        onRollDice={handleRollDice}
        isRolling={isRolling}
        canRoll={phase === 'idle' || phase === 'dice_ready'}
      />

      {/* ===== 中部: 地图渲染区域 ===== */}
      <div className="tower-map-area" style={{
        flex: 1, position: 'relative', overflow: 'hidden',
      }}>
        {/* 地图渲染器(使用第十轮数据) */}
        <GourdMapRenderer
          topology={layerRenderData.topology}
          shapeConfig={layerRenderData.shapeConfig}
          layerNumber={currentLayer}
          mechanicType={layerRenderData.mechanicType}
          onCellClick={handleCellClick}
          bossDangerActive={bossDangerActive}
        />

        {/* 机制可视化叠加层 */}
        <MechanicVisualizer
          mechanicType={layerRenderData.mechanicType}
          layerNumber={currentLayer}
        />

        {/* 格子信息面板(到达格子后弹出) */}
        {cellInfoData && (
          <CellInfoPanel
            data={cellInfoData}
            onEnter={() => enterCell(cellInfoData.cellId)}
            onSkip={() => skipCell(cellInfoData.cellId)}
            onClose={closePanel}
            zoneInfo={layerRenderData.topology.cellZones?.[cellInfoData.cellId]}
          />
        )}

        {/* 层级转场特效 */}
        <LayerTransitionFX
          fromLayer={previousLayer}
          toLayer={currentLayer}
          isActive={isTransitioning}
          onComplete={handleTransitionComplete}
        />
      </div>

      {/* ===== 底部: 路径选择器 ===== */}
      {(phase === 'path_selecting' || phase === 'dice_result') &&
        availablePaths && availablePaths.length > 0 && (
        <div className="tower-bottom-panel" style={{
          padding: '1rem',
          background: 'rgba(10, 10, 40, 0.8)',
          borderTop: '1px solid #333366',
        }}>
          <PathSelector
            availablePaths={availablePaths}
            onSelect={handlePathSelect}
            visible={true}
          />
        </div>
      )}
    </div>
  );
}
```

### Task C2: ★★☆ P0 — TowerMode 主入口组件

**修改文件**: `src/tower-mode/TowerMode.tsx` 或 `src/tower-mode/index.tsx`

```tsx
import React from 'react';
import { TowerClimbView } from './components/TowerClimbView/TowerClimbView';

/**
 * TowerMode — 爬塔模式的顶层入口
 * 
 * 职责:
 * 1. 提供爬塔模式的React组件入口
 * 2. 管理游戏模式切换(从主菜单进入/退出)
 * 3. 处理游戏完成后的导航
 */

interface TowerModeProps {
  onExit?: () => void;
  onVictory?: (stats: any) => void;
}

export function TowerMode({ onExit, onVictory }: TowerModeProps) {
  return (
    <div className="tower-mode-container" style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 退出按钮(右上角) */}
      {onExit && (
        <button
          onClick={onExit}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            zIndex: 1000, padding: '8px 16px',
            background: '#333', color: '#fff', border: '1px solid #666',
            borderRadius: '4px', cursor: 'pointer',
          }}
        >
          退出爬塔模式
        </button>
      )}

      {/* 爬塔视图 */}
      <TowerClimbView
        initialLayer={1}
        onGameComplete={(stats) => {
          console.log('通关统计:', stats);
          onVictory?.(stats);
        }}
      />
    </div>
  );
}

export default TowerMode;
```

### Task C3: ★★☆ P1 — 样式系统

**新建文件**: `src/tower-mode/components/TowerClimbView/TowerClimbView.css`

```css
/* ===== 主布局 ===== */
.tower-climb-view {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  user-select: none;
}

.tower-map-area {
  min-height: 500px;
  position: relative;
}

/* ===== 组件层叠 ===== */
.tower-map-area > *:first-child {
  z-index: 1;
  position: relative;
}

.tower-map-area .mechanic-visualizer {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.tower-map-area .layer-transition-fx {
  position: absolute;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}

.tower-map-area .cell-info-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

.tower-bottom-panel {
  z-index: 20;
  position: relative;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .tower-climb-view {
    flex-direction: column;
  }
  
  .tower-map-area {
    min-height: 400px;
  }
  
  .tower-bottom-panel {
    padding: 0.5rem;
  }
}

@media (min-width: 1200px) {
  .tower-map-area {
    min-height: 600px;
  }
}
```

### Task C4: ★☆☆ P2 — GameProgressManager 进度管理

**新建文件**: `src/tower-mode/storage/GameProgressManager.ts`

```typescript
/**
 * GameProgressManager — 管理爬塔模式的进度保存和加载
 */

export interface TowerGameSave {
  currentLayer: number;
  currentCellId: string;
  turnNumber: number;
  techValue: number;
  gold: number;
  inventory: {
    books: string[];
    skills: string[];
  };
  timestamp: number;
}

export class GameProgressManager {
  private static SAVE_KEY = 'tower-climb-save-v11';

  static save(state: TowerGameSave): void {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.warn('保存游戏进度失败:', e);
    }
  }

  static load(): TowerGameSave | null {
    try {
      const data = localStorage.getItem(this.SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.warn('加载游戏进度失败:', e);
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
```

---

## 验收标准

- [ ] 打开爬塔模式页面能看到完整游戏界面
- [ ] 顶部HUD显示层名/回合/资源/Phase/掷骰按钮
- [ ] 中部显示当前层地图(形状正确,第十轮数据)
- [ ] 机制可视化层叠在地图上
- [ ] 掷骰子后底部出现路径选择
- [ ] 到达格子后弹出CellInfoPanel
- [ ] 切换层级时有转场动画
- [ ] 右上角有"退出爬塔模式"按钮
- [ ] 响应式布局(移动端/桌面端)
- [ ] 游戏进度可保存到localStorage
- [ ] 无控制台错误
