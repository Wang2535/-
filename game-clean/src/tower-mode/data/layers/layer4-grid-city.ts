import type {
  Coordinate2D,
  GridSize,
  ThemeCategory,
  CellType,
  CellState,
  ZoneType,
  EffectTarget,
  TierProbabilityRow,
  BaseCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  GameCell,
  PathConnection,
  ZoneEffectConfig,
  ZoneVisualConfig,
  ZoneDefinition,
  LayerColorScheme,
  AmbientConfig,
  TowerLayerData,
} from '../../types';

const cells: GameCell[] = [
  {
    id: 'R0C2',
    coordinate: [0, 2],
    type: 'chance',
    state: 'unlocked',
    metadata: { label: '街区入口' },
    eventPoolIds: [],
    currentVisitCount: 0,
  },
  {
    id: 'R1C1',
    coordinate: [1, 1],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV049',
    difficulty: 2,
    isCompleted: false,
  },
  {
    id: 'R1C2',
    coordinate: [1, 2],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV050',
    difficulty: 2,
    isCompleted: false,
  },
  {
    id: 'R1C3',
    coordinate: [1, 3],
    type: 'battle',
    state: 'locked',
    zone: 'N',
    levelId: 'LV051',
    difficulty: 3,
    isCompleted: false,
  },
  {
    id: 'R2C1',
    coordinate: [2, 1],
    type: 'skill',
    state: 'locked',
    zone: 'W',
    tierProbabilityTable: { common: 40, good: 30, rare: 20, epic: 8, legendary: 2 },
    maxSkillSlots: 3,
  },
  {
    id: 'R2C2',
    coordinate: [2, 2],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV052',
    difficulty: 3,
    isCompleted: false,
  },
  {
    id: 'R2C3',
    coordinate: [2, 3],
    type: 'bookstore',
    state: 'locked',
    zone: 'N',
    bookPoolTheme: 'social-engineer',
    bookCountPerVisit: 3,
  },
  {
    id: 'R3C1',
    coordinate: [3, 1],
    type: 'battle',
    state: 'locked',
    zone: 'P',
    levelId: 'LV053',
    difficulty: 3,
    isCompleted: false,
  },
  {
    id: 'R3C3',
    coordinate: [3, 3],
    type: 'chance',
    state: 'locked',
    zone: 'P',
    eventPoolIds: ['CE_L4_PHISHING'],
    currentVisitCount: 0,
  },
  {
    id: 'R3C2',
    coordinate: [3, 2],
    type: 'battle',
    state: 'locked',
    levelId: 'LV054',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R4C2',
    coordinate: [4, 2],
    type: 'boss',
    state: 'locked',
    bossLevelId: 'LV064_BOSS',
    isDefeated: false,
    enhancementLevel: 5,
    dataPacketPoolIds: ['DP_T4_01', 'DP_T4_02', 'DP_T4_03', 'DP_T4_04', 'DP_T4_05', 'DP_T4_06', 'DP_T4_07', 'DP_T4_08', 'DP_T4_09'],
  },
];

const paths: PathConnection[] = [
  { id: 'p_R0C2_R1C2', from: 'R0C2', to: 'R1C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R1C2', from: 'R1C1', to: 'R1C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R1C3', from: 'R1C2', to: 'R1C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C1', from: 'R1C1', to: 'R2C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R2C2', from: 'R1C2', to: 'R2C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C3_R2C3', from: 'R1C3', to: 'R2C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C1_R2C2', from: 'R2C1', to: 'R2C2', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R2C2_R2C3', from: 'R2C2', to: 'R2C3', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R2C1_R3C1', from: 'R2C1', to: 'R3C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C2_R3C2', from: 'R2C2', to: 'R3C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C3_R3C3', from: 'R2C3', to: 'R3C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C1_R3C2', from: 'R3C1', to: 'R3C2', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R3C2_R3C3', from: 'R3C2', to: 'R3C3', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R3C2_R4C2', from: 'R3C2', to: 'R4C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
];

const cellIndex: Record<string, GameCell> = {};
for (const cell of cells) {
  cellIndex[cell.id] = cell;
}

const adjacencyList: Record<string, string[]> = {};
for (const path of paths) {
  if (!adjacencyList[path.from]) {
    adjacencyList[path.from] = [];
  }
  if (!adjacencyList[path.to]) {
    adjacencyList[path.to] = [];
  }
  adjacencyList[path.from].push(path.to);
  if (path.direction === 'bidirectional') {
    adjacencyList[path.to].push(path.from);
  }
}

const zones: ZoneDefinition[] = [
  {
    id: 'L4_ZONE_W',
    type: 'W',
    name: '虚弱区',
    description: '踩中后投掷点数-1',
    cellIds: ['R1C1', 'R2C1'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L4_ZONE_N',
    type: 'N',
    name: '知识区',
    description: '踩中后获得随机书籍×1',
    cellIds: ['R1C3', 'R2C3'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
    currentTriggerCount: 0,
  },
  {
    id: 'L4_ZONE_I',
    type: 'I',
    name: '反转区',
    description: '踩中后地图倒置',
    cellIds: ['R1C2', 'R2C2'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    maxTriggers: 3,
    currentTriggerCount: 0,
  },
  {
    id: 'L4_ZONE_P',
    type: 'P',
    name: '休整区',
    description: '踩中后获得休整增益',
    cellIds: ['R3C1', 'R3C3'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: false, priority: 3 },
    visualConfig: { overlayColor: '#FEF3C7', overlayOpacity: 0.3, iconLabel: 'P', borderStyle: 'striped amber' },
    currentTriggerCount: 0,
  },
];

const zoneIndex: Record<string, ZoneDefinition> = {};
for (const zone of zones) {
  zoneIndex[zone.type] = zone;
}

export const LAYER_04_DATA: TowerLayerData = {
  layerNumber: 4,
  themeId: 'social-engineer',
  shapeType: 'grid-city-blocks',
  shapeDescription: '城市街区网格布局，3×3核心网格加街区通道，模拟社会工程学渗透路径',
  gridSize: { rows: 5, cols: 5 },
  totalCells: 11,
  cells,
  cellIndex,
  paths,
  adjacencyList,
  zones,
  zoneIndex,
  startCellId: 'R0C2',
  bossCellId: 'R4C2',
  endCellId: '',
  colorScheme: {
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#10B981',
    background: '#1C1917',
    pathColor: '#FB923C',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'urban-sunset',
    atmosphere: 'city-ambience',
    particleEffects: ['neon-signs', 'rain-drops'],
  },
};
