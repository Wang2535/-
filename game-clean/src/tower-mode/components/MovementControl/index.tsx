import React, { useState, useCallback, useEffect } from 'react';
import type { DiceRollResult, MoveOption } from '../../types';
import { Dice3D } from '../Dice3D/Dice3D';

interface MovementControlProps {
  diceResult: DiceRollResult | null;
  moveOptions: MoveOption[];
  onRollDice: () => DiceRollResult | undefined;
  onMove: (cellId: string) => void;
  disabled: boolean;
  isMoving: boolean;
}

export function MovementControl({
  diceResult,
  moveOptions,
  onRollDice,
  onMove,
  disabled,
  isMoving,
}: MovementControlProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayResult, setDisplayResult] = useState<DiceRollResult | null>(null);

  const handleRollClick = useCallback(() => {
    if (disabled || isMoving || isRolling) return;
    setIsRolling(true);
    const result = onRollDice();
    if (result) {
      setDisplayResult(result);
    }
  }, [onRollDice, disabled, isMoving, isRolling]);

  const handleRollComplete = useCallback(() => {
    setIsRolling(false);
  }, []);

  useEffect(() => {
    if (diceResult) {
      setDisplayResult(diceResult);
    }
  }, [diceResult]);

  const adaptedResult = displayResult ? {
    rawValue: displayResult.rawValue,
    modifiedValue: displayResult.modifiedValue,
    modifiers: displayResult.modifiers.map(m => ({
      type: m.source,
      source: m.description,
      delta: m.delta
    }))
  } : null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      background: 'rgba(10, 10, 40, 0.9)',
      borderTop: '1px solid #333366',
      flexShrink: 0,
      gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
        <button
          onClick={handleRollClick}
          disabled={disabled || isMoving || isRolling}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: disabled || isMoving || isRolling
              ? 'rgba(60, 60, 80, 0.5)'
              : 'linear-gradient(135deg, #4466aa 0%, #2244aa 100%)',
            border: disabled || isMoving || isRolling
              ? '1px solid #444466'
              : '2px solid #6688cc',
            color: disabled || isMoving || isRolling ? '#666688' : '#ffffff',
            fontSize: '1.8rem',
            cursor: disabled || isMoving || isRolling ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🎲
        </button>

        <Dice3D 
          isRolling={isRolling} 
          result={adaptedResult}
          onRollComplete={handleRollComplete}
          disabled={disabled || isMoving}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        flex: 1,
        padding: '0.2rem 0',
      }}>
        {moveOptions.length > 0 ? (
          moveOptions.map((option) => (
            <button
              key={option.targetCell.id}
              onClick={() => onMove(option.targetCell.id)}
              disabled={disabled || isMoving}
              style={{
                padding: '0.4rem 0.8rem',
                background: isMoving
                  ? 'rgba(60, 60, 80, 0.5)'
                  : 'rgba(80, 80, 150, 0.4)',
                border: '1px solid #5555aa',
                borderRadius: '6px',
                color: '#ccccee',
                cursor: disabled || isMoving ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              → {option.targetCell.id.slice(-4)}
              {option.recommended && ' ⭐'}
            </button>
          ))
        ) : (
          <span style={{ color: '#666688', fontSize: '0.85rem', alignSelf: 'center' }}>
            投掷骰子以查看可移动位置
          </span>
        )}
      </div>

      {isMoving && (
        <div style={{
          color: '#ffaa44',
          fontSize: '0.85rem',
          animation: 'pulse 1s infinite',
        }}>
          移动中...
        </div>
      )}
    </div>
  );
}
