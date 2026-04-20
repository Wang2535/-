/**
 * 2v2团队对战系统
 * 实现完善的2v2规则.md中的所有功能
 */

import type { GameState } from '../types/gameRules';
import { gameLogger } from './GameLogger';

// ==================== 类型定义 ====================

export type TeamId = 'attacker' | 'defender';
export type PlayerPosition = 'A' | 'B';

export interface TeamPlayer {
  playerId: string;
  position: PlayerPosition;
  characterId: string;
  isConnected: boolean;
  isAI: boolean;
}

export interface Team {
  teamId: TeamId;
  players: [TeamPlayer, TeamPlayer];
  sharedResources: TeamResources;
}

/**
 * 团队资源（2v2共享）
 * 根据完善的2v2规则.md 3.1.2
 */
export interface TeamResources {
  computing: number;    // 团队算力
  funds: number;        // 团队资金
  information: number;  // 团队信息
}

/**
 * 个人资源（不共享）
 * 根据完善的2v2规则.md 3.1.1
 */
export interface PersonalResources {
  infiltrationLevel: number;  // 渗透等级（进攻方）
  safetyLevel: number;        // 安全等级（防御方）
  handCards: number;          // 手牌数
  authority: number;          // 权限点
}

// 团队资源限制（根据3.1.2表格）
export const TEAM_RESOURCE_LIMITS = {
  computing: 30,
  funds: 40,
  information: 20,
};

// 团队资源初始值（根据3.1.2表格）
export const TEAM_RESOURCE_INITIAL = {
  computing: 6,
  funds: 10,
  information: 4,
};

// 团队资源恢复规则（根据3.1.2表格）
export const TEAM_RESOURCE_RECOVERY = {
  computing: 3,
  funds: 2,
  information: 2,
};

// 资源转移限制（根据3.3.1）
export const RESOURCE_TRANSFER_LIMITS = {
  maxPerTurn: 3,      // 每回合最多转移3点资源
  ratio: 1,           // 1:1比例（无损耗）
};

// 协同技能类型（根据5.1表格）
export type SynergyType = 'combo' | 'unison' | 'support';

export interface SynergySkill {
  id: string;
  name: string;
  type: SynergyType;
  triggerCondition: string;
  cooldown: number;
  effect: string;
  effectValue?: number;
}

// 2v2专属卡牌
export interface TeamCard {
  card_code: string;
  name: string;
  teamEffect: boolean;
  targetTeam?: TeamId;
  effect: string;
}

// ==================== 团队资源管理器 ====================

export class TeamResourceManager {
  private teamResources: Map<TeamId, TeamResources> = new Map();
  private transferHistory: Map<string, number> = new Map(); // 记录每回合转移量

  initializeTeams(): void {
    this.teamResources.set('attacker', { ...TEAM_RESOURCE_INITIAL });
    this.teamResources.set('defender', { ...TEAM_RESOURCE_INITIAL });
    this.transferHistory.clear();
    
    gameLogger.info('resource_changed', '团队资源初始化完成', {
      extra: {
        attacker: { ...TEAM_RESOURCE_INITIAL },
        defender: { ...TEAM_RESOURCE_INITIAL },
      },
    });
  }

  getTeamResources(teamId: TeamId): TeamResources {
    return this.teamResources.get(teamId) || { ...TEAM_RESOURCE_INITIAL };
  }

  /**
   * 修改团队资源
   */
  modifyTeamResource(
    teamId: TeamId,
    resourceType: keyof TeamResources,
    amount: number
  ): boolean {
    const resources = this.teamResources.get(teamId);
    if (!resources) return false;

    const newValue = resources[resourceType] + amount;
    const limit = TEAM_RESOURCE_LIMITS[resourceType];
    
    resources[resourceType] = Math.max(0, Math.min(newValue, limit));
    
    gameLogger.info('resource_changed', `团队资源变更: ${teamId}`, {
      change: amount,
      newValue: resources[resourceType],
      extra: { resourceType },
    });
    
    return true;
  }

  /**
   * 恢复团队资源（每回合结束时调用）
   * 根据3.1.2表格的恢复规则
   */
  recoverTeamResources(teamId: TeamId): void {
    const resources = this.teamResources.get(teamId);
    if (!resources) return;

    resources.computing = Math.min(
      resources.computing + TEAM_RESOURCE_RECOVERY.computing,
      TEAM_RESOURCE_LIMITS.computing
    );
    resources.funds = Math.min(
      resources.funds + TEAM_RESOURCE_RECOVERY.funds,
      TEAM_RESOURCE_LIMITS.funds
    );
    resources.information = Math.min(
      resources.information + TEAM_RESOURCE_RECOVERY.information,
      TEAM_RESOURCE_LIMITS.information
    );

    // 重置转移记录
    this.transferHistory.clear();

    gameLogger.info('resource_changed', `团队资源恢复: ${teamId}`, {
      extra: { resources: { ...resources } },
    });
  }

  /**
   * 转移资源给队友（主动转移）
   * 根据3.3.1规则：1:1比例，每回合最多3点
   */
  transferResourceToTeammate(
    teamId: TeamId,
    fromPlayerId: string,
    toPlayerId: string,
    resourceType: keyof TeamResources,
    amount: number
  ): { success: boolean; message: string } {
    // 检查转移限制
    const transferKey = `${fromPlayerId}_${teamId}`;
    const currentTransfer = this.transferHistory.get(transferKey) || 0;
    
    if (currentTransfer + amount > RESOURCE_TRANSFER_LIMITS.maxPerTurn) {
      const remaining = RESOURCE_TRANSFER_LIMITS.maxPerTurn - currentTransfer;
      return {
        success: false,
        message: `超出每回合转移限制，还可转移${remaining}点`,
      };
    }

    const resources = this.teamResources.get(teamId);
    if (!resources || resources[resourceType] < amount) {
      return {
        success: false,
        message: '团队资源不足',
      };
    }

    // 执行转移（团队资源内部转移，总量不变）
    // 实际游戏中这是从团队池到个人，或从个人到团队
    resources[resourceType] -= amount;

    // 记录转移
    this.transferHistory.set(transferKey, currentTransfer + amount);

    gameLogger.info('resource_changed', '团队资源转移给队友', {
      extra: {
        teamId,
        fromPlayerId,
        toPlayerId,
        resourceType,
        amount,
        remainingTransfers: RESOURCE_TRANSFER_LIMITS.maxPerTurn - currentTransfer - amount,
      },
    });

    return { success: true, message: `成功转移${amount}点${resourceType}` };
  }

  /**
   * 检查是否可以使用团队资源
   */
  canUseTeamResource(
    teamId: TeamId,
    resourceType: keyof TeamResources,
    amount: number
  ): boolean {
    const resources = this.teamResources.get(teamId);
    return resources ? resources[resourceType] >= amount : false;
  }

  /**
   * 消耗团队资源
   */
  consumeTeamResource(
    teamId: TeamId,
    resourceType: keyof TeamResources,
    amount: number
  ): boolean {
    if (!this.canUseTeamResource(teamId, resourceType, amount)) {
      return false;
    }
    return this.modifyTeamResource(teamId, resourceType, -amount);
  }

  /**
   * 获取团队资源使用建议（根据3.2.2表格）
   */
  getResourceStrategy(teamId: TeamId, turnNumber: number): {
    computing: string;
    funds: string;
    information: string;
  } {
    if (turnNumber <= 4) {
      return teamId === 'attacker'
        ? {
            computing: '平均分配，双方都需要资源发展',
            funds: '优先购买低费卡牌',
            information: '积累信息用于后期',
          }
        : {
            computing: '优先防守薄弱方，防止被突破',
            funds: '优先部署防御设施',
            information: '监控对方行动',
          };
    } else if (turnNumber <= 8) {
      return teamId === 'attacker'
        ? {
            computing: '倾斜优势方，快速扩大战果',
            funds: '投资高回报卡牌',
            information: '精准打击',
          }
        : {
            computing: '平均分配，稳定防守',
            funds: '平衡防御和反击',
            information: '预判对方意图',
          };
    } else {
      return teamId === 'attacker'
        ? {
            computing: '集中使用，全力一击',
            funds: '不计成本投入',
            information: '决胜判定',
          }
        : {
            computing: '优先关键判定',
            funds: '确保防御底线',
            information: '最后防线',
          };
    }
  }
}

// ==================== 团队行动管理器 ====================

export interface TeamTurnState {
  currentTeam: TeamId;
  currentPlayerIndex: number;
  teamTurnOrder: TeamId[];
  playerOrder: string[];
  turnNumber: number;
}

export class TeamActionManager {
  private turnState: TeamTurnState | null = null;
  private playerTeams: Map<string, TeamId> = new Map();
  private teamPlayers: Map<TeamId, string[]> = new Map();

  initializeTeams(attackerPlayers: [string, string], defenderPlayers: [string, string]): void {
    this.playerTeams.set(attackerPlayers[0], 'attacker');
    this.playerTeams.set(attackerPlayers[1], 'attacker');
    this.playerTeams.set(defenderPlayers[0], 'defender');
    this.playerTeams.set(defenderPlayers[1], 'defender');

    this.teamPlayers.set('attacker', [attackerPlayers[0], attackerPlayers[1]]);
    this.teamPlayers.set('defender', [defenderPlayers[0], defenderPlayers[1]]);

    this.turnState = {
      currentTeam: 'attacker',
      currentPlayerIndex: 0,
      teamTurnOrder: ['attacker', 'defender'],
      playerOrder: [
        attackerPlayers[0],
        attackerPlayers[1],
        defenderPlayers[0],
        defenderPlayers[1],
      ],
      turnNumber: 1,
    };

    gameLogger.info('game_start', '2v2团队行动管理器初始化完成', {
      extra: {
        attackerPlayers,
        defenderPlayers,
        turnOrder: this.turnState.playerOrder,
      },
    });
  }

  getCurrentPlayer(): string | null {
    if (!this.turnState) return null;
    return this.turnState.playerOrder[this.turnState.currentPlayerIndex];
  }

  getCurrentTeam(): TeamId | null {
    if (!this.turnState) return null;
    return this.turnState.currentTeam;
  }

  /**
   * 获取当前回合数
   */
  getTurnNumber(): number {
    return this.turnState?.turnNumber || 1;
  }

  /**
   * 切换到下一个玩家
   * 根据4.1规则：进攻方玩家A → 进攻方玩家B → 防御方玩家A → 防御方玩家B
   */
  nextTurn(): string | null {
    if (!this.turnState) return null;

    this.turnState.currentPlayerIndex++;
    
    // 完成一个完整回合（4名玩家）
    if (this.turnState.currentPlayerIndex >= this.turnState.playerOrder.length) {
      this.turnState.currentPlayerIndex = 0;
      this.turnState.turnNumber++;
    }

    const nextPlayer = this.turnState.playerOrder[this.turnState.currentPlayerIndex];
    this.turnState.currentTeam = this.playerTeams.get(nextPlayer) || 'attacker';

    gameLogger.info('turn_start', '2v2回合切换', {
      extra: {
        currentPlayer: nextPlayer,
        currentTeam: this.turnState.currentTeam,
        playerIndex: this.turnState.currentPlayerIndex,
        turnNumber: this.turnState.turnNumber,
      },
    });

    return nextPlayer;
  }

  /**
   * 检查当前团队回合是否完成
   * 用于触发团队结算阶段
   */
  isTeamTurnComplete(): boolean {
    if (!this.turnState) return false;
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return false;
    
    const currentTeam = this.playerTeams.get(currentPlayer);
    const teamPlayers = this.teamPlayers.get(currentTeam!);
    
    // 检查是否是 team's 第二个玩家
    return teamPlayers ? currentPlayer === teamPlayers[1] : false;
  }

  /**
   * 检查是否完成一个完整回合（4名玩家都行动过）
   */
  isFullRoundComplete(): boolean {
    if (!this.turnState) return false;
    return this.turnState.currentPlayerIndex === 0 && this.turnState.turnNumber > 1;
  }

  getTeamPlayers(teamId: TeamId): string[] {
    return this.teamPlayers.get(teamId) || [];
  }

  getPlayerTeam(playerId: string): TeamId | null {
    return this.playerTeams.get(playerId) || null;
  }

  getTurnOrder(): string[] {
    return this.turnState?.playerOrder || [];
  }

  /**
   * 获取指定团队的行动点
   * 根据4.4.1规则：1-6回合3点，7回合起4点
   */
  getActionPoints(_teamId: TeamId): number {
    const turnNumber = this.getTurnNumber();
    return turnNumber <= 6 ? 3 : 4;
  }
}

// ==================== 协同技能系统 ====================

export class SynergySkillSystem {
  private synergySkills: Map<string, SynergySkill> = new Map();
  private skillCooldowns: Map<string, Map<string, number>> = new Map();
  private activeSynergies: Map<string, string[]> = new Map(); // 记录激活的协同效果

  constructor() {
    this.initializeSynergySkills();
  }

  private initializeSynergySkills(): void {
    // 进攻方协同技能（根据5.1表格）
    const attackerSkills: SynergySkill[] = [
      {
        id: 'SYN-ATK-001',
        name: '连击型·协同渗透',
        type: 'combo',
        triggerCondition: '队友连续使用同类型卡牌',
        cooldown: 2,
        effect: '团队加成：渗透+2/人',
        effectValue: 2,
      },
      {
        id: 'SYN-ATK-002',
        name: '支援型·资源调配',
        type: 'support',
        triggerCondition: '主动消耗资源为队友提供加成',
        cooldown: 1,
        effect: '为队友提供+1判定修正',
        effectValue: 1,
      },
      {
        id: 'SYN-ATK-003',
        name: '联合型·双重威胁',
        type: 'unison',
        triggerCondition: '两名队友同时满足条件',
        cooldown: 3,
        effect: '清除对方所有光环效果',
      },
      {
        id: 'SYN-ATK-004',
        name: '连击型·信息同步',
        type: 'combo',
        triggerCondition: '队友查看手牌时',
        cooldown: 2,
        effect: '你也查看1张',
      },
      {
        id: 'SYN-ATK-005',
        name: '联合型·协同攻击',
        type: 'unison',
        triggerCondition: '2人同时威胁判定',
        cooldown: 3,
        effect: '威胁标记×2',
        effectValue: 2,
      },
    ];

    // 防御方协同技能（根据5.1表格）
    const defenderSkills: SynergySkill[] = [
      {
        id: 'SYN-DEF-001',
        name: '连击型·协同防御',
        type: 'combo',
        triggerCondition: '队友连续使用防御卡牌',
        cooldown: 2,
        effect: '团队加成：安全+2/人',
        effectValue: 2,
      },
      {
        id: 'SYN-DEF-002',
        name: '支援型·护盾共享',
        type: 'support',
        triggerCondition: '队友受到伤害时',
        cooldown: 1,
        effect: '可以转移护盾值给队友',
      },
      {
        id: 'SYN-DEF-003',
        name: '联合型·联合防守',
        type: 'unison',
        triggerCondition: '2人同时控制区域',
        cooldown: 3,
        effect: '免疫1回合伤害',
      },
      {
        id: 'SYN-DEF-004',
        name: '连击型·预警系统',
        type: 'combo',
        triggerCondition: '队友预判成功时',
        cooldown: 2,
        effect: '你也获得信息',
      },
      {
        id: 'SYN-DEF-005',
        name: '支援型·双重防御',
        type: 'support',
        triggerCondition: '2人同时防御判定',
        cooldown: 3,
        effect: '防御效果×2',
        effectValue: 2,
      },
    ];

    [...attackerSkills, ...defenderSkills].forEach(skill => {
      this.synergySkills.set(skill.id, skill);
    });
  }

  getSynergySkill(skillId: string): SynergySkill | undefined {
    return this.synergySkills.get(skillId);
  }

  getSkillsByType(type: SynergyType): SynergySkill[] {
    return Array.from(this.synergySkills.values()).filter(s => s.type === type);
  }

  getSkillsByTeam(teamId: TeamId): SynergySkill[] {
    const prefix = teamId === 'attacker' ? 'SYN-ATK' : 'SYN-DEF';
    return Array.from(this.synergySkills.values()).filter(s => s.id.startsWith(prefix));
  }

  canActivateSynergy(playerId: string, skillId: string): boolean {
    const playerCooldowns = this.skillCooldowns.get(playerId);
    if (!playerCooldowns) return true;
    
    const cooldown = playerCooldowns.get(skillId);
    return !cooldown || cooldown <= 0;
  }

  activateSynergy(playerId: string, skillId: string): boolean {
    if (!this.canActivateSynergy(playerId, skillId)) {
      gameLogger.warn('effect_triggered', '协同技能冷却中', {
        extra: { playerId, skillId },
      });
      return false;
    }

    const skill = this.synergySkills.get(skillId);
    if (!skill) return false;

    // 设置冷却
    if (!this.skillCooldowns.has(playerId)) {
      this.skillCooldowns.set(playerId, new Map());
    }
    this.skillCooldowns.get(playerId)!.set(skillId, skill.cooldown);

    // 记录激活
    if (!this.activeSynergies.has(playerId)) {
      this.activeSynergies.set(playerId, []);
    }
    this.activeSynergies.get(playerId)!.push(skillId);

    gameLogger.info('effect_triggered', '协同技能激活', {
      extra: {
        playerId,
        skillId,
        skillName: skill.name,
        effect: skill.effect,
      },
    });

    return true;
  }

  updateCooldowns(): void {
    this.skillCooldowns.forEach((cooldowns) => {
      cooldowns.forEach((cooldown, skillId) => {
        if (cooldown > 0) {
          cooldowns.set(skillId, cooldown - 1);
        }
      });
    });
  }

  getCooldown(playerId: string, skillId: string): number {
    return this.skillCooldowns.get(playerId)?.get(skillId) || 0;
  }

  /**
   * 获取当前激活的协同效果
   */
  getActiveSynergies(playerId: string): string[] {
    return this.activeSynergies.get(playerId) || [];
  }

  /**
   * 清除协同效果（在效果触发后）
   */
  clearActiveSynergies(playerId: string): void {
    this.activeSynergies.delete(playerId);
  }
}

// ==================== 2v2胜利条件系统 ====================

export interface TeamVictoryConditions {
  // 进攻方胜利条件
  securityCollapse: boolean;
  totalControl: boolean;
  
  // 防御方胜利条件
  absoluteSecurity: boolean;
  threatElimination: boolean;
}

export class TeamVictorySystem {
  /**
   * 检查进攻方胜利条件
   * 根据完善的2v2规则.md 6.1.1
   */
  checkAttackerVictory(
    gameState: GameState,
    attackerPlayers: string[],
    defenderPlayers: string[]
  ): { victory: boolean; condition: string } {
    const currentRound = gameState.round;

    // 条件1：安全瓦解（团队版）- 需要3轮次后（原：6回合后）
    if (currentRound > 3) {
      const totalInfiltration = attackerPlayers.reduce((sum, pid) => {
        const player = gameState.players.find(p => p.id === pid);
        return sum + (player?.infiltrationLevel || 0);
      }, 0);

      const avgSafety = defenderPlayers.reduce((sum, pid) => {
        const player = gameState.players.find(p => p.id === pid);
        return sum + (player?.safetyLevel || 0);
      }, 0) / defenderPlayers.length;

      // 团队总渗透≥75 且 对方平均安全<30
      if (totalInfiltration >= 75 && avgSafety < 30) {
        return { victory: true, condition: '安全瓦解（团队版）' };
      }
    }

    // 条件2：完全控制 - 需要区域控制系统支持
    // 检查是否控制所有4个区域
    const controlledAreas = attackerPlayers.flatMap(pid => {
      const player = gameState.players.find(p => p.id === pid);
      return player?.controlledAreas || [];
    });
    if (controlledAreas.length >= 4 && currentRound > 3) {
      return { victory: true, condition: '完全控制（团队版）' };
    }

    return { victory: false, condition: '' };
  }

  /**
   * 检查防御方胜利条件
   * 根据完善的2v2规则.md 6.1.2
   */
  checkDefenderVictory(
    gameState: GameState,
    attackerPlayers: string[],
    defenderPlayers: string[]
  ): { victory: boolean; condition: string } {
    const currentRound = gameState.round;

    // 条件1：绝对安全（团队版）- 需要3轮次后（原：6回合后）
    if (currentRound > 3) {
      const totalSafety = defenderPlayers.reduce((sum, pid) => {
        const player = gameState.players.find(p => p.id === pid);
        return sum + (player?.safetyLevel || 0);
      }, 0);

      const avgInfiltration = attackerPlayers.reduce((sum, pid) => {
        const player = gameState.players.find(p => p.id === pid);
        return sum + (player?.infiltrationLevel || 0);
      }, 0) / attackerPlayers.length;

      // 团队总安全≥75 且 对方平均渗透<30
      if (totalSafety >= 75 && avgInfiltration < 30) {
        return { victory: true, condition: '绝对安全（团队版）' };
      }
    }

    // 条件2：威胁清除
    const allAttackersLow = attackerPlayers.every(pid => {
      const player = gameState.players.find(p => p.id === pid);
      return (player?.infiltrationLevel || 0) <= 0;
    });

    if (allAttackersLow && currentRound > 6) {
      return { victory: true, condition: '威胁清除' };
    }

    return { victory: false, condition: '' };
  }

  /**
   * 检查平局和24轮次判定
   * 根据完善的游戏规则.md R1.3
   */
  checkDraw(
    gameState: GameState,
    attackerPlayers: string[],
    defenderPlayers: string[]
  ): { isDraw: boolean; winner?: TeamId } {
    // R1.4: 第12轮次后判定平局（原：第24回合）
    if (gameState.round < 12) {
      return { isDraw: false };
    }

    // 计算双方总渗透/安全等级
    const attackerTotal = attackerPlayers.reduce((sum, pid) => {
      const player = gameState.players.find(p => p.id === pid);
      return sum + (player?.infiltrationLevel || 0);
    }, 0);

    const defenderTotal = defenderPlayers.reduce((sum, pid) => {
      const player = gameState.players.find(p => p.id === pid);
      return sum + (player?.safetyLevel || 0);
    }, 0);

    // 第24轮次判定
    if (attackerTotal > defenderTotal) {
      return { isDraw: false, winner: 'attacker' };
    } else if (defenderTotal > attackerTotal) {
      return { isDraw: false, winner: 'defender' };
    }

    // 比较控制区域数
    const attackerAreas = attackerPlayers.reduce((sum, pid) => {
      const player = gameState.players.find(p => p.id === pid);
      return sum + (player?.controlledAreas?.length || 0);
    }, 0);
    const defenderAreas = defenderPlayers.reduce((sum, pid) => {
      const player = gameState.players.find(p => p.id === pid);
      return sum + (player?.controlledAreas?.length || 0);
    }, 0);

    if (attackerAreas > defenderAreas) {
      return { isDraw: false, winner: 'attacker' };
    } else if (defenderAreas > attackerAreas) {
      return { isDraw: false, winner: 'defender' };
    }

    // 真正的平局
    return { isDraw: true };
  }
}

// ==================== 团队结算系统 ====================

export interface TeamSettlementResult {
  teamId: TeamId;
  infiltrationTotal?: number;
  safetyTotal?: number;
  techUpgraded: boolean;
  resourcesRecovered: boolean;
  victoryChecked: boolean;
  messages: string[];
}

export class TeamSettlementSystem {
  /**
   * 执行进攻方团队结算
   * 根据4.3.1规则
   */
  static settleAttackerTeam(
    gameState: GameState,
    attackerPlayers: string[]
  ): TeamSettlementResult {
    const messages: string[] = [];

    // 1. 渗透等级汇总
    const totalInfiltration = attackerPlayers.reduce((sum, pid) => {
      const player = gameState.players.find(p => p.id === pid);
      return sum + (player?.infiltrationLevel || 0);
    }, 0);
    messages.push(`团队总渗透等级: ${totalInfiltration}`);

    // 2. 科技树检查（简化处理）
    const techUpgraded = totalInfiltration >= 20; // 示例阈值
    if (techUpgraded) {
      messages.push('科技树升级检查通过');
    }

    // 3. 胜利条件检查在TeamVictorySystem中处理

    return {
      teamId: 'attacker',
      infiltrationTotal: totalInfiltration,
      techUpgraded,
      resourcesRecovered: false, // 由TeamResourceManager处理
      victoryChecked: false,
      messages,
    };
  }

  /**
   * 执行防御方团队结算
   * 根据4.3.2规则
   */
  static settleDefenderTeam(
    gameState: GameState,
    defenderPlayers: string[]
  ): TeamSettlementResult {
    const messages: string[] = [];

    // 1. 安全等级汇总
    const totalSafety = defenderPlayers.reduce((sum, pid) => {
      const player = gameState.players.find(p => p.id === pid);
      return sum + (player?.safetyLevel || 0);
    }, 0);
    messages.push(`团队总安全等级: ${totalSafety}`);

    // 2. 科技树检查
    const techUpgraded = totalSafety >= 20; // 示例阈值
    if (techUpgraded) {
      messages.push('科技树升级检查通过');
    }

    return {
      teamId: 'defender',
      safetyTotal: totalSafety,
      techUpgraded,
      resourcesRecovered: false,
      victoryChecked: false,
      messages,
    };
  }
}

// ==================== 主系统类 ====================

export class TeamBattleSystem {
  teamResourceManager: TeamResourceManager;
  teamActionManager: TeamActionManager;
  synergySkillSystem: SynergySkillSystem;
  teamVictorySystem: TeamVictorySystem;

  private isInitialized: boolean = false;
  private attackerPlayers: [string, string] | null = null;
  private defenderPlayers: [string, string] | null = null;

  constructor() {
    this.teamResourceManager = new TeamResourceManager();
    this.teamActionManager = new TeamActionManager();
    this.synergySkillSystem = new SynergySkillSystem();
    this.teamVictorySystem = new TeamVictorySystem();
  }

  initialize(
    attackerPlayers: [string, string],
    defenderPlayers: [string, string]
  ): void {
    this.attackerPlayers = attackerPlayers;
    this.defenderPlayers = defenderPlayers;

    // 初始化各子系统
    this.teamResourceManager.initializeTeams();
    this.teamActionManager.initializeTeams(attackerPlayers, defenderPlayers);

    this.isInitialized = true;

    gameLogger.info('game_start', '2v2团队对战系统初始化完成', {
      extra: {
        attackerPlayers,
        defenderPlayers,
      },
    });
  }

  isTeamBattle(): boolean {
    return this.isInitialized;
  }

  getAttackerPlayers(): [string, string] | null {
    return this.attackerPlayers;
  }

  getDefenderPlayers(): [string, string] | null {
    return this.defenderPlayers;
  }

  /**
   * 结束团队回合
   * 执行团队结算阶段
   */
  endTeamTurn(teamId: TeamId): TeamSettlementResult | null {
    if (!this.attackerPlayers || !this.defenderPlayers) return null;

    // 1. 恢复团队资源
    this.teamResourceManager.recoverTeamResources(teamId);

    // 2. 更新协同技能冷却
    this.synergySkillSystem.updateCooldowns();

    // 3. 执行团队结算
    let settlementResult: TeamSettlementResult;
    if (teamId === 'attacker') {
      settlementResult = TeamSettlementSystem.settleAttackerTeam(
        {} as GameState, // 需要传入实际gameState
        this.attackerPlayers
      );
    } else {
      settlementResult = TeamSettlementSystem.settleDefenderTeam(
        {} as GameState,
        this.defenderPlayers
      );
    }

    settlementResult.resourcesRecovered = true;

    gameLogger.info('turn_end', `团队回合结束: ${teamId}`, {
      extra: { settlementResult },
    });

    return settlementResult;
  }

  checkVictory(gameState: GameState): { victory: boolean; winner?: TeamId; condition?: string } {
    if (!this.attackerPlayers || !this.defenderPlayers) {
      return { victory: false };
    }

    // 检查进攻方胜利
    const attackerResult = this.teamVictorySystem.checkAttackerVictory(
      gameState,
      this.attackerPlayers,
      this.defenderPlayers
    );

    if (attackerResult.victory) {
      return { victory: true, winner: 'attacker', condition: attackerResult.condition };
    }

    // 检查防御方胜利
    const defenderResult = this.teamVictorySystem.checkDefenderVictory(
      gameState,
      this.attackerPlayers,
      this.defenderPlayers
    );

    if (defenderResult.victory) {
      return { victory: true, winner: 'defender', condition: defenderResult.condition };
    }

    // 检查平局
    const drawResult = this.teamVictorySystem.checkDraw(
      gameState,
      this.attackerPlayers,
      this.defenderPlayers
    );

    if (drawResult.isDraw) {
      return { victory: true, condition: '平局' };
    }

    if (drawResult.winner) {
      return { victory: true, winner: drawResult.winner, condition: '第24轮次判定' };
    }

    return { victory: false };
  }

  reset(): void {
    this.isInitialized = false;
    this.attackerPlayers = null;
    this.defenderPlayers = null;
    
    gameLogger.info('game_end', '2v2团队对战系统已重置');
  }
}

// 单例导出
export const teamBattleSystem = new TeamBattleSystem();
export default teamBattleSystem;
