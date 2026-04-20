import { ProgressManager } from '../engine/ProgressManager';
import type {
  BattleActionResult,
  DataPacket,
} from '../types';

describe('ProgressManager', () => {
  let progressManager: ProgressManager;

  beforeEach(() => {
    progressManager = new ProgressManager();
  });

  afterEach(() => {
    progressManager.disableAutoSave();
    progressManager.wipeAllData();
  });

  describe('session management', () => {
    it('newGame should create clean initial state', () => {
      const session = progressManager.newGame(42);

      expect(session.seed).toBe(42);
      expect(session.sessionId).toBeDefined();
      expect(session.startedAt).toBeGreaterThan(0);

      const progress = progressManager.getCurrentProgress();
      expect(progress.currentLayer).toBe(1);
      expect(progress.layersCompleted).toHaveLength(0);
      expect(progress.battlesWon).toBe(0);
      expect(progress.acquiredDataPackets).toHaveLength(0);
    });

    it('saveGame and loadSave should roundtrip correctly', async () => {
      progressManager.newGame(42);
      progressManager['state'].progress.battlesWon = 5;
      progressManager['state'].progress.currentLayer = 3;

      await progressManager.saveGame('test_slot', 'Test Save');

      const newManager = new ProgressManager();
      const loaded = await newManager.loadSave('test_slot');

      expect(loaded.battlesWon).toBe(5);
      expect(loaded.currentLayer).toBe(3);

      newManager.wipeAllData();
    });

    it('newGame with random seed should produce different sessions', () => {
      const session1 = progressManager.newGame();
      const session2 = progressManager.newGame();

      expect(session1.sessionId).not.toBe(session2.sessionId);
    });
  });

  describe('progress tracking', () => {
    it('recordBattle should update win/loss statistics', () => {
      progressManager.newGame(1);

      const victoryResult: BattleActionResult = {
        success: true,
        type: 'battle',
        cellId: 'R1C1',
        victory: true,
        rewards: [],
        experienceGained: 10,
        executionTimeMs: 100,
      };

      progressManager.recordBattle(victoryResult);

      const progress = progressManager.getCurrentProgress();
      expect(progress.battlesWon).toBe(1);
      expect(progress.battlesLost).toBe(0);

      const defeatResult: BattleActionResult = {
        success: false,
        type: 'battle',
        cellId: 'R1C2',
        victory: false,
        rewards: [],
        experienceGained: 0,
        executionTimeMs: 100,
      };

      progressManager.recordBattle(defeatResult);

      const progressAfterDefeat = progressManager.getCurrentProgress();
      expect(progressAfterDefeat.battlesWon).toBe(1);
      expect(progressAfterDefeat.battlesLost).toBe(1);
    });

    it('recordBossDefeat should record boss and packets', () => {
      progressManager.newGame(1);

      const packets: DataPacket[] = [
        {
          id: 'DP_T1_01',
          name: 'Test Packet',
          description: 'Test',
          iconDescription: 'test',
          tier: 1,
          theme: 'virus',
          rarity: 'common',
          effectType: 'buff_combat',
          effect: { effectValue: 1, isPermanent: true, stackable: false },
          flavorText: 'Test',
        },
      ];

      progressManager.recordBossDefeat(1, packets);

      const progress = progressManager.getCurrentProgress();
      expect(progress.defeatedBosses).toContain('L1_BOSS');
      expect(progress.acquiredDataPackets).toHaveLength(1);
    });

    it('recordLayerComplete should create snapshot and advance layer', () => {
      progressManager.newGame(1);

      let layerCompleteFired = false;
      progressManager.on('LAYER_COMPLETE', () => {
        layerCompleteFired = true;
      });

      progressManager.recordLayerComplete(1);

      const progress = progressManager.getCurrentProgress();
      expect(progress.layersCompleted).toContain(1);
      expect(progress.currentLayer).toBe(2);
      expect(layerCompleteFired).toBe(true);

      const snapshot = progressManager.getLayerSnapshot(1);
      expect(snapshot.layerNumber).toBe(1);
      expect(snapshot.bossDefeated).toBeDefined();
    });

    it('recordLayerComplete for layer 9 should emit GAME_COMPLETE', () => {
      progressManager.newGame(1);

      let gameCompleteFired = false;
      progressManager.on('GAME_COMPLETE', () => {
        gameCompleteFired = true;
      });

      progressManager.recordLayerComplete(9);

      expect(gameCompleteFired).toBe(true);
    });

    it('recordZoneTrigger should increment zone counter', () => {
      progressManager.newGame(1);

      progressManager.recordZoneTrigger('W');
      progressManager.recordZoneTrigger('W');
      progressManager.recordZoneTrigger('N');

      const progress = progressManager.getCurrentProgress();
      expect(progress.zonesTriggered['W']).toBe(2);
      expect(progress.zonesTriggered['N']).toBe(1);
    });

    it('updatePosition should update current cell and coordinates', () => {
      progressManager.newGame(1);

      progressManager.updatePosition('R2C3', [2, 3]);

      const progress = progressManager.getCurrentProgress();
      expect(progress.currentCellId).toBe('R2C3');
      expect(progress.currentPosition).toEqual([2, 3]);
      expect(progress.visitedCells).toContain('R2C3');
    });

    it('recordMove should increment totalMoves and diceRolls', () => {
      progressManager.newGame(1);

      progressManager.recordMove({
        fromCellId: 'R0C0',
        toCellId: 'R1C1',
        diceValue: 4,
        timestamp: Date.now(),
        zonesTriggered: [],
      });

      const progress = progressManager.getCurrentProgress();
      expect(progress.totalMoves).toBe(1);
      expect(progress.diceRolls).toBe(1);
    });
  });

  describe('layer snapshots', () => {
    it('createLayerCompletionSnapshot should contain complete state', () => {
      progressManager.newGame(1);

      const snapshot = progressManager.createLayerCompletionSnapshot(1);

      expect(snapshot.layerNumber).toBe(1);
      expect(snapshot.bossDefeated).toBeDefined();
      expect(snapshot.dataPacketsAcquired).toBeDefined();
      expect(snapshot.moveCount).toBeDefined();
      expect(snapshot.enterTime).toBeGreaterThan(0);
    });

    it('restoreToLayerSnapshot should revert to specified layer', () => {
      progressManager.newGame(1);
      progressManager.recordLayerComplete(1);
      progressManager.recordLayerComplete(2);

      progressManager.restoreToLayerSnapshot(1);

      const progress = progressManager.getCurrentProgress();
      expect(progress.currentLayer).toBe(1);
      expect(progress.layersCompleted).not.toContain(2);
    });

    it('restoreToLayerSnapshot should throw for missing snapshot', () => {
      progressManager.newGame(1);

      expect(() => progressManager.restoreToLayerSnapshot(99)).toThrow();
    });
  });

  describe('auto-save', () => {
    it('enableAutoSave should start periodic saving', () => {
      progressManager.newGame(1);
      progressManager.enableAutoSave(1000);

      expect(progressManager['autoSaveTimer']).not.toBeNull();

      progressManager.disableAutoSave();
    });

    it('disableAutoSave should stop timer', () => {
      progressManager.newGame(1);
      progressManager.enableAutoSave(1000);
      progressManager.disableAutoSave();

      expect(progressManager['autoSaveTimer']).toBeNull();
    });
  });

  describe('statistics', () => {
    it('getStatistics should aggregate all dimensions', () => {
      progressManager.newGame(1);

      const stats = progressManager.getStatistics();

      expect(stats.totalPlayTime).toBeDefined();
      expect(stats.totalBattles).toBe(0);
      expect(stats.battlesWon).toBe(0);
      expect(stats.battlesLost).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.totalMoves).toBe(0);
      expect(stats.packetsCollected).toBe(0);
      expect(stats.booksRead).toBe(0);
      expect(stats.skillsAcquired).toBe(0);
      expect(stats.bossesDefeated).toBe(0);
      expect(stats.layersCompleted).toBe(0);
    });

    it('getStatistics should reflect recorded battles', () => {
      progressManager.newGame(1);

      progressManager.recordBattle({
        success: true,
        type: 'battle',
        cellId: 'R1C1',
        victory: true,
        rewards: [],
        experienceGained: 10,
        executionTimeMs: 100,
      });

      const stats = progressManager.getStatistics();
      expect(stats.totalBattles).toBe(1);
      expect(stats.battlesWon).toBe(1);
      expect(stats.winRate).toBe(1);
    });

    it('getCompletionPercentage should calculate based on layers', () => {
      progressManager.newGame(1);

      expect(progressManager.getCompletionPercentage()).toBe(0);

      progressManager.recordLayerComplete(1);
      expect(progressManager.getCompletionPercentage()).toBe(11);

      progressManager.recordLayerComplete(2);
      expect(progressManager.getCompletionPercentage()).toBe(22);
    });
  });

  describe('milestones', () => {
    it('checkMilestones should return newly achieved milestones', () => {
      progressManager.newGame(1);

      const initialMilestones = progressManager.checkMilestones();
      expect(initialMilestones).toHaveLength(0);

      progressManager.recordLayerComplete(1);

      const firstLayerMilestone = progressManager['milestones'].find((m) => m.id === 'first_layer');
      expect(firstLayerMilestone).toBeDefined();
      expect(firstLayerMilestone!.achievedAt).toBeGreaterThan(0);
    });

    it('checkMilestones should not return already achieved milestones', () => {
      progressManager.newGame(1);
      progressManager.recordLayerComplete(1);

      progressManager.checkMilestones();
      const secondCheck = progressManager.checkMilestones();

      const firstLayer = secondCheck.find((m) => m.id === 'first_layer');
      expect(firstLayer).toBeUndefined();
    });
  });

  describe('import/export', () => {
    it('exportProgress and importProgress should roundtrip', () => {
      progressManager.newGame(42);
      progressManager.recordLayerComplete(1);

      const exported = progressManager.exportProgress();

      const newManager = new ProgressManager();
      const result = newManager.importProgress(exported);

      expect(result.success).toBe(true);
      expect(result.versionCompatible).toBe(true);
      expect(result.importedSession).not.toBeNull();
      expect(result.importedSession!.seed).toBe(42);

      const progress = newManager.getCurrentProgress();
      expect(progress.layersCompleted).toContain(1);

      newManager.wipeAllData();
    });

    it('importProgress should handle invalid JSON', () => {
      const result = progressManager.importProgress('not valid json');

      expect(result.success).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('importProgress should warn on version mismatch', () => {
      const data = JSON.stringify({
        version: '0.5.0',
        state: progressManager['state'],
      });

      const result = progressManager.importProgress(data);

      expect(result.versionCompatible).toBe(false);
      expect(result.warnings.some((w) => w.includes('Version mismatch'))).toBe(true);
    });
  });

  describe('reset and wipe', () => {
    it('resetCurrentGame should reset state but keep slot', () => {
      progressManager.newGame(1);
      progressManager.recordLayerComplete(1);

      const slotId = progressManager['state'].saveMeta.slotId;
      progressManager.resetCurrentGame();

      const progress = progressManager.getCurrentProgress();
      expect(progress.currentLayer).toBe(1);
      expect(progress.layersCompleted).toHaveLength(0);
      expect(progressManager['state'].saveMeta.slotId).toBe(slotId);
    });

    it('wipeAllData should clear everything', () => {
      progressManager.newGame(1);
      progressManager.wipeAllData();

      const progress = progressManager.getCurrentProgress();
      expect(progress.currentLayer).toBe(1);
      expect(progress.layersCompleted).toHaveLength(0);
    });
  });
});
