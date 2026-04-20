# 《道高一丈：数字博弈》v16.0 卡牌体系全面重构方案

## 文档信息

| 项目 | 内容 |
|------|------|
| **版本** | v16.0 |
| **日期** | 2026-01-31 |
| **目标** | 重构卡牌体系，与渗透等级/安全等级科技树系统深度融合 |
| **参考** | 三国杀、炉石传说、结构化摘要.json、桌游设计理论 |
| **状态** | 完整设计方案 |

---

## 目录

1. [问题诊断与分析](#一问题诊断与分析)
2. [设计理念与参考](#二设计理念与参考)
3. [科技树系统重构](#三科技树系统重构)
4. [卡牌体系重构](#四卡牌体系重构)
5. [完整卡牌设计](#五完整卡牌设计)
6. [实施计划](#六实施计划)

---

## 一、问题诊断与分析

### 1.1 当前系统核心问题

#### 问题①：卡牌效果与等级系统脱节

**现状**：
- 当前卡牌效果分散（资源窃取、区域控制、持续伤害等）
- 渗透等级/安全等级的提升方式不明确
- 卡牌效果与等级变化缺乏直接关联

**影响**：
- 玩家难以理解卡牌对核心目标（等级）的贡献
- 策略选择缺乏明确方向
- 游戏节奏混乱

#### 问题②：科技树系统与卡牌体系不匹配

**现状**：
- 科技树概念存在但未与卡牌有效结合
- 卡牌缺乏"科技等级"概念
- 高等级卡牌与低等级卡牌区分度不足

**影响**：
- 缺乏成长感和进阶体验
- 卡牌之间缺乏协同效应
- 策略深度不足

#### 问题③：攻防双方卡牌效果不对称

**现状**：
- 攻击方卡牌效果多样但分散
- 防御方卡牌被动防守为主
- 双方缺乏明确的对抗焦点

**影响**：
- 游戏变成"各打各的"
- 缺乏紧张的攻防对抗
- 胜负取决于运气而非策略

### 1.2 问题根源分析

```
┌─────────────────────────────────────────────────────────────────┐
│                     问题根源分析图                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  核心问题：卡牌效果体系与等级系统未建立有效连接                    │
│                                                                  │
│       ┌─────────────────┐                                       │
│       │  渗透等级/安全等级 │ ←── 游戏核心目标                      │
│       │  （0-75血量系统） │                                       │
│       └────────┬────────┘                                       │
│                │                                                │
│                │  ❌ 缺乏直接关联                                │
│                ▼                                                │
│       ┌─────────────────┐                                       │
│       │   当前卡牌效果    │                                       │
│       │ • 资源窃取        │                                       │
│       │ • 区域控制        │ ←── 效果分散，与等级无关              │
│       │ • 持续伤害        │                                       │
│       │ • 判定机制        │                                       │
│       └─────────────────┘                                       │
│                                                                  │
│  理想状态：                                                       │
│                                                                  │
│       ┌─────────────────┐                                       │
│       │  渗透等级/安全等级 │                                       │
│       └────────┬────────┘                                       │
│                │                                                │
│                │  ✅ 直接驱动                                    │
│                ▼                                                │
│       ┌─────────────────┐                                       │
│       │   重构后卡牌效果  │                                       │
│       │ • 提升自身等级    │ ←── 70%卡牌围绕等级设计               │
│       │ • 降低对方等级    │                                       │
│       │ • 等级保护/压制   │                                       │
│       │ • 等级联动效果    │                                       │
│       └─────────────────┘                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、设计理念与参考

### 2.1 三国杀设计精髓借鉴

#### 2.1.1 血量与技能的紧密关联

**三国杀核心机制**：
- 武将血量（体力值）是核心资源
- 技能效果围绕血量变化设计（如"卖血"技能）
- 血量降低可触发强力技能

**应用到本游戏**：
- 渗透等级/安全等级作为"血量"
- 卡牌效果围绕等级变化设计
- 低等级时可触发强力反击卡牌

#### 2.1.2 判定机制的策略性

**三国杀判定机制**：
- 【乐不思蜀】、【闪电】等卡牌依赖判定
- 判定结果决定卡牌效果
- 可通过技能改判

**应用到本游戏**：
- 保留骰子判定作为核心机制
- 判定成功则等级变化生效
- 设计"改判"类卡牌增加策略深度

#### 2.1.3 锦囊牌的即时性与延时性

**三国杀锦囊分类**：
- 即时锦囊：立即生效（【杀】、【闪】）
- 延时锦囊：下回合生效（【乐不思蜀】）

**应用到本游戏**：
- 即时卡牌：立即改变等级
- 延时卡牌：下回合或特定条件触发等级变化

### 2.2 炉石传说设计精髓借鉴

#### 2.2.1 水晶法力系统的清晰性

**炉石核心机制**：
- 每回合水晶自动增长
- 卡牌消耗与水晶挂钩
- 高费卡牌效果更强

**应用到本游戏**：
- 渗透等级/安全等级作为"游戏进度"
- 高等级解锁更强力的卡牌效果
- 资源消耗与等级变化幅度挂钩

#### 2.2.2 职业特色与卡牌协同

**炉石职业设计**：
- 每个职业有明确的特色（法师直伤、牧师治疗）
- 卡牌之间有协同效应（连击、过载）
- 构筑策略围绕职业特色展开

**应用到本游戏**：
- 攻击方：专注降低对方安全等级
- 防御方：专注提升自身安全等级
- 设计"连击"机制：连续使用同类卡牌效果增强

#### 2.2.3 随从与法术的平衡

**炉石卡牌分类**：
- 随从：持续战场存在
- 法术：即时效果

**应用到本游戏**：
- 持续效果卡牌：类似"随从"，多回合影响等级
- 即时效果卡牌：类似"法术"，立即改变等级

### 2.3 桌游设计理论应用

#### 2.3.1 有意义的选择（Meaningful Choices）

**理论来源**：《The Art of Game Design》Jesse Schell

**应用**：
- 每张卡牌都提供明确的风险收益比
- 玩家需要在"提升自身等级"和"降低对方等级"之间做选择
- 没有绝对的最优解，取决于局势

#### 2.3.2 心流体验（Flow）

**理论来源**：《心流：最优体验心理学》Mihaly Csikszentmihalyi

**应用**：
- 技能与挑战平衡：卡牌效果难度与玩家当前等级匹配
- 清晰的目标：每张卡牌都明确显示对等级的影响
- 即时反馈：使用卡牌后立即看到等级变化

#### 2.3.3 游戏节奏（Pacing）

**理论来源**：《Challenges for Game Designers》Brenda Brathwaite

**应用**：
- 前期：等级变化缓慢，建立基础
- 中期：等级变化加速，对抗激烈
- 后期：等级接近阈值，紧张刺激

---

## 三、科技树系统重构

### 3.1 科技树与等级系统融合

#### 3.1.1 核心概念

**渗透科技树**（攻击方）：
- 代表攻击技术的演进路径
- 从基础侦查 → 漏洞利用 → 权限提升 → 完全控制
- 每级科技解锁更强力的攻击卡牌

**安全科技树**（防御方）：
- 代表防御体系的构建路径
- 从基础防护 → 检测响应 → 主动防御 → 绝对安全
- 每级科技解锁更强力的防御卡牌

#### 3.1.2 科技等级与卡牌等级对应

| 科技等级 | 攻击方解锁 | 防御方解锁 | 等级范围 |
|----------|------------|------------|----------|
| **Level 1** | 基础侦查卡 | 基础防护卡 | 0-15 |
| **Level 2** | 漏洞利用卡 | 入侵检测卡 | 15-30 |
| **Level 3** | 权限提升卡 | 主动防御卡 | 30-45 |
| **Level 4** | 高级渗透卡 | 纵深防御卡 | 45-60 |
| **Level 5** | 完全控制卡 | 绝对安全卡 | 60-75 |

### 3.2 科技树解锁机制

#### 3.2.1 解锁条件

```typescript
// 科技树解锁配置
interface TechTreeUnlock {
  level: number;           // 科技等级 1-5
  requiredInfiltration: number;  // 攻击方所需渗透等级
  requiredSecurity: number;      // 防御方所需安全等级
  unlockedCardTypes: string[];   // 解锁的卡牌类型
}

const TECH_TREE_UNLOCKS: TechTreeUnlock[] = [
  {
    level: 1,
    requiredInfiltration: 0,
    requiredSecurity: 0,
    unlockedCardTypes: ['basic_recon', 'basic_defense']
  },
  {
    level: 2,
    requiredInfiltration: 15,
    requiredSecurity: 15,
    unlockedCardTypes: ['vuln_exploit', 'intrusion_detection']
  },
  {
    level: 3,
    requiredInfiltration: 30,
    requiredSecurity: 30,
    unlockedCardTypes: ['privilege_escalation', 'active_defense']
  },
  {
    level: 4,
    requiredInfiltration: 45,
    requiredSecurity: 45,
    unlockedCardTypes: ['advanced_attack', 'defense_in_depth']
  },
  {
    level: 5,
    requiredInfiltration: 60,
    requiredSecurity: 60,
    unlockedCardTypes: ['total_control', 'absolute_security']
  }
];
```

#### 3.2.2 科技等级效果

| 科技等级 | 攻击方效果 | 防御方效果 |
|----------|------------|------------|
| **Level 1** | 基础卡牌可用 | 基础卡牌可用 |
| **Level 2** | 判定难度-1 | 判定难度-1 |
| **Level 3** | 等级提升效果+1 | 等级提升效果+1 |
| **Level 4** | 可使用高级卡牌 | 可使用高级卡牌 |
| **Level 5** | 胜利条件-5 | 胜利条件-5 |

---

## 四、卡牌体系重构

### 4.1 卡牌效果体系重构

#### 4.1.1 核心效果类型（围绕等级设计）

**攻击方核心效果**：

| 效果代码 | 效果名称 | 说明 | 典型数值 | 占比 |
|----------|----------|------|----------|------|
| `security_reduce` | 安全削弱 | 降低对方安全等级 | -1至-5 | 70% |
| `infiltration_gain` | 渗透提升 | 提升自身渗透等级 | +1至+3 | 10% |
| `security_suppress` | 安全压制 | 阻止对方提升安全等级 | 1-2回合 | 10% |
| `combo_boost` | 连击增益 | 连续使用同类卡效果增强 | +50% | 10% |

**防御方核心效果**：

| 效果代码 | 效果名称 | 说明 | 典型数值 | 占比 |
|----------|----------|------|----------|------|
| `security_gain` | 安全提升 | 提升自身安全等级 | +1至+5 | 70% |
| `infiltration_reduce` | 渗透阻断 | 降低对方渗透等级 | -1至-3 | 10% |
| `infiltration_suppress` | 渗透压制 | 阻止对方提升渗透等级 | 1-2回合 | 10% |
| `defense_combo` | 防御连击 | 连续使用防御卡效果增强 | +50% | 10% |

#### 4.1.2 卡牌效果公式

```typescript
// 等级变化计算公式
interface LevelChangeFormula {
  // 基础效果值
  baseValue: number;
  
  // 科技等级加成
  techLevelBonus: (techLevel: number) => number;
  
  // 连击加成
  comboBonus: (consecutiveUses: number) => number;
  
  // 判定修正
  diceModifier: (diceResult: DiceResult) => number;
}

// 攻击方安全削弱公式
const securityReduceFormula: LevelChangeFormula = {
  baseValue: 2,  // 基础降低2级
  
  techLevelBonus: (techLevel) => Math.floor(techLevel * 0.5),  // 每2级科技+1
  
  comboBonus: (consecutiveUses) => consecutiveUses * 0.5,  // 每次连击+0.5
  
  diceModifier: (diceResult) => {
    if (diceResult.isCriticalSuccess) return 2;  // 大成功额外+2
    if (diceResult.isCriticalFailure) return -1; // 大失败-1
    return 0;
  }
};

// 计算示例
function calculateLevelChange(
  formula: LevelChangeFormula,
  techLevel: number,
  consecutiveUses: number,
  diceResult: DiceResult
): number {
  const techBonus = formula.techLevelBonus(techLevel);
  const comboBonus = formula.comboBonus(consecutiveUses);
  const diceBonus = formula.diceModifier(diceResult);
  
  return formula.baseValue + techBonus + comboBonus + diceBonus;
}
```

### 4.2 卡牌分类体系重构

#### 4.2.1 按科技等级分类

| 分类 | 攻击方卡牌类型 | 防御方卡牌类型 | 等级范围 |
|------|----------------|----------------|----------|
| **T1 基础卡** | 端口扫描、弱口令尝试 | 防火墙部署、访问控制 | 0-15 |
| **T2 进阶卡** | SQL注入、钓鱼邮件 | 入侵检测、日志审计 | 15-30 |
| **T3 高级卡** | 权限提升、横向移动 | 威胁情报、蜜罐诱捕 | 30-45 |
| **T4 专家卡** | 零日漏洞、供应链攻击 | 零信任架构、主动防御 | 45-60 |
| **T5 终极卡** | 完全渗透、国家级攻击 | 绝对安全、网络主权 | 60-75 |

#### 4.2.2 按效果类型分类

| 分类 | 攻击方效果 | 防御方效果 | 设计意图 |
|------|------------|------------|----------|
| **直接等级卡** | 直接降低对方安全等级 | 直接提升自身安全等级 | 主要手段 |
| **持续等级卡** | 每回合降低对方安全等级 | 每回合提升自身安全等级 | 长期压制 |
| **反击等级卡** | 对方提升时触发降低 | 对方降低时触发提升 | 反制手段 |
| **保护等级卡** | 防止对方提升安全等级 | 防止对方降低安全等级 | 防守手段 |
| **爆发等级卡** | 牺牲资源大幅降对方等级 | 牺牲资源大幅提升等级 | 逆转手段 |

### 4.3 卡牌品质与等级变化幅度

| 品质 | 等级变化范围 | 资源消耗 | 判定难度 | 说明 |
|------|--------------|----------|----------|------|
| **普通** | ±1至±2 | 低 | 2-3 | 基础手段 |
| **稀有** | ±2至±3 | 中 | 3-4 | 进阶手段 |
| **史诗** | ±3至±5 | 高 | 4-5 | 强力手段 |
| **传说** | ±5至±8 | 极高 | 5-6 | 终极手段 |

---

## 五、完整卡牌设计

### 5.1 攻击方卡牌设计（40张）

#### 5.1.1 T1 基础攻击卡（8张）

##### 卡牌1: 端口扫描 (ATTACK_T1_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_001 |
| **名称** | 端口扫描 |
| **类型** | 基础侦查 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        value: 1,
        description: '降低目标安全等级1级'
      },
      onFailure: {
        type: 'none',
        description: '扫描被防火墙拦截'
      }
    }
  ],
  comboEffect: {
    trigger: 'consecutive_recon',  // 连续使用侦查卡
    bonus: 0.5,  // 额外降低0.5级
    maxStack: 2  // 最多叠加2次
  }
}
```

**设计意图**：基础侦查手段，低风险低收益，适合连击组合

---

##### 卡牌2: 弱口令尝试 (ATTACK_T1_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_002 |
| **名称** | 弱口令尝试 |
| **类型** | 凭证窃取 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1, information: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      },
      onFailure: {
        type: 'infiltration_reduce',
        value: 1,
        description: '尝试失败，渗透等级-1'
      }
    }
  ]
}
```

**设计意图**：高风险高收益，失败有惩罚

---

##### 卡牌3: 钓鱼邮件 (ATTACK_T1_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_003 |
| **名称** | 钓鱼邮件 |
| **类型** | 社会工程 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `funds: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        value: 1,
        description: '降低目标安全等级1级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '大成功！降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 1,
    effect: {
      type: 'resource_steal',
      value: 1,
      resourceType: 'information',
      description: '下回合窃取1点信息'
    }
  }
}
```

**设计意图**：低成本入门卡，有持续收益

---

##### 卡牌4: 服务拒绝攻击 (ATTACK_T1_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_004 |
| **名称** | 服务拒绝攻击 |
| **类型** | 拒绝服务 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 1,
        description: '降低目标安全等级1级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'security_suppress',
      description: '目标2回合内无法提升安全等级'
    }
  }
}
```

**设计意图**：压制型卡牌，阻止对方恢复

---

##### 卡牌5: 恶意脚本注入 (ATTACK_T1_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_005 |
| **名称** | 恶意脚本注入 |
| **类型** | 漏洞利用 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1, information: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'security_reduce',
      value: 1,
      description: '每回合降低目标安全等级1级'
    }
  }
}
```

**设计意图**：持续伤害型卡牌

---

##### 卡牌6: 网络嗅探 (ATTACK_T1_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_006 |
| **名称** | 网络嗅探 |
| **类型** | 信息收集 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `information: 1` |
| **判定难度** | 1 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 1,
      onSuccess: {
        type: 'security_reduce',
        value: 1,
        description: '降低目标安全等级1级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'resource_gain',
        value: 2,
        resourceType: 'information',
        description: '获得2点信息'
      }
    }
  ]
}
```

**设计意图**：资源获取型卡牌，低难度低收益

---

##### 卡牌7: 字典攻击 (ATTACK_T1_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_007 |
| **名称** | 字典攻击 |
| **类型** | 凭证窃取 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        value: 1,
        description: '降低目标安全等级1级'
      }
    }
  ],
  comboEffect: {
    trigger: 'same_type_consecutive',  // 连续使用凭证窃取卡
    bonus: 1,
    description: '连击：额外降低1级安全等级'
  }
}
```

**设计意图**：连击型卡牌，连续使用效果增强

---

##### 卡牌8: 社会工程试探 (ATTACK_T1_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T1_008 |
| **名称** | 社会工程试探 |
| **类型** | 社会工程 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `funds: 1, information: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        value: 1,
        description: '降低目标安全等级1级'
      }
    }
  ],
  counterEffect: {
    trigger: 'defense_security_gain',  // 对方提升安全等级时触发
    effect: {
      type: 'security_reduce',
      value: 1,
      description: '反击：对方提升安全等级时，额外降低1级'
    }
  }
}
```

**设计意图**：反击型卡牌，针对对方恢复

---

#### 5.1.2 T2 进阶攻击卡（8张）

##### 卡牌9: SQL注入攻击 (ATTACK_T2_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_001 |
| **名称** | SQL注入攻击 |
| **类型** | 漏洞利用 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2, information: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 3,
        description: '降低目标安全等级3级'
      },
      onFailure: {
        type: 'infiltration_reduce',
        value: 1,
        description: '注入被过滤，渗透等级-1'
      }
    }
  ],
  techRequirement: {
    infiltrationLevel: 15,  // 需要渗透等级≥15
    description: '需要渗透等级达到15'
  }
}
```

**设计意图**：T2核心卡牌，高伤害高风险

---

##### 卡牌10: 鱼叉式钓鱼 (ATTACK_T2_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_002 |
| **名称** | 鱼叉式钓鱼 |
| **类型** | 高级社会工程 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `funds: 2, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 4,
        description: '精准打击！降低目标安全等级4级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'resource_steal',
      value: 1,
      resourceType: 'funds',
      description: '每回合窃取1点资金'
    }
  }
}
```

**设计意图**：高成本高收益，有持续效果

---

##### 卡牌11: XSS跨站脚本 (ATTACK_T2_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_003 |
| **名称** | XSS跨站脚本 |
| **类型** | Web漏洞 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'security_reduce',
      value: 1,
      description: '每回合降低目标安全等级1级'
    }
  }
}
```

**设计意图**：长期压制型卡牌

---

##### 卡牌12: 中间人攻击 (ATTACK_T2_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_004 |
| **名称** | 中间人攻击 |
| **类型** | 网络攻击 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2, information: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'resource_steal',
        value: 2,
        resourceType: 'information',
        description: '窃取2点信息'
      }
    }
  ]
}
```

**设计意图**：复合效果卡牌，兼顾等级和资源

---

##### 卡牌13: 文件上传漏洞 (ATTACK_T2_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_005 |
| **名称** | 文件上传漏洞 |
| **类型** | 漏洞利用 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 1, funds: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'infiltration_gain',
      value: 1,
      description: '每回合提升自身渗透等级1级'
    }
  }
}
```

**设计意图**：攻防一体卡牌，同时削弱对方和增强自己

---

##### 卡牌14: 命令注入 (ATTACK_T2_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_006 |
| **名称** | 命令注入 |
| **类型** | 系统漏洞 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 4,
        description: '系统级攻击！降低目标安全等级4级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        value: 6,
        description: '大成功！系统完全被控制，降低6级'
      }
    }
  ]
}
```

**设计意图**：高风险高回报，大成功有额外奖励

---

##### 卡牌15: 会话劫持 (ATTACK_T2_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_007 |
| **名称** | 会话劫持 |
| **类型** | 凭证窃取 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `information: 2` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    }
  ],
  counterEffect: {
    trigger: 'defense_card_played',  // 对方打出防御卡时
    effect: {
      type: 'security_reduce',
      value: 1,
      description: '反击：对方使用防御卡时，额外降低1级'
    }
  }
}
```

**设计意图**：反制型卡牌，针对对方防御

---

##### 卡牌16: 目录遍历 (ATTACK_T2_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T2_008 |
| **名称** | 目录遍历 |
| **类型** | 信息泄露 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 1, information: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'draw',
        value: 1,
        description: '抽1张牌'
      }
    }
  ]
}
```

**设计意图**：资源循环型卡牌，低难度低消耗

---

#### 5.1.3 T3 高级攻击卡（8张）

##### 卡牌17: 权限提升 (ATTACK_T3_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_001 |
| **名称** | 权限提升 |
| **类型** | 权限攻击 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 2, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'infiltration_gain',
        value: 3,
        description: '提升自身渗透等级3级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'security_reduce',
        value: 2,
        description: '同时降低目标安全等级2级'
      }
    }
  ],
  techRequirement: {
    infiltrationLevel: 30
  }
}
```

**设计意图**：T3核心卡牌，攻防一体

---

##### 卡牌18: 横向移动 (ATTACK_T3_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_002 |
| **名称** | 横向移动 |
| **类型** | 网络渗透 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3, information: 1` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 4,
        description: '内网扩散！降低目标安全等级4级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'security_reduce',
      value: 2,
      description: '每回合降低目标安全等级2级'
    }
  }
}
```

**设计意图**：高伤害持续压制

---

##### 卡牌19: 后门植入 (ATTACK_T3_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_003 |
| **名称** | 后门植入 |
| **类型** | 持久化攻击 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 2, funds: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 4,
    effect: {
      type: 'security_reduce',
      value: 1,
      description: '每回合降低目标安全等级1级（难以清除）'
    },
    clearDifficulty: 5  // 清除难度5
  }
}
```

**设计意图**：长期威胁型卡牌，难以清除

---

##### 卡牌20: 内网嗅探 (ATTACK_T3_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_004 |
| **名称** | 内网嗅探 |
| **类型** | 信息收集 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `information: 2` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        value: 2,
        description: '降低目标安全等级2级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'resource_gain',
        value: 3,
        resourceType: 'information',
        description: '获得3点信息'
      }
    }
  ],
  comboEffect: {
    trigger: 'consecutive_intel',  // 连续使用信息收集卡
    bonus: 1,
    description: '连击：额外降低1级安全等级'
  }
}
```

**设计意图**：资源获取+等级削弱，连击增强

---

##### 卡牌21: 凭证哈希破解 (ATTACK_T3_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_005 |
| **名称** | 凭证哈希破解 |
| **类型** | 密码攻击 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 4` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 5,
        description: '破解成功！降低目标安全等级5级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        value: 8,
        description: '大成功！获得管理员权限，降低8级'
      }
    }
  ]
}
```

**设计意图**：高难度高回报，大成功有巨额奖励

---

##### 卡牌22: 域控制器攻击 (ATTACK_T3_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_006 |
| **名称** | 域控制器攻击 |
| **类型** | 基础设施攻击 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3, funds: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 5,
        description: '域控沦陷！降低目标安全等级5级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_suppress',
      duration: 2,
      description: '所有防御方2回合内无法提升安全等级'
    }
  }
}
```

**设计意图**：团队压制型卡牌，影响所有防御方

---

##### 卡牌23: 数据窃取 (ATTACK_T3_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_007 |
| **名称** | 数据窃取 |
| **类型** | 数据攻击 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `information: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 3,
        description: '降低目标安全等级3级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'resource_steal',
        value: 3,
        resourceType: 'information',
        description: '窃取3点信息'
      }
    }
  ]
}
```

**设计意图**：资源掠夺型卡牌

---

##### 卡牌24: 远程代码执行 (ATTACK_T3_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T3_008 |
| **名称** | 远程代码执行 |
| **类型** | 系统漏洞 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3, information: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 4,
        description: 'RCE成功！降低目标安全等级4级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'infiltration_gain',
        value: 2,
        description: '提升自身渗透等级2级'
      }
    }
  ]
}
```

**设计意图**：攻防一体，高成本高收益

---

#### 5.1.4 T4 专家攻击卡（8张）

##### 卡牌25: 零日漏洞利用 (ATTACK_T4_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_001 |
| **名称** | 零日漏洞利用 |
| **类型** | 高级漏洞利用 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, information: 3, funds: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 6,
        description: '零日攻击！降低目标安全等级6级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'security_reduce',
      value: 2,
      description: '每回合降低目标安全等级2级'
    }
  },
  techRequirement: {
    infiltrationLevel: 45
  }
}
```

**设计意图**：T4核心卡牌，高伤害+持续压制

---

##### 卡牌26: 供应链投毒 (ATTACK_T4_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_002 |
| **名称** | 供应链投毒 |
| **类型** | 供应链攻击 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `funds: 4, information: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 5,
        description: '供应链沦陷！降低目标安全等级5级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_reduce',
      value: 2,
      description: '所有防御方安全等级-2'
    }
  }
}
```

**设计意图**：团队伤害型卡牌

---

##### 卡牌27: APT持久潜伏 (ATTACK_T4_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_003 |
| **名称** | APT持久潜伏 |
| **类型** | 高级持续性威胁 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 2, information: 2, funds: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 3,
        description: '降低目标安全等级3级'
      }
    }
  ],
  sustainEffect: {
    duration: 5,
    effect: {
      type: 'security_reduce',
      value: 1,
      description: '每回合降低目标安全等级1级（极难清除）'
    },
    clearDifficulty: 6  // 清除难度6
  }
}
```

**设计意图**：超长期威胁，极难清除

---

##### 卡牌28: 硬件级攻击 (ATTACK_T4_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_004 |
| **名称** | 硬件级攻击 |
| **类型** | 物理攻击 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `funds: 5` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 6,
        description: '硬件漏洞利用！降低目标安全等级6级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        value: 10,
        description: '大成功！底层完全控制，降低10级'
      }
    }
  ]
}
```

**设计意图**：高成本高回报，大成功可瞬间大幅削弱

---

##### 卡牌29: 加密勒索 (ATTACK_T4_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_005 |
| **名称** | 加密勒索 |
| **类型** | 勒索软件 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, funds: 3` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 5,
        description: '数据加密！降低目标安全等级5级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'resource_lock',
      resourceType: 'funds',
      description: '目标3回合内无法使用资金'
    }
  }
}
```

**设计意图**：压制对方资源使用

---

##### 卡牌30: 区块链粉尘攻击 (ATTACK_T4_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_006 |
| **名称** | 区块链粉尘攻击 |
| **类型** | 新型攻击 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `funds: 3, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 4,
        description: '匿名性破坏！降低目标安全等级4级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'information_exposure',
      description: '目标3回合内所有信息资源-1'
    }
  }
}
```

**设计意图**：基于结构化摘要STR-061的粉尘攻击概念

---

##### 卡牌31: AI对抗算法 (ATTACK_T4_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_007 |
| **名称** | AI对抗算法 |
| **类型** | 智能攻击 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 4, information: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 5,
        description: 'AI自适应攻击！降低目标安全等级5级'
      }
    }
  ],
  adaptiveEffect: {
    description: '根据对方上回合使用的防御卡类型，本卡牌判定难度-1'
  }
}
```

**设计意图**：基于结构化摘要STR-002的AI双重性概念

---

##### 卡牌32: 国家级网络战 (ATTACK_T4_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T4_008 |
| **名称** | 国家级网络战 |
| **类型** | 战略攻击 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, information: 3, funds: 3` |
| **判定难度** | 6 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 6,
      onSuccess: {
        type: 'security_reduce',
        value: 8,
        description: '国家级攻击！降低目标安全等级8级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_reduce',
      value: 3,
      description: '所有防御方安全等级-3'
    }
  }
}
```

**设计意图**：最高难度最高回报，团队伤害

---

#### 5.1.5 T5 终极攻击卡（8张）

##### 卡牌33: 完全渗透 (ATTACK_T5_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_001 |
| **名称** | 完全渗透 |
| **类型** | 终极攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 4, information: 4, funds: 4` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'victory_advance',
        value: 10,
        description: '完全渗透！渗透等级+10，若达到75则立即获胜'
      }
    }
  ],
  victoryCondition: {
    type: 'infiltration_threshold',
    threshold: 75,
    description: '渗透等级达到75立即获胜'
  },
  techRequirement: {
    infiltrationLevel: 60
  }
}
```

**设计意图**：T5终极卡牌，直接冲击胜利条件

---

##### 卡牌34: 关键基础设施控制 (ATTACK_T5_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_002 |
| **名称** | 关键基础设施控制 |
| **类型** | 工控攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 5, funds: 5` |
| **判定难度** | 6 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 6,
      onSuccess: {
        type: 'security_reduce',
        value: 10,
        description: '工控系统沦陷！降低目标安全等级10级'
      },
      onCriticalSuccess: {
        type: 'instant_victory',
        description: '大成功！完全控制基础设施，立即获胜'
      }
    }
  ]
}
```

**设计意图**：基于结构化摘要STR-003的工控系统威胁

---

##### 卡牌35: 全面数据泄露 (ATTACK_T5_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_003 |
| **名称** | 全面数据泄露 |
| **类型** | 数据攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `information: 5` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 8,
        description: '全面泄露！降低目标安全等级8级'
      }
    }
  ],
  sustainEffect: {
    duration: 4,
    effect: {
      type: 'security_reduce',
      value: 2,
      description: '每回合降低目标安全等级2级'
    }
  }
}
```

**设计意图**：高伤害+长期压制

---

##### 卡牌36: 量子计算破解 (ATTACK_T5_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_004 |
| **名称** | 量子计算破解 |
| **类型** | 未来攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 6, funds: 4` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 12,
        description: '量子破解！无视加密，降低目标安全等级12级'
      }
    }
  ],
  ignoreDefense: true,  // 无视防御效果
  description: '无视对方所有防御卡牌效果'
}
```

**设计意图**：无视防御的终极攻击

---

##### 卡牌37: 全球僵尸网络 (ATTACK_T5_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_005 |
| **名称** | 全球僵尸网络 |
| **类型** | 分布式攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 4, funds: 4, information: 2` |
| **判定难度** | 6 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 6,
      onSuccess: {
        type: 'security_reduce',
        value: 8,
        description: '全球DDoS！降低目标安全等级8级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_reduce',
      value: 4,
      description: '所有防御方安全等级-4'
    }
  }
}
```

**设计意图**：团队毁灭型卡牌

---

##### 卡牌38: 深度伪造渗透 (ATTACK_T5_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_006 |
| **名称** | 深度伪造渗透 |
| **类型** | AI攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `information: 4, funds: 3` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        value: 7,
        description: '深度伪造成功！降低目标安全等级7级'
      }
    }
  ],
  sustainEffect: {
    duration: 5,
    effect: {
      type: 'security_suppress',
      description: '目标5回合内无法提升安全等级'
    }
  }
}
```

**设计意图**：长期压制对方恢复能力

---

##### 卡牌39: 内部威胁激活 (ATTACK_T5_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_007 |
| **名称** | 内部威胁激活 |
| **类型** | 内部攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `funds: 5, information: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        value: 10,
        description: '内鬼激活！降低目标安全等级10级'
      }
    }
  ],
  counterEffect: {
    trigger: 'defense_security_gain',  // 对方提升安全等级时
    effect: {
      type: 'security_reduce',
      value: 3,
      description: '反击：对方每次提升安全等级，额外降低3级'
    }
  }
}
```

**设计意图**：基于结构化摘要STR-043的内部威胁概念

---

##### 卡牌40: 网络主权侵蚀 (ATTACK_T5_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | ATTACK_T5_008 |
| **名称** | 网络主权侵蚀 |
| **类型** | 战略攻击 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 5, information: 4, funds: 3` |
| **判定难度** | 6 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 6,
      onSuccess: {
        type: 'security_reduce',
        value: 15,
        description: '主权侵蚀！降低目标安全等级15级'
      }
    }
  ],
  victoryCondition: {
    type: 'security_zero',
    description: '若目标安全等级降至0，立即获胜'
  }
}
```

**设计意图**：最高伤害卡牌，可直接触发胜利

---

### 5.2 防御方卡牌设计（40张）

#### 5.2.1 T1 基础防御卡（8张）

##### 卡牌1: 防火墙部署 (DEFENSE_T1_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_001 |
| **名称** | 防火墙部署 |
| **类型** | 基础防护 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 1,
        description: '提升自身安全等级1级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'infiltration_suppress',
      description: '攻击方2回合内渗透等级无法提升'
    }
  }
}
```

**设计意图**：基础防护+压制对方进攻

---

##### 卡牌2: 入侵检测启动 (DEFENSE_T1_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_002 |
| **名称** | 入侵检测启动 |
| **类型** | 检测响应 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1, information: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 1,
        description: '提升自身安全等级1级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',  // 对方使用攻击卡时
    effect: {
      type: 'infiltration_reduce',
      value: 1,
      description: '检测反击：对方使用攻击卡时，其渗透等级-1'
    }
  }
}
```

**设计意图**：检测反击型卡牌

---

##### 卡牌3: 系统补丁更新 (DEFENSE_T1_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_003 |
| **名称** | 系统补丁更新 |
| **类型** | 漏洞修复 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '漏洞修复！提升自身安全等级2级'
      }
    }
  ],
  clearEffect: {
    type: 'vulnerability_clear',
    description: '清除所有漏洞利用类持续效果'
  }
}
```

**设计意图**：修复型卡牌，清除漏洞效果

---

##### 卡牌4: 访问控制强化 (DEFENSE_T1_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_004 |
| **名称** | 访问控制强化 |
| **类型** | 权限管理 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 1,
        description: '提升自身安全等级1级'
      }
    }
  ],
  protectionEffect: {
    type: 'credential_protection',
    description: '下回合免疫所有凭证窃取类攻击'
  }
}
```

**设计意图**：权限保护型卡牌，针对凭证攻击

---

##### 卡牌5: 日志审计开启 (DEFENSE_T1_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_005 |
| **名称** | 日志审计开启 |
| **类型** | 审计追踪 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `information: 1` |
| **判定难度** | 1 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 1,
      onSuccess: {
        type: 'security_gain',
        value: 1,
        description: '提升自身安全等级1级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'draw',
        value: 1,
        description: '抽1张牌'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'information_gain',
      value: 1,
      description: '每回合获得1点信息'
    }
  }
}
```

**设计意图**：资源获取型防御卡，低难度低消耗

---

##### 卡牌6: 安全培训实施 (DEFENSE_T1_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_006 |
| **名称** | 安全培训实施 |
| **类型** | 人员防护 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `funds: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '提升自身安全等级2级'
      }
    }
  ],
  protectionEffect: {
    type: 'social_engineering_immunity',
    description: '免疫所有社会工程类攻击（钓鱼邮件等）'
  }
}
```

**设计意图**：针对社会工程攻击的专项防护

---

##### 卡牌7: 数据备份执行 (DEFENSE_T1_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_007 |
| **名称** | 数据备份执行 |
| **类型** | 数据保护 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 1, funds: 1` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 1,
        description: '提升自身安全等级1级'
      }
    }
  ],
  recoveryEffect: {
    type: 'data_recovery',
    description: '若本回合安全等级被降低，回合结束时恢复50%'
  }
}
```

**设计意图**：恢复型卡牌，减轻攻击损失

---

##### 卡牌8: 网络分段隔离 (DEFENSE_T1_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T1_008 |
| **名称** | 网络分段隔离 |
| **类型** | 网络架构 |
| **品质** | 普通 |
| **科技等级** | T1 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '提升自身安全等级2级'
      }
    }
  ],
  protectionEffect: {
    type: 'lateral_movement_block',
    description: '阻止横向移动类攻击，免疫其效果'
  }
}
```

**设计意图**：网络架构防护，针对高级攻击手段

---

#### 5.2.2 T2 进阶防御卡（8张）

##### 卡牌9: 威胁情报订阅 (DEFENSE_T2_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_001 |
| **名称** | 威胁情报订阅 |
| **类型** | 情报防御 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `information: 2` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '情报预警！提升自身安全等级2级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',
    effect: {
      type: 'dice_modifier',
      value: -1,
      description: '对方本回合所有攻击卡判定难度+1'
    }
  }
}
```

**设计意图**：情报型防御，增加对方攻击难度

---

##### 卡牌10: 蜜罐系统部署 (DEFENSE_T2_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_002 |
| **名称** | 蜜罐系统部署 |
| **类型** | 诱捕防御 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2, information: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '诱捕成功！提升自身安全等级2级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',
    effect: {
      type: 'infiltration_reduce',
      value: 2,
      description: '反击：对方攻击时，其渗透等级-2'
    }
  }
}
```

**设计意图**：诱捕反击型卡牌

---

##### 卡牌11: 端点防护强化 (DEFENSE_T2_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_003 |
| **名称** | 端点防护强化 |
| **类型** | 终端防护 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '提升自身安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'security_gain',
      value: 1,
      description: '每回合提升自身安全等级1级'
    }
  }
}
```

**设计意图**：持续增益型卡牌

---

##### 卡牌12: 漏洞扫描修复 (DEFENSE_T2_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_004 |
| **名称** | 漏洞扫描修复 |
| **类型** | 漏洞管理 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 3` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '漏洞修复！提升自身安全等级3级'
      }
    }
  ],
  clearEffect: {
    type: 'all_vulnerability_clear',
    description: '清除所有漏洞利用类持续效果'
  },
  protectionEffect: {
    type: 'vulnerability_immunity',
    duration: 2,
    description: '2回合内免疫漏洞利用攻击'
  }
}
```

**设计意图**：强力修复型卡牌

---

##### 卡牌13: 身份认证升级 (DEFENSE_T2_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_005 |
| **名称** | 身份认证升级 |
| **类型** | 认证强化 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2, funds: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '提升自身安全等级2级'
      }
    }
  ],
  protectionEffect: {
    type: 'credential_attack_immunity',
    duration: 3,
    description: '3回合内免疫所有凭证窃取攻击'
  }
}
```

**设计意图**：长期防护型卡牌

---

##### 卡牌14: 安全运营中心 (DEFENSE_T2_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_006 |
| **名称** | 安全运营中心 |
| **类型** | 运营防御 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `funds: 2` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '提升自身安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'resource_gain',
      value: 1,
      resourceType: 'information',
      description: '每回合获得1点信息'
    }
  }
}
```

**设计意图**：资源生产型防御卡

---

##### 卡牌15: 加密通信启用 (DEFENSE_T2_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_007 |
| **名称** | 加密通信启用 |
| **类型** | 通信防护 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2` |
| **判定难度** | 2 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '提升自身安全等级2级'
      }
    }
  ],
  protectionEffect: {
    type: 'sniffing_immunity',
    description: '免疫网络嗅探类攻击'
  }
}
```

**设计意图**：针对信息收集攻击的防护

---

##### 卡牌16: 应急响应启动 (DEFENSE_T2_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T2_008 |
| **名称** | 应急响应启动 |
| **类型** | 应急响应 |
| **品质** | 稀有 |
| **科技等级** | T2 |
| **资源消耗** | `compute: 2, funds: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '应急响应！提升自身安全等级3级'
      }
    }
  ],
  emergencyEffect: {
    type: 'damage_recovery',
    description: '若本回合安全等级被降低超过3级，额外恢复2级'
  }
}
```

**设计意图**：应急恢复型卡牌

---

#### 5.2.3 T3 高级防御卡（8张）

##### 卡牌17: 威胁狩猎行动 (DEFENSE_T3_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_001 |
| **名称** | 威胁狩猎行动 |
| **类型** | 主动防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 2, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '威胁清除！提升自身安全等级3级'
      }
    }
  ],
  clearEffect: {
    type: 'all_sustain_effect_clear',
    description: '清除所有攻击方持续效果'
  }
}
```

**设计意图**：主动清除型卡牌

---

##### 卡牌18: 零信任架构部署 (DEFENSE_T3_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_002 |
| **名称** | 零信任架构部署 |
| **类型** | 架构防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3, funds: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 4,
        description: '零信任部署！提升自身安全等级4级'
      }
    }
  ],
  protectionEffect: {
    type: 'privilege_escalation_block',
    description: '免疫权限提升类攻击'
  },
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'security_gain',
      value: 1,
      description: '每回合提升自身安全等级1级'
    }
  }
}
```

**设计意图**：强力防护+持续增益

---

##### 卡牌19: 安全编排自动化 (DEFENSE_T3_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_003 |
| **名称** | 安全编排自动化 |
| **类型** | 自动化防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '自动化防御！提升自身安全等级3级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',
    effect: {
      type: 'auto_response',
      description: '对方每使用1张攻击卡，自动提升自身安全等级1级（最多3级）'
    }
  }
}
```

**设计意图**：自动化反击型卡牌

---

##### 卡牌20: 欺骗防御网络 (DEFENSE_T3_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_004 |
| **名称** | 欺骗防御网络 |
| **类型** | 欺骗防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `information: 2, funds: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '欺骗成功！提升自身安全等级3级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',
    effect: {
      type: 'attack_redirect',
      description: '50%概率将对方攻击效果反弹给攻击方'
    }
  }
}
```

**设计意图**：概率反弹型卡牌

---

##### 卡牌21: 行为分析引擎 (DEFENSE_T3_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_005 |
| **名称** | 行为分析引擎 |
| **类型** | 分析防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3, information: 1` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '异常检测！提升自身安全等级3级'
      }
    }
  ],
  counterEffect: {
    trigger: 'consecutive_attack',
    effect: {
      type: 'combo_break',
      description: '对方连击时，其连击加成失效'
    }
  }
}
```

**设计意图**：针对连击机制的克制

---

##### 卡牌22: 安全信息与事件管理 (DEFENSE_T3_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_006 |
| **名称** | 安全信息与事件管理 |
| **类型** | 综合防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 2, information: 2` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 3,
        description: '提升自身安全等级3级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_gain',
      value: 1,
      description: '所有防御方安全等级+1'
    }
  }
}
```

**设计意图**：团队增益型卡牌

---

##### 卡牌23: 内存保护机制 (DEFENSE_T3_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_007 |
| **名称** | 内存保护机制 |
| **类型** | 系统防护 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `compute: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 4,
        description: '内存保护！提升自身安全等级4级'
      }
    }
  ],
  protectionEffect: {
    type: 'code_execution_block',
    description: '免疫远程代码执行类攻击'
  }
}
```

**设计意图**：针对高级攻击的专项防护

---

##### 卡牌24: 数字取证分析 (DEFENSE_T3_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T3_008 |
| **名称** | 数字取证分析 |
| **类型** | 取证防御 |
| **品质** | 史诗 |
| **科技等级** | T3 |
| **资源消耗** | `information: 3` |
| **判定难度** | 3 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_gain',
        value: 2,
        description: '取证成功！提升自身安全等级2级'
      }
    },
    {
      type: 'direct',
      effect: {
        type: 'infiltration_reduce',
        value: 2,
        description: '对方渗透等级-2'
      }
    }
  ]
}
```

**设计意图**：攻防一体型卡牌

---

#### 5.2.4 T4 专家防御卡（8张）

##### 卡牌25: 自适应安全架构 (DEFENSE_T4_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_001 |
| **名称** | 自适应安全架构 |
| **类型** | 智能防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 4,
        description: '自适应防御！提升自身安全等级4级'
      }
    }
  ],
  adaptiveEffect: {
    description: '根据对方上回合使用的攻击卡类型，本卡牌判定难度-1'
  }
}
```

**设计意图**：自适应型卡牌

---

##### 卡牌26: 云安全态势管理 (DEFENSE_T4_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_002 |
| **名称** | 云安全态势管理 |
| **类型** | 云防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, funds: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 5,
        description: '云安全加固！提升自身安全等级5级'
      }
    }
  ],
  sustainEffect: {
    duration: 4,
    effect: {
      type: 'security_gain',
      value: 1,
      description: '每回合提升自身安全等级1级'
    }
  }
}
```

**设计意图**：强力持续增益

---

##### 卡牌27: 工控系统防护 (DEFENSE_T4_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_003 |
| **名称** | 工控系统防护 |
| **类型** | 工控防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 4, funds: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_gain',
        value: 6,
        description: '工控加固！提升自身安全等级6级'
      }
    }
  ],
  protectionEffect: {
    type: 'ics_immunity',
    description: '免疫所有工控系统攻击'
  }
}
```

**设计意图**：基于结构化摘要STR-003的工控防护

---

##### 卡牌28: 供应链安全审计 (DEFENSE_T4_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_004 |
| **名称** | 供应链安全审计 |
| **类型** | 供应链防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `funds: 4, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 5,
        description: '供应链加固！提升自身安全等级5级'
      }
    }
  ],
  protectionEffect: {
    type: 'supply_chain_immunity',
    description: '免疫供应链投毒攻击'
  },
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_gain',
      value: 2,
      description: '所有防御方安全等级+2'
    }
  }
}
```

**设计意图**：团队防护型卡牌

---

##### 卡牌29: AI驱动安全分析 (DEFENSE_T4_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_005 |
| **名称** | AI驱动安全分析 |
| **类型** | AI防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 4, information: 2` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 5,
        description: 'AI预测成功！提升自身安全等级5级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',
    effect: {
      type: 'predictive_block',
      description: '下回合对方第一张攻击卡效果减半'
    }
  }
}
```

**设计意图**：基于结构化摘要STR-002的AI防御

---

##### 卡牌30: 区块链安全验证 (DEFENSE_T4_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_006 |
| **名称** | 区块链安全验证 |
| **类型** | 区块链防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, funds: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 4,
        description: '区块链验证！提升自身安全等级4级'
      }
    }
  ],
  protectionEffect: {
    type: 'data_integrity',
    description: '本回合免疫所有数据窃取类攻击'
  }
}
```

**设计意图**：数据完整性保护

---

##### 卡牌31: 量子加密通信 (DEFENSE_T4_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_007 |
| **名称** | 量子加密通信 |
| **类型** | 量子防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 4, funds: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 5,
        description: '量子加密！提升自身安全等级5级'
      }
    }
  ],
  protectionEffect: {
    type: 'quantum_immunity',
    description: '免疫量子计算破解攻击'
  }
}
```

**设计意图**：针对量子攻击的专项防护

---

##### 卡牌32: 网络主权防御 (DEFENSE_T4_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T4_008 |
| **名称** | 网络主权防御 |
| **类型** | 主权防御 |
| **品质** | 史诗 |
| **科技等级** | T4 |
| **资源消耗** | `compute: 3, information: 2, funds: 2` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_gain',
        value: 6,
        description: '主权防御！提升自身安全等级6级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_gain',
      value: 3,
      description: '所有防御方安全等级+3'
    }
  }
}
```

**设计意图**：团队强力增益

---

#### 5.2.5 T5 终极防御卡（8张）

##### 卡牌33: 绝对安全领域 (DEFENSE_T5_001)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_001 |
| **名称** | 绝对安全领域 |
| **类型** | 终极防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 4, information: 3, funds: 3` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_gain',
        value: 8,
        description: '绝对防御！提升自身安全等级8级'
      }
    }
  ],
  protectionEffect: {
    type: 'absolute_immunity',
    duration: 2,
    description: '2回合内免疫所有攻击'
  }
}
```

**设计意图**：终极防护型卡牌

---

##### 卡牌34: 网络主权宣告 (DEFENSE_T5_002)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_002 |
| **名称** | 网络主权宣告 |
| **类型** | 主权防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `funds: 5, information: 3` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_gain',
        value: 10,
        description: '主权宣告！提升自身安全等级10级'
      }
    }
  ],
  victoryCondition: {
    type: 'security_threshold',
    threshold: 75,
    description: '安全等级达到75立即获胜'
  }
}
```

**设计意图**：直接冲击胜利条件

---

##### 卡牌35: 全面态势感知 (DEFENSE_T5_003)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_003 |
| **名称** | 全面态势感知 |
| **类型** | 感知防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `information: 5` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 6,
        description: '全面感知！提升自身安全等级6级'
      }
    }
  ],
  counterEffect: {
    trigger: 'any_attack',
    effect: {
      type: 'full_counter',
      description: '本回合所有攻击效果减半，且攻击方渗透等级-2'
    }
  }
}
```

**设计意图**：全面反击型卡牌

---

##### 卡牌36: 量子安全网络 (DEFENSE_T5_004)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_004 |
| **名称** | 量子安全网络 |
| **类型** | 量子防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 5, funds: 4` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_gain',
        value: 10,
        description: '量子网络！提升自身安全等级10级'
      }
    }
  ],
  ignoreAttack: true,
  description: '无视对方所有攻击卡牌效果'
}
```

**设计意图**：无视攻击的终极防御

---

##### 卡牌37: 全球威胁情报联盟 (DEFENSE_T5_005)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_005 |
| **名称** | 全球威胁情报联盟 |
| **类型** | 联盟防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `information: 4, funds: 3` |
| **判定难度** | 5 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_gain',
        value: 6,
        description: '联盟防御！提升自身安全等级6级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_gain',
      value: 4,
      description: '所有防御方安全等级+4'
    }
  }
}
```

**设计意图**：团队终极增益

---

##### 卡牌38: AI安全大脑 (DEFENSE_T5_006)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_006 |
| **名称** | AI安全大脑 |
| **类型** | AI防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 5, information: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 7,
        description: 'AI大脑激活！提升自身安全等级7级'
      }
    }
  ],
  sustainEffect: {
    duration: 5,
    effect: {
      type: 'auto_defense',
      description: '每回合自动提升安全等级2级'
    }
  }
}
```

**设计意图**：超长期自动防御

---

##### 卡牌39: 内部威胁清除 (DEFENSE_T5_007)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_007 |
| **名称** | 内部威胁清除 |
| **类型** | 内部防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `funds: 4, information: 3` |
| **判定难度** | 4 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_gain',
        value: 8,
        description: '内鬼清除！提升自身安全等级8级'
      }
    }
  ],
  counterEffect: {
    trigger: 'internal_attack',
    effect: {
      type: 'internal_block',
      description: '免疫内部威胁激活攻击，且攻击方渗透等级-5'
    }
  }
}
```

**设计意图**：基于结构化摘要STR-043的内部威胁防护

---

##### 卡牌40: 网络主权绝对防御 (DEFENSE_T5_008)

| 属性 | 值 |
|------|---|
| **卡牌代码** | DEFENSE_T5_008 |
| **名称** | 网络主权绝对防御 |
| **类型** | 终极主权防御 |
| **品质** | 传说 |
| **科技等级** | T5 |
| **资源消耗** | `compute: 5, information: 4, funds: 3` |
| **判定难度** | 6 |

**效果配置**：
```typescript
{
  effects: [
    {
      type: 'dice_check',
      difficulty: 6,
      onSuccess: {
        type: 'security_gain',
        value: 15,
        description: '绝对主权！提升自身安全等级15级'
      }
    }
  ],
  victoryCondition: {
    type: 'infiltration_zero',
    description: '若对方渗透等级降至0，立即获胜'
  }
}
```

**设计意图**：最高增益+胜利条件

---

## 六、实施计划

### 6.1 实施阶段

#### 阶段一：核心机制实现（1-2周）

**目标**：实现科技树系统和等级变化公式

**任务清单**：
- [ ] 实现科技树解锁机制
- [ ] 实现等级变化计算公式
- [ ] 实现连击加成系统
- [ ] 实现判定修正机制

**验收标准**：
- 科技树根据渗透/安全等级正确解锁
- 等级变化计算准确
- 连击加成正确叠加

#### 阶段二：卡牌系统重构（2-3周）

**目标**：重构所有80张卡牌

**任务清单**：
- [ ] 重构攻击方40张卡牌
- [ ] 重构防御方40张卡牌
- [ ] 实现新效果类型
- [ ] 实现卡牌协同机制

**验收标准**：
- 所有卡牌效果符合设计文档
- 卡牌之间协同正确
- 无平衡性问题

#### 阶段三：平衡性测试（1-2周）

**目标**：验证系统平衡性

**任务清单**：
- [ ] AI对战测试
- [ ] 胜率统计
- [ ] 卡牌使用频率分析
- [ ] 调整不平衡卡牌

**验收标准**：
- 攻防双方胜率接近50%
- 各科技等级卡牌使用均衡
- 无绝对强势卡牌

#### 阶段四：UI/UX优化（1周）

**目标**：优化玩家体验

**任务清单**：
- [ ] 显示科技等级进度
- [ ] 显示连击加成
- [ ] 优化卡牌效果描述
- [ ] 添加等级变化预览

**验收标准**：
- 玩家清晰了解科技进度
- 卡牌效果直观易懂
- 等级变化可预测

### 6.2 风险评估

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 平衡性问题 | 中 | 高 | 预留调整时间，建立快速迭代机制 |
| 技术实现复杂 | 中 | 中 | 提前进行技术预研，分解复杂功能 |
| 玩家学习成本 | 高 | 中 | 优化教程，提供详细说明 |
| 性能问题 | 低 | 中 | 提前进行性能测试，优化计算逻辑 |

### 6.3 成功指标

**定量指标**：
- 攻防双方胜率：45%-55%
- 平均游戏时长：15-25分钟
- 各科技等级卡牌使用率：差异<20%
- 玩家满意度：>4.0/5.0

**定性指标**：
- 策略深度明显提升
- 游戏节奏合理
- 卡牌协同有趣
- 成长感明显

---

## 附录

### A. 卡牌效果类型汇总

| 效果类型 | 代码 | 说明 | 适用方 |
|----------|------|------|--------|
| 安全削弱 | security_reduce | 降低对方安全等级 | 攻击方 |
| 渗透提升 | infiltration_gain | 提升自身渗透等级 | 攻击方 |
| 安全压制 | security_suppress | 阻止对方提升安全等级 | 攻击方 |
| 连击增益 | combo_boost | 连续使用同类卡效果增强 | 攻击方 |
| 安全提升 | security_gain | 提升自身安全等级 | 防御方 |
| 渗透阻断 | infiltration_reduce | 降低对方渗透等级 | 防御方 |
| 渗透压制 | infiltration_suppress | 阻止对方提升渗透等级 | 防御方 |
| 防御连击 | defense_combo | 连续使用防御卡效果增强 | 防御方 |

### B. 科技树解锁条件

| 科技等级 | 攻击方条件 | 防御方条件 | 解锁卡牌数 |
|----------|------------|------------|------------|
| T1 | 渗透等级≥0 | 安全等级≥0 | 8张 |
| T2 | 渗透等级≥15 | 安全等级≥15 | 8张 |
| T3 | 渗透等级≥30 | 安全等级≥30 | 8张 |
| T4 | 渗透等级≥45 | 安全等级≥45 | 8张 |
| T5 | 渗透等级≥60 | 安全等级≥60 | 8张 |

### C. 卡牌品质分布

| 品质 | 攻击方数量 | 防御方数量 | 总计 |
|------|------------|------------|------|
| 普通 | 8 | 8 | 16 |
| 稀有 | 8 | 8 | 16 |
| 史诗 | 16 | 16 | 32 |
| 传说 | 8 | 8 | 16 |
| **总计** | **40** | **40** | **80** |

---

**文档结束**

*本方案由AI卡牌游戏设计师基于三国杀、炉石传说设计理念，结合结构化摘要文档要求设计完成。*