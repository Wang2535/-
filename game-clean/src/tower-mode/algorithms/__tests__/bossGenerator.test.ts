import { describe, it, expect } from 'vitest';
import { BossGenerator } from '../bossGenerator';
import type { LevelPoolEntry, BossMechanism } from '../../types';

const createPrototype = (
  overrides: Partial<LevelPoolEntry> = {},
): LevelPoolEntry => ({
  id: 'test-boss-1',
  layer: 1,
  theme: 'virus',
  difficulty: 3,
  tags: ['malware', 'ransomware'],
  name: '测试Boss',
  description: '用于测试的Boss原型',
  ...overrides,
});

describe('BossGenerator', () => {
  const generator = new BossGenerator();

  describe('generateFromPrototype', () => {
    it('应返回 GeneratedBoss 对象', () => {
      const prototype = createPrototype();
      const boss = generator.generateFromPrototype(prototype, 1);

      expect(boss).toBeDefined();
      expect(boss.prototypeId).toBe('test-boss-1');
      expect(boss.name).toBe('测试Boss');
      expect(boss.baseStats).toBeDefined();
      expect(boss.mechanisms).toBeDefined();
      expect(boss.stageThresholds).toBeDefined();
      expect(boss.visualConfig).toBeDefined();
    });

    it('低层Boss应包含2个机制', () => {
      const prototype = createPrototype({
        tags: ['malware', 'ransomware', 'worm'],
      });
      const boss = generator.generateFromPrototype(prototype, 2);

      expect(boss.mechanisms.length).toBe(2);
    });

    it('高层Boss应包含3个机制', () => {
      const prototype = createPrototype({
        tags: ['malware', 'ransomware', 'worm'],
      });
      const boss = generator.generateFromPrototype(prototype, 7);

      expect(boss.mechanisms.length).toBe(3);
    });

    it('机制类型应与标签匹配', () => {
      const prototype = createPrototype({ tags: ['malware'] });
      const boss = generator.generateFromPrototype(prototype, 1);

      const mechanismTypes = boss.mechanisms.map((m) => m.type);
      expect(mechanismTypes).toContain('summon');
      expect(mechanismTypes).toContain('evolve');
    });

    it('高层Boss机制间隔应更短', () => {
      const prototype = createPrototype({ tags: ['malware'] });
      const bossLow = generator.generateFromPrototype(prototype, 1);
      const bossHigh = generator.generateFromPrototype(prototype, 9);

      const lowIntervals = bossLow.mechanisms.map((m) => m.triggerInterval);
      const highIntervals = bossHigh.mechanisms.map((m) => m.triggerInterval);

      const lowSum = lowIntervals.reduce((a, b) => a + b, 0);
      const highSum = highIntervals.reduce((a, b) => a + b, 0);

      expect(highSum).toBeLessThanOrEqual(lowSum);
    });

    it('baseStats 应随层级递增', () => {
      const prototype = createPrototype();
      const boss1 = generator.generateFromPrototype(prototype, 1);
      const boss5 = generator.generateFromPrototype(prototype, 5);

      expect(boss5.baseStats.hp).toBeGreaterThan(boss1.baseStats.hp);
      expect(boss5.baseStats.attack).toBeGreaterThan(boss1.baseStats.attack);
      expect(boss5.baseStats.defense).toBeGreaterThan(boss1.baseStats.defense);
      expect(boss5.baseStats.speed).toBeGreaterThan(boss1.baseStats.speed);
    });

    it('visualConfig.size 应随层级变化', () => {
      const prototype = createPrototype();

      const boss1 = generator.generateFromPrototype(prototype, 1);
      expect(boss1.visualConfig.size).toBe('normal');

      const boss5 = generator.generateFromPrototype(prototype, 5);
      expect(boss5.visualConfig.size).toBe('large');

      const boss9 = generator.generateFromPrototype(prototype, 9);
      expect(boss9.visualConfig.size).toBe('epic');
    });
  });

  describe('matchMechanismsByTags', () => {
    it('对已知标签应返回正确机制', () => {
      const mechanisms = generator.matchMechanismsByTags(['malware']);

      expect(mechanisms.length).toBe(2);
      const types = mechanisms.map((m) => m.type);
      expect(types).toContain('summon');
      expect(types).toContain('evolve');
    });

    it('应去重机制类型', () => {
      const mechanisms = generator.matchMechanismsByTags(['malware', 'worm']);

      const types = mechanisms.map((m) => m.type);
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });

    it('对未知标签应返回空数组', () => {
      const mechanisms = generator.matchMechanismsByTags(['unknown-tag']);
      expect(mechanisms.length).toBe(0);
    });

    it('每个机制应包含 params', () => {
      const mechanisms = generator.matchMechanismsByTags(['malware']);

      for (const m of mechanisms) {
        expect(m.params).toBeDefined();
        expect(Object.keys(m.params).length).toBeGreaterThan(0);
      }
    });
  });

  describe('scaleMechanismIntensity', () => {
    it('高层机制强度应更高', () => {
      const baseMechanism: BossMechanism = {
        type: 'summon',
        name: '召唤增援',
        description: '每N回合召唤小怪增援',
        triggerInterval: 3,
        params: { summonCount: 2, summonType: 'minion' },
      };

      const scaled1 = generator.scaleMechanismIntensity(baseMechanism, 1);
      const scaled5 = generator.scaleMechanismIntensity(baseMechanism, 5);

      expect(scaled5.params.summonCount as number).toBeGreaterThan(
        scaled1.params.summonCount as number,
      );
    });

    it('triggerInterval 不应低于1', () => {
      const baseMechanism: BossMechanism = {
        type: 'summon',
        name: '召唤增援',
        description: '每N回合召唤小怪增援',
        triggerInterval: 2,
        params: { summonCount: 2 },
      };

      const scaled = generator.scaleMechanismIntensity(baseMechanism, 9);
      expect(scaled.triggerInterval).toBeGreaterThanOrEqual(1);
    });

    it('非数值 params 应保持不变', () => {
      const baseMechanism: BossMechanism = {
        type: 'summon',
        name: '召唤增援',
        description: '每N回合召唤小怪增援',
        triggerInterval: 3,
        params: { summonCount: 2, summonType: 'minion' },
      };

      const scaled = generator.scaleMechanismIntensity(baseMechanism, 5);
      expect(scaled.params.summonType).toBe('minion');
    });
  });
});
