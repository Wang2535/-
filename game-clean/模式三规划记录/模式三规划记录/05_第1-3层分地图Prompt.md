# 第1-3层分地图详细Prompt

> 基于海幸地图风格，含格子坐标+功能类型+特殊区域

---

## 第1层：病毒实验室（葫芦形培养皿）🧬

### 造型结构
```
┌─────────────────────────────┐
│         [START]             │ ← 入口（葫芦嘴）
│          (0,2)              │    Chance格
│            │                │
│     ┌──────┴──────┐         │
│     │   上环区域   │         │ ← 小圆部分
│     │  (1,1)(1,2) │         │    Battle×2
│     │   (1,3)     │         │
│     └──────┬──────┘         │
│            │                │
│  ┌─────────┼─────────┐      │
│  │  W区   │    N区   │      │ ← 大圆主体（四象限）
│  │(2,0)   │  (2,4)   │      │
│  ├─────────┼─────────┤      │
│  │  I区   │    P区   │      │
│  │(4,0)   │  (4,4)   │      │
│  └────┬────┴────┬────┘      │
│       │  BOSS   │           │ ← Boss格（葫芦底）
│      (5,2)     │           │
│       [END]     │           │
└─────────────────┘           │
        葫芦形培养皿造型        │
└─────────────────────────────┘
```

### 格子坐标表

| 坐标 | 类型 | 关卡编号 | 特殊区域 | 难度 | 说明 |
|------|------|---------|---------|------|------|
| (0,2) | CHANCE | - | 无 | - | 入口机会格 |
| (1,1) | BATTLE | LV003 | W区 | ★★ | 病毒基础识别 |
| (1,2) | BATTLE | LV001 | W区 | ★ | Elk Cloner历史 |
| (1,3) | BATTLE | LV002 | N区 | ★★ | 蠕虫病毒防御 |
| (2,0) | BATTLE | LV005 | **W区** | ★★★ | 勒索软件入门 |
| (2,2) | SKILL | - | 无 | - | 技能格（品质: C/G/R） |
| (2,4) | BOOKSTORE | - | N区 | - | 书店格（病毒学书籍） |
| (3,1) | BATTLE | LV007 | I区 | ★★★ | 恶意代码分析 |
| (3,3) | BATTLE | LV006 | P区 | ★★★ | 木马程序检测 |
| (4,0) | CHANCE | - | **I区** | - | 机会格（反转区效果） |
| (4,2) | BATTLE | LV008 | 无 | ★★★★ | 高级病毒防护 |
| (4,4) | BATTLE | LV004 | **P区** | ★★★ | 特洛伊木马深度 |
| (5,2) | **BOSS** | **LV016_BOSS** | 无 | ★★★★★ | 病毒母体核心 |

### 功能格详情

**CHANCE (0,2)** - 入口欢迎事件
- 可能触发：获得初始资源 / 遭遇巡逻守卫 / 发现隐藏通道
- 视觉：闪烁的绿色入口光门

**SKILL (2,2)** - 第1层技能获取
- 品质概率：普通50% / 优秀30% / 稀有15% / 史诗4% / 传说1%
- 可获技能示例：
  - [C] 快速扫描 - 战斗开始时查看敌人手牌1张
  - [G] 隔离沙箱 - 受到的首次伤害-2
  - [R] 抗体记忆 - 对同类型敌人伤害+15%

**BOOKSTORE (2,4)** - 病毒学书店
- 可选书籍主题：
  - 《计算机病毒简史》→ 了解病毒演化，战斗中额外抽1牌
  - 《恶意代码分析实战》→ 解析能力+10%
  - 《零日漏洞猎手手册》→ 暴击率+5%

**CHANCE (4,0)** - 危险区域机会
- 位于I区（反转区），可能触发地图倒置效果叠加
- 高风险高回报设计

**BOSS (5,2)** - 病毒母体
- BOSS名称："零日之源·变异母体"
- 改造自LV016，强化属性：HP×3 / 新增技能
- 击败奖励：进入第2层 + 数据包选择（3选1）

### 特殊区域范围

```
┌────────────────────────────────────┐
│  W区（虚弱区）坐标范围：            │
│  行: 1-3, 列: 0-1                  │
│  效果：踩中后下次投掷点数-1         │
│  视觉：淡红色半透明覆盖              │
│                                     │
│  N区（知识区）坐标范围：            │
│  行: 1-3, 列: 3-4                  │
│  效果：踩中获得随机书籍×1           │
│  视觉：淡蓝色半透明覆盖              │
│                                     │
│  I区（反转区）坐标范围：            │
│  行: 4-5, 列: 0-1                  │
│  效果：踩中后地图倒置               │
│  视觉：淡紫色半透明覆盖              │
│                                     │
│  P区（跳过区）坐标范围：            │
│  行: 4-5, 列: 3-4                  │
│  效果：踩中后跳过下一回合           │
│  视觉：淡黄色半透明覆盖              │
└────────────────────────────────────┘
```

### 路径连接关系

```
邻接表（双向路径）：
(0,2) ↔ (1,2)
(1,1) ↔ (1,2) ↔ (1,3)
(1,1) ↔ (2,0)
(1,3) ↔ (2,4)
(2,0) ↔ (3,1)
(2,2) ↔ (1,2) ↔ (3,1) ↔ (3,3) ↔ (2,4)
(2,4) ↔ (3,3)
(3,1) ↔ (4,0)
(3,3) ↔ (4,4)
(4,0) ↔ (4,2) ↔ (5,2)
(4,2) ↔ (4,4)
(4,4) ↔ (5,2)

关键路径：
主路线：(0,2) → (1,2) → (2,2) → (4,2) → (5,2) [最短5步]
W区绕路：(0,2) → (1,1) → (2,0) → (3,1) → (4,0) → (4,2) → (5,2)
N区绕路：(0,2) → (1,3) → (2,4) → (3,3) → (4,4) → (5,2)
```

### 地形纹理与氛围

| 元素 | 描述 |
|------|------|
| 地板 | 金属格栅带绿色生物荧光纹路 |
| 墙壁 | 白色瓷砖配生物危害标志⚠️ |
| 背景 | 黑暗实验室设备剪影，红色应急灯脉动 |
| W区地面 | 暗红色污染斑块，管道泄漏痕迹 |
| N区地面 | 整洁的蓝色洁净地板，书本图标投影 |
| I区地面 | 紫色漩涡状能量场，不稳定的光效 |
| P区地面 | 黄色警示条纹，时钟图案缓慢旋转 |
| 装饰 | 外露管道、通风口冒白烟、隔离舱玻璃 |

### AI绘图Prompt

```markdown
【英文Prompt】
Top-down game map, gourd-shaped virus laboratory floor plan,
upper narrow section (entrance) transitioning to wide lower section,
circular layout with 13 visible nodes connected by glowing green paths,

NODE POSITIONS:
- Top center (0,2): pulsing green portal entrance
- Upper ring (row1): 3 battle nodes in small circle formation
- Lower body divided into 4 quadrants:
  * West quadrant (W zone): red-tinted area with 2 battle nodes
  * East quadrant (N zone): blue-tinted area with bookstore node
  * Southwest (I zone): purple swirling area with chance node
  * Southeast (P zone): yellow striped area with battle node
- Center (2,2): skill acquisition station with holographic display
- Bottom center (5,2): large boss arena with cracked containment tank

PATHWAYS:
- Thick black borders (4px width)
- Internal fill: biohazard green corridors with pulse animation
- Path segments alternate between dark green and neon green
- Warning hazard stripes at zone boundaries

ZONE OVERLAYS:
- W zone: semi-transparent red overlay on west side nodes
- N zone: semi-transparent blue overlay on northeast nodes
- I zone: semi-transparent purple swirl on southwest area
- P zone: semi-transparent yellow stripes on southeast area

TERRAIN:
- Floor: metallic grating with green bio-luminescent patterns
- Background: dark laboratory silhouette with equipment shadows
- Walls: white tiles with biohazard warning symbols ⚠️
- Atmosphere: red emergency lights pulsing rhythmically
- Details: exposed pipes, steam vents, containment glass cracks

STYLE:
- Isometric view, 30-degree tilt angle
- Detailed vector illustration style
- Dark atmospheric lighting with selective green/cyan glows
- Game asset quality, clean lines
- 16:9 aspect ratio
--ar 16:9 --v 6 --style raw --q 2 --s 250 --no text, labels, words

【中文描述】
俯视游戏地图，葫芦形病毒实验室平面图，
上部窄小入口过渡到宽大下部，
圆形布局13个可见节点由发光绿路径连接，

节点位置：
- 顶部中心(0,2)：脉动绿色传送门入口
- 上环(row1)：3个战斗节点小圆排列
- 下部主体分四象限：
  * 西侧W区：红色调区域2个战斗节点
  * 东侧N区：蓝色调区域书店节点
  * 西南I区：紫色旋涡区域机会节点
  * 东南P区：黄色条纹区域战斗节点
- 中心(2,2)：技能获取站全息显示
- 底部中心(5,2)：大型Boss竞技场破损隔离舱

路径：粗黑边线4px，内部填充生物危害绿走廊，
路段交替深绿/霓虹绿，区域边界有警示条纹

区域覆盖：W区红色半透明/N区蓝色/I区紫色旋涡/P区黄色条纹

地形：金属格栅绿色生物荧光纹路，黑暗实验室剪影，
白瓷砖生物危害标志⚠️，红色应急灯规律脉动

风格：等距视角30度倾斜，详细矢量插画，
暗色氛围选择性照明，16:9游戏素材
```

---

## 第2层：网络空间（双环嵌套拓扑）💻

### 造型结构
```
                    ┌─────────┐
                    │ (0,3)   │ ← START/Chance
                    │  入口   │
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │    外环（外围网络）              │
        │  (1,0)──(1,2)──(1,4)──(1,6)    │
        │    │                  │         │
        │  (2,0)            (2,6)         │
        │    │      内环      │           │
        │    │   (3,2)(3,3)(3,4)         │ ← 内环核心
        │    │      │  BOSS  │            │
        │  (4,0)  (4,3)    (4,6)          │
        │    │                  │         │
        │  (5,0)──(5,2)──(5,4)──(5,6)    │
        │                                │
        └────────────────┬────────────────┘
                         │
                    ┌────┴────┐
                    │ (6,3)   │
                    │  END    │
                    └─────────┘
         双环嵌套拓扑结构
```

### 格子坐标表

| 坐标 | 类型 | 关卡编号 | 区域 | 难度 | 说明 |
|------|------|---------|------|------|------|
| (0,3) | CHANCE | - | S区 | - | 网络入口加速格 |
| (1,0) | BATTLE | LV017 | W区 | ★★ | DDoS攻击基础 |
| (1,2) | BATTLE | LV018 | W区 | ★★ | 端口扫描防御 |
| (1,4) | BATTLE | LV019 | N区 | ★★★ | 中间人攻击 |
| (1,6) | BATTLE | LV020 | N区 | ★★★ | DNS劫持防护 |
| (2,0) | SKILL | - | W区 | - | 技能格（网络技能） |
| (2,6) | BOOKSTORE | - | N区 | - | 书店格（网络安全） |
| (3,2) | BATTLE | LV021 | S区 | ★★★ | 防火墙配置 |
| (3,3) | BATTLE | LV022 | S区 | ★★★★ | IPS入侵防御 |
| (3,4) | CHANCE | - | S区 | - | 机会格（数据包捕获） |
| (4,3) | **BOSS** | **LV032_BOSS** | S区 | ★★★★★ | 核心服务器守护者 |
| (4,0) | BATTLE | LV023 | D区 | ★★★★ | APT攻击检测 |
| (4,6) | BATTLE | LV024 | D区 | ★★★★ | 流量分析进阶 |
| (5,0) | BATTLE | LV025 | D区 | ★★★★ | 零信任架构 |
| (5,2) | BATTLE | LV026 | D区 | ★★★★ | SIEM日志分析 |
| (5,4) | BATTLE | LV027 | D区 | ★★★★★ | 威胁情报整合 |
| (5,6) | BATTLE | LV028 | D区 | ★★★★★ | 自动化响应 |
| (6,3) | END | - | 无 | - | 层间传送门 |

### 特殊区域范围

| 区域 | 坐标范围 | 效果 | 视觉 |
|------|---------|------|------|
| **S区（加速）** | row 2-4, col 2-4 | 额外投掷一次骰子 | 淡绿色闪电覆盖 |
| **W区（虚弱）** | row 1-2, col 0-1 | 投掷点数-1 | 淡红色覆盖 |
| **N区（知识）** | row 1-2, col 4-6 | 获得随机书籍 | 淡蓝色书本图标 |
| **D区（危险）** | row 4-6, col 0 & col 6 | 随机损失资源 | 深红色骷髅标记 |

### 路径连接

```
外环顺时针：(1,0)→(1,2)→(1,4)→(1,6)→(2,6)→(4,6)→(5,6)→(5,4)→(5,2)→(5,0)→(4,0)→(2,0)→(1,0)
内环连接：(3,2)↔(3,3)↔(3,4)
内外连接：(2,0)↔(3,2), (2,6)↔(3,4), (4,0)↔(3,2), (4,6)↔(3,4)
垂直主干：(0,3)→(1,2)→(3,3)→(4,3)→(6,3)
```

### 地形纹理与氛围

| 元素 | 描述 |
|------|------|
| 地板 | 深色网格配发光电路线 |
| 背景 | 数字虚空矩阵代码流 |
| 结构 | 漂浮几何平台 |
| S区 | 光纤密集的高亮区域 |
| D区 | 暗红色警报区域 |
| 装饰 | 全息数据流、扫描线、粒子效果 |

### AI绘图Prompt

```markdown
【英文Prompt】
Top-down game map, cyberspace dual-ring network topology,
outer large ring with 12 nodes, inner small ring with 3 core nodes,

OUTER RING (perimeter network):
- 12 nodes arranged in oval shape
- Connected by thick black-bordered cyan data highways
- Nodes at cardinal and intercardinal positions
- Outer ring represents perimeter defense layer

INNER RING (core network):
- 3 nodes in tight triangular formation at center
- Connected by bright cyan fiber optic links
- Represents critical infrastructure core
- Boss node at inner ring center (4,3)

RADIATING CONNECTIONS:
- 4 bridge paths connecting outer to inner ring
- Data packet particles flowing along bridges
- Glowing connection points at intersections

ZONE OVERLAYS:
- S zone (center): green lightning bolt pattern, speed boost area
- W zone (west): red dimmed area, weakness penalty
- N zone (east): blue book icon glow, knowledge reward
- D zone (bottom corners): deep red danger markers

TERRAIN:
- Floor: dark grid with glowing circuit traces
- Background: infinite digital void with falling matrix code
- Structures: floating geometric platforms at varying heights
- Effects: holographic overlays, scan line animations, particle streams

NODE TYPES VISUAL:
- Battle nodes: cyan hexagons with "N"
- Skill node: magenta diamond with sparkle
- Bookstore node: green square with book icon
- Chance node: yellow question mark circle
- Boss node: large red octagon with skull
- End node: golden portal with exit symbol

STYLE:
- Isometric view with depth perspective
- Cyberpunk neon aesthetic
- Glowing edges, particle effects, data flow animations
- Clean vector art, game asset quality
- 16:9 aspect ratio
--ar 16:9 --v 6 --style raw --q 2 --s 300 --no text, labels

【中文描述】
俯视游戏地图，网络空间双环嵌套拓扑结构，
外环12个节点椭圆形排列，内环3个核心节点紧密三角布局，

外环（外围网络）：12节点椭圆排列，粗黑边框青色数据高速公路连接
内环（核心网络）：3节点紧密三角形，明亮青色光纤链接，Boss位于中心
辐射连接：4条桥路连接内外环，数据包粒子沿桥流动

区域覆盖：S区中心绿色闪电/W区西侧红色暗淡/N区东侧蓝色书本/D区底部角落深红危险

地形：深色网格发光电路线，无限数字虚空矩阵代码流，
漂浮几何平台不同高度，全息叠加层扫描线动画粒子流

节点视觉：战斗青六边形/技能洋红菱形/书店绿方块/机会黄问号/Boss大红八角/终点金传送门

风格：等距视角深度透视，赛博朋克霓虹美学，
发光边缘粒子效果数据流动画，干净矢量艺术16:9游戏素材
```

---

## 第3层数据保险库（同心圆堡垒）🔐

### 造型结构
```
              ┌───────────┐
              │  (0,4)    │ ← START
              │  入口大门  │
              └─────┬─────┘
                    │
        ┌───────────┼───────────┐
        │   第1圈（外防御层）     │
        │ (1,2) (1,4) (1,6)    │
        │   ｜           ｜     │
        │ (2,1)         (2,7)   │
        │   ｜    第2圈   ｜     │
        │ (3,2) (3,4) (3,6)    │
        │   ｜     ｜     ｜     │
        │ (4,3)  (4,5)  BOSS   │ ← 第3圈（核心）
        │   ｜           ｜     │
        │ (5,4)      (5,6)     │
        └───────────┼───────────┘
                    │
              ┌─────┴─────┐
              │  (6,4)    │
              │   END     │
              └───────────┘
         同心圆堡垒结构（3层防御）
```

### 格子坐标表

| 坐标 | 类型 | 关卡编号 | 区域 | 难度 | 说明 |
|------|------|---------|------|------|------|
| (0,4) | CHANCE | - | 无 | - | 金库入口安检 |
| (1,2) | BATTLE | LV033 | 外圈-W | ★★ | AES加密基础 |
| (1,4) | BATTLE | LV034 | 外圈-N | ★★ | RSA算法原理 |
| (1,6) | SKILL | - | 外圈-S | - | 技能格（加密技能） |
| (2,1) | BATTLE | LV035 | 外圈-D | ★★★ | 哈希函数应用 |
| (2,7) | BOOKSTORE | - | 外圈-N | - | 书店格（密码学经典） |
| (3,2) | BATTLE | LV036 | 中圈-I | ★★★ | 数字签名验证 |
| (3,4) | BATTLE | LV037 | 中圈-P | ★★★★ | PKI体系架构 |
| (3,6) | CHANCE | - | 中圈-W | - | 机会格（密钥发现） |
| (4,3) | BATTLE | LV038 | 内圈-S | ★★★★ | 访问控制模型 |
| (4,5) | BATTLE | LV039 | 内圈-N | ★★★★ | 数据脱敏技术 |
| (5,4) | **BOSS** | **LV048_BOSS** | 核心 | ★★★★★ | 数据守护者·加密之王 |
| (5,6) | BATTLE | LV040 | 内圈-D | ★★★★★ | 隐私计算前沿 |
| (6,4) | END | - | 无 | - | 通往第4层电梯 |

### 特殊区域

| 区域 | 范围 | 效果 |
|------|------|------|
| **外圈W** | (1,2), (2,1) | 投掷-1 |
| **外圈N** | (1,4), (2,7) | 获书籍 |
| **外圈S** | (1,6) | 额外投掷 |
| **外圈D** | (2,1) | 损失资源 |
| **中圈I** | (3,2), (3,6) | 地图倒置 |
| **中圈P** | (3,4) | 跳过回合 |
| **内圈S** | (4,3) | 加速 |
| **内圈N** | (4,5) | 知识 |
| **内圈D** | (5,6) | 危险 |

### 路径连接

```
第1圈（外）：(0,4)→(1,4)→(1,2)→(2,1)→(2,1)→(2,7)→(1,6)→(1,4)
第1→2圈桥梁：(2,1)→(3,2), (2,7)→(3,6)
第2圈（中）：(3,2)→(3,4)→(3,6)
第2→3圈桥梁：(3,2)→(4,3), (3,6)→(4,5)
第3圈（内）：(4,3)→(4,5)→(5,4)→(5,6)→(4,5)
出口：(5,4)→(6,4)
```

### 地形纹理

| 元素 | 描述 |
|------|------|
| 地板 | 抛光大理石金纹，越往中心越豪华 |
| 墙壁 | 加固钢保险库门，视网膜扫描仪 |
| 背景 | 深蓝环境光，水晶数据核心微光 |
| 外圈 | 工业金属质感 |
| 中圈 | 大理石+金色装饰 |
| 内圈 | 纯白+水晶+能量护盾 |
| 装饰 | 皇家徽章、激光束、监控屏 |

### AI绘图Prompt

```markdown
【英文Prompt】
Top-down game map, concentric circular data vault fortress,
3 defensive rings expanding from center boss,

RING 1 (Outer Defense - industrial):
- 6 nodes in wide outer circle
- Metallic steel floor texture
- Heavy vault doors between sections
- Red/gold security laser beams crossing paths
- Nodes: 2 battles, 1 skill, 1 bookstore, 1 chance, 1 entry

RING 2 (Middle Security - elegant):
- 4 nodes in medium circle
- Polished marble floor with gold vein inlays
- Encryption station aesthetics
- Crystal data displays on walls
- Nodes: 2 battles, 1 chance, connecting bridges

RING 3 (Inner Core - pristine):
- 3 nodes + boss in tight central cluster
- Pure white floor with energy shield glow
- Floating crystal data cores
- Ultimate security atmosphere
- Boss node: massive ornate throne with data crystal

PATHWAYS:
- Thick black borders (4px)
- Ring 1: golden carpet with red rope barriers
- Ring 2: marble tiles with gold crest patterns
- Ring 3: luminous white pathways
- Bridge connections: shimmering light beams between rings

TERRAIN GRADIENT:
- Outer ring: dark metallic gray, industrial pipes
- Middle ring: warm gold and cream marble
- Inner ring: brilliant white with cyan energy aura
- Center: radiant crystalline glow

ZONE MARKERS:
- W zones: subtle red tint on western nodes
- N zones: soft blue glow on eastern nodes
- I zones: purple swirl on specific nodes
- Other zones: respective color coding

DETAILS:
- Retinal scanners at zone transitions
- Holographic keycard displays
- Vault mechanism gears visible
- Security camera sweeps (animated suggestion)
- Chandelier lighting from above

STYLE:
- Isometric view, elegant majestic perspective
- Luxury art deco meets cyberpunk security
- Metallic reflections, crystal refractions
- Grand imposing atmosphere
- 16:9, game asset, no text
--ar 16:9 --v 6 --style raw --q 2 --s 400 --no text, labels

【中文描述】
俯视游戏地图，同心圆数据保险库堡垒，
3道防御圈从中心Boss向外扩展，

第1圈（外防-工业）：6节点宽外圆，金属钢质地板，
重型保险库门分隔，红金安全激光束交叉
第2圈（中安-优雅）：4节点中圆，抛光大理石金纹地板，
加密站美学，墙壁水晶数据显示
第3圈（内核-纯净）：3节点+Boss紧密中心簇，
纯白地板能量护盾光芒，漂浮水晶数据核心

路径：粗黑边线4px，外圈金地毯红绳围栏，
中圈大理石瓷砖金徽章图案，内圈发光白色路径，环间桥梁闪光光束

地形梯度：外圈深灰金属工业/中圈温暖金黄大理石/
内圈纯白青色能量光晕/中心辐射晶体光辉

细节：区域转换处视网膜扫描仪，全息钥匙卡显示，
保险库机制齿轮可见，安全摄像头扫视，顶部吊灯照明

风格：等距视角优雅庄严透视，奢华装饰艺术遇赛博朋克安全，
金属反射水晶折射宏伟威严氛围16:9游戏素材
```

---

## 文档信息

> **版本**: v1.0  
> **包含**: 第1-3层完整分地图Prompt  
> **每层包含**: ASCII示意图 + 坐标表 + 功能格详情 + 特殊区域 + 路径关系 + 地形纹理 + AI Prompt（双语）
