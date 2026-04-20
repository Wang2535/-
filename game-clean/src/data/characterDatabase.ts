/**
 * 《道高一丈：数字博弈》v17.0 - 角色数据库（完整版）
 * 
 * 角色列表（共9个）：
 * 猜拳系(RPS)：AR01, AR02, AR03 (进攻方) | DR01, DR02, DR03 (防御方)
 * 骰子系(Chance)：AC01, AC02, AC03 (进攻方) | DC01, DC02, DC03 (防御方)
 * 专属系(Special)：AS01, AS02, AS03 (进攻方) | DS01, DS02, DS03 (防御方)
 */

import type { CharacterDefinition, CharacterId } from '@/types/characterRules';

// ============================================
// 进攻方角色
// ============================================

/**
 * AR01 博弈大师·赛博赌徒
 */
const AR01: CharacterDefinition = {
  id: 'AR01',
  name: { chinese: '博弈大师·赛博赌徒', english: 'Cyber Gambler' },
  type: 'RPS',
  faction: 'attacker',
  role: '猜拳特化/资源博弈',
  difficulty: 3,
  backstory: '在数字世界的地下赌场中，有一位传说中的赌徒，他从不依赖运气，而是精通博弈论与心理战术。据说他能通过对手微秒级的反应延迟判断其选择，在石头剪刀布的对决中从未败北。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20, specialNote: '初始+2（赌徒本金）' },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AR01_S1',
      name: '赌徒直觉',
      type: 'passive',
      trigger: { 
        description: '每回合第一次进行猜拳判定时', 
        requiresCost: false, 
        hasCooldown: true,
        cooldownTurns: 3,
      },
      effect: { 
        description: '查看对方1张手牌，然后选择是否消耗资源。若消耗资源且胜利，额外+2渗透；若不消耗，可强制对方必须消耗',
        specialMechanics: ['查看手牌', '强制消耗'],
      },
    },
    skill2: {
      id: 'AR01_S2',
      name: '双倍下注',
      type: 'active',
      trigger: { 
        description: '猜拳判定前主动激活', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { any: 2 },
      effect: { 
        description: '胜利时效果翻倍；平局返还1点资源并获得1点算力；失败额外损失1点渗透但获得1张手牌',
        values: { winMultiplier: 2, drawRefund: 1, loseDraw: 1 },
      },
    },
    skill3: {
      id: 'AR01_S3',
      name: '心理操控',
      type: 'ultimate',
      trigger: { 
        description: '渗透等级≥30，处于猜拳判定阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
        maxUsesPerGame: 2,
      },
      resourceCost: { permission: 3 },
      effect: { 
        description: '指定对方的猜拳选择，对方必须按指定选择。若对方消耗资源，你必定胜利；若不消耗，获得2点渗透+1点权限',
        values: { infiltrationBonus: 2, permissionBonus: 1 },
      },
      strategicValue: '在渗透等级达到关键节点时使用，确保猜拳胜利或迫使对方放弃抵抗',
    },
  },
  specialMechanics: [
    {
      name: '赌徒本能',
      description: '连续2次猜拳胜利后，第3次胜利效果+1；连续2次失败后可跳过本次猜拳',
      trigger: '猜拳结果结算后',
      effect: '第3次胜利额外+1效果 / 跳过猜拳',
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖猜拳的防守方角色', '资源充裕的中后期对局'],
    disadvantageMatchups: ['不依赖猜拳的骰子系角色', '资源匮乏的开局阶段'],
    recommendedStrategy: [
      '前期利用"赌徒直觉"获取信息优势',
      '中期使用"双倍下注"扩大战果',
      '后期用"心理操控"锁定胜局',
    ],
  },
};

/**
 * AR02 心理分析师·读心者
 */
const AR02: CharacterDefinition = {
  id: 'AR02',
  name: { chinese: '心理分析师·读心者', english: 'Mind Reader' },
  type: 'RPS',
  faction: 'attacker',
  role: '信息掌控/预判强化',
  difficulty: 4,
  backstory: '她曾是国家安全部门的首席心理分析师，专门研究网络攻击者的心理模式。通过分析成千上万次攻防对决，她总结出了一套独特的"读心术"。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10, specialNote: '初始+1（分析师情报）' },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AR02_S1',
      name: '行为分析',
      type: 'passive',
      trigger: { 
        description: '对方进行任意判定后', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '记录对方选择偏好（最近3次），第4次可预测。预测正确+2效果，错误获得1点信息',
        specialMechanics: ['行为记录', '预测奖励'],
      },
    },
    skill2: {
      id: 'AR02_S2',
      name: '预判反制',
      type: 'active',
      trigger: { 
        description: '猜拳判定前', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 1,
      },
      resourceCost: { information: 1 },
      effect: { 
        description: '声明胜利/平局/失败。声明胜利且实际胜利：效果×1.5；声明平局且实际平局：双方各获得1点资源；声明失败且实际失败：只承受50%负面效果',
        specialMechanics: ['结果声明', '效果调整'],
      },
    },
    skill3: {
      id: 'AR02_S3',
      name: '心理压制',
      type: 'ultimate',
      trigger: { 
        description: '已连续正确预测对方选择2次', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { permission: 2 },
      effect: { 
        description: '强制改变对方的猜拳选择，对方亮出后可改为其他两种之一。若因此获胜，额外获得3点渗透+1点权限',
        values: { infiltrationBonus: 3, permissionBonus: 1 },
      },
      strategicValue: '不仅是机制上的压制，更是心理上的打击，使对手意识到行为模式已被完全掌握',
    },
  },
  specialMechanics: [
    {
      name: '模式识别',
      description: '可随时查看已记录的对方行为模式表，每记录满3次行为获得1点信息奖励',
      trigger: '记录满3次行为',
      effect: '获得1点信息',
    },
  ],
  usageTips: {
    advantageMatchups: ['有固定行为模式的对手', '长局（12回合）'],
    disadvantageMatchups: ['完全随机出牌的对手', '短局（6-8回合）'],
    recommendedStrategy: [
      '前期专注记录，不要急于预测',
      '中期利用数据分析获得优势',
      '后期用"心理压制"一击制胜',
    ],
  },
};

/**
 * AR03 欺诈专家·千面客
 */
const AR03: CharacterDefinition = {
  id: 'AR03',
  name: { chinese: '欺诈专家·千面客', english: 'Master of Deception' },
  type: 'RPS',
  faction: 'attacker',
  role: '欺骗/伪装/反制',
  difficulty: 5,
  backstory: '没有人知道他的真实身份。在暗网中，他有上千个身份，每一个都栩栩如生。他精通社会工程学，能够在不知不觉中操控他人的决策。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20, specialNote: '上限+3（欺诈资本）' },
    information: { initial: 2, max: 10, specialNote: '初始-1（隐藏身份代价）' },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AR03_S1',
      name: '虚假信号',
      type: 'passive',
      trigger: { 
        description: '每回合开始时', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '设置一个虚假信号（假装偏好石头/剪刀/布）。对方若根据信号选择，你获得1点信息+1点资金，本次猜拳平局视为胜利',
        specialMechanics: ['虚假信号', '欺骗奖励'],
      },
      restrictions: ['每回合只能设置1个虚假信号', '连续3回合相同信号将失效'],
    },
    skill2: {
      id: 'AR03_S2',
      name: '身份切换',
      type: 'active',
      trigger: { 
        description: '任意时刻', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
      },
      resourceCost: { funds: 2 },
      effect: { 
        description: '重置所有已记录的行为数据，对方心理分析师类技能暂时失效1回合，获得1点渗透+1点权限，本回合猜拳无法被预测或操控',
        values: { infiltrationBonus: 1, permissionBonus: 1 },
        specialMechanics: ['清除记录', '技能封锁'],
      },
    },
    skill3: {
      id: 'AR03_S3',
      name: '终极欺诈',
      type: 'ultimate',
      trigger: { 
        description: '资金≥10，处于猜拳判定阶段', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { funds: 5 },
      effect: { 
        description: '同时选择两种猜拳选项，亮牌时根据对方选择决定使用哪一种，总能选择克制对方的选项。胜利时额外获得5点渗透+2点权限',
        values: { infiltrationBonus: 5, permissionBonus: 2 },
        specialMechanics: ['双选机制', '必克对手'],
      },
      restrictions: ['使用后本回合无法获得资金'],
    },
  },
  specialMechanics: [
    {
      name: '千面',
      description: '每成功欺骗对手获得1层千面标记。3层：可额外设置1个虚假信号；5层：本回合猜拳胜利效果×2',
      trigger: '成功欺骗对手',
      effect: '千面标记层数增加',
      counters: {
        name: '千面标记',
        maxStacks: 5,
        effectsPerStack: {
          3: '可额外设置1个虚假信号',
          5: '本回合猜拳胜利效果×2',
        },
      },
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖数据分析的角色（如读心者）', '资金充裕的对局'],
    disadvantageMatchups: ['不理会信号的对手', '资金匮乏的开局阶段'],
    recommendedStrategy: [
      '前期设置虚假信号积累千面标记',
      '中期利用身份切换打破对方节奏',
      '后期用终极欺诈锁定胜局',
    ],
  },
};

/**
 * AC01 命运编织者·概率使
 */
const AC01: CharacterDefinition = {
  id: 'AC01',
  name: { chinese: '命运编织者·概率使', english: 'Probability Weaver' },
  type: 'Chance',
  faction: 'attacker',
  role: '概率操控/骰子特化',
  difficulty: 3,
  backstory: '她是量子计算领域的先驱，能够将概率云坍缩为确定的结果。在她眼中，骰子的每一次投掷都不是随机事件，而是无数平行宇宙的交汇点。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15, specialNote: '初始+1（量子计算能力）' },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AC01_S1',
      name: '概率云',
      type: 'passive',
      trigger: { 
        description: '每次进行骰子判定前', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '预览骰子结果范围（低概率区间1-3/高概率区间4-6）。根据预览选择接受判定（成功额外+1渗透）或重投（支付1点算力，每回合限1次）',
        specialMechanics: ['结果预览', '重投机制'],
      },
    },
    skill2: {
      id: 'AC01_S2',
      name: '量子叠加',
      type: 'active',
      trigger: { 
        description: '骰子判定前', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { computing: 2 },
      effect: { 
        description: '同时投掷2颗骰子，选择使用哪一颗。若结果相同触发"量子纠缠"，自动成功且效果+2',
        specialMechanics: ['双骰选择', '量子纠缠'],
      },
    },
    skill3: {
      id: 'AC01_S3',
      name: '命运编织',
      type: 'ultimate',
      trigger: { 
        description: '算力≥8，处于判定阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 4,
        maxUsesPerGame: 2,
      },
      resourceCost: { permission: 3 },
      effect: { 
        description: '直接指定骰子结果（1-6任选）。指定6触发大成功效果×2；指定1触发大失败但获得2点算力补偿',
        specialMechanics: ['结果指定', '风险补偿'],
      },
      strategicValue: '在关键时刻确保判定成功，或故意触发大失败换取资源补偿',
    },
  },
  specialMechanics: [
    {
      name: '概率坍缩',
      description: '使用量子叠加后，下回合概率云预览更精确（告诉你具体是1-2、3-4还是5-6）。连续3次判定成功后第4次判定难度-1',
      trigger: '使用量子叠加 / 连续3次判定成功',
      effect: '精确预览 / 难度-1',
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖大量判定效果的对局', '算力资源充裕的情况'],
    disadvantageMatchups: ['算力被封锁或消耗殆尽', '对手有反制判定效果的技能'],
    recommendedStrategy: [
      '前期利用概率云优化判定选择',
      '中期使用量子叠加提高成功率',
      '后期用命运编织确保关键判定',
    ],
  },
};

/**
 * AC02 幸运女神·骰子姬
 */
const AC02: CharacterDefinition = {
  id: 'AC02',
  name: { chinese: '幸运女神·骰子姬', english: 'Dice Goddess' },
  type: 'Chance',
  faction: 'attacker',
  role: '幸运加成/大成功特化',
  difficulty: 2,
  backstory: '传说她是幸运之神的化身，走到哪里都会带来好运。在数字博弈的战场上，她的骰子似乎永远都会投出最好的结果。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20, specialNote: '初始+3（幸运之财）' },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AC02_S1',
      name: '幸运光环',
      type: 'passive',
      trigger: { 
        description: '始终生效', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '大成功阈值降低（掷出5或6即触发），大失败阈值提高（仅掷出1且难度≥5时触发）。每次大成功获得1点幸运标记（上限3点）',
        specialMechanics: ['阈值调整', '幸运标记'],
      },
    },
    skill2: {
      id: 'AC02_S2',
      name: '幸运抽取',
      type: 'active',
      trigger: { 
        description: '任意时刻', 
        requiresCost: true, 
        hasCooldown: false,
      },
      resourceCost: { luckyMark: 1 },
      effect: { 
        description: '改变最近一次骰子判定结果±1，重新判定胜负。若因此从失败变为成功额外+2渗透；若从成功变为大成功效果×1.5倍',
        specialMechanics: ['结果调整', '效果加成'],
      },
    },
    skill3: {
      id: 'AC02_S3',
      name: '命运眷顾',
      type: 'ultimate',
      trigger: { 
        description: '拥有3点幸运标记，处于判定阶段', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { luckyMark: 3 },
      effect: { 
        description: '本次判定自动成功且视为大成功。效果结算后获得3点渗透+1点权限+1张手牌，下回合开始时自动获得1点幸运标记',
        values: { infiltrationBonus: 3, permissionBonus: 1, drawCards: 1 },
      },
      strategicValue: '游戏中最稳定的收益技能之一，适合在关键时刻确保胜利',
    },
  },
  specialMechanics: [
    {
      name: '幸运连锁',
      description: '连续2次判定成功后第3次判定难度-1；连续3次判定成功后第4次判定自动成功',
      trigger: '连续判定成功',
      effect: '难度-1 / 自动成功',
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖大量判定的对局', '需要稳定收益的策略'],
    disadvantageMatchups: ['对手有封锁判定效果的技能', '无法积累幸运标记的速攻局'],
    recommendedStrategy: [
      '前期积极进行判定积累幸运标记',
      '中期利用幸运抽取优化关键判定',
      '后期用命运眷顾确保胜利',
    ],
  },
};

/**
 * AC03 风险投资人·博弈者
 */
const AC03: CharacterDefinition = {
  id: 'AC03',
  name: { chinese: '风险投资人·博弈者', english: 'Risk Investor' },
  type: 'Chance',
  faction: 'attacker',
  role: '风险博弈/资源投资',
  difficulty: 4,
  backstory: '他是华尔街最传奇的风险投资人，擅长在不确定性中寻找确定性收益。他的座右铭是："高风险意味着高回报，但前提是你要懂得计算。"',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20, specialNote: '初始+5（投资本金）' },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AC03_S1',
      name: '风险评估',
      type: 'passive',
      trigger: { 
        description: '每次进行骰子判定前', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '选择提高或降低难度±1。提高难度（激进）：成功效果×2，失败损失×1.5；降低难度（保守）：成功效果×0.5，失败损失×0.5；平衡：正常结算',
        specialMechanics: ['风险选择', '收益调整'],
      },
    },
    skill2: {
      id: 'AC03_S2',
      name: '投资组合',
      type: 'active',
      trigger: { 
        description: '判定前', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
      },
      resourceCost: { funds: 3 },
      effect: { 
        description: '同时进行2次独立判定，只要1次成功即视为整体成功。2次都成功效果×2.5倍；2次都失败损失×1.5倍',
        specialMechanics: ['双判定', '风险分散'],
      },
    },
    skill3: {
      id: 'AC03_S3',
      name: '孤注一掷',
      type: 'ultimate',
      trigger: { 
        description: '资金≥15，处于判定阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 5,
        maxUsesPerGame: 1,
      },
      resourceCost: { funds: 10 },
      effect: { 
        description: '消耗10点资金，本次判定难度+2但成功时效果×4倍，且必定触发大成功效果。失败时损失减半',
        values: { difficultyIncrease: 2, successMultiplier: 4 },
        specialMechanics: ['超高风险', '超高回报'],
      },
      strategicValue: '适合在拥有充足资金且需要一击制胜时使用',
    },
  },
  specialMechanics: [
    {
      name: '投资眼光',
      description: '每当资金达到10/20/30时，获得1点额外权限。每次成功的高风险判定（难度+1）额外获得1点资金',
      trigger: '资金达到阈值 / 高风险判定成功',
      effect: '获得权限 / 获得资金',
    },
  ],
  usageTips: {
    advantageMatchups: ['资金充裕的对局', '需要爆发性收益的情况'],
    disadvantageMatchups: ['资金被封锁的对局', '需要稳定收益的情况'],
    recommendedStrategy: [
      '前期保守积累资金',
      '中期根据局势调整风险等级',
      '后期用孤注一掷锁定胜局',
    ],
  },
};

/**
 * AS01 卡组构筑师·牌库掌控者
 */
const AS01: CharacterDefinition = {
  id: 'AS01',
  name: { chinese: '卡组构筑师·牌库掌控者', english: 'Deck Builder' },
  type: 'Special',
  faction: 'attacker',
  role: '卡组优化/抽卡控制',
  difficulty: 4,
  backstory: '她是数字世界中最出色的卡组构筑师，能够将任何卡牌组合成致命的武器。她深知牌库的秘密，每一张卡牌的位置都在她的掌控之中。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10, specialNote: '初始+3（卡组知识）' },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AS01_S1',
      name: '卡组优化',
      type: 'passive',
      trigger: { 
        description: '每次抽卡时', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '从牌库顶3张卡牌中选择1张加入手牌，其余放入牌库底。若手牌中有3张或以上同类型卡牌，该类型卡牌效果+1',
        specialMechanics: ['选择性抽卡', '同类型加成'],
      },
    },
    skill2: {
      id: 'AS01_S2',
      name: '精准检索',
      type: 'active',
      trigger: { 
        description: '任意时刻', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
      },
      resourceCost: { information: 2 },
      effect: { 
        description: '从牌库中检索1张指定类型的卡牌加入手牌（侦查/漏洞/权限）。若检索到T2+卡牌，额外获得1点信息',
        specialMechanics: ['定向检索', '高等级奖励'],
      },
    },
    skill3: {
      id: 'AS01_S3',
      name: '完美洗牌',
      type: 'ultimate',
      trigger: { 
        description: '手牌≥5张，处于行动阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 4,
        maxUsesPerGame: 2,
      },
      resourceCost: { permission: 2, information: 2 },
      effect: { 
        description: '弃置所有手牌，从牌库中抽取等量的卡牌，且可以查看牌库顶5张卡牌并调整顺序。本回合打出的所有卡牌效果×1.5倍',
        values: { effectMultiplier: 1.5 },
        specialMechanics: ['手牌重置', '牌库控制', '效果加成'],
      },
      strategicValue: '在手牌质量不佳或需要爆发时使用，可以重新组织手牌并获得效果加成',
    },
  },
  specialMechanics: [
    {
      name: '构筑大师',
      description: '每使用3张同类型卡牌，获得1点该类型精通（上限3点）。精通效果：该类型卡牌消耗-1（最低1），效果+1',
      trigger: '使用同类型卡牌累计3张',
      effect: '获得类型精通',
      counters: {
        name: '类型精通',
        maxStacks: 3,
        effectsPerStack: {
          1: '该类型卡牌消耗-1',
          2: '该类型卡牌效果+1',
          3: '该类型卡牌可额外触发1次',
        },
      },
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖特定卡牌的对局', '需要精准控制牌库的情况'],
    disadvantageMatchups: ['牌库被封锁的对局', '快速对局无法发挥构筑优势'],
    recommendedStrategy: [
      '前期利用卡组优化获取优质手牌',
      '中期积累类型精通提升卡牌效率',
      '后期用完美洗牌进行爆发输出',
    ],
  },
};

/**
 * AS02 资源调配师·能量核心
 */
const AS02: CharacterDefinition = {
  id: 'AS02',
  name: { chinese: '资源调配师·能量核心', english: 'Resource Manager' },
  type: 'Special',
  faction: 'attacker',
  role: '资源转换/能量管理',
  difficulty: 3,
  backstory: '他是数字能源领域的专家，精通各种资源的转换与调配。在他的手中，任何资源都能被最大化利用，没有任何浪费。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15, specialNote: '初始+2（能源专长）' },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'AS02_S1',
      name: '能量转换',
      type: 'passive',
      trigger: { 
        description: '任意时刻', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '可以将任意2点资源转换为1点其他类型资源（算力/资金/信息）。转换后的资源可超出上限，但超出部分在回合结束时消失',
        specialMechanics: ['资源转换', '临时超上限'],
      },
    },
    skill2: {
      id: 'AS02_S2',
      name: '资源调配',
      type: 'active',
      trigger: { 
        description: '任意时刻', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { any: 2 },
      effect: { 
        description: '选择一种资源类型，本回合内该资源获取量×2，消耗量-1（最低1）。若选择算力，额外获得1点渗透',
        specialMechanics: ['资源增益', '消耗减免'],
      },
    },
    skill3: {
      id: 'AS02_S3',
      name: '能量爆发',
      type: 'ultimate',
      trigger: { 
        description: '总资源≥20，处于行动阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 5,
        maxUsesPerGame: 1,
      },
      resourceCost: { computing: 5, funds: 5, information: 5 },
      effect: { 
        description: '消耗所有资源（保留1点），每消耗3点资源获得2点渗透。本回合所有卡牌效果×2倍，且不消耗行动点',
        values: { infiltrationPer3Resources: 2, effectMultiplier: 2 },
        specialMechanics: ['资源换渗透', '效果翻倍', '免行动点'],
      },
      strategicValue: '适合在资源充裕且需要一击制胜时使用，可以将资源全部转化为渗透',
    },
  },
  specialMechanics: [
    {
      name: '能量回收',
      description: '每当卡牌效果被抵消或无效时，返还50%消耗的资源（向上取整）。每回合最多触发2次',
      trigger: '卡牌效果被抵消/无效',
      effect: '返还50%资源消耗',
    },
  ],
  usageTips: {
    advantageMatchups: ['资源充裕的对局', '需要灵活调配资源的情况'],
    disadvantageMatchups: ['资源被封锁的对局', '速攻型对手'],
    recommendedStrategy: [
      '前期利用能量转换优化资源配置',
      '中期根据局势选择资源调配目标',
      '后期用能量爆发进行最终冲刺',
    ],
  },
};

/**
 * AS03 战术指挥官·战场统帅
 */
const AS03: CharacterDefinition = {
  id: 'AS03',
  name: { chinese: '战术指挥官·战场统帅', english: 'Battle Commander' },
  type: 'Special',
  faction: 'attacker',
  role: '区域控制/战术指挥',
  difficulty: 5,
  backstory: '他是数字战场上最出色的指挥官，擅长统筹全局、调配资源、制定战术。在他的指挥下，每一次攻击都精准而致命。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5, specialNote: '初始+2（指挥权限）' },
  },
  skills: {
    skill1: {
      id: 'AS03_S1',
      name: '战术部署',
      type: 'passive',
      trigger: { 
        description: '每回合开始时', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '选择一种战术姿态：进攻（渗透+2，受到的伤害+1）、防御（安全+2，造成的伤害-1）、平衡（渗透+1，安全+1）。可随时切换',
        specialMechanics: ['姿态切换', '属性调整'],
      },
    },
    skill2: {
      id: 'AS03_S2',
      name: '战场指挥',
      type: 'active',
      trigger: { 
        description: '己方回合，处于行动阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
      },
      resourceCost: { permission: 2 },
      effect: { 
        description: '本回合内，己方所有卡牌效果+1，且可以额外打出1张卡牌（不消耗额外行动点）。若控制区域≥2个，效果额外+1',
        specialMechanics: ['团队增益', '额外出牌', '区域加成'],
      },
    },
    skill3: {
      id: 'AS03_S3',
      name: '终极战术',
      type: 'ultimate',
      trigger: { 
        description: '渗透等级≥30，处于行动阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 6,
        maxUsesPerGame: 1,
      },
      resourceCost: { permission: 3, information: 3 },
      effect: { 
        description: '立即获得3个额外行动点，本回合打出的所有卡牌效果×2倍且不可被响应。打出最后一张卡牌时，额外获得5点渗透',
        values: { bonusActions: 3, effectMultiplier: 2, finalCardBonus: 5 },
        specialMechanics: ['额外行动点', '效果翻倍', '不可响应', '终结奖励'],
      },
      strategicValue: '游戏中最强大的爆发技能，可以在一回合内打出大量卡牌并获得巨额收益',
    },
  },
  specialMechanics: [
    {
      name: '区域掌控',
      description: '每控制1个区域，所有资源获取量+1。控制3个或以上区域时，每回合额外获得1点权限',
      trigger: '控制区域数量变化',
      effect: '资源获取+1 / 额外权限',
    },
  ],
  usageTips: {
    advantageMatchups: ['需要区域控制的对局', '中后期对局'],
    disadvantageMatchups: ['速攻型对手', '区域争夺激烈的对局'],
    recommendedStrategy: [
      '前期选择平衡姿态稳定发展',
      '中期积极争夺区域控制权',
      '后期用终极战术进行爆发输出',
    ],
  },
};

// ============================================
// 防御方角色
// ============================================

/**
 * DR01 防御大师·铜墙铁壁
 */
const DR01: CharacterDefinition = {
  id: 'DR01',
  name: { chinese: '防御大师·铜墙铁壁', english: 'Iron Wall Defender' },
  type: 'RPS',
  faction: 'defender',
  role: '防御特化/资源保护',
  difficulty: 3,
  backstory: '他是网络安全领域最坚固的盾牌，曾经抵御过无数次国家级网络攻击。他的防御体系如同铜墙铁壁，让攻击者望而却步。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15, specialNote: '初始+1（防御专长）' },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5, specialNote: '初始+1（管理权限）' },
  },
  skills: {
    skill1: {
      id: 'DR01_S1',
      name: '坚固防线',
      type: 'passive',
      trigger: { 
        description: '受到攻击时', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '受到的渗透伤害-1（最少为1）。若猜拳判定胜利，额外获得1点安全',
        values: { damageReduction: 1, safetyBonus: 1 },
      },
    },
    skill2: {
      id: 'DR01_S2',
      name: '紧急加固',
      type: 'active',
      trigger: { 
        description: '任意时刻', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { computing: 2 },
      effect: { 
        description: '立即获得3点安全，下回合受到的所有伤害-2',
        values: { immediateSafety: 3, nextTurnReduction: 2 },
      },
    },
    skill3: {
      id: 'DR01_S3',
      name: '绝对防御',
      type: 'ultimate',
      trigger: { 
        description: '安全等级≥30，受到攻击时', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 4,
        maxUsesPerGame: 2,
      },
      resourceCost: { permission: 3 },
      effect: { 
        description: '完全免疫本次攻击，并反弹50%伤害给攻击者（向上取整）。获得2点权限',
        values: { damageReflection: 0.5, permissionBonus: 2 },
        specialMechanics: ['完全免疫', '伤害反弹'],
      },
    },
  },
  specialMechanics: [
    {
      name: '防御姿态',
      description: '每回合未受到攻击时，下回合初始安全+1。连续3回合未受攻击，获得1点权限',
      trigger: '回合结束未受攻击',
      effect: '下回合安全+1 / 获得权限',
    },
  ],
  usageTips: {
    advantageMatchups: ['速攻型进攻方', '资源消耗型对局'],
    disadvantageMatchups: ['持续输出型进攻方', '控制型对局'],
    recommendedStrategy: [
      '前期建立防御优势',
      '中期利用紧急加固应对爆发',
      '后期用绝对防御反击',
    ],
  },
};

/**
 * DR02 反制专家·镜像反击
 */
const DR02: CharacterDefinition = {
  id: 'DR02',
  name: { chinese: '反制专家·镜像反击', english: 'Counter Specialist' },
  type: 'RPS',
  faction: 'defender',
  role: '反击特化/镜像复制',
  difficulty: 4,
  backstory: '她擅长将攻击者的手段化为己用。每一次攻击都是她学习的机会，每一次失败都是她反击的铺垫。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10, specialNote: '初始+2（反制情报）' },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'DR02_S1',
      name: '镜像复制',
      type: 'passive',
      trigger: { 
        description: '对方打出卡牌后', 
        requiresCost: false, 
        hasCooldown: true,
        cooldownTurns: 2,
      },
      effect: { 
        description: '可以复制对方上一张打出的卡牌效果（不消耗该卡牌），但效果减半（向上取整）',
        specialMechanics: ['效果复制', '效果减半'],
      },
    },
    skill2: {
      id: 'DR02_S2',
      name: '反击准备',
      type: 'active',
      trigger: { 
        description: '任意时刻', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
      },
      resourceCost: { information: 2 },
      effect: { 
        description: '下回合对方第一次攻击时，立即进行一次反击（安全+2，对方渗透-2）。若猜拳判定胜利，反击效果翻倍',
        values: { counterSafety: 2, counterInfiltration: -2 },
        specialMechanics: ['预备反击', '效果翻倍'],
      },
    },
    skill3: {
      id: 'DR02_S3',
      name: '完全反射',
      type: 'ultimate',
      trigger: { 
        description: '信息≥8，对方攻击时', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 5,
        maxUsesPerGame: 1,
      },
      resourceCost: { permission: 3, information: 3 },
      effect: { 
        description: '将对方的攻击完全反射，对方承受原本应施加给你的所有效果。你获得3点安全+2点权限',
        values: { safetyBonus: 3, permissionBonus: 2 },
        specialMechanics: ['完全反射', '效果转移'],
      },
    },
  },
  specialMechanics: [
    {
      name: '学习进化',
      description: '每受到3次攻击，获得1点永久判定修正（上限+3）。每复制1张卡牌，该卡牌效果+10%（上限+50%）',
      trigger: '受到3次攻击 / 复制卡牌',
      effect: '判定修正+1 / 复制效果+10%',
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖特定卡牌的进攻方', '效果强力的对局'],
    disadvantageMatchups: ['多样化进攻方', '快速对局'],
    recommendedStrategy: [
      '前期观察对方卡牌套路',
      '中期利用镜像复制获得优势',
      '后期用完全反射终结对局',
    ],
  },
};

/**
 * DR03 预判大师·先知守卫
 */
const DR03: CharacterDefinition = {
  id: 'DR03',
  name: { chinese: '预判大师·先知守卫', english: 'Prophet Guard' },
  type: 'RPS',
  faction: 'defender',
  role: '预判特化/提前防御',
  difficulty: 5,
  backstory: '他拥有惊人的预判能力，仿佛能够看穿未来。在攻击发生之前，他就已经做好了万全的准备。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'DR03_S1',
      name: '危险预感',
      type: 'passive',
      trigger: { 
        description: '对方回合开始时', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '预览对方本回合可能打出的1张卡牌（从手牌中随机展示1张）。若该卡牌被打出，你获得1点安全',
        specialMechanics: ['卡牌预览', '预判奖励'],
      },
    },
    skill2: {
      id: 'DR03_S2',
      name: '提前布防',
      type: 'active',
      trigger: { 
        description: '对方回合开始前', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { computing: 1, information: 1 },
      effect: { 
        description: '指定一种攻击类型（侦查/漏洞/权限），本回合内该类型攻击对你无效，且你获得2点安全',
        values: { safetyBonus: 2 },
        specialMechanics: ['类型免疫', '预判防御'],
      },
    },
    skill3: {
      id: 'DR03_S3',
      name: '时间静止',
      type: 'ultimate',
      trigger: { 
        description: '安全等级≥40，对方发动攻击时', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { permission: 4 },
      effect: { 
        description: '暂停对方本回合所有行动，你立即获得一个额外回合。额外回合中你获得+2行动点，所有判定难度-1',
        values: { bonusActions: 2, difficultyReduction: 1 },
        specialMechanics: ['时间暂停', '额外回合'],
      },
    },
  },
  specialMechanics: [
    {
      name: '预知未来',
      description: '每正确预判1次对方行动，获得1层预知标记。3层：下回合预览2张卡牌；5层：可改变对方1张卡牌的目标',
      trigger: '正确预判',
      effect: '预知标记层数增加',
      counters: {
        name: '预知标记',
        maxStacks: 5,
        effectsPerStack: {
          3: '下回合预览2张卡牌',
          5: '可改变对方1张卡牌的目标',
        },
      },
    },
  ],
  usageTips: {
    advantageMatchups: ['套路固定的进攻方', '慢速对局'],
    disadvantageMatchups: ['随机性强的进攻方', '快速对局'],
    recommendedStrategy: [
      '前期积累预知标记',
      '中期利用提前布防化解关键攻击',
      '后期用时间静止逆转局势',
    ],
  },
};

// ============================================
// 防御方 - 骰子系角色
// ============================================

/**
 * DC01 概率守护者·安全织网者
 * 对应AC01命运编织者，专注于骰子判定防御
 */
const DC01: CharacterDefinition = {
  id: 'DC01',
  name: { chinese: '概率守护者·安全织网者', english: 'Safety Weaver' },
  type: 'Chance',
  faction: 'defender',
  role: '概率操控/骰子防御',
  difficulty: 3,
  backstory: '她是网络安全领域的概率论专家，能够通过精确计算将不确定性转化为确定性防御。在她的防护下，系统的安全性如同编织的网，每一个节点都经过精密计算。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15, specialNote: '初始+1（量子防御）' },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'DC01_S1',
      name: '安全预判',
      type: 'passive',
      trigger: { 
        description: '每次进行骰子判定前', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '预览骰子结果范围（1-3或4-6）。若接受判定且成功，额外+1安全；若重投，支付1点算力',
        specialMechanics: ['结果预览', '重投机制'],
      },
    },
    skill2: {
      id: 'DC01_S2',
      name: '双重防御',
      type: 'active',
      trigger: { 
        description: '骰子判定前主动激活', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { computing: 2 },
      effect: { 
        description: '同时投掷2颗骰子，选择使用哪一颗。若结果相同触发"防御共振"，自动成功且效果+2',
        specialMechanics: ['双骰选择', '防御共振'],
      },
    },
    skill3: {
      id: 'DC01_S3',
      name: '安全编织',
      type: 'ultimate',
      trigger: { 
        description: '算力≥8，处于判定阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 4,
        maxUsesPerGame: 2,
      },
      resourceCost: { permission: 3 },
      effect: { 
        description: '直接指定骰子结果（1-6）。指定6触发大成功效果×2；指定1触发大失败但获得2点算力补偿',
        values: { safetyBonus: 3 },
      },
      strategicValue: '在关键时刻确保防御判定成功',
    },
  },
  specialMechanics: [
    {
      name: '防御坍缩',
      description: '使用双重防御后，下回合安全预判更加精确（1-2/3-4/5-6）',
      trigger: '双重防御使用后',
      effect: '预览精度提升',
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖判定的进攻方', '算力充裕的情况'],
    disadvantageMatchups: ['算力被封锁', '不依赖判定的对手'],
    recommendedStrategy: [
      '前期利用安全预判优化判定',
      '中期使用双重防御提高成功率',
      '后期用安全编织确保关键防御',
    ],
  },
};

/**
 * DC02 幸运守卫·安全女神
 * 对应AC02幸运女神，专注于大成功防御
 */
const DC02: CharacterDefinition = {
  id: 'DC02',
  name: { chinese: '幸运守卫·安全女神', english: 'Safety Goddess' },
  type: 'Chance',
  faction: 'defender',
  role: '幸运加成/大成功防御',
  difficulty: 2,
  backstory: '她是安全防护的化身，仿佛受到命运的眷顾。在她的守护下，系统的防御总是能在关键时刻发挥最大效果。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20, specialNote: '初始+3（幸运之财）' },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'DC02_S1',
      name: '守护光环',
      type: 'passive',
      trigger: { 
        description: '始终生效', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '大成功阈值降低（掷出5或6即触发）；大失败阈值提高（仅掷出1且难度≥5触发）。每次大成功获得1点守护标记（上限3点）',
        specialMechanics: ['大成功阈值降低', '守护标记'],
      },
    },
    skill2: {
      id: 'DC02_S2',
      name: '幸运防御',
      type: 'active',
      trigger: { 
        description: '任意时刻，消耗1点守护标记', 
        requiresCost: true, 
        hasCooldown: false,
      },
      resourceCost: { special: '守护标记1点' },
      effect: { 
        description: '改变最近一次骰子结果±1。若因此成功，额外+2安全；若因此大成功，效果×1.5倍',
        values: { safetyBonus: 2 },
      },
    },
    skill3: {
      id: 'DC02_S3',
      name: '命运守护',
      type: 'ultimate',
      trigger: { 
        description: '拥有3点守护标记，处于判定阶段', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { special: '全部3点守护标记' },
      effect: { 
        description: '本次判定自动成功且视为大成功。获得3点安全+1点权限+1张手牌，下回合开始时获得1点守护标记',
        values: { safetyBonus: 3, permissionBonus: 1 },
      },
      strategicValue: '最稳定的防御技能，适合关键时刻',
    },
  },
  specialMechanics: [
    {
      name: '守护连锁',
      description: '连续2次判定成功，第3次难度-1；连续3次成功，第4次自动成功',
      trigger: '判定成功后',
      effect: '连锁奖励',
    },
  ],
  usageTips: {
    advantageMatchups: ['依赖判定的进攻方', '需要稳定收益的策略'],
    disadvantageMatchups: ['封锁判定效果的对手', '速攻局'],
    recommendedStrategy: [
      '前期积极判定积累守护标记',
      '中期利用幸运防御优化关键判定',
      '后期用命运守护确保胜利',
    ],
  },
};

/**
 * DC03 风险对冲师·安全投资者
 * 对应AC03风险投资人，专注于风险防御管理
 */
const DC03: CharacterDefinition = {
  id: 'DC03',
  name: { chinese: '风险对冲师·安全投资者', english: 'Safety Investor' },
  type: 'Chance',
  faction: 'defender',
  role: '风险对冲/资源防御',
  difficulty: 4,
  backstory: '他是金融安全领域的专家，擅长通过风险对冲策略保护资产。在数字博弈中，他将这种理念应用于防御，以最小的风险获得最大的安全收益。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20, specialNote: '初始+5（防御本金）' },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'DC03_S1',
      name: '风险对冲',
      type: 'passive',
      trigger: { 
        description: '每次进行骰子判定前', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '可选择调整难度±1。提高难度：成功效果×2，失败损失×1.5；降低难度：成功效果×0.5，失败损失×0.5',
        specialMechanics: ['风险调整', '收益/损失修正'],
      },
    },
    skill2: {
      id: 'DC03_S2',
      name: '防御组合',
      type: 'active',
      trigger: { 
        description: '判定前，支付3点资金', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
      },
      resourceCost: { funds: 3 },
      effect: { 
        description: '同时进行2次独立判定，1次成功即整体成功。2次都成功效果×2.5倍；都失败损失×1.5倍',
        specialMechanics: ['双判定', '分散风险'],
      },
    },
    skill3: {
      id: 'DC03_S3',
      name: '防御杠杆',
      type: 'ultimate',
      trigger: { 
        description: '资金≥15，处于判定阶段', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { funds: 8 },
      effect: { 
        description: '使用3颗骰子取最高值。成功效果×3倍且返还4点资金；失败损失×2倍且下回合资金恢复-2',
        values: { safetyBonus: 5 },
      },
      strategicValue: '最激进的防御技能，适合资金充裕时',
    },
  },
  specialMechanics: [
    {
      name: '防御复利',
      description: '成功完成激进判定获得投资标记，3层标记时资金上限+2，5层标记时1:1转换资源',
      trigger: '激进判定成功',
      effect: '投资标记累积',
    },
  ],
  usageTips: {
    advantageMatchups: ['资金充裕的中后期', '需要快速拉开差距'],
    disadvantageMatchups: ['资金被封锁', '降低成功率的对手'],
    recommendedStrategy: [
      '前期利用风险对冲稳健积累',
      '中期使用防御组合分散风险',
      '后期用防御杠杆一举定胜负',
    ],
  },
};

// ============================================
// 防御方 - 专属系角色
// ============================================

/**
 * DS01 防御构筑师·壁垒掌控者
 * 对应AS01卡组构筑师，专注于防御卡牌操控
 */
const DS01: CharacterDefinition = {
  id: 'DS01',
  name: { chinese: '防御构筑师·壁垒掌控者', english: 'Barrier Builder' },
  type: 'Special',
  faction: 'defender',
  role: '防御卡牌特化/牌库操控',
  difficulty: 4,
  backstory: '他是网络安全架构的顶尖专家，能够构建出几乎完美的防御体系。每一张防御卡牌在他手中都能发挥最大效用，构筑起坚不可摧的数字壁垒。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5 },
    handLimit: { initial: 6, max: 8, specialNote: '上限+2（壁垒储备）' },
  },
  skills: {
    skill1: {
      id: 'DS01_S1',
      name: '精准防御',
      type: 'passive',
      trigger: { 
        description: '每回合抽牌阶段', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '从牌库检索1张特定类型防御卡牌（检测/防御/纵深），不能连续2回合检索同类型',
        specialMechanics: ['精准检索', '类型限制'],
      },
    },
    skill2: {
      id: 'DS01_S2',
      name: '卡牌重构',
      type: 'active',
      trigger: { 
        description: '任意时刻，支付1点任意资源', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 1,
      },
      resourceCost: { any: 1 },
      effect: { 
        description: '将手牌中2张卡牌放回牌库底部，抽取2张新牌。同类型放回必出1张该类型；不同类型必出不同类型',
        specialMechanics: ['卡牌调和', '类型匹配'],
      },
    },
    skill3: {
      id: 'DS01_S3',
      name: '完美构筑',
      type: 'ultimate',
      trigger: { 
        description: '手牌数≥6，处于出牌阶段', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 3,
        maxUsesPerGame: 2,
      },
      resourceCost: { permission: 2 },
      effect: { 
        description: '展示手牌并重新排序，额外使用2张卡牌，效果×1.5倍，手牌上限临时+2',
        values: { cardBonus: 2 },
      },
      strategicValue: '关键时刻打出防御组合拳',
    },
  },
  specialMechanics: [
    {
      name: '牌库掌控',
      description: '随时查看牌库顶部3张，使用卡牌重构后可重新排列顺序',
      trigger: '持续生效',
      effect: '牌库可视化',
    },
  ],
  usageTips: {
    advantageMatchups: ['需要特定防御卡牌', '长局对局'],
    disadvantageMatchups: ['手牌被封锁', '速攻局'],
    recommendedStrategy: [
      '前期利用精准防御获取关键卡牌',
      '中期使用卡牌重构优化手牌',
      '后期用完美构筑打出防御爆发',
    ],
  },
};

/**
 * DS02 资源守护者·能量护盾
 * 对应AS02资源调配师，专注于防御资源管理
 */
const DS02: CharacterDefinition = {
  id: 'DS02',
  name: { chinese: '资源守护者·能量护盾', english: 'Energy Shield' },
  type: 'Special',
  faction: 'defender',
  role: '防御资源特化/能量转换',
  difficulty: 3,
  backstory: '她是能源防御系统的首席设计师，能够将任何资源转化为防御能量。在她的调配下，防御资源如同流动的护盾，随时保护着系统的安全。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15, specialNote: '上限+3（能量储备）' },
    funds: { initial: 5, max: 20, specialNote: '上限+3（资本储备）' },
    information: { initial: 2, max: 10, specialNote: '上限+2（情报储备）' },
    permission: { initial: 0, max: 5 },
  },
  skills: {
    skill1: {
      id: 'DS02_S1',
      name: '防御转换',
      type: 'passive',
      trigger: { 
        description: '任意时刻', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '以2:1比例转换资源（算力↔资金↔信息），每回合上限4点资源',
        specialMechanics: ['资源转换', '比例交换'],
      },
    },
    skill2: {
      id: 'DS02_S2',
      name: '能量护盾',
      type: 'active',
      trigger: { 
        description: '任意时刻，支付3点同类型资源', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 2,
      },
      resourceCost: { any: 3 },
      effect: { 
        description: '将3点同类型资源转化为安全等级，比例3资源→2安全，下回合该资源恢复+1',
        values: { safetyBonus: 2 },
      },
    },
    skill3: {
      id: 'DS02_S3',
      name: '能量共鸣',
      type: 'ultimate',
      trigger: { 
        description: '三种资源均≥5点', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 4,
        maxUsesPerGame: 2,
      },
      resourceCost: { computing: 2, funds: 2, information: 2 },
      effect: { 
        description: '触发能量共鸣：安全+5，权限+2，抽2张牌，下回合行动点+1，本回合卡牌消耗-1',
        values: { safetyBonus: 5, permissionBonus: 2, actionPointBonus: 1 },
      },
      strategicValue: '最全面的防御增益技能',
    },
  },
  specialMechanics: [
    {
      name: '能量循环',
      description: '资源转换时获得能量标记，3层标记转换比例1.5:1，5层标记可1:1转换',
      trigger: '资源转换后',
      effect: '能量标记累积',
    },
  ],
  usageTips: {
    advantageMatchups: ['资源丰富的对局', '需要灵活调配'],
    disadvantageMatchups: ['资源被封锁', '单一资源需求'],
    recommendedStrategy: [
      '前期平衡积累各类资源',
      '中期利用能量护盾转化优势',
      '后期用能量共鸣全面压制',
    ],
  },
};

/**
 * DS03 防御指挥官·壁垒统帅
 * 对应AS03战术指挥官，专注于防御区域控制
 */
const DS03: CharacterDefinition = {
  id: 'DS03',
  name: { chinese: '防御指挥官·壁垒统帅', english: 'Barrier Commander' },
  type: 'Special',
  faction: 'defender',
  role: '防御区域控制/战术调度',
  difficulty: 4,
  backstory: '他是网络安全防御部队的最高指挥官，精通防御区域控制的艺术。在他的指挥下，每一个防御节点都能发挥最大效用，构筑起坚不可摧的防线。',
  baseStats: {
    level: { initial: 0, max: 75 },
    computing: { initial: 3, max: 15 },
    funds: { initial: 5, max: 20 },
    information: { initial: 2, max: 10 },
    permission: { initial: 0, max: 5, specialNote: '上限+2（指挥权限）' },
  },
  skills: {
    skill1: {
      id: 'DS03_S1',
      name: '防御部署',
      type: 'passive',
      trigger: { 
        description: '每回合开始时', 
        requiresCost: false, 
        hasCooldown: false,
      },
      effect: { 
        description: '选择一个区域作为"重点防御区"，放置标记时额外放置1个，区域控制效果+50%',
        specialMechanics: ['重点防御', '效果增强'],
      },
    },
    skill2: {
      id: 'DS03_S2',
      name: '兵力固守',
      type: 'active',
      trigger: { 
        description: '任意时刻，支付1点权限', 
        requiresCost: true, 
        hasCooldown: true, 
        cooldownTurns: 1,
      },
      resourceCost: { permission: 1 },
      effect: { 
        description: '将任意区域2个己方标记移动至另一区域。目标区域因此获得控制权时立即触发效果',
        specialMechanics: ['标记移动', '即时触发'],
      },
    },
    skill3: {
      id: 'DS03_S3',
      name: '全面防御',
      type: 'ultimate',
      trigger: { 
        description: '控制≥2个区域，处于行动阶段', 
        requiresCost: true, 
        hasCooldown: false,
        maxUsesPerGame: 1,
      },
      resourceCost: { permission: 3 },
      effect: { 
        description: '同时对所有区域加强防御：未控制区域放置2个标记，已控制区域效果×2。控制≥3个区域时立即获得5点安全+2点权限',
        values: { safetyBonus: 5, permissionBonus: 2 },
      },
      strategicValue: '瞬间改变区域控制格局',
    },
  },
  specialMechanics: [
    {
      name: '防御优势',
      description: '控制Internal区域时效果额外+1，防御方优势区域',
      trigger: '区域控制时',
      effect: 'Internal区域加成',
    },
  ],
  usageTips: {
    advantageMatchups: ['区域争夺激烈', '控制型对局'],
    disadvantageMatchups: ['区域被快速突破', '速攻局'],
    recommendedStrategy: [
      '前期选择重点防御区域',
      '中期利用兵力固守调整布局',
      '后期用全面防御稳固防线',
    ],
  },
};

// ============================================
// 角色数据库导出
// ============================================

export const CHARACTER_DATABASE: Record<CharacterId, CharacterDefinition> = {
  // 进攻方 - 猜拳系
  'AR01': AR01,
  'AR02': AR02,
  'AR03': AR03,
  // 进攻方 - 骰子系
  'AC01': AC01,
  'AC02': AC02,
  'AC03': AC03,
  // 进攻方 - 专属系
  'AS01': AS01,
  'AS02': AS02,
  'AS03': AS03,
  // 防御方 - 猜拳系
  'DR01': DR01,
  'DR02': DR02,
  'DR03': DR03,
  // 防御方 - 骰子系
  'DC01': DC01,
  'DC02': DC02,
  'DC03': DC03,
  // 防御方 - 专属系
  'DS01': DS01,
  'DS02': DS02,
  'DS03': DS03,
};

// 根据ID获取角色
export function getCharacterById(id: CharacterId): CharacterDefinition | undefined {
  return CHARACTER_DATABASE[id];
}

// 获取所有角色
export function getAllCharacters(): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE);
}

// 根据阵营获取角色
export function getCharactersByFaction(faction: 'attacker' | 'defender'): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE).filter(char => char.faction === faction);
}

// 根据类型获取角色
export function getCharactersByType(type: 'RPS' | 'Chance' | 'Special'): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE).filter(char => char.type === type);
}

// 获取初始解锁的角色
export function getInitialCharacters(): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE);
}

// 获取推荐角色（按难度排序）
export function getRecommendedCharacters(difficulty?: 'easy' | 'medium' | 'hard'): CharacterDefinition[] {
  const all = Object.values(CHARACTER_DATABASE);
  
  if (!difficulty) return all;
  
  const difficultyMap = {
    easy: [1, 2],
    medium: [3, 4],
    hard: [5],
  };
  
  return all.filter(char => difficultyMap[difficulty].includes(char.difficulty));
}

export default CHARACTER_DATABASE;
