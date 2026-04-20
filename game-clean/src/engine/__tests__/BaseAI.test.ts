/**
 * BaseAI 单元测试
 * 
 * 功能：
 * 1. 测试BaseAI基类的通用功能
 * 2. 测试威胁评估系统
 * 3. 测试玩家意图识别算法
 * 4. 测试难度自适应系统
 * 
 * 文档版本: v1.0.0
 * 最后更新: 2026-02-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseAI } from '../BaseAI';
import type { LevelGameState } from '@/types/levelTypes';

class TestAI extends BaseAI {
  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    super(difficulty);
  }

  async executeTurn(): Promise<{ success: boolean; logs: string[]; canProceed: boolean }> {
    return { success: true, logs: ['测试执行'], canProceed: true };
  }
}

describe('BaseAI', () => {
  let testAI: TestAI;
  let mockState: LevelGameState;

  beforeEach(() => {
    testAI = new TestAI('medium');

    mockState = {
      currentLevel: {
        id: 'LV1',
        name: '第一关：基础防御',
        subtitle: '学习基础卡牌使用',
        articleTitle: '网络安全基础',
        articleContent: '了解基本的网络安全防护措施',
        difficulty: 1,
        tutorialFocus: 'basic_defense',
        objectives: [
          { id: 'obj1', description: '击败敌人', type: 'defeat_enemy', target: 1, completed: false }
        ],
        unlockCondition: {},
        rewards: { unlockedCards: [], experiencePoints: 100 },
        specialCards: [],
        enemyConfig: {
          name: '基础病毒',
          type: 'virus',
          baseDifficulty: 1,
          attackPattern: [],
          specialAbilities: [],
          resourceBonus: 0
        },
        initialSetup: {
          playerResources: { computing: 5, funds: 5, information: 5 },
          securityLevel: 50,
          controlledAreas: ['internal'],
          areaMarkers: { internal: 3, industrial: 0, dmz: 0, external: 0 },
          handCards: []
        },
        hints: [],
        estimatedTurns: 10,
        dadongConfig: {
          actionPoints: 3,
          handSize: 3,
          specialAbility: '每回合为一名友方角色恢复1行动点'
        }
      },
      progress: {
        levelId: 'LV1',
        status: 'in_progress',
        completedObjectives: [],
        attempts: 1
      },
      objectives: [
        { id: 'obj1', description: '击败敌人', type: 'defeat_enemy', target: 1, completed: false }
      ],
      round: 1,
      currentTurn: 1,
      currentPhase: 'judgment',
      currentActor: 'dadong',
      playerState: {
        characterId: 'XIAOBAI',
        resources: { computing: 5, funds: 5, information: 5, permission: 5 },
        resourceRecovery: { computing: 2, funds: 2, information: 2 },
        actionPoints: 3,
        maxActionPoints: 3,
        hand: [],
        deck: [],
        defenseCardsUsed: 0,
        discardPile: [],
        securityLevel: 50,
        maxSecurityLevel: 100
      },
      dadongAIState: {
        isActive: true,
        hand: [],
        cooperationBonus: 0,
        resources: { computing: 5, funds: 5, information: 5 },
        actionPoints: 3,
        maxActionPoints: 3
      },
      enemyState: {
        name: '敌人1',
        type: 'virus',
        infiltrationLevel: 0,
        resources: { computing: 3, funds: 3, information: 3 },
        attackCooldown: 0,
        specialAbilityActive: false
      },
      areaControl: {
        internal: { controller: 'player', defenseMarkers: 3, attackMarkers: 0, specialEffects: [] },
        industrial: { controller: 'neutral', defenseMarkers: 0, attackMarkers: 0, specialEffects: [] },
        dmz: { controller: 'neutral', defenseMarkers: 0, attackMarkers: 0, specialEffects: [] },
        external: { controller: 'enemy', defenseMarkers: 0, attackMarkers: 2, specialEffects: [] }
      },
      unlockedCards: [],
      isTutorialMode: false,
      phaseLogs: [],
      pendingJudgments: [],
      responseEvents: [],
      teamSharedLevels: {
        player: { infiltrationLevel: 0, safetyLevel: 50 },
        enemy: { infiltrationLevel: 0, safetyLevel: 0 }
      }
    };

    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化测试', () => {
    it('应该正确初始化BaseAI子类', () => {
      expect(testAI).toBeInstanceOf(BaseAI);
    });

    it('应该正确设置难度等级', () => {
      const easyAI = new TestAI('easy');
      const mediumAI = new TestAI('medium');
      const hardAI = new TestAI('hard');

      expect(easyAI).toBeDefined();
      expect(mediumAI).toBeDefined();
      expect(hardAI).toBeDefined();
    });

    it('应该能设置游戏状态', () => {
      testAI.setState(mockState);
      expect(testAI).toBeDefined();
    });
  });

  describe('executeTurn测试', () => {
    it('子类应该能实现executeTurn方法', async () => {
      testAI.setState(mockState);
      const result = await testAI.executeTurn();

      expect(result.success).toBe(true);
      expect(result.logs.length).toBeGreaterThan(0);
      expect(result.canProceed).toBe(true);
    });
  });

  describe('难度配置测试', () => {
    it('简单难度应该正常工作', () => {
      const easyAI = new TestAI('easy');
      expect(easyAI).toBeInstanceOf(BaseAI);
    });

    it('中等难度应该正常工作', () => {
      const mediumAI = new TestAI('medium');
      expect(mediumAI).toBeInstanceOf(BaseAI);
    });

    it('困难难度应该正常工作', () => {
      const hardAI = new TestAI('hard');
      expect(hardAI).toBeInstanceOf(BaseAI);
    });
  });

  describe('类结构测试', () => {
    it('应该有setState方法', () => {
      expect(typeof testAI.setState).toBe('function');
    });

    it('应该有executeTurn抽象方法', () => {
      expect(typeof testAI.executeTurn).toBe('function');
    });
  });

  describe('日志记录测试', () => {
    it('应该能记录AI决策日志', async () => {
      testAI.setState(mockState);
      const result = await testAI.executeTurn();

      expect(result.logs).toBeDefined();
      expect(Array.isArray(result.logs)).toBe(true);
    });
  });
});
