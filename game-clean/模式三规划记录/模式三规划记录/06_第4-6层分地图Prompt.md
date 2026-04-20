# 第4-6层分地图详细Prompt

> 基于海幸地图风格，含格子坐标+功能类型+特殊区域

---

## 第4层：城市街区（网格街区布局）🏙️

### 造型结构
```
┌─────────────────────────────────────┐
│         ┌───┐                       │
│         │S  │ (0,1) START/CHANCE    │
│         └─┬─┘                      │
│    ┌──────┼──────┬──────┐          │
│    │ N区 │       │ P区   │  第1排街道 │
│    │(1,0)│ (1,2) │(1,4)  │          │
│    └──┬───┴───┬───┴──┬───┘          │
│       │       │      │              │
│  ┌────┼───┐   │   ┌─┼───┐           │
│  │W区  │   │ I区│   │ D区│  第2排街道 │
│  │(2,0)│ (2,2)│  │(2,4)│           │
│  └──┬──┘   └─┬─┘  └─┬──┘           │
│     │        │      │               │
│  ┌──┴──┐  ┌──┴──┐  ┌┴──┐           │
│  │     │  │      │  │   │  第3排街道 │
│  │(3,0)│  │(3,2) │  │(3,4)│          │
│  │BOOK │  │SKILL │  │BOSS│          │
│  └──┬──┘  └──┬───┘  └─┬─┘           │
│     │        │        │              │
│  ┌──┴────────┴────────┴──┐           │
│  │         (4,2) END      │  主干道终点│
│  └────────────────────────┘           │
│         网格城市街区布局               │
└─────────────────────────────────────┘
```

### 格子坐标表

| 坐标 | 类型 | 关卡编号 | 区域 | 难度 | 说明 |
|------|------|---------|------|------|------|
| (0,1) | CHANCE | - | S区 | - | 城市入口欢迎事件 |
| (1,0) | BATTLE | LV049 | **N区** | ★★ | 钓鱼邮件识别 |
| (1,2) | BATTLE | LV050 | 无 | ★★ | 电话诈骗防范 |
| (1,4) | BATTLE | LV051 | **P区** | ★★★ | 假冒网站检测 |
| (2,0) | BATTLE | LV052 | **W区** | ★★★ | 社交工程基础 |
| (2,2) | BATTLE | LV053 | **I区** | ★★★ | 心理操纵识别 |
| (2,4) | BATTLE | LV054 | **D区** | ★★★★ | 内部威胁检测 |
| (3,0) | BOOKSTORE | - | W区 | - | 书店格（心理学书籍） |
| (3,2) | SKILL | - | I区 | - | 技能格（社交技能） |
| (3,4) | **BOSS** | **LV064_BOSS** | D区 | ★★★★★ | 幕后操纵者·诈骗之王 |
| (4,2) | END | - | 无 | - | 地铁站通往第5层 |

### 特殊区域

| 区域 | 范围 | 效果 |
|------|------|------|
| **N区（知识）** | (1,0), 左上街区 | 获随机书籍 |
| **P区（跳过）** | (1,4), 右上街区 | 跳过下回合 |
| **W区（虚弱）** | (2,0),(3,0), 西侧街区 | 投掷-1 |
| **I区（反转）** | (2,2),(3,2), 中间街区 | 地图倒置 |
| **D区（危险）** | (2,4),(3,4), 东侧街区 | 损失资源 |
| **S区（加速）** | (0,1), 入口区 | 额外投掷 |

### 路径连接

```
横向街道：row1: (1,0)↔(1,2)↔(1,4)
          row2: (2,0)↔(2,2)↔(2,4)
          row3: (3,0)↔(3,2)↔(3,4)
纵向街道：col0: (1,0)↔(2,0)↔(3,0)
          col2: (0,1)→(1,2)→(2,2)→(3,2)→(4,2)
          col4: (1,4)↔(2,4)↔(3,4)
斜向捷径：(1,0)↔(2,2), (1,4)↔(2,2)
```

### 地形纹理

| 元素 | 描述 |
|------|------|
| 地板 | 铺装沥青道路带黄线，人行道混凝土纹理 |
| 建筑 | 立面剪影：办公楼/咖啡馆/商店/公寓，海幸风格的艺术装饰 |
| 背景 | 城市天际线，温暖日落照明长阴影，艺术藤蔓装饰 |
| N区 | 图书馆建筑群，蓝色玻璃幕墙 |
| P区 | 公园绿地，休闲氛围 |
| W区 | 工业旧区，昏暗路灯 |
| I区 | 迷宫式老城区，复杂巷道 |
| D区 | 黑暗巷子，可疑人物出没 |
| 装饰 | 路灯、交通标志、井盖、绿植盆栽，艺术藤蔓装饰 |

### AI绘图Prompt

```markdown
【英文Prompt】
Top-down game map, urban city district grid layout inspired by Hayami style,
3x3 block grid with streets as pathways between blocks,

GRID STRUCTURE:
- 3 rows × 3 columns of city blocks
- Streets form grid pattern between blocks (thick black borders)
- Each intersection is a node position
- Total 10 visible nodes on street intersections

BLOCK DETAILS (what's inside each block):
- NW block (W zone): dark industrial area with old warehouses
- NE block (N zone): modern library complex with blue glass
- Center block (I zone): maze-like historic district
- SE block (D zone): dark alleyways, suspicious atmosphere
- SW block: bookstore building with warm lighting
- Center-south: skill acquisition center
- East block: boss arena in corporate HQ tower

STREET PATHWAYS:
- Asphalt texture with yellow lane markings
- Sidewalk concrete texture along edges
- Street lamps at regular intervals
- Manhole covers and traffic signs
- Colorful alternating yellow and white paths with artistic flourishes
- Artistic vine-like decorations along street edges

ZONE OVERLAYS:
- N zone (NW): blue-tinted library district glow
- P zone (NE): green park area with trees
- W zone (SW): red-dimmed industrial decay
- I zone (center): purple maze pattern overlay
- D zone (SE): deep red danger shadows

NODE VISUALS:
- Battle nodes: white circles with "N" at intersections
- Bookstore node: green book icon building
- Skill node: magenta training center
- Boss node: large corporate tower with red glow
- Chance node: golden welcome plaza
- End node: subway station entrance

ATMOSPHERE:
- Warm sunset lighting from west
- Long shadows across eastward streets
- Cozy urban feel mixed with hidden dangers
- City skyline silhouette in background
- Artistic Hayami-style elements throughout

STYLE:
- Isometric view, warm illustration style with Hayami-inspired artistic elements
- Detailed building facades with windows
- Cozy yet mysterious urban atmosphere
- Game asset quality, clean art style with artistic flourishes
- 16:9 aspect ratio
- Rich background details with fantasy elements
--ar 16:9 --v 6 --style raw --q 2 --s 250 --no text, labels

【中文描述】
俯视游戏地图，海幸风格的城市街区网格布局，
3×3街区块网格，街道作为区块间路径，

网格结构：3行×3列城市块，街道形成网格图案，
每个交叉点是一个节点位置，共10个可见节点

区块细节：西北W区暗淡工业仓库/东北N区现代图书馆蓝玻璃/
中心I区迷宫历史街区/东南D区黑暗巷道可疑气氛/
西南书店建筑暖光/中南技能获取中心/东Boss企业总部塔楼

街道路径：沥青材质黄线标，人行道混凝土纹理，
路灯规律间隔，井盖交通标志，
彩色交替的黄色和白色路径，带有艺术装饰，
街道边缘有艺术藤蔓装饰

区域覆盖：N区蓝调图书馆/P区绿色公园/W区红色工业衰退/
I区紫色迷宫图案/D区深红危险阴影

节点视觉：战斗白圆圈"N"/书店绿书图标/Skill洋红训练中心/
Boss大红企业塔/机会金色欢迎广场/End地铁站入口

氛围：温暖日落西照长阴影东投，舒适都市感混合隐藏危险，
城市天际线背景剪影，贯穿整个场景的海幸风格艺术元素

风格：等距视角温暖插画风格，带有海幸风格的艺术元素，
详细建筑立面带窗户，舒适神秘都市氛围，
游戏素材质量干净艺术风格带艺术装饰，16:9游戏素材，丰富的背景细节和奇幻元素
```

---

## 第5层：智能工厂（流水线树形）🏭

### 造型结构
```
                    ┌───────┐
                    │ (0,4) │ ← START/原料入库
                    │CHANCE │
                    └───┬───┘
                        │
                   ┌────┴────┐
                   │  主干线   │
                (1,3)───┼───(1,5)
                   │        │
            ┌──────┤   ┌────┤
            │ 分支A │   │分支B│
          (2,1)   (2,3)(2,5)  (2,7)
            │        │    │     │
         ┌──┴──┐  ┌─┴─┐  │  ┌─┴──┐
         │质检A│  │组装│ │  │质检B│
        (3,0) (3,2)(3,4)(3,6)(3,8)
         │  │     │    │     │  │
    ┌────┴──┼─────┼────┼─────┼──┴────┐
    │   包装A│  SKILL │ BOOK │  包装B  │
    │  (4,1) │  (4,4) │(4,6) │ (4,7)  │
    └────┬───┘    └──┬──┘  └──┬───┘
         │           │         │
         └─────┬─────┴─────┬───┘
               │  BOSS     │
              (5,4)       │
               [END]  ────┘
         流水线树形结构
```

### 格子坐标表

| 坐标 | 类型 | 关卡编号 | 区域 | 难度 | 说明 |
|------|------|---------|------|------|------|
| (0,4) | CHANCE | - | S区 | - | 原料接收检验 |
| (1,3) | BATTLE | LV065 | 无 | ★★ | SCADA系统入门 |
| (1,5) | BATTLE | LV066 | S区 | ★★ | IoT设备安全 |
| (2,1) | BATTLE | LV067 | W区 | ★★★ | 工控协议分析 |
| (2,3) | BATTLE | LV068 | W区 | ★★★ | PLC编程安全 |
| (2,5) | BATTLE | LV069 | N区 | ★★★ | 智能电网防护 |
| (2,7) | BATTLE | LV070 | N区 | ★★★★ | 工业物联网 |
| (3,0) | BATTLE | LV071 | D区 | ★★★★ | 物理安全边界 |
| (3,2) | BATTLE | LV072 | D区 | ★★★★ | 供应链攻击 |
| (3,4) | BATTLE | LV073 | I区 | ★★★★ | 固件安全验证 |
| (3,6) | BOOKSTORE | - | N区 | - | 书店格（工控手册） |
| (3,8) | BATTLE | LV074 | P区 | ★★★★★ | OT安全运营 |
| (4,1) | BATTLE | LV075 | D区 | ★★★★★ | 安全运维中心 |
| (4,4) | SKILL | - | I区 | - | 技能格（工控技能） |
| (4,6) | CHANCE | - | P区 | - | 机会格（设备故障） |
| (4,7) | BATTLE | LV076 | P区 | ★★★★★ | 威胁狩猎 |
| (5,4) | **BOSS** | **LV080_BOSS** | 核心 | ★★★★★★ | 叛变AI·失控主控 |

### 特殊区域

| 区域 | 范围 | 效果 |
|------|------|------|
| **S区（加速）** | (0,4)-(1,5) 入口主干 | 额外投掷 |
| **W区（虚弱）** | (2,1)-(2,3) 左分支上游 | 投掷-1 |
| **N区（知识）** | (2,5)-(2,7)+(3,6) 右分支 | 获书籍 |
| **D区（危险）** | (3,0)-(3,2)+(4,1) 左下游 | 损资源 |
| **I区（反转）** | (3,4)-(4,4) 中轴核心 | 地图倒置 |
| **P区（跳过）** | (3,8)+(4,6)-(4,7) 右末端 | 跳过回合 |

### 路径连接

```
主干线：(0,4)→(1,3)→(1,5)→(3,4)→(5,4)
左分支A：(1,3)→(2,1)→(3,0)→(4,1)
左分支A2：(2,1)→(3,2)→(4,1)
中分支：(1,3)→(2,3)→(3,4) 或 (2,3)→(4,4)
右分支B：(1,5)→(2,5)→(3,4) 或 (2,5)→(3,6)→(4,6)
右分支B2：(1,5)→(2,7)→(3,8)→(4,7)
汇聚：所有分支最终汇入(5,4) BOSS
```

### 地形纹理

| 元素 | 描述 |
|------|------|
| 地板 | 工业混凝土油渍，黄色安全警示条纹 |
| 机械 | 传送带、机械臂、管道、控制面板 |
| 背景 | 工厂天花板管道灯具，海幸风格的艺术元素 |
| S区 | 明亮整洁的新设备区 |
| W区 | 陈旧生锈的老旧设备区 |
| N区 | 标准化操作示范区 |
| D区 | 高危作业区红色警示 |
| I区 | 中央控制核心区紫光 |
| P区 | 维修停机区 |
| 装饰 | 蒸汽阀门、火花效果、警示灯，艺术藤蔓装饰 |

### AI绘图Prompt

```markdown
【英文Prompt】
Top-down game map, automated smart factory floor plan inspired by Hayami style,
tree-shaped production line layout with main trunk and branches,

LAYOUT STRUCTURE:
- Main trunk pathway running top to bottom (raw materials → assembly → shipping)
- Left branch A: quality control and inspection line (2 sub-branches)
- Right branch B: packaging and secondary processing (2 sub-branches)
- All branches converge at bottom center boss arena
- Tree structure mimics real manufacturing flow

NODE POSITIONS (15 nodes):
- Top: raw material intake (chance node)
- Upper trunk: 2 battle nodes (SCADA/IoT basics)
- Branch split point: decision junction
- Left branch: 4 nodes (protocol/PLC/physical/supply chain)
- Right branch: 5 nodes (smart grid/IIoT/bookstore/OT ops)
- Center axis: 3 nodes (firmware/skill/boss)
- Bottom: boss arena in central control room

FACTORY VISUAL ELEMENTS:
- Conveyor belts along main pathways (animated suggestion)
- Robotic arms at assembly nodes
- Pipeline networks connecting zones
- Control panels and monitoring screens
- Yellow safety stripes on walkways
- Warning lights at danger zones
- Artistic vine-like decorations on machinery and walls

ZONE TINTING:
- S zone (top): bright clean new equipment area
- W zone (left-upper): rusty aged machinery, dim lighting
- N zone (right-upper): standardized operation demo area
- D zone (left-lower): high-risk red warning zone
- I zone (center): purple glow core control area
- P zone (right-end): maintenance shutdown area

INDUSTRIAL DETAILS:
- Steam vents emitting white vapor
- Occasional spark effects near welding stations
- Oil stains on concrete floor
- Overhead crane silhouettes
- Emergency stop buttons at key points
- Artistic Hayami-style elements throughout

STYLE:
- Isometric view, industrial blueprint aesthetic with Hayami-inspired artistic elements
- Technical illustration with mechanical details
- Busy active factory atmosphere
- Clean vector lines with industrial texture overlays and artistic flourishes
- 16:9, game asset, no text
- Rich background details with fantasy elements
--ar 16:9 --v 6 --style raw --q 2 --s 300 --no text, labels

【中文描述】
俯视游戏地图，海幸风格的自动化智能工厂平面图，
树形生产线布局主干加分支，

布局结构：主干路径自上而下（原料→装配→发货）
左分支A：质量检验线（2个子分支）/右分支B：包装二次加工（2个子分支）
所有分支在底部中心Boss竞技场汇合，树形结构模拟真实制造流程

节点位置15个：顶部原料接收(机会)/上主干2战( SCADA/IoT )/
分支分叉决策点/左分支4关(协议/PLC/物理/供应链)/
右分支5关(智能电网/IIoT/书店/OT Ops)/
中轴3关(固件/Skill/Boss)/底部Boss中央控制室

工厂视觉元素：传送带沿主路径/装配节点机械臂/
区域间管道网络/控制面板监控屏/走道黄色安全条纹/
危险区警示灯光，机器和墙壁上有艺术藤蔓装饰

区域着色：S区明亮洁净新设备/W区左侧上方锈迹老旧机械/
N区右侧上方标准化操作/D区左下方高危红色警告/
I区中心紫色光芒核心控制/P区右端维修停机

工业细节：蒸汽通风口白汽/焊接站偶发火花/
地面混凝土油污/ overhead起重机剪影/关键点紧急停止按钮，
贯穿整个场景的海幸风格艺术元素

风格：等距视角工业蓝图美学，带有海幸风格的艺术元素，
技术插画机械细节，繁忙活跃工厂氛围，
干净矢量线条工业纹理叠加带艺术装饰，16:9游戏素材，丰富的背景细节和奇幻元素
```

---

## 第6层：移动终端（六边形蜂窝）📱

### 造型结构
```
              ╱╲
             ╱  ╲
            ╱(0,3)╲    ← START/CHANCE
           ╱  入口  ╲
          ╱────┬────╲
         ╱     │     ╲
        ╱ (1,2)│(1,4) ╲   第1环（6格）
       ╱───┬───┼───┬───╲
      ╱(2,1)│(2,3)│(2,5)╲  第2环（6格）
     ╱──┬───┼───┼───┼───╲
    ╱(3,0)│(3,2)│(3,4)│(3,6)╲ 第3环（外围）
   ╱────┼───┼───┼───┼────╲
  ╱      │   │BOOK│SKILL│    ╲
 ╱ (4,1) │(4,3)│(4,5)│(4,7)  ╲ 第4环
╱────────┼───┼────┼────┼──────╲
│  (5,2) │   │ BOSS│     │(5,6)  │
│ CHANCE │(5,4)│     │END   │      │
╱────────┴───┴────┴────┴──────╲
         六边形蜂窝结构
```

### 格子坐标表

| 坐标 | 类型 | 关卡编号 | 区域 | 难度 | 说明 |
|------|------|---------|------|------|------|
| (0,3) | CHANCE | - | S区 | - | 设备激活欢迎 |
| (1,2) | BATTLE | LV081 | N区 | ★★ | 移动恶意软件 |
| (1,4) | BATTLE | LV082 | N区 | ★★ | APP安全基础 |
| (2,1) | BATTLE | LV083 | W区 | ★★★ | MDM策略配置 |
| (2,3) | BATTLE | LV084 | W区 | ★★★ | BYOD风险管理 |
| (2,5) | BATTLE | LV085 | I区 | ★★★ | 移动支付安全 |
| (3,0) | BATTLE | LV086 | D区 | ★★★★ | 端点检测响应 |
| (3,2) | BATTLE | LV087 | D区 | ★★★★ | 移动威胁情报 |
| (3,4) | BOOKSTORE | - | N区 | - | 书店格（移动安全书籍） |
| (3,6) | BATTLE | LV088 | P区 | ★★★★ | 5G安全架构 |
| (4,1) | BATTLE | LV089 | D区 | ★★★★ | 企业移动管理 |
| (4,3) | CHANCE | - | I区 | - | 机会格（系统更新） |
| (4,5) | SKILL | - | S区 | - | 技能格（移动技能） |
| (4,7) | BATTLE | LV090 | P区 | ★★★★★ | 物联网网关安全 |
| (5,2) | CHANCE | - | W区 | - | 机会格（充电站） |
| (5,4) | **BOSS** | **LV096_BOSS** | 核心 | ★★★★★★ | 漏洞利用大师·移动幽灵 |
| (5,6) | END | - | 无 | - | 升级通道至第7层 |

### 特殊区域

| 区域 | 蜂窝范围 | 效果 |
|------|---------|------|
| **S区（加速）** | 顶部(0,3)+中部(4,5) | 额外投掷 |
| **N区（知识）** | 上环(1,2)-(1,4)+中环(3,4) | 获书籍 |
| **W区（虚弱）** | 左侧(2,1)-(2,3)+底部(5,2) | 投掷-1 |
| **I区（反转）** | (2,5)+(4,3) 中轴线偏右 | 地图倒置 |
| **P区（跳过）** | 右侧(3,6)+(4,7) | 跳过回合 |
| **D区（危险）** | 外围左侧(3,0)-(3,2)+(4,1) | 损失资源 |

### 路径连接（六边形邻接）

```
六边形邻接规则（每格最多6个邻居）：
(0,3) ↔ (1,2) ↔ (1,4)
(1,2) ↔ (2,1) ↔ (2,3) ↔ (1,4)
(2,1) ↔ (3,0) ↔ (3,2) ↔ (2,3)
(2,3) ↔ (3,2) ↔ (3,4)
(2,5) ↔ (3,4) ↔ (3,6) ↔ (1,4)
(3,0) ↔ (4,1) ↔ (3,2)
(3,2) ↔ (4,1) ↔ (4,3) ↔ (3,4)
(3,4) ↔ (4,3) ↔ (4,5) ↔ (3,6)
(3,6) ↔ (4,5) ↔ (4,7)
(4,1) ↔ (5,2) ↔ (4,3)
(4,3) ↔ (5,2) ↔ (5,4) ↔ (4,5)
(4,5) ↔ (5,4) ↔ (4,7)
(5,4) ↔ (5,2) ↔ (5,6)[END]
```

### 地形纹理

| 元素 | 描述 |
|------|------|
| 地板 | 白色瓷砖配紫色强调线，充电接口图案 |
| 设备 | 智能手机测试台、平板支架、APP界面投影 |
| 背景 | 现代科技实验室玻璃墙，海幸风格的艺术元素 |
| S区 | 高速充电区明亮发光 |
| N区 | 学习研究区蓝光屏幕 |
| W区 | 信号弱区暗淡 |
| I区 | 不稳定实验区紫光闪烁 |
| P区 | 待机休眠区暖黄光 |
| D区 | 感染隔离区红光警报 |
| 装饰 | WiFi信号图标、蓝牙符号、充电线缆、通知气泡，艺术藤蔓装饰 |

### AI绘图Prompt

```markdown
【英文Prompt】
Top-down game map, mobile device testing laboratory inspired by Hayami style,
hexagonal honeycomb cell layout with 17 nodes,

HONEYCOMB STRUCTURE:
- Hexagonal grid pattern resembling cellular network topology
- Each hexagon cell contains one game node
- Cells arranged in expanding rings from center
- 4 concentric hexagonal rings total
- Organic flow suggesting mobile signal propagation
- Artistic vine-like decorations between cells

RING LAYOUT (outside to inside):
- Outer ring (ring 4): 4 nodes at periphery (battle nodes)
- Ring 3: 4 nodes (battle + bookstore)
- Ring 2: 4 nodes (battle cluster)
- Ring 1: 2 nodes (entry nodes)
- Center area: boss + chance + end nodes

CELL CONTENTS:
- Each hexagon shows its interior through glass floor
- Smartphone screens visible in test cells
- App icons floating in bookstore cell
- Charging cables in rest cells
- Glowing circuit patterns in skill cell

PATHWAYS:
- Hexagon edges serve as pathways
- Thick black borders defining each cell edge
- Internal fill: purple-lit corridors with app icons floating
- Connection bridges between non-adjacent cells
- Circuit board trace patterns on path surfaces
- Colorful alternating yellow and white paths with artistic flourishes

ZONE COLOR CODING:
- S zone (top + mid-right): bright cyan acceleration glow
- N zone (upper ring + center-left): blue knowledge aura
- W zone (left side): dim red weakness tint
- I zone (mid-axis right): purple inversion swirl
- P zone (right side): amber pause indicator
- D zone (outer left): deep red danger markers

MOBILE TECH DETAILS:
- Smartphone silhouettes at various sizes
- WiFi signal waves emanating from S zone
- Bluetooth icons connecting nearby cells
- Notification bubbles popping up
- Battery charge indicators
- Fingerprint scanner patterns
- Artistic Hayami-style elements throughout

STYLE:
- Isometric view, modern tech minimalist aesthetic with Hayami-inspired artistic elements
- Clean geometric hexagonal precision
- High-tech gadget atmosphere
- Purple/blue/cyan color scheme dominant
- Game asset, vector clean style with artistic flourishes
- 16:9 aspect ratio
- Rich background details with fantasy elements
--ar 16:9 --v 6 --style raw --q 2 --s 300 --no text, labels

【中文描述】
俯视游戏地图，海幸风格的移动设备测试实验室，
六边形蜂窝格子布局17个节点，

蜂窝结构：六边形网格模拟蜂窝网络拓扑，
每个六边形格子含一个游戏节点，
格子按扩展环从中心排列，共4层同心六边形环，
有机流动暗示移动信号传播，
单元格之间有艺术藤蔓装饰

环布局（外到内）：外环4节点外围战斗/
第3环4关战斗+书店/第2环4关战斗簇/
第1环2节点入口/中心区Boss+机会+End

格子内容：每个六边形透过玻璃地板显示内部，
智能手机屏幕可见测试单元，APP图标漂浮书店格，
充电线缆休息格，发光电路图案Skill格

路径：六边形边缘作为路径，粗黑边框定义每条边，
内部填充紫色照明走廊浮动APP图标，
非相邻格子间连接桥梁，路径表面电路板痕迹图案，
彩色交替的黄色和白色路径，带有艺术装饰

区域色彩编码：S区顶+中右明亮青色加速光晕/
N区上环+中左蓝色知识光环/W区左侧暗红虚弱色调/
I区中轴右侧紫色反转漩涡/P区右侧琥珀暂停指示/
D区外侧左方深红危险标记

移动技术细节：各种尺寸智能手机剪影/
S区WiFi信号波散发/N区蓝牙图标连接邻近单元格/
通知气泡弹出/电池充电指示器/指纹扫描图案，
贯穿整个场景的海幸风格艺术元素

风格：等距视角现代科技极简美学，带有海幸风格的艺术元素，
干净几何六边形精度，高科技gadget氛围，
紫/蓝/青配色主导，游戏素材质量，矢量干净风格带艺术装饰，16:9游戏素材，丰富的背景细节和奇幻元素
```

---

> **版本**: v1.0  
> **包含**: 第4-6层完整分地图Prompt  
> **每层包含**: ASCII示意图 + 坐标表 + 功能格详情 + 特殊区域 + 路径关系 + 地形纹理 + AI Prompt（双语）
