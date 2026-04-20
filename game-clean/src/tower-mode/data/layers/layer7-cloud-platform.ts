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
    metadata: { label: '云端入口' },
    eventPoolIds: [],
    currentVisitCount: 0,
  },
  {
    id: 'R1C1',
    coordinate: [1, 1],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV097',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R1C4',
    coordinate: [1, 4],
    type: 'battle',
    state: 'locked',
    zone: 'N',
    levelId: 'LV098',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R1C5',
    coordinate: [1, 5],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV099',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R2C2',
    coordinate: [2, 2],
    type: 'skill',
    state: 'locked',
    zone: 'I',
    tierProbabilityTable: { common: 20, good: 25, rare: 30, epic: 18, legendary: 7 },
    maxSkillSlots: 3,
  },
  {
    id: 'R2C4',
    coordinate: [2, 4],
    type: 'bookstore',
    state: 'locked',
    zone: 'N',
    bookPoolTheme: 'cloud-virtual',
    bookCountPerVisit: 3,
  },
  {
    id: 'R3C0',
    coordinate: [3, 0],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV100',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R3C3',
    coordinate: [3, 3],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV101',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R3C5',
    coordinate: [3, 5],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV102',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R3C6',
    coordinate: [3, 6],
    type: 'chance',
    state: 'locked',
    eventPoolIds: ['CE_L7_VM_ESCAPE'],
    currentVisitCount: 0,
  },
  {
    id: 'R4C1',
    coordinate: [4, 1],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV103',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R4C3',
    coordinate: [4, 3],
    type: 'battle',
    state: 'locked',
    levelId: 'LV104',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R4C5',
    coordinate: [4, 5],
    type: 'battle',
    state: 'locked',
    levelId: 'LV105',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R5C3',
    coordinate: [5, 3],
    type: 'boss',
    state: 'locked',
    bossLevelId: 'LV112_BOSS',
    isDefeated: false,
    enhancementLevel: 8,
    dataPacketPoolIds: ['DP_T7_01', 'DP_T7_02', 'DP_T7_03', 'DP_T7_04', 'DP_T7_05', 'DP_T7_06', 'DP_T7_07', 'DP_T7_08', 'DP_T7_09'],
  },
];

const paths: PathConnection[] = [
  { id: 'p_R0C3_R1C1', from: 'R0C3', to: 'R1C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R0C3_R1C4', from: 'R0C3', to: 'R1C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C2', from: 'R1C1', to: 'R2C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C4_R2C4', from: 'R1C4', to: 'R2C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C4_R1C5', from: 'R1C4', to: 'R1C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C5_R2C4', from: 'R1C5', to: 'R2C4', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C2_R3C0', from: 'R2C2', to: 'R3C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C2_R3C3', from: 'R2C2', to: 'R3C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C4_R3C3', from: 'R2C4', to: 'R3C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C4_R3C5', from: 'R2C4', to: 'R3C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C5_R3C6', from: 'R3C5', to: 'R3C6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C0_R4C1', from: 'R3C0', to: 'R4C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C3_R4C3', from: 'R3C3', to: 'R4C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C3_R4C1', from: 'R3C3', to: 'R4C1', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R3C5_R4C5', from: 'R3C5', to: 'R4C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C1_R4C3', from: 'R4C1', to: 'R4C3', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R4C3_R5C3', from: 'R4C3', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
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
    id: 'L7_ZONE_W',
    type: 'W',
    name: '虚弱区',
    description: '踩中后投掷点数-1',
    cellIds: ['R1C1', 'R1C5', 'R4C1'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L7_ZONE_N',
    type: 'N',
    name: '知识区',
    description: '踩中后获得随机书籍×1',
    cellIds: ['R1C4', 'R2C4'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
    currentTriggerCount: 0,
  },
  {
    id: 'L7_ZONE_I',
    type: 'I',
    name: '反转区',
    description: '踩中后地图倒置',
    cellIds: ['R2C2', 'R3C3'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    maxTriggers: 3,
    currentTriggerCount: 0,
  },
  {
    id: 'L7_ZONE_D',
    type: 'D',
    name: '危险区',
    description: '踩中后资源-10',
    cellIds: ['R3C0', 'R3C5'],
    effect: { effectType: 'resource_change', target: 'self', magnitude: -10, duration: 0, stackable: false, priority: 2 },
    visualConfig: { overlayColor: '#FEE2E2', overlayOpacity: 0.4, iconLabel: 'D', borderStyle: 'skull red' },
    currentTriggerCount: 0,
  },
];

const zoneIndex: Record<string, ZoneDefinition> = {};
for (const zone of zones) {
  zoneIndex[zone.type] = zone;
}

export const LAYER_07_DATA: TowerLayerData = {
  layerNumber: 7,
  themeId: 'cloud-virtual',
  shapeType: 'irregular-cloud',
  shapeDescription: '不规则云状布局，飘逸浮动平台，模拟云端虚拟化环境',
  gridSize: { rows: 6, cols: 7 },
  totalCells: 14,
  cells,
  cellIndex,
  paths,
  adjacencyList,
  zones,
  zoneIndex,
  startCellId: 'R0C3',
  bossCellId: 'R5C3',
  endCellId: '',
  colorScheme: {
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#F59E0B',
    background: '#0C4A6E',
    pathColor: '#38BDF8',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'cloud-soft-blue',
    atmosphere: 'virtualization-hum',
    particleEffects: ['cloud-wisps', 'data-streams'],
  },
};
