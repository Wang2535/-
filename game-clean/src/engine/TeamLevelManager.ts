/**
 * 队伍等级管理器
 *
 * 功能：
 * 1. 管理队伍共享等级（渗透/安全）
 * 2. 管理个体修正值（针对特定玩家的效果）
 * 3. 计算玩家的实际生效等级
 * 4. 处理等级修改的优先级规则
 * 5. 2v2模式阵营特定等级管理（进攻方共享渗透等级，防守方共享安全等级）
 *
 * 规则：
 * - 显示等级 = 队伍共享等级 + 个体偏移量
 * - 常规效果修改队伍共享等级
 * - 个体效果修改目标玩家的个体修正值
 * - "无法提升"效果优先级最高
 * - "降低速度"效果作为乘数应用
 * - 2v2模式：进攻方只共享渗透等级，防守方只共享安全等级
 */

import type { GameState, TeamId, IndividualModifiers, Faction } from '@/types/gameRules';

export type LevelType = 'infiltration' | 'safety';

export interface LevelModificationResult {
  success: boolean;
  actualChange: number;
  newSharedLevel: number;
  newIndividualLevel: number;
  message: string;
}

export interface IndividualModifierResult {
  success: boolean;
  message: string;
}

class TeamLevelManagerClass {
  /**
   * 获取玩家的阵营
   */
  private getPlayerFaction(gameState: GameState, playerId: string): Faction | null {
    const player = gameState.players.find(p => p.id === playerId);
    return player?.faction || null;
  }

  /**
   * 获取队伍对应的阵营
   * 队伍A = 进攻方(attacker)
   * 队伍B = 防守方(defender)
   */
  private getTeamFaction(team: TeamId): Faction {
    return team === 'A' ? 'attacker' : 'defender';
  }

  /**
   * 获取玩家的实际生效等级
   * 显示等级 = 队伍共享等级 + 个体偏移量
   * 
   * 2v2模式特殊处理：
   * - 进攻方只计算渗透等级，安全等级始终为0
   * - 防守方只计算安全等级，渗透等级始终为0
   */
  getEffectiveLevel(
    gameState: GameState,
    playerId: string,
    levelType: LevelType
  ): number {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return 0;

    const faction = player.faction;
    const team = player.team || 'A';
    const sharedLevels = gameState.teamSharedLevels[team];

    // 2v2模式阵营特定等级处理
    if (faction === 'attacker' && levelType === 'safety') {
      // 进攻方不共享安全等级
      return 0;
    }
    if (faction === 'defender' && levelType === 'infiltration') {
      // 防守方不共享渗透等级
      return 0;
    }

    if (!sharedLevels) {
      // 如果没有队伍共享等级，使用玩家自身的等级
      return levelType === 'infiltration' ? player.infiltrationLevel : player.safetyLevel;
    }

    const sharedLevel = levelType === 'infiltration'
      ? sharedLevels.infiltrationLevel
      : sharedLevels.safetyLevel;

    const offset = levelType === 'infiltration'
      ? player.individualModifiers.infiltrationLevelOffset
      : player.individualModifiers.safetyLevelOffset;

    // 计算实际等级并限制在0-100范围内
    return Math.max(0, Math.min(100, sharedLevel + offset));
  }

  /**
   * 获取队伍共享等级
   */
  getTeamSharedLevel(
    gameState: GameState,
    team: TeamId,
    levelType: LevelType
  ): number {
    const sharedLevels = gameState.teamSharedLevels[team];
    if (!sharedLevels) return 0;

    return levelType === 'infiltration'
      ? sharedLevels.infiltrationLevel
      : sharedLevels.safetyLevel;
  }

  /**
   * 修改队伍共享等级（常规效果）
   * 
   * 2v2模式特殊处理：
   * - 进攻方（队伍A）只能修改渗透等级
   * - 防守方（队伍B）只能修改安全等级
   */
  modifyTeamLevel(
    gameState: GameState,
    team: TeamId,
    levelType: LevelType,
    amount: number,
    _sourcePlayerId?: string
  ): { newGameState: GameState; result: LevelModificationResult } {
    const newGameState = { ...gameState };
    const sharedLevels = { ...newGameState.teamSharedLevels };
    const teamLevels = { ...sharedLevels[team] };

    // 2v2模式阵营检查
    const teamFaction = this.getTeamFaction(team);
    if (teamFaction === 'attacker' && levelType === 'safety') {
      return {
        newGameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: teamLevels.safetyLevel,
          newIndividualLevel: 0,
          message: '进攻方不共享安全等级',
        },
      };
    }
    if (teamFaction === 'defender' && levelType === 'infiltration') {
      return {
        newGameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: teamLevels.infiltrationLevel,
          newIndividualLevel: 0,
          message: '防守方不共享渗透等级',
        },
      };
    }

    const currentLevel = levelType === 'infiltration'
      ? teamLevels.infiltrationLevel
      : teamLevels.safetyLevel;

    // 计算新等级
    let newLevel = currentLevel + amount;
    newLevel = Math.max(0, Math.min(100, newLevel));

    const actualChange = newLevel - currentLevel;

    // 更新队伍共享等级
    if (levelType === 'infiltration') {
      teamLevels.infiltrationLevel = newLevel;
    } else {
      teamLevels.safetyLevel = newLevel;
    }

    sharedLevels[team] = teamLevels;
    newGameState.teamSharedLevels = sharedLevels;

    // 更新该队伍所有玩家的显示等级
    newGameState.players = newGameState.players.map(player => {
      if (player.team === team) {
        const effectiveLevel = this.getEffectiveLevel(newGameState, player.id, levelType);
        return {
          ...player,
          [levelType === 'infiltration' ? 'infiltrationLevel' : 'safetyLevel']: effectiveLevel,
        };
      }
      return player;
    });

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const changeText = amount > 0 ? `+${amount}` : `${amount}`;

    return {
      newGameState,
      result: {
        success: actualChange !== 0,
        actualChange,
        newSharedLevel: newLevel,
        newIndividualLevel: newLevel,
        message: `队伍${team} ${levelName}等级 ${changeText} (${currentLevel} → ${newLevel})`,
      },
    };
  }

  /**
   * 修改个体偏移量（针对特定玩家的效果）
   */
  modifyIndividualOffset(
    gameState: GameState,
    playerId: string,
    levelType: LevelType,
    offsetChange: number
  ): { newGameState: GameState; result: IndividualModifierResult } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return {
        newGameState,
        result: { success: false, message: '找不到玩家' },
      };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 修改偏移量
    if (levelType === 'infiltration') {
      modifiers.infiltrationLevelOffset += offsetChange;
    } else {
      modifiers.safetyLevelOffset += offsetChange;
    }

    player.individualModifiers = modifiers;

    // 重新计算显示等级
    const effectiveLevel = this.getEffectiveLevel(newGameState, playerId, levelType);
    player[levelType === 'infiltration' ? 'infiltrationLevel' : 'safetyLevel'] = effectiveLevel;

    newGameState.players[playerIndex] = player;

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const changeText = offsetChange > 0 ? `+${offsetChange}` : `${offsetChange}`;

    return {
      newGameState,
      result: {
        success: true,
        message: `${player.name} ${levelName}偏移 ${changeText}，当前显示等级: ${effectiveLevel}`,
      },
    };
  }

  /**
   * 设置个体速度修正（降低提升速度效果）
   */
  setGainModifier(
    gameState: GameState,
    playerId: string,
    levelType: LevelType,
    modifier: number,
    effectSource: string
  ): { newGameState: GameState; result: IndividualModifierResult } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return {
        newGameState,
        result: { success: false, message: '找不到玩家' },
      };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 设置速度修正
    if (levelType === 'infiltration') {
      modifiers.infiltrationGainModifier = modifier;
    } else {
      modifiers.safetyGainModifier = modifier;
    }

    // 记录效果来源
    if (!modifiers.sourceEffects.includes(effectSource)) {
      modifiers.sourceEffects = [...modifiers.sourceEffects, effectSource];
    }

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const modifierText = (modifier * 100).toFixed(0);

    return {
      newGameState,
      result: {
        success: true,
        message: `${player.name} ${levelName}获取速度变为 ${modifierText}%`,
      },
    };
  }

  /**
   * 设置无法提升等级（优先级最高）
   */
  setCannotGain(
    gameState: GameState,
    playerId: string,
    levelType: LevelType,
    cannotGain: boolean,
    effectSource: string
  ): { newGameState: GameState; result: IndividualModifierResult } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return {
        newGameState,
        result: { success: false, message: '找不到玩家' },
      };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 设置无法提升
    if (levelType === 'infiltration') {
      modifiers.cannotGainInfiltration = cannotGain;
    } else {
      modifiers.cannotGainSafety = cannotGain;
    }

    // 记录效果来源
    if (cannotGain && !modifiers.sourceEffects.includes(effectSource)) {
      modifiers.sourceEffects = [...modifiers.sourceEffects, effectSource];
    }

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const statusText = cannotGain ? '无法提升' : '可以正常提升';

    return {
      newGameState,
      result: {
        success: true,
        message: `${player.name} ${levelName}${statusText}`,
      },
    };
  }

  /**
   * 应用等级变化（考虑所有修正）
   * 这是主要的等级修改接口，会自动处理所有优先级规则
   * 
   * 2v2模式特殊处理：
   * - 进攻方只能应用渗透等级变化
   * - 防守方只能应用安全等级变化
   */
  applyLevelChange(
    gameState: GameState,
    targetPlayerId: string,
    levelType: LevelType,
    baseAmount: number,
    isIndividualEffect: boolean = false,
    _effectSource?: string
  ): { newGameState: GameState; result: LevelModificationResult } {
    const player = gameState.players.find(p => p.id === targetPlayerId);
    if (!player) {
      return {
        newGameState: gameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: 0,
          newIndividualLevel: 0,
          message: '找不到玩家',
        },
      };
    }

    const team = player.team || 'A';
    const faction = player.faction;
    const modifiers = player.individualModifiers;

    // 2v2模式阵营特定等级检查
    if (faction === 'attacker' && levelType === 'safety') {
      return {
        newGameState: gameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: 0,
          newIndividualLevel: 0,
          message: '进攻方不共享安全等级',
        },
      };
    }
    if (faction === 'defender' && levelType === 'infiltration') {
      return {
        newGameState: gameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: 0,
          newIndividualLevel: 0,
          message: '防守方不共享渗透等级',
        },
      };
    }

    // 1. 检查"无法提升"效果（优先级最高）
    const cannotGain = levelType === 'infiltration'
      ? modifiers.cannotGainInfiltration
      : modifiers.cannotGainSafety;

    if (cannotGain && baseAmount > 0) {
      return {
        newGameState: gameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: this.getTeamSharedLevel(gameState, team, levelType),
          newIndividualLevel: this.getEffectiveLevel(gameState, targetPlayerId, levelType),
          message: `${player.name} 本回合无法提升${levelType === 'infiltration' ? '渗透' : '安全'}等级`,
        },
      };
    }

    // 2. 应用速度修正
    const gainModifier = levelType === 'infiltration'
      ? modifiers.infiltrationGainModifier
      : modifiers.safetyGainModifier;

    const modifiedAmount = Math.round(baseAmount * gainModifier);

    // 3. 根据效果类型决定修改方式
    if (isIndividualEffect) {
      // 个体效果：修改个体偏移量
      const individualResult = this.modifyIndividualOffset(gameState, targetPlayerId, levelType, modifiedAmount);
      return {
        newGameState: individualResult.newGameState,
        result: {
          success: individualResult.result.success,
          actualChange: modifiedAmount,
          newSharedLevel: this.getTeamSharedLevel(individualResult.newGameState, team, levelType),
          newIndividualLevel: this.getEffectiveLevel(individualResult.newGameState, targetPlayerId, levelType),
          message: individualResult.result.message,
        },
      };
    } else {
      // 常规效果：修改队伍共享等级
      return this.modifyTeamLevel(gameState, team, levelType, modifiedAmount, targetPlayerId);
    }
  }

  /**
   * 重置个体修正值（回合结束时调用）
   * 
   * 2v2模式特殊处理：
   * - 进攻方只重置渗透相关修正，安全等级始终为0
   * - 防守方只重置安全相关修正，渗透等级始终为0
   */
  resetIndividualModifiers(
    gameState: GameState,
    playerId: string
  ): { newGameState: GameState; message: string } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return { newGameState, message: '找不到玩家' };
    }

    const player = { ...newGameState.players[playerIndex] };
    const faction = player.faction;

    // 重置所有修正值
    player.individualModifiers = {
      infiltrationLevelOffset: 0,
      safetyLevelOffset: 0,
      infiltrationGainModifier: 1.0,
      safetyGainModifier: 1.0,
      cannotGainInfiltration: false,
      cannotGainSafety: false,
      sourceEffects: [],
      handLimitOffset: 0,
      handLimitTempOffset: 0,
      drawCountOffset: 0,
      drawCountTempOffset: 0,
    };

    // 2v2模式阵营特定等级重置
    if (faction === 'attacker') {
      // 进攻方：只计算渗透等级，安全等级为0
      player.infiltrationLevel = this.getEffectiveLevel(newGameState, playerId, 'infiltration');
      player.safetyLevel = 0;
    } else if (faction === 'defender') {
      // 防守方：只计算安全等级，渗透等级为0
      player.infiltrationLevel = 0;
      player.safetyLevel = this.getEffectiveLevel(newGameState, playerId, 'safety');
    } else {
      // 默认情况：计算两个等级
      player.infiltrationLevel = this.getEffectiveLevel(newGameState, playerId, 'infiltration');
      player.safetyLevel = this.getEffectiveLevel(newGameState, playerId, 'safety');
    }

    newGameState.players[playerIndex] = player;

    return {
      newGameState,
      message: `${player.name} 的个体修正值已重置`,
    };
  }

  /**
   * 初始化队伍共享等级
   * 队伍A（进攻方）：渗透等级=0（共享），安全等级=0（不共享）
   * 队伍B（防守方）：渗透等级=0（不共享），安全等级=1（共享，初始值为1避免第7轮次立即判定失败）
   */
  initializeTeamSharedLevels(): Record<TeamId, { infiltrationLevel: number; safetyLevel: number }> {
    return {
      A: { infiltrationLevel: 0, safetyLevel: 0 },
      B: { infiltrationLevel: 0, safetyLevel: 1 },
    };
  }

  /**
   * 初始化个体修正值
   */
  initializeIndividualModifiers(): IndividualModifiers {
    return {
      infiltrationLevelOffset: 0,
      safetyLevelOffset: 0,
      infiltrationGainModifier: 1.0,
      safetyGainModifier: 1.0,
      cannotGainInfiltration: false,
      cannotGainSafety: false,
      sourceEffects: [],
      handLimitOffset: 0,
      handLimitTempOffset: 0,
      drawCountOffset: 0,
      drawCountTempOffset: 0,
    };
  }

  /**
   * 修改手牌上限偏移量
   * @param isPermanent true为永久偏移，false为临时偏移（当前轮次有效）
   */
  modifyHandLimitOffset(
    gameState: GameState,
    playerId: string,
    amount: number,
    isPermanent: boolean = false
  ): { newGameState: GameState; message: string } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return { newGameState, message: '找不到玩家' };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    if (isPermanent) {
      modifiers.handLimitOffset += amount;
    } else {
      modifiers.handLimitTempOffset += amount;
    }

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    const offsetType = isPermanent ? '永久' : '临时';
    const changeText = amount > 0 ? `+${amount}` : `${amount}`;

    return {
      newGameState,
      message: `${player.name} 的手牌上限${offsetType}偏移 ${changeText}`,
    };
  }

  /**
   * 修改摸牌数偏移量
   * @param isPermanent true为永久偏移，false为临时偏移（当前轮次有效）
   */
  modifyDrawCountOffset(
    gameState: GameState,
    playerId: string,
    amount: number,
    isPermanent: boolean = false
  ): { newGameState: GameState; message: string } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return { newGameState, message: '找不到玩家' };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    if (isPermanent) {
      modifiers.drawCountOffset += amount;
    } else {
      modifiers.drawCountTempOffset += amount;
    }

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    const offsetType = isPermanent ? '永久' : '临时';
    const changeText = amount > 0 ? `+${amount}` : `${amount}`;

    return {
      newGameState,
      message: `${player.name} 的摸牌数${offsetType}偏移 ${changeText}`,
    };
  }

  /**
   * 重置临时修正值（每轮次结束时调用）
   * 保留永久偏移量，重置临时偏移量
   */
  resetTempModifiers(
    gameState: GameState,
    playerId: string
  ): { newGameState: GameState; message: string } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return { newGameState, message: '找不到玩家' };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 重置临时偏移量
    const oldHandLimitTemp = modifiers.handLimitTempOffset;
    const oldDrawCountTemp = modifiers.drawCountTempOffset;

    modifiers.handLimitTempOffset = 0;
    modifiers.drawCountTempOffset = 0;

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    return {
      newGameState,
      message: `${player.name} 的临时修正值已重置（手牌临时偏移: ${oldHandLimitTemp}, 摸牌临时偏移: ${oldDrawCountTemp}）`,
    };
  }
}

// 导出单例
export const TeamLevelManager = new TeamLevelManagerClass();
export default TeamLevelManager;
