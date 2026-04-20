import type { ThemeCategory } from './cell.types';

export type BookQuality = 'common' | 'uncommon' | 'rare';

export type BookEffectType =
  | 'buff_combat'
  | 'buff_draw'
  | 'buff_resource'
  | 'passive_info'
  | 'special_ability'
  | 'healing'
  | 'resistance';

export interface Book {
  id: string;
  name: string;
  author: string;
  coverTheme: string;
  tier: number;
  theme: ThemeCategory;
  quality: BookQuality;
  effectType: BookEffectType;
  effectDescription: string;
  flavorText: string;
  isRead: boolean;
}
