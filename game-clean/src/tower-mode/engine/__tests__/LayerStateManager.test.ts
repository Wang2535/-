import { describe, it, expect, beforeEach } from 'vitest';
import { LayerStateManager, layerStateManager } from '../../engine/LayerStateManager';

describe('LayerStateManager - 构造与默认状�?, () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('默认状态：�?层unlocked=true，其�?层unlocked=false', () => {
    const manager = new LayerStateManager();
    expect(manager.isLayerUnlocked(1)).toBe(true);
    for (let i = 2; i <= 9; i++) {
      expect(manager.isLayerUnlocked(i)).toBe(false);
    }
  });

  it('默认状态：所有层completed=false, progress=0', () => {
    const manager = new LayerStateManager();
    for (let i = 1; i <= 9; i++) {
      const state = manager.getLayerState(i);
      expect(state.completed).toBe(false);
      expect(state.progress).toBe(0);
    }
  });

  it('getAllLayerStates 返回9个条�?, () => {
    const manager = new LayerStateManager();
    const all = manager.getAllLayerStates();
    expect(Object.keys(all).length).toBe(9);
  });
});

describe('LayerStateManager - unlockLayer', () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('unlockLayer(2) 将第2层设�?unlocked=true，返�?true', () => {
    const manager = new LayerStateManager();
    const result = manager.unlockLayer(2);
    expect(result).toBe(true);
    expect(manager.isLayerUnlocked(2)).toBe(true);
  });

  it('unlockLayer(1) �?层已是unlocked，返�?false', () => {
    const manager = new LayerStateManager();
    const result = manager.unlockLayer(1);
    expect(result).toBe(false);
  });

  it('unlockLayer(0) 超出范围返回 false', () => {
    const manager = new LayerStateManager();
    expect(manager.unlockLayer(0)).toBe(false);
  });

  it('unlockLayer(10) 超出范围返回 false', () => {
    const manager = new LayerStateManager();
    expect(manager.unlockLayer(10)).toBe(false);
  });

  it('unlockLayer �?isLayerUnlocked 返回 true', () => {
    const manager = new LayerStateManager();
    manager.unlockLayer(5);
    expect(manager.isLayerUnlocked(5)).toBe(true);
  });
});

describe('LayerStateManager - completeLayer', () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('completeLayer(1): completed=true, progress=100, 返回 true', () => {
    const manager = new LayerStateManager();
    const result = manager.completeLayer(1);
    expect(result).toBe(true);
    const state = manager.getLayerState(1);
    expect(state.completed).toBe(true);
    expect(state.progress).toBe(100);
  });

  it('completeLayer(1) 重复调用返回 false', () => {
    const manager = new LayerStateManager();
    manager.completeLayer(1);
    const result = manager.completeLayer(1);
    expect(result).toBe(false);
  });

  it('completeLayer(2) 自动解锁�?�?, () => {
    const manager = new LayerStateManager();
    manager.completeLayer(2);
    expect(manager.isLayerCompleted(2)).toBe(true);
    expect(manager.isLayerUnlocked(3)).toBe(true);
  });

  it('completeLayer(0) 边界返回 false', () => {
    const manager = new LayerStateManager();
    expect(manager.completeLayer(0)).toBe(false);
  });

  it('completeLayer �?isLayerCompleted 返回 true', () => {
    const manager = new LayerStateManager();
    manager.completeLayer(3);
    expect(manager.isLayerCompleted(3)).toBe(true);
  });
});

describe('LayerStateManager - updateProgress', () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('updateProgress(1, 50) 设置 progress=50', () => {
    const manager = new LayerStateManager();
    manager.updateProgress(1, 50);
    expect(manager.getLayerState(1).progress).toBe(50);
  });

  it('updateProgress(1, -10) clamp �?0', () => {
    const manager = new LayerStateManager();
    manager.updateProgress(1, -10);
    expect(manager.getLayerState(1).progress).toBe(0);
  });

  it('updateProgress(1, 200) clamp �?100', () => {
    const manager = new LayerStateManager();
    manager.updateProgress(1, 200);
    expect(manager.getLayerState(1).progress).toBe(100);
  });

  it('updateProgress(0, 50) 边界不报�?, () => {
    const manager = new LayerStateManager();
    expect(() => manager.updateProgress(0, 50)).not.toThrow();
  });
});

describe('LayerStateManager - resetAll', () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('resetAll() 恢复默认状�?, () => {
    const manager = new LayerStateManager();
    manager.completeLayer(1);
    manager.completeLayer(2);
    manager.resetAll();

    expect(manager.isLayerUnlocked(1)).toBe(true);
    expect(manager.isLayerCompleted(1)).toBe(false);
    for (let i = 2; i <= 9; i++) {
      expect(manager.isLayerUnlocked(i)).toBe(false);
      expect(manager.isLayerCompleted(i)).toBe(false);
    }
  });
});

describe('LayerStateManager - getLayerState', () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('getLayerState(5) 返回正确状态对�?, () => {
    const manager = new LayerStateManager();
    const state = manager.getLayerState(5);
    expect(state).toEqual({ unlocked: false, completed: false, progress: 0 });
  });

  it('getLayerState(999) 返回默认空状�?, () => {
    const manager = new LayerStateManager();
    const state = manager.getLayerState(999);
    expect(state.unlocked).toBe(false);
    expect(state.completed).toBe(false);
  });
});

describe('LayerStateManager - localStorage 持久�?, () => {
  beforeEach(() => {
    localStorage.removeItem('tower_mode_layer_states');
  });

  it('状态变更后可从新实例恢�?, () => {
    const manager1 = new LayerStateManager();
    manager1.unlockLayer(2);
    manager1.completeLayer(1);
    manager1.updateProgress(3, 75);

    // 创建新实例应�?localStorage 恢复
    const manager2 = new LayerStateManager();
    expect(manager2.isLayerUnlocked(2)).toBe(true);
    expect(manager2.isLayerCompleted(1)).toBe(true);
    expect(manager2.getLayerState(3).progress).toBe(75);
  });
});
