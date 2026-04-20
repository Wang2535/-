export { LAYER_01_DATA } from './layers/layer1-virus-lab';
export { LAYER_02_DATA } from './layers/layer2-cyberspace';
export { LAYER_03_DATA } from './layers/layer3-data-vault';
export { LAYER_04_DATA } from './layers/layer4-grid-city';
export { LAYER_05_DATA } from './layers/layer5-smart-factory';
export { LAYER_06_DATA } from './layers/layer6-mobile-terminal';
export { LAYER_07_DATA } from './layers/layer7-cloud-platform';
export { LAYER_08_DATA } from './layers/layer8-future-lab';
export { LAYER_09_DATA } from './layers/layer9-command-center';

export {
  LAYER_REGISTRY,
  getLayerData,
  getAllLayers,
  validateLayerData,
} from './layerRegistry';

export type {
  TowerLayerData,
  GameCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  PathConnection,
  ZoneDefinition,
  ZoneType,
  LayerColorScheme,
  AmbientConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './layerRegistry';
