/**
 * 第91-110关关卡配置
 * 《大东话安全》系列关卡
 */

import type { LevelDefinition } from '@/types/levelTypes';

// 辅助函数
function createEnemyConfig(
  name: string,
  type: string,
  health: number,
  actionPoints: number,
  attackPattern: Array<{ turn: string | number; action: string; intensity: string }>,
  specialAbilities: Array<{ name: string; description: string; trigger: string; effect: string; cooldown: number }>
) {
  return {
    name,
    type,
    health,
    actionPoints,
    attackPattern,
    specialAbilities
  };
}

function createInitialSetup(
  playerActionPoints: number,
  playerHandSize: number,
  enemyActionPoints: number,
  maxTurns: number,
  areas: string[],
  initialMarkers: Record<string, number>
) {
  return {
    playerActionPoints,
    playerHandSize,
    enemyActionPoints,
    maxTurns,
    areas,
    initialMarkers
  };
}

// ============================================
// 第91-110关原文常量
// ============================================

const ARTICLE_91 = `一、小白剧场

小白：大东，如果你的个人信息被盗，你会怎么做呀？
大东：啊，这……
小白：嘻嘻，纯属好奇。
大东：那你呢，说来听听。
小白：emm，我也不知道。
大东：有这么纠结嘛？
小白：这个真的有，我要是给他支付赎金吧，我的信息可能就不会被放在暗网泄露了，但是这样就是助长了某些组织的不正之风。
大东：一身正气，精神小伙，白！那就不支付啦。
小白：不不不，不支付，我的信息泄露怎么办？住址、电话、银行卡号等等，我哪还有隐私？
大东：哈哈，这个够小白思考一阵子了，来，我给你讲个事吧。
小白：啥事呀？
大东：在2021年3月底的时候，加拿大网络安全公司Emsisoft 的研究员凯特（Kat Garcia）收到了网络黑客组织Clop的邮件，邮件中声称他们已经掌握了凯特的个人电话、邮箱、家庭住址、信用卡信息和社会安全号码。
小白：真可恶！太嚣张！
二、话说事件
大东：好在凯特将受到威胁一事告诉了记者，2021年4月14日，反映目前互联网黑客活动最频繁的黑客组织 Clop 的一部分运作模式的报道发表，将该组织行为公之于众。
小白：不得不承认，凯特是勇者，但她一定不是唯一的受害者。
大东：没错，据 ComputerWeekly 此前的报道显示，2021年2月11日，新加坡电信公司的一台旧服务器遭遇黑客入侵；2月24日，加拿大飞机制造商庞巴迪公司服务器被黑，部分内部数据被公开在暗网；3月4日，Clop 入侵网络安全服务供应商 Qualys 的服务器，并在暗网公布了文件截图，泄露数据包括发票、采购订单、税务文件和数据报告；3月23日，能源巨头壳牌公司发布声明，称其数据服务器在 2020年12月就遭遇了黑客攻击，被盗数据包括个人数据以及设计公司和利益相关者的数据。
小白：那么Clop究竟是怎样运作的呢？
大东：他们通过威胁某些公司的员工获得所需数据，再利用这些数据入侵目标公司的服务器。
小白：他们是怎么做到的呀？
大东：这一过程中，该组织频繁利用了一个文件共享服务漏洞。
小白：这个漏洞来源是啥呀？
大东：这一漏洞出现在由 Appliance 公司提供技术支持的文件系统中，全球约有 300 家企业在使用这项服务。
小白：这个入侵手段似曾相识。
大东：没错，供应链攻击，熟悉吗？
小白：黑客运用软件漏洞？
大东：没错，利用软件漏洞对供应商的客户展开大规模攻击，之后以数据为要挟要求公司支付赎金。
小白：受害者及时付款，数据就会被删除嘛？
大东：没错。黑客甚至会录制删除视频以证明危机已经解除。但是，如果不按时付款，Clop 就会开始逐步放出该公司的数据。
小白：现在有多少企业和机构受害啦？
大东：Clop 的受害者名单上已经扩展到了多达 50 家企业和机构，从壳牌这样的商业公司到斯坦福大学这样的学校均在名单之上。
小白：好家伙，学校都不放过。
大东：还有你想不到的呢。一些受害公司向 Vice 透露，Clop 在与他们交涉的过程中 "彬彬有礼"，并且愿意让步。此前曾有公司与之讨价还价，最终将赎金从 2000 万美金降低到了 600 万美金。如果快速支付赎金，Clop 还会提供一些 " 优惠 "，在 3-4 天内快速支付赎金的公司，Clop 会给他们打 30% 的折扣。
小白：还打折？真让人哭笑不得！
三、大话始末
大东：目前我们所知道的受害者和案件或许只是冰山一角。一位长期追踪网络黑客行动的研究者告诉 Vice，Clop看似于 2020 年年底活跃至今，但事实上该组织存在的时间远比想象中的要长久。
小白：咦？此话怎讲？
大东：他们可能已经多次易名，真要追踪起来，2017-2018 年间在网络展开针对金融、零售和酒店业公司的有组织黑客行动的网络组织 FIN11，以及 2019 年臭名昭著的比特币勒索事件的始作俑者 TA505 都是该组织的前身。
小白：据我所知，FIN11是一个有经济动机的黑客组织，之前它使用恶意电子邮件进行攻击，逐渐转变为勒索软件攻击。
大东：没错。该组织经营着大量业务，主要针对北美和欧洲几乎所有行业部门的公司窃取数据和部署Clop勒索软件。
小白：他们是怎么做到的？
大东：FIN11类似于APT，攻击者引人注目的不是他们的老练，而是他们活动的规模。在FIN11的钓鱼操作中有很大的漏洞，但是当活动时，该组织每周会进行多达五次的大流量活动。
小白：活动规模确实很大。
大东：Mandiant威胁情报公司（Mandiant Threat Intelligence）的高级分析经理金伯利·古迪（Kimberly Goody）称，受害者必须先完成验证码挑战才能收到带有恶意宏代码的Excel电子表格，一旦执行，该代码将交付FRIENDSPEAK，后者下载了另一个FIN11特有的恶意软件MIXLABEL。
小白：他们的每次行动都能获利嘛？
大东：那不一定啦！Mandiant公司也对许多FIN11入侵事件做出了回应，但研究人员仅观察到该小组在少数情况下成功地通过访问获利。这可能意味着攻击者在网络钓鱼操作中撒了一张大网，然后根据区域、地理位置或感知到的安全态势等特征选择进一步利用哪些受害者。
小白：FIN11还有什么活动嘛？
大东：FIN11已经部署了Clop勒索软件，并威胁要公布泄露的数据，迫使受害者支付赎金。Clop是一类相对较新的勒索软件，于2020年2月首次出现在公众视野中，Clop背后团队的主要目标是加密企业的文件，收到赎金后再发送解密器，目前Clop仍处于快速发展阶段。
小白：我国企业有收到破坏嘛？
大东：2020年7月Clop在国际上（如韩国）开始传播，而国内某企业也在被攻击后造成大面积感染，该恶意软件暂无有效的解密工具，致该受害企业大量数据被加密而损失严重。
小白：果然是伤害大，范围广。
大东：值得注意的是，FIN11与另一个威胁组织TA505有着显著重叠。TA505是Dridex银行木马和Locky勒索软件的幕后黑手，它们通过Necurs僵尸网络进行恶意垃圾邮件攻击。
小白：TA505是啥呀？可以讲讲吗？
大东：TA505网络间谍组织主要针对全球金融机构进行攻击，自2014年以来就一直保持活跃状态，在过去的几年里，该组织已经通过利用银行木马Dridex以及勒索软件Locky和Jaff作为攻击工具成功发起了多起大型的网络攻击活动。
小白：那他俩有区别吗？
大东：TA505的早期活动和FIN11是不同的，所以两个组织并不是同一个开发者。和大多数以获利为动机的攻击者一样，FIN11也不是所有的开发都是从头开始的。
小白：比如？
大东：该组织使用的服务提供匿名域注册，防弹主机（Bulletproof hosting）、代码签名证书以及私有或半私有恶意软件。
小白：防弹主机感觉挺酷的！
大东：哈哈，防弹主机是指对用户上传和发布的内容不加限制的一种网络或域名服务，这种服务被通常利用来发垃圾邮件，在线赌博或网络色情等。
小白：其实，一般的网络服务提供商会经由服务条款对特定内容或行为加以限制，为了防止自己的IP段被基于IP协议的反垃圾过滤器屏蔽而遭正常用户投诉，也会中断对违规用户的服务。防弹主机有什么不一样吗？
大东：防弹主机允许内容提供者绕过法律或本地的互联网检查机构，所以大部分的防弹主机都在境外（相对于内容提供者的地理位置）。
四、小白内心说
小白：大东，这些组织是十分可恶，但是如果我们信息遭到泄露应该怎么办呀？
大东：最简单的方式是更改较为重要的密码。尤其对于喜欢网购的人来说，个人信息往往和银行账号、密码等重要的信息联系在一起。因此，一旦个人信息泄露，应该马上更改重要的密码，避免造成经济损失。
小白：这么一说，我也知道一点，那就是更换账号。个人信息泄漏后，要第一时间换账号。由于现在网络十分发达，信息泄露之后如果不换账号，那么在这个账号下登陆的各种信息就会源源不断地流出。因此，一旦发现了泄露的源头，就要立刻终止使用这个账号，从源头切断泄漏源。
大东：个人信息泄漏后，还要提醒身边的亲朋好友呀，要他们倍加防范，以免上当受骗。必要时，要需要收集证据。收到各种各样的邮件，接到天南海北的电话，这时候要留心，记下对方的电话或者是邮箱地址等有用的信息。可能这些信息很琐碎，但是一旦收集好这些信息不仅能帮助自己维权，而且还可能帮助更多的人。
小白：知道啦，防范风险，从我做起！
参考资料：1. Fin11:一个以经济利益为动机的高级攻击组织https://mp.weixin.qq.com/s/JCJlsaSlXqr5yoNyC9Dm3A  2. FireEye称针对Accellion FTA的攻击与FIN11有关；乌克兰称其政府的多个网站遭到来自俄罗斯的攻击www.venustech.com.cn/new_type/aqjx/20210224/22404.html3. 两个月内 50 家公司遭入侵，互联网上最具规模的黑客组织 Cl0p 逐渐浮出水面https://mp.weixin.qq.com/s/Ti6I_TOhGXpiYv_tuCVBJg
来源：中国科学院信息工程研究所`;

// 由于篇幅限制，这里只展示ARTICLE_91的完整内容
// 其他文章常量将在实际使用时添加

// ============================================
// 第91-110关关卡定义
// ============================================

export const LEVELS_91_110: Record<string, LevelDefinition> = {
  'LV091': {
    id: 'LV091',
    name: '变身？打折？Clop有多凡尔赛！',
    subtitle: '大东话安全',
    articleTitle: '第91篇：变身？打折？Clop有多凡尔赛！丨大东话安全',
    articleContent: ARTICLE_91,
    difficulty: 6,
    tutorialFocus: 'ransomware_protection',
    objectives: [
      { id: 'obj1', description: '供应链防护：阻止通过供应商入侵', type: 'use_defense_cards', target: 4, completed: false },
      { id: 'obj2', description: '数据保护：防止敏感数据被加密', type: 'protect_areas', target: 4, completed: false },
      { id: 'obj3', description: '击败Clop：阻止勒索软件组织', type: 'defeat_enemy', target: 1, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV090' },
    rewards: {
      unlockedCards: ['DEF091-1T5', 'DEF091-2T5', 'DEF091-3T5'],
      achievement: '供应链安全卫士',
      experiencePoints: 2450
    },
    specialCards: [
      {
        cardId: 'LV091_CARD_1',
        name: '供应链漏洞扫描',
        description: '扫描并修复供应商系统中的安全漏洞，安全+6。消耗6行动点',
        type: 'vulnerability_management',
        techLevel: 5,
        effects: [{ type: 'supply_chain_scan', value: 6, description: '供应链扫描' }],
        isUnlocked: false
      },
      {
        cardId: 'LV091_CARD_2',
        name: '数据加密保护',
        description: '对敏感数据进行加密，防止勒索软件加密，安全+7。消耗7行动点',
        type: 'data_protection',
        techLevel: 6,
        effects: [{ type: 'data_encryption', value: 7, description: '数据加密' }],
        isUnlocked: false
      },
      {
        cardId: 'LV091_CARD_3',
        name: '勒索软件拦截',
        description: '检测并拦截Clop勒索软件攻击，安全+6。消耗6行动点',
        type: 'intrusion_detection',
        techLevel: 5,
        effects: [{ type: 'ransomware_block', value: 6, description: '勒索拦截' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      'Clop勒索软件组织',
      'clop_ransomware',
      6,
      5,
      [
        { turn: 'all', action: 'supply_chain_attack', intensity: 'high' },
        { turn: 2, action: 'data_encryption', intensity: 'high' },
        { turn: 3, action: 'ransom_demand', intensity: 'high' }
      ],
      [
        { name: '供应链攻击', description: '利用供应商漏洞入侵目标', trigger: '每回合', effect: '供应商沦陷', cooldown: 1 },
        { name: '数据加密', description: '加密受害者敏感数据', trigger: '每2回合', effect: '数据锁定', cooldown: 2 },
        { name: '勒索威胁', description: '威胁公开数据要求赎金', trigger: '每3回合', effect: '双重勒索', cooldown: 3 }
      ]
    ),
    initialSetup: createInitialSetup(8, 7, 6, 150, ['internal', 'supplier', 'dmz', 'external'], { internal: 4, supplier: 4, dmz: 3, external: 4 }),
    hints: [
      '【大东科普】Clop利用Accellion FTA文件共享服务漏洞进行供应链攻击',
      '【大东提示】FIN11是Clop的前身组织，以大规模钓鱼攻击著称',
      '【大东提示】Clop甚至会给快速支付赎金的受害者打30%折扣',
      '【大东提示】供应链攻击通过供应商渗透最终目标',
      '【大东提示】双重勒索：加密数据+威胁公开',
      '【大东提示】及时修补第三方组件漏洞是防御关键'
    ],
    estimatedTurns: 25,
    enemyIds: ['clop_operator', 'fin11_attacker', 'supply_chain_penetrat0r'],
    areaDistribution: {
      internal: { name: '企业内部网', friendlyMarkers: 4, enemyMarkers: 3, trait: '核心区域：敏感数据', traitType: 'internal_network' },
      supplier: { name: '供应商网络', friendlyMarkers: 4, enemyMarkers: 4, trait: '供应链区域：第三方接入', traitType: 'supplier_network' },
      dmz: { name: '文件共享区', friendlyMarkers: 3, enemyMarkers: 3, trait: '共享区域：FTA服务', traitType: 'file_sharing' },
      external: { name: '外部威胁区', friendlyMarkers: 4, enemyMarkers: 4, trait: '外部区域：黑客活动', traitType: 'external_threat' }
    },
    playerConfig: {
      actionPoints: 8,
      handSize: 7,
      specialResources: []
    },
    dadongConfig: {
      actionPoints: 6,
      handSize: 5,
      specialAbility: '供应链安全讲解——大东说：供应商安全就是企业安全！及时修补第三方漏洞。每回合恢复1行动点，供应商网络是重点防护区域'
    },
    failureConditions: [
      '数据被加密：关键业务数据被Clop加密',
      '供应链沦陷：供应商网络被完全控制',
      '回合超限：超过25回合仍未达成胜利条件'
    ]
  }
  // 其他关卡LV092-LV110将在后续添加
};

export default LEVELS_91_110;
