import React, { useMemo } from 'react';

/**
 * 云朵数据接口
 */
interface Cloud {
  id: number;
  x: number;       // 初始位置 % 0-100
  y: number;       // 垂直位置 % 0-100
  size: number;    // 宽度 px, 200-500
  opacity: number; // 0.05-0.15
  duration: number; // 动画周期 秒
  delay: number;     // 初始延迟 秒 (负值=已开始)
}

/**
 * CloudLayer 组件 Props 接口
 */
export interface CloudLayerProps {
  cloudCount?: number;      // 默认 8
  speed?: 'slow' | 'medium' | 'fast';
}

/**
 * 云层漂移背景效果组件
 *
 * @description 创建柔和的云朵漂浮动画效果，适用于游戏背景或装饰性场景
 * @param props - CloudLayerProps 配置项
 * @returns React 函数式组件
 */
export function CloudLayer({ cloudCount = 8, speed = 'medium' }: CloudLayerProps) {
  /**
   * 根据速度设置获取速度倍数
   */
  const speedMultiplier = useMemo(() => {
    switch (speed) {
      case 'slow':
        return 1.5;
      case 'fast':
        return 0.7;
      case 'medium':
      default:
        return 1;
    }
  }, [speed]);

  /**
   * 生成云朵数据数组
   * 使用 useMemo 缓存计算结果，避免不必要的重新计算
   */
  const clouds = useMemo<Cloud[]>(() => {
    const result: Cloud[] = [];

    for (let i = 0; i < cloudCount; i++) {
      result.push({
        id: i,
        x: Math.random() * 100,                    // 初始水平位置 0-100%
        y: Math.random() * 100,                    // 垂直位置 0-100%
        size: Math.random() * 300 + 200,           // 宽度 200~500px
        opacity: Math.random() * 0.1 + 0.05,       // 不透明度 5%~15%
        duration: (Math.random() * 20 + 30) * speedMultiplier, // 动画周期 30~50s * 倍数
        delay: Math.random() * -30,                // 延迟 -30~0秒（负值让动画已开始）
      });
    }

    return result;
  }, [cloudCount, speedMultiplier]);

  return (
    <>
      {/* CSS 关键帧动画定义 */}
      <style>
        {`
          @keyframes cloudDrift {
            0% {
              transform: translateX(-100px);
            }
            100% {
              transform: translateX(calc(100vw + 100px));
            }
          }

          @keyframes cloudPulse {
            0%, 100% {
              opacity: 0.8;
            }
            50% {
              opacity: 1.2;
            }
          }
        `}
      </style>

      {/* 云层容器 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {/* 渲染每朵云 */}
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            style={{
              position: 'absolute',
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.6}px`,
              background: `radial-gradient(ellipse at center, rgba(255,255,255,${cloud.opacity}) 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(20px)',
              animation: `cloudDrift ${cloud.duration}s linear ${cloud.delay}s infinite, cloudPulse 8s ease-in-out ${cloud.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default CloudLayer;
