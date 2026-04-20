import type { Card, Role, VictoryCondition } from '@/types/game';

// 攻击方卡牌
export const attackCards: Card[] = [
  {
    card_code: 'ATTACK_001',
    name: '带宽洪水攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { funds: 2, information: 1 },
    trigger_condition: '以Perimeter或DMZ区域为目标',
    effects: [
      { target: 'defender', mechanic: 'dice_check', detail: '防御方必须立即进行一次难度为6的防御判定' },
      { target: 'defender_power_pool', mechanic: 'instant_damage', detail: '若防御判定失败，其算力池减少3点' },
      { target: 'self', mechanic: 'infiltration_gain', detail: '渗透等级+1' }
    ],
    duration: 0,
    source_event: '大规模网络洪泛攻击'
  },
  {
    card_code: 'ATTACK_002',
    name: '应用层CC攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { information: 1 },
    trigger_condition: '以支持Web服务的区域 (如 DMZ) 为目标',
    effects: [
      { target: 'target_area', mechanic: 'place_token', detail: '在目标区域放置一个CC攻击标记' },
      { target: 'defender_power_pool', mechanic: 'continuous_damage', detail: '持续2回合，每回合开始时使防御方在该区域的算力减少1点' }
    ],
    duration: 2,
    source_event: '僵尸网络(Botnet)'
  },
  {
    card_code: 'ATTACK_003',
    name: 'SYN洪流攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { funds: 1, information: 1 },
    trigger_condition: '以Perimeter区域为目标',
    effects: [
      { target: 'defender', mechanic: 'conditional_cost', detail: '防御方在本次攻击判定中额外支付1点算力才能进行防御' }
    ],
    duration: 0,
    source_event: 'TCP协议漏洞'
  },
  {
    card_code: 'ATTACK_004',
    name: 'DNS放大攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { information: 1, access: 1 },
    trigger_condition: '以Perimeter区域为目标',
    effects: [
      { target: 'defender_power_pool', mechanic: 'instant_damage', detail: '对防御方造成算力损失' },
      { target: 'defender_funds_pool', mechanic: 'instant_damage', detail: '对防御方造成资金损失' }
    ],
    duration: 0,
    source_event: 'DNS反射与放大攻击'
  },
  {
    card_code: 'ATTACK_005',
    name: 'UDP Flood攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { compute: 1, funds: 1 },
    trigger_condition: '以任意区域为目标',
    effects: [
      { target: 'defender', mechanic: 'dice_check', detail: '无视目标区域的类型，直接进行一次攻击穿透判定（基础难度5）' },
      { target: 'defender_power_pool', mechanic: 'instant_damage', detail: '若成功，防御方算力减少2点' }
    ],
    duration: 0,
    source_event: '无连接协议洪泛'
  },
  {
    card_code: 'ATTACK_006',
    name: 'HTTP慢速攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { information: 2 },
    trigger_condition: '以DMZ区域（有Web服务）为目标',
    effects: [
      { target: 'target_area', mechanic: 'place_token', detail: '在目标区域放置一个慢速攻击标记' },
      { target: 'defender', mechanic: 'conditional_cost', detail: '持续3回合，在此期间，防御方在该区域使用任何卡牌的算力消耗增加1点' }
    ],
    duration: 3,
    source_event: '低速耗尽攻击'
  },
  {
    card_code: 'ATTACK_007',
    name: '脉冲式攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { funds: 2 },
    trigger_condition: '在本回合行动宣言阶段已使用过至少一张其他卡牌后',
    effects: [
      { target: 'defender', mechanic: 'dice_check', detail: '本次攻击的判定难度降低2点' },
      { target: 'defender_funds_pool', mechanic: 'instant_damage', detail: '成功时，额外使防御方资金减少1点' }
    ],
    duration: 0,
    source_event: '脉冲波DDoS'
  },
  {
    card_code: 'ATTACK_008',
    name: '链路耗尽攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { funds: 3, information: 1 },
    trigger_condition: '以Perimeter区域为目标',
    effects: [
      { target: 'defender', mechanic: 'next_turn_effect', detail: '防御方的下一回合，其从Perimeter区域自动获取的算力资源减半（向上取整）' }
    ],
    duration: 1,
    source_event: '带宽饱和攻击'
  },
  {
    card_code: 'ATTACK_009',
    name: '混合式攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { funds: 2, information: 2, compute: 1 },
    trigger_condition: '无特定区域限制',
    effects: [
      { target: 'defender', mechanic: 'choice', detail: '攻击方选择两种效果执行：1. 使目标防御方玩家算力减少2点；或 2. 使其资金减少2点' }
    ],
    duration: 0,
    source_event: '复合型DDoS'
  },
  {
    card_code: 'ATTACK_010',
    name: '递归查询攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { information: 2 },
    trigger_condition: '以Perimeter或DMZ区域为目标',
    effects: [
      { target: 'defender', mechanic: 'dice_check', detail: '防御方进行防御判定时，需进行两次连续判定，取较差结果' },
      { target: 'defender_information_pool', mechanic: 'instant_damage', detail: '若失败，其信息资源减少1点' }
    ],
    duration: 0,
    source_event: 'DNS递归查询滥用'
  },
  {
    card_code: 'ATTACK_011',
    name: 'WebSocket洪水',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { information: 3 },
    trigger_condition: '以DMZ区域（需有实时Web服务）为目标',
    effects: [
      { target: 'defender', mechanic: 'conditional_cost', detail: '持续2回合。在此期间，防御方在该区域每打出一张卡牌，需额外支付1点任意资源' }
    ],
    duration: 2,
    source_event: '长连接资源耗尽'
  },
  {
    card_code: 'ATTACK_012',
    name: '地理分布式攻击',
    type: 'DDoS攻击类',
    faction: 'attack',
    cost: { funds: 4 },
    trigger_condition: '无特定区域限制',
    effects: [
      { target: 'defender', mechanic: 'dice_check', detail: '防御方必须同时对所有己方区域进行一次独立的防御判定（难度5）' },
      { target: 'defender_funds_pool', mechanic: 'instant_damage', detail: '任一区域判定失败，则防御方资金减少3点' }
    ],
    duration: 0,
    source_event: '全球僵尸网络协同'
  },
  {
    card_code: 'ATTACK_016',
    name: '鱼叉式钓鱼邮件',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { funds: 1, information: 2 },
    trigger_condition: '指定一名防御方玩家作为目标',
    effects: [
      { target: 'attacker', mechanic: 'dice_check', detail: '攻击方进行一道难度为5的社会工程学判定' },
      { target: 'defender_information_pool', mechanic: 'resource_steal', detail: '若成功，从目标玩家的信息池中窃取2点信息' },
      { target: 'attacker_access_pool', mechanic: 'resource_gain', detail: '若成功，立即获得1点权限（放置于攻击方资源池）' }
    ],
    duration: 0,
    source_event: '针对性的商业邮件钓鱼事件'
  },
  {
    card_code: 'ATTACK_017',
    name: '恶意链接/附件',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { information: 1 },
    trigger_condition: '指定一名防御方玩家',
    effects: [
      { target: 'random_area', mechanic: 'place_token', detail: '在目标玩家的一个随机区域（投骰决定）放置一个持续1回合的"恶意载荷"标记' },
      { target: 'next_attack', mechanic: 'bonus_effect', detail: '下回合攻击方对该区域使用"漏洞利用类"卡牌，其判定难度降低' }
    ],
    duration: 1,
    source_event: '恶意软件分发'
  },
  {
    card_code: 'ATTACK_018',
    name: 'CEO欺诈（商业邮件诈骗）',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { funds: 2 },
    trigger_condition: '指定一名资源最充沛的防御方玩家',
    effects: [
      { target: 'attacker', mechanic: 'dice_check', detail: '攻击方进行一道难度为6的判定' },
      { target: 'defender_funds_pool', mechanic: 'resource_transfer', detail: '若成功，可直接从目标防御方资金池中转移3点资金至攻击方资金池' }
    ],
    duration: 0,
    source_event: '冒充高管诈骗'
  },
  {
    card_code: 'ATTACK_019',
    name: '凭证窃取',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { information: 2, funds: 1 },
    trigger_condition: '以一名手牌数≥3的防御方玩家为目标',
    effects: [
      { target: 'attacker', mechanic: 'dice_check', detail: '攻击方进行一道难度为5的社会工程学判定' },
      { target: 'defender_access_pool', mechanic: 'resource_steal', detail: '若成功，窃取1点权限' },
      { target: 'defender_hand', mechanic: 'reveal', detail: '若成功，可检视目标2张手牌' }
    ],
    duration: 0,
    source_event: '凭据填充攻击'
  },
  {
    card_code: 'ATTACK_020',
    name: '伪造安全警告',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { information: 1 },
    trigger_condition: '以一名本回合已使用过至少1张防御卡牌的防御方玩家为目标',
    effects: [
      { target: 'attacker', mechanic: 'dice_check', detail: '攻击方进行难度5判定' },
      { target: 'defender_hand', mechanic: 'discard', detail: '若成功，弃掉目标1张手牌（由其自选）' }
    ],
    duration: 0,
    source_event: '虚假系统通知'
  },
  {
    card_code: 'ATTACK_021',
    name: '会议邀请钓鱼',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { funds: 1, information: 1 },
    trigger_condition: '无特定目标限制',
    effects: [
      { target: 'attacker', mechanic: 'dice_check', detail: '攻击方可同时指定最多2名防御方玩家作为目标。对每名目标独立进行难度4的判定' },
      { target: 'defender_information_pool', mechanic: 'resource_steal', detail: '任一成功即可窃取其1点信息' }
    ],
    duration: 0,
    source_event: '伪造会议链接'
  },
  {
    card_code: 'ATTACK_022',
    name: '中奖/优惠钓鱼',
    type: '钓鱼攻击类',
    faction: 'attack',
    cost: { funds: 1 },
    trigger_condition: '以资金资源最少的防御方玩家为目标',
    effects: [
      { target: 'attacker', mechanic: 'dice_check', detail: '攻击方进行难度4判定' },
      { target: 'defender', mechanic: 'next_turn_effect', detail: '若成功，使目标下回合自动获得的资金减少1点（最低为0）' }
    ],
    duration: 1,
    source_event: '虚假促销信息'
  },
  {
    card_code: 'ATTACK_031',
    name: '远程代码执行 (RCE)',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 3 },
    trigger_condition: '需指定一个具体区域（Perimeter/DMZ/Internal/ICS）',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '在该目标区域进行一次攻击穿透判定（基础难度7）' },
      { target: 'target_area', mechanic: 'place_token', detail: '若成功，立即在该区域放置一个权限标记（控制权归属于攻击方）' },
      { target: 'target_area_power', mechanic: 'instant_damage', detail: '若成功，使其算力减少1点' }
    ],
    duration: 2,
    source_event: 'Apache Log4j2、永恒之蓝等广泛利用的远程漏洞案例'
  },
  {
    card_code: 'ATTACK_032',
    name: '水坑攻击',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { funds: 2, information: 2 },
    trigger_condition: '只能以Perimeter或DMZ区域为目标',
    effects: [
      { target: 'target_area', mechanic: 'place_token', detail: '结算成功时：无视本回合防御方在该区域部署的"基础被动防御"类卡牌效果' },
      { target: 'attacker_access_pool', mechanic: 'resource_gain', detail: '成功获取1点"权限"' }
    ],
    duration: 0,
    source_event: '水坑攻击'
  },
  {
    card_code: 'ATTACK_033',
    name: 'SQL注入',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 1 },
    trigger_condition: '需指定一个区域，尤其针对有数据库服务的DMZ或Internal',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '本次攻击的"攻击穿透判定"难度降低2点' },
      { target: 'defender', mechanic: 'reveal', detail: '成功后，攻击方可查看防御方与该区域关联的1点随机资源类型' }
    ],
    duration: 0,
    source_event: '数据库漏洞'
  },
  {
    card_code: 'ATTACK_034',
    name: '横向移动',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 2, access: 1 },
    trigger_condition: '攻击方已在某一区域拥有权限标记',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '以相邻的另一个区域为目标，进行一次难度为5的判定' },
      { target: 'target_area', mechanic: 'place_token', detail: '若成功，在该区域也放置一个权限标记' }
    ],
    duration: 2,
    source_event: '内网渗透'
  },
  {
    card_code: 'ATTACK_035',
    name: '提权漏洞利用',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 3 },
    trigger_condition: '以攻击方已拥有权限标记的区域为目标',
    effects: [
      { target: 'target_area', mechanic: 'upgrade_token', detail: '将该区域的1点权限标记升级为一个"高权限标记"（可视作权限x2）' }
    ],
    duration: 2,
    source_event: '权限提升攻击'
  },
  {
    card_code: 'ATTACK_036',
    name: '文件包含漏洞',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 2 },
    trigger_condition: '以DMZ（Web服务）区域为目标',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '可无视路径限制，直接进行一次攻击穿透判定（基础难度6）' },
      { target: 'target_area', mechanic: 'place_token', detail: '成功时，在目标区域放置一个持续1回合的"恶意脚本标记"' },
      { target: 'next_attack', mechanic: 'bonus_effect', detail: '该标记可使下回合对同一区域的钓鱼类攻击成功率提升' }
    ],
    duration: 1,
    source_event: '本地/远程文件包含'
  },
  {
    card_code: 'ATTACK_037',
    name: '缓冲区溢出',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 2, compute: 1 },
    trigger_condition: '无特定区域限制（针对存在内存管理缺陷的系统）',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '进行一次高难度（7）的攻击穿透判定' },
      { target: 'target_area', mechanic: 'place_token', detail: '若成功，不仅放置权限标记' },
      { target: 'target_area_defense', mechanic: 'remove_effect', detail: '还立即清除目标区域1个防御方放置的"入侵检测类"持续效果' }
    ],
    duration: 2,
    source_event: '内存破坏漏洞'
  },
  {
    card_code: 'ATTACK_038',
    name: '命令注入',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 1, funds: 1 },
    trigger_condition: '以接受用户输入的系统区域（如DMZ的Web后台）为目标',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '若本次攻击成功，除了放置权限标记' },
      { target: 'defender', mechanic: 'choice', detail: '攻击方还能立即执行一个额外效果：选择使防御方资金或算力减少1点' }
    ],
    duration: 2,
    source_event: '系统命令注入'
  },
  {
    card_code: 'ATTACK_039',
    name: '零日漏洞爆光',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { funds: 4, information: 2 },
    trigger_condition: '本局游戏中攻击方首次使用"漏洞利用类"卡牌',
    effects: [
      { target: 'target_area', mechanic: 'auto_success', detail: '首次攻击判定自动成功（无视难度），放置2点权限' },
      { target: 'game', mechanic: 'expose', detail: '但使用后，此卡牌效果对所有玩家公开（模拟漏洞被公开）' }
    ],
    duration: 3,
    source_event: '未知漏洞首次利用'
  },
  {
    card_code: 'ATTACK_040',
    name: '跨站脚本',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { information: 1 },
    trigger_condition: '以DMZ区域的Web服务为目标',
    effects: [
      { target: 'target_area', mechanic: 'place_token', detail: '在目标区域放置一个"XSS载荷标记"' },
      { target: 'defender', mechanic: 'ongoing_effect', detail: '持续2回合，期间当防御方玩家从该区域获取信息资源时，有概率（投骰）被攻击方窃取1点信息' }
    ],
    duration: 2,
    source_event: '跨站脚本攻击'
  },
  {
    card_code: 'ATTACK_046',
    name: 'APT持久潜伏',
    type: '高级威胁类',
    faction: 'attack',
    cost: { funds: 4, information: 3, access: 1 },
    trigger_condition: '以一个攻击方已拥有权限标记的区域为目标',
    effects: [
      { target: 'target_area', mechanic: 'upgrade_token', detail: '将该权限标记升级为一个"APT控制标记"' },
      { target: 'defender', mechanic: 'ongoing_effect', detail: '只要该标记存在，每回合开始时，使防御方在该区域的信息减少1点' },
      { target: 'attacker', mechanic: 'ongoing_effect', detail: '且攻击方从该区域每回合稳定窃取1点信息' }
    ],
    duration: -1,
    source_event: '长期潜伏的APT组织攻击模式'
  },
  {
    card_code: 'ATTACK_047',
    name: '供应链投毒',
    type: '高级威胁类',
    faction: 'attack',
    cost: { funds: 3, information: 4 },
    trigger_condition: '无目标区域限制',
    effects: [
      { target: 'defender', mechanic: 'conditional_check', detail: '在防御方下一次系统补丁更新或资源与应急管理类卡牌结算前，必须先通过一次难度为6的判定' },
      { target: 'defender_card', mechanic: 'nullify_effect', detail: '若失败，该卡牌的效果被无效化' },
      { target: 'defender_resources', mechanic: 'instant_damage', detail: '若失败，防御方算力、资金各减1' }
    ],
    duration: 1,
    source_event: 'SolarWinds、CCleaner等软件供应链攻击事件'
  }
];

// 防御方卡牌
export const defenseCards: Card[] = [
  {
    card_code: 'DEF_001',
    name: '防火墙规则部署',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 1, funds: 1 },
    trigger_condition: '指定一个己方区域（Perimeter， DMZ， Internal， ICS）',
    effects: [
      { target: 'target_area', mechanic: 'area_protection', detail: '在本区域持续生效。无效化所有以本区域为目标的、消耗≤2资金的DDoS类攻击卡牌效果' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' }
    ],
    duration: 3,
    source_event: '基础网络边界防护'
  },
  {
    card_code: 'DEF_002',
    name: '下一代防火墙(NGFW)升级',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 2, funds: 3 },
    trigger_condition: '指定一个己方区域',
    effects: [
      { target: 'target_area', mechanic: 'area_protection', detail: '在本区域持续生效。无效化所有以本区域为目标的钓鱼攻击类、以及消耗≤3资金的DDoS类攻击卡牌效果' }
    ],
    duration: 4,
    source_event: '深化边界防护，集成应用层识别'
  },
  {
    card_code: 'DEF_003',
    name: 'Web应用防火墙(WAF)部署',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 1, funds: 2 },
    trigger_condition: '指定DMZ区域',
    effects: [
      { target: 'target_area', mechanic: 'difficulty_modifier', detail: '在DMZ区域持续生效。使所有以DMZ区域为目标的"漏洞利用类"卡牌（如SQL注入、XSS）的攻击穿透判定难度提高2点' }
    ],
    duration: 3,
    source_event: '针对Web应用层的专项防护'
  },
  {
    card_code: 'DEF_004',
    name: '系统补丁更新',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 1, funds: 1 },
    trigger_condition: '指定一个己方区域',
    effects: [
      { target: 'target_area_tokens', mechanic: 'token_remove', detail: '立即清除目标区域上一个由"漏洞利用类"卡牌生成的、持续回合数≤2的"权限标记"' },
      { target: 'target_area', mechanic: 'immunity', detail: '若无可清除标记，则本回合内，使目标区域免疫一次"漏洞利用类"卡牌攻击' }
    ],
    duration: 0,
    source_event: '针对已知漏洞的修复'
  },
  {
    card_code: 'DEF_005',
    name: '异常行为检测',
    type: '入侵检测与响应类',
    faction: 'defense',
    cost: { compute: 1 },
    trigger_condition: '响应一次攻击判定前使用',
    effects: [
      { target: 'defender_check', mechanic: 'reroll', detail: '本次防御判定可以重掷一次' }
    ],
    duration: 0,
    source_event: '基于行为的检测，提供修正机会'
  },
  {
    card_code: 'DEF_006',
    name: '全流量威胁分析',
    type: '入侵检测与响应类',
    faction: 'defense',
    cost: { compute: 2, funds: 1 },
    trigger_condition: '本回合内首次响应攻击判定前使用',
    effects: [
      { target: 'defender_checks', mechanic: 'difficulty_modifier', detail: '本回合内，防御方进行的所有防御判定，难度降低2点' }
    ],
    duration: 1,
    source_event: '深度流量分析，提升整体检测率'
  },
  {
    card_code: 'DEF_007',
    name: '蜜罐/蜜点陷阱',
    type: '主动与欺骗防御类',
    faction: 'defense',
    cost: { funds: 3 },
    trigger_condition: '放置于一个己方区域',
    effects: [
      { target: 'attacker', mechanic: 'cost_increase', detail: '当攻击方对该区域发动任何攻击时，必须额外支付1点"信息"' },
      { target: 'defender_information_pool', mechanic: 'resource_gain', detail: '无论攻击成功与否，防御方在攻击结算后获得1点"信息"' }
    ],
    duration: -1,
    source_event: '经典欺骗防御，诱捕攻击者'
  },
  {
    card_code: 'DEF_008',
    name: '流量清洗与扩容',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { funds: 4 },
    trigger_condition: '响应一次DDoS攻击时使用，或主动使用',
    effects: [
      { target: 'attack_effect', mechanic: 'nullify_effect', detail: '无效化本次DDoS攻击的所有效果' },
      { target: 'defender_power_cap', mechanic: 'stat_boost', detail: '主动使用时，防御方算力上限临时提高3点，持续2回合' }
    ],
    duration: 0,
    source_event: '对抗大规模流量攻击的主要手段'
  },
  // 新增防御方卡牌
  {
    card_code: 'DEF_009',
    name: '入侵防御系统(IPS)部署',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 2, funds: 2 },
    trigger_condition: '指定一个己方区域',
    effects: [
      { target: 'target_area', mechanic: 'area_protection', detail: '在本区域持续生效。使所有以本区域为目标的漏洞利用类攻击卡牌判定难度提高1点' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' }
    ],
    duration: 3,
    source_event: '实时入侵检测与防御'
  },
  {
    card_code: 'DEF_010',
    name: '安全信息与事件管理(SIEM)',
    type: '入侵检测与响应类',
    faction: 'defense',
    cost: { compute: 3, funds: 2 },
    trigger_condition: '在清理阶段使用',
    effects: [
      { target: 'all_areas', mechanic: 'token_scan', detail: '扫描所有区域的威胁标记，每发现1个威胁标记，获得1点信息' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' }
    ],
    duration: 0,
    source_event: '集中化安全监控与分析'
  },
  {
    card_code: 'DEF_011',
    name: '网络分段',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 2, funds: 3 },
    trigger_condition: '指定两个相邻区域',
    effects: [
      { target: 'target_areas', mechanic: 'segmentation', detail: '在两个区域之间建立隔离，使攻击方无法直接从一个区域横向移动到另一个区域' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+2' }
    ],
    duration: -1,
    source_event: '网络架构安全加固'
  },
  {
    card_code: 'DEF_012',
    name: '终端防护与响应(EDR)',
    type: '入侵检测与响应类',
    faction: 'defense',
    cost: { compute: 1, funds: 2 },
    trigger_condition: '响应一次钓鱼攻击时使用',
    effects: [
      { target: 'attack_effect', mechanic: 'nullify_effect', detail: '无效化本次钓鱼攻击的所有效果' },
      { target: 'defender', mechanic: 'resource_gain', detail: '获得2点信息' }
    ],
    duration: 0,
    source_event: '终端安全防护'
  },
  {
    card_code: 'DEF_013',
    name: '欺骗防御网络',
    type: '主动与欺骗防御类',
    faction: 'defense',
    cost: { compute: 2, funds: 4 },
    trigger_condition: '放置于Internal区域',
    effects: [
      { target: 'target_area', mechanic: 'deception_network', detail: '当攻击方进入该区域时，触发陷阱，使其本次攻击判定难度+3' },
      { target: 'defender', mechanic: 'resource_gain', detail: '每次触发陷阱时，获得2点算力' }
    ],
    duration: -1,
    source_event: '高级欺骗防御技术'
  },
  {
    card_code: 'DEF_014',
    name: '安全意识培训',
    type: '主动与欺骗防御类',
    faction: 'defense',
    cost: { funds: 2, information: 1 },
    trigger_condition: '在策略与规划阶段使用',
    effects: [
      { target: 'all_defenders', mechanic: 'awareness_buff', detail: '所有防御方玩家本回合对钓鱼攻击的防御判定难度-2' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' }
    ],
    duration: 1,
    source_event: '员工安全意识提升'
  },
  {
    card_code: 'DEF_015',
    name: '灾难恢复计划',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { funds: 5 },
    trigger_condition: '当防御方任一区域被攻击方控制时使用',
    effects: [
      { target: 'all_areas', mechanic: 'emergency_response', detail: '立即清除所有区域的攻击方权限标记' },
      { target: 'defender', mechanic: 'security_change', detail: '安全等级+2' }
    ],
    duration: 0,
    source_event: '业务连续性保障'
  },
  {
    card_code: 'DEF_016',
    name: '安全运营中心(SOC)升级',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { compute: 3, funds: 5 },
    trigger_condition: '在清理阶段使用',
    effects: [
      { target: 'defender', mechanic: 'resource_regen', detail: '每回合自动恢复1点算力和1点资金，持续3回合' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+2' }
    ],
    duration: 3,
    source_event: '安全运营能力提升'
  },
  
  // ==================== v9.0新增防御卡牌 ====================
  
  // 2.1.1 资源恢复类卡牌（3张）
  {
    card_code: 'DEF_017',
    name: '算力资源调度',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { funds: 1 },
    trigger_condition: '在策略与规划阶段使用',
    effects: [
      { target: 'self', mechanic: 'resource_gain', detail: '立即获得2点算力' },
      { target: 'self', mechanic: 'delayed_resource', detail: '下回合开始时额外获得1点算力' }
    ],
    duration: 1,
    source_event: '内部资源重新分配与优化',
    tags: ['sustain']
  },
  {
    card_code: 'DEF_018',
    name: '紧急资金注入',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { compute: 1 },
    trigger_condition: '当防御方资金≤3时使用',
    effects: [
      { target: 'self', mechanic: 'resource_gain', detail: '立即获得3点资金' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' }
    ],
    duration: 0,
    source_event: '紧急财务支援',
    tags: ['burst']
  },
  {
    card_code: 'DEF_019',
    name: '情报共享网络',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { funds: 2 },
    trigger_condition: '在策略与规划阶段使用',
    effects: [
      { target: 'team', mechanic: 'resource_gain', detail: '所有防御方玩家获得1点信息' },
      { target: 'self', mechanic: 'resource_gain', detail: '使用者额外获得1点信息' }
    ],
    duration: 0,
    source_event: '威胁情报共享机制',
    tags: ['combo']
  },
  
  // 2.1.2 持续效果清除类卡牌（3张）
  {
    card_code: 'DEF_020',
    name: '威胁清除协议',
    type: '入侵检测与响应类',
    faction: 'defense',
    cost: { compute: 2, information: 1 },
    trigger_condition: '指定一个己方区域',
    effects: [
      { target: 'target_area', mechanic: 'clear_effects', detail: '清除该区域所有攻击方放置的持续效果标记' },
      { target: 'target_area', mechanic: 'immunity', detail: '本回合内该区域免疫新的持续效果' }
    ],
    duration: 0,
    source_event: '主动威胁清除机制',
    tags: ['burst']
  },
  {
    card_code: 'DEF_021',
    name: '系统隔离与恢复',
    type: '资源与应急管理类',
    faction: 'defense',
    cost: { compute: 3, funds: 2 },
    trigger_condition: '当任一区域被攻击方控制时使用',
    effects: [
      { target: 'target_area', mechanic: 'control_break', detail: '立即解除攻击方对该区域的控制' },
      { target: 'target_area', mechanic: 'clear_tokens', detail: '清除该区域所有攻击方权限标记' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+2' }
    ],
    duration: 0,
    source_event: '紧急隔离与恢复',
    tags: ['burst']
  },
  {
    card_code: 'DEF_022',
    name: '全面杀毒扫描',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 2 },
    trigger_condition: '在清理阶段使用',
    effects: [
      { target: 'all_areas', mechanic: 'scan_reward', detail: '扫描所有区域，每发现1个恶意标记获得1点信息' },
      { target: 'all_areas', mechanic: 'clear_weak', detail: '清除所有持续1回合的恶意标记' }
    ],
    duration: 0,
    source_event: '全面安全扫描',
    tags: ['combo']
  },
  
  // 2.1.3 权限等级保护类卡牌（3张）
  {
    card_code: 'DEF_023',
    name: '安全加固协议',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 1, funds: 1 },
    trigger_condition: '在策略与规划阶段使用',
    effects: [
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' },
      { target: 'self', mechanic: 'security_protection', detail: '下回合安全等级不会下降' }
    ],
    duration: 1,
    source_event: '系统安全加固',
    tags: ['sustain']
  },
  {
    card_code: 'DEF_024',
    name: '权限审查机制',
    type: '入侵检测与响应类',
    faction: 'defense',
    cost: { information: 2 },
    trigger_condition: '响应一次攻击判定前使用',
    effects: [
      { target: 'attacker', mechanic: 'infiltration_block', detail: '本次攻击即使成功，也不会提升攻击方渗透等级' },
      { target: 'self', mechanic: 'resource_gain', detail: '获得1点算力' }
    ],
    duration: 0,
    source_event: '权限访问审查',
    tags: ['trigger']
  },
  {
    card_code: 'DEF_025',
    name: '安全态势感知',
    type: '主动与欺骗防御类',
    faction: 'defense',
    cost: { information: 1, funds: 1 },
    trigger_condition: '在策略与规划阶段使用',
    effects: [
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' },
      { target: 'team', mechanic: 'defense_bonus', detail: '所有防御方玩家本回合防御判定难度-1' }
    ],
    duration: 1,
    source_event: '全局安全态势感知',
    tags: ['aura']
  },
  
  // 2.1.4 区域控制强化类卡牌（3张）
  {
    card_code: 'DEF_026',
    name: '核心区域守卫',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 2, funds: 2 },
    trigger_condition: '指定Internal或ICS区域',
    effects: [
      { target: 'target_area', mechanic: 'control_boost', detail: '该区域控制强度+2（偏向防御方）' },
      { target: 'target_area', mechanic: 'attack_difficulty', detail: '攻击方对该区域的攻击判定难度+1' }
    ],
    duration: 3,
    source_event: '核心资产重点防护',
    tags: ['sustain']
  },
  {
    card_code: 'DEF_027',
    name: '边界强化部署',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 1, funds: 2 },
    trigger_condition: '指定Perimeter区域',
    effects: [
      { target: 'target_area', mechanic: 'control_boost', detail: '该区域控制强度+1（偏向防御方）' },
      { target: 'target_area', mechanic: 'ddos_defense', detail: '所有以该区域为目标的DDoS攻击判定难度+1' }
    ],
    duration: 2,
    source_event: '网络边界强化',
    tags: ['sustain']
  },
  {
    card_code: 'DEF_028',
    name: '区域联防机制',
    type: '主动与欺骗防御类',
    faction: 'defense',
    cost: { compute: 2, information: 1 },
    trigger_condition: '指定两个相邻区域',
    effects: [
      { target: 'target_areas', mechanic: 'joint_defense', detail: '两个区域建立联防，任一区域受攻击时另一区域控制强度+1' },
      { target: 'target_areas', mechanic: 'movement_block', detail: '攻击方无法直接从一个区域横向移动到另一个区域' }
    ],
    duration: 2,
    source_event: '区域协同防御',
    tags: ['combo']
  }
];

// 0day漏洞卡牌
export const zeroDayCards: Card[] = [
  {
    card_code: '0DAY_001',
    name: '零信任边界旁路',
    type: '0day漏洞',
    faction: '0day',
    cost: { information: 2 },
    trigger_condition: '以Perimeter（网络边界）或DMZ（隔离区）中任一区域为目标',
    effects: [
      { target: 'target_area', mechanic: 'dice_check', detail: '成功判定后：立即在该区域放置一个持续3回合的"权限标记"' },
      { target: 'defender_internal_power', mechanic: 'continuous_damage', detail: '使其与Internal（内网）区域的算力连接暂时中断（防御方下回合从Internal区域获得的算力自动获取-1）' }
    ],
    duration: 3,
    source_event: '模拟利用边界设备（如防火墙、VPN）的未知漏洞，绕过零信任策略的初始访问控制'
  },
  {
    card_code: '0DAY_002',
    name: '供应链签名劫持',
    type: '0day漏洞',
    faction: '0day',
    cost: { funds: 3, information: 1 },
    trigger_condition: '以Internal（内网）区域为目标，且本回合防御方未成功使用过任何"资源与应急管理类"卡牌',
    effects: [
      { target: 'target_area', mechanic: 'auto_success', detail: '代替常规判定：无需进行攻击穿透判定，直接在Internal区域放置一个持续2回合的"权限标记"' },
      { target: 'defender_resource_gain', mechanic: 'reduction', detail: '结算后，防御方玩家下一个策略与规划阶段的自动资源获取（算力、资金）减半（向上取整）' }
    ],
    duration: 2,
    source_event: '关联SolarWinds等供应链攻击事件，利用软件更新链的信任漏洞植入后门'
  }
];

// 【v8.0更新】所有卡牌 - 将在文件末尾重新定义

// 角色定义
export const roles: Role[] = [
  {
    name: '渗透专家',
    faction: 'attack',
    ability: '零日预研',
    trigger: '在结算阶段，当玩家使用的一张漏洞利用类卡牌被判定为攻击成功后',
    effect: '1. 本次攻击的原始信息消耗记录值减少1点。2. 本次攻击成功窃取的权限资源，额外增加1点。'
  },
  {
    name: '社工大师',
    faction: 'attack',
    ability: '精准钓饵',
    trigger: '在行动宣言阶段，宣言使用一张钓鱼攻击类卡牌时',
    effect: '玩家在指定攻击目标后，必须立即额外声明一个资源类型（算力/资金/信息/权限之一）。若本次钓鱼攻击最终结算成功，则在执行完卡牌效果后，进行一个50%概率的判定。若判定通过，额外从防御方窃取1点所声明的资源。'
  },
  {
    name: '僵尸网络操控者',
    faction: 'attack',
    ability: '分布式协同',
    trigger: '在行动宣言阶段，宣言使用一张DDoS攻击类卡牌时',
    effect: '若本回合已有其他攻击方玩家使用过DDoS攻击类卡牌，则本次攻击的判定难度降低1点，且成功后造成的资源损失额外增加1点。'
  },
  {
    name: '安全分析师',
    faction: 'defense',
    ability: '威胁溯源',
    trigger: '在行动宣言与响应阶段，当防御方玩家决定响应一张攻击卡牌时',
    effect: '防御方玩家必须立即从自己资源池弃置1点信息。然后，他可以从攻击方宣言玩家的手牌中随机抽取2张牌检视。检视后，可选择其中1张非当前回合宣言的攻击牌，将其置于攻击方牌堆顶。'
  },
  {
    name: '应急响应专家',
    faction: 'defense',
    ability: '快速响应',
    trigger: '在对抗判定与结算阶段，当防御方玩家需要进行防御判定时',
    effect: '每回合限一次，防御方玩家可以弃置1点算力，使本次防御判定的基础值+2。'
  },
  {
    name: '架构加固师',
    faction: 'defense',
    ability: '纵深防御',
    trigger: '在策略与规划阶段',
    effect: '每回合限一次，防御方玩家可以支付1点资金，在本回合内使一个区域的防御效果持续时间延长1回合。'
  }
];

// 胜利条件
export const victoryConditions: VictoryCondition[] = [
  {
    id: 'A1',
    name: '资源枯竭',
    faction: 'attack',
    description: '任一防御方玩家的算力与资金资源总和 ≤ 2',
    check: (gameState) => {
      const defenders = gameState.players.filter(p => p.faction === 'defense');
      return defenders.some(d => d.resources.compute + d.resources.funds <= 2);
    }
  },
  {
    id: 'A2',
    name: '权限主宰',
    faction: 'attack',
    description: '攻击方阵营在同一关键区域（如Internal）拥有的权限总和 ≥ 4，且保持此状态至回合结束',
    check: (gameState) => {
      const internalArea = gameState.areas.Internal;
      const attackAccessTokens = internalArea.tokens.filter(t => 
        t.type === '权限标记' && gameState.players.find(p => p.id === t.owner)?.faction === 'attack'
      );
      return attackAccessTokens.length >= 4;
    }
  },
  {
    id: 'A3',
    name: '攻击链完成',
    faction: 'attack',
    description: '攻击方阵营成功结算一套由4张不同类型攻击卡牌构成的连锁，且最后一张牌在本回合结算',
    check: (gameState) => {
      const currentTurn = gameState.turn;
      const currentTurnAttacks = gameState.attackChain.filter(a => a.turn === currentTurn);
      const uniqueTypes = new Set(currentTurnAttacks.map(a => a.cardType));
      return uniqueTypes.size >= 4;
    }
  },
  {
    id: 'D1',
    name: '威胁清零',
    faction: 'defense',
    description: '防御方阵营成功将版图上所有攻击方放置的持续性威胁标记全部清除，且此时攻击方无任何未结算的持续威胁效果',
    check: (gameState) => {
      const allAreas = Object.values(gameState.areas);
      const hasThreatTokens = allAreas.some(area => 
        area.tokens.some(t => 
          ['APT控制标记', 'CC攻击标记', '恶意载荷标记', '监听标记'].includes(t.type) &&
          gameState.players.find(p => p.id === t.owner)?.faction === 'attack'
        )
      );
      return !hasThreatTokens;
    }
  },
  {
    id: 'D2',
    name: '韧性加固',
    faction: 'defense',
    description: '防御方阵营的每位玩家，都成功结算过打埋伏、打边鼓、打游击、打太极四类防御卡牌各一张，并维持至游戏结束',
    check: (gameState) => {
      const defenders = gameState.players.filter(p => p.faction === 'defense');
      const requiredTypes = ['基础防御类', '入侵检测与响应类', '主动与欺骗防御类', '资源与应急管理类'];
      return defenders.every(d => {
        const usedTypes = gameState.defenseCardsUsed[d.id] || [];
        return requiredTypes.every(t => usedTypes.includes(t as any));
      });
    }
  },
  {
    id: 'D3',
    name: '反杀',
    faction: 'defense',
    description: '在任一回合结算后，攻击方阵营所有玩家的信息资源总和 ≤ 1',
    check: (gameState) => {
      const attackers = gameState.players.filter(p => p.faction === 'attack');
      const totalInfo = attackers.reduce((sum, a) => sum + a.resources.information, 0);
      return totalInfo <= 1;
    }
  }
];

// 获取卡牌颜色主题
export function getCardColorTheme(card: Card): { bg: string; border: string; text: string } {
  if (card.faction === 'attack') {
    switch (card.type) {
      case 'DDoS攻击类':
        return { bg: 'from-red-900/80 to-red-700/80', border: 'border-red-500', text: 'text-red-100' };
      case '钓鱼攻击类':
        return { bg: 'from-orange-900/80 to-orange-700/80', border: 'border-orange-500', text: 'text-orange-100' };
      case '漏洞利用类':
        return { bg: 'from-purple-900/80 to-purple-700/80', border: 'border-purple-500', text: 'text-purple-100' };
      case '高级威胁类':
        return { bg: 'from-rose-950/80 to-rose-800/80', border: 'border-rose-600', text: 'text-rose-100' };
      default:
        return { bg: 'from-red-900/80 to-red-700/80', border: 'border-red-500', text: 'text-red-100' };
    }
  } else if (card.faction === 'defense') {
    switch (card.type) {
      case '基础防御类':
        return { bg: 'from-blue-900/80 to-blue-700/80', border: 'border-blue-500', text: 'text-blue-100' };
      case '入侵检测与响应类':
        return { bg: 'from-cyan-900/80 to-cyan-700/80', border: 'border-cyan-500', text: 'text-cyan-100' };
      case '主动与欺骗防御类':
        return { bg: 'from-teal-900/80 to-teal-700/80', border: 'border-teal-500', text: 'text-teal-100' };
      case '资源与应急管理类':
        return { bg: 'from-indigo-900/80 to-indigo-700/80', border: 'border-indigo-500', text: 'text-indigo-100' };
      default:
        return { bg: 'from-blue-900/80 to-blue-700/80', border: 'border-blue-500', text: 'text-blue-100' };
    }
  } else {
    return { bg: 'from-amber-900/80 to-amber-700/80', border: 'border-amber-500', text: 'text-amber-100' };
  }
}

// 【v8.0新增】资源转换卡牌
export const resourceConvertCards: Card[] = [
  {
    card_code: 'CONVERT_001',
    name: '情报交易',
    type: '资源转换类',
    faction: 'attack',
    cost: { information: 1 },
    trigger_condition: '手牌中有此卡时',
    effects: [
      { target: 'self', mechanic: 'resource_convert', detail: '-1信息 → +2资金' }
    ],
    duration: 0,
    source_event: '暗网情报市场',
    tags: ['combo']
  },
  {
    card_code: 'CONVERT_002',
    name: '算力租赁',
    type: '资源转换类',
    faction: 'attack',
    cost: { funds: 2 },
    trigger_condition: '手牌中有此卡时',
    effects: [
      { target: 'self', mechanic: 'resource_convert', detail: '-2资金 → +3算力' }
    ],
    duration: 0,
    source_event: '云算力黑市',
    tags: ['burst']
  },
  {
    card_code: 'CONVERT_003',
    name: '资金洗白',
    type: '资源转换类',
    faction: 'defense',
    cost: { information: 2 },
    trigger_condition: '手牌中有此卡时',
    effects: [
      { target: 'self', mechanic: 'resource_convert', detail: '-2信息 → +3资金' }
    ],
    duration: 0,
    source_event: '合规审计',
    tags: ['sustain']
  },
  {
    card_code: 'CONVERT_004',
    name: '技术外包',
    type: '资源转换类',
    faction: 'defense',
    cost: { funds: 3 },
    trigger_condition: '手牌中有此卡时',
    effects: [
      { target: 'self', mechanic: 'resource_convert', detail: '-3资金 → +2算力+1信息' }
    ],
    duration: 0,
    source_event: '安全服务采购',
    tags: ['combo']
  }
];

// 【v8.0新增】权限解锁的高级卡牌
export const advancedCards: Card[] = [
  {
    card_code: 'ADV_ATTACK_001',
    name: '0day漏洞',
    type: '漏洞利用类',
    faction: 'attack',
    cost: { compute: 3, information: 2 },
    trigger_condition: '渗透等级≥5时可用',
    effects: [
      { target: 'target_area', mechanic: 'auto_success', detail: '无视防御，直接放置权限标记' },
      { target: 'defender', mechanic: 'infiltration_gain', detail: '渗透等级+2' }
    ],
    duration: -1,
    source_event: '未公开漏洞',
    unlockCondition: { requiredLevel: 5, requiredFaction: 'attack', requiredPermission: 'infiltration' },
    tags: ['burst', 'deathrattle']
  },
  {
    card_code: 'ADV_DEFENSE_001',
    name: '零信任架构',
    type: '基础防御类',
    faction: 'defense',
    cost: { compute: 2, funds: 2 },
    trigger_condition: '安全等级≥7时可用',
    effects: [
      { target: 'all_areas', mechanic: 'aura', detail: '所有区域防御+1' },
      { target: 'self', mechanic: 'security_change', detail: '安全等级+1' }
    ],
    duration: -1,
    source_event: '零信任安全模型',
    unlockCondition: { requiredLevel: 7, requiredFaction: 'defense', requiredPermission: 'security' },
    tags: ['aura', 'sustain']
  }
];

// 【v8.0更新】合并所有卡牌
export const allCards: Card[] = [
  ...attackCards,
  ...defenseCards,
  ...resourceConvertCards,
  ...advancedCards
];
