# 《道高一丈：数字博弈》v11.0 游戏机制与卡牌设计方案

## 文档信息

| 项目 | 内容 |
|------|------|
| **版本** | v11.0 |
| **日期** | 2026-01-30 |
| **目标** | 独立机制系统、7阶段回合、判定卡牌、平衡卡牌库 |
| **状态** | 设计规范 |

---

## 目录

1. [独立机制系统设计](#一独立机制系统设计)
2. [回合阶段重构（7阶段）](#二回合阶段重构7阶段)
3. [判定卡牌机制](#三判定卡牌机制)
4. [卡牌库配置](#四卡牌库配置)
5. [完整卡牌设计](#五完整卡牌设计)
6. [实施规范](#六实施规范)

---

## 一、独立机制系统设计

### 1.1 骰子判定机制（独立系统）

#### 1.1.1 系统定位

骰子判定机制是一个**独立的底层系统**，不预设任何应用场景。卡牌设计时通过引用该机制来定义具体效果。

#### 1.1.2 核心接口

```typescript
// types/diceMechanic.ts

/**
 * 骰子判定难度等级
 * 难度1-5为可成功，难度6为必然失败
 */
export type DiceDifficulty = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 骰子判定结果
 */
export interface DiceRollResult {
  /** 掷出的点数 (1-6) */
  roll: number;
  /** 是否成功 */
  success: boolean;
  /** 大成功判定（点数6且难度≤3） */
  isCriticalSuccess: boolean;
  /** 大失败判定（点数1且难度≥4） */
  isCriticalFailure: boolean;
  /** 与难度的差值（正数表示超过难度） */
  margin: number;
}

/**
 * 骰子判定配置
 * 卡牌通过此配置引用骰子机制
 */
export interface DiceMechanicConfig {
  /** 基础难度 (1-6) */
  baseDifficulty: DiceDifficulty;
  /** 难度修正值（正数降低难度） */
  difficultyModifier?: number;
  /** 是否允许重掷 */
  allowReroll?: boolean;
  /** 重掷次数 */
  rerollCount?: number;
  /** 取最优结果 */
  takeBest?: boolean;
}

/**
 * 骰子判定执行器
 * 纯函数，无副作用
 */
export class DiceMechanic {
  /**
   * 执行骰子判定
   * @param config 判定配置
   * @returns 判定结果
   */
  static roll(config: DiceMechanicConfig): DiceRollResult {
    const roll = Math.floor(Math.random() * 6) + 1;
    const finalDifficulty = Math.max(1, Math.min(6, 
      config.baseDifficulty - (config.difficultyModifier || 0)
    ));
    
    const success = roll > finalDifficulty;
    const margin = roll - finalDifficulty;
    
    return {
      roll,
      success,
      isCriticalSuccess: roll === 6 && finalDifficulty <= 3,
      isCriticalFailure: roll === 1 && finalDifficulty >= 4,
      margin
    };
  }

  /**
   * 获取难度成功率
   */
  static getSuccessRate(difficulty: DiceDifficulty): number {
    const rates: Record<DiceDifficulty, number> = {
      1: 83.33,  // 5/6
      2: 66.67,  // 4/6
      3: 50.00,  // 3/6
      4: 33.33,  // 2/6
      5: 16.67,  // 1/6
      6: 0.00    // 0/6
    };
    return rates[difficulty];
  }

  /**
   * 执行带重掷的判定
   */
  static rollWithReroll(config: DiceMechanicConfig): DiceRollResult {
    const rolls: DiceRollResult[] = [];
    const count = (config.rerollCount || 0) + 1;
    
    for (let i = 0; i < count; i++) {
      rolls.push(this.roll(config));
    }
    
    if (config.takeBest) {
      // 取最优结果（margin最大）
      return rolls.reduce((best, current) => 
        current.margin > best.margin ? current : best
      );
    }
    
    return rolls[0];
  }
}
```

#### 1.1.3 难度等级标准

| 难度 | 失败点数 | 成功率 | 建议应用场景 |
|------|----------|--------|--------------|
| 1 | 1 | 83.3% | 简单判定、基础操作 |
| 2 | 1-2 | 66.7% | 普通判定、常规卡牌 |
| 3 | 1-3 | 50.0% | 困难判定、高级卡牌 |
| 4 | 1-4 | 33.3% | 极难判定、特殊能力 |
| 5 | 1-5 | 16.7% | 极限判定、逆转技能 |
| 6 | 任意 | 0% | 必然失败、剧情事件 |

---

### 1.2 剪刀石头布机制（独立系统）

#### 1.2.1 系统定位

剪刀石头布机制是一个**独立的对抗系统**，不预设任何效果。卡牌通过定义三种结果（平局/赢/输）的具体效果来使用该机制。

#### 1.2.2 核心接口

```typescript
// types/rpsMechanic.ts

/**
 * 剪刀石头布选择
 */
export type RPSChoice = 'scissors' | 'rock' | 'paper';

/**
 * 剪刀石头布结果
 */
export type RPSOutcome = 'win' | 'lose' | 'draw';

/**
 * 剪刀石头布对决结果
 */
export interface RPSDuelResult {
  /** 结果类型 */
  outcome: RPSOutcome;
  /** 获胜方玩家ID（平局时为undefined） */
  winnerId?: string;
  /** 失败方玩家ID（平局时为undefined） */
  loserId?: string;
  /** 双方选择 */
  choices: Record<string, RPSChoice>;
}

/**
 * 剪刀石头布效果定义
 * 卡牌通过定义此接口来使用RPS机制
 */
export interface RPSMechanicConfig {
  /** 选择时间限制（秒） */
  timeLimit: number;
  /** 平局效果 */
  drawEffect: RPSEffect;
  /** 赢方效果 */
  winEffect: RPSEffect;
  /** 输方效果 */
  loseEffect: RPSEffect;
  /** 是否允许延迟响应（看到对方选择后决定） */
  allowDelayedResponse?: boolean;
  /** 延迟时间（秒） */
  delaySeconds?: number;
}

/**
 * RPS效果定义
 */
export interface RPSEffect {
  /** 效果目标 */
  target: 'winner' | 'loser' | 'both' | 'initiator' | 'responder';
  /** 效果类型 */
  type: 'damage' | 'heal' | 'resource_gain' | 'resource_loss' | 'draw' | 'discard' | 'none';
  /** 效果数值 */
  value: number;
  /** 效果描述（用于UI显示） */
  description: string;
}

/**
 * 剪刀石头布执行器
 */
export class RPSMechanic {
  /**
   * 判定胜负
   * @param initiatorChoice 发起方选择
   * @param responderChoice 响应方选择
   * @param initiatorId 发起方ID
   * @param responderId 响应方ID
   */
  static resolve(
    initiatorChoice: RPSChoice,
    responderChoice: RPSChoice,
    initiatorId: string,
    responderId: string
  ): RPSDuelResult {
    // 平局
    if (initiatorChoice === responderChoice) {
      return {
        outcome: 'draw',
        choices: { [initiatorId]: initiatorChoice, [responderId]: responderChoice }
      };
    }

    // 胜负判定
    const winConditions: Record<RPSChoice, RPSChoice> = {
      scissors: 'paper',
      paper: 'rock',
      rock: 'scissors'
    };

    if (winConditions[initiatorChoice] === responderChoice) {
      return {
        outcome: 'win',
        winnerId: initiatorId,
        loserId: responderId,
        choices: { [initiatorId]: initiatorChoice, [responderId]: responderChoice }
      };
    } else {
      return {
        outcome: 'lose',
        winnerId: responderId,
        loserId: initiatorId,
        choices: { [initiatorId]: initiatorChoice, [responderId]: responderChoice }
      };
    }
  }

  /**
   * 获取效果
   * @param result 对决结果
   * @param config 机制配置
   * @param initiatorId 发起方ID
   * @param responderId 响应方ID
   */
  static getEffect(
    result: RPSDuelResult,
    config: RPSMechanicConfig,
    initiatorId: string,
    responderId: string
  ): { playerId: string; effect: RPSEffect }[] {
    const effects: { playerId: string; effect: RPSEffect }[] = [];
    
    let effectToApply: RPSEffect;
    
    switch (result.outcome) {
      case 'draw':
        effectToApply = config.drawEffect;
        break;
      case 'win':
        effectToApply = config.winEffect;
        break;
      case 'lose':
        effectToApply = config.loseEffect;
        break;
    }

    // 根据目标类型应用效果
    const targetMap: Record<string, string> = {
      'initiator': initiatorId,
      'responder': responderId,
      'winner': result.winnerId || initiatorId,
      'loser': result.loserId || responderId
    };

    if (effectToApply.target === 'both') {
      effects.push(
        { playerId: initiatorId, effect: effectToApply },
        { playerId: responderId, effect: effectToApply }
      );
    } else {
      effects.push({
        playerId: targetMap[effectToApply.target],
        effect: effectToApply
      });
    }

    return effects;
  }
}
```

#### 1.2.3 胜负规则

| 发起方 | 响应方 | 结果 | 说明 |
|--------|--------|------|------|
| 剪刀 | 布 | 发起方赢 | 剪刀剪布 |
| 剪刀 | 石头 | 发起方输 | 石头砸剪刀 |
| 石头 | 剪刀 | 发起方赢 | 石头砸剪刀 |
| 石头 | 布 | 发起方输 | 布包石头 |
| 布 | 石头 | 发起方赢 | 布包石头 |
| 布 | 剪刀 | 发起方输 | 剪刀剪布 |
| 相同 | 相同 | 平局 | 双方选择一致 |

---

## 二、回合阶段重构（7阶段）

### 2.1 阶段定义

每个回合必须严格按照以下顺序执行：

```
┌─────────────────────────────────────────────────────────────┐
│                      回合开始 (Turn Start)                   │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 判定阶段 (Judgment Phase)                                │
│     • 执行待处理的判定要求                                   │
│     • 结算判定结果                                           │
│     • 触发"判定后"效果                                       │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 恢复阶段 (Recovery Phase)                                │
│     • 恢复行动点至最大值（默认3点）                          │
│     • 恢复资源值至指定水平                                   │
│     • 结算"恢复时"效果                                       │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 摸牌阶段 (Draw Phase)                                    │
│     • 根据当前回合特性抽牌                                   │
│     • 根据游戏状态条件调整抽牌数量                           │
│     • 结算"摸牌后"效果                                       │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 行动阶段 (Action Phase)                                  │
│     • 从手牌中打出卡牌                                       │
│     • 激活角色技能                                           │
│     • 执行其他行动                                           │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 响应阶段 (Response Phase)                                │
│     • 其他玩家可以响应当前行动                               │
│     • 执行卡牌的即时响应效果                                 │
│     • 进行必要的判定                                         │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  6. 弃牌阶段 (Discard Phase)                                 │
│     • 手牌上限：1张                                          │
│     • 弃置所有超额手牌到弃牌堆                               │
│     • 结算"弃牌后"效果                                       │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  7. 结束阶段 (End Phase)                                     │
│     • 执行结束阶段效果                                       │
│     • 锁定当前回合状态                                       │
│     • 准备进入下一玩家回合                                   │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      回合结束 (Turn End)                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 阶段详细规范

#### 2.2.1 判定阶段 (Judgment Phase)

**功能说明：**
- 处理所有待执行的判定要求
- 判定要求可能来自上回合的延迟效果、卡牌标记等

**流程：**
```typescript
interface JudgmentPhase {
  // 1. 收集所有待处理判定
  pendingJudgments: PendingJudgment[];
  
  // 2. 按优先级排序执行
  executeOrder: 'fifo' | 'lifo' | 'priority';
  
  // 3. 执行判定
  execute(judgment: PendingJudgment): JudgmentResult;
  
  // 4. 结算效果
  resolveEffect(result: JudgmentResult): void;
}
```

**关键规则：**
- 判定阶段**必须**在恢复阶段之前执行
- 多个判定时，按先进先出(FIFO)顺序执行
- 判定结果立即结算，可能触发连锁效果

#### 2.2.2 恢复阶段 (Recovery Phase)

**功能说明：**
- 恢复行动点至最大值
- 恢复资源至指定水平

**标准恢复值：**

| 资源类型 | 攻击方恢复 | 防御方恢复 | 说明 |
|----------|------------|------------|------|
| 行动点 | 3点 | 3点 | 固定值 |
| 算力 | 0点 | 1点 | 防御方优势 |
| 资金 | 0.5点（向上取整） | 1点 | 防御方优势 |
| 信息 | 1点 | 0点 | 攻击方优势 |
| 权限 | 0点 | 0点 | 不自动恢复 |

#### 2.2.3 摸牌阶段 (Draw Phase)

**功能说明：**
- 从牌库抽取卡牌

**标准抽牌数：**
- 基础抽牌：1张
- 手牌少于1张时：抽至1张

**特殊条件调整：**

| 条件 | 效果 |
|------|------|
| 手牌为0 | 额外抽1张（共2张） |
| 处于劣势（资源<3） | 额外抽1张 |
| 有"额外抽牌"标记 | 按标记数量抽牌 |

#### 2.2.4 行动阶段 (Action Phase)

**功能说明：**
- 玩家执行主要行动

**可执行操作：**
1. **打出卡牌** - 消耗行动点，执行卡牌效果
2. **激活技能** - 消耗行动点，执行角色技能
3. **资源转换** - 将一种资源转换为另一种

**行动点消耗：**

| 操作 | 消耗行动点 |
|------|------------|
| 打出普通卡牌 | 1点 |
| 打出高级卡牌 | 2点 |
| 激活角色技能 | 1点 |
| 资源转换 | 1点 |

#### 2.2.5 响应阶段 (Response Phase)

**功能说明：**
- 处理即时响应效果

**响应窗口：**
- 时间限制：10秒
- 可响应次数：每回合最多2次

**响应类型：**
1. **卡牌响应** - 打出带有"响应"标签的卡牌
2. **技能响应** - 使用角色的响应类技能

#### 2.2.6 弃牌阶段 (Discard Phase)

**功能说明：**
- 调整手牌至上限

**关键规则：**
- **手牌上限：1张**
- 必须弃置所有超额手牌
- 弃牌顺序由玩家自行决定

**示例：**
```
当前手牌：3张
手牌上限：1张
必须弃置：2张
保留：1张（玩家自选）
```

#### 2.2.7 结束阶段 (End Phase)

**功能说明：**
- 结算结束效果
- 锁定回合状态

**执行内容：**
1. 结算"结束阶段"触发的卡牌效果
2. 减少持续效果持续时间
3. 清除已过期效果
4. **锁定回合状态**（禁止任何操作）

### 2.3 阶段实现代码

```typescript
// types/turnPhase.ts

export type TurnPhase = 
  | 'judgment'   // 判定阶段
  | 'recovery'   // 恢复阶段
  | 'draw'       // 摸牌阶段
  | 'action'     // 行动阶段
  | 'response'   // 响应阶段
  | 'discard'    // 弃牌阶段
  | 'end';       // 结束阶段

export const PHASE_ORDER: TurnPhase[] = [
  'judgment',
  'recovery',
  'draw',
  'action',
  'response',
  'discard',
  'end'
];

export interface PhaseConfig {
  phase: TurnPhase;
  name: string;
  description: string;
  autoProceed: boolean;      // 是否自动进入下一阶段
  timeLimit?: number;        // 阶段时间限制（秒）
  canUseCards: boolean;      // 是否可以使用卡牌
  canUseSkills: boolean;     // 是否可以使用技能
}

export const PHASE_CONFIGS: Record<TurnPhase, PhaseConfig> = {
  judgment: {
    phase: 'judgment',
    name: '判定阶段',
    description: '执行待处理的判定',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  },
  recovery: {
    phase: 'recovery',
    name: '恢复阶段',
    description: '恢复行动点和资源',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  },
  draw: {
    phase: 'draw',
    name: '摸牌阶段',
    description: '从牌库抽取卡牌',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  },
  action: {
    phase: 'action',
    name: '行动阶段',
    description: '打出卡牌和使用技能',
    autoProceed: false,
    timeLimit: 60,
    canUseCards: true,
    canUseSkills: true
  },
  response: {
    phase: 'response',
    name: '响应阶段',
    description: '响应其他玩家的行动',
    autoProceed: false,
    timeLimit: 10,
    canUseCards: true,
    canUseSkills: true
  },
  discard: {
    phase: 'discard',
    name: '弃牌阶段',
    description: '弃置超额手牌',
    autoProceed: false,
    timeLimit: 15,
    canUseCards: false,
    canUseSkills: false
  },
  end: {
    phase: 'end',
    name: '结束阶段',
    description: '结算结束效果',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  }
};

// engine/turnPhaseEngine.ts

export class TurnPhaseEngine {
  /**
   * 执行阶段
   */
  static executePhase(
    gameState: GameState,
    phase: TurnPhase
  ): GameState {
    switch (phase) {
      case 'judgment':
        return this.executeJudgmentPhase(gameState);
      case 'recovery':
        return this.executeRecoveryPhase(gameState);
      case 'draw':
        return this.executeDrawPhase(gameState);
      case 'action':
        return this.executeActionPhase(gameState);
      case 'response':
        return this.executeResponsePhase(gameState);
      case 'discard':
        return this.executeDiscardPhase(gameState);
      case 'end':
        return this.executeEndPhase(gameState);
      default:
        return gameState;
    }
  }

  /**
   * 判定阶段
   */
  private static executeJudgmentPhase(gameState: GameState): GameState {
    let newState = { ...gameState };
    
    // 获取所有待处理判定
    const pendingJudgments = newState.pendingJudgments || [];
    
    // 按FIFO顺序执行
    for (const judgment of pendingJudgments) {
      const result = DiceMechanic.roll(judgment.config);
      newState = this.resolveJudgmentResult(newState, judgment, result);
    }
    
    // 清空已执行的判定
    newState.pendingJudgments = [];
    
    return newState;
  }

  /**
   * 恢复阶段
   */
  private static executeRecoveryPhase(gameState: GameState): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // 恢复行动点
    const updatedPlayer = {
      ...currentPlayer,
      actionPoints: 3,
      resources: {
        ...currentPlayer.resources,
        // 根据阵营恢复资源
        compute: currentPlayer.resources.compute + (currentPlayer.faction === 'defense' ? 1 : 0),
        funds: currentPlayer.resources.funds + (currentPlayer.faction === 'defense' ? 1 : 0.5),
        information: currentPlayer.resources.information + (currentPlayer.faction === 'attack' ? 1 : 0)
      }
    };
    
    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex] = updatedPlayer;
    
    return { ...gameState, players: newPlayers };
  }

  /**
   * 摸牌阶段
   */
  private static executeDrawPhase(gameState: GameState): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // 基础抽牌1张
    let drawCount = 1;
    
    // 手牌为0时额外抽1张
    if (currentPlayer.hand.length === 0) {
      drawCount += 1;
    }
    
    // 执行抽牌
    return this.drawCards(gameState, currentPlayer.id, drawCount);
  }

  /**
   * 弃牌阶段
   */
  private static executeDiscardPhase(gameState: GameState): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const handSize = currentPlayer.hand.length;
    const maxHandSize = 1;
    
    if (handSize > maxHandSize) {
      // 需要弃置超额手牌
      const discardCount = handSize - maxHandSize;
      return this.requestDiscard(gameState, currentPlayer.id, discardCount);
    }
    
    return gameState;
  }

  /**
   * 结束阶段
   */
  private static executeEndPhase(gameState: GameState): GameState {
    let newState = { ...gameState };
    
    // 结算结束阶段效果
    newState = this.resolveEndPhaseEffects(newState);
    
    // 减少持续效果持续时间
    newState = this.reduceDurations(newState);
    
    // 锁定回合状态
    newState = this.lockTurnState(newState);
    
    return newState;
  }
}
```

---

## 三、判定卡牌机制

### 3.1 机制概述

判定卡牌机制类似于"三国杀"的判定系统：
- 某些卡牌或技能会要求进行"判定"
- 从牌库顶翻开一张牌作为"判定牌"
- 根据判定牌的花色、点数或类型执行不同效果

### 3.2 判定牌堆

**判定牌堆构成：**
- 使用独立的"判定牌堆"或从主牌库顶取牌
- 判定牌使用后进入弃牌堆

**判定牌属性：**

| 属性 | 说明 |
|------|------|
| 花色 | ♠️黑桃、♥️红桃、♣️梅花、♦️方块 |
| 点数 | 1-6（对应骰子点数） |
| 类型 | 攻击/防御/特殊 |

### 3.3 判定触发时机

判定可能在以下时机触发：
1. **判定阶段** - 处理延迟判定
2. **行动阶段** - 卡牌效果要求判定
3. **响应阶段** - 响应效果要求判定
4. **结束阶段** - 结算结束效果

### 3.4 判定结果定义

```typescript
// types/judgmentCard.ts

/**
 * 判定结果类型
 */
export type JudgmentResultType = 
  | 'suit'      // 按花色判定
  | 'point'     // 按点数判定
  | 'type'      // 按类型判定
  | 'custom';   // 自定义判定

/**
 * 判定条件
 */
export interface JudgmentCondition {
  /** 条件类型 */
  type: JudgmentResultType;
  /** 成功条件 */
  successCondition: string;
  /** 成功效果 */
  successEffect: JudgmentEffect;
  /** 失败效果 */
  failureEffect: JudgmentEffect;
}

/**
 * 判定效果
 */
export interface JudgmentEffect {
  /** 效果类型 */
  type: 'damage' | 'heal' | 'resource' | 'draw' | 'discard' | 'none';
  /** 效果数值 */
  value: number;
  /** 效果目标 */
  target: 'self' | 'opponent' | 'all';
  /** 效果描述 */
  description: string;
}

/**
 * 判定卡牌配置
 */
export interface JudgmentCardConfig {
  /** 判定时机 */
  timing: TurnPhase;
  /** 判定条件 */
  condition: JudgmentCondition;
  /** 是否可改判 */
  canModify: boolean;
  /** 改判次数 */
  modifyCount: number;
}
```

### 3.5 判定卡牌示例

**示例1：闪电（攻击方）**

```typescript
{
  card_code: 'ATTACK_J001',
  name: '零日漏洞爆发',
  type: '高级威胁类',
  faction: 'attack',
  cost: { information: 1 },
  trigger_condition: '将这张牌放置于判定区',
  judgment_config: {
    timing: 'judgment',  // 判定阶段触发
    condition: {
      type: 'suit',
      successCondition: '判定牌为♠️黑桃',  // 黑桃时成功
      successEffect: {
        type: 'damage',
        value: 3,
        target: 'opponent',
        description: '对防御方造成3点算力伤害'
      },
      failureEffect: {
        type: 'none',
        value: 0,
        target: 'self',
        description: '无事发生，判定牌移至下家'
      }
    },
    canModify: true,
    modifyCount: 1
  },
  description: '判定阶段进行判定，若为黑桃则对防御方造成3点算力伤害，否则移至下家判定区',
  duration: -1,  // 永久直到触发
  source_event: '零日漏洞自动传播'
}
```

**示例2：乐不思蜀（防御方）**

```typescript
{
  card_code: 'DEF_J001',
  name: '系统维护',
  type: '基础防御类',
  faction: 'defense',
  cost: { funds: 1 },
  trigger_condition: '将这张牌放置于攻击方判定区',
  judgment_config: {
    timing: 'judgment',
    condition: {
      type: 'suit',
      successCondition: '判定牌不为♥️红桃',  // 非红桃时成功
      successEffect: {
        type: 'none',
        value: 0,
        target: 'opponent',
        description: '攻击方本回合跳过行动阶段'
      },
      failureEffect: {
        type: 'none',
        value: 0,
        target: 'self',
        description: '无事发生，判定牌进入弃牌堆'
      }
    },
    canModify: true,
    modifyCount: 1
  },
  description: '判定阶段进行判定，若不为红桃则攻击方本回合跳过行动阶段',
  duration: 1,  // 持续1回合
  source_event: '计划性系统维护'
}
```

---

## 四、卡牌库配置

### 4.1 数量平衡原则

**核心要求：**
1. 攻击方与防御方卡牌总数相等
2. 各品质等级卡牌数量相等

### 4.2 卡牌库构成

**总卡牌数：80张**

| 阵营 | 普通 | 稀有 | 史诗 | 传说 | 合计 |
|------|------|------|------|------|------|
| 攻击方 | 20 | 10 | 6 | 4 | 40 |
| 防御方 | 20 | 10 | 6 | 4 | 40 |
| **合计** | **40** | **20** | **12** | **8** | **80** |

### 4.3 品质等级定义

| 品质 | 颜色 | 效果复杂度 | 最大效果数 | 稀有度 |
|------|------|------------|------------|--------|
| 普通 | 白色 | 简单 | 1 | 50% |
| 稀有 | 蓝色 | 中等 | 2 | 25% |
| 史诗 | 紫色 | 复杂 | 3 | 15% |
| 传说 | 金色 | 极复杂 | 4 | 10% |

---

## 五、完整卡牌设计

### 5.1 攻击方卡牌（40张）

#### 5.1.1 普通品质（20张）

**ATTACK_001: 带宽洪水攻击**
```typescript
{
  card_code: 'ATTACK_001',
  name: '带宽洪水攻击',
  type: 'DDoS攻击类',
  faction: 'attack',
  rarity: 'common',
  cost: { funds: 2 },
  trigger_condition: '以Perimeter区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度3判定，成功则防御方算力-2'
    }
  ],
  duration: 0,
  source_event: '大规模网络洪泛攻击'
}
```

**ATTACK_002: SYN洪流攻击**
```typescript
{
  card_code: 'ATTACK_002',
  name: 'SYN洪流攻击',
  type: 'DDoS攻击类',
  faction: 'attack',
  rarity: 'common',
  cost: { compute: 1, funds: 1 },
  trigger_condition: '以Perimeter区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'resource_loss', 
      detail: '防御方算力-1'
    }
  ],
  duration: 0,
  source_event: 'TCP协议漏洞利用'
}
```

**ATTACK_003: UDP Flood攻击**
```typescript
{
  card_code: 'ATTACK_003',
  name: 'UDP Flood攻击',
  type: 'DDoS攻击类',
  faction: 'attack',
  rarity: 'common',
  cost: { compute: 1 },
  trigger_condition: '以任意区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度4判定，成功则防御方算力-2'
    }
  ],
  duration: 0,
  source_event: '无连接协议洪泛'
}
```

**ATTACK_004: 恶意链接**
```typescript
{
  card_code: 'ATTACK_004',
  name: '恶意链接',
  type: '钓鱼攻击类',
  faction: 'attack',
  rarity: 'common',
  cost: { information: 1 },
  trigger_condition: '指定一名防御方玩家',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度3判定，成功则窃取1点信息'
    }
  ],
  duration: 0,
  source_event: '恶意软件分发'
}
```

**ATTACK_005: 伪造邮件**
```typescript
{
  card_code: 'ATTACK_005',
  name: '伪造邮件',
  type: '钓鱼攻击类',
  faction: 'attack',
  rarity: 'common',
  cost: { funds: 1 },
  trigger_condition: '指定一名防御方玩家',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'resource_loss', 
      detail: '防御方资金-1'
    }
  ],
  duration: 0,
  source_event: '商业邮件诈骗'
}
```

**ATTACK_006: SQL注入**
```typescript
{
  card_code: 'ATTACK_006',
  name: 'SQL注入',
  type: '漏洞利用类',
  faction: 'attack',
  rarity: 'common',
  cost: { information: 1 },
  trigger_condition: '以DMZ区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度3判定，成功则窃取1点算力'
    }
  ],
  duration: 0,
  source_event: '数据库注入攻击'
}
```

**ATTACK_007: XSS攻击**
```typescript
{
  card_code: 'ATTACK_007',
  name: 'XSS攻击',
  type: '漏洞利用类',
  faction: 'attack',
  rarity: 'common',
  cost: { information: 1, compute: 1 },
  trigger_condition: '以DMZ区域为目标',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'place_token', 
      detail: '放置XSS载荷标记，持续1回合'
    }
  ],
  duration: 1,
  source_event: '跨站脚本攻击'
}
```

**ATTACK_008: 暴力破解**
```typescript
{
  card_code: 'ATTACK_008',
  name: '暴力破解',
  type: '漏洞利用类',
  faction: 'attack',
  rarity: 'common',
  cost: { compute: 2 },
  trigger_condition: '以Internal区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度4判定，成功则获得1点权限'
    }
  ],
  duration: 0,
  source_event: '密码暴力破解'
}
```

**ATTACK_009: 端口扫描**
```typescript
{
  card_code: 'ATTACK_009',
  name: '端口扫描',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'common',
  cost: { information: 1 },
  trigger_condition: '以任意区域为目标',
  effects: [
    { 
      target: 'self', 
      mechanic: 'resource_gain', 
      detail: '获得1点信息'
    },
    { 
      target: 'target_area', 
      mechanic: 'reveal', 
      detail: '检视该区域所有标记'
    }
  ],
  duration: 0,
  source_event: '网络侦察'
}
```

**ATTACK_010: 凭证填充**
```typescript
{
  card_code: 'ATTACK_010',
  name: '凭证填充',
  type: '钓鱼攻击类',
  faction: 'attack',
  rarity: 'common',
  cost: { information: 2 },
  trigger_condition: '指定一名防御方玩家',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度3判定，成功则窃取1点权限'
    }
  ],
  duration: 0,
  source_event: '凭据填充攻击'
}
```

**[继续10张普通攻击卡牌...]**

#### 5.1.2 稀世品质（10张）

**ATTACK_021: 高级持续性威胁**
```typescript
{
  card_code: 'ATTACK_021',
  name: '高级持续性威胁',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'rare',
  cost: { information: 2, funds: 2 },
  trigger_condition: '以Internal区域为目标',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'place_token', 
      detail: '放置APT控制标记，每回合窃取1点信息'
    }
  ],
  duration: 2,
  source_event: 'APT组织攻击'
}
```

**ATTACK_022: 勒索软件**
```typescript
{
  card_code: 'ATTACK_022',
  name: '勒索软件',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'rare',
  cost: { compute: 2, information: 1 },
  trigger_condition: '以任意区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度3判定，成功则防御方弃置1张手牌并失去2点资金'
    }
  ],
  duration: 0,
  source_event: '勒索软件攻击'
}
```

**ATTACK_023: 供应链投毒**
```typescript
{
  card_code: 'ATTACK_023',
  name: '供应链投毒',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'rare',
  cost: { funds: 3, information: 2 },
  trigger_condition: '影响所有防御方玩家',
  effects: [
    { 
      target: 'all_defenders', 
      mechanic: 'resource_loss', 
      detail: '所有防御方玩家失去1点算力和1点信息'
    }
  ],
  duration: 0,
  source_event: '软件供应链攻击'
}
```

**ATTACK_024: 内部威胁**
```typescript
{
  card_code: 'ATTACK_024',
  name: '内部威胁',
  type: '钓鱼攻击类',
  faction: 'attack',
  rarity: 'rare',
  cost: { information: 2 },
  trigger_condition: '指定一名防御方玩家',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'rps_duel', 
      detail: '进行剪刀石头布对决',
      rps_config: {
        timeLimit: 5,
        drawEffect: { target: 'both', type: 'resource_loss', value: 1, description: '双方各失去1点信息' },
        winEffect: { target: 'winner', type: 'resource_gain', value: 3, description: '获得3点任意资源' },
        loseEffect: { target: 'loser', type: 'discard', value: 1, description: '弃置1张手牌' }
      }
    }
  ],
  duration: 0,
  source_event: '内部人员威胁'
}
```

**[继续6张稀有攻击卡牌...]**

#### 5.1.3 史诗品质（6张）

**ATTACK_031: 零日漏洞利用**
```typescript
{
  card_code: 'ATTACK_031',
  name: '零日漏洞利用',
  type: '漏洞利用类',
  faction: 'attack',
  rarity: 'epic',
  cost: { information: 3, compute: 2 },
  trigger_condition: '以任意区域为目标',
  effects: [
    { 
      target: 'defender', 
      mechanic: 'dice_check', 
      detail: '进行难度4判定，成功则无视防御直接放置权限标记'
    },
    {
      target: 'self',
      mechanic: 'resource_gain',
      detail: '获得1点权限'
    }
  ],
  duration: 0,
  source_event: '未公开零日漏洞'
}
```

**ATTACK_032: 国家级攻击**
```typescript
{
  card_code: 'ATTACK_032',
  name: '国家级攻击',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'epic',
  cost: { funds: 4, information: 3, compute: 2 },
  trigger_condition: '以ICS区域为目标',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'instant_control', 
      detail: '直接控制该区域'
    },
    {
      target: 'defender',
      mechanic: 'resource_loss',
      detail: '防御方失去3点算力和3点资金'
    }
  ],
  duration: 0,
  source_event: '国家级网络攻击'
}
```

**[继续4张史诗攻击卡牌...]**

#### 5.1.4 传说品质（4张）

**ATTACK_041: 全面网络战**
```typescript
{
  card_code: 'ATTACK_041',
  name: '全面网络战',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'legendary',
  cost: { funds: 5, information: 4, compute: 3 },
  trigger_condition: '无特定限制',
  effects: [
    { 
      target: 'all_defenders', 
      mechanic: 'resource_loss', 
      detail: '所有防御方玩家失去2点算力、2点资金、2点信息'
    },
    {
      target: 'all_areas',
      mechanic: 'place_token',
      detail: '在所有区域放置威胁标记'
    },
    {
      target: 'self',
      mechanic: 'resource_gain',
      detail: '获得2点权限'
    }
  ],
  duration: 0,
  source_event: '全面网络战争'
}
```

**[继续3张传说攻击卡牌...]**

### 5.2 防御方卡牌（40张）

#### 5.2.1 普通品质（20张）

**DEF_001: 防火墙部署**
```typescript
{
  card_code: 'DEF_001',
  name: '防火墙部署',
  type: '基础防御类',
  faction: 'defense',
  rarity: 'common',
  cost: { compute: 1 },
  trigger_condition: '以Perimeter区域为目标',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'area_protection', 
      detail: '该区域DDoS攻击判定难度+1'
    }
  ],
  duration: 2,
  source_event: '网络边界防护'
}
```

**DEF_002: 入侵检测系统**
```typescript
{
  card_code: 'DEF_002',
  name: '入侵检测系统',
  type: '入侵检测与响应类',
  faction: 'defense',
  rarity: 'common',
  cost: { compute: 1, information: 1 },
  trigger_condition: '响应一次攻击判定前使用',
  effects: [
    { 
      target: 'self', 
      mechanic: 'dice_reroll', 
      detail: '本次防御判定可以重掷一次'
    }
  ],
  duration: 0,
  source_event: '实时入侵检测'
}
```

**DEF_003: 安全补丁**
```typescript
{
  card_code: 'DEF_003',
  name: '安全补丁',
  type: '基础防御类',
  faction: 'defense',
  rarity: 'common',
  cost: { funds: 1 },
  trigger_condition: '清除一个漏洞标记',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'clear_token', 
      detail: '清除该区域一个漏洞类标记'
    },
    {
      target: 'self',
      mechanic: 'resource_gain',
      detail: '获得1点信息'
    }
  ],
  duration: 0,
  source_event: '安全漏洞修补'
}
```

**DEF_004: 访问控制**
```typescript
{
  card_code: 'DEF_004',
  name: '访问控制',
  type: '基础防御类',
  faction: 'defense',
  rarity: 'common',
  cost: { compute: 1, funds: 1 },
  trigger_condition: '以Internal区域为目标',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'area_protection', 
      detail: '该区域漏洞利用判定难度+1'
    }
  ],
  duration: 2,
  source_event: '访问权限控制'
}
```

**DEF_005: 日志审计**
```typescript
{
  card_code: 'DEF_005',
  name: '日志审计',
  type: '入侵检测与响应类',
  faction: 'defense',
  rarity: 'common',
  cost: { information: 1 },
  trigger_condition: '检视攻击方1张手牌',
  effects: [
    { 
      target: 'self', 
      mechanic: 'reveal', 
      detail: '检视攻击方1张手牌'
    },
    {
      target: 'self',
      mechanic: 'resource_gain',
      detail: '获得1点信息'
    }
  ],
  duration: 0,
  source_event: '安全日志分析'
}
```

**[继续15张普通防御卡牌...]**

#### 5.2.2 稀有品质（10张）

**DEF_021: 蜜罐系统**
```typescript
{
  card_code: 'DEF_021',
  name: '蜜罐系统',
  type: '主动与欺骗防御类',
  faction: 'defense',
  rarity: 'rare',
  cost: { funds: 2, compute: 1 },
  trigger_condition: '放置于一个区域',
  effects: [
    { 
      target: 'target_area', 
      mechanic: 'honeypot', 
      detail: '当攻击方对该区域使用卡牌时，攻击方失去1点信息'
    }
  ],
  duration: 2,
  source_event: '欺骗防御技术'
}
```

**DEF_022: 威胁情报**
```typescript
{
  card_code: 'DEF_022',
  name: '威胁情报',
  type: '入侵检测与响应类',
  faction: 'defense',
  rarity: 'rare',
  cost: { information: 2 },
  trigger_condition: '响应阶段使用',
  effects: [
    { 
      target: 'attacker', 
      mechanic: 'cancel', 
      detail: '取消攻击方本次卡牌效果'
    }
  ],
  duration: 0,
  source_event: '威胁情报共享'
}
```

**[继续8张稀有防御卡牌...]**

#### 5.2.3 史诗品质（6张）

**DEF_031: 全面防御态势**
```typescript
{
  card_code: 'DEF_031',
  name: '全面防御态势',
  type: '基础防御类',
  faction: 'defense',
  rarity: 'epic',
  cost: { compute: 2, funds: 2, information: 1 },
  trigger_condition: '影响所有己方区域',
  effects: [
    { 
      target: 'all_areas', 
      mechanic: 'area_protection', 
      detail: '所有区域攻击判定难度+1'
    },
    {
      target: 'self',
      mechanic: 'resource_gain',
      detail: '获得2点算力'
    }
  ],
  duration: 2,
  source_event: '全面安全加固'
}
```

**[继续5张史诗防御卡牌...]**

#### 5.2.4 传说品质（4张）

**DEF_041: 网络 fortress**
```typescript
{
  card_code: 'DEF_041',
  name: '网络 fortress',
  type: '基础防御类',
  faction: 'defense',
  rarity: 'legendary',
  cost: { compute: 3, funds: 3, information: 2 },
  trigger_condition: '影响所有区域',
  effects: [
    { 
      target: 'all_areas', 
      mechanic: 'clear_token', 
      detail: '清除所有区域的攻击方标记'
    },
    {
      target: 'all_defenders',
      mechanic: 'resource_gain',
      detail: '所有防御方玩家获得2点算力和2点资金'
    },
    {
      target: 'self',
      mechanic: 'security_boost',
      detail: '安全等级+2'
    }
  ],
  duration: 0,
  source_event: '终极防御部署'
}
```

**[继续3张传说防御卡牌...]**

---

## 六、实施规范

### 6.1 文件结构

```
src/
├── mechanics/
│   ├── diceMechanic.ts      # 骰子判定机制
│   └── rpsMechanic.ts       # 剪刀石头布机制
├── phases/
│   └── turnPhaseEngine.ts   # 7阶段回合引擎
├── cards/
│   ├── attackCards.ts       # 攻击方40张卡牌
│   └── defenseCards.ts      # 防御方40张卡牌
└── types/
    ├── diceMechanic.ts      # 骰子机制类型
    ├── rpsMechanic.ts       # RPS机制类型
    ├── turnPhase.ts         # 回合阶段类型
    └── judgmentCard.ts      # 判定卡牌类型
```

### 6.2 关键实现要点

1. **机制独立性** - 骰子和RPS机制必须完全独立，不依赖任何卡牌逻辑
2. **阶段严格顺序** - 7个阶段必须严格按照定义的顺序执行
3. **手牌上限1张** - 弃牌阶段必须严格执行手牌上限为1张的规则
4. **数量平衡** - 攻击方和防御方卡牌数量必须严格相等（各40张）
5. **品质平衡** - 各品质等级卡牌数量必须严格相等

---

*文档结束*
