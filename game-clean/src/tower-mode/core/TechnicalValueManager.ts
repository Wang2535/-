import { 
  TECHNICAL_VALUE_MILESTONES, 
  INITIAL_TECHNICAL_VALUE, 
  MAX_TECHNICAL_VALUE 
} from '../constants/coreResources';

// 技术值管理器 - 核心生存指标
export class TechnicalValueManager {
  private techValue: number;
  private currentMilestone: number = -1;
  private damageReduction: number = 0; // 伤害减免百分比
  private safetyLevelBonus: number = 0; // 安全等级加成
  private bonusAppliedAt: Record<number, boolean> = {}; // 记录已经应用过的里程碑奖励

  constructor(initialValue?: number) {
    this.techValue = initialValue ?? INITIAL_TECHNICAL_VALUE;
  }

  // 获取当前技术值
  getValue(): number {
    return this.techValue;
  }

  // 获取最大技术值
  getMaxValue(): number {
    return MAX_TECHNICAL_VALUE;
  }

  // 增加技术值
  addValue(amount: number): { newValue: number; newMilestones: number[] } {
    const oldValue = this.techValue;
    const newValue = Math.min(MAX_TECHNICAL_VALUE, this.techValue + amount);
    
    // 检查是否有新的里程碑
    const newMilestones: number[] = [];
    TECHNICAL_VALUE_MILESTONES.forEach((milestone, index) => {
      if (oldValue < milestone.threshold && newValue >= milestone.threshold) {
        newMilestones.push(index);
      }
    });
    
    this.techValue = newValue;
    return { newValue, newMilestones };
  }

  // 消耗技术值（失败时）- 先应用伤害减免
  spendValue(amount: number): { newValue: number; died: boolean } {
    const reductionAmount = Math.floor(amount * (this.damageReduction / 100));
    const actualSpend = amount - reductionAmount;
    
    const newValue = this.techValue - actualSpend;
    const died = newValue <= 0;
    
    if (died) {
      this.techValue = 0;
    } else {
      this.techValue = newValue;
    }
    
    return { newValue: this.techValue, died };
  }

  // 获取当前达到的最高里程碑
  getCurrentMilestone(): number {
    let maxMilestone = -1;
    TECHNICAL_VALUE_MILESTONES.forEach((milestone, index) => {
      if (this.techValue >= milestone.threshold) {
        maxMilestone = index;
      }
    });
    return maxMilestone;
  }

  // 获取里程碑奖励选项
  getMilestoneOptions(milestoneIndex: number): { type: string; description: string; effect: () => void }[] {
    // 这里提供6个选项供玩家选择
    const milestone = TECHNICAL_VALUE_MILESTONES[milestoneIndex];
    if (!milestone) return [];

    return [
      {
        type: 'bookstore',
        description: '立即触发书店格效果',
        effect: () => { /* 触发书店逻辑 */ }
      },
      {
        type: 'skill',
        description: '立即获得随机技能',
        effect: () => { /* 触发技能获取逻辑 */ }
      },
      {
        type: 'safety',
        description: '每场战斗安全等级初始+3',
        effect: () => { this.safetyLevelBonus += 3; }
      },
      {
        type: 'resources',
        description: '核心资源补给',
        effect: () => { /* 触发资源补给逻辑 */ }
      },
      {
        type: 'upgrade',
        description: '卡牌强化',
        effect: () => { /* 触发卡牌强化逻辑 */ }
      },
      {
        type: 'damage_reduction',
        description: '关卡失败时技术值扣除永久减少5%',
        effect: () => { this.damageReduction += 5; }
      }
    ];
  }

  // 应用伤害减免
  setDamageReduction(reduction: number): void {
    this.damageReduction = reduction;
  }

  getDamageReduction(): number {
    return this.damageReduction;
  }

  // 安全等级加成
  setSafetyLevelBonus(bonus: number): void {
    this.safetyLevelBonus = bonus;
  }

  getSafetyLevelBonus(): number {
    return this.safetyLevelBonus;
  }

  // 检查是否存活
  isAlive(): boolean {
    return this.techValue > 0;
  }

  // 重置
  reset(): void {
    this.techValue = INITIAL_TECHNICAL_VALUE;
    this.currentMilestone = -1;
    this.damageReduction = 0;
    this.safetyLevelBonus = 0;
    this.bonusAppliedAt = {};
  }
}

// 默认导出实例
export const defaultTechValueManager = new TechnicalValueManager();
