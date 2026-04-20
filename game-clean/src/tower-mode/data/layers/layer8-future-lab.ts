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
    metadata: { label: '实验室入口' },
    eventPoolIds: [],
    currentVisitCount: 0,
  },
  {
    id: 'R1C1',
    coordinate: [1, 1],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV113',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R1C3',
    coordinate: [1, 3],
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV114',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R1C5',
    coordinate: [1, 5],
    type: 'battle',
    state: 'locked',
    zone: 'N',
    levelId: 'LV115',
    difficulty: 4,
    isCompleted: false,
  },
  {
    id: 'R2C0',
    coordinate: [2, 0],
    type: 'battle',
    state: 'locked',
    zone: 'W',
    levelId: 'LV116',
    difficulty: 5,
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
    type: 'battle',
    state: 'locked',
    zone: 'I',
    levelId: 'LV117',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R2C6',
    coordinate: [2, 6],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV118',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R3C1',
    coordinate: [3, 1],
    type: 'battle',
    state: 'locked',
    zone: 'N',
    levelId: 'LV119',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R3C3',
    coordinate: [3, 3],
    type: 'bookstore',
    state: 'locked',
    zone: 'S',
    bookPoolTheme: 'ai-emerging',
    bookCountPerVisit: 3,
  },
  {
    id: 'R3C5',
    coordinate: [3, 5],
    type: 'battle',
    state: 'locked',
    zone: 'D',
    levelId: 'LV120',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R4C1',
    coordinate: [4, 1],
    type: 'chance',
    state: 'locked',
    zone: 'S',
    eventPoolIds: ['CE_L8_QUANTUM'],
    currentVisitCount: 0,
  },
  {
    id: 'R4C3',
    coordinate: [4, 3],
    type: 'battle',
    state: 'locked',
    levelId: 'LV121',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R4C5',
    coordinate: [4, 5],
    type: 'battle',
    state: 'locked',
    levelId: 'LV122',
    difficulty: 5,
    isCompleted: false,
  },
  {
    id: 'R5C3',
    coordinate: [5, 3],
    type: 'boss',
    state: 'locked',
    bossLevelId: 'LV127_BOSS',
    isDefeated: false,
    enhancementLevel: 9,
    dataPacketPoolIds: ['DP_T8_01', 'DP_T8_02', 'DP_T8_03', 'DP_T8_04', 'DP_T8_05', 'DP_T8_06', 'DP_T8_07', 'DP_T8_08', 'DP_T8_09'],
  },
];

const paths: PathConnection[] = [
  { id: 'p_R0C3_R1C1', from: 'R0C3', to: 'R1C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R0C3_R1C3', from: 'R0C3', to: 'R1C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R0C3_R1C5', from: 'R0C3', to: 'R1C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C0', from: 'R1C1', to: 'R2C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C2', from: 'R1C1', to: 'R2C2', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R1C3_R2C2', from: 'R1C3', to: 'R2C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C3_R2C4', from: 'R1C3', to: 'R2C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C5_R2C4', from: 'R1C5', to: 'R2C4', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R1C5_R2C6', from: 'R1C5', to: 'R2C6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C0_R3C1', from: 'R2C0', to: 'R3C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C2_R3C1', from: 'R2C2', to: 'R3C1', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C2_R3C3', from: 'R2C2', to: 'R3C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C4_R3C3', from: 'R2C4', to: 'R3C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C4_R3C5', from: 'R2C4', to: 'R3C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C6_R3C5', from: 'R2C6', to: 'R3C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C1_R4C1', from: 'R3C1', to: 'R4C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C3_R4C3', from: 'R3C3', to: 'R4C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C5_R4C5', from: 'R3C5', to: 'R4C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C1_R4C3', from: 'R4C1', to: 'R4C3', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R4C3_R4C5', from: 'R4C3', to: 'R4C5', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R4C3_R5C3', from: 'R4C3', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
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
    id: 'L8_ZONE_W',
    type: 'W',
    name: '虚弱区',
    description: '踩中后投掷点数-1',
    cellIds: ['R1C1', 'R2C0', 'R2C6'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L8_ZONE_N',
    type: 'N',
    name: '知识区',
    description: '踩中后获得随机书籍×1',
    cellIds: ['R1C5', 'R3C1'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
    currentTriggerCount: 0,
  },
  {
    id: 'L8_ZONE_I',
    type: 'I',
    name: '反转区',
    description: '踩中后地图倒置',
    cellIds: ['R1C3', 'R2C2', 'R2C4'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    maxTriggers: 3,
    currentTriggerCount: 0,
  },
  {
    id: 'L8_ZONE_D',
    type: 'D',
    name: '危险区',
    description: '踩中后资源-10',
    cellIds: ['R2C6', 'R3C5'],
    effect: { effectType: 'resource_change', target: 'self', magnitude: -10, duration: 0, stackable: false, priority: 2 },
    visualConfig: { overlayColor: '#FEE2E2', overlayOpacity: 0.4, iconLabel: 'D', borderStyle: 'skull red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L8_ZONE_S',
    type: 'S',
    name: '加速区',
    description: '踩中后投掷点数+1',
    cellIds: ['R3C3', 'R4C1'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 5 },
    visualConfig: { overlayColor: '#D1FAE5', overlayOpacity: 0.3, iconLabel: 'S', borderStyle: 'dashed green' },
    currentTriggerCount: 0,
  },
];

const zoneIndex: Record<string, ZoneDefinition> = {};
for (const zone of zones) {
  zoneIndex[zone.type] = zone;
}

export const LAYER_08_DATA: TowerLayerData = {
  layerNumber: 8,
  themeId: 'ai-emerging',
  shapeType: 'quantum-cloud',
  shapeDescription: '量子云团布局，概率性路径与叠加态格子，模拟AI与新兴技术不确定性',
  gridSize: { rows: 6, cols: 7 },
  totalCells: 15,
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
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#A855F7',
    background: '#1E1B4B',
    pathColor: '#F472B6',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'quantum-pink',
    atmosphere: 'ai-computation',
    particleEffects: ['quantum-entanglement', 'neural-network-pulse'],
  },
};
