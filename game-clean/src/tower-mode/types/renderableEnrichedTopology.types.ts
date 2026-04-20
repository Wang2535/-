import type { EnrichedTopology } from './enrichedTopology.types';
import type { GourdCoordinate } from './gourdCoordinate.types';
import type { SvgPathData } from './grid.types';
import type { MapVisualConfig } from '../data/mapVisualConfig';

export interface LayerBorderConfig {
  enabled: boolean;
  mode: 'checkerboard-fill' | 'radial-lines';
  borderWidth: number;
  colors: string[];
  tileSize: number;
  innerPadding: number;
  cornerRadius: number;
  opacity: number;
  glowColor: string;
}

export interface QuadrantLabelV2 {
  quadrant: 'W' | 'N' | 'I' | 'P';
  label: string;
  fontSizeRatio: number;
  color: string;
  fontWeight: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  backgroundColor: string;
  backgroundOpacity: number;
}

export interface CellVisualStyleV2 {
  sizeMultiplier: number;
  shape: 'circle' | 'ellipse' | 'roundedRect' | 'hexagon';
  backgroundGradient: { from: string; to: string; angle: number };
  border: { width: number; color: string; style: 'solid' | 'dashed' | 'double' };
  icon: { type: 'svg' | 'image' | 'emoji'; data: string };
  glowEffect?: { color: string; size: number; pulse: boolean };
  animationClass?: string;
}

export interface StateVisualOverride {
  opacity: number;
  filter: string;
  overlayIcon?: string;
  overlayColor?: string;
  animationClass?: string;
}

export interface PathVisualStyle {
  color: string;
  width: number;
  dashArray: number[];
  animated: boolean;
}

export interface ZoneBackgroundV2 {
  zoneType: string;
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'image';
  backgroundData: string;
  opacity: number;
  enterAnimation: 'ripple' | 'sparkle' | 'flash' | 'countdown' | 'warning';
  centerPosition: { x: number; y: number };
  shape: 'quadrant' | 'circle' | 'ring' | 'custom';
  enterAnimClass: string;
}

export interface LayerBackground {
  primary: string;
  secondary: string;
  gradient: string;
}

export interface DecorationItem {
  type: 'particle' | 'glow' | 'symbol' | 'line';
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface LayerVisualData {
  border: LayerBorderConfig;
  quadrantLabels: QuadrantLabelV2[];
  cellVisualStyles: Map<string, CellVisualStyleV2>;
  stateVisualOverrides: Record<string, StateVisualOverride>;
  pathVisualStyles: Record<string, PathVisualStyle>;
  zoneBackgrounds: Record<string, ZoneBackgroundV2>;
  background: LayerBackground;
  gourdCoordinates: Record<string, GourdCoordinate>;
  decorations: DecorationItem[];
}

export interface RenderableEnrichedTopology extends EnrichedTopology {
  gourdShape: import('./gourdCoordinate.types').GourdShapeParams;
  svgPaths: SvgPathData;
  visualConfig: MapVisualConfig;
  border: LayerBorderConfig;
  quadrantLabels: QuadrantLabelV2[];
  cellVisualStyles: Map<string, CellVisualStyleV2>;
  stateVisualOverrides: Record<string, StateVisualOverride>;
  pathVisualStyles: Record<string, PathVisualStyle>;
  zoneBackgrounds: Record<string, ZoneBackgroundV2>;
  background: LayerBackground;
  gourdCoordinates: Record<string, GourdCoordinate>;
  decorations: DecorationItem[];
}

export interface RenderableEnrichedTopologyV3 extends RenderableEnrichedTopology {
  layerTheme: import('./gameMechanics.types').LayerThemeConfig;
  layerMechanic: import('./gameMechanics.types').LayerSpecialMechanicData;
  cellInfoMap: Map<string, import('./gameMechanics.types').CellInfoPanelData>;
  activeZoneEffects: import('./gameMechanics.types').ZoneEffectInstance[];
  hiddenPaths?: Array<{ from: string; to: string; locked: boolean }>;
  hexAdjacency?: Map<string, string[]>;
  protocolSequence?: string[];
}
