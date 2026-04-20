# 第十一轮核心任务 — 分地图效果落地与设想差距补全

## 🔴 紧急背景

**当前现状**: 第十轮虽然完成了GourdShapeFactory(9种形状变体)和PerLayerTopologyGenerator(9层差异化拓扑)，但**玩家完全看不到效果**——GourdMapRenderer仍使用第九轮的旧数据，9层地图看起来一模一样。

**与原始设想的差距**:
1. 原始设想要求每层有独特的空间形态（L2宽底网络、L6六角蜂窝、L8不对称坍缩等）→ 数据已生成但未渲染
2. 原始设想要求6种Zone效果在游戏中执行（W-骰子-1、N+2算力、I倒置、P跳过、S骰子+1、D扣资源）→ 目前仅有zoneId标记，无实际效果
3. 原始设想要求9种机制有实际游戏规则 → 目前仅有可视化装饰，无逻辑执行
4. 原始设想要求Boss格有视觉冲击力 → L9 Boss终极视觉（星形+王座+三层光环）未完成

## 🎯 本轮唯一目标

**让第十轮的所有设计真正在屏幕上生效**，玩家切换到不同层时能明显感受到形状、拓扑、机制、效果的差异。

---

## 具体任务（按优先级排序）

### Task 1: ★★★ P0 — 渲染管线打通（地图效果落地）

**修改文件**: `src/tower-mode/components/GourdMapRenderer/index.tsx`

**问题**: GourdMapRenderer接收外部传入的`topology` prop，该prop来自第九轮的静态visualData。第十轮的GourdShapeFactory和PerLayerTopologyGenerator生成的数据从未被使用。

**解决方案**:

```typescript
// 在 GourdMapRenderer 的父组件或组件内部，使用第十轮的数据源替代第九轮

import { GourdShapeFactory } from '../../geometry/GourdShapeFactory';
import { PerLayerTopologyGenerator } from '../../geometry/PerLayerTopologyGenerator';
import type { LayerShapeConfig } from '../../types/gourdShapeVariants.types';

/**
 * 核心修改: 将第九轮的视觉数据转换为渲染器可用的拓扑格式
 */
function buildLayerTopologyForRenderer(layerNumber: number) {
  // 1. 获取形状配置
  const shapeConfig = GourdShapeFactory.generate({
    layerNumber,
    mechanicType: '',
    themeName: '',
    difficulty: layerNumber,
  });

  // 2. 生成拓扑
  const topology = PerLayerTopologyGenerator.generate(layerNumber, shapeConfig);

  // 3. 转换为GourdMapRenderer期望的格式
  // GourdMapRenderer需要:
  // - cellPositions: Record<string, {x, y}>
  // - connections: Array<{from, to, type}>
  // - upperCircle/connector/lowerCircle 的区域配置
  // - cellIds, visualConfig 等

  const cellPositions: Record<string, { x: number; y: number }> = {};
  const cellTypes: Record<string, string> = {};
  const cellZones: Record<string, string> = {};

  for (const cell of topology.cells) {
    cellPositions[cell.id] = cell.position;
    cellTypes[cell.id] = cell.type;
    cellZones[cell.id] = cell.zoneId ?? '';
  }

  // 按region分组格子
  const upperCellIds = topology.cells.filter(c => c.region === 'UPPER_CIRCLE').map(c => c.id);
  const connectorCellIds = topology.cells.filter(c => c.region === 'CONNECTOR').map(c => c.id);
  const lowerCellIds = topology.cells.filter(c => c.region === 'LOWER_CIRCLE').map(c => c.id);

  return {
    id: `layer-${layerNumber}`,
    layerNumber,
    cellIds: topology.cells.map(c => c.id),
    cellPositions,
    cellTypes,
    cellZones,
    connections: topology.connections.map(c => ({
      from: c.from,
      to: c.to,
      type: c.type,
      visualStyle: c.visualStyle,
    })),
    upperCircle: {
      cellIds: upperCellIds,
      center: shapeConfig.upperCircle.center,
      radius: shapeConfig.upperCircle.radius,
      radiusX: shapeConfig.upperCircle.radius,
      radiusY: shapeConfig.upperCircle.radius * (shapeConfig.upperCircle.scaleY / shapeConfig.upperCircle.scaleX),
    },
    connector: {
      cellIds: connectorCellIds,
      width: shapeConfig.connector.width,
      narrowPointY: shapeConfig.upperCircle.center.y + 15,
      widthAtNarrowest: shapeConfig.connector.width / 2,
    },
    lowerCircle: {
      cellIds: lowerCellIds,
      center: shapeConfig.lowerCircle.center,
      radiusX: shapeConfig.lowerCircle.radiusX,
      radiusY: shapeConfig.lowerCircle.radiusY,
    },
    // 新增: 形状配置(用于边框/背景渲染)
    shapeConfig,
    // 新增: 机制类型(用于MechanicVisualizer)
    mechanicType: getMechanicType(layerNumber),
    // 保留: 视觉配置(从第九轮visualData迁移或使用默认值)
    visualConfig: getLayerVisualConfig(layerNumber),
    startCellId: topology.startCellId,
    bossCellId: topology.bossCellId,
  };
}

function getMechanicType(layerNumber: number): string {
  const map: Record<number, string> = {
    1: 'acceleration', 2: 'jump', 3: 'sequence', 4: 'event',
    5: 'blockade', 6: 'teleport', 7: 'drift', 8: 'collapse', 9: 'protocol',
  };
  return map[layerNumber] ?? '';
}

function getLayerVisualConfig(layerNumber: number): any {
  // 返回该层的视觉配置(背景色、格子样式、装饰物等)
  // 可以从第九轮visualData中提取，或使用ShapeFactory的visualModifiers
  return {
    background: getLayerBackground(layerNumber),
    cellVisualStyles: getDefaultCellStyles(),
    decorations: getLayerDecorations(layerNumber),
  };
}
```

**形状配置如何影响渲染**:

```typescript
// 在GourdMapRenderer中使用shapeConfig渲染差异化的形状:

// 1. 边框样式(根据outlineStyle):
const outlineStyle = shapeConfig.visualModifiers.outlineStyle;
// 'solid' → 实线
// 'dashed' → 虚线
// 'dotted' → 点线
// 'glow' → 发光(多层stroke)
// 'crack' → 裂纹(不规则折线)

// 2. 内网格(根据innerGrid):
const grid = shapeConfig.visualModifiers.innerGrid;
// 'hex' → 六角网格(L6)
// 'square' → 方格(L2/L4/L5)
// 'radial' → 辐射网格(L3/L9)
// 'triangular' → 三角网格(L8)

// 3. 背景纹理(根据bgTexture):
const texture = shapeConfig.visualModifiers.bgTexture;
// 'circuit' → 电路纹理(L2)
// 'cloud' → 云朵纹理(L7)
// 'quantum' → 量子纹理(L8)
// 'dataflow' → 数据流纹理(L5)

// 4. 变形(根据globalTransform):
const transform = shapeConfig.globalTransform;
// scale → 整体缩放(L9=1.08最大)
// skewX/skewY → 倾斜(L7/L8)
```

**验收标准**:
- [ ] 切换到L2能看到明显更"宽"的下半部分
- [ ] 切换到L6能看到明显"扁平"的形状
- [ ] 切换到L8能看到上下圆心错位
- [ ] 切换到L9能看到更大的整体尺寸
- [ ] 每层的边框样式不同
- [ ] L6有六角内网格可见
- [ ] 每层的格子数量和布局与预期一致(L6=37格, L2=34格等)

---

### Task 2: ★★☆ P0 — Zone效果执行（原始设想要求）

**新建文件**: `src/tower-mode/engine/ZoneEffectResolver.ts`

**问题**: 原始设想（文件一）明确要求6种Zone有实际效果，但当前仅标记zoneId，游戏中不生效。

**Zone效果定义**:

| Zone | 效果 | 实现难度 |
|------|------|---------|
| **W(虚弱)** | 进入该区域的格子时，下次掷骰-1 | 简单 |
| **N(知识)** | 进入时获得随机书籍，算力+2 | 简单 |
| **I(反转)** | 地图上下倒置，移动方向反转 | 中等 |
| **P(跳过)** | 进入后跳过下回合 | 简单 |
| **S(加速)** | 进入时下次掷骰+1 | 简单 |
| **D(危险)** | 进入时随机损失3-8技术值 | 简单 |

**实现方案**:

```typescript
// 在TowerGameEngine中，当玩家到达格子时检查zone效果

interface ZoneEffect {
  type: 'dice_penalty' | 'dice_bonus' | 'resource_loss' | 'skip_turn' | 'book_acquired' | 'map_inverted';
  value: number;
  message: string;
  duration: 'instant' | 'next_roll' | 'while_in_zone' | 'next_turn';
}

function resolveZoneEffect(zoneId: string, cellType: string): ZoneEffect | null {
  switch (zoneId?.toUpperCase()) {
    case 'W':
      return {
        type: 'dice_penalty',
        value: -1,
        message: '虚弱区域！下次掷骰-1',
        duration: 'next_roll',
      };
    case 'N':
      return {
        type: 'book_acquired',
        value: 2, // 算力+2
        message: '知识区域！获得随机书籍，算力+2',
        duration: 'instant',
      };
    case 'I':
      return {
        type: 'map_inverted',
        value: 0,
        message: '反转区域！地图上下倒置',
        duration: 'while_in_zone',
      };
    case 'P':
      return {
        type: 'skip_turn',
        value: 1,
        message: '跳过区域！下回合将被跳过',
        duration: 'next_turn',
      };
    case 'S':
      return {
        type: 'dice_bonus',
        value: 1,
        message: '加速区域！下次掷骰+1',
        duration: 'next_roll',
      };
    case 'D':
      const loss = 3 + Math.floor(Math.random() * 6); // 3-8
      return {
        type: 'resource_loss',
        value: loss,
        message: `危险区域！随机损失${loss}技术值`,
        duration: 'instant',
      };
    default:
      return null;
  }
}

// 在TowerGameEngine中应用效果:
class TowerGameEngine {
  private pendingDiceModifier: number = 0;
  private skipNextTurn: boolean = false;
  private mapInverted: boolean = false;

  // 当玩家到达格子时调用
  private onCellArrived(cellId: string) {
    const zoneId = this.getCellZone(cellId);
    const effect = resolveZoneEffect(zoneId, this.getCellType(cellId));

    if (!effect) return;

    switch (effect.type) {
      case 'dice_penalty':
      case 'dice_bonus':
        this.pendingDiceModifier += effect.value;
        break;
      case 'resource_loss':
        this.resources.tech = Math.max(0, this.resources.tech - effect.value);
        break;
      case 'skip_turn':
        this.skipNextTurn = true;
        break;
      case 'book_acquired':
        this.resources.compute += effect.value;
        break;
      case 'map_inverted':
        this.mapInverted = true;
        break;
    }

    // 发送事件通知UI
    this.eventBus.emit('zone:effect_applied', {
      zoneId,
      effect,
      message: effect.message,
    });
  }

  // 掷骰时应用modifier
  rollDice(): DiceResult {
    const base = Math.floor(Math.random() * 6) + 1;
    const modifier = this.pendingDiceModifier;
    this.pendingDiceModifier = 0; // 消耗modifier
    return { value: Math.max(1, Math.min(6, base + modifier)), modifier, base };
  }
}
```

**验收标准**:
- [ ] 进入W区后掷骰子确实-1
- [ ] 进入N区后技术值+2且显示获得书籍
- [ ] 进入S区后掷骰子确实+1
- [ ] 进入D区后确实损失技术值
- [ ] 进入P区后下回合自动跳过
- [ ] 进入I区后地图视觉倒置（CSS transform: scaleY(-1)）

---

### Task 3: ★★☆ P0 — 9种机制效果执行（原始设想要求）

**新建文件**: `src/tower-mode/engine/MechanicEffectEngine.ts`

**问题**: 原始设想（文件二）要求9种机制有实际游戏规则，当前仅有可视化。

**机制效果定义**:

| 层级 | 机制 | 实际效果 | 验证方法 |
|------|------|---------|---------|
| L1 | 扩散加速 | 连续通过3个W区→移动步数+1 | wStreakCount计数器 |
| L2 | 跨环跳跃 | 机会格掷骰≥4→可跳至内环任意格 | 掷骰判定+跳跃路径 |
| L3 | 层层解锁 | 必须按外→中→内顺序通过 | 顺序检查+违规遣返 |
| L4 | 街区事件 | 进入新街区首格触发事件 | 街区访问记录 |
| L5 | 流水线阻塞 | 同分支停留>2回合→扣3-8技术值 | 停留计数 |
| L6 | 信号切换 | 移动至相邻蜂窝20%概率迷路传送 | 随机判定+传送 |
| L7 | 云端漂移 | 每回合开始所有非固定格坐标±1偏移 | 坐标重计算 |
| L8 | 观测坍缩 | 进入机会格随机锁定/解锁隐藏路径 | 路径状态切换 |
| L9 | 殿堂礼仪 | 进入CORE必须按顺序踩格，否则遣返 | 顺序检查+遣返 |

**核心实现(以L1/L3/L5/L9为例)**:

```typescript
class MechanicEffectEngine {
  // L1: 扩散加速
  private wStreakCount: number = 0;

  onCellArrivedL1(cellId: string): MechanicResult {
    const zoneId = this.getCellZone(cellId);
    if (zoneId === 'W') {
      this.wStreakCount++;
      if (this.wStreakCount >= 3) {
        this.wStreakCount = 0;
        return { type: 'bonus_steps', amount: 1 };
      }
      return { type: 'streak_progress', current: this.wStreakCount };
    } else {
      this.wStreakCount = 0; // 非W区重置
      return { type: 'streak_reset' };
    }
  }

  // L3: 层层解锁
  private requiredRing: 'outer' | 'mid' | 'core' = 'outer';

  onCellArrivedL3(cellId: string): MechanicResult {
    const cellZone = this.getCellZone(cellId);
    if (cellZone === this.requiredRing) {
      // 按顺序通过，推进到下一环
      this.requiredRing = this.nextRing(this.requiredRing);
      return { type: 'sequence_progress', ring: cellZone };
    } else if (this.isInnerRing(cellZone, this.requiredRing)) {
      // 试图跳过当前环→遣返到外环入口
      return { type: 'sequence_violation', returnTo: 'O0' };
    }
    return { type: 'none' };
  }

  // L5: 流水线阻塞
  private branchStayCounts: Map<string, number> = new Map();

  onCellArrivedL5(cellId: string): MechanicResult {
    const branch = this.getCellBranch(cellId);
    if (!branch) return { type: 'none' };
    const count = (this.branchStayCounts.get(branch) ?? 0) + 1;
    this.branchStayCounts.set(branch, count);
    if (count > 2) {
      const penalty = 3 + Math.floor(Math.random() * 6);
      this.branchStayCounts.set(branch, 0);
      return { type: 'blockade_penalty', amount: penalty };
    }
    return { type: 'blockade_warning', turnsLeft: 2 - count };
  }

  // L9: 殿堂礼仪
  private protocolStep: number = 0;

  onCellArrivedL9(cellId: string): MechanicResult {
    const zoneId = this.getCellZone(cellId);
    if (zoneId === 'CORE') {
      const expectedCell = this.getExpectedProtocolCell(this.protocolStep);
      if (cellId === expectedCell) {
        this.protocolStep++;
        return { type: 'protocol_progress', step: this.protocolStep };
      } else {
        return { type: 'protocol_violation', returnTo: 'G0' };
      }
    }
    return { type: 'none' };
  }

  // 换层时重置状态
  onLayerChange(layerNumber: number) {
    this.wStreakCount = 0;
    this.requiredRing = 'outer';
    this.branchStayCounts.clear();
    this.protocolStep = 0;
    // ... 其他机制状态重置
  }
}
```

**验收标准**:
- [ ] L1连续3次到达W区格子后，下一次移动确实多走1步
- [ ] L3从外环直接进入中环被送回外环入口
- [ ] L5在同分支停留3次到达后确实扣技术值
- [ ] L9未按CORE_0→CORE_1→CORE_2顺序走被送回G0
- [ ] L6移动时约20%概率被传送到附近格子
- [ ] L8进入机会格时路径确实有锁定/解锁变化
- [ ] L7每回合格子坐标有可见偏移
- [ ] L9 CORE区域有强制顺序检查

---

### Task 4: ★★☆ P1 — L9终极Boss视觉

**修改文件**: `src/tower-mode/components/GourdMapRenderer/CellNode.tsx` 或新建 `UltimateBossRenderer.tsx`

**问题**: L9 Boss需要远超其他层的视觉冲击力（原始设想：大2.5倍+三层光环），当前实现较简单。

**Boss视觉要求**:

```typescript
// L9 Boss格的特殊渲染配置:
const L9_BOSS_CONFIG = {
  // 星形而非圆形
  shape: 'star',
  pointCount: 6,
  innerRadius: 0.5,  // 相对于外半径
  outerRadius: 1.0,

  // 尺寸
  sizeMultiplier: 3.0,  // 从默认的2.5提升到3.0

  // 颜色
  fillColor: '#1a0a2e',
  strokeColor: '#FFD700',
  strokeWidth: 4,

  // 王座底座
  throne: {
    baseWidth: 18,
    baseHeight: 6,
    pillars: [
      { x: -9, gemColor: '#FF0000' },
      { x: -3, gemColor: '#00FF00' },
      { x: 3, gemColor: '#0000FF' },
      { x: 9, gemColor: '#FFFF00' },
    ],
  },

  // 三层能量光环
  auraLayers: [
    { radius: 12, color: '#FFD70044', dashArray: '' },
    { radius: 16, color: '#FF660033', dashArray: '4 4' },
    { radius: 22, color: '#FF000022', dashArray: '2 6' },
  ],

  // 动画
  animations: ['gm-boss-emerge', 'gm-boss-pulse-ultimate'],
};
```

**渲染实现**:

```tsx
function UltimateBossRenderer({ position, isActive }: { position: { x: number; y: number }; isActive?: boolean }) {
  const size = 30; // 3倍于普通格子(10)

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {/* 三层光环 */}
      {[
        { r: size + 22, color: '#ff000022', dash: '2 6', dur: '2s' },
        { r: size + 16, color: '#ff660033', dash: '4 4', dur: '1.5s' },
        { r: size + 12, color: '#FFD70044', dash: '', dur: '1.2s' },
      ].map((aura, i) => (
        <circle key={i} r={aura.r} fill="none" stroke={aura.color} strokeWidth={3 - i}
                strokeDasharray={aura.dash}>
          <animate attributeName="r" values={`${aura.r-2};${aura.r+2};${aura.r-2}`}
                   dur={aura.dur} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3"
                   dur={aura.dur} repeatCount="indefinite" />
        </circle>
      ))}

      {/* 王座底座 */}
      <rect x={-size * 0.6} y={size * 0.85} width={size * 1.2} height={size * 0.2}
            rx="2" fill="#333" stroke="#FFD700" strokeWidth="1" opacity="0.7" />

      {/* 四根柱子+宝石 */}
      {[-0.5, -0.17, 0.17, 0.5].map((xOff, i) => (
        <g key={`pillar-${i}`}>
          <rect x={size * xOff - 2} y={size * 0.85 - size * (0.6 + (i % 2 === 1 ? 0.1 : 0))}
                width="4" height={size * (0.6 + (i % 2 === 1 ? 0.1 : 0))}
                fill="#555" stroke="#FFD700" strokeWidth="0.8" opacity="0.6" />
          <circle cx={size * xOff} cy={size * 0.85 - size * (0.6 + (i % 2 === 1 ? 0.1 : 0))}
                  r="3" fill={['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][i]} opacity="0.8">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s"
                     begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* 星形主体 */}
      <polygon
        points={generateStarPoints(0, 0, size * 0.5, size * 0.9, 6)}
        fill="#1a0a2e"
        stroke={isActive ? '#fff' : '#FFD700'}
        strokeWidth={isActive ? 5 : 4}>
        {isActive && (
          <animate attributeName="stroke-width" values="4;6;4" dur="0.8s" repeatCount="indefinite" />
        )}
      </polygon>

      {/* Boss图标 */}
      <text y="5" textAnchor="middle" fontSize={size * 0.5} fill="#FFD700">💀</text>

      {/* 粒子效果(激活时) */}
      {isActive && <BossParticleBurst count={12} color="#FFD700" radius={size} />}
    </g>
  );
}
```

**验收标准**:
- [ ] L9 Boss显示为星形而非圆形
- [ ] Boss尺寸明显大于其他层Boss(对比可见)
- [ ] 有王座底座和4根柱子
- [ ] 每根柱子顶部有不同颜色的宝石(红绿蓝黄)
- [ ] 有三层能量光环(金/橙/红)同步脉动
- [ ] Boss被选中时有粒子喷射效果

---

### Task 5: ★☆☆ P1 — 组件整合（游戏主入口）

**新建文件**: `src/tower-mode/components/TowerClimbView/TowerClimbView.tsx`

**问题**: 所有组件独立存在，未组装成完整游戏界面。

**整合方案**:

```tsx
import { useTowerGameController } from '../../controllers/useTowerGameController';
import { GameHUD } from '../GameHUD/GameHUD';
import { GourdMapRenderer } from '../GourdMapRenderer';
import { MechanicVisualizer } from '../GourdMapRenderer/MechanicVisualizer';
import { PathSelector } from '../PathSelector/PathSelector';
import { LayerTransitionFX } from '../GourdMapRenderer/LayerTransitionFX';

export function TowerClimbView({ initialLayer = 1 }: { initialLayer?: number }) {
  const { phase, techValue, gold, turnNumber, isRolling, rollDice, ... } = useTowerGameController();
  const [currentLayer, setCurrentLayer] = useState(initialLayer);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 使用第十轮数据源生成拓扑
  const topology = useMemo(
    () => buildLayerTopologyForRenderer(currentLayer),
    [currentLayer]
  );

  return (
    <div className="tower-climb-view">
      {/* 顶部HUD */}
      <GameHUD
        layerName={topology.layerTheme}
        turnNumber={turnNumber}
        techValue={techValue}
        gold={gold}
        phase={phase}
        onRollDice={rollDice}
        isRolling={isRolling}
        canRoll={phase === 'idle'}
      />

      {/* 中部地图 */}
      <div className="map-area">
        <GourdMapRenderer
          topology={topology}
          layerNumber={currentLayer}
          mechanicType={topology.mechanicType}
          // ... 其他props
        />

        {/* 机制可视化叠加层 */}
        <MechanicVisualizer
          mechanicType={topology.mechanicType}
          layerNumber={currentLayer}
        />

        {/* 层级转场 */}
        <LayerTransitionFX
          fromLayer={previousLayer}
          toLayer={currentLayer}
          isActive={isTransitioning}
          onComplete={() => setIsTransitioning(false)}
        />
      </div>

      {/* 底部路径选择 */}
      {phase === 'dice_result' && (
        <PathSelector
          availablePaths={availablePaths}
          onSelect={selectPath}
        />
      )}
    </div>
  );
}
```

**验收标准**:
- [ ] 打开爬塔模式能看到完整游戏界面
- [ ] 顶部HUD显示层名/回合/资源/Phase
- [ ] 中部地图显示当前层(形状正确)
- [ ] 机制可视化叠加在地图上
- [ ] 掷骰子后底部出现路径选择
- [ ] 切换层级时有转场动画

---

## 第十一轮改动总览

| 任务 | 优先级 | 对应差距 | 改动内容 | 验收标准 |
|------|--------|---------|---------|---------|
| **Task 1** | P0 | 地图形状未渲染 | 渲染管线打通，使用ShapeFactory+TopologyGenerator数据 | 9层形状明显不同 |
| **Task 2** | P0 | Zone效果未执行 | ZoneEffectResolver，6种Zone效果在游戏中生效 | W-1/S+1/N+2/D扣值等 |
| **Task 3** | P0 | 机制效果未执行 | MechanicEffectEngine，9种机制有实际规则 | L1加速/L3顺序/L5扣值等 |
| **Task 4** | P1 | L9 Boss不够震撼 | UltimateBossRenderer，星形+王座+三层光环 | Boss视觉冲击力强 |
| **Task 5** | P1 | 组件未组装 | TowerClimbView主视图，整合所有组件 | 完整可玩的游戏界面 |

## 与原始设想差距对照表

| 原始设想要求 | 当前状态 | 本轮解决 | 解决后状态 |
|------------|---------|---------|-----------|
| 每层独特形状 | 数据已生成但未渲染 | Task 1 | ✅ 9层形状明显不同 |
| W区骰子-1 | 仅zoneId标记 | Task 2 | ✅ 掷骰时-1生效 |
| N区+2算力 | 仅zoneId标记 | Task 2 | ✅ 获得书籍+算力+2 |
| S区骰子+1 | 仅zoneId标记 | Task 2 | ✅ 掷骰时+1生效 |
| D区扣资源 | 仅zoneId标记 | Task 2 | ✅ 随机损失3-8技术值 |
| L1连续W区+步数 | 仅有进度条 | Task 3 | ✅ 连续3次W区步数+1 |
| L3按顺序通过 | 仅有指示器 | Task 3 | ✅ 不按顺序被遣返 |
| L5停留扣值 | 仅有X标记 | Task 3 | ✅ 停留>2回合扣3-8技术值 |
| L9 CORE顺序 | 仅有金色路径 | Task 3 | ✅ 不按顺序被遣返 |
| Boss三层光环 | 基础实现 | Task 4 | ✅ 星形+王座+三层光环 |
| 完整游戏界面 | 组件分散 | Task 5 | ✅ 整合为完整游戏 |

## 执行建议

**执行顺序**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5

**原因**:
1. Task 1是基础——地图必须先渲染正确，其他效果才有意义
2. Task 2和Task 3是核心逻辑——让机制和Zone效果在游戏中生效
3. Task 4是视觉打磨——提升Boss战体验
4. Task 5是最终整合——将所有内容组装为可玩游戏

**预计工作量**: 每个Task约2-4小时，总计10-16小时。
