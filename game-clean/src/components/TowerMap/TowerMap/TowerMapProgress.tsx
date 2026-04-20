/**
 * 大地图进度指示器组件
 * 
 * 显示当前Act进度、整体爬塔进度、进度条可视化
 * 以及已完成/剩余节点统计
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TowerMap, TowerMapAct, TowerMapFloor } from '@/types/towerMapTypes';
import { getActTheme } from '@/styles/towerMapTheme';
import { 
  Trophy, 
  Target, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  Circle,
  TrendingUp,
  Clock,
  Flame
} from 'lucide-react';

// ============================================
// 类型定义
// ============================================

interface TowerMapProgressProps {
  /** 地图数据 */
  map: TowerMap;
  /** 自定义类名 */
  className?: string;
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 是否显示详细统计 */
  showDetails?: boolean;
}

interface ActProgressProps {
  act: TowerMapAct;
  completedNodes: string[];
  currentNodeId: string;
  isActive: boolean;
  compact?: boolean;
}

interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// 进度条组件
// ============================================

/**
 * 进度条组件
 * 带动画效果的进度条显示
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  color,
  label,
  showPercentage = true,
  size = 'md'
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs text-slate-400">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-medium" style={{ color }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-slate-800 rounded-full overflow-hidden",
        heightClasses[size]
      )}>
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* 光泽效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* 脉冲动画（当进度接近100%时） */}
          {percentage >= 90 && percentage < 100 && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-4"
              style={{ backgroundColor: color }}
              animate={{
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  `0 0 5px ${color}`,
                  `0 0 15px ${color}`,
                  `0 0 5px ${color}`
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ============================================
// 单幕进度组件
// ============================================

/**
 * 单幕进度组件
 * 显示单个Act的进度信息
 */
const ActProgress: React.FC<ActProgressProps> = ({
  act,
  completedNodes,
  currentNodeId,
  isActive,
  compact = false
}) => {
  const { t } = useTranslation('game');
  const theme = getActTheme(act.theme);

  // 计算该幕的进度
  const stats = useMemo(() => {
    let totalNodes = 0;
    let completedCount = 0;
    let currentFloor = 0;

    act.floors.forEach((floor, floorIndex) => {
      floor.nodes.forEach(node => {
        totalNodes++;
        if (completedNodes.includes(node.id)) {
          completedCount++;
        }
        if (node.id === currentNodeId) {
          currentFloor = floorIndex + 1;
        }
      });
    });

    return {
      totalNodes,
      completedCount,
      currentFloor,
      totalFloors: act.floors.length,
      progress: totalNodes > 0 ? (completedCount / totalNodes) * 100 : 0
    };
  }, [act, completedNodes, currentNodeId]);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-all",
        isActive ? "bg-slate-800/80" : "bg-slate-900/50 opacity-60"
      )}>
        {/* Act图标 */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: isActive ? theme.primary : theme.dark,
            color: theme.light
          }}
        >
          {act.actNumber}
        </div>

        {/* 进度条 */}
        <div className="flex-1">
          <ProgressBar
            current={stats.completedCount}
            total={stats.totalNodes}
            color={theme.primary}
            showPercentage={false}
            size="sm"
          />
        </div>

        {/* 统计数字 */}
        <div className="text-xs text-slate-400">
          {stats.completedCount}/{stats.totalNodes}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        isActive 
          ? "bg-slate-800/80 border-slate-700" 
          : "bg-slate-900/50 border-slate-800 opacity-70"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 主题色边框指示 */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
          style={{ backgroundColor: theme.primary }}
          layoutId="activeActIndicator"
        />
      )}

      {/* Act头部信息 */}
      <div className="flex items-start justify-between mb-3 pl-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              color: 'white'
            }}
          >
            {act.actNumber}
          </div>
          <div>
            <h4 className="font-semibold text-white">{act.name}</h4>
            <p className="text-xs text-slate-400">{act.description}</p>
          </div>
        </div>

        {/* 完成状态 */}
        {stats.progress >= 100 ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-green-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">{t('towerMap.completed', 'Completed')}</span>
          </motion.div>
        ) : isActive && (
          <div className="flex items-center gap-1 text-amber-400">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">{t('towerMap.inProgress', 'In Progress')}</span>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="pl-3 mb-3">
        <ProgressBar
          current={stats.completedCount}
          total={stats.totalNodes}
          color={theme.primary}
          label={t('towerMap.nodesProgress', 'Nodes Progress')}
          size="md"
        />
      </div>

      {/* 详细统计 */}
      <div className="pl-3 grid grid-cols-3 gap-2">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Layers className="w-3 h-3" />
            <span className="text-xs">{t('towerMap.floor', 'Floor')}</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {stats.currentFloor > 0 ? `${stats.currentFloor}/${stats.totalFloors}` : `0/${stats.totalFloors}`}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-xs">{t('towerMap.completed', 'Done')}</span>
          </div>
          <div className="text-sm font-semibold text-green-400">
            {stats.completedCount}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Circle className="w-3 h-3" />
            <span className="text-xs">{t('towerMap.remaining', 'Left')}</span>
          </div>
          <div className="text-sm font-semibold text-amber-400">
            {stats.totalNodes - stats.completedCount}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// 主组件
// ============================================

/**
 * 大地图进度指示器组件
 * 显示整体爬塔进度和各幕进度
 */
export const TowerMapProgress: React.FC<TowerMapProgressProps> = ({
  map,
  className,
  compact = false,
  showDetails = true
}) => {
  const { t } = useTranslation('game');

  // 计算整体进度
  const overallStats = useMemo(() => {
    let totalNodes = 0;
    let completedCount = 0;
    let totalFloors = 0;
    let currentFloorInAct = 0;

    map.acts.forEach(act => {
      act.floors.forEach((floor, floorIndex) => {
        floor.nodes.forEach(node => {
          totalNodes++;
          if (map.completedNodes.includes(node.id)) {
            completedCount++;
          }
          if (node.id === map.currentNodeId) {
            currentFloorInAct = floorIndex + 1;
            totalFloors = act.floors.length;
          }
        });
      });
    });

    return {
      totalNodes,
      completedCount,
      remainingCount: totalNodes - completedCount,
      progress: totalNodes > 0 ? (completedCount / totalNodes) * 100 : 0,
      currentAct: map.currentAct,
      currentFloorInAct,
      totalFloors
    };
  }, [map]);

  // 获取当前Act的主题色
  const currentAct = map.acts.find(act => act.actNumber === map.currentAct);
  const currentTheme = currentAct ? getActTheme(currentAct.theme) : getActTheme('cyber');

  if (compact) {
    return (
      <div className={cn(
        "bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700 p-3",
        className
      )}>
        {/* 紧凑模式：只显示当前Act进度 */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white">
                {t('towerMap.overallProgress', 'Overall Progress')}
              </span>
              <span className="text-sm font-bold" style={{ color: currentTheme.primary }}>
                {Math.round(overallStats.progress)}%
              </span>
            </div>
            <ProgressBar
              current={overallStats.completedCount}
              total={overallStats.totalNodes}
              color={currentTheme.primary}
              showPercentage={false}
              size="sm"
            />
          </div>
        </div>

        {/* 各幕进度 */}
        <div className="space-y-2">
          {map.acts.map(act => (
            <ActProgress
              key={act.actNumber}
              act={act}
              completedNodes={map.completedNodes}
              currentNodeId={map.currentNodeId}
              isActive={act.actNumber === map.currentAct}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden",
      className
    )}>
      {/* 头部：整体进度 */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
              }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {t('towerMap.climbProgress', 'Tower Climb Progress')}
              </h3>
              <p className="text-sm text-slate-400">
                {t('towerMap.act', 'Act')} {overallStats.currentAct} • {t('towerMap.floor', 'Floor')} {overallStats.currentFloorInAct}/{overallStats.totalFloors}
              </p>
            </div>
          </div>

          {/* 总体完成度 */}
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
              {Math.round(overallStats.progress)}%
            </div>
            <div className="text-xs text-slate-400">
              {overallStats.completedCount}/{overallStats.totalNodes} {t('towerMap.nodes', 'nodes')}
            </div>
          </div>
        </div>

        {/* 总体进度条 */}
        <ProgressBar
          current={overallStats.completedCount}
          total={overallStats.totalNodes}
          color={currentTheme.primary}
          size="lg"
        />

        {/* 快速统计 */}
        {showDetails && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <div className="text-lg font-bold text-white">{overallStats.currentAct}</div>
              <div className="text-xs text-slate-400">{t('towerMap.currentAct', 'Current Act')}</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Target className="w-4 h-4 mx-auto mb-1 text-green-400" />
              <div className="text-lg font-bold text-green-400">{overallStats.completedCount}</div>
              <div className="text-xs text-slate-400">{t('towerMap.completed', 'Completed')}</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Layers className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <div className="text-lg font-bold text-amber-400">{overallStats.remainingCount}</div>
              <div className="text-xs text-slate-400">{t('towerMap.remaining', 'Remaining')}</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <div className="text-lg font-bold text-purple-400">
                {Math.ceil((overallStats.remainingCount / Math.max(overallStats.completedCount, 1)) * 10)}m
              </div>
              <div className="text-xs text-slate-400">{t('towerMap.estTime', 'Est. Time')}</div>
            </div>
          </div>
        )}
      </div>

      {/* 各幕详细进度 */}
      <div className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {t('towerMap.actProgress', 'Act Progress')}
        </h4>
        
        {map.acts.map((act, index) => (
          <motion.div
            key={act.actNumber}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActProgress
              act={act}
              completedNodes={map.completedNodes}
              currentNodeId={map.currentNodeId}
              isActive={act.actNumber === map.currentAct}
              compact={false}
            />
          </motion.div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>
            {t('towerMap.progressTip', 'Complete nodes to unlock new paths and progress to the next act!')}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 迷你进度指示器（用于悬浮按钮等）
// ============================================

interface MiniProgressIndicatorProps {
  map: TowerMap;
  className?: string;
}

/**
 * 迷你进度指示器
 * 用于悬浮按钮或紧凑空间
 */
export const MiniProgressIndicator: React.FC<MiniProgressIndicatorProps> = ({
  map,
  className
}) => {
  const currentAct = map.acts.find(act => act.actNumber === map.currentAct);
  const theme = currentAct ? getActTheme(currentAct.theme) : getActTheme('cyber');

  // 计算当前幕进度
  const progress = useMemo(() => {
    if (!currentAct) return 0;
    
    let total = 0;
    let completed = 0;
    
    currentAct.floors.forEach(floor => {
      floor.nodes.forEach(node => {
        total++;
        if (map.completedNodes.includes(node.id)) {
          completed++;
        }
      });
    });
    
    return total > 0 ? (completed / total) * 100 : 0;
  }, [currentAct, map.completedNodes]);

  // 计算圆周
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative w-12 h-12", className)}>
      {/* 背景圆环 */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth="4"
        />
        {/* 进度圆环 */}
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={theme.primary}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 4px ${theme.primary})`
          }}
        />
      </svg>
      
      {/* 中心内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{map.currentAct}</span>
      </div>
    </div>
  );
};

// ============================================
// 导出
// ============================================

export default {
  TowerMapProgress,
  MiniProgressIndicator,
  ProgressBar,
  ActProgress
};

export { MiniProgressIndicator, ProgressBar, ActProgress };
