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
  { id: 'R0C2', coordinate: [0, 2], type: 'chance', state: 'unlocked', zone: undefined, metadata: { label: '入口安检' }, eventPoolIds: [], currentVisitCount: 0 } as ChanceCell,
  { id: 'R1C1', coordinate: [1, 1], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV001', difficulty: 1, isCompleted: false } as BattleCell,
  { id: 'R1C2', coordinate: [1, 2], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV002', difficulty: 2, isCompleted: false } as BattleCell,
  { id: 'R1C3', coordinate: [1, 3], type: 'battle', state: 'locked', zone: 'N', levelId: 'LV003', difficulty: 2, isCompleted: false } as BattleCell,
  { id: 'R2C0', coordinate: [2, 0], type: 'battle', state: 'locked', zone: 'W', levelId: 'LV005', difficulty: 3, isCompleted: false } as BattleCell,
  { id: 'R2C2', coordinate: [2, 2], type: 'skill', state: 'locked', zone: undefined, tierProbabilityTable: { common: 50, good: 30, rare: 15, epic: 4, legendary: 1 }, maxSkillSlots: 3 } as SkillCell,
  { id: 'R2C4', coordinate: [2, 4], type: 'bookstore', state: 'locked', zone: 'N', bookPoolTheme: 'virus', bookCountPerVisit: 3 } as BookstoreCell,
  { id: 'R3C1', coordinate: [3, 1], type: 'battle', state: 'locked', zone: 'I', levelId: 'LV007', difficulty: 3, isCompleted: false } as BattleCell,
  { id: 'R3C3', coordinate: [3, 3], type: 'battle', state: 'locked', zone: 'P', levelId: 'LV006', difficulty: 3, isCompleted: false } as BattleCell,
  { id: 'R4C0', coordinate: [4, 0], type: 'chance', state: 'locked', zone: 'I', eventPoolIds: ['CE_L1_DANGER'], currentVisitCount: 0 } as ChanceCell,
  { id: 'R4C2', coordinate: [4, 2], type: 'battle', state: 'locked', zone: undefined, levelId: 'LV008', difficulty: 4, isCompleted: false } as BattleCell,
  { id: 'R4C4', coordinate: [4, 4], type: 'battle', state: 'locked', zone: 'P', levelId: 'LV004', difficulty: 4, isCompleted: false } as BattleCell,
  { id: 'R5C2', coordinate: [5, 2], type: 'boss', state: 'locked', zone: undefined, bossLevelId: 'LV016_BOSS', isDefeated: false, enhancementLevel: 3, dataPacketPoolIds: ['DP_T1_01','DP_T1_02','DP_T1_03','DP_T1_04','DP_T1_05','DP_T1_06','DP_T1_07','DP_T1_08','DP_T1_09'] } as BossCell,
];

const _paths: PathConnection[] = [
  { id: 'p_R0C2_R1C2', from: 'R0C2', to: 'R1C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R1C1', from: 'R1C2', to: 'R1C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R1C3', from: 'R1C2', to: 'R1C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C1_R2C0', from: 'R1C1', to: 'R2C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C3_R2C4', from: 'R1C3', to: 'R2C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R1C2_R2C2', from: 'R1C2', to: 'R2C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C0_R3C1', from: 'R2C0', to: 'R3C1', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R2C2_R3C1', from: 'R2C2', to: 'R3C1', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R2C2_R3C3', from: 'R2C2', to: 'R3C3', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R2C4_R3C3', from: 'R2C4', to: 'R3C3', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C1_R4C0', from: 'R3C1', to: 'R4C0', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C1_R4C2', from: 'R3C1', to: 'R4C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R3C3_R4C2', from: 'R3C3', to: 'R4C2', direction: 'bidirectional', pathType: 'shortcut', distance: 1 },
  { id: 'p_R3C3_R4C4', from: 'R3C3', to: 'R4C4', direction: 'bidirectional', pathType: 'main', distance: 1 },
  { id: 'p_R4C2_R5C2', from: 'R4C2', to: 'R5C2', direction: 'bidirectional', pathType: 'main', distance: 1 },
];

const _zones: ZoneDefinition[] = [
  {
    id: 'L1_ZONE_W', type: 'W', name: '虚弱区', description: '踩中后投掷点数-1',
    cellIds: ['R1C1', 'R1C2', 'R2C0'],
    effect: { effectType: 'dice_modifier', target: 'self', magnitude: -1, duration: 0, stackable: false, priority: 4 },
    visualConfig: { overlayColor: '#FECACA', overlayOpacity: 0.3, iconLabel: 'W', borderStyle: 'dashed red' },
    maxTriggers: Infinity, cooldownTurns: 0,
  },
  {
    id: 'L1_ZONE_N', type: 'N', name: '知识区', description: '踩中后获得随机书籍×1',
    cellIds: ['R1C3', 'R2C4'],
    effect: { effectType: 'special_grant', target: 'self', magnitude: 1, duration: 0, stackable: true, priority: 6 },
    visualConfig: { overlayColor: '#DBEAFE', overlayOpacity: 0.3, iconLabel: 'N', borderStyle: 'solid blue' },
  },
  {
    id: 'L1_ZONE_I', type: 'I', name: '反转区', description: '踩中后地图倒置',
    cellIds: ['R3C1', 'R4C0'],
    effect: { effectType: 'map_effect', target: 'global', magnitude: 1, duration: 0, stackable: false, priority: 1 },
    visualConfig: { overlayColor: '#F3E8FF', overlayOpacity: 0.35, iconLabel: 'I', borderStyle: 'swirling purple' },
    globalMaxTriggers: 3,
  },
  {
    id: 'L1_ZONE_P', type: 'P', name: '休整区', description: '踩中后跳过下一回合',
    cellIds: ['R3C3', 'R4C4'],
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

export const LAYER_01_DATA: TowerLayerData = {
  layerNumber: 1,
  themeId: 'virus',
  shapeType: 'gourd-culture-dish',
  shapeDescription: '葫芦形培养皿，上部窄小入口，下部宽大实验区',
  gridSize: { rows: 6, cols: 6 },
  totalCells: 13,
  startCellId: 'R0C2',
  bossCellId: 'R5C2',
  endCellId: '',
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
    background: '#1F2937',
    pathColor: '#4ADE80',
    zoneColors: { W: '#FECACA', N: '#DBEAFE', I: '#F3E8FF', P: '#FEF3C7', S: '#D1FAE5', D: '#FEE2E2' },
  },
  ambientConfig: {
    lighting: 'bioluminescent-green',
    atmosphere: 'virus-lab-hum',
    particleEffects: ['floating-spores', 'dna-helix-trail'],
  },
};
