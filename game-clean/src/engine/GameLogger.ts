/**
 * 游戏日志系统 (L3修复)
 * 提供结构化的日志记录功能
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import type { TurnPhase, Player } from '@/types/gameRules';

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志类型 */
export type LogType = 
  | 'game_start'
  | 'game_end'
  | 'turn_start'
  | 'turn_end'
  | 'phase_start'
  | 'phase_end'
  | 'card_played'
  | 'card_drawn'
  | 'card_discarded'
  | 'resource_changed'
  | 'level_changed'
  | 'tech_level_up'
  | 'area_control_changed'
  | 'dice_check'
  | 'effect_triggered'
  | 'combat_result'
  | 'victory_check'
  | 'ai_action'
  | 'error'
  | 'AREA'
  | 'EFFECT'
  | 'RPS'
  | 'skill_triggered'
  | 'skill_execution'
  | 'combo_triggered';

/** 结构化日志条目 */
export interface StructuredLogEntry {
  /** 唯一ID */
  id: string;
  /** 时间戳 */
  timestamp: number;
  /** 日志级别 */
  level: LogLevel;
  /** 日志类型 */
  type: LogType;
  /** 回合数 */
  turn: number;
  /** 阶段 */
  phase: TurnPhase;
  /** 玩家ID（可选） */
  playerId?: string;
  /** 玩家名称（可选） */
  playerName?: string;
  /** 消息内容 */
  message: string;
  /** 详细数据 */
  details: LogDetails;
}

/** 日志详情 */
export interface LogDetails {
  /** 动作描述 */
  action?: string;
  /** 旧值 */
  oldValue?: number | string | null;
  /** 新值 */
  newValue?: number | string | null;
  /** 变化量 */
  change?: number;
  /** 原因 */
  reason?: string;
  /** 相关卡牌ID */
  cardId?: string;
  /** 相关卡牌名称 */
  cardName?: string;
  /** 目标玩家ID */
  targetPlayerId?: string;
  /** 目标玩家名称 */
  targetPlayerName?: string;
  /** 区域类型 */
  areaType?: string;
  /** 骰子结果 */
  diceResult?: {
    roll: number;
    difficulty: number;
    success: boolean;
    resultType: string;
  };
  /** 效果数据 */
  effectData?: Record<string, unknown>;
  /** 额外信息 */
  extra?: Record<string, unknown>;
  /** 标记ID */
  markerId?: string;
  /** 区域 */
  area?: string;
  /** 阵营 */
  faction?: string;
  /** 类型 */
  type?: string;
  /** 玩家ID */
  playerId?: string;
  /** 对手ID */
  opponentId?: string;
  /** 效果ID */
  effectId?: string;
  /** ID */
  id?: string;
  /** 当前回合 */
  currentTurn?: number;
  /** 延迟回合 */
  delayTurns?: number;
  /** 触发回合 */
  triggerTurn?: number;
  /** 持续时间 */
  duration?: number;
  /** 效果 */
  effect?: unknown;
  /** 玩家选择 */
  playerChoice?: string;
  /** 对手选择 */
  opponentChoice?: string;
  /** 结果 */
  outcome?: string;
  /** 获胜者 */
  winner?: string | null;
  /** 条件 */
  condition?: string;
  /** 奖励 */
  bonus?: unknown;
  /** 已移除数量 */
  removedCount?: number;
  /** 来源 */
  from?: string;
  /** 目标 */
  to?: string;
  /** 当前卡牌类型 */
  currentCardType?: string;
  /** 触发类型 */
  trigger?: string;
}

/** 日志配置 */
export interface LoggerConfig {
  /** 最小日志级别 */
  minLevel: LogLevel;
  /** 最大日志数量 */
  maxLogs: number;
  /** 是否包含时间戳 */
  includeTimestamp: boolean;
  /** 是否包含玩家名称 */
  includePlayerName: boolean;
}

/** 默认日志配置 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: 'info',
  maxLogs: 1000,
  includeTimestamp: true,
  includePlayerName: true,
};

/** 日志级别优先级 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 游戏日志系统
 */
export class GameLogger {
  private logs: StructuredLogEntry[] = [];
  private config: LoggerConfig;
  private currentTurn: number = 1;
  private currentPhase: TurnPhase = 'judgment';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 设置当前回合
   */
  setTurn(turn: number): void {
    this.currentTurn = turn;
  }

  /**
   * 设置当前阶段
   */
  setPhase(phase: TurnPhase): void {
    this.currentPhase = phase;
  }

  /**
   * 记录日志
   */
  log(
    level: LogLevel,
    type: LogType,
    message: string,
    details: LogDetails = {},
    player?: Player
  ): StructuredLogEntry {
    // 检查日志级别
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return null as unknown as StructuredLogEntry;
    }

    const entry: StructuredLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      type,
      turn: this.currentTurn,
      phase: this.currentPhase,
      playerId: player?.id,
      playerName: this.config.includePlayerName ? player?.name : undefined,
      message,
      details,
    };

    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift();
    }

    // 开发环境下输出到控制台
    if (import.meta.env.DEV) {
      this.outputToConsole(entry);
    }

    return entry;
  }

  /**
   * 记录调试日志
   */
  debug(type: LogType, message: string, details?: LogDetails, player?: Player): StructuredLogEntry {
    return this.log('debug', type, message, details, player);
  }

  /**
   * 记录信息日志
   */
  info(type: LogType, message: string, details?: LogDetails, player?: Player): StructuredLogEntry {
    return this.log('info', type, message, details, player);
  }

  /**
   * 记录警告日志
   */
  warn(type: LogType, message: string, details?: LogDetails, player?: Player): StructuredLogEntry {
    return this.log('warn', type, message, details, player);
  }

  /**
   * 记录错误日志
   */
  error(type: LogType, message: string, details?: LogDetails, player?: Player): StructuredLogEntry {
    return this.log('error', type, message, details, player);
  }

  /**
   * 记录游戏开始
   */
  logGameStart(players: Player[]): StructuredLogEntry {
    return this.info(
      'game_start',
      `游戏开始！共${players.length}名玩家`,
      {
        extra: {
          playerCount: players.length,
          players: players.map(p => ({ id: p.id, name: p.name, faction: p.faction })),
        },
      }
    );
  }

  /**
   * 记录游戏结束
   */
  logGameEnd(winner: Player | null, reason: string): StructuredLogEntry {
    return this.info(
      'game_end',
      winner ? `游戏结束！${winner.name}获胜！` : '游戏结束！平局！',
      {
        reason,
        extra: winner ? { winnerId: winner.id, winnerName: winner.name } : undefined,
      }
    );
  }

  /**
   * 记录回合开始
   */
  logTurnStart(turn: number): StructuredLogEntry {
    this.setTurn(turn);
    return this.info(
      'turn_start',
      `===== 第${turn}回合开始 =====`,
      { extra: { turn } }
    );
  }

  /**
   * 记录回合结束
   */
  logTurnEnd(turn: number): StructuredLogEntry {
    return this.info(
      'turn_end',
      `===== 第${turn}回合结束 =====`,
      { extra: { turn } }
    );
  }

  /**
   * 记录阶段开始
   */
  logPhaseStart(phase: TurnPhase, phaseName: string): StructuredLogEntry {
    this.setPhase(phase);
    return this.info(
      'phase_start',
      `[${phaseName}]阶段开始`,
      { extra: { phase, phaseName } }
    );
  }

  /**
   * 记录阶段结束
   */
  logPhaseEnd(phase: TurnPhase, phaseName: string): StructuredLogEntry {
    return this.info(
      'phase_end',
      `[${phaseName}]阶段结束`,
      { extra: { phase, phaseName } }
    );
  }

  /**
   * 记录出牌
   */
  logCardPlayed(
    player: Player,
    cardId: string,
    cardName: string,
    target?: Player
  ): StructuredLogEntry {
    const message = target
      ? `[${player.name}] 对 [${target.name}] 使用了 [${cardName}]`
      : `[${player.name}] 使用了 [${cardName}]`;

    return this.info(
      'card_played',
      message,
      {
        cardId,
        cardName,
        targetPlayerId: target?.id,
        targetPlayerName: target?.name,
      },
      player
    );
  }

  /**
   * 记录抽牌
   */
  logCardDrawn(player: Player, count: number, reason?: string): StructuredLogEntry {
    return this.info(
      'card_drawn',
      `[${player.name}] 抽取了${count}张牌${reason ? `（${reason}）` : ''}`,
      {
        change: count,
        reason,
      },
      player
    );
  }

  /**
   * 记录弃牌
   */
  logCardDiscarded(player: Player, cardName: string, reason?: string): StructuredLogEntry {
    return this.info(
      'card_discarded',
      `[${player.name}] 弃置了[${cardName}]${reason ? `（${reason}）` : ''}`,
      {
        cardName,
        reason,
      },
      player
    );
  }

  /**
   * 记录资源变化
   */
  logResourceChanged(
    player: Player,
    resourceType: string,
    oldValue: number,
    newValue: number,
    reason?: string
  ): StructuredLogEntry {
    const change = newValue - oldValue;
    const changeStr = change > 0 ? `+${change}` : `${change}`;
    
    return this.info(
      'resource_changed',
      `[${player.name}] ${resourceType}: ${oldValue} → ${newValue} (${changeStr})${reason ? ` [${reason}]` : ''}`,
      {
        action: resourceType,
        oldValue,
        newValue,
        change,
        reason,
      },
      player
    );
  }

  /**
   * 记录等级变化
   */
  logLevelChanged(
    player: Player,
    levelType: 'infiltration' | 'safety',
    oldValue: number,
    newValue: number,
    reason?: string
  ): StructuredLogEntry {
    const typeName = levelType === 'infiltration' ? '渗透等级' : '安全等级';
    const change = newValue - oldValue;
    const changeStr = change > 0 ? `+${change}` : `${change}`;
    
    return this.info(
      'level_changed',
      `[${player.name}] ${typeName}: ${oldValue} → ${newValue} (${changeStr})${reason ? ` [${reason}]` : ''}`,
      {
        action: levelType,
        oldValue,
        newValue,
        change,
        reason,
      },
      player
    );
  }

  /**
   * 记录科技升级
   */
  logTechLevelUp(
    player: Player,
    oldLevel: number,
    newLevel: number
  ): StructuredLogEntry {
    return this.info(
      'tech_level_up',
      `[${player.name}] 科技树升级！T${oldLevel} → T${newLevel}`,
      {
        oldValue: oldLevel,
        newValue: newLevel,
        change: newLevel - oldLevel,
      },
      player
    );
  }

  /**
   * 记录区域控制变化
   */
  logAreaControlChanged(
    areaType: string,
    oldController: string | null,
    newController: string | null
  ): StructuredLogEntry {
    let message: string;
    if (oldController && newController) {
      message = `[${areaType}] 控制权变更：${oldController} → ${newController}`;
    } else if (newController) {
      message = `[${areaType}] 被${newController}占领`;
    } else {
      message = `[${areaType}] 控制权被清除`;
    }

    return this.info(
      'area_control_changed',
      message,
      {
        areaType,
        oldValue: oldController,
        newValue: newController,
      }
    );
  }

  /**
   * 记录骰子判定
   */
  logDiceCheck(
    player: Player,
    roll: number,
    difficulty: number,
    success: boolean,
    resultType: string
  ): StructuredLogEntry {
    const resultStr = success ? '成功' : '失败';
    return this.info(
      'dice_check',
      `[${player.name}] 骰子判定：掷出${roll}点，难度${difficulty}，${resultStr}！`,
      {
        diceResult: { roll, difficulty, success, resultType },
      },
      player
    );
  }

  /**
   * 记录效果触发
   */
  logEffectTriggered(
    player: Player,
    effectName: string,
    effectData?: Record<string, unknown>
  ): StructuredLogEntry {
    return this.info(
      'effect_triggered',
      `[${player.name}] 效果触发：[${effectName}]`,
      {
        action: effectName,
        effectData,
      },
      player
    );
  }

  /**
   * 记录战斗结果
   */
  logCombatResult(
    attacker: Player,
    defender: Player,
    result: 'win' | 'lose' | 'draw',
    details?: string
  ): StructuredLogEntry {
    const resultStr = result === 'win' ? '胜利' : result === 'lose' ? '失败' : '平局';
    return this.info(
      'combat_result',
      `[${attacker.name}] vs [${defender.name}]：${resultStr}${details ? ` (${details})` : ''}`,
      {
        targetPlayerId: defender.id,
        targetPlayerName: defender.name,
        extra: { result, details },
      },
      attacker
    );
  }

  /**
   * 记录胜利条件检查
   */
  logVictoryCheck(
    condition: string,
    result: boolean,
    details?: string
  ): StructuredLogEntry {
    return this.info(
      'victory_check',
      `胜利条件检查[${condition}]：${result ? '满足' : '不满足'}${details ? ` (${details})` : ''}`,
      {
        extra: { condition, result, details },
      }
    );
  }

  /**
   * 记录AI行动
   */
  logAIAction(player: Player, action: string, details?: string): StructuredLogEntry {
    return this.info(
      'ai_action',
      `[AI-${player.name}] ${action}${details ? ` (${details})` : ''}`,
      {
        action,
        reason: details,
      },
      player
    );
  }

  /**
   * 获取所有日志
   */
  getLogs(): StructuredLogEntry[] {
    return [...this.logs];
  }

  /**
   * 获取指定类型的日志
   */
  getLogsByType(type: LogType): StructuredLogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  /**
   * 获取指定玩家的日志
   */
  getLogsByPlayer(playerId: string): StructuredLogEntry[] {
    return this.logs.filter(log => log.playerId === playerId);
  }

  /**
   * 获取指定回合的日志
   */
  getLogsByTurn(turn: number): StructuredLogEntry[] {
    return this.logs.filter(log => log.turn === turn);
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志为JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: StructuredLogEntry): void {
    const timestamp = this.config.includeTimestamp
      ? `[${new Date(entry.timestamp).toLocaleTimeString()}]`
      : '';
    const prefix = `${timestamp}[${entry.level.toUpperCase()}][${entry.type}]`;

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.details);
        break;
      case 'info':
        console.info(prefix, entry.message);
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.details);
        break;
      case 'error':
        console.error(prefix, entry.message, entry.details);
        break;
    }
  }
}

// 默认导出
export const gameLogger = new GameLogger();
export default GameLogger;
