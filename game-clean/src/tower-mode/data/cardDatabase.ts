import type { Card } from '../types/player.types';

// 完整设想中要求的卡牌库 - 基于科技树T0-T4的防御卡牌
export const CARD_DATABASE: Card[] = [
  // === T0 基础防御卡牌 ===
  {
    id: 't0_basic_defense',
    name: '基础防御',
    description: '安全等级+2',
    type: 'T0',
    category: 'defense',
    quality: 'common',
    effect: (state: any) => ({ ...state, safetyLevel: (state.safetyLevel || 0) + 2 }),
  },
  {
    id: 't0_resource_gather',
    name: '资源收集',
    description: '获得2点算力',
    type: 'T0',
    category: 'resource',
    quality: 'common',
    effect: (state: any) => ({ ...state, computing: (state.computing || 0) + 2 }),
  },
  {
    id: 't0_quick_heal',
    name: '快速修复',
    description: '安全等级+3，消耗2算力',
    type: 'T0',
    category: 'defense',
    quality: 'common',
    effect: (state: any) => {
      if (state.computing >= 2) {
        return { ...state, safetyLevel: (state.safetyLevel || 0) + 3, computing: state.computing - 2 };
      }
      return state;
    },
  },
  
  // === T1 入侵检测卡牌（5级解锁） ===
  {
    id: 't1_intrusion_detection',
    name: '入侵检测',
    description: '敌人渗透等级-3，安全等级+1',
    type: 'T1',
    category: 'defense',
    quality: 'good',
    effect: (state: any) => ({ 
      ...state, 
      penetrationLevel: Math.max(0, (state.penetrationLevel || 0) - 3),
      safetyLevel: (state.safetyLevel || 0) + 1 
    }),
  },
  {
    id: 't1_firewall',
    name: '防火墙',
    description: '敌人下次攻击效果减半',
    type: 'T1',
    category: 'defense',
    quality: 'good',
    effect: (state: any) => ({ ...state, nextDamageHalved: true }),
  },
  
  // === T2 主动防御卡牌（15级解锁） ===
  {
    id: 't2_counter_attack',
    name: '反击协议',
    description: '安全等级+5，敌人渗透等级-4',
    type: 'T2',
    category: 'defense',
    quality: 'rare',
    effect: (state: any) => ({ 
      ...state, 
      safetyLevel: (state.safetyLevel || 0) + 5,
      penetrationLevel: Math.max(0, (state.penetrationLevel || 0) - 4)
    }),
  },
  {
    id: 't2_resource_storm',
    name: '资源风暴',
    description: '获得5点算力，3点资金，2点信息',
    type: 'T2',
    category: 'resource',
    quality: 'rare',
    effect: (state: any) => ({ 
      ...state, 
      computing: (state.computing || 0) + 5,
      funds: (state.funds || 0) + 3,
      information: (state.information || 0) + 2
    }),
  },
  
  // === T3 纵深防御卡牌（30级解锁） ===
  {
    id: 't3_deep_defense',
    name: '纵深防御',
    description: '安全等级+8，获得护盾5点',
    type: 'T3',
    category: 'defense',
    quality: 'epic',
    effect: (state: any) => ({ 
      ...state, 
      safetyLevel: (state.safetyLevel || 0) + 8,
      shield: (state.shield || 0) + 5
    }),
  },
  {
    id: 't3_system_recovery',
    name: '系统恢复',
    description: '安全等级+10，敌人渗透等级-6',
    type: 'T3',
    category: 'defense',
    quality: 'epic',
    effect: (state: any) => ({ 
      ...state, 
      safetyLevel: (state.safetyLevel || 0) + 10,
      penetrationLevel: Math.max(0, (state.penetrationLevel || 0) - 6)
    }),
  },
  
  // === T4 绝对安全卡牌（40级解锁） ===
  {
    id: 't4_absolute_security',
    name: '绝对安全',
    description: '安全等级+15，获得护盾10点，本回合免疫所有攻击',
    type: 'T4',
    category: 'defense',
    quality: 'legendary',
    effect: (state: any) => ({ 
      ...state, 
      safetyLevel: (state.safetyLevel || 0) + 15,
      shield: (state.shield || 0) + 10,
      immuneThisTurn: true
    }),
  },
  {
    id: 't4_ultimate_recovery',
    name: '终极恢复',
    description: '安全等级恢复到30，敌人渗透等级-10',
    type: 'T4',
    category: 'defense',
    quality: 'legendary',
    effect: (state: any) => ({ 
      ...state, 
      safetyLevel: Math.max(state.safetyLevel || 0, 30),
      penetrationLevel: Math.max(0, (state.penetrationLevel || 0) - 10)
    }),
  },
];

// T0初始卡组
export const INITIAL_DECK: Card[] = CARD_DATABASE.filter(card => card.type === 'T0');

// 根据卡牌类型获取卡牌
export function getCardsByType(type: Card['type']): Card[] {
  return CARD_DATABASE.filter(card => card.type === type);
}

// 根据品质获取卡牌
export function getCardsByQuality(quality: Card['quality']): Card[] {
  return CARD_DATABASE.filter(card => card.quality === quality);
}
