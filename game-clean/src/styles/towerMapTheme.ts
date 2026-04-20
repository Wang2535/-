/**
 * 大地图主题样式配置
 * 
 * 定义三幕主题色彩、节点样式、动画配置和响应式断点
 * 用于实现类似《杀戮尖塔》的视觉风格
 */

import type { NodeType, ActTheme } from '@/types/towerMapTypes';

// ============================================
// 三幕主题色彩定义
// ============================================

/**
 * 幕主题完整配置
 */
export interface ActThemeConfig {
  /** 主色调 */
  primary: string;
  /** 次色调 */
  secondary: string;
  /** 背景色（带透明度） */
  bg: string;
  /** 渐变类名 */
  gradient: string;
  /** 发光色 */
  glow: string;
  /** 边框色 */
  border: string;
  /** 文字色 */
  text: string;
  /** 暗色变体 */
  dark: string;
  /** 亮色变体 */
  light: string;
}

/**
 * 三幕主题色彩配置
 */
export const ACT_THEMES: Record<ActTheme, ActThemeConfig> = {
  // 第一幕：赛博朋克 - 蓝紫色调
  cyber: {
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    bg: 'rgba(139, 92, 246, 0.15)',
    gradient: 'from-violet-600/30 via-purple-500/20 to-blue-600/30',
    glow: 'rgba(139, 92, 246, 0.6)',
    border: 'rgba(139, 92, 246, 0.5)',
    text: '#A78BFA',
    dark: '#5B21B6',
    light: '#C4B5FD'
  },
  // 第二幕：工业风 - 橙黄色调
  industrial: {
    primary: '#F59E0B',
    secondary: '#EF4444',
    bg: 'rgba(245, 158, 11, 0.15)',
    gradient: 'from-amber-600/30 via-orange-500/20 to-red-600/30',
    glow: 'rgba(245, 158, 11, 0.6)',
    border: 'rgba(245, 158, 11, 0.5)',
    text: '#FBBF24',
    dark: '#B45309',
    light: '#FCD34D'
  },
  // 第三幕：企业风 - 青绿色调
  corporate: {
    primary: '#10B981',
    secondary: '#06B6D4',
    bg: 'rgba(16, 185, 129, 0.15)',
    gradient: 'from-emerald-600/30 via-teal-500/20 to-cyan-600/30',
    glow: 'rgba(16, 185, 129, 0.6)',
    border: 'rgba(16, 185, 129, 0.5)',
    text: '#34D399',
    dark: '#047857',
    light: '#6EE7B7'
  },
  // 军事风 - 军绿色调
  military: {
    primary: '#22C55E',
    secondary: '#16A34A',
    bg: 'rgba(34, 197, 94, 0.15)',
    gradient: 'from-green-600/30 via-emerald-500/20 to-green-700/30',
    glow: 'rgba(34, 197, 94, 0.6)',
    border: 'rgba(34, 197, 94, 0.5)',
    text: '#4ADE80',
    dark: '#15803D',
    light: '#86EFAC'
  },
  // 混沌 - 红黑色调
  chaos: {
    primary: '#DC2626',
    secondary: '#7C2D12',
    bg: 'rgba(220, 38, 38, 0.15)',
    gradient: 'from-red-700/30 via-red-600/20 to-red-900/30',
    glow: 'rgba(220, 38, 38, 0.6)',
    border: 'rgba(220, 38, 38, 0.5)',
    text: '#F87171',
    dark: '#991B1B',
    light: '#FCA5A5'
  }
};

// ============================================
// 节点样式配置
// ============================================

/**
 * 节点样式配置
 */
export interface NodeStyleConfig {
  /** 填充色 */
  fill: string;
  /** 边框色 */
  stroke: string;
  /** 发光色 */
  glow: string;
  /** 悬停发光 */
  hoverGlow: string;
  /** 完成状态色 */
  completedFill: string;
  /** 完成状态边框 */
  completedStroke: string;
  /** 图标颜色 */
  iconColor: string;
  /** 尺寸 */
  size: number;
  /** 圆角（如适用） */
  borderRadius?: number;
}

/**
 * 节点类型样式配置
 */
export const NODE_STYLES: Record<NodeType, NodeStyleConfig> = {
  combat: {
    fill: '#3B82F6',
    stroke: '#1D4ED8',
    glow: 'rgba(59, 130, 246, 0.5)',
    hoverGlow: 'rgba(59, 130, 246, 0.8)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 40
  },
  elite: {
    fill: '#A855F7',
    stroke: '#7C3AED',
    glow: 'rgba(168, 85, 247, 0.5)',
    hoverGlow: 'rgba(168, 85, 247, 0.8)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 44
  },
  boss: {
    fill: '#EF4444',
    stroke: '#DC2626',
    glow: 'rgba(239, 68, 68, 0.6)',
    hoverGlow: 'rgba(239, 68, 68, 0.9)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 56
  },
  reward: {
    fill: '#F59E0B',
    stroke: '#D97706',
    glow: 'rgba(245, 158, 11, 0.5)',
    hoverGlow: 'rgba(245, 158, 11, 0.8)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 40,
    borderRadius: 6
  },
  shop: {
    fill: '#10B981',
    stroke: '#059669',
    glow: 'rgba(16, 185, 129, 0.5)',
    hoverGlow: 'rgba(16, 185, 129, 0.8)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 40,
    borderRadius: 4
  },
  event: {
    fill: '#6366F1',
    stroke: '#4F46E5',
    glow: 'rgba(99, 102, 241, 0.5)',
    hoverGlow: 'rgba(99, 102, 241, 0.8)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 40
  },
  rest: {
    fill: '#F97316',
    stroke: '#EA580C',
    glow: 'rgba(249, 115, 22, 0.5)',
    hoverGlow: 'rgba(249, 115, 22, 0.8)',
    completedFill: '#6B7280',
    completedStroke: '#4B5563',
    iconColor: '#FFFFFF',
    size: 40
  }
};

// ============================================
// 动画配置
// ============================================

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 动画持续时间（秒） */
  duration: number;
  /** 缓动函数 */
  ease: string;
  /** 延迟（秒） */
  delay?: number;
  /** 重复次数 */
  repeat?: number;
  /** 是否反向播放 */
  repeatType?: 'loop' | 'reverse' | 'mirror';
}

/**
 * 大地图动画配置
 */
export const TOWER_MAP_ANIMATIONS = {
  // 节点进入动画
  nodeEnter: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } // 弹性效果
  },
  // 节点完成动画
  nodeComplete: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.3, 1],
      filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
    },
    transition: { duration: 0.6, ease: 'easeInOut' }
  },
  // 幕切换动画
  actTransition: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.5, ease: 'easeInOut' }
  },
  // 路径高亮动画
  pathHighlight: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 0.8, ease: 'easeInOut' }
  },
  // 玩家移动动画
  playerMove: {
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  },
  // 脉冲动画（用于可进入节点）
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 1, 0.6]
    },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
  },
  // 旋转动画（用于当前位置指示器）
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 8, repeat: Infinity, ease: 'linear' }
  },
  // 浮动动画（用于Boss节点）
  float: {
    animate: {
      y: [0, -8, 0]
    },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  },
  // 闪烁动画（用于警告）
  flash: {
    animate: {
      opacity: [1, 0.3, 1]
    },
    transition: { duration: 0.5, repeat: 3, ease: 'easeInOut' }
  },
  // 进度条动画
  progressBar: {
    initial: { width: 0 },
    animate: { width: '100%' },
    transition: { duration: 0.8, ease: 'easeOut' }
  },
  // 淡入动画
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  // 滑入动画
  slideIn: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  // 缩放弹出动画
  scalePop: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  // 悬停效果
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 }
  },
  // 点击效果
  tap: {
    scale: 0.95
  }
} as const;

// ============================================
// 响应式断点
// ============================================

/**
 * 响应式断点配置
 */
export const BREAKPOINTS = {
  /** 移动端 */
  mobile: 640,
  /** 平板 */
  tablet: 768,
  /** 小桌面 */
  desktop: 1024,
  /** 大桌面 */
  large: 1280,
  /** 超大屏 */
  xl: 1536
} as const;

/**
 * 响应式缩放配置
 */
export const RESPONSIVE_SCALE = {
  mobile: 0.6,
  tablet: 0.8,
  desktop: 1,
  large: 1.1,
  xl: 1.2
} as const;

/**
 * 地图布局配置
 */
export const MAP_LAYOUT = {
  // 节点尺寸
  nodeSize: 40,
  nodeRadius: 20,
  // 层间距
  floorHeight: 100,
  // 节点水平间距
  nodeSpacing: 80,
  // 最小缩放
  minScale: 0.5,
  // 最大缩放
  maxScale: 2,
  // 默认缩放
  defaultScale: 1,
  // 缩放步进
  scaleStep: 0.1,
  // 画布宽度
  canvasWidth: 800,
  // 画布内边距
  padding: 40
} as const;

// ============================================
// 辅助函数
// ============================================

/**
 * 获取幕主题配置
 */
export const getActTheme = (theme: ActTheme): ActThemeConfig => {
  return ACT_THEMES[theme] || ACT_THEMES.cyber;
};

/**
 * 获取节点样式配置
 */
export const getNodeStyle = (type: NodeType): NodeStyleConfig => {
  return NODE_STYLES[type] || NODE_STYLES.combat;
};

/**
 * 获取响应式缩放比例
 */
export const getResponsiveScale = (width: number): number => {
  if (width < BREAKPOINTS.mobile) return RESPONSIVE_SCALE.mobile;
  if (width < BREAKPOINTS.tablet) return RESPONSIVE_SCALE.tablet;
  if (width < BREAKPOINTS.desktop) return RESPONSIVE_SCALE.desktop;
  if (width < BREAKPOINTS.large) return RESPONSIVE_SCALE.large;
  return RESPONSIVE_SCALE.xl;
};

/**
 * 创建节点发光样式
 */
export const createNodeGlow = (color: string, intensity: number = 1): string => {
  return `0 0 ${10 * intensity}px ${color}, 0 0 ${20 * intensity}px ${color}40`;
};

/**
 * 创建路径发光样式
 */
export const createPathGlow = (color: string): string => {
  return `drop-shadow(0 0 4px ${color})`;
};

// ============================================
// 导出默认配置
// ============================================

export default {
  ACT_THEMES,
  NODE_STYLES,
  TOWER_MAP_ANIMATIONS,
  BREAKPOINTS,
  RESPONSIVE_SCALE,
  MAP_LAYOUT,
  getActTheme,
  getNodeStyle,
  getResponsiveScale,
  createNodeGlow,
  createPathGlow
};
