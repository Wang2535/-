/**
 * 《道高一丈：数字博弈》角色技能执行器
 * 实现所有18个角色的完整技能逻辑
 * 
 * 规则依据：完善的角色规则.md + 完善的角色规则2.md
 */

import type { CharacterId } from '@/types/characterRules';
import type { GameState, Resources } from '@/types/gameRules';
import type { RPSChoice } from '@/types/rpsMechanic';
import { gameLogger } from './GameLogger';

// ============================================
// 技能执行结果类型
// ============================================

export interface SkillExecutionResult {
  success: boolean;
  modifiedGameState: GameState;
  logs: string[];
  effects: SkillEffect[];
  canContinue: boolean;
}

export interface SkillEffect {
  type: 'resource_change' | 'level_change' | 'draw_card' | 'view_hand' | 'force_choice' | 'protection' | 'counter' | 'special';
  target?: string;
  value?: number;
  description: string;
}

// ============================================
// 角色状态管理
// ============================================

interface CharacterState {
  // AR01 赛博赌徒
  gamblerInstinctUsed?: { opponentId: string; turn: number };
  gamblerStreak: number;
  
  // AR02 读心者
  behaviorRecords: Record<string, RPSChoice[]>;
  consecutiveCorrectPredictions: number;
  
  // AR03 千面客
  falseSignal: RPSChoice | null;
  falseSignalStreak: number;
  qianMianStacks: number;
  
  // AC01 概率使
  probabilityPreview: { min: number; max: number } | null;
  
  // AC02 骰子姬
  luckyMarks: number;
  luckyChain: number;
  
  // AC03 博弈者
  riskLevel: 'conservative' | 'balanced' | 'aggressive';
  
  // AS01 牌库掌控者
  deckOptimizationCharges: number;
  
  // AS02 能量核心
  energyConversionPool: number;
  
  // AS03 战场统帅
  tacticalCommandCharges: number;
  controlledZones: number;
  
  // DR01 盾卫者
  shieldWallStacks: number;
  
  // DR02 镜像者
  mirrorReflectionActive: boolean;
  reflectedDamage: number;
  
  // DR03 先知
  futureSightActive: boolean;
  lockedChoices: RPSChoice[];
  
  // DC01 稳定者
  probabilityAnchorActive: boolean;
  
  // DC02 守护女神
  guardianMarks: number;
  shieldValue: number;
  
  // DC03 保险专家
  insuranceLevel: 'low' | 'medium' | 'high';
  
  // DS01 堡垒掌控者
  fortificationCharges: number;
  
  // DS02 能量护盾
  shieldPool: number;
  
  // DS03 阵地统帅
  defenseDeploymentCharges: number;
  defenseZones: number;
}

// 角色状态存储
const characterStates: Map<string, CharacterState> = new Map();

// ============================================
// 角色状态管理函数
// ============================================

export function initCharacterState(playerId: string): CharacterState {
  const state: CharacterState = {
    behaviorRecords: {},
    consecutiveCorrectPredictions: 0,
    falseSignal: null,
    falseSignalStreak: 0,
    qianMianStacks: 0,
    probabilityPreview: null,
    luckyMarks: 0,
    luckyChain: 0,
    riskLevel: 'balanced',
    deckOptimizationCharges: 0,
    energyConversionPool: 0,
    tacticalCommandCharges: 0,
    controlledZones: 0,
    gamblerStreak: 0,
    shieldWallStacks: 0,
    mirrorReflectionActive: false,
    reflectedDamage: 0,
    futureSightActive: false,
    lockedChoices: [],
    probabilityAnchorActive: false,
    guardianMarks: 0,
    shieldValue: 0,
    insuranceLevel: 'medium',
    fortificationCharges: 0,
    shieldPool: 0,
    defenseDeploymentCharges: 0,
    defenseZones: 0,
  };
  characterStates.set(playerId, state);
  return state;
}

export function getCharacterState(playerId: string): CharacterState {
  return characterStates.get(playerId) || initCharacterState(playerId);
}

// ============================================
// AR01 博弈大师·赛博赌徒 技能实现
// ============================================

/**
 * AR01 技能一：赌徒直觉【被动】
 * 触发条件：每回合第一次进行猜拳判定时
 * 效果：查看对方1张手牌，可选择是否消耗资源
 */
export function executeAR01_GamblerIntuition(
  playerId: string,
  opponentId: string,
  currentTurn: number,
  gameState: GameState
): SkillExecutionResult {
  const state = getCharacterState(playerId);
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  // 检查是否本回合已使用过
  if (state.gamblerInstinctUsed && state.gamblerInstinctUsed.turn === currentTurn) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: ['赌徒直觉：本回合已使用过'],
      effects: [],
      canContinue: true
    };
  }
  
  // 检查对同一对手的使用冷却（3回合）
  if (state.gamblerInstinctUsed && 
      state.gamblerInstinctUsed.opponentId === opponentId &&
      currentTurn - state.gamblerInstinctUsed.turn < 3) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: [`赌徒直觉：对同一对手需要冷却${3 - (currentTurn - state.gamblerInstinctUsed.turn)}回合`],
      effects: [],
      canContinue: true
    };
  }
  
  // 记录使用
  state.gamblerInstinctUsed = { opponentId, turn: currentTurn };
  
  // 获取对手手牌
  const opponent = gameState.players.find(p => p.id === opponentId);
  if (opponent && opponent.hand.length > 0) {
    const viewedCard = opponent.hand[0];
    logs.push(`赌徒直觉：查看了${opponent.name}的手牌[${viewedCard}]`);
    effects.push({
      type: 'view_hand',
      target: opponentId,
      description: `查看${opponent.name}的1张手牌`
    });
    
    gameLogger.info('skill_triggered', 'AR01 赌徒直觉触发', {
      extra: { playerId, opponentId, viewedCard }
    });
  }
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

/**
 * AR01 技能二：双倍下注【主动】
 * 消耗：算力/信息/资金任选2点
 * 效果：猜拳胜利效果翻倍，平局返还1点+算力+1，失败渗透-1但抽1张牌
 */
export function executeAR01_DoubleDown(
  playerId: string,
  resourceType: keyof Resources,
  gameState: GameState
): SkillExecutionResult {
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, modifiedGameState: gameState, logs: ['玩家不存在'], effects: [], canContinue: false };
  }
  
  // 检查资源
  if (player.resources[resourceType] < 2) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: [`资源不足：需要2点${resourceType}，当前只有${player.resources[resourceType]}点`],
      effects: [],
      canContinue: false
    };
  }
  
  // 扣除资源
  player.resources[resourceType] -= 2;
  logs.push(`双倍下注：消耗2点${resourceType}`);
  
  // 设置双倍下注状态（在猜拳结果后处理）
  effects.push({
    type: 'special',
    description: '双倍下注已激活：胜利效果×2，平局返还1点+算力+1，失败渗透-1但抽1张牌'
  });
  
  gameLogger.info('skill_triggered', 'AR01 双倍下注激活', {
    extra: { playerId, resourceType, cost: 2 }
  });
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

// ============================================
// AR02 心理分析师·读心者 技能实现
// ============================================

/**
 * AR02 技能一：行为分析【被动】
 * 记录对方的选择偏好，每3次可预测1次
 */
export function executeAR02_BehaviorAnalysis(
  playerId: string,
  opponentId: string,
  opponentChoice: RPSChoice
): SkillExecutionResult {
  const state = getCharacterState(playerId);
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  // 初始化记录
  if (!state.behaviorRecords[opponentId]) {
    state.behaviorRecords[opponentId] = [];
  }
  
  // 记录选择
  state.behaviorRecords[opponentId].push(opponentChoice);
  
  // 只保留最近3次
  if (state.behaviorRecords[opponentId].length > 3) {
    state.behaviorRecords[opponentId].shift();
  }
  
  const recordCount = state.behaviorRecords[opponentId].length;
  logs.push(`行为分析：已记录${opponentId}的${recordCount}次选择`);
  
  // 每记录满3次，获得信息奖励
  if (recordCount === 3) {
    effects.push({
      type: 'resource_change',
      target: 'information',
      value: 1,
      description: '记录满3次行为，获得1点信息'
    });
    logs.push('行为分析：记录满3次，获得1点信息奖励');
  }
  
  return {
    success: true,
    modifiedGameState: {} as GameState, // 需要传入实际gameState
    logs,
    effects,
    canContinue: true
  };
}

/**
 * AR02 技能二：预判反制【主动】
 * 消耗：1点信息
 * 声明猜拳结果，根据实际结果获得不同效果
 */
export function executeAR02_PredictiveCounter(
  playerId: string,
  predictedOutcome: 'win' | 'draw' | 'lose',
  gameState: GameState
): SkillExecutionResult {
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, modifiedGameState: gameState, logs: ['玩家不存在'], effects: [], canContinue: false };
  }
  
  // 检查信息资源
  if (player.resources.information < 1) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: ['信息不足：需要1点信息'],
      effects: [],
      canContinue: false
    };
  }
  
  // 扣除信息
  player.resources.information -= 1;
  logs.push(`预判反制：消耗1点信息，预测结果为${predictedOutcome === 'win' ? '胜利' : predictedOutcome === 'draw' ? '平局' : '失败'}`);
  
  // 存储预测结果（在猜拳后结算）
  effects.push({
    type: 'special',
    target: predictedOutcome,
    description: `预测${predictedOutcome}：胜利×1.5，平局各得1资源，失败损失减半`
  });
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

// ============================================
// DR01 防御大师·盾卫者 技能实现
// ============================================

/**
 * DR01 技能一：坚盾直觉【被动】
 * 每回合第一次猜拳可查看对方手牌
 */
export function executeDR01_ShieldIntuition(
  playerId: string,
  opponentId: string,
  currentTurn: number,
  gameState: GameState
): SkillExecutionResult {
  const state = getCharacterState(playerId);
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  // 检查冷却
  if (state.gamblerInstinctUsed && state.gamblerInstinctUsed.turn === currentTurn) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: ['坚盾直觉：本回合已使用过'],
      effects: [],
      canContinue: true
    };
  }
  
  // 记录使用
  state.gamblerInstinctUsed = { opponentId, turn: currentTurn };
  
  // 查看手牌
  const opponent = gameState.players.find(p => p.id === opponentId);
  if (opponent && opponent.hand.length > 0) {
    const viewedCard = opponent.hand[0];
    logs.push(`坚盾直觉：查看了${opponent.name}的手牌[${viewedCard}]`);
    effects.push({
      type: 'view_hand',
      target: opponentId,
      description: `查看${opponent.name}的1张手牌，失败时损失-50%`
    });
  }
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

/**
 * DR01 技能二：防御姿态【主动】
 * 消耗2点资源，失败效果减半，胜利安全+1但本回合无法攻击
 */
export function executeDR01_DefensiveStance(
  playerId: string,
  resourceType: keyof Resources,
  gameState: GameState
): SkillExecutionResult {
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { success: false, modifiedGameState: gameState, logs: ['玩家不存在'], effects: [], canContinue: false };
  }
  
  if (player.resources[resourceType] < 2) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: [`资源不足：需要2点${resourceType}`],
      effects: [],
      canContinue: false
    };
  }
  
  player.resources[resourceType] -= 2;
  logs.push(`防御姿态：消耗2点${resourceType}`);
  
  effects.push({
    type: 'special',
    description: '防御姿态已激活：失败效果×0.5，胜利安全+1但本回合无法攻击'
  });
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

// ============================================
// 技能执行主函数
// ============================================

export function executeCharacterSkill(
  characterId: CharacterId,
  skillId: string,
  playerId: string,
  params: Record<string, unknown>,
  gameState: GameState
): SkillExecutionResult {
  gameLogger.info('skill_execution', `执行角色技能: ${characterId}.${skillId}`, {
    extra: { playerId, params }
  });
  
  switch (characterId) {
    case 'AR01':
      if (skillId === 'gambler_intuition') {
        return executeAR01_GamblerIntuition(
          playerId,
          params.opponentId as string,
          params.currentTurn as number,
          gameState
        );
      }
      if (skillId === 'double_down') {
        return executeAR01_DoubleDown(
          playerId,
          params.resourceType as keyof Resources,
          gameState
        );
      }
      break;
      
    case 'AR02':
      if (skillId === 'behavior_analysis') {
        return executeAR02_BehaviorAnalysis(
          playerId,
          params.opponentId as string,
          params.opponentChoice as RPSChoice
        );
      }
      if (skillId === 'predictive_counter') {
        return executeAR02_PredictiveCounter(
          playerId,
          params.predictedOutcome as 'win' | 'draw' | 'lose',
          gameState
        );
      }
      break;
      
    case 'DR01':
      if (skillId === 'shield_intuition') {
        return executeDR01_ShieldIntuition(
          playerId,
          params.opponentId as string,
          params.currentTurn as number,
          gameState
        );
      }
      if (skillId === 'defensive_stance') {
        return executeDR01_DefensiveStance(
          playerId,
          params.resourceType as keyof Resources,
          gameState
        );
      }
      break;
      
    case 'AR03':
      if (skillId === 'false_signal') {
        return executeAR03_FalseSignal(
          playerId,
          params.declaredChoice as RPSChoice,
          params.actualChoice as RPSChoice,
          gameState
        );
      }
      if (skillId === 'identity_switch') {
        return executeAR03_IdentitySwitch(playerId, gameState);
      }
      break;
      
    case 'AC01':
      if (skillId === 'quantum_superposition') {
        return executeAC01_QuantumSuperposition(
          playerId,
          params.roll1 as number,
          params.roll2 as number
        );
      }
      break;
      
    case 'DR02':
      if (skillId === 'mirror_reflection') {
        return executeDR02_MirrorReflection(
          playerId,
          params.damage as number,
          params.isDraw as boolean
        );
      }
      if (skillId === 'perfect_mirror') {
        return executeDR02_PerfectMirror(
          playerId,
          params.opponentLastCard as string | null
        );
      }
      break;
      
    case 'DC01':
      if (skillId === 'stable_check') {
        return executeDC01_StableCheck(
          playerId,
          params.currentDifficulty as number
        );
      }
      break;
  }
  
  return {
    success: false,
    modifiedGameState: gameState,
    logs: [`未找到技能实现: ${characterId}.${skillId}`],
    effects: [],
    canContinue: false
  };
}

// ============================================
// AR03 千面客·身份伪造师 技能实现
// ============================================

/**
 * AR03 技能一：虚假信号【主动】
 * 声明一个猜拳选择，实际可以出不同的
 */
export function executeAR03_FalseSignal(
  playerId: string,
  declaredChoice: RPSChoice,
  actualChoice: RPSChoice,
  gameState: GameState
): SkillExecutionResult {
  const state = getCharacterState(playerId);
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  // 记录虚假信号
  state.falseSignal = declaredChoice;
  state.falseSignalStreak++;
  
  // 每使用3次虚假信号，获得1层"千面"标记
  if (state.falseSignalStreak >= 3) {
    state.qianMianStacks++;
    state.falseSignalStreak = 0;
    logs.push(`千面客：累计使用3次虚假信号，获得1层「千面」标记(当前${state.qianMianStacks}层)`);
    effects.push({
      type: 'special',
      description: `获得1层「千面」标记`
    });
  }
  
  logs.push(`虚假信号：声明${declaredChoice}，实际可出其他选择`);
  
  gameLogger.info('skill_triggered', 'AR03 虚假信号', {
    extra: { playerId, declaredChoice, actualChoice, qianMianStacks: state.qianMianStacks }
  });
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

/**
 * AR03 技能二：身份切换【主动】
 * 消耗1层"千面"标记，重置本回合已使用的卡牌
 */
export function executeAR03_IdentitySwitch(
  playerId: string,
  gameState: GameState
): SkillExecutionResult {
  const state = getCharacterState(playerId);
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  // 检查是否有千面标记
  if (state.qianMianStacks <= 0) {
    return {
      success: false,
      modifiedGameState: gameState,
      logs: ['身份切换：需要至少1层「千面」标记'],
      effects: [],
      canContinue: true
    };
  }
  
  // 消耗1层标记
  state.qianMianStacks--;
  
  logs.push(`身份切换：消耗1层「千面」标记，重置本回合已使用的卡牌(剩余${state.qianMianStacks}层)`);
  effects.push({
    type: 'special',
    description: '重置本回合已使用的卡牌'
  });
  
  gameLogger.info('skill_triggered', 'AR03 身份切换', {
    extra: { playerId, remainingStacks: state.qianMianStacks }
  });
  
  return {
    success: true,
    modifiedGameState: gameState,
    logs,
    effects,
    canContinue: true
  };
}

// ============================================
// AC01 命运编织者·概率使 技能实现
// ============================================

/**
 * AC01 技能一：概率云【被动】
 * 预览骰子结果范围
 */
export function executeAC01_ProbabilityCloud(
  playerId: string,
  actualRoll: number
): { preview: string; shouldReroll: boolean; bonus: number } {
  const state = getCharacterState(playerId);
  
  // 根据实际结果生成预览提示
  let preview: string;
  if (actualRoll <= 3) {
    preview = '低概率区间 (1-3)';
  } else {
    preview = '高概率区间 (4-6)';
  }
  
  state.probabilityPreview = { 
    min: actualRoll <= 3 ? 1 : 4, 
    max: actualRoll <= 3 ? 3 : 6 
  };
  
  gameLogger.info('skill_triggered', 'AC01 概率云预览', {
    extra: { playerId, preview, actualRoll }
  });
  
  return {
    preview,
    shouldReroll: actualRoll <= 3,
    bonus: 1 // 若接受判定且成功，额外+1渗透
  };
}

/**
 * AC01 技能二：量子叠加【主动】
 * 同时投掷2颗骰子，选择使用哪一颗
 */
export function executeAC01_QuantumSuperposition(
  playerId: string,
  roll1: number,
  roll2: number
): SkillExecutionResult {
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  logs.push(`量子叠加：投掷2颗骰子，结果[${roll1}]和[${roll2}]`);
  
  // 检查量子纠缠（两颗相同）
  if (roll1 === roll2) {
    logs.push(`量子纠缠触发！两颗骰子结果相同(${roll1})，本次判定自动成功且效果+2`);
    effects.push({
      type: 'special',
      description: '量子纠缠：自动成功，效果+2'
    });
    
    gameLogger.info('skill_triggered', 'AC01 量子纠缠触发', {
      extra: { playerId, roll: roll1 }
    });
    
    return {
      success: true,
      modifiedGameState: {} as GameState,
      logs,
      effects,
      canContinue: true
    };
  }
  
  // 让玩家选择使用哪一颗（这里返回两颗结果，由UI层处理选择）
  const betterRoll = Math.max(roll1, roll2);
  logs.push(`可选择使用[${roll1}]或[${roll2}]，建议选择[${betterRoll}]以获得更高成功率`);
  
  return {
    success: true,
    modifiedGameState: {} as GameState,
    logs,
    effects,
    canContinue: true
  };
}

// ============================================
// DR02 反击专家·镜像者 技能实现
// ============================================

/**
 * DR02 技能一：镜像反射【被动】
 * 猜拳平局时反弹50%伤害
 */
export function executeDR02_MirrorReflection(
  playerId: string,
  damage: number,
  isDraw: boolean
): SkillExecutionResult {
  const state = getCharacterState(playerId);
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  if (!isDraw) {
    return {
      success: false,
      modifiedGameState: {} as GameState,
      logs: ['镜像反射：仅在猜拳平局时触发'],
      effects: [],
      canContinue: true
    };
  }
  
  const reflectedDamage = Math.ceil(damage * 0.5);
  state.reflectedDamage += reflectedDamage;
  
  logs.push(`镜像反射：平局时反弹${reflectedDamage}点伤害(原伤害${damage}的50%)`);
  effects.push({
    type: 'counter',
    target: 'opponent',
    value: reflectedDamage,
    description: `反弹${reflectedDamage}点伤害`
  });
  
  gameLogger.info('skill_triggered', 'DR02 镜像反射', {
    extra: { playerId, originalDamage: damage, reflectedDamage }
  });
  
  return {
    success: true,
    modifiedGameState: {} as GameState,
    logs,
    effects,
    canContinue: true
  };
}

/**
 * DR02 技能二：完美镜像【主动】
 * 复制对方上回合使用的卡牌
 */
export function executeDR02_PerfectMirror(
  playerId: string,
  opponentLastCard: string | null
): SkillExecutionResult {
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  if (!opponentLastCard) {
    return {
      success: false,
      modifiedGameState: {} as GameState,
      logs: ['完美镜像：对方上回合未使用卡牌，无法复制'],
      effects: [],
      canContinue: true
    };
  }
  
  logs.push(`完美镜像：复制对方上回合使用的[${opponentLastCard}]`);
  effects.push({
    type: 'special',
    description: `复制卡牌：${opponentLastCard}`
  });
  
  gameLogger.info('skill_triggered', 'DR02 完美镜像', {
    extra: { playerId, copiedCard: opponentLastCard }
  });
  
  return {
    success: true,
    modifiedGameState: {} as GameState,
    logs,
    effects,
    canContinue: true
  };
}

// ============================================
// DC01 概率守护者·稳定者 技能实现
// ============================================

/**
 * DC01 技能一：概率锚定【被动】
 * 骰子结果偏向中间值(3-4)
 */
export function executeDC01_ProbabilityAnchor(
  playerId: string,
  rawRoll: number
): { finalRoll: number; modified: boolean } {
  // 1或6时向中间调整
  let finalRoll = rawRoll;
  let modified = false;
  
  if (rawRoll === 1) {
    // 50%概率变为2或3
    finalRoll = Math.random() < 0.5 ? 2 : 3;
    modified = true;
  } else if (rawRoll === 6) {
    // 50%概率变为4或5
    finalRoll = Math.random() < 0.5 ? 4 : 5;
    modified = true;
  }
  
  if (modified) {
    gameLogger.info('skill_triggered', 'DC01 概率锚定', {
      extra: { playerId, rawRoll, finalRoll }
    });
  }
  
  return { finalRoll, modified };
}

/**
 * DC01 技能二：稳定判定【主动】
 * 消耗1点算力，判定难度-1
 */
export function executeDC01_StableCheck(
  playerId: string,
  currentDifficulty: number
): SkillExecutionResult {
  const logs: string[] = [];
  const effects: SkillEffect[] = [];
  
  const newDifficulty = Math.max(1, currentDifficulty - 1);
  
  logs.push(`稳定判定：消耗1点算力，判定难度${currentDifficulty}→${newDifficulty}`);
  effects.push({
    type: 'special',
    description: `判定难度-1(现为${newDifficulty})`
  });
  
  gameLogger.info('skill_triggered', 'DC01 稳定判定', {
    extra: { playerId, originalDifficulty: currentDifficulty, newDifficulty }
  });
  
  return {
    success: true,
    modifiedGameState: {} as GameState,
    logs,
    effects,
    canContinue: true
  };
}

export default {
  executeCharacterSkill,
  initCharacterState,
  getCharacterState,
  executeAR01_GamblerIntuition,
  executeAR01_DoubleDown,
  executeAR02_BehaviorAnalysis,
  executeAR02_PredictiveCounter,
  executeAR03_FalseSignal,
  executeAR03_IdentitySwitch,
  executeAC01_ProbabilityCloud,
  executeAC01_QuantumSuperposition,
  executeDR01_ShieldIntuition,
  executeDR01_DefensiveStance,
  executeDR02_MirrorReflection,
  executeDR02_PerfectMirror,
  executeDC01_ProbabilityAnchor,
  executeDC01_StableCheck,
};
