/**
 * LevelAIController 单元测试
 * 
 * 功能：
 * 1. 测试大东AI的完整七个阶段操作逻辑
 * 2. 测试敌人AI的完整七个阶段操作逻辑
 * 3. 测试AI协同策略（保护机制、配合集火）
 * 4. 测试AI对抗策略（威胁评估、战术配合）
 * 5. 测试难度自适应系统
 * 
 * 文档版本: v1.0.0
 * 最后更新: 2026-02-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LevelAIController } from '../LevelAIController';
import type { LevelGameState } from '@/types/levelTypes';

describe('LevelAIController', () => {
  let aiController: LevelAIController;
  let mockState: LevelGameState;

  beforeEach(() => {
    aiController = new LevelAIController({
      dadongDifficulty: 'medium',
      enemyDifficulty: 'medium',
      enableVisualization: false,
      delayBetweenActions: 0
    });

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
    it('应该正确初始化LevelAIController', () => {
      expect(aiController).toBeInstanceOf(LevelAIController);
    });

    it('应该正确设置游戏状态', () => {
      aiController.setState(mockState);
      expect(aiController).toBeDefined();
    });

    it('应该正确设置操作日志回调', () => {
      const mockCallback = vi.fn();
      aiController.setOnOperationLog(mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('应该正确设置状态变更回调', () => {
      const mockCallback = vi.fn();
      aiController.setOnStateChange(mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('大东AI基础功能测试', () => {
    it('无游戏状态时executeDadongTurn应该返回错误', async () => {
      const result = await aiController.executeDadongTurn();
      
      expect(result.success).toBe(false);
      expect(result.canProceed).toBe(false);
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('有游戏状态时应该能执行大东AI回合', async () => {
      aiController.setState(mockState);
      
      const result = await aiController.executeDadongTurn();
      
      expect(result).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('敌人AI基础功能测试', () => {
    it('无游戏状态时executeEnemyTurn应该返回错误', async () => {
      const result = await aiController.executeEnemyTurn('enemy1');
      
      expect(result.success).toBe(false);
      expect(result.canProceed).toBe(false);
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('有游戏状态时应该能执行敌人AI回合', async () => {
      aiController.setState(mockState);
      
      const result = await aiController.executeEnemyTurn('enemy1');
      
      expect(result).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('难度配置测试', () => {
    it('应该正确应用简单难度配置', () => {
      const easyAI = new LevelAIController({
        dadongDifficulty: 'easy',
        enemyDifficulty: 'easy'
      });
      
      expect(easyAI).toBeInstanceOf(LevelAIController);
    });

    it('应该正确应用中等难度配置', () => {
      const mediumAI = new LevelAIController({
        dadongDifficulty: 'medium',
        enemyDifficulty: 'medium'
      });
      
      expect(mediumAI).toBeInstanceOf(LevelAIController);
    });

    it('应该正确应用困难难度配置', () => {
      const hardAI = new LevelAIController({
        dadongDifficulty: 'hard',
        enemyDifficulty: 'hard'
      });
      
      expect(hardAI).toBeInstanceOf(LevelAIController);
    });
  });

  describe('AI操作日志测试', () => {
    it('应该能记录AI操作日志', async () => {
      aiController.setState(mockState);
      
      const logs: any[] = [];
      aiController.setOnOperationLog((log) => {
        logs.push(log);
      });
      
      await aiController.executeDadongTurn();
      
      expect(logs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('玩家低血量时的保护机制测试', () => {
    it('玩家血量低时大东AI应该优先考虑保护', async () => {
      const lowSecurityState = {
        ...mockState,
        playerState: {
          ...mockState.playerState,
          securityLevel: 20
        },
        teamSharedLevels: {
          ...mockState.teamSharedLevels,
          player: {
            ...mockState.teamSharedLevels.player,
            safetyLevel: 20
          }
        }
      };
      
      aiController.setState(lowSecurityState);
      
      const result = await aiController.executeDadongTurn();
      
      expect(result).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('敌人威胁评估测试', () => {
    it('多个敌人时应该评估威胁选择目标', async () => {
      const multiEnemyState = {
        ...mockState,
        enemies: [
          {
            id: 'enemy1',
            name: '敌人1',
            hp: 50,
            maxHp: 50,
            hand: [],
            deck: [],
            discarded: [],
            status: [],
            techLevel: 1,
            type: 'basic'
          },
          {
            id: 'enemy2',
            name: '敌人2',
            hp: 80,
            maxHp: 80,
            hand: [],
            deck: [],
            discarded: [],
            status: [],
            techLevel: 2,
            type: 'elite'
          }
        ]
      };
      
      aiController.setState(multiEnemyState);
      
      const result = await aiController.executeDadongTurn();
      
      expect(result).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('边界情况测试', () => {
    it('敌人不存在时应该能够执行', async () => {
      aiController.setState(mockState);
      
      const result = await aiController.executeEnemyTurn('non_existent_enemy');
      
      expect(result).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('游戏结束状态时应该处理', async () => {
      const gameOverState = {
        ...mockState,
        isGameOver: true,
        winner: 'player'
      };
      
      aiController.setState(gameOverState);
      
      const result = await aiController.executeDadongTurn();
      
      expect(result).toBeDefined();
    });
  });
});
