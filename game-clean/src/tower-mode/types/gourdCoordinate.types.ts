export enum GourdRegion {
  UPPER_CIRCLE = 'upperCircle',
  CONNECTOR = 'connector',
  LOWER_CIRCLE = 'lowerCircle',
}

export interface GourdCoordinate {
  region: GourdRegion;
  theta: number;
  radiusRatio: number;
  cartesian: { x: number; y: number };
}

export interface GourdShapeParams {
  aspectRatio: number;
  upperCircle: {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
  };
  lowerCircle: {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
  };
  connector: {
    widthAtNarrowest: number;
    narrowPointY: number;
  };
}
