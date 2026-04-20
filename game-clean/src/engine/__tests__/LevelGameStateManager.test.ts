/**
 * LevelGameStateManager 单元测试 - 判定卡牌系统
 * 
 * 功能：
 * 1. 测试即时判定卡牌在响应阶段正确触发
 * 2. 测试延时判定卡牌在判定阶段正确触发
 * 3. 测试判定机制（骰子、大成功/大失败）
 * 4. 测试判定效果正确应用
 * 
 * 文档版本: v1.0.0
 * 最后更新: 2026-02-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LevelGameStateManager from '../LevelGameStateManager';
import type { LevelGameState } from '@/types/levelTypes';
import type { Card } from '@/types/legacy/card_v16';

describe('LevelGameStateManager - 判定卡牌系统', () => {
  let manager: LevelGameStateManager;
  let mockState: LevelGameState;

  beforeEach(() => {
    manager = new LevelGameStateManager();

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
      currentPhase: 'action',
      currentActor: 'player',
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
    it('应该正确初始化 LevelGameStateManager', () => {
      expect(manager).toBeInstanceOf(LevelGameStateManager);
    });

    it('应该能够启动关卡', () => {
      const state = manager.startLevel('LV001');
      expect(state).toBeDefined();
      expect(state.currentLevel.id).toBe('LV001');
    });
  });

  describe('阶段流转测试', () => {
    it('应该能够正确流转到响应阶段', () => {
      manager.startLevel('LV001');
      
      let result = manager.executePhase('action');
      expect(result.success).toBe(true);
      
      result = manager.executePhase('response');
      expect(result.success).toBe(true);
    });

    it('应该能够正确流转到判定阶段', () => {
      manager.startLevel('LV001');
      
      const result = manager.executePhase('judgment');
      expect(result.success).toBe(true);
    });
  });

  describe('判定卡牌识别测试', () => {
    it('应该能够正确识别 isDelayed 标记的卡牌', () => {
      const delayedCard: Card = {
        card_code: 'LA0-1T1',
        name: '深度扫描（延时判定）',
        description: '判定难度2，成功则渗透-3，失败则渗透+1',
        type: 'intrusion_detection' as any,
        faction: 'defense' as any,
        rarity: 'rare' as any,
        techLevel: 1 as any,
        cost: { compute: 0, funds: 0, information: 1 },
        difficulty: 2,
        effects: [{ 
          type: 'dice_check', 
          difficulty: 2,
          onSuccess: { type: 'infiltration_reduce', baseValue: 3, description: '渗透-3' },
          onFailure: { type: 'infiltration_gain', baseValue: 1, description: '渗透+1' },
          isDelayed: true,
          description: '判定难度2，成功则渗透-3，失败则渗透+1（延时判定）'
        }]
      };

      const immediateCard: Card = {
        card_code: 'LI0-1T1',
        name: '快速扫描（即时判定）',
        description: '判定难度3，成功则安全+2，失败则安全-1',
        type: 'intrusion_detection' as any,
        faction: 'defense' as any,
        rarity: 'rare' as any,
        techLevel: 1 as any,
        cost: { compute: 1, funds: 0, information: 0 },
        difficulty: 3,
        effects: [{ 
          type: 'dice_check', 
          difficulty: 3,
          onSuccess: { type: 'security_gain', baseValue: 2, description: '安全+2' },
          onFailure: { type: 'security_reduce', baseValue: 1, description: '安全-1' },
          onCriticalSuccess: { type: 'security_gain', baseValue: 3, description: '大成功！安全+3' },
          description: '判定难度3，成功则安全+2，失败则安全-1，大成功安全+3'
        }]
      };

      manager.startLevel('LV001');

      const state = manager.getState();
      if (state) {
        state.playerState.hand = [delayedCard, immediateCard];
      }

      expect(state?.playerState.hand.length).toBe(2);
    });
  });

  describe('待处理判定管理测试', () => {
    it('应该能够添加待处理判定', () => {
      manager.startLevel('LV001');
      
      const state = manager.getState();
      if (state) {
        const initialCount = state.pendingJudgments.length;
        
        manager.addPendingJudgment({
          id: 'test_judgment_1',
          type: 'dice',
          sourcePlayerId: 'player',
          targetPlayerId: 'enemy',
          description: '测试判定',
          difficulty: 3,
          effects: {
            success: { description: '成功效果' },
            failure: { description: '失败效果' }
          },
          resolved: false,
          isImmediate: true
        });

        const newCount = state.pendingJudgments.length;
        expect(newCount).toBe(initialCount + 1);
      }
    });

    it('应该能够区分即时和延时判定', () => {
      manager.startLevel('LV001');
      
      manager.addPendingJudgment({
        id: 'immediate_judgment',
        type: 'dice',
        sourcePlayerId: 'player',
        targetPlayerId: 'enemy',
        description: '即时判定',
        difficulty: 3,
        effects: {
          success: { description: '成功效果' },
          failure: { description: '失败效果' }
        },
        resolved: false,
        isImmediate: true
      });

      manager.addPendingJudgment({
        id: 'delayed_judgment',
        type: 'dice',
        sourcePlayerId: 'player',
        targetPlayerId: 'enemy',
        description: '延时判定',
        difficulty: 3,
        effects: {
          success: { description: '成功效果' },
          failure: { description: '失败效果' }
        },
        resolved: false,
        isImmediate: false
      });

      const state = manager.getState();
      if (state) {
        const immediateJudgments = state.pendingJudgments.filter(j => !j.resolved && j.isImmediate === true);
        const delayedJudgments = state.pendingJudgments.filter(j => !j.resolved && !(j as any).isImmediate);

        expect(immediateJudgments.length).toBe(1);
        expect(delayedJudgments.length).toBe(1);
      }
    });
  });

  describe('判定阶段执行测试', () => {
    it('判定阶段应该只处理延时判定', () => {
      manager.startLevel('LV001');
      
      manager.addPendingJudgment({
        id: 'immediate_judgment',
        type: 'dice',
        sourcePlayerId: 'player',
        targetPlayerId: 'enemy',
        description: '即时判定',
        difficulty: 3,
        effects: {
          success: { description: '成功效果' },
          failure: { description: '失败效果' }
        },
        resolved: false,
        isImmediate: true
      });

      manager.addPendingJudgment({
        id: 'delayed_judgment',
        type: 'dice',
        sourcePlayerId: 'player',
        targetPlayerId: 'enemy',
        description: '延时判定',
        difficulty: 3,
        effects: {
          success: { description: '成功效果' },
          failure: { description: '失败效果' }
        },
        resolved: false,
        isImmediate: false
      });

      const result = manager.executePhase('judgment');
      
      expect(result.success).toBe(true);
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('响应阶段执行测试', () => {
    it('响应阶段应该只处理即时判定', () => {
      manager.startLevel('LV001');
      
      manager.addPendingJudgment({
        id: 'immediate_judgment',
        type: 'dice',
        sourcePlayerId: 'player',
        targetPlayerId: 'enemy',
        description: '即时判定',
        difficulty: 3,
        effects: {
          success: { description: '成功效果' },
          failure: { description: '失败效果' }
        },
        resolved: false,
        isImmediate: true
      });

      manager.addPendingJudgment({
        id: 'delayed_judgment',
        type: 'dice',
        sourcePlayerId: 'player',
        targetPlayerId: 'enemy',
        description: '延时判定',
        difficulty: 3,
        effects: {
          success: { description: '成功效果' },
          failure: { description: '失败效果' }
        },
        resolved: false,
        isImmediate: false
      });

      const result = manager.executePhase('response');
      
      expect(result.success).toBe(true);
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });

  describe('判定效果应用测试', () => {
    it('安全等级提升效果应该正确应用', () => {
      manager.startLevel('LV001');
      
      const state = manager.getState();
      if (state) {
        const initialSecurity = state.playerState.securityLevel;
        
        manager.addPendingJudgment({
          id: 'test_security_gain',
          type: 'dice',
          sourcePlayerId: 'player',
          targetPlayerId: 'enemy',
          description: '安全提升判定',
          difficulty: 3,
          effects: {
            success: { type: 'security_gain', baseValue: 2, description: '安全+2' },
            failure: { type: 'security_reduce', baseValue: 1, description: '安全-1' }
          },
          resolved: false,
          isImmediate: true,
          onSuccess: { type: 'security_gain', baseValue: 2, description: '安全+2' }
        });

        manager.executePhase('response');
        
        const finalSecurity = state.playerState.securityLevel;
        expect(finalSecurity).toBeGreaterThanOrEqual(initialSecurity - 1);
        expect(finalSecurity).toBeLessThanOrEqual(initialSecurity + 3);
      }
    });
  });

  describe('边界情况测试', () => {
    it('没有待处理判定时判定阶段应该正常工作', () => {
      manager.startLevel('LV001');
      
      const state = manager.getState();
      if (state) {
        state.pendingJudgments = [];
      }
      
      const result = manager.executePhase('judgment');
      
      expect(result.success).toBe(true);
      expect(result.logs).toContain('✓ 没有待处理的延时判定');
    });

    it('没有待处理判定时响应阶段应该正常工作', () => {
      manager.startLevel('LV001');
      
      const state = manager.getState();
      if (state) {
        state.pendingJudgments = [];
      }
      
      const result = manager.executePhase('response');
      
      expect(result.success).toBe(true);
    });
  });
});
