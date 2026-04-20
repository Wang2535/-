/**
 * 连击奖励系统
 * Tower Streak System
 *
 * 记录连续通关次数，根据连击数提供递增奖励
 * 失败时重置连击
 */

// ============================================
// 类型定义
// ============================================

/** 连击奖励类型 */
export type StreakRewardType =
  | 'gold_bonus'      // 金币加成
  | 'card_reward'     // 卡牌奖励
  | 'stat_boost';     // 属性加成

/** 连击等级 */
export type StreakTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';

/** 属性加成类型 */
export interface StatBoost {
  /** 加成类型 */
  type: 'max_health' | 'damage' | 'defense' | 'draw' | 'energy';
  /** 加成数值 */
  value: number;
  /** 是否为百分比 */
  isPercentage: boolean;
}

/** 连击奖励 */
export interface StreakReward {
  /** 奖励ID */
  id: string;
  /** 奖励名称 */
  name: string;
  /** 奖励描述 */
  description: string;
  /** 奖励类型 */
  type: StreakRewardType;
  /** 奖励数值 */
  value: number;
  /** 属性加成（如果是属性奖励） */
  statBoost?: StatBoost;
  /** 卡牌ID（如果是卡牌奖励） */
  cardId?: string;
}

/** 连击等级配置 */
export interface StreakTierConfig {
  /** 等级名称 */
  tier: StreakTier;
  /** 等级显示名称 */
  displayName: string;
  /** 所需连击数 */
  requiredStreak: number;
  /** 等级颜色 */
  color: string;
  /** 等级图标 */
  icon: string;
  /** 该等级的奖励 */
  rewards: StreakReward[];
  /** 金币加成百分比 */
  goldBonusPercent: number;
  /** 额外描述 */
  extraDescription?: string;
}

/** 连击记录 */
export interface StreakRecord {
  /** 当前连击数 */
  currentStreak: number;
  /** 最高连击数 */
  maxStreak: number;
  /** 当前等级 */
  currentTier: StreakTier;
  /** 总连胜次数（历史累计） */
  totalWins: number;
  /** 当前奖励列表 */
  activeRewards: StreakReward[];
  /** 上次更新时间 */
  lastUpdateTime: number;
  /** 当前幕数（用于判断是否在单局内） */
  currentAct: number;
  /** 当前层数 */
  currentFloor: number;
}

/** 连击事件类型 */
export type StreakEventType =
  | 'streak_increased'      // 连击增加
  | 'streak_reset'          // 连击重置
  | 'tier_upgraded'         // 等级提升
  | 'reward_earned'         // 获得奖励
  | 'milestone_reached';    // 达到里程碑

/** 连击事件 */
export interface StreakEvent {
  type: StreakEventType;
  streak: number;
  tier: StreakTier;
  reward?: StreakReward;
  timestamp: number;
}

// ============================================
// 连击等级配置
// ============================================

/** 连击等级配置表 */
export const STREAK_TIER_CONFIGS: StreakTierConfig[] = [
  {
    tier: 'none',
    displayName: '无',
    requiredStreak: 0,
    color: '#9e9e9e',
    icon: '⚪',
    goldBonusPercent: 0,
    rewards: [],
    extraDescription: '开始你的连胜之旅'
  },
  {
    tier: 'bronze',
    displayName: '青铜',
    requiredStreak: 3,
    color: '#cd7f32',
    icon: '🥉',
    goldBonusPercent: 10,
    rewards: [
      {
        id: 'streak_bronze_gold',
        name: '青铜金币加成',
        description: '获得金币+10%',
        type: 'gold_bonus',
        value: 10
      }
    ],
    extraDescription: '初露锋芒'
  },
  {
    tier: 'silver',
    displayName: '白银',
    requiredStreak: 5,
    color: '#c0c0c0',
    icon: '🥈',
    goldBonusPercent: 20,
    rewards: [
      {
        id: 'streak_silver_gold',
        name: '白银金币加成',
        description: '获得金币+20%',
        type: 'gold_bonus',
        value: 20
      },
      {
        id: 'streak_silver_health',
        name: '生命强化',
        description: '最大生命值+10',
        type: 'stat_boost',
        value: 10,
        statBoost: {
          type: 'max_health',
          value: 10,
          isPercentage: false
        }
      }
    ],
    extraDescription: '稳步前进'
  },
  {
    tier: 'gold',
    displayName: '黄金',
    requiredStreak: 8,
    color: '#ffd700',
    icon: '🥇',
    goldBonusPercent: 35,
    rewards: [
      {
        id: 'streak_gold_gold',
        name: '黄金金币加成',
        description: '获得金币+35%',
        type: 'gold_bonus',
        value: 35
      },
      {
        id: 'streak_gold_damage',
        name: '攻击强化',
        description: '所有伤害+2',
        type: 'stat_boost',
        value: 2,
        statBoost: {
          type: 'damage',
          value: 2,
          isPercentage: false
        }
      },
      {
        id: 'streak_gold_card',
        name: '连胜卡牌包',
        description: '每场战斗额外抽1张牌',
        type: 'card_reward',
        value: 1
      }
    ],
    extraDescription: '势不可挡'
  },
  {
    tier: 'platinum',
    displayName: '铂金',
    requiredStreak: 12,
    color: '#e5e4e2',
    icon: '💎',
    goldBonusPercent: 50,
    rewards: [
      {
        id: 'streak_platinum_gold',
        name: '铂金金币加成',
        description: '获得金币+50%',
        type: 'gold_bonus',
        value: 50
      },
      {
        id: 'streak_platinum_defense',
        name: '防御专精',
        description: '受到的伤害-10%',
        type: 'stat_boost',
        value: 10,
        statBoost: {
          type: 'defense',
          value: 10,
          isPercentage: true
        }
      },
      {
        id: 'streak_platinum_draw',
        name: '抽牌强化',
        description: '每回合抽牌数+1',
        type: 'stat_boost',
        value: 1,
        statBoost: {
          type: 'draw',
          value: 1,
          isPercentage: false
        }
      }
    ],
    extraDescription: '精英战士'
  },
  {
    tier: 'diamond',
    displayName: '钻石',
    requiredStreak: 18,
    color: '#b9f2ff',
    icon: '💠',
    goldBonusPercent: 75,
    rewards: [
      {
        id: 'streak_diamond_gold',
        name: '钻石金币加成',
        description: '获得金币+75%',
        type: 'gold_bonus',
        value: 75
      },
      {
        id: 'streak_diamond_energy',
        name: '能量充盈',
        description: '每回合能量+1',
        type: 'stat_boost',
        value: 1,
        statBoost: {
          type: 'energy',
          value: 1,
          isPercentage: false
        }
      },
      {
        id: 'streak_diamond_health',
        name: '生命源泉',
        description: '最大生命值+20',
        type: 'stat_boost',
        value: 20,
        statBoost: {
          type: 'max_health',
          value: 20,
          isPercentage: false
        }
      }
    ],
    extraDescription: '传奇之路'
  },
  {
    tier: 'legendary',
    displayName: '传说',
    requiredStreak: 25,
    color: '#ff6b35',
    icon: '👑',
    goldBonusPercent: 100,
    rewards: [
      {
        id: 'streak_legendary_gold',
        name: '传说金币加成',
        description: '获得金币+100%',
        type: 'gold_bonus',
        value: 100
      },
      {
        id: 'streak_legendary_damage',
        name: '毁灭之力',
        description: '所有伤害+5',
        type: 'stat_boost',
        value: 5,
        statBoost: {
          type: 'damage',
          value: 5,
          isPercentage: false
        }
      },
      {
        id: 'streak_legendary_defense',
        name: '绝对防御',
        description: '受到的伤害-20%',
        type: 'stat_boost',
        value: 20,
        statBoost: {
          type: 'defense',
          value: 20,
          isPercentage: true
        }
      },
      {
        id: 'streak_legendary_omni',
        name: '全能强化',
        description: '所有属性+10%',
        type: 'stat_boost',
        value: 10,
        statBoost: {
          type: 'max_health',
          value: 10,
          isPercentage: true
        }
      }
    ],
    extraDescription: '登峰造极'
  }
];

// ============================================
// 连击奖励系统类
// ============================================

class TowerStreakSystem {
  private streakRecord: StreakRecord;
  private listeners: Set<(event: StreakEvent) => void> = new Set();
  private readonly STORAGE_KEY = 'tower_streak_record';

  constructor() {
    this.streakRecord = this.loadStreakRecord();
  }

  // ==================== 核心方法 ====================

  /**
   * 记录胜利（增加连击）
   * @param actNumber 当前幕数
   * @param floorNumber 当前层数
   * @returns 更新后的连击记录
   */
  public recordWin(actNumber: number, floorNumber: number): StreakRecord {
    const previousTier = this.streakRecord.currentTier;

    this.streakRecord.currentStreak++;
    this.streakRecord.totalWins++;
    this.streakRecord.currentAct = actNumber;
    this.streakRecord.currentFloor = floorNumber;
    this.streakRecord.lastUpdateTime = Date.now();

    // 更新等级
    const newTier = this.calculateCurrentTier();
    this.streakRecord.currentTier = newTier;

    // 更新活跃奖励
    this.streakRecord.activeRewards = this.getRewardsForTier(newTier);

    // 保存记录
    this.saveStreakRecord();

    // 触发事件
    this.emitEvent({
      type: 'streak_increased',
      streak: this.streakRecord.currentStreak,
      tier: newTier,
      timestamp: Date.now()
    });

    // 检查等级提升
    if (newTier !== previousTier) {
      this.emitEvent({
        type: 'tier_upgraded',
        streak: this.streakRecord.currentStreak,
        tier: newTier,
        timestamp: Date.now()
      });
    }

    // 检查里程碑
    if (this.isMilestone(this.streakRecord.currentStreak)) {
      this.emitEvent({
        type: 'milestone_reached',
        streak: this.streakRecord.currentStreak,
        tier: newTier,
        timestamp: Date.now()
      });
    }

    console.log(`[TowerStreakSystem] 连击增加: ${this.streakRecord.currentStreak}, 等级: ${newTier}`);
    return { ...this.streakRecord };
  }

  /**
   * 记录失败（重置连击）
   * @param preservePartial 是否保留部分连击（如保留一半）
   * @returns 重置后的连击记录
   */
  public recordLoss(preservePartial: boolean = false): StreakRecord {
    const previousStreak = this.streakRecord.currentStreak;

    if (preservePartial && previousStreak > 5) {
      // 保留一半连击（至少保留3）
      this.streakRecord.currentStreak = Math.max(3, Math.floor(previousStreak / 2));
    } else {
      this.streakRecord.currentStreak = 0;
    }

    this.streakRecord.currentTier = this.calculateCurrentTier();
    this.streakRecord.activeRewards = this.getRewardsForTier(this.streakRecord.currentTier);
    this.streakRecord.lastUpdateTime = Date.now();

    this.saveStreakRecord();

    this.emitEvent({
      type: 'streak_reset',
      streak: this.streakRecord.currentStreak,
      tier: this.streakRecord.currentTier,
      timestamp: Date.now()
    });

    console.log(`[TowerStreakSystem] 连击重置: ${previousStreak} -> ${this.streakRecord.currentStreak}`);
    return { ...this.streakRecord };
  }

  /**
   * 获取当前连击记录
   * @returns 连击记录副本
   */
  public getStreakRecord(): StreakRecord {
    return { ...this.streakRecord };
  }

  /**
   * 获取当前连击数
   * @returns 当前连击数
   */
  public getCurrentStreak(): number {
    return this.streakRecord.currentStreak;
  }

  /**
   * 获取最高连击数
   * @returns 最高连击数
   */
  public getMaxStreak(): number {
    return this.streakRecord.maxStreak;
  }

  /**
   * 获取当前等级
   * @returns 当前等级
   */
  public getCurrentTier(): StreakTier {
    return this.streakRecord.currentTier;
  }

  /**
   * 获取当前等级配置
   * @returns 等级配置
   */
  public getCurrentTierConfig(): StreakTierConfig | null {
    return STREAK_TIER_CONFIGS.find(config => config.tier === this.streakRecord.currentTier) || null;
  }

  /**
   * 获取下一等级配置
   * @returns 下一等级配置
   */
  public getNextTierConfig(): StreakTierConfig | null {
    const currentIndex = STREAK_TIER_CONFIGS.findIndex(config => config.tier === this.streakRecord.currentTier);
    return STREAK_TIER_CONFIGS[currentIndex + 1] || null;
  }

  /**
   * 获取当前活跃奖励
   * @returns 活跃奖励列表
   */
  public getActiveRewards(): StreakReward[] {
    return [...this.streakRecord.activeRewards];
  }

  /**
   * 获取金币加成百分比
   * @returns 金币加成百分比
   */
  public getGoldBonusPercent(): number {
    const config = this.getCurrentTierConfig();
    return config?.goldBonusPercent || 0;
  }

  /**
   * 计算加成后的金币
   * @param baseGold 基础金币
   * @returns 加成后的金币
   */
  public calculateGoldWithBonus(baseGold: number): number {
    const bonusPercent = this.getGoldBonusPercent();
    return Math.floor(baseGold * (1 + bonusPercent / 100));
  }

  /**
   * 获取属性加成列表
   * @returns 属性加成数组
   */
  public getStatBoosts(): StatBoost[] {
    return this.streakRecord.activeRewards
      .filter(reward => reward.type === 'stat_boost' && reward.statBoost)
      .map(reward => reward.statBoost!);
  }

  // ==================== 进度查询 ====================

  /**
   * 获取到下一等级还需的连胜次数
   * @returns 还需连胜次数
   */
  public getStreaksToNextTier(): number {
    const nextTier = this.getNextTierConfig();
    if (!nextTier) return 0;
    return Math.max(0, nextTier.requiredStreak - this.streakRecord.currentStreak);
  }

  /**
   * 获取当前等级进度百分比
   * @returns 进度百分比（0-100）
   */
  public getTierProgressPercent(): number {
    const currentConfig = this.getCurrentTierConfig();
    const nextConfig = this.getNextTierConfig();

    if (!currentConfig || !nextConfig) return 100;

    const currentRequired = currentConfig.requiredStreak;
    const nextRequired = nextConfig.requiredStreak;
    const currentStreak = this.streakRecord.currentStreak;

    if (currentStreak >= nextRequired) return 100;

    const progress = (currentStreak - currentRequired) / (nextRequired - currentRequired);
    return Math.floor(progress * 100);
  }

  /**
   * 检查是否达到里程碑
   * @param streak 连击数
   * @returns 是否为里程碑
   */
  private isMilestone(streak: number): boolean {
    const milestones = [3, 5, 10, 15, 20, 25, 30, 50, 100];
    return milestones.includes(streak);
  }

  /**
   * 获取里程碑奖励
   * @param milestone 里程碑数
   * @returns 里程碑奖励
   */
  public getMilestoneReward(milestone: number): StreakReward | null {
    const milestoneRewards: Record<number, StreakReward> = {
      3: {
        id: 'milestone_3',
        name: '初战告捷',
        description: '获得50金币',
        type: 'gold_bonus',
        value: 50
      },
      5: {
        id: 'milestone_5',
        name: '五连胜',
        description: '获得1张随机稀有卡牌',
        type: 'card_reward',
        value: 1
      },
      10: {
        id: 'milestone_10',
        name: '十连胜',
        description: '获得100金币和最大生命值+10',
        type: 'gold_bonus',
        value: 100
      },
      15: {
        id: 'milestone_15',
        name: '十五连胜',
        description: '获得1张史诗卡牌',
        type: 'card_reward',
        value: 1
      },
      20: {
        id: 'milestone_20',
        name: '二十连胜',
        description: '获得200金币和所有伤害+3',
        type: 'gold_bonus',
        value: 200
      },
      25: {
        id: 'milestone_25',
        name: '二十五连胜',
        description: '获得1张传说卡牌',
        type: 'card_reward',
        value: 1
      },
      30: {
        id: 'milestone_30',
        name: '三十连胜',
        description: '获得500金币和全属性+5',
        type: 'gold_bonus',
        value: 500
      },
      50: {
        id: 'milestone_50',
        name: '五十连胜',
        description: '获得1000金币和2张传说卡牌',
        type: 'gold_bonus',
        value: 1000
      },
      100: {
        id: 'milestone_100',
        name: '百战百胜',
        description: '获得终极奖励包',
        type: 'card_reward',
        value: 5
      }
    };

    return milestoneRewards[milestone] || null;
  }

  // ==================== 数据管理 ====================

  /**
   * 重置连击记录
   */
  public resetStreak(): void {
    this.streakRecord = this.createDefaultRecord();
    this.saveStreakRecord();
    console.log('[TowerStreakSystem] 连击记录已重置');
  }

  /**
   * 设置连击数（用于测试或恢复）
   * @param streak 目标连击数
   */
  public setStreak(streak: number): void {
    this.streakRecord.currentStreak = Math.max(0, streak);
    this.streakRecord.currentTier = this.calculateCurrentTier();
    this.streakRecord.activeRewards = this.getRewardsForTier(this.streakRecord.currentTier);
    this.streakRecord.lastUpdateTime = Date.now();

    // 更新最高记录
    if (this.streakRecord.currentStreak > this.streakRecord.maxStreak) {
      this.streakRecord.maxStreak = this.streakRecord.currentStreak;
    }

    this.saveStreakRecord();
  }

  /**
   * 导出连击记录
   * @returns JSON字符串
   */
  public exportRecord(): string {
    return JSON.stringify(this.streakRecord, null, 2);
  }

  /**
   * 导入连击记录
   * @param json JSON字符串
   * @returns 是否成功
   */
  public importRecord(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      if (this.validateRecord(parsed)) {
        this.streakRecord = parsed;
        this.saveStreakRecord();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[TowerStreakSystem] 导入记录失败:', error);
      return false;
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 计算当前等级
   */
  private calculateCurrentTier(): StreakTier {
    for (let i = STREAK_TIER_CONFIGS.length - 1; i >= 0; i--) {
      if (this.streakRecord.currentStreak >= STREAK_TIER_CONFIGS[i].requiredStreak) {
        return STREAK_TIER_CONFIGS[i].tier;
      }
    }
    return 'none';
  }

  /**
   * 获取指定等级的奖励
   */
  private getRewardsForTier(tier: StreakTier): StreakReward[] {
    const config = STREAK_TIER_CONFIGS.find(c => c.tier === tier);
    return config ? [...config.rewards] : [];
  }

  /**
   * 创建默认记录
   */
  private createDefaultRecord(): StreakRecord {
    return {
      currentStreak: 0,
      maxStreak: 0,
      currentTier: 'none',
      totalWins: 0,
      activeRewards: [],
      lastUpdateTime: Date.now(),
      currentAct: 1,
      currentFloor: 1
    };
  }

  /**
   * 加载连击记录
   */
  private loadStreakRecord(): StreakRecord {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (this.validateRecord(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('[TowerStreakSystem] 加载记录失败:', error);
    }
    return this.createDefaultRecord();
  }

  /**
   * 保存连击记录
   */
  private saveStreakRecord(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.streakRecord));
    } catch (error) {
      console.error('[TowerStreakSystem] 保存记录失败:', error);
    }
  }

  /**
   * 验证记录结构
   */
  private validateRecord(data: any): data is StreakRecord {
    return (
      data &&
      typeof data.currentStreak === 'number' &&
      typeof data.maxStreak === 'number' &&
      typeof data.currentTier === 'string' &&
      typeof data.totalWins === 'number' &&
      Array.isArray(data.activeRewards) &&
      typeof data.lastUpdateTime === 'number'
    );
  }

  /**
   * 触发事件
   */
  private emitEvent(event: StreakEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[TowerStreakSystem] 事件监听回调失败:', error);
      }
    });
  }

  // ==================== 事件监听 ====================

  /**
   * 添加事件监听器
   * @param callback 回调函数
   * @returns 取消监听函数
   */
  public addListener(callback: (event: StreakEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 移除事件监听器
   * @param callback 回调函数
   */
  public removeListener(callback: (event: StreakEvent) => void): void {
    this.listeners.delete(callback);
  }
}

// ============================================
// 导出
// ============================================

/** 连击奖励系统单例 */
export const towerStreakSystem = new TowerStreakSystem();

/** TowerStreakSystem类 */
export { TowerStreakSystem };

/** 类型导出 */
export type {
  StreakRewardType,
  StreakTier,
  StatBoost,
  StreakReward,
  StreakTierConfig,
  StreakRecord,
  StreakEventType,
  StreakEvent
};

/** 配置导出 */
export { STREAK_TIER_CONFIGS };
