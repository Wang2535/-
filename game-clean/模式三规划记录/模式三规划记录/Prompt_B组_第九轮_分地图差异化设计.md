# B组第九轮 — 9层分地图数据精调 + 差异化视觉设计

## 背景

第八轮B组建立了完整的9层visualData框架，但存在以下需要修正的问题：

1. **P0差距**: quadrantLabels fontSizeRatio=0.22 需提升到 **0.36**
2. **P0差距**: border tileSize=12 太大（方格稀疏），需改为 **7**
3. **P1差距**: zoneBackgrounds fillColor opacity=0.12 太淡，需提升到 **0.20~0.25**
4. **P1差距**: 各层(L1-L9)视觉差异化不够——目前只有背景色和少量装饰不同
5. **新增需求**: 每层需要有**独特的区域配置**（W/N/I/P/S/D在各层的含义和位置可能不同）

**第九轮B组的核心使命：让每一层都成为一个**视觉独特、主题鲜明、机制完整**的"分地图"。**

> **边界说明**:
> - B组只负责**数据文件**（L1~L9_visualData.ts + 新增的 layerMechanics 数据）
> - B组消费 A 组的 LAYER_THEMES（主题配色）
> - B组消费 A 组的 LayerSpecialMechanic 类型
> - B组不修改渲染逻辑

## 具体任务

### Task B1: 全局参数统一修正（所有9层）

对 **每一层** 的 visualData 执行以下修改：

#### 1.1 quadrantLabels 修正

```typescript
// 所有9层统一修改：
quadrantLabels: [
  {
    quadrant: 'W',
    label: 'W',
    fontSizeRatio: 0.36,        // ★ 0.22 → 0.36（+63%！）
    color: '#FF6B6B',          // 保持各层特色色
    fontWeight: '900',
    fontFamily: '"Arial Black", Impact, sans-serif',
    strokeColor: '#FFFFFF',
    strokeWidth: 1.0,          // ★ 0.8 → 1.0
    shadowColor: '#000000',
    shadowBlur: 4,             // ★ 3 → 4
    shadowOffsetX: 1.5,
    shadowOffsetY: 1.5,
    enableShadow: true,
  },
  // N/I/P 同理...
]
```

**效果**: 在 viewbox 100x100 中，下圆半径约35 → fontSize = 35×2×0.36 = **25.2**
这已经接近海幸参考图中字母占据象限30-40%面积的目标！

#### 1.2 border 修正

```typescript
// 所有9层统一修改：
border: {
  enabled: true,
  mode: 'checkerboard-fill',
  borderWidth: 10,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 7,                // ★ 12 → 7（方格密度翻倍！）
  innerPadding: 3,            // ★ 2 → 3
  cornerRadius: 2,            // ★ 3 → 2
  opacity: 0.95,              // ★ 0.85 → 0.95（更实心）
  glowColor: 'rgba(255,170,0,0.5)', // ★ 0.4 → 0.5
}
```

#### 1.3 zoneBackgrounds opacity 提升

```typescript
// 所有层统一修改 fillColor opacity:
zoneBackgrounds: {
  W: { fillColor: 'rgba(255,107,107,0.22)', ... },   // ★ 0.12 → 0.22
  N: { fillColor: 'rgba(78,205,196,0.22)', ... },   // ★ 0.12 → 0.22
  I: { fillColor: 'rgba(155,89,182,0.20)', ... },   // ★ 0.12 → 0.20
  P: { fillColor: 'rgba(243,156,18,0.22)', ... },    // ★ 0.12 → 0.22
  D: { fillColor: 'rgba(231,76,60,0.18)', ... },     // 危险区稍淡
  S: { fillColor: 'rgba(46,204,113,0.18)', ... },     // 加速区稍淡
}
```

### Task B2: L1 分地图完整重写 — 病毒实验室主题

**重写**: `src/tower-mode/data/layers/L1_visualData.ts`

L1 是玩家的第一张地图，需要做到**视觉震撼+机制简单易懂**：

```typescript
export const L1_VISUAL_DATA: Record<string, any> = {

  // === 边框：橙黄白密集棋盘格 ===
  border: { /* Task B1.2 的修正值 */ },

  // === W/N/I/P：超大粗体字 ===
  quadrantLabels: [ /* Task B1.1 的修正值 */ ],

  // === 格子样式 ===
  cellVisualStyles: {
    start: { /* 起点：绿色发光传送门 */ },
    battle: { /* 战斗格：六角形红色边框 */ },
    boss: {
      sizeMultiplier: 2.5,
      animationClass: 'gm-boss-emerge',
      glowEffect: { color: '#ff3333', size: 32, pulse: true },
      // ★ L1 Boss特殊：周围有危险区域标记
      dangerRadius: 0.08,       // 新增！Boss影响范围
      dangerAnimClass: 'gm-zone-d-enter', // 影响范围内有红闪
    },
    // ... 其他格子类型
  },

  // === 区域背景（L1特有配置）===
  // L1的区域含义：
  // 上环 = N（知识区）：安全学习区
  // 下环左半 = W（病毒扩散区）：踩中会扣血/减益
  // 下环右半 = S（安全加速区）：连续3个W后触发加速
  // 核心圆心 = D（Boss危险区）：靠近Boss时持续掉血
  zoneBackgrounds: {
    N: { fillColor: 'rgba(78,205,196,0.22)', shape: 'sector', centerPosition: { x: 0.50, y: 0.18 }, enterAnimClass: 'gm-zone-n-enter' },
    W: { fillColor: 'rgba(255,107,107,0.25)', shape: 'sector', centerPosition: { x: 0.32, y: 0.55 }, enterAnimClass: 'gm-zone-w-enter' },
    S: { fillColor: 'rgba(46,204,113,0.20)', shape: 'sector', centerPosition: { x: 0.68, y: 0.55 }, enterAnimClass: 'gm-zone-s-enter' },
    D: { fillColor: 'rgba(231,76,60,0.15)', shape: 'circle', centerPosition: { x: 0.50, y: 0.68 }, enterAnimClass: 'gm-zone-d-enter' },
  },

  // === 背景装饰（L1病毒实验室主题）===
  background: {
    primary: '#0a1a0f', secondary: '#0d2015',
    texture: 'noise+bio-pattern',  // 噪点+生物纹理叠加
    decorations: [
      // ★ 上圆中央：大型病毒星球（核心装饰）
      { type: 'planet', position: { x: 0.50, y: 0.15 }, size: 0.10,
        color: '#44ff88', opacity: 0.40, animClass: 'gm-decor-float',
        detail: { rings: 3, ringColor: '#22aa44', particles: 8 } },
      // ★ 病毒粒子带（围绕上圆）
      { type: 'crystal', position: { x: 0.35, y: 0.08 }, size: 0.025, color: '#66ff88', animClass: 'gm-decor-float' },
      { type: 'crystal', position: { x: 0.65, y: 0.09 }, size: 0.030, color: '#55dd77', animClass: 'gm-decor-float' },
      { type: 'crystal', position: { x: 0.42, y: 0.23 }, size: 0.020, color: '#44cc66', animClass: 'gm-decor-float' },
      { type: 'crystal', position: { x: 0.58, y: 0.24 }, size: 0.022, color: '#44cc66', animClass: 'gm-decor-float' },
      // ★ 数据流线条（下圆两侧）
      { type: 'data-stream', position: { x: 0.12, y: 0.58 }, size: 0.07, opacity: 0.15, color: '#4488ff' },
      { type: 'data-stream', position: { x: 0.88, y: 0.56 }, size: 0.06, opacity: 0.12, color: '#4488ff' },
      // ★ 连接通道：微光节点
      { type: 'crystal', position: { x: 0.47, y: 0.33 }, size: 0.018, color: '#ffaa44', animClass: 'gm-decor-float' },
      { type: 'crystal', position: { x: 0.53, y: 0.34 }, size: 0.018, color: '#ffaa44', animClass: 'gm-decor-float' },
    ],
  },

  // === L1 特殊机制数据 ===
  layerMechanic: {
    type: 'acceleration' as const,
    name: '扩散加速',
    triggerCondition: '连续通过3个W区域格',
    effect: '移动步数+1（下次骰子投掷）',
    visualHint: '⚡ W区连击加速中... (0/3)',
    stateKey: 'wStreakCount',  // 追踪状态键名
    requiredCount: 3,
  },

  // === 连接线样式（L1主题：生物绿色调）===
  pathVisualStyles: {
    main: { strokeColor: '#44ff88', strokeWidth: 2.5, curveTension: 0.45, animated: true },
    branch: { strokeColor: '#228844', strokeWidth: 1.5, curveTension: 0.35, dashArray: '6,3' },
    // ...
  },
};
```

### Task B3: L2-L9 分地图差异化模板

每层必须与 L1 有**显著差异**。以下是每层的关键差异化要点：

#### L2 — 网络空间（跨环跳跃）

```
差异点:
├─ background: #0a0f1a（深蓝而非深绿）
├─ zone布局变化: 新增 I 区（反转区在下环左侧）
│   └─ I区效果: 进入后有概率交换手牌
├─ decorations: node cluster（节点簇）替代 virus planet
│   └─ 上圆中央是网络核心球（蓝色发光+环形连接线）
├─ 特殊机制: jump（跨环跳跃）
│   └─ 特定机会格标注 isJumpPoint: true
│   └─ 掷骰≥4时可跳到内环任意格
└─ pathVisualStyles: 主线用青蓝色 #4488ff
```

#### L3 — 数据金库（层层解锁）

```
差异点:
├─ background: #0f0a08（金棕色）
├─ zone布局: 三圈结构（外/中/内），必须按顺序前进
│   └─ 违反顺序触发 extraEnemy 事件
├─ decorations: vault-rings（保险库光环）+ shield（盾牌图标）
├─ 特殊机制: sequence（顺序解锁）
│   └─ 每个格子标注 circleLayer: 1|2|3
│   └─ 从外→中→内 必须依次经过
└─ pathVisualStyles: 主线用金色 #ffaa44
```

#### L4 — 城市街区（街区事件）

```
差异点:
├─ background: #0f0f14（灰蓝城市夜景）
├─ zone布局: 四个"街区"象限，每个街区有独立事件池
├─ decorations: building-blocks（建筑剪影）+ neon-signs（霓虹招牌）
│   └─ 下圆四个角落有小型建筑轮廓
├─ 特殊机制: event（街区事件）
│   └─ 进入每个新街区首格触发 districtEvent
│   └─ events: ['黑市交易', '情报贩卖', '系统漏洞', '安保巡逻']
└─ 新增字段: cells[].districtId: 'A'|'B'|'C'|'D'
```

#### L5 — 智能工厂（流水线阻塞）

```
差异点:
├─ background: #0a0f0a（工业铁灰色）
├─ zone布局: 左W右S 汇合到中心N（生产线汇聚感）
├─ decorations: conveyor-lines（传送带线条）+ gear（齿轮图标）
│   └─ 连接通道有流动的粒子动画暗示
├─ 特殊机制: blockade（流水线阻塞）
│   └─ 同一分支停留>2回合触发
│   └─ 扣除 3-8 点技术值
│   └─ 视觉提示: 分支路径变暗红色
└─ pathVisualStyles: 主线用橙色 #ff8800
```

#### L6 — 移动终端（信号迷路）

```
差异点:
├─ background: #0a0f14（靛蓝信号风）
├─ zone布局: 六边形蜂窝状格子分布（非标准圆形分布！）
│   └─ 这是唯一使用 hex-grid 变体的层级
├─ decorations: signal-towers（信号塔）+ antenna-array（天线阵列）
│   └─ 上圆周围有多个小型六边形"基站"
├─ 特殊机制: teleport（信号切换迷路）
│   └─ 移动至相邻蜂窝 20% 概率迷路
│   └─ 迷路: 棋子消失200ms → 随机相邻格出现
│   └─ 视觉: 静电干扰效果（screen glitch）
└─ gourdShapeParams 微调:
    └─ lowerCircle 使用 hexagonal-ish 分布（非纯圆形）
```

#### L7 — 云端平台（云端漂移）

```
差异点:
├─ background: #0f0e1a（淡紫云雾感）
├─ zone布局: 云朵状不规则区域（非严格四等分）
│   └─ 区域边界用虚线云朵轮廓表示
├─ decorations: cloud-puffs（蓬松云朵）+ rain-drops（雨滴粒子）
│   └─ 大量半透明圆形"云团"漂浮在背景中
├─ 特殊机制: drift（云端漂移）
│   └─ 每回合开始，非固定格坐标 ±1 随机偏移
│   └─ 视觉: 格子轻微晃动（CSS translate 随机偏移）
│   └─ 数据层面: gourdCoordinates 每回合重新计算微偏移
└─ ambientAnim: 'cloud-drift'（整体背景缓慢漂移）
```

#### L8 — 未来实验室（观测坍缩）

```
差异点:
├─ background: #0e0a14（深紫量子感）
├─ zone布局: 波函数概率云式区域（模糊边界）
│   └─ 区域间有干涉条纹图案
├─ decorations: quantum-particles（量子粒子）+ wave-fronts（波前）
│   └─ 双缝干涉样式的装饰纹样
├─ 特殊机制: collapse（观测坍缩）
│   └─ 进入特定机会格 → 随机锁定/解锁隐藏路径
│   └─ 锁定的路径变实线高亮
│   └─ 解锁的路径出现闪烁入口
└─ 新增字段: hiddenPaths: Array<{ from: string; to: string; locked: boolean }>
```

#### L9 — 指挥中心（殿堂礼仪）

```
差异点:
├─ background: #0f0e0a（庄严金黑色）
├─ zone布局: 严格的四分区 + 中央 CORE 禁区
│   └─ CORE区: 只有通关全部9关后才可进入
│   └─ D区（CORE）: 红色脉冲警告区
├─ decorations: throne-pillars（王座柱）+ banners（旗帜）+ command-holo（全息投影）
│   └─ 上圆: 大型指挥台全息图
│   └─ 下圆四周: 四根金色立柱
│   └─ 连接通道: 红地毯式（渐变色从外到内由金→红）
├─ 特殊机制: protocol（殿堂礼仪）
│   └─ 进入CORE必须按特定顺序踩格
│   └─ 顺序错误 → 遣返起点！
│   └─ 正确顺序: 外围顺时针 → 内圈逆时针 → CORE
│   └─ 视觉: 正确路径发光绿 / 错误路径闪烁红
└─ Boss格: 特殊处理
    └─ sizeMultiplier: 3.0 （比其他层更大！）
    └─ animationClass: 'gm-boss-emerge' + 额外的 'throne-glow'
```

### Task B4: 创建 layerMechanics 统一数据文件

**新建**: `src/tower-mode/data/layers/layerMechanics.ts`

```typescript
/**
 * 9层特殊机制完整数据
 * 
 * 每层的机制数据供 D组引擎读取并执行，
 * 同时也供 E组渲染器读取以显示视觉提示。
 */
export const LAYER_MECHANICS: Record<number, LayerSpecialMechanicData> = {
  1: {
    type: 'acceleration',
    name: '扩散加速',
    triggerCondition: 'consecutive_w_zone_visits >= 3',
    effect: 'next_dice_value += 1',
    resetCondition: 'layer_change | w_zone_exit',
    visualHint: { icon: '⚡', text: 'W区连击加速', progressKey: 'wStreakCount', maxProgress: 3 },
    penaltyOnFail: null,
  },
  2: {
    type: 'jump',
    name: '跨环跳跃',
    triggerCondition: 'dice_result >= 4 AND at_jump_point_cell',
    effect: 'teleport_to_any_inner_ring_cell',
    visualHint: { icon: '🔄', text: '可跳跃至内环', highlightCells: 'jumpPoints[]' },
    jumpPointCellIds: ['L2-C3', 'L2-C7'], // 该层哪些格子是跳跃点
  },
  3: {
    type: 'sequence',
    name: '层层解锁',
    triggerCondition: 'enter_inner_ring BEFORE middle_ring_cleared',
    effect: 'spawn_extra_enemy_battle',
    visualHint: { icon: '🔐', text: '按顺序前进', showLayerIndicators: true },
    circleOrder: ['outer', 'middle', 'inner'],
    currentCircle: 'outer', // 初始在外环
  },
  4: {
    type: 'event',
    name: '街区事件',
    triggerCondition: 'first_enter_district_each_turn',
    effect: 'trigger_district_event(district_id)',
    districts: {
      A: { name: '黑市街区', events: ['黑市交易', '情报购买'] },
      B: { name: '商业街区', events: ['商店促销', '系统升级'] },
      C: { name: '住宅街区', events: ['社工钓鱼', 'WiFi破解'] },
      D: { name: '工业区', events: ['工控入侵', '供应链攻击'] },
    },
  },
  5: {
    type: 'blockade',
    name: '流水线阻塞',
    triggerCondition: 'stay_in_same_branch > 2 turns',
    effect: 'lose_tech_value(3~8)',
    visualHint: { icon: '⛔', text: '分支阻塞警告', warningThreshold: 2 },
    blockedBranches: [], // 动态计算
  },
  6: {
    type: 'teleport',
    name: '信号迷路',
    triggerCondition: 'move_to_adjacent_hex: 20% chance',
    effect: 'relocate_to_random_adjacent_cell',
    visualHint: { icon: '📡', text: '信号不稳定', glitchIntensity: 0.2 },
    teleportChance: 0.20,
  },
  7: {
    type: 'drift',
    name: '云端漂移',
    triggerCondition: 'turn_start (always)',
    effect: 'all_non_fixed_cells offset ±1',
    visualHint: { icon: '☁️', text: '云层漂移中...', driftAmount: 1 },
    fixedCells: ['start', 'boss'], // 不受影响的固定格
  },
  8: {
    type: 'collapse',
    name: '观测坍缩',
    triggerCondition: 'enter_observation_cell',
    effect: 'random_lock_or_unlock_hidden_path',
    visualHint: { icon: '⚛️', text: '量子态坍缩...', collapseAnim: true },
    hiddenPaths: [
      { from: 'L8-L3', to: 'L8-Boss', locked: true },
      { from: 'L8-L7', to: 'L8-special', locked: false },
    ],
  },
  9: {
    type: 'protocol',
    name: '殿堂礼仪',
    triggerCondition: 'enter_CORE_zone with wrong_sequence',
    effect: 'teleport_back_to_start',
    correctSequence: ['outer_cw', 'inner_ccw', 'core'],
    visualHint: { icon: '👑', text: '按正确顺序进入', sequenceDisplay: true },
    protocolPenalty: 'return_to_start',
  },
};

interface LayerSpecialMechanicData {
  type: string;
  name: string;
  triggerCondition: string;
  effect: string;
  visualHint: any;
  [key: string]: any;
}
```

## 与其他组的接口约定

| 新产出 | 文件 | 消费者 |
|--------|------|--------|
| `gameMechanics.types.ts` | types/ | D组(引擎) E组(渲染) F组(测试) |
| `layerThemes.ts` | constants/ | B组(引用) E组(渲染) |
| `Dice3D/types.ts` | components/Dice3D/ | E组(Dice组件) |
| `layerMechanics.ts` | data/layers/ | D组(执行) E组(显示) |
| L1~L9 visualData | data/layers/L*_visualData.ts | C组(组装) E组(渲染) |

## 验收标准

1. ✅ 全部9层 quadrantLabels fontSizeRatio = **0.36**
2. ✅ 全部9层 border tileSize = **7**, opacity = **0.95**
3. ✅ 全部9层 zoneBackgrounds opacity ≥ **0.18**
4. ✅ 每层有**独特的** background 主色调（9种不同色系）
5. ✅ 每层 decorations 数量 ≥ **8** 且风格匹配主题
6. ✅ 每层包含 **layerMechanic** 数据（类型/名称/触发条件/效果/视觉提示）
7. ✅ L6 有蜂窝状分布的特殊 gourdShapeParams
8. ✅ L9 Boss sizeMultiplier = **3.0**（比其他层更大）
9. ✅ `layerMechanics.ts` 包含全部9层的完整机制数据
10. ✅ TypeScript 编译无错误
