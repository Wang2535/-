# D组第八轮 — 事件总线对接与棋子状态驱动

## 背景

第七轮D组实现了 `CurvedPathEngine`（曲线路径计算）和 `PlayerPieceManager`（棋子状态管理），并在 `gameEvents.ts` 中定义了移动相关的事件类型。但当前存在以下问题：

1. **事件总线未真正接入** — 事件类型已定义但 D 组代码未实际 emit 任何事件
2. **PlayerPieceState 无法被外部读取** — E 组的 GourdMapRenderer 需要实时获取棋子位置来渲染 `AnimationLayer`，但目前没有订阅机制
3. **移动流程未闭环** — 从"点击骰子→计算路径→移动动画→到达目标"的完整链路未打通
4. **区域效果触发未实现** — 进入 W/N/I/P 象限时应触发 `zone:effect:trigger`，但未接入

## 任务目标

将 D 组的引擎层与事件总线深度对接，使其成为**可被 E 组渲染器消费的状态驱动源**。

> **边界说明**：
> - D组负责**逻辑运算 + 状态管理 + 事件发射**
> - D组**不操作DOM/SVG/React组件**（那是E组的事）
> - D组消费 A 组的 GourdCoordinate / RenderableGourdMapTopology
> - D组通过 **eventBus** 向 E 组推送状态变更
> - D组提供 **getState() / subscribe()** API 供 E 组主动查询

## 具体任务

### Task D1: PlayerPieceManager 接入事件总线

修改 `src/tower-mode/engine/playerPieceManager.ts`：

```typescript
/**
 * 第八轮更新：PlayerPieceManager 接入事件总线
 * 
 * 核心变化：
 * 1. 每次 startMove → emit 'piece:move:start'
 * 2. 每帧 update → emit 'piece:move:update'（含位置+轨迹）
 * 3. 移动结束 → emit 'piece:move:end'
 * 4. 到达新格子 → 判断区域类型 → emit 'zone:effect:trigger' 或 'cell:enter'
 */
export class PlayerPieceManager {
  private eventBus: EventBus;
  private state: PlayerPieceState;
  private subscribers: Array<(state: PlayerPieceState) => void> = [];
  
  constructor(eventBus: EventBus, initialCellId?: string) {
    this.eventBus = eventBus;
    this.state = this.createInitialState(initialCellId);
  }

  /**
   * 创建初始状态
   */
  private createInitialState(cellId?: string): PlayerPieceState {
    return {
      position: cellId ? { x: 0, y: 0 } : null,  // 坐标由外部设置
      targetPosition: null,
      isMoving: false,
      moveStartTime: null,
      moveDuration: 0,
      trailHistory: [],
      currentCellId: cellId ?? null,
      justArrived: false,     // 第八轮新增：到达标记（E组用于触发波纹）
      currentZone: null,      // 第八轮新增：当前所在象限
    };
  }

  /**
   * 开始移动到目标格子
   * 
   * @param targetCellId 目标格子ID
   * @param pathPoints 曲线路径插值点序列（来自CurvedPathEngine）
   * @param zoneType 目标格子的区域类型（W/N/I/P/null）
   */
  startMove(
    targetCellId: string,
    pathPoints: Array<{ x: number; y: number; progress: number }>,
    zoneType?: string
  ): void {
    if (this.state.isMoving) {
      console.warn('[D组] 移动中，忽略重复请求');
      return;
    }

    const fromCellId = this.state.currentCellId;
    
    // 计算路径长度和动画时长
    const pathLength = this.calculatePathLength(pathPoints);
    const duration = this.estimateDuration(pathPoints.length);
    
    // 更新内部状态
    this.state = {
      ...this.state,
      targetPosition: pathPoints[pathPoints.length - 1],
      isMoving: true,
      moveStartTime: performance.now(),
      moveDuration: duration,
      trailHistory: [],           // 清空旧轨迹
      justArrived: false,
    };

    // === 发射事件：移动开始 ===
    this.eventBus.emit('piece:move:start', {
      fromCellId: fromCellId ?? '',
      toCellId: targetCellId,
      pathLength,
      zoneType: zoneType ?? null,
    });

    console.log(`[D组] 开始移动: ${fromCellId} → ${targetCellId} (${pathPoints.length}个插值点, ${duration}ms)`);
  }

  /**
   * 每帧更新（由 requestAnimationFrame 驱动）
   * 
   * @param deltaTime 距上一帧的毫秒数
   * @returns 当前完整状态（供 E 组渲染使用）
   */
  update(deltaTime: number): PlayerPieceState {
    if (!this.state.isMoving || !this.state.moveStartTime) {
      return this.state;
    }

    const elapsed = performance.now() - this.state.moveStartTime;
    const progress = Math.min(elapsed / this.state.moveDuration, 1);

    // 使用弹性缓动函数（到达时有回弹感）
    const easedProgress = this.easeOutBack(progress);

    // 计算当前位置（基于路径插值）
    const position = this.interpolatePosition(easedProgress);
    
    // 更新轨迹历史（保留最近5个点，透明度递减）
    const newTrail = [...this.state.trailHistory];
    if (newTrail.length === 0 || 
        this.distance(position, newTrail[newTrail.length - 1]) > 0.02) {
      newTrail.push({
        x: position.x,
        y: position.y,
        timestamp: performance.now(),
        opacity: 1.0,
      });
      // 只保留最近5个点
      while (newTrail.length > 5) newTrail.shift();
    }
    // 轨迹透明度衰减
    for (const pt of newTrail) {
      const age = performance.now() - pt.timestamp;
      pt.opacity = Math.max(0, 1 - age / 1500);  // 1.5秒内渐隐
    }

    // 更新状态
    this.state = {
      ...this.state,
      position,
      trailHistory: newTrail.filter(t => t.opacity > 0.05),
    };

    // === 发射事件：移动中更新（节流，每50ms最多一次）===
    if (elapsed % 50 < deltaTime) {
      this.eventBus.emit('piece:move:update', {
        position,
        progress: easedProgress,
        trail: newTrail.filter(t => t.opacity > 0.05),
      });
    }

    // === 检测移动结束 ===
    if (progress >= 1) {
      this.onMoveComplete();
    }

    // 通知所有订阅者
    this.notifySubscribers();

    return this.state;
  }

  /**
   * 移动完成处理
   */
  private onMoveComplete(): void {
    const targetId = this.state.targetPosition ? 'arrived' : this.state.currentCellId;
    
    this.state = {
      ...this.state,
      isMoving: false,
      moveStartTime: null,
      currentCellId: targetId,
      justArrived: true,        // 标记刚到达（E组用此触发波纹）
    };

    // === 发射事件：移动结束 ===
    this.eventBus.emit('piece:move:end', {
      arrivedCellId: targetId ?? '',
      trail: this.state.trailHistory,
    });

    // === 发射事件：进入格子 → 触发区域效果 ===
    // 这里需要外部传入目标格子的区域信息
    // 实际由 TowerModeApp 或 Controller 层在收到 move:end 后判断并重新 emit
    console.log(`[D组] 移动完成，到达: ${targetId}`);

    // 300ms后清除 justArrived 标记
    setTimeout(() => {
      this.state = { ...this.state, justArrived: false };
      this.notifySubscribers();
    }, 300);
  }

  /**
   * 设置玩家当前所在的区域（由外部调用）
   * 
   * 当 Controller 判断出玩家进入了某个象限时调用此方法
   */
  setCurrentZone(zoneType: string | null): void {
    const prevZone = this.state.currentZone;
    this.state = { ...this.state, currentZone: zoneType };

    // 区域变化时触发区域效果事件
    if (zoneType && zoneType !== prevZone) {
      this.eventBus.emit('zone:effect:trigger', {
        zoneType,
        cellId: this.state.currentCellId ?? '',
      });
      console.log(`[D组] 进入区域: ${zoneType}`);
    }
  }

  /**
   * 获取当前状态（供 E 组 GourdMapRenderer 的 AnimationLayer 使用）
   */
  getState(): PlayerPieceState {
    return { ...this.state };
  }

  /**
   * 订阅状态变更（E 组可用此替代逐帧轮询）
   */
  subscribe(callback: (state: PlayerPieceState) => void): () => void {
    this.subscribers.push(callback);
    // 返回取消订阅函数
    return () => {
      const idx = this.subscribers.indexOf(callback);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }

  private notifySubscribers(): void {
    const snapshot = this.getState();
    for (const cb of this.subscribers) {
      try { cb(snapshot); } catch (e) { console.error('[D组] subscriber error', e); }
    }
  }

  /** 弹性缓动函数：到达时轻微回弹 */
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  private calculatePathLength(points: Array<{ x: number; y: number }>): number {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += this.distance(points[i - 1], points[i]);
    }
    return len;
  }

  private estimateDuration(pointCount: number): number {
    // 短距离300ms，长距离500ms，线性插值
    return Math.min(300 + pointCount * 8, 600);
  }

  private distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private interpolatePosition(progress: number): { x: number; y: number } {
    // 此处需要持有路径点引用，实际实现中通过构造函数或 setter 注入
    // 简化版：线性插值（实际应使用曲线路径点插值）
    if (!this.state.targetPosition || !this.state.position) {
      return { x: 0.5, y: 0.5 }; // 默认中心
    }
    return {
      x: this.state.position.x + (this.state.targetPosition.x - this.state.position.x) * progress,
      y: this.state.position.y + (this.state.targetPosition.y - this.state.position.y) * progress,
    };
  }

  clearTrail(): void {
    this.state = { ...this.state, trailHistory: [] };
  }
}
```

### Task D2: CurvedPathEngine 与 PlayerPieceManager 对接

创建/修改 `src/tower-mode/engine/movementController.ts`：

```typescript
/**
 * 移动控制器 —— 统一调度 CurvedPathEngine + PlayerPieceManager
 * 
 * 这是 D 组对外的主入口。
 * TowerModeApp / F组 通过此类发起移动请求。
 */
export class MovementController {
  private curvedPathEngine: CurvedPathEngine;
  private pieceManager: PlayerPieceManager;
  private eventBus: EventBus;
  private rafId: number | null = null;
  private topology: RenderableGourdMapTopology | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.curvedPathEngine = new CurvedPathEngine();
    this.pieceManager = new PlayerPieceManager(eventBus);
  }

  /**
   * 设置当前拓扑（层级切换时调用）
   */
  setTopology(topology: RenderableGourdMapTopology): void {
    this.topology = topology;
  }

  /**
   * 发起移动请求（对外主API）
   * 
   * @param fromCoord 起始坐标
   * @param toCoord 目标坐标
   * @param waypoints 中间途经格子坐标列表
   * @returns Promise<boolean> 是否成功开始移动
   */
  async requestMove(
    fromCoord: GourdCoordinate,
    toCoord: GourdCoordinate,
    waypoints: GourdCoordinate[]
  ): Promise<boolean> {
    if (!this.topology) {
      console.error('[D组] 未设置拓扑，无法移动');
      return false;
    }
    if (this.pieceManager.getState().isMoving) {
      console.warn('[D组] 移动中，拒绝请求');
      return false;
    }

    // 1. 计算曲线路径
    const pathPoints = this.curvedPathEngine.calculateAnimatedPath(
      fromCoord, toCoord, waypoints, this.topology
    );

    if (pathPoints.length < 2) {
      console.error('[D组] 路径计算失败');
      return false;
    }

    // 2. 确定目标格子的区域类型
    const targetZone = this.detectZone(toCoord);

    // 3. 启动棋子移动
    const targetCellId = this.coordToCellId(toCoord);
    this.pieceManager.startMove(targetCellId, pathPoints, targetZone);

    // 4. 启动动画循环
    this.startAnimationLoop();

    return true;
  }

  /**
   * 启动 requestAnimationFrame 循环
   */
  private startAnimationLoop(): void {
    if (this.rafId !== null) return; // 已在运行

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      this.pieceManager.update(dt);

      if (this.pieceManager.getState().isMoving) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
        console.log('[D组] 动画循环结束');
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  /**
   * 获取棋子状态（供 E 组渲染器使用）
   */
  getPieceState(): PlayerPieceState {
    return this.pieceManager.getState();
  }

  /**
   * 订阅棋子状态变更（供 E 组响应式更新）
   */
  onPieceStateChange(callback: (state: PlayerPieceState) => void): () => void {
    return this.pieceManager.subscribe(callback);
  }

  /**
   * 停止所有动画（用于紧急中断）
   */
  emergencyStop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // 重置棋子状态
    // （具体重置逻辑依赖 PlayerPieceManager 实现）
  }

  /**
   * 根据坐标检测所在象限
   */
  private detectZone(coord: GourdCoordinate): string | null {
    if (!this.topology || coord.region !== 'lowerCircle') return null;
    
    const angle = coord.theta; // 0~2π
    // W: 左上(π~1.5π), N: 右上(0~0.5π), I: 左下(1.5π~2π), P: 右下(0.5π~π)
    if (angle >= Math.PI && angle <= 1.5 * Math.PI) return 'W';
    if (angle >= 0 && angle <= 0.5 * Math.PI) return 'N';
    if (angle >= 1.5 * Math.PI && angle <= 2 * Math.PI) return 'I';
    if (angle >= 0.5 * Math.PI && angle <= Math.PI) return 'P';
    return null;
  }

  private coordToCellId(coord: GourdCoordinate): string {
    return `${coord.region}_${coord.theta.toFixed(2)}_${coord.radiusRatio.toFixed(2)}`;
  }
}
```

### Task D3: 外部集成接口 — 供 TowerModeApp 调用

```typescript
/**
 * D组对外暴露的集成接口
 * 
 * 在 TowerModeApp.tsx 中这样使用：
 * 
 * import { createMovementSystem } from '../../engine/movementController';
 * 
 * // 初始化
 * const movement = createMovementSystem(eventBus);
 * movement.setTopology(currentTopology);
 * 
 * // 在骰子结果回调中：
 * const success = await movement.requestMove(fromCoord, toCoord, waypoints);
 * 
 * // 在 GourdMapRenderer 中：
 * const pieceState = movement.getPieceState();
 * <AnimationLayer pieceState={pieceState} />
 */

export function createMovementSystem(eventBus: EventBus): MovementController {
  return new MovementController(eventBus);
}

/** 导出类型供 E 组使用 */
export type { PlayerPieceState } from './playerPieceManager';
```

### Task D4: 单元测试 — 事件发射与状态驱动

创建 `src/tower-mode/__tests__/engine/movementIntegration.test.ts`：

```typescript
describe('D组第八轮 — 事件总线与棋子状态测试', () => {

  test('startMove 应发射 piece:move:start 事件', () => {
    const bus = createMockEventBus();
    const manager = new PlayerPieceManager(bus);
    const pathPoints = [{x:0,y:0,progress:0}, {x:1,y:1,progress:1}];
    
    manager.startMove('cell-5', pathPoints, 'W');
    
    expect(bus.emittedEvents).toContainEqual(
      expect.objectContaining({ type: 'piece:move:start', data: expect.objectContaining({ toCellId: 'cell-5' }) })
    );
  });

  test('update() 在移动中应发射 piece:move:update', () => {
    const bus = createMockEventBus();
    const manager = new PlayerPieceManager(bus);
    manager.startMove('cell-5', [{x:0,y:0,progress:0},{x:1,y:1,progress:1}], 'W');
    
    manager.update(16); // 一帧
    
    expect(bus.emittedEvents.some(e => e.type === 'piece:move:update')).toBe(true);
  });

  test('移动完成时应发射 piece:move:end 且 justArrived=true', async () => {
    const bus = createMockEventBus();
    const manager = new PlayerPieceManager(bus);
    // 用极短的duration让移动立即完成
    manager.startMove('cell-5', [{x:0,y:0,progress:0},{x:1,y:1,progress:1}], 'W');
    // hack: 直接设一个很小的 moveDuration
    (manager as any).state.moveDuration = 1;
    
    manager.update(100); // 远超duration
    
    expect(bus.emittedEvents).toContainEqual(
      expect.objectContaining({ type: 'piece:move:end' })
    );
    expect(manager.getState().justArrived).toBe(true);
  });

  test('setCurrentZone 触发 zone:effect:trigger', () => {
    const bus = createMockEventBus();
    const manager = new PlayerPieceManager(bus);
    
    manager.setCurrentZone('W');
    
    expect(bus.emittedEvents).toContainEqual(
      expect.objectContaining({ type: 'zone:effect:trigger', data: expect.objectContaining({ zoneType: 'W' }) })
    );
  });

  test('subscribe 可以收到状态变更通知', () => {
    const manager = new PlayerPieceManager(createMockEventBus());
    const receivedStates: PlayerPieceState[] = [];
    
    manager.subscribe(s => receivedStates.push(s));
    manager.startMove('cell-5', [{x:0,y:0,progress:0},{x:1,y:1,progress:1}], 'W');
    manager.update(16);
    
    expect(receivedStates.length).toBeGreaterThan(0);
    expect(receivedStates[receivedStates.length-1].isMoving).toBe(true);
  });

  test('MovementController.requestMove 完整流程', async () => {
    const controller = new MovementController(createMockEventBus());
    controller.setTopology(mockTopology);
    
    const result = await controller.requestMove(
      { region:'lowerCircle', theta:Math.PI, radiusRatio:0.5 },
      { region:'lowerCircle', theta:Math.PI/2, radiusRatio:0.7 },
      []
    );
    
    expect(result).toBe(true);
    expect(controller.getPieceState().isMoving).toBe(true);
  });

  test('移动中拒绝重复请求', async () => {
    const controller = new MovementController(createMockEventBus());
    controller.setTopology(mockTopology);
    
    await controller.requestMove(mockFrom, mockTo, []);
    const result2 = await controller.requestMove(mockFrom, mockTo2, []);
    
    expect(result2).toBe(false); // 应被拒绝
  });

  test('轨迹光痕包含最近5个位置点且透明度递减', () => {
    const manager = new PlayerPieceManager(createMockEventBus());
    manager.startMove('cell-5', generateLongPath(20), 'W');
    
    // 模拟多帧更新
    for (let i = 0; i < 30; i++) manager.update(16);
    
    const trail = manager.getState().trailHistory;
    expect(trail.length).toBeLessThanOrEqual(5);
    if (trail.length >= 2) {
      expect(trail[0].opacity).toBeLessThanOrEqual(trail[trail.length-1].opacity);
    }
  });
});
```

## 事件流时序图（第八轮）

```
用户点击骰子
    │
    ▼
TowerModeApp / Controller
    │  调用 movement.requestMove(from, to, waypoints)
    ▼
MovementController (D组)
    │
    ├─① CurvedPathEngine.calculateAnimatedPath() → pathPoints[]
    │
    ├─② PlayerPieceManager.startMove(targetCellId, pathPoints, zoneType)
    │       │
    │       └─▶ emit('piece:move:start', { from, to, pathLength })
    │
    ├─③ 启动 rAF 循环 → 每帧调用 pieceManager.update(dt)
    │       │
    │       ├─▶ emit('piece:move:update', { position, progress, trail }) [节流50ms]
    │       │
    │       └─ progress ≥ 1 时:
    │           ├─▶ emit('piece:move:end', { arrivedCellId, trail })
    │           ├─▶ justArrived = true (持续300ms)
    │           └─▶ 外部判断区域后调用 setCurrentZone()
    │                   └─▶ emit('zone:effect:trigger', { zoneType, cellId })
    │
    ▼
E组 GourdMapRenderer 监听这些事件:
    │
    ├─ piece:move:start → 准备 AnimationLayer
    ├─ piece:move:update → 更新棋子位置 + 轨迹渲染
    ├─ piece:move:end   → 触发到达波纹 (arrival-ripple)
    └─ zone:effect:trigger → 触发区域特效 (ripple-enter/sparkle-enter/...)
```

## 与其他组的接口约定

| 接口 | 方向 | 对方组 | 说明 |
|------|------|--------|------|
| `MovementController` 类 | 输出 | → F组/TowerModeApp | 移动系统主入口 |
| `createMovementSystem()` 工厂函数 | 输出 | → F组/TowerModeApp | 创建实例 |
| `getPieceState()` | 输出 | → E组 | 获取棋子渲染状态 |
| `onPieceStateChange(cb)` | 输出 | → E组 | 响应式状态订阅 |
| `setTopology(topology)` | 输入 | ← C组/F组 | 设置当前层级拓扑 |
| `requestMove(from,to,waypoints)` | 输入 | ← F组/Controller | 发起移动请求 |
| `PlayerPieceState` 类型 | 输出 | → E组 | AnimationLayer props 类型 |
| `GameEventMap` (move/zone) | 输出 | → E组 | 事件定义（已在第七轮定义） |

## 验收标准

1. ✅ `PlayerPieceManager.startMove()` 正确发射 `piece:move:start` 事件
2. ✅ `PlayerPieceManager.update()` 在移动期间按节流策略发射 `piece:move:update`
3. ✅ 移动结束时发射 `piece:move:end`，且 `justArrived` 标记持续约300ms
4. ✅ `setCurrentZone()` 在区域变化时发射 `zone:effect:trigger`
5. ✅ `MovementController` 封装了完整的"请求→计算→动画"流程
6. ✅ `getPieceState()` 返回的 `PlayerPieceState` 包含 position/trailHistory/justArrived/currentZone
7. ✅ `subscribe()` 回调机制正常工作，E组可通过订阅而非轮询获取状态
8. ✅ 移动中重复请求被正确拒绝
9. ✅ 轨迹光痕限制为最近5个点且透明度递减
10. ✅ 单元测试覆盖：事件发射/状态查询/订阅/拒绝重复/轨迹限制 共6个场景
