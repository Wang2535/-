import { useState, useEffect, useRef, useCallback } from 'react';
import './styles.css';

interface DiceRollAnimationProps {
  faces?: number;
  result?: number;
  isRolling: boolean;
  modifier?: number;
  onComplete?: (result: number, finalValue: number) => void;
}

type Phase = 'idle' | 'spinning' | 'slowing' | 'revealed';

interface Rotation {
  x: number;
  y: number;
  z: number;
}

// 骰子各面的旋转角度映射
const faceRotations: Record<number, Rotation> = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: -90, y: 0, z: 0 },
  3: { x: 0, y: -90, z: 0 },
  4: { x: 0, y: 90, z: 0 },
  5: { x: 90, y: 0, z: 0 },
  6: { x: 180, y: 0, z: 0 },
};

// easeOutCubic 缓动函数
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

// 随机生成1-6的数字
const randomDiceFace = (faces: number): number => {
  return Math.floor(Math.random() * faces) + 1;
};

// 生成随机旋转角度（用于旋转动画）
const randomRotation = (): Rotation => {
  return {
    x: Math.floor(Math.random() * 360),
    y: Math.floor(Math.random() * 360),
    z: Math.floor(Math.random() * 45 - 22.5), // 轻微z轴旋转增加动态感
  };
};

export function DiceRollAnimation({
  faces = 6,
  result,
  isRolling,
  modifier = 0,
  onComplete,
}: DiceRollAnimationProps) {
  const [displayValue, setDisplayValue] = useState<number>(1);
  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0, z: 0 });
  const [phase, setPhase] = useState<Phase>('idle');
  
  const spinningTimerRef = useRef<number | null>(null);
  const slowingTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const spinCountRef = useRef<number>(0);
  const rotationRef = useRef<Rotation>({ x: 0, y: 0, z: 0 });

  // 更新 rotation 时同步更新 ref
  const setRotationSync = (newRotation: Rotation) => {
    rotationRef.current = newRotation;
    setRotation(newRotation);
  };

  // 清理所有定时器
  const clearAllTimers = useCallback(() => {
    if (spinningTimerRef.current) {
      clearInterval(spinningTimerRef.current);
      spinningTimerRef.current = null;
    }
    if (slowingTimerRef.current) {
      clearTimeout(slowingTimerRef.current);
      slowingTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // 减速动画
  const startSlowingAnimation = useCallback((targetValue: number) => {
    const targetRotation = faceRotations[targetValue] || faceRotations[1];
    const duration = 600; // 600ms减速
    const startTime = Date.now();
    const startRotation = { ...rotationRef.current };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      // 计算当前旋转角度（从当前角度插值到目标角度）
      // 添加多圈旋转效果（2-3圈）
      const extraRotations = 2 + Math.floor(Math.random() * 2);
      const currentX = startRotation.x + (targetRotation.x - startRotation.x + 360 * extraRotations) * easedProgress;
      const currentY = startRotation.y + (targetRotation.y - startRotation.y + 360 * extraRotations) * easedProgress;
      const currentZ = startRotation.z + (targetRotation.z - startRotation.z) * easedProgress;

      setRotationSync({ x: currentX, y: currentY, z: currentZ });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成
        setDisplayValue(targetValue);
        setPhase('revealed');
        
        const finalValue = targetValue + modifier;
        onComplete?.(targetValue, finalValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [modifier, onComplete]);

  // 监听 isRolling 变化
  useEffect(() => {
    if (isRolling && phase === 'idle') {
      // 开始掷骰动画
      setPhase('spinning');
      spinCountRef.current = 0;

      // spinning阶段：每50ms随机显示骰子面和旋转
      spinningTimerRef.current = window.setInterval(() => {
        spinCountRef.current += 1;
        const randomFace = randomDiceFace(faces);
        setDisplayValue(randomFace);
        setRotationSync(randomRotation());
      }, 50);

      // 800ms后进入减速阶段（800ms / 50ms = 16次）
      slowingTimerRef.current = window.setTimeout(() => {
        clearAllTimers();
        
        // 使用传入的结果，如果没有则随机生成
        const targetValue = result ?? randomDiceFace(faces);
        setPhase('slowing');
        startSlowingAnimation(targetValue);
      }, 800);
    }

    // 组件卸载或依赖变化时清理
    return () => {
      clearAllTimers();
    };
  }, [isRolling, result, faces, phase, clearAllTimers, startSlowingAnimation]);

  // 重置动画状态（当isRolling变为false时）
  useEffect(() => {
    if (!isRolling && phase !== 'idle') {
      // 等待动画完成后重置
      const resetTimer = window.setTimeout(() => {
        setPhase('idle');
        setRotation({ x: 0, y: 0, z: 0 });
      }, 500);
      return () => clearTimeout(resetTimer);
    }
  }, [isRolling, phase]);

  // 计算最终值
  const finalValue = displayValue + modifier;

  return (
    <div className="dice-roll-animation">
      <div className="dice-container">
        <div
          className="dice-cube"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            transition: phase === 'spinning' ? 'none' : 'transform 0.05s ease-out',
          }}
        >
          {/* 骰子的6个面 */}
          {[1, 2, 3, 4, 5, 6].map((face) => (
            <div
              key={face}
              className={`dice-face face-${face}`}
              style={{
                opacity: displayValue === face ? 1 : 0,
              }}
            >
              <span className="dice-face-value">{face}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 结果显示 */}
      {phase === 'revealed' && (
        <div className="dice-result">
          <span className="dice-result-value">{displayValue}</span>
          {modifier !== 0 && (
            <>
              <span className={`dice-modifier ${modifier > 0 ? 'positive' : 'negative'}`}>
                {modifier > 0 ? '+' : ''}{modifier}
              </span>
              <span className="dice-final">= {finalValue}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
