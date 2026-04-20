# F组第十轮 — 形状/拓扑/机制/流程 全面测试 + 70项验证

## 背景

第十轮A-E组引入了大量新功能：
- A组: GourdShapeFactory (9种形状变体)
- B组: PerLayerTopologyGenerator (9种拓扑)
- C组: MechanicVisualizer (9种机制可视化)
- D组: TowerGameController (引擎UI闭环)
- E组: 分层视觉打磨(路径/转场/装饰/Boss)

F组需要确保：
1. 所有新代码**编译通过、测试通过**
2. 新旧代码**无回归**
3. **70项手动验证**覆盖形状/拓扑/机制/流程全链路

## 具体任务

### Task F1: ★★★ P0 — 形状工厂单元测试

**新建文件**: `src/tower-mode/__tests__/geometry/GourdShapeFactory.test.ts`

```typescript
describe('F1 — GourdShapeFactory 形状变体测试', () => {
  
  describe('1.1 工厂基本功能', () => {
    test('生成L1返回standard变体', () => {
      const shape = GourdShapeFactory.generate({ layerNumber: 1, mechanicType: '', themeName: '', difficulty: 1 });
      expect(shape.variant).toBe('standard');
    });

    test('生成L6返回hex-flat变体', () => {
      const shape = GourdShapeFactory.generate({ layerNumber: 6, mechanicType: 'teleport', themeName: '', difficulty: 6 });
      expect(shape.variant).toBe('hex-flat');
    });

    test('生成L8返回asymmetric变体', () => {
      const shape = GourdShapeFactory.generate({ layerNumber: 8, mechanicType: 'collapse', themeName: '', difficulty: 8 });
      expect(shape.variant).toBe('asymmetric');
    });

    test('生成L9返回expanded-palace变体', () => {
      const shape = GourdShapeFactory.generate({ layerNumber: 9, mechanicType: 'protocol', themeName: '', difficulty: 9 });
      expect(shape.variant).toBe('expanded-palace');
    });
  });

  describe('1.2 L6扁平六角关键参数', () => {
    const l6 = GourdShapeFactory.generate({ layerNumber: 6, mechanicType: '', themeName: '', difficulty: 6 });
    
    test('下圆scaleX > 1.3 (横向拉伸)', () => {
      expect(l6.lowerCircle.scaleX).toBeGreaterThan(1.3);
    });
    
    test('下圆scaleY < 0.65 (纵向压扁)', () => {
      expect(l6.lowerCircle.scaleY).toBeLessThan(0.65);
    });

    test('innerGrid类型为hex', () => {
      expect(l6.visualModifiers.innerGrid?.type).toBe('hex');
    });
  });

  describe('1.3 L8不对称坍缩关键参数', () => {
    const l8 = GourdShapeFactory.generate({ layerNumber: 8, mechanicType: '', themeName: '', difficulty: 8 });
    
    test('上圆和下圆中心x坐标不同(不对称)', () => {
      expect(l8.upperCircle.center.x).not.toBe(l8.lowerCircle.center.x);
    });

    test('outlineStyle为crack', () => {
      expect(l8.visualModifiers.outlineStyle).toBe('crack');
    });
  });

  describe('1.4 L9宫殿扩展关键参数', () => {
    const l9 = GourdShapeFactory.generate({ layerNumber: 9, mechanicType: '', themeName: '', difficulty: 9 });
    
    test('globalTransform.scale > 1.05', () => {
      expect(l9.globalTransform.scale).toBeGreaterThan(1.05);
    });

    test('下圆有4个subZones(宫殿分区)', () => {
      expect(l9.lowerCircle.subZones).toHaveLength(4);
    });

    test('包含throne子区域', () => {
      const throne = l9.lowerCircle.subZones?.find(z => z.id === 'throne');
      expect(throne).toBeDefined();
    });
  });

  describe('1.5 L2宽底网络参数', () => {
    const l2 = GourdShapeFactory.generate({ layerNumber: 2, mechanicType: '', themeName: '', difficulty: 2 });
    
    test('下圆radiusX显著大于radiusY', () => {
      expect(l2.lowerCircle.radiusX).toBeGreaterThan(l2.lowerCircle.radiusY * 1.25);
    });

    test('bgTexture为circuit', () => {
      expect(l2.visualModifiers.bgTexture).toBe('circuit');
    });
  });

  describe('1.6 getAllPresets 返回9层全部配置', () => {
    const all = GourdShapeFactory.getAllPresets();
    expect(Object.keys(all)).toHaveLength(9);
    for (let i = 1; i <= 9; i++) {
      expect(all[i]).toBeDefined();
      expect(all[i].variant).toBeTruthy();
    }
  });
});
```

### Task F2: ★★★ P0 — 拓扑生成器单元测试

**新建文件**: `src/tower-mode/__tests__/geometry/PerLayerTopologyGenerator.test.ts`

```typescript
describe('F2 — PerLayerTopologyGenerator 拓扑差异测试', () => {

  test('L1标准拓扑20格', () => {
    const topo = generateStandardGourd(createStandardGourd());
    expect(topo.cells).toHaveLength(20);
    expect(topo.startCellId).toBe('U0');
    expect(topo.bossCellId).toBe('L11');
  });

  test('L2密集网络30+格', () => {
    const shape = createWideLowerGourd();
    const topo = generateL2DenseNetwork(shape);
    expect(topo.cells.length).toBeGreaterThan(30);  // 显著多于20
    // 应包含hidden类型的连接(传送门)
    const hiddenConns = topo.connections.filter(c => c.type === 'hidden');
    expect(hiddenConns.length).toBeGreaterThan(0);
  });

  test('L6六角迷宫含hex区域ID', () => {
    const shape = createHexFlatGourd();
    const topo = generateL6HexMaze(shape);
    expect(topo.cells.length).toBeGreaterThan(28);  // 六角迷宫格子多
    // 格子应有hex-*格式的zoneId
    const hexZonedCells = topo.cells.filter(c => c.zoneId?.startsWith('hex-'));
    expect(hexZonedCells.length).toBeGreaterThan(10);
  });

  test('L3三环拓扑含outer/mid/core区域', () => {
    const shape = createTripleRingGourd();
    const topo = generateL3TripleRing(shape);
    const zoneIds = Object.keys(topo.zoneInfo);
    expect(zoneIds).toContain('outer');
    expect(zoneIds).toContain('mid');
    expect(zoneIds).toContain('core');
  });

  test('L4城市街区含polygon类型子区域', () => {
    const shape = createScatteredGourd();
    const topo = generateL4CityDistricts(shape);
    expect(topo.cells.length).toBeGreaterThan(20);
    // 应有4个不规则街块区域
    expect(Object.keys(topo.zoneInfo).length).toBeGreaterThanOrEqual(4);
  });

  test('所有层startCellId和bossCellId有效', () => {
    for (let i = 1; i <= 9; i++) {
      const shape = GourdShapeFactory.generate({ layerNumber:i, mechanicType:'', themeName:'', difficulty:i });
      const topo = PerLayerTopologyGenerator.generate(i, shape);
      expect(topo.startCellId).toBeTruthy();
      expect(topo.bossCellId).toBeTruthy();
      expect(topo.cells.find(c => c.id === topo.startCellId)?.type).toBe('start');
      expect(topo.cells.find(c => c.id === topo.bossCellId)?.type).toBe('boss');
    }
  });
});
```

### Task F3: ★★☆ P1 — 机制可视化组件测试

**新建文件**: `src/tower-mode/__tests__/visual/MechanicVisualizer.test.ts`

```typescript
describe('F3 — MechanicVisualizer 9种机制渲染测试', () => {
  
  const baseProps = {
    cellPositions: { 'test': { x: 50, y: 60 } },
    connections: [],
  };

  test('acceleration机制显示进度条', () => {
    render(<MechanicVisualizer mechanicType="acceleration" wStreakCount={2} {...baseProps} />);
    expect(screen.container.innerHTML).toContain('扩散加速');
  });

  test('jump机制显示JUMP标记', () => {
    render(<MechanicVisualizer mechanicType="jump" {...baseProps} />);
    expect(screen.container.innerHTML).toContain('JUMP');
  });

  test('sequence机制显示顺序指示', () => {
    render(<MechanicVisualizer mechanicType="sequence" activeSequenceStep={1} {...baseProps} />);
    expect(screen.container.innerHTML).toBeTruthy(); // 至少不崩溃
  });

  test('blockade机制在有blockedPathIds时显示BLOCKED', () => {
    render(<MechanicVisualizer mechanicType="blockade" 
           blockedPathIds={new Set(['p1'])} 
           connections={[{ id:'p1', from:'a', to:'b', type:'main' }]}
           {...baseProps} />);
    expect(screen.container.innerHTML).toContain('BLOCKED');
  });

  test('teleport机制显示传送门效果', () => {
    render(<MechanicVisualizer mechanicType="teleport" {...baseProps} />);
    expect(screen.container.innerHTML).toBeTruthy();
  });

  test('collapse机制显示COLLAPSING警告', () => {
    render(<MechanicVisualizer mechanicType="collapse" {...baseProps} />);
    expect(screen.container.innerHTML).toContain('COLLAPSING');
  });

  test('protocol机制显示指引线', () => {
    render(<MechanicVisualizer mechanicType="protocol"
           protocolCorrectPath={['a','b','c']}
           cellPositions={{ a:{x:30,y:50}, b:{x:50,y:60}, c:{x:70,y:50} }}
           {...baseProps} />);
    expect(screen.container.innerHTML).toBeTruthy();
  });
});
```

### Task F4: ★★☆ P1 — 游戏闭环E2E测试

**新建文件**: `src/tower-mode/__tests__/e2e/TenthRoundGameLoop.test.ts`

```typescript
describe('F4 — 第十轮游戏闭环E2E', () => {

  test('完整流程: 创建Controller → 加载L1 → 投掷 → 路径 → 移动 → 到达', async () => {
    const { result } = renderHook(() => useTowerGameController());
    
    // 等待初始化
    await waitFor(() => expect(result.current.phase).toBe('idle'));
    expect(result.current.topology).toBeDefined();
    expect(result.current.shapeConfig).toBeDefined();

    // 投掷骰子
    act(() => { result.current.rollDice(); });
    await waitFor(() => expect(result.current.isRolling).toBe(true));
    
    // 等待投掷完成（模拟动画结束）
    act(() => { /* 手动推进状态 */ });
    await waitFor(() => expect(result.current.diceResult).not.toBeNull());
    expect(result.current.phase).toBe('dice_result');

    // 验证资源存在
    expect(result.current.techValue).toBe(100);
    expect(result.current.gold).toBe(0);
    expect(result.current.turnNumber).toBe(1);
  });

  test('切换层级时shapeConfig更新', async () => {
    const { result } = renderHook(() => useTowerGameController());
    await waitFor(() => expect(result.current.shapeConfig).not.toBeNull());

    const l1Variant = result.current.shapeConfig!.variant;
    
    act(() => { result.current.loadLayer(6); });
    await waitFor(() => {
      expect(result.current.shapeConfig!.variant).not.toBe(l1Variant);
      expect(result.current.shapeConfig!.variant).toBe('hex-flat');
    });

    act(() => { result.current.loadLayer(9); });
    await waitFor(() => {
      expect(result.current.shapeConfig!.variant).toBe('expanded-palace');
    });
  });
});
```

### Task F5: ★☆☆ P2 — 性能基准（新增形状/拓扑负载）

**新建文件**: `src/tower-mode/__tests__/performance/TenthRoundPerf.test.ts`

```typescript
describe('F5 — 第十轮性能基准', () => {

  test('GourdShapeFactory 9层全量生成 < 20ms', () => {
    const start = performance.now();
    for (let i = 1; i <= 9; i++) {
      GourdShapeFactory.generate({ layerNumber: i, mechanicType: '', themeName: '', difficulty: i });
    }
    expect(performance.now() - start).toBeLessThan(20);
  });

  test('PerLayerTopologyGenerator L6(37格) < 50ms', () => {
    const shape = GourdShapeFactory.generate({ layerNumber: 6, mechanicType: '', themeName: '', difficulty: 6 });
    const start = performance.now();
    const topo = PerLayerTopologyGenerator.generate(6, shape);
    expect(performance.now() - start).toBeLessThan(50);
    expect(topo.cells.length).toBeGreaterThan(28);
    expect(topo.connections.length).toBeGreaterThan(40);
  });

  test('GourdMapRenderer 带shapeConfig渲染 < 350ms', async () => {
    const shape = GourdShapeFactory.generate({ layerNumber: 6, mechanicType: '', themeName: '', difficulty: 6 });
    const topo = assembleFullTopologyV10(6);
    const start = performance.now();
    render(
      <GourdMapRenderer topology={topo} cells={topo.cells}
                     shapeConfig={shape} pieceState={null} />
    );
    await waitFor(() => screen.getByTestId('gourd-map'));
    expect(performance.now() - start).toBeLessThan(350);
  }, 10000);

  test('SVG元素总数合理 (< 450，因新增innerGrid/mechanicViz/subZone)', async () => {
    const shape = GourdShapeFactory.generate({ layerNumber: 6, mechanicType: '', themeName: '', difficulty: 6 });
    const topo = assembleFullTopologyV10(6);
    const { container } = render(
      <GourdMapRenderer topology={topo} cells={topo.cells}
                     shapeConfig={shape} pieceState={null} />
    );
    const count = container.querySelectorAll('svg *').length;
    expect(count).toBeLessThan(450);  // 第九轮是~300，第十轮增加innerGrid+mechanicViz
  });
});
```

### Task F6: ★★★ P0 — 70项手动验证清单

启动 `npm run dev`，浏览器打开爬塔模式，逐项检查：

#### 一、形状差异化 (12项) | Gap-P0-1

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| S1 | L1为**标准葫芦形**(上下比例正常) | ✅ | [ ] |
| S2 | L2**下圆明显偏宽**(横向扩展>20%) | ✅ 视觉可辨 | [ ] |
| S3 | L3**下圆内可见三环分区**(outer/mid/core) | ✅ 同心圆结构 | [ ] |
| S4 | L4**下圆呈分散多区块**(非单一圆形) | ✅ 街块感 | [ ] |
| S5 | L5**整体纵向压缩**(长条形) | ✅ 传送带感 | [ ] |
| S6 | L6**明显扁平**(高宽比<0.6)+**六角网格** | ✅ 最独特！ | [ ] |
| S7 | L7**边缘不规则**(云朵状缺口) | ✅ 飘浮感 | [ ] |
| S8 | L8**明显不对称**(上下圆中心不对齐) | ✅ 坍缩倾斜 | [ ] |
| S9 | L9**整体最大**(scale>1.05)+**四区宫殿** | ✅ 宏伟感 | [ ] |
| S10 | 切换L1→L6→L9时**每次形状都不同** | ✅ 三种截然不同 | [ ] |
| S11 | L6的innerGrid可见**蜂窝状辅助线** | ✅ 六角网格 | [ ] |
| S12 | L8的outline可见**裂纹效果** | ✅ 非平滑边框 | [ ] |

#### 二、拓扑/布局差异化 (12项) | Gap-P0-2

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| T1 | L1约**20个格子** | ✅ 标准密度 | [ ] |
| T2 | L2格子数量**>30**(密集节点) | ✅ 明显更密 | [ ] |
| T3 | L6格子数量**>28**(迷宫复杂) | ✅ 最多格子 | [ ] |
| T4 | L9格子数量**>28**(宫殿扩展) | ✅ 大型地图 | [ ] |
| T5 | L2连接线呈**网状互联**(多条交叉) | ✅ 网络感 | [ ] |
| T6 | L6连接线呈**迷宫式**(非直观) | ✅ 迷路感 | [ ] |
| T7 | L6有**type=hidden的传送门连接**(紫色虚线) | ✅ teleport可视化 | [ ] |
| T8 | L3区域分为**outer/mid/core**三区(非W/N/I/P) | ✅ 顺序机制暗示 | [ ] |
| T9 | L4区域为**4个polygon街区**(非圆形扇形) | ✅ 街道感 | [ ] |
| T10 | L5区域为**4个rect流水线**(长条形) | ✅ 工厂感 | [ ] |
| T11 | L9区域含**throne/wing/gate**宫殿分区 | ✅ 终极Boss区 | [ ] |
| T12 | 格子**分布位置随层级变化**(不是固定模板) | ✅ 每层不同 | [ ] |

#### 三、机制可视化 (9项) | Gap-P0-3

| # | 检查项 | 操作步骤 | 预期结果 | 通过? |
|---|--------|---------|---------|------|
| M1 | **L1加速进度条** | 进入L1查看W区附近 | 可见"W区连击 0/3"进度条 | [ ] |
| M2 | **L2跳跃标记** | 进入L2查看远处格子 | 有↑JUMP高亮圈 | [ ] |
| M3 | **L3顺序指示** | 进入L3查看下圆中心 | 有①②③三环标记 | [ ] |
| M4 | **L5阻塞标记** | L5被阻塞的路径中点 | 有红色"X BLOCKED"闪烁 | [ ] |
| M5 | **L6迷雾传送门** | 进入L6 | 全局淡紫色迷雾+光柱传送门 | [ ] |
| M6 | **L7漂移箭头** | 进入L7观察背景 | 缓慢移动的方向箭头场 | [ ] |
| M7 | **L8坍缩裂纹** | 进入L8 | 地图上有红色裂纹线+"COLLAPSING ZONE" | [ ] |
| M8 | **L9礼仪指引** | 进入L9 | 金色虚线路径+①②③...编号 | [ ] |
| M9 | **机制与层数对应正确** | 逐一检查L1-L9 | 每层的机制可视化与layerMechanic.type匹配 | [ ] |

#### 四、引擎-UI闭环 (14项) | Gap-P1-5

| # | 检查项 | 操作步骤 | 预期结果 | 通过? |
|---|--------|---------|---------|------|
| E1 | **HUD显示当前信息** | 观察顶部 | 层级名/回合数/技术值/金币/阶段均可见 | [ ] |
| E2 | **投掷按钮可用** | phase=idle时 | "🎲 投掷骰子"按钮可点击(非灰) | [ ] |
| E3 | **点击投掷→Dice3D翻滚** | 点击投掷按钮 | 骰子开始3D翻滚动画(~1.7s) | [ ] |
| E4 | **骰子结果显示** | 翻滚结束后 | 显示点数+修正值列表 | [ ] |
| E5 | **可达路径高亮** | 结果出来后 | 地图上对应步数的格子发光 | [ ] |
| E6 | **分叉时出现PathSelector** | 存在分叉路 | 底部/侧边出现路径选择按钮 | [ ] |
| E7 | **选择路径后棋子移动** | 选择一条路径 | 绿色棋子沿曲线移动到目标 | [ ] |
| E8 | **到达波纹触发** | 棋子停稳后 | 目标格产生双环波纹 | [ ] |
| E9 | **CellInfoPanel弹出** | 踩中功能格 | 信息面板弹窗出现 | [ ] |
| E10 | **面板显示完整信息** | 观察面板 | 名称/星级/敌人/收益/卡牌齐全 | [ ] |
| E11 | **进入按钮回调正确** | 点"进入" | 面板关闭，触发对应逻辑 | [ ] |
| E12 | **技术值变化反映在HUD** | 战斗胜利后 | HUD技术值数字增加 | [ ] |
| E13 | **回合自动递增** | 一回合结束后 | 回合数+1，phase回到idle | [ ] |
| E14 | **层级切换可用** | 点击左侧其他层 | 地图形状/格子/连接全部改变 | [ ] |

#### 五、分层视觉增强 (13项) | Gap-P1-3/P1-4/P2-1

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| V1 | L2路径为**蓝色光缆风格** | 路径线偏蓝+可能有粒子 | [ ] |
| V2 | L5路径为**绿色传送带风格** | 路径线偏绿+滚动虚线 | [ ] |
| V3 | L9路径为**金色发光风格** | 路径线金+有光晕 | [ ] |
| V4 | L2装饰物含**发光节点** | 小圆点发光 | [ ] |
| V5 | L4装饰物含**建筑轮廓** | 矩形建筑剪影 | [ ] |
| V6 | L6装饰物含**信号塔脉冲** | 三角形+波纹 | [ ] |
| V7 | L9装饰物含**王座柱光柱** | 竖直矩形+向上光芒 | [ ] |
| V8 | L9 Boss**远大于**其他层Boss | 对比L1 Boss可见size×3.0 | [ ] |
| V9 | L9 Boss有**王座底座**(4柱) | Boss下方有基座结构 | [ ] |
| V10 | L9 Boss有**三层能量光环** | 红/橙/金三层脉动环 | [ ] |
| V11 | 层级转场**L1→L2**有特效 | 切换时有过渡动画(~1s) | [ ] |
| V12 | 层级转场**L8→L9**最华丽 | 能量爆发冲击波+射线 | [ ] |
| V13 | 切换层级**无白屏闪烁** | 过渡流畅自然 | [ ] |

#### 六、性能与稳定 (5项)

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| P1 | 页面加载<3秒 | 打开爬塔模式后3秒内完全渲染 | [ ] |
| P2 | L6(最复杂层)渲染<500ms | 切换到L6无明显卡顿 | [ ] |
| P3 | 连续切层10次仍流畅 | 无内存泄漏征兆 | [ ] |
| P4 | 控制台零红色error | F12 Console检查 | [ ] |
| P5 | 952+原有测试全部通过 | `npx vitest run` | [ ] |

---

### 统计汇总

| 类别 | 总项 | 目标通过率 |
|------|-----|-----------|
| 一、形状差异化 | 12 | ≥90% |
| 二、拓扑/布局差异化 | 12 | ≥85% |
| 三、机制可视化 | 9 | ≥80% |
| 四、引擎UI闭环 | 14 | ≥75% |
| 五、分层视觉增强 | 13 | ≥80% |
| 六、性能稳定 | 5 | 100% |
| **合计** | **65** | **≥82%(53/65)** |

---

## 执行顺序

```
F1 形状工厂测试 ──┐
F2 拓扑生成测试 ──┤── 全部通过?
F3 机制可视化测试 ─┤       │
F4 游戏闭环E2E ────┤       ↓ 通过
F5 性能基准 ───────┤       │
                         ├──→ F6 手动验证(浏览器65项)
                         │        │
                         │        ↓ 通过
                         └──→ F7 问题记录
```
