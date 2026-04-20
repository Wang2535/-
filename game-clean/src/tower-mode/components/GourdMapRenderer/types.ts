import type { GourdMapTopology, GridCell } from '../../types/grid.types';
import type { LayerShapeConfig } from '../../types/gourdShapeVariants.types';

export type ShapeType = 'circle' | 'ellipse' | 'hexagon' | 'diamond' | 'star' | 'roundedRect';

export interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  timestamp?: number;
}

export interface PlayerPieceState {
  position: { x: number; y: number } | null;
  targetPosition: { x: number; y: number } | null;
  justArrived: boolean;
  trailHistory: TrailPoint[];
  isMoving?: boolean;
  currentZone?: string | null;
  specialMoveType?: 'teleport' | 'map-flip' | 'banish' | null;
}

export interface QuadrantLabelConfig {
  quadrant: string;
  label: string;
  fontSizeRatio: number;
  color: string;
  fontWeight: string;
  fontFamily?: string;
  strokeColor?: string;
  strokeWidth?: number;
  enableShadow?: boolean;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
}

export interface CellVisualStyleConfig {
  shape: ShapeType;
  sizeMultiplier: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  icon: {
    type: 'svg' | 'emoji' | 'letter';
    data: string;
    color?: string;
  };
  animationClass?: string;
  glowEffect?: {
    color: string;
    size: number;
    pulse: boolean;
  };
}

export interface CellStateOverride {
  opacity: number;
  filter: string;
  overlayIcon?: string;
  overlayColor?: string;
  animationClass?: string;
}

export interface BorderConfig {
  enabled: boolean;
  mode: 'checkerboard-fill' | 'radial-lines';
  borderWidth: number;
  colors: [string, string];
  tileSize: number;
  cornerRadius: number;
  opacity: number;
}

export interface DecorationConfig {
  type: 'planet' | 'cloud' | 'crystal' | 'generic'
       | 'network-node' | 'cable-line' | 'golden-ring' | 'lock-icon'
       | 'building-silhouette' | 'neon-sign' | 'conveyor-belt' | 'gear'
       | 'signal-tower' | 'lost-mark' | 'storm-cloud' | 'lightning-bolt'
       | 'quantum-particle' | 'crack-line' | 'throne-pillar' | 'energy-core';
  position: { x: number; y: number };
  size: number;
  color?: string;
  opacity?: number;
  animClass?: string;
}

export interface BossConfig {
  hasThrone?: boolean;
  throneStyle?: 'pillar' | 'crown' | 'dark';
  auraLayers?: Array<{ color: string; radius: number; dashPattern?: string }>;
}

export interface ZoneBackgroundConfig {
  zoneType: string;
  centerPosition?: { x: number; y: number };
  enterAnimClass?: string;
}

export interface CellRenderData {
  id: string;
  x: number;
  y: number;
  type: string;
  state: string;
  cell: GridCell | undefined;
  visualStyle: CellVisualStyleConfig;
  stateOverride: CellStateOverride | undefined;
  isElite: boolean;
  difficulty?: number;
}

export interface GourdMapRendererProps {
  topology: GourdMapTopology;
  cells: GridCell[];
  currentPosition?: string | null;
  highlightedCells?: string[];
  pieceState?: PlayerPieceState | null;
  onCellClick?: (cellId: string) => void;
  enginePhase?: string;
  diceResult?: any;
  cellInfoData?: any;
  bossDangerActive?: boolean;
  activeZoneEffects?: string[];
  layerTheme?: { accentColor: string; particleStyle: string };
  shapeConfig?: LayerShapeConfig;
  onCellEnter?: (cellId: string) => void;
  onCellSkip?: (cellId: string) => void;
  onPanelClose?: () => void;
  onDiceRoll?: () => void;
  onDiceComplete?: () => void;
  layerNumber?: number;
  transitionFromLayer?: number;
  transitionToLayer?: number;
  onTransitionComplete?: () => void;
}

export const DEFAULT_QUADRANT_LABELS: QuadrantLabelConfig[] = [
  { quadrant: 'W', label: 'W', fontSizeRatio: 0.22, color: '#FF8800', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.7, enableShadow: true, shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 3, shadowColor: '#000000' },
  { quadrant: 'N', label: 'N', fontSizeRatio: 0.22, color: '#FFCC00', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.7, enableShadow: true, shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 3, shadowColor: '#000000' },
  { quadrant: 'I', label: 'I', fontSizeRatio: 0.22, color: '#FFCC00', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.7, enableShadow: true, shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 3, shadowColor: '#000000' },
  { quadrant: 'P', label: 'P', fontSizeRatio: 0.22, color: '#FF8800', fontWeight: '900', strokeColor: '#FFFFFF', strokeWidth: 0.7, enableShadow: true, shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 3, shadowColor: '#000000' },
];

function createDefaultCellStyle(
  shape: ShapeType,
  fillColor: string,
  strokeColor: string,
  iconData: string,
  sizeMultiplier = 1.0,
  iconType: 'svg' | 'emoji' | 'letter' = 'letter',
): CellVisualStyleConfig {
  return { shape, sizeMultiplier, fillColor, strokeColor, strokeWidth: 1.5, icon: { type: iconType, data: iconData } };
}

export const DEFAULT_CELL_STYLES: Map<string, CellVisualStyleConfig> = new Map([
  ['start', createDefaultCellStyle('circle', '#1a3a2e', '#44ff88', 'S')],
  ['boss', createDefaultCellStyle('circle', '#3a1a1e', '#ff4444', 'B', 2.5)],
  ['level', createDefaultCellStyle('circle', '#1a1a3e', '#ff6644', 'L')],
  ['battle', createDefaultCellStyle('circle', '#1a1a3e', '#ff6644', 'L')],
  ['opportunity', createDefaultCellStyle('ellipse', '#1a2a1e', '#ffcc44', 'O')],
  ['chance', createDefaultCellStyle('ellipse', '#1a2a1e', '#ffcc44', 'O')],
  ['bookstore', createDefaultCellStyle('roundedRect', '#1a2a3e', '#44aaff', 'B')],
  ['skill', createDefaultCellStyle('hexagon', '#2a1a3e', '#aa44ff', 'S')],
  ['exchange', createDefaultCellStyle('diamond', '#1a3a2e', '#44ffaa', 'E')],
  ['transition', createDefaultCellStyle('circle', '#2a1a2e', '#ff88ff', 'T')],
  ['special', createDefaultCellStyle('star', '#2a2a1e', '#ffdd44', 'S')],
  ['end', createDefaultCellStyle('circle', '#1a3a2e', '#44ff88', 'E')],
]);

export const DEFAULT_STATE_OVERRIDES: Record<string, CellStateOverride> = {
  locked: { opacity: 0.4, filter: 'grayscale(0.8)', overlayIcon: '🔒', overlayColor: '#888888' },
  pending: { opacity: 0.85, filter: 'none', animationClass: 'gm-pulse-orange' },
  current: { opacity: 1, filter: 'none', animationClass: 'gm-glow-current' },
  cleared: { opacity: 0.7, filter: 'none', overlayIcon: '✓', overlayColor: '#44ff88' },
  completed: { opacity: 0.7, filter: 'none', overlayIcon: '✓', overlayColor: '#44ff88' },
  failed: { opacity: 0.5, filter: 'sepia(0.5) hue-rotate(-30deg)', overlayIcon: '✗', overlayColor: '#ff4444' },
};
