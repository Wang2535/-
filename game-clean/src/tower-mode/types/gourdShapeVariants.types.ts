export enum GourdShapeVariant {
  STANDARD = 'standard',
  WIDE_LOWER = 'wide-lower',
  TRIPLE_RING = 'triple-ring',
  SCATTERED = 'scattered',
  ELONGATED = 'elongated',
  HEX_FLAT = 'hex-flat',
  IRREGULAR = 'irregular',
  ASYMMETRIC = 'asymmetric',
  EXPANDED_PALACE = 'expanded-palace',
}

export interface LayerShapeConfig {
  variant: GourdShapeVariant;
  upperCircle: {
    center: { x: number; y: number };
    radius: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    arcStartAngle?: number;
    arcEndAngle?: number;
    cellCount: number;
  };
  connector: {
    width: number;
    shape: 'straight' | 'curved' | 'zigzag' | 'spiral';
    cellCount: number;
    curvature?: number;
  };
  lowerCircle: {
    center: { x: number; y: number };
    radiusX: number;
    radiusY: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    cellCount: number;
    subZones?: Array<{
      id: string;
      label: string;
      shape: 'sector' | 'rect' | 'polygon' | 'irregular';
      points?: Array<{ x: number; y: number }>;
      startAngle?: number;
      endAngle?: number;
      color: string;
    }>;
  };
  globalTransform: {
    scale: number;
    skewX: number;
    skewY: number;
  };
  visualModifiers: {
    showOutline: boolean;
    outlineStyle: 'solid' | 'dashed' | 'dotted' | 'glow' | 'crack';
    innerGrid?: {
      type: 'none' | 'hex' | 'square' | 'triangular' | 'radial';
      spacing: number;
      opacity: number;
      color: string;
    };
    bgTexture?: 'none' | 'circuit' | 'grid' | 'cloud' | 'quantum' | 'dataflow';
  };
}

export interface ShapeFactoryInput {
  layerNumber: number;
  mechanicType: string;
  themeName: string;
  difficulty: number;
}
