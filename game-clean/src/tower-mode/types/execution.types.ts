import type {
  GameCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
  CellActionResult,
  ChanceEvent,
  EventOutcomeOption,
  Book,
  Skill,
  DataPacket,
  EnemyPreviewData,
  ExecutionContext,
  TriggerContext,
} from './cell.types';

export type CellExecutor<T extends GameCell> = (
  cell: T,
  context: ExecutionContext
) => Promise<CellActionResult>;

export interface ExecutorRegistry {
  battle: CellExecutor<BattleCell>;
  chance: CellExecutor<ChanceCell>;
  bookstore: CellExecutor<BookstoreCell>;
  skill: CellExecutor<SkillCell>;
  boss: CellExecutor<BossCell>;
  end: CellExecutor<EndCell>;
}

export interface LayerPreviewInfo {
  themeName: string;
  shapeDescription: string;
  estimatedDifficulty: string;
}

export interface ExecutionUIContract {
  battleEntrance: {
    levelId: string;
    enemyPreview: EnemyPreviewData;
    difficulty: number;
    estimatedRewards: string[];
    onConfirm: () => void;
    onRetreat: () => void;
  };

  chanceEvent: {
    event: ChanceEvent;
    outcomeOptions: EventOutcomeOption[];
    onSelectOption: (optionId: string) => void;
    onReroll?: () => void;
  };

  bookstoreDisplay: {
    books: Book[];
    playerGold: number;
    canAfford: boolean[];
    onSelectBook: (bookId: string) => void;
    onLeave: () => void;
  };

  skillOffer: {
    offeredSkills: Skill[];
    currentActiveSkills: Skill[];
    maxSlots: number;
    onSelectSkill: (skillId: string, replaceSlot?: number) => void;
    onSkip: () => void;
  };

  bossReward: {
    dataPackets: DataPacket[];
    onSelectPacket: (packetId: string) => void;
  };

  layerTransition: {
    fromLayer: number;
    toLayer: number;
    nextLayerPreview: LayerPreviewInfo;
    onProceed: () => void;
  };
}

export type ExecutionUIContractKey = keyof ExecutionUIContract;
