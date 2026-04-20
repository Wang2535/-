export enum GridType {
  START = 'start',
  BOSS = 'boss',
  LEVEL = 'level',
  OPPORTUNITY = 'opportunity',
  BOOKSTORE = 'bookstore',
  SKILL = 'skill',
  EXCHANGE = 'exchange',
  TRANSITION = 'transition',
  SPECIAL = 'special',
}

export enum GridState {
  LOCKED = 'locked',
  PENDING = 'pending',
  CURRENT = 'current',
  CLEARED = 'cleared',
  FAILED = 'failed',
}

export type DifficultyStar = 1 | 2 | 3 | 4 | 5;

export enum AreaEffectType {
  WEAK = 'W',
  KNOWLEDGE = 'N',
  INVERT = 'I',
  SKIP = 'P',
  SPEED = 'S',
  DANGER = 'D',
}

export interface AreaEffect {
  type: AreaEffectType;
  color: string;
  animationClass: string;
  description: string;
}

export interface EliteMarker {
  isElite: boolean;
  borderStyle: string;
  icon: string;
  penaltyMultiplier: number;
  rewardMultiplier: number;
}

export interface GridCoordinate {
  x: number;
  y: number;
  section: 'upper' | 'connector' | 'lower';
  ringIndex?: number;
  quadrant?: 1 | 2 | 3 | 4;
}

export interface GridCell {
  id: string;
  layer: number;
  type: GridType;
  state: GridState;
  coordinate: GridCoordinate;
  difficulty?: DifficultyStar;
  eliteMarker?: EliteMarker;
  areaEffects: AreaEffect[];
  adjacentCells: string[];
  levelData?: {
    levelId: string;
    theme: string;
    cleared: boolean;
    failedCount: number;
  };
  bossData?: {
    unlocked: boolean;
    prototypeLevelId: string;
    mechanismTags: string[];
  };
}

export enum GridPathType {
  MAIN = 'main',
  BRANCH = 'branch',
  SHORTCUT = 'shortcut',
  RETURN = 'return',
  CROSS_RING = 'crossRing',
  SAFE_DOOR = 'safeDoor',
  BACKFLOW = 'backflow',
}

export interface GridPathCondition {
  type: 'clearAll' | 'clearSpecific' | 'unlockItem' | 'random';
  requiredCellIds?: string[];
  unlockItemId?: string;
  probability?: number;
}

export interface GridPathVisualStyle {
  color: string;
  width: number;
  dashArray?: number[];
  animated?: boolean;
}

export interface GridPathConnection {
  id: string;
  fromCellId: string;
  toCellId: string;
  pathType: GridPathType;
  bidirectional: boolean;
  distance: number;
  condition?: GridPathCondition;
  visualStyle?: GridPathVisualStyle;
}

export interface GourdMapParameters {
  upperRadius: number;
  lowerRadius: number;
  connectorWidth: number;
  upperCenterY: number;
  lowerCenterY: number;
  upperEccentricity: number;
  lowerEccentricity: number;
  rotation: number;
}

export interface GourdMapTopology {
  layer: number;
  cells?: GridCell[];
  upperCircle: {
    center: { x: number; y: number };
    radius: number;
    cellIds: string[];
  };
  connector: {
    cellIds: string[];
    width: number;
  };
  lowerCircle: {
    center: { x: number; y: number };
    radius: number;
    cellIds: string[];
    quadrants: {
      1: AreaEffectType;
      2: AreaEffectType;
      3: AreaEffectType;
      4: AreaEffectType;
    };
  };
  connections: GridPathConnection[];
  stats: {
    totalCells: number;
    cellsByType: Partial<Record<GridType, number>>;
    avgPathLength: number;
    loopPaths: number;
  };
}

export interface SvgPathData {
  outline: string;
  regions: Array<{
    id: string;
    path: string;
    fill: string;
  }>;
  connections: Array<{
    fromId: string;
    toId: string;
    path: string;
  }>;
}
