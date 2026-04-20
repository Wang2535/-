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
    metadata: { label: '王座厅入口' },
    eventPoolIds: [],
    currentVisitCount: 0,
  },
  {
    id: 'R1C2',
    coordinate: [1, 2],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV128',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R2C3',
    coordinate: [2, 3],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV130',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R4C3',
    coordinate: [4, 3],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV135',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R5C3',
    coordinate: [5, 3],
    type: 'boss',
    state: 'locked',
    bossLevelId: 'LV142_BOSS',
    isDefeated: false,
    enhancementLevel: 10,
    dataPacketPoolIds: ['DP_T9_01', 'DP_T9_02', 'DP_T9_03', 'DP_T9_04', 'DP_T9_05', 'DP_T9_06', 'DP_T9_07', 'DP_T9_08', 'DP_T9_09'],
  },
  {
    id: 'R1C0',
    coordinate: [1, 0],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV129',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R2C1',
    coordinate: [2, 1],
    type: 'skill',
    state: 'locked',
    zone: 'N',
    tierProbabilityTable: { common: 10, good: 20, rare: 35, epic: 25, legendary: 10 },
    maxSkillSlots: 3,
  },
  {
    id: 'R3C0',
    coordinate: [3, 0],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV131',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R3C2',
    coordinate: [3, 2],
    type: 'battle',
    state: 'locked',
    zone: 'S',
    levelId: 'LV133',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R1C4',
    coordinate: [1, 4],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV127',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R2C5',
    coordinate: [2, 5],
    type: 'bookstore',
    state: 'locked',
    zone: 'N',
    bookPoolTheme: 'security-mgmt',
    bookCountPerVisit: 3,
  },
  {
    id: 'R3C4',
    coordinate: [3, 4],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV132',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R3C5',
    coordinate: [3, 5],
    type: 'chance',
    state: 'locked',
    zone: 'S',
    eventPoolIds: ['CE_L9_FINAL_TEST'],
    currentVisitCount: 0,
  },
];

const paths: PathConnection[] = [
  { id: 'p_R0C2_R1C2', from: 'R0C2', to: 'R1C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R2C3', from: 'R1C2', to: 'R2C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C3_R4C3', from: 'R2C3', to: 'R4C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C3_R5C3', from: 'R4C3', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R1C0', from: 'R1C2', to: 'R1C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C0_R2C1', from: 'R1C0', to: 'R2C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C1_R3C0', from: 'R2C1', to: 'R3C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C1_R3C2', from: 'R2C1', to: 'R3C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R1C4', from: 'R1C2', to: 'R1C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C4_R2C5', from: 'R1C4', to: 'R2C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C5_R3C4', from: 'R2C5', to: 'R3C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C5_R3C5', from: 'R2C5', to: 'R3C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C2_R4C3', from: 'R3C2', to: 'R4C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R3C4_R4C3', from: 'R3C4', to: 'R4C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R3C0_R3C2', from: 'R3C0', to: 'R3C2', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R3C4_R3C5', from: 'R3C4', to: 'R3C5', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
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
    id: 'L9_ZONE_W',
    type: 'W',
    name: '虚弱区',
    description: '踩中后投掷点数-1',
    cellIds: ['R1C0', 'R1C4'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L9_ZONE_N',
    type: 'N',
    name: '知识区',
    description: '踩中后获得随机书籍×1',
    cellIds: ['R2C1', 'R2C5'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
    currentTriggerCount: 0,
  },
  {
    id: 'L9_ZONE_I',
    type: 'I',
    name: '反转区',
    description: '踩中后地图倒置',
    cellIds: ['R1C2', 'R2C3'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    maxTriggers: 3,
    currentTriggerCount: 0,
  },
  {
    id: 'L9_ZONE_D',
    type: 'D',
    name: '危险区',
    description: '踩中后资源-10',
    cellIds: ['R3C0', 'R3C4', 'R4C3'],
    effect: { effectType: 'resource_change', target: 'self', magnitude: -10, duration: 0, stackable: false, priority: 2 },
    visualConfig: { overlayColor: '#FEE2E2', overlayOpacity: 0.4, iconLabel: 'D', borderStyle: 'skull red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L9_ZONE_S',
    type: 'S',
    name: '加速区',
    description: '踩中后投掷点数+1',
    cellIds: ['R3C2', 'R3C5'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 5 },
    visualConfig: { overlayColor: '#D1FAE5', overlayOpacity: 0.3, iconLabel: 'S', borderStyle: 'dashed green' },
    currentTriggerCount: 0,
  },
];

const zoneIndex: Record<string, ZoneDefinition> = {};
for (const zone of zones) {
  zoneIndex[zone.type] = zone;
}

export const LAYER_09_DATA: TowerLayerData = {
  layerNumber: 9,
  themeId: 'security-mgmt',
  shapeType: 'symmetric-throne-hall',
  shapeDescription: '对称王座厅布局，中央仪式通道加对称侧廊，终局挑战氛围',
  gridSize: { rows: 6, cols: 6 },
  totalCells: 13,
  cells,
  cellIndex,
  paths,
  adjacencyList,
  zones,
  zoneIndex,
  startCellId: 'R0C2',
  bossCellId: 'R5C3',
  endCellId: '',
  colorScheme: {
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#DC2626',
    background: '#1C1917',
    pathColor: '#FBBF24',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'throne-gold',
    atmosphere: 'command-authority',
    particleEffects: ['golden-sparkles', 'security-shield-pulse'],
  },
};
