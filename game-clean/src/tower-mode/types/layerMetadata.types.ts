export interface LayerFeature {
  icon: string;
  text: string;
}

export interface LayerMetadata {
  name: string;
  shortName: string;
  color: string;
  theme: string;
  features: LayerFeature[];
  progress: number;
}

export interface HotspotConfig {
  bottom: number;
  height: number;
  width: number;
}

export type LayerUnlockState = 'locked' | 'unlocked' | 'completed';

export interface LayerState {
  unlocked: boolean;
  completed: boolean;
  progress: number;
}
