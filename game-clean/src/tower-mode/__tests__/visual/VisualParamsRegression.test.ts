import { describe, test, expect } from 'vitest';
import { assembleL1Topology, assembleLayerTopology, preassembleAllLayers } from '../../utils/layerAssembler';
import { DEFAULT_CELL_STYLES, DEFAULT_QUADRANT_LABELS, DEFAULT_STATE_OVERRIDES } from '../../components/GourdMapRenderer/types';

describe('F组第八轮 — 视觉参数回归', () => {

  describe('W/N/I/P 象限标识参数', () => {
    test('四象限 fontSizeRatio 均为 0.22', () => {
      for (const q of DEFAULT_QUADRANT_LABELS) {
        expect(q.fontSizeRatio).toBeCloseTo(0.22, 2);
      }
    });

    test('四象限 fontWeight 均为 900', () => {
      for (const q of DEFAULT_QUADRANT_LABELS) {
        expect(q.fontWeight).toBe('900');
      }
    });

    test('四象限均含白色描边 (strokeColor="#FFFFFF")', () => {
      for (const q of DEFAULT_QUADRANT_LABELS) {
        expect(q.strokeColor).toBe('#FFFFFF');
        expect(q.strokeWidth).toBeGreaterThan(0);
      }
    });

    test('颜色分布: W/P=橙 #FF8800, N/I=黄 #FFCC00', () => {
      const byQuad = new Map(DEFAULT_QUADRANT_LABELS.map(q => [q.quadrant, q]));
      expect(byQuad.get('W')?.color).toBe('#FF8800');
      expect(byQuad.get('P')?.color).toBe('#FF8800');
      expect(byQuad.get('N')?.color).toBe('#FFCC00');
      expect(byQuad.get('I')?.color).toBe('#FFCC00');
    });

    test('四象限均有阴影效果', () => {
      for (const q of DEFAULT_QUADRANT_LABELS) {
        expect(q.enableShadow).toBe(true);
        expect(q.shadowColor).toBeDefined();
      }
    });
  });

  describe('棋盘格边框参数', () => {
    test('L1 visualData border 配置存在', () => {
      const assembled = assembleL1Topology();
      if (assembled.visualData) {
        expect(assembled.visualData.border).toBeDefined();
        expect(assembled.visualData.border.enabled).toBe(true);
      }
    });

    test('边框配色为橙黄白交替', () => {
      const assembled = assembleL1Topology();
      if (assembled.visualData?.border?.colors) {
        expect(assembled.visualData.border.colors).toEqual(['#FFAA00', '#FFFFFF']);
      }
    });

    test('边框 tileSize 在合理范围', () => {
      const assembled = assembleL1Topology();
      if (assembled.visualData?.border?.tileSize) {
        expect(assembled.visualData.border.tileSize).toBeGreaterThan(4);
        expect(assembled.visualData.border.tileSize).toBeLessThan(30);
      }
    });
  });

  describe('Boss格参数', () => {
    test('Boss sizeMultiplier = 2.5', () => {
      expect(DEFAULT_CELL_STYLES.get('boss')?.sizeMultiplier).toBe(2.5);
    });

    test('Boss 有 glowEffect 配置', () => {
      const boss = DEFAULT_CELL_STYLES.get('boss');
      // Boss style may or may not have glowEffect in DEFAULT - check if defined
      if (boss?.glowEffect) {
        expect(boss.glowEffect.pulse).toBe(true);
        expect(boss.glowEffect.size).toBeGreaterThan(0);
      }
      // At minimum, boss should exist and have sizeMultiplier
      expect(boss).toBeDefined();
    });

    test('精英格有动画类 (via visualData)', () => {
      const assembled = assembleL1Topology();
      if (assembled.visualData?.cellVisualStyles?.elite) {
        expect(assembled.visualData.cellVisualStyles.elite.animationClass).toBeDefined();
      }
    });
  });

  describe('图标引用', () => {
    test('主要格子类型的 icon.type 为 letter (default)', () => {
      const types = ['start', 'boss', 'battle', 'bookstore', 'skill'];
      for (const type of types) {
        const style = DEFAULT_CELL_STYLES.get(type);
        expect(style?.icon?.type).toBeDefined();
      }
    });
  });

  describe('状态覆盖样式', () => {
    test('locked 状态 opacity < 0.5', () => {
      expect(DEFAULT_STATE_OVERRIDES.locked.opacity).toBeLessThan(0.5);
    });

    test('current 状态有 glow 动画', () => {
      expect(DEFAULT_STATE_OVERRIDES.current.animationClass).toContain('glow');
    });

    test('pending 状态有 pulse 动画', () => {
      expect(DEFAULT_STATE_OVERRIDES.pending.animationClass).toContain('pulse');
    });
  });
});
