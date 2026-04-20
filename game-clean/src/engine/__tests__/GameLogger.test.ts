/**
 * GameLogger 单元测试 (L2修复)
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameLogger, gameLogger } from '../GameLogger';
import type { Player } from '@/types/gameRules';

// Mock Player
const mockPlayer: Player = {
  id: 'player-1',
  name: '测试玩家',
  faction: 'attacker',
  characterId: 'char-1',
  isAI: false,
  resources: { compute: 10, funds: 10, information: 10, permission: 10 },
  infiltrationLevel: 10,
  safetyLevel: 5,
  individualModifiers: {
    infiltrationLevelOffset: 0,
    safetyLevelOffset: 0,
    infiltrationGainModifier: 1.0,
    safetyGainModifier: 1.0,
    cannotGainInfiltration: false,
    cannotGainSafety: false,
    sourceEffects: [],
  },
  hand: [],
  deck: [],
  discard: [],
  techLevel: 'T1',
  controlledAreas: [],
  isAlive: true,
  remainingActions: 3,
  maxActions: 3,
};

const mockTargetPlayer: Player = {
  id: 'player-2',
  name: '目标玩家',
  faction: 'defender',
  characterId: 'char-2',
  isAI: true,
  aiDifficulty: 'medium',
  resources: { compute: 10, funds: 10, information: 10, permission: 10 },
  infiltrationLevel: 8,
  safetyLevel: 12,
  individualModifiers: {
    infiltrationLevelOffset: 0,
    safetyLevelOffset: 0,
    infiltrationGainModifier: 1.0,
    safetyGainModifier: 1.0,
    cannotGainInfiltration: false,
    cannotGainSafety: false,
    sourceEffects: [],
  },
  hand: [],
  deck: [],
  discard: [],
  techLevel: 'T2',
  controlledAreas: [],
  isAlive: true,
  remainingActions: 3,
  maxActions: 3,
};

describe('GameLogger', () => {
  let logger: GameLogger;

  beforeEach(() => {
    logger = new GameLogger({ minLevel: 'debug' });
  });

  describe('基本功能', () => {
    it('应该创建有效的日志条目', () => {
      const entry = logger.info('game_start', '游戏开始');
      
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('level', 'info');
      expect(entry).toHaveProperty('type', 'game_start');
      expect(entry).toHaveProperty('message', '游戏开始');
      expect(entry).toHaveProperty('details');
    });

    it('应该生成唯一的日志ID', () => {
      const entry1 = logger.info('game_start', '消息1');
      const entry2 = logger.info('game_start', '消息2');
      
      expect(entry1.id).not.toBe(entry2.id);
    });

    it('应该记录当前回合和阶段', () => {
      logger.setTurn(5);
      logger.setPhase('action');
      
      const entry = logger.info('card_played', '出牌');
      
      expect(entry.turn).toBe(5);
      expect(entry.phase).toBe('action');
    });
  });

  describe('日志级别', () => {
    it('debug级别应该被记录当minLevel为debug', () => {
      const entry = logger.debug('game_start', '调试信息');
      expect(entry.level).toBe('debug');
    });

    it('debug级别不应该被记录当minLevel为info', () => {
      const infoLogger = new GameLogger({ minLevel: 'info' });
      const entry = infoLogger.debug('game_start', '调试信息');
      expect(entry).toBeNull();
    });

    it('error级别应该总是被记录', () => {
      const warnLogger = new GameLogger({ minLevel: 'warn' });
      const entry = warnLogger.error('error', '错误信息');
      expect(entry.level).toBe('error');
    });
  });

  describe('便捷方法', () => {
    it('logGameStart应该记录游戏开始', () => {
      const players = [mockPlayer, mockTargetPlayer];
      const entry = logger.logGameStart(players);
      
      expect(entry.type).toBe('game_start');
      expect(entry.message).toContain('2名玩家');
      expect(entry.details.extra).toHaveProperty('playerCount', 2);
    });

    it('logGameEnd应该记录游戏结束和获胜者', () => {
      const entry = logger.logGameEnd(mockPlayer, '安全瓦解');
      
      expect(entry.type).toBe('game_end');
      expect(entry.message).toContain(mockPlayer.name);
      expect(entry.message).toContain('获胜');
      expect(entry.details.reason).toBe('安全瓦解');
    });

    it('logGameEnd应该处理平局', () => {
      const entry = logger.logGameEnd(null, '回合耗尽');
      
      expect(entry.type).toBe('game_end');
      expect(entry.message).toContain('平局');
    });

    it('logTurnStart应该设置回合并记录', () => {
      const entry = logger.logTurnStart(3);
      
      expect(entry.type).toBe('turn_start');
      expect(entry.message).toContain('第3回合');
      expect(entry.turn).toBe(3);
    });

    it('logPhaseStart应该设置阶段并记录', () => {
      const entry = logger.logPhaseStart('action', '行动');
      
      expect(entry.type).toBe('phase_start');
      expect(entry.message).toContain('行动');
      expect(entry.phase).toBe('action');
    });

    it('logCardPlayed应该记录出牌', () => {
      const entry = logger.logCardPlayed(mockPlayer, 'card-1', '测试卡牌');
      
      expect(entry.type).toBe('card_played');
      expect(entry.message).toContain(mockPlayer.name);
      expect(entry.message).toContain('测试卡牌');
      expect(entry.details.cardId).toBe('card-1');
    });

    it('logCardPlayed应该记录对目标出牌', () => {
      const entry = logger.logCardPlayed(
        mockPlayer,
        'card-1',
        '攻击卡牌',
        mockTargetPlayer
      );
      
      expect(entry.message).toContain('对');
      expect(entry.message).toContain(mockTargetPlayer.name);
      expect(entry.details.targetPlayerId).toBe(mockTargetPlayer.id);
    });

    it('logResourceChanged应该记录资源变化', () => {
      const entry = logger.logResourceChanged(
        mockPlayer,
        '行动点',
        2,
        3,
        '自然恢复'
      );
      
      expect(entry.type).toBe('resource_changed');
      expect(entry.message).toContain('2 → 3');
      expect(entry.message).toContain('+1');
      expect(entry.details.oldValue).toBe(2);
      expect(entry.details.newValue).toBe(3);
      expect(entry.details.change).toBe(1);
    });

    it('logLevelChanged应该记录等级变化', () => {
      const entry = logger.logLevelChanged(
        mockPlayer,
        'infiltration',
        10,
        15,
        '卡牌效果'
      );
      
      expect(entry.type).toBe('level_changed');
      expect(entry.message).toContain('渗透等级');
      expect(entry.message).toContain('10 → 15');
    });

    it('logTechLevelUp应该记录科技升级', () => {
      const entry = logger.logTechLevelUp(mockPlayer, 1, 2);
      
      expect(entry.type).toBe('tech_level_up');
      expect(entry.message).toContain('T1 → T2');
      expect(entry.details.oldValue).toBe(1);
      expect(entry.details.newValue).toBe(2);
    });

    it('logDiceCheck应该记录骰子判定', () => {
      const entry = logger.logDiceCheck(mockPlayer, 5, 3, true, 'success');
      
      expect(entry.type).toBe('dice_check');
      expect(entry.message).toContain('掷出5点');
      expect(entry.message).toContain('难度3');
      expect(entry.details.diceResult).toEqual({
        roll: 5,
        difficulty: 3,
        success: true,
        resultType: 'success',
      });
    });

    it('logVictoryCheck应该记录胜利条件检查', () => {
      const entry = logger.logVictoryCheck('安全瓦解', true, '渗透等级≥75');
      
      expect(entry.type).toBe('victory_check');
      expect(entry.message).toContain('安全瓦解');
      expect(entry.message).toContain('满足');
    });

    it('logAIAction应该记录AI行动', () => {
      const entry = logger.logAIAction(mockTargetPlayer, '出牌', '使用攻击卡');
      
      expect(entry.type).toBe('ai_action');
      expect(entry.message).toContain('AI');
      expect(entry.details.action).toBe('出牌');
    });
  });

  describe('日志查询', () => {
    beforeEach(() => {
      logger.info('game_start', '开始');
      logger.info('card_played', '出牌', {}, mockPlayer);
      logger.warn('resource_changed', '资源警告');
      logger.error('error', '错误');
    });

    it('getLogs应该返回所有日志', () => {
      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
    });

    it('getLogsByType应该返回指定类型的日志', () => {
      const logs = logger.getLogsByType('game_start');
      expect(logs).toHaveLength(1);
      expect(logs.every(l => l.type === 'game_start')).toBe(true);
    });

    it('getLogsByPlayer应该返回指定玩家的日志', () => {
      const logs = logger.getLogsByPlayer(mockPlayer.id);
      expect(logs).toHaveLength(1);
      expect(logs[0].playerId).toBe(mockPlayer.id);
    });

    it('getLogsByTurn应该返回指定回合的日志', () => {
      logger.setTurn(5);
      logger.info('turn_start', '回合5');
      
      const logs = logger.getLogsByTurn(5);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('回合5');
    });
  });

  describe('日志管理', () => {
    it('clearLogs应该清空所有日志', () => {
      logger.info('game_start', '开始');
      expect(logger.getLogs()).toHaveLength(1);
      
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('日志数量应该被限制', () => {
      const limitedLogger = new GameLogger({ maxLogs: 3 });
      
      limitedLogger.info('game_start', '1');
      limitedLogger.info('game_start', '2');
      limitedLogger.info('game_start', '3');
      limitedLogger.info('game_start', '4');
      
      const logs = limitedLogger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('2'); // 最早的被移除
      expect(logs[2].message).toBe('4');
    });

    it('exportLogs应该返回JSON字符串', () => {
      logger.info('game_start', '测试');
      
      const json = logger.exportLogs();
      expect(typeof json).toBe('string');
      
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('全局logger实例', () => {
    it('gameLogger应该是GameLogger实例', () => {
      expect(gameLogger).toBeInstanceOf(GameLogger);
    });

    it('gameLogger应该可以独立使用', () => {
      const entry = gameLogger.info('game_start', '全局日志');
      expect(entry.message).toBe('全局日志');
    });
  });
});
