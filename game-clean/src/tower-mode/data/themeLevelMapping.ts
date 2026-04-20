import type { ThemeCategory } from '../types';

export const THEME_LEVELS: Record<ThemeCategory, string[]> = {
  'virus': ['LV001', 'LV002', 'LV003', 'LV004', 'LV005', 'LV006', 'LV007', 'LV008', 'LV009', 'LV010', 'LV011', 'LV012', 'LV013', 'LV014', 'LV015'],
  'network': ['LV017', 'LV018', 'LV019', 'LV020', 'LV021', 'LV022', 'LV023', 'LV024', 'LV025', 'LV026', 'LV027', 'LV028', 'LV029', 'LV030', 'LV031'],
  'data-security': ['LV033', 'LV034', 'LV035', 'LV036', 'LV037', 'LV038', 'LV039', 'LV040', 'LV041', 'LV042', 'LV043', 'LV044', 'LV045', 'LV046', 'LV047'],
  'social-engineer': ['LV049', 'LV050', 'LV051', 'LV052', 'LV053', 'LV054', 'LV055', 'LV056', 'LV057', 'LV058', 'LV059', 'LV060', 'LV061', 'LV062', 'LV063'],
  'industrial-iot': ['LV065', 'LV066', 'LV067', 'LV068', 'LV069', 'LV070', 'LV071', 'LV072', 'LV073', 'LV074', 'LV075', 'LV076', 'LV077', 'LV078', 'LV079'],
  'mobile-terminal': ['LV081', 'LV082', 'LV083', 'LV084', 'LV085', 'LV086', 'LV087', 'LV088', 'LV089', 'LV090', 'LV091', 'LV092', 'LV093', 'LV094', 'LV095'],
  'cloud-virtual': ['LV097', 'LV098', 'LV099', 'LV100', 'LV101', 'LV102', 'LV103', 'LV104', 'LV105', 'LV106', 'LV107', 'LV108', 'LV109', 'LV110', 'LV111'],
  'ai-emerging': ['LV113', 'LV114', 'LV115', 'LV116', 'LV117', 'LV118', 'LV119', 'LV120', 'LV121', 'LV122', 'LV123', 'LV124', 'LV125', 'LV126'],
  'security-mgmt': ['LV128', 'LV129', 'LV130', 'LV131', 'LV132', 'LV133', 'LV134', 'LV135', 'LV136', 'LV137', 'LV138', 'LV139', 'LV140', 'LV141'],
};

export const BOSS_LEVELS: Record<ThemeCategory, string> = {
  'virus': 'LV016',
  'network': 'LV032',
  'data-security': 'LV048',
  'social-engineer': 'LV064',
  'industrial-iot': 'LV080',
  'mobile-terminal': 'LV096',
  'cloud-virtual': 'LV112',
  'ai-emerging': 'LV127',
  'security-mgmt': 'LV142',
};

export const TIER_THEME_MAP: Record<number, ThemeCategory> = {
  1: 'virus',
  2: 'network',
  3: 'data-security',
  4: 'social-engineer',
  5: 'industrial-iot',
  6: 'mobile-terminal',
  7: 'cloud-virtual',
  8: 'ai-emerging',
  9: 'security-mgmt',
};

export function getAllLevelIds(): string[] {
  const allIds: string[] = [];
  for (const ids of Object.values(THEME_LEVELS)) {
    allIds.push(...ids);
  }
  for (const bossId of Object.values(BOSS_LEVELS)) {
    allIds.push(bossId);
  }
  return allIds;
}

export function getLevelsByTheme(theme: ThemeCategory): string[] {
  return [...THEME_LEVELS[theme]];
}

export function getBossLevelByTheme(theme: ThemeCategory): string {
  return BOSS_LEVELS[theme];
}

export function getThemeByTier(tier: number): ThemeCategory {
  return TIER_THEME_MAP[tier];
}
