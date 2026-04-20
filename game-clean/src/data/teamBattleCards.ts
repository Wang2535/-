/**
 * 2v2团队对战专属卡牌
 * 根据完善的2v2规则.md实现
 */

import type { Faction, CardRarity, TechLevel } from '../types/legacy/card_v16';

// 团队卡牌效果类型
export type TeamCardEffectType = 
  | 'resource_gain'
  | 'resource_steal'
  | 'infiltration_gain'
  | 'security_gain'
  | 'security_reduce'
  | 'protection'
  | 'custom';

// 团队卡牌效果
export interface TeamCardEffect {
  type: TeamCardEffectType;
  target?: 'self' | 'opponent' | 'all' | 'team' | 'enemy_team';
  value?: number;
  resourceType?: 'compute' | 'funds' | 'information' | 'access';
  description: string;
  protectionType?: string;
  baseValue?: number;
}

// 团队卡牌定义
export interface TeamBattleCard {
  card_code: string;
  name: string;
  type: string;
  faction: Faction;
  rarity: CardRarity;
  description: string;
  flavorText?: string;
  cost: {
    compute: number;
    funds: number;
    information: number;
    access: number;
  };
  difficulty: number;
  effects: TeamCardEffect[];
  teamEffect: boolean;
  targetTeam?: 'attacker' | 'defender';
  techLevel: TechLevel;
}

// 进攻方团队卡牌
export const TEAM_ATTACKER_CARDS: TeamBattleCard[] = [
  {
    card_code: '2V2-C01',
    name: '团队算力支援',
    type: 'basic_recon',
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    description: '整个团队获得算力+2',
    flavorText: '资源共享，协同作战',
    cost: { compute: 0, funds: 0, information: 0, access: 0 },
    difficulty: 3,
    effects: [
      {
        type: 'resource_gain',
        target: 'team',
        value: 2,
        resourceType: 'compute',
        description: '所有队友获得2点算力',
      },
    ],
    teamEffect: true,
    targetTeam: 'attacker',
    techLevel: 1,
  },
  {
    card_code: '2V2-C02',
    name: '联合渗透',
    type: 'vuln_exploit',
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    description: '2名队友本回合渗透+2',
    flavorText: '双管齐下，突破防线',
    cost: { compute: 2, funds: 0, information: 0, access: 0 },
    difficulty: 4,
    effects: [
      {
        type: 'infiltration_gain',
        target: 'team',
        baseValue: 2,
        description: '所有队友渗透等级+2',
      },
    ],
    teamEffect: true,
    targetTeam: 'attacker',
    techLevel: 2,
  },
  {
    card_code: '2V2-C03',
    name: '信息战网络',
    type: 'advanced_attack',
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    description: '对方团队信息-2',
    flavorText: '切断敌方信息链路',
    cost: { compute: 0, funds: 0, information: 2, access: 0 },
    difficulty: 3,
    effects: [
      {
        type: 'resource_steal',
        target: 'enemy_team',
        value: 2,
        resourceType: 'information',
        description: '对方团队失去2点信息',
      },
    ],
    teamEffect: true,
    targetTeam: 'defender',
    techLevel: 2,
  },
  {
    card_code: '2V2-C04',
    name: '全面入侵',
    type: 'total_control',
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    description: '2名队友同时渗透+5',
    flavorText: '总攻时刻，全面突破！',
    cost: { compute: 5, funds: 3, information: 0, access: 0 },
    difficulty: 5,
    effects: [
      {
        type: 'infiltration_gain',
        target: 'team',
        baseValue: 5,
        description: '所有队友渗透等级+5',
      },
    ],
    teamEffect: true,
    targetTeam: 'attacker',
    techLevel: 5,
  },
  {
    card_code: '2V2-C05',
    name: '协同攻击',
    type: 'privilege_escalation',
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    description: '2名队友同时攻击同一名敌人，伤害+3',
    flavorText: '配合无间，一击必杀',
    cost: { compute: 3, funds: 2, information: 0, access: 0 },
    difficulty: 4,
    effects: [
      {
        type: 'security_reduce',
        target: 'opponent',
        baseValue: 3,
        description: '协同攻击，伤害+3',
      },
    ],
    teamEffect: true,
    targetTeam: 'defender',
    techLevel: 3,
  },
];

// 防御方团队卡牌
export const TEAM_DEFENDER_CARDS: TeamBattleCard[] = [
  {
    card_code: '2V2-C06',
    name: '团队安全加固',
    type: 'basic_defense',
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    description: '整个团队获得安全+2',
    flavorText: '团队防御，固若金汤',
    cost: { compute: 0, funds: 0, information: 0, access: 0 },
    difficulty: 3,
    effects: [
      {
        type: 'security_gain',
        target: 'team',
        baseValue: 2,
        description: '所有队友安全等级+2',
      },
    ],
    teamEffect: true,
    targetTeam: 'defender',
    techLevel: 1,
  },
  {
    card_code: '2V2-C07',
    name: '联合防御',
    type: 'intrusion_detection',
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    description: '2名队友本回合防御效果+2',
    flavorText: '守望相助，共御强敌',
    cost: { compute: 2, funds: 0, information: 0, access: 0 },
    difficulty: 4,
    effects: [
      {
        type: 'protection',
        target: 'team',
        protectionType: 'team_defense',
        description: '所有队友防御效果+2',
      },
    ],
    teamEffect: true,
    targetTeam: 'defender',
    techLevel: 2,
  },
  {
    card_code: '2V2-C08',
    name: '反间谍网络',
    type: 'active_defense',
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    description: '对方团队信息-2',
    flavorText: '识破阴谋，反制敌谍',
    cost: { compute: 0, funds: 0, information: 2, access: 0 },
    difficulty: 3,
    effects: [
      {
        type: 'resource_steal',
        target: 'enemy_team',
        value: 2,
        resourceType: 'information',
        description: '对方团队失去2点信息',
      },
    ],
    teamEffect: true,
    targetTeam: 'attacker',
    techLevel: 2,
  },
  {
    card_code: '2V2-C09',
    name: '绝对防御阵线',
    type: 'absolute_security',
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    description: '2名队友同时安全+5',
    flavorText: '铜墙铁壁，坚不可摧！',
    cost: { compute: 5, funds: 3, information: 0, access: 0 },
    difficulty: 5,
    effects: [
      {
        type: 'security_gain',
        target: 'team',
        baseValue: 5,
        description: '所有队友安全等级+5',
      },
    ],
    teamEffect: true,
    targetTeam: 'defender',
    techLevel: 5,
  },
  {
    card_code: '2V2-C10',
    name: '协同防御',
    type: 'defense_in_depth',
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    description: '当队友受到攻击时，可以共同承担伤害',
    flavorText: '同舟共济，共渡难关',
    cost: { compute: 3, funds: 2, information: 0, access: 0 },
    difficulty: 4,
    effects: [
      {
        type: 'protection',
        target: 'team',
        protectionType: 'damage_sharing',
        description: '队友受到攻击时共同承担伤害',
      },
    ],
    teamEffect: true,
    targetTeam: 'defender',
    techLevel: 3,
  },
];

// 所有团队卡牌
export const ALL_TEAM_BATTLE_CARDS: TeamBattleCard[] = [
  ...TEAM_ATTACKER_CARDS,
  ...TEAM_DEFENDER_CARDS,
];

// 根据ID获取团队卡牌
export function getTeamBattleCardById(cardCode: string): TeamBattleCard | undefined {
  return ALL_TEAM_BATTLE_CARDS.find(card => card.card_code === cardCode);
}

// 获取阵营专属卡牌
export function getTeamCardsByFaction(faction: 'attacker' | 'defender'): TeamBattleCard[] {
  return faction === 'attacker' ? TEAM_ATTACKER_CARDS : TEAM_DEFENDER_CARDS;
}

export default ALL_TEAM_BATTLE_CARDS;
