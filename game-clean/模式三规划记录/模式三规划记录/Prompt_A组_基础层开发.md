# A组 Prompt：基础层模块开发（M01-M03）

## 任务概述

你负责开发**安全实践爬塔模式**的基础层模块，这是整个系统的基石。所有其他模块都依赖你定义的接口和工具函数。

## 必读文档

**核心规格文档**（开发前必须完整阅读）：
- [M01-M04_基础层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M01-M04_基础层规格.md)
  - 重点阅读：M01 类型定义（第5-572行）
  - 重点阅读：M02 常量配置（第576-833行）
  - 重点阅读：M03 工具函数（第836-963行）

**架构总览**（了解整体位置）：
- [M00_模块化架构总览.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M00_模块化架构总览.md)

## 开发内容

### M01: 类型定义层 (`tower-mode/types/`)

创建以下文件，实现规格文档中定义的所有 TypeScript 接口：

```
tower-mode/types/
├── cell.types.ts        # CellType, CellState, GameCell联合类型及6种具体Cell接口
├── zone.types.ts        # ZoneType, ZoneDefinition, ZoneEffectConfig等
├── reward.types.ts      # DataPacket, Book, Skill, RarityLevel等
├── skill.types.ts       # SkillQuality, SkillTriggerTiming等
├── book.types.ts        # BookQuality, BookEffectType等
├── event.types.ts       # ChanceEvent, EventResult等
├── movement.types.ts    # DiceRollResult, MovementResult, ReachableCell等
├── progress.types.ts    # TowerProgressState, LayerSnapshot, TowerSaveData等
└── index.ts             # 统一导出所有类型
```

**关键要求**：
1. 所有类型必须严格匹配规格文档中的定义
2. 必须包含类型守卫函数（如 `isBattleCell()`）
3. 必须导出类型判别函数
4. 使用 `as const` 确保常量类型安全

### M02: 常量配置层 (`tower-mode/constants/`)

创建以下文件：

```
tower-mode/constants/
├── tierConfig.ts           # TIER_CONFIG[1-9] 9层完整配置
├── skillProbabilities.ts   # SKILL_PROBABILITY_TABLE 技能品质概率表
├── zoneEffects.ts          # ZONE_EFFECT_CONFIG 6种区域效果配置
├── movementConstants.ts    # MOVEMENT_CONFIG 移动系统常量
├── rewardConstants.ts      # REWARD_CONFIG 奖励系统常量
├── cellDefaults.ts         # CELL_CONFIG 格子默认值
└── index.ts                # 统一导出
```

**关键要求**：
1. 所有数值必须与规格文档完全一致
2. 必须包含运行时验证（如概率表总和为100的检查）
3. 使用 `readonly` 确保常量不可变
4. 导出类型标注的常量对象

### M03: 工具函数库 (`tower-mode/utils/`)

创建以下文件：

```
tower-mode/utils/
├── probability.ts     # weightedRandom, rollChance, rollSkillQuality, pickN
├── random.ts          # 可播种随机数生成器（用于可复现性）
├── coordinate.ts      # manhattanDistance, isAdjacent, coordToId, idToCoord, getNeighbors
├── validation.ts      # validateMapConnectivity, 各种验证函数
├── array.ts           # shuffle, unique, groupBy 等数组工具
└── index.ts           # 统一导出
```

**关键要求**：
1. 所有函数必须有完整的 JSDoc 注释
2. 概率函数必须支持可选的随机数生成器参数（用于测试）
3. 坐标函数必须处理边界情况
4. 验证函数返回结构化的错误信息

## 技术规范

- **语言**: TypeScript 5.0+
- **模块系统**: ES Modules
- **导出方式**: Named exports
- **类型安全**: 严格模式开启
- **注释**: 所有公共API必须有JSDoc

## 验收标准

- [ ] 所有类型定义文件创建完成并通过类型检查
- [ ] 所有常量配置创建完成并通过运行时验证
- [ ] 所有工具函数实现完成并附带单元测试
- [ ] `index.ts` 统一导出所有公共API
- [ ] 提供简单的使用示例

## 注意事项

1. **这是基础层，必须零依赖**（除TypeScript标准库外）
2. **接口一旦确定，后续模块会依赖它们，变更成本极高**
3. **建议先实现M01类型，再M02常量，最后M03工具函数**
4. **完成后通知B组可以开始M04开发**

## 输出位置

所有代码文件存放于：
```
D:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\
```

---

**开始开发前，请确认已完整阅读 M01-M04_基础层规格.md 文档。**
