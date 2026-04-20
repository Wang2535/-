import type { CellType, CellState } from './cell.types';

export type PathType = 'main' | 'branch' | 'shortcut' | 'bridge' | 'return' | 'crossRing' | 'safeDoor' | 'backflow';

export interface CheckerboardBorder {
  enabled: boolean;
  borderWidth: number;
  colors: [string, string];
  tileSize: number;
  borderRadius: number;
  padding: number;
}

export interface QuadrantLabel {
  quadrant: 'W' | 'N' | 'I' | 'P';
  label: string;
  fontSizeRatio: number;
  color: string;
  fontWeight: string;
  backgroundColor: string;
  backgroundOpacity: number;
}

export interface CellVisualStyle {
  cellType: CellType;
  sizeMultiplier: number;
  shape: 'circle' | 'ellipse' | 'roundedRect' | 'hexagon';
  backgroundGradient: { from: string; to: string; angle: number };
  border: { width: number; color: string; style: 'solid' | 'dashed' | 'double' };
  icon: { type: 'svg' | 'image' | 'emoji'; data: string };
  glowEffect?: { color: string; size: number; pulse: boolean };
}

export interface CellStateVisualOverride {
  state: CellState;
  opacity: number;
  filter: string;
  overlayIcon?: string;
  overlayColor?: string;
  animationClass?: string;
}

export interface PathVisualStyle {
  pathType: PathType;
  strokeWidth: number;
  strokeColor: string;
  dashed: boolean;
  dashPattern?: string;
  curveTension: number;
  roadTexture?: string;
  arrowHead?: { size: number; color: string };
}

export interface ZoneBackgroundConfig {
  zoneType: string;
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'image';
  backgroundData: string;
  opacity: number;
  enterAnimation: 'ripple' | 'sparkle' | 'flash' | 'countdown' | 'warning';
}
