import type { ZoneType } from '../types';

export interface ZoneEffectValue {
  readonly effectType: 'dice_modifier' | 'resource_change' | 'map_effect' | 'special_grant';
  readonly magnitude?: number;
  readonly minValue?: number;
  readonly grantType?: string;
  readonly grantCount?: number;
  readonly mapAction?: string;
  readonly globalMaxTriggers?: number;
  readonly resourceType?: string;
  readonly description: string;
  readonly uiLabel: string;
  readonly color: string;
  readonly icon: string;
}

export const ZONE_EFFECT_CONFIG: Readonly<Record<ZoneType, ZoneEffectValue>> = {
  W: {
    effectType: 'dice_modifier',
    magnitude: -1,
    minValue: 1,
    description: '投掷点数-1',
    uiLabel: '虚弱',
    color: '#EF4444',
    icon: '⬇️',
  },
  N: {
    effectType: 'special_grant',
    grantType: 'book',
    grantCount: 1,
    description: '获得随机书籍×1',
    uiLabel: '知识',
    color: '#3B82F6',
    icon: '📚',
  },
  I: {
    effectType: 'map_effect',
    mapAction: 'invert',
    globalMaxTriggers: 3,
    description: '地图倒置（起点终点互换）',
    uiLabel: '反转',
    color: '#A855F7',
    icon: '🔄',
  },
  P: {
    effectType: 'special_grant',
    grantType: 'skip_turn',
    description: '跳过下一回合',
    uiLabel: '休整',
    color: '#F59E0B',
    icon: '⏸️',
  },
  S: {
    effectType: 'dice_modifier',
    magnitude: 1,
    description: '额外投掷一次骰子（取最优）',
    uiLabel: '加速',
    color: '#22C55E',
    icon: '⚡',
  },
  D: {
    effectType: 'resource_change',
    resourceType: 'hp',
    magnitude: -10,
    description: '随机损失资源',
    uiLabel: '危险',
    color: '#991B1B',
    icon: '☠️',
  },
} as const;

export const ZONE_PRIORITY_ORDER: readonly ZoneType[] = ['I', 'D', 'P', 'W', 'S', 'N'] as const;
