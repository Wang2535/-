import type {
  ZoneType,
  EffectTarget,
  ZoneEffectConfig,
  ZoneVisualConfig,
  ZoneDefinition,
  TierProbabilityRow,
  Coordinate2D,
  GridSize,
  ThemeCategory,
  CellType,
  CellState,
  BaseCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
  GameCell,
  PathConnection,
  LayerColorScheme,
  AmbientConfig,
  TowerLayerData,
} from '../../types';

const cells: GameCell[] = [
  { id: 'R0C3', coordinate: [0, 3], type: 'chance', state: 'unlocked', metadata: { label: '网络入口' }, eventPoolIds: [], currentVisitCount: 0 },
  { id: 'R1C1', coordinate: [1, 1], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV017', difficulty: 2, isCompleted: false },
  { id: 'R1C5', coordinate: [1, 5], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV018', difficulty: 2, isCompleted: false },
  { id: 'R2C0', coordinate: [2, 0], type: 'battle', state: 'locked', zone: 'S', levelId: 'LV019', difficulty: 2, isCompleted: false },
  { id: 'R2C6', coordinate: [2, 6], type: 'battle', state: 'locked', zone: 'S', levelId: 'LV020', difficulty: 2, isCompleted: false },
  { id: 'R4C0', coordinate: [4, 0], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV025', difficulty: 3, isCompleted: false },
  { id: 'R4C6', coordinate: [4, 6], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV026', difficulty: 3, isCompleted: false },
  { id: 'R5C1', coordinate: [5, 1], type: 'chance', state: 'locked', zone: 'P', eventPoolIds: ['CE_L2_ROUTER'], currentVisitCount: 0 },
  { id: 'R2C3', coordinate: [2, 3], type: 'skill', state: 'locked', tierProbabilityTable: { common: 50, good: 30, rare: 15, epic: 4, legendary: 1 }, maxSkillSlots: 3 },
  { id: 'R3C1', coordinate: [3, 1], type: 'battle', state: 'locked', zone: 'N', levelId: 'LV021', difficulty: 2, isCompleted: false },
  { id: 'R3C3', coordinate: [3, 3], type: 'battle', state: 'locked', zone: 'I', levelId: 'LV023', difficulty: 3, isCompleted: false },
  { id: 'R3C5', coordinate: [3, 5], type: 'battle', state: 'locked', zone: 'N', levelId: 'LV022', difficulty: 3, isCompleted: false },
  { id: 'R4C3', coordinate: [4, 3], type: 'bookstore', state: 'locked', bookPoolTheme: 'network', bookCountPerVisit: 3 },
  { id: 'R4C5', coordinate: [4, 5], type: 'skill', state: 'locked', zone: 'I', tierProbabilityTable: { common: 50, good: 30, rare: 15, epic: 4, legendary: 1 }, maxSkillSlots: 3 },
  { id: 'R5C3', coordinate: [5, 3], type: 'battle', state: 'locked', levelId: 'LV027', difficulty: 4, isCompleted: false },
  { id: 'R5C5', coordinate: [5, 5], type: 'battle', state: 'locked', zone: 'P', levelId: 'LV024', difficulty: 3, isCompleted: false },
  { id: 'R6C3', coordinate: [6, 3], type: 'boss', state: 'locked', bossLevelId: 'LV032_BOSS', isDefeated: false, enhancementLevel: 4, dataPacketPoolIds: ['DP_T2_01', 'DP_T2_02', 'DP_T2_03', 'DP_T2_04', 'DP_T2_05', 'DP_T2_06', 'DP_T2_07', 'DP_T2_08', 'DP_T2_09'] },
];

const paths: PathConnection[] = [
  { id: 'p_R0C3_R1C1', from: 'R0C3', to: 'R1C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R0C3_R1C5', from: 'R0C3', to: 'R1C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C0', from: 'R1C1', to: 'R2C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C5_R2C6', from: 'R1C5', to: 'R2C6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C0_R4C0', from: 'R2C0', to: 'R4C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C6_R4C6', from: 'R2C6', to: 'R4C6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C0_R5C1', from: 'R4C0', to: 'R5C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C6_R5C5', from: 'R4C6', to: 'R5C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R5C1_R5C3', from: 'R5C1', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R5C5_R5C3', from: 'R5C5', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C3_R3C1', from: 'R2C3', to: 'R3C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C3_R3C5', from: 'R2C3', to: 'R3C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C1_R3C3', from: 'R3C1', to: 'R3C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C5_R3C3', from: 'R3C5', to: 'R3C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C3_R4C3', from: 'R3C3', to: 'R4C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C3_R4C5', from: 'R3C3', to: 'R4C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C3_R5C3', from: 'R4C3', to: 'R5C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C5_R5C5', from: 'R4C5', to: 'R5C5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C3', from: 'R1C1', to: 'R2C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R1C5_R2C3', from: 'R1C5', to: 'R2C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C0_R3C1', from: 'R2C0', to: 'R3C1', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R2C6_R3C5', from: 'R2C6', to: 'R3C5', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R4C0_R4C3', from: 'R4C0', to: 'R4C3', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R4C6_R4C5', from: 'R4C6', to: 'R4C5', direction: 'bidirectional', pathType: 'bridge', distance: 1 },
  { id: 'p_R5C3_R6C3', from: 'R5C3', to: 'R6C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
];

const zones: ZoneDefinition[] = [
  {
    id: 'L2_ZONE_W',
    type: 'W',
    name: '虚弱区',
    description: '踩中后投掷点数-1',
    cellIds: ['R1C1', 'R1C5', 'R4C0', 'R4C6'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    currentTriggerCount: 0,
  },
  {
    id: 'L2_ZONE_N',
    type: 'N',
    name: '知识区',
    description: '踩中后获得随机书籍×1',
    cellIds: ['R3C1', 'R3C5', 'R4C3'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
    currentTriggerCount: 0,
  },
  {
    id: 'L2_ZONE_I',
    type: 'I',
    name: '反转区',
    description: '踩中后地图倒置',
    cellIds: ['R3C3', 'R4C5'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    maxTriggers: 3,
    currentTriggerCount: 0,
  },
  {
    id: 'L2_ZONE_P',
    type: 'P',
    name: '休整区',
    description: '踩中后跳过下一回合',
    cellIds: ['R5C1', 'R5C5'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: false, priority: 3 },
    visualConfig: { overlayColor: '#FEF3C7', overlayOpacity: 0.3, iconLabel: 'P', borderStyle: 'striped amber' },
    currentTriggerCount: 0,
  },
  {
    id: 'L2_ZONE_S',
    type: 'S',
    name: '加速区',
    description: '踩中后移动点数+1',
    cellIds: ['R2C0', 'R2C6'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 5 },
    visualConfig: { overlayColor: '#D1FAE5', overlayOpacity: 0.3, iconLabel: 'S', borderStyle: 'dashed green' },
    currentTriggerCount: 0,
  },
];

const cellIndex: Record<string, GameCell> = {};
for (const cell of cells) {
  cellIndex[cell.id] = cell;
}

const adjacencyList: Record<string, string[]> = {};
for (const path of paths) {
  if (!adjacencyList[path.from]) adjacencyList[path.from] = [];
  if (!adjacencyList[path.to]) adjacencyList[path.to] = [];
  adjacencyList[path.from].push(path.to);
  if (path.direction === 'bidirectional') {
    adjacencyList[path.to].push(path.from);
  }
}

const zoneIndex: Record<string, ZoneDefinition> = {};
for (const zone of zones) {
  zoneIndex[zone.type] = zone;
}

export const LAYER_02_DATA: TowerLayerData = {
  layerNumber: 2,
  themeId: 'network',
  shapeType: 'dual-ring-topology',
  shapeDescription: '双环拓扑网络，内外双环交叉连接，模拟网络路由结构',
  gridSize: { rows: 7, cols: 7 },
  totalCells: 17,
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
    primary: '#06B6D4',
    secondary: '#0891B2',
    accent: '#F59E0B',
    background: '#0F172A',
    pathColor: '#22D3EE',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'neon-cyan',
    atmosphere: 'network-pulse',
    particleEffects: ['data-packets-flow', 'circuit-traces'],
  },
};
