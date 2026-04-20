import { AreaEffectType } from '../types/grid.types';
import type { GourdMapParameters } from '../types/grid.types';

export interface LayerMapTemplate {
  layer: number;
  name: string;
  theme: string;
  gourdParams: GourdMapParameters;
  gridConfig: {
    totalCells: number;
    levelGrids: number;
    opportunityGrids: number;
    eliteRatio: number;
  };
  areaConfig: {
    upperAreaEffects: Array<{ type: AreaEffectType; ratio: number }>;
    lowerQuadrantEffects: [AreaEffectType, AreaEffectType, AreaEffectType, AreaEffectType];
  };
  specialMechanism: {
    type: string;
    description: string;
    implementation: string;
  };
}

export const LAYER_MAP_TEMPLATES: Record<number, LayerMapTemplate> = {
  1: {
    layer: 1,
    name: '病毒实验室',
    theme: '病毒与恶意软件',
    gourdParams: {
      upperRadius: 15,
      lowerRadius: 35,
      connectorWidth: 8,
      upperCenterY: 20,
      lowerCenterY: 70,
      upperEccentricity: 0.15,
      lowerEccentricity: 0.05,
      rotation: 0,
    },
    gridConfig: {
      totalCells: 20,
      levelGrids: 12,
      opportunityGrids: 1,
      eliteRatio: 0.1,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.WEAK, ratio: 0.6 }],
      lowerQuadrantEffects: [
        AreaEffectType.WEAK,
        AreaEffectType.DANGER,
        AreaEffectType.WEAK,
        AreaEffectType.DANGER,
      ],
    },
    specialMechanism: {
      type: 'virus_spread',
      description: '病毒扩散型',
      implementation: '关卡格密度从上到下递增，W区域集中在下圆底部，存在回流路径',
    },
  },
  2: {
    layer: 2,
    name: '网络空间',
    theme: '网络攻击与防御',
    gourdParams: {
      upperRadius: 20,
      lowerRadius: 30,
      connectorWidth: 10,
      upperCenterY: 22,
      lowerCenterY: 68,
      upperEccentricity: 0.1,
      lowerEccentricity: 0.1,
      rotation: 0,
    },
    gridConfig: {
      totalCells: 34,
      levelGrids: 22,
      opportunityGrids: 2,
      eliteRatio: 0.12,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.SPEED, ratio: 0.5 }],
      lowerQuadrantEffects: [
        AreaEffectType.SPEED,
        AreaEffectType.KNOWLEDGE,
        AreaEffectType.SKIP,
        AreaEffectType.DANGER,
      ],
    },
    specialMechanism: {
      type: 'dual_ring',
      description: '双环形拓扑',
      implementation: '上下圆各有独立环路，通过跨环连接互通',
    },
  },
  3: {
    layer: 3,
    name: '数据保险库',
    theme: '数据安全与加密技术',
    gourdParams: {
      upperRadius: 18,
      lowerRadius: 32,
      connectorWidth: 6,
      upperCenterY: 20,
      lowerCenterY: 70,
      upperEccentricity: 0.2,
      lowerEccentricity: 0.08,
      rotation: 0,
    },
    gridConfig: {
      totalCells: 25,
      levelGrids: 16,
      opportunityGrids: 1,
      eliteRatio: 0.15,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.KNOWLEDGE, ratio: 0.7 }],
      lowerQuadrantEffects: [
        AreaEffectType.KNOWLEDGE,
        AreaEffectType.INVERT,
        AreaEffectType.WEAK,
        AreaEffectType.KNOWLEDGE,
      ],
    },
    specialMechanism: {
      type: 'concentric_fortress',
      description: '同心堡垒',
      implementation: '下圆分为同心圆层，每层有安全门格控制通行',
    },
  },
  4: {
    layer: 4,
    name: '城市街区',
    theme: '社会工程学与人因安全',
    gourdParams: {
      upperRadius: 16,
      lowerRadius: 36,
      connectorWidth: 12,
      upperCenterY: 18,
      lowerCenterY: 72,
      upperEccentricity: 0.05,
      lowerEccentricity: 0.15,
      rotation: 0,
    },
    gridConfig: {
      totalCells: 32,
      levelGrids: 20,
      opportunityGrids: 2,
      eliteRatio: 0.15,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.SKIP, ratio: 0.4 }],
      lowerQuadrantEffects: [
        AreaEffectType.SKIP,
        AreaEffectType.DANGER,
        AreaEffectType.INVERT,
        AreaEffectType.SKIP,
      ],
    },
    specialMechanism: {
      type: 'grid_city',
      description: '网格城市街区',
      implementation: '下圆四象限各为独立街区，象限间有检查站格',
    },
  },
  5: {
    layer: 5,
    name: '智能工厂',
    theme: '工业物联网安全',
    gourdParams: {
      upperRadius: 14,
      lowerRadius: 34,
      connectorWidth: 9,
      upperCenterY: 20,
      lowerCenterY: 70,
      upperEccentricity: 0.12,
      lowerEccentricity: 0.1,
      rotation: 5,
    },
    gridConfig: {
      totalCells: 28,
      levelGrids: 18,
      opportunityGrids: 1,
      eliteRatio: 0.18,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.DANGER, ratio: 0.5 }],
      lowerQuadrantEffects: [
        AreaEffectType.DANGER,
        AreaEffectType.WEAK,
        AreaEffectType.SPEED,
        AreaEffectType.DANGER,
      ],
    },
    specialMechanism: {
      type: 'production_tree',
      description: '生产树',
      implementation: '格子按生产流程树状排列，分支路径通向不同产出',
    },
  },
  6: {
    layer: 6,
    name: '移动终端',
    theme: '移动设备与应用安全',
    gourdParams: {
      upperRadius: 17,
      lowerRadius: 33,
      connectorWidth: 7,
      upperCenterY: 19,
      lowerCenterY: 71,
      upperEccentricity: 0.08,
      lowerEccentricity: 0.12,
      rotation: -3,
    },
    gridConfig: {
      totalCells: 37,
      levelGrids: 24,
      opportunityGrids: 2,
      eliteRatio: 0.2,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.SPEED, ratio: 0.6 }],
      lowerQuadrantEffects: [
        AreaEffectType.SPEED,
        AreaEffectType.INVERT,
        AreaEffectType.KNOWLEDGE,
        AreaEffectType.WEAK,
      ],
    },
    specialMechanism: {
      type: 'hexagonal_honeycomb',
      description: '六边形蜂窝',
      implementation: '格子按六边形蜂窝排列，每个格子最多6个邻居',
    },
  },
  7: {
    layer: 7,
    name: '云端平台',
    theme: '云计算与虚拟化安全',
    gourdParams: {
      upperRadius: 22,
      lowerRadius: 28,
      connectorWidth: 11,
      upperCenterY: 22,
      lowerCenterY: 68,
      upperEccentricity: 0.18,
      lowerEccentricity: 0.2,
      rotation: 8,
    },
    gridConfig: {
      totalCells: 24,
      levelGrids: 15,
      opportunityGrids: 1,
      eliteRatio: 0.22,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.INVERT, ratio: 0.4 }],
      lowerQuadrantEffects: [
        AreaEffectType.INVERT,
        AreaEffectType.KNOWLEDGE,
        AreaEffectType.SKIP,
        AreaEffectType.DANGER,
      ],
    },
    specialMechanism: {
      type: 'irregular_cloud',
      description: '不规则云',
      implementation: '上下圆偏心率较大，格子分布不规则，捷径较多',
    },
  },
  8: {
    layer: 8,
    name: '未来实验室',
    theme: 'AI与新兴技术安全',
    gourdParams: {
      upperRadius: 19,
      lowerRadius: 31,
      connectorWidth: 8,
      upperCenterY: 21,
      lowerCenterY: 69,
      upperEccentricity: 0.15,
      lowerEccentricity: 0.15,
      rotation: -5,
    },
    gridConfig: {
      totalCells: 22,
      levelGrids: 13,
      opportunityGrids: 1,
      eliteRatio: 0.25,
    },
    areaConfig: {
      upperAreaEffects: [
        { type: AreaEffectType.INVERT, ratio: 0.3 },
        { type: AreaEffectType.DANGER, ratio: 0.3 },
      ],
      lowerQuadrantEffects: [
        AreaEffectType.DANGER,
        AreaEffectType.INVERT,
        AreaEffectType.DANGER,
        AreaEffectType.SKIP,
      ],
    },
    specialMechanism: {
      type: 'quantum_cloud',
      description: '量子云',
      implementation: '部分路径随机切换连通性，I区域影响地图显示',
    },
  },
  9: {
    layer: 9,
    name: '指挥中心',
    theme: '安全运营中心(SOC)与管理',
    gourdParams: {
      upperRadius: 25,
      lowerRadius: 25,
      connectorWidth: 15,
      upperCenterY: 25,
      lowerCenterY: 65,
      upperEccentricity: 0.0,
      lowerEccentricity: 0.0,
      rotation: 0,
    },
    gridConfig: {
      totalCells: 39,
      levelGrids: 25,
      opportunityGrids: 1,
      eliteRatio: 0.3,
    },
    areaConfig: {
      upperAreaEffects: [{ type: AreaEffectType.DANGER, ratio: 0.8 }],
      lowerQuadrantEffects: [
        AreaEffectType.DANGER,
        AreaEffectType.DANGER,
        AreaEffectType.DANGER,
        AreaEffectType.DANGER,
      ],
    },
    specialMechanism: {
      type: 'symmetric_throne',
      description: '对称王座厅',
      implementation: '上下圆等径正圆，格子高度对称分布，Boss格位于正中心',
    },
  },
};
