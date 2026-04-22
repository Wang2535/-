import { SKILL_PROBABILITIES, DEFAULT_SKILL_CONFIG } from '../constants/skillProbabilities';
import { SKILL_DATABASE, getRandomSkill } from '../data/skillDatabase';
import type { Skill, SkillQuality, SkillTriggerType } from '../types/skill.types';
import type { SkillManagerConfig } from '../types/skill.types';

// 技能管理器
export class SkillManager {
  private activeSkills: Skill[] = [];
  private skillStorage: Skill[] = [];
  private config: SkillManagerConfig;
  private mapSkillCooldowns: Map<string, number> = new Map(); // 地图技能冷却

  constructor(config?: Partial<SkillManagerConfig>) {
    this.config = { ...DEFAULT_SKILL_CONFIG, ...config };
  }

  // 获取当前激活的技能
  getActiveSkills(): Skill[] {
    return [...this.activeSkills];
  }

  // 获取技能仓库
  getSkillStorage(): Skill[] {
    return [...this.skillStorage];
  }

  // 获取随机技能（根据层级）
  getRandomSkill(layer: number): Skill {
    // 获取该层级的概率配置
    const probabilities = SKILL_PROBABILITIES[layer] || SKILL_PROBABILITIES[1];
    
    // 随机选择品质
    const quality = this.rollQuality(probabilities);
    
    // 获取该品质的技能
    const skill = this.getSkillByQuality(quality);
    
    return skill;
  }

  // 添加技能（自动处理满槽情况）
  addSkill(skill: Skill): { added: boolean; requiresSelection: boolean; newSkill: Skill } {
    // 检查技能槽是否已满
    if (this.activeSkills.length < this.config.maxActiveSkills) {
      this.activeSkills.push(skill);
      return { added: true, requiresSelection: false, newSkill: skill };
    }
    
    // 技能槽已满，需要用户选择
    return { added: false, requiresSelection: true, newSkill: skill };
  }

  // 替换技能
  replaceSkill(oldSkillId: string, newSkill: Skill): boolean {
    const index = this.activeSkills.findIndex(s => s.id === oldSkillId);
    if (index !== -1) {
      const oldSkill = this.activeSkills[index];
      this.skillStorage.push(oldSkill);
      this.activeSkills[index] = newSkill;
      return true;
    }
    return false;
  }

  // 从仓库中交换技能
  swapSkill(activeSkillId: string, storageSkillId: string): boolean {
    const activeIndex = this.activeSkills.findIndex(s => s.id === activeSkillId);
    const storageIndex = this.skillStorage.findIndex(s => s.id === storageSkillId);
    
    if (activeIndex !== -1 && storageIndex !== -1) {
      const activeSkill = this.activeSkills[activeIndex];
      const storageSkill = this.skillStorage[storageIndex];
      
      this.activeSkills[activeIndex] = storageSkill;
      this.skillStorage[storageIndex] = activeSkill;
      
      return true;
    }
    
    return false;
  }

  // 根据触发类型获取技能
  getSkillsByTrigger(triggerType: SkillTriggerType): Skill[] {
    return this.activeSkills.filter(s => s.triggerType === triggerType);
  }

  // 获取被动技能
  getPassiveSkills(): Skill[] {
    return this.getSkillsByTrigger('passive');
  }

  // 计算所有被动技能的总效果
  getPassiveEffects(): Record<string, any> {
    const effects: Record<string, any> = {};
    
    this.getPassiveSkills().forEach(skill => {
      this.parseSkillEffects(skill, effects);
    });

    // 特殊技能：无限潜能增加技能槽
    const hasUnlimitedPotential = this.activeSkills.some(s => s.name.includes('无限潜能') || s.name.includes('Unlimited'));
    if (hasUnlimitedPotential) {
      effects.skillSlotBonus = 1;
    }
    
    return effects;
  }

  // 解析技能效果
  private parseSkillEffects(skill: Skill, effects: Record<string, any>): void {
    const desc = skill.effectDescription;
    
    // 安全等级加成
    if (desc.includes('安全等级') && desc.includes('+')) {
      const match = desc.match(/\+(\d+)/);
      if (match) {
        const bonus = parseInt(match[1]);
        effects.safetyLevelBonus = (effects.safetyLevelBonus || 0) + bonus;
      }
    }
    
    // 伤害减免
    if (desc.includes('伤害') && desc.includes('减免')) {
      const match = desc.match(/(\d+)%/);
      if (match) {
        const reduction = parseInt(match[1]);
        effects.damageReduction = (effects.damageReduction || 0) + reduction;
      }
    }
    
    // 骰子修正
    if (desc.includes('骰子') || desc.includes('轻装上阵')) {
      const minMatch = desc.match(/最低点数为(\d+)/);
      if (minMatch) {
        effects.minDiceRoll = parseInt(minMatch[1]);
      }
      const diceBonusMatch = desc.match(/骰子点数\+(\d+)/);
      if (diceBonusMatch) {
        effects.diceBonus = (effects.diceBonus || 0) + parseInt(diceBonusMatch[1]);
      }
    }
    
    // 技能效果增益
    if (desc.includes('技能效果')) {
      const match = desc.match(/(\d+)%/);
      if (match) {
        effects.skillEffectBonus = (effects.skillEffectBonus || 0) + parseInt(match[1]);
      }
    }
    
    // 临时护盾
    if (desc.includes('护盾')) {
      const match = desc.match(/\+(\d+)/);
      if (match) {
        effects.shieldBonus = (effects.shieldBonus || 0) + parseInt(match[1]);
      }
    }
  }

  // === 技能冷却系统 ===

  // 获取技能当前冷却
  getSkillCooldown(skillId: string): number {
    return this.mapSkillCooldowns.get(skillId) || 0;
  }

  // 检查技能是否可用
  isSkillReady(skillId: string): boolean {
    return this.getSkillCooldown(skillId) <= 0;
  }

  // 使用主动技能
  useSkill(skillId: string): boolean {
    const skill = this.activeSkills.find(s => s.id === skillId);
    if (!skill || !this.isSkillReady(skillId)) {
      return false;
    }
    
    if (skill.cooldown) {
      this.mapSkillCooldowns.set(skillId, skill.cooldown);
    }
    return true;
  }

  // 重置所有战斗技能冷却（战斗结束时）
  resetBattleSkillCooldowns(): void {
    // 只重置战斗相关的技能冷却，地图技能冷却保留
    this.activeSkills.forEach(skill => {
      if (skill.triggerType !== 'map_trigger') {
        this.mapSkillCooldowns.set(skill.id, 0);
      }
    });
  }

  // 进入新层时更新地图技能冷却
  updateMapSkillCooldownsForNewLayer(): void {
    this.mapSkillCooldowns.forEach((cooldown, skillId) => {
      if (cooldown > 0) {
        this.mapSkillCooldowns.set(skillId, cooldown - 1);
      }
    });
  }

  // 重置特定技能冷却
  resetSkillCooldown(skillId: string): void {
    this.mapSkillCooldowns.set(skillId, 0);
  }

  // 内部：根据概率随机选择品质
  private rollQuality(probabilities: { common: number; good: number; rare: number; epic: number; legendary: number }): SkillQuality {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    // 从高品质到低品质检查
    const qualityOrder: { quality: SkillQuality; probability: number }[] = [
      { quality: 'legendary', probability: probabilities.legendary },
      { quality: 'epic', probability: probabilities.epic },
      { quality: 'rare', probability: probabilities.rare },
      { quality: 'good', probability: probabilities.good },
      { quality: 'common', probability: probabilities.common },
    ];
    
    // 转换为百分比
    const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
    const normalizedProbabilities = qualityOrder.map(q => ({
      quality: q.quality,
      probability: (q.probability / total) * 100
    }));
    
    for (const { quality, probability } of normalizedProbabilities) {
      cumulative += probability;
      if (roll < cumulative) {
        return quality;
      }
    }
    
    return 'common'; // 默认返回普通品质
  }

  // 内部：获取特定品质的技能
  private getSkillByQuality(quality: SkillQuality): Skill {
    const skills = SKILL_DATABASE.filter(s => s.quality === quality);
    
    if (skills.length > 0) {
      return { ...skills[Math.floor(Math.random() * skills.length)], id: `skill-${Date.now()}-${Math.random()}` };
    }
    
    // 如果没有该品质的技能，回退到普通品质
    const commonSkills = SKILL_DATABASE.filter(s => s.quality === 'common');
    return { ...commonSkills[0], id: `skill-${Date.now()}-${Math.random()}` };
  }
}

// 默认导出实例
export const defaultSkillManager = new SkillManager();
