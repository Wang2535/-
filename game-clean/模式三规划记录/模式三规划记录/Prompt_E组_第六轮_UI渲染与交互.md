# E组 - 第六轮：UI渲染与交互开发 Prompt

## 任务目标

实现爬塔模式的完整UI渲染系统，重点展示**葫芦形分地图**的视觉效果和交互体验。

> **边界说明**：
> - E组使用的 PlayerState / CoreResources / MilestoneStatus 等共享类型**来自A组定义**（player.types.ts），E组不重新定义
> - E组消费C组产出的 **EnrichedTopology**（含关卡分配+Boss配置），不直接使用B组的裸拓扑
> - E组消费B组产出的 **MapVisualConfig**（视觉样式配置）
> - E组仅负责渲染和交互，不包含任何游戏逻辑计算
> - 用户交互事件（点击格子、选择路径等）通过回调传递给D组引擎处理

## 核心要求

1. **葫芦形地图渲染**: 使用Canvas或SVG绘制葫芦形状的地图
2. **格子状态可视化**: 5种状态的视觉差异
3. **线路动画**: 移动路径的高亮动画
4. **区域效果展示**: 半透明覆盖层
5. **交互反馈**: 点击、悬停、选择等交互效果

## 具体任务

### Task E1: 葫芦形地图渲染器

```typescript
// src/tower-mode/components/TowerMapView/GourdMapRenderer.tsx

interface GourdMapRendererProps {
  topology: EnrichedTopology;    // 来自C组，非B组裸拓扑
  visualConfig: MapVisualConfig; // 来自B组
  currentCellId: string;
  onCellClick: (cellId: string) => void;       // → D组引擎
  onCellHover: (cellId: string | null) => void;
  highlightedPath?: GridCell[];
}

/**
 * 葫芦形地图渲染器
 * 
 * 渲染层次（从底到顶）：
 * 1. 背景层（渐变/图案）
 * 2. 区域效果层（半透明覆盖）
 * 3. 线路层（主路径/分支/特殊）
 * 4. 格子层（根据状态渲染）
 * 5. 动画层（移动光痕、选中高亮）
 * 6. 信息层（格子标签、提示）
 */
export const GourdMapRenderer: React.FC<GourdMapRendererProps>;
```

### Task E2: 格子组件

```typescript
// src/tower-mode/components/TowerMapView/GridCellComponent.tsx

interface GridCellProps {
  cell: GridCell;
  state: GridState;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  size: number; // 像素尺寸
}

export const GridCellComponent: React.FC<GridCellProps>;
```

### Task E3: 区域效果组件

```typescript
// src/tower-mode/components/TowerMapView/AreaEffectOverlay.tsx

interface AreaEffectOverlayProps {
  effects: Map<string, AreaEffect[]>; // cellId → effects
  topology: GourdMapTopology;
}

export const AreaEffectOverlay: React.FC<AreaEffectOverlayProps>;
```

### Task E4: 骰子与移动控制面板

```typescript
// src/tower-mode/components/TowerMapView/MovementControlPanel.tsx

interface MovementControlPanelProps {
  diceValue: number | null;
  isRolling: boolean;
  onRollDice: () => void;        // → D组引擎
  remainingSteps: number;
  availablePaths: GridCell[][];
  onSelectPath: (pathIndex: number) => void; // → D组引擎
  playerState: PlayerState;      // 来自A组 player.types.ts
}

export const MovementControlPanel: React.FC<MovementControlPanelProps>;
```

### Task E5: 信息面板

```typescript
// src/tower-mode/components/TowerMapView/GameInfoPanel.tsx

interface GameInfoPanelProps {
  technicalValue: number;
  technicalValueMax: number;
  coreResources: CoreResources;     // 来自A组 player.types.ts
  gold: number;
  currentLayer: number;
  clearedLevels: number;
  flipCount: number;
  milestones: MilestoneStatus[];    // 来自A组 player.types.ts
}

export const GameInfoPanel: React.FC<GameInfoPanelProps>;
```

## 视觉规范

### 葫芦形曲线绘制参数

```typescript
const GOURD_CURVE_PARAMS = {
  // 上圆参数
  upperCircle: {
    centerX: 0.5,    // 相对X (0-1)
    centerY: 0.18,   // 相对Y (0-1)
    radiusX: 0.15,   // 水平半径
    radiusY: 0.12,   // 垂直半径
  },
  
  // 下圆参数
  lowerCircle: {
    centerX: 0.5,
    centerY: 0.65,
    radiusX: 0.35,
    radiusY: 0.28,
  },
  
  // 连接部参数
  connector: {
    width: 0.08,
    startY: 0.28,
    endY: 0.42,
  },
  
  // 外边框装饰
  borderDecorator: {
    pattern: 'checkerboard', // 黄白棋盘格
    colors: ['#FFD700', '#FFFFFF'],
    width: 8, // 像素
  }
};
```

### 动画规格

| 动画 | 时长 | 缓动函数 | 触发条件 |
|------|------|----------|----------|
| 玩家移动 | 300-500ms | easeInOutCubic | 投骰后 |
| 光痕残留 | 2000ms | fadeOut | 移动经过 |
| 格子状态变化 | 300ms | spring | 战斗结果 |
| 区域效果闪烁 | 循环 | pulse | 进入区域时 |
| Boss格脉动 | 循环 | heartbeat | 未解锁时 |

## 验收标准

1. ✅ 葫芦形地图正确渲染，轮廓清晰
2. ✅ 9种层级主题视觉风格正确
3. ✅ 5种格子状态视觉区分明显
4. ✅ 线路连接正确显示
5. ✅ 区域效果半透明覆盖正确
6. ✅ 移动动画流畅自然
7. ✅ 交互响应灵敏
8. ✅ 使用EnrichedTopology（非B组裸拓扑）渲染关卡/Boss信息
9. ✅ 所有共享类型从A组导入，不重新定义

## 类型来源清单

| 类型 | 来源 | 说明 |
|------|------|------|
| PlayerState | A组 player.types.ts | 玩家状态展示 |
| CoreResources | A组 player.types.ts | 资源面板 |
| MilestoneStatus | A组 player.types.ts | 里程碑弹窗 |
| EnrichedTopology | C组 enrichedTopology.types.ts | 地图渲染数据源 |
| MapVisualConfig | B组 mapVisualConfig.ts | 视觉样式配置 |
| GridCell/GridState | A组 grid.types.ts | 格子组件 |
