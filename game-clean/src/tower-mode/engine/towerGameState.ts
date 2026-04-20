import type {
  TowerLayerData,
  GameCell,
  Coordinate2D,
  Skill,
  DataPacket,
  Book,
  ZoneType,
} from '../types';

import type { IBattlePlayerState, ICoreResources, GameOverCheck } from './battleIntegration';
import type { FlipResult } from './mapFlipEngine';
import { MapFlipEngine } from './mapFlipEngine';

export interface TowerGameState {
  currentLayer: number;
  mapTopology: TowerLayerData | null;
  flipCount: number;
  currentCellId: string;
  technicalValue: number;
  coreResources: ICoreResources;
  gold: number;
  cards: string[];
  skills: Skill[];
  dataPackets: DataPacket[];
  booksRead: Book[];
  clearedLevels: string[];
  failureHistory: Map<string, number>;
}

const DEFAULT_CORE_RESOURCES: ICoreResources = {
  hp: 100,
  maxHp: 100,
  energy: 50,
  maxEnergy: 50,
  shield: 0,
};

export class TowerGameStateManager {
  private state: TowerGameState;
  private mapFlipEngine: MapFlipEngine;

  constructor() {
    this.mapFlipEngine = new MapFlipEngine();
    this.state = this.createInitialState();
  }

  private createInitialState(): TowerGameState {
    return {
      currentLayer: 1,
      mapTopology: null,
      flipCount: 0,
      currentCellId: '',
      technicalValue: 0,
      coreResources: { ...DEFAULT_CORE_RESOURCES },
      gold: 0,
      cards: [],
      skills: [],
      dataPackets: [],
      booksRead: [],
      clearedLevels: [],
      failureHistory: new Map(),
    };
  }

  initializeNewGame(): TowerGameState {
    this.mapFlipEngine.reset();
    this.state = this.createInitialState();
    return { ...this.state, failureHistory: new Map(this.state.failureHistory) };
  }

  enterNewLayer(layer: number, topology?: TowerLayerData): void {
    this.state.currentLayer = layer;
    this.state.flipCount = 0;
    this.mapFlipEngine.reset();
    if (topology) {
      this.state.mapTopology = topology;
      if (topology.startCellId) {
        this.state.currentCellId = topology.startCellId;
      }
    }
  }

  updatePosition(cellId: string): void {
    this.state.currentCellId = cellId;
  }

  handleLevelVictory(cellId: string, technicalValueGain: number): FlipResult | null {
    if (!this.state.clearedLevels.includes(cellId)) {
      this.state.clearedLevels.push(cellId);
    }
    this.state.technicalValue += technicalValueGain;

    if (this.state.mapTopology) {
      if (this.mapFlipEngine.shouldTriggerFlip(this.state.mapTopology, this.state.clearedLevels.length)) {
        const flipResult = this.mapFlipEngine.executeFlip(this.state.mapTopology);
        if (flipResult.flipped) {
          this.state.mapTopology = flipResult.newTopology;
          this.state.flipCount = flipResult.flipCount;
        }
        return flipResult;
      }
    }

    return null;
  }

  handleLevelFailure(cellId: string): GameOverCheck {
    const currentCount = this.state.failureHistory.get(cellId) ?? 0;
    this.state.failureHistory.set(cellId, currentCount + 1);
    return this.checkGameOver();
  }

  checkGameOver(): GameOverCheck {
    const resources = this.state.coreResources;
    if (resources.hp <= 0) {
      return { gameOver: true, reason: '生命值耗尽' };
    }
    if (resources.energy <= 0 && resources.hp < resources.maxHp * 0.3) {
      return { gameOver: true, reason: '核心资源耗尽' };
    }
    return { gameOver: false };
  }

  getState(): TowerGameState {
    return { ...this.state, failureHistory: new Map(this.state.failureHistory) };
  }

  getMapFlipEngine(): MapFlipEngine {
    return this.mapFlipEngine;
  }

  updateCoreResources(updater: (resources: ICoreResources) => ICoreResources): void {
    this.state.coreResources = updater({ ...this.state.coreResources });
  }

  addGold(amount: number): void {
    this.state.gold += amount;
  }

  addCard(cardId: string): void {
    if (!this.state.cards.includes(cardId)) {
      this.state.cards.push(cardId);
    }
  }

  addSkill(skill: Skill): void {
    this.state.skills.push(skill);
  }

  addDataPacket(packet: DataPacket): void {
    this.state.dataPackets.push(packet);
  }

  addBook(book: Book): void {
    this.state.booksRead.push(book);
  }

  setMapTopology(topology: TowerLayerData): void {
    this.state.mapTopology = topology;
  }
}
