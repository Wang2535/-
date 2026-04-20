# D组 - 第五轮：状态管理与控制器开发 Prompt

## 任务目标
实现层级解锁状态管理、更新TowerModeController、实现解锁动画效果。

## 具体任务

### Task D1: 实现层级状态管理

创建文件 `src/tower-mode/engine/LayerStateManager.ts`：

```typescript
import type { LayerState } from '../types/layerMetadata.types';

const STORAGE_KEY = 'tower_mode_layer_states';

export class LayerStateManager {
  private states: Record<number, LayerState>;

  constructor() {
    this.states = this.loadFromStorage();
  }

  private loadFromStorage(): Record<number, LayerState> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load layer states:', e);
    }
    return this.getDefaultStates();
  }

  private getDefaultStates(): Record<number, LayerState> {
    const states: Record<number, LayerState> = {};
    for (let i = 1; i <= 9; i++) {
      states[i] = { unlocked: i === 1, completed: false, progress: 0 };
    }
    return states;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.states));
    } catch (e) {
      console.warn('Failed to save layer states:', e);
    }
  }

  getLayerState(layerNumber: number): LayerState {
    return this.states[layerNumber] || { unlocked: false, completed: false, progress: 0 };
  }

  getAllLayerStates(): Record<number, LayerState> {
    return { ...this.states };
  }

  isLayerUnlocked(layerNumber: number): boolean {
    return this.states[layerNumber]?.unlocked || false;
  }

  isLayerCompleted(layerNumber: number): boolean {
    return this.states[layerNumber]?.completed || false;
  }

  unlockLayer(layerNumber: number): boolean {
    if (layerNumber < 1 || layerNumber > 9) return false;
    if (!this.states[layerNumber].unlocked) {
      this.states[layerNumber].unlocked = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  completeLayer(layerNumber: number): boolean {
    if (layerNumber < 1 || layerNumber > 9) return false;
    if (!this.states[layerNumber].completed) {
      this.states[layerNumber].completed = true;
      this.states[layerNumber].progress = 100;
      this.saveToStorage();
      if (layerNumber < 9) this.unlockLayer(layerNumber + 1);
      return true;
    }
    return false;
  }

  updateProgress(layerNumber: number, progress: number): void {
    if (layerNumber >= 1 && layerNumber <= 9) {
      this.states[layerNumber].progress = Math.min(100, Math.max(0, progress));
      this.saveToStorage();
    }
  }

  resetAll(): void {
    this.states = this.getDefaultStates();
    this.saveToStorage();
  }
}

export const layerStateManager = new LayerStateManager();
```

### Task D2: 更新 TowerModeController

修改 `src/tower-mode/TowerModeController.ts`：

```typescript
import { layerStateManager } from './engine/LayerStateManager';
import type { LayerState } from './types/layerMetadata.types';

export class TowerModeController {
  // ... 现有代码 ...

  getLayerState(layerNumber: number): LayerState {
    return layerStateManager.getLayerState(layerNumber);
  }

  getAllLayerStates(): Record<number, LayerState> {
    return layerStateManager.getAllLayerStates();
  }

  completeCurrentLayer(): void {
    const currentLayer = this.state.currentLayer;
    if (currentLayer > 0) {
      const wasCompleted = layerStateManager.completeLayer(currentLayer);
      if (wasCompleted) {
        this.eventBus.emit('layerUnlocked', {
          unlockedLayer: currentLayer + 1,
          completedLayer: currentLayer
        });
      }
    }
  }

  private emitStateChange(): void {
    const renderState = this.getRenderState();
    const layerStates = this.getAllLayerStates();
    this.stateChangeCallback?.({ ...renderState, layerStates });
  }
}
```

### Task D3: 实现解锁动画效果

创建文件 `src/tower-mode/components/UnlockAnimation.tsx`：

```typescript
import React, { useEffect, useState } from 'react';

interface UnlockAnimationProps {
  fromLayer: number;
  toLayer: number;
  onComplete?: () => void;
}

export const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ fromLayer, toLayer, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      if (newProgress < 1) requestAnimationFrame(animate);
      else onComplete?.();
    };
    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: `${progress * 100}%`, height: `${progress * 100}%`, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)'
      }} />
      <div style={{
        position: 'absolute', textAlign: 'center', color: '#FFD700', fontSize: '2rem', fontWeight: 'bold',
        opacity: progress > 0.5 ? (progress - 0.5) * 2 : 0, transform: `scale(${0.5 + progress * 0.5})`
      }}>
        <div>🔓 第 {toLayer} 层已解锁！</div>
        <div style={{ fontSize: '1rem', marginTop: '10px', color: '#aaa' }}>完成第 {fromLayer} 层后解锁</div>
      </div>
    </div>
  );
};
```

## 验收标准
- [ ] LayerStateManager 类可用
- [ ] 状态持久化到 localStorage
- [ ] 完成层后自动解锁下一层
- [ ] 解锁动画组件可用
- [ ] TypeScript编译无错误
