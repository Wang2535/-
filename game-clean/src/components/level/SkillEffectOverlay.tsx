/**
 * 技能特效覆盖层组件
 * 
 * 功能：
 * 1. 当技能触发时显示金色光辉效果
 * 2. 特效持续3秒，从初始亮度逐渐减弱直至消失
 * 3. 特效严格限定在触发技能的界面内
 */

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SkillEffect {
  id: string;
  skillId: string;
  skillName: string;
  targetElement: string;
  startTime: number;
  duration: number;
}

interface SkillEffectOverlayProps {
  effects: SkillEffect[];
  onEffectComplete?: (effectId: string) => void;
}

export function SkillEffectOverlay({ effects, onEffectComplete }: SkillEffectOverlayProps) {
  const [activeEffects, setActiveEffects] = useState<SkillEffect[]>([]);

  useEffect(() => {
    setActiveEffects(effects);
  }, [effects]);

  useEffect(() => {
    if (activeEffects.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const completedEffects: string[] = [];
      
      setActiveEffects(prev => {
        const remaining = prev.filter(effect => {
          const elapsed = now - effect.startTime;
          if (elapsed >= effect.duration) {
            completedEffects.push(effect.id);
            return false;
          }
          return true;
        });
        return remaining;
      });

      completedEffects.forEach(id => {
        onEffectComplete?.(id);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeEffects.length, onEffectComplete]);

  if (activeEffects.length === 0) return null;

  return (
    <>
      {activeEffects.map(effect => (
        <SkillGlowEffect key={effect.id} effect={effect} />
      ))}
    </>
  );
}

interface SkillGlowEffectProps {
  effect: SkillEffect;
}

function SkillGlowEffect({ effect }: SkillGlowEffectProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = effect.startTime;
    const duration = effect.duration;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min(1, elapsed / duration);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [effect.startTime, effect.duration]);

  // 计算透明度：从1逐渐减弱到0
  const opacity = 1 - progress;
  // 计算缩放：从1.2逐渐缩小到1
  const scale = 1.2 - (progress * 0.2);
  // 计算亮度：从100%逐渐减弱到0%
  const brightness = 100 - (progress * 100);

  return (
    <div
      className={cn(
        "fixed pointer-events-none z-50",
        "flex items-center justify-center"
      )}
      style={{
        left: `var(--skill-effect-${effect.targetElement}-x, 50%)`,
        top: `var(--skill-effect-${effect.targetElement}-y, 50%)`,
        width: `var(--skill-effect-${effect.targetElement}-width, 100px)`,
        height: `var(--skill-effect-${effect.targetElement}-height, 40px)`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: opacity,
      }}
    >
      {/* 金色光辉效果 */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              rgba(255, 215, 0, ${opacity * 0.8}) 0%,
              rgba(255, 215, 0, ${opacity * 0.4}) 30%,
              rgba(255, 215, 0, ${opacity * 0.1}) 60%,
              transparent 100%
            )
          `,
          filter: `blur(${4 + progress * 4}px) brightness(${brightness}%)`,
          boxShadow: `
            0 0 ${20 * opacity}px rgba(255, 215, 0, ${opacity * 0.8}),
            0 0 ${40 * opacity}px rgba(255, 215, 0, ${opacity * 0.4}),
            0 0 ${60 * opacity}px rgba(255, 215, 0, ${opacity * 0.2}),
            inset 0 0 ${20 * opacity}px rgba(255, 215, 0, ${opacity * 0.3})
          `,
        }}
      />
      
      {/* 内部高光 */}
      <div
        className="absolute inset-2 rounded-md"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, ${opacity * 0.9}) 0%,
              rgba(255, 215, 0, ${opacity * 0.6}) 50%,
              rgba(255, 215, 0, ${opacity * 0.3}) 100%
            )
          `,
          filter: `blur(${2 + progress * 2}px)`,
        }}
      />

      {/* 技能名称显示 */}
      <span
        className="relative z-10 text-xs font-bold whitespace-nowrap"
        style={{
          color: `rgba(255, 215, 0, ${opacity})`,
          textShadow: `
            0 0 ${10 * opacity}px rgba(255, 215, 0, ${opacity}),
            0 0 ${20 * opacity}px rgba(255, 215, 0, ${opacity * 0.8})
          `,
        }}
      >
        {effect.skillName}
      </span>
    </div>
  );
}

// 技能特效管理Hook
export function useSkillEffects() {
  const [effects, setEffects] = useState<SkillEffect[]>([]);

  const triggerSkillEffect = useCallback((
    skillId: string,
    skillName: string,
    targetElement: string,
    duration: number = 3000
  ) => {
    const newEffect: SkillEffect = {
      id: `${skillId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      skillId,
      skillName,
      targetElement,
      startTime: Date.now(),
      duration,
    };

    setEffects(prev => [...prev, newEffect]);
    return newEffect.id;
  }, []);

  const removeSkillEffect = useCallback((effectId: string) => {
    setEffects(prev => prev.filter(e => e.id !== effectId));
  }, []);

  const clearAllEffects = useCallback(() => {
    setEffects([]);
  }, []);

  return {
    effects,
    triggerSkillEffect,
    removeSkillEffect,
    clearAllEffects,
  };
}

// 更新目标元素位置的辅助函数
export function updateSkillEffectPosition(
  elementId: string,
  rect: DOMRect
) {
  const root = document.documentElement;
  root.style.setProperty(`--skill-effect-${elementId}-x`, `${rect.left + rect.width / 2}px`);
  root.style.setProperty(`--skill-effect-${elementId}-y`, `${rect.top + rect.height / 2}px`);
  root.style.setProperty(`--skill-effect-${elementId}-width`, `${rect.width}px`);
  root.style.setProperty(`--skill-effect-${elementId}-height`, `${rect.height}px`);
}

export default SkillEffectOverlay;
