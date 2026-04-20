import type { Card } from '@/types/legacy/card_v16';
import type { LevelGameState, AreaType, LevelTurnPhase } from '@/types/levelTypes';

// 难度级别
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// AI决策结果
export interface AIDecision {
  action: 'play_card' | 'use_skill' | 'place_marker' | 'skip' | 'end_turn';
  card?: Card;
  targetArea?: AreaType;
  targetEnemy?: string;
  reason: string;
  priority: number;
}

// AI操作日志
export interface AIOperationLog {
  timestamp: number;
  actor: 'dadong' | 'enemy';
  phase: LevelTurnPhase;
  action: string;
  description: string;
  result?: string;
}

// 威胁评估结果
export interface ThreatAssessment {
  overallThreat: number;
  areaThreats: Record<AreaType, number>;
  criticalTargets: AreaType[];
}

// 玩家意图分析
export interface PlayerIntent {
  needsProtection: boolean;
  targetArea?: AreaType;
  hasPlayedAttackCard: boolean;
  securityRatio: number;
}

// BaseAI基类
export abstract class BaseAI {
  protected state: LevelGameState | null = null;
  protected difficulty: AIDifficulty;
  protected operationLogs: AIOperationLog[] = [];
  protected onOperationLog?: (log: AIOperationLog) => void;
  protected onStateChange?: (state: LevelGameState) => void;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  // 设置游戏状态
  setState(state: LevelGameState): void {
    this.state = state;
  }

  // 设置操作日志回调
  setOnOperationLog(callback: (log: AIOperationLog) => void): void {
    this.onOperationLog = callback;
  }

  // 设置状态变更回调
  setOnStateChange(callback: (state: LevelGameState) => void): void {
    this.onStateChange = callback;
  }

  // 设置难度
  setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
  }

  // 记录操作日志
  protected logOperation(actor: 'dadong' | 'enemy', phase: LevelTurnPhase, action: string, description: string): void {
    const log: AIOperationLog = {
      timestamp: Date.now(),
      actor,
      phase,
      action,
      description
    };

    this.operationLogs.push(log);

    if (this.onOperationLog) {
      this.onOperationLog(log);
    }

    if (this.state) {
      if (!this.state.aiOperationLogs) {
        this.state.aiOperationLogs = [];
      }
      this.state.aiOperationLogs.push(log);
      if (this.state.aiOperationLogs.length > 50) {
        this.state.aiOperationLogs = this.state.aiOperationLogs.slice(-50);
      }
    }
  }

  // 延迟函数
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取区域威胁等级（通用方法）
  protected getAreaThreatLevel(area: AreaType): number {
    if (!this.state) return 0;
    const areaState = this.state.areaControl[area];
    return Math.max(0, areaState.attackMarkers - areaState.defenseMarkers);
  }

  // 计算威胁评估（通用方法）
  protected calculateThreatAssessment(): ThreatAssessment {
    if (!this.state) {
      return { overallThreat: 0, areaThreats: {} as Record<AreaType, number>, criticalTargets: [] };
    }

    const areaThreats: Record<AreaType, number> = {} as Record<AreaType, number>;
    const criticalTargets: AreaType[] = [];
    let overallThreat = 0;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      let threat = 0;

      threat += areaState.attackMarkers * 2;
      
      const areaImportance: Record<AreaType, number> = {
        internal: 10,
        industrial: 8,
        dmz: 5,
        external: 3
      };
      threat += areaImportance[area];

      if (areaState.controller === 'player') {
        threat += 5;
      } else if (areaState.controller === 'neutral') {
        threat += 3;
      }

      areaThreats[area] = threat;
      overallThreat += threat;

      if (threat > 15) {
        criticalTargets.push(area);
      }
    }

    return { overallThreat, areaThreats, criticalTargets };
  }

  // 识别玩家意图（通用方法）
  protected identifyPlayerIntent(): PlayerIntent {
    if (!this.state) {
      return { needsProtection: false, hasPlayedAttackCard: false, securityRatio: 1.0 };
    }

    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;
    
    const needsProtection = securityRatio < 0.4;
    
    let targetArea: AreaType | undefined;
    let maxEnemyMarkers = -1;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const markers = this.state.areaControl[area].attackMarkers;
      if (markers > maxEnemyMarkers) {
        maxEnemyMarkers = markers;
        targetArea = area;
      }
    }
    
    const hasPlayedAttackCard = false;
    
    return {
      needsProtection,
      targetArea,
      hasPlayedAttackCard,
      securityRatio
    };
  }

  // 抽象方法：执行回合
  abstract executeTurn(): Promise<{ success: boolean; logs: string[]; canProceed: boolean }>;

  // 获取操作日志
  getOperationLogs(): AIOperationLog[] {
    return [...this.operationLogs];
  }

  // 清除日志
  clearLogs(): void {
    this.operationLogs = [];
  }

  // 获取难度
  getDifficulty(): AIDifficulty {
    return this.difficulty;
  }
}

export default BaseAI;