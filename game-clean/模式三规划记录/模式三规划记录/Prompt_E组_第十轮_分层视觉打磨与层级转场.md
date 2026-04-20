# E组第十轮 — 分层视觉终极打磨 + 层级专属转场

## 背景

A-D组解决了形状/拓扑/机制可视化/引擎对接的深度问题。E组负责**视觉体验的最后打磨**：

- Gap-P1-3: 层级主题氛围不够浓郁
- Gap-P1-4: 连接线样式缺少层级特色
- Gap-P2-1: 装饰物差异化不够明显
- Gap-P2-3: 层级切换过渡可以更华丽

## 具体任务

### Task E1: ★★☆ P1 — PerLayerPathStyle 分层路径渲染

**修改文件**: `src/tower-mode/components/GourdMapRenderer/PathLayer.tsx`

在第九轮PathLayer基础上，根据当前层layerNumber应用不同的路径视觉风格：

```typescript
// 在 PathLayer 中增加 layerNumber prop:
interface PathLayerPropsV10 extends PathLayerProps {
  layerNumber: number;
  mechanicType?: string;
}

// 路径风格配置(每层不同):
const LAYER_PATH_STYLES: Record<number, {
  mainColor: string;
  branchColor: string;
  curveTension: number;
  glowEffect?: boolean;
  dashPattern?: string;
  particleColor?: string;
  specialRender?: string; // 'circuit' | 'conveyor' | 'street' | 'lightning' | 'dataflow'
}> = {
  1: { mainColor: '#ff8800', branchColor: '#888', curveTension: 0.4 },
  2: { mainColor: '#4488ff', branchColor: '#2266dd', curveTension: 0.3, specialRender: 'circuit', particleColor: '#00ffff' },  // 网络光缆
  3: { mainColor: '#FFD700', branchColor: '#cc9900', curveTension: 0.35, glowEffect: true },  // 金色数据流
  4: { mainColor: '#FF9800', branchColor: '#cc7700', curveTension: 0.25, specialRender: 'street' },  // 街道
  5: { mainColor: '#4CAF50', branchColor: '#388E3C', curveTension: 0.5, specialRender: 'conveyor' },  // 传送带
  6: { mainColor: '#00BCD4', branchColor: '#0097A7', curveTension: 0.35, specialRender: 'lightning', particleColor: '#e040fb' },  // 电信号
  7: { mainColor: '#9C27B0', branchColor: '#7B1FA2', curveTension: 0.45, dashPattern: '8 6' },  // 云端飘渺
  8: { mainColor: '#9C27B0', branchColor: '#E91E63', curveTension: 0.2, dashPattern: '4 8' },  // 不稳定坍缩
  9: { mainColor: '#FFD700', branchColor: '#FF6F00', curveTension: 0.3, glowEffect: true, particleColor: '#fff' },  // 宫殿金光
};

// 渲染时使用:
const pathStyle = LAYER_PATH_STYLES[layerNumber] ?? LAYER_PATH_STYLES[1];

// 特殊路径渲染:
if (pathStyle.specialRender === 'circuit') {
  // L2: 路径上有"数据包"粒子流动
  return <CircuitPath d={pathD} color={pathStyle.mainColor} />;
}
if (pathStyle.specialRender === 'conveyor') {
  // L5: 路径显示传送带滚轮动画
  return <ConveyorPath d={pathD} color={pathStyle.mainColor} />;
}
```

### Task E2: ★★☆ P1 — LayerTransitionFX 层级专属转场特效

**新建文件**: `src/tower-mode/components/GourdMapRenderer/LayerTransitionFX.tsx`

```tsx
/**
 * LayerTransitionFX — 层级切换转场动画
 * 
 * 每层有独特的切换效果:
 * - L1→L2: 数据流穿梭（蓝色粒子从上到下）
 * - L2→L3: 金色旋转门
 * - L3→L4: 城市天际线升起
 * - L4→L5: 工厂齿轮转动
 * - L5→L6: 信号干扰闪烁
 * - L6→L7: 云朵飘过遮罩
 * - L7→L8: 量子隧穿扭曲
 * - L8→L9: 能量汇聚爆发
 */

export function LayerTransitionFX({
  fromLayer, toLayer, isActive, onComplete,
}: {
  fromLayer: number; toLayer: number;
  isActive: boolean; onComplete: () => void;
}) {
  if (!isActive) return null;

  const transitionId = `${fromLayer}-${toLayer}`;
  
  const transitions: Record<string, React.ReactNode> = {
    '1-2': <DataFlowTransition />,
    '2-3': <GoldenGateTransition />,
    '3-4': <SkylineRiseTransition />,
    '4-5': <GearSpinTransition />,
    '5-6': <SignalGlitchTransition />,
    '6-7': <CloudSweepTransition />,
    '7-8': <QuantumTunnelTransition />,
    '8-9': <EnergyBurstTransition />,
  };

  const effect = transitions[transitionId] ?? <DefaultTransition />;

  return (
    <div className="layer-transition-fx" onAnimationEnd={onComplete}>
      {effect}
      <div className="transition-layer-name">{getLayerName(toLayer)}</div>
    </div>
  );
}

// 示例: L8→L9 能量汇聚爆发
function EnergyBurstTransition() {
  return (
    <svg viewBox="0 0 100 100" className="transition-svg">
      {/* 中心能量球 */}
      <circle cx="50" cy="50" r="2" fill="#FFD700">
        <animate attributeName="r" values="2;40;2" dur="1s" fill="freeze" />
        <animate attributeName="opacity" values="1;0;1" dur="1s" fill="freeze" />
      </circle>
      {/* 冲击波 */}
      {[1,2,3].map(i => (
        <circle key={i} cx="50" cy="50" r="0" fill="none" stroke="#FFD700" strokeWidth={1-i*0.2}>
          <animate attributeName="r" from="0" to={20+i*15} dur="0.8s" begin={`${i*0.15}s`} fill="freeze" />
          <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" begin={`${i*0.15}s`} fill="freeze" />
        </circle>
      ))}
      {/* 能量射线 */}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`ray-${i}`}
              x1="50" y1="50"
              x2={50 + 45 * Math.cos(i * Math.PI / 6)}
              y2={50 + 45 * Math.sin(i * Math.PI / 6)}
              stroke="#FFD700" strokeWidth="0.5" opacity="0"
              strokeLinecap="round">
          <animate attributeName="x2" from="50" to={50 + 45 * Math.cos(i * Math.PI / 6)} dur="0.5s" begin="0.3s" fill="freeze" />
          <animate attributeName="y2" from="50" to={50 + 45 * Math.sin(i * Math.PI / 6)} dur="0.5s" begin="0.3s" fill="freeze" />
          <animate attributeName="opacity" from="0.9" to="0" dur="0.4s" begin="0.3s" fill="freeze" />
        </line>
      ))}
    </svg>
  );
}
```

### Task E3: ★☆☆ P2 — PerLayerDecorationEnhancer 装饰物增强

**修改文件**: `src/tower-mode/components/GourdMapRenderer/DecorationLayer.tsx`

让每层的装饰物不仅类型/位置不同，**渲染方式也不同**：

| 层级 | 装饰物增强 |
|------|-----------|
| L1 | 行星+水晶(标准) — 保持第九轮 |
| L2 | **网络节点**(发光圆点)+**光缆线条**(连接节点的细线) |
| L3 | **金环**(旋转同心圆环)+**锁图标**(安全等级提示) |
| L4 | **建筑剪影**(矩形轮廓)+**霓虹招牌**(闪烁文字) |
| L5 | **传送带**(滚动虚线段)+**齿轮**(旋转圆) |
| L6 | **信号塔**(三角形+脉冲波纹)+**迷路标记**(问号浮动) |
| L7 | **云朵**(不规则椭圆+缓慢漂移)+**闪电**(锯齿线) |
| L8 | **量子粒子**(随机出现消失的小点)+**裂纹**(静态折线) |
| L9 | **王座柱**(竖直矩形+金色光柱)+**能量核心**(中心大发光球) |

### Task E4: ★☆☆ P2 — L9 Ultimate Boss 终极视觉升级

针对 **Gap-P1-2**: L9 Boss格需要远超其他层的视觉冲击力：

```typescript
// L9 visualData 中 boss 的特殊配置:
boss: {
  shape: 'star',           // 星形而非圆形！
  sizeMultiplier: 3.0,       // 从2.5提升到3.0
  fillColor: '#1a0a2e',
  strokeColor: '#FFD700',   // 金色边框
  strokeWidth: 4,
  animationClass: 'gm-boss-emerge gm-boss-pulse-ultimate',
  // 新增: Boss底座
  hasThrone: true,
  throneStyle: {
    baseWidth: 18,
    baseHeight: 6,
    pillarCount: 4,
    pillarHeight: 8,
    gemColors: ['#FF0000','#00FF00','#0000FF','#FFFF00'],
  },
  // 新增: 能量光环
  auraLayers: [
    { radius: 12, color: '#FFD70044', dashArray: '' },
    { radius: 16, color: '#FF660033', dashArray: '4 4' },
    { radius: 22, color: '#FF000022', dashArray: '2 6' },
  ],
}
```

配套CSS新增 `.gm-boss-pulse-ultimate` 动画：三层同步脉动 + 粒子喷射。

## 第十轮E组改动总览

| 任务 | 对应Gap | 改动内容 |
|------|---------|---------|
| **E1** | Gap-P1-4 | PerLayerPathStyle — 9种路径风格(电路/传送带/街道/电信号等) |
| **E2** | Gap-P2-3 | LayerTransitionFX — 8种层级专属转场(数据流/金门/天际线/齿轮/干扰/云朵/量子/能量) |
| **E3** | Gap-P2-1 | PerLayerDecorationEnhancer — 每层装饰物独特渲染方式 |
| **E4** | Gap-P1-2 | L9 Ultimate Boss — size×3.0 + 王座底座 + 四柱 + 三层能量光环 |

## 验收标准

1. ✅ 切换L1→L2时有蓝色数据流粒子穿梭转场(约1秒)
2. ✅ 切换L8→L9时有金色能量爆发转场(冲击波+射线)
3. ✅ L2路径显示为蓝色"光缆"样式(可能有额外粒子)
4. ✅ L5路径显示为绿色"传送带"样式(滚动虚线)
5. ✅ L9 Boss格明显大于其他层Boss(对比可见size差异)
6. ✅ L9 Boss周围有王座底座(4根柱子+宝石)
7. ✅ L9 Boss有三层能量光环(金/橙/红)
