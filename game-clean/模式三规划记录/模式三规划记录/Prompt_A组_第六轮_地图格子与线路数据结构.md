# A组 - 第六轮：地图格子与线路数据结构开发 Prompt

## 任务目标

实现爬塔模式分地图的核心数据结构，重点定义**葫芦形地图**的格子类型、坐标系统、线路连接关系和区域效果数据结构。

## 设计参考图

用户提供了一张葫芦形分地图设计图，核心特征：
- **上方小圆环**（葫芦嘴/颈部）：直径较小，包含起点格和少量关卡格
- **下方大圆环**（葫芦肚）：直径较大，包含大量关卡格、功能格和Boss格
- **中间连接通道**：连接上下两个圆环的狭窄路径
- **底部四象限区域效果**：W(虚弱)、N(知识)、I(反转)、P(跳过)四个区域分布在大圆内
- **整体轮廓**：外圈有黄白相间的装饰边框，呈现复古地图风格

## 核心设计文档

参考文件：
- `完整设想/完整设想.txt` - 完整游戏设计规范
- `完整设想/爬塔模式项目书.md` - 项目书
- `完整设想/分设想/文件一、（一）2.分地图.txt` - 分地图基础设计

## 具体任务

### Task A0: 定义跨组共享玩家类型（P0优先级）

创建文件 `src/tower-mode/types/player.types.ts`：

> **边界说明**：PlayerState、CoreResources、Skill、DataPack、Book 等类型被D组（引擎计算）和E组（UI展示）共同依赖，必须在A组统一定义，避免两组各自定义导致类型不兼容。

```typescript
// 核心资源
interface CoreResources {
  attack: number;
  defense: number;
  speed: number;
  technique: number;
}

// 技能
interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
}

// 数据包
interface DataPack {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  bonus: Partial<CoreResources>;
}

// 书籍
interface Book {
  id: string;
  name: string;
  effect: string;
  readAt: number; // 阅读时的层级
}

// 装备加成
interface EquipmentBonus {
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
}

// 卡牌
interface Card {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'utility';
  cost: number;
  effect: string;
}

// 物品掉落
interface ItemDrop {
  type: 'card' | 'skill' | 'dataPack' | 'book' | 'gold';
  id?: string;
  amount?: number;
}

// 玩家完整状态
interface PlayerState {
  position: string;
  technicalValue: number;
  maxTechnicalValue: number;
  coreResources: CoreResources;
  gold: number;
  cards: Card[];
  skills: Skill[];
  dataPacks: DataPack[];
  booksRead: Book[];
  clearedLevels: string[];
  flipCount: number;
  currentLayer: number;
}

// 存档数据
interface SaveData {
  version: string;
  currentLayer: number;
  gameState: TowerGameState;
  timestamp: number;
}

// 里程碑状态
interface MilestoneStatus {
  threshold: number;
  reached: boolean;
  rewardType: string;
  rewardDescription: string;
}
```

### Task A1: 定义格子（GridCell）数据结构

创建文件 `src/tower-mode/types/grid.types.ts`：

```typescript
// 格子类型枚举
enum GridType {
  START = 'start',           // 起点格
  BOSS = 'boss',             // Boss格
  LEVEL = 'level',           // 关卡格
  OPPORTUNITY = 'opportunity', // 机会格
  BOOKSTORE = 'bookstore',   // 书店格
  SKILL = 'skill',           // 技能格
  EXCHANGE = 'exchange',     // 交流会格
  TRANSITION = 'transition', // 过渡格（连接用）
  SPECIAL = 'special'        // 特殊格（安全门、网络节点等）
}

// 格子状态枚举
enum GridState {
  LOCKED = 'locked',         // 未访问（暗色+锁定图标）
  PENDING = 'pending',       // 待处理（橙色闪烁）
  CURRENT = 'current',       // 当前所在（放大+青色光圈）
  CLEARED = 'cleared',       // 已通关（金色边框+对勾）
  FAILED = 'failed'          // 已失败（灰色+红色叉号）
}

// 难度星级
type DifficultyStar = 1 | 2 | 3 | 4 | 5;

// 区域效果类型
enum AreaEffectType {
  WEAK = 'W',      // 虚弱区：骰子-1
  KNOWLEDGE = 'N', // 知识区：获书籍+资源
  INVERT = 'I',    // 反转区：地图倒置
  SKIP = 'P',      // 跳过区：跳过回合
  SPEED = 'S',     // 加速区：额外投掷
  DANGER = 'D'     // 危险区：随机损失
}

// 区域效果配置
interface AreaEffect {
  type: AreaEffectType;
  color: string;           // 区域覆盖颜色
  animationClass: string;  // 进入时的动画类名
  description: string;     // 效果描述
}

// 精英关卡标记
interface EliteMarker {
  isElite: boolean;        // 是否精英
  borderStyle: string;     // 边框样式（红色锯齿）
  icon: string;            // 图标（骷髅）
  penaltyMultiplier: number; // 惩罚倍率 1.5
  rewardMultiplier: number;  // 奖励倍率 2.0
}

// 格子坐标（支持葫芦形曲线坐标系）
interface GridCoordinate {
  x: number;               // 相对X坐标 (0-100)
  y: number;               // 相对Y坐标 (0-100)
  section: 'upper' | 'connector' | 'lower'; // 所属区域（上圆/连接部/下圆）
  ringIndex?: number;      // 环形索引（用于同心圆层）
  quadrant?: 1 | 2 | 3 | 4; // 象限（用于下圆四象限）
}

// 单个格子完整定义
interface GridCell {
  id: string;              // 唯一标识 "L{layer}_{type}_{index}"
  layer: number;           // 所属层级 1-9
  type: GridType;          // 格子类型
  state: GridState;        // 当前状态
  coordinate: GridCoordinate; // 坐标
  difficulty?: DifficultyStar; // 难度星级（仅关卡格）
  eliteMarker?: EliteMarker; // 精英标记（仅★★★★及以上）
  areaEffects: AreaEffect[]; // 所在区域效果（可能多个叠加）
  adjacentCells: string[];   // 相邻格子ID列表（线路连接）
  
  // 关卡特有属性（仅关卡格）
  levelData?: {
    levelId: string;       // 关卡ID
    theme: string;         // 关卡主题
    cleared: boolean;      // 是否已通关
    failedCount: number;   // 失败次数
  };
  
  // Boss格特有属性
  bossData?: {
    unlocked: boolean;     // 是否解锁挑战权限
    prototypeLevelId: string; // Boss原型关卡ID
    mechanismTags: string[]; // 特性标签
  };
}
```

### Task A2: 定义线路（PathConnection）数据结构

在同一文件中添加：

```typescript
// 线路类型
enum PathType {
  MAIN = 'main',           // 主路径（双向）
  BRANCH = 'branch',       // 分支路径（单向或双向）
  SHORTCUT = 'shortcut',   // 捷径/隐藏路径
  RETURN = 'return',       // 回流路径（L1病毒扩散专用）
  CROSS_RING = 'crossRing', // 跨环连接（L2双环形专用）
  SAFE_DOOR = 'safeDoor',  // 安全门（L3同心圆专用）
  BACKFLOW = 'backflow'    // 回流路径
}

// 线路连接
interface PathConnection {
  id: string;              // 连接ID
  fromCellId: string;      // 起始格子ID
  toCellId: string;        // 目标格子ID
  pathType: PathType;      // 线路类型
  bidirectional: boolean;  // 是否双向
  distance: number;        // 移动距离（步数）
  
  // 条件性连接
  condition?: {
    type: 'clearAll' | 'clearSpecific' | 'unlockItem' | 'random';
    requiredCellIds?: string[]; // 需要先通关的关卡格
    unlockItemId?: string;    // 需要拥有的物品
    probability?: number;     // 随机概率（0-1）
  };
  
  // 视觉样式
  visualStyle?: {
    color: string;            // 线路颜色
    width: number;            // 线路宽度
    dashArray?: number[];     // 虚线模式
    animated?: boolean;       // 是否动画流动
  };
}

// 葫芦形地图拓扑结构
interface GourdMapTopology {
  layer: number;
  
  // 三大区域划分
  upperCircle: {
    center: { x: number; y: number };
    radius: number;
    cellIds: string[];
  };
  
  connector: {
    cellIds: string[];
    width: number;
  };
  
  lowerCircle: {
    center: { x: number; y: number };
    radius: number;
    cellIds: string[];
    
    // 下圆四象限区域效果分配
    quadrants: {
      [1]: AreaEffectType; // 左上
      [2]: AreaEffectType; // 右上
      [3]: AreaEffectType; // 左下
      [4]: AreaEffectType; // 右下
    };
  };
  
  // 所有线路连接
  connections: PathConnection[];
  
  // 统计信息
  stats: {
    totalCells: number;
    cellsByType: Record<GridType, number>;
    avgPathLength: number;
    loopPaths: number;
  };
}
```

### Task A3: 定义9层地图模板配置

创建文件 `src/tower-mode/data/mapTemplates.ts`：

```typescript
// 各层地图形状参数（葫芦形变体）
interface LayerMapTemplate {
  layer: number;
  name: string;             // 地图名称
  theme: string;            // 安全主题
  
  // 葫芦形参数
  gourdParams: {
    upperRadius: number;    // 上圆半径（相对值）
    lowerRadius: number;    // 下圆半径（相对值）
    connectorWidth: number; // 连接部宽度
    upperCenterY: number;   // 上圆圆心Y
    lowerCenterY: number;   // 下圆圆心Y
    
    // 变体参数
    upperEccentricity: number; // 上圆偏心率（0=正圆，>0=椭圆）
    lowerEccentricity: number; // 下圆偏心率
    rotation: number;         // 整体旋转角度
  };
  
  // 格子数量配置
  gridConfig: {
    totalCells: number;      // 总格子数 16-22
    levelGrids: number;      // 关卡格数量
    opportunityGrids: number;// 机会格数 1-2
    eliteRatio: number;      // 精英格比例
  };
  
  // 区域效果配置
  areaConfig: {
    upperAreaEffects: { type: AreaEffectType; ratio: number }[];
    lowerQuadrantEffects: [AreaEffectType, AreaEffectType, AreaEffectType, AreaEffectType];
  };
  
  // 该层特殊机制（通过地图结构体现）
  specialMechanism: {
    type: string;
    description: string;
    implementation: string; // 如何通过格子/线路实现
  };
}

export const LAYER_MAP_TEMPLATES: Record<number, LayerMapTemplate> = {
  1: {
    layer: 1,
    name: '病毒实验室',
    theme: '病毒与恶意软件',
    gourdParams: {
      upperRadius: 15,
      lowerRadius: 35,
      connectorWidth: 8,
      upperCenterY: 20,
      lowerCenterY: 70,
      upperEccentricity: 0.15,
      lowerEccentricity: 0.05,
      rotation: 0
    },
    gridConfig: {
      totalCells: 18,
      levelGrids: 10,
      opportunityGrids: 1,
      eliteRatio: 0.1
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.WEAK, ratio: 0.6 }],
      lowerQuadrantEffects: [
        AreaEffectType.WEAK,
        AreaEffectType.DANGER,
        AreaEffectType.WEAK,
        AreaEffectType.DANGER
      ]
    },
    specialMechanism: {
      type: 'virus_spread',
      description: '病毒扩散型',
      implementation: '关卡格密度从上到下递增，W区域集中在下圆底部，存在回流路径'
    }
  },
  // ... L2-L9 类似配置
};
```

### Task A4: 实现网格布局工具库

创建文件 `src/tower-mode/utils/gourdLayout.ts`：

> **边界说明**：GourdLayoutGenerator 是**通用工具库**，提供坐标计算、连通性检查、SVG导出等基础能力。B组负责调用这些工具并手工微调，产出每层的最终数据文件。A组不负责生成任何层的具体地图数据。

```typescript
/**
 * 葫芦形地图网格布局工具库
 * 
 * ⚠️ 本模块是工具函数集合，不是地图生成器。
 * B组使用本工具库计算坐标、验证连通性、导出SVG，
 * 最终由B组产出 Layer1~Layer9 的具体地图数据文件。
 * 
 * 提供的能力：
 * 1. 根据gourdParams计算上下圆的边界曲线点
 * 2. 在曲线内均匀分布格子点
 * 3. 生成初始线路连接（B组可在此基础上微调）
 * 4. 分配区域效果
 * 5. 语法级拓扑验证（字段完整性、ID唯一性、坐标范围）
 * 6. SVG路径数据导出
 */

export class GourdLayoutGenerator {
  
  /**
   * 计算葫芦形曲线上某角度的点坐标
   */
  calculateGourdPoint(
    angle: number,
    params: GourdMapParameters
  ): { x: number; y: number; section: 'upper' | 'lower' }
  
  /**
   * 生成所有格子的初始坐标
   */
  generateGridCoordinates(
    template: LayerMapTemplate
  ): Map<string, GridCoordinate>
  
  /**
   * 生成线路连接（保证强连通性）
   */
  generateConnections(
    cells: GridCell[],
    template: LayerMapTemplate
  ): PathConnection[]
  
  /**
   * 分配区域效果到格子
   */
  assignAreaEffects(
    cells: GridCell[],
    template: LayerMapTemplate
  ): void
  
  /**
   * 语法级拓扑验证（B组负责语义级验证）
   * 
   * 本方法仅检查：字段完整性、ID唯一性、坐标范围合法性
   * 不检查：强连通性、环路存在、Boss可达性（由B组MapConnectivityValidator负责）
   */
  validateTopology(topology: GourdMapTopology): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  }
  
  /**
   * 导出为可视化用的SVG路径数据
   */
  exportToSvgPathData(topology: GourdMapTopology): SvgPathData
}
```

### Task A5: 类型导出与统一

创建文件 `src/tower-mode/types/index.ts`，统一导出所有类型：

```typescript
export * from './grid.types';
export * from './player.types';
// 导出所有格子、线路、区域、玩家相关类型
```

## 验收标准

1. ✅ PlayerState/CoreResources/SaveData 等跨组共享类型完整定义（P0）
2. ✅ GridCell 类型完整覆盖所有格子状态和属性
3. ✅ PathConnection 支持条件性连接和双向/单向
4. ✅ GourdMapTopology 正确描述葫芦形三区域结构
5. ✅ 9层地图模板参数化配置
6. ✅ 布局工具库可辅助B组生成合法地图（A组不负责具体层数据）
7. ✅ validateTopology 仅做语法级验证，语义级验证留给B组
8. ✅ 区域效果正确分配到对应象限
9. ✅ 所有类型都有完整的 JSDoc 注释
10. ✅ types/index.ts 统一导出 grid.types + player.types

## 与其他组的接口约定

| 接口 | 提供给 | 使用于 |
|------|--------|--------|
| `GridCell[]` | B组 | 地图数据生成 |
| `GourdMapTopology` | B/C组 | B组生成/C组关卡分配 |
| `LayerMapTemplate` | B/E组 | B组数据生成/E组UI配置 |
| `PathConnection[]` | B/D组 | B组线路设计/D组移动引擎 |
| `PlayerState` | D组+E组 | 引擎计算+UI展示 |
| `CoreResources` | D组+E组 | 资源追踪+资源面板 |
| `SaveData` | D组+F组 | 存档管理+集成测试 |
| `MilestoneStatus` | D组+E组 | 里程碑判定+弹窗展示 |
| `Card/Skill/DataPack/Book` | D组+E组 | 战斗系统+背包UI |
| `EquipmentBonus` | D组 | 战斗加成计算 |
| `ItemDrop` | C组+D组 | Boss掉落+战斗奖励 |

## 注意事项

1. **葫芦形是基础形状**：每层的葫芦形可以通过 eccentricity（偏心率）、rotation（旋转）等参数变体化
2. **L1的特殊性**：需要支持"回流路径"，即从下圆返回上圆的额外线路
3. **L3的特殊性**：需要支持同心圆分层，每层有独立的"安全门格"
4. **L4的特殊性**：需要支持下圆内部的街区划分（每个象限为独立街区）
5. **区域效果优先级**：I > D > P > W > S > N
