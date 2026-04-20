import { CellActionExecutor, UIBridge } from '../engine/CellActionExecutor';
import { RewardSystem } from '../engine/RewardSystem';
import type {
  BattleCell,
  ChanceCell,
  BookstoreCell,
  SkillCell,
  BossCell,
  EndCell,
  TriggerContext,
  TowerLayerData,
  TierProbabilityRow,
} from '../types';

function createTestTriggerContext(): TriggerContext {
  return {
    playerId: 'player_1',
    currentState: {
      gameId: 'test_game',
      seed: 12345,
      startTime: Date.now(),
      currentLayer: 1,
      layersCompleted: [],
      layerEntryTimes: {},
      currentPosition: [0, 0],
      currentCellId: 'R0C0',
      visitedCells: [],
      cellsByState: { locked: [], unlocked: [], visited: [], current: [], pending: [], completed: [] },
      battlesWon: 0,
      battlesLost: 0,
      defeatedBosses: [],
      acquiredDataPackets: [],
      ownedSkills: [],
      activeSkillIds: [],
      readBooks: [],
      totalMoves: 0,
      diceRolls: 0,
      zonesTriggered: { W: 0, N: 0, I: 0, P: 0, S: 0, D: 0 },
      totalPlayTimeSeconds: 0,
    },
    layerData: {} as TowerLayerData,
    timestamp: Date.now(),
    triggerCell: {} as any,
    diceValue: 3,
  };
}

function createBattleCell(overrides?: Partial<BattleCell>): BattleCell {
  return {
    id: 'R1C1',
    coordinate: [1, 1],
    type: 'battle',
    state: 'unlocked',
    levelId: 'LV001',
    difficulty: 2,
    isCompleted: false,
    ...overrides,
  };
}

function createChanceCell(overrides?: Partial<ChanceCell>): ChanceCell {
  return {
    id: 'R0C2',
    coordinate: [0, 2],
    type: 'chance',
    state: 'unlocked',
    eventPoolIds: ['CE_L1_01', 'CE_L1_02'],
    currentVisitCount: 0,
    ...overrides,
  };
}

function createBookstoreCell(overrides?: Partial<BookstoreCell>): BookstoreCell {
  return {
    id: 'R2C4',
    coordinate: [2, 4],
    type: 'bookstore',
    state: 'unlocked',
    bookPoolTheme: 'virus',
    bookCountPerVisit: 3,
    ...overrides,
  };
}

function createSkillCell(overrides?: Partial<SkillCell>): SkillCell {
  const probTable: TierProbabilityRow = { common: 50, good: 30, rare: 15, epic: 4, legendary: 1 };
  return {
    id: 'R2C2',
    coordinate: [2, 2],
    type: 'skill',
    state: 'unlocked',
    tierProbabilityTable: probTable,
    maxSkillSlots: 3,
    ...overrides,
  };
}

function createBossCell(overrides?: Partial<BossCell>): BossCell {
  return {
    id: 'R5C2',
    coordinate: [5, 2],
    type: 'boss',
    state: 'unlocked',
    bossLevelId: 'LV016_BOSS',
    isDefeated: false,
    enhancementLevel: 3,
    dataPacketPoolIds: ['DP_T1_01', 'DP_T1_02', 'DP_T1_03', 'DP_T1_04', 'DP_T1_05'],
    layerNumber: 1,
    ...overrides,
  };
}

function createEndCell(overrides?: Partial<EndCell>): EndCell {
  return {
    id: 'R5C3',
    coordinate: [5, 3],
    type: 'end',
    state: 'unlocked',
    destinationLayer: 2,
    ...overrides,
  };
}

describe('CellActionExecutor', () => {
  let executor: CellActionExecutor;
  let rewardSystem: RewardSystem;

  beforeEach(() => {
    rewardSystem = new RewardSystem();
    executor = new CellActionExecutor(rewardSystem);
  });

  describe('executeBattle', () => {
    it('should skip already completed battle cell', async () => {
      const cell = createBattleCell({ isCompleted: true });
      const ctx = createTestTriggerContext();

      const result = await executor.executeBattle(cell, ctx);

      expect(result.success).toBe(true);
      expect(result.type).toBe('battle');
      expect(result.victory).toBe(true);
    });

    it('should construct battleEntrance UI contract', async () => {
      const cell = createBattleCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      let uiRequestData: any = null;
      uiBridge.onUIRequest((data) => {
        uiRequestData = data;
        setTimeout(() => {
          uiBridge.resolveUI({ action: 'retreat' });
        }, 10);
      });

      const result = await executor.executeBattle(cell, ctx);

      expect(uiRequestData).not.toBeNull();
      expect(uiRequestData.contractKey).toBe('battleEntrance');
      expect(uiRequestData.data.levelId).toBe('LV001');
      expect(uiRequestData.data.difficulty).toBe(2);
    });

    it('should return defeat when player retreats', async () => {
      const cell = createBattleCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'retreat' }), 10);
      });

      const result = await executor.executeBattle(cell, ctx);

      expect(result.success).toBe(false);
      expect(result.victory).toBe(false);
    });

    it('should grant rewards and mark completed on victory', async () => {
      const cell = createBattleCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'confirm' }), 10);
      });

      const result = await executor.executeBattle(cell, ctx);

      expect(result.success).toBe(true);
      expect(result.victory).toBe(true);
      expect(cell.isCompleted).toBe(true);
      expect(cell.state).toBe('completed');
    });

    it('should revert to unlocked state on defeat', async () => {
      const cell = createBattleCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'confirm' }), 10);
      });

      executor.on('BATTLE_START', () => {
        setTimeout(() => {
          executor['eventEmitter'].emit('BATTLE_END', {
            levelId: 'LV001',
            victory: false,
            exp: 0,
          });
        }, 10);
      });

      const result = await executor.executeBattle(cell, ctx);

      expect(result.victory).toBe(false);
      expect(cell.state).toBe('unlocked');
    });
  });

  describe('executeChance', () => {
    it('should select event from pool and show UI', async () => {
      const cell = createChanceCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => {
          uiBridge.resolveUI({ action: 'select', optionId: cell.eventPoolIds[0] + '_opt1' });
        }, 10);
      });

      const result = await executor.executeChance(cell, ctx);

      expect(result.type).toBe('chance');
      expect(cell.currentVisitCount).toBe(1);
    });

    it('should respect visit limit', async () => {
      const cell = createChanceCell({ visitLimit: 1, currentVisitCount: 1 });
      const ctx = createTestTriggerContext();

      const result = await executor.executeChance(cell, ctx);

      expect(result.success).toBe(false);
    });
  });

  describe('executeBookstore', () => {
    it('should display books and handle selection', async () => {
      const cell = createBookstoreCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      let uiRequestData: any = null;
      uiBridge.onUIRequest((data) => {
        uiRequestData = data;
        setTimeout(() => {
          uiBridge.resolveUI({ action: 'select', bookId: uiRequestData.data.books[0].id });
        }, 10);
      });

      const result = await executor.executeBookstore(cell, ctx);

      expect(uiRequestData.contractKey).toBe('bookstoreDisplay');
      expect(uiRequestData.data.books).toHaveLength(3);
      expect(result.type).toBe('bookstore');
    });

    it('should handle leave action', async () => {
      const cell = createBookstoreCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'leave' }), 10);
      });

      const result = await executor.executeBookstore(cell, ctx);

      expect(result.success).toBe(false);
      expect(result.effectApplied).toBe(false);
    });
  });

  describe('executeSkill', () => {
    it('should offer skill and handle selection', async () => {
      const cell = createSkillCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      let uiRequestData: any = null;
      uiBridge.onUIRequest((data) => {
        uiRequestData = data;
        setTimeout(() => {
          const skillId = uiRequestData.data.offeredSkills[0].id;
          uiBridge.resolveUI({ action: 'select', skillId });
        }, 10);
      });

      const result = await executor.executeSkill(cell, ctx);

      expect(uiRequestData.contractKey).toBe('skillOffer');
      expect(result.type).toBe('skill');
    });

    it('should handle skip action', async () => {
      const cell = createSkillCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'skip' }), 10);
      });

      const result = await executor.executeSkill(cell, ctx);

      expect(result.success).toBe(false);
    });
  });

  describe('executeBoss', () => {
    it('should skip already defeated boss', async () => {
      const cell = createBossCell({ isDefeated: true });
      const ctx = createTestTriggerContext();

      const result = await executor.executeBoss(cell, ctx);

      expect(result.success).toBe(true);
      expect(result.victory).toBe(true);
      expect(result.nextLayerUnlocked).toBe(true);
    });

    it('should offer 3 data packets after boss victory', async () => {
      const cell = createBossCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      let uiRequests: any[] = [];
      uiBridge.onUIRequest((data) => {
        uiRequests.push(data);
        if (data.contractKey === 'bossReward') {
          setTimeout(() => {
            uiBridge.resolveUI({ action: 'select', packetId: data.data.dataPackets[0].id });
          }, 10);
        }
      });

      const result = await executor.executeBoss(cell, ctx);

      const bossRewardRequest = uiRequests.find((r) => r.contractKey === 'bossReward');
      expect(bossRewardRequest).toBeDefined();
      expect(bossRewardRequest.data.dataPackets).toHaveLength(3);
      expect(result.type).toBe('boss');
      expect(result.victory).toBe(true);
      expect(cell.isDefeated).toBe(true);
    });

    it('should set nextLayerUnlocked false for layer 9 boss', async () => {
      const cell = createBossCell({ layerNumber: 9 });
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest((data) => {
        if (data.contractKey === 'bossReward') {
          setTimeout(() => {
            uiBridge.resolveUI({ action: 'select', packetId: data.data.dataPackets[0].id });
          }, 10);
        }
      });

      const result = await executor.executeBoss(cell, ctx);

      expect(result.nextLayerUnlocked).toBe(false);
    });
  });

  describe('executeEnd', () => {
    it('should emit LAYER_COMPLETE for non-final transition', async () => {
      const cell = createEndCell({ destinationLayer: 2 });
      const ctx = createTestTriggerContext();

      let emittedEvent: string | null = null;
      let emittedData: any = null;
      executor.on('LAYER_COMPLETE', (data) => {
        emittedEvent = 'LAYER_COMPLETE';
        emittedData = data;
      });

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'proceed' }), 10);
      });

      const result = await executor.executeEnd(cell, ctx);

      expect(result.success).toBe(true);
      expect(emittedEvent).toBe('LAYER_COMPLETE');
      expect(emittedData.layerNumber).toBe(1);
      expect(emittedData.nextLayer).toBe(2);
    });

    it('should emit GAME_COMPLETE for destination 0', async () => {
      const cell = createEndCell({ destinationLayer: 0 });
      const ctx = createTestTriggerContext();

      let emittedEvent: string | null = null;
      executor.on('GAME_COMPLETE', () => {
        emittedEvent = 'GAME_COMPLETE';
      });

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => uiBridge.resolveUI({ action: 'proceed' }), 10);
      });

      await executor.executeEnd(cell, ctx);

      expect(emittedEvent).toBe('GAME_COMPLETE');
    });
  });

  describe('cancelExecution', () => {
    it('should cancel ongoing execution', async () => {
      const cell = createBattleCell();
      const ctx = createTestTriggerContext();

      const uiBridge = executor.getUIBridge();
      uiBridge.onUIRequest(() => {
        setTimeout(() => executor.cancelExecution(), 10);
      });

      const result = await executor.executeBattle(cell, ctx);

      expect(result.success).toBe(false);
      expect(executor.isExecuting()).toBe(false);
    });
  });

  describe('isExecuting', () => {
    it('should return false when no execution is in progress', () => {
      expect(executor.isExecuting()).toBe(false);
    });
  });

  describe('registerExecutor', () => {
    it('should use custom executor when registered', async () => {
      const cell = createBattleCell();
      const ctx = createTestTriggerContext();

      executor.registerExecutor('battle', async (c, context) => ({
        success: true,
        type: 'battle' as const,
        cellId: c.id,
        victory: true,
        rewards: [],
        experienceGained: 999,
        executionTimeMs: 0,
      }));

      const result = await executor.execute(cell, ctx);

      expect(result.type).toBe('battle');
      if (result.type === 'battle') {
        expect(result.experienceGained).toBe(999);
      }
    });
  });
});
