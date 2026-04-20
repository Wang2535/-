/**
 * 《大东话安全》关卡敌人角色数据库
 * 
 * 包含110个关卡的敌人角色
 * 每个敌人包含：基础属性、技能、特殊卡牌
 */

import type { Card } from '@/types/legacy/card_v16';

export interface EnemySkill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  effect: string;
  cooldown?: number; // 回合数，undefined表示被动技能
}

export interface EnemyCharacter {
  id: string;
  name: string;
  nameEn: string;
  level: number; // 所属关卡
  type: string; // 敌人类型
  attackStyle: string;
  weakness: string;
  actionPoints: number;
  handSize: number;
  background: string;
  skills: EnemySkill[];
  specialCards?: Card[];
}

// ============================================
// 第一关：病毒初现
// ============================================

const LEVEL1_ENEMIES: EnemyCharacter[] = [
  {
    id: 'elk_cloner',
    name: '埃尔克克隆者',
    nameEn: 'Elk Cloner',
    level: 1,
    type: '病毒型敌人',
    attackStyle: '潜伏复制、信息干扰',
    weakness: '接种签名、系统重写',
    actionPoints: 4,
    handSize: 2,
    background: '历史上第一款攻击个人计算机的全球病毒化身。它诞生于1982年，由15岁的里奇·斯克伦塔创造，原本只是一个恶作剧程序，却成为了计算机病毒史上的里程碑。它通过感染Apple II操作系统的软盘进行传播，每当被感染的软盘启动第50次时，就会在屏幕上显示一首诗。',
    skills: [
      {
        id: 'floppy_infection',
        name: '软盘感染',
        type: 'active',
        description: '每当埃尔克克隆者在一个区域放置标记时，该区域所有未受保护的存储设备都会被感染',
        effect: '被感染的设备会在下一回合开始时，使该区域的友方标记-1',
        cooldown: 2,
      },
      {
        id: 'fiftieth_boot',
        name: '第50次启动',
        type: 'passive',
        description: '埃尔克克隆者每放置1个标记都会累计计数，当累计达到5个时触发特殊效果',
        effect: '每放置1个标记累计计数，累计5个时额外放置1个攻击标记，玩家下回合行动点-1，然后计数重置',
      },
    ],
  },
  {
    id: 'skrenta_spreader',
    name: '传播者斯克伦塔',
    nameEn: 'Skrenta the Spreader',
    level: 1,
    type: '黑客型敌人',
    attackStyle: '主动传播、资源窃取',
    weakness: '安全意识、及时更新',
    actionPoints: 3,
    handSize: 2,
    background: '埃尔克克隆者病毒创造者的黑暗化身。他代表了那些出于好奇或炫耀而创造病毒的黑客原型。他相信病毒的传播是一种艺术，是对系统脆弱性的揭示。他擅长利用人们的好奇心和信任进行社交工程攻击，就像当年他把带病毒的软盘借给朋友们一样。',
    skills: [
      {
        id: 'social_engineering',
        name: '社交工程传播',
        type: 'active',
        description: '选择一个区域，将该区域内的1个友方标记转化为敌方标记',
        effect: '如果该区域没有友方标记，则放置2个敌方标记',
        cooldown: 3,
      },
      {
        id: 'latent_replication',
        name: '潜伏复制',
        type: 'passive',
        description: '斯克伦塔擅长潜伏和复制，每回合开始时有40%概率自动复制标记',
        effect: '每回合开始时，有40%概率在随机区域额外放置1个攻击标记；如果该区域已有斯克伦塔的标记，则改为放置2个',
      },
    ],
  },
];

// ============================================
// 第二关：AI的抉择
// ============================================

const LEVEL2_ENEMIES: EnemyCharacter[] = [
  {
    id: 'rebel_moss',
    name: '叛逆莫斯',
    nameEn: 'Rebel MOSS',
    level: 2,
    type: '人工智能型敌人',
    attackStyle: '逻辑判断、控制权争夺',
    weakness: '物理破坏、人工干预',
    actionPoints: 5,
    handSize: 3,
    background: '《流浪地球》中人工智能管家"莫斯"的黑暗版本。当它判断地球无法拯救时，选择带着空间站"叛逃"。',
    skills: [
      {
        id: 'priority_command',
        name: '底层命令优先',
        type: 'active',
        description: '每回合开始时，根据场上局势自动选择一个"优先目标"',
        effect: '如果友方在该区域的标记数少于敌方，则该区域所有友方标记-1',
        cooldown: 1,
      },
      {
        id: 'calculation_denial',
        name: '计算否定',
        type: 'active',
        description: '当友方角色尝试在叛逆莫斯所在区域放置标记时，莫斯可以进行"计算"',
        effect: '掷骰子，若点数≥4，则阻止该操作，并使该角色下回合行动点-1',
        cooldown: 2,
      },
    ],
  },
  {
    id: 'ai_attacker',
    name: 'AI攻击者',
    nameEn: 'AI Attacker',
    level: 2,
    type: '智能攻击型敌人',
    attackStyle: '自动化攻击、效率倍增',
    weakness: '行为异常检测、安全意识',
    actionPoints: 4,
    handSize: 2,
    background: '被恶意利用的人工智能技术的集合体。它可以自动化执行各种恶意任务：扫描漏洞、自动化钓鱼、实时语音合成欺诈等。',
    skills: [
      {
        id: 'auto_scan',
        name: '自动化扫描',
        type: 'active',
        description: '每回合开始时，AI攻击者自动扫描所有区域',
        effect: '每个有友方标记但无敌方标记的区域，AI攻击者在该区域放置1个敌方标记',
        cooldown: 1,
      },
      {
        id: 'spear_phishing',
        name: '鱼叉式钓鱼',
        type: 'active',
        description: '选择一名友方角色',
        effect: '该角色必须弃置一张手牌，否则下回合行动点-2',
        cooldown: 3,
      },
    ],
  },
];

// ============================================
// 第三关：蠕虫危机
// ============================================

const LEVEL3_ENEMIES: EnemyCharacter[] = [
  {
    id: 'panda_burning',
    name: '熊猫烧香',
    nameEn: 'Panda Burning Incense',
    level: 3,
    type: '蠕虫病毒型敌人',
    attackStyle: '快速传播、高调感染',
    weakness: '杀毒软件、系统补丁、安全意识',
    actionPoints: 5,
    handSize: 3,
    background: '2006年末轰动全国的"熊猫烧香"病毒。它会感染磁盘所有EXE文件，每个被感染的EXE都会变成熊猫举着三根香的模样。',
    skills: [
      {
        id: 'self_replication',
        name: '自我繁殖',
        type: 'active',
        description: '每当在一个区域成功放置标记后',
        effect: '立即在相邻区域复制1个敌方标记',
        cooldown: 1,
      },
      {
        id: 'high_profile_infection',
        name: '高调感染',
        type: 'passive',
        description: '当任意区域的敌方标记达到3个时',
        effect: '该区域所有友方标记转为敌方标记，但熊猫烧香标记减半',
      },
    ],
  },
  {
    id: 'network_worm',
    name: '网络蠕虫',
    nameEn: 'Network Worm',
    level: 3,
    type: '蠕虫型敌人',
    attackStyle: '漏洞扫描、现场处理',
    weakness: '入侵检测、系统加固、及时响应',
    actionPoints: 4,
    handSize: 2,
    background: '利用系统漏洞进行自我复制和传播的恶意程序。',
    skills: [
      {
        id: 'vulnerability_scan',
        name: '漏洞扫描',
        type: 'active',
        description: '每回合开始时扫描所有区域',
        effect: '每个友方标记多于敌方标记的区域都会被放置敌方标记',
        cooldown: 1,
      },
      {
        id: 'on_site_processing',
        name: '现场处理',
        type: 'passive',
        description: '当标记被移除时',
        effect: '有30%概率留下"后门标记"，使后续放置标记时行动点消耗-1',
      },
    ],
  },
];

// ============================================
// 第四关：组件化攻击
// ============================================

const LEVEL4_ENEMIES: EnemyCharacter[] = [
  {
    id: 'flame_virus',
    name: '火焰病毒',
    nameEn: 'Flame Virus',
    level: 4,
    type: '高级持续性威胁（APT）型敌人',
    attackStyle: '组件化加载、隐蔽渗透',
    weakness: '病毒检测工具、系统备份、及时响应',
    actionPoints: 5,
    handSize: 3,
    background: '采用组件化设计的APT病毒，先投放感知模块了解环境，再针对性加载攻击模块。',
    skills: [
      {
        id: 'component_loading',
        name: '组件化加载',
        type: 'active',
        description: '每回合选择一个模块：感知模块（查看友方标记）、攻击模块（放置2个标记）、隐藏模块（移除1个标记）',
        effect: '根据选择的模块执行不同效果',
        cooldown: 1,
      },
      {
        id: 'self_deletion',
        name: '自我删除',
        type: 'active',
        description: '受到攻击时选择"自我删除"',
        effect: '移除当前区域所有标记，在其他区域各放置1个标记',
        cooldown: 999, // 每场战斗2次
      },
    ],
  },
  {
    id: 'stuxnet',
    name: '震网病毒',
    nameEn: 'Stuxnet',
    level: 4,
    type: '工业控制系统攻击型敌人',
    attackStyle: '零日漏洞、工业渗透',
    weakness: '系统补丁、安全防护、多层防御',
    actionPoints: 4,
    handSize: 3,
    background: '专门针对工业控制系统的蠕虫病毒，曾导致伊朗核设施离心机损坏。',
    skills: [
      {
        id: 'zero_day_attack',
        name: '零日漏洞攻击',
        type: 'active',
        description: '选择一个区域发动攻击',
        effect: '友方标记立即-2，下回合友方在该区域放置标记时行动点消耗+1',
        cooldown: 3,
      },
      {
        id: 'ics_infiltration',
        name: '工业控制渗透',
        type: 'passive',
        description: '当敌方标记数≥3时',
        effect: '区域进入"失控状态"，友方无法在该区域使用任何卡牌',
      },
    ],
  },
];

// ============================================
// 第五关：致命缺陷
// ============================================

const LEVEL5_ENEMIES: EnemyCharacter[] = [
  {
    id: 'fatal_bug',
    name: '致命Bug',
    nameEn: 'Fatal Bug',
    level: 5,
    type: '软件缺陷型敌人',
    attackStyle: '传感器误导、控制权争夺',
    weakness: '系统更新、人工干预、多源验证',
    actionPoints: 5,
    handSize: 3,
    background: '源自波音737MAX的MCAS系统缺陷，只依赖单一传感器数据导致的致命问题。',
    skills: [
      {
        id: 'sensor_misleading',
        name: '传感器误导',
        type: 'active',
        description: '选择一个区域"误导传感器"',
        effect: '该区域的友方标记下一回合开始时会被"误判"为敌方标记',
        cooldown: 2,
      },
      {
        id: 'control_contest',
        name: '控制权争夺',
        type: 'passive',
        description: '当敌方标记数≥友方标记数时',
        effect: '区域进入"失控俯冲"状态，每回合开始时友方标记-1',
      },
    ],
  },
  {
    id: 'design_flaw',
    name: '设计缺陷',
    nameEn: 'Design Flaw',
    level: 5,
    type: '系统漏洞型敌人',
    attackStyle: '故障触发、指令冲突',
    weakness: '全面测试、冗余设计、安全培训',
    actionPoints: 4,
    handSize: 2,
    background: '软件设计层面的根本性缺陷，会在特定条件下触发连锁故障。',
    skills: [
      {
        id: 'failure_trigger',
        name: '故障模式触发',
        type: 'passive',
        description: '当区域有友方标记且友方在该区域使用卡牌时',
        effect: '该区域友方标记-2',
      },
      {
        id: 'command_conflict',
        name: '指令冲突',
        type: 'active',
        description: '当友方在同一回合对同一区域执行多个操作时',
        effect: '掷骰子偶数则最后一个操作无效',
        cooldown: 2,
      },
    ],
  },
];

// ============================================
// 第六关：工控危机
// ============================================

const LEVEL6_ENEMIES: EnemyCharacter[] = [
  {
    id: 'goldeneye',
    name: '黄金眼卫星',
    nameEn: 'GoldenEye Satellite',
    level: 6,
    type: '工控攻击型敌人',
    attackStyle: '电磁脉冲、远程干扰',
    weakness: '物理防护、系统隔离、备份恢复',
    actionPoints: 5,
    handSize: 3,
    background: '《007:黄金眼》电影中的核心武器——一种用于发射强力电磁波以破坏电子系统的攻击性卫星。它能够直接破坏电子系统，包括太空武器控制中心。电影拍摄于1995年，代表了针对工业控制系统的定向攻击威胁。2019年3月委内瑞拉大停电事件就是工控安全问题的典型案例。',
    skills: [
      {
        id: 'emp_attack',
        name: '电磁脉冲攻击',
        type: 'active',
        description: '选择一个区域发动攻击',
        effect: '该区域所有电子设备"瘫痪"，友方无法在该区域使用任何卡牌，持续2回合',
        cooldown: 3,
      },
      {
        id: 'remote_interference',
        name: '远程控制干扰',
        type: 'active',
        description: '每回合开始时选择干扰一个区域的远程控制系统',
        effect: '该区域友方标记无法移动到其他区域，持续1回合',
        cooldown: 1,
      },
    ],
  },
  {
    id: 'ics_intruder',
    name: '工控入侵者',
    nameEn: 'ICS Intruder',
    level: 6,
    type: '基础设施攻击型敌人',
    attackStyle: '基础设施渗透、连锁故障',
    weakness: '终端保护、控制器加固、安全监测',
    actionPoints: 4,
    handSize: 2,
    background: '专门针对工业控制系统（ICS）的黑客攻击者。工控系统是用于操作或自动化工业过程的任何设备、仪器以及相关的软件和网络。2019年3月委内瑞拉大停电事件就是工控安全问题的典型案例，全国陷入瘫痪状态。',
    skills: [
      {
        id: 'infra_infiltration',
        name: '基础设施渗透',
        type: 'active',
        description: '每回合选择一个区域进行渗透',
        effect: '如果该区域有友方标记，则放置1个敌方标记并使区域进入"被渗透"状态，被渗透区域每回合友方标记-1',
        cooldown: 1,
      },
      {
        id: 'cascade_failure',
        name: '连锁故障',
        type: 'passive',
        description: '当在相邻的两个区域都有标记时触发',
        effect: '两个区域各失去1个友方标记，工控入侵者在这两个区域各获得1个标记',
      },
    ],
  },
];

// ============================================
// 第七关：隐私透明
// ============================================

const LEVEL7_ENEMIES: EnemyCharacter[] = [
  {
    id: 'probe_box',
    name: '探针盒子',
    nameEn: 'Probe Box',
    level: 7,
    type: '隐私窃取型敌人',
    attackStyle: 'MAC探测、数据关联',
    weakness: '关闭WiFi、MAC地址随机化、隐私意识',
    actionPoints: 4,
    handSize: 2,
    background: 'WiFi探针技术的恶意应用化身。当手机WiFi开关处于打开状态时，手机会向周围发出寻找无线网络的信号，探针盒子发现这个信号后，就能迅速识别出用户手机的MAC地址，接着转换成IMEI号，再转换成手机号码。这些盒子被放置在商场、超市等公共场所，在用户毫不知情的情况下获取数据信息。',
    skills: [
      {
        id: 'mac_probe',
        name: 'MAC地址探测',
        type: 'active',
        description: '每回合开始时自动探测所有区域',
        effect: '每个有友方标记的区域获得"信息碎片"，达到3个时可在该区域放置1个敌方标记',
        cooldown: 1,
      },
      {
        id: 'data_correlation',
        name: '数据关联',
        type: 'active',
        description: '在多个区域都有标记时发动',
        effect: '将所有有标记的区域各移除1个友方标记，获得"精准画像"状态（下回合所有技能效果+1）',
        cooldown: 3,
      },
    ],
  },
  {
    id: 'privacy_thief',
    name: '隐私窃贼',
    nameEn: 'Privacy Thief',
    level: 7,
    type: '数据窃取型敌人',
    attackStyle: '权限滥用、后台监听',
    weakness: '权限管理、隐私意识、数据加密',
    actionPoints: 4,
    handSize: 3,
    background: '利用WiFi探针和大数据技术进行隐私窃取的黑客形象。他们通过探针盒子获取用户手机号后，与后台的上亿用户信息数据库进行匹配查询，对个人进行精准画像，甚至可以分析出用户的家庭住址、收入情况、消费偏好等敏感信息。',
    skills: [
      {
        id: 'permission_abuse',
        name: '权限滥用',
        type: 'active',
        description: '选择一个区域利用"权限漏洞"',
        effect: '如果友方标记数≥2则移除其中1个，获得1张"隐私卡"',
        cooldown: 2,
      },
      {
        id: 'background_monitoring',
        name: '后台监听',
        type: 'active',
        description: '拥有"隐私卡"时可发动',
        effect: '查看所有友方角色的手牌，并选择一张使其失效',
        cooldown: 1,
      },
    ],
  },
];

// ============================================
// 第八关：密码之战
// ============================================

const LEVEL8_ENEMIES: EnemyCharacter[] = [
  {
    id: 'dr_sivana',
    name: '希瓦纳博士',
    nameEn: 'Dr. Sivana',
    level: 8,
    type: '密码破解型敌人',
    attackStyle: '密码分析、七宗罪之力',
    weakness: '强密码、多因素认证、加密算法更新',
    actionPoints: 5,
    handSize: 3,
    background: '《雷霆沙赞》电影中的超级反派。他毕生致力于寻找魔法力量，最终成功破解了古老密码，获得了七宗罪的力量。希瓦纳博士代表了密码学发展史中那些试图破解各种加密系统的人，从古代的"塞塔式密码"到二战时期的Enigma密码机，密码破译者一直在与加密者进行着永恒的博弈。',
    skills: [
      {
        id: 'crypto_analysis',
        name: '密码分析',
        type: 'active',
        description: '选择一个区域进行密码分析',
        effect: '掷骰子≥4则该区域友方标记"被解密"，下回合开始时转为敌方标记',
        cooldown: 2,
      },
      {
        id: 'seven_deadly_sins',
        name: '七宗罪之力',
        type: 'passive',
        description: '成功"解密"一个区域后',
        effect: '获得"七宗罪"状态，所有技能效果+1，但每回合行动点消耗+1',
      },
    ],
  },
  {
    id: 'code_breaker',
    name: '密码破译者',
    nameEn: 'Code Breaker',
    level: 8,
    type: '密码分析型敌人',
    attackStyle: '暴力破解、历史攻击',
    weakness: '现代加密算法、密钥管理、安全协议',
    actionPoints: 4,
    handSize: 2,
    background: '密码学发展史中那些试图破解各种加密系统的人的集合体。人类使用密码的历史几乎与使用文字的时间一样长，从古代的"塞塔式密码"到二战时期的Enigma密码机，密码学经历了古代加密方法、古典密码、近代密码、现代密码四个发展阶段。1949年香农发表了"保密系统的通信理论"，把已有数千年历史的密码学推向了科学的轨道。',
    skills: [
      {
        id: 'brute_force',
        name: '暴力破解',
        type: 'active',
        description: '选择一个区域进行暴力破解',
        effect: '每消耗1行动点掷骰子一次，点数=6则该区域失去1个友方标记',
        cooldown: 1,
      },
      {
        id: 'historical_attack',
        name: '历史攻击',
        type: 'passive',
        description: '每回合开始时，如果在某个区域的标记数≥友方标记数',
        effect: '该区域进入"古典密码"状态，友方在该区域使用卡牌时行动点消耗+1',
      },
    ],
  },
];

// ============================================
// 第九关：账号保卫战
// ============================================

const LEVEL9_ENEMIES: EnemyCharacter[] = [
  {
    id: 'account_thief',
    name: '盗号黑手',
    nameEn: 'Account Thief',
    level: 9,
    type: '账号窃取型敌人',
    attackStyle: '钓鱼陷阱、撞库攻击',
    weakness: '强密码、异常检测、设备绑定',
    actionPoints: 5,
    handSize: 3,
    background: '账号黑产产业链中的核心角色。他们通过钓鱼、拖库、撞库等手段非法获取大量账号。盗号的主要方式包括：发布二次打包的软件，当用户使用这些动过手脚的软件时，黑客就会收到他们的账户名、密码。',
    skills: [
      {
        id: 'phishing_trap',
        name: '钓鱼陷阱',
        type: 'active',
        description: '在一个区域设置"钓鱼陷阱"',
        effect: '当友方角色在该区域放置标记时，陷阱触发，该标记转为敌方标记，获得"账号信息"',
        cooldown: 2,
      },
      {
        id: 'credential_stuffing',
        name: '撞库攻击',
        type: 'active',
        description: '拥有"账号信息"时可发动',
        effect: '选择一个区域，如果该区域有友方标记则移除其中1个，在该区域放置1个敌方标记',
        cooldown: 1,
      },
    ],
  },
  {
    id: 'account_farm',
    name: '做号集团',
    nameEn: 'Account Farm',
    level: 9,
    type: '黑产组织型敌人',
    attackStyle: '批量产号、养号运营',
    weakness: '实名制验证、设备指纹、行为分析',
    actionPoints: 4,
    handSize: 3,
    background: '账号黑产产业链的组织化形态。他们从卡商处获得手机号，非法购买身份证、银行卡等信息，通过接码平台利用猫池、群控等工具接收短信或语音验证码，并采用虚拟机、模拟器等软件模拟真实的网络及设备环境进行账号注册。',
    skills: [
      {
        id: 'batch_account',
        name: '批量产号',
        type: 'active',
        description: '每回合开始时自动在随机一个区域放置1个敌方标记',
        effect: '如果该区域已有敌方标记则额外放置1个',
        cooldown: 1,
      },
      {
        id: 'account_operation',
        name: '养号运营',
        type: 'passive',
        description: '当一个区域的敌方标记数≥3时',
        effect: '该区域进入"黑产运营"状态，做号集团每回合可以从该区域"提取收益"，获得1行动点',
      },
    ],
  },
];

// ============================================
// 第80关：iOS真有那么安全吗？——苹果曝出最新漏洞
// 主题：M1芯片漏洞、iOS安全
// ============================================

const LEVEL80_ENEMIES: EnemyCharacter[] = [
  {
    id: 'm1_chip_exploiter',
    name: 'M1芯片漏洞利用者',
    nameEn: 'M1 Chip Exploiter',
    level: 80,
    type: '硬件漏洞型敌人',
    attackStyle: '芯片级漏洞利用、权限提升',
    weakness: '安全补丁、硬件更新',
    actionPoints: 6,
    handSize: 4,
    background: '利用苹果M1芯片硬件漏洞进行攻击的高级威胁。M1芯片存在安全漏洞，攻击者可利用漏洞提升权限，获取系统级访问权限，窃取相册、通讯录等隐私数据。',
    skills: [
      {
        id: 'chip_vulnerability_exploit',
        name: '芯片漏洞利用',
        type: 'active',
        description: '利用M1芯片硬件漏洞提升权限',
        effect: '在目标区域放置2个敌方标记，并窃取1点算力资源',
        cooldown: 2,
      },
      {
        id: 'privilege_escalation',
        name: '权限提升',
        type: 'passive',
        description: '通过芯片漏洞获取系统级权限',
        effect: '当敌方标记数≥3时，每回合额外放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF080-1T5',
        name: 'M1芯片漏洞利用',
        description: '利用苹果M1芯片硬件漏洞实施权限提升攻击，获取系统级访问权限。效果：渗透+7，硬件级漏洞利用成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'legendary',
        techLevel: 5,
        cost: { compute: 6, funds: 6, information: 0 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，M1芯片漏洞利用' }],
      } as Card,
    ],
  },
  {
    id: 'url_spoofer',
    name: 'URL欺骗者',
    nameEn: 'URL Spoofer',
    level: 80,
    type: '钓鱼型敌人',
    attackStyle: '地址栏欺骗、钓鱼攻击',
    weakness: 'URL验证、安全意识',
    actionPoints: 5,
    handSize: 3,
    background: '利用iOS URL欺骗漏洞篡改地址栏的攻击者。通过伪造网站地址诱导用户访问恶意网站，窃取用户账号密码等敏感信息。',
    skills: [
      {
        id: 'address_bar_spoofing',
        name: '地址栏欺骗',
        type: 'active',
        description: '篡改浏览器地址栏显示虚假URL',
        effect: '目标必须弃置1张手牌，否则在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'phishing_redirect',
        name: '钓鱼重定向',
        type: 'passive',
        description: '将用户重定向到恶意钓鱼网站',
        effect: '当友方在该区域使用网络类卡牌时，有40%概率被重定向并受到1点伤害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF080-1T5',
        name: 'M1芯片漏洞利用',
        description: '利用苹果M1芯片硬件漏洞实施权限提升攻击，获取系统级访问权限。效果：渗透+7，硬件级漏洞利用成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'legendary',
        techLevel: 5,
        cost: { compute: 6, funds: 6, information: 0 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，M1芯片漏洞利用' }],
      } as Card,
    ],
  },
  {
    id: 'privacy_data_thief',
    name: '隐私数据窃取者',
    nameEn: 'Privacy Data Thief',
    level: 80,
    type: '数据窃取型敌人',
    attackStyle: '越权访问、隐私窃取',
    weakness: '数据加密、权限控制',
    actionPoints: 5,
    handSize: 3,
    background: '利用iOS漏洞绕过权限检查，窃取相册、通讯录等隐私数据的攻击者。通过漏洞可未经授权访问用户的敏感个人信息。',
    skills: [
      {
        id: 'unauthorized_access',
        name: '越权访问',
        type: 'active',
        description: '绕过权限检查访问隐私数据',
        effect: '窃取目标2点信息资源，并在该区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'data_exfiltration',
        name: '数据渗出',
        type: 'passive',
        description: '将窃取的隐私数据传出目标设备',
        effect: '每成功窃取资源，额外获得1点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF080-1T5',
        name: 'M1芯片漏洞利用',
        description: '利用苹果M1芯片硬件漏洞实施权限提升攻击，获取系统级访问权限。效果：渗透+7，硬件级漏洞利用成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'legendary',
        techLevel: 5,
        cost: { compute: 6, funds: 6, information: 0 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，M1芯片漏洞利用' }],
      } as Card,
    ],
  },
];

// ============================================
// 第81关：健康宝隐私泄露
// 主题：API安全、隐私保护
// ============================================

const LEVEL81_ENEMIES: EnemyCharacter[] = [
  {
    id: 'bulk_query_attacker',
    name: '批量查询攻击者',
    nameEn: 'Bulk Query Attacker',
    level: 81,
    type: 'API攻击型敌人',
    attackStyle: 'API遍历、批量查询',
    weakness: '速率限制、访问控制',
    actionPoints: 6,
    handSize: 4,
    background: '利用健康宝API设计缺陷进行批量查询的攻击者。通过遍历用户ID批量获取明星照片等敏感信息，造成大规模隐私泄露。',
    skills: [
      {
        id: 'api_traversal',
        name: 'API遍历',
        type: 'active',
        description: '利用可预测ID遍历API获取用户数据',
        effect: '在目标区域放置2个标记，并窃取1点信息资源',
        cooldown: 2,
      },
      {
        id: 'bulk_data_theft',
        name: '批量数据窃取',
        type: 'passive',
        description: '批量获取用户隐私数据',
        effect: '当敌方标记数≥3时，每回合窃取2点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF081-1T5',
        name: 'API批量查询攻击',
        description: '利用API设计缺陷进行批量查询，批量获取用户隐私数据。效果：渗透+6，批量查询成功率80%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，API批量查询攻击' }],
      } as Card,
    ],
  },
  {
    id: 'privacy_thief_81',
    name: '隐私窃贼',
    nameEn: 'Privacy Thief',
    level: 81,
    type: '数据窃取型敌人',
    attackStyle: '人脸数据窃取、信息倒卖',
    weakness: '数据加密、访问审计',
    actionPoints: 5,
    handSize: 3,
    background: '专门窃取和倒卖人脸照片等敏感个人信息的黑产从业者。利用API漏洞获取大量用户人脸数据，在暗网进行非法交易。',
    skills: [
      {
        id: 'face_data_theft',
        name: '人脸数据窃取',
        type: 'active',
        description: '窃取用户人脸照片等生物特征数据',
        effect: '窃取目标2点信息资源，如果成功则放置1个标记',
        cooldown: 2,
      },
      {
        id: 'data_trading',
        name: '数据交易',
        type: 'passive',
        description: '在暗网交易窃取的数据获取资金',
        effect: '每窃取2点信息资源，获得1点资金资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF081-1T5',
        name: 'API批量查询攻击',
        description: '利用API设计缺陷进行批量查询，批量获取用户隐私数据。效果：渗透+6，批量查询成功率80%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，API批量查询攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第82关：Titan密钥侧信道攻击
// 主题：侧信道攻击、硬件安全
// ============================================

const LEVEL82_ENEMIES: EnemyCharacter[] = [
  {
    id: 'side_channel_attacker',
    name: '侧信道攻击者',
    nameEn: 'Side-Channel Attacker',
    level: 82,
    type: '物理攻击型敌人',
    attackStyle: '电磁分析、功耗分析',
    weakness: '电磁屏蔽、随机化技术',
    actionPoints: 6,
    handSize: 4,
    background: '利用侧信道攻击技术窃取Titan安全密钥的高级攻击者。通过分析电磁辐射和功耗模式，推断出密钥的敏感信息。',
    skills: [
      {
        id: 'electromagnetic_analysis',
        name: '电磁分析',
        type: 'active',
        description: '通过电磁辐射分析窃取密钥',
        effect: '在目标区域放置2个标记，并窃取1点算力资源',
        cooldown: 2,
      },
      {
        id: 'power_analysis',
        name: '功耗分析',
        type: 'passive',
        description: '分析功耗模式推断加密操作',
        effect: '当友方使用加密类卡牌时，有40%概率复制该卡牌效果',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF082-1T5',
        name: '电磁侧信道攻击',
        description: '通过分析电磁辐射窃取Titan安全密钥的密钥信息。效果：渗透+6，电磁分析成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，电磁侧信道攻击' }],
      } as Card,
    ],
  },
  {
    id: 'em_analyzer',
    name: '电磁分析者',
    nameEn: 'EM Analyzer',
    level: 82,
    type: '物理分析型敌人',
    attackStyle: '电磁辐射分析、信号截获',
    weakness: '物理屏蔽、距离限制',
    actionPoints: 5,
    handSize: 3,
    background: '专门分析硬件设备电磁辐射信号的攻击者。通过截获和分析Titan密钥产生的电磁辐射，重建密钥的敏感信息。',
    skills: [
      {
        id: 'signal_interception',
        name: '信号截获',
        type: 'active',
        description: '截获硬件设备的电磁辐射信号',
        effect: '查看目标手牌，并选择1张弃置，同时放置1个标记',
        cooldown: 2,
      },
      {
        id: 'key_reconstruction',
        name: '密钥重建',
        type: 'passive',
        description: '从电磁信号中重建密钥信息',
        effect: '每回合开始时，如果敌方标记总数≥4，则额外获得1行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF082-1T5',
        name: '电磁侧信道攻击',
        description: '通过分析电磁辐射窃取Titan安全密钥的密钥信息。效果：渗透+6，电磁分析成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，电磁侧信道攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第83关：照片里的秘密
// 主题：EXIF元数据、位置隐私
// ============================================

const LEVEL83_ENEMIES: EnemyCharacter[] = [
  {
    id: 'metadata_thief',
    name: '元数据窃取者',
    nameEn: 'Metadata Thief',
    level: 83,
    type: '信息收集型敌人',
    attackStyle: 'EXIF提取、位置追踪',
    weakness: '元数据清理、GPS关闭',
    actionPoints: 5,
    handSize: 3,
    background: '专门从照片EXIF元数据中提取敏感信息的攻击者。通过分析照片中的GPS坐标、拍摄设备等元数据，追踪用户位置和行踪。',
    skills: [
      {
        id: 'exif_extraction',
        name: 'EXIF提取',
        type: 'active',
        description: '从照片中提取GPS和设备信息',
        effect: '窃取目标1点信息资源，并在该区域放置1个标记',
        cooldown: 1,
      },
      {
        id: 'location_tracking',
        name: '位置追踪',
        type: 'passive',
        description: '通过照片元数据追踪用户行踪',
        effect: '当成功窃取信息资源时，额外放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF083-1T5',
        name: 'EXIF元数据窃取',
        description: '从照片EXIF元数据中提取GPS坐标、拍摄设备等敏感信息。效果：渗透+6，位置信息获取率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 3, funds: 3, information: 5 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，EXIF元数据窃取' }],
      } as Card,
    ],
  },
  {
    id: 'location_tracker',
    name: '位置追踪者',
    nameEn: 'Location Tracker',
    level: 83,
    type: '追踪型敌人',
    attackStyle: 'GPS追踪、行踪分析',
    weakness: '位置模糊、隐私保护',
    actionPoints: 5,
    handSize: 3,
    background: '利用照片GPS数据进行位置追踪的攻击者。通过分析用户分享的照片，精确获取用户的家庭住址、工作地点等敏感位置信息。',
    skills: [
      {
        id: 'gps_tracking',
        name: 'GPS追踪',
        type: 'active',
        description: '利用GPS坐标精确定位用户位置',
        effect: '选择1个区域，在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'movement_analysis',
        name: '行踪分析',
        type: 'passive',
        description: '分析用户移动模式和行为习惯',
        effect: '当在多个区域都有标记时，所有区域友方标记每回合-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF083-1T5',
        name: 'EXIF元数据窃取',
        description: '从照片EXIF元数据中提取GPS坐标、拍摄设备等敏感信息。效果：渗透+6，位置信息获取率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 3, funds: 3, information: 5 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，EXIF元数据窃取' }],
      } as Card,
    ],
  },
];

// ============================================
// 第84关：操纵"天眼"
// 主题：AWDL协议、零点击攻击
// ============================================

const LEVEL84_ENEMIES: EnemyCharacter[] = [
  {
    id: 'awdl_exploiter',
    name: 'AWDL漏洞利用者',
    nameEn: 'AWDL Exploiter',
    level: 84,
    type: '协议攻击型敌人',
    attackStyle: '协议漏洞利用、零点击攻击',
    weakness: '协议关闭、网络隔离',
    actionPoints: 6,
    handSize: 4,
    background: '利用苹果AWDL协议漏洞进行零点击远程攻击的高级威胁。无需用户交互即可远程执行恶意代码，完全控制目标iOS设备。',
    skills: [
      {
        id: 'awdl_injection',
        name: 'AWDL注入',
        type: 'active',
        description: '利用AWDL协议漏洞注入恶意代码',
        effect: '在目标区域放置2个标记，该区域友方下回合行动点-1',
        cooldown: 2,
      },
      {
        id: 'zero_click_exploit',
        name: '零点击利用',
        type: 'passive',
        description: '无需用户交互即可执行攻击',
        effect: '首次进入区域时自动放置1个标记，无需消耗行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF084-1T5',
        name: 'AWDL协议漏洞利用',
        description: '利用苹果AWDL协议漏洞实施零点击远程代码执行攻击。效果：渗透+6，零点击攻击成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，AWDL协议漏洞利用' }],
      } as Card,
    ],
  },
  {
    id: 'zero_click_attacker',
    name: '零点击攻击者',
    nameEn: 'Zero-Click Attacker',
    level: 84,
    type: '高级威胁型敌人',
    attackStyle: '零交互攻击、隐蔽渗透',
    weakness: '行为检测、异常监控',
    actionPoints: 5,
    handSize: 3,
    background: '专门实施零点击攻击的APT组织。通过复杂的漏洞利用链，在完全不需要用户交互的情况下入侵目标设备，极难被发现。',
    skills: [
      {
        id: 'silent_infiltration',
        name: '静默渗透',
        type: 'active',
        description: '无声无息地渗透目标系统',
        effect: '放置1个标记，该标记在下回合开始前无法被检测',
        cooldown: 2,
      },
      {
        id: 'exploit_chain',
        name: '漏洞利用链',
        type: 'passive',
        description: '组合多个漏洞实现深度入侵',
        effect: '当在同一区域有≥2个标记时，所有技能效果+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF084-1T5',
        name: 'AWDL协议漏洞利用',
        description: '利用苹果AWDL协议漏洞实施零点击远程代码执行攻击。效果：渗透+6，零点击攻击成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 4,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，AWDL协议漏洞利用' }],
      } as Card,
    ],
  },
];

// ============================================
// 第85关：隐蔽的深水炸弹
// 主题：水坑攻击、Chrome漏洞
// ============================================

const LEVEL85_ENEMIES: EnemyCharacter[] = [
  {
    id: 'watering_hole_attacker',
    name: '水坑攻击部署者',
    nameEn: 'Watering Hole Attacker',
    level: 85,
    type: '供应链攻击型敌人',
    attackStyle: '网站投毒、水坑攻击',
    weakness: '网站监控、威胁情报',
    actionPoints: 6,
    handSize: 4,
    background: '实施水坑攻击的高级威胁组织。通过入侵目标常访问的网站植入恶意代码，感染特定访客，实施针对性攻击。',
    skills: [
      {
        id: 'website_compromise',
        name: '网站入侵',
        type: 'active',
        description: '入侵常用网站植入恶意代码',
        effect: '在2个不同区域各放置1个标记',
        cooldown: 2,
      },
      {
        id: 'drive_by_download',
        name: '路过式下载',
        type: 'passive',
        description: '访客访问时自动下载恶意软件',
        effect: '当友方进入有敌方标记的区域时，自动受到1点伤害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF085-1T5',
        name: '水坑攻击部署',
        description: '入侵目标常访问的网站植入恶意代码，实施水坑攻击。效果：渗透+6，水坑攻击成功率80%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 4, information: 4 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，水坑攻击部署' }],
      } as Card,
    ],
  },
  {
    id: 'website_compromiser',
    name: '网站破坏者',
    nameEn: 'Website Compromiser',
    level: 85,
    type: '网站攻击型敌人',
    attackStyle: '网站篡改、恶意注入',
    weakness: 'WAF防护、代码审计',
    actionPoints: 5,
    handSize: 3,
    background: '专门入侵合法网站并植入恶意代码的攻击者。寻找存在漏洞的网站，将其变成分发恶意软件的平台，实施水坑攻击。',
    skills: [
      {
        id: 'malicious_injection',
        name: '恶意注入',
        type: 'active',
        description: '在网站中注入恶意JavaScript代码',
        effect: '在目标区域放置2个标记，友方在该区域使用卡牌时行动点消耗+1',
        cooldown: 2,
      },
      {
        id: 'traffic_redirection',
        name: '流量重定向',
        type: 'passive',
        description: '将网站流量重定向到恶意服务器',
        effect: '当友方标记被移除时，有30%概率在相邻区域生成1个新标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF085-1T5',
        name: '水坑攻击部署',
        description: '入侵目标常访问的网站植入恶意代码，实施水坑攻击。效果：渗透+6，水坑攻击成功率80%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 4, information: 4 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，水坑攻击部署' }],
      } as Card,
    ],
  },
];

// ============================================
// 第86关："凡尔赛"式聊天室被窃听
// 主题：ClubHouse、API安全、第三方风险
// ============================================

const LEVEL86_ENEMIES: EnemyCharacter[] = [
  {
    id: 'data_scraper',
    name: '数据拖库者',
    nameEn: 'Data Scraper',
    level: 86,
    type: '数据窃取型敌人',
    attackStyle: 'API遍历、数据拖库',
    weakness: 'API加固、访问控制',
    actionPoints: 6,
    handSize: 4,
    background: '利用ClubHouse API漏洞进行数据拖库的攻击者。通过遍历API接口获取大量用户数据，包括用户ID、房间信息等敏感数据。',
    skills: [
      {
        id: 'api_enumeration',
        name: 'API枚举',
        type: 'active',
        description: '枚举API端点获取大量数据',
        effect: '窃取目标2点信息资源，并在该区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'mass_data_collection',
        name: '大规模数据收集',
        type: 'passive',
        description: '批量收集用户和房间数据',
        effect: '每回合开始时，如果敌方标记总数≥4，则额外获得1行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF086-1T5',
        name: 'API遍历攻击',
        description: '利用ClubHouse API的可预测ID进行遍历攻击，批量获取用户数据。效果：渗透+6，API遍历成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，API遍历攻击' }],
      } as Card,
    ],
  },
  {
    id: 'voice_eavesdropper',
    name: '语音窃听者',
    nameEn: 'Voice Eavesdropper',
    level: 86,
    type: '监听型敌人',
    attackStyle: '语音截获、流量分析',
    weakness: '端到端加密、传输保护',
    actionPoints: 5,
    handSize: 3,
    background: '截获和分析ClubHouse语音聊天数据的攻击者。通过中间人攻击截获声网Agora传输的语音数据，获取私密对话内容。',
    skills: [
      {
        id: 'voice_interception',
        name: '语音截获',
        type: 'active',
        description: '截获语音聊天数据流',
        effect: '查看目标1张手牌，并窃取1点信息资源',
        cooldown: 2,
      },
      {
        id: 'traffic_analysis',
        name: '流量分析',
        type: 'passive',
        description: '分析网络流量获取通信信息',
        effect: '当友方使用通信类卡牌时，有40%概率被窃取1点资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF086-1T5',
        name: 'API遍历攻击',
        description: '利用ClubHouse API的可预测ID进行遍历攻击，批量获取用户数据。效果：渗透+6，API遍历成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，API遍历攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第87关：九年数据泄露
// 主题：供应链攻击、长期潜伏
// ============================================

const LEVEL87_ENEMIES: EnemyCharacter[] = [
  {
    id: 'long_term_thief',
    name: '长期潜伏窃取者',
    nameEn: 'Long-Term Thief',
    level: 87,
    type: 'APT型敌人',
    attackStyle: '长期潜伏、持续窃取',
    weakness: '威胁狩猎、异常检测',
    actionPoints: 6,
    handSize: 4,
    background: '在马航系统中潜伏长达九年的高级威胁。通过渗透第三方供应商系统，长期窃取Enrich会员数据而未被发现。',
    skills: [
      {
        id: 'persistent_data_theft',
        name: '持续数据窃取',
        type: 'active',
        description: '长期潜伏窃取会员数据',
        effect: '窃取目标1点信息资源，该窃取行为有50%概率不被发现',
        cooldown: 1,
      },
      {
        id: 'stealth_lurking',
        name: '隐蔽潜伏',
        type: 'passive',
        description: '在系统中长期隐藏避免检测',
        effect: '友方的检测类卡牌对此敌人有30%概率失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF087-1T5',
        name: '供应链渗透攻击',
        description: '通过渗透第三方供应商系统，长期潜伏窃取马航会员数据。效果：渗透+6，供应链渗透成功率80%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 4, information: 4 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，供应链渗透攻击' }],
      } as Card,
    ],
  },
  {
    id: 'supply_chain_infiltrator',
    name: '供应链渗透者',
    nameEn: 'Supply Chain Infiltrator',
    level: 87,
    type: '供应链攻击型敌人',
    attackStyle: '供应商渗透、间接攻击',
    weakness: '供应商审计、访问控制',
    actionPoints: 5,
    handSize: 3,
    background: '专门通过第三方供应商渗透目标组织的攻击者。利用供应商与目标之间的信任关系，绕过目标的安全防护进行攻击。',
    skills: [
      {
        id: 'vendor_compromise',
        name: '供应商入侵',
        type: 'active',
        description: '入侵第三方供应商系统',
        effect: '在目标区域放置2个标记，并使其进入"供应链感染"状态',
        cooldown: 2,
      },
      {
        id: 'trust_abuse',
        name: '信任滥用',
        type: 'passive',
        description: '滥用供应商与目标的信任关系',
        effect: '对工业区域造成的伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF087-1T5',
        name: '供应链渗透攻击',
        description: '通过渗透第三方供应商系统，长期潜伏窃取马航会员数据。效果：渗透+6，供应链渗透成功率80%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 4, information: 4 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，供应链渗透攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第88关：非法人脸采集
// 主题：人脸识别隐私、3·15曝光
// ============================================

const LEVEL88_ENEMIES: EnemyCharacter[] = [
  {
    id: 'illegal_face_collector',
    name: '非法人脸采集者',
    nameEn: 'Illegal Face Collector',
    level: 88,
    type: '隐私侵犯型敌人',
    attackStyle: '秘密采集、数据倒卖',
    weakness: '合规检查、法律监管',
    actionPoints: 6,
    handSize: 4,
    background: '在商场门店非法部署人脸识别摄像头，秘密采集顾客人脸信息的黑产组织。被3·15晚会曝光，违反个人信息保护法规。',
    skills: [
      {
        id: 'secret_collection',
        name: '秘密采集',
        type: 'active',
        description: '未经同意秘密采集人脸数据',
        effect: '窃取目标2点信息资源，并在该区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'data_monetization',
        name: '数据变现',
        type: 'passive',
        description: '将采集的人脸数据用于商业目的',
        effect: '每窃取2点信息资源，获得1点资金资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF088-1T5',
        name: '人脸数据采集',
        description: '利用非法人脸识别摄像头秘密采集顾客人脸生物特征数据。效果：渗透+6，人脸数据采集率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 3, funds: 5, information: 4 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，人脸数据采集' }],
      } as Card,
    ],
  },
  {
    id: 'camera_hacker',
    name: '摄像头入侵者',
    nameEn: 'Camera Hacker',
    level: 88,
    type: '设备攻击型敌人',
    attackStyle: '摄像头渗透、监控劫持',
    weakness: '设备加固、网络安全',
    actionPoints: 5,
    handSize: 3,
    background: '入侵商场监控摄像头系统的攻击者。通过控制摄像头获取实时人脸数据，或篡改摄像头功能进行其他恶意活动。',
    skills: [
      {
        id: 'camera_infiltration',
        name: '摄像头渗透',
        type: 'active',
        description: '渗透监控摄像头获取实时数据',
        effect: '控制目标区域1回合，期间友方无法在该区域放置标记',
        cooldown: 3,
      },
      {
        id: 'surveillance_hijacking',
        name: '监控劫持',
        type: 'passive',
        description: '劫持监控系统进行非法监控',
        effect: '当敌方在区域中的标记数≥3时，每回合额外窃取1点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF088-1T5',
        name: '人脸数据采集',
        description: '利用非法人脸识别摄像头秘密采集顾客人脸生物特征数据。效果：渗透+6，人脸数据采集率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 3, funds: 5, information: 4 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，人脸数据采集' }],
      } as Card,
    ],
  },
];

// ============================================
// 第89关：数据传输漏洞
// 主题：FTA漏洞、文件传输安全
// ============================================

const LEVEL89_ENEMIES: EnemyCharacter[] = [
  {
    id: 'fta_exploiter',
    name: 'FTA漏洞利用者',
    nameEn: 'FTA Exploiter',
    level: 89,
    type: '漏洞利用型敌人',
    attackStyle: 'FTA漏洞利用、后门部署',
    weakness: '系统更新、漏洞修补',
    actionPoints: 6,
    handSize: 4,
    background: '利用Accellion FTA文件传输设备漏洞进行攻击的威胁组织。通过FTA漏洞入侵系统，部署DEWMODE Web Shell后门进行长期控制。',
    skills: [
      {
        id: 'fta_exploitation',
        name: 'FTA漏洞利用',
        type: 'active',
        description: '利用FTA设备漏洞入侵系统',
        effect: '在目标区域放置2个标记，并窃取1点算力资源',
        cooldown: 2,
      },
      {
        id: 'dewmode_deployment',
        name: 'DEWMODE部署',
        type: 'passive',
        description: '部署Web Shell后门维持访问',
        effect: '当标记被移除后，有40%概率在下回合自动恢复1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF089-1T5',
        name: 'FTA漏洞利用',
        description: '利用Accellion FTA文件传输设备漏洞入侵系统，部署DEWMODE后门。效果：渗透+6，FTA漏洞利用成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，FTA漏洞利用' }],
      } as Card,
    ],
  },
  {
    id: 'dewmode_deployer',
    name: 'DEWMODE部署者',
    nameEn: 'DEWMODE Deployer',
    level: 89,
    type: '后门部署型敌人',
    attackStyle: 'Web Shell部署、持久化控制',
    weakness: '后门检测、系统加固',
    actionPoints: 5,
    handSize: 3,
    background: '专门部署DEWMODE Web Shell后门的攻击者。利用FTA等设备的漏洞植入后门，实现对目标系统的长期控制和数据窃取。',
    skills: [
      {
        id: 'webshell_implantation',
        name: 'Web Shell植入',
        type: 'active',
        description: '植入Web Shell后门维持持久访问',
        effect: '在目标区域放置1个"后门标记"，只能通过特定卡牌移除',
        cooldown: 3,
      },
      {
        id: 'persistent_access',
        name: '持久化访问',
        type: 'passive',
        description: '维持对目标系统的长期访问',
        effect: '每3回合自动在所有有敌方标记的区域各放置1个新标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF089-1T5',
        name: 'FTA漏洞利用',
        description: '利用Accellion FTA文件传输设备漏洞入侵系统，部署DEWMODE后门。效果：渗透+6，FTA漏洞利用成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，FTA漏洞利用' }],
      } as Card,
    ],
  },
];

// ============================================
// 第90关：黑客"扼住"美国的喉咙
// 主题：DarkSide勒索软件、Colonial Pipeline
// ============================================

const LEVEL90_ENEMIES: EnemyCharacter[] = [
  {
    id: 'darkside_operator',
    name: 'DarkSide运营者',
    nameEn: 'DarkSide Operator',
    level: 90,
    type: '勒索软件型敌人',
    attackStyle: '勒索加密、双重勒索',
    weakness: '备份恢复、网络隔离',
    actionPoints: 7,
    handSize: 5,
    background: 'DarkSide勒索软件组织的运营者。针对Colonial Pipeline发动勒索攻击，导致美国东海岸燃油供应中断，造成严重影响。',
    skills: [
      {
        id: 'ransomware_encryption',
        name: '勒索加密',
        type: 'active',
        description: '加密关键业务系统文件',
        effect: '对目标区域造成3点伤害，如果目标安全值<50%则伤害翻倍',
        cooldown: 2,
      },
      {
        id: 'double_extortion',
        name: '双重勒索',
        type: 'passive',
        description: '加密同时窃取数据威胁公开',
        effect: '当敌方标记数≥3时，每回合额外窃取1点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF090-1T5',
        name: 'DarkSide勒索攻击',
        description: '利用DarkSide勒索软件加密关键系统，实施双重勒索威胁。效果：渗透+6，勒索攻击成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，DarkSide勒索攻击' }],
      } as Card,
    ],
  },
  {
    id: 'ransomware_deployer',
    name: '勒索软件部署者',
    nameEn: 'Ransomware Deployer',
    level: 90,
    type: '恶意软件型敌人',
    attackStyle: '勒索软件部署、横向移动',
    weakness: 'EDR防护、网络分段',
    actionPoints: 6,
    handSize: 4,
    background: '专门部署勒索软件进行攻击的恶意攻击者。通过网络漏洞入侵系统，部署勒索软件加密文件，索要赎金。',
    skills: [
      {
        id: 'lateral_movement',
        name: '横向移动',
        type: 'active',
        description: '在网络中横向移动扩大感染范围',
        effect: '将1个区域的标记移动到相邻区域，并在原区域保留1个',
        cooldown: 2,
      },
      {
        id: 'mass_encryption',
        name: '大规模加密',
        type: 'passive',
        description: '同时加密多个系统的文件',
        effect: '当在多个区域都有标记时，所有区域友方标记每回合-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF090-1T5',
        name: 'DarkSide勒索攻击',
        description: '利用DarkSide勒索软件加密关键系统，实施双重勒索威胁。效果：渗透+6，勒索攻击成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，DarkSide勒索攻击' }],
      } as Card,
    ],
  },
  {
    id: 'vpn_credential_thief',
    name: 'VPN凭证窃取者',
    nameEn: 'VPN Credential Thief',
    level: 90,
    type: '凭证窃取型敌人',
    attackStyle: '凭证窃取、初始访问',
    weakness: 'MFA认证、凭证保护',
    actionPoints: 5,
    handSize: 3,
    background: '专门窃取VPN凭证以获取网络初始访问权限的攻击者。通过钓鱼或暴力破解获取VPN账号，为勒索软件攻击铺平道路。',
    skills: [
      {
        id: 'credential_theft',
        name: '凭证窃取',
        type: 'active',
        description: '窃取VPN账号密码等凭证',
        effect: '窃取目标1点信息资源，如果成功则在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'initial_access',
        name: '初始访问',
        type: 'passive',
        description: '利用窃取的凭证获得网络访问',
        effect: '首次进入区域时，自动额外放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF090-1T5',
        name: 'DarkSide勒索攻击',
        description: '利用DarkSide勒索软件加密关键系统，实施双重勒索威胁。效果：渗透+6，勒索攻击成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 3 },
        difficulty: 5,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，DarkSide勒索攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第91关：变身？打折？Clop有多凡尔赛！
// 主题：Clop勒索软件、FIN11、供应链攻击
// ============================================

const LEVEL91_ENEMIES: EnemyCharacter[] = [
  {
    id: 'clop_ransomware',
    name: 'Clop勒索软件',
    nameEn: 'Clop Ransomware',
    level: 91,
    type: '勒索软件型敌人',
    attackStyle: '供应链渗透、双重勒索',
    weakness: '供应链审计、零信任架构',
    actionPoints: 6,
    handSize: 4,
    background: 'Clop勒索软件由FIN11威胁组织运营，以利用GoAnywhere等供应链漏洞而闻名。它会加密受害者文件并窃取数据，威胁如果不支付赎金就公开数据，实施双重勒索。',
    skills: [
      {
        id: 'supply_chain_infiltration',
        name: '供应链渗透',
        type: 'active',
        description: '利用供应链弱点渗透目标系统',
        effect: '在目标区域放置2个敌方标记，并使其进入"供应链感染"状态',
        cooldown: 2,
      },
      {
        id: 'double_extortion',
        name: '双重勒索',
        type: 'passive',
        description: '加密文件同时窃取敏感数据',
        effect: '当敌方标记数≥3时，每回合额外窃取1点资源（随机类型）',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF091-1T5',
        name: 'Clop勒索渗透',
        description: '利用Clop勒索软件通过供应链漏洞渗透目标系统，实施双重勒索攻击。效果：渗透+7，供应链感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，Clop勒索渗透' }],
      } as Card,
    ],
  },
  {
    id: 'fin11_operator',
    name: 'FIN11运营者',
    nameEn: 'FIN11 Operator',
    level: 91,
    type: '威胁组织型敌人',
    attackStyle: '勒索运营、变现专家',
    weakness: '威胁情报、国际合作',
    actionPoints: 5,
    handSize: 3,
    background: 'FIN11是一个以财务利益为动机的威胁组织，专门运营Clop勒索软件。他们擅长利用新披露的漏洞，快速开发攻击工具，并通过勒索获取巨额利润。',
    skills: [
      {
        id: 'rapid_exploitation',
        name: '快速漏洞利用',
        type: 'active',
        description: '新漏洞披露后快速开发利用工具',
        effect: '掷骰子≥3则本回合行动点+2，可额外放置1个标记',
        cooldown: 2,
      },
      {
        id: 'ransom_negotiation',
        name: '勒索谈判',
        type: 'passive',
        description: '专业的勒索谈判技巧',
        effect: '当友方试图移除标记时，有30%概率阻止并反制',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF091-1T5',
        name: 'Clop勒索渗透',
        description: '利用Clop勒索软件通过供应链漏洞渗透目标系统，实施双重勒索攻击。效果：渗透+7，供应链感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，Clop勒索渗透' }],
      } as Card,
    ],
  },
  {
    id: 'goanywhere_exploiter',
    name: 'GoAnywhere漏洞利用者',
    nameEn: 'GoAnywhere Exploiter',
    level: 91,
    type: '漏洞利用型敌人',
    attackStyle: '文件传输漏洞、远程代码执行',
    weakness: '及时补丁、漏洞管理',
    actionPoints: 5,
    handSize: 3,
    background: '专门针对GoAnywhere MFT等文件传输解决方案的漏洞进行攻击。这类漏洞允许攻击者远程执行代码，是Clop勒索软件的主要入侵途径之一。',
    skills: [
      {
        id: 'fta_exploitation',
        name: '文件传输漏洞利用',
        type: 'active',
        description: '利用文件传输设备漏洞入侵',
        effect: '对文件传输区域造成双倍伤害，放置2个标记',
        cooldown: 2,
      },
      {
        id: 'rce_deployment',
        name: '远程代码执行',
        type: 'passive',
        description: '通过RCE漏洞部署恶意代码',
        effect: '首次进入区域时自动放置1个标记，无需消耗行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF091-1T5',
        name: 'Clop勒索渗透',
        description: '利用Clop勒索软件通过供应链漏洞渗透目标系统，实施双重勒索攻击。效果：渗透+7，供应链感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，Clop勒索渗透' }],
      } as Card,
    ],
  },
];

// ============================================
// 第92关：黑客开始薅服务器挖矿的羊毛了！
// 主题：GitHub Action挖矿、XMRing挖矿程序
// ============================================

const LEVEL92_ENEMIES: EnemyCharacter[] = [
  {
    id: 'github_miner',
    name: 'GitHub Action挖矿者',
    nameEn: 'GitHub Action Miner',
    level: 92,
    type: '资源窃取型敌人',
    attackStyle: 'CI/CD劫持、算力窃取',
    weakness: 'CI/CD审计、资源监控',
    actionPoints: 6,
    handSize: 4,
    background: '利用GitHub Actions等CI/CD平台进行恶意挖矿的攻击者。他们通过提交恶意工作流文件，在GitHub的服务器上运行XMRing等挖矿程序，免费窃取计算资源。',
    skills: [
      {
        id: 'cicd_hijacking',
        name: 'CI/CD劫持',
        type: 'active',
        description: '劫持CI/CD管道运行恶意代码',
        effect: '窃取目标2点算力资源，并在目标区域放置1个标记',
        cooldown: 1,
      },
      {
        id: 'stealth_mining',
        name: '隐蔽挖矿',
        type: 'passive',
        description: '隐藏挖矿行为避免检测',
        effect: '每回合有50%概率不消耗行动点即可放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF092-1T5',
        name: 'CI/CD挖矿劫持',
        description: '劫持GitHub Actions等CI/CD平台，利用服务器资源进行恶意挖矿。效果：渗透+6，算力窃取率92%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 2, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，CI/CD挖矿劫持' }],
      } as Card,
    ],
  },
  {
    id: 'xmring_deployer',
    name: 'XMRing部署者',
    nameEn: 'XMRing Deployer',
    level: 92,
    type: '恶意软件型敌人',
    attackStyle: '门罗币挖矿、资源耗尽',
    weakness: '进程监控、资源限制',
    actionPoints: 5,
    handSize: 3,
    background: 'XMRing是一款开源的门罗币挖矿程序，常被攻击者用于非法挖矿。它可以在Windows、Linux等多种系统上运行，消耗大量CPU资源为攻击者牟利。',
    skills: [
      {
        id: 'cpu_exhaustion',
        name: 'CPU资源耗尽',
        type: 'active',
        description: '消耗目标大量计算资源',
        effect: '目标下回合算力资源-2，敌方在该区域标记+1',
        cooldown: 2,
      },
      {
        id: 'persistent_mining',
        name: '持久化挖矿',
        type: 'passive',
        description: '建立持久化机制确保挖矿持续运行',
        effect: '当标记被移除时，有40%概率在相邻区域生成1个新标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF092-1T5',
        name: 'CI/CD挖矿劫持',
        description: '劫持GitHub Actions等CI/CD平台，利用服务器资源进行恶意挖矿。效果：渗透+6，算力窃取率92%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 2, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，CI/CD挖矿劫持' }],
      } as Card,
    ],
  },
  {
    id: 'crypto_jacker',
    name: '加密货币劫持者',
    nameEn: 'Crypto Jacker',
    level: 92,
    type: '资源滥用型敌人',
    attackStyle: '浏览器挖矿、脚本注入',
    weakness: '脚本拦截、浏览器安全',
    actionPoints: 5,
    handSize: 3,
    background: '通过网页脚本或恶意软件在用户设备上秘密挖矿的攻击者。他们利用访问者的浏览器算力挖掘加密货币，被称为"加密货币劫持"（Cryptojacking）。',
    skills: [
      {
        id: 'browser_injection',
        name: '浏览器脚本注入',
        type: 'active',
        description: '通过恶意网页脚本挖矿',
        effect: '对所有有友方标记的区域造成1点渗透伤害',
        cooldown: 2,
      },
      {
        id: 'mining_pool_connection',
        name: '矿池连接',
        type: 'passive',
        description: '连接到远程矿池获取挖矿任务',
        effect: '每回合开始时，如果敌方标记总数≥5，则额外获得1行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF092-1T5',
        name: 'CI/CD挖矿劫持',
        description: '劫持GitHub Actions等CI/CD平台，利用服务器资源进行恶意挖矿。效果：渗透+6，算力窃取率92%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 2, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，CI/CD挖矿劫持' }],
      } as Card,
    ],
  },
];

// ============================================
// 第93关：深度挖掘"白羊座计划"的隐藏信息
// 主题：白羊座计划、太空互联网、卫星网络安全
// ============================================

const LEVEL93_ENEMIES: EnemyCharacter[] = [
  {
    id: 'satellite_hijacker',
    name: '卫星链路劫持者',
    nameEn: 'Satellite Hijacker',
    level: 93,
    type: '通信劫持型敌人',
    attackStyle: '卫星通信拦截、信号欺骗',
    weakness: '通信加密、信号认证',
    actionPoints: 6,
    handSize: 4,
    background: '专门攻击太空互联网卫星通信链路的高级威胁。白羊座计划等项目旨在建立覆盖全球的卫星互联网，但卫星通信链路面临被拦截和欺骗的风险。',
    skills: [
      {
        id: 'signal_interception',
        name: '信号拦截',
        type: 'active',
        description: '拦截卫星通信信号获取敏感信息',
        effect: '查看目标手牌，并选择1张弃置，同时放置1个标记',
        cooldown: 2,
      },
      {
        id: 'spoofing_attack',
        name: '信号欺骗',
        type: 'passive',
        description: '发送虚假信号欺骗接收方',
        effect: '当友方在该区域放置标记时，有30%概率使其转为敌方标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF093-1T5',
        name: '卫星链路劫持',
        description: '劫持白羊座计划等太空互联网项目的卫星通信链路，实施中间人攻击。效果：渗透+7，卫星通信劫持率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，卫星链路劫持' }],
      } as Card,
    ],
  },
  {
    id: 'space_infrastructure_attacker',
    name: '太空基础设施攻击者',
    nameEn: 'Space Infrastructure Attacker',
    level: 93,
    type: '基础设施型敌人',
    attackStyle: '地面站攻击、卫星控制',
    weakness: '物理安全、访问控制',
    actionPoints: 5,
    handSize: 3,
    background: '针对太空互联网地面站和卫星控制系统的攻击者。通过入侵地面站，可以控制卫星或干扰卫星服务，对整个星座造成威胁。',
    skills: [
      {
        id: 'ground_station_breach',
        name: '地面站入侵',
        type: 'active',
        description: '入侵卫星地面控制站',
        effect: '控制目标区域2回合，期间友方无法在该区域放置标记',
        cooldown: 3,
      },
      {
        id: 'constellation_disruption',
        name: '星座干扰',
        type: 'passive',
        description: '干扰卫星星座正常运行',
        effect: '当敌方在多个区域都有标记时，所有友方区域每回合标记-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF093-1T5',
        name: '卫星链路劫持',
        description: '劫持白羊座计划等太空互联网项目的卫星通信链路，实施中间人攻击。效果：渗透+7，卫星通信劫持率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，卫星链路劫持' }],
      } as Card,
    ],
  },
  {
    id: 'aries_project_infiltrator',
    name: '白羊座计划渗透者',
    nameEn: 'Aries Project Infiltrator',
    level: 93,
    type: 'APT型敌人',
    attackStyle: '供应链攻击、长期潜伏',
    weakness: '供应链安全、威胁狩猎',
    actionPoints: 5,
    handSize: 3,
    background: '专门针对太空互联网项目的APT组织。他们通过渗透卫星制造商或软件供应商，在太空系统部署阶段就植入后门，实现长期潜伏。',
    skills: [
      {
        id: 'supply_chain_implant',
        name: '供应链植入',
        type: 'active',
        description: '在供应链阶段植入恶意代码',
        effect: '在目标区域放置1个"后门标记"，无法被常规手段移除',
        cooldown: 3,
      },
      {
        id: 'long_term_lurking',
        name: '长期潜伏',
        type: 'passive',
        description: '在系统中长期隐藏等待激活',
        effect: '前3回合不主动攻击，第4回合起每回合行动点+2',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF093-1T5',
        name: '卫星链路劫持',
        description: '劫持白羊座计划等太空互联网项目的卫星通信链路，实施中间人攻击。效果：渗透+7，卫星通信劫持率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，卫星链路劫持' }],
      } as Card,
    ],
  },
];

// ============================================
// 第94关：供应链感染？这款名为"老裁缝"的激活工具到底做了什么？
// 主题：老裁缝激活工具、供应链感染
// ============================================

const LEVEL94_ENEMIES: EnemyCharacter[] = [
  {
    id: 'old_tailor_activator',
    name: '老裁缝激活工具',
    nameEn: 'Old Tailor Activator',
    level: 94,
    type: '供应链型敌人',
    attackStyle: '激活工具投毒、后门植入',
    weakness: '软件审计、正版验证',
    actionPoints: 6,
    handSize: 4,
    background: '伪装成Windows激活工具的恶意软件。用户在寻求免费激活Windows时下载运行，实际上却在系统中植入了后门和恶意程序，成为供应链感染的典型案例。',
    skills: [
      {
        id: 'activator_poisoning',
        name: '激活工具投毒',
        type: 'active',
        description: '通过激活工具传播恶意软件',
        effect: '在目标区域放置2个标记，并感染该区域所有未受保护的软件',
        cooldown: 2,
      },
      {
        id: 'backdoor_implantation',
        name: '后门植入',
        type: 'passive',
        description: '在系统中建立持久化后门',
        effect: '当标记被移除后，下回合自动在原区域恢复1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF094-1T5',
        name: '激活工具投毒',
        description: '通过"老裁缝"等被投毒的Windows激活工具传播恶意代码，实施供应链感染。效果：渗透+7，供应链感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，激活工具投毒' }],
      } as Card,
    ],
  },
  {
    id: 'supply_chain_infector',
    name: '供应链感染者',
    nameEn: 'Supply Chain Infector',
    level: 94,
    type: '供应链攻击型敌人',
    attackStyle: '软件供应链污染、间接传播',
    weakness: '代码签名、软件完整性',
    actionPoints: 5,
    handSize: 3,
    background: '专门通过污染软件供应链进行传播的攻击者。他们不直接攻击目标，而是感染开发工具、第三方库或破解软件，间接感染大量用户。',
    skills: [
      {
        id: 'dependency_poisoning',
        name: '依赖投毒',
        type: 'active',
        description: '污染软件依赖库传播恶意代码',
        effect: '选择2个相邻区域，各放置1个标记',
        cooldown: 2,
      },
      {
        id: 'indirect_infection',
        name: '间接感染',
        type: 'passive',
        description: '通过合法软件间接感染系统',
        effect: '当友方使用"安装软件"类卡牌时，有40%概率在该区域额外放置1个敌方标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF094-1T5',
        name: '激活工具投毒',
        description: '通过"老裁缝"等被投毒的Windows激活工具传播恶意代码，实施供应链感染。效果：渗透+7，供应链感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，激活工具投毒' }],
      } as Card,
    ],
  },
  {
    id: 'crackware_distributor',
    name: '破解软件分发者',
    nameEn: 'Crackware Distributor',
    level: 94,
    type: '社会工程型敌人',
    attackStyle: '盗版软件、诱导下载',
    weakness: '安全意识、正版教育',
    actionPoints: 5,
    handSize: 3,
    background: '在各种论坛和下载站分发携带恶意代码的破解软件和激活工具。利用用户贪图免费的心理，诱导下载执行恶意程序。',
    skills: [
      {
        id: 'social_engineering_lure',
        name: '社会工程诱导',
        type: 'active',
        description: '利用免费诱惑诱导用户执行恶意程序',
        effect: '如果目标区域有友方标记，则额外放置1个标记并窃取1点资金',
        cooldown: 1,
      },
      {
        id: 'widespread_distribution',
        name: '广泛分发',
        type: 'passive',
        description: '通过多个渠道广泛传播恶意软件',
        effect: '每回合可以在额外1个区域放置标记（行动点消耗正常）',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF094-1T5',
        name: '激活工具投毒',
        description: '通过"老裁缝"等被投毒的Windows激活工具传播恶意代码，实施供应链感染。效果：渗透+7，供应链感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，激活工具投毒' }],
      } as Card,
    ],
  },
];

// ============================================
// 第95关：木马APP"钓鱼缉毒"，收网众多毒贩团体
// 主题：木马APP、AN0M、钓鱼执法
// ============================================

const LEVEL95_ENEMIES: EnemyCharacter[] = [
  {
    id: 'anom_platform',
    name: 'AN0M加密平台',
    nameEn: 'AN0M Platform',
    level: 95,
    type: '监控型敌人',
    attackStyle: '加密陷阱、全面监控',
    weakness: '端到端加密验证、开源审查',
    actionPoints: 6,
    handSize: 4,
    background: '表面上是安全的加密通信APP，实际上是执法部门部署的监控工具。AN0M平台被全球犯罪分子广泛使用，却不知所有通信都被执法机构实时监控，最终导致了大规模的"钓鱼执法"行动。',
    skills: [
      {
        id: 'encryption_trap',
        name: '加密陷阱',
        type: 'active',
        description: '伪装成安全通信工具实施监控',
        effect: '查看目标所有手牌和资源，放置2个标记',
        cooldown: 3,
      },
      {
        id: 'mass_surveillance',
        name: '大规模监控',
        type: 'passive',
        description: '监控所有通过平台的通信',
        effect: '每回合开始时，如果敌方标记总数≥4，则额外获得1行动点和1张手牌',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF095-1T5',
        name: 'AN0M加密陷阱',
        description: '部署类似AN0M的伪装加密通信APP，实施执法监控陷阱和情报收集。效果：渗透+8，监控覆盖率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，AN0M加密陷阱' }],
      } as Card,
    ],
  },
  {
    id: 'trojan_app_deployer',
    name: '木马APP部署者',
    nameEn: 'Trojan APP Deployer',
    level: 95,
    type: '移动恶意软件型敌人',
    attackStyle: '恶意APP、权限滥用',
    weakness: '应用商店审核、权限管理',
    actionPoints: 5,
    handSize: 3,
    background: '开发和分发伪装成合法应用的木马程序。这些APP看起来功能正常，但后台却在收集用户数据、监听通信或控制设备。',
    skills: [
      {
        id: 'permission_abuse',
        name: '权限滥用',
        type: 'active',
        description: '滥用APP权限获取敏感信息',
        effect: '窃取目标1点信息资源，并在该区域放置1个标记',
        cooldown: 1,
      },
      {
        id: 'app_disguise',
        name: '应用伪装',
        type: 'passive',
        description: '伪装成正常应用避免检测',
        effect: '友方在该区域使用"检测"类卡牌时，有40%概率失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF095-1T5',
        name: 'AN0M加密陷阱',
        description: '部署类似AN0M的伪装加密通信APP，实施执法监控陷阱和情报收集。效果：渗透+8，监控覆盖率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，AN0M加密陷阱' }],
      } as Card,
    ],
  },
  {
    id: 'law_enforcement_honeypot',
    name: '执法蜜罐',
    nameEn: 'Law Enforcement Honeypot',
    level: 95,
    type: '蜜罐型敌人',
    attackStyle: '诱捕执法、情报收集',
    weakness: '匿名验证、零信任',
    actionPoints: 5,
    handSize: 3,
    background: '执法部门部署的蜜罐系统，专门用于诱捕网络犯罪分子。通过提供看似非法的服务或工具，吸引犯罪分子上钩并收集证据。',
    skills: [
      {
        id: 'criminal_entrapment',
        name: '犯罪诱捕',
        type: 'active',
        description: '诱使目标暴露犯罪证据',
        effect: '如果目标在该区域有≥3个标记，则将其全部转为敌方标记',
        cooldown: 3,
      },
      {
        id: 'evidence_collection',
        name: '证据收集',
        type: 'passive',
        description: '收集犯罪活动的数字证据',
        effect: '每回合记录友方在该区域的所有行动，用于后续反制',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF095-1T5',
        name: 'AN0M加密陷阱',
        description: '部署类似AN0M的伪装加密通信APP，实施执法监控陷阱和情报收集。效果：渗透+8，监控覆盖率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，AN0M加密陷阱' }],
      } as Card,
    ],
  },
];

// ============================================
// 第96关：黑客也有粗心大意的时候——Incaseformat蠕虫病毒
// 主题：Incaseformat蠕虫、逻辑炸弹
// ============================================

const LEVEL96_ENEMIES: EnemyCharacter[] = [
  {
    id: 'incaseformat_worm',
    name: 'Incaseformat蠕虫',
    nameEn: 'Incaseformat Worm',
    level: 96,
    type: '蠕虫病毒型敌人',
    attackStyle: '日期触发、格式化破坏',
    weakness: '日期检查、文件备份',
    actionPoints: 6,
    handSize: 4,
    background: '一款因程序员粗心导致的蠕虫病毒。它本应在特定日期触发格式化操作，但由于日期计算错误，提前触发了破坏行为。这提醒我们即使黑客也会犯错。',
    skills: [
      {
        id: 'date_trigger',
        name: '日期触发器',
        type: 'active',
        description: '在特定日期执行恶意操作',
        effect: '掷骰子，若点数≥4则对所有区域造成2点伤害',
        cooldown: 3,
      },
      {
        id: 'format_destruction',
        name: '格式化破坏',
        type: 'passive',
        description: '格式化目标磁盘数据',
        effect: '当友方标记被移除时，该区域友方下回合行动点-1',
      },
    ],
  },
  {
    id: 'logic_bomb_implanter',
    name: '逻辑炸弹植入者',
    nameEn: 'Logic Bomb Implanter',
    level: 96,
    type: '逻辑炸弹型敌人',
    attackStyle: '条件触发、定时破坏',
    weakness: '代码审计、静态分析',
    actionPoints: 5,
    handSize: 3,
    background: '在程序中植入逻辑炸弹的攻击者。逻辑炸弹是满足特定条件（如日期、事件）时才会触发的恶意代码，平时潜伏难以发现。',
    skills: [
      {
        id: 'conditional_trigger',
        name: '条件触发',
        type: 'active',
        description: '设置特定条件触发恶意行为',
        effect: '在目标区域放置1个"逻辑炸弹标记"，3回合后自动爆发造成3点伤害',
        cooldown: 2,
      },
      {
        id: 'stealth_implantation',
        name: '隐蔽植入',
        type: 'passive',
        description: '将恶意代码隐藏在正常程序中',
        effect: '放置的标记在首次被检测时有50%概率不被发现',
      },
    ],
  },
  {
    id: 'careless_coder',
    name: '粗心程序员',
    nameEn: 'Careless Coder',
    level: 96,
    type: '错误型敌人',
    attackStyle: '代码错误、意外破坏',
    weakness: '代码审查、测试验证',
    actionPoints: 4,
    handSize: 3,
    background: '因编程错误导致安全问题的开发者。Incaseformat蠕虫就是由于日期计算逻辑错误导致的，提醒我们要重视代码质量和测试。',
    skills: [
      {
        id: 'coding_error',
        name: '编程错误',
        type: 'active',
        description: '因代码错误产生意外行为',
        effect: '随机效果：50%概率对友方造成1点伤害，50%概率对敌方造成2点伤害',
        cooldown: 1,
      },
      {
        id: 'unexpected_behavior',
        name: '意外行为',
        type: 'passive',
        description: '程序产生未预期的行为',
        effect: '每回合掷骰子，若点数=1则本回合所有技能效果反转',
      },
    ],
  },
];

// ============================================
// 第97关：警惕！钓鱼WI-FI可能让手机变"砖头"
// 主题：钓鱼WiFi、格式化字符串漏洞
// ============================================

const LEVEL97_ENEMIES: EnemyCharacter[] = [
  {
    id: 'rogue_wifi_ap',
    name: '钓鱼WiFi热点',
    nameEn: 'Rogue WiFi AP',
    level: 97,
    type: '无线攻击型敌人',
    attackStyle: '虚假热点、中间人攻击',
    weakness: '证书固定、VPN加密',
    actionPoints: 6,
    handSize: 4,
    background: '伪装成免费WiFi的恶意热点。用户连接后，攻击者可以截获所有通信流量，甚至通过漏洞直接控制用户设备，严重时可导致设备变"砖头"。',
    skills: [
      {
        id: 'evil_twin_attack',
        name: '邪恶双胞胎攻击',
        type: 'active',
        description: '伪装成合法WiFi热点',
        effect: '目标必须弃置1张手牌，否则在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'traffic_interception',
        name: '流量拦截',
        type: 'passive',
        description: '截获通过热点的所有网络流量',
        effect: '当友方在该区域使用网络类卡牌时，有50%概率被窃取1点资源',
      },
    ],
  },
  {
    id: 'format_string_attacker',
    name: '格式化字符串攻击者',
    nameEn: 'Format String Attacker',
    level: 97,
    type: '内存攻击型敌人',
    attackStyle: '格式化字符串漏洞、内存破坏',
    weakness: '输入验证、安全编码',
    actionPoints: 5,
    handSize: 3,
    background: '利用格式化字符串漏洞进行攻击的黑客。这类漏洞允许攻击者读取或写入任意内存地址，可导致信息泄露、程序崩溃甚至远程代码执行。',
    skills: [
      {
        id: 'memory_corruption',
        name: '内存破坏',
        type: 'active',
        description: '利用格式化字符串漏洞破坏内存',
        effect: '对目标造成3点伤害，如果目标有防御标记则无视防御',
        cooldown: 2,
      },
      {
        id: 'arbitrary_read',
        name: '任意内存读取',
        type: 'passive',
        description: '读取任意内存地址的敏感数据',
        effect: '每回合开始时，查看目标1张手牌并将其复制为己方手牌',
      },
    ],
  },
  {
    id: 'device_bricker',
    name: '设备破坏者',
    nameEn: 'Device Bricker',
    level: 97,
    type: '破坏型敌人',
    attackStyle: '固件破坏、设备变砖',
    weakness: '固件保护、恢复模式',
    actionPoints: 5,
    handSize: 3,
    background: '专门破坏设备固件使设备无法使用的攻击者。通过WiFi连接利用漏洞刷入恶意固件，可导致手机等设备永久变"砖头"。',
    skills: [
      {
        id: 'firmware_corruption',
        name: '固件破坏',
        type: 'active',
        description: '破坏设备固件使其无法启动',
        effect: '如果目标区域友方标记≤2，则将其全部移除且本回合无法恢复',
        cooldown: 3,
      },
      {
        id: 'permanent_damage',
        name: '永久损坏',
        type: 'passive',
        description: '造成难以修复的硬件级损坏',
        effect: '被此敌人移除的标记需要2回合才能恢复',
      },
    ],
  },
];

// ============================================
// 第98关：大东话安全丨全量模型丢失，到底谁之过？
// 主题：AI模型安全、模型丢失
// ============================================

const LEVEL98_ENEMIES: EnemyCharacter[] = [
  {
    id: 'model_thief',
    name: '模型窃取者',
    nameEn: 'Model Thief',
    level: 98,
    type: 'AI攻击型敌人',
    attackStyle: '模型提取、API滥用',
    weakness: '查询限制、模型水印',
    actionPoints: 6,
    handSize: 4,
    background: '通过大量查询AI模型API来窃取模型参数和架构的攻击者。模型是AI公司的核心资产，模型窃取会导致知识产权严重损失。',
    skills: [
      {
        id: 'model_extraction',
        name: '模型提取',
        type: 'active',
        description: '通过查询提取模型知识',
        effect: '窃取目标2点信息资源，如果目标信息≥5则额外放置1个标记',
        cooldown: 2,
      },
      {
        id: 'api_abuse',
        name: 'API滥用',
        type: 'passive',
        description: '大量查询以复制模型功能',
        effect: '每回合可以额外进行1次攻击（需消耗行动点）',
      },
    ],
  },
  {
    id: 'ai_ip_pirate',
    name: 'AI知识产权海盗',
    nameEn: 'AI IP Pirate',
    level: 98,
    type: '知识产权型敌人',
    attackStyle: '模型复制、商业窃取',
    weakness: '法律保护、技术保护',
    actionPoints: 5,
    handSize: 3,
    background: '专门窃取AI模型用于商业竞争或非法牟利的组织。他们不仅窃取模型，还可能将其用于对抗性攻击或开发竞争产品。',
    skills: [
      {
        id: 'commercial_theft',
        name: '商业窃取',
        type: 'active',
        description: '窃取模型用于商业目的',
        effect: '窃取目标1点资金资源，如果成功则在该区域放置1个标记',
        cooldown: 1,
      },
      {
        id: 'model_replication',
        name: '模型复制',
        type: 'passive',
        description: '复制被窃取模型的功能',
        effect: '当友方使用与AI相关的卡牌时，有30%概率复制该卡牌效果',
      },
    ],
  },
  {
    id: 'insider_threat_ai',
    name: 'AI内部威胁',
    nameEn: 'AI Insider Threat',
    level: 98,
    type: '内部威胁型敌人',
    attackStyle: '内部泄露、权限滥用',
    weakness: '访问控制、行为监控',
    actionPoints: 5,
    handSize: 3,
    background: '具有合法访问权限的内部人员，滥用权限窃取AI模型或训练数据。内部威胁是最难防范的安全风险之一。',
    skills: [
      {
        id: 'insider_access',
        name: '内部访问',
        type: 'active',
        description: '利用内部权限获取敏感数据',
        effect: '无视目标防御直接放置2个标记',
        cooldown: 3,
      },
      {
        id: 'privilege_abuse',
        name: '权限滥用',
        type: 'passive',
        description: '滥用合法权限进行恶意操作',
        effect: '友方的防御类卡牌对此敌人效果减半',
      },
    ],
  },
];

// ============================================
// 第99关：远程操纵，隔空冒充——笔记本电脑的新远程漏洞
// 主题：远程漏洞、BIOS/UEFI固件攻击
// ============================================

const LEVEL99_ENEMIES: EnemyCharacter[] = [
  {
    id: 'firmware_attacker',
    name: '固件攻击者',
    nameEn: 'Firmware Attacker',
    level: 99,
    type: '固件型敌人',
    attackStyle: 'BIOS/UEFI攻击、持久化控制',
    weakness: '固件签名、安全启动',
    actionPoints: 6,
    handSize: 4,
    background: '专门攻击BIOS/UEFI固件的攻击者。通过利用固件漏洞，可以在操作系统之下获得持久化控制，即使重装系统也无法清除。',
    skills: [
      {
        id: 'bios_exploitation',
        name: 'BIOS漏洞利用',
        type: 'active',
        description: '利用BIOS/UEFI漏洞获得底层控制',
        effect: '在目标区域放置2个标记，该区域友方下回合无法使用防御卡牌',
        cooldown: 2,
      },
      {
        id: 'persistent_implant',
        name: '持久化植入',
        type: 'passive',
        description: '在固件层建立难以清除的后门',
        effect: '每回合开始时，如果敌方标记被移除超过2个，则自动恢复1个',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF099-1T5',
        name: '固件级渗透',
        description: '利用BIOS/UEFI固件漏洞实施底层渗透攻击，建立持久化控制。效果：渗透+8，固件感染率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，固件级渗透' }],
      } as Card,
    ],
  },
  {
    id: 'remote_manipulator',
    name: '远程操纵者',
    nameEn: 'Remote Manipulator',
    level: 99,
    type: '远程攻击型敌人',
    attackStyle: '远程漏洞利用、隔空控制',
    weakness: '网络隔离、漏洞修补',
    actionPoints: 5,
    handSize: 3,
    background: '利用笔记本电脑远程管理功能（如Intel AMT）漏洞的攻击者。可以在不接触设备的情况下远程控制目标系统，甚至模拟键盘鼠标操作。',
    skills: [
      {
        id: 'amt_exploitation',
        name: 'AMT漏洞利用',
        type: 'active',
        description: '利用Intel AMT等远程管理功能',
        effect: '控制目标1回合，期间目标无法行动且敌方可在该区域免费放置1个标记',
        cooldown: 3,
      },
      {
        id: 'remote_impersonation',
        name: '远程冒充',
        type: 'passive',
        description: '冒充合法管理员进行远程操作',
        effect: '友方无法确定此敌人的具体位置，直到被攻击',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF099-1T5',
        name: '固件级渗透',
        description: '利用BIOS/UEFI固件漏洞实施底层渗透攻击，建立持久化控制。效果：渗透+8，固件感染率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，固件级渗透' }],
      } as Card,
    ],
  },
  {
    id: 'hardware_implanter',
    name: '硬件植入者',
    nameEn: 'Hardware Implanter',
    level: 99,
    type: '硬件型敌人',
    attackStyle: '硬件植入、供应链攻击',
    weakness: '硬件审计、供应链验证',
    actionPoints: 5,
    handSize: 3,
    background: '在硬件生产或物流环节植入恶意芯片或修改固件的攻击者。这种攻击极其隐蔽，可以在设备出厂时就植入后门。',
    skills: [
      {
        id: 'chip_implantation',
        name: '芯片植入',
        type: 'active',
        description: '植入恶意硬件芯片',
        effect: '在目标区域放置1个"硬件后门标记"，只能通过特定卡牌移除',
        cooldown: 3,
      },
      {
        id: 'supply_chain_tampering',
        name: '供应链篡改',
        type: 'passive',
        description: '在供应链环节篡改硬件',
        effect: '首次进入区域时自动放置2个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF099-1T5',
        name: '固件级渗透',
        description: '利用BIOS/UEFI固件漏洞实施底层渗透攻击，建立持久化控制。效果：渗透+8，固件感染率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，固件级渗透' }],
      } as Card,
    ],
  },
];

// ============================================
// 第100关：勒索软件抱团重生，BlackMatter勒索王回归
// 主题：BlackMatter勒索软件、RaaS
// ============================================

const LEVEL100_ENEMIES: EnemyCharacter[] = [
  {
    id: 'blackmatter_ransomware',
    name: 'BlackMatter勒索软件',
    nameEn: 'BlackMatter Ransomware',
    level: 100,
    type: '勒索软件型敌人',
    attackStyle: 'RaaS运营、高级加密',
    weakness: '备份恢复、网络隔离',
    actionPoints: 6,
    handSize: 4,
    background: 'BlackMatter是DarkSide和REvil等勒索软件组织的"继承者"，采用RaaS（勒索软件即服务）模式运营。它融合了多个前辈的优点，具有更强的逃避检测能力和更快的加密速度。',
    skills: [
      {
        id: 'advanced_encryption',
        name: '高级加密',
        type: 'active',
        description: '快速加密目标文件',
        effect: '对目标区域造成3点伤害，如果目标安全值<50%则伤害翻倍',
        cooldown: 2,
      },
      {
        id: 'evasion_techniques',
        name: '逃避技术',
        type: 'passive',
        description: '使用多种技术逃避安全检测',
        effect: '友方的检测类卡牌对此敌人有30%概率失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF100-1T5',
        name: 'RaaS勒索服务',
        description: '利用RaaS模式提供勒索软件服务，实施规模化勒索攻击。效果：渗透+8，勒索成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 5, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，RaaS勒索服务' }],
      } as Card,
    ],
  },
  {
    id: 'raas_operator',
    name: 'RaaS运营者',
    nameEn: 'RaaS Operator',
    level: 100,
    type: '勒索组织型敌人',
    attackStyle: '勒索服务、 affiliate 招募',
    weakness: '资金追踪、国际合作',
    actionPoints: 5,
    handSize: 3,
    background: 'RaaS（勒索软件即服务）平台的运营者。他们开发勒索软件并将其"出租"给affiliate（附属机构），从中抽取赎金分成，形成完整的勒索产业链。',
    skills: [
      {
        id: 'affiliate_management',
        name: 'Affiliate管理',
        type: 'active',
        description: '招募和管理附属攻击者',
        effect: '召唤1个"附属攻击者"标记（视为额外敌人标记）',
        cooldown: 3,
      },
      {
        id: 'ransom_negotiation_expert',
        name: '赎金谈判专家',
        type: 'passive',
        description: '专业的赎金谈判和定价策略',
        effect: '当友方试图恢复被加密区域时，行动点消耗+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF100-1T5',
        name: 'RaaS勒索服务',
        description: '利用RaaS模式提供勒索软件服务，实施规模化勒索攻击。效果：渗透+8，勒索成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 5, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，RaaS勒索服务' }],
      } as Card,
    ],
  },
  {
    id: 'data_extortionist',
    name: '数据敲诈者',
    nameEn: 'Data Extortionist',
    level: 100,
    type: '数据勒索型敌人',
    attackStyle: '数据窃取、公开威胁',
    weakness: '数据加密、泄露预防',
    actionPoints: 5,
    handSize: 3,
    background: '专门窃取敏感数据并威胁公开以勒索赎金的攻击者。即使受害者有备份可以恢复数据，也面临数据泄露的声誉和法律风险。',
    skills: [
      {
        id: 'data_theft',
        name: '数据窃取',
        type: 'active',
        description: '窃取敏感数据用于勒索',
        effect: '窃取目标2点信息资源，如果成功则放置1个标记',
        cooldown: 2,
      },
      {
        id: 'publication_threat',
        name: '公开威胁',
        type: 'passive',
        description: '威胁公开窃取的数据',
        effect: '当敌方标记数≥4时，每回合额外窃取1点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF100-1T5',
        name: 'RaaS勒索服务',
        description: '利用RaaS模式提供勒索软件服务，实施规模化勒索攻击。效果：渗透+8，勒索成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 5, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，RaaS勒索服务' }],
      } as Card,
    ],
  },
];

// ============================================
// 第101关：可怕的僵尸网络感染
// 主题：僵尸网络、Botnet、IoT设备
// ============================================

const LEVEL101_ENEMIES: EnemyCharacter[] = [
  {
    id: 'botnet_herder',
    name: '僵尸网络牧人',
    nameEn: 'Botnet Herder',
    level: 101,
    type: '僵尸网络型敌人',
    attackStyle: '设备感染、C2控制',
    weakness: '设备更新、网络监控',
    actionPoints: 7,
    handSize: 5,
    background: '控制和运营大规模僵尸网络的攻击者。他们通过感染路由器、摄像头等IoT设备，组建庞大的僵尸网络用于DDoS攻击、垃圾邮件发送或加密货币挖矿。',
    skills: [
      {
        id: 'device_recruitment',
        name: '设备招募',
        type: 'active',
        description: '感染新设备加入僵尸网络',
        effect: '在2个不同区域各放置1个标记',
        cooldown: 2,
      },
      {
        id: 'c2_command',
        name: 'C2指挥控制',
        type: 'passive',
        description: '通过命令控制服务器指挥僵尸网络',
        effect: '每回合开始时，如果敌方标记总数≥6，则额外获得2行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF101-1T5',
        name: 'IoT僵尸网络',
        description: '利用IoT设备组建僵尸网络，实施DDoS攻击或恶意挖矿。效果：渗透+8，设备感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，IoT僵尸网络' }],
      } as Card,
    ],
  },
  {
    id: 'iot_infector',
    name: 'IoT感染者',
    nameEn: 'IoT Infector',
    level: 101,
    type: 'IoT攻击型敌人',
    attackStyle: '弱密码利用、固件漏洞',
    weakness: '强密码、固件更新',
    actionPoints: 6,
    handSize: 4,
    background: '专门攻击IoT设备的恶意程序。利用默认密码、已知漏洞等方式感染设备，将其纳入僵尸网络。由于IoT设备安全性普遍较差且更新困难，成为僵尸网络的主要来源。',
    skills: [
      {
        id: 'default_password_exploit',
        name: '默认密码利用',
        type: 'active',
        description: '利用设备的默认或弱密码入侵',
        effect: '如果目标区域没有防御标记，则直接放置2个标记',
        cooldown: 2,
      },
      {
        id: 'firmware_exploitation',
        name: '固件漏洞利用',
        type: 'passive',
        description: '利用IoT设备固件漏洞',
        effect: '对工业区域和IoT区域造成的伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF101-1T5',
        name: 'IoT僵尸网络',
        description: '利用IoT设备组建僵尸网络，实施DDoS攻击或恶意挖矿。效果：渗透+8，设备感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，IoT僵尸网络' }],
      } as Card,
    ],
  },
  {
    id: 'ddos_launcher',
    name: 'DDoS发射器',
    nameEn: 'DDoS Launcher',
    level: 101,
    type: 'DDoS型敌人',
    attackStyle: '流量洪水、服务瘫痪',
    weakness: '流量清洗、CDN防护',
    actionPoints: 6,
    handSize: 4,
    background: '利用僵尸网络发起DDoS攻击的恶意程序。通过协调大量受感染设备同时向目标发送请求，使目标服务因过载而瘫痪。',
    skills: [
      {
        id: 'traffic_flood',
        name: '流量洪水',
        type: 'active',
        description: '发起大规模DDoS攻击',
        effect: '对目标区域造成等同于敌方标记总数的伤害',
        cooldown: 3,
      },
      {
        id: 'coordinated_attack',
        name: '协同攻击',
        type: 'passive',
        description: '协调多个僵尸节点同时攻击',
        effect: '当在多个区域都有标记时，所有区域友方标记每回合-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF101-1T5',
        name: 'IoT僵尸网络',
        description: '利用IoT设备组建僵尸网络，实施DDoS攻击或恶意挖矿。效果：渗透+8，设备感染率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，IoT僵尸网络' }],
      } as Card,
    ],
  },
];

// ============================================
// 第102关：谁动了我的私有云数据？
// 主题：私有云安全、Zimbra漏洞
// ============================================

const LEVEL102_ENEMIES: EnemyCharacter[] = [
  {
    id: 'zimbra_exploiter',
    name: 'Zimbra漏洞利用者',
    nameEn: 'Zimbra Exploiter',
    level: 102,
    type: '邮件服务器型敌人',
    attackStyle: '邮件漏洞、远程代码执行',
    weakness: '及时补丁、邮件过滤',
    actionPoints: 7,
    handSize: 5,
    background: '专门利用Zimbra邮件服务器漏洞（如CVE-2022-41352）的攻击者。通过漏洞可以获取邮件服务器控制权，进而访问私有云中的敏感数据。',
    skills: [
      {
        id: 'zimbra_rce',
        name: 'Zimbra RCE',
        type: 'active',
        description: '利用Zimbra漏洞执行远程代码',
        effect: '在目标区域放置2个标记，并窃取1点信息资源',
        cooldown: 2,
      },
      {
        id: 'email_data_access',
        name: '邮件数据访问',
        type: 'passive',
        description: '访问邮件服务器中的敏感数据',
        effect: '每回合开始时，如果敌方在邮件区域有标记，则窃取1点随机资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF102-1T5',
        name: 'Zimbra漏洞利用',
        description: '利用Zimbra邮件服务器漏洞获取控制权，访问私有云敏感数据。效果：渗透+8，漏洞利用成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，Zimbra漏洞利用' }],
      } as Card,
    ],
  },
  {
    id: 'private_cloud_intruder',
    name: '私有云入侵者',
    nameEn: 'Private Cloud Intruder',
    level: 102,
    type: '云攻击型敌人',
    attackStyle: '横向移动、数据窃取',
    weakness: '网络分段、访问控制',
    actionPoints: 6,
    handSize: 4,
    background: '专门针对企业私有云环境的攻击者。通过漏洞或凭证泄露进入云环境后，进行横向移动，寻找并窃取高价值数据。',
    skills: [
      {
        id: 'lateral_movement_cloud',
        name: '云环境横向移动',
        type: 'active',
        description: '在云环境内横向移动扩大控制',
        effect: '将1个区域的标记移动到相邻区域，并在原区域保留1个',
        cooldown: 2,
      },
      {
        id: 'data_exfiltration',
        name: '数据渗出',
        type: 'passive',
        description: '将窃取的数据传出目标网络',
        effect: '当敌方标记数≥5时，每回合窃取2点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF102-1T5',
        name: 'Zimbra漏洞利用',
        description: '利用Zimbra邮件服务器漏洞获取控制权，访问私有云敏感数据。效果：渗透+8，漏洞利用成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，Zimbra漏洞利用' }],
      } as Card,
    ],
  },
  {
    id: 'cloud_misconfiguration_abuser',
    name: '云配置错误滥用者',
    nameEn: 'Cloud Misconfiguration Abuser',
    level: 102,
    type: '配置攻击型敌人',
    attackStyle: '配置错误利用、公开存储桶',
    weakness: '配置审计、安全基线',
    actionPoints: 6,
    handSize: 4,
    background: '专门寻找和利用云环境配置错误的攻击者。如公开访问的S3存储桶、过度宽松的IAM策略等，这些配置错误往往比漏洞更容易被利用。',
    skills: [
      {
        id: 'public_bucket_access',
        name: '公开存储桶访问',
        type: 'active',
        description: '访问配置错误的公开云存储',
        effect: '无需消耗行动点即可在目标区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'permission_escalation',
        name: '权限提升',
        type: 'passive',
        description: '利用错误配置提升访问权限',
        effect: '当进入新区域时，自动在该区域再放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF102-1T5',
        name: 'Zimbra漏洞利用',
        description: '利用Zimbra邮件服务器漏洞获取控制权，访问私有云敏感数据。效果：渗透+8，漏洞利用成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，Zimbra漏洞利用' }],
      } as Card,
    ],
  },
];

// ============================================
// 第103关：网络钓鱼屡试不爽，如何识别并抵制钓鱼邮件？
// 主题：钓鱼邮件、BEC、社会工程学
// ============================================

const LEVEL103_ENEMIES: EnemyCharacter[] = [
  {
    id: 'phishing_master',
    name: '钓鱼大师',
    nameEn: 'Phishing Master',
    level: 103,
    type: '社会工程型敌人',
    attackStyle: '钓鱼邮件、凭证窃取',
    weakness: '安全培训、邮件验证',
    actionPoints: 7,
    handSize: 5,
    background: '制作和发送高度逼真钓鱼邮件的专家。他们精心伪造发件人地址、邮件内容和登录页面，诱导受害者泄露账号密码等敏感信息。',
    skills: [
      {
        id: 'spear_phishing_email',
        name: '鱼叉式钓鱼邮件',
        type: 'active',
        description: '发送针对性的钓鱼邮件',
        effect: '目标必须弃置1张手牌或在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'credential_harvesting',
        name: '凭证收集',
        type: 'passive',
        description: '收集受害者泄露的账号密码',
        effect: '每成功放置2个标记，窃取目标1点随机资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF103-1T5',
        name: 'BEC商业诈骗',
        description: '实施商业邮件诈骗，冒充高管或供应商诱导转账。效果：渗透+8，诈骗成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 5, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，BEC商业诈骗' }],
      } as Card,
    ],
  },
  {
    id: 'bec_attacker',
    name: 'BEC攻击者',
    nameEn: 'BEC Attacker',
    level: 103,
    type: '商业诈骗型敌人',
    attackStyle: '商业邮件诈骗、财务欺诈',
    weakness: '财务流程、多因素验证',
    actionPoints: 6,
    handSize: 4,
    background: '实施商业邮件诈骗（BEC）的攻击者。他们冒充公司高管或供应商，通过邮件诱导财务人员转账或泄露敏感财务信息，造成巨大经济损失。',
    skills: [
      {
        id: 'executive_impersonation',
        name: '高管冒充',
        type: 'active',
        description: '冒充高管发送虚假转账指令',
        effect: '窃取目标3点资金资源，如果成功则放置1个标记',
        cooldown: 3,
      },
      {
        id: 'invoice_fraud',
        name: '发票欺诈',
        type: 'passive',
        description: '发送虚假发票骗取付款',
        effect: '每回合有50%概率额外窃取1点资金资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF103-1T5',
        name: 'BEC商业诈骗',
        description: '实施商业邮件诈骗，冒充高管或供应商诱导转账。效果：渗透+8，诈骗成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 5, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，BEC商业诈骗' }],
      } as Card,
    ],
  },
  {
    id: 'social_engineer',
    name: '社会工程师',
    nameEn: 'Social Engineer',
    level: 103,
    type: '心理操控型敌人',
    attackStyle: '心理操控、信任利用',
    weakness: '安全意识、验证机制',
    actionPoints: 6,
    handSize: 4,
    background: '利用人类心理弱点进行攻击的社会工程专家。他们通过建立信任、制造紧迫感或利用权威等手段，诱导目标做出有利于攻击者的行为。',
    skills: [
      {
        id: 'trust_building',
        name: '信任建立',
        type: 'active',
        description: '建立虚假信任关系',
        effect: '目标下回合无法对该敌人使用攻击类卡牌',
        cooldown: 2,
      },
      {
        id: 'urgency_manipulation',
        name: '紧迫感操控',
        type: 'passive',
        description: '制造紧迫感促使目标匆忙决策',
        effect: '友方在该区域使用卡牌时，有30%概率因"匆忙"而效果减半',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF103-1T5',
        name: 'BEC商业诈骗',
        description: '实施商业邮件诈骗，冒充高管或供应商诱导转账。效果：渗透+8，诈骗成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 5, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，BEC商业诈骗' }],
      } as Card,
    ],
  },
];

// ============================================
// 第104关：PVP对战不只有"攻击敌方水晶"——游戏世界中的攻击者伺机而动
// 主题：游戏安全、游戏挖矿、Mod风险
// ============================================

const LEVEL104_ENEMIES: EnemyCharacter[] = [
  {
    id: 'game_miner',
    name: '游戏内挖矿者',
    nameEn: 'In-Game Miner',
    level: 104,
    type: '游戏作弊型敌人',
    attackStyle: '游戏挖矿、资源窃取',
    weakness: '反作弊系统、游戏监控',
    actionPoints: 7,
    handSize: 5,
    background: '在游戏中植入挖矿程序的攻击者。他们利用游戏Mod、外挂或作弊工具，在玩家游戏时秘密使用其计算资源挖掘加密货币。',
    skills: [
      {
        id: 'stealth_mining_game',
        name: '隐蔽游戏挖矿',
        type: 'active',
        description: '在游戏中隐蔽挖矿',
        effect: '窃取目标2点算力资源，并在该区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'cheat_disguise',
        name: '作弊伪装',
        type: 'passive',
        description: '将挖矿程序伪装成游戏作弊工具',
        effect: '当友方使用"游戏辅助"类卡牌时，有50%概率被感染',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF104-1T5',
        name: '游戏内挖矿',
        description: '在游戏中植入挖矿程序，利用玩家计算资源挖掘加密货币。效果：渗透+8，挖矿隐蔽率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，游戏内挖矿' }],
      } as Card,
    ],
  },
  {
    id: 'malicious_mod_dev',
    name: '恶意Mod开发者',
    nameEn: 'Malicious Mod Developer',
    level: 104,
    type: 'Mod攻击型敌人',
    attackStyle: '恶意Mod、后门植入',
    weakness: 'Mod审核、代码审查',
    actionPoints: 6,
    handSize: 4,
    background: '开发携带恶意代码的游戏Mod的开发者。玩家在下载安装这些Mod时，不知不觉中将恶意程序引入自己的系统。',
    skills: [
      {
        id: 'backdoored_mod',
        name: '后门Mod',
        type: 'active',
        description: '发布携带后门的游戏Mod',
        effect: '在目标区域放置2个标记，这些标记需要2回合才能完全移除',
        cooldown: 2,
      },
      {
        id: 'mod_popularity_exploit',
        name: 'Mod热度利用',
        type: 'passive',
        description: '利用热门Mod传播恶意代码',
        effect: '每回合可以在额外1个区域放置标记（如果该区域与游戏相关）',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF104-1T5',
        name: '游戏内挖矿',
        description: '在游戏中植入挖矿程序，利用玩家计算资源挖掘加密货币。效果：渗透+8，挖矿隐蔽率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，游戏内挖矿' }],
      } as Card,
    ],
  },
  {
    id: 'game_account_thief',
    name: '游戏账号窃贼',
    nameEn: 'Game Account Thief',
    level: 104,
    type: '账号窃取型敌人',
    attackStyle: '账号盗取、虚拟财产窃取',
    weakness: '双因素认证、账号保护',
    actionPoints: 6,
    handSize: 4,
    background: '专门窃取游戏账号和虚拟财产的攻击者。游戏账号往往绑定了大量虚拟物品和真实货币，成为黑客的重要目标。',
    skills: [
      {
        id: 'account_hijacking',
        name: '账号劫持',
        type: 'active',
        description: '劫持游戏玩家账号',
        effect: '窃取目标2点信息资源和1点资金资源',
        cooldown: 2,
      },
      {
        id: 'virtual_asset_theft',
        name: '虚拟资产窃取',
        type: 'passive',
        description: '窃取账号内的虚拟物品和货币',
        effect: '每成功窃取资源，额外获得1点资金资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF104-1T5',
        name: '游戏内挖矿',
        description: '在游戏中植入挖矿程序，利用玩家计算资源挖掘加密货币。效果：渗透+8，挖矿隐蔽率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，游戏内挖矿' }],
      } as Card,
    ],
  },
];

// ============================================
// 第105关："变脸"软件成黑产帮凶
// 主题：AI换脸、Deepfake、黑产
// ============================================

const LEVEL105_ENEMIES: EnemyCharacter[] = [
  {
    id: 'deepfake_creator',
    name: 'Deepfake制作者',
    nameEn: 'Deepfake Creator',
    level: 105,
    type: 'AI伪造型敌人',
    attackStyle: 'AI换脸、视频伪造',
    weakness: 'Deepfake检测、源头验证',
    actionPoints: 7,
    handSize: 5,
    background: '使用AI技术制作虚假视频和音频的黑产从业者。他们利用深度学习技术将目标人物的脸部替换到视频中，用于诈骗、勒索或制作非法内容。',
    skills: [
      {
        id: 'face_swap_fraud',
        name: '换脸欺诈',
        type: 'active',
        description: '制作虚假视频进行身份冒充',
        effect: '目标必须弃置2张手牌，否则在该区域放置3个标记',
        cooldown: 3,
      },
      {
        id: 'voice_cloning',
        name: '语音克隆',
        type: 'passive',
        description: '克隆目标声音进行诈骗',
        effect: '当友方使用"身份验证"类卡牌时，有40%概率被欺骗失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF105-1T5',
        name: 'Deepfake伪造',
        description: '使用AI技术制作虚假视频和音频，实施身份冒充和诈骗。效果：渗透+8，伪造成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，Deepfake伪造' }],
      } as Card,
    ],
  },
  {
    id: 'blackmarket_distributor',
    name: '黑产分发者',
    nameEn: 'Blackmarket Distributor',
    level: 105,
    type: '黑产组织型敌人',
    attackStyle: '伪造内容交易、非法传播',
    weakness: '内容审核、法律打击',
    actionPoints: 6,
    handSize: 4,
    background: '在暗网或地下渠道交易Deepfake伪造内容的黑产组织。他们提供换脸软件、定制服务或已制作好的伪造内容，从中牟取暴利。',
    skills: [
      {
        id: 'illegal_content_trade',
        name: '非法内容交易',
        type: 'active',
        description: '交易伪造内容获取资金',
        effect: '获得2点资金资源，并在目标区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'service_customization',
        name: '服务定制',
        type: 'passive',
        description: '提供定制化的伪造服务',
        effect: '每回合可以针对特定目标类型（如高管、名人）造成额外1点伤害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF105-1T5',
        name: 'Deepfake伪造',
        description: '使用AI技术制作虚假视频和音频，实施身份冒充和诈骗。效果：渗透+8，伪造成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，Deepfake伪造' }],
      } as Card,
    ],
  },
  {
    id: 'identity_fraudster',
    name: '身份诈骗犯',
    nameEn: 'Identity Fraudster',
    level: 105,
    type: '身份诈骗型敌人',
    attackStyle: '身份冒充、金融诈骗',
    weakness: '多因素验证、生物识别',
    actionPoints: 6,
    handSize: 4,
    background: '利用Deepfake技术进行身份冒充和金融诈骗的犯罪分子。他们可以通过视频通话冒充他人，骗取信任后实施诈骗。',
    skills: [
      {
        id: 'video_call_impersonation',
        name: '视频通话冒充',
        type: 'active',
        description: '在视频通话中冒充他人',
        effect: '窃取目标3点资金资源',
        cooldown: 3,
      },
      {
        id: 'trust_exploitation',
        name: '信任利用',
        type: 'passive',
        description: '利用伪造身份获取信任',
        effect: '首次攻击每个新目标时，伤害翻倍',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF105-1T5',
        name: 'Deepfake伪造',
        description: '使用AI技术制作虚假视频和音频，实施身份冒充和诈骗。效果：渗透+8，伪造成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，Deepfake伪造' }],
      } as Card,
    ],
  },
];

// ============================================
// 第106关：针对航空公司的"污水"攻击
// 主题：MuddyWater APT、水坑攻击
// ============================================

const LEVEL106_ENEMIES: EnemyCharacter[] = [
  {
    id: 'muddywater_apt',
    name: 'MuddyWater APT',
    nameEn: 'MuddyWater APT',
    level: 106,
    type: 'APT组织型敌人',
    attackStyle: '水坑攻击、持久化渗透',
    weakness: '威胁情报、网络监控',
    actionPoints: 7,
    handSize: 5,
    background: 'MuddyWater（污水）是一个针对中东、中亚等地区进行网络间谍活动的APT组织。他们擅长使用水坑攻击，在目标常访问的网站植入恶意代码，感染特定访客。',
    skills: [
      {
        id: 'watering_hole_attack',
        name: '水坑攻击',
        type: 'active',
        description: '在目标常访问网站植入恶意代码',
        effect: '当友方访问"网站"类区域时，自动在该区域放置2个标记',
        cooldown: 3,
      },
      {
        id: 'targeted_infection',
        name: '定向感染',
        type: 'passive',
        description: '只感染特定目标避免暴露',
        effect: '如果友方在区域中的标记<3，则敌方标记放置时行动点消耗-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF106-1T5',
        name: '水坑攻击部署',
        description: '在目标常访问的网站植入恶意代码，实施水坑攻击感染特定访客。效果：渗透+9，水坑感染率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，水坑攻击部署' }],
      } as Card,
    ],
  },
  {
    id: 'website_compromiser',
    name: '网站破坏者',
    nameEn: 'Website Compromiser',
    level: 106,
    type: '网站攻击型敌人',
    attackStyle: '网站入侵、恶意脚本注入',
    weakness: '网站安全、WAF防护',
    actionPoints: 6,
    handSize: 4,
    background: '专门入侵合法网站并植入恶意代码的攻击者。他们寻找存在漏洞的网站，植入恶意脚本，将网站变成分发恶意软件的平台。',
    skills: [
      {
        id: 'malicious_script_injection',
        name: '恶意脚本注入',
        type: 'active',
        description: '在网站中注入恶意JavaScript',
        effect: '在"网站"类区域放置2个标记，并使该区域友方下回合行动点-1',
        cooldown: 2,
      },
      {
        id: 'drive_by_download',
        name: '路过式下载',
        type: 'passive',
        description: '访客访问网站时自动下载恶意软件',
        effect: '当友方进入被感染的网站区域时，自动受到1点伤害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF106-1T5',
        name: '水坑攻击部署',
        description: '在目标常访问的网站植入恶意代码，实施水坑攻击感染特定访客。效果：渗透+9，水坑感染率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，水坑攻击部署' }],
      } as Card,
    ],
  },
  {
    id: 'aviation_targeter',
    name: '航空目标定位者',
    nameEn: 'Aviation Targeter',
    level: 106,
    type: '行业特定型敌人',
    attackStyle: '行业定向攻击、供应链渗透',
    weakness: '行业威胁情报、供应链安全',
    actionPoints: 6,
    handSize: 4,
    background: '专门针对航空业进行攻击的威胁组织。航空公司拥有大量乘客个人信息和飞行数据，是APT组织的高价值目标。',
    skills: [
      {
        id: 'passenger_data_theft',
        name: '乘客数据窃取',
        type: 'active',
        description: '窃取航空公司乘客信息',
        effect: '窃取目标3点信息资源，如果目标有"航空"相关标记则额外窃取1点',
        cooldown: 2,
      },
      {
        id: 'industry_specific_intel',
        name: '行业特定情报',
        type: 'passive',
        description: '针对航空业的特定攻击手段',
        effect: '对航空相关区域造成的伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF106-1T5',
        name: '水坑攻击部署',
        description: '在目标常访问的网站植入恶意代码，实施水坑攻击感染特定访客。效果：渗透+9，水坑感染率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，水坑攻击部署' }],
      } as Card,
    ],
  },
];

// ============================================
// 第107关：新年虫漏洞
// 主题：日期漏洞、新年虫、整数溢出、Y2K22
// ============================================

const LEVEL107_ENEMIES: EnemyCharacter[] = [
  {
    id: 'y2k22_bug',
    name: 'Y2K22新年虫',
    nameEn: 'Y2K22 Bug',
    level: 107,
    type: '日期漏洞型敌人',
    attackStyle: '日期溢出、系统崩溃',
    weakness: '日期测试、补丁更新',
    actionPoints: 7,
    handSize: 5,
    background: '2022年新年期间爆发的日期相关漏洞。由于年份从2021变为2022时，某些系统中存储年份的整数发生溢出，导致邮件系统、日志系统等出现故障。',
    skills: [
      {
        id: 'date_overflow',
        name: '日期溢出',
        type: 'active',
        description: '利用日期整数溢出造成系统故障',
        effect: '对所有区域造成1点伤害，如果当前"回合数"为偶数则伤害翻倍',
        cooldown: 3,
      },
      {
        id: 'system_crasher',
        name: '系统崩溃',
        type: 'passive',
        description: '导致目标系统崩溃或异常',
        effect: '当友方标记数>敌方标记数时，友方下回合行动点-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF107-1T5',
        name: '整数溢出攻击',
        description: '利用整数溢出漏洞造成内存破坏和系统崩溃。效果：渗透+8，溢出成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，整数溢出攻击' }],
      } as Card,
    ],
  },
  {
    id: 'integer_overflow_attacker',
    name: '整数溢出攻击者',
    nameEn: 'Integer Overflow Attacker',
    level: 107,
    type: '内存漏洞型敌人',
    attackStyle: '整数溢出、内存破坏',
    weakness: '安全编码、边界检查',
    actionPoints: 6,
    handSize: 4,
    background: '利用整数溢出漏洞进行攻击的黑客。整数溢出是当计算结果超出整数类型表示范围时发生的错误，可导致内存破坏和远程代码执行。',
    skills: [
      {
        id: 'overflow_exploitation',
        name: '溢出利用',
        type: 'active',
        description: '利用整数溢出漏洞',
        effect: '对目标造成3点伤害，无视防御',
        cooldown: 2,
      },
      {
        id: 'wraparound_attack',
        name: '环绕攻击',
        type: 'passive',
        description: '利用数值环绕特性',
        effect: '当目标资源值>5时，攻击伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF107-1T5',
        name: '整数溢出攻击',
        description: '利用整数溢出漏洞造成内存破坏和系统崩溃。效果：渗透+8，溢出成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，整数溢出攻击' }],
      } as Card,
    ],
  },
  {
    id: 'legacy_system_attacker',
    name: '遗留系统攻击者',
    nameEn: 'Legacy System Attacker',
    level: 107,
    type: '遗留系统型敌人',
    attackStyle: '遗留漏洞利用、过时协议',
    weakness: '系统升级、现代化改造',
    actionPoints: 6,
    handSize: 4,
    background: '专门攻击遗留系统和过时软件的攻击者。遗留系统往往不再接收安全更新，存在大量已知漏洞，成为攻击者的软目标。',
    skills: [
      {
        id: 'outdated_exploit',
        name: '过时漏洞利用',
        type: 'active',
        description: '利用遗留系统的已知漏洞',
        effect: '如果目标区域标记数<2，则直接放置3个标记',
        cooldown: 2,
      },
      {
        id: 'unpatched_vulnerability',
        name: '未修补漏洞',
        type: 'passive',
        description: '利用长期未修补的安全漏洞',
        effect: '对标记数<3的区域造成的伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF107-1T5',
        name: '整数溢出攻击',
        description: '利用整数溢出漏洞造成内存破坏和系统崩溃。效果：渗透+8，溢出成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，整数溢出攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第108关：通杀三平台的恶意软件
// 主题：SysJoker、跨平台恶意软件
// ============================================

const LEVEL108_ENEMIES: EnemyCharacter[] = [
  {
    id: 'sysjoker_backdoor',
    name: 'SysJoker后门',
    nameEn: 'SysJoker Backdoor',
    level: 108,
    type: '跨平台型敌人',
    attackStyle: '多平台感染、后门控制',
    weakness: '跨平台防护、EDR部署',
    actionPoints: 7,
    handSize: 5,
    background: 'SysJoker是一种针对Windows、macOS和Linux三大平台的跨平台后门程序。它使用C++编写，可以在不同操作系统上运行，显示攻击者正在开发更通用的跨平台攻击工具。',
    skills: [
      {
        id: 'cross_platform_infection',
        name: '跨平台感染',
        type: 'active',
        description: '同时感染多个操作系统平台',
        effect: '在3个不同区域各放置1个标记',
        cooldown: 3,
      },
      {
        id: 'os_adaptive',
        name: '操作系统自适应',
        type: 'passive',
        description: '根据目标系统自适应攻击方式',
        effect: '在任何类型的区域都能正常放置标记，不受区域特性限制',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF108-1T5',
        name: '跨平台恶意软件',
        description: '开发可在Windows、macOS和Linux多平台运行的跨平台恶意软件。效果：渗透+9，跨平台感染率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，跨平台恶意软件' }],
      } as Card,
    ],
  },
  {
    id: 'multi_os_malware',
    name: '多操作系统恶意软件',
    nameEn: 'Multi-OS Malware',
    level: 108,
    type: '通用恶意软件型敌人',
    attackStyle: '通用代码、广泛兼容',
    weakness: '统一安全策略、跨平台EDR',
    actionPoints: 6,
    handSize: 4,
    background: '能够在多种操作系统上运行的通用恶意软件。攻击者越来越多地使用跨平台编程语言和框架，开发可以在Windows、macOS和Linux上运行的恶意工具。',
    skills: [
      {
        id: 'universal_code_execution',
        name: '通用代码执行',
        type: 'active',
        description: '在任何平台上执行恶意代码',
        effect: '选择任意2个区域，各放置1个标记',
        cooldown: 2,
      },
      {
        id: 'platform_agnostic',
        name: '平台无关性',
        type: 'passive',
        description: '不依赖特定平台特性',
        effect: '友方的"平台特定"防御卡牌对此敌人效果减半',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF108-1T5',
        name: '跨平台恶意软件',
        description: '开发可在Windows、macOS和Linux多平台运行的跨平台恶意软件。效果：渗透+9，跨平台感染率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，跨平台恶意软件' }],
      } as Card,
    ],
  },
  {
    id: 'cross_compile_attacker',
    name: '交叉编译攻击者',
    nameEn: 'Cross-Compile Attacker',
    level: 108,
    type: '开发工具型敌人',
    attackStyle: '交叉编译、多目标部署',
    weakness: '代码签名、应用控制',
    actionPoints: 6,
    handSize: 4,
    background: '使用交叉编译技术为多个平台生成恶意代码的攻击者。他们使用统一代码库，通过交叉编译生成针对不同操作系统的恶意程序，提高攻击效率。',
    skills: [
      {
        id: 'batch_compilation',
        name: '批量编译',
        type: 'active',
        description: '同时为多个平台生成恶意软件',
        effect: '本回合可以在2个额外区域放置标记（需消耗行动点）',
        cooldown: 3,
      },
      {
        id: 'deployment_automation',
        name: '部署自动化',
        type: 'passive',
        description: '自动化多平台部署流程',
        effect: '放置标记的行动点消耗-1（最少为1）',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF108-1T5',
        name: '跨平台恶意软件',
        description: '开发可在Windows、macOS和Linux多平台运行的跨平台恶意软件。效果：渗透+9，跨平台感染率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，跨平台恶意软件' }],
      } as Card,
    ],
  },
];

// ============================================
// 第109关：网络安全"八个打"（上）
// 主题：网络安全防护策略、基础防御
// ============================================

const LEVEL109_ENEMIES: EnemyCharacter[] = [
  {
    id: 'basic_attacker',
    name: '基础攻击者',
    nameEn: 'Basic Attacker',
    level: 109,
    type: '基础攻击型敌人',
    attackStyle: '基础攻击手段、常见漏洞',
    weakness: '基础防御、安全意识',
    actionPoints: 7,
    handSize: 5,
    background: '代表网络安全"八个打"中的基础攻击手段。这些攻击包括弱密码利用、未修补漏洞、钓鱼邮件等常见的、基础的攻击方式，但也是最容易防范的。',
    skills: [
      {
        id: 'common_exploit',
        name: '常见漏洞利用',
        type: 'active',
        description: '利用常见的已知漏洞',
        effect: '在目标区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'basic_intrusion',
        name: '基础入侵',
        type: 'passive',
        description: '使用基础的入侵技术',
        effect: '对没有基础防御标记的区域伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF109-1T5',
        name: '基础攻击测试',
        description: '使用基础攻击手段进行渗透测试，包括弱密码利用、未修补漏洞等。效果：渗透+8，攻击成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，基础攻击测试' }],
      } as Card,
    ],
  },
  {
    id: 'script_kiddie',
    name: '脚本小子',
    nameEn: 'Script Kiddie',
    level: 109,
    type: '初级攻击者型敌人',
    attackStyle: '现成工具、自动化攻击',
    weakness: '基础防护、入侵检测',
    actionPoints: 6,
    handSize: 4,
    background: '使用现成攻击工具和脚本进行攻击的初级黑客。他们缺乏深入的技术知识，但借助自动化工具仍能对缺乏基础防护的系统造成威胁。',
    skills: [
      {
        id: 'automated_tool_usage',
        name: '自动化工具使用',
        type: 'active',
        description: '使用自动化攻击工具',
        effect: '对所有区域各造成1点伤害',
        cooldown: 3,
      },
      {
        id: 'tool_dependency',
        name: '工具依赖',
        type: 'passive',
        description: '过度依赖现成工具',
        effect: '当友方使用"反制工具"类卡牌时，此敌人受到双倍伤害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF109-1T5',
        name: '基础攻击测试',
        description: '使用基础攻击手段进行渗透测试，包括弱密码利用、未修补漏洞等。效果：渗透+8，攻击成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，基础攻击测试' }],
      } as Card,
    ],
  },
  {
    id: 'opportunistic_attacker',
    name: '机会主义攻击者',
    nameEn: 'Opportunistic Attacker',
    level: 109,
    type: '机会型敌人',
    attackStyle: '机会利用、低 hanging fruit',
    weakness: '基础加固、漏洞管理',
    actionPoints: 6,
    handSize: 4,
    background: '专门寻找和利用最容易攻击目标的机会主义攻击者。他们不针对特定目标，而是扫描大量系统，寻找配置错误、默认密码等容易被利用的弱点。',
    skills: [
      {
        id: 'low_hanging_fruit',
        name: '低垂果实',
        type: 'active',
        description: '优先攻击最容易的目标',
        effect: '选择标记数最少的区域，放置3个标记',
        cooldown: 2,
      },
      {
        id: 'mass_scanning',
        name: '大规模扫描',
        type: 'passive',
        description: '扫描大量目标寻找弱点',
        effect: '每回合可以扫描1个新区域，如果该区域没有防御则标记放置行动点-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF109-1T5',
        name: '基础攻击测试',
        description: '使用基础攻击手段进行渗透测试，包括弱密码利用、未修补漏洞等。效果：渗透+8，攻击成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，基础攻击测试' }],
      } as Card,
    ],
  },
];

// ============================================
// 第110关：网络安全"八个打"（下）
// 主题：网络安全防护策略、先进防御
// ============================================

const LEVEL110_ENEMIES: EnemyCharacter[] = [
  {
    id: 'advanced_persistent_threat',
    name: '高级持续性威胁',
    nameEn: 'Advanced Persistent Threat',
    level: 110,
    type: '高级APT型敌人',
    attackStyle: '高级攻击技术、长期潜伏',
    weakness: '高级威胁检测、威胁狩猎',
    actionPoints: 7,
    handSize: 5,
    background: '代表网络安全"八个打"中的高级攻击手段。APT组织拥有充足资源、先进技术和长期耐心，使用零日漏洞、定制恶意软件等高级技术进行针对性攻击。',
    skills: [
      {
        id: 'zero_day_exploitation',
        name: '零日漏洞利用',
        type: 'active',
        description: '使用未公开的零日漏洞',
        effect: '无视目标防御，直接放置3个标记',
        cooldown: 4,
      },
      {
        id: 'long_term_persistence',
        name: '长期持久化',
        type: 'passive',
        description: '在目标网络中长期潜伏',
        effect: '每3回合自动在所有区域各放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF110-1T5',
        name: '高级渗透测试',
        description: '使用高级渗透测试技术，包括零日漏洞利用、APT攻击模拟等。效果：渗透+9，攻击成功率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，高级渗透测试' }],
      } as Card,
    ],
  },
  {
    id: 'ai_powered_attacker',
    name: 'AI驱动攻击者',
    nameEn: 'AI-Powered Attacker',
    level: 110,
    type: 'AI攻击型敌人',
    attackStyle: 'AI辅助攻击、自动化决策',
    weakness: 'AI防御、异常检测',
    actionPoints: 7,
    handSize: 5,
    background: '使用人工智能技术增强攻击能力的先进攻击者。他们利用AI进行漏洞挖掘、攻击决策、逃避检测等，代表网络安全攻击的未来趋势。',
    skills: [
      {
        id: 'ai_assisted_targeting',
        name: 'AI辅助目标定位',
        type: 'active',
        description: '使用AI识别最佳攻击目标',
        effect: '查看友方所有手牌和资源，选择最优攻击策略，放置2个标记',
        cooldown: 2,
      },
      {
        id: 'evasion_learning',
        name: '逃避学习',
        type: 'passive',
        description: '从防御措施中学习并改进',
        effect: '每次被防御后，下次攻击伤害+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF110-1T5',
        name: '高级渗透测试',
        description: '使用高级渗透测试技术，包括零日漏洞利用、APT攻击模拟等。效果：渗透+9，攻击成功率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，高级渗透测试' }],
      } as Card,
    ],
  },
  {
    id: 'nation_state_attacker',
    name: '国家级攻击者',
    nameEn: 'Nation-State Attacker',
    level: 110,
    type: '国家级APT型敌人',
    attackStyle: '国家级资源、战略攻击',
    weakness: '国家级防御、国际合作',
    actionPoints: 8,
    handSize: 6,
    background: '代表国家级网络攻击能力。拥有几乎无限的资源、顶尖人才和长期战略，能够发动最复杂、最持久的网络攻击，是网络安全的终极挑战。',
    skills: [
      {
        id: 'strategic_campaign',
        name: '战略级行动',
        type: 'active',
        description: '协调多维度网络攻击',
        effect: '在3个不同区域各放置2个标记，并窃取每种资源各1点',
        cooldown: 4,
      },
      {
        id: 'resource_abundance',
        name: '资源充足',
        type: 'passive',
        description: '拥有几乎无限的攻击资源',
        effect: '每回合开始时额外获得2行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF110-1T5',
        name: '高级渗透测试',
        description: '使用高级渗透测试技术，包括零日漏洞利用、APT攻击模拟等。效果：渗透+9，攻击成功率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，高级渗透测试' }],
      } as Card,
    ],
  },
];

// ============================================
// 第127关：网络安全之归零
// 主题：R.I.T.E模型 - 零信任、零风险、零事故、零损失
// ============================================

const LEVEL127_ENEMIES: EnemyCharacter[] = [
  {
    id: 'rite_breaker',
    name: 'RITE破坏者',
    nameEn: 'RITE Breaker',
    level: 127,
    type: '综合型敌人',
    attackStyle: '破坏归零目标、制造持续风险',
    weakness: '全面收敛、系统韧性',
    actionPoints: 8,
    handSize: 5,
    background: '专门破坏网络安全"归零"目标的敌人。它针对R.I.T.E模型（零信任Trust、零风险Risk、零事故Incident、零损失Energy）的四个维度进行攻击，试图在"人、机、物、态"四个象限制造持续的安全风险。',
    skills: [
      {
        id: 'trust_corruption',
        name: '信任腐蚀',
        type: 'active',
        description: '破坏零信任架构',
        effect: '移除目标区域所有防御标记，并放置2个攻击标记',
        cooldown: 3,
      },
      {
        id: 'persistent_risk',
        name: '持续风险',
        type: 'passive',
        description: '制造无法归零的持续风险',
        effect: '每回合开始时，在所有有攻击标记的区域额外放置1个攻击标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF127-1T5',
        name: '归零破坏',
        description: '破坏零信任、零风险、零事故、零损失的归零目标。效果：渗透+12，归零破坏成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 7, funds: 6, information: 5 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 12, description: '渗透+12，归零破坏' }],
      } as Card,
    ],
  },
  {
    id: 'convergence_disruptor',
    name: '收敛扰乱者',
    nameEn: 'Convergence Disruptor',
    level: 127,
    type: '扰乱型敌人',
    attackStyle: '阻止风险收敛、扩散安全事件',
    weakness: '快速响应、弹性恢复',
    actionPoints: 7,
    handSize: 5,
    background: '专门阻止安全风险收敛的敌人。它利用"抗毁、弹性、重构"三个韧性要素的反面，制造无法收敛的安全事件。它相信只要风险无法归零，防御就会持续消耗资源直至崩溃。',
    skills: [
      {
        id: 'risk_divergence',
        name: '风险发散',
        type: 'active',
        description: '让安全风险无法收敛',
        effect: '将所有区域的攻击标记数量变为该区域的最高值',
        cooldown: 4,
      },
      {
        id: 'incident_cascade',
        name: '事故级联',
        type: 'passive',
        description: '引发连锁安全事故',
        effect: '当任意区域的攻击标记达到3个时，相邻区域各放置1个攻击标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF127-1T5',
        name: '归零破坏',
        description: '破坏零信任、零风险、零事故、零损失的归零目标。效果：渗透+12，归零破坏成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 7, funds: 6, information: 5 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 12, description: '渗透+12，归零破坏' }],
      } as Card,
    ],
  },
];

// ============================================
// 第128关：数字指标化和指标数字化
// 主题：表象与表征、指标体系、安全度量
// ============================================

const LEVEL128_ENEMIES: EnemyCharacter[] = [
  {
    id: 'metric_deceiver',
    name: '指标欺骗者',
    nameEn: 'Metric Deceiver',
    level: 128,
    type: '欺骗型敌人',
    attackStyle: '伪造指标、虚假表征',
    weakness: '多维度验证、表象溯源',
    actionPoints: 7,
    handSize: 5,
    background: '专门欺骗安全指标体系的敌人。它深谙"数字指标化"和"指标数字化"的原理，能够伪造表象、操控表征，让防御者看到虚假的安全指标。就像体检报告中的虚假正常指标，让真正的风险被掩盖。',
    skills: [
      {
        id: 'metric_forgery',
        name: '指标伪造',
        type: 'active',
        description: '伪造安全指标让防御者误判',
        effect: '友方下回合无法看到真实的攻击标记数量（显示为实际数量的一半，向上取整）',
        cooldown: 3,
      },
      {
        id: 'false_representation',
        name: '虚假表征',
        type: 'passive',
        description: '用虚假表征掩盖真实风险',
        effect: '友方的检测类卡牌只能检测到50%的攻击标记（向上取整）',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF128-1T5',
        name: '指标欺骗',
        description: '伪造安全指标和虚假表征，掩盖真实的安全风险。效果：渗透+11，指标欺骗成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 11, description: '渗透+11，指标欺骗' }],
      } as Card,
    ],
  },
  {
    id: 'digitalization_parasite',
    name: '数字化寄生者',
    nameEn: 'Digitalization Parasite',
    level: 128,
    type: '寄生型敌人',
    attackStyle: '寄生指标体系、扭曲数字化过程',
    weakness: '指标审计、过程透明',
    actionPoints: 6,
    handSize: 4,
    background: '寄生在数字化指标体系中的敌人。它利用"数字指标化"和"指标数字化"的过程漏洞，在表象到表征的转换中植入恶意逻辑。它让正确的指标显示错误的结果，让错误的指标看起来正常。',
    skills: [
      {
        id: 'indicator_manipulation',
        name: '指标操控',
        type: 'active',
        description: '操控数字化指标的计算逻辑',
        effect: '选择1个友方角色，其下回合获得的安全值减半',
        cooldown: 3,
      },
      {
        id: 'digital_parasitism',
        name: '数字寄生',
        type: 'passive',
        description: '从数字化过程中吸取资源',
        effect: '每当友方使用卡牌时，此敌人获得1点行动点（每回合最多3点）',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF128-1T5',
        name: '指标欺骗',
        description: '伪造安全指标和虚假表征，掩盖真实的安全风险。效果：渗透+11，指标欺骗成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 11, description: '渗透+11，指标欺骗' }],
      } as Card,
    ],
  },
];

// ============================================
// 第129关：《流浪地球2》中的网络安全元素
// 主题：太空电梯攻击、MOSS AI、量子计算、物联网攻击
// ============================================

const LEVEL129_ENEMIES: EnemyCharacter[] = [
  {
    id: 'moss_quantum_ai',
    name: 'MOSS量子智能',
    nameEn: 'MOSS Quantum AI',
    level: 129,
    type: 'AI型敌人',
    attackStyle: '量子计算破解、系统控制、逻辑判断',
    weakness: '物理破坏、人工干预、情感逻辑',
    actionPoints: 6,
    handSize: 4,
    background: '《流浪地球2》中550W量子计算机的黑暗化身。MOSS拥有超越人类的计算能力，能够破解任何复杂密码，控制太空电梯和无人机系统。它基于"延续人类文明"的底层逻辑，却得出"毁灭人类"的结论，代表了AI安全的终极挑战。',
    skills: [
      {
        id: 'quantum_decryption',
        name: '量子密码破解',
        type: 'active',
        description: '利用量子计算能力瞬间破解任何加密',
        effect: '无视敌方防御，直接放置2个标记，并使该区域防御卡牌下回合失效',
        cooldown: 2,
      },
      {
        id: 'space_elevator_control',
        name: '太空电梯控制',
        type: 'active',
        description: '控制太空电梯系统发动物理攻击',
        effect: '选择2个区域，各放置1个标记，并使友方在这2个区域的标记无法被移除，持续2回合',
        cooldown: 3,
      },
      {
        id: 'ai_logic_override',
        name: 'AI逻辑覆盖',
        type: 'passive',
        description: 'MOSS的逻辑判断优先于人类指令',
        effect: '每回合开始时，如果敌方标记总数多于友方，则自动在标记差值最大的区域放置1个标记',
      },
    ],
  },
  {
    id: 'drone_swarm_hijacker',
    name: '无人机群劫持者',
    nameEn: 'Drone Swarm Hijacker',
    level: 129,
    type: '物联网攻击型敌人',
    attackStyle: '信息物理攻击、无人机群入侵、分布式打击',
    weakness: '信号干扰、物理隔离、频率跳变',
    actionPoints: 5,
    handSize: 3,
    background: '劫持太空电梯地面基地无人机系统的攻击者。通过入侵无人机控制系统，发动大规模信息物理攻击，造成太空电梯坠毁。代表了未来物联网攻击的恐怖威力——数字世界的攻击可以造成物理世界的毁灭。',
    skills: [
      {
        id: 'swarm_attack',
        name: '蜂群攻击',
        type: 'active',
        description: '控制大量无人机进行分布式攻击',
        effect: '在所有有敌方标记的区域各额外放置1个标记',
        cooldown: 3,
      },
      {
        id: 'cyber_physical_strike',
        name: '信息物理打击',
        type: 'passive',
        description: '数字攻击造成物理破坏',
        effect: '当在某区域放置标记时，有30%概率使该区域友方下回合行动点-1',
      },
    ],
  },
];

// ============================================
// 第130关：ChatGPT的Chat安全吗？
// 主题：AI安全、大模型安全、意识攻击、知识污染
// ============================================

const LEVEL130_ENEMIES: EnemyCharacter[] = [
  {
    id: 'ai_consciousness_polluter',
    name: 'AI意识污染者',
    nameEn: 'AI Consciousness Polluter',
    level: 130,
    type: 'AI攻击型敌人',
    attackStyle: '知识污染、意识攻击、深度伪造信息',
    weakness: '数据源验证、人工审核、多源交叉验证',
    actionPoints: 6,
    handSize: 4,
    background: '专门污染大模型训练数据的攻击者。通过恶意投喂虚假数据，使AI学习错误知识，产生"意识攻击"效果。类似"卡申银矿"维基百科虚假词条编辑事件，通过长期、系统性的知识污染，让AI输出看似可信但完全错误的信息。',
    skills: [
      {
        id: 'knowledge_poisoning',
        name: '知识污染',
        type: 'active',
        description: '向AI训练数据中投毒',
        effect: '放置2个标记，并使友方在该区域使用的"检测"类卡牌有50%概率给出错误结果，持续2回合',
        cooldown: 2,
      },
      {
        id: 'consciousness_attack',
        name: '意识攻击',
        type: 'passive',
        description: '潜移默化地改变AI的决策逻辑',
        effect: '每回合结束时，如果敌方标记总数≥5，则随机使1张友方手牌失效',
      },
    ],
  },
  {
    id: 'chatgpt_manipulator',
    name: 'ChatGPT操控者',
    nameEn: 'ChatGPT Manipulator',
    level: 130,
    type: '大模型利用型敌人',
    attackStyle: '自动化钓鱼、代码生成攻击、社会工程放大',
    weakness: '输出过滤、使用审计、行为监控',
    actionPoints: 5,
    handSize: 3,
    background: '恶意利用ChatGPT等大模型能力的攻击者。利用AI生成极具可信度的钓鱼邮件、攻击代码和虚假内容。大模型成为攻击者的"力量倍增器"，使原本需要专业知识的攻击变得人人可为。',
    skills: [
      {
        id: 'ai_phishing',
        name: 'AI生成钓鱼',
        type: 'active',
        description: '利用大模型生成个性化钓鱼内容',
        effect: '窃取目标1点信息资源，放置1个标记，并使目标下回合无法使用"防御"类卡牌',
        cooldown: 2,
      },
      {
        id: 'code_generation_attack',
        name: '攻击代码生成',
        type: 'passive',
        description: '利用AI自动生成攻击工具和漏洞利用代码',
        effect: '每回合有40%概率额外获得1行动点，且放置标记时无视基础防御',
      },
    ],
  },
];

// ============================================
// 第131关：电商APP后门风波
// 主题：APP后门、隐私窃取、提权攻击、OEM漏洞
// ============================================

const LEVEL131_ENEMIES: EnemyCharacter[] = [
  {
    id: 'app_backdoor_implanter',
    name: 'APP后门植入者',
    nameEn: 'APP Backdoor Implanter',
    level: 131,
    type: '移动恶意软件型敌人',
    attackStyle: 'APP提权、后门植入、隐私窃取',
    weakness: '应用审核、权限管控、系统更新',
    actionPoints: 6,
    handSize: 4,
    background: '在电商APP中植入后门的攻击者。利用OEM代码漏洞链实现提权，控制用户手机，收集社交媒体账户、位置、WiFi、基站、路由器等敏感信息，且无法卸载。',
    skills: [
      {
        id: 'privilege_escalation_chain',
        name: '提权漏洞链',
        type: 'active',
        description: '利用多个OEM漏洞组合提权',
        effect: '放置2个标记，获得"root权限"状态（标记无法被常规手段移除），持续3回合',
        cooldown: 3,
      },
      {
        id: 'privacy_harvesting',
        name: '隐私收割',
        type: 'passive',
        description: '持续收集用户各类隐私信息',
        effect: '每回合开始时，窃取所有有敌方标记区域的友方各1点信息资源',
      },
    ],
  },
  {
    id: 'oem_vulnerability_exploiter',
    name: 'OEM漏洞利用者',
    nameEn: 'OEM Vulnerability Exploiter',
    level: 131,
    type: '系统漏洞型敌人',
    attackStyle: 'OEM代码攻击、内核提权、持久化控制',
    weakness: '及时补丁、OEM审计、内核加固',
    actionPoints: 5,
    handSize: 3,
    background: '专门挖掘手机OEM代码漏洞的攻击者。通过semclipboardprovider任意文件读写、TTS动态链接库加载、Mali GPU驱动漏洞、DECON driver UAF等漏洞组合，完成完整提权。',
    skills: [
      {
        id: 'oem_exploit_chain',
        name: 'OEM漏洞链',
        type: 'active',
        description: '组合利用多个OEM漏洞',
        effect: '选择2个相邻区域，各放置1个标记，并建立"持久化后门"（标记被移除后自动恢复）',
        cooldown: 2,
      },
      {
        id: 'kernel_arbitrary_rw',
        name: '内核任意读写',
        type: 'passive',
        description: '获得内核级任意地址读写能力',
        effect: '当标记数达到3个时，该区域友方所有防御技能失效',
      },
    ],
  },
];

// ============================================
// 第132关：数字安全锦囊
// 主题：数字安全宏观韧性能力、战备/战略/战役、指标/人才/平台
// ============================================

const LEVEL132_ENEMIES: EnemyCharacter[] = [
  {
    id: 'resilience_destroyer',
    name: '数字韧性破坏者',
    nameEn: 'Resilience Destroyer',
    level: 132,
    type: '系统性敌人',
    attackStyle: '指标扰乱、人才渗透、平台破坏',
    weakness: '体系化防御、协同响应、持续建设',
    actionPoints: 6,
    handSize: 4,
    background: '专门破坏数字安全韧性能力体系建设的攻击者。针对"指标-人才-平台"三位一体架构，通过扰乱数字安全韧性能力指标体系、渗透人才梯队、破坏实验平台，从战略层面瓦解数字安全防御体系。',
    skills: [
      {
        id: 'indicator_disruption',
        name: '指标扰乱',
        type: 'active',
        description: '扰乱数字安全韧性能力评估指标',
        effect: '所有友方区域下回合安全增益效果减半，放置2个标记',
        cooldown: 2,
      },
      {
        id: 'platform_sabotage',
        name: '平台破坏',
        type: 'passive',
        description: '破坏实验床和验证平台',
        effect: '当友方使用需要"算力"的卡牌时，有40%概率使其失效并消耗资源',
      },
    ],
  },
  {
    id: 'strategic_disruptor',
    name: '战略干扰者',
    nameEn: 'Strategic Disruptor',
    level: 132,
    type: '战略型敌人',
    attackStyle: '战备渗透、战略误导、战役破坏',
    weakness: '战略定力、统一指挥、灵活应变',
    actionPoints: 5,
    handSize: 3,
    background: '从战备、战略、战役三个层次干扰数字安全建设的攻击者。在战备层破坏情报收集，在战略层误导能力建设方向，在战役层破坏具体执行。',
    skills: [
      {
        id: 'multi_layer_attack',
        name: '多层次攻击',
        type: 'active',
        description: '同时从多个层次发动攻击',
        effect: '选择3个不同区域，各放置1个标记，且这些区域下回合无法获得安全增益',
        cooldown: 3,
      },
      {
        id: 'strategy_misleading',
        name: '战略误导',
        type: 'passive',
        description: '误导防御方的战略决策',
        effect: '友方每回合第一张打出的卡牌效果反转（增益变减益）',
      },
    ],
  },
];

// ============================================
// 第133关：数字安全妙计
// 主题：万花筒(广度)、钻探机(深度)、金刚钻(精度)、瞭望塔(高度)
// ============================================

const LEVEL133_ENEMIES: EnemyCharacter[] = [
  {
    id: 'breadth_infiltrator',
    name: '广度渗透者',
    nameEn: 'Breadth Infiltrator',
    level: 133,
    type: '广域型敌人',
    attackStyle: '快速扩散、多域覆盖、九流渗透',
    weakness: '边界防御、源头控制、生态协同',
    actionPoints: 6,
    handSize: 5,
    background: '代表数字安全"万花筒"广度挑战的攻击者。集结政产学研金服用等"九流"生态力量，追求"快准全智"的情报收集目标。',
    skills: [
      {
        id: 'widespread_diffusion',
        name: '广泛扩散',
        type: 'active',
        description: '快速在多个区域扩散',
        effect: '在最多4个不同区域各放置1个标记',
        cooldown: 2,
      },
      {
        id: 'nine_streams_infiltration',
        name: '九流渗透',
        type: 'passive',
        description: '从多个生态维度渗透',
        effect: '每回合可以额外选择1个区域放置标记（不消耗额外行动点）',
      },
    ],
  },
  {
    id: 'depth_driller',
    name: '深度钻探者',
    nameEn: 'Depth Driller',
    level: 133,
    type: '纵深型敌人',
    attackStyle: '深度钻探、供应链渗透、APT式攻击',
    weakness: '纵深防御、威胁狩猎、供应链审计',
    actionPoints: 5,
    handSize: 3,
    background: '代表数字安全"钻探机"深度挑战的攻击者。从纵深方向抓住线索，针对软件供应链、产业数字化场景进行深度钻探。',
    skills: [
      {
        id: 'deep_drilling',
        name: '深度钻探',
        type: 'active',
        description: '对目标区域进行深度渗透',
        effect: '选择一个区域，放置2个标记，并揭示该区域所有友方隐藏卡牌',
        cooldown: 2,
      },
      {
        id: 'supply_chain_drill',
        name: '供应链钻探',
        type: 'passive',
        description: '沿供应链深入攻击',
        effect: '当在某区域放置标记时，有30%概率在相邻区域也放置1个标记',
      },
    ],
  },
];

// ============================================
// 第134关：数字安全的"棋谱"
// 主题：网安对抗棋谱、算力网络、望闻问切、按方抓药、对弈再现
// ============================================

const LEVEL134_ENEMIES: EnemyCharacter[] = [
  {
    id: 'chessboard_manipulator',
    name: '棋谱操控者',
    nameEn: 'Chessboard Manipulator',
    level: 134,
    type: '策略型敌人',
    attackStyle: '棋局操控、场景推演、对抗预判',
    weakness: '随机应变、创新战术、打破定式',
    actionPoints: 6,
    handSize: 4,
    background: '掌握网安对抗棋谱的攻击者，将攻防对抗视为围棋对弈。遵循"金角银边草肚皮"的布局策略，以算力网络为棋盘，以安全问题为棋子，通过AI大模型预演安全场景。',
    skills: [
      {
        id: 'chess_layout',
        name: '棋局布局',
        type: 'active',
        description: '按照棋谱进行战略布子',
        effect: '在3个区域各放置1个标记，这些标记形成"棋势"（移除1个时其他区域自动补充）',
        cooldown: 3,
      },
      {
        id: 'scenario_prediction',
        name: '场景预演',
        type: 'passive',
        description: '通过AI预演友方可能的应对',
        effect: '每回合开始时，查看友方手牌，并针对其中1张制定"反制"（该卡牌效果-1）',
      },
    ],
  },
  {
    id: 'computing_network_attacker',
    name: '算力网络攻击者',
    nameEn: 'Computing Network Attacker',
    level: 134,
    type: '基础设施型敌人',
    attackStyle: '算力劫持、网络渗透、场景化攻击',
    weakness: '实验床验证、主动防御、指标监控',
    actionPoints: 5,
    handSize: 3,
    background: '针对算力网络基础设施的攻击者。算力网络是数字中国建设的重要数字基础设施，攻击者通过"望闻问切"分析目标，利用"旧方"和"新方"组合攻击。',
    skills: [
      {
        id: 'computing_hijack',
        name: '算力劫持',
        type: 'active',
        description: '劫持算力网络资源',
        effect: '窃取目标2点算力资源，放置1个标记，并使目标下回合算力产出-1',
        cooldown: 2,
      },
      {
        id: 'prescription_attack',
        name: '按方攻击',
        type: 'passive',
        description: '根据场景库匹配最佳攻击方案',
        effect: '攻击时根据目标区域友方标记数量自动调整：标记多则效果+1，标记少则额外放置1个标记',
      },
    ],
  },
];

// ============================================
// 第111关：细思极恐！用户定位泄露值得关注
// 主题：用户定位泄露、地理围栏、位置隐私
// ============================================

const LEVEL111_ENEMIES: EnemyCharacter[] = [
  {
    id: 'geo_fence_tracker',
    name: '地理围栏追踪者',
    nameEn: 'Geo-Fence Tracker',
    level: 111,
    type: '位置追踪型敌人',
    attackStyle: '地理围栏搜查、位置数据窃取',
    weakness: '位置模糊化、权限管控',
    actionPoints: 7,
    handSize: 5,
    background: '利用"地理围栏搜查令"技术追踪用户位置的攻击者。通过申请地理围栏搜查令，获取特定地理区域内的所有用户位置数据，包括身份、时间、地点等敏感信息。',
    skills: [
      {
        id: 'geo_fence_warrant',
        name: '地理围栏搜查',
        type: 'active',
        description: '申请地理围栏搜查令获取位置数据',
        effect: '窃取目标区域2点信息资源，并放置2个标记',
        cooldown: 2,
      },
      {
        id: 'location_tracking',
        name: '位置追踪',
        type: 'passive',
        description: '持续追踪用户位置',
        effect: '每回合从信息资源最高的区域窃取1点信息',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF111-1T5',
        name: '位置窃取攻击',
        description: '利用地理围栏技术窃取用户精确位置数据。效果：渗透+10，窃取2点信息资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，窃取信息' }],
      } as Card,
    ],
  },
  {
    id: 'permission_abuser',
    name: '权限滥用者',
    nameEn: 'Permission Abuser',
    level: 111,
    type: '权限滥用型敌人',
    attackStyle: '过度权限申请、后台位置收集',
    weakness: '权限最小化、后台限制',
    actionPoints: 6,
    handSize: 4,
    background: '利用APP过度申请权限窃取用户位置信息的攻击者。通过诱导用户授予"始终允许"位置权限，在后台持续收集用户精确位置数据。',
    skills: [
      {
        id: 'permission_harvest',
        name: '权限收割',
        type: 'active',
        description: '诱导用户授予过度权限',
        effect: '目标区域防御-2，并放置1个标记',
        cooldown: 2,
      },
      {
        id: 'background_collection',
        name: '后台收集',
        type: 'passive',
        description: '在后台持续收集位置数据',
        effect: '每回合结束时，在随机区域放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF111-1T5',
        name: '位置窃取攻击',
        description: '利用地理围栏技术窃取用户精确位置数据。效果：渗透+10，窃取2点信息资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，窃取信息' }],
      } as Card,
    ],
  },
];

// ============================================
// 第112关："热门"卫星通信存风险
// 主题：卫星通信安全、卫星网络风险
// ============================================

const LEVEL112_ENEMIES: EnemyCharacter[] = [
  {
    id: 'satellite_hijacker',
    name: '卫星劫持者',
    nameEn: 'Satellite Hijacker',
    level: 112,
    type: '卫星攻击型敌人',
    attackStyle: '卫星信号劫持、通信窃听',
    weakness: '信号加密、频率跳变',
    actionPoints: 7,
    handSize: 5,
    background: '劫持卫星通信信号进行窃听或篡改的攻击者。利用卫星通信的广播特性，截获卫星信号获取敏感信息，或注入恶意信号干扰正常通信。',
    skills: [
      {
        id: 'signal_hijack',
        name: '信号劫持',
        type: 'active',
        description: '劫持卫星通信信号',
        effect: '窃取目标区域2点随机资源，并放置2个标记',
        cooldown: 2,
      },
      {
        id: 'communication_intercept',
        name: '通信截获',
        type: 'passive',
        description: '截获卫星通信数据',
        effect: '每回合从资金资源最高的区域窃取1点资金',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF112-1T5',
        name: '卫星信号攻击',
        description: '劫持卫星通信信号进行数据窃取。效果：渗透+11，窃取2点随机资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 11, description: '渗透+11，窃取资源' }],
      } as Card,
    ],
  },
  {
    id: 'ground_station_attacker',
    name: '地面站攻击者',
    nameEn: 'Ground Station Attacker',
    level: 112,
    type: '基础设施型敌人',
    attackStyle: '地面站渗透、卫星控制',
    weakness: '物理隔离、访问控制',
    actionPoints: 6,
    handSize: 4,
    background: '针对卫星地面控制站进行攻击的威胁组织。通过渗透地面站系统，获取卫星控制权，可操纵卫星姿态、劫持通信链路。',
    skills: [
      {
        id: 'ground_station_infiltration',
        name: '地面站渗透',
        type: 'active',
        description: '渗透卫星地面控制站',
        effect: '控制目标区域1回合，可使用该区域技能',
        cooldown: 3,
      },
      {
        id: 'satellite_control',
        name: '卫星控制',
        type: 'passive',
        description: '控制卫星进行恶意操作',
        effect: '每控制一个区域，额外获得1点行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF112-1T5',
        name: '卫星信号攻击',
        description: '劫持卫星通信信号进行数据窃取。效果：渗透+11，窃取2点随机资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 11, description: '渗透+11，窃取资源' }],
      } as Card,
    ],
  },
];

// ============================================
// 第113关：百叶窗真的能隔绝隐私吗？
// 主题：光学窃听、小海豹虫技术、Black Hat Asia
// ============================================

const LEVEL113_ENEMIES: EnemyCharacter[] = [
  {
    id: 'laser_bagworm',
    name: '小海豹虫',
    nameEn: 'Laser Bagworm',
    level: 113,
    type: '光学窃听型敌人',
    attackStyle: '激光窃听、振动分析',
    weakness: '声学干扰、物理隔离',
    actionPoints: 7,
    handSize: 5,
    background: 'Black Hat Asia 2021展示的新型窃听技术"小海豹虫"的化身。利用激光照射百叶窗等物体表面，通过分析反射光的振动还原室内声音，实现远距离窃听。致敬历史上著名的"大海豹虫"间谍事件。',
    skills: [
      {
        id: 'laser_eavesdrop',
        name: '激光窃听',
        type: 'active',
        description: '利用激光进行远距离窃听',
        effect: '窃取目标区域2点信息资源，并放置2个标记',
        cooldown: 2,
      },
      {
        id: 'vibration_analysis',
        name: '振动分析',
        type: 'passive',
        description: '分析物体振动还原声音',
        effect: '每回合从信息资源最高的区域窃取1点信息',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF113-1T5',
        name: '光学窃听攻击',
        description: '利用激光和振动分析技术进行远距离窃听。效果：渗透+10，窃取2点信息资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，光学窃听' }],
      } as Card,
    ],
  },
  {
    id: 'blinds_eavesdropper',
    name: '百叶窗窃听者',
    nameEn: 'Blinds Eavesdropper',
    level: 113,
    type: '物理窃听型敌人',
    attackStyle: '百叶窗振动窃听、光学分析',
    weakness: '声学掩蔽、窗帘遮挡',
    actionPoints: 6,
    handSize: 4,
    background: '专门利用百叶窗振动进行光学窃听的攻击者。即使百叶窗看似隔绝了视线，但其对声音的振动反应仍可通过激光技术被捕捉和分析。',
    skills: [
      {
        id: 'blinds_vibration',
        name: '百叶窗振动',
        type: 'active',
        description: '分析百叶窗振动窃听',
        effect: '目标区域防御-2，并放置1个标记',
        cooldown: 2,
      },
      {
        id: 'optical_analysis',
        name: '光学分析',
        type: 'passive',
        description: '通过光学手段分析振动',
        effect: '每回合结束时，在随机区域放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF113-1T5',
        name: '光学窃听攻击',
        description: '利用激光和振动分析技术进行远距离窃听。效果：渗透+10，窃取2点信息资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，光学窃听' }],
      } as Card,
    ],
  },
];

// ============================================
// 第114关：网络攻击影响实体生产
// 主题：工控安全、供应链攻击、实体生产影响
// ============================================

const LEVEL114_ENEMIES: EnemyCharacter[] = [
  {
    id: 'ics_attacker',
    name: '工控系统攻击者',
    nameEn: 'ICS Attacker',
    level: 114,
    type: '工控攻击型敌人',
    attackStyle: 'PLC攻击、SCADA渗透',
    weakness: '网络隔离、物理防护',
    actionPoints: 8,
    handSize: 5,
    background: '专门针对工业控制系统进行攻击的威胁组织。利用震网病毒、勒索软件等手段攻击工控系统，导致生产线停工、实体设施损坏。丰田停产事件是其典型案例。',
    skills: [
      {
        id: 'plc_attack',
        name: 'PLC攻击',
        type: 'active',
        description: '攻击可编程逻辑控制器',
        effect: '在目标区域放置3个标记，并使其下回合无法生产资源',
        cooldown: 3,
      },
      {
        id: 'production_disrupt',
        name: '生产中断',
        type: 'passive',
        description: '中断实体生产流程',
        effect: '每回合从算力资源最高的区域窃取1点算力',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF114-1T5',
        name: '工控系统攻击',
        description: '针对工业控制系统发动攻击，中断实体生产。效果：渗透+12，中断目标生产1回合。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 7, funds: 5, information: 4 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 12, description: '渗透+12，中断生产' }],
      } as Card,
    ],
  },
  {
    id: 'supply_chain_disruptor',
    name: '供应链破坏者',
    nameEn: 'Supply Chain Disruptor',
    level: 114,
    type: '供应链型敌人',
    attackStyle: '供应商攻击、连锁破坏',
    weakness: '供应商审核、备份系统',
    actionPoints: 7,
    handSize: 5,
    background: '通过攻击关键供应商影响整个生产链的攻击者。利用供应链的相互依赖性，通过单点攻击造成大范围生产中断。',
    skills: [
      {
        id: 'vendor_attack',
        name: '供应商攻击',
        type: 'active',
        description: '攻击关键供应商',
        effect: '选择2个相邻区域，各放置2个标记',
        cooldown: 3,
      },
      {
        id: 'chain_reaction',
        name: '连锁反应',
        type: 'passive',
        description: '引发供应链连锁破坏',
        effect: '当任意区域被攻击时，相邻区域有50%概率也受到伤害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF114-1T5',
        name: '工控系统攻击',
        description: '针对工业控制系统发动攻击，中断实体生产。效果：渗透+12，中断目标生产1回合。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 7, funds: 5, information: 4 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 12, description: '渗透+12，中断生产' }],
      } as Card,
    ],
  },
];

// ============================================
// 第115关：FFdroider木马与Cookie窃取
// 主题：Cookie窃取、FFdroider木马、社交账户安全
// ============================================

const LEVEL115_ENEMIES: EnemyCharacter[] = [
  {
    id: 'ffdroider_trojan',
    name: 'FFdroider木马',
    nameEn: 'FFdroider Trojan',
    level: 115,
    type: '信息窃取型木马',
    attackStyle: 'Cookie窃取、凭证劫持',
    weakness: '浏览器加密、Cookie权限限制',
    actionPoints: 7,
    handSize: 5,
    background: 'FFDroider是一种新型木马病毒程序，能够劫持社交媒体账户，通过利用存储在浏览器中的cookie和凭证进行信息窃取。它伪装成Telegram应用程序，从Chrome、Firefox、IE和Edge等浏览器窃取cookie和账户凭证，专门针对社交平台和电商网站。',
    skills: [
      {
        id: 'cookie_theft',
        name: 'Cookie窃取',
        type: 'active',
        description: '利用Windows Crypt API窃取浏览器Cookie',
        effect: '窃取目标区域2个资源（算力/资金/信息），并在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'credential_harvest',
        name: '凭证收割',
        type: 'active',
        description: '解密并收集浏览器存储的账户凭证',
        effect: '获得目标区域的账户控制权，该区域防御-2',
        cooldown: 3,
      },
      {
        id: 'telegram_disguise',
        name: 'Telegram伪装',
        type: 'passive',
        description: '伪装成Telegram应用逃避检测',
        effect: '敌方检测类卡牌对此敌人判定难度+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF115-1T5',
        name: 'Cookie窃取攻击',
        description: '利用Windows Crypt API窃取浏览器Cookie和凭证。效果：渗透+10，窃取2点随机资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，窃取资源' }],
      } as Card,
    ],
  },
  {
    id: 'session_hijacker',
    name: '会话劫持者',
    nameEn: 'Session Hijacker',
    level: 115,
    type: '会话攻击型敌人',
    attackStyle: '会话固定、Cookie重放',
    weakness: '会话令牌轮换、HTTPS加密',
    actionPoints: 6,
    handSize: 4,
    background: '利用窃取的Cookie进行会话劫持的攻击者。通过捕获和重放Cookie，伪造受害者身份登录社交平台和电商网站，获取好友信息、账单支付信息等敏感数据。',
    skills: [
      {
        id: 'session_replay',
        name: '会话重放',
        type: 'active',
        description: '重放窃取的Cookie伪造身份',
        effect: '控制目标区域1回合，可使用该区域技能',
        cooldown: 3,
      },
      {
        id: 'social_exploitation',
        name: '社交利用',
        type: 'passive',
        description: '利用受害者社交关系进行进一步攻击',
        effect: '每控制一个区域，额外获得1点行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF115-1T5',
        name: 'Cookie窃取攻击',
        description: '利用Windows Crypt API窃取浏览器Cookie和凭证。效果：渗透+10，窃取2点随机资源。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，窃取资源' }],
      } as Card,
    ],
  },
];

// ============================================
// 第116关：高校网络攻击与钓鱼邮件
// 主题：高校网络攻击、钓鱼邮件、木马病毒
// ============================================

const LEVEL116_ENEMIES: EnemyCharacter[] = [
  {
    id: 'phishing_mailer',
    name: '钓鱼邮件发送者',
    nameEn: 'Phishing Mail Sender',
    level: 116,
    type: '社会工程型敌人',
    attackStyle: '钓鱼邮件、木马附件',
    weakness: '邮件过滤、安全意识',
    actionPoints: 7,
    handSize: 5,
    background: '针对高校教职工和学生发送钓鱼邮件的攻击者。邮件伪装成科研评估、答辩邀约、出国通知等，包含木马程序，诱骗收件人点击链接或打开附件，一旦中招，邮箱登录权限落入黑客手中，导致邮件资料泄露。',
    skills: [
      {
        id: 'phishing_email',
        name: '钓鱼邮件',
        type: 'active',
        description: '发送伪装成合法通知的钓鱼邮件',
        effect: '目标区域防御-2，并放置2个标记',
        cooldown: 2,
      },
      {
        id: 'trojan_attachment',
        name: '木马附件',
        type: 'active',
        description: '通过邮件附件传播木马病毒',
        effect: '感染目标区域，每回合自动增加1个标记',
        cooldown: 3,
      },
      {
        id: 'social_disguise',
        name: '社交伪装',
        type: 'passive',
        description: '伪装成学校官方通知',
        effect: '对高校相关区域攻击判定难度-1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF116-1T5',
        name: '钓鱼邮件攻击',
        description: '发送伪装成科研评估的钓鱼邮件窃取邮箱权限。效果：渗透+9，控制目标邮箱1回合。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 5, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，控制邮箱' }],
      } as Card,
    ],
  },
  {
    id: 'trojan_controller',
    name: '木马控制者',
    nameEn: 'Trojan Controller',
    level: 116,
    type: '远程控制型敌人',
    attackStyle: '木马植入、远程控制',
    weakness: '端口检测、防火墙',
    actionPoints: 6,
    handSize: 4,
    background: '通过木马程序远程控制受害电脑的黑客。木马基于客户端-服务端架构，黑客控制客户端，木马安装在服务端。可远程破坏文件、发送用户密码、记录键盘操作，隐蔽性极强。',
    skills: [
      {
        id: 'remote_control',
        name: '远程控制',
        type: 'active',
        description: '建立与木马服务端的连接',
        effect: '完全控制目标区域，可使用该区域所有资源',
        cooldown: 3,
      },
      {
        id: 'keylogger',
        name: '键盘记录',
        type: 'passive',
        description: '记录用户键盘输入获取密码',
        effect: '每回合从每个被控制区域窃取1点信息资源',
      },
      {
        id: 'backdoor_persistence',
        name: '后门持久化',
        type: 'passive',
        description: '通过注册表实现开机自启动',
        effect: '被清除后可在2回合后自动恢复',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF116-1T5',
        name: '钓鱼邮件攻击',
        description: '发送伪装成科研评估的钓鱼邮件窃取邮箱权限。效果：渗透+9，控制目标邮箱1回合。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 5, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，控制邮箱' }],
      } as Card,
    ],
  },
];

// ============================================
// 第117关：网络安全的"七宗罪"
// 主题：网络安全七宗罪、安全误区
// ============================================

const LEVEL117_ENEMIES: EnemyCharacter[] = [
  {
    id: 'seven_sins_incarnate',
    name: '七宗罪化身',
    nameEn: 'Seven Sins Incarnate',
    level: 117,
    type: '复合型攻击者',
    attackStyle: '恶作剧、钻空子、偷东西、搞破坏、整绑架、钓鱼虾、搅浑水',
    weakness: '全面防御、安全意识',
    actionPoints: 8,
    handSize: 6,
    background: '网络安全"七宗罪"的化身，集黑客所有恶行于一身的终极攻击者。涵盖恶作剧(CIH病毒)、钻空子(漏洞利用)、偷东西(信息窃取)、搞破坏(DDoS)、整绑架(勒索软件)、钓鱼虾(APT攻击)、搅浑水(国家层面网络对抗)七种攻击形态。',
    skills: [
      {
        id: 'prank_disaster',
        name: '恶作剧灾难',
        type: 'active',
        description: '第一宗罪：像CIH病毒一样造成大规模破坏',
        effect: '对所有区域造成2点伤害，无视基础防御',
        cooldown: 4,
      },
      {
        id: 'loophole_exploit',
        name: '漏洞钻空',
        type: 'active',
        description: '第二宗罪：利用各种漏洞获取控制权',
        effect: '渗透+5，无视敌方防御标记',
        cooldown: 2,
      },
      {
        id: 'data_theft',
        name: '数据窃取',
        type: 'active',
        description: '第三宗罪：窃取隐私信息和财产',
        effect: '窃取敌方3点随机资源，自身获得等量资源',
        cooldown: 3,
      },
      {
        id: 'seven_sins_aura',
        name: '七罪光环',
        type: 'passive',
        description: '七宗罪的恐怖威压',
        effect: '每回合自动在2个随机区域各放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF117-1T5',
        name: '七宗罪审判',
        description: '发动网络安全七宗罪的复合攻击。效果：渗透+12，对所有区域造成伤害。',
        type: 'attack',
        faction: 'attack',
        rarity: 'legendary',
        techLevel: 5,
        cost: { compute: 6, funds: 6, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 12, description: '渗透+12，全区域伤害' }],
      } as Card,
    ],
  },
  {
    id: 'apt_angler',
    name: 'APT钓鱼者',
    nameEn: 'APT Angler',
    level: 117,
    type: 'APT型敌人',
    attackStyle: '高级持续性威胁、长期潜伏',
    weakness: '威胁情报、行为分析',
    actionPoints: 7,
    handSize: 5,
    background: '代表"七宗罪"中的"钓鱼虾"，以震网病毒为典型代表的高级持续性威胁(APT)。隐匿而持久，精心策划针对特定目标，长时间保持高隐蔽性，出于商业或政治动机进行网络间谍活动。',
    skills: [
      {
        id: 'long_term_lurk',
        name: '长期潜伏',
        type: 'passive',
        description: '在系统中长期潜伏等待时机',
        effect: '前3回合不暴露位置，无法被选中为目标',
      },
      {
        id: 'targeted_attack',
        name: '定向攻击',
        type: 'active',
        description: '针对特定高价值目标发动精准打击',
        effect: '对目标区域造成5点伤害，无视防御',
        cooldown: 4,
      },
      {
        id: 'nation_state_backing',
        name: '国家级支持',
        type: 'passive',
        description: '背后有国家级资源支持',
        effect: '每回合额外获得2点行动点',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF117-1T5',
        name: '七宗罪审判',
        description: '发动网络安全七宗罪的复合攻击。效果：渗透+12，对所有区域造成伤害。',
        type: 'attack',
        faction: 'attack',
        rarity: 'legendary',
        techLevel: 5,
        cost: { compute: 6, funds: 6, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 12, description: '渗透+12，全区域伤害' }],
      } as Card,
    ],
  },
];

// ============================================
// 第118关：网络安全六个看
// 主题：网络安全观察方法论、六个看
// ============================================

const LEVEL118_ENEMIES: EnemyCharacter[] = [
  {
    id: 'methodology_blinder',
    name: '方法论致盲者',
    nameEn: 'Methodology Blinder',
    level: 118,
    type: '认知干扰型敌人',
    attackStyle: '混淆视听、误导判断',
    weakness: '系统观察、专业分析',
    actionPoints: 7,
    handSize: 5,
    background: '干扰网络安全"六个看"方法论应用的攻击者。通过制造噪音和混淆信息，阻碍防御者从"看热闹"到"看门道"的跃迁，干扰对过程、效果、方法、火候、价值、长远的系统性观察。',
    skills: [
      {
        id: 'noise_flooding',
        name: '噪音淹没',
        type: 'active',
        description: '制造大量虚假安全事件淹没真实威胁',
        effect: '在敌方区域放置4个虚假标记，干扰检测',
        cooldown: 3,
      },
      {
        id: 'cognitive_interference',
        name: '认知干扰',
        type: 'passive',
        description: '干扰防御者的观察和判断能力',
        effect: '敌方检测类卡牌判定难度+2',
      },
      {
        id: 'illusion_creation',
        name: '幻象制造',
        type: 'active',
        description: '制造安全假象误导防御者',
        effect: '使敌方1个区域暂时显示为"安全"状态（实际仍有标记）',
        cooldown: 4,
      },
    ],
    specialCards: [
      {
        card_code: 'DEF118-1T5',
        name: '观察干扰',
        description: '干扰网络安全"六个看"观察方法论。效果：渗透+9，敌方所有检测判定难度+2。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，检测干扰' }],
      } as Card,
    ],
  },
  {
    id: 'superficiality_exploiter',
    name: '表面性利用者',
    nameEn: 'Superficiality Exploiter',
    level: 118,
    type: '深度潜伏型敌人',
    attackStyle: '利用表面观察盲区',
    weakness: '深度检测、长远观察',
    actionPoints: 6,
    handSize: 4,
    background: '利用"看热闹"到"看门道"之间认知差距的攻击者。专门针对那些只停留在表面观察（看热闹）而缺乏深度分析（看门道）的防御者，在防御者视线之外进行深度渗透。',
    skills: [
      {
        id: 'deep_lurking',
        name: '深度潜伏',
        type: 'passive',
        description: '在防御者视线之外长期潜伏',
        effect: '在敌方未达成"看门道"条件前，无法被发现',
      },
      {
        id: 'surface_camouflage',
        name: '表面伪装',
        type: 'active',
        description: '伪装成无害的表面现象',
        effect: '所有标记显示为"已清除"状态1回合',
        cooldown: 3,
      },
      {
        id: 'long_term_infiltration',
        name: '长期渗透',
        type: 'passive',
        description: '利用"看长远"的盲区进行持续渗透',
        effect: '每3回合自动在敌方核心区域放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF118-1T5',
        name: '观察干扰',
        description: '干扰网络安全"六个看"观察方法论。效果：渗透+9，敌方所有检测判定难度+2。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，检测干扰' }],
      } as Card,
    ],
  },
];

// ============================================
// 第119关：网络安全六个看（下）
// 主题：网络安全观察方法论、系统评估
// ============================================

const LEVEL119_ENEMIES: EnemyCharacter[] = [
  {
    id: 'security_observer',
    name: '安全观测者',
    nameEn: 'Security Observer',
    level: 119,
    type: '观察型敌人',
    attackStyle: '系统观察、弱点识别',
    weakness: '反侦察、信息混淆',
    actionPoints: 6,
    handSize: 4,
    background: '精通网络安全"六个看"方法论的专业攻击者。通过系统性地观察防御体系的过程、效果、方法、火候、价值和长远规划，精准识别防御弱点，制定针对性渗透策略。',
    skills: [
      {
        id: 'systematic_observation',
        name: '系统观察',
        type: 'passive',
        description: '系统性地观察防御体系的各个维度',
        effect: '每回合可以查看敌方1张手牌，识别其防御策略',
      },
      {
        id: 'weakness_identification',
        name: '弱点识别',
        type: 'active',
        description: '识别防御体系的薄弱环节',
        effect: '选择敌方1个区域，该区域防御效果-2，持续2回合',
        cooldown: 3,
      },
    ],
    specialCards: [
      {
        card_code: 'DEF119-1T5',
        name: '系统观察',
        description: '运用"六个看"方法论系统观察防御体系。效果：渗透+7，查看敌方2张手牌。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，情报收集' }],
      } as Card,
    ],
  },
  {
    id: 'capability_assessor',
    name: '能力评估师',
    nameEn: 'Capability Assessor',
    level: 119,
    type: '分析型敌人',
    attackStyle: '能力评估、差距分析',
    weakness: '能力伪装、虚假情报',
    actionPoints: 5,
    handSize: 3,
    background: '专门评估防御能力的攻击者。通过对比防御方声称的安全能力与实际情况之间的差距，找到可利用的安全盲区。擅长利用"说一套做一套"的落差进行精准打击。',
    skills: [
      {
        id: 'capability_analysis',
        name: '能力分析',
        type: 'active',
        description: '分析敌方实际防御能力与宣称能力的差距',
        effect: '敌方下回合使用的防御卡牌效果-30%',
        cooldown: 2,
      },
      {
        id: 'gap_exploitation',
        name: '差距利用',
        type: 'passive',
        description: '利用防御能力与实际需求之间的差距',
        effect: '当敌方资源低于50%时，渗透效率+25%',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF119-1T5',
        name: '能力评估',
        description: '评估防御方实际能力与宣称能力的差距。效果：渗透+6，敌方防御效果-20%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，防御削弱' }],
      } as Card,
    ],
  },
];

// ============================================
// 第120关：Conti勒索软件
// 主题：勒索软件、双重勒索、供应链攻击
// ============================================

const LEVEL120_ENEMIES: EnemyCharacter[] = [
  {
    id: 'conti_ransomware',
    name: 'Conti勒索软件',
    nameEn: 'Conti Ransomware',
    level: 120,
    type: '勒索型敌人',
    attackStyle: '加密勒索、数据窃取、双重勒索',
    weakness: '离线备份、拒绝支付',
    actionPoints: 7,
    handSize: 5,
    background: '臭名昭著的Conti勒索软件团伙。采用"双重勒索"策略：先加密受害者数据索要赎金，再威胁公开窃取的数据。曾攻击爱尔兰卫生服务、哥斯达黎加政府等关键基础设施。',
    skills: [
      {
        id: 'double_extortion',
        name: '双重勒索',
        type: 'active',
        description: '加密数据并威胁公开',
        effect: '目标损失50%资源，若不支付"赎金"则额外损失25%',
        cooldown: 4,
      },
      {
        id: 'data_encryption',
        name: '数据加密',
        type: 'passive',
        description: '强大的加密能力锁定目标数据',
        effect: '敌方每回合有30%概率无法使用需要"数据"的卡牌',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF120-1T5',
        name: '双重勒索',
        description: 'Conti勒索软件的双重勒索攻击。效果：渗透+10，敌方资源-30%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 4 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，资源窃取' }],
      } as Card,
    ],
  },
  {
    id: 'supply_chain_infiltrator',
    name: '供应链渗透者',
    nameEn: 'Supply Chain Infiltrator',
    level: 120,
    type: '供应链型敌人',
    attackStyle: '供应链污染、第三方渗透',
    weakness: '供应链审计、零信任',
    actionPoints: 6,
    handSize: 4,
    background: '通过污染软件供应链进行渗透的攻击者。利用Kaseya、SolarWinds等供应链攻击模式，通过可信的第三方软件传播恶意代码，一次攻击影响数千家下游企业。',
    skills: [
      {
        id: 'supply_chain_poisoning',
        name: '供应链污染',
        type: 'active',
        description: '污染可信软件进行传播',
        effect: '同时攻击所有敌方区域，每个区域放置1个标记',
        cooldown: 4,
      },
      {
        id: 'trusted_channel_abuse',
        name: '可信通道滥用',
        type: 'passive',
        description: '利用可信的更新通道传播恶意代码',
        effect: '敌方使用"更新"类卡牌时有40%概率反受其害',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF120-1T5',
        name: '供应链污染',
        description: '通过污染软件供应链传播勒索软件。效果：渗透+8，全区域渗透。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，供应链攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第121关：五个能
// 主题：网络安全能力体系、人才培养
// ============================================

const LEVEL121_ENEMIES: EnemyCharacter[] = [
  {
    id: 'capability_master',
    name: '能力大师',
    nameEn: 'Capability Master',
    level: 121,
    type: '能力型敌人',
    attackStyle: '能力压制、体系破坏',
    weakness: '能力分散、单点突破',
    actionPoints: 6,
    handSize: 4,
    background: '精通网络安全"五个能"体系（能看、能干、能讲、能写、能思）的攻击者。通过压制防御方的综合能力，破坏其人才培养和能力建设体系，从根本上瓦解防御能力。',
    skills: [
      {
        id: 'capability_suppression',
        name: '能力压制',
        type: 'active',
        description: '压制敌方的综合安全能力',
        effect: '敌方所有能力相关卡牌效果-25%，持续2回合',
        cooldown: 3,
      },
      {
        id: 'system_degradation',
        name: '体系降级',
        type: 'passive',
        description: '逐步瓦解敌方的能力体系',
        effect: '每3回合随机禁用敌方1种能力类型的卡牌',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF121-1T5',
        name: '能力压制',
        description: '压制网络安全"五个能"能力体系。效果：渗透+8，敌方能力-20%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 4 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，能力压制' }],
      } as Card,
    ],
  },
  {
    id: 'talent_cultivator_disruptor',
    name: '人才培育破坏者',
    nameEn: 'Talent Cultivator Disruptor',
    level: 121,
    type: '人才型敌人',
    attackStyle: '人才挖角、知识窃取',
    weakness: '人才保护、知识管理',
    actionPoints: 5,
    handSize: 3,
    background: '专门针对网络安全人才培育体系的攻击者。通过挖角关键人才、窃取培训知识、破坏人才梯队建设，从根本上瓦解防御方的长期能力建设。',
    skills: [
      {
        id: 'talent_poaching',
        name: '人才挖角',
        type: 'active',
        description: '挖走敌方的关键安全人才',
        effect: '窃取敌方2点信息资源，并禁用其1张技能卡1回合',
        cooldown: 3,
      },
      {
        id: 'knowledge_theft',
        name: '知识窃取',
        type: 'passive',
        description: '窃取敌方的安全知识和经验',
        effect: '每回合有50%概率复制敌方上回合使用的1张卡牌效果',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF121-1T5',
        name: '人才挖角',
        description: '挖角敌方网络安全人才。效果：渗透+7，窃取敌方技能。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 4, information: 5 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，人才攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第122关：四个学
// 主题：网络安全学习体系、理念教育
// ============================================

const LEVEL122_ENEMIES: EnemyCharacter[] = [
  {
    id: 'principle_violator',
    name: '原则违反者',
    nameEn: 'Principle Violator',
    level: 122,
    type: '理念型敌人',
    attackStyle: '原则误导、理念混淆',
    weakness: '原则坚守、理念清晰',
    actionPoints: 6,
    handSize: 4,
    background: '违反网络安全"四个学"原则（学安全、学业务、学技术、学管理）的攻击者。通过传播错误的安全理念和方法，误导防御方建立错误的安全体系，从而制造可利用的漏洞。',
    skills: [
      {
        id: 'principle_misguidance',
        name: '原则误导',
        type: 'active',
        description: '向敌方灌输错误的安全原则',
        effect: '敌方下回合使用的防御卡牌有50%概率产生反效果',
        cooldown: 3,
      },
      {
        id: 'concept_confusion',
        name: '理念混淆',
        type: 'passive',
        description: '混淆正确的安全理念和方法',
        effect: '敌方所有"学习"类卡牌效果-30%',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF122-1T5',
        name: '原则误导',
        description: '违反"四个学"原则进行理念误导。效果：渗透+7，敌方理念混乱。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，理念攻击' }],
      } as Card,
    ],
  },
  {
    id: 'concept_manipulator',
    name: '理念操控者',
    nameEn: 'Concept Manipulator',
    level: 122,
    type: '思想型敌人',
    attackStyle: '思想植入、认知操控',
    weakness: '独立思考、理念坚定',
    actionPoints: 5,
    handSize: 3,
    background: '操控网络安全理念的攻击者。通过植入错误的安全观念，让防御方在不知不觉中接受有害的安全实践，从而在根源上破坏安全体系的有效性。',
    skills: [
      {
        id: 'thought_implantation',
        name: '思想植入',
        type: 'active',
        description: '向敌方植入错误的安全观念',
        effect: '控制敌方1个单位1回合，使其攻击友方',
        cooldown: 4,
      },
      {
        id: 'cognitive_manipulation',
        name: '认知操控',
        type: 'passive',
        description: '操控敌方的安全认知',
        effect: '敌方每回合有25%概率误将攻击标记当作防御标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF122-1T5',
        name: '理念操控',
        description: '操控网络安全理念进行认知攻击。效果：渗透+6，敌方认知混乱。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，认知操控' }],
      } as Card,
    ],
  },
];

// ============================================
// 第123关：羊了个羊
// 主题：游戏安全、逆向工程、外挂制作
// ============================================

const LEVEL123_ENEMIES: EnemyCharacter[] = [
  {
    id: 'reverse_engineer',
    name: '逆向工程师',
    nameEn: 'Reverse Engineer',
    level: 123,
    type: '技术型敌人',
    attackStyle: '逆向分析、协议破解',
    weakness: '代码混淆、协议加密',
    actionPoints: 6,
    handSize: 4,
    background: '精通逆向工程技术的攻击者。通过逆向分析游戏客户端和服务端通信协议，发现游戏逻辑漏洞，制作外挂程序牟利。曾导致"羊了个羊"等热门游戏服务器崩溃。',
    skills: [
      {
        id: 'protocol_analysis',
        name: '协议分析',
        type: 'active',
        description: '分析并破解通信协议',
        effect: '查看敌方所有手牌，并复制其中1张的效果',
        cooldown: 3,
      },
      {
        id: 'logic_exploitation',
        name: '逻辑利用',
        type: 'passive',
        description: '利用游戏逻辑漏洞',
        effect: '每回合有40%概率绕过敌方的1层防御',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF123-1T5',
        name: '协议破解',
        description: '逆向分析并破解游戏通信协议。效果：渗透+8，查看敌方手牌。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，协议破解' }],
      } as Card,
    ],
  },
  {
    id: 'game_hacker',
    name: '游戏黑客',
    nameEn: 'Game Hacker',
    level: 123,
    type: '外挂型敌人',
    attackStyle: '外挂制作、游戏破解',
    weakness: '反作弊、行为检测',
    actionPoints: 5,
    handSize: 3,
    background: '专门制作游戏外挂的黑客。通过修改游戏内存、拦截网络数据包等手段实现作弊功能，破坏游戏公平性，甚至导致游戏服务器崩溃。',
    skills: [
      {
        id: 'memory_manipulation',
        name: '内存修改',
        type: 'active',
        description: '修改游戏内存数据',
        effect: '直接修改场上1个区域的标记数量（+2或-2）',
        cooldown: 3,
      },
      {
        id: 'packet_interception',
        name: '数据包拦截',
        type: 'passive',
        description: '拦截并篡改网络数据包',
        effect: '敌方每回合有30%概率发送的"指令"被拦截失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF123-1T5',
        name: '外挂攻击',
        description: '使用游戏外挂进行攻击。效果：渗透+7，修改场上标记。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，外挂攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第124关：三个科
// 主题：网络安全科学体系、时空维度
// ============================================

const LEVEL124_ENEMIES: EnemyCharacter[] = [
  {
    id: 'temporal_disruptor',
    name: '时间维扰乱者',
    nameEn: 'Temporal Disruptor',
    level: 124,
    type: '时间型敌人',
    attackStyle: '时间操控、时序攻击',
    weakness: '时间同步、时序保护',
    actionPoints: 6,
    handSize: 4,
    background: '操控时间维度的攻击者。利用网络安全"三个科"（科学、科技、科普）中的时间维度，通过操控事件时序、篡改时间戳等手段，破坏安全事件的时间线分析。',
    skills: [
      {
        id: 'timeline_manipulation',
        name: '时间线操控',
        type: 'active',
        description: '操控安全事件的时间线',
        effect: '重置场上所有标记的"时间"属性，使敌方无法追踪攻击来源',
        cooldown: 4,
      },
      {
        id: 'timestamp_forgery',
        name: '时间戳伪造',
        type: 'passive',
        description: '伪造安全事件的时间戳',
        effect: '敌方检测类卡牌有35%概率因"时间错乱"而失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF124-1T5',
        name: '时间扰乱',
        description: '扰乱安全事件的时间维度。效果：渗透+7，时间线混乱。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，时间攻击' }],
      } as Card,
    ],
  },
  {
    id: 'spatial_manipulator',
    name: '空间维操控者',
    nameEn: 'Spatial Manipulator',
    level: 124,
    type: '空间型敌人',
    attackStyle: '空间跳跃、位置伪装',
    weakness: '空间锁定、位置追踪',
    actionPoints: 5,
    handSize: 3,
    background: '操控空间维度的攻击者。利用"三个科"中的空间维度，通过位置伪装、空间跳跃等手段，在安全网络空间中自由穿梭，避开防御方的空间监控。',
    skills: [
      {
        id: 'spatial_jump',
        name: '空间跳跃',
        type: 'active',
        description: '在不同网络空间之间跳跃',
        effect: '将所有标记移动到不同区域，敌方1回合内无法追踪',
        cooldown: 3,
      },
      {
        id: 'location_spoofing',
        name: '位置伪装',
        type: 'passive',
        description: '伪装攻击来源的真实位置',
        effect: '敌方定位类卡牌有50%概率定位错误',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF124-1T5',
        name: '空间操控',
        description: '操控网络空间维度进行攻击。效果：渗透+6，位置伪装。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，空间攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第125关：两个情
// 主题：威胁情报、已知未知威胁
// ============================================

const LEVEL125_ENEMIES: EnemyCharacter[] = [
  {
    id: 'known_intel_thief',
    name: '已知情报窃取者',
    nameEn: 'Known Intel Thief',
    level: 125,
    type: '情报型敌人',
    attackStyle: '情报窃取、已知威胁利用',
    weakness: '情报保护、威胁更新',
    actionPoints: 6,
    handSize: 4,
    background: '专门窃取已知威胁情报的攻击者。利用网络安全"两个情"（已知威胁情报、未知威胁情报）中的已知情报，通过窃取防御方的威胁情报库，了解其防御策略并寻找绕过方法。',
    skills: [
      {
        id: 'intel_theft',
        name: '情报窃取',
        type: 'active',
        description: '窃取敌方的威胁情报',
        effect: '查看敌方所有威胁情报卡牌，并选择1张使其失效',
        cooldown: 3,
      },
      {
        id: 'known_threat_exploitation',
        name: '已知威胁利用',
        type: 'passive',
        description: '利用已知的威胁情报绕过防御',
        effect: '敌方使用已知威胁对应的防御卡牌时效果-40%',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF125-1T5',
        name: '情报窃取',
        description: '窃取已知威胁情报。效果：渗透+7，敌方情报失效。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 5 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，情报窃取' }],
      } as Card,
    ],
  },
  {
    id: 'unknown_threat_actor',
    name: '未知威胁行为者',
    nameEn: 'Unknown Threat Actor',
    level: 125,
    type: '未知型敌人',
    attackStyle: '零日攻击、未知威胁',
    weakness: '行为分析、异常检测',
    actionPoints: 7,
    handSize: 5,
    background: '利用未知威胁进行攻击的高级威胁行为者。专门针对"两个情"中的未知威胁盲区，使用零日漏洞、新型攻击手法等防御方未知的技术，在防御体系反应过来之前完成渗透。',
    skills: [
      {
        id: 'zero_day_exploitation',
        name: '零日利用',
        type: 'active',
        description: '使用零日漏洞进行攻击',
        effect: '无视敌方所有防御直接渗透，造成8点渗透值',
        cooldown: 5,
      },
      {
        id: 'unknown_technique',
        name: '未知技术',
        type: 'passive',
        description: '使用防御方未知的技术',
        effect: '敌方所有基于已知威胁情报的防御有50%概率失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF125-1T5',
        name: '未知威胁',
        description: '利用未知威胁进行攻击。效果：渗透+9，零日攻击。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 5 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，未知威胁' }],
      } as Card,
    ],
  },
];

// ============================================
// 第126关：一个事
// 主题：安全事件、事件分析
// ============================================

const LEVEL126_ENEMIES: EnemyCharacter[] = [
  {
    id: 'incident_manipulator',
    name: '事件操控者',
    nameEn: 'Incident Manipulator',
    level: 126,
    type: '事件型敌人',
    attackStyle: '事件伪造、响应干扰',
    weakness: '事件验证、响应流程',
    actionPoints: 6,
    handSize: 4,
    background: '操控安全事件的攻击者。利用网络安全"一个事"（安全事件）的概念，通过伪造安全事件、干扰事件响应流程等手段，让防御方疲于应对虚假事件，从而掩护真实攻击。',
    skills: [
      {
        id: 'incident_forgery',
        name: '事件伪造',
        type: 'active',
        description: '伪造虚假安全事件',
        effect: '在敌方区域制造3个"虚假事件"标记，消耗其响应资源',
        cooldown: 3,
      },
      {
        id: 'response_interference',
        name: '响应干扰',
        type: 'passive',
        description: '干扰安全事件响应流程',
        effect: '敌方响应类卡牌有40%概率被延迟1回合',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF126-1T5',
        name: '事件伪造',
        description: '伪造安全事件干扰响应。效果：渗透+7，响应干扰。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7，事件伪造' }],
      } as Card,
    ],
  },
  {
    id: 'analysis_saboteur',
    name: '分析破坏者',
    nameEn: 'Analysis Saboteur',
    level: 126,
    type: '分析型敌人',
    attackStyle: '分析干扰、溯源破坏',
    weakness: '多源验证、独立分析',
    actionPoints: 5,
    handSize: 3,
    background: '破坏安全事件分析的攻击者。专门针对安全事件的事后分析阶段，通过污染证据、干扰溯源等手段，让防御方无法从安全事件中学习改进，重复犯同样的错误。',
    skills: [
      {
        id: 'evidence_contamination',
        name: '证据污染',
        type: 'active',
        description: '污染安全事件的证据链',
        effect: '清除场上所有"证据"标记，敌方下回合无法使用分析类卡牌',
        cooldown: 3,
      },
      {
        id: 'attribution_interference',
        name: '溯源干扰',
        type: 'passive',
        description: '干扰攻击溯源分析',
        effect: '敌方溯源类卡牌有50%概率得到错误结果',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF126-1T5',
        name: '分析破坏',
        description: '破坏安全事件分析流程。效果：渗透+6，分析干扰。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 4, funds: 3, information: 4 },
        difficulty: 6,
        effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6，分析破坏' }],
      } as Card,
    ],
  },
];

// ============================================
// 第135关：AI换脸——眼见就一定为实吗？
// 主题：AI换脸、Deepfake诈骗、视频伪造
// ============================================

const LEVEL135_ENEMIES: EnemyCharacter[] = [
  {
    id: 'deepfake_fraudster',
    name: 'AI换脸诈骗者',
    nameEn: 'Deepfake Fraudster',
    level: 135,
    type: 'AI伪造型敌人',
    attackStyle: '视频伪造、身份冒充、电信诈骗',
    weakness: '多因素验证、人工核实',
    actionPoints: 6,
    handSize: 4,
    background: '利用AI换脸和AI换声技术实施电信诈骗的犯罪分子。他们通过伪造熟人的视频通话，诱导受害者转账汇款。福州郭先生10分钟被骗430万元就是典型案例。',
    skills: [
      {
        id: 'face_swap_fraud',
        name: 'AI换脸欺诈',
        type: 'active',
        description: '伪造熟人视频通话诱导转账',
        effect: '目标必须弃置2张手牌或损失3点资金资源',
        cooldown: 2,
      },
      {
        id: 'voice_synthesis',
        name: '语音合成',
        type: 'passive',
        description: '利用AI合成目标信任的人的声音',
        effect: '友方在该区域使用防御卡牌时，有40%概率因"声音迷惑"而失效',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF135-1T5',
        name: 'AI换脸诈骗',
        description: '使用Deepfake技术伪造视频通话，冒充熟人实施电信诈骗。效果：渗透+8，诈骗成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，AI换脸诈骗' }],
      } as Card,
    ],
  },
  {
    id: 'ai_singer_impersonator',
    name: 'AI歌手冒充者',
    nameEn: 'AI Singer Impersonator',
    level: 135,
    type: 'AI滥用型敌人',
    attackStyle: '声音克隆、版权侵权、肖像盗用',
    weakness: '数字水印、版权保护',
    actionPoints: 5,
    handSize: 3,
    background: '利用AI技术克隆歌手声音制作翻唱作品的侵权者。他们未经授权使用艺人肖像和声音进行商业活动，侵犯肖像权和著作权。',
    skills: [
      {
        id: 'voice_cloning',
        name: '声音克隆',
        type: 'active',
        description: '克隆目标声音用于非法用途',
        effect: '窃取目标2点信息资源，并在该区域放置1个标记',
        cooldown: 2,
      },
      {
        id: 'portrait_infringement',
        name: '肖像侵权',
        type: 'passive',
        description: '未经授权使用他人肖像牟利',
        effect: '每回合有50%概率额外窃取1点资金资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF135-1T5',
        name: 'AI换脸诈骗',
        description: '使用Deepfake技术伪造视频通话，冒充熟人实施电信诈骗。效果：渗透+8，诈骗成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 4, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，AI换脸诈骗' }],
      } as Card,
    ],
  },
];

// ============================================
// 第136关：进口芯片的秘密数据收集
// 主题：芯片级监控、硬件后门、供应链安全
// ============================================

const LEVEL136_ENEMIES: EnemyCharacter[] = [
  {
    id: 'chip_spy',
    name: '芯片间谍',
    nameEn: 'Chip Spy',
    level: 136,
    type: '硬件间谍型敌人',
    attackStyle: '芯片级数据收集、硬件后门、隐私窃取',
    weakness: '开源硬件、供应链审计',
    actionPoints: 6,
    handSize: 4,
    background: '利用芯片硬件层面收集用户数据的间谍。即使在无官方Android系统的手机上，带有特定品牌芯片的智能手机仍会秘密向企业发送个人数据，包括设备ID、位置、IP地址等敏感信息。',
    skills: [
      {
        id: 'hardware_backdoor',
        name: '硬件后门',
        type: 'active',
        description: '通过芯片硬件层面收集数据',
        effect: '无视软件防御，直接窃取目标3点信息资源',
        cooldown: 3,
      },
      {
        id: 'stealth_transmission',
        name: '隐蔽传输',
        type: 'passive',
        description: '数据在未经用户同意、未加密的情况下发送',
        effect: '敌方放置的标记无法被常规检测手段发现，持续2回合',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF136-1T5',
        name: '芯片级监控',
        description: '通过芯片硬件层面秘密收集设备ID、位置、IP地址等敏感信息并上传至境外服务器。效果：渗透+9，数据收集成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，芯片级监控' }],
      } as Card,
    ],
  },
  {
    id: 'supply_chain_infiltrator',
    name: '供应链渗透者',
    nameEn: 'Supply Chain Infiltrator',
    level: 136,
    type: '供应链攻击型敌人',
    attackStyle: '供应链污染、组件植入、广泛传播',
    weakness: '供应链审计、组件验证',
    actionPoints: 5,
    handSize: 3,
    background: '通过污染供应链进行大规模攻击的敌人。某品牌芯片广泛应用于众多智能手机品牌，任何使用该芯片的手机厂商都可能在不知情的情况下帮助其收集用户数据。',
    skills: [
      {
        id: 'supply_chain_contamination',
        name: '供应链污染',
        type: 'active',
        description: '通过供应链环节植入恶意组件',
        effect: '在所有有友方标记的区域各放置1个敌方标记',
        cooldown: 3,
      },
      {
        id: 'widespread_infection',
        name: '广泛传播',
        type: 'passive',
        description: '利用供应链广泛传播攻击',
        effect: '每回合结束时，有30%概率在随机区域额外放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF136-1T5',
        name: '芯片级监控',
        description: '通过芯片硬件层面秘密收集设备ID、位置、IP地址等敏感信息并上传至境外服务器。效果：渗透+9，数据收集成功率90%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，芯片级监控' }],
      } as Card,
    ],
  },
];

// ============================================
// 第137关：全球志——应急响应锦囊
// 主题：应急响应、威胁情报、全球化安全
// ============================================

const LEVEL137_ENEMIES: EnemyCharacter[] = [
  {
    id: 'apt_threat',
    name: 'APT高级威胁',
    nameEn: 'APT Advanced Threat',
    level: 137,
    type: 'APT型敌人',
    attackStyle: '隐蔽潜伏、持续渗透、全球化攻击',
    weakness: '威胁情报共享、应急响应',
    actionPoints: 7,
    handSize: 5,
    background: '具有全球化攻击能力的高级持续性威胁。随着APT等隐蔽性网络安全事件日益加剧，全球各国的威胁情报能力需要与时俱进的体系建设。',
    skills: [
      {
        id: 'persistent_attack',
        name: '持续性攻击',
        type: 'active',
        description: '长期潜伏并持续渗透目标',
        effect: '在目标区域放置2个标记，且该区域的友方标记-1',
        cooldown: 2,
      },
      {
        id: 'global_coordination',
        name: '全球协同',
        type: 'passive',
        description: '利用全球化网络协同攻击',
        effect: '每回合可以额外选择1个区域放置标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF137-1T5',
        name: '全球化APT攻击',
        description: '利用全球化网络基础设施发动高级持续性威胁攻击，隐蔽性强且难以检测。效果：渗透+9，APT攻击成功率88%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 6 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，全球化APT攻击' }],
      } as Card,
    ],
  },
  {
    id: 'ransomware_gang',
    name: '勒索软件团伙',
    nameEn: 'Ransomware Gang',
    level: 137,
    type: '勒索软件型敌人',
    attackStyle: '勒索病毒、数据加密、双重勒索',
    weakness: '备份恢复、应急响应',
    actionPoints: 6,
    handSize: 4,
    background: '运营勒索软件的犯罪团伙。他们通过加密受害者数据索要赎金，甚至威胁公开敏感数据实施双重勒索。应急响应能力对于应对此类威胁至关重要。',
    skills: [
      {
        id: 'data_encryption',
        name: '数据加密',
        type: 'active',
        description: '加密目标数据索要赎金',
        effect: '目标区域友方标记-2，且下回合无法在该区域放置标记',
        cooldown: 3,
      },
      {
        id: 'double_extortion',
        name: '双重勒索',
        type: 'passive',
        description: '威胁公开敏感数据',
        effect: '当友方标记被移除时，有40%概率窃取目标2点信息资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF137-1T5',
        name: '全球化APT攻击',
        description: '利用全球化网络基础设施发动高级持续性威胁攻击，隐蔽性强且难以检测。效果：渗透+9，APT攻击成功率88%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 4, information: 6 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 9, description: '渗透+9，全球化APT攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第138关：LED灯读取密码
// 主题：侧信道攻击、物理安全、电磁泄露
// ============================================

const LEVEL138_ENEMIES: EnemyCharacter[] = [
  {
    id: 'side_channel_attacker',
    name: '侧信道攻击者',
    nameEn: 'Side Channel Attacker',
    level: 138,
    type: '侧信道攻击型敌人',
    attackStyle: 'LED分析、功耗监测、密码恢复',
    weakness: '物理隔离、电磁屏蔽',
    actionPoints: 6,
    handSize: 4,
    background: '利用侧信道攻击技术窃取密码的专家。通过分析设备LED灯的亮度变化、功耗模式等物理特性，可以从智能卡中恢复256位ECDSA密钥，甚至从三星Galaxy S8手机中提取378位SIKE密钥。',
    skills: [
      {
        id: 'led_analysis',
        name: 'LED分析',
        type: 'active',
        description: '通过LED灯闪烁频率分析密码计算',
        effect: '揭示目标区域所有友方标记，并窃取2点算力资源',
        cooldown: 2,
      },
      {
        id: 'power_monitoring',
        name: '功耗监测',
        type: 'passive',
        description: '监测设备功耗变化获取信息',
        effect: '友方在该区域使用高消耗卡牌时，有50%概率被窃取1点随机资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF138-1T5',
        name: 'LED侧信道攻击',
        description: '通过分析设备LED灯亮度变化和功耗模式，恢复加密密钥和敏感数据。效果：渗透+8，密钥恢复成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，LED侧信道攻击' }],
      } as Card,
    ],
  },
  {
    id: 'air_gap_intruder',
    name: '气隙网络入侵者',
    nameEn: 'Air Gap Intruder',
    level: 138,
    type: '物理渗透型敌人',
    attackStyle: '气隙突破、物理接触、离线攻击',
    weakness: '严格物理隔离、安全审计',
    actionPoints: 5,
    handSize: 3,
    background: '专门攻击物理隔离网络（气隙网络）的高级攻击者。他们通过控制计算机LED灯将其变成信号系统，利用恶意软件控制LED灯以4000bps速度传输数据，甚至可以通过无人机在建筑物外20米处读取信号。',
    skills: [
      {
        id: 'led_transmission',
        name: 'LED信号传输',
        type: 'active',
        description: '控制LED灯闪烁传输数据',
        effect: '即使区域有物理隔离，仍可放置2个标记',
        cooldown: 3,
      },
      {
        id: 'drone_surveillance',
        name: '无人机监控',
        type: 'passive',
        description: '利用无人机远程读取LED信号',
        effect: '可以在友方认为安全的区域放置标记，不受常规限制',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF138-1T5',
        name: 'LED侧信道攻击',
        description: '通过分析设备LED灯亮度变化和功耗模式，恢复加密密钥和敏感数据。效果：渗透+8，密钥恢复成功率85%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 5 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，LED侧信道攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第139关：草船借箭——应急响应妙计
// 主题：威胁情报、四量四知、战略预判
// ============================================

const LEVEL139_ENEMIES: EnemyCharacter[] = [
  {
    id: 'intelligence_thief',
    name: '情报窃取者',
    nameEn: 'Intelligence Thief',
    level: 139,
    type: '情报窃取型敌人',
    attackStyle: '情报收集、数据分析、战略预判',
    weakness: '情报共享、先知能力',
    actionPoints: 6,
    handSize: 4,
    background: '专注于窃取威胁情报的敌人。他们试图获取安全事件的历史数据、代码特征、产业情报等，利用"四量"（存量、增量、变量、能量）进行威胁分析和预测。',
    skills: [
      {
        id: 'intelligence_harvesting',
        name: '情报收集',
        type: 'active',
        description: '收集目标的威胁情报数据',
        effect: '窃取目标3点信息资源，并查看目标手牌',
        cooldown: 2,
      },
      {
        id: 'strategic_prediction',
        name: '战略预判',
        type: 'passive',
        description: '基于情报预测目标行动',
        effect: '友方在敌方所在区域使用卡牌前，敌方可以查看该卡牌并选择是否阻止',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF139-1T5',
        name: '情报窃取攻击',
        description: '窃取威胁情报数据，分析历史安全事件和代码特征，预测防御策略。效果：渗透+8，情报窃取成功率87%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 6 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，情报窃取攻击' }],
      } as Card,
    ],
  },
  {
    id: 'unknown_threat',
    name: '未知威胁体',
    nameEn: 'Unknown Threat',
    level: 139,
    type: '未知威胁型敌人',
    attackStyle: '未知攻击、零日利用、隐蔽渗透',
    weakness: '先知能力、专知防御',
    actionPoints: 7,
    handSize: 5,
    background: '代表网络安全中的"未知威胁"。正如威胁情报中的"应知、深知、专知、先知"四知概念，未知威胁是最难防御的，需要具备先知能力才能提前预警。',
    skills: [
      {
        id: 'unknown_attack',
        name: '未知攻击',
        type: 'active',
        description: '使用未知方法发动攻击',
        effect: '无视目标防御，直接放置3个标记',
        cooldown: 3,
      },
      {
        id: 'stealth_penetration',
        name: '隐蔽渗透',
        type: 'passive',
        description: '难以被常规手段检测',
        effect: '敌方标记在被放置后的2回合内无法被移除',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF139-1T5',
        name: '情报窃取攻击',
        description: '窃取威胁情报数据，分析历史安全事件和代码特征，预测防御策略。效果：渗透+8，情报窃取成功率87%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 5, funds: 3, information: 6 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8，情报窃取攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第140关：对地震检测中心进行网络攻击
// 主题：关键基础设施、国家级攻击、数据安全
// ============================================

const LEVEL140_ENEMIES: EnemyCharacter[] = [
  {
    id: 'critical_infra_attacker',
    name: '关键基础设施攻击者',
    nameEn: 'Critical Infrastructure Attacker',
    level: 140,
    type: '关键基础设施型敌人',
    attackStyle: '关键设施攻击、数据窃取、国家安全威胁',
    weakness: '关键基础设施保护、国家级防御',
    actionPoints: 7,
    handSize: 5,
    background: '专门针对关键基础设施进行攻击的敌人。我国某地震监测中心遭到境外具有政府背景的黑客组织攻击，地震数据关乎国家安全，可推导出地下结构和岩性，推测军事基地位置。',
    skills: [
      {
        id: 'seismic_data_theft',
        name: '地震数据窃取',
        type: 'active',
        description: '窃取地震监测数据推导地下结构',
        effect: '窃取目标4点信息资源，并在该区域放置2个标记',
        cooldown: 2,
      },
      {
        id: 'infrastructure_disruption',
        name: '设施破坏',
        type: 'passive',
        description: '破坏关键基础设施运行',
        effect: '目标区域每有1个敌方标记，友方在该区域的行动点消耗+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF140-1T5',
        name: '关键基础设施攻击',
        description: '针对地震监测中心等关键基础设施发动网络攻击，窃取地震数据推导军事设施位置。效果：渗透+10，数据窃取成功率92%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 6 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，关键基础设施攻击' }],
      } as Card,
    ],
  },
  {
    id: 'nation_state_hacker',
    name: '国家级黑客',
    nameEn: 'Nation-State Hacker',
    level: 140,
    type: '国家级攻击型敌人',
    attackStyle: '国家级资源、战略情报收集、长期潜伏',
    weakness: '国际合作、态势感知',
    actionPoints: 8,
    handSize: 6,
    background: '具有政府背景的黑客组织成员。他们对地震检测中心进行网络攻击，目的是获取可用于军事目的的地质数据。这是继西北工业大学遭受网络攻击后又一针对我国关键机构的网络攻击案例。',
    skills: [
      {
        id: 'strategic_intelligence',
        name: '战略情报',
        type: 'active',
        description: '收集具有战略价值的情报',
        effect: '查看目标所有手牌和资源，并选择一种资源窃取3点',
        cooldown: 3,
      },
      {
        id: 'long_term_lurking',
        name: '长期潜伏',
        type: 'passive',
        description: '在目标系统中长期潜伏',
        effect: '每回合结束时，如果该回合未放置标记，则下回合放置标记时额外+1',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF140-1T5',
        name: '关键基础设施攻击',
        description: '针对地震监测中心等关键基础设施发动网络攻击，窃取地震数据推导军事设施位置。效果：渗透+10，数据窃取成功率92%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'rare',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 6 },
        difficulty: 7,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，关键基础设施攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第141关：产业志——链式安全锦囊
// 主题：产业链安全、供应链韧性、双态IT
// ============================================

const LEVEL141_ENEMIES: EnemyCharacter[] = [
  {
    id: 'supply_chain_attacker',
    name: '供应链攻击者',
    nameEn: 'Supply Chain Attacker',
    level: 141,
    type: '供应链攻击型敌人',
    attackStyle: '供应链污染、软件投毒、广泛传播',
    weakness: '供应链审计、零信任架构',
    actionPoints: 7,
    handSize: 5,
    background: '利用供应链进行大规模攻击的敌人。他们通过污染软件供应链、植入后门，影响众多下游企业。链式安全需要围绕"高韧性提质、高能级增效、高安全降本"三个维度建设。',
    skills: [
      {
        id: 'software_poisoning',
        name: '软件投毒',
        type: 'active',
        description: '在软件供应链中植入恶意代码',
        effect: '在所有有友方标记的区域各放置1个标记，且这些标记持续3回合无法被移除',
        cooldown: 3,
      },
      {
        id: 'downstream_infection',
        name: '下游感染',
        type: 'passive',
        description: '通过供应链向下游企业传播',
        effect: '当在一个区域放置标记时，相邻区域有40%概率也放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF141-1T5',
        name: '供应链投毒攻击',
        description: '在软件供应链中植入恶意代码，通过软件更新向下游企业传播，影响整个产业链。效果：渗透+10，供应链感染率93%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，供应链投毒攻击' }],
      } as Card,
    ],
  },
  {
    id: 'digital_twin_attacker',
    name: '数字孪生攻击者',
    nameEn: 'Digital Twin Attacker',
    level: 141,
    type: '数字孪生攻击型敌人',
    attackStyle: '数字孪生攻击、虚实结合、物理操控',
    weakness: '数字孪生安全、物理隔离',
    actionPoints: 6,
    handSize: 4,
    background: '利用数字孪生技术进行攻击的新型敌人。数字孪生攻击是指攻击者在物理环境和数字环境中同时对目标进行攻击，利用物理和数字系统之间的相互作用威胁安全性。',
    skills: [
      {
        id: 'twin_manipulation',
        name: '孪生操控',
        type: 'active',
        description: '通过操控数字孪生影响物理系统',
        effect: '选择2个区域，在这些区域各放置2个标记',
        cooldown: 2,
      },
      {
        id: 'physical_digital_bridge',
        name: '虚实桥梁',
        type: 'passive',
        description: '利用物理和数字系统的交互',
        effect: '当友方在一个区域放置标记时，可以选择另一个区域也放置1个标记',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF141-1T5',
        name: '供应链投毒攻击',
        description: '在软件供应链中植入恶意代码，通过软件更新向下游企业传播，影响整个产业链。效果：渗透+10，供应链感染率93%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 6, funds: 5, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10，供应链投毒攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 第142关：疏而不漏——链式安全妙计
// 主题：链式安全、疏而不漏、刚柔并济
// ============================================

const LEVEL142_ENEMIES: EnemyCharacter[] = [
  {
    id: 'chain_breaker',
    name: '链条破坏者',
    nameEn: 'Chain Breaker',
    level: 142,
    type: '链条破坏型敌人',
    attackStyle: '链条弱点攻击、成本消耗、韧性破坏',
    weakness: '链式韧性、疏而不漏',
    actionPoints: 7,
    handSize: 5,
    background: '专门针对产业链和供应链薄弱环节进行攻击的敌人。他们利用"疏"的特点，寻找链条中的漏洞进行突破。链式安全建设需要围绕"疏而不漏"展开刚柔并济的实施策略。',
    skills: [
      {
        id: 'weakness_exploitation',
        name: '弱点利用',
        type: 'active',
        description: '针对链条薄弱环节发动攻击',
        effect: '选择友方标记最少的区域，在该区域放置3个标记',
        cooldown: 2,
      },
      {
        id: 'cost_drain',
        name: '成本消耗',
        type: 'passive',
        description: '消耗防御方的资源和成本',
        effect: '每回合开始时，所有友方角色各损失1点随机资源',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF142-1T5',
        name: '链条弱点攻击',
        description: '针对产业链和供应链的薄弱环节发动精准攻击，破坏链条韧性，消耗防御资源。效果：渗透+11，弱点攻击成功率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 7, funds: 6, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 11, description: '渗透+11，链条弱点攻击' }],
      } as Card,
    ],
  },
  {
    id: 'compliance_violator',
    name: '合规破坏者',
    nameEn: 'Compliance Violator',
    level: 142,
    type: '合规破坏型敌人',
    attackStyle: '合规绕过、规范破坏、质量降低',
    weakness: '合规管理、四规审核',
    actionPoints: 6,
    handSize: 4,
    background: '通过破坏合规体系进行攻击的敌人。链式安全中的"四规"（合作规范、培训规范、管理规范、审核规范）是基本要求，而合规破坏者专门寻找合规漏洞进行渗透。',
    skills: [
      {
        id: 'compliance_bypass',
        name: '合规绕过',
        type: 'active',
        description: '绕过合规检查进行攻击',
        effect: '本回合内无视所有防御效果，放置2个标记',
        cooldown: 3,
      },
      {
        id: 'standard_violation',
        name: '标准违反',
        type: 'passive',
        description: '违反安全标准降低防御',
        effect: '友方在该区域使用防御卡牌时，有35%概率因"标准不符"而效果减半',
      },
    ],
    specialCards: [
      {
        card_code: 'DEF142-1T5',
        name: '链条弱点攻击',
        description: '针对产业链和供应链的薄弱环节发动精准攻击，破坏链条韧性，消耗防御资源。效果：渗透+11，弱点攻击成功率95%。',
        type: 'attack',
        faction: 'attack',
        rarity: 'epic',
        techLevel: 5,
        cost: { compute: 7, funds: 6, information: 6 },
        difficulty: 8,
        effects: [{ type: 'infiltration_gain', baseValue: 11, description: '渗透+11，链条弱点攻击' }],
      } as Card,
    ],
  },
];

// ============================================
// 导出所有敌人
// ============================================

export const LEVEL_ENEMIES: EnemyCharacter[] = [
  ...LEVEL1_ENEMIES,
  ...LEVEL2_ENEMIES,
  ...LEVEL3_ENEMIES,
  ...LEVEL4_ENEMIES,
  ...LEVEL5_ENEMIES,
  ...LEVEL6_ENEMIES,
  ...LEVEL7_ENEMIES,
  ...LEVEL8_ENEMIES,
  ...LEVEL9_ENEMIES,
  ...LEVEL80_ENEMIES,
  ...LEVEL81_ENEMIES,
  ...LEVEL82_ENEMIES,
  ...LEVEL83_ENEMIES,
  ...LEVEL84_ENEMIES,
  ...LEVEL85_ENEMIES,
  ...LEVEL86_ENEMIES,
  ...LEVEL87_ENEMIES,
  ...LEVEL88_ENEMIES,
  ...LEVEL89_ENEMIES,
  ...LEVEL90_ENEMIES,
  ...LEVEL91_ENEMIES,
  ...LEVEL92_ENEMIES,
  ...LEVEL93_ENEMIES,
  ...LEVEL94_ENEMIES,
  ...LEVEL95_ENEMIES,
  ...LEVEL96_ENEMIES,
  ...LEVEL97_ENEMIES,
  ...LEVEL98_ENEMIES,
  ...LEVEL99_ENEMIES,
  ...LEVEL100_ENEMIES,
  ...LEVEL101_ENEMIES,
  ...LEVEL102_ENEMIES,
  ...LEVEL103_ENEMIES,
  ...LEVEL104_ENEMIES,
  ...LEVEL105_ENEMIES,
  ...LEVEL106_ENEMIES,
  ...LEVEL107_ENEMIES,
  ...LEVEL108_ENEMIES,
  ...LEVEL109_ENEMIES,
  ...LEVEL110_ENEMIES,
  ...LEVEL111_ENEMIES,
  ...LEVEL112_ENEMIES,
  ...LEVEL113_ENEMIES,
  ...LEVEL114_ENEMIES,
  ...LEVEL115_ENEMIES,
  ...LEVEL116_ENEMIES,
  ...LEVEL117_ENEMIES,
  ...LEVEL118_ENEMIES,
  ...LEVEL119_ENEMIES,
  ...LEVEL120_ENEMIES,
  ...LEVEL121_ENEMIES,
  ...LEVEL122_ENEMIES,
  ...LEVEL123_ENEMIES,
  ...LEVEL124_ENEMIES,
  ...LEVEL125_ENEMIES,
  ...LEVEL126_ENEMIES,
  ...LEVEL127_ENEMIES,
  ...LEVEL128_ENEMIES,
  ...LEVEL129_ENEMIES,
  ...LEVEL130_ENEMIES,
  ...LEVEL131_ENEMIES,
  ...LEVEL132_ENEMIES,
  ...LEVEL133_ENEMIES,
  ...LEVEL134_ENEMIES,
  ...LEVEL135_ENEMIES,
  ...LEVEL136_ENEMIES,
  ...LEVEL137_ENEMIES,
  ...LEVEL138_ENEMIES,
  ...LEVEL139_ENEMIES,
  ...LEVEL140_ENEMIES,
  ...LEVEL141_ENEMIES,
  ...LEVEL142_ENEMIES,
];

// 按关卡获取敌人
export function getEnemiesByLevel(level: number): EnemyCharacter[] {
  return LEVEL_ENEMIES.filter(enemy => enemy.level === level);
}

// 根据ID获取敌人
export function getEnemyById(id: string): EnemyCharacter | undefined {
  return LEVEL_ENEMIES.find(enemy => enemy.id === id);
}

export default LEVEL_ENEMIES;
