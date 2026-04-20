# 《道高一丈：数字博弈》v9.0 平衡性改进实施指南

**实施日期**: 2026-01-30  
**目标版本**: v9.0 平衡优化版  
**预计实施周期**: 8-10周

---

## 一、改进方案概览

本次改进旨在解决当前游戏存在的核心平衡性问题，包括：
- ✅ 攻防卡牌数量不平衡（47 vs 16）
- ✅ 资源系统偏向攻击方
- ✅ 权限系统增长过快
- ✅ 胜利条件不对称
- ✅ 持续效果滥用
- ✅ 区域控制机制不完善
- ✅ 角色技能不平衡

---

## 二、实施步骤详解

### 阶段一：防御方新卡牌集成（第1-2周）

#### 2.1 文件修改清单

**主要修改文件**:
1. `src/data/cards.ts` - 添加新防御方卡牌
2. `src/types/game.ts` - 添加新效果类型（如有需要）
3. `src/engine/gameEngine.ts` - 实现新卡牌效果逻辑

#### 2.2 具体实施步骤

**步骤1：添加新卡牌数据**

在 `src/data/cards.ts` 中，找到 `defenseCards` 数组，在现有16张卡牌后添加新的12张卡牌：

```typescript
// 在 defenseCards 数组末尾添加
{
  card_code: 'DEF_017',
  name: '算力资源调度',
  type: '资源与应急管理类',
  faction: 'defense',
  cost: { funds: 1 },
  trigger_condition: '在策略与规划阶段使用',
  effects: [
    { target: 'self', mechanic: 'resource_gain', detail: '立即获得2点算力' },
    { target: 'self', mechanic: 'resource_regen', detail: '下回合开始时额外获得1点算力' }
  ],
  duration: 1,
  source_event: '内部资源重新分配与优化',
  tags: ['sustain']
},
// ... 其他11张卡牌
```

**步骤2：实现新效果机制**

在 `src/engine/gameEngine.ts` 中，添加对新效果的处理：

```typescript
// 在 executeCardEffect 函数中添加新case
case 'resource_regen': {
  // 下回合资源恢复效果
  const nextTurnRegen = {
    playerId: player.id,
    resourceType: 'compute',
    amount: 1,
    triggerTurn: gameState.turn + 1
  };
  newGameState.nextTurnEffects = [...(newGameState.nextTurnEffects || []), nextTurnRegen];
  break;
}

case 'control_boost': {
  // 区域控制强度提升
  const area = newGameState.areas[targetArea];
  area.controlStrength = (area.controlStrength || 0) - 2; // 负值表示偏向防御方
  break;
}

case 'control_break': {
  // 解除区域控制
  const area = newGameState.areas[targetArea];
  area.controlledBy = null;
  area.controlTeam = null;
  area.controlStrength = 0;
  break;
}
```

**步骤3：更新卡牌导出**

确保 `allCards` 数组包含所有新卡牌：

```typescript
export const allCards: Card[] = [
  ...attackCards,
  ...defenseCards,  // 包含新添加的12张卡牌
  ...resourceConvertCards,
  ...advancedCards
];
```

#### 2.3 验收标准
- [ ] 12张新防御方卡牌正确显示在卡牌列表中
- [ ] 每张新卡牌的效果能够正确触发
- [ ] 卡牌成本、持续时间等属性正确
- [ ] 游戏构建无错误

---

### 阶段二：攻击方卡牌平衡调整（第2-3周）

#### 2.1 调整清单

根据 `cards_v9_improvement.ts` 中的 `attackCardAdjustments` 配置，调整以下卡牌：

| 卡牌代码 | 调整类型 | 原值 | 新值 |
|---------|---------|------|------|
| ATTACK_001 | 效果强度 | 算力-3 | 算力-2 |
| ATTACK_009 | 资源消耗 | funds:2 | funds:3 |
| ATTACK_012 | 效果强度 | 资金-3 | 资金-2 |
| ATTACK_002 | 持续时间 | 2回合 | 1回合 |
| ATTACK_006 | 持续时间 | 3回合 | 2回合 |
| ATTACK_046 | 资源消耗+效果 | 见配置 | 见配置 |
| ATTACK_016 | 资源消耗 | funds:1 | funds:2 |
| ATTACK_047 | 资源消耗 | funds:3 | funds:4 |

#### 2.2 实施步骤

**步骤1：修改卡牌数据**

在 `src/data/cards.ts` 中，找到对应的攻击方卡牌，修改其属性：

```typescript
// 示例：修改 ATTACK_001
{
  card_code: 'ATTACK_001',
  name: '带宽洪水攻击',
  // ... 其他属性
  effects: [
    { 
      target: 'defender_power_pool', 
      mechanic: 'instant_damage', 
      detail: '若防御判定失败，其算力池减少2点'  // 从3改为2
    },
    // ...
  ],
  // ...
}
```

**步骤2：调整效果执行逻辑**

在 `src/engine/gameEngine.ts` 中，修改持续伤害效果的计算：

```typescript
// 修改持续伤害计算逻辑
case 'continuous_damage': {
  const damage = 0.5; // 从1改为0.5
  const actualDamage = Math.ceil(damage); // 向上取整
  // ... 应用伤害
}
```

#### 2.3 验收标准
- [ ] 所有8张攻击方卡牌调整完成
- [ ] 调整后的效果在游戏中正确体现
- [ ] 游戏平衡性有明显改善

---

### 阶段三：资源系统优化（第3-4周）

#### 3.1 配置修改

**修改文件**: `src/types/game.ts` 和 `src/engine/gameEngine.ts`

#### 3.2 实施步骤

**步骤1：修改初始资源配置**

在 `src/types/game.ts` 中，修改 `RESOURCE_LIMITS`：

```typescript
export const RESOURCE_LIMITS = {
  attack: {
    compute: { min: 0, max: 15, initial: 3 },
    funds: { min: 0, max: 20, initial: 5 },
    information: { min: 0, max: 10, initial: 1 },  // 从2改为1
    access: { min: 0, max: 5, initial: 0 }
  },
  defense: {
    compute: { min: 0, max: 18, initial: 4 },  // max从15改为18，initial从3改为4
    funds: { min: 0, max: 25, initial: 6 },    // max从20改为25，initial从5改为6
    information: { min: 0, max: 10, initial: 2 },
    access: { min: 0, max: 5, initial: 0 }
  }
};
```

**步骤2：修改资源获取逻辑**

在 `src/engine/gameEngine.ts` 中，修改 `gainResourcesPerTurn` 函数：

```typescript
export function gainResourcesPerTurn(gameState: GameState, player: Player): Resources {
  const isAttack = player.faction === 'attack';
  
  return {
    compute: isAttack ? 0 : 1,  // 防御方+1，攻击方0
    funds: isAttack ? Math.ceil(0.5) : 1,  // 防御方+1，攻击方+0.5（向上取整）
    information: isAttack ? 1 : 0,  // 攻击方+1，防御方0
    access: 0  // 双方都不自动获取
  };
}
```

**步骤3：修改初始资源分配**

在 `src/engine/gameEngine.ts` 中，修改 `createInitialGameState` 函数：

```typescript
function createInitialResources(faction: Faction): Resources {
  if (faction === 'attack') {
    return {
      compute: 3,
      funds: 5,
      information: 1,  // 从2改为1
      access: 0
    };
  } else {
    return {
      compute: 4,  // 从3改为4
      funds: 6,    // 从5改为6
      information: 2,
      access: 0
    };
  }
}
```

#### 3.3 验收标准
- [ ] 攻防双方初始资源正确分配
- [ ] 每回合资源自动获取正确
- [ ] 资源上限限制正确

---

### 阶段四：权限系统调整（第4-5周）

#### 4.1 配置修改

**修改文件**: `src/engine/gameEngine.ts`

#### 4.2 实施步骤

**步骤1：添加权限增长限制**

```typescript
// 在权限等级变化函数中添加限制
export function changeInfiltrationLevel(
  gameState: GameState, 
  player: Player, 
  change: number
): GameState {
  const maxGainPerTurn = gameState.turn <= 3 ? 0.5 : 1;  // 前3回合限制0.5，之后1
  
  // 限制增长
  const actualChange = Math.min(change, maxGainPerTurn);
  
  // ... 应用变化
}

export function changeSecurityLevel(
  gameState: GameState, 
  player: Player, 
  change: number
): GameState {
  // 前3回合安全等级不会下降
  if (gameState.turn <= 3 && change < 0) {
    return gameState;  // 不应用下降
  }
  
  const maxLossPerTurn = 1;  // 每回合最多下降1
  const actualChange = Math.max(change, -maxLossPerTurn);
  
  // ... 应用变化
}
```

**步骤2：调整高级卡牌解锁条件**

```typescript
// 修改解锁检查函数
export function canUseAdvancedCard(
  player: Player, 
  card: Card
): boolean {
  if (!card.unlockCondition) return true;
  
  const { requiredLevel, requiredFaction, requiredPermission } = card.unlockCondition;
  
  // 攻击方从5提升到6，防御方从7降低到6
  const adjustedRequiredLevel = 6;
  
  // ... 检查逻辑
}
```

#### 4.3 验收标准
- [ ] 权限等级增长限制正确生效
- [ ] 前3回合保护机制正确
- [ ] 高级卡牌解锁条件调整正确

---

### 阶段五：胜利条件平衡（第5周）

#### 5.1 配置修改

**修改文件**: `src/data/cards.ts` 中的 `victoryConditions`

#### 5.2 实施步骤

**步骤1：修改资源枯竭条件**

```typescript
{
  id: 'A1',
  name: '资源枯竭',
  faction: 'attack',
  description: '任一防御方玩家的算力与资金资源总和 ≤ 1',  // 从≤2改为≤1
  check: (gameState) => {
    const defenders = gameState.players.filter(p => p.faction === 'defense');
    return defenders.some(d => d.resources.compute + d.resources.funds <= 1);  // 从2改为1
  }
}
```

**步骤2：修改权限主宰条件**

```typescript
{
  id: 'A2',
  name: '权限主宰',
  faction: 'attack',
  description: '攻击方阵营在Internal区域拥有的权限总和 ≥ 5，且保持此状态2回合',  // 从≥4改为≥5，新增2回合要求
  check: (gameState) => {
    const internalArea = gameState.areas.Internal;
    const attackAccessTokens = internalArea.tokens.filter(t => 
      t.type === '权限标记' && gameState.players.find(p => p.id === t.owner)?.faction === 'attack'
    );
    
    // 检查是否≥5且保持2回合
    if (attackAccessTokens.length >= 5) {
      // 检查保持时间
      const controlTurns = gameState.turn - (internalArea.controlTurn || 0);
      return controlTurns >= 2;
    }
    return false;
  }
}
```

**步骤3：修改威胁清零条件**

```typescript
{
  id: 'D1',
  name: '威胁清零',
  faction: 'defense',
  description: '从第5回合开始，每2回合检测一次，防御方清除所有攻击方威胁标记',
  check: (gameState) => {
    // 从第5回合开始检测（从7改为5）
    if (gameState.turn < 5) return false;
    
    // 每2回合检测一次
    if ((gameState.turn - 5) % 2 !== 0) return false;
    
    // ... 检查是否有威胁标记
  }
}
```

#### 5.3 验收标准
- [ ] 所有胜利条件调整正确
- [ ] 胜利判定逻辑正确
- [ ] 游戏结束条件合理

---

### 阶段六：持续效果限制（第5-6周）

#### 6.1 配置修改

**修改文件**: `src/engine/gameEngine.ts`

#### 6.2 实施步骤

**步骤1：实现叠加限制**

```typescript
// 在放置持续效果前检查限制
export function canPlaceContinuousEffect(
  gameState: GameState,
  area: AreaType,
  effectType: string,
  player: Player
): { allowed: boolean; reason?: string } {
  const areaState = gameState.areas[area];
  
  // 检查同一区域的持续伤害效果数量
  const damageEffects = areaState.tokens.filter(t => 
    ['CC攻击标记', '恶意载荷标记', '监听标记'].includes(t.type)
  );
  
  if (damageEffects.length >= 2) {
    return { allowed: false, reason: '该区域已有2个持续伤害效果，无法继续添加' };
  }
  
  // 检查同一玩家的持续效果数量
  const playerEffects = gameState.players
    .filter(p => p.id === player.id)
    .reduce((count, p) => count + (p.activeEffects?.length || 0), 0);
  
  if (playerEffects >= 3) {
    return { allowed: false, reason: '该玩家已有3个持续效果，无法继续添加' };
  }
  
  return { allowed: true };
}
```

**步骤2：调整效果强度**

```typescript
// 修改持续伤害计算
export function calculateContinuousDamage(
  baseDamage: number,
  effectStack: number
): number {
  // 基础伤害从1改为0.5
  const adjustedBase = 0.5;
  
  // 向上取整
  return Math.ceil(adjustedBase * effectStack);
}
```

#### 6.3 验收标准
- [ ] 持续效果叠加限制正确
- [ ] 效果强度调整正确
- [ ] 持续时间限制正确

---

### 阶段七：区域控制机制（第6-7周）

#### 7.1 配置修改

**修改文件**: `src/engine/gameEngine.ts`

#### 7.2 实施步骤

**步骤1：实现控制强度计算**

```typescript
// 更新区域控制
export function updateAreaControl(
  gameState: GameState,
  area: AreaType
): GameState {
  const areaState = gameState.areas[area];
  
  // 控制强度最大值5
  const maxStrength = 5;
  
  // 控制强度衰减（每回合-1）
  if (areaState.controlTurn && gameState.turn - areaState.controlTurn >= 2) {
    areaState.controlStrength = Math.max(0, (areaState.controlStrength || 0) - 1);
  }
  
  // 限制最大值
  areaState.controlStrength = Math.min(maxStrength, Math.abs(areaState.controlStrength || 0)) 
    * Math.sign(areaState.controlStrength || 0);
  
  // ... 更新控制者
}
```

**步骤2：实现区域控制效果**

```typescript
// 应用区域控制效果
export function applyAreaControlEffects(gameState: GameState): GameState {
  Object.entries(gameState.areas).forEach(([areaType, areaState]) => {
    const controlConfig = AREA_STRATEGIC_VALUE[areaType as AreaType];
    
    if (areaState.controlledBy) {
      const controller = gameState.players.find(p => p.id === areaState.controlledBy);
      
      if (controller?.faction === 'attack' && controlConfig.controlBonus.infiltration) {
        // 攻击方控制Perimeter，渗透等级+0.5
        controller.permissions!.infiltrationLevel += 0.5;
      }
      
      if (controller?.faction === 'defense' && controlConfig.controlBonus.security) {
        // 防御方控制Internal，安全等级+0.5
        controller.permissions!.securityLevel += 0.5;
      }
      
      // ICS区域资源加成
      if (areaType === 'ICS' && controlConfig.controlBonus.infiltration === 3) {
        controller!.resources.compute += 1;
      }
    }
  });
  
  return gameState;
}
```

#### 7.3 验收标准
- [ ] 控制强度计算正确
- [ ] 控制效果正确应用
- [ ] 区域争夺机制正确

---

### 阶段八：角色技能调整（第7-8周）

#### 8.1 配置修改

**修改文件**: `src/data/cards.ts` 中的 `roles` 和 `src/engine/gameEngine.ts`

#### 8.2 实施步骤

**步骤1：修改角色技能数据**

```typescript
// 防御方角色技能增强
{
  name: '安全分析师',
  faction: 'defense',
  ability: '威胁溯源',
  trigger: '在行动宣言与响应阶段，当防御方玩家决定响应一张攻击卡牌时',
  effect: '弃置1点信息，检视攻击方2张手牌，可选择1张置于牌堆顶，然后获得1点算力'  // 新增资源返还
},
{
  name: '应急响应专家',
  faction: 'defense',
  ability: '快速响应',
  trigger: '在对抗判定与结算阶段，当防御方玩家需要进行防御判定时',
  effect: '每回合限两次，弃置1点算力，使本次防御判定的基础值+2'  // 从1次改为2次
},
{
  name: '架构加固师',
  faction: 'defense',
  ability: '纵深防御',
  trigger: '在策略与规划阶段',
  effect: '每回合限一次，支付1点资金，使最多两个区域防御效果持续时间延长1回合'  // 从1个区域改为2个
}

// 攻击方角色技能调整
{
  name: '渗透专家',
  faction: 'attack',
  ability: '零日预研',
  trigger: '在结算阶段，当玩家使用的一张漏洞利用类卡牌被判定为攻击成功后',
  effect: '本次攻击的原始信息消耗记录值减少1点，本次攻击成功窃取的权限资源，额外增加0.5点（向上取整）'  // 从+1改为+0.5
}
```

**步骤2：实现技能效果逻辑**

```typescript
// 在 gameEngine.ts 中添加技能效果处理
export function applyRoleAbility(
  gameState: GameState,
  player: Player,
  abilityType: string
): GameState {
  switch (abilityType) {
    case 'threat_trace':  // 安全分析师
      // 返还1点算力
      player.resources.compute += 1;
      break;
      
    case 'emergency_response':  // 应急响应专家
      // 使用次数限制在2次
      const usageCount = gameState.roleAbilityUsage[player.id] || 0;
      if (usageCount >= 2) {
        return gameState;  // 超过次数限制
      }
      gameState.roleAbilityUsage[player.id] = usageCount + 1;
      break;
      
    // ... 其他技能
  }
  
  return gameState;
}
```

#### 8.3 验收标准
- [ ] 防御方角色技能增强正确
- [ ] 攻击方角色技能调整正确
- [ ] 技能使用次数限制正确

---

### 阶段九：游戏节奏优化（第8周）

#### 9.1 配置修改

**修改文件**: `src/engine/gameEngine.ts`

#### 9.2 实施步骤

**步骤1：实现前期保护机制**

```typescript
// 在回合开始阶段应用节奏效果
export function applyGamePaceEffects(gameState: GameState): GameState {
  const turn = gameState.turn;
  
  // 前期（1-3回合）
  if (turn <= 3) {
    gameState.players.forEach(player => {
      if (player.faction === 'defense') {
        // 防御方额外获得1点资源
        player.resources.compute += 1;
        // 防御判定+1
        player.tempDefenseBonus = 1;
      } else {
        // 攻击方渗透等级限制
        player.maxInfiltrationGain = 0.5;
        // 持续效果限制
        player.maxContinuousEffects = 1;
      }
    });
  }
  
  // 中期（4-6回合）
  else if (turn <= 6) {
    gameState.players.forEach(player => {
      if (player.faction === 'defense') {
        // 卡牌消耗-1
        player.cardCostReduction = 1;
        // 每回合恢复1点资源
        player.resources.compute = Math.min(
          player.resources.compute + 1,
          RESOURCE_LIMITS.defense.compute.max
        );
      } else {
        // 持续效果强度-50%
        player.continuousEffectMultiplier = 0.5;
      }
    });
  }
  
  // 后期（7-12回合）
  else {
    gameState.players.forEach(player => {
      if (player.faction === 'defense') {
        // 每回合恢复1点安全等级
        if (player.permissions) {
          player.permissions.securityLevel = Math.min(
            10,
            player.permissions.securityLevel + 1
          );
        }
      } else {
        // 高级卡牌消耗+1
        player.advancedCardCostIncrease = 1;
      }
    });
  }
  
  return gameState;
}
```

#### 9.3 验收标准
- [ ] 前期保护机制正确
- [ ] 中期反击机会正确
- [ ] 后期平衡调整正确

---

### 阶段十：测试验证（第9-10周）

#### 10.1 测试计划

**单元测试**:
```bash
# 运行单元测试
npm run test:unit

# 测试覆盖率检查
npm run test:coverage
```

**集成测试**:
```bash
# 运行集成测试
npm run test:integration

# 完整游戏流程测试
npm run test:gameflow
```

**平衡性测试**:
```bash
# 运行AI对战测试（100局）
npm run test:balance -- --games=100

# 生成平衡性报告
npm run test:balance:report
```

#### 10.2 验收标准

| 指标 | 目标值 | 测试方法 |
|------|--------|---------|
| 攻防胜率差 | < 10% | AI对战100局统计 |
| 平均游戏时长 | 15-25分钟 | 记录每局时长 |
| 卡牌使用率 | > 30% | 统计每张卡牌使用次数 |
| 崩溃率 | < 1% | 长时间运行测试 |

---

## 三、实施检查清单

### 实施前准备
- [ ] 备份当前代码
- [ ] 创建新分支 `feature/v9-balance-improvement`
- [ ] 准备测试环境
- [ ] 通知团队成员

### 实施过程中
- [ ] 每个阶段完成后进行代码审查
- [ ] 每个阶段完成后进行功能测试
- [ ] 记录遇到的问题和解决方案
- [ ] 及时更新文档

### 实施后验证
- [ ] 运行完整的测试套件
- [ ] 进行多人联机测试
- [ ] 收集测试反馈
- [ ] 生成实施报告

---

## 四、风险与应对

### 风险1：新卡牌效果过于强大
**应对措施**: 
- 先在测试环境验证
- 准备快速回滚方案
- 设置效果开关

### 风险2：游戏节奏变化过大
**应对措施**:
- 分阶段实施
- 保留原配置作为备选
- 收集玩家反馈及时调整

### 风险3：AI行为异常
**应对措施**:
- 更新AI决策逻辑
- 增加AI测试覆盖
- 准备AI回滚版本

---

## 五、联系与支持

**技术负责人**: [待填写]  
**游戏设计师**: [待填写]  
**测试负责人**: [待填写]

**问题反馈**: [待填写邮箱/群聊]

---

**文档版本**: v1.0  
**最后更新**: 2026-01-30
