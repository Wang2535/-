import type { CoreResourcesConfig } from '../types/player.types';

// 完整设想中要求的核心资源初始值和上限
export const CORE_RESOURCES_CONFIG: CoreResourcesConfig = {
  coreComputing: { initial: 10, max: 999 },
  coreFunds: { initial: 15, max: 999 },
  coreInformation: { initial: 5, max: 999 },
  corePrivilege: { initial: 0, max: 99 },
};

// 核心资源阈值加成表 - 达到特定值时提供战斗内加成
export const CORE_RESOURCES_THRESHOLDS = {
  coreComputing: [
    { threshold: 50, bonus: { computingInitial: 1 } },
    { threshold: 150, bonus: { computingInitial: 2 } },
  ],
  coreFunds: [
    { threshold: 80, bonus: { fundsInitial: 1 } },
    { threshold: 200, bonus: { fundsInitial: 2 } },
  ],
  coreInformation: [
    { threshold: 30, bonus: { informationInitial: 1 } },
    { threshold: 100, bonus: { informationInitial: 2, seeHiddenOptions: true } },
  ],
  corePrivilege: [
    { threshold: 10, bonus: { privilegeInitial: 1 } },
    { threshold: 30, bonus: { privilegeInitial: 2, unlockPremiumItems: true } },
  ],
};

// 技术值里程碑（9个里程碑，每90点一个）
export const TECHNICAL_VALUE_MILESTONES = [
  { threshold: 90, rewardType: 'bookstore', description: '立即触发书店格效果' },
  { threshold: 180, rewardType: 'skill', description: '立即获得随机技能' },
  { threshold: 270, rewardType: 'safety_bonus', description: '每场战斗安全等级初始+3' },
  { threshold: 360, rewardType: 'resources', description: '核心资源补给' },
  { threshold: 450, rewardType: 'card_upgrade', description: '卡牌强化选项' },
  { threshold: 540, rewardType: 'damage_reduction', description: '关卡失败时技术值扣除永久减少5%' },
  { threshold: 630, rewardType: 'bookstore', description: '立即触发书店格效果' },
  { threshold: 720, rewardType: 'skill', description: '立即获得史诗技能' },
  { threshold: 810, rewardType: 'ultimate', description: '终极能力解锁' },
];

// 初始技术值和上限
export const INITIAL_TECHNICAL_VALUE = 50;
export const MAX_TECHNICAL_VALUE = 810;

// 初始金币
export const INITIAL_GOLD = 0;

// 核心资源交换比例（2:1）
export const RESOURCE_EXCHANGE_RATE = 2;

// 金币与核心资金交换比例（5:1）
export const GOLD_TO_FUNDS_RATE = 5;
