# F组第十一轮 — 集成测试与端到端验证

## 背景

第十轮的单元测试覆盖了独立组件，但缺乏集成测试、端到端测试、性能测试和手动验证。需要补全这些测试确保整个爬塔模式真正可玩。

## 🎯 本轮目标

**从单元测试到系统级验证** — 确保所有组件协同工作正确，游戏流程完整可通关，性能达标。

---

## 任务详情

### Task F1: ★★★ P0 — 集成测试套件

**新建文件**: `src/tower-mode/__tests__/integration/TowerMode.integration.test.ts`

```typescript
/**
 * 爬塔模式集成测试 — 验证组件间协作
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TowerClimbView } from '../../components/TowerClimbView/TowerClimbView';
import { ShapeDrivenMapAdapter } from '../../adapters/ShapeDrivenMapAdapter';
import { ZoneEffectResolver } from '../../engine/ZoneEffectResolver';
import { MechanicEffectEngine } from '../../engine/MechanicEffectEngine';

describe('TowerMode Integration Tests', () => {

  describe('完整游戏流程', () => {
    it('应该能渲染L1地图并显示正确层名', () => {
      render(<TowerClimbView initialLayer={1} />);
      expect(screen.getByText('病毒实验室')).toBeInTheDocument();
    });

    it('掷骰子后应该出现路径选择', async () => {
      render(<TowerClimbView initialLayer={1} />);
      const rollBtn = screen.getByRole('button', { name: /投掷/i });
      fireEvent.click(rollBtn);
      await waitFor(() => {
        expect(screen.queryByText(/路径/i)).not.toBeNull();
      });
    });

    it('选择路径后棋子应该移动', async () => {
      // 模拟掷骰→选路→移动流程
    });

    it('到达格子后应该弹出信息面板', async () => {
      // 模拟移动到达→验证CellInfoPanel出现
    });
  });

  describe('机制效果集成', () => {
    it('L1连续通过3个W区应该触发加速', () => {
      const engine = new MechanicEffectEngine(mockEngine);
      // 模拟3次到达W区
      // 验证bonus_steps效果
    });

    it('L3不按顺序应该被送回', () => {
      const engine = new MechanicEffectEngine(mockEngine);
      // 模拟跳过外环直接进入中环
      // 验证sequence_violation + returnToCell
    });

    it('L9未按顺序进入CORE应该遣返G0', () => {
      const engine = new MechanicEffectEngine(mockEngine);
      const result = engine.onCellArrived('CORE_2', 9);
      expect(result.type).toBe('protocol_violation');
      expect(result.data?.returnToCell).toBe('G0');
    });
  });

  describe('Zone效果集成', () => {
    it('进入W区后掷骰应该-1', () => {
      const resolver = new ZoneEffectResolver(mockEngine);
      const result = resolver.resolve('L0', 'W');
      expect(result.type).toBe('dice_penalty');
      expect(result.value).toBe(-1);
    });

    it('进入S区后掷骰应该+1', () => {
      const resolver = new ZoneEffectResolver(mockEngine);
      const result = resolver.resolve('L0', 'S');
      expect(result.type).toBe('dice_bonus');
      expect(result.value).toBe(1);
    });

    it('进入D区应该损失3-8技术值', () => {
      const resolver = new ZoneEffectResolver(mockEngine);
      for (let i = 0; i < 20; i++) {
        const result = resolver.resolve('L0', 'D');
        expect(result.value).toBeGreaterThanOrEqual(3);
        expect(result.value).toBeLessThanOrEqual(8);
      }
    });
  });
});
```

### Task F2: ★★☆ P0 — 形状差异化验证测试

**新建文件**: `src/tower-mode/__tests__/adapters/ShapeDrivenMapAdapter.test.ts`

```typescript
import { ShapeDrivenMapAdapter } from '../../adapters/ShapeDrivenMapAdapter';

describe('ShapeDrivenMapAdapter - 9层形状差异化', () => {
  const expectedCounts: Record<number, number> = {
    1: 20, 2: 34, 3: 24, 4: 26, 5: 24, 6: 37, 7: 23, 8: 22, 9: 32,
  };

  for (const [layer, count] of Object.entries(expectedCounts)) {
    it(`L${layer}应该有${count}个格子`, () => {
      const data = ShapeDrivenMapAdapter.buildLayerRenderData(Number(layer));
      expect(data.topology.cellIds.length).toBe(Number(count));
    });
  }

  it('L2应该是宽底葫芦(下圆扩展)', () => {
    const data = ShapeDrivenMapAdapter.buildLayerRenderData(2);
    expect(data.shapeConfig.variant).toBe('wide-lower');
    expect(data.topology.lowerCircle.radiusX).toBeGreaterThan(data.topology.upperCircle.radius);
  });

  it('L6应该是扁平六角', () => {
    const data = ShapeDrivenMapAdapter.buildLayerRenderData(6);
    expect(data.shapeConfig.variant).toBe('hex-flat');
    expect(data.topology.lowerCircle.radiusY).toBeLessThan(data.topology.lowerCircle.radiusX * 0.6);
  });

  it('L8应该是不对称(上下圆心错位)', () => {
    const data = ShapeDrivenMapAdapter.buildLayerRenderData(8);
    expect(data.shapeConfig.variant).toBe('asymmetric');
    expect(data.topology.upperCircle.center.x).not.toBe(data.topology.lowerCircle.center.x);
  });

  it('L9应该是最大葫芦(scale=1.08)', () => {
    const data = ShapeDrivenMapAdapter.buildLayerRenderData(9);
    expect(data.shapeConfig.variant).toBe('expanded-palace');
    expect(data.shapeConfig.globalTransform.scale).toBeCloseTo(1.08, 1);
  });
});
```

### Task F3: ★★☆ P1 — 性能基准测试

**新建文件**: `src/tower-mode/__tests__/performance/TowerMode.performance.test.ts`

```typescript
/**
 * 性能基准测试 — 验证渲染和逻辑性能
 */

describe('TowerMode Performance Tests', () => {
  describe('渲染性能', () => {
    it('L1地图渲染应该在100ms内完成', () => {
      const start = performance.now();
      render(<ShapeDrivenGourdMapRenderer layerNumber={1} />);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('L6(最复杂层)地图渲染应该在200ms内完成', () => {
      const start = performance.now();
      render(<ShapeDrivenGourdMapRenderer layerNumber={6} />);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('机制引擎性能', () => {
    it('MechanicEffectEngine.onCellArrived应该在5ms内完成', () => {
      const engine = new MechanicEffectEngine(mockEngine);
      const start = performance.now();
      engine.onCellArrived('L0', 5);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5);
    });

    it('L7漂移计算应该在10ms内完成', () => {
      const engine = new MechanicEffectEngine(mockEngine);
      const start = performance.now();
      engine.onTurnStart(6);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });
  });
});
```

### Task F4: ★★☆ P1 — 手动验证清单(75项)

**新建文件**: `模式三规划记录/第十一轮手动验证清单.md`

```markdown
# 第十一轮手动验证清单

## A. 形状差异化(9项)

- [ ] L1显示为标准葫芦形(上小下大)
- [ ] L2显示为宽底葫芦(下圆明显扩展)
- [ ] L3显示为三环嵌套(outer/mid/core区域)
- [ ] L4显示为分散街区(4个polygon子区域)
- [ ] L5显示为长条葫芦(扁平)
- [ ] L6显示为扁平六角(极度压扁)
- [ ] L7显示为不规则云朵(偏移+旋转)
- [ ] L8显示为不对称(上下圆心错位)
- [ ] L9显示为最大葫芦(全局scale=1.08)

## B. 拓扑差异化(9项)

- [ ] L1有20个格子
- [ ] L2有34个格子(密集网络)
- [ ] L3有24个格子(外8+中6+内4+上6)
- [ ] L4有26个格子(4街区×6+上6)
- [ ] L5有24个格子(双线并行)
- [ ] L6有37个格子(六角网格)
- [ ] L7有23个格子(散落)
- [ ] L8有22个格子(量子环形)
- [ ] L9有32个格子(四象限+CORE)

## C. 机制可视化(9项)

- [ ] L1扩散加速进度条可见
- [ ] L2跨环跳跃虚线圆环可见
- [ ] L3层层解锁三环指示器可见
- [ ] L4街区事件浮动气泡可见
- [ ] L5流水线阻塞红色X可见
- [ ] L6信号切换紫色雾效可见
- [ ] L7云端漂移方向箭头可见
- [ ] L8观测坍缩裂纹可见
- [ ] L9殿堂礼仪金色路径可见

## D. 机制效果执行(9项)

- [ ] L1连续通过3个W区后步数确实+1
- [ ] L2掷骰≥4后可跳到内环
- [ ] L3不按顺序通过被送回入口
- [ ] L4进入新街区触发事件
- [ ] L5停留>2回合确实扣技术值
- [ ] L6移动有20%概率被传送
- [ ] L7每回合格子坐标偏移(肉眼可见)
- [ ] L8机会格确实锁定/解锁路径
- [ ] L9未按顺序进入CORE被遣返G0

## E. Zone效果执行(6项)

- [ ] W区掷骰确实-1
- [ ] N区获得书籍+算力+2
- [ ] I区地图倒置
- [ ] P区下回合被跳过
- [ ] S区掷骰确实+1
- [ ] D区确实损失3-8技术值

## F. 引擎-UI对接(8项)

- [ ] 掷骰子按钮可点击
- [ ] 掷骰后有动画
- [ ] 掷骰结果+修饰符正确显示
- [ ] 路径选择面板出现
- [ ] 选择路径后棋子移动
- [ ] 到达格子后信息面板出现
- [ ] Phase标签正确更新
- [ ] 资源数值实时更新

## G. 视觉打磨(9项)

- [ ] L1路径橙色
- [ ] L2路径蓝色光缆
- [ ] L3路径金色数据流
- [ ] L5路径绿色传送带
- [ ] L6路径橙色电信号
- [ ] L9路径金色宫殿风
- [ ] L1→L2转场有数据流粒子
- [ ] L8→L9转场有能量爆发
- [ ] 装饰物按层不同

## H. L9终极Boss(6项)

- [ ] Boss显示为星形(非圆形)
- [ ] Boss尺寸明显大于其他层
- [ ] 有王座底座(4根柱子)
- [ ] 有4颗不同颜色宝石
- [ ] 有三层能量光环(金/橙/红)
- [ ] 激活时有粒子喷射

## I. 交互反馈(5项)

- [ ] 悬停格子有发光效果
- [ ] 选中格子有金色边框
- [ ] 到达格子有绿色扩散
- [ ] 阻塞格子有红色X
- [ ] 可点击区域cursor=pointer

## J. 性能(5项)

- [ ] L1渲染<100ms
- [ ] L6渲染<200ms
- [ ] 转场动画流畅(60fps)
- [ ] 无明显内存泄漏
- [ ] 无控制台错误

## 总计: 75项

完成度: ___/75 = ___%
```

---

## 验收标准

- [ ] 集成测试全部通过(10+项)
- [ ] 形状差异化验证测试全部通过
- [ ] 性能测试达标(L1<100ms, L6<200ms, 机制<5ms)
- [ ] 手动验证清单完成度≥80%(60/75项)
- [ ] 无内存泄漏(9层切换后GC正常)
- [ ] 无TypeScript编译错误
- [ ] 无控制台运行时错误
- [ ] 总体测试覆盖率≥85%
