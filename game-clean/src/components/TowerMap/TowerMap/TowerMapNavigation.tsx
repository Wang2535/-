/**
 * 大地图快速导航组件
 * 
 * 提供跳转到当前位置、缩放控制、地图拖拽提示、全屏切换等功能
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TowerMap } from '@/types/towerMapTypes';
import { getActTheme, MAP_LAYOUT } from '@/styles/towerMapTheme';
import {
  Crosshair,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Hand,
  Map as MapIcon,
  Compass,
  Layers,
  Target,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  GripHorizontal
} from 'lucide-react';

// ============================================
// 类型定义
// ============================================

interface TowerMapNavigationProps {
  /** 地图数据 */
  map: TowerMap;
  /** 当前缩放比例 */
  scale: number;
  /** 当前平移位置 */
  translate: { x: number; y: number };
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 是否全屏 */
  isFullscreen: boolean;
  /** 缩放回调 */
  onZoomIn: () => void;
  /** 缩放回调 */
  onZoomOut: () => void;
  /** 重置视图回调 */
  onReset: () => void;
  /** 跳转到当前位置回调 */
  onGotoCurrent: () => void;
  /** 全屏切换回调 */
  onToggleFullscreen: () => void;
  /** 平移回调 */
  onPan?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** 自定义类名 */
  className?: string;
  /** 是否显示提示 */
  showHints?: boolean;
}

interface NavigationButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  badge?: number | string;
}

interface ZoomControlProps {
  scale: number;
  minScale?: number;
  maxScale?: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showPercentage?: boolean;
}

// ============================================
// 导航按钮组件
// ============================================

/**
 * 导航按钮组件
 * 带悬停动画和状态指示的按钮
 */
const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon,
  onClick,
  title,
  disabled = false,
  active = false,
  variant = 'default',
  size = 'md',
  className,
  badge
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variantClasses = {
    default: cn(
      'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white',
      active && 'bg-slate-700 text-white ring-2 ring-blue-500/50'
    ),
    primary: cn(
      'bg-blue-600/90 text-white hover:bg-blue-500',
      active && 'bg-blue-500 ring-2 ring-blue-400/50'
    ),
    danger: cn(
      'bg-red-600/90 text-white hover:bg-red-500',
      active && 'bg-red-500 ring-2 ring-red-400/50'
    )
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'relative rounded-xl backdrop-blur-sm transition-all duration-200',
        'flex items-center justify-center shadow-lg',
        'border border-slate-700/50',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <span className={iconSizes[size]}>{icon}</span>
      
      {/* 角标 */}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </motion.button>
  );
};

// ============================================
// 缩放控制组件
// ============================================

/**
 * 缩放控制组件
 * 提供缩放按钮和当前比例显示
 */
const ZoomControl: React.FC<ZoomControlProps> = ({
  scale,
  minScale = MAP_LAYOUT.minScale,
  maxScale = MAP_LAYOUT.maxScale,
  onZoomIn,
  onZoomOut,
  onReset,
  showPercentage = true
}) => {
  const { t } = useTranslation('game');
  const percentage = Math.round(scale * 100);

  return (
    <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50 shadow-lg">
      {/* 缩小按钮 */}
      <NavigationButton
        icon={<ZoomOut className="w-4 h-4" />}
        onClick={onZoomOut}
        title={t('towerMap.zoomOut', 'Zoom Out')}
        disabled={scale <= minScale}
        size="sm"
      />

      {/* 缩放比例显示 */}
      {showPercentage && (
        <motion.button
          onClick={onReset}
          className="px-3 py-1 min-w-[60px] text-center text-sm font-medium text-slate-300 hover:text-white transition-colors"
          title={t('towerMap.resetZoom', 'Reset Zoom')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {percentage}%
        </motion.button>
      )}

      {/* 放大按钮 */}
      <NavigationButton
        icon={<ZoomIn className="w-4 h-4" />}
        onClick={onZoomIn}
        title={t('towerMap.zoomIn', 'Zoom In')}
        disabled={scale >= maxScale}
        size="sm"
      />
    </div>
  );
};

// ============================================
// 方向控制组件
// ============================================

/**
 * 方向控制组件
 * 提供上下左右平移控制
 */
const DirectionalControl: React.FC<{
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
}> = ({ onPan }) => {
  const { t } = useTranslation('game');

  return (
    <div className="relative w-28 h-28">
      {/* 上 */}
      <NavigationButton
        icon={<ChevronUp className="w-5 h-5" />}
        onClick={() => onPan('up')}
        title={t('towerMap.panUp', 'Pan Up')}
        size="sm"
        className="absolute top-0 left-1/2 -translate-x-1/2"
      />
      
      {/* 下 */}
      <NavigationButton
        icon={<ChevronDown className="w-5 h-5" />}
        onClick={() => onPan('down')}
        title={t('towerMap.panDown', 'Pan Down')}
        size="sm"
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
      />
      
      {/* 左 */}
      <NavigationButton
        icon={<ChevronLeft className="w-5 h-5" />}
        onClick={() => onPan('left')}
        title={t('towerMap.panLeft', 'Pan Left')}
        size="sm"
        className="absolute left-0 top-1/2 -translate-y-1/2"
      />
      
      {/* 右 */}
      <NavigationButton
        icon={<ChevronRight className="w-5 h-5" />}
        onClick={() => onPan('right')}
        title={t('towerMap.panRight', 'Pan Right')}
        size="sm"
        className="absolute right-0 top-1/2 -translate-y-1/2"
      />

      {/* 中心重置 */}
      <NavigationButton
        icon={<Crosshair className="w-4 h-4" />}
        onClick={() => onPan('up')}
        title={t('towerMap.center', 'Center')}
        size="sm"
        variant="primary"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

// ============================================
// 拖拽提示组件
// ============================================

/**
 * 拖拽提示组件
 * 显示地图可拖拽的提示信息
 */
const DragHint: React.FC<{
  isDragging: boolean;
  onDismiss?: () => void;
}> = ({ isDragging, onDismiss }) => {
  const { t } = useTranslation('game');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isDragging) {
      setIsVisible(false);
    }
  }, [isDragging]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-700 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Hand className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {t('towerMap.dragHint', 'Drag to pan the map')}
            </p>
            <p className="text-xs text-slate-400">
              {t('towerMap.dragSubHint', 'Use mouse wheel to zoom')}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// 主组件
// ============================================

/**
 * 大地图快速导航组件
 * 整合所有导航功能的控制面板
 */
export const TowerMapNavigation: React.FC<TowerMapNavigationProps> = ({
  map,
  scale,
  translate,
  isDragging,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onReset,
  onGotoCurrent,
  onToggleFullscreen,
  onPan,
  className,
  showHints = true
}) => {
  const { t } = useTranslation('game');
  const [showDragHint, setShowDragHint] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // 获取当前Act主题
  const currentAct = map.acts.find(act => act.actNumber === map.currentAct);
  const theme = currentAct ? getActTheme(currentAct.theme) : getActTheme('cyber');

  // 处理平移
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    onPan?.(direction);
  }, [onPan]);

  return (
    <>
      {/* 主要导航控制 - 右上角 */}
      <div className={cn(
        "absolute top-4 right-4 z-20 flex flex-col gap-3",
        className
      )}>
        {/* 缩放控制 */}
        <ZoomControl
          scale={scale}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onReset={onReset}
        />

        {/* 功能按钮组 */}
        <div className="flex flex-col gap-2">
          {/* 跳转到当前位置 */}
          <NavigationButton
            icon={<Crosshair className="w-5 h-5" />}
            onClick={onGotoCurrent}
            title={t('towerMap.gotoCurrent', 'Go to Current Position')}
            variant="primary"
          />

          {/* 重置视图 */}
          <NavigationButton
            icon={<RotateCcw className="w-5 h-5" />}
            onClick={onReset}
            title={t('towerMap.resetView', 'Reset View')}
          />

          {/* 全屏切换 */}
          <NavigationButton
            icon={isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            onClick={onToggleFullscreen}
            title={isFullscreen 
              ? t('towerMap.exitFullscreen', 'Exit Fullscreen') 
              : t('towerMap.enterFullscreen', 'Enter Fullscreen')
            }
            active={isFullscreen}
          />
        </div>

        {/* 展开/收起按钮 */}
        <NavigationButton
          icon={isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded 
            ? t('towerMap.collapse', 'Collapse') 
            : t('towerMap.expand', 'Expand')
          }
          size="sm"
          className="self-center"
        />

        {/* 扩展控制面板 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              {/* 方向控制 */}
              {onPan && (
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-lg">
                  <p className="text-xs text-slate-400 text-center mb-2">
                    {t('towerMap.panControls', 'Pan Controls')}
                  </p>
                  <div className="flex justify-center">
                    <DirectionalControl onPan={handlePan} />
                  </div>
                </div>
              )}

              {/* 快速信息 */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapIcon className="w-3 h-3" style={{ color: theme.primary }} />
                    <span>{t('towerMap.act', 'Act')} {map.currentAct}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Layers className="w-3 h-3" style={{ color: theme.primary }} />
                    <span>{t('towerMap.floor', 'Floor')} {map.currentFloor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Target className="w-3 h-3" style={{ color: theme.primary }} />
                    <span>{map.completedNodes.length} {t('towerMap.completed', 'completed')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 左下角状态指示 */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        {/* 拖拽状态指示 */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm shadow-lg"
            >
              <GripHorizontal className="w-4 h-4" />
              <span>{t('towerMap.dragging', 'Dragging...')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 坐标显示 */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-400 shadow-lg border border-slate-700/50">
          <div className="flex items-center gap-3">
            <span>X: {Math.round(translate.x)}</span>
            <span>Y: {Math.round(translate.y)}</span>
            <span>Zoom: {Math.round(scale * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 拖拽提示 */}
      {showHints && showDragHint && (
        <DragHint
          isDragging={isDragging}
          onDismiss={() => setShowDragHint(false)}
        />
      )}

      {/* 底部中央：幕切换指示（如果有多幕） */}
      {map.acts.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50 shadow-lg">
            {map.acts.map((act, index) => {
              const actTheme = getActTheme(act.theme);
              const isCurrent = act.actNumber === map.currentAct;
              const isCompleted = map.completedNodes.length >= act.floors.reduce(
                (acc, floor) => acc + floor.nodes.length, 0
              );

              return (
                <React.Fragment key={act.actNumber}>
                  <motion.button
                    onClick={onGotoCurrent}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      isCurrent && "ring-2 ring-white/50"
                    )}
                    style={{
                      backgroundColor: isCurrent 
                        ? actTheme.primary 
                        : isCompleted 
                          ? actTheme.dark 
                          : '#334155'
                    }}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    title={`${t('towerMap.act', 'Act')} ${act.actNumber}: ${act.name}`}
                  />
                  {index < map.acts.length - 1 && (
                    <div className="w-4 h-0.5 bg-slate-700" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// 悬浮导航按钮（用于最小化状态）
// ============================================

interface FloatingNavigationProps {
  map: TowerMap;
  onExpand: () => void;
  onGotoCurrent: () => void;
  className?: string;
}

/**
 * 悬浮导航按钮
 * 最小化状态下的快速访问按钮
 */
export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  map,
  onExpand,
  onGotoCurrent,
  className
}) => {
  const { t } = useTranslation('game');
  const currentAct = map.acts.find(act => act.actNumber === map.currentAct);
  const theme = currentAct ? getActTheme(currentAct.theme) : getActTheme('cyber');

  return (
    <motion.div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col gap-3",
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* 跳转到当前位置 */}
      <NavigationButton
        icon={<Crosshair className="w-5 h-5" />}
        onClick={onGotoCurrent}
        title={t('towerMap.gotoCurrent', 'Go to Current Position')}
        variant="primary"
        size="lg"
      />

      {/* 展开完整导航 */}
      <NavigationButton
        icon={<Compass className="w-5 h-5" />}
        onClick={onExpand}
        title={t('towerMap.openNavigation', 'Open Navigation')}
        size="lg"
        style={{ backgroundColor: theme.primary }}
      />
    </motion.div>
  );
};

// ============================================
// 全屏遮罩组件
// ============================================

interface FullscreenOverlayProps {
  isActive: boolean;
  children: React.ReactNode;
  onExit: () => void;
}

/**
 * 全屏遮罩组件
 * 全屏模式下的容器和退出控制
 */
export const FullscreenOverlay: React.FC<FullscreenOverlayProps> = ({
  isActive,
  children,
  onExit
}) => {
  const { t } = useTranslation('game');

  if (!isActive) return <>{children}</>;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 退出全屏按钮 */}
      <motion.button
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur-sm rounded-xl text-white text-sm border border-slate-700 shadow-lg"
        onClick={onExit}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Minimize className="w-4 h-4" />
        <span>{t('towerMap.exitFullscreen', 'Exit Fullscreen')}</span>
      </motion.button>

      {children}
    </motion.div>
  );
};

// ============================================
// 导出
// ============================================

export default {
  TowerMapNavigation,
  FloatingNavigation,
  FullscreenOverlay,
  ZoomControl,
  DirectionalControl,
  NavigationButton
};

export {
  FloatingNavigation,
  FullscreenOverlay,
  ZoomControl,
  DirectionalControl,
  NavigationButton
};
