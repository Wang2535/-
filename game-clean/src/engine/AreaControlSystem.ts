/**
 * 区域控制系统 (R3.0, R3.1)
 * 实现区域控制判定和每回合加成机制
 * 
 * 文档版本: v16.2.0
 * 最后更新: 2026-02-05
 */

import type { AreaType, AreaState, Faction, Player } from '@/types/gameRules';

/** 区域控制加成定义 (R3.1) */
export interface AreaControlBonus {
  /** 渗透等级加成 */
  infiltrationBonus: number;
  /** 安全等级加成 */
  safetyBonus: number;
  /** 行动点加成 */
  actionPointBonus: number;
  /** 描述 */
  description: string;
}

/** 各区域控制加成配置 */
export const AREA_BONUSES: Record<AreaType, AreaControlBonus> = {
  perimeter: {
    infiltrationBonus: 1,  // 进攻方占领：每回合渗透+1
    safetyBonus: 1,        // 防御方占领：每回合安全+1
    actionPointBonus: 0,
    description: '网络边界：占领者每回合渗透/安全+1'
  },
  dmz: {
    infiltrationBonus: 0,
    safetyBonus: 0,
    actionPointBonus: 1,   // 占领者每回合行动点+1
    description: '隔离区：占领者每回合行动点+1'
  },
  internal: {
    infiltrationBonus: 2,  // 进攻方占领：每回合渗透+2
    safetyBonus: 1,        // 防御方占领：每回合安全+1
    actionPointBonus: 0,
    description: '内网：进攻方占领渗透+2/回合，防御方占领安全+1/回合'
  },
  ics: {
    infiltrationBonus: 2,  // 占领者每回合渗透+2
    safetyBonus: 2,        // 占领者每回合安全+2
    actionPointBonus: 0,
    description: '工控系统：占领者每回合渗透/安全+2'
  }
};

/** 区域初始控制状态 (R3.1注) */
export const INITIAL_AREA_CONTROL: Record<AreaType, Faction | null> = {
  perimeter: null,    // 中立
  dmz: 'defender',    // 防御方初始占领
  internal: null,     // 中立
  ics: 'defender'     // 防御方初始占领
};

/**
 * 计算区域控制者
 * @param area 区域状态
 * @param players 所有玩家（用于查找owner对应的faction）
 * @returns 控制者阵营，无控制者返回null
 */
export function calculateAreaController(area: AreaState, players: Player[]): Faction | null {
  // 统计各方标记数
  const attackerTokens = area.tokens.filter(t => {
    const owner = players.find(p => p.id === t.owner);
    return owner?.faction === 'attacker';
  }).length;
  const defenderTokens = area.tokens.filter(t => {
    const owner = players.find(p => p.id === t.owner);
    return owner?.faction === 'defender';
  }).length;
  
  // 控制判定：己方标记数 > 对方标记数
  if (attackerTokens > defenderTokens) {
    return 'attacker';
  } else if (defenderTokens > attackerTokens) {
    return 'defender';
  }
  
  // 相等或无标记则无控制者
  return null;
}

/**
 * 计算所有区域的控制状态
 * @param areas 所有区域状态
 * @param players 所有玩家
 * @returns 更新后的区域状态
 */
export function updateAllAreaControls(
  areas: Record<AreaType, AreaState>,
  players: Player[]
): Record<AreaType, AreaState> {
  const updatedAreas = { ...areas };
  
  (Object.keys(areas) as AreaType[]).forEach(areaType => {
    const area = areas[areaType];
    const controller = calculateAreaController(area, players);
    
    const attackerTokens = area.tokens.filter(t => {
      const owner = players.find(p => p.id === t.owner);
      return owner?.faction === 'attacker';
    }).length;
    const defenderTokens = area.tokens.filter(t => {
      const owner = players.find(p => p.id === t.owner);
      return owner?.faction === 'defender';
    }).length;
    
    updatedAreas[areaType] = {
      ...area,
      controlledBy: controller,
      controlStrength: Math.abs(attackerTokens - defenderTokens)
    };
  });
  
  return updatedAreas;
}

/**
 * 计算玩家所有控制区域的加成总和
 * @param faction 玩家阵营
 * @param areas 所有区域状态
 * @returns 总加成
 */
export function calculateTotalAreaBonus(
  faction: Faction,
  areas: Record<AreaType, AreaState>
): {
  infiltrationBonus: number;
  safetyBonus: number;
  actionPointBonus: number;
  controlledAreas: AreaType[];
} {
  let infiltrationBonus = 0;
  let safetyBonus = 0;
  let actionPointBonus = 0;
  const controlledAreas: AreaType[] = [];
  
  (Object.keys(areas) as AreaType[]).forEach(areaType => {
    const area = areas[areaType];
    
    if (area.controlledBy === faction) {
      controlledAreas.push(areaType);
      const bonus = AREA_BONUSES[areaType];
      
      if (faction === 'attacker') {
        infiltrationBonus += bonus.infiltrationBonus;
      } else {
        safetyBonus += bonus.safetyBonus;
      }
      
      actionPointBonus += bonus.actionPointBonus;
    }
  });
  
  return {
    infiltrationBonus,
    safetyBonus,
    actionPointBonus,
    controlledAreas
  };
}

/**
 * 应用区域控制加成到玩家
 * @param faction 玩家阵营
 * @param areas 所有区域状态
 * @returns 加成描述和数值
 */
export function applyAreaControlBonus(
  faction: Faction,
  areas: Record<AreaType, AreaState>
): {
  message: string;
  infiltrationBonus: number;
  safetyBonus: number;
  actionPointBonus: number;
} {
  const bonus = calculateTotalAreaBonus(faction, areas);
  
  const messages: string[] = [];
  if (bonus.infiltrationBonus > 0) {
    messages.push(`渗透+${bonus.infiltrationBonus}`);
  }
  if (bonus.safetyBonus > 0) {
    messages.push(`安全+${bonus.safetyBonus}`);
  }
  if (bonus.actionPointBonus > 0) {
    messages.push(`行动点+${bonus.actionPointBonus}`);
  }
  
  const factionName = faction === 'attacker' ? '进攻方' : '防御方';
  const message = messages.length > 0 
    ? `[${factionName}] 区域控制加成：${messages.join('，')}`
    : `[${factionName}] 无区域控制加成`;
  
  return {
    message,
    infiltrationBonus: bonus.infiltrationBonus,
    safetyBonus: bonus.safetyBonus,
    actionPointBonus: bonus.actionPointBonus
  };
}

/**
 * 获取区域名称（中文）
 * @param areaType 区域类型
 * @returns 区域中文名称
 */
export function getAreaName(areaType: AreaType): string {
  const names: Record<AreaType, string> = {
    perimeter: '网络边界',
    dmz: '隔离区',
    internal: '内网',
    ics: '工控系统'
  };
  return names[areaType];
}

/**
 * 检查区域是否为某方优势区域 (R3.3)
 * @param areaType 区域类型
 * @param faction 阵营
 * @returns 是否为优势区域
 */
export function isAdvantageousArea(areaType: AreaType, faction: Faction): boolean {
  const advantageousAreas: Record<Faction, AreaType[]> = {
    attacker: ['perimeter', 'ics'],
    defender: ['internal']
  };
  
  return advantageousAreas[faction].includes(areaType);
}
