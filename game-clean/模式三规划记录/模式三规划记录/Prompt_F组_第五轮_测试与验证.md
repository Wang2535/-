# F组 - 第五轮：测试与验证开发 Prompt

## 任务目标
编写组件单元测试、集成测试、进行视觉回归测试。

## 具体任务

### Task F1: 编写组件单元测试

创建文件 `src/tower-mode/components/__tests__/TowerMapView.test.tsx`：

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerHotspot } from '../LayerHotspot';
import { LayerSidePanel } from '../LayerSidePanel';

describe('LayerHotspot', () => {
  const mockConfig = { bottom: 10, height: 10, width: 80 };
  const mockMetadata = {
    name: '测试层', shortName: '测试', color: '#228B22',
    theme: '测试主题', features: [], progress: 0
  };

  it('renders unlocked layer correctly', () => {
    const onClick = vi.fn();
    render(<LayerHotspot layerNumber={1} config={mockConfig} metadata={mockMetadata}
      state={{ unlocked: true, completed: false, progress: 50 }} onClick={onClick} />);
    expect(screen.getByText('测试层')).toBeInTheDocument();
  });

  it('calls onClick when clicked on unlocked layer', () => {
    const onClick = vi.fn();
    render(<LayerHotspot layerNumber={1} config={mockConfig} metadata={mockMetadata}
      state={{ unlocked: true, completed: false, progress: 0 }} onClick={onClick} />);
    fireEvent.click(screen.getByText('测试层'));
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it('shows lock icon for locked layer', () => {
    const onClick = vi.fn();
    render(<LayerHotspot layerNumber={2} config={mockConfig} metadata={mockMetadata}
      state={{ unlocked: false, completed: false, progress: 0 }} onClick={onClick} />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });
});

describe('LayerSidePanel', () => {
  const mockMetadata = {
    1: { name: '层1', shortName: 'L1', color: '#228B22', theme: '主题1', features: [], progress: 0 },
    2: { name: '层2', shortName: 'L2', color: '#00CED1', theme: '主题2', features: [], progress: 0 }
  };

  it('renders all 9 layers', () => {
    render(<LayerSidePanel layerMetadata={mockMetadata}
      layerStates={{ 1: { unlocked: true, completed: false, progress: 0 } }}
      onSelectLayer={vi.fn()} />);
    expect(screen.getByText('🏰 层级导航')).toBeInTheDocument();
  });
});
```

### Task F2: 编写集成测试

创建文件 `src/tower-mode/__tests__/MainMapIntegration.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { LayerStateManager } from '../engine/LayerStateManager';

describe('LayerStateManager Integration', () => {
  let manager: LayerStateManager;

  beforeEach(() => {
    manager = new LayerStateManager();
    manager.resetAll();
  });

  it('should have only layer 1 unlocked by default', () => {
    expect(manager.isLayerUnlocked(1)).toBe(true);
    expect(manager.isLayerUnlocked(2)).toBe(false);
    expect(manager.isLayerUnlocked(9)).toBe(false);
  });

  it('should unlock next layer when completing current layer', () => {
    manager.completeLayer(1);
    expect(manager.isLayerCompleted(1)).toBe(true);
    expect(manager.isLayerUnlocked(2)).toBe(true);
  });

  it('should persist state to localStorage', () => {
    manager.completeLayer(1);
    const newManager = new LayerStateManager();
    expect(newManager.isLayerCompleted(1)).toBe(true);
    expect(newManager.isLayerUnlocked(2)).toBe(true);
  });
});
```

### Task F3: 视觉回归测试清单

创建文件 `src/tower-mode/__tests__/visual-regression.md`：

```markdown
# 视觉回归测试清单

## 热区位置测试
- [ ] L1热区位于底部8%，宽度82%
- [ ] L9热区位于底部90%，宽度23%
- [ ] 热区与塔图各层对齐
- [ ] 热区高度约为10%

## 动态背景测试
- [ ] 极光效果流畅（60fps）
- [ ] 星星闪烁正常
- [ ] 云层漂移正常
- [ ] 背景不影响前景交互

## 聚焦动画测试
- [ ] 点击层级后平滑放大
- [ ] 背景变暗效果正常
- [ ] 动画时长约500ms
- [ ] 无卡顿或掉帧

## 响应式布局测试
- [ ] 1920x1080正常显示
- [ ] 1366x768正常显示
```

## 验收标准
- [ ] 单元测试覆盖率≥80%
- [ ] 集成测试通过
- [ ] 视觉回归测试完成
- [ ] TypeScript编译无错误
- [ ] 所有测试通过
