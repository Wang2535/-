import type {
  GameCell,
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
  CellActionResult,
  BattleActionResult,
  ChanceActionResult,
  BookstoreActionResult,
  SkillActionResult,
  BossActionResult,
  ActionResultBase,
  ChanceEvent,
  EventOutcomeOption,
  Book,
  Skill,
  DataPacket,
  ExecutionContext,
  TriggerContext,
  EventResult,
  Reward,
  TierProbabilityRow,
  CellExecutor,
  ExecutorRegistry,
  ExecutionUIContract,
  ExecutionUIContractKey,
  LayerPreviewInfo,
} from '../types';
import type { RewardSystem } from './RewardSystem';

type EventCallback = (data: unknown) => void;

class SimpleEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export class UIBridge {
  private eventEmitter: SimpleEventEmitter;
  private pendingUIResolve: ((value: unknown) => void) | null = null;
  private currentContractKey: ExecutionUIContractKey | null = null;

  constructor() {
    this.eventEmitter = new SimpleEventEmitter();
  }

  async requestUI(
    contractKey: ExecutionUIContractKey,
    data: unknown
  ): Promise<unknown> {
    this.currentContractKey = contractKey;
    this.eventEmitter.emit('ui_request', { contractKey, data });

    return new Promise<unknown>((resolve) => {
      this.pendingUIResolve = resolve;
    });
  }

  dismissUI(): void {
    this.currentContractKey = null;
    if (this.pendingUIResolve) {
      this.pendingUIResolve(null);
      this.pendingUIResolve = null;
    }
    this.eventEmitter.emit('ui_dismiss', {});
  }

  onUserAction(action: string, handler: (data: unknown) => void): void {
    this.eventEmitter.on(`user_action_${action}`, handler);
  }

  resolveUI(result: unknown): void {
    if (this.pendingUIResolve) {
      this.pendingUIResolve(result);
      this.pendingUIResolve = null;
    }
    this.currentContractKey = null;
  }

  getCurrentContractKey(): ExecutionUIContractKey | null {
    return this.currentContractKey;
  }

  onUIRequest(handler: (data: { contractKey: ExecutionUIContractKey; data: unknown }) => void): void {
    this.eventEmitter.on('ui_request', handler as EventCallback);
  }

  onUIDismiss(handler: (data: unknown) => void): void {
    this.eventEmitter.on('ui_dismiss', handler);
  }
}

const TIER_CONFIG: Record<number, { themeName: string; shapeDescription: string; difficultyRange: number[] }> = {
  1: { themeName: '病毒实验室', shapeDescription: '葫芦形培养皿', difficultyRange: [1, 3] },
  2: { themeName: '网络空间', shapeDescription: '双环形拓扑', difficultyRange: [1, 3] },
  3: { themeName: '数据保险库', shapeDescription: '同心堡垒', difficultyRange: [2, 4] },
  4: { themeName: '城市街区', shapeDescription: '网格城市街区', difficultyRange: [2, 4] },
  5: { themeName: '智能工厂', shapeDescription: '生产树', difficultyRange: [3, 5] },
  6: { themeName: '移动终端', shapeDescription: '六边形蜂窝', difficultyRange: [3, 5] },
  7: { themeName: '云端平台', shapeDescription: '不规则云', difficultyRange: [4, 5] },
  8: { themeName: '未来实验室', shapeDescription: '量子云', difficultyRange: [4, 5] },
  9: { themeName: '指挥中心', shapeDescription: '对称王座厅', difficultyRange: [5, 5] },
};

export class CellActionExecutor {
  private registry: Partial<ExecutorRegistry>;
  private uiBridge: UIBridge;
  private rewardSystem: RewardSystem;
  private _isExecuting: boolean;
  private _cancelled: boolean;
  private eventEmitter: SimpleEventEmitter;

  constructor(rewardSystem: RewardSystem) {
    this.registry = {};
    this.uiBridge = new UIBridge();
    this.rewardSystem = rewardSystem;
    this._isExecuting = false;
    this._cancelled = false;
    this.eventEmitter = new SimpleEventEmitter();
  }

  registerExecutor<T extends GameCell>(
    type: T['type'],
    executor: CellExecutor<T>
  ): void {
    (this.registry as Record<string, CellExecutor<GameCell>>)[type] =
      executor as CellExecutor<GameCell>;
  }

  getUIBridge(): UIBridge {
    return this.uiBridge;
  }

  async execute(
    cell: GameCell,
    context: TriggerContext
  ): Promise<CellActionResult> {
    if (this._isExecuting) {
      throw new Error('Another execution is already in progress');
    }

    this._isExecuting = true;
    this._cancelled = false;
    const startTime = Date.now();

    try {
      let result: CellActionResult;

      const customExecutor = (this.registry as Record<string, CellExecutor<GameCell>>)[cell.type];
      if (customExecutor) {
        result = await customExecutor(cell, context);
      } else {
        switch (cell.type) {
          case 'battle':
            result = await this.executeBattle(cell as BattleCell, context);
            break;
          case 'chance':
            result = await this.executeChance(cell as ChanceCell, context);
            break;
          case 'bookstore':
            result = await this.executeBookstore(cell as BookstoreCell, context);
            break;
          case 'skill':
            result = await this.executeSkill(cell as SkillCell, context);
            break;
          case 'boss':
            result = await this.executeBoss(cell as BossCell, context);
            break;
          case 'end':
            result = (await this.executeEnd(cell as EndCell, context)) as CellActionResult;
            break;
          default:
            throw new Error(`Unknown cell type: ${(cell as GameCell).type}`);
        }
      }

      result.executionTimeMs = Date.now() - startTime;
      return result;
    } finally {
      this._isExecuting = false;
    }
  }

  async executeBattle(
    cell: BattleCell,
    ctx: TriggerContext
  ): Promise<BattleActionResult> {
    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'battle') as BattleActionResult;
    }

    if (cell.isCompleted) {
      return {
        success: true,
        type: 'battle',
        cellId: cell.id,
        victory: true,
        rewards: [],
        experienceGained: 0,
        executionTimeMs: 0,
      };
    }

    // 从 layerData 获取关卡分配信息
    const layerData = ctx.layerData as any;
    const levelAssignment = layerData?.levelAssignment;
    const assignedLevelId = levelAssignment?.battleCellAssignments?.[cell.id];
    
    // 使用分配的关卡ID或默认使用cell的levelId
    const levelId = assignedLevelId || cell.levelId || `L${layerData?.layerNumber}_${cell.id}`;
    
    // 获取敌人信息（可以从关卡数据库查询）
    const enemyName = this.getEnemyNameForLevel(levelId);

    const uiResult = await this.uiBridge.requestUI('battleEntrance', {
      levelId: levelId,
      enemyPreview: { 
        name: enemyName, 
        icon: '⚔️', 
        threatLevel: cell.difficulty > 3 ? 'high' : cell.difficulty > 1 ? 'normal' : 'low' 
      },
      difficulty: cell.difficulty,
      estimatedRewards: cell.rewardCardId ? [cell.rewardCardId] : [],
      onConfirm: () => this.uiBridge.resolveUI({ action: 'confirm' }),
      onRetreat: () => this.uiBridge.resolveUI({ action: 'retreat' }),
    });

    if (this.checkCancelled() || !uiResult || (uiResult as { action: string }).action === 'retreat') {
      return {
        success: false,
        type: 'battle',
        cellId: cell.id,
        victory: false,
        rewards: [],
        experienceGained: 0,
        executionTimeMs: 0,
      };
    }

    this.eventEmitter.emit('BATTLE_START', { levelId: levelId, cellId: cell.id });

    const battleEndResult = await this.waitForBattleEnd(levelId);

    if (battleEndResult.victory) {
      const rewardResult = await this.rewardSystem.grantBattleReward(
        levelId,
        true
      );

      cell.isCompleted = true;
      cell.state = 'completed';

      this.eventEmitter.emit('BATTLE_VICTORY', {
        cellId: cell.id,
        levelId: levelId,
        rewards: rewardResult.grantedItems,
      });

      return {
        success: true,
        type: 'battle',
        cellId: cell.id,
        victory: true,
        rewards: rewardResult.grantedItems.map((g) => ({
          type: g.type,
          id: g.id,
          name: g.name,
        })),
        experienceGained: rewardResult.experienceGained,
        executionTimeMs: 0,
      };
    } else {
      cell.state = 'unlocked';

      return {
        success: false,
        type: 'battle',
        cellId: cell.id,
        victory: false,
        rewards: [],
        experienceGained: 0,
        executionTimeMs: 0,
      };
    }
  }

  async executeChance(
    cell: ChanceCell,
    ctx: TriggerContext
  ): Promise<ChanceActionResult> {
    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'chance') as ChanceActionResult;
    }

    if (cell.visitLimit && cell.currentVisitCount >= cell.visitLimit) {
      return {
        success: false,
        type: 'chance',
        cellId: cell.id,
        eventId: '',
        result: { eventId: '', rewards: [], penalties: [], message: 'Visit limit reached' },
        executionTimeMs: 0,
      };
    }

    const event = this.selectRandomEvent(cell.eventPoolIds);
    if (!event) {
      return {
        success: false,
        type: 'chance',
        cellId: cell.id,
        eventId: '',
        result: { eventId: '', rewards: [], penalties: [], message: 'No events available' },
        executionTimeMs: 0,
      };
    }

    if (event.outcomeOptions && event.outcomeOptions.length > 0) {
      const uiResult = await this.uiBridge.requestUI('chanceEvent', {
        event,
        outcomeOptions: event.outcomeOptions,
        onSelectOption: (optionId: string) =>
          this.uiBridge.resolveUI({ action: 'select', optionId }),
        onReroll: undefined,
      });

      if (this.checkCancelled() || !uiResult) {
        return this.createCancelledResult(cell.id, 'chance') as ChanceActionResult;
      }

      const selected = uiResult as { action: string; optionId: string };
      const option = event.outcomeOptions.find((o) => o.id === selected.optionId);

      cell.currentVisitCount++;

      const eventResult = this.resolveEventOption(option, event.id);
      await this.applyEventRewards(eventResult.rewards);

      return {
        success: true,
        type: 'chance',
        cellId: cell.id,
        eventId: event.id,
        result: eventResult,
        executionTimeMs: 0,
      };
    } else {
      cell.currentVisitCount++;

      const eventResult = this.resolveImmediateEvent(event);
      await this.applyEventRewards(eventResult.rewards);

      return {
        success: true,
        type: 'chance',
        cellId: cell.id,
        eventId: event.id,
        result: eventResult,
        executionTimeMs: 0,
      };
    }
  }

  async executeBookstore(
    cell: BookstoreCell,
    ctx: TriggerContext
  ): Promise<BookstoreActionResult> {
    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'bookstore') as BookstoreActionResult;
    }

    const books = this.selectRandomBooks(cell.bookPoolTheme, cell.bookCountPerVisit);
    const inventory = this.rewardSystem.getInventory();
    const canAfford = books.map(() => inventory.gold >= 0);

    const uiResult = await this.uiBridge.requestUI('bookstoreDisplay', {
      books,
      playerGold: inventory.gold,
      canAfford,
      onSelectBook: (bookId: string) =>
        this.uiBridge.resolveUI({ action: 'select', bookId }),
      onLeave: () => this.uiBridge.resolveUI({ action: 'leave' }),
    });

    if (this.checkCancelled() || !uiResult || (uiResult as { action: string }).action === 'leave') {
      return {
        success: false,
        type: 'bookstore',
        cellId: cell.id,
        selectedBook: books[0],
        effectApplied: false,
        executionTimeMs: 0,
      };
    }

    const selected = uiResult as { action: string; bookId: string };
    const selectedBook = books.find((b) => b.id === selected.bookId);

    if (!selectedBook) {
      return {
        success: false,
        type: 'bookstore',
        cellId: cell.id,
        selectedBook: books[0],
        effectApplied: false,
        executionTimeMs: 0,
      };
    }

    const grantResult = await this.rewardSystem.grantBook(selectedBook, 'bookstore_purchase');

    return {
      success: grantResult.success,
      type: 'bookstore',
      cellId: cell.id,
      selectedBook,
      effectApplied: grantResult.success,
      executionTimeMs: 0,
    };
  }

  async executeSkill(
    cell: SkillCell,
    ctx: TriggerContext
  ): Promise<SkillActionResult> {
    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'skill') as SkillActionResult;
    }

    const quality = this.rollSkillQuality(cell.tierProbabilityTable);
    const skill = this.selectRandomSkill(quality);

    if (!skill) {
      return {
        success: false,
        type: 'skill',
        cellId: cell.id,
        acquiredSkill: { id: '', name: '', quality: 'common', triggerTiming: 'passive', effectType: 'special', effectDescription: '', iconDescription: '' },
        slotChanged: false,
        executionTimeMs: 0,
      };
    }

    const inventory = this.rewardSystem.getInventory();
    const currentActiveSkills = inventory.ownedSkills.filter((s) =>
      inventory.activeSkillIds.includes(s.id)
    );

    const uiResult = await this.uiBridge.requestUI('skillOffer', {
      offeredSkills: [skill],
      currentActiveSkills,
      maxSlots: cell.maxSkillSlots,
      onSelectSkill: (skillId: string, replaceSlot?: number) =>
        this.uiBridge.resolveUI({ action: 'select', skillId, replaceSlot }),
      onSkip: () => this.uiBridge.resolveUI({ action: 'skip' }),
    });

    if (this.checkCancelled() || !uiResult || (uiResult as { action: string }).action === 'skip') {
      return {
        success: false,
        type: 'skill',
        cellId: cell.id,
        acquiredSkill: skill,
        slotChanged: false,
        executionTimeMs: 0,
      };
    }

    const selected = uiResult as { action: string; skillId: string; replaceSlot?: number };
    const grantResult = await this.rewardSystem.grantSkill(
      skill,
      'skill_grant',
      selected.replaceSlot
    );

    const replacedSkill = grantResult.conflictResolution?.conflictingWith
      ? currentActiveSkills.find(
          (s) => s.id === grantResult.conflictResolution!.conflictingWith
        )
      : undefined;

    return {
      success: grantResult.success,
      type: 'skill',
      cellId: cell.id,
      acquiredSkill: skill,
      replacedSkill,
      slotChanged: !!selected.replaceSlot || inventory.activeSkillIds.length < cell.maxSkillSlots,
      executionTimeMs: 0,
    };
  }

  async executeBoss(
    cell: BossCell,
    ctx: TriggerContext
  ): Promise<BossActionResult> {
    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'boss') as BossActionResult;
    }

    if (cell.isDefeated) {
      return {
        success: true,
        type: 'boss',
        cellId: cell.id,
        victory: true,
        dataPacketsOffered: [],
        nextLayerUnlocked: cell.layerNumber < 9,
        executionTimeMs: 0,
      };
    }

    this.eventEmitter.emit('BOSS_BATTLE_START', {
      bossLevelId: cell.bossLevelId,
      enhancementLevel: cell.enhancementLevel,
      cellId: cell.id,
    });

    const battleResult = await this.waitForBossBattleEnd(cell);

    if (!battleResult.victory) {
      return {
        success: false,
        type: 'boss',
        cellId: cell.id,
        victory: false,
        dataPacketsOffered: [],
        nextLayerUnlocked: false,
        executionTimeMs: 0,
      };
    }

    this.eventEmitter.emit('BOSS_DEFEATED', {
      cellId: cell.id,
      layerNumber: cell.layerNumber,
    });

    const packets = this.selectRandomPackets(cell.dataPacketPoolIds, 3);

    const uiResult = await this.uiBridge.requestUI('bossReward', {
      dataPackets: packets,
      onSelectPacket: (packetId: string) =>
        this.uiBridge.resolveUI({ action: 'select', packetId }),
    });

    if (this.checkCancelled() || !uiResult) {
      return {
        success: true,
        type: 'boss',
        cellId: cell.id,
        victory: true,
        dataPacketsOffered: packets,
        nextLayerUnlocked: cell.layerNumber < 9,
        executionTimeMs: 0,
      };
    }

    const selected = uiResult as { action: string; packetId: string };
    const selectedPacket = packets.find((p) => p.id === selected.packetId);

    if (selectedPacket) {
      await this.rewardSystem.grantBossDataPacketSelection(packets, selectedPacket.id);
    }

    cell.isDefeated = true;
    cell.state = 'completed';

    const nextLayerUnlocked = cell.layerNumber < 9;

    return {
      success: true,
      type: 'boss',
      cellId: cell.id,
      victory: true,
      dataPacketsOffered: packets,
      selectedPacket,
      nextLayerUnlocked,
      executionTimeMs: 0,
    };
  }

  async executeEnd(
    cell: EndCell,
    ctx: TriggerContext
  ): Promise<ActionResultBase> {
    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'end') as unknown as ActionResultBase;
    }

    const fromLayer = cell.destinationLayer > 0 ? cell.destinationLayer - 1 : 9;
    const toLayer = cell.destinationLayer;
    const nextPreview = this.getLayerPreview(toLayer);

    const uiResult = await this.uiBridge.requestUI('layerTransition', {
      fromLayer,
      toLayer,
      nextLayerPreview: nextPreview,
      onProceed: () => this.uiBridge.resolveUI({ action: 'proceed' }),
    });

    if (this.checkCancelled()) {
      return this.createCancelledResult(cell.id, 'end') as unknown as ActionResultBase;
    }

    if (toLayer > 0 && toLayer <= 9) {
      this.eventEmitter.emit('LAYER_COMPLETE', {
        layerNumber: fromLayer,
        nextLayer: toLayer,
      });
    } else if (toLayer === 0) {
      this.eventEmitter.emit('GAME_COMPLETE', {});
    }

    return {
      success: true,
      cellId: cell.id,
      executionTimeMs: 0,
    };
  }

  cancelExecution(): void {
    this._cancelled = true;
    this.uiBridge.dismissUI();
  }

  isExecuting(): boolean {
    return this._isExecuting;
  }

  on(event: string, callback: EventCallback): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    this.eventEmitter.off(event, callback);
  }

  private checkCancelled(): boolean {
    return this._cancelled;
  }

  private createCancelledResult(cellId: string, type: string): CellActionResult {
    const base = {
      success: false,
      cellId,
      executionTimeMs: 0,
    };
    switch (type) {
      case 'battle':
        return { ...base, type: 'battle', victory: false, rewards: [], experienceGained: 0 };
      case 'chance':
        return { ...base, type: 'chance', eventId: '', result: { eventId: '', rewards: [], penalties: [], message: 'Cancelled' } };
      case 'bookstore':
        return { ...base, type: 'bookstore', selectedBook: { id: '', name: '', author: '', coverTheme: '', tier: 0, theme: 'virus' as const, quality: 'common' as const, effectType: 'buff_combat' as const, effectDescription: '', flavorText: '', isRead: false }, effectApplied: false };
      case 'skill':
        return { ...base, type: 'skill', acquiredSkill: { id: '', name: '', quality: 'common', triggerTiming: 'passive', effectType: 'special', effectDescription: '', iconDescription: '' }, slotChanged: false };
      case 'boss':
        return { ...base, type: 'boss', victory: false, dataPacketsOffered: [], nextLayerUnlocked: false };
      default:
        return { ...base, type: 'battle', victory: false, rewards: [], experienceGained: 0 };
    }
  }

  private getEnemyNameForLevel(levelId: string): string {
    // 从关卡ID提取主题和编号
    const match = levelId.match(/LV(\d+)/);
    if (match) {
      const levelNum = parseInt(match[1], 10);
      // 根据关卡编号返回对应的敌人名称
      const enemyNames: Record<number, string> = {
        1: '埃尔克克隆者',
        2: '传播者斯克伦塔',
        3: '莫里斯蠕虫',
        4: '勒索软件',
        5: '特洛伊木马',
        6: '网络钓鱼者',
        7: 'DDoS攻击者',
        8: '数据窃取者',
        9: '高级持续威胁',
        10: '零日漏洞利用者',
      };
      const index = ((levelNum - 1) % 10) + 1;
      return enemyNames[index] || `敌人 ${levelId}`;
    }
    return `敌人 ${levelId}`;
  }

  private async waitForBattleEnd(levelId: string): Promise<{ victory: boolean; exp: number }> {
    return new Promise((resolve) => {
      const handler = (data: unknown) => {
        const result = data as { levelId: string; victory: boolean; exp: number };
        if (result.levelId === levelId) {
          this.eventEmitter.off('BATTLE_END', handler);
          resolve(result);
        }
      };
      this.eventEmitter.on('BATTLE_END', handler);

      setTimeout(() => {
        this.eventEmitter.off('BATTLE_END', handler);
        resolve({ victory: true, exp: 10 });
      }, 100);
    });
  }

  private async waitForBossBattleEnd(cell: BossCell): Promise<{ victory: boolean }> {
    return new Promise((resolve) => {
      const handler = (data: unknown) => {
        const result = data as { bossLevelId: string; victory: boolean };
        if (result.bossLevelId === cell.bossLevelId) {
          this.eventEmitter.off('BOSS_BATTLE_END', handler);
          resolve(result);
        }
      };
      this.eventEmitter.on('BOSS_BATTLE_END', handler);

      setTimeout(() => {
        this.eventEmitter.off('BOSS_BATTLE_END', handler);
        resolve({ victory: true });
      }, 100);
    });
  }

  private selectRandomEvent(eventPoolIds: string[]): ChanceEvent | null {
    if (eventPoolIds.length === 0) return null;
    const randomId = eventPoolIds[Math.floor(Math.random() * eventPoolIds.length)];
    return {
      id: randomId,
      name: `Event: ${randomId}`,
      description: 'A random chance event',
      eventType: 'choice',
      rarity: 'common',
      tierRange: [1, 9],
      outcomeOptions: [
        { id: `${randomId}_opt1`, label: 'Option A', description: 'Take the risk', rewards: [{ type: 'gold', id: 'gold_10', name: '10 Gold', quantity: 10 }] },
        { id: `${randomId}_opt2`, label: 'Option B', description: 'Play it safe', rewards: [{ type: 'heal', id: 'heal_5', name: '5 HP', quantity: 5 }] },
      ],
    };
  }

  private selectRandomBooks(theme: string, count: number): Book[] {
    const books: Book[] = [];
    for (let i = 0; i < count; i++) {
      books.push({
        id: `book_${theme}_${i + 1}`,
        name: `Book ${i + 1} of ${theme}`,
        author: 'Unknown Author',
        coverTheme: theme,
        tier: 1,
        theme: theme as Book['theme'],
        quality: i === 0 ? 'common' : i === 1 ? 'uncommon' : 'rare',
        effectType: 'buff_combat',
        effectDescription: `A book about ${theme}`,
        flavorText: `Knowledge is power in ${theme}`,
        isRead: false,
      });
    }
    return books;
  }

  private rollSkillQuality(probTable: TierProbabilityRow): Skill['quality'] {
    const qualities: Skill['quality'][] = ['common', 'good', 'rare', 'epic', 'legendary'];
    const weights = [probTable.common, probTable.good, probTable.rare, probTable.epic, probTable.legendary];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < qualities.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return qualities[i];
    }
    return qualities[qualities.length - 1];
  }

  private selectRandomSkill(quality: Skill['quality']): Skill | null {
    return {
      id: `skill_${quality}_${Date.now()}`,
      name: `${quality} Skill`,
      quality,
      triggerTiming: 'passive',
      effectType: 'shield',
      effectDescription: `A ${quality} quality skill`,
      iconDescription: `${quality} skill icon`,
    };
  }

  private selectRandomPackets(poolIds: string[], count: number): DataPacket[] {
    const shuffled = [...poolIds].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    return selected.map((id, index) => ({
      id,
      name: `Data Packet: ${id}`,
      description: `A data packet from the pool`,
      iconDescription: `${id} icon`,
      tier: 1,
      theme: 'virus' as const,
      rarity: (['common', 'uncommon', 'rare'] as const)[index % 3],
      effectType: 'buff_combat' as const,
      effect: {
        effectValue: 1,
        isPermanent: true,
        stackable: false,
      },
      flavorText: `Data is the new oil: ${id}`,
    }));
  }

  private getLayerPreview(layerNumber: number): LayerPreviewInfo {
    const config = TIER_CONFIG[layerNumber];
    if (!config) {
      return {
        themeName: 'Unknown',
        shapeDescription: 'Unknown',
        estimatedDifficulty: '???',
      };
    }
    return {
      themeName: config.themeName,
      shapeDescription: config.shapeDescription,
      estimatedDifficulty: `${config.difficultyRange[0]}-${config.difficultyRange[1]}`,
    };
  }

  private resolveEventOption(
    option: EventOutcomeOption | undefined,
    eventId: string
  ): EventResult {
    if (!option) {
      return { eventId, rewards: [], penalties: [], message: 'No option selected' };
    }
    return {
      eventId,
      optionSelected: option.id,
      rewards: option.rewards ?? [],
      penalties: option.penalties ?? [],
      message: option.description,
    };
  }

  private resolveImmediateEvent(event: ChanceEvent): EventResult {
    const isPositive = event.eventType === 'positive';
    return {
      eventId: event.id,
      rewards: isPositive ? [{ type: 'gold', id: 'gold_5', name: '5 Gold', quantity: 5 }] : [],
      penalties: !isPositive ? [{ type: 'hp', value: 5, description: 'Lost 5 HP' }] : [],
      message: event.description,
    };
  }

  private async applyEventRewards(rewards: Reward[]): Promise<void> {
    for (const reward of rewards) {
      if (reward.type === 'gold') {
        const inventory = this.rewardSystem.getInventory();
        const newInventory = { ...inventory, gold: inventory.gold + (reward.quantity ?? 0) };
        this.rewardSystem.restoreFromSnapshot(newInventory);
      }
    }
  }
}
