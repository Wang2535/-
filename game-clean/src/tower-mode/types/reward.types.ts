import type { ThemeCategory } from './cell.types';

export type RarityLevel = 'common' | 'uncommon' | 'rare';

export type PacketEffectType =
  | 'buff_combat'
  | 'buff_draw'
  | 'buff_resource'
  | 'passive_info'
  | 'special_ability'
  | 'healing'
  | 'resistance';

export interface PacketEffectDetail {
  triggerCondition?: string;
  effectValue: number | string;
  isPermanent: boolean;
  stackable: boolean;
  conflictsWith?: string[];
}

export interface DataPacket {
  id: string;
  name: string;
  description: string;
  iconDescription: string;
  tier: number;
  theme: ThemeCategory;
  rarity: RarityLevel;
  effectType: PacketEffectType;
  effect: PacketEffectDetail;
  flavorText: string;
}
