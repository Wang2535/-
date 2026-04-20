# 第7-9层分地图 + 总地图9层立体塔 Prompt

---

## 第7层：云端平台（不规则云朵形状）☁️

### 造型结构
```
        ☁️ (0,5) START
         ╲
          ╲  ╭───╮
    (1,3)───╲ │ C1 │ (1,7)
      ╲       ╰───╯      ╱
       ╲    ╭───╮    ╱
        ╲   │ C2 │╲  ╱
    (2,1)──╲╰───╯╲╱ (2,8)
         ╲  ╱╲  ╱
          ╲╱  ╲╱
    ┌────(3,3)───(3,6)────┐
    │  ╲   ╱╲   ╱          │
    │(4,2)╲╱  ╲╱(4,7)     │ 云朵主体
    │   ╲(5,4)BOSS(5,5)   │
    │    ╲  ╱╲  ╱          │
    │ (6,3)╲╱  ╲╱(6,6)    │
    │      ╲   ╱           │
    │    (7,5) END         │
    └──────────────────────┘
       不规则云朵漂浮形态
```

### 格子坐标表（14格）

| 坐标 | 类型 | 关卡 | 区域 | 难度 |
|------|------|------|------|------|
| (0,5) | CHANCE | - | S区 | - |
| (1,3) | BATTLE | LV097 | W区 | ★★★★ |
| (1,7) | BATTLE | LV098 | N区 | ★★★★ |
| (2,1) | BATTLE | LV099 | D区 | ★★★★ |
| (2,8) | BATTLE | LV100 | P区 | ★★★★ |
| (3,3) | SKILL | - | I区 | - |
| (3,6) | BOOKSTORE | - | N区 | - |
| (4,2) | BATTLE | LV101 | W区 | ★★★★★ |
| (4,7) | BATTLE | LV102 | S区 | ★★★★★ |
| (5,4) | CHANCE | - | I区 | - |
| (5,5) | **BOSS** | **LV112_BOSS** | 核心 | ★★★★★★ |
| (6,3) | BATTLE | LV103 | D区 | ★★★★★ |
| (6,6) | BATTLE | LV104 | P区 | ★★★★★ |
| (7,5) | END | - | 无 | - |

### 特殊区域
- **S区**: (0,5)+(4,7) 加速区
- **W区**: (1,3)+(4,2) 虚弱区
- **N区**: (1,7)+(3,6) 知识区
- **D区**: (2,1)+(6,3) 危险区
- **I区**: (3,3)+(5,4) 反转区
- **P区**: (2,8)+(6,6) 跳过区

### 路径特点
- 不规则曲线连接（云朵边缘）
- 光桥跨越远距离节点
- 部分路径为单向（云朵飘动方向）

### 地形纹理
- 地板：蓬松白云银边
- 背景：蓝天远处云朵
- 结构：漂浮平台玻璃栏杆
- 效果：阳光射线、云朵飘动、彩虹弧

### AI Prompt摘要
```
Top-down game map, sky cloud computing platform,
irregular cloud-shaped floating layout with 14 nodes,
cloud-shaped platforms connected by transparent light bridges,
rainbow arcs between zones, fluffy white clouds silver-edged floors,
blue sky background with distant clouds below,
floating server pods with glass railings,
sunlight rays, cloud drift animation suggestion,
isometric airy floating perspective, dreamy cloud aesthetic,
bright optimistic atmosphere, 16:9, no text
--ar 16:9 --v 6 --style raw --q 2 --s 300
```

---

## 第8层：未来实验室（量子概率云）🔮

### 造型结构
```
        ? (0,4) START (概率不确定)
       ╱╲
      ╱  ╲
    (1,2) (1,6)  ← 概率分布点
    ╱  ╲ ╱  ╲
   ╲(2,1)(2,3)(2,5)(2,7)╱  ← 量子态叠加
    ╲  ╲╱  ╱╱
     ╲(3,2)  (3,6)╱
      ╲  ╲╱  ╱
    ┌──(4,1)(4,4)(4,7)──┐
    │  ╲   ╱╲   ╱       │
    │(5,2)╲╱(5,5)BOSS  │ ← 奇点
    │   ╲  ╱  ╲  ╱      │
    │  (6,3)  (6,6)     │
    │      ╲   ╱        │
    │     (7,5) END     │
    └───────────────────┘
      量子概率云散布形态
```

### 格子坐标表（15格）

| 坐标 | 类型 | 关卡 | 区域 | 难度 |
|------|------|------|------|------|
| (0,4) | CHANCE | - | I区 | - |
| (1,2) | BATTLE | LV113 | S区 | ★★★★★ |
| (1,6) | BATTLE | LV114 | N区 | ★★★★★ |
| (2,1) | BATTLE | LV115 | D区 | ★★★★★ |
| (2,3) | BATTLE | LV116 | W区 | ★★★★★ |
| (2,5) | BATTLE | LV117 | P区 | ★★★★★ |
| (2,7) | SKILL | - | S区 | - |
| (3,2) | BATTLE | LV118 | I区 | ★★★★★ |
| (3,6) | BOOKSTORE | - | N区 | - |
| (4,1) | BATTLE | LV119 | D区 | ★★★★★ |
| (4,4) | CHANCE | - | W区 | - |
| (4,7) | BATTLE | LV120 | P区 | ★★★★★ |
| (5,2) | BATTLE | LV121 | I区 | ★★★★★ |
| (5,5) | **BOSS** | **LV127_BOSS** | 核心 | ★★★★★★ |
| (6,3) | BATTLE | LV122 | D区 | ★★★★★ |
| (6,6) | BATTLE | LV123 | S区 | ★★★★★ |
| (7,5) | END | - | 无 | - |

### 特殊区域
- 所有6种区域均匀散布（量子不确定性主题）
- 区域边界模糊（概率波函数衰减）
- I区位于中心和入口（多次触发可能）

### 路径特点
- 概率连线（虚线表示低概率路径）
- 量子隧穿捷径（跨区域跳跃）
- 节点位置有微小随机偏移暗示

### 地形纹理
- 地板：光滑白色表面发光电路
- 背景：无限空间星云
- 结构：漂浮几何形状
- 效果：全息图、时间扭曲、能量场、概率云粒子

### AI Prompt摘要
```
Top-down game map, futuristic quantum research lab,
scattered probability cloud distribution with 15 nodes,
nodes positioned with slight random offset suggesting uncertainty,
quantum tunneling shortcut paths crossing zones,
glowing probability wave functions around each node,
holographic displays, time distortion visual effects,
energy field glows, particle systems,
sleek white surface with glowing circuits background infinite space nebula,
floating geometric structures,
isometric sci-fi perspective, cutting-edge technology aesthetic,
mysterious advanced atmosphere, 16:9, no text
--ar 16:9 --v 6 --style raw --q 2 --s 400
```

---

## 第9层：指挥中心（对称王座殿堂）👑

### 造型结构
```
        ┌─────────────┐
        │   (0,5)     │ ← START/CHANCE
        │   正门入口   │
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    │  (1,2)   │   (1,8)  │ ← 两侧卫兵室
    │  战斗    │   战斗    │
    └────┬─────┴─────┬────┘
         │    中殿    │
    ┌────┼────┬────┼────┐
    │(2,1)│(2,4)│(2,7)│  ← 战略室
    │战斗 │书店 │战斗 │
    └──┬──┴────┴──┬──┘
       │   内殿    │
    ┌──┼────┬────┼──┐
    │(3,2)│(3,5)│(3,8)│ ← 荣誉厅
    │Skill│机会 │战斗│
    └──┬──┴────┴──┬──┘
       │   王座    │
    ┌──┴──────────┴──┐
    │     (4,5)      │ ← BOSS王座
    │   最终挑战     │
    └────────┬───────┘
             │
        ┌────┴────┐
        │  (5,5)  │ ← END/通关传送门
        │  凯旋门  │
        └─────────┘
       对称王座殿堂结构
```

### 格子坐标表（13格，严格对称）

| 坐标 | 类型 | 关卡 | 区域 | 难度 | 对称位 |
|------|------|------|------|------|--------|
| (0,5) | CHANCE | - | S区 | - | 中轴 |
| (1,2) | BATTLE | LV128 | W区 | ★★★★★ | 左 |
| (1,8) | BATTLE | LV129 | W区 | ★★★★★ | 右 |
| (2,1) | BATTLE | LV130 | N区 | ★★★★★ | 左 |
| (2,4) | BOOKSTORE | - | N区 | - | 左中 |
| (2,7) | BATTLE | LV131 | N区 | ★★★★★ | 右 |
| (3,2) | SKILL | - | I区 | - | 左 |
| (3,5) | CHANCE | - | I区 | - | 中轴 |
| (3,8) | BATTLE | LV132 | I区 | ★★★★★ | 右 |
| (4,5) | **BOSS** | **LV142_BOSS** | 核心 | ★★★★★★ | 中轴王座 |
| (5,5) | END | - | 无 | - | 中轴出口 |

### 特殊区域（对称设计）
- **S区**: 中轴线(0,5)+(4,5) 加速通道
- **W区**: 两侧卫兵室(1,2)+(1,8) 虚弱试炼
- **N区**: 战略室区域(2,1)-(2,7) 知识殿堂
- **I区**: 荣誉厅区域(3,2)-(3,8) 反转考验
- **D区**: 无（指挥中心无危险区，替代为荣誉挑战）

### 路径特点
- 严格中轴对称
- 两侧路径镜像
- 必须通过中轴才能到达Boss
- 策略：选择左右路线影响遇到的特殊区域

### 地形纹理
- 地板：抛光黑色大理石金纹
- 墙壁：深色木板旗帜横幅
- 背景：宏伟大厅吊灯
- 装饰：皇家徽章、勋章、监视屏、红地毯

### AI Prompt摘要
```
Top-down game map, supreme command center throne hall,
strictly symmetrical regal layout with 13 nodes,

CENTRAL AXIS DESIGN:
- Perfect mirror symmetry left/right of center column
- Main entrance at top center leading to throne
- Throne room at bottom center (boss position)
- Side chambers mirroring each other exactly

LAYERED ROOM STRUCTURE:
- Layer 1: Entrance gate (chance node)
- Layer 2: Guard chambers (2 mirrored battles) - W zone tests
- Layer 3: Strategy rooms (battle + bookstore + battle) - N zone knowledge
- Layer 4: Honor hall (skill + chance + battle) - I zone trials
- Layer 5: Throne chamber (boss arena) - ultimate challenge
- Exit: Victory archway

VISUAL ELEMENTS:
- Polished black marble floor with gold veins
- Dark wood panel walls with national flags
- Red carpet running down central axis
- Golden chandeliers hanging from ceiling
- Royal seals and medals on walls
- Security monitoring screens flanking throne
- Crystal spire crown above throne

ZONE SYMMETRY:
- S zone: central axis (acceleration corridor)
- W zone: both guard chambers (weakness trials)
- N zone: strategy room area (knowledge halls)
- I zone: honor hall area (inversion trials)

STYLE:
- Isometric majestic authoritative perspective
- Royal imperial aesthetic with cybersecurity elements
- Grand imposing ceremonial atmosphere
- Gold, red, and deep blue color scheme
- 16:9, game asset, no text
--ar 16:9 --v 6 --style raw --q 2 --s 500
```

---

## 总地图：9层立体塔 🗼

### 完整AI绘图Prompt（增强版）

```markdown
【英文Prompt - Complete】
A majestic 9-tier cybersecurity tower rising to the sky,
isometric view from a slight low angle looking upward,

TIER 1 (Base - Virus Laboratory / Green):
Thick industrial foundation with biohazard symbols,
circular containment chambers visible through green-tinted windows,
red emergency warning lights pulsing rhythmically,
exposed pipes and ventilation vents emitting steam,
heavy blast door entrance at front center,
metal grating floors with green mold patches,

TIER 2 (Cyberspace Network / Cyan):
Flowing data streams connecting to tier 1,
server rack silhouettes behind cyan glass walls,
fiber optic cables glowing neon blue,
digital grid patterns etched into exterior,
holographic data packet particles floating outward,
network hub architecture with radiating connections,

TIER 3 (Data Vault / Blue):
Concentric fortress ring structure,
massive vault doors with retinal scanners,
floating crystal data cores visible through blue windows,
golden encryption lock patterns on walls,
marble textures with metallic reinforcements,
deep blue ambient security lighting,

TIER 4 (Urban District / Orange):
City block silhouette layer,
office buildings with warm sunset-lit windows,
cafe awnings and street-level details,
tree canopies and park greenery visible,
asphalt road textures wrapping around,
cozy metropolitan atmosphere with long shadows,

TIER 5 (Smart Factory / Yellow):
Industrial manufacturing level,
conveyor belts and robotic arm mechanisms visible,
yellow safety stripe accents on exterior,
machinery silhouettes through large windows,
steam vent stacks and warning lights,
technical blueprint aesthetic with functional details,

TIER 6 (Mobile Terminal / Purple):
Modern smartphone testing facility,
device docking stations embedded in walls,
purple accent lighting and circuit patterns,
charging cable decorations on surface,
app icon holograms floating around perimeter,
clean minimalist tech aesthetic,

TIER 7 (Cloud Platform / Sky Blue):
Floating cloud-supported structure,
server pods suspended in open air,
transparent glass bridge connections between sections,
white cloud formations at base of this tier,
rainbow light refraction effects,
airy buoyant appearance defying gravity,

TIER 8 (Future Lab / Pink):
Cutting-edge research facility,
quantum probability cloud effects surrounding it,
holographic display panels on all faces,
AI neural network visualization patterns,
time distortion visual warping effects,
advanced geometric crystalline design,

TIER 9 (Peak - Command Center / Gold):
Crowning royal throne room level,
golden dome roof with crystal spire apex,
red carpet cascading down from entrance,
regional banners and honorific insignias,
command throne visible through grand windows,
ultimate authority glowing golden aura,

STRUCTURAL ELEMENTS:
- Tower tapers elegantly from wide base to narrow peak
- Each tier slightly smaller than the one below
- Glowing energy bridges connecting adjacent tiers
- Spiral light ribbon winding around entire tower
- Defensive stone wall base with arched gateway
- Crystal spire at absolute top emitting radiant light

BACKGROUND:
Deep starry night sky with aurora borealis,
distant galaxy hints and cosmic dust,
ethereal energy particles drifting upward,
sense of ascending toward cosmic knowledge

STYLE:
Isometric projection with dramatic upward angle,
clean detailed vector illustration style,
each tier's unique color clearly distinguishable,
selective lighting highlighting architectural features,
epic scale conveying journey of ascent,
game asset quality suitable for UI integration,
16:9 widescreen cinematic composition,
ultra-high detail, no text or labels
--ar 16:9 --v 6 --style raw --q 2 --s 500 --no text, labels, words, watermark

【中文描述 - 完整版】
一座宏伟的9层网络安全通天塔，从基座直插云霄，
等距视角微仰角向上眺望，

第1层（底部-病毒实验室-绿色）：厚重工业地基生物危害标志，
圆形隔离舱透出绿色窗户，红色应急灯规律脉动，
外露管道通风口喷蒸汽，正面中心重型防爆门入口，
金属格栅地板绿色霉斑

第2层（网络空间-青色）：流动数据流连接下层，
服务器机架剪影青色玻璃后，光纤电缆霓虹青光，
外墙蚀刻数字网格图案，全息数据包粒子向外飘浮，
网络枢纽架构辐射状连接

第3层（数据保险库-蓝色）：同心圆堡垒环形结构，
巨大保险库门视网膜扫描仪，漂浮水晶数据核心蓝窗可见，
墙面金色加密锁图案，大理石纹理金属加固，
深蓝色环境安全照明

第4层（城市街区-橙色）：城市街区剪影层，
办公楼温暖日落窗户，咖啡馆遮阳篷街道细节，
树冠和公园绿植可见，沥青道路纹理环绕，
舒适大都会氛围长阴影

第5层（智能工厂-黄色）：工业制造层级，
传送带机械臂机制可见，黄色安全条纹外墙装饰，
机械剪影透过大窗，蒸汽通风堆栈警示灯，
技术蓝图美学功能细节

第6层（移动终端-紫色）：现代智能手机测试设施，
设备嵌入墙壁对接站，紫色强调光照电路图案，
充电线缆装饰表面，APP图标全息图环绕漂浮，
干净极简科技美学

第7层（云端平台-天蓝色）：云朵支撑的悬浮结构，
服务器舱悬空开放，透明玻璃桥连接区间，
该层底部白云形成，彩虹光线折射效果，
轻盈飘逸外观反重力

第8层（未来实验室-粉色）：前沿研究设施，
量子概率云效果环绕，全息显示面板四面，
AI神经网络可视化图案，时间扭曲视觉变形效果，
先进几何晶体设计

第9层（顶层-指挥中心-金色）：皇冠皇家王座厅层，
金色穹顶屋顶水晶尖顶巅峰，红地毯从入口倾泻而下，
区域横幅荣誉徽章，指挥王座透过宏伟窗户可见，
终极权威金色光晕

结构元素：塔身优雅锥形宽底窄尖，每层比下层略小，
发光能量桥连接相邻层级，螺旋光带缠绕整塔，
防御石墙基座拱门入口，绝对顶端水晶尖塔发射辐射光

背景：深邃星空夜空极光，遥远星系暗示宇宙尘埃，
空灵能量粒子向上飘动，通往宇宙知识的上升感

风格：等距投影戏剧性仰角，干净详细矢量插画风格，
每层独特颜色清晰可辨，选择性照明突出建筑特征，
史诗尺度传达攀登之旅，游戏素材质量适合UI集成，
16:9宽屏电影构图，超高细节无文字标签
```

---

> **版本**: v1.0  
> **包含**: 第7-9层 + 总地图完整Prompt  
> **总文档数**: 05~08 共4个文件覆盖全部9层+总地图
