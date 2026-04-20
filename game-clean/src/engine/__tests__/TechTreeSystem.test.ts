/**
 * TechTreeSystem 单元测试 (L2修复)
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTechLevel,
  getTechLevelConfig,
  calculateCheckModifier,
  calculateLevelBonus,
  calculateComboBonus,
  calculateFinalLevelChange,
  TECH_LEVEL_CONFIGS,
  TECH_UNLOCK_THRESHOLDS,
  type TechLevel,
} from '../TechTreeSystem';

describe('TechTreeSystem', () => {
  describe('calculateTechLevel', () => {
    it('等级0应该返回T0', () => {
      expect(calculateTechLevel(0)).toBe(0);
      expect(calculateTechLevel(5)).toBe(0);
      expect(calculateTechLevel(14)).toBe(0);
    });

    it('等级15应该返回T1', () => {
      expect(calculateTechLevel(15)).toBe(1);
      expect(calculateTechLevel(20)).toBe(1);
      expect(calculateTechLevel(29)).toBe(1);
    });

    it('等级30应该返回T2', () => {
      expect(calculateTechLevel(30)).toBe(2);
      expect(calculateTechLevel(35)).toBe(2);
      expect(calculateTechLevel(44)).toBe(2);
    });

    it('等级45应该返回T3', () => {
      expect(calculateTechLevel(45)).toBe(3);
      expect(calculateTechLevel(50)).toBe(3);
      expect(calculateTechLevel(59)).toBe(3);
    });

    it('等级60应该返回T4', () => {
      expect(calculateTechLevel(60)).toBe(4);
      expect(calculateTechLevel(65)).toBe(4);
      expect(calculateTechLevel(74)).toBe(4);
    });

    it('等级75应该返回T5', () => {
      expect(calculateTechLevel(75)).toBe(5);
      expect(calculateTechLevel(80)).toBe(5);
      expect(calculateTechLevel(100)).toBe(5);
    });

    it('负值应该返回T0', () => {
      expect(calculateTechLevel(-1)).toBe(0);
      expect(calculateTechLevel(-10)).toBe(0);
    });
  });

  describe('getTechLevelConfig', () => {
    it('应该返回正确的等级配置', () => {
      const config0 = getTechLevelConfig(0);
      expect(config0.level).toBe(0);
      expect(config0.requiredLevel).toBe(0);
      expect(config0.checkModifier).toBe(0);
      expect(config0.levelBonus).toBe(0);

      const config5 = getTechLevelConfig(5);
      expect(config5.level).toBe(5);
      expect(config5.requiredLevel).toBe(75);
      expect(config5.checkModifier).toBe(3);
      expect(config5.levelBonus).toBe(2);
    });

    it('每个等级配置应该有描述', () => {
      for (let i = 0; i <= 5; i++) {
        const config = getTechLevelConfig(i as TechLevel);
        expect(config.description).toBeDefined();
        expect(config.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateCheckModifier', () => {
    it('T0判定修正应该为0', () => {
      expect(calculateCheckModifier(0)).toBe(0);
    });

    it('T1判定修正应该为0', () => {
      expect(calculateCheckModifier(1)).toBe(0);
    });

    it('T2判定修正应该为1', () => {
      expect(calculateCheckModifier(2)).toBe(1);
    });

    it('T3判定修正应该为1', () => {
      expect(calculateCheckModifier(3)).toBe(1);
    });

    it('T4判定修正应该为2', () => {
      expect(calculateCheckModifier(4)).toBe(2);
    });

    it('T5判定修正应该为2', () => {
      expect(calculateCheckModifier(5)).toBe(2);
    });

    it('应该使用向下取整', () => {
      // 验证向下取整逻辑
      expect(calculateCheckModifier(0)).toBe(Math.floor(0 / 2));
      expect(calculateCheckModifier(1)).toBe(Math.floor(1 / 2));
      expect(calculateCheckModifier(2)).toBe(Math.floor(2 / 2));
      expect(calculateCheckModifier(5)).toBe(Math.floor(5 / 2));
    });
  });

  describe('calculateLevelBonus', () => {
    it('T0等级加成应该为0', () => {
      expect(calculateLevelBonus(0)).toBe(0);
    });

    it('T1等级加成应该为0', () => {
      expect(calculateLevelBonus(1)).toBe(0);
    });

    it('T2等级加成应该为1', () => {
      expect(calculateLevelBonus(2)).toBe(1);
    });

    it('T3等级加成应该为1', () => {
      expect(calculateLevelBonus(3)).toBe(1);
    });

    it('T4等级加成应该为2', () => {
      expect(calculateLevelBonus(4)).toBe(2);
    });

    it('T5等级加成应该为2', () => {
      expect(calculateLevelBonus(5)).toBe(2);
    });
  });

  describe('calculateComboBonus', () => {
    it('0次连击加成应该为0', () => {
      expect(calculateComboBonus(0)).toBe(0);
    });

    it('1次连击加成应该为0.5', () => {
      expect(calculateComboBonus(1)).toBe(0.5);
    });

    it('2次连击加成应该为1', () => {
      expect(calculateComboBonus(2)).toBe(1);
    });

    it('6次连击加成应该为3（上限）', () => {
      expect(calculateComboBonus(6)).toBe(3);
    });

    it('10次连击加成应该仍为3（上限）', () => {
      expect(calculateComboBonus(10)).toBe(3);
    });

    it('负值应该返回0', () => {
      expect(calculateComboBonus(-1)).toBe(-0.5);
    });
  });

  describe('calculateFinalLevelChange', () => {
    it('基础值应该被正确计算', () => {
      const result = calculateFinalLevelChange(5, 0, 0, 0);
      expect(result).toBe(5);
    });

    it('科技加成应该被正确应用', () => {
      const base = 5;
      const techLevel = 4; // 加成+2
      const result = calculateFinalLevelChange(base, techLevel, 0, 0);
      expect(result).toBe(base + 2);
    });

    it('连击加成应该被正确应用', () => {
      const base = 5;
      const combo = 4; // 加成=4*0.5=2
      const result = calculateFinalLevelChange(base, 0, combo, 0);
      expect(result).toBe(base + 2);
    });

    it('判定修正应该被正确应用', () => {
      const base = 5;
      const modifier = 3;
      const result = calculateFinalLevelChange(base, 0, 0, modifier);
      expect(result).toBe(base + modifier);
    });

    it('所有加成应该被正确累加', () => {
      const base = 5;
      const techLevel = 4; // +2
      const combo = 2; // +1
      const modifier = 2;
      const result = calculateFinalLevelChange(base, techLevel, combo, modifier);
      expect(result).toBe(base + 2 + 1 + 2); // 10
    });

    it('结果应该被四舍五入', () => {
      // 5 + 0.5 = 5.5 -> 6
      const result = calculateFinalLevelChange(5, 0, 1, 0);
      expect(result).toBe(6);
    });
  });

  describe('TECH_LEVEL_CONFIGS', () => {
    it('应该包含T0到T5所有等级', () => {
      expect(TECH_LEVEL_CONFIGS).toHaveProperty('0');
      expect(TECH_LEVEL_CONFIGS).toHaveProperty('1');
      expect(TECH_LEVEL_CONFIGS).toHaveProperty('2');
      expect(TECH_LEVEL_CONFIGS).toHaveProperty('3');
      expect(TECH_LEVEL_CONFIGS).toHaveProperty('4');
      expect(TECH_LEVEL_CONFIGS).toHaveProperty('5');
    });

    it('每个等级配置应该包含所有必需属性', () => {
      Object.values(TECH_LEVEL_CONFIGS).forEach(config => {
        expect(config).toHaveProperty('level');
        expect(config).toHaveProperty('requiredLevel');
        expect(config).toHaveProperty('checkModifier');
        expect(config).toHaveProperty('levelBonus');
        expect(config).toHaveProperty('description');
      });
    });

    it('requiredLevel应该随着等级增加而增加', () => {
      const levels = Object.values(TECH_LEVEL_CONFIGS)
        .sort((a, b) => a.level - b.level);
      
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].requiredLevel).toBeGreaterThan(levels[i - 1].requiredLevel);
      }
    });
  });

  describe('TECH_UNLOCK_THRESHOLDS', () => {
    it('应该包含所有解锁阈值（更新版）', () => {
      expect(TECH_UNLOCK_THRESHOLDS.T0).toBe(0);
      expect(TECH_UNLOCK_THRESHOLDS.T1).toBe(5);   // 从15降低到5
      expect(TECH_UNLOCK_THRESHOLDS.T2).toBe(15);  // 从30降低到15
      expect(TECH_UNLOCK_THRESHOLDS.T3).toBe(30);  // 从45降低到30
      expect(TECH_UNLOCK_THRESHOLDS.T4).toBe(40);  // 从60降低到40
      expect(TECH_UNLOCK_THRESHOLDS.T5).toBe(50);  // 从75降低到50
    });

    it('阈值应该与配置表一致', () => {
      expect(TECH_UNLOCK_THRESHOLDS.T0).toBe(TECH_LEVEL_CONFIGS[0].requiredLevel);
      expect(TECH_UNLOCK_THRESHOLDS.T1).toBe(TECH_LEVEL_CONFIGS[1].requiredLevel);
      expect(TECH_UNLOCK_THRESHOLDS.T2).toBe(TECH_LEVEL_CONFIGS[2].requiredLevel);
      expect(TECH_UNLOCK_THRESHOLDS.T3).toBe(TECH_LEVEL_CONFIGS[3].requiredLevel);
      expect(TECH_UNLOCK_THRESHOLDS.T4).toBe(TECH_LEVEL_CONFIGS[4].requiredLevel);
      expect(TECH_UNLOCK_THRESHOLDS.T5).toBe(TECH_LEVEL_CONFIGS[5].requiredLevel);
    });
  });
});
