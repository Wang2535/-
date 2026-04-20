import { RewardSystem } from '../engine/RewardSystem';
import type {
  DataPacket,
  Book,
  Skill,
  InventorySnapshot,
} from '../types';

function createTestPacket(id: string, tier: number = 1): DataPacket {
  return {
    id,
    name: `Test Packet ${id}`,
    description: 'A test data packet',
    iconDescription: 'test icon',
    tier,
    theme: 'virus',
    rarity: 'common',
    effectType: 'buff_combat',
    effect: { effectValue: 1, isPermanent: true, stackable: false },
    flavorText: 'Test flavor',
  };
}

function createTestBook(id: string): Book {
  return {
    id,
    name: `Test Book ${id}`,
    author: 'Test Author',
    coverTheme: 'virus',
    tier: 1,
    theme: 'virus',
    quality: 'common',
    effectType: 'buff_combat',
    effectDescription: 'A test book',
    flavorText: 'Test flavor',
    isRead: false,
  };
}

function createTestSkill(id: string, quality: Skill['quality'] = 'common'): Skill {
  return {
    id,
    name: `Test Skill ${id}`,
    quality,
    triggerTiming: 'passive',
    effectType: 'shield',
    effectDescription: 'A test skill',
    iconDescription: 'test icon',
  };
}

describe('RewardSystem', () => {
  let rewardSystem: RewardSystem;

  beforeEach(() => {
    rewardSystem = new RewardSystem();
  });

  describe('grantDataPacket', () => {
    it('should successfully add a data packet to inventory', async () => {
      const packet = createTestPacket('DP_T1_01');
      const result = await rewardSystem.grantDataPacket(packet, 'boss_defeat');

      expect(result.success).toBe(true);
      expect(result.item).not.toBeNull();
      expect(result.item!.id).toBe('DP_T1_01');

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(1);
      expect(inventory.dataPackets[0].id).toBe('DP_T1_01');
    });

    it('should reject duplicate data packet (unique rule)', async () => {
      const packet = createTestPacket('DP_T1_01');
      await rewardSystem.grantDataPacket(packet, 'boss_defeat');

      const duplicate = createTestPacket('DP_T1_01');
      const result = await rewardSystem.grantDataPacket(duplicate, 'chance_event');

      expect(result.success).toBe(false);
      expect(result.item).toBeNull();

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(1);
    });

    it('should detect exclusive group conflicts', async () => {
      const packet1 = createTestPacket('DP_T1_01');
      await rewardSystem.grantDataPacket(packet1, 'boss_defeat');

      const packet2 = createTestPacket('DP_T1_02');
      const result = await rewardSystem.grantDataPacket(packet2, 'boss_defeat');

      expect(result.success).toBe(false);
      expect(result.conflictResolution).toBeDefined();
      expect(result.conflictResolution!.type).toBe('discard');
    });

    it('should allow non-conflicting packets from same tier', async () => {
      const packet1 = createTestPacket('DP_T1_03');
      const packet2 = createTestPacket('DP_T1_04');

      const result1 = await rewardSystem.grantDataPacket(packet1, 'boss_defeat');
      const result2 = await rewardSystem.grantDataPacket(packet2, 'chance_event');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(2);
    });
  });

  describe('grantSkill', () => {
    it('should directly activate when slots are available', async () => {
      const skill = createTestSkill('SK_01');
      const result = await rewardSystem.grantSkill(skill, 'skill_grant');

      expect(result.success).toBe(true);
      expect(result.item).not.toBeNull();

      const inventory = rewardSystem.getInventory();
      expect(inventory.activeSkillIds).toContain('SK_01');
      expect(inventory.ownedSkills).toHaveLength(1);
    });

    it('should provide replace option when slots are full', async () => {
      const skill1 = createTestSkill('SK_01');
      const skill2 = createTestSkill('SK_02');
      const skill3 = createTestSkill('SK_03');
      const skill4 = createTestSkill('SK_04');

      await rewardSystem.grantSkill(skill1, 'skill_grant');
      await rewardSystem.grantSkill(skill2, 'skill_grant');
      await rewardSystem.grantSkill(skill3, 'skill_grant');

      const inventoryBefore = rewardSystem.getInventory();
      expect(inventoryBefore.activeSkillIds).toHaveLength(3);

      const result = await rewardSystem.grantSkill(skill4, 'skill_grant', 0);

      expect(result.success).toBe(true);
      expect(result.conflictResolution).toBeDefined();
      expect(result.conflictResolution!.type).toBe('replace');

      const inventoryAfter = rewardSystem.getInventory();
      expect(inventoryAfter.activeSkillIds[0]).toBe('SK_04');
    });

    it('should warehouse already active skill', async () => {
      const skill = createTestSkill('SK_01');
      await rewardSystem.grantSkill(skill, 'skill_grant');

      const sameSkill = createTestSkill('SK_01');
      const result = await rewardSystem.grantSkill(sameSkill, 'skill_grant');

      expect(result.success).toBe(true);
      expect(result.conflictResolution).toBeDefined();
      expect(result.conflictResolution!.type).toBe('merge');

      const inventory = rewardSystem.getInventory();
      expect(inventory.ownedSkills).toHaveLength(2);
    });

    it('should add to warehouse when slots full without replaceSlotIndex', async () => {
      const skill1 = createTestSkill('SK_01');
      const skill2 = createTestSkill('SK_02');
      const skill3 = createTestSkill('SK_03');
      const skill4 = createTestSkill('SK_04');

      await rewardSystem.grantSkill(skill1, 'skill_grant');
      await rewardSystem.grantSkill(skill2, 'skill_grant');
      await rewardSystem.grantSkill(skill3, 'skill_grant');

      const result = await rewardSystem.grantSkill(skill4, 'skill_grant');

      expect(result.success).toBe(true);
      const inventory = rewardSystem.getInventory();
      expect(inventory.ownedSkills).toHaveLength(4);
      expect(inventory.activeSkillIds).toHaveLength(3);
    });
  });

  describe('grantBook', () => {
    it('should mark book as read on first acquisition', async () => {
      const book = createTestBook('BK_01');
      const result = await rewardSystem.grantBook(book, 'bookstore_purchase');

      expect(result.success).toBe(true);
      expect(result.item).not.toBeNull();
      expect(result.item!.isRead).toBe(true);

      const inventory = rewardSystem.getInventory();
      expect(inventory.readBooks).toHaveLength(1);
    });

    it('should skip duplicate book (already read)', async () => {
      const book = createTestBook('BK_01');
      await rewardSystem.grantBook(book, 'bookstore_purchase');

      const sameBook = createTestBook('BK_01');
      const result = await rewardSystem.grantBook(sameBook, 'zone_effect');

      expect(result.success).toBe(false);
      expect(result.item).toBeNull();

      const inventory = rewardSystem.getInventory();
      expect(inventory.readBooks).toHaveLength(1);
    });

    it('should allow different books', async () => {
      const book1 = createTestBook('BK_01');
      const book2 = createTestBook('BK_02');

      await rewardSystem.grantBook(book1, 'bookstore_purchase');
      await rewardSystem.grantBook(book2, 'zone_effect');

      const inventory = rewardSystem.getInventory();
      expect(inventory.readBooks).toHaveLength(2);
    });
  });

  describe('grantBossDataPacketSelection', () => {
    it('should grant only the selected packet from 3 options', async () => {
      const packets = [
        createTestPacket('DP_T1_03'),
        createTestPacket('DP_T1_04'),
        createTestPacket('DP_T1_05'),
      ];

      const result = await rewardSystem.grantBossDataPacketSelection(
        packets,
        'DP_T1_04'
      );

      expect(result.success).toBe(true);
      expect(result.item!.id).toBe('DP_T1_04');

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(1);
      expect(inventory.dataPackets[0].id).toBe('DP_T1_04');
    });

    it('should fail if selectedId not in options', async () => {
      const packets = [
        createTestPacket('DP_T1_03'),
        createTestPacket('DP_T1_04'),
      ];

      const result = await rewardSystem.grantBossDataPacketSelection(
        packets,
        'DP_T1_99'
      );

      expect(result.success).toBe(false);
      expect(result.item).toBeNull();
    });
  });

  describe('grantBattleReward', () => {
    it('should grant rewards on victory', async () => {
      const result = await rewardSystem.grantBattleReward('LV001', true);

      expect(result.success).toBe(true);
      expect(result.experienceGained).toBeGreaterThan(0);
      expect(result.grantedItems.length).toBeGreaterThan(0);
    });

    it('should return empty rewards on defeat', async () => {
      const result = await rewardSystem.grantBattleReward('LV001', false);

      expect(result.success).toBe(false);
      expect(result.experienceGained).toBe(0);
      expect(result.grantedItems).toHaveLength(0);
    });
  });

  describe('conflict detection', () => {
    it('canGrant should return true for non-conflicting items', () => {
      const check = rewardSystem.canGrant({ id: 'DP_T1_03', type: 'data_packet' });
      expect(check.canGrant).toBe(true);
    });

    it('canGrant should return false for duplicate items', async () => {
      const packet = createTestPacket('DP_T1_03');
      await rewardSystem.grantDataPacket(packet, 'boss_defeat');

      const check = rewardSystem.canGrant({ id: 'DP_T1_03', type: 'data_packet' });
      expect(check.canGrant).toBe(false);
      expect(check.reasons).toBeDefined();
    });

    it('checkConflicts should return empty for non-conflicting items', () => {
      const conflicts = rewardSystem.checkConflicts('DP_T1_03', 'data_packet');
      const hasConflicts = conflicts.some((c) => c.hasConflict);
      expect(hasConflicts).toBe(false);
    });
  });

  describe('inventory management', () => {
    it('getInventory should return current snapshot', () => {
      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toEqual([]);
      expect(inventory.ownedSkills).toEqual([]);
      expect(inventory.readBooks).toEqual([]);
      expect(inventory.gold).toBe(0);
      expect(inventory.hp).toBe(100);
    });

    it('removeItem should remove a data packet', async () => {
      const packet = createTestPacket('DP_T1_01');
      await rewardSystem.grantDataPacket(packet, 'boss_defeat');

      const result = rewardSystem.removeItem('DP_T1_01', 'test removal');
      expect(result.success).toBe(true);

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(0);
    });

    it('removeItem should fail for non-existent item', () => {
      const result = rewardSystem.removeItem('NON_EXISTENT', 'test');
      expect(result.success).toBe(false);
    });

    it('replaceSkillSlot should replace the specified slot', async () => {
      const skill1 = createTestSkill('SK_01');
      const skill2 = createTestSkill('SK_02');
      const skill3 = createTestSkill('SK_03');

      await rewardSystem.grantSkill(skill1, 'skill_grant');
      await rewardSystem.grantSkill(skill2, 'skill_grant');
      await rewardSystem.grantSkill(skill3, 'skill_grant');

      const result = rewardSystem.replaceSkillSlot(1, 'SK_04');
      expect(result.success).toBe(true);
      expect(result.removedSkillId).toBe('SK_02');
      expect(result.activeSkillIds[1]).toBe('SK_04');
    });

    it('resetInventory should clear all items', async () => {
      await rewardSystem.grantDataPacket(createTestPacket('DP_T1_01'), 'boss_defeat');
      await rewardSystem.grantBook(createTestBook('BK_01'), 'bookstore_purchase');

      rewardSystem.resetInventory();

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(0);
      expect(inventory.readBooks).toHaveLength(0);
    });

    it('restoreFromSnapshot should restore inventory state', async () => {
      const snapshot: InventorySnapshot = {
        dataPackets: [createTestPacket('DP_T1_99')],
        ownedSkills: [],
        activeSkillIds: [],
        readBooks: [],
        gold: 500,
        cards: [],
        hp: 80,
        maxHp: 100,
        timestamp: Date.now(),
      };

      rewardSystem.restoreFromSnapshot(snapshot);

      const inventory = rewardSystem.getInventory();
      expect(inventory.dataPackets).toHaveLength(1);
      expect(inventory.gold).toBe(500);
      expect(inventory.hp).toBe(80);
    });
  });

  describe('statistics', () => {
    it('getRewardStatistics should aggregate correctly', async () => {
      await rewardSystem.grantDataPacket(createTestPacket('DP_T1_01'), 'boss_defeat');
      await rewardSystem.grantBook(createTestBook('BK_01'), 'bookstore_purchase');
      await rewardSystem.grantSkill(createTestSkill('SK_01'), 'skill_grant');
      await rewardSystem.grantBattleReward('LV001', true);

      const stats = rewardSystem.getRewardStatistics();
      expect(stats.totalPacketsGranted).toBe(1);
      expect(stats.totalBooksRead).toBe(1);
      expect(stats.totalSkillsAcquired).toBe(1);
      expect(stats.totalBattlesWon).toBe(1);
    });
  });
});
