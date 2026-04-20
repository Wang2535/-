# F组第八轮 — 全面验证：冒烟 + 视觉回归 + 渲染交互 + 性能 + 手动清单

## 背景

第八轮A~E组完成了从类型扩展、数据重写到渲染器彻底重写的全链路改造。F组作为最终守门员，需要：

1. **全链路冒烟** — A→B→C→D→E 数据不丢失
2. **视觉参数断言** — 关键数值精确匹配
3. **渲染器交互测试** — 组件行为正确
4. **性能基准达标** — SVG元素增多后的性能
5. **手动验证清单** — 40项逐目检查

## 具体任务

### Task F1: 全链路数据完整性冒烟

```typescript
// src/tower-mode/__tests__/e2e/EighthRoundPipelineSmoke.test.ts

describe('第八轮全链路冒烟', () => {

  test('A-1: GRID_ICONS 含14种SVG图标且均为有效path', () => {
    const { GRID_ICONS } = require('../../assets/gridIcons');
    expect(Object.keys(GRID_ICONS).length).toBeGreaterThanOrEqual(12);
    for (const [type, path] of Object.entries(GRID_ICONS)) {
      expect(path).toContain('<path'); // 或直接是 d="..." 格式
      expect(path.length).toBeGreaterThan(20); // 有效的path data
    }
  });

  test('A-2: DEFAULT_CELL_STYLES 中 Boss sizeMultiplier=2.5 且有 animationClass', () => {
    const { DEFAULT_CELL_STYLES } = require('../../constants/defaultVisualStyles');
    const boss = DEFAULT_CELL_STYLES.get('boss');
    expect(boss?.sizeMultiplier).toBe(2.5);
    expect(boss?.animationClass).toBe('gm-boss-emerge');
  });

  test('A-3: DEFAULT_QUADRANT_LABELS 含4个元素且 fontSizeRatio=0.22', () => {
    const { DEFAULT_QUADRANT_LABELS } = require('../../constants/defaultVisualStyles');
    expect(DEFAULT_QUADRANT_LABELS).toHaveLength(4);
    for (const q of DEFAULT_QUADRANT_LABELS) {
      expect(q.fontSizeRatio).toBe(0.22);
      expect(q.strokeColor).toBe('#FFFFFF');
      expect(q.fontFamily).toContain('Arial Black');
    }
  });

  test('B-1: L1 border.mode === checkerboard-fill', () => {
    const { L1_VISUAL_DATA } = require('../../data/layers/L1_visualData');
    expect(L1_VISUAL_DATA.border.mode).toBe('checkerboard-fill');
    expect(L1_VISUAL_DATA.border.glowColor).toBeDefined();
  });

  test('B-2: L1 quadrantLabels 使用 quadrant 字段（非 position）', () => {
    const { L1_VISUAL_DATA } = require('../../data/layers/L1_visualData');
    for (const q of L1_VISUAL_DATA.quadrantLabels) {
      expect(q.quadrant).toBeTruthy();
      expect(q.position).toBeFalsy(); // 不应有旧字段
      expect(q.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
    }
  });

  test('B-3: L1 图标全部为 SVG 类型', () => {
    const { L1_VISUAL_DATA } = require('../../data/layers/L1_visualData');
    for (const [type, style] of Object.entries(L1_VISUAL_DATA.cellVisualStyles)) {
      expect(style.icon.type).toBe('svg');
    }
  });

  test('C-1: assembleFullTopology 输出含完整 visualConfig', () => {
    const t = assembleL1Topology();
    expect(t.visualConfig).toBeDefined();
    expect(t.visualConfig.border.mode).toBe('checkerboard-fill');
    expect(t.visualConfig.quadrantLabels).toHaveLength(4);
  });

  test('C-2: 输出的 Boss 样式完整', () => {
    const t = assembleL1Topology();
    const b = t.visualConfig.cellVisualStyles.get('boss');
    expect(b.sizeMultiplier).toBe(2.5);
    expect(b.animationClass).toBe('gm-boss-emerge');
    expect(b.icon.type).toBe('svg');
  });

  test('C-3: zoneBackgrounds 含 enterAnimClass', () => {
    const t = assembleL1Topology();
    for (const z of ['W','N','I','P']) {
      expect(t.visualConfig.zoneBackgrounds[z].enterAnimClass).toContain('gm-zone-');
    }
  });

  test('D-1: MovementController 可创建', () => {
    const { MovementController } = require('../../engine/movementController');
    const ctrl = new MovementController(mockEventBus());
    expect(ctrl.getPieceState()).toBeDefined();
    expect(ctrl.getPieceState().isMoving).toBe(false);
  });

  test('E-1: GourdMapRenderer 可挂载（无报错）', () => {
    const { GourdMapRenderer } = require('../../components/GourdMapRenderer');
    const t = assembleL1Topology();
    const wrapper = mount(
      <GourdMapRenderer topology={t} cells={[]}
                      currentPosition={null} pieceState={null} />
    );
    expect(wrapper.exists()).toBe(true);
    // 检查SVG存在
    expect(wrapper.find('svg').length).toBeGreaterThan(0);
    wrapper.unmount();
  });
});
```

### Task F2: 视觉参数精确回归

```typescript
// src/tower-mode/__tests__/visual/VisualParamsRegression.test.ts

describe('第八轮视觉参数回归', () => {

  describe('W/N/I/P 参数', () => {
    test.each(['L1','L2','L3','L4','L5','L6','L7','L8','L9'])
    ('%s 的 quadrantLabels fontSizeRatio ≥ 0.20', (layer) => {
      const t = getTopology(parseInt(layer[1]));
      for (const q of t.visualConfig.quadrantLabels) {
        expect(q.fontSizeRatio).toBeGreaterThanOrEqual(0.20);
      }
    });

    test.each(['W','N','I','P'])
    ('%s 象限有白色描边和阴影', (zone) => {
      const t = getTopology(1);
      const q = t.visualConfig.quadrantLabels.find((x:any) => x.quadrant === zone);
      expect(q?.strokeColor).toBe('#FFFFFF');
      expect(q?.strokeWidth).toBeGreaterThan(0);
      expect(q?.shadowColor).toBe('#000000');
    });
  });

  describe('边框参数', () => {
    test('全部9层 mode = checkerboard-fill', () => {
      for (let i = 1; i <= 9; i++) {
        expect(getTopology(i).visualConfig.border.mode).toBe('checkerboard-fill');
      }
    });

    test('边框配色为橙黄白', () => {
      const b = getTopology(1).visualConfig.border;
      expect(b.colors).toEqual(['#FFAA00', '#FFFFFF']);
    });

    test('边框有外发光配置', () => {
      const b = getTopology(1).visualConfig.border;
      expect(b.glowColor).toContain('255,170,0');
    });
  });

  describe('Boss/精英参数', () => {
    test.each([1,2,3,4,5,6,7,8,9])
    ('第%s层 Boss sizeMultiplier=2.5', (layer) => {
      const s = getTopology(layer).visualConfig.cellVisualStyles.get('boss')?.sizeMultiplier;
      expect(s).toBeCloseTo(2.5, 1);
    });

    test('Boss 有 emerge 动画类名', () => {
      expect(getTopology(1).visualConfig.cellVisualStyles.get('boss')?.animationClass)
        .toBe('gm-boss-emerge');
    });

    test('精英格有 jagged 动画类名', () => {
      expect(getTopology(1).visualConfig.cellVisualStyles.get('elite')?.animationClass)
        .toBe('gm-elite-jagged');
    });
  });

  describe('图标引用', () => {
    test('主要格子类型的 icon.type 均为 svg', () => {
      const types = ['start','boss','battle','bookstore','skill'];
      for (const type of types) {
        expect(getTopology(1).visualConfig.cellVisualStyles.get(type)?.icon.type).toBe('svg');
      }
    });
  });

  describe('装饰元素', () => {
    test('L1 decorations ≥ 5 个', () => {
      expect(getTopology(1).visualConfig.decorations.length).toBeGreaterThanOrEqual(5);
    });

    test('L1 上圆区域有 planet 类型装饰', () => {
      const decs = getTopology(1).visualConfig.decorations;
      expect(decs.some(d => d.type === 'planet')).toBe(true);
    });
  });

  describe('状态覆盖样式', () => {
    test('locked 状态 opacity < 0.5', () => {
      const so = getTopology(1).visualConfig.stateVisualOverrides.locked;
      expect(so.opacity).toBeLessThan(0.5);
    });

    test('current 状态有 glow 动画', () => {
      const so = getTopology(1).visualConfig.stateVisualOverrides.current;
      expect(so.animationClass).toBe('gm-glow-current');
    });

    test('pending 状态有 pulse 动画', () => {
      const so = getTopology(1).visualConfig.stateVisualOverrides.pending;
      expect(so.animationClass).toBe('gm-pulse-orange');
    });
  });
});
```

### Task F3: 渲染组件交互

```typescript
describe('第八轮渲染交互测试', () => {

  test('传入 pieceState 时渲染 AnimationLayer 元素', () => {
    const ps: PlayerPieceState = {
      position: { x: 0.5, y: 0.5 }, targetPosition: null,
      isMoving: false, moveStartTime: null, moveDuration: 0,
      trailHistory: [], currentCellId: 'test', justArrived: false, currentZone: null,
    };
    const w = mount(<GourdMapRenderer topology={t} cells={[]}
                                currentPosition={null} pieceState={ps} />);
    const html = w.html();
    expect(html).toContain('gm-piece-breathe');
    w.unmount();
  });

  test('轨迹光痕正确渲染为绿色圆圈', () => {
    const ps: PlayerPieceState = {
      position: { x: 0.6, y: 0.6 }, targetPosition: { x: 0.7, y: 0.7 },
      isMoving: true, moveStartTime: Date.now() - 200, moveDuration: 500,
      trailHistory: [
        { x: 0.5, y: 0.5, timestamp: Date.now()-300, opacity: 0.8 },
        { x: 0.55, y: 0.55, timestamp: Date.now()-200, opacity: 0.9 },
        { x: 0.58, y: 0.58, timestamp: Date.now()-100, opacity: 1.0 },
      ],
      currentCellId: 'c3', justArrived: false, currentZone: 'W',
    };
    const w = mount(<GourdMapRenderer topology={t} cells={[]}
                                currentPosition={null} pieceState={ps} />);
    const html = w.html();
    expect(html).toContain('#44ff88'); // 绿色
    expect((html.match(/trail-/g) || []).length).toBeGreaterThanOrEqual(3);
    w.unmount();
  });

  test('justArrived=true 渲染到达波纹', () => {
    const ps: PlayerPieceState = {
      position: { x: 0.5, y: 0.5 }, targetPosition: { x: 0.5, y: 0.5 },
      isMoving: false, moveStartTime: null, moveDuration: 0,
      trailHistory: [], currentCellId: 'arrived',
      justArrived: true, currentZone: 'N',
    };
    const w = mount(<GourdMapRenderer topology={t} cells={[]}
                                currentPosition={null} pieceState={ps} />);
    expect(w.html()).toContain('gm-arrival-ripple');
    w.unmount();
  });

  test('Boss格在SVG中尺寸明显更大', () => {
    // 需要一个包含boss格的topology
    const w = mount(<GourdMapRenderer topology={bossTopology} cells={bossCells}
                                currentPosition={null} pieceState={null} />);
    const html = w.html();
    // 检查是否有 gm-boss-emerge 类名
    expect(html).toContain('gm-boss-emerge');
    w.unmount();
  });

  test('切换层级不崩溃', async () => {
    let w;
    await act(async () => { w = mount(<GourdMapRenderer topology={l1} cells={[]} />); });
    await act(async () => { w.setProps({ topology: l2 }); });
    expect(w.exists()).toBe(true);
    w.unmount();
  });
});
```

### Task F4: 性能基准

```typescript
describe('第八轮性能基准', () => {

  test('GourdMapRenderer 首次渲染 < 200ms', async () => {
    const start = performance.now();
    render(<GourdMapRenderer topology={t} cells={[]} />);
    await waitFor(() => screen.getByTestId('gourd-map'));
    expect(performance.now() - start).toBeLessThan(200);
  }, 10000);

  test('SVG子元素总数 < 300', () => {
    const { container } = render(<GourdMapRenderer topology={t} cells={[]} />);
    const count = container.querySelectorAll('svg *').length;
    expect(count).toBeLessThan(300);
  });

  test('CurvedPathEngine 100次插值 < 20ms', () => {
    // ... 同第七轮 ...
  });

  test('preassembleAllLayers 9层 < 800ms', () => {
    const start = performance.now();
    const result = preassembleAllLayers();
    expect(result.size).toBe(9);
    expect(performance.now() - start).toBeLessThan(800);
  });
});
```

### Task F5: 手动验证清单（40项）

启动 `npm run dev`，打开浏览器访问爬塔模式，逐项检查：

#### 一、整体布局（4项）
- [ ] 地图为**葫芦形**（上小圆+连接+下大圆），非矩形网格
- [ ] 比例协调（上圆直径约为下圆的50~60%）
- [ ] 连接通道自然过渡（上下圆之间有收腰）
- [ ] 页面加载后2秒内地图完整显示

#### 二、象限标识 W/N/I/P（6项）★★★
- [ ] 四个字母**非常大且醒目**（一眼就能看到！）
- [ ] 字体为**粗黑体**
- [ ] W/P 为**橙红色**，N/I 为**金黄色**
- [ ] 有**白色描边**（字母边缘清晰可见）
- [ ] 有**阴影效果**（立体感）
- [ ] 十字分割线清晰可见

#### 三、棋盘格边框（5项）★★★
- [ ] 是**实心方格交替填充**图案（像国际象棋棋盘！）
- [ ] 配色为**橙黄白**交替
- [ ] 方格沿葫芦形轮廓分布
- [ ] 整体有一定透明度（能隐约看到内部内容）
- [ ] 外围有轻微发光效果

#### 四、功能格子系统（7项）★★★
- [ ] 格子沿葫芦轮廓**自然分布**
- [ ] **Boss格明显比普通格大很多**（约2.5倍面积）
- [ ] Boss格有**红色脉动光环动画**
- [ ] 精英格有**锯齿状虚线边框+抖动**
- [ ] 格子使用**矢量风格图标**（不是emoji）
- [ ] 不同类型格子形状不同（圆/六角/菱形/方等）
- [ ] 锁定格灰暗半透明，待处理格橙色闪烁

#### 五、线路系统（3项）
- [ ] 格子间连线为**平滑曲线**（贝塞尔曲线）
- [ ] 主线颜色与层级主题一致
- [ ] 支线/回程线用不同颜色或虚线区分

#### 六、玩家棋子与动画（7项）★★★
- [ ] **玩家棋子可见**（绿色圆形+内部标记）
- [ ] 棋子有**缓慢呼吸动画**（缩放脉动）
- [ ] 移动时显示**轨迹光痕**（渐隐的绿色光点）
- [ ] 到达新格子时有**扩散波纹**
- [ ] Boss格首次出现时有**弹性登场动画**
- [ ] 进入W/N/I/P区域时对应**区域特效触发**

#### 七、背景装饰（4项）
- [ ] 上圆中央有**星球/核心装饰**
- [ ] 背景有**深色渐变**（非纯色）
- [ ] 有**云朵/粒子/数据流**等点缀装饰
- [ ] 装饰元素有**微浮动动画**

#### 八、层级切换（3项）
- [ ] 点击可切换L1~L9
- [ ] 每层布局/主题色不同
- [ ] 切换时无明显闪烁/白屏

#### 九、性能体验（3项）
- [ ] 切换层级卡顿 < 250ms
- [ ] 无明显内存泄漏（切换10次后仍流畅）
- [ ] 控制台无红色错误

---

### 已知问题记录模板

```markdown
# 第八轮已知问题

| # | 严重度 | 组 | 描述 | 建议修复 |
|---|--------|-----|------|---------|
|   | P0-P3 | A-F | | 第九轮 |
```

## 执行顺序

```
F1 冒烟测试 ──→ 通过? ──→ F2 视觉参数回归
                              │
F4 性能基准 ──────────────────┤
                              ↓ 通过
F3 渲染交互测试 ──→ 通过? ──→ F5 手动验证(浏览器)
                              │
                              ↓
                         F6 问题记录
```

## 验收标准

1. ✅ F1 冒烟 11项全通过（A/B/C/D/E各至少1项）
2. ✅ F2 视觉回归 ≥ 25项断言通过
3. ✅ F3 渲染交互 5项通过
4. ✅ F4 性能 4项达标
5. ✅ F5 手动验证 ≥ 35/40 项
6. ✅ TypeScript 编译零错误
7. ✅ 原有 557 测试全部通过（无回归）
8. ✅ 已知问题已记录
