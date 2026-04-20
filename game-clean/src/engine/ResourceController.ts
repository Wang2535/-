import type { Player, Resources, GameState, Faction } from '@/types/gameRules';
import { RESOURCE_LIMITS } from '@/types/gameRules';
import { RoundStateSystem } from './RoundStateSystem';

/**
 * 资源控制器 - 管理玩家资源的恢复与补充
 * 
 * 核心功能：
 * 1. 每回合结束阶段自动恢复基础资源
 * 2. 阵营特定的资源恢复加成
 * 3. 回合状态影响的额外资源增益
 */
export class ResourceController {
  
  /**
   * 基础资源恢复配置
   */
  private static readonly BASE_RESTORE = {
    compute: 1,    // 每回合恢复1点算力
    funds: 1,      // 每回合恢复1点资金
    information: 0, // 信息不自动恢复
    access: 0       // 权限不自动恢复
  };
  
  /**
   * 阵营特定加成
   */
  private static readonly FACTION_BONUS: Record<Faction, Partial<Resources>> = {
    attacker: {
      information: 1,  // 攻击方每回合额外恢复1点信息
    },
    defender: {
      compute: 1,      // 防御方每回合额外恢复1点算力
    }
  };
  
  /**
   * 濒死保护阈值
   */
  private static readonly CRISIS_THRESHOLD = {
    compute: 2,
    funds: 2
  };
  
  /**
   * 恢复单个玩家的资源
   * 
   * @param player - 目标玩家
   * @param gameState - 当前游戏状态
   * @returns 恢复后的玩家对象
   */
  static restorePlayerResources(player: Player, _gameState: GameState): { 
    player: Player; 
    restored: Partial<Resources>;
    isCrisisProtected: boolean;
  } {
    const restored: Partial<Resources> = {};
    const newResources = { ...player.resources };
    let isCrisisProtected = false;
    
    // 1. 基础恢复
    for (const [resource, amount] of Object.entries(this.BASE_RESTORE)) {
      if (amount > 0) {
        const key = resource as keyof Resources;
        const limit = RESOURCE_LIMITS[key];
        const before = newResources[key];
        newResources[key] = Math.min(newResources[key] + amount, limit.max);
        restored[key] = newResources[key] - before;
      }
    }
    
    // 2. 阵营加成
    const factionBonus = this.FACTION_BONUS[player.faction];
    if (factionBonus) {
      for (const [resource, amount] of Object.entries(factionBonus)) {
        if (typeof amount === 'number' && amount > 0) {
          const key = resource as keyof Resources;
          const limit = RESOURCE_LIMITS[key];
          const before = newResources[key];
          newResources[key] = Math.min(newResources[key] + amount, limit.max);
          restored[key] = (restored[key] || 0) + (newResources[key] - before);
        }
      }
    }
    
    // 3. 回合状态加成
    const stateBonus = RoundStateSystem.getResourceGainBonus();
    for (const [resource, amount] of Object.entries(stateBonus)) {
      if (amount && amount > 0) {
        const key = resource as keyof Resources;
        const limit = RESOURCE_LIMITS[key];
        const before = newResources[key];
        newResources[key] = Math.min(newResources[key] + amount, limit.max);
        restored[key] = (restored[key] || 0) + (newResources[key] - before);
      }
    }
    
    // 4. 濒死保护 - 当资源过低时额外恢复
    if (newResources.compute <= this.CRISIS_THRESHOLD.compute && 
        newResources.funds <= this.CRISIS_THRESHOLD.funds) {
      // 濒死状态额外恢复
      const crisisRestore = player.faction === 'defender' ? 2 : 1;
      newResources.compute = Math.min(newResources.compute + crisisRestore, RESOURCE_LIMITS.compute.max);
      newResources.funds = Math.min(newResources.funds + crisisRestore, RESOURCE_LIMITS.funds.max);
      restored.compute = (restored.compute || 0) + crisisRestore;
      restored.funds = (restored.funds || 0) + crisisRestore;
      isCrisisProtected = true;
    }
    
    return {
      player: { ...player, resources: newResources },
      restored,
      isCrisisProtected
    };
  }
  
  /**
   * 执行回合结束时的资源恢复（Phase 5）
   * 
   * @param gameState - 当前游戏状态
   * @returns 更新后的游戏状态
   */
  static executeEndOfTurnRestore(gameState: GameState): GameState {
    let newPlayers = [...gameState.players];
    const restoreLogs: string[] = [];
    
    for (let i = 0; i < newPlayers.length; i++) {
      const player = newPlayers[i];
      
      // 跳过已淘汰的玩家
      if (!player.isAlive && 'isAlive' in player) {
        continue;
      }
      
      const result = this.restorePlayerResources(player, gameState);
      newPlayers[i] = result.player;
      
      // 构建恢复日志
      const restoredEntries = Object.entries(result.restored)
        .filter(([, amount]) => typeof amount === 'number' && amount > 0)
        .map(([res, amount]) => {
          const icons: Record<string, string> = {
            compute: '⚡',
            funds: '💰',
            information: '👁️',
            access: '👑'
          };
          return `${icons[res] || ''}${amount}`;
        });
      
      if (restoredEntries.length > 0) {
        let logMsg = `${player.name} 恢复: ${restoredEntries.join(' ')}`;
        if (result.isCrisisProtected) {
          logMsg += ' (濒死保护)';
        }
        restoreLogs.push(logMsg);
      }
    }
    
    // 添加恢复日志
    let newState = { ...gameState, players: newPlayers };
    
    if (restoreLogs.length > 0) {
      // 简化日志添加
      const logEntry = {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        turn: gameState.turn,
        round: gameState.round,
        phase: gameState.currentPhase,
        action: 'resource_recovery',
        message: '【资源恢复】' + restoreLogs.join(' | ')
      };
      newState.log = [...(gameState.log || []), logEntry];
    }
    
    return newState;
  }
  
  /**
   * 立即恢复指定玩家的指定资源
   * 
   * @param player - 目标玩家
   * @param resource - 资源类型
   * @param amount - 恢复数量
   * @returns 更新后的玩家对象
   */
  static restoreResourceImmediately(
    player: Player, 
    resource: keyof Resources, 
    amount: number
  ): Player {
    const newResources = { ...player.resources };
    const limit = RESOURCE_LIMITS[resource];
    newResources[resource] = Math.min(newResources[resource] + amount, limit.max);
    
    return { ...player, resources: newResources };
  }
  
  /**
   * 消耗玩家资源
   * 
   * @param player - 目标玩家
   * @param cost - 消耗的资源
   * @returns 更新后的玩家对象，如果资源不足返回null
   */
  static consumeResources(player: Player, cost: Partial<Resources>): Player | null {
    // 检查资源是否足够
    for (const [resource, amount] of Object.entries(cost)) {
      if (typeof amount === 'number' && player.resources[resource as keyof Resources] < amount) {
        return null; // 资源不足
      }
    }
    
    // 执行消耗
    const newResources = { ...player.resources };
    for (const [resource, amount] of Object.entries(cost)) {
      if (typeof amount === 'number') {
        newResources[resource as keyof Resources] -= amount;
      }
    }
    
    return { ...player, resources: newResources };
  }
  
  /**
   * 检查玩家是否处于濒死状态
   * 
   * @param player - 目标玩家
   * @returns 是否濒死
   */
  static isInCrisis(player: Player): boolean {
    return player.resources.compute <= this.CRISIS_THRESHOLD.compute &&
           player.resources.funds <= this.CRISIS_THRESHOLD.funds;
  }
  
  /**
   * 获取资源恢复预览（用于UI显示）
   * 
   * @param player - 目标玩家
   * @returns 预计恢复的资源
   */
  static getRestorePreview(player: Player): Partial<Resources> {
    const preview: Partial<Resources> = { ...this.BASE_RESTORE };
    
    // 阵营加成
    const factionBonus = this.FACTION_BONUS[player.faction];
    if (factionBonus) {
      for (const [resource, amount] of Object.entries(factionBonus)) {
        if (amount) {
          preview[resource as keyof Resources] = (preview[resource as keyof Resources] || 0) + amount;
        }
      }
    }
    
    // 回合状态加成
    const stateBonus = RoundStateSystem.getResourceGainBonus();
    for (const [resource, amount] of Object.entries(stateBonus)) {
      if (amount) {
        preview[resource as keyof Resources] = (preview[resource as keyof Resources] || 0) + amount;
      }
    }
    
    // 濒死保护
    if (this.isInCrisis(player)) {
      const crisisRestore = player.faction === 'defender' ? 2 : 1;
      preview.compute = (preview.compute || 0) + crisisRestore;
      preview.funds = (preview.funds || 0) + crisisRestore;
    }
    
    return preview;
  }
}

export default ResourceController;
