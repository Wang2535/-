import type { EnemyConfig } from '@/types/levelTypes';

/**
 * 敌人数据库
 * 包含所有关卡中出现的敌人配置
 */

export interface EnemyDefinition {
  id: string;
  name: string;
  type: EnemyConfig['type'];
  description: string;
  baseDifficulty: number;
  resourceBonus: number;
  attackPattern: EnemyConfig['attackPattern'];
  specialAbilities: EnemyConfig['specialAbilities'];
  traits?: string[];
  weakness?: string[];
}

// ============================================
// 第1-9关敌人 (原有)
// ============================================

const EARLY_GAME_ENEMIES: EnemyDefinition[] = [
  {
    id: 'elk_cloner',
    name: 'Elk Cloner',
    type: 'virus',
    description: '世界上第一款个人计算机病毒，通过软盘传播，每启动50次会显示一首诗',
    baseDifficulty: 1,
    resourceBonus: 1,
    attackPattern: [
      { turn: 'all', action: 'soft_infection', intensity: 'low' },
      { turn: 3, action: 'poem_trigger', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '软盘感染', description: '每回合自动感染一个新区域', trigger: '每回合', effect: '区域感染', cooldown: 1 },
      { name: '持久化', description: '第50次启动时显示诗歌并造成混乱', trigger: '累计50标记', effect: '系统混乱', cooldown: 0 }
    ],
    traits: ['软盘传播', '隐蔽性强'],
    weakness: ['签名接种', '系统重写']
  },
  {
    id: 'skrenta_spreader',
    name: '斯克伦塔传播者',
    type: 'virus',
    description: '里奇·斯克伦塔创造的病毒变体，擅长快速复制',
    baseDifficulty: 1,
    resourceBonus: 1,
    attackPattern: [
      { turn: 'all', action: 'memory_infection', intensity: 'low' }
    ],
    specialAbilities: [
      { name: '内存驻留', description: '感染后常驻内存，难以清除', trigger: '感染成功', effect: '持久化', cooldown: 0 }
    ],
    weakness: ['系统重启', '内存清理']
  },
  {
    id: 'rebel_moss',
    name: '反叛者莫斯',
    type: 'hacker',
    description: '利用社会工程学进行攻击的黑客，擅长心理操控',
    baseDifficulty: 2,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'social_engineering', intensity: 'medium' },
      { turn: 2, action: 'trust_exploit', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '获得信任后发动强力攻击', trigger: '信任满值', effect: '强力攻击', cooldown: 2 }
    ],
    traits: ['心理操控', '善于伪装'],
    weakness: ['安全意识', '多因素认证']
  },
  {
    id: 'ai_attacker',
    name: 'AI攻击者',
    type: 'ai',
    description: '具有自主决策能力的人工智能攻击系统',
    baseDifficulty: 2,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'calculation_negation', intensity: 'medium' },
      { turn: 3, action: 'ai_evolution', intensity: 'high' }
    ],
    specialAbilities: [
      { name: 'AI模型误导', description: '否定玩家的计算和决策', trigger: '玩家行动', effect: '行动干扰', cooldown: 1 },
      { name: '技能强化', description: '根据玩家行为自我进化', trigger: '每3回合', effect: '能力提升', cooldown: 3 }
    ],
    weakness: ['人工干预', '行为异常检测']
  },
  {
    id: 'panda_burning',
    name: '熊猫烧香',
    type: 'worm',
    description: '著名的蠕虫病毒，会感染可执行文件并改变图标',
    baseDifficulty: 2,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'exe_infection', intensity: 'medium' },
      { turn: 2, action: 'icon_change', intensity: 'low' }
    ],
    specialAbilities: [
      { name: '文档感染', description: '感染所有可执行文件', trigger: '每回合', effect: '文件感染', cooldown: 1 },
      { name: '模板污染', description: '将文件图标改为熊猫烧香图案', trigger: '感染成功', effect: '视觉破坏', cooldown: 0 }
    ],
    weakness: ['网络隔离', '安全意识觉醒']
  },
  {
    id: 'network_worm',
    name: '网络蠕虫',
    type: 'worm',
    description: '利用网络漏洞自动传播的蠕虫',
    baseDifficulty: 2,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'vulnerability_scan', intensity: 'medium' },
      { turn: 1, action: 'auto_replicate', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '网络扫描', description: '自动扫描网络中的漏洞', trigger: '每回合', effect: '漏洞发现', cooldown: 1 },
      { name: '快速复制', description: '无需人为干预即可自我复制', trigger: '发现漏洞', effect: '自动传播', cooldown: 0 }
    ],
    weakness: ['补丁管理', '网络分段']
  },
  {
    id: 'flame_virus',
    name: '火焰病毒',
    type: 'apt',
    description: '模块化的复杂恶意软件，采用组件化攻击',
    baseDifficulty: 3,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'module_deployment', intensity: 'medium' },
      { turn: 3, action: 'targeted_attack', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '云端突破', description: '先感知环境再决定攻击方式', trigger: '初始部署', effect: '环境感知', cooldown: 0 },
      { name: '配置利用', description: '根据目标加载不同攻击模块', trigger: '感知完成', effect: '精准打击', cooldown: 2 }
    ],
    traits: ['模块化', '可扩展'],
    weakness: ['组件化防御', '火焰检测工具']
  },
  {
    id: 'stuxnet',
    name: '震网病毒',
    type: 'apt',
    description: '专门针对工控系统的超级病毒',
    baseDifficulty: 3,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'ics_targeting', intensity: 'high' },
      { turn: 4, action: 'centrifuge_damage', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '供应链渗透', description: '专门针对工业控制系统', trigger: '每回合', effect: '系统渗透', cooldown: 1 },
      { name: '硬件损坏', description: '不仅破坏软件，还能损坏硬件', trigger: '渗透完成', effect: '物理损坏', cooldown: 0 }
    ],
    weakness: ['物理隔离', '控制器加固']
  },
  {
    id: 'fatal_bug',
    name: '致命Bug',
    type: 'bug',
    description: '软件中的致命缺陷，可能导致系统崩溃',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'random_crash', intensity: 'medium' },
      { turn: 3, action: 'system_failure', intensity: 'high' }
    ],
    specialAbilities: [
      { name: 'DDoS攻击', description: '随机导致系统功能失效', trigger: '每回合', effect: '功能失效', cooldown: 1 },
      { name: '全能攻击', description: '累积到一定程度导致全面故障', trigger: 'Bug累积', effect: '全面崩溃', cooldown: 0 }
    ],
    weakness: ['冗余设计', '安全培训']
  },
  {
    id: 'design_flaw',
    name: '设计缺陷',
    type: 'bug',
    description: '软件架构层面的根本性问题',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 2, action: 'fault_trigger', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '漏洞利用制作', description: '特定条件下触发系统性故障', trigger: '条件满足', effect: '系统性故障', cooldown: 2 }
    ],
    weakness: ['重构设计', '安全审计']
  },
  {
    id: 'goldeneye',
    name: '黄金眼',
    type: 'hacker',
    description: '使用电磁脉冲攻击的工控系统入侵者',
    baseDifficulty: 3,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'emp_attack', intensity: 'high' },
      { turn: 4, action: 'satellite_strike', intensity: 'high' }
    ],
    specialAbilities: [
      { name: 'DDoS攻击', description: '发射EMP破坏电子设备', trigger: '每2回合', effect: '设备瘫痪', cooldown: 2 },
      { name: '云端突破', description: '通过卫星发动远程攻击', trigger: '能量满值', effect: '大范围破坏', cooldown: 4 }
    ],
    weakness: ['物理隔离', '电磁屏蔽']
  },
  {
    id: 'ics_intruder',
    name: '工控入侵者',
    type: 'hacker',
    description: '专门针对工业控制系统的黑客',
    baseDifficulty: 3,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'infrastructure_infiltration', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '供应链渗透', description: '渗透关键基础设施', trigger: '每回合', effect: '基础设施控制', cooldown: 1 }
    ],
    weakness: ['控制器加固', '网络分段']
  },
  {
    id: 'probe_box',
    name: '探针盒子',
    type: 'hacker',
    description: '利用WiFi探针技术窃取用户隐私的设备',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'mac_probe', intensity: 'medium' },
      { turn: 2, action: 'data_correlation', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '网络扫描', description: '获取设备的MAC地址', trigger: '每回合', effect: '信息碎片', cooldown: 1 },
      { name: '身份泛滥', description: '将MAC地址关联到个人信息', trigger: '碎片满值', effect: '精准画像', cooldown: 2 }
    ],
    weakness: ['MAC地址随机化', '隐私安全意识']
  },
  {
    id: 'privacy_thief',
    name: '隐私窃贼',
    type: 'hacker',
    description: '专门窃取个人隐私数据的攻击者',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'privacy_harvest', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '收集用户的隐私信息', trigger: '每回合', effect: '隐私卡获取', cooldown: 1 }
    ],
    weakness: ['隐私保护', '数据加密']
  },
  {
    id: 'dr_sivana',
    name: '希瓦纳博士',
    type: 'hacker',
    description: '密码破解专家，掌握七宗罪之力',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'crypto_analysis', intensity: 'medium' },
      { turn: 4, action: 'brute_force', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '暴力破解', description: '分析并破解加密密码', trigger: '每2回合', effect: '标记解密', cooldown: 2 },
      { name: '技能强化', description: '破解成功后获得强化', trigger: '解密成功', effect: '能力增强', cooldown: 0 }
    ],
    weakness: ['多因素认证', '密钥更新']
  },
  {
    id: 'code_breaker',
    name: '密码破译者',
    type: 'hacker',
    description: '专业的密码学攻击者',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'historical_attack', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '彩虹表攻击', description: '利用古典密码的弱点', trigger: '古典密码区', effect: '效果增强', cooldown: 0 }
    ],
    weakness: ['现代加密', '密钥管理']
  },
  {
    id: 'account_thief',
    name: '盗号黑手',
    type: 'hacker',
    description: '专门盗取用户账号的犯罪分子',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'phishing_trap', intensity: 'high' },
      { turn: 3, action: 'credential_stuffing', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '设置陷阱窃取账号信息', trigger: '每2回合', effect: '陷阱设置', cooldown: 2 },
      { name: '暴力破解', description: '利用泄露的密码批量尝试', trigger: '拥有信息', effect: '批量破解', cooldown: 1 }
    ],
    weakness: ['异常行为检测', '多因素认证']
  },
  {
    id: 'account_farm',
    name: '做号集团',
    type: 'hacker',
    description: '批量制造和贩卖虚假账号的黑产组织',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'bulk_account_creation', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '身份泛滥', description: '快速创建大量虚假账号', trigger: '每回合', effect: '黑产运营', cooldown: 1 }
    ],
    weakness: ['设备指纹识别', '实名制验证']
  }
];

// ============================================
// 第21-25关敌人
// ============================================

const LEVEL_21_25_ENEMIES: EnemyDefinition[] = [
  {
    id: 'black_hat_hacker',
    name: '黑帽黑客',
    type: 'hacker',
    description: 'DEF CON大会上的顶级黑帽黑客，掌握零日漏洞',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'zero_day_exploit', intensity: 'high' },
      { turn: 3, action: 'social_engineering', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '零日漏洞利用', description: '使用未公开的漏洞进行攻击', trigger: '每3回合', effect: '无视防御', cooldown: 3 },
      { name: '完美伪装', description: '通过心理操控窃取信息', trigger: '每回合', effect: '手牌窃取', cooldown: 2 }
    ],
    traits: ['技术高超', '善于隐藏'],
    weakness: ['漏洞利用演示', 'CTF竞赛']
  },
  {
    id: 'defcon_attendee',
    name: 'DEF CON参会者',
    type: 'hacker',
    description: '参加黑客大会的安全研究人员',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'tech_showcase', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '漏洞利用制作', description: '展示最新的攻击技术', trigger: '每2回合', effect: '技术演示', cooldown: 2 }
    ],
    weakness: ['安全知识', '技术交流']
  },
  {
    id: 'y2k_bug',
    name: '千年虫Bug',
    type: 'bug',
    description: '由于年份表示问题导致的全球性软件缺陷',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'date_overflow', intensity: 'high' },
      { turn: 2, action: 'system_confusion', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '零日漏洞', description: '将2000年识别为1900年', trigger: '日期相关', effect: '系统混乱', cooldown: 0 },
      { name: '配置利用', description: '导致日期计算错误', trigger: '每2回合', effect: '计算错误', cooldown: 2 }
    ],
    traits: ['时间敏感', '影响广泛'],
    weakness: ['日期补丁', '系统升级']
  },
  {
    id: 'date_overflow',
    name: '日期溢出攻击者',
    type: 'bug',
    description: '利用日期格式漏洞进行攻击',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'format_exploit', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '漏洞利用制作', description: '利用日期格式缺陷', trigger: '日期操作', effect: '格式错误', cooldown: 1 }
    ],
    weakness: ['输入验证', '日期标准化']
  },
  {
    id: 'msn_worm',
    name: 'MSN蠕虫',
    type: 'worm',
    description: '通过即时通讯软件传播的社交蠕虫',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'message_spread', intensity: 'high' },
      { turn: 2, action: 'contact_harvest', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '快速复制', description: '通过聊天消息自动传播', trigger: '每回合', effect: '好友感染', cooldown: 1 },
      { name: '数据外传', description: '窃取用户联系人列表', trigger: '感染成功', effect: '列表获取', cooldown: 2 }
    ],
    traits: ['社交传播', '隐蔽性强'],
    weakness: ['消息过滤', '链接检测']
  },
  {
    id: 'social_spreader',
    name: '社交传播者',
    type: 'worm',
    description: '利用社交网络关系进行传播',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'social_chain', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '网络传播', description: '利用好友关系快速传播', trigger: '好友互动', effect: '链式感染', cooldown: 1 }
    ],
    weakness: ['社交安全意识', '好友验证']
  },
  {
    id: 'michelangelo_virus',
    name: '米开朗基罗病毒',
    type: 'virus',
    description: '在特定日期（3月6日）发作的恶性病毒',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'stealth_infection', intensity: 'medium' },
      { turn: 5, action: 'payload_delivery', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '内存驻留', description: '长期潜伏等待触发日期', trigger: '非触发日', effect: '静默感染', cooldown: 0 },
      { name: 'DDoS攻击', description: '在特定日期释放破坏载荷', trigger: '3月6日', effect: '大规模破坏', cooldown: 0 }
    ],
    traits: ['日期触发', '破坏性强'],
    weakness: ['日期检查', '提前清除']
  },
  {
    id: 'boot_infector',
    name: '引导区感染器',
    type: 'virus',
    description: '感染硬盘引导扇区的病毒',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'boot_infection', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '引导区感染', description: '感染系统引导扇区', trigger: '系统启动', effect: '启动控制', cooldown: 0 }
    ],
    weakness: ['引导区保护', '杀毒软件']
  },
  {
    id: 'evolving_virus',
    name: '进化型病毒',
    type: 'virus',
    description: '能够不断进化变异的超级病毒',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'adaptive_attack', intensity: 'high' },
      { turn: 3, action: 'evolution_burst', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '技能强化', description: '根据防御方式调整攻击策略', trigger: '被防御', effect: '策略调整', cooldown: 1 },
      { name: '技能强化', description: '定期进化获得新能力', trigger: '每3回合', effect: '能力进化', cooldown: 3 }
    ],
    traits: ['自我进化', '难以预测'],
    weakness: ['行为分析', '多维度防御']
  },
  {
    id: 'polymorphic_virus',
    name: '多态病毒',
    type: 'virus',
    description: '能够改变自身特征码以逃避检测',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'signature_change', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '改变自身特征码逃避杀毒软件', trigger: '每2回合', effect: '特征改变', cooldown: 2 }
    ],
    weakness: ['启发式检测', '行为监控']
  }
];

// ============================================
// 第26-30关敌人
// ============================================

const LEVEL_26_30_ENEMIES: EnemyDefinition[] = [
  {
    id: 'deepfaker',
    name: '深度伪造者',
    type: 'ai',
    description: '利用AI技术进行人脸伪造和身份冒充',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'face_swap', intensity: 'high' },
      { turn: 2, action: 'identity_theft', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '实时换脸', description: '将目标人脸替换为伪造视频', trigger: '每回合', effect: '伪造视频', cooldown: 1 },
      { name: '身份窃取', description: '冒充他人身份进行欺诈', trigger: '伪造成功', effect: '身份冒充', cooldown: 2 }
    ],
    traits: ['AI驱动', '难以辨别'],
    weakness: ['深度伪造检测', '多因素认证']
  },
  {
    id: 'face_swapper',
    name: '换脸攻击者',
    type: 'ai',
    description: '专门进行实时换脸欺诈的攻击者',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'real_time_swap', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '实时换脸', description: '实时替换视频通话中的人脸', trigger: '视频通话', effect: '实时伪造', cooldown: 1 }
    ],
    weakness: ['活体检测', '视频验证']
  },
  {
    id: 'botnet_master',
    name: '僵尸网络主控',
    type: 'hacker',
    description: '控制大规模僵尸网络的黑客',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'ddos_attack', intensity: 'high' },
      { turn: 3, action: 'node_expansion', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: 'DDoS攻击', description: '利用僵尸网络发动分布式拒绝服务攻击', trigger: '每2回合', effect: '服务瘫痪', cooldown: 2 },
      { name: '节点扩展', description: '感染新设备扩大僵尸网络', trigger: '每3回合', effect: '网络扩张', cooldown: 3 }
    ],
    traits: ['控制力强', '资源丰富'],
    weakness: ['流量清洗', '节点隔离']
  },
  {
    id: 'zombie_node',
    name: '僵尸节点',
    type: 'malware',
    description: '被控制的受感染设备',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'command_execution', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '命令执行', description: '执行主控服务器下发的命令', trigger: '收到指令', effect: '攻击执行', cooldown: 1 }
    ],
    weakness: ['断网隔离', '系统重装']
  },
  {
    id: 'sim_hijacker',
    name: 'SIM卡劫持者',
    type: 'hacker',
    description: '通过SIM卡交换攻击窃取手机号',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'sim_swap', intensity: 'high' },
      { turn: 2, action: 'otp_intercept', intensity: 'high' }
    ],
    specialAbilities: [
      { name: 'SIM交换', description: '欺骗运营商更换SIM卡', trigger: '每2回合', effect: '号码劫持', cooldown: 2 },
      { name: '账户接管', description: '拦截短信验证码', trigger: '劫持成功', effect: '账户接管', cooldown: 1 }
    ],
    traits: ['运营商漏洞', '难以防范'],
    weakness: ['SIM卡锁定', '应用内验证']
  },
  {
    id: 'stk_attacker',
    name: 'STK攻击者',
    type: 'hacker',
    description: '利用SIM卡工具包进行攻击',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'stk_exploit', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: 'STK利用', description: '利用SIM卡工具包漏洞', trigger: '每回合', effect: 'SIM卡控制', cooldown: 1 }
    ],
    weakness: ['STK禁用', 'SIM卡更新']
  },
  {
    id: 'master_of_deception',
    name: '欺骗大师',
    type: 'hacker',
    description: '最善于伪装的网络攻击者',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'camouflage', intensity: 'high' },
      { turn: 2, action: 'ids_bypass', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '伪装成合法流量逃避检测', trigger: '每回合', effect: '伪装成功', cooldown: 1 },
      { name: 'IDS绕过', description: '绕过入侵检测系统', trigger: '被检测', effect: '检测逃避', cooldown: 2 }
    ],
    traits: ['伪装能力强', '难以追踪'],
    weakness: ['行为分析', '深度检测']
  },
  {
    id: 'ids_bypasser',
    name: 'IDS绕过者',
    type: 'hacker',
    description: '专门绕过入侵检测系统的攻击者',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'signature_evasion', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '修改攻击特征逃避检测', trigger: '每2回合', effect: '特征修改', cooldown: 2 }
    ],
    weakness: ['异常检测', '机器学习']
  }
];

// ============================================
// 第31-35关敌人
// ============================================

const LEVEL_31_35_ENEMIES: EnemyDefinition[] = [
  {
    id: 'bundle_virus',
    name: '捆绑型病毒',
    type: 'virus',
    description: '将恶意代码捆绑在正常软件中的病毒',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'software_bundle', intensity: 'medium' },
      { turn: 3, action: 'silent_install', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '静默安装', description: '在后台静默安装恶意组件', trigger: '每3回合', effect: '组件安装', cooldown: 3 }
    ],
    traits: ['隐蔽性强', '用户难以察觉'],
    weakness: ['软件验证', '来源检查']
  },
  {
    id: 'downloader_trojan',
    name: '下载者木马',
    type: 'malware',
    description: '专门下载其他恶意软件的木马',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'malware_download', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '从远程服务器下载恶意软件', trigger: '每2回合', effect: '软件下载', cooldown: 2 }
    ],
    weakness: ['网络监控', '下载限制']
  },
  {
    id: 'panda_burner',
    name: '熊猫烧香变种',
    type: 'worm',
    description: '熊猫烧香病毒的新变种，更加危险',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'enhanced_infection', intensity: 'high' },
      { turn: 2, action: 'network_spread', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '快速感染', description: '更强的感染能力', trigger: '每回合', effect: '快速感染', cooldown: 1 },
      { name: '网络传播', description: '通过局域网快速传播', trigger: '每2回合', effect: '局域网感染', cooldown: 2 }
    ],
    traits: ['传播快', '破坏性强'],
    weakness: ['网络隔离', '专杀工具']
  },
  {
    id: 'worm_spreader',
    name: '蠕虫传播者',
    type: 'worm',
    description: '专门负责蠕虫传播的子体',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'rapid_replicate', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '快速复制', description: '极快的自我复制速度', trigger: '每回合', effect: '快速增殖', cooldown: 1 }
    ],
    weakness: ['带宽限制', '连接阻断']
  },
  {
    id: 'grey_pigeon',
    name: '灰鸽子',
    type: 'malware',
    description: '著名的国产远程控制木马',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'remote_control', intensity: 'high' },
      { turn: 2, action: 'screen_capture', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '远程控制', description: '完全控制受感染设备', trigger: '每回合', effect: '设备控制', cooldown: 1 },
      { name: '屏幕捕获', description: '捕获用户屏幕内容', trigger: '每2回合', effect: '屏幕监控', cooldown: 2 }
    ],
    traits: ['控制全面', '功能强大'],
    weakness: ['进程监控', '网络阻断']
  },
  {
    id: 'remote_controller',
    name: '远程控制器',
    type: 'hacker',
    description: '使用远程控制软件进行攻击的黑客',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'remote_session', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '远程会话', description: '建立远程控制会话', trigger: '每2回合', effect: '会话建立', cooldown: 2 }
    ],
    weakness: ['会话监控', '异常检测']
  },
  {
    id: 'blockchain_attacker',
    name: '区块链攻击者',
    type: 'hacker',
    description: '针对区块链和加密货币的攻击者',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'wallet_drain', intensity: 'high' },
      { turn: 3, action: 'smart_contract_exploit', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '窃取加密货币钱包资金', trigger: '每2回合', effect: '资金窃取', cooldown: 2 },
      { name: '智能合约渗透', description: '利用智能合约漏洞', trigger: '合约交互', effect: '合约攻击', cooldown: 3 }
    ],
    traits: ['目标明确', '收益巨大'],
    weakness: ['多重签名', '合约审计']
  },
  {
    id: 'crypto_thief',
    name: '加密货币大盗',
    type: 'hacker',
    description: '专门窃取加密货币的专业黑客',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'private_key_steal', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '密钥窃取', description: '窃取用户的私钥', trigger: '每回合', effect: '密钥获取', cooldown: 1 }
    ],
    weakness: ['硬件钱包', '冷存储']
  }
];

// ============================================
// 第36-40关敌人
// ============================================

const LEVEL_36_40_ENEMIES: EnemyDefinition[] = [
  {
    id: 'cih_virus',
    name: 'CIH病毒',
    type: 'virus',
    description: '能够破坏计算机BIOS的恶性病毒',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'bios_corruption', intensity: 'high' },
      { turn: 4, action: 'hardware_damage', intensity: 'high' }
    ],
    specialAbilities: [
      { name: 'BIOS破坏', description: '破坏主板BIOS芯片', trigger: '特定日期', effect: 'BIOS损坏', cooldown: 0 },
      { name: '硬件损坏', description: '造成不可逆的硬件损坏', trigger: 'BIOS破坏后', effect: '硬件报废', cooldown: 0 }
    ],
    traits: ['破坏性强', '难以修复'],
    weakness: ['BIOS保护', '写保护']
  },
  {
    id: 'bios_destroyer',
    name: 'BIOS破坏者',
    type: 'virus',
    description: '专门攻击固件的恶意程序',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'firmware_attack', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '固件攻击', description: '攻击系统固件', trigger: '每2回合', effect: '固件损坏', cooldown: 2 }
    ],
    weakness: ['固件验证', '安全启动']
  },
  {
    id: 'diligent_worm',
    name: '勤奋的虫子',
    type: 'worm',
    description: '最勤奋的计算机蠕虫，持续不断地复制和传播',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'continuous_replicate', intensity: 'high' },
      { turn: 1, action: 'network_scan', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '持续复制', description: '几乎不间断地自我复制', trigger: '每回合', effect: '快速增殖', cooldown: 0 },
      { name: '网络扫描', description: '持续扫描新的攻击目标', trigger: '每回合', effect: '目标发现', cooldown: 1 }
    ],
    traits: ['勤奋', '不知疲倦'],
    weakness: ['带宽限制', '连接监控']
  },
  {
    id: 'self_replicator',
    name: '自我复制者',
    type: 'worm',
    description: '专注于自我复制的蠕虫',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'mass_replication', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '大规模复制', description: '一次性产生大量副本', trigger: '每2回合', effect: '数量爆发', cooldown: 2 }
    ],
    weakness: ['资源限制', '进程限制']
  },
  {
    id: 'brain_virus',
    name: '大脑病毒',
    type: 'virus',
    description: '最早的引导区病毒之一',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'boot_sector_infection', intensity: 'medium' },
      { turn: 3, action: 'memory_residence', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '引导区感染', description: '感染软盘引导扇区', trigger: '磁盘访问', effect: '引导感染', cooldown: 0 },
      { name: '内存驻留', description: '长期驻留内存', trigger: '系统启动', effect: '持久化', cooldown: 0 }
    ],
    traits: ['历史悠久', '影响深远'],
    weakness: ['引导区保护', '杀毒软件']
  },
  {
    id: 'boot_sector_virus',
    name: '引导扇区病毒',
    type: 'virus',
    description: '专门攻击引导扇区的病毒',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'mbr_infection', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: 'MBR感染', description: '感染主引导记录', trigger: '启动时', effect: 'MBR修改', cooldown: 0 }
    ],
    weakness: ['MBR备份', '安全启动']
  },
  {
    id: 'macro_virus',
    name: '宏病毒',
    type: 'virus',
    description: '感染Office文档的宏病毒',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'document_infection', intensity: 'medium' },
      { turn: 2, action: 'macro_execution', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '文档感染', description: '感染Word/Excel文档', trigger: '文档打开', effect: '宏植入', cooldown: 0 },
      { name: '宏执行', description: '执行恶意宏代码', trigger: '每2回合', effect: '代码执行', cooldown: 2 }
    ],
    traits: ['文档传播', '社会工程学'],
    weakness: ['宏禁用', '文档扫描']
  },
  {
    id: 'concept_virus',
    name: '概念病毒',
    type: 'virus',
    description: '最早的宏病毒之一',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'template_infection', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '模板感染', description: '感染Word模板文件', trigger: '模板使用', effect: '模板污染', cooldown: 0 }
    ],
    weakness: ['模板保护', '宏安全']
  },
  {
    id: 'password_cracker',
    name: '密码破解者',
    type: 'hacker',
    description: '使用各种技术破解密码的专家',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'brute_force_attack', intensity: 'high' },
      { turn: 3, action: 'rainbow_table', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '暴力破解', description: '尝试所有可能的密码组合', trigger: '每回合', effect: '密码尝试', cooldown: 1 },
      { name: '彩虹表攻击', description: '使用预计算的哈希值', trigger: '每3回合', effect: '快速破解', cooldown: 3 }
    ],
    traits: ['耐心', '计算能力强'],
    weakness: ['密码策略', '登录限制']
  },
  {
    id: 'dictionary_attacker',
    name: '字典攻击者',
    type: 'hacker',
    description: '使用字典进行密码猜测',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'dictionary_guess', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '字典猜测', description: '使用常见密码字典', trigger: '每回合', effect: '密码猜测', cooldown: 1 }
    ],
    weakness: ['复杂密码', '锁定机制']
  },
  {
    id: 'sybil_attacker',
    name: '女巫攻击者',
    type: 'hacker',
    description: '创建大量虚假身份进行攻击',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'identity_flood', intensity: 'high' },
      { turn: 2, action: 'reputation_manipulation', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '身份泛滥', description: '创建大量虚假身份', trigger: '每回合', effect: '身份创建', cooldown: 1 },
      { name: '声誉操纵', description: '操纵系统声誉机制', trigger: '身份足够', effect: '声誉控制', cooldown: 2 }
    ],
    traits: ['数量优势', '难以识别'],
    weakness: ['身份验证', '信任机制']
  },
  {
    id: 'identity_forger',
    name: '身份伪造者',
    type: 'hacker',
    description: '专门伪造数字身份',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'credential_forgery', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '凭证伪造', description: '伪造身份凭证', trigger: '每2回合', effect: '凭证生成', cooldown: 2 }
    ],
    weakness: ['凭证验证', '区块链身份']
  },
  {
    id: 'master_of_disguise',
    name: '伪装大师',
    type: 'virus',
    description: '最善于伪装的计算机病毒，能够完美隐藏自己',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'perfect_camouflage', intensity: 'high' },
      { turn: 2, action: 'rootkit_hide', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '完全伪装成系统文件', trigger: '每回合', effect: '深度隐藏', cooldown: 1 },
      { name: 'Rootkit隐藏', description: '使用Rootkit技术隐藏', trigger: '被扫描', effect: '扫描逃避', cooldown: 2 }
    ],
    traits: ['伪装能力MAX', '极难发现'],
    weakness: ['行为分析', '离线扫描']
  },
  {
    id: 'rootkit_hider',
    name: 'Rootkit隐藏者',
    type: 'malware',
    description: '使用Rootkit技术隐藏恶意软件',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'kernel_hook', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '内核钩子', description: '挂钩内核函数隐藏自身', trigger: '系统调用', effect: '调用拦截', cooldown: 0 }
    ],
    weakness: ['内核完整性检查', '安全启动']
  }
];

// ============================================
// 第41-80关敌人（新增）
// ============================================

const LEVEL_41_80_ENEMIES: EnemyDefinition[] = [
  {
    id: 'supply_attacker',
    name: '供应链攻击者',
    type: 'hacker',
    description: '通过供应链薄弱环节进行攻击的黑客组织',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'supply_chain_infiltration', intensity: 'high' },
      { turn: 3, action: 'dependency_poison', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '供应链渗透', description: '通过第三方供应商渗透目标网络', trigger: '每回合', effect: '间接入侵', cooldown: 1 },
      { name: '依赖投毒', description: '在软件依赖中植入恶意代码', trigger: '每3回合', effect: '供应链污染', cooldown: 3 }
    ],
    traits: ['间接攻击', '难以追踪'],
    weakness: ['供应链审计', '软件签名验证']
  },
  {
    id: 'repo_poisoner',
    name: '仓库投毒者',
    type: 'malware',
    description: '在开源代码仓库中植入恶意代码的攻击者',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'code_injection', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '仓库污染', description: '在开源项目中植入恶意代码', trigger: '代码提交', effect: '仓库污染', cooldown: 0 }
    ],
    weakness: ['代码审查', '依赖扫描']
  },
  {
    id: 'zero_day_attacker',
    name: '零日攻击者',
    type: 'hacker',
    description: '掌握未公开漏洞的高级攻击者',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'zero_day_exploit', intensity: 'extreme' },
      { turn: 2, action: 'undetectable_attack', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '零日漏洞', description: '使用未公开的漏洞进行攻击', trigger: '每回合', effect: '无视防御', cooldown: 1 },
      { name: '隐形攻击', description: '攻击不留痕迹', trigger: '每2回合', effect: '难以检测', cooldown: 2 }
    ],
    traits: ['技术顶尖', '危害极大'],
    weakness: ['威胁情报', '异常检测']
  },
  {
    id: 'exploit_developer',
    name: '漏洞利用开发者',
    type: 'hacker',
    description: '专门开发漏洞利用工具的技术专家',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'exploit_crafting', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '漏洞利用制作', description: '持续开发新的漏洞利用', trigger: '每回合', effect: '利用积累', cooldown: 1 }
    ],
    weakness: ['漏洞补丁', '入侵检测']
  },
  {
    id: 'cloud_intruder',
    name: '云端入侵者',
    type: 'hacker',
    description: '专门攻击云服务基础设施的黑客',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'cloud_breach', intensity: 'high' },
      { turn: 2, action: 'misconfig_exploit', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '云端突破', description: '突破云服务安全边界', trigger: '每回合', effect: '环境控制', cooldown: 1 },
      { name: '配置利用', description: '利用云配置错误', trigger: '配置错误', effect: '权限提升', cooldown: 2 }
    ],
    traits: ['云安全专家', '配置精通'],
    weakness: ['配置审计', '最小权限原则']
  },
  {
    id: 'data_thief',
    name: '数据窃贼',
    type: 'hacker',
    description: '专门窃取敏感数据的职业窃贼',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'data_exfiltration', intensity: 'high' },
      { turn: 3, action: 'stealth_copy', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '将窃取的数据发送到远程服务器', trigger: '数据窃取', effect: '批量外传', cooldown: 1 },
      { name: '隐形复制', description: '在不被发现的情况下复制数据', trigger: '每3回合', effect: '静默窃取', cooldown: 3 }
    ],
    traits: ['隐蔽性强', '目标精准'],
    weakness: ['数据加密', '出口监控']
  },
  {
    id: 'contract_attacker',
    name: '合约攻击者',
    type: 'hacker',
    description: '专门攻击智能合约的区块链黑客',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'smart_contract_attack', intensity: 'high' },
      { turn: 2, action: 'reentrancy_exploit', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '合约攻击', description: '利用智能合约漏洞进行攻击', trigger: '每回合', effect: '合约渗透', cooldown: 1 },
      { name: '重入攻击', description: '通过递归调用漏洞盗取资金', trigger: '重入漏洞', effect: '资金盗取', cooldown: 2 }
    ],
    traits: ['区块链专精', '获利性攻击'],
    weakness: ['合约审计', '形式化验证']
  },
  {
    id: 'double_spender',
    name: '双花攻击者',
    type: 'hacker',
    description: '在区块链上进行双花攻击的犯罪分子',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'double_spend_attack', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '双花攻击', description: '同一笔交易花费两次', trigger: '交易确认前', effect: '双重支付', cooldown: 0 }
    ],
    weakness: ['多次确认', '重组保护']
  },
  {
    id: 'adversarial_attacker',
    name: '对抗性攻击者',
    type: 'ai',
    description: '专门针对AI系统进行对抗攻击的技术专家',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'adversarial_input', intensity: 'high' },
      { turn: 2, action: 'model_evasion', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '对抗样本', description: '制作欺骗AI的对抗样本', trigger: '每回合', effect: '模型误导', cooldown: 1 },
      { name: '模型规避', description: '绕过AI安全检测', trigger: '每2回合', effect: '检测逃避', cooldown: 2 }
    ],
    traits: ['AI专精', '对抗性强'],
    weakness: ['对抗训练', '输入验证']
  },
  {
    id: 'model_thief',
    name: '模型窃贼',
    type: 'ai',
    description: '窃取AI模型知识产权的攻击者',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'model_extraction', intensity: 'medium' },
      { turn: 3, action: 'knowledge_distillation', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '模型提取', description: '通过API窃取模型结构', trigger: '模型查询', effect: '参数窃取', cooldown: 1 },
      { name: '知识蒸馏', description: '利用输出了解模型行为', trigger: '多次查询', effect: '行为学习', cooldown: 3 }
    ],
    traits: ['模型逆向', '知识产权窃取'],
    weakness: ['模型水印', '输出限制']
  },
  {
    id: 'quantum_breaker',
    name: '量子破译者',
    type: 'hacker',
    description: '使用量子计算破解加密的高级攻击者',
    baseDifficulty: 7,
    resourceBonus: 6,
    attackPattern: [
      { turn: 'all', action: 'quantum_cryptanalysis', intensity: 'extreme' },
      { turn: 3, action: 'key_extraction', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '量子密码分析', description: '使用量子算法破解加密', trigger: '每回合', effect: '加密瓦解', cooldown: 1 },
      { name: '密钥提取', description: '从量子通道提取密钥', trigger: '密钥交换', effect: '密钥窃取', cooldown: 3 }
    ],
    traits: ['量子计算', '加密终结者'],
    weakness: ['后量子密码', '量子密钥分发']
  },
  {
    id: 'post_quantum_threat',
    name: '后量子威胁',
    type: 'hacker',
    description: '能够对抗后量子加密算法的威胁',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'pq_algorithm', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '后量子算法', description: '使用抗量子攻击的算法', trigger: '每回合', effect: '算法对抗', cooldown: 1 }
    ],
    traits: ['算法对抗', '持续威胁'],
    weakness: ['更高级加密', '密钥更新']
  },
  {
    id: 'omnipotent_attacker',
    name: '全能攻击者',
    type: 'hacker',
    description: '掌握所有攻击技术的顶级黑客',
    baseDifficulty: 8,
    resourceBonus: 7,
    attackPattern: [
      { turn: 'all', action: 'omni_attack', intensity: 'extreme' },
      { turn: 1, action: 'skill_boost', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '全能攻击', description: '发动所有类型的攻击', trigger: '每回合', effect: '全面打击', cooldown: 1 },
      { name: '技能强化', description: '每次攻击后增强下一次攻击', trigger: '攻击成功', effect: '伤害递增', cooldown: 0 }
    ],
    traits: ['全能', '终极威胁'],
    weakness: ['团队协作', '全面防御']
  }
];

// ============================================
// 第81-120关敌人（大东话安全主题）
// ============================================

const LEVEL_81_120_ENEMIES: EnemyDefinition[] = [
  // LV080专用敌人：苹果M1芯片漏洞和iOS URL欺骗攻击
  {
    id: 'm1_chip_exploiter',
    name: 'M1芯片漏洞利用者',
    type: 'hardware_exploit',
    description: '利用苹果M1芯片安全漏洞进行权限提升攻击，可绕过系统限制访问用户隐私数据',
    baseDifficulty: 8,
    resourceBonus: 6,
    attackPattern: [
      { turn: 'all', action: 'chip_vulnerability_exploit', intensity: 'extreme' },
      { turn: 2, action: 'privilege_escalation', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '芯片级入侵', description: '利用M1芯片架构漏洞获取系统级权限', trigger: '每回合', effect: '权限提升', cooldown: 1 },
      { name: '沙箱逃逸', description: '突破应用沙箱限制访问系统资源', trigger: '每2回合', effect: '越权访问', cooldown: 2 }
    ],
    traits: ['硬件级攻击', '权限提升', '沙箱逃逸'],
    weakness: ['芯片补丁', '权限分离', '硬件加固']
  },
  {
    id: 'url_spoofer',
    name: 'URL欺骗攻击者',
    type: 'phishing',
    description: '利用iOS URL欺骗漏洞篡改地址栏，诱导用户访问恶意网站并窃取隐私',
    baseDifficulty: 7,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'url_spoofing', intensity: 'high' },
      { turn: 2, action: 'address_bar_manipulation', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '地址栏欺骗', description: '篡改浏览器地址栏显示虚假URL', trigger: '每回合', effect: '视觉欺骗', cooldown: 1 },
      { name: '钓鱼跳转', description: '诱导用户访问恶意网站并下载攻击脚本', trigger: '被点击', effect: '恶意跳转', cooldown: 2 }
    ],
    traits: ['URL欺骗', '钓鱼攻击', '界面伪装'],
    weakness: ['URL验证', '证书锁定', '安全意识']
  },
  {
    id: 'privacy_data_thief',
    name: '隐私数据窃取者',
    type: 'data_theft',
    description: '利用iOS权限漏洞窃取用户相册、通讯录、文件等隐私数据',
    baseDifficulty: 7,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'unauthorized_data_access', intensity: 'high' },
      { turn: 3, action: 'bulk_data_exfiltration', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '越权读取', description: '绕过权限检查访问受保护数据', trigger: '每回合', effect: '数据窃取', cooldown: 1 },
      { name: '批量外传', description: '将窃取的数据发送到远程服务器', trigger: '每3回合', effect: '隐私泄露', cooldown: 3 }
    ],
    traits: ['隐私窃取', '越权访问', '数据外传'],
    weakness: ['权限审计', '数据加密', '访问控制']
  },
  {
    id: 'social_engineer',
    name: '社交工程攻击者',
    type: 'hacker',
    description: '精通心理操纵的攻击者，通过欺骗获取敏感信息',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'social_manipulation', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '社会工程学', description: '发送欺骗性信息', trigger: '每回合', effect: '信息获取', cooldown: 1 }
    ],
    traits: ['心理操控', '社会工程'],
    weakness: ['安全意识培训', '多因素认证']
  },
  {
    id: 'account_hijacker',
    name: '账号劫持者',
    type: 'hacker',
    description: '窃取并控制用户账号的攻击者',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'credential_theft', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '接管用户会话', trigger: '每2回合', effect: '账号控制', cooldown: 2 }
    ],
    traits: ['会话窃取', '身份冒充'],
    weakness: ['会话超时', '设备绑定']
  },
  {
    id: 'backdoor_implanter',
    name: '后门植入者',
    type: 'hacker',
    description: '在系统中植入后门的攻击者',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'backdoor_install', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '持久化', description: '建立持久化后门', trigger: '被动', effect: '长期控制', cooldown: 3 }
    ],
    traits: ['隐蔽性强', '长期潜伏'],
    weakness: ['完整性检测', '行为监控']
  },
  {
    id: 'permission_abuser',
    name: '权限滥用者',
    type: 'insider',
    description: '滥用系统权限的内部人员',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'privilege_abuse', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '技能强化', description: '获取更高权限', trigger: '每回合', effect: '权限提升', cooldown: 2 }
    ],
    traits: ['内部威胁', '权限优势'],
    weakness: ['权限审计', '最小权限原则']
  },
  {
    id: 'teardrop_attacker',
    name: 'Teardrop攻击者',
    type: 'ddos',
    description: '使用Teardrop攻击制造网络拥塞',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'teardrop_attack', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: 'DDoS攻击', description: '发送重叠的IP碎片', trigger: '每回合', effect: '系统崩溃', cooldown: 1 }
    ],
    traits: ['DDoS攻击', '碎片化利用'],
    weakness: ['流量清洗', '防火墙规则']
  },
  {
    id: 'fragmentation_exploiter',
    name: '碎片化利用',
    type: 'ddos',
    description: '利用IP碎片化进行攻击',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'fragment_exploit', intensity: 'high' }
    ],
    specialAbilities: [
      { name: 'DDoS攻击', description: '利用重组漏洞', trigger: '每2回合', effect: '内存破坏', cooldown: 2 }
    ],
    traits: ['碎片攻击', '漏洞利用'],
    weakness: ['碎片过滤', '协议加固']
  },
  {
    id: 'malicious_jailbreak',
    name: '恶意越狱',
    type: 'mobile_malware',
    description: '通过越狱破解移动设备安全',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'jailbreak_exploit', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '技能强化', description: '获取设备根权限', trigger: '被动', effect: '完全控制', cooldown: 3 }
    ],
    traits: ['移动安全破解', '权限突破'],
    weakness: ['安全启动', '系统完整性']
  },
  {
    id: 'supply_chain_injector',
    name: '供应链植入',
    type: 'supply_chain',
    description: '在软件供应链中植入恶意代码',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'supply_malware', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '供应链渗透', description: '在源头植入恶意代码', trigger: '被动', effect: '大规模感染', cooldown: 5 }
    ],
    traits: ['供应链攻击', '大规模感染'],
    weakness: ['代码签名', '软件溯源']
  },
  {
    id: 'malicious_app_dev',
    name: '恶意APP开发者',
    type: 'mobile_malware',
    description: '开发恶意移动应用',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'malicious_app', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '静默安装', description: '请求过多权限', trigger: '安装时', effect: '隐私窃取', cooldown: 1 }
    ],
    traits: ['恶意应用', '权限滥用'],
    weakness: ['应用审核', '权限最小化']
  },
  {
    id: 'ad_malware_author',
    name: '广告木马作者',
    type: 'mobile_malware',
    description: '通过恶意广告传播木马',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'ad_malware', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '静默安装', description: '后台偷偷安装', trigger: '点击时', effect: '隐蔽安装', cooldown: 2 }
    ],
    traits: ['广告投放', '隐蔽安装'],
    weakness: ['广告过滤', '安装验证']
  },
  {
    id: 'cpu_exploiter',
    name: 'CPU漏洞利用',
    type: 'hardware',
    description: '利用CPU漏洞进行攻击',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'cpu_exploit', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '通过侧信道窃取信息', trigger: '每回合', effect: '数据泄露', cooldown: 1 }
    ],
    traits: ['硬件漏洞', '侧信道攻击'],
    weakness: ['微码更新', '侧信道防护']
  },
  {
    id: 'spectre_meltdown_attacker',
    name: '幽灵熔断攻击',
    type: 'hardware',
    description: '利用CPU熔断和幽灵漏洞',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'spectre_meltdown', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '零日漏洞', description: '利用预测执行漏洞', trigger: '被动', effect: '内存读取', cooldown: 2 }
    ],
    traits: ['CPU漏洞', '预测执行攻击'],
    weakness: ['CPU微码补丁', '内核页表隔离']
  },
  {
    id: 'supply_chain_poisoner',
    name: '供应链投毒',
    type: 'supply_chain',
    description: '污染开源软件供应链',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'dependency_poison', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '依赖投毒', description: '在依赖包中投毒', trigger: '被动', effect: '恶意代码执行', cooldown: 3 }
    ],
    traits: ['开源供应链', '依赖污染'],
    weakness: ['依赖检查', '软件成分分析']
  },
  {
    id: 'open_source_tamperer',
    name: '开源篡改者',
    type: 'supply_chain',
    description: '篡改开源软件代码',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'code_tamper', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '内存驻留', description: '在开源代码中植入后门', trigger: '被动', effect: '隐蔽后门', cooldown: 4 }
    ],
    traits: ['代码篡改', '开源攻击'],
    weakness: ['代码签名', '开发者认证']
  },
  {
    id: 'dust_attacker',
    name: '粉尘攻击者',
    type: 'cryptocurrency',
    description: '进行区块链粉尘攻击',
    baseDifficulty: 2,
    resourceBonus: 1,
    attackPattern: [
      { turn: 'all', action: 'dust_attack', intensity: 'low' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '追踪用户交易', trigger: '被动', effect: '隐私分析', cooldown: 2 }
    ],
    traits: ['区块链攻击', '隐私追踪'],
    weakness: ['CoinJoin', '隐私币']
  },
  {
    id: 'mixing_service',
    name: '混币服务',
    type: 'cryptocurrency',
    description: '提供非法混币服务',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'mixing_service', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '混淆交易追踪', trigger: '被动', effect: '匿名化', cooldown: 3 }
    ],
    traits: ['加密货币', '交易混淆'],
    weakness: ['链上分析', '交易监控']
  },
  {
    id: 'data_scraper',
    name: '数据爬虫',
    type: 'data_theft',
    description: '大规模爬取敏感数据',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'web_scraping', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '快速爬取大量数据', trigger: '每回合', effect: '数据窃取', cooldown: 1 }
    ],
    traits: ['数据窃取', '爬虫攻击'],
    weakness: ['访问限制', '数据加密']
  },
  {
    id: 'brute_forcer',
    name: '暴力破解者',
    type: 'credential_attack',
    description: '使用暴力破解获取密码',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'brute_force', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '密码尝试', description: '尝试大量密码组合', trigger: '每回合', effect: '密码破解', cooldown: 1 }
    ],
    traits: ['暴力破解', '密码攻击'],
    weakness: ['账户锁定', '强密码策略']
  },
  {
    id: 'privacy_hunter',
    name: '隐私猎人',
    type: 'data_theft',
    description: '专门收集和出售个人隐私',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'privacy_theft', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '构建用户画像', trigger: '被动', effect: '精准营销', cooldown: 2 }
    ],
    traits: ['隐私窃取', '数据贩卖'],
    weakness: ['隐私保护法', '数据脱敏']
  },
  {
    id: 'data_broker',
    name: '数据经纪人',
    type: 'data_theft',
    description: '非法买卖个人数据的中间商',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'data_trade', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '在黑市出售数据', trigger: '被动', effect: '数据变现', cooldown: 3 }
    ],
    traits: ['数据交易', '黑产链条'],
    weakness: ['数据保护法', '交易监控']
  },
  {
    id: 'account_theft',
    name: '账号盗用',
    type: 'credential_attack',
    description: '盗取用户账号',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'account_steal', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '暴力破解', description: '使用泄露密码尝试', trigger: '每回合', effect: '账号获取', cooldown: 1 }
    ],
    traits: ['账号盗取', '撞库攻击'],
    weakness: ['密码哈希', '多因素认证']
  },
  {
    id: 'mileage_black_market',
    name: '积分黑产',
    type: 'fraud',
    description: '盗取和倒卖航空里程',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'mileage_theft', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '全能攻击', description: '将里程非法变现', trigger: '被动', effect: '财产损失', cooldown: 2 }
    ],
    traits: ['积分盗取', '黑产变现'],
    weakness: ['账户绑定', '身份验证']
  },
  {
    id: 'device_jailbreaker',
    name: '设备越狱',
    type: 'mobile_malware',
    description: '破解移动设备安全限制',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'device_unlock', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '绕过设备安全限制', trigger: '被动', effect: '完全控制', cooldown: 2 }
    ],
    traits: ['设备破解', '安全绕过'],
    weakness: ['安全启动', '设备加密']
  },
  {
    id: 'remote_trojan',
    name: '远程木马',
    type: 'malware',
    description: '部署远程控制木马',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'trojan_deploy', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '远程控制', description: '远程控制受害设备', trigger: '被动', effect: '设备控制', cooldown: 1 }
    ],
    traits: ['远程控制', '木马攻击'],
    weakness: ['防火墙', '进程监控']
  },
  {
    id: 'legacy_attacker',
    name: '遗留系统攻击',
    type: 'system_exploit',
    description: '攻击老旧的遗留系统',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'legacy_exploit', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '零日漏洞', description: '利用未修补的系统漏洞', trigger: '每回合', effect: '系统控制', cooldown: 1 }
    ],
    traits: ['遗留系统', '漏洞利用'],
    weakness: ['系统升级', '补丁管理']
  },
  {
    id: 'logic_bomb_deployer',
    name: '逻辑炸弹投放',
    type: 'malware',
    description: '在系统中植入逻辑炸弹',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'logic_bomb', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '持久化', description: '在特定条件下触发', trigger: '条件触发', effect: '破坏性后果', cooldown: 5 }
    ],
    traits: ['逻辑炸弹', '定时攻击'],
    weakness: ['代码审查', '完整性监控']
  },
  {
    id: 'source_code_leaker',
    name: '源码泄露者',
    type: 'intel',
    description: '泄露专有源代码',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'code_leak', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '模型提取', description: '窃取源代码和算法', trigger: '被动', effect: '知识产权损失', cooldown: 3 }
    ],
    traits: ['源码泄露', '知识产权窃取'],
    weakness: ['访问控制', '代码加密']
  },
  {
    id: 'vulnerability_miner',
    name: '漏洞挖掘者',
    type: 'hacker',
    description: '挖掘软件中的安全漏洞',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'vuln_discovery', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '零日漏洞', description: '发现并储备0day漏洞', trigger: '被动', effect: '漏洞利用', cooldown: 4 }
    ],
    traits: ['漏洞挖掘', '0day储备'],
    weakness: ['漏洞赏金', '安全测试']
  },
  {
    id: 'password_sprayer',
    name: '密码喷洒',
    type: 'credential_attack',
    description: '使用常见密码尝试大量账号',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'password_spray', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '暴力破解', description: '避免触发锁定', trigger: '每回合', effect: '账号入侵', cooldown: 2 }
    ],
    traits: ['密码喷洒', '低频攻击'],
    weakness: ['账户锁定', '异常检测']
  },
  {
    id: 'dictionary_attacker_v2',
    name: '字典攻击',
    type: 'credential_attack',
    description: '使用字典进行密码破解',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'dictionary_attack', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '字典猜测', description: '使用社工字典', trigger: '每回合', effect: '密码破解', cooldown: 1 }
    ],
    traits: ['字典攻击', '社工字典'],
    weakness: ['强密码策略', '密码哈希']
  },
  {
    id: 'scammer',
    name: '诈骗者',
    type: 'fraud',
    description: '进行各类网络诈骗',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'online_scam', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '冒充他人进行诈骗', trigger: '每回合', effect: '财产损失', cooldown: 2 }
    ],
    traits: ['网络诈骗', '身份冒充'],
    weakness: ['身份验证', '安全意识']
  },
  {
    id: 'phisher',
    name: '钓鱼攻击',
    type: 'social_engineering',
    description: '通过钓鱼获取敏感信息',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'phishing', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '仿冒合法网站', trigger: '每回合', effect: '凭证窃取', cooldown: 1 }
    ],
    traits: ['钓鱼攻击', '域名仿冒'],
    weakness: ['域名检测', '安全意识培训']
  },
  {
    id: 'social_engineer_v2',
    name: '社工攻击专家',
    type: 'social_engineering',
    description: '专业的社会工程攻击专家',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'advanced_social', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '社会工程学', description: '深度心理操纵', trigger: '每回合', effect: '信息获取', cooldown: 1 }
    ],
    traits: ['社工专家', '心理操控'],
    weakness: ['安全意识', '验证流程']
  },
  {
    id: 'phishing_mail_sender',
    name: '钓鱼邮件发送',
    type: 'social_engineering',
    description: '大规模发送钓鱼邮件',
    baseDifficulty: 3,
    resourceBonus: 2,
    attackPattern: [
      { turn: 'all', action: 'phishing_email', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '伪装成可信来源', trigger: '每回合', effect: '凭证收集', cooldown: 1 }
    ],
    traits: ['钓鱼邮件', '邮件伪装'],
    weakness: ['邮件过滤', '发件人验证']
  },
  {
    id: 'sms_sniffer',
    name: '短信嗅探',
    type: 'mobile_attack',
    description: '嗅探和截获短信',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'sms_intercept', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '窃取短信验证码', trigger: '被动', effect: '2FA绕过', cooldown: 2 }
    ],
    traits: ['短信嗅探', '2FA绕过'],
    weakness: ['应用内验证码', 'SIM卡加密']
  },
  {
    id: 'sms_code_platform_op',
    name: '接码平台运营',
    type: 'mobile_attack',
    description: '运营短信验证码接码平台',
    baseDifficulty: 4,
    resourceBonus: 3,
    attackPattern: [
      { turn: 'all', action: 'sms_code_service', intensity: 'medium' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '提供接收验证码服务', trigger: '被动', effect: '账号注册', cooldown: 1 }
    ],
    traits: ['接码平台', '黑产服务'],
    weakness: ['手机实名制', '行为检测']
  },
  {
    id: 'medical_device_attacker',
    name: '医疗设备攻击',
    type: 'iot_attack',
    description: '攻击医疗设备安全',
    baseDifficulty: 6,
    resourceBonus: 5,
    attackPattern: [
      { turn: 'all', action: 'medical_device_hack', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '远程控制', description: '远程控制医疗设备', trigger: '被动', effect: '患者安全风险', cooldown: 2 }
    ],
    traits: ['医疗设备', '物联网站击'],
    weakness: ['设备认证', '网络隔离']
  },
  {
    id: 'telemedicine_hijacker',
    name: '远程医疗劫持',
    type: 'iot_attack',
    description: '劫持远程医疗系统',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'telemedicine_hijack', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '数据外传', description: '篡改医疗数据', trigger: '被动', effect: '诊断错误', cooldown: 3 }
    ],
    traits: ['远程医疗', '数据篡改'],
    weakness: ['数据完整性', '传输加密']
  },
  {
    id: 'ios_exploit_dev',
    name: 'iOS漏洞利用开发者',
    type: 'mobile_exploit',
    description: '专门开发iOS漏洞利用',
    baseDifficulty: 7,
    resourceBonus: 6,
    attackPattern: [
      { turn: 'all', action: 'ios_exploit', intensity: 'extreme' }
    ],
    specialAbilities: [
      { name: '完美伪装', description: '利用iOS内核漏洞', trigger: '被动', effect: '完美越狱', cooldown: 3 }
    ],
    traits: ['iOS漏洞', '越狱开发'],
    weakness: ['系统更新', '安全启动']
  },
  {
    id: 'privilege_escalator',
    name: '权限提升攻击',
    type: 'system_exploit',
    description: '通过漏洞提升系统权限',
    baseDifficulty: 5,
    resourceBonus: 4,
    attackPattern: [
      { turn: 'all', action: 'privilege_escalate', intensity: 'high' }
    ],
    specialAbilities: [
      { name: '技能强化', description: '利用内核漏洞获取root', trigger: '被动', effect: '完全权限', cooldown: 2 }
    ],
    traits: ['权限提升', '内核漏洞'],
    weakness: ['权限分离', '内核补丁']
  }
];

// ============================================
// 合并所有敌人
// ============================================

const ALL_ENEMIES: EnemyDefinition[] = [
  ...EARLY_GAME_ENEMIES,
  ...LEVEL_21_25_ENEMIES,
  ...LEVEL_26_30_ENEMIES,
  ...LEVEL_31_35_ENEMIES,
  ...LEVEL_36_40_ENEMIES,
  ...LEVEL_41_80_ENEMIES,
  ...LEVEL_81_120_ENEMIES
];

// ============================================
// 导出和工具函数
// ============================================

export const ENEMY_DATABASE: Record<string, EnemyDefinition> = {};

ALL_ENEMIES.forEach(enemy => {
  ENEMY_DATABASE[enemy.id] = enemy;
});

/** 获取敌人总数 */
export const TOTAL_ENEMY_COUNT = Object.keys(ENEMY_DATABASE).length;

/** 根据ID获取敌人 */
export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ENEMY_DATABASE[id];
}

/** 根据类型获取敌人 */
export function getEnemiesByType(type: EnemyConfig['type']): EnemyDefinition[] {
  return Object.values(ENEMY_DATABASE).filter(enemy => enemy.type === type);
}

/** 根据难度获取敌人 */
export function getEnemiesByDifficulty(difficulty: number): EnemyDefinition[] {
  return Object.values(ENEMY_DATABASE).filter(enemy => enemy.baseDifficulty === difficulty);
}

/** 搜索敌人 */
export function searchEnemies(query: string): EnemyDefinition[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ENEMY_DATABASE).filter(enemy =>
    enemy.name.toLowerCase().includes(lowerQuery) ||
    enemy.id.toLowerCase().includes(lowerQuery) ||
    enemy.description.toLowerCase().includes(lowerQuery)
  );
}

/** 获取所有敌人 */
export function getAllEnemies(): EnemyDefinition[] {
  return Object.values(ENEMY_DATABASE);
}

/** 将EnemyDefinition转换为EnemyConfig */
export function toEnemyConfig(enemy: EnemyDefinition): EnemyConfig {
  return {
    name: enemy.name,
    type: enemy.type,
    baseDifficulty: enemy.baseDifficulty,
    resourceBonus: enemy.resourceBonus,
    attackPattern: enemy.attackPattern,
    specialAbilities: enemy.specialAbilities
  };
}

export default ALL_ENEMIES;
