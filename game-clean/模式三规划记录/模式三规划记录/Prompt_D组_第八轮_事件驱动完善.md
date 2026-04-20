# D组第八轮 — 事件驱动完善与状态查询API

## 背景

第七轮D组创建了 CurvedPathEngine 和 PlayerPieceManager 的代码骨架，但存在以下致命问题：

1. **PlayerPieceManager 从未 emit 过任何事件** — 事件类型定义了但代码里没调用 eventBus.emit()
2. **PlayerPieceState 无法被外部获取** — 没有 getState() / subscribe() API
3. **MovementController 封装类不存在** — 各模块无法统一调度移动
4. **区域效果触发链路断裂** — 进入象限时没人通知E组播放动画

## 任务目标

让 D 组成为**真正可工作的动画驱动引擎**，通过事件总线向 E 组推送棋子状态。

## 具体任务

### Task D1: PlayerPieceManager 重写（事件发射版）

**重写** `src/tower-mode/engine/playerPieceManager.ts`：

```typescript
import type { EventBus } from '../EventBus';
import type { GourdCoordinate } from '../types/gourdCoordinate.types';

interface TrailPoint {
  x: number; y: number;
  timestamp: number;
  opacity: number;
}

export interface PlayerPieceState {
  position: { x: number; y: number } | null;
  targetPosition: { x: number; y: number } | null;
  isMoving: boolean;
  moveStartTime: number | null;
  moveDuration: number;
  trailHistory: TrailPoint[];
  currentCellId: string | null;
  justArrived: boolean;     // 到达标记（持续~300ms）
  currentZone: string | null;
}

export class PlayerPieceManager {
  private eventBus: EventBus;
  private state: PlayerPieceState;
  private subscribers: Array<(state: PlayerPieceState) => void> = [];
  private pathPoints: Array<{ x: number; y: number }> = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerPieceState {
    return {
      position: null, targetPosition: null, isMoving: false,
      moveStartTime: null, moveDuration: 0, trailHistory: [],
      currentCellId: null, justArrived: false, currentZone: null,
    };
  }

  /**
   * 开始移动 ★ 核心方法
   */
  startMove(
    targetCellId: string,
    pathPoints: Array<{ x: number; y: number }>,
    targetZone?: string
  ): void {
    if (this.state.isMoving) {
      console.warn('[D组] 移动中，忽略重复请求');
      return;
    }

    const fromCellId = this.state.currentCellId;
    const pathLen = this.calcPathLength(pathPoints);
    const duration = Math.min(300 + pathPoints.length * 10, 600);

    this.pathPoints = pathPoints;
    this.state = {
      ...this.state,
      targetPosition: pathPoints[pathPoints.length - 1],
      isMoving: true,
      moveStartTime: performance.now(),
      moveDuration: duration,
      trailHistory: [],
      justArrived: false,
    };

    // ★ 发射事件: 移动开始
    this.eventBus.emit('piece:move:start' as any, {
      fromCellId: fromCellId ?? '',
      toCellId: targetCellId,
      pathLength: pathLen,
      targetZone: targetZone ?? null,
    });
  }

  /**
   * 每帧更新 ★ 由 rAF 循环调用
   */
  update(deltaTime: number): PlayerPieceState {
    if (!this.state.isMoving || !this.state.moveStartTime || !this.pathPoints.length) {
      return this.state;
    }

    const elapsed = performance.now() - this.state.moveStartTime!;
    const rawProgress = Math.min(elapsed / this.state.moveDuration, 1);
    const progress = this.easeOutBack(rawProgress); // 弹性缓动

    const pos = this.interpolatePosition(progress);
    
    // 更新轨迹（最多5点）
    this.updateTrail(pos);

    this.state = { ...this.state, position: pos, trailHistory: [...this.state.trailHistory] };

    // ★ 节流发射移动更新事件（每50ms一次）
    if (elapsed % 50 < deltaTime + 5) {
      this.eventBus.emit('piece:move:update' as any, {
        position: pos, progress,
        trail: this.state.trailHistory.filter(t => t.opacity > 0.05),
      });
    }

    // 检测到达
    if (rawProgress >= 1) this.onMoveComplete();

    this.notifySubscribers();
    return this.state;
  }

  /** 移动完成处理 */
  private onMoveComplete(): void {
    const arrivedId = this.state.currentCellId ?? 'unknown';

    this.state = {
      ...this.state,
      isMoving: false,
      moveStartTime: null,
      currentCellId: arrivedId,
      justArrived: true,
    };

    // ★ 发射事件: 移动结束
    this.eventBus.emit('piece:move:end' as any, {
      arrivedCellId: arrivedId,
      trail: this.state.trailHistory,
    });

    // 300ms后清除到达标记
    setTimeout(() => {
      this.state = { ...this.state, justArrived: false };
      this.notifySubscribers();
    }, 300);
  }

  /** 设置当前区域（由外部Controller调用）*/
  setCurrentZone(zone: string | null): void {
    const prev = this.state.currentZone;
    this.state = { ...this.state, currentZone: zone };

    if (zone && zone !== prev) {
      // ★ 发射事件: 区域效果触发
      this.eventBus.emit('zone:effect:trigger' as any, {
        zoneType: zone,
        cellId: this.state.currentCellId ?? '',
      });
    }
  }

  // ====== 公共查询API ======

  getState(): PlayerPieceState { return { ...this.state }; }

  subscribe(callback: (state: PlayerPieceState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const idx = this.subscribers.indexOf(callback);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }

  clearTrail(): void { this.state = { ...this.state, trailHistory: [] }; }

  // ====== 内部工具 ======
  private notifySubscribers(): void {
    const snap = this.getState();
    for (const cb of this.subscribers) {
      try { cb(snap); } catch(e) { /* ignore */ }
    }
  }

  private updateTrail(pos: { x: number; y: number }): void {
    const last = this.state.trailHistory[this.state.trailHistory.length - 1];
    if (last) {
      const dx = pos.x - last.x, dy = pos.y - last.y;
      if (dx*dx + dy*dy < 0.0004) return; // 太近不添加
    }
    this.state.trailHistory.push({ ...pos, timestamp: Date.now(), opacity: 1.0 });
    while (this.state.trailHistory.length > 5) this.state.trailHistory.shift();
    for (const t of this.state.trailHistory) {
      t.opacity = Math.max(0, 1 - (Date.now() - t.timestamp) / 1500);
    }
    this.state.trailHistory = this.state.trailHistory.filter(t => t.opacity > 0.05);
  }

  private interpolatePosition(progress: number): { x: number; y: number } {
    if (!this.pathPoints.length || !this.state.targetPosition) return { x: 0.5, y: 0.5 };
    if (progress <= 0) return this.pathPoints[0];
    if (progress >= 1) return this.state.targetPosition;

    const totalLen = this.pathPoints.length - 1;
    const seg = progress * totalLen;
    const i = Math.floor(seg);
    const frac = seg - i;
    const p1 = this.pathParams[Math.min(i, this.pathPoints.length - 1)];
    const p2 = this.pathParams[Math.min(i + 1, this.pathPoints.length - 1)];
    return {
      x: p1.x + (p2.x - p1.x) * frac,
      y: p1.y + (p2.y - p1.y) * frac,
    };
  }

  private easeOutBack(t: number): number {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  private calcPathLength(pts: Array<{x:number;y:number}>): number {
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      len += Math.sqrt(dx*dx + dy*dy);
    }
    return len;
  }
}
```

### Task D2: MovementController 封装

**新建** `src/tower-mode/engine/movementController.ts`：

```typescript
/**
 * 移动控制器 — D组对外唯一入口
 * 
 * 使用方式:
 *   const movement = new MovementController(eventBus);
 *   movement.setTopology(topology);
 *   await movement.requestMove(fromCoord, toCoord, waypoints);
 *   
 *   // E组渲染器中:
 *   const state = movement.getPieceState();
 *   <AnimationLayer pieceState={state} />
 */
export class MovementController {
  private curvedPathEngine: any; // CurvedPathEngine instance
  private pieceManager: PlayerPieceManager;
  private eventBus: EventBus;
  private topology: any = null;
  private rafId: number | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    // 延迟导入避免循环依赖
    let engine: any = null;
    try { const m = require('./curvedPathEngine'); engine = new m.CurvedPathEngine(); } catch {}
    this.curvedPathEngine = engine;
    this.pieceManager = new PlayerPieceManager(eventBus);
  }

  setTopology(topology: any): void { this.topology = topology; }

  async requestMove(
    from: any, to: any, waypoints: any[]
  ): Promise<boolean> {
    if (!this.topology || this.pieceManager.getState().isMoving) return false;

    let pathPoints: Array<{x:number;y:number}>;
    try {
      pathPoints = this.curvedPathEngine
        ? this.curvedPathEngine.calculateAnimatedPath(from, to, waypoints, this.topology)
        : this.fallbackPath(from, to);
    } catch { pathPoints = this.fallbackPath(from, to); }

    if (pathPoints.length < 2) return false;

    const targetZone = this.detectZone(to);
    this.pieceManager.startMove(this.coordToId(to), pathPoints, targetZone);
    this.startLoop();

    return true;
  }

  getPieceState(): PlayerPieceState { return this.pieceManager.getState(); }
  onPieceStateChange(cb: (s: PlayerPieceState) => void): () => void {
    return this.pieceManager.subscribe(cb);
  }
  setCurrentZone(z: string | null): void { this.pieceManager.setCurrentZone(z); }
  emergencyStop(): void {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  }

  private startLoop(): void {
    if (this.rafId) return;
    let last = performance.now();
    const tick = (now: number) => {
      this.pieceManager.update(now - last);
      last = now;
      if (this.pieceManager.getState().isMoving) {
        this.rafId = requestAnimationFrame(tick);
      } else { this.rafId = null; }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private detectZone(coord: any): string | null {
    if (!coord || coord.region !== 'lowerCircle') return null;
    const theta = ((coord.theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (theta >= Math.PI && theta <= 1.5*Math.PI) return 'W';
    if (theta >= 0 && theta <= 0.5*Math.PI) return 'N';
    if (theta >= 1.5*Math.PI && theta <= 2*Math.PI) return 'I';
    if (theta >= 0.5*Math.PI && theta <= Math.PI) return 'P';
    return null;
  }

  private fallbackPath(from: any, to: any): Array<{x:number;y:number}> {
    return [
      { x: from.cartesian?.x ?? 0.5, y: from.cartesian?.y ?? 0.3 },
      { x: to.cartesian?.x ?? 0.5, y: to.cartesian?.y ?? 0.7 },
    ];
  }

  private coordToId(c: any): string {
    return `${c.region}_${c.theta?.toFixed(2)}_${c.radiusRatio?.toFixed(2)}`;
  }
}
```

### Task D3: 测试

```typescript
describe('D组第八轮 — 事件发射验证', () => {
  test('startMove 发射 piece:move:start', () => {
    const bus = MockEventBus(); const mgr = new PlayerPieceManager(bus);
    mgr.startMove('c5', [{x:0,y:0},{x:1,y:1}], 'W');
    expect(bus.lastEvent?.type).toBe('piece:move:start');
  });
  test('update 在移动中发射 piece:move:update', () => {
    const bus = MockEventBus(); const mgr = new PlayerPieceManager(bus);
    mgr.startMove('c5', [{x:0,y:0},{x:1,y:1}]);
    mgr.update(100);
    expect(bus.events.some((e:any)=>e.type==='piece:move:update')).toBe(true);
  });
  test('移动结束发射 piece:move:end 且 justArrived=true', () => {
    const bus = MockEventBus(); const mgr = new PlayerPieceManager(bus);
    mgr.startMove('c5', [{x:0,y:0},{x:1,y:1}]);
    (mgr as any).state.moveDuration = 1;
    mgr.update(200);
    expect(mgr.getState().justArrived).toBe(true);
    expect(bus.events.map((e:any)=>e.type)).toContain('piece:move:end');
  });
  test('setCurrentZone 发射 zone:effect:trigger', () => {
    const bus = MockEventBus(); const mgr = new PlayerPieceManager(bus);
    mgr.setCurrentZone('W');
    expect(bus.lastEvent?.data.zoneType).toBe('W');
  });
  test('subscribe 回调正常工作', () => {
    const mgr = new PlayerPieceManager(MockEventBus());
    const states: any[] = [];
    mgr.subscribe(s => states.push(s));
    mgr.startMove('c5', [{x:0,y:0},{x:1,y:1}]);
    mgr.update(50);
    expect(states.length).toBeGreaterThan(0);
    expect(states[states.length-1].isMoving).toBe(true);
  });
});
```

## 验收标准

1. ✅ startMove() → emit('piece:move:start')
2. ✅ update() → emit('piece:move:update') （节流50ms）
3. ✅ 移动结束 → emit('piece:move:end') + justArrived=true(~300ms)
4. ✅ setCurrentZone() → emit('zone:effect:trigger')
5. ✅ getState() 返回完整 PlayerPieceState
6. ✅ subscribe() 回调机制工作
7. ✅ MovementController 封装完整可用
8. ✅ 轨迹限制5点+透明度递减
