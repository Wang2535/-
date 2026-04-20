import { AreaEffectType, GridPathType } from '../types/grid.types';

export interface PathStyle {
  color: string;
  width: number;
  dashArray?: number[];
  animated?: boolean;
}

export interface MapVisualConfig {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  areaColors: Record<AreaEffectType, string>;
  pathStyles: Record<GridPathType, PathStyle>;
  animationConfig: {
    pulseSpeed: number;
    glowIntensity: number;
    transitionDuration: number;
  };
}

const AREA_COLORS: Record<AreaEffectType, string> = {
  [AreaEffectType.WEAK]: '#FF6B6B',
  [AreaEffectType.KNOWLEDGE]: '#4ECDC4',
  [AreaEffectType.INVERT]: '#9B59B6',
  [AreaEffectType.SKIP]: '#F39C12',
  [AreaEffectType.SPEED]: '#2ECC71',
  [AreaEffectType.DANGER]: '#E74C3C',
};

function createPathStyles(primary: string, secondary: string, accent: string): Record<GridPathType, PathStyle> {
  return {
    [GridPathType.MAIN]: { color: primary, width: 3, animated: true },
    [GridPathType.BRANCH]: { color: secondary, width: 2, dashArray: [8, 4] },
    [GridPathType.SHORTCUT]: { color: accent, width: 2, dashArray: [4, 4], animated: true },
    [GridPathType.RETURN]: { color: '#888', width: 2, dashArray: [12, 6] },
    [GridPathType.CROSS_RING]: { color: accent, width: 2, dashArray: [8, 3, 2, 3] },
    [GridPathType.SAFE_DOOR]: { color: '#ffd700', width: 4 },
    [GridPathType.BACKFLOW]: { color: '#ff4444', width: 1, dashArray: [2, 4] },
  };
}

export const MAP_VISUAL_CONFIGS: Record<number, MapVisualConfig> = {
  1: {
    themeColors: { primary: '#00ff88', secondary: '#1a472a', accent: '#ff4444', background: '#0a1a0f' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#00ff88', '#1a472a', '#ff4444'),
    animationConfig: { pulseSpeed: 2, glowIntensity: 0.5, transitionDuration: 300 },
  },
  2: {
    themeColors: { primary: '#3b82f6', secondary: '#1e3a5f', accent: '#00ffcc', background: '#0a0f1a' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#3b82f6', '#1e3a5f', '#00ffcc'),
    animationConfig: { pulseSpeed: 2, glowIntensity: 0.5, transitionDuration: 300 },
  },
  3: {
    themeColors: { primary: '#8b5cf6', secondary: '#2d1b69', accent: '#ffd700', background: '#0f0a1a' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#8b5cf6', '#2d1b69', '#ffd700'),
    animationConfig: { pulseSpeed: 2, glowIntensity: 0.5, transitionDuration: 300 },
  },
  4: {
    themeColors: { primary: '#f59e0b', secondary: '#4a3000', accent: '#ff6b6b', background: '#1a150a' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#f59e0b', '#4a3000', '#ff6b6b'),
    animationConfig: { pulseSpeed: 1.5, glowIntensity: 0.7, transitionDuration: 250 },
  },
  5: {
    themeColors: { primary: '#ef4444', secondary: '#5c1a1a', accent: '#00ff88', background: '#1a0a0a' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#ef4444', '#5c1a1a', '#00ff88'),
    animationConfig: { pulseSpeed: 1.5, glowIntensity: 0.7, transitionDuration: 250 },
  },
  6: {
    themeColors: { primary: '#06b6d4', secondary: '#0a3d4a', accent: '#ff9f43', background: '#0a1a1a' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#06b6d4', '#0a3d4a', '#ff9f43'),
    animationConfig: { pulseSpeed: 1.5, glowIntensity: 0.7, transitionDuration: 250 },
  },
  7: {
    themeColors: { primary: '#a855f7', secondary: '#3b1a5c', accent: '#38bdf8', background: '#120a1a' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#a855f7', '#3b1a5c', '#38bdf8'),
    animationConfig: { pulseSpeed: 1, glowIntensity: 0.9, transitionDuration: 200 },
  },
  8: {
    themeColors: { primary: '#ec4899', secondary: '#5c1a3d', accent: '#22d3ee', background: '#1a0a15' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#ec4899', '#5c1a3d', '#22d3ee'),
    animationConfig: { pulseSpeed: 1, glowIntensity: 0.9, transitionDuration: 200 },
  },
  9: {
    themeColors: { primary: '#f43f5e', secondary: '#5c1a25', accent: '#fbbf24', background: '#1a0a0f' },
    areaColors: AREA_COLORS,
    pathStyles: createPathStyles('#f43f5e', '#5c1a25', '#fbbf24'),
    animationConfig: { pulseSpeed: 1, glowIntensity: 0.9, transitionDuration: 200 },
  },
};
