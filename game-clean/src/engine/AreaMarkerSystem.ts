/**
 * 《道高一丈：数字博弈》v17.0 - 区域控制标记系统
 * 
 * 功能：实现威胁标记、防御标记、光环标志的区域控制机制
 * 规则依据：完善的游戏规则.md R3.0、R7.3
 */

import { gameLogger } from './GameLogger';

/**
 * 区域类型
 */
export type AreaType = 'perimeter' | 'dmz' | 'internal' | 'ics';

/**
 * 标记类型
 */
export type MarkerType = 'threat' | 'defense' | 'aura';

/**
 * 阵营类型
 */
export type Faction = 'attacker' | 'defender';

/**
 * 区域标记
 */
export interface AreaMarker {
  id: string;
  type: MarkerType;
  faction: Faction;
  area: AreaType;
  placedAt: number;
  effect?: string;
}

/**
 * 区域状态
 */
export interface AreaState {
  area: AreaType;
  markers: AreaMarker[];
  controller: Faction | null;
  auraCard: string | null;
}

/**
 * 区域控制效果
 */
export interface AreaControlEffect {
  area: AreaType;
  controller: Faction;
  effect: {
    type: 'infiltration' | 'safety' | 'action_point' | 'resource';
    value: number;
    description: string;
  };
}

/**
 * 区域配置
 */
const AREA_CONFIG: Record<AreaType, { name: string; description: string; baseEffect: string }> = {
  perimeter: {
    name: '网络边界',
    description: '第一道防线，渗透难度较低',
    baseEffect: '控制时渗透+1/安全+1',
  },
  dmz: {
    name: '隔离区',
    description: '缓冲区域，资源获取优势',
    baseEffect: '控制时行动点+1',
  },
  internal: {
    name: '内网',
    description: '核心区域，防御方优势',
    baseEffect: '控制时安全+2（防御方优势）',
  },
  ics: {
    name: '工控系统',
    description: '最关键区域，高价值目标',
    baseEffect: '控制时渗透+2/安全+2',
  },
};

/**
 * 区域标记系统
 */
export class AreaMarkerSystem {
  private areas: Map<AreaType, AreaState> = new Map();
  private markerCounter: number = 0;

  constructor() {
    this.initializeAreas();
  }

  private initializeAreas(): void {
    const areaTypes: AreaType[] = ['perimeter', 'dmz', 'internal', 'ics'];
    areaTypes.forEach(area => {
      this.areas.set(area, {
        area,
        markers: [],
        controller: null,
        auraCard: null,
      });
    });
  }

  placeMarker(
    area: AreaType,
    type: MarkerType,
    faction: Faction,
    currentTurn: number,
    effect?: string
  ): AreaMarker {
    const marker: AreaMarker = {
      id: `marker_${++this.markerCounter}`,
      type,
      faction,
      area,
      placedAt: currentTurn,
      effect,
    };

    const areaState = this.areas.get(area)!;
    areaState.markers.push(marker);

    if (type === 'aura') {
      areaState.auraCard = marker.id;
    }

    this.recalculateControl(area);

    gameLogger.info('AREA', `放置标记`, {
      markerId: marker.id,
      area,
      type,
      faction,
      currentTurn,
    });

    return marker;
  }

  removeMarker(markerId: string): boolean {
    for (const [areaType, areaState] of this.areas) {
      const index = areaState.markers.findIndex(m => m.id === markerId);
      if (index !== -1) {
        const marker = areaState.markers[index];
        areaState.markers.splice(index, 1);

        if (marker.type === 'aura' && areaState.auraCard === markerId) {
          areaState.auraCard = null;
        }

        this.recalculateControl(areaType);

        gameLogger.info('AREA', `移除标记`, {
          markerId,
          area: areaType,
        });

        return true;
      }
    }
    return false;
  }

  clearArea(area: AreaType, faction?: Faction): number {
    const areaState = this.areas.get(area)!;
    let removedCount = 0;

    if (faction) {
      const markersToRemove = areaState.markers.filter(m => m.faction === faction);
      markersToRemove.forEach(m => this.removeMarker(m.id));
      removedCount = markersToRemove.length;
    } else {
      removedCount = areaState.markers.length;
      areaState.markers = [];
      areaState.auraCard = null;
      areaState.controller = null;
    }

    gameLogger.info('AREA', `清除区域标记`, {
      area,
      faction: faction || 'all',
      removedCount,
    });

    return removedCount;
  }

  moveMarker(markerId: string, targetArea: AreaType): boolean {
    for (const [_, areaState] of this.areas) {
      const marker = areaState.markers.find(m => m.id === markerId);
      if (marker) {
        areaState.markers = areaState.markers.filter(m => m.id !== markerId);
        this.recalculateControl(marker.area);

        marker.area = targetArea;
        const targetState = this.areas.get(targetArea)!;
        targetState.markers.push(marker);
        this.recalculateControl(targetArea);

        gameLogger.info('AREA', `移动标记`, {
          markerId,
          from: marker.area,
          to: targetArea,
        });

        return true;
      }
    }
    return false;
  }

  private recalculateControl(area: AreaType): void {
    const areaState = this.areas.get(area)!;
    const attackerCount = areaState.markers.filter(m => m.faction === 'attacker').length;
    const defenderCount = areaState.markers.filter(m => m.faction === 'defender').length;

    if (attackerCount > defenderCount) {
      areaState.controller = 'attacker';
    } else if (defenderCount > attackerCount) {
      areaState.controller = 'defender';
    } else {
      areaState.controller = null;
    }
  }

  getAreaState(area: AreaType): AreaState {
    return this.areas.get(area)!;
  }

  getAllAreaStates(): AreaState[] {
    return Array.from(this.areas.values());
  }

  getAreaControlEffect(area: AreaType): AreaControlEffect | null {
    const areaState = this.areas.get(area)!;
    if (!areaState.controller) return null;

    const effects: Record<AreaType, { type: 'infiltration' | 'safety' | 'action_point' | 'resource'; value: number; description: string }> = {
      perimeter: {
        type: areaState.controller === 'attacker' ? 'infiltration' : 'safety',
        value: 1,
        description: areaState.controller === 'attacker' ? '渗透+1' : '安全+1',
      },
      dmz: {
        type: 'action_point',
        value: 1,
        description: '行动点+1',
      },
      internal: {
        type: areaState.controller === 'attacker' ? 'infiltration' : 'safety',
        value: areaState.controller === 'attacker' ? 1 : 2,
        description: areaState.controller === 'attacker' ? '渗透+1' : '安全+2（防御方优势）',
      },
      ics: {
        type: areaState.controller === 'attacker' ? 'infiltration' : 'safety',
        value: 2,
        description: areaState.controller === 'attacker' ? '渗透+2' : '安全+2',
      },
    };

    return {
      area,
      controller: areaState.controller,
      effect: effects[area],
    };
  }

  getAllControlEffects(): AreaControlEffect[] {
    const effects: AreaControlEffect[] = [];
    for (const area of this.areas.keys()) {
      const effect = this.getAreaControlEffect(area);
      if (effect) {
        effects.push(effect);
      }
    }
    return effects;
  }

  placeAuraCard(area: AreaType, _cardId: string, faction: Faction, effect: string, currentTurn: number): AreaMarker {
    const areaState = this.areas.get(area)!;
    
    if (areaState.auraCard) {
      this.removeMarker(areaState.auraCard);
    }

    return this.placeMarker(area, 'aura', faction, currentTurn, effect);
  }

  getAuraEffect(area: AreaType): { effect: string; faction: Faction } | null {
    const areaState = this.areas.get(area)!;
    const auraMarker = areaState.markers.find(m => m.type === 'aura');
    
    if (auraMarker && auraMarker.effect) {
      return {
        effect: auraMarker.effect,
        faction: auraMarker.faction,
      };
    }
    return null;
  }

  countControlledAreas(faction: Faction): number {
    let count = 0;
    for (const areaState of this.areas.values()) {
      if (areaState.controller === faction) {
        count++;
      }
    }
    return count;
  }

  isControllingArea(area: AreaType, faction: Faction): boolean {
    const areaState = this.areas.get(area)!;
    return areaState.controller === faction;
  }

  getAreaConfig(area: AreaType): { name: string; description: string; baseEffect: string } {
    return AREA_CONFIG[area];
  }

  reset(): void {
    this.areas.clear();
    this.markerCounter = 0;
    this.initializeAreas();
    gameLogger.info('AREA', '区域标记系统已重置');
  }
}

export const areaMarkerSystem = new AreaMarkerSystem();

export default AreaMarkerSystem;
