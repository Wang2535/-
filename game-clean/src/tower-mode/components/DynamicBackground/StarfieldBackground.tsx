import React, { useMemo } from 'react';

/**
 * 星星数据接口
 */
interface Star {
  id: number;
  x: number;          // 百分比位置 0-100
  y: number;
  size: number;       // px, 0.5-3
  opacity: number;    // 0.3-0.8
  color?: string;     // 少数星星有颜色
  twinkleDelay: number; // 秒, 0-5
}

/**
 * StarfieldBackground 组件属性
 */
export interface StarfieldBackgroundProps {
  starCount?: number;      // 基准数量 150
  density?: 'low' | 'medium' | 'high';
  brightness?: number;     // 0-1, 默认 0.8
}

/**
 * 星空背景效果组件
 *
 * 渲染动态闪烁的星星背景，支持密度和亮度调节。
 */
export function StarfieldBackground({
  starCount = 150,
  density = 'medium',
  brightness = 0.8,
}: StarfieldBackgroundProps) {
  // 根据密度计算实际星星数量
  const actualStarCount = useMemo(() => {
    const multiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
    };
    return Math.floor(starCount * (multiplier[density] ?? 1.0));
  }, [starCount, density]);

  // 生成星星数据
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: actualStarCount }, (_, i) => {
      // ~20% 概率分配彩色
      const hasColor = Math.random() < 0.2;
      let color: string | undefined;
      if (hasColor) {
        color = Math.random() < 0.5 ? '#a8d8ff' : '#fffacd';
      }

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,       // 0.5~3px
        opacity: Math.random() * 0.5 + 0.3,     // 0.3~0.8
        color,
        twinkleDelay: Math.random() * 5,         // 0~5秒延迟
      };
    });
  }, [actualStarCount]);

  return (
    <div style={containerStyle}>
      {/* 注入闪烁动画关键帧 */}
      <style>{twinkleKeyframes}</style>

      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: star.color || '#ffffff',
            boxShadow: `0 0 ${star.size * 2}px ${star.color || '#ffffff'}`,
            opacity: star.opacity * brightness,
            animation: `twinkle 3s ease-in-out ${star.twinkleDelay}s infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ==================== 样式常量 ====================

/** 容器样式 */
const containerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
};

/** 闪烁动画关键帧 */
const twinkleKeyframes = `
@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
`;
