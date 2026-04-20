import type { CellVisualStyle, CellStateVisualOverride, PathVisualStyle, ZoneBackgroundConfig, CheckerboardBorder, QuadrantLabel, PathType } from '../types/visualAssets.types';

export const DEFAULT_CELL_VISUAL_STYLES: Record<string, CellVisualStyle> = {
  start: {
    cellType: 'end',
    sizeMultiplier: 1.2,
    shape: 'circle',
    backgroundGradient: { from: '#4CAF50', to: '#2E7D32', angle: 135 },
    border: { width: 2, color: '#81C784', style: 'solid' },
    icon: { type: 'emoji', data: '🚀' },
    glowEffect: { color: '#4CAF50', size: 8, pulse: true },
  },
  boss: {
    cellType: 'boss',
    sizeMultiplier: 2.5,
    shape: 'circle',
    backgroundGradient: { from: '#D32F2F', to: '#8B0000', angle: 180 },
    border: { width: 3, color: '#FF5252', style: 'double' },
    icon: { type: 'emoji', data: '💀' },
    glowEffect: { color: '#FF1744', size: 16, pulse: true },
  },
  level: {
    cellType: 'battle',
    sizeMultiplier: 1.0,
    shape: 'circle',
    backgroundGradient: { from: '#42A5F5', to: '#1565C0', angle: 135 },
    border: { width: 1.5, color: '#90CAF9', style: 'solid' },
    icon: { type: 'emoji', data: '⚔️' },
  },
  chance: {
    cellType: 'chance',
    sizeMultiplier: 1.0,
    shape: 'circle',
    backgroundGradient: { from: '#FFA726', to: '#E65100', angle: 135 },
    border: { width: 1.5, color: '#FFB74D', style: 'solid' },
    icon: { type: 'emoji', data: '❓' },
  },
  bookstore: {
    cellType: 'bookstore',
    sizeMultiplier: 1.1,
    shape: 'roundedRect',
    backgroundGradient: { from: '#AB47BC', to: '#6A1B9A', angle: 135 },
    border: { width: 1.5, color: '#CE93D8', style: 'solid' },
    icon: { type: 'emoji', data: '📚' },
  },
  skill: {
    cellType: 'skill',
    sizeMultiplier: 1.1,
    shape: 'hexagon',
    backgroundGradient: { from: '#26C6DA', to: '#00838F', angle: 135 },
    border: { width: 1.5, color: '#80DEEA', style: 'solid' },
    icon: { type: 'emoji', data: '⚡' },
  },
};

export const DEFAULT_STATE_OVERRIDES: Record<string, CellStateVisualOverride> = {
  pending: {
    state: 'pending',
    opacity: 0.7,
    filter: 'brightness(0.8)',
    animationClass: 'gourd-cell-pending',
  },
  current: {
    state: 'current',
    opacity: 1.0,
    filter: 'brightness(1.2)',
    overlayIcon: '▶',
    overlayColor: '#FFD700',
    animationClass: 'gourd-cell-current',
  },
  cleared: {
    state: 'cleared',
    opacity: 0.5,
    filter: 'grayscale(0.6) brightness(0.9)',
    overlayIcon: '✓',
    overlayColor: '#4CAF50',
    animationClass: 'gourd-cell-cleared',
  },
  locked: {
    state: 'locked',
    opacity: 0.3,
    filter: 'grayscale(1) brightness(0.5)',
    overlayIcon: '🔒',
    overlayColor: '#9E9E9E',
    animationClass: 'gourd-cell-locked',
  },
};

export const DEFAULT_PATH_VISUAL_STYLES: Record<PathType, PathVisualStyle> = {
  main: {
    pathType: 'main',
    strokeWidth: 3,
    strokeColor: '#FFFFFF',
    dashed: false,
    curveTension: 0.4,
    arrowHead: { size: 8, color: '#FFFFFF' },
  },
  branch: {
    pathType: 'branch',
    strokeWidth: 2,
    strokeColor: '#B0BEC5',
    dashed: true,
    dashPattern: '8 4',
    curveTension: 0.3,
  },
  shortcut: {
    pathType: 'shortcut',
    strokeWidth: 2,
    strokeColor: '#FFD54F',
    dashed: true,
    dashPattern: '4 4',
    curveTension: 0.5,
    arrowHead: { size: 6, color: '#FFD54F' },
  },
  bridge: {
    pathType: 'bridge',
    strokeWidth: 2,
    strokeColor: '#80CBC4',
    dashed: true,
    dashPattern: '6 3 2 3',
    curveTension: 0.6,
  },
  return: {
    pathType: 'return',
    strokeWidth: 1.5,
    strokeColor: '#888888',
    dashed: true,
    dashPattern: '12 6',
    curveTension: 0.2,
  },
  crossRing: {
    pathType: 'crossRing',
    strokeWidth: 2,
    strokeColor: '#CE93D8',
    dashed: true,
    dashPattern: '8 3 2 3',
    curveTension: 0.4,
  },
  safeDoor: {
    pathType: 'safeDoor',
    strokeWidth: 4,
    strokeColor: '#FFD700',
    dashed: false,
    curveTension: 0.3,
    arrowHead: { size: 10, color: '#FFD700' },
  },
  backflow: {
    pathType: 'backflow',
    strokeWidth: 1,
    strokeColor: '#FF5252',
    dashed: true,
    dashPattern: '2 4',
    curveTension: 0.2,
  },
};

export const DEFAULT_ZONE_BACKGROUNDS: Record<string, ZoneBackgroundConfig> = {
  W: {
    zoneType: 'W',
    backgroundType: 'gradient',
    backgroundData: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)',
    opacity: 0.3,
    enterAnimation: 'ripple',
  },
  N: {
    zoneType: 'N',
    backgroundType: 'gradient',
    backgroundData: 'radial-gradient(circle, rgba(78,205,196,0.15) 0%, transparent 70%)',
    opacity: 0.3,
    enterAnimation: 'sparkle',
  },
  I: {
    zoneType: 'I',
    backgroundType: 'gradient',
    backgroundData: 'radial-gradient(circle, rgba(155,89,182,0.2) 0%, transparent 70%)',
    opacity: 0.4,
    enterAnimation: 'flash',
  },
  P: {
    zoneType: 'P',
    backgroundType: 'gradient',
    backgroundData: 'radial-gradient(circle, rgba(243,156,18,0.15) 0%, transparent 70%)',
    opacity: 0.3,
    enterAnimation: 'countdown',
  },
  S: {
    zoneType: 'S',
    backgroundType: 'gradient',
    backgroundData: 'radial-gradient(circle, rgba(46,204,113,0.15) 0%, transparent 70%)',
    opacity: 0.3,
    enterAnimation: 'sparkle',
  },
  D: {
    zoneType: 'D',
    backgroundType: 'gradient',
    backgroundData: 'radial-gradient(circle, rgba(231,76,60,0.2) 0%, transparent 70%)',
    opacity: 0.4,
    enterAnimation: 'warning',
  },
};

export const DEFAULT_CHECKERBOARD_BORDER: CheckerboardBorder & {
  mode: string;
  innerPadding: number;
  opacity: number;
  glowColor: string;
} = {
  enabled: true,
  mode: 'checkerboard-fill',
  borderWidth: 10,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 7,
  borderRadius: 2,
  padding: 3,
  innerPadding: 3,
  opacity: 0.95,
  glowColor: 'rgba(255,170,0,0.5)',
};

export const DEFAULT_QUADRANT_LABELS: Array<QuadrantLabel & {
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  enableShadow: boolean;
  fontFamily: string;
}> = [
  { quadrant: 'W', label: 'W', fontSizeRatio: 0.36, color: '#FF6B6B', fontWeight: '900', backgroundColor: '#FF6B6B', backgroundOpacity: 0.15, strokeColor: '#FFFFFF', strokeWidth: 1.0, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 1.5, shadowOffsetY: 1.5, enableShadow: true, fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif' },
  { quadrant: 'N', label: 'N', fontSizeRatio: 0.36, color: '#4ECDC4', fontWeight: '900', backgroundColor: '#4ECDC4', backgroundOpacity: 0.15, strokeColor: '#FFFFFF', strokeWidth: 1.0, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 1.5, shadowOffsetY: 1.5, enableShadow: true, fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif' },
  { quadrant: 'I', label: 'I', fontSizeRatio: 0.36, color: '#9B59B6', fontWeight: '900', backgroundColor: '#9B59B6', backgroundOpacity: 0.15, strokeColor: '#FFFFFF', strokeWidth: 1.0, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 1.5, shadowOffsetY: 1.5, enableShadow: true, fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif' },
  { quadrant: 'P', label: 'P', fontSizeRatio: 0.36, color: '#F39C12', fontWeight: '900', backgroundColor: '#F39C12', backgroundOpacity: 0.15, strokeColor: '#FFFFFF', strokeWidth: 1.0, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 1.5, shadowOffsetY: 1.5, enableShadow: true, fontFamily: '"Arial Black", "Impact", "Helvetica Neue", sans-serif' },
];
