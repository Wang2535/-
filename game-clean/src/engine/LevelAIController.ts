﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿/**
 * 关卡AI控制系统
 * 
 * 功能：
 * 1. 大东AI的完整七个阶段操作逻辑
 * 2. 敌人AI的完整七个阶段操作逻辑
 * 3. AI操作可视化展示
 * 4. 与对战模式AI架构保持一致
 * 5. 集成可视化组件和增强延迟管理器
 * 
 * 重构版本：完全匹配PvP对战模式的AI架构标准
 */

import type {
  LevelGameState,
  LevelTurnPhase,
  LevelPhaseResult,
  AreaType,
  EnemyState
} from '@/types/levelTypes';
import type { Card } from '@/types/legacy/card_v16';
import { LEVEL_PHASE_NAMES, AREA_NAMES, getLevelDrawCount } from '@/types/levelTypes';
import { getEnemiesByLevel } from '@/data/levelEnemies';
import { getHandLimitByRound } from '@/types/gameConstants';
import { AIDecisionDelayManager } from './AIDecisionDelayManager';
import type { 
  CardInfo, 
  HandState, 
  JudgmentInfo,
  EnemyAttackPhaseInfo,
  EnemySkillPhaseInfo,
  EnemyJudgmentPhaseInfo 
} from '@/components/level/AIActionVisualizer';
import type { EnemySkillName, SkillEffect } from '@/components/level/SkillVisualizer';
import { getRandomKnowledgeByLevel, type KnowledgeEntry } from '@/data/dadongKnowledgeBase';

// AI操作日志类型
export interface AIOperationLog {
  timestamp: number;
  actor: 'dadong' | 'enemy';
  phase: LevelTurnPhase;
  action: string;
  description: string;
  result?: string;
}

// AI决策结果
export interface AIDecision {
  action: 'play_card' | 'use_skill' | 'place_marker' | 'skip' | 'end_turn';
  card?: Card;
  targetArea?: AreaType;
  targetEnemy?: string;
  reason: string;
  priority: number; // 优先级，用于决策排序
}

// 摸牌阶段信息
export interface DrawPhaseInfo {
  drawnCards: CardInfo[];
  totalHandCount: number;
}

// 行动阶段信息
export interface ActionPhaseInfo {
  selectedCard?: CardInfo;
  availableCards?: CardInfo[];
  actionPoints: number;
  maxActionPoints: number;
}

// 弃牌阶段信息
export interface DiscardPhaseInfo {
  discardedCards: CardInfo[];
  remainingCards: number;
  handLimit: number;
}

// 可视化更新回调数据
export interface VisualizationUpdateData {
  actor: 'dadong' | 'enemy';
  phase: LevelTurnPhase;
  actionType?: string;
  progress: number;
  isVisible: boolean;
  message?: string;
  timestamp: number;
  playedCard?: CardInfo;
  handState?: HandState;
  handCards?: CardInfo[]; // 具体手牌列表
  judgmentInfo?: JudgmentInfo;
  drawPhaseInfo?: DrawPhaseInfo;
  actionPhaseInfo?: ActionPhaseInfo;
  discardPhaseInfo?: DiscardPhaseInfo;
  resources?: {
    computing: number;
    funds: number;
    information: number;
  };
  // 敌人AI特殊阶段信息
  enemyAttackPhaseInfo?: EnemyAttackPhaseInfo;
  enemySkillPhaseInfo?: EnemySkillPhaseInfo;
  enemyJudgmentPhaseInfo?: EnemyJudgmentPhaseInfo;
  // 技能视觉特效信息
  skillVisualization?: {
    skillName: EnemySkillName;
    skillDescription: string;
    targetArea?: string;
    intensity: 'low' | 'medium' | 'high';
    effects: SkillEffect[];
  };
}

// AI控制器配置
interface AIControllerConfig {
  dadongDifficulty: 'easy' | 'medium' | 'hard';
  enemyDifficulty: 'easy' | 'medium' | 'hard';
  enableVisualization: boolean;
  delayBetweenActions: number;
}

// 默认配置
const DEFAULT_CONFIG: AIControllerConfig = {
  dadongDifficulty: 'medium',
  enemyDifficulty: 'medium',
  enableVisualization: true,
  delayBetweenActions: 800
};

// 阶段进度映射
const PHASE_PROGRESS_MAP: Record<LevelTurnPhase, number> = {
  judgment: 0,
  recovery: 15,
  draw: 30,
  action: 50,
  response: 70,
  discard: 85,
  end: 100
};

// 敌人技能名称映射（将配置中的技能名称映射到视觉特效名称）
const ENEMY_SKILL_NAME_MAP: Record<string, EnemySkillName> = {
  // 第1关
  '软盘感染': '软盘感染',
  '第50次启动': '第50次启动',
  '社交工程传播': '社交工程传播',
  '潜伏复制': '潜伏复制',
  // 第2关
  '底层命令优先': '底层命令优先',
  '计算否定': '计算否定',
  '自动化扫描': '自动化扫描',
  '鱼叉式钓鱼': '鱼叉式钓鱼',
  // 第3关
  '自我繁殖': '自我繁殖',
  '高调感染': '高调感染',
  '漏洞扫描': '漏洞扫描',
  '现场处理': '现场处理',
  // 第4关
  '组件化加载': '组件化加载',
  '自我删除': '自我删除',
  '零日漏洞攻击': '零日漏洞攻击',
  '工业控制渗透': '工业控制渗透',
  // 第5关
  '传感器误导': '传感器误导',
  '控制权争夺': '控制权争夺',
  '故障模式触发': '故障模式触发',
  '指令冲突': '指令冲突',
  // 第6关
  '电磁脉冲攻击': '电磁脉冲攻击',
  '远程控制干扰': '远程控制干扰',
  '基础设施渗透': '基础设施渗透',
  '连锁故障': '连锁故障',
  // 第7关
  'MAC地址探测': 'MAC地址探测',
  '数据关联': '数据关联',
  '权限滥用': '权限滥用',
  '后台监听': '后台监听',
  // 第8关
  '密码分析': '密码分析',
  '七宗罪之力': '七宗罪之力',
  '暴力破解': '暴力破解',
  '历史攻击': '历史攻击',
  // 第9关
  '钓鱼陷阱': '钓鱼陷阱',
  '撞库攻击': '撞库攻击',
  '批量产号': '批量产号',
  '养号运营': '养号运营'
};

// 技能效果描述映射
const SKILL_EFFECT_DESCRIPTIONS: Record<string, string> = {
  '友方标记-1': '减少友方防御标记',
  '友方标记-2': '大幅减少友方防御标记',
  '行动点-1': '减少行动点',
  '行动点-2': '大幅减少行动点',
  '标记转化': '将友方标记转化为敌方标记',
  '感染扩散': '病毒扩散到相邻区域',
  '扫描探测': '扫描所有区域',
  '系统瘫痪': '系统进入瘫痪状态',
  '权限窃取': '窃取系统权限',
  '数据窃取': '窃取敏感数据',
  '密码破解': '尝试破解密码',
  '账号盗取': '尝试盗取账号'
};

// 大东技能配置
const DADONG_SKILL_CONFIG = {
  knowledgeTeaching: {
    id: 'DADONG_KNOWLEDGE', // 与 DADONG_AI.skills 中的 id 保持一致
    name: '安全知识讲解',
    cooldown: 1,
    description: '大东讲解网络安全知识，玩家阅读后获得资源奖励'
  }
};

export class LevelAIController {
  private state: LevelGameState | null = null;
  private config: AIControllerConfig;
  private operationLogs: AIOperationLog[] = [];
  private onOperationLog?: (log: AIOperationLog) => void;
  private onStateChange?: (state: LevelGameState) => void;
  
  // 可视化相关
  private onVisualizationUpdate?: (data: VisualizationUpdateData) => void;
  
  // 延迟管理器
  private dadongDelayManager: AIDecisionDelayManager;
  private enemyDelayManager: AIDecisionDelayManager;

  // 知识讲解技能冷却计数
  private knowledgeTeachingCooldown: number = 0;

  // 知识讲解技能回调
  private onKnowledgeTeaching?: (knowledge: KnowledgeEntry) => Promise<{ resourceType: string; resourceName: string }>;

  constructor(config: Partial<AIControllerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // 初始化延迟管理器
    this.dadongDelayManager = new AIDecisionDelayManager(this.config.dadongDifficulty, {
      minDelay: 2000,
      maxDelay: 5000,
      onProgress: (data) => this.handleDelayProgress('dadong', data)
    });
    
    this.enemyDelayManager = new AIDecisionDelayManager(this.config.enemyDifficulty, {
      minDelay: 2000,
      maxDelay: 5000,
      onProgress: (data) => this.handleDelayProgress('enemy', data)
    });
  }

  setState(state: LevelGameState): void {
    this.state = state;
  }

  setOnOperationLog(callback: (log: AIOperationLog) => void): void {
    this.onOperationLog = callback;
  }

  setOnStateChange(callback: (state: LevelGameState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * 设置可视化更新回调
   */
  setOnVisualizationUpdate(callback: (data: VisualizationUpdateData) => void): void {
    this.onVisualizationUpdate = callback;
  }

  /**
   * 设置知识讲解技能回调
   */
  setOnKnowledgeTeaching(callback: (knowledge: KnowledgeEntry) => Promise<{ resourceType: string; resourceName: string }>): void {
    this.onKnowledgeTeaching = callback;
  }

  /**
   * 处理延迟进度更新
   */
  private handleDelayProgress(
    actor: 'dadong' | 'enemy',
    progressData: { progress: number; remainingTime: number; totalTime: number; phase?: string; elapsedTime: number }
  ): void {
    if (!this.onVisualizationUpdate) return;

    const phase = (progressData.phase as LevelTurnPhase) || 'judgment';
    const baseProgress = PHASE_PROGRESS_MAP[phase] || 0;
    const actionProgress = Math.min(100, Math.round(baseProgress + (progressData.progress * 0.15)));

    this.onVisualizationUpdate({
      actor,
      phase,
      progress: actionProgress,
      isVisible: true,
      message: `${actor === 'dadong' ? '大东' : '敌人'}正在思考... (${progressData.progress}%)`,
      timestamp: Date.now()
    });
  }

  /**
   * 发送可视化更新
   */
  private sendVisualizationUpdate(
    actor: 'dadong' | 'enemy',
    phase: LevelTurnPhase,
    actionType?: string,
    message?: string,
    playedCard?: CardInfo,
    handState?: HandState,
    judgmentInfo?: JudgmentInfo,
    drawPhaseInfo?: DrawPhaseInfo,
    actionPhaseInfo?: ActionPhaseInfo,
    discardPhaseInfo?: DiscardPhaseInfo,
    resources?: { computing: number; funds: number; information: number },
    enemyAttackPhaseInfo?: EnemyAttackPhaseInfo,
    enemySkillPhaseInfo?: EnemySkillPhaseInfo,
    enemyJudgmentPhaseInfo?: EnemyJudgmentPhaseInfo,
    skillVisualization?: {
      skillName: EnemySkillName;
      skillDescription: string;
      targetArea?: string;
      intensity: 'low' | 'medium' | 'high';
      effects: SkillEffect[];
    },
    handCards?: CardInfo[]
  ): void {
    if (!this.onVisualizationUpdate) return;

    const baseProgress = PHASE_PROGRESS_MAP[phase] || 0;

    this.onVisualizationUpdate({
      actor,
      phase,
      actionType,
      progress: baseProgress,
      isVisible: true,
      message: message || `${actor === 'dadong' ? '大东' : '敌人'}${LEVEL_PHASE_NAMES[phase]}`,
      timestamp: Date.now(),
      playedCard,
      handState,
      handCards,
      judgmentInfo,
      drawPhaseInfo,
      actionPhaseInfo,
      discardPhaseInfo,
      resources,
      enemyAttackPhaseInfo,
      enemySkillPhaseInfo,
      enemyJudgmentPhaseInfo,
      skillVisualization
    });
  }

  /**
   * 隐藏可视化
   */
  private hideVisualization(actor: 'dadong' | 'enemy'): void {
    if (!this.onVisualizationUpdate) return;

    this.onVisualizationUpdate({
      actor,
      phase: 'end',
      progress: 100,
      isVisible: false,
      message: `${actor === 'dadong' ? '大东' : '敌人'}回合结束`,
      timestamp: Date.now()
    });
  }

  // ============================================
  // 大东AI完整回合流程（七个阶段）
  // ============================================

  async executeDadongTurn(): Promise<LevelPhaseResult> {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = ['🤖 【大东AI回合开始】'];
    this.operationLogs = [];

    // 发送回合开始可视化
    this.sendVisualizationUpdate('dadong', 'judgment', 'turn_start', '大东回合开始');

    // 阶段1: 判定阶段
    this.sendVisualizationUpdate('dadong', 'judgment', 'phase_start', '进入判定阶段');
    const judgmentResult = await this.executeDadongJudgmentPhase();
    logs.push(...judgmentResult.logs);
    if (!judgmentResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段2: 恢复阶段
    this.sendVisualizationUpdate('dadong', 'recovery', 'phase_start', '进入恢复阶段');
    const recoveryResult = await this.executeDadongRecoveryPhase();
    logs.push(...recoveryResult.logs);
    if (!recoveryResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段3: 摸牌阶段
    this.sendVisualizationUpdate('dadong', 'draw', 'phase_start', '进入摸牌阶段');
    const drawResult = await this.executeDadongDrawPhase();
    logs.push(...drawResult.logs);
    if (!drawResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段4: 行动阶段
    this.sendVisualizationUpdate('dadong', 'action', 'phase_start', '进入行动阶段');
    const actionResult = await this.executeDadongActionPhase();
    logs.push(...actionResult.logs);
    if (!actionResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段5: 响应阶段
    this.sendVisualizationUpdate('dadong', 'response', 'phase_start', '进入响应阶段');
    const responseResult = await this.executeDadongResponsePhase();
    logs.push(...responseResult.logs);
    if (!responseResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段6: 弃牌阶段
    this.sendVisualizationUpdate('dadong', 'discard', 'phase_start', '进入弃牌阶段');
    const discardResult = await this.executeDadongDiscardPhase();
    logs.push(...discardResult.logs);
    if (!discardResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段7: 结束阶段
    this.sendVisualizationUpdate('dadong', 'end', 'phase_start', '进入结束阶段');
    const endResult = await this.executeDadongEndPhase();
    logs.push(...endResult.logs);

    logs.push('🤖 【大东AI回合结束】');
    
    // 隐藏可视化
    this.hideVisualization('dadong');

    return { success: true, logs, canProceed: true };
  }

  // 大东AI判定阶段（完全匹配PvP标准）
  private async executeDadongJudgmentPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`📋 ${LEVEL_PHASE_NAMES['judgment']}`];
    
    this.logOperation('dadong', 'judgment', '检查判定', '大东检查待处理判定');
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('judgment');
    
    // 1. 结算待处理的判定（完全匹配PvP标准）
    const pendingJudgments = this.state?.pendingJudgments.filter(j => !j.resolved) || [];
    if (pendingJudgments.length > 0) {
      logs.push(`⚖️ 发现 ${pendingJudgments.length} 个待处理判定`);
      
      // 使用与PvP模式相同的判定系统
      for (const judgment of pendingJudgments) {
        // 执行骰子判定（完全匹配PvP标准）
        const difficulty = judgment.difficulty || 3;
        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll > difficulty;
        
        // 大成功/大失败判定（完全匹配PvP标准）
        const isCriticalSuccess = roll === 6 && difficulty <= 3;
        const isCriticalFailure = roll === 1 && difficulty >= 4;
        
        let resultText = '';
        if (isCriticalSuccess) {
          resultText = `大成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`🌟 ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '大成功', judgment.description);
        } else if (isCriticalFailure) {
          resultText = `大失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`💥 ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '大失败', judgment.description);
        } else if (success) {
          resultText = `成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`✅ ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '判定成功', judgment.description);
        } else {
          resultText = `失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`❌ ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '判定失败', judgment.description);
        }
        
        // 构建判定信息并发送
        const judgmentInfo: JudgmentInfo = {
          success: success || isCriticalSuccess,
          result: resultText,
          details: judgment.description
        };
        this.sendVisualizationUpdate(
          'dadong',
          'judgment',
          'judge',
          resultText,
          undefined,
          undefined,
          judgmentInfo
        );
        
        // 标记判定已处理
        judgment.resolved = true;
        
        // 应用判定效果
        if (judgment.effects) {
          const effect = success || isCriticalSuccess ? judgment.effects.success : judgment.effects.failure;
          if (effect) {
            this.applyJudgmentEffect(effect, isCriticalSuccess);
          }
        }
      }
      
      logs.push(`✅ 所有待处理判定已结算`);
    } else {
      logs.push('✓ 无待处理判定');
    }

    // 2. 结算持续效果
    logs.push('📋 结算持续效果...');
    this.applyDadongSpecialAbility();
    logs.push('✓ 持续效果已更新');

    return { success: true, logs, canProceed: true };
  }
  
  // 应用判定效果
  private applyJudgmentEffect(effect: any, isCritical: boolean): void {
    if (!this.state) return;
    
    const multiplier = isCritical ? 2 : 1;
    
    if (effect.securityChange) {
      this.state.playerState.securityLevel = Math.max(0, Math.min(
        this.state.playerState.maxSecurityLevel,
        this.state.playerState.securityLevel + effect.securityChange * multiplier
      ));
    }
    
    if (effect.infiltrationChange) {
      this.state.enemyState.infiltrationLevel = Math.max(0, Math.min(
        100,
        this.state.enemyState.infiltrationLevel + effect.infiltrationChange * multiplier
      ));
    }
    
    if (effect.resourceGain) {
      const dadong = this.state.dadongAIState;
      if (effect.resourceGain.compute) {
        dadong.resources.computing = Math.min(15, dadong.resources.computing + effect.resourceGain.compute * multiplier);
      }
      if (effect.resourceGain.funds) {
        dadong.resources.funds = Math.min(15, dadong.resources.funds + effect.resourceGain.funds * multiplier);
      }
      if (effect.resourceGain.information) {
        dadong.resources.information = Math.min(12, dadong.resources.information + effect.resourceGain.information * multiplier);
      }
    }
  }

  // 大东AI特殊能力：安全知识讲解
  private applyDadongSpecialAbility(): void {
    if (!this.state) return;

    const level = this.state.currentLevel;
    if (level.dadongConfig?.specialAbility) {
      // 每回合为一名友方角色恢复1行动点
      if (this.state.playerState.actionPoints < this.state.playerState.maxActionPoints) {
        this.state.playerState.actionPoints = Math.min(
          this.state.playerState.maxActionPoints,
          this.state.playerState.actionPoints + 1
        );
        
        // 更新大东技能使用计数（用于胜利条件2：知识普及）
        if (!this.state.dadongSkillUsageCount) {
          this.state.dadongSkillUsageCount = 0;
        }
        this.state.dadongSkillUsageCount++;
        
        this.logOperation(
          'dadong', 
          'judgment', 
          '使用特殊能力', 
          `安全知识讲解：为玩家恢复1行动点（第${this.state.dadongSkillUsageCount}次）`
        );
      }
    }
  }

  // 大东AI恢复阶段（完全匹配PvP标准）
  private async executeDadongRecoveryPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`💫 ${LEVEL_PHASE_NAMES['recovery']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    const oldResources = { ...dadong.resources };

    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('recovery');

    // 1. 基础资源恢复（匹配PvP标准）
    // 根据轮次决定恢复量（简化版：固定恢复）
    const baseRecovery = {
      computing: 3,
      funds: 3,
      information: 3
    };
    
    dadong.resources.computing = Math.min(15, dadong.resources.computing + baseRecovery.computing);
    dadong.resources.funds = Math.min(15, dadong.resources.funds + baseRecovery.funds);
    dadong.resources.information = Math.min(12, dadong.resources.information + baseRecovery.information);

    const restoredResources: string[] = [];
    if (dadong.resources.computing > oldResources.computing) {
      restoredResources.push(`算力+${dadong.resources.computing - oldResources.computing}`);
    }
    if (dadong.resources.funds > oldResources.funds) {
      restoredResources.push(`资金+${dadong.resources.funds - oldResources.funds}`);
    }
    if (dadong.resources.information > oldResources.information) {
      restoredResources.push(`信息+${dadong.resources.information - oldResources.information}`);
    }

    if (restoredResources.length > 0) {
      logs.push(`💫 基础恢复: ${restoredResources.join(', ')}`);
      this.logOperation('dadong', 'recovery', '资源恢复', restoredResources.join(', '));
    }

    // 2. 区域控制加成（匹配PvP标准）
    // 统计玩家控制的区域数量
    let controlledAreas = 0;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'player') {
        controlledAreas++;
      }
    }
    
    if (controlledAreas > 0) {
      // 每个控制区域额外恢复1点资源
      dadong.resources.computing = Math.min(15, dadong.resources.computing + controlledAreas);
      dadong.resources.funds = Math.min(15, dadong.resources.funds + controlledAreas);
      logs.push(`🏰 区域控制加成: 所有资源+${controlledAreas}（控制${controlledAreas}个区域）`);
      this.logOperation('dadong', 'recovery', '区域加成', `控制${controlledAreas}个区域`);
    }

    // 3. 恢复行动点
    dadong.actionPoints = dadong.maxActionPoints;
    logs.push(`⚡ 行动点恢复至 ${dadong.actionPoints}`);

    return { success: true, logs, canProceed: true };
  }

  // 大东AI摸牌阶段（完全匹配PvP标准）
  private async executeDadongDrawPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🎴 ${LEVEL_PHASE_NAMES['draw']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('draw');
    
    // 1. 计算抽卡数量（与玩家一致：1-4轮2张，5-8轮3张，9-16轮4张，17-24轮5张）
    const drawCount = getLevelDrawCount(this.state.round);
    
    const drawnCardInfos: CardInfo[] = [];
    
    // 2. 从牌库抽牌（与玩家一致，无手牌上限限制）
    for (let i = 0; i < drawCount; i++) {
      if (dadong.deck.length > 0) {
        const card = dadong.deck.pop()!;
        dadong.hand.push(card);
        drawnCardInfos.push(this.convertToCardInfo(card));
      } else {
        logs.push('⚠️ 牌库已空，无法继续抽牌');
        break;
      }
    }
    
    if (drawnCardInfos.length > 0) {
      logs.push(`🎴 基础抽牌: ${drawCount}张（轮次${this.state.round}）`);
      logs.push(`✅ 摸了 ${drawnCardInfos.length} 张牌: ${drawnCardInfos.map(c => c.name).join(', ')}`);
      this.logOperation('dadong', 'draw', '摸牌', `摸了${drawnCardInfos.length}张牌`);
      
      // 构建手牌状态并发送
      const handState = this.buildHandState(dadong.hand);
      
      // 构建当前手牌信息（用于显示）
      const currentHandCards: CardInfo[] = dadong.hand.map(card => this.convertToCardInfo(card));
      
      // 构建摸牌阶段信息
      const drawPhaseInfo: DrawPhaseInfo = {
        drawnCards: drawnCardInfos,
        totalHandCount: dadong.hand.length
      };
      
      // 发送可视化更新，包含摸牌阶段详细信息和当前手牌
      this.sendVisualizationUpdate(
        'dadong',
        'draw',
        'draw_card',
        `摸了 ${drawnCardInfos.length} 张牌`,
        undefined,
        handState,
        undefined,
        drawPhaseInfo,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        currentHandCards
      );
    } else {
      logs.push('⚠️ 牌库已空，无法摸牌');
      
      // 即使没有摸牌，也发送当前手牌状态
      const handState = this.buildHandState(dadong.hand);
      const currentHandCards: CardInfo[] = dadong.hand.map(card => this.convertToCardInfo(card));
      const drawPhaseInfo: DrawPhaseInfo = {
        drawnCards: [],
        totalHandCount: dadong.hand.length
      };
      
      this.sendVisualizationUpdate(
        'dadong',
        'draw',
        'draw_card',
        '牌库已空，无法摸牌',
        undefined,
        handState,
        undefined,
        drawPhaseInfo,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        currentHandCards
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 大东AI行动阶段
  private async executeDadongActionPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`⚡ ${LEVEL_PHASE_NAMES['action']}`];

    // 行动阶段开始时触发知识讲解技能
    logs.push('📚 检查知识讲解技能...');
    await this.checkAndTriggerDadongKnowledgeTeaching(logs);

    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    let actionsTaken = 0;
    const maxActions = 10; // 防止无限循环

    logs.push(`🎯 大东开始行动（行动点: ${dadong.actionPoints}）`);

    // 发送行动阶段开始可视化，包含手牌和可用卡牌信息
    const availableCards = dadong.hand.map(card => this.convertToCardInfo(card));
    const initialActionPhaseInfo: ActionPhaseInfo = {
      selectedCard: undefined,
      availableCards: availableCards,
      actionPoints: dadong.actionPoints,
      maxActionPoints: dadong.maxActionPoints
    };
    
    this.sendVisualizationUpdate(
      'dadong',
      'action',
      'phase_start',
      `行动阶段开始，手牌 ${dadong.hand.length} 张，行动点 ${dadong.actionPoints}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      initialActionPhaseInfo,
      undefined,
      dadong.resources
    );

    while (dadong.actionPoints > 0 && dadong.hand.length > 0 && actionsTaken < maxActions) {
      const decision = this.makeDadongDecision();
      
      if (decision.action === 'skip' || decision.action === 'end_turn') {
        logs.push('⏹️ 大东决定结束行动');
        break;
      }

      if (decision.action === 'play_card' && decision.card) {
        const cardIndex = dadong.hand.findIndex(c => c.card_code === decision.card?.card_code);
        if (cardIndex >= 0) {
          const card = dadong.hand.splice(cardIndex, 1)[0];
          dadong.actionPoints -= 1;
          actionsTaken++;

          // 扣除资源
          const cost = card.cost || {};
          if (cost.compute) {
            dadong.resources.computing -= cost.compute;
            logs.push(`💻 消耗算力: ${cost.compute}`);
          }
          if (cost.funds) {
            dadong.resources.funds -= cost.funds;
            logs.push(`💰 消耗资金: ${cost.funds}`);
          }
          if (cost.information) {
            dadong.resources.information -= cost.information;
            logs.push(`📊 消耗信息: ${cost.information}`);
          }

          // 应用卡牌效果
          this.applyDadongCardEffect(card, decision.targetArea);
          
          logs.push(`🃏 使用卡牌: ${card.name}`);
          this.logOperation('dadong', 'action', '使用卡牌', `${card.name} (${decision.reason})`);
          
          dadong.lastPlayedCard = card;
          
          // 构建卡牌信息
          const playedCardInfo = this.convertToCardInfo(card);
          
          // 构建行动阶段信息
          const actionPhaseInfo: ActionPhaseInfo = {
            selectedCard: playedCardInfo,
            availableCards: dadong.hand.map(c => this.convertToCardInfo(c)),
            actionPoints: dadong.actionPoints,
            maxActionPoints: dadong.maxActionPoints
          };
          
          // 发送行动进度更新，包含卡牌信息和行动阶段详情
          this.sendVisualizationUpdate(
            'dadong',
            'action',
            'playing_card',
            `使用卡牌: ${card.name} (${actionsTaken}/${maxActions})`,
            playedCardInfo,
            undefined,
            undefined,
            undefined,
            actionPhaseInfo,
            undefined,
            dadong.resources
          );
        }
      }

      // 使用标准2秒延迟
      await this.dadongDelayManager.executeStandardDelay('action');
    }

    logs.push(`✅ 大东行动结束，共执行 ${actionsTaken} 个行动`);

    return { success: true, logs, canProceed: true };
  }

  // 检查并触发大东知识讲解技能
  private async checkAndTriggerDadongKnowledgeTeaching(logs: string[]): Promise<void> {
    if (!this.state) return;

    const dadong = this.state.dadongAIState;
    const skillId = DADONG_SKILL_CONFIG.knowledgeTeaching.id;
    
    // 初始化 skillCooldowns 如果不存在
    if (!dadong.skillCooldowns) {
      dadong.skillCooldowns = {};
    }
    
    const currentCooldown = dadong.skillCooldowns[skillId] || 0;

    // 检查技能冷却
    if (currentCooldown > 0) {
      dadong.skillCooldowns[skillId] = currentCooldown - 1;
      logs.push(`⏳ 知识讲解技能冷却中，剩余 ${dadong.skillCooldowns[skillId]} 轮`);
      return;
    }

    // 检查是否有回调函数（优先使用实例回调，如果没有则尝试使用 window 上的全局回调）
    const knowledgeCallback = this.onKnowledgeTeaching || 
      (typeof window !== 'undefined' ? (window as unknown as { onKnowledgeTeaching?: (knowledge: KnowledgeEntry) => Promise<{ resourceType: string; resourceName: string }> }).onKnowledgeTeaching : undefined);
    
    if (!knowledgeCallback) {
      logs.push('⚠️ 知识讲解回调未设置');
      return;
    }

    try {
      // 从知识库获取适合当前关卡的知识
      const levelId = this.state.currentLevel.id;
      const knowledge = getRandomKnowledgeByLevel(levelId);

      if (!knowledge) {
        logs.push('⚠️ 未找到合适的知识内容');
        return;
      }

      logs.push(`📚 大东开始讲解: ${knowledge.title}`);

      // 触发技能特效
      if (typeof window !== 'undefined') {
        (window as unknown as { onSkillTrigger?: (skillId: string, skillName: string, actor: string) => void }).onSkillTrigger?.(skillId, DADONG_SKILL_CONFIG.knowledgeTeaching.name, 'dadong');
      }

      // 调用回调函数显示弹窗，等待玩家阅读完毕
      const result = await knowledgeCallback(knowledge);

      // 给予玩家随机资源+1奖励
      switch (result.resourceType) {
        case 'computing':
          dadong.resources.computing = Math.min(15, dadong.resources.computing + 1);
          break;
        case 'funds':
          dadong.resources.funds = Math.min(15, dadong.resources.funds + 1);
          break;
        case 'information':
          dadong.resources.information = Math.min(12, dadong.resources.information + 1);
          break;
      }

      // 设置技能冷却为1轮
      dadong.skillCooldowns[skillId] = DADONG_SKILL_CONFIG.knowledgeTeaching.cooldown;

      // 更新大东技能使用计数（用于胜利条件2：知识普及）
      if (!this.state.dadongSkillUsageCount) {
        this.state.dadongSkillUsageCount = 0;
      }
      this.state.dadongSkillUsageCount++;

      logs.push(`✅ 知识讲解完成！获得 ${result.resourceName} +1`);
      logs.push(`⏳ 知识讲解技能进入冷却（${dadong.skillCooldowns[skillId]}轮）`);
      logs.push(`📊 安全知识讲解计数：${this.state.dadongSkillUsageCount}/3`);

      this.logOperation(
        'dadong',
        'action',
        '知识讲解',
        `讲解"${knowledge.title}"，获得${result.resourceName}+1（第${this.state.dadongSkillUsageCount}次）`
      );
    } catch (error) {
      logs.push('❌ 知识讲解技能执行失败');
      console.error('知识讲解技能错误:', error);
    }
  }

  // 大东AI决策逻辑 - 增强版协同策略
  private makeDadongDecision(): AIDecision {
    if (!this.state) {
      return { action: 'skip', reason: '无游戏状态', priority: 0 };
    }

    const dadong = this.state.dadongAIState;
    
    // 如果没有手牌或行动点，跳过
    if (dadong.hand.length === 0 || dadong.actionPoints <= 0) {
      return { action: 'skip', reason: '无手牌或行动点', priority: 0 };
    }

    // 识别玩家意图和战场情况
    const playerIntent = this.identifyPlayerIntent();
    
    // 评估所有可能的行动，选择最优解
    const possibleDecisions: AIDecision[] = [];
    
    // 评估每张卡牌的价值
    for (const card of dadong.hand) {
      const decision = this.evaluateCardForDadong(card, playerIntent);
      if (decision) {
        possibleDecisions.push(decision);
      }
    }
    
    // 按优先级排序，选择最高优先级的行动
    if (possibleDecisions.length > 0) {
      possibleDecisions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      return possibleDecisions[0];
    }

    // 如果没有合适的卡牌，结束回合
    return { action: 'skip', reason: '无合适行动', priority: 0 };
  }
  
  // 识别玩家意图
  private identifyPlayerIntent(): { 
    needsProtection: boolean; 
    targetArea?: AreaType; 
    hasPlayedAttackCard: boolean;
    securityRatio: number;
  } {
    if (!this.state) {
      return { needsProtection: false, hasPlayedAttackCard: false, securityRatio: 1.0 };
    }

    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;
    
    // 检查玩家是否需要保护
    const needsProtection = securityRatio < 0.4;
    
    // 查找玩家可能的目标区域（有最多敌方标记的区域）
    let targetArea: AreaType | undefined;
    let maxEnemyMarkers = -1;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const markers = this.state.areaControl[area].attackMarkers;
      if (markers > maxEnemyMarkers) {
        maxEnemyMarkers = markers;
        targetArea = area;
      }
    }
    
    // 检查玩家最近是否使用了攻击类卡牌（简化版）
    const hasPlayedAttackCard = false; // 这需要跟踪玩家出牌历史
    
    return {
      needsProtection,
      targetArea,
      hasPlayedAttackCard,
      securityRatio
    };
  }
  
  // 评估卡牌对大东AI的价值 - 增强版协同策略
  private evaluateCardForDadong(card: Card, playerIntent?: { 
    needsProtection: boolean; 
    targetArea?: AreaType; 
    hasPlayedAttackCard: boolean;
    securityRatio: number;
  }): AIDecision | null {
    if (!this.state) return null;
    
    const targetArea = this.findBestTargetAreaForDadong(playerIntent?.targetArea);
    const dadong = this.state.dadongAIState;
    
    // 检查资源是否足够
    const cost = card.cost || {};
    if (cost.compute && dadong.resources.computing < cost.compute) {
      return null;
    }
    if (cost.funds && dadong.resources.funds < cost.funds) {
      return null;
    }
    if (cost.information && dadong.resources.information < cost.information) {
      return null;
    }
    
    // 获取卡牌效果
    const effect = card.effects?.[0];
    if (!effect) return null;
    
    let priority = 5;
    let reason = '常规行动';
    
    // 协同策略1：玩家需要保护时，优先使用保护类卡牌
    if (playerIntent?.needsProtection) {
      if (effect.type === 'security_gain') {
        priority = 15;
        reason = '紧急：玩家安全等级低，优先提升安全';
      } else if (effect.type === 'infiltration_reduce') {
        priority = 14;
        reason = '紧急：玩家需要保护，优先清除威胁';
      }
    } else {
      if (effect.type === 'security_gain') {
        if (playerIntent && playerIntent.securityRatio < 0.6) {
          priority = 7;
          reason = '提升安全等级';
        } else {
          priority = 4;
          reason = '常规安全提升';
        }
      } else if (effect.type === 'infiltration_reduce') {
        const enemyMarkers = this.state.areaControl[targetArea].attackMarkers;
        if (playerIntent?.targetArea === targetArea) {
          priority = 12;
          reason = '配合玩家：清除同一区域敌方标记';
        } else if (enemyMarkers >= 5) {
          priority = 10;
          reason = '清除大量敌方标记';
        } else if (enemyMarkers >= 3) {
          priority = 8;
          reason = '清除敌方标记';
        } else if (enemyMarkers > 0) {
          priority = 6;
          reason = '清除标记';
        }
      } else if (effect.type === 'resource_gain') {
        priority = 3;
        reason = '获取资源';
      } else {
        priority = 3 + Math.random() * 3;
        reason = '使用卡牌';
      }
    }
    
    // 难度调整
    switch (this.config.dadongDifficulty) {
      case 'easy':
        priority *= 0.8; // 简单难度略微降低策略性
        break;
      case 'hard':
        priority *= 1.2; // 困难难度增强策略性
        break;
    }
    
    return {
      action: 'play_card',
      card,
      targetArea,
      reason,
      priority
    };
  }
  
  // 为大东AI查找最佳目标区域 - 支持配合玩家
  private findBestTargetAreaForDadong(playerTargetArea?: AreaType): AreaType {
    if (!this.state) return 'internal';

    // 协同策略：如果玩家有目标区域，优先选择同一区域
    if (playerTargetArea) {
      const areaState = this.state.areaControl[playerTargetArea];
      if (areaState.attackMarkers > 0) {
        return playerTargetArea;
      }
    }

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    let bestArea: AreaType = 'internal';
    let highestThreat = -1;

    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      const threat = areaState.attackMarkers - areaState.defenseMarkers;
      if (threat > highestThreat) {
        highestThreat = threat;
        bestArea = area;
      }
    }

    return bestArea;
  }

  // 应用大东AI卡牌效果
  private applyDadongCardEffect(card: Card, _targetArea?: AreaType): void {
    if (!this.state) return;

    const effect = card.effects?.[0];
    if (!effect) return;

    switch (effect.type) {
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.maxSecurityLevel,
          this.state.playerState.securityLevel + ((effect as any).baseValue || 1) + this.state.dadongAIState.cooperationBonus
        );
        break;
      case 'infiltration_reduce':
        this.state.enemyState.infiltrationLevel = Math.max(
          0,
          this.state.enemyState.infiltrationLevel - ((effect as any).baseValue || 1)
        );
        break;
    }
  }

  // 转换Card为CardInfo
  private convertToCardInfo(card: Card): CardInfo {
    const effectText = card.effects?.[0] ? 
      `${(card.effects[0] as any).type} 效果` : 
      '无效果描述';
    
    // 根据卡牌类型选择图标
    let icon = '🃏';
    const cardType = card.type?.toLowerCase() || '';
    if (cardType.includes('defense') || cardType.includes('防御')) {
      icon = '🛡️';
    } else if (cardType.includes('attack') || cardType.includes('攻击')) {
      icon = '⚔️';
    } else if (cardType.includes('skill') || cardType.includes('技能')) {
      icon = '✨';
    } else if (cardType.includes('trap') || cardType.includes('陷阱')) {
      icon = '🕸️';
    } else if (cardType.includes('resource') || cardType.includes('资源')) {
      icon = '💎';
    }
    
    return {
      name: card.name,
      type: card.type || '普通',
      card_code: card.card_code,
      cost: card.cost,
      effect: card.description || effectText,
      rarity: card.rarity as any || 'common',
      techLevel: card.techLevel,
      difficulty: card.difficulty,
      icon: icon
    };
  }

  // 构建手牌状态信息
  private buildHandState(hand: Card[]): HandState {
    const typeDistribution: Record<string, number> = {};
    
    hand.forEach(card => {
      const type = card.type || '普通';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });
    
    return {
      count: hand.length,
      typeDistribution
    };
  }

  // 大东AI响应阶段
  private async executeDadongResponsePhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`⏱️ ${LEVEL_PHASE_NAMES['response']}`];
    
    this.logOperation('dadong', 'response', '检查响应', '检查是否需要响应敌方行动');
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('response');
    
    // 检查响应事件
    const unresolvedEvents = this.state?.responseEvents.filter(e => !e.responded) || [];
    if (unresolvedEvents.length > 0) {
      logs.push(`⏱️ 需要响应 ${unresolvedEvents.length} 个事件`);
      // 大东AI自动响应（简化版）
      unresolvedEvents.forEach(event => {
        event.responded = true;
        logs.push(`✅ 自动响应：${event.description}`);
        this.logOperation('dadong', 'response', '响应事件', event.description);
      });
      
      // 构建响应阶段信息并发送
      const responsePhaseInfo: any = {
        events: unresolvedEvents.map(e => ({
          id: e.id,
          description: e.description,
          responded: true
        })),
        message: `已响应 ${unresolvedEvents.length} 个事件`
      };
      
      this.sendVisualizationUpdate(
        'dadong',
        'response',
        'responding',
        `已响应 ${unresolvedEvents.length} 个事件`,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    } else {
      logs.push('✓ 无需要响应的事件');
      
      // 即使没有事件也发送响应阶段信息
      const responsePhaseInfo: any = {
        events: [],
        message: '无需要响应的事件'
      };
      
      this.sendVisualizationUpdate(
        'dadong',
        'response',
        'response_complete',
        '无需要响应的事件',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 大东AI弃牌阶段（完全匹配PvP标准）
  private async executeDadongDiscardPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🗑️ ${LEVEL_PHASE_NAMES['discard']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('discard');
    
    // 1. 计算手牌上限（完全匹配PvP标准）
    // R4.3: 手牌上限基于轮次（round）而非回合（turn）
    // 24轮次制：1-4轮次1张，5-8轮次3张，9-16轮次4张，17-24轮次5张
    const currentRound = this.state.round;
    const handLimit = getHandLimitByRound(currentRound);
    
    let handLimitRange: string;
    if (currentRound <= 4) {
      handLimitRange = '1-4轮次';
    } else if (currentRound <= 8) {
      handLimitRange = '5-8轮次';
    } else if (currentRound <= 16) {
      handLimitRange = '9-16轮次';
    } else {
      handLimitRange = '17-24轮次';
    }
    
    const currentHandSize = dadong.hand.length;

    logs.push(`📋 手牌上限: ${handLimit}张 (${handLimitRange})`);
    logs.push(`🎴 当前手牌: ${currentHandSize}张`);

    if (currentHandSize > handLimit) {
      const discardCount = currentHandSize - handLimit;
      const discardedCardInfos: CardInfo[] = [];
      
      for (let i = 0; i < discardCount; i++) {
        if (dadong.hand.length > 0) {
          // 优先弃置非防御卡牌
          const nonDefenseIndex = dadong.hand.findIndex(c => 
            c.faction !== 'defense' && !c.type?.includes('defense')
          );
          const indexToDiscard = nonDefenseIndex >= 0 ? nonDefenseIndex : 0;
          const card = dadong.hand.splice(indexToDiscard, 1)[0];
          discardedCardInfos.push(this.convertToCardInfo(card));
        }
      }
      
      logs.push(`🗑️ 弃置 ${discardedCardInfos.length} 张牌: ${discardedCardInfos.map(c => c.name).join(', ')}`);
      logs.push(`✅ 保留 ${handLimit} 张手牌`);
      this.logOperation('dadong', 'discard', '弃牌', `弃置${discardedCardInfos.map(c => c.name).join(', ')}`);
      
      // 构建手牌状态
      const handState = this.buildHandState(dadong.hand);
      
      // 构建弃牌阶段信息
      const discardPhaseInfo: DiscardPhaseInfo = {
        discardedCards: discardedCardInfos,
        remainingCards: dadong.hand.length,
        handLimit: handLimit
      };
      
      // 发送可视化更新，包含弃牌阶段详细信息
      this.sendVisualizationUpdate(
        'dadong',
        'discard',
        'discard_card',
        `弃置 ${discardedCardInfos.length} 张牌`,
        undefined,
        handState,
        undefined,
        undefined,
        undefined,
        discardPhaseInfo
      );
    } else {
      logs.push(`✅ 手牌数量符合要求（${currentHandSize}/${handLimit}）`);
      
      // 构建手牌状态
      const handState = this.buildHandState(dadong.hand);
      
      // 构建弃牌阶段信息（无需弃牌）
      const discardPhaseInfo: DiscardPhaseInfo = {
        discardedCards: [],
        remainingCards: dadong.hand.length,
        handLimit: handLimit
      };
      
      // 发送可视化更新
      this.sendVisualizationUpdate(
        'dadong',
        'discard',
        'discard_complete',
        '手牌数量符合要求',
        undefined,
        handState,
        undefined,
        undefined,
        undefined,
        discardPhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 大东AI结束阶段
  private async executeDadongEndPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🏁 ${LEVEL_PHASE_NAMES['end']}`];
    
    this.logOperation('dadong', 'end', '结束回合', '清除临时效果，准备结束');
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('end');
    
    logs.push('🏁 清除临时效果');
    logs.push('✓ 大东回合结束');

    return { success: true, logs, canProceed: true };
  }

  // ============================================
  // 敌人AI完整回合流程（七个阶段）
  // ============================================

  /**
   * 根据敌人索引获取敌人状态
   * @param index 0 表示敌人1，1 表示敌人2
   */
  private getEnemyStateByIndex(index: number): EnemyState {
    if (!this.state) {
      throw new Error('游戏状态未设置');
    }
    return index === 0 ? this.state.enemyState : this.state.enemy2State!;
  }

  /**
   * 根据敌人标识获取敌人索引和状态
   * @param enemyId 'enemy1' 或 'enemy2'
   */
  private getEnemyInfo(enemyId: 'enemy1' | 'enemy2'): { index: number; state: EnemyState; actor: 'enemy' | 'enemy2' } {
    const index = enemyId === 'enemy1' ? 0 : 1;
    const state = this.getEnemyStateByIndex(index);
    const actor: 'enemy' | 'enemy2' = enemyId === 'enemy1' ? 'enemy' : 'enemy2';
    return { index, state, actor };
  }

  async executeEnemyTurn(enemyId: 'enemy1' | 'enemy2' = 'enemy1'): Promise<LevelPhaseResult> {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const { index: enemyIndex, state: enemyState, actor } = this.getEnemyInfo(enemyId);
    const enemyNumber = enemyIndex + 1;
    const logs: string[] = [`👾 【敌人${enemyNumber}回合开始】`];
    
    // 获取当前关卡的敌人
    const levelEnemies = getEnemiesByLevel(parseInt(this.state.currentLevel.id.replace('LV', '')));
    
    // 发送回合开始可视化
    this.sendVisualizationUpdate(actor, 'judgment', 'turn_start', `敌人${enemyNumber}回合开始`);

    // 阶段1: 判定阶段
    this.sendVisualizationUpdate(actor, 'judgment', 'phase_start', '进入判定阶段');
    const judgmentResult = await this.executeEnemyJudgmentPhase(levelEnemies, enemyIndex);
    logs.push(...judgmentResult.logs);
    if (!judgmentResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段2: 恢复阶段
    this.sendVisualizationUpdate(actor, 'recovery', 'phase_start', '进入恢复阶段');
    const recoveryResult = await this.executeEnemyRecoveryPhase(enemyIndex);
    logs.push(...recoveryResult.logs);
    if (!recoveryResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段3: 摸牌阶段
    this.sendVisualizationUpdate(actor, 'draw', 'phase_start', '进入摸牌阶段');
    const drawResult = await this.executeEnemyDrawPhase(enemyIndex);
    logs.push(...drawResult.logs);
    if (!drawResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段4: 行动阶段
    this.sendVisualizationUpdate(actor, 'action', 'phase_start', '进入行动阶段');
    const actionResult = await this.executeEnemyActionPhase(levelEnemies, enemyIndex);
    logs.push(...actionResult.logs);
    if (!actionResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段5: 响应阶段
    this.sendVisualizationUpdate(actor, 'response', 'phase_start', '进入响应阶段');
    const responseResult = await this.executeEnemyResponsePhase(enemyIndex);
    logs.push(...responseResult.logs);
    if (!responseResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段6: 弃牌阶段
    this.sendVisualizationUpdate(actor, 'discard', 'phase_start', '进入弃牌阶段');
    const discardResult = await this.executeEnemyDiscardPhase(enemyIndex);
    logs.push(...discardResult.logs);
    if (!discardResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段7: 结束阶段
    this.sendVisualizationUpdate(actor, 'end', 'phase_start', '进入结束阶段');
    const endResult = await this.executeEnemyEndPhase(enemyIndex);
    logs.push(...endResult.logs);

    logs.push(`👾 【敌人${enemyNumber}回合结束】`);
    
    // 隐藏可视化
    this.hideVisualization(actor);

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI判定阶段（完全匹配PvP标准）
  private async executeEnemyJudgmentPhase(enemies: any[], enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`📋 ${LEVEL_PHASE_NAMES['judgment']}`];
    
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    
    this.logOperation(actor, 'judgment', '检查判定', `敌人${enemyNumber}检查技能冷却和状态`);
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('judgment');
    
    // 1. 结算待处理的判定（完全匹配PvP标准）
    const pendingJudgments = this.state?.pendingJudgments.filter(j => !j.resolved) || [];
    if (pendingJudgments.length > 0) {
      logs.push(`⚖️ 发现 ${pendingJudgments.length} 个待处理判定`);
      
      // 使用与PvP模式相同的判定系统
      for (const judgment of pendingJudgments) {
        // 执行骰子判定（完全匹配PvP标准）
        const difficulty = judgment.difficulty || 3;
        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll > difficulty;
        
        // 大成功/大失败判定（完全匹配PvP标准）
        const isCriticalSuccess = roll === 6 && difficulty <= 3;
        const isCriticalFailure = roll === 1 && difficulty >= 4;
        
        let resultText = '';
        if (isCriticalSuccess) {
          resultText = `大成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`🌟 ${resultText} - ${judgment.description}`);
          this.logOperation(actor, 'judgment', '大成功', judgment.description);
        } else if (isCriticalFailure) {
          resultText = `大失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`💥 ${resultText} - ${judgment.description}`);
          this.logOperation(actor, 'judgment', '大失败', judgment.description);
        } else if (success) {
          resultText = `成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`✅ ${resultText} - ${judgment.description}`);
          this.logOperation(actor, 'judgment', '判定成功', judgment.description);
        } else {
          resultText = `失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`❌ ${resultText} - ${judgment.description}`);
          this.logOperation(actor, 'judgment', '判定失败', judgment.description);
        }
        
        // 构建判定信息并发送
        const judgmentInfo: JudgmentInfo = {
          success: success || isCriticalSuccess,
          result: resultText,
          details: judgment.description
        };
        
        // 构建敌人判定阶段详细信息
        const enemyJudgmentPhaseInfo: EnemyJudgmentPhaseInfo = {
          judgmentCard: {
            name: judgment.cardName || '判定',
            type: '骰子判定',
            difficulty: difficulty
          },
          rollResult: roll,
          isSuccess: success || isCriticalSuccess,
          isCritical: isCriticalSuccess || isCriticalFailure,
          effectDescription: judgment.description || (success || isCriticalSuccess ? '判定成功效果' : '判定失败效果')
        };
        
        this.sendVisualizationUpdate(
          actor,
          'judgment',
          'judge',
          resultText,
          undefined,
          undefined,
          judgmentInfo,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          enemyJudgmentPhaseInfo
        );
        
        // 停留2秒让玩家看到判定结果
        await this.delay(2000);
        
        // 标记判定已处理
        judgment.resolved = true;
        
        // 应用判定效果（敌方视角）
        if (judgment.effects) {
          const effect = success || isCriticalSuccess ? judgment.effects.success : judgment.effects.failure;
          if (effect) {
            this.applyEnemyJudgmentEffect(effect, isCriticalSuccess);
          }
        }
      }
      
      logs.push(`✅ 所有待处理判定已结算`);
    } else {
      logs.push('✓ 无待处理判定');
    }

    // 2. 减少技能冷却（敌人1和敌人2）
    const enemyStates = [this.state.enemyState, this.state.enemy2State].filter(Boolean);
    enemyStates.forEach((enemyState, index) => {
      if (enemyState && enemyState.skillCooldowns) {
        Object.keys(enemyState.skillCooldowns).forEach(skillId => {
          const cooldown = enemyState.skillCooldowns![skillId];
          if (cooldown > 0 && cooldown !== 999) {
            enemyState.skillCooldowns![skillId] = cooldown - 1;
            console.log(`[冷却递减] 敌人${index + 1} 技能${skillId}: ${cooldown} -> ${cooldown - 1}`);
          }
        });
      }
    });

    logs.push('📋 技能冷却已更新');
    
    // 3. 触发被动技能（每回合开始时）
    for (const enemy of enemies) {
      if (enemy.skills) {
        for (const skill of enemy.skills) {
          if (skill.type === 'passive') {
            logs.push(`🔄 触发被动技能: ${skill.name}`);
            console.log(`[被动技能] ${enemy.name} 触发 ${skill.name}`);
            // 调用 executeEnemyAbility 执行被动技能效果
            this.executeEnemyAbility(skill, enemy.id);
          }
        }
      }
    }
    
    logs.push('✓ 持续效果已结算');

    return { success: true, logs, canProceed: true };
  }
  
  // 应用敌方判定效果
  private applyEnemyJudgmentEffect(effect: any, isCritical: boolean): void {
    if (!this.state) return;
    
    const multiplier = isCritical ? 2 : 1;
    
    // 敌方视角：成功效果对敌方有利，失败效果对敌方不利
    if (effect.securityChange) {
      // 敌方成功：降低玩家安全等级
      this.state.playerState.securityLevel = Math.max(0, Math.min(
        this.state.playerState.maxSecurityLevel,
        this.state.playerState.securityLevel + effect.securityChange * multiplier
      ));
    }
    
    if (effect.infiltrationChange) {
      // 敌方成功：增加渗透等级
      this.state.enemyState.infiltrationLevel = Math.max(0, Math.min(
        100,
        this.state.enemyState.infiltrationLevel + effect.infiltrationChange * multiplier
      ));
    }
  }

  // 敌人AI恢复阶段（完全匹配PvP标准）
  private async executeEnemyRecoveryPhase(enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`💫 ${LEVEL_PHASE_NAMES['recovery']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const enemy = this.getEnemyStateByIndex(enemyIndex);
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    const oldResources = { ...enemy.resources };
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('recovery');
    
    // 1. 基础资源恢复（匹配PvP标准）
    // 根据轮次决定恢复量（简化版：固定恢复）
    const baseRecovery = {
      computing: 2,
      funds: 2,
      information: 1
    };
    
    enemy.resources.computing = Math.min(10, enemy.resources.computing + baseRecovery.computing);
    enemy.resources.funds = Math.min(10, enemy.resources.funds + baseRecovery.funds);
    enemy.resources.information = Math.min(8, enemy.resources.information + baseRecovery.information);

    const restoredResources: string[] = [];
    if (enemy.resources.computing > oldResources.computing) {
      restoredResources.push(`算力+${enemy.resources.computing - oldResources.computing}`);
    }
    if (enemy.resources.funds > oldResources.funds) {
      restoredResources.push(`资金+${enemy.resources.funds - oldResources.funds}`);
    }
    if (enemy.resources.information > oldResources.information) {
      restoredResources.push(`信息+${enemy.resources.information - oldResources.information}`);
    }

    if (restoredResources.length > 0) {
      logs.push(`💫 基础恢复: ${restoredResources.join(', ')}`);
      this.logOperation(actor, 'recovery', '资源恢复', restoredResources.join(', '));
    }

    // 2. 区域控制加成（匹配PvP标准）
    // 统计敌方控制的区域数量
    let controlledAreas = 0;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'enemy') {
        controlledAreas++;
      }
    }
    
    if (controlledAreas > 0) {
      // 每个控制区域额外恢复1点资源
      enemy.resources.computing = Math.min(10, enemy.resources.computing + controlledAreas);
      enemy.resources.funds = Math.min(10, enemy.resources.funds + controlledAreas);
      logs.push(`🏰 区域控制加成: 所有资源+${controlledAreas}（控制${controlledAreas}个区域）`);
      this.logOperation(actor, 'recovery', '区域加成', `控制${controlledAreas}个区域`);
    }

    // 3. 减少攻击冷却
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown--;
      logs.push(`⚡ 攻击冷却: ${enemy.attackCooldown}`);
    }

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI摸牌阶段（完全匹配PvP标准）
  private async executeEnemyDrawPhase(enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`🎴 ${LEVEL_PHASE_NAMES['draw']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('draw');
    
    // 1. 计算抽卡数量（与玩家一致：1-4轮2张，5-8轮3张，9-16轮4张，17-24轮5张）
    const drawCount = getLevelDrawCount(this.state.round);

    this.logOperation(actor, 'draw', '准备行动', `敌人${enemyNumber}准备攻击策略`);

    logs.push(`🎴 基础抽牌: ${drawCount}张（轮次${this.state.round}）`);
    
    // 2. 实际从牌库抽牌（与玩家一致，无手牌上限限制）
    const actualDrawnCards: Card[] = [];
    const drawnCardInfos: CardInfo[] = [];
    
    for (let i = 0; i < drawCount; i++) {
      if (enemyState.deck.length > 0) {
        const card = enemyState.deck.pop()!;
        enemyState.hand.push(card);
        actualDrawnCards.push(card);
        
        // 构建卡牌信息用于可视化
        drawnCardInfos.push({
          name: card.name,
          type: card.type,
          card_code: card.card_code,
          cost: card.cost,
          effect: card.description || card.effect || '',
          rarity: card.rarity,
          techLevel: card.techLevel,
          difficulty: card.difficulty,
          icon: card.icon
        });
      } else {
        logs.push('⚠️ 牌库已空，无法继续抽牌');
        break;
      }
    }
    
    logs.push(`✓ 实际抽取 ${actualDrawnCards.length} 张牌`);
    
    // 5. 计算手牌类型分布
    const typeDistribution: Record<string, number> = {};
    for (const card of enemyState.hand) {
      const type = card.type || '未知';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    }
    
    // 6. 构建实际手牌状态
    const handState: HandState = {
      count: enemyState.hand.length,
      typeDistribution
    };
    
    // 7. 构建抽牌阶段信息
    const drawPhaseInfo: DrawPhaseInfo = {
      drawnCards: drawnCardInfos,
      totalHandCount: enemyState.hand.length
    };
    
    // 8. 构建当前手牌信息（用于显示）
    const currentHandCards: CardInfo[] = enemyState.hand.map(card => ({
      name: card.name,
      type: card.type,
      card_code: card.card_code,
      cost: card.cost,
      effect: card.description || card.effect || '',
      rarity: card.rarity,
      techLevel: card.techLevel,
      difficulty: card.difficulty,
      icon: card.icon
    }));
    
    this.sendVisualizationUpdate(
      actor,
      'draw',
      'draw_card',
      `抽了 ${actualDrawnCards.length} 张牌`,
      undefined,
      handState,
      undefined,
      drawPhaseInfo,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      currentHandCards
    );

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI行动阶段 - 智能决策系统（使用实际手牌）
  private async executeEnemyActionPhase(enemies: any[], enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`⚡ ${LEVEL_PHASE_NAMES['action']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    const enemyConfig = this.state.currentLevel.enemyConfig;

    logs.push(`👾 敌人${enemyNumber} ${enemyConfig.name}开始行动`);
    this.logOperation(actor, 'action', '开始行动', `敌人${enemyNumber} ${enemyConfig.name}分析战场局势`);

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');

    // 智能决策：分析战场并选择最优策略
    const strategy = this.analyzeBattlefieldAndChooseStrategy();
    logs.push(`🎯 敌人${enemyNumber}策略: ${strategy.name} - ${strategy.description}`);
    this.logOperation(actor, 'action', '制定策略', strategy.name);
    
    // 发送策略更新
    this.sendVisualizationUpdate(actor, 'action', 'strategy', `策略: ${strategy.name}`);

    // 根据策略类型执行相应的策略（包含技能使用）
    const levelEnemies = getEnemiesByLevel(parseInt(this.state.currentLevel.id.replace('LV', '')));
    
    if (strategy.type === 'disrupt') {
      // 干扰策略：优先使用技能
      await this.executeDisruptStrategy(logs, levelEnemies);
    } else if (strategy.type === 'aggressive') {
      // 攻击策略：积极放置标记
      await this.executeAggressiveStrategy(logs, levelEnemies);
    } else {
      // 平衡策略：均衡发展
      await this.executeBalancedStrategy(logs, levelEnemies);
    }

    // 敌人使用手牌进行攻击
    let cardsPlayed = 0;
    const maxCardsPerTurn = 2; // 每回合最多使用2张牌
    
    while (cardsPlayed < maxCardsPerTurn && enemyState.hand.length > 0) {
      // 选择最优卡牌（传入敌人索引以使用正确的敌人状态）
      const cardSelection = this.selectEnemyCard(strategy.type, enemyIndex);
      
      if (!cardSelection.card) {
        logs.push(`⏹️ 没有合适的卡牌可用`);
        break;
      }
      
      const { card, targetArea } = cardSelection;
      
      // 检查资源是否足够
      if (!this.canEnemyAffordCard(card, enemyIndex)) {
        logs.push(`💸 资源不足，无法使用 ${card.name}`);
        break;
      }
      
      // 消耗资源
      this.deductEnemyCardCost(card, enemyIndex);
      
      // 从手牌中移除
      const cardIndex = enemyState.hand.findIndex(c => c.card_code === card.card_code);
      if (cardIndex >= 0) {
        enemyState.hand.splice(cardIndex, 1);
      }
      
      // 应用卡牌效果
      const effectLog = this.applyEnemyCardEffect(card, targetArea, enemyIndex);
      logs.push(...effectLog);
      
      // 将使用过的卡牌放入弃牌堆
      enemyState.discardPile.push(card);
      
      cardsPlayed++;
      
      // 发送可视化更新
      const playedCardInfo: CardInfo = {
        name: card.name,
        type: card.type,
        cost: card.cost,
        effect: card.description || '',
        rarity: card.rarity,
        icon: card.icon || '⚔️'
      };
      
      this.sendVisualizationUpdate(
        actor,
        'action',
        'play_card',
        `使用 ${card.name}`,
        playedCardInfo
      );
      
      // 使用标准2秒延迟
      await this.enemyDelayManager.executeStandardDelay('action');
    }
    
    // 如果没有使用任何卡牌且没有使用技能，执行基础攻击
    if (cardsPlayed === 0) {
      const targetArea = this.selectTargetAreaForMarker();
      if (targetArea) {
        this.state.areaControl[targetArea].attackMarkers += 1;
        logs.push(`⚔️ 基础攻击：在 ${AREA_NAMES[targetArea]} 放置1个攻击标记`);
        this.logOperation(actor, 'action', '基础攻击', `在${AREA_NAMES[targetArea]}放置1个标记`);
        
        // 发送可视化更新
        this.sendVisualizationUpdate(actor, 'action', 'placing_marker', `在 ${AREA_NAMES[targetArea]} 放置标记`);
        
        // 使用标准2秒延迟
        await this.enemyDelayManager.executeStandardDelay('action');
      }
    }

    // 更新区域控制状态
    this.updateAreaControl();

    // 增加渗透等级
    enemyState.infiltrationLevel += 1;
    logs.push(`📈 渗透等级提升至 ${enemyState.infiltrationLevel}`);

    return { success: true, logs, canProceed: true };
  }

  // 选择敌人最优卡牌
  private selectEnemyCard(strategyType: string, enemyIndex: number = 0): { card: Card | null; targetArea?: AreaType } {
    if (!this.state) {
      return { card: null };
    }

    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    if (enemyState.hand.length === 0) {
      return { card: null };
    }

    const playableCards: Array<{ card: Card; targetArea?: AreaType; score: number }> = [];

    // 评估每张手牌
    for (const card of enemyState.hand) {
      // 检查资源是否足够
      if (!this.canEnemyAffordCard(card, enemyIndex)) {
        continue;
      }

      // 根据策略和卡牌效果评估价值
      const evaluation = this.evaluateEnemyCard(card, strategyType);
      if (evaluation.score > 0) {
        playableCards.push({
          card,
          targetArea: evaluation.targetArea,
          score: evaluation.score
        });
      }
    }

    // 按分数排序，选择最高分的卡牌
    if (playableCards.length > 0) {
      playableCards.sort((a, b) => b.score - a.score);
      return { 
        card: playableCards[0].card, 
        targetArea: playableCards[0].targetArea 
      };
    }

    return { card: null };
  }

  // 评估敌人卡牌价值
  private evaluateEnemyCard(card: Card, strategyType: string): { score: number; targetArea?: AreaType } {
    if (!this.state) {
      return { score: 0 };
    }

    let score = 5; // 基础分数
    let targetArea: AreaType | undefined;

    // 获取卡牌效果
    const effect = card.effects?.[0];
    if (!effect) {
      return { score: 0 };
    }

    // 根据效果类型评估
    switch (effect.type) {
      case 'security_reduce':
        // 降低玩家安全等级 - 攻击型效果
        score += 10;
        if (strategyType === 'aggressive') {
          score += 5;
        }
        break;

      case 'infiltration_gain':
        // 提升渗透等级 - 攻击型效果
        score += 8;
        if (strategyType === 'aggressive' || strategyType === 'control') {
          score += 3;
        }
        break;

      case 'resource_steal':
        // 窃取资源 - 干扰型效果
        score += 7;
        if (strategyType === 'disrupt') {
          score += 5;
        }
        break;

      case 'resource_gain':
        // 获得资源 - 发展型效果
        score += 4;
        if (strategyType === 'balanced') {
          score += 2;
        }
        break;

      default:
        score += 3;
    }

    // 选择最佳目标区域
    targetArea = this.selectBestTargetAreaForCard(effect.type as string);

    // 根据难度调整
    switch (this.config.enemyDifficulty) {
      case 'easy':
        score *= 0.9;
        break;
      case 'hard':
        score *= 1.1;
        break;
    }

    return { score, targetArea };
  }

  // 为卡牌选择最佳目标区域
  private selectBestTargetAreaForCard(effectType: string): AreaType {
    if (!this.state) return 'external';

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    // 根据效果类型选择目标区域
    switch (effectType) {
      case 'security_reduce':
      case 'infiltration_gain':
        // 攻击效果：优先选择玩家控制或防御标记多的区域
        let bestAttackArea: AreaType = 'external';
        let maxDefenseMarkers = -1;
        
        for (const area of areas) {
          const areaState = this.state.areaControl[area];
          // 优先攻击玩家控制区域
          if (areaState.controller === 'player') {
            if (areaState.defenseMarkers > maxDefenseMarkers) {
              maxDefenseMarkers = areaState.defenseMarkers;
              bestAttackArea = area;
            }
          }
        }
        
        // 如果没有玩家控制区域，选择防御标记最多的区域
        if (maxDefenseMarkers < 0) {
          for (const area of areas) {
            const areaState = this.state.areaControl[area];
            if (areaState.defenseMarkers > maxDefenseMarkers) {
              maxDefenseMarkers = areaState.defenseMarkers;
              bestAttackArea = area;
            }
          }
        }
        
        return bestAttackArea;

      case 'resource_steal':
      case 'disrupt':
        // 干扰效果：优先选择内网
        return 'internal';

      default:
        // 默认选择防御标记最少的区域
        let bestArea: AreaType = 'external';
        let minDefenseMarkers = Infinity;
        
        for (const area of areas) {
          const areaState = this.state.areaControl[area];
          if (areaState.defenseMarkers < minDefenseMarkers) {
            minDefenseMarkers = areaState.defenseMarkers;
            bestArea = area;
          }
        }
        
        return bestArea;
    }
  }

  // 检查敌人是否能负担卡牌消耗
  private canEnemyAffordCard(card: Card, enemyIndex: number = 0): boolean {
    if (!this.state) return false;

    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    const cost = card.cost || {};

    // 检查算力
    if (cost.compute && enemyState.resources.computing < cost.compute) {
      return false;
    }
    
    // 检查资金
    if (cost.funds && enemyState.resources.funds < cost.funds) {
      return false;
    }
    
    // 检查信息
    if (cost.information && enemyState.resources.information < cost.information) {
      return false;
    }

    return true;
  }

  // 扣除敌人卡牌消耗
  private deductEnemyCardCost(card: Card, enemyIndex: number = 0): void {
    if (!this.state) return;

    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    const cost = card.cost || {};

    if (cost.compute) {
      enemyState.resources.computing = Math.max(0, enemyState.resources.computing - cost.compute);
    }
    if (cost.funds) {
      enemyState.resources.funds = Math.max(0, enemyState.resources.funds - cost.funds);
    }
    if (cost.information) {
      enemyState.resources.information = Math.max(0, enemyState.resources.information - cost.information);
    }
  }

  // 应用敌人卡牌效果
  private applyEnemyCardEffect(card: Card, targetArea?: AreaType, enemyIndex: number = 0): string[] {
    const logs: string[] = [];
    
    if (!this.state) return logs;

    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    
    const effect = card.effects?.[0];
    if (!effect) {
      logs.push(`⚠️ ${card.name} 没有效果`);
      return logs;
    }

    // 确保有目标区域
    const area = targetArea || this.selectTargetAreaForMarker() || 'external';

    // 根据卡牌ID应用特殊联动效果
    switch (card.id) {
      case 'LV1-ATK-001': // 软盘复制 - 与软盘感染技能联动
        {
          // 基础效果：在目标区域放置1个攻击标记
          this.state.areaControl[area].attackMarkers += 1;
          logs.push(`⚔️ 软盘复制：在 ${AREA_NAMES[area]} 放置1个攻击标记`);
          
          // 联动效果：检查该区域是否已有埃尔克克隆者的标记（软盘感染技能产生的标记）
          // 埃尔克克隆者的标记通过特定的标记标识来识别，这里简化为检查攻击标记数量
          const currentMarkers = this.state.areaControl[area].attackMarkers;
          if (currentMarkers > 1) {
            // 如果该区域已有攻击标记（可能是之前软盘感染技能放置的），额外放置1个
            this.state.areaControl[area].attackMarkers += 1;
            logs.push(`🦠 软盘感染联动：该区域已有感染标记，额外放置1个攻击标记`);
            this.logOperation(actor, 'action', '软盘感染联动', `在${AREA_NAMES[area]}额外放置1标记`);
          }
        }
        break;

      case 'LV1-ATK-003': // 第50次启动 - 触发技能效果
        {
          logs.push(`🔄 第50次启动卡牌触发！`);
          
          // 触发"第50次启动"技能效果
          // 技能效果：额外放置1个攻击标记，玩家下回合行动点-1
          const bootAreas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
          const skillTargetArea = bootAreas[Math.floor(Math.random() * bootAreas.length)];
          
          this.state.areaControl[skillTargetArea].attackMarkers += 1;
          this.state.playerState.maxActionPoints = Math.max(
            1,
            this.state.playerState.maxActionPoints - 1
          );
          
          logs.push(`⚔️ 第50次启动技能：在 ${AREA_NAMES[skillTargetArea]} 额外放置1个攻击标记`);
          logs.push(`⏬ 玩家下回合行动点-1`);
          this.logOperation(actor, 'action', '第50次启动', `在${AREA_NAMES[skillTargetArea]}放置标记，玩家行动点-1`);
          
          // 发送技能可视化更新
          this.sendSkillVisualization('第50次启动', skillTargetArea, [
            { id: `effect_${Date.now()}`, type: 'area', target: 'enemy', value: 1, description: `${AREA_NAMES[skillTargetArea]}攻击标记+1` },
            { id: `effect_${Date.now()}_ap`, type: 'resource', target: 'enemy', value: -1, description: '下回合行动点-1' }
          ]);
        }
        break;

      case 'LV1-ATK-004': // 潜伏感染 - 放置潜伏标记
        {
          // 在目标区域放置1个潜伏标记（2回合后转为攻击标记）
          if (!this.state.areaControl[area].latentMarkers) {
            this.state.areaControl[area].latentMarkers = [];
          }
          
          this.state.areaControl[area].latentMarkers.push({
            remainingTurns: 2
          });
          
          logs.push(`🕐 潜伏感染：在 ${AREA_NAMES[area]} 放置1个潜伏标记（2回合后转为攻击标记）`);
          this.logOperation(actor, 'action', '潜伏感染', `在${AREA_NAMES[area]}放置潜伏标记`);
          
          // 发送可视化更新
          this.sendSkillVisualization('潜伏感染', area, [
            { id: `effect_${Date.now()}`, type: 'latent', target: 'enemy', value: 1, description: `${AREA_NAMES[area]}潜伏标记+1（2回合后转化）` }
          ]);
        }
        break;

      case 'LV1-ATK-005': // 社交工程 - 与斯克伦塔技能联动
        {
          // 基础效果：随机降低玩家1种资源2点
          const resourceTypes: ('computing' | 'funds' | 'information')[] = ['computing', 'funds', 'information'];
          const resourceNames = { computing: '算力', funds: '资金', information: '信息' };
          const targetResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
          
          let reduceAmount = 2; // 基础降低量
          
          // 联动效果：检查斯克伦塔是否在场（通过检查当前关卡敌人配置）
          const currentLevelId = this.state.currentLevel.id;
          const levelNumber = parseInt(currentLevelId.replace('LV', ''));
          const enemies = getEnemiesByLevel(levelNumber);
          const skrentaPresent = enemies.some(e => e.name?.includes('斯克伦塔') || e.id?.includes('skrenta'));
          
          if (skrentaPresent) {
            // 斯克伦塔在场，额外降低1点
            reduceAmount += 1;
            logs.push(`🎭 社交工程传播联动：斯克伦塔在场，资源降低效果增强！`);
          }
          
          // 应用资源降低效果
          if (targetResource === 'computing') {
            // 这里简化处理，实际应该减少玩家资源
            logs.push(`💻 社交工程：玩家算力-${reduceAmount}`);
          } else if (targetResource === 'funds') {
            logs.push(`💰 社交工程：玩家资金-${reduceAmount}`);
          } else if (targetResource === 'information') {
            logs.push(`📊 社交工程：玩家信息-${reduceAmount}`);
          }
          
          this.logOperation(actor, 'action', '社交工程', `降低玩家${resourceNames[targetResource]}${reduceAmount}点`);
          
          // 发送技能可视化更新
          this.sendSkillVisualization('社交工程传播', undefined, [
            { id: `effect_${Date.now()}`, type: 'resource', target: 'enemy', value: -reduceAmount, description: `${resourceNames[targetResource]}-${reduceAmount}` }
          ]);
        }
        break;

      default:
        // 标准效果处理
        switch (effect.type) {
          case 'security_reduce':
            // 降低玩家安全等级
            const securityDamage = (effect as any).baseValue || 2;
            this.state.playerState.securityLevel = Math.max(
              0,
              this.state.playerState.securityLevel - securityDamage
            );
            logs.push(`💥 ${card.name} 造成 ${securityDamage} 点安全等级伤害`);
            this.logOperation(actor, 'action', '安全攻击', `降低玩家安全等级${securityDamage}点`);
            break;

          case 'infiltration_gain':
            // 提升渗透等级并放置攻击标记
            const infiltrationGain = (effect as any).baseValue || 1;
            const markerGain = Math.max(1, Math.floor(infiltrationGain / 2));
            
            enemyState.infiltrationLevel += infiltrationGain;
            this.state.areaControl[area].attackMarkers += markerGain;
            
            logs.push(`📈 渗透等级 +${infiltrationGain}`);
            logs.push(`⚔️ 在 ${AREA_NAMES[area]} 放置 ${markerGain} 个攻击标记`);
            this.logOperation(actor, 'action', '渗透攻击', `渗透+${infiltrationGain}，在${AREA_NAMES[area]}放置${markerGain}标记`);
            break;

          case 'resource_steal':
            // 窃取玩家资源
            const resourceEffect = effect as any;
            const stealAmount = resourceEffect.value || 1;
            const resourceType = resourceEffect.resourceType || 'funds';
            
            // 减少玩家资源
            if (resourceType === 'funds') {
              // 这里简化处理，实际应该减少玩家资源
              logs.push(`💰 窃取 ${stealAmount} 资金`);
            } else if (resourceType === 'compute') {
              logs.push(`⚡ 窃取 ${stealAmount} 算力`);
            } else if (resourceType === 'information') {
              logs.push(`👁️ 窃取 ${stealAmount} 信息`);
            }
            this.logOperation(actor, 'action', '资源窃取', `窃取${resourceType}`);
            break;

          case 'resource_gain':
            // 获得资源
            const gainEffect = effect as any;
            const gainAmount = gainEffect.value || 1;
            const gainResourceType = gainEffect.resourceType || 'funds';
            
            if (gainResourceType === 'funds') {
              enemyState.resources.funds = Math.min(15, enemyState.resources.funds + gainAmount);
              logs.push(`💰 获得 ${gainAmount} 资金`);
            } else if (gainResourceType === 'compute') {
              enemyState.resources.computing = Math.min(15, enemyState.resources.computing + gainAmount);
              logs.push(`⚡ 获得 ${gainAmount} 算力`);
            } else if (gainResourceType === 'information') {
              enemyState.resources.information = Math.min(12, enemyState.resources.information + gainAmount);
              logs.push(`👁️ 获得 ${gainAmount} 信息`);
            }
            this.logOperation(actor, 'action', '资源获取', `获得${gainResourceType}`);
            break;

          default:
            // 默认效果：放置攻击标记
            this.state.areaControl[area].attackMarkers += 1;
            logs.push(`⚔️ 在 ${AREA_NAMES[area]} 放置1个攻击标记`);
            this.logOperation(actor, 'action', '放置标记', `在${AREA_NAMES[area]}放置1标记`);
        }
    }

    return logs;
  }

  /**
   * 发送技能可视化更新（辅助方法）
   */
  private sendSkillVisualization(skillName: string, targetArea?: AreaType, effects?: Array<{id: string; type: string; target: string; value: number; description: string}>): void {
    if (!this.onVisualizationUpdate) return;

    const skillVisualizationName = ENEMY_SKILL_NAME_MAP[skillName] || skillName;
    
    // 确定威胁等级
    let intensity: 'low' | 'medium' | 'high' = 'medium';
    if (skillName.includes('启动') || skillName.includes('传播')) {
      intensity = 'medium';
    }

    const skillPhaseInfo: EnemySkillPhaseInfo = {
      skillName: skillName,
      skillDescription: `${skillName}效果触发`,
      targetArea: targetArea,
      effectType: 'special',
      cooldown: 0
    };
    
    const skillVisualization = {
      skillName: skillVisualizationName,
      skillDescription: `${skillName}效果触发`,
      targetArea: targetArea ? AREA_NAMES[targetArea] : undefined,
      intensity,
      effects: effects || []
    };
    
    this.sendVisualizationUpdate(
      'enemy',
      'action',
      'card_skill_trigger',
      `卡牌触发技能: ${skillName}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      skillPhaseInfo,
      skillVisualization
    );
  }

  // 分析战场并选择策略 - 增强版威胁评估
  private analyzeBattlefieldAndChooseStrategy(): { type: string; name: string; description: string } {
    if (!this.state) {
      return { type: 'balanced', name: '平衡策略', description: '均衡发展与攻击' };
    }

    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;

    // 统计区域控制情况
    let playerControlledAreas = 0;
    let enemyControlledAreas = 0;
    let neutralAreas = 0;

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const controller = this.state.areaControl[area].controller;
      if (controller === 'player') playerControlledAreas++;
      else if (controller === 'enemy') enemyControlledAreas++;
      else neutralAreas++;
    }

    // 根据难度和战场情况选择策略
    let strategyType: string;
    let strategyName: string;
    let strategyDescription: string;

    switch (this.config.enemyDifficulty) {
      case 'easy':
        strategyType = 'balanced';
        strategyName = '平衡策略';
        strategyDescription = '基础均衡攻击';
        break;
        
      case 'medium':
        if (securityRatio < 0.5) {
          strategyType = 'aggressive';
          strategyName = '乘胜追击';
          strategyDescription = '玩家防御弱，加强攻击';
        } else if (neutralAreas > 1) {
          strategyType = 'control';
          strategyName = '区域扩张';
          strategyDescription = '优先占领中立区域';
        } else {
          strategyType = 'balanced';
          strategyName = '平衡策略';
          strategyDescription = '均衡发展攻击与控制';
        }
        break;
        
      case 'hard':
        if (securityRatio > 0.7 && playerControlledAreas > 2) {
          strategyType = 'aggressive';
          strategyName = '激进打击';
          strategyDescription = '集中火力攻击玩家弱点';
        } else if (enemyControlledAreas < 2 && neutralAreas > 1) {
          strategyType = 'control';
          strategyName = '区域控制';
          strategyDescription = '优先占领中立和弱势区域';
        } else if (this.state.enemyState.infiltrationLevel > 5 && securityRatio < 0.6) {
          strategyType = 'disrupt';
          strategyName = '深度干扰';
          strategyDescription = '使用技能干扰玩家关键行动';
        } else {
          strategyType = 'balanced';
          strategyName = '平衡策略';
          strategyDescription = '均衡发展攻击与控制';
        }
        break;
        
      default:
        strategyType = 'balanced';
        strategyName = '平衡策略';
        strategyDescription = '均衡发展与攻击';
    }

    return { type: strategyType, name: strategyName, description: strategyDescription };
  }

  // 执行激进策略
  private async executeAggressiveStrategy(logs: string[], enemies: any[]): Promise<void> {
    if (!this.state) return;

    logs.push('🔥 执行激进打击策略');
    this.logOperation('enemy', 'action', '激进策略', '集中攻击玩家安全等级');

    // 使用可用的主动技能（50%概率，激进策略更倾向使用技能）
    if (Math.random() < 0.5) {
      await this.useAvailableSkills(logs, enemies);
    }

    // 优先攻击玩家安全等级
    const damage = 5 + Math.floor(Math.random() * 3);
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - damage);
    logs.push(`💥 对玩家造成 ${damage} 点安全等级伤害`);

    // 在玩家控制区域放置标记
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'player') {
        this.state.areaControl[area].attackMarkers += 2;
        logs.push(`⚔️ 在 ${AREA_NAMES[area]} 放置2个攻击标记`);
        break; // 只攻击一个区域
      }
    }

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');
  }

  // 通用方法：使用所有可用的主动技能
  private async useAvailableSkills(logs: string[], enemies: any[]): Promise<void> {
    if (!this.state) return;

    // 获取敌人状态（用于读取和设置技能冷却）
    const enemyState = this.getEnemyStateByIndex(0);
    if (!enemyState) {
      return;
    }

    // 初始化技能冷却状态
    if (!enemyState.skillCooldowns) {
      enemyState.skillCooldowns = {};
    }

    // 遍历所有敌人，使用可用的主动技能
    for (const enemy of enemies) {
      if (enemy.skills) {
        for (const skill of enemy.skills) {
          // 从状态中获取技能冷却
          const currentCooldown = enemyState.skillCooldowns[skill.id] || 0;

          console.log(`[技能检查] ${enemy.name} - ${skill.name}: 冷却=${currentCooldown}, 类型=${skill.type}`);

          if (skill.type === 'active' && currentCooldown <= 0) {
            logs.push(`✨ ${enemy.name} 使用 ${skill.name}`);
            this.logOperation('enemy', 'action', '技能干扰', skill.name);

            // 调用 executeEnemyAbility 执行实际技能效果
            this.executeEnemyAbility(skill, enemy.id);
            logs.push(`✅ ${skill.name} 效果已执行`);

            // 设置冷却到状态
            const cooldownTurns = skill.cooldown || 2;
            enemyState.skillCooldowns[skill.id] = cooldownTurns;

            console.log(`[技能冷却] ${skill.name} 设置冷却为 ${cooldownTurns} 回合`);

            // 使用标准2秒延迟
            await this.enemyDelayManager.executeStandardDelay('action');
          } else if (skill.type === 'active' && currentCooldown > 0) {
            logs.push(`⏳ ${skill.name} 冷却中（${currentCooldown}回合）`);
            console.log(`[技能跳过] ${skill.name} 冷却中: ${currentCooldown}回合`);
          }
        }
      }
    }
  }

  // 执行控制策略
  private async executeControlStrategy(logs: string[], _enemies: any[]): Promise<void> {
    if (!this.state) return;

    logs.push('🎯 执行区域控制策略');
    this.logOperation('enemy', 'action', '控制策略', '优先占领中立和弱势区域');

    // 找到中立或玩家控制但标记少的区域
    let targetArea: AreaType | null = null;
    let minMarkers = Infinity;

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      if (areaState.controller !== 'enemy' && areaState.defenseMarkers < minMarkers) {
        minMarkers = areaState.defenseMarkers;
        targetArea = area;
      }
    }

    if (targetArea) {
      this.state.areaControl[targetArea].attackMarkers += 3;
      logs.push(`🏁 重点进攻 ${AREA_NAMES[targetArea]}，放置3个标记`);
      this.logOperation('enemy', 'action', '区域占领', `占领${AREA_NAMES[targetArea]}`);
    }

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');
  }

  // 执行干扰策略
  private async executeDisruptStrategy(logs: string[], enemies: any[], enemyIndex: number = 0): Promise<void> {
    logs.push('⚡ 执行深度干扰策略');
    this.logOperation('enemy', 'action', '干扰策略', '使用技能干扰玩家');

    // 获取敌人状态（用于读取和设置技能冷却）
    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    if (!enemyState) {
      logs.push('❌ 无法获取敌人状态');
      return;
    }

    // 初始化技能冷却状态
    if (!enemyState.skillCooldowns) {
      enemyState.skillCooldowns = {};
    }

    // 使用所有可用的技能
    for (const enemy of enemies) {
      if (enemy.skills) {
        for (const skill of enemy.skills) {
          // 从状态中获取技能冷却（而不是配置数据）
          const currentCooldown = enemyState.skillCooldowns[skill.id] || 0;
          
          console.log(`[技能检查] ${enemy.name} - ${skill.name}: 冷却=${currentCooldown}, 类型=${skill.type}`);
          
          if (skill.type === 'active' && currentCooldown <= 0) {
            logs.push(`✨ ${enemy.name} 使用 ${skill.name}`);
            this.logOperation('enemy', 'action', '技能干扰', skill.name);
            
            // 调用 executeEnemyAbility 执行实际技能效果
            this.executeEnemyAbility(skill, enemy.id);
            logs.push(`✅ ${skill.name} 效果已执行`);
            
            // 设置冷却到状态（从技能配置中获取）
            const { getEnemyById } = await import('@/data/levelEnemies');
            const enemyConfig = getEnemyById(enemy.id);
            const skillConfig = enemyConfig?.skills.find(s => s.id === skill.id);
            const cooldownTurns = skillConfig?.cooldown || 2;
            enemyState.skillCooldowns[skill.id] = cooldownTurns;
            
            console.log(`[技能冷却] ${skill.name} 设置冷却为 ${cooldownTurns} 回合`);
            
            // 使用标准2秒延迟
            await this.enemyDelayManager.executeStandardDelay('action');
          } else if (skill.type === 'active' && currentCooldown > 0) {
            logs.push(`⏳ ${skill.name} 冷却中（${currentCooldown}回合）`);
            console.log(`[技能跳过] ${skill.name} 冷却中: ${currentCooldown}回合`);
          }
        }
      }
    }
  }

  // 执行平衡策略
  private async executeBalancedStrategy(logs: string[], enemies: any[]): Promise<void> {
    logs.push('⚖️ 执行平衡发展策略');
    this.logOperation('enemy', 'action', '平衡策略', '均衡攻击与发展');

    // 使用可用的主动技能（30%概率）
    if (Math.random() < 0.3) {
      await this.useAvailableSkills(logs, enemies);
    }

    // 随机攻击一个区域
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    
    this.state!.areaControl[targetArea].attackMarkers += 1;
    logs.push(`⚔️ 在 ${AREA_NAMES[targetArea]} 放置1个标记`);

    // 轻微降低玩家安全等级（添加下限保护）
    const oldSecurityLevel = this.state!.playerState.securityLevel;
    this.state!.playerState.securityLevel = Math.max(0, oldSecurityLevel - 2);
    logs.push(`💥 玩家安全等级 ${oldSecurityLevel} -> ${this.state!.playerState.securityLevel}`);
    console.log(`[安全等级] 平衡策略: ${oldSecurityLevel} -> ${this.state!.playerState.securityLevel}`);

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');
  }

  // 智能放置标记
  private async executeSmartMarkerPlacement(logs: string[]): Promise<void> {
    if (!this.state) return;

    // 分析哪个区域最值得放置标记
    const areaScores: { area: AreaType; score: number }[] = [];

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      let score = 0;

      // 玩家控制区域优先级高
      if (areaState.controller === 'player') score += 3;
      // 中立区域次之
      else if (areaState.controller === 'neutral') score += 2;
      // 友方标记少的区域
      if (areaState.defenseMarkers < 2) score += 2;
      // 已有敌方标记的区域（集中攻击）
      if (areaState.attackMarkers > 0) score += 1;

      areaScores.push({ area, score });
    }

    // 按分数排序
    areaScores.sort((a, b) => b.score - a.score);

    // 在最高分的区域放置标记
    if (areaScores.length > 0 && areaScores[0].score > 0) {
      const bestArea = areaScores[0].area;
      this.state.areaControl[bestArea].attackMarkers += 1;
      logs.push(`🎯 智能放置：在 ${AREA_NAMES[bestArea]} 放置1个标记`);
      this.logOperation('enemy', 'action', '智能放置', `在${AREA_NAMES[bestArea]}放置标记`);
    }

    this.updateAreaControl();
  }

  // 判断是否使用技能
  private shouldUseAbility(ability: any, enemies: any[]): boolean {
    if (!this.state) return false;

    // 检查冷却
    const enemy = enemies.find(e => 
      e.skills?.some((s: any) => s.name === ability.name)
    );
    if (enemy) {
      const skill = enemy.skills.find((s: any) => s.name === ability.name);
      if (skill && skill.cooldown > 0) {
        return false;
      }
    }

    // 根据触发条件判断
    switch (ability.trigger) {
      case '每回合':
        return true;
      case '放置标记':
        return Math.random() > 0.5;
      case '累计5标记':
        return this.state.enemyState.infiltrationLevel >= 5;
      case '受攻击':
        return false; // 被动技能
      default:
        return Math.random() > 0.7;
    }
  }

  // 执行敌人攻击
  private executeEnemyAttack(intensity: 'low' | 'medium' | 'high', actionType: string): void {
    if (!this.state) return;

    const damageMap = { low: 2, medium: 4, high: 6 };
    const damage = damageMap[intensity];

    // 在随机区域放置敌方标记
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    // 根据行动类型选择目标区域
    let targetArea: AreaType;
    let attackAnimation: 'slash' | 'blast' | 'infiltrate' = 'slash';
    let attackDescription = '';
    
    switch (actionType) {
      case 'floppy_infection':
        targetArea = 'internal'; // 软盘感染优先攻击内网
        attackAnimation = 'infiltrate';
        attackDescription = '通过受感染的软盘渗透内网系统';
        break;
      case 'social_engineering':
        targetArea = 'external'; // 社交工程优先攻击外网
        attackAnimation = 'blast';
        attackDescription = '利用社交工程手段获取访问权限';
        break;
      default:
        targetArea = areas[Math.floor(Math.random() * areas.length)];
        attackAnimation = intensity === 'high' ? 'blast' : 'slash';
        attackDescription = `发动${intensity === 'high' ? '强力' : intensity === 'medium' ? '中等' : '普通'}攻击`;
    }

    const markerCount = intensity === 'high' ? 2 : 1;
    
    // 构建攻击阶段信息
    const attackPhaseInfo: EnemyAttackPhaseInfo = {
      attackType: intensity === 'high' ? 'heavy' : intensity === 'medium' ? 'normal' : 'normal',
      damage: damage,
      targetArea: targetArea,
      attackAnimation: attackAnimation,
      description: attackDescription
    };
    
    // 发送攻击可视化更新
    this.sendVisualizationUpdate(
      'enemy',
      'action',
      'attacking',
      `发动攻击: ${attackDescription}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      attackPhaseInfo
    );

    // 降低玩家安全等级
    this.state.playerState.securityLevel = Math.max(
      0,
      this.state.playerState.securityLevel - damage
    );
    
    this.state.areaControl[targetArea].attackMarkers += markerCount;
    
    this.updateAreaControl();
  }

  // 执行敌人技能
  private executeEnemyAbility(ability: any, enemyInstanceId?: string): void {
    if (!this.state) return;

    // 触发技能特效
    if (typeof window !== 'undefined' && enemyInstanceId) {
      (window as unknown as { onSkillTrigger?: (skillId: string, skillName: string, actor: string, instanceId?: string) => void }).onSkillTrigger?.(ability.id, ability.name, 'enemy', enemyInstanceId);
    }

    // 确定技能效果类型
    let effectType: 'damage' | 'debuff' | 'control' | 'special' = 'special';
    let skillDescription = ability.description || ability.effect;
    let targetArea: AreaType | undefined;
    const effects: SkillEffect[] = [];
    
    // 获取敌人状态（用于需要累计计数的技能）
    const enemyState = this.state.enemyState;
    
    // 根据技能效果确定类型和描述
    if (ability.effect.includes('标记') || ability.effect.includes('防御')) {
      effectType = 'control';
    } else if (ability.effect.includes('行动点') || ability.effect.includes('资源')) {
      effectType = 'debuff';
    } else if (ability.effect.includes('伤害') || ability.effect.includes('攻击')) {
      effectType = 'damage';
    }

    // 根据技能名称执行相应操作（关卡一敌人技能）
    switch (ability.name) {
      // ========== LV001: 埃尔克克隆者 ==========
      case '软盘感染':
        // 对玩家区域放置1个攻击标记，降低玩家安全等级2点
        const floppyAreas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        targetArea = floppyAreas[Math.floor(Math.random() * floppyAreas.length)];
        this.state.areaControl[targetArea].attackMarkers += 1;
        this.state.playerState.securityLevel = Math.max(
          0,
          this.state.playerState.securityLevel - 2
        );
        skillDescription = `软盘感染：在${AREA_NAMES[targetArea]}放置攻击标记，玩家安全等级-2`;
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'area',
          target: 'enemy',
          value: 1,
          description: `${AREA_NAMES[targetArea]}攻击标记+1`
        });
        effects.push({
          id: `effect_${Date.now()}_security`,
          type: 'status',
          target: 'enemy',
          value: -2,
          description: '玩家安全等级-2'
        });
        this.logOperation('enemy', 'skill', '软盘感染', `在${AREA_NAMES[targetArea]}放置攻击标记，玩家安全等级-2`);
        break;
        
      case '第50次启动':
        // 被动技能：当敌人累计放置5个标记后，触发特殊效果
        // 初始化累计计数器
        if (enemyState.totalMarkersPlaced === undefined) {
          enemyState.totalMarkersPlaced = 0;
        }
        
        // 增加累计计数（本次放置1个标记）
        enemyState.totalMarkersPlaced += 1;
        
        // 检查是否达到5个标记的阈值
        if (enemyState.totalMarkersPlaced >= 5) {
          // 触发特殊效果：额外放置1个标记，玩家下回合行动点-1
          const bootAreas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
          targetArea = bootAreas[Math.floor(Math.random() * bootAreas.length)];
          this.state.areaControl[targetArea].attackMarkers += 1;
          this.state.playerState.maxActionPoints = Math.max(
            1,
            this.state.playerState.maxActionPoints - 1
          );
          skillDescription = `第50次启动：累计放置${enemyState.totalMarkersPlaced}个标记，触发特殊效果！额外放置攻击标记，玩家下回合行动点-1`;
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'area',
            target: 'enemy',
            value: 1,
            description: `${AREA_NAMES[targetArea]}攻击标记+1（第50次启动触发）`
          });
          effects.push({
            id: `effect_${Date.now()}_ap`,
            type: 'resource',
            target: 'enemy',
            value: -1,
            description: '下回合行动点-1'
          });
          this.logOperation('enemy', 'skill', '第50次启动', `累计${enemyState.totalMarkersPlaced}个标记，触发特殊效果！`);
          
          // 重置计数器（每5个标记触发一次）
          enemyState.totalMarkersPlaced = 0;
        } else {
          // 未达到阈值，只记录日志
          skillDescription = `第50次启动：累计放置${enemyState.totalMarkersPlaced}/5个标记`;
          this.logOperation('enemy', 'skill', '第50次启动', `累计${enemyState.totalMarkersPlaced}/5个标记`);
        }
        break;
        
      // ========== LV001: 传播者斯克伦塔 ==========
      case '社交工程传播':
        // 随机降低玩家1种资源2点
        const resourceTypes: ('computing' | 'funds' | 'information')[] = ['computing', 'funds', 'information'];
        const resourceNames = { computing: '算力', funds: '资金', information: '信息' };
        const targetResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        this.state.playerState.resources[targetResource] = Math.max(
          0,
          this.state.playerState.resources[targetResource] - 2
        );
        skillDescription = `社交工程传播：玩家${resourceNames[targetResource]}-2`;
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'resource',
          target: 'enemy',
          value: -2,
          description: `${resourceNames[targetResource]}-2`
        });
        this.logOperation('enemy', 'skill', '社交工程传播', `玩家${resourceNames[targetResource]}-2`);
        break;
        
      case '潜伏复制':
        // 被动技能：每回合开始时，有40%概率在随机区域额外放置1个攻击标记
        // 如果该区域已有斯克伦塔的标记，则改为放置2个
        if (Math.random() < 0.4) {
          const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
          targetArea = areas[Math.floor(Math.random() * areas.length)];
          
          // 检查该区域是否已有攻击标记
          const existingMarkers = this.state.areaControl[targetArea].attackMarkers;
          const markersToAdd = existingMarkers > 0 ? 2 : 1;
          
          this.state.areaControl[targetArea].attackMarkers += markersToAdd;
          
          skillDescription = `潜伏复制：在${AREA_NAMES[targetArea]}放置${markersToAdd}个攻击标记`;
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'area',
            target: 'enemy',
            value: markersToAdd,
            description: `${AREA_NAMES[targetArea]}攻击标记+${markersToAdd}`
          });
          this.logOperation('enemy', 'skill', '潜伏复制', `在${AREA_NAMES[targetArea]}放置${markersToAdd}个攻击标记`);
        } else {
          skillDescription = '潜伏复制：未触发';
        }
        break;
        
      // ========== LV002: 叛逆莫斯 ==========
      case '底层命令优先':
        // 主动技能：每回合开始时，根据场上局势自动选择一个"优先目标"
        // 如果友方在该区域的标记数少于敌方，则该区域所有友方标记-1
        const priorityAreas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        let priorityTargetArea: AreaType | undefined;
        let maxDifference = -Infinity;
        
        // 找到敌方标记最多且友方标记最少的区域
        for (const area of priorityAreas) {
          const areaState = this.state.areaControl[area];
          const difference = areaState.attackMarkers - areaState.defenseMarkers;
          if (difference > 0 && difference > maxDifference) {
            maxDifference = difference;
            priorityTargetArea = area;
          }
        }
        
        if (priorityTargetArea && maxDifference > 0) {
          // 友方标记数少于敌方，移除1个友方标记
          const currentDefense = this.state.areaControl[priorityTargetArea].defenseMarkers;
          if (currentDefense > 0) {
            this.state.areaControl[priorityTargetArea].defenseMarkers = currentDefense - 1;
            skillDescription = `底层命令优先：${AREA_NAMES[priorityTargetArea]}友方标记-1（敌方优势）`;
            effects.push({
              id: `effect_${Date.now()}`,
              type: 'area',
              target: 'ally',
              value: -1,
              description: `${AREA_NAMES[priorityTargetArea]}防御标记-1`
            });
            this.logOperation('enemy', 'skill', '底层命令优先', `${AREA_NAMES[priorityTargetArea]}友方标记-1`);
          } else {
            skillDescription = '底层命令优先：无友方标记可移除';
          }
        } else {
          skillDescription = '底层命令优先：无优先目标';
        }
        break;
        
      case '计算否定':
        // 主动技能：当友方角色尝试在叛逆莫斯所在区域放置标记时，莫斯可以进行"计算"
        // 掷骰子，若点数≥4，则阻止该操作，并使该角色下回合行动点-1
        const calculationRoll = Math.floor(Math.random() * 6) + 1;
        
        if (calculationRoll >= 4) {
          // 计算成功，阻止操作并减少行动点
          this.state.playerState.maxActionPoints = Math.max(
            1,
            this.state.playerState.maxActionPoints - 1
          );
          skillDescription = `计算否定：掷出${calculationRoll}≥4，计算成功！玩家下回合行动点-1`;
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'resource',
            target: 'enemy',
            value: -1,
            description: `掷出${calculationRoll}≥4，下回合行动点-1`
          });
          this.logOperation('enemy', 'skill', '计算否定', `掷出${calculationRoll}≥4，计算成功！玩家行动点-1`);
        } else {
          skillDescription = `计算否定：掷出${calculationRoll}<4，计算失败`;
          this.logOperation('enemy', 'skill', '计算否定', `掷出${calculationRoll}<4，计算失败`);
        }
        break;
        
      // ========== LV002: AI攻击者 ==========
      case '自动化扫描':
        // 主动技能：每回合开始时，AI攻击者自动扫描所有区域
        // 每个有友方标记但无敌方标记的区域，AI攻击者在该区域放置1个敌方标记
        const scanAreas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        let scanPlacedCount = 0;
        
        for (const area of scanAreas) {
          const areaState = this.state.areaControl[area];
          // 有友方标记但无敌方标记的区域
          if (areaState.defenseMarkers > 0 && areaState.attackMarkers === 0) {
            this.state.areaControl[area].attackMarkers += 1;
            scanPlacedCount++;
          }
        }
        
        if (scanPlacedCount > 0) {
          skillDescription = `自动化扫描：在${scanPlacedCount}个区域放置攻击标记`;
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'area',
            target: 'enemy',
            value: scanPlacedCount,
            description: `扫描发现${scanPlacedCount}个薄弱区域，放置攻击标记`
          });
          this.logOperation('enemy', 'skill', '自动化扫描', `在${scanPlacedCount}个区域放置攻击标记`);
        } else {
          skillDescription = '自动化扫描：未发现薄弱区域';
          this.logOperation('enemy', 'skill', '自动化扫描', '未发现薄弱区域');
        }
        break;
        
      case '鱼叉式钓鱼':
        // 主动技能：选择一名友方角色，该角色必须弃置一张手牌，否则下回合行动点-2
        // 简化实现：直接减少玩家下回合行动点
        this.state.playerState.maxActionPoints = Math.max(
          1,
          this.state.playerState.maxActionPoints - 2
        );
        skillDescription = '鱼叉式钓鱼：玩家必须弃置手牌，否则下回合行动点-2';
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'resource',
          target: 'enemy',
          value: -2,
          description: '鱼叉式钓鱼：下回合行动点-2'
        });
        this.logOperation('enemy', 'skill', '鱼叉式钓鱼', '玩家下回合行动点-2');
        break;
        
      // ========== 默认处理 ==========
      case '友方标记-1':
        // 减少友方标记
        const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        targetArea = areas[Math.floor(Math.random() * areas.length)];
        this.state.areaControl[targetArea].defenseMarkers = Math.max(
          0,
          this.state.areaControl[targetArea].defenseMarkers - 1
        );
        skillDescription = `减少${AREA_NAMES[targetArea]}的防御标记`;
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'area',
          target: 'ally',
          value: -1,
          description: `${AREA_NAMES[targetArea]}防御标记-1`
        });
        break;
      case '友方标记-2':
        // 减少2个友方标记
        const areas2: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        targetArea = areas2[Math.floor(Math.random() * areas2.length)];
        this.state.areaControl[targetArea].defenseMarkers = Math.max(
          0,
          this.state.areaControl[targetArea].defenseMarkers - 2
        );
        skillDescription = `大幅减少${AREA_NAMES[targetArea]}的防御标记`;
        effects.push({
          id: `effect_${Date.now()}_1`,
          type: 'area',
          target: 'ally',
          value: -2,
          description: `${AREA_NAMES[targetArea]}防御标记-2`
        });
        break;
      case '行动点-1':
        // 减少玩家行动点（下一回合）
        this.state.playerState.maxActionPoints = Math.max(
          1,
          this.state.playerState.maxActionPoints - 1
        );
        skillDescription = '干扰玩家行动，下回合行动点-1';
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'resource',
          target: 'enemy',
          value: -1,
          description: '下回合行动点-1'
        });
        break;
      case '行动点-2':
        // 减少2点行动点
        this.state.playerState.maxActionPoints = Math.max(
          1,
          this.state.playerState.maxActionPoints - 2
        );
        skillDescription = '严重干扰玩家行动';
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'resource',
          target: 'enemy',
          value: -2,
          description: '下回合行动点-2'
        });
        break;
      default:
        // 默认效果处理
        if (ability.effect.includes('标记')) {
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'area',
            target: 'ally',
            description: ability.effect
          });
        } else if (ability.effect.includes('行动点')) {
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'resource',
            target: 'enemy',
            description: ability.effect
          });
        } else {
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'status',
            target: 'enemy',
            description: ability.effect
          });
        }
    }

    // 获取技能视觉特效名称
    const skillVisualizationName = ENEMY_SKILL_NAME_MAP[ability.name] || '普通攻击';
    
    // 确定威胁等级
    let intensity: 'low' | 'medium' | 'high' = 'medium';
    if (ability.effect.includes('-2') || ability.effect.includes('瘫痪') || ability.effect.includes('失控')) {
      intensity = 'high';
    } else if (ability.effect.includes('-1') || ability.effect.includes('减少')) {
      intensity = 'medium';
    } else {
      intensity = 'low';
    }

    // 构建技能阶段信息
    const skillPhaseInfo: EnemySkillPhaseInfo = {
      skillName: ability.name,
      skillDescription: skillDescription,
      targetArea: targetArea,
      effectType: effectType,
      cooldown: ability.cooldown || 0
    };
    
    // 构建技能可视化信息
    const skillVisualization = {
      skillName: skillVisualizationName,
      skillDescription: skillDescription,
      targetArea: targetArea ? AREA_NAMES[targetArea] : undefined,
      intensity,
      effects
    };
    
    // 发送技能可视化更新
    this.sendVisualizationUpdate(
      'enemy',
      'action',
      'using_skill',
      `使用技能: ${ability.name}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      skillPhaseInfo,
      skillVisualization
    );

    this.updateAreaControl();
  }

  // 敌人AI响应阶段
  private async executeEnemyResponsePhase(enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`⏱️ ${LEVEL_PHASE_NAMES['response']}`];
    
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    
    this.logOperation(actor, 'response', '检查响应', `敌人${enemyNumber}检查玩家行动`);
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('response');
    
    // 检查响应事件
    const unresolvedEvents = this.state?.responseEvents.filter(e => !e.responded) || [];
    if (unresolvedEvents.length > 0) {
      logs.push(`⏱️ 敌人${enemyNumber}需要响应 ${unresolvedEvents.length} 个事件`);
      // 敌人AI自动响应（简化版）
      unresolvedEvents.forEach(event => {
        event.responded = true;
        logs.push(`👾 敌人${enemyNumber}自动响应：${event.description}`);
        this.logOperation(actor, 'response', '响应事件', event.description);
      });
      
      // 构建响应阶段信息并发送
      const responsePhaseInfo: any = {
        events: unresolvedEvents.map(e => ({
          id: e.id,
          description: e.description,
          responded: true
        })),
        message: `敌人${enemyNumber}已响应 ${unresolvedEvents.length} 个事件`
      };
      
      this.sendVisualizationUpdate(
        actor,
        'response',
        'responding',
        `敌人${enemyNumber}已响应 ${unresolvedEvents.length} 个事件`,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
      
      // 停留2秒让玩家看到响应结果
      await this.delay(2000);
    } else {
      logs.push(`⏱️ 敌人${enemyNumber}观察玩家行动`);
      logs.push('✓ 响应检查完成');
      
      // 即使没有事件也发送响应阶段信息
      const responsePhaseInfo: any = {
        events: [],
        message: '无需要响应的事件'
      };
      
      this.sendVisualizationUpdate(
        actor,
        'response',
        'response_complete',
        '无需要响应的事件',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI弃牌阶段（完全匹配PvP标准）
  private async executeEnemyDiscardPhase(enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`🗑️ ${LEVEL_PHASE_NAMES['discard']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }
    
    const enemyState = this.getEnemyStateByIndex(enemyIndex);
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('discard');
    
    // 1. 计算手牌上限（完全匹配PvP标准）
    // R4.3: 手牌上限基于轮次（round）而非回合（turn）
    // 24轮次制：1-4轮次1张，5-8轮次3张，9-16轮次4张，17-24轮次5张
    const currentRound = this.state.round;
    const handLimit = getHandLimitByRound(currentRound);
    
    let handLimitRange: string;
    if (currentRound <= 4) {
      handLimitRange = '1-4轮次';
    } else if (currentRound <= 8) {
      handLimitRange = '5-8轮次';
    } else if (currentRound <= 16) {
      handLimitRange = '9-16轮次';
    } else {
      handLimitRange = '17-24轮次';
    }
    
    logs.push(`📋 手牌上限: ${handLimit}张 (${handLimitRange})`);
    
    // 2. 获取敌人状态
    const currentHandCount = enemyState.hand.length;
    
    logs.push(`🎴 当前手牌: ${currentHandCount}张`);
    
    // 3. 计算需要弃置的牌数
    const cardsToDiscard = Math.max(0, currentHandCount - handLimit);
    
    if (cardsToDiscard > 0) {
      logs.push(`🗑️ 需要弃置: ${cardsToDiscard}张`);
      
      // 4. 选择价值最低的卡牌弃置
      // 优先弃置：高消耗卡牌 > 高等级卡牌 > 随机选择
      const sortedHand = [...enemyState.hand].sort((a, b) => {
        // 计算卡牌价值分数（越低越优先弃置）
        const getCardValue = (card: Card): number => {
          let value = 0;
          
          // 消耗资源越多，价值越低（优先弃置）
          const totalCost = Object.values(card.cost || {}).reduce((sum, cost) => sum + (cost || 0), 0);
          value -= totalCost * 10;
          
          // 科技等级越高，价值越高（保留）
          value += card.techLevel * 5;
          
          // 判定难度越高，价值越低（优先弃置）
          value -= card.difficulty * 2;
          
          return value;
        };
        
        return getCardValue(a) - getCardValue(b);
      });
      
      // 5. 实际弃牌
      const discardedCards: Card[] = [];
      for (let i = 0; i < cardsToDiscard && i < sortedHand.length; i++) {
        const cardToDiscard = sortedHand[i];
        discardedCards.push(cardToDiscard);
        
        // 从手牌中移除
        enemyState.hand = enemyState.hand.filter(c => c.card_code !== cardToDiscard.card_code);
        
        // 加入弃牌堆
        enemyState.discardPile.push(cardToDiscard);
        
        logs.push(`  - 弃置: ${cardToDiscard.name}`);
      }
      
      logs.push(`✓ 已弃置 ${discardedCards.length} 张卡牌`);
      this.logOperation(actor, 'discard', '整理资源', `敌人${enemyNumber}弃置 ${discardedCards.length} 张卡牌`);
    } else {
      logs.push('✓ 手牌数量符合上限，无需弃牌');
      this.logOperation(actor, 'discard', '整理资源', `敌人${enemyNumber}手牌无需整理`);
    }
    
    // 6. 构建实际的手牌状态用于可视化
    const typeDistribution: Record<string, number> = {};
    enemyState.hand.forEach(card => {
      const typeName = this.getCardTypeDisplayName(card.type);
      typeDistribution[typeName] = (typeDistribution[typeName] || 0) + 1;
    });
    
    const handState: HandState = {
      count: enemyState.hand.length,
      typeDistribution
    };
    
    this.sendVisualizationUpdate(
      actor,
      'discard',
      'discard_complete',
      cardsToDiscard > 0 ? `已弃置 ${cardsToDiscard} 张卡牌` : '手牌无需整理',
      undefined,
      handState
    );

    return { success: true, logs, canProceed: true };
  }
  
  // 辅助方法：获取卡牌类型的显示名称
  private getCardTypeDisplayName(cardType: string): string {
    const typeNameMap: Record<string, string> = {
      'basic_recon': '侦察',
      'vuln_exploit': '漏洞利用',
      'privilege_escalation': '权限提升',
      'advanced_attack': '高级攻击',
      'total_control': '完全控制',
      'basic_defense': '基础防御',
      'intrusion_detection': '入侵检测',
      'active_defense': '主动防御',
      'defense_in_depth': '纵深防御',
      'absolute_security': '绝对安全'
    };
    return typeNameMap[cardType] || '其他';
  }

  // 敌人AI结束阶段
  private async executeEnemyEndPhase(enemyIndex: number = 0): Promise<LevelPhaseResult> {
    const logs: string[] = [`🏁 ${LEVEL_PHASE_NAMES['end']}`];
    
    const enemyNumber = enemyIndex + 1;
    const actor: 'enemy' | 'enemy2' = enemyIndex === 0 ? 'enemy' : 'enemy2';
    
    this.logOperation(actor, 'end', '结束回合', `敌人${enemyNumber}结束回合，准备下一回合`);
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('end');
    
    logs.push(`🏁 清除敌人${enemyNumber}临时效果`);
    logs.push(`✓ 敌人${enemyNumber}回合结束`);

    return { success: true, logs, canProceed: true };
  }

  // ============================================
  // 辅助方法
  // ============================================

  // 选择敌人放置标记的目标区域
  private selectTargetAreaForMarker(): AreaType | null {
    if (!this.state) return null;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    // 优先选择友方标记最少的区域
    let bestArea: AreaType | null = null;
    let minDefenseMarkers = Infinity;
    
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      if (areaState.defenseMarkers < minDefenseMarkers) {
        minDefenseMarkers = areaState.defenseMarkers;
        bestArea = area;
      }
    }
    
    return bestArea;
  }

  // 更新区域控制状态
  private updateAreaControl(): void {
    if (!this.state) return;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      
      if (areaState.attackMarkers > areaState.defenseMarkers) {
        areaState.controller = 'enemy';
      } else if (areaState.defenseMarkers > areaState.attackMarkers) {
        areaState.controller = 'player';
      } else {
        areaState.controller = 'neutral';
      }
    }

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  // 记录操作日志
  private logOperation(actor: 'dadong' | 'enemy', phase: LevelTurnPhase, action: string, description: string): void {
    const log: AIOperationLog = {
      timestamp: Date.now(),
      actor,
      phase,
      action,
      description
    };

    this.operationLogs.push(log);
    
    // 同时记录到游戏状态中，以便界面显示
    if (this.state) {
      if (!this.state.aiOperationLogs) {
        this.state.aiOperationLogs = [];
      }
      this.state.aiOperationLogs.push(log);
      // 限制日志数量，只保留最近50条
      if (this.state.aiOperationLogs.length > 50) {
        this.state.aiOperationLogs = this.state.aiOperationLogs.slice(-50);
      }
    }

    if (this.onOperationLog) {
      this.onOperationLog(log);
    }
  }

  // 获取操作日志
  getOperationLogs(): AIOperationLog[] {
    return [...this.operationLogs];
  }

  // 清除日志
  clearLogs(): void {
    this.operationLogs = [];
  }

  // 获取延迟管理器（用于外部访问）
  getDadongDelayManager(): AIDecisionDelayManager {
    return this.dadongDelayManager;
  }

  getEnemyDelayManager(): AIDecisionDelayManager {
    return this.enemyDelayManager;
  }

  // 更新难度配置
  updateDifficulty(dadongDifficulty?: 'easy' | 'medium' | 'hard', enemyDifficulty?: 'easy' | 'medium' | 'hard'): void {
    if (dadongDifficulty) {
      this.config.dadongDifficulty = dadongDifficulty;
      this.dadongDelayManager.setDifficulty(dadongDifficulty);
    }
    if (enemyDifficulty) {
      this.config.enemyDifficulty = enemyDifficulty;
      this.enemyDelayManager.setDifficulty(enemyDifficulty);
    }
  }
}

export default LevelAIController;
