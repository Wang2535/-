import type { GourdShapeParams } from './gourdShapes';
import { LAYER_GOURD_SHAPES } from './gourdShapes';

export class LayerSvgPathGenerator {

  static generateGourdOutline(params: GourdShapeParams): string {
    const uc = {
      cx: params.upperCircle.centerX * 100,
      cy: params.upperCircle.centerY * 100,
      rx: params.upperCircle.radiusX * 100,
      ry: params.upperCircle.radiusY * 100,
    };
    const lc = {
      cx: params.lowerCircle.centerX * 100,
      cy: params.lowerCircle.centerY * 100,
      rx: params.lowerCircle.radiusX * 100,
      ry: params.lowerCircle.radiusY * 100,
    };
    const narrowY = params.connector.narrowPointY * 100;
    const narrowW = params.connector.widthAtNarrowest * 100;

    const topOfUpper = { x: uc.cx, y: uc.cy - uc.ry };
    const rightOfUpper = { x: uc.cx + uc.rx, y: uc.cy };
    const bottomRightOfUpper = { x: uc.cx + narrowW / 2, y: narrowY };
    const topRightOfLower = { x: lc.cx + narrowW / 2, y: narrowY };
    const rightOfLower = { x: lc.cx + lc.rx, y: lc.cy };
    const bottomOfLower = { x: lc.cx, y: lc.cy + lc.ry };
    const leftOfLower = { x: lc.cx - lc.rx, y: lc.cy };
    const topLeftOfLower = { x: lc.cx - narrowW / 2, y: narrowY };
    const bottomLeftOfUpper = { x: uc.cx - narrowW / 2, y: narrowY };
    const leftOfUpper = { x: uc.cx - uc.rx, y: uc.cy };

    const cp1RightWaist = { x: rightOfUpper.x + 5, y: (rightOfUpper.y + bottomRightOfUpper.y) / 2 };
    const cp2RightWaist = { x: topRightOfLower.x + 5, y: (rightOfUpper.y + bottomRightOfUpper.y) / 2 };
    const cp1LeftWaist = { x: topLeftOfLower.x - 5, y: (leftOfUpper.y + bottomLeftOfUpper.y) / 2 };
    const cp2LeftWaist = { x: leftOfUpper.x - 5, y: (leftOfUpper.y + bottomLeftOfUpper.y) / 2 };

    return [
      `M ${topOfUpper.x},${topOfUpper.y}`,
      `A ${uc.rx},${uc.ry} 0 0,1 ${rightOfUpper.x},${rightOfUpper.y}`,
      `C ${cp1RightWaist.x},${cp1RightWaist.y} ${cp2RightWaist.x},${cp2RightWaist.y} ${topRightOfLower.x},${topRightOfLower.y}`,
      `A ${lc.rx},${lc.ry} 0 0,1 ${bottomOfLower.x},${bottomOfLower.y}`,
      `A ${lc.rx},${lc.ry} 0 0,1 ${leftOfLower.x},${leftOfLower.y}`,
      `C ${cp1LeftWaist.x},${cp1LeftWaist.y} ${cp2LeftWaist.x},${cp2LeftWaist.y} ${bottomLeftOfUpper.x},${bottomLeftOfUpper.y}`,
      `A ${uc.rx},${uc.ry} 0 0,1 ${topOfUpper.x},${topOfUpper.y}`,
      'Z',
    ].join(' ');
  }

  static generateCurvedConnection(
    from: { x: number; y: number },
    to: { x: number; y: number },
    tension: number = 0.3
  ): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = dist * tension;

    const cp1 = { x: from.x, y: from.y + offset * Math.sign(dy || 1) };
    const cp2 = { x: to.x, y: to.y - offset * Math.sign(dy || 1) };

    return `M ${from.x},${from.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${to.x},${to.y}`;
  }

  static generateAllPaths(layerNumber: number): {
    outlinePath: string;
    regionPaths: Record<string, string>;
    quadrantDividers: { horizontal: string; vertical: string };
    curvedConnections: Array<{ fromId: string; toId: string; pathData: string }>;
  } {
    const params = LAYER_GOURD_SHAPES[layerNumber];
    if (!params) {
      throw new Error(`No shape params for layer ${layerNumber}`);
    }

    const outlinePath = LayerSvgPathGenerator.generateGourdOutline(params);

    const uc = params.upperCircle;
    const lc = params.lowerCircle;
    const conn = params.connector;

    const regionPaths: Record<string, string> = {
      upperCircle: `M ${uc.centerX * 100 - uc.radiusX * 100},${uc.centerY * 100} A ${uc.radiusX * 100},${uc.radiusY * 100} 0 1,0 ${uc.centerX * 100 + uc.radiusX * 100},${uc.centerY * 100} A ${uc.radiusX * 100},${uc.radiusY * 100} 0 1,0 ${uc.centerX * 100 - uc.radiusX * 100},${uc.centerY * 100}`,
      connector: `M ${lc.centerX * 100 - conn.widthAtNarrowest * 50},${conn.narrowPointY * 100} L ${lc.centerX * 100 + conn.widthAtNarrowest * 50},${conn.narrowPointY * 100}`,
      lowerCircle: `M ${lc.centerX * 100 - lc.radiusX * 100},${lc.centerY * 100} A ${lc.radiusX * 100},${lc.radiusY * 100} 0 1,0 ${lc.centerX * 100 + lc.radiusX * 100},${lc.centerY * 100} A ${lc.radiusX * 100},${lc.radiusY * 100} 0 1,0 ${lc.centerX * 100 - lc.radiusX * 100},${lc.centerY * 100}`,
    };

    const lcx = lc.centerX * 100;
    const lcy = lc.centerY * 100;
    const lcrx = lc.radiusX * 100;
    const lcry = lc.radiusY * 100;

    const quadrantDividers = {
      horizontal: `M ${lcx - lcrx},${lcy} L ${lcx + lcrx},${lcy}`,
      vertical: `M ${lcx},${lcy - lcry} L ${lcx},${lcy + lcry}`,
    };

    return {
      outlinePath,
      regionPaths,
      quadrantDividers,
      curvedConnections: [],
    };
  }
}
