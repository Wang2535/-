/**
 * 《道高一丈：数字博弈》美工设计规范类型定义
 * 文档版本: v18.0.0
 * 最后更新: 2026-02-01
 * 
 * 本文件严格依据"完善的美工.md"定义
 * 严禁修改文档内容，所有实现必须与源文档保持一致
 */

// ============================================
// A1.0 设计概述与视觉风格
// ============================================

/**
 * A1.1.1 核心视觉主题
 */
export const VISUAL_THEME = {
  primary: "赛博朋克 × 网络安全 × 东方美学",
  description: "融合未来科技感与传统东方元素，营造数字世界的博弈氛围"
} as const;

/**
 * A1.1.2 视觉关键词
 */
export interface VisualKeywords {
  /** 科技感 */
  tech: {
    keywords: ["电路纹理", "数据流", "全息投影"];
    applications: ["卡牌边框", "UI元素"];
  };
  /** 博弈感 */
  game: {
    keywords: ["对称构图", "对比色彩", "动态线条"];
    applications: ["角色立绘", "战斗场景"];
  };
  /** 神秘感 */
  mystery: {
    keywords: ["暗色调", "霓虹光效", "几何图形"];
    applications: ["背景设计", "特效表现"];
  };
  /** 东方韵 */
  oriental: {
    keywords: ["水墨元素", "书法字体", "传统纹样"];
    applications: ["角色服饰", "装饰元素"];
  };
}

/**
 * A1.2.1 整体风格参考
 */
export const STYLE_REFERENCES = {
  cyberpunk: ["赛博朋克2077", "攻壳机动队"],
  cardGames: ["炉石传说", "杀戮尖塔"],
  oriental: ["影之刃", "阴阳师"],
  techUI: ["看门狗", "Deus Ex"]
} as const;

/**
 * A1.2.2 风格统一原则
 */
export const STYLE_UNITY_PRINCIPLES = {
  colorUnity: "严格使用定义的色彩系统，禁止随意添加新颜色",
  lineUnity: "主要使用2px描边，圆角统一为4px或8px",
  textureUnity: "使用玻璃态（Glassmorphism）和霓虹光效为主",
  hierarchyUnity: "遵循\"背景→中景→前景→UI\"的四层结构"
} as const;

// ============================================
// A2.0 色彩系统规范
// ============================================

/**
 * A2.1.1 阵营色彩
 */
export const FACTION_COLORS = {
  attacker: {
    name: "赛博红 (Cyber Red)",
    hex: "#FF2A6D",
    rgb: "255,42,109",
    usage: "进攻方卡牌、角色、UI"
  },
  defender: {
    name: "科技蓝 (Tech Blue)",
    hex: "#05D9E8",
    rgb: "5,217,232",
    usage: "防御方卡牌、角色、UI"
  },
  neutral: {
    name: "数据紫 (Data Purple)",
    hex: "#A855F7",
    rgb: "168,85,247",
    usage: "通用卡牌、系统元素"
  }
} as const;

/**
 * A2.1.2 背景色彩
 */
export const BACKGROUND_COLORS = {
  deepSpaceBlack: {
    name: "深空黑",
    hex: "#0A0A0F",
    rgb: "10,10,15",
    opacity: "100%",
    usage: "主背景色"
  },
  darknetGray: {
    name: "暗网灰",
    hex: "#1A1A2E",
    rgb: "26,26,46",
    opacity: "100%",
    usage: "次级背景、面板"
  },
  matrixGreen: {
    name: "矩阵绿",
    hex: "#0D2818",
    rgb: "13,40,24",
    opacity: "100%",
    usage: "特殊区域背景"
  },
  frostedBlack: {
    name: "磨砂黑",
    hex: "#0F0F1A",
    rgb: "15,15,26",
    opacity: "85%",
    usage: "玻璃态面板"
  }
} as const;

/**
 * A2.1.3 功能色彩
 */
export const FUNCTION_COLORS = {
  success: {
    name: "霓虹绿",
    hex: "#39FF14",
    rgb: "57,255,20",
    usage: "成功判定、增益效果"
  },
  warning: {
    name: "警示黄",
    hex: "#FFD700",
    rgb: "255,215,0",
    usage: "警告提示、危险效果"
  },
  failure: {
    name: "危险红",
    hex: "#FF4444",
    rgb: "255,68,68",
    usage: "失败判定、减益效果"
  },
  info: {
    name: "信息蓝",
    hex: "#00BFFF",
    rgb: "0,191,255",
    usage: "信息提示、说明文字"
  }
} as const;

/**
 * A2.1.4 稀有度色彩
 */
export const RARITY_COLORS = {
  common: {
    name: "标准白",
    hex: "#E0E0E0",
    rgb: "224,224,224",
    glowIntensity: "无"
  },
  rare: {
    name: "稀有蓝",
    hex: "#4FC3F7",
    rgb: "79,195,247",
    glowIntensity: "低"
  },
  epic: {
    name: "史诗紫",
    hex: "#BA68C8",
    rgb: "186,104,200",
    glowIntensity: "中"
  },
  legendary: {
    name: "传说金",
    hex: "#FFD700",
    rgb: "255,215,0",
    glowIntensity: "高"
  }
} as const;

/**
 * A2.2.1 渐变规范
 */
export const GRADIENTS = {
  attacker: "linear-gradient(135deg, #FF2A6D 0%, #FF6B6B 100%)",
  defender: "linear-gradient(135deg, #05D9E8 0%, #4FC3F7 100%)",
  neutral: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
  background: "linear-gradient(180deg, #0A0A0F 0%, #1A1A2E 100%)"
} as const;

/**
 * A2.2.2 霓虹光效
 */
export const NEON_EFFECTS = {
  red: "box-shadow: 0 0 10px #FF2A6D, 0 0 20px #FF2A6D, 0 0 30px #FF2A6D",
  blue: "box-shadow: 0 0 10px #05D9E8, 0 0 20px #05D9E8, 0 0 30px #05D9E8",
  gold: "box-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 40px #FFD700"
} as const;

/**
 * A2.2.3 透明度规范
 */
export const OPACITY_RULES = {
  mainBackground: { opacity: "100%", description: "完全不透明" },
  secondaryPanel: { opacity: "85-90%", description: "轻微透明" },
  hoverTooltip: { opacity: "70-80%", description: "半透明" },
  disabledState: { opacity: "40-50%", description: "明显透明" },
  overlay: { opacity: "60-70%", description: "半透明黑色" }
} as const;

// ============================================
// A3.0 字体与排版规范
// ============================================

/**
 * A3.1.1 中文字体
 */
export const CHINESE_FONTS = {
  title: {
    font: "思源黑体 Heavy",
    weight: 900,
    fallback: "微软雅黑 Bold"
  },
  body: {
    font: "思源黑体 Regular",
    weight: 400,
    fallback: "微软雅黑 Regular"
  },
  decorative: {
    font: "站酷高端黑",
    weight: 400,
    fallback: "方正兰亭黑"
  },
  numbers: {
    font: "DIN Alternate Bold",
    weight: 700,
    fallback: "Roboto Bold"
  }
} as const;

/**
 * A3.1.2 英文字体
 */
export const ENGLISH_FONTS = {
  title: {
    font: "Orbitron Bold",
    weight: 700,
    fallback: "Eurostile Bold"
  },
  body: {
    font: "Exo 2 Regular",
    weight: 400,
    fallback: "Roboto Regular"
  },
  numbers: {
    font: "DIN Alternate Bold",
    weight: 700,
    fallback: "Roboto Mono"
  },
  code: {
    font: "JetBrains Mono",
    weight: 400,
    fallback: "Consolas"
  }
} as const;

/**
 * A3.2.1 卡牌文字
 */
export const CARD_TYPOGRAPHY = {
  cardName: { fontSize: "18pt", weight: "Bold", lineHeight: 1.2, color: "#FFFFFF" },
  effectDescription: { fontSize: "11pt", weight: "Regular", lineHeight: 1.4, color: "#E0E0E0" },
  costValue: { fontSize: "14pt", weight: "Bold", lineHeight: 1.0, color: "对应资源色" },
  idLevel: { fontSize: "9pt", weight: "Regular", lineHeight: 1.0, color: "#A0A0A0" },
  typeTag: { fontSize: "10pt", weight: "Medium", lineHeight: 1.0, color: "#FFFFFF" }
} as const;

/**
 * A3.2.2 UI文字
 */
export const UI_TYPOGRAPHY = {
  pageTitle: { fontSize: "32pt", weight: "Bold", lineHeight: 1.2, color: "#FFFFFF" },
  sectionTitle: { fontSize: "24pt", weight: "Bold", lineHeight: 1.2, color: "#FFFFFF" },
  buttonText: { fontSize: "16pt", weight: "Bold", lineHeight: 1.0, color: "#FFFFFF" },
  bodyText: { fontSize: "14pt", weight: "Regular", lineHeight: 1.5, color: "#E0E0E0" },
  helperText: { fontSize: "12pt", weight: "Regular", lineHeight: 1.4, color: "#A0A0A0" },
  labelText: { fontSize: "10pt", weight: "Medium", lineHeight: 1.0, color: "#808080" }
} as const;

/**
 * A3.3.1 文字效果
 */
export const TEXT_EFFECTS = {
  titleGlow: "text-shadow: 0 0 10px rgba(255,255,255,0.5)",
  neon: "text-shadow: 0 0 5px currentColor, 0 0 10px currentColor",
  outline: "-webkit-text-stroke: 1px #000000; text-shadow: 2px 2px 4px rgba(0,0,0,0.5)"
} as const;

/**
 * A3.3.2 对齐规范
 */
export const ALIGNMENT_RULES = {
  cardName: "居中对齐",
  effectDescription: "左对齐，两端对齐",
  valueInfo: "右对齐",
  uiTitle: "左对齐",
  buttonText: "居中对齐"
} as const;

// ============================================
// A4.0 卡牌设计规范
// ============================================

/**
 * A4.1.1 标准卡牌尺寸
 */
export const CARD_DIMENSIONS = {
  width: { mm: 63, px: 240 },
  height: { mm: 88, px: 336 },
  borderRadius: { mm: 3, px: 12 },
  bleed: { mm: 3 },
  safeZone: { mm: 5 }
} as const;

/**
 * A4.1.2 卡牌布局网格
 */
export interface CardLayoutGrid {
  topMargin: { px: 8 };
  header: {
    factionIcon: { size: "24px" };
    cardNumber: { position: "右上角" };
  };
  illustration: {
    width: "180px";
    height: "140px";
    position: "中部";
  };
  typeRarity: {
    typeTag: { position: "左侧" };
    rarityIcon: { position: "右侧" };
  };
  nameSection: {
    cardName: { fontSize: "18px Bold" };
    effectDescription: { fontSize: "12px" };
  };
  costTrigger: {
    cost: { position: "左侧" };
    trigger: { position: "右侧" };
  };
  bottomSection: {
    techTreeIcon: { position: "左侧" };
    ownershipIcon: { position: "右侧" };
  };
  bottomMargin: { px: 8 };
}

/**
 * A4.2.1 卡牌边框设计
 */
export const CARD_BORDER_DESIGN = {
  common: {
    borderWidth: "2px",
    borderColor: "对应阵营主色",
    innerShadow: "inset 0 0 20px rgba(0,0,0,0.3)"
  },
  rare: {
    borderWidth: "3px",
    borderColor: "#4FC3F7",
    outerGlow: "0 0 15px rgba(79,195,247,0.5)"
  },
  epic: {
    borderWidth: "3px",
    borderColor: "#BA68C8",
    outerGlow: "0 0 20px rgba(186,104,200,0.6)",
    animation: "缓慢脉动动画"
  },
  legendary: {
    borderWidth: "4px",
    borderColor: "#FFD700",
    outerGlow: "0 0 30px rgba(255,215,0,0.8)",
    animation: "快速脉动 + 粒子效果"
  }
} as const;

/**
 * A4.2.2 阵营标识设计
 */
export const FACTION_ICONS = {
  attacker: {
    icons: ["红色电路图案", "红色盾牌裂纹"],
    position: "左上角",
    size: "24px × 24px",
    color: "#FF2A6D"
  },
  defender: {
    icons: ["蓝色盾牌", "蓝色防火墙图案"],
    position: "左上角",
    size: "24px × 24px",
    color: "#05D9E8"
  },
  neutral: {
    icons: ["紫色数据流", "紫色齿轮"],
    position: "左上角",
    size: "24px × 24px",
    color: "#A855F7"
  }
} as const;

/**
 * A4.2.3 插画区域规范
 */
export const ILLUSTRATION_SPEC = {
  dimensions: { width: "180px", height: "140px" },
  style: {
    theme: "赛博朋克风格概念艺术",
    tone: "暗色调为主，霓虹光效点缀",
    content: "与卡牌效果相关的场景或物品"
  },
  mask: {
    top: "渐变遮罩（透明→黑色20%）",
    bottom: "渐变遮罩（黑色40%→透明）",
    borderRadius: "与卡牌一致（12px）"
  }
} as const;

/**
 * A4.3.1 角色卡设计
 */
export const CHARACTER_CARD_SPEC = {
  dimensions: { mm: 70, px: 266, height: { mm: 120, px: 456 } },
  layout: {
    illustration: { height: "280px", content: "角色立绘 - 全身" },
    nameSection: { content: "角色名称 难度星级" },
    statsPanel: { content: "渗透/算力/资金/信息/权限" },
    skillsSection: { content: "技能一/二/三" }
  }
} as const;

/**
 * A4.3.2 光环卡特殊标识
 */
export const AURA_CARD_SPEC = {
  border: "双边框设计（外框3px，内框1px，间距2px）",
  cornerIcon: "右上角光环图标（发光效果）",
  background: "轻微动态纹理（缓慢流动）"
} as const;

// ============================================
// A5.0 角色形象设计规范
// ============================================

/**
 * A5.1.1 角色分类视觉特征
 */
export const CHARACTER_VISUAL_CATEGORIES = {
  rps: {
    type: "猜拳系",
    characteristics: "狡黠、神秘、多变",
    colorTendency: "红紫渐变",
    clothingElements: ["披风", "面具", "手套"]
  },
  chance: {
    type: "骰子系",
    characteristics: "优雅、幸运、概率",
    colorTendency: "蓝金渐变",
    clothingElements: ["礼服", "饰品", "骰子"]
  },
  special: {
    type: "专属系",
    characteristics: "专业、科技、战术",
    colorTendency: "银白渐变",
    clothingElements: ["制服", "装备", "终端"]
  }
} as const;

/**
 * A5.2.1 AR01 博弈大师·赛博赌徒
 */
export const AR01_VISUAL_SPEC = {
  overall: "中年男性，精明干练，略带痞气",
  hairstyle: "slicked-back 油头，两侧剃短，顶部向后梳",
  facialFeatures: "锐利眼神，嘴角上扬，左脸有电子纹身（电路图案）",
  clothing: "黑色高领紧身衣，外罩红色皮质马甲，金色链条装饰",
  accessories: "左手电子手套（显示数据），右手持虚拟骰子",
  background: "赌场场景，数据流，筹码飞舞",
  colorScheme: { primary: "#8B0000", secondary: "#FFD700" },
  pose: "侧身站立，一手插兜，一手抛掷虚拟骰子",
  expression: "自信微笑，眼神锐利"
} as const;

/**
 * A5.2.2 AR02 心理分析师·读心者
 */
export const AR02_VISUAL_SPEC = {
  overall: "成熟女性，知性优雅，神秘气质",
  hairstyle: "黑色长发，一侧编发，佩戴发光发饰",
  facialFeatures: "冷静眼神，佩戴单边眼镜（显示数据）",
  clothing: "白色实验服风格外套，内穿黑色紧身衣，紫色装饰",
  accessories: "颈部神经接口，手腕数据终端，悬浮全息屏",
  background: "心理学图表，脑电波图案，数据分析界面",
  colorScheme: { primary: "#4B0082", secondary: "#FFFFFF" },
  pose: "正面站立，一手托腮，一手操作全息界面",
  expression: "若有所思，嘴角微扬"
} as const;

/**
 * A5.2.3 AR03 欺诈专家·千面客
 */
export const AR03_VISUAL_SPEC = {
  overall: "年轻男性/女性（性别模糊），神秘莫测",
  hairstyle: "变色发型（渐变色），可随角度变化",
  facialFeatures: "佩戴半脸面具（可变换图案），仅露双眼",
  clothing: "可变装外套（显示不同图案），紧身战斗服",
  accessories: "多个身份牌，全息投影仪，伪装装置",
  background: "多个虚影分身，身份卡片，镜像效果",
  colorScheme: { primary: "幻彩渐变", secondary: "#000000" },
  pose: "动态姿势，身体略微虚化，多个残影",
  expression: "面具遮挡，眼神戏谑"
} as const;

/**
 * A5.2.4 AC01 命运编织者·概率使
 */
export const AC01_VISUAL_SPEC = {
  overall: "青年女性，科技感，量子物理学家风格",
  hairstyle: "银白色短发，发梢发光，漂浮感",
  facialFeatures: "冷静理性，眼睛呈现数据流效果",
  clothing: "白色实验服，内穿量子计算主题紧身衣，蓝色光效",
  accessories: "手持量子骰子（多面体发光），周围环绕概率云",
  background: "量子计算机，概率云，平行宇宙分支",
  colorScheme: { primary: "#C0C0C0", secondary: "#05D9E8" },
  pose: "站立，双手操控悬浮的量子骰子",
  expression: "专注，眼神深邃"
} as const;

/**
 * A5.2.5 AC02 幸运女神·骰子姬
 */
export const AC02_VISUAL_SPEC = {
  overall: "少女形象，活泼可爱，幸运光环",
  hairstyle: "金色双马尾，发带为骰子形状",
  facialFeatures: "灿烂笑容，星星眼，脸颊红晕",
  clothing: "金色礼服裙，四叶草装饰，骰子图案",
  accessories: "手持金色骰子，周围漂浮幸运符号",
  background: "彩虹，金币，四叶草，星星",
  colorScheme: { primary: "#FFD700", secondary: "#FFB6C1" },
  pose: "跳跃姿势，骰子在手中旋转",
  expression: "开心大笑，充满活力"
} as const;

/**
 * A5.2.6 AC03 风险投资人·博弈者
 */
export const AC03_VISUAL_SPEC = {
  overall: "中年男性，商务精英，风险投资者",
  hairstyle: "整齐短发，略带灰白",
  facialFeatures: "严肃认真，眼神锐利，佩戴金丝眼镜",
  clothing: "深色西装，红色领带，口袋有数据终端",
  accessories: "手持数据平板，显示股市图表，风险分析界面",
  background: "股票曲线，数据图表，投资矩阵",
  colorScheme: { primary: "#36454F", secondary: "#DC143C" },
  pose: "站立，一手插兜，一手持平板",
  expression: "冷静分析，略带自信"
} as const;

/**
 * A5.3.1 AS01 卡组构筑师·牌库掌控者
 */
export const AS01_VISUAL_SPEC = {
  overall: "青年男性，图书管理员/档案管理者风格",
  hairstyle: "棕色中长发，略显凌乱，知识分子气质",
  facialFeatures: "专注，佩戴眼镜，手中常有卡牌",
  clothing: "深色长外套，内穿马甲，衬衫，领结",
  accessories: "手持卡牌，周围悬浮多张卡牌，卡牌收纳盒",
  background: "图书馆，卡牌收藏架，数据流",
  colorScheme: { primary: "#8B4513", secondary: "#FFD700" },
  pose: "站立，一手持卡牌，一手整理牌库",
  expression: "专注，略带微笑"
} as const;

/**
 * A5.3.2 AS02 资源调配师·能量核心
 */
export const AS02_VISUAL_SPEC = {
  overall: "机械改造人，能源专家，半机械化",
  hairstyle: "短发，部分机械结构外露",
  facialFeatures: "半边人脸，半边机械，机械眼发光",
  clothing: "工业风格装甲，能源核心外露，管线连接",
  accessories: "胸部能源核心（发光），手臂能量传输管",
  background: "能源工厂，能量流，机械结构",
  colorScheme: { primary: "#FF8C00", secondary: "#C0C0C0" },
  pose: "站立，展示胸部能源核心",
  expression: "坚定，机械面无表情"
} as const;

/**
 * A5.3.3 AS03 战术指挥官·战场统帅
 */
export const AS03_VISUAL_SPEC = {
  overall: "成熟男性，军事指挥官，威严霸气",
  hairstyle: "短发，整齐，略带威严",
  facialFeatures: "坚毅面容，眼神锐利，可能有伤疤",
  clothing: "军装风格制服，勋章装饰，披风",
  accessories: "指挥棒，战术地图，通讯设备",
  background: "战场地图，战术标记，指挥所",
  colorScheme: { primary: "#4B5320", secondary: "#FFD700" },
  pose: "站立，手持指挥棒指向地图",
  expression: "严肃，指挥若定"
} as const;

// ============================================
// A6.0 游戏场景与区域设计
// ============================================

/**
 * A6.1.1 界面分区
 */
export interface GameInterfaceLayout {
  topBar: {
    content: "回合数 | 双方等级 | 设置按钮";
    height: "固定";
  };
  opponentInfo: {
    content: "头像 | 资源 | 手牌数";
    height: "固定";
  };
  battlefield: {
    zones: ["Perimeter", "DMZ", "Internal", "ICS"];
    layout: "网格布局";
  };
  playerInfo: {
    content: "头像 | 资源 | 科技树等级";
    height: "固定";
  };
  handArea: {
    content: "横向排列的手牌";
    layout: "水平滚动";
  };
  actionButtons: {
    content: "结束回合 | 技能 | 设置";
    layout: "水平排列";
  };
}

/**
 * A6.2.1 Perimeter（网络边界）
 */
export const PERIMETER_ZONE_SPEC = {
  visual: {
    background: "防火墙外观，数据流从外向内",
    colorTone: "红色警报灯，橙色警示",
    elements: ["防火墙图标", "入侵检测系统", "警报灯"],
    controlIndicator: "红色/蓝色旗帜，显示当前控制方"
  },
  occupation: {
    attacker: "红色光效增强，数据流入",
    defender: "蓝色护盾，数据流被阻挡"
  }
} as const;

/**
 * A6.2.2 DMZ（隔离区）
 */
export const DMZ_ZONE_SPEC = {
  visual: {
    background: "缓冲区设计，中立区域",
    colorTone: "紫色渐变，中性色调",
    elements: ["沙盒图标", "缓冲区标识", "中立标志"],
    controlIndicator: "紫色旗帜，显示当前控制方"
  },
  occupation: "动态平衡，双方均可争夺"
} as const;

/**
 * A6.2.3 Internal（内网）
 */
export const INTERNAL_ZONE_SPEC = {
  visual: {
    background: "内部网络，服务器机房",
    colorTone: "蓝色冷光，科技感",
    elements: ["服务器机架", "数据存储", "核心系统"],
    controlIndicator: "蓝色/红色旗帜"
  },
  occupation: {
    defender: "蓝色护盾强化",
    attacker: "红色渗透效果"
  }
} as const;

/**
 * A6.2.4 ICS（工控系统）
 */
export const ICS_ZONE_SPEC = {
  visual: {
    background: "工业控制系统，关键基础设施",
    colorTone: "黄色警示，重要区域",
    elements: ["工业设备", "控制面板", "关键系统"],
    controlIndicator: "金色/红色旗帜"
  },
  occupation: "高价值区域，光效更强烈"
} as const;

// ============================================
// A7.0 资源与道具设计
// ============================================

/**
 * A7.1.1 算力（Computing Power）
 */
export const COMPUTING_POWER_ICON = {
  shape: "六边形芯片，电路纹理",
  color: "#00CED1",
  effect: "脉冲发光",
  sizes: { ui: "32px × 32px", card: "48px × 48px" }
} as const;

/**
 * A7.1.2 资金（Funds）
 */
export const FUNDS_ICON = {
  shape: "金币/数字货币符号",
  color: "#FFD700",
  effect: "闪烁效果",
  sizes: { ui: "32px × 32px", card: "48px × 48px" }
} as const;

/**
 * A7.1.3 信息（Information）
 */
export const INFORMATION_ICON = {
  shape: "文档/数据包，信息流动",
  color: "#4169E1",
  effect: "流动光效",
  sizes: { ui: "32px × 32px", card: "48px × 48px" }
} as const;

/**
 * A7.1.4 权限（Permission）
 */
export const PERMISSION_ICON = {
  shape: "钥匙/锁/徽章",
  color: "#9932CC",
  effect: "神秘光晕",
  sizes: { ui: "32px × 32px", card: "48px × 48px" }
} as const;

/**
 * A7.2.1 威胁标记（进攻方）
 */
export const THREAT_MARK = {
  shape: "红色三角形，内部骷髅/病毒图标",
  color: "#8B0000",
  effect: "红色脉动",
  size: "24px × 24px"
} as const;

/**
 * A7.2.2 防御标记（防御方）
 */
export const DEFENSE_MARK = {
  shape: "蓝色盾牌，内部锁/盾图标",
  color: "#00008B",
  effect: "蓝色护盾光效",
  size: "24px × 24px"
} as const;

/**
 * A7.2.3 光环标记
 */
export const AURA_MARK = {
  shape: "圆形光环，内部对应图标",
  color: "对应卡牌阵营色",
  effect: "持续旋转光效",
  size: "28px × 28px"
} as const;

// ============================================
// A8.0 UI组件与图标设计
// ============================================

/**
 * A8.1.1 主按钮样式
 */
export const PRIMARY_BUTTON_STYLE = {
  base: {
    background: "linear-gradient(135deg, #FF2A6D 0%, #FF6B6B 100%)",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    padding: "12px 24px",
    boxShadow: "0 4px 15px rgba(255,42,109,0.4)"
  },
  hover: {
    background: "linear-gradient(135deg, #FF4A8D 0%, #FF8B8B 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255,42,109,0.6)"
  },
  active: {
    transform: "translateY(0)",
    boxShadow: "0 2px 10px rgba(255,42,109,0.4)"
  }
} as const;

/**
 * A8.1.2 次级按钮样式
 */
export const SECONDARY_BUTTON_STYLE = {
  base: {
    background: "transparent",
    border: "2px solid #05D9E8",
    borderRadius: "8px",
    padding: "10px 20px",
    color: "#05D9E8"
  },
  hover: {
    background: "rgba(5,217,232,0.1)",
    boxShadow: "0 0 15px rgba(5,217,232,0.3)"
  }
} as const;

/**
 * A8.2.1 玻璃态面板
 */
export const GLASS_PANEL_STYLE = {
  background: "rgba(15,15,26,0.85)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
} as const;

/**
 * A8.3.1 功能图标
 */
export const FUNCTION_ICONS = {
  settings: { icon: "齿轮", size: "24px" },
  back: { icon: "左箭头", size: "24px" },
  close: { icon: "X符号", size: "24px" },
  confirm: { icon: "对勾", size: "24px" },
  cancel: { icon: "叉号", size: "24px" },
  info: { icon: "i符号", size: "20px" },
  warning: { icon: "感叹号三角形", size: "24px" },
  victory: { icon: "奖杯/星星", size: "32px" },
  defeat: { icon: "破碎盾牌", size: "32px" }
} as const;

/**
 * A8.3.2 游戏图标
 */
export const GAME_ICONS = {
  turn: { icon: "时钟/循环箭头", size: "24px" },
  techTree: { icon: "树状图/升级箭头", size: "24px" },
  draw: { icon: "卡牌堆", size: "24px" },
  judgment: { icon: "骰子", size: "24px" },
  rps: { icon: "石头剪刀布", size: "24px" },
  zone: { icon: "地图标记", size: "24px" }
} as const;

// ============================================
// A9.0 特效与动画规范
// ============================================

/**
 * A9.1.1 抽卡动画
 */
export const CARD_DRAW_ANIMATION = {
  sequence: [
    "卡牌从牌库飞出（0.3s，ease-out）",
    "卡牌翻转显示正面（0.2s，ease-in-out）",
    "卡牌飞入手牌区（0.3s，ease-out）",
    "手牌重新排列（0.2s，ease-out）"
  ],
  effects: {
    rare: "蓝色光效拖尾",
    epic: "紫色光效拖尾 + 粒子",
    legendary: "金色光效拖尾 + 大量粒子"
  }
} as const;

/**
 * A9.1.2 打出动画
 */
export const CARD_PLAY_ANIMATION = {
  sequence: [
    "卡牌从手牌区放大（0.2s，ease-out）",
    "卡牌飞入战场中央（0.4s，ease-in-out）",
    "卡牌效果触发（0.3s）",
    "卡牌进入弃牌堆或战场（0.2s）"
  ]
} as const;

/**
 * A9.1.3 连击特效
 */
export const COMBO_EFFECT = {
  trigger: "连击卡效果触发",
  description: "卡牌边缘金光渐变闪烁",
  frequency: "1秒1闪",
  duration: "直到连击效果结算",
  color: "金色 #FFD700 → 白色 #FFFFFF → 金色 #FFD700"
} as const;

/**
 * A9.4 动画时间规范
 */
export const ANIMATION_TIMING = {
  quickFeedback: { duration: "0.1-0.2s", easing: "ease-out", usage: "按钮点击" },
  standard: { duration: "0.3-0.5s", easing: "ease-in-out", usage: "卡牌移动" },
  complex: { duration: "0.8-1.2s", easing: "ease-out", usage: "判定动画" },
  emphasis: { duration: "1.5-2.0s", easing: "ease-in-out", usage: "胜利动画" }
} as const;

// ============================================
// A10.0 Figma设计系统架构
// ============================================

/**
 * A10.1 文件结构
 */
export const FIGMA_FILE_STRUCTURE = {
  "01-设计规范": ["色彩系统", "字体规范", "间距系统"],
  "02-组件库": ["按钮", "输入框", "卡牌模板", "图标"],
  "03-页面设计": ["主界面", "战斗界面", "角色选择", "设置界面"],
  "04-角色设计": ["AR01-博弈大师", "AR02-心理分析师", "AR03-欺诈专家"],
  "05-卡牌设计": ["进攻方卡牌", "防御方卡牌", "通用卡牌"],
  "06-资源导出": ["切图资源", "图标资源"]
} as const;

/**
 * A10.2.1 图层命名规范
 */
export const LAYER_NAMING_CONVENTION = {
  format: "[类型]/[名称]/[状态]/[变体]",
  examples: [
    "Button/Primary/Default",
    "Button/Primary/Hover",
    "Button/Primary/Pressed",
    "Card/Attack/Common",
    "Card/Attack/Rare",
    "Icon/Resource/Computing"
  ]
} as const;

/**
 * A10.2.2 样式命名规范
 */
export const STYLE_NAMING_CONVENTION = {
  format: "[类别]/[名称]/[变体]",
  examples: [
    "Color/Primary/Red",
    "Color/Secondary/Blue",
    "Text/Heading/H1",
    "Text/Body/Regular",
    "Effect/Shadow/Card",
    "Effect/Glow/Neon"
  ]
} as const;

/**
 * A10.3.1 颜色样式
 */
export const FIGMA_COLOR_STYLES = [
  "Primary/Red/500",
  "Primary/Red/600",
  "Primary/Red/700",
  "Secondary/Blue/500",
  "Secondary/Blue/600",
  "Secondary/Blue/700",
  "Neutral/Black/900",
  "Neutral/Black/800",
  "Neutral/White/100",
  "Rarity/Common",
  "Rarity/Rare",
  "Rarity/Epic",
  "Rarity/Legendary"
] as const;

/**
 * A10.3.2 文字样式
 */
export const FIGMA_TEXT_STYLES = [
  "Heading/H1/32pt",
  "Heading/H2/24pt",
  "Heading/H3/18pt",
  "Body/Regular/14pt",
  "Body/Small/12pt",
  "Caption/10pt",
  "Card/Name/18pt",
  "Card/Description/11pt"
] as const;

// ============================================
// A11.0 设计资源清单
// ============================================

/**
 * A11.1.1 高优先级待办设计
 */
export const HIGH_PRIORITY_DESIGN_TASKS = [
  "色彩系统定义（主色、功能色、稀有度色）",
  "字体系统定义（中文字体、英文字体、字号规范）",
  "标准卡牌模板（普通、稀有、史诗、传说）",
  "阵营标识设计（进攻方、防御方、通用）",
  "资源图标设计（算力、资金、信息、权限）",
  "角色头像设计（9个角色）",
  "主界面UI设计",
  "游戏界面UI设计"
] as const;

/**
 * A11.1.2 中优先级待办设计
 */
export const MEDIUM_PRIORITY_DESIGN_TASKS = [
  "角色全身立绘（9个角色）",
  "卡牌插画（核心卡牌）",
  "区域背景设计（4个区域）",
  "标记设计（威胁、防御、光环）",
  "按钮组件设计",
  "面板组件设计",
  "图标系统设计",
  "胜利/失败界面设计"
] as const;

/**
 * A11.1.3 低优先级待办设计
 */
export const LOW_PRIORITY_DESIGN_TASKS = [
  "特效动画设计",
  "音效配合设计",
  "加载界面设计",
  "设置界面设计",
  "帮助界面设计",
  "成就系统UI设计",
  "排行榜UI设计"
] as const;

/**
 * A11.2.1 导出格式
 */
export const EXPORT_FORMATS = {
  cards: { format: "PNG", resolution: "2x (480×672px)", notes: "透明背景" },
  characterPortraits: { format: "PNG", resolution: "2x (532×912px)", notes: "透明背景" },
  icons: { format: "SVG", resolution: "矢量", notes: "可缩放" },
  uiElements: { format: "PNG/SVG", resolution: "1x/2x", notes: "根据需求" },
  backgrounds: { format: "JPG/PNG", resolution: "2x", notes: "高质量" }
} as const;

/**
 * A11.2.2 命名规范
 */
export const NAMING_CONVENTION = {
  format: "[类型]_[名称]_[变体]_[尺寸].[格式]",
  examples: [
    "card_atk001_port-scan_common_2x.png",
    "character_ar01_cyber-gambler_2x.png",
    "icon_resource_computing.svg",
    "ui_button_primary_default_2x.png",
    "bg_area_perimeter_2x.jpg"
  ]
} as const;
