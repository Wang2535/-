import type {
  DataPacket,
  Book,
  Skill,
  RarityLevel,
  RewardSource,
  GrantedItem as CellGrantedItem,
  RewardType,
  RewardItem,
  RewardContext,
  RewardRequest,
  RewardResult,
  GrantedItem,
  RejectedItem,
  ConflictResolution,
  ConflictRule,
  ConflictInfo,
  ConflictResolutionOption,
  InventorySnapshot,
  GrantResult,
  BattleRewardResult,
  CanGrantCheck,
  RemoveResult,
  ReplaceResult,
  RewardStatistics,
  RejectReason,
} from '../types';

const REWARD_CONFIG = {
  DATA_PACKET_SELECT_COUNT: 3,
  DATA_PACKET_PER_LAYER: 9,
  BOOKSTORE_OFFER_COUNT: 3,
  SKILL_MAX_ACTIVE_SLOTS: 3,
  SKILL_INVENTORY_UNLIMITED: true,
  DATA_PACKET_MAX_OWNED: 999,
};

const DATA_PACKET_CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'exclusive_group',
    groups: [
      ['DP_T1_01', 'DP_T1_02'],
    ],
    resolution: 'player_choice',
  },
  {
    type: 'unique',
    check: (itemId: string, inventory: InventorySnapshot) =>
      inventory.dataPackets.some((p) => p.id === itemId),
    resolution: 'reject',
  },
  {
    type: 'max_count',
    maxCount: REWARD_CONFIG.DATA_PACKET_MAX_OWNED,
    resolution: 'player_choice',
  },
];

const SKILL_CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'slot_limit',
    maxSlots: REWARD_CONFIG.SKILL_MAX_ACTIVE_SLOTS,
    resolution: 'replace_or_warehouse',
  },
  {
    type: 'unique_active',
    check: (skillId: string, inventory: InventorySnapshot) =>
      inventory.activeSkillIds.includes(skillId),
    resolution: 'warehouse',
  },
];

const BOOK_CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'unique_read',
    check: (bookId: string, inventory: InventorySnapshot) =>
      inventory.readBooks.some((b) => b.id === bookId),
    resolution: 'skip',
  },
];

function createEmptyInventory(): InventorySnapshot {
  return {
    dataPackets: [],
    ownedSkills: [],
    activeSkillIds: [],
    readBooks: [],
    gold: 0,
    cards: [],
    hp: 100,
    maxHp: 100,
    timestamp: Date.now(),
  };
}

export class RewardSystem {
  private inventory: InventorySnapshot;
  private conflictRules: Record<RewardType, ConflictRule[]>;
  private stats: {
    totalPacketsGranted: number;
    totalBooksRead: number;
    totalSkillsAcquired: number;
    totalGoldEarned: number;
    totalBattlesWon: number;
    rarityCount: Record<string, number>;
  };

  constructor(initialInventory?: InventorySnapshot) {
    this.inventory = initialInventory ?? createEmptyInventory();
    this.conflictRules = {
      data_packet: DATA_PACKET_CONFLICT_RULES,
      book: BOOK_CONFLICT_RULES,
      skill: SKILL_CONFLICT_RULES,
      card: [],
      gold: [],
      heal: [],
    };
    this.stats = {
      totalPacketsGranted: 0,
      totalBooksRead: 0,
      totalSkillsAcquired: 0,
      totalGoldEarned: 0,
      totalBattlesWon: 0,
      rarityCount: {},
    };
  }

  async processReward(request: RewardRequest): Promise<RewardResult> {
    const grantedItems: GrantedItem[] = [];
    const rejectedItems: RejectedItem[] = [];
    const conflictsResolved: ConflictResolution[] = [];

    for (const item of request.items) {
      const conflicts = this.checkConflicts(item.id, request.rewardType);

      if (conflicts.some((c) => c.hasConflict)) {
        const resolution = this.resolveConflicts(
          item,
          conflicts,
          request.rewardType,
          request.source
        );
        if (!resolution.success) {
          rejectedItems.push({
            id: item.id,
            reason: (resolution.reason ?? 'conflict_exclusive') as RejectReason,
            suggestion: resolution.suggestion,
          });
          continue;
        }
        if (resolution.conflictResolution) {
          conflictsResolved.push(resolution.conflictResolution);
        }
      }

      const granted = this.grantItem(item, request.source, request.rewardType);
      if (granted) {
        grantedItems.push(granted);
      } else {
        rejectedItems.push({ id: item.id, reason: 'condition_unmet' });
      }
    }

    this.updateInventorySnapshot();

    return {
      success: grantedItems.length > 0,
      grantedItems,
      rejectedItems,
      conflictsResolved,
      inventorySnapshot: this.getInventory(),
    };
  }

  async grantDataPacket(
    packet: DataPacket,
    source: RewardSource
  ): Promise<GrantResult<DataPacket>> {
    const conflicts = this.checkConflicts(packet.id, 'data_packet');

    for (const conflict of conflicts) {
      if (!conflict.hasConflict) continue;

      if (conflict.conflictType === 'exclusive') {
        return {
          success: false,
          item: null,
          conflictResolution: {
            type: 'discard',
            itemId: packet.id,
            conflictingWith: conflict.conflictingItems[0] ?? '',
            resolvedBy: 'player_choice',
          },
          inventorySnapshot: this.getInventory(),
        };
      }

      if (conflict.conflictType === 'stack_limit') {
        const exclusiveConflict = conflict.resolutionOptions.find(
          (o) => o.action === 'reject_new'
        );
        if (exclusiveConflict) {
          return {
            success: false,
            item: null,
            conflictResolution: {
              type: 'discard',
              itemId: packet.id,
              conflictingWith: '',
              resolvedBy: 'auto',
            },
            inventorySnapshot: this.getInventory(),
          };
        }
      }
    }

    this.inventory.dataPackets.push(packet);
    this.stats.totalPacketsGranted++;
    this.trackRarity(packet.rarity);
    this.updateInventorySnapshot();

    return {
      success: true,
      item: packet,
      inventorySnapshot: this.getInventory(),
    };
  }

  async grantBook(
    book: Book,
    source: RewardSource
  ): Promise<GrantResult<Book>> {
    const alreadyRead = this.inventory.readBooks.some((b) => b.id === book.id);
    if (alreadyRead) {
      return {
        success: false,
        item: null,
        conflictResolution: {
          type: 'discard',
          itemId: book.id,
          conflictingWith: book.id,
          resolvedBy: 'auto',
        },
        inventorySnapshot: this.getInventory(),
      };
    }

    const bookCopy = { ...book, isRead: true };
    this.inventory.readBooks.push(bookCopy);
    this.stats.totalBooksRead++;
    this.updateInventorySnapshot();

    return {
      success: true,
      item: bookCopy,
      inventorySnapshot: this.getInventory(),
    };
  }

  async grantSkill(
    skill: Skill,
    source: RewardSource,
    replaceSlotIndex?: number
  ): Promise<GrantResult<Skill>> {
    const isAlreadyActive = this.inventory.activeSkillIds.includes(skill.id);
    if (isAlreadyActive) {
      this.inventory.ownedSkills.push(skill);
      this.stats.totalSkillsAcquired++;
      this.updateInventorySnapshot();
      return {
        success: true,
        item: skill,
        conflictResolution: {
          type: 'merge',
          itemId: skill.id,
          conflictingWith: skill.id,
          resolvedBy: 'auto',
        },
        inventorySnapshot: this.getInventory(),
      };
    }

    const slotsAvailable =
      this.inventory.activeSkillIds.length < REWARD_CONFIG.SKILL_MAX_ACTIVE_SLOTS;

    if (slotsAvailable) {
      this.inventory.activeSkillIds.push(skill.id);
      this.inventory.ownedSkills.push(skill);
      this.stats.totalSkillsAcquired++;
      this.updateInventorySnapshot();
      return {
        success: true,
        item: skill,
        inventorySnapshot: this.getInventory(),
      };
    }

    if (replaceSlotIndex !== undefined && replaceSlotIndex < this.inventory.activeSkillIds.length) {
      const replacedId = this.inventory.activeSkillIds[replaceSlotIndex];
      this.inventory.activeSkillIds[replaceSlotIndex] = skill.id;
      this.inventory.ownedSkills.push(skill);
      this.stats.totalSkillsAcquired++;
      this.updateInventorySnapshot();

      return {
        success: true,
        item: skill,
        conflictResolution: {
          type: 'replace',
          itemId: skill.id,
          conflictingWith: replacedId,
          resolvedBy: 'player_choice',
        },
        inventorySnapshot: this.getInventory(),
      };
    }

    this.inventory.ownedSkills.push(skill);
    this.stats.totalSkillsAcquired++;
    this.updateInventorySnapshot();
    return {
      success: true,
      item: skill,
      conflictResolution: {
        type: 'merge',
        itemId: skill.id,
        conflictingWith: '',
        resolvedBy: 'auto',
      },
      inventorySnapshot: this.getInventory(),
    };
  }

  async grantBattleReward(
    levelId: string,
    victory: boolean
  ): Promise<BattleRewardResult> {
    const grantedItems: GrantedItem[] = [];
    let experienceGained = 0;

    if (victory) {
      this.stats.totalBattlesWon++;
      experienceGained = 10;
      grantedItems.push({
        id: `battle_reward_${levelId}`,
        type: 'experience',
        name: `Battle Reward: ${levelId}`,
        grantedAt: Date.now(),
        source: 'battle_victory',
      });
    }

    this.updateInventorySnapshot();

    return {
      success: victory,
      grantedItems,
      experienceGained,
      inventorySnapshot: this.getInventory(),
    };
  }

  async grantBossDataPacketSelection(
    options: DataPacket[],
    selectedId: string
  ): Promise<GrantResult<DataPacket>> {
    const selected = options.find((p) => p.id === selectedId);
    if (!selected) {
      return {
        success: false,
        item: null,
        inventorySnapshot: this.getInventory(),
      };
    }

    return this.grantDataPacket(selected, 'boss_defeat');
  }

  getInventory(): InventorySnapshot {
    return { ...this.inventory, timestamp: Date.now() };
  }

  canGrant(item: { id: string; type: string }): CanGrantCheck {
    const rewardType = item.type as RewardType;
    const conflicts = this.checkConflicts(item.id, rewardType);
    const blockingConflicts = conflicts.filter((c) => c.hasConflict);

    if (blockingConflicts.length === 0) {
      return { canGrant: true };
    }

    const reasons = blockingConflicts.map((c) =>
      c.conflictType === 'exclusive'
        ? 'conflict_exclusive' as const
        : 'max_limit_reached' as const
    );

    return {
      canGrant: false,
      reasons,
      suggestion: 'Resolve conflicts before granting',
    };
  }

  checkConflicts(itemId: string, rewardType?: RewardType): ConflictInfo[] {
    const rules = rewardType
      ? this.conflictRules[rewardType] ?? []
      : [
          ...this.conflictRules.data_packet,
          ...this.conflictRules.book,
          ...this.conflictRules.skill,
        ];

    const results: ConflictInfo[] = [];

    for (const rule of rules) {
      if (rule.type === 'exclusive_group' && rule.groups) {
        for (const group of rule.groups) {
          if (group.includes(itemId)) {
            const conflicting = this.inventory.dataPackets
              .filter((p) => group.includes(p.id) && p.id !== itemId)
              .map((p) => p.id);
            if (conflicting.length > 0) {
              results.push({
                hasConflict: true,
                conflictingItems: conflicting,
                conflictType: 'exclusive',
                resolutionOptions: [
                  {
                    action: 'replace_current',
                    description: `Replace ${conflicting[0]} with ${itemId}`,
                  },
                  { action: 'reject_new', description: `Keep ${conflicting[0]}, reject ${itemId}` },
                ],
              });
            }
          }
        }
      }

      if (rule.type === 'unique' && rule.check) {
        if (rule.check(itemId, this.inventory)) {
          results.push({
            hasConflict: true,
            conflictingItems: [itemId],
            conflictType: 'stack_limit',
            resolutionOptions: [
              { action: 'reject_new', description: `Already owned: ${itemId}` },
            ],
          });
        }
      }

      if (rule.type === 'max_count' && rule.maxCount !== undefined) {
        const currentCount = this.inventory.dataPackets.length;
        if (currentCount >= rule.maxCount) {
          results.push({
            hasConflict: true,
            conflictingItems: [],
            conflictType: 'stack_limit',
            resolutionOptions: [
              {
                action: 'discard_old',
                description: `Max count (${rule.maxCount}) reached, discard one`,
              },
              { action: 'reject_new', description: `Cannot add more items` },
            ],
          });
        }
      }

      if (rule.type === 'slot_limit' && rule.maxSlots !== undefined) {
        if (this.inventory.activeSkillIds.length >= rule.maxSlots) {
          results.push({
            hasConflict: true,
            conflictingItems: this.inventory.activeSkillIds,
            conflictType: 'stack_limit',
            resolutionOptions: [
              {
                action: 'replace_current',
                description: `Replace one of: ${this.inventory.activeSkillIds.join(', ')}`,
              },
              { action: 'reject_new', description: 'No empty skill slots' },
            ],
          });
        }
      }

      if (rule.type === 'unique_active' && rule.check) {
        if (rule.check(itemId, this.inventory)) {
          results.push({
            hasConflict: true,
            conflictingItems: [itemId],
            conflictType: 'stack_limit',
            resolutionOptions: [
              {
                action: 'discard_old',
                description: `Skill ${itemId} is already active, will warehouse`,
              },
            ],
          });
        }
      }

      if (rule.type === 'unique_read' && rule.check) {
        if (rule.check(itemId, this.inventory)) {
          results.push({
            hasConflict: true,
            conflictingItems: [itemId],
            conflictType: 'stack_limit',
            resolutionOptions: [
              { action: 'reject_new', description: `Book ${itemId} already read` },
            ],
          });
        }
      }
    }

    return results;
  }

  getRewardStatistics(): RewardStatistics {
    let mostCommonRarity: RarityLevel | null = null;
    const entries = Object.entries(this.stats.rarityCount);
    if (entries.length > 0) {
      entries.sort((a, b) => b[1] - a[1]);
      mostCommonRarity = entries[0][0] as RarityLevel;
    }

    return {
      totalPacketsGranted: this.stats.totalPacketsGranted,
      totalBooksRead: this.stats.totalBooksRead,
      totalSkillsAcquired: this.stats.totalSkillsAcquired,
      totalGoldEarned: this.stats.totalGoldEarned,
      totalBattlesWon: this.stats.totalBattlesWon,
      mostCommonRarity,
    };
  }

  removeItem(itemId: string, reason: string): RemoveResult {
    const packetIdx = this.inventory.dataPackets.findIndex((p) => p.id === itemId);
    if (packetIdx >= 0) {
      const removed = this.inventory.dataPackets.splice(packetIdx, 1)[0];
      this.updateInventorySnapshot();
      return {
        success: true,
        removedItem: {
          id: removed.id,
          type: 'data_packet',
          name: removed.name,
          grantedAt: 0,
          source: 'special',
        },
        reason,
      };
    }

    const skillIdx = this.inventory.ownedSkills.findIndex((s) => s.id === itemId);
    if (skillIdx >= 0) {
      const removed = this.inventory.ownedSkills.splice(skillIdx, 1)[0];
      const activeIdx = this.inventory.activeSkillIds.indexOf(itemId);
      if (activeIdx >= 0) {
        this.inventory.activeSkillIds.splice(activeIdx, 1);
      }
      this.updateInventorySnapshot();
      return {
        success: true,
        removedItem: {
          id: removed.id,
          type: 'skill',
          name: removed.name,
          grantedAt: 0,
          source: 'special',
        },
        reason,
      };
    }

    const bookIdx = this.inventory.readBooks.findIndex((b) => b.id === itemId);
    if (bookIdx >= 0) {
      const removed = this.inventory.readBooks.splice(bookIdx, 1)[0];
      this.updateInventorySnapshot();
      return {
        success: true,
        removedItem: {
          id: removed.id,
          type: 'book',
          name: removed.name,
          grantedAt: 0,
          source: 'special',
        },
        reason,
      };
    }

    return { success: false, removedItem: null, reason };
  }

  replaceSkillSlot(slotIndex: number, newSkillId: string): ReplaceResult {
    if (slotIndex < 0 || slotIndex >= this.inventory.activeSkillIds.length) {
      return {
        success: false,
        removedSkillId: null,
        newSkillId,
        activeSkillIds: [...this.inventory.activeSkillIds],
      };
    }

    const removedSkillId = this.inventory.activeSkillIds[slotIndex];
    this.inventory.activeSkillIds[slotIndex] = newSkillId;
    this.updateInventorySnapshot();

    return {
      success: true,
      removedSkillId,
      newSkillId,
      activeSkillIds: [...this.inventory.activeSkillIds],
    };
  }

  resetInventory(): void {
    this.inventory = createEmptyInventory();
    this.stats = {
      totalPacketsGranted: 0,
      totalBooksRead: 0,
      totalSkillsAcquired: 0,
      totalGoldEarned: 0,
      totalBattlesWon: 0,
      rarityCount: {},
    };
  }

  restoreFromSnapshot(snapshot: InventorySnapshot): void {
    this.inventory = { ...snapshot };
  }

  private grantItem(
    item: RewardItem,
    source: RewardSource,
    rewardType: RewardType
  ): GrantedItem | null {
    const now = Date.now();

    switch (rewardType) {
      case 'gold':
        this.inventory.gold += item.quantity;
        this.stats.totalGoldEarned += item.quantity;
        break;
      case 'heal': {
        const healAmount = item.quantity;
        this.inventory.hp = Math.min(
          this.inventory.maxHp,
          this.inventory.hp + healAmount
        );
        break;
      }
      case 'card':
        for (let i = 0; i < item.quantity; i++) {
          this.inventory.cards.push(item.id);
        }
        break;
      default:
        return null;
    }

    return {
      id: item.id,
      type: rewardType,
      name: item.id,
      grantedAt: now,
      source,
    };
  }

  private resolveConflicts(
    item: RewardItem,
    conflicts: ConflictInfo[],
    rewardType: RewardType,
    source: RewardSource
  ): {
    success: boolean;
    reason?: string;
    suggestion?: string;
    conflictResolution?: ConflictResolution;
  } {
    for (const conflict of conflicts) {
      if (!conflict.hasConflict) continue;

      if (conflict.conflictType === 'exclusive') {
        const autoResolve = conflict.resolutionOptions.find(
          (o) => o.action === 'reject_new'
        );
        if (autoResolve) {
          return {
            success: false,
            reason: 'conflict_exclusive',
            suggestion: autoResolve.description,
            conflictResolution: {
              type: 'discard',
              itemId: item.id,
              conflictingWith: conflict.conflictingItems[0] ?? '',
              resolvedBy: 'auto',
            },
          };
        }
      }

      if (conflict.conflictType === 'stack_limit') {
        const autoResolve = conflict.resolutionOptions.find(
          (o) => o.action === 'reject_new'
        );
        if (autoResolve) {
          return {
            success: false,
            reason: 'max_limit_reached',
            suggestion: autoResolve.description,
            conflictResolution: {
              type: 'discard',
              itemId: item.id,
              conflictingWith: '',
              resolvedBy: 'auto',
            },
          };
        }
      }
    }

    return { success: true };
  }

  private updateInventorySnapshot(): void {
    this.inventory.timestamp = Date.now();
  }

  private trackRarity(rarity: RarityLevel): void {
    this.stats.rarityCount[rarity] = (this.stats.rarityCount[rarity] ?? 0) + 1;
  }
}
