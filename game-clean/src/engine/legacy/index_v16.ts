/**
 * 《道高一丈：数字博弈》v16.0 引擎层索引
 * 统一导出所有v16.0重构后的引擎模块
 */

// ==================== 等级计算器 ====================
export * from './LevelCalculator';

// ==================== 效果引擎 ====================
export * from './EffectEngine';

// ==================== 版本信息 ====================
export const ENGINE_VERSION = '16.0.0';
export const ENGINE_VERSION_DATE = '2026-01-31';

// ==================== 引擎状态 ====================

export interface EngineStatus {
  version: string;
  modules: {
    levelCalculator: boolean;
    effectEngine: boolean;
  };
  ready: boolean;
}

/**
 * 获取引擎状态
 */
export function getEngineStatus(): EngineStatus {
  return {
    version: ENGINE_VERSION,
    modules: {
      levelCalculator: true,
      effectEngine: true
    },
    ready: true
  };
}

// ==================== 导出默认 ====================
export default {
  ENGINE_VERSION,
  ENGINE_VERSION_DATE,
  getEngineStatus
};
