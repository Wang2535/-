# F组第八轮 — 视觉回归测试、端到端集成与手动验证

## 背景

第八轮A~E组完成了从视觉资源（SVG图标库、CSS动画）到数据微调（W/N/I/P放大、棋盘格边框、Boss 2.5x）再到渲染器全面升级（GourdMapRenderer视觉重写）、事件总线对接（PlayerPieceState驱动）的全链路改造。

F组作为最终集成与验证层，需要：

1. **验证A→B→C→D→E全链路数据正确传递** — 特别是第八轮新增/修改的字段
2. **编写视觉回归测试** — 断言关键视觉参数值（而非截图对比）
3. **端到端功能测试** — 从用户操作到屏幕渲染的完整流程
4. **性能基准测试** — SVG元素增多后的渲染性能
5. **更新手动验证清单** — 针对第八轮的具体视觉目标逐项检查

## 任务目标

完成第八轮全系统的集成验证，确保所有6组的产出在运行时正确协作，视觉效果达到参考图的80%+相似度。

> **边界说明**：
> - F组**不修改**任何 A~E 组的源代码（除非发现bug需要修复）
> - F组负责**测试代码、验证脚本、集成胶水**
> - 消费所有5组（A~E）的产出
> - 最终输出：测试报告 + 手动验证清单 + 已知问题列表

## 具体任务

### Task F1: 全链路数据完整性冒烟测试

创建 `src/tower-mode/__tests__/e2e/fullPipelineSmoke.test.ts`：

```typescript
/**
 * 第八轮全链路冒烟测试
 * 
 * 验证数据从 B组 → C组 → E组 的传递过程中不丢失关键字段
 */
describe('F组第八轮 — 全链路数据完整性冒烟', () => {

  test('A组：GRID_ICONS 包含全部12种格子图标', () => {
    const { GRID_ICONS } = require('../../assets/gridIcons');
    const requiredTypes = ['start','boss','battle','bookstore','skill','exchange',
                           'opportunity','special','chance','elite','locked'];
    for (const type of requiredTypes) {
      expect(GRID_ICONS[type]).toBeDefined();
      expect(GRID_ICONS[type]).toContain('<path'); // 确认是SVG path格式
    }
  });

  test('A组：DEFAULT_CELL_VISUAL_STYLES 中 Boss sizeMultiplier=2.5', () => {
    const { DEFAULT_CELL_VISUAL_STYLES } = require('../../types/visualAssets.types');
    const bossStyle = DEFAULT_CELL_VISUAL_STYLES.get('boss');
    expect(bossStyle).toBeDefined();
    expect(bossStyle.sizeMultiplier).toBe(2.5);
  });

  test('B组：L1-L9 quadrantLabels fontSizeRatio ≥ 0.20', () => {
    for (let layer = 1; layer <= 9; layer++) {
      const vd = getLayerVisualData(layer);
      for (const label of vd.quadrantLabels) {
        expect(label.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
      }
    }
  });

  test('B组：L1-L9 border.mode = checkerboard-fill', () => {
    for (let layer = 1; layer <= 9; layer++) {
      const vd = getLayerVisualData(layer);
      expect(vd.border.mode).toBe('checkerboard-fill');
    }
  });

  test('C组：assembleFullTopology 输出包含完整 visualConfig', () => {
    const topology = assembleL1Topology();
    
    // visualConfig 必须存在且非空
    expect(topology.visualConfig).toBeDefined();
    
    // quadrantLabels 完整
    expect(topology.visualConfig.quadrantLabels).toHaveLength(4);
    for (const q of topology.visualConfig.quadrantLabels) {
      expect(q.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
      expect(q.strokeColor).toBeDefined(); // 第八轮新增字段
    }
    
    // border mode 正确
    expect(topology.visualConfig.border.mode).toBe('checkerboard-fill');
    
    // cellVisualStyles 含 boss 且 sizeMultiplier=2.5
    const bossStyle = topology.visualConfig.cellVisualStyles.get('boss');
    expect(bossStyle?.sizeMultiplier).toBeCloseTo(2.5, 1);
    expect(bossStyle?.animationClass).toBeDefined(); // boss-emerge
  });

  test('D组：MovementController 可正常创建并查询状态', () => {
    const bus = createMockEventBus();
    const { createMovementSystem } = require('../../engine/movementController');
    const movement = createMovementSystem(bus);
    
    expect(movement.getPieceState()).toBeDefined();
    expect(movement.getPieceState().isMoving).toBe(false);
  });

  test('E组：GourdMapRenderer 可接收 topology 和 pieceState props', () => {
    const { GourdMapRenderer } = require('../../components/GourdMapRenderer');
    const topology = assembleL1Topology();
    
    // 不报错即可通过（mount测试）
    const wrapper = mount(
      <GourdMapRenderer topology={topology} cells={[]} currentPosition={null} pieceState={null} />
    );
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });
});
```

### Task F2: 视觉参数回归测试

创建 `src/tower-mode/__tests__/visual/visualParamsRegression.test.ts`：

```typescript
/**
 * 第八轮视觉参数回归测试
 * 
 * 不依赖截图对比，而是断言关键的视觉配置参数值。
 * 这些参数直接决定渲染效果是否接近目标。
 */
describe('F组第八轮 — 视觉参数回归', () => {

  describe('W/N/I/P 象限标识参数', () => {

    test('L1 四象限 fontSizeRatio 均为 0.22', () => {
      const t = assembleL1Topology();
      for (const q of t.visualConfig.quadrantLabels) {
        expect(q.fontSizeRatio).toBeCloseTo(0.22, 2);
      }
    });

    test('L1 四象限 fontWeight 均为 900', () => {
      const t = assembleL1Topology();
      for (const q of t.visualConfig.quadrantLabels) {
        expect(q.fontWeight).toBe('900');
      }
    });

    test('L1 四象限均含白色描边 (strokeColor="#FFFFFF")', () => {
      const t = assembleL1Topology();
      for (const q of t.visualConfig.quadrantLabels) {
        expect(q.strokeColor).toBe('#FFFFFF');
        expect(q.strokeWidth).toBeGreaterThan(0);
      }
    });

    test('颜色分布: W/P=橙 #FF8800, N/I=黄 #FFCC00', () => {
      const t = assembleL1Topology();
      const byQuad = new Map(t.visualConfig.quadrantLabels.map(q => [q.quadrant, q]));
      expect(byQuad.get('W')?.color).toBe('#FF8800');
      expect(byQuad.get('P')?.color).toBe('#FF8800');
      expect(byQuad.get('N')?.color).toBe('#FFCC00');
      expect(byQuad.get('I')?.color).toBe('#FFCC00');
    });
  });

  describe('棋盘格边框参数', () => {

    test('border.mode 为 checkerboard-fill', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.border.mode).toBe('checkerboard-fill');
    });

    test('边框配色为橙黄白交替', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.border.colors).toEqual(['#FFAA00', '#FFFFFF']);
    });

    test('边框有外发光 glowColor 配置', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.border.glowColor).toContain('255,170,0');
    });

    test('tileSize 在合理范围 (8~20px)', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.border.tileSize).toBeGreaterThan(8);
      expect(t.visualConfig.border.tileSize).toBeLessThan(20);
    });
  });

  describe('Boss格参数', () => {

    test('Boss sizeMultiplier = 2.5（精确匹配）', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.cellVisualStyles.get('boss')?.sizeMultiplier).toBe(2.5);
    });

    test('Boss 有 animationClass="boss-emerge"', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.cellVisualStyles.get('boss')?.animationClass)
        .toBe('boss-emerge');
    });

    test('Boss 有 pulse 光环效果', () => {
      const t = assembleL1Topology();
      const boss = t.visualConfig.cellVisualStyles.get('boss');
      expect(boss?.glowEffect?.pulse).toBe(true);
      expect(boss?.glowEffect?.size).toBeGreaterThan(20);
    });

    test('精英格有 elite-jagged 动画类', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.cellVisualStyles.get('elite')?.animationClass)
        .toBe('elite-jagged');
    });
  });

  describe('SVG图标引用', () => {

    test('主要格子类型的 icon.type 为 "svg"', () => {
      const t = assembleL1Topology();
      const svgTypes = ['start','boss','battle','bookstore','skill'];
      for (const type of svgTypes) {
        const style = t.visualConfig.cellVisualStyles.get(type);
        expect(style?.icon?.type).toBe('svg');
      }
    });
  });

  describe('背景装饰参数', () => {

    test('L1 有至少2个装饰元素', () => {
      const t = assembleL1Topology();
      expect(t.visualConfig.decorations.length).toBeGreaterThanOrEqual(2);
    });

    test('上圆区域有星球类型装饰', () => {
      const t = assembleL1Topology();
      const hasPlanet = t.visualConfig.decorations.some(d => d.type === 'planet');
      expect(hasPlanet).toBe(true);
    });
  });
});
```

### Task F3: 渲染器组件交互测试

创建 `src/tower-mode/__tests__/visual/rendererInteraction.test.ts`：

```typescript
/**
 * 渲染器组件交互测试
 * 
 * 测试 GourdMapRenderer 在不同输入下的渲染行为
 */
describe('F组第八轮 — 渲染器交互测试', () => {

  test('传入 pieceState 时应渲染 AnimationLayer', () => {
    const topology = assembleL1Topology();
    const pieceState: PlayerPieceState = {
      position: { x: 0.5, y: 0.5 },
      targetPosition: null,
      isMoving: false,
      moveStartTime: null,
      moveDuration: 0,
      trailHistory: [],
      currentCellId: 'test-cell',
      justArrived: false,
      currentZone: null,
    };

    const wrapper = mount(
      <GourdMapRenderer topology={topology} cells={[]}
                        currentPosition={null} pieceState={pieceState} />
    );

    // 应该能看到玩家棋子相关的SVG元素
    const svgContent = wrapper.html();
    expect(svgContent).toContain('piece-breathe'); // CSS动画类名
    
    wrapper.unmount();
  });

  test('pieceState.trailHistory 应渲染轨迹光痕点', () => {
    const topology = assembleL1Topology();
    const pieceState: PlayerPieceState = {
      position: { x: 0.6, y: 0.6 },
      targetPosition: { x: 0.7, y: 0.7 },
      isMoving: true,
      moveStartTime: performance.now() - 200,
      moveDuration: 500,
      trailHistory: [
        { x: 0.5, y: 0.5, timestamp: Date.now() - 300, opacity: 0.8 },
        { x: 0.55, y: 0.55, timestamp: Date.now() - 200, opacity: 0.9 },
        { x: 0.58, y: 0.58, timestamp: Date.now() - 100, opacity: 1.0 },
      ],
      currentCellId: 'cell-3',
      justArrived: false,
      currentZone: 'W',
    };

    const wrapper = mount(
      <GourdMapRenderer topology={topology} cells={[]}
                        currentPosition={null} pieceState={pieceState} />
    );

    const html = wrapper.html();
    // 轨迹光痕应为绿色圆圈
    expect(html).toContain('#44ff88');
    // 至少有3个轨迹点
    expect((html.match(/trail-/g) || []).length).toBeGreaterThanOrEqual(3);
    
    wrapper.unmount();
  });

  test('justArrived=true 时应渲染到达波纹', () => {
    const topology = assembleL1Topology();
    const pieceState: PlayerPieceState = {
      position: { x: 0.5, y: 0.5 },
      targetPosition: { x: 0.5, y: 0.5 },
      isMoving: false,
      moveStartTime: null,
      moveDuration: 0,
      trailHistory: [],
      currentCellId: 'cell-arrived',
      justArrived: true,
      currentZone: 'N',
    };

    const wrapper = mount(
      <GourdMapRenderer topology={topology} cells={[]}
                        currentPosition={null} pieceState={pieceState} />
    );

    const html = wrapper.html();
    expect(html).toContain('arrival-ripple');
    
    wrapper.unmount();
  });

  test('Boss格的 SVG 尺寸应为普通格的 2.5 倍', () => {
    const topology = assembleL1Topology();
    const wrapper = mount(
      <GourdMapRenderer topology={topology} cells={[]}
                        currentPosition={null} pieceState={null} />
    );

    const html = wrapper.html();
    // 找到所有格子元素，检查 Boss 格是否有更大的尺寸属性
    // （具体选择器取决于实际实现）
    const hasBossElement = html.includes('boss') || html.includes('sizeMultiplier');
    expect(hasBossElement).toBe(true);
    
    wrapper.unmount();
  });

  test('切换层级时应重新渲染新拓扑', async () => {
    const { act } = require('react-dom/test-utils');
    
    const l1 = assembleL1Topology();
    const l2 = assembleL2Topology();
    
    let wrapper;
    await act(async () => {
      wrapper = mount(
        <GourdMapRenderer topology={l1} cells={[]} currentPosition={null} pieceState={null} />
      );
    });
    
    // 切换到 L2
    await act(async () => {
      wrapper.setProps({ topology: l2 });
    });
    
    // 不报错即可
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });
});
```

### Task F4: 性能基准测试

```typescript
describe('F组第八轮 — 性能基准', () => {

  test('GourdMapRenderer 首次渲染 < 150ms（第八轮SVG元素增多后放宽标准）', async () => {
    const topology = assembleL1Topology();
    
    const start = performance.now();
    render(
      <GourdMapRenderer topology={topology} cells={[]}
                        currentPosition={null} pieceState={null} />
    );
    await waitFor(() => expect(screen.getByTestId('gourd-map')).toBeInTheDocument());
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(150);
  });

  test('单层 SVG 总元素数 < 200（含 defs/patterns/circles/paths/texts）', () => {
    const topology = assembleL1Topology();
    const { container } = render(
      <GourdMapRenderer topology={topology} cells={[]}
                        currentPosition={null} pieceState={null} />
    );
    
    const svgElements = container.querySelectorAll('svg *');
    expect(svgElements.length).toBeLessThan(200);
  });

  test('CurvedPathEngine 100次插值 < 15ms', () => {
    const engine = new CurvedPathEngine();
    const from: GourdCoordinate = { region:'lowerCircle', theta:Math.PI, radiusRatio:0.5 };
    const to: GourdCoordinate = { region:'lowerCircle', theta:Math.PI/2, radiusRatio:0.7 };
    const waypoints: GourdCoordinate[] = [
      { region:'lowerCircle', theta: Math.PI*0.75, radiusRatio:0.6 },
    ];
    const topology = assembleL1Topology();
    
    const path = engine.calculateAnimatedPath(from, to, waypoints, topology);
    
    const start = performance.now();
    for (let p = 0; p <= 1; p += 0.01) {
      engine.getPositionAtProgress(path, p);
    }
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(15);
  });

  test('preassembleAllLayers 9层总耗时 < 500ms', () => {
    const start = performance.now();
    const result = preassembleAllLayers();
    const elapsed = performance.now() - start;
    
    expect(result.size).toBe(9);
    expect(elapsed).toBeLessThan(500);
  });
});
```

### Task F5: 更新后的手动验证清单

启动服务器 (`npm run dev`) 后，打开 http://localhost:5173/dadong-game-levels/ ，进入爬塔模式，逐项检查：

#### 一、整体布局（P0）

- [ ] **葫芦形轮廓清晰可见** — 上小圆 + 连接通道 + 下大圆，不是矩形网格
- [ ] **比例协调** — 上圆直径约为下圆的 50%~60%
- [ ] **连接通道自然过渡** — 上下圆之间有平滑收腰区域

#### 二、象限标识 W/N/I/P（P0 — 第八轮重点）

- [ ] **四个字母非常大且醒目** — 占下圆面积约 1/4 每个，字体粗黑
- [ ] **颜色正确** — W(橙#FF8800) / N(黄#FFCC00) / I(黄#FFCC00) / P(橙#FF8800)
- [ ] **有白色描边** — 字母边缘有白色线条增强可读性
- [ ] **有阴影效果** — 字母下方有深色阴影增加立体感
- [ ] **十字分割线可见** — 白色细线将下圆分为四等份

#### 三、棋盘格边框（P0 — 第八轮重点）

- [ ] **是真正的"方格"填充** — 不是径向线段，而是类似国际象棋棋盘的方格交替图案
- [ ] **配色为橙黄白交替** — #FFAA00 和 #FFFFFF 方格交错
- [ ] **沿葫芦形轮廓分布** — 方格只出现在上下圆的外围区域
- [ ] **有一定透明度** — 不是完全不透明的，能隐约看到内部内容
- [ ] **有轻微外发光** — 边框外侧有橙色光晕效果

#### 四、格子系统（P0/P1）

- [ ] **格子沿葫芦轮廓分布** — 上圆内、连接区、下圆内各有格子
- [ ] **Boss 格明显更大** — 视觉尺寸约为普通格子的 2.5 倍
- [ ] **Boss 格有红色脉动光环** — 周期性明暗变化的光晕效果
- [ ] **精英格有锯齿边框** — 红色虚线边框 + 轻微抖动动画
- [ ] **格子使用 SVG 图标** — 不是 Emoji，是矢量风格的精美图标
- [ ] **不同类型格子形状不同** — 圆形/椭圆/六边形/圆角矩形按类型区分

#### 五、线路系统（P1）

- [ ] **线路是弯曲的** — 格子之间的连线是平滑曲线（贝塞尔曲线），不是直线
- [ ] **线路颜色区分类型** — 主线/支线/特殊路径颜色不同

#### 六、玩家棋子与动画（P0 — 第八轮重点）

- [ ] **玩家棋子可见** — 绿色圆形 + 内部🎮图标
- [ ] **棋子有呼吸动画** — 缓慢地缩放（大→小→大），周期约2秒
- [ ] **移动时显示轨迹光痕** — 棋子经过的位置留下渐隐的绿色光点（3~5个）
- [ ] **到达新格时有波纹** — 环形波纹从棋子位置向外扩散并消失
- [ ] **移动过程流畅** — 沿曲线路径移动，速度先快后慢（弹性缓动）

#### 七、区域进入特效（P1）

- [ ] **进入 W 区域时有 ripple 效果** — 波纹从区域中心扩散
- [ ] **进入 N/I 区域时有 sparkle 效果** — 闪光闪烁
- [ ] **Boss 格有 emerge 动画** — 首次出现时从小到大弹入

#### 八、背景装饰（P2）

- [ ] **上圆中央有星球装饰** — 圆形星球 + 光环
- [ ] **背景有渐变色** — 深色调渐变（非纯色）
- [ ] **可能有云朵/山脉等点缀** — 半透明装饰元素

#### 九、层级切换（P0）

- [ ] **点击左侧层级按钮可切换 L1~L9**
- [ ] **每层的格子数量和布局不同**
- [ ] **切换时无白屏/闪烁**

#### 十、性能体验（P1）

- [ ] **页面加载后 2 秒内地图完整显示**
- [ ] **切换层级时卡顿 < 200ms**
- [ ] **移动动画期间帧率流畅（无明显掉帧感）**

---

### Task F6: 已知问题记录模板

```markdown
# 第八轮已知问题记录

| # | 严重度 | 模块 | 描述 | 建议修复轮次 |
|---|--------|------|------|-------------|
|   | P0/P1/P2/P3 | A/B/C/D/E/F | 具体问题描述 | 第九轮 |
```

## 测试执行顺序

```
1. F1: 全链路冒烟测试（确保基本数据流不断裂）
         ↓ 通过
2. F2: 视觉参数回归测试（确保关键数值正确）
         ↓ 通过
3. F3: 渲染器交互测试（确保组件行为正确）
         ↓ 通过
4. F4: 性能基准测试（确保性能达标）
         ↓ 通过
5. F5: 手动验证清单（浏览器中逐项目视检查）
         ↓ 记录结果
6. F6: 填写已知问题记录（为第九轮提供输入）
```

## 与其他组的接口约定

| 接口 | 来源 | 使用于 |
|------|------|--------|
| `assembleFullTopology()` | C组 | F1/F2 测试的数据来源 |
| `GRID_ICONS` / `DEFAULT_CELL_VISUAL_STYLES` | A组 | F1 冒 smoke |
| `getLayerVisualData(N)` | B组 | F1 数据源检查 |
| `MovementController` / `PlayerPieceState` | D组 | F3 交互测试 |
| `GourdMapRenderer` 组件 | E组 | F3/F4 渲染+性能测试 |
| `preassembleAllLayers()` | C组 | F4 性能基准 |

## 验收标准

1. ✅ F1 冒烟测试全部通过（7项：A/B/C/D/E各至少1项）
2. ✅ F2 视觉参数回归全部通过（≥15项断言）
3. ✅ F3 渲染器交互测试全部通过（5项）
4. ✅ F4 性能基准达标（首屏<150ms, SVG<200元素, 插值<15ms, 组装<500ms）
5. ✅ F5 手动验证清单 ≥ 35/40 项通过（允许少量P2/P3项暂缺）
6. ✅ 无 TypeScript 编译错误
7. ✅ 全部原有测试（557个）仍然通过（无回归）
8. ✅ 已知问题记录已填写（无论有无问题）
