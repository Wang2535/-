import { SKILL_PROBABILITIES, DEFAULT_SKILL_CONFIG } from '../constants/skillProbabilities';
import { SKILL_DATABASE, getRandomSkill } from '../data/skillDatabase';
import type { Skill, SkillQuality, SkillTriggerType } from '../types/skill.types';
import type { SkillManagerConfig } from '../types/skill.types';

// 技能管理器
export class SkillManager {
  private activeSkills: Skill[] = [];
  private skillStorage: Skill[] = [];
  private config: SkillManagerConfig;

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
      // 这里简化处理，实际游戏中需要根据具体技能效果计算
      if (skill.effectDescription.includes('安全等级')) {
        const match = skill.effectDescription.match(/\+(\d+)/);
        if (match) {
          const bonus = parseInt(match[1]);
          effects.safetyLevelBonus = (effects.safetyLevelBonus || 0) + bonus;
        }
      }
      if (skill.effectDescription.includes('伤害')) {
        const match = skill.effectDescription.match(/(\d+)%/);
        if (match) {
          const reduction = parseInt(match[1]);
          effects.damageReduction = (effects.damageReduction || 0) + reduction;
        }
      }
    });
    
    return effects;
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
