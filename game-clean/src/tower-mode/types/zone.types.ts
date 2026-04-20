export type ZoneType = 'W' | 'N' | 'I' | 'P' | 'S' | 'D';

export type EffectTarget = 'self' | 'enemy' | 'global';

export interface ZoneEffectConfig {
  effectType: 'dice_modifier' | 'resource_change' | 'map_effect' | 'special_grant';
  target: EffectTarget;
  magnitude: number;
  duration?: number;
  stackable: boolean;
  priority: number;
}

export interface ZoneVisualConfig {
  overlayColor: string;
  overlayOpacity: number;
  iconLabel: string;
  borderStyle?: string;
  animationClass?: string;
  particleEffectId?: string;
}

export interface ZoneDefinition {
  id: string;
  type: ZoneType;
  name: string;
  description: string;
  cellIds: string[];
  effect: ZoneEffectConfig;
  visualConfig: ZoneVisualConfig;
  maxTriggers?: number;
  cooldownTurns?: number;
  currentTriggerCount: number;
  lastTriggerTurn?: number;
}
