/**
 * 《道高一丈：数字博弈》v17.0 - 光环类卡牌系统
 * 
 * 实现规则文档 R7.3 光环类卡牌系统
 * 
 * 核心功能：
 * 1. 光环卡牌放置管理（四个区域：Perimeter、DMZ、Internal、ICS）
 * 2. 光环效果触发机制（持续效果、触发条件）
 * 3. 光环叠加与冲突处理（每个区域最多1张光环卡）
 * 4. 光环持续时间管理
 * 5. 区域控制判定支持
 */

import type { 
  Player,
  GameState,
  Resources,
  Faction
} from '@/types/gameRules';

/** 游戏区域类型 */
export type GameArea = 'perimeter' | 'dmz' | 'internal' | 'ics';

/** 光环放置位置 - 支持四个游戏区域和通用位置 */
export type AuraPlacement = GameArea | 'hand' | 'discard' | 'deck' | 'battlefield';

/** 光环效果类型 */
export type AuraEffectType = 
  | 'resource_regen'      // 资源恢复
  | 'damage_boost'        // 伤害加成
  | 'defense_boost'       // 防御加成
  | 'draw_bonus'          // 抽卡加成
  | 'cost_reduction'      // 费用减免
  | 'infiltration_boost'  // 渗透加成
  | 'safety_boost'        // 安全加成
  | 'action_bonus'        // 行动点加成
  | 'dice_difficulty'     // 判定难度修改
  | 'rps_trigger'         // RPS触发
  | 'marker_prevention'   // 标记阻止
  | 'clear_immunity';     // 清除免疫

/** 光环触发条件 */
export type AuraTriggerCondition = 
  | 'on_turn_start'       // 回合开始
  | 'on_turn_end'         // 回合结束
  | 'on_card_play'        // 出牌时
  | 'on_damage'           // 受到伤害
  | 'on_resource_gain'    // 获得资源
  | 'on_damage_dealt'     // 造成伤害
  | 'on_damage_received'  // 受到伤害
  | 'on_attack'           // 受到攻击时（RPS触发）
  | 'none';               // 无触发条件（持续生效）

/** 光环效果定义 */
export interface AuraEffect {
  type: AuraEffectType;
  value: number;
  duration: number;  // 持续回合数（-1表示永久）
  triggerCondition: AuraTriggerCondition;
  targetFaction?: Faction;
  params?: Record<string, unknown>;
}

/** 区域光环状态 */
export interface AreaAuraState {
  area: GameArea;
  auraId: string | null;  // 当前区域的光环卡ID
  ownerId: string | null; // 光环卡拥有者
  effect: AuraEffect | null;
  placedAt: number;       // 放置回合
}

/**
 * 光环卡牌实例
 */
export interface AuraCardInstance {
  id: string;
  cardId: string;
  ownerId: string;
  placement: AuraPlacement;
  effect: AuraEffect;
  remainingDuration: number;  // 剩余回合数（-1表示永久）
  isActive: boolean;
  appliedTo: string[];  // 已应用到的玩家ID列表
}

/**
 * 光环效果应用结果
 */
export interface AuraApplicationResult {
  modifiedPlayers: Player[];
  modifiedGameState: GameState;
  logs: string[];
}

/**
 * 光环类卡牌系统
 */
export class AuraCardSystem {
  // 活跃的光环卡牌映射
  private static activeAuras: Map<string, AuraCardInstance> = new Map();
  
  // 玩家拥有的光环卡牌映射
  private static playerAuras: Map<string, string[]> = new Map();
  
  // 战场区域的光环卡牌
  private static battlefieldAuras: Set<string> = new Set();
  
  // 四个游戏区域的光环状态
  private static areaAuras: Map<GameArea, AreaAuraState> = new Map([
    ['perimeter', { area: 'perimeter', auraId: null, ownerId: null, effect: null, placedAt: 0 }],
    ['dmz', { area: 'dmz', auraId: null, ownerId: null, effect: null, placedAt: 0 }],
    ['internal', { area: 'internal', auraId: null, ownerId: null, effect: null, placedAt: 0 }],
    ['ics', { area: 'ics', auraId: null, ownerId: null, effect: null, placedAt: 0 }],
  ]);



  /**
   * 放置光环卡牌
   */
  static placeAuraCard(
    cardId: string,
    ownerId: string,
    placement: AuraPlacement,
    effect: AuraEffect
  ): AuraCardInstance {
    const auraId = `aura_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const aura: AuraCardInstance = {
      id: auraId,
      cardId,
      ownerId,
      placement,
      effect,
      remainingDuration: effect.duration,
      isActive: true,
      appliedTo: []
    };

    this.activeAuras.set(auraId, aura);
    
    // 添加到玩家光环列表
    const playerAuraList = this.playerAuras.get(ownerId) || [];
    playerAuraList.push(auraId);
    this.playerAuras.set(ownerId, playerAuraList);
    
    // 如果是战场区域，添加到战场光环集合
    if (placement === 'battlefield') {
      this.battlefieldAuras.add(auraId);
    }

    return aura;
  }

  /**
   * 放置光环到游戏区域（R7.3.1规则）
   * 每个区域最多放置1张光环卡，新放置的光环卡会替换该区域已有的光环卡
   * 
   * @param cardId 卡牌ID
   * @param ownerId 拥有者ID
   * @param area 目标区域
   * @param effect 光环效果
   * @param currentTurn 当前回合数
   * @returns 放置结果，包含被替换的光环ID（如果有）
   */
  static placeAuraInArea(
    cardId: string,
    ownerId: string,
    area: GameArea,
    effect: AuraEffect,
    currentTurn: number
  ): { aura: AuraCardInstance; replacedAuraId: string | null } {
    const areaState = this.areaAuras.get(area)!;
    const replacedAuraId = areaState.auraId;

    // 如果该区域已有光环卡，先移除它
    if (replacedAuraId) {
      this.removeAuraCard(replacedAuraId);
    }

    // 创建新的光环卡实例
    const aura = this.placeAuraCard(cardId, ownerId, area, effect);

    // 更新区域状态
    areaState.auraId = aura.id;
    areaState.ownerId = ownerId;
    areaState.effect = effect;
    areaState.placedAt = currentTurn;

    return { aura, replacedAuraId };
  }

  /**
   * 获取区域光环状态
   */
  static getAreaAuraState(area: GameArea): AreaAuraState {
    return this.areaAuras.get(area)!;
  }

  /**
   * 获取所有区域的光环状态
   */
  static getAllAreaAuras(): Map<GameArea, AreaAuraState> {
    return new Map(this.areaAuras);
  }

  /**
   * 检查区域是否有光环
   */
  static hasAreaAura(area: GameArea): boolean {
    const state = this.areaAuras.get(area)!;
    return state.auraId !== null;
  }

  /**
   * 获取区域光环的拥有者
   */
  static getAreaAuraOwner(area: GameArea): string | null {
    const state = this.areaAuras.get(area)!;
    return state.ownerId;
  }

  /**
   * 清除区域光环
   */
  static clearAreaAura(area: GameArea): boolean {
    const state = this.areaAuras.get(area)!;
    if (state.auraId) {
      this.removeAuraCard(state.auraId);
      state.auraId = null;
      state.ownerId = null;
      state.effect = null;
      state.placedAt = 0;
      return true;
    }
    return false;
  }

  /**
   * 移动光环卡牌到不同区域
   */
  static moveAuraCard(auraId: string, newPlacement: AuraPlacement): boolean {
    const aura = this.activeAuras.get(auraId);
    if (!aura) return false;

    const oldPlacement = aura.placement;
    aura.placement = newPlacement;

    // 更新战场光环集合
    if (oldPlacement === 'battlefield' && newPlacement !== 'battlefield') {
      this.battlefieldAuras.delete(auraId);
    } else if (oldPlacement !== 'battlefield' && newPlacement === 'battlefield') {
      this.battlefieldAuras.add(auraId);
    }

    // 如果移动到弃牌堆，停用光环
    if (newPlacement === 'discard') {
      aura.isActive = false;
    }

    return true;
  }

  /**
   * 移除光环卡牌
   */
  static removeAuraCard(auraId: string): boolean {
    const aura = this.activeAuras.get(auraId);
    if (!aura) return false;

    // 从玩家光环列表中移除
    const playerAuraList = this.playerAuras.get(aura.ownerId) || [];
    const index = playerAuraList.indexOf(auraId);
    if (index > -1) {
      playerAuraList.splice(index, 1);
      this.playerAuras.set(aura.ownerId, playerAuraList);
    }

    // 从战场光环集合中移除
    this.battlefieldAuras.delete(auraId);

    // 从活跃光环映射中移除
    this.activeAuras.delete(auraId);

    return true;
  }

  /**
   * 应用所有活跃的光环效果
   */
  static applyAllAuras(
    gameState: GameState,
    triggerEvent?: { type: string; playerId?: string }
  ): AuraApplicationResult {
    let modifiedPlayers = [...gameState.players];
    let modifiedGameState = { ...gameState };
    const logs: string[] = [];

    for (const aura of this.activeAuras.values()) {
      if (!aura.isActive) continue;

      // 检查触发条件
      if (!this.checkTriggerCondition(aura.effect.triggerCondition, triggerEvent)) {
        continue;
      }

      // 确定效果目标
      const targetIds = this.getEffectTargets(aura, modifiedPlayers);
      
      for (const targetId of targetIds) {
        const playerIndex = modifiedPlayers.findIndex(p => p.id === targetId);
        if (playerIndex === -1) continue;

        const player = modifiedPlayers[playerIndex];
        
        // 检查阵营限制
        if (aura.effect.targetFaction && player.faction !== aura.effect.targetFaction) {
          continue;
        }

        // 应用效果
        const { modifiedPlayer, log } = this.applyAuraEffect(
          player,
          aura.effect,
          aura.ownerId
        );

        modifiedPlayers[playerIndex] = modifiedPlayer;
        
        if (log && !aura.appliedTo.includes(targetId)) {
          logs.push(log);
          aura.appliedTo.push(targetId);
        }
      }
    }

    modifiedGameState = { ...modifiedGameState, players: modifiedPlayers };

    return { modifiedPlayers, modifiedGameState, logs };
  }

  /**
   * 检查触发条件
   */
  private static checkTriggerCondition(
    condition: AuraTriggerCondition,
    event?: { type: string; playerId?: string }
  ): boolean {
    if (condition === 'none') return true;
    if (!event) return false;

    switch (condition) {
      case 'on_turn_start':
        return event.type === 'turn_start';
      case 'on_turn_end':
        return event.type === 'turn_end';
      case 'on_resource_gain':
        return event.type === 'resource_gain';
      case 'on_card_play':
        return event.type === 'card_play';
      case 'on_damage_dealt':
        return event.type === 'damage_dealt';
      case 'on_damage_received':
        return event.type === 'damage_received';
      default:
        return false;
    }
  }

  /**
   * 获取效果目标
   */
  private static getEffectTargets(
    aura: AuraCardInstance,
    players: Player[]
  ): string[] {
    const targets: string[] = [];

    switch (aura.placement) {
      case 'battlefield':
        // 战场光环影响所有玩家
        targets.push(...players.map(p => p.id));
        break;
      
      case 'hand':
        // 手牌光环只影响拥有者
        targets.push(aura.ownerId);
        break;
      
      case 'discard':
        // 弃牌堆光环通常不生效
        break;
    }

    return targets;
  }

  /**
   * 应用单个光环效果
   */
  private static applyAuraEffect(
    player: Player,
    effect: AuraEffect,
    _ownerId: string
  ): { modifiedPlayer: Player; log?: string } {
    const modifiedPlayer = { ...player };
    const modifiedResources = { ...player.resources };
    let log = '';

    switch (effect.type) {
      case 'resource_regen':
        // 资源恢复加成（在资源恢复阶段生效）
        if (effect.params?.resourceType) {
          const resourceType = effect.params.resourceType as keyof Resources;
          const bonus = effect.value;
          modifiedResources[resourceType] = Math.min(20, 
            modifiedResources[resourceType] + bonus
          );
          log = `【光环】${player.name} 获得 ${bonus} ${resourceType} 恢复加成`;
        }
        break;

      case 'draw_bonus':
        // 抽卡加成（在抽卡阶段生效）
        modifiedPlayer.maxActions = (modifiedPlayer.maxActions || 3) + effect.value;
        log = `【光环】${player.name} 获得 ${effect.value} 额外行动点`;
        break;

      case 'cost_reduction':
        // 费用减免（在出牌时生效）
        // 这里只是标记，实际费用计算在卡牌使用时处理
        log = `【光环】${player.name} 卡牌费用 -${effect.value}`;
        break;

      case 'infiltration_boost':
        // 渗透加成（攻击方专属）
        if (player.faction === 'attacker') {
          modifiedPlayer.infiltrationLevel = Math.min(75, 
            modifiedPlayer.infiltrationLevel + effect.value
          );
          log = `【光环】${player.name} 渗透等级 +${effect.value}`;
        }
        break;

      case 'safety_boost':
        // 安全加成（防御方专属）
        if (player.faction === 'defender') {
          modifiedPlayer.safetyLevel = Math.min(75, 
            modifiedPlayer.safetyLevel + effect.value
          );
          log = `【光环】${player.name} 安全等级 +${effect.value}`;
        }
        break;

      case 'action_bonus':
        // 行动点上限加成
        modifiedPlayer.maxActions = (modifiedPlayer.maxActions || 3) + effect.value;
        log = `【光环】${player.name} 行动点上限 +${effect.value}`;
        break;

      default:
        break;
    }

    modifiedPlayer.resources = modifiedResources;
    return { modifiedPlayer, log };
  }

  /**
   * 回合结束时更新光环持续时间
   */
  static updateAuraDurations(): { expiredAuras: string[]; logs: string[] } {
    const expiredAuras: string[] = [];
    const logs: string[] = [];

    for (const [auraId, aura] of this.activeAuras) {
      if (!aura.isActive) continue;
      if (aura.remainingDuration === -1) continue; // 永久光环

      aura.remainingDuration--;

      if (aura.remainingDuration <= 0) {
        expiredAuras.push(auraId);
        logs.push(`光环 ${aura.cardId} 效果结束`);
        this.removeAuraCard(auraId);
      }
    }

    return { expiredAuras, logs };
  }

  /**
   * 获取玩家的所有活跃光环
   */
  static getPlayerActiveAuras(playerId: string): AuraCardInstance[] {
    const auraIds = this.playerAuras.get(playerId) || [];
    return auraIds
      .map(id => this.activeAuras.get(id))
      .filter((aura): aura is AuraCardInstance => 
        aura !== undefined && aura.isActive
      );
  }

  /**
   * 获取战场上的所有活跃光环
   */
  static getBattlefieldAuras(): AuraCardInstance[] {
    return Array.from(this.battlefieldAuras)
      .map(id => this.activeAuras.get(id))
      .filter((aura): aura is AuraCardInstance => 
        aura !== undefined && aura.isActive
      );
  }

  /**
   * 获取费用减免值（用于卡牌使用时的费用计算）
   */
  static getCostReduction(playerId: string): number {
    const playerAuras = this.getPlayerActiveAuras(playerId);
    let totalReduction = 0;

    for (const aura of playerAuras) {
      if (aura.effect.type === 'cost_reduction') {
        totalReduction += aura.effect.value;
      }
    }

    return totalReduction;
  }

  /**
   * 获取资源恢复加成
   */
  static getResourceRegenBonus(playerId: string, resourceType: keyof Resources): number {
    const playerAuras = this.getPlayerActiveAuras(playerId);
    let totalBonus = 0;

    for (const aura of playerAuras) {
      if (aura.effect.type === 'resource_regen' && 
          aura.effect.params?.resourceType === resourceType) {
        totalBonus += aura.effect.value;
      }
    }

    return totalBonus;
  }

  /**
   * 重置所有光环（游戏结束或重新开始时调用）
   */
  static resetAllAuras(): void {
    this.activeAuras.clear();
    this.playerAuras.clear();
    this.battlefieldAuras.clear();
    
    // 重置区域光环状态
    this.areaAuras.set('perimeter', { area: 'perimeter', auraId: null, ownerId: null, effect: null, placedAt: 0 });
    this.areaAuras.set('dmz', { area: 'dmz', auraId: null, ownerId: null, effect: null, placedAt: 0 });
    this.areaAuras.set('internal', { area: 'internal', auraId: null, ownerId: null, effect: null, placedAt: 0 });
    this.areaAuras.set('ics', { area: 'ics', auraId: null, ownerId: null, effect: null, placedAt: 0 });
  }

  /**
   * 获取光环统计信息
   */
  static getAuraStatistics(): {
    totalAuras: number;
    battlefieldAuras: number;
    handAuras: number;
    discardAuras: number;
    areaAuras: number;
    areaDetails: Record<GameArea, boolean>;
  } {
    let battlefieldCount = 0;
    let handCount = 0;
    let discardCount = 0;
    let areaCount = 0;

    for (const aura of this.activeAuras.values()) {
      switch (aura.placement) {
        case 'battlefield':
          battlefieldCount++;
          break;
        case 'hand':
          handCount++;
          break;
        case 'discard':
          discardCount++;
          break;
        case 'perimeter':
        case 'dmz':
        case 'internal':
        case 'ics':
          areaCount++;
          break;
      }
    }

    return {
      totalAuras: this.activeAuras.size,
      battlefieldAuras: battlefieldCount,
      handAuras: handCount,
      discardAuras: discardCount,
      areaAuras: areaCount,
      areaDetails: {
        perimeter: this.hasAreaAura('perimeter'),
        dmz: this.hasAreaAura('dmz'),
        internal: this.hasAreaAura('internal'),
        ics: this.hasAreaAura('ics'),
      }
    };
  }

  /**
   * 获取判定难度修改值（用于光环效果如DEF025多层防护）
   */
  static getDiceDifficultyModifier(_playerId: string, isOpponent: boolean): number {
    let modifier = 0;

    for (const aura of this.activeAuras.values()) {
      if (!aura.isActive) continue;

      // 检查是否是判定难度修改光环
      if (aura.effect.type === 'dice_difficulty') {
        // 如果是对手的光环，且目标是当前玩家
        if (isOpponent && aura.effect.targetFaction) {
          modifier += aura.effect.value;
        }
      }
    }

    return modifier;
  }

  /**
   * 检查RPS触发光环（如DEF013蜜罐系统、DEF022诱捕系统）
   */
  static checkRPSTrigger(area: GameArea): { triggered: boolean; auraId: string | null; ownerId: string | null } {
    const areaState = this.areaAuras.get(area)!;
    
    if (areaState.auraId && areaState.effect) {
      if (areaState.effect.type === 'rps_trigger') {
        return {
          triggered: true,
          auraId: areaState.auraId,
          ownerId: areaState.ownerId
        };
      }
    }

    return { triggered: false, auraId: null, ownerId: null };
  }

  /**
   * 检查标记阻止光环（如ATK038深度隐藏）
   */
  static checkMarkerPrevention(area: GameArea, faction: Faction): boolean {
    const areaState = this.areaAuras.get(area)!;
    
    if (areaState.auraId && areaState.effect) {
      if (areaState.effect.type === 'marker_prevention') {
        // 检查目标阵营
        if (areaState.effect.targetFaction === faction) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查清除免疫光环（如ATK037权限维持）
   */
  static checkClearImmunity(area: GameArea, ownerId: string): boolean {
    const areaState = this.areaAuras.get(area)!;
    
    if (areaState.auraId && 
        areaState.ownerId === ownerId && 
        areaState.effect?.type === 'clear_immunity') {
      return true;
    }

    return false;
  }
}

export default AuraCardSystem;
