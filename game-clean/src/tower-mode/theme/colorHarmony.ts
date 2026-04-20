/**
 * 9层地图色彩和谐系统
 * 为每一层塔楼地图定义独立的色彩主题，确保视觉层次分明、色彩和谐统一
 */

export interface LayerColorTheme {
  /** 主题色 - 该层的核心视觉标识色 */
  primary: string;
  /** 次要色 - 用于辅助元素和次要交互 */
  secondary: string;
  /** 背景色 - 层的基础背景 */
  background: string;
  /** CSS渐变背景 - 用于营造空间深度感 */
  backgroundGradient: string;
  /** 强调色 - 用于高亮、焦点等需要吸引注意力的元素 */
  accent: string;
  /** 危险色 - Boss区域、危险区域的视觉提示 */
  danger: string;
  /** 成功色 - 到达终点、完成目标时的正向反馈色 */
  success: string;
  /** 文字色 - 主要文字颜色 */
  text: string;
  /** 次要文字色 - 辅助说明、次要信息的文字颜色 */
  textSecondary: string;
}

export const LAYER_COLOR_THEMES: Record<number, LayerColorTheme> = {
  1: {
    primary: '#ff8800',
    secondary: '#cc6600',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #1a0a0a 100%)',
    accent: '#ffaa44',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  2: {
    primary: '#4488ff',
    secondary: '#2266dd',
    background: '#0a0a2e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a2e 0%, #0a1a2e 100%)',
    accent: '#00ffff',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  3: {
    primary: '#ffd700',
    secondary: '#ccaa00',
    background: '#0a0a14',
    backgroundGradient: 'linear-gradient(180deg, #0a0a14 0%, #1a140a 100%)',
    accent: '#ffee44',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  4: {
    primary: '#ff6b9d',
    secondary: '#dd4488',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #1a0a14 100%)',
    accent: '#ff88bb',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  5: {
    primary: '#50c878',
    secondary: '#38a85e',
    background: '#0a1a0a',
    backgroundGradient: 'linear-gradient(180deg, #0a1a0a 0%, #0a1a0a 100%)',
    accent: '#7fff7f',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  6: {
    primary: '#f7931e',
    secondary: '#d4761a',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #1a0a0a 100%)',
    accent: '#ffff00',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  7: {
    primary: '#9b59b6',
    secondary: '#7d3c98',
    background: '#0a0a1e',
    backgroundGradient: 'linear-gradient(180deg, #0a0a1e 0%, #140a1e 100%)',
    accent: '#d4a5e8',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  8: {
    primary: '#00d4ff',
    secondary: '#0097a7',
    background: '#0a0a14',
    backgroundGradient: 'linear-gradient(180deg, #0a0a14 0%, #0a0a2e 100%)',
    accent: '#00ffff',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
  9: {
    primary: '#ffd700',
    secondary: '#ccaa00',
    background: '#0a0a0a',
    backgroundGradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a00 100%)',
    accent: '#ffffff',
    danger: '#ff4444',
    success: '#44ff88',
    text: '#ffffff',
    textSecondary: '#aaaacc',
  },
};

/**
 * 根据层数获取对应的色彩主题
 * @param layerNumber 塔楼层数 (1-9)
 * @returns 对应层的色彩主题配置，若层数无效则回退到第1层主题
 */
export function getLayerTheme(layerNumber: number): LayerColorTheme {
  return LAYER_COLOR_THEMES[layerNumber] ?? LAYER_COLOR_THEMES[1];
}
