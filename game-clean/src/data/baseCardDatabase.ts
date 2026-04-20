/**
 * 《大东话安全》基础卡牌数据库
 * 
 * 包含49张基础卡牌（不含关卡解锁卡牌）
 * 编号格式: XZY0-bC (X=来源类, Z=功能类, 0=现有卡牌, b=序号, C=科技等级)
 * 
 * 防御方T1: 8张
 * 防御方T2: 12张
 * 进攻方T1: 8张
 * 进攻方T2: 12张
 * 通用卡牌: 9张
 */

import type { Card, CardRarity, CardType, TechLevel, Faction } from '@/types/legacy/card_v16';

// ============================================
// 防御方T1基础卡牌 (8张)
// ============================================

const DEFENSE_T1_CARDS: Card[] = [
  {
    card_code: 'NF0-1T1',
    name: '防火墙部署',
    description: '部署一道防火墙屏障，阻止敌方对该区域的直接攻击。消耗1行动点，效果持续2回合。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'area_defense', baseValue: 1, description: '部署防火墙，阻止直接攻击2回合' }],
  },
  {
    card_code: 'NI0-1T1',
    name: '入侵检测',
    description: '检测区域内的异常活动，发现敌方标记时立即警报。消耗1行动点，揭示该区域所有隐藏标记。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'reveal_hidden', baseValue: 1, description: '揭示区域所有隐藏标记' }],
  },
  {
    card_code: 'NF0-2T1',
    name: '安全审计',
    description: '对系统进行安全审计，发现并修复潜在漏洞。消耗1行动点，安全等级+1。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全等级+1' }],
  },
  {
    card_code: 'NF0-3T1',
    name: '访问控制',
    description: '实施严格的访问控制策略，限制敌方进入。消耗1行动点，敌方在该区域放置标记时行动点消耗+1。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'access_control', baseValue: 1, description: '敌方放置标记行动点消耗+1' }],
  },
  {
    card_code: 'NI0-2T1',
    name: '日志监控',
    description: '监控系统日志，追踪敌方活动轨迹。消耗1行动点，查看敌方上回合行动记录。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'log_monitor', baseValue: 1, description: '查看敌方上回合行动记录' }],
  },
  {
    card_code: 'NF0-4T1',
    name: '补丁管理',
    description: '及时安装安全补丁，修复已知漏洞。消耗1行动点，移除1个敌方标记。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'infiltration_reduce', baseValue: 1, description: '移除1个敌方标记' }],
  },
  {
    card_code: 'NF0-5T1',
    name: '网络分段',
    description: '将网络划分为多个安全区域，限制攻击扩散。消耗1行动点，阻止敌方标记在本回合内扩散。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'block_spread', baseValue: 1, description: '阻止敌方标记扩散1回合' }],
  },
  {
    card_code: 'NF0-6T1',
    name: '备份恢复',
    description: '从备份中恢复受损系统。消耗1行动点，恢复2点安全等级。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 2, description: '恢复2点安全等级' }],
  },
];

// ============================================
// 防御方T2进阶卡牌 (12张)
// ============================================

const DEFENSE_T2_CARDS: Card[] = [
  {
    card_code: 'NI0-3T2',
    name: '威胁情报',
    description: '收集和分析威胁情报，预测敌方下一步行动。消耗2行动点，查看敌方手牌。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ type: 'reveal_hand', baseValue: 1, description: '查看敌方手牌' }],
  },
  {
    card_code: 'NF0-7T2',
    name: '端点防护',
    description: '在所有端点设备上部署防护措施。消耗2行动点，所有区域友方标记+1。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'area_defense_all', baseValue: 1, description: '所有区域友方标记+1' }],
  },
  {
    card_code: 'NI0-4T2',
    name: '蜜罐诱捕',
    description: '部署蜜罐系统诱捕攻击者。消耗2行动点，敌方攻击蜜罐时失去2个标记。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'honeypot', baseValue: 2, description: '敌方攻击时失去2个标记' }],
  },
  {
    card_code: 'NI0-5T2',
    name: '行为分析',
    description: '分析用户行为模式，识别异常活动。消耗2行动点，揭示所有敌方隐藏卡牌。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'behavior_analysis', baseValue: 1, description: '揭示所有敌方隐藏卡牌' }],
  },
  {
    card_code: 'NF0-8T2',
    name: '漏洞扫描',
    description: '全面扫描系统漏洞并自动修复。消耗2行动点，移除2个敌方标记。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'infiltration_reduce', baseValue: 2, description: '移除2个敌方标记' }],
  },
  {
    card_code: 'NI0-6T2',
    name: '应急响应',
    description: '启动应急响应流程，快速处置安全事件。消耗2行动点，立即执行一个额外行动。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'extra_action', baseValue: 1, description: '立即执行一个额外行动' }],
  },
  {
    card_code: 'NF0-9T2',
    name: '加密通信',
    description: '加密所有通信数据，防止窃听。消耗2行动点，敌方无法查看你的手牌2回合。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'encrypt_comm', baseValue: 2, description: '敌方无法查看手牌2回合' }],
  },
  {
    card_code: 'NF0-10T2',
    name: '多因素认证',
    description: '实施多因素认证，提高账户安全性。消耗2行动点，敌方技能本回合无效。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'mfa', baseValue: 1, description: '敌方技能本回合无效' }],
  },
  {
    card_code: 'NI0-7T2',
    name: '安全编排',
    description: '自动化编排安全流程，提高响应效率。消耗2行动点，下回合行动点+2。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'action_boost', baseValue: 2, description: '下回合行动点+2' }],
  },
  {
    card_code: 'NI0-8T2',
    name: '欺骗技术',
    description: '使用欺骗技术迷惑攻击者。消耗2行动点，敌方下回合攻击目标随机改变。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ type: 'deception', baseValue: 1, description: '敌方下回合攻击目标随机' }],
  },
  {
    card_code: 'NF0-11T2',
    name: '云安全防护',
    description: '利用云安全服务保护系统。消耗2行动点，所有友方区域获得1点临时防护。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'cloud_shield', baseValue: 1, description: '所有友方区域临时防护+1' }],
  },
  {
    card_code: 'NF0-12T2',
    name: '零信任架构',
    description: '实施零信任安全架构，永不信任，始终验证。消耗2行动点，敌方本回合无法放置标记。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'zero_trust', baseValue: 1, description: '敌方本回合无法放置标记' }],
  },
];

// ============================================
// 进攻方T1基础卡牌 (8张)
// ============================================

const ATTACK_T1_CARDS: Card[] = [
  {
    card_code: 'NF0-13T1',
    name: '端口扫描',
    description: '扫描目标系统的开放端口，寻找入口点。消耗1行动点，发现目标区域1个弱点。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'scan_ports', baseValue: 1, description: '发现目标区域1个弱点' }],
  },
  {
    card_code: 'NI0-9T1',
    name: '弱口令尝试',
    description: '尝试使用常见弱口令登录系统。消耗1行动点，50%概率成功放置1个标记。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'weak_password', baseValue: 1, description: '50%概率放置1个标记' }],
  },
  {
    card_code: 'NI0-10T1',
    name: '钓鱼邮件',
    description: '发送钓鱼邮件诱骗目标点击恶意链接。消耗1行动点，目标弃置1张手牌。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'phishing', baseValue: 1, description: '目标弃置1张手牌' }],
  },
  {
    card_code: 'NI0-11T1',
    name: '服务拒绝攻击',
    description: '发动DDoS攻击使服务不可用。消耗1行动点，目标区域友方标记-1。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'ddos', baseValue: 1, description: '目标区域友方标记-1' }],
  },
  {
    card_code: 'NA0-1T1',
    name: '恶意脚本注入',
    description: '向目标系统注入恶意脚本。消耗1行动点，下回合开始时目标区域友方标记-1。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'script_inject', baseValue: 1, description: '下回合目标区域友方标记-1' }],
  },
  {
    card_code: 'NI0-12T1',
    name: '网络嗅探',
    description: '嗅探网络流量获取敏感信息。消耗1行动点，查看目标1张手牌。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'sniff', baseValue: 1, description: '查看目标1张手牌' }],
  },
  {
    card_code: 'NI0-13T1',
    name: '社会工程学',
    description: '利用人性弱点获取信息。消耗1行动点，目标弃置1张手牌或失去1行动点。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'social_eng', baseValue: 1, description: '目标弃置1张手牌或失去1行动点' }],
  },
  {
    card_code: 'NA0-2T1',
    name: '后门植入',
    description: '在目标系统中植入后门程序。消耗1行动点，获得该区域持续访问权限。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'backdoor', baseValue: 1, description: '获得区域持续访问权限' }],
  },
];

// ============================================
// 进攻方T2进阶卡牌 (12张)
// ============================================

const ATTACK_T2_CARDS: Card[] = [
  {
    card_code: 'NI0-14T2',
    name: '零日漏洞利用',
    description: '利用未公开的零日漏洞发动攻击。消耗2行动点，无视防御直接放置2个标记。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'zero_day', baseValue: 2, description: '无视防御放置2个标记' }],
  },
  {
    card_code: 'NI0-15T2',
    name: '中间人攻击',
    description: '拦截并篡改通信数据。消耗2行动点，查看并选择目标1张手牌弃置。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'mitm', baseValue: 1, description: '查看并选择目标1张手牌弃置' }],
  },
  {
    card_code: 'NI0-16T2',
    name: '权限提升',
    description: '提升在目标系统中的权限级别。消耗2行动点，本回合放置标记效果+1。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'priv_esc', baseValue: 1, description: '本回合放置标记效果+1' }],
  },
  {
    card_code: 'NI0-17T2',
    name: '横向移动',
    description: '在已入侵的网络中横向移动。消耗2行动点，将一个区域的标记移动到相邻区域。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'lateral_move', baseValue: 1, description: '将标记移动到相邻区域' }],
  },
  {
    card_code: 'NI0-18T2',
    name: '数据窃取',
    description: '窃取目标系统的敏感数据。消耗2行动点，获得2点信息资源。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ type: 'data_theft', baseValue: 2, description: '获得2点信息资源' }],
  },
  {
    card_code: 'ND0-1T2',
    name: '勒索软件',
    description: '部署勒索软件加密目标数据。消耗2行动点，目标安全等级-2。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'ransomware', baseValue: 2, description: '目标安全等级-2' }],
  },
  {
    card_code: 'NI0-19T2',
    name: '供应链攻击',
    description: '通过供应链环节渗透目标。消耗2行动点，影响所有相邻区域。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'supply_chain', baseValue: 1, description: '影响所有相邻区域' }],
  },
  {
    card_code: 'NI0-20T2',
    name: '水坑攻击',
    description: '在目标常访问的网站上植入恶意代码。消耗2行动点，目标下回合行动点-1。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ type: 'watering_hole', baseValue: 1, description: '目标下回合行动点-1' }],
  },
  {
    card_code: 'NI0-21T2',
    name: '凭证填充',
    description: '使用泄露的凭证批量尝试登录。消耗2行动点，对所有区域各放置1个标记。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'credential_stuff', baseValue: 1, description: '对所有区域各放置1个标记' }],
  },
  {
    card_code: 'NI0-22T2',
    name: 'DNS劫持',
    description: '劫持DNS解析将流量重定向。消耗2行动点，控制目标区域的网络流量。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'dns_hijack', baseValue: 1, description: '控制目标区域网络流量' }],
  },
  {
    card_code: 'NI0-23T2',
    name: '加密劫持',
    description: '劫持计算资源进行加密货币挖矿。消耗2行动点，获得2点算力资源。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'crypto_jack', baseValue: 2, description: '获得2点算力资源' }],
  },
  {
    card_code: 'NI0-24T2',
    name: 'APT初始访问',
    description: '建立APT攻击的初始访问点。消耗2行动点，获得该区域持续控制权。',
    type: 'reconnaissance' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'apt_access', baseValue: 1, description: '获得区域持续控制权' }],
  },
];

// ============================================
// 通用卡牌 (9张)
// ============================================

const UTILITY_CARDS: Card[] = [
  {
    card_code: 'NE0-1T1',
    name: '资源调配',
    description: '灵活调配现有资源。消耗1行动点，将2点任意资源转换为2点其他资源。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'resource_convert', baseValue: 2, description: '将2点资源转换为2点其他资源' }],
  },
  {
    card_code: 'NE0-2T1',
    name: '紧急补给',
    description: '紧急获取额外资源。消耗1行动点，获得1点算力、1点资金、1点信息。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'resource_gain', baseValue: 3, description: '获得1点算力、1点资金、1点信息', resourceType: 'all' }],
  },
  {
    card_code: 'NE0-3T1',
    name: '情报交易',
    description: '通过情报交易获取优势。消耗1行动点，弃置1张手牌，抽取2张卡牌。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{ type: 'draw_cards', baseValue: 2, description: '弃置1张手牌，抽取2张卡牌' }],
  },
  {
    card_code: 'NE0-4T2',
    name: '技术升级',
    description: '升级技术能力。消耗2行动点，永久提升1点算力上限。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'tech_upgrade', baseValue: 1, description: '永久提升1点算力上限' }],
  },
  {
    card_code: 'NE0-5T3',
    name: '时间压缩',
    description: '压缩时间获得额外回合。消耗3行动点，立即获得一个额外回合。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 3,
    effects: [{ type: 'extra_turn', baseValue: 1, description: '立即获得一个额外回合' }],
  },
  {
    card_code: 'NI0-25T2',
    name: '命运骰子',
    description: '掷骰子决定命运。消耗2行动点，掷骰子：1-2失去1标记，3-4无效果，5-6放置2标记。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ type: 'dice_fate', baseValue: 1, description: '掷骰子决定效果' }],
  },
  {
    card_code: 'NF0-13T2',
    name: '绝境反击',
    description: '在绝境中发起反击。消耗2行动点，安全等级≤30时，放置3个标记。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'desperate_strike', baseValue: 3, description: '安全等级≤30时放置3个标记' }],
  },
  {
    card_code: 'NI0-26T3',
    name: '信息封锁',
    description: '封锁信息流阻止敌方获取情报。消耗3行动点，敌方下回合无法查看你的手牌。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 1, funds: 0, information: 2 },
    difficulty: 3,
    effects: [{ type: 'info_block', baseValue: 1, description: '敌方下回合无法查看手牌' }],
  },
  {
    card_code: 'NI0-27T4',
    name: '终极协议',
    description: '启动终极安全协议。消耗4行动点，清除所有敌方标记，恢复满安全等级。',
    type: 'resource' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 4 as TechLevel,
    cost: { compute: 2, funds: 2, information: 0 },
    difficulty: 4,
    effects: [{ type: 'ultimate_protocol', baseValue: 10, description: '清除所有敌方标记，恢复满安全等级' }],
  },
];

// ============================================
// 导出所有基础卡牌
// ============================================

export const BASE_CARDS: Card[] = [
  ...DEFENSE_T1_CARDS,
  ...DEFENSE_T2_CARDS,
  ...ATTACK_T1_CARDS,
  ...ATTACK_T2_CARDS,
  ...UTILITY_CARDS,
];

// 按类型获取卡牌
export function getCardsByType(type: 'defense' | 'attack' | 'utility'): Card[] {
  switch (type) {
    case 'defense':
      return [...DEFENSE_T1_CARDS, ...DEFENSE_T2_CARDS];
    case 'attack':
      return [...ATTACK_T1_CARDS, ...ATTACK_T2_CARDS];
    case 'utility':
      return UTILITY_CARDS;
    default:
      return [];
  }
}

// 按科技等级获取卡牌
export function getCardsByTechLevel(level: number): Card[] {
  return BASE_CARDS.filter(card => card.techLevel === level);
}

// 根据卡牌代码获取卡牌
export function getCardByCode(code: string): Card | undefined {
  return BASE_CARDS.find(card => card.card_code === code);
}

// 初始解锁卡牌（根据己方设置.md）
export const INITIAL_UNLOCKED_CARD_CODES = [
  'NF0-1T1', // 防火墙部署
  'NI0-1T1', // 入侵检测
  'NF0-4T1', // 补丁管理
  'NF0-6T1', // 备份恢复
  'NI0-5T2', // 行为分析
  'NI0-2T1', // 日志监控
  'NE0-2T1', // 紧急补给
  'NE0-1T1', // 资源调配
];

export default BASE_CARDS;
