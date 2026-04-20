# 《道高一丈：数字博弈》重构迁移指南

**文档版本**: v1.0.0  
**最后更新**: 2026-02-02  
**适用版本**: v16.2.0+重构版

---

## 📋 迁移概览

本次重构将项目从旧版架构迁移到全新架构，主要变更包括：

- **类型系统**: 统一使用新版类型定义（`gameRules.ts`, `cardRules.ts`, `characterRules.ts`, `artRules.ts`）
- **游戏引擎**: 升级到v2.0引擎（`gameEngine_v2.ts`, `GameStateManager_v2.ts`, `EffectEngine_v2.ts`）
- **判定机制**: 更新为"大东话安全"命名体系（探测/加固/反制）
- **视觉系统**: 全新主题样式（`theme.css`）和视觉组件

---

## 🗂️ 文件迁移映射

### 类型定义文件

| 旧文件 | 新文件 | 状态 |
|--------|--------|------|
| `src/types/game.ts` | `src/types/gameRules.ts` | ✅ 已迁移到legacy |
| `src/types/card_v16.ts` | `src/types/cardRules.ts` | ✅ 已迁移到legacy |
| `src/types/game_v16.ts` | `src/types/gameRules.ts` | ✅ 已迁移到legacy |
| `src/types/player_v16.ts` | `src/types/gameRules.ts` | ✅ 已迁移到legacy |
| `src/types/index_v16.ts` | - | ✅ 已迁移到legacy |

### 引擎文件

| 旧文件 | 新文件 | 状态 |
|--------|--------|------|
| `src/engine/gameEngine.ts` | `src/engine/gameEngine_v2.ts` | ✅ 已迁移到legacy |
| `src/engine/GameStateManager.ts` | `src/engine/GameStateManager_v2.ts` | ✅ 已迁移到legacy |
| `src/engine/EffectEngine.ts` | `src/engine/EffectEngine_v2.ts` | ✅ 已迁移到legacy |
| `src/engine/index_v16.ts` | - | ✅ 已迁移到legacy |

### 数据文件

| 旧文件 | 新文件 | 状态 |
|--------|--------|------|
| `src/data/cards.ts` | `src/data/cardDatabase.ts` | ✅ 已迁移到legacy |
| `src/data/cards_v16.ts` | `src/data/cardDatabase.ts` | ✅ 已迁移到legacy |
| `src/data/index_v16.ts` | - | ✅ 已迁移到legacy |

---

## 🔄 导入路径更新

### 旧版导入（已废弃）

```typescript
// ❌ 旧版导入 - 已废弃
import type { GameState, Player } from '@/types/game';
import type { Card } from '@/types/card_v16';
import { gameEngine } from '@/engine/gameEngine';
import { GameStateManager } from '@/engine/GameStateManager';
```

### 新版导入（推荐使用）

```typescript
// ✅ 新版导入 - 推荐使用
import type { 
  GameState, 
  Player,
  TurnPhase,
  InfiltrationLevel,
  SafetyLevel
} from '@/types/gameRules';

import type { 
  CardDefinition, 
  CardId,
  CardRarity,
  CardFaction
} from '@/types/cardRules';

import type {
  CharacterId,
  CharacterDefinition,
  CharacterType
} from '@/types/characterRules';

import {
  createGame,
  advancePhase,
  getCurrentPlayer
} from '@/engine/gameEngine_v2';

import { GameStateManager } from '@/engine/GameStateManager_v2';
import { EffectEngine } from '@/engine/EffectEngine_v2';
```

---

## 📊 关键变更对比

### 1. 胜利条件系统

| 项目 | 旧版 | 新版 |
|------|------|------|
| 胜利判定 | 基于0-10权限系统 | 基于0-100渗透/安全等级 |
| 进攻方胜利 | 权限达到10 | 渗透≥75持续2回合 |
| 防御方胜利 | 阻止对方达到10 | 安全≥75 |

### 2. 回合阶段

| 项目 | 旧版 | 新版 |
|------|------|------|
| 阶段数 | 5阶段 | 7阶段 |
| 阶段列表 | planning/action/resolution/cleanup/victory_check | judgment/recovery/draw/action/response/discard/end |

### 3. 资源系统

| 资源 | 旧版初始值 | 新版初始值 | 新版恢复 |
|------|-----------|-----------|---------|
| 算力 | 3 | 3 | +2/回合 |
| 资金 | 5 | 5 | +2/回合 |
| 信息 | 2 | 2 | +2/回合 |
| 权限 | 0 | 0 | +0/回合 |

### 4. 判定机制

| 机制 | 旧版 | 新版 |
|------|------|------|
| 猜拳 | 剪刀/石头/布 | 探测/加固/反制 |
| 骰子 | 1-6 | 1-10 |

---

## 🎯 迁移检查清单

### 组件迁移检查

- [ ] `src/App.tsx` - 更新为使用新版引擎
- [ ] `src/components/GameBoard.tsx` - 更新类型导入
- [ ] `src/components/GameInterface.tsx` - 更新类型导入
- [ ] `src/components/GameLobby.tsx` - 更新类型导入
- [ ] `src/components/GameRoom.tsx` - 更新类型导入
- [ ] `src/components/Card.tsx` - 更新为使用CardVisual
- [ ] `src/components/CardHand.tsx` - 更新类型导入
- [ ] `src/components/PlayerPanel.tsx` - 更新类型导入
- [ ] `src/components/ResourceBar.tsx` - 更新类型导入
- [ ] `src/components/VictoryAnimation.tsx` - 更新胜利条件

### 数据迁移检查

- [ ] `src/data/cardDatabase.ts` - 创建95张卡牌数据
- [ ] `src/data/techTree.ts` - 验证T0-T5数据
- [ ] `src/data/characterDatabase.ts` - 创建9位角色数据

### 测试更新检查

- [ ] `src/tests/aiTurnOrder.test.ts` - 更新类型导入
- [ ] `src/tests/victoryCondition.test.ts` - 更新胜利条件测试

---

## 🚨 注意事项

### 1. 类型兼容性

新版类型系统与旧版