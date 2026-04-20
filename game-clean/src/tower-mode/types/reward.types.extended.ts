import type {
  DataPacket,
  Book,
  Skill,
  RarityLevel,
  RewardSource,
} from './cell.types';

export type { RewardSource };

export type RewardType = 'data_packet' | 'book' | 'skill' | 'card' | 'gold' | 'heal';

export interface RewardItem {
  id: string;
  quantity: number;
  metadata?: Record<string, unknown>;
}

export interface RewardContext {
  playerId: string;
  layerNumber: number;
  turnNumber: number;
  triggerCellId?: string;
}

export interface RewardRequest {
  source: RewardSource;
  rewardType: RewardType;
  items: RewardItem[];
  context: RewardContext;
}

export type RejectReason =
  | 'inventory_full'
  | 'conflict_exclusive'
  | 'already_owned'
  | 'max_limit_reached'
  | 'layer_restriction'
  | 'condition_unmet';

export interface GrantedItem {
  id: string;
  type: string;
  name: string;
  grantedAt: number;
  source: RewardSource;
}

export interface RejectedItem {
  id: string;
  reason: RejectReason;
  suggestion?: string;
}

export interface ConflictResolution {
  type: 'replace' | 'discard' | 'merge';
  itemId: string;
  conflictingWith: string;
  resolvedBy: 'auto' | 'player_choice';
}

export interface InventorySnapshot {
  dataPackets: DataPacket[];
  ownedSkills: Skill[];
  activeSkillIds: string[];
  readBooks: Book[];
  gold: number;
  cards: string[];
  hp: number;
  maxHp: number;
  timestamp: number;
}

export interface RewardResult {
  success: boolean;
  grantedItems: GrantedItem[];
  rejectedItems: RejectedItem[];
  conflictsResolved: ConflictResolution[];
  inventorySnapshot: InventorySnapshot;
}

export interface GrantResult<T> {
  success: boolean;
  item: T | null;
  conflictResolution?: ConflictResolution;
  inventorySnapshot: InventorySnapshot;
}

export interface BattleRewardResult {
  success: boolean;
  grantedItems: GrantedItem[];
  experienceGained: number;
  inventorySnapshot: InventorySnapshot;
}

export interface CanGrantCheck {
  canGrant: boolean;
  reasons?: RejectReason[];
  suggestion?: string;
}

export interface ConflictResolutionOption {
  action: 'replace_current' | 'reject_new' | 'discard_old';
  description: string;
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingItems: string[];
  conflictType: 'exclusive' | 'stack_limit';
  resolutionOptions: ConflictResolutionOption[];
}

export interface ConflictRule {
  type: 'exclusive_group' | 'unique' | 'max_count' | 'slot_limit' | 'unique_active' | 'unique_read';
  groups?: string[][];
  maxCount?: number;
  maxSlots?: number;
  check?: (itemId: string, inventory: InventorySnapshot) => boolean;
  resolution: 'player_choice' | 'reject' | 'replace_or_warehouse' | 'warehouse' | 'skip';
}

export interface RemoveResult {
  success: boolean;
  removedItem: GrantedItem | null;
  reason: string;
}

export interface ReplaceResult {
  success: boolean;
  removedSkillId: string | null;
  newSkillId: string;
  activeSkillIds: string[];
}

export interface RewardStatistics {
  totalPacketsGranted: number;
  totalBooksRead: number;
  totalSkillsAcquired: number;
  totalGoldEarned: number;
  totalBattlesWon: number;
  mostCommonRarity: RarityLevel | null;
}
