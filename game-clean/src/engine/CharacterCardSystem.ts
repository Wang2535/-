/**
 * 《道高一丈：数字博弈》v17.0 - 角色专属卡牌系统
 * 
 * 实现规则文档：完善的角色规则.md 第三章 专属卡牌机制角色
 * 
 * 核心功能：
 * 1. 角色专属卡牌池管理（AS01-AS03）
 * 2. 专属卡牌效果实现
 * 3. 角色与专属卡牌的绑定
 * 4. 游戏开始时自动添加专属卡牌到牌库
 */

import type { Card, CardEffect, CardRarity, CardType, Faction } from '@/types/legacy/card_v16';

/** 角色ID类型 */
export type CharacterId = 
  | 'AR01' | 'AR02' | 'AR03'  // 猜拳判定系
  | 'AC01' | 'AC02' | 'AC03'  // 骰子判定系
  | 'AS01' | 'AS02' | 'AS03'; // 专属卡牌系

/** 专属卡牌定义 */
export interface CharacterCard extends Card {
  characterId: CharacterId;  // 所属角色
  isExclusive: true;         // 标记为专属卡牌
}

// ============================================
// AS01 卡组构筑师·牌库掌控者 专属卡牌
// ============================================

const AS01_CARDS: CharacterCard[] = [
  {
    card_code: 'AS01-S01',
    name: '牌库检索（Deck Search）',
    description: '消耗：算力1；效果：从牌库检索任意1张卡牌加入手牌；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1,
    cost: { compute: 1 },
    difficulty: 1,
    effects: [
      { type: 'draw', value: 1, target: 'self', description: '从牌库检索1张卡牌' }
    ] as CardEffect[],
    characterId: 'AS01',
    isExclusive: true,
  },
  {
    card_code: 'AS01-S02',
    name: '连锁反应（Chain Reaction）',
    description: '消耗：信息1；效果：本回合已使用卡牌数×1渗透；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2,
    cost: { information: 1 },
    difficulty: 2,
    effects: [
      { type: 'infiltration_gain', baseValue: 0, description: '本回合已使用卡牌数×1渗透' }
    ] as CardEffect[],
    characterId: 'AS01',
    isExclusive: true,
  },
  {
    card_code: 'AS01-S03',
    name: '卡牌调和（Card Harmony）',
    description: '消耗：算力1,信息1；效果：弃置任意数量手牌，每弃1张抽1张；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1,
    cost: { compute: 1, information: 1 },
    difficulty: 2,
    effects: [
      { type: 'discard', value: 1, target: 'self', description: '弃置手牌' },
      { type: 'draw', value: 1, target: 'self', description: '每弃1张抽1张' }
    ] as CardEffect[],
    characterId: 'AS01',
    isExclusive: true,
  },
  {
    card_code: 'AS01-S04',
    name: '完美构筑（Perfect Build）',
    description: '消耗：算力2,信息2,资金1；效果：从牌库选择3张卡牌，按任意顺序置于牌库顶；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 4,
    cost: { compute: 2, information: 2, funds: 1 },
    difficulty: 3,
    effects: [
      { type: 'draw', value: 3, target: 'self', description: '从牌库选择3张卡牌' }
    ] as CardEffect[],
    characterId: 'AS01',
    isExclusive: true,
  },
];

// ============================================
// AS02 资源调配师·能量核心 专属卡牌
// ============================================

const AS02_CARDS: CharacterCard[] = [
  {
    card_code: 'AS02-S01',
    name: '资源调配（Resource Allocation）',
    description: '消耗：无；效果：将2点任意资源转化为1点其他资源；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1,
    cost: {},
    difficulty: 1,
    effects: [
      { type: 'resource_gain', resourceType: 'compute', value: 0, description: '资源转化' }
    ] as CardEffect[],
    characterId: 'AS02',
    isExclusive: true,
  },
  {
    card_code: 'AS02-S02',
    name: '能量汲取（Energy Drain）',
    description: '消耗：信息1；效果：对方损失2点资源，你获得1点同类型资源；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2,
    cost: { information: 1 },
    difficulty: 2,
    effects: [
      { type: 'resource_steal', resourceType: 'compute', value: 1, target: 'opponent', description: '窃取对方资源' }
    ] as CardEffect[],
    characterId: 'AS02',
    isExclusive: true,
  },
  {
    card_code: 'AS02-S03',
    name: '能量共鸣（Energy Resonance）',
    description: '消耗：算力1；效果：每拥有2点算力，额外获得1点算力；触发：出牌时',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2,
    cost: { compute: 1 },
    difficulty: 2,
    effects: [
      { type: 'resource_gain', resourceType: 'compute', value: 0, description: '根据现有算力获得额外算力' }
    ] as CardEffect[],
    characterId: 'AS02',
    isExclusive: true,
  },
  {
    card_code: 'AS02-S04',
    name: '能量爆发（Energy Burst）',
    description: '消耗：所有算力；效果：每消耗1点算力，渗透+1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 4,
    cost: { compute: 5 }, // 动态消耗，实际使用时计算
    difficulty: 3,
    effects: [
      { type: 'infiltration_gain', baseValue: 0, description: '每消耗1点算力，渗透+1' }
    ] as CardEffect[],
    characterId: 'AS02',
    isExclusive: true,
  },
];

// ============================================
// AS03 战术指挥官·战场统帅 专属卡牌
// ============================================

const AS03_CARDS: CharacterCard[] = [
  {
    card_code: 'AS03-S01',
    name: '快速部署（Rapid Deployment）',
    description: '消耗：算力1；效果：在任意区域放置2个标记；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1,
    cost: { compute: 1 },
    difficulty: 1,
    effects: [
      { type: 'infiltration_gain', baseValue: 2, description: '在任意区域放置2个标记' }
    ] as CardEffect[],
    characterId: 'AS03',
    isExclusive: true,
  },
  {
    card_code: 'AS03-S02',
    name: '区域封锁（Area Lockdown）',
    description: '消耗：信息1；效果：选择1个区域，对方本回合无法在该区域放置标记；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2,
    cost: { information: 1 },
    difficulty: 2,
    effects: [
      { type: 'protection', protectionType: 'area_lockdown', duration: 1, description: '区域封锁' }
    ] as CardEffect[],
    characterId: 'AS03',
    isExclusive: true,
  },
  {
    card_code: 'AS03-S03',
    name: '战术转移（Tactical Shift）',
    description: '消耗：算力1,信息1；效果：将1个区域的己方标记移动到另1个区域；触发：出牌时',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2,
    cost: { compute: 1, information: 1 },
    difficulty: 2,
    effects: [
      { type: 'infiltration_gain', baseValue: 0, description: '移动标记' }
    ] as CardEffect[],
    characterId: 'AS03',
    isExclusive: true,
  },
  {
    card_code: 'AS03-S04',
    name: '全面进攻（All-out Attack）',
    description: '消耗：算力2,信息2,资金1；效果：在所有区域各放置1个标记；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 4,
    cost: { compute: 2, information: 2, funds: 1 },
    difficulty: 4,
    effects: [
      { type: 'infiltration_gain', baseValue: 4, description: '在所有区域各放置1个标记' }
    ] as CardEffect[],
    characterId: 'AS03',
    isExclusive: true,
  },
];

// ============================================
// 角色专属卡牌数据库
// ============================================

/** 所有角色专属卡牌映射 */
export const CHARACTER_CARD_DATABASE: Record<CharacterId, CharacterCard[]> = {
  'AS01': AS01_CARDS,
  'AS02': AS02_CARDS,
  'AS03': AS03_CARDS,
  'AR01': [],
  'AR02': [],
  'AR03': [],
  'AC01': [],
  'AC02': [],
  'AC03': [],
};

/** 所有专属卡牌列表 */
export const ALL_CHARACTER_CARDS: CharacterCard[] = [
  ...AS01_CARDS,
  ...AS02_CARDS,
  ...AS03_CARDS,
];

/** 专属卡牌代码到卡牌的映射 */
export const CHARACTER_CARD_MAP: Record<string, CharacterCard> = {};
ALL_CHARACTER_CARDS.forEach(card => {
  CHARACTER_CARD_MAP[card.card_code] = card;
});

// ============================================
// 角色专属卡牌系统
// ============================================

export class CharacterCardSystem {
  /**
   * 获取角色的专属卡牌
   */
  static getCharacterCards(characterId: CharacterId): CharacterCard[] {
    return CHARACTER_CARD_DATABASE[characterId] || [];
  }

  /**
   * 检查角色是否有专属卡牌
   */
  static hasExclusiveCards(characterId: CharacterId): boolean {
    const cards = this.getCharacterCards(characterId);
    return cards.length > 0;
  }

  /**
   * 获取角色专属卡牌数量
   */
  static getExclusiveCardCount(characterId: CharacterId): number {
    return this.getCharacterCards(characterId).length;
  }

  /**
   * 根据卡牌代码获取专属卡牌
   */
  static getCardByCode(cardCode: string): CharacterCard | null {
    return CHARACTER_CARD_MAP[cardCode] || null;
  }

  /**
   * 检查卡牌是否为专属卡牌
   */
  static isCharacterCard(cardCode: string): boolean {
    return cardCode in CHARACTER_CARD_MAP;
  }

  /**
   * 获取角色的起始牌库（包含专属卡牌）
   * 
   * @param characterId 角色ID
   * @param baseDeck 基础牌库
   * @returns 包含专属卡牌的起始牌库
   */
  static getStartingDeck(characterId: CharacterId, baseDeck: Card[] = []): Card[] {
    const exclusiveCards = this.getCharacterCards(characterId);
    
    if (exclusiveCards.length === 0) {
      return baseDeck;
    }

    // 将专属卡牌添加到牌库
    return [...baseDeck, ...exclusiveCards];
  }

  /**
   * 获取所有专属卡牌统计信息
   */
  static getCharacterCardStats(): {
    totalExclusiveCards: number;
    byCharacter: Record<CharacterId, number>;
    byRarity: Record<CardRarity, number>;
  } {
    const byCharacter: Record<string, number> = {};
    const byRarity: Record<CardRarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };

    for (const [charId, cards] of Object.entries(CHARACTER_CARD_DATABASE)) {
      byCharacter[charId] = cards.length;
      
      for (const card of cards) {
        byRarity[card.rarity]++;
      }
    }

    return {
      totalExclusiveCards: ALL_CHARACTER_CARDS.length,
      byCharacter: byCharacter as Record<CharacterId, number>,
      byRarity
    };
  }
}

export default CharacterCardSystem;
