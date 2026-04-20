/**
 * 统计面板组件
 * 显示个人统计数据、成就列表、排行榜和数据导入/导出功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TowerStatsManager, {
  StatsReport,
  LeaderboardEntry,
  OverallStats
} from '../../engine/TowerStatsManager';
import TowerAchievementManager, {
  AchievementStatus,
  AchievementFilterOptions
} from '../../engine/TowerAchievementManager';
import {
  AchievementType,
  ACHIEVEMENT_CATEGORIES,
  TOWER_ACHIEVEMENTS
} from '../../data/towerAchievements';

// 标签页类型
type TabType = 'stats' | 'achievements' | 'leaderboard';

// 组件属性
interface TowerStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}小时${minutes}分`;
  }
  return `${minutes}分${secs}秒`;
};

// 格式化日期
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const TowerStatsPanel: React.FC<TowerStatsPanelProps> = ({
  isOpen,
  onClose,
  initialTab = 'stats'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [statsReport, setStatsReport] = useState<StatsReport | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievementStatus, setAchievementStatus] = useState<AchievementStatus[]>([]);
  const [achievementFilter, setAchievementFilter] = useState<AchievementFilterOptions>(({
    type: 'all',
    status: 'all'
  }));
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementStatus | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const statsManager = useMemo(() => TowerStatsManager.getInstance(), []);
  const achievementManager = useMemo(() => TowerAchievementManager.getInstance(), []);

  // 加载数据
  const loadData = useCallback(() => {
    setStatsReport(statsManager.generateReport());
    setOverallStats(statsManager.getOverallStats());
    setLeaderboard(statsManager.getLeaderboard());
    setAchievementStatus(achievementManager.getAllAchievementStatus());
  }, [statsManager, achievementManager]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // 筛选成就
  const filteredAchievements = useMemo(() => {
    return achievementManager.filterAchievements(achievementFilter);
  }, [achievementStatus, achievementFilter, achievementManager]);

  // 成就统计
  const achievementStats = useMemo(() => {
    const total = achievementManager.getTotalCount();
    const unlocked = achievementManager.getUnlockedCount();
    const totalPoints = achievementManager.getTotalPoints();
    const unlockedPoints = achievementManager.getUnlockedPoints();

    const byType = Object.keys(ACHIEVEMENT_CATEGORIES).reduce((acc, type) => {
      const typeAchievements = achievementStatus.filter(
        a => a.achievement.type === type
      );
      acc[type as AchievementType] = {
        total: typeAchievements.length,
        unlocked: typeAchievements.filter(a => a.unlocked).length
      };
      return acc;
    }, {} as Record<AchievementType, { total: number; unlocked: number }>);

    return {
      total,
      unlocked,
      progress: total > 0 ? (unlocked / total) * 100 : 0,
      totalPoints,
      unlockedPoints,
      byType
    };
  }, [achievementStatus, achievementManager]);

  // 导出数据
  const handleExport = () => {
    const statsData = statsManager.exportData();
    const achievementData = achievementManager.exportData();
    const fullData = {
      version: '1.0',
      exportDate: Date.now(),
      stats: JSON.parse(statsData),
      achievements: JSON.parse(achievementData)
    };

    const blob = new Blob([JSON.stringify(fullData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tower-stats-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  // 导入数据
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);

      if (data.stats) {
        const statsSuccess = statsManager.importData(JSON.stringify(data.stats));
        if (!statsSuccess) {
          setImportError('统计数据导入失败');
          return;
        }
      }

      if (data.achievements) {
        const achievementSuccess = achievementManager.importData(
          JSON.stringify(data.achievements)
        );
        if (!achievementSuccess) {
          setImportError('成就数据导入失败');
          return;
        }
      }

      loadData();
      setShowImportModal(false);
      setImportData('');
      setImportError('');
    } catch (error) {
      setImportError('无效的JSON数据');
    }
  };

  // 重置所有数据
  const handleReset = () => {
    statsManager.resetAllData();
    achievementManager.resetAllAchievements();
    loadData();
    setShowResetConfirm(false);
  };

  // 渲染统计标签页
  const renderStatsTab = () => {
    if (!statsReport || !overallStats) {
      return <div className="stats-empty">暂无数据</div>;
    }

    return (
      <div className="stats-content">
        {/* 概览卡片 */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-info">
              <div className="stat-value">{statsReport.summary.totalRuns}</div>
              <div className="stat-label">总游戏次数</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{statsReport.summary.victories}</div>
              <div className="stat-label">胜利次数</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{statsReport.summary.winRate}</div>
              <div className="stat-label">胜率</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <div className="stat-value">{statsReport.summary.totalPlayTime}</div>
              <div className="stat-label">总游戏时间</div>
            </div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="stats-details">
          {/* 战斗统计 */}
          <div className="stats-section">
            <h3>⚔️ 战斗统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">总战斗次数</span>
                <span className="stat-value">{statsReport.combat.totalBattles}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">战斗胜率</span>
                <span className="stat-value">{statsReport.combat.winRate}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">击败BOSS</span>
                <span className="stat-value">{statsReport.combat.totalBossesDefeated}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">造成伤害</span>
                <span className="stat-value">
                  {statsReport.combat.totalDamageDealt.toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">受到伤害</span>
                <span className="stat-value">
                  {statsReport.combat.totalDamageTaken.toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">平均伤害/局</span>
                <span className="stat-value">
                  {Math.floor(statsReport.combat.averageDamagePerRun).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 收集统计 */}
          <div className="stats-section">
            <h3>📦 收集统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">收集卡牌</span>
                <span className="stat-value">{statsReport.collection.uniqueCards}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">收集遗物</span>
                <span className="stat-value">{statsReport.collection.uniqueRelics}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">获得金币</span>
                <span className="stat-value">
                  {statsReport.collection.totalGoldEarned.toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">花费金币</span>
                <span className="stat-value">
                  {statsReport.collection.totalGoldSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 探索统计 */}
          <div className="stats-section">
            <h3>🗺️ 探索统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">触发事件</span>
                <span className="stat-value">{statsReport.exploration.uniqueEvents}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">访问商店</span>
                <span className="stat-value">{statsReport.exploration.totalShopsVisited}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">营地休息</span>
                <span className="stat-value">{statsReport.exploration.totalCampfiresVisited}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">发现密室</span>
                <span className="stat-value">{statsReport.exploration.totalSecretRoomsFound}</span>
              </div>
            </div>
          </div>

          {/* 挑战统计 */}
          <div className="stats-section">
            <h3>🎯 挑战统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">最高进阶</span>
                <span className="stat-value">{statsReport.challenges.highestAscension}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">完成挑战</span>
                <span className="stat-value">{statsReport.challenges.totalChallengesCompleted}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">独特挑战</span>
                <span className="stat-value">{statsReport.challenges.uniqueChallenges}</span>
              </div>
            </div>
          </div>

          {/* 最高记录 */}
          <div className="stats-section records">
            <h3>🏅 最高记录</h3>
            <div className="stats-grid">
              <div className="stat-item highlight">
                <span className="stat-label">最快通关</span>
                <span className="stat-value">{statsReport.records.fastestVictory}</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">最高层数</span>
                <span className="stat-value">{statsReport.records.highestFloor}</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">单局最多金币</span>
                <span className="stat-value">{statsReport.records.maxGoldInRun.toLocaleString()}</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">单次最高伤害</span>
                <span className="stat-value">{statsReport.records.maxDamageInTurn.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染成就标签页
  const renderAchievementsTab = () => {
    return (
      <div className="achievements-content">
        {/* 成就概览 */}
        <div className="achievements-overview">
          <div className="achievement-progress-card">
            <div className="progress-header">
              <span className="progress-title">总进度</span>
              <span className="progress-value">
                {achievementStats.unlocked}/{achievementStats.total}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${achievementStats.progress}%` }}
              />
            </div>
            <div className="progress-points">
              {achievementStats.unlockedPoints}/{achievementStats.totalPoints} 点数
            </div>
          </div>

          {/* 分类进度 */}
          <div className="achievement-categories">
            {(Object.keys(ACHIEVEMENT_CATEGORIES) as AchievementType[]).map(type => {
              const stats = achievementStats.byType[type];
              const category = ACHIEVEMENT_CATEGORIES[type];
              const progress = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0;

              return (
                <div
                  key={type}
                  className={`category-card ${achievementFilter.type === type ? 'active' : ''}`}
                  onClick={() =>
                    setAchievementFilter(prev => ({
                      ...prev,
                      type: prev.type === type ? 'all' : type
                    }))
                  }
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-name">{category.name}</div>
                  <div className="category-progress">
                    {stats.unlocked}/{stats.total}
                  </div>
                  <div className="progress-bar small">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 筛选器 */}
        <div className="achievements-filter">
          <select
            value={achievementFilter.status}
            onChange={e =>
              setAchievementFilter(prev => ({
                ...prev,
                status: e.target.value as AchievementFilterOptions['status']
              }))
            }
          >
            <option value="all">全部成就</option>
            <option value="unlocked">已解锁</option>
            <option value="locked">未解锁</option>
          </select>
        </div>

        {/* 成就列表 */}
        <div className="achievements-list">
          {filteredAchievements.map(status => (
            <div
              key={status.achievement.id}
              className={`achievement-item ${status.unlocked ? 'unlocked' : 'locked'} ${
                status.achievement.hidden && !status.unlocked ? 'hidden-achievement' : ''
              }`}
              onClick={() => setSelectedAchievement(status)}
            >
              <div className="achievement-icon">{status.achievement.icon}</div>
              <div className="achievement-info">
                <div className="achievement-name">
                  {status.achievement.hidden && !status.unlocked
                    ? '???'
                    : status.achievement.name}
                </div>
                <div className="achievement-description">
                  {status.achievement.hidden && !status.unlocked
                    ? '这是一个隐藏成就'
                    : status.achievement.description}
                </div>
                {!status.unlocked && !status.achievement.hidden && (
                  <div className="achievement-progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(status.progress / status.progressMax) * 100}%`
                      }}
                    />
                    <span className="progress-text">
                      {status.progress}/{status.progressMax}
                    </span>
                  </div>
                )}
              </div>
              <div className="achievement-points">{status.achievement.points} pts</div>
              {status.unlocked && (
                <div className="achievement-unlocked-badge">✓</div>
              )}
            </div>
          ))}
        </div>

        {/* 成就详情弹窗 */}
        {selectedAchievement && (
          <div
            className="achievement-modal-overlay"
            onClick={() => setSelectedAchievement(null)}
          >
            <div
              className="achievement-modal"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedAchievement(null)}
              >
                ×
              </button>
              <div className="achievement-modal-header">
                <div className="achievement-icon large">
                  {selectedAchievement.achievement.icon}
                </div>
                <h3>{selectedAchievement.achievement.name}</h3>
                <p>{selectedAchievement.achievement.description}</p>
              </div>
              <div className="achievement-modal-body">
                <div className="achievement-detail">
                  <span className="detail-label">类型</span>
                  <span className="detail-value">
                    {ACHIEVEMENT_CATEGORIES[selectedAchievement.achievement.type].icon}{' '}
                    {ACHIEVEMENT_CATEGORIES[selectedAchievement.achievement.type].name}
                  </span>
                </div>
                <div className="achievement-detail">
                  <span className="detail-label">点数</span>
                  <span className="detail-value">
                    {selectedAchievement.achievement.points} 点
                  </span>
                </div>
                {selectedAchievement.unlocked && (
                  <div className="achievement-detail">
                    <span className="detail-label">解锁时间</span>
                    <span className="detail-value">
                      {selectedAchievement.unlockedAt
                        ? formatDate(selectedAchievement.unlockedAt)
                        : '未知'}
                    </span>
                  </div>
                )}
                <div className="achievement-detail">
                  <span className="detail-label">奖励</span>
                  <span className="detail-value reward">
                    {selectedAchievement.achievement.reward.description}
                  </span>
                </div>
                {selectedAchievement.achievement.prerequisites &&
                  selectedAchievement.achievement.prerequisites.length > 0 && (
                    <div className="achievement-detail">
                      <span className="detail-label">前置成就</span>
                      <span className="detail-value">
                        {selectedAchievement.achievement.prerequisites.map(prereqId => {
                          const prereq = TOWER_ACHIEVEMENTS.find(a => a.id === prereqId);
                          return prereq ? (
                            <span
                              key={prereqId}
                              className={`prereq-badge ${
                                achievementManager.isUnlocked(prereqId) ? 'unlocked' : ''
                              }`}
                            >
                              {prereq.icon} {prereq.name}
                            </span>
                          ) : null;
                        })}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染排行榜标签页
  const renderLeaderboardTab = () => {
    if (leaderboard.length === 0) {
      return (
        <div className="leaderboard-empty">
          <div className="empty-icon">🏆</div>
          <p>暂无排行榜数据</p>
          <p className="empty-hint">完成游戏后即可上榜</p>
        </div>
      );
    }

    return (
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <div className="leaderboard-rank">排名</div>
          <div className="leaderboard-player">玩家</div>
          <div className="leaderboard-character">角色</div>
          <div className="leaderboard-ascension">进阶</div>
          <div className="leaderboard-result">结果</div>
          <div className="leaderboard-floor">层数</div>
          <div className="leaderboard-time">时间</div>
          <div className="leaderboard-score">分数</div>
          <div className="leaderboard-date">日期</div>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}`}
            >
              <div className="leaderboard-rank">
                {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
              </div>
              <div className="leaderboard-player">{entry.playerName}</div>
              <div className="leaderboard-character">{entry.characterId}</div>
              <div className="leaderboard-ascension">
                {entry.ascensionLevel > 0 ? `+${entry.ascensionLevel}` : '-'}
              </div>
              <div className={`leaderboard-result ${entry.victory ? 'victory' : 'defeat'}`}>
                {entry.victory ? '胜利' : '失败'}
              </div>
              <div className="leaderboard-floor">{entry.floorReached}</div>
              <div className="leaderboard-time">{formatTime(entry.duration)}</div>
              <div className="leaderboard-score">{entry.score.toLocaleString()}</div>
              <div className="leaderboard-date">{formatDate(entry.date)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="tower-stats-panel-overlay" onClick={onClose}>
      <div className="tower-stats-panel" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="panel-header">
          <h2>数据统计</h2>
          <div className="panel-actions">
            <button
              className="action-btn"
              onClick={() => setShowExportModal(true)}
              title="导出数据"
            >
              📤
            </button>
            <button
              className="action-btn"
              onClick={() => setShowImportModal(true)}
              title="导入数据"
            >
              📥
            </button>
            <button
              className="action-btn danger"
              onClick={() => setShowResetConfirm(true)}
              title="重置数据"
            >
              🗑️
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="panel-tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 统计
          </button>
          <button
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 成就
            <span className="tab-badge">
              {achievementStats.unlocked}/{achievementStats.total}
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🥇 排行榜
          </button>
        </div>

        {/* 内容区域 */}
        <div className="panel-content">
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'achievements' && renderAchievementsTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
        </div>

        {/* 导出弹窗 */}
        {showExportModal && (
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>导出数据</h3>
              <p>将导出所有统计数据和成就进度为JSON文件。</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleExport}>
                  导出
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 导入弹窗 */}
        {showImportModal && (
          <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>导入数据</h3>
              <p>粘贴之前导出的JSON数据：</p>
              <textarea
                value={importData}
                onChange={e => setImportData(e.target.value)}
                placeholder="在此粘贴JSON数据..."
                rows={6}
              />
              {importError && <div className="error-message">{importError}</div>}
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowImportModal(false)}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleImport}>
                  导入
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 重置确认弹窗 */}
        {showResetConfirm && (
          <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
            <div className="modal danger" onClick={e => e.stopPropagation()}>
              <h3>⚠️ 重置所有数据</h3>
              <p>确定要重置所有统计数据和成就进度吗？</p>
              <p className="warning-text">此操作不可撤销！</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>
                  取消
                </button>
                <button className="btn-danger" onClick={handleReset}>
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 样式 */}
      <style>{`
        .tower-stats-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .tower-stats-panel {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h2 {
          margin: 0;
          color: #fff;
          font-size: 24px;
        }

        .panel-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          padding: 0 4px;
          margin-left: 8px;
        }

        .panel-tabs {
          display: flex;
          gap: 8px;
          padding: 12px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .tab-btn.active {
          background: #3b82f6;
          color: #fff;
        }

        .tab-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        /* 统计标签页样式 */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .stats-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .stats-section h3 {
          margin: 0 0 16px 0;
          color: #fff;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .stat-item.highlight {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .stat-item .stat-label {
          font-size: 13px;
        }

        .stat-item .stat-value {
          font-size: 16px;
          color: #3b82f6;
        }

        /* 成就标签页样式 */
        .achievements-overview {
          margin-bottom: 24px;
        }

        .achievement-progress-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          color: #fff;
          margin-bottom: 12px;
        }

        .progress-title {
          font-size: 14px;
        }

        .progress-value {
          font-weight: bold;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar.small {
          height: 4px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-points {
          text-align: right;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin-top: 8px;
        }

        .achievement-categories {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .category-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .category-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .category-card.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .category-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .category-name {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 4px;
        }

        .category-progress {
          font-size: 14px;
          color: #fff;
          font-weight: bold;
        }

        .achievements-filter {
          margin-bottom: 16px;
        }

        .achievements-filter select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 10px 16px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .achievement-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .achievement-item.unlocked {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.05);
        }

        .achievement-item.locked {
          opacity: 0.7;
        }

        .achievement-item.hidden-achievement {
          background: rgba(0, 0, 0, 0.3);
        }

        .achievement-icon {
          font-size: 32px;
          width: 48px;
          text-align: center;
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .achievement-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .achievement-progress-bar {
          margin-top: 8px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .achievement-progress-bar .progress-fill {
          background: #3b82f6;
        }

        .progress-text {
          position: absolute;
          right: 0;
          top: -18px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .achievement-points {
          font-size: 12px;
          color: #fbbf24;
          font-weight: 600;
        }

        .achievement-unlocked-badge {
          width: 24px;
          height: 24px;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
        }

        /* 成就详情弹窗 */
        .achievement-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }

        .achievement-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
          cursor: pointer;
        }

        .achievement-modal-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .achievement-icon.large {
          font-size: 64px;
          margin-bottom: 12px;
        }

        .achievement-modal-header h3 {
          color: #fff;
          margin: 0 0 8px 0;
        }

        .achievement-modal-header p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .achievement-modal-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .achievement-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .detail-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .detail-value {
          color: #fff;
          font-size: 14px;
        }

        .detail-value.reward {
          color: #fbbf24;
        }

        .prereq-badge {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 12px;
          margin-left: 4px;
        }

        .prereq-badge.unlocked {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        /* 排行榜标签页样式 */
        .leaderboard-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-hint {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .leaderboard-header {
          display: grid;
          grid-template-columns: 60px 100px 80px 60px 70px 60px 100px 80px 100px;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .leaderboard-item {
          display: grid;
          grid-template-columns: 60px 100px 80px 60px 70px 60px 100px 80px 100px;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          font-size: 13px;
          align-items: center;
        }

        .leaderboard-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .leaderboard-item.top-1 {
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .leaderboard-item.top-2 {
          background: rgba(156, 163, 175, 0.15);
          border: 1px solid rgba(156, 163, 175, 0.3);
        }

        .leaderboard-item.top-3 {
          background: rgba(180, 83, 9, 0.15);
          border: 1px solid rgba(180, 83, 9, 0.3);
        }

        .leaderboard-rank {
          font-weight: bold;
          text-align: center;
        }

        .leaderboard-result.victory {
          color: #22c55e;
        }

        .leaderboard-result.defeat {
          color: #ef4444;
        }

        .leaderboard-score {
          font-weight: bold;
          color: #fbbf24;
        }

        /* 通用弹窗样式 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }

        .modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal.danger {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .modal h3 {
          margin: 0 0 16px 0;
          color: #fff;
        }

        .modal p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 16px 0;
        }

        .warning-text {
          color: #ef4444 !important;
          font-weight: 600;
        }

        .modal textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          font-family: monospace;
          font-size: 12px;
          resize: vertical;
          margin-bottom: 12px;
        }

        .error-message {
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-primary {
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-danger {
          background: #ef4444;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        /* 滚动条样式 */
        .panel-content::-webkit-scrollbar {
          width: 8px;
        }

        .panel-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .panel-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .panel-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TowerStatsPanel;
