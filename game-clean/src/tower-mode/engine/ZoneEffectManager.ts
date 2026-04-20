import type { Coordinate2D, TowerLayerData, ZoneType } from '../types';

export const ZONE_PRIORITY_ORDER: ZoneType[] = ['D', 'I', 'P', 'W', 'S', 'N'];

export interface ZoneEffectConfig {
  effectType: string;
  magnitude: number;
  description: string;
  globalMaxTriggers?: number;
  cooldownTurns?: number;
}

export const ZONE_EFFECT_CONFIG: Record<ZoneType, ZoneEffectConfig> = {
  W: { effectType: 'dice_modifier', magnitude: -1, description: '虚弱区：骰子-1' },
  N: { effectType: 'resource_gain', magnitude: 1, description: '资源区：获得资源' },
  I: { effectType: 'map_inversion', magnitude: 1, description: '反转区：地图倒置' },
  P: { effectType: 'skip_turn', magnitude: 1, description: '暂停区：跳过回合' },
  S: { effectType: 'dice_modifier', magnitude: 1, description: '强化区：骰子+1' },
  D: { effectType: 'tech_penalty', magnitude: -10, description: '危险区：扣技术值' },
};

export interface Book {
  id: string;
  name: string;
  author: string;
  coverTheme: string;
  tier: number;
  theme: string;
  quality: string;
  effectType: string;
  effectDescription: string;
  flavorText: string;
  isRead: boolean;
}

export interface ZoneEffectContext {
  playerId: string;
  currentHp: number;
  maxHp: number;
  cardCount: number;
  goldCount: number;
  hasImmunity: boolean;
  skillResistances: Set<ZoneType>;
  bookPool: Book[];
}

export interface TriggeredZoneEffect {
  zoneId: string;
  zoneType: ZoneType;
  effectApplied: boolean;
  effectDetail: string;
}

export interface ResourceChange {
  type: string;
  amount: number;
}

export interface SpecialEffectResult {
  type: string;
  data: Record<string, unknown>;
}

export interface GlobalEffectResult {
  type: string;
  active: boolean;
  remainingTurns: number;
}

export interface ZoneApplicationResult {
  diceModifier: number;
  triggeredZones: TriggeredZoneEffect[];
  resourceChanges: ResourceChange[];
  specialEffects: SpecialEffectResult[];
  globalEffects: GlobalEffectResult[];
}

export interface ZoneStatistics {
  totalZones: number;
  triggeredCounts: Record<ZoneType, number>;
}

export interface ZoneDefinition {
  id: string;
  type: ZoneType;
  name: string;
  description: string;
  cellIds: string[];
  effect: {
    effectType: string;
    target: string;
    magnitude: number;
    stackable: boolean;
    priority: number;
  };
  currentTriggerCount: number;
}

export class ZoneEffectManager {
  private zones: Map<string, ZoneDefinition> = new Map();
  private triggerCounts: Map<ZoneType, number> = new Map();
  private config: Record<ZoneType, ZoneEffectConfig>;

  constructor(zones: ZoneDefinition[], config: Record<ZoneType, ZoneEffectConfig> = ZONE_EFFECT_CONFIG) {
    this.config = config;
    for (const zone of zones) {
      this.zones.set(zone.id, zone);
    }
    for (const type of ZONE_PRIORITY_ORDER) {
      this.triggerCounts.set(type, 0);
    }
  }

  detectZonesAtPosition(position: Coordinate2D, layerData: TowerLayerData): ZoneDefinition[] {
    const result: ZoneDefinition[] = [];
    const [row, col] = position;
    const cellKey = `${row},${col}`;
    const cell = layerData.cellIndex?.[cellKey];

    if (!cell) return result;

    for (const [_, zone] of this.zones) {
      if (zone.cellIds.includes(cellKey) || zone.cellIds.includes(cell.id)) {
        result.push(zone);
      }
    }

    return result;
  }

  applyEffectsOnEnter(
    position: Coordinate2D,
    layerData: TowerLayerData,
    turnNumber: number,
    context?: Partial<ZoneEffectContext>
  ): ZoneApplicationResult {
    const zones = this.detectZonesAtPosition(position, layerData);
    const result: ZoneApplicationResult = {
      diceModifier: 0,
      triggeredZones: [],
      resourceChanges: [],
      specialEffects: [],
      globalEffects: [],
    };

    for (const zone of zones) {
      const config = this.config[zone.type];
      const triggered: TriggeredZoneEffect = {
        zoneId: zone.id,
        zoneType: zone.type,
        effectApplied: true,
        effectDetail: config.description,
      };

      switch (zone.type) {
        case 'W':
          result.diceModifier += config.magnitude;
          break;
        case 'S':
          result.diceModifier += config.magnitude;
          break;
        case 'N':
          result.resourceChanges.push({ type: 'gold', amount: config.magnitude });
          break;
        case 'D':
          result.resourceChanges.push({ type: 'tech', amount: config.magnitude });
          break;
        case 'I':
          result.specialEffects.push({ type: 'map_inversion', data: { active: true } });
          break;
        case 'P':
          result.specialEffects.push({ type: 'skip_turn', data: { turns: 1 } });
          break;
      }

      this.triggerCounts.set(zone.type, (this.triggerCounts.get(zone.type) ?? 0) + 1);
      result.triggeredZones.push(triggered);
    }

    return result;
  }

  getDiceModifier(position: Coordinate2D, layerData: TowerLayerData): number {
    const zones = this.detectZonesAtPosition(position, layerData);
    let modifier = 0;

    for (const zone of zones) {
      const config = this.config[zone.type];
      if (zone.type === 'W' || zone.type === 'S') {
        modifier += config.magnitude;
      }
    }

    return modifier;
  }

  getZoneStatistics(): ZoneStatistics {
    const triggeredCounts: Record<ZoneType, number> = {
      W: 0, N: 0, I: 0, P: 0, S: 0, D: 0,
    };

    for (const [type, count] of this.triggerCounts) {
      triggeredCounts[type] = count;
    }

    return {
      totalZones: this.zones.size,
      triggeredCounts,
    };
  }

  reset(): void {
    for (const type of ZONE_PRIORITY_ORDER) {
      this.triggerCounts.set(type, 0);
    }
    for (const [_, zone] of this.zones) {
      zone.currentTriggerCount = 0;
    }
  }
}

export type {
  ZoneType,
  Coordinate2D,
  TowerLayerData,
};
