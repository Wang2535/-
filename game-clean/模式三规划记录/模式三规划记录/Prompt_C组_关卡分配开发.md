# C组 Prompt：关卡分配引擎开发（M05）

## 任务概述

你负责开发**安全实践爬塔模式**的关卡分配引擎。这是游戏的核心随机系统，负责将142个原始关卡智能分配到9层地图的90个战斗格中，并实现BOSS关卡的改造逻辑。

## 必读文档

**核心规格文档**：
- [M05-M08_核心引擎规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M05-M08_核心引擎规格.md)
  - 重点阅读：5.1-5.9 关卡分配引擎完整规格（第5-286行）

**依赖文档**：
- [M01-M04_基础层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M01-M04_基础层规格.md) - 类型定义和工具函数
- [09_配套数据结构设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/09_配套数据结构设计.md) - 142关分类表

**架构总览**：
- [M00_模块化架构总览.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M00_模块化架构总览.md)

## 开发内容

### M05: 关卡分配引擎 (`tower-mode/engine/LevelAssignmentEngine.ts`)

创建核心引擎类：

```typescript
// tower-mode/engine/LevelAssignmentEngine.ts

export class LevelAssignmentEngine {
  // 构造函数和私有属性
  constructor(seed?: number);
  
  // 公共API方法
  initializePools(levelDatabase: LevelDatabaseEntry[]): void;
  assignLayer(layerNumber: number, battleCellIds: string[], bossCellId: string): LayerAssignmentResult;
  assignAllLayers(layerConfigs: LayerConfig[]): TowerAssignmentResult;
  enhanceBossLevel(baseLevelId: string, enhancementLevel: number): EnhancedBossConfig;
  getSparePool(layerNumber: number): string[];
  validateAssignment(result: TowerAssignmentResult): AssignmentValidationResult;
  reshuffle(newSeed?: number): void;
}
```

## 核心算法实现

### 1. 关卡池初始化

```typescript
interface LevelPool {
  tier: number;
  themeId: ThemeCategory;
  availableLevels: string[];   // 可用关卡ID列表
  assignedLevels: string[];    // 已分配的关卡ID
  sparePool: string[];         // 备用池
}

// 142关按主题分类（每主题约15-16关）
const THEME_LEVELS: Record<ThemeCategory, string[]> = {
  'virus': ['LV001', 'LV002', ..., 'LV015'],           // T1: 15关
  'network': ['LV017', 'LV018', ..., 'LV031'],        // T2: 15关
  'data-security': ['LV033', 'LV034', ..., 'LV047'],  // T3: 15关
  'social-engineer': ['LV049', 'LV050', ..., 'LV063'], // T4: 15关
  'industrial-iot': ['LV065', 'LV066', ..., 'LV079'], // T5: 15关
  'mobile-terminal': ['LV081', 'LV082', ..., 'LV095'], // T6: 15关
  'cloud-virtual': ['LV097', 'LV098', ..., 'LV111'],  // T7: 15关
  'ai-emerging': ['LV113', 'LV114', ..., 'LV126'],   // T8: 14关
  'security-mgmt': ['LV128', 'LV129', ..., 'LV142'],  // T9: 15关
};

// BOSS关卡（每主题1个）
const BOSS_LEVELS: Record<ThemeCategory, string> = {
  'virus': 'LV016',
  'network': 'LV032',
  'data-security': 'LV048',
  'social-engineer': 'LV064',
  'industrial-iot': 'LV080',
  'mobile-terminal': 'LV096',
  'cloud-virtual': 'LV112',
  'ai-emerging': 'LV127',
  'security-mgmt': 'LV142',
};
```

### 2. 单层分配算法

```typescript
function assignLayer(
  layerNumber: number,
  battleCellIds: string[],  // 该层所有战斗格ID
  bossCellId: string        // BOSS格ID
): LayerAssignmentResult {
  
  // 1. 获取该层主题对应的关卡池
  const themeId = TIER_CONFIG[layerNumber].themeId;
  const pool = this.levelPools.get(themeId)!;
  const neededCount = battleCellIds.length;  // 通常8-11个
  
  // 2. 检查池中可用数量
  if (pool.availableLevels.length < neededCount) {
    // 从备用池补充或报错
    throw new Error(`Layer ${layerNumber}: insufficient levels in pool`);
  }
  
  // 3. 加权随机抽取（避免重复）
  const selectedLevels = pickN(pool.availableLevels, neededCount, this.rng);
  
  // 4. 创建 cellId → levelId 映射
  const assignments: Record<string, string> = {};
  battleCellIds.forEach((cellId, index) => {
    assignments[cellId] = selectedLevels[index];
  });
  
  // 5. BOSS改造
  const baseBossId = BOSS_LEVELS[themeId];
  const enhancementLevel = TIER_CONFIG[layerNumber].difficultyRange[1]; // 基于难度
  const bossConfig = this.enhanceBossLevel(baseBossId, enhancementLevel);
  
  // 6. 更新池状态
  pool.assignedLevels.push(...selectedLevels);
  pool.availableLevels = pool.availableLevels.filter(id => !selectedLevels.includes(id));
  pool.sparePool = [...pool.availableLevels];  // 剩余进入备用池
  
  // 7. 返回结果
  return {
    layerNumber,
    battleCellAssignments: assignments,
    bossAssignment: {
      cellId: bossCellId,
      baseLevelId: baseBossId,
      enhancedLevelId: bossConfig.bossLevelId,
      enhancementLevel,
    },
    assignmentSeed: this.seed,
    timestamp: Date.now(),
  };
}
```

### 3. BOSS改造算法

```typescript
function enhanceBossLevel(
  baseLevelId: string,
  enhancementLevel: number  // 1-5
): EnhancedBossConfig {
  
  // 强化等级映射表
  const ENHANCEMENT_TABLE: Record<number, EnhancementParams> = {
    1: { hpMultiplier: 1.5, newSkills: 0, newCards: 1 },
    2: { hpMultiplier: 2.0, newSkills: 1, newCards: 1 },
    3: { hpMultiplier: 2.5, newSkills: 1, newCards: 2 },
    4: { hpMultiplier: 3.0, newSkills: 2, newCards: 2 },
    5: { hpMultiplier: 3.5, newSkills: 2, newCards: 3 },
  };
  
  const params = ENHANCEMENT_TABLE[enhancementLevel];
  
  // 生成改造后BOSS关ID
  const bossLevelId = `${baseLevelId}_BOSS`;
  
  // 从技能池和卡牌池中随机选择新增内容
  const newSkillsAdded = this.selectRandomSkills(params.newSkills);
  const newCardsAdded = this.selectRandomCards(params.newCards);
  
  // 数据包池（该层全部9个数据包）
  const dataPacketPoolIds = this.getDataPacketPoolForLayer(layerNumber);
  
  return {
    originalLevelId: baseLevelId,
    bossLevelId,
    enhancementLevel,
    hpMultiplier: params.hpMultiplier,
    newSkillsAdded,
    newCardsAdded,
    rewardDataPacketIds: dataPacketPoolIds,
  };
}
```

### 4. 全塔分配

```typescript
function assignAllLayers(
  layerConfigs: Array<{
    layerNumber: number;
    battleCellIds: string[];
    bossCellId: string;
  }>
): TowerAssignmentResult {
  
  const layers: Record<number, LayerAssignmentResult> = {};
  
  for (const config of layerConfigs) {
    layers[config.layerNumber] = this.assignLayer(
      config.layerNumber,
      config.battleCellIds,
      config.bossCellId
    );
  }
  
  const result: TowerAssignmentResult = {
    seed: this.seed,
    layers,
    totalAssigned: Object.values(layers).reduce(
      (sum, l) => sum + Object.keys(l.battleCellAssignments).length, 0
    ),
    totalSpare: 142 - 90,  // 52个备用
    validationPassed: false,  // 稍后验证
  };
  
  // 验证分配结果
  const validation = this.validateAssignment(result);
  result.validationPassed = validation.valid;
  
  return result;
}
```

### 5. 验证算法

```typescript
function validateAssignment(result: TowerAssignmentResult): AssignmentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allAssignedLevels = new Set<string>();
  
  for (const [layerNum, layerResult] of Object.entries(result.layers)) {
    const levels = Object.values(layerResult.battleCellAssignments);
    
    // 检查重复
    for (const levelId of levels) {
      if (allAssignedLevels.has(levelId)) {
        errors.push(`Duplicate level ${levelId} found`);
      }
      allAssignedLevels.add(levelId);
    }
    
    // 检查数量
    if (levels.length === 0) {
      errors.push(`Layer ${layerNum} has no assigned levels`);
    }
    
    // 检查BOSS存在
    if (!layerResult.bossAssignment.baseLevelId) {
      errors.push(`Layer ${layerNum} missing boss assignment`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    coverageStats: {
      totalSlots: 90,
      filledSlots: allAssignedLevels.size,
      duplicateCheck: errors.length === 0,
      themeMatchCheck: true,  // 简化检查
    },
  };
}
```

## 数据结构定义

```typescript
// 关卡数据库条目
interface LevelDatabaseEntry {
  id: string;                    // "LV001"
  theme: ThemeCategory;
  difficulty: number;            // 1-5
  title: string;
  description: string;
  // ... 其他关卡元数据
}

// 分配结果
interface LayerAssignmentResult {
  layerNumber: number;
  battleCellAssignments: Record<string, string>;  // cellId → levelId
  bossAssignment: {
    cellId: string;
    baseLevelId: string;
    enhancedLevelId: string;
    enhancementLevel: number;
  };
  assignmentSeed: number;
  timestamp: number;
}

interface TowerAssignmentResult {
  seed: number;
  layers: Record<number, LayerAssignmentResult>;
  totalAssigned: number;
  totalSpare: number;
  validationPassed: boolean;
}

interface EnhancedBossConfig {
  originalLevelId: string;
  bossLevelId: string;
  enhancementLevel: number;
  hpMultiplier: number;
  newSkillsAdded: string[];
  newCardsAdded: string[];
  rewardDataPacketIds: string[];
}

interface AssignmentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  coverageStats: {
    totalSlots: number;
    filledSlots: number;
    duplicateCheck: boolean;
    themeMatchCheck: boolean;
  };
}
```

## 关键要求

1. **可复现性**：使用种子随机数生成器，相同种子产生相同分配结果
2. **无重复**：同一局游戏中，90个战斗格分配90个不同的关卡
3. **主题匹配**：每层只分配对应主题的关卡（第N层只分配T{N}主题关卡）
4. **BOSS改造**：根据层级难度对BOSS进行强化
5. **备用池管理**：记录52个未被选中的关卡，用于后续扩展

## 验收标准

- [ ] `LevelAssignmentEngine` 类实现完成
- [ ] `initializePools()` 正确分类142关
- [ ] `assignLayer()` 正确分配单层关卡
- [ ] `assignAllLayers()` 正确分配9层共90关
- [ ] `enhanceBossLevel()` 正确改造BOSS（HP倍率+新技能+新卡牌）
- [ ] `validateAssignment()` 正确检测重复和缺失
- [ ] 相同种子产生相同分配结果（可复现性）
- [ ] 单元测试覆盖：正常分配、边界条件、重复检测、种子复现

## 注意事项

1. **依赖A组和B组**：需要M01的类型定义和M03的 `pickN()` 工具函数
2. **需要B组的地图数据**：需要知道每层的 `battleCellIds` 和 `bossCellId`
3. **与M04的交互**：将分配结果注入到 `BattleCell.levelId` 和 `BossCell.bossLevelId`
4. **与M11的交互**：分配结果需要保存到进度存档中
5. **完成后通知D组可以开始M06/M07/M08开发**

## 输出位置

代码文件存放于：
```
D:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\engine\LevelAssignmentEngine.ts
```

---

**开始开发前，请确认A组已完成M01/M03，B组已完成M04，并完整阅读 M05-M08_核心引擎规格.md 的M05部分。**
