# B组第十一轮 — 机制逻辑补全 + Zone效果执行

## 背景

第十轮完成了9种机制的**可视化**表现,但原始设想中这些机制应该有**实际游戏效果**:

- L1: 连续通过3个W区 → 移动步数+1(不仅是进度条)
- L2: 掷骰≥4可跳至内环(不仅是虚线圆)
- L3: 强制按圈层顺序通过(不仅是步骤指示器)
- L5: 停留>2回合扣技术值(不仅是X标记)
- L7: 格子坐标随机偏移(不仅是箭头)
- L8: 随机锁定/解锁路径(不仅是裂纹)
- L9: 不按顺序走遣返起点(不仅是金色路径)

同时,**6种Zone效果(W/N/I/P/S/D)也未在游戏中执行**。

## 本轮目标

**从"看得见"到"玩得到"** — 让机制可视化的背后有真正的游戏规则支撑。

---

## 具体任务

### Task B1: ★★★ P0 — MechanicEffectEngine 机制效果引擎

**新建文件**: `src/tower-mode/engine/MechanicEffectEngine.ts`

```typescript
/**
 * MechanicEffectEngine — 处理9种机制的实际游戏效果
 * 
 * 职责:
 * 1. 追踪机制相关状态(连续通过W区次数、停留回合数等)
 * 2. 在适当时机触发机制效果(步数增加、扣值、传送等)
 * 3. 向TowerGameEngine报告效果结果
 */

import type { TowerGameEngine } from './TowerGameEngine';

export interface MechanicState {
  // L1: 扩散加速
  wStreakCount: number;          // 连续通过W区次数
  bonusSteps: number;            // 额外步数奖励

  // L3: 层层解锁
  sequenceCompletedRings: number; // 已完成的圈层数
  currentRequiredRing: 'outer' | 'mid' | 'core';

  // L4: 街区事件
  visitedDistricts: Set<string>;  // 已访问的街区
  pendingEvents: Array<{ district: string; event: string }>;

  // L5: 流水线阻塞
  branchStayCounts: Map<string, number>; // 各分支停留回合数

  // L6: 信号切换
  teleportCooldown: number;        // 传送冷却
  lastTeleportCell: string | null;

  // L7: 云端漂移
  driftOffsets: Map<string, { dx: number; dy: number }>; // 各格偏移量

  // L8: 观测坍缩
  collapsedPaths: Set<string>;     // 已坍缩(锁定)的路径
  revealedPaths: Set<string>;      // 已揭示的路径

  // L9: 殿堂礼仪
  protocolStep: number;            // 当前步骤
  protocolViolations: number;      // 违规次数
}

export class MechanicEffectEngine {
  private state: MechanicState;
  private engine: TowerGameEngine;

  constructor(engine: TowerGameEngine) {
    this.engine = engine;
    this.state = this.createInitialState();
  }

  /**
   * 当玩家到达格子时调用 — 触发对应层机制检查
   */
  onCellArrived(cellId: string, layerNumber: number): MechanicEffectResult {
    const mechanicType = this.getMechanicType(layerNumber);

    switch (mechanicType) {
      case 'acceleration': return this.checkAcceleration(cellId);
      case 'jump': return this.checkJumpOpportunity(cellId);
      case 'sequence': return this.checkSequenceProgress(cellId);
      case 'event': return this.checkDistrictEvent(cellId);
      case 'blockade': return this.checkBlockade(cellId);
      case 'teleport': return this.checkTeleport(cellId);
      case 'drift': return this.applyDrift(layerNumber);
      case 'collapse': return this.checkCollapse(cellId);
      case 'protocol': return this.checkProtocol(cellId);
      default: return { type: 'none' };
    }
  }

  /**
   * L1: 连续通过W区 → 移动步数+1
   */
  private checkAcceleration(cellId: string): MechanicEffectResult {
    const cellZone = this.getCellZone(cellId);

    if (cellZone === 'W') {
      this.state.wStreakCount++;
      
      if (this.state.wStreakCount >= 3) {
        this.state.bonusSteps += 1;
        this.state.wStreakCount = 0; // 重置计数
        return {
          type: 'bonus_steps',
          amount: 1,
          message: '扩散加速! 连续通过3个W区,移动步数+1',
        };
      }

      return { type: 'streak_progress', current: this.state.wStreakCount, target: 3 };
    } else {
      // 非W区,重置连续计数
      if (this.state.wStreakCount > 0) {
        this.state.wStreakCount = 0;
        return { type: 'streak_reset' };
      }
      return { type: 'none' };
    }
  }

  /**
   * L2: 掷骰≥4 → 可跳至内环任意格
   */
  private checkJumpOpportunity(cellId: string): MechanicEffectResult {
    const cellType = this.getCellType(cellId);
    
    // 在机会格时检查
    if (cellType === 'opportunity') {
      // 这个检查在TowerGameEngine的dice_result阶段调用
      // 如果掷骰结果≥4,返回跳跃选项
      const diceResult = this.engine.getLatestDiceResult();
      if (diceResult && diceResult.value >= 4) {
        const innerRingCells = this.getInnerRingCells();
        return {
          type: 'jump_available',
          targetCells: innerRingCells,
          message: '掷骰≥4! 你可以跳跃到内环任意格子',
        };
      }
    }
    return { type: 'none' };
  }

  /**
   * L3: 强制按圈层顺序通过(外→中→内)
   */
  private checkSequenceProgress(cellId: string): MechanicEffectResult {
    const cellZone = this.getCellZone(cellId);
    const required = this.state.currentRequiredRing;

    if (cellZone === required) {
      this.advanceToNextRing();
      return {
        type: 'sequence_progress',
        completedRing: required,
        nextRing: this.state.currentRequiredRing,
      };
    } else if (this.isInnerRing(cellZone, required)) {
      // 试图跳过当前圈层 → 强制返回外圈入口
      return {
        type: 'sequence_violation',
        message: '必须从外圈开始! 你被送回外圈入口',
        returnToCell: this.getOuterRingEntrance(),
      };
    }

    return { type: 'none' };
  }

  private advanceToNextRing() {
    switch (this.state.currentRequiredRing) {
      case 'outer': this.state.currentRequiredRing = 'mid'; break;
      case 'mid': this.state.currentRequiredRing = 'core'; break;
      case 'core': this.state.sequenceCompletedRings = 3; break;
    }
  }

  /**
   * L5: 同一分支停留>2回合 → 扣3-8技术值
   */
  private checkBlockade(cellId: string): MechanicEffectResult {
    const branch = this.getCellBranch(cellId);
    if (!branch) return { type: 'none' };

    const currentCount = this.state.branchStayCounts.get(branch) ?? 0;
    const newCount = currentCount + 1;
    this.state.branchStayCounts.set(branch, newCount);

    if (newCount > 2) {
      const penalty = 3 + Math.floor(Math.random() * 6); // 3-8
      this.state.branchStayCounts.set(branch, 0); // 重置
      return {
        type: 'blockade_penalty',
        amount: penalty,
        message: `流水线阻塞! 在分支${branch}停留过久,扣除${penalty}技术值`,
      };
    }

    return { type: 'blockade_warning', turnsLeft: 2 - newCount };
  }

  /**
   * L6: 移动至相邻蜂窝有20%概率迷路(随机传送)
   */
  private checkTeleport(cellId: string): MechanicEffectResult {
    if (this.state.teleportCooldown > 0) {
      this.state.teleportCooldown--;
      return { type: 'none' };
    }

    if (Math.random() < 0.20) {
      const nearbyCells = this.getNearbyHexCells(cellId);
      if (nearbyCells.length > 0) {
        const target = nearbyCells[Math.floor(Math.random() * nearbyCells.length)];
        this.state.lastTeleportCell = cellId;
        this.state.teleportCooldown = 2; // 2回合冷却
        return {
          type: 'teleport_triggered',
          from: cellId,
          to: target,
          message: '信号干扰! 你迷路了,被传送到附近格子',
        };
      }
    }

    return { type: 'none' };
  }

  /**
   * L7: 每回合开始所有非固定格坐标±1随机偏移
   */
  private applyDrift(layerNumber: number): MechanicEffectResult {
    const nonFixedCells = this.getNonFixedCells(layerNumber);
    const driftChanges = new Map<string, { dx: number; dy: number }>();

    for (const cell of nonFixedCells) {
      const dx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random());
      const dy = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random());
      this.state.driftOffsets.set(cell.id, { dx, dy });
      driftChanges.set(cell.id, { dx, dy });
    }

    return {
      type: 'drift_applied',
      changes: driftChanges,
      message: '云端漂移! 所有非固定格坐标发生偏移',
    };
  }

  /**
   * L8: 进入特定机会格随机锁定/解锁隐藏路径
   */
  private checkCollapse(cellId: string): MechanicEffectResult {
    const cellType = this.getCellType(cellId);
    
    if (cellType === 'opportunity' || cellType === 'chance') {
      if (Math.random() < 0.5) {
        // 锁定路径
        const collapsiblePaths = this.getCollapsiblePaths();
        if (collapsiblePaths.length > 0) {
          const pathToCollapse = collapsiblePaths[Math.floor(Math.random() * collapsiblePaths.length)];
          this.state.collapsedPaths.add(pathToCollapse);
          return {
            type: 'path_collapsed',
            pathId: pathToCollapse,
            message: '观测坍缩! 一条路径被锁定,暂时无法通行',
          };
        }
      } else {
        // 解锁路径
        if (this.state.collapsedPaths.size > 0) {
          const paths = Array.from(this.state.collapsedPaths);
          const pathToReveal = paths[Math.floor(Math.random() * paths.length)];
          this.state.collapsedPaths.delete(pathToReveal);
          this.state.revealedPaths.add(pathToReveal);
          return {
            type: 'path_revealed',
            pathId: pathToReveal,
            message: '观测坍缩! 一条隐藏路径被揭示',
          };
        }
      }
    }

    return { type: 'none' };
  }

  /**
   * L9: 进入CORE区域必须按特定顺序踩格,否则遣返起点
   */
  private checkProtocol(cellId: string): MechanicEffectResult {
    const cellZone = this.getCellZone(cellId);

    if (cellZone === 'CORE') {
      const expectedCellId = this.getExpectedProtocolCell(this.state.protocolStep);

      if (cellId === expectedCellId) {
        this.state.protocolStep++;
        return {
          type: 'protocol_progress',
          currentStep: this.state.protocolStep,
          totalSteps: 3, // CORE_0 → CORE_1 → CORE_2
        };
      } else {
        this.state.protocolViolations++;
        return {
          type: 'protocol_violation',
          message: '殿堂礼仪! 你未按顺序进入CORE区域,被遣返回起点',
          returnToCell: 'G0', // 返回L9起点
        };
      }
    }

    return { type: 'none' };
  }

  /**
   * 回合开始时调用 — 执行L7漂移和清理
   */
  onTurnStart(layerNumber: number): MechanicEffectResult {
    if (layerNumber === 7) {
      return this.applyDrift(layerNumber);
    }
    return { type: 'none' };
  }

  /**
   * 重置机制状态(新游戏/换层时)
   */
  reset(layerNumber: number) {
    this.state = this.createInitialState();
  }

  /** 获取当前机制状态(供MechanicVisualizer使用) */
  getState(): MechanicState {
    return { ...this.state };
  }

  // ==================== 辅助方法 ====================

  private createInitialState(): MechanicState {
    return {
      wStreakCount: 0,
      bonusSteps: 0,
      sequenceCompletedRings: 0,
      currentRequiredRing: 'outer',
      visitedDistricts: new Set(),
      pendingEvents: [],
      branchStayCounts: new Map(),
      teleportCooldown: 0,
      lastTeleportCell: null,
      driftOffsets: new Map(),
      collapsedPaths: new Set(),
      revealedPaths: new Set(),
      protocolStep: 0,
      protocolViolations: 0,
    };
  }

  private getMechanicType(layerNumber: number): string {
    const map: Record<number, string> = {
      1: 'acceleration', 2: 'jump', 3: 'sequence', 4: 'event',
      5: 'blockade', 6: 'teleport', 7: 'drift', 8: 'collapse', 9: 'protocol',
    };
    return map[layerNumber] ?? '';
  }

  // 这些方法需要从topology数据获取
  private getCellZone(_cellId: string): string { return ''; }
  private getCellType(_cellId: string): string { return ''; }
  private getCellBranch(_cellId: string): string | null { return null; }
  private getInnerRingCells(): string[] { return []; }
  private getOuterRingEntrance(): string { return ''; }
  private getNearbyHexCells(_cellId: string): string[] { return []; }
  private getNonFixedCells(_layerNumber: number): Array<{ id: string }> { return []; }
  private getCollapsiblePaths(): string[] { return []; }
  private getExpectedProtocolCell(_step: number): string { return ''; }
  private isInnerRing(_zone: string, _required: string): boolean { return false; }
}

// ==================== 返回类型定义 ====================

export type MechanicEffectResult =
  | { type: 'none' }
  | { type: 'bonus_steps'; amount: number; message: string }
  | { type: 'streak_progress'; current: number; target: number }
  | { type: 'streak_reset' }
  | { type: 'jump_available'; targetCells: string[]; message: string }
  | { type: 'sequence_progress'; completedRing: string; nextRing: string }
  | { type: 'sequence_violation'; message: string; returnToCell: string }
  | { type: 'blockade_penalty'; amount: number; message: string }
  | { type: 'blockade_warning'; turnsLeft: number }
  | { type: 'teleport_triggered'; from: string; to: string; message: string }
  | { type: 'drift_applied'; changes: Map<string, { dx: number; dy: number }>; message: string }
  | { type: 'path_collapsed'; pathId: string; message: string }
  | { type: 'path_revealed'; pathId: string; message: string }
  | { type: 'protocol_progress'; currentStep: number; totalSteps: number }
  | { type: 'protocol_violation'; message: string; returnToCell: string }
  | { type: 'district_event'; district: string; event: string; message: string };
```

### Task B2: ★★☆ P0 — ZoneEffectResolver 区域效果解析器

**新建文件**: `src/tower-mode/engine/ZoneEffectResolver.ts`

```typescript
/**
 * ZoneEffectResolver — 处理6种Zone类型的被动效果
 * 
 * W(虚弱): 进入时骰子-1
 * N(知识): 进入时可获取随机书籍/信息
 * I(反转): 地图倒置(视觉效果+移动逻辑反转)
 * P(跳过): 进入后跳过下回合
 * S(加速): 进入时下回合骰子+1
 * D(危险): 进入时随机损失资源
 */

import type { TowerGameEngine } from './TowerGameEngine';

export class ZoneEffectResolver {
  private engine: TowerGameEngine;

  constructor(engine: TowerGameEngine) {
    this.engine = engine;
  }

  /**
   * 当玩家进入格子时,检查所在Zone并应用效果
   */
  resolveZoneEffect(cellId: string, zoneId: string): ZoneEffectResult {
    switch (zoneId.toUpperCase()) {
      case 'W': return this.applyWeakZone(cellId);
      case 'N': return this.applyKnowledgeZone(cellId);
      case 'I': return this.applyInvertZone(cellId);
      case 'P': return this.applySkipZone(cellId);
      case 'S': return this.applySpeedZone(cellId);
      case 'D': return this.applyDangerZone(cellId);
      default: return { type: 'none' };
    }
  }

  /**
   * W区(虚弱): 进入时骰子-1
   */
  private applyWeakZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'dice_penalty',
      amount: -1,
      message: '虚弱区域! 下次掷骰-1',
      duration: 'next_roll',
    };
  }

  /**
   * N区(知识): 进入时可获取随机书籍
   */
  private applyKnowledgeZone(_cellId: string): ZoneEffectResult {
    const books = ['防火墙手册', '加密算法导论', '渗透测试指南', '网络协议分析'];
    const book = books[Math.floor(Math.random() * books.length)];
    return {
      type: 'book_acquired',
      bookName: book,
      computeBonus: 2,
      message: `知识区域! 获得书籍「${book}」,算力+2`,
    };
  }

  /**
   * I区(反转): 地图倒置
   */
  private applyInvertZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'map_inverted',
      duration: 'while_in_zone',
      message: '反转区域! 地图上下颠倒,移动方向反转',
    };
  }

  /**
   * P区(跳过): 进入后跳过下回合
   */
  private applySkipZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'skip_next_turn',
      message: '跳过区域! 你的下回合将被跳过',
    };
  }

  /**
   * S区(加速): 进入时下回合骰子+1
   */
  private applySpeedZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'dice_bonus',
      amount: 1,
      message: '加速区域! 下次掷骰+1',
      duration: 'next_roll',
    };
  }

  /**
   * D区(危险): 进入时随机损失3-8技术值
   */
  private applyDangerZone(_cellId: string): ZoneEffectResult {
    const loss = 3 + Math.floor(Math.random() * 6);
    return {
      type: 'resource_loss',
      resourceType: 'tech',
      amount: loss,
      message: `危险区域! 随机损失${loss}技术值`,
    };
  }
}

export type ZoneEffectResult =
  | { type: 'none' }
  | { type: 'dice_penalty'; amount: number; message: string; duration: string }
  | { type: 'book_acquired'; bookName: string; computeBonus: number; message: string }
  | { type: 'map_inverted'; duration: string; message: string }
  | { type: 'skip_next_turn'; message: string }
  | { type: 'dice_bonus'; amount: number; message: string; duration: string }
  | { type: 'resource_loss'; resourceType: string; amount: number; message: string };
```

### Task B3: ★★☆ P1 — TowerGameEngine 集成机制引擎

**修改文件**: `src/tower-mode/engine/TowerGameEngine.ts`

在TowerGameEngine中集成MechanicEffectEngine和ZoneEffectResolver:

```typescript
// 在TowerGameEngine构造函数中初始化:
import { MechanicEffectEngine } from './MechanicEffectEngine';
import { ZoneEffectResolver } from './ZoneEffectResolver';

// 添加属性:
private mechanicEngine: MechanicEffectEngine;
private zoneResolver: ZoneEffectResolver;

constructor(eventBus: TypedEventBus<TowerEventType>) {
  // ... 原有初始化
  this.mechanicEngine = new MechanicEffectEngine(this);
  this.zoneResolver = new ZoneEffectResolver(this);
}

// 在onCellArrived方法中调用机制检查:
private onCellArrived(cellId: string) {
  // ... 原有到达逻辑

  // 1. 检查Zone效果
  const cellZone = this.getCellZone(cellId);
  const zoneResult = this.zoneResolver.resolveZoneEffect(cellId, cellZone);
  if (zoneResult.type !== 'none') {
    this.applyZoneResult(zoneResult);
    this.eventBus.emit('zone:effect', zoneResult);
  }

  // 2. 检查机制效果
  const mechanicResult = this.mechanicEngine.onCellArrived(cellId, this.currentLayer);
  if (mechanicResult.type !== 'none') {
    this.applyMechanicResult(mechanicResult);
    this.eventBus.emit('mechanic:effect', mechanicResult);
  }
}

// 在onTurnStart方法中调用L7漂移:
private onTurnStart() {
  const driftResult = this.mechanicEngine.onTurnStart(this.currentLayer);
  if (driftResult.type !== 'none') {
    this.eventBus.emit('mechanic:drift', driftResult);
  }
}

// 效果应用方法:
private applyZoneResult(result: ZoneEffectResult) {
  switch (result.type) {
    case 'dice_penalty':
      this.nextDiceModifier = (this.nextDiceModifier ?? 0) + result.amount;
      break;
    case 'book_acquired':
      this.resources.compute += result.computeBonus;
      this.inventory.books.push(result.bookName);
      break;
    case 'skip_next_turn':
      this.skipNextTurn = true;
      break;
    case 'dice_bonus':
      this.nextDiceModifier = (this.nextDiceModifier ?? 0) + result.amount;
      break;
    case 'resource_loss':
      if (result.resourceType === 'tech') {
        this.resources.tech = Math.max(0, this.resources.tech - result.amount);
      }
      break;
  }
}

private applyMechanicResult(result: MechanicEffectResult) {
  switch (result.type) {
    case 'bonus_steps':
      this.pendingSteps += result.amount;
      break;
    case 'blockade_penalty':
      this.resources.tech = Math.max(0, this.resources.tech - result.amount);
      break;
    case 'teleport_triggered':
      this.currentCellId = result.to;
      break;
    case 'protocol_violation':
      this.currentCellId = result.returnToCell;
      break;
    case 'sequence_violation':
      this.currentCellId = result.returnToCell;
      break;
    // ... 其他效果
  }
}
```

### Task B4: ★☆☆ P2 — 机制引擎单元测试

**新建文件**: `src/tower-mode/__tests__/engine/MechanicEffectEngine.test.ts`

```typescript
import { MechanicEffectEngine } from '../../engine/MechanicEffectEngine';

describe('MechanicEffectEngine', () => {
  describe('L1: 扩散加速', () => {
    it('连续通过3个W区应该获得步数+1', () => {
      // 模拟连续3次到达W区格子
      // 验证bonus_steps效果
    });

    it('非W区应该重置连续计数', () => {
      // 到达2个W区 → 到达N区 → 验证计数归零
    });
  });

  describe('L3: 层层解锁', () => {
    it('按外→中→内顺序通过应该推进进度', () => {
      // 验证sequence_progress效果
    });

    it('跳过圈层应该被送回入口', () => {
      // 试图从outer直接进入core → 验证sequence_violation
    });
  });

  describe('L5: 流水线阻塞', () => {
    it('停留超过2回合应该扣技术值', () => {
      // 在同分支到达3次 → 验证blockade_penalty
    });
  });

  describe('L9: 殿堂礼仪', () => {
    it('按顺序通过CORE格子应该推进进度', () => {
      // CORE_0 → CORE_1 → CORE_2 → 验证protocol_progress
    });

    it('不按顺序应该被遣返起点', () => {
      // 直接进入CORE_2 → 验证protocol_violation + returnToCell
    });
  });
});
```

---

## 第十一轮B组改动总览

| 任务 | 优先级 | 改动内容 | 预期效果 |
|------|--------|---------|---------|
| **B1** | P0 | MechanicEffectEngine机制引擎 | 9种机制有实际游戏规则 |
| **B2** | P0 | ZoneEffectResolver区域效果 | W/N/I/P/S/D效果在游戏中执行 |
| **B3** | P1 | TowerGameEngine集成 | 机制和区域效果接入游戏循环 |
| **B4** | P2 | 单元测试 | 机制逻辑正确性验证 |

## 验收标准

1. ✅ L1连续通过3个W区后,下一次移动确实多1步
2. ✅ L3按outer→mid→core顺序通过,不按顺序会被送回
3. ✅ L5在同分支停留3回合,确实扣3-8技术值
4. ✅ L7每回合格子坐标确实发生偏移(渲染可见)
5. ✅ L9未按顺序进入CORE,玩家确实被送回G0
6. ✅ W区掷骰确实-1
7. ✅ N区获得书籍且算力+2
8. ✅ S区掷骰确实+1
9. ✅ D区确实损失技术值
10. ✅ MechanicEffectEngine单元测试全部通过
