/**
 * 判定修正系统 (R6.3)
 * 
 * 实现完善的游戏规则.md中R6.3判定修正规则：
 * - 科技修正：科技等级÷2
 * - 区域修正：优势区域+1，劣势区域-1
 * - 卡牌修正：部分卡牌提供判定修正
 * 
 * 文档版本: v1.0.0
 * 最后更新: 2026-02-07
 */

import type { Card } from '@/types/legacy/game';
import { gameLogger } from './GameLogger';

// ============================================
// 科技等级类型
// ============================================

export type TechLevel = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/** 科技等级数值映射 */
export const TECH_LEVEL_VALUES: Record<TechLevel, number> = {
  'T0': 0,
  'T1': 1,
  'T2': 2,
  'T3': 3,
  'T4': 4,
  'T5': 5,
};

// ============================================
// 区域类型
// ============================================

export type GameArea = 'A' | 'B' | 'C' | 'D';

/** 阵营类型 */
export type Faction = 'attacker' | 'defender';

/** 区域优势映射表 - 根据R3.1 */
export const AREA_ADVANTAGE: Record<GameArea, Faction> = {
  'A': 'attacker',  // 区域A：攻击方优势
  'B': 'attacker',  // 区域B：攻击方优势
  'C': 'defender',  // 区域C：防守方优势
  'D': 'defender',  // 区域D：防守方优势
};

// ============================================
// 修正类型
// ============================================

/** 修正类型 */
export type ModifierType = 
  | 'tech'      // 科技修正
  | 'area'      // 区域修正
  | 'card'      // 卡牌修正
  | 'character' // 角色技能修正
  | 'aura'      // 光环效果修正
  | 'combo';    // 连击效果修正

/** 单个修正项 */
export interface CheckModifier {
  /** 修正类型 */
  type: ModifierType;
  /** 修正值（可为正负） */
  value: number;
  /** 修正来源 */
  source: string;
  /** 修正描述 */
  description: string;
}

/** 判定修正计算结果 */
export interface CheckModifierResult {
  /** 基础判定值 */
  baseValue: number;
  /** 所有修正项 */
  modifiers: CheckModifier[];
  /** 总修正值 */
  totalModifier: number;
  /** 最终判定值 */
  finalValue: number;
  /** 详细计算过程 */
  calculationDetails: string;
}

/** 判定修正配置 */
export interface ModifierConfig {
  /** 是否启用科技修正 */
  enableTechModifier: boolean;
  /** 是否启用区域修正 */
  enableAreaModifier: boolean;
  /** 是否启用卡牌修正 */
  enableCardModifier: boolean;
  /** 修正值上限 */
  maxModifier: number;
  /** 修正值下限 */
  minModifier: number;
}

// ============================================
// 默认配置
// ============================================

export const DEFAULT_MODIFIER_CONFIG: ModifierConfig = {
  enableTechModifier: true,
  enableAreaModifier: true,
  enableCardModifier: true,
  maxModifier: 10,
  minModifier: -10,
};

// ============================================
// 判定修正系统
// ============================================

export class CheckModifierSystem {
  private static config: ModifierConfig = { ...DEFAULT_MODIFIER_CONFIG };

  /**
   * 设置修正配置
   */
  static setConfig(config: Partial<ModifierConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  static getConfig(): ModifierConfig {
    return { ...this.config };
  }

  /**
   * 重置配置为默认值
   */
  static resetConfig(): void {
    this.config = { ...DEFAULT_MODIFIER_CONFIG };
  }

  /**
   * 计算科技修正值
   * 规则：科技等级÷2（向下取整）
   * @param techLevel 科技等级
   */
  static calculateTechModifier(techLevel: TechLevel): CheckModifier | null {
    if (!this.config.enableTechModifier) return null;

    const levelValue = TECH_LEVEL_VALUES[techLevel];
    const modifierValue = Math.floor(levelValue / 2);

    return {
      type: 'tech',
      value: modifierValue,
      source: `科技等级${techLevel}`,
      description: `科技等级${techLevel}(${levelValue})÷2 = ${modifierValue}`,
    };
  }

  /**
   * 计算区域修正值
   * 规则：优势区域+1，劣势区域-1
   * @param area 区域
   * @param faction 阵营
   */
  static calculateAreaModifier(area: GameArea, faction: Faction): CheckModifier | null {
    if (!this.config.enableAreaModifier) return null;

    const advantageFaction = AREA_ADVANTAGE[area];
    const isAdvantage = advantageFaction === faction;
    const modifierValue = isAdvantage ? 1 : -1;

    return {
      type: 'area',
      value: modifierValue,
      source: `区域${area}`,
      description: isAdvantage 
        ? `区域${area}为${faction}优势区域 (+1)`
        : `区域${area}为${faction}劣势区域 (-1)`,
    };
  }

  /**
   * 从卡牌中提取判定修正
   * @param cards 卡牌列表
   */
  static calculateCardModifier(cards: Card[]): CheckModifier[] {
    if (!this.config.enableCardModifier) return [];

    const modifiers: CheckModifier[] = [];

    for (const card of cards) {
      // 检查卡牌效果中是否有判定修正
      const cardModifier = this.extractModifierFromCard(card);
      if (cardModifier) {
        modifiers.push(cardModifier);
      }
    }

    return modifiers;
  }

  /**
   * 从单张卡牌提取判定修正
   * @param card 卡牌
   */
  private static extractModifierFromCard(card: Card): CheckModifier | null {
    // 检查卡牌效果描述中是否包含判定修正关键词
    // 优先使用effect_text，否则拼接effects数组
    const effectText = (card.effect_text || 
      card.effects?.map(e => e.detail).join(' ') || 
      '').toLowerCase();
    
    // 匹配 "判定+数字" 或 "判定-数字" 模式
    const modifierMatch = effectText.match(/判定\s*([+-]\d+)/);
    if (modifierMatch) {
      const value = parseInt(modifierMatch[1], 10);
      return {
        type: 'card',
        value,
        source: card.name,
        description: `${card.name}提供判定修正${value > 0 ? '+' : ''}${value}`,
      };
    }

    // 匹配 "骰子+数字" 模式
    const diceMatch = effectText.match(/骰子\s*([+-]\d+)/);
    if (diceMatch) {
      const value = parseInt(diceMatch[1], 10);
      return {
        type: 'card',
        value,
        source: card.name,
        description: `${card.name}提供骰子判定修正${value > 0 ? '+' : ''}${value}`,
      };
    }

    // 检查是否是光环卡牌（通过tags判断）
    if (card.tags?.includes('aura') || effectText.includes('光环')) {
      // 光环卡牌通常提供+1判定修正
      return {
        type: 'aura',
        value: 1,
        source: card.name,
        description: `${card.name}(光环)提供判定修正+1`,
      };
    }

    return null;
  }

  /**
   * 计算完整的判定修正
   * @param baseValue 基础判定值
   * @param context 修正上下文
   */
  static calculateModifiers(
    baseValue: number,
    context: {
      techLevel: TechLevel;
      area: GameArea;
      faction: Faction;
      cards?: Card[];
      characterModifier?: number;
      comboModifier?: number;
    }
  ): CheckModifierResult {
    const modifiers: CheckModifier[] = [];

    // 1. 科技修正
    const techModifier = this.calculateTechModifier(context.techLevel);
    if (techModifier) {
      modifiers.push(techModifier);
    }

    // 2. 区域修正
    const areaModifier = this.calculateAreaModifier(context.area, context.faction);
    if (areaModifier) {
      modifiers.push(areaModifier);
    }

    // 3. 卡牌修正
    if (context.cards && context.cards.length > 0) {
      const cardModifiers = this.calculateCardModifier(context.cards);
      modifiers.push(...cardModifiers);
    }

    // 4. 角色技能修正
    if (context.characterModifier && context.characterModifier !== 0) {
      modifiers.push({
        type: 'character',
        value: context.characterModifier,
        source: '角色技能',
        description: `角色技能提供判定修正${context.characterModifier > 0 ? '+' : ''}${context.characterModifier}`,
      });
    }

    // 5. 连击修正
    if (context.comboModifier && context.comboModifier !== 0) {
      modifiers.push({
        type: 'combo',
        value: context.comboModifier,
        source: '连击效果',
        description: `连击效果提供判定修正${context.comboModifier > 0 ? '+' : ''}${context.comboModifier}`,
      });
    }

    // 计算总修正值
    const totalModifier = modifiers.reduce((sum, mod) => sum + mod.value, 0);
    
    // 应用修正限制
    const clampedModifier = Math.max(
      this.config.minModifier,
      Math.min(this.config.maxModifier, totalModifier)
    );

    const finalValue = baseValue + clampedModifier;

    // 生成计算详情
    const calculationDetails = this.generateCalculationDetails(
      baseValue,
      modifiers,
      clampedModifier,
      finalValue
    );

    const result: CheckModifierResult = {
      baseValue,
      modifiers,
      totalModifier: clampedModifier,
      finalValue,
      calculationDetails,
    };

    // 记录日志
    gameLogger.info('dice_check', `判定修正计算完成`, {
      extra: {
        baseValue,
        modifiers: modifiers.map(m => ({ type: m.type, value: m.value, source: m.source })),
        totalModifier: clampedModifier,
        finalValue,
      }
    });

    return result;
  }

  /**
   * 生成计算详情文本
   */
  private static generateCalculationDetails(
    baseValue: number,
    modifiers: CheckModifier[],
    totalModifier: number,
    finalValue: number
  ): string {
    const lines: string[] = [
      `【判定修正计算】`,
      `基础值: ${baseValue}`,
    ];

    if (modifiers.length > 0) {
      lines.push(`修正项:`);
      for (const mod of modifiers) {
        lines.push(`  ${mod.source}: ${mod.value > 0 ? '+' : ''}${mod.value}`);
      }
    } else {
      lines.push(`修正项: 无`);
    }

    lines.push(`总修正: ${totalModifier > 0 ? '+' : ''}${totalModifier}`);
    lines.push(`最终值: ${finalValue}`);

    return lines.join('\n');
  }

  /**
   * 快速计算判定修正（简化版）
   * @param baseValue 基础值
   * @param techLevel 科技等级
   * @param area 区域
   * @param faction 阵营
   */
  static quickCalculate(
    baseValue: number,
    techLevel: TechLevel,
    area: GameArea,
    faction: Faction
  ): number {
    const result = this.calculateModifiers(baseValue, {
      techLevel,
      area,
      faction,
    });
    return result.finalValue;
  }

  /**
   * 获取区域优势描述
   * @param area 区域
   */
  static getAreaAdvantageDescription(area: GameArea): string {
    const advantageFaction = AREA_ADVANTAGE[area];
    return `区域${area}: ${advantageFaction === 'attacker' ? '攻击方' : '防守方'}优势 (+1判定)`;
  }

  /**
   * 获取科技修正表
   */
  static getTechModifierTable(): { techLevel: TechLevel; modifier: number }[] {
    const techLevels: TechLevel[] = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];
    return techLevels.map(level => ({
      techLevel: level,
      modifier: Math.floor(TECH_LEVEL_VALUES[level] / 2),
    }));
  }

  /**
   * 获取完整的判定修正规则说明
   */
  static getModifierRulesDescription(): string {
    const techTable = this.getTechModifierTable();
    
    return `
【判定修正规则 R6.3】
━━━━━━━━━━━━━━━━━━━━
🧪 科技修正:
${techTable.map(t => `   ${t.techLevel}: +${t.modifier}`).join('\n')}

🗺️ 区域修正:
   区域A: 攻击方优势 (+1) / 防守方劣势 (-1)
   区域B: 攻击方优势 (+1) / 防守方劣势 (-1)
   区域C: 防守方优势 (+1) / 攻击方劣势 (-1)
   区域D: 防守方优势 (+1) / 攻击方劣势 (-1)

🎴 卡牌修正:
   部分卡牌提供额外的判定修正
   光环卡牌通常提供+1判定修正

📊 计算顺序:
   1. 基础判定值
   2. + 科技修正 (等级÷2)
   3. + 区域修正 (优势+1/劣势-1)
   4. + 卡牌修正
   5. + 角色技能修正
   6. + 连击效果修正
━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}

// ============================================
// 便捷导出
// ============================================

export const checkModifierSystem = CheckModifierSystem;
export default CheckModifierSystem;
