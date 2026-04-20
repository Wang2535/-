// 完整设想中要求的技能品质类型
export type SkillQuality = 'common' | 'good' | 'rare' | 'epic' | 'legendary';

// 完整设想中要求的技能触发类型
export type SkillTriggerType =
  | 'passive'       // 被动触发，常驻生效
  | 'turn_start'    // 回合开始触发
  | 'card_played'   // 出牌触发
  | 'battle_start'  // 战斗开始触发
  | 'on_defeat'     // 关卡失败触发
  | 'active'        // 主动释放，有冷却
  | 'map_trigger';  // 地图触发，如跳过格子等

export interface Skill {
  id: string;
  name: string;
  description: string;
  quality: SkillQuality;
  triggerType: SkillTriggerType;
  
  // 效果相关
  effect: (context: any) => any;
  effectDescription: string;
  
  // 冷却相关
  cooldown?: number;        // 主动技能的冷却回合数
  currentCooldown?: number; // 当前冷却状态
  maxUses?: number;         // 部分技能的使用次数限制
  currentUses?: number;
  
  // 视觉相关
  icon: string;             // 图标emoji
  color: string;
}

// 各层级获取高品质技能的概率表
export interface TierProbabilityRow {
  common: number;
  good: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface SkillManagerConfig {
  maxActiveSkills: number;  // 最大携带技能数，默认为3
  enableSkillStorage: boolean;
}
