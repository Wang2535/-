export { GourdRegion } from '../../types/gourdCoordinate.types';
export type { GourdCoordinate, GourdShapeParams } from '../../types/gourdCoordinate.types';

export const LAYER_GOURD_SHAPES: Record<number, GourdShapeParams> = {
  1: {
    // L1 病毒实验室 — 标准葫芦（上小下大）
    aspectRatio: 0.65,
    upperCircle: { centerX: 0.50, centerY: 0.15, radiusX: 0.12, radiusY: 0.10 },
    lowerCircle: { centerX: 0.50, centerY: 0.60, radiusX: 0.35, radiusY: 0.28 },
    connector: { widthAtNarrowest: 0.10, narrowPointY: 0.32 },
  },
  2: {
    // L2 赛博空间 — 双环感，上圆更大
    aspectRatio: 0.62,
    upperCircle: { centerX: 0.50, centerY: 0.18, radiusX: 0.18, radiusY: 0.14 },
    lowerCircle: { centerX: 0.50, centerY: 0.62, radiusX: 0.32, radiusY: 0.26 },
    connector: { widthAtNarrowest: 0.14, narrowPointY: 0.35 },
  },
  3: {
    // L3 数据金库 — 下圆更宽（堡垒感）
    aspectRatio: 0.68,
    upperCircle: { centerX: 0.50, centerY: 0.14, radiusX: 0.14, radiusY: 0.11 },
    lowerCircle: { centerX: 0.50, centerY: 0.62, radiusX: 0.38, radiusY: 0.30 },
    connector: { widthAtNarrowest: 0.08, narrowPointY: 0.30 },
  },
  4: {
    // L4 城市街区 — 接近正圆（城市平面）
    aspectRatio: 0.72,
    upperCircle: { centerX: 0.50, centerY: 0.16, radiusX: 0.16, radiusY: 0.13 },
    lowerCircle: { centerX: 0.50, centerY: 0.60, radiusX: 0.30, radiusY: 0.28 },
    connector: { widthAtNarrowest: 0.16, narrowPointY: 0.34 },
  },
  5: {
    // L5 智能工厂 — 上窄下宽（漏斗形/流水线）
    aspectRatio: 0.60,
    upperCircle: { centerX: 0.50, centerY: 0.12, radiusX: 0.10, radiusY: 0.08 },
    lowerCircle: { centerX: 0.50, centerY: 0.62, radiusX: 0.36, radiusY: 0.30 },
    connector: { widthAtNarrowest: 0.06, narrowPointY: 0.28 },
  },
  6: {
    // L6 移动终端 — 整体偏扁（蜂窝横展）
    aspectRatio: 0.75,
    upperCircle: { centerX: 0.50, centerY: 0.18, radiusX: 0.15, radiusY: 0.12 },
    lowerCircle: { centerX: 0.50, centerY: 0.58, radiusX: 0.34, radiusY: 0.26 },
    connector: { widthAtNarrowest: 0.12, narrowPointY: 0.35 },
  },
  7: {
    // L7 云端平台 — 不规则云朵形（偏心）
    aspectRatio: 0.70,
    upperCircle: { centerX: 0.48, centerY: 0.16, radiusX: 0.20, radiusY: 0.15 },
    lowerCircle: { centerX: 0.52, centerY: 0.62, radiusX: 0.33, radiusY: 0.27 },
    connector: { widthAtNarrowest: 0.14, narrowPointY: 0.33 },
  },
  8: {
    // L8 未来实验室 — 概率云散射形
    aspectRatio: 0.66,
    upperCircle: { centerX: 0.50, centerY: 0.15, radiusX: 0.16, radiusY: 0.12 },
    lowerCircle: { centerX: 0.50, centerY: 0.60, radiusX: 0.34, radiusY: 0.29 },
    connector: { widthAtNarrowest: 0.10, narrowPointY: 0.31 },
  },
  9: {
    // L9 指挥中心 — 严格对称宫殿
    aspectRatio: 0.70,
    upperCircle: { centerX: 0.50, centerY: 0.12, radiusX: 0.15, radiusY: 0.11 },
    lowerCircle: { centerX: 0.50, centerY: 0.58, radiusX: 0.38, radiusY: 0.32 },
    connector: { widthAtNarrowest: 0.08, narrowPointY: 0.28 },
  },
};
