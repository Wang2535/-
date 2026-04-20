/**
 * 大东安全知识话语库
 * 包含网络安全相关的科普内容，用于大东的知识讲解技能
 */

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  relatedLevel?: string;
  source?: string;
}

/**
 * 大东安全知识话语库
 * 涵盖从计算机病毒到账号安全的全方位网络安全知识
 */
export const dadongKnowledgeBase: KnowledgeEntry[] = [
  // LV001: 计算机病毒基础
  {
    id: 'KNOW_001',
    title: '计算机病毒的工作原理',
    content: '计算机病毒是一种恶意软件，它通过自我复制来感染其他程序或文件。就像生物病毒一样，计算机病毒需要宿主才能生存和传播。它们通常隐藏在看似正常的程序中，当用户运行这些程序时，病毒就会被激活并开始破坏系统或窃取数据。预防病毒的最佳方法是安装可靠的杀毒软件，并避免下载来源不明的文件。',
    category: '病毒防护',
    relatedLevel: 'LV001',
    source: '网络安全基础知识'
  },
  {
    id: 'KNOW_002',
    title: '蠕虫病毒与木马的区别',
    content: '蠕虫病毒和木马是两种常见的恶意软件，但它们的工作方式不同。蠕虫病毒可以自我复制并在网络中传播，不需要依附其他程序。而木马则伪装成有用的软件，诱骗用户安装，然后在后台执行恶意操作。蠕虫像会自我繁殖的生物，而木马更像是一个特洛伊木马——外表无害，内部藏有危险。',
    category: '恶意软件',
    relatedLevel: 'LV001',
    source: '恶意软件分类指南'
  },

  // LV002: 社会工程学攻击
  {
    id: 'KNOW_003',
    title: '什么是社会工程学攻击？',
    content: '社会工程学攻击是指攻击者利用人性的弱点（如好奇心、信任、恐惧等）来骗取敏感信息或访问权限的攻击方式。常见的形式包括钓鱼邮件、假冒身份、制造紧急情况等。记住：真正的安全人员不会通过邮件或电话索要你的密码！遇到可疑情况时，一定要通过官方渠道验证对方身份。',
    category: '社会工程',
    relatedLevel: 'LV002',
    source: '社会工程学防护指南'
  },
  {
    id: 'KNOW_004',
    title: '鱼叉式钓鱼攻击',
    content: '鱼叉式钓鱼是一种高度针对性的网络攻击，攻击者会事先研究目标（个人或企业），然后发送看似来自可信来源的定制邮件。与普通钓鱼不同，鱼叉式钓鱼邮件通常包含你的真实姓名、职位或其他个人信息，使其看起来完全合法。防范方法是：即使是熟悉的联系人发来的邮件，如果包含链接或附件，也要谨慎对待，最好通过其他方式确认。',
    category: '钓鱼攻击',
    relatedLevel: 'LV002',
    source: '钓鱼攻击防范手册'
  },

  // LV003: 网络蠕虫与自我繁殖
  {
    id: 'KNOW_005',
    title: '熊猫烧香病毒的启示',
    content: '熊猫烧香是2006年在中国大规模爆发的蠕虫病毒，它会感染可执行文件并在文件中添加熊猫烧香的图标。这个病毒提醒我们：及时更新操作系统补丁、不随意运行不明程序、使用正版杀毒软件是保护自己的基本措施。更重要的是，网络安全需要每个人的参与，任何一台被感染的电脑都可能成为攻击他人的跳板。',
    category: '蠕虫病毒',
    relatedLevel: 'LV003',
    source: '蠕虫病毒案例分析'
  },

  // LV004: APT攻击与工业控制
  {
    id: 'KNOW_006',
    title: '震网病毒：首个网络物理武器',
    content: '震网病毒（Stuxnet）是2010年发现的一种专门针对工业控制系统的恶意软件，它成功破坏了伊朗的核设施离心机。这是世界上首个已知的针对物理基础设施的网络武器。震网病毒告诉我们：关键基础设施的网络安全至关重要，工控系统与互联网的隔离、严格的访问控制、定期的安全审计都是必不可少的防护措施。',
    category: '工控安全',
    relatedLevel: 'LV004',
    source: '工控系统安全报告'
  },
  {
    id: 'KNOW_007',
    title: '什么是零日漏洞？',
    content: '零日漏洞（Zero-day）是指软件厂商尚未知晓或尚未发布补丁的安全漏洞。攻击者利用这些漏洞可以在用户毫无防备的情况下入侵系统。由于厂商需要时间来开发和发布补丁，这段时间被称为"零日窗口"，是系统最脆弱的时期。防范零日攻击的最佳方法是：保持软件更新、使用多层安全防护、限制不必要的软件权限、定期备份重要数据。',
    category: '漏洞利用',
    relatedLevel: 'LV004',
    source: '漏洞研究资料'
  },

  // LV005: 软件漏洞
  {
    id: 'KNOW_008',
    title: '软件漏洞的生命周期',
    content: '软件漏洞从被发现到被修复会经历几个阶段：发现→验证→报告→修复→发布补丁→用户更新。在这个过程中，漏洞可能被恶意利用。作为用户，我们能做的就是：及时安装系统和软件更新、启用自动更新功能、关注安全公告。记住：延迟更新就是给攻击者留下机会窗口！',
    category: '软件安全',
    relatedLevel: 'LV005',
    source: '软件安全开发规范'
  },

  // LV006: 工控系统安全
  {
    id: 'KNOW_009',
    title: '工业控制系统的特殊风险',
    content: '工业控制系统（ICS）管理着电力、水务、交通等关键基础设施。与传统IT系统不同，ICS系统通常需要连续运行数年，难以频繁更新；它们往往使用专有协议，安全措施相对薄弱；一旦被攻击，后果可能是物理性的破坏甚至人员伤亡。保护ICS需要：网络隔离、访问控制、异常监测、应急响应计划等多层次的安全措施。',
    category: '工控安全',
    relatedLevel: 'LV006',
    source: '工业控制系统安全白皮书'
  },

  // LV007: 隐私保护
  {
    id: 'KNOW_010',
    title: '你的数字足迹有多长？',
    content: '每次上网，你都在留下数字足迹：浏览记录、搜索历史、位置信息、社交互动……这些数据被收集、分析，可能用于精准广告、信用评估，甚至落入不法分子手中。保护隐私的方法包括：使用隐私保护浏览器、定期清理Cookie、谨慎分享个人信息、阅读隐私政策、使用强密码和双因素认证。记住：在互联网上，免费的服务往往以你的数据为代价。',
    category: '隐私保护',
    relatedLevel: 'LV007',
    source: '隐私保护指南'
  },
  {
    id: 'KNOW_011',
    title: 'MAC地址与设备追踪',
    content: 'MAC地址是网络设备的唯一标识符，就像设备的"身份证号"。通过MAC地址，攻击者可以追踪设备位置、识别用户身份、甚至伪造设备接入网络。在公共场所使用WiFi时，你的MAC地址可能被记录下来。现代操作系统提供了"随机MAC地址"功能，可以在连接不同网络时使用不同的MAC地址，有效保护你的隐私。',
    category: '隐私保护',
    relatedLevel: 'LV007',
    source: '网络安全设备说明'
  },

  // LV008: 密码学基础
  {
    id: 'KNOW_012',
    title: '密码的强度与破解',
    content: '一个强密码应该至少12位，包含大小写字母、数字和特殊符号，并且不使用字典单词或个人信息。黑客破解密码的方法包括：暴力破解（尝试所有可能的组合）、字典攻击（使用常见密码列表）、彩虹表攻击（使用预计算的哈希值）。使用密码管理器生成和存储强密码、为不同账户使用不同密码、启用双因素认证，是保护账户安全的最佳实践。',
    category: '密码安全',
    relatedLevel: 'LV008',
    source: '密码安全最佳实践'
  },
  {
    id: 'KNOW_013',
    title: '哈希与加密：守护数据的数学',
    content: '哈希和加密是保护数据的两种数学技术。加密是可逆的——用密钥加密的数据可以用密钥解密，用于保护传输和存储中的敏感信息。哈希是单向的——任何长度的数据都会被转换成固定长度的"指纹"，且无法从指纹反推出原始数据，常用于存储密码。现代系统使用"加盐哈希"来存储密码，即使两个用户使用相同密码，存储的哈希值也不同，大大提高了安全性。',
    category: '密码学',
    relatedLevel: 'LV008',
    source: '密码学基础教程'
  },

  // LV009: 账号安全
  {
    id: 'KNOW_014',
    title: '撞库攻击：一个密码的连锁风险',
    content: '撞库攻击是指攻击者使用从其他网站泄露的用户名和密码组合，尝试登录其他网站。如果你在不同网站使用相同的用户名和密码，一旦其中一个网站被攻破，你的所有账户都处于危险之中！防范撞库攻击的方法是：为每个重要账户使用独特的强密码、启用双因素认证、定期检查账户是否有异常登录、使用密码管理器。',
    category: '账号安全',
    relatedLevel: 'LV009',
    source: '账号安全保护手册'
  },
  {
    id: 'KNOW_015',
    title: '钓鱼网站的识别技巧',
    content: '钓鱼网站伪装成合法网站来窃取你的登录信息。识别钓鱼网站的技巧包括：检查URL（注意拼写错误、多余字符、不常见的域名）、查看安全证书（地址栏应有锁形图标）、警惕紧急或威胁性的语言、不点击邮件中的链接（手动输入网址）、注意页面设计细节（模糊的图片、错位的元素）。当怀疑遇到钓鱼网站时，立即停止操作并报告！',
    category: '钓鱼攻击',
    relatedLevel: 'LV009',
    source: '钓鱼网站识别指南'
  },

  // 通用安全知识
  {
    id: 'KNOW_016',
    title: '双因素认证：给你的账户加把锁',
    content: '双因素认证（2FA）要求你在输入密码后，再提供第二种验证方式，如短信验证码、身份验证器应用生成的代码、或硬件安全密钥。即使攻击者知道了你的密码，没有第二种因素也无法登录。强烈建议为邮箱、银行、社交媒体等重要账户启用双因素认证。记住：短信验证码虽然方便，但不如身份验证器应用安全，因为SIM卡可能被劫持。',
    category: '身份认证',
    relatedLevel: undefined,
    source: '双因素认证实施指南'
  },
  {
    id: 'KNOW_017',
    title: '公共WiFi的安全隐患',
    content: '公共WiFi虽然方便，但存在严重的安全风险。攻击者可以建立假冒的WiFi热点（"邪恶双胞胎"攻击），或监听不安全的公共WiFi流量。在公共WiFi上，避免访问银行账户、输入密码或传输敏感信息。如果必须使用，请使用VPN加密你的网络连接。更好的做法是使用手机热点，或使用支持 WPA3 的安全WiFi网络。',
    category: '网络安全',
    relatedLevel: undefined,
    source: '公共WiFi安全建议'
  },
  {
    id: 'KNOW_018',
    title: '定期备份：数据安全的最后一道防线',
    content: '勒索软件会加密你的文件并要求支付赎金才能解密。即使支付了赎金，也不一定能恢复数据。对抗勒索软件最有效的方法是：定期备份重要数据到离线存储设备或云端、保持系统和软件更新、不打开可疑的邮件附件、使用可靠的杀毒软件。记住：3-2-1备份原则——至少3份备份、使用2种不同介质、其中1份存放在异地。',
    category: '数据安全',
    relatedLevel: undefined,
    source: '数据备份策略指南'
  }
];

/**
 * 随机获取一条科普内容
 * @returns 随机选择的KnowledgeEntry
 */
export function getKnowledgeEntry(): KnowledgeEntry {
  const randomIndex = Math.floor(Math.random() * dadongKnowledgeBase.length);
  return dadongKnowledgeBase[randomIndex];
}

/**
 * 根据关卡ID获取相关的科普内容
 * @param levelId 关卡ID（如 'LV001'）
 * @returns 与该关卡相关的KnowledgeEntry数组
 */
export function getKnowledgeEntryByLevel(levelId: string): KnowledgeEntry[] {
  return dadongKnowledgeBase.filter(entry => entry.relatedLevel === levelId);
}

/**
 * 随机获取与指定关卡相关的科普内容
 * 如果没有相关内容，则返回任意一条
 * @param levelId 关卡ID
 * @returns KnowledgeEntry
 */
export function getRandomKnowledgeByLevel(levelId: string): KnowledgeEntry {
  const levelEntries = getKnowledgeEntryByLevel(levelId);
  if (levelEntries.length > 0) {
    const randomIndex = Math.floor(Math.random() * levelEntries.length);
    return levelEntries[randomIndex];
  }
  // 如果没有关卡相关内容，返回任意一条
  return getKnowledgeEntry();
}

/**
 * 根据ID获取特定的科普内容
 * @param id 知识条目ID
 * @returns KnowledgeEntry | undefined
 */
export function getKnowledgeById(id: string): KnowledgeEntry | undefined {
  return dadongKnowledgeBase.find(entry => entry.id === id);
}

export default dadongKnowledgeBase;
