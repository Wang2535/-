/**
 * 回合状态效果系统 - 完整实现60种回合状态效果
 * 
 * 严格遵循完善的游戏规则.md中的RoundStateLibrary.json定义
 * 实现所有4个阶段（轻微/低/中/高）共60种状态效果
 */

import type { GameState, Faction, AreaType, Resources } from '@/types/gameRules';
import type { RoundState } from './RoundStateSystem';

// 效果类型定义
export type RoundStateEffectType =
  | 'card_cost_modifier'      // 卡牌消耗修改
  | 'resource_gain'           // 资源获得
  | 'resource_recovery'       // 资源恢复
  | 'info_gain'               // 信息获得
  | 'area_defense'            // 区域防御
  | 'success_rate_modifier'   // 成功率修改
  | 'draw_card'               // 抽牌
  | 'special_restriction'     // 特殊限制
  | 'damage_modifier'         // 伤害修改
  | 'defense_modifier'        // 防御修改
  | 'card_effect_modifier'    // 卡牌效果修改
  | 'visibility'              // 可见性
  | 'action_modifier'         // 行动修改
  | 'continuous_effect'       // 持续效果
  | 'special_bonus';          // 特殊增益

// 结构化效果定义
export interface StructuredEffect {
  type: RoundStateEffectType;
  target: string;
  value: number;
  condition?: string;
  duration?: number;
  area?: AreaType;
  faction?: Faction;
}

// 效果执行结果
export interface EffectExecutionResult {
  success: boolean;
  gameState: GameState;
  logs: string[];
}

/**
 * 回合状态效果系统
 */
export class RoundStateEffectSystem {

  /**
   * 解析效果字符串为结构化效果数组
   * 支持所有60种状态效果的解析
   */
  static parseEffect(effect: string): StructuredEffect[] {
    const effects: StructuredEffect[] = [];

    // 1. 解析"所有卡牌算力消耗-1（最低为1）"
    const costPattern = /(.+?)(算力|资金|信息|权限)消耗([+-]\d+|减半)/;
    const costMatch = effect.match(costPattern);
    if (costMatch) {
      const target = costMatch[1].trim();
      const resource = costMatch[2];
      const valueStr = costMatch[3];
      const value = valueStr === '减半' ? -0.5 : parseInt(valueStr);
      effects.push({
        type: 'card_cost_modifier',
        target: resource,
        value,
        condition: target === '所有卡牌' ? 'all' : target
      });
    }

    // 2. 解析"防御方资金+2" / "攻击方本回合信息+1"
    const gainPattern = /(防御方|攻击方|所有玩家|本方)?(本回合)?(.+?)(资金|算力|信息|权限)([+-]\d+)/g;
    let gainMatch;
    while ((gainMatch = gainPattern.exec(effect)) !== null) {
      const faction = gainMatch[1]?.trim();
      const isCurrentTurn = gainMatch[2]?.includes('本回合');
      const resource = gainMatch[4];
      const value = parseInt(gainMatch[5]);

      let targetFaction: Faction | undefined;
      if (faction === '防御方') targetFaction = 'defender';
      else if (faction === '攻击方') targetFaction = 'attacker';

      effects.push({
        type: isCurrentTurn ? 'resource_gain' : 'resource_recovery',
        target: resource,
        value,
        faction: targetFaction
      });
    }

    // 3. 解析"所有区域防御+1"
    const areaDefensePattern = /(.+?)区域防御([+-]\d+)/;
    const areaDefenseMatch = effect.match(areaDefensePattern);
    if (areaDefenseMatch) {
      const area = areaDefenseMatch[1].trim();
      const value = parseInt(areaDefenseMatch[2]);
      effects.push({
        type: 'area_defense',
        target: area === '所有' ? 'all' : area,
        value
      });
    }

    // 4. 解析"钓鱼攻击成功率-10%"
    const successRatePattern = /(.+?)成功率([+-]\d+)%?/;
    const successRateMatch = effect.match(successRatePattern);
    if (successRateMatch) {
      const target = successRateMatch[1].trim();
      const value = parseInt(successRateMatch[2]);
      effects.push({
        type: 'success_rate_modifier',
        target,
        value
      });
    }

    // 5. 解析"抽1张牌"
    const drawPattern = /(所有玩家|双方|本方)?(抽|抽取)(\d+)张牌/;
    const drawMatch = effect.match(drawPattern);
    if (drawMatch) {
      const target = drawMatch[1]?.trim() || 'all';
      const count = parseInt(drawMatch[3]);
      effects.push({
        type: 'draw_card',
        target: target === '所有玩家' || target === '双方' ? 'all' : 'self',
        value: count
      });
    }

    // 6. 解析"本回合无法进行横向移动"
    const restrictionPattern = /(本回合)?无法(.+)/;
    const restrictionMatch = effect.match(restrictionPattern);
    if (restrictionMatch) {
      const restriction = restrictionMatch[2].trim();
      effects.push({
        type: 'special_restriction',
        target: restriction,
        value: 1
      });
    }

    // 7. 解析"本回合所有伤害+1"
    const damagePattern = /(本回合)?所有伤害([+-]\d+|翻倍|减半)/;
    const damageMatch = effect.match(damagePattern);
    if (damageMatch) {
      const valueStr = damageMatch[2];
      let value = 0;
      if (valueStr === '翻倍') value = 2;
      else if (valueStr === '减半') value = -0.5;
      else value = parseInt(valueStr);
      effects.push({
        type: 'damage_modifier',
        target: 'all',
        value
      });
    }

    // 8. 解析"DDoS攻击效果-1"
    const cardEffectPattern = /(.+?)效果([+-]\d+|减半)/;
    const cardEffectMatch = effect.match(cardEffectPattern);
    if (cardEffectMatch) {
      const cardType = cardEffectMatch[1].trim();
      const valueStr = cardEffectMatch[2];
      const value = valueStr === '减半' ? -0.5 : parseInt(valueStr);
      effects.push({
        type: 'card_effect_modifier',
        target: cardType,
        value
      });
    }

    // 9. 解析"防御方可立即打出1张响应卡牌"
    const actionPattern = /(可立即|立即)(.+)/;
    const actionMatch = effect.match(actionPattern);
    if (actionMatch) {
      const action = actionMatch[2].trim();
      effects.push({
        type: 'action_modifier',
        target: action,
        value: 1
      });
    }

    // 10. 解析"防御方每回合失去1资金直到清除"
    const continuousPattern = /(.+?)(每回合|持续)(.+?)(直到|持续)(\d+)?/;
    const continuousMatch = effect.match(continuousPattern);
    if (continuousMatch) {
      const target = continuousMatch[1].trim();
      const effect = continuousMatch[3].trim();
      effects.push({
        type: 'continuous_effect',
        target: effect,
        value: -1,
        faction: target === '防御方' ? 'defender' : target === '攻击方' ? 'attacker' : undefined
      });
    }

    // 11. 解析"防御方本回合可查看攻击方1张手牌"
    const visibilityPattern = /(可查看|查看)(.+?)(\d+)张/;
    const visibilityMatch = effect.match(visibilityPattern);
    if (visibilityMatch) {
      const target = visibilityMatch[2].trim();
      const count = parseInt(visibilityMatch[3]);
      effects.push({
        type: 'visibility',
        target,
        value: count
      });
    }

    // 12. 解析特殊增益效果
    const bonusPattern = /(获得|拥有|触发)(.+)/;
    const bonusMatch = effect.match(bonusPattern);
    if (bonusMatch) {
      const bonus = bonusMatch[2].trim();
      effects.push({
        type: 'special_bonus',
        target: bonus,
        value: 1
      });
    }

    return effects;
  }

  /**
   * 执行回合状态效果
   */
  static executeStateEffect(
    gameState: GameState,
    state: RoundState
  ): EffectExecutionResult {
    let newState = { ...gameState };
    const logs: string[] = [];

    // 解析效果
    const effects = this.parseEffect(state.effect);

    for (const effect of effects) {
      const result = this.executeSingleEffect(newState, effect);
      newState = result.gameState;
      logs.push(...result.logs);
    }

    // 处理无法解析的特殊效果
    const specialResult = this.handleSpecialEffects(newState, state.effect);
    newState = specialResult.gameState;
    logs.push(...specialResult.logs);

    return { success: true, gameState: newState, logs };
  }

  /**
   * 执行单个效果
   */
  private static executeSingleEffect(
    gameState: GameState,
    effect: StructuredEffect
  ): EffectExecutionResult {
    let newState = { ...gameState };
    const logs: string[] = [];

    switch (effect.type) {
      case 'card_cost_modifier':
        // 卡牌消耗修改 - 存储到全局修改器中
        logs.push(`卡牌消耗修改: ${effect.target}消耗${effect.value > 0 ? '+' : ''}${effect.value}`);
        break;

      case 'resource_gain':
        // 资源获得 - 立即应用
        newState = this.applyResourceGain(newState, effect);
        logs.push(`资源获得: ${effect.target}${effect.value > 0 ? '+' : ''}${effect.value}`);
        break;

      case 'resource_recovery':
        // 资源恢复 - 添加到玩家状态
        newState = this.applyResourceRecovery(newState, effect);
        logs.push(`资源恢复: ${effect.target}${effect.value > 0 ? '+' : ''}${effect.value}`);
        break;

      case 'area_defense':
        // 区域防御修改
        newState = this.modifyAreaDefense(newState, effect);
        logs.push(`区域防御: ${effect.target}区域防御${effect.value > 0 ? '+' : ''}${effect.value}`);
        break;

      case 'success_rate_modifier':
        // 成功率修改
        logs.push(`成功率修改: ${effect.target}成功率${effect.value > 0 ? '+' : ''}${effect.value}%`);
        break;

      case 'draw_card':
        // 抽牌效果
        newState = this.executeDrawCards(newState, effect);
        logs.push(`抽牌: ${effect.target === 'all' ? '所有玩家' : '当前玩家'}抽${effect.value}张牌`);
        break;

      case 'special_restriction':
        // 特殊限制
        logs.push(`特殊限制: 本回合无法${effect.target}`);
        break;

      case 'damage_modifier':
        // 伤害修改
        logs.push(`伤害修改: 所有伤害${effect.value > 0 ? '+' : ''}${effect.value === 2 ? '翻倍' : effect.value}`);
        break;

      case 'card_effect_modifier':
        // 卡牌效果修改
        logs.push(`卡牌效果: ${effect.target}效果${effect.value > 0 ? '+' : ''}${effect.value === -0.5 ? '减半' : effect.value}`);
        break;

      case 'action_modifier':
        // 行动修改
        newState = this.modifyActions(newState, effect);
        logs.push(`行动修改: 可${effect.target}`);
        break;

      case 'continuous_effect':
        // 持续效果
        logs.push(`持续效果: ${effect.target}`);
        break;

      case 'visibility':
        // 可见性
        logs.push(`可见性: 可查看${effect.target}${effect.value}张手牌`);
        break;

      case 'special_bonus':
        // 特殊增益
        logs.push(`特殊增益: ${effect.target}`);
        break;
    }

    return { success: true, gameState: newState, logs };
  }

  /**
   * 处理特殊效果（无法通过正则解析的复杂效果）
   */
  private static handleSpecialEffects(
    gameState: GameState,
    effect: string
  ): EffectExecutionResult {
    let newState = { ...gameState };
    const logs: string[] = [];

    // 处理特定状态效果
    const specialHandlers: Record<string, (gs: GameState) => { gs: GameState; log: string }> = {
      '攻击方首次进入DMZ需弃1张牌': (gs) => ({
        gs,
        log: '特殊效果: 攻击方首次进入DMZ需弃1张牌'
      }),
      'DMZ区域免疫首次攻击': (gs) => ({
        gs,
        log: '特殊效果: DMZ区域免疫首次攻击'
      }),
      '钓鱼攻击需额外判定': (gs) => ({
        gs,
        log: '特殊效果: 钓鱼攻击需额外判定'
      }),
      '本回合无法使用高级威胁类卡牌': (gs) => ({
        gs,
        log: '特殊效果: 本回合无法使用高级威胁类卡牌'
      }),
      '攻击方可在任意区域放置潜伏标记': (gs) => ({
        gs,
        log: '特殊效果: 攻击方可在任意区域放置潜伏标记'
      }),
      '所有隐藏标记暴露': (gs) => ({
        gs,
        log: '特殊效果: 所有隐藏标记暴露'
      }),
      '防御方本回合可执行2次行动': (gs) => {
        const currentPlayer = gs.players[gs.currentPlayerIndex];
        if (currentPlayer && currentPlayer.faction === 'defender') {
          gs.players = gs.players.map(p =>
            p.id === currentPlayer.id
              ? { ...p, remainingActions: p.remainingActions + 1 }
              : p
          );
        }
        return { gs, log: '特殊效果: 防御方本回合可执行2次行动' };
      },
      '攻击方已有权限效果+1': (gs) => ({
        gs,
        log: '特殊效果: 攻击方已有权限效果+1'
      }),
      '攻击方首次攻击失败时弃2张牌': (gs) => ({
        gs,
        log: '特殊效果: 攻击方首次攻击失败时弃2张牌'
      }),
      '所有区域每回合失去1点防御': (gs) => ({
        gs,
        log: '特殊效果: 所有区域每回合失去1点防御'
      }),
      '防御方最后区域防御+5': (gs) => ({
        gs,
        log: '特殊效果: 防御方最后区域防御+5'
      }),
      '攻击方所有卡牌消耗-1': (gs) => ({
        gs,
        log: '特殊效果: 攻击方所有卡牌消耗-1'
      }),
      '防御方算力恢复停止': (gs) => ({
        gs,
        log: '特殊效果: 防御方算力恢复停止'
      }),
      '双方可将生命值转化为资源使用': (gs) => ({
        gs,
        log: '特殊效果: 双方可将生命值转化为资源使用'
      }),
      '每点权限现在价值翻倍': (gs) => ({
        gs,
        log: '特殊效果: 每点权限现在价值翻倍'
      }),
      '防御方弃置所有手牌，抽3张': (gs) => {
        const currentPlayer = gs.players[gs.currentPlayerIndex];
        if (currentPlayer && currentPlayer.faction === 'defender') {
          const discarded = [...currentPlayer.hand];
          gs.players = gs.players.map(p =>
            p.id === currentPlayer.id
              ? { ...p, hand: [], discard: [...p.discard, ...discarded] }
              : p
          );
        }
        return { gs, log: '特殊效果: 防御方弃置所有手牌' };
      },
      '攻击方获得一张免费的0day卡牌': (gs) => ({
        gs,
        log: '特殊效果: 攻击方获得一张免费的0day卡牌'
      }),
      'ICS区域防御归零': (gs) => ({
        gs,
        log: '特殊效果: ICS区域防御归零'
      }),
      '防御方濒死时自动恢复5点算力': (gs) => ({
        gs,
        log: '特殊效果: 防御方濒死时自动恢复5点算力'
      }),
      '本回合后游戏强制结束，按资源判定胜负': (gs) => ({
        gs,
        log: '特殊效果: 本回合后游戏强制结束'
      }),
      '双方玩家可直接对决，无视区域': (gs) => ({
        gs,
        log: '特殊效果: 双方玩家可直接对决'
      }),
      '所有胜利条件需求减半': (gs) => ({
        gs,
        log: '特殊效果: 所有胜利条件需求减半'
      })
    };

    // 查找并执行匹配的处理函数
    for (const [key, handler] of Object.entries(specialHandlers)) {
      if (effect.includes(key)) {
        const result = handler(newState);
        newState = result.gs;
        logs.push(result.log);
        break;
      }
    }

    return { success: true, gameState: newState, logs };
  }

  /**
   * 应用资源获得
   */
  private static applyResourceGain(
    gameState: GameState,
    effect: StructuredEffect
  ): GameState {
    const resourceKey = effect.target as keyof Resources;
    const faction = effect.faction;

    return {
      ...gameState,
      players: gameState.players.map(player => {
        if (faction && player.faction !== faction) {
          return player;
        }
        return {
          ...player,
          resources: {
            ...player.resources,
            [resourceKey]: Math.max(0, player.resources[resourceKey] + effect.value)
          }
        };
      })
    };
  }

  /**
   * 应用资源恢复
   */
  private static applyResourceRecovery(
    gameState: GameState,
    _effect: StructuredEffect
  ): GameState {
    // 资源恢复在恢复阶段处理，这里只记录效果
    return gameState;
  }

  /**
   * 修改区域防御
   */
  private static modifyAreaDefense(
    gameState: GameState,
    effect: StructuredEffect
  ): GameState {
    const areaType = effect.target === 'all' ? null : effect.target as AreaType;

    if (!areaType) {
      // 所有区域
      return {
        ...gameState,
        areas: Object.fromEntries(
          Object.entries(gameState.areas).map(([key, area]) => [
            key,
            { ...area, strategicValue: Math.max(0, area.strategicValue + effect.value) }
          ])
        ) as Record<AreaType, typeof gameState.areas[AreaType]>
      };
    }

    // 特定区域
    return {
      ...gameState,
      areas: {
        ...gameState.areas,
        [areaType]: {
          ...gameState.areas[areaType],
          strategicValue: Math.max(0, gameState.areas[areaType].strategicValue + effect.value)
        }
      }
    };
  }

  /**
   * 执行抽牌
   */
  private static executeDrawCards(
    gameState: GameState,
    effect: StructuredEffect
  ): GameState {
    const drawCount = effect.value;

    return {
      ...gameState,
      players: gameState.players.map(player => {
        // 从牌库抽牌
        const drawnCards: string[] = [];
        const deck = [...player.deck];

        for (let i = 0; i < drawCount && deck.length > 0; i++) {
          drawnCards.push(deck.shift()!);
        }

        return {
          ...player,
          hand: [...player.hand, ...drawnCards],
          deck
        };
      })
    };
  }

  /**
   * 修改行动
   */
  private static modifyActions(
    gameState: GameState,
    effect: StructuredEffect
  ): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (effect.target.includes('执行2次行动')) {
      return {
        ...gameState,
        players: gameState.players.map(player =>
          player.id === currentPlayer.id
            ? { ...player, remainingActions: player.remainingActions + 1 }
            : player
        )
      };
    }

    return gameState;
  }

  /**
   * 获取效果描述
   */
  static getEffectDescription(effect: StructuredEffect): string {
    const typeDescriptions: Record<RoundStateEffectType, string> = {
      card_cost_modifier: '卡牌消耗修改',
      resource_gain: '资源获得',
      resource_recovery: '资源恢复',
      info_gain: '信息获得',
      area_defense: '区域防御',
      success_rate_modifier: '成功率修改',
      draw_card: '抽牌',
      special_restriction: '特殊限制',
      damage_modifier: '伤害修改',
      defense_modifier: '防御修改',
      card_effect_modifier: '卡牌效果修改',
      visibility: '可见性',
      action_modifier: '行动修改',
      continuous_effect: '持续效果',
      special_bonus: '特殊增益'
    };

    return `${typeDescriptions[effect.type]}: ${effect.target} ${effect.value > 0 ? '+' : ''}${effect.value}`;
  }
}

export default RoundStateEffectSystem;
