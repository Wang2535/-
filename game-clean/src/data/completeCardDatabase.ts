/**
 * 《道高一丈：数字博弈》v17.0 - 完整卡牌数据库
 * 
 * 进攻方卡牌: ATK001-ATK040 (40张)
 * 防御方卡牌: DEF001-DEF040 (40张)
 * 通用卡牌: COM001-COM004, SPE001-SPE005 (9张)
 * 
 * 规则参考: 完善的游戏规则.md R2.4, R7.0
 */

import type { Card, CardRarity, CardType, TechLevel, Faction, CardEffect, Resources, ComboEffect } from '@/types/legacy/card_v16';

/** 扩展阵营类型，包含通用卡牌 */
type ExtendedFaction = Faction | 'neutral';

/** 数据库卡牌数据结构 */
interface DatabaseCard {
  code: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  techLevel: TechLevel;
  difficulty: number;
  effects: CardEffect[];
  comboEffect?: ComboEffect;
  cost?: Partial<Resources>;
}

// ============================================
// 进攻方卡牌数据定义
// ============================================

const ATTACKER_CARDS_DATA: DatabaseCard[] = [
  // T0 基础侦查 (8张)
  {
    code: 'ATK001',
    name: '端口扫描（Port Scan）',
    description: '消耗：算力1；效果：渗透+1；触发：出牌时；连击：连续使用额外+0.5',
    type: 'basic_recon',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
    comboEffect: {
      type: 'same_type',
      requiredCardType: 'basic_recon',
      bonus: 0.5,
      description: '连续使用端口扫描，渗透额外+0.5',
    },
  },
  {
    code: 'ATK002',
    name: '弱口令尝试（Weak Password）',
    description: '消耗：信息1；效果：判定难度3，成功则渗透+2，失败则渗透-1；触发：出牌时',
    type: 'basic_recon',
    rarity: 'common',
    techLevel: 1,
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3, 
      onSuccess: { type: 'infiltration_gain', baseValue: 2, description: '渗透+2' },
      onFailure: { type: 'infiltration_reduce', baseValue: 1, description: '渗透-1' },
    }],
  },
  {
    code: 'ATK003',
    name: '钓鱼邮件（Phishing Email）',
    description: '消耗：资金1；效果：判定难度3，成功则安全-1，信息+1；大成功：安全-2；触发：出牌时',
    type: 'basic_recon',
    rarity: 'common',
    techLevel: 1,
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3,
      onSuccess: { type: 'security_reduce', baseValue: 1, description: '安全-1' },
      onFailure: { type: 'resource_gain', resourceType: 'information', value: 0, description: '判定失败，无效果' },
      onCriticalSuccess: { type: 'security_reduce', baseValue: 2, description: '大成功！安全-2' },
    }],
  },
  {
    code: 'ATK004',
    name: '服务拒绝攻击（DoS Attack）',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则安全-1，算力+1；持续：1回合内对方判定难度+1；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 1,
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3,
      onSuccess: { type: 'security_reduce', baseValue: 1, description: '安全-1，算力+1' },
      onFailure: { type: 'resource_gain', resourceType: 'compute', value: 0, description: '判定失败，无效果' },
    }],
  },
  {
    code: 'ATK005',
    name: '恶意脚本注入（Script Injection）',
    description: '消耗：算力1,信息1；效果：判定难度3，成功则安全-1，且触发持续：每回合安全-1，持续2回合；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 1,
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3,
      onSuccess: { type: 'security_reduce', baseValue: 1, description: '安全-1，附加持续效果' },
      onFailure: { type: 'resource_gain', resourceType: 'information', value: 0, description: '判定失败，无效果' },
    }],
  },
  {
    code: 'ATK006',
    name: '网络嗅探（Network Sniffing）',
    description: '消耗：资金1，信息1；效果：判定难度1，成功则安全-1，算力+2；大成功：算力+1；触发：出牌时',
    type: 'basic_recon',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 1,
      onSuccess: { type: 'security_reduce', baseValue: 1, description: '安全-1，算力+2' },
      onFailure: { type: 'resource_gain', resourceType: 'compute', value: 0, description: '判定失败，无效果' },
      onCriticalSuccess: { type: 'resource_gain', resourceType: 'compute', value: 1, description: '大成功！额外算力+1' },
    }],
  },
  {
    code: 'ATK007',
    name: '社会工程学（Social Engineering）',
    description: '消耗：资金1,信息1；效果：判定难度2，成功则安全-1，资金+1；触发：出牌时',
    type: 'basic_recon',
    rarity: 'common',
    techLevel: 1,
    difficulty: 2,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 2,
      onSuccess: { type: 'security_reduce', baseValue: 1, description: '安全-1，资金+1' },
      onFailure: { type: 'resource_gain', resourceType: 'funds', value: 0, description: '判定失败，无效果' },
    }],
  },
  {
    code: 'ATK008',
    name: '凭证收集（Credential Harvesting）',
    description: '消耗：信息2；效果：判定难度3，成功则安全-2，获得1权限；触发：出牌时',
    type: 'basic_recon',
    rarity: 'rare',
    techLevel: 1,
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3,
      onSuccess: { type: 'security_reduce', baseValue: 2, description: '安全-2，获得1权限' },
      onFailure: { type: 'resource_gain', resourceType: 'access', value: 0, description: '判定失败，无效果' },
    }],
  },
  // T1 漏洞利用 (8张)
  {
    code: 'ATK009',
    name: 'SQL注入（SQL Injection）',
    description: '消耗：算力2,信息1；效果：判定难度3，成功则安全-3，失败则安全-1；连击：配合侦查卡额外使防御方信息-1；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 3, description: '安全-3' }],
    comboEffect: {
      type: 'previous',
      requiredCardType: 'basic_recon',
      bonus: 1,
      description: '配合侦查卡，防御方信息-1',
    },
  },
  {
    code: 'ATK010',
    name: 'XSS攻击（XSS Attack）',
    description: '消耗：算力1,信息2；效果：判定难度2，成功则安全-2；持续：每回合安全-1，持续3回合；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    code: 'ATK011',
    name: 'CSRF攻击（CSRF Attack）',
    description: '消耗：信息2；效果：判定难度3，成功则安全-2，窃取对方1信息，失败则窃取对方1信息；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    code: 'ATK012',
    name: '文件上传漏洞（File Upload）',
    description: '消耗：算力2,信息1；效果：判定难度4，成功则安全-3，获得1权限，判定失败则安全-1；大成功：直接获得2权限；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'rare',
    techLevel: 2,
    difficulty: 4,
    effects: [{ type: 'security_reduce', baseValue: 3, description: '安全-3' }],
  },
  {
    code: 'ATK013',
    name: '命令注入（Command Injection）',
    description: '消耗：算力3；效果：判定难度4，成功则安全-4；亡语：弃牌时对随机区域造成1威胁；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'rare',
    techLevel: 2,
    difficulty: 4,
    effects: [{ type: 'security_reduce', baseValue: 4, description: '安全-4' }],
  },
  {
    code: 'ATK014',
    name: '目录遍历（Path Traversal）',
    description: '消耗：资金1,信息1；效果：判定难度2，成功则安全-2，查看对方2张手牌；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    code: 'ATK015',
    name: '信息泄露利用（Info Leak）',
    description: '消耗：信息2；效果：判定难度2，成功则安全-2，信息+2；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'common',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    code: 'ATK016',
    name: '配置错误利用（Misconfig）',
    description: '消耗：算力1,信息2，资金1；效果：判定难度3，成功则安全-3，下回合对方判定难度+1；触发：出牌时',
    type: 'vuln_exploit',
    rarity: 'epic',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 3, description: '安全-3' }],
  },
  // T2 权限提升 (8张)
  {
    code: 'ATK017',
    name: '本地权限提升（Local Privilege）',
    description: '消耗：算力2,权限1；效果：判定难度3，成功则渗透+3，失败则权限+1；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'common',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
  {
    code: 'ATK018',
    name: '横向移动（Lateral Movement）',
    description: '消耗：算力3,权限1；效果：判定难度4，成功则渗透+4，清楚选定区域内的2个防御方标记；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    code: 'ATK019',
    name: '后门植入（Backdoor）',
    description: '消耗：算力1,信息1,资金1，权限1；效果：判定难度3，成功则渗透+3；持续：每回合渗透+1，持续3回合；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
  {
    code: 'ATK020',
    name: '凭证窃取（Credential Theft）',
    description: '消耗：信息3,权限1；效果：判定难度3，成功则渗透+4，窃取对方所有信息，失败则窃取对方1点信息；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'epic',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    code: 'ATK021',
    name: '令牌伪造（Token Forgery）',
    description: '消耗：算力2,权限2；效果：判定难度4，成功则渗透+5，失败则权限+1；大成功：选定对方一个区域内的所有标记，转化为己方的威胁标记；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: '渗透+5' }],
  },
  {
    code: 'ATK022',
    name: '计划任务利用（Scheduled Task）',
    description: '消耗：资金2,信息1；效果：判定难度3，成功则渗透+3；延迟：下回合开始时+2渗透；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'common',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
  {
    code: 'ATK023',
    name: '服务劫持（Service Hijacking）',
    description: '消耗：算力3,权限1；效果：判定难度3，成功则渗透+4，持续：使对方下回合所有安全提升数值-1，持续1回合；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    code: 'ATK024',
    name: '内核漏洞利用（Kernel Exploit）',
    description: '消耗：算力4,权限2；效果：判定难度5，成功则渗透+6，失败则本轮游戏，所有普通权限卡判定难度-1；大成功：无视防御直接+10渗透；触发：出牌时',
    type: 'privilege_escalation',
    rarity: 'epic',
    techLevel: 3,
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6' }],
  },
  // T3 高级攻击 (8张)
  {
    code: 'ATK025',
    name: 'APT攻击（APT Attack）',
    description: '消耗：算力3,信息3,权限1；效果：判定难度4，成功则渗透+5，失败则下一张需要判定的卡牌，判定难度-1；持续：每回合渗透+2，持续3回合；亡语：弃牌时渗透+2；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: '渗透+5' }],
  },
  {
    code: 'ATK026',
    name: '零日漏洞（0day Exploit）',
    description: '消耗：算力3,信息3,资金2，权限2；效果：判定难度5，成功则渗透+8，安全-2，失败则渗透+4，安全-1；大成功：直接+12渗透；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'legendary',
    techLevel: 4,
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8' }],
  },
  {
    code: 'ATK027',
    name: '供应链攻击（Supply Chain）',
    description: '消耗：资金4,信息3；效果：判定难度4，成功则渗透+5，持续对方摸牌数-1，持续2回合；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: '渗透+5' }],
  },
  {
    code: 'ATK028',
    name: '勒索软件（Ransomware）',
    description: '消耗：算力2,信息2,资金2；效果：判定难度4，成功则渗透+6，对方资金-3，失败则对方资金-1；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6' }],
  },
  {
    code: 'ATK029',
    name: '挖矿木马（Crypto Miner）',
    description: '消耗：信息2，资金3,权限1；效果：判定难度3，成功则渗透+3，算力+1，持续：永久每回合资金+1；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'rare',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
  {
    code: 'ATK030',
    name: '数据窃取（Data Exfiltration）',
    description: '消耗：信息2,权限1；效果：判定难度4，成功则渗透+5，获得3张卡牌，失败则获得2张卡牌；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: '渗透+5' }],
  },
  {
    code: 'ATK031',
    name: '持久化攻击（Persistence）',
    description: '消耗：算力2,信息2,权限1；效果：判定难度3，成功则渗透+4；光环：在场时每回合渗透+1，安全-1；触发：出牌时',
    type: 'advanced_attack',
    rarity: 'rare',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    code: 'ATK032',
    name: '高级钓鱼（Advanced Phishing）',
    description: '消耗：资金3,信息3；效果：判定难度3，成功则渗透+4，对方安全-3，失败则渗透+1；大成功：对方资金-3触发：出牌时',
    type: 'advanced_attack',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  // T4 完全控制 (8张)
  {
    code: 'ATK033',
    name: '完全控制（Total Control）',
    description: '消耗：算力4,信息2,资金3权限2；效果：判定难度5，成功则渗透+10；大成功：安全-10；触发：出牌时',
    type: 'total_control',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 10, description: '渗透+10' }],
  },
  {
    code: 'ATK034',
    name: '域控接管（Domain Takeover）',
    description: '消耗：信息2，资金5,权限3；效果：判定难度5，成功则渗透+8，选择一个区域，将该区域的所有防守方标记转化为进攻方标记，失败则选定一个区域，在该区域内增加2个威胁标记；触发：出牌时',
    type: 'total_control',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 5,
    effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8' }],
  },
  {
    code: 'ATK035',
    name: '数据销毁（Data Destruction）',
    description: '消耗：算力4,权限2；效果：判定难度4，成功则渗透+6，安全-4，失败则安全-2；触发：出牌时',
    type: 'total_control',
    rarity: 'epic',
    techLevel: 5,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 6, description: '渗透+6' }],
  },
  {
    code: 'ATK036',
    name: '系统瘫痪（System Crash）',
    description: '消耗：算力5,信息2；效果：判定难度4，成功则渗透+7，对方下回合行动点-2；触发：出牌时',
    type: 'total_control',
    rarity: 'epic',
    techLevel: 5,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 7, description: '渗透+7' }],
  },
  {
    code: 'ATK037',
    name: '权限维持（Privilege Maintain）',
    description: '消耗：算力2,权限3；效果：判定难度2，成功则渗透+4，权限+1；光环：免疫本区域内的防御方清除效果；触发：出牌时',
    type: 'total_control',
    rarity: 'rare',
    techLevel: 5,
    difficulty: 2,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    code: 'ATK038',
    name: '深度隐藏（Deep Cover）',
    description: '消耗：信息3,权限2；效果：判定难度4，成功则渗透+5；持续光环：选定一个区域，令防御方无法在该区域增加任何防御标记，持续2回合；触发：出牌时',
    type: 'total_control',
    rarity: 'epic',
    techLevel: 5,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 5, description: '渗透+5' }],
  },
  {
    code: 'ATK039',
    name: '终极后门（Ultimate Backdoor）',
    description: '消耗：资金3,信息3,权限3；效果：判定难度4，成功则渗透+8；光环：每回合渗透+1，安全-1亡语：游戏结束时若在场，额外+5渗透；触发：出牌时',
    type: 'total_control',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 8, description: '渗透+8' }],
  },
  {
    code: 'ATK040',
    name: '网络毁灭（Cyber Armageddon）',
    description: '消耗：算力5,信息5,权限3；效果：判定难度6，成功则渗透+15，清楚选定区域内所有防御方标记；大失败：-5渗透；触发：出牌时',
    type: 'total_control',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 6,
    effects: [{ type: 'infiltration_gain', baseValue: 15, description: '渗透+15' }],
  },
];

// ============================================
// 防御方卡牌数据定义
// ============================================

const DEFENDER_CARDS_DATA: DatabaseCard[] = [
  // T0 基础防御 (8张)
  {
    code: 'DEF001',
    name: '防火墙（Firewall）',
    description: '消耗：算力1；效果：安全+1；连击：连续使用额外+0.5；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
    comboEffect: {
      type: 'same_type',
      requiredCardType: 'basic_defense',
      bonus: 0.5,
      description: '连续使用防火墙，安全额外+0.5',
    },
  },
  {
    code: 'DEF002',
    name: '入侵检测（IDS）',
    description: '消耗：算力1,信息1；效果：判定难度3，成功则安全+2，发现对方2张手牌；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'common',
    techLevel: 1,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    code: 'DEF003',
    name: '补丁更新（Patch Update）',
    description: '消耗：资金1；效果：安全+1，清除1个漏洞标记；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    code: 'DEF004',
    name: '访问控制（Access Control）',
    description: '消耗：算力1,资金1；效果：安全+2；持续：2回合内，每回合可抵消对方一次威胁标记；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    code: 'DEF005',
    name: '日志审计（Log Audit）',
    description: '消耗：资金1；效果：安全+1，信息+1；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    code: 'DEF006',
    name: '备份恢复（Backup Restore）',
    description: '消耗：资金2；效果：安全+1，光环随机获得资金1/算力1/信息1；触发：出牌时',
    type: 'basic_defense',
    rarity: 'rare',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    code: 'DEF007',
    name: '密码策略（Password Policy）',
    description: '消耗：算力1；效果：安全+1，对方下回合判定难度+1；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    code: 'DEF008',
    name: '网络分段（Network Segmentation）',
    description: '消耗：算力2；效果：安全+2，选定一个区域，增加一个安全标记；触发：出牌时',
    type: 'basic_defense',
    rarity: 'rare',
    techLevel: 1,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  // T1 入侵检测 (8张)
  {
    code: 'DEF009',
    name: '流量分析（Traffic Analysis）',
    description: '消耗：信息2；效果：判定难度2，成功则安全+2，查看对方所有手牌；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'common',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    code: 'DEF010',
    name: '行为分析（Behavior Analysis）',
    description: '消耗：算力1,信息1；效果：判定难度3，成功则安全+2，使对方下一张牌的判定难度为6；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'common',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    code: 'DEF011',
    name: '威胁情报（Threat Intelligence）',
    description: '消耗：信息2,资金1；效果：判定难度2，成功则安全+3，清除对方场上1个威胁标记；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'rare',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF012',
    name: '沙箱检测（Sandbox）',
    description: '消耗：算力2,信息1；效果：判定难度3，成功则安全+3，阻止对方下一个标记；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'rare',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF013',
    name: '蜜罐系统（Honeypot）',
    description: '消耗：算力2,资金2；效果：判定难度3，成功则安全+3；光环：对方攻击时触发石头剪刀布判定，失败则攻击无效，平局则信息+1，胜利无效果触发；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'epic',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF014',
    name: '异常检测（Anomaly Detection）',
    description: '消耗：信息2；效果：判定难度2，成功则安全+2，对方下回合行动点-1；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'common',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    code: 'DEF015',
    name: '关联分析（Correlation Analysis）',
    description: '消耗：信息3；效果：判定难度3，成功则安全+4，光环选择抵消对方一个持续效果；触发：出牌时',
    type: 'intrusion_detection',
    rarity: 'rare',
    techLevel: 2,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  {
    code: 'DEF016',
    name: '实时告警（Real-time Alert）',
    description: '消耗：算力1,信息1；效果：安全+2，使对方下一次判定难度+2；响应：对方出牌时可立即打出，阻止该效果；触发：出牌时/响应时',
    type: 'intrusion_detection',
    rarity: 'common',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  // T2 主动防御 (8张)
  {
    code: 'DEF017',
    name: '主动拦截（Active Blocking）',
    description: '消耗：算力2；效果：安全+3，阻止对方下1次攻击；触发：出牌时',
    type: 'active_defense',
    rarity: 'common',
    techLevel: 3,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF018',
    name: '反制措施（Countermeasure）',
    description: '消耗：算力3；效果：判定难度3，成功则安全+4，对方渗透-3，失败算力+2；触发：出牌时',
    type: 'active_defense',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  {
    code: 'DEF019',
    name: '溯源追踪（Attribution）',
    description: '消耗：信息3；效果：判定难度3，成功则安全+3，对方信息-2；触发：出牌时',
    type: 'active_defense',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF020',
    name: '隔离处置（Quarantine）',
    description: '消耗：算力2,信息2；效果：判定难度4，成功则安全+5，清除对方所有持续效果；触发：出牌时',
    type: 'active_defense',
    rarity: 'epic',
    techLevel: 3,
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 5, description: '安全+5' }],
  },
  {
    code: 'DEF021',
    name: '反击渗透（Counter-infiltration）',
    description: '消耗：算力3,信息2；效果：判定难度4，成功则安全+5，对方渗透-5，失败则安全+2；触发：出牌时',
    type: 'active_defense',
    rarity: 'epic',
    techLevel: 3,
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 5, description: '安全+5' }],
  },
  {
    code: 'DEF022',
    name: '诱捕系统（Decoy System）',
    description: '消耗：资金3；效果：安全+3；光环：对方攻击时触发石头剪刀布判定，成功：攻击失效，平局：无效果，失败：移除本卡至弃牌堆；触发：出牌时',
    type: 'active_defense',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF023',
    name: '动态防御（Dynamic Defense）',
    description: '消耗：算力2,资金1；效果：安全+3；持续：每回合安全+1，持续3回合；触发：出牌时',
    type: 'active_defense',
    rarity: 'rare',
    techLevel: 3,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF024',
    name: '威胁清除（Threat Removal）',
    description: '消耗：算力3,信息2；效果：判定难度3，成功则安全+4，清除场上选定区域所有威胁标记，失败：清楚场上选定区域的1个威胁标记；触发：出牌时',
    type: 'active_defense',
    rarity: 'epic',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  // T3 纵深防御 (8张)
  {
    code: 'DEF025',
    name: '多层防护（Defense in Depth）',
    description: '消耗：算力3,资金2；效果：安全+5；光环：对方判定难度+1；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 5, description: '安全+5' }],
  },
  {
    code: 'DEF026',
    name: '零信任架构（Zero Trust）',
    description: '消耗：算力4,信息2；效果：安全+6；光环：对方判定难度+1持续：对方每回合渗透-3，持续3回合；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'legendary',
    techLevel: 4,
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 6, description: '安全+6' }],
  },
  {
    code: 'DEF027',
    name: '安全加固（Security Hardening）',
    description: '消耗：算力2,资金2；效果：安全+4，所有区域防御标记+1；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'rare',
    techLevel: 4,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  {
    code: 'DEF028',
    name: '漏洞修复（Vulnerability Fix）',
    description: '消耗：算力3,信息2；效果：安全+4，清除所有漏洞标记，免疫下2次漏洞攻击；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  {
    code: 'DEF029',
    name: '权限最小化（Least Privilege）',
    description: '消耗：算力2,信息1；效果：安全+3；光环：对方权限消耗+1亡语：对方权限-1；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'rare',
    techLevel: 4,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'DEF030',
    name: '安全审计（Security Audit）',
    description: '消耗：信息3,资金2；效果：判定难度3，成功则安全+5，使对方当前所有持续效果失效1回合；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 5, description: '安全+5' }],
  },
  {
    code: 'DEF031',
    name: '应急响应（Incident Response）',
    description: '消耗：算力3,信息2,资金1；效果：安全+5，每个区域安全标记+1；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'epic',
    techLevel: 4,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 5, description: '安全+5' }],
  },
  {
    code: 'DEF032',
    name: '灾难恢复（Disaster Recovery）',
    description: '消耗：资金4；效果：安全+4；光环：安全+3持续：安全+2.持续3回合亡语：安全+9；触发：出牌时',
    type: 'defense_in_depth',
    rarity: 'legendary',
    techLevel: 4,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  // T4 绝对安全 (8张)
  {
    code: 'DEF033',
    name: '绝对防御（Absolute Defense）',
    description: '消耗：算力4,信息3,资金2；效果：判定难度：4，成功则安全+12，失败则安全+6；大成功：安全+6；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 12, description: '安全+12' }],
  },
  {
    code: 'DEF034',
    name: '免疫屏障（Immunity Barrier）',
    description: '消耗：算力3,信息3；效果：安全+6；光环：所有攻击效果触发前，先进行剪刀石头布判定，成功或平局：攻击失效；失败：无效果；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 6, description: '安全+6' }],
  },
  {
    code: 'DEF035',
    name: '安全领域（Security Domain）',
    description: '消耗：算力4,资金2；效果：安全+7，清楚一个区域的所有进攻方标记；触发：出牌时',
    type: 'absolute_security',
    rarity: 'epic',
    techLevel: 5,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 7, description: '安全+7' }],
  },
  {
    code: 'DEF036',
    name: '终极防火墙（Ultimate Firewall）',
    description: '消耗：算力5,信息2；效果：安全+8；光环：每回合安全+2，且不可被移除；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 8, description: '安全+8' }],
  },
  {
    code: 'DEF037',
    name: '安全态势感知（Situational Awareness）',
    description: '消耗：信息4；效果：安全+6，渗透-6；持续：选定一个区域，对方在3回合内无法在该区域放置任何标记；触发：出牌时',
    type: 'absolute_security',
    rarity: 'epic',
    techLevel: 5,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 6, description: '安全+6' }],
  },
  {
    code: 'DEF038',
    name: '威胁情报共享（Threat Sharing）',
    description: '消耗：信息3,资金2；效果：安全+4，2v2模式下队友安全+3持续：安全+2，持续5回合；触发：出牌时',
    type: 'absolute_security',
    rarity: 'rare',
    techLevel: 5,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
  {
    code: 'DEF039',
    name: '安全自动化（Security Automation）',
    description: '消耗：算力3,资金3；效果：安全+6；光环：对方判定难度+2亡语对方下一张卡牌失效；触发：出牌时',
    type: 'absolute_security',
    rarity: 'epic',
    techLevel: 5,
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 6, description: '安全+6' }],
  },
  {
    code: 'DEF040',
    name: '网络堡垒（Cyber Fortress）',
    description: '消耗：算力5,信息3,资金3；效果：判定难度5，成功则安全+20，失败则安全+12持续：对方所有卡牌消耗资源的数字+1，持续3回合；大失败：安全-5；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 5,
    difficulty: 5,
    effects: [{ type: 'security_gain', baseValue: 20, description: '安全+20' }],
  },
];

// ============================================
// 通用卡牌数据定义 (9张)
// ============================================

const NEUTRAL_CARDS_DATA: DatabaseCard[] = [
  {
    code: 'COM001',
    name: '幸运判定（Lucky Roll）',
    description: '消耗：资金1；效果：持续：判定可重掷1次，持续2回合；触发：出牌时',
    type: 'basic_defense',
    rarity: 'rare',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    code: 'COM002',
    name: '资源调配（Resource Allocation）',
    description: '消耗：无；效果：将1点任意资源转换为另1点资源；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    code: 'COM003',
    name: '紧急补给（Emergency Supply）',
    description: '消耗：无；效果：恢复2点已消耗资源；触发：出牌时',
    type: 'basic_defense',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 2, description: '获得2点算力' }],
  },
  {
    code: 'COM004',
    name: '情报交易（Intel Trade）',
    description: '消耗：资金1；效果：信息+2，资金-1；触发：出牌时',
    type: 'basic_recon',
    rarity: 'common',
    techLevel: 1,
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'information', value: 2, description: '获得2点信息' }],
  },
  {
    code: 'SPE001',
    name: '时间压缩（Time Compression）',
    description: '消耗：算力3；效果：本回合行动点+1；触发：出牌时',
    type: 'total_control',
    rarity: 'legendary',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    code: 'SPE002',
    name: '命运骰子（Fate Dice）',
    description: '消耗：无；效果：掷骰子，1-2:无效果，3-4:资源+1，5-6:资源+2；触发：出牌时',
    type: 'total_control',
    rarity: 'legendary',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'dice_check', difficulty: 3, onSuccess: { type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点资源' } }],
  },
  {
    code: 'SPE003',
    name: '绝境反击（Desperate Counter）',
    description: '消耗：无；效果：当自己安全/渗透<10时，安全/渗透+3；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 2,
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    code: 'SPE004',
    name: '信息封锁（Info Blockade）',
    description: '消耗：算力2，信息1；效果：对方下回合无法获得信息；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 3,
    difficulty: 3,
    effects: [{ type: 'infiltration_suppress', duration: 1, description: '压制渗透1回合' }],
  },
  {
    code: 'SPE005',
    name: '终极协议（Ultimate Protocol）',
    description: '消耗：所有资源；效果：根据阵营安全/渗透+5，且对方下回合所有判定难度+1；触发：出牌时',
    type: 'absolute_security',
    rarity: 'legendary',
    techLevel: 4,
    difficulty: 4,
    effects: [{ 
      type: 'ultimate_protocol', 
      baseValue: 5, 
      description: '消耗所有资源，根据阵营安全/渗透+5，对方下回合判定难度+1',
      costAllResources: true,
      opponentDifficultyIncrease: 1,
      duration: 1
    }],
  },
];

// ============================================
// 卡牌数据转换函数
// ============================================

/**
 * 从描述中解析资源消耗
 * 格式: "消耗：算力1,资金2,信息1,权限1"
 */
function parseCostFromDescription(description: string): Partial<Resources> {
  const cost: Partial<Resources> = {};
  const costMatch = description.match(/消耗：([^；;]+)/);
  if (costMatch) {
    const costStr = costMatch[1];
    // 解析算力
    const computeMatch = costStr.match(/算力(\d+)/);
    if (computeMatch) cost.compute = parseInt(computeMatch[1]);
    // 解析资金
    const fundsMatch = costStr.match(/资金(\d+)/);
    if (fundsMatch) cost.funds = parseInt(fundsMatch[1]);
    // 解析信息
    const infoMatch = costStr.match(/信息(\d+)/);
    if (infoMatch) cost.information = parseInt(infoMatch[1]);
    // 解析权限 (注意：Resources类型中使用access表示权限)
    const permMatch = costStr.match(/权限(\d+)/);
    if (permMatch) (cost as Record<string, number>).access = parseInt(permMatch[1]);
  }
  return cost;
}

function createCard(data: DatabaseCard, faction: ExtendedFaction): Card {
  return {
    card_code: data.code,
    name: data.name,
    description: data.description,
    type: data.type,
    faction: faction as Faction,
    rarity: data.rarity,
    techLevel: data.techLevel,
    cost: parseCostFromDescription(data.description),
    difficulty: data.difficulty,
    effects: data.effects,
    comboEffect: data.comboEffect,
  };
}

/** 通用卡牌类型 - 扩展Card类型以支持neutral阵营 */
interface NeutralCard extends Omit<Card, 'faction'> {
  faction: ExtendedFaction;
}

// ============================================
// 生成完整卡牌数据库
// ============================================

/** 进攻方卡牌库 (40张) */
export const ATTACKER_CARDS: Card[] = ATTACKER_CARDS_DATA.map(data => createCard(data, 'attack'));

/** 防御方卡牌库 (40张) */
export const DEFENDER_CARDS: Card[] = DEFENDER_CARDS_DATA.map(data => createCard(data, 'defense'));

/** 通用卡牌库 (9张) */
export const NEUTRAL_CARDS: NeutralCard[] = NEUTRAL_CARDS_DATA.map(data => ({
  card_code: data.code,
  name: data.name,
  description: data.description,
  type: data.type,
  faction: 'neutral' as ExtendedFaction,
  rarity: data.rarity,
  techLevel: data.techLevel,
  cost: parseCostFromDescription(data.description),
  difficulty: data.difficulty,
  effects: data.effects,
  comboEffect: data.comboEffect,
}));

/** 完整卡牌数据库 - 使用联合类型支持neutral阵营 */
export const COMPLETE_CARD_DATABASE: Record<string, Card | NeutralCard> = {};

// 注册所有卡牌
[...ATTACKER_CARDS, ...DEFENDER_CARDS, ...NEUTRAL_CARDS].forEach(card => {
  COMPLETE_CARD_DATABASE[card.card_code] = card;
});

/** 获取卡牌总数 */
export const TOTAL_CARD_COUNT = Object.keys(COMPLETE_CARD_DATABASE).length;

/** 按阵营获取卡牌 - 支持neutral阵营 */
export function getCardsByFaction(faction: ExtendedFaction): (Card | NeutralCard)[] {
  return Object.values(COMPLETE_CARD_DATABASE).filter(card => card.faction === faction);
}

/** 按科技等级获取卡牌 */
export function getCardsByTechLevel(techLevel: TechLevel): (Card | NeutralCard)[] {
  return Object.values(COMPLETE_CARD_DATABASE).filter(card => card.techLevel === techLevel);
}

/** 按稀有度获取卡牌 */
export function getCardsByRarity(rarity: CardRarity): (Card | NeutralCard)[] {
  return Object.values(COMPLETE_CARD_DATABASE).filter(card => card.rarity === rarity);
}

/** 按类型获取卡牌 */
export function getCardsByType(type: CardType): (Card | NeutralCard)[] {
  return Object.values(COMPLETE_CARD_DATABASE).filter(card => card.type === type);
}

/** 搜索卡牌 */
export function searchCards(query: string): (Card | NeutralCard)[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(COMPLETE_CARD_DATABASE).filter(card =>
    card.name.toLowerCase().includes(lowerQuery) ||
    card.card_code.toLowerCase().includes(lowerQuery) ||
    card.description.toLowerCase().includes(lowerQuery)
  );
}

/** 获取卡牌统计信息 */
export function getCardStats(): {
  total: number;
  attacker: number;
  defender: number;
  neutral: number;
  byTechLevel: Record<TechLevel, number>;
  byRarity: Record<CardRarity, number>;
} {
  const cards = Object.values(COMPLETE_CARD_DATABASE);
  return {
    total: cards.length,
    attacker: cards.filter(c => c.faction === 'attack').length,
    defender: cards.filter(c => c.faction === 'defense').length,
    neutral: cards.filter(c => c.faction === 'neutral' as ExtendedFaction).length,
    byTechLevel: {
      1: cards.filter(c => c.techLevel === 1).length,
      2: cards.filter(c => c.techLevel === 2).length,
      3: cards.filter(c => c.techLevel === 3).length,
      4: cards.filter(c => c.techLevel === 4).length,
      5: cards.filter(c => c.techLevel === 5).length,
    },
    byRarity: {
      common: cards.filter(c => c.rarity === 'common').length,
      rare: cards.filter(c => c.rarity === 'rare').length,
      epic: cards.filter(c => c.rarity === 'epic').length,
      legendary: cards.filter(c => c.rarity === 'legendary').length,
    },
  };
}

export default COMPLETE_CARD_DATABASE;
