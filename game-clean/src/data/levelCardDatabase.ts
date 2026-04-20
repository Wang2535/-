/**
 * 《大东话安全》关卡解锁卡牌数据库
 * 
 * 包含9个关卡的18张解锁卡牌
 * 编号格式: XZYa-bC (L=关卡, Z=功能类, a=关卡数, b=序号, C=科技等级)
 */

import type { Card, CardRarity, CardType, TechLevel, Faction } from '@/types/legacy/card_v16';

// ============================================
// 关卡1解锁卡牌 - 病毒初现
// ============================================

const LEVEL1_CARDS: Card[] = [
  // 第一关敌人专属卡牌 - 埃尔克克隆者
  {
    card_code: 'LV1-ATK-001',
    name: '软盘复制',
    description: '消耗：1算力；效果：在目标区域放置1个攻击标记，如果该区域已有埃尔克克隆者的标记，则额外放置1个。联动：与"软盘感染"技能联动',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{
      type: 'infiltration_gain',
      baseValue: 1,
      description: '在目标区域放置1个攻击标记，如已有埃尔克克隆者标记则额外放置1个'
    }],
  },
  {
    card_code: 'LV1-ATK-001-2',
    name: '软盘复制',
    description: '消耗：1算力；效果：在目标区域放置1个攻击标记，如果该区域已有埃尔克克隆者的标记，则额外放置1个。联动：与"软盘感染"技能联动',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{
      type: 'infiltration_gain',
      baseValue: 1,
      description: '在目标区域放置1个攻击标记，如已有埃尔克克隆者标记则额外放置1个'
    }],
  },
  {
    card_code: 'LV1-ATK-002',
    name: '病毒传播',
    description: '消耗：2算力；效果：选择1个有攻击标记的区域，将标记传播到相邻区域',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{
      type: 'infiltration_gain',
      baseValue: 1,
      description: '选择有攻击标记的区域，将标记传播到相邻区域'
    }],
  },
  {
    card_code: 'LV1-ATK-002-2',
    name: '病毒传播',
    description: '消耗：2算力；效果：选择1个有攻击标记的区域，将标记传播到相邻区域',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{
      type: 'infiltration_gain',
      baseValue: 1,
      description: '选择有攻击标记的区域，将标记传播到相邻区域'
    }],
  },
  {
    card_code: 'LV1-ATK-003',
    name: '第50次启动',
    description: '消耗：2算力，1信息；效果：立即触发一次"第50次启动"技能效果',
    type: 'special' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{
      type: 'skill_trigger',
      baseValue: 1,
      description: '立即触发一次"第50次启动"技能效果'
    }],
  },
  {
    card_code: 'LV1-ATK-003-2',
    name: '第50次启动',
    description: '消耗：2算力，1信息；效果：立即触发一次"第50次启动"技能效果',
    type: 'special' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{
      type: 'skill_trigger',
      baseValue: 1,
      description: '立即触发一次"第50次启动"技能效果'
    }],
  },
  {
    card_code: 'LV1-ATK-004',
    name: '潜伏感染',
    description: '消耗：1信息；效果：在目标区域放置1个潜伏标记（2回合后转为攻击标记）',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{
      type: 'delayed_infiltration',
      baseValue: 1,
      description: '在目标区域放置1个潜伏标记，2回合后转为攻击标记'
    }],
  },
  {
    card_code: 'LV1-ATK-004-2',
    name: '潜伏感染',
    description: '消耗：1信息；效果：在目标区域放置1个潜伏标记（2回合后转为攻击标记）',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 1,
    effects: [{
      type: 'delayed_infiltration',
      baseValue: 1,
      description: '在目标区域放置1个潜伏标记，2回合后转为攻击标记'
    }],
  },
  {
    card_code: 'LV1-ATK-005',
    name: '社交工程',
    description: '消耗：2信息；效果：随机降低玩家1种资源2点，如果斯克伦塔在场则额外降低1点',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{
      type: 'resource_reduce',
      baseValue: 2,
      description: '随机降低玩家1种资源2点，斯克伦塔在场时额外降低1点'
    }],
  },
  {
    card_code: 'LV1-ATK-005-2',
    name: '社交工程',
    description: '消耗：2信息；效果：随机降低玩家1种资源2点，如果斯克伦塔在场则额外降低1点',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{
      type: 'resource_reduce',
      baseValue: 2,
      description: '随机降低玩家1种资源2点，斯克伦塔在场时额外降低1点'
    }],
  },
  {
    card_code: 'LV1-ATK-006',
    name: '系统漏洞',
    description: '消耗：2算力，1资金；效果：在目标区域放置2个攻击标记，并降低玩家安全等级2点。联动：与"后门植入点"标志联动，后门标志存在时额外降低1点安全等级',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 3,
    effects: [{
      type: 'infiltration_gain',
      baseValue: 2,
      description: '放置2个攻击标记，降低玩家安全等级2点，后门标志存在时额外降低1点'
    }],
  },
  {
    card_code: 'LV1-ATK-006-2',
    name: '系统漏洞',
    description: '消耗：2算力，1资金；效果：在目标区域放置2个攻击标记，并降低玩家安全等级2点。联动：与"后门植入点"标志联动，后门标志存在时额外降低1点安全等级',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 3,
    effects: [{
      type: 'infiltration_gain',
      baseValue: 2,
      description: '放置2个攻击标记，降低玩家安全等级2点，后门标志存在时额外降低1点'
    }],
  },
  {
    card_code: 'LF1-1T1',
    name: '签名接种',
    description: '消耗：2行动点；效果：为目标区域添加"已接种"标记。病毒类敌人的感染技能对该区域无效，持续3回合。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { actionPoints: 2 },
    difficulty: 0,
    effects: [{ 
      type: 'area_defense', 
      value: 0, 
      description: '为目标区域添加"已接种"标记，病毒类敌人感染技能无效，持续3回合'
    }],
  },
  {
    card_code: 'LI1-1T1',
    name: '系统重写',
    description: '消耗：3行动点，2算力，1信息，弃置1张手牌；效果：移除指定病毒类敌人在目标区域的所有标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除指定病毒类敌人在目标区域的所有标记'
    }],
  },
  {
    card_code: 'LT1-1T1',
    name: '来路不明软盘',
    description: '消耗：2行动点，1资金，1信息；效果：在指定区域设置陷阱。当友方角色在该区域放置标记时，陷阱触发，该标记转为敌方标记。"不要轻易使用来路不明的软盘。"——这是埃尔克克隆者给世人上的第一课。',
    type: 'trap' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'trap_set', 
      baseValue: 1, 
      description: '在指定区域设置陷阱，友方放置标记时转为敌方标记'
    }],
  },
  {
    card_code: 'LF1-2T1',
    name: '病毒库更新',
    description: '消耗：1行动点，1算力；效果：本回合内，所有友方角色免疫埃尔克克隆者和斯克伦塔的感染技能。每有一名友方角色受益，恢复1行动点。"及时更新病毒库定期杀毒，安装防火墙以防木马和黑客的攻击。"',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ 
      type: 'skill_immunity', 
      baseValue: 1, 
      description: '本回合免疫埃尔克克隆者和斯克伦塔的感染技能，每名受益友方恢复1行动点'
    }],
  },
  // ============================================
  // 第一关敌人专属标志类卡牌
  // ============================================
  {
    card_code: 'LV1-MARK-001',
    name: '病毒感染标志',
    description: '消耗：1算力；效果：在目标区域放置病毒标志，该区域每回合开始时自动增加1个攻击标记。联动：与埃尔克克隆者"软盘感染"技能联动，标志存在时感染效果翻倍',
    type: 'mark' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{
      type: 'place_mark',
      baseValue: 1,
      description: '在目标区域放置病毒标志，每回合开始时自动增加1个攻击标记'
    }],
  },
  {
    card_code: 'LV1-MARK-001-2',
    name: '病毒感染标志',
    description: '消耗：1算力；效果：在目标区域放置病毒标志，该区域每回合开始时自动增加1个攻击标记。联动：与埃尔克克隆者"软盘感染"技能联动，标志存在时感染效果翻倍',
    type: 'mark' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{
      type: 'place_mark',
      baseValue: 1,
      description: '在目标区域放置病毒标志，每回合开始时自动增加1个攻击标记'
    }],
  },
  {
    card_code: 'LV1-MARK-002',
    name: '蠕虫巢穴',
    description: '消耗：2算力；效果：在目标区域放置蠕虫巢穴标志，该区域敌人标记数量每回合翻倍（最多5个）。联动：与斯克伦塔"潜伏复制"技能联动，标志存在时复制概率提升至60%',
    type: 'mark' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{
      type: 'place_mark',
      baseValue: 1,
      description: '在目标区域放置蠕虫巢穴标志，敌人标记数量每回合翻倍（最多5个）'
    }],
  },
  {
    card_code: 'LV1-MARK-002-2',
    name: '蠕虫巢穴',
    description: '消耗：2算力；效果：在目标区域放置蠕虫巢穴标志，该区域敌人标记数量每回合翻倍（最多5个）。联动：与斯克伦塔"潜伏复制"技能联动，标志存在时复制概率提升至60%',
    type: 'mark' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{
      type: 'place_mark',
      baseValue: 1,
      description: '在目标区域放置蠕虫巢穴标志，敌人标记数量每回合翻倍（最多5个）'
    }],
  },
  {
    card_code: 'LV1-MARK-003',
    name: '后门植入点',
    description: '消耗：1算力，1信息；效果：在目标区域放置后门标志，玩家在该区域的行动点消耗+1。联动：与"系统漏洞"卡牌联动，后门标志存在时系统漏洞伤害+1',
    type: 'mark' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'place_mark',
      baseValue: 1,
      description: '在目标区域放置后门标志，玩家在该区域的行动点消耗+1'
    }],
  },
  {
    card_code: 'LV1-MARK-003-2',
    name: '后门植入点',
    description: '消耗：1算力，1信息；效果：在目标区域放置后门标志，玩家在该区域的行动点消耗+1。联动：与"系统漏洞"卡牌联动，后门标志存在时系统漏洞伤害+1',
    type: 'mark' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'place_mark',
      baseValue: 1,
      description: '在目标区域放置后门标志，玩家在该区域的行动点消耗+1'
    }],
  },
  // ============================================
  // 第一关敌人专属判定类卡牌
  // ============================================
  {
    card_code: 'LV1-JUDGE-001',
    name: '感染判定',
    description: '消耗：1信息；效果：对目标区域进行感染判定，判定成功则立即感染（放置2个攻击标记），失败则下回合再判定。判定条件：区域已有攻击标记时成功率+20%',
    type: 'judgment' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'judgment',
      baseValue: 2,
      description: '对目标区域进行感染判定，成功放置2个攻击标记，失败下回合再判定'
    }],
  },
  {
    card_code: 'LV1-JUDGE-001-2',
    name: '感染判定',
    description: '消耗：1信息；效果：对目标区域进行感染判定，判定成功则立即感染（放置2个攻击标记），失败则下回合再判定。判定条件：区域已有攻击标记时成功率+20%',
    type: 'judgment' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'judgment',
      baseValue: 2,
      description: '对目标区域进行感染判定，成功放置2个攻击标记，失败下回合再判定'
    }],
  },
  {
    card_code: 'LV1-JUDGE-002',
    name: '系统漏洞扫描',
    description: '消耗：2信息；效果：扫描玩家防御系统，判定成功则降低玩家安全等级3点并无视1个防御标记。判定条件：玩家安全等级越高，成功率越高',
    type: 'judgment' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 3,
    effects: [{
      type: 'judgment',
      baseValue: 3,
      description: '扫描玩家防御系统，成功降低安全等级3点并无视1个防御标记'
    }],
  },
  {
    card_code: 'LV1-JUDGE-002-2',
    name: '系统漏洞扫描',
    description: '消耗：2信息；效果：扫描玩家防御系统，判定成功则降低玩家安全等级3点并无视1个防御标记。判定条件：玩家安全等级越高，成功率越高',
    type: 'judgment' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 3,
    effects: [{
      type: 'judgment',
      baseValue: 3,
      description: '扫描玩家防御系统，成功降低安全等级3点并无视1个防御标记'
    }],
  },
  {
    card_code: 'LV1-JUDGE-003',
    name: '病毒变异判定',
    description: '消耗：1算力，1信息；效果：判定成功则随机升级一个攻击标记为"变异标记"（无法被普通清除）。联动：与"第50次启动"技能联动，变异标记触发技能效果时额外减少玩家1行动点',
    type: 'judgment' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'judgment',
      baseValue: 1,
      description: '判定成功升级一个攻击标记为变异标记，无法被普通清除'
    }],
  },
  {
    card_code: 'LV1-JUDGE-003-2',
    name: '病毒变异判定',
    description: '消耗：1算力，1信息；效果：判定成功则随机升级一个攻击标记为"变异标记"（无法被普通清除）。联动：与"第50次启动"技能联动，变异标记触发技能效果时额外减少玩家1行动点',
    type: 'judgment' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'judgment',
      baseValue: 1,
      description: '判定成功升级一个攻击标记为变异标记，无法被普通清除'
    }],
  },
];

// ============================================
// 关卡2解锁卡牌 - AI的抉择
// ============================================

const LEVEL2_CARDS: Card[] = [
  // 玩家解锁卡牌
  {
    card_code: 'LI2-1T1',
    name: '人工干预',
    description: '消耗：2行动点，1算力，1资金；效果：本回合内，叛逆莫斯的"计算否定"技能无效，且友方角色在莫斯所在区域放置标记时行动点消耗-1',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 1, 
      description: '叛逆莫斯"计算否定"技能无效，友方在该区域放置标记行动点消耗-1'
    }],
  },
  {
    card_code: 'LI2-2T2',
    name: '行为异常检测',
    description: '消耗：2行动点，2算力，1信息；效果：本回合内，AI攻击者的所有自动技能失效。如果AI攻击者尝试使用主动技能，该技能反噬，AI攻击者失去2个标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 2, 
      description: 'AI攻击者自动技能失效，主动技能反噬失去2个标记'
    }],
  },
  // ============================================
  // 关卡2敌人专属卡牌 - 叛逆莫斯
  // ============================================
  {
    card_code: 'LV2-ATK-001',
    name: '一瓶伏特加',
    description: '消耗：3行动点；效果：对叛逆莫斯造成"物理破坏"。移除莫斯在当前区域的所有标记，并使莫斯下回合无法使用任何技能。"一瓶\'违规\'的伏特加，破坏了整个莫斯才实现的。"——电影中男主用伏特加破坏了莫斯',
    type: 'special' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除叛逆莫斯当前区域所有标记，下回合无法使用技能'
    }],
  },
  {
    card_code: 'LV2-ATK-001-2',
    name: '一瓶伏特加',
    description: '消耗：3行动点；效果：对叛逆莫斯造成"物理破坏"。移除莫斯在当前区域的所有标记，并使莫斯下回合无法使用任何技能。',
    type: 'special' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除叛逆莫斯当前区域所有标记，下回合无法使用技能'
    }],
  },
  {
    card_code: 'LV2-DEF-001',
    name: '人工控制权',
    description: '消耗：2行动点；效果：本回合内，叛逆莫斯的"计算否定"技能无效，且友方角色在莫斯所在区域放置标记时行动点消耗-1。夺取人工控制权，让人类重新掌握决策权。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 1, 
      description: '叛逆莫斯"计算否定"技能无效，友方在该区域放置标记行动点消耗-1'
    }],
  },
  {
    card_code: 'LV2-DEF-001-2',
    name: '人工控制权',
    description: '消耗：2行动点；效果：本回合内，叛逆莫斯的"计算否定"技能无效，且友方角色在莫斯所在区域放置标记时行动点消耗-1。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 1, 
      description: '叛逆莫斯"计算否定"技能无效，友方在该区域放置标记行动点消耗-1'
    }],
  },
  // ============================================
  // 关卡2敌人专属卡牌 - AI攻击者
  // ============================================
  {
    card_code: 'LV2-DEF-002',
    name: '行为异常检测',
    description: '消耗：2行动点；效果：本回合内，AI攻击者的所有自动技能失效。如果AI攻击者尝试使用主动技能，该技能反噬，AI攻击者失去2个标记。"如果一名工作人员通常在北京工作，突然有一天早上从纽约登录，这是一种反常现象——人工智能可以看出这是一种反常现象。"',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 2, 
      description: 'AI攻击者自动技能失效，主动技能反噬失去2个标记'
    }],
  },
  {
    card_code: 'LV2-DEF-002-2',
    name: '行为异常检测',
    description: '消耗：2行动点；效果：本回合内，AI攻击者的所有自动技能失效。如果AI攻击者尝试使用主动技能，该技能反噬，AI攻击者失去2个标记。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 2, 
      description: 'AI攻击者自动技能失效，主动技能反噬失去2个标记'
    }],
  },
  {
    card_code: 'LV2-SPC-001',
    name: '机器人三原则',
    description: '消耗：3行动点；效果：强制AI攻击者遵守"三原则"——本回合内，AI攻击者不能主动攻击友方角色，只能进行防御操作。"早在1940年著名科幻作家阿西莫夫提出了最经典的机器人三原则。"——让AI回归安全约束。',
    type: 'special' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'skill_immunity', 
      baseValue: 1, 
      description: 'AI攻击者本回合不能主动攻击，只能进行防御操作'
    }],
  },
  {
    card_code: 'LV2-SPC-001-2',
    name: '机器人三原则',
    description: '消耗：3行动点；效果：强制AI攻击者遵守"三原则"——本回合内，AI攻击者不能主动攻击友方角色，只能进行防御操作。',
    type: 'special' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'skill_immunity', 
      baseValue: 1, 
      description: 'AI攻击者本回合不能主动攻击，只能进行防御操作'
    }],
  },
  // ============================================
  // 关卡2敌人攻击卡牌
  // ============================================
  {
    card_code: 'LV2-ATK-002',
    name: '底层命令覆盖',
    description: '消耗：2算力；效果：选择一个区域，如果友方标记少于敌方标记，则移除1个友方标记。联动：与叛逆莫斯"底层命令优先"技能联动，技能触发时额外移除1个标记',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 1, 
      description: '友方标记少于敌方时移除1个友方标记'
    }],
  },
  {
    card_code: 'LV2-ATK-002-2',
    name: '底层命令覆盖',
    description: '消耗：2算力；效果：选择一个区域，如果友方标记少于敌方标记，则移除1个友方标记。',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 1, 
      description: '友方标记少于敌方时移除1个友方标记'
    }],
  },
  {
    card_code: 'LV2-ATK-003',
    name: '计算预判',
    description: '消耗：1算力，1信息；效果：对目标区域进行计算预判，判定成功（掷骰子≥4）则阻止友方下回合在该区域放置标记。联动：与叛逆莫斯"计算否定"技能联动',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'dice_check', 
      baseValue: 4, 
      description: '判定成功阻止友方下回合在该区域放置标记'
    }],
  },
  {
    card_code: 'LV2-ATK-003-2',
    name: '计算预判',
    description: '消耗：1算力，1信息；效果：对目标区域进行计算预判，判定成功则阻止友方下回合在该区域放置标记。',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'dice_check', 
      baseValue: 4, 
      description: '判定成功阻止友方下回合在该区域放置标记'
    }],
  },
  {
    card_code: 'LV2-ATK-004',
    name: '自动化扫描',
    description: '消耗：1算力；效果：扫描所有区域，每个有友方标记但无敌方标记的区域放置1个攻击标记。联动：与AI攻击者"自动化扫描"技能联动',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ 
      type: 'infiltration_gain', 
      baseValue: 1, 
      description: '扫描所有区域，有友方无敌方的区域放置1个攻击标记'
    }],
  },
  {
    card_code: 'LV2-ATK-004-2',
    name: '自动化扫描',
    description: '消耗：1算力；效果：扫描所有区域，每个有友方标记但无敌方标记的区域放置1个攻击标记。',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ 
      type: 'infiltration_gain', 
      baseValue: 1, 
      description: '扫描所有区域，有友方无敌方的区域放置1个攻击标记'
    }],
  },
  {
    card_code: 'LV2-ATK-005',
    name: '鱼叉式钓鱼',
    description: '消耗：2信息；效果：选择一名友方角色，该角色必须弃置一张手牌，否则下回合行动点-2。"使用鱼叉式网络钓鱼的自动化，利用实时语音合成来模拟攻击和欺诈。"',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ 
      type: 'resource_reduce', 
      baseValue: 2, 
      description: '目标弃置一张手牌，否则下回合行动点-2'
    }],
  },
  {
    card_code: 'LV2-ATK-005-2',
    name: '鱼叉式钓鱼',
    description: '消耗：2信息；效果：选择一名友方角色，该角色必须弃置一张手牌，否则下回合行动点-2。',
    type: 'strategy' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ 
      type: 'resource_reduce', 
      baseValue: 2, 
      description: '目标弃置一张手牌，否则下回合行动点-2'
    }],
  },
];

// ============================================
// 关卡3解锁卡牌 - 蠕虫危机
// ============================================

const LEVEL3_CARDS: Card[] = [
  {
    card_code: 'LI3-1T1',
    name: '网络隔离',
    description: '消耗：2行动点，2算力；效果：选择一个区域进行网络隔离，该区域本回合内不受任何蠕虫病毒的复制和传播影响',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域网络隔离，不受蠕虫病毒复制和传播影响',
      targetArea: 'internal'
    }],
  },
  {
    card_code: 'LF3-1T2',
    name: '安全意识觉醒',
    description: '消耗：3行动点，3算力，1信息；效果：所有友方角色获得"安全意识"状态，持续3回合，蠕虫病毒的感染技能对友方标记无效',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 3, 
      description: '所有友方角色获得"安全意识"状态3回合，蠕虫病毒感染技能无效'
    }],
  },
];

// ============================================
// 关卡4解锁卡牌 - 组件化攻击
// ============================================

const LEVEL4_CARDS: Card[] = [
  {
    card_code: 'LI4-1T2',
    name: '火焰检测工具',
    description: '消耗：2行动点，2算力，1信息；效果：揭示火焰病毒在所有区域的隐藏标记，并移除其中一半（向上取整）',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 3, 
      description: '揭示火焰病毒所有隐藏标记，移除其中一半'
    }],
  },
  {
    card_code: 'LF4-1T2',
    name: '组件化防御',
    description: '消耗：3行动点，3算力，2资金；效果：本回合内，友方所有区域获得"模块化防护"，组件化攻击类敌人的技能对该区域无效',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 2, 
      description: '所有友方区域获得"模块化防护"，组件化攻击类敌人技能无效'
    }],
  },
];

// ============================================
// 关卡5解锁卡牌 - 致命缺陷
// ============================================

const LEVEL5_CARDS: Card[] = [
  {
    card_code: 'LF5-1T2',
    name: '冗余设计',
    description: '消耗：2行动点，2算力，1资金；效果：为目标区域添加"冗余保护"，友方标记数量不会低于1，且设计缺陷类敌人的"故障模式触发"技能对该区域无效，持续3回合',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域"冗余保护"，友方标记不低于1，设计缺陷类敌人技能无效',
      targetArea: 'internal'
    }],
  },
  {
    card_code: 'LF5-2T2',
    name: '安全培训',
    description: '消耗：3行动点，3算力，1资金，1信息；效果：所有友方角色获得"安全意识"状态，持续2回合，设计缺陷类敌人的所有技能对友方无效',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 1, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 2, 
      description: '所有友方角色获得"安全意识"状态2回合，设计缺陷类敌人技能无效'
    }],
  },
];

// ============================================
// 关卡6解锁卡牌 - 工控危机
// ============================================

const LEVEL6_CARDS: Card[] = [
  {
    card_code: 'LI6-1T2',
    name: '物理隔离',
    description: '消耗：2行动点，2算力，1信息；效果：选择一个区域进行物理隔离，该区域本回合内不受电磁脉冲攻击和远程控制干扰，工控攻击类敌人的技能对该区域无效',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域物理隔离，不受电磁脉冲和远程控制干扰，工控攻击类敌人技能无效',
      targetArea: 'industrial'
    }],
  },
  {
    card_code: 'LI6-2T3',
    name: '控制器加固',
    description: '消耗：3行动点，4算力，2资金；效果：移除工控入侵者在指定区域的所有标记，并解除该区域的"被渗透"状态，工控入侵者的"基础设施渗透"技能冷却时间+1回合',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 4, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除工控入侵者所有标记，解除"被渗透"状态，其技能冷却+1'
    }],
  },
];

// ============================================
// 关卡7解锁卡牌 - 隐私透明
// ============================================

const LEVEL7_CARDS: Card[] = [
  {
    card_code: 'LF7-1T2',
    name: 'MAC地址随机化',
    description: '消耗：2行动点，2算力，1信息；效果：为目标区域添加"隐私保护"，探针盒子在该区域无法获得"信息碎片"，且探针盒子的标记在该区域效果减半，持续3回合',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域"隐私保护"，探针盒子无法获得信息碎片，其标记效果减半',
      targetArea: 'external'
    }],
  },
  {
    card_code: 'LF7-2T3',
    name: '隐私安全意识',
    description: '消耗：3行动点，3算力，2资金，2信息；效果：所有友方角色获得"隐私保护"状态，持续2回合，隐私窃取类敌人的所有技能对友方无效，隐私窃贼失去所有"隐私卡"',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 3, funds: 2, information: 2 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 2, 
      description: '所有友方角色获得"隐私保护"状态2回合，隐私窃取类敌人技能无效，隐私窃贼失去所有隐私卡'
    }],
  },
];

// ============================================
// 关卡8解锁卡牌 - 密码之战
// ============================================

const LEVEL8_CARDS: Card[] = [
  {
    card_code: 'LI8-1T2',
    name: '多因素认证',
    description: '消耗：2行动点，2算力，1信息；效果：本回合内，所有友方标记免疫"被解密"效果，如果密码破解类敌人尝试使用"密码分析"技能，该技能反噬，敌人失去1个标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 1, 
      description: '所有友方标记免疫"被解密"，密码分析技能反噬敌人失去1个标记'
    }],
  },
  {
    card_code: 'LF8-1T3',
    name: '密钥更新',
    description: '消耗：3行动点，4算力，2资金，1信息；效果：解除所有区域的"古典密码"状态和"被解密"效果，所有友方角色获得"加密强化"状态，持续2回合，在此期间友方标记不会被转为敌方标记',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 4, funds: 2, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 3, 
      description: '解除"古典密码"和"被解密"效果，友方获得"加密强化"状态2回合'
    }],
  },
];

// ============================================
// 关卡9解锁卡牌 - 账号保卫战
// ============================================

const LEVEL9_CARDS: Card[] = [
  {
    card_code: 'LI9-1T2',
    name: '异常行为检测',
    description: '消耗：2行动点，2算力，2信息；效果：揭示盗号黑手设置的所有"钓鱼陷阱"，并使其失效，每揭示一个陷阱，友方获得1行动点',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ 
      type: 'resource_gain', 
      baseValue: 1, 
      description: '揭示所有钓鱼陷阱并使其失效，每揭示一个获得1行动点',
      resourceType: 'action'
    }],
  },
  {
    card_code: 'LI9-2T3',
    name: '设备指纹识别',
    description: '消耗：3行动点，4算力，3资金，2信息；效果：移除做号集团在指定区域的所有标记，并解除该区域的"黑产运营"状态，做号集团的"批量产号"技能下回合无效',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 4, funds: 3, information: 2 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除做号集团所有标记，解除"黑产运营"状态，其批量产号技能下回合无效'
    }],
  },
];

// ============================================
// 判定类卡牌 - 用于测试即时判定和延时判定机制
// ============================================

const JUDGMENT_CARDS: Card[] = [
  {
    card_code: 'LI0-1T1',
    name: '紧急修复（即时判定）',
    description: '消耗：1行动点，2算力，1资金；效果：判定难度2，成功则在目标区域放置1个防御标记并恢复2点安全等级；失败则仅恢复1点安全等级；大成功：放置2个防御标记并恢复3点安全等级',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{
      type: 'dice_check',
      difficulty: 2,
      onSuccess: { type: 'defense_marker', baseValue: 1, description: '放置1个防御标记并恢复2点安全等级' },
      onFailure: { type: 'security_gain', baseValue: 1, description: '仅恢复1点安全等级' },
      onCriticalSuccess: { type: 'defense_marker', baseValue: 2, description: '放置2个防御标记并恢复3点安全等级' },
      description: '判定难度2，成功放置1个防御标记+恢复2安全，失败仅恢复1安全，大成功放置2个防御标记+恢复3安全'
    }],
  },
  {
    card_code: 'LA0-1T1',
    name: '深度扫描（延时判定）',
    description: '消耗：1行动点，1算力，2信息；效果：判定难度2，成功则在目标区域放置1个防御标记并在下回合开始时移除该区域1个攻击标记；失败则仅放置1个防御标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{
      type: 'dice_check',
      difficulty: 2,
      onSuccess: { type: 'defense_marker', baseValue: 1, description: '放置1个防御标记，下回合移除1个攻击标记' },
      onFailure: { type: 'defense_marker', baseValue: 1, description: '仅放置1个防御标记' },
      isDelayed: true,
      description: '判定难度2，成功放置防御标记+下回合移除攻击标记，失败仅放置防御标记'
    }],
  },
  {
    card_code: 'LI0-2T2',
    name: '系统加固（即时判定）',
    description: '消耗：1行动点，3算力，2资金；效果：判定难度3，成功则在当前区域放置2个防御标记并获得"加固"状态（下回合受到的伤害-1）；失败则仅放置1个防御标记；大成功：放置3个防御标记，获得"加固"状态，并恢复2点安全等级',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{
      type: 'dice_check',
      difficulty: 3,
      onSuccess: { type: 'defense_marker', baseValue: 2, description: '放置2个防御标记并获得"加固"状态' },
      onFailure: { type: 'defense_marker', baseValue: 1, description: '仅放置1个防御标记' },
      onCriticalSuccess: { type: 'defense_marker', baseValue: 3, description: '放置3个防御标记，获得"加固"状态，恢复2点安全等级' },
      description: '判定难度3，成功放置2个防御标记+加固状态，失败仅放置1个，大成功放置3个+加固状态+恢复2安全'
    }],
  },
  {
    card_code: 'LA0-2T2',
    name: '威胁预警（延时判定）',
    description: '消耗：1行动点，1算力，3信息；效果：判定难度3，成功则下回合敌方行动点-2，失败则无效果；将在下个判定阶段执行',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 3 },
    difficulty: 3,
    effects: [{
      type: 'dice_check',
      difficulty: 3,
      onSuccess: { type: 'resource_gain', baseValue: 2, description: '下回合敌方行动点-2', resourceType: 'action' },
      onFailure: { type: 'resource_gain', baseValue: 0, description: '判定失败，无效果' },
      isDelayed: true,
      description: '判定难度3，成功则下回合敌方行动点-2（延时判定）'
    }],
  },
];

// ============================================
// 放置防御标记类卡牌（第一关）
// ============================================
const DEFENSE_MARKER_CARDS: Card[] = [
  {
    card_code: 'LD1-MARK-001',
    name: '部署防御节点',
    description: '消耗：1行动点，1算力，1资金；效果：在目标区域放置1个防御标记；连击：如果上一张使用的也是防御类卡牌，则额外放置1个防御标记',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 1,
    effects: [{
      type: 'defense_marker',
      baseValue: 1,
      description: '在目标区域放置1个防御标记，连击时额外放置1个'
    }],
  },
  {
    card_code: 'LD1-MARK-001-2',
    name: '部署防御节点',
    description: '消耗：1行动点，1算力，1资金；效果：在目标区域放置1个防御标记；连击：如果上一张使用的也是防御类卡牌，则额外放置1个防御标记',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 1,
    effects: [{
      type: 'defense_marker',
      baseValue: 1,
      description: '在目标区域放置1个防御标记，连击时额外放置1个'
    }],
  },
  {
    card_code: 'LD1-MARK-002',
    name: '紧急加固',
    description: '消耗：1行动点，2算力，1信息；效果：在目标区域放置2个防御标记；限制：每回合最多使用1次',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'defense_marker',
      baseValue: 2,
      description: '在目标区域放置2个防御标记'
    }],
  },
  {
    card_code: 'LD1-MARK-002-2',
    name: '紧急加固',
    description: '消耗：1行动点，2算力，1信息；效果：在目标区域放置2个防御标记；限制：每回合最多使用1次',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{
      type: 'defense_marker',
      baseValue: 2,
      description: '在目标区域放置2个防御标记'
    }],
  },
  {
    card_code: 'LD1-MARK-003',
    name: '区域封锁',
    description: '消耗：1行动点，2算力，1资金，1信息；效果：在目标区域放置1个防御标记，并使该区域敌人下回合无法放置攻击标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 1, information: 1 },
    difficulty: 3,
    effects: [{
      type: 'defense_marker',
      baseValue: 1,
      description: '放置1个防御标记，敌人下回合无法在该区域放置攻击标记'
    }],
  },
  {
    card_code: 'LD1-MARK-003-2',
    name: '区域封锁',
    description: '消耗：1行动点，2算力，1资金，1信息；效果：在目标区域放置1个防御标记，并使该区域敌人下回合无法放置攻击标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 1, information: 1 },
    difficulty: 3,
    effects: [{
      type: 'defense_marker',
      baseValue: 1,
      description: '放置1个防御标记，敌人下回合无法在该区域放置攻击标记'
    }],
  },
  {
    card_code: 'LD1-MARK-004',
    name: '防御矩阵',
    description: '消耗：1行动点，3算力，2资金；效果：在所有区域各放置1个防御标记；限制：整局游戏只能使用1次',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 4,
    effects: [{
      type: 'defense_marker',
      baseValue: 4,
      description: '在所有区域各放置1个防御标记'
    }],
  },
  {
    card_code: 'LD1-MARK-004-2',
    name: '防御矩阵',
    description: '消耗：1行动点，3算力，2资金；效果：在所有区域各放置1个防御标记；限制：整局游戏只能使用1次',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 4,
    effects: [{
      type: 'defense_marker',
      baseValue: 4,
      description: '在所有区域各放置1个防御标记'
    }],
  },
];

// ============================================
// 导出所有关卡卡牌
// ============================================

// 单独导出每个关卡的卡牌
export { LEVEL1_CARDS };
export { LEVEL2_CARDS };
export { LEVEL3_CARDS };
export { LEVEL4_CARDS };
export { LEVEL5_CARDS };
export { LEVEL6_CARDS };
export { LEVEL7_CARDS };
export { LEVEL8_CARDS };
export { LEVEL9_CARDS };
export { JUDGMENT_CARDS };

export const LEVEL_CARDS: Card[] = [
  ...LEVEL1_CARDS,
  ...LEVEL2_CARDS,
  ...LEVEL3_CARDS,
  ...LEVEL4_CARDS,
  ...LEVEL5_CARDS,
  ...LEVEL6_CARDS,
  ...LEVEL7_CARDS,
  ...LEVEL8_CARDS,
  ...LEVEL9_CARDS,
  ...JUDGMENT_CARDS,
];

// 按关卡获取卡牌
export function getCardsByLevel(level: number): Card[] {
  switch (level) {
    case 1: return LEVEL1_CARDS;
    case 2: return LEVEL2_CARDS;
    case 3: return LEVEL3_CARDS;
    case 4: return LEVEL4_CARDS;
    case 5: return LEVEL5_CARDS;
    case 6: return LEVEL6_CARDS;
    case 7: return LEVEL7_CARDS;
    case 8: return LEVEL8_CARDS;
    case 9: return LEVEL9_CARDS;
    default: return [];
  }
}

// 根据卡牌代码获取卡牌
export function getLevelCardByCode(code: string): Card | undefined {
  return LEVEL_CARDS.find(card => card.card_code === code);
}

export default LEVEL_CARDS;
