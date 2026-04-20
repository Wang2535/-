# D组第七轮 — 曲线移动引擎与玩家棋子渲染

## 背景

第六轮D组实现了 MovementEngine（基于矩形网格的路径计算）。但第七轮地图变为葫芦形后：

1. **路径从直线变为曲线** — 移动动画需要沿贝塞尔曲线路径进行
2. **需要渲染玩家棋子** — 当前没有玩家棋子的视觉表现
3. **移动动画效果需要实现** — 设想要求：贝塞尔插值 + 光痕残留 + 弹性回弹 + 波纹扩散

## 任务目标

扩展MovementEngine以支持曲线坐标系统，并新增玩家棋子渲染和移动动画。

> **边界说明**：
> - D组负责**动画逻辑和状态更新**
> - 实际的DOM操作由E组执行（通过事件总线通知）
> - D组消费 A组的 GourdCoordinate 和 RenderableGourdMapTopology
> - D组不直接操作React组件

## 具体任务

### Task D1: 曲线路径计算引擎

创建/修改 `src/tower-mode/engine/curvedPathEngine.ts`：

```typescript
/**
 * 曲线移动路径引擎
 * 
 * 替代第六轮的直线 BFS 寻路。
 * 在葫芦形坐标系中，格子间的连接是曲线而非直线。
 */
export class CurvedPathEngine {
  
  /**
   * 计算从起点到终点的曲线路径点序列
   * 
   * 使用 Catmull-Rom 样条经过中间途经格
   * 返回一系列插值点，供动画使用
   */
  calculateAnimatedPath(
    fromCoord: GourdCoordinate,
    toCoord: GourdCoordinate,
    waypoints: GourdCoordinate[],    // 中间途经的格子
    topology: RenderableGourdMapTopology
  ): Array<{ x: number; y: number; progress: number }>
  
  /**
   * 计算总路径长度（用于确定动画时长）
   */
  calculatePathLength(pathPoints: Array<{ x: number; y: number }>): number
  
  /**
   * 根据进度 (0~1) 获取当前应在的位置
   * 使用贝塞尔曲线插值
   */
  getPositionAtProgress(
    pathPoints: Array<{ x: number; y: number }>,
    progress: number
  ): { x: number; y: number }
}
```

### Task D2: 玩家棋子系统

创建 `src/tower-mode/engine/playerPiece.ts`：

```typescript
/** 玩家棋子状态 */
interface PlayerPieceState {
  /** 当前位置（曲线坐标） */
  position: { x: number; y: number };
  /** 目标位置 */
  targetPosition: { x: number; y: number } | null;
  /** 是否正在移动 */
  isMoving: boolean;
  /** 移动起始时间 */
  moveStartTime: number | null;
  /** 移动预计时长 (ms) */
  moveDuration: number;
  /** 移动轨迹历史（用于光痕残留） */
  trailHistory: Array<{
    x: number; y: number;
    timestamp: number;
    opacity: number;
  }>;
  /** 当前所在格子ID */
  currentCellId: string | null;
}

export class PlayerPieceManager {
  
  /** 开始移动到目标格子 */
  startMove(targetCellId: string, pathPoints: Array<{ x: number; y: number }>): void
  
  /** 每帧更新位置（由 requestAnimationFrame 驱动） */
  update(deltaTime: number): PlayerPieceState
  
  /** 获取当前状态（供E组渲染） */
  getState(): PlayerPieceState
  
  /** 清除移动轨迹 */
  clearTrail(): void
}
```

### Task D3: 移动动画事件定义

在 `eventBus/gameEvents.ts` 中补充移动相关事件：

```typescript
// 新增到 GameEventMap
'piece:move:start': { fromCellId: string; toCellId: string; pathLength: number };
'piece:move:update': { position: { x: number; y: number }; progress: number; trail: TrailPoint[] };
'piece:move:end': { arrivedCellId: string; trail: TrailPoint[] };
'cell:enter': { cellId: string; zoneType?: string };      // 进入格子时触发区域效果
'zone:effect:trigger': { zoneType: string; cellId: string }; // 区域效果触发
```

## 验收标准

1. ✅ CurvedPathEngine 可生成沿曲线路径的插值点序列
2. ✅ PlayerPieceManager 可管理棋子位置、移动状态、轨迹残留
3. ✅ 移动动画时长：短距离300ms，长距离500ms（符合设想）
4. ✅ 轨迹残留：最近5个位置点，透明度递减
5. ✅ 移动期间禁止其他操作
6. ✅ 到达目标时有弹性回弹效果参数
7. ✅ 所有新事件正确定义并在 D→E 通信中使用
