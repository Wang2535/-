import type { XiaobaiCharacter, DadongAI } from '@/types/levelTypes';

export const XIAOBAI_CHARACTER: XiaobaiCharacter = {
  id: 'XIAOBAI',
  name: '小白',
  title: '网络安全新手',
  description: '一位刚踏入网络安全领域的新人，充满好奇心和学习热情。虽然经验尚浅，但拥有快速学习和适应的能力。在"大东"的指导下，逐步成长为网络安全专家。',
  avatarUrl: '/avatars/xiaobai.png',
  skills: [
    {
      id: 'XIAOBAI_S1',
      name: '快速学习',
      description: '每回合算力、信息、资金恢复量+1（永久+1，即每回合各获得3点）',
      type: 'passive',
      effect: 'resource_recovery_boost'
    },
    {
      id: 'XIAOBAI_S2',
      name: '勤奋努力',
      description: '行动点永久+1',
      type: 'passive',
      effect: 'action_point_boost'
    }
  ],
  baseStats: {
    computingRecovery: 3,
    fundsRecovery: 3,
    informationRecovery: 3,
    actionPoints: 5 // 第一关：5点行动点/回合
  }
};

export const DADONG_AI: DadongAI = {
  id: 'DADONG',
  name: '大东',
  title: '网络安全专家',
  description: '资深的网络安全专家，拥有丰富的实战经验。作为小白的导师和战友，在关卡模式中与小白并肩作战，共同抵御网络攻击。',
  behavior: {
    cardsPerTurn: 2, // 手牌数：2张
    cardsToPlay: 1,
    ignoreResourceCost: true,
    cooperationBonus: 1
  },
  skills: [
    {
      id: 'DADONG_KNOWLEDGE',
      name: '安全知识讲解',
      type: 'special',
      description: '每回合为玩家讲解网络安全知识，玩家阅读完毕后获得随机资源+1',
      cooldown: 1,
      maxCooldown: 1
    }
  ],
  // 第一关配置
  level1Config: {
    actionPoints: 3, // 行动点：3点/回合
    handSize: 2, // 手牌数：2张
    specialAbility: '安全知识讲解——每回合可以为一名友方角色恢复1行动点'
  }
};

export function getXiaobaiCharacter(): XiaobaiCharacter {
  return XIAOBAI_CHARACTER;
}

export function getDadongAI(): DadongAI {
  return DADONG_AI;
}

export function getXiaobaiResourceRecovery(): { computing: number; funds: number; information: number } {
  return {
    computing: XIAOBAI_CHARACTER.baseStats.computingRecovery,
    funds: XIAOBAI_CHARACTER.baseStats.fundsRecovery,
    information: XIAOBAI_CHARACTER.baseStats.informationRecovery
  };
}

export function getXiaobaiActionPoints(): number {
  return XIAOBAI_CHARACTER.baseStats.actionPoints;
}

export default {
  XIAOBAI_CHARACTER,
  DADONG_AI
};
