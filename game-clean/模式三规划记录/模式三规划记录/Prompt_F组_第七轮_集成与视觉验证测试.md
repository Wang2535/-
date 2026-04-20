# F组第七轮 — 葫芦形渲染系统集成与视觉验证测试

## 背景

第七轮A~E组完成了从类型定义到渲染器的全面升级。F组需要：

1. 将新的GourdMapRenderer集成到TowerModeApp中（替换LayerMapRenderer）
2. 验证数据流：B组视觉数据 → C组组装 → E组渲染
3. 编写**视觉回归测试**确保渲染结果接近参考图
4. 性能测试（SVG路径数量增加后的渲染性能）

## 任务目标

完成葫芦形渲染系统的端到端集成，并通过视觉和功能双重验证。

## 具体任务

### Task F1: 组件替换集成

修改 `src/tower-mode/TowerModeApp.tsx`：

```typescript
// 第六轮（旧）:
import { LayerMapRenderer } from './components/LayerMapRenderer';
// ↓ 替换为
// 第七轮（新）:
import { GourdMapRenderer } from './components/GourdMapRenderer';

// 在渲染处:
// 旧: <LayerMapRenderer layerData={...} />
// 新: <GourdMapRenderer topology={enrichedTopology} pieceState={pieceState} />
```

### Task F2: 视觉回归测试

创建 `src/tower-mode/__tests__/visual/GourdVisualRegression.test.ts`：

```typescript
describe('葫芦形地图视觉回归测试', () => {
  
  test('L1地图外形应为葫芦形', () => {
    const topology = assembleL1Topology();
    // 验证: 上圆格数 < 下圆格数
    const upperCells = filterCellsInRegion(topology, 'upperCircle');
    const lowerCells = filterCellsInRegion(topology, 'lowerCircle');
    expect(upperCells.length).toBeLessThan(lowerCells.length);
  });
  
  test('Boss格尺寸应为普通格的2.5倍', () => {
    const bossStyle = topology.cellVisualStyles.get('boss');
    const normalStyle = topology.cellVisualStyles.get('battle');
    expect(bossStyle.sizeMultiplier).toBe(2.5);
  });
  
  test('棋盘格边框应为橙黄白配色', () => {
    const border = topology.border;
    expect(border.enabled).toBe(true);
    expect(border.colors).toEqual(['#FFAA00', '#FFFFFF']);
  });
  
  test('W/N/I/P标识字体足够大', () => {
    for (const label of topology.quadrantLabels) {
      expect(label.fontSizeRatio).toBeGreaterThanOrEqual(0.15);
    }
  });
  
  test('线路应使用曲线（非直线）', () => {
    for (const [pathType, style] of topology.pathVisualStyles) {
      expect(style.curveTension).toBeGreaterThan(0);
    }
  });
  
  test('所有格子坐标在葫芦轮廓内', () => {
    const validator = new VisualDataValidator();
    const result = validator.validateCoordinatesInBounds(
      topology.gourdCoordinates,
      topology.gourdShape
    );
    expect(result.every(Boolean)).toBe(true);
  });
  
  test('9层形状参数各不相同', () => {
    const shapes = Object.values(LAYER_GOURD_SHAPES);
    const uniqueShapes = new Set(shapes.map(s => JSON.stringify(s)));
    expect(uniqueShapes.size).toBe(9);
  });
});
```

### Task F3: 渲染性能基准

```typescript
describe('葫芦形渲染性能', () => {
  
  test('GourdMapRenderer首次渲染 < 100ms', async () => {
    // 模拟挂载 GourdMapRenderer
    const start = performance.now();
    render(<GourdMapRenderer topology={testTopology} />);
    await waitFor(() => ...);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
  
  test('SVG路径数量合理（单层 < 50条路径）', () => {
    const pathCount = testTopology.paths.length + 
                      Object.values(testTopology.svgPaths.regionPaths).length +
                      2; // quadrant dividers
    expect(pathCount).toBeLessThan(50);
  });
  
  test('玩家移动动画帧率 >= 30fps', () => {
    // 测试 CurvedPathEngine 的插值性能
    const path = engine.calculateAnimatedPath(from, to, waypoints, topology);
    const start = performance.now();
    for (let p = 0; p <= 1; p += 0.01) {
      engine.getPositionAtProgress(path, p);
    }
    const elapsed = performance.now() - start;
    // 100次插值应在10ms内完成（留足余量给渲染）
    expect(elapsed).toBeLessThan(10);
  });
});
```

### Task F4: 手动验证清单

启动服务器后逐项检查：

- [ ] 打开爬塔模式 → 进入L1 → 看到葫芦形地图（非矩形）
- [ ] 外围有橙黄白棋盘格边框
- [ ] 下大圆内有 W / N / I / P 四个大号字母
- [ ] 有白色十字分割四象限
- [ ] 上小圆内有装饰元素
- [ ] 格子沿轮廓分布（不是方阵）
- [ ] Boss 格明显比其他格大
- [ ] 线路是弯曲的（非直线）
- [ ] 点击骰子后棋子沿曲线路径移动
- [ ] 移动后有光痕残留
- [ ] 到达新格子有波纹效果

## 验收标准

1. ✅ TowerModeApp 使用 GourdMapRenderer 替代 LayerMapRenderer
2. ✅ 无 TypeScript 编译错误
3. ✅ 视觉回归测试全部通过（6项）
4. ✅ 渲染性能达标（首屏<100ms, 动画≥30fps）
5. ✅ 手动验证清单10/10项通过
6. ✅ 9层均可正确切换显示
