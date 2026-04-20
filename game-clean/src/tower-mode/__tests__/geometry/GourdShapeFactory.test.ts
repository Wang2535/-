import { describe, it, expect } from 'vitest';
import { LAYER_GOURD_SHAPES } from '../../data/layers/gourdShapes';
import type { GourdShapeParams } from '../../types/gourdCoordinate.types';

describe('F1 — LAYER_GOURD_SHAPES 形状数据测试', () => {
  describe('1.1 基本完整性', () => {
    it('应包含全部 9 层形状定义', () => {
      expect(Object.keys(LAYER_GOURD_SHAPES)).toHaveLength(9);
    });

    it('每层(i=1..9)都应包含 aspectRatio / upperCircle / lowerCircle / connector 字段', () => {
      for (let i = 1; i <= 9; i++) {
        const shape: GourdShapeParams | undefined = LAYER_GOURD_SHAPES[i];
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('aspectRatio');
        expect(shape).toHaveProperty('upperCircle');
        expect(shape).toHaveProperty('lowerCircle');
        expect(shape).toHaveProperty('connector');
        expect(typeof shape!.aspectRatio).toBe('number');
      }
    });

    it('每层的 aspectRatio 应在合理范围 [0.5, 0.8] 内', () => {
      for (let i = 1; i <= 9; i++) {
        const ar = LAYER_GOURD_SHAPES[i].aspectRatio;
        expect(ar).toBeGreaterThanOrEqual(0.5);
        expect(ar).toBeLessThanOrEqual(0.8);
      }
    });
  });

  describe('1.2 L2 宽底网络参数', () => {
    it('L2 下圆 radiusX > radiusY * 1.20（横向扩展）', () => {
      const l2 = LAYER_GOURD_SHAPES[2];
      expect(l2.lowerCircle.radiusX).toBeGreaterThan(l2.lowerCircle.radiusY * 1.20);
    });

    it('L2 的 aspectRatio 特征值应在 0.60~0.64 区间', () => {
      expect(LAYER_GOURD_SHAPES[2].aspectRatio).toBeGreaterThanOrEqual(0.60);
      expect(LAYER_GOURD_SHAPES[2].aspectRatio).toBeLessThanOrEqual(0.64);
    });
  });

  describe('1.3 L6 扁平六角关键参数', () => {
    it('L6 的 aspectRatio 应 >= 0.70（所有层中最高的之一）', () => {
      expect(LAYER_GOURD_SHAPES[6].aspectRatio).toBeGreaterThanOrEqual(0.70);
    });

    it('L6 下圆 radiusX / radiusY 比例特征（> 1.25）', () => {
      const l6 = LAYER_GOURD_SHAPES[6];
      const ratio = l6.lowerCircle.radiusX / l6.lowerCircle.radiusY;
      expect(ratio).toBeGreaterThan(1.25);
    });
  });

  describe('1.4 L7 不对称参数', () => {
    it('L7 上圆 centerX != 下圆 centerX（偏心）', () => {
      const l7 = LAYER_GOURD_SHAPES[7];
      expect(l7.upperCircle.centerX).not.toBe(l7.lowerCircle.centerX);
    });

    it('L7 上圆 centerX < 0.50（左偏）', () => {
      expect(LAYER_GOURD_SHAPES[7].upperCircle.centerX).toBeLessThan(0.50);
    });
  });

  describe('1.5 L9 宫殿扩展', () => {
    it('L9 下圆 radiusX >= 0.38（最大下圆）', () => {
      expect(LAYER_GOURD_SHAPES[9].lowerCircle.radiusX).toBeGreaterThanOrEqual(0.38);
    });

    it('L9 下圆 radiusY >= 0.32 且上圆 centerY <= 0.12', () => {
      const l9 = LAYER_GOURD_SHAPES[9];
      expect(l9.lowerCircle.radiusY).toBeGreaterThanOrEqual(0.32);
      expect(l9.upperCircle.centerY).toBeLessThanOrEqual(0.12);
    });
  });

  describe('1.6 全量遍历一致性', () => {
    it('所有层 upperCircle.radiusY < lowerCircle.radiusY 且 lowerCircle.centerY > upperCircle.centerY', () => {
      for (let i = 1; i <= 9; i++) {
        const s = LAYER_GOURD_SHAPES[i];
        expect(
          s.upperCircle.radiusY,
          `L${i}: 上圆 radiusY(${s.upperCircle.radiusY}) 应小于下圆 radiusY(${s.lowerCircle.radiusY})`
        ).toBeLessThan(s.lowerCircle.radiusY);

        expect(
          s.lowerCircle.centerY,
          `L${i}: 下圆 centerY(${s.lowerCircle.centerY}) 应大于上圆 centerY(${s.upperCircle.centerY})`
        ).toBeGreaterThan(s.upperCircle.centerY);
      }
    });
  });
});
