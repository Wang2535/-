import { GourdShapeVariant } from '../types/gourdShapeVariants.types';
import type { LayerShapeConfig, ShapeFactoryInput } from '../types/gourdShapeVariants.types';

const LAYER_SHAPE_PRESETS: Record<number, () => LayerShapeConfig> = {
  1: () => createStandardGourd(),
  2: () => createWideLowerGourd(),
  3: () => createTripleRingGourd(),
  4: () => createScatteredGourd(),
  5: () => createElongatedGourd(),
  6: () => createHexFlatGourd(),
  7: () => createIrregularGourd(),
  8: () => createAsymmetricGourd(),
  9: () => createExpandedPalaceGourd(),
};

function createStandardGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.STANDARD,
    upperCircle: { center: { x: 50, y: 20 }, radius: 17, scaleX: 1.0, scaleY: 1.0, rotation: 0, cellCount: 6 },
    connector: { width: 7, shape: 'straight', cellCount: 2 },
    lowerCircle: { center: { x: 50, y: 62 }, radiusX: 34, radiusY: 34, scaleX: 1.0, scaleY: 1.0, rotation: 0, cellCount: 14 },
    globalTransform: { scale: 1.0, skewX: 0, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'solid', innerGrid: { type: 'none', spacing: 0, opacity: 0, color: '' }, bgTexture: 'none' },
  };
}

function createWideLowerGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.WIDE_LOWER,
    upperCircle: { center: { x: 50, y: 18 }, radius: 15, scaleX: 1.0, scaleY: 0.9, rotation: 0, cellCount: 8 },
    connector: { width: 10, shape: 'curved', cellCount: 3, curvature: 0.15 },
    lowerCircle: { center: { x: 50, y: 63 }, radiusX: 42, radiusY: 32, scaleX: 1.25, scaleY: 0.95, rotation: 0, cellCount: 24 },
    globalTransform: { scale: 1.0, skewX: 0, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'glow', innerGrid: { type: 'square', spacing: 8, opacity: 0.08, color: '#4488ff' }, bgTexture: 'circuit' },
  };
}

function createTripleRingGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.TRIPLE_RING,
    upperCircle: { center: { x: 50, y: 16 }, radius: 14, scaleX: 1.0, scaleY: 1.0, rotation: 0, cellCount: 4 },
    connector: { width: 6, shape: 'straight', cellCount: 2 },
    lowerCircle: {
      center: { x: 50, y: 64 }, radiusX: 36, radiusY: 36, scaleX: 1.0, scaleY: 1.0, rotation: 0, cellCount: 18,
      subZones: [
        { id: 'outer', label: 'OUTER', shape: 'sector', startAngle: 0, endAngle: 360, color: '#8B7500' },
        { id: 'mid', label: 'MID', shape: 'sector', startAngle: 0, endAngle: 360, color: '#DAA520' },
        { id: 'core', label: 'CORE', shape: 'circle', color: '#FFD700' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: 0, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'solid', innerGrid: { type: 'radial', spacing: 10, opacity: 0.12, color: '#FFD700' }, bgTexture: 'grid' },
  };
}

function createScatteredGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.SCATTERED,
    upperCircle: { center: { x: 50, y: 20 }, radius: 16, scaleX: 1.0, scaleY: 0.95, rotation: 0, cellCount: 5 },
    connector: { width: 8, shape: 'zigzag', cellCount: 3 },
    lowerCircle: {
      center: { x: 50, y: 62 }, radiusX: 32, radiusY: 30, scaleX: 1.0, scaleY: 1.0, rotation: 0, cellCount: 20,
      subZones: [
        { id: 'district-nw', label: 'NW', shape: 'polygon', points: [{x:30,y:40},{x:48,y:42},{x:46,y:55},{x:28,y:52}], color: '#FF6B6B88' },
        { id: 'district-ne', label: 'NE', shape: 'polygon', points: [{x:52,y:42},{x:72,y:40},{x:74,y:52},{x:54,y:55}], color: '#4ECDC488' },
        { id: 'district-sw', label: 'SW', shape: 'polygon', points: [{x:28,y:55},{x:46,y:58},{x:44,y:75},{x:26,y:72}], color: '#9B59B688' },
        { id: 'district-se', label: 'SE', shape: 'polygon', points: [{x:54,y:58},{x:74,y:55},{x:76,y:72},{x:56,y:75}], color: '#F39C1288' },
      ],
    },
    globalTransform: { scale: 1.02, skewX: -2, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'dashed', innerGrid: { type: 'square', spacing: 12, opacity: 0.06, color: '#FF9800' }, bgTexture: 'none' },
  };
}

function createElongatedGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.ELONGATED,
    upperCircle: { center: { x: 50, y: 15 }, radius: 13, scaleX: 0.85, scaleY: 1.0, rotation: 0, cellCount: 4 },
    connector: { width: 12, shape: 'straight', cellCount: 4 },
    lowerCircle: {
      center: { x: 50, y: 66 }, radiusX: 28, radiusY: 24, scaleX: 1.0, scaleY: 0.75, rotation: 0, cellCount: 16,
      subZones: [
        { id: 'loading', label: 'W', shape: 'rect', color: '#FF6B6B88' },
        { id: 'processing', label: 'S', shape: 'rect', color: '#64C86488' },
        { id: 'inspection', label: 'N', shape: 'rect', color: '#4ECDC488' },
        { id: 'shipping', label: 'D', shape: 'rect', color: '#E74C3C88' },
      ],
    },
    globalTransform: { scale: 1.05, skewX: 0, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'solid', innerGrid: { type: 'square', spacing: 6, opacity: 0.1, color: '#4CAF50' }, bgTexture: 'dataflow' },
  };
}

function createHexFlatGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.HEX_FLAT,
    upperCircle: { center: { x: 50, y: 25 }, radius: 14, scaleX: 1.3, scaleY: 0.65, rotation: 0, cellCount: 6 },
    connector: { width: 14, shape: 'curved', cellCount: 3, curvature: 0.25 },
    lowerCircle: {
      center: { x: 50, y: 64 }, radiusX: 38, radiusY: 22, scaleX: 1.35, scaleY: 0.58, rotation: -3, cellCount: 22,
      subZones: [
        { id: 'hex-1', label: 'H1', shape: 'polygon', color: '#FF6B6B66' },
        { id: 'hex-2', label: 'H2', shape: 'polygon', color: '#4ECDC466' },
        { id: 'hex-3', label: 'H3', shape: 'polygon', color: '#9B59B666' },
        { id: 'hex-4', label: 'H4', shape: 'polygon', color: '#F39C1266' },
        { id: 'hex-5', label: 'H5', shape: 'polygon', color: '#E74C3C66' },
        { id: 'hex-6', label: 'H6', shape: 'polygon', color: '#3498DB66' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: 3, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'glow', innerGrid: { type: 'hex', spacing: 10, opacity: 0.15, color: '#00BCD4' }, bgTexture: 'none' },
  };
}

function createIrregularGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.IRREGULAR,
    upperCircle: { center: { x: 50, y: 22 }, radius: 16, scaleX: 1.0, scaleY: 0.85, rotation: 5, cellCount: 5, arcStartAngle: -30, arcEndAngle: 210 },
    connector: { width: 9, shape: 'curved', cellCount: 2, curvature: 0.2 },
    lowerCircle: {
      center: { x: 50, y: 63 }, radiusX: 34, radiusY: 30, scaleX: 1.08, scaleY: 0.92, rotation: -2, cellCount: 16,
      subZones: [
        { id: 'cloud-w', label: 'W', shape: 'irregular', color: '#FF6B6B55' },
        { id: 'cloud-n', label: 'N', shape: 'irregular', color: '#4ECDC455' },
        { id: 'cloud-i', label: 'I', shape: 'irregular', color: '#9B59B655' },
        { id: 'cloud-p', label: 'P', shape: 'irregular', color: '#F39C1255' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: -1, skewY: 2 },
    visualModifiers: { showOutline: true, outlineStyle: 'dotted', innerGrid: { type: 'none', spacing: 0, opacity: 0, color: '' }, bgTexture: 'cloud' },
  };
}

function createAsymmetricGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.ASYMMETRIC,
    upperCircle: { center: { x: 48, y: 20 }, radius: 15, scaleX: 0.92, scaleY: 1.05, rotation: -4, cellCount: 5 },
    connector: { width: 7, shape: 'zigzag', cellCount: 2 },
    lowerCircle: {
      center: { x: 53, y: 64 }, radiusX: 30, radiusY: 36, scaleX: 0.88, scaleY: 1.12, rotation: 5, cellCount: 15,
      subZones: [
        { id: 'stable', label: 'STABLE', shape: 'sector', startAngle: 200, endAngle: 340, color: '#4ECDC488' },
        { id: 'collapse', label: 'COLLAPSE', shape: 'sector', startAngle: 340, endAngle: 200, color: '#FF444466' },
      ],
    },
    globalTransform: { scale: 1.0, skewX: 4, skewY: -2 },
    visualModifiers: { showOutline: true, outlineStyle: 'crack', innerGrid: { type: 'triangular', spacing: 14, opacity: 0.08, color: '#9C27B0' }, bgTexture: 'quantum' },
  };
}

function createExpandedPalaceGourd(): LayerShapeConfig {
  return {
    variant: GourdShapeVariant.EXPANDED_PALACE,
    upperCircle: { center: { x: 50, y: 14 }, radius: 20, scaleX: 1.0, scaleY: 0.85, rotation: 0, cellCount: 8 },
    connector: { width: 14, shape: 'straight', cellCount: 4 },
    lowerCircle: {
      center: { x: 50, y: 64 }, radiusX: 40, radiusY: 38, scaleX: 1.1, scaleY: 1.05, rotation: 0, cellCount: 20,
      subZones: [
        { id: 'throne', label: 'THRONE', shape: 'sector', startAngle: 300, endAngle: 60, color: '#FFD70044' },
        { id: 'left-wing', label: 'L-WING', shape: 'sector', startAngle: 60, endAngle: 150, color: '#9B59B633' },
        { id: 'right-wing', label: 'R-WING', shape: 'sector', startAngle: 150, endAngle: 240, color: '#9B59B633' },
        { id: 'entrance', label: 'GATE', shape: 'sector', startAngle: 240, endAngle: 300, color: '#E74C3C33' },
      ],
    },
    globalTransform: { scale: 1.08, skewX: 0, skewY: 0 },
    visualModifiers: { showOutline: true, outlineStyle: 'glow', innerGrid: { type: 'radial', spacing: 8, opacity: 0.06, color: '#FFD700' }, bgTexture: 'none' },
  };
}

export class GourdShapeFactory {

  static generate(input: ShapeFactoryInput): LayerShapeConfig {
    const presetFn = LAYER_SHAPE_PRESETS[input.layerNumber];
    if (!presetFn) {
      console.warn(`[GourdShapeFactory] No shape preset for layer ${input.layerNumber}, falling back to standard`);
      return createStandardGourd();
    }
    const config = presetFn();

    const difficultyScale = 1 - (input.difficulty - 1) * 0.015;
    config.globalTransform.scale *= difficultyScale;

    return config;
  }

  static getAllPresets(): Record<number, LayerShapeConfig> {
    const result: Record<number, LayerShapeConfig> = {};
    for (let i = 1; i <= 9; i++) {
      result[i] = this.generate({
        layerNumber: i,
        mechanicType: '',
        themeName: '',
        difficulty: i,
      });
    }
    return result;
  }

  static getVariantName(layerNumber: number): string {
    const names: Record<number, string> = {
      1: '标准葫芦',
      2: '宽底网络',
      3: '三环金库',
      4: '分散街区',
      5: '长条工厂',
      6: '扁平六角',
      7: '不规则云端',
      8: '不对称坍缩',
      9: '扩展宫殿',
    };
    return names[layerNumber] ?? '未知';
  }
}
