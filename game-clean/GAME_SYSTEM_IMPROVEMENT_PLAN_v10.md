# 《道高一丈：数字博弈》v10.0 游戏系统全面改进方案

## 文档信息

| 项目 | 内容 |
|------|------|
| **版本** | v10.0 |
| **日期** | 2026-01-30 |
| **目标** | 完善判定机制、角色系统、回合机制，扩展卡牌库 |
| **状态** | 设计草案 |

---

## 目录

1. [系统现状分析](#一系统现状分析)
2. [核心判定系统设计](#二核心判定系统设计)
3. [角色技能重设计](#三角色技能重设计)
4. [回合与轮次机制明确](#四回合与轮次机制明确)
5. [系统架构优化建议](#五系统架构优化建议)
6. [卡牌库填充方案](#六卡牌库填充方案)
7. [实施路线图](#七实施路线图)

---

## 一、系统现状分析

### 1.1 现有系统概览

| 系统模块 | 当前状态 | 存在问题 |
|----------|----------|----------|
| **判定系统** | 基于d10骰子（1-10），难度4-8 | 无明确难度标准，判定逻辑分散 |
| **角色系统** | 6名角色，各有1个技能 | 技能效果复杂，触发条件不明确，缺乏平衡性 |
| **回合机制** | 4阶段流程（planning/action/resolution/cleanup） | 回合边界模糊，状态管理不完善 |
| **卡牌系统** | 攻击方47张，防御方28张 | 卡牌类型单一，缺乏稀有度体系 |
| **资源系统** | 4种资源（算力/资金/信息/权限） | 资源转换机制不完善 |

### 1.2 关键问题识别

#### 1.2.1 判定系统问题

```typescript
// 现有代码（gameEngine.ts）
export function rollDice(difficulty: number, modifier: number = 0): { success: boolean; roll: number } {
  const roll = Math.floor(Math.random() * 10) + 1 + modifier;
  return { success: roll >= difficulty, roll };
}
```

**问题分析：**
- 使用d10骰子（1-10），与桌游标准d6不符
- 难度值随意设置（4-8），无统一标准
- 缺乏难度与成功率的对应关系表
- 无角色技能对判定的影响机制

#### 1.2.2 角色技能问题

**现有角色技能示例：**

| 角色 | 阵营 | 技能名称 | 问题 |
|------|------|----------|------|
| 渗透专家 | 攻击 | 零日预研 | 效果过于复杂，结算时机不明确 |
| 社工大师 | 攻击 | 精准钓饵 | 50%概率判定嵌套，增加游戏时长 |
| 僵尸网络操控者 | 攻击 | 分布式协同 | 依赖队友配合，单局体验不稳定 |
| 安全分析师 | 防御 | 威胁溯源 | 检视手牌+控制牌堆顶，操作复杂 |
| 应急响应专家 | 防御 | 快速响应 | 每回合限一次，但触发条件模糊 |
| 架构加固师 | 防御 | 纵深防御 | 延长持续时间，效果难以量化 |

#### 1.2.3 回合机制问题

**现有阶段定义：**
1. `planning` - 策略与规划阶段
2. `action` - 行动宣言与响应阶段
3. `resolution` - 对抗判定与结算阶段
4. `cleanup` - 状态更新与整理阶段

**问题：**
- 阶段内可执行操作不明确
- 回合结束边界模糊
- 无明确的回合状态锁定机制
- 玩家可在非自身回合进行操作（如响应），但规则不明确

---

## 二、核心判定系统设计

### 2.1 骰子判定系统规范

#### 2.1.1 基础判定规则

**骰子规格：** 标准六面骰（d6），点数范围1-6

**判定流程：**
```
1. 确定基础难度（1-5）
2. 应用难度修正（角色技能、卡牌效果、区域加成）
3. 掷骰子获得点数
4. 比较点数与难度，确定成功/失败
5. 执行对应结果
```

#### 2.1.2 难度等级定义

| 难度等级 | 名称 | 失败条件 | 成功率 | 适用场景 |
|----------|------|----------|--------|----------|
| **难度1** | 简单 | 掷出1 | 83.3% (5/6) | 基础攻击、资源获取 |
| **难度2** | 普通 | 掷出1-2 | 66.7% (4/6) | 标准攻击、常规防御 |
| **难度3** | 困难 | 掷出1-3 | 50.0% (3/6) | 高级攻击、关键防御 |
| **难度4** | 极难 | 掷出1-4 | 33.3% (2/6) | 特殊能力、高风险操作 |
| **难度5** | 极限 | 掷出1-5 | 16.7% (1/6) | 终极技能、逆转局势 |
| **难度6** | 不可能 | 任何点数 | 0% | 剧情事件、强制失败 |

#### 2.1.3 判定类型定义

```typescript
// types/dice.ts

export type DiceDifficulty = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceCheckResult {
  success: boolean;
  roll: number;           // 原始点数 (1-6)
  difficulty: DiceDifficulty;
  margin: number;         // 差值（点数 - 难度）
  criticalSuccess: boolean;  // 大成功（点数6且难度≤3）
  criticalFailure: boolean;  // 大失败（点数1且难度≥4）
}

export type CheckType = 
  | 'attack'      // 攻击判定
  | 'defense'     // 防御判定
  | 'social'      // 社会工程学判定
  | 'technical'   // 技术判定
  | 'perception'  // 感知判定
  | 'special';    // 特殊判定

export interface DiceCheckContext {
  checkType: CheckType;
  baseDifficulty: DiceDifficulty;
  modifiers: CheckModifier[];
  playerId: string;
  cardCode?: string;
}

export interface CheckModifier {
  source: string;         // 来源（角色技能/卡牌/区域）
  value: number;          // 修正值（正数降低难度，负数增加难度）
  description: string;
}
```

#### 2.1.4 判定函数实现

```typescript
// engine/diceEngine.ts

import type { DiceDifficulty, DiceCheckResult, DiceCheckContext } from '@/types/dice';

/**
 * 执行骰子判定
 * @param context 判定上下文
 * @returns 判定结果
 */
export function performDiceCheck(context: DiceCheckContext): DiceCheckResult {
  // 计算最终难度
  let finalDifficulty = context.baseDifficulty;
  
  // 应用所有修正值
  for (const modifier of context.modifiers) {
    finalDifficulty -= modifier.value;
  }
  
  // 难度限制在1-6范围内
  finalDifficulty = Math.max(1, Math.min(6, finalDifficulty)) as DiceDifficulty;
  
  // 掷骰子
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // 判定成功条件
  const success = roll > finalDifficulty;
  const margin = roll - finalDifficulty;
  
  // 大成功/大失败判定
  const criticalSuccess = roll === 6 && finalDifficulty <= 3;
  const criticalFailure = roll === 1 && finalDifficulty >= 4;
  
  return {
    success,
    roll,
    difficulty: finalDifficulty,
    margin,
    criticalSuccess,
    criticalFailure
  };
}

/**
 * 获取难度成功率
 */
export function getSuccessRate(difficulty: DiceDifficulty): number {
  const rates = {
    1: 83.3,
    2: 66.7,
    3: 50.0,
    4: 33.3,
    5: 16.7,
    6: 0.0
  };
  return rates[difficulty];
}

/**
 * 获取判定结果描述
 */
export function getCheckResultDescription(result: DiceCheckResult): string {
  if (result.criticalSuccess) return '大成功！效果翻倍';
  if (result.criticalFailure) return '大失败！遭受反噬';
  if (result.success) return '成功';
  return '失败';
}
```

### 2.2 剪刀石头布特殊判定机制

#### 2.2.1 机制概述

**适用场景：** 特定卡牌效果、角色技能对决、资源争夺

**基本规则：**
1. 双方同时选择：剪刀（✌️）、石头（✊）、布（🖐️）
2. 选择时间限制：5秒
3. 超时未选：系统随机选择

#### 2.2.2 胜负判定

| 玩家A | 玩家B | 结果 | 说明 |
|-------|-------|------|------|
| 剪刀 | 布 | A胜 | 剪刀剪布 |
| 布 | 石头 | A胜 | 布包石头 |
| 石头 | 剪刀 | A胜 | 石头砸剪刀 |
| 相同 | 相同 | 平局 | 双方选择一致 |

#### 2.2.3 三种结果效果设计模板

```typescript
// types/rps.ts

export type RPSChoice = 'scissors' | 'rock' | 'paper';

export type RPSResult = 'win' | 'lose' | 'draw';

export interface RPSOutcome {
  result: RPSResult;
  winner?: string;        // 获胜玩家ID
  loser?: string;         // 失败玩家ID
}

export interface RPSEffectSet {
  draw: RPSEffect;        // 平局效果
  win: RPSEffect;         // 赢局效果
  lose: RPSEffect;        // 输局效果
}

export interface RPSEffect {
  target: 'self' | 'opponent' | 'both';
  type: 'resource_gain' | 'resource_loss' | 'draw_card' | 'discard' | 'token' | 'permission';
  value: number;
  description: string;
}
```

#### 2.2.4 卡牌效果示例

**示例卡牌：心理博弈**

```typescript
{
  card_code: 'ATTACK_050',
  name: '心理博弈',
  type: '高级威胁类',
  faction: 'attack',
  cost: { information: 2 },
  trigger_condition: '指定一名防御方玩家进行心理对决',
  effects: [
    { 
      target: 'opponent', 
      mechanic: 'rps_duel', 
      detail: '双方进行剪刀石头布对决',
      rpsEffects: {
        draw: {
          target: 'both',
          type: 'resource_loss',
          value: 1,
          description: '平局：双方各失去1点信息资源（心理消耗）'
        },
        win: {
          target: 'self',
          type: 'resource_gain',
          value: 3,
          description: '赢局：从对手处窃取3点任意资源（心理击溃）'
        },
        lose: {
          target: 'self',
          type: 'discard',
          value: 1,
          description: '输局：弃置1张手牌（心理受挫）'
        }
      }
    }
  ],
  duration: 0,
  source_event: '心理战与欺骗'
}
```

**示例卡牌：反制策略**

```typescript
{
  card_code: 'DEF_030',
  name: '反制策略',
  type: '主动与欺骗防御类',
  faction: 'defense',
  cost: { compute: 1, information: 1 },
  trigger_condition: '响应攻击方的剪刀石头布类卡牌',
  effects: [
    { 
      target: 'self', 
      mechanic: 'rps_counter', 
      detail: '进行剪刀石头布对决，但你可以在看到对方选择后决定（延迟1秒）',
      rpsEffects: {
        draw: {
          target: 'opponent',
          type: 'resource_loss',
          value: 2,
          description: '平局：攻击方失去2点算力（反制消耗）'
        },
        win: {
          target: 'opponent',
          type: 'discard',
          value: 2,
          description: '赢局：攻击方弃置2张手牌（策略被识破）'
        },
        lose: {
          target: 'self',
          type: 'resource_gain',
          value: 2,
          description: '输局：获得2点算力（以退为进）'
        }
      }
    }
  ],
  duration: 0,
  source_event: '预判与反制'
}
```

#### 2.2.5 实现代码

```typescript
// engine/rpsEngine.ts

import type { RPSChoice, RPSResult, RPSOutcome, RPSEffectSet } from '@/types/rps';

/**
 * 判定剪刀石头布胜负
 */
export function resolveRPS(
  playerAChoice: RPSChoice,
  playerBChoice: RPSChoice,
  playerAId: string,
  playerBId: string
): RPSOutcome {
  if (playerAChoice === playerBChoice) {
    return { result: 'draw' };
  }
  
  const winConditions = {
    scissors: 'paper',
    paper: 'rock',
    rock: 'scissors'
  };
  
  if (winConditions[playerAChoice] === playerBChoice) {
    return { result: 'win', winner: playerAId, loser: playerBId };
  } else {
    return { result: 'lose', winner: playerBId, loser: playerAId };
  }
}

/**
 * 执行剪刀石头布效果
 */
export function executeRPSEffect(
  outcome: RPSOutcome,
  effects: RPSEffectSet,
  playerAId: string,
  playerBId: string
): { playerId: string; effect: string; value: number }[] {
  const results: { playerId: string; effect: string; value: number }[] = [];
  
  let effectToApply: RPSEffect;
  
  switch (outcome.result) {
    case 'draw':
      effectToApply = effects.draw;
      break;
    case 'win':
      effectToApply = effects.win;
      break;
    case 'lose':
      effectToApply = effects.lose;
      break;
  }
  
  // 根据目标应用效果
  if (effectToApply.target === 'self') {
    results.push({
      playerId: outcome.result === 'win' ? playerAId : playerBId,
      effect: effectToApply.description,
      value: effectToApply.value
    });
  } else if (effectToApply.target === 'opponent') {
    results.push({
      playerId: outcome.result === 'win' ? playerBId : playerAId,
      effect: effectToApply.description,
      value: effectToApply.value
    });
  } else if (effectToApply.target === 'both') {
    results.push(
      { playerId: playerAId, effect: effectToApply.description, value: effectToApply.value },
      { playerId: playerBId, effect: effectToApply.description, value: effectToApply.value }
    );
  }
  
  return results;
}
```

---

## 三、角色技能重设计

### 3.1 设计原则

1. **简洁性**：技能描述不超过50字
2. **明确性**：触发条件、消耗、效果清晰
3. **平衡性**：攻击方与防御方各有3名角色，强度对等
4. **互动性**：技能之间存在配合与克制关系
5. **主题性**：技能与角色名称、背景相符

### 3.2 攻击方角色重设计

#### 3.2.1 渗透专家 → 漏洞猎人

| 项目 | 内容 |
|------|------|
| **角色名称** | 漏洞猎人 |
| **阵营** | 攻击方 |
| **技能名称** | 精准打击 |
| **触发条件** | 使用漏洞利用类卡牌时 |
| **消耗** | 无 |
| **效果** | 该卡牌的攻击判定难度-1（最低为1） |
| **使用限制** | 每回合限1次 |

**设计思路：** 简化原技能的复杂效果，直接降低判定难度，提高成功率。

#### 3.2.2 社工大师 → 欺诈师

| 项目 | 内容 |
|------|------|
| **角色名称** | 欺诈师 |
| **阵营** | 攻击方 |
| **技能名称** | 心理操控 |
| **触发条件** | 使用钓鱼攻击类卡牌时 |
| **消耗** | 弃置1张手牌 |
| **效果** | 若攻击成功，额外窃取1点任意资源 |
| **使用限制** | 每回合限1次 |

**设计思路：** 移除概率判定，改为确定性资源消耗换取收益。

#### 3.2.3 僵尸网络操控者 →  Botnet领主

| 项目 | 内容 |
|------|------|
| **角色名称** | Botnet领主 |
| **阵营** | 攻击方 |
| **技能名称** | 集群攻击 |
| **触发条件** | 使用DDoS攻击类卡牌时 |
| **消耗** | 支付1点算力 |
| **效果** | 该卡牌效果额外影响一个相邻区域 |
| **使用限制** | 每回合限1次 |

**设计思路：** 将依赖队友的效果改为个人扩展效果，增强单局体验稳定性。

### 3.3 防御方角色重设计

#### 3.3.1 安全分析师 → 威胁猎手

| 项目 | 内容 |
|------|------|
| **角色名称** | 威胁猎手 |
| **阵营** | 防御方 |
| **技能名称** | 预判防御 |
| **触发条件** | 响应攻击卡牌前 |
| **消耗** | 弃置1点信息 |
| **效果** | 检视攻击方1张手牌，然后决定是否响应 |
| **使用限制** | 每回合限1次 |

**设计思路：** 简化原技能的复杂操作，保留信息收集的核心体验。

#### 3.3.2 应急响应专家 → 快速反应部队

| 项目 | 内容 |
|------|------|
| **角色名称** | 快速反应部队 |
| **阵营** | 防御方 |
| **技能名称** | 紧急加固 |
| **触发条件** | 进行防御判定时 |
| **消耗** | 弃置1点算力 |
| **效果** | 本次判定难度-1（可叠加至难度1） |
| **使用限制** | 每回合限2次 |

**设计思路：** 明确触发时机和效果，增加使用次数提高灵活性。

#### 3.3.3 架构加固师 → 防御架构师

| 项目 | 内容 |
|------|------|
| **角色名称** | 防御架构师 |
| **阵营** | 防御方 |
| **技能名称** | 区域强化 |
| **触发条件** | 在己方区域部署防御卡牌时 |
| **消耗** | 支付1点资金 |
| **效果** | 该防御卡牌持续时间+1回合 |
| **使用限制** | 每回合限1次 |

**设计思路：** 将被动效果改为主动支付，增加策略深度。

### 3.4 角色技能对照表

| 角色 | 阵营 | 技能 | 触发条件 | 消耗 | 效果 | 限制 |
|------|------|------|----------|------|------|------|
| 漏洞猎人 | 攻击 | 精准打击 | 使用漏洞利用类卡牌 | 无 | 判定难度-1 | 每回合1次 |
| 欺诈师 | 攻击 | 心理操控 | 使用钓鱼攻击类卡牌 | 弃1牌 | 成功时额外窃取1资源 | 每回合1次 |
| Botnet领主 | 攻击 | 集群攻击 | 使用DDoS攻击类卡牌 | 1算力 | 效果扩展至相邻区域 | 每回合1次 |
| 威胁猎手 | 防御 | 预判防御 | 响应攻击前 | 1信息 | 检视1张手牌 | 每回合1次 |
| 快速反应部队 | 防御 | 紧急加固 | 防御判定时 | 1算力 | 判定难度-1 | 每回合2次 |
| 防御架构师 | 防御 | 区域强化 | 部署防御卡牌 | 1资金 | 持续时间+1 | 每回合1次 |

### 3.5 角色技能实现代码

```typescript
// data/roles_v10.ts

import type { Role, Player, Card, DiceCheckContext } from '@/types/game';

export interface RoleAbility {
  name: string;
  description: string;
  triggerCondition: (context: AbilityContext) => boolean;
  cost: (player: Player) => boolean;  // 检查是否可以支付消耗
  apply: (context: AbilityContext) => AbilityResult;
  useLimit: number;  // 每回合使用次数限制
}

export interface AbilityContext {
  player: Player;
  card?: Card;
  checkContext?: DiceCheckContext;
  gameState: GameState;
  usedCountThisTurn: number;
}

export interface AbilityResult {
  success: boolean;
  message: string;
  modifiers?: CheckModifier[];
  extraEffects?: CardEffect[];
}

// ==================== 攻击方角色 ====================

export const vulnerabilityHunter: RoleAbility = {
  name: '精准打击',
  description: '使用漏洞利用类卡牌时，该卡牌的攻击判定难度-1（最低为1）',
  triggerCondition: (ctx) => ctx.card?.type === '漏洞利用类',
  cost: () => true,  // 无消耗
  apply: (ctx) => ({
    success: true,
    message: '【精准打击】触发：判定难度-1',
    modifiers: [{ source: '角色技能', value: 1, description: '漏洞猎人：精准打击' }]
  }),
  useLimit: 1
};

export const deceiver: RoleAbility = {
  name: '心理操控',
  description: '使用钓鱼攻击类卡牌时，弃置1张手牌，若攻击成功额外窃取1点任意资源',
  triggerCondition: (ctx) => ctx.card?.type === '钓鱼攻击类',
  cost: (player) => player.hand.length >= 2,  // 至少保留1张，弃置1张
  apply: (ctx) => ({
    success: true,
    message: '【心理操控】触发：弃置1张手牌，成功时额外窃取1资源',
    extraEffects: [{
      target: 'defender',
      mechanic: 'resource_steal',
      detail: '额外窃取1点任意资源'
    }]
  }),
  useLimit: 1
};

export const botnetLord: RoleAbility = {
  name: '集群攻击',
  description: '使用DDoS攻击类卡牌时，支付1点算力，效果额外影响一个相邻区域',
  triggerCondition: (ctx) => ctx.card?.type === 'DDoS攻击类',
  cost: (player) => player.resources.compute >= 1,
  apply: (ctx) => ({
    success: true,
    message: '【集群攻击】触发：效果扩展至相邻区域',
    extraEffects: [{
      target: 'adjacent_area',
      mechanic: 'area_extension',
      detail: '效果扩展至相邻区域'
    }]
  }),
  useLimit: 1
};

// ==================== 防御方角色 ====================

export const threatHunter: RoleAbility = {
  name: '预判防御',
  description: '响应攻击卡牌前，弃置1点信息，检视攻击方1张手牌后决定是否响应',
  triggerCondition: (ctx) => true,  // 任何响应前都可触发
  cost: (player) => player.resources.information >= 1,
  apply: (ctx) => ({
    success: true,
    message: '【预判防御】触发：检视攻击方1张手牌',
    extraEffects: [{
      target: 'self',
      mechanic: 'reveal_opponent_hand',
      detail: '检视攻击方1张手牌'
    }]
  }),
  useLimit: 1
};

export const rapidResponse: RoleAbility = {
  name: '紧急加固',
  description: '进行防御判定时，弃置1点算力，本次判定难度-1',
  triggerCondition: (ctx) => ctx.checkContext?.checkType === 'defense',
  cost: (player) => player.resources.compute >= 1,
  apply: (ctx) => ({
    success: true,
    message: '【紧急加固】触发：判定难度-1',
    modifiers: [{ source: '角色技能', value: 1, description: '快速反应部队：紧急加固' }]
  }),
  useLimit: 2
};

export const defenseArchitect: RoleAbility = {
  name: '区域强化',
  description: '在己方区域部署防御卡牌时，支付1点资金，持续时间+1回合',
  triggerCondition: (ctx) => ctx.card?.faction === 'defense' && ctx.card?.duration > 0,
  cost: (player) => player.resources.funds >= 1,
  apply: (ctx) => ({
    success: true,
    message: '【区域强化】触发：防御持续时间+1',
    extraEffects: [{
      target: 'self',
      mechanic: 'duration_extend',
      detail: '防御卡牌持续时间+1回合'
    }]
  }),
  useLimit: 1
};

// 角色配置
export const rolesV10: Role[] = [
  {
    name: '漏洞猎人',
    faction: 'attack',
    ability: '精准打击',
    trigger: '使用漏洞利用类卡牌时',
    effect: '该卡牌的攻击判定难度-1（最低为1），每回合限1次'
  },
  {
    name: '欺诈师',
    faction: 'attack',
    ability: '心理操控',
    trigger: '使用钓鱼攻击类卡牌时',
    effect: '弃置1张手牌，若攻击成功额外窃取1点任意资源，每回合限1次'
  },
  {
    name: 'Botnet领主',
    faction: 'attack',
    ability: '集群攻击',
    trigger: '使用DDoS攻击类卡牌时',
    effect: '支付1点算力，效果额外影响一个相邻区域，每回合限1次'
  },
  {
    name: '威胁猎手',
    faction: 'defense',
    ability: '预判防御',
    trigger: '响应攻击卡牌前',
    effect: '弃置1点信息，检视攻击方1张手牌后决定是否响应，每回合限1次'
  },
  {
    name: '快速反应部队',
    faction: 'defense',
    ability: '紧急加固',
    trigger: '进行防御判定时',
    effect: '弃置1点算力，本次判定难度-1，每回合限2次'
  },
  {
    name: '防御架构师',
    faction: 'defense',
    ability: '区域强化',
    trigger: '在己方区域部署防御卡牌时',
    effect: '支付1点资金，该防御卡牌持续时间+1回合，每回合限1次'
  }
];
```

---

## 四、回合与轮次机制明确

### 4.1 术语定义

| 术语 | 定义 | 说明 |
|------|------|------|
| **回合（Turn）** | 单个角色的完整行动阶段 | 从该角色开始行动到行动结束 |
| **轮次（Round）** | 所有角色完成各自回合的完整周期 | 4人游戏中，4个回合=1个轮次 |
| **阶段（Phase）** | 回合内的细分步骤 | 每个回合包含多个阶段 |
| **行动点（Action Point）** | 每回合可执行的操作次数 | 标准值为3点 |

### 4.2 回合结构重设计

#### 4.2.1 回合流程图

```
┌─────────────────────────────────────────────────────────────┐
│                        回合开始                              │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 开始阶段 (Start Phase)                                   │
│     • 恢复行动点至最大值（默认3点）                           │
│     • 结算"回合开始时"触发的效果                             │
│     • 抽牌（默认1张）                                        │
│     • 恢复资源（根据区域控制情况）                           │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 策略阶段 (Strategy Phase)                                │
│     • 玩家可以：                                             │
│       - 使用策略类卡牌                                       │
│       - 进行资源转换                                         │
│       - 与队友交流（2v2模式）                                │
│     • 消耗：1行动点/次                                       │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 行动阶段 (Action Phase)                                  │
│     • 玩家可以：                                             │
│       - 打出攻击/防御卡牌                                    │
│       - 使用角色技能                                         │
│       - 进行判定                                             │
│     • 消耗：1-2行动点/次（根据卡牌）                         │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 响应阶段 (Response Phase)                                │
│     • 其他玩家可以响应当前行动                               │
│     • 响应窗口：10秒                                         │
│     • 响应消耗：1行动点                                      │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 结算阶段 (Resolution Phase)                              │
│     • 执行卡牌效果                                           │
│     • 进行必要的判定                                         │
│     • 结算胜负结果                                           │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  6. 结束阶段 (End Phase)                                     │
│     • 结算"回合结束时"触发的效果                             │
│     • 减少持续效果持续时间                                   │
│     • 弃置超额手牌（超过上限7张）                            │
│     • 锁定回合状态（禁止任何操作）                           │
└───────────────────────┬─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                        回合结束                              │
│     • 切换到下一玩家                                         │
│     • 若所有玩家完成回合，进入下一轮次                       │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.2 回合状态管理

```typescript
// types/turn.ts

export type TurnPhase = 
  | 'start'       // 开始阶段
  | 'strategy'    // 策略阶段
  | 'action'      // 行动阶段
  | 'response'    // 响应阶段
  | 'resolution'  // 结算阶段
  | 'end';        // 结束阶段

export interface TurnState {
  playerId: string;           // 当前回合玩家
  phase: TurnPhase;           // 当前阶段
  actionPoints: number;       // 剩余行动点
  maxActionPoints: number;    // 最大行动点
  cardsPlayedThisTurn: number; // 本回合已打出卡牌数
  abilitiesUsedThisTurn: string[]; // 本回合已使用技能
  isLocked: boolean;          // 回合是否已锁定
  turnStartTime: number;      // 回合开始时间
  phaseStartTime: number;     // 当前阶段开始时间
}

export interface RoundState {
  roundNumber: number;        // 轮次数
  turnOrder: string[];        // 回合顺序（玩家ID数组）
  currentTurnIndex: number;   // 当前回合在顺序中的索引
  completedTurns: string[];   // 已完成回合的玩家
}
```

#### 4.2.3 回合锁定机制

**核心规则：**
1. 回合进入"结束阶段"后，自动锁定
2. 锁定状态下，该玩家**禁止**进行任何操作
3. 锁定持续到该玩家的下一回合开始

```typescript
// engine/turnEngine.ts

import type { TurnState, TurnPhase, GameState } from '@/types/game';

/**
 * 结束当前回合
 */
export function endTurn(gameState: GameState): GameState {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  // 创建新的回合状态（已锁定）
  const updatedTurnState: TurnState = {
    ...gameState.currentTurnState!,
    phase: 'end',
    isLocked: true,  // 锁定回合
    actionPoints: 0  // 清空行动点
  };
  
  // 结算回合结束效果
  let newGameState = resolveEndOfTurnEffects(gameState);
  
  // 移动到下一玩家
  const nextPlayerIndex = getNextPlayerIndex(gameState);
  
  newGameState = {
    ...newGameState,
    currentPlayerIndex: nextPlayerIndex,
    currentTurnState: createNewTurnState(newGameState.players[nextPlayerIndex].id),
    // 如果回到第一个玩家，轮次+1
    turn: nextPlayerIndex === 0 ? gameState.turn + 1 : gameState.turn
  };
  
  return addLog(newGameState, `回合结束：${currentPlayer.name}，轮到：${newGameState.players[nextPlayerIndex].name}`);
}

/**
 * 检查玩家是否可以在当前进行操作
 */
export function canPlayerAct(
  gameState: GameState,
  playerId: string
): { allowed: boolean; reason?: string } {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  // 检查是否是当前回合玩家
  if (currentPlayer.id !== playerId) {
    // 非当前回合玩家只能在响应阶段进行操作
    if (gameState.currentTurnState?.phase !== 'response') {
      return { allowed: false, reason: '不是你的回合，且不在响应阶段' };
    }
  } else {
    // 是当前回合玩家，检查回合是否已锁定
    if (gameState.currentTurnState?.isLocked) {
      return { allowed: false, reason: '你的回合已结束并锁定' };
    }
    
    // 检查是否有行动点
    if (gameState.currentTurnState!.actionPoints <= 0) {
      return { allowed: false, reason: '行动点已耗尽' };
    }
  }
  
  return { allowed: true };
}

/**
 * 创建新回合状态
 */
function createNewTurnState(playerId: string): TurnState {
  return {
    playerId,
    phase: 'start',
    actionPoints: 3,
    maxActionPoints: 3,
    cardsPlayedThisTurn: 0,
    abilitiesUsedThisTurn: [],
    isLocked: false,
    turnStartTime: Date.now(),
    phaseStartTime: Date.now()
  };
}

/**
 * 获取下一玩家索引
 */
function getNextPlayerIndex(gameState: GameState): number {
  return (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

/**
 * 结算回合结束效果
 */
function resolveEndOfTurnEffects(gameState: GameState): GameState {
  let newGameState = { ...gameState };
  
  // 减少持续效果持续时间
  newGameState = reduceDurations(newGameState);
  
  // 结算区域控制效果
  newGameState = resolveAreaControlEffects(newGameState);
  
  // 弃置超额手牌
  newGameState = discardExcessCards(newGameState);
  
  return newGameState;
}
```

### 4.3 轮次管理机制

#### 4.3.1 轮次定义

**轮次（Round）** = 所有存活玩家各完成一个回合

**示例（4人游戏）：**
- 玩家顺序：A → B → C → D
- 第1轮次：A的回合 → B的回合 → C的回合 → D的回合
- 第2轮次：A的回合 → B的回合 → ...

#### 4.3.2 轮次相关效果

```typescript
// 示例：持续多轮次的效果
export interface DurationEffect {
  type: string;
  remainingRounds: number;  // 剩余轮次数
  source: string;
  target: string;
  effect: CardEffect;
}

// 结算轮次结束效果
export function resolveEndOfRoundEffects(gameState: GameState): GameState {
  // 每轮次结算一次的效果
  // 如：区域资源产出、持续伤害等
}
```

---

## 五、系统架构优化建议

### 5.1 架构优化点

#### 5.1.1 模块化重构

**当前问题：** 游戏逻辑分散在多个文件中，耦合度高

**优化方案：**

```
src/
├── engine/
│   ├── core/
│   │   ├── gameEngine.ts      # 核心游戏引擎
│   │   ├── turnEngine.ts      # 回合管理引擎
│   │   └── stateEngine.ts     # 状态管理引擎
│   ├── dice/
│   │   ├── diceEngine.ts      # 骰子判定引擎
│   │   └── rpsEngine.ts       # 剪刀石头布引擎
│   ├── card/
│   │   ├── cardEngine.ts      # 卡牌效果引擎
│   │   └── effectResolver.ts  # 效果解析器
│   └── ai/
│       └── aiEngine.ts        # AI决策引擎
├── systems/
│   ├── resourceSystem.ts      # 资源管理系统
│   ├── permissionSystem.ts    # 权限管理系统
│   ├── areaSystem.ts          # 区域控制系统
│   └── roleSystem.ts          # 角色技能系统
└── types/
    ├── game.ts
    ├── dice.ts
    ├── rps.ts
    └── turn.ts
```

#### 5.1.2 事件驱动架构

```typescript
// systems/eventSystem.ts

export type GameEventType =
  | 'TURN_START'
  | 'TURN_END'
  | 'CARD_PLAYED'
  | 'DICE_ROLLED'
  | 'RESOURCE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'AREA_CONTROL_CHANGED';

export interface GameEvent {
  type: GameEventType;
  payload: any;
  timestamp: number;
  playerId?: string;
}

export class EventSystem {
  private listeners: Map<GameEventType, ((event: GameEvent) => void)[]> = new Map();
  
  subscribe(eventType: GameEventType, callback: (event: GameEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }
  
  emit(event: GameEvent): void {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(callback => callback(event));
  }
}
```

### 5.2 平衡性调整建议

#### 5.2.1 资源产出平衡

| 回合阶段 | 攻击方产出 | 防御方产出 | 说明 |
|----------|------------|------------|------|
| 1-3回合 | 算力+1，资金+1 | 算力+2，资金+2 | 防御方早期优势 |
| 4-6回合 | 算力+2，资金+1 | 算力+2，资金+1 | 平衡阶段 |
| 7-9回合 | 算力+2，资金+2 | 算力+1，资金+1 | 攻击方后期发力 |
| 10+回合 | 算力+3，资金+2 | 算力+1，资金+1 | 攻击方决胜期 |

#### 5.2.2 卡牌强度曲线

```typescript
// 卡牌强度等级定义
export enum CardPowerLevel {
  WEAK = 1,      // 基础卡，早期使用
  NORMAL = 2,    // 标准卡，中期使用
  STRONG = 3,    // 强力卡，后期使用
  EPIC = 4       // 史诗卡，关键时刻使用
}

// 各等级卡牌分布建议
export const CARD_DISTRIBUTION = {
  attack: {
    [CardPowerLevel.WEAK]: 15,    // 30%
    [CardPowerLevel.NORMAL]: 20,  // 40%
    [CardPowerLevel.STRONG]: 10,  // 20%
    [CardPowerLevel.EPIC]: 5      // 10%
  },
  defense: {
    [CardPowerLevel.WEAK]: 12,    // 30%
    [CardPowerLevel.NORMAL]: 16,  // 40%
    [CardPowerLevel.STRONG]: 8,   // 20%
    [CardPowerLevel.EPIC]: 4      // 10%
  }
};
```

### 5.3 用户体验改进

#### 5.3.1 操作反馈优化

| 操作类型 | 反馈方式 | 反馈内容 |
|----------|----------|----------|
| 卡牌使用 | 动画+音效 | 卡牌飞入战场，播放对应音效 |
| 判定结果 | 弹窗+数字 | 显示骰子点数和成功/失败 |
| 资源变化 | 数字跳动 | 资源数值变化动画 |
| 回合切换 | 高亮+提示 | 当前玩家头像高亮，显示"你的回合" |
| 胜利条件 | 全屏特效 | 播放胜利动画，展示胜利类型 |

#### 5.3.2 新手引导系统

```typescript
// systems/tutorialSystem.ts

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlightElement?: string;  // 高亮元素选择器
  requiredAction?: string;    // 需要执行的操作
  canSkip: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到《道高一丈》',
    description: '这是一款网络安全主题的卡牌对战游戏。',
    canSkip: false
  },
  {
    id: 'resources',
    title: '资源系统',
    description: '算力⚡用于行动，资金💰用于购买，信息👁️用于情报，权限👑是胜利关键。',
    highlightElement: '.resource-panel',
    canSkip: true
  },
  {
    id: 'cards',
    title: '卡牌使用',
    description: '点击手牌查看详情，拖动到目标区域使用。',
    highlightElement: '.hand-area',
    requiredAction: 'PLAY_CARD',
    canSkip: true
  },
  {
    id: 'dice',
    title: '判定系统',
    description: '使用d6骰子进行判定，点数大于难度即成功。',
    highlightElement: '.dice-panel',
    canSkip: true
  }
];
```

### 5.4 潜在技术风险及解决方案

| 风险 | 影响 | 解决方案 |
|------|------|----------|
| **网络同步延迟** | 多人对战卡顿 | 实现预测回滚机制，本地先行+服务器校验 |
| **状态不一致** | 玩家看到不同画面 | 使用确定性随机种子，所有判定由服务器仲裁 |
| **作弊行为** | 修改客户端数据 | 关键逻辑服务端验证，敏感操作双重校验 |
| **AI性能问题** | AI决策时间过长 | 实现分层AI，简单/中等/困难不同算法深度 |
| **内存泄漏** | 长时间游戏卡顿 | 定期清理无效状态，使用对象池管理频繁创建的对象 |

### 5.5 可扩展性设计

#### 5.5.1 卡牌扩展接口

```typescript
// systems/cardExtension.ts

export interface CardExtension {
  cardCode: string;
  version: string;
  effects: ExtendedEffect[];
}

export interface ExtendedEffect {
  type: string;
  condition: (context: EffectContext) => boolean;
  execute: (context: EffectContext) => EffectResult;
}

// 注册新效果类型
export class EffectRegistry {
  private effects: Map<string, ExtendedEffect> = new Map();
  
  register(type: string, effect: ExtendedEffect): void {
    this.effects.set(type, effect);
  }
  
  execute(type: string, context: EffectContext): EffectResult {
    const effect = this.effects.get(type);
    if (!effect) throw new Error(`Unknown effect type: ${type}`);
    return effect.execute(context);
  }
}
```

#### 5.5.2 角色扩展接口

```typescript
// systems/roleExtension.ts

export interface RoleExtension {
  roleName: string;
  abilities: ExtendedAbility[];
}

export interface ExtendedAbility {
  name: string;
  trigger: AbilityTrigger;
  cost: AbilityCost;
  effect: AbilityEffect;
}

// 角色技能注册表
export class RoleRegistry {
  private roles: Map<string, RoleExtension> = new Map();
  
  register(role: RoleExtension): void {
    this.roles.set(role.roleName, role);
  }
  
  getRole(roleName: string): RoleExtension | undefined {
    return this.roles.get(roleName);
  }
}
```

---

## 六、卡牌库填充方案

### 6.1 卡牌类型多样化策略

#### 6.1.1 现有卡牌类型

**攻击方：**
- DDoS攻击类
- 钓鱼攻击类
- 漏洞利用类
- 高级威胁类

**防御方：**
- 基础防御类
- 入侵检测与响应类
- 主动与欺骗防御类
- 资源与应急管理类

#### 6.1.2 新增卡牌类型

| 新类型 | 适用阵营 | 说明 |
|--------|----------|------|
| **环境控制类** | 双方 | 改变区域属性，影响所有玩家 |
| **装备类** | 双方 | 附着在角色上，提供持续效果 |
| **事件类** | 双方 | 一次性全局效果，影响所有玩家 |
| **反击类** | 防御方 | 在特定条件下自动触发反击 |
| **连击类** | 攻击方 | 配合其他攻击卡牌增强效果 |

### 6.2 稀有度体系

#### 6.2.1 稀有度等级

| 稀有度 | 颜色标识 | 出现概率 | 强度等级 | 数量建议 |
|--------|----------|----------|----------|----------|
| **普通 (Common)** | 白色 | 60% | 1-2 | 60张 |
| **稀有 (Rare)** | 蓝色 | 25% | 2-3 | 25张 |
| **史诗 (Epic)** | 紫色 | 12% | 3-4 | 12张 |
| **传说 (Legendary)** | 金色 | 3% | 4-5 | 3张 |

#### 6.2.2 稀有度与效果复杂度

```typescript
// types/rarity.ts

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const RARITY_CONFIG: Record<CardRarity, {
  color: string;
  maxEffects: number;
  maxDuration: number;
  canHaveSpecial: boolean;
}> = {
  common: {
    color: '#FFFFFF',
    maxEffects: 1,
    maxDuration: 1,
    canHaveSpecial: false
  },
  rare: {
    color: '#0070DD',
    maxEffects: 2,
    maxDuration: 2,
    canHaveSpecial: false
  },
  epic: {
    color: '#A335EE',
    maxEffects: 3,
    maxDuration: 3,
    canHaveSpecial: true
  },
  legendary: {
    color: '#FF8000',
    maxEffects: 4,
    maxDuration: -1,  // 永久
    canHaveSpecial: true
  }
};
```

### 6.3 卡牌效果与各系统联动设计

#### 6.3.1 骰子判定联动

```typescript
// 示例：判定增强卡牌
{
  card_code: 'ATTACK_051',
  name: '精准计算',
  type: '高级威胁类',
  faction: 'attack',
  rarity: 'rare',
  cost: { information: 1 },
  trigger_condition: '本回合的下一次攻击判定前使用',
  effects: [
    {
      target: 'self',
      mechanic: 'dice_modifier',
      detail: '下一次攻击判定可以重掷一次，取较优结果'
    }
  ],
  duration: 1,
  source_event: '精密攻击计划'
}
```

#### 6.3.2 角色技能联动

```typescript
// 示例：角色专属卡牌
{
  card_code: 'ATTACK_052',
  name: '零日漏洞',
  type: '漏洞利用类',
  faction: 'attack',
  rarity: 'epic',
  cost: { information: 3, compute: 2 },
  trigger_condition: '仅限"漏洞猎人"角色使用',
  effects: [
    {
      target: 'target_area',
      mechanic: 'instant_penetration',
      detail: '无视防御直接放置权限标记'
    },
    {
      target: 'self',
      mechanic: 'role_bonus',
      detail: '漏洞猎人使用时，额外获得1点权限'
    }
  ],
  duration: 0,
  source_event: '未公开的零日漏洞'
}
```

#### 6.3.3 剪刀石头布联动

```typescript
// 示例：RPS增强卡牌
{
  card_code: 'DEF_031',
  name: '读心术',
  type: '主动与欺骗防御类',
  faction: 'defense',
  rarity: 'rare',
  cost: { information: 2 },
  trigger_condition: '下一次剪刀石头布对决前使用',
  effects: [
    {
      target: 'self',
      mechanic: 'rps_advantage',
      detail: '下一次剪刀石头布对决中，你可以看到对方选择后再决定（延迟2秒）'
    }
  ],
  duration: 1,
  source_event: '心理分析技术'
}
```

### 6.4 卡牌池策略深度设计

#### 6.4.1 卡牌组合示例

**攻击方连击组合：**

| 顺序 | 卡牌 | 效果 | 连击加成 |
|------|------|------|----------|
| 1 | 恶意链接/附件 | 放置恶意载荷标记 | - |
| 2 | 远程代码执行 | 攻击判定+放置权限 | 判定难度-1 |
| 3 | 权限提升 | 获得额外权限 | 获得权限+1 |

**防御方反制组合：**

| 顺序 | 卡牌 | 效果 | 配合效果 |
|------|------|------|----------|
| 1 | 蜜罐陷阱 | 诱捕攻击者 | - |
| 2 | 异常行为检测 | 重掷防御判定 | 若触发蜜罐，判定难度-2 |
| 3 | 流量清洗 | 清除威胁 | 清除所有攻击方标记 |

#### 6.4.2 卡牌库填充计划

**目标卡牌总数：100张**

| 阵营 | 普通 | 稀有 | 史诗 | 传说 | 合计 |
|------|------|------|------|------|------|
| 攻击方 | 36 | 15 | 7 | 2 | 60 |
| 防御方 | 24 | 10 | 5 | 1 | 40 |
| **合计** | **60** | **25** | **12** | **3** | **100** |

**新增卡牌设计清单：**

```typescript
// data/newCards_v10.ts

export const newAttackCards: Card[] = [
  // ========== 环境控制类（5张） ==========
  {
    card_code: 'ATTACK_060',
    name: '网络瘫痪',
    type: '环境控制类',
    faction: 'attack',
    rarity: 'epic',
    cost: { funds: 4, compute: 2 },
    trigger_condition: '影响所有区域',
    effects: [
      { target: 'all_areas', mechanic: 'disable_resources', detail: '所有区域本回合不产出资源' }
    ],
    duration: 1,
    source_event: '大规模网络中断'
  },
  // ... 更多环境控制卡
  
  // ========== 装备类（5张） ==========
  {
    card_code: 'ATTACK_065',
    name: '高级渗透工具包',
    type: '装备类',
    faction: 'attack',
    rarity: 'rare',
    cost: { funds: 3 },
    trigger_condition: '装备到角色',
    effects: [
      { target: 'self', mechanic: 'equip_buff', detail: '所有漏洞利用类卡牌判定难度-1' }
    ],
    duration: -1,  // 永久
    source_event: '专业渗透工具'
  },
  // ... 更多装备卡
  
  // ========== 连击类（10张） ==========
  {
    card_code: 'ATTACK_070',
    name: '组合拳',
    type: '连击类',
    faction: 'attack',
    rarity: 'common',
    cost: { compute: 1 },
    trigger_condition: '本回合已使用过攻击卡牌',
    effects: [
      { target: 'defender', mechanic: 'combo_damage', detail: '造成1点算力伤害，每已使用1张攻击卡额外+1伤害' }
    ],
    duration: 0,
    source_event: '连续攻击'
  },
  // ... 更多连击卡
];

export const newDefenseCards: Card[] = [
  // ========== 反击类（8张） ==========
  {
    card_code: 'DEF_040',
    name: '自动反击系统',
    type: '反击类',
    faction: 'defense',
    rarity: 'rare',
    cost: { compute: 2, funds: 2 },
    trigger_condition: '当攻击方对你使用卡牌时自动触发',
    effects: [
      { target: 'attacker', mechanic: 'counter_attack', detail: '攻击方失去1点算力' }
    ],
    duration: 2,
    source_event: '自动化防御响应'
  },
  // ... 更多反击卡
  
  // ========== 事件类（5张） ==========
  {
    card_code: 'DEF_048',
    name: '安全审计',
    type: '事件类',
    faction: 'defense',
    rarity: 'epic',
    cost: { funds: 5 },
    trigger_condition: '影响所有玩家',
    effects: [
      { target: 'all_players', mechanic: 'reveal_tokens', detail: '所有区域的标记对防御方可见' },
      { target: 'attackers', mechanic: 'resource_penalty', detail: '攻击方失去2点信息' }
    ],
    duration: 0,
    source_event: '全面安全审查'
  },
  // ... 更多事件卡
];
```

---

## 七、实施路线图

### 7.1 开发阶段划分

| 阶段 | 时间 | 主要任务 | 交付物 |
|------|------|----------|--------|
| **阶段一** | 第1-2周 | 骰子判定系统实现 | diceEngine.ts, 单元测试 |
| **阶段二** | 第3-4周 | 剪刀石头布机制实现 | rpsEngine.ts, UI组件 |
| **阶段三** | 第5-6周 | 角色技能重设计 | roles_v10.ts, 平衡测试 |
| **阶段四** | 第7-8周 | 回合机制重构 | turnEngine.ts, 状态管理 |
| **阶段五** | 第9-10周 | 卡牌库扩展 | 40张新卡牌, 稀有度系统 |
| **阶段六** | 第11-12周 | 系统集成测试 | 完整测试报告, Bug修复 |

### 7.2 关键里程碑

```
里程碑1 (第2周末): 骰子判定系统可用
├── 基础判定功能
├── 难度修正机制
└── 角色技能联动

里程碑2 (第4周末): 特殊判定机制可用
├── 剪刀石头布UI
├── 5秒倒计时功能
└── 三种结果效果结算

里程碑3 (第6周末): 角色系统重设计完成
├── 6名角色新技能
├── 技能平衡性调整
└── AI角色适配

里程碑4 (第8周末): 回合机制重构完成
├── 6阶段回合流程
├── 回合锁定机制
└── 状态管理优化

里程碑5 (第10周末): 卡牌库扩展完成
├── 100张卡牌设计
├── 稀有度系统
└── 卡牌联动效果

里程碑6 (第12周末): v10.0版本发布
├── 完整功能测试
├── 性能优化
└── 文档更新
```

### 7.3 技术债务清理

| 优先级 | 问题 | 解决方案 | 预计工时 |
|--------|------|----------|----------|
| P0 | 骰子系统从d10改为d6 | 重构rollDice函数 | 4h |
| P0 | 角色技能效果不明确 | 重新设计6个技能 | 16h |
| P1 | 回合状态管理混乱 | 实现TurnState管理 | 12h |
| P1 | 卡牌效果硬编码 | 实现EffectRegistry | 20h |
| P2 | 缺乏单元测试 | 编写核心系统测试 | 24h |
| P2 | 网络同步不稳定 | 实现预测回滚机制 | 32h |

---

## 附录

### A. 术语表

| 术语 | 英文 | 定义 |
|------|------|------|
| 判定 | Check | 通过掷骰子决定行动成功与否的机制 |
| 难度 | Difficulty | 判定成功的门槛值，1-6级 |
| 修正值 | Modifier | 影响判定难度的数值，正数降低难度 |
| 大成功 | Critical Success | 点数6且难度≤3，效果翻倍 |
| 大失败 | Critical Failure | 点数1且难度≥4，遭受额外惩罚 |
| 行动点 | Action Point | 每回合可执行操作的次数 |
| 响应 | Response | 在其他玩家行动时进行的反制操作 |
| 持续时间 | Duration | 效果持续的回合数，-1表示永久 |
| 稀有度 | Rarity | 卡牌的稀有程度，影响出现概率和强度 |

### B. 参考文档

1. [AI_BALANCE_IMPROVEMENT_PLAN_v9.md](./AI_BALANCE_IMPROVEMENT_PLAN_v9.md) - v9.0平衡性改进方案
2. [src/types/game.ts](./src/types/game.ts) - 游戏类型定义
3. [src/data/cards.ts](./src/data/cards.ts) - 卡牌数据
4. [src/engine/gameEngine.ts](./src/engine/gameEngine.ts) - 游戏引擎

---

*文档结束*
