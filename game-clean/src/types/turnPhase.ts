/**
 * 《道高一丈：数字博弈》v11.0 - 回合阶段类型定义
 * 
 * 7阶段回合系统：判定→恢复→摸牌→行动→响应→弃牌→结束
 */

/**
 * 回合阶段类型
 */
export type TurnPhase = 
  | 'judgment'   // 判定阶段
  | 'recovery'   // 恢复阶段
  | 'draw'       // 摸牌阶段
  | 'action'     // 行动阶段
  | 'response'   // 响应阶段
  | 'discard'    // 弃牌阶段
  | 'end';       // 结束阶段

/**
 * 阶段顺序（严格按此顺序执行）
 */
export const PHASE_ORDER: TurnPhase[] = [
  'judgment',
  'recovery',
  'draw',
  'action',
  'response',
  'discard',
  'end'
];

/**
 * 阶段配置
 */
export interface PhaseConfig {
  phase: TurnPhase;
  name: string;
  description: string;
  autoProceed: boolean;      // 是否自动进入下一阶段
  timeLimit?: number;        // 阶段时间限制（秒）
  canUseCards: boolean;      // 是否可以使用卡牌
  canUseSkills: boolean;     // 是否可以使用技能
}

/**
 * 阶段配置表
 */
export const PHASE_CONFIGS: Record<TurnPhase, PhaseConfig> = {
  judgment: {
    phase: 'judgment',
    name: '判定阶段',
    description: '执行待处理的判定',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  },
  recovery: {
    phase: 'recovery',
    name: '恢复阶段',
    description: '恢复行动点和资源',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  },
  draw: {
    phase: 'draw',
    name: '摸牌阶段',
    description: '从牌库抽取卡牌',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  },
  action: {
    phase: 'action',
    name: '行动阶段',
    description: '打出卡牌和使用技能',
    autoProceed: false,
    timeLimit: 60,
    canUseCards: true,
    canUseSkills: true
  },
  response: {
    phase: 'response',
    name: '响应阶段',
    description: '响应其他玩家的行动',
    autoProceed: false,
    timeLimit: 10,
    canUseCards: true,
    canUseSkills: true
  },
  discard: {
    phase: 'discard',
    name: '弃牌阶段',
    description: '弃置超额手牌',
    autoProceed: false,
    timeLimit: 15,
    canUseCards: false,
    canUseSkills: false
  },
  end: {
    phase: 'end',
    name: '结束阶段',
    description: '结算结束效果',
    autoProceed: true,
    canUseCards: false,
    canUseSkills: false
  }
};

/**
 * 阶段执行结果
 */
export interface PhaseExecutionResult {
  success: boolean;
  phase: TurnPhase;
  nextPhase: TurnPhase | null;
  gameState: any; // GameState
  logs: string[];
}

/**
 * 恢复阶段配置
 */
export interface RecoveryConfig {
  actionPoints: number;      // 行动点恢复值
  compute: number;           // 算力恢复值
  funds: number;             // 资金恢复值
  information: number;       // 信息恢复值
}

/**
 * 各阵营恢复配置（v11.0调整：每回合信息+2，算力+2，资金+2）
 */
export const FACTION_RECOVERY: Record<string, RecoveryConfig> = {
  attack: {
    actionPoints: 3,
    compute: 2,        // 算力+2
    funds: 2,          // 资金+2
    information: 2     // 信息+2
  },
  defense: {
    actionPoints: 3,
    compute: 2,        // 算力+2
    funds: 2,          // 资金+2
    information: 2     // 信息+2
  }
};

/**
 * 摸牌阶段配置
 */
export interface DrawPhaseConfig {
  baseDraw: number;          // 基础抽牌数
  extraDrawWhenEmpty: number; // 手牌为空时额外抽牌
}

/**
 * v11.0摸牌配置：保留原有每回合抽4张
 */
export const DRAW_PHASE_CONFIG: DrawPhaseConfig = {
  baseDraw: 4,               // 基础抽4张
  extraDrawWhenEmpty: 0      // 手牌为空时不额外抽牌
};

/**
 * 弃牌阶段配置
 */
export interface DiscardPhaseConfig {
  maxHandSize: number;       // 手牌上限
}

/**
 * v11.0弃牌配置：手牌上限1张
 */
export const DISCARD_PHASE_CONFIG: DiscardPhaseConfig = {
  maxHandSize: 1             // 手牌上限1张
};
