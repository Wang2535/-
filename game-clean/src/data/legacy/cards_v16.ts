/**
 * 《道高一丈：数字博弈》v16.0 卡牌数据
 * 80张重构卡牌（攻击方40张 + 防御方40张）
 * 基于渗透等级/安全等级科技树系统
 */

import { Card } from '../types/card_v16';

// ==================== 攻击方卡牌（40张）====================

// -------- T1 基础攻击卡（8张）--------

export const ATTACK_T1_001: Card = {
  card_code: 'ATTACK_T1_001',
  name: '端口扫描',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_recon',
  cost: { compute: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 1,
        description: '降低目标安全等级1级'
      },
      onFailure: {
        type: 'security_reduce',
        baseValue: 0,
        description: '扫描被防火墙拦截'
      }
    }
  ],
  comboEffect: {
    trigger: 'consecutive_recon',
    bonus: 0.5,
    maxStack: 2,
    description: '连击：连续使用侦查卡额外降低0.5级'
  },
  description: '基础侦查手段，扫描目标开放的端口和服务',
  flavorText: '每一个开放的端口都是一扇未锁的门'
};

export const ATTACK_T1_002: Card = {
  card_code: 'ATTACK_T1_002',
  name: '弱口令尝试',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_recon',
  cost: { compute: 1, information: 1 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '破解成功！降低目标安全等级2级'
      },
      onFailure: {
        type: 'infiltration_reduce',
        baseValue: 1,
        description: '尝试失败，渗透等级-1'
      }
    }
  ],
  description: '尝试使用常见弱口令进行暴力破解',
  flavorText: '123456、password、admin...总有人在使用这些'
};

export const ATTACK_T1_003: Card = {
  card_code: 'ATTACK_T1_003',
  name: '钓鱼邮件',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_recon',
  cost: { funds: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 1,
        description: '用户点击链接！降低目标安全等级1级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '大成功！用户泄露了凭证'
      }
    },
    {
      type: 'resource_gain',
      resourceType: 'information',
      value: 1,
      description: '获得1点信息'
    }
  ],
  description: '发送伪装成可信来源的欺诈邮件',
  flavorText: '人类永远是安全链条中最薄弱的一环'
};

export const ATTACK_T1_004: Card = {
  card_code: 'ATTACK_T1_004',
  name: '服务拒绝攻击',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'vuln_exploit',
  cost: { compute: 2 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 1,
        description: '服务瘫痪！降低目标安全等级1级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'security_suppress',
      duration: 2,
      description: '目标2回合内无法提升安全等级'
    },
    description: '持续压制：阻止对方恢复'
  },
  description: '通过大量请求使目标服务不可用',
  flavorText: '当服务无法响应时，防御就形同虚设'
};

export const ATTACK_T1_005: Card = {
  card_code: 'ATTACK_T1_005',
  name: '恶意脚本注入',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'vuln_exploit',
  cost: { compute: 1, information: 1 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '脚本执行成功！降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'security_reduce',
      baseValue: 1,
      description: '每回合降低目标安全等级1级'
    },
    description: '持续伤害：脚本持续运行'
  },
  description: '向目标系统注入恶意脚本程序',
  flavorText: '一段精心构造的代码可以改变一切'
};

export const ATTACK_T1_006: Card = {
  card_code: 'ATTACK_T1_006',
  name: '网络嗅探',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_recon',
  cost: { information: 1 },
  difficulty: 1,
  effects: [
    {
      type: 'dice_check',
      difficulty: 1,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 1,
        description: '捕获敏感数据！降低目标安全等级1级'
      }
    },
    {
      type: 'resource_gain',
      resourceType: 'information',
      value: 2,
      description: '获得2点信息'
    }
  ],
  description: '监听网络流量，收集敏感信息',
  flavorText: '数据在网线中流动，我们只需静静聆听'
};

export const ATTACK_T1_007: Card = {
  card_code: 'ATTACK_T1_007',
  name: '字典攻击',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_recon',
  cost: { compute: 2 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '密码破解！降低目标安全等级2级'
      }
    }
  ],
  comboEffect: {
    trigger: 'consecutive_attack',
    bonus: 1,
    maxStack: 2,
    description: '连击：连续攻击额外降低1级'
  },
  description: '使用预计算的字典进行高效密码破解',
  flavorText: '字典里的每一个词都可能是钥匙'
};

export const ATTACK_T1_008: Card = {
  card_code: 'ATTACK_T1_008',
  name: '社会工程',
  faction: 'attack',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_recon',
  cost: { funds: 1, information: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 1,
        description: '心理操控成功！降低目标安全等级1级'
      }
    },
    {
      type: 'resource_steal',
      resourceType: 'information',
      value: 1,
      target: 'opponent',
      description: '窃取1点信息'
    }
  ],
  description: '通过心理操控获取敏感信息',
  flavorText: '人性的弱点比系统的漏洞更容易利用'
};

// -------- T2 进阶攻击卡（8张）--------

export const ATTACK_T2_001: Card = {
  card_code: 'ATTACK_T2_001',
  name: 'SQL注入',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 2, information: 1 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 3,
        description: '数据库被入侵！降低目标安全等级3级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        baseValue: 5,
        description: '大成功！获得管理员权限'
      }
    }
  ],
  description: '通过构造恶意SQL语句操控数据库',
  flavorText: "' OR '1'='1' -- 最简单的钥匙"
};

export const ATTACK_T2_002: Card = {
  card_code: 'ATTACK_T2_002',
  name: 'XSS跨站脚本',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 1, information: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '脚本注入成功！降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'resource_gain',
      resourceType: 'information',
      value: 1,
      description: '每回合获得1点信息'
    },
    description: '持续收集用户会话信息'
  },
  description: '在网页中注入恶意脚本窃取用户数据',
  flavorText: '当用户访问页面时，陷阱就已经触发'
};

export const ATTACK_T2_003: Card = {
  card_code: 'ATTACK_T2_003',
  name: 'CSRF伪造请求',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { information: 2 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '伪造请求成功！降低目标安全等级2级'
      }
    },
    {
      type: 'resource_steal',
      resourceType: 'funds',
      value: 2,
      target: 'opponent',
      description: '窃取2点资金'
    }
  ],
  description: '伪造用户身份执行非授权操作',
  flavorText: '借用他人的身份，完成自己的目的'
};

export const ATTACK_T2_004: Card = {
  card_code: 'ATTACK_T2_004',
  name: '文件上传漏洞',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 2 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 3,
        description: 'WebShell上传成功！降低目标安全等级3级'
      }
    }
  ],
  sustainEffect: {
    duration: 3,
    effect: {
      type: 'security_reduce',
      baseValue: 1,
      description: '每回合降低目标安全等级1级'
    },
    description: 'WebShell持续控制目标系统'
  },
  description: '利用文件上传功能上传恶意脚本',
  flavorText: '一个看似无害的文件，可能隐藏着致命的后门'
};

export const ATTACK_T2_005: Card = {
  card_code: 'ATTACK_T2_005',
  name: '命令注入',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 2, information: 1 },
  difficulty: 4,
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 4,
        description: '系统命令执行！降低目标安全等级4级'
      }
    }
  ],
  description: '在输入中注入系统命令并执行',
  flavorText: '; rm -rf /  一条命令足以毁灭一切'
};

export const ATTACK_T2_006: Card = {
  card_code: 'ATTACK_T2_006',
  name: '路径遍历',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 1, information: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '敏感文件泄露！降低目标安全等级2级'
      }
    },
    {
      type: 'resource_gain',
      resourceType: 'information',
      value: 2,
      description: '获得2点信息'
    }
  ],
  description: '通过../遍历访问受限目录',
  flavorText: '../../../../etc/passwd 通往系统的后门'
};

export const ATTACK_T2_007: Card = {
  card_code: 'ATTACK_T2_007',
  name: 'XML外部实体',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 2 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 3,
        description: 'XXE攻击成功！降低目标安全等级3级'
      }
    }
  ],
  description: '利用XML解析器读取本地文件',
  flavorText: 'ENTITY xxe SYSTEM "file:///etc/passwd"'
};

export const ATTACK_T2_008: Card = {
  card_code: 'ATTACK_T2_008',
  name: '反序列化漏洞',
  faction: 'attack',
  techLevel: 2,
  rarity: 'rare',
  type: 'vuln_exploit',
  cost: { compute: 2, information: 1 },
  difficulty: 4,
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 4,
        description: '远程代码执行！降低目标安全等级4级'
      }
    }
  ],
  description: '构造恶意序列化数据执行任意代码',
  flavorText: '数据的重组，带来的是系统的沦陷'
};

// -------- T3 高级攻击卡（8张）--------

export const ATTACK_T3_001: Card = {
  card_code: 'ATTACK_T3_001',
  name: '权限提升',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { compute: 2, information: 2 },
  difficulty: 4,
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'infiltration_gain',
        baseValue: 3,
        description: '权限提升成功！渗透等级+3'
      }
    },
    {
      type: 'security_reduce',
      baseValue: 2,
      description: '同时降低目标安全等级2级'
    }
  ],
  description: '利用系统漏洞提升访问权限',
  flavorText: '从访客到管理员，只需一个漏洞'
};

export const ATTACK_T3_002: Card = {
  card_code: 'ATTACK_T3_002',
  name: '横向移动',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { compute: 3, information: 1 },
  difficulty: 4,
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 4,
        description: '内网扩散！降低目标安全等级4级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'security_reduce',
      baseValue: 2,
      description: '每回合降低目标安全等级2级'
    },
    description: '持续在内网中扩散'
  },
  description: '在内部网络中扩散控制范围',
  flavorText: '一台沦陷，全网告急'
};

export const ATTACK_T3_003: Card = {
  card_code: 'ATTACK_T3_003',
  name: '后门植入',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { compute: 2, funds: 2 },
  difficulty: 4,
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '后门植入成功！降低目标安全等级2级'
      }
    }
  ],
  sustainEffect: {
    duration: 4,
    effect: {
      type: 'security_reduce',
      baseValue: 1,
      description: '每回合降低目标安全等级1级'
    },
    clearDifficulty: 5,
    description: '难以清除的后门程序'
  },
  description: '在系统中植入持久化后门',
  flavorText: '即使被发现，我也早已留下归来的路'
};

export const ATTACK_T3_004: Card = {
  card_code: 'ATTACK_T3_004',
  name: '内网嗅探',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { information: 2 },
  difficulty: 3,
  effects: [
    {
      type: 'dice_check',
      difficulty: 3,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 2,
        description: '内网数据捕获！降低目标安全等级2级'
      }
    },
    {
      type: 'resource_gain',
      resourceType: 'information',
      value: 3,
      description: '获得3点信息'
    }
  ],
  comboEffect: {
    trigger: 'consecutive_intel',
    bonus: 1,
    maxStack: 2,
    description: '连击：连续信息收集额外降低1级'
  },
  description: '在内部网络中收集敏感流量',
  flavorText: '内网的平静下，暗流涌动'
};

export const ATTACK_T3_005: Card = {
  card_code: 'ATTACK_T3_005',
  name: '凭证哈希破解',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { compute: 4 },
  difficulty: 5,
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 5,
        description: '哈希破解成功！降低目标安全等级5级'
      },
      onCriticalSuccess: {
        type: 'security_reduce',
        baseValue: 8,
        description: '大成功！获得域管理员权限'
      }
    }
  ],
  description: '使用彩虹表破解密码哈希',
  flavorText: '算力即权力，哈希只是时间的函数'
};

export const ATTACK_T3_006: Card = {
  card_code: 'ATTACK_T3_006',
  name: '域控制器攻击',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { compute: 3, funds: 2 },
  difficulty: 5,
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 5,
        description: '域控沦陷！降低目标安全等级5级'
      }
    }
  ],
  teamEffect: {
    target: 'all_defense',
    effect: {
      type: 'security_suppress',
      duration: 2,
      description: '所有防御方2回合内无法提升安全等级'
    }
  },
  description: '攻击Active Directory域控制器',
  flavorText: '控制了域控，就控制了整个网络'
};

export const ATTACK_T3_007: Card = {
  card_code: 'ATTACK_T3_007',
  name: '数据窃取',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { information: 3 },
  difficulty: 4,
  effects: [
    {
      type: 'dice_check',
      difficulty: 4,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 3,
        description: '核心数据泄露！降低目标安全等级3级'
      }
    },
    {
      type: 'resource_steal',
      resourceType: 'information',
      value: 3,
      target: 'opponent',
      description: '窃取3点信息'
    }
  ],
  description: '窃取目标核心数据资产',
  flavorText: '数据是新时代的石油，而我们正在开采'
};

export const ATTACK_T3_008: Card = {
  card_code: 'ATTACK_T3_008',
  name: '远程代码执行',
  faction: 'attack',
  techLevel: 3,
  rarity: 'epic',
  type: 'privilege_escalation',
  cost: { compute: 3, information: 2 },
  difficulty: 5,
  effects: [
    {
      type: 'dice_check',
      difficulty: 5,
      onSuccess: {
        type: 'security_reduce',
        baseValue: 4,
        description: 'RCE成功！降低目标安全等级4级'
      }
    },
    {
      type: 'infiltration_gain',
      baseValue: 2,
      description: '渗透等级+2'
    }
  ],
  description: '利用漏洞执行任意远程代码',
  flavorText: '距离不是问题，漏洞才是桥梁'
};

// 继续添加更多卡牌...
// 由于篇幅限制，这里展示部分卡牌，完整版应包含80张卡牌

// ==================== 防御方卡牌（40张）====================

// -------- T1 基础防御卡（8张）--------

export const DEFENSE_T1_001: Card = {
  card_code: 'DEFENSE_T1_001',
  name: '防火墙部署',
  faction: 'defense',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_defense',
  cost: { compute: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        baseValue: 1,
        description: '防火墙生效！提升安全等级1级'
      }
    }
  ],
  sustainEffect: {
    duration: 2,
    effect: {
      type: 'infiltration_suppress',
      duration: 2,
      description: '攻击方2回合内渗透等级无法提升'
    },
    description: '持续防护：阻止对方渗透'
  },
  description: '部署网络防火墙过滤恶意流量',
  flavorText: '第一道防线，也是最重要的一道'
};

export const DEFENSE_T1_002: Card = {
  card_code: 'DEFENSE_T1_002',
  name: '入侵检测启动',
  faction: 'defense',
  techLevel: 1,
  rarity: 'common',
  type: 'intrusion_detection',
  cost: { compute: 1, information: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        baseValue: 1,
        description: '检测系统启动！提升安全等级1级'
      }
    }
  ],
  counterEffect: {
    trigger: 'attack_card_played',
    effect: {
      type: 'infiltration_reduce',
      baseValue: 1,
      description: '检测反击：对方使用攻击卡时，其渗透等级-1'
    },
    description: '自动检测并反击入侵行为'
  },
  description: '启动入侵检测系统监控异常行为',
  flavorText: '任何异常都逃不过我们的眼睛'
};

export const DEFENSE_T1_003: Card = {
  card_code: 'DEFENSE_T1_003',
  name: '系统补丁更新',
  faction: 'defense',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_defense',
  cost: { compute: 2 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        baseValue: 2,
        description: '漏洞修复！提升安全等级2级'
      }
    }
  ],
  clearEffect: {
    type: 'clear_effect',
    clearType: 'vulnerability',
    description: '清除所有漏洞利用类持续效果'
  },
  description: '及时更新系统补丁修复安全漏洞',
  flavorText: '最好的防御就是消除漏洞'
};

export const DEFENSE_T1_004: Card = {
  card_code: 'DEFENSE_T1_004',
  name: '访问控制强化',
  faction: 'defense',
  techLevel: 1,
  rarity: 'common',
  type: 'basic_defense',
  cost: { compute: 1 },
  difficulty: 2,
  effects: [
    {
      type: 'dice_check',
      difficulty: 2,
      onSuccess: {
        type: 'security_gain',
        baseValue: 1,
        description: '访问控制生效！提升安全等级1级'
      }
    }
  ],
  protectionEffect: {
    type: 'protection',
    protectionType: 'credential_protection',
    duration: 1,
    description: '下回合免疫所有凭证窃取类攻击'
  },
  description: '强化身份认证和访问控制策略',
  flavorText: '不是谁都能进入，这是基本原则'
};

// 更多卡牌定义...

// ==================== 卡牌集合 ====================

/** 攻击方卡牌集合 */
export const ATTACK_CARDS: Card[] = [
  ATTACK_T1_001, ATTACK_T1_002, ATTACK_T1_003, ATTACK_T1_004,
  ATTACK_T1_005, ATTACK_T1_006, ATTACK_T1_007, ATTACK_T1_008,
  ATTACK_T2_001, ATTACK_T2_002, ATTACK_T2_003, ATTACK_T2_004,
  ATTACK_T2_005, ATTACK_T2_006, ATTACK_T2_007, ATTACK_T2_008,
  ATTACK_T3_001, ATTACK_T3_002, ATTACK_T3_003, ATTACK_T3_004,
  ATTACK_T3_005, ATTACK_T3_006, ATTACK_T3_007, ATTACK_T3_008,
  // T4和T5卡牌将在后续添加
];

/** 防御方卡牌集合 */
export const DEFENSE_CARDS: Card[] = [
  DEFENSE_T1_001, DEFENSE_T1_002, DEFENSE_T1_003, DEFENSE_T1_004,
  // 更多防御卡牌将在后续添加
];

/** 所有卡牌映射表 */
export const CARD_LIBRARY: Map<string, Card> = new Map([
  ...ATTACK_CARDS.map(c => [c.card_code, c] as [string, Card]),
  ...DEFENSE_CARDS.map(c => [c.card_code, c] as [string, Card])
]);

/** 按科技等级获取卡牌 */
export function getCardsByTechLevel(techLevel: number, faction?: 'attack' | 'defense'): Card[] {
  const cards = faction === 'attack' ? ATTACK_CARDS : 
                faction === 'defense' ? DEFENSE_CARDS :
                [...ATTACK_CARDS, ...DEFENSE_CARDS];
  return cards.filter(c => c.techLevel === techLevel);
}

/** 按品质获取卡牌 */
export function getCardsByRarity(rarity: string, faction?: 'attack' | 'defense'): Card[] {
  const cards = faction === 'attack' ? ATTACK_CARDS : 
                faction === 'defense' ? DEFENSE_CARDS :
                [...ATTACK_CARDS, ...DEFENSE_CARDS];
  return cards.filter(c => c.rarity === rarity);
}

/** 获取卡牌总数统计 */
export function getCardStats() {
  return {
    total: ATTACK_CARDS.length + DEFENSE_CARDS.length,
    attack: ATTACK_CARDS.length,
    defense: DEFENSE_CARDS.length,
    byTechLevel: {
      1: getCardsByTechLevel(1).length,
      2: getCardsByTechLevel(2).length,
      3: getCardsByTechLevel(3).length,
      4: getCardsByTechLevel(4).length,
      5: getCardsByTechLevel(5).length
    },
    byRarity: {
      common: getCardsByRarity('common').length,
      rare: getCardsByRarity('rare').length,
      epic: getCardsByRarity('epic').length,
      legendary: getCardsByRarity('legendary').length
    }
  };
}
