import type {
  GameCell,
  BattleCell,
  BossCell,
  Skill,
  DataPacket,
  Book,
  Coordinate2D,
  ZoneType,
  EnhancedBossConfig,
} from '../types';
import { isBossCell, isBattleCell } from '../types';

export interface ICoreResources {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  shield: number;
}

export interface IEquipmentBonus {
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
}

export interface IItemDrop {
  id: string;
  name: string;
  type: 'card' | 'packet' | 'book' | 'gold';
  rarity: 'common' | 'uncommon' | 'rare';
  quantity: number;
}

export interface IBattlePlayerState {
  technicalValue: number;
  coreResources: ICoreResources;
  gold: number;
  cards: string[];
  skills: Skill[];
  equipmentBonus: IEquipmentBonus;
  clearedLevels: string[];
  failureHistory: Record<string, number>;
}

export interface BattleResources {
  availableCards: string[];
  availableSkills: Skill[];
  equipmentBonus: IEquipmentBonus;
  currentTechnicalValue: number;
  currentCoreResources: ICoreResources;
}

export interface BattleRewards {
  technicalValueGain: number;
  goldGain: number;
  items: IItemDrop[];
  milestoneProgress: number;
  newMilestoneReached?: string;
}

export interface BattleSetup {
  levelEntry: { levelId: string; difficulty: number; theme?: string };
  isBossBattle: boolean;
  bossConfig?: EnhancedBossConfig;
  playerResources: BattleResources;
}

export interface BattleResult {
  victory: boolean;
  turnsUsed: number;
  rewards: BattleRewards;
  technicalValueChange: number;
}

export interface GameOverCheck {
  gameOver: boolean;
  reason?: string;
}

export class BattleIntegration {
  private static readonly BASE_TECHNICAL_VALUE = 10;
  private static readonly LAYER_MULTIPLIERS: Record<number, number> = {
    1: 1.0, 2: 1.0, 3: 1.5, 4: 1.5, 5: 2.0, 6: 2.0, 7: 2.5, 8: 2.5, 9: 3.0,
  };
  private static readonly ELITE_MULTIPLIER = 1.5;
  private static readonly BOSS_MULTIPLIER = 2.0;
  private static readonly BASE_GOLD_REWARD = 50;
  private static readonly BOSS_GOLD_MULTIPLIER = 3;

  setupBattle(gridCell: GameCell, playerState: IBattlePlayerState): BattleSetup {
    if (isBossCell(gridCell)) {
      const bossCell = gridCell as BossCell;
      const bossConfig: EnhancedBossConfig = {
        originalLevelId: bossCell.bossLevelId,
        bossLevelId: bossCell.bossLevelId,
        enhancementLevel: bossCell.enhancementLevel,
        hpMultiplier: 1 + bossCell.enhancementLevel * 0.5,
        newSkillsAdded: [],
        newCardsAdded: [],
        rewardDataPacketIds: bossCell.dataPacketPoolIds,
      };
      return {
        levelEntry: {
          levelId: bossCell.bossLevelId,
          difficulty: bossCell.enhancementLevel,
        },
        isBossBattle: true,
        bossConfig,
        playerResources: {
          availableCards: [...playerState.cards],
          availableSkills: [...playerState.skills],
          equipmentBonus: { ...playerState.equipmentBonus },
          currentTechnicalValue: playerState.technicalValue,
          currentCoreResources: { ...playerState.coreResources },
        },
      };
    }

    if (isBattleCell(gridCell)) {
      const battleCell = gridCell as BattleCell;
      return {
        levelEntry: {
          levelId: battleCell.levelId,
          difficulty: battleCell.difficulty,
        },
        isBossBattle: false,
        playerResources: {
          availableCards: [...playerState.cards],
          availableSkills: [...playerState.skills],
          equipmentBonus: { ...playerState.equipmentBonus },
          currentTechnicalValue: playerState.technicalValue,
          currentCoreResources: { ...playerState.coreResources },
        },
      };
    }

    throw new Error('非战斗格子无法准备战斗');
  }

  processBattleResult(result: BattleResult, gridCell: GameCell, playerState: IBattlePlayerState): IBattlePlayerState {
    const updated: IBattlePlayerState = {
      technicalValue: playerState.technicalValue,
      coreResources: { ...playerState.coreResources },
      gold: playerState.gold,
      cards: [...playerState.cards],
      skills: [...playerState.skills],
      equipmentBonus: { ...playerState.equipmentBonus },
      clearedLevels: [...playerState.clearedLevels],
      failureHistory: { ...playerState.failureHistory },
    };

    if (result.victory) {
      updated.technicalValue += result.technicalValueChange;
      updated.gold += result.rewards.goldGain;
      if (!updated.clearedLevels.includes(gridCell.id)) {
        updated.clearedLevels.push(gridCell.id);
      }
      if (gridCell.id in updated.failureHistory) {
        delete updated.failureHistory[gridCell.id];
      }
    } else {
      updated.failureHistory[gridCell.id] = (updated.failureHistory[gridCell.id] ?? 0) + 1;
    }

    return updated;
  }

  calculateTechnicalValueChange(result: BattleResult, layer: number, isBoss: boolean, isElite: boolean): number {
    if (!result.victory) {
      return 0;
    }
    const baseValue = BattleIntegration.BASE_TECHNICAL_VALUE;
    const layerMultiplier = BattleIntegration.LAYER_MULTIPLIERS[layer] ?? 1.0;
    let multiplier = 1.0;
    if (isBoss) {
      multiplier = BattleIntegration.BOSS_MULTIPLIER;
    } else if (isElite) {
      multiplier = BattleIntegration.ELITE_MULTIPLIER;
    }
    return Math.floor(baseValue * layerMultiplier * multiplier);
  }
}
