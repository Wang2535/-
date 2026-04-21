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
  GameCell,
  PathConnection,
  LayerColorScheme,
  AmbientConfig,
  TowerLayerData,
} from '../../types';

const _cells: GameCell[] = [
  // 上半部分 - 不规则弧形路径
  { id: 'u1', coordinate: [50, 10], type: 'start', state: 'unlocked', zone: undefined, metadata: { label: '起点' } },
  { id: 'u2', coordinate: [60, 15], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 1, isCompleted: false },
  { id: 'u3', coordinate: [70, 22], type: 'chance', state: 'locked', zone: undefined, eventPoolIds: [], currentVisitCount: 0 },
  { id: 'u4', coordinate: [78, 30], type: 'skill', state: 'locked', zone: undefined, tierProbabilityTable: { common: 50, good: 30, rare: 15, epic: 4, legendary: 1 }, maxSkillSlots: 3 },
  { id: 'u5', coordinate: [82, 40], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 2, isCompleted: false },
  { id: 'u6', coordinate: [78, 50], type: 'chance', state: 'locked', zone: undefined, eventPoolIds: [], currentVisitCount: 0 },
  { id: 'u7', coordinate: [70, 58], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 2, isCompleted: false },
  
  // 连接路径
  { id: 'c1', coordinate: [60, 64], type: 'bookstore', state: 'locked', zone: undefined, bookPoolTheme: 'srayland', bookCountPerVisit: 3 },
  { id: 'c2', coordinate: [50, 68], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 2, isCompleted: false },
  
  // 下半部分 - 标准圆形路径
  { id: 'l1', coordinate: [40, 72], type: 'battle', state: 'locked', zone: 'W', levelId: '', difficulty: 3, isCompleted: false },
  { id: 'l2', coordinate: [32, 80], type: 'chance', state: 'locked', zone: 'W', eventPoolIds: [], currentVisitCount: 0 },
  { id: 'l3', coordinate: [30, 90], type: 'battle', state: 'locked', zone: 'I', levelId: '', difficulty: 3, isCompleted: false },
  { id: 'l4', coordinate: [35, 100], type: 'special', state: 'locked', zone: 'I', metadata: { label: '交流会' } },
  { id: 'l5', coordinate: [45, 105], type: 'battle', state: 'locked', zone: 'P', levelId: '', difficulty: 3, isCompleted: false },
  { id: 'l6', coordinate: [55, 105], type: 'battle', state: 'locked', zone: 'P', levelId: '', difficulty: 3, isCompleted: false },
  { id: 'l7', coordinate: [65, 100], type: 'chance', state: 'locked', zone: 'N', eventPoolIds: [], currentVisitCount: 0 },
  { id: 'l8', coordinate: [70, 90], type: 'battle', state: 'locked', zone: 'N', levelId: '', difficulty: 4, isCompleted: false },
  { id: 'l9', coordinate: [68, 80], type: 'boss', state: 'locked', zone: undefined, bossLevelId: '', isDefeated: false, enhancementLevel: 3, dataPacketPoolIds: ['DP_S1_01', 'DP_S1_02', 'DP_S1_03', 'DP_S1_04', 'DP_S1_05', 'DP_S1_06', 'DP_S1_07', 'DP_S1_08', 'DP_S1_09'] },
  { id: 'l10', coordinate: [60, 72], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 2, isCompleted: false },
  
  // 短柄延伸
  { id: 's1', coordinate: [45, 5], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 1, isCompleted: false },
  { id: 's2', coordinate: [40, 8], type: 'battle', state: 'locked', zone: undefined, levelId: '', difficulty: 1, isCompleted: false },
];

const _paths: PathConnection[] = [
  // 短柄延伸连接
  { id: 'p_s2_s1', from: 's2', to: 's1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_s1_u1', from: 's1', to: 'u1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  
  // 上半部分 - 不规则弧形路径
  { id: 'p_u1_u2', from: 'u1', to: 'u2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_u2_u3', from: 'u2', to: 'u3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_u3_u4', from: 'u3', to: 'u4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_u4_u5', from: 'u4', to: 'u5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_u5_u6', from: 'u5', to: 'u6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_u6_u7', from: 'u6', to: 'u7', direction: 'bidirectional', pathType: 'main', distance: 1 },
  
  // 连接路径
  { id: 'p_u7_c1', from: 'u7', to: 'c1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_c1_c2', from: 'c1', to: 'c2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  
  // 下半部分 - 标准圆形路径
  { id: 'p_c2_l1', from: 'c2', to: 'l1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l1_l2', from: 'l1', to: 'l2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l2_l3', from: 'l2', to: 'l3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l3_l4', from: 'l3', to: 'l4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l4_l5', from: 'l4', to: 'l5', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l5_l6', from: 'l5', to: 'l6', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l6_l7', from: 'l6', to: 'l7', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l7_l8', from: 'l7', to: 'l8', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l8_l9', from: 'l8', to: 'l9', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l9_l10', from: 'l9', to: 'l10', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_l10_c2', from: 'l10', to: 'c2', direction: 'bidirectional', pathType: 'main', distance: 1 },
];

const _zones: ZoneDefinition[] = [
  {
    id: 'SRAY_ZONE_W', type: 'W', name: '虚弱区', description: '踩中后下次投掷骰子点数-1',
    cellIds: ['l1', 'l2'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    maxTriggers: Infinity, cooldownTurns: 0,
  },
  {
    id: 'SRAY_ZONE_N', type: 'N', name: '知识区', description: '踩中后获得随机书籍×1',
    cellIds: ['l7', 'l8'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
  },
  {
    id: 'SRAY_ZONE_I', type: 'I', name: '反转区', description: '踩中后地图倒置',
    cellIds: ['l3', 'l4'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    globalMaxTriggers: 3,
  },
  {
    id: 'SRAY_ZONE_P', type: 'P', name: '休整区', description: '踩中后跳过下一回合',
    cellIds: ['l5', 'l6'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: false, priority: 3 },
    visualConfig: { overlayColor: '#FEF3C7', overlayOpacity: 0.3, iconLabel: 'P', borderStyle: 'striped amber' },
  },
];

const _cellIndex: Record<string, GameCell> = Object.fromEntries(
  _cells.map(c => [c.id, c])
);

const _adjacencyList: Record<string, string[]> = (() => {
  const adj: Record<string, string[]> = {};
  for (const cell of _cells) {
    adj[cell.id] = [];
  }
  for (const path of _paths) {
    adj[path.from].push(path.to);
    adj[path.to].push(path.from);
  }
  return adj;
})();

const _zoneIndex: Record<string, ZoneDefinition> = Object.fromEntries(
  _zones.map(z => [z.type, z])
);

export const SRAYLAND_LAYER_DATA: TowerLayerData = {
  layerNumber: 1,
  themeId: 'srayland',
  shapeType: 'apple-outline',
  shapeDescription: '苹果轮廓的双路径结构，上半部分为不规则弧形，下半部分为标准圆形',
  gridSize: { rows: 12, cols: 12 },
  totalCells: _cells.length,
  startCellId: 'u1',
  bossCellId: 'l9',
  endCellId: 'l9',
  cells: _cells,
  cellIndex: _cellIndex,
  paths: _paths,
  adjacencyList: _adjacencyList,
  zones: _zones,
  zoneIndex: _zoneIndex,
  colorScheme: {
    primary: '#22C55E',
    secondary: '#16A34A',
    accent: '#DC2626',
    background: '#F5DEB3',
    pathColor: '#8B4513',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'warm-golden',
    atmosphere: 'vintage-map',
    particleEffects: ['floating-leaves', 'sunlight-rays'],
  },
};
