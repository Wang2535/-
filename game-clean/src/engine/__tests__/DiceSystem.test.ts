/**
 * DiceSystem 单元测试 (L2修复)
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  performDiceCheck,
  calculateSuccessRate,
  calculateTechModifier,
  calculateAreaModifier,
  getDifficultyDescription,
  DIFFICULTY_LEVELS,
  DICE_CONFIG,
} from '../DiceSystem';

describe('DiceSystem', () => {
  beforeEach(() => {
    // 重置Math.random的mock
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('performDiceCheck', () => {
    it('应该返回有效的骰子判定结果结构', () => {
      const result = performDiceCheck(3);
      
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('resultType');
      expect(result).toHaveProperty('finalValue');
      expect(result).toHaveProperty('description');
    });

    it('掷出值应该始终在1-6范围内', () => {
      // 运行多次测试确保随机性
      for (let i = 0; i < 100; i++) {
        const result = performDiceCheck(3);
        expect(result.roll).toBeGreaterThanOrEqual(DICE_CONFIG.MIN_ROLL);
        expect(result.roll).toBeLessThanOrEqual(DICE_CONFIG.MAX_ROLL);
      }
    });

    it('难度应该被限制在1-6范围内', () => {
      // 测试难度为0的情况
      const result1 = performDiceCheck(0);
      expect(result1.difficulty).toBe(DICE_CONFIG.MIN_ROLL);

      // 测试难度为10的情况
      const result2 = performDiceCheck(10);
      expect(result2.difficulty).toBe(DICE_CONFIG.MAX_ROLL);
    });

    it('掷出值大于难度时应该判定成功', () => {
      // Mock Math.random返回0.9，对应掷出6点
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const result = performDiceCheck(3);
      
      expect(result.roll).toBe(6);
      expect(result.success).toBe(true);
    });

    it('掷出值小于等于难度时应该判定失败', () => {
      // Mock Math.random返回0，对应掷出1点
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = performDiceCheck(3);
      
      expect(result.roll).toBe(1);
      expect(result.success).toBe(false);
    });

    it('修正值应该正确影响判定结果', () => {
      // Mock掷出3点，难度4，修正+2
      vi.spyOn(Math, 'random').mockReturnValue(0.4); // 0.4 * 6 = 2.4 + 1 = 3.4 -> 3
      const result = performDiceCheck(4, 2);
      
      // 3 + 2 = 5 > 4，应该成功
      expect(result.roll).toBe(3);
      expect(result.success).toBe(true);
    });

    it('大成功条件：掷出6且难度≤3', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // 掷出6点
      const result = performDiceCheck(2);
      
      expect(result.roll).toBe(DICE_CONFIG.CRITICAL_SUCCESS_ROLL);
      expect(result.resultType).toBe('critical_success');
      expect(result.finalValue).toBe(3);
    });

    it('大失败条件：掷出1且难度≥4', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0); // 掷出1点
      const result = performDiceCheck(4);
      
      expect(result.roll).toBe(DICE_CONFIG.CRITICAL_FAILURE_ROLL);
      expect(result.resultType).toBe('critical_failure');
      expect(result.finalValue).toBe(0);
    });

    it('普通成功时finalValue应该为1', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6); // 掷出4-5点
      const result = performDiceCheck(3);
      
      if (result.resultType === 'success') {
        expect(result.finalValue).toBe(1);
      }
    });

    it('普通失败时finalValue应该为0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.2); // 掷出2-3点
      const result = performDiceCheck(5);
      
      if (result.resultType === 'failure') {
        expect(result.finalValue).toBe(0);
      }
    });
  });

  describe('calculateSuccessRate', () => {
    it('难度1时成功率应该为83.3%', () => {
      const rate = calculateSuccessRate(1);
      expect(rate).toBeCloseTo(83.3, 1);
    });

    it('难度3时成功率应该为50%', () => {
      const rate = calculateSuccessRate(3);
      expect(rate).toBeCloseTo(50, 1);
    });

    it('难度6时成功率应该为0%', () => {
      const rate = calculateSuccessRate(6);
      expect(rate).toBe(0);
    });

    it('修正值应该提高成功率', () => {
      const baseRate = calculateSuccessRate(4);
      const modifiedRate = calculateSuccessRate(4, 2);
      
      expect(modifiedRate).toBeGreaterThan(baseRate);
    });

    it('难度应该被限制在有效范围内', () => {
      // 难度为0应该被视为1
      const rate1 = calculateSuccessRate(0);
      expect(rate1).toBe(calculateSuccessRate(1));

      // 难度为10应该被视为6
      const rate2 = calculateSuccessRate(10);
      expect(rate2).toBe(calculateSuccessRate(6));
    });
  });

  describe('calculateTechModifier', () => {
    it('科技等级0时修正应该为0', () => {
      expect(calculateTechModifier(0)).toBe(0);
    });

    it('科技等级1时修正应该为0', () => {
      expect(calculateTechModifier(1)).toBe(0);
    });

    it('科技等级2时修正应该为1', () => {
      expect(calculateTechModifier(2)).toBe(1);
    });

    it('科技等级3时修正应该为1', () => {
      expect(calculateTechModifier(3)).toBe(1);
    });

    it('科技等级4时修正应该为2', () => {
      expect(calculateTechModifier(4)).toBe(2);
    });

    it('科技等级5时修正应该为2', () => {
      expect(calculateTechModifier(5)).toBe(2);
    });
  });

  describe('calculateAreaModifier', () => {
    it('优势区域修正应该为+1', () => {
      expect(calculateAreaModifier(true)).toBe(1);
    });

    it('劣势区域修正应该为-1', () => {
      expect(calculateAreaModifier(false)).toBe(-1);
    });
  });

  describe('getDifficultyDescription', () => {
    it('应该返回正确的难度描述', () => {
      expect(getDifficultyDescription(1)).toBe('简单');
      expect(getDifficultyDescription(2)).toBe('普通');
      expect(getDifficultyDescription(3)).toBe('困难');
      expect(getDifficultyDescription(4)).toBe('极难');
      expect(getDifficultyDescription(5)).toBe('极限');
      expect(getDifficultyDescription(6)).toBe('不可能');
    });

    it('无效难度应该返回"未知"', () => {
      expect(getDifficultyDescription(0)).toBe('未知');
      expect(getDifficultyDescription(7)).toBe('未知');
      expect(getDifficultyDescription(-1)).toBe('未知');
    });
  });

  describe('DIFFICULTY_LEVELS', () => {
    it('应该包含所有6个难度等级', () => {
      const levels = Object.keys(DIFFICULTY_LEVELS);
      expect(levels).toHaveLength(6);
    });

    it('每个难度等级应该有正确的属性', () => {
      Object.values(DIFFICULTY_LEVELS).forEach(level => {
        expect(level).toHaveProperty('value');
        expect(level).toHaveProperty('successRate');
        expect(level).toHaveProperty('name');
        
        expect(typeof level.value).toBe('number');
        expect(typeof level.successRate).toBe('number');
        expect(typeof level.name).toBe('string');
      });
    });

    it('难度值应该在1-6范围内', () => {
      Object.values(DIFFICULTY_LEVELS).forEach(level => {
        expect(level.value).toBeGreaterThanOrEqual(1);
        expect(level.value).toBeLessThanOrEqual(6);
      });
    });

    it('成功率应该随着难度增加而降低', () => {
      const rates = Object.values(DIFFICULTY_LEVELS)
        .sort((a, b) => a.value - b.value)
        .map(l => l.successRate);
      
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i]).toBeLessThan(rates[i - 1]);
      }
    });
  });
});
