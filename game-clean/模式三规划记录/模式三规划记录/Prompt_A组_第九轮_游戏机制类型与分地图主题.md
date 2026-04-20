# A组第九轮 — 游戏机制类型体系 + 资源微调 + 分地图主题资源

## 背景

第八轮A组建立了完整的视觉资源库（14种SVG图标、14种CSS动画、3套默认值）。第九轮A组需要：

1. **修复P0差距**: W/N/I/P fontSizeRatio 从 0.22 → **0.36**（最大单项提升）
2. **扩展类型体系**: 新增游戏机制所需的**状态类型**和**事件类型**
3. **新增分地图主题资源**: 每层(L1-L9)需要独特的**骰子皮肤/主题色/特效色**

> **边界说明**:
> - A组只负责**类型定义 + 资源常量 + 骰子组件**
> - A组不修改渲染逻辑（E组的事）
> - A组不处理游戏流程控制（D组的事）
> - A组的产出必须可直接被 B/D/E 组 import 使用

## 具体任务

### Task A0: 修正 DEFAULT_QUADRANT_LABELS 的 fontSizeRatio

**修改文件**: `src/tower-mode/constants/defaultVisualStyles.ts`

```typescript
// 将 fontSizeRatio 从 0.22 提升到 0.36
// 在 viewbox 100x100 中，下圆半径 r≈35
// fontSize = r * 2 * 0.36 ≈ 25.2 （海幸参考图级别！）
export const DEFAULT_QUADRANT_LABELS: Array<{...}> = [
  {
    quadrant: 'W', label: 'W',
    fontSizeRatio: 0.36,    // ★ 从 0.22 → 0.36（+63%）
    color: '#FF6B6B',      // 淡红色（W虚弱区）
    fontWeight: '900',
    fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif',
    strokeColor: '#FFFFFF',
    strokeWidth: 1.0,       // ★ 从 0.8 → 1.0（更粗描边）
    shadowColor: '#000000',
    shadowBlur: 4,          // ★ 从 3 → 4（更深阴影）
    shadowOffsetX: 1.5,
    shadowOffsetY: 1.5,
    enableShadow: true,
  },
  // N/I/P 同理，fontSizeRatio 全部改为 0.36
  // N: color='#4ECDC4'（淡蓝）
  // I: color='#9B59B6'（淡紫）
  // P: color='#F39C12'（金黄）
];
```

### Task A1: 修正 DEFAULT_BORDER_CONFIG

```typescript
export const DEFAULT_BORDER_CONFIG = {
  enabled: true,
  mode: 'checkerboard-fill',
  borderWidth: 10,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 7,              // ★ 从 12 → 7（方格更密集）
  innerPadding: 3,          // ★ 从 2 → 3（内边距更大）
  cornerRadius: 2,          // ★ 从 3 → 2（小圆角更适合密集格）
  opacity: 0.95,            // ★ 从 0.85 → 0.95（更实心）
  glowColor: 'rgba(255,170,0,0.5)', // ★ 从 0.4 → 0.5（更强发光）
};
```

### Task A2: 新增游戏机制核心类型

**新建文件**: `src/tower-mode/types/gameMechanics.types.ts`

```typescript
/**
 * 第九轮新增：游戏机制核心类型定义
 * 
 * 这些类型支撑整个爬塔模式的游戏循环：
 * 骰子投掷 → 路径计算 → 移动动画 → 格子触发 → 效果结算
 */

// ========== 骰子系统 ==========

/** 骰子结果 */
export interface DiceResult {
  /** 基础点数 (1-6) */
  baseValue: number;
  /** 最终点数（含所有修正） */
  finalValue: number;
  /** 修正列表 */
  modifiers: DiceModifier[];
  /** 是否为大成功(基础6且无负面修正) */
  isCritSuccess: boolean;
  /** 是否为大失败(基础1且有W区域修正) */
  isCritFail: boolean;
}

/** 骰子修正 */
export interface DiceModifier {
  type: 'zone_w' | 'zone_s' | 'skill' | 'event' | 'layer_mechanic';
  source: string;           // 来源描述，如 "W区域效果" / "轻装上阵技能"
  delta: number;             // 修正值（正负均可）
  description?: string;     // 可选的详细描述
}

// ========== 回合与阶段 ==========

/** 游戏回合状态 */
export type GamePhase =
  | 'idle'                  // 空闲等待
  | 'dice_ready'            // 骰子准备中(浮起发光)
  | 'dice_rolling'          // 骰子翻滚中
  | 'dice_result'           // 骰子结果已出
  | 'path_selecting'        // 玩家选择路径方向
  | 'moving'                // 移动动画播放中
  | 'cell_arrived'          // 到达目标格子
  | 'cell_interacting'      // 与格子交互中（选择进入/跳过等）
  | 'battle_preparing'      // 战斗准备加载
  | 'battle_active'         // 战斗进行中
  | 'battle_settling'       // 战斗结算中
  | 'turn_ending'           // 回合结束处理中
  | 'layer_transitioning';   // 层级过渡中

/** 当前回合的完整上下文 */
export interface TurnContext {
  turnNumber: number;           // 第几回合
  currentLayer: number;          // 当前层级 (1-9)
  diceResult: DiceResult | null; // 本回合骰子结果
  phase: GamePhase;              // 当前阶段
  playerPosition: string | null; // 当前所在格子ID
  visitedCellsThisTurn: string[]; // 本回合经过的格子
  pendingCellId: string | null;   // 待处理的格子（如暂不进入的关卡格）
  availablePaths: PathOption[];   // 可选路径列表
}

/** 路径选项 */
export interface PathOption {
  pathCells: string[];     // 该路径经过的格子序列
  targetCellId: string;    // 终点格子
  totalSteps: number;      // 总步数消耗
  direction: 'forward' | 'branch_left' | 'branch_right';
}

// ========== 格子交互状态 ==========

/** 格子在地图上的状态 */
export type CellMapState =
  | 'locked'               // 锁定（未解锁前置条件）
  | 'pending'              // 可访问但尚未到达（橙色闪烁）
  | 'current'              // 当前玩家所在（绿色高亮）
  | 'arrived'              // 刚到达（波纹效果中）
  | 'interacting'          // 正在交互（弹出信息面板）
  | 'waiting'              // 暂不进入（待处理状态）
  | 'cleared'              // 已通关（金色发光+对勾）
  | 'failed'               // 已挑战失败（灰红叉号）
  | 'skipped'              // 已跳过绕行;

/** 格子信息面板数据 */
export interface CellInfoPanelData {
  cellId: string;
  cellType: 'battle' | 'bookstore' | 'skill' | 'exchange'
           | 'opportunity' | 'chance' | 'special' | 'transition' | 'boss';
  name: string;
  difficultyStars: 1 | 2 | 3 | 4 | 5;
  enemyPreview?: { name: string; type: string; powerEstimate: number };
  rewardPreview?: { cardNames: string[]; techValueGain: number; goldGain: number };
  resourceReward?: { compute: number; fund: number; info: number };
  canEnter: boolean;
  canSkip: boolean;
  skipPenalty?: string;    // 跳过惩罚描述
}

// ========== 区域效果 ==========

/** 区域效果实例 */
export interface ZoneEffectInstance {
  zoneType: 'W' | 'N' | 'I' | 'P' | 'S' | 'D';
  effectType: 'stat_mod' | 'dice_mod' | 'special_trigger' | 'visual_only';
  value: number;             // 效果数值
  duration: number;          // 持续回合数（-1=永久直到离开）
  description: string;
  triggerCondition?: string; // 触发条件描述
}

// ========== 层级特殊机制 ==========

/** 每层的特殊机制配置 */
export interface LayerSpecialMechanic {
  layer: number;
  name: string;              // 机制名称
  description: string;       // 描述
  type: 'acceleration' | 'jump' | 'sequence' | 'event' | 'blockade'
       | 'teleport' | 'drift' | 'collapse' | 'protocol';
  triggerCondition: string;  // 触发条件
  effect: string;            // 效果描述
  visualHint?: string;       // UI提示文案
}

// ========== 战斗集成 ==========

/** 爬塔模式战斗入口参数 */
export interface TowerBattleParams {
  cellId: string;
  layerNumber: number;
  difficultyLevel: 1|2|3|4|5;
  /** 爬塔加成列表 */
  bonuses: TowerBonus[];
}

/** 单项爬塔战斗加成 */
export interface TowerBonus {
  source: 'book' | 'skill' | 'datapack' | 'milestone' | 'resource_threshold';
  description: string;
  statEffect: { stat: string; value: number }[];
}
```

### Task A3: 创建9层主题资源包

**新建文件**: `src/tower-mode/constants/layerThemes.ts`

```typescript
/**
 * 9层分地图主题资源配置
 * 
 * 每层有独特的：
 * - 主色调（背景渐变、线条颜色、强调色）
 * - 骰子外观（颜色、图案）
 * - 区域色彩映射（W/N/I/P在各层的具体含义可能不同）
 * - 特殊装饰元素风格
 */
export const LAYER_THEMES: Record<number, LayerThemeConfig> = {
  1: { // L1 病毒实验室 — 暗绿+深红生物感
    name: '病毒实验室',
    bgPrimary: '#0a1a0f', bgSecondary: '#0d2015',
    accentColor: '#44ff88', dangerColor: '#ff3333',
    diceSkin: { faceColor: '#1a3a1a', dotColor: '#44ff88', glowColor: '#22aa44' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', D: '#FF4444', S: '#44ff88' },
    particleStyle: 'virus-spore', // 病毒孢子粒子
    ambientAnim: 'bio-pulse',        // 生物脉冲环境动画
    specialMechanic: 'acceleration', // 连续3个W区加速扩散
  },
  2: { // L2 网络空间 — 深蓝+青紫数字感
    name: '网络空间',
    bgPrimary: '#0a0f1a', bgSecondary: '#0f1528',
    accentColor: '#4488ff', dangerColor: '#ff6644',
    diceSkin: { faceColor: '#0a1628', dotColor: '#4488ff', glowColor: '#2255cc' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', S: '#44ff88', I: '#aa44ff' },
    particleStyle: 'data-packet',
    ambientAnim: 'data-flow',
    specialMechanic: 'jump', // 跨环跳跃
  },
  3: { // L3 数据金库 — 深金棕+琥珀安全感
    name: '数据金库',
    bgPrimary: '#0f0a08', bgSecondary: '#1a120e',
    accentColor: '#ffaa44', dangerColor: '#cc4400',
    diceSkin: { faceColor: '#1a1208', dotColor: '#ffaa44', glowColor: '#cc7700' },
    zoneColors: { W: '#FF6B6B', N: '#FFCC00', D: '#cc4400', I: '#cc88ff' },
    particleStyle: 'gold-dust',
    ambientAnim: 'vault-glow',
    specialMechanic: 'sequence', // 层层解锁顺序
  },
  4: { // L4 城市街区 — 深灰蓝+霓虹城市感
    name: '城市街区',
    bgPrimary: '#0f0f14', bgSecondary: '#181820',
    accentColor: '#ff44aa', dangerColor: '#ff2222',
    diceSkin: { faceColor: '#14141c', dotColor: '#ff44aa', glowColor: '#cc2288' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', P: '#F39C12', S: '#44ff88' },
    particleStyle: 'neon-rain',
    ambientAnim: 'city-pulse',
    specialMechanic: 'event', // 街区事件
  },
  5: { // L5 智能工厂 — 深铁灰+橙黄工业感
    name: '智能工厂',
    bgPrimary: '#0a0f0a', bgSecondary: '#12180f',
    accentColor: '#ff8800', dangerColor: '#ff4400',
    diceSkin: { faceColor: '#101810', dotColor: '#ff8800', glowColor: '#cc6600' },
    zoneColors: { W: '#FF6B6B', N: '#FFCC00', S: '#44ff88', P: '#F39C12' },
    particleStyle: 'spark',
    ambientAnim: 'conveyor-belt',
    specialMechanic: 'blockade', // 流水线阻塞
  },
  6: { // L6 移动终端 — 深靛蓝+信号干扰感
    name: '移动终端',
    bgPrimary: '#0a0f14', bgSecondary: '#0e1520',
    accentColor: '#6644ff', dangerColor: '#ff4488',
    diceSkin: { faceColor: '#0c1020', dotColor: '#6644ff', glowColor: '#4422cc' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', D: '#ff4488', S: '#44ff88' },
    particleStyle: 'signal-wave',
    ambientAnim: 'interference',
    specialMechanic: 'teleport', // 信号切换迷路
  },
  7: { // L7 云端平台 — 淡紫白+云朵飘逸感
    name: '云端平台',
    bgPrimary: '#0f0e1a', bgSecondary: '#181628',
    accentColor: '#aa88ff', dangerColor: '#dd66ff',
    diceSkin: { faceColor: '#16142a', dotColor: '#aa88ff', glowColor: '#8855dd' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', S: '#44ff88' },
    particleStyle: 'cloud-fluff',
    ambientAnim: 'cloud-drift',
    specialMechanic: 'drift', // 云端漂移
  },
  8: { // L8 未来实验室 — 深紫黑+量子观测感
    name: '未来实验室',
    bgPrimary: '#0e0a14', bgSecondary: '#16101e',
    accentColor: '#dd44ff', dangerColor: '#ff22aa',
    diceSkin: { faceColor: #120a18, dotColor: '#dd44ff', glowColor: '#bb22cc' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', P: '#F39C12' },
    particleStyle: 'quantum-particle',
    ambientAnim: 'wave-collapse',
    specialMechanic: 'collapse', // 观测坍缩
  },
  9: { // L9 指挥中心 — 金黑+庄严殿堂感
    name: '指挥中心',
    bgPrimary: '#0f0e0a', bgSecondary: #1a1810,
    accentColor: '#ffdd44', dangerColor: '#ff0000',
    diceSkin: { faceColor: '#18160a', dotColor: '#ffdd44', glowColor: '#ccaa00' },
    zoneColors: { W: '#FF6B6B', N: '#FFCC00', P: '#F39C12', D: '#ff0000' },
    particleStyle: 'command-beam',
    ambientAnim: 'throne-glow',
    specialMechanic: 'protocol', // 殿堂礼仪
  },
};

export interface LayerThemeConfig {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  accentColor: string;
  dangerColor: string;
  diceSkin: { faceColor: string; dotColor: string; glowColor: string };
  zoneColors: Partial<Record<string, string>>;
  particleStyle: string;
  ambientAnim: string;
  specialMechanic: string;
}

/** 获取某层主题（带fallback） */
export function getLayerTheme(layer: number): LayerThemeConfig {
  return LAYER_THEMES[layer] ?? LAYER_THEMES[1];
}
```

### Task A4: 创建骰子组件类型

**新建文件**: `src/tower-mode/components/Dice3D/types.ts`

```typescript
/**
 * 3D骰子组件的类型定义
 * 
 * 骰子是爬塔模式的核心UI元素之一，
 * 每回合开始时自动投掷，决定移动步数。
 */
export interface Dice3DProps {
  value: number | null;         // 当前显示的点数(null=未投掷)
  isRolling: boolean;           // 是否正在翻滚
  modifiers: Array<{          // 显示中的修正列表
    type: string;
    delta: number;
    label: string;
  }>;
  theme: {                     // 主题配色
    faceColor: string;
    dotColor: string;
    glowColor: string;
  };
  onRollComplete?: (result: number) => void;  // 投掷完成回调
  size?: number;               // 尺寸(px)，默认80
}

/** 骰子面定义（6面） */
export interface DiceFace {
  value: number;           // 1-6
  dotPositions: Array<{ x: number; y: number }>; // 点的位置(归一化0-1)
}
```

## 验收标准

1. ✅ `DEFAULT_QUADRANT_LABELS` 的 fontSizeRatio = **0.36**（4个象限全部）
2. ✅ `DEFAULT_BORDER_CONFIG` 的 tileSize = **7**, opacity = **0.95**, glowColor 更强
3. ✅ `gameMechanics.types.ts` 包含完整的 **15个接口/类型** 定义（DiceResult/TurnContext/CellInfoPanel等）
4. ✅ `layerThemes.ts` 包含 **9套完整主题配置**（每套含12个字段）
5. ✅ 每层主题包含 unique 的 diceSkin（骰子配色随层级变化）
6. ✅ 每层主题包含 unique 的 specialMechanic 名称
7. ✅ `Dice3D/types.ts` 包含骰子组件所需的所有类型
8. ✅ TypeScript 编译无错误
