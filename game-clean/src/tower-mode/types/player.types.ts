import type { Skill } from './skill.types';
import type { Book } from './book.types';
import type { DataPacket } from './reward.types';

// 完整设想中要求的四种核心资源
export interface CoreResources {
  coreComputing: number;      // 核心算力
  coreFunds: number;          // 核心资金
  coreInformation: number;    // 核心信息
  corePrivilege: number;      // 核心权限
}

export interface CoreResourcesConfig {
  coreComputing: { initial: number; max: number; };
  coreFunds: { initial: number; max: number; };
  coreInformation: { initial: number; max: number; };
  corePrivilege: { initial: number; max: number; };
}

// 卡牌相关定义
export interface Card {
  id: string;
  name: string;
  description: string;
  type: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'L'; // T0-T4为科技树卡牌，L为关卡解锁卡
  category: 'attack' | 'defense' | 'utility' | 'resource';
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  effect: (state: any) => any; // 卡牌效果
}

export interface CardPool {
  cards: Card[];
  deckSize: number;
}

export interface EquipmentBonus {
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
}

export interface ItemDrop {
  type: 'card' | 'skill' | 'dataPack' | 'book' | 'gold';
  id?: string;
  amount?: number;
}

// 完整设想中要求的玩家状态
export interface PlayerState {
  position: string;
  technicalValue: number;      // 技术值（核心生存指标）
  maxTechnicalValue: number;
  coreResources: CoreResources;
  gold: number;               // 金币（辅助货币）
  
  // 卡牌系统
  cardPool: Card[];           // 可用卡池
  deck: Card[];              // 当前战斗卡组
  
  // 技能系统
  activeSkills: Skill[];     // 当前携带的技能（最多3个）
  skillStorage: Skill[];     // 仓库中的技能
  
  // 书籍系统
  booksRead: Book[];         // 已阅读的书籍（永久效果）
  
  // 数据包系统
  dataPacks: DataPacket[];   // 已获得的数据包（每层Boss获得1个，最多9个）
  
  // 关卡进度
  clearedLevels: string[];  // 已通关的关卡
  currentLayer: number;      // 当前层级（1-9）
  flipCount: number;         // 地图翻转次数（最多3次）
  
  // 其他状态
  turnCount: number;
  currentMilestone: number; // 当前达到的里程碑（0-8对应9个里程碑）
}

export interface MilestoneStatus {
  threshold: number;
  reached: boolean;
  rewardType: string;
  rewardDescription: string;
}

export type TowerGameState = 'idle' | 'playing' | 'paused' | 'transitioning' | 'game_over' | 'victory';

export interface PlayerSaveData {
  version: string;
  currentLayer: number;
  gameState: TowerGameState;
  timestamp: number;
  playerState: PlayerState;
}
