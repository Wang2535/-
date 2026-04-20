import { CORE_RESOURCES_CONFIG, CORE_RESOURCES_THRESHOLDS } from '../constants/coreResources';
import type { CoreResources } from '../types/player.types';

// 核心资源管理器
export class CoreResourcesManager {
  private resources: CoreResources;

  constructor(initialResources?: Partial<CoreResources>) {
    this.resources = {
      coreComputing: initialResources?.coreComputing ?? CORE_RESOURCES_CONFIG.coreComputing.initial,
      coreFunds: initialResources?.coreFunds ?? CORE_RESOURCES_CONFIG.coreFunds.initial,
      coreInformation: initialResources?.coreInformation ?? CORE_RESOURCES_CONFIG.coreInformation.initial,
      corePrivilege: initialResources?.corePrivilege ?? CORE_RESOURCES_CONFIG.corePrivilege.initial,
    };
  }

  // 获取当前资源
  getResources(): CoreResources {
    return { ...this.resources };
  }

  // 获取单个资源
  getResource(type: keyof CoreResources): number {
    return this.resources[type];
  }

  // 添加资源
  addResource(type: keyof CoreResources, amount: number): void {
    const max = CORE_RESOURCES_CONFIG[type].max;
    this.resources[type] = Math.min(max, this.resources[type] + amount);
  }

  // 消耗资源 - 成功返回true，资源不足返回false
  spendResource(type: keyof CoreResources, amount: number): boolean {
    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      return true;
    }
    return false;
  }

  // 检查是否有足够的资源
  hasEnough(type: keyof CoreResources, amount: number): boolean {
    return this.resources[type] >= amount;
  }

  // 资源交换（2:1）
  exchangeResources(from: keyof CoreResources, to: keyof CoreResources, amount: number): boolean {
    const exchangeCost = amount * 2;
    if (this.resources[from] >= exchangeCost) {
      this.resources[from] -= exchangeCost;
      this.addResource(to, amount);
      return true;
    }
    return false;
  }

  // 获取当前资源的阈值加成
  getThresholdBonuses() {
    const bonuses: Record<string, any> = {};
    
    Object.entries(CORE_RESOURCES_THRESHOLDS).forEach(([resourceType, thresholds]) => {
      const resourceAmount = this.resources[resourceType as keyof CoreResources];
      
      for (const threshold of thresholds) {
        if (resourceAmount >= threshold.threshold) {
          Object.assign(bonuses, threshold.bonus);
        }
      }
    });
    
    return bonuses;
  }

  // 重置资源（通常是进入新层时不会重置，这里保留完整性）
  reset(): void {
    this.resources = {
      coreComputing: CORE_RESOURCES_CONFIG.coreComputing.initial,
      coreFunds: CORE_RESOURCES_CONFIG.coreFunds.initial,
      coreInformation: CORE_RESOURCES_CONFIG.coreInformation.initial,
      corePrivilege: CORE_RESOURCES_CONFIG.corePrivilege.initial,
    };
  }
}

// 默认导出实例
export const defaultResourceManager = new CoreResourcesManager();
