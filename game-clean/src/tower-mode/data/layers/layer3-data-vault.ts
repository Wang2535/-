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
    id: 'R0C3',
    coordinate: [0, 3],
    type: 'chance',
    state: 'unlocked',
    metadata: { label: '保险库入口' },
    eventPoolIds: [],
    currentVisitCount: 0,
  },
  {
    id: 'R1C1',
    coordinate: [1, 1],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV033',
    difficulty: 2,
    isCompleted: false,
  },
  {
    id: 'R1C5',
    coordinate: [1, 5],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV034',
    difficulty: 2,
    isCompleted: false,
  },
  {
    id: 'R2C0',
    coordinate: [2, 0],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV035',
    difficulty: 3,
    isCompleted: false,
  },
  {
    id: 'R2C6',
    coordinate: [2, 6],
    type: 'chance',
    state: 'locked',
    zone: 'D',
    eventPoolIds: ['CE_L3_TRAP'],
    currentVisitCount: 0,
  },
  {
    id: 'R2C3',
    coordinate: [2, 3],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV036',
    difficulty: 3,
    isCompleted: false,
  },
  {
    id: 'R3C1',
    coordinate: [3, 1],
    type: 'skill',
    state: 'locked',
    zone: 'N',
    tierProbabilityTable: { common: 40, good: 30, rare: 20, epic: 8, legendary: 2 },
    maxSkillSlots: 3,
  },
  {
    id: 'R3C5',
    coordinate: [3, 5],
    type: 'bookstore',
    state: 'locked',
    zone: 'N',
    bookPoolTheme: 'data-security',
    bookCountPerVisit: 3,
  },
  {
    id: 'R4C3',
    coordinate: [4, 3],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV037',
    difficulty: 3,
    isCompleted: false,
  },
  {
    id: 'R4C1',
    coordinate: [4, 1],
    type: 'skill',
    state: 'locked',
    tierProbabilityTable: { common: 40, good: 30, rare: 20, epic: 8, legendary: 2 },
    maxSkillSlots: 3,
  },
  {
    id: 'R4C5',
    coordinate: [4, 5],
    type: 'battle',
    state: 'locked',
    levelId: 'LV038',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R5C3',
    coordinate: [5, 3],
    type: 'battle',
    state: 'locked',
    levelId: 'LV039',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R6C3',
    coordinate: [6, 3],
    type: 'boss',
    state: 'locked',
    bossLevelId: 'LV048_BOSS',
    isDefeated: false,
    enhancementLevel: 5,
    dataPacketPoolIds: ['DP_T3_01', 'DP_T3_02', 'DP_T3_03', 'DP_T3_04', 'DP_T3_05', 'DP_T3_06', 'DP_T3_07', 'DP_T3_08', 'DP_T3_09'],
  },
];

const paths: PathConnection[] = [
  { id: 'p_R0C3_R1C1', from: 'R0C3', to: 'R1C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C0', from: 'R1C1', to: 'R2C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R3C1', from: 'R1C1', to: 'R3C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C1_R4C1', from: 'R3C1', to: 'R4C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R0C3_R2C3', from: 'R0C3', to: 'R2C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C3_R4C3', from: 'R2C3', to: 'R4C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C3_R5C3', from: 'R4C3', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R5C3_R6C3', from: 'R5C3', to: 'R6C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R0C3_R1C5', from: 'R0C3', to: 'R1C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C5_R2C6', from: 'R1C5', to: 'R2C6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C5_R3C5', from: 'R1C5', to: 'R3C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C5_R4C5', from: 'R3C5', to: 'R4C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C0_R2C3', from: 'R2C0', to: 'R2C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C3_R2C6', from: 'R2C3', to: 'R2C6', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R4C1_R4C3', from: 'R4C1', to: 'R4C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R4C3_R4C5', from: 'R4C3', to: 'R4C5', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R4C1_R5C3', from: 'R4C1', to: 'R5C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R4C5_R5C3', from: 'R4C5', to: 'R5C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
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
    id: 'L3_ZONE_W',
    type: 'W',
    name: '虚弱区',
    description: '踩中后投掷点数-1',
    cellIds: ['R1C1', 'R1C5', 'R2C0'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L3_ZONE_N',
    type: 'N',
    name: '知识区',
    description: '踩中后获得随机书籍×1',
    cellIds: ['R3C1', 'R3C5'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
    currentTriggerCount: 0,
  },
  {
    id: 'L3_ZONE_I',
    type: 'I',
    name: '反转区',
    description: '踩中后地图倒置',
    cellIds: ['R2C3', 'R4C3'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    maxTriggers: 3,
    currentTriggerCount: 0,
  },
  {
    id: 'L3_ZONE_D',
    type: 'D',
    name: '危险区',
    description: '踩中后随机损失资源',
    cellIds: ['R2C0', 'R2C6'],
    effect: { effectType: 'resource_change', target: 'self', magnitude: -10, duration: 0, stackable: false, priority: 2 },
    visualConfig: { overlayColor: '#FEE2E2', overlayOpacity: 0.4, iconLabel: 'D', borderStyle: 'skull red' },
    currentTriggerCount: 0,
  },
];

const zoneIndex: Record<string, ZoneDefinition> = {};
for (const zone of zones) {
  zoneIndex[zone.type] = zone;
}

export const LAYER_03_DATA: TowerLayerData = {
  layerNumber: 3,
  themeId: 'data-security',
  shapeType: 'concentric-circle-fortress',
  shapeDescription: '同心圆要塞，3层同心圆结构加径向通道，模拟数据保险库防护层',
  gridSize: { rows: 7, cols: 7 },
  totalCells: 13,
  cells,
  cellIndex,
  paths,
  adjacencyList,
  zones,
  zoneIndex,
  startCellId: 'R0C3',
  bossCellId: 'R6C3',
  endCellId: '',
  colorScheme: {
    primary: '#3B82F6',
    secondary: '#2563EB',
    accent: '#FBBF24',
    background: '#1E1B4B',
    pathColor: '#60A5FA',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'vault-gold',
    atmosphere: 'secure-hum',
    particleEffects: ['encryption-symbols', 'lock-pulse'],
  },
};
