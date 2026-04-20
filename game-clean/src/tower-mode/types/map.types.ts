import type { Coordinate2D, GridSize, ThemeCategory, GameCell } from './cell.types';
import type { ZoneType, ZoneDefinition } from './zone.types';

export interface PathConnection {
  id: string;
  from: string;
  to: string;
  direction: 'bidirectional' | 'one-way';
  pathType: 'main' | 'shortcut' | 'bridge';
  distance: number;
  visualStyle?: string;
}

export interface LayerColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  pathColor: string;
  zoneColors: Record<ZoneType, string>;
}

export interface AmbientConfig {
  lighting: string;
  atmosphere: string;
  particleEffects: string[];
}

export interface TowerLayerData {
  layerNumber: number;
  themeId: ThemeCategory;
  shapeType: string;
  shapeDescription: string;
  gridSize: GridSize;
  totalCells: number;
  cells: GameCell[];
  cellIndex: Record<string, GameCell>;
  paths: PathConnection[];
  adjacencyList: Record<string, string[]>;
  zones: ZoneDefinition[];
  zoneIndex: Record<ZoneType, ZoneDefinition>;
  startCellId: string;
  bossCellId: string;
  endCellId: string;
  colorScheme: LayerColorScheme;
  ambientConfig: AmbientConfig;
}
