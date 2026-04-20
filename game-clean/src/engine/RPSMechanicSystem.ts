/**
 * 《道高一丈：数字博弈》v17.0 - 猜拳（RPS）判定机制系统
 * 
 * 功能：实现石头剪刀布判定机制
 * 规则依据：完善的游戏规则.md R6.0、R7.1
 */

import { gameLogger } from './GameLogger';

/**
 * 猜拳选择类型
 */
export type RPSChoice = 'rock' | 'paper' | 'scissors';

/**
 * 猜拳结果类型
 */
export type RPSOutcome = 'win' | 'lose' | 'draw';

/**
 * RPS判定结果
 */
export interface RPSResult {
  playerChoice: RPSChoice;
  opponentChoice: RPSChoice;
  outcome: RPSOutcome;
  winner: string | null; // 玩家ID或null（平局）
}

/**
 * RPS判定选项
 */
export interface RPSOptions {
  playerId: string;
  opponentId: string;
  playerChoice: RPSChoice;
  opponentChoice: RPSChoice;
  playerModifier?: number; // 玩家修正值
  opponentModifier?: number; // 对手修正值
}

/**
 * RPS技能效果
 */
export interface RPSSkillEffect {
  type: 'view_hand' | 'force_cost' | 'change_choice' | 'predict' | 'multi_choice';
  value?: number;
  target?: string;
}

/**
 * 猜拳判定系统
 */
export class RPSMechanicSystem {
  private static instance: RPSMechanicSystem;
  private choiceHistory: Map<string, RPSChoice[]> = new Map(); // 记录每个玩家的选择历史

  private constructor() {}

  static getInstance(): RPSMechanicSystem {
    if (!RPSMechanicSystem.instance) {
      RPSMechanicSystem.instance = new RPSMechanicSystem();
    }
    return RPSMechanicSystem.instance;
  }

  /**
   * 执行RPS判定
   */
  static judge(playerChoice: RPSChoice, opponentChoice: RPSChoice): RPSOutcome {
    if (playerChoice === opponentChoice) {
      return 'draw';
    }

    const winConditions: Record<RPSChoice, RPSChoice> = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };

    return winConditions[playerChoice] === opponentChoice ? 'win' : 'lose';
  }

  /**
   * 执行完整的RPS判定流程
   */
  executeRPS(options: RPSOptions): RPSResult {
    const { playerId, opponentId, playerChoice, opponentChoice } = options;

    // 记录选择历史
    this.recordChoice(playerId, playerChoice);
    this.recordChoice(opponentId, opponentChoice);

    // 判定胜负
    const outcome = RPSMechanicSystem.judge(playerChoice, opponentChoice);
    const winner = outcome === 'draw' ? null : (outcome === 'win' ? playerId : opponentId);

    // 记录日志
    gameLogger.info('RPS', `RPS判定结果`, {
      playerId,
      opponentId,
      playerChoice: this.getChoiceName(playerChoice),
      opponentChoice: this.getChoiceName(opponentChoice),
      outcome,
      winner,
    });

    return {
      playerChoice,
      opponentChoice,
      outcome,
      winner,
    };
  }

  /**
   * 获取选择的中文名称
   */
  private getChoiceName(choice: RPSChoice): string {
    const names: Record<RPSChoice, string> = {
      rock: '石头',
      paper: '布',
      scissors: '剪刀',
    };
    return names[choice];
  }

  /**
   * 记录玩家选择历史
   */
  private recordChoice(playerId: string, choice: RPSChoice): void {
    if (!this.choiceHistory.has(playerId)) {
      this.choiceHistory.set(playerId, []);
    }
    const history = this.choiceHistory.get(playerId)!;
    history.push(choice);
    // 只保留最近10次选择
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * 获取玩家的选择历史
   */
  getChoiceHistory(playerId: string): RPSChoice[] {
    return this.choiceHistory.get(playerId) || [];
  }

  /**
   * 分析玩家的选择偏好
   * 用于AR02读心者的行为分析技能
   */
  analyzePreference(playerId: string): { preference: RPSChoice | null; confidence: number } {
    const history = this.getChoiceHistory(playerId);
    if (history.length < 3) {
      return { preference: null, confidence: 0 };
    }

    const counts = { rock: 0, paper: 0, scissors: 0 };
    history.forEach(choice => {
      counts[choice]++;
    });

    const total = history.length;
    const maxCount = Math.max(...Object.values(counts));
    const preference = Object.entries(counts).find(([_, count]) => count === maxCount)?.[0] as RPSChoice;
    const confidence = maxCount / total;

    return { preference, confidence };
  }

  /**
   * 预测玩家的下一次选择
   * 用于AR02读心者的预测技能
   */
  predictNextChoice(playerId: string): RPSChoice | null {
    const { preference } = this.analyzePreference(playerId);
    return preference;
  }

  /**
   * 检查是否是AR01的连击条件
   * 连续使用相同类型的卡牌
   */
  checkCombo(_playerId: string, _currentCardType: string): boolean {
    // 这里需要与卡牌系统集成
    // 简化实现：检查最近使用的卡牌类型
    return false; // 占位实现
  }

  /**
   * 重置系统状态
   */
  reset(): void {
    this.choiceHistory.clear();
    gameLogger.info('RPS', 'RPS系统状态已重置');
  }

  /**
   * 获取RPS选择界面数据
   */
  getRPSInterfaceData(): {
    choices: { value: RPSChoice; name: string; icon: string }[];
    rules: string;
  } {
    return {
      choices: [
        { value: 'rock', name: '石头', icon: '✊' },
        { value: 'paper', name: '布', icon: '✋' },
        { value: 'scissors', name: '剪刀', icon: '✌️' },
      ],
      rules: '石头胜剪刀，剪刀胜布，布胜石头',
    };
  }
}

// 导出单例实例
export const rpsSystem = RPSMechanicSystem.getInstance();

export default RPSMechanicSystem;
