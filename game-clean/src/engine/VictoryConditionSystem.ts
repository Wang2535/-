/**
 * 胜利条件检测系统
 * 实现完善的游戏规则.md R1.1, R1.2, R1.3 的所有胜利条件
 *
 * 更新说明：
 * - 科技树解锁等级调整：T1=5, T2=15, T3=30, T4=40, T5=50
 * - 胜利条件更新：达到75级需持续2轮次才判定胜利（原：2回合）
 */

import type { GameState, Faction, Player } from '@/types/gameRules';

export interface VictoryResult {
  isGameOver: boolean;
  winner: Faction | null;
  victoryType: string | null;
  victoryDescription: string | null;
  roundsPlayed: number; // 改为轮次数（原：回合数 turnsPlayed）
}

/** 胜利条件常量 - 基于轮次（round）而非回合（turn）
 * 根据操作手册.md 胜利条件章节配置
 */
const VICTORY_CONSTANTS = {
  /** 完全渗透/绝对安全所需等级 */
  MAX_LEVEL_REQUIRED: 75,
  /** 需要持续轮次数（R1.1.1/R1.2.1: 持续2个轮次） */
  SUSTAINED_ROUNDS_REQUIRED: 2,
  /** 安全瓦解/威胁清除所需轮次（R1.1.2/R1.2.2: 需要第7轮次后） */
  ELIMINATION_MIN_ROUND: 7,
  /** 速攻胜利截止轮次（R1.1.3/R1.2.3: 第6轮次前） */
  BLITZ_MAX_ROUND: 6,
  /** 速攻胜利所需等级（R1.1.3/R1.2.3: 等级≥50） */
  BLITZ_LEVEL_REQUIRED: 50,
  /** 持久胜利判定轮次（R1.1.4/R1.2.4: 第12轮次结束后） */
  ENDURANCE_ROUND: 12,
  /** 无威胁判定起始轮次（操作手册未明确，保持与ELIMINATION一致） */
  NO_THREAT_MIN_ROUND: 7,
  /** 无威胁判定阈值（操作手册未明确，保持30） */
  NO_THREAT_THRESHOLD: 30,
} as const;

/**
 * 更新玩家达到75级的记录
 * 在轮次结束时调用（原：回合结束时）
 */
export function updateMaxLevelTracking(gameState: GameState): GameState {
  const updatedPlayers = gameState.players.map(player => {
    const isMaxLevel =
      (player.faction === 'attacker' && player.infiltrationLevel >= VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) ||
      (player.faction === 'defender' && player.safetyLevel >= VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED);

    // 如果当前达到75级且之前没有记录，记录当前轮次（原：回合）
    if (isMaxLevel && !player.maxLevelReachedRound) {
      return {
        ...player,
        maxLevelReachedRound: gameState.round
      };
    }

    // 如果当前未达到75级，清除记录
    if (!isMaxLevel && player.maxLevelReachedRound) {
      const { maxLevelReachedRound, ...rest } = player;
      return rest as Player;
    }

    return player;
  });

  return {
    ...gameState,
    players: updatedPlayers
  };
}

/**
 * 检查是否满足"持续2轮次"条件（原：持续2回合）
 */
function checkSustainedRounds(player: Player, currentRound: number): boolean {
  if (!player.maxLevelReachedRound) return false;
  return currentRound - player.maxLevelReachedRound >= VICTORY_CONSTANTS.SUSTAINED_ROUNDS_REQUIRED;
}

/**
 * 检查胜利条件
 * 根据R1.1, R1.2, R1.3规则实现
 *
 * 更新：
 * - 达到75级需要持续2轮次才判定胜利（原：2回合）
 * - 所有时间判定基于轮次（round）而非回合（turn）
 */
export function checkVictoryConditions(gameState: GameState): VictoryResult {
  // 使用 round（轮次）而不是 turn（回合）进行胜利判定
  const { players, round } = gameState;

  const attacker = players.find(p => p.faction === 'attacker');
  const defender = players.find(p => p.faction === 'defender');

  if (!attacker || !defender) {
    return {
      isGameOver: false,
      winner: null,
      victoryType: null,
      victoryDescription: null,
      roundsPlayed: round // 返回轮次数
    };
  }

  // ========== 进攻方胜利条件（操作手册.md R1.1） ==========

  // R1.1.1: 完全渗透 - 渗透等级达到75并持续2个轮次
  if (attacker.infiltrationLevel >= VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) {
    if (checkSustainedRounds(attacker, round)) {
      return {
        isGameOver: true,
        winner: 'attacker',
        victoryType: 'complete_infiltration',
        victoryDescription: '完全渗透！进攻方成功控制了整个系统（持续2个轮次）',
        roundsPlayed: round
      };
    }
  }

  // R1.1.2: 安全瓦解 - 防御方安全等级降至0（需第7轮次后）
  if (round >= VICTORY_CONSTANTS.ELIMINATION_MIN_ROUND && defender.safetyLevel <= 0) {
    return {
      isGameOver: true,
      winner: 'attacker',
      victoryType: 'security_collapse',
      victoryDescription: '安全瓦解！防御系统完全崩溃（第7轮次后）',
      roundsPlayed: round
    };
  }

  // R1.1.3: 速攻胜利 - 第6轮次前渗透等级≥50且防御方安全等级<50
  if (round <= VICTORY_CONSTANTS.BLITZ_MAX_ROUND &&
      attacker.infiltrationLevel >= VICTORY_CONSTANTS.BLITZ_LEVEL_REQUIRED &&
      defender.safetyLevel < VICTORY_CONSTANTS.BLITZ_LEVEL_REQUIRED) {
    return {
      isGameOver: true,
      winner: 'attacker',
      victoryType: 'rapid_attack',
      victoryDescription: '速攻胜利！闪电战击溃防御（第6轮次前）',
      roundsPlayed: round
    };
  }

  // ========== 防御方胜利条件（操作手册.md R1.2） ==========

  // R1.2.1: 绝对安全 - 安全等级达到75并持续2个轮次
  if (defender.safetyLevel >= VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) {
    if (checkSustainedRounds(defender, round)) {
      return {
        isGameOver: true,
        winner: 'defender',
        victoryType: 'absolute_security',
        victoryDescription: '绝对安全！防御系统固若金汤（持续2个轮次）',
        roundsPlayed: round
      };
    }
  }

  // R1.2.2: 威胁清除 - 攻击方渗透等级降至0（需第7轮次后）
  if (round >= VICTORY_CONSTANTS.ELIMINATION_MIN_ROUND && attacker.infiltrationLevel <= 0) {
    return {
      isGameOver: true,
      winner: 'defender',
      victoryType: 'threat_elimination',
      victoryDescription: '威胁清除！所有入侵者被驱逐（第7轮次后）',
      roundsPlayed: round
    };
  }

  // R1.2.3: 速防胜利 - 第6轮次前安全等级≥50且攻击方渗透等级<50
  if (round <= VICTORY_CONSTANTS.BLITZ_MAX_ROUND &&
      defender.safetyLevel >= VICTORY_CONSTANTS.BLITZ_LEVEL_REQUIRED &&
      attacker.infiltrationLevel < VICTORY_CONSTANTS.BLITZ_LEVEL_REQUIRED) {
    return {
      isGameOver: true,
      winner: 'defender',
      victoryType: 'rapid_defense',
      victoryDescription: '速防胜利！快速建立坚固防线（第6轮次前）',
      roundsPlayed: round
    };
  }

  // R1.2.4: 第7轮次起，回合结束时场上无威胁 → 立即判定防御方胜利
  if (round >= VICTORY_CONSTANTS.NO_THREAT_MIN_ROUND) {
    // 检查进攻方是否有足够的渗透等级
    if (attacker.infiltrationLevel < VICTORY_CONSTANTS.NO_THREAT_THRESHOLD) {
      return {
        isGameOver: true,
        winner: 'defender',
        victoryType: 'no_threat',
        victoryDescription: '无威胁状态！防御方自动获胜（第7轮次起）',
        roundsPlayed: round
      };
    }
  }

  // ========== 持久胜利判定（R1.1.4/R1.2.4: 第12轮次结束后） ==========
  if (round >= VICTORY_CONSTANTS.ENDURANCE_ROUND) {
    // R1.1.4 / R1.2.4: 第12轮次结束后比较等级
    if (attacker.infiltrationLevel > defender.safetyLevel) {
      return {
        isGameOver: true,
        winner: 'attacker',
        victoryType: 'endurance_attack',
        victoryDescription: '持久胜利！进攻方最终优势',
        roundsPlayed: round
      };
    } else if (defender.safetyLevel > attacker.infiltrationLevel) {
      return {
        isGameOver: true,
        winner: 'defender',
        victoryType: 'endurance_defense',
        victoryDescription: '持久胜利！防御方最终优势',
        roundsPlayed: round
      };
    } else {
      // R1.3: 平局判定
      return {
        isGameOver: true,
        winner: null,
        victoryType: 'draw',
        victoryDescription: '平局！双方势均力敌',
        roundsPlayed: round
      };
    }
  }

  // 游戏继续
  return {
    isGameOver: false,
    winner: null,
    victoryType: null,
    victoryDescription: null,
    roundsPlayed: round
  };
}

/**
 * 获取胜利条件进度
 * 用于UI显示双方距离胜利还有多远
 */
export function getVictoryProgress(gameState: GameState): {
  attacker: { current: number; target: number; percentage: number; sustainedRounds: number };
  defender: { current: number; target: number; percentage: number; sustainedRounds: number };
} {
  const attacker = gameState.players.find(p => p.faction === 'attacker');
  const defender = gameState.players.find(p => p.faction === 'defender');

  // 使用 round（轮次）而不是 turn（回合）
  const attackerSustained = attacker?.maxLevelReachedRound
    ? gameState.round - attacker.maxLevelReachedRound
    : 0;
  const defenderSustained = defender?.maxLevelReachedRound
    ? gameState.round - defender.maxLevelReachedRound
    : 0;

  return {
    attacker: {
      current: attacker?.infiltrationLevel || 0,
      target: VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED,
      percentage: Math.min(((attacker?.infiltrationLevel || 0) / VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) * 100, 100),
      sustainedRounds: attackerSustained  // 改为 sustainedRounds
    },
    defender: {
      current: defender?.safetyLevel || 0,
      target: VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED,
      percentage: Math.min(((defender?.safetyLevel || 0) / VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) * 100, 100),
      sustainedRounds: defenderSustained  // 改为 sustainedRounds
    }
  };
}

/**
 * 检查特定胜利条件是否即将达成
 * 用于预警提示
 */
export function checkImminentVictory(
  gameState: GameState
): { faction: Faction; condition: string; roundsLeft: number } | null {  // 改为 roundsLeft
  // 使用 round（轮次）而不是 turn（回合）
  const { players, round } = gameState;
  const attacker = players.find(p => p.faction === 'attacker');
  const defender = players.find(p => p.faction === 'defender');

  if (!attacker || !defender) return null;

  // 检查进攻方是否即将胜利
  if (attacker.infiltrationLevel >= VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) {
    const sustained = attacker.maxLevelReachedRound ? round - attacker.maxLevelReachedRound : 0;
    const roundsLeft = VICTORY_CONSTANTS.SUSTAINED_ROUNDS_REQUIRED - sustained;  // 改为 roundsLeft
    if (roundsLeft > 0) {
      return {
        faction: 'attacker',
        condition: 'complete_infiltration',
        roundsLeft  // 改为 roundsLeft
      };
    }
  }

  // 检查防御方是否即将胜利
  if (defender.safetyLevel >= VICTORY_CONSTANTS.MAX_LEVEL_REQUIRED) {
    const sustained = defender.maxLevelReachedRound ? round - defender.maxLevelReachedRound : 0;
    const roundsLeft = VICTORY_CONSTANTS.SUSTAINED_ROUNDS_REQUIRED - sustained;  // 改为 roundsLeft
    if (roundsLeft > 0) {
      return {
        faction: 'defender',
        condition: 'absolute_security',
        roundsLeft  // 改为 roundsLeft
      };
    }
  }

  return null;
}

/**
 * 获取胜利条件描述
 * 根据操作手册.md 胜利条件章节配置
 */
export function getVictoryDescription(victoryType: string | null): string {
  const descriptions: Record<string, string> = {
    // 进攻方胜利条件
    complete_infiltration: '完全渗透：渗透等级达到75并持续2个轮次',
    security_collapse: '安全瓦解：防御方安全等级降至0（需第7轮次后）',
    rapid_attack: '速攻胜利：第6轮次前渗透等级≥50且防御方安全等级<50',
    endurance_attack: '持久胜利：第12轮次结束后渗透等级更高',
    // 防御方胜利条件
    absolute_security: '绝对安全：安全等级达到75并持续2个轮次',
    threat_elimination: '威胁清除：攻击方渗透等级降至0（需第7轮次后）',
    rapid_defense: '速防胜利：第6轮次前安全等级≥50且攻击方渗透等级<50',
    endurance_defense: '持久胜利：第12轮次结束后安全等级更高',
    // 其他
    no_threat: '无威胁状态：第7轮次起进攻方渗透等级<30',
    draw: '平局：双方势均力敌'
  };

  return victoryType ? descriptions[victoryType] || '未知胜利条件' : '游戏进行中';
}
