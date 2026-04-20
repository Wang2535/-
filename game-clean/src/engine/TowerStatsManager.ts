/**
 * 统计管理器
 * 负责记录和管理所有游戏统计数据
 */

import { TowerGameState } from '../types/towerTypes';

// 单局游戏统计
export interface RunStats {
  // 基本信息
  startTime: number;
  endTime?: number;
  duration: number; // 游戏时长（秒）
  victory: boolean;
  characterId: string;
  ascensionLevel: number;

  // 战斗统计
  totalBattles: number;
  battlesWon: number;
  battlesLost: number;
  bossesDefeated: number;
  damageDealt: number;
  damageTaken: number;
  healingReceived: number;
  maxDamageInOneTurn: number;

  // 进度统计
  highestFloor: number;
  completedActs: number[];

  // 收集统计
  cardsAcquired: string[];
  cardsRemoved: string[];
  cardsUpgraded: string[];
  relicsAcquired: string[];
  goldEarned: number;
  goldSpent: number;
  maxGold: number;

  // 探索统计
  eventsTriggered: string[];
  shopsVisited: number;
  campfiresVisited: number;
  restAtCampfire: number;
  upgradeAtCampfire: number;
  mysteriesSolved: number;
  secretRoomsFound: number;

  // 挑战统计
  challengesCompleted: string[];
  potionsUsed: number;
  maxPotionsInInventory: number;

  // 特殊记录
  flawlessActs: number[]; // 无伤完成的幕
  flawlessBosses: string[]; // 无伤击败的BOSS
}

// 总体统计数据
export interface OverallStats {
  // 游戏次数
  totalRuns: number;
  totalVictories: number;
  totalDefeats: number;

  // 胜率统计
  winRate: number;
  winRateByCharacter: Record<string, { wins: number; total: number; rate: number }>;
  winRateByAscension: Record<number, { wins: number; total: number; rate: number }>;

  // 时间统计
  totalPlayTime: number; // 总游戏时长（秒）
  averageRunDuration: number;
  fastestVictory: number | null;
  longestVictory: number | null;

  // 战斗统计
  totalBattles: number;
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalBossesDefeated: number;

  // 收集统计
  totalCardsAcquired: number;
  uniqueCardsAcquired: Set<string>;
  totalRelicsAcquired: number;
  uniqueRelicsAcquired: Set<string>;
  totalGoldEarned: number;
  totalGoldSpent: number;

  // 探索统计
  totalEventsTriggered: number;
  uniqueEventsTriggered: Set<string>;
  totalShopsVisited: number;
  totalCampfiresVisited: number;
  totalMysteriesSolved: number;
  totalSecretRoomsFound: number;

  // 挑战统计
  totalChallengesCompleted: number;
  uniqueChallengesCompleted: Set<string>;
  highestAscensionCompleted: number;

  // 最高记录
  highestFloorReached: number;
  maxDamageInOneTurn: number;
  maxGoldInOneRun: number;
  maxCardsInDeck: number;
  minCardsInVictory: number;

  // 历史记录
  runHistory: RunStats[];
  bestRuns: RunStats[]; // 最佳通关记录
}

// 统计报告
export interface StatsReport {
  summary: {
    totalRuns: number;
    victories: number;
    defeats: number;
    winRate: string;
    totalPlayTime: string;
    averageRunTime: string;
  };
  combat: {
    totalBattles: number;
    winRate: string;
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalBossesDefeated: number;
    averageDamagePerRun: number;
  };
  collection: {
    uniqueCards: number;
    uniqueRelics: number;
    totalGoldEarned: number;
    totalGoldSpent: number;
  };
  exploration: {
    uniqueEvents: number;
    totalShopsVisited: number;
    totalCampfiresVisited: number;
    totalSecretRoomsFound: number;
  };
  challenges: {
    highestAscension: number;
    totalChallengesCompleted: number;
    uniqueChallenges: number;
  };
  records: {
    fastestVictory: string;
    highestFloor: number;
    maxGoldInRun: number;
    maxDamageInTurn: number;
  };
}

// 排行榜条目
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  characterId: string;
  ascensionLevel: number;
  victory: boolean;
  duration: number;
  floorReached: number;
  score: number;
  date: number;
}

class TowerStatsManager {
  private static instance: TowerStatsManager;
  private overallStats: OverallStats;
  private currentRunStats: RunStats | null = null;
  private leaderboard: LeaderboardEntry[] = [];

  private readonly STORAGE_KEY = 'tower_stats';
  private readonly LEADERBOARD_KEY = 'tower_leaderboard';

  private constructor() {
    this.overallStats = this.initializeOverallStats();
    this.loadFromStorage();
  }

  public static getInstance(): TowerStatsManager {
    if (!TowerStatsManager.instance) {
      TowerStatsManager.instance = new TowerStatsManager();
    }
    return TowerStatsManager.instance;
  }

  // 初始化总体统计数据
  private initializeOverallStats(): OverallStats {
    return {
      totalRuns: 0,
      totalVictories: 0,
      totalDefeats: 0,
      winRate: 0,
      winRateByCharacter: {},
      winRateByAscension: {},
      totalPlayTime: 0,
      averageRunDuration: 0,
      fastestVictory: null,
      longestVictory: null,
      totalBattles: 0,
      totalBattlesWon: 0,
      totalBattlesLost: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalBossesDefeated: 0,
      totalCardsAcquired: 0,
      uniqueCardsAcquired: new Set(),
      totalRelicsAcquired: 0,
      uniqueRelicsAcquired: new Set(),
      totalGoldEarned: 0,
      totalGoldSpent: 0,
      totalEventsTriggered: 0,
      uniqueEventsTriggered: new Set(),
      totalShopsVisited: 0,
      totalCampfiresVisited: 0,
      totalMysteriesSolved: 0,
      totalSecretRoomsFound: 0,
      totalChallengesCompleted: 0,
      uniqueChallengesCompleted: new Set(),
      highestAscensionCompleted: 0,
      highestFloorReached: 0,
      maxDamageInOneTurn: 0,
      maxGoldInOneRun: 0,
      maxCardsInDeck: 0,
      minCardsInVictory: Infinity,
      runHistory: [],
      bestRuns: []
    };
  }

  // 初始化新游戏统计
  public startNewRun(characterId: string, ascensionLevel: number = 0): void {
    this.currentRunStats = {
      startTime: Date.now(),
      duration: 0,
      victory: false,
      characterId,
      ascensionLevel,
      totalBattles: 0,
      battlesWon: 0,
      battlesLost: 0,
      bossesDefeated: 0,
      damageDealt: 0,
      damageTaken: 0,
      healingReceived: 0,
      maxDamageInOneTurn: 0,
      highestFloor: 1,
      completedActs: [],
      cardsAcquired: [],
      cardsRemoved: [],
      cardsUpgraded: [],
      relicsAcquired: [],
      goldEarned: 0,
      goldSpent: 0,
      maxGold: 0,
      eventsTriggered: [],
      shopsVisited: 0,
      campfiresVisited: 0,
      restAtCampfire: 0,
      upgradeAtCampfire: 0,
      mysteriesSolved: 0,
      secretRoomsFound: 0,
      challengesCompleted: [],
      potionsUsed: 0,
      maxPotionsInInventory: 0,
      flawlessActs: [],
      flawlessBosses: []
    };
  }

  // 结束当前游戏
  public endRun(victory: boolean): void {
    if (!this.currentRunStats) return;

    this.currentRunStats.endTime = Date.now();
    this.currentRunStats.duration = Math.floor(
      (this.currentRunStats.endTime - this.currentRunStats.startTime) / 1000
    );
    this.currentRunStats.victory = victory;

    // 更新总体统计
    this.updateOverallStats(this.currentRunStats);

    // 添加到排行榜
    this.addToLeaderboard(this.currentRunStats);

    // 保存到本地存储
    this.saveToStorage();

    // 清空当前游戏统计
    this.currentRunStats = null;
  }

  // 更新总体统计
  private updateOverallStats(runStats: RunStats): void {
    const stats = this.overallStats;

    // 基本统计
    stats.totalRuns++;
    if (runStats.victory) {
      stats.totalVictories++;
    } else {
      stats.totalDefeats++;
    }
    stats.winRate = (stats.totalVictories / stats.totalRuns) * 100;

    // 角色胜率
    if (!stats.winRateByCharacter[runStats.characterId]) {
      stats.winRateByCharacter[runStats.characterId] = { wins: 0, total: 0, rate: 0 };
    }
    const charStats = stats.winRateByCharacter[runStats.characterId];
    charStats.total++;
    if (runStats.victory) charStats.wins++;
    charStats.rate = (charStats.wins / charStats.total) * 100;

    // 进阶胜率
    if (!stats.winRateByAscension[runStats.ascensionLevel]) {
      stats.winRateByAscension[runStats.ascensionLevel] = { wins: 0, total: 0, rate: 0 };
    }
    const ascStats = stats.winRateByAscension[runStats.ascensionLevel];
    ascStats.total++;
    if (runStats.victory) ascStats.wins++;
    ascStats.rate = (ascStats.wins / ascStats.total) * 100;

    // 时间统计
    stats.totalPlayTime += runStats.duration;
    stats.averageRunDuration = stats.totalPlayTime / stats.totalRuns;

    if (runStats.victory) {
      if (stats.fastestVictory === null || runStats.duration < stats.fastestVictory) {
        stats.fastestVictory = runStats.duration;
      }
      if (stats.longestVictory === null || runStats.duration > stats.longestVictory) {
        stats.longestVictory = runStats.duration;
      }
    }

    // 战斗统计
    stats.totalBattles += runStats.totalBattles;
    stats.totalBattlesWon += runStats.battlesWon;
    stats.totalBattlesLost += runStats.battlesLost;
    stats.totalDamageDealt += runStats.damageDealt;
    stats.totalDamageTaken += runStats.damageTaken;
    stats.totalBossesDefeated += runStats.bossesDefeated;

    // 收集统计
    stats.totalCardsAcquired += runStats.cardsAcquired.length;
    runStats.cardsAcquired.forEach(card => stats.uniqueCardsAcquired.add(card));
    stats.totalRelicsAcquired += runStats.relicsAcquired.length;
    runStats.relicsAcquired.forEach(relic => stats.uniqueRelicsAcquired.add(relic));
    stats.totalGoldEarned += runStats.goldEarned;
    stats.totalGoldSpent += runStats.goldSpent;

    // 探索统计
    stats.totalEventsTriggered += runStats.eventsTriggered.length;
    runStats.eventsTriggered.forEach(event => stats.uniqueEventsTriggered.add(event));
    stats.totalShopsVisited += runStats.shopsVisited;
    stats.totalCampfiresVisited += runStats.campfiresVisited;
    stats.totalMysteriesSolved += runStats.mysteriesSolved;
    stats.totalSecretRoomsFound += runStats.secretRoomsFound;

    // 挑战统计
    stats.totalChallengesCompleted += runStats.challengesCompleted.length;
    runStats.challengesCompleted.forEach(challenge =>
      stats.uniqueChallengesCompleted.add(challenge)
    );
    if (runStats.victory && runStats.ascensionLevel > stats.highestAscensionCompleted) {
      stats.highestAscensionCompleted = runStats.ascensionLevel;
    }

    // 最高记录
    if (runStats.highestFloor > stats.highestFloorReached) {
      stats.highestFloorReached = runStats.highestFloor;
    }
    if (runStats.maxDamageInOneTurn > stats.maxDamageInOneTurn) {
      stats.maxDamageInOneTurn = runStats.maxDamageInOneTurn;
    }
    if (runStats.maxGold > stats.maxGoldInOneRun) {
      stats.maxGoldInOneRun = runStats.maxGold;
    }
    const totalCards = runStats.cardsAcquired.length - runStats.cardsRemoved.length;
    if (totalCards > stats.maxCardsInDeck) {
      stats.maxCardsInDeck = totalCards;
    }
    if (runStats.victory && totalCards < stats.minCardsInVictory) {
      stats.minCardsInVictory = totalCards;
    }

    // 历史记录
    stats.runHistory.push(runStats);
    if (stats.runHistory.length > 100) {
      stats.runHistory.shift(); // 只保留最近100局
    }

    // 最佳通关记录
    if (runStats.victory) {
      stats.bestRuns.push(runStats);
      stats.bestRuns.sort((a, b) => a.duration - b.duration); // 按通关时间排序
      if (stats.bestRuns.length > 10) {
        stats.bestRuns.pop(); // 只保留前10
      }
    }
  }

  // 添加到排行榜
  private addToLeaderboard(runStats: RunStats): void {
    const score = this.calculateRunScore(runStats);
    const entry: LeaderboardEntry = {
      rank: 0,
      playerName: 'Player', // 可以扩展为支持玩家自定义名称
      characterId: runStats.characterId,
      ascensionLevel: runStats.ascensionLevel,
      victory: runStats.victory,
      duration: runStats.duration,
      floorReached: runStats.highestFloor,
      score,
      date: Date.now()
    };

    this.leaderboard.push(entry);
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 100); // 只保留前100名

    // 更新排名
    this.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  // 计算游戏得分
  private calculateRunScore(runStats: RunStats): number {
    let score = 0;

    // 胜利基础分
    if (runStats.victory) {
      score += 1000;
      // 进阶加成
      score += runStats.ascensionLevel * 100;
      // 时间奖励（越快分越高）
      score += Math.max(0, 500 - runStats.duration / 10);
    } else {
      // 失败按层数给分
      score += runStats.highestFloor * 10;
    }

    // 战斗表现
    score += runStats.bossesDefeated * 50;
    score += runStats.damageDealt / 100;

    // 收集奖励
    score += runStats.cardsAcquired.length * 5;
    score += runStats.relicsAcquired.length * 10;

    // 探索奖励
    score += runStats.eventsTriggered.length * 5;
    score += runStats.secretRoomsFound * 25;

    return Math.floor(score);
  }

  // 记录战斗数据
  public recordBattle(
    won: boolean,
    damageDealt: number,
    damageTaken: number,
    isBoss: boolean = false
  ): void {
    if (!this.currentRunStats) return;

    this.currentRunStats.totalBattles++;
    if (won) {
      this.currentRunStats.battlesWon++;
      if (isBoss) {
        this.currentRunStats.bossesDefeated++;
      }
    } else {
      this.currentRunStats.battlesLost++;
    }

    this.currentRunStats.damageDealt += damageDealt;
    this.currentRunStats.damageTaken += damageTaken;

    if (damageDealt > this.currentRunStats.maxDamageInOneTurn) {
      this.currentRunStats.maxDamageInOneTurn = damageDealt;
    }
  }

  // 记录获得卡牌
  public recordCardAcquired(cardId: string): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.cardsAcquired.push(cardId);
  }

  // 记录移除卡牌
  public recordCardRemoved(cardId: string): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.cardsRemoved.push(cardId);
  }

  // 记录升级卡牌
  public recordCardUpgraded(cardId: string): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.cardsUpgraded.push(cardId);
  }

  // 记录获得遗物
  public recordRelicAcquired(relicId: string): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.relicsAcquired.push(relicId);
  }

  // 记录金币变化
  public recordGoldChange(amount: number, isEarned: boolean): void {
    if (!this.currentRunStats) return;

    if (isEarned) {
      this.currentRunStats.goldEarned += amount;
    } else {
      this.currentRunStats.goldSpent += amount;
    }

    const currentGold = this.currentRunStats.goldEarned - this.currentRunStats.goldSpent;
    if (currentGold > this.currentRunStats.maxGold) {
      this.currentRunStats.maxGold = currentGold;
    }
  }

  // 记录触发事件
  public recordEventTriggered(eventId: string): void {
    if (!this.currentRunStats) return;
    if (!this.currentRunStats.eventsTriggered.includes(eventId)) {
      this.currentRunStats.eventsTriggered.push(eventId);
    }
  }

  // 记录访问商店
  public recordShopVisit(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.shopsVisited++;
  }

  // 记录访问营地
  public recordCampfireVisit(action: 'rest' | 'upgrade'): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.campfiresVisited++;
    if (action === 'rest') {
      this.currentRunStats.restAtCampfire++;
    } else {
      this.currentRunStats.upgradeAtCampfire++;
    }
  }

  // 记录解开谜题
  public recordMysterySolved(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.mysteriesSolved++;
  }

  // 记录发现秘密房间
  public recordSecretRoomFound(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.secretRoomsFound++;
  }

  // 记录完成挑战
  public recordChallengeCompleted(challengeId: string): void {
    if (!this.currentRunStats) return;
    if (!this.currentRunStats.challengesCompleted.includes(challengeId)) {
      this.currentRunStats.challengesCompleted.push(challengeId);
    }
  }

  // 记录使用药水
  public recordPotionUsed(): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.potionsUsed++;
  }

  // 记录完成一幕
  public recordActCompleted(actNumber: number, flawless: boolean): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.completedActs.push(actNumber);
    if (flawless) {
      this.currentRunStats.flawlessActs.push(actNumber);
    }
  }

  // 记录无伤击败BOSS
  public recordFlawlessBoss(bossId: string): void {
    if (!this.currentRunStats) return;
    this.currentRunStats.flawlessBosses.push(bossId);
  }

  // 记录到达楼层
  public recordFloorReached(floor: number): void {
    if (!this.currentRunStats) return;
    if (floor > this.currentRunStats.highestFloor) {
      this.currentRunStats.highestFloor = floor;
    }
  }

  // 生成统计报告
  public generateReport(): StatsReport {
    const stats = this.overallStats;

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}小时${minutes}分钟${secs}秒`;
    };

    return {
      summary: {
        totalRuns: stats.totalRuns,
        victories: stats.totalVictories,
        defeats: stats.totalDefeats,
        winRate: `${stats.winRate.toFixed(1)}%`,
        totalPlayTime: formatTime(stats.totalPlayTime),
        averageRunTime: formatTime(stats.averageRunDuration)
      },
      combat: {
        totalBattles: stats.totalBattles,
        winRate: `${((stats.totalBattlesWon / stats.totalBattles) * 100).toFixed(1)}%`,
        totalDamageDealt: stats.totalDamageDealt,
        totalDamageTaken: stats.totalDamageTaken,
        totalBossesDefeated: stats.totalBossesDefeated,
        averageDamagePerRun: stats.totalRuns > 0 ? stats.totalDamageDealt / stats.totalRuns : 0
      },
      collection: {
        uniqueCards: stats.uniqueCardsAcquired.size,
        uniqueRelics: stats.uniqueRelicsAcquired.size,
        totalGoldEarned: stats.totalGoldEarned,
        totalGoldSpent: stats.totalGoldSpent
      },
      exploration: {
        uniqueEvents: stats.uniqueEventsTriggered.size,
        totalShopsVisited: stats.totalShopsVisited,
        totalCampfiresVisited: stats.totalCampfiresVisited,
        totalSecretRoomsFound: stats.totalSecretRoomsFound
      },
      challenges: {
        highestAscension: stats.highestAscensionCompleted,
        totalChallengesCompleted: stats.totalChallengesCompleted,
        uniqueChallenges: stats.uniqueChallengesCompleted.size
      },
      records: {
        fastestVictory: stats.fastestVictory ? formatTime(stats.fastestVictory) : 'N/A',
        highestFloor: stats.highestFloorReached,
        maxGoldInRun: stats.maxGoldInOneRun,
        maxDamageInTurn: stats.maxDamageInOneTurn
      }
    };
  }

  // 获取总体统计
  public getOverallStats(): OverallStats {
    return this.overallStats;
  }

  // 获取当前游戏统计
  public getCurrentRunStats(): RunStats | null {
    return this.currentRunStats;
  }

  // 获取排行榜
  public getLeaderboard(): LeaderboardEntry[] {
    return this.leaderboard;
  }

  // 获取角色统计
  public getCharacterStats(characterId: string): { wins: number; total: number; rate: number } | null {
    return this.overallStats.winRateByCharacter[characterId] || null;
  }

  // 获取进阶统计
  public getAscensionStats(ascensionLevel: number): { wins: number; total: number; rate: number } | null {
    return this.overallStats.winRateByAscension[ascensionLevel] || null;
  }

  // 导出数据
  public exportData(): string {
    const data = {
      overallStats: {
        ...this.overallStats,
        uniqueCardsAcquired: Array.from(this.overallStats.uniqueCardsAcquired),
        uniqueRelicsAcquired: Array.from(this.overallStats.uniqueRelicsAcquired),
        uniqueEventsTriggered: Array.from(this.overallStats.uniqueEventsTriggered),
        uniqueChallengesCompleted: Array.from(this.overallStats.uniqueChallengesCompleted)
      },
      leaderboard: this.leaderboard
    };
    return JSON.stringify(data, null, 2);
  }

  // 导入数据
  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.overallStats) {
        this.overallStats = {
          ...data.overallStats,
          uniqueCardsAcquired: new Set(data.overallStats.uniqueCardsAcquired || []),
          uniqueRelicsAcquired: new Set(data.overallStats.uniqueRelicsAcquired || []),
          uniqueEventsTriggered: new Set(data.overallStats.uniqueEventsTriggered || []),
          uniqueChallengesCompleted: new Set(data.overallStats.uniqueChallengesCompleted || [])
        };
      }

      if (data.leaderboard) {
        this.leaderboard = data.leaderboard;
      }

      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import stats data:', error);
      return false;
    }
  }

  // 重置所有数据
  public resetAllData(): void {
    this.overallStats = this.initializeOverallStats();
    this.leaderboard = [];
    this.currentRunStats = null;
    this.saveToStorage();
  }

  // 保存到本地存储
  private saveToStorage(): void {
    try {
      const data = this.exportData();
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch (error) {
      console.error('Failed to save stats to storage:', error);
    }
  }

  // 从本地存储加载
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.importData(data);
      }
    } catch (error) {
      console.error('Failed to load stats from storage:', error);
    }
  }
}

export default TowerStatsManager;
