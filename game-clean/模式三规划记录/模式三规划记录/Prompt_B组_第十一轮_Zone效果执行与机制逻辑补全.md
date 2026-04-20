# B组第十一轮 — Zone效果执行与机制逻辑补全

## 🔴 核心问题

**原始设想要求6种Zone效果(W/N/I/P/S/D)在游戏中执行，9种机制有实际游戏规则。当前状态：Zone仅有zoneId标记无效果，机制仅有可视化装饰无逻辑。**

这是**第二大差距**——玩家进入不同区域感受不到任何区别。

## 🎯 本轮目标

**让Zone效果和机制逻辑在游戏中真正生效**，从"看得见"变成"玩得到"。

---

## 任务详情

### Task B1: ★★★ P0 — ZoneEffectResolver 区域效果解析器

**新建文件**: `src/tower-mode/engine/ZoneEffectResolver.ts`

```typescript
/**
 * ZoneEffectResolver — 处理6种Zone类型的被动效果
 * 
 * 原始设想(文件一)要求:
 * - W(虚弱): 进入时骰子-1, 红色区域
 * - N(知识): 随机书籍+信息+2算力+2, 蓝色区域
 * - I(反转): 地图倒置, 紫色区域
 * - P(跳过): 跳过回合, 黄色区域
 * - S(加速): 额外骰子, 绿色区域
 * - D(危险): 随机损失资源, 深红色区域
 */

import type { TowerGameEngine } from './TowerGameEngine';

export interface ZoneEffectResult {
  type: ZoneEffectType;
  value: number;
  message: string;
  duration: 'instant' | 'next_roll' | 'while_in_zone' | 'next_turn';
  zoneId: string;
}

export type ZoneEffectType =
  | 'dice_penalty'     // W: 骰子-1
  | 'book_acquired'    // N: 获得书籍+算力
  | 'map_inverted'     // I: 地图倒置
  | 'skip_turn'        // P: 跳过回合
  | 'dice_bonus'       // S: 骰子+1
  | 'resource_loss'    // D: 随机损失
  | 'none';

export class ZoneEffectResolver {
  private engine: TowerGameEngine;

  constructor(engine: TowerGameEngine) {
    this.engine = engine;
  }

  /**
   * 当玩家进入格子时,检查所在Zone并应用效果
   */
  resolve(cellId: string, zoneId: string | undefined): ZoneEffectResult {
    if (!zoneId) return { type: 'none', value: 0, message: '', duration: 'instant', zoneId: '' };

    switch (zoneId.toUpperCase()) {
      case 'W': return this.applyWeakZone(zoneId);
      case 'N': return this.applyKnowledgeZone(zoneId);
      case 'I': return this.applyInvertZone(zoneId);
      case 'P': return this.applySkipZone(zoneId);
      case 'S': return this.applySpeedZone(zoneId);
      case 'D': return this.applyDangerZone(zoneId);
      default: return { type: 'none', value: 0, message: '', duration: 'instant', zoneId };
    }
  }

  /**
   * W区(虚弱): 进入时骰子-1
   */
  private applyWeakZone(zoneId: string): ZoneEffectResult {
    return {
      type: 'dice_penalty',
      value: -1,
      message: `虚弱区域(${zoneId})! 下次掷骰-1`,
      duration: 'next_roll',
      zoneId,
    };
  }

  /**
   * N区(知识): 获得随机书籍,算力+2
   */
  private applyKnowledgeZone(zoneId: string): ZoneEffectResult {
    const books = ['防火墙手册', '加密算法导论', '渗透测试指南', '网络协议分析', '漏洞挖掘技巧'];
    const book = books[Math.floor(Math.random() * books.length)];
    return {
      type: 'book_acquired',
      value: 2,
      message: `知识区域(${zoneId})! 获得书籍「${book}」,算力+2`,
      duration: 'instant',
      zoneId,
    };
  }

  /**
   * I区(反转): 地图上下倒置
   */
  private applyInvertZone(zoneId: string): ZoneEffectResult {
    return {
      type: 'map_inverted',
      value: 0,
      message: `反转区域(${zoneId})! 地图上下颠倒,移动方向反转`,
      duration: 'while_in_zone',
      zoneId,
    };
  }

  /**
   * P区(跳过): 跳过下回合
   */
  private applySkipZone(zoneId: string): ZoneEffectResult {
    return {
      type: 'skip_turn',
      value: 1,
      message: `跳过区域(${zoneId})! 你的下回合将被跳过`,
      duration: 'next_turn',
      zoneId,
    };
  }

  /**
   * S区(加速): 下次掷骰+1
   */
  private applySpeedZone(zoneId: string): ZoneEffectResult {
    return {
      type: 'dice_bonus',
      value: 1,
      message: `加速区域(${zoneId})! 下次掷骰+1`,
      duration: 'next_roll',
      zoneId,
    };
  }

  /**
   * D区(危险): 随机损失3-8技术值
   */
  private applyDangerZone(zoneId: string): ZoneEffectResult {
    const loss = 3 + Math.floor(Math.random() * 6); // 3-8
    return {
      type: 'resource_loss',
      value: loss,
      message: `危险区域(${zoneId})! 随机损失${loss}技术值`,
      duration: 'instant',
      zoneId,
    };
  }
}
```

### Task B2: ★★★ P0 — MechanicEffectEngine 机制效果引擎

**新建文件**: `src/tower-mode/engine/MechanicEffectEngine.ts`

```typescript
/**
 * MechanicEffectEngine — 处理9种机制的实际游戏规则
 * 
 * 原始设想(文件二)要求:
 * - L1: 连续通过3个W区→移动步数+1
 * - L2: 特定机会格掷骰≥4→可跳至内环任意格
 * - L3: 需按圈层顺序通过(外→中→内)
 * - L4: 进入新街区首格触发街区特色事件
 * - L5: 在同一分支停留>2回合→扣3-8技术值
 * - L6: 移动至相邻蜂窝有20%概率迷路
 * - L7: 每回合开始所有非固定格坐标±1随机偏移
 * - L8: 进入特定机会格随机锁定/解锁隐藏路径
 * - L9: 进入CORE区域必须按特定顺序踩格,否则遣返起点
 */

import type { TowerGameEngine } from './TowerGameEngine';

export interface MechanicState {
  // L1
  wStreakCount: number;
  bonusSteps: number;

  // L3
  currentRequiredRing: 'outer' | 'mid' | 'core';
  sequenceCompleted: boolean;

  // L4
  visitedDistricts: Set<string>;
  pendingEvents: Array<{ district: string; cellId: string }>;

  // L5
  branchStayCounts: Map<string, number>;

  // L6
  teleportCooldown: number;

  // L7
  driftOffsets: Map<string, { dx: number; dy: number }>;

  // L8
  collapsedPaths: Set<string>;
  revealedPaths: Set<string>;

  // L9
  protocolStep: number;
  protocolViolations: number;
}

export interface MechanicEffectResult {
  type: MechanicEffectType;
  message: string;
  data?: Record<string, any>;
}

export type MechanicEffectType =
  | 'none'
  | 'bonus_steps'           // L1: 步数+1
  | 'streak_progress'       // L1: W区连续进度
  | 'streak_reset'          // L1: 连续计数重置
  | 'jump_available'        // L2: 可跳跃
  | 'sequence_progress'     // L3: 圈层推进
  | 'sequence_violation'    // L3: 违反顺序
  | 'district_event'        // L4: 街区事件触发
  | 'blockade_penalty'      // L5: 停留惩罚
  | 'blockade_warning'      // L5: 停留警告
  | 'teleport_triggered'    // L6: 迷路传送
  | 'drift_applied'         // L7: 坐标偏移
  | 'path_collapsed'        // L8: 路径锁定
  | 'path_revealed'         // L8: 路径揭示
  | 'protocol_progress'     // L9: 礼仪推进
  | 'protocol_violation';   // L9: 违反礼仪(遣返)

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
    switch (layerNumber) {
      case 1: return this.checkL1Acceleration(cellId);
      case 2: return this.checkL2Jump(cellId);
      case 3: return this.checkL3Sequence(cellId);
      case 4: return this.checkL4DistrictEvent(cellId);
      case 5: return this.checkL5Blockade(cellId);
      case 6: return this.checkL6Teleport(cellId);
      case 7: return { type: 'none', message: '' }; // L7在turnStart处理
      case 8: return this.checkL8Collapse(cellId);
      case 9: return this.checkL9Protocol(cellId);
      default: return { type: 'none', message: '' };
    }
  }

  /**
   * 回合开始时调用 — 处理L7漂移
   */
  onTurnStart(layerNumber: number): MechanicEffectResult {
    if (layerNumber === 7) {
      return this.applyL7Drift();
    }
    return { type: 'none', message: '' };
  }

  // ==================== L1: 扩散加速 ====================

  private checkL1Acceleration(cellId: string): MechanicEffectResult {
    const zoneId = this.getCellZone(cellId);

    if (zoneId === 'W') {
      this.state.wStreakCount++;

      if (this.state.wStreakCount >= 3) {
        this.state.bonusSteps += 1;
        this.state.wStreakCount = 0;
        return {
          type: 'bonus_steps',
          message: '扩散加速! 连续通过3个W区,移动步数+1',
          data: { bonusSteps: this.state.bonusSteps },
        };
      }

      return {
        type: 'streak_progress',
        message: `W区连续通过 ${this.state.wStreakCount}/3`,
        data: { current: this.state.wStreakCount, target: 3 },
      };
    } else {
      if (this.state.wStreakCount > 0) {
        this.state.wStreakCount = 0;
        return { type: 'streak_reset', message: '非W区,连续计数重置', data: {} };
      }
      return { type: 'none', message: '' };
    }
  }

  // ==================== L2: 跨环跳跃 ====================

  private checkL2Jump(cellId: string): MechanicEffectResult {
    const cellType = this.getCellType(cellId);

    if (cellType === 'opportunity' || cellType === 'chance') {
      const diceResult = this.engine.getLatestDiceResult();
      if (diceResult && diceResult.value >= 4) {
        const innerRingCells = this.getInnerRingCells(2);
        return {
          type: 'jump_available',
          message: '掷骰≥4! 你可以跳跃到内环任意格子',
          data: { targetCells: innerRingCells },
        };
      }
    }
    return { type: 'none', message: '' };
  }

  // ==================== L3: 层层解锁 ====================

  private checkL3Sequence(cellId: string): MechanicEffectResult {
    const cellZone = this.getZoneGroup(cellId);

    if (cellZone === this.state.currentRequiredRing) {
      // 按顺序通过,推进到下一环
      const completed = this.state.currentRequiredRing;
      this.advanceRing();
      return {
        type: 'sequence_progress',
        message: `通过${completed}环! 现在进入${this.state.currentRequiredRing}环`,
        data: { completed, next: this.state.currentRequiredRing },
      };
    } else if (this.isInnerRing(cellZone, this.state.currentRequiredRing)) {
      // 试图跳过当前环 → 遣返
      return {
        type: 'sequence_violation',
        message: `必须从${this.state.currentRequiredRing}环开始! 你被送回入口`,
        data: { returnToCell: this.getRingEntrance(this.state.currentRequiredRing) },
      };
    }

    return { type: 'none', message: '' };
  }

  private advanceRing() {
    switch (this.state.currentRequiredRing) {
      case 'outer': this.state.currentRequiredRing = 'mid'; break;
      case 'mid': this.state.currentRequiredRing = 'core'; break;
      case 'core': this.state.sequenceCompleted = true; break;
    }
  }

  private isInnerRing(zone: string, required: string): boolean {
    const order = ['outer', 'mid', 'core'];
    return order.indexOf(zone) > order.indexOf(required);
  }

  // ==================== L4: 街区事件 ====================

  private checkL4DistrictEvent(cellId: string): MechanicEffectResult {
    const district = this.getDistrict(cellId);
    if (!district) return { type: 'none', message: '' };

    if (!this.state.visitedDistricts.has(district)) {
      this.state.visitedDistricts.add(district);
      const event = this.generateDistrictEvent(district);
      return {
        type: 'district_event',
        message: `进入${district}街区! 触发事件: ${event}`,
        data: { district, event },
      };
    }

    return { type: 'none', message: '' };
  }

  private generateDistrictEvent(district: string): string {
    const events: Record<string, string[]> = {
      'NW': ['发现隐藏商店', '遇到黑客挑战', '获得加密文件'],
      'NE': ['系统警报!', '发现漏洞入口', '遭遇陷阱'],
      'SW': ['地下网络入口', '废弃服务器室', '数据碎片'],
      'SE': ['监控中心', '防火墙核心', '密钥保管室'],
    };
    const distEvents = events[district] ?? ['未知事件'];
    return distEvents[Math.floor(Math.random() * distEvents.length)];
  }

  // ==================== L5: 流水线阻塞 ====================

  private checkL5Blockade(cellId: string): MechanicEffectResult {
    const branch = this.getBranch(cellId);
    if (!branch) return { type: 'none', message: '' };

    const currentCount = this.state.branchStayCounts.get(branch) ?? 0;
    const newCount = currentCount + 1;
    this.state.branchStayCounts.set(branch, newCount);

    if (newCount > 2) {
      const penalty = 3 + Math.floor(Math.random() * 6); // 3-8
      this.state.branchStayCounts.set(branch, 0);
      return {
        type: 'blockade_penalty',
        message: `流水线阻塞! 在${branch}分支停留过久,扣除${penalty}技术值`,
        data: { penalty, branch },
      };
    }

    return {
      type: 'blockade_warning',
      message: `流水线警告! 在${branch}分支已停留${newCount}回合`,
      data: { turnsLeft: 2 - newCount, branch },
    };
  }

  // ==================== L6: 信号切换(迷路) ====================

  private checkL6Teleport(cellId: string): MechanicEffectResult {
    if (this.state.teleportCooldown > 0) {
      this.state.teleportCooldown--;
      return { type: 'none', message: '' };
    }

    if (Math.random() < 0.20) {
      const nearbyCells = this.getNearbyHexCells(cellId);
      if (nearbyCells.length > 0) {
        const target = nearbyCells[Math.floor(Math.random() * nearbyCells.length)];
        this.state.teleportCooldown = 2;
        return {
          type: 'teleport_triggered',
          message: '信号干扰! 你迷路了,被传送到附近格子',
          data: { from: cellId, to: target },
        };
      }
    }

    return { type: 'none', message: '' };
  }

  // ==================== L7: 云端漂移 ====================

  private applyL7Drift(): MechanicEffectResult {
    const nonFixedCells = this.getNonFixedCells(7);
    const changes = new Map<string, { dx: number; dy: number }>();

    for (const cell of nonFixedCells) {
      const dx = (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random());
      const dy = (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random());
      this.state.driftOffsets.set(cell.id, { dx, dy });
      changes.set(cell.id, { dx, dy });
    }

    return {
      type: 'drift_applied',
      message: '云端漂移! 所有非固定格坐标发生偏移',
      data: { changes },
    };
  }

  // ==================== L8: 观测坍缩 ====================

  private checkL8Collapse(cellId: string): MechanicEffectResult {
    const cellType = this.getCellType(cellId);

    if (cellType === 'opportunity' || cellType === 'chance') {
      if (Math.random() < 0.5) {
        // 锁定路径
        const collapsible = this.getCollapsiblePaths(8);
        if (collapsible.length > 0) {
          const path = collapsible[Math.floor(Math.random() * collapsible.length)];
          this.state.collapsedPaths.add(path);
          return {
            type: 'path_collapsed',
            message: '观测坍缩! 一条路径被锁定,暂时无法通行',
            data: { pathId: path },
          };
        }
      } else {
        // 解锁路径
        if (this.state.collapsedPaths.size > 0) {
          const paths = Array.from(this.state.collapsedPaths);
          const path = paths[Math.floor(Math.random() * paths.length)];
          this.state.collapsedPaths.delete(path);
          this.state.revealedPaths.add(path);
          return {
            type: 'path_revealed',
            message: '观测坍缩! 一条隐藏路径被揭示',
            data: { pathId: path },
          };
        }
      }
    }

    return { type: 'none', message: '' };
  }

  // ==================== L9: 殿堂礼仪 ====================

  private checkL9Protocol(cellId: string): MechanicEffectResult {
    const zoneId = this.getCellZone(cellId);

    if (zoneId === 'CORE') {
      const expectedCell = this.getExpectedProtocolCell(this.state.protocolStep);

      if (cellId === expectedCell) {
        this.state.protocolStep++;
        return {
          type: 'protocol_progress',
          message: `殿堂礼仪! 正确进入CORE区域步骤${this.state.protocolStep}`,
          data: { step: this.state.protocolStep, total: 3 },
        };
      } else {
        this.state.protocolViolations++;
        return {
          type: 'protocol_violation',
          message: '殿堂礼仪! 未按顺序进入CORE区域,被遣返回起点',
          data: { returnToCell: 'G0', violation: this.state.protocolViolations },
        };
      }
    }

    return { type: 'none', message: '' };
  }

  // ==================== 状态管理 ====================

  reset() {
    this.state = this.createInitialState();
  }

  getState(): MechanicState {
    return { ...this.state };
  }

  private createInitialState(): MechanicState {
    return {
      wStreakCount: 0,
      bonusSteps: 0,
      currentRequiredRing: 'outer',
      sequenceCompleted: false,
      visitedDistricts: new Set(),
      pendingEvents: [],
      branchStayCounts: new Map(),
      teleportCooldown: 0,
      driftOffsets: new Map(),
      collapsedPaths: new Set(),
      revealedPaths: new Set(),
      protocolStep: 0,
      protocolViolations: 0,
    };
  }

  // ==================== 辅助方法(需从topology数据获取) ====================

  private getCellZone(_cellId: string): string { return ''; }
  private getCellType(_cellId: string): string { return ''; }
  private getZoneGroup(_cellId: string): string { return ''; }
  private getDistrict(_cellId: string): string | null { return null; }
  private getBranch(_cellId: string): string | null { return null; }
  private getInnerRingCells(_layer: number): string[] { return []; }
  private getRingEntrance(_ring: string): string { return ''; }
  private getNearbyHexCells(_cellId: string): string[] { return []; }
  private getNonFixedCells(_layer: number): Array<{ id: string }> { return []; }
  private getCollapsiblePaths(_layer: number): string[] { return []; }
  private getExpectedProtocolCell(_step: number): string { return ''; }
}
```

### Task B3: ★★☆ P0 — TowerGameEngine 集成Zone和机制引擎

**修改文件**: `src/tower-mode/engine/TowerGameEngine.ts`

```typescript
// 在构造函数中初始化:
import { ZoneEffectResolver } from './ZoneEffectResolver';
import { MechanicEffectEngine } from './MechanicEffectEngine';

// 添加属性:
private zoneResolver: ZoneEffectResolver;
private mechanicEngine: MechanicEffectEngine;
private pendingDiceModifier: number = 0;
private skipNextTurn: boolean = false;

constructor(eventBus: TypedEventBus<TowerEventType>) {
  // ... 原有初始化
  this.zoneResolver = new ZoneEffectResolver(this);
  this.mechanicEngine = new MechanicEffectEngine(this);
}

// 在onCellArrived中集成:
private onCellArrived(cellId: string) {
  // 1. 检查Zone效果
  const cellZone = this.getCellZone(cellId);
  const zoneResult = this.zoneResolver.resolve(cellId, cellZone);
  if (zoneResult.type !== 'none') {
    this.applyZoneResult(zoneResult);
    this.eventBus.emit('zone:effect', {
      zoneId: cellZone,
      effect: zoneResult.type,
      message: zoneResult.message,
    });
  }

  // 2. 检查机制效果
  const mechanicResult = this.mechanicEngine.onCellArrived(cellId, this.currentLayer);
  if (mechanicResult.type !== 'none') {
    this.applyMechanicResult(mechanicResult);
    this.eventBus.emit('mechanic:effect', mechanicResult);
  }
}

// 在onTurnStart中集成:
private onTurnStart() {
  const driftResult = this.mechanicEngine.onTurnStart(this.currentLayer);
  if (driftResult.type !== 'none') {
    this.applyDriftResult(driftResult);
    this.eventBus.emit('mechanic:drift', driftResult);
  }

  // 检查是否跳过回合
  if (this.skipNextTurn) {
    this.skipNextTurn = false;
    this.eventBus.emit('turn:skipped', { message: '你的回合被跳过!' });
    this.endTurn();
    return;
  }
}

// 掷骰时应用modifier:
rollDice(): DiceResult {
  const base = Math.floor(Math.random() * 6) + 1;
  const modifier = this.pendingDiceModifier;
  this.pendingDiceModifier = 0;
  const final = Math.max(1, Math.min(6, base + modifier));

  this.eventBus.emit('dice:result', { base, modifier, final });
  return { value: final, base, modifier };
}

// 应用Zone效果:
private applyZoneResult(result: ZoneEffectResult) {
  switch (result.type) {
    case 'dice_penalty':
    case 'dice_bonus':
      this.pendingDiceModifier += result.value;
      break;
    case 'book_acquired':
      this.resources.compute += result.value;
      // 添加书籍到背包
      break;
    case 'skip_turn':
      this.skipNextTurn = true;
      break;
    case 'resource_loss':
      this.resources.tech = Math.max(0, this.resources.tech - result.value);
      break;
    case 'map_inverted':
      // 触发视觉倒置
      this.eventBus.emit('visual:map_invert', { inverted: true });
      break;
  }
}

// 应用机制效果:
private applyMechanicResult(result: MechanicEffectResult) {
  switch (result.type) {
    case 'bonus_steps':
      this.pendingSteps += (result.data?.bonusSteps ?? 0);
      break;
    case 'blockade_penalty':
      this.resources.tech = Math.max(0, this.resources.tech - (result.data?.penalty ?? 0));
      break;
    case 'teleport_triggered':
      this.currentCellId = result.data?.to ?? this.currentCellId;
      break;
    case 'protocol_violation':
    case 'sequence_violation':
      this.currentCellId = result.data?.returnToCell ?? this.currentCellId;
      break;
  }
}
```

### Task B4: ★☆☆ P1 — 机制引擎单元测试

**新建文件**: `src/tower-mode/__tests__/engine/ZoneEffectResolver.test.ts`
**新建文件**: `src/tower-mode/__tests__/engine/MechanicEffectEngine.test.ts`

```typescript
// ZoneEffectResolver测试
describe('ZoneEffectResolver', () => {
  it('W区应该返回骰子-1', () => {
    const resolver = new ZoneEffectResolver(mockEngine);
    const result = resolver.resolve('L0', 'W');
    expect(result.type).toBe('dice_penalty');
    expect(result.value).toBe(-1);
  });

  it('N区应该返回书籍获取+算力+2', () => {
    const resolver = new ZoneEffectResolver(mockEngine);
    const result = resolver.resolve('L0', 'N');
    expect(result.type).toBe('book_acquired');
    expect(result.value).toBe(2);
  });

  it('S区应该返回骰子+1', () => {
    const resolver = new ZoneEffectResolver(mockEngine);
    const result = resolver.resolve('L0', 'S');
    expect(result.type).toBe('dice_bonus');
    expect(result.value).toBe(1);
  });

  it('D区应该返回随机损失3-8技术值', () => {
    const resolver = new ZoneEffectResolver(mockEngine);
    // 多次测试验证范围
    for (let i = 0; i < 20; i++) {
      const result = resolver.resolve('L0', 'D');
      expect(result.type).toBe('resource_loss');
      expect(result.value).toBeGreaterThanOrEqual(3);
      expect(result.value).toBeLessThanOrEqual(8);
    }
  });
});

// MechanicEffectEngine测试
describe('MechanicEffectEngine', () => {
  describe('L1: 扩散加速', () => {
    it('连续通过3个W区应该获得步数+1', () => {
      // 模拟3次到达W区
      const engine = new MechanicEffectEngine(mockEngine);
      engine.onCellArrived('L0', 1); // W
      engine.onCellArrived('L1', 1); // W
      const result = engine.onCellArrived('L2', 1); // W → 触发
      expect(result.type).toBe('bonus_steps');
    });

    it('非W区应该重置连续计数', () => {
      const engine = new MechanicEffectEngine(mockEngine);
      engine.onCellArrived('L0', 1); // W
      engine.onCellArrived('L3', 1); // 非W → 重置
      // 再连续2个W不应触发
      engine.onCellArrived('L4', 1);
      const result = engine.onCellArrived('L5', 1);
      expect(result.type).not.toBe('bonus_steps');
    });
  });

  describe('L3: 层层解锁', () => {
    it('按outer→mid→core顺序应该正常推进', () => {
      // 验证sequence_progress
    });

    it('跳过outer直接进入mid应该被遣返', () => {
      // 验证sequence_violation + returnToCell
    });
  });

  describe('L9: 殿堂礼仪', () => {
    it('按CORE_0→CORE_1→CORE_2顺序应该正常推进', () => {
      // 验证protocol_progress
    });

    it('直接进入CORE_2应该被遣返G0', () => {
      const result = engine.onCellArrived('CORE_2', 9);
      expect(result.type).toBe('protocol_violation');
      expect(result.data?.returnToCell).toBe('G0');
    });
  });
});
```

---

## 验收标准

- [ ] 进入W区后掷骰子确实-1(可验证)
- [ ] 进入N区后算力+2且显示获得书籍
- [ ] 进入S区后掷骰子确实+1(可验证)
- [ ] 进入D区后确实损失3-8技术值
- [ ] 进入P区后下回合自动跳过
- [ ] L1连续通过3个W区后步数+1
- [ ] L3不按顺序通过被送回对应入口
- [ ] L5在同分支停留3次后确实扣技术值
- [ ] L6移动约20%概率被传送
- [ ] L7每回合格子坐标有可见偏移
- [ ] L9未按顺序进入CORE被遣返G0
- [ ] ZoneEffectResolver测试全部通过
- [ ] MechanicEffectEngine测试全部通过
- [ ] 无TypeScript编译错误
