import type {
  LevelDefinition,
  LevelId,
  LevelGameState,
  LevelProgress,
  LevelPlayerState,
  DadongAIState,
  EnemyState,
  AreaControlState,
  AreaType,
  LevelCompletionResult,
  LevelTurnPhase,
  LevelPhaseResult,
  LevelPendingJudgment,
  LevelResponseEvent,
  LevelTeamSharedLevels,
  ActiveEffect
} from '@/types/levelTypes';
import {
  LEVEL_DATABASE,
  LEVEL_ORDER,
  INITIAL_UNLOCKED_CARDS
} from '@/data/levelDatabase';
import {
  DADONG_AI,
  getXiaobaiResourceRecovery,
  getXiaobaiActionPoints
} from '@/data/levelCharacters';
import { DEFENDER_T1_CARDS, ATTACKER_T1_CARDS, getCardByCode } from '@/data/cardDatabase';
import { LEVEL1_CARDS, LEVEL2_CARDS, LEVEL3_CARDS, LEVEL4_CARDS, LEVEL5_CARDS, LEVEL6_CARDS, LEVEL7_CARDS, LEVEL8_CARDS, LEVEL9_CARDS, JUDGMENT_CARDS } from '@/data/levelCardDatabase';
import type { Card } from '@/types/legacy/card_v16';
import { loadPlayerDeck } from '@/utils/playerCardProgressManager';
import {
  LEVEL_TURN_PHASES,
  LEVEL_PHASE_NAMES,
  getLevelHandLimit,
  getLevelDrawCount
} from '@/types/levelTypes';
import { LevelAIController } from './LevelAIController';
import type { AIOperationLog, VisualizationUpdateData } from './LevelAIController';
import { JudgmentEventBus } from './JudgmentEventBus';
import { checkLevelVictoryConditions, type LevelVictoryResult } from './LevelVictoryConditionSystem';

const STORAGE_KEY = 'level_progress';

interface LevelProgressStorage {
  [key: LevelId]: LevelProgress;
}

export class LevelGameStateManager {
  private state: LevelGameState | null = null;
  private progressStorage: LevelProgressStorage;
  private onStateChange: ((state: LevelGameState) => void) | null = null;
  private onLevelComplete: ((result: LevelCompletionResult) => void) | null = null;
  private onGameOver: (() => void) | null = null;
  private onPhaseChange: ((phase: LevelTurnPhase) => void) | null = null;
  private aiController: LevelAIController;
  private onAIOperationLog?: (log: AIOperationLog) => void;
  private onVisualizationUpdate?: (data: VisualizationUpdateData) => void;
  
  // 防止阶段推进重复执行的锁
  private isAdvancingPhase: boolean = false;
  private isEndingTurn: boolean = false;

  constructor() {
    this.progressStorage = this.loadProgress();
    this.aiController = new LevelAIController({
      dadongDifficulty: 'medium',
      enemyDifficulty: 'medium',
      enableVisualization: true,
      delayBetweenActions: 600
    });
    
    // 设置AI操作日志回调
    this.aiController.setOnOperationLog((log) => {
      if (this.onAIOperationLog) {
        this.onAIOperationLog(log);
      }
    });
    
    // 设置AI状态变更回调
    this.aiController.setOnStateChange((state) => {
      this.state = state;
      this.notifyStateChange();
    });

    // 设置AI可视化更新回调
    this.aiController.setOnVisualizationUpdate((data) => {
      if (this.onVisualizationUpdate) {
        this.onVisualizationUpdate(data);
      }
      // 同时通过 window 对象通知界面组件
      if (typeof window !== 'undefined') {
        const callback = (window as unknown as { onLevelAIVisualizationUpdate?: (data: VisualizationUpdateData) => void }).onLevelAIVisualizationUpdate;
        if (callback) {
          callback(data);
        }
      }
    });
  }

  setOnAIOperationLog(callback: (log: AIOperationLog) => void): void {
    this.onAIOperationLog = callback;
  }

  setOnVisualizationUpdate(callback: (data: VisualizationUpdateData) => void): void {
    this.onVisualizationUpdate = callback;
  }

  private loadProgress(): LevelProgressStorage {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load level progress:', e);
    }
    return this.initializeProgress();
  }

  private initializeProgress(): LevelProgressStorage {
    const progress: LevelProgressStorage = {};
    LEVEL_ORDER.forEach((levelId, index) => {
      progress[levelId] = {
        levelId,
        status: index === 0 ? 'available' : 'locked',
        completedObjectives: [],
        attempts: 0
      };
    });
    this.saveProgress(progress);
    return progress;
  }

  private saveProgress(progress: LevelProgressStorage = this.progressStorage): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save level progress:', e);
    }
  }

  setOnStateChange(callback: (state: LevelGameState) => void): void {
    this.onStateChange = callback;
  }

  setOnLevelComplete(callback: (result: LevelCompletionResult) => void): void {
    this.onLevelComplete = callback;
  }

  setOnGameOver(callback: () => void): void {
    this.onGameOver = callback;
  }

  setOnPhaseChange(callback: (phase: LevelTurnPhase) => void): void {
    this.onPhaseChange = callback;
  }

  getProgress(): LevelProgressStorage {
    return this.progressStorage;
  }

  getLevelProgress(levelId: LevelId): LevelProgress | undefined {
    return this.progressStorage[levelId];
  }

  isLevelUnlocked(levelId: LevelId): boolean {
    const progress = this.progressStorage[levelId];
    return progress?.status === 'available' || progress?.status === 'completed' || progress?.status === 'mastered';
  }

  /**
   * 重新加载进度（用于测试模式等需要同步外部进度变更的场景）
   */
  reloadProgress(): void {
    this.progressStorage = this.loadProgress();
    console.log('[LevelGameStateManager] 进度已重新加载');
  }

  async startLevel(levelId: LevelId): Promise<LevelGameState> {
    const level = LEVEL_DATABASE[levelId];
    if (!level) {
      throw new Error(`Level ${levelId} not found`);
    }

    // 重新加载进度以确保最新状态（特别是测试模式后）
    this.reloadProgress();

    const progress = this.progressStorage[levelId];
    if (!progress || progress.status === 'locked') {
      throw new Error(`Level ${levelId} is locked`);
    }

    this.progressStorage[levelId].status = 'in_progress';
    this.progressStorage[levelId].attempts += 1;
    this.saveProgress();

    const initialState = await this.createInitialState(level);
    this.state = initialState;
    console.log('[LevelGameStateManager] startLevel: created initial state with phase:', initialState.currentPhase);
    
    // 创建状态副本返回给调用者
    const stateCopy = this.createStateCopy(initialState);
    
    // 同时通过回调通知
    this.notifyStateChange();
    console.log('[LevelGameStateManager] startLevel: notifyStateChange called');
    
    return stateCopy;
  }

  private async createInitialState(level: LevelDefinition): Promise<LevelGameState> {
    const initialSetup = level.initialSetup;
    const resourceRecovery = getXiaobaiResourceRecovery();
    const actionPoints = getXiaobaiActionPoints();

    // 根据关卡配置玩家属性
    const playerHandSize = level.playerConfig?.handSize || 3;
    const playerActionPoints = level.playerConfig?.actionPoints || actionPoints;
    
    // 先创建玩家牌库
    const playerDeck = this.createDeck(level.id);
    console.log(`[LevelGameStateManager] 玩家牌库创建完成，共 ${playerDeck.length} 张卡牌`);
    
    // 从牌库抽取初始手牌（确保使用玩家配置的卡组）
    const playerHand = this.drawFromDeck(playerDeck, playerHandSize);
    console.log(`[LevelGameStateManager] 玩家初始手牌抽取完成，共 ${playerHand.length} 张:`, playerHand.map(c => c.name));
    
    const playerState: LevelPlayerState = {
      characterId: 'XIAOBAI',
      resources: {
        computing: 2,
        funds: 2,
        information: 2,
        permission: 0
      },
      resourceRecovery,
      actionPoints: playerActionPoints,
      maxActionPoints: playerActionPoints,
      hand: playerHand,
      deck: playerDeck, // 使用已抽取手牌后的牌库
      discardPile: [],
      defenseCardsUsed: 0,
      securityLevel: initialSetup.securityLevel,
      maxSecurityLevel: 100
    };

    // 根据关卡配置大东AI属性
    const dadongActionPoints = level.dadongConfig?.actionPoints || DADONG_AI.level1Config?.actionPoints || 3;
    const dadongHandSize = level.dadongConfig?.handSize || DADONG_AI.level1Config?.handSize || 2;
    
    // 创建大东牌库并抽取初始手牌
    const dadongDeck = this.createDeck(level.id);
    const dadongHand = this.drawFromDeck(dadongDeck, dadongHandSize);
    
    const dadongState: DadongAIState = {
      isActive: true,
      hand: dadongHand,
      deck: dadongDeck,
      cooperationBonus: DADONG_AI.behavior.cooperationBonus,
      resources: {
        computing: 10,
        funds: 10,
        information: 10
      },
      actionPoints: dadongActionPoints,
      maxActionPoints: dadongActionPoints,
      securityLevel: 50,
      skillCooldowns: {}
    };

    // 创建敌人1牌库
    const enemy1Deck = this.createEnemyDeck(level.id);
    // 从牌库抽取初始手牌
    const enemy1Hand = this.drawFromDeck(enemy1Deck, 2);
    
    const enemyState: EnemyState = {
      name: level.enemyConfig.name,
      type: level.enemyConfig.type,
      infiltrationLevel: 0,
      resources: {
        computing: 3 + level.enemyConfig.resourceBonus,
        funds: 3 + level.enemyConfig.resourceBonus,
        information: 2 + level.enemyConfig.resourceBonus
      },
      hand: enemy1Hand,
      deck: enemy1Deck,
      discardPile: [],
      attackCooldown: 0,
      specialAbilityActive: false,
      // 初始化技能冷却追踪
      skillCooldowns: {},
      // 初始化每个区域的标记累计数
      markerCountByArea: {
        internal: 0,
        industrial: 0,
        dmz: 0,
        external: 0
      },
      // 初始化感染区域列表
      infectedAreas: [],
      // 初始化活跃敌人ID列表（从关卡配置获取）
      activeEnemyIds: level.enemyIds || []
    };

    // 如果有第二个敌人，创建敌人2状态
    let enemy2State: EnemyState | undefined = undefined;
    if (level.enemyIds && level.enemyIds.length >= 2) {
      const enemy2Id = level.enemyIds[1];
      const { getEnemyById } = await import('@/data/levelEnemies');
      const enemy2Config = getEnemyById(enemy2Id);
      if (enemy2Config) {
        // 创建敌人2牌库
        const enemy2Deck = this.createEnemyDeck(level.id);
        // 从牌库抽取初始手牌
        const enemy2Hand = this.drawFromDeck(enemy2Deck, 2);
        
        enemy2State = {
          name: enemy2Config.name,
          type: enemy2Config.type,
          infiltrationLevel: 0,
          resources: {
            computing: 3 + (enemy2Config.resourceBonus || 0),
            funds: 3 + (enemy2Config.resourceBonus || 0),
            information: 2 + (enemy2Config.resourceBonus || 0)
          },
          hand: enemy2Hand,
          deck: enemy2Deck,
          discardPile: [],
          attackCooldown: 0,
          specialAbilityActive: false,
          skillCooldowns: {},
          markerCountByArea: {
            internal: 0,
            industrial: 0,
            dmz: 0,
            external: 0
          },
          infectedAreas: [],
          activeEnemyIds: level.enemyIds
        };
      }
    }

    // 从关卡配置的区域分布中读取初始敌方标记数
    const getInitialEnemyMarkers = (areaType: AreaType): number => {
      if (level.areaDistribution && level.areaDistribution[areaType]) {
        return level.areaDistribution[areaType].enemyMarkers;
      }
      return 0;
    };

    const areaControl: AreaControlState = {
      internal: {
        controller: initialSetup.controlledAreas.includes('internal') ? 'player' : 'neutral',
        defenseMarkers: initialSetup.areaMarkers.internal,
        attackMarkers: getInitialEnemyMarkers('internal'),
        latentMarkers: [],
        specialEffects: []
      },
      industrial: {
        controller: initialSetup.controlledAreas.includes('industrial') ? 'player' : 'neutral',
        defenseMarkers: initialSetup.areaMarkers.industrial,
        attackMarkers: getInitialEnemyMarkers('industrial'),
        latentMarkers: [],
        specialEffects: []
      },
      dmz: {
        controller: 'neutral',
        defenseMarkers: initialSetup.areaMarkers.dmz,
        attackMarkers: getInitialEnemyMarkers('dmz'),
        latentMarkers: [],
        specialEffects: []
      },
      external: {
        controller: 'neutral',
        defenseMarkers: initialSetup.areaMarkers.external,
        attackMarkers: getInitialEnemyMarkers('external'),
        latentMarkers: [],
        specialEffects: []
      }
    };

    const unlockedCards = [...INITIAL_UNLOCKED_CARDS];

    const teamSharedLevels: LevelTeamSharedLevels = {
      player: { infiltrationLevel: 0, safetyLevel: initialSetup.securityLevel },
      enemy: { infiltrationLevel: 0, safetyLevel: 0 }
    };

    return {
      currentLevel: level,
      progress: this.progressStorage[level.id],
      objectives: level.objectives.map(obj => ({ ...obj, current: 0, completed: false })),
      currentTurn: 1,
      currentPhase: 'judgment',
      currentActor: 'player',
      playerState,
      dadongAIState: dadongState,
      enemyState,
      enemy2State, // 敌人2状态（如果有）
      areaControl,
      unlockedCards,
      isTutorialMode: level.difficulty <= 2,
      tutorialStep: level.difficulty <= 2 ? 0 : undefined,
      phaseLogs: [],
      round: 1,
      pendingJudgments: [],
      responseEvents: [],
      teamSharedLevels,
      // 回合阶段追踪
      dadongPhase: undefined,
      enemyPhase: undefined,
      enemy2Phase: undefined,
      isDadongTurn: false,
      isEnemyTurn: false,
      isEnemy2Turn: false,
      // AI操作日志
      aiOperationLogs: [],
      // 持续效果追踪
      activeEffects: []
    };
  }

  private drawInitialHand(size: number = 3): Card[] {
    const hand: Card[] = [];
    const t1Cards = [...DEFENDER_T1_CARDS];
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * t1Cards.length);
      hand.push(t1Cards[randomIndex]);
    }
    return hand;
  }

  private drawEnemyInitialHand(size: number = 2): Card[] {
    const hand: Card[] = [];
    const attackerCards = [...ATTACKER_T1_CARDS];
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * attackerCards.length);
      hand.push(attackerCards[randomIndex]);
    }
    return hand;
  }

  private createDeck(levelId?: LevelId): Card[] {
    const deck: Card[] = [];
    
    // 尝试加载玩家配置的卡组
    const playerDeck = loadPlayerDeck();
    console.log('[LevelGameStateManager] 尝试加载玩家卡组:', playerDeck);
    
    if (playerDeck && playerDeck.cards.length > 0) {
      // 使用玩家配置的卡组
      console.log('[LevelGameStateManager] 使用玩家配置的卡组，卡牌数量:', playerDeck.cards.length);
      let loadedCardCount = 0;
      let missingCardCount = 0;
      
      playerDeck.cards.forEach(deckCard => {
        const card = getCardByCode(deckCard.cardCode);
        if (card) {
          // 根据配置的数量添加卡牌
          for (let i = 0; i < deckCard.count; i++) {
            deck.push(card);
            loadedCardCount++;
          }
        } else {
          console.warn(`[LevelGameStateManager] 警告: 找不到卡牌编码 ${deckCard.cardCode}`);
          missingCardCount++;
        }
      });
      
      console.log(`[LevelGameStateManager] 玩家卡组加载完成，成功加载 ${loadedCardCount} 张，缺失 ${missingCardCount} 张`);
      
      // 如果玩家卡组加载失败（没有成功加载任何卡牌），使用默认卡组
      if (deck.length === 0) {
        console.log('[LevelGameStateManager] 玩家卡组加载失败，回退到默认卡组');
        deck.push(...DEFENDER_T1_CARDS, ...DEFENDER_T1_CARDS);
      }
      
      // 玩家配置了卡组时，只添加判定卡牌作为补充（不添加关卡专属卡牌，保持玩家配置的原样）
      // 判定卡牌是游戏机制必需的特殊卡牌
      JUDGMENT_CARDS.forEach(card => {
        deck.push(card);
        deck.push(card);
      });
      console.log('[LevelGameStateManager] 判定卡牌已加入卡池:', JUDGMENT_CARDS.map(c => c.name));
      
    } else {
      // 如果没有配置卡组，使用默认卡组
      console.log('[LevelGameStateManager] 玩家未配置卡组，使用默认卡组');
      // 基础卡牌
      deck.push(...DEFENDER_T1_CARDS, ...DEFENDER_T1_CARDS);
      
      // 添加判定卡牌到卡池（每种卡牌加入2张）
      JUDGMENT_CARDS.forEach(card => {
        deck.push(card);
        deck.push(card);
      });
      console.log('[LevelGameStateManager] 判定卡牌已加入卡池:', JUDGMENT_CARDS.map(c => c.name));
      
      // 如果指定了关卡，添加关卡专属卡牌到卡池（仅在使用默认卡组时）
      if (levelId) {
        const levelCards = this.getLevelCards(levelId);
        if (levelCards.length > 0) {
          // 将关卡卡牌加入卡池（每种卡牌加入2张）
          levelCards.forEach(card => {
            deck.push(card);
            deck.push(card); // 每种关卡卡牌2张
          });
          console.log(`[LevelGameStateManager] 关卡 ${levelId} 专属卡牌已加入卡池:`, levelCards.map(c => c.name));
        }
      }
    }
    
    return this.shuffleDeck(deck);
  }

  private createEnemyDeck(levelId?: LevelId): Card[] {
    let deck: Card[] = [];
    
    if (levelId === 'LV001') {
      // 第一关使用专属牌库（24张）
      // 基础攻击卡牌（12张）- 6种 × 2张
      const baseCards = [
        ATTACKER_T1_CARDS.find(c => c.name === '端口扫描'),
        ATTACKER_T1_CARDS.find(c => c.name === '端口扫描'),
        ATTACKER_T1_CARDS.find(c => c.name === '弱口令尝试'),
        ATTACKER_T1_CARDS.find(c => c.name === '弱口令尝试'),
        ATTACKER_T1_CARDS.find(c => c.name === '钓鱼邮件'),
        ATTACKER_T1_CARDS.find(c => c.name === '钓鱼邮件'),
        ATTACKER_T1_CARDS.find(c => c.name === '服务拒绝攻击'),
        ATTACKER_T1_CARDS.find(c => c.name === '服务拒绝攻击'),
        ATTACKER_T1_CARDS.find(c => c.name === '网络嗅探'),
        ATTACKER_T1_CARDS.find(c => c.name === '网络嗅探'),
        ATTACKER_T1_CARDS.find(c => c.name === '社会工程学'),
        ATTACKER_T1_CARDS.find(c => c.name === '社会工程学'),
      ].filter((card): card is Card => card !== undefined);
      
      // 专属攻击类卡牌（12张）- 6种 × 2张
      const exclusiveAttackCards = [
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-001'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-001-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-002'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-002-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-003'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-003-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-004'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-004-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-005'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-005-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-006'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-ATK-006-2'),
      ].filter((card): card is Card => card !== undefined);
      
      // 专属标志类卡牌（6张）- 3种 × 2张
      const exclusiveMarkCards = [
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-MARK-001'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-MARK-001-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-MARK-002'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-MARK-002-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-MARK-003'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-MARK-003-2'),
      ].filter((card): card is Card => card !== undefined);
      
      // 专属判定类卡牌（6张）- 3种 × 2张
      const exclusiveJudgmentCards = [
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-JUDGE-001'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-JUDGE-001-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-JUDGE-002'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-JUDGE-002-2'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-JUDGE-003'),
        LEVEL1_CARDS.find(c => c.card_code === 'LV1-JUDGE-003-2'),
      ].filter((card): card is Card => card !== undefined);
      
      deck = [...baseCards, ...exclusiveAttackCards, ...exclusiveMarkCards, ...exclusiveJudgmentCards];
      console.log(`[LevelGameStateManager] 第一关敌人专属牌库创建完成，共 ${deck.length} 张卡牌`);
      console.log(`[LevelGameStateManager] - 攻击类卡牌: ${exclusiveAttackCards.length} 张`);
      console.log(`[LevelGameStateManager] - 标志类卡牌: ${exclusiveMarkCards.length} 张`);
      console.log(`[LevelGameStateManager] - 判定类卡牌: ${exclusiveJudgmentCards.length} 张`);
    } else {
      // 其他关卡使用基础牌库
      deck = [...ATTACKER_T1_CARDS, ...ATTACKER_T1_CARDS];
    }
    
    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 从牌库抽取指定数量的卡牌
   * @param deck 牌库
   * @param count 抽取数量
   * @returns 抽取的卡牌数组
   */
  private drawFromDeck(deck: Card[], count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count && deck.length > 0; i++) {
      drawn.push(deck.pop()!);
    }
    return drawn;
  }

  /**
   * 获取关卡专属卡牌
   * 根据关卡ID返回对应的关卡卡牌
   */
  private getLevelCards(levelId: LevelId): Card[] {
    switch (levelId) {
      case 'LV001':
        // 只返回玩家可用的防御方卡牌（faction: 'defense'）
        return LEVEL1_CARDS.filter(card => card.faction === 'defense');
      case 'LV002':
        return LEVEL2_CARDS.filter(card => card.faction === 'defense');
      case 'LV003':
        return LEVEL3_CARDS.filter(card => card.faction === 'defense');
      case 'LV004':
        return LEVEL4_CARDS.filter(card => card.faction === 'defense');
      case 'LV005':
        return LEVEL5_CARDS.filter(card => card.faction === 'defense');
      case 'LV006':
        return LEVEL6_CARDS.filter(card => card.faction === 'defense');
      case 'LV007':
        return LEVEL7_CARDS.filter(card => card.faction === 'defense');
      case 'LV008':
        return LEVEL8_CARDS.filter(card => card.faction === 'defense');
      case 'LV009':
        return LEVEL9_CARDS.filter(card => card.faction === 'defense');
      default:
        return [];
    }
  }

  getState(): LevelGameState | null {
    return this.state;
  }

  getCurrentPhase(): LevelTurnPhase | null {
    return this.state?.currentPhase ?? null;
  }

  getPhaseName(phase: LevelTurnPhase): string {
    return LEVEL_PHASE_NAMES[phase];
  }

  getNextPhase(currentPhase: LevelTurnPhase): LevelTurnPhase | null {
    const currentIndex = LEVEL_TURN_PHASES.indexOf(currentPhase);
    if (currentIndex === -1 || currentIndex >= LEVEL_TURN_PHASES.length - 1) {
      return null;
    }
    return LEVEL_TURN_PHASES[currentIndex + 1];
  }

  async advancePhase(): Promise<LevelPhaseResult> {
    // 检查是否正在推进阶段，防止重复调用
    if (this.isAdvancingPhase) {
      console.log('[LevelGameStateManager] advancePhase: 正在推进阶段，忽略重复调用');
      return { success: false, logs: ['警告：阶段推进正在进行中'], canProceed: false };
    }
    
    this.isAdvancingPhase = true;
    
    console.log('[LevelGameStateManager] advancePhase called, current phase:', this.state?.currentPhase);
    console.log('[LevelGameStateManager] current pending judgments:', this.state?.pendingJudgments?.length);
    if (this.state && this.state.pendingJudgments && this.state.pendingJudgments.length > 0) {
      console.log('[LevelGameStateManager] pending judgments:', this.state.pendingJudgments.map(j => ({ id: j.id, cardName: j.cardName, isImmediate: j.isImmediate, resolved: j.resolved })));
    }
    
    if (!this.state) {
      this.isAdvancingPhase = false;
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const nextPhase = this.getNextPhase(this.state.currentPhase);
    console.log('[LevelGameStateManager] nextPhase:', nextPhase);
    
    if (!nextPhase) {
      // 没有下一个阶段，执行endTurn（包含大东和敌人的回合）
      const result = await this.endTurn();
      this.isAdvancingPhase = false;
      return result;
    }

    this.state.currentPhase = nextPhase;
    const result = this.executePhase(nextPhase);
    
    console.log('[LevelGameStateManager] calling notifyStateChange, new phase:', this.state.currentPhase);
    this.notifyStateChange();
    
    // 释放锁
    this.isAdvancingPhase = false;
    
    return result;
  }

  executePhase(phase: LevelTurnPhase): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [`【${LEVEL_PHASE_NAMES[phase]}】`];
    let result: LevelPhaseResult;

    switch (phase) {
      case 'judgment':
        result = this.executeJudgmentPhase();
        break;
      case 'recovery':
        result = this.executeRecoveryPhase();
        break;
      case 'draw':
        result = this.executeDrawPhase();
        break;
      case 'action':
        result = this.executeActionPhase();
        break;
      case 'response':
        result = this.executeResponsePhase();
        break;
      case 'discard':
        result = this.executeDiscardPhase();
        break;
      case 'end':
        result = this.executeEndPhase();
        break;
      default:
        result = { success: false, logs: [`错误：未知阶段 ${phase}`], canProceed: false };
    }

    result.logs = [...logs, ...result.logs];
    this.state.phaseLogs = [...this.state.phaseLogs, ...result.logs];
    
    return result;
  }

  private executeJudgmentPhase(): LevelPhaseResult {
    if (!this.state) {
      console.log('[LevelGameStateManager] executeJudgmentPhase: 无游戏状态');
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    console.log('[LevelGameStateManager] executeJudgmentPhase: 开始执行判定阶段');
    console.log('[LevelGameStateManager] 当前待处理判定总数:', this.state.pendingJudgments.length);
    console.log('[LevelGameStateManager] 待处理判定详情:', this.state.pendingJudgments.map(j => ({
      id: j.id,
      cardName: j.cardName,
      resolved: j.resolved,
      isImmediate: j.isImmediate
    })));

    const logs: string[] = [];
    
    logs.push('⚖️ ====== 判定阶段开始 ======');
    logs.push(`📊 当前待处理判定总数: ${this.state.pendingJudgments.length}`);
    
    const delayedJudgments = this.state.pendingJudgments.filter(j => !j.resolved && !j.isImmediate);
    
    logs.push('⚖️ 检查待处理延时判定...');
    logs.push(`📋 发现 ${delayedJudgments.length} 个未完成的延时判定`);
    
    if (delayedJudgments.length > 0) {
      logs.push(`⚖️ 有 ${delayedJudgments.length} 个待处理延时判定需要结算`);
      logs.push('📋 延时判定列表:');
      delayedJudgments.forEach((j, index) => {
        logs.push(`  ${index + 1}. 【${j.cardName}】- ${j.description || '无描述'}`);
      });
      
      console.log('[LevelGameStateManager] 有待处理延时判定，返回 canProceed: false');
      
      // 触发第一个待处理判定的用户交互
      const firstJudgment = delayedJudgments[0];
      console.log('[LevelGameStateManager] 触发第一个判定:', firstJudgment.cardName);
      this.triggerJudgmentUI(firstJudgment, 'judgment');
      
      return { 
        success: true, 
        logs, 
        canProceed: false, 
        phaseData: { 
          hasPendingJudgments: true, 
          judgment: firstJudgment 
        } 
      };
    } else {
      logs.push('✓ 没有待处理的延时判定');
    }

    logs.push('📋 结算持续效果...');
    logs.push('✓ 持续效果已更新');
    logs.push('⚖️ ====== 判定阶段结束 ======');
    
    console.log('[LevelGameStateManager] 没有待处理延时判定，返回 canProceed: true');

    return { success: true, logs, canProceed: true };
  }

  resolveJudgment(judgmentId: string, success: boolean): boolean {
    if (!this.state) return false;

    const judgment = this.state.pendingJudgments.find(j => j.id === judgmentId);
    if (!judgment || judgment.resolved) return false;

    const effects = success ? judgment.effects.success : judgment.effects.failure;
    
    if (effects.infiltrationChange) {
      this.state.teamSharedLevels.player.infiltrationLevel = Math.max(0, Math.min(100,
        this.state.teamSharedLevels.player.infiltrationLevel + effects.infiltrationChange
      ));
    }
    if (effects.safetyChange) {
      this.state.teamSharedLevels.player.safetyLevel = Math.max(0, Math.min(100,
        this.state.teamSharedLevels.player.safetyLevel + effects.safetyChange
      ));
      this.state.playerState.securityLevel = this.state.teamSharedLevels.player.safetyLevel;
    }

    judgment.resolved = true;
    this.state.phaseLogs.push(`⚖️ 判定【${judgment.description}】: ${success ? '✅ 成功' : '❌ 失败'}`);
    
    this.notifyStateChange();
    return true;
  }

  private executeRecoveryPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const recovery = this.state.playerState.resourceRecovery;

    const oldComputing = this.state.playerState.resources.computing;
    const oldFunds = this.state.playerState.resources.funds;
    const oldInformation = this.state.playerState.resources.information;

    this.state.playerState.resources.computing = Math.min(
      15,
      this.state.playerState.resources.computing + recovery.computing
    );
    this.state.playerState.resources.funds = Math.min(
      15,
      this.state.playerState.resources.funds + recovery.funds
    );
    this.state.playerState.resources.information = Math.min(
      12,
      this.state.playerState.resources.information + recovery.information
    );

    const restoredResources: string[] = [];
    if (this.state.playerState.resources.computing > oldComputing) {
      restoredResources.push(`算力+${recovery.computing}`);
    }
    if (this.state.playerState.resources.funds > oldFunds) {
      restoredResources.push(`资金+${recovery.funds}`);
    }
    if (this.state.playerState.resources.information > oldInformation) {
      restoredResources.push(`信息+${recovery.information}`);
    }

    if (restoredResources.length > 0) {
      logs.push(`💫 资源恢复: ${restoredResources.join(', ')}`);
    } else {
      logs.push('✓ 资源已达上限');
    }

    const controlledAreas = Object.values(this.state.areaControl)
      .filter(area => area.controller === 'player').length;
    if (controlledAreas > 0) {
      logs.push(`🏰 区域控制加成: 控制${controlledAreas}个区域`);
    }

    return { success: true, logs, canProceed: true };
  }

  private executeDrawPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const drawCount = getLevelDrawCount(this.state.round);

    logs.push(`🎴 抽牌阶段: 抽取 ${drawCount} 张卡牌`);

    const drawnCards: string[] = [];
    for (let i = 0; i < drawCount; i++) {
      if (this.state.playerState.deck.length === 0) {
        if (this.state.playerState.discardPile.length === 0) {
          logs.push('⚠️ 牌库和弃牌堆都已空');
          break;
        }
        this.state.playerState.deck = this.shuffleDeck([...this.state.playerState.discardPile]);
        this.state.playerState.discardPile = [];
        logs.push('🔄 弃牌堆洗入牌库');
      }

      if (this.state.playerState.deck.length > 0) {
        const card = this.state.playerState.deck.pop()!;
        this.state.playerState.hand.push(card);
        drawnCards.push(card.name);
      }
    }

    if (drawnCards.length > 0) {
      logs.push(`✅ 抽到卡牌: ${drawnCards.join(', ')}`);
    }

    return { success: true, logs, canProceed: true, phaseData: { drawnCards } };
  }

  private executeActionPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];

    this.state.playerState.actionPoints = this.state.playerState.maxActionPoints;
    logs.push(`⚡ 行动阶段: 获得 ${this.state.playerState.actionPoints} 点行动点`);
    logs.push('🎯 可以打出卡牌或使用技能');

    return { success: true, logs, canProceed: true };
  }

  private executeResponsePhase(): LevelPhaseResult {
    if (!this.state) {
      console.log('[LevelGameStateManager] executeResponsePhase: 无游戏状态');
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    console.log('[LevelGameStateManager] executeResponsePhase: 开始执行响应阶段');
    console.log('[LevelGameStateManager] 当前待处理判定总数:', this.state.pendingJudgments.length);
    console.log('[LevelGameStateManager] 待处理判定详情:', this.state.pendingJudgments.map(j => ({
      id: j.id,
      cardName: j.cardName,
      resolved: j.resolved,
      isImmediate: j.isImmediate
    })));

    const logs: string[] = [];
    
    logs.push('⏱️ ====== 响应阶段开始 ======');
    logs.push(`📊 当前待处理判定总数: ${this.state.pendingJudgments.length}`);
    
    const immediateJudgments = this.state.pendingJudgments.filter(j => !j.resolved && j.isImmediate === true);
    
    logs.push('🎯 检查待处理即时判定...');
    logs.push(`📋 发现 ${immediateJudgments.length} 个未完成的即时判定`);
    
    if (immediateJudgments.length > 0) {
      logs.push(`🎯 有 ${immediateJudgments.length} 个即时判定需要执行`);
      logs.push('📋 即时判定列表:');
      immediateJudgments.forEach((j, index) => {
        logs.push(`  ${index + 1}. 【${j.cardName}】- ${j.description || '无描述'}`);
      });
      
      console.log('[LevelGameStateManager] 有待处理即时判定，返回 canProceed: false');
      
      // 触发第一个待处理判定的用户交互
      const firstJudgment = immediateJudgments[0];
      console.log('[LevelGameStateManager] 触发第一个判定:', firstJudgment.cardName);
      this.triggerJudgmentUI(firstJudgment, 'response');
      
      return { 
        success: true, 
        logs, 
        canProceed: false, 
        phaseData: { 
          hasPendingJudgments: true, 
          judgment: firstJudgment 
        } 
      };
    }
    
    const unresolvedEvents = this.state.responseEvents.filter(e => !e.responded);

    logs.push('⏱️ 检查是否有需要响应的事件');
    
    if (unresolvedEvents.length > 0) {
      logs.push(`⏱️ 有 ${unresolvedEvents.length} 个事件需要响应`);
      return { 
        success: true, 
        logs, 
        canProceed: false,
        phaseData: { 
          hasResponseEvents: true, 
          eventCount: unresolvedEvents.length,
          responseEvents: unresolvedEvents
        } 
      };
    } else {
      logs.push('✓ 没有需要响应的事件');
    }

    return { success: true, logs, canProceed: true };
  }

  resolveResponseEvent(eventId: string, response: 'accept' | 'reject'): boolean {
    if (!this.state) return false;

    const event = this.state.responseEvents.find(e => e.id === eventId);
    if (!event || event.responded) return false;

    event.responded = true;
    this.state.phaseLogs.push(`⏱️ 响应事件【${event.description}】: ${response === 'accept' ? '✅ 接受' : '❌ 拒绝'}`);
    
    this.notifyStateChange();
    return true;
  }

  addPendingJudgment(judgment: LevelPendingJudgment): void {
    if (!this.state) return;
    this.state.pendingJudgments.push(judgment);
    this.notifyStateChange();
  }

  addResponseEvent(event: LevelResponseEvent): void {
    if (!this.state) return;
    this.state.responseEvents.push(event);
    this.notifyStateChange();
  }

  executeDiscardPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const handLimit = getLevelHandLimit(this.state.round);
    const currentHandSize = this.state.playerState.hand.length;

    logs.push(`📋 手牌上限: ${handLimit}张 (轮次 ${this.state.round})`);
    logs.push(`🎴 当前手牌: ${currentHandSize}张`);

    if (currentHandSize <= handLimit) {
      logs.push(`✅ 手牌数量符合要求（${currentHandSize}/${handLimit}），自动进入结束阶段`);
      // 手牌数量符合要求，可以自动推进到结束阶段
      return { success: true, logs, canProceed: true };
    }

    const discardCount = currentHandSize - handLimit;
    logs.push(`⚠️ 需要弃置 ${discardCount} 张卡牌`);
    logs.push('💡 请选择要弃置的卡牌，或点击"结束弃牌"自动弃置');

    return { 
      success: true, 
      logs, 
      canProceed: false,
      phaseData: { 
        requiresDiscard: true, 
        discardCount,
        handLimit 
      } 
    };
  }

  discardCard(cardIndex: number): boolean {
    if (!this.state) return false;

    const handLimit = getLevelHandLimit(this.state.round);
    if (this.state.playerState.hand.length <= handLimit) return false;

    if (cardIndex < 0 || cardIndex >= this.state.playerState.hand.length) return false;

    const card = this.state.playerState.hand.splice(cardIndex, 1)[0];
    this.state.playerState.discardPile.push(card);

    this.state.phaseLogs.push(`🗑️ 弃置卡牌: ${card.name}`);

    if (this.state.playerState.hand.length <= handLimit) {
      this.state.phaseLogs.push(`✅ 弃牌完成，保留 ${this.state.playerState.hand.length} 张手牌`);
    }

    this.notifyStateChange();
    return true;
  }

  endDiscardPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const handLimit = getLevelHandLimit(this.state.round);
    const currentHandSize = this.state.playerState.hand.length;

    if (currentHandSize > handLimit) {
      const discardCount = currentHandSize - handLimit;
      for (let i = 0; i < discardCount; i++) {
        if (this.state.playerState.hand.length > 0) {
          const card = this.state.playerState.hand.pop()!;
          this.state.playerState.discardPile.push(card);
          logs.push(`🗑️ 自动弃置: ${card.name}`);
        }
      }
    }

    logs.push(`✅ 弃牌阶段结束，保留 ${this.state.playerState.hand.length} 张手牌`);

    return { success: true, logs, canProceed: true };
  }

  private executeEndPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];

    logs.push('🏁 结束阶段: 清除临时效果');
    this.state.playerState.actionPoints = 0;

    // 减少持续效果的剩余回合数
    logs.push('⏳ 更新持续效果...');
    this.decrementEffectTurns();
    
    // 显示当前活跃效果
    const activeEffects = this.getActiveEffects();
    if (activeEffects.length > 0) {
      logs.push(`📋 当前活跃效果: ${activeEffects.length} 个`);
      activeEffects.forEach(effect => {
        logs.push(`  - ${effect.description} (剩余 ${effect.remainingTurns} 回合)`);
      });
    } else {
      logs.push('📋 当前无活跃效果');
    }

    logs.push('✓ 回合结束');

    return { success: true, logs, canProceed: true };
  }

  // 存储需要区域选择的卡牌信息
  private pendingAreaSelectionCard: { cardIndex: number; card: Card } | null = null;

  /**
   * 检查卡牌是否需要区域选择
   */
  private cardNeedsAreaSelection(card: Card): boolean {
    const effect = card.effects?.[0];
    if (!effect) return false;
    
    // 需要区域选择的卡牌效果类型
    const areaEffectTypes = [
      'area_defense',
      'infiltration_reduce',
      'trap_set',
      'skill_immunity',
      'defense_marker',
      'dice_check'
    ];
    
    return areaEffectTypes.includes(effect.type);
  }

  /**
   * 获取卡牌区域选择提示信息
   */
  getCardAreaSelectionInfo(card: Card): { title: string; description: string } | null {
    if (!this.cardNeedsAreaSelection(card)) return null;
    
    const effect = card.effects?.[0];
    if (!effect) return null;
    
    switch (effect.type) {
      case 'area_defense':
        return {
          title: '选择目标区域',
          description: '请选择一个区域放置防御标记'
        };
      case 'infiltration_reduce':
        return {
          title: '选择目标区域',
          description: '请选择一个区域移除敌方标记'
        };
      case 'trap_set':
        return {
          title: '选择陷阱位置',
          description: '请选择一个区域设置陷阱'
        };
      case 'skill_immunity':
        return {
          title: '选择保护区域',
          description: '请选择一个区域获得技能免疫'
        };
      case 'dice_check':
        const isImmediate = this.isImmediateJudgmentCard(card);
        return {
          title: '选择目标区域',
          description: isImmediate 
            ? `请选择一个区域执行【${card.name}】的即时判定效果`
            : `请选择一个区域，【${card.name}】将在下回合判定阶段执行延时判定效果`
        };
      default:
        return {
          title: '选择目标区域',
          description: '请选择一个区域执行卡牌效果'
        };
    }
  }

  playCard(cardIndex: number): boolean | 'needs_area_selection' | 'needs_advance_to_response' {
    if (!this.state) return false;

    if (this.state.currentPhase !== 'action') {
      return false;
    }

    const card = this.state.playerState.hand[cardIndex];
    if (!card) return false;

    if (this.state.playerState.actionPoints <= 0) return false;

    // 检查是否需要区域选择
    const needsAreaSelection = this.cardNeedsAreaSelection(card);
    console.log(`[LevelGameStateManager] playCard: ${card.name}, needsAreaSelection: ${needsAreaSelection}, effects:`, card.effects);
    
    if (needsAreaSelection) {
      this.pendingAreaSelectionCard = { cardIndex, card };
      return 'needs_area_selection';
    }

    // 不需要区域选择，直接执行
    return this.executePlayCard(cardIndex, card);
  }

  /**
   * 执行区域选择后的卡牌效果
   */
  playCardWithAreaSelection(area: AreaType): boolean | 'needs_advance_to_response' {
    if (!this.state || !this.pendingAreaSelectionCard) return false;
    
    const { cardIndex, card } = this.pendingAreaSelectionCard;
    
    // 执行卡牌效果，传入选择的区域
    const result = this.executePlayCard(cardIndex, card, area);
    
    if (result) {
      this.pendingAreaSelectionCard = null;
    }
    
    return result;
  }

  /**
   * 取消区域选择
   */
  cancelAreaSelection(): void {
    this.pendingAreaSelectionCard = null;
  }

  /**
   * 获取当前待区域选择的卡牌
   */
  getPendingAreaSelectionCard(): Card | null {
    return this.pendingAreaSelectionCard?.card || null;
  }

  private executePlayCard(cardIndex: number, card: Card, selectedArea?: AreaType): boolean | 'needs_advance_to_response' {
    if (!this.state) return false;

    const cost = card.cost || {};
    
    console.log('[LevelGameStateManager] executePlayCard - 卡牌:', card.name, '资源消耗:', cost);
    console.log('[LevelGameStateManager] executePlayCard - 当前资源:', this.state.playerState.resources);
    
    if (cost.compute && this.state.playerState.resources.computing < cost.compute) {
      this.state.phaseLogs.push(`❌ 算力不足，需要 ${cost.compute} 点`);
      return false;
    }
    if (cost.funds && this.state.playerState.resources.funds < cost.funds) {
      this.state.phaseLogs.push(`❌ 资金不足，需要 ${cost.funds} 点`);
      return false;
    }
    if (cost.information && this.state.playerState.resources.information < cost.information) {
      this.state.phaseLogs.push(`❌ 信息不足，需要 ${cost.information} 点`);
      return false;
    }

    if (cost.compute) {
      this.state.playerState.resources.computing -= cost.compute;
      this.state.phaseLogs.push(`💻 消耗算力: ${cost.compute}`);
    }
    if (cost.funds) {
      this.state.playerState.resources.funds -= cost.funds;
      this.state.phaseLogs.push(`💰 消耗资金: ${cost.funds}`);
    }
    if (cost.information) {
      this.state.playerState.resources.information -= cost.information;
      this.state.phaseLogs.push(`📊 消耗信息: ${cost.information}`);
    }
    
    console.log('[LevelGameStateManager] executePlayCard - 消耗后资源:', this.state.playerState.resources);

    // 从手牌移除
    this.state.playerState.hand.splice(cardIndex, 1);
    this.state.playerState.discardPile.push(card);
    this.state.playerState.actionPoints -= 1;

    // 检查是否是防御卡牌
    const isDefenseCard = card.faction === 'defense' || 
                          card.type?.includes('defense') || 
                          card.type === 'basic_defense' ||
                          card.type === 'intrusion_detection' ||
                          card.type === 'active_defense' ||
                          card.type === 'defense_in_depth' ||
                          card.type?.includes('防御');
    
    if (isDefenseCard) {
      this.state.playerState.defenseCardsUsed += 1;
      this.state.phaseLogs.push(`🛡️ 使用防御卡牌: ${card.name} (${this.state.playerState.defenseCardsUsed}/${this.state.objectives.find(obj => obj.type === 'use_defense_cards')?.target || '?'})`);
    }

    // 应用卡牌效果，传入选择的区域
    const needsResponsePhase = this.applyCardEffect(card, selectedArea);

    this.state.phaseLogs.push(`🃏 打出卡牌: ${card.name}`);
    this.notifyStateChange();
    return needsResponsePhase ? 'needs_advance_to_response' : true;
  }

  private applyCardEffect(card: Card, selectedArea?: AreaType): boolean {
    if (!this.state) return false;

    const effect = card.effects?.[0] as any;
    if (!effect) return false;

    // 使用玩家选择的区域，如果没有选择则使用卡牌默认区域或internal
    const targetArea: AreaType = selectedArea || effect.targetArea || 'internal';

    // 获取区域特性修正
    const areaTraitModifier = this.getAreaTraitModifier(targetArea, 'place_friendly');
    if (areaTraitModifier !== 0) {
      // 应用区域特性修正：安全区域返还行动点
      this.state.playerState.actionPoints = Math.min(
        this.state.playerState.maxActionPoints,
        this.state.playerState.actionPoints - areaTraitModifier
      );
      const traitDesc = this.getAreaTraitDescription(targetArea);
      this.state.phaseLogs.push(`🌟 区域特性生效：${traitDesc}`);
    }

    let needsResponsePhase = false;

    switch (effect.type) {
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.securityLevel + (effect.baseValue || 1),
          this.state.playerState.maxSecurityLevel
        );
        this.state.phaseLogs.push(`🛡️ 安全等级 +${effect.baseValue || 1}`);
        break;
      case 'resource_gain':
        if (effect.resourceType === 'compute') {
          this.state.playerState.resources.computing += effect.value || 1;
          this.state.phaseLogs.push(`💻 算力 +${effect.value || 1}`);
        } else if (effect.resourceType === 'information') {
          this.state.playerState.resources.information += effect.value || 1;
          this.state.phaseLogs.push(`📊 信息 +${effect.value || 1}`);
        } else if (effect.resourceType === 'funds') {
          this.state.playerState.resources.funds += effect.value || 1;
          this.state.phaseLogs.push(`💰 资金 +${effect.value || 1}`);
        }
        break;
      case 'infiltration_reduce':
        // 系统重写类卡牌：移除目标区域的所有敌方标记
        const allAttackMarkers = this.state.areaControl[targetArea].attackMarkers;
        this.state.areaControl[targetArea].attackMarkers = 0;
        
        // 如果是"系统重写"卡牌，添加弃置手牌要求
        if (card.name === '系统重写') {
          // 弃置手牌要求
          if (this.state.playerState.hand.length > 0) {
            const discardCard = this.state.playerState.hand.pop()!;
            this.state.playerState.discardPile.push(discardCard);
            this.state.phaseLogs.push(`🗑️ 弃置手牌: ${discardCard.name}`);
          }
          
          // 添加系统重写效果标记（用于胜利条件检查）
          this.addActiveEffect({
            id: `system_rewrite_${Date.now()}`,
            type: 'other',
            source: card.name,
            targetArea,
            remainingTurns: 99, // 持续到游戏结束
            description: '系统重写已执行',
            appliedAt: this.state.currentTurn
          });
          
          this.state.phaseLogs.push(`🧹 系统重写！在${this.getLevelAreaName(targetArea)}移除了${allAttackMarkers}个敌方标记`);
          this.state.phaseLogs.push(`🔄 系统重写卡牌已使用！`);
        } else {
          // 其他卡牌的常规效果
          this.state.phaseLogs.push(`🧹 在${this.getLevelAreaName(targetArea)}移除了${allAttackMarkers}个敌方标记`);
        }
        
        this.updateAreaControl();
        break;
      case 'area_defense':
        // 签名接种类卡牌：添加持续效果
        this.state.areaControl[targetArea].defenseMarkers += effect.value || 1;
        // 添加持续效果
        this.addActiveEffect({
          id: `vaccinated_${Date.now()}`,
          type: 'vaccinated',
          source: card.name,
          targetArea,
          remainingTurns: 3,
          description: '病毒免疫',
          appliedAt: this.state.currentTurn
        });
        // 添加特殊效果标记
        if (!this.state.areaControl[targetArea].specialEffects.includes('已接种')) {
          this.state.areaControl[targetArea].specialEffects.push('已接种');
        }
        this.state.phaseLogs.push(`💉 在${this.getLevelAreaName(targetArea)}完成签名接种，病毒免疫3回合`);
        this.updateAreaControl();
        break;
      case 'defense_marker':
        // 增加防御标记（通用效果）
        this.state.areaControl[targetArea].defenseMarkers += effect.value || 1;
        this.state.phaseLogs.push(`🛡️ 在${this.getLevelAreaName(targetArea)}放置了${effect.value || 1}个防御标记`);
        this.updateAreaControl();
        break;
      case 'trap_set':
        // 来路不明软盘类卡牌：设置陷阱（持续效果）
        this.addActiveEffect({
          id: `trap_${Date.now()}`,
          type: 'trap',
          source: card.name,
          targetArea,
          remainingTurns: 5, // 陷阱持续5回合
          description: '陷阱',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[targetArea].specialEffects.includes('陷阱')) {
          this.state.areaControl[targetArea].specialEffects.push('陷阱');
        }
        this.state.phaseLogs.push(`⚠️ 在${this.getLevelAreaName(targetArea)}设置了陷阱，持续5回合`);
        break;
      case 'skill_immunity':
        // 病毒库更新类卡牌：技能免疫（持续效果）
        this.addActiveEffect({
          id: `skill_immunity_${Date.now()}`,
          type: 'skill_immunity',
          source: card.name,
          targetArea,
          remainingTurns: 3, // 技能免疫持续3回合
          description: '技能免疫',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[targetArea].specialEffects.includes('技能免疫')) {
          this.state.areaControl[targetArea].specialEffects.push('技能免疫');
        }
        // 恢复行动点
        const actionPointRecovery = effect.baseValue || 1;
        this.state.playerState.actionPoints = Math.min(
          this.state.playerState.maxActionPoints,
          this.state.playerState.actionPoints + actionPointRecovery
        );
        this.state.phaseLogs.push(`🛡️ ${this.getLevelAreaName(targetArea)}获得技能免疫3回合，恢复${actionPointRecovery}行动点`);
        break;
      case 'dice_check':
        const isImmediateJudgment = this.isImmediateJudgmentCard(card);
        if (isImmediateJudgment) {
          this.state.phaseLogs.push(`🎲 使用判定卡牌: ${card.name} - 将在响应阶段执行`);
          this.createPendingJudgment(card, effect, selectedArea, true);
          needsResponsePhase = true;
        } else {
          this.state.phaseLogs.push(`🎲 使用延时判定卡牌: ${card.name} - 将在判定阶段执行`);
          this.createPendingJudgment(card, effect, selectedArea, false);
        }
        break;
    }

    this.updateObjectives();
    return needsResponsePhase;
  }

  private isImmediateJudgmentCard(card: Card): boolean {
    const effect = card.effects?.[0] as any;
    if (effect && 'isDelayed' in effect) {
      const isDelayed = effect.isDelayed;
      return !isDelayed;
    }
    const cardCode = card.card_code || '';
    if (cardCode.startsWith('LI')) {
      return true;
    }
    if (cardCode.startsWith('LA')) {
      return false;
    }
    return true;
  }

  /**
   * 触发判定UI界面
   */
  private triggerJudgmentUI(judgment: any, phase: 'judgment' | 'response'): void {
    console.log(`[LevelGameStateManager] 触发判定UI: ${judgment.cardName}, 阶段: ${phase}`);
    
    // 通过事件总线触发判定界面
    JudgmentEventBus.emitJudgmentStart({
      id: judgment.id,
      type: 'dice',
      phase: phase,
      title: judgment.cardName || '判定',
      description: judgment.description || '进行判定',
      initiatorId: judgment.sourcePlayerId || 'player',
      initiatorName: '玩家',
      targetId: 'enemy',
      targetName: '敌方',
      difficulty: judgment.difficulty || 3,
      onSuccess: (judgment.onSuccess as any) || { description: '成功' },
      onFailure: (judgment.onFailure as any) || { description: '失败' },
      onCriticalSuccess: (judgment.onCriticalSuccess as any),
      onCriticalFailure: (judgment.onCriticalFailure as any),
      cardName: judgment.cardName,
    });
  }

  /**
   * 处理判定完成结果
   */
  resolveJudgmentWithResult(judgmentId: string, resultData: any): boolean {
    if (!this.state) return false;

    const judgment = this.state.pendingJudgments.find(j => j.id === judgmentId);
    if (!judgment || judgment.resolved) return false;

    console.log('[LevelGameStateManager] resolveJudgmentWithResult:', judgmentId, resultData);
    
    // 标记为已解决
    judgment.resolved = true;
    
    // 记录日志
    this.state.phaseLogs.push(`🎲 判定【${judgment.cardName}】: ${resultData.detail || '完成'}`);
    
    // 获取目标区域
    const targetArea = (judgment as any).targetArea || 'internal';
    
    // 确定使用哪个效果（成功/失败/大成功/大失败）
    let effectToApply: any;
    if (resultData.isCriticalSuccess && (judgment as any).onCriticalSuccess) {
      effectToApply = (judgment as any).onCriticalSuccess;
      this.state.phaseLogs.push(`🎲 大成功！应用大成功效果`);
    } else if (resultData.isCriticalFailure && (judgment as any).onCriticalFailure) {
      effectToApply = (judgment as any).onCriticalFailure;
      this.state.phaseLogs.push(`🎲 大失败！应用大失败效果`);
    } else if (resultData.success) {
      effectToApply = (judgment as any).onSuccess;
      this.state.phaseLogs.push(`🎲 判定成功！应用成功效果`);
    } else {
      effectToApply = (judgment as any).onFailure;
      this.state.phaseLogs.push(`🎲 判定失败！应用失败效果`);
    }
    
    // 应用效果
    if (effectToApply) {
      this.applyDiceCheckEffectResult(effectToApply, targetArea);
    }
    
    // 通知状态变化
    this.notifyStateChange();
    
    // 检查是否还有未处理的判定
    const currentPhase = this.state.currentPhase;
    const hasMoreJudgments = this.checkAndContinuePhase(currentPhase);
    
    if (!hasMoreJudgments) {
      // 没有更多判定，进入下一阶段
      setTimeout(() => {
        this.advancePhase();
      }, 500);
    }
    
    return true;
  }

  /**
   * 检查当前阶段是否还有未处理的内容并继续执行
   * 返回 true 表示还有内容需要处理，false 表示可以进入下一阶段
   */
  private checkAndContinuePhase(currentPhase: LevelTurnPhase): boolean {
    if (!this.state) return false;

    console.log('[LevelGameStateManager] checkAndContinuePhase:', currentPhase);

    if (currentPhase === 'judgment') {
      // 检查是否还有未处理的延时判定
      const pendingDelayedJudgments = this.state.pendingJudgments.filter(
        j => !j.resolved && !j.isImmediate
      );
      
      console.log('[LevelGameStateManager] 剩余延时判定:', pendingDelayedJudgments.length);
      
      if (pendingDelayedJudgments.length > 0) {
        // 继续触发下一个判定
        const nextJudgment = pendingDelayedJudgments[0];
        this.triggerJudgmentUI(nextJudgment, 'judgment');
        return true;
      }
    } else if (currentPhase === 'response') {
      // 首先检查是否还有未处理的即时判定
      const pendingImmediateJudgments = this.state.pendingJudgments.filter(
        j => !j.resolved && j.isImmediate === true
      );
      
      console.log('[LevelGameStateManager] 剩余即时判定:', pendingImmediateJudgments.length);
      
      if (pendingImmediateJudgments.length > 0) {
        // 继续触发下一个判定
        const nextJudgment = pendingImmediateJudgments[0];
        this.triggerJudgmentUI(nextJudgment, 'response');
        return true;
      }
      
      // 检查是否还有未处理的响应事件
      const pendingResponseEvents = this.state.responseEvents.filter(e => !e.responded);
      
      console.log('[LevelGameStateManager] 剩余响应事件:', pendingResponseEvents.length);
      
      if (pendingResponseEvents.length > 0) {
        // 这里可以继续处理响应事件，暂时返回false让流程继续
        return false;
      }
    }
    
    return false;
  }



  private createPendingJudgment(card: Card, effect: any, selectedArea?: AreaType, isImmediate?: boolean): void {
    if (!this.state) return;

    const isImmediateJudgment = isImmediate ?? this.isImmediateJudgmentCard(card);
    const judgmentType = isImmediateJudgment ? 'immediate' : 'delayed';
    const judgmentId = `${judgmentType}_judgment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingJudgment: any = {
      id: judgmentId,
      type: 'dice' as const,
      targetPlayerId: 'enemy',
      cardId: card.card_code,
      cardName: card.name,
      description: effect.description as string || `${isImmediateJudgment ? '即时' : '延时'}判定: ${card.name}`,
      difficulty: (effect.difficulty as number) || 3,
      onSuccess: effect.onSuccess as Record<string, unknown>,
      onFailure: effect.onFailure as Record<string, unknown>,
      onCriticalSuccess: effect.onCriticalSuccess as Record<string, unknown>,
      onCriticalFailure: effect.onCriticalFailure as Record<string, unknown>,
      sourcePlayerId: 'player',
      targetArea: selectedArea || effect.targetArea as string || 'internal',
      resolved: false,
      timestamp: Date.now(),
      isImmediate: isImmediateJudgment,
      effects: {
        success: { description: (effect.onSuccess as any)?.description || '成功' },
        failure: { description: (effect.onFailure as any)?.description || '失败' }
      }
    };

    this.state.pendingJudgments.push(pendingJudgment);
    
    if (isImmediateJudgment) {
      this.state.phaseLogs.push(`🎯 创建即时判定: ${card.name} - 将在响应阶段执行`);
    } else {
      this.state.phaseLogs.push(`⏳ 创建延时判定: ${card.name} - 将在判定阶段执行`);
    }

    const difficulty = (effect.difficulty as number) || 3;
    console.log(`[LevelGameStateManager] 已创建${isImmediateJudgment ? '即时' : '延时'}判定: ${card.name}, 难度: ${difficulty}, 将在${isImmediateJudgment ? '响应' : '判定'}阶段执行`);
    
    this.notifyStateChange();
  }

  private applyDiceCheckEffectResult(effect: any, targetArea: string = 'internal'): void {
    if (!this.state) return;

    const effects = effect.effects as Array<any> || 
                    effect.additionalEffects as Array<any>;
    
    if (effects && Array.isArray(effects)) {
      for (const subEffect of effects) {
        this.applyDiceCheckEffectResult(subEffect, targetArea);
      }
      return;
    }

    const effectType = effect.type as string;
    const baseValue = (effect.baseValue as number) || 0;
    const value = (effect.value as number) || 0;
    const amount = baseValue || value;

    const securityChange = (effect.securityChange as number) || 
                           (effect.securityBonus as number) || 
                           (effect.securityPenalty as number);
    const infiltrationChange = (effect.infiltrationChange as number) || 
                               (effect.infiltrationBonus as number) || 
                               (effect.infiltrationPenalty as number);

    const actualTargetArea = effect.targetArea as string || targetArea;

    if (securityChange !== undefined) {
      if (securityChange > 0) {
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.maxSecurityLevel,
          this.state.playerState.securityLevel + securityChange
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 +${securityChange}`);
      } else if (securityChange < 0) {
        this.state.playerState.securityLevel = Math.max(0,
          this.state.playerState.securityLevel + securityChange
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 ${securityChange}`);
      }
    }

    if (infiltrationChange !== undefined) {
      if (infiltrationChange > 0) {
        this.state.teamSharedLevels.player.infiltrationLevel = Math.min(100,
          this.state.teamSharedLevels.player.infiltrationLevel + infiltrationChange
        );
        this.state.phaseLogs.push(`⬆️ 渗透等级 +${infiltrationChange}`);
      } else if (infiltrationChange < 0) {
        this.state.teamSharedLevels.player.infiltrationLevel = Math.max(0,
          this.state.teamSharedLevels.player.infiltrationLevel + infiltrationChange
        );
        this.state.phaseLogs.push(`⬇️ 渗透等级 ${infiltrationChange}`);
      }
    }

    switch (effectType) {
      case 'infiltration_gain':
        this.state.teamSharedLevels.player.infiltrationLevel = Math.min(100,
          this.state.teamSharedLevels.player.infiltrationLevel + amount
        );
        this.state.phaseLogs.push(`⬆️ 渗透等级 +${amount}`);
        break;
      case 'infiltration_reduce':
        this.state.teamSharedLevels.player.infiltrationLevel = Math.max(0,
          this.state.teamSharedLevels.player.infiltrationLevel - amount
        );
        this.state.phaseLogs.push(`⬇️ 渗透等级 -${amount}`);
        break;
      case 'security_reduce':
        this.state.playerState.securityLevel = Math.max(0,
          this.state.playerState.securityLevel - amount
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 -${amount}`);
        break;
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.maxSecurityLevel,
          this.state.playerState.securityLevel + amount
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 +${amount}`);
        break;
      case 'resource_gain':
        const resourceType = effect.resourceType as string;
        if (resourceType === 'compute') {
          this.state.playerState.resources.computing = Math.min(15,
            this.state.playerState.resources.computing + amount
          );
          this.state.phaseLogs.push(`💻 算力 +${amount}`);
        } else if (resourceType === 'information') {
          this.state.playerState.resources.information = Math.min(12,
            this.state.playerState.resources.information + amount
          );
          this.state.phaseLogs.push(`📊 信息 +${amount}`);
        } else if (resourceType === 'funds') {
          this.state.playerState.resources.funds = Math.min(20,
            this.state.playerState.resources.funds + amount
          );
          this.state.phaseLogs.push(`💰 资金 +${amount}`);
        } else if (resourceType === 'action') {
          this.state.phaseLogs.push(`⚡ 行动点效果: ${effect.description || '无描述'}`);
        }
        break;
      case 'area_defense':
        // 添加持续效果
        this.addActiveEffect({
          id: `vaccinated_${Date.now()}`,
          type: 'vaccinated',
          source: '判定效果',
          targetArea: actualTargetArea as any,
          remainingTurns: 3,
          description: '病毒免疫',
          appliedAt: this.state.currentTurn
        });
        this.state.areaControl[actualTargetArea as any].defenseMarkers += effect.value || 1;
        if (!this.state.areaControl[actualTargetArea as any].specialEffects.includes('已接种')) {
          this.state.areaControl[actualTargetArea as any].specialEffects.push('已接种');
        }
        this.state.phaseLogs.push(`💉 在${this.getLevelAreaName(actualTargetArea as any)}完成签名接种，病毒免疫3回合`);
        this.updateAreaControl();
        break;
      case 'defense_marker':
        this.state.areaControl[actualTargetArea as any].defenseMarkers += effect.value || 1;
        this.state.phaseLogs.push(`🛡️ 在${this.getLevelAreaName(actualTargetArea as any)}放置了${effect.value || 1}个防御标记`);
        this.updateAreaControl();
        break;
      case 'trap_set':
        // 添加持续效果
        this.addActiveEffect({
          id: `trap_${Date.now()}`,
          type: 'trap',
          source: '判定效果',
          targetArea: actualTargetArea as any,
          remainingTurns: 5,
          description: '陷阱',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[actualTargetArea as any].specialEffects.includes('陷阱')) {
          this.state.areaControl[actualTargetArea as any].specialEffects.push('陷阱');
        }
        this.state.phaseLogs.push(`⚠️ 在${this.getLevelAreaName(actualTargetArea as any)}设置了陷阱，持续5回合`);
        break;
      case 'skill_immunity':
        // 添加持续效果
        this.addActiveEffect({
          id: `skill_immunity_${Date.now()}`,
          type: 'skill_immunity',
          source: '判定效果',
          targetArea: actualTargetArea as any,
          remainingTurns: 3,
          description: '技能免疫',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[actualTargetArea as any].specialEffects.includes('技能免疫')) {
          this.state.areaControl[actualTargetArea as any].specialEffects.push('技能免疫');
        }
        const actionPointRecovery = effect.baseValue || 1;
        this.state.playerState.actionPoints = Math.min(
          this.state.playerState.maxActionPoints,
          this.state.playerState.actionPoints + actionPointRecovery
        );
        this.state.phaseLogs.push(`🛡️ ${this.getLevelAreaName(actualTargetArea as any)}获得技能免疫3回合，恢复${actionPointRecovery}行动点`);
        break;
      default:
        if (!securityChange && !infiltrationChange) {
          this.state.phaseLogs.push(`⚠️ 未知效果类型: ${effectType}, 描述: ${effect.description || '无描述'}`);
        }
    }
  }

  async endTurn(): Promise<LevelPhaseResult> {
    // 检查是否正在结束回合，防止重复调用
    if (this.isEndingTurn) {
      console.log('[LevelGameStateManager] endTurn: 正在结束回合，忽略重复调用');
      return { success: false, logs: ['警告：回合结束正在进行中'], canProceed: false };
    }
    
    this.isEndingTurn = true;
    
    if (!this.state) {
      this.isEndingTurn = false;
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = ['═══════════════════════════════════'];
    logs.push(`📊 玩家回合 ${this.state.currentTurn} 结束`);

    // 设置AI控制器状态
    this.aiController.setState(this.state);

    // 玩家回合结束，递增 currentTurn 和 round
    this.incrementTurnAndRound(logs);

    // 执行大东AI回合（七个阶段）
    this.state.currentActor = 'dadong';
    this.state.isDadongTurn = true;
    this.notifyStateChange(); // 通知UI更新状态
    const dadongResult = await this.aiController.executeDadongTurn();
    logs.push(...dadongResult.logs);
    logs.push('🤖 大东AI回合执行完成');
    this.state.isDadongTurn = false;
    this.notifyStateChange(); // 通知UI更新状态
    
    // 大东回合结束，递增 currentTurn 和 round
    this.incrementTurnAndRound(logs);
    
    // 关键修复：在大东回合结束后添加短暂延迟，确保UI状态已更新
    await new Promise(resolve => setTimeout(resolve, 500));

    // 执行敌人1 AI回合（七个阶段）
    this.state.currentActor = 'enemy';
    this.state.isEnemyTurn = true;
    this.notifyStateChange(); // 通知UI更新状态
    const enemyResult = await this.aiController.executeEnemyTurn('enemy1');
    logs.push(...enemyResult.logs);
    logs.push('👾 敌人1回合执行完成');
    this.state.isEnemyTurn = false;
    this.notifyStateChange(); // 通知UI更新状态
    
    // 敌人1回合结束，递增 currentTurn 和 round
    this.incrementTurnAndRound(logs);
    
    // 关键修复：在敌人1回合结束后添加短暂延迟，确保UI状态已更新
    await new Promise(resolve => setTimeout(resolve, 500));

    // 执行敌人2 AI回合（七个阶段）- 如果存在敌人2
    if (this.state.enemy2State) {
      this.state.currentActor = 'enemy2';
      this.state.isEnemy2Turn = true;
      this.notifyStateChange(); // 通知UI更新状态
      const enemy2Result = await this.aiController.executeEnemyTurn('enemy2');
      logs.push(...enemy2Result.logs);
      logs.push('👾 敌人2回合执行完成');
      this.state.isEnemy2Turn = false;
      this.notifyStateChange(); // 通知UI更新状态
      
      // 敌人2回合结束，递增 currentTurn 和 round
      this.incrementTurnAndRound(logs);
      
      // 关键修复：在敌人2回合结束后添加短暂延迟，确保UI状态已更新
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 重置阶段和行动者 - 进入新轮次
    this.state.currentPhase = 'judgment';
    this.state.currentActor = 'player';
    this.state.phaseLogs = [];
    this.notifyStateChange(); // 通知UI更新状态

    this.updateObjectives();
    const gameEndResult = this.checkGameEnd();

    // 释放锁
    this.isEndingTurn = false;

    if (gameEndResult) {
      logs.push(...gameEndResult.logs);
      return { 
        success: true, 
        logs, 
        canProceed: false,
        phaseData: gameEndResult 
      };
    }

    this.notifyStateChange();
    return { success: true, logs, canProceed: true };
  }

  /**
   * 递增 currentTurn 和 round 的辅助方法
   */
  private incrementTurnAndRound(logs: string[]): void {
    if (!this.state) return;

    this.state.currentTurn += 1;
    // 每4个回合（玩家+大东+敌人1+敌人2）= 1个轮次
    const newRound = Math.ceil(this.state.currentTurn / 4);
    const oldRound = this.state.round;
    this.state.round = newRound;

    if (newRound > oldRound) {
      logs.push(`🔄 ====== 进入轮次 ${newRound} ======`);
      console.log(`[LevelGameStateManager] Round changed from ${oldRound} to ${newRound}, currentTurn: ${this.state.currentTurn}`);
    }

    // 处理潜伏标记：减少剩余回合，到0时转为攻击标记
    this.processLatentMarkers(logs);

    this.notifyStateChange();
  }

  // 处理潜伏标记的转换
  private processLatentMarkers(logs: string[]): void {
    if (!this.state) return;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    let totalConverted = 0;

    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      if (areaState.latentMarkers && areaState.latentMarkers.length > 0) {
        const remainingMarkers: typeof areaState.latentMarkers = [];

        for (const marker of areaState.latentMarkers) {
          marker.remainingTurns -= 1;

          if (marker.remainingTurns <= 0) {
            // 转为攻击标记
            areaState.attackMarkers += 1;
            totalConverted++;
          } else {
            // 保留剩余回合的标记
            remainingMarkers.push(marker);
          }
        }

        areaState.latentMarkers = remainingMarkers;
      }
    }

    if (totalConverted > 0) {
      logs.push(`⚠️ ${totalConverted}个潜伏标记转为攻击标记！`);
      console.log(`[LevelGameStateManager] ${totalConverted}个潜伏标记转为攻击标记`);
    }
  }

  private executeDadongAITurn(): void {
    if (!this.state || !this.state.dadongAIState.isActive) return;

    // 恢复大东AI的行动点
    this.state.dadongAIState.actionPoints = this.state.dadongAIState.maxActionPoints;

    // 大东AI抽牌阶段
    const cardsToDraw = DADONG_AI.behavior.cardsPerTurn;
    for (let i = 0; i < cardsToDraw; i++) {
      if (this.state.playerState.deck.length > 0) {
        const card = this.state.playerState.deck.pop()!;
        this.state.dadongAIState.hand.push(card);
      }
    }

    this.state.phaseLogs.push(`🤖 大东AI回合开始，行动点: ${this.state.dadongAIState.actionPoints}`);

    // 大东AI出牌阶段 - 使用资源系统
    let cardsPlayed = 0;
    while (this.state.dadongAIState.actionPoints > 0 && this.state.dadongAIState.hand.length > 0) {
      // 找出可以打出的卡牌（资源足够）
      const playableCards = this.state.dadongAIState.hand.filter((card, index) => {
        const cost = card.cost || {};
        return (
          (cost.compute || 0) <= this.state!.dadongAIState.resources.computing &&
          (cost.funds || 0) <= this.state!.dadongAIState.resources.funds &&
          (cost.information || 0) <= this.state!.dadongAIState.resources.information
        );
      });

      if (playableCards.length === 0) break;

      // 随机选择一张可打的卡牌
      const randomIndex = Math.floor(Math.random() * playableCards.length);
      const card = playableCards[randomIndex];
      const handIndex = this.state.dadongAIState.hand.indexOf(card);
      
      // 扣除资源
      const cost = card.cost || {};
      this.state.dadongAIState.resources.computing -= (cost.compute || 0);
      this.state.dadongAIState.resources.funds -= (cost.funds || 0);
      this.state.dadongAIState.resources.information -= (cost.information || 0);
      this.state.dadongAIState.actionPoints -= 1;
      
      // 从手牌移除
      this.state.dadongAIState.hand.splice(handIndex, 1);
      this.state.dadongAIState.lastPlayedCard = card;
      cardsPlayed++;

      // 应用卡牌效果
      this.applyDadongCardEffect(card);
      
      this.state.phaseLogs.push(`🤖 大东打出: ${card.name}`);
    }

    // 大东AI资源恢复
    this.state.dadongAIState.resources.computing += 3;
    this.state.dadongAIState.resources.funds += 3;
    this.state.dadongAIState.resources.information += 3;

    this.state.phaseLogs.push(`🤖 大东AI回合结束，打出${cardsPlayed}张卡牌`);
  }

  private applyDadongCardEffect(card: Card): void {
    if (!this.state) return;

    const effect = card.effects?.[0];
    if (!effect) return;

    switch (effect.type) {
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.securityLevel + (effect.baseValue || 1) + this.state.dadongAIState.cooperationBonus,
          this.state.playerState.maxSecurityLevel
        );
        break;
      case 'resource_gain':
        if (effect.resourceType === 'compute') {
          this.state.playerState.resources.computing += effect.value || 1;
        } else if (effect.resourceType === 'information') {
          this.state.playerState.resources.information += effect.value || 1;
        }
        break;
      case 'infiltration_reduce':
        this.state.enemyState.infiltrationLevel = Math.max(
          0,
          this.state.enemyState.infiltrationLevel - (effect.baseValue || 1)
        );
        break;
      case 'area_defense':
        if (effect.targetArea) {
          this.state.areaControl[effect.targetArea].defenseMarkers += effect.value || 1;
          this.updateAreaControl();
        } else {
          this.state.areaControl.internal.defenseMarkers += effect.value || 1;
          this.updateAreaControl();
        }
        break;
    }
  }

  private executeEnemyTurn(): void {
    if (!this.state) return;

    const enemyConfig = this.state.currentLevel.enemyConfig;

    this.state.enemyState.infiltrationLevel += 1;

    for (const pattern of enemyConfig.attackPattern) {
      if (pattern.turn === 'all' || pattern.turn === this.state.currentTurn) {
        this.executeEnemyAttack(pattern.intensity);
      }
    }

    for (const ability of enemyConfig.specialAbilities) {
      this.executeEnemyAbility(ability);
    }
  }

  private executeEnemyAbility(ability: EnemySpecialAbility): void {
    if (!this.state) return;

    const abilityName = ability.name;
    const abilityCooldown = this.state.enemyState.skillCooldowns?.[abilityName] || 0;

    if (abilityCooldown > 0) {
      this.state.enemyState.skillCooldowns![abilityName] = abilityCooldown - 1;
      return;
    }

    let abilityExecuted = false;

    switch (abilityName) {
      case '供应链渗透':
      case '供应链渗透2':
        abilityExecuted = this.executeSupplyChainInfiltration();
        break;
      case '依赖投毒':
      case '仓库污染':
        abilityExecuted = this.executeDependencyPoison();
        break;
      case '零日漏洞':
      case '零日漏洞利用':
        abilityExecuted = this.executeZeroDayExploit();
        break;
      case '隐形攻击':
      case '无声渗透':
        abilityExecuted = this.executeStealthAttack();
        break;
      case '漏洞利用制作':
      case '漏洞利用积累':
        abilityExecuted = this.executeExploitCrafting();
        break;
      case '云端突破':
      case '云服务入侵':
        abilityExecuted = this.executeCloudBreach();
        break;
      case '配置利用':
      case '错误配置利用':
        abilityExecuted = this.executeMisconfigExploit();
        break;
      case '数据外传':
      case '数据批量外传':
        abilityExecuted = this.executeDataExfiltration();
        break;
      case '隐形复制':
      case '静默窃取':
        abilityExecuted = this.executeStealthCopy();
        break;
      case '合约攻击':
      case '智能合约渗透':
        abilityExecuted = this.executeContractAttack();
        break;
      case '重入攻击':
      case '递归调用漏洞':
        abilityExecuted = this.executeReentrancyExploit();
        break;
      case '双花攻击':
      case '双重支付':
        abilityExecuted = this.executeDoubleSpendAttack();
        break;
      case '对抗样本':
      case 'AI模型误导':
        abilityExecuted = this.executeAdversarialInput();
        break;
      case '模型规避':
      case 'AI检测逃避':
        abilityExecuted = this.executeModelEvasion();
        break;
      case '模型提取':
      case '模型参数窃取':
        abilityExecuted = this.executeModelExtraction();
        break;
      case '知识蒸馏':
      case '模型行为学习':
        abilityExecuted = this.executeKnowledgeDistillation();
        break;
      case '量子密码分析':
      case '加密算法瓦解':
        abilityExecuted = this.executeQuantumCryptanalysis();
        break;
      case '密钥提取':
      case '密钥窃取':
        abilityExecuted = this.executeKeyExtraction();
        break;
      case '后量子算法':
      case '算法对抗':
        abilityExecuted = this.executePostQuantumAlgorithm();
        break;
      case '全能攻击':
      case '全面打击':
        abilityExecuted = this.executeOmniAttack();
        break;
      case '技能强化':
      case '伤害递增':
        abilityExecuted = this.executeSkillBoost();
        break;
      // LV36-40 敌人技能
      case 'BIOS破坏':
      case 'BIOS损坏':
        abilityExecuted = this.executeBIOSCorruption();
        break;
      case '硬件损坏':
      case '硬件报废':
        abilityExecuted = this.executeHardwareDamage();
        break;
      case '固件攻击':
      case '固件损坏':
        abilityExecuted = this.executeFirmwareAttack();
        break;
      case '持续复制':
      case '快速增殖':
        abilityExecuted = this.executeContinuousReplication();
        break;
      case '网络扫描':
      case '目标发现':
        abilityExecuted = this.executeNetworkScan();
        break;
      case '大规模复制':
      case '数量爆发':
        abilityExecuted = this.executeMassReplication();
        break;
      case '引导区感染':
      case '引导感染':
        abilityExecuted = this.executeBootSectorInfection();
        break;
      case '内存驻留':
      case '持久化':
        abilityExecuted = this.executeMemoryResidence();
        break;
      case 'MBR感染':
      case 'MBR修改':
        abilityExecuted = this.executeMBRInfection();
        break;
      case '文档感染':
      case '宏植入':
        abilityExecuted = this.executeDocumentInfection();
        break;
      case '宏执行':
      case '代码执行':
        abilityExecuted = this.executeMacroExecution();
        break;
      case '模板感染':
      case '模板污染':
        abilityExecuted = this.executeTemplateInfection();
        break;
      case '暴力破解':
      case '密码尝试':
        abilityExecuted = this.executeBruteForceAttack();
        break;
      case '彩虹表攻击':
      case '快速破解':
        abilityExecuted = this.executeRainbowTableAttack();
        break;
      case '字典猜测':
      case '密码猜测':
        abilityExecuted = this.executeDictionaryAttack();
        break;
      case '身份泛滥':
      case '身份创建':
        abilityExecuted = this.executeIdentityFlood();
        break;
      case '声誉操纵':
      case '声誉控制':
        abilityExecuted = this.executeReputationManipulation();
        break;
      case '凭证伪造':
      case '凭证生成':
        abilityExecuted = this.executeCredentialForgery();
        break;
      case '完美伪装':
      case '深度隐藏':
        abilityExecuted = this.executePerfectCamouflage();
        break;
      case 'Rootkit隐藏':
      case '扫描逃避':
        abilityExecuted = this.executeRootkitHide();
        break;
      case '内核钩子':
      case '调用拦截':
        abilityExecuted = this.executeKernelHook();
        break;
      // LV26-30 敌人技能
      case '人脸替换':
      case '伪造视频':
        abilityExecuted = this.executeFaceSwap();
        break;
      case '身份窃取':
      case '身份冒充':
        abilityExecuted = this.executeIdentityTheft();
        break;
      case '实时换脸':
      case '实时伪造':
        abilityExecuted = this.executeRealTimeSwap();
        break;
      case 'DDoS攻击':
      case '服务瘫痪':
        abilityExecuted = this.executeDDoSAttack();
        break;
      case '节点扩展':
      case '网络扩张':
        abilityExecuted = this.executeNodeExpansion();
        break;
      case '命令执行':
      case '攻击执行':
        abilityExecuted = this.executeCommandExecution();
        break;
      case 'SIM交换':
      case '号码劫持':
        abilityExecuted = this.executeSIMSwap();
        break;
      case '验证码拦截':
      case '账户接管':
        abilityExecuted = this.executeOTPIntercept();
        break;
      case 'STK利用':
      case 'SIM卡控制':
        abilityExecuted = this.executeSTKExploit();
        break;
      case '完美伪装':
      case '伪装成功':
        abilityExecuted = this.executeCamouflage();
        break;
      case 'IDS绕过':
      case '检测逃避':
        abilityExecuted = this.executeIDSBypass();
        break;
      case '特征逃避':
      case '特征修改':
        abilityExecuted = this.executeSignatureEvasion();
        break;
      // LV31-35 敌人技能
      case '软件捆绑':
      case '静默感染':
        abilityExecuted = this.executeSoftwareBundle();
        break;
      case '静默安装':
      case '组件安装':
        abilityExecuted = this.executeSilentInstall();
        break;
      case '恶意下载':
      case '软件下载':
        abilityExecuted = this.executeMalwareDownload();
        break;
      case '强化感染':
      case '快速感染':
        abilityExecuted = this.executeEnhancedInfection();
        break;
      case '网络传播':
      case '局域网感染':
        abilityExecuted = this.executeNetworkSpread();
        break;
      case '快速复制':
        abilityExecuted = this.executeRapidReplicate();
        break;
      case '远程控制':
      case '设备控制':
        abilityExecuted = this.executeRemoteControl();
        break;
      case '屏幕捕获':
      case '屏幕监控':
        abilityExecuted = this.executeScreenCapture();
        break;
      case '远程会话':
      case '会话建立':
        abilityExecuted = this.executeRemoteSession();
        break;
      case '钱包drain':
      case '资金窃取':
        abilityExecuted = this.executeWalletDrain();
        break;
      case '智能合约利用':
      case '合约攻击':
        abilityExecuted = this.executeSmartContractExploit();
        break;
      case '私钥窃取':
      case '密钥获取':
        abilityExecuted = this.executePrivateKeySteal();
        break;
      default:
        if (ability.trigger.includes('回合') || ability.trigger === '每回合') {
          this.state.enemyState.infiltrationLevel += 1;
          abilityExecuted = true;
        }
        break;
    }

    if (abilityExecuted && ability.cooldown > 0) {
      if (!this.state.enemyState.skillCooldowns) {
        this.state.enemyState.skillCooldowns = {};
      }
      this.state.enemyState.skillCooldowns![abilityName] = ability.cooldown;
    }
  }

  private executeSupplyChainInfiltration(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[targetArea].attackMarkers += 2;
    this.state.phaseLogs.push(`【供应链渗透】通过第三方供应商渗透${this.getLevelAreaName(targetArea)}，放置2个攻击标记`);
    this.updateAreaControl();
    return true;
  }

  private executeDependencyPoison(): boolean {
    // 修复：依赖投毒会造成持续伤害并削弱防御
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[targetArea].specialEffects.push('dependency_poisoned');
    // 实际效果：安全等级-3，防御标记-1
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl[targetArea].defenseMarkers = Math.max(0, this.state.areaControl[targetArea].defenseMarkers - 1);
    this.state.phaseLogs.push(`【依赖投毒】在${this.getLevelAreaName(targetArea)}的软件依赖中植入恶意代码，安全等级-3，防御-1`);
    return true;
  }

  private executeZeroDayExploit(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 5);
    this.state.phaseLogs.push(`【零日漏洞】使用未公开漏洞进行攻击，安全等级-5`);
    return true;
  }

  private executeStealthAttack(): boolean {
    // 修复：隐形攻击会绕过防御，直接造成伤害
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[targetArea].attackMarkers += 1;
    this.state.areaControl[targetArea].specialEffects.push('undetectable');
    // 实际效果：无视防御直接降低安全等级2点
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.phaseLogs.push(`【隐形攻击】在${this.getLevelAreaName(targetArea)}发动不留痕迹的攻击，安全等级-2`);
    this.updateAreaControl();
    return true;
  }

  private executeExploitCrafting(): boolean {
    if (!this.state.enemyState.resources) return false;
    this.state.enemyState.resources.computing += 2;
    this.state.phaseLogs.push(`【漏洞利用制作】开发新漏洞利用，计算资源+2`);
    return true;
  }

  private executeCloudBreach(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 1;
    }
    this.state.phaseLogs.push(`【云端突破】突破云服务安全边界，所有区域攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeMisconfigExploit(): boolean {
    // 修复：配置利用会削弱目标区域的防御能力
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[targetArea].attackMarkers += 3;
    this.state.areaControl[targetArea].specialEffects.push('misconfigured');
    // 实际效果：目标区域防御-2，因为配置错误导致防御失效
    this.state.areaControl[targetArea].defenseMarkers = Math.max(0, this.state.areaControl[targetArea].defenseMarkers - 2);
    this.state.phaseLogs.push(`【配置利用】利用${this.getLevelAreaName(targetArea)}配置错误，放置3个攻击标记，防御-2`);
    this.updateAreaControl();
    return true;
  }

  private executeDataExfiltration(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.enemyState.resources!.funds += 3;
    this.state.phaseLogs.push(`【数据外传】将窃取的数据发送到远程服务器，安全等级-2，资金+3`);
    return true;
  }

  private executeStealthCopy(): boolean {
    // 修复：隐形复制会窃取数据并削弱安全等级
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[targetArea].specialEffects.push('data_copied');
    this.state.enemyState.resources!.information += 2;
    // 实际效果：窃取数据导致安全等级-2
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.phaseLogs.push(`【隐形复制】在${this.getLevelAreaName(targetArea)}静默窃取数据，信息+2，安全等级-2`);
    return true;
  }

  private executeContractAttack(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.enemyState.resources!.funds += 2;
    this.state.phaseLogs.push(`【合约攻击】利用智能合约漏洞进行攻击，安全等级-3，资金+2`);
    return true;
  }

  private executeReentrancyExploit(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.enemyState.resources!.funds += 5;
    this.state.phaseLogs.push(`【重入攻击】通过递归调用漏洞盗取资金，安全等级-4，资金+5`);
    return true;
  }

  private executeDoubleSpendAttack(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.enemyState.resources!.funds += 4;
    this.state.phaseLogs.push(`【双花攻击】同一笔交易花费两次，安全等级-3，资金+4`);
    return true;
  }

  private executeAdversarialInput(): boolean {
    // 修复：对抗样本会误导AI系统，使其无法正确识别攻击
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('ai_misled');
    // 实际效果：内网区域额外增加2个攻击标记（AI无法识别）
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.phaseLogs.push(`【对抗样本】制作欺骗AI的对抗样本，内网区域AI系统被误导，安全等级-3，攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeModelEvasion(): boolean {
    // 修复：模型规避会绕过AI检测并窃取信息
    this.state.areaControl.external.attackMarkers += 2;
    this.state.areaControl.external.specialEffects.push('ai_evaded');
    // 实际效果：绕过AI检测窃取信息
    this.state.enemyState.resources!.information += 2;
    this.state.phaseLogs.push(`【模型规避】绕过AI安全检测，外网区域攻击标记+2，信息+2`);
    this.updateAreaControl();
    return true;
  }

  private executeModelExtraction(): boolean {
    this.state.enemyState.resources!.information += 3;
    this.state.phaseLogs.push(`【模型提取】通过API窃取模型结构，信息+3`);
    return true;
  }

  private executeKnowledgeDistillation(): boolean {
    this.state.enemyState.resources!.computing += 2;
    this.state.enemyState.resources!.information += 2;
    this.state.phaseLogs.push(`【知识蒸馏】利用输出了解模型行为，计算资源+2，信息+2`);
    return true;
  }

  private executeQuantumCryptanalysis(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 6);
    this.state.phaseLogs.push(`【量子密码分析】使用量子算法破解加密，安全等级-6`);
    return true;
  }

  private executeKeyExtraction(): boolean {
    this.state.enemyState.resources!.information += 4;
    this.state.phaseLogs.push(`【密钥提取】从量子通道提取密钥，信息+4`);
    return true;
  }

  private executePostQuantumAlgorithm(): boolean {
    // 修复：后量子算法会攻击所有区域
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.areaControl.internal.specialEffects.push('pq_algorithm_active');
    // 实际效果：后量子算法影响所有区域，每个区域攻击标记+1
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 1;
    }
    this.state.phaseLogs.push(`【后量子算法】使用抗量子攻击的算法，安全等级-4，所有区域攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeOmniAttack(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 2;
    }
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.phaseLogs.push(`【全能攻击】发动所有类型的攻击，所有区域攻击标记+2，安全等级-4`);
    this.updateAreaControl();
    return true;
  }

  private executeSkillBoost(): boolean {
    // 修复：限制最大叠加次数为3次，避免无限叠加
    const currentBoost = this.state.enemyState.skillCooldowns?.['skill_boost_damage'] || 0;
    const newBoost = Math.min(currentBoost + 2, 6); // 最大加成6点（3次叠加）
    this.state.enemyState.skillCooldowns!['skill_boost_damage'] = newBoost;
    this.state.phaseLogs.push(`【技能强化】下一次攻击伤害+2（当前加成：${newBoost}）`);
    return true;
  }

  // ============================================
  // LV36-40 敌人技能实现
  // ============================================

  private executeBIOSCorruption(): boolean {
    // 修复：添加实际效果 - BIOS损坏会导致工业控制区防御降低
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.areaControl.industrial.defenseMarkers = Math.max(0, this.state.areaControl.industrial.defenseMarkers - 2);
    this.state.areaControl.industrial.attackMarkers += 2;
    this.state.areaControl.industrial.specialEffects.push('bios_corrupted');
    this.state.phaseLogs.push(`【BIOS破坏】破坏主板BIOS芯片，安全等级-4，工业控制区防御-2、攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeHardwareDamage(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 6);
    this.state.areaControl.industrial.attackMarkers += 3;
    this.state.phaseLogs.push(`【硬件损坏】造成不可逆的硬件损坏，安全等级-6，工业控制区攻击标记+3`);
    this.updateAreaControl();
    return true;
  }

  private executeFirmwareAttack(): boolean {
    // 修复：固件攻击会破坏系统核心，影响多个区域
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('firmware_damaged');
    // 实际效果：内网和工业控制区防御-1
    this.state.areaControl.internal.defenseMarkers = Math.max(0, this.state.areaControl.internal.defenseMarkers - 1);
    this.state.areaControl.industrial.defenseMarkers = Math.max(0, this.state.areaControl.industrial.defenseMarkers - 1);
    this.state.phaseLogs.push(`【固件攻击】攻击系统固件，安全等级-3，内网和工业控制区防御-1`);
    this.updateAreaControl();
    return true;
  }

  private executeContinuousReplication(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 1;
    }
    this.state.phaseLogs.push(`【持续复制】几乎不间断地自我复制，所有区域攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeNetworkScan(): boolean {
    this.state.enemyState.resources!.information += 2;
    this.state.phaseLogs.push(`【网络扫描】持续扫描新的攻击目标，信息+2`);
    return true;
  }

  private executeMassReplication(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 2;
    }
    this.state.phaseLogs.push(`【大规模复制】一次性产生大量副本，所有区域攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeBootSectorInfection(): boolean {
    // 修复：引导区感染会影响系统启动并窃取信息
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.areaControl.internal.specialEffects.push('boot_sector_infected');
    // 实际效果：引导区感染窃取系统信息
    this.state.enemyState.resources!.information += 2;
    this.state.phaseLogs.push(`【引导区感染】感染软盘引导扇区，内网攻击标记+2，信息+2`);
    this.updateAreaControl();
    return true;
  }

  private executeMemoryResidence(): boolean {
    // 修复：内存驻留会增加敌人后续攻击频率
    this.state.areaControl.internal.specialEffects.push('memory_resident');
    this.state.enemyState.infiltrationLevel += 2;
    // 添加实际效果：内存驻留会导致每回合额外增加1个攻击标记
    this.state.areaControl.internal.attackMarkers += 1;
    this.state.phaseLogs.push(`【内存驻留】长期驻留内存，渗透等级+2，内网攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeMBRInfection(): boolean {
    // 修复：MBR感染会阻止系统正常启动，造成持续伤害
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('mbr_infected');
    // 实际效果：MBR感染导致系统不稳定，额外攻击标记+2
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.phaseLogs.push(`【MBR感染】感染主引导记录，安全等级-3，内网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeDocumentInfection(): boolean {
    // 修复：文档感染会传播并窃取敏感信息
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.areaControl.internal.specialEffects.push('document_infected');
    // 实际效果：感染文档窃取信息
    this.state.enemyState.resources!.information += 2;
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 1);
    this.state.phaseLogs.push(`【文档感染】感染Word/Excel文档，内网攻击标记+2，信息+2，安全等级-1`);
    this.updateAreaControl();
    return true;
  }

  private executeMacroExecution(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.enemyState.resources!.information += 2;
    this.state.phaseLogs.push(`【宏执行】执行恶意宏代码，安全等级-3，信息+2`);
    return true;
  }

  private executeTemplateInfection(): boolean {
    // 修复：模板感染会影响所有新文档
    this.state.areaControl.internal.attackMarkers += 1;
    this.state.areaControl.internal.specialEffects.push('template_infected');
    // 实际效果：模板感染扩散，额外增加1个攻击标记
    this.state.areaControl.internal.attackMarkers += 1;
    this.state.phaseLogs.push(`【模板感染】感染Word模板文件，内网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeBruteForceAttack(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.enemyState.resources!.computing += 1;
    this.state.phaseLogs.push(`【暴力破解】尝试所有可能的密码组合，安全等级-2，计算资源+1`);
    return true;
  }

  private executeRainbowTableAttack(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.enemyState.resources!.information += 3;
    this.state.phaseLogs.push(`【彩虹表攻击】使用预计算的哈希值，安全等级-4，信息+3`);
    return true;
  }

  private executeDictionaryAttack(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.phaseLogs.push(`【字典猜测】使用常见密码字典，安全等级-2`);
    return true;
  }

  private executeIdentityFlood(): boolean {
    this.state.areaControl.external.attackMarkers += 2;
    this.state.areaControl.external.specialEffects.push('identity_flooded');
    this.state.phaseLogs.push(`【身份泛滥】创建大量虚假身份，外网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeReputationManipulation(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.external.specialEffects.push('reputation_manipulated');
    this.state.phaseLogs.push(`【声誉操纵】操纵系统声誉机制，安全等级-3`);
    return true;
  }

  private executeCredentialForgery(): boolean {
    // 修复：凭证伪造会窃取信息并降低安全等级
    this.state.enemyState.resources!.information += 2;
    this.state.areaControl.dmz.specialEffects.push('credential_forced');
    // 实际效果：伪造凭证导致安全等级-2
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.phaseLogs.push(`【凭证伪造】伪造身份凭证，信息+2，安全等级-2`);
    return true;
  }

  private executePerfectCamouflage(): boolean {
    // 修复：完美伪装会增加敌人渗透等级并使防御更难发现
    this.state.areaControl.internal.specialEffects.push('perfect_camouflage');
    this.state.areaControl.industrial.specialEffects.push('perfect_camouflage');
    this.state.enemyState.infiltrationLevel += 3;
    // 实际效果：移除1个防御标记，使敌人更难被发现
    this.state.areaControl.internal.defenseMarkers = Math.max(0, this.state.areaControl.internal.defenseMarkers - 1);
    this.state.areaControl.industrial.defenseMarkers = Math.max(0, this.state.areaControl.industrial.defenseMarkers - 1);
    this.state.phaseLogs.push(`【完美伪装】完全伪装成系统文件，渗透等级+3，内网和工业控制区防御-1`);
    this.updateAreaControl();
    return true;
  }

  private executeRootkitHide(): boolean {
    // 修复：Rootkit隐藏会深度渗透并削弱防御
    this.state.areaControl.internal.specialEffects.push('rootkit_hidden');
    this.state.enemyState.infiltrationLevel += 1;
    // 实际效果：Rootkit隐藏使防御更难发现，防御-1
    this.state.areaControl.internal.defenseMarkers = Math.max(0, this.state.areaControl.internal.defenseMarkers - 1);
    this.state.phaseLogs.push(`【Rootkit隐藏】使用Rootkit技术隐藏，渗透等级+1，内网防御-1`);
    this.updateAreaControl();
    return true;
  }

  private executeKernelHook(): boolean {
    // 修复：内核钩子会深度破坏系统安全
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('kernel_hooked');
    // 实际效果：内核钩子导致系统防御失效，防御-2
    this.state.areaControl.internal.defenseMarkers = Math.max(0, this.state.areaControl.internal.defenseMarkers - 2);
    this.state.phaseLogs.push(`【内核钩子】挂钩内核函数隐藏自身，安全等级-3，内网防御-2`);
    this.updateAreaControl();
    return true;
  }

  // ============================================
  // LV26-30 敌人技能实现
  // ============================================

  private executeFaceSwap(): boolean {
    // 修复：人脸替换会欺骗身份验证系统
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('face_swapped');
    // 实际效果：伪造视频欺骗系统，内网攻击标记+1
    this.state.areaControl.internal.attackMarkers += 1;
    this.state.phaseLogs.push(`【人脸替换】将目标人脸替换为伪造视频，安全等级-3，内网攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeIdentityTheft(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.enemyState.resources!.information += 3;
    this.state.areaControl.dmz.specialEffects.push('identity_stolen');
    this.state.phaseLogs.push(`【身份窃取】冒充他人身份进行欺诈，安全等级-4，信息+3`);
    return true;
  }

  private executeRealTimeSwap(): boolean {
    // 修复：实时换脸会欺骗外部通信
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.external.specialEffects.push('realtime_swapped');
    // 实际效果：欺骗外部系统，外网攻击标记+2
    this.state.areaControl.external.attackMarkers += 2;
    this.state.phaseLogs.push(`【实时换脸】实时替换视频通话中的人脸，安全等级-3，外网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeDDoSAttack(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.areaControl.external.attackMarkers += 3;
    this.state.areaControl.external.specialEffects.push('ddos_attacked');
    this.state.phaseLogs.push(`【DDoS攻击】利用僵尸网络发动分布式拒绝服务攻击，安全等级-4，外网攻击标记+3`);
    this.updateAreaControl();
    return true;
  }

  private executeNodeExpansion(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 1;
    }
    this.state.enemyState.infiltrationLevel += 2;
    this.state.phaseLogs.push(`【节点扩展】感染新设备扩大僵尸网络，所有区域攻击标记+1，渗透等级+2`);
    this.updateAreaControl();
    return true;
  }

  private executeCommandExecution(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.phaseLogs.push(`【命令执行】执行主控服务器下发的命令，安全等级-2，内网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeSIMSwap(): boolean {
    // 修复：SIM交换会劫持通信并窃取信息
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.dmz.specialEffects.push('sim_swapped');
    // 实际效果：劫持号码窃取信息
    this.state.enemyState.resources!.information += 2;
    this.state.areaControl.dmz.attackMarkers += 1;
    this.state.phaseLogs.push(`【SIM交换】欺骗运营商更换SIM卡，安全等级-3，信息+2，DMZ攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeOTPIntercept(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.enemyState.resources!.information += 3;
    this.state.areaControl.dmz.specialEffects.push('otp_intercepted');
    this.state.phaseLogs.push(`【验证码拦截】拦截短信验证码，安全等级-4，信息+3，账户面临接管风险`);
    return true;
  }

  private executeSTKExploit(): boolean {
    // 修复：STK利用会控制SIM卡并窃取信息
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.areaControl.dmz.specialEffects.push('stk_exploited');
    // 实际效果：控制SIM卡窃取信息
    this.state.enemyState.resources!.information += 2;
    this.state.areaControl.dmz.attackMarkers += 1;
    this.state.phaseLogs.push(`【STK利用】利用SIM卡工具包漏洞，安全等级-2，信息+2，DMZ攻击标记+1`);
    this.updateAreaControl();
    return true;
  }

  private executeCamouflage(): boolean {
    // 修复：伪装会隐藏攻击并削弱防御
    this.state.areaControl.external.specialEffects.push('camouflaged');
    this.state.enemyState.infiltrationLevel += 1;
    // 实际效果：伪装使防御难以发现，外网防御-1
    this.state.areaControl.external.defenseMarkers = Math.max(0, this.state.areaControl.external.defenseMarkers - 1);
    this.state.phaseLogs.push(`【完美伪装】伪装成合法流量逃避检测，渗透等级+1，外网防御-1`);
    this.updateAreaControl();
    return true;
  }

  private executeIDSBypass(): boolean {
    // 修复：IDS绕过会使防御失效
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.dmz.specialEffects.push('ids_bypassed');
    // 实际效果：绕过IDS使DMZ防御-2
    this.state.areaControl.dmz.defenseMarkers = Math.max(0, this.state.areaControl.dmz.defenseMarkers - 2);
    this.state.phaseLogs.push(`【IDS绕过】绕过入侵检测系统，安全等级-3，DMZ防御-2`);
    this.updateAreaControl();
    return true;
  }

  private executeSignatureEvasion(): boolean {
    // 修复：特征逃避会隐藏攻击并增加攻击标记
    this.state.areaControl.external.specialEffects.push('signature_evasion');
    this.state.enemyState.infiltrationLevel += 1;
    // 实际效果：逃避检测增加攻击，外网攻击标记+2
    this.state.areaControl.external.attackMarkers += 2;
    this.state.phaseLogs.push(`【特征逃避】修改攻击特征逃避检测，渗透等级+1，外网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  // ============================================
  // LV31-35 敌人技能实现
  // ============================================

  private executeSoftwareBundle(): boolean {
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.areaControl.internal.specialEffects.push('software_bundled');
    this.state.phaseLogs.push(`【软件捆绑】将病毒捆绑在正常软件中，内网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeSilentInstall(): boolean {
    // 修复：静默安装会植入恶意软件并增加攻击
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('silent_installed');
    // 实际效果：静默安装增加内网攻击标记
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.phaseLogs.push(`【静默安装】在后台静默安装恶意组件，安全等级-3，内网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeMalwareDownload(): boolean {
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.enemyState.resources!.computing += 2;
    this.state.phaseLogs.push(`【恶意下载】从远程服务器下载恶意软件，内网攻击标记+2，计算资源+2`);
    this.updateAreaControl();
    return true;
  }

  private executeEnhancedInfection(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 1;
    }
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 2);
    this.state.phaseLogs.push(`【强化感染】更强的感染能力，所有区域攻击标记+1，安全等级-2`);
    this.updateAreaControl();
    return true;
  }

  private executeNetworkSpread(): boolean {
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.areaControl.industrial.attackMarkers += 2;
    this.state.phaseLogs.push(`【网络传播】通过局域网快速传播，内网和工业控制区攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeRapidReplicate(): boolean {
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    for (const area of areas) {
      this.state.areaControl[area].attackMarkers += 1;
    }
    this.state.enemyState.infiltrationLevel += 1;
    this.state.phaseLogs.push(`【快速复制】极快的自我复制速度，所有区域攻击标记+1，渗透等级+1`);
    this.updateAreaControl();
    return true;
  }

  private executeRemoteControl(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.areaControl.internal.specialEffects.push('remote_controlled');
    this.state.phaseLogs.push(`【远程控制】完全控制受感染设备，安全等级-3，内网设备被控制`);
    return true;
  }

  private executeScreenCapture(): boolean {
    this.state.enemyState.resources!.information += 3;
    this.state.areaControl.internal.specialEffects.push('screen_captured');
    this.state.phaseLogs.push(`【屏幕捕获】捕获用户屏幕内容，信息+3，内网屏幕被监控`);
    return true;
  }

  private executeRemoteSession(): boolean {
    this.state.areaControl.internal.attackMarkers += 2;
    this.state.areaControl.internal.specialEffects.push('remote_session');
    this.state.phaseLogs.push(`【远程会话】建立远程控制会话，内网攻击标记+2`);
    this.updateAreaControl();
    return true;
  }

  private executeWalletDrain(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.enemyState.resources!.funds += 5;
    this.state.phaseLogs.push(`【钱包drain】窃取加密货币钱包资金，安全等级-4，资金+5`);
    return true;
  }

  private executeSmartContractExploit(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 4);
    this.state.enemyState.resources!.funds += 4;
    this.state.areaControl.dmz.specialEffects.push('contract_exploited');
    this.state.phaseLogs.push(`【智能合约利用】利用智能合约漏洞，安全等级-4，资金+4`);
    return true;
  }

  private executePrivateKeySteal(): boolean {
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - 3);
    this.state.enemyState.resources!.information += 4;
    this.state.phaseLogs.push(`【私钥窃取】窃取用户的私钥，安全等级-3，信息+4`);
    return true;
  }

  private executeEnemyAttack(intensity: 'low' | 'medium' | 'high' | 'extreme'): void {
    if (!this.state) return;

    const damageMap = { low: 2, medium: 4, high: 6, extreme: 8 };
    let damage = damageMap[intensity];

    const skillBoost = this.state.enemyState.skillCooldowns?.['skill_boost_damage'] || 0;
    if (skillBoost > 0) {
      damage += skillBoost;
      this.state.enemyState.skillCooldowns!['skill_boost_damage'] = 0;
      this.state.phaseLogs.push(`【技能强化触发】攻击伤害+${skillBoost}，实际造成${damage}点伤害`);
    }

    this.state.playerState.securityLevel = Math.max(
      0,
      this.state.playerState.securityLevel - damage
    );

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[randomArea].attackMarkers += 1;

    this.updateAreaControl();
  }

  private updateAreaControl(): void {
    if (!this.state) return;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      
      if (areaState.attackMarkers > areaState.defenseMarkers) {
        // 攻击方标记多于防御方，区域被敌方占领
        if (areaState.controller !== 'enemy') {
          areaState.controller = 'enemy';
          this.state.phaseLogs.push(`⚠️ ${this.getLevelAreaName(area)}被敌方占领！`);
        }
      } else if (areaState.defenseMarkers > areaState.attackMarkers) {
        // 防御方标记多于攻击方，区域被玩家占领
        if (areaState.controller !== 'player') {
          areaState.controller = 'player';
          this.state.phaseLogs.push(`✅ ${this.getLevelAreaName(area)}被玩家占领！`);
        }
      } else {
        // 标记相等，区域变为中立
        if (areaState.controller !== 'neutral') {
          areaState.controller = 'neutral';
          this.state.phaseLogs.push(`⚖️ ${this.getLevelAreaName(area)}变为中立`);
        }
      }
    }
  }

  /**
   * 获取关卡专属区域名称
   * 优先从关卡配置中读取，如果没有配置则使用默认名称
   * @param area 区域类型
   * @returns 区域名称
   */
  getLevelAreaName(area: AreaType): string {
    // 优先从关卡配置中读取专属名称
    const levelAreaName = this.state?.currentLevel.areaDistribution?.[area]?.name;
    if (levelAreaName) {
      return levelAreaName;
    }
    // 回退到默认名称
    return this.getAreaName(area);
  }

  /**
   * 获取默认区域名称
   * @param area 区域类型
   * @returns 默认区域名称
   */
  private getAreaName(area: AreaType): string {
    const areaNames: Record<AreaType, string> = {
      internal: '内网',
      industrial: '工控网',
      dmz: 'DMZ区',
      external: '外网'
    };
    return areaNames[area];
  }

  /**
   * 获取区域特性修正
   * @param area 区域类型
   * @param action 行动类型
   * @returns 修正值（行动点消耗修正）
   */
  getAreaTraitModifier(area: AreaType, action: 'place_friendly' | 'place_enemy' | 'enemy_skill'): number {
    const trait = this.state?.currentLevel.areaDistribution?.[area]?.traitType;
    switch (trait) {
      // ========== 关卡一区域特性 ==========
      case 'infection_zone':
        return action === 'place_enemy' ? -1 : 0; // 感染高发区：敌方放置标记时行动点消耗-1
      case 'safe_zone':
        return action === 'place_friendly' ? -1 : 0; // 安全区域：友方放置标记时行动点消耗-1
      case 'protected':
        return action === 'enemy_skill' ? 0.5 : 0; // 防护区域：敌方技能效果减半
      // ========== 关卡二区域特性 ==========
      case 'ai_control_zone':
        return action === 'enemy_skill' ? 1 : 0; // AI控制区：敌方技能效果+1
      case 'human_control_zone':
        return action === 'place_friendly' ? -1 : 0; // 人类控制区：友方放置标记时行动点消耗-1
      case 'neutral_cost_zone':
        // 通讯中继站：双方在该区域放置标记时各消耗1额外行动点
        return action === 'place_friendly' || action === 'place_enemy' ? 1 : 0;
      case 'physical_isolation':
        return action === 'enemy_skill' ? 0 : 0; // 物理隔离区：敌方自动技能无效（在技能执行时处理）
      // ========== 关卡三区域特性 ==========
      case 'high_risk_zone':
        return action === 'place_enemy' ? -1 : 0; // 高风险区：敌方放置标记时行动点消耗-1
      case 'core_protection':
        return action === 'place_friendly' ? -1 : 0; // 核心保护区：友方放置标记时行动点消耗-1
      case 'spread_hub':
        return 0; // 传播中转站：特殊效果在其他地方处理
      case 'isolation_zone':
        return action === 'enemy_skill' ? 0 : 0; // 隔离区域：敌方自动技能无效
      // ========== 关卡四区域特性 ==========
      case 'critical_facility':
        return action === 'enemy_skill' ? 1 : 0; // 关键设施：敌方技能效果+1
      case 'sensing_zone':
        return 0; // 感知区域：特殊效果在其他地方处理
      case 'defense_boundary':
        return action === 'place_friendly' ? -1 : 0; // 防护边界：友方放置标记时行动点消耗-1
      case 'backup_system':
        return 0; // 备份系统：特殊效果在其他地方处理
      // ========== 关卡五区域特性 ==========
      case 'flight_control':
        return action === 'enemy_skill' ? 1 : 0; // 飞行控制系统：敌方技能效果+1
      case 'sensor_array':
        return 0; // 传感器阵列：特殊效果在其他地方处理
      case 'manual_backup':
        return action === 'place_friendly' ? -1 : 0; // 人工备份：友方放置标记时行动点消耗-1
      case 'redundancy_system':
        return 0; // 冗余保护：特殊效果在其他地方处理
      // ========== 关卡六区域特性 ==========
      case 'power_dispatch':
        return action === 'enemy_skill' ? 1 : 0; // 电力调度中心：敌方技能效果+1
      case 'water_system':
        return 0; // 供水系统：特殊效果在其他地方处理
      case 'comm_station':
        return action === 'place_friendly' ? -1 : 0; // 通讯基站：友方放置标记时行动点消耗-1
      case 'command_center':
        return 0; // 指挥中心：特殊效果在其他地方处理
      // ========== 关卡七区域特性 ==========
      case 'commercial_center':
        return 0; // 商业中心：特殊效果在其他地方处理
      case 'transport_hub':
        return action === 'place_enemy' ? -1 : 0; // 人流密集：敌方放置标记时行动点消耗-1
      case 'office_building':
        return action === 'place_friendly' ? -1 : 0; // 办公楼：友方放置标记时行动点消耗-1
      case 'private_residence':
        return action === 'enemy_skill' ? 0 : 0; // 私人住宅：敌方自动技能无效
      // ========== 关卡八区域特性 ==========
      case 'ancient_chamber':
        return action === 'enemy_skill' ? 1 : 0; // 古老密室：敌方技能效果+1
      case 'data_center':
        return action === 'place_friendly' ? -1 : 0; // 数据中心：友方放置标记时行动点消耗-1
      case 'comm_hub':
        return action === 'place_friendly' ? -1 : 0; // 通讯枢纽：友方放置标记时行动点消耗-1
      case 'security_fortress':
        return 0; // 安全堡垒：特殊效果在其他地方处理
      // ========== 关卡九区域特性 ==========
      case 'account_center':
        return action === 'enemy_skill' ? 1 : 0; // 账号中心：敌方技能效果+1
      case 'content_platform':
        return action === 'enemy_skill' ? 1 : 0; // 内容平台：敌方技能效果+1
      case 'payment_system':
        return action === 'place_friendly' ? -1 : 0; // 支付系统：友方放置标记时行动点消耗-1
      case 'security_center':
        return 0; // 安全中心：特殊效果在其他地方处理
      default:
        return 0; // 中立区域：无特殊效果
    }
  }

  /**
   * 获取区域特性描述
   * @param area 区域类型
   * @returns 区域特性描述
   */
  getAreaTraitDescription(area: AreaType): string {
    return this.state?.currentLevel.areaDistribution?.[area]?.trait || '无特殊效果';
  }

  /**
   * 检查区域是否有特定特性
   * @param area 区域类型
   * @param traitType 特性类型
   * @returns 是否具有该特性
   */
  hasAreaTrait(area: AreaType, traitType: string): boolean {
    return this.state?.currentLevel.areaDistribution?.[area]?.traitType === traitType;
  }

  /**
   * 应用区域特性对敌方技能效果的修正
   * @param area 区域类型
   * @param baseEffect 基础效果值
   * @returns 修正后的效果值
   */
  applyAreaTraitToEnemySkill(area: AreaType, baseEffect: number): number {
    const modifier = this.getAreaTraitModifier(area, 'enemy_skill');
    if (modifier === 0.5) {
      // 防护区域：敌方技能效果减半
      return Math.floor(baseEffect * 0.5);
    }
    return baseEffect;
  }

  private drawCards(): void {
    if (!this.state) return;

    while (this.state.playerState.hand.length < 3 && this.state.playerState.deck.length > 0) {
      const card = this.state.playerState.deck.pop()!;
      this.state.playerState.hand.push(card);
    }

    if (this.state.playerState.deck.length === 0 && this.state.playerState.discardPile.length > 0) {
      this.state.playerState.deck = this.shuffleDeck([...this.state.playerState.discardPile]);
      this.state.playerState.discardPile = [];
    }
  }

  private updateObjectives(): void {
    if (!this.state) return;

    for (const objective of this.state.objectives) {
      switch (objective.type) {
        case 'survive':
          objective.current = this.state.currentTurn;
          objective.completed = this.state.currentTurn >= objective.target;
          break;
        case 'maintain_security':
          objective.current = this.state.playerState.securityLevel;
          objective.completed = this.state.playerState.securityLevel >= objective.target;
          break;
        case 'protect_areas':
          const controlledAreas = Object.values(this.state.areaControl)
            .filter(area => area.controller === 'player').length;
          objective.current = controlledAreas;
          objective.completed = controlledAreas >= objective.target;
          break;
        case 'use_defense_cards':
          objective.current = this.state.playerState.defenseCardsUsed;
          objective.completed = this.state.playerState.defenseCardsUsed >= objective.target;
          break;
        case 'collect_info':
          objective.current = this.state.playerState.resources.information;
          objective.completed = this.state.playerState.resources.information >= objective.target;
          break;
        case 'clear_virus':
          // 成功遏制：至少2个区域的敌方标记总数降至0
          const cleanAreas = Object.values(this.state.areaControl)
            .filter(area => area.attackMarkers === 0).length;
          objective.current = cleanAreas;
          objective.completed = cleanAreas >= objective.target;
          break;
        case 'full_vaccination':
          // 知识普及：大东使用"安全知识讲解"技能至少3次
          // 注意：这里复用了full_vaccination类型，但实际检查的是dadongSkillUsageCount
          const skillUsageCount = this.state.dadongSkillUsageCount || 0;
          objective.current = skillUsageCount;
          objective.completed = skillUsageCount >= objective.target;
          break;
        case 'system_rewrite':
          // 技术免疫：至少2个区域完成"签名接种"
          // 注意：这里复用了system_rewrite类型，但实际检查的是已接种区域数
          const vaccinatedAreas = Object.values(this.state.areaControl)
            .filter(area => area.specialEffects.includes('已接种') || 
                    this.isAreaVaccinated(area as any)).length;
          objective.current = vaccinatedAreas;
          objective.completed = vaccinatedAreas >= objective.target;
          break;
        case 'defeat_enemy':
          // 夺取控制权：使用"人工干预"或"一瓶伏特加"使叛逆莫斯失去所有标记
          // 检查是否有敌人被击败（标记数为0）
          const defeatedEnemies = this.state.enemies?.filter(enemy => {
            // 检查该敌人在所有区域的标记总数是否为0
            const totalMarkers = Object.values(this.state.areaControl)
              .reduce((sum, area) => sum + (area.attackMarkers || 0), 0);
            return totalMarkers === 0;
          }).length || 0;
          objective.current = defeatedEnemies;
          objective.completed = defeatedEnemies >= objective.target;
          break;
      }
    }
  }

  private checkGameEnd(): { logs: string[]; result: 'victory' | 'defeat' } | null {
    if (!this.state) return null;

    // 调试日志：检查防御标记值
    const defenseMarkers = Object.values(this.state.areaControl).map(area => area.defenseMarkers);
    console.log('[checkGameEnd] Defense markers:', defenseMarkers, 'Turn:', this.state.currentTurn, 'Round:', this.state.round);

    // 失败条件1：安全等级归零（等于0时触发）
    if (this.state.playerState.securityLevel === 0) {
      this.handleGameOver();
      return { 
        logs: ['💀 安全等级归零，防御失败！'], 
        result: 'defeat' 
      };
    }

    // 失败条件2：全面感染 - 敌方标记总数达到20个
    const totalAttackMarkers = Object.values(this.state.areaControl)
      .reduce((sum, area) => sum + area.attackMarkers, 0);
    if (totalAttackMarkers >= 20) {
      this.handleGameOver();
      return {
        logs: [`🦠 全面感染！敌方标记总数达到 ${totalAttackMarkers} 个，系统完全沦陷！`],
        result: 'defeat'
      };
    }

    // 失败条件3：系统崩溃 - 4个区域的防御标记同时为0
    // 修复：添加检查确保游戏已经开始（至少第2回合），避免初始化时误判
    const areasWithZeroDefense = Object.values(this.state.areaControl)
      .filter(area => area.defenseMarkers === 0).length;
    if (areasWithZeroDefense >= 4 && this.state.currentTurn > 1) {
      this.handleGameOver();
      return {
        logs: [`💥 系统崩溃！所有区域的防御标记归零，防线全面瓦解！`],
        result: 'defeat'
      };
    }

    // 失败条件4：轮次超限
    const maxRounds = this.state.currentLevel.maxTurns; // 使用maxTurns作为最大轮次
    if (maxRounds && this.state.round > maxRounds) {
      this.handleGameOver();
      return { 
        logs: [`⏰ 轮次超限！已超过最大轮次数 ${maxRounds}，任务失败！`], 
        result: 'defeat' 
      };
    }

    // 胜利条件：检查是否满足任意2个目标（三选二）
    const completedObjectives = this.state.objectives.filter(obj => obj.completed).length;
    const totalObjectives = this.state.objectives.length;
    const requiredObjectives = 2; // 明确需要完成2个目标（三选二）
    
    if (completedObjectives >= requiredObjectives) {
      const completedNames = this.state.objectives
        .filter(obj => obj.completed)
        .map(obj => obj.description.split('：')[0] || obj.description)
        .join('、');
      this.handleLevelComplete();
      return { 
        logs: [`🎉 胜利！已完成 ${completedObjectives}/${totalObjectives} 个目标（${completedNames}）`], 
        result: 'victory' as const
      };
    }

    return null;
  }

  private handleLevelComplete(): void {
    if (!this.state) return;

    const level = this.state.currentLevel;
    const score = this.calculateScore();

    this.progressStorage[level.id].status = 'completed';
    this.progressStorage[level.id].completedObjectives = this.state.objectives.map(obj => obj.id);
    this.progressStorage[level.id].bestScore = Math.max(
      this.progressStorage[level.id].bestScore || 0,
      score
    );
    this.progressStorage[level.id].completedAt = new Date();

    const nextLevelId = this.getNextLevelId(level.id);
    if (nextLevelId && this.progressStorage[nextLevelId]) {
      this.progressStorage[nextLevelId].status = 'available';
    }

    this.saveProgress();

    const result: LevelCompletionResult = {
      levelId: level.id,
      success: true,
      score,
      completedObjectives: this.state.objectives.filter(obj => obj.completed).map(obj => obj.id),
      turnsTaken: this.state.currentTurn,
      rewards: level.rewards,
      articleContent: level.articleContent,
      nextLevel: nextLevelId
    };

    if (this.onLevelComplete) {
      this.onLevelComplete(result);
    }
  }

  private handleGameOver(): void {
    if (!this.state) return;

    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  private calculateScore(): number {
    if (!this.state) return 0;

    let score = 100;

    score += this.state.playerState.securityLevel;

    score += Math.max(0, 20 - this.state.currentTurn) * 5;

    score += this.state.objectives.filter(obj => obj.completed).length * 10;

    return Math.max(0, score);
  }

  private getNextLevelId(currentId: LevelId): LevelId | undefined {
    const currentIndex = LEVEL_ORDER.indexOf(currentId);
    if (currentIndex === -1 || currentIndex >= LEVEL_ORDER.length - 1) return undefined;
    return LEVEL_ORDER[currentIndex + 1];
  }

  // ==================== 持续效果管理方法 ====================

  /**
   * 添加持续效果
   */
  addActiveEffect(effect: ActiveEffect): void {
    if (!this.state) return;
    this.state.activeEffects = this.state.activeEffects || [];
    this.state.activeEffects.push(effect);
    this.notifyStateChange();
  }

  /**
   * 移除持续效果
   */
  removeActiveEffect(effectId: string): boolean {
    if (!this.state || !this.state.activeEffects) return false;
    const index = this.state.activeEffects.findIndex(e => e.id === effectId);
    if (index === -1) return false;
    this.state.activeEffects.splice(index, 1);
    this.notifyStateChange();
    return true;
  }

  /**
   * 检查区域是否有免疫效果
   */
  isAreaVaccinated(area: AreaType): boolean {
    return (this.state?.activeEffects || []).some(
      e => e.targetArea === area && e.type === 'vaccinated' && e.remainingTurns > 0
    );
  }

  /**
   * 检查区域是否有技能免疫效果
   */
  isAreaSkillImmune(area: AreaType): boolean {
    return (this.state?.activeEffects || []).some(
      e => e.targetArea === area && e.type === 'skill_immunity' && e.remainingTurns > 0
    );
  }

  /**
   * 检查区域是否有陷阱效果
   */
  isAreaTrapped(area: AreaType): boolean {
    return (this.state?.activeEffects || []).some(
      e => e.targetArea === area && e.type === 'trap' && e.remainingTurns > 0
    );
  }

  /**
   * 获取区域的所有持续效果
   */
  getAreaEffects(area: AreaType): ActiveEffect[] {
    return (this.state?.activeEffects || []).filter(
      e => e.targetArea === area && e.remainingTurns > 0
    );
  }

  /**
   * 在结束阶段减少效果持续回合
   */
  decrementEffectTurns(): void {
    if (!this.state || !this.state.activeEffects) return;
    
    const expiredEffects: ActiveEffect[] = [];
    
    this.state.activeEffects = this.state.activeEffects
      .map(e => {
        const newEffect = { ...e, remainingTurns: e.remainingTurns - 1 };
        if (newEffect.remainingTurns <= 0) {
          expiredEffects.push(e);
        }
        return newEffect;
      })
      .filter(e => e.remainingTurns > 0);
    
    // 记录过期效果的日志
    if (expiredEffects.length > 0) {
      expiredEffects.forEach(effect => {
        this.state!.phaseLogs.push(`⏰ 持续效果【${effect.description}】已过期（来源：${effect.source}）`);
        
        // 移除区域特殊效果标记
        if (effect.targetArea && effect.type === 'vaccinated') {
          const idx = this.state!.areaControl[effect.targetArea].specialEffects.indexOf('已接种');
          if (idx !== -1) {
            this.state!.areaControl[effect.targetArea].specialEffects.splice(idx, 1);
          }
        } else if (effect.targetArea && effect.type === 'skill_immunity') {
          const idx = this.state!.areaControl[effect.targetArea].specialEffects.indexOf('技能免疫');
          if (idx !== -1) {
            this.state!.areaControl[effect.targetArea].specialEffects.splice(idx, 1);
          }
        } else if (effect.targetArea && effect.type === 'trap') {
          const idx = this.state!.areaControl[effect.targetArea].specialEffects.indexOf('陷阱');
          if (idx !== -1) {
            this.state!.areaControl[effect.targetArea].specialEffects.splice(idx, 1);
          }
        }
      });
    }
    
    this.notifyStateChange();
  }

  /**
   * 获取所有活跃的持续效果
   */
  getActiveEffects(): ActiveEffect[] {
    return (this.state?.activeEffects || []).filter(e => e.remainingTurns > 0);
  }

  private notifyStateChange(): void {
    console.log('[LevelGameStateManager] notifyStateChange called', {
      hasCallback: !!this.onStateChange,
      hasState: !!this.state,
      currentPhase: this.state?.currentPhase,
      currentTurn: this.state?.currentTurn,
      round: this.state?.round,
      playerResources: this.state?.playerState?.resources
    });
    
    // 更新胜利条件目标（确保大东技能使用等计数能及时反映在UI上）
    this.updateObjectives();
    
    // 检查游戏结束条件（胜利/失败）
    const gameEndResult = this.checkGameEnd();
    if (gameEndResult && this.state) {
      // 游戏结束，添加日志
      this.state.phaseLogs.push(...gameEndResult.logs);
    }
    
    if (this.onStateChange && this.state) {
      const stateCopy = this.createStateCopy(this.state);
      console.log('[LevelGameStateManager] calling onStateChange with phase:', stateCopy.currentPhase, 'round:', stateCopy.round, 'currentTurn:', stateCopy.currentTurn);
      this.onStateChange(stateCopy);
    }
    if (this.onPhaseChange && this.state) {
      this.onPhaseChange(this.state.currentPhase);
    }
  }

  private createStateCopy(state: LevelGameState): LevelGameState {
    return {
      ...state,
      playerState: {
        ...state.playerState,
        resources: { ...state.playerState.resources },
        hand: [...state.playerState.hand],
        deck: [...state.playerState.deck],
        discardPile: [...state.playerState.discardPile]
      },
      dadongAIState: {
        ...state.dadongAIState,
        hand: [...state.dadongAIState.hand],
        resources: { ...state.dadongAIState.resources }
      },
      enemyState: {
        ...state.enemyState,
        resources: { ...state.enemyState.resources },
        // 复制技能冷却追踪
        skillCooldowns: { ...state.enemyState.skillCooldowns },
        // 复制每个区域的标记累计数
        markerCountByArea: { ...state.enemyState.markerCountByArea },
        // 复制感染区域列表
        infectedAreas: [...(state.enemyState.infectedAreas || [])],
        // 复制活跃敌人ID列表
        activeEnemyIds: [...(state.enemyState.activeEnemyIds || [])]
      },
      // 复制敌人2状态（如果存在）
      enemy2State: state.enemy2State ? {
        ...state.enemy2State,
        resources: { ...state.enemy2State.resources },
        skillCooldowns: { ...state.enemy2State.skillCooldowns },
        markerCountByArea: { ...state.enemy2State.markerCountByArea },
        infectedAreas: [...(state.enemy2State.infectedAreas || [])],
        activeEnemyIds: [...(state.enemy2State.activeEnemyIds || [])]
      } : undefined,
      areaControl: {
        internal: { ...state.areaControl.internal },
        industrial: { ...state.areaControl.industrial },
        dmz: { ...state.areaControl.dmz },
        external: { ...state.areaControl.external }
      },
      objectives: state.objectives.map(obj => ({ ...obj })),
      unlockedCards: [...state.unlockedCards],
      phaseLogs: [...state.phaseLogs],
      pendingJudgments: state.pendingJudgments?.map(j => ({ ...j })) || [],
      responseEvents: state.responseEvents?.map(e => ({ ...e })) || [],
      teamSharedLevels: {
        player: { ...state.teamSharedLevels?.player || { infiltrationLevel: 0, safetyLevel: 0 } },
        enemy: { ...state.teamSharedLevels?.enemy || { infiltrationLevel: 0, safetyLevel: 0 } }
      },
      activeEffects: state.activeEffects?.map(e => ({ ...e })) || []
    };
  }

  resetProgress(): void {
    this.progressStorage = this.initializeProgress();
    this.state = null;
  }

  skipToPhase(phase: LevelTurnPhase): boolean {
    if (!this.state) return false;

    const phaseIndex = LEVEL_TURN_PHASES.indexOf(phase);
    if (phaseIndex === -1) return false;

    this.state.currentPhase = phase;
    this.notifyStateChange();
    return true;
  }

  isPhaseInteractive(phase: LevelTurnPhase): boolean {
    return phase === 'action' || phase === 'discard';
  }

  canPlayCard(): boolean {
    if (!this.state) return false;
    return this.state.currentPhase === 'action' && this.state.playerState.actionPoints > 0;
  }

  canAdvancePhase(): boolean {
    if (!this.state) return false;
    
    if (this.state.currentPhase === 'discard') {
      const handLimit = getLevelHandLimit(this.state.round);
      return this.state.playerState.hand.length <= handLimit;
    }
    
    return true;
  }
}

export default LevelGameStateManager;
