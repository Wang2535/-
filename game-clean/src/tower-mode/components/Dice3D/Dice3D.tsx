import { useState, useEffect, useCallback, useRef } from 'react';
import type { DiceRollResult } from '../../types/movement.types';
import './dice3d.css';

interface Dice3DProps {
  isRolling: boolean;
  result: DiceRollResult | null;
  onRollComplete?: () => void;
  theme?: { accentColor?: string; bgPrimary?: string };
  disabled?: boolean;
}

const DICE_FACES = [
  { value: 1, dots: [[50,50]] },
  { value: 2, dots: [[25,25],[75,75]] },
  { value: 3, dots: [[25,25],[50,50],[75,75]] },
  { value: 4, dots: [[25,25],[75,25],[25,75],[75,75]] },
  { value: 5, dots: [[25,25],[75,25],[50,50],[25,75],[75,75]] },
  { value: 6, dots: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]] },
];

// 每个面朝上时的旋转角度
const FACE_ROTATIONS: Record<number, { rotateX: number; rotateY: number; rotateZ: number }> = {
  1: { rotateX: 0, rotateY: 0, rotateZ: 0 },
  2: { rotateX: 0, rotateY: 90, rotateZ: 0 },
  3: { rotateX: -90, rotateY: 0, rotateZ: 0 },
  4: { rotateX: 90, rotateY: 0, rotateZ: 0 },
  5: { rotateX: 0, rotateY: -90, rotateZ: 0 },
  6: { rotateX: 0, rotateY: 180, rotateZ: 0 },
};

export function Dice3D({ isRolling, result, onRollComplete, theme, disabled }: Dice3DProps) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [rollPhase, setRollPhase] = useState<'idle' | 'preparing' | 'rolling' | 'result'>('idle');
  const [showModifiers, setShowModifiers] = useState(false);
  const timerRef = useRef<number | null>(null);

  const skinColor = theme?.accentColor ?? '#4488ff';
  const faceBg = theme?.bgPrimary ?? '#1a1a3e';

  const getCubeTransform = useCallback(() => {
    if (rollPhase === 'result' && displayValue !== null) {
      const rotation = FACE_ROTATIONS[displayValue] || FACE_ROTATIONS[1];
      return `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg) rotateZ(${rotation.rotateZ}deg)`;
    }
    return '';
  }, [rollPhase, displayValue]);

  useEffect(() => {
    if (isRolling && rollPhase === 'idle') {
      setRollPhase('preparing');
      timerRef.current = window.setTimeout(() => {
        setRollPhase('rolling');
        timerRef.current = window.setTimeout(() => {
          if (result) {
            setDisplayValue(result.modifiedValue ?? result.rawValue);
            setRollPhase('result');
            setShowModifiers(true);
            onRollComplete?.();
          }
        }, 1200);
      }, 500);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRolling, result]);

  const resetDice = useCallback(() => {
    setDisplayValue(null);
    setRollPhase('idle');
    setShowModifiers(false);
  }, []);

  if (rollPhase === 'idle' && !disabled) return null;

  const isCritSuccess = result && result.modifiedValue >= 6 && result.modifiers.some(m => m.delta > 0);
  const isCritFail = result && result.modifiedValue <= 1 && result.modifiers.some(m => m.delta < 0);

  return (
    <div className={`dice3d-container ${rollPhase} ${isCritSuccess ? 'crit-success' : ''} ${isCritFail ? 'crit-fail' : ''}`}
         style={{ '--dice-skin': skinColor, '--dice-face-bg': faceBg } as React.CSSProperties}>
      <div 
        className={`dice3d-cube ${rollPhase === 'rolling' ? 'rolling' : ''}`}
        style={{ transform: getCubeTransform(), transition: rollPhase === 'result' ? 'transform 0.3s ease-out' : undefined }}
      >
        {DICE_FACES.map(face => (
          <div key={face.value} className={`dice3d-face face-${face.value}`}>
            {face.dots.map((dot, i) => (
              <div key={i} className="dice-dot" style={{ left: `${dot[0]}%`, top: `${dot[1]}%` }} />
            ))}
          </div>
        ))}
      </div>

      {rollPhase === 'result' && displayValue !== null && (
        <div className="dice3d-result">
          <span className="result-value">{displayValue}</span>
          {showModifiers && result?.modifiers && result.modifiers.length > 0 && (
            <div className="dice-modifiers">
              <span className="mod-base">基础: {result.rawValue}</span>
              {result.modifiers.map((mod, i) => (
                <span key={i} className={`mod-item ${mod.delta >= 0 ? 'positive' : 'negative'}`}>
                  {mod.source}: {mod.delta >= 0 ? '+' : ''}{mod.delta}
                </span>
              ))}
              <span className="mod-final">= {result.modifiedValue}</span>
            </div>
          )}
          {isCritSuccess && <span className="crit-tag success">★ 大成功！</span>}
          {isCritFail && <span className="crit-tag fail">✗ 大失败...</span>}
        </div>
      )}

      {isCritSuccess && rollPhase === 'result' && (
        <div className="crit-success-effect">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="crit-particle"
                 style={{ '--angle': `${i * 30}deg`, '--delay': `${i * 0.05}s` } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
