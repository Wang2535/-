import type { ThemeCategory } from '../types';

export interface TierConfig {
  readonly themeId: ThemeCategory;
  readonly themeName: string;
  readonly shapeType: string;
  readonly colorScheme: { readonly primary: string; readonly secondary: string; readonly accent: string };
  readonly difficultyRange: readonly [number, number];
  readonly bossLevelId: string;
  readonly cellCount: number;
  readonly skillTierModifier: number;
  readonly dataPacketPoolPrefix: string;
}

export const TIER_CONFIG: Readonly<Record<number, TierConfig>> = {
  1: {
    themeId: 'virus',
    themeName: '病毒实验室',
    shapeType: 'gourd-culture-dish',
    colorScheme: { primary: '#22C55E', secondary: '#16A34A', accent: '#DC2626' },
    difficultyRange: [1, 3],
    bossLevelId: 'LV016_BOSS',
    cellCount: 13,
    skillTierModifier: 0,
    dataPacketPoolPrefix: 'DP_T1_',
  },
  2: {
    themeId: 'network',
    themeName: '网络空间',
    shapeType: 'dual-ring-topology',
    colorScheme: { primary: '#06B6D4', secondary: '#0891B2', accent: '#F59E0B' },
    difficultyRange: [1, 3],
    bossLevelId: 'LV032_BOSS',
    cellCount: 17,
    skillTierModifier: 0,
    dataPacketPoolPrefix: 'DP_T2_',
  },
  3: {
    themeId: 'data-security',
    themeName: '数据保险库',
    shapeType: 'concentric-fortress',
    colorScheme: { primary: '#3B82F6', secondary: '#2563EB', accent: '#FBBF24' },
    difficultyRange: [2, 4],
    bossLevelId: 'LV048_BOSS',
    cellCount: 13,
    skillTierModifier: 0,
    dataPacketPoolPrefix: 'DP_T3_',
  },
  4: {
    themeId: 'social-engineer',
    themeName: '城市街区',
    shapeType: 'grid-city-blocks',
    colorScheme: { primary: '#F97316', secondary: '#EA580C', accent: '#10B981' },
    difficultyRange: [2, 4],
    bossLevelId: 'LV064_BOSS',
    cellCount: 11,
    skillTierModifier: 0,
    dataPacketPoolPrefix: 'DP_T4_',
  },
  5: {
    themeId: 'industrial-iot',
    themeName: '智能工厂',
    shapeType: 'production-tree',
    colorScheme: { primary: '#EAB308', secondary: '#CA8A04', accent: '#EF4444' },
    difficultyRange: [3, 5],
    bossLevelId: 'LV080_BOSS',
    cellCount: 16,
    skillTierModifier: 1,
    dataPacketPoolPrefix: 'DP_T5_',
  },
  6: {
    themeId: 'mobile-terminal',
    themeName: '移动终端',
    shapeType: 'hexagonal-honeycomb',
    colorScheme: { primary: '#A855F7', secondary: '#9333EA', accent: '#22C55E' },
    difficultyRange: [3, 5],
    bossLevelId: 'LV096_BOSS',
    cellCount: 17,
    skillTierModifier: 1,
    dataPacketPoolPrefix: 'DP_T6_',
  },
  7: {
    themeId: 'cloud-virtual',
    themeName: '云端平台',
    shapeType: 'irregular-cloud',
    colorScheme: { primary: '#0EA5E9', secondary: '#0284C7', accent: '#F59E0B' },
    difficultyRange: [4, 5],
    bossLevelId: 'LV112_BOSS',
    cellCount: 14,
    skillTierModifier: 2,
    dataPacketPoolPrefix: 'DP_T7_',
  },
  8: {
    themeId: 'ai-emerging',
    themeName: '未来实验室',
    shapeType: 'quantum-cloud',
    colorScheme: { primary: '#EC4899', secondary: '#DB2777', accent: '#A855F7' },
    difficultyRange: [4, 5],
    bossLevelId: 'LV127_BOSS',
    cellCount: 15,
    skillTierModifier: 2,
    dataPacketPoolPrefix: 'DP_T8_',
  },
  9: {
    themeId: 'security-mgmt',
    themeName: '指挥中心',
    shapeType: 'symmetric-throne-hall',
    colorScheme: { primary: '#F59E0B', secondary: '#D97706', accent: '#DC2626' },
    difficultyRange: [5, 5],
    bossLevelId: 'LV142_BOSS',
    cellCount: 13,
    skillTierModifier: 3,
    dataPacketPoolPrefix: 'DP_T9_',
  },
} as const;
