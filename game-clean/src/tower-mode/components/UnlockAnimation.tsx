import React, { useEffect, useState } from 'react';

interface UnlockAnimationProps {
  fromLayer: number;
  toLayer: number;
  onComplete?: () => void;
}

export const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ fromLayer, toLayer, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    const frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [onComplete]);

  const textOpacity = progress > 0.5 ? (progress - 0.5) * 2 : 0;
  const scale = 0.5 + progress * 0.5;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: `${progress * 100}%`,
        height: `${progress * 100}%`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute',
        textAlign: 'center',
        color: '#FFD700',
        fontSize: '2rem',
        fontWeight: 'bold',
        opacity: textOpacity,
        transform: `scale(${scale})`,
      }}>
        <div>🔓 第 {toLayer} 层已解锁！</div>
        <div style={{ fontSize: '1rem', marginTop: '10px', color: '#aaa' }}>
          完成第 {fromLayer} 层后解锁
        </div>
      </div>
    </div>
  );
};
