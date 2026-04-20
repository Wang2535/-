# B组 Prompt：地图数据层开发（M04）

## 任务概述

你负责开发**安全实践爬塔模式**的地图数据层，创建9层塔的完整地图数据结构。这是所有游戏逻辑运行的基础数据。

## 必读文档

**核心规格文档**：
- [M01-M04_基础层规格.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/M01-M04_基础层规格.md)
  - 重点阅读：M04 地图数据层（第967-1073行，第1层完整数据模板）
  - 参考数据结构：`TowerLayerData`, `GameCell`, `PathConnection`, `ZoneDefinition`

**地图设计参考**：
- [01_地图造型设计规范.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/01_地图造型设计规范.md) - 9层造型规范
- [02_功能格子系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/02_功能格子系统设计.md) - 5种功能格定义
- [03_特殊区域系统设计.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/03_特殊区域系统设计.md) - 6种特殊区域定义

**Prompt参考**（用于理解每层视觉风格）：
- [05_第1-3层分地图Prompt.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/05_第1-3层分地图Prompt.md)
- [06_第4-6层分地图Prompt.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/06_第4-6层分地图Prompt.md)
- [07_第7-9层及总地图Prompt.md](file:///D:/X学习/学习文件合集/中科院实习/工作五：桌游设计/额外尝试：trae基于kimi第七版的进一步完善/game-temp/模式三规划记录/07_第7-9层及总地图Prompt.md)

## 开发内容

### M04: 地图数据层 (`tower-mode/data/`)

创建9层地图的完整数据文件：

```
tower-mode/data/
├── layers/
│   ├── layer1-virus-lab.ts          # 第1层：病毒实验室（葫芦形）
│   ├── layer2-cyberspace.ts         # 第2层：网络空间（双环拓扑）
│   ├── layer3-data-vault.ts         # 第3层：数据保险库（同心圆要塞）
│   ├── layer4-grid-city.ts          # 第4层：城市街区（网格布局）
│   ├── layer5-smart-factory.ts      # 第5层：智能工厂（生产树形）
│   ├── layer6-mobile-terminal.ts    # 第6层：移动终端（六边形蜂巢）
│   ├── layer7-cloud-platform.ts     # 第7层：云端平台（不规则云状）
│   ├── layer8-future-lab.ts         # 第8层：未来实验室（量子云团）
│   └── layer9-command-center.ts     # 第9层：指挥中心（对称王座厅）
├── layerRegistry.ts                 # 层数据注册表
└── index.ts                         # 统一导出
```

## 每层数据结构要求

每层必须实现完整的 `TowerLayerData` 接口：

```typescript
export const LAYER_XX_DATA: TowerLayerData = {
  // 元信息
  layerNumber: number,           // 1-9
  themeId: ThemeCategory,        // 主题标识
  shapeType: string,             // 造型名称
  shapeDescription: string,      // 造型描述
  
  // 尺寸
  gridSize: { rows: number, cols: number },
  totalCells: number,            // 格子总数（约13-17个）
  
  // 数据
  cells: GameCell[],             // 所有格子（含起点、战斗格、功能格、BOSS格）
  cellIndex: Record<string, GameCell>, // cellId → cell 快速查找表
  
  // 连接
  paths: PathConnection[],       // 所有路径连接
  adjacencyList: Record<string, string[]>, // cellId → neighborIds[]
  
  // 特殊区域
  zones: ZoneDefinition[],       // 6种区域（W/N/I/P/S/D）的分布
  zoneIndex: Record<ZoneType, ZoneDefinition>,
  
  // 关键位置
  startCellId: string,           // 起点格子ID
  bossCellId: string,            // BOSS格子ID
  endCellId: string | null,      // 终点格子ID（第1-8层为null，第9层为null）
  
  // 主题配置
  colorScheme: LayerColorScheme,
  ambientConfig: AmbientConfig,
};
```

## 各层具体要求

### 第1层：病毒实验室（葫芦形）
- **格子数**: 13个
- **造型**: 上部窄小入口 + 下部宽大实验区
- **功能格分布**: 1起点(Chance) + 8战斗格 + 1Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(3格) + N区(2格) + I区(2格) + P区(2格)
- **参考**: M01-M04文档第967-1073行已有完整示例

### 第2层：网络空间（双环拓扑）
- **格子数**: 17个
- **造型**: 内外双环 + 交叉连接
- **功能格分布**: 1起点 + 11战斗格 + 2Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(4格) + N区(3格) + I区(2格) + P区(2格) + S区(2格)

### 第3层：数据保险库（同心圆要塞）
- **格子数**: 13个
- **造型**: 3层同心圆 + 径向通道
- **功能格分布**: 1起点 + 7战斗格 + 2Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(3格) + N区(2格) + I区(2格) + D区(2格)

### 第4层：城市街区（网格布局）
- **格子数**: 11个
- **造型**: 3×3网格 + 街区通道
- **功能格分布**: 1起点 + 6战斗格 + 1Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(2格) + N区(2格) + I区(2格) + P区(2格)

### 第5层：智能工厂（生产树形）
- **格子数**: 16个
- **造型**: 主干 + 分支 + 汇聚点
- **功能格分布**: 1起点 + 10战斗格 + 2Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(3格) + N区(3格) + I区(2格) + D区(3格) + S区(2格)

### 第6层：移动终端（六边形蜂巢）
- **格子数**: 17个
- **造型**: 蜂窝六边形网格
- **功能格分布**: 1起点 + 11战斗格 + 2Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(4格) + N区(3格) + I区(2格) + P区(2格) + S区(2格)

### 第7层：云端平台（不规则云状）
- **格子数**: 14个
- **造型**: 飘逸不规则形状 + 浮动平台
- **功能格分布**: 1起点 + 9战斗格 + 1Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(3格) + N区(2格) + I区(2格) + D区(2格)

### 第8层：未来实验室（量子云团）
- **格子数**: 15个
- **造型**: 量子叠加态云团 + 概率路径
- **功能格分布**: 1起点 + 10战斗格 + 1Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(3格) + N区(2格) + I区(3格) + D区(2格) + S区(2格)

### 第9层：指挥中心（对称王座厅）
- **格子数**: 13个
- **造型**: 对称轴 + 王座 + 仪式通道
- **功能格分布**: 1起点 + 8战斗格 + 1Skill格 + 1书店格 + 1BOSS格 + 1机会格
- **区域分布**: W区(2格) + N区(2格) + I区(2格) + D区(3格) + S区(2格)

## 关键要求

### 1. 格子ID命名规范
```typescript
// 格式: R{row}C{col}
// 示例: R0C2, R1C1, R5C2
const cellId = `R${row}C${col}`;
```

### 2. 路径连接要求
- 必须确保从起点可以到达所有格子（连通性）
- 路径可以单向或双向
- 相邻格子之间必须有路径连接

### 3. 区域分布原则
- 每个区域类型至少出现1-2次
- W区（虚弱）和D区（危险）应分布在战斗格附近
- N区（知识）应靠近书店格
- I区（反转）应分布在关键路径上

### 4. 功能格平衡
- 每层必须包含：1起点、8-11战斗格、1-2Skill格、1书店格、1BOSS格
- 机会格数量：1-2个
- 战斗格难度应随深度递增

## 辅助工具

你需要创建以下辅助函数：

```typescript
// layerRegistry.ts
export const LAYER_REGISTRY: Record<number, TowerLayerData> = {
  1: LAYER_01_DATA,
  2: LAYER_02_DATA,
  // ...
  9: LAYER_09_DATA,
};

export function getLayerData(layerNumber: number): TowerLayerData {
  return LAYER_REGISTRY[layerNumber];
}

export function getAllLayers(): TowerLayerData[] {
  return Object.values(LAYER_REGISTRY);
}

// 验证函数
export function validateLayerData(data: TowerLayerData): ValidationResult {
  // 检查连通性
  // 检查必需格子存在
  // 检查区域覆盖
  // 返回验证结果
}
```

## 验收标准

- [ ] 9层地图数据全部创建完成
- [ ] 每层数据通过 `validateLayerData()` 验证
  - 起点可达所有格子
  - 包含必需的功能格类型
  - 区域分布合理
- [ ] `layerRegistry.ts` 注册表创建完成
- [ ] 所有格子ID命名规范统一
- [ ] 路径连接正确无误
- [ ] 提供每层的数据可视化草图（ASCII或文字描述）

## 注意事项

1. **等待A组完成**：M01类型定义必须先完成，确保类型正确
2. **数据是静态的**：这些是纯数据文件，不包含任何逻辑
3. **后续会注入关卡ID**：M05关卡分配引擎会将 `levelId` 注入到 BattleCell 中
4. **坐标系统**：使用 [row, col] 格式，row从上到下，col从左到右
5. **完成后通知C组可以开始M05开发**

## 输出位置

所有代码文件存放于：
```
D:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\src\tower-mode\data\
```

---

**开始开发前，请确认A组已完成M01类型定义，并完整阅读 M01-M04_基础层规格.md 的M04部分。**
