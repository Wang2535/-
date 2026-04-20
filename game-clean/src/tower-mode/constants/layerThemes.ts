export interface LayerThemeConfig {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  accentColor: string;
  dangerColor: string;
  diceSkin: { faceColor: string; dotColor: string; glowColor: string };
  zoneColors: Partial<Record<string, string>>;
  particleStyle: string;
  ambientAnim: string;
  specialMechanic: string;
}

export const LAYER_THEMES: Record<number, LayerThemeConfig> = {
  1: {
    name: '病毒实验室',
    bgPrimary: '#0a1a0f', bgSecondary: '#0d2015',
    accentColor: '#44ff88', dangerColor: '#ff3333',
    diceSkin: { faceColor: '#1a3a1a', dotColor: '#44ff88', glowColor: '#22aa44' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', D: '#FF4444', S: '#44ff88' },
    particleStyle: 'virus-spore',
    ambientAnim: 'bio-pulse',
    specialMechanic: 'acceleration',
  },
  2: {
    name: '网络空间',
    bgPrimary: '#0a0f1a', bgSecondary: '#0f1528',
    accentColor: '#4488ff', dangerColor: '#ff6644',
    diceSkin: { faceColor: '#0a1628', dotColor: '#4488ff', glowColor: '#2255cc' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', S: '#44ff88', I: '#aa44ff' },
    particleStyle: 'data-packet',
    ambientAnim: 'data-flow',
    specialMechanic: 'jump',
  },
  3: {
    name: '数据金库',
    bgPrimary: '#0f0a08', bgSecondary: '#1a120e',
    accentColor: '#ffaa44', dangerColor: '#cc4400',
    diceSkin: { faceColor: '#1a1208', dotColor: '#ffaa44', glowColor: '#cc7700' },
    zoneColors: { W: '#FF6B6B', N: '#FFCC00', D: '#cc4400', I: '#cc88ff' },
    particleStyle: 'gold-dust',
    ambientAnim: 'vault-glow',
    specialMechanic: 'sequence',
  },
  4: {
    name: '城市街区',
    bgPrimary: '#0f0f14', bgSecondary: '#181820',
    accentColor: '#ff44aa', dangerColor: '#ff2222',
    diceSkin: { faceColor: '#14141c', dotColor: '#ff44aa', glowColor: '#cc2288' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', P: '#F39C12', S: '#44ff88' },
    particleStyle: 'neon-rain',
    ambientAnim: 'city-pulse',
    specialMechanic: 'event',
  },
  5: {
    name: '智能工厂',
    bgPrimary: '#0a0f0a', bgSecondary: '#12180f',
    accentColor: '#ff8800', dangerColor: '#ff4400',
    diceSkin: { faceColor: '#101810', dotColor: '#ff8800', glowColor: '#cc6600' },
    zoneColors: { W: '#FF6B6B', N: '#FFCC00', S: '#44ff88', P: '#F39C12' },
    particleStyle: 'spark',
    ambientAnim: 'conveyor-belt',
    specialMechanic: 'blockade',
  },
  6: {
    name: '移动终端',
    bgPrimary: '#0a0f14', bgSecondary: '#0e1520',
    accentColor: '#6644ff', dangerColor: '#ff4488',
    diceSkin: { faceColor: '#0c1020', dotColor: '#6644ff', glowColor: '#4422cc' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', D: '#ff4488', S: '#44ff88' },
    particleStyle: 'signal-wave',
    ambientAnim: 'interference',
    specialMechanic: 'teleport',
  },
  7: {
    name: '云端平台',
    bgPrimary: '#0f0e1a', bgSecondary: '#181628',
    accentColor: '#aa88ff', dangerColor: '#dd66ff',
    diceSkin: { faceColor: '#16142a', dotColor: '#aa88ff', glowColor: '#8855dd' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', S: '#44ff88' },
    particleStyle: 'cloud-fluff',
    ambientAnim: 'cloud-drift',
    specialMechanic: 'drift',
  },
  8: {
    name: '未来实验室',
    bgPrimary: '#0e0a14', bgSecondary: '#16101e',
    accentColor: '#dd44ff', dangerColor: '#ff22aa',
    diceSkin: { faceColor: '#120a18', dotColor: '#dd44ff', glowColor: '#bb22cc' },
    zoneColors: { W: '#FF6B6B', N: '#4ECDC4', I: '#9B59B6', P: '#F39C12' },
    particleStyle: 'quantum-particle',
    ambientAnim: 'wave-collapse',
    specialMechanic: 'collapse',
  },
  9: {
    name: '指挥中心',
    bgPrimary: '#0f0e0a', bgSecondary: '#1a1810',
    accentColor: '#ffdd44', dangerColor: '#ff0000',
    diceSkin: { faceColor: '#18160a', dotColor: '#ffdd44', glowColor: '#ccaa00' },
    zoneColors: { W: '#FF6B6B', N: '#FFCC00', P: '#F39C12', D: '#ff0000' },
    particleStyle: 'command-beam',
    ambientAnim: 'throne-glow',
    specialMechanic: 'protocol',
  },
};

export function getLayerTheme(layer: number): LayerThemeConfig {
  return LAYER_THEMES[layer] ?? LAYER_THEMES[1];
}
